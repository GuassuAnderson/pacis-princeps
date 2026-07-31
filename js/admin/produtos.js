if(!PPApi.autenticado()) window.location.href = '../login.html';

  let produtosBanco = [];

  async function carregarProdutos(){
    try{
      produtosBanco = (await PPApi.listarProdutos()).map(produto => PPApi.normalizarProduto(produto));
      PPData.salvarProdutos(produtosBanco);
      renderizarTabela();
    } catch(erro){
      if(erro.status === 401 || erro.status === 403){ PPApi.sair(); window.location.href = '../login.html'; return; }
      mostrarToast(erro.message, false);
    }
  }

  function mostrarToast(msg, ok=true){
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.style.background = ok ? 'var(--espresso)' : '#b05412';
    t.classList.add('visivel');
    setTimeout(()=>t.classList.remove('visivel'), 2800);
  }

  function renderizarTabela(){
    const busca = document.getElementById('busca-produto').value.toLowerCase();
    const cat = document.getElementById('filtro-cat').value;
    let lista = [...produtosBanco];
    if(cat) lista = lista.filter(p=>p.categoria===cat);
    if(busca) lista = lista.filter(p=>p.nome.toLowerCase().includes(busca));

    document.getElementById('contagem-produtos').textContent = lista.length;
    const tbody = document.getElementById('tbody-produtos');
    if(!lista.length){
      tbody.innerHTML = `<tr><td colspan="6" class="tabela-vazia">Nenhum produto encontrado.</td></tr>`;
      return;
    }
    const e = PPData.escaparHTML.bind(PPData);
    tbody.innerHTML = lista.map(p => `
      <tr>
        <td data-label="Produto">
          <div class="prod-nome-col">
            <img src="${e(PPData.urlImagemSegura(p.imagem))}" alt="${e(p.nome)}" class="prod-imagem-mini">
            <div><strong>${e(p.nome)}</strong><span>${e(p.id)}</span></div>
          </div>
        </td>
        <td data-label="Categoria"><span class="badge-cat">${PPData.nomeCategoria(p.categoria)}</span></td>
        <td data-label="Preço">
          <span class="preco-tabela">${PPData.formatarPreco(p.preco)}</span>
          ${p.precoAntigo ? `<br><small class="preco-antigo-tabela">${PPData.formatarPreco(p.precoAntigo)}</small>` : ''}
        </td>
        <td data-label="Estoque"><span class="${p.estoque > 5 ? 'badge-estoque-ok' : 'badge-estoque-baixo'}">${p.estoque} un.</span></td>
        <td data-label="Destaque">${p.destaque ? '⭐ Sim' : '—'}</td>
        <td data-label="Ações">
          <div class="acoes-tabela">
            <button class="btn-tabela btn-editar" data-editar-produto="${e(p.id)}">Editar</button>
            <button class="btn-tabela btn-excluir" data-excluir-produto="${e(p.id)}">Excluir</button>
          </div>
        </td>
      </tr>`).join('');
  }

  let modoEdicao = false;
  let imagemProdutoAtiva = '';

  function atualizarPreviewImagem(){
    const preview = document.getElementById('preview-imagem-produto');
    const imagem = document.getElementById('preview-imagem-produto-img');
    preview.classList.toggle('oculto', !imagemProdutoAtiva);
    if(imagemProdutoAtiva) imagem.src = imagemProdutoAtiva;
    else imagem.removeAttribute('src');
  }

  function abrirModal(produto=null){
    modoEdicao = !!produto;
    document.getElementById('modal-titulo').textContent = produto ? 'Editar produto' : 'Novo produto';
    document.getElementById('prod-id').value = produto?.id || '';
    document.getElementById('prod-nome').value = produto?.nome || '';
    document.getElementById('prod-categoria').value = produto?.categoria || '';
    document.getElementById('prod-preco').value = produto?.preco || '';
    document.getElementById('prod-preco-antigo').value = produto?.precoAntigo || '';
    document.getElementById('prod-estoque').value = produto?.estoque ?? '';
    document.getElementById('prod-imagem').value = '';
    imagemProdutoAtiva = produto?.imagem || '';
    atualizarPreviewImagem();
    document.getElementById('prod-descricao').value = produto?.descricao || '';
    document.getElementById('prod-destaque').checked = produto?.destaque || false;
    document.getElementById('modal-overlay').classList.remove('oculto');
    document.getElementById('prod-nome').focus();
  }

  function fecharModal(){
    document.getElementById('modal-overlay').classList.add('oculto');
    document.getElementById('form-produto').reset();
    imagemProdutoAtiva = '';
    atualizarPreviewImagem();
  }

  function editarProduto(id){
    const p = produtosBanco.find(produto => produto.id === id);
    if(p) abrirModal(p);
  }

  async function excluirProduto(id, nome){
    if(!confirm(`Excluir "${nome}"? Esta ação não pode ser desfeita.`)) return;
    try{
      await PPApi.excluirProduto(id);
      produtosBanco = produtosBanco.filter(produto => produto.id !== id);
      PPData.salvarProdutos(produtosBanco);
      renderizarTabela();
      mostrarToast('Produto excluído com sucesso.');
    } catch(erro){ mostrarToast(erro.message, false); }
  }

  function criarSlug(texto){
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36);
  }

  async function salvarProduto(e){
    e.preventDefault();
    const id = document.getElementById('prod-id').value;
    const nome = document.getElementById('prod-nome').value.trim();
    const categoria = document.getElementById('prod-categoria').value;
    const preco = parseFloat(document.getElementById('prod-preco').value);
    const precoAntigo = parseFloat(document.getElementById('prod-preco-antigo').value) || null;
    const estoque = parseInt(document.getElementById('prod-estoque').value);
    const descricao = document.getElementById('prod-descricao').value.trim();
    const dados = {
      name:nome, slug:id ? undefined : criarSlug(nome), categorySlug:categoria,
      price:preco, compareAtPrice:precoAntigo, stock:estoque,
      description:descricao, featured:document.getElementById('prod-destaque').checked,
      active:true
    };
    if(imagemProdutoAtiva.startsWith('data:image/')) dados.imageData = imagemProdutoAtiva;
    else dados.imageUrl = imagemProdutoAtiva || null;
    if(!nome || !categoria || !Number.isFinite(preco) || preco <= 0 || !Number.isInteger(estoque) || estoque < 0 || descricao.length < 10){
      mostrarToast('Revise nome, categoria, preço, estoque e descrição.', false);
      return;
    }
    if(precoAntigo !== null && precoAntigo <= preco){
      mostrarToast('O preço anterior deve ser maior que o preço atual.', false);
      return;
    }
    const botaoSalvar = document.querySelector('[form="form-produto"][type="submit"]');
    botaoSalvar.disabled = true;
    botaoSalvar.textContent = 'Salvando…';
    try{
      let produtoSalvo;
      if(id){
        produtoSalvo = PPApi.normalizarProduto(await PPApi.atualizarProduto(id, dados));
        produtosBanco = produtosBanco.map(produto => produto.id === id ? produtoSalvo : produto);
        mostrarToast('Produto atualizado com sucesso!');
      } else {
        produtoSalvo = PPApi.normalizarProduto(await PPApi.criarProduto(dados));
        produtosBanco.unshift(produtoSalvo);
        mostrarToast('Produto cadastrado com sucesso!');
      }
      PPData.salvarProdutos(produtosBanco);
    } catch(erro){
      mostrarToast(erro.detalhes?.[0]?.message || erro.message, false);
      return;
    } finally {
      botaoSalvar.disabled = false;
      botaoSalvar.textContent = 'Salvar produto';
    }
    fecharModal();
    renderizarTabela();
  }

  // Fechar modal ao clicar fora
  document.getElementById('modal-overlay').addEventListener('click', e => {
    if(e.target === document.getElementById('modal-overlay')) fecharModal();
  });

  document.getElementById('tbody-produtos').addEventListener('click', e => {
    const editar = e.target.closest('[data-editar-produto]');
    const excluir = e.target.closest('[data-excluir-produto]');
    if(editar) editarProduto(editar.dataset.editarProduto);
    if(excluir){
      const produto = produtosBanco.find(item => item.id === excluir.dataset.excluirProduto);
      if(produto) excluirProduto(produto.id, produto.nome);
    }
  });
  document.querySelector('[data-abrir-produto]').addEventListener('click', () => abrirModal());
  document.querySelectorAll('[data-fechar-produto]').forEach(botao => botao.addEventListener('click', fecharModal));
  document.getElementById('form-produto').addEventListener('submit', salvarProduto);
  document.getElementById('prod-imagem').addEventListener('change', async evento => {
    const arquivo = evento.target.files[0];
    if(!arquivo) return;
    evento.target.disabled = true;
    try{
      imagemProdutoAtiva = await PPImagem.processarArquivo(arquivo);
      atualizarPreviewImagem();
      mostrarToast('Imagem pronta para salvar.');
    } catch(erro){
      evento.target.value = '';
      mostrarToast(erro.message, false);
    } finally {
      evento.target.disabled = false;
    }
  });
  document.getElementById('remover-imagem-produto').addEventListener('click', () => {
    imagemProdutoAtiva = '';
    document.getElementById('prod-imagem').value = '';
    atualizarPreviewImagem();
  });

  // Fechar modal com Escape
  document.addEventListener('keydown', e => { if(e.key==='Escape') fecharModal(); });

  // Sair
  document.getElementById('btn-sair').addEventListener('click', e => {
    e.preventDefault(); PPApi.sair(); window.location.href = '../login.html';
  });

  // Mobile sidebar
  const toggle = document.getElementById('menu-toggle-admin');
  const sidebar = document.getElementById('sidebar');
  toggle.addEventListener('click', () => sidebar.classList.toggle('aberta'));
  document.addEventListener('click', e => { if(!sidebar.contains(e.target) && !toggle.contains(e.target)) sidebar.classList.remove('aberta'); });

  carregarProdutos();
