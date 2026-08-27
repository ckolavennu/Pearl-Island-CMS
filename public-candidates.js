(() => {
  const sb = window.supabaseClient;
  const candidateGrid = document.getElementById('candidateGrid');
  const panelContent = document.getElementById('panelContent');
  const panelEmpty = document.getElementById('panelEmpty');
  const panelClose = document.getElementById('panelClose');
  const candidatePanel = document.getElementById('candidatePanel');

  let candidates = [];
  let activeTab = 'oman';
  let selectedCandidate = null;

  const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  const displayStatus = value => String(value || '').toLowerCase().replace(/(^|_)([a-z])/g, (_, p, c) => `${p ? ' ' : ''}${c.toUpperCase()}`);
  const availabilityClass = status => String(status || '').toLowerCase().replace(/_/g, '-');

  function setPanelState(hasCandidate) {
    if (panelEmpty) {
      panelEmpty.hidden = hasCandidate;
      panelEmpty.style.display = hasCandidate ? 'none' : '';
    }
    if (panelContent) {
      panelContent.hidden = !hasCandidate;
      panelContent.style.display = hasCandidate ? '' : 'none';
    }
  }

  function photoUrl(candidate) {
    if (!candidate.photo_path) return 'assets/hero-worker.jpg';
    const { data } = sb.storage.from('candidate-photos').getPublicUrl(candidate.photo_path);
    return data?.publicUrl || 'assets/hero-worker.jpg';
  }

  function languagesList(candidate) {
    const languages = candidate.languages && typeof candidate.languages === 'object' ? candidate.languages : {};
    return Object.entries(languages).map(([name, level]) => `${name} — ${level}`);
  }

  function tabCandidates() {
    const wanted = activeTab === 'oman' ? 'IN_OMAN' : 'OVERSEAS';
    return candidates.filter(candidate => candidate.location_status === wanted);
  }

  function candidateCard(candidate) {
    const photo = photoUrl(candidate);
    return `
      <article class="candidate-card ${selectedCandidate?.id === candidate.id ? 'selected' : ''}">
        <div class="candidate-id">${escapeHtml(candidate.candidate_code)}</div>
        <img class="candidate-photo" src="${escapeHtml(photo)}" alt="${escapeHtml(candidate.full_name)}" onerror="this.src='assets/hero-worker.jpg'" />
        <h3>${escapeHtml(candidate.full_name)}</h3>
        <div class="candidate-meta">
          <span><i data-lucide="flag"></i>${escapeHtml(candidate.nationality)}</span>
          <span><i data-lucide="calendar-days"></i>${escapeHtml(candidate.age)} Years</span>
        </div>
        <div class="candidate-profession"><i data-lucide="briefcase-business"></i>${escapeHtml(candidate.profession)}</div>
        <span class="status-badge ${availabilityClass(candidate.availability_status)}">${escapeHtml(displayStatus(candidate.availability_status))}</span>
        <button class="details-btn" type="button" data-id="${escapeHtml(candidate.id)}">
          See More Details <i data-lucide="arrow-right"></i>
        </button>
      </article>`;
  }

  function renderCandidates() {
    const rows = tabCandidates();
    if (!rows.length) {
      candidateGrid.innerHTML = '<div class="panel-empty"><div class="panel-empty-icon"><i data-lucide="users"></i></div><h3>No candidates available</h3><p>Please check again later.</p></div>';
    } else {
      candidateGrid.innerHTML = rows.map(candidateCard).join('');
    }

    candidateGrid.querySelectorAll('.details-btn').forEach(btn => {
      btn.addEventListener('click', () => selectCandidate(btn.dataset.id));
    });
    if (window.lucide) lucide.createIcons();
  }

  function selectCandidate(id) {
    selectedCandidate = candidates.find(candidate => candidate.id === id);
    if (!selectedCandidate) return;

    const photo = photoUrl(selectedCandidate);
    const languages = languagesList(selectedCandidate);
    const skills = Array.isArray(selectedCandidate.skills) ? selectedCandidate.skills : [];
    const salary = selectedCandidate.salary_omr == null ? 'Contact us' : `${Number(selectedCandidate.salary_omr).toLocaleString('en')} OMR`;
    const contract = selectedCandidate.contract_period || 'Contact us';

    setPanelState(true);
    panelContent.innerHTML = `
      <div class="panel-id">${escapeHtml(selectedCandidate.candidate_code)}</div>
      <div class="panel-profile">
        <img src="${escapeHtml(photo)}" alt="${escapeHtml(selectedCandidate.full_name)}" onerror="this.src='assets/hero-worker.jpg'" />
        <div>
          <h3>${escapeHtml(selectedCandidate.full_name)}</h3>
          <p>${escapeHtml(selectedCandidate.nationality)} · ${escapeHtml(selectedCandidate.age)} Years</p>
          <p class="panel-profession"><i data-lucide="briefcase-business"></i>${escapeHtml(selectedCandidate.profession)}</p>
          <span class="status-badge ${availabilityClass(selectedCandidate.availability_status)}">${escapeHtml(displayStatus(selectedCandidate.availability_status))}</span>
        </div>
      </div>

      <div class="panel-details">
        <div class="detail-line">
          <span><i data-lucide="circle-dollar-sign"></i>Salary</span>
          <strong>${escapeHtml(salary)}</strong>
        </div>
        <div class="detail-line">
          <span><i data-lucide="calendar-range"></i>Contract Period</span>
          <strong>${escapeHtml(contract)}</strong>
        </div>
        <div class="detail-block">
          <div class="detail-title"><i data-lucide="languages"></i>Languages</div>
          ${languages.length ? `<ul>${languages.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : '<p>Contact us for language details.</p>'}
        </div>
        <div class="detail-block">
          <div class="detail-title"><i data-lucide="sparkles"></i>Skills</div>
          ${skills.length ? `<div class="skill-list">${skills.map(item => `<span>${escapeHtml(item)}</span>`).join('')}</div>` : '<p>Contact us for skill details.</p>'}
        </div>
      </div>

      <div class="panel-actions">
        <button class="cv-btn" id="downloadCvButton" type="button" ${selectedCandidate.cv_path ? '' : 'disabled aria-disabled="true"'}>
          <i data-lucide="download"></i> ${selectedCandidate.cv_path ? 'Download CV (PDF)' : 'CV Not Available'}
        </button>
        <a class="whatsapp-enquiry" target="_blank" rel="noreferrer"
           href="https://wa.me/96871147179?text=${encodeURIComponent(`Hello Pearl Island Manpower, I am interested in candidate ${selectedCandidate.candidate_code}, ${selectedCandidate.full_name}, ${selectedCandidate.profession} from ${selectedCandidate.nationality}. Please share more details.`)}">
          <i data-lucide="message-circle"></i> Enquire on WhatsApp
        </a>
      </div>`;

    document.getElementById('downloadCvButton')?.addEventListener('click', downloadSelectedCv);
    renderCandidates();
    if (window.lucide) lucide.createIcons();

    if (window.matchMedia('(max-width: 1100px)').matches) {
      candidatePanel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  async function downloadSelectedCv() {
    if (!selectedCandidate?.cv_path) return;
    const button = document.getElementById('downloadCvButton');
    const original = button.innerHTML;
    button.disabled = true;
    button.textContent = 'Preparing CV...';
    try {
      const response = await fetch(`/api/candidate-cv?code=${encodeURIComponent(selectedCandidate.candidate_code)}`);
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.url) throw new Error(result.error || 'CV download is unavailable right now.');
      window.open(result.url, '_blank', 'noopener');
    } catch (error) {
      alert(error.message);
    } finally {
      button.disabled = false;
      button.innerHTML = original;
      if (window.lucide) lucide.createIcons();
    }
  }

  document.querySelectorAll('.candidate-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      activeTab = tab.dataset.tab;
      selectedCandidate = null;
      document.querySelectorAll('.candidate-tab').forEach(btn => {
        const active = btn === tab;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      setPanelState(false);
      renderCandidates();
    });
  });

  panelClose?.addEventListener('click', () => {
    selectedCandidate = null;
    setPanelState(false);
    renderCandidates();
  });

  async function load() {
    setPanelState(false);
    candidateGrid.innerHTML = '<div class="panel-empty"><p>Loading candidates...</p></div>';
    const { data, error } = await sb
      .from('candidates')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      candidateGrid.innerHTML = '<div class="panel-empty"><h3>Unable to load candidates</h3><p>Please try again later.</p></div>';
      return;
    }
    candidates = data || [];
    renderCandidates();
  }

  if (sb) load();
  if (window.lucide) lucide.createIcons();
})();