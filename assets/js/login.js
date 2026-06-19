document.addEventListener('DOMContentLoaded', () => {
  if (!window.App) return;
  App.getDB();

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      const loginId = document.getElementById('loginId').value.trim().toUpperCase();
      const password = document.getElementById('password').value;

      // Try PHP backend first, fall back to localStorage
      fetch('api/login.php', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginId, password })
      })
      .then(res => {
        if (!res.ok) throw new Error('Backend error');
        return res.json();
      })
      .then(data => {
        if (data.success) {
          App.setSession(data.user);
          // Load latest MySQL data into the front-end cache before opening dashboard.
          fetch('api/data.php', { credentials: 'same-origin' })
            .then(res => res.json())
            .then(payload => { if (payload.success && payload.db) localStorage.setItem('fkClubHubDB', JSON.stringify(payload.db)); })
            .finally(() => { window.location.href = App.homeForRole(data.user.role); });
        } else {
          App.toast(data.message || 'Login failed', 'error');
        }
      })
      .catch(() => {
        // Fall back to localStorage if PHP not configured
        const db = App.getDB();
        const user = db.users.find(u => u.studentId === loginId && u.password === password && u.active);
        if (!user) return App.toast('Invalid Student/Staff ID or password.', 'error');
        App.setSession(user);
        window.location.href = App.homeForRole(user.role);
      });
    });
  }

  const firstForm = document.getElementById('firstTimeForm');
  if (firstForm) {
    firstForm.addEventListener('submit', e => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim().toLowerCase();
      const pass = document.getElementById('newPassword').value;
      const confirm = document.getElementById('confirmPassword').value;
      if (pass.length < 6) return App.toast('Password must be at least 6 characters.', 'error');
      if (pass !== confirm) return App.toast('Passwords do not match.', 'error');
      const db = App.getDB();
      const user = db.users.find(u => u.email.toLowerCase() === email || u.studentId.toLowerCase() === email);
      if (!user) return App.toast('Account not found. Please contact administrator.', 'error');
      user.password = pass;
      App.saveDB(db);
      App.toast('Password updated. Please sign in.');
      setTimeout(() => location.href = 'login.html', 900);
    });
  }

  const forgotForm = document.getElementById('forgotForm');
  if (forgotForm) {
    forgotForm.addEventListener('submit', e => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim().toLowerCase();
      const db = App.getDB();
      const user = db.users.find(u => u.email.toLowerCase() === email || u.studentId.toLowerCase() === email);
      if (!user) return App.toast('Email/student ID is not registered.', 'error');
      user.password = 'student123';
      App.saveDB(db);
      App.toast('Demo reset complete. Temporary password: student123');
    });
  }

  const toggle = document.getElementById('togglePassword');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const pass = document.getElementById('password');
      pass.type = pass.type === 'password' ? 'text' : 'password';
    });
  }
});
