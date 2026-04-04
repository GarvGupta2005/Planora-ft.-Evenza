/* =====================================================
   Planora — Organizer Dashboard JS
   ===================================================== */

// ─── STARFIELD ───────────────────────────────────────
(function () {
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  let stars = [];
  const STAR_COUNT = 160;

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
        r:       Math.random() * 1.1 + 0.2,
        speed:   Math.random() * 0.12 + 0.03,
        opacity: Math.random() * 0.5 + 0.1,
        drift:   (Math.random() - 0.5) * 0.04,
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

      // gentle drift
      s.y -= s.speed;
      s.x += s.drift;

      // wrap around
      if (s.y < -2)              s.y = canvas.height + 2;
      if (s.x < -2)              s.x = canvas.width  + 2;
      if (s.x > canvas.width+2)  s.x = -2;
    }
    requestAnimationFrame(drawStars);
  }

  window.addEventListener('resize', () => { resize(); initStars(); });
  resize();
  initStars();
  drawStars();
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

// close sidebar when clicking outside on mobile
document.addEventListener('click', (e) => {
  if (window.innerWidth <= 900 &&
      !sidebar.contains(e.target) &&
      !mobileMenuBtn.contains(e.target)) {
    sidebar.classList.remove('mobile-open');
  }
});


// ─── STAT COUNTER ANIMATION ──────────────────────────
function animateCount(el) {
  const target = parseInt(el.dataset.target, 10);
  const suffix = el.dataset.suffix || '';
  const duration = 1200;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}


// ─── SCROLL REVEAL ───────────────────────────────────
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      entry.target.style.transitionDelay = `${i * 0.06}s`;
      entry.target.classList.add('visible');

      // trigger counters inside stat cards
      entry.target.querySelectorAll('.stat-value[data-target]').forEach(animateCount);
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

revealEls.forEach(el => io.observe(el));


// ─── CHART.JS REGISTRATION TREND ─────────────────────
const chartData = {
  '7D': {
    labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    data:   [42, 78, 55, 91, 63, 110, 84],
  },
  '30D': {
    labels: ['W1','W2','W3','W4'],
    data:   [210, 340, 290, 408],
  },
  'All': {
    labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    data:   [120,180,95,260,310,200,400,350,420,510,380,480],
  },
};

const chartCtx = document.getElementById('registrationChart').getContext('2d');

const gradient = chartCtx.createLinearGradient(0, 0, 0, 180);
gradient.addColorStop(0,   'rgba(124,58,237,0.35)');
gradient.addColorStop(1,   'rgba(124,58,237,0.01)');

let currentDataset = '7D';

const registrationChart = new Chart(chartCtx, {
  type: 'line',
  data: {
    labels:   chartData['7D'].labels,
    datasets: [{
      label:           'Registrations',
      data:            chartData['7D'].data,
      borderColor:     '#7c3aed',
      borderWidth:     2,
      pointBackgroundColor: '#7c3aed',
      pointRadius:     4,
      pointHoverRadius: 6,
      fill:            true,
      backgroundColor: gradient,
      tension:         0.45,
    }],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#111118',
        borderColor: 'rgba(124,58,237,0.35)',
        borderWidth: 1,
        titleColor: '#f8f8fc',
        bodyColor: '#a0a0b8',
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#5c5c78', font: { size: 11, family: 'Manrope' } },
        border: { display: false },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#5c5c78', font: { size: 11, family: 'Manrope' } },
        border: { display: false },
        beginAtZero: true,
      },
    },
  },
});

// Chart tab switching
document.querySelectorAll('.chart-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const key = tab.textContent.trim();
    registrationChart.data.labels   = chartData[key].labels;
    registrationChart.data.datasets[0].data = chartData[key].data;
    registrationChart.update('active');
  });
});


// ─── EVENZA AI INPUT ──────────────────────────────────
const evenzaInput = document.querySelector('.evenza-input');
const evenzaSend  = document.querySelector('.evenza-send');

function handleEvenzaQuery() {
  const val = evenzaInput.value.trim();
  if (!val) return;
  evenzaInput.value = '';
  // placeholder: just clear for now; real integration would POST to API
  console.log('[Evenza] Query:', val);
}

evenzaSend.addEventListener('click', handleEvenzaQuery);
evenzaInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleEvenzaQuery();
});


// ─── CHART TAB ARIA ──────────────────────────────────
document.querySelectorAll('.chart-tab').forEach(tab => {
  tab.setAttribute('type', 'button');
});
