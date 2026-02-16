document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const msg = document.getElementById('loginMessage');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.textContent = '';
    try {
      const payload = {
        username: document.getElementById('loginUsername').value.trim(),
        password: document.getElementById('loginPassword').value
      };
      const res = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        msg.textContent = data.message || 'Login exitoso';
        msg.style.color = 'lightgreen';
        window.location.href = '/';
      } else {
        msg.textContent = data.error || 'Login inválido';
        msg.style.color = '#E74C3C';
      }
    } catch {
      msg.textContent = 'Error conectando al servidor';
      msg.style.color = '#E74C3C';
    }
  });
});
