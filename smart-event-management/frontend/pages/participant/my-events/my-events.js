/* Participant My Events — my-events.js */
'use strict';

const API_BASE = 'http://localhost:5000/api';
let allEvents = [];
let filter = 'all';

async function fetchMyEvents() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '../../auth/signin.html';
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/registrations/my-registrations`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();

        if (data.success) {
            // Map registrations to a format similar to what the UI expects
            allEvents = data.data.map(reg => {
                const ev = reg.event || {};
                const now = new Date();
                const eventDate = new Date(ev.eventDate);
                
                // Determine status based on dates and reg status
                let viewStatus = 'upcoming';
                if (eventDate < now) viewStatus = 'past';
                if (reg.status === 'pending') viewStatus = 'pending';
                if (reg.status === 'cancelled') viewStatus = 'cancelled';

                return {
                    id: reg._id,
                    eventId: ev._id,
                    name: ev.title || 'Unknown Event',
                    date: `${new Date(ev.eventDate).toLocaleDateString()} · ${ev.startTime || ''}`,
                    venue: ev.venue || 'TBA',
                    status: viewStatus,
                    rawStatus: reg.status,
                    attended: reg.status === 'attended',
                    feedbackDone: reg.feedbackSubmitted || false, // Assuming schema has this or will have it
                    certReady: reg.status === 'attended', // Logic for certificate
                    color: ev.color || '#7c3aed'
                };
            });
            applyFilter();
        } else {
            console.error('Failed to fetch events:', data.message);
        }
    } catch (err) {
        console.error('Error fetching events:', err);
    }
}

function statusBadge(ev) {
    if (ev.status === 'upcoming') return '<span class="badge badge-upcoming">Upcoming</span>';
    if (ev.status === 'past') return '<span class="badge badge-past">Past</span>';
    if (ev.status === 'pending') return '<span class="badge badge-pending">Pending Approval</span>';
    if (ev.status === 'cancelled') return '<span class="badge badge-past" style="background: #ef4444; color: white">Cancelled</span>';
    return `<span class="badge badge-pending">${ev.status}</span>`;
}

function outcomeText(ev) {
    if (ev.status === 'upcoming') return 'Ready to attend';
    if (ev.status === 'pending') return 'Waiting for organizer';
    if (ev.status === 'cancelled') return 'Registration cancelled';
    if (ev.attended) return 'Attendance: Marked present';
    return 'Attendance: Not marked';
}

function render(list) {
    const grid = document.getElementById('eventsGrid');
    if (!grid) return;

    if (!list.length) {
        grid.className = 'section'; // To center the empty state
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🎟️</div>
                <div class="empty-title">No events in this view</div>
                <div class="empty-sub">Join some events to see them here!</div>
                <button class="btn-primary" style="margin-top: 20px" onclick="window.location.href='../../join-event/join-event.html'">Browse Events</button>
            </div>
        `;
        return;
    }

    grid.className = 'cards-grid';
    grid.innerHTML = list.map(ev => `
        <div class="card">
            <div class="card-color-bar" style="background:${ev.color}"></div>
            <div class="card-body">
                <span class="card-emoji">🎫</span>
                <div class="card-title">${ev.name}</div>
                <div class="card-desc">${ev.date} · ${ev.venue}</div>
                <div class="card-metas">
                    <span class="card-meta">${statusBadge(ev)}</span>
                    <span class="card-meta">${outcomeText(ev)}</span>
                </div>
            </div>
            <div class="card-footer" style="justify-content:flex-end">
                <div class="card-actions-row">
                    ${ev.status === 'upcoming' || ev.status === 'pending' ? `
                        <button class="action-pill primary" onclick="window.location.href='../../pages/event-details/event-details.html?id=${ev.eventId}'">View details</button>
                    ` : `
                        <button class="action-pill ${ev.feedbackDone ? '' : 'primary'}" onclick="window.location.href='../feedback/feedback.html?id=${ev.eventId}'">${ev.feedbackDone ? 'Feedback submitted' : 'Submit feedback'}</button>
                        <button class="action-pill ${ev.certReady ? 'primary' : ''}" onclick="window.location.href='../certificates/certificates.html?id=${ev.eventId}'">${ev.certReady ? 'View certificate' : 'Wait for attendance'}</button>
                    `}
                </div>
            </div>
        </div>
    `).join('');
}

function applyFilter() {
    const list = filter === 'all' ? allEvents : allEvents.filter(e => e.status === filter);
    render(list);
}

function initTabs() {
    const tabs = document.getElementById('eventTabs');
    if (!tabs) return;
    tabs.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            tabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filter = btn.dataset.filter;
            applyFilter();
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    fetchMyEvents();
});
