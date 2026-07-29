/* Componentes e interações compartilhadas do catálogo. */
const PPUI = {
  cartaoProduto(produto){
    const p = PPData.normalizarProduto(produto);
    const e = PPData.escaparHTML.bind(PPData);
    const semEstoque = p.estoque < 1;
    return `
      <article class="cartao-produto">
        <a href="produto.html?id=${encodeURIComponent(p.id)}" class="cartao-produto-imagem">
          ${p.precoAntigo ? '<span class="selo-produto">Oferta</span>' : ''}
          ${semEstoque ? '<span class="selo-produto selo-esgotado">Esgotado</span>' : ''}
          <img src="${e(PPData.urlImagemSegura(p.imagem))}" alt="${e(p.nome)}" loading="lazy">
        </a>
        <div class="cartao-produto-corpo">
          <span class="rotulo">${e(PPData.nomeCategoria(p.categoria))}</span>
          <a href="produto.html?id=${encodeURIComponent(p.id)}"><h3>${e(p.nome)}</h3></a>
          <div class="cartao-produto-preco">
            <span class="preco-atual">${PPData.formatarPreco(p.preco)}</span>
            ${p.precoAntigo ? `<span class="preco-antigo">${PPData.formatarPreco(p.precoAntigo)}</span>` : ''}
          </div>
        </div>
        <div class="cartao-produto-acoes">
          <button class="btn btn-primario btn-bloco" type="button"
            data-adicionar-produto="${e(p.id)}" ${semEstoque ? 'disabled' : ''}>
            ${semEstoque ? 'Produto esgotado' : 'Adicionar ao carrinho'}
          </button>
        </div>
      </article>`;
  },

  ativarBotoesCarrinho(container = document){
    container.addEventListener('click', evento => {
      const botao = evento.target.closest('[data-adicionar-produto]');
      if(!botao) return;
      const resultado = PPData.adicionarAoCarrinho(botao.dataset.adicionarProduto);
      const textoOriginal = 'Adicionar ao carrinho';
      botao.textContent = resultado.ok ? 'Adicionado ✓' : resultado.mensagem;
      botao.disabled = true;
      window.setTimeout(() => {
        const produto = PPData.obterProduto(botao.dataset.adicionarProduto);
        botao.disabled = !produto || produto.estoque < 1;
        botao.textContent = botao.disabled ? 'Produto esgotado' : textoOriginal;
      }, 1800);
    });
  }
};
