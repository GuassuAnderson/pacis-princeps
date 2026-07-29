/* ==========================================================================
   PRINCEPS PACIS — Conexão: camada de dados e renderização pública
   Chave localStorage: pp_conexoes
   ========================================================================== */

const PP_CHAVE_CONEXOES = 'pp_conexoes';

const PP_CONEXOES_SEED = [
  {
    id: 'c001',
    titulo: 'Conexão #1 — Paz que o mundo não dá',
    tema: 'A Paz de Cristo',
    pregador: 'Pe. João da Silva',
    cargo: 'Pároco da Comunidade São José',
    data: '2024-08-10',
    resumo: 'Uma noite marcada pela presença do Espírito Santo e pela Palavra de Deus sobre a paz verdadeira que só Cristo pode dar. O Pe. João nos conduziu por uma reflexão profunda sobre João 14:27, mostrando como a paz de Cristo difere de toda paz que o mundo oferece.',
    conteudo: `<p>Ave Maria, cheia de graça — a primeira edição do Conexão Princeps Pacis ficou marcada pela sensação de que algo especial estava sendo inaugurado. Mais de cem pessoas se reuniram em oração, adoração e escuta da Palavra.</p>
<p>O Pe. João da Silva abriu a noite com uma oração intensa e depois nos conduziu por uma reflexão sobre João 14:27: "Deixo-vos a paz, dou-vos a minha paz; não vo-la dou como o mundo a dá". Durante quase uma hora, ele desmontou a falsa paz que o mundo oferece — a paz do conforto, do silêncio do medo, da ausência de conflito — e mostrou como a paz de Cristo é algo completamente diferente: uma paz que convive com a cruz, que não depende das circunstâncias e que nasce da certeza de que somos amados por Deus.</p>
<p>Santa Maria, Mãe de Deus, rogai por nós — muitos relataram que saíram da noite com o coração transformado, especialmente jovens que estavam passando por momentos difíceis e encontraram nessa pregação uma palavra de esperança concreta.</p>
<p>Que venha a próxima edição!</p>`,
    fotos: [],
    publicado: true
  },
  {
    id: 'c002',
    titulo: 'Conexão #2 — Maria, a mulher da fé',
    tema: 'A fé de Nossa Senhora',
    pregador: 'Diác. Marcos Andrade',
    cargo: 'Diácono Permanente',
    data: '2024-11-02',
    resumo: 'No mês de novembro, o Conexão trouxe uma reflexão belíssima sobre a fé de Nossa Senhora, partindo do Magnificat e chegando às nossas dificuldades do dia a dia.',
    conteudo: `<p>Ave Maria, cheia de graça — a segunda edição do Conexão aconteceu no mês de novembro, repleto de significado para a Igreja que recorda os fiéis defuntos e celebra todos os santos.</p>
<p>O Diácono Marcos Andrade conduziu uma meditação sobre o Magnificat (Lucas 1:46-55), mostrando que Maria não foi uma personagem passiva na história da salvação, mas uma mulher de fé ativa, que disse sim sem ver o caminho inteiro, que cantou a grandeza de Deus antes mesmo de ver os resultados.</p>
<p>Santa Maria, Mãe de Deus — a pregação desafiou cada participante a identificar em sua própria vida os momentos em que Deus pede um "sim" sem garantias, e a confiar como Maria confiou.</p>
<p>O momento de adoração após a pregação foi marcado por muitas lágrimas de gratidão e uma atmosfera de paz profunda. Rogai por nós pecadores, agora e na hora de nossa morte.</p>`,
    fotos: [],
    publicado: true
  }
];

function ppSanitizarConteudo(html = '') {
  const template = document.createElement('template');
  template.innerHTML = String(html);
  const permitidas = new Set(['P', 'STRONG', 'EM', 'BLOCKQUOTE', 'BR', 'UL', 'OL', 'LI']);
  template.content.querySelectorAll('*').forEach(elemento => {
    if(!permitidas.has(elemento.tagName)){
      elemento.replaceWith(document.createTextNode(elemento.textContent || ''));
      return;
    }
    [...elemento.attributes].forEach(atributo => elemento.removeAttribute(atributo.name));
  });
  return template.innerHTML;
}

const PPConexao = {
  garantirSeed() {
    if (!localStorage.getItem(PP_CHAVE_CONEXOES)) {
      localStorage.setItem(PP_CHAVE_CONEXOES, JSON.stringify(PP_CONEXOES_SEED));
    }
  },

  listar() {
    this.garantirSeed();
    try {
      const todas = JSON.parse(localStorage.getItem(PP_CHAVE_CONEXOES)) || [];
      return todas.filter(c => c.publicado).sort((a, b) => new Date(b.data) - new Date(a.data));
    } catch(e) { return []; }
  },

  listarTodas() {
    this.garantirSeed();
    try { return JSON.parse(localStorage.getItem(PP_CHAVE_CONEXOES)) || []; }
    catch(e) { return []; }
  },

  obter(id) { return this.listarTodas().find(c => c.id === id) || null; },

  salvarTodas(lista) { localStorage.setItem(PP_CHAVE_CONEXOES, JSON.stringify(lista)); },

  criar(dados) {
    const lista = this.listarTodas();
    dados.id = 'c' + Date.now();
    dados.fotos = dados.fotos || [];
    lista.unshift(dados);
    this.salvarTodas(lista);
    return dados;
  },

  atualizar(id, dados) {
    const lista = this.listarTodas();
    const i = lista.findIndex(c => c.id === id);
    if (i > -1) { lista[i] = { ...lista[i], ...dados }; this.salvarTodas(lista); }
  },

  excluir(id) { this.salvarTodas(this.listarTodas().filter(c => c.id !== id)); },

  formatarData(dataStr) {
    if (!dataStr) return '';
    const d = new Date(dataStr + 'T00:00:00');
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  }
};

/* ---- Renderização da página pública ---- */
function icFoto() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" style="width:36px;height:36px;stroke:var(--areia)"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`;
}

function htmlFoto(url, alt, extra) {
  if (url) return `<img src="${PPData.escaparHTML(PPData.urlImagemSegura(url))}" alt="${PPData.escaparHTML(alt || '')}" ${extra || ''}>`;
  return `<div class="foto-placeholder">${icFoto()}<strong>Foto do evento</strong></div>`;
}

function renderDestaque(c) {
  const wrap = document.getElementById('card-destaque-wrap');
  if (!wrap) return;
  wrap.innerHTML = `
    <a class="card-conexao-destaque" href="#" onclick="abrirConexao('${c.id}');return false;">
      <div class="card-destaque-foto">
        <span class="tag-mais-recente">Mais recente</span>
        ${htmlFoto(c.fotos?.[0], c.titulo)}
      </div>
      <div class="card-destaque-corpo">
        <span class="rotulo">Edição em destaque</span>
        <h2>${c.titulo}</h2>
        <span class="tema-tag">
          <svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          ${c.tema}
        </span>
        <div class="pregador-info">
          <div class="pregador-avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round"><path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div class="pregador-texto">
            <strong>${c.pregador}</strong>
            <span>${c.cargo || 'Pregador convidado'}</span>
          </div>
        </div>
        <p>${c.resumo}</p>
        <div class="card-meta">
          <span>
            <svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
            ${PPConexao.formatarData(c.data)}
          </span>
          ${c.fotos?.length ? `<span><svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>${c.fotos.length} foto${c.fotos.length !== 1 ? 's' : ''}</span>` : ''}
        </div>
        <span class="btn btn-primario" style="align-self:flex-start">Ver pregação completa</span>
      </div>
    </a>`;
}

function renderGrade(lista) {
  const grade = document.getElementById('grade-conexoes');
  if (!grade) return;
  grade.innerHTML = lista.map(c => `
    <a class="card-conexao" href="#" onclick="abrirConexao('${c.id}');return false;">
      <div class="card-conexao-foto">${htmlFoto(c.fotos?.[0], c.titulo)}</div>
      <div class="card-conexao-corpo">
        <span class="rotulo">Edição Conexão</span>
        <h3>${c.titulo}</h3>
        <span class="tema-tag">
          <svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          ${c.tema}
        </span>
        <p>${c.resumo}</p>
        <div class="card-conexao-rodape">
          <div class="card-meta">
            <span>
              <svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
              ${PPConexao.formatarData(c.data)}
            </span>
          </div>
          <span style="font-size:.82rem;color:var(--terracota);font-weight:600">Ler mais →</span>
        </div>
      </div>
    </a>`).join('');
}

function abrirConexao(id) {
  const c = PPConexao.obter(id);
  if (!c) return;
  const overlay = document.getElementById('modal-conexao');
  const inner = document.getElementById('modal-conexao-inner');
  const fotos = (c.fotos || []).slice(1); // 1ª foto já usada no topo
  inner.innerHTML = `
    <div class="modal-conexao-foto">
      ${htmlFoto(c.fotos?.[0], c.titulo)}
      <button class="modal-conexao-fechar" onclick="fecharConexao()" aria-label="Fechar">
        <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>
    </div>
    <div class="modal-conexao-corpo">
      <span class="rotulo">Edição Conexão · ${PPConexao.formatarData(c.data)}</span>
      <h2>${c.titulo}</h2>
      <span class="tema-tag" style="display:inline-flex;margin-bottom:6px">
        <svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        ${c.tema}
      </span>
      <div class="pregador-info">
        <div class="pregador-avatar">
          <svg viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round"><path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
        <div class="pregador-texto">
          <strong>${c.pregador}</strong>
          <span>${c.cargo || 'Pregador convidado'}</span>
        </div>
      </div>
      <div class="conteudo-pregacao">${ppSanitizarConteudo(c.conteudo || `<p>${PPData.escaparHTML(c.resumo)}</p>`)}</div>
      ${fotos.length ? `
        <h4 style="margin-top:28px;margin-bottom:4px;font-size:1rem">Fotos do evento</h4>
        <div class="galeria-modal">
          ${fotos.map(f => `<div class="galeria-modal-foto"><img src="${PPData.escaparHTML(PPData.urlImagemSegura(f))}" alt="Foto do evento"></div>`).join('')}
        </div>` : (c.fotos?.length === 0 ? '' : '')}
    </div>`;
  overlay.classList.remove('oculto');
  document.body.style.overflow = 'hidden';
}

function fecharConexao() {
  document.getElementById('modal-conexao').classList.add('oculto');
  document.body.style.overflow = '';
}

document.addEventListener('DOMContentLoaded', () => {
  PPConexao.garantirSeed();
  const todas = PPConexao.listar();
  const vazio = document.getElementById('conexoes-vazio');

  if (!todas.length) {
    vazio && (vazio.hidden = false);
    return;
  }
  vazio && (vazio.hidden = true);
  renderDestaque(todas[0]);
  if (todas.length > 1) renderGrade(todas.slice(1));

  document.getElementById('modal-conexao').addEventListener('click', e => {
    if (e.target === document.getElementById('modal-conexao')) fecharConexao();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') fecharConexao(); });
});
