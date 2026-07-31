const PPApi = {
  baseUrl: window.PP_API_URL || (
    ['localhost', '127.0.0.1'].includes(window.location.hostname)
      ? 'http://localhost:3333/api'
      : '/api'
  ),
  chaveToken: 'pp_api_token',

  token(){ return sessionStorage.getItem(this.chaveToken) || ''; },
  autenticado(){ return Boolean(this.token()); },
  sair(){ sessionStorage.removeItem(this.chaveToken); },

  async requisitar(caminho, opcoes = {}){
    const headers = { 'Content-Type':'application/json', ...(opcoes.headers || {}) };
    if(this.token()) headers.Authorization = `Bearer ${this.token()}`;
    const resposta = await fetch(`${this.baseUrl}${caminho}`, { ...opcoes, headers });
    const corpo = resposta.status === 204 ? null : await resposta.json().catch(() => null);
    if(!resposta.ok){
      const erro = new Error(corpo?.message || 'Não foi possível comunicar com o servidor.');
      erro.status = resposta.status;
      erro.detalhes = corpo?.errors || [];
      throw erro;
    }
    return corpo;
  },

  async login(email, senha){
    const resposta = await this.requisitar('/auth/login', {
      method:'POST', body:JSON.stringify({ email, password:senha })
    });
    if(resposta.user?.role !== 'ADMIN') throw new Error('Este usuário não possui acesso administrativo.');
    sessionStorage.setItem(this.chaveToken, resposta.token);
    return resposta.user;
  },

  listarProdutos(){ return this.requisitar('/products'); },
  async sincronizarProdutosPublicos(){
    const produtos = (await this.listarProdutos()).map(produto => this.normalizarProduto(produto));
    PPData.salvarProdutos(produtos);
    return produtos;
  },
  criarProduto(dados){ return this.requisitar('/products', { method:'POST', body:JSON.stringify(dados) }); },
  atualizarProduto(id, dados){ return this.requisitar(`/products/${encodeURIComponent(id)}`, { method:'PUT', body:JSON.stringify(dados) }); },
  excluirProduto(id){ return this.requisitar(`/products/${encodeURIComponent(id)}`, { method:'DELETE' }); },

  listarConexoesPublicas(){ return this.requisitar('/connections'); },
  listarConexoesAdmin(){ return this.requisitar('/connections/admin'); },
  criarConexao(dados){ return this.requisitar('/connections', { method:'POST', body:JSON.stringify(dados) }); },
  atualizarConexao(id, dados){ return this.requisitar(`/connections/${encodeURIComponent(id)}`, { method:'PUT', body:JSON.stringify(dados) }); },
  excluirConexao(id){ return this.requisitar(`/connections/${encodeURIComponent(id)}`, { method:'DELETE' }); },

  normalizarConexao(conexao){
    return {
      id:conexao.id,
      titulo:conexao.title,
      tema:conexao.theme,
      data:conexao.event_date,
      pregador:conexao.preacher,
      cargo:conexao.preacher_title || '',
      resumo:conexao.summary,
      conteudo:conexao.content || '',
      publicado:Boolean(conexao.published),
      fotos:[...(conexao.photos || [])].sort((a,b) => a.position - b.position).map(foto => foto.image_url)
    };
  },

  normalizarProduto(produto){
    return PPData.normalizarProduto({
      id:produto.id,
      nome:produto.name,
      categoria:produto.category?.slug || produto.category_slug,
      preco:Number(produto.price),
      precoAntigo:produto.compare_at_price == null ? null : Number(produto.compare_at_price),
      estoque:Number(produto.stock),
      imagem:produto.image_url || '',
      descricao:produto.description,
      destaque:Boolean(produto.featured)
    });
  }
};
