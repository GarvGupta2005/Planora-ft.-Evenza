/* Organizer My Events — my-events.js */
'use strict';

const API_BASE = 'http://localhost:5000/api';
let allEvents = [];
let filter = 'all';
let view = 'grid'; // 'grid' | 'list'

async function fetchMyEvents() {
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
        const response = await fetch(`${API_BASE}/events/my-events`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (data.success) {
            allEvents = data.data.map(ev => {
                const now = new Date();
                const eventDate = new Date(ev.eventDate);
                
                let status = 'upcoming';
                if (eventDate < now) status = 'past';
                if (ev.status === 'live') status = 'live';

                return {
                    id: ev._id,
                    title: ev.title,
                    date: `${new Date(ev.eventDate).toLocaleDateString()} · ${ev.startTime}`,
                    venue: ev.venue,
                    status: status,
                    code: ev.joinCode,
                    color: ev.color || '#7c3aed',
                    registrations: ev.registrationCount || 0,
                    cap: ev.capacity
                };
            });
            applyFilter();
        }
    } catch (err) {
        console.error('Error fetching events:', err);
    }
}

function badge(status) {
    if (status === 'live') return '<span class="badge badge-live">● Live</span>';
    if (status === 'upcoming') return '<span class="badge badge-upcoming">Upcoming</span>';
    return '<span class="badge badge-past">Past</span>';
}

function renderGrid(list) {
    const container = document.getElementById('eventsContainer');
    if (!container) return;

    container.className = 'cards-grid';
    container.innerHTML = list.map(ev => `
        <div class="card" onclick="window.location.href='../../event-details/event-details.html?id=${ev.id}'">
            <div class="card-color-bar" style="background:${ev.color}"></div>
            <div class="card-body">
                <span class="card-emoji">📅</span>
                <div class="card-title">${ev.title}</div>
                <div class="card-desc">${ev.date} · ${ev.venue}</div>
                <div class="card-metas">
                    <span class="card-meta">${badge(ev.status)}</span>
                    <span class="card-meta">${ev.registrations}/${ev.cap} reg.</span>
                </div>
            </div>
            <div class="card-footer">
                <div class="card-code">${ev.code}</div>
                <div class="card-actions">
                    <button class="btn-icon" title="Edit" onclick="event.stopPropagation(); window.location.href='../../add-event/add-event.html?id=${ev.id}'">
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2 11.5l.5-3.5L10.8 0.7a1.2 1.2 0 011.7 0l1.8 1.8a1.2 1.2 0 010 1.7L6 11.9 2 11.5z" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round"/><path d="M9.5 2l3.5 3.5" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/></svg>
                    </button>
                    <button class="btn-icon" title="Manage" onclick="event.stopPropagation(); window.location.href='../registrations/registrations.html?eventId=${ev.id}'">
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M3 4h9M3 7.5h6M3 11h8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function renderList(list) {
    const container = document.getElementById('eventsContainer');
    if (!container) return;

    container.className = 'events-list';
    container.innerHTML = list.map(ev => `
        <div class="event-row" onclick="window.location.href='../../event-details/event-details.html?id=${ev.id}'">
            <div class="er-dot" style="background:${ev.color}"></div>
            <div class="er-body">
                <div class="er-title">${ev.title}</div>
                <div class="er-meta">
                    <span>${ev.date}</span>
                    <span>·</span>
                    <span>${ev.venue}</span>
                    <span>·</span>
                    <span>${ev.registrations}/${ev.cap} registered</span>
                </div>
            </div>
            <div class="er-right">
                ${badge(ev.status)}
                <div class="er-code" title="Event code">${ev.code}</div>
                <button class="btn-icon" title="Registrations" onclick="event.stopPropagation(); window.location.href='../registrations/registrations.html?eventId=${ev.id}'">
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M3 4h9M3 7.5h6M3 11h8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
                </button>
            </div>
        </div>
    `).join('');
}

function applyFilter() {
    const list = filter === 'all' ? allEvents : allEvents.filter(e => e.status === filter);
    if (!list.length) {
        const container = document.getElementById('eventsContainer');
        if (container) {
            container.className = 'section';
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🗓️</div>
                    <div class="empty-title">No events found</div>
                    <div class="empty-sub">Try a different filter or create a new event.</div>
                    <button class="btn-primary" style="margin-top:20px" onclick="window.location.href='../../add-event/add-event.html'">Create Event</button>
                </div>
            `;
        }
        return;
    }
    view === 'grid' ? renderGrid(list) : renderList(list);
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

function initViewToggle() {
    const gridBtn = document.getElementById('gridView');
    const listBtn = document.getElementById('listView');
    if (!gridBtn || !listBtn) return;

    const set = (v) => {
        view = v;
        gridBtn.classList.toggle('active', v === 'grid');
        listBtn.classList.toggle('active', v === 'list');
        applyFilter();
    };

    gridBtn.addEventListener('click', () => set('grid'));
    listBtn.addEventListener('click', () => set('list'));
}

document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initViewToggle();
    fetchMyEvents();
});
