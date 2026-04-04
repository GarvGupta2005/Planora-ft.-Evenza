/* ============================================
   PLANORA HOME — home.js
============================================ */

'use strict';

/* ============================================
   MOCK DATA
   Replace these with real API calls:
   e.g. const events = await api.get('/events')
============================================ */
const MOCK_USER = {
    name: 'Aryan Kapoor',
    initials: 'AK',
    role: 'Organizer',
};

const MOCK_EVENTS = [
    { id: 1, name: 'Tech Summit 2026',       emoji: '💻', color: '#7c3aed', status: 'live',     date: 'Today · 10:00 AM',    registrations: 312, capacity: 400 },
    { id: 2, name: 'Design Workshop',        emoji: '🎨', color: '#06b6d4', status: 'upcoming',  date: 'May 12 · 2:00 PM',    registrations: 48,  capacity: 60  },
    { id: 3, name: 'Dev Bootcamp',           emoji: '⚙️', color: '#10b981', status: 'upcoming',  date: 'Jun 4 · 9:00 AM',     registrations: 201, capacity: 250 },
    { id: 4, name: 'Product Launch Meetup',  emoji: '🚀', color: '#f59e0b', status: 'upcoming',  date: 'Jun 18 · 6:00 PM',    registrations: 134, capacity: 200 },
    { id: 5, name: 'UX Research Panel',      emoji: '🔍', color: '#a855f7', status: 'past',      date: 'Mar 22 · 11:00 AM',   registrations: 90,  capacity: 100 },
    { id: 6, name: 'AI & ML Workshop',       emoji: '🤖', color: '#ec4899', status: 'past',      date: 'Mar 10 · 3:00 PM',    registrations: 175, capacity: 180 },
];

const MOCK_NOTIFICATIONS = [
    { id: 1, text: '<strong>Priya Ramesh</strong> registered for Tech Summit 2026',        time: '2 min ago',  color: '#7c3aed', unread: true  },
    { id: 2, text: '<strong>Evenza AI:</strong> Design Workshop has 3 open volunteer slots', time: '15 min ago', color: '#a855f7', unread: true  },
    { id: 3, text: '<strong>12 new registrations</strong> for Dev Bootcamp today',           time: '1h ago',     color: '#06b6d4', unread: true  },
    { id: 4, text: '<strong>Feedback received</strong> for UX Research Panel — 4.8★ avg',   time: '3h ago',     color: '#10b981', unread: false },
    { id: 5, text: '<strong>Attendance exported</strong> for AI & ML Workshop',              time: 'Yesterday',  color: '#f59e0b', unread: false },
];

/* ============================================
   GREETING
============================================ */
function initGreeting() {
    const hour = new Date().getHours();
    const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const firstName = MOCK_USER.name.split(' ')[0];

    const el = document.getElementById('greetingTitle');
    if (el) el.textContent = `${greet}, ${firstName} 👋`;

    // Populate user info
    const setEl = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
    setEl('userName', MOCK_USER.name);
    setEl('userRole', MOCK_USER.role);
    setEl('userAvatar', MOCK_USER.initials);
    setEl('topbarAvatar', MOCK_USER.initials);
}

/* ============================================
   EVENTS LIST
============================================ */
let activeFilter = 'all';

function renderEvents(filter) {
    const container = document.getElementById('eventsList');
    if (!container) return;

    const filtered = filter === 'all'
        ? MOCK_EVENTS
        : MOCK_EVENTS.filter(e => e.status === filter);

    if (!filtered.length) {
        container.innerHTML = `
      <div style="text-align:center;padding:40px 0;color:var(--text-dim);font-size:13px;">
        No ${filter} events found.
      </div>`;
        return;
    }

    container.innerHTML = filtered.map((ev, i) => `
    <div class="event-card" style="animation-delay:${i * 60}ms" onclick="window.location='../event-details/event-details.html'">
      <div class="event-card-color" style="background:${ev.color}"></div>
      <div class="event-card-icon">${ev.emoji}</div>
      <div class="event-card-body">
        <div class="event-card-name">${ev.name}</div>
        <div class="event-card-meta">
          <span class="event-meta-item">
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><rect x="1" y="2" width="9" height="8" rx="1" stroke="currentColor" stroke-width="1.1"/><path d="M1 5h9M3.5 1v2M7.5 1v2" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/></svg>
            ${ev.date}
          </span>
          <span class="event-meta-item">
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><circle cx="4" cy="4" r="2" stroke="currentColor" stroke-width="1.1"/><path d="M1 10c0-2 1.34-3.5 3-3.5" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/><circle cx="8.5" cy="6" r="1.5" stroke="currentColor" stroke-width="1.1"/><path d="M6.5 10c0-1.2.9-2.2 2-2.2" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/></svg>
            ${ev.registrations} / ${ev.capacity}
          </span>
        </div>
      </div>
      <div class="event-card-right">
        <span class="event-status-badge badge-${ev.status}">${ev.status === 'live' ? '● Live' : ev.status === 'upcoming' ? 'Upcoming' : 'Past'}</span>
        <span class="event-reg-count">${Math.round((ev.registrations / ev.capacity) * 100)}% full</span>
      </div>
    </div>
  `).join('');
}

function initEventTabs() {
    const tabs = document.getElementById('eventTabs');
    if (!tabs) return;

    tabs.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            tabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeFilter = btn.dataset.filter;
            renderEvents(activeFilter);
        });
    });

    renderEvents('all');
}

/* ============================================
   UPCOMING WIDGET
============================================ */
function renderUpcoming() {
    const container = document.getElementById('upcomingList');
    if (!container) return;

    const upcoming = MOCK_EVENTS.filter(e => e.status === 'upcoming').slice(0, 3);
    container.innerHTML = upcoming.map(ev => `
    <div class="upcoming-item">
      <div class="upcoming-dot" style="background:${ev.color}"></div>
      <div class="upcoming-info">
        <div class="upcoming-name">${ev.name}</div>
        <div class="upcoming-date">${ev.date}</div>
      </div>
      <span class="upcoming-reg">${ev.registrations} reg.</span>
    </div>
  `).join('');
}

/* ============================================
   NOTIFICATIONS
============================================ */
function initNotifications() {
    const btn = document.getElementById('notifBtn');
    const panel = document.getElementById('notifPanel');
    const overlay = document.getElementById('notifOverlay');
    const clearBtn = document.getElementById('notifClear');
    const list = document.getElementById('notifList');
    if (!btn || !panel || !overlay) return;

    // Render
    if (list) {
        list.innerHTML = MOCK_NOTIFICATIONS.map(n => `
      <div class="notif-item${n.unread ? ' unread' : ''}">
        <div class="notif-dot" style="background:${n.color}"></div>
        <div class="notif-body">
          <div class="notif-text">${n.text}</div>
          <div class="notif-time">${n.time}</div>
        </div>
      </div>
    `).join('');
    }

    function openPanel() {
        panel.classList.add('open');
        overlay.classList.add('visible');
    }
    function closePanel() {
        panel.classList.remove('open');
        overlay.classList.remove('visible');
    }

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        panel.classList.contains('open') ? closePanel() : openPanel();
    });
    overlay.addEventListener('click', closePanel);

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            document.querySelectorAll('.notif-item.unread').forEach(el => el.classList.remove('unread'));
            const badge = document.querySelector('.topbar-badge');
            if (badge) badge.style.display = 'none';
        });
    }
}

/* ============================================
   FAB (Plus Menu)
============================================ */
function initFab() {
    const fab = document.getElementById('fabBtn');
    const menu = document.getElementById('fabMenu');
    if (!fab || !menu) return;

    fab.addEventListener('click', () => {
        const isOpen = menu.classList.toggle('open');
        fab.classList.toggle('open', isOpen);
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!fab.contains(e.target) && !menu.contains(e.target)) {
            menu.classList.remove('open');
            fab.classList.remove('open');
        }
    });
}

/* ============================================
   SIDEBAR (mobile)
============================================ */
function initSidebar() {
    const toggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const closeBtn = document.getElementById('sidebarClose');
    if (!toggle || !sidebar || !overlay) return;

    function openSidebar() {
        sidebar.classList.add('open');
        overlay.classList.add('visible');
        document.body.style.overflow = 'hidden';
    }
    function closeSidebar() {
        sidebar.classList.remove('open');
        overlay.classList.remove('visible');
        document.body.style.overflow = '';
    }

    toggle.addEventListener('click', openSidebar);
    overlay.addEventListener('click', closeSidebar);
    if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
}

/* ============================================
   EVENZA BANNER DISMISS
============================================ */
function initEvenzaBanner() {
    const btn = document.getElementById('evenzaBannerClose');
    if (!btn) return;
    btn.addEventListener('click', () => {
        const banner = btn.closest('.evenza-banner');
        if (banner) {
            banner.style.opacity = '0';
            banner.style.transform = 'translateY(-8px)';
            banner.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            setTimeout(() => banner.remove(), 300);
        }
    });
}

/* ============================================
   SEARCH (client-side filter)
============================================ */
function initSearch() {
    const input = document.getElementById('searchInput');
    if (!input) return;

    let debounceTimer;
    input.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const q = input.value.trim().toLowerCase();
            if (!q) { renderEvents(activeFilter); return; }

            const results = MOCK_EVENTS.filter(e =>
                e.name.toLowerCase().includes(q) || e.status.includes(q)
            );

            const container = document.getElementById('eventsList');
            if (!container) return;

            if (!results.length) {
                container.innerHTML = `<div style="text-align:center;padding:40px 0;color:var(--text-dim);font-size:13px;">No events found for "${q}"</div>`;
                return;
            }

            container.innerHTML = results.map((ev, i) => `
        <div class="event-card" style="animation-delay:${i * 50}ms" onclick="window.location='../event-details/event-details.html'">
          <div class="event-card-color" style="background:${ev.color}"></div>
          <div class="event-card-icon">${ev.emoji}</div>
          <div class="event-card-body">
            <div class="event-card-name">${ev.name}</div>
            <div class="event-card-meta">
              <span class="event-meta-item">${ev.date}</span>
              <span class="event-meta-item">${ev.registrations} / ${ev.capacity}</span>
            </div>
          </div>
          <div class="event-card-right">
            <span class="event-status-badge badge-${ev.status}">${ev.status}</span>
          </div>
        </div>
      `).join('');
        }, 250);
    });
}

/* ============================================
   LOGOUT
============================================ */
function initLogout() {
    const btn = document.getElementById('logoutBtn');
    if (!btn) return;
    btn.addEventListener('click', () => {
        // TODO: call firebase.auth().signOut() or api.logout()
        window.location.href = '../../pages/auth/signin.html';
    });
}

/* ============================================
   INIT
============================================ */
document.addEventListener('DOMContentLoaded', () => {
    initGreeting();
    initEventTabs();
    renderUpcoming();
    initNotifications();
    initFab();
    initSidebar();
    initEvenzaBanner();
    initSearch();
    initLogout();
});