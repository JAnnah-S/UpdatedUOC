document.addEventListener('DOMContentLoaded', () => {
  if (document.body.dataset.page !== 'participantList' || !window.App) return;

  const db = App.getDB();
  const user = App.currentUser();
  const eventSelect = document.getElementById('participantEventSelect');
  const searchInput = document.getElementById('participantSearch');
  const confirmedTable = document.getElementById('confirmedParticipantsTable');
  const waitingTable = document.getElementById('waitingParticipantsTable');

  if (!user || user.role !== 'committee') {
    App.toast('Only committee can access participant list.', 'error');
    window.location.href = '../login.html';
    return;
  }

  const clubId = user.clubId || (db.memberships.find(m => m.userId === user.id && m.type === 'Committee') || {}).clubId;
  const allowedEvents = db.events
    .filter(e => e.clubId === clubId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (!allowedEvents.length) {
    eventSelect.innerHTML = '<option>No event available for your club</option>';
    eventSelect.disabled = true;
    renderEmptyState('Your club has no event yet. Create an event first.');
    return;
  }

  eventSelect.innerHTML = allowedEvents.map(e => `
    <option value="${e.id}">
      ${App.escapeHTML(e.title)} (${App.formatDate(e.date)})
    </option>
  `).join('');

  const queryId = App.getQueryParam('id');
  if (queryId && allowedEvents.some(e => e.id === queryId)) {
    eventSelect.value = queryId;
  }

  eventSelect.addEventListener('change', renderParticipantList);
  searchInput.addEventListener('input', renderParticipantList);
  document.getElementById('exportParticipantsBtn')?.addEventListener('click', exportCSV);

  renderParticipantList();

  function statusClass(status) {
    if (status === 'Waiting') return 'late';
    if (status === 'Cancelled') return 'cancelled';
    return 'active';
  }

  function studentForRegistration(reg) {
    return db.users.find(u => u.id === reg.userId) || {
      name: reg.studentName || '-',
      studentId: reg.studentId || '-'
    };
  }

  function registrationsForCurrentEvent() {
    const eventId = eventSelect.value;
    const q = (searchInput.value || '').toLowerCase();

    return db.registrations
      .filter(r => r.eventId === eventId && r.status !== 'Cancelled')
      .filter(r => {
        const u = studentForRegistration(r);
        return !q || `${u.name} ${u.studentId}`.toLowerCase().includes(q);
      });
  }

  function renderParticipantList() {
    const eventId = eventSelect.value;
    const ev = allowedEvents.find(e => e.id === eventId);
    const rows = registrationsForCurrentEvent();

    const confirmed = rows.filter(r => App.isConfirmedRegistration(r.status));
    const waiting = rows.filter(r => r.status === 'Waiting');

    const capacity = Number(ev?.capacity || 0);
    const fill = capacity ? Math.round((confirmed.length / capacity) * 100) : 0;

    document.getElementById('confirmedCount').textContent = `${confirmed.length} / ${capacity}`;
    document.getElementById('waitingCount').textContent = waiting.length;
    document.getElementById('fillRate').textContent = `${fill}%`;
    document.getElementById('waitingLabel').textContent = `${waiting.length} student(s)`;

    const club = db.clubs.find(c => c.id === ev?.clubId);

    document.getElementById('eventMetaText').textContent = ev
      ? `${club ? club.name : 'Your Club'} • ${App.formatDate(ev.date)} • ${ev.time} • ${ev.venue}`
      : 'No event selected.';

    confirmedTable.innerHTML = confirmed.map((r, index) => {
      const u = studentForRegistration(r);

      return `
        <tr>
          <td>${index + 1}</td>
          <td><strong>${App.escapeHTML(u.name)}</strong></td>
          <td>${App.escapeHTML(u.studentId)}</td>
          <td>${App.escapeHTML(r.registeredAt || '-')}</td>
          <td>
            <span class="badge ${statusClass(r.status)}">
              ${App.escapeHTML(r.status === 'Registered' ? 'Confirmed' : r.status)}
            </span>
          </td>
        </tr>
      `;
    }).join('') || '<tr><td colspan="5">No confirmed participant.</td></tr>';

    waitingTable.innerHTML = waiting.map((r, index) => {
      const u = studentForRegistration(r);

      return `
        <tr>
          <td>${index + 1}</td>
          <td><strong>${App.escapeHTML(u.name)}</strong></td>
          <td>${App.escapeHTML(u.studentId)}</td>
          <td>${App.escapeHTML(r.registeredAt || '-')}</td>
          <td class="actions">
            <button class="btn btn-primary btn-small" data-promote="${App.escapeHTML(r.id)}">Promote</button>
            <button class="btn btn-danger btn-small" data-remove="${App.escapeHTML(r.id)}">Remove</button>
          </td>
        </tr>
      `;
    }).join('') || '<tr><td colspan="5">No student in waiting list.</td></tr>';

    waitingTable.querySelectorAll('[data-promote]').forEach(btn => {
      btn.addEventListener('click', () => updateRegistration(btn.dataset.promote, 'promote'));
    });

    waitingTable.querySelectorAll('[data-remove]').forEach(btn => {
      btn.addEventListener('click', () => updateRegistration(btn.dataset.remove, 'remove'));
    });
  }

  async function updateRegistration(registrationId, action) {
    if (action === 'remove' && !confirm('Remove this student from waiting list?')) return;

    try {
      await App.apiPost('update_registration.php', { registrationId, action });
      await App.refreshFromServer();

      App.toast(action === 'promote'
        ? 'Student promoted to confirmed participants.'
        : 'Student removed from waiting list.'
      );

      setTimeout(() => location.reload(), 700);
    } catch (err) {
      App.toast(err.message || 'Unable to update registration.', 'error');
    }
  }

  function exportCSV() {
    const ev = allowedEvents.find(e => e.id === eventSelect.value);
    const rows = registrationsForCurrentEvent().filter(r => App.isConfirmedRegistration(r.status));

    const lines = [['No', 'Student Name', 'Student ID', 'Registration Date', 'Status']];

    rows.forEach((r, i) => {
      const u = studentForRegistration(r);
      lines.push([
        i + 1,
        u.name,
        u.studentId,
        r.registeredAt || '-',
        r.status === 'Registered' ? 'Confirmed' : r.status
      ]);
    });

    const csv = lines
      .map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${(ev?.title || 'participants').replace(/[^a-z0-9]+/gi, '_')}_participants.csv`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  }

  function renderEmptyState(message) {
    confirmedTable.innerHTML = `<tr><td colspan="5">${App.escapeHTML(message)}</td></tr>`;
    waitingTable.innerHTML = `<tr><td colspan="5">${App.escapeHTML(message)}</td></tr>`;
    document.getElementById('confirmedCount').textContent = '0 / 0';
    document.getElementById('waitingCount').textContent = '0';
    document.getElementById('fillRate').textContent = '0%';
  }
});