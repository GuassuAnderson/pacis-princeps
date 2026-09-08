import { dbClient } from './db-config.mjs';
import bcrypt from 'bcryptjs';
try {
  const email=process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password=process.env.ADMIN_PASSWORD;
  if(!email||!/^\S+@\S+\.\S+$/.test(email)||!password||Buffer.byteLength(password)<12||Buffer.byteLength(password)>72)throw new Error('Defina ADMIN_EMAIL e ADMIN_PASSWORD (12 a 72 bytes) em .env.local.');
  const db=dbClient();
  const {data:existing,error:readError}=await db.from('users').select('id').eq('email',email).maybeSingle();
  if(readError)throw new Error('Não foi possível consultar os usuários. Verifique a conexão e a migração.');
  if(existing)throw new Error('Esse usuário já existe. Nenhuma senha ou permissão foi alterada.');
  const {error}=await db.from('users').insert({name:process.env.ADMIN_NAME||'Administrador',email,password_hash:await bcrypt.hash(password,12),role:'ADMIN',active:true});
  if(error)throw new Error('Não foi possível criar o administrador.');
  console.log('Administrador criado. Remova ADMIN_PASSWORD de .env.local e entre em /login.');
}catch(error){console.error(error instanceof Error?error.message:'Falha ao criar administrador.');process.exitCode=1;}
