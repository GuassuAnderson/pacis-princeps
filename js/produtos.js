/* ==========================================================================
   PACIS PRINCEPS — Catálogo: filtro, ordenação e renderização
   ========================================================================== */

(function(){
  let categoriaAtual = 'todas';
  let ordenacaoAtual = 'relevancia';

  function cartaoProduto(p){
    return PPUI.cartaoProduto(p);
  }

  function renderizar(){
    const grade = document.querySelector('[data-grade-catalogo]');
    const vazio = document.querySelector('[data-catalogo-vazio]');
    const contagem = document.querySelector('[data-contagem-resultados]');
    if(!grade) return;

    let lista = PPData.listarProdutos();
    if(categoriaAtual !== 'todas') lista = lista.filter(p => p.categoria === categoriaAtual);

    if(ordenacaoAtual === 'menor-preco') lista.sort((a,b) => a.preco - b.preco);
    else if(ordenacaoAtual === 'maior-preco') lista.sort((a,b) => b.preco - a.preco);
    else if(ordenacaoAtual === 'nome') lista.sort((a,b) => a.nome.localeCompare(b.nome));

    if(!lista.length){
      grade.innerHTML = '';
      vazio && (vazio.hidden = false);
    } else {
      vazio && (vazio.hidden = true);
      grade.innerHTML = lista.map(cartaoProduto).join('');
    }
    if(contagem) contagem.textContent = `${lista.length} produto${lista.length!==1?'s':''} encontrado${lista.length!==1?'s':''}`;
  }

  document.addEventListener('DOMContentLoaded', () => {
    // Verifica parâmetro de URL ?categoria=...
    const params = new URLSearchParams(location.search);
    const cat = params.get('categoria');
    const categoriasValidas = ['todas', ...PPData.categorias.map(c => c.id)];
    if(cat && categoriasValidas.includes(cat)){
      categoriaAtual = cat;
      document.querySelectorAll('[data-filtro-categoria] .filtro-item').forEach(btn => {
        btn.classList.toggle('ativo', btn.dataset.cat === cat);
      });
    }

    // Botões de categoria
    document.querySelectorAll('[data-filtro-categoria] .filtro-item').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-filtro-categoria] .filtro-item').forEach(b => b.classList.remove('ativo'));
        btn.classList.add('ativo');
        categoriaAtual = btn.dataset.cat;
        renderizar();
      });
    });
    document.querySelector('[data-limpar-filtros]')?.addEventListener('click', () => {
      document.querySelector('[data-filtro-categoria] [data-cat="todas"]')?.click();
    });

    // Ordenação
    const sel = document.querySelector('[data-ordenar]');
    if(sel) sel.addEventListener('change', e => { ordenacaoAtual = e.target.value; renderizar(); });

    const grade = document.querySelector('[data-grade-catalogo]');
    if(grade) PPUI.ativarBotoesCarrinho(grade);
    renderizar();
  });
})();
