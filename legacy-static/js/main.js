/* ==========================================================================
   PACIS PRINCEPS — Comportamentos globais do site (todas as páginas)
   ==========================================================================

“Não tenhamos medo, pois o grupo de JESUS
 também teve dificuldades, nós com certeza também teremos.

Por isso, vamos pedir a Deus PAI que nos anime e
continue em nós, assim como JESUS fez em seu grupo”
*/

document.addEventListener('DOMContentLoaded', () => {
  PPData.garantirSeed();
  PPData.atualizarBadgeCarrinho();

  // Menu mobile
  const toggle = document.querySelector('[data-menu-toggle]');
  const links = document.querySelector('[data-nav-links]');
  if(toggle && links){
    const fecharMenu = () => {
      links.classList.remove('aberto');
      document.body.classList.remove('menu-aberto');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menu');
    };

    toggle.addEventListener('click', () => {
      links.classList.toggle('aberto');
      const aberto = links.classList.contains('aberto');
      document.body.classList.toggle('menu-aberto', aberto);
      toggle.setAttribute('aria-expanded', aberto);
      toggle.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', fecharMenu));
    document.addEventListener('keydown', e => {
      if(e.key === 'Escape') fecharMenu();
    });
    window.addEventListener('resize', () => {
      if(window.innerWidth > 860) fecharMenu();
    });
  }

  // Ano dinâmico no rodapé
  document.querySelectorAll('[data-ano]').forEach(el => el.textContent = new Date().getFullYear());

  // Atendimento rápido pelo WhatsApp em todas as páginas públicas
  const whatsapp = document.createElement('a');
  whatsapp.className = 'whatsapp-flutuante';
  whatsapp.href = 'https://wa.me/5545998625560?text=Ol%C3%A1%2C%20Pacis%20Princeps!%20Gostaria%20de%20mais%20informa%C3%A7%C3%B5es.';
  whatsapp.target = '_blank';
  whatsapp.rel = 'noopener noreferrer';
  whatsapp.setAttribute('aria-label', 'Conversar com a Pacis Princeps pelo WhatsApp');
  whatsapp.innerHTML = `
    <span class="whatsapp-flutuante-texto">Fale conosco</span>
    <span class="whatsapp-flutuante-icone" aria-hidden="true">
      <svg viewBox="0 0 32 32" fill="currentColor">
        <path d="M27.3 4.7A15.4 15.4 0 0 0 3.1 23.3L1 31l7.9-2.1A15.4 15.4 0 0 0 27.3 4.7Zm-11 23.1c-2.4 0-4.7-.6-6.7-1.8l-.5-.3-4.7 1.2 1.3-4.5-.3-.5a12.6 12.6 0 1 1 10.9 5.9Zm6.9-9.4c-.4-.2-2.2-1.1-2.6-1.2-.3-.1-.6-.2-.8.2-.2.4-1 1.2-1.2 1.5-.2.3-.4.3-.8.1-2.2-1.1-3.7-2-5.2-4.5-.4-.7.4-.7 1.1-2.2.1-.3 0-.6-.1-.8l-1.2-2.9c-.3-.7-.7-.6-1-.6h-.7c-.3 0-.7.1-1 .5-.3.4-1.3 1.3-1.3 3.2 0 1.9 1.4 3.7 1.6 4 .2.3 2.7 4.1 6.5 5.7 2.4 1 3.4 1.1 4.6.9 1.4-.2 2.2-1.3 2.5-2.5.3-1.2.3-2.2.2-2.4-.1-.2-.3-.3-.6-.5Z"/>
      </svg>
    </span>`;
  document.body.appendChild(whatsapp);

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
