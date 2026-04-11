/* Participant Feedback — feedback.js */
'use strict';

const API_BASE = 'http://localhost:5000/api';
let currentEventId = null;
let currentRating = 0;
let pendingEvents = [];
let submittedFeedbacks = [];

/**
 * Initialize Feedback Page
 */
async function initFeedback() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '../../auth/signin.html';
    return;
  }

  try {
    // 1. Fetch Registrations (to find attended events)
    const regRes = await fetch(`${API_BASE}/registrations/my-registrations`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const regData = await regRes.json();
    const attendedRegs = (regData.data || []).filter(r => r.status === 'attended');

    // 2. Fetch My Feedback
    const fbRes = await fetch(`${API_BASE}/feedback/my`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const fbData = await fbRes.json();
    submittedFeedbacks = fbData.data || [];

    // Filter Pending: Attended events that don't have feedback yet
    const submittedEventIds = new Set(submittedFeedbacks.map(f => f.event._id));
    pendingEvents = attendedRegs.filter(r => !submittedEventIds.has(r.event._id)).map(r => r.event);

    renderLists();
  } catch (err) {
    console.error('Error initializing feedback page:', err);
  }
}

function stars(rating) {
  return `<div class="fb-stars">${[1,2,3,4,5].map(i => `<span class="s ${i<=rating?'filled':''}">★</span>`).join('')}</div>`;
}

function renderLists() {
  const pendingList = document.getElementById('pendingList');
  const doneList = document.getElementById('doneList');
  const pendingCount = document.getElementById('pendingCount');

  if (pendingCount) pendingCount.textContent = `${pendingEvents.length} pending`;

  if (pendingList) {
    if (!pendingEvents.length) {
      pendingList.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">✅</div>
          <div class="empty-title">No pending reviews</div>
          <div class="empty-sub">You’re all caught up.</div>
        </div>
      `;
    } else {
      pendingList.innerHTML = pendingEvents.map(p => `
        <div class="fb-card">
          <div class="fb-left">
            <div class="fb-title">${p.title}</div>
            <div class="fb-sub">${new Date(p.eventDate || p.startDate).toLocaleDateString()} · ${p.venue || 'Virtual'}</div>
          </div>
          <div class="fb-actions">
            <button class="btn-ghost" onclick="openModal('${p._id}')">Review</button>
          </div>
        </div>
      `).join('');
    }
  }

  if (doneList) {
    if (!submittedFeedbacks.length) {
      doneList.innerHTML = `<div style="padding:10px;color:var(--text-dim);font-size:13px">No reviews yet.</div>`;
    } else {
      doneList.innerHTML = submittedFeedbacks.map(d => `
        <div class="fb-card" style="align-items:flex-start">
          <div class="fb-left">
            <div class="fb-title">${d.event.title}</div>
            <div class="fb-sub">Submitted · ${new Date(d.createdAt).toLocaleDateString()}</div>
            ${stars(d.rating)}
            <div class="fb-sub" style="margin-top:8px;color:var(--text-muted);line-height:1.55">${d.comments || 'No comment provided.'}</div>
          </div>
          <div class="fb-actions">
            <span class="badge badge-approved">Submitted</span>
          </div>
        </div>
      `).join('');
    }
  }
}

function setRating(r) {
  currentRating = r;
  document.querySelectorAll('.star-btn').forEach(btn => {
    const val = Number(btn.dataset.val);
    btn.classList.toggle('filled', val <= r);
  });
}

function openModal(eventId) {
  currentEventId = eventId;
  const modal = document.getElementById('fbModal');
  const title = document.getElementById('fbModalTitle');
  const comment = document.getElementById('fbComment');

  const ev = pendingEvents.find(p => p._id === eventId);
  if (title) title.textContent = ev ? `Review: ${ev.title}` : 'Submit Review';
  if (comment) comment.value = '';
  setRating(0);

  if (modal) {
    modal.style.display = 'flex';
  }
}

function closeModal() {
  const modal = document.getElementById('fbModal');
  if (modal) modal.style.display = 'none';
  currentEventId = null;
}

async function submitReview() {
  if (!currentEventId) return;
  if (!currentRating) {
    alert('Please select a rating.');
    return;
  }

  const comment = document.getElementById('fbComment')?.value?.trim() || '';
  const token = localStorage.getItem('token');
  const submitBtn = document.getElementById('fbSubmitBtn');

  try {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    const res = await fetch(`${API_BASE}/feedback/${currentEventId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        rating: currentRating,
        comments: comment,
        metrics: { venue: 5, content: 5, organization: 5 } // Default or can be added to UI later
      })
    });

    if (res.ok) {
      closeModal();
      await initFeedback();
    } else {
      const data = await res.json();
      alert(data.message || 'Failed to submit feedback');
    }
  } catch (err) {
    console.error('Error submitting feedback:', err);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Review';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initFeedback();

  document.getElementById('fbModalClose')?.addEventListener('click', closeModal);
  document.getElementById('fbCancelBtn')?.addEventListener('click', closeModal);
  document.getElementById('fbSubmitBtn')?.addEventListener('click', submitReview);

  document.getElementById('fbModal')?.addEventListener('click', (e) => {
    if (e.target?.id === 'fbModal') closeModal();
  });

  document.querySelectorAll('.star-btn').forEach(btn => {
    btn.addEventListener('click', () => setRating(Number(btn.dataset.val)));
  });
});

window.openModal = openModal;

