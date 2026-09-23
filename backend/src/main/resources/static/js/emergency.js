/**
 * HealthBridge – Emergency Center & Request Tracking (emergency.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('emergency-categories-grid')) {
    initEmergencyCategories();
    loadNearestEmergencyHospitals();
  }

  if (document.getElementById('emergency-request-form')) {
    initEmergencyRequestForm();
  }

  if (document.getElementById('emergency-tracker-view')) {
    initEmergencyTracker();
  }
});

const EMERGENCY_TYPES = [
  { id: 'accident', name: 'Accident', icon: '🚗', desc: 'Vehicular collision or severe physical trauma', isAmbulance: true },
  { id: 'snake_bite', name: 'Snake Bite', icon: '🐍', desc: 'Envenomation requiring urgent antivenom serum', isAmbulance: false },
  { id: 'chest_pain', name: 'Severe Chest Pain', icon: '❤️', desc: 'Possible cardiac arrest, myocardial infarction', isAmbulance: false },
  { id: 'severe_bleeding', name: 'Severe Bleeding', icon: '🩸', desc: 'Uncontrolled hemorrhage or deep lacerations', isAmbulance: false },
  { id: 'major_burns', name: 'Major Burns', icon: '🔥', desc: 'Thermal or chemical burn injuries needing trauma care', isAmbulance: false },
  { id: 'unconsciousness', name: 'Unconsciousness', icon: '🧠', desc: 'Syncope, stroke signs or neurological collapse', isAmbulance: false },
  { id: 'breathing_difficulty', name: 'Severe Breathing Difficulty', icon: '🫁', desc: 'Respiratory distress, acute anaphylaxis or hypoxia', isAmbulance: false },
  { id: 'other', name: 'Other Emergency', icon: '🚨', desc: 'Critical immediate medical intervention needed', isAmbulance: false }
];

function initEmergencyCategories() {
  const container = document.getElementById('emergency-categories-grid');
  if (!container) return;

  container.innerHTML = EMERGENCY_TYPES.map(emg => `
    <div class="quick-card emergency-card" style="cursor:pointer;" onclick="selectEmergencyCategory('${emg.name}', ${emg.isAmbulance})">
      <div class="quick-card-icon">${emg.icon}</div>
      <h3 class="quick-card-title">${emg.name}</h3>
      <p class="quick-card-desc">${emg.desc}</p>
      <span class="quick-card-link">
        ${emg.isAmbulance ? 'Request Ambulance →' : 'Seek Immediate Help →'}
      </span>
    </div>
  `).join('');
}

function selectEmergencyCategory(categoryName, isAmbulance) {
  if (isAmbulance) {
    window.location.href = `ambulance.html?type=${encodeURIComponent(categoryName)}`;
  } else {
    window.location.href = `emergency-request.html?type=${encodeURIComponent(categoryName)}`;
  }
}

async function loadNearestEmergencyHospitals() {
  const container = document.getElementById('nearest-emergency-hospitals');
  if (!container) return;

  try {
    const res = await fetch(`${API_BASE}/hospitals/emergency`);
    if (!res.ok) throw new Error('Could not load emergency hospitals');
    const hospitals = await res.json();

    if (hospitals.length === 0) {
      container.innerHTML = `<p style="color:var(--text-muted);">No emergency trauma centers detected nearby.</p>`;
      return;
    }

    // Mock realistic distances for demonstration
    const distances = ['1.8 km', '3.2 km', '4.7 km', '6.1 km', '7.5 km'];

    container.innerHTML = hospitals.map((h, idx) => `
      <div class="hb-card" style="border-left:4px solid var(--emergency);">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.5rem;">
          <div>
            <h4 style="font-size:1.15rem; font-weight:800; color:var(--primary-dark);">${h.name}</h4>
            <p style="color:var(--text-muted); font-size:0.85rem;">📍 ${h.address}, ${h.city}</p>
          </div>
          <span class="card-badge badge-emergency" style="font-size:0.85rem;">${distances[idx % distances.length]}</span>
        </div>

        <div style="display:flex; gap:0.5rem; margin-bottom:1rem; flex-wrap:wrap;">
          <span class="card-badge badge-available">Emergency: ACTIVE</span>
          <span class="card-badge badge-available">Ambulance: 24x7</span>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:auto;">
          <span style="font-size:0.9rem; font-weight:700; color:var(--primary-dark);">📞 ${h.phone}</span>
          <a href="emergency-request.html?hospitalId=${h.id}" class="btn btn-emergency btn-sm">Alert Hospital</a>
        </div>
      </div>
    `).join('');

  } catch (err) {
    container.innerHTML = `<p style="color:var(--emergency);">Error: ${err.message}</p>`;
  }
}

function initEmergencyRequestForm() {
  const form = document.getElementById('emergency-request-form');
  const typeParam = getUrlParam('type');
  const typeInput = document.getElementById('emergency-type');

  if (typeInput && typeParam) {
    typeInput.value = typeParam;
  }

  // Populate Hospital selector
  loadHospitalOptions();

  // Auto-detect Geolocation
  const geoBtn = document.getElementById('detect-location-btn');
  const locInput = document.getElementById('emergency-location');
  const latInput = document.getElementById('emergency-lat');
  const lngInput = document.getElementById('emergency-lng');

  if (geoBtn) {
    geoBtn.addEventListener('click', () => {
      if ('geolocation' in navigator) {
        geoBtn.innerHTML = '📍 Acquiring GPS...';
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude.toFixed(5);
            const lng = pos.coords.longitude.toFixed(5);
            latInput.value = lat;
            lngInput.value = lng;
            locInput.value = `GPS Coords: ${lat}, ${lng} (Auto-detected)`;
            geoBtn.innerHTML = '✔ Location Acquired';
            geoBtn.classList.remove('btn-secondary');
            geoBtn.classList.add('btn-primary');
            showToast('GPS coordinates acquired successfully!', 'success');
          },
          (err) => {
            locInput.value = 'New Delhi Central Medical Area (Approx)';
            latInput.value = '28.5355';
            lngInput.value = '77.2410';
            geoBtn.innerHTML = '📍 Use Default Medical GPS';
            showToast('Location permission denied or unavailable. Using local zone coordinates.', 'warning');
          }
        );
      }
    });
  }

  // Handle Form Submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = 'Transmitting SOS Request...';
    submitBtn.disabled = true;

    const patientName = document.getElementById('patient-name').value.trim();
    const patientPhone = document.getElementById('patient-phone').value.trim();
    const emergencyType = document.getElementById('emergency-type').value;
    const locationAddress = document.getElementById('emergency-location').value.trim();
    const latitude = parseFloat(document.getElementById('emergency-lat').value) || 28.5355;
    const longitude = parseFloat(document.getElementById('emergency-lng').value) || 77.2410;
    const hospitalId = document.getElementById('emergency-hospital').value;
    const description = document.getElementById('emergency-desc').value.trim();

    const payload = {
      patientName,
      patientPhone,
      emergencyType,
      locationAddress,
      latitude,
      longitude,
      hospitalId: hospitalId ? parseInt(hospitalId, 10) : null,
      description
    };

    try {
      const res = await fetch(`${API_BASE}/emergency`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Emergency request failed');

      sessionStorage.setItem('hb_last_emergency', JSON.stringify(data));
      showToast(`Emergency alert transmitted! ID: ${data.emergencyCode}`, 'success');

      setTimeout(() => {
        window.location.href = `emergency-request.html?id=${data.id}&code=${data.emergencyCode}&tracking=true`;
      }, 700);

    } catch (err) {
      showToast(err.message, 'error');
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  });
}

async function loadHospitalOptions() {
  const select = document.getElementById('emergency-hospital');
  if (!select) return;

  const preselected = getUrlParam('hospitalId');

  try {
    const res = await fetch(`${API_BASE}/hospitals/emergency`);
    if (res.ok) {
      const list = await res.json();
      select.innerHTML = '<option value="">-- Closest Available Trauma Center (Auto) --</option>' +
        list.map(h => `<option value="${h.id}" ${preselected == h.id ? 'selected' : ''}>${h.name} (${h.city})</option>`).join('');
    }
  } catch (e) {
    console.error(e);
  }
}

// Emergency Live Progression Tracker
const EMG_STAGES = [
  { key: 'REQUEST_RECEIVED', label: 'Request Received' },
  { key: 'HOSPITAL_ALERTED', label: 'Hospital Alerted' },
  { key: 'ASSISTANCE_ASSIGNED', label: 'Assistance Assigned' },
  { key: 'PATIENT_EN_ROUTE', label: 'Patient En Route' },
  { key: 'PATIENT_ARRIVED', label: 'Patient Arrived' }
];

async function initEmergencyTracker() {
  const container = document.getElementById('emergency-tracker-view');
  const isTracking = getUrlParam('tracking') === 'true';
  const emgId = getUrlParam('id');
  const emgCode = getUrlParam('code');

  if (!isTracking && !emgId && !emgCode) {
    container.style.display = 'none';
    return;
  }

  // Hide the entry form, show the tracking dashboard
  const formWrapper = document.getElementById('emergency-form-wrapper');
  if (formWrapper) formWrapper.style.display = 'none';
  container.style.display = 'block';

  let emg = null;
  try {
    if (emgId) {
      const res = await fetch(`${API_BASE}/emergency/${emgId}`);
      if (res.ok) emg = await res.json();
    } else if (emgCode) {
      const res = await fetch(`${API_BASE}/emergency/code/${emgCode}`);
      if (res.ok) emg = await res.json();
    }
  } catch (e) {
    console.warn(e);
  }

  if (!emg) {
    const saved = sessionStorage.getItem('hb_last_emergency');
    if (saved) emg = JSON.parse(saved);
  }

  if (!emg) {
    container.innerHTML = `<div class="empty-state"><h3>Emergency request not found</h3></div>`;
    return;
  }

  renderEmergencyTimeline(emg);
}

function renderEmergencyTimeline(emg) {
  const container = document.getElementById('emergency-tracker-view');
  
  const currentIdx = EMG_STAGES.findIndex(s => s.key === emg.status);
  const activeIdx = currentIdx >= 0 ? currentIdx : 1; // default alerted

  container.innerHTML = `
    <div style="background:#ffffff; border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:2.5rem; max-width:800px; margin:0 auto; box-shadow:var(--shadow-lg);">
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-color); padding-bottom:1.25rem; margin-bottom:2rem; flex-wrap:wrap; gap:1rem;">
        <div>
          <span class="card-badge badge-emergency" style="font-size:0.85rem; margin-bottom:0.4rem;">Emergency SOS Active</span>
          <h2 style="font-size:1.8rem; font-weight:800; color:var(--primary-dark);">Emergency Case: ${emg.emergencyCode}</h2>
          <p style="color:var(--text-muted); font-size:0.95rem;">Type: <strong>${emg.emergencyType}</strong> • Patient: <strong>${emg.patientName}</strong></p>
        </div>
        <div style="text-align:right;">
          <a href="tel:${emg.patientPhone}" class="btn btn-emergency btn-sm">📞 Call Helpline</a>
        </div>
      </div>

      <!-- Live Timeline -->
      <div class="tracker-timeline">
        ${EMG_STAGES.map((stage, idx) => {
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

      <div style="background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:1.25rem; margin-bottom:2rem;">
        <h4 style="font-weight:700; margin-bottom:0.5rem; color:var(--primary-dark);">🏥 Responding Trauma Facility</h4>
        <p style="font-weight:600; color:var(--text-main);">${emg.hospital ? emg.hospital.name : 'Apollo Multispeciality Hospital'}</p>
        <p style="font-size:0.85rem; color:var(--text-muted);">${emg.hospital ? emg.hospital.address : 'Mathura Road, New Delhi'}</p>
        <p style="font-size:0.85rem; color:var(--text-muted); margin-top:0.25rem;">📍 Location: ${emg.locationAddress || 'Acquired GPS location'}</p>
      </div>

      <!-- Simulation Controller for Demonstration -->
      <div style="background:var(--primary-subtle); border:1px dashed var(--primary-border); border-radius:var(--radius-md); padding:1rem; text-align:center;">
        <span style="font-size:0.85rem; font-weight:700; color:var(--primary-dark); display:block; margin-bottom:0.6rem;">
          [Demonstration Control: Advance Status in Real-Time]
        </span>
        <div style="display:flex; justify-content:center; gap:0.5rem; flex-wrap:wrap;">
          ${EMG_STAGES.map(stage => `
            <button onclick="updateEmergencyStatus(${emg.id}, '${stage.key}')" 
                    class="btn btn-secondary btn-sm" 
                    style="${stage.key === emg.status ? 'background:var(--primary); color:#fff; border-color:var(--primary);' : ''}">
              ${stage.label}
            </button>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

async function updateEmergencyStatus(id, status) {
  try {
    const res = await fetch(`${API_BASE}/emergency/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      const updated = await res.json();
      renderEmergencyTimeline(updated);
      showToast(`Status transitioned to: ${status}`, 'success');
    }
  } catch (e) {
    showToast('Failed to update status', 'error');
  }
}
