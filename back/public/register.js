document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');
  const msg = document.getElementById('registerMessage');
  const loader = document.querySelector('.loader');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.textContent = '';
    loader.classList.add('active');
    try {
      const payload = {
        username: document.getElementById('regUsername').value.trim(),
        password: document.getElementById('regPassword').value
      };
      const res = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        msg.textContent = data.message || 'Registro exitoso';
        msg.style.color = 'lightgreen';
        setTimeout(() => {
          loader.classList.add('active');
          setTimeout(() => {
            window.location.href = '/login';
          }, 1000);
        }, 2000);
      } else {
        msg.textContent = data.error || 'Registro inválido';
        msg.style.color = '#E74C3C';
      }
    } catch {
      msg.textContent = 'Error conectando al servidor';
      msg.style.color = '#E74C3C';
    } finally {
      loader.classList.remove('active');
    }
  });
});