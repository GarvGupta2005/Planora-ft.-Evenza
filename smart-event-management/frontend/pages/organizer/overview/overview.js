/* Organizer Overview — overview.js */
'use strict';

async function fetchStatsAndEvents() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '../../auth/signin.html';
    return;
  }

  // Initialize User View
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.fullName) {
      document.querySelectorAll('.user-name').forEach(el => el.textContent = user.fullName);
      const initials = user.fullName.split(' ').map(n => n[0]).join('').toUpperCase();
      document.querySelectorAll('.user-avatar, .topbar-avatar').forEach(el => el.textContent = initials);
  }

  try {
    // 1. Fetch Events
    const eventsRes = await fetch('http://localhost:5000/api/events', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const eventsData = await eventsRes.json();
    const events = eventsData.data || [];

    const regRes = await fetch('http://localhost:5000/api/registrations/organizer', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const regData = await regRes.json();
    const allRegs = regData.data || [];
    
    let totalPending = allRegs.filter(r => r.status === 'pending').length;
    let pendingVolunteers = allRegs.filter(r => r.status === 'pending' && r.role === 'volunteer').length;
    let pendingParticipants = allRegs.filter(r => r.status === 'pending' && r.role === 'participant').length;

    let totalAttendees = 0;
    let totalFeedbackResponses = 0;
    let sumFeedbackScores = 0;
    const upcomingData = [];
    const attendanceData = [];

    // 2. Process each event
    for (const ev of events) {
      // Determine status string manually
      let status = 'upcoming';
      const now = new Date();
      const st = new Date(ev.eventDate); // Fixed: was startDate
      if (st < now) status = 'past';
      if (ev.status === 'live') status = 'live';

      upcomingData.push({
        name: ev.title,
        date: new Date(ev.eventDate).toLocaleDateString() + ' · ' + (ev.startTime || ''),
        venue: ev.venue || 'Virtual',
        status: status,
        color: ev.color || '#06b6d4'
      });

      // 3. Fetch Dashboard Stats for this event
      const summaryRes = await fetch(`http://localhost:5000/api/dashboard/events/${ev._id}/summary`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const summaryData = await summaryRes.json();
      if (summaryData.success && summaryData.data) {
        let stats = summaryData.data.stats;
        totalAttendees += stats.attendees || 0;
        totalFeedbackResponses += stats.feedbackCount || 0;
        sumFeedbackScores += (stats.avgRating * stats.feedbackCount) || 0;

        attendanceData.push({
          name: ev.title,
          attended: stats.attendees || 0,
          registered: stats.totalRegistrations || 0,
          color: ev.color || '#7c3aed'
        });
      } else {
        // Fallback for UI if individual summary fails
        attendanceData.push({
          name: ev.title,
          attended: 0,
          registered: ev.registrationCount || 0,
          color: ev.color || '#7c3aed'
        });
      }

      // Add to pending volunteers/participants
      // Could make separate call to /api/registrations if we wanted full pending counts.
    }

    // Update Top Stat Cards
    const statCards = document.querySelectorAll('.stat-card-num');
    if (statCards.length >= 4) {
      statCards[0].textContent = events.length;                     // Total Events
      statCards[1].textContent = totalPending;                      // Pending Registrations
      
      const pendingSub = document.querySelectorAll('.stat-card--amber .stat-card-sub');
      if (pendingSub.length > 0) {
        pendingSub[0].textContent = `${pendingVolunteers} volunteers, ${pendingParticipants} participants`;
      }

      statCards[2].textContent = totalAttendees;                    // Total Attendees
      statCards[3].textContent = totalFeedbackResponses;            // Feedback Responses

      // ... existing rating code ...
      const avgRate = totalFeedbackResponses > 0 ? (sumFeedbackScores / totalFeedbackResponses).toFixed(1) : "0.0";
      const ratingChips = document.querySelectorAll('.stat-card--cyan .stat-chip');
      if (ratingChips.length > 0) ratingChips[0].textContent = `${avgRate} ★`;
      const ratingSub = document.querySelectorAll('.stat-card--cyan .stat-card-sub');
      if (ratingSub.length > 0) ratingSub[0].textContent = `Avg rating: ${avgRate} / 5`;
    }

    // Update Alert Card
    const alertBody = document.querySelector('.alert-card .alert-title');
    if (alertBody) {
      if (totalPending > 0) {
        alertBody.textContent = `${totalPending} registrations awaiting approval`;
        const alertText = document.querySelector('.alert-card .alert-text');
        if (alertText) alertText.innerHTML = `${pendingVolunteers} volunteer requests and ${pendingParticipants} participant requests need your review. <a href="../registrations/registrations.html" style="color:var(--purple-light);font-weight:600;">Review now →</a>`;
        document.querySelector('.alert-card').style.display = 'flex';
      } else {
        document.querySelector('.alert-card').style.display = 'none';
      }
    }

    renderUpcoming(upcomingData);
    renderAttendance(attendanceData);
    renderActivity();

  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
  }
}

function badgeForStatus(status) {
  if (status === 'live') return '<span class="badge badge-live">● Live</span>';
  if (status === 'upcoming') return '<span class="badge badge-upcoming">Upcoming</span>';
  return '<span class="badge badge-past">Past</span>';
}

function renderUpcoming(data) {
  const el = document.getElementById('upcomingEvents');
  if (!el || data.length === 0) {
      if (el) el.innerHTML = '<div style="padding: 10px; color: #888;">No events currently created. Add some from the Add Event page!</div>';
      return;
  }

  el.innerHTML = data.map((ev, i) => i > 4 ? '' : `
    <div class="ov-row">
      <div class="ov-left">
        <div class="ov-dot" style="background:${ev.color}"></div>
        <div style="min-width:0">
          <div class="ov-title">${ev.name}</div>
          <div class="ov-sub">${ev.date} · ${ev.venue}</div>
        </div>
      </div>
      <div class="ov-right">
        ${badgeForStatus(ev.status)}
      </div>
    </div>
  `).join('');
}

function renderAttendance(data) {
  const el = document.getElementById('attendanceProgress');
  if (!el || data.length === 0) return;

  el.innerHTML = data.map((item, i) => {
    if (i > 4) return '';
    const pct = item.registered > 0 ? Math.max(0, Math.min(100, Math.round((item.attended / item.registered) * 100))) : 0;
    return `
      <div class="ov-row">
        <div class="ov-left">
          <div class="ov-dot" style="background:${item.color}"></div>
          <div style="min-width:0;flex:1">
            <div class="ov-title">${item.name}</div>
            <div class="progress-wrap" style="margin-top:8px">
              <div class="progress-info"><span>Attendance</span><strong>${item.attended} / ${item.registered || 0}</strong></div>
              <div class="progress-bar"><div class="progress-fill" style="width:${pct}%; background: linear-gradient(90deg, ${item.color}, var(--purple-light));"></div></div>
            </div>
          </div>
        </div>
        <div class="ov-right">
          <div class="ov-meta">${pct}%</div>
        </div>
      </div>
    `;
  }).join('');
}

function renderActivity() {
  const el = document.getElementById('activityList');
  if (!el) return;

  el.innerHTML = `
    <div class="activity-item">
      <div class="ai-dot" style="background:#7c3aed"></div>
      <div class="ai-body">
        <div class="ai-text"><strong>Evenza AI</strong> suggests creating interactive polls to increase engagement.</div>
        <div class="ai-time">Just now</div>
      </div>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  fetchStatsAndEvents();
});
