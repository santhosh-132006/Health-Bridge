/**
 * HealthBridge – Accident & Ambulance Dispatch System (ambulance.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('ambulance-request-form')) {
    initAmbulanceForm();
  }
  if (document.getElementById('ambulance-tracking-view')) {
    initAmbulanceTracking();
  }
});

const AMB_STAGES = [
  { key: 'REQUEST_RECEIVED', label: 'Request Received' },
  { key: 'AMBULANCE_ASSIGNED', label: 'Ambulance Assigned' },
  { key: 'DRIVER_EN_ROUTE', label: 'Driver En Route' },
  { key: 'AMBULANCE_ARRIVED', label: 'Ambulance Arrived' },
  { key: 'PATIENT_PICKED_UP', label: 'Patient Picked Up' },
  { key: 'HOSPITAL_REACHED', label: 'Hospital Reached' }
];

function initAmbulanceForm() {
  const form = document.getElementById('ambulance-request-form');
  const typeParam = getUrlParam('type');
  if (typeParam) {
    const descField = document.getElementById('amb-description');
    if (descField && !descField.value) {
      descField.value = `Accident emergency response: ${typeParam}`;
    }
  }

  // Auto-fill logged in user info
  const user = getAuthUser();
  if (user) {
    const nameIn = document.getElementById('amb-patient-name');
    const phoneIn = document.getElementById('amb-patient-phone');
    if (nameIn && !nameIn.value) nameIn.value = user.name;
    if (phoneIn && !phoneIn.value && user.phone) phoneIn.value = user.phone;
  }

  // Geolocation quick button
  const gpsBtn = document.getElementById('amb-gps-btn');
  const locInput = document.getElementById('amb-pickup-location');
  if (gpsBtn && locInput) {
    gpsBtn.addEventListener('click', () => {
      if ('geolocation' in navigator) {
        gpsBtn.innerHTML = 'Acquiring GPS...';
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            locInput.value = `GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)} (Outer Ring Road Junction)`;
            gpsBtn.innerHTML = '✔ GPS Locked';
            showToast('Current GPS coordinates detected!', 'success');
          },
          (err) => {
            locInput.value = 'Sector 44, Express Highway Exit, Near Metro Pillar 140';
            gpsBtn.innerHTML = 'Default Location Used';
          }
        );
      }
    });
  }

  // Populate Hospital destination options
  loadDestinationHospitals();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = 'Dispatching Nearest Ambulance...';
    submitBtn.disabled = true;

    const patientName = document.getElementById('amb-patient-name').value.trim();
    const patientPhone = document.getElementById('amb-patient-phone').value.trim();
    const injuredCount = parseInt(document.getElementById('amb-injured-count').value, 10) || 1;
    const pickupLocation = document.getElementById('amb-pickup-location').value.trim();
    const description = document.getElementById('amb-description').value.trim();
    const hospitalId = document.getElementById('amb-destination-hospital').value;

    const payload = {
      patientName,
      patientPhone,
      injuredCount,
      pickupLocation,
      description,
      destinationHospitalId: hospitalId ? parseInt(hospitalId, 10) : null
    };

    try {
      const res = await fetch(`${API_BASE}/ambulance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Ambulance dispatch failed');

      sessionStorage.setItem('hb_last_ambulance', JSON.stringify(data));
      showToast(`Ambulance Dispatched! ID: ${data.requestCode}`, 'success');

      setTimeout(() => {
        window.location.href = `ambulance.html?id=${data.id}&code=${data.requestCode}&track=true`;
      }, 700);

    } catch (err) {
      showToast(err.message, 'error');
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  });
}

async function loadDestinationHospitals() {
  const select = document.getElementById('amb-destination-hospital');
  if (!select) return;

  try {
    const res = await fetch(`${API_BASE}/hospitals/emergency`);
    if (res.ok) {
      const hospitals = await res.json();
      select.innerHTML = '<option value="">-- Auto-Route to Closest Trauma Facility --</option>' +
        hospitals.map(h => `<option value="${h.id}">${h.name} (${h.city})</option>`).join('');
    }
  } catch (e) {}
}

async function initAmbulanceTracking() {
  const container = document.getElementById('ambulance-tracking-view');
  const isTracking = getUrlParam('track') === 'true';
  const ambId = getUrlParam('id');
  const ambCode = getUrlParam('code');

  if (!isTracking && !ambId && !ambCode) {
    container.style.display = 'none';
    return;
  }

  const formSection = document.getElementById('ambulance-form-section');
  if (formSection) formSection.style.display = 'none';
  container.style.display = 'block';

  let amb = null;
  try {
    if (ambId) {
      const res = await fetch(`${API_BASE}/ambulance/${ambId}`);
      if (res.ok) amb = await res.json();
    } else if (ambCode) {
      const res = await fetch(`${API_BASE}/ambulance/code/${ambCode}`);
      if (res.ok) amb = await res.json();
    }
  } catch (e) {
    console.warn(e);
  }

  if (!amb) {
    const saved = sessionStorage.getItem('hb_last_ambulance');
    if (saved) amb = JSON.parse(saved);
  }

  if (!amb) {
    container.innerHTML = `<div class="empty-state"><h3>Ambulance request not found</h3><a href="ambulance.html" class="btn btn-primary btn-sm">New Request</a></div>`;
    return;
  }

  renderAmbulanceProgress(amb);
}

function renderAmbulanceProgress(amb) {
  const container = document.getElementById('ambulance-tracking-view');

  const currentIdx = AMB_STAGES.findIndex(s => s.key === amb.status);
  const activeIdx = currentIdx >= 0 ? currentIdx : 1;

  container.innerHTML = `
    <div style="background:#ffffff; border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:2.5rem; max-width:850px; margin:0 auto; box-shadow:var(--shadow-lg);">
      
      <!-- Top Status Banner -->
      <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:1px solid var(--border-color); padding-bottom:1.5rem; margin-bottom:2rem; flex-wrap:wrap; gap:1rem;">
        <div>
          <span class="card-badge badge-emergency" style="font-size:0.85rem; margin-bottom:0.5rem;">Ambulance Response Mission</span>
          <h2 style="font-size:2rem; font-weight:800; color:var(--primary-dark);">Ambulance Request: ${amb.requestCode}</h2>
          <p style="color:var(--text-muted); font-size:0.95rem;">Patient: <strong>${amb.patientName}</strong> • Casualties: <strong>${amb.injuredCount}</strong></p>
        </div>
        <div style="text-align:right;">
          <div style="font-size:0.8rem; color:var(--text-muted); font-weight:600;">ESTIMATED TIME OF ARRIVAL</div>
          <div style="font-size:1.8rem; font-weight:800; color:var(--emergency);">6 - 8 Mins</div>
        </div>
      </div>

      <!-- 6-Stage Progression Timeline -->
      <div class="tracker-timeline">
        ${AMB_STAGES.map((stage, idx) => {
          let stateClass = '';
          if (idx < activeIdx) stateClass = 'completed';
          else if (idx === activeIdx) stateClass = 'active';

          return `
            <div class="tracker-step ${stateClass}">
              <div class="step-node">${idx < activeIdx ? '✓' : (idx + 1)}</div>
              <div class="step-label">${stage.label}</div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Live Dispatch Details Grid -->
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; background:var(--bg-surface); padding:1.5rem; border-radius:var(--radius-md); border:1px solid var(--border-color); margin-bottom:2rem;">
        <div>
          <div style="font-size:0.8rem; color:var(--text-muted); font-weight:700; text-transform:uppercase;">Vehicle & Unit Details</div>
          <div style="font-size:1.2rem; font-weight:800; color:var(--text-main); margin-top:0.25rem;">🚑 ${amb.ambulanceNumber || 'HB-AMB-04 (Advance Life Support)'}</div>
          <div style="font-size:0.95rem; color:var(--text-main); margin-top:0.4rem;">Driver: <strong>${amb.driverName || 'Vikram Rao'}</strong></div>
          <div style="margin-top:0.75rem;">
            <a href="tel:${amb.driverPhone || '+919876543210'}" class="btn btn-secondary btn-sm" style="font-weight:700;">
              📞 Call Driver (${amb.driverPhone || '+91 98765 43210'})
            </a>
          </div>
        </div>

        <div>
          <div style="font-size:0.8rem; color:var(--text-muted); font-weight:700; text-transform:uppercase;">Destination Hospital</div>
          <div style="font-size:1.15rem; font-weight:800; color:var(--primary-dark); margin-top:0.25rem;">
            🏥 ${amb.destinationHospital ? amb.destinationHospital.name : 'Apollo Multispeciality Hospital'}
          </div>
          <p style="font-size:0.85rem; color:var(--text-muted); margin-top:0.35rem;">
            📍 Pickup Location: <strong>${amb.pickupLocation}</strong>
          </p>
        </div>
      </div>

      <!-- Interactive Status Controller for Presentation Simulation -->
      <div style="background:var(--primary-subtle); border:1px dashed var(--primary-border); border-radius:var(--radius-md); padding:1.25rem; text-align:center;">
        <span style="font-size:0.85rem; font-weight:700; color:var(--primary-dark); display:block; margin-bottom:0.75rem;">
          [Simulation Controller: Step through Live Response Stages]
        </span>
        <div style="display:flex; justify-content:center; gap:0.5rem; flex-wrap:wrap;">
          ${AMB_STAGES.map(stage => `
            <button onclick="updateAmbulanceStatus(${amb.id}, '${stage.key}')" 
                    class="btn btn-secondary btn-sm"
                    style="${stage.key === amb.status ? 'background:var(--primary); color:#fff; border-color:var(--primary);' : ''}">
              ${stage.label}
            </button>
          `).join('')}
        </div>
      </div>

      <div style="text-align:center; margin-top:2rem;">
        <a href="ambulance.html" class="btn btn-secondary btn-sm">← Dispatch Another Unit</a>
      </div>
    </div>
  `;
}

async function updateAmbulanceStatus(id, status) {
  try {
    const res = await fetch(`${API_BASE}/ambulance/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      const updated = await res.json();
      renderAmbulanceProgress(updated);
      showToast(`Ambulance status updated to: ${status}`, 'success');
    }
  } catch (e) {
    showToast('Failed to update ambulance status', 'error');
  }
}
