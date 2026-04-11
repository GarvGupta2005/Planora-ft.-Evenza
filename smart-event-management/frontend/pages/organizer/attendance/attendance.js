/* Organizer Attendance — attendance.js */
'use strict';

const API_BASE = 'http://localhost:5000/api';
let myEvents = [];
let currentRegistrations = [];
let selectedEventId = '';

/**
 * Initialize Attendance Page
 */
async function initAttendancePage() {
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
        // 1. Fetch My Events to populate selector
        const eventRes = await fetch(`${API_BASE}/events/my-events`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const eventData = await eventRes.json();
        myEvents = eventData.data || [];

        const selector = document.getElementById('eventSelector');
        if (selector) {
            if (myEvents.length > 0) {
                selector.innerHTML = myEvents.map(e => `<option value="${e._id}">${e.title}</option>`).join('');
                selectedEventId = myEvents[0]._id;
                await loadAttendanceData(selectedEventId);
            } else {
                selector.innerHTML = '<option value="">No events found</option>';
                renderEmpty();
            }
        }

        selector?.addEventListener('change', (e) => {
            selectedEventId = e.target.value;
            loadAttendanceData(selectedEventId);
        });

        // Search Setup
        const search = document.getElementById('searchInput');
        if (search) {
            search.addEventListener('input', () => renderAttendance());
        }

        // Mark All Setup
        const markAllBtn = document.getElementById('markAllBtn');
        if (markAllBtn) {
            markAllBtn.addEventListener('click', markAllPresent);
        }

    } catch (err) {
        console.error('Error initializing attendance page:', err);
    }
}

async function loadAttendanceData(eventId) {
    if (!eventId) return;
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_BASE}/registrations/event/${eventId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        currentRegistrations = data.data || [];
        
        // Update Event Detail Card
        const event = myEvents.find(e => e._id === eventId);
        if (event) {
            const numEl = document.querySelector('.stat-card--cyan .stat-card-num');
            const subEl = document.querySelector('.stat-card--cyan .stat-card-sub');
            if (numEl) numEl.textContent = event.title;
            if (subEl) subEl.textContent = new Date(event.eventDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
        }

        renderAttendance();
        updateStats();
    } catch (err) {
        console.error('Error loading attendance data:', err);
    }
}

function updateStats() {
    // Filter for volunteers only as per user request
    const volunteerRegs = currentRegistrations.filter(r => 
        r.role === 'volunteer' && r.status !== 'cancelled' && r.status !== 'rejected'
    );

    const total = volunteerRegs.length;
    const attended = volunteerRegs.filter(r => r.status === 'attended').length;
    const absent = total - attended;
    const rate = total > 0 ? Math.round((attended / total) * 100) : 0;

    const totalEl = document.getElementById('totalReg');
    const attendedEl = document.getElementById('attended');
    const absentEl = document.getElementById('absent');
    const rateEl = document.getElementById('attendRate');
    const barEl = document.getElementById('attendBar');
    const rateChip = document.querySelector('.stat-card--green .stat-chip');

    if (totalEl) totalEl.textContent = total;
    if (attendedEl) attendedEl.textContent = attended;
    if (absentEl) absentEl.textContent = absent;
    if (rateEl) rateEl.textContent = `${rate}%`;
    if (barEl) barEl.style.width = `${rate}%`;
    if (rateChip) rateChip.textContent = `${rate}%`;
}

function renderAttendance() {
    const tbody = document.getElementById('attendBody');
    if (!tbody) return;

    const searchVal = (document.getElementById('searchInput')?.value || '').toLowerCase();
    
    // Filter: ONLY VOLUNTEERS + NO CANCELLED + SEARCH
    const filtered = currentRegistrations.filter(r => {
        if (r.role !== 'volunteer') return false; // Show only volunteers
        if (r.status === 'cancelled' || r.status === 'rejected') return false;
        
        if (!searchVal) return true;
        const u = r.user || {};
        return (u.fullName || '').toLowerCase().includes(searchVal) || (u.email || '').toLowerCase().includes(searchVal);
    });

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--text-dim)">' + 
            (currentRegistrations.some(r => r.role === 'volunteer') ? 'No matches found for your search.' : 'No volunteers registered for this event yet.') + '</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map(r => {
        const u = r.user || { fullName: 'Unknown', email: 'N/A' };
        return `
        <tr>
            <td>
                <div style="display:flex;align-items:center;gap:10px">
                    <div style="width:32px;height:32px;border-radius:50%;background:var(--purple-light);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:var(--purple)">
                        ${getInitials(u.fullName)}
                    </div>
                    <div>
                        <div style="font-weight:600;color:var(--text)">${u.fullName}</div>
                        <div style="font-size:11px;color:var(--text-dim)">${u.email}</div>
                    </div>
                </div>
            </td>
            <td><span class="badge badge-neutral">Volunteer</span></td>
            <td>${r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
            <td>
                <span class="badge ${r.status === 'attended' ? 'badge-approved' : 'badge-pending'}">
                    ${r.status === 'attended' ? 'ATTENDED' : 'NOT PRESENT'}
                </span>
            </td>
            <td>
                <button class="btn-chip ${r.status === 'attended' ? '' : 'primary'}" 
                        style="min-width:100px; cursor:pointer;"
                        onclick="toggleAttendance('${r._id}', '${r.status}')">
                    ${r.status === 'attended' ? 'Mark Absent' : 'Mark Present'}
                </button>
            </td>
        </tr>
    `;
    }).join('');
}

function renderEmpty() {
    const tbody = document.getElementById('attendBody');
    if (tbody) tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--text-dim)">Create an event first to track attendance.</td></tr>';
}

async function toggleAttendance(regId, currentStatus) {
    const token = localStorage.getItem('token');
    const newStatus = currentStatus === 'attended' ? 'registered' : 'attended';
    
    try {
        const res = await fetch(`${API_BASE}/registrations/${regId}/attendance`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (res.ok) {
            await loadAttendanceData(selectedEventId);
        } else {
            const data = await res.json();
            alert(data.message || 'Failed to update attendance');
        }
    } catch (err) {
        console.error('Error toggling attendance:', err);
    }
}

async function markAllPresent() {
    const token = localStorage.getItem('token');
    if (!selectedEventId) return;

    // Filter to only mark ALL VOLUNTEERS present
    const pendingVolunteers = currentRegistrations.filter(r => r.role === 'volunteer' && r.status === 'registered');

    if (pendingVolunteers.length === 0) {
        alert('All volunteers are already marked present.');
        return;
    }

    if (!confirm(`Mark all ${pendingVolunteers.length} volunteers as present?`)) return;

    try {
        for (const r of pendingVolunteers) {
            await fetch(`${API_BASE}/registrations/${r._id}/attendance`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'attended' })
            });
        }
        await loadAttendanceData(selectedEventId);
    } catch (err) {
        console.error('Error marking all present:', err);
    }
}

function getInitials(name) {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

document.addEventListener('DOMContentLoaded', initAttendancePage);

// Expose globals for onclick
window.toggleAttendance = toggleAttendance;