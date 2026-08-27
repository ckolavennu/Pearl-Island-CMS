(() => {
  const sb = window.supabaseClient;
  const byId = id => document.getElementById(id);
  const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  const formatDate = iso => iso ? new Intl.DateTimeFormat('en', { day:'2-digit', month:'short', year:'numeric' }).format(new Date(iso)) : '—';

  const state = {
    user: null,
    candidates: [],
    admins: []
  };

  function showMessage(el, text, type = '') {
    if (!el) return;
    el.textContent = text;
    el.className = `form-message ${type}`.trim();
    el.hidden = false;
  }

  function clearMessage(el) {
    if (!el) return;
    el.hidden = true;
    el.textContent = '';
    el.className = 'form-message';
  }

  function setBusy(button, busy, busyText = 'Please wait...') {
    if (!button) return;
    if (busy) {
      button.dataset.originalHtml = button.innerHTML;
      button.disabled = true;
      button.textContent = busyText;
    } else {
      button.disabled = false;
      if (button.dataset.originalHtml) button.innerHTML = button.dataset.originalHtml;
      if (window.lucide) lucide.createIcons();
    }
  }

  function initPasswordToggles() {
    document.querySelectorAll('.password-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const input = byId(btn.dataset.target);
        if (!input) return;
        input.type = input.type === 'password' ? 'text' : 'password';
        btn.innerHTML = `<i data-lucide="${input.type === 'password' ? 'eye' : 'eye-off'}"></i>`;
        if (window.lucide) lucide.createIcons();
      });
    });
  }

  async function isSuperadmin(userId) {
    const { data, error } = await sb
      .from('superadmins')
      .select('id,email,full_name,created_at')
      .eq('id', userId)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async function initLogin() {
    const form = byId('loginForm');
    if (!form) return;

    const { data: { session } } = await sb.auth.getSession();
    if (session?.user) {
      try {
        const admin = await isSuperadmin(session.user.id);
        if (admin) {
          window.location.replace('admin.html');
          return;
        }
        await sb.auth.signOut();
      } catch (_) {}
    }

    form.addEventListener('submit', async event => {
      event.preventDefault();
      const message = byId('loginMessage');
      clearMessage(message);
      const submit = form.querySelector('button[type="submit"]');
      setBusy(submit, true, 'Signing in...');

      const email = byId('loginEmail').value.trim().toLowerCase();
      const password = byId('loginPassword').value;

      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      if (error || !data.user) {
        showMessage(message, 'Incorrect email or password.', 'error');
        setBusy(submit, false);
        return;
      }

      try {
        const admin = await isSuperadmin(data.user.id);
        if (!admin) {
          await sb.auth.signOut();
          showMessage(message, 'This account does not have superadmin access.', 'error');
          setBusy(submit, false);
          return;
        }
        window.location.replace('admin.html');
      } catch (err) {
        await sb.auth.signOut();
        showMessage(message, err.message || 'Unable to verify administrator access.', 'error');
        setBusy(submit, false);
      }
    });
  }

  async function requireDashboardSession() {
    const { data: { session } } = await sb.auth.getSession();
    if (!session?.user) {
      window.location.replace('admin-login.html');
      return false;
    }

    try {
      const admin = await isSuperadmin(session.user.id);
      if (!admin) {
        await sb.auth.signOut();
        window.location.replace('admin-login.html');
        return false;
      }
      state.user = session.user;
      byId('currentAdminEmail').textContent = session.user.email || admin.email;
      return true;
    } catch (error) {
      console.error(error);
      window.location.replace('admin-login.html');
      return false;
    }
  }

  async function loadCandidates() {
    const { data, error } = await sb
      .from('candidates')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    state.candidates = data || [];
  }

  async function loadAdmins() {
    const { data, error } = await sb
      .from('superadmins')
      .select('id,email,full_name,created_at')
      .order('created_at', { ascending: true });
    if (error) throw error;
    state.admins = data || [];
  }

  async function refreshData() {
    await Promise.all([loadCandidates(), loadAdmins()]);
    renderAll();
  }

  async function initDashboard() {
    if (!byId('section-dashboard')) return;
    if (!(await requireDashboardSession())) return;

    initNavigation();
    initModals();
    initCandidateForm();
    initAdminForm();
    initPasswordForm();
    initLogout();
    initFilters();

    try {
      await refreshData();
    } catch (error) {
      console.error(error);
      alert(`Unable to load dashboard data: ${error.message}`);
    }
  }

  function initNavigation() {
    document.querySelectorAll('.admin-nav-item').forEach(btn => btn.addEventListener('click', () => goToSection(btn.dataset.section)));
    document.querySelectorAll('[data-go-section]').forEach(btn => btn.addEventListener('click', () => goToSection(btn.dataset.goSection)));
    byId('mobileMenu')?.addEventListener('click', () => document.querySelector('.admin-sidebar')?.classList.toggle('open'));
  }

  function goToSection(name) {
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.admin-nav-item').forEach(n => n.classList.toggle('active', n.dataset.section === name));
    byId(`section-${name}`)?.classList.add('active');
    const titles = { dashboard:'Dashboard', candidates:'Candidates', admins:'Superadmins', security:'Change Password' };
    if (byId('pageTitle')) byId('pageTitle').textContent = titles[name] || 'Dashboard';
    document.querySelector('.admin-sidebar')?.classList.remove('open');
  }

  function initModals() {
    document.querySelectorAll('[data-open-candidate-modal]').forEach(btn => btn.addEventListener('click', () => openCandidateModal()));
    document.querySelectorAll('[data-open-admin-modal]').forEach(btn => btn.addEventListener('click', () => {
      byId('adminForm')?.reset();
      clearMessage(byId('adminMessage'));
      openModal('adminModal');
    }));
    document.querySelectorAll('[data-close-modal]').forEach(btn => btn.addEventListener('click', () => closeModal(btn.dataset.closeModal)));
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.addEventListener('click', e => {
      if (e.target === backdrop) closeModal(backdrop.id);
    }));
  }

  function openModal(id) {
    const el = byId(id);
    if (el) el.hidden = false;
  }

  function closeModal(id) {
    const el = byId(id);
    if (el) el.hidden = true;
  }

  function languagesToInput(languages) {
    if (!languages || typeof languages !== 'object') return '';
    return Object.entries(languages).map(([name, level]) => `${name} — ${level}`).join(', ');
  }

  function parseLanguages(value) {
    const result = {};
    value.split(',').map(v => v.trim()).filter(Boolean).forEach(item => {
      const parts = item.split(/\s+[—–-]\s+/);
      const language = (parts.shift() || '').trim();
      const level = parts.join(' - ').trim() || 'Yes';
      if (language) result[language] = level;
    });
    return result;
  }

  function parseSkills(value) {
    return value.split(',').map(v => v.trim()).filter(Boolean);
  }

  function openCandidateModal(candidateId = null) {
    const form = byId('candidateForm');
    form.reset();
    clearMessage(byId('candidateMessage'));
    byId('candidateEditId').value = candidateId || '';
    byId('candidateModalTitle').textContent = candidateId ? 'Edit Candidate' : 'Add Candidate';
    byId('candidateId').value = candidateId ? (state.candidates.find(c => c.id === candidateId)?.candidate_code || '') : '';

    if (candidateId) {
      const c = state.candidates.find(candidate => candidate.id === candidateId);
      if (!c) return;
      byId('candidateName').value = c.full_name || '';
      byId('candidateNationality').value = c.nationality || '';
      byId('candidateAge').value = c.age ?? '';
      byId('candidateProfession').value = c.profession || '';
      byId('candidateLocation').value = c.location_status || 'IN_OMAN';
      byId('candidateStatus').value = c.availability_status || 'AVAILABLE';
      byId('candidateSalary').value = c.salary_omr ?? '';
      byId('candidateContract').value = c.contract_period || '';
      byId('candidateLanguages').value = languagesToInput(c.languages);
      byId('candidateSkills').value = Array.isArray(c.skills) ? c.skills.join(', ') : '';
    }

    openModal('candidateModal');
  }

  function validateFiles(photo, cv) {
    if (photo) {
      if (!['image/jpeg','image/png','image/webp'].includes(photo.type)) return 'Candidate picture must be JPEG, PNG or WebP.';
      if (photo.size > 2 * 1024 * 1024) return 'Candidate picture must be 2 MB or smaller.';
    }
    if (cv) {
      if (cv.type !== 'application/pdf') return 'Candidate CV must be a PDF.';
      if (cv.size > 3 * 1024 * 1024) return 'Candidate CV must be 3 MB or smaller.';
    }
    return null;
  }

  function photoExtension(file) {
    if (file.type === 'image/png') return 'png';
    if (file.type === 'image/webp') return 'webp';
    return 'jpg';
  }

  async function uploadCandidateFiles(candidate, photo, cv) {
    const updates = {};

    if (photo) {
      const photoPath = `${candidate.id}/profile.${photoExtension(photo)}`;
      const { error } = await sb.storage.from('candidate-photos').upload(photoPath, photo, {
        upsert: true,
        contentType: photo.type,
        cacheControl: '3600'
      });
      if (error) throw error;
      updates.photo_path = photoPath;
    }

    if (cv) {
      const cvPath = `${candidate.id}/cv.pdf`;
      const { error } = await sb.storage.from('candidate-cvs').upload(cvPath, cv, {
        upsert: true,
        contentType: 'application/pdf',
        cacheControl: '3600'
      });
      if (error) throw error;
      updates.cv_path = cvPath;
    }

    if (Object.keys(updates).length) {
      const { error } = await sb.from('candidates').update(updates).eq('id', candidate.id);
      if (error) throw error;
    }
  }

  function candidatePayload() {
    return {
      full_name: byId('candidateName').value.trim(),
      nationality: byId('candidateNationality').value.trim(),
      age: Number(byId('candidateAge').value),
      profession: byId('candidateProfession').value.trim(),
      location_status: byId('candidateLocation').value,
      availability_status: byId('candidateStatus').value,
      salary_omr: byId('candidateSalary').value ? Number(byId('candidateSalary').value) : null,
      contract_period: byId('candidateContract').value.trim() || null,
      languages: parseLanguages(byId('candidateLanguages').value.trim()),
      skills: parseSkills(byId('candidateSkills').value.trim()),
      is_published: true
    };
  }

  function initCandidateForm() {
    const form = byId('candidateForm');
    form?.addEventListener('submit', async event => {
      event.preventDefault();
      const message = byId('candidateMessage');
      clearMessage(message);
      const submit = form.querySelector('button[type="submit"]');
      const editId = byId('candidateEditId').value || null;
      const photo = byId('candidatePhoto').files[0];
      const cv = byId('candidateCv').files[0];
      const fileError = validateFiles(photo, cv);
      if (fileError) {
        showMessage(message, fileError, 'error');
        return;
      }

      setBusy(submit, true, 'Saving...');

      try {
        let candidate;
        if (editId) {
          const { data, error } = await sb
            .from('candidates')
            .update(candidatePayload())
            .eq('id', editId)
            .select('*')
            .single();
          if (error) throw error;
          candidate = data;
        } else {
          const { data, error } = await sb
            .from('candidates')
            .insert(candidatePayload())
            .select('*')
            .single();
          if (error) throw error;
          candidate = data;
        }

        await uploadCandidateFiles(candidate, photo, cv);
        await loadCandidates();
        renderAll();
        closeModal('candidateModal');
      } catch (error) {
        console.error(error);
        showMessage(message, error.message || 'Unable to save candidate.', 'error');
      } finally {
        setBusy(submit, false);
      }
    });
  }

  async function getAccessToken() {
    const { data: { session } } = await sb.auth.getSession();
    return session?.access_token || null;
  }

  function initAdminForm() {
    const form = byId('adminForm');
    form?.addEventListener('submit', async event => {
      event.preventDefault();
      const message = byId('adminMessage');
      clearMessage(message);
      const email = byId('newAdminEmail').value.trim().toLowerCase();
      const password = byId('newAdminPassword').value;
      const confirmPassword = byId('newAdminConfirm').value;
      const submit = form.querySelector('button[type="submit"]');

      if (password !== confirmPassword) {
        showMessage(message, 'Passwords do not match.', 'error');
        return;
      }
      if (password.length < 8) {
        showMessage(message, 'Password must contain at least 8 characters.', 'error');
        return;
      }

      setBusy(submit, true, 'Creating...');
      try {
        const token = await getAccessToken();
        const response = await fetch('/api/create-superadmin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ email, password })
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || 'Unable to create superadmin.');
        form.reset();
        await loadAdmins();
        renderAll();
        closeModal('adminModal');
      } catch (error) {
        showMessage(message, `${error.message} If this is your first Vercel deployment, make sure the server-side Supabase environment variables are configured.`, 'error');
      } finally {
        setBusy(submit, false);
      }
    });
  }

  function initPasswordForm() {
    const form = byId('passwordForm');
    form?.addEventListener('submit', async event => {
      event.preventDefault();
      const message = byId('passwordMessage');
      clearMessage(message);
      const current = byId('currentPassword').value;
      const next = byId('newPassword').value;
      const confirm = byId('confirmPassword').value;
      const submit = form.querySelector('button[type="submit"]');

      if (next.length < 8) {
        showMessage(message, 'New password must be at least 8 characters.', 'error');
        return;
      }
      if (next !== confirm) {
        showMessage(message, 'New passwords do not match.', 'error');
        return;
      }

      setBusy(submit, true, 'Updating...');
      try {
        const email = state.user?.email;
        if (!email) throw new Error('Unable to determine the current account.');

        const { error: verifyError } = await sb.auth.signInWithPassword({ email, password: current });
        if (verifyError) throw new Error('Current password is incorrect.');

        const { error } = await sb.auth.updateUser({ password: next });
        if (error) throw error;
        form.reset();
        showMessage(message, 'Password updated successfully.', 'success');
      } catch (error) {
        showMessage(message, error.message || 'Unable to update password.', 'error');
      } finally {
        setBusy(submit, false);
      }
    });
  }

  function initLogout() {
    byId('logoutButton')?.addEventListener('click', async () => {
      await sb.auth.signOut();
      window.location.replace('admin-login.html');
    });
  }

  function initFilters() {
    ['candidateSearch','candidateLocationFilter','candidateStatusFilter'].forEach(id => {
      byId(id)?.addEventListener(id === 'candidateSearch' ? 'input' : 'change', renderCandidates);
    });
  }

  async function deleteCandidate(candidateId) {
    const c = state.candidates.find(candidate => candidate.id === candidateId);
    if (!c || !confirm(`Remove ${c.full_name} (${c.candidate_code})?`)) return;

    try {
      const pathsByBucket = [
        ['candidate-photos', c.photo_path],
        ['candidate-cvs', c.cv_path]
      ];
      for (const [bucket, path] of pathsByBucket) {
        if (path) await sb.storage.from(bucket).remove([path]);
      }

      const { error } = await sb.from('candidates').delete().eq('id', candidateId);
      if (error) throw error;
      await loadCandidates();
      renderAll();
    } catch (error) {
      alert(`Unable to remove candidate: ${error.message}`);
    }
  }

  async function deleteAdmin(adminId) {
    const admin = state.admins.find(a => a.id === adminId);
    if (!admin) return;
    if (admin.id === state.user?.id) {
      alert('You cannot remove the account you are currently signed in with.');
      return;
    }
    if (state.admins.length <= 1) {
      alert('At least one superadmin account must remain.');
      return;
    }
    if (!confirm(`Remove superadmin ${admin.email}?`)) return;

    try {
      const token = await getAccessToken();
      const response = await fetch('/api/delete-superadmin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId: adminId })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Unable to remove superadmin.');
      await loadAdmins();
      renderAll();
    } catch (error) {
      alert(`${error.message} If this is your first Vercel deployment, verify the server-side Supabase environment variables.`);
    }
  }

  function renderAll() {
    renderStats();
    renderCandidates();
    renderRecent();
    renderAdmins();
    if (window.lucide) lucide.createIcons();
  }

  function renderStats() {
    byId('statTotal').textContent = state.candidates.length;
    byId('statOman').textContent = state.candidates.filter(c => c.location_status === 'IN_OMAN').length;
    byId('statOverseas').textContent = state.candidates.filter(c => c.location_status === 'OVERSEAS').length;
    byId('statAdmins').textContent = state.admins.length;
  }

  function renderRecent() {
    const host = byId('recentCandidates');
    if (!host) return;
    const rows = state.candidates.slice(0, 5);
    if (!rows.length) {
      host.innerHTML = '<div class="empty-state"><p>No candidates added yet.</p></div>';
      return;
    }
    host.innerHTML = rows.map(c => `<div class="compact-candidate"><div class="candidate-mini-avatar">${escapeHtml((c.full_name || 'C').charAt(0))}</div><div><strong>${escapeHtml(c.full_name)}</strong><span>${escapeHtml(c.candidate_code)} · ${escapeHtml(c.nationality)} · ${escapeHtml(c.profession)}</span></div><span class="status-pill status-${escapeHtml(c.availability_status)}">${escapeHtml(c.availability_status)}</span></div>`).join('');
  }

  function renderCandidates() {
    const body = byId('candidateTableBody');
    if (!body) return;
    const q = (byId('candidateSearch')?.value || '').trim().toLowerCase();
    const location = byId('candidateLocationFilter')?.value || 'ALL';
    const status = byId('candidateStatusFilter')?.value || 'ALL';

    const filtered = state.candidates.filter(c => {
      const haystack = `${c.candidate_code} ${c.full_name} ${c.nationality} ${c.profession}`.toLowerCase();
      return (!q || haystack.includes(q)) &&
        (location === 'ALL' || c.location_status === location) &&
        (status === 'ALL' || c.availability_status === status);
    });

    if (!filtered.length) {
      body.innerHTML = '<tr><td colspan="6"><div class="empty-state">No candidate profiles match the current filters.</div></td></tr>';
      return;
    }

    body.innerHTML = filtered.map(c => `<tr>
      <td><div class="candidate-cell"><div class="candidate-mini-avatar">${escapeHtml((c.full_name || 'C').charAt(0))}</div><div><strong>${escapeHtml(c.full_name)}</strong><span>${escapeHtml(c.candidate_code)}</span></div></div></td>
      <td>${escapeHtml(c.nationality)} · ${escapeHtml(c.age)}</td>
      <td>${escapeHtml(c.profession)}</td>
      <td><span class="location-badge"><i data-lucide="${c.location_status === 'IN_OMAN' ? 'map-pin' : 'plane'}"></i>${c.location_status === 'IN_OMAN' ? 'In Oman' : 'Overseas'}</span></td>
      <td><span class="status-pill status-${escapeHtml(c.availability_status)}">${escapeHtml(c.availability_status)}</span></td>
      <td><div class="table-actions"><button class="icon-button" title="Edit" data-edit-candidate="${c.id}"><i data-lucide="pencil"></i></button><button class="icon-button danger" title="Remove" data-delete-candidate="${c.id}"><i data-lucide="trash-2"></i></button></div></td>
    </tr>`).join('');

    body.querySelectorAll('[data-edit-candidate]').forEach(btn => btn.addEventListener('click', () => openCandidateModal(btn.dataset.editCandidate)));
    body.querySelectorAll('[data-delete-candidate]').forEach(btn => btn.addEventListener('click', () => deleteCandidate(btn.dataset.deleteCandidate)));
    if (window.lucide) lucide.createIcons();
  }

  function renderAdmins() {
    const body = byId('adminTableBody');
    if (!body) return;
    if (!state.admins.length) {
      body.innerHTML = '<tr><td colspan="5"><div class="empty-state">No superadmins found.</div></td></tr>';
      return;
    }

    body.innerHTML = state.admins.map(a => `<tr>
      <td><strong>${escapeHtml(a.email)}</strong>${a.id === state.user?.id ? ' <span class="status-pill status-AVAILABLE">YOU</span>' : ''}</td>
      <td>Superadmin</td>
      <td>${formatDate(a.created_at)}</td>
      <td><span class="status-pill status-AVAILABLE">ACTIVE</span></td>
      <td><button class="icon-button danger" title="Remove" data-delete-admin="${a.id}" ${a.id === state.user?.id ? 'disabled' : ''}><i data-lucide="trash-2"></i></button></td>
    </tr>`).join('');

    body.querySelectorAll('[data-delete-admin]').forEach(btn => btn.addEventListener('click', () => deleteAdmin(btn.dataset.deleteAdmin)));
  }

  document.addEventListener('DOMContentLoaded', async () => {
    if (!sb) {
      console.error('Supabase client is not configured.');
      return;
    }
    initPasswordToggles();
    await initLogin();
    await initDashboard();
    if (window.lucide) lucide.createIcons();
  });
})();