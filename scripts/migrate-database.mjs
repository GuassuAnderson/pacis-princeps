import './db-config.mjs';
import pg from 'pg';
import { readFile, readdir } from 'node:fs/promises';
if(!process.env.DATABASE_URL) {
  console.error('Configure DATABASE_URL em .env.local ou execute os arquivos SQL de supabase/migrations em ordem no SQL Editor do Supabase.');
  process.exitCode=1;
} else {
  const client=new pg.Client({connectionString:process.env.DATABASE_URL,connectionTimeoutMillis:15000});
  try {
    await client.connect();
    const directory=new URL('../supabase/migrations/',import.meta.url);
    for(const file of (await readdir(directory)).filter(file=>file.endsWith('.sql')).sort()) {
      await client.query(await readFile(new URL(file,directory),'utf8'));
    }
    console.log('Migração do catálogo aplicada. Produtos e usuários existentes foram preservados.');
  } catch(error) { console.error('Migração não concluída.',error.code||'Erro de conexão ou SQL.');process.exitCode=1; }
  finally { await client.end(); }
}
