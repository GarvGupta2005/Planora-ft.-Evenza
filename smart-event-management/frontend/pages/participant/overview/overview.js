/* Participant Overview — overview.js */
'use strict';

const API_BASE = 'http://localhost:5000/api';

/**
 * Initialize the Participant Dashboard
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
    // 1. Fetch Registrations
    const regRes = await fetch(`${API_BASE}/registrations/my-registrations`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const regData = await regRes.json();
    const registrations = regData.data || [];

    // 2. Fetch Certificates
    const certRes = await fetch(`${API_BASE}/certificates/my`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const certData = await certRes.json();
    const certificates = certData.data || [];

    // Calculate Stats
    const totalJoined = registrations.length;
    const attended = registrations.filter(r => r.status === 'attended').length;
    const certsEarned = certificates.length;

    // Filter Upcoming Events (Events today or in the future that user is registered for)
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Start of today

    const upcoming = registrations.filter(r => {
      if (!r.event) return false;
      const eventDate = new Date(r.event.eventDate || r.event.startDate);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate >= now && (r.status === 'registered' || r.status === 'pending');
    }).map(r => ({
      name: r.event.title,
      when: new Date(r.event.eventDate || r.event.startDate).toLocaleDateString() + ' · ' + (r.event.startTime || ''),
      where: r.event.venue || 'Virtual',
      color: r.event.color || '#06b6d4'
    }));

    // Filter Pending Feedback
    // (Events that have passed, user attended, but maybe haven't given feedback)
    const pendingFeedback = registrations.filter(r => {
      if (!r.event) return false;
      const eventDate = new Date(r.event.eventDate || r.event.startDate);
      eventDate.setHours(23, 59, 59, 999); // End of event day
      return eventDate < new Date() && r.status === 'attended';
    }).map(r => ({
      name: r.event.title,
      date: new Date(r.event.eventDate || r.event.startDate).toLocaleDateString(),
      color: r.event.color || '#7c3aed'
    }));

    // 3. Fetch Notifications (Notices)
    const noteRes = await fetch(`${API_BASE}/notifications`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const noteData = await noteRes.json();
    const notifications = noteData.data?.notifications || [];
    const unreadCount = noteData.data?.unreadCount || 0;

    // Update UI
    updateStats(totalJoined, attended, certsEarned, pendingFeedback.length, upcoming.length);
    renderUpcoming(upcoming);
    renderCerts(certificates);
    renderPendingFeedback(pendingFeedback);
    renderNotices(notifications, unreadCount);

  } catch (err) {
    console.error('Error initializing dashboard:', err);
  }
}

function renderNotices(data, unreadCount) {
  const el = document.getElementById('noticeList');
  const countEl = document.getElementById('noticeCountEl');
  if (!el) return;

  if (countEl) countEl.textContent = `${unreadCount} unread`;

  if (data.length === 0) {
    el.innerHTML = '<div style="color: var(--text-dim); font-size: 13px;">No recent notices.</div>';
    return;
  }

  el.innerHTML = data.slice(0, 5).map(n => `
    <div style="display:flex; gap:12px; margin-bottom:16px;">
      <div style="width:8px; height:8px; border-radius:50%; background:var(--cyan); margin-top:6px; flex-shrink:0;"></div>
      <div style="min-width:0">
        <div style="font-size:13px; font-weight:600; color:var(--text-bright); margin-bottom:2px;">${n.title}</div>
        <div style="font-size:12px; color:var(--text-dim); line-height:1.4; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${n.body}</div>
        <div style="font-size:10px; color:var(--text-dim); margin-top:4px;">${formatTimeAgo(n.createdAt)}</div>
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

function updateStats(joined, attended, certs, pendingFb, upcomingCount) {
  const nums = document.querySelectorAll('.stat-card-num');
  if (nums.length >= 4) {
    nums[0].textContent = joined;
    nums[1].textContent = attended;
    nums[2].textContent = certs;
    nums[3].textContent = pendingFb;
  }

  const chips = document.querySelectorAll('.stat-chip');
  if (chips.length >= 4) {
    chips[0].textContent = `${upcomingCount} upcoming`;
    // chips[1] usually has no chip in HTML for attended
    if (chips[2]) chips[2].textContent = `${certs} issued`;
    if (chips[3]) chips[3].textContent = `${pendingFb} pending`;
  }
}

function renderUpcoming(data) {
  const el = document.getElementById('upcomingList');
  if (!el) return;

  if (data.length === 0) {
    el.innerHTML = '<div style="padding: 20px; color: var(--text-dim);">No upcoming events. Browse events to join!</div>';
    return;
  }

  el.innerHTML = data.map(ev => `
    <div class="p-row">
      <div class="p-left">
        <div class="p-dot" style="background:${ev.color}"></div>
        <div style="min-width:0">
          <div class="p-title">${ev.name}</div>
          <div class="p-sub">${ev.when} · ${ev.where}</div>
        </div>
      </div>
      <div class="mini-chip pending">Upcoming</div>
    </div>
  `).join('');
}

function renderCerts(data) {
  const el = document.getElementById('certList');
  if (!el) return;

  if (data.length === 0) {
    el.innerHTML = '<div style="padding: 10px; color: var(--text-dim); font-size: 13px;">No certificates yet. Attend events to earn them!</div>';
    return;
  }

  el.innerHTML = data.slice(0, 3).map(c => `
    <div class="p-row" style="padding:10px 10px">
      <div class="p-left">
        <div class="p-dot" style="background:var(--purple-light)"></div>
        <div style="min-width:0">
          <div class="p-title">${c.event.title}</div>
          <div class="p-sub">Issued · ${new Date(c.issuedAt).toLocaleDateString()}</div>
        </div>
      </div>
      <div class="mini-chip done">Ready</div>
    </div>
  `).join('');
}

function renderPendingFeedback(data) {
  const el = document.getElementById('pendingFbList');
  if (!el) return;

  if (data.length === 0) {
    el.innerHTML = '<div style="padding: 10px; color: var(--text-dim); font-size: 13px;">No pending feedback. Thank you!</div>';
    return;
  }

  el.innerHTML = data.slice(0, 3).map(f => `
    <div class="p-row" style="padding:10px 10px">
      <div class="p-left">
        <div class="p-dot" style="background:${f.color}"></div>
        <div style="min-width:0">
          <div class="p-title">${f.name}</div>
          <div class="p-sub">Attended · ${f.date}</div>
        </div>
      </div>
      <div class="mini-chip pending">Pending</div>
    </div>
  `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  initDashboard();
});

