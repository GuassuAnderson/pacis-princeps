import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {PGlite} from '@electric-sql/pglite';
import {connectionInput} from '../src/lib/connection-validation';

test('Connection editions: legacy preservation, drafts, photos, versions and access control',async()=>{
  const db=new PGlite();
  try {
    await db.exec('create role anon;create role authenticated;create role service_role;create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);');
    await db.exec(await readFile('supabase/migrations/202609080001_catalog.sql','utf8'));
    await db.exec(await readFile('legacy-backend/supabase/connections.sql','utf8'));
    const old=randomUUID(),admin=randomUUID(),other=randomUUID(),photo=randomUUID(),foreign=randomUUID();
    await db.query("insert into connections(id,title,theme,event_date,preacher,summary) values($1,'Legacy','Theme','2024-01-01','Preacher','Original summary')",[old]);
    await db.query("insert into connection_images(connection_id,image_url) values($1,'https://example.com/original.webp')",[old]);
    const migration=await readFile('supabase/migrations/202609080003_connections.sql','utf8');
    await db.exec(migration);await db.exec(migration);
    assert.equal((await db.query('select * from connection_assets')).rows.length,1);
    await db.query("insert into users(id,name,email,password_hash,role) values($1,'Admin','a@example.test','test','ADMIN'),($2,'Other','b@example.test','test','ADMIN')",[admin,other]);
    await db.query("insert into connection_assets(id,uploaded_by,storage_path) values($1,$3,'photo.webp'),($2,$4,'foreign.webp')",[photo,foreign,admin,other]);
    const draft={id:randomUUID(),title:'Encontro de teste',theme:'A paz',date:'2026-09-08',preacher:'Pregador',role:'Convidado',summary:'Resumo completo do encontro',content:'Texto da pregação',published:false,updatedAt:null as string|null,imageIds:[photo]};
    assert.equal(connectionInput.safeParse(draft).success,true);
    assert.equal(connectionInput.safeParse({...draft,date:'2026-02-30'}).success,false);
    assert.equal(connectionInput.safeParse({...draft,imageIds:[photo,photo]}).success,false);
    const save=(value:typeof draft)=>db.query('select save_connection($1::jsonb,$2::uuid[],$3::uuid)',[JSON.stringify(value),value.imageIds,admin]);
    await save(draft);
    assert.equal((await db.query('select id from connections where published')).rows.length,0);
    const version=async()=>(await db.query<{value:string}>('select updated_at::text as value from connections where id=$1',[draft.id])).rows[0].value;
    draft.updatedAt=await version();draft.published=true;
    await assert.rejects(save({...draft,imageIds:[foreign]}),{code:'22023'});
    await save(draft);
    assert.equal((await db.query('select id from connections where published')).rows.length,1);
    await assert.rejects(save(draft),{code:'40001'});
    draft.updatedAt=await version();draft.imageIds=[];draft.published=false;await save(draft);
    assert.equal((await db.query('select id from connection_assets where connection_id=$1 and active',[draft.id])).rows.length,0);
    await db.query('update connections set active=false where id=$1',[draft.id]);
    draft.updatedAt=await version();await assert.rejects(save(draft),{code:'P0002'});
    await db.exec('set role anon');
    await assert.rejects(db.query('select * from connections'),/permission denied/);
    await assert.rejects(save(draft),/permission denied/);
  }finally{await db.close();}
});
