/**
 * HealthBridge – Smart Healthcare & Emergency Response Platform
 * Core Utilities & Navigation Script (main.js)
 */

const API_BASE = (window.location.port === '8080')
  ? `${window.location.origin}/api`
  : 'http://localhost:8080/api';

// Public pages that do NOT require login (emergency is always accessible!)
const PUBLIC_PAGES = [
  'login.html',
  'register.html',
  'forgot-password.html',
  'emergency.html',
  'emergency-request.html',
  'ambulance.html'
];

function checkPageAuth() {
  const currentPath = window.location.pathname.toLowerCase();
  const currentFile = currentPath.substring(currentPath.lastIndexOf('/') + 1) || 'index.html';

  const isPublic = PUBLIC_PAGES.some(p => currentFile === p || currentFile.startsWith(p.toLowerCase()));
  const user = getAuthUser();

  if (!isPublic && !user) {
    sessionStorage.setItem('hb_redirect', window.location.href);
    window.location.replace('login.html');
    return false;
  }
  return true;
}

// Loading Screen Handler
document.addEventListener('DOMContentLoaded', () => {
  if (!checkPageAuth()) return;
  initLoadingScreen();
  initNavbar();
  updateNotificationBadge();
});

function initLoadingScreen() {
  const overlay = document.getElementById('loading-overlay');
  if (!overlay) return;

  // Show splash for 900ms on first load or home visit, then smoothly fade out
  setTimeout(() => {
    overlay.classList.add('hidden');
    setTimeout(() => overlay.remove(), 600);
  }, 900);
}

// Global Toast Notifications
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const icon = type === 'error' ? '⚠️' : (type === 'warning' ? '🔔' : '✅');
  toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
  
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Authentication Helpers
function getAuthUser() {
  try {
    const userStr = localStorage.getItem('hb_user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    return null;
  }
}

function setAuthUser(user, token) {
  if (user) localStorage.setItem('hb_user', JSON.stringify(user));
  if (token) localStorage.setItem('hb_token', token);
}

function logout() {
  localStorage.removeItem('hb_user');
  localStorage.removeItem('hb_token');
  showToast('Logged out successfully', 'success');
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 600);
}

function requireAuth(roleRequired = null) {
  const user = getAuthUser();
  if (!user) {
    sessionStorage.setItem('hb_redirect', window.location.href);
    window.location.href = 'login.html';
    return null;
  }
  if (roleRequired && user.role !== roleRequired && user.role !== 'ADMIN') {
    showToast(`Access restricted to ${roleRequired.toLowerCase()} accounts.`, 'error');
    window.location.href = user.role === 'DOCTOR' ? 'doctor-dashboard.html' : 'patient-dashboard.html';
    return null;
  }
  return user;
}

// Navbar Authentication & Badges
function initNavbar() {
  const user = getAuthUser();
  const authContainer = document.getElementById('nav-auth-section');
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const navLinks = document.getElementById('nav-links');

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('show');
    });
  }

  if (authContainer) {
    if (user) {
      const dashboardLink = user.role === 'DOCTOR' ? 'doctor-dashboard.html' : 'patient-dashboard.html';
      const roleBadge = user.role === 'DOCTOR' ? '<span class="card-badge badge-specialty" style="font-size:0.7rem; margin-right:4px;">Dr</span>' : '';
      authContainer.innerHTML = `
        <div style="display:flex; align-items:center; gap:0.75rem;">
          <a href="${dashboardLink}" class="btn btn-secondary btn-sm" title="My Dashboard">
            ${roleBadge}<strong>${user.name}</strong>
          </a>
          <button onclick="logout()" class="btn btn-secondary btn-sm" title="Sign Out" style="color:var(--emergency); border-color:var(--emergency-border);">
            Sign Out
          </button>
        </div>
      `;
    } else {
      authContainer.innerHTML = `
        <div style="display:flex; align-items:center; gap:0.6rem;">
          <a href="login.html" class="btn btn-secondary btn-sm">Log In</a>
          <a href="register.html" class="btn btn-primary btn-sm">Register</a>
        </div>
      `;
    }
  }
}

async function updateNotificationBadge() {
  const badge = document.getElementById('notification-badge');
  if (!badge) return;

  const user = getAuthUser();
  if (!user) {
    badge.style.display = 'none';
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/notifications/unread-count?userId=${user.userId}`);
    if (res.ok) {
      const data = await res.json();
      if (data.unreadCount > 0) {
        badge.textContent = data.unreadCount > 9 ? '9+' : data.unreadCount;
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    }
  } catch (err) {
    badge.style.display = 'none';
  }
}

// Helper: Query parameter reader
function getUrlParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// Format Date for UI
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}
