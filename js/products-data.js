/* ==========================================================================
   PRINCEPS PACIS — Camada de dados de produtos
   Front-end apenas: os produtos vivem no localStorage do navegador.
   O painel administrativo lê/escreve exatamente nesta mesma chave,
   então tudo que o admin cadastra aparece nas páginas da loja.
   ========================================================================== */

const PP_CHAVE_PRODUTOS = 'pp_produtos';
const PP_CHAVE_CARRINHO = 'pp_carrinho';
const PP_CHAVE_SESSAO_ADMIN = 'pp_admin_sessao';
const PP_CHAVE_PEDIDOS_DEMO = 'pp_pedidos_demo';

const PP_PRODUTOS_INICIAIS = [
  {
    id: 'p001',
    nome: 'Terço de Madeira de Oliveira',
    categoria: 'tercos',
    preco: 89.9,
    precoAntigo: 119.9,
    imagem: 'https://placehold.co/600x600/d1bea0/803e24?text=Ter%C3%A7o',
    descricao: 'Terço artesanal em madeira de oliveira legítima, vinda da Terra Santa. Contas torneadas à mão e crucifixo em metal envelhecido.',
    destaque: true,
    estoque: 24
  },
  {
    id: 'p002',
    nome: 'Terço de Cristal Ave-Maria',
    categoria: 'tercos',
    preco: 64.9,
    precoAntigo: null,
    imagem: 'https://placehold.co/600x600/d1bea0/803e24?text=Ter%C3%A7o',
    descricao: 'Contas facetadas em cristal transparente, medalha de Nossa Senhora e acabamento em metal dourado.',
    destaque: false,
    estoque: 40
  },
  {
    id: 'p003',
    nome: 'Imagem Sagrada Família 25cm',
    categoria: 'imagens',
    preco: 149.9,
    precoAntigo: 189.9,
    imagem: 'https://placehold.co/600x600/e7dac6/803e24?text=Imagem',
    descricao: 'Imagem em resina de alta definição, pintura fosca artesanal e base em madeira.',
    destaque: true,
    estoque: 12
  },
  {
    id: 'p004',
    nome: 'Imagem Nossa Senhora Aparecida 40cm',
    categoria: 'imagens',
    preco: 219.9,
    precoAntigo: null,
    imagem: 'https://placehold.co/600x600/e7dac6/803e24?text=Imagem',
    descricao: 'Peça em resina especial resistente a rachaduras, acabamento manual em tons de azul e ouro.',
    destaque: false,
    estoque: 8
  },
  {
    id: 'p005',
    nome: 'Camiseta Princeps Pacis — Bom Pastor',
    categoria: 'camisetas',
    preco: 79.9,
    precoAntigo: 99.9,
    imagem: 'https://placehold.co/600x600/f7f0e4/803e24?text=Camiseta',
    descricao: '100% algodão penteado, estampa do Bom Pastor inspirada em nossa identidade visual.',
    destaque: true,
    estoque: 60
  },
  {
    id: 'p006',
    nome: 'Camiseta Fé em Movimento',
    categoria: 'camisetas',
    preco: 74.9,
    precoAntigo: null,
    imagem: 'https://placehold.co/600x600/f7f0e4/803e24?text=Camiseta',
    descricao: 'Corte unissex, tecido leve para o dia a dia, estampa em serigrafia de longa duração.',
    destaque: false,
    estoque: 35
  },
  {
    id: 'p007',
    nome: 'Colar Medalha Milagrosa em Prata',
    categoria: 'joias',
    preco: 179.9,
    precoAntigo: 229.9,
    imagem: 'https://placehold.co/600x600/d1bea0/351c11?text=Joia',
    descricao: 'Prata 925 com banho antitarnish, corrente veneziana e medalha bicolor.',
    destaque: true,
    estoque: 15
  },
  {
    id: 'p008',
    nome: 'Brinco Cruz Minimalista Folheado a Ouro',
    categoria: 'joias',
    preco: 99.9,
    precoAntigo: null,
    imagem: 'https://placehold.co/600x600/d1bea0/351c11?text=Joia',
    descricao: 'Folheado a ouro 18k, hipoalergênico, design discreto para o dia a dia.',
    destaque: false,
    estoque: 22
  }
];

const PPData = {
  categorias: [
    { id:'tercos', nome:'Terços', descricao:'Peças em madeira, cristal e prata' },
    { id:'imagens', nome:'Imagens Sacras', descricao:'Santos e devoções em resina e madeira' },
    { id:'camisetas', nome:'Camisetas', descricao:'Estampas autorais da marca' },
    { id:'joias', nome:'Joias', descricao:'Prata, folheados e medalhas' }
  ],

  garantirSeed(){
    if(!localStorage.getItem(PP_CHAVE_PRODUTOS)){
      localStorage.setItem(PP_CHAVE_PRODUTOS, JSON.stringify(PP_PRODUTOS_INICIAIS));
    }
  },

  numeroSeguro(valor, fallback = 0){
    const numero = Number(valor);
    return Number.isFinite(numero) ? numero : fallback;
  },

  escaparHTML(valor = ''){
    return String(valor).replace(/[&<>"']/g, caractere => ({
      '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;'
    }[caractere]));
  },

  urlImagemSegura(url = ''){
    const valor = String(url).trim();
    const fallback = 'https://placehold.co/600x600/e7dac6/803e24?text=Princeps+Pacis';
    if(!valor) return fallback;
    if(/^(https?:\/\/|\.{0,2}\/|assets\/|data:image\/(?:jpeg|png|webp);base64,)/i.test(valor)) return valor;
    return fallback;
  },

  normalizarProduto(produto = {}){
    const categoriaValida = this.categorias.some(c => c.id === produto.categoria);
    const preco = Math.max(0, this.numeroSeguro(produto.preco));
    const precoAntigo = this.numeroSeguro(produto.precoAntigo, 0);
    return {
      ...produto,
      nome: String(produto.nome || '').trim(),
      categoria: categoriaValida ? produto.categoria : this.categorias[0].id,
      preco,
      precoAntigo: precoAntigo > preco ? precoAntigo : null,
      estoque: Math.max(0, Math.trunc(this.numeroSeguro(produto.estoque))),
      imagem: String(produto.imagem || '').trim(),
      descricao: String(produto.descricao || '').trim(),
      destaque: Boolean(produto.destaque)
    };
  },

  listarProdutos(){
    this.garantirSeed();
    try{
      const lista = JSON.parse(localStorage.getItem(PP_CHAVE_PRODUTOS));
      return Array.isArray(lista) ? lista.map(p => this.normalizarProduto(p)) : [];
    }
    catch(e){ return []; }
  },

  salvarProdutos(lista){
    const normalizada = Array.isArray(lista) ? lista.map(p => this.normalizarProduto(p)) : [];
    localStorage.setItem(PP_CHAVE_PRODUTOS, JSON.stringify(normalizada));
  },

  obterProduto(id){
    return this.listarProdutos().find(p => p.id === id) || null;
  },

  criarProduto(produto){
    const lista = this.listarProdutos();
    produto = this.normalizarProduto(produto);
    produto.id = 'p' + Date.now().toString(36);
    lista.unshift(produto);
    this.salvarProdutos(lista);
    return produto;
  },

  atualizarProduto(id, dados){
    const lista = this.listarProdutos();
    const i = lista.findIndex(p => p.id === id);
    if(i > -1){ lista[i] = this.normalizarProduto({ ...lista[i], ...dados }); this.salvarProdutos(lista); }
    return lista[i];
  },

  excluirProduto(id){
    const lista = this.listarProdutos().filter(p => p.id !== id);
    this.salvarProdutos(lista);
    this.removerDoCarrinho(id);
  },

  formatarPreco(valor){
    return this.numeroSeguro(valor).toLocaleString('pt-BR', { style:'currency', currency:'BRL' });
  },

  nomeCategoria(id){
    const c = this.categorias.find(c => c.id === id);
    return c ? c.nome : id;
  },

  /* ---------------- Carrinho ---------------- */
  listarCarrinho(){
    try{
      const itens = JSON.parse(localStorage.getItem(PP_CHAVE_CARRINHO));
      if(!Array.isArray(itens)) return [];
      return itens
        .map(item => ({ id:String(item.id || ''), quantidade:Math.max(1, Math.trunc(this.numeroSeguro(item.quantidade, 1))) }))
        .filter(item => item.id && this.obterProduto(item.id));
    }
    catch(e){ return []; }
  },

  salvarCarrinho(itens){
    const validos = Array.isArray(itens) ? itens.filter(item => this.obterProduto(item.id)) : [];
    localStorage.setItem(PP_CHAVE_CARRINHO, JSON.stringify(validos));
    this.atualizarBadgeCarrinho();
  },

  adicionarAoCarrinho(idProduto, quantidade = 1){
    const produto = this.obterProduto(idProduto);
    if(!produto || produto.estoque < 1) return { ok:false, mensagem:'Produto sem estoque.' };
    const itens = this.listarCarrinho();
    const existente = itens.find(i => i.id === idProduto);
    const atual = existente?.quantidade || 0;
    const solicitada = Math.max(1, Math.trunc(this.numeroSeguro(quantidade, 1)));
    const novaQuantidade = Math.min(produto.estoque, atual + solicitada);
    if(existente){ existente.quantidade = novaQuantidade; }
    else{ itens.push({ id: idProduto, quantidade:novaQuantidade }); }
    this.salvarCarrinho(itens);
    return {
      ok:novaQuantidade > atual,
      quantidade:novaQuantidade,
      mensagem:novaQuantidade > atual ? 'Produto adicionado ao carrinho.' : 'Limite de estoque atingido.'
    };
  },

  removerDoCarrinho(idProduto){
    this.salvarCarrinho(this.listarCarrinho().filter(i => i.id !== idProduto));
  },

  atualizarQuantidadeCarrinho(idProduto, quantidade){
    const produto = this.obterProduto(idProduto);
    if(!produto) return { ok:false, mensagem:'Produto indisponível.' };
    const itens = this.listarCarrinho();
    const item = itens.find(i => i.id === idProduto);
    const novaQuantidade = Math.max(1, Math.min(produto.estoque, Math.trunc(this.numeroSeguro(quantidade, 1))));
    if(item){ item.quantidade = novaQuantidade; }
    this.salvarCarrinho(itens);
    return { ok:true, quantidade:novaQuantidade, limitado:novaQuantidade !== quantidade };
  },

  totalItensCarrinho(){
    return this.listarCarrinho().reduce((s,i) => s + i.quantidade, 0);
  },

  finalizarPedidoDemo(){
    const itens = this.listarCarrinho();
    if(!itens.length) return { ok:false, mensagem:'O carrinho está vazio.' };
    const produtos = this.listarProdutos();
    for(const item of itens){
      const produto = produtos.find(p => p.id === item.id);
      if(!produto || produto.estoque < item.quantidade){
        return { ok:false, mensagem:`Estoque insuficiente para ${produto?.nome || 'um produto'}.` };
      }
    }
    const subtotal = itens.reduce((total, item) => {
      const produto = produtos.find(p => p.id === item.id);
      return total + produto.preco * item.quantidade;
    }, 0);
    const pedido = {
      id:'PED-' + Date.now().toString(36).toUpperCase(),
      criadoEm:new Date().toISOString(),
      itens,
      subtotal,
      frete:subtotal >= 250 ? 0 : 22.9
    };
    itens.forEach(item => {
      const produto = produtos.find(p => p.id === item.id);
      produto.estoque -= item.quantidade;
    });
    this.salvarProdutos(produtos);
    let pedidos = [];
    try{ pedidos = JSON.parse(localStorage.getItem(PP_CHAVE_PEDIDOS_DEMO)) || []; }catch(e){}
    pedidos.unshift(pedido);
    localStorage.setItem(PP_CHAVE_PEDIDOS_DEMO, JSON.stringify(pedidos));
    this.salvarCarrinho([]);
    return { ok:true, pedido };
  },

  atualizarBadgeCarrinho(){
    document.querySelectorAll('[data-contador-carrinho]').forEach(el=>{
      el.textContent = this.totalItensCarrinho();
    });
  },

  /* ---------------- Sessão admin (mock) ---------------- */
  ADMIN_USUARIO: 'admin',
  ADMIN_SENHA: 'princeps123',

  autenticarAdmin(usuario, senha){
    if(usuario === this.ADMIN_USUARIO && senha === this.ADMIN_SENHA){
      sessionStorage.setItem(PP_CHAVE_SESSAO_ADMIN, '1');
      return true;
    }
    return false;
  },

  adminAutenticado(){
    return sessionStorage.getItem(PP_CHAVE_SESSAO_ADMIN) === '1';
  },

  sairAdmin(){
    sessionStorage.removeItem(PP_CHAVE_SESSAO_ADMIN);
  }
};
