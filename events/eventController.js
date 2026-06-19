document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  if (!page || !window.App) return;

  function eventCapacityText(e) {
    const used = App.registrationsForEvent(e.id).length;
    return `${used}/${e.capacity}`;
  }

  async function deleteEvent(eventId) {
    if (!confirm('Are you sure you want to delete this event? This will remove the event, registrations, attendance, QR record and points from database.')) {
      return;
    }

    try {
      await App.apiPost('delete_event.php', { eventId });

      await App.refreshFromServer();

      App.toast('Event deleted from database successfully.');

      setTimeout(() => {
        window.location.href = 'eventList.html';
      }, 700);

    } catch (err) {
      App.toast(err.message || 'Unable to delete event.', 'error');
    }
  }

  function isStudent() { return App.getSession()?.role === 'student'; }

  function renderEventList() {
    const target = document.getElementById('eventList'); if (!target) return;
    const db = App.getDB(); const current = App.currentUser();
    const search = (document.getElementById('eventSearch')?.value || '').toLowerCase();
    const status = document.getElementById('eventStatusFilter')?.value || 'Open';
    let events = db.events.filter(e => status === 'All' || e.status === status);
    if (current?.role === 'committee') {
      const clubId = current.clubId || (db.memberships.find(m => m.userId === current.id && m.type === 'Committee') || {}).clubId;
      // Committee can browse all events, but their attendance pages still show their club only.
      if (document.body.dataset.committeeOnly === 'true') events = events.filter(e => e.clubId === clubId);
    }
    if (search) events = events.filter(e => `${e.title} ${e.description} ${e.venue} ${e.eventType || ''}`.toLowerCase().includes(search));
    target.innerHTML = events.map(e => {
      const club = db.clubs.find(c => c.id === e.clubId);
      const d = new Date(e.date);
      const session = App.getSession();
      let registerBtn = '';

      if (session?.role === 'student') {
        registerBtn = `<a class="btn btn-primary" href="registerEvent.html?id=${e.id}">Register</a>`;
      } else if (session?.role === 'committee' && current?.clubId === e.clubId) {
        registerBtn = `
          <a class="btn btn-secondary" href="participantList.html?id=${e.id}">Participant List</a>
          <a class="btn btn-secondary" href="attendanceQR.html?id=${e.id}">QR</a>
          <a class="btn btn-primary" href="createEvent.html?id=${e.id}">Edit</a>
          <button class="btn btn-danger btn-small" type="button" data-delete-event="${e.id}">Delete</button>
        `;
      } else {
        registerBtn = `<span class="badge badge-light">View Only</span>`;
      }
      return `<article class="item-card">
        <div style="display:flex;gap:14px;align-items:center"><div class="event-date"><div>${String(d.getDate()).padStart(2,'0')}<small>${d.toLocaleString('en-MY',{month:'short'})}</small></div></div><div><h3>${App.escapeHTML(e.title)}</h3><span class="badge ${String(e.status).toLowerCase()}">${e.status}</span></div></div>
        <p>${App.escapeHTML(e.description)}</p>
        <div class="meta-list"><span>Club <strong>${club ? App.escapeHTML(club.name) : '-'}</strong></span><span>Type <strong>${App.escapeHTML(e.eventType || 'General')}</strong></span><span>Venue <strong>${App.escapeHTML(e.venue)}</strong></span><span>Time <strong>${e.time}</strong></span><span>Capacity <strong>${eventCapacityText(e)}</strong></span></div>
        <div class="card-actions"><a class="btn btn-secondary" href="eventDetails.html?id=${e.id}">View</a>${registerBtn}</div>
      </article>`;
    }).join('') || '<div class="empty-state">No event found.</div>';

    // Attach delete handlers for committee delete buttons
    target.querySelectorAll('[data-delete-event]').forEach(btn => {
      btn.addEventListener('click', () => deleteEvent(btn.dataset.deleteEvent));
    });
  }

  function renderEventDetails() {
    const db = App.getDB(); const id = App.getQueryParam('id') || db.events[0]?.id; const e = db.events.find(x => x.id === id);
    const target = document.getElementById('eventDetails'); if (!target || !e) return App.renderEmpty(target, 'Event not found.');
    const session = App.getSession(); const club = db.clubs.find(c => c.id === e.clubId); const regs = App.registrationsForEvent(e.id);
    let actionButtons = '';

    if (session?.role === 'student') {
      actionButtons = `<a class="btn btn-primary" href="registerEvent.html?id=${e.id}">Register Event</a>`;
    } else if (session?.role === 'committee' && App.currentUser()?.clubId === e.clubId) {
      actionButtons = `
        <a class="btn btn-secondary" href="attendanceQR.html?id=${e.id}">QR Check-in</a>
        <a class="btn btn-secondary" href="participantList.html?id=${e.id}">Participant List</a>
        <a class="btn btn-primary" href="createEvent.html?id=${e.id}">Edit Event</a>
        <button class="btn btn-danger btn-small" type="button" data-delete-event="${e.id}">Delete Event</button>
      `;
    } else {
      actionButtons = `<a class="btn btn-secondary" href="eventList.html">View Only</a>`;
    }
    const participantSection = session?.role === 'student'
      ? `<section class="card"><h2>Privacy Notice</h2><p class="muted-text">Registered participant lists are hidden from students. You can only view your own participation history from your dashboard.</p></section>`
      : `<section class="card"><h2>Registered Participants</h2><div class="table-wrap"><table><thead><tr><th>Name</th><th>Student ID</th><th>Status</th><th>Registered At</th></tr></thead><tbody>${regs.map(r => { const u = db.users.find(x=>x.id===r.userId); return `<tr><td>${u ? App.escapeHTML(u.name) : '-'}</td><td>${u ? App.escapeHTML(u.studentId) : '-'}</td><td><span class="badge">${r.status}</span></td><td>${App.formatDate(r.registeredAt)}</td></tr>`; }).join('') || '<tr><td colspan="4">No participant registered.</td></tr>'}</tbody></table></div></section>`;
    target.innerHTML = `<section class="card"><span class="badge ${String(e.status).toLowerCase()}">${e.status}</span><h2 style="font-size:34px;margin-top:12px">${App.escapeHTML(e.title)}</h2><p>${App.escapeHTML(e.description)}</p>
      <div class="detail-list"><div><span>Organized by</span><strong>${club ? App.escapeHTML(club.name) : '-'}</strong></div><div><span>Date</span><strong>${App.formatDate(e.date)}</strong></div><div><span>Time</span><strong>${e.time}</strong></div><div><span>Venue</span><strong>${App.escapeHTML(e.venue)}</strong></div><div><span>Semester</span><strong>${App.escapeHTML(e.semester || '-')}</strong></div><div><span>Event Type</span><strong>${App.escapeHTML(e.eventType || 'General')}</strong></div><div><span>Capacity</span><strong>${regs.length}/${e.capacity}</strong></div><div><span>Attendance Rate</span><strong>${App.attendanceRateForEvent(e.id)}%</strong></div></div>
      <div class="actions" style="margin-top:22px">${actionButtons}<a class="btn btn-light" href="eventList.html">Back</a></div></section>${participantSection}`;

    // Attach delete handler if present
    target.querySelectorAll('[data-delete-event]').forEach(btn => {
      btn.addEventListener('click', () => deleteEvent(btn.dataset.deleteEvent));
    });
  }

  function initCreateEvent() {
    const db = App.getDB(); const form = document.getElementById('eventForm'); if (!form) return;
    const clubSel = document.getElementById('clubId'); const user = App.currentUser();
    const clubs = user?.role === 'committee' && user.clubId ? db.clubs.filter(c => c.id === user.clubId) : db.clubs.filter(c => c.status === 'Active');
    clubSel.innerHTML = clubs.map(c => `<option value="${c.id}">${App.escapeHTML(c.name)}</option>`).join('');
    const editId = App.getQueryParam('id');
    if (editId) {
      const ev = db.events.find(e => e.id === editId); if (ev) {
        document.getElementById('eventFormTitle').textContent = 'Update Event';
        document.getElementById('eventId').value = ev.id; clubSel.value = ev.clubId; document.getElementById('title').value = ev.title; document.getElementById('date').value = ev.date; document.getElementById('time').value = ev.time; document.getElementById('venue').value = ev.venue; document.getElementById('capacity').value = ev.capacity; document.getElementById('status').value = ev.status; document.getElementById('description').value = ev.description; document.getElementById('semester').value = ev.semester || '2025/2026-2'; document.getElementById('eventType').value = ev.eventType || 'General';
      }
    }
    form.addEventListener('submit', e => {
      e.preventDefault();
      const db2 = App.getDB(); const id = document.getElementById('eventId').value;
      const payload = { clubId: clubSel.value, title: document.getElementById('title').value.trim(), description: document.getElementById('description').value.trim(), date: document.getElementById('date').value, time: document.getElementById('time').value, venue: document.getElementById('venue').value.trim(), capacity: Number(document.getElementById('capacity').value), semester: document.getElementById('semester').value, eventType: document.getElementById('eventType').value, status: document.getElementById('status').value, createdBy: App.currentUser().id };
      let savedEvent;
      if (id) { savedEvent = db2.events.find(x => x.id === id); Object.assign(savedEvent, payload); }
      else { savedEvent = { id: App.nextId('E','events'), ...payload }; db2.events.push(savedEvent); }
      App.saveDB(db2);
      if (db2.backend) {
        App.apiPost('save_event.php', { id, ...payload })
          .then(() => { App.toast(id ? 'Event updated in database.' : 'Event created in database.'); setTimeout(() => location.href='eventList.html', 900); })
          .catch(err => App.toast('Saved locally, but database update failed: ' + err.message, 'error'));
      } else {
        App.toast(id ? 'Event updated.' : 'Event created.'); setTimeout(() => location.href='eventList.html', 800);
      }
    });
  }

  function initRegisterEvent() {
    const db = App.getDB(); const id = App.getQueryParam('id') || db.events[0]?.id; const ev = db.events.find(e => e.id === id);
    const title = document.getElementById('registerTitle'); if (title && ev) title.textContent = ev.title;
    const info = document.getElementById('registerInfo'); if (info && ev) info.innerHTML = `<div class="detail-list"><div><span>Date</span><strong>${App.formatDate(ev.date)}</strong></div><div><span>Venue</span><strong>${App.escapeHTML(ev.venue)}</strong></div><div><span>Type</span><strong>${App.escapeHTML(ev.eventType || 'General')}</strong></div><div><span>Capacity</span><strong>${eventCapacityText(ev)}</strong></div></div>`;
    const form = document.getElementById('registerEventForm'); if (!form || !ev) return;
    form.addEventListener('submit', e => {
      e.preventDefault(); const user = App.currentUser();
      if (user.role !== 'student') return App.toast('Only students can register for events.', 'error');
      const db2 = App.getDB(); const e2 = db2.events.find(x => x.id === id);

      const regs = db2.registrations.filter(r => r.eventId === id && r.status !== 'Cancelled');

      if (regs.some(r => r.userId === user.id)) {
        return App.toast('You already registered or joined the waiting list for this event.', 'error');
      }

      const confirmedCount = regs.filter(r => App.isConfirmedRegistration(r.status)).length;
      const regStatus = confirmedCount >= Number(e2.capacity) ? 'Waiting' : 'Confirmed';

      db2.registrations.push({
        id: App.nextId('R','registrations'),
        eventId: id,
        userId: user.id,
        status: regStatus,
        registeredAt: new Date().toISOString().slice(0,10)
      });

      App.saveDB(db2);

      if (db2.backend) {
        App.apiPost('register_event.php', { eventId: id })
          .then(data => {
            App.toast(data.message || 'Event registration saved to database.');
            setTimeout(() => location.href = 'eventDetails.html?id=' + id, 900);
          })
          .catch(err => App.toast('Saved locally, but database registration failed: ' + err.message, 'error'));
      } else {
        App.toast(regStatus === 'Waiting' ? 'Event is full. You have been added to the waiting list.' : 'Event registration confirmed.');
        setTimeout(() => location.href = 'eventDetails.html?id=' + id, 900);
      }
    });
  }

  if (page === 'eventList') { renderEventList(); document.getElementById('eventSearch')?.addEventListener('input', renderEventList); document.getElementById('eventStatusFilter')?.addEventListener('change', renderEventList); }
  if (page === 'eventDetails') renderEventDetails();
  if (page === 'createEvent') initCreateEvent();
  if (page === 'registerEvent') initRegisterEvent();
});
