/**
 * HealthBridge – Hospital Management & Details (hospitals.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('hospitals-container')) {
    loadHospitals();
    initHospitalFilters();
  }

  if (document.getElementById('hospital-details-container')) {
    loadHospitalDetails();
  }
});

let allHospitals = [];

async function loadHospitals() {
  const container = document.getElementById('hospitals-container');
  if (!container) return;

  container.innerHTML = `
    <div style="grid-column: 1/-1; text-align:center; padding:3rem;">
      <div class="loading-spinner" style="margin:0 auto 1rem;"></div>
      <p style="color:var(--text-muted);">Fetching hospitals from HealthBridge network...</p>
    </div>
  `;

  try {
    const res = await fetch(`${API_BASE}/hospitals`);
    if (!res.ok) throw new Error('Failed to load hospitals');
    allHospitals = await res.json();
    renderHospitalCards(allHospitals);
  } catch (err) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1;">
        <div class="empty-state-icon">🏥</div>
        <h3>Unable to load hospitals</h3>
        <p>${err.message}. Please check if the Spring Boot backend is active.</p>
        <button onclick="loadHospitals()" class="btn btn-secondary btn-sm">Try Again</button>
      </div>
    `;
  }
}

function initHospitalFilters() {
  const searchInput = document.getElementById('hospital-search');
  const citySelect = document.getElementById('hospital-city');
  const emergencyCheck = document.getElementById('hospital-emergency-only');

  const applyFilters = () => {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const city = citySelect ? citySelect.value.toLowerCase() : '';
    const emergencyOnly = emergencyCheck ? emergencyCheck.checked : false;

    const filtered = allHospitals.filter(h => {
      const matchQuery = !query ||
        h.name.toLowerCase().includes(query) ||
        h.address.toLowerCase().includes(query) ||
        (h.facilities && h.facilities.toLowerCase().includes(query));

      const matchCity = !city || h.city.toLowerCase() === city;
      const matchEmg = !emergencyOnly || h.emergencyAvailable === true;

      return matchQuery && matchCity && matchEmg;
    });

    renderHospitalCards(filtered);
  };

  if (searchInput) searchInput.addEventListener('input', applyFilters);
  if (citySelect) citySelect.addEventListener('change', applyFilters);
  if (emergencyCheck) emergencyCheck.addEventListener('change', applyFilters);
}

function renderHospitalCards(hospitals) {
  const container = document.getElementById('hospitals-container');
  if (!container) return;

  if (!hospitals || hospitals.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1;">
        <div class="empty-state-icon">🔍</div>
        <h3>No hospitals match your search</h3>
        <p>Try modifying your search criteria or resetting filters.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = hospitals.map(h => {
    const facilitiesList = h.facilities ? h.facilities.split(',').map(f => `<span class="card-badge" style="background:#f1f5f9; color:#475569; font-size:0.75rem;">${f.trim()}</span>`).slice(0, 4).join(' ') : '';
    const emgBadge = h.emergencyAvailable 
      ? `<span class="card-badge badge-available">🚨 Emergency 24x7</span>`
      : `<span class="card-badge badge-unavailable">Emergency Offline</span>`;
    
    return `
      <div class="hb-card">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.75rem;">
          <h3 style="font-size:1.25rem; font-weight:700; color:var(--primary-dark);">${h.name}</h3>
          ${emgBadge}
        </div>
        <p style="color:var(--text-muted); font-size:0.875rem; margin-bottom:0.75rem;">
          📍 ${h.address}, ${h.city}
        </p>

        <div style="background:var(--bg-surface); padding:0.75rem; border-radius:var(--radius-sm); margin-bottom:1rem; font-size:0.85rem;">
          <div style="display:flex; justify-content:space-between; margin-bottom:0.25rem;">
            <span style="color:var(--text-muted);">🕒 Timings:</span>
            <strong>${h.openingTime} - ${h.closingTime}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:0.25rem;">
            <span style="color:var(--text-muted);">🚑 Ambulance:</span>
            <strong style="color:${h.ambulanceAvailable ? 'var(--success)' : 'var(--text-muted)'};">${h.ambulanceAvailable ? 'Available' : 'Unavailable'}</strong>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span style="color:var(--text-muted);">📞 Contact:</span>
            <strong>${h.phone}</strong>
          </div>
        </div>

        <div style="display:flex; flex-wrap:wrap; gap:0.35rem; margin-bottom:1.25rem;">
          ${facilitiesList}
        </div>

        <div style="margin-top:auto; display:flex; gap:0.5rem;">
          <a href="hospital-details.html?id=${h.id}" class="btn btn-primary btn-block">View Hospital</a>
        </div>
      </div>
    `;
  }).join('');
}

async function loadHospitalDetails() {
  const container = document.getElementById('hospital-details-container');
  const hospitalId = getUrlParam('id');

  if (!hospitalId) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>Hospital ID Missing</h3>
        <p>Please select a hospital from the hospital directory.</p>
        <a href="hospitals.html" class="btn btn-primary btn-sm">Browse Hospitals</a>
      </div>
    `;
    return;
  }

  try {
    const [hRes, docRes] = await Promise.all([
      fetch(`${API_BASE}/hospitals/${hospitalId}`),
      fetch(`${API_BASE}/doctors/hospital/${hospitalId}`)
    ]);

    if (!hRes.ok) throw new Error('Hospital not found');
    const hospital = await hRes.json();
    const doctors = docRes.ok ? await docRes.json() : [];

    // Save selected hospital to sessionStorage for smooth flow navigation
    sessionStorage.setItem('hb_selected_hospital', JSON.stringify(hospital));

    // Render detailed view
    document.title = `${hospital.name} – HealthBridge`;
    
    const facilitiesBadges = hospital.facilities ? hospital.facilities.split(',').map(f => `
      <div style="background:#ffffff; border:1px solid var(--border-color); border-radius:var(--radius-sm); padding:0.6rem 1rem; display:flex; align-items:center; gap:0.5rem; font-weight:600; font-size:0.9rem;">
        <span style="color:var(--primary);">✔</span> ${f.trim()}
      </div>
    `).join('') : '';

    const doctorCards = doctors.length > 0 ? doctors.map(d => `
      <div class="hb-card" style="padding:1.2rem;">
        <div style="display:flex; align-items:center; gap:1rem; margin-bottom:0.75rem;">
          <div class="user-avatar-placeholder" style="width:50px; height:50px; font-size:1.2rem; margin:0;">
            ${d.name.split(' ').map(n=>n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <h4 style="font-weight:700; color:var(--text-main); font-size:1.05rem;">${d.name}</h4>
            <span class="card-badge badge-specialty">${d.specialization}</span>
          </div>
        </div>
        <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:0.5rem;">🎓 ${d.qualification}</p>
        <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1rem;">⏳ ${d.experience} Years Experience • 💳 ₹${d.consultationFee}</p>
        <div style="display:flex; gap:0.5rem; margin-top:auto;">
          <a href="doctor-details.html?doctorId=${d.id}&hospitalId=${hospital.id}" class="btn btn-secondary btn-sm btn-block">View Doctor</a>
          <a href="appointment-date.html?doctorId=${d.id}&hospitalId=${hospital.id}" class="btn btn-primary btn-sm btn-block">Book</a>
        </div>
      </div>
    `).join('') : `
      <div class="empty-state" style="grid-column: 1/-1;">
        <p>No doctors currently mapped to this hospital.</p>
      </div>
    `;

    container.innerHTML = `
      <div style="background:#ffffff; border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:2rem; margin-bottom:2rem; box-shadow:var(--shadow-sm);">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:1rem; margin-bottom:1.25rem;">
          <div>
            <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:0.4rem;">
              <h2 style="font-size:2.1rem; font-weight:800; color:var(--primary-dark);">${hospital.name}</h2>
              ${hospital.emergencyAvailable ? '<span class="card-badge badge-available">🚨 24/7 Emergency</span>' : ''}
              ${hospital.ambulanceAvailable ? '<span class="card-badge badge-available">🚑 Ambulance Ready</span>' : ''}
            </div>
            <p style="font-size:1rem; color:var(--text-muted);">📍 ${hospital.address}, ${hospital.city}</p>
          </div>
          
          <!-- Key Action Buttons -->
          <div style="display:flex; flex-wrap:wrap; gap:0.75rem;">
            <a href="specialists.html?hospitalId=${hospital.id}" class="btn btn-primary">
              📅 Book Appointment
            </a>
            <a href="doctors.html?hospitalId=${hospital.id}" class="btn btn-secondary">
              👨‍⚕️ Find Doctors
            </a>
            ${hospital.emergencyAvailable ? `
              <a href="emergency-request.html?hospitalId=${hospital.id}" class="btn btn-emergency">
                🚨 Emergency Care
              </a>
            ` : ''}
            <button onclick="window.open('https://maps.google.com/?q=${encodeURIComponent(hospital.name + ' ' + hospital.address)}', '_blank')" class="btn btn-secondary">
              🗺️ Get Directions
            </button>
          </div>
        </div>

        <p style="color:#334155; font-size:1rem; line-height:1.7; margin-bottom:1.75rem; max-width:850px;">
          ${hospital.description || 'Modern multispeciality healthcare institute offering comprehensive medical facilities, emergency critical care, and certified specialist physicians.'}
        </p>

        <!-- Quick Info Grid -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:1.25rem; background:var(--bg-surface); padding:1.25rem; border-radius:var(--radius-md); border:1px solid var(--border-color);">
          <div>
            <div style="font-size:0.8rem; color:var(--text-muted); font-weight:600; text-transform:uppercase;">Opening Hours</div>
            <div style="font-weight:700; color:var(--primary-dark); font-size:1rem; margin-top:0.2rem;">${hospital.openingTime} - ${hospital.closingTime}</div>
          </div>
          <div>
            <div style="font-size:0.8rem; color:var(--text-muted); font-weight:600; text-transform:uppercase;">Phone Helpline</div>
            <div style="font-weight:700; color:var(--primary-dark); font-size:1rem; margin-top:0.2rem;">${hospital.phone}</div>
          </div>
          <div>
            <div style="font-size:0.8rem; color:var(--text-muted); font-weight:600; text-transform:uppercase;">Emergency Status</div>
            <div style="font-weight:700; color:${hospital.emergencyAvailable ? 'var(--success)' : 'var(--emergency)'}; font-size:1rem; margin-top:0.2rem;">
              ${hospital.emergencyAvailable ? 'AVAILABLE & ACTIVE' : 'TEMPORARILY UNAVAILABLE'}
            </div>
          </div>
          <div>
            <div style="font-size:0.8rem; color:var(--text-muted); font-weight:600; text-transform:uppercase;">Ambulance Response</div>
            <div style="font-weight:700; color:var(--primary-dark); font-size:1rem; margin-top:0.2rem;">
              ${hospital.ambulanceAvailable ? 'ON-CALL 24/7' : 'NOT ASSIGNED'}
            </div>
          </div>
        </div>
      </div>

      <!-- Facilities Section -->
      <div style="margin-bottom:3rem;">
        <h3 style="font-size:1.4rem; font-weight:800; color:var(--primary-dark); margin-bottom:1rem;">🏥 Available Hospital Facilities</h3>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:1rem;">
          ${facilitiesBadges}
        </div>
      </div>

      <!-- Doctors At This Hospital -->
      <div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
          <h3 style="font-size:1.4rem; font-weight:800; color:var(--primary-dark);">👨‍⚕️ Doctors at this Hospital</h3>
          <a href="specialists.html?hospitalId=${hospital.id}" class="btn btn-secondary btn-sm">Filter by Specialist →</a>
        </div>
        <div class="cards-grid">
          ${doctorCards}
        </div>
      </div>
    `;

  } catch (err) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <h3>Failed to load hospital details</h3>
        <p>${err.message}</p>
        <a href="hospitals.html" class="btn btn-primary btn-sm">Back to Hospitals</a>
      </div>
    `;
  }
}
