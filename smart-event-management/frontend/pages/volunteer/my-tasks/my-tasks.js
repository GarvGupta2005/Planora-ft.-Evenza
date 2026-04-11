/* Volunteer My Tasks — my-tasks.js */
'use strict';

const API_BASE = 'http://localhost:5000/api';
let myTasks = [];
let filter = 'all';

/**
 * Initialize My Tasks
 */
async function initTasks() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '../../auth/signin.html';
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/volunteers/my-tasks`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        myTasks = data.data || [];
        render();
    } catch (err) {
        console.error('Error loading tasks:', err);
    }
}

function pill(status) {
  if (status === 'pending') return '<span class="status-pill pending">Pending</span>';
  if (status === 'in-progress') return '<span class="status-pill progress">In progress</span>';
  if (status === 'completed') return '<span class="status-pill done">Done</span>';
  return `<span class="status-pill">${status}</span>`;
}

async function toggleDone(id) {
  const token = localStorage.getItem('token');
  const t = myTasks.find(x => x._id === id);
  if (!t) return;
  
  const newStatus = t.status === 'completed' ? 'pending' : 'completed';
  
  try {
    const res = await fetch(`${API_BASE}/volunteers/tasks/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: newStatus })
    });
    
    if (res.ok) {
        await initTasks();
    } else {
        const data = await res.json();
        alert(data.message || 'Failed to update task');
    }
  } catch (err) {
    console.error('Error updating task status:', err);
  }
}

function render() {
  const list = document.getElementById('taskList');
  if (!list) return;

  const data = filter === 'all' ? myTasks : myTasks.filter(t => {
      // Map frontend filter names to backend status names
      const statusMap = { 'done': 'completed', 'progress': 'in-progress', 'pending': 'pending' };
      return t.status === (statusMap[filter] || filter);
  });

  if (!data.length) {
    list.innerHTML = `
      <div class="empty-state" style="padding:40px 10px">
        <div class="empty-icon">🧾</div>
        <div class="empty-title">No tasks here</div>
        <div class="empty-sub">Try another tab or add tasks from your coordinator.</div>
      </div>
    `;
    return;
  }

  list.innerHTML = data.map(t => `
    <div class="task ${t.status === 'completed' ? 'done' : ''}">
      <div class="task-left">
        <button class="task-check" aria-label="Toggle done" onclick="toggleDone('${t._id}')">
          ${t.status === 'completed' ? '✓' : ''}
        </button>
        <div style="min-width:0">
          <div class="task-title">${t.taskDescription}</div>
          <div class="task-meta">${t.event?.title || 'Event Unknown'} · Priority: ${t.priority || 'Medium'}</div>
        </div>
      </div>
      <div class="task-right">
        ${pill(t.status)}
      </div>
    </div>
  `).join('');
}

function initTabs() {
  const tabs = document.getElementById('taskTabs');
  if (!tabs) return;
  tabs.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      tabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filter = btn.dataset.filter;
      render();
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initTasks();
});

window.toggleDone = toggleDone;

