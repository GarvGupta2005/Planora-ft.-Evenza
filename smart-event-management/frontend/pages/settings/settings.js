/* Settings — settings.js */
'use strict';

const API_BASE = 'http://localhost:5000/api';

function toggleSwitch(el) {
  if (!el) return;
  const current = el.getAttribute('aria-checked') === 'true';
  el.setAttribute('aria-checked', String(!current));
}

function wireToggle(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('click', () => toggleSwitch(el));
}

async function changePassword() {
  const cur = document.getElementById('curPw')?.value || '';
  const pw1 = document.getElementById('newPw')?.value || '';
  const pw2 = document.getElementById('newPw2')?.value || '';
  const token = localStorage.getItem('token');

  if (!cur) {
    alert('Please enter your current password.');
    return;
  }
  if (pw1.length < 6) {
    alert('New password must be at least 6 characters.');
    return;
  }
  if (pw1 !== pw2) {
    alert('New passwords do not match.');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/users/me/password`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ currentPassword: cur, newPassword: pw1 })
    });

    if (res.ok) {
        alert('Password updated successfully!');
        if (document.getElementById('curPw')) document.getElementById('curPw').value = '';
        if (document.getElementById('newPw')) document.getElementById('newPw').value = '';
        if (document.getElementById('newPw2')) document.getElementById('newPw2').value = '';
    } else {
        const data = await res.json();
        alert(data.message || 'Failed to update password');
    }
  } catch (err) {
    console.error('Error changing password:', err);
  }
}

function saveSettings() {
  const get = (id) => document.getElementById(id)?.getAttribute('aria-checked') === 'true';
  const payload = {
    emailReminders: get('tEmail'),
    announcements: get('tAnn'),
    productUpdates: get('tProd'),
    showProfile: get('tProfile'),
    shareAnalytics: get('tAnalytics'),
  };
  // Logic could be added here if backend has a dedicated settings endpoint
  alert('Preferences saved locally. (Backend settings API planned)');
}

document.addEventListener('DOMContentLoaded', () => {
  ['tEmail', 'tAnn', 'tProd', 'tProfile', 'tAnalytics'].forEach(wireToggle);
  document.getElementById('changePwBtn')?.addEventListener('click', changePassword);
  document.getElementById('saveSettingsBtn')?.addEventListener('click', saveSettings);
  document.getElementById('signOutAllBtn')?.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '../../auth/signin.html';
  });
});
