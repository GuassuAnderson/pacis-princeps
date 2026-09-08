import assert from 'node:assert/strict';
import { spawn, execFile } from 'node:child_process';
import { mkdir,readFile,writeFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { startFixture } from './supabase-fixture.mjs';

const fixture=await startFixture();
const origin='http://localhost:3107';
const originalNextEnv=await readFile('next-env.d.ts','utf8');
const originalTsconfig=await readFile('tsconfig.json','utf8');
const output='.next/catalog-browser-artifacts';
await mkdir(output,{recursive:true});
const child=spawn(process.execPath,['node_modules/next/dist/bin/next','dev','--port','3107'],{
  env:{...process.env,NEXT_DIST_DIR:'.next/catalog-browser',SUPABASE_URL:fixture.url,NEXT_PUBLIC_SUPABASE_URL:fixture.url,SUPABASE_SECRET_KEY:fixture.key,SUPABASE_SERVICE_ROLE_KEY:'',JWT_SECRET:randomBytes(48).toString('hex'),SITE_URL:origin},
  stdio:['ignore','pipe','pipe'],windowsHide:true,
});
let logs='';child.stdout.on('data',data=>logs+=data);child.stderr.on('data',data=>logs+=data);
let browser;
try {
  await new Promise((resolve,reject)=>{
    const timer=setInterval(()=>{if(logs.includes('Ready in')){clearInterval(timer);clearTimeout(deadline);resolve();}},250);
    const deadline=setTimeout(()=>{clearInterval(timer);reject(new Error(`Test server did not start: ${logs.slice(-2000)}`));},60000);
    child.once('exit',code=>{if(code){clearInterval(timer);clearTimeout(deadline);reject(new Error(logs.slice(-2000)));}});
  });
  browser=await chromium.launch(process.platform==='win32'?{channel:'chrome',headless:true}:{headless:true});
  const context=await browser.newContext({viewport:{width:1440,height:1000}});
  // The fixture's Storage is local; serve optimized-image requests from it.
  // Actual Supabase CDN/Next optimizer connectivity is checked separately.
  await context.route('**/_next/image?*',async route=>{
    const source=new URL(route.request().url()).searchParams.get('url');
    if(source?.startsWith(fixture.url)){const response=await fetch(source);await route.fulfill({status:response.status,body:Buffer.from(await response.arrayBuffer()),contentType:'image/webp'});}else await route.continue();
  });
  const page=await context.newPage();
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  context.on('page',newPage=>{
    newPage.on('pageerror',error=>errors.push(error.message));
    newPage.on('console',message=>{if(message.type()==='error'&&/hydrat|server rendered/i.test(message.text()))errors.push(message.text());});
  });
  assert.equal((await fetch(`${origin}/api/admin/products`)).status,401);
  assert.equal((await fetch(`${origin}/api/admin/uploads`,{method:'POST',headers:{origin}})).status,401);
  assert.equal((await fetch(`${origin}/api/auth/login`,{method:'POST',headers:{origin:'https://wrong.example','content-type':'application/json'},body:'{}'})).status,403);
  await page.goto(`${origin}/admin/produtos`);
  await page.waitForURL('**/login');
  await page.getByLabel('E-mail',{exact:true}).fill('admin@example.test');
  await page.getByLabel('Senha',{exact:true}).fill(fixture.password);
  await page.getByRole('button',{name:'Entrar no painel'}).click();
  await page.waitForURL('**/admin');
  console.log('PASS protected admin and login');
  await page.getByRole('link',{name:'Produtos',exact:true}).click();
  await page.getByRole('button',{name:'Novo produto'}).click();
  await page.getByLabel('Nome do produto *',{exact:true}).fill('Terço de integração');
  await page.locator('select[name="category"]').selectOption('tercos');
  await page.getByLabel('Estoque *',{exact:true}).fill('5');
  await page.getByLabel('Preço atual (R$) *',{exact:true}).fill('79.90');
  await page.getByLabel('Descrição *',{exact:true}).fill('Produto cadastrado pelo teste completo, com duas fotos.');
  await page.getByLabel('Exibir em Produtos em destaque').check();
  const photos=await Promise.all(['#803e24','#cf9a44'].map(async(background,index)=>{
    const path=`${output}/photo-${index}.png`;await sharp({create:{width:1200,height:800,channels:3,background}}).png().toFile(path);return path;
  }));
  await page.getByLabel('Fotos do produto',{exact:true}).setInputFiles(photos);
  await page.getByRole('button',{name:'Remover foto 2',exact:true}).waitFor();
  console.log('PASS photo uploads');
  await page.getByRole('button',{name:'Salvar produto',exact:true}).click();
  await page.getByText('Produto salvo no banco de dados.',{exact:true}).waitFor();
  await page.reload();
  await page.getByRole('button',{name:'Editar',exact:true}).waitFor();
  let listing=await (await fetch(`${origin}/api/products`)).json();
  assert.equal(listing.total,1);
  const id=listing.items[0].id;
  const firstImage=listing.items[0].images[0].id;
  assert.equal(listing.items[0].images.length,2);assert.equal(fixture.files.size,2);
  assert.ok((await (await fetch(origin)).text()).includes('Terço de integração'));
  assert.equal(listing.items[0].featured,true);
  assert.equal(listing.items[0].inHero,false);
  assert.equal((await (await fetch(`${origin}/api/products?inHero=true`)).json()).total,0);
  console.log('PASS product save and independent featured selection');
  await page.screenshot({path:`${output}/admin-desktop.png`});
  await page.getByRole('button',{name:'Editar',exact:true}).click();
  await page.getByLabel('Exibir no carrossel do início (hero)').check();
  await page.getByLabel('Exibir em Produtos em destaque').uncheck();
  await page.getByRole('button',{name:'Mover foto 2 para antes'}).click();
  await page.getByLabel('Preço atual (R$) *',{exact:true}).fill('89.90');
  await page.getByRole('button',{name:'Salvar produto',exact:true}).click();
  await page.getByText('Produto salvo no banco de dados.',{exact:true}).waitFor();
  listing=await (await fetch(`${origin}/api/products`)).json();
  assert.equal(listing.items[0].price,89.9);assert.notEqual(listing.items[0].images[0].id,firstImage);
  assert.equal(listing.items[0].inHero,true);
  assert.equal((await (await fetch(`${origin}/api/products?featured=true`)).json()).total,0);
  assert.equal((await (await fetch(`${origin}/api/products?inHero=true`)).json()).total,1);
  console.log('PASS independent hero selection, product edit and photo order');
  const customer=await context.newPage();
  await customer.goto(`${origin}/produtos?categoria=tercos`);
  await customer.getByRole('heading',{name:'Terço de integração',exact:true}).waitFor();
  await customer.goto(`${origin}/produto/${id}`);
  await customer.getByRole('heading',{name:'Terço de integração',exact:true}).waitFor();
  await customer.getByRole('button',{name:'Ver foto 2 de Terço de integração'}).click();
  await customer.getByText('Foto 2 de 2',{exact:true}).waitFor();
  await customer.getByRole('button',{name:'Adicionar ao carrinho',exact:true}).click();
  await customer.getByRole('link',{name:'Ver carrinho',exact:true}).click();
  await customer.getByRole('link',{name:'Terço de integração',exact:true}).waitFor();
  assert.ok((await customer.locator('.item-carrinho-preco').textContent()).includes('89,90'));
  await customer.goto(`${origin}/produto/${id}`);
  await customer.locator('.preloader-visivel').waitFor({state:'hidden'});
  await customer.screenshot({path:`${output}/product-desktop.png`});
  await customer.setViewportSize({width:390,height:844});
  await customer.locator('.nav-links').waitFor({state:'hidden'});
  await customer.screenshot({path:`${output}/product-mobile.png`});
  assert.equal(await customer.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.setViewportSize({width:390,height:844});
  await page.getByRole('button',{name:'Editar',exact:true}).click();
  await page.screenshot({path:`${output}/admin-mobile.png`});
  assert.equal(await page.evaluate(()=>document.querySelector('dialog').scrollWidth>document.querySelector('dialog').clientWidth),false);
  await page.getByRole('button',{name:'Cancelar',exact:true}).click();
  page.once('dialog',dialog=>dialog.accept());
  await page.getByRole('button',{name:'Despublicar',exact:true}).click();
  await page.getByText('Produto despublicado.',{exact:true}).waitFor();
  assert.equal((await (await fetch(`${origin}/api/products`)).json()).total,0);
  assert.equal((await fetch(`${origin}/api/products/${id}`)).status,404);
  await page.setViewportSize({width:1440,height:1000});
  await page.getByRole('button',{name:'Sair',exact:true}).focus();
  await page.getByRole('button',{name:'Sair',exact:true}).press('Enter');
  await page.waitForURL('**/login');
  assert.equal((await context.request.get(`${origin}/api/admin/products`)).status(),401);
  assert.deepEqual(errors,[]);
  console.log('PASS browser: protected admin, login/logout, upload and optimize 2 photos, save/reload/edit/reorder, public product gallery, cart, unpublish, desktop/mobile. Database: local PostgreSQL; Storage: isolated fixture.');
}catch(error){if(browser){for(const context of browser.contexts())for(const [index,page] of context.pages().entries())await page.screenshot({path:`${output}/failure-${index}.png`}).catch(()=>{});}console.error(error);console.error(logs.slice(-5000));process.exitCode=1;}
finally{
  if(browser)await browser.close();
  if(process.platform==='win32')await new Promise(resolve=>execFile('taskkill',['/PID',String(child.pid),'/T','/F'],{windowsHide:true},resolve));else child.kill('SIGTERM');
  await fixture.close();
  const after=await readFile('next-env.d.ts','utf8');
  if(after.includes('catalog-browser'))await writeFile('next-env.d.ts',originalNextEnv);
  const tsconfig=await readFile('tsconfig.json','utf8');
  if(tsconfig.includes('catalog-browser'))await writeFile('tsconfig.json',originalTsconfig);
}
