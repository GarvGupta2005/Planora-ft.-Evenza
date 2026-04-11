/* ============================================
   PLANORA SHARED UI — ui.js
   Lightweight helpers for the dashboard shell.
============================================ */
'use strict';

function initSidebarShell() {
  const toggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const closeBtn = document.getElementById('sidebarClose');

  if (!toggle || !sidebar) return;

  const open = () => {
    sidebar.classList.add('open');
    overlay?.classList.add('visible');
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    sidebar.classList.remove('open');
    overlay?.classList.remove('visible');
    document.body.style.overflow = '';
  };

  toggle.addEventListener('click', open);
  overlay?.addEventListener('click', close);
  closeBtn?.addEventListener('click', close);
}

function initLogout() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (!logoutBtn) return;

  logoutBtn.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '../../auth/signin.html';
  });
}

function initTopbarDate() {
  const dateEl = document.getElementById('topbarDate');
  if (!dateEl) return;
  const now = new Date();
  dateEl.textContent = now.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function initUserUI() {
  const userData = localStorage.getItem('user');
  if (!userData) return;

  try {
    const user = JSON.parse(userData);
    const fullName = user.fullName || 'User';
    const role = (user.roles && user.roles.length > 0) ? user.roles[0] : 'Participant';
    
    // Capitalize role for display
    const displayRole = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
    
    // Calculate initials
    const initials = fullName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);

    // Update sidebar name
    const sidebarName = document.querySelector('.sidebar-user .user-name');
    if (sidebarName) sidebarName.textContent = fullName;

    // Update sidebar role
    const sidebarRole = document.querySelector('.sidebar-user .user-role');
    if (sidebarRole) sidebarRole.textContent = displayRole;

    // Update sidebar avatar initials
    const sidebarAvatar = document.querySelector('.sidebar-user .user-avatar');
    if (sidebarAvatar) sidebarAvatar.textContent = initials;

    // Update topbar avatar initials
    const topbarAvatar = document.querySelector('.topbar-avatar');
    if (topbarAvatar) topbarAvatar.textContent = initials;

    // Update top right role if exists
    const topbarRole = document.querySelector('.pt-role');
    if (topbarRole) topbarRole.textContent = displayRole;

  } catch (err) {
    console.error('Error parsing user data for UI:', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initSidebarShell();
  initLogout();
  initTopbarDate();
  initUserUI();
});

