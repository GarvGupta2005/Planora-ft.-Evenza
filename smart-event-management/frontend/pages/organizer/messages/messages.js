/* Organizer Messages — messages.js */
'use strict';

const API_BASE = 'http://localhost:5000/api';
let audience = 'all';
let priority = 'normal';

const PRIORITY_COLOR = {
  normal: '#7c3aed',
  important: '#f59e0b',
  urgent: '#ef4444',
};

/**
 * Initialize the Messages Page
 */
async function initMessagesPage() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '../../auth/signin.html';
    return;
  }

  try {
    // 1. Fetch My Events to populate dropdown
    const eventRes = await fetch(`${API_BASE}/events/my-events`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const eventData = await eventRes.json();
    const myEvents = eventData.data || [];
    
    const eventDropdown = document.getElementById('broadcastEvent');
    if (eventDropdown && myEvents.length > 0) {
      eventDropdown.innerHTML = `
        <option value="">Select an event</option>
        ${myEvents.map(e => `<option value="${e._id}">${e.title}</option>`).join('')}
      `;
    }

    // 2. Fetch Broadcast History
    await loadHistory();

  } catch (err) {
    console.error('Error initializing messages page:', err);
  }
}

async function loadHistory() {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch(`${API_BASE}/notifications/broadcasts`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    renderSent(data.data || []);
  } catch (err) {
    console.error('Error loading history:', err);
  }
}

function renderSent(history) {
  const list = document.getElementById('sentList');
  const count = document.getElementById('sentCount');
  if (!list) return;

  if (count) count.textContent = `${history.length} sent`;

  if (!history.length) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📣</div>
        <div class="empty-title">No broadcasts yet</div>
        <div class="empty-sub">Send a message and it’ll appear here.</div>
      </div>
    `;
    return;
  }

  list.innerHTML = history.map(m => `
    <div class="sent-item">
      <div class="sent-dot" style="background:${PRIORITY_COLOR[m.priority] || '#7c3aed'}"></div>
      <div class="sent-body">
        <div class="sent-title">${m.title}</div>
        <div class="sent-meta">
          <span>${formatDate(m.createdAt)}</span><span>·</span>
          <span>${m.event?.title || 'Event'}</span><span>·</span>
          <span style="text-transform:capitalize">${m.targetAudience}</span><span>·</span>
          <span style="text-transform:capitalize">${m.priority}</span><span>·</span>
          <span>${m.recipientCount} sent</span>
        </div>
        <div class="sent-text">${m.body}</div>
      </div>
    </div>
  `).join('');
}

function initChips() {
  const audienceWrap = document.getElementById('audienceChips');
  const priorityWrap = document.getElementById('priorityOpts');

  audienceWrap?.querySelectorAll('.audience-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      audience = btn.dataset.val;
      document.querySelectorAll('.audience-chip').forEach(b => b.classList.toggle('active', b.dataset.val === audience));
    });
  });

  priorityWrap?.querySelectorAll('.priority-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      priority = btn.dataset.val;
      document.querySelectorAll('.priority-opt').forEach(b => b.classList.toggle('active', b.dataset.val === priority));
    });
  });
}

function initActions() {
  const clearBtn = document.getElementById('clearBtn');
  const sendBtn = document.getElementById('sendBtn');

  const titleEl = document.getElementById('msgTitle');
  const bodyEl = document.getElementById('msgBody');
  const eventEl = document.getElementById('broadcastEvent');

  clearBtn?.addEventListener('click', () => {
    if (titleEl) titleEl.value = '';
    if (bodyEl) bodyEl.value = '';
    if (eventEl) eventEl.value = '';
    audience = 'all';
    priority = 'normal';
    document.querySelectorAll('.audience-chip').forEach(b => b.classList.toggle('active', b.dataset.val === audience));
    document.querySelectorAll('.priority-opt').forEach(b => b.classList.toggle('active', b.dataset.val === priority));
  });

  sendBtn?.addEventListener('click', async () => {
    const title = titleEl?.value?.trim() || '';
    const body = bodyEl?.value?.trim() || '';
    const eventId = eventEl?.value;

    if (!eventId) { alert('Please select an event.'); return; }
    if (!title || !body) { alert('Please enter both a message title and body.'); return; }

    const token = localStorage.getItem('token');
    try {
      sendBtn.disabled = true;
      sendBtn.textContent = 'Sending...';

      const res = await fetch(`${API_BASE}/notifications/broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          eventId,
          targetAudience: audience,
          title,
          body,
          priority
        })
      });

      if (res.ok) {
        if (titleEl) titleEl.value = '';
        if (bodyEl) bodyEl.value = '';
        await loadHistory();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to send broadcast');
      }
    } catch (err) {
      console.error('Error sending broadcast:', err);
    } finally {
      sendBtn.disabled = false;
      sendBtn.textContent = 'Send Broadcast';
    }
  });
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' · ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

document.addEventListener('DOMContentLoaded', () => {
  initMessagesPage();
  initChips();
  initActions();
});

