document.getElementById('signin-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);

  const response = await fetch('/signin', {
    method: 'POST',
    body: new URLSearchParams(formData)
  });

  const msg = document.getElementById('signin-message');

  if (response.ok) {
    msg.textContent = await response.text();
    msg.style.color = 'green';
    window.location.href = '/index.html'
  } else {
    msg.textContent = await response.text();
    msg.style.color = 'red';
  }
});
