/**
 * HealthBridge – Notifications Management (notifications.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('notifications-container')) {
    initNotificationsPage();
  }
});

let userNotifications = [];

async function initNotificationsPage() {
  const user = getAuthUser();
  const userId = user ? user.userId : 1; // default to seeded patient if guest preview

  loadNotifications(userId);

  const markAllBtn = document.getElementById('mark-all-read-btn');
  if (markAllBtn) {
    markAllBtn.addEventListener('click', () => markAllAsRead(userId));
  }

  const filterSelect = document.getElementById('notification-filter');
  if (filterSelect) {
    filterSelect.addEventListener('change', (e) => {
      filterNotifications(e.target.value);
    });
  }
}

async function loadNotifications(userId) {
  const container = document.getElementById('notifications-container');
  if (!container) return;

  try {
    const res = await fetch(`${API_BASE}/notifications?userId=${userId}`);
    if (!res.ok) throw new Error('Failed to load notifications');
    userNotifications = await res.json();
    renderNotificationList(userNotifications);
  } catch (err) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔔</div>
        <h3>No notifications</h3>
        <p>${err.message}</p>
      </div>
    `;
  }
}

function filterNotifications(filter) {
  if (filter === 'unread') {
    renderNotificationList(userNotifications.filter(n => !n.isRead));
  } else {
    renderNotificationList(userNotifications);
  }
}

function renderNotificationList(list) {
  const container = document.getElementById('notifications-container');
  if (!container) return;

  if (list.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📭</div>
        <h3>You are all caught up!</h3>
        <p>No new notifications at this time.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = list.map(n => {
    const icon = n.notificationType === 'EMERGENCY' ? '🚨' :
                 (n.notificationType === 'AMBULANCE' ? '🚑' :
                 (n.notificationType === 'APPOINTMENT' ? '📅' : '🔔'));

    const timeAgo = formatTimeAgo(n.createdAt);

    return `
      <div class="notification-card ${!n.isRead ? 'unread' : ''}" id="notice-${n.id}">
        <div class="notification-icon">${icon}</div>
        <div class="notification-body">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <h4 class="notification-title">${n.title}</h4>
            ${!n.isRead ? `
              <button onclick="markNotificationRead(${n.id})" class="btn btn-secondary btn-sm" style="font-size:0.75rem; padding:0.25rem 0.6rem;">
                Mark Read
              </button>
            ` : '<span style="font-size:0.75rem; color:var(--text-muted);">Read</span>'}
          </div>
          <p style="color:#334155; font-size:0.9rem; margin-top:0.25rem;">${n.message}</p>
          <div class="notification-time">${timeAgo}</div>
        </div>
      </div>
    `;
  }).join('');
}

async function markNotificationRead(id) {
  try {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'PUT' });
    if (res.ok) {
      const card = document.getElementById(`notice-${id}`);
      if (card) {
        card.classList.remove('unread');
      }
      const item = userNotifications.find(n => n.id === id);
      if (item) item.isRead = true;
      updateNotificationBadge();
    }
  } catch (e) {
    console.error(e);
  }
}

async function markAllAsRead(userId) {
  try {
    const res = await fetch(`${API_BASE}/notifications/read-all?userId=${userId}`, { method: 'PUT' });
    if (res.ok) {
      userNotifications.forEach(n => n.isRead = true);
      renderNotificationList(userNotifications);
      updateNotificationBadge();
      showToast('All notifications marked as read', 'success');
    }
  } catch (e) {
    showToast('Failed to mark all as read', 'error');
  }
}

function formatTimeAgo(dateTimeStr) {
  if (!dateTimeStr) return 'Just now';
  const d = new Date(dateTimeStr);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
