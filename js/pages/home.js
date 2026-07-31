// Renderiza os produtos em destaque na home
  document.addEventListener('DOMContentLoaded', async () => {
    const grade = document.querySelector('[data-grade-destaques]');
    try { await PPApi.sincronizarProdutosPublicos(); }
    catch(erro) { console.error('Não foi possível atualizar os produtos:', erro); }
    const produtos = PPData.listarProdutos().filter(p => p.destaque).slice(0,4);
    const lista = produtos.length ? produtos : PPData.listarProdutos().slice(0,4);
    grade.innerHTML = lista.map(PPUI.cartaoProduto).join('');
    PPUI.ativarBotoesCarrinho(grade);
  });
