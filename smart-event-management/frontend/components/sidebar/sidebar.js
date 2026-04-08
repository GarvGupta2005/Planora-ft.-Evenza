/* ============================================
   PLANORA — Shared Sidebar Component
   Usage: Include sidebar.css + sidebar.js on any page
   Then call: PlanoraSidebar.init({ activePage: 'home' })
============================================ */

'use strict';

const PlanoraSidebar = (() => {

    // ---- Configuration ----
    // Sidebar structure requested:
    // Main: Home / Add Event / Join Event
    // Manage: Organizer (dropdown), Participant (dropdown), Volunteer (dropdown)
    const NAV = {
        main: [
            { id: 'home', label: 'Home', path: '/home/home.html',
                icon: '<svg class="nav-icon" viewBox="0 0 20 20" fill="none"><path d="M3 9.5L10 3l7 6.5V17a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M7 18V12h6v6" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>' },
            { id: 'add-event', label: 'Add Event', path: '/add-event/add-event.html',
                icon: '<svg class="nav-icon" viewBox="0 0 20 20" fill="none"><rect x="3" y="4" width="14" height="14" rx="2" stroke="currentColor" stroke-width="1.4"/><path d="M3 8h14M7 2v4M13 2v4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M10 11v4M8 13h4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>' },
            { id: 'join-event', label: 'Join Event', path: '/join-event/join-event.html',
                icon: '<svg class="nav-icon" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="1.4"/><path d="M10 7v6M7 10h6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>' },
        ],
        manage: [
            {
                id: 'group-organizer',
                label: 'Organizer',
                icon: '<svg class="nav-icon" viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.4"/><rect x="11" y="3" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.4"/><rect x="3" y="11" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.4"/><rect x="11" y="11" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.4"/></svg>',
                items: [
                    { id: 'org-overview', label: 'Overview', path: '/organizer/overview/overview.html' },
                    { id: 'org-my-events', label: 'My Events', path: '/organizer/my-events/my-events.html' },
                    { id: 'org-registrations', label: 'Registrations', path: '/organizer/registrations/registrations.html' },
                    { id: 'org-attendance', label: 'Attendance', path: '/organizer/attendance/attendance.html' },
                    { id: 'org-volunteers', label: 'Volunteers', path: '/organizer/volunteers/volunteers.html' },
                    { id: 'org-feedback', label: 'Feedback', path: '/organizer/feedback/feedback.html' },
                    { id: 'org-messages', label: 'Messages', path: '/organizer/messages/messages.html' },
                ],
            },
            {
                id: 'group-participant',
                label: 'Participant',
                icon: '<svg class="nav-icon" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="7" r="4" stroke="currentColor" stroke-width="1.4"/><path d="M3 18c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
                items: [
                    { id: 'p-overview', label: 'Overview', path: '/participant/overview/overview.html' },
                    { id: 'p-my-events', label: 'My Events', path: '/participant/my-events/my-events.html' },
                    { id: 'p-certs', label: 'Certificates', path: '/participant/certificates/certificates.html' },
                    { id: 'p-feedback', label: 'Feedback', path: '/participant/feedback/feedback.html' },
                ],
            },
            {
                id: 'group-volunteer',
                label: 'Volunteer',
                icon: '<svg class="nav-icon" viewBox="0 0 20 20" fill="none"><path d="M10 3c0 0-6 3.5-6 8a6 6 0 0012 0c0-4.5-6-8-6-8z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>',
                items: [
                    { id: 'v-overview', label: 'Overview', path: '/volunteer/overview/overview.html' },
                    { id: 'v-tasks', label: 'My Tasks', path: '/volunteer/my-tasks/my-tasks.html' },
                    { id: 'v-events', label: 'My Events', path: '/volunteer/my-events/my-events.html' },
                    { id: 'v-messages', label: 'Messages', path: '/volunteer/messages/messages.html' },
                ],
            },
        ],
    };

    // ---- Build HTML ----
    function normalizeBasePath(basePath) {
        if (!basePath) return '';
        return basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
    }

    function hrefFor(basePath, path) {
        const base = normalizeBasePath(basePath);
        return `${base}${path}`;
    }

    function inferActiveFromLocation() {
        const p = (window.location.pathname || '').toLowerCase();
        if (p.includes('/pages/home/')) return 'home';
        if (p.includes('/pages/add-event/')) return 'add-event';
        if (p.includes('/pages/join-event/')) return 'join-event';
        if (p.includes('/pages/organizer/overview/')) return 'org-overview';
        if (p.includes('/pages/organizer/registrations/')) return 'org-registrations';
        if (p.includes('/pages/organizer/my-events/')) return 'org-my-events';
        if (p.includes('/pages/organizer/volunteers/')) return 'org-volunteers';
        if (p.includes('/pages/organizer/attendance/')) return 'org-attendance';
        if (p.includes('/pages/organizer/feedback/')) return 'org-feedback';
        if (p.includes('/pages/organizer/messages/')) return 'org-messages';
        if (p.includes('/pages/participant/overview/')) return 'p-overview';
        if (p.includes('/pages/participant/my-events/')) return 'p-my-events';
        if (p.includes('/pages/participant/certificates/')) return 'p-certs';
        if (p.includes('/pages/participant/feedback/')) return 'p-feedback';
        if (p.includes('/pages/volunteer/overview/')) return 'v-overview';
        if (p.includes('/pages/volunteer/my-tasks/')) return 'v-tasks';
        if (p.includes('/pages/volunteer/my-events/')) return 'v-events';
        if (p.includes('/pages/volunteer/messages/')) return 'v-messages';
        return '';
    }

    function buildSidebarHTML({ activePage, basePath }) {
        let navHTML = '';

        // Main section
        navHTML += `<div class="nav-section-label">Main</div>`;
        NAV.main.forEach(item => {
            const isActive = item.id === activePage ? ' active' : '';
            navHTML += `
                <a href="${hrefFor(basePath, item.path)}" class="nav-item${isActive}" data-page="${item.id}">
                    ${item.icon}
                    <span>${item.label}</span>
                </a>`;
        });

        // Manage section w/ dropdown groups
        navHTML += `<div class="nav-section-label">Manage</div>`;
        navHTML += `<div class="nav-group">`;

        NAV.manage.forEach(group => {
            const groupOpen = group.items.some(i => i.id === activePage);
            navHTML += `
              <button class="nav-group-toggle" type="button" data-group="${group.id}" aria-expanded="${groupOpen ? 'true' : 'false'}">
                <span class="nav-group-left">
                  ${group.icon}
                  <span class="nav-group-label">${group.label}</span>
                </span>
                <svg class="nav-group-caret" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M3 5l4 4 4-4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
                </svg>
              </button>
              <div class="nav-sub ${groupOpen ? 'open' : ''}" data-sub="${group.id}">
                ${group.items.map(item => {
                    const isActive = item.id === activePage ? ' active' : '';
                    return `
                      <a href="${hrefFor(basePath, item.path)}" class="nav-item${isActive}" data-page="${item.id}">
                        <svg class="nav-icon" viewBox="0 0 20 20" fill="none"><path d="M6 10l2 2 6-6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        <span>${item.label}</span>
                      </a>`;
                }).join('')}
              </div>
            `;
        });

        navHTML += `</div>`;

        return `
        <aside class="sidebar" id="sidebar">
            <div class="sidebar-top">
                <a href="${hrefFor(basePath, '/home/home.html')}" class="sidebar-logo">
                    <span class="logo-hex">⬡</span>
                    <span class="logo-name">Planora</span>
                </a>
                <button class="sidebar-close" id="sidebarClose" aria-label="Close sidebar">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 4l10 10M14 4L4 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                </button>
            </div>

            <nav class="sidebar-nav">
                ${navHTML}
            </nav>

            <div class="sidebar-footer">
                <div class="sidebar-evenza">
                    <div class="sidebar-evenza-icon">✦</div>
                    <div>
                        <span class="sidebar-evenza-name">Evenza AI</span>
                        <span class="sidebar-evenza-status">Active · Ready</span>
                    </div>
                    <div class="sidebar-evenza-ping"></div>
                </div>
                <div class="sidebar-user" id="sidebarUser">
                    <div class="user-avatar" id="sidebarUserAvatar">AK</div>
                    <div class="user-info">
                        <span class="user-name" id="sidebarUserName">User</span>
                        <span class="user-role" id="sidebarUserRole">Organizer</span>
                    </div>
                    <button class="user-logout" id="sidebarLogoutBtn" title="Sign out">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                </div>
            </div>
        </aside>
        <div class="sidebar-overlay" id="sidebarOverlay"></div>`;
    }

    // ---- Inject & Init ----
    function init(options = {}) {
        const {
            activePage = '',
            basePath = '../../pages',
            container = document.body,
            user = null,
        } = options;

        const resolvedActive = activePage || inferActiveFromLocation();

        // Inject at start of container
        const wrapper = document.createElement('div');
        wrapper.innerHTML = buildSidebarHTML({ activePage: resolvedActive, basePath });

        // Insert sidebar and overlay before the first child
        while (wrapper.firstChild) {
            container.insertBefore(wrapper.firstChild, container.firstChild);
        }

        // Set user info if provided
        if (user) {
            const setEl = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
            setEl('sidebarUserAvatar', user.initials || 'U');
            setEl('sidebarUserName', user.name || 'User');
            setEl('sidebarUserRole', user.role || 'Member');
        }

        // Wire up mobile toggle
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        const closeBtn = document.getElementById('sidebarClose');
        const menuToggle = document.getElementById('menuToggle');

        function openSidebar() {
            if (sidebar) sidebar.classList.add('open');
            if (overlay) overlay.classList.add('visible');
            document.body.style.overflow = 'hidden';
        }
        function closeSidebar() {
            if (sidebar) sidebar.classList.remove('open');
            if (overlay) overlay.classList.remove('visible');
            document.body.style.overflow = '';
        }

        if (menuToggle) menuToggle.addEventListener('click', openSidebar);
        if (overlay) overlay.addEventListener('click', closeSidebar);
        if (closeBtn) closeBtn.addEventListener('click', closeSidebar);

        // Logout
        const logoutBtn = document.getElementById('sidebarLogoutBtn');
        if (logoutBtn) logoutBtn.addEventListener('click', () => {
            // Auth pages live at /pages/auth/
            const bp = normalizeBasePath(basePath);
            window.location.href = bp.endsWith('/pages') ? `${bp}/auth/signin.html` : `${bp}/pages/auth/signin.html`;
        });

        // Dropdown toggles
        document.querySelectorAll('.nav-group-toggle').forEach(btn => {
            btn.addEventListener('click', () => {
                const groupId = btn.getAttribute('data-group');
                const expanded = btn.getAttribute('aria-expanded') === 'true';
                btn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
                const sub = document.querySelector(`.nav-sub[data-sub="${groupId}"]`);
                if (sub) sub.classList.toggle('open', !expanded);
            });
        });
    }

    return { init };
})();
