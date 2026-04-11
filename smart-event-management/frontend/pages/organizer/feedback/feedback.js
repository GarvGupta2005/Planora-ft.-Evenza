/* Organizer Feedback — feedback.js */
'use strict';

const API_BASE = 'http://localhost:5000/api';
let allFeedback = [];
let myEvents = [];
let ratingFilter = 'all'; 
let currentEventId = '';

/**
 * Initialize Page
 */
async function initFeedbackPage() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '../../auth/signin.html';
        return;
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.fullName) {
        document.querySelectorAll('.user-name').forEach(el => el.textContent = user.fullName);
        const initials = user.fullName.split(' ').map(n => n[0]).join('').toUpperCase();
        document.querySelectorAll('.user-avatar, .topbar-avatar').forEach(el => el.textContent = initials);
    }

    try {
        // 1. Fetch My Events
        const eventRes = await fetch(`${API_BASE}/events/my-events`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const eventData = await eventRes.json();
        myEvents = eventData.data || [];

        const sel = document.getElementById('eventFilter');
        if (sel) {
            sel.innerHTML = '<option value="">All Events</option>' + 
                myEvents.map(e => `<option value="${e._id}">${e.title}</option>`).join('');
            
            sel.addEventListener('change', () => {
                currentEventId = sel.value;
                updateStats(); // Recalculate stats when event changes
                render();
            });
        }

        // 2. Fetch All Feedback for Organizer
        await fetchFeedback();

        // 3. Setup Tabs
        const tabs = document.getElementById('feedbackTabs');
        if (tabs) {
            tabs.querySelectorAll('.tab-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    tabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    ratingFilter = btn.dataset.filter;
                    render();
                });
            });
        }

    } catch (err) {
        console.error('Error initializing feedback page:', err);
    }
}

async function fetchFeedback() {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_BASE}/feedback/organizer`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        allFeedback = data.data || [];
        updateStats();
        render();
    } catch (err) {
        console.error('Error fetching feedback:', err);
    }
}

function updateStats() {
    // Determine which data to use for stats (All vs Selected Event)
    const statsData = currentEventId 
        ? allFeedback.filter(f => f.event?._id === currentEventId)
        : allFeedback;

    const total = statsData.length;
    const avgRating = total > 0 ? (statsData.reduce((acc, f) => acc + f.rating, 0) / total).toFixed(1) : "0.0";
    const positive = statsData.filter(f => f.rating >= 4).length;
    const positivePct = total > 0 ? Math.round((positive / total) * 100) : 0;
    
    // Total distinct events that have feedback
    const distinctEvents = [...new Set(allFeedback.map(f => f.event?._id))].filter(Boolean).length;

    const cards = document.querySelectorAll('.stat-card');
    cards.forEach(card => {
        const label = card.querySelector('.stat-card-label')?.textContent?.toLowerCase();
        const num = card.querySelector('.stat-card-num');
        if (!num) return;

        if (label?.includes('rating')) {
            num.textContent = avgRating;
            const chip = card.querySelector('.stat-chip');
            if (chip) {
                if (total === 0) {
                    chip.textContent = 'No Data';
                    chip.className = 'stat-chip chip-neutral';
                } else {
                    chip.textContent = avgRating >= 4.5 ? 'Excellent' : (avgRating >= 4 ? 'Great' : 'Good');
                    chip.className = 'stat-chip chip-up';
                }
            }
        }
        if (label?.includes('responses')) {
            num.textContent = total;
        }
        if (label?.includes('positive')) {
            num.textContent = `${positivePct}%`;
        }
        if (label?.includes('reviewed')) {
            // This stays global or event-specific? 
            // Mock had "3 Events Reviewed". Let's show the global count here or 1 if specific event is selected and has feedback.
            num.textContent = currentEventId ? (total > 0 ? 1 : 0) : distinctEvents;
        }
    });
}

function stars(r) {
  return `<div class="fb-stars">${[1,2,3,4,5].map(i => `<span class="${i <= r ? 'filled' : ''}">★</span>`).join('')}</div>`;
}

function render() {
  const el = document.getElementById('feedbackList');
  if (!el) return;

  const filtered = allFeedback.filter(f => {
    // Event Filter
    let eventMatch = true;
    if (currentEventId) eventMatch = f.event?._id === currentEventId;

    // Rating Filter
    let ratingMatch = true;
    if (ratingFilter === '5') ratingMatch = f.rating === 5;
    else if (ratingFilter === '4') ratingMatch = f.rating === 4;
    else if (ratingFilter === 'low') ratingMatch = f.rating <= 3;

    return eventMatch && ratingMatch;
  });

  if (!filtered.length) {
    el.innerHTML = `
      <div class="empty-state" style="padding:100px 12px; text-align:center; grid-column:1/-1;">
        <div class="empty-icon" style="font-size:32px; margin-bottom:10px; opacity:0.5;">💬</div>
        <div class="empty-title" style="font-weight:600; color:var(--text); margin-bottom:4px; opacity:0.8;">No feedback found</div>
        <div class="empty-sub" style="font-size:12px; color:var(--text-dim); opacity:0.7;">Try changing filters or wait for participants to submit reviews.</div>
      </div>
    `;
    return;
  }

  el.innerHTML = filtered.map(f => {
    const u = f.user || { fullName: 'Anonymous' };
    const ev = f.event || { title: 'Unknown Event', color: '#7c3aed' };
    return `
    <div class="feedback-item">
      <div class="fb-dot" style="background:${ev.color || '#7c3aed'}"></div>
      <div class="fb-body">
        <div class="fb-head">
          <div>
            <div class="fb-name">${u.fullName}</div>
            <div class="fb-meta">${ev.title} · ${formatTimeSince(f.createdAt)}</div>
          </div>
          ${stars(f.rating)}
        </div>
        <div class="fb-comment">${f.comments || 'No comment provided.'}</div>
      </div>
    </div>
  `;
  }).join('');
}

function formatTimeSince(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.round(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHrs = Math.round(diffMin / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.round(diffHrs / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
}

document.addEventListener('DOMContentLoaded', initFeedbackPage);
