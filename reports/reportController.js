document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  if (!page || !window.App) return;
  const db = App.getDB();
  const current = App.currentUser();

  function recognitionBadge(points) {
    const info = App.recognitionInfo(points);
    return `<span class="badge ${info.className}">${App.escapeHTML(info.level)}</span>`;
  }

  function baseEvents() {
    return App.eventsForRole(current);
  }

  function reportFilters() {
    return {
      clubId: document.getElementById('reportClubFilter')?.value || '',
      semester: document.getElementById('reportSemesterFilter')?.value || '',
      eventType: document.getElementById('reportTypeFilter')?.value || ''
    };
  }

  function filteredReportEvents() {
    const filters = reportFilters();
    return baseEvents().filter(e => (!filters.clubId || e.clubId === filters.clubId) && (!filters.semester || e.semester === filters.semester) && (!filters.eventType || e.eventType === filters.eventType));
  }

  function populateReportFilters() {
    const clubSel = document.getElementById('reportClubFilter');
    const semSel = document.getElementById('reportSemesterFilter');
    const typeSel = document.getElementById('reportTypeFilter');
    if (!clubSel || !semSel || !typeSel) return;
    const events = baseEvents();
    const clubIds = [...new Set(events.map(e => e.clubId))];
    clubSel.innerHTML = '<option value="">All Clubs</option>' + db.clubs.filter(c => clubIds.includes(c.id)).map(c => `<option value="${c.id}">${App.escapeHTML(c.name)}</option>`).join('');
    const semesters = [...new Set(events.map(e => e.semester || '2025/2026-2'))].sort();
    semSel.innerHTML = '<option value="">All Semesters</option>' + semesters.map(s => `<option value="${App.escapeHTML(s)}">${App.escapeHTML(s)}</option>`).join('');
    const types = [...new Set(events.map(e => e.eventType || 'General'))].sort();
    typeSel.innerHTML = '<option value="">All Event Types</option>' + types.map(t => `<option value="${App.escapeHTML(t)}">${App.escapeHTML(t)}</option>`).join('');
    [clubSel, semSel, typeSel].forEach(el => el.addEventListener('change', initAnalytics));
    document.getElementById('resetReportFilters')?.addEventListener('click', () => { clubSel.value = ''; semSel.value = ''; typeSel.value = ''; initAnalytics(); });
  }

  function initAnalytics() {
    const filters = reportFilters();
    const events = filteredReportEvents();
    const eventIds = events.map(e => e.id);
    const clubStats = App.clubStats({ semester: filters.semester, eventType: filters.eventType }).filter(c => eventIds.some(id => db.events.find(e => e.id === id)?.clubId === c.id));

    FKCharts.drawBar('eventsByClubChart', clubStats.length ? clubStats.map(c => c.name.replace(' Club','').replace(' Society','')) : ['No club'], clubStats.length ? clubStats.map(c => c.eventsConducted) : [0]);
    FKCharts.drawBar('monthlyTrendChart', events.length ? events.slice(0, 7).map(e => e.title.split(' ').slice(0,2).join(' ')) : ['No event'], events.length ? events.slice(0, 7).map(e => App.attendanceRateForEvent(e.id)) : [0]);

    const pointBuckets = ['Warning', 'Certificate', 'Active', 'Outstanding'];
    const counts = [0,0,0,0];
    db.users.filter(u => u.role === 'student').forEach(u => {
      const p = App.pointsForUser(u.id, filters);
      if (p < 20) counts[0]++; else if (p < 50) counts[1]++; else if (p < 80) counts[2]++; else counts[3]++;
    });
    FKCharts.drawPie('pointsChart', pointBuckets, counts);

    const topStudents = document.getElementById('reportTopStudents');
    if (topStudents) {
      topStudents.innerHTML = App.topStudents(5, filters).map((u,i) => `<tr><td><strong>#${i+1}</strong></td><td>${App.escapeHTML(u.name)}<br><small>${App.escapeHTML(u.studentId)}</small></td><td><strong>${u.points}</strong></td><td>${recognitionBadge(u.points)}</td></tr>`).join('') || '<tr><td colspan="4">No student data.</td></tr>';
    }

    const topClubs = document.getElementById('reportTopClubs');
    if (topClubs) {
      const sorted = [...clubStats].sort((a,b) => (b.eventsConducted + b.totalParticipants + b.points) - (a.eventsConducted + a.totalParticipants + a.points)).slice(0,5);
      topClubs.innerHTML = sorted.map((c,i) => `<tr><td><strong>#${i+1}</strong></td><td>${App.escapeHTML(c.name)}</td><td>${c.eventsConducted}</td><td>${c.totalParticipants}</td><td>${c.attendanceRate}%</td></tr>`).join('') || '<tr><td colspan="5">No club data.</td></tr>';
    }
  }

  function renderParticipation() {
    const target = document.getElementById('participationTable'); if (!target) return;
    const events = baseEvents();
    target.innerHTML = events.map(e => {
      const c = db.clubs.find(x=>x.id===e.clubId); const regs=App.registrationsForEvent(e.id);
      return `<tr><td>${App.escapeHTML(e.title)}</td><td>${c ? App.escapeHTML(c.name) : '-'}</td><td>${App.escapeHTML(e.semester || '-')}</td><td>${App.escapeHTML(e.eventType || 'General')}</td><td>${regs.length}</td><td>${e.capacity}</td><td>${Math.round((regs.length/Math.max(e.capacity,1))*100)}%</td></tr>`;
    }).join('') || '<tr><td colspan="7">No participation data.</td></tr>';
  }

  function renderAttendanceReport() {
    const target = document.getElementById('attendanceReportTable'); if (!target) return;
    const events = baseEvents();
    target.innerHTML = events.map(e => {
      const records = db.attendance.filter(a=>a.eventId===e.id);
      const registered = App.registrationsForEvent(e.id).length;
      const present=records.filter(a=>['Present','Late'].includes(a.status)).length;
      const rate=registered ? Math.round((present/registered)*100) : 0;
      const points=records.reduce((s,a)=>s+Number(a.points||0),0);
      return `<tr><td>${App.escapeHTML(e.title)}</td><td>${registered}</td><td>${present}</td><td>${records.filter(a=>a.status==='Late').length}</td><td>${records.filter(a=>a.status==='Absent').length}</td><td>${rate}%</td><td><strong>${points}</strong></td></tr>`;
    }).join('') || '<tr><td colspan="7">No attendance report.</td></tr>';
  }

  function renderRanking() {
    const target = document.getElementById('rankingTable'); if (!target) return;
    let clubId = '';
    if (current?.role === 'committee') clubId = current.clubId || (db.memberships.find(m => m.userId === current.id && m.type === 'Committee') || {}).clubId;
    const rows = db.users.filter(u => u.role === 'student' && (!clubId || db.memberships.some(m => m.userId === u.id && m.clubId === clubId))).map(u => ({...u, points: App.pointsForUser(u.id, { clubId })})).sort((a,b)=>b.points-a.points).slice(0,5);
    target.innerHTML = rows.map((u,i) => `<tr><td><strong>#${i+1}</strong></td><td>${App.escapeHTML(u.name)}</td><td>${App.escapeHTML(u.studentId)}</td><td><strong>${u.points}</strong></td><td>${recognitionBadge(u.points)}</td></tr>`).join('') || '<tr><td colspan="5">No ranking data.</td></tr>';
  }

  if (page === 'analyticsDashboard') { populateReportFilters(); initAnalytics(); }
  if (page === 'participationReport') renderParticipation();
  if (page === 'attendanceReport') renderAttendanceReport();
  if (page === 'ranking') renderRanking();
});
