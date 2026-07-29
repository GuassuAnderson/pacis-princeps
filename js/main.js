/* ==========================================================================
   PRINCEPS PACIS — Comportamentos globais do site (todas as páginas)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  PPData.garantirSeed();
  PPData.atualizarBadgeCarrinho();

  // Menu mobile
  const toggle = document.querySelector('[data-menu-toggle]');
  const links = document.querySelector('[data-nav-links]');
  if(toggle && links){
    toggle.addEventListener('click', () => {
      links.classList.toggle('aberto');
      const aberto = links.classList.contains('aberto');
      toggle.setAttribute('aria-expanded', aberto);
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      links.classList.remove('aberto');
      toggle.setAttribute('aria-expanded', 'false');
    }));
  }

  // Ano dinâmico no rodapé
  document.querySelectorAll('[data-ano]').forEach(el => el.textContent = new Date().getFullYear());

  // Marca o link de navegação ativo pela página atual
  const paginaAtual = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('[data-nav-links] a').forEach(a=>{
    const href = a.getAttribute('href');
    if(href === paginaAtual) a.classList.add('ativo');
  });

  // Newsletter (mock)
  const formNewsletter = document.querySelector('[data-form-newsletter]');
  if(formNewsletter){
    formNewsletter.addEventListener('submit', e=>{
      e.preventDefault();
      const btn = formNewsletter.querySelector('button');
      const input = formNewsletter.querySelector('input[type="email"]');
      const email = input.value.trim().toLowerCase();
      let inscritos = [];
      try{ inscritos = JSON.parse(localStorage.getItem('pp_newsletter_demo')) || []; }catch(e){}
      if(!inscritos.includes(email)){
        inscritos.push(email);
        localStorage.setItem('pp_newsletter_demo', JSON.stringify(inscritos));
      }
      const textoOriginal = btn.textContent;
      btn.textContent = inscritos.includes(email) ? 'Salvo nesta demonstração ✓' : 'Inscrito ✓';
      formNewsletter.reset();
      setTimeout(()=> btn.textContent = textoOriginal, 2200);
    });
  }
});
