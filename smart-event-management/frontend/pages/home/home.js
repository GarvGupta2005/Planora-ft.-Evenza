/* ============================================
   PLANORA HOME — home.js  (updated)
============================================ */
'use strict';

/* ---- Static data ---- */
const USER = {
    name: 'Rishabh Kumar',
    firstName: 'Rishabh',
    initials: 'RK',
    role: 'Organizer',
    email: 'rishabh@planora.app',
    organized: 1,
    joined: 2,
    volunteering: 1,
};

const EVENTS = [
    { id:1, name:'Tech Summit 2026',       emoji:'💻', color:'#7c3aed', status:'live',     date:'Today · 10:00 AM',   reg:312, cap:400 },
    { id:2, name:'Design Workshop',        emoji:'🎨', color:'#06b6d4', status:'upcoming',  date:'May 12 · 2:00 PM',   reg:48,  cap:60  },
    { id:3, name:'Dev Bootcamp',           emoji:'⚙️', color:'#10b981', status:'upcoming',  date:'Jun 4 · 9:00 AM',    reg:201, cap:250 },
    { id:4, name:'Product Launch Meetup',  emoji:'🚀', color:'#f59e0b', status:'upcoming',  date:'Jun 18 · 6:00 PM',   reg:134, cap:200 },
    { id:5, name:'UX Research Panel',      emoji:'🔍', color:'#a855f7', status:'past',      date:'Mar 22 · 11:00 AM',  reg:90,  cap:100 },
    { id:6, name:'AI & ML Workshop',       emoji:'🤖', color:'#ec4899', status:'past',      date:'Mar 10 · 3:00 PM',   reg:175, cap:180 },
];

const NOTIFICATIONS = [
    { text:'<strong>Priya Ramesh</strong> registered for Tech Summit 2026',         time:'2 min ago',  color:'#7c3aed', unread:true  },
    { text:'<strong>Evenza AI:</strong> Design Workshop has 3 open volunteer slots', time:'15 min ago', color:'#a855f7', unread:true  },
    { text:'<strong>12 new registrations</strong> for Dev Bootcamp today',           time:'1h ago',     color:'#06b6d4', unread:true  },
    { text:'<strong>Feedback received</strong> for UX Research Panel — 4.8★ avg',    time:'3h ago',     color:'#10b981', unread:false },
    { text:'<strong>Attendance exported</strong> for AI & ML Workshop',              time:'Yesterday',  color:'#f59e0b', unread:false },
];

/* ============================================
   TOPBAR — date & greeting
============================================ */
function initTopbar() {
    // Date
    const dateEl = document.getElementById('topbarDate');
    if (dateEl) {
        const now = new Date();
        dateEl.textContent = now.toLocaleDateString('en-IN', {
            weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
        });
    }

    // Time-aware greeting
    const hour = new Date().getHours();
    const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const heroEl = document.getElementById('heroGreeting');
    if (heroEl) heroEl.textContent = `${greet}, ${USER.firstName} 👋`;
}

/* ============================================
   SEARCH — live filter
============================================ */
let activeFilter = 'all';

function initSearch() {
    const input = document.getElementById('searchInput');
    if (!input) return;

    let timer;
    input.addEventListener('input', () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            const q = input.value.trim().toLowerCase();
            if (!q) { renderEvents(activeFilter); return; }
            const results = EVENTS.filter(e => e.name.toLowerCase().includes(q));
            renderEventList(results);
        }, 220);
    });

    // ⌘K focus shortcut
    document.addEventListener('keydown', e => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            input.focus();
            input.select();
        }
    });
}

/* ============================================
   EVENTS FEED
============================================ */
function renderEvents(filter) {
    const list = filter === 'all' ? EVENTS : EVENTS.filter(e => e.status === filter);
    renderEventList(list);
}

function renderEventList(list) {
    const container = document.getElementById('eventsList');
    if (!container) return;

    if (!list.length) {
        container.innerHTML = `<div style="text-align:center;padding:36px 0;color:var(--text-dim);font-size:13px;">No events found.</div>`;
        return;
    }

    container.innerHTML = list.map((ev, i) => `
    <div class="event-card" style="animation-delay:${i * 55}ms"
         onclick="window.location='../event-details/event-details.html'">
      <div class="event-card-color" style="background:${ev.color}"></div>
      <div class="event-card-icon">${ev.emoji}</div>
      <div class="event-card-body">
        <div class="event-card-name">${ev.name}</div>
        <div class="event-card-meta">
          <span class="ec-meta">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><rect x=".5" y="1.5" width="9" height="8" rx="1" stroke="currentColor" stroke-width="1"/><path d="M.5 4h9M3 .5v2M7 .5v2" stroke="currentColor" stroke-width="1" stroke-linecap="round"/></svg>
            ${ev.date}
          </span>
          <span class="ec-meta">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><circle cx="3.5" cy="3" r="1.5" stroke="currentColor" stroke-width="1"/><path d="M.5 8.5c0-1.657 1.343-3 3-3" stroke="currentColor" stroke-width="1" stroke-linecap="round"/><circle cx="7.5" cy="4.5" r="1.5" stroke="currentColor" stroke-width="1"/><path d="M5.5 8.5c0-1.105.895-2 2-2" stroke="currentColor" stroke-width="1" stroke-linecap="round"/></svg>
            ${ev.reg} / ${ev.cap}
          </span>
        </div>
      </div>
      <div class="event-card-right">
        <span class="ev-badge badge-${ev.status}">${ev.status === 'live' ? '● Live' : ev.status === 'upcoming' ? 'Upcoming' : 'Past'}</span>
        <span class="ev-pct">${Math.round((ev.reg / ev.cap) * 100)}% full</span>
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
    const list = EVENTS.filter(e => e.status === 'upcoming').slice(0, 3);
    container.innerHTML = list.map(ev => `
    <div class="upcoming-item">
      <div class="up-dot" style="background:${ev.color}"></div>
      <div class="up-info">
        <div class="up-name">${ev.name}</div>
        <div class="up-date">${ev.date}</div>
      </div>
      <span class="up-reg">${ev.reg} reg.</span>
    </div>
  `).join('');
}

/* ============================================
   NOTIFICATIONS
============================================ */
function initNotifications() {
    const btn      = document.getElementById('notifBtn');
    const panel    = document.getElementById('notifPanel');
    const overlay  = document.getElementById('notifOverlay');
    const clearBtn = document.getElementById('notifClear');
    const list     = document.getElementById('notifList');
    if (!btn || !panel) return;

    if (list) {
        list.innerHTML = NOTIFICATIONS.map(n => `
      <div class="notif-item${n.unread ? ' unread' : ''}">
        <div class="notif-dot" style="background:${n.color}"></div>
        <div class="notif-body">
          <div class="notif-text">${n.text}</div>
          <div class="notif-time">${n.time}</div>
        </div>
      </div>
    `).join('');
    }

    const open  = () => { panel.classList.add('open'); overlay?.classList.add('visible'); };
    const close = () => { panel.classList.remove('open'); overlay?.classList.remove('visible'); };

    btn.addEventListener('click', e => { e.stopPropagation(); panel.classList.contains('open') ? close() : open(); });
    overlay?.addEventListener('click', close);
    clearBtn?.addEventListener('click', () => {
        document.querySelectorAll('.notif-item.unread').forEach(el => el.classList.remove('unread'));
        const badge = document.getElementById('notifCount');
        if (badge) { badge.textContent = '0'; badge.style.display = 'none'; }
    });
}

/* ============================================
   PROFILE DROPDOWN
============================================ */
function initProfileDropdown() {
    const trigger  = document.getElementById('profileTrigger');
    const dropdown = document.getElementById('profileDropdown');
    const overlay  = document.getElementById('profileOverlay');
    if (!trigger || !dropdown) return;

    const open  = () => { dropdown.classList.add('open'); overlay?.classList.add('visible'); };
    const close = () => { dropdown.classList.remove('open'); overlay?.classList.remove('visible'); };

    trigger.addEventListener('click', e => { e.stopPropagation(); dropdown.classList.contains('open') ? close() : open(); });
    overlay?.addEventListener('click', close);

    // Logout
    document.getElementById('logoutBtn2')?.addEventListener('click', () => {
        window.location.href = '../auth/signin.html';
    });
}

/* ============================================
   FAB
============================================ */
function initFab() {
    const btn  = document.getElementById('fabBtn');
    const menu = document.getElementById('fabMenu');
    if (!btn || !menu) return;

    btn.addEventListener('click', () => {
        const open = menu.classList.toggle('open');
        btn.classList.toggle('open', open);
    });
    document.addEventListener('click', e => {
        if (!btn.contains(e.target) && !menu.contains(e.target)) {
            menu.classList.remove('open');
            btn.classList.remove('open');
        }
    });
}

/* ============================================
   SIDEBAR (mobile)
============================================ */
function initSidebar() {
    const toggle   = document.getElementById('menuToggle');
    const sidebar  = document.getElementById('sidebar');
    const overlay  = document.getElementById('sidebarOverlay');
    const closeBtn = document.getElementById('sidebarClose');
    if (!toggle || !sidebar) return;

    const open  = () => { sidebar.classList.add('open'); overlay?.classList.add('visible'); document.body.style.overflow = 'hidden'; };
    const close = () => { sidebar.classList.remove('open'); overlay?.classList.remove('visible'); document.body.style.overflow = ''; };

    toggle.addEventListener('click', open);
    overlay?.addEventListener('click', close);
    closeBtn?.addEventListener('click', close);
}

/* ============================================
   EVENZA BANNER DISMISS
============================================ */
function initEvenzaBanner() {
    document.getElementById('evenzaClose')?.addEventListener('click', () => {
        const banner = document.getElementById('evenzaBanner');
        if (!banner) return;
        banner.style.transition = 'opacity .3s ease, transform .3s ease';
        banner.style.opacity = '0';
        banner.style.transform = 'translateY(-6px)';
        setTimeout(() => banner.remove(), 320);
    });
}

/* ============================================
   LOGOUT
============================================ */
function initLogout() {
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        window.location.href = '../auth/signin.html';
    });
}

/* ============================================
   INIT
============================================ */
document.addEventListener('DOMContentLoaded', () => {
    initTopbar();
    initSearch();
    initEventTabs();
    renderUpcoming();
    initNotifications();
    initProfileDropdown();
    initFab();
    initSidebar();
    initEvenzaBanner();
    initLogout();
});