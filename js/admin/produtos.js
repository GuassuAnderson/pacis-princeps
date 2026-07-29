if(!PPData.adminAutenticado()) window.location.href = '../login.html';

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
    let lista = PPData.listarProdutos();
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
    const p = PPData.obterProduto(id);
    if(p) abrirModal(p);
  }

  function excluirProduto(id, nome){
    if(!confirm(`Excluir "${nome}"? Esta ação não pode ser desfeita.`)) return;
    PPData.excluirProduto(id);
    renderizarTabela();
    mostrarToast('Produto excluído com sucesso.');
  }

  function salvarProduto(e){
    e.preventDefault();
    const id = document.getElementById('prod-id').value;
    const dados = {
      nome:        document.getElementById('prod-nome').value.trim(),
      categoria:   document.getElementById('prod-categoria').value,
      preco:       parseFloat(document.getElementById('prod-preco').value),
      precoAntigo: parseFloat(document.getElementById('prod-preco-antigo').value) || null,
      estoque:     parseInt(document.getElementById('prod-estoque').value),
      imagem:      imagemProdutoAtiva,
      descricao:   document.getElementById('prod-descricao').value.trim(),
      destaque:    document.getElementById('prod-destaque').checked
    };
    if(!dados.nome || !dados.categoria || !Number.isFinite(dados.preco) || dados.preco <= 0 || !Number.isInteger(dados.estoque) || dados.estoque < 0){
      mostrarToast('Revise nome, categoria, preço e estoque.', false);
      return;
    }
    if(dados.precoAntigo !== null && dados.precoAntigo <= dados.preco){
      mostrarToast('O preço anterior deve ser maior que o preço atual.', false);
      return;
    }
    try{
      if(id){
        PPData.atualizarProduto(id, dados);
        mostrarToast('Produto atualizado com sucesso!');
      } else {
        PPData.criarProduto(dados);
        mostrarToast('Produto cadastrado com sucesso!');
      }
    } catch(erro){
      mostrarToast('Não há espaço no navegador para salvar esta imagem. Tente uma imagem menor.', false);
      return;
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
      const produto = PPData.obterProduto(excluir.dataset.excluirProduto);
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
    e.preventDefault(); PPData.sairAdmin(); window.location.href = '../login.html';
  });

  // Mobile sidebar
  const toggle = document.getElementById('menu-toggle-admin');
  const sidebar = document.getElementById('sidebar');
  toggle.addEventListener('click', () => sidebar.classList.toggle('aberta'));
  document.addEventListener('click', e => { if(!sidebar.contains(e.target) && !toggle.contains(e.target)) sidebar.classList.remove('aberta'); });

  renderizarTabela();
