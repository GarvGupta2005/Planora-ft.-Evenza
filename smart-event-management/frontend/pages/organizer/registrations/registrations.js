/* Organizer Registrations — registrations.js */
'use strict';

const API_BASE = 'http://localhost:5000/api';
let allRegistrations = [];
let currentFilter = 'all';
let selectedEventId = '';

/**
 * Initialize Page
 */
async function initRegistrations() {
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
        // 1. Fetch Events to populate dropdown
        const eventRes = await fetch(`${API_BASE}/events/my-events`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const eventData = await eventRes.json();
        const myEvents = eventData.data || [];

        const selector = document.getElementById('eventFilter');
        if (selector) {
            selector.innerHTML = '<option value="">All Events</option>' + 
                myEvents.map(e => `<option value="${e._id}">${e.title}</option>`).join('');
            
            selector.addEventListener('change', (e) => {
                selectedEventId = e.target.value;
                render();
            });
        }

        // 2. Fetch All Registrations for Organizer
        await fetchRegistrations();

        // 3. Setup Tab Filters
        const tabs = document.getElementById('regTabs');
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

        // 4. Setup Search
        const search = document.getElementById('searchInput');
        if (search) {
            search.addEventListener('input', () => render());
        }

    } catch (err) {
        console.error('Error initializing registrations:', err);
    }
}

async function fetchRegistrations() {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_BASE}/registrations/organizer`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        allRegistrations = data.data || [];
        render();
        updateStats();
    } catch (err) {
        console.error('Error fetching registrations:', err);
    }
}

function updateStats() {
    const total = allRegistrations.length;
    const pending = allRegistrations.filter(r => r.status === 'pending').length;
    const approved = allRegistrations.filter(r => r.status === 'registered' || r.status === 'approved' || r.status === 'attended').length;
    const rejected = allRegistrations.filter(r => r.status === 'rejected' || r.status === 'cancelled').length;

    // We search across all stat-card-num elements by their labels
    // But since the HTML has specific structure, we'll try to find them
    const cards = document.querySelectorAll('.stat-card');
    cards.forEach(card => {
        const label = card.querySelector('.stat-card-label')?.textContent?.toLowerCase();
        const num = card.querySelector('.stat-card-num');
        if (!num) return;

        if (label?.includes('total')) num.textContent = total;
        if (label?.includes('pending')) num.textContent = pending;
        if (label?.includes('approved')) num.textContent = approved;
        if (label?.includes('rejected')) num.textContent = rejected;
    });
}

function render() {
    const tbody = document.getElementById('regBody');
    if (!tbody) return;

    const searchVal = (document.getElementById('searchInput')?.value || '').toLowerCase();

    const filtered = allRegistrations.filter(r => {
        // Status Filter
        let statusMatch = true;
        if (currentFilter !== 'all') {
            if (currentFilter === 'approved') {
                statusMatch = ['registered', 'attended', 'approved'].includes(r.status);
            } else if (currentFilter === 'rejected') {
                statusMatch = ['rejected', 'cancelled'].includes(r.status);
            } else {
                statusMatch = r.status === currentFilter;
            }
        }

        // Event Filter
        let eventMatch = true;
        if (selectedEventId) {
            eventMatch = r.event._id === selectedEventId;
        }

        // Search Match
        let searchMatch = true;
        if (searchVal) {
            searchMatch = r.user.fullName.toLowerCase().includes(searchVal) || 
                          r.user.email.toLowerCase().includes(searchVal) ||
                          r.event.title.toLowerCase().includes(searchVal);
        }

        return statusMatch && eventMatch && searchMatch;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-dim)">No registrations found.</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map(r => {
        const u = r.user || { fullName: 'Deleted User', email: 'N/A' };
        const ev = r.event || { title: 'Deleted Event' };
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
            <td style="text-transform:capitalize">${r.role}</td>
            <td>${new Date(r.createdAt).toLocaleDateString()}</td>
            <td>
                <span class="badge ${getStatusBadgeClass(r.status)}">
                    ${r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                </span>
            </td>
            <td>
                <div style="display:flex;gap:5px">
                    ${r.status === 'pending' ? `
                        <button class="btn-chip primary" onclick="updateStatus('${r._id}', 'registered')">Approve</button>
                        <button class="btn-chip" onclick="updateStatus('${r._id}', 'rejected')">Reject</button>
                    ` : `
                        <button class="btn-chip" onclick="showRegistrationDetails('${r._id}')">Details</button>
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

async function updateStatus(regId, newStatus) {
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
            await fetchRegistrations();
        } else {
            const data = await res.json();
            alert(data.message || 'Failed to update status');
        }
    } catch (err) {
        console.error('Error updating registration status:', err);
    }
}

function showRegistrationDetails(id) {
    const r = allRegistrations.find(x => x._id === id);
    if (!r) return;
    const name = r.user ? r.user.fullName : 'Deleted User';
    const email = r.user ? r.user.email : 'N/A';
    const title = r.event ? r.event.title : 'Deleted Event';
    alert(`Registration Details:\nName: ${name}\nEmail: ${email}\nEvent: ${title}\nStatus: ${r.status}\nRole: ${r.role}\nCode: ${r.regCode || 'N/A'}`);
}

document.addEventListener('DOMContentLoaded', initRegistrations);

window.updateStatus = updateStatus;
window.showRegistrationDetails = showRegistrationDetails;
