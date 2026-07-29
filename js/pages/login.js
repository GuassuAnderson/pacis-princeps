document.getElementById('form-login').addEventListener('submit', e => {
  e.preventDefault();
  const u = document.getElementById('usuario').value;
  const s = document.getElementById('senha').value;
  const erro = document.getElementById('erro-login');
  if(PPData.autenticarAdmin(u, s)){
    window.location.href = 'admin/dashboard.html';
  } else {
    erro.classList.add('visivel');
    document.getElementById('senha').value = '';
  }
});
