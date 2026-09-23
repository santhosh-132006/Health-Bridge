/**
 * HealthBridge – Authentication Script (auth.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }

  // Handle URL query parameter ?tab=register
  const tabParam = getUrlParam('tab');
  if (tabParam === 'register') {
    switchAuthTab('register');
  }

  // If already logged in and directly accessing login.html, redirect to home content
  const currentUser = getAuthUser();
  const currentPath = window.location.pathname.toLowerCase();
  if (currentUser && (currentPath.endsWith('login.html') || currentPath.endsWith('register.html'))) {
    const redirect = sessionStorage.getItem('hb_redirect');
    if (redirect) {
      sessionStorage.removeItem('hb_redirect');
      window.location.replace(redirect);
    } else {
      window.location.replace('index.html');
    }
  }
});

// Segmented Tab Switcher (Sign In vs Register)
function switchAuthTab(tabName) {
  const loginTabBtn = document.getElementById('tab-btn-login');
  const registerTabBtn = document.getElementById('tab-btn-register');
  const loginPane = document.getElementById('login-tab-pane');
  const registerPane = document.getElementById('register-tab-pane');

  if (!loginTabBtn || !registerTabBtn || !loginPane || !registerPane) return;

  if (tabName === 'register') {
    loginTabBtn.classList.remove('active');
    loginTabBtn.setAttribute('aria-selected', 'false');
    registerTabBtn.classList.add('active');
    registerTabBtn.setAttribute('aria-selected', 'true');

    loginPane.classList.remove('active');
    registerPane.classList.add('active');
  } else {
    registerTabBtn.classList.remove('active');
    registerTabBtn.setAttribute('aria-selected', 'false');
    loginTabBtn.classList.add('active');
    loginTabBtn.setAttribute('aria-selected', 'true');

    registerPane.classList.remove('active');
    loginPane.classList.add('active');
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = 'Signing In...';
  submitBtn.disabled = true;

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Invalid email or password');
    }

    setAuthUser(data, data.token);
    showToast(`Welcome back, ${data.name}!`, 'success');

    // Route into the platform to show the remaining content
    setTimeout(() => {
      const redirect = sessionStorage.getItem('hb_redirect');
      if (redirect) {
        sessionStorage.removeItem('hb_redirect');
        window.location.href = redirect;
      } else if (data.role === 'DOCTOR') {
        window.location.href = 'doctor-dashboard.html';
      } else {
        window.location.href = 'index.html';
      }
    }, 700);

  } catch (err) {
    showToast(err.message, 'error');
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = 'Creating Account...';
  submitBtn.disabled = true;

  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const phone = document.getElementById('reg-phone').value.trim();
  const password = document.getElementById('reg-password').value;
  const role = document.getElementById('reg-role') ? document.getElementById('reg-role').value : 'PATIENT';

  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password, role })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    setAuthUser(data, data.token);
    showToast('Account created successfully! Welcome to HealthBridge.', 'success');

    // Route into the platform to show the remaining content
    setTimeout(() => {
      window.location.href = role === 'DOCTOR' ? 'doctor-dashboard.html' : 'index.html';
    }, 700);

  } catch (err) {
    showToast(err.message, 'error');
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }
}
