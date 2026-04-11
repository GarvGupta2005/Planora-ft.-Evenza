/* Volunteer Overview — overview.js */
'use strict';

const API_BASE = 'http://localhost:5000/api';

/**
 * Initialize the Volunteer Dashboard
 */
async function initDashboard() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '../../auth/signin.html';
    return;
  }

  // Update user info from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.fullName) {
    document.querySelectorAll('.user-name').forEach(el => el.textContent = user.fullName);
    document.querySelectorAll('.topbar-avatar, .user-avatar').forEach(el => {
      el.textContent = user.fullName.split(' ').map(n => n[0]).join('').toUpperCase();
    });
  }

  try {
    // 1. Fetch Tasks
    const taskRes = await fetch(`${API_BASE}/volunteers/my-tasks`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const taskData = await taskRes.json();
    const tasks = taskData.data || [];

    // 2. Fetch Registrations (Shifts)
    const regRes = await fetch(`${API_BASE}/registrations/my-registrations`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const regData = await regRes.json();
    const volunteerShifts = (regData.data || []).filter(r => r.role === 'volunteer');

    // 3. Fetch Notifications (Notices)
    const noteRes = await fetch(`${API_BASE}/notifications`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const noteData = await noteRes.json();
    const notifications = noteData.data?.notifications || [];
    const unreadNotices = noteData.data?.unreadCount || 0;

    // Process Data
    const pendingTasks = tasks.filter(t => t.status !== 'completed');
    const upcomingShifts = volunteerShifts.filter(s => new Date(s.event.eventDate || s.event.startDate) > new Date());
    
    // Get next shift info
    let nextShiftLabel = 'None assigned';
    if (upcomingShifts.length > 0) {
      const next = upcomingShifts[0];
      nextShiftLabel = `Next: ${next.event.title}`;
    }

    // Update UI Stats
    document.getElementById('shiftCount').textContent = upcomingShifts.length;
    document.getElementById('shiftChip').textContent = `${upcomingShifts.length} active`;
    document.getElementById('nextShiftLabel').textContent = nextShiftLabel;

    document.getElementById('taskCount').textContent = pendingTasks.length;
    document.getElementById('taskChip').textContent = `${pendingTasks.length} pending`;

    document.getElementById('noticeCount').textContent = unreadNotices;
    document.getElementById('noticeChip').textContent = `${unreadNotices} unread`;

    document.getElementById('volEventsCount').textContent = volunteerShifts.length;

    // Render Lists
    renderShifts(upcomingShifts);
    renderTasks(tasks.slice(0, 5));
    renderNotices(notifications.slice(0, 5));

  } catch (err) {
    console.error('Error initializing volunteer dashboard:', err);
  }
}

function renderShifts(data) {
  const el = document.getElementById('shiftList');
  if (!el) return;

  if (data.length === 0) {
    el.innerHTML = '<div style="padding: 20px; color: var(--text-dim);">No upcoming shifts assigned.</div>';
    return;
  }

  el.innerHTML = data.map(s => `
    <div class="v-row">
      <div class="v-left">
        <div class="v-dot" style="background:${s.event.color || '#10b981'}"></div>
        <div style="min-width:0">
          <div class="v-title">${s.event.title}</div>
          <div class="v-sub">${new Date(s.event.eventDate).toLocaleDateString()} · ${s.event.startTime || 'All day'}</div>
        </div>
      </div>
      <div style="flex-shrink:0"><span class="badge badge-upcoming">Assigned</span></div>
    </div>
  `).join('');
}

function renderTasks(data) {
  const el = document.getElementById('taskPreview');
  if (!el) return;

  if (data.length === 0) {
    el.innerHTML = '<div style="padding: 20px; color: var(--text-dim);">No tasks assigned yet.</div>';
    return;
  }

  el.innerHTML = data.map(t => `
    <div class="v-row">
      <div class="v-left">
        <div class="v-dot" style="background:${t.status === 'completed' ? '#10b981' : '#f59e0b'}"></div>
        <div style="min-width:0">
          <div class="v-title">${t.taskDescription}</div>
          <div class="v-sub">${t.event.title} · ${t.status}</div>
        </div>
      </div>
      <div style="flex-shrink:0"><span class="badge badge-${t.status}">${t.status}</span></div>
    </div>
  `).join('');
}

function renderNotices(data) {
  const el = document.getElementById('noticeList');
  if (!el) return;

  if (data.length === 0) {
    el.innerHTML = '<div style="padding: 20px; color: var(--text-dim);">No recent notices.</div>';
    return;
  }

  el.innerHTML = data.map(n => `
    <div class="notice">
      <div class="n-dot" style="background:var(--cyan)"></div>
      <div>
        <div class="n-text"><strong>${n.title}:</strong> ${n.body}</div>
        <div class="n-time">${formatTimeAgo(n.createdAt)}</div>
      </div>
    </div>
  `).join('');
}

function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.round(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return date.toLocaleDateString();
}

document.addEventListener('DOMContentLoaded', () => {
  initDashboard();
});

