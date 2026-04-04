/* =====================================================
   Planora — Volunteer Dashboard JS
   ===================================================== */

// ─── STARFIELD ───────────────────────────────────────
(function () {
  const canvas = document.getElementById('starfield');
  const ctx    = canvas.getContext('2d');
  let stars    = [];
  const COUNT  = 150;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function initStars() {
    stars = [];
    for (let i = 0; i < COUNT; i++) {
      stars.push({
        x:       Math.random() * canvas.width,
        y:       Math.random() * canvas.height,
        r:       Math.random() * 1.0 + 0.2,
        speed:   Math.random() * 0.10 + 0.025,
        opacity: Math.random() * 0.45 + 0.08,
        drift:   (Math.random() - 0.5) * 0.03,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const s of stars) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${s.opacity})`;
      ctx.fill();
      s.y -= s.speed;
      s.x += s.drift;
      if (s.y < -2)              s.y = canvas.height + 2;
      if (s.x < -2)              s.x = canvas.width  + 2;
      if (s.x > canvas.width+2)  s.x = -2;
    }
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => { resize(); initStars(); });
  resize(); initStars(); draw();
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


// ─── STATUS TOGGLE ───────────────────────────────────
const statusToggle = document.getElementById('statusToggle');
const statusDot    = statusToggle.querySelector('.status-dot');
const statusLabel  = statusToggle.querySelector('.status-label');
let isAvailable    = true;

statusToggle.addEventListener('click', () => {
  isAvailable = !isAvailable;
  statusDot.className   = 'status-dot ' + (isAvailable ? 'available' : 'busy');
  statusLabel.textContent = isAvailable ? 'Available' : 'Busy';
});


// ─── COUNTER ANIMATION ───────────────────────────────
function animateCount(el) {
  const target   = parseInt(el.dataset.target, 10);
  const suffix   = el.dataset.suffix || '';
  const duration = 1100;
  const start    = performance.now();
  function update(now) {
    const p = Math.min((now - start) / duration, 1);
    const e = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.floor(e * target) + suffix;
    if (p < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}


// ─── IMPACT BAR ──────────────────────────────────────
function animateImpactBar() {
  setTimeout(() => {
    const bar = document.getElementById('impactBar');
    if (bar) bar.style.width = '92%'; // 920/1000
  }, 300);
}


// ─── SCROLL REVEAL ───────────────────────────────────
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      entry.target.style.transitionDelay = `${i * 0.07}s`;
      entry.target.classList.add('visible');

      entry.target.querySelectorAll('[data-target]').forEach(animateCount);

      if (entry.target.classList.contains('hero-banner')) {
        animateImpactBar();
      }

      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

revealEls.forEach(el => io.observe(el));


// ─── TASK CHECKBOXES ─────────────────────────────────
document.querySelectorAll('.task-check').forEach(check => {
  check.addEventListener('click', () => {
    const done = check.dataset.done === 'true';
    check.dataset.done = !done;
    check.classList.toggle('checked', !done);
    check.closest('.task-item').classList.toggle('done', !done);
  });
});


// ─── COUNTDOWN ───────────────────────────────────────
const TARGET_MS = Date.now() + (3 * 86400 + 7 * 3600 + 30 * 60) * 1000;

function updateCountdown() {
  const diff  = Math.max(0, TARGET_MS - Date.now());
  const days  = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins  = Math.floor((diff % 3600000)  / 60000);
  const secs  = Math.floor((diff % 60000)    / 1000);
  const pad   = n => String(n).padStart(2, '0');
  document.getElementById('cdDays').textContent  = pad(days);
  document.getElementById('cdHours').textContent = pad(hours);
  document.getElementById('cdMins').textContent  = pad(mins);
  document.getElementById('cdSecs').textContent  = pad(secs);
}
updateCountdown();
setInterval(updateCountdown, 1000);


// ─── HOURS BAR CHART ─────────────────────────────────
const hoursCtx = document.getElementById('hoursChart').getContext('2d');

const hoursGrad = hoursCtx.createLinearGradient(0, 0, 0, 150);
hoursGrad.addColorStop(0,   'rgba(249,115,22,0.8)');
hoursGrad.addColorStop(1,   'rgba(124,58,237,0.5)');

new Chart(hoursCtx, {
  type: 'bar',
  data: {
    labels:   ['W1','W2','W3','W4','W5'],
    datasets: [{
      label:           'Hours',
      data:            [6, 9, 8, 12, 7],
      backgroundColor: hoursGrad,
      borderRadius:    6,
      borderSkipped:   false,
    }],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#111118',
        borderColor:     'rgba(249,115,22,0.3)',
        borderWidth:     1,
        titleColor:      '#f8f8fc',
        bodyColor:       '#a0a0b8',
        padding:         10,
        cornerRadius:    8,
        callbacks: {
          label: ctx => ` ${ctx.parsed.y} hours`,
        },
      },
    },
    scales: {
      x: {
        grid:   { display: false },
        ticks:  { color: '#5c5c78', font: { size: 11, family: 'Manrope' } },
        border: { display: false },
      },
      y: {
        grid:      { color: 'rgba(255,255,255,0.04)' },
        ticks:     { color: '#5c5c78', font: { size: 11, family: 'Manrope' } },
        border:    { display: false },
        beginAtZero: true,
      },
    },
  },
});


// ─── EVENZA INPUT ────────────────────────────────────
const evenzaInput = document.querySelector('.evenza-input');
const evenzaSend  = document.querySelector('.evenza-send');

function handleQuery() {
  const val = evenzaInput.value.trim();
  if (!val) return;
  evenzaInput.value = '';
  console.log('[Evenza] Volunteer query:', val);
}
evenzaSend.addEventListener('click', handleQuery);
evenzaInput.addEventListener('keydown', e => { if (e.key === 'Enter') handleQuery(); });
