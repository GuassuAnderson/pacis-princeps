import { dbClient } from './db-config.mjs';
try {
  const db=dbClient();
  console.log('Verificando conexão, tabelas, funções e Storage…');
  for(const table of ['users','categories','products','product_images','admin_sessions','admin_login_attempts','connections','connection_assets']) {
    const {error}=await db.from(table).select('*',{count:'exact',head:true});
    if(error)throw new Error(`Falha em ${table}: ${error.code||'conexão'}. Verifique o projeto e execute a migração SQL.`);
    console.log(`OK ${table}`);
  }
  const {error:heroError}=await db.from('products').select('hero_slot,in_hero',{head:true}).limit(1);
  if(heroError)throw new Error('Execute a migração 202609080002_hero_products.sql para habilitar o carrossel.');
  const {error:rpcError}=await db.rpc('catalog_metrics');
  if(rpcError)throw new Error('A função catalog_metrics não está disponível. Execute a migração SQL.');
  const {data:bucket,error:storageError}=await db.storage.getBucket('product-images');
  if(storageError||!bucket?.public)throw new Error('O bucket público product-images não está configurado.');
  const {data:connectionBucket,error:connectionStorageError}=await db.storage.getBucket('connection-images');
  if(connectionStorageError||!connectionBucket?.public)throw new Error('Execute a migração de Conexão para configurar o bucket connection-images.');
  const {count,error:adminError}=await db.from('users').select('id',{count:'exact',head:true}).eq('role','ADMIN').eq('active',true);
  if(adminError||!count)throw new Error('Nenhum administrador ativo. Use npm run admin:create.');
  console.log('OK: estrutura conectada. Use o painel para cadastrar e publicar produtos.');
} catch(error) { console.error(error instanceof Error?error.message:'Falha ao verificar a conexão.');process.exitCode=1; }
