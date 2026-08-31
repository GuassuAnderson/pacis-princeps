document.getElementById('form-contato').addEventListener('submit', e => {
  e.preventDefault();
  const aviso = document.getElementById('aviso-form');
  const mensagem = {
    id:'MSG-' + Date.now().toString(36).toUpperCase(),
    criadoEm:new Date().toISOString(),
    nome:document.getElementById('nome').value.trim(),
    email:document.getElementById('email').value.trim().toLowerCase(),
    assunto:document.getElementById('assunto').value,
    mensagem:document.getElementById('mensagem').value.trim()
  };
  let mensagens = [];
  try{ mensagens = JSON.parse(localStorage.getItem('pp_mensagens_demo')) || []; }catch(erro){}
  mensagens.unshift(mensagem);
  localStorage.setItem('pp_mensagens_demo', JSON.stringify(mensagens));
  aviso.textContent = `✓ Mensagem ${mensagem.id} salva nesta demonstração. O envio real será conectado ao backend.`;
  aviso.classList.add('visivel');
  e.target.reset();
  aviso.scrollIntoView({ behavior:'smooth', block:'nearest' });
  setTimeout(() => aviso.classList.remove('visivel'), 5000);
});
