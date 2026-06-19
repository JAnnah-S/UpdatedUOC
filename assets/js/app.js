/* FK Club Hub - Static prototype data layer and shared helpers */
(function () {
  const STORAGE_KEY = 'fkClubHubDB';
  const SESSION_KEY = 'fkClubHubSession';
  const DB_VERSION = 4;

  const defaultDB = {
    version: DB_VERSION,
    users: [
      { id: 'U001', studentId: 'STAFF001', name: 'System Administrator', email: 'admin@umpsa.edu.my', password: 'admin123', role: 'admin', phone: '09-424 6000', department: 'Student Affairs Department', clubId: '', position: 'FK Staff', photo: '', createdAt: '2026-02-01', active: true },
      { id: 'U002', studentId: 'CB23001', name: 'Aisyah Rahman', email: 'committee@umpsa.edu.my', password: 'committee123', role: 'committee', phone: '011-1111 2222', department: 'Faculty of Computing', clubId: 'C01', position: 'President', photo: '', createdAt: '2026-02-05', active: true },
      { id: 'U003', studentId: 'CB23002', name: 'Muhammad Uzair', email: 'student@umpsa.edu.my', password: 'student123', role: 'student', phone: '012-333 4444', department: 'Software Engineering', clubId: '', position: '', photo: '', createdAt: '2026-02-10', active: true },
      { id: 'U004', studentId: 'CB23003', name: 'Nur Iman', email: 'iman@umpsa.edu.my', password: 'student123', role: 'student', phone: '013-555 6666', department: 'Computer Systems', clubId: '', position: '', photo: '', createdAt: '2026-03-01', active: true },
      { id: 'U005', studentId: 'CB23004', name: 'Daniel Lee', email: 'daniel@umpsa.edu.my', password: 'student123', role: 'student', phone: '014-777 8888', department: 'Artificial Intelligence', clubId: '', position: '', photo: '', createdAt: '2026-03-08', active: true },
      { id: 'U006', studentId: 'CB23005', name: 'Siti Hajar', email: 'hajar@umpsa.edu.my', password: 'student123', role: 'student', phone: '016-222 7788', department: 'Software Engineering', clubId: '', position: '', photo: '', createdAt: '2026-03-12', active: true },
      { id: 'U007', studentId: 'CB23006', name: 'Adam Hakimi', email: 'adam@umpsa.edu.my', password: 'student123', role: 'student', phone: '017-333 8899', department: 'Network Technology', clubId: '', position: '', photo: '', createdAt: '2026-03-15', active: true },
      { id: 'U008', studentId: 'CB23007', name: 'Lim Jia Xin', email: 'jiaxin@umpsa.edu.my', password: 'student123', role: 'student', phone: '018-444 9900', department: 'Data Analytics', clubId: '', position: '', photo: '', createdAt: '2026-03-18', active: true },
      { id: 'U009', studentId: 'CB23008', name: 'Farid Zikri', email: 'farid@umpsa.edu.my', password: 'student123', role: 'student', phone: '019-555 1212', department: 'Multimedia Computing', clubId: '', position: '', photo: '', createdAt: '2026-03-20', active: true }
    ],
    clubs: [
      { id: 'C01', name: 'Programming Society', description: 'A club for students who enjoy web development, algorithms, hackathons and peer coding sessions.', advisor: 'Dr. Farah Aziz', status: 'Active', createdAt: '2026-01-20' },
      { id: 'C02', name: 'Cyber Security Club', description: 'Focuses on ethical hacking awareness, CTF training, cyber hygiene and security workshops.', advisor: 'Dr. Hafiz Omar', status: 'Active', createdAt: '2026-01-22' },
      { id: 'C03', name: 'AI & Data Club', description: 'Explores machine learning, data analytics, dashboards and responsible AI practices.', advisor: 'Dr. Mei Ling', status: 'Active', createdAt: '2026-01-25' },
      { id: 'C04', name: 'Multimedia Creative Club', description: 'Supports design, video editing, UI/UX and multimedia content for faculty activities.', advisor: 'Mr. Azman Shah', status: 'Active', createdAt: '2026-01-28' }
    ],
    memberships: [
      { id: 'M001', userId: 'U002', clubId: 'C01', position: 'President', type: 'Committee', joinedAt: '2026-02-05', status: 'Approved' },
      { id: 'M002', userId: 'U003', clubId: 'C01', position: 'Member', type: 'Member', joinedAt: '2026-02-12', status: 'Approved' },
      { id: 'M003', userId: 'U004', clubId: 'C02', position: 'Member', type: 'Member', joinedAt: '2026-03-06', status: 'Approved' },
      { id: 'M004', userId: 'U005', clubId: 'C03', position: 'Member', type: 'Member', joinedAt: '2026-03-10', status: 'Approved' },
      { id: 'M005', userId: 'U006', clubId: 'C01', position: 'Member', type: 'Member', joinedAt: '2026-03-13', status: 'Approved' },
      { id: 'M006', userId: 'U007', clubId: 'C02', position: 'Member', type: 'Member', joinedAt: '2026-03-16', status: 'Approved' },
      { id: 'M007', userId: 'U008', clubId: 'C03', position: 'Member', type: 'Member', joinedAt: '2026-03-19', status: 'Approved' },
      { id: 'M008', userId: 'U009', clubId: 'C04', position: 'Member', type: 'Member', joinedAt: '2026-03-21', status: 'Approved' }
    ],
    events: [
      { id: 'E001', clubId: 'C01', title: 'Web Development Bootcamp', description: 'Hands-on HTML, CSS and JavaScript bootcamp for FK students.', date: '2026-06-20', time: '09:00', venue: 'FK Lab 2', capacity: 40, status: 'Open', eventType: 'Workshop', semester: '2025/2026-2', createdBy: 'U002' },
      { id: 'E002', clubId: 'C02', title: 'Cyber Awareness Talk', description: 'Awareness session about phishing, password safety and student account security.', date: '2026-06-25', time: '14:30', venue: 'DKU Hall', capacity: 80, status: 'Open', eventType: 'Talk', semester: '2025/2026-2', createdBy: 'U002' },
      { id: 'E003', clubId: 'C03', title: 'Data Visualization Mini Workshop', description: 'Create meaningful charts and reports for club activity analytics.', date: '2026-07-05', time: '10:00', venue: 'FK Seminar Room', capacity: 35, status: 'Open', eventType: 'Workshop', semester: '2025/2026-2', createdBy: 'U002' },
      { id: 'E004', clubId: 'C01', title: 'Semester Hackathon', description: 'Team coding challenge to build a useful campus application prototype.', date: '2026-05-12', time: '08:30', venue: 'Innovation Lab', capacity: 60, status: 'Completed', eventType: 'Competition', semester: '2025/2026-2', createdBy: 'U002' },
      { id: 'E005', clubId: 'C02', title: 'Capture The Flag Training', description: 'Practical training for beginner cyber security competitions.', date: '2026-04-18', time: '09:30', venue: 'Cyber Lab', capacity: 30, status: 'Completed', eventType: 'Training', semester: '2025/2026-2', createdBy: 'U002' },
      { id: 'E006', clubId: 'C03', title: 'AI Ethics Forum', description: 'Forum on responsible AI, privacy and academic integrity.', date: '2026-03-28', time: '15:00', venue: 'Main Auditorium', capacity: 100, status: 'Completed', eventType: 'Forum', semester: '2025/2026-2', createdBy: 'U002' },
      { id: 'E007', clubId: 'C04', title: 'UI/UX Design Jam', description: 'Creative prototyping session for campus application ideas.', date: '2026-02-22', time: '10:00', venue: 'Design Studio', capacity: 45, status: 'Completed', eventType: 'Workshop', semester: '2025/2026-1', createdBy: 'U002' }
    ],
    registrations: [
      { id: 'R001', eventId: 'E001', userId: 'U003', status: 'Registered', registeredAt: '2026-06-01' },
      { id: 'R002', eventId: 'E001', userId: 'U004', status: 'Registered', registeredAt: '2026-06-02' },
      { id: 'R003', eventId: 'E002', userId: 'U003', status: 'Registered', registeredAt: '2026-06-03' },
      { id: 'R004', eventId: 'E003', userId: 'U005', status: 'Registered', registeredAt: '2026-06-04' },
      { id: 'R005', eventId: 'E004', userId: 'U003', status: 'Attended', registeredAt: '2026-05-01' },
      { id: 'R006', eventId: 'E004', userId: 'U004', status: 'Attended', registeredAt: '2026-05-02' },
      { id: 'R007', eventId: 'E004', userId: 'U006', status: 'Attended', registeredAt: '2026-05-03' },
      { id: 'R008', eventId: 'E005', userId: 'U003', status: 'Attended', registeredAt: '2026-04-05' },
      { id: 'R009', eventId: 'E005', userId: 'U004', status: 'Attended', registeredAt: '2026-04-06' },
      { id: 'R010', eventId: 'E005', userId: 'U007', status: 'Attended', registeredAt: '2026-04-06' },
      { id: 'R011', eventId: 'E006', userId: 'U003', status: 'Attended', registeredAt: '2026-03-15' },
      { id: 'R012', eventId: 'E006', userId: 'U005', status: 'Attended', registeredAt: '2026-03-15' },
      { id: 'R013', eventId: 'E006', userId: 'U008', status: 'Attended', registeredAt: '2026-03-16' },
      { id: 'R014', eventId: 'E007', userId: 'U009', status: 'Attended', registeredAt: '2026-02-10' },
      { id: 'R015', eventId: 'E007', userId: 'U003', status: 'Attended', registeredAt: '2026-02-10' },
      { id: 'R016', eventId: 'E003', userId: 'U008', status: 'Registered', registeredAt: '2026-06-04' },
      { id: 'R017', eventId: 'E001', userId: 'U006', status: 'Registered', registeredAt: '2026-06-05' }
    ],
    attendance: [
      { id: 'A001', eventId: 'E004', userId: 'U003', status: 'Present', helper: true, checkedAt: '2026-05-12 08:25', points: 15, location: 'FK Innovation Lab, UMPSA Pekan' },
      { id: 'A002', eventId: 'E004', userId: 'U004', status: 'Late', helper: false, checkedAt: '2026-05-12 09:05', points: 5, location: 'FK Innovation Lab, UMPSA Pekan' },
      { id: 'A003', eventId: 'E002', userId: 'U003', status: 'Present', helper: false, checkedAt: '2026-06-25 14:20', points: 10, location: 'DKU Hall, UMPSA Pekan' },
      { id: 'A004', eventId: 'E004', userId: 'U006', status: 'Present', helper: true, checkedAt: '2026-05-12 08:22', points: 15, location: 'FK Innovation Lab, UMPSA Pekan' },
      { id: 'A005', eventId: 'E005', userId: 'U003', status: 'Present', helper: true, checkedAt: '2026-04-18 09:20', points: 15, location: 'Cyber Lab, UMPSA Pekan' },
      { id: 'A006', eventId: 'E005', userId: 'U004', status: 'Present', helper: false, checkedAt: '2026-04-18 09:28', points: 10, location: 'Cyber Lab, UMPSA Pekan' },
      { id: 'A007', eventId: 'E005', userId: 'U007', status: 'Present', helper: true, checkedAt: '2026-04-18 09:18', points: 15, location: 'Cyber Lab, UMPSA Pekan' },
      { id: 'A008', eventId: 'E006', userId: 'U003', status: 'Present', helper: true, checkedAt: '2026-03-28 14:50', points: 15, location: 'Main Auditorium, UMPSA Pekan' },
      { id: 'A009', eventId: 'E006', userId: 'U005', status: 'Present', helper: false, checkedAt: '2026-03-28 14:58', points: 10, location: 'Main Auditorium, UMPSA Pekan' },
      { id: 'A010', eventId: 'E006', userId: 'U008', status: 'Late', helper: false, checkedAt: '2026-03-28 15:15', points: 5, location: 'Main Auditorium, UMPSA Pekan' },
      { id: 'A011', eventId: 'E007', userId: 'U009', status: 'Present', helper: true, checkedAt: '2026-02-22 09:53', points: 15, location: 'Design Studio, UMPSA Pekan' },
      { id: 'A012', eventId: 'E007', userId: 'U003', status: 'Present', helper: true, checkedAt: '2026-02-22 09:48', points: 15, location: 'Design Studio, UMPSA Pekan' },
      { id: 'A013', eventId: 'E001', userId: 'U003', status: 'Present', helper: true, checkedAt: '2026-06-20 08:48', points: 15, location: 'FK Lab 2, UMPSA Pekan' },
      { id: 'A014', eventId: 'E001', userId: 'U006', status: 'Present', helper: false, checkedAt: '2026-06-20 08:55', points: 10, location: 'FK Lab 2, UMPSA Pekan' },
      { id: 'A015', eventId: 'E003', userId: 'U005', status: 'Present', helper: true, checkedAt: '2026-07-05 09:50', points: 15, location: 'FK Seminar Room, UMPSA Pekan' },
      { id: 'A016', eventId: 'E003', userId: 'U008', status: 'Present', helper: false, checkedAt: '2026-07-05 09:58', points: 10, location: 'FK Seminar Room, UMPSA Pekan' },
      { id: 'A017', eventId: 'E002', userId: 'U007', status: 'Present', helper: true, checkedAt: '2026-06-25 14:12', points: 15, location: 'DKU Hall, UMPSA Pekan' },
      { id: 'A018', eventId: 'E002', userId: 'U004', status: 'Absent', helper: false, checkedAt: '2026-06-25 15:00', points: -10, location: 'DKU Hall, UMPSA Pekan' }
    ]
  };

  function clone(obj) { return JSON.parse(JSON.stringify(obj)); }

  function seed() {
    if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clone(defaultDB)));
    }
  }

  function migrateDB(db) {
    let changed = false;
    db.version = db.version || 1;
    ['users','clubs','memberships','events','registrations','attendance'].forEach(key => { if (!Array.isArray(db[key])) { db[key] = []; changed = true; } });

    if (!db.backend) {
      defaultDB.users.forEach(def => { if (!db.users.some(u => u.id === def.id || u.studentId === def.studentId)) { db.users.push(clone(def)); changed = true; } });
      defaultDB.clubs.forEach(def => { if (!db.clubs.some(c => c.id === def.id)) { db.clubs.push(clone(def)); changed = true; } });
      defaultDB.memberships.forEach(def => { if (!db.memberships.some(m => m.id === def.id)) { db.memberships.push(clone(def)); changed = true; } });
      defaultDB.events.forEach(def => {
        const existing = db.events.find(e => e.id === def.id);
        if (!existing) { db.events.push(clone(def)); changed = true; }
        else {
          if (!existing.eventType) { existing.eventType = def.eventType || 'General'; changed = true; }
          if (!existing.semester) { existing.semester = def.semester || '2025/2026-2'; changed = true; }
        }
      });
      defaultDB.registrations.forEach(def => { if (!db.registrations.some(r => r.id === def.id)) { db.registrations.push(clone(def)); changed = true; } });
      defaultDB.attendance.forEach(def => {
        if (!db.attendance.some(a => a.id === def.id || (a.eventId === def.eventId && a.userId === def.userId && a.checkedAt === def.checkedAt))) {
          db.attendance.push(clone(def)); changed = true;
        }
      });
      db.attendance.forEach(a => { if (!a.location) { a.location = 'Recorded at event venue'; changed = true; } });
    }
    if (db.version !== DB_VERSION) { db.version = DB_VERSION; changed = true; }
    return { db, changed };
  }

  function getDB() {
    if (!window.__FK_SERVER_DB_CONSUMED && window.FK_DB_FROM_SERVER && window.FK_DB_FROM_SERVER.backend) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clone(window.FK_DB_FROM_SERVER)));
      window.__FK_SERVER_DB_CONSUMED = true;
    }
    seed();
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const result = migrateDB(parsed);
    if (result.changed) localStorage.setItem(STORAGE_KEY, JSON.stringify(result.db));
    return result.db;
  }

  function saveDB(db) { localStorage.setItem(STORAGE_KEY, JSON.stringify(db)); }
  function backendEnabled() { return !!getDB().backend; }
  function apiPost(endpoint, payload = {}) {
    return fetch(pathToRoot() + 'api/' + endpoint, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(async res => {
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) throw new Error(data.message || 'Database request failed');
      return data;
    });
  }
  function refreshFromServer() {
    return fetch(pathToRoot() + 'api/data.php', { credentials: 'same-origin' })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.db) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data.db));
          window.FK_DB_FROM_SERVER = data.db;
          window.__FK_SERVER_DB_CONSUMED = true;
          return data.db;
        }
        throw new Error(data.message || 'Unable to refresh database data');
      });
  }
  function resetDB() { localStorage.setItem(STORAGE_KEY, JSON.stringify(clone(defaultDB))); }

  function nextId(prefix, collection) {
    const db = getDB();
    const max = db[collection].reduce((acc, item) => {
      const n = parseInt(String(item.id).replace(prefix, ''), 10);
      return Number.isNaN(n) ? acc : Math.max(acc, n);
    }, 0);
    return prefix + String(max + 1).padStart(3, '0');
  }

  function getSession() {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  function setSession(user) { sessionStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id, role: user.role, name: user.name, email: user.email })); }
  function logout() { sessionStorage.removeItem(SESSION_KEY); if (backendEnabled()) { fetch(pathToRoot() + 'api/logout.php', { credentials: 'same-origin' }).finally(() => window.location.href = pathToRoot() + 'login.html'); } else { window.location.href = pathToRoot() + 'login.html'; } }
  function currentUser() { const session = getSession(); return session ? (getDB().users.find(u => u.id === session.userId) || null) : null; }

  function pathToRoot() {
    const isRootFile = !window.location.pathname.includes('/dashboard/') && !window.location.pathname.includes('/clubs/') && !window.location.pathname.includes('/events/') && !window.location.pathname.includes('/users/') && !window.location.pathname.includes('/reports/');
    return isRootFile ? '' : '../';
  }

  function homeForRole(role) {
    if (role === 'admin') return pathToRoot() + 'dashboard/adminDashboard.html';
    if (role === 'committee') return pathToRoot() + 'dashboard/committeeDashboard.html';
    return pathToRoot() + 'dashboard/studentDashboard.html';
  }

  function requireAuth() {
    const session = getSession();
    const body = document.body;
    if (!body.classList.contains('app-shell')) return;
    if (!session) { window.location.href = pathToRoot() + 'login.html'; return; }
    const allowed = (body.dataset.role || '').split(',').map(x => x.trim()).filter(Boolean);
    if (allowed.length && !allowed.includes(session.role)) { window.location.href = homeForRole(session.role); return; }
    document.querySelectorAll('[data-current-name]').forEach(el => el.textContent = session.name);
    document.querySelectorAll('[data-current-role]').forEach(el => el.textContent = titleCase(session.role));
    document.querySelectorAll('[data-admin-only]').forEach(el => { if (session.role !== 'admin') el.remove(); });
    document.querySelectorAll('[data-committee-only]').forEach(el => { if (session.role !== 'committee') el.remove(); });
  }

  function titleCase(str) { return String(str || '').charAt(0).toUpperCase() + String(str || '').slice(1); }
  function formatDate(dateStr) { if (!dateStr) return '-'; const d = new Date(dateStr); return Number.isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' }); }
  function getClub(id) { return getDB().clubs.find(c => c.id === id); }
  function getUser(id) { return getDB().users.find(u => u.id === id); }
  function getEvent(id) { return getDB().events.find(e => e.id === id); }

  function isConfirmedRegistration(status) {
    return ['Confirmed', 'Registered', 'Attended', 'Present'].includes(String(status || ''));
  }

  function registrationsForEvent(eventId) {
    return getDB().registrations.filter(r => r.eventId === eventId && isConfirmedRegistration(r.status));
  }

  function waitingForEvent(eventId) {
    return getDB().registrations.filter(r => r.eventId === eventId && r.status === 'Waiting');
  }

  function attendanceForEvent(eventId) { return getDB().attendance.filter(a => a.eventId === eventId); }
  function pointsForUser(userId, filters = {}) {
    const db = getDB();
    return db.attendance.filter(a => {
      if (a.userId !== userId) return false;
      const e = db.events.find(ev => ev.id === a.eventId);
      if (!e) return false;
      if (filters.clubId && e.clubId !== filters.clubId) return false;
      if (filters.semester && e.semester !== filters.semester) return false;
      if (filters.eventType && e.eventType !== filters.eventType) return false;
      return true;
    }).reduce((sum, a) => sum + Number(a.points || 0), 0);
  }

  function recognitionInfo(points) {
    const p = Number(points || 0);
    if (p < 20) return { level: 'Warning', label: 'Warning / Please participate more', className: 'warning', description: 'Below 20 points: student should join more events.' };
    if (p < 50) return { level: 'Certificate', label: 'Eligible for Participation Certificate', className: 'certificate', description: '20-49 points: eligible for participation certificate.' };
    if (p < 80) return { level: 'Active', label: 'Eligible for Active Student Award / Bonus Points', className: 'active', description: '50-79 points: eligible for active student award or bonus points.' };
    return { level: 'Outstanding', label: 'Outstanding Participation; eligible for leadership / priority in event registration', className: 'outstanding', description: '80+ points: outstanding participation and eligible for leadership/priority registration.' };
  }
  function recognition(points) { return recognitionInfo(points).label; }

  function calculatePoints(status, helper) {
    let points = 0;
    if (status === 'Present') points += 10;
    if (status === 'Late') points += 5;
    if (status === 'Absent') points -= 10;
    if (helper) points += 5;
    return points;
  }

  function studentRank(userId, filters = {}) {
    const rows = getDB().users.filter(u => u.role === 'student' && u.active).map(u => ({ id: u.id, points: pointsForUser(u.id, filters) })).sort((a,b) => b.points - a.points);
    const idx = rows.findIndex(r => r.id === userId);
    return idx >= 0 ? idx + 1 : '-';
  }

  function topStudents(limit = 5, filters = {}) {
    const db = getDB();
    return db.users.filter(u => u.role === 'student' && u.active).map(u => ({
      ...u,
      points: pointsForUser(u.id, filters),
      attended: db.attendance.filter(a => a.userId === u.id && ['Present','Late'].includes(a.status)).length
    })).sort((a,b) => b.points - a.points).slice(0, limit);
  }

  function eventsForRole(user = currentUser()) {
    const db = getDB();
    if (!user) return [];
    if (user.role === 'admin') return db.events;
    if (user.role === 'committee') {
      const clubId = user.clubId || (db.memberships.find(m => m.userId === user.id && m.type === 'Committee') || {}).clubId;
      return db.events.filter(e => e.clubId === clubId);
    }
    return db.registrations.filter(r => r.userId === user.id && r.status !== 'Cancelled').map(r => db.events.find(e => e.id === r.eventId)).filter(Boolean);
  }

  function attendanceRecordsForRole(user = currentUser()) {
    const db = getDB();
    if (!user) return [];
    if (user.role === 'admin') return db.attendance;
    if (user.role === 'committee') {
      const eventIds = eventsForRole(user).map(e => e.id);
      return db.attendance.filter(a => eventIds.includes(a.eventId));
    }
    return db.attendance.filter(a => a.userId === user.id);
  }

  function attendanceRateForEvent(eventId) {
    const registered = registrationsForEvent(eventId).length;
    const present = attendanceForEvent(eventId).filter(a => ['Present','Late'].includes(a.status)).length;
    if (!registered) return 0;
    return Math.round((present / registered) * 100);
  }

  function clubStats(filters = {}) {
    const db = getDB();
    return db.clubs.map(c => {
      const events = db.events.filter(e => e.clubId === c.id && (!filters.semester || e.semester === filters.semester) && (!filters.eventType || e.eventType === filters.eventType));
      const eventIds = events.map(e => e.id);
      const registered = db.registrations.filter(r => eventIds.includes(r.eventId) && r.status !== 'Cancelled').length;
      const present = db.attendance.filter(a => eventIds.includes(a.eventId) && ['Present','Late'].includes(a.status)).length;
      const points = db.attendance.filter(a => eventIds.includes(a.eventId)).reduce((s,a)=>s+Number(a.points||0),0);
      return { ...c, eventsConducted: events.length, totalParticipants: registered, attendanceCount: present, attendanceRate: registered ? Math.round((present/registered)*100) : 0, points };
    });
  }

  function filteredEvents(filters = {}) {
    const db = getDB();
    return db.events.filter(e => (!filters.clubId || e.clubId === filters.clubId) && (!filters.semester || e.semester === filters.semester) && (!filters.eventType || e.eventType === filters.eventType));
  }

  function toast(message, type = 'success') {
    const existing = document.querySelector('.toast'); if (existing) existing.remove();
    const el = document.createElement('div'); el.className = `toast ${type}`; el.textContent = message;
    document.body.appendChild(el); setTimeout(() => el.remove(), 2600);
  }
  function getQueryParam(name) { return new URLSearchParams(window.location.search).get(name); }
  function renderEmpty(target, text = 'No data available') { const el = typeof target === 'string' ? document.querySelector(target) : target; if (el) el.innerHTML = `<div class="empty-state">${text}</div>`; }
  function escapeHTML(value) { return String(value ?? '').replace(/[&<>'"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[ch])); }
  function activeClubs() { return getDB().clubs.filter(c => c.status === 'Active'); }
  function attendanceRate() { const records = getDB().attendance; if (!records.length) return 0; const present = records.filter(a => ['Present','Late'].includes(a.status)).length; return Math.round((present / records.length) * 100); }
  function resetDemo() { resetDB(); toast('Demo data has been reset.'); setTimeout(() => location.reload(), 600); }

  window.App = {
    getDB, saveDB, resetDB, nextId, getSession, setSession, logout, currentUser,
    pathToRoot, homeForRole, requireAuth, titleCase, formatDate, getClub, getUser, getEvent,
    registrationsForEvent, waitingForEvent, isConfirmedRegistration, attendanceForEvent, pointsForUser, recognitionInfo, recognition, calculatePoints,
    studentRank, topStudents, eventsForRole, attendanceRecordsForRole, attendanceRateForEvent, clubStats, filteredEvents,
    toast, getQueryParam, renderEmpty, escapeHTML, activeClubs, attendanceRate, resetDemo, backendEnabled, apiPost, refreshFromServer
  };

  document.addEventListener('DOMContentLoaded', requireAuth);
})();
