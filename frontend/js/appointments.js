/**
 * HealthBridge – Appointment Flow Navigation & Logic (appointments.js)
 * Manages separate dedicated pages:
 * hospital-details -> specialists -> doctors -> doctor-details -> appointment-date -> appointment-slot -> patient-details -> appointment-confirmation
 */

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('specialists-container')) {
    initSpecialistsPage();
  }
  if (document.getElementById('doctor-search-container')) {
    initDoctorSearchPage();
  }
  if (document.getElementById('doctor-details-view')) {
    initDoctorDetailsPage();
  }
  if (document.getElementById('appointment-date-container')) {
    initAppointmentDatePage();
  }
  if (document.getElementById('appointment-slot-container')) {
    initAppointmentSlotPage();
  }
  if (document.getElementById('patient-details-form')) {
    initPatientDetailsPage();
  }
  if (document.getElementById('confirmation-container')) {
    initConfirmationPage();
  }
});

// 1. Specialists Page
const SPECIALISTS_LIST = [
  { name: 'Cardiologist', label: 'Cardiology', desc: 'Heart and cardiovascular system care', icon: '❤️' },
  { name: 'Neurologist', label: 'Neurology', desc: 'Brain, nerves, and spinal disorders', icon: '🧠' },
  { name: 'Orthopedic Specialist', label: 'Orthopedics', desc: 'Bones, joints, and spine care', icon: '🦴' },
  { name: 'Dermatologist', label: 'Dermatology', desc: 'Skin, hair, nail, and aesthetic treatments', icon: '✨' },
  { name: 'Pediatrician', label: 'Pediatrics', desc: 'Child health, immunization, and growth', icon: '👶' },
  { name: 'Ophthalmologist', label: 'Ophthalmology', desc: 'Vision care, cataract, and laser retina treatments', icon: '👁️' },
  { name: 'ENT Specialist', label: 'ENT Care', desc: 'Ear, nose, throat, and sinus health', icon: '👂' },
  { name: 'Pulmonologist', label: 'Pulmonology', desc: 'Lungs, breathing, and asthma management', icon: '🫁' },
  { name: 'Gastroenterologist', label: 'Gastroenterology', desc: 'Digestive system, liver, and abdominal health', icon: '🩺' },
  { name: 'General Physician', label: 'General Medicine', desc: 'Primary consultations and wellness checkups', icon: '👨‍⚕️' }
];

function initSpecialistsPage() {
  const container = document.getElementById('specialists-container');
  const hospitalId = getUrlParam('hospitalId') || (sessionStorage.getItem('hb_selected_hospital') ? JSON.parse(sessionStorage.getItem('hb_selected_hospital')).id : '');
  
  const hospitalBadge = document.getElementById('selected-hospital-badge');
  if (hospitalBadge && hospitalId) {
    const savedHosp = sessionStorage.getItem('hb_selected_hospital');
    if (savedHosp) {
      const h = JSON.parse(savedHosp);
      hospitalBadge.innerHTML = `🏥 Hospital: <strong>${h.name}</strong>`;
      hospitalBadge.style.display = 'inline-flex';
    }
  }

  container.innerHTML = SPECIALISTS_LIST.map(spec => `
    <div class="hb-card" style="cursor:pointer; transition:var(--transition);" onclick="selectSpecialist('${spec.name}', '${hospitalId}')">
      <div style="font-size:2.5rem; margin-bottom:0.75rem;">${spec.icon}</div>
      <h3 style="font-size:1.25rem; font-weight:700; color:var(--primary-dark); margin-bottom:0.35rem;">${spec.label}</h3>
      <span class="card-badge badge-specialty" style="margin-bottom:0.75rem;">${spec.name}</span>
      <p style="color:var(--text-muted); font-size:0.875rem; margin-bottom:1.25rem; flex-grow:1;">${spec.desc}</p>
      <div style="margin-top:auto;">
        <button class="btn btn-secondary btn-sm btn-block" style="pointer-events:none;">
          Find ${spec.label} Specialists →
        </button>
      </div>
    </div>
  `).join('');
}

function selectSpecialist(specialistName, hospitalId) {
  sessionStorage.setItem('hb_selected_specialist', specialistName);
  let url = `doctors.html?specialist=${encodeURIComponent(specialistName)}`;
  if (hospitalId) url += `&hospitalId=${hospitalId}`;
  window.location.href = url;
}

// 2. Doctor Search Page
async function initDoctorSearchPage() {
  const container = document.getElementById('doctor-search-container');
  const specialistParam = getUrlParam('specialist');
  const hospitalIdParam = getUrlParam('hospitalId');
  const queryInput = document.getElementById('doctor-query');
  const filterSelect = document.getElementById('specialty-filter');

  if (filterSelect && specialistParam) {
    filterSelect.value = specialistParam;
  }

  const fetchAndRender = async () => {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align:center; padding:3rem;">
        <div class="loading-spinner" style="margin:0 auto 1rem;"></div>
        <p style="color:var(--text-muted);">Finding specialists...</p>
      </div>
    `;

    try {
      const q = queryInput ? queryInput.value.trim() : '';
      const spec = filterSelect ? filterSelect.value : (specialistParam || '');
      let url = `${API_BASE}/doctors/search?`;
      if (q) url += `query=${encodeURIComponent(q)}&`;
      if (spec) url += `specialization=${encodeURIComponent(spec)}&`;
      if (hospitalIdParam) url += `hospitalId=${hospitalIdParam}&`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('Could not fetch doctors');
      const doctors = await res.json();
      renderDoctorCards(doctors, hospitalIdParam);
    } catch (err) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1/-1;">
          <h3>No doctors found</h3>
          <p>${err.message}</p>
        </div>
      `;
    }
  };

  if (queryInput) queryInput.addEventListener('input', fetchAndRender);
  if (filterSelect) filterSelect.addEventListener('change', fetchAndRender);

  fetchAndRender();
}

function renderDoctorCards(doctors, hospitalId) {
  const container = document.getElementById('doctor-search-container');
  if (!doctors || doctors.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1;">
        <div class="empty-state-icon">👨‍⚕️</div>
        <h3>No doctors are available for this search</h3>
        <p>Try selecting a different specialty or clearing filters.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = doctors.map(d => `
    <div class="hb-card">
      <div style="display:flex; align-items:center; gap:1rem; margin-bottom:1rem;">
        <div class="user-avatar-placeholder" style="width:64px; height:64px; font-size:1.4rem; margin:0;">
          ${d.name.split(' ').map(n=>n[0]).join('').slice(0, 2)}
        </div>
        <div>
          <h3 style="font-size:1.2rem; font-weight:700; color:var(--primary-dark);">${d.name}</h3>
          <span class="card-badge badge-specialty">${d.specialization}</span>
        </div>
      </div>

      <div style="background:var(--bg-surface); padding:0.85rem; border-radius:var(--radius-sm); margin-bottom:1rem; font-size:0.85rem;">
        <p style="margin-bottom:0.35rem;"><strong>🏥 Hospital:</strong> ${d.hospital ? d.hospital.name : 'HealthBridge Partner Hospital'}</p>
        <p style="margin-bottom:0.35rem;"><strong>🎓 Qualifications:</strong> ${d.qualification}</p>
        <p style="margin-bottom:0.35rem;"><strong>⏳ Experience:</strong> ${d.experience} Years</p>
        <p><strong>💳 Consultation Fee:</strong> ₹${d.consultationFee}</p>
      </div>

      <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1.25rem;">
        📅 Available Days: <strong>${d.availableDays || 'Mon, Wed, Fri'}</strong>
      </p>

      <div style="margin-top:auto; display:flex; gap:0.6rem;">
        <a href="doctor-details.html?doctorId=${d.id}${hospitalId ? `&hospitalId=${hospitalId}` : ''}" class="btn btn-secondary btn-block btn-sm">
          View Profile
        </a>
        <a href="appointment-date.html?doctorId=${d.id}${hospitalId ? `&hospitalId=${hospitalId}` : ''}" class="btn btn-primary btn-block btn-sm">
          Select Date →
        </a>
      </div>
    </div>
  `).join('');
}

// 3. Doctor Details Page
async function initDoctorDetailsPage() {
  const container = document.getElementById('doctor-details-view');
  const doctorId = getUrlParam('doctorId');
  const hospitalId = getUrlParam('hospitalId');

  if (!doctorId) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>Doctor ID Missing</h3>
        <p>Please select a doctor from the doctor listing.</p>
        <a href="doctors.html" class="btn btn-primary btn-sm">Find Doctors</a>
      </div>
    `;
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/doctors/${doctorId}`);
    if (!res.ok) throw new Error('Doctor not found');
    const doctor = await res.json();

    sessionStorage.setItem('hb_selected_doctor', JSON.stringify(doctor));

    container.innerHTML = `
      <div style="background:#ffffff; border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:2.5rem; box-shadow:var(--shadow-sm); margin-bottom:2rem;">
        <div style="display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:1.5rem; margin-bottom:2rem;">
          <div style="display:flex; gap:1.5rem; align-items:center;">
            <div class="user-avatar-placeholder" style="width:90px; height:90px; font-size:2.2rem; margin:0;">
              ${doctor.name.split(' ').map(n=>n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <h2 style="font-size:2rem; font-weight:800; color:var(--primary-dark);">${doctor.name}</h2>
              <div style="display:flex; gap:0.5rem; align-items:center; margin-top:0.35rem;">
                <span class="card-badge badge-specialty" style="font-size:0.9rem;">${doctor.specialization}</span>
                <span class="card-badge badge-available">Verified Specialist</span>
              </div>
              <p style="color:var(--text-muted); font-size:0.95rem; margin-top:0.5rem;">
                🏥 Associated with <strong>${doctor.hospital ? doctor.hospital.name : 'HealthBridge Medical Center'}</strong>
              </p>
            </div>
          </div>

          <div style="text-align:right;">
            <div style="font-size:0.85rem; color:var(--text-muted);">Consultation Fee</div>
            <div style="font-size:1.8rem; font-weight:800; color:var(--primary-dark);">₹${doctor.consultationFee}</div>
            <a href="appointment-date.html?doctorId=${doctor.id}${hospitalId ? `&hospitalId=${hospitalId}` : ''}" class="btn btn-primary btn-lg" style="margin-top:0.75rem;">
              📅 Select Date & Book →
            </a>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:1rem; background:var(--bg-surface); padding:1.25rem; border-radius:var(--radius-md); border:1px solid var(--border-color); margin-bottom:2rem;">
          <div>
            <div style="font-size:0.8rem; color:var(--text-muted); font-weight:600; text-transform:uppercase;">Qualifications</div>
            <div style="font-weight:700; color:var(--text-main); font-size:0.95rem; margin-top:0.2rem;">${doctor.qualification}</div>
          </div>
          <div>
            <div style="font-size:0.8rem; color:var(--text-muted); font-weight:600; text-transform:uppercase;">Experience</div>
            <div style="font-weight:700; color:var(--text-main); font-size:0.95rem; margin-top:0.2rem;">${doctor.experience} Years Active Practice</div>
          </div>
          <div>
            <div style="font-size:0.8rem; color:var(--text-muted); font-weight:600; text-transform:uppercase;">Available Schedule</div>
            <div style="font-weight:700; color:var(--text-main); font-size:0.95rem; margin-top:0.2rem;">${doctor.availableDays}</div>
          </div>
          <div>
            <div style="font-size:0.8rem; color:var(--text-muted); font-weight:600; text-transform:uppercase;">Hospital Location</div>
            <div style="font-weight:700; color:var(--text-main); font-size:0.95rem; margin-top:0.2rem;">${doctor.hospital ? doctor.hospital.city : 'Central'}</div>
          </div>
        </div>

        <div>
          <h3 style="font-size:1.25rem; font-weight:800; color:var(--primary-dark); margin-bottom:0.75rem;">About Doctor</h3>
          <p style="color:#334155; line-height:1.7; font-size:1rem;">
            ${doctor.bio || 'Expert medical specialist committed to delivering exceptional patient care, advanced diagnostics, and targeted treatment plans.'}
          </p>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>Doctor profile not found</h3>
        <p>${err.message}</p>
        <a href="doctors.html" class="btn btn-primary btn-sm">Back to Doctors</a>
      </div>
    `;
  }
}

// 4. Appointment Date Selection Page
async function initAppointmentDatePage() {
  const container = document.getElementById('appointment-date-container');
  const doctorId = getUrlParam('doctorId');
  const hospitalId = getUrlParam('hospitalId');

  if (!doctorId) {
    container.innerHTML = `<div class="empty-state"><h3>Doctor not specified</h3><a href="doctors.html" class="btn btn-primary btn-sm">Choose Doctor</a></div>`;
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/doctors/${doctorId}`);
    if (!res.ok) throw new Error('Doctor not found');
    const doctor = await res.json();
    sessionStorage.setItem('hb_selected_doctor', JSON.stringify(doctor));

    // Render doctor overview card
    const summaryCard = document.getElementById('booking-doctor-summary');
    if (summaryCard) {
      summaryCard.innerHTML = `
        <div style="display:flex; align-items:center; gap:1rem;">
          <div class="user-avatar-placeholder" style="width:54px; height:54px; font-size:1.2rem; margin:0;">
            ${doctor.name.split(' ').map(n=>n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <h4 style="font-size:1.15rem; font-weight:700; color:var(--primary-dark);">${doctor.name}</h4>
            <p style="color:var(--text-muted); font-size:0.875rem;">${doctor.specialization} • ${doctor.hospital ? doctor.hospital.name : 'Hospital'}</p>
            <p style="color:var(--primary); font-size:0.85rem; font-weight:700;">💳 Fee: ₹${doctor.consultationFee}</p>
          </div>
        </div>
      `;
    }

    // Generate dates for next 7 days
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      dates.push({
        iso: iso,
        weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
        day: d.getDate(),
        month: d.toLocaleDateString('en-US', { month: 'short' })
      });
    }

    container.innerHTML = `
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:1rem; margin-top:1.5rem;">
        ${dates.map((d, index) => `
          <div class="hb-card date-card-option" style="cursor:pointer; text-align:center; padding:1.25rem 0.5rem; transition:var(--transition); border-width:2px;"
               onclick="selectAppointmentDate('${d.iso}', '${doctor.id}', '${hospitalId || ''}')">
            <div style="font-size:0.85rem; font-weight:700; text-transform:uppercase; color:${index === 0 ? 'var(--primary)' : 'var(--text-muted)'}; margin-bottom:0.35rem;">
              ${index === 0 ? 'Today' : (index === 1 ? 'Tomorrow' : d.weekday)}
            </div>
            <div style="font-size:2rem; font-weight:800; color:var(--primary-dark); line-height:1.1;">${d.day}</div>
            <div style="font-size:0.85rem; font-weight:600; color:var(--text-muted); margin-top:0.25rem;">${d.month}</div>
            <div style="margin-top:0.75rem;">
              <span class="card-badge badge-available" style="font-size:0.7rem;">Slots Open</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;

  } catch (err) {
    container.innerHTML = `<div class="empty-state"><h3>${err.message}</h3></div>`;
  }
}

function selectAppointmentDate(dateIso, doctorId, hospitalId) {
  sessionStorage.setItem('hb_selected_date', dateIso);
  let url = `appointment-slot.html?doctorId=${doctorId}&date=${dateIso}`;
  if (hospitalId) url += `&hospitalId=${hospitalId}`;
  window.location.href = url;
}

// 5. Appointment Slot Selection Page
async function initAppointmentSlotPage() {
  const container = document.getElementById('appointment-slot-container');
  const doctorId = getUrlParam('doctorId');
  const dateStr = getUrlParam('date');
  const hospitalId = getUrlParam('hospitalId');

  if (!doctorId || !dateStr) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>Missing Doctor or Date</h3>
        <a href="appointment-date.html?doctorId=${doctorId || ''}" class="btn btn-primary btn-sm">Select Date</a>
      </div>
    `;
    return;
  }

  // Display summary header
  const dateHeader = document.getElementById('slot-selected-date-text');
  if (dateHeader) {
    dateHeader.textContent = formatDate(dateStr);
  }

  try {
    const [docRes, slotRes] = await Promise.all([
      fetch(`${API_BASE}/doctors/${doctorId}`),
      fetch(`${API_BASE}/doctors/${doctorId}/slots?date=${dateStr}`)
    ]);

    if (!docRes.ok) throw new Error('Doctor not found');
    const doctor = await docRes.json();
    const slots = slotRes.ok ? await slotRes.json() : [];

    // Render doctor summary
    const summaryCard = document.getElementById('booking-doctor-summary');
    if (summaryCard) {
      summaryCard.innerHTML = `
        <div style="display:flex; align-items:center; gap:1rem;">
          <div class="user-avatar-placeholder" style="width:50px; height:50px; font-size:1.1rem; margin:0;">
            ${doctor.name.split(' ').map(n=>n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <h4 style="font-size:1.1rem; font-weight:700; color:var(--primary-dark);">${doctor.name}</h4>
            <p style="color:var(--text-muted); font-size:0.85rem;">${doctor.specialization} • ${doctor.hospital ? doctor.hospital.name : 'Hospital'}</p>
          </div>
        </div>
      `;
    }

    if (!slots || slots.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">⏰</div>
          <h3>No slots scheduled for this date</h3>
          <p>Please choose a different date to view available appointment times.</p>
          <a href="appointment-date.html?doctorId=${doctorId}" class="btn btn-secondary btn-sm">Change Date</a>
        </div>
      `;
      return;
    }

    // Render slots divided by Morning and Afternoon
    const morningSlots = slots.filter(s => s.startTime.includes('AM'));
    const afternoonSlots = slots.filter(s => s.startTime.includes('PM'));

    const renderSlotButtons = (slotList) => {
      return slotList.map(s => {
        const isBooked = s.slotStatus === 'BOOKED' || s.slotStatus === 'BLOCKED';
        if (isBooked) {
          return `
            <button class="btn btn-secondary btn-sm" disabled style="opacity:0.5; background:#f1f5f9; cursor:not-allowed; border-style:dashed;">
              ${s.startTime} <span style="font-size:0.7rem; color:var(--text-muted);">(Booked)</span>
            </button>
          `;
        } else {
          return `
            <button class="btn btn-secondary btn-sm" style="border-color:var(--primary-border); font-weight:700;"
                    onclick="selectTimeSlot('${s.id}', '${s.startTime}', '${doctor.id}', '${dateStr}', '${hospitalId || ''}')">
              ${s.startTime}
            </button>
          `;
        }
      }).join('');
    };

    container.innerHTML = `
      <div style="margin-bottom:2rem;">
        <h4 style="font-size:1.1rem; font-weight:700; color:var(--primary-dark); margin-bottom:1rem;">☀️ Morning Slots</h4>
        <div style="display:flex; flex-wrap:wrap; gap:0.75rem;">
          ${renderSlotButtons(morningSlots)}
        </div>
      </div>

      <div>
        <h4 style="font-size:1.1rem; font-weight:700; color:var(--primary-dark); margin-bottom:1rem;">⛅ Afternoon & Evening Slots</h4>
        <div style="display:flex; flex-wrap:wrap; gap:0.75rem;">
          ${renderSlotButtons(afternoonSlots)}
        </div>
      </div>
    `;

  } catch (err) {
    container.innerHTML = `<div class="empty-state"><h3>${err.message}</h3></div>`;
  }
}

function selectTimeSlot(slotId, slotTime, doctorId, dateStr, hospitalId) {
  sessionStorage.setItem('hb_selected_slotId', slotId);
  sessionStorage.setItem('hb_selected_slotTime', slotTime);
  let url = `patient-details.html?doctorId=${doctorId}&date=${dateStr}&slotId=${slotId}&time=${encodeURIComponent(slotTime)}`;
  if (hospitalId) url += `&hospitalId=${hospitalId}`;
  window.location.href = url;
}

// 6. Patient Details & Final Booking Page
async function initPatientDetailsPage() {
  const form = document.getElementById('patient-details-form');
  const doctorId = getUrlParam('doctorId');
  const dateStr = getUrlParam('date');
  const slotId = getUrlParam('slotId');
  const timeStr = getUrlParam('time');
  const hospitalId = getUrlParam('hospitalId');

  if (!doctorId || !dateStr || !timeStr) {
    showToast('Incomplete booking session. Restarting flow.', 'warning');
    setTimeout(() => window.location.href = 'hospitals.html', 1000);
    return;
  }

  // Pre-fill logged-in patient info if available
  const user = getAuthUser();
  if (user) {
    const nameIn = document.getElementById('patient-name');
    const phoneIn = document.getElementById('patient-phone');
    if (nameIn && !nameIn.value) nameIn.value = user.name;
    if (phoneIn && !phoneIn.value && user.phone) phoneIn.value = user.phone;
  }

  // Render summary card
  try {
    const docRes = await fetch(`${API_BASE}/doctors/${doctorId}`);
    if (docRes.ok) {
      const doctor = await docRes.json();
      const summaryContainer = document.getElementById('booking-summary-sidebar');
      if (summaryContainer) {
        summaryContainer.innerHTML = `
          <div style="background:#ffffff; border:1px solid var(--border-color); border-radius:var(--radius-md); padding:1.5rem; box-shadow:var(--shadow-sm);">
            <h3 style="font-size:1.2rem; font-weight:800; color:var(--primary-dark); margin-bottom:1.25rem;">📋 Booking Summary</h3>
            
            <div style="border-bottom:1px solid var(--border-color); padding-bottom:1rem; margin-bottom:1rem;">
              <div style="font-weight:700; color:var(--text-main);">${doctor.name}</div>
              <span class="card-badge badge-specialty" style="font-size:0.75rem; margin-top:0.25rem;">${doctor.specialization}</span>
              <p style="font-size:0.85rem; color:var(--text-muted); margin-top:0.35rem;">
                📍 ${doctor.hospital ? doctor.hospital.name : 'HealthBridge Hospital'}
              </p>
            </div>

            <div style="border-bottom:1px solid var(--border-color); padding-bottom:1rem; margin-bottom:1rem; font-size:0.9rem;">
              <div style="display:flex; justify-content:space-between; margin-bottom:0.35rem;">
                <span style="color:var(--text-muted);">Date:</span>
                <strong>${formatDate(dateStr)}</strong>
              </div>
              <div style="display:flex; justify-content:space-between;">
                <span style="color:var(--text-muted);">Time Slot:</span>
                <strong>${timeStr}</strong>
              </div>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; font-size:1.1rem; font-weight:800; color:var(--primary-dark);">
              <span>Consultation Fee:</span>
              <span>₹${doctor.consultationFee}</span>
            </div>
          </div>
        `;
      }
    }
  } catch (err) {
    console.error('Error loading doctor details:', err);
  }

  // Handle Submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = 'Securing Appointment Slot...';
    submitBtn.disabled = true;

    const patientName = document.getElementById('patient-name').value.trim();
    const patientAge = parseInt(document.getElementById('patient-age').value, 10);
    const patientPhone = document.getElementById('patient-phone').value.trim();
    const reason = document.getElementById('visit-reason').value.trim();

    const payload = {
      patientId: user ? user.userId : null,
      doctorId: parseInt(doctorId, 10),
      hospitalId: hospitalId ? parseInt(hospitalId, 10) : null,
      slotId: slotId ? parseInt(slotId, 10) : null,
      appointmentDate: dateStr,
      appointmentTime: timeStr,
      patientName,
      patientAge,
      patientPhone,
      reason
    };

    try {
      const response = await fetch(`${API_BASE}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to book appointment');
      }

      sessionStorage.setItem('hb_last_appointment', JSON.stringify(data));
      showToast('Appointment Confirmed!', 'success');

      setTimeout(() => {
        window.location.href = `appointment-confirmation.html?id=${data.id}&code=${data.appointmentCode}`;
      }, 700);

    } catch (err) {
      showToast(err.message, 'error');
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  });
}

// 7. Appointment Confirmation Page
async function initConfirmationPage() {
  const container = document.getElementById('confirmation-container');
  const appointmentId = getUrlParam('id');
  const code = getUrlParam('code');

  let aptData = null;

  try {
    if (appointmentId) {
      const res = await fetch(`${API_BASE}/appointments/${appointmentId}`);
      if (res.ok) aptData = await res.json();
    } else if (code) {
      const res = await fetch(`${API_BASE}/appointments/code/${code}`);
      if (res.ok) aptData = await res.json();
    }
  } catch (e) {
    console.warn('Could not fetch confirmation from API, checking session storage', e);
  }

  if (!aptData) {
    const saved = sessionStorage.getItem('hb_last_appointment');
    if (saved) aptData = JSON.parse(saved);
  }

  if (!aptData) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>No active appointment confirmation found</h3>
        <a href="hospitals.html" class="btn btn-primary btn-sm">Book New Appointment</a>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div style="background:#ffffff; border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:3rem 2.5rem; max-width:700px; margin:0 auto; box-shadow:var(--shadow-lg); text-align:center;">
      <div style="width:72px; height:72px; background:var(--primary-subtle); border:2px solid var(--primary-border); color:var(--primary); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:2rem; margin:0 auto 1.5rem;">
        ✔
      </div>

      <span class="card-badge badge-available" style="font-size:0.85rem; margin-bottom:0.75rem;">Status: ${aptData.status}</span>
      <h2 style="font-size:2.2rem; font-weight:800; color:var(--primary-dark); margin-bottom:0.5rem;">Appointment Confirmed!</h2>
      <p style="color:var(--text-muted); font-size:1rem; margin-bottom:2rem;">
        Your doctor appointment has been successfully scheduled and locked in the HealthBridge system.
      </p>

      <div style="background:var(--bg-surface); border:1.5px dashed var(--primary-border); border-radius:var(--radius-md); padding:1.75rem; text-align:left; margin-bottom:2rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-color); padding-bottom:0.85rem; margin-bottom:1rem;">
          <div>
            <div style="font-size:0.75rem; color:var(--text-muted); font-weight:700; text-transform:uppercase;">Appointment Reference ID</div>
            <div style="font-size:1.4rem; font-weight:800; color:var(--primary); letter-spacing:0.5px;">${aptData.appointmentCode}</div>
          </div>
          <span class="card-badge badge-specialty">Confirmed</span>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.25rem; font-size:0.95rem;">
          <div>
            <div style="font-size:0.8rem; color:var(--text-muted); font-weight:600;">Doctor</div>
            <div style="font-weight:700; color:var(--text-main); margin-top:0.2rem;">${aptData.doctorName}</div>
            <div style="font-size:0.85rem; color:var(--text-muted);">${aptData.specialization}</div>
          </div>
          <div>
            <div style="font-size:0.8rem; color:var(--text-muted); font-weight:600;">Hospital</div>
            <div style="font-weight:700; color:var(--text-main); margin-top:0.2rem;">${aptData.hospitalName}</div>
            <div style="font-size:0.85rem; color:var(--text-muted);">${aptData.hospitalAddress || ''}</div>
          </div>
          <div>
            <div style="font-size:0.8rem; color:var(--text-muted); font-weight:600;">Date & Time</div>
            <div style="font-weight:700; color:var(--text-main); margin-top:0.2rem;">${formatDate(aptData.appointmentDate)}</div>
            <div style="font-size:0.85rem; color:var(--text-muted);">${aptData.appointmentTime}</div>
          </div>
          <div>
            <div style="font-size:0.8rem; color:var(--text-muted); font-weight:600;">Patient</div>
            <div style="font-weight:700; color:var(--text-main); margin-top:0.2rem;">${aptData.patientName} (${aptData.patientAge || 'Adult'})</div>
            <div style="font-size:0.85rem; color:var(--text-muted);">${aptData.patientPhone || ''}</div>
          </div>
        </div>
      </div>

      <div style="display:flex; justify-content:center; gap:1rem; flex-wrap:wrap;">
        <a href="patient-dashboard.html" class="btn btn-primary">
          Go to Patient Dashboard →
        </a>
        <button onclick="window.print()" class="btn btn-secondary">
          🖨️ Print Receipt
        </button>
        <a href="hospitals.html" class="btn btn-secondary">
          Book Another
        </a>
      </div>
    </div>
  `;
}
