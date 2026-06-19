document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  if (!page || !window.App) return;
  const db = App.getDB();

  function renderClubCards() {
    const target = document.getElementById('clubList');
    if (!target) return;
    const search = (document.getElementById('clubSearch')?.value || '').toLowerCase();
    const status = document.getElementById('clubStatusFilter')?.value || 'Active';
    let clubs = db.clubs.filter(c => status === 'All' || c.status === status);
    if (search) clubs = clubs.filter(c => `${c.name} ${c.description} ${c.advisor}`.toLowerCase().includes(search));
    target.innerHTML = clubs.map(c => {
      const count = db.memberships.filter(m => m.clubId === c.id).length;
      const events = db.events.filter(e => e.clubId === c.id).length;
      return `<article class="item-card">
        <div class="club-cover"><strong>${App.escapeHTML(c.name)}</strong></div>
        <p>${App.escapeHTML(c.description)}</p>
        <div class="meta-list">
          <span>Advisor <strong>${App.escapeHTML(c.advisor)}</strong></span>
          <span>Members <strong>${count}</strong></span>
          <span>Events <strong>${events}</strong></span>
          <span>Status <strong><span class="badge ${c.status.toLowerCase()}">${c.status}</span></strong></span>
        </div>
        <div class="card-actions"><a class="btn btn-secondary" href="clubDetails.html?id=${c.id}">View Details</a><a class="btn btn-primary" href="joinClub.html?id=${c.id}">Join Club</a></div>
      </article>`;
    }).join('') || '<div class="empty-state">No club found.</div>';
  }

  function renderClubDetails() {
    const id = App.getQueryParam('id') || db.clubs[0]?.id;
    const c = db.clubs.find(x => x.id === id);
    const target = document.getElementById('clubDetails');
    if (!target || !c) return App.renderEmpty(target, 'Club not found.');
    const members = db.memberships.filter(m => m.clubId === c.id).map(m => ({...m, user: App.getUser(m.userId)}));
    const events = db.events.filter(e => e.clubId === c.id);
    target.innerHTML = `
      <section class="card">
        <div class="club-cover"><strong>${App.escapeHTML(c.name)}</strong></div>
        <p>${App.escapeHTML(c.description)}</p>
        <div class="detail-list">
          <div><span>Advisor</span><strong>${App.escapeHTML(c.advisor)}</strong></div>
          <div><span>Status</span><strong><span class="badge ${c.status.toLowerCase()}">${c.status}</span></strong></div>
          <div><span>Total Members</span><strong>${members.length}</strong></div>
          <div><span>Total Events</span><strong>${events.length}</strong></div>
        </div>
        <div class="actions" style="margin-top:20px"><a class="btn btn-primary" href="joinClub.html?id=${c.id}">Join this club</a><a class="btn btn-light" href="clubList.html">Back</a></div>
      </section>
      <section class="card"><h2>Committee Members</h2><div class="table-wrap"><table><thead><tr><th>Name</th><th>Student ID</th><th>Position</th><th>Type</th></tr></thead><tbody>
        ${members.map(m => `<tr><td>${m.user ? App.escapeHTML(m.user.name) : '-'}</td><td>${m.user ? App.escapeHTML(m.user.studentId) : '-'}</td><td>${App.escapeHTML(m.position)}</td><td><span class="badge">${App.escapeHTML(m.type)}</span></td></tr>`).join('') || '<tr><td colspan="4">No members yet.</td></tr>'}
      </tbody></table></div></section>
      <section class="card"><h2>Club Events</h2><div class="table-wrap"><table><thead><tr><th>Event</th><th>Date</th><th>Venue</th><th>Status</th></tr></thead><tbody>
        ${events.map(e => `<tr><td><a href="../events/eventDetails.html?id=${e.id}">${App.escapeHTML(e.title)}</a></td><td>${App.formatDate(e.date)}</td><td>${App.escapeHTML(e.venue)}</td><td><span class="badge ${e.status.toLowerCase()}">${e.status}</span></td></tr>`).join('') || '<tr><td colspan="4">No events yet.</td></tr>'}
      </tbody></table></div></section>`;
  }

  function initJoinClub() {
    const clubId = App.getQueryParam('id') || db.clubs[0]?.id;
    const club = db.clubs.find(c => c.id === clubId);
    const title = document.getElementById('joinClubTitle');
    if (title && club) title.textContent = `Join ${club.name}`;
    const form = document.getElementById('joinClubForm');
    if (!form) return;
    document.getElementById('clubId').value = clubId;
    form.addEventListener('submit', e => {
      e.preventDefault();
      const user = App.currentUser();
      if (!user) return;
      const db2 = App.getDB();
      if (db2.memberships.some(m => m.userId === user.id && m.clubId === clubId && m.status !== 'Rejected')) return App.toast('You already joined/requested this club.', 'error');
      db2.memberships.push({ id: App.nextId('M', 'memberships'), userId: user.id, clubId, position: 'Member', type: 'Member', joinedAt: new Date().toISOString().slice(0,10), status: 'Approved' });
      App.saveDB(db2);
      App.toast('Club membership added successfully.');
      setTimeout(() => location.href = 'clubDetails.html?id=' + clubId, 900);
    });
  }

  function renderManageClubs() {
    const target = document.getElementById('manageClubTable');
    if (!target) return;
    const rows = App.getDB().clubs.map(c => {
      const count = App.getDB().memberships.filter(m => m.clubId === c.id).length;
      return `<tr><td>${App.escapeHTML(c.name)}</td><td>${App.escapeHTML(c.advisor)}</td><td>${count}</td><td><span class="badge ${c.status.toLowerCase()}">${c.status}</span></td><td>
        <button class="btn btn-secondary btn-small" data-edit="${c.id}">Edit</button>
        <button class="btn btn-danger btn-small" data-delete="${c.id}">Delete</button>
      </td></tr>`;
    }).join('');
    target.innerHTML = rows || '<tr><td colspan="5">No club record.</td></tr>';
    target.querySelectorAll('[data-edit]').forEach(btn => btn.addEventListener('click', () => fillClubForm(btn.dataset.edit)));
    target.querySelectorAll('[data-delete]').forEach(btn => btn.addEventListener('click', () => deleteClub(btn.dataset.delete)));
  }

  function fillClubForm(id) {
    const c = App.getDB().clubs.find(x => x.id === id); if (!c) return;
    document.getElementById('clubId').value = c.id;
    document.getElementById('clubName').value = c.name;
    document.getElementById('advisor').value = c.advisor;
    document.getElementById('status').value = c.status;
    document.getElementById('description').value = c.description;
    document.getElementById('clubFormTitle').textContent = 'Update Club';
    scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function deleteClub(id) {
  if (!confirm('Are you sure you want to delete this club? This will also delete related events, registrations, attendance, points and committee records from database.')) {
    return;
  }

  try {
    await App.apiPost('delete_club.php', { id });

    await App.refreshFromServer();

    App.toast('Club deleted from database successfully.');
    renderManageClubs();
  } catch (err) {
    App.toast(err.message || 'Unable to delete club.', 'error');
  }
}

  function initManageClubForm() {
    const form = document.getElementById('clubForm');
    if (!form) return;

    form.addEventListener('submit', async e => {
      e.preventDefault();

      const id = document.getElementById('clubId').value;

      const payload = {
        id,
        name: document.getElementById('clubName').value.trim(),
        code: document.getElementById('clubCode').value.trim(),
        advisor: document.getElementById('advisor').value.trim(),
        advisorEmail: document.getElementById('advisorEmail').value.trim(),
        status: document.getElementById('status').value,
        description: document.getElementById('description').value.trim()
      };

      if (!payload.name || !payload.description) {
        App.toast('Please complete club name and description.', 'error');
        return;
      }

      try {
        await App.apiPost('save_club.php', payload);
        await App.refreshFromServer();

        App.toast(id ? 'Club updated in database.' : 'Club created in database.');

        form.reset();
        document.getElementById('clubId').value = '';
        document.getElementById('clubFormTitle').textContent = 'Create New Club';

        renderManageClubs();
      } catch (err) {
        App.toast(err.message || 'Unable to save club.', 'error');
      }
    });

    document.getElementById('resetClubForm')?.addEventListener('click', () => {
      form.reset();
      document.getElementById('clubId').value = '';
      document.getElementById('clubFormTitle').textContent = 'Create New Club';
    });
  }

  function initCommitteeManagement() {
    const clubSel = document.getElementById('clubSelect');
    const userSel = document.getElementById('userSelect');
    if (!clubSel || !userSel) return;
    clubSel.innerHTML = db.clubs.map(c => `<option value="${c.id}">${App.escapeHTML(c.name)}</option>`).join('');
    userSel.innerHTML = db.users.filter(u => u.role !== 'admin').map(u => `<option value="${u.id}">${App.escapeHTML(u.name)} (${u.studentId})</option>`).join('');
    const form = document.getElementById('committeeForm');
    form.addEventListener('submit', e => {
      e.preventDefault();
      const db2 = App.getDB();
      const clubId = clubSel.value, userId = userSel.value, position = document.getElementById('position').value;
      let membership = db2.memberships.find(m => m.userId === userId && m.clubId === clubId);
      if (membership) Object.assign(membership, { position, type: 'Committee', status: 'Approved' });
      else db2.memberships.push({ id: App.nextId('M','memberships'), userId, clubId, position, type: 'Committee', joinedAt: new Date().toISOString().slice(0,10), status: 'Approved' });
      const user = db2.users.find(u => u.id === userId); if (user) { user.role = 'committee'; user.clubId = clubId; user.position = position; }
      App.saveDB(db2); App.toast('Committee role assigned.'); renderCommitteeTable();
    });
    renderCommitteeTable();
  }

  function renderCommitteeTable() {
    const target = document.getElementById('committeeTable'); if (!target) return;
    const db2 = App.getDB();
    const committees = db2.memberships.filter(m => m.type === 'Committee');
    target.innerHTML = committees.map(m => {
      const u = db2.users.find(x => x.id === m.userId); const c = db2.clubs.find(x => x.id === m.clubId);
      return `<tr><td>${u ? App.escapeHTML(u.name) : '-'}</td><td>${u ? App.escapeHTML(u.studentId) : '-'}</td><td>${c ? App.escapeHTML(c.name) : '-'}</td><td>${App.escapeHTML(m.position)}</td><td><span class="badge committee">Committee</span></td></tr>`;
    }).join('') || '<tr><td colspan="5">No committee assigned.</td></tr>';
  }

  if (page === 'clubList') {
    renderClubCards();
    document.getElementById('clubSearch')?.addEventListener('input', renderClubCards);
    document.getElementById('clubStatusFilter')?.addEventListener('change', renderClubCards);
  }
  if (page === 'clubDetails') renderClubDetails();
  if (page === 'joinClub') initJoinClub();
  if (page === 'manageClub') { renderManageClubs(); initManageClubForm(); }
  if (page === 'committeeManagement') initCommitteeManagement();
});
