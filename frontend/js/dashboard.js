/**
 * HealthBridge – Patient & Doctor Dashboards (dashboard.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('patient-dashboard-view')) {
    initPatientDashboard();
  }
  if (document.getElementById('doctor-dashboard-view')) {
    initDoctorDashboard();
  }
});

// ==========================================
// 1. Patient Dashboard
// ==========================================
async function initPatientDashboard() {
  const user = getAuthUser();
  const welcomeText = document.getElementById('patient-welcome-name');
  if (welcomeText && user) {
    welcomeText.textContent = `Welcome, ${user.name}`;
  }

  // Load stats
  loadPatientStats(user ? user.userId : 1);

  // Load appointments
  loadPatientAppointments(user ? user.userId : 1);
}

async function loadPatientStats(userId) {
  try {
    const res = await fetch(`${API_BASE}/dashboard/patient/${userId}`);
    if (res.ok) {
      const stats = await res.json();
      document.getElementById('stat-upcoming').textContent = stats.upcomingAppointments || 0;
      document.getElementById('stat-completed').textContent = stats.completedAppointments || 0;
      document.getElementById('stat-cancelled').textContent = stats.cancelledAppointments || 0;
      document.getElementById('stat-emergencies').textContent = stats.totalEmergencies || 0;
    }
  } catch (e) {
    console.error('Stats load error', e);
  }
}

async function loadPatientAppointments(userId) {
  const upcomingContainer = document.getElementById('patient-upcoming-list');
  const historyContainer = document.getElementById('patient-history-list');

  try {
    const res = await fetch(`${API_BASE}/appointments/patient/${userId}`);
    if (!res.ok) throw new Error('Could not fetch appointments');
    const appointments = await res.json();

    const upcoming = appointments.filter(a => a.status === 'CONFIRMED' || a.status === 'PENDING');
    const past = appointments.filter(a => a.status === 'COMPLETED' || a.status === 'CANCELLED');

    // Render Upcoming
    if (upcomingContainer) {
      if (upcoming.length === 0) {
        upcomingContainer.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">📅</div>
            <h3>No upcoming appointments</h3>
            <p>You have no scheduled appointments currently booked.</p>
            <a href="hospitals.html" class="btn btn-primary btn-sm">Find Hospital & Book</a>
          </div>
        `;
      } else {
        upcomingContainer.innerHTML = upcoming.map(a => renderPatientAppointmentItem(a, true)).join('');
      }
    }

    // Render History
    if (historyContainer) {
      if (past.length === 0) {
        historyContainer.innerHTML = `
          <div class="empty-state">
            <p style="color:var(--text-muted);">No historical appointment records found.</p>
          </div>
        `;
      } else {
        historyContainer.innerHTML = past.map(a => renderPatientAppointmentItem(a, false)).join('');
      }
    }

  } catch (err) {
    if (upcomingContainer) {
      upcomingContainer.innerHTML = `<div class="empty-state"><h3>Error loading records: ${err.message}</h3></div>`;
    }
  }
}

function renderPatientAppointmentItem(a, isUpcoming) {
  const d = new Date(a.appointmentDate + 'T00:00:00');
  const day = d.getDate();
  const month = d.toLocaleDateString('en-US', { month: 'short' });

  const statusClass = a.status === 'CONFIRMED' ? 'status-confirmed' :
                      (a.status === 'COMPLETED' ? 'status-completed' :
                      (a.status === 'CANCELLED' ? 'status-cancelled' : 'status-pending'));

  return `
    <div class="appointment-item">
      <div class="appointment-main-info">
        <div class="appointment-date-badge">
          <div class="day">${day}</div>
          <div class="month">${month}</div>
        </div>
        <div class="appointment-details">
          <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.25rem;">
            <h4>${a.doctorName}</h4>
            <span class="card-badge badge-specialty">${a.specialization}</span>
            <span class="status-pill ${statusClass}">${a.status}</span>
          </div>
          <p>🏥 <strong>${a.hospitalName}</strong> • ⏰ ${a.appointmentTime} • Ref: <strong>${a.appointmentCode}</strong></p>
          ${a.reason ? `<p style="font-size:0.8rem; color:#475569; margin-top:0.25rem;">Reason: "${a.reason}"</p>` : ''}
        </div>
      </div>

      <div class="appointment-actions">
        ${isUpcoming ? `
          <a href="appointment-confirmation.html?id=${a.id}" class="btn btn-secondary btn-sm">View Details</a>
          <a href="appointment-date.html?doctorId=${a.doctorId}" class="btn btn-secondary btn-sm" title="Pick another date/time">Reschedule</a>
          <button onclick="cancelAppointment(${a.id})" class="btn btn-secondary btn-sm" style="color:var(--emergency); border-color:var(--emergency-border);">
            Cancel
          </button>
        ` : `
          <a href="appointment-confirmation.html?id=${a.id}" class="btn btn-secondary btn-sm">Receipt</a>
          <a href="specialists.html?hospitalId=${a.hospitalId}" class="btn btn-primary btn-sm">Book Again</a>
        `}
      </div>
    </div>
  `;
}

async function cancelAppointment(id) {
  if (!confirm('Are you sure you want to cancel this appointment? The slot will be released.')) return;

  try {
    const res = await fetch(`${API_BASE}/appointments/${id}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      showToast('Appointment cancelled successfully and slot released.', 'success');
      const user = getAuthUser();
      loadPatientStats(user ? user.userId : 1);
      loadPatientAppointments(user ? user.userId : 1);
    } else {
      throw new Error('Could not cancel appointment');
    }
  } catch (e) {
    showToast(e.message, 'error');
  }
}

// ==========================================
// 2. Doctor Dashboard
// ==========================================
async function initDoctorDashboard() {
  const user = getAuthUser();
  const doctorNameHeading = document.getElementById('doctor-name-heading');

  const doctorId = (user && user.doctorId) ? user.doctorId : 1;

  if (doctorNameHeading && user) {
    doctorNameHeading.textContent = `${user.name} Dashboard`;
  }

  loadDoctorStats(doctorId);
  loadDoctorAppointments(doctorId);
}

async function loadDoctorStats(doctorId) {
  try {
    const res = await fetch(`${API_BASE}/dashboard/doctor/${doctorId}`);
    if (res.ok) {
      const stats = await res.json();
      document.getElementById('doc-stat-today').textContent = stats.todayAppointments || 0;
      document.getElementById('doc-stat-upcoming').textContent = stats.upcomingAppointments || 0;
      document.getElementById('doc-stat-completed').textContent = stats.completedAppointments || 0;
      document.getElementById('doc-stat-cancelled').textContent = stats.cancelledAppointments || 0;
    }
  } catch (e) {
    console.error(e);
  }
}

async function loadDoctorAppointments(doctorId) {
  const container = document.getElementById('doctor-appointments-queue');
  if (!container) return;

  try {
    const res = await fetch(`${API_BASE}/appointments/doctor/${doctorId}`);
    if (!res.ok) throw new Error('Could not fetch doctor schedule');
    const list = await res.json();

    if (list.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🩺</div>
          <h3>No appointments scheduled</h3>
          <p>No patient appointments are booked for your schedule at this time.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = list.map(a => {
      const statusClass = a.status === 'CONFIRMED' ? 'status-confirmed' :
                          (a.status === 'COMPLETED' ? 'status-completed' :
                          (a.status === 'CANCELLED' ? 'status-cancelled' : 'status-pending'));

      return `
        <div class="appointment-item">
          <div class="appointment-main-info">
            <div class="user-avatar-placeholder" style="width:50px; height:50px; font-size:1.1rem; margin:0;">
              ${a.patientName.split(' ').map(n=>n[0]).join('').slice(0, 2)}
            </div>
            <div class="appointment-details">
              <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.25rem;">
                <h4>${a.patientName} (${a.patientAge || 'Adult'})</h4>
                <span class="status-pill ${statusClass}">${a.status}</span>
              </div>
              <p>📅 ${formatDate(a.appointmentDate)} • ⏰ <strong>${a.appointmentTime}</strong> • 📞 ${a.patientPhone}</p>
              ${a.reason ? `<p style="font-size:0.85rem; color:#475569; margin-top:0.25rem;">Reason: "${a.reason}"</p>` : ''}
            </div>
          </div>

          <div class="appointment-actions">
            ${a.status === 'CONFIRMED' ? `
              <button onclick="updateAptStatus(${a.id}, 'COMPLETED', ${doctorId})" class="btn btn-primary btn-sm">
                ✔ Mark Complete
              </button>
              <button onclick="updateAptStatus(${a.id}, 'CANCELLED', ${doctorId})" class="btn btn-secondary btn-sm" style="color:var(--emergency); border-color:var(--emergency-border);">
                Cancel
              </button>
            ` : (a.status === 'PENDING' ? `
              <button onclick="updateAptStatus(${a.id}, 'CONFIRMED', ${doctorId})" class="btn btn-primary btn-sm">
                Accept
              </button>
              <button onclick="updateAptStatus(${a.id}, 'CANCELLED', ${doctorId})" class="btn btn-secondary btn-sm">
                Reject
              </button>
            ` : `
              <span style="font-size:0.85rem; color:var(--text-muted); font-weight:600;">Action Completed</span>
            `)}
          </div>
        </div>
      `;
    }).join('');

  } catch (err) {
    container.innerHTML = `<div class="empty-state"><h3>${err.message}</h3></div>`;
  }
}

async function updateAptStatus(id, status, doctorId) {
  try {
    const res = await fetch(`${API_BASE}/appointments/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });

    if (res.ok) {
      showToast(`Appointment status changed to: ${status}`, 'success');
      loadDoctorStats(doctorId);
      loadDoctorAppointments(doctorId);
    } else {
      throw new Error('Failed to update appointment status');
    }
  } catch (e) {
    showToast(e.message, 'error');
  }
}
