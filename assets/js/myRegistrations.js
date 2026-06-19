document.addEventListener('DOMContentLoaded', () => {
  const table = document.getElementById('myRegistrationTable');
  if (!table || !window.App) return;

  const user = App.currentUser();
  const db = App.getDB();

  if (!user || user.role !== 'student') {
    App.toast('Only students can view this page.', 'error');
    window.location.href = '../login.html';
    return;
  }

  let currentFilter = 'All';

  document.querySelectorAll('.reg-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      currentFilter = btn.dataset.filter;

      document.querySelectorAll('.reg-filter').forEach(b => {
        b.classList.remove('btn-primary');
        b.classList.add('btn-light');
      });

      btn.classList.remove('btn-light');
      btn.classList.add('btn-primary');

      renderMyRegistrations();
    });
  });

  renderMyRegistrations();

  function normalizeStatus(status) {
    if (status === 'Registered') return 'Confirmed';
    return status || 'Confirmed';
  }

  function badgeClass(status) {
    if (status === 'Confirmed') return 'active';
    if (status === 'Waiting') return 'waiting';
    if (status === 'Cancelled') return 'cancelled';
    return 'badge-light';
  }

  function waitingPosition(registration) {
    const waitingRows = db.registrations
      .filter(r => r.eventId === registration.eventId && normalizeStatus(r.status) === 'Waiting')
      .sort((a, b) => new Date(a.registeredAt || a.registrationDate || 0) - new Date(b.registeredAt || b.registrationDate || 0));

    const index = waitingRows.findIndex(r => r.id === registration.id);
    return index >= 0 ? index + 1 : '-';
  }

  function getStudentRegistrations() {
    return db.registrations
      .filter(r => r.userId === user.id || r.studentId === user.studentId)
      .map(r => {
        const event = db.events.find(e => e.id === r.eventId);
        const club = db.clubs.find(c => c.id === event?.clubId);

        return {
          ...r,
          event,
          club,
          displayStatus: normalizeStatus(r.status)
        };
      })
      .filter(r => r.event);
  }

  function renderMyRegistrations() {
    let rows = getStudentRegistrations();

    if (currentFilter !== 'All') {
      rows = rows.filter(r => r.displayStatus === currentFilter);
    }

    rows = rows.sort((a, b) => new Date(b.registeredAt || b.registrationDate || 0) - new Date(a.registeredAt || a.registrationDate || 0));

    if (!rows.length) {
      table.innerHTML = '<tr><td colspan="5">No registration record found.</td></tr>';
      return;
    }

    table.innerHTML = rows.map(r => {
      const event = r.event;
      const club = r.club;
      const status = r.displayStatus;

      let statusText = status;

      if (status === 'Waiting') {
        statusText = `Waiting (#${waitingPosition(r)})`;
      }

      let action = '<span class="muted-text">-</span>';

      if (status === 'Confirmed') {
        action = `<button class="btn btn-danger btn-small" data-cancel="${App.escapeHTML(r.id)}">Cancel</button>`;
      }

      if (status === 'Waiting') {
        action = `<button class="btn btn-light btn-small" data-leave="${App.escapeHTML(r.id)}">Leave Queue</button>`;
      }

      if (status === 'Cancelled') {
        action = `<span class="badge cancelled">No action</span>`;
      }

      return `
        <tr>
          <td><strong>${App.escapeHTML(event.title)}</strong></td>
          <td><span class="badge badge-light">${App.escapeHTML(club ? club.name : '-')}</span></td>
          <td>${App.formatDate(event.date)}</td>
          <td><span class="badge ${badgeClass(status)}">${App.escapeHTML(statusText)}</span></td>
          <td>${action}</td>
        </tr>
      `;
    }).join('');

    table.querySelectorAll('[data-cancel]').forEach(btn => {
      btn.addEventListener('click', () => cancelRegistration(btn.dataset.cancel));
    });

    table.querySelectorAll('[data-leave]').forEach(btn => {
      btn.addEventListener('click', () => leaveQueue(btn.dataset.leave));
    });
  }

  async function cancelRegistration(registrationId) {
    if (!confirm('Are you sure you want to cancel this event registration?')) return;

    try {
      await App.apiPost('student_registration_action.php', {
        registrationId,
        action: 'cancel'
      });

      await App.refreshFromServer();

      App.toast('Registration cancelled successfully.');
      setTimeout(() => location.reload(), 600);
    } catch (err) {
      App.toast(err.message || 'Unable to cancel registration.', 'error');
    }
  }

  async function leaveQueue(registrationId) {
    if (!confirm('Are you sure you want to leave the waiting list?')) return;

    try {
      await App.apiPost('student_registration_action.php', {
        registrationId,
        action: 'leave_queue'
      });

      await App.refreshFromServer();

      App.toast('You have left the waiting list.');
      setTimeout(() => location.reload(), 600);
    } catch (err) {
      App.toast(err.message || 'Unable to leave waiting list.', 'error');
    }
  }
});