document.addEventListener('DOMContentLoaded', () => {
  if (!window.App) return;
  const page = document.body.dataset.page;
  if (!page) return;

  const set = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
  const db = App.getDB();
  const user = App.currentUser();

  function recognitionBadge(points) {
    const info = App.recognitionInfo(points);
    return `<span class="badge ${info.className}">${App.escapeHTML(info.level)}</span>`;
  }

  function adminFilters() {
    return {
      clubId: document.getElementById('adminClubFilter')?.value || '',
      semester: document.getElementById('adminSemesterFilter')?.value || '',
      eventType: document.getElementById('adminTypeFilter')?.value || ''
    };
  }

  function populateAdminFilters() {
    const clubSel = document.getElementById('adminClubFilter');
    const semSel = document.getElementById('adminSemesterFilter');
    const typeSel = document.getElementById('adminTypeFilter');
    if (!clubSel || !semSel || !typeSel) return;
    clubSel.innerHTML = '<option value="">All Clubs</option>' + db.clubs.map(c => `<option value="${c.id}">${App.escapeHTML(c.name)}</option>`).join('');
    const semesters = [...new Set(db.events.map(e => e.semester || '2025/2026-2'))].sort();
    semSel.innerHTML = '<option value="">All Semesters</option>' + semesters.map(s => `<option value="${App.escapeHTML(s)}">${App.escapeHTML(s)}</option>`).join('');
    const types = [...new Set(db.events.map(e => e.eventType || 'General'))].sort();
    typeSel.innerHTML = '<option value="">All Event Types</option>' + types.map(t => `<option value="${App.escapeHTML(t)}">${App.escapeHTML(t)}</option>`).join('');
    [clubSel, semSel, typeSel].forEach(el => el.addEventListener('change', renderAdminDashboard));
    document.getElementById('resetAdminFilters')?.addEventListener('click', () => { clubSel.value = ''; semSel.value = ''; typeSel.value = ''; renderAdminDashboard(); });
  }

  function renderAdminDashboard() {
    const filters = adminFilters();
    const events = App.filteredEvents(filters);
    const eventIds = events.map(e => e.id);
    const students = db.users.filter(u => u.role === 'student' && u.active);
    const registrations = db.registrations.filter(r => eventIds.includes(r.eventId) && r.status !== 'Cancelled');
    const attendance = db.attendance.filter(a => eventIds.includes(a.eventId));
    const present = attendance.filter(a => ['Present','Late'].includes(a.status)).length;

    set('totalStudents', students.length);
    set('totalEvents', events.length);
    set('totalParticipation', registrations.length);
    set('attendanceRate', registrations.length ? Math.round((present / registrations.length) * 100) + '%' : '0%');

    const cStats = App.clubStats({ semester: filters.semester, eventType: filters.eventType }).filter(c => !filters.clubId || c.id === filters.clubId);
    FKCharts.drawBar('clubParticipationChart', cStats.map(c => c.name.replace(' Club','').replace(' Society','')), cStats.map(c => c.eventsConducted));
    FKCharts.drawBar('clubAttendanceChart', cStats.map(c => c.name.replace(' Club','').replace(' Society','')), cStats.map(c => c.totalParticipants));

    const eventLabels = events.slice(0, 8).map(e => e.title.split(' ').slice(0,2).join(' '));
    const eventRates = events.slice(0, 8).map(e => App.attendanceRateForEvent(e.id));
    FKCharts.drawBar('eventAttendanceChart', eventLabels.length ? eventLabels : ['No event'], eventRates.length ? eventRates : [0]);

    const recLevels = ['Warning', 'Certificate', 'Active', 'Outstanding'];
    const levelValues = [0,0,0,0];
    students.forEach(s => {
      const p = App.pointsForUser(s.id, filters);
      if (p < 20) levelValues[0]++; else if (p < 50) levelValues[1]++; else if (p < 80) levelValues[2]++; else levelValues[3]++;
    });
    FKCharts.drawPie('recognitionChart', recLevels, levelValues);

    const topStudents = App.topStudents(5, filters);
    const studentTarget = document.getElementById('adminTopStudents');
    if (studentTarget) studentTarget.innerHTML = topStudents.map((s,i) => `<tr><td><strong>#${i+1}</strong></td><td>${App.escapeHTML(s.name)}<br><small>${App.escapeHTML(s.studentId)}</small></td><td><strong>${s.points}</strong></td><td>${recognitionBadge(s.points)}</td></tr>`).join('') || '<tr><td colspan="4">No student data.</td></tr>';

    const clubTarget = document.getElementById('adminTopClubs');
    if (clubTarget) {
      const topClubs = [...cStats].sort((a,b) => (b.eventsConducted + b.totalParticipants + b.points) - (a.eventsConducted + a.totalParticipants + a.points)).slice(0,5);
      clubTarget.innerHTML = topClubs.map((c,i) => `<tr><td><strong>#${i+1}</strong></td><td>${App.escapeHTML(c.name)}</td><td>${c.eventsConducted}</td><td>${c.totalParticipants}</td><td>${c.attendanceRate}%</td></tr>`).join('') || '<tr><td colspan="5">No club data.</td></tr>';
    }

    const pointsTable = document.getElementById('adminPointsTable');
    if (pointsTable) {
      const rows = attendance.map(a => {
        const ev = db.events.find(e => e.id === a.eventId);
        const u = db.users.find(x => x.id === a.userId);
        const club = ev ? db.clubs.find(c => c.id === ev.clubId) : null;
        const overall = u ? App.pointsForUser(u.id, { semester: filters.semester || (ev?.semester || '') }) : 0;
        return { a, ev, u, club, overall };
      }).sort((x,y) => (y.overall - x.overall) || (Number(y.a.points) - Number(x.a.points))).slice(0, 12);
      pointsTable.innerHTML = rows.map(r => `<tr><td>${r.u ? App.escapeHTML(r.u.name) : '-'}<br><small>${r.u ? App.escapeHTML(r.u.studentId) : ''}</small></td><td>${r.ev ? App.escapeHTML(r.ev.title) : '-'}</td><td>${r.club ? App.escapeHTML(r.club.name) : '-'}</td><td>${r.ev ? App.escapeHTML(r.ev.semester || '-') : '-'}</td><td><strong>${r.a.points}</strong></td><td><strong>${r.overall}</strong></td><td>${recognitionBadge(r.overall)}</td></tr>`).join('') || '<tr><td colspan="7">No points data.</td></tr>';
    }

    const recentTarget = document.getElementById('recentRegistrations');
    if (recentTarget) {
      const latest = [...db.users].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0,5);
      recentTarget.innerHTML = latest.map(u => `<tr><td>${App.escapeHTML(u.name)}</td><td>${App.escapeHTML(u.studentId)}</td><td><span class="badge ${u.role}">${App.titleCase(u.role)}</span></td><td>${App.formatDate(u.createdAt)}</td></tr>`).join('');
    }
  }

  function renderStudentDashboard() {
    if (!user) return;
    const myRegs = db.registrations.filter(r => r.userId === user.id && r.status !== 'Cancelled');
    const myAttendance = db.attendance.filter(a => a.userId === user.id);
    const points = App.pointsForUser(user.id);
    const info = App.recognitionInfo(points);
    set('myPoints', points);
    set('myRecognition', info.level);
    set('myRank', '#' + App.studentRank(user.id));
    set('myEvents', myAttendance.filter(a => ['Present','Late'].includes(a.status)).length);

    const detail = document.getElementById('recognitionDetail');
    if (detail) detail.innerHTML = `<span class="badge ${info.className}">${App.escapeHTML(info.label)}</span><p>${App.escapeHTML(info.description)}</p>`;

    const pointRows = myAttendance.map(a => ({ event: db.events.find(e => e.id === a.eventId), points: Number(a.points || 0) })).filter(x => x.event);
    FKCharts.drawBar('myPointsChart', pointRows.length ? pointRows.map(x => x.event.title.split(' ').slice(0,2).join(' ')) : ['No points'], pointRows.length ? pointRows.map(x => x.points) : [0]);

    const topFive = document.getElementById('studentTopFive');
    if (topFive) {
      topFive.innerHTML = App.topStudents(5).map((s,i) => `<tr class="${s.id === user.id ? 'highlight-row' : ''}"><td><strong>#${i+1}</strong></td><td>${s.id === user.id ? 'You' : App.escapeHTML(s.name)}</td><td><strong>${s.points}</strong></td><td>${recognitionBadge(s.points)}</td></tr>`).join('') || '<tr><td colspan="4">No ranking data.</td></tr>';
    }

    const history = document.getElementById('myHistory');
    if (history) {
      const historyRegs = db.registrations.filter(r => r.userId === user.id || r.studentId === user.studentId);

      function normalizeStatus(status) {
        if (status === 'Registered') return 'Confirmed';
        return status || 'Confirmed';
      }

      function waitingPosition(registration) {
        const waitingRows = db.registrations
          .filter(r => r.eventId === registration.eventId && normalizeStatus(r.status) === 'Waiting')
          .sort((a, b) => new Date(a.registeredAt || a.registrationDate || 0) - new Date(b.registeredAt || b.registrationDate || 0));

        const index = waitingRows.findIndex(r => r.id === registration.id);
        return index >= 0 ? index + 1 : '-';
      }

      const rows = historyRegs.map(r => {
        const ev = db.events.find(e => e.id === r.eventId);
        const club = ev ? db.clubs.find(c => c.id === ev.clubId) : null;
        const att = db.attendance.find(a => a.eventId === r.eventId && a.userId === user.id);

        const status = att ? att.status : normalizeStatus(r.status);

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
            <td>${ev ? App.escapeHTML(ev.title) : '-'}</td>
            <td>${club ? App.escapeHTML(club.name) : '-'}</td>
            <td>${ev ? App.formatDate(ev.date) : '-'}</td>
            <td><span class="badge ${status.toLowerCase()}">${App.escapeHTML(statusText)}</span></td>
            <td><strong>${att ? att.points : 0}</strong></td>
            <td>${att ? App.escapeHTML(att.checkedAt) : '-'}</td>
            <td>${action}</td>
          </tr>
        `;
      }).join('');

      history.innerHTML = rows || '<tr><td colspan="7">No participation history.</td></tr>';

      history.querySelectorAll('[data-cancel]').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (!confirm('Are you sure you want to cancel this event registration?')) return;

          try {
            await App.apiPost('student_registration_action.php', {
              registrationId: btn.dataset.cancel,
              action: 'cancel'
            });

            await App.refreshFromServer();
            App.toast('Registration cancelled successfully.');
            setTimeout(() => location.reload(), 600);
          } catch (err) {
            App.toast(err.message || 'Unable to cancel registration.', 'error');
          }
        });
      });

      history.querySelectorAll('[data-leave]').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (!confirm('Are you sure you want to leave the waiting list?')) return;

          try {
            await App.apiPost('student_registration_action.php', {
              registrationId: btn.dataset.leave,
              action: 'leave_queue'
            });

            await App.refreshFromServer();
            App.toast('You have left the waiting list.');
            setTimeout(() => location.reload(), 600);
          } catch (err) {
            App.toast(err.message || 'Unable to leave waiting list.', 'error');
          }
        });
      });
    }
  }

  function renderCommitteeDashboard() {
    if (!user) return;
    const clubId = user.clubId || (db.memberships.find(m => m.userId === user.id && m.type === 'Committee') || {}).clubId;
    const clubEvents = db.events.filter(e => user.role === 'admin' || !clubId || e.clubId === clubId);
    const eventIds = clubEvents.map(e => e.id);
    const club = App.getClub(clubId) || { name: 'All Clubs' };
    const regs = db.registrations.filter(r => eventIds.includes(r.eventId) && r.status !== 'Cancelled');
    const attendance = db.attendance.filter(a => eventIds.includes(a.eventId));
    const present = attendance.filter(a => ['Present','Late'].includes(a.status)).length;

    set('committeeClubName', club.name + ' attendance and engagement trends');
    set('committeeEvents', clubEvents.length);
    set('committeeRegistrations', regs.length);
    set('committeeAttendance', present);
    set('committeeRate', regs.length ? Math.round((present / regs.length) * 100) + '%' : '0%');

    FKCharts.drawBar('committeeEventsChart', clubEvents.length ? clubEvents.map(e => e.title.split(' ').slice(0,2).join(' ')) : ['No event'], clubEvents.length ? clubEvents.map(e => App.registrationsForEvent(e.id).length) : [0]);

    const levels = [0,0,0,0];
    const memberIds = [...new Set(db.memberships.filter(m => !clubId || m.clubId === clubId).map(m => m.userId))];
    db.users.filter(u => u.role === 'student' && memberIds.includes(u.id)).forEach(s => {
      const p = App.pointsForUser(s.id, { clubId });
      if (p < 20) levels[0]++; else if (p < 50) levels[1]++; else if (p < 80) levels[2]++; else levels[3]++;
    });
    FKCharts.drawPie('committeeRecognitionChart', ['Warning','Certificate','Active','Outstanding'], levels);

    const target = document.getElementById('committeeEventTable');
    if (target) {
      target.innerHTML = clubEvents.map(e => `<tr><td>${App.escapeHTML(e.title)}</td><td>${App.formatDate(e.date)}</td><td>${App.escapeHTML(e.eventType || 'General')}</td><td>${App.registrationsForEvent(e.id).length}/${e.capacity}</td><td>${App.attendanceRateForEvent(e.id)}%</td><td><a class="btn btn-secondary btn-small" href="../events/attendanceQR.html?id=${e.id}">QR</a></td></tr>`).join('') || '<tr><td colspan="6">No events found.</td></tr>';
    }

    const topTarget = document.getElementById('committeeTopStudents');
    if (topTarget) {
      const top = db.users.filter(u => u.role === 'student' && memberIds.includes(u.id)).map(u => ({...u, points: App.pointsForUser(u.id, { clubId })})).sort((a,b) => b.points - a.points).slice(0,5);
      topTarget.innerHTML = top.map((s,i) => `<tr><td><strong>#${i+1}</strong></td><td>${App.escapeHTML(s.name)}<br><small>${App.escapeHTML(s.studentId)}</small></td><td><strong>${s.points}</strong></td><td>${recognitionBadge(s.points)}</td></tr>`).join('') || '<tr><td colspan="4">No student engagement yet.</td></tr>';
    }
  }

  if (page === 'adminDashboard') { populateAdminFilters(); renderAdminDashboard(); }
  if (page === 'studentDashboard') renderStudentDashboard();
  if (page === 'committeeDashboard') renderCommitteeDashboard();
});
