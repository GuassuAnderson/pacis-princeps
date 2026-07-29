if (!PPData.adminAutenticado()) window.location.href = '../login.html';

document.addEventListener('click', evento => {
  const tag = evento.target.closest('[data-editor-tag]')?.dataset.editorTag;
  if(tag) inserirTag(tag);
  const acao = evento.target.closest('[data-acao-conexao]')?.dataset.acaoConexao;
  if(acao === 'nova') abrirModalNova();
  if(acao === 'fechar') fecharModal();
  if(acao === 'citacao') inserirCitacao();
  if(acao === 'preview') togglePreview();
});

/* ---- Toast ---- */
function mostrarToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('visivel');
  setTimeout(() => t.classList.remove('visivel'), 2800);
}

/* ---- Fotos anexadas ---- */
let fotosAtivas = [];

function renderFotos() {
  const lista = document.getElementById('fotos-lista');
  lista.innerHTML = fotosAtivas.map((url, i) => `
    <div class="foto-miniatura">
      <img src="${PPData.escaparHTML(PPData.urlImagemSegura(url))}" alt="Foto ${i+1}">
      <button type="button" class="remover-foto" data-remover-foto="${i}" aria-label="Remover foto">
        <svg viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>
    </div>`).join('');
}

function removerFoto(i) {
  fotosAtivas.splice(i, 1);
  renderFotos();
}

document.getElementById('fotos-lista').addEventListener('click', evento => {
  const botao = evento.target.closest('[data-remover-foto]');
  if(botao) removerFoto(Number(botao.dataset.removerFoto));
});

document.getElementById('input-fotos-evento').addEventListener('change', async evento => {
  const arquivos = [...evento.target.files];
  if(!arquivos.length) return;
  const vagas = 8 - fotosAtivas.length;
  if(vagas <= 0){
    mostrarToast('O limite é de 8 fotos por edição.');
    evento.target.value = '';
    return;
  }
  evento.target.disabled = true;
  try{
    const processadas = [];
    for(const arquivo of arquivos.slice(0, vagas)){
      processadas.push(await PPImagem.processarArquivo(arquivo));
    }
    fotosAtivas.push(...processadas);
    renderFotos();
    mostrarToast(`${processadas.length} foto${processadas.length === 1 ? '' : 's'} adicionada${processadas.length === 1 ? '' : 's'}.`);
    if(arquivos.length > vagas) mostrarToast(`Foram adicionadas apenas ${vagas} fotos para respeitar o limite.`);
  } catch(erro){
    mostrarToast(erro.message);
  } finally {
    evento.target.value = '';
    evento.target.disabled = false;
  }
});

/* ---- Editor ---- */
function inserirTag(tag) {
  const ta = document.getElementById('ed-conteudo');
  const sel = ta.value.substring(ta.selectionStart, ta.selectionEnd);
  const ins = sel ? `<${tag}>${sel}</${tag}>` : `<${tag}>Texto aqui</${tag}>`;
  ta.setRangeText(ins, ta.selectionStart, ta.selectionEnd, 'end');
  ta.focus();
}

function inserirCitacao() {
  const ta = document.getElementById('ed-conteudo');
  const ins = `<blockquote style="border-left:3px solid var(--ouro);padding-left:20px;font-style:italic;color:var(--espresso);">Texto da citação</blockquote>`;
  ta.setRangeText(ins, ta.selectionStart, ta.selectionEnd, 'end');
  ta.focus();
}

let previewAberto = false;
function togglePreview() {
  const prev = document.getElementById('preview-conteudo');
  const ta = document.getElementById('ed-conteudo');
  previewAberto = !previewAberto;
  prev.hidden = !previewAberto;
  if (previewAberto) prev.innerHTML = ppSanitizarConteudo(ta.value || '<em>Sem conteúdo ainda</em>');
}

/* ---- Renderizar lista ---- */
function renderLista() {
  const todas = PPConexao.listarTodas().sort((a, b) => new Date(b.data) - new Date(a.data));
  const lista = document.getElementById('lista-edicoes');
  const vazio = document.getElementById('lista-vazia');

  if (!todas.length) {
    lista.innerHTML = '';
    vazio.hidden = false;
    return;
  }
  vazio.hidden = true;

  lista.innerHTML = todas.map(c => `
    <div class="card-edicao">
      <div class="card-edicao-foto">
        ${c.fotos?.[0]
          ? `<img src="${c.fotos[0]}" alt="${c.titulo}" onerror="this.style.display='none'">`
          : `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`}
      </div>
      <div class="card-edicao-corpo">
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          <h4>${c.titulo}</h4>
          <span class="badge-publicado ${c.publicado ? 'badge-pub-sim' : 'badge-pub-nao'}">${c.publicado ? 'Publicado' : 'Rascunho'}</span>
        </div>
        <div class="tema">Tema: ${c.tema}</div>
        <div class="meta">
          <span>
            <svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round"><path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7" r="4"/></svg>
            ${c.pregador}
          </span>
          <span>
            <svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
            ${PPConexao.formatarData(c.data)}
          </span>
          ${c.fotos?.length ? `<span>📷 ${c.fotos.length} foto${c.fotos.length !== 1 ? 's' : ''}</span>` : ''}
        </div>
        <p style="font-size:.82rem;color:var(--espresso-60);margin:4px 0 0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${c.resumo}</p>
      </div>
      <div class="card-edicao-acoes">
        <button class="btn-tabela btn-editar" onclick="editarEdicao('${c.id}')">Editar</button>
        <button class="btn-tabela" style="border-color:var(--areia-clara);color:var(--espresso-60)"
          onclick="togglePublicado('${c.id}', ${c.publicado})">
          ${c.publicado ? 'Despublicar' : 'Publicar'}
        </button>
        <button class="btn-tabela btn-excluir" onclick="excluirEdicao('${c.id}')">Excluir</button>
      </div>
    </div>`).join('');
}

/* ---- CRUD ---- */
function abrirModalNova() {
  document.getElementById('modal-titulo').textContent = 'Nova edição do Conexão';
  document.getElementById('ed-id').value = '';
  document.getElementById('form-edicao').reset();
  fotosAtivas = [];
  document.getElementById('input-fotos-evento').value = '';
  renderFotos();
  previewAberto = false;
  document.getElementById('preview-conteudo').hidden = true;
  document.getElementById('modal-overlay').classList.remove('oculto');
  document.getElementById('ed-titulo').focus();
}

function editarEdicao(id) {
  const c = PPConexao.obter(id);
  if (!c) return;
  document.getElementById('modal-titulo').textContent = 'Editar edição';
  document.getElementById('ed-id').value = c.id;
  document.getElementById('ed-titulo').value = c.titulo || '';
  document.getElementById('ed-tema').value = c.tema || '';
  document.getElementById('ed-data').value = c.data || '';
  document.getElementById('ed-pregador').value = c.pregador || '';
  document.getElementById('ed-cargo').value = c.cargo || '';
  document.getElementById('ed-resumo').value = c.resumo || '';
  document.getElementById('ed-conteudo').value = c.conteudo || '';
  document.getElementById('ed-publicado').checked = !!c.publicado;
  fotosAtivas = [...(c.fotos || [])];
  document.getElementById('input-fotos-evento').value = '';
  renderFotos();
  previewAberto = false;
  document.getElementById('preview-conteudo').hidden = true;
  document.getElementById('modal-overlay').classList.remove('oculto');
}

function fecharModal() {
  document.getElementById('modal-overlay').classList.add('oculto');
}

function salvarEdicao(e) {
  e.preventDefault();
  const id = document.getElementById('ed-id').value;
  const dados = {
    titulo:     document.getElementById('ed-titulo').value.trim(),
    tema:       document.getElementById('ed-tema').value.trim(),
    data:       document.getElementById('ed-data').value,
    pregador:   document.getElementById('ed-pregador').value.trim(),
    cargo:      document.getElementById('ed-cargo').value.trim(),
    resumo:     document.getElementById('ed-resumo').value.trim(),
    conteudo:   document.getElementById('ed-conteudo').value.trim(),
    publicado:  document.getElementById('ed-publicado').checked,
    fotos:      [...fotosAtivas]
  };
  try {
    if (id) { PPConexao.atualizar(id, dados); mostrarToast('Edição atualizada com sucesso!'); }
    else     { PPConexao.criar(dados);         mostrarToast('Edição criada com sucesso!'); }
  } catch(erro) {
    mostrarToast('Não há espaço no navegador para salvar todas as fotos. Remova algumas imagens.');
    return;
  }
  fecharModal();
  renderLista();
}

function togglePublicado(id, atual) {
  PPConexao.atualizar(id, { publicado: !atual });
  mostrarToast(atual ? 'Edição despublicada.' : 'Edição publicada no site!');
  renderLista();
}

function excluirEdicao(id) {
  const c = PPConexao.obter(id);
  if (!confirm(`Excluir "${c?.titulo}"? Esta ação não pode ser desfeita.`)) return;
  PPConexao.excluir(id);
  mostrarToast('Edição excluída.');
  renderLista();
}

/* ---- Fechar modal ---- */
document.getElementById('modal-overlay').addEventListener('click', e => {
  if (e.target === document.getElementById('modal-overlay')) fecharModal();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') fecharModal(); });

/* ---- Sair ---- */
document.getElementById('btn-sair').addEventListener('click', e => {
  e.preventDefault(); PPData.sairAdmin(); window.location.href = '../login.html';
});
document.getElementById('form-edicao').addEventListener('submit', salvarEdicao);

/* ---- Mobile sidebar ---- */
const toggle = document.getElementById('menu-toggle-admin');
const sidebar = document.getElementById('sidebar');
toggle.addEventListener('click', () => sidebar.classList.toggle('aberta'));
document.addEventListener('click', e => {
  if (!sidebar.contains(e.target) && !toggle.contains(e.target)) sidebar.classList.remove('aberta');
});

renderLista();
renderFotos();
