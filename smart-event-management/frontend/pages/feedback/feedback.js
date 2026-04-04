/* ============================================================
   Planora — Feedback Page JS
   ============================================================ */

'use strict';

// ── Starfield ──────────────────────────────────────────────
(function initStarfield() {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, stars = [];
  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  function createStars(n = 150) {
    stars = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.2 + 0.2, a: Math.random(),
      speed: Math.random() * 0.004 + 0.002,
    }));
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    stars.forEach(s => {
      s.a += s.speed;
      const alpha = (Math.sin(s.a) * 0.5 + 0.5) * 0.65 + 0.1;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,200,255,${alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  resize(); createStars(); draw();
  window.addEventListener('resize', () => { resize(); createStars(); });
})();

// ── Data ───────────────────────────────────────────────────
const AVATAR_COLORS = [
  '#7c3aed','#2563eb','#db2777','#d97706','#059669',
  '#0891b2','#c026d3','#16a34a','#ea580c','#7c3aed',
];

const COMMENTS = [
  "Absolutely fantastic event! The speakers were world-class and the content was incredibly relevant. I left with actionable insights I could apply immediately.",
  "Great organization overall. The networking sessions were the highlight for me. Would love to see more of these structured interactions next time.",
  "The venue was a bit cramped and the Wi-Fi was unreliable, but the content more than made up for it. The keynote was truly inspiring.",
  "Really enjoyed the workshops. Very hands-on and practical. The facilitators were knowledgeable and kept the energy high throughout.",
  "Good event but felt a bit rushed. Some sessions were too short to fully explore the topics. More time for Q&A would be appreciated.",
  "Exceptional experience from start to finish. The team handled everything professionally and the agenda was perfectly paced.",
  "The registration process was smooth and the welcome session set the tone well. Would definitely attend again next year.",
  "Mixed feelings. The morning sessions were excellent but the afternoon ones felt repetitive. Still worth attending overall.",
  "Outstanding content but the catering was below average for the ticket price. Minor issue in an otherwise great event.",
  "The best event in this field I've attended in years. The diversity of speakers and perspectives was refreshing and thought-provoking.",
  "Solid event with good takeaways. The app for scheduling was really helpful. A few technical hiccups but nothing major.",
  "I was impressed by the level of detail in the agenda. Every minute was accounted for and transitions were seamless.",
  "The panel discussions were the most valuable part. Getting different viewpoints on the same issue was really enlightening.",
  "Good event, though I expected more advanced content given the target audience. Some sessions felt too introductory.",
  "Loved the interactive format of the workshops. Much better than sitting through pure lectures for hours on end.",
  "The location was convenient and the facilities were top-notch. Really appreciated the quiet working spaces between sessions.",
];

const TAGS_POOL = [
  ['Content', 'Speakers', 'Organization'],
  ['Networking', 'Workshops', 'Format'],
  ['Venue', 'Logistics', 'Catering'],
  ['Content', 'Pacing', 'Value'],
  ['Speakers', 'Workshops', 'Interactive'],
  ['Organization', 'App', 'Schedule'],
];

const FIRST_NAMES = ['Alex','Jordan','Morgan','Taylor','Casey','Riley','Quinn','Avery','Blake','Drew',
  'Sam','Jamie','Charlie','Skyler','Reese','Finley','Cameron','Dakota','Hayden','Peyton'];
const LAST_NAMES  = ['Chen','Patel','Kim','Smith','Johnson','Williams','Brown','Garcia','Martinez','Lee',
  'Thompson','White','Harris','Clark','Lewis','Robinson','Walker','Hall','Young','Allen'];

function randomDate() {
  const days = Math.floor(Math.random() * 14);
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function generateFeedback(count = 94) {
  // Weighted ratings: more 5s and 4s
  const ratingWeights = [0, 2, 4, 14, 32, 42]; // index = rating
  const totalWeight   = ratingWeights.reduce((a, b) => a + b, 0);

  function weightedRating() {
    let r = Math.random() * totalWeight;
    for (let i = 1; i <= 5; i++) { r -= ratingWeights[i]; if (r <= 0) return i; }
    return 5;
  }

  function sentimentFromRating(r) {
    if (r >= 4) return 'positive';
    if (r === 3) return 'neutral';
    return 'negative';
  }

  return Array.from({ length: count }, (_, i) => {
    const fn = FIRST_NAMES[i % FIRST_NAMES.length];
    const ln = LAST_NAMES[Math.floor(i / FIRST_NAMES.length) % LAST_NAMES.length];
    const rating = weightedRating();
    return {
      id:        i + 1,
      name:      `${fn} ${ln}`,
      initials:  `${fn[0]}${ln[0]}`,
      color:     AVATAR_COLORS[i % AVATAR_COLORS.length],
      rating,
      comment:   COMMENTS[i % COMMENTS.length],
      tags:      TAGS_POOL[i % TAGS_POOL.length],
      date:      randomDate(),
      sentiment: sentimentFromRating(rating),
    };
  });
}

// ── State ──────────────────────────────────────────────────
const STATE = {
  feedback:    generateFeedback(),
  filter:      'all',
  search:      '',
  sort:        'newest',
  currentPage: 1,
  perPage:     12,
};

// ── Helpers ────────────────────────────────────────────────
function showToast(msg, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = `toast toast-${type} show`;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('show'), 3000);
}

function starsHTML(rating, size = 13) {
  return Array.from({ length: 5 }, (_, i) => {
    const filled = i < rating;
    return `<svg class="star ${filled ? 'star-filled' : 'star-empty'}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${filled ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
  }).join('');
}

function animateCounter(el, target, suffix = '') {
  if (!el) return;
  const start = parseInt(el.textContent) || 0;
  const dur = 800, t0 = performance.now();
  function step(now) {
    const p = Math.min((now - t0) / dur, 1);
    const e = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(start + (target - start) * e) + suffix;
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ── Analytics Rendering ────────────────────────────────────
function renderAnalytics() {
  const all = STATE.feedback;
  const total = all.length;

  // Rating breakdown
  const counts = [0,0,0,0,0,0]; // index 1-5
  all.forEach(f => counts[f.rating]++);

  const ratingBars = document.getElementById('ratingBars');
  if (ratingBars) {
    ratingBars.innerHTML = [5,4,3,2,1].map(r => `
      <div class="rating-bar-row">
        <span class="rating-bar-label">${r} ★</span>
        <div class="rating-bar-track">
          <div class="rating-bar-fill fill-${r}" style="width:0%" data-pct="${Math.round((counts[r]/total)*100)}"></div>
        </div>
        <span class="rating-bar-count">${counts[r]}</span>
      </div>
    `).join('');
  }

  // Overall stars
  const overallStars = document.getElementById('overallStars');
  if (overallStars) overallStars.innerHTML = starsHTML(4, 14);

  // Category scores
  const categories = [
    { name: 'Content Quality',     score: 4.5 },
    { name: 'Speaker Quality',     score: 4.7 },
    { name: 'Organization',        score: 4.1 },
    { name: 'Venue & Logistics',   score: 3.6 },
    { name: 'Networking',          score: 4.3 },
    { name: 'Overall Value',       score: 4.2 },
  ];
  const catEl = document.getElementById('categoryScores');
  if (catEl) {
    catEl.innerHTML = categories.map(c => `
      <div class="category-row">
        <div class="category-header">
          <span class="category-name">${c.name}</span>
          <span class="category-score">${c.score}</span>
        </div>
        <div class="category-track">
          <div class="category-fill" style="width:0%" data-pct="${(c.score/5)*100}"></div>
        </div>
      </div>
    `).join('');
  }

  // Sentiment donut
  const positive = all.filter(f => f.sentiment === 'positive').length;
  const neutral  = all.filter(f => f.sentiment === 'neutral').length;
  const negative = all.filter(f => f.sentiment === 'negative').length;
  renderDonut(positive, neutral, negative, total);

  // Update tab counts
  const tabCounts = document.querySelectorAll('.tab-count[data-rating]');
  tabCounts.forEach(el => {
    const r = parseInt(el.dataset.rating);
    el.textContent = counts[r] || 0;
  });
  // Low tab
  const lowCount = counts[1] + counts[2];
  const lowTab   = document.querySelector('.filter-tab[data-filter="low"] .tab-count');
  if (lowTab) lowTab.textContent = lowCount;

  // Animate bars after small delay
  setTimeout(() => {
    document.querySelectorAll('.rating-bar-fill').forEach(el => {
      el.style.width = el.dataset.pct + '%';
    });
    document.querySelectorAll('.category-fill').forEach(el => {
      el.style.width = el.dataset.pct + '%';
    });
  }, 300);
}

function renderDonut(positive, neutral, negative, total) {
  const svg = document.getElementById('donutSvg');
  if (!svg) return;

  const cx = 60, cy = 60, r = 46, stroke = 14;
  const circ = 2 * Math.PI * r;

  const segments = [
    { value: positive, color: '#7c3aed' },
    { value: neutral,  color: '#f59e0b' },
    { value: negative, color: '#ef4444' },
  ];

  let offset = -circ * 0.25; // start from top
  const parts = segments.map(seg => {
    const len = (seg.value / total) * circ;
    const part = { ...seg, len, offset };
    offset += len;
    return part;
  });

  svg.innerHTML = `
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="${stroke}"/>
    ${parts.map(p => `
      <circle cx="${cx}" cy="${cy}" r="${r}"
        fill="none"
        stroke="${p.color}"
        stroke-width="${stroke}"
        stroke-dasharray="${p.len} ${circ - p.len}"
        stroke-dashoffset="${-p.offset}"
        stroke-linecap="butt"
        style="transition: stroke-dasharray 1.2s ease"
        opacity="0.85"
      />
    `).join('')}
  `;

  const legend = document.getElementById('sentimentLegend');
  if (legend) {
    const items = [
      { label: 'Positive', value: positive, color: '#7c3aed', pct: Math.round((positive/total)*100) },
      { label: 'Neutral',  value: neutral,  color: '#f59e0b', pct: Math.round((neutral/total)*100) },
      { label: 'Negative', value: negative, color: '#ef4444', pct: Math.round((negative/total)*100) },
    ];
    legend.innerHTML = items.map(item => `
      <div class="legend-row">
        <div class="legend-left">
          <span class="legend-dot-sm" style="background:${item.color}"></span>
          <span>${item.label}</span>
        </div>
        <span class="legend-pct">${item.pct}%</span>
      </div>
    `).join('');
  }
}

// ── Filtered Data ──────────────────────────────────────────
function getFiltered() {
  let data = [...STATE.feedback];

  if (STATE.filter !== 'all') {
    if (STATE.filter === 'low') {
      data = data.filter(f => f.rating <= 2);
    } else {
      const r = parseInt(STATE.filter);
      data = data.filter(f => f.rating === r);
    }
  }

  if (STATE.search.trim()) {
    const q = STATE.search.toLowerCase();
    data = data.filter(f =>
      f.name.toLowerCase().includes(q) ||
      f.comment.toLowerCase().includes(q) ||
      f.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  switch (STATE.sort) {
    case 'oldest':  data.sort((a, b) => a.id - b.id);           break;
    case 'highest': data.sort((a, b) => b.rating - a.rating);   break;
    case 'lowest':  data.sort((a, b) => a.rating - b.rating);   break;
    default:        data.sort((a, b) => b.id - a.id);           break;
  }

  return data;
}

// ── Render Cards ───────────────────────────────────────────
function renderCards() {
  const filtered = getFiltered();
  const start    = (STATE.currentPage - 1) * STATE.perPage;
  const paged    = filtered.slice(start, start + STATE.perPage);

  const grid      = document.getElementById('feedbackGrid');
  const emptyState = document.getElementById('emptyState');

  if (filtered.length === 0) {
    grid.innerHTML = '';
    emptyState.classList.remove('hidden');
  } else {
    emptyState.classList.add('hidden');
    grid.innerHTML = paged.map((f, idx) => `
      <div class="feedback-card rating-${f.rating}"
           style="animation-delay:${idx * 0.04}s"
           data-id="${f.id}"
           onclick="openModal(${f.id})">
        <div class="card-header">
          <div class="card-avatar" style="background:${f.color}">${f.initials}</div>
          <div class="card-meta">
            <div class="card-name">${f.name}</div>
            <div class="card-date">${f.date}</div>
          </div>
          <div class="card-stars">${starsHTML(f.rating, 12)}</div>
        </div>
        <p class="card-comment">${f.comment}</p>
        <div class="card-footer">
          ${f.tags.map(t => `<span class="card-tag">${t}</span>`).join('')}
          <span class="card-sentiment sentiment-${f.sentiment}">
            ${f.sentiment.charAt(0).toUpperCase() + f.sentiment.slice(1)}
          </span>
        </div>
      </div>
    `).join('');
  }

  renderPagination(filtered.length);
  updateFilterTabCounts();
}

function updateFilterTabCounts() {
  const all   = STATE.feedback;
  const total = all.length;
  document.querySelector('.filter-tab[data-filter="all"] .tab-count').textContent = total;
}

// ── Pagination ─────────────────────────────────────────────
function renderPagination(total) {
  const pages   = Math.ceil(total / STATE.perPage);
  const curr    = STATE.currentPage;
  const start   = (curr - 1) * STATE.perPage + 1;
  const end     = Math.min(curr * STATE.perPage, total);

  document.getElementById('paginationInfo').textContent =
    total === 0 ? 'No results' : `Showing ${start}–${end} of ${total}`;

  document.getElementById('prevBtn').disabled = curr === 1;
  document.getElementById('nextBtn').disabled = curr === pages || pages === 0;

  const pgNumbers = document.getElementById('pgNumbers');
  const maxShown  = 5;
  let s = Math.max(1, curr - 2);
  let e = Math.min(pages, s + maxShown - 1);
  if (e - s < maxShown - 1) s = Math.max(1, e - maxShown + 1);

  pgNumbers.innerHTML = Array.from({ length: e - s + 1 }, (_, i) => {
    const page = s + i;
    return `<button class="pg-num${page === curr ? ' active' : ''}" data-page="${page}">${page}</button>`;
  }).join('');

  pgNumbers.querySelectorAll('.pg-num').forEach(btn => {
    btn.addEventListener('click', () => {
      STATE.currentPage = parseInt(btn.dataset.page);
      renderCards();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

// ── Modal ──────────────────────────────────────────────────
window.openModal = function(id) {
  const f = STATE.feedback.find(x => x.id === id);
  if (!f) return;

  const box = document.getElementById('modalBox');
  box.innerHTML = `
    <div class="modal-header">
      <div class="modal-avatar" style="background:${f.color}">${f.initials}</div>
      <div class="modal-meta">
        <div class="modal-name">${f.name}</div>
        <div class="modal-date">Submitted ${f.date}</div>
      </div>
      <button class="modal-close" id="modalCloseBtn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="modal-stars">${starsHTML(f.rating, 18)}</div>
    <div class="modal-comment">"${f.comment}"</div>
    <div class="modal-tags-section">
      <div class="modal-tags-title">Topics</div>
      <div class="modal-tags">
        ${f.tags.map(t => `<span class="card-tag">${t}</span>`).join('')}
        <span class="card-sentiment sentiment-${f.sentiment}">
          ${f.sentiment.charAt(0).toUpperCase() + f.sentiment.slice(1)}
        </span>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn-modal-close" id="modalFooterClose">Close</button>
    </div>
  `;

  const overlay = document.getElementById('modalOverlay');
  overlay.classList.add('open');

  document.getElementById('modalCloseBtn').addEventListener('click', closeModal);
  document.getElementById('modalFooterClose').addEventListener('click', closeModal);
};

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
}

document.getElementById('modalOverlay').addEventListener('click', e => {
  if (e.target === document.getElementById('modalOverlay')) closeModal();
});

// ── Export CSV ─────────────────────────────────────────────
function exportCSV() {
  const headers = ['ID','Name','Rating','Sentiment','Date','Comment','Tags'];
  const rows = STATE.feedback.map(f =>
    [f.id, f.name, f.rating, f.sentiment, f.date, `"${f.comment.replace(/"/g,'""')}"`, f.tags.join(';')].join(',')
  );
  const csv  = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'planora-feedback.csv'; a.click();
  URL.revokeObjectURL(url);
  showToast('Feedback CSV exported', 'success');
}

// ── Scroll Reveal ──────────────────────────────────────────
function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('[data-reveal]').forEach(el => obs.observe(el));
}

// ── Animate Counters on Load ───────────────────────────────
function initCounters() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el     = entry.target;
        const target = parseInt(el.dataset.target);
        animateCounter(el, target);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.stat-value[data-target]').forEach(el => obs.observe(el));
}

// ── Controls ───────────────────────────────────────────────
function initControls() {
  // Search
  const searchInput = document.getElementById('searchInput');
  const searchClear = document.getElementById('searchClear');
  searchInput.addEventListener('input', () => {
    STATE.search = searchInput.value;
    STATE.currentPage = 1;
    searchClear.classList.toggle('visible', !!STATE.search);
    renderCards();
  });
  searchClear.addEventListener('click', () => {
    searchInput.value = ''; STATE.search = '';
    searchClear.classList.remove('visible');
    renderCards();
  });

  // Filter tabs
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      STATE.filter = tab.dataset.filter;
      STATE.currentPage = 1;
      renderCards();
    });
  });

  // Sort
  document.getElementById('sortSelect').addEventListener('change', e => {
    STATE.sort = e.target.value;
    STATE.currentPage = 1;
    renderCards();
  });

  // Pagination arrows
  document.getElementById('prevBtn').addEventListener('click', () => {
    if (STATE.currentPage > 1) { STATE.currentPage--; renderCards(); }
  });
  document.getElementById('nextBtn').addEventListener('click', () => {
    const pages = Math.ceil(getFiltered().length / STATE.perPage);
    if (STATE.currentPage < pages) { STATE.currentPage++; renderCards(); }
  });

  // Export
  document.getElementById('exportBtn').addEventListener('click', exportCSV);

  // Event selector
  document.getElementById('eventSelector').addEventListener('change', () => {
    STATE.feedback = generateFeedback();
    STATE.currentPage = 1;
    renderAnalytics();
    renderCards();
    showToast('Event switched — feedback refreshed', 'info');
  });

  // Mobile sidebar
  const menuToggle = document.getElementById('menuToggle');
  const sidebar    = document.getElementById('sidebar');
  menuToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
  document.addEventListener('click', e => {
    if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
      sidebar.classList.remove('open');
    }
  });
}

// ── Init ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderAnalytics();
  renderCards();
  initControls();
  initReveal();
  initCounters();
});