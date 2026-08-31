document.getElementById('form-login').addEventListener('submit', async e => {
  e.preventDefault();
  const u = document.getElementById('usuario').value;
  const s = document.getElementById('senha').value;
  const erro = document.getElementById('erro-login');
  const botao = e.currentTarget.querySelector('button[type="submit"]');
  botao.disabled = true;
  erro.classList.remove('visivel');
  try{
    await PPApi.login(u.trim().toLowerCase(), s);
    window.location.href = 'admin/dashboard.html';
  } catch(falha) {
    erro.textContent = falha.message;
    erro.classList.add('visivel');
    document.getElementById('senha').value = '';
  } finally {
    botao.disabled = false;
  }
});
