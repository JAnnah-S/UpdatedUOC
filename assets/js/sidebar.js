(function () {
  function icon(name) {
    const icons = {
      dashboard: '⌂', clubs: '♣', events: '▦', profile: '◉', users: '♙', reports: '▥', settings: '⚙', logout: '↪', attendance: '✓'
    };
    return icons[name] || '•';
  }

  const menu = [
    { label: 'Dashboard', icon: 'dashboard', href: 'dashboard/adminDashboard.html', roles: ['admin'], key: 'dashboard' },
    { label: 'Dashboard', icon: 'dashboard', href: 'dashboard/committeeDashboard.html', roles: ['committee'], key: 'dashboard' },
    { label: 'Dashboard', icon: 'dashboard', href: 'dashboard/studentDashboard.html', roles: ['student'], key: 'dashboard' },
    { label: 'Discover Clubs', icon: 'clubs', href: 'clubs/clubList.html', roles: ['admin','committee','student'], key: 'clubs' },
    { label: 'Events', icon: 'events', href: 'events/eventList.html', roles: ['admin','committee','student'], key: 'events' },
    { label: 'My Registrations', icon: 'events', href: 'events/myRegistrations.html', roles: ['student'], key: 'my-registrations' },
    { label: 'My Profile', icon: 'profile', href: 'users/profile.html', roles: ['admin','committee','student'], key: 'profile' },
    { label: 'User Management', icon: 'users', href: 'users/manageUsers.html', roles: ['admin'], key: 'users' },
    { label: 'Register User', icon: 'users', href: 'users/registerUser.html', roles: ['admin'], key: 'register-user' },
    { label: 'Club Management', icon: 'clubs', href: 'clubs/manageClub.html', roles: ['admin'], key: 'manage-clubs' },
    { label: 'Attendance / QR', icon: 'attendance', href: 'events/attendanceRecord.html', roles: ['committee'], key: 'attendance' },
    { label: 'Participant List', icon: 'users', href: 'events/participantList.html', roles: ['committee'], key: 'participants' },
    { label: 'Reports', icon: 'reports', href: 'reports/analyticsDashboard.html', roles: ['admin','committee'], key: 'reports' }
  ];

  function renderSidebar() {
    const target = document.getElementById('sidebar');
    if (!target || !window.App) return;
    const session = App.getSession();
    if (!session) return;
    const root = App.pathToRoot();
    const current = document.body.dataset.nav || '';
    const items = menu.filter(i => i.roles.includes(session.role));

    target.innerHTML = `
      <div class="sidebar-brand">
        <div>
          <h2>UMPSA ON CLUB</h2>
        </div>
      </div>
      <div class="sidebar-section">Main</div>
      <nav class="sidebar-nav">
        ${items.map(item => `<a class="${current === item.key ? 'active' : ''}" href="${root + item.href}"><span>${icon(item.icon)}</span>${item.label}</a>`).join('')}
      </nav>
      <div class="sidebar-bottom">
        <div class="sidebar-section">Account</div>
        <a href="${root}users/profile.html"><span>${icon('settings')}</span>Settings</a>
        <button type="button" id="logoutBtn"><span>${icon('logout')}</span>Logout</button>
      </div>
    `;

    const logout = document.getElementById('logoutBtn');
    if (logout) logout.addEventListener('click', App.logout);
    const close = target.querySelector('.side-close');
    if (close) close.addEventListener('click', () => document.body.classList.remove('sidebar-open'));
  }

  function renderTopbar() {
    const topbar = document.getElementById('topbar');
    if (!topbar || !window.App) return;
    const user = App.currentUser();
    topbar.innerHTML = `
      <button class="hamburger" type="button" aria-label="open sidebar">☰</button>
      <div class="search-box"><span>⌕</span><input type="search" placeholder="Search clubs, events, users..." id="globalSearch"></div>
      <div class="top-user">
        <div class="avatar">${user ? user.name.charAt(0).toUpperCase() : 'U'}</div>
        <div><strong data-current-name>${user ? user.name : ''}</strong><small data-current-role>${user ? App.titleCase(user.role) : ''}</small></div>
      </div>
    `;
    topbar.querySelector('.hamburger').addEventListener('click', () => document.body.classList.toggle('sidebar-open'));
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderSidebar();
    renderTopbar();
  });
})();
