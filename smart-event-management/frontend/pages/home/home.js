/* Planora Home — home.js */
'use strict';

const API_BASE = 'http://localhost:5000/api';
let myRegistrations = [];
let publicEvents = [];
let organizerStats = null;
let myFeedbackHistory = [];
let myNotifications = [];
let activeFilter = 'all';

/**
 * Initialize Home Page
 */
async function initHome() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '../auth/signin.html';
        return;
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.fullName) {
        const firstName = user.fullName.split(' ')[0];
        const greetEl = document.getElementById('heroGreeting');
        if (greetEl) {
            const hour = new Date().getHours();
            const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
            greetEl.textContent = `${greet}, ${firstName} 👋`;
        }
        
        // Update user UI
        document.querySelectorAll('.user-name').forEach(el => el.textContent = user.fullName);
        const initials = user.fullName.split(' ').map(n => n[0]).join('').toUpperCase();
        document.querySelectorAll('.user-avatar, .topbar-avatar, #sidebarAvatar, #topbarAvatar, .pd-avatar').forEach(el => {
            if (el) el.textContent = initials;
        });
        document.querySelectorAll('.pt-name, .pd-name').forEach(el => el.textContent = user.fullName);
        
        // Update role UI
        const role = (user.roles && user.roles.length > 0) ? user.roles[0] : 'Participant';
        const displayRole = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
        document.querySelectorAll('.user-role, .pt-role').forEach(el => el.textContent = displayRole);
    }

    try {
        // 1. Fetch My Registrations (Joined events & Volunteer assignments)
        const myRes = await fetch(`${API_BASE}/registrations/my-registrations`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const myData = await myRes.json();
        myRegistrations = myData.data || [];

        // 2. Fetch Organizer Stats (if any events owned)
        const orgRes = await fetch(`${API_BASE}/dashboard/organizer`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const orgData = await orgRes.json();
        organizerStats = orgData.data || null;

        // 3. Fetch My Feedback (to check what is "Pending")
        const fbRes = await fetch(`${API_BASE}/feedback/my`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const fbData = await fbRes.json();
        myFeedbackHistory = fbData.data || [];

        // 4. Fetch Public Events (to show in main feed)
        const pubRes = await fetch(`${API_BASE}/events`);
        const pubData = await pubRes.json();
        publicEvents = pubData.data || [];

        // 5. Fetch Notifications
        const noteRes = await fetch(`${API_BASE}/notifications`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (noteRes.ok) {
            const noteData = await noteRes.json();
            myNotifications = noteData.data?.notifications || [];
            updateNotifBadge(noteData.data?.unreadCount || 0);
        }

        // Update UI
        updateSummaryPills();
        updateSummaryCards();
        renderEvents('all');
        renderUpcoming();
        renderNotifications();

    } catch (err) {
        console.error('Error initializing home:', err);
    }
}

function updateSummaryPills() {
    const orgCount = organizerStats ? organizerStats.totalEvents : 0;
    const joinCount = myRegistrations.filter(r => r.role === 'participant').length;
    const volCount = myRegistrations.filter(r => r.role === 'volunteer').length;

    const pills = document.querySelector('.role-summary');
    if (!pills) return;

    const pPill = pills.querySelector('.role-pill--purple b');
    const cPill = pills.querySelector('.role-pill--cyan b');
    const gPill = pills.querySelector('.role-pill--green b');

    if (pPill) pPill.textContent = orgCount;
    if (cPill) cPill.textContent = joinCount;
    if (gPill) gPill.textContent = volCount;
}

function updateSummaryCards() {
    const container = document.querySelector('.summary-cards');
    if (!container) return;

    // 1. Events Organized
    const orgCard = container.querySelector('.scard--purple');
    if (orgCard) {
        const num = orgCard.querySelector('.scard-num');
        const hint = orgCard.querySelector('.scard-hint');
        num.textContent = organizerStats ? organizerStats.totalEvents : 0;
        hint.textContent = organizerStats && organizerStats.totalEvents > 0 ? 'Active event management' : 'Create your first event';
    }

    // 2. Events Joined
    const joinCard = container.querySelector('.scard--cyan');
    if (joinCard) {
        const num = joinCard.querySelector('.scard-num');
        const chip = joinCard.querySelector('.scard-chip');
        const joined = myRegistrations.filter(r => r.role === 'participant');
        num.textContent = joined.length;
        chip.textContent = `${joined.length} Total`;
    }

    // 3. Volunteer Assignments
    const volCard = container.querySelector('.scard--green');
    if (volCard) {
        const num = volCard.querySelector('.scard-num');
        const assignments = myRegistrations.filter(r => r.role === 'volunteer');
        num.textContent = assignments.length;
    }

    // 4. Upcoming Events (Joined + Organized)
    const upcomingCard = container.querySelector('.scard--amber');
    if (upcomingCard) {
        const num = upcomingCard.querySelector('.scard-num');
        const joinedUpcoming = myRegistrations.filter(r => new Date(r.event.eventDate) > new Date()).length;
        num.textContent = joinedUpcoming;
    }

    // 5. Pending Tasks (Simplified: Count participants waiting for approval if organizer)
    const taskCard = container.querySelector('.scard--red');
    if (taskCard) {
        const num = taskCard.querySelector('.scard-num');
        num.textContent = organizerStats ? (organizerStats.totalRegistrations || 0) : 0; // Simplified
    }

    // 6. Feedback Pending
    const fbCard = container.querySelector('.scard--pink');
    if (fbCard) {
        const num = fbCard.querySelector('.scard-num');
        // Count events attended but no feedback given yet
        const attended = myRegistrations.filter(r => r.status === 'attended');
        const pendingFb = attended.filter(r => !myFeedbackHistory.some(f => f.event?._id === r.event._id)).length;
        num.textContent = pendingFb;
    }
}

function renderEvents(filter) {
    const container = document.getElementById('eventsList');
    if (!container) return;

    let list = publicEvents;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (filter !== 'all') {
        if (filter === 'live') {
            list = publicEvents.filter(e => {
                const start = new Date(e.eventDate);
                const end = e.endDate ? new Date(e.endDate) : new Date(start.getTime() + 24 * 60 * 60 * 1000);
                return now >= start && now <= end;
            });
        } else if (filter === 'upcoming') {
            list = publicEvents.filter(e => {
                const start = new Date(e.eventDate);
                start.setHours(0,0,0,0);
                return start >= today;
            });
        } else if (filter === 'past') {
            list = publicEvents.filter(e => {
                const start = new Date(e.eventDate);
                start.setHours(23,59,59,999);
                return start < now;
            });
        }
    }

    if (list.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-dim)">No events found.</div>';
        return;
    }

    container.innerHTML = list.map((ev, i) => {
        const regCount = ev.registrationCount || ev.registrationsCount || 0;
        const pct = Math.round((regCount / ev.capacity) * 100);
        const status = getStatus(ev);
        
        return `
        <div class="event-card" style="animation-delay:${i * 50}ms" onclick="viewEvent('${ev._id}')">
          <div class="event-card-color" style="background:${ev.color || '#7c3aed'}"></div>
          <div class="event-card-icon">${ev.emoji || '🎯'}</div>
          <div class="event-card-body">
            <div class="event-card-name">${ev.title}</div>
            <div class="event-card-meta">
              <span class="ec-meta">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><rect x=".5" y="1.5" width="9" height="8" rx="1" stroke="currentColor" stroke-width="1"/><path d="M.5 4h9M3 .5v2M7 .5v2" stroke="currentColor" stroke-width="1" stroke-linecap="round"/></svg>
                ${new Date(ev.eventDate).toLocaleDateString()} · ${ev.startTime || 'TBD'}
              </span>
              <span class="ec-meta">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><circle cx="3.5" cy="3" r="1.5" stroke="currentColor" stroke-width="1"/><path d="M.5 8.5c0-1.657 1.343-3 3-3" stroke="currentColor" stroke-width="1" stroke-linecap="round"/><circle cx="7.5" cy="4.5" r="1.5" stroke="currentColor" stroke-width="1"/><path d="M5.5 8.5c0-1.105.895-2 2-2" stroke="currentColor" stroke-width="1" stroke-linecap="round"/></svg>
                ${regCount} / ${ev.capacity}
              </span>
            </div>
          </div>
          <div class="event-card-right">
            <span class="ev-badge badge-${status}">${status === 'live' ? '● Live' : status.charAt(0).toUpperCase() + status.slice(1)}</span>
            <span class="ev-pct">${pct}% full</span>
          </div>
        </div>
      `;
    }).join('');
}

function getStatus(ev) {
    const now = new Date();
    const start = new Date(ev.eventDate);
    const end = ev.endDate ? new Date(ev.endDate) : new Date(start.getTime() + 24 * 60 * 60 * 1000);
    if (now >= start && now <= end) return 'live';
    if (now < start) return 'upcoming';
    return 'past';
}

function viewEvent(id) {
    window.location.href = `../event-details/event-details.html?id=${id}`;
}

function renderUpcoming() {
    const container = document.getElementById('upcomingList');
    if (!container) return;
    
    // Combine my events and organized events and sort by date
    const list = myRegistrations.filter(r => new Date(r.event.eventDate) >= new Date()).slice(0, 3);
    
    if (list.length === 0) {
        container.innerHTML = '<div style="padding:10px;color:var(--text-dim);font-size:12px">No upcoming events.</div>';
        return;
    }

    container.innerHTML = list.map(r => `
        <div class="upcoming-item" onclick="viewEvent('${r.event._id}')">
          <div class="up-dot" style="background:${r.event.color || '#7c3aed'}"></div>
          <div class="up-info">
            <div class="up-name">${r.event.title}</div>
            <div class="up-date">${new Date(r.event.eventDate).toLocaleDateString()}</div>
          </div>
          <span class="up-reg" style="text-transform:capitalize">${r.role}</span>
        </div>
    `).join('');
}

function renderNotifications() {
    const list = document.getElementById('notifList');
    if (!list) return;

    if (myNotifications.length === 0) {
        list.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-dim)">No notifications.</div>';
        return;
    }

    list.innerHTML = myNotifications.slice(0, 5).map(n => `
      <div class="notif-item${!n.isRead ? ' unread' : ''}">
        <div class="notif-dot" style="background:var(--purple)"></div>
        <div class="notif-body">
          <div class="notif-text"><strong>${n.title}:</strong> ${n.body}</div>
          <div class="notif-time">${formatTimeAgo(n.createdAt)}</div>
        </div>
      </div>
    `).join('');
}

function updateNotifBadge(count) {
    const badge = document.getElementById('notifCount');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }
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
    initHome();
    
    // Event Tabs
    document.getElementById('eventTabs')?.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeFilter = btn.dataset.filter;
            renderEvents(activeFilter);
        });
    });

    // Logout
    document.querySelectorAll('#logoutBtn, #logoutBtn2').forEach(btn => {
        btn.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = '../auth/signin.html';
        });
    });
    
    // Search
    document.getElementById('searchInput')?.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase();
        if (!q) {
            renderEvents(activeFilter);
            return;
        }
        const results = publicEvents.filter(ev => ev.title.toLowerCase().includes(q));
        const container = document.getElementById('eventsList');
        if (container) {
            container.innerHTML = results.map((ev, i) => `
                <div class="event-card" onclick="viewEvent('${ev._id}')">
                <div class="event-card-color" style="background:${ev.color || '#7c3aed'}"></div>
                <div class="event-card-icon">${ev.emoji || '🎯'}</div>
                <div class="event-card-body">
                    <div class="event-card-name">${ev.title}</div>
                    <div class="event-card-meta"><span>${new Date(ev.eventDate).toLocaleDateString()}</span></div>
                </div>
                </div>
            `).join('');
        }
    });

    // FAB
    const fabBtn = document.getElementById('fabBtn');
    const fabMenu = document.getElementById('fabMenu');
    if (fabBtn && fabMenu) {
        fabBtn.addEventListener('click', () => {
            fabMenu.classList.toggle('active');
            fabBtn.classList.toggle('active');
        });
    }

    // Panels (Notifications / Profile)
    setupPanel('notifBtn', 'notifPanel', 'notifOverlay');
    setupPanel('profileTrigger', 'profileDropdown', 'profileOverlay');
});

function setupPanel(btnId, panelId, overlayId) {
    const btn = document.getElementById(btnId);
    const panel = document.getElementById(panelId);
    const overlay = document.getElementById(overlayId);

    if (!btn || !panel || !overlay) return;

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        panel.classList.toggle('active');
        overlay.classList.toggle('active');
    });

    overlay.addEventListener('click', () => {
        panel.classList.remove('active');
        overlay.classList.remove('active');
    });
}