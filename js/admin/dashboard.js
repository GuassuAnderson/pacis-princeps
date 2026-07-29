// Proteção: redireciona se não autenticado
  if(!PPData.adminAutenticado()) window.location.href = '../login.html';

  function mostrarToast(msg){ const t=document.getElementById('toast'); t.textContent=msg; t.classList.add('visivel'); setTimeout(()=>t.classList.remove('visivel'), 2800); }

  function renderizarMetricas(){
    const produtos = PPData.listarProdutos();
    const totalEstoque = produtos.reduce((s,p)=>s+p.estoque,0);
    const emPromocao = produtos.filter(p=>p.precoAntigo).length;
    const emDestaque = produtos.filter(p=>p.destaque).length;
    document.getElementById('grade-metricas').innerHTML = `
      <div class="card-metrica">
        <div class="card-metrica-top">
          <span class="card-metrica-label">Total de produtos</span>
          <div class="card-metrica-icone"><svg viewBox="0 0 24 24" fill="none" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18M16 10a4 4 0 0 1-8 0"/></svg></div>
        </div>
        <div class="card-metrica-valor">${produtos.length}</div>
        <div class="card-metrica-delta">Cadastrados no sistema</div>
      </div>
      <div class="card-metrica">
        <div class="card-metrica-top">
          <span class="card-metrica-label">Unidades em estoque</span>
          <div class="card-metrica-icone"><svg viewBox="0 0 24 24" fill="none" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-4 0v2M8 7V5a2 2 0 0 0-4 0v2"/></svg></div>
        </div>
        <div class="card-metrica-valor">${totalEstoque}</div>
        <div class="card-metrica-delta">Somadas todas as categorias</div>
      </div>
      <div class="card-metrica">
        <div class="card-metrica-top">
          <span class="card-metrica-label">Em promoção</span>
          <div class="card-metrica-icone"><svg viewBox="0 0 24 24" fill="none" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"/></svg></div>
        </div>
        <div class="card-metrica-valor">${emPromocao}</div>
        <div class="card-metrica-delta">Produtos com preço de oferta</div>
      </div>
      <div class="card-metrica">
        <div class="card-metrica-top">
          <span class="card-metrica-label">Em destaque</span>
          <div class="card-metrica-icone"><svg viewBox="0 0 24 24" fill="none" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div>
        </div>
        <div class="card-metrica-valor">${emDestaque}</div>
        <div class="card-metrica-delta">Exibidos na home da loja</div>
      </div>`;
  }

  function renderizarRecentes(){
    const produtos = PPData.listarProdutos().slice(0,5);
    const tbody = document.getElementById('tbody-recentes');
    if(!produtos.length){ tbody.innerHTML = '<tr><td colspan="5" class="tabela-vazia">Nenhum produto cadastrado.</td></tr>'; return; }
    tbody.innerHTML = produtos.map(p => `
      <tr>
        <td data-label="Produto">
          <div class="prod-nome-col">
            <img src="${p.imagem}" alt="${p.nome}" class="prod-imagem-mini">
            <div><strong>${p.nome}</strong><span>${p.id}</span></div>
          </div>
        </td>
        <td data-label="Categoria"><span class="badge-cat">${PPData.nomeCategoria(p.categoria)}</span></td>
        <td data-label="Preço"><span class="preco-tabela">${PPData.formatarPreco(p.preco)}</span></td>
        <td data-label="Estoque"><span class="${p.estoque > 5 ? 'badge-estoque-ok' : 'badge-estoque-baixo'}">${p.estoque} un.</span></td>
        <td data-label="Ações">
          <div class="acoes-tabela">
            <a href="produtos.html" class="btn-tabela btn-editar">Editar</a>
          </div>
        </td>
      </tr>`).join('');
  }

  document.getElementById('btn-sair').addEventListener('click', e => {
    e.preventDefault(); PPData.sairAdmin(); window.location.href = '../login.html';
  });

  const toggle = document.getElementById('menu-toggle-admin');
  const sidebar = document.getElementById('sidebar');
  toggle.addEventListener('click', () => sidebar.classList.toggle('aberta'));
  document.addEventListener('click', e => { if(!sidebar.contains(e.target) && !toggle.contains(e.target)) sidebar.classList.remove('aberta'); });

  renderizarMetricas();
  renderizarRecentes();
