document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  if (!page || !window.App) return;

  function renderProfile() {
    const user = App.currentUser();
    const target = document.getElementById('profilePanel');
    if (!target || !user) return;

    const db = App.getDB();
    const memberships = db.memberships.filter(m => m.userId === user.id);

    let membershipSection = '';

    if (user.role !== 'admin') {
      membershipSection = `
      <section class="card">
        <h2>Club Membership</h2>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Club</th>
                <th>Position</th>
                <th>Type</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${memberships.map(m => {
                const c = db.clubs.find(x => x.id === m.clubId);
                return `
                  <tr>
                    <td>${c ? App.escapeHTML(c.name) : '-'}</td>
                    <td>${App.escapeHTML(m.position)}</td>
                    <td>${App.escapeHTML(m.type)}</td>
                    <td><span class="badge approved">${App.escapeHTML(m.status)}</span></td>
                  </tr>
                `;
              }).join('') || '<tr><td colspan="4">No membership record.</td></tr>'}
            </tbody>
          </table>
        </div>
      </section>
    `;
    }

    target.innerHTML = `
    <section class="card">
      <div class="profile-hero">
        <div class="profile-photo">${user.name.charAt(0).toUpperCase()}</div>
        <div>
          <h2>${App.escapeHTML(user.name)}</h2>
          <span class="badge ${user.role}">${App.titleCase(user.role)}</span>
        </div>
      </div>

      <div class="detail-list">
        <div><span>Student/Staff ID</span><strong>${App.escapeHTML(user.studentId)}</strong></div>
        <div><span>Email</span><strong>${App.escapeHTML(user.email)}</strong></div>
        <div><span>Phone</span><strong>${App.escapeHTML(user.phone || '-')}</strong></div>
        <div><span>Department</span><strong>${App.escapeHTML(user.department || '-')}</strong></div>
        <div><span>Position</span><strong>${App.escapeHTML(user.position || '-')}</strong></div>
      </div>

      <div class="actions" style="margin-top:22px">
        <a class="btn btn-primary" href="editProfile.html">Edit Profile</a>
        ${user.role === 'admin' ? '<button class="btn btn-light" type="button" onclick="App.resetDemo()">Reset Demo Data</button>' : ''}
      </div>
    </section>

    ${membershipSection}
  `;
  }

  function initEditProfile() {
    const user = App.currentUser(); const form = document.getElementById('editProfileForm'); if (!form || !user) return;
    document.getElementById('name').value = user.name;
    document.getElementById('email').value = user.email;
    document.getElementById('phone').value = user.phone || '';
    document.getElementById('department').value = user.department || '';
    form.addEventListener('submit', e => {
      e.preventDefault(); const db = App.getDB(); const u = db.users.find(x => x.id === user.id);
      u.name = document.getElementById('name').value.trim(); u.email = document.getElementById('email').value.trim(); u.phone = document.getElementById('phone').value.trim(); u.department = document.getElementById('department').value.trim();
      const pass = document.getElementById('password').value; if (pass) u.password = pass;
      App.saveDB(db); App.setSession(u); App.toast('Profile updated.'); setTimeout(()=>location.href='profile.html',800);
    });
  }

  function renderUsers() {
    const target = document.getElementById('manageUsersTable'); if (!target) return;
    const db = App.getDB(); const q = (document.getElementById('userSearch')?.value || '').toLowerCase(); const role = document.getElementById('roleFilter')?.value || 'All';
    let users = db.users.filter(u => role === 'All' || u.role === role);
    if (q) users = users.filter(u => `${u.name} ${u.email} ${u.studentId}`.toLowerCase().includes(q));
    target.innerHTML = users.map(u => `<tr><td>${App.escapeHTML(u.name)}</td><td>${App.escapeHTML(u.studentId)}</td><td>${App.escapeHTML(u.email)}</td><td><span class="badge ${u.role}">${App.titleCase(u.role)}</span></td><td>${u.active ? '<span class="badge active">Active</span>' : '<span class="badge inactive">Inactive</span>'}</td><td><button class="btn btn-secondary btn-small" data-edit="${u.id}">Edit</button><button class="btn btn-danger btn-small" data-delete="${u.id}">Delete</button></td></tr>`).join('') || '<tr><td colspan="6">No users found.</td></tr>';
    target.querySelectorAll('[data-delete]').forEach(btn => btn.addEventListener('click', () => deleteUser(btn.dataset.delete)));
    target.querySelectorAll('[data-edit]').forEach(btn => btn.addEventListener('click', () => location.href = 'registerUser.html?id=' + btn.dataset.edit));
  }

  function deleteUser(id) {
    if (!confirm('Delete/inactivate this user?')) return;
    const db = App.getDB(); const user = db.users.find(u => u.id === id); if (user) user.active = false;
    App.saveDB(db); App.toast('User marked as inactive.'); renderUsers();
  }

  function initRegisterUser() {
    const db = App.getDB(); const form = document.getElementById('registerUserForm'); if (!form) return;
    const clubSel = document.getElementById('clubId');
    clubSel.innerHTML = '<option value="">No specific club</option>' + db.clubs.map(c => `<option value="${c.id}">${App.escapeHTML(c.name)}</option>`).join('');

    const roleSelect = document.getElementById('role');
    const clubGroup = document.getElementById('clubId')?.closest('.form-group');
    const positionGroup = document.getElementById('position')?.closest('.form-group');

    function updateRoleFields() {
      const role = roleSelect.value;

      if (role === 'admin') {
        if (clubGroup) clubGroup.style.display = 'none';
        if (positionGroup) positionGroup.style.display = 'none';
        document.getElementById('clubId').value = '';
        document.getElementById('position').value = 'FK Staff';
      } else if (role === 'student') {
        if (clubGroup) clubGroup.style.display = 'block';
        if (positionGroup) positionGroup.style.display = 'none';
        document.getElementById('position').value = 'Member';
      } else {
        if (clubGroup) clubGroup.style.display = 'block';
        if (positionGroup) positionGroup.style.display = 'block';
      }
    }

    roleSelect.addEventListener('change', updateRoleFields);
    updateRoleFields();
    const editId = App.getQueryParam('id');
    if (editId) {
      const u = db.users.find(x => x.id === editId); if (u) {
        document.getElementById('formTitle').textContent = 'Update User'; document.getElementById('userId').value = u.id; document.getElementById('studentId').value = u.studentId; document.getElementById('name').value = u.name; document.getElementById('email').value = u.email; document.getElementById('phone').value = u.phone || ''; document.getElementById('role').value = u.role; document.getElementById('department').value = u.department || ''; document.getElementById('clubId').value = u.clubId || ''; document.getElementById('position').value = u.position || ''; document.getElementById('password').value = u.password || '';
      }
    }
    form.addEventListener('submit', e => {
      e.preventDefault(); const db2 = App.getDB(); const id = document.getElementById('userId').value;
      const payload = { studentId: document.getElementById('studentId').value.trim(), name: document.getElementById('name').value.trim(), email: document.getElementById('email').value.trim(), password: document.getElementById('password').value || 'student123', role: document.getElementById('role').value, phone: document.getElementById('phone').value.trim(), department: document.getElementById('department').value.trim(), clubId: document.getElementById('clubId').value, position: document.getElementById('position').value.trim(), active: true };
      let savedUser;
      if (id) {
        savedUser = db2.users.find(u => u.id === id);
        Object.assign(savedUser, payload);
      } else {
        savedUser = { id: App.nextId('U','users'), createdAt: new Date().toISOString().slice(0,10), photo: '', ...payload };
        db2.users.push(savedUser);
      }

      // Admin-only account creation also connects committee/student to a club when selected.
      if (payload.clubId && payload.role !== 'admin') {
        let membership = db2.memberships.find(m => m.userId === savedUser.id && m.clubId === payload.clubId);
        if (!membership) {
          membership = { id: App.nextId('M','memberships'), userId: savedUser.id, clubId: payload.clubId, position: payload.position || (payload.role === 'committee' ? 'Committee Member' : 'Member'), type: payload.role === 'committee' ? 'Committee' : 'Member', joinedAt: new Date().toISOString().slice(0,10), status: 'Approved' };
          db2.memberships.push(membership);
        } else {
          membership.position = payload.position || membership.position;
          membership.type = payload.role === 'committee' ? 'Committee' : 'Member';
          membership.status = 'Approved';
        }
      }

      App.saveDB(db2);
      if (db2.backend) {
        App.apiPost('register_user.php', { id, ...payload })
          .then(() => { App.toast(id ? 'User updated in database.' : 'User registered in database by admin.'); setTimeout(()=>location.href='manageUsers.html',900); })
          .catch(err => App.toast('Saved locally, but database update failed: ' + err.message, 'error'));
      } else {
        App.toast(id ? 'User updated.' : 'User registered by admin.'); setTimeout(()=>location.href='manageUsers.html',800);
      }
    });
  }

  function renderMembership() {
    const target = document.getElementById('membershipTable'); if (!target) return;
    const db = App.getDB(); const user = App.currentUser(); const isAdmin = user.role === 'admin';
    const rows = db.memberships.filter(m => isAdmin || m.userId === user.id);
    target.innerHTML = rows.map(m => { const u=db.users.find(x=>x.id===m.userId); const c=db.clubs.find(x=>x.id===m.clubId); return `<tr><td>${u ? App.escapeHTML(u.name) : '-'}</td><td>${c ? App.escapeHTML(c.name) : '-'}</td><td>${App.escapeHTML(m.position)}</td><td>${App.escapeHTML(m.type)}</td><td>${App.formatDate(m.joinedAt)}</td><td><span class="badge approved">${m.status}</span></td></tr>`; }).join('') || '<tr><td colspan="6">No membership record.</td></tr>';
  }

  if (page === 'profile') renderProfile();
  if (page === 'editProfile') initEditProfile();
  if (page === 'manageUsers') { renderUsers(); document.getElementById('userSearch')?.addEventListener('input', renderUsers); document.getElementById('roleFilter')?.addEventListener('change', renderUsers); }
  if (page === 'registerUser') initRegisterUser();
  if (page === 'membership') renderMembership();
});
