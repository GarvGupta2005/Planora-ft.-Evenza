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

document.addEventListener('DOMContentLoaded', () => {
  initSidebarShell();
  initLogout();
  initTopbarDate();
});

