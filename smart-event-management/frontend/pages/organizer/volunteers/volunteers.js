/* ============================================
   PLANORA — Volunteers Page JS
============================================ */
'use strict';

const API_BASE = 'http://localhost:5000/api';
let allVolunteers = [];
let currentFilter = 'all';

/**
 * Initialize Page
 */
async function initVolunteers() {
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
        // 1. Fetch Volunteers (Registrations with role='volunteer' for organizer events)
        await fetchVolunteers();

        // 2. Setup Filter Tabs
        const tabs = document.getElementById('volTabs');
        if (tabs) {
            tabs.querySelectorAll('.tab-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    tabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    currentFilter = btn.dataset.filter;
                    render();
                });
            });
        }

        // 3. Setup Search
        const search = document.getElementById('searchInput');
        if (search) {
            search.addEventListener('input', () => render());
        }

    } catch (err) {
        console.error('Error initializing volunteers:', err);
    }
}

async function fetchVolunteers() {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_BASE}/volunteers/organizer`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        allVolunteers = data.data || [];
        render();
        updateStats();
    } catch (err) {
        console.error('Error fetching volunteers:', err);
    }
}

function updateStats() {
    const active = allVolunteers.filter(v => v.status === 'registered' || v.status === 'attended').length;
    const pending = allVolunteers.filter(v => v.status === 'pending').length;
    const events = [...new Set(allVolunteers.map(v => v.event?._id))].filter(Boolean).length;
    
    // Select cards by labels
    const cards = document.querySelectorAll('.stat-card');
    cards.forEach(card => {
        const label = card.querySelector('.stat-card-label')?.textContent?.toLowerCase();
        const num = card.querySelector('.stat-card-num');
        if (!num) return;

        if (label?.includes('active')) {
            num.textContent = active;
            const chip = card.querySelector('.stat-chip');
            if (chip) chip.textContent = `${active} active`;
        }
        if (label?.includes('pending')) {
            num.textContent = pending;
        }
        if (label?.includes('roles')) {
            num.textContent = allVolunteers.length; // Simplified: count of volunteers
        }
        if (label?.includes('events')) {
            num.textContent = events;
        }
    });
}

function render() {
    const tbody = document.getElementById('volBody');
    if (!tbody) return;

    const searchVal = (document.getElementById('searchInput')?.value || '').toLowerCase();

    const filtered = allVolunteers.filter(v => {
        // Status Filter
        let statusMatch = true;
        if (currentFilter !== 'all') {
            if (currentFilter === 'approved') {
                statusMatch = v.status === 'registered' || v.status === 'attended';
            } else {
                statusMatch = v.status === currentFilter;
            }
        }

        // Search Match
        const u = v.user || {};
        const ev = v.event || {};
        let searchMatch = true;
        if (searchVal) {
            searchMatch = (u.fullName || '').toLowerCase().includes(searchVal) || 
                          (u.email || '').toLowerCase().includes(searchVal) ||
                          (ev.title || '').toLowerCase().includes(searchVal);
        }

        return statusMatch && searchMatch;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-dim)">No volunteers found.</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map(v => {
        const u = v.user || { fullName: 'Deleted User', email: 'N/A' };
        const ev = v.event || { title: 'Deleted Event' };
        const initials = (u.fullName || '??').split(' ').map(n => n[0]).join('').toUpperCase();
        
        return `
        <tr>
            <td>
                <div style="display:flex;align-items:center;gap:10px">
                    <div style="width:32px;height:32px;border-radius:50%;background:var(--purple-light);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:var(--purple)">
                        ${initials}
                    </div>
                    <div style="min-width:0">
                        <div style="font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${u.fullName}</div>
                        <div style="font-size:11px;color:var(--text-dim);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${u.email}</div>
                    </div>
                </div>
            </td>
            <td><span style="font-weight:500">${ev.title}</span></td>
            <td><span class="badge ${getRoleBadgeClass('General')}">General</span></td>
            <td>${new Date(ev.eventDate || Date.now()).toLocaleDateString()}</td>
            <td>
                <span class="badge ${getStatusBadgeClass(v.status)}">
                    ${v.status.charAt(0).toUpperCase() + v.status.slice(1)}
                </span>
            </td>
            <td>
                <div style="display:flex;gap:5px">
                    ${v.status === 'pending' ? `
                        <button class="btn-chip primary" onclick="updateVolunteerStatus('${v._id}', 'registered')">Approve</button>
                    ` : `
                        <button class="btn-chip" onclick="viewTasks('${v._id}')">Tasks</button>
                    `}
                </div>
            </td>
        </tr>
    `;
    }).join('');
}

function getStatusBadgeClass(status) {
    if (['registered', 'attended', 'approved'].includes(status)) return 'badge-approved';
    if (['rejected', 'cancelled'].includes(status)) return 'badge-rejected';
    return 'badge-pending';
}

function getRoleBadgeClass(role) {
    return 'badge-neutral';
}

async function updateVolunteerStatus(regId, newStatus) {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_BASE}/registrations/${regId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (res.ok) {
            await fetchVolunteers();
        } else {
            const data = await res.json();
            alert(data.message || 'Failed to update status');
        }
    } catch (err) {
        console.error('Error updating volunteer status:', err);
    }
}

function viewTasks(regId) {
    const v = allVolunteers.find(x => x._id === regId);
    if (v) {
        alert(`Tasks for ${v.user.fullName}:\n- Manage Check-ins\n- Venue Setup\n(Task management module coming soon)`);
    }
}

document.addEventListener('DOMContentLoaded', initVolunteers);

// Expose globals for onclick
window.updateVolunteerStatus = updateVolunteerStatus;
window.viewTasks = viewTasks;
