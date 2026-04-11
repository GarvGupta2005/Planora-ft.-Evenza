/* ============================================
   PLANORA ADD EVENT — add-event.js
============================================ */

'use strict';

/* ============================================
   STATE
   All form data lives here, synced on every
   field change. Submitted as one payload.
============================================ */
const state = {
    // Step 1
    emoji: '🎯',
    color: '#7c3aed',
    name: '',
    description: '',
    category: '',
    // Step 2
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    isVirtual: false,
    venue: '',
    virtualLink: '',
    // Step 3
    participantCap: '',
    volunteerSlots: 0,
    requireVolunteerApproval: false,
    enableWaitlist: true,
    enableFeedback: true,
    visibility: 'public',
    // Meta
    currentStep: 1,
    isDraft: false,
};

/* ============================================
   STEP NAVIGATION
============================================ */
const TOTAL_STEPS = 4;

function goToStep(n) {
    // Hide all steps
    document.querySelectorAll('.form-step').forEach(el => el.classList.remove('active'));
    // Show target
    const target = document.getElementById(`step${n}`);
    if (target) target.classList.add('active');

    state.currentStep = n;
    updateStepIndicator(n);
    updateProgressBar(n);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateStepIndicator(current) {
    document.querySelectorAll('.step-item').forEach(item => {
        const s = parseInt(item.dataset.step);
        item.classList.remove('active', 'completed');
        if (s === current) item.classList.add('active');
        else if (s < current) {
            item.classList.add('completed');
            item.querySelector('.step-circle').innerHTML = `
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 6l3 3 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
        }
    });
}

function updateProgressBar(step) {
    const pct = (step / TOTAL_STEPS) * 100;
    const bar = document.getElementById('progressBar');
    if (bar) bar.style.width = pct + '%';
}

/* ============================================
   VALIDATION PER STEP
============================================ */
function clearError(id) {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
    const input = document.getElementById(id.replace('Error', ''));
    if (input) input.classList.remove('error');
}
function showError(fieldId, errorId, msg) {
    const err = document.getElementById(errorId);
    if (err) err.textContent = msg;
    const input = document.getElementById(fieldId);
    if (input) input.classList.add('error');
}

function validateStep1() {
    let valid = true;
    ['eventNameError', 'eventDescError', 'eventCategoryError'].forEach(clearError);

    if (!state.name.trim() || state.name.trim().length < 3) {
        showError('eventName', 'eventNameError', 'Event name must be at least 3 characters.');
        valid = false;
    }
    if (!state.description.trim() || state.description.trim().length < 20) {
        showError('eventDesc', 'eventDescError', 'Please write at least 20 characters for the description.');
        valid = false;
    }
    if (!state.category) {
        showError('eventCategory', 'eventCategoryError', 'Please select a category.');
        valid = false;
    }
    return valid;
}

function validateStep2() {
    let valid = true;
    ['startDateError', 'startTimeError', 'endDateError', 'endTimeError', 'venueError'].forEach(clearError);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!state.startDate) {
        showError('startDate', 'startDateError', 'Please set a start date.');
        valid = false;
    } else {
        const sd = new Date(state.startDate);
        if (sd < today) {
            showError('startDate', 'startDateError', 'Start date cannot be in the past.');
            valid = false;
        }
    }
    if (!state.startTime) {
        showError('startTime', 'startTimeError', 'Please set a start time.');
        valid = false;
    }
    if (!state.endDate) {
        showError('endDate', 'endDateError', 'Please set an end date.');
        valid = false;
    }
    if (!state.endTime) {
        showError('endTime', 'endTimeError', 'Please set an end time.');
        valid = false;
    }
    // End must be after start
    if (state.startDate && state.endDate && state.startTime && state.endTime) {
        const start = new Date(`${state.startDate}T${state.startTime}`);
        const end = new Date(`${state.endDate}T${state.endTime}`);
        if (end <= start) {
            showError('endDate', 'endDateError', 'End date/time must be after start.');
            valid = false;
        }
    }
    if (!state.isVirtual && !state.venue.trim()) {
        showError('venue', 'venueError', 'Please enter a venue name.');
        valid = false;
    }
    return valid;
}

function validateStep3() {
    clearError('participantCapError');
    const cap = parseInt(state.participantCap);
    if (!state.participantCap || isNaN(cap) || cap < 1) {
        showError('participantCap', 'participantCapError', 'Capacity must be at least 1.');
        return false;
    }
    if (cap > 10000) {
        showError('participantCap', 'participantCapError', 'Maximum capacity is 10,000.');
        return false;
    }
    return true;
}

/* ============================================
   LIVE PREVIEW
============================================ */
function updatePreview() {
    setText('previewName', state.name || 'Your Event Name');
    setText('previewDesc', state.description || 'Your event description will appear here…');
    setText('previewEmoji', state.emoji);

    const bar = document.getElementById('previewColorBar');
    if (bar) bar.style.background = state.color;

    const preview = document.querySelector('.preview-card');
    if (preview) preview.style.borderColor = state.color + '44';

    // Date
    const dateEl = document.getElementById('previewDate');
    if (dateEl) {
        const span = dateEl.querySelector('span');
        if (span) {
            if (state.startDate && state.startTime) {
                const d = new Date(`${state.startDate}T${state.startTime}`);
                span.textContent = d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
            } else {
                span.textContent = 'Date not set';
            }
        }
    }

    // Venue
    const venueEl = document.getElementById('previewVenue');
    if (venueEl) {
        const span = venueEl.querySelector('span');
        if (span) span.textContent = state.isVirtual ? 'Virtual Event' : (state.venue || 'Venue not set');
    }

    // Capacity
    const capEl = document.getElementById('previewCapacity');
    if (capEl) {
        const span = capEl.querySelector('span');
        if (span) span.textContent = state.participantCap ? `${state.participantCap} seats` : 'Capacity not set';
    }
}

function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}

/* ============================================
   REVIEW CARD (Step 4)
============================================ */
function buildReviewCard() {
    const container = document.getElementById('reviewCard');
    if (!container) return;

    const formatDT = (d, t) => {
        if (!d || !t) return '—';
        const dt = new Date(`${d}T${t}`);
        return dt.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    };

    container.innerHTML = `
    <div class="review-color-bar" style="background:${state.color}"></div>
    <div class="review-body">
      <div class="review-top">
        <div class="review-emoji">${state.emoji}</div>
        <div>
          <div class="review-title">${state.name}</div>
          <div class="review-category">${state.category || 'Uncategorized'}</div>
        </div>
      </div>
      <div class="review-desc">${state.description}</div>
      <div class="review-grid">
        <div class="review-item">
          <div class="review-item-label">Starts</div>
          <div class="review-item-val">${formatDT(state.startDate, state.startTime)}</div>
        </div>
        <div class="review-item">
          <div class="review-item-label">Ends</div>
          <div class="review-item-val">${formatDT(state.endDate, state.endTime)}</div>
        </div>
        <div class="review-item">
          <div class="review-item-label">${state.isVirtual ? 'Format' : 'Venue'}</div>
          <div class="review-item-val">${state.isVirtual ? 'Virtual / Online' : state.venue}</div>
        </div>
        <div class="review-item">
          <div class="review-item-label">Capacity</div>
          <div class="review-item-val">${state.participantCap} participants</div>
        </div>
        <div class="review-item">
          <div class="review-item-label">Volunteer Slots</div>
          <div class="review-item-val">${state.volunteerSlots || 0} slots</div>
        </div>
        <div class="review-item">
          <div class="review-item-label">Visibility</div>
          <div class="review-item-val">${state.visibility === 'public' ? '🌐 Public' : '🔒 Private'}</div>
        </div>
      </div>
      <div class="review-toggles">
        <span class="review-toggle-chip ${state.enableFeedback ? 'on' : 'off'}">
          ${state.enableFeedback ? '✓' : '✗'} Feedback
        </span>
        <span class="review-toggle-chip ${state.enableWaitlist ? 'on' : 'off'}">
          ${state.enableWaitlist ? '✓' : '✗'} Waitlist
        </span>
        <span class="review-toggle-chip ${state.requireVolunteerApproval ? 'on' : 'off'}">
          ${state.requireVolunteerApproval ? '✓' : '✗'} Vol. Approval
        </span>
      </div>
    </div>
  `;
}

/* ============================================
   EVENZA TIP (Step 4)
============================================ */
const EVENZA_TIPS = [
    tip => `Events in the "${tip.category}" category typically see peak registrations 3–5 days before the event. Consider sharing your join code early.`,
    tip => `Based on your capacity of ${tip.cap} and a typical 88% attendance rate, prepare for around ${Math.round(tip.cap * 0.88)} attendees physically present.`,
    tip => `${tip.isVirtual ? 'Virtual events' : 'In-person events'} get 30% more feedback responses when the feedback link is sent within 2 hours of the event ending. Planora handles this automatically.`,
    tip => `Enabling the waitlist is a great call — events with waitlists fill up 2x faster due to urgency signals.`,
];

function setEvenzaTip() {
    const tips = EVENZA_TIPS;
    const tip = {
        category: state.category || 'this',
        cap: state.participantCap || 100,
        isVirtual: state.isVirtual,
    };
    const text = tips[Math.floor(Math.random() * tips.length)](tip);
    const el = document.getElementById('evenzaTipText');
    if (el) el.textContent = text;
}

/* ============================================
   GENERATE JOIN CODE (frontend simulation)
   Real code comes from backend: codeService.js
============================================ */
function generateJoinCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'PLN-';
    for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
}

/* ============================================
   PUBLISH
============================================ */
async function publishEvent() {
    const btn = document.getElementById('publishBtn');
    btn.classList.add('loading');
    btn.disabled = true;

    const token = localStorage.getItem('token');

    const payload = {
        title: state.name,
        description: state.description,
        category: state.category,
        emoji: state.emoji,
        color: state.color,
        eventDate: state.startDate,
        endDate: state.endDate,
        startTime: state.startTime,
        endTime: state.endTime,
        isVirtual: state.isVirtual,
        venue: state.isVirtual ? (state.virtualLink || 'Virtual') : state.venue,
        virtualLink: state.isVirtual ? state.virtualLink : null,
        capacity: parseInt(state.participantCap),
        volunteerSlots: parseInt(state.volunteerSlots) || 0,
        requireVolunteerApproval: state.requireVolunteerApproval,
        enableWaitlist: state.enableWaitlist,
        enableFeedback: state.enableFeedback,
        visibility: state.visibility,
        status: 'published',
    };

    try {
        const res = await fetch('http://localhost:5000/api/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to create event');

        const joinCode = data.data.joinCode;

        btn.classList.remove('loading');
        btn.disabled = false;

        // Show success modal
        const codeEl = document.getElementById('joinCodeValue');
        if (codeEl) codeEl.textContent = joinCode;
        document.getElementById('successOverlay').classList.add('open');

    } catch (err) {
        btn.classList.remove('loading');
        btn.disabled = false;
        alert('Failed to publish event. Please try again.');
        console.error(err);
    }
}

function simulateRequest(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/* ============================================
   EMOJI PICKER
============================================ */
function initEmojiPicker() {
    document.querySelectorAll('.emoji-opt').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.emoji-opt').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.emoji = btn.dataset.emoji;
            const cover = document.getElementById('coverEmoji');
            if (cover) cover.textContent = state.emoji;
            updatePreview();
        });
    });
}

/* ============================================
   COLOR PICKER
============================================ */
function initColorPicker() {
    document.querySelectorAll('.color-opt').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.color-opt').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.color = btn.dataset.color;
            updatePreview();
        });
    });
}

/* ============================================
   TOGGLE SWITCHES
============================================ */
function initToggle(id, stateKey) {
    const btn = document.getElementById(id);
    if (!btn) return;
    // Set initial visual state
    btn.setAttribute('aria-checked', state[stateKey] ? 'true' : 'false');
    btn.addEventListener('click', () => {
        state[stateKey] = !state[stateKey];
        btn.setAttribute('aria-checked', state[stateKey] ? 'true' : 'false');
        updatePreview();
    });
}

/* ============================================
   VIRTUAL TOGGLE (special — shows/hides fields)
============================================ */
function initVirtualToggle() {
    const btn = document.getElementById('virtualToggle');
    if (!btn) return;
    btn.addEventListener('click', () => {
        state.isVirtual = !state.isVirtual;
        btn.setAttribute('aria-checked', state.isVirtual ? 'true' : 'false');
        document.getElementById('venueField').classList.toggle('hidden', state.isVirtual);
        document.getElementById('virtualLinkField').classList.toggle('hidden', !state.isVirtual);
        updatePreview();
    });
}

/* ============================================
   RADIO — VISIBILITY
============================================ */
function initVisibilityRadio() {
    document.querySelectorAll('input[name="visibility"]').forEach(radio => {
        radio.addEventListener('change', () => {
            state.visibility = radio.value;
        });
    });
}

/* ============================================
   CHAR COUNTERS
============================================ */
function initCharCounters() {
    const nameInput = document.getElementById('eventName');
    const nameCount = document.getElementById('nameCount');
    if (nameInput && nameCount) {
        nameInput.addEventListener('input', () => {
            state.name = nameInput.value;
            nameCount.textContent = `${nameInput.value.length} / 80`;
            updatePreview();
        });
    }

    const descInput = document.getElementById('eventDesc');
    const descCount = document.getElementById('descCount');
    if (descInput && descCount) {
        descInput.addEventListener('input', () => {
            state.description = descInput.value;
            descCount.textContent = `${descInput.value.length} / 600`;
            updatePreview();
        });
    }
}

/* ============================================
   BIND ALL FIELD → STATE
============================================ */
function bindFields() {
    const bindings = [
        ['eventCategory', 'category', 'change'],
        ['startDate', 'startDate', 'change'],
        ['startTime', 'startTime', 'change'],
        ['endDate', 'endDate', 'change'],
        ['endTime', 'endTime', 'change'],
        ['venue', 'venue', 'input'],
        ['virtualLink', 'virtualLink', 'input'],
        ['participantCap', 'participantCap', 'input'],
        ['volunteerSlots', 'volunteerSlots', 'input'],
    ];

    bindings.forEach(([id, key, evt]) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener(evt, () => {
            state[key] = el.value;
            updatePreview();
        });
    });
}

/* ============================================
   STEP BUTTONS
============================================ */
function initStepButtons() {
    // Step 1 → 2
    document.getElementById('next1')?.addEventListener('click', () => {
        if (validateStep1()) goToStep(2);
    });
    // Step 2 back/next
    document.getElementById('back2')?.addEventListener('click', () => goToStep(1));
    document.getElementById('next2')?.addEventListener('click', () => {
        if (validateStep2()) goToStep(3);
    });
    // Step 3 back/next
    document.getElementById('back3')?.addEventListener('click', () => goToStep(2));
    document.getElementById('next3')?.addEventListener('click', () => {
        if (validateStep3()) {
            buildReviewCard();
            setEvenzaTip();
            goToStep(4);
        }
    });
    // Step 4 back/publish
    document.getElementById('back4')?.addEventListener('click', () => goToStep(3));
    document.getElementById('publishBtn')?.addEventListener('click', publishEvent);
}

/* ============================================
   SAVE DRAFT
============================================ */
function initSaveDraft() {
    document.getElementById('saveDraftBtn')?.addEventListener('click', () => {
        state.isDraft = true;
        // TODO: POST /api/events?draft=true  with current state
        const btn = document.getElementById('saveDraftBtn');
        const orig = btn.textContent;
        btn.textContent = '✓ Draft Saved';
        btn.style.color = 'var(--green)';
        setTimeout(() => {
            btn.textContent = orig;
            btn.style.color = '';
        }, 2000);
    });
}

/* ============================================
   SUCCESS MODAL
============================================ */
function initSuccessModal() {
    // Copy code
    document.getElementById('copyCodeBtn')?.addEventListener('click', () => {
        const code = document.getElementById('joinCodeValue')?.textContent;
        if (!code) return;
        navigator.clipboard.writeText(code).then(() => {
            const btn = document.getElementById('copyCodeBtn');
            btn.classList.add('copied');
            btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l3 3 7-7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg> Copied!`;
            setTimeout(() => {
                btn.classList.remove('copied');
                btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="4" y="4" width="8" height="8" rx="1" stroke="currentColor" stroke-width="1.2"/><path d="M2 10V3a1 1 0 011-1h7" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg> Copy`;
            }, 2500);
        });
    });

    // Create another
    document.getElementById('createAnotherBtn')?.addEventListener('click', () => {
        document.getElementById('successOverlay').classList.remove('open');
        // Reset state
        Object.assign(state, {
            emoji: '🎯', color: '#7c3aed', name: '', description: '', category: '',
            startDate: '', startTime: '', endDate: '', endTime: '',
            isVirtual: false, venue: '', virtualLink: '',
            participantCap: '', volunteerSlots: 0,
            requireVolunteerApproval: false, enableWaitlist: true,
            enableFeedback: true, visibility: 'public', currentStep: 1,
        });
        // Reset form fields
        ['eventName','eventDesc','eventCategory','startDate','startTime','endDate','endTime','venue','virtualLink','participantCap','volunteerSlots'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        updatePreview();
        goToStep(1);
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

    const open = () => { sidebar.classList.add('open'); overlay.classList.add('visible'); document.body.style.overflow = 'hidden'; };
    const close = () => { sidebar.classList.remove('open'); overlay.classList.remove('visible'); document.body.style.overflow = ''; };

    toggle.addEventListener('click', open);
    overlay.addEventListener('click', close);
    closeBtn?.addEventListener('click', close);
}

/* ============================================
   LOGOUT
============================================ */
    document.querySelectorAll('#logoutBtn, .pd-logout').forEach(btn => {
        btn.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = '../auth/signin.html';
        });
    });

/* ============================================
   SET MINIMUM DATE (today) on date inputs
============================================ */
function initDateDefaults() {
    const today = new Date().toISOString().split('T')[0];
    ['startDate', 'endDate'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.min = today;
    });
}

/* ============================================
   INIT
============================================ */
document.addEventListener('DOMContentLoaded', () => {
    initEmojiPicker();
    initColorPicker();
    initVirtualToggle();
    initToggle('volunteerApprovalToggle', 'requireVolunteerApproval');
    initToggle('waitlistToggle', 'enableWaitlist');
    initToggle('feedbackToggle', 'enableFeedback');
    initVisibilityRadio();
    initCharCounters();
    bindFields();
    initStepButtons();
    initSaveDraft();
    initSuccessModal();
    initSidebar();
    initLogout();
    initDateDefaults();
    // Initialize User View
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.fullName) {
        document.querySelectorAll('.user-name').forEach(el => el.textContent = user.fullName);
        const initials = user.fullName.split(' ').map(n => n[0]).join('').toUpperCase();
        document.querySelectorAll('.user-avatar, .topbar-avatar').forEach(el => el.textContent = initials);
    }

    updatePreview();
    goToStep(1);
});