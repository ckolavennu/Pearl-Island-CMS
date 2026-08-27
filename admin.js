(() => {
  const STORAGE = {
    admins: 'pii_superadmins_v1',
    candidates: 'pii_admin_candidates_v1',
    session: 'pii_admin_session_v1'
  };

  const DEFAULT_ADMIN = {
    email: 'admin@pearlisland.com',
    password: 'PearlIsland123!',
    role: 'Superadmin',
    createdAt: new Date().toISOString(),
    active: true
  };

  const SAMPLE_CANDIDATES = [
    {
      id: 'PII-0001', name: 'Rejina Bishokarma', nationality: 'Nepal', age: 23,
      profession: 'Housemaid', location: 'IN_OMAN', status: 'AVAILABLE', salary: 120,
      contract: '2 Years', languages: 'Arabic — Moderate, English — Moderate',
      skills: 'Cleaning, Washing, Ironing, Baby Care, Basic Cooking', photoName: '', cvName: ''
    },
    {
      id: 'PII-0002', name: 'Maria Santos', nationality: 'Philippines', age: 29,
      profession: 'Housemaid', location: 'OVERSEAS', status: 'AVAILABLE', salary: 120,
      contract: '2 Years', languages: 'English — Good', skills: 'Cleaning, Cooking, Child Care', photoName: '', cvName: ''
    }
  ];

  const read = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const byId = id => document.getElementById(id);
  const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  const formatDate = iso => new Intl.DateTimeFormat('en', { day:'2-digit', month:'short', year:'numeric' }).format(new Date(iso));

  function seed() {
    if (!localStorage.getItem(STORAGE.admins)) write(STORAGE.admins, [DEFAULT_ADMIN]);
    if (!localStorage.getItem(STORAGE.candidates)) write(STORAGE.candidates, SAMPLE_CANDIDATES);
  }

  function initPasswordToggles() {
    document.querySelectorAll('.password-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const input = byId(btn.dataset.target);
        if (!input) return;
        input.type = input.type === 'password' ? 'text' : 'password';
        const icon = btn.querySelector('svg');
        if (icon) icon.outerHTML = `<i data-lucide="${input.type === 'password' ? 'eye' : 'eye-off'}"></i>`;
        if (window.lucide) lucide.createIcons();
      });
    });
  }

  function showMessage(el, text, type = '') {
    if (!el) return;
    el.textContent = text;
    el.className = `form-message ${type}`.trim();
    el.hidden = false;
  }

  function initLogin() {
    const form = byId('loginForm');
    if (!form) return;
    if (read(STORAGE.session, null)) window.location.href = 'admin.html';

    form.addEventListener('submit', event => {
      event.preventDefault();
      const email = byId('loginEmail').value.trim().toLowerCase();
      const password = byId('loginPassword').value;
      const admins = read(STORAGE.admins, []);
      const admin = admins.find(a => a.email.toLowerCase() === email && a.password === password && a.active !== false);
      if (!admin) {
        showMessage(byId('loginMessage'), 'Incorrect email or password.', 'error');
        return;
      }
      write(STORAGE.session, { email: admin.email, loginAt: new Date().toISOString() });
      window.location.href = 'admin.html';
    });
  }

  function getSession() { return read(STORAGE.session, null); }
  function getCandidates() { return read(STORAGE.candidates, []); }
  function getAdmins() { return read(STORAGE.admins, []); }

  function initDashboard() {
    if (!byId('section-dashboard')) return;
    const session = getSession();
    if (!session) {
      window.location.href = 'admin-login.html';
      return;
    }
    byId('currentAdminEmail').textContent = session.email;

    initNavigation();
    initModals();
    initCandidateForm();
    initAdminForm();
    initPasswordForm();
    initLogout();
    initFilters();
    renderAll();
  }

  function initNavigation() {
    document.querySelectorAll('.admin-nav-item').forEach(btn => {
      btn.addEventListener('click', () => goToSection(btn.dataset.section));
    });
    document.querySelectorAll('[data-go-section]').forEach(btn => btn.addEventListener('click', () => goToSection(btn.dataset.goSection)));
    byId('mobileMenu')?.addEventListener('click', () => document.querySelector('.admin-sidebar')?.classList.toggle('open'));
  }

  function goToSection(name) {
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.admin-nav-item').forEach(n => n.classList.toggle('active', n.dataset.section === name));
    byId(`section-${name}`)?.classList.add('active');
    const titles = {dashboard:'Dashboard',candidates:'Candidates',admins:'Superadmins',security:'Change Password'};
    if (byId('pageTitle')) byId('pageTitle').textContent = titles[name] || 'Dashboard';
    document.querySelector('.admin-sidebar')?.classList.remove('open');
  }

  function initModals() {
    document.querySelectorAll('[data-open-candidate-modal]').forEach(btn => btn.addEventListener('click', () => openCandidateModal()));
    document.querySelectorAll('[data-open-admin-modal]').forEach(btn => btn.addEventListener('click', () => openModal('adminModal')));
    document.querySelectorAll('[data-close-modal]').forEach(btn => btn.addEventListener('click', () => closeModal(btn.dataset.closeModal)));
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.addEventListener('click', e => { if (e.target === backdrop) closeModal(backdrop.id); }));
  }

  function openModal(id) { const el = byId(id); if (el) el.hidden = false; }
  function closeModal(id) { const el = byId(id); if (el) el.hidden = true; }

  function openCandidateModal(index = null) {
    const form = byId('candidateForm');
    form.reset();
    byId('candidateEditIndex').value = index ?? '';
    byId('candidateModalTitle').textContent = index === null ? 'Add Candidate' : 'Edit Candidate';
    if (index !== null) {
      const c = getCandidates()[index];
      if (!c) return;
      byId('candidateId').value = c.id || '';
      byId('candidateName').value = c.name || '';
      byId('candidateNationality').value = c.nationality || '';
      byId('candidateAge').value = c.age || '';
      byId('candidateProfession').value = c.profession || '';
      byId('candidateLocation').value = c.location || 'IN_OMAN';
      byId('candidateStatus').value = c.status || 'AVAILABLE';
      byId('candidateSalary').value = c.salary ?? '';
      byId('candidateContract').value = c.contract || '';
      byId('candidateLanguages').value = c.languages || '';
      byId('candidateSkills').value = c.skills || '';
    }
    openModal('candidateModal');
  }

  function initCandidateForm() {
    byId('candidateForm')?.addEventListener('submit', event => {
      event.preventDefault();
      const candidates = getCandidates();
      const editRaw = byId('candidateEditIndex').value;
      const editIndex = editRaw === '' ? null : Number(editRaw);
      const id = byId('candidateId').value.trim().toUpperCase();
      const duplicate = candidates.some((c, i) => c.id.toUpperCase() === id && i !== editIndex);
      if (duplicate) { alert('That Candidate ID already exists.'); return; }
      const photo = byId('candidatePhoto').files[0];
      const cv = byId('candidateCv').files[0];
      const existing = editIndex !== null ? candidates[editIndex] : {};
      const record = {
        ...existing,
        id,
        name: byId('candidateName').value.trim(),
        nationality: byId('candidateNationality').value.trim(),
        age: Number(byId('candidateAge').value),
        profession: byId('candidateProfession').value.trim(),
        location: byId('candidateLocation').value,
        status: byId('candidateStatus').value,
        salary: byId('candidateSalary').value ? Number(byId('candidateSalary').value) : null,
        contract: byId('candidateContract').value.trim(),
        languages: byId('candidateLanguages').value.trim(),
        skills: byId('candidateSkills').value.trim(),
        photoName: photo ? photo.name : (existing.photoName || ''),
        cvName: cv ? cv.name : (existing.cvName || ''),
        updatedAt: new Date().toISOString(),
        createdAt: existing.createdAt || new Date().toISOString()
      };
      if (editIndex === null) candidates.unshift(record); else candidates[editIndex] = record;
      write(STORAGE.candidates, candidates);
      closeModal('candidateModal');
      renderAll();
    });
  }

  function initAdminForm() {
    byId('adminForm')?.addEventListener('submit', event => {
      event.preventDefault();
      const email = byId('newAdminEmail').value.trim().toLowerCase();
      const password = byId('newAdminPassword').value;
      const confirm = byId('newAdminConfirm').value;
      const message = byId('adminMessage');
      if (password !== confirm) { showMessage(message, 'Passwords do not match.', 'error'); return; }
      if (password.length < 8) { showMessage(message, 'Password must contain at least 8 characters.', 'error'); return; }
      const admins = getAdmins();
      if (admins.some(a => a.email.toLowerCase() === email)) { showMessage(message, 'A superadmin with this email already exists.', 'error'); return; }
      admins.push({ email, password, role:'Superadmin', createdAt:new Date().toISOString(), active:true });
      write(STORAGE.admins, admins);
      byId('adminForm').reset();
      closeModal('adminModal');
      renderAll();
    });
  }

  function initPasswordForm() {
    byId('passwordForm')?.addEventListener('submit', event => {
      event.preventDefault();
      const session = getSession();
      const admins = getAdmins();
      const index = admins.findIndex(a => a.email === session.email);
      const current = byId('currentPassword').value;
      const next = byId('newPassword').value;
      const confirm = byId('confirmPassword').value;
      const message = byId('passwordMessage');
      if (index < 0 || admins[index].password !== current) { showMessage(message, 'Current password is incorrect.', 'error'); return; }
      if (next.length < 8) { showMessage(message, 'New password must be at least 8 characters.', 'error'); return; }
      if (next !== confirm) { showMessage(message, 'New passwords do not match.', 'error'); return; }
      admins[index].password = next;
      write(STORAGE.admins, admins);
      byId('passwordForm').reset();
      showMessage(message, 'Password updated successfully.', 'success');
    });
  }

  function initLogout() {
    byId('logoutButton')?.addEventListener('click', () => {
      localStorage.removeItem(STORAGE.session);
      window.location.href = 'admin-login.html';
    });
  }

  function initFilters() {
    ['candidateSearch','candidateLocationFilter','candidateStatusFilter'].forEach(id => {
      byId(id)?.addEventListener(id === 'candidateSearch' ? 'input' : 'change', renderCandidates);
    });
  }

  function deleteCandidate(index) {
    const candidates = getCandidates();
    const c = candidates[index];
    if (!c || !confirm(`Remove ${c.name} (${c.id})?`)) return;
    candidates.splice(index, 1);
    write(STORAGE.candidates, candidates);
    renderAll();
  }

  function deleteAdmin(index) {
    const admins = getAdmins();
    const session = getSession();
    const admin = admins[index];
    if (!admin) return;
    if (admin.email === session.email) { alert('You cannot remove the account you are currently signed in with.'); return; }
    if (admins.length <= 1) { alert('At least one superadmin account must remain.'); return; }
    if (!confirm(`Remove superadmin ${admin.email}?`)) return;
    admins.splice(index, 1);
    write(STORAGE.admins, admins);
    renderAll();
  }

  function renderAll() {
    renderStats();
    renderCandidates();
    renderRecent();
    renderAdmins();
    if (window.lucide) lucide.createIcons();
  }

  function renderStats() {
    const candidates = getCandidates();
    byId('statTotal').textContent = candidates.length;
    byId('statOman').textContent = candidates.filter(c => c.location === 'IN_OMAN').length;
    byId('statOverseas').textContent = candidates.filter(c => c.location === 'OVERSEAS').length;
    byId('statAdmins').textContent = getAdmins().length;
  }

  function renderRecent() {
    const host = byId('recentCandidates');
    if (!host) return;
    const rows = getCandidates().slice(0, 5);
    if (!rows.length) { host.innerHTML = '<div class="empty-state"><p>No candidates added yet.</p></div>'; return; }
    host.innerHTML = rows.map(c => `<div class="compact-candidate"><div class="candidate-mini-avatar">${escapeHtml((c.name || 'C').charAt(0))}</div><div><strong>${escapeHtml(c.name)}</strong><span>${escapeHtml(c.id)} · ${escapeHtml(c.nationality)} · ${escapeHtml(c.profession)}</span></div><span class="status-pill status-${escapeHtml(c.status)}">${escapeHtml(c.status)}</span></div>`).join('');
  }

  function renderCandidates() {
    const body = byId('candidateTableBody');
    if (!body) return;
    const q = (byId('candidateSearch')?.value || '').trim().toLowerCase();
    const location = byId('candidateLocationFilter')?.value || 'ALL';
    const status = byId('candidateStatusFilter')?.value || 'ALL';
    const candidates = getCandidates();
    const filtered = candidates.map((c,index)=>({c,index})).filter(({c}) => {
      const haystack = `${c.id} ${c.name} ${c.nationality} ${c.profession}`.toLowerCase();
      return (!q || haystack.includes(q)) && (location === 'ALL' || c.location === location) && (status === 'ALL' || c.status === status);
    });
    if (!filtered.length) { body.innerHTML = '<tr><td colspan="6"><div class="empty-state">No candidate profiles match the current filters.</div></td></tr>'; return; }
    body.innerHTML = filtered.map(({c,index}) => `<tr>
      <td><div class="candidate-cell"><div class="candidate-mini-avatar">${escapeHtml((c.name || 'C').charAt(0))}</div><div><strong>${escapeHtml(c.name)}</strong><span>${escapeHtml(c.id)}</span></div></div></td>
      <td>${escapeHtml(c.nationality)} · ${escapeHtml(c.age)}</td><td>${escapeHtml(c.profession)}</td>
      <td><span class="location-badge"><i data-lucide="${c.location === 'IN_OMAN' ? 'map-pin' : 'plane'}"></i>${c.location === 'IN_OMAN' ? 'In Oman' : 'Overseas'}</span></td>
      <td><span class="status-pill status-${escapeHtml(c.status)}">${escapeHtml(c.status)}</span></td>
      <td><div class="table-actions"><button class="icon-button" title="Edit" data-edit-candidate="${index}"><i data-lucide="pencil"></i></button><button class="icon-button danger" title="Remove" data-delete-candidate="${index}"><i data-lucide="trash-2"></i></button></div></td>
    </tr>`).join('');
    body.querySelectorAll('[data-edit-candidate]').forEach(btn => btn.addEventListener('click', () => openCandidateModal(Number(btn.dataset.editCandidate))));
    body.querySelectorAll('[data-delete-candidate]').forEach(btn => btn.addEventListener('click', () => deleteCandidate(Number(btn.dataset.deleteCandidate))));
    if (window.lucide) lucide.createIcons();
  }

  function renderAdmins() {
    const body = byId('adminTableBody');
    if (!body) return;
    const session = getSession();
    const admins = getAdmins();
    body.innerHTML = admins.map((a,index) => `<tr><td><strong>${escapeHtml(a.email)}</strong>${a.email === session.email ? ' <span class="status-pill status-AVAILABLE">YOU</span>' : ''}</td><td>Superadmin</td><td>${formatDate(a.createdAt)}</td><td><span class="status-pill status-AVAILABLE">ACTIVE</span></td><td><button class="icon-button danger" title="Remove" data-delete-admin="${index}" ${a.email === session.email ? 'disabled' : ''}><i data-lucide="trash-2"></i></button></td></tr>`).join('');
    body.querySelectorAll('[data-delete-admin]').forEach(btn => btn.addEventListener('click', () => deleteAdmin(Number(btn.dataset.deleteAdmin))));
  }

  seed();
  document.addEventListener('DOMContentLoaded', () => {
    initPasswordToggles();
    initLogin();
    initDashboard();
    if (window.lucide) lucide.createIcons();
  });
})();