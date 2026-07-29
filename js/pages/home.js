// Renderiza os produtos em destaque na home
  document.addEventListener('DOMContentLoaded', () => {
    const grade = document.querySelector('[data-grade-destaques]');
    const produtos = PPData.listarProdutos().filter(p => p.destaque).slice(0,4);
    const lista = produtos.length ? produtos : PPData.listarProdutos().slice(0,4);
    grade.innerHTML = lista.map(PPUI.cartaoProduto).join('');
    PPUI.ativarBotoesCarrinho(grade);
  });
