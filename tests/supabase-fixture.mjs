// Local test adapter: real PostgreSQL (PGlite), an in-memory Storage stand-in,
// and the subset of PostgREST used by this app. Never connects to Supabase.
import { PGlite } from '@electric-sql/pglite';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';

export async function startFixture() {
  const db=new PGlite();
  await db.exec('create role anon;create role authenticated;create role service_role bypassrls;create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);');
  await db.exec(await Promise.all(['202609080001_catalog.sql','202609080002_hero_products.sql','202609080003_connections.sql','202609090001_connection_featured.sql','202609090002_connection_links.sql','202609090003_connection_link_labels.sql'].map(file=>readFile(`supabase/migrations/${file}`,'utf8'))).then(parts=>parts.join('\n')));
  const admin=randomUUID(),key=randomUUID(),password=randomUUID();
  await db.query("insert into users(id,name,email,password_hash,role) values($1,'Admin local','admin@example.test',$2,'ADMIN')",[admin,await bcrypt.hash(password,12)]);
  const files=new Map();
  const tables=new Set(['users','categories','products','product_images','admin_sessions','admin_login_attempts','connections','connection_assets']);
  const server=createServer(async(req,res)=>{
    const url=new URL(req.url,'http://localhost');
    const send=(status,data,headers={})=>{res.writeHead(status,{'content-type':'application/json',...headers});res.end(req.method==='HEAD'?undefined:JSON.stringify(data));};
    try {
      const bucket=url.pathname.includes('connection-images')?'connection-images':'product-images';
      const publicPrefix=`/storage/v1/object/public/${bucket}/`;
      if(url.pathname.startsWith(publicPrefix)) {
        const file=files.get(decodeURIComponent(url.pathname.slice(publicPrefix.length)));
        if(!file)return send(404,{message:'Missing image'});
        res.writeHead(200,{'content-type':'image/webp'});return res.end(file);
      }
      if(req.headers.apikey!==key)return send(401,{message:'Wrong test key'});
      const chunks=[];for await(const chunk of req)chunks.push(chunk);
      const bytes=Buffer.concat(chunks);
      if(url.pathname.startsWith(`/storage/v1/object/${bucket}/`)&&req.method==='POST') {
        const path=decodeURIComponent(url.pathname.slice(`/storage/v1/object/${bucket}/`.length));
        files.set(path,bytes);return send(200,{Key:`product-images/${path}`,Id:randomUUID()});
      }
      const body=bytes.length?JSON.parse(bytes.toString()):null;
      if(url.pathname===`/storage/v1/object/${bucket}`&&req.method==='DELETE') {for(const path of body.prefixes)files.delete(path);return send(200,[]);}
      if(url.pathname==='/storage/v1/bucket/product-images')return send(200,{id:'product-images',name:'product-images',public:true});
      if(url.pathname.startsWith('/rest/v1/rpc/')) {
        const name=url.pathname.split('/').at(-1);
        let result;
        if(name==='save_catalog_product')result=await db.query('select save_catalog_product($1::jsonb,$2::uuid[],$3::uuid) as value',[JSON.stringify(body.payload),body.image_ids,body.actor_id]);
        else if(name==='save_connection')result=await db.query('select save_connection($1::jsonb,$2::uuid[],$3::uuid) as value',[JSON.stringify(body.payload),body.image_ids,body.actor_id]);
        else if(name==='set_connection_featured')result=await db.query('select set_connection_featured($1,$2,$3,$4) as value',[body.target,body.selected,body.expected,body.actor_id]);
        else if(name==='consume_admin_login_attempt')result=await db.query('select consume_admin_login_attempt($1) as value',[body.attempt_key]);
        else if(name==='catalog_metrics')result=await db.query('select catalog_metrics() as value');
        else return send(404,{code:'PGRST202'});
        return send(200,result.rows[0].value);
      }
      const table=url.pathname.split('/').at(-1);
      if(!tables.has(table))return send(404,{message:'Unknown test table'});
      const params=[],conditions=[];
      const bind=value=>{params.push(value);return `$${params.length}`;};
      const product=table==='products';
      for(const [field,filter] of url.searchParams) {
        if(['select','order','offset','limit'].includes(field))continue;
        if(!/^[a-z_]+(?:\.slug)?$/.test(field))throw new Error('Unexpected filter');
        const column=field==='category.slug'?'c.slug':`${product?'p.':''}${field}`;
        const dot=filter.indexOf('.'),op=filter.slice(0,dot),value=filter.slice(dot+1);
        if(op==='eq')conditions.push(`${column}=${bind(value)}`);
        else if(op==='gt')conditions.push(`${column}>${bind(value)}`);
        else if(op==='gte')conditions.push(`${column}>=${bind(value)}`);
        else if(op==='lte')conditions.push(`${column}<=${bind(value)}`);
        else if(op==='ilike')conditions.push(`${column} ilike ${bind(value)}`);
        else if(op==='in')conditions.push(`${column}=any(${bind(value.slice(1,-1).split(','))}::uuid[])`);
        else throw new Error(`Unexpected filter operation: ${op}`);
      }
      const where=conditions.length?` where ${conditions.join(' and ')}`:'';
      let rows=[],count=0;
      if(req.method==='GET'||req.method==='HEAD') {
        const from=product?'products p join categories c on c.id=p.category_id':table;
        count=Number((await db.query(`select count(*) as total from ${from}${where}`,params)).rows[0].total);
        const columns=product?`p.*,to_char(p.updated_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"') as updated_at,json_build_object('slug',c.slug) as category,coalesce((select json_agg(i) from product_images i where i.product_id=p.id),'[]'::json) as images`:table==='connections'?`connections.*,to_char(updated_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"') as updated_at,to_char(event_date,'YYYY-MM-DD') as event_date,coalesce((select json_agg(i) from connection_assets i where i.connection_id=connections.id),'[]'::json) as images`:'*';
        const order=url.searchParams.get('order');
        const ordering=order?` order by ${order.split(',').map(item=>{const [field,direction]=item.split('.');if(!/^[a-z_]+$/.test(field)||!['asc','desc'].includes(direction))throw new Error('Invalid order');return `${product?'p.':table==='connections'?'connections.':''}${field} ${direction}`;}).join(',')}`:'';
        const limit=Math.min(1000,Number(url.searchParams.get('limit')||1000));
        const offset=Number(url.searchParams.get('offset')||0);
        rows=(await db.query(`select ${columns} from ${from}${where}${ordering} limit ${limit} offset ${offset}`,params)).rows;
      } else if(req.method==='POST') {
        const records=Array.isArray(body)?body:[body];
        for(const record of records){const columns=Object.keys(record);if(columns.some(column=>!/^\w+$/.test(column)))throw new Error('Invalid column');const values=columns.map(column=>record[column]);rows.push(...(await db.query(`insert into ${table}(${columns.join(',')}) values(${columns.map((_,index)=>`$${index+1}`).join(',')}) returning *`,values)).rows);}
      } else if(req.method==='PATCH') {
        const columns=Object.keys(body);if(columns.some(column=>!/^\w+$/.test(column)))throw new Error('Invalid column');
        const updates=columns.map(column=>`${column}=${bind(body[column])}`);
        rows=(await db.query(`update ${table}${product?' p':''} set ${updates.join(',')}${where} returning *`,params)).rows;
      } else if(req.method==='DELETE') rows=(await db.query(`delete from ${table}${where} returning *`,params)).rows;
      else return send(405,{});
      const single=String(req.headers.accept).includes('vnd.pgrst.object+json');
      if(single&&rows.length!==1)return send(406,{code:'PGRST116',details:`The result contains ${rows.length} rows`});
      return send(req.method==='POST'?201:200,single?rows[0]:rows,{'content-range':`0-${Math.max(0,rows.length-1)}/${count}`});
    }catch(error){send(400,{code:error.code||'TEST_FIXTURE',message:error.message});}
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const url=`http://127.0.0.1:${server.address().port}`;
  return {url,key,password,db,files,async close(){server.closeAllConnections();await new Promise(resolve=>server.close(resolve));await db.close();}};
}
