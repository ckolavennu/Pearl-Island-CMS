(() => {
  function loadI18nAndStart() {
    if (window.PearlI18n) return start();
    const script = document.createElement('script');
    script.src = 'i18n.js';
    script.onload = start;
    script.onerror = start;
    document.head.appendChild(script);
  }

  function start() {
    const sb = window.supabaseClient;
    const candidateGrid = document.getElementById('candidateGrid');
    const panelContent = document.getElementById('panelContent');
    const panelEmpty = document.getElementById('panelEmpty');
    const panelClose = document.getElementById('panelClose');
    const candidatePanel = document.getElementById('candidatePanel');

    let candidates = [];
    let activeTab = 'oman';
    let selectedCandidate = null;

    const I = () => window.PearlI18n;
    const t = key => I()?.t(key) || key;
    const mapped = (group, value) => I()?.mapValue(group, value) || value;
    const isArabic = () => I()?.language === 'ar';
    const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
    const availabilityClass = status => String(status || '').toLowerCase().replace(/_/g, '-');

    function statusText(status) {
      const key = String(status || '').toLowerCase();
      return t(key) !== key ? t(key) : String(status || '').replace(/_/g, ' ');
    }

    function restoreStaticIcons() {
      const set = (selector, icon, label) => {
        const el = document.querySelector(selector);
        if (el) el.innerHTML = `<i data-lucide="${icon}"></i> ${label}`;
      };
      set('.btn-primary .btn-left', 'users', t('viewCandidates'));
      set('.contact-actions .whatsapp', 'message-circle', t('whatsappUs'));
      set('.contact-actions .call', 'phone', t('callUs'));
      set('.contact-buttons .whatsapp-fill', 'message-circle', t('whatsappUs'));
      set('.contact-buttons a[href^="tel:"]', 'phone', t('callNumber'));
      set('.contact-buttons a[href^="mailto:"]', 'mail', t('emailUs'));
      set('.candidate-tab[data-tab="oman"]', 'map-pin', t('inOman'));
      set('.candidate-tab[data-tab="overseas"]', 'globe-2', t('overseas'));
      if (window.lucide) window.lucide.createIcons();
    }

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
      return Object.entries(languages).map(([name, level]) => `${mapped('language', name)} — ${mapped('level', level)}`);
    }

    function translatedContract(value) {
      if (!value) return t('contactUsValue');
      if (!isArabic()) return value;
      return String(value)
        .replace(/\b(\d+)\s*Years?\b/gi, '$1 سنة')
        .replace(/\b(\d+)\s*Months?\b/gi, '$1 شهر');
    }

    function salaryText(value) {
      if (value == null) return t('contactUsValue');
      const number = Number(value).toLocaleString(isArabic() ? 'ar-OM' : 'en');
      return isArabic() ? `${number} ريال عماني` : `${number} OMR`;
    }

    function tabCandidates() {
      const wanted = activeTab === 'oman' ? 'IN_OMAN' : 'OVERSEAS';
      return candidates.filter(candidate => candidate.location_status === wanted);
    }

    function candidateCard(candidate) {
      const photo = photoUrl(candidate);
      const nationality = mapped('nationality', candidate.nationality);
      const profession = mapped('profession', candidate.profession);
      return `
        <article class="candidate-card ${selectedCandidate?.id === candidate.id ? 'selected' : ''}">
          <div class="candidate-id">${escapeHtml(candidate.candidate_code)}</div>
          <img class="candidate-photo" src="${escapeHtml(photo)}" alt="${escapeHtml(candidate.full_name)}" onerror="this.src='assets/hero-worker.jpg'" />
          <h3>${escapeHtml(candidate.full_name)}</h3>
          <div class="candidate-meta">
            <span><i data-lucide="flag"></i>${escapeHtml(nationality)}</span>
            <span><i data-lucide="calendar-days"></i>${escapeHtml(candidate.age)} ${escapeHtml(t('years'))}</span>
          </div>
          <div class="candidate-profession"><i data-lucide="briefcase-business"></i>${escapeHtml(profession)}</div>
          <span class="status-badge ${availabilityClass(candidate.availability_status)}">${escapeHtml(statusText(candidate.availability_status))}</span>
          <button class="details-btn" type="button" data-id="${escapeHtml(candidate.id)}">
            ${escapeHtml(t('seeMore'))} <i data-lucide="arrow-right"></i>
          </button>
        </article>`;
    }

    function renderCandidates() {
      if (!candidateGrid) return;
      const rows = tabCandidates();
      if (!rows.length) {
        candidateGrid.innerHTML = `<div class="panel-empty"><div class="panel-empty-icon"><i data-lucide="users"></i></div><h3>${escapeHtml(t('noCandidates'))}</h3><p>${escapeHtml(t('checkLater'))}</p></div>`;
      } else {
        candidateGrid.innerHTML = rows.map(candidateCard).join('');
      }

      candidateGrid.querySelectorAll('.details-btn').forEach(btn => {
        btn.addEventListener('click', () => selectCandidate(btn.dataset.id, true));
      });
      if (window.lucide) window.lucide.createIcons();
    }

    function candidateWhatsappText(candidate) {
      if (isArabic()) {
        return `مرحباً بيرل آيلاند للقوى العاملة، أنا مهتم بالمرشح ${candidate.candidate_code}، ${candidate.full_name}، ${mapped('profession', candidate.profession)} من ${mapped('nationality', candidate.nationality)}. يرجى تزويدي بمزيد من التفاصيل.`;
      }
      return `Hello Pearl Island Manpower, I am interested in candidate ${candidate.candidate_code}, ${candidate.full_name}, ${candidate.profession} from ${candidate.nationality}. Please share more details.`;
    }

    function renderSelectedCandidate(shouldScroll = false) {
      if (!selectedCandidate || !panelContent) return;

      const photo = photoUrl(selectedCandidate);
      const languages = languagesList(selectedCandidate);
      const skills = Array.isArray(selectedCandidate.skills) ? selectedCandidate.skills.map(skill => mapped('skill', skill)) : [];
      const nationality = mapped('nationality', selectedCandidate.nationality);
      const profession = mapped('profession', selectedCandidate.profession);

      setPanelState(true);
      panelContent.innerHTML = `
        <div class="panel-id">${escapeHtml(selectedCandidate.candidate_code)}</div>
        <div class="panel-profile">
          <img src="${escapeHtml(photo)}" alt="${escapeHtml(selectedCandidate.full_name)}" onerror="this.src='assets/hero-worker.jpg'" />
          <div>
            <h3>${escapeHtml(selectedCandidate.full_name)}</h3>
            <p>${escapeHtml(nationality)} · ${escapeHtml(selectedCandidate.age)} ${escapeHtml(t('years'))}</p>
            <p class="panel-profession"><i data-lucide="briefcase-business"></i>${escapeHtml(profession)}</p>
            <span class="status-badge ${availabilityClass(selectedCandidate.availability_status)}">${escapeHtml(statusText(selectedCandidate.availability_status))}</span>
          </div>
        </div>

        <div class="panel-details">
          <div class="detail-line">
            <span><i data-lucide="circle-dollar-sign"></i>${escapeHtml(t('salary'))}</span>
            <strong>${escapeHtml(salaryText(selectedCandidate.salary_omr))}</strong>
          </div>
          <div class="detail-line">
            <span><i data-lucide="calendar-range"></i>${escapeHtml(t('contractPeriod'))}</span>
            <strong>${escapeHtml(translatedContract(selectedCandidate.contract_period))}</strong>
          </div>
          <div class="detail-block">
            <div class="detail-title"><i data-lucide="languages"></i>${escapeHtml(t('languages'))}</div>
            ${languages.length ? `<ul>${languages.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : `<p>${escapeHtml(t('languageDetails'))}</p>`}
          </div>
          <div class="detail-block">
            <div class="detail-title"><i data-lucide="sparkles"></i>${escapeHtml(t('skills'))}</div>
            ${skills.length ? `<div class="skill-list">${skills.map(item => `<span>${escapeHtml(item)}</span>`).join('')}</div>` : `<p>${escapeHtml(t('skillDetails'))}</p>`}
          </div>
        </div>

        <div class="panel-actions">
          <button class="cv-btn" id="downloadCvButton" type="button" ${selectedCandidate.cv_path ? '' : 'disabled aria-disabled="true"'}>
            <i data-lucide="download"></i> ${escapeHtml(selectedCandidate.cv_path ? t('downloadCv') : t('cvUnavailable'))}
          </button>
          <a class="whatsapp-enquiry" target="_blank" rel="noreferrer"
             href="https://wa.me/96871147179?text=${encodeURIComponent(candidateWhatsappText(selectedCandidate))}">
            <i data-lucide="message-circle"></i> ${escapeHtml(t('enquireWhatsapp'))}
          </a>
        </div>`;

      document.getElementById('downloadCvButton')?.addEventListener('click', downloadSelectedCv);
      renderCandidates();
      if (window.lucide) window.lucide.createIcons();

      if (shouldScroll && window.matchMedia('(max-width: 1100px)').matches) {
        candidatePanel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    function selectCandidate(id, shouldScroll = false) {
      selectedCandidate = candidates.find(candidate => candidate.id === id);
      if (!selectedCandidate) return;
      renderSelectedCandidate(shouldScroll);
    }

    async function downloadSelectedCv() {
      if (!selectedCandidate?.cv_path) return;
      const button = document.getElementById('downloadCvButton');
      const original = button.innerHTML;
      button.disabled = true;
      button.textContent = t('preparingCv');
      try {
        const response = await fetch(`/api/candidate-cv?code=${encodeURIComponent(selectedCandidate.candidate_code)}`);
        const result = await response.json().catch(() => ({}));
        if (!response.ok || !result.url) throw new Error(result.error || t('cvDownloadUnavailable'));
        window.open(result.url, '_blank', 'noopener');
      } catch (error) {
        alert(error.message);
      } finally {
        button.disabled = false;
        button.innerHTML = original;
        if (window.lucide) window.lucide.createIcons();
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

    window.addEventListener('pearl-language-change', () => {
      restoreStaticIcons();
      if (selectedCandidate) renderSelectedCandidate(false);
      else {
        setPanelState(false);
        renderCandidates();
      }
    });

    async function load() {
      restoreStaticIcons();
      setPanelState(false);
      if (!candidateGrid || !sb) return;
      candidateGrid.innerHTML = `<div class="panel-empty"><p>${escapeHtml(t('loadingCandidates'))}</p></div>`;
      const { data, error } = await sb
        .from('candidates')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error(error);
        candidateGrid.innerHTML = `<div class="panel-empty"><h3>${escapeHtml(t('unableLoad'))}</h3><p>${escapeHtml(t('tryAgain'))}</p></div>`;
        return;
      }
      candidates = data || [];
      renderCandidates();
    }

    load();
    if (window.lucide) window.lucide.createIcons();
  }

  loadI18nAndStart();
})();