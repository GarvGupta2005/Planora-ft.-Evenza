/* Participant Certificates — certificates.js */
'use strict';

const API_BASE = 'http://localhost:5000/api';
let myCertificates = [];

/**
 * Initialize Certificates Page
 */
async function initCertificates() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '../../auth/signin.html';
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/certificates/my`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    myCertificates = data.data || [];
    
    // Update Stats
    const stats = document.querySelectorAll('.stat-card-num');
    if (stats.length >= 3) {
      stats[0].textContent = myCertificates.length;
      // Pending count is hard to know without another fetch, let's keep mock or 0 for now
      stats[1].textContent = 0; 
      stats[2].textContent = myCertificates.length;
    }

    renderCerts(myCertificates);
  } catch (err) {
    console.error('Error loading certificates:', err);
  }
}

function renderCerts(certs) {
  const grid = document.getElementById('certGrid');
  if (!grid) return;

  if (certs.length === 0) {
    grid.className = 'section';
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🏅</div>
        <div class="empty-title">No certificates yet</div>
        <div class="empty-sub">Certificates appear after successful participation and approval.</div>
      </div>
    `;
    return;
  }

  grid.className = 'cert-grid';
  grid.innerHTML = certs.map(c => `
    <div class="cert-card">
      <div class="cert-preview">
        <div class="cert-seal">✓</div>
        <div style="font-size:10px; color:rgba(255,255,255,0.5); margin-top:10px;">ID: ${c.certCode}</div>
      </div>
      <div class="cert-body">
        <div>
          <div class="cert-title">${c.event.title}</div>
          <div class="cert-meta">Issued: ${new Date(c.issuedAt).toLocaleDateString()}</div>
        </div>
        <div class="cert-actions">
          <button class="btn-chip primary" onclick="downloadCert('${c._id}')">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M11 8v2.5a1 1 0 01-1 1H3a1 1 0 01-1-1V8M6.5 1v7M4 5.5l2.5 2.5 2.5-2.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Download
          </button>
          <button class="btn-chip" onclick="shareCert('${c._id}')">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M9 4.5l-5 4M9 8.5l-5-4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><circle cx="10.5" cy="3.5" r="1.5" stroke="currentColor" stroke-width="1.3"/><circle cx="2.5" cy="6.5" r="1.5" stroke="currentColor" stroke-width="1.3"/><circle cx="10.5" cy="9.5" r="1.5" stroke="currentColor" stroke-width="1.3"/></svg>
            Share
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function downloadCert(certId) {
  const cert = myCertificates.find(c => c._id === certId);
  if (!cert) return;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = user.fullName || 'Valued Participant';

  // Styles
  const primaryColor = [124, 58, 237]; // #7c3aed
  const lightColor = [107, 114, 128]; // gray

  // Border
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(2);
  doc.rect(10, 10, 277, 190);
  doc.setLineWidth(0.5);
  doc.rect(12, 12, 273, 186);

  // Content
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(40);
  doc.setTextColor(...primaryColor);
  doc.text('CERTIFICATE OF PARTICIPATION', 148.5, 60, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('This is to certify that', 148.5, 85, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(32);
  doc.text(userName.toUpperCase(), 148.5, 105, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(16);
  doc.text(`has successfully participated in the event`, 148.5, 120, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text(cert.event.title, 148.5, 135, { align: 'center' });

  doc.setFontSize(12);
  doc.setTextColor(...lightColor);
  doc.text(`Issued on ${new Date(cert.issuedAt).toLocaleDateString()}`, 148.5, 150, { align: 'center' });

  doc.setFontSize(10);
  doc.text(`Certificate ID: ${cert.certCode}`, 148.5, 185, { align: 'center' });
  doc.text('Verified by Planora', 148.5, 190, { align: 'center' });

  // Branding
  doc.setFontSize(18);
  doc.setTextColor(...primaryColor);
  doc.text('Planora', 30, 185);

  doc.save(`Certificate_${cert.event.title.replace(/\s+/g, '_')}.pdf`);
}

function shareCert(id) {
  alert('Link copied to clipboard! (simulated share)');
}

document.addEventListener('DOMContentLoaded', initCertificates);

