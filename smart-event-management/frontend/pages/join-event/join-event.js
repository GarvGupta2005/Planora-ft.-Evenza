/* =============================================
   JOIN EVENT — Planora
   join-event.js
   ============================================= */

'use strict';

const API_BASE = 'http://localhost:5000/api';

/* ---- STATE ---- */
let selectedRole = 'participant';
let currentCode  = '';
let isVerifying  = false;
let verifyTimer  = null;
let eventData    = null;

/* ============================================================
   STARFIELD & UI EFFECTS
   ============================================================ */
(function initStarfield() {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let stars = [];
  const STAR_COUNT = 140;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createStar() {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.2 + 0.2,
      alpha: Math.random() * 0.6 + 0.1,
      speed: Math.random() * 0.3 + 0.05,
      twinkleSpeed: Math.random() * 0.015 + 0.005,
      twinkleDir: Math.random() > 0.5 ? 1 : -1,
    };
  }

  function init() {
    resize();
    stars = Array.from({ length: STAR_COUNT }, createStar);
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const s of stars) {
      s.alpha += s.twinkleSpeed * s.twinkleDir;
      if (s.alpha >= 0.7 || s.alpha <= 0.05) s.twinkleDir *= -1;
      s.y -= s.speed;
      if (s.y < 0) { s.y = canvas.height; s.x = Math.random() * canvas.width; }
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 190, 255, ${s.alpha})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }

  init();
  draw();
  window.addEventListener('resize', resize);
})();

/* ============================================================
   ROLE SELECTION
   ============================================================ */
function selectRole(role, btn) {
  selectedRole = role;
  document.querySelectorAll('.role-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');

  const text = document.getElementById('roleConfirmText');
  if (text) text.textContent = capitalize(role);

  showToast(`Role set to ${capitalize(role)}`, 'info');
}

function scrollToRole() {
  document.getElementById('roleSelector')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/* ============================================================
   CODE BOXES
   ============================================================ */
function initCodeBoxes() {
  const boxes = document.querySelectorAll('.code-box');

  boxes.forEach((box, i) => {
    box.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace') {
        if (!box.value && i > 0) {
          boxes[i - 1].focus();
          boxes[i - 1].value = '';
          boxes[i - 1].classList.remove('filled');
        }
        box.classList.remove('filled');
        onCodeChange();
        return;
      }
      if (e.key === 'ArrowLeft'  && i > 0)              { boxes[i - 1].focus(); return; }
      if (e.key === 'ArrowRight' && i < boxes.length-1) { boxes[i + 1].focus(); return; }
    });

    box.addEventListener('input', (e) => {
      const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      box.value = val.slice(-1);
      box.classList.toggle('filled', !!box.value);
      if (box.value && i < boxes.length - 1) boxes[i + 1].focus();
      onCodeChange();
    });

    box.addEventListener('paste', (e) => {
      e.preventDefault();
      const pasted = (e.clipboardData || window.clipboardData)
        .getData('text')
        .replace(/[^a-zA-Z0-9]/g, '')
        .toUpperCase();
      boxes.forEach((b, idx) => {
        b.value = pasted[idx] || '';
        b.classList.toggle('filled', !!b.value);
      });
      boxes[Math.min(5, pasted.length > 0 ? pasted.length - 1 : 0)].focus();
      onCodeChange();
    });

    box.addEventListener('focus', () => box.select());
  });
}

function onCodeChange() {
  const boxes = document.querySelectorAll('.code-box');
  const code  = Array.from(boxes).map(b => b.value).join('');
  currentCode = code;

  const pasteInput = document.getElementById('pasteInput');
  if (pasteInput) {
    pasteInput.value = code.length > 3
      ? code.slice(0,3) + '-' + code.slice(3)
      : code;
  }

  clearTimeout(verifyTimer);
  hideEventPreview();
  disableJoinBtn();

  if (code.length < 6) {
    setStatus('idle');
    return;
  }

  setStatus('checking');
  verifyTimer = setTimeout(() => verifyCode(code), 650);
}

/* ============================================================
   API CALLS
   ============================================================ */
async function verifyCode(code) {
  isVerifying = true;
  setStatus('checking');

  try {
    const res = await fetch(`${API_BASE}/codes/${code.toUpperCase()}`);
    const data = await res.json();

    if (res.ok && data.data) {
      eventData = data.data;
      setStatus('valid');
      showEventPreview(eventData);
      enableJoinBtn();
      setBoxesState('success');
    } else {
      throw new Error(data.message || 'Invalid code');
    }
  } catch (err) {
    setStatus('error', err.message);
    hideEventPreview();
    disableJoinBtn();
    setBoxesState('error');
    setTimeout(() => setBoxesState(''), 1200);
  } finally {
    isVerifying = false;
  }
}

async function handleJoin() {
  const token = localStorage.getItem('token');
  if (!token) {
    showToast('Please sign in first', 'error');
    setTimeout(() => { window.location.href = '../auth/signin.html'; }, 1000);
    return;
  }

  if (isVerifying || !currentCode) return;

  const btn      = document.getElementById('joinBtn');
  const spinner  = document.getElementById('btnSpinner');
  const btnText  = btn.querySelector('.btn-text');
  const btnArrow = btn.querySelector('.btn-arrow');

  btn.disabled = true;
  spinner.classList.remove('hidden');
  btnText.textContent = 'Joining...';
  btnArrow.classList.add('hidden');

  try {
    const res = await fetch(`${API_BASE}/codes/${currentCode.toUpperCase()}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ role: selectedRole })
    });
    const data = await res.json();

    if (res.ok) {
      saveToHistory(currentCode, selectedRole);
      document.getElementById('successMsg').innerHTML =
        `Successfully joined <strong>${eventData?.title || 'the event'}</strong> as a ${capitalize(selectedRole)}.`;
      document.getElementById('successOverlay').classList.remove('hidden');
    } else {
      throw new Error(data.message || 'Failed to join event');
    }
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    spinner.classList.add('hidden');
    btnText.textContent = 'Join Event';
    btnArrow.classList.remove('hidden');
  }
}

/* ============================================================
   UI HELPERS
   ============================================================ */
function showEventPreview(event) {
  const preview = document.getElementById('eventPreview');
  if (!preview) return;

  document.getElementById('previewIcon').textContent     = '🎯';
  document.getElementById('previewName').textContent     = event.title;
  document.getElementById('previewOrg').textContent      = `Organized by ${event.organizer?.fullName || 'Organizer'}`;
  document.getElementById('previewDate').textContent     = new Date(event.eventDate).toLocaleDateString();
  document.getElementById('previewLocation').textContent = event.venue;
  document.getElementById('previewSpots').textContent    = `${event.capacity} total capacity`;
  document.getElementById('previewDesc').textContent     = event.description;

  const fill = document.getElementById('capacityFill');
  if (fill) fill.style.width = '100%';

  const roleText = document.getElementById('roleConfirmText');
  if (roleText) roleText.textContent = capitalize(selectedRole);

  preview.classList.remove('hidden');
}

function hideEventPreview() {
  document.getElementById('eventPreview')?.classList.add('hidden');
}

function setStatus(type, msg = '') {
  const container = document.getElementById('validationStatus');
  if (!container) return;
  container.querySelectorAll('div').forEach(d => d.classList.add('hidden'));
  const el = container.querySelector(`.status-${type}`);
  if (el) {
    el.classList.remove('hidden');
    if (type === 'error' && msg) {
      const errMsg = document.getElementById('errorMsg');
      if (errMsg) errMsg.textContent = msg;
    }
  }
}

function setBoxesState(state) {
  document.querySelectorAll('.code-box').forEach(b => {
    b.classList.remove('error', 'success');
    if (state) b.classList.add(state);
  });
}

function enableJoinBtn()  { document.getElementById('joinBtn').disabled = false; }
function disableJoinBtn() { document.getElementById('joinBtn').disabled = true; }

function goToDashboard() {
  const route = selectedRole === 'volunteer'
    ? '../volunteer/overview/overview.html'
    : '../participant/overview/overview.html';
  window.location.href = route;
}

function clearCode() {
  document.querySelectorAll('.code-box').forEach(b => {
    b.value = '';
    b.classList.remove('filled', 'error', 'success');
  });
  const pasteInput = document.getElementById('pasteInput');
  if (pasteInput) pasteInput.value = '';
  currentCode = '';
  setStatus('idle');
  hideEventPreview();
  disableJoinBtn();
  document.querySelector('.code-box')?.focus();
}

/* ============================================================
   HISTORY (localStorage)
   ============================================================ */
const HISTORY_KEY = 'planora_join_history';
function saveToHistory(code, role) {
  let history = getHistory();
  history = history.filter(h => h.code !== code.toUpperCase());
  history.unshift({ code: code.toUpperCase(), role, time: Date.now() });
  if (history.length > 5) history = history.slice(0, 5);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  renderHistory();
}
function getHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch { return []; }
}
function renderHistory() {
  const list = document.getElementById('recentList');
  const section = document.getElementById('recentSection');
  const history = getHistory();
  if (!history.length) { section.style.display = 'none'; return; }
  section.style.display = 'block';
  list.innerHTML = history.map(item => `
    <div class="recent-item" onclick="fillFromHistory('${item.code}', '${item.role}')">
      <span class="recent-code">${item.code.slice(0,3)}-${item.code.slice(3)}</span>
      <div class="recent-meta"><span class="recent-role">${capitalize(item.role)}</span></div>
    </div>
  `).join('');
}
function fillFromHistory(code, role) {
  const boxes = document.querySelectorAll('.code-box');
  boxes.forEach((b, i) => { b.value = code[i] || ''; b.classList.toggle('filled', !!b.value); });
  const roleBtn = document.querySelector(`.role-tab[data-role="${role}"]`);
  if (roleBtn) selectRole(role, roleBtn);
  onCodeChange();
}

/* ============================================================
   UTILS
   ============================================================ */
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<div class="toast-dot"></div><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('toast-out');
    toast.addEventListener('animationend', () => toast.remove());
  }, 3000);
}
function capitalize(str) { return str.charAt(0).toUpperCase() + str.slice(1); }

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initCodeBoxes();
  renderHistory();
  const pasteInput = document.getElementById('pasteInput');
  if (pasteInput) {
    pasteInput.addEventListener('input', () => {
      const raw = pasteInput.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6);
      const boxes = document.querySelectorAll('.code-box');
      boxes.forEach((b, i) => { b.value = raw[i] || ''; b.classList.toggle('filled', !!b.value); });
      onCodeChange();
    });
  }
  document.querySelector('.code-box')?.focus();
});