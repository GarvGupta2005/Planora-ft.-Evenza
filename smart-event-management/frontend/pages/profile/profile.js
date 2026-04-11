/* Profile — profile.js */
'use strict';

const API_BASE = 'http://localhost:5000/api';

/**
 * Initialize Profile Page
 */
async function initProfile() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '../../auth/signin.html';
    return;
  }

  try {
    // 1. Fetch User Data
    const userRes = await fetch(`${API_BASE}/users/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const userData = await userRes.json();
    const user = userData.data;

    if (user) {
        updateProfileUI(user);
    }

    // 2. Fetch Notifications as "Activity"
    const noteRes = await fetch(`${API_BASE}/notifications`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const noteData = await noteRes.json();
    renderActivity(noteData.data?.notifications || []);

  } catch (err) {
    console.error('Error loading profile:', err);
  }
}

function updateProfileUI(user) {
  const initials = user.fullName.split(' ').map(n => n[0]).join('').toUpperCase();
  
  // Sidebar/Topbar updates
  document.querySelectorAll('.user-name').forEach(el => el.textContent = user.fullName);
  document.querySelectorAll('.user-avatar, .topbar-avatar, .p-avatar').forEach(el => el.textContent = initials);

  // Profile Specific
  const nameDisp = document.getElementById('pNameDisplay');
  const emailDisp = document.getElementById('pEmailDisplay');
  const roleDisp = document.getElementById('pRoleDisplay');
  const nameInput = document.getElementById('nameInput');
  const emailInput = document.getElementById('emailInput');

  if (nameDisp) nameDisp.textContent = user.fullName;
  if (emailDisp) emailDisp.textContent = user.email;
  if (roleDisp) roleDisp.textContent = user.roles[0] || 'User';
  
  if (nameInput) nameInput.value = user.fullName;
  if (emailInput) emailInput.value = user.email;
}

function renderActivity(notes) {
  const el = document.getElementById('activity');
  if (!el) return;

  if (notes.length === 0) {
    el.innerHTML = '<div style="padding:10px;color:var(--text-dim);font-size:13px">No recent activity detected.</div>';
    return;
  }

  el.innerHTML = notes.slice(0, 5).map(n => `
    <div class="act-item">
      <div class="act-dot" style="background:#7c3aed"></div>
      <div style="flex:1">
        <div class="act-text"><strong>${n.title}:</strong> ${n.body}</div>
        <div class="act-time">${new Date(n.createdAt).toLocaleString()}</div>
      </div>
    </div>
  `).join('');
}

function setEditing(isEditing) {
  document.getElementById('nameInput')?.toggleAttribute('disabled', !isEditing);
  // Email usually stays non-editable in simple flows, but we follow the UI
  document.getElementById('emailInput')?.toggleAttribute('disabled', !isEditing);

  const editBtn = document.getElementById('editBtn');
  const saveBtn = document.getElementById('saveBtn');
  if (editBtn) editBtn.style.display = isEditing ? 'none' : 'inline-flex';
  if (saveBtn) saveBtn.style.display = isEditing ? 'inline-flex' : 'none';
}

async function save() {
  const name = document.getElementById('nameInput')?.value?.trim() || '';
  const token = localStorage.getItem('token');

  if (!name) {
    alert('Name is required.');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/users/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ fullName: name })
    });

    if (res.ok) {
        const data = await res.json();
        const user = data.data;
        updateProfileUI(user);
        // Update local storage user if stored
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        storedUser.fullName = user.fullName;
        localStorage.setItem('user', JSON.stringify(storedUser));
        
        setEditing(false);
        alert('Profile updated successfully!');
    } else {
        const data = await res.json();
        alert(data.message || 'Failed to update profile');
    }
  } catch (err) {
    console.error('Error saving profile:', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
    initProfile();
    document.getElementById('editBtn')?.addEventListener('click', () => setEditing(true));
    document.getElementById('saveBtn')?.addEventListener('click', save);
});
