/* =====================================================
   Planora — Participant Dashboard JS
   ===================================================== */

// ─── STARFIELD ───────────────────────────────────────
(function () {
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  let stars = [];
  const STAR_COUNT = 150;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function initStars() {
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x:       Math.random() * canvas.width,
        y:       Math.random() * canvas.height,
        r:       Math.random() * 1.0 + 0.2,
        speed:   Math.random() * 0.10 + 0.03,
        opacity: Math.random() * 0.45 + 0.08,
        drift:   (Math.random() - 0.5) * 0.035,
      });
    }
  }

  function drawStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const s of stars) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${s.opacity})`;
      ctx.fill();
      s.y -= s.speed;
      s.x += s.drift;
      if (s.y < -2)             s.y = canvas.height + 2;
      if (s.x < -2)             s.x = canvas.width  + 2;
      if (s.x > canvas.width+2) s.x = -2;
    }
    requestAnimationFrame(drawStars);
  }

  window.addEventListener('resize', () => { resize(); initStars(); });
  resize(); initStars(); drawStars();
})();


// ─── SIDEBAR TOGGLE ──────────────────────────────────
const sidebar       = document.getElementById('sidebar');
const mainContent   = document.getElementById('mainContent');
const sidebarToggle = document.getElementById('sidebarToggle');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');

sidebarToggle.addEventListener('click', () => {
  sidebar.classList.toggle('collapsed');
  mainContent.classList.toggle('expanded');
});
mobileMenuBtn.addEventListener('click', () => {
  sidebar.classList.toggle('mobile-open');
});
document.addEventListener('click', (e) => {
  if (window.innerWidth <= 900 &&
      !sidebar.contains(e.target) &&
      !mobileMenuBtn.contains(e.target)) {
    sidebar.classList.remove('mobile-open');
  }
});


// ─── COUNTER ANIMATION ───────────────────────────────
function animateCount(el) {
  const target   = parseInt(el.dataset.target, 10);
  const suffix   = el.dataset.suffix || '';
  const duration = 1000;
  const start    = performance.now();
  function update(now) {
    const p = Math.min((now - start) / duration, 1);
    const e = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.floor(e * target) + suffix;
    if (p < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}


// ─── PROGRESS RING ───────────────────────────────────
function animateRing(percent) {
  const ring = document.getElementById('attendanceRing');
  if (!ring) return;
  // circumference = 2π × 50 ≈ 314
  const circumference = 314;
  const offset = circumference - (percent / 100) * circumference;

  // inject SVG gradient
  const svg = ring.closest('svg');
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  defs.innerHTML = `
    <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#7c3aed"/>
      <stop offset="100%" stop-color="#0ea5e9"/>
    </linearGradient>`;
  svg.prepend(defs);
  ring.setAttribute('stroke', 'url(#ringGrad)');

  setTimeout(() => {
    ring.style.strokeDashoffset = offset;
  }, 200);
}


// ─── COUNTDOWN ───────────────────────────────────────
// Target: April 14, 2025 10:00 AM IST
// For demo, use a fixed future offset from now
const TARGET_MS = Date.now() + (3 * 86400 + 14 * 3600 + 32 * 60) * 1000;

function updateCountdown() {
  const diff = Math.max(0, TARGET_MS - Date.now());
  const days  = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins  = Math.floor((diff % 3600000)  / 60000);
  const secs  = Math.floor((diff % 60000)    / 1000);

  const pad = n => String(n).padStart(2, '0');
  document.getElementById('cdDays').textContent  = pad(days);
  document.getElementById('cdHours').textContent = pad(hours);
  document.getElementById('cdMins').textContent  = pad(mins);
  document.getElementById('cdSecs').textContent  = pad(secs);
}
updateCountdown();
setInterval(updateCountdown, 1000);


// ─── SCROLL REVEAL ───────────────────────────────────
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      entry.target.style.transitionDelay = `${i * 0.07}s`;
      entry.target.classList.add('visible');

      // counters
      entry.target.querySelectorAll('.stat-value[data-target], .ws-val[data-target]')
        .forEach(animateCount);

      // ring (welcome banner)
      if (entry.target.classList.contains('welcome-banner')) {
        animateRing(89);
      }

      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

revealEls.forEach(el => io.observe(el));


// ─── EVENZA INPUT ────────────────────────────────────
const evenzaInput = document.querySelector('.evenza-input');
const evenzaSend  = document.querySelector('.evenza-send');

function handleQuery() {
  const val = evenzaInput.value.trim();
  if (!val) return;
  evenzaInput.value = '';
  console.log('[Evenza] Participant query:', val);
}
evenzaSend.addEventListener('click', handleQuery);
evenzaInput.addEventListener('keydown', e => { if (e.key === 'Enter') handleQuery(); });


// ─── CHART TABS (type="button") ──────────────────────
document.querySelectorAll('.chart-tab').forEach(t => t.setAttribute('type','button'));
