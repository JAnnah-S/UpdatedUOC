document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  if (!page || !window.App) return;

  function captureGeo(targetId) {
    const target = document.getElementById(targetId);
    if (!target) return;
    if (!navigator.geolocation) {
      target.value !== undefined ? target.value = 'Geolocation not supported' : target.textContent = 'Geolocation not supported';
      return;
    }
    const setVal = text => { target.value !== undefined ? target.value = text : target.textContent = text; };
    setVal('Capturing location...');
    navigator.geolocation.getCurrentPosition(
      pos => setVal(`Lat ${pos.coords.latitude.toFixed(5)}, Lng ${pos.coords.longitude.toFixed(5)} • ${new Date().toLocaleString('en-MY')}`),
      () => setVal('Location permission denied. Venue stamp can be typed manually.'),
      { enableHighAccuracy: true, timeout: 6000 }
    );
  }

  function visibleEvents() {
    const user = App.currentUser();
    const events = App.eventsForRole(user);
    return events.sort((a,b) => new Date(b.date) - new Date(a.date));
  }

  function initAttendanceQR() {
  const db = App.getDB();
  const session = App.getSession();
  const user = App.currentUser();

  const title = document.getElementById('qrTitle');
  const meta = document.getElementById('qrMeta');
  const code = document.getElementById('qrCodeText');
  const recordLink = document.getElementById('recordLink');
  const qr = document.getElementById('fakeQR');

  if (!session || session.role !== 'committee') {
    App.toast('Only committee can access event QR code.', 'error');
    window.location.href = '../login.html';
    return;
  }

  const clubId = user.clubId || (db.memberships.find(m => m.userId === user.id && m.type === 'Committee') || {}).clubId;

  const allowedEvents = db.events
    .filter(e => e.clubId === clubId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const queryId = App.getQueryParam('id');
  const ev = (queryId && allowedEvents.find(e => e.id === queryId)) || allowedEvents[0];

  if (queryId && !allowedEvents.some(e => e.id === queryId)) {
    App.toast('Access denied. This QR event does not belong to your club.', 'error');
  }

  if (!ev) {
    if (title) title.textContent = 'No event available';
    if (meta) meta.textContent = 'Your club has no event yet.';
    if (code) code.textContent = '-';
    if (qr) qr.innerHTML = '';
    return;
  }

  const club = db.clubs.find(c => c.id === ev.clubId);

  if (title) title.textContent = ev.title;

  if (meta) {
    meta.textContent = `${club ? club.name : '-'} • ${App.formatDate(ev.date)} • ${ev.time} • ${ev.venue}`;
  }

  if (code) {
    code.textContent = `FKHUB-${ev.id}-${ev.clubId}-${ev.date}`;
  }

  if (recordLink) {
    recordLink.href = `attendanceRecord.html?id=${ev.id}`;
  }


if (qr) {
   console.log('Event ID for QR:', ev.id); // debug
qr.innerHTML = '<p>Loading QR...</p>';
fetch(`../api/generate_qr.php?event_id=${ev.id}`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
               qr.innerHTML = `<img src="${data.qr_url}" alt="Event QR Code" style="width:100%;max-width:300px;height:auto;display:block;margin:0 auto;background:#ffffff;padding:10px;filter:none !important;mix-blend-mode:normal !important;">`;
            } else {
                qr.innerHTML = `<p style="color:red;">${data.message}</p>`;
            }
        })
        .catch(err => {
            qr.innerHTML = `<p style="color:red;">QR generation failed: ${err.message}</p>`;
        });
}

  document.getElementById('qrGeoBtn')?.addEventListener('click', () => captureGeo('geoOutput'));
}

  function initAttendanceRecord() {
    const eventSel = document.getElementById('eventId');
    const userSel = document.getElementById('userId');
    if (!eventSel || !userSel) return;

    const events = visibleEvents();
    eventSel.innerHTML = events.map(e => `<option value="${e.id}">${App.escapeHTML(e.title)} (${App.formatDate(e.date)})</option>`).join('');
    const queryId = App.getQueryParam('id');
    if (queryId && events.some(e => e.id === queryId)) eventSel.value = queryId;

    function updateQrLink() {
      const link = document.getElementById('openQrLink');
      if (link) link.href = `attendanceQR.html?id=${eventSel.value}`;
    }

    function fillParticipants() {
      const db = App.getDB();
      const regs = db.registrations.filter(r => r.eventId === eventSel.value && r.status !== 'Cancelled');
      userSel.innerHTML = regs.map(r => {
        const u = db.users.find(x => x.id === r.userId);
        return `<option value="${r.userId}">${u ? App.escapeHTML(u.name) : '-'} (${u ? App.escapeHTML(u.studentId) : ''})</option>`;
      }).join('');
      updateQrLink();
    }

    eventSel.addEventListener('change', () => { fillParticipants(); renderAttendanceTable(); renderCharts(); });
    fillParticipants();
    renderAttendanceTable();
    renderCharts();

    document.getElementById('geoBtn')?.addEventListener('click', () => captureGeo('locationStamp'));

    const form = document.getElementById('attendanceForm');
    form.addEventListener('submit', e => {
      e.preventDefault();
      const db2 = App.getDB();
      const eventId = eventSel.value;
      const userId = userSel.value;
      const status = document.getElementById('status').value;
      const helper = document.getElementById('helper').checked;
      const location = document.getElementById('locationStamp').value.trim() || 'Venue/geolocation not captured';
      if (!eventId) return App.toast('No event selected.', 'error');
      if (!userId) return App.toast('No participant selected.', 'error');
      const points = App.calculatePoints(status, helper);
      const existing = db2.attendance.find(a => a.eventId === eventId && a.userId === userId);
      const payload = { eventId, userId, status, helper, checkedAt: new Date().toISOString().slice(0,16).replace('T',' '), points, location };
      if (existing) Object.assign(existing, payload);
      else db2.attendance.push({ id: App.nextId('A','attendance'), ...payload });
      const reg = db2.registrations.find(r => r.eventId === eventId && r.userId === userId);
      if (reg) reg.status = status === 'Absent' ? 'Absent' : 'Attended';
      App.saveDB(db2);
      const student = db2.users.find(u => u.id === userId);
      const message = `${student ? student.studentId : 'Student'} attendance saved. Points: ${points}`;
      if (db2.backend) {
        App.apiPost('save_attendance.php', { eventId, userId, status, helper, points, location })
          .then(() => { App.toast(message + ' Database updated.'); setTimeout(()=>location.reload(), 900); })
          .catch(err => App.toast('Saved locally, but database update failed: ' + err.message, 'error'));
      } else {
        App.toast(message);
      }
      renderAttendanceTable();
      renderCharts();
    });
  }

  function recordsInScope() {
    const user = App.currentUser();
    const records = App.attendanceRecordsForRole(user);
    const eventSel = document.getElementById('eventId');
    if (eventSel?.value) return records.filter(a => a.eventId === eventSel.value);
    return records;
  }

  function renderAttendanceTable() {
    const target = document.getElementById('attendanceTable'); if (!target) return;
    const db = App.getDB();
    const allVisible = App.attendanceRecordsForRole(App.currentUser());
    target.innerHTML = allVisible.map(a => {
      const u = db.users.find(x=>x.id===a.userId); const e = db.events.find(x=>x.id===a.eventId);
      return `<tr><td>${e ? App.escapeHTML(e.title) : '-'}</td><td>${u ? App.escapeHTML(u.name) : '-'}</td><td>${u ? App.escapeHTML(u.studentId) : '-'}</td><td><span class="badge ${String(a.status).toLowerCase()}">${a.status}</span></td><td>${a.helper ? 'Yes' : 'No'}</td><td><strong>${a.points}</strong></td><td>${App.escapeHTML(a.checkedAt)}</td><td>${App.escapeHTML(a.location || '-')}</td></tr>`;
    }).join('') || '<tr><td colspan="8">No attendance record.</td></tr>';
  }

  function renderCharts() {
    const events = visibleEvents();
    const labels = events.slice(0, 7).map(e => e.title.split(' ').slice(0,2).join(' '));
    const attendanceCounts = events.slice(0, 7).map(e => App.attendanceForEvent(e.id).filter(a => ['Present','Late'].includes(a.status)).length);
    if (window.FKCharts) FKCharts.drawBar('attendanceTrendChart', labels.length ? labels : ['No event'], attendanceCounts.length ? attendanceCounts : [0]);

    const records = App.attendanceRecordsForRole(App.currentUser());
    const buckets = ['<20','20-49','50-79','80+'];
    const values = [0,0,0,0];
    const studentIds = [...new Set(records.map(a => a.userId))];
    studentIds.forEach(id => {
      const p = App.pointsForUser(id);
      if (p < 20) values[0]++; else if (p < 50) values[1]++; else if (p < 80) values[2]++; else values[3]++;
    });
    if (window.FKCharts) FKCharts.drawPie('attendancePointsChart', buckets, values);
  }

  if (page === 'attendanceQR') initAttendanceQR();
  if (page === 'attendanceRecord') initAttendanceRecord();
});
