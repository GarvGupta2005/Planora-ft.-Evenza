/* Event Details — event-details.js */
'use strict';

const API_BASE = 'http://localhost:5000/api';
let currentEvent = null;

async function initEventDetails() {
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('id');
    
    if (!eventId) {
        alert('No event ID provided.');
        window.location.href = '../home/home.html';
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/events/${eventId}`);
        const data = await res.json();
        
        if (data.success && data.data) {
            currentEvent = data.data;
            renderEvent(currentEvent);
        } else {
            alert('Event not found.');
            window.location.href = '../home/home.html';
        }
    } catch (err) {
        console.error('Error fetching event details:', err);
    }
}

function renderEvent(event) {
    const container = document.getElementById('eventDetailContent');
    if (!container) return;

    const startDate = new Date(event.eventDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    
    container.innerHTML = `
        <div class="event-hero">
            <div class="hero-banner" style="background:${event.color || 'linear-gradient(135deg, var(--purple), var(--cyan))'}"></div>
            <div class="hero-emoji">${event.emoji || '🎯'}</div>
            <div class="hero-body">
                <h1 class="hero-title">${event.title}</h1>
                <div class="hero-meta">
                    <span>📅 ${startDate}</span>
                    <span>⏰ ${event.startTime} - ${event.endTime || 'End'}</span>
                    <span>📍 ${event.isVirtual ? 'Virtual Event' : event.venue}</span>
                    <span>👥 ${event.capacity} Capacity</span>
                </div>
            </div>
        </div>

        <div class="event-content">
            <div class="details-card">
                <h2 class="details-title">About this event</h2>
                <div class="details-text">${event.description}</div>
            </div>

            <div class="sidebar-sticky">
                <div class="action-card">
                    <div class="price-tag">Free</div>
                    <div class="spots-left">${event.capacity} spots available</div>
                    
                    <button class="btn-primary btn-full" onclick="joinEvent('participant')">Join as Participant</button>
                    ${event.volunteerSlots > 0 ? `
                        <button class="btn-ghost btn-full" onclick="joinEvent('volunteer')">Join as Volunteer</button>
                    ` : ''}
                    
                    <p style="font-size:11px; color:var(--text-dim); margin-top:10px;">
                        By joining, you agree to the event terms and Planora's code of conduct.
                    </p>
                </div>

                <div class="action-card" style="text-align:left">
                    <div style="font-weight:700; color:var(--text); margin-bottom:12px">Organizer</div>
                    <div style="display:flex; align-items:center; gap:12px">
                        <div style="width:40px; height:40px; border-radius:50%; background:var(--purple-light); display:flex; align-items:center; justify-content:center; color:var(--purple); font-weight:700">
                            ${(event.organizer.fullName || '??').split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <div>
                            <div style="font-weight:600; color:var(--text)">${event.organizer.fullName}</div>
                            <div style="font-size:12px; color:var(--text-dim)">Professional Organizer</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

async function joinEvent(role) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please sign in to join the event.');
        window.location.href = '../auth/signin.html';
        return;
    }

    if (!confirm(`Do you want to join this event as a ${role}?`)) return;

    try {
        const res = await fetch(`${API_BASE}/registrations/event/${currentEvent._id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ role: role })
        });

        const data = await res.json();
        if (res.ok) {
            alert(`Successfully joined as ${role}!`);
            window.location.href = role === 'volunteer' 
                ? '../volunteer/overview/overview.html' 
                : '../participant/overview/overview.html';
        } else {
            alert(data.message || 'Failed to join event');
        }
    } catch (err) {
        console.error('Error joining event:', err);
        alert('An error occurred. Please try again.');
    }
}

document.addEventListener('DOMContentLoaded', initEventDetails);
window.joinEvent = joinEvent;
