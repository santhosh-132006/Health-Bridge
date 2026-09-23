/**
 * HealthBridge – Forgot Password & Verification Code Handler (forgot-password.js)
 */

let targetEmail = '';
let currentOtp = '';

document.addEventListener('DOMContentLoaded', () => {
  const reqForm = document.getElementById('request-otp-form');
  const verifyForm = document.getElementById('verify-otp-form');
  const resetForm = document.getElementById('reset-password-form');

  if (reqForm) reqForm.addEventListener('submit', handleSendOtp);
  if (verifyForm) verifyForm.addEventListener('submit', handleVerifyOtp);
  if (resetForm) resetForm.addEventListener('submit', handleResetPassword);
});

// 1. Send OTP Request
async function handleSendOtp(e) {
  e.preventDefault();
  const emailInput = document.getElementById('recovery-email');
  const btn = document.getElementById('send-otp-btn');
  const email = emailInput.value.trim();

  if (!email) {
    showToast('Please enter your email address', 'error');
    return;
  }

  const originalText = btn.innerHTML;
  btn.innerHTML = 'Sending Verification Code...';
  btn.disabled = true;

  try {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Failed to send verification code');
    }

    targetEmail = email;

    showToast('Verification code dispatched to your email!', 'success');

    // Transition to Step 2
    document.getElementById('step-1-container').style.display = 'none';
    document.getElementById('step-2-container').style.display = 'block';
    document.getElementById('display-target-email').textContent = targetEmail;

    // Update Step Indicators
    document.getElementById('badge-step-1').style.background = '#f1f5f9';
    document.getElementById('badge-step-1').style.color = 'var(--text-muted)';
    document.getElementById('badge-step-2').style.background = 'var(--primary)';
    document.getElementById('badge-step-2').style.color = '#ffffff';

    document.getElementById('input-otp').focus();

  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

// 2. Verify OTP
async function handleVerifyOtp(e) {
  e.preventDefault();
  const otpInput = document.getElementById('input-otp');
  const btn = document.getElementById('verify-otp-btn');
  const otp = otpInput.value.trim();

  if (!otp || otp.length !== 6) {
    showToast('Please enter the complete 6-digit code', 'error');
    return;
  }

  const originalText = btn.innerHTML;
  btn.innerHTML = 'Verifying Code...';
  btn.disabled = true;

  try {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: targetEmail, otp })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Verification failed');
    }

    showToast('Code confirmed! Set your new password.', 'success');

    // Transition to Step 3
    document.getElementById('step-2-container').style.display = 'none';
    document.getElementById('step-3-container').style.display = 'block';

    // Update Step Indicators
    document.getElementById('badge-step-2').style.background = '#f1f5f9';
    document.getElementById('badge-step-2').style.color = 'var(--text-muted)';
    document.getElementById('badge-step-3').style.background = 'var(--primary)';
    document.getElementById('badge-step-3').style.color = '#ffffff';

    document.getElementById('new-password').focus();

  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

// Resend OTP
async function resendOtp() {
  if (!targetEmail) return;
  const btn = document.getElementById('resend-otp-btn');
  btn.disabled = true;
  btn.innerHTML = 'Resending...';

  try {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: targetEmail })
    });
    const data = await res.json();
    if (res.ok) {
      currentOtp = data.otpPreview || '';
      if (currentOtp) {
        document.getElementById('dev-otp-code').textContent = currentOtp;
      }
      showToast('New verification code sent!', 'success');
    } else {
      throw new Error(data.message);
    }
  } catch (e) {
    showToast(e.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '🔄 Resend Code';
  }
}

// 3. Reset Password
async function handleResetPassword(e) {
  e.preventDefault();
  const pass = document.getElementById('new-password').value;
  const confirm = document.getElementById('confirm-password').value;
  const btn = document.getElementById('reset-submit-btn');
  const otp = document.getElementById('input-otp').value.trim();

  if (pass !== confirm) {
    showToast('Passwords do not match. Please re-enter.', 'error');
    return;
  }

  if (pass.length < 6) {
    showToast('Password must be at least 6 characters.', 'error');
    return;
  }

  const originalText = btn.innerHTML;
  btn.innerHTML = 'Updating Password...';
  btn.disabled = true;

  try {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: targetEmail,
        otp,
        newPassword: pass
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Failed to update password');
    }

    showToast('Password updated successfully!', 'success');

    // Transition to Step 4 (Success)
    document.getElementById('step-3-container').style.display = 'none';
    document.getElementById('step-4-container').style.display = 'block';

  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}
