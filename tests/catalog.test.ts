import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
import { productInput } from '../src/lib/product-validation';

test('Hero: independent placement, five slots, editing at capacity and releasing a slot',async()=>{
  const db=new PGlite();
  try {
    await db.exec('create role anon;create role authenticated;create role service_role;create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);');
    for(const file of ['202609080001_catalog.sql','202609080002_hero_products.sql'])await db.exec(await readFile(`supabase/migrations/${file}`,'utf8'));
    const admin=randomUUID();
    await db.query("insert into users(id,name,email,password_hash,role) values($1,'Admin','hero@example.test','test','ADMIN')",[admin]);
    const draft={name:'Produto do hero',category:'tercos',description:'Descrição do produto de teste',price:10,oldPrice:null,stock:1,featured:false,inHero:true,active:false,updatedAt:null as string|null};
    const ids=Array.from({length:6},()=>randomUUID());
    const save=(id:string,changes:Partial<typeof draft>={})=>db.query('select save_catalog_product($1::jsonb,$2::uuid[],$3::uuid)',[JSON.stringify({...draft,id,...changes}),[],admin]);
    for(const id of ids.slice(0,5))await save(id);
    await assert.rejects(save(ids[5]),{code:'P0003'});
    assert.equal((await db.query('select id from products where in_hero and not featured')).rows.length,5);
    const version=async(id:string)=>(await db.query<{value:string}>('select updated_at::text as value from products where id=$1',[id])).rows[0].value;
    await save(ids[0],{featured:true,updatedAt:await version(ids[0])});
    assert.equal((await db.query('select id from products where in_hero and featured')).rows.length,1);
    await assert.rejects(db.query('update products set hero_slot=6 where id=$1',[ids[0]]),{code:'23514'});
    await assert.rejects(db.query('update products set hero_slot=2 where id=$1',[ids[0]]),{code:'23505'});
    await save(ids[0],{inHero:false,featured:true,updatedAt:await version(ids[0])});
    await save(ids[5]);
    assert.equal((await db.query('select id from products where in_hero')).rows.length,5);
    assert.equal((await db.query('select id from products where featured and not in_hero')).rows.length,1);
  } finally { await db.close(); }
});

test('PostgreSQL: migration, CRUD, images, concurrency, rollback and access restrictions',async()=>{
  const db=new PGlite();
  try {
    await db.exec(`create role anon; create role authenticated; create role service_role bypassrls; create schema storage; create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);`);
    const sql=await Promise.all(['202609080001_catalog.sql','202609080002_hero_products.sql'].map(file=>readFile(`supabase/migrations/${file}`,'utf8'))).then(parts=>parts.join('\n'));
    await db.exec(sql);
    // The migration is intentionally safe to run again on an existing store.
    await db.exec(sql);
    const admin=randomUUID(), other=randomUUID(), productId=randomUUID();
    await db.query(`insert into users(id,name,email,password_hash,role) values($1,'Admin','admin@example.test','test','ADMIN'),($2,'Outro','other@example.test','test','ADMIN')`,[admin,other]);
    const imageA=randomUUID(),imageB=randomUUID(),imageOther=randomUUID();
    await db.query(`insert into product_images(id,uploaded_by,storage_path) values($1,$4,'a.webp'),($2,$4,'b.webp'),($3,$5,'other.webp')`,[imageA,imageB,imageOther,admin,other]);
    const draft={id:productId,name:'Terço de teste',category:'tercos',description:'Descrição detalhada do produto',price:59.9,oldPrice:79.9,stock:12,featured:true,active:true,updatedAt:null as string|null};
    async function save(payload:typeof draft,images:string[],actor=admin){return db.query('select save_catalog_product($1::jsonb,$2::uuid[],$3::uuid)',[JSON.stringify(payload),images,actor]);}
    await save(draft,[imageA,imageB]);
    let row=(await db.query<{name:string;price:string;updated_at:Date}>('select name,price,updated_at from products where id=$1',[productId])).rows[0];
    assert.equal(row.name,draft.name);assert.equal(Number(row.price),59.9);
    const version=new Date(row.updated_at).toISOString();
    // PG timestamps can have microseconds: read their exact text for optimistic locking.
    const exactVersion=(await db.query<{value:string}>('select updated_at::text as value from products where id=$1',[productId])).rows[0].value;
    draft.updatedAt=exactVersion;draft.price=64.9;
    await save(draft,[imageB,imageA]);
    assert.deepEqual((await db.query<{id:string}>('select id from product_images where product_id=$1 and active order by position',[productId])).rows.map(row=>row.id),[imageB,imageA]);
    await assert.rejects(save(draft,[imageA]),/changed/);
    draft.updatedAt=(await db.query<{value:string}>('select updated_at::text as value from products where id=$1',[productId])).rows[0].value;
    await assert.rejects(save({...draft,name:'Should roll back'},[imageOther]),/Image missing/);
    row=(await db.query<typeof row>('select name,price,updated_at from products where id=$1',[productId])).rows[0];
    assert.equal(row.name,'Terço de teste');assert.equal(Number(row.price),64.9);
    await assert.rejects(save({...draft,oldPrice:1},[imageA]),/check constraint/);
    await assert.rejects(save(draft,[],other),/need an image/);
    await save({...draft,active:false},[imageA]);
    assert.equal((await db.query('select id from products where active')).rows.length,0);
    assert.equal((await db.query('select id from product_images where product_id=$1 and active',[productId])).rows.length,1);
    assert.equal((await db.query('select count(*)::int as total from categories')).rows[0].total,14);
    for(let index=0;index<8;index++)assert.equal((await db.query<{allowed:boolean}>("select consume_admin_login_attempt('account') as allowed")).rows[0].allowed,true);
    assert.equal((await db.query<{allowed:boolean}>("select consume_admin_login_attempt('account') as allowed")).rows[0].allowed,false);
    await db.exec('set role anon');
    await assert.rejects(db.query('select * from users'),/permission denied/);
    await assert.rejects(db.query('select catalog_metrics()'),/permission denied/);
    await assert.rejects(save(draft,[imageA]),/permission denied/);
    await db.exec('reset role');
    assert.ok(version);
  } finally {await db.close();}
});

test('Product validation rejects invalid price, stock, category, duplicate photos and publishing without photos',()=>{
  const image=randomUUID();
  const input={id:randomUUID(),name:'Produto',category:'tercos',description:'Descrição do produto.',price:20,oldPrice:null,stock:1,featured:false,active:true,imageIds:[image],updatedAt:null};
  assert.equal(productInput.safeParse(input).success,true);
  for(const override of [{price:0},{price:1.234},{stock:1.5},{stock:-1},{category:'unknown'},{oldPrice:10},{imageIds:[]},{imageIds:[image,image]}])assert.equal(productInput.safeParse({...input,...override}).success,false);
  assert.equal(productInput.safeParse({...input,active:false,imageIds:[]}).success,true);
});

test('Migration preserves legacy users, products and their original photos',async()=>{
  const db=new PGlite();
  try {
    await db.exec('create role anon;create role authenticated;create role service_role bypassrls;create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);');
    const legacy=(await readFile('legacy-backend/supabase/schema.sql','utf8')).replace('create extension if not exists "pgcrypto";','');
    await db.exec(legacy);
    const user=randomUUID(),product=randomUUID();
    await db.query("insert into users(id,name,email,password_hash,role) values($1,'Admin antigo','old@example.test','original-hash','ADMIN')",[user]);
    await db.query("insert into products(id,name,slug,description,price,stock,category_id,image_url) select $1,'Produto antigo','produto-antigo','Descrição preservada',120,7,id,'https://example.test/original.webp' from categories where slug='tercos'",[product]);
    await db.exec(await Promise.all(['202609080001_catalog.sql','202609080002_hero_products.sql'].map(file=>readFile(`supabase/migrations/${file}`,'utf8'))).then(parts=>parts.join('\n')));
    assert.equal((await db.query<{password_hash:string}>('select password_hash from users where id=$1',[user])).rows[0].password_hash,'original-hash');
    assert.equal(Number((await db.query<{price:string}>('select price from products where id=$1',[product])).rows[0].price),120);
    assert.equal((await db.query<{external_url:string}>('select external_url from product_images where product_id=$1',[product])).rows[0].external_url,'https://example.test/original.webp');
    await db.exec(await Promise.all(['202609080001_catalog.sql','202609080002_hero_products.sql'].map(file=>readFile(`supabase/migrations/${file}`,'utf8'))).then(parts=>parts.join('\n')));
    assert.equal((await db.query('select id from product_images where product_id=$1',[product])).rows.length,1);
  }finally{await db.close();}
});
