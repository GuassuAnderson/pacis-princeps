function renderCarrinho(mensagem = ''){
  const container = document.querySelector('[data-carrinho-container]');
  const itens = PPData.listarCarrinho();
  const produtos = itens
    .map(item => {
      const produto = PPData.obterProduto(item.id);
      return produto ? { ...produto, quantidade:Math.min(item.quantidade, produto.estoque) } : null;
    })
    .filter(Boolean);
  const e = PPData.escaparHTML.bind(PPData);

  if(!produtos.length){
    container.innerHTML = `
      ${mensagem ? `<div class="aviso-carrinho sucesso">${e(mensagem)}</div>` : ''}
      <div class="carrinho-vazio carrinho-largura-total">
        <svg viewBox="0 0 24 24" fill="none" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
        <h3>Seu carrinho está vazio</h3>
        <p>Explore nosso catálogo e adicione os produtos que desejar.</p>
        <a href="produtos.html" class="btn btn-primario">Ver produtos</a>
      </div>`;
    return;
  }

  const subtotal = produtos.reduce((soma, p) => soma + p.preco * p.quantidade, 0);
  const frete = subtotal >= 250 ? 0 : 22.9;
  const total = subtotal + frete;

  container.innerHTML = `
    ${mensagem ? `<div class="aviso-carrinho erro carrinho-largura-total">${e(mensagem)}</div>` : ''}
    <div class="lista-carrinho">
      ${produtos.map(p => `
        <article class="item-carrinho" data-item-id="${e(p.id)}">
          <div class="item-carrinho-imagem">
            <img src="${e(PPData.urlImagemSegura(p.imagem))}" alt="${e(p.nome)}">
          </div>
          <div>
            <div class="item-carrinho-nome">${e(p.nome)}</div>
            <div class="item-carrinho-cat">${e(PPData.nomeCategoria(p.categoria))}</div>
            <div class="item-carrinho-qty">
              <button class="qty-btn" type="button" data-acao="diminuir" aria-label="Diminuir quantidade de ${e(p.nome)}">−</button>
              <span aria-live="polite">${p.quantidade}</span>
              <button class="qty-btn" type="button" data-acao="aumentar"
                aria-label="Aumentar quantidade de ${e(p.nome)}" ${p.quantidade >= p.estoque ? 'disabled' : ''}>+</button>
            </div>
            <button class="item-remover" type="button" data-acao="remover">Remover</button>
          </div>
          <div class="item-carrinho-preco">${PPData.formatarPreco(p.preco * p.quantidade)}</div>
        </article>`).join('')}
      <a href="produtos.html" class="continuar-comprando">← Continuar comprando</a>
    </div>
    <aside class="resumo-pedido">
      <h3>Resumo do pedido</h3>
      <div class="resumo-linha"><span>Subtotal</span><strong>${PPData.formatarPreco(subtotal)}</strong></div>
      <div class="resumo-linha"><span>Frete estimado</span><strong>${frete === 0 ? 'Grátis' : PPData.formatarPreco(frete)}</strong></div>
      ${frete > 0 ? `<div class="aviso-frete">Faltam ${PPData.formatarPreco(250-subtotal)} para frete grátis</div>` : ''}
      <div class="resumo-total"><span>Total estimado</span><span class="preco-atual">${PPData.formatarPreco(total)}</span></div>
      <button class="btn btn-primario btn-bloco" type="button" data-acao="finalizar">Finalizar pedido de demonstração</button>
      <button class="btn btn-contorno btn-bloco btn-limpar" type="button" data-acao="limpar">Limpar carrinho</button>
      <small class="nota-checkout">O pagamento será integrado na etapa de backend.</small>
    </aside>`;
}

document.addEventListener('DOMContentLoaded', async () => {
  try { await PPApi.sincronizarProdutosPublicos(); }
  catch(erro) { console.error('Não foi possível atualizar o carrinho:', erro); }
  const container = document.querySelector('[data-carrinho-container]');
  container.addEventListener('click', evento => {
    const botao = evento.target.closest('[data-acao]');
    if(!botao) return;
    const item = botao.closest('[data-item-id]');
    const id = item?.dataset.itemId;
    const acao = botao.dataset.acao;
    const atual = id ? PPData.listarCarrinho().find(i => i.id === id)?.quantidade || 1 : 0;

    if(acao === 'diminuir'){
      if(atual <= 1) PPData.removerDoCarrinho(id);
      else PPData.atualizarQuantidadeCarrinho(id, atual - 1);
    }
    if(acao === 'aumentar') PPData.atualizarQuantidadeCarrinho(id, atual + 1);
    if(acao === 'remover') PPData.removerDoCarrinho(id);
    if(acao === 'limpar' && window.confirm('Deseja remover todos os produtos do carrinho?')) PPData.salvarCarrinho([]);
    if(acao === 'finalizar'){
      const resultado = PPData.finalizarPedidoDemo();
      renderCarrinho(resultado.ok
        ? `Pedido ${resultado.pedido.id} criado na demonstração.`
        : resultado.mensagem);
      return;
    }
    renderCarrinho();
  });
  renderCarrinho();
});
