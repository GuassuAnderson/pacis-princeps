document.addEventListener('DOMContentLoaded', async () => {
  try { await PPApi.sincronizarProdutosPublicos(); }
  catch(erro) { console.error('Não foi possível atualizar o produto:', erro); }
  const id = new URLSearchParams(location.search).get('id');
  const container = document.querySelector('[data-produto-detalhe]');
  const p = id ? PPData.obterProduto(id) : null;
  const e = PPData.escaparHTML.bind(PPData);

  if(!p){
    container.innerHTML = `<div class="produto-nao-encontrado">
      <h2>Produto não encontrado</h2>
      <a href="produtos.html" class="btn btn-contorno">Ver todos os produtos</a>
    </div>`;
    return;
  }

  document.title = `${p.nome} — Pacis Princeps`;

  container.innerHTML = `
    <div class="produto-detalhe">
      <div class="produto-detalhe-imagem">
        <img src="${e(PPData.urlImagemSegura(p.imagem))}" alt="${e(p.nome)}">
      </div>
      <div class="produto-info">
        <a href="produtos.html" class="produto-voltar">← Voltar ao catálogo</a>
        <span class="rotulo">${e(PPData.nomeCategoria(p.categoria))}</span>
        <h1>${e(p.nome)}</h1>
        <div class="produto-preco-bloco">
          <span class="preco-atual">${PPData.formatarPreco(p.preco)}</span>
          ${p.precoAntigo ? `<span class="preco-antigo">${PPData.formatarPreco(p.precoAntigo)}</span>` : ''}
        </div>
        <p class="produto-descricao">${e(p.descricao)}</p>
        <div class="produto-acoes">
          <button class="btn btn-primario" id="btn-adicionar" data-adicionar-produto="${e(p.id)}" ${p.estoque < 1 ? 'disabled' : ''}>
            ${p.estoque < 1 ? 'Produto esgotado' : 'Adicionar ao carrinho'}
          </button>
          <a href="carrinho.html" class="btn btn-contorno">Ver carrinho</a>
        </div>
        <div class="produto-meta">
          <dl>
            <dt>Categoria</dt><dd>${e(PPData.nomeCategoria(p.categoria))}</dd>
            <dt>Estoque</dt><dd>${p.estoque > 0 ? `${p.estoque} unidades disponíveis` : 'Produto esgotado'}</dd>
          </dl>
        </div>
      </div>
    </div>`;
  PPUI.ativarBotoesCarrinho(container);

  // Relacionados: mesma categoria, exceto o atual
  const relacionados = PPData.listarProdutos().filter(q => q.categoria === p.categoria && q.id !== p.id).slice(0,4);
  const gradeRel = document.querySelector('[data-grade-relacionados]');
  if(gradeRel){
    if(!relacionados.length){
      gradeRel.closest('section').hidden = true;
    } else {
      gradeRel.innerHTML = relacionados.map(PPUI.cartaoProduto).join('');
      PPUI.ativarBotoesCarrinho(gradeRel);
    }
  }
});
