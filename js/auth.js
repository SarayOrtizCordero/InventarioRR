// Maneja login, logout y protección de la sesión.

async function getCurrentProfile() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) return null;

  const { data: profile, error } = await supabaseClient
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', session.user.id)
    .single();

  if (error) {
    console.error('Error cargando perfil:', error.message);
    return null;
  }
  return profile;
}

// Redirige a index.html si no hay sesión activa. Úsalo en páginas protegidas.
async function requireSession() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    window.location.href = 'index.html';
    return null;
  }
  return session;
}

async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = 'index.html';
}

// --- Lógica exclusiva de la página de login ---
function initLoginForm() {
  const form = document.getElementById('login-form');
  if (!form) return;

  const errorBox = document.getElementById('login-error');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.textContent = '';

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

    if (error) {
      errorBox.textContent = 'Credenciales incorrectas o usuario no válido.';
      return;
    }

    window.location.href = 'dashboard.html';
  });

  // Si ya hay sesión activa, saltar directo al dashboard.
  supabaseClient.auth.getSession().then(({ data: { session } }) => {
    if (session) window.location.href = 'dashboard.html';
  });
}

document.addEventListener('DOMContentLoaded', initLoginForm);
