(() => {
  const STORAGE_KEY = 'pearl-island-language';

  const copy = {
    en: {
      home: 'Home',
      candidates: 'Our Candidates',
      login: 'Login',
      language: 'English',
      heroTitle: 'Trusted Housemaid &<br>Domestic Worker<br>Recruitment in Oman',
      heroText: 'Pearl Island Manpower provides reliable, trained and experienced domestic workers to homes across Oman. We are committed to quality service and customer satisfaction.',
      trustedTitle: 'Trusted & Reliable',
      trustedText: 'Verified candidates<br>with complete support',
      professionalTitle: 'Professional Service',
      professionalText: 'Helping families find the<br>right domestic help',
      viewCandidates: 'VIEW OUR CANDIDATES',
      whatsappUs: 'WHATSAPP US',
      callUs: 'CALL US',
      qualityTitle: 'Quality Domestic Workers',
      qualityText: 'Care you can trust,<br>help you can rely on.',
      whyTitle: 'WHY CHOOSE PEARL ISLAND MANPOWER?',
      verifiedTitle: 'Verified Candidates',
      verifiedText: 'All candidates are<br>screened and verified',
      experiencedTitle: 'Experienced Workers',
      experiencedText: 'Trained and experienced<br>workers for your home',
      supportTitle: 'Reliable Support',
      supportText: 'We support you before<br>and after placement',
      safeTitle: 'Safe & Secure',
      safeText: 'Your satisfaction and<br>safety are our priority',
      contactUs: 'CONTACT US',
      address: 'Floor 3, Office 32, Modern Tower<br>Burger Garage Building, Souq, Al Khoudh St<br>Seeb 112, Oman',
      callNumber: 'CALL +968 7114 7179',
      emailUs: 'EMAIL US',
      workingHours: 'WORKING HOURS',
      open: 'Open',
      closes: 'Closes 9 pm',
      eyebrowCandidates: 'OUR CANDIDATES',
      candidateHeading: 'Find the right helper for your home',
      candidateIntro: 'Browse candidates currently in Oman or available for overseas recruitment.',
      inOman: 'In Oman',
      overseas: 'Overseas',
      selectCandidate: 'Select a candidate',
      selectCandidateText: 'Choose “See More Details” to view salary, contract period, languages, skills and CV options.',
      footer: '© 2026 Pearl Island Manpower. All Rights Reserved.',
      years: 'Years',
      available: 'Available',
      reserved: 'Reserved',
      processing: 'Processing',
      unavailable: 'Unavailable',
      seeMore: 'See More Details',
      noCandidates: 'No candidates available',
      checkLater: 'Please check again later.',
      loadingCandidates: 'Loading candidates...',
      unableLoad: 'Unable to load candidates',
      tryAgain: 'Please try again later.',
      salary: 'Salary',
      contractPeriod: 'Contract Period',
      languages: 'Languages',
      skills: 'Skills',
      contactUsValue: 'Contact us',
      languageDetails: 'Contact us for language details.',
      skillDetails: 'Contact us for skill details.',
      downloadCv: 'Download CV (PDF)',
      cvUnavailable: 'CV Not Available',
      enquireWhatsapp: 'Enquire on WhatsApp',
      preparingCv: 'Preparing CV...',
      cvDownloadUnavailable: 'CV download is unavailable right now.',
      whatsappServiceMessage: 'Hello I am interested in your services'
    },
    ar: {
      home: 'الرئيسية',
      candidates: 'المرشحون',
      login: 'تسجيل الدخول',
      language: 'العربية',
      heroTitle: 'استقدام موثوق للعاملات<br>والعمالة المنزلية<br>في سلطنة عمان',
      heroText: 'توفر بيرل آيلاند للقوى العاملة عمالة منزلية موثوقة ومدربة وذات خبرة للأسر في جميع أنحاء سلطنة عمان. نحن ملتزمون بجودة الخدمة ورضا العملاء.',
      trustedTitle: 'موثوقون ويمكن الاعتماد علينا',
      trustedText: 'مرشحون موثوقون<br>مع دعم متكامل',
      professionalTitle: 'خدمة احترافية',
      professionalText: 'نساعد الأسر في العثور على<br>العمالة المنزلية المناسبة',
      viewCandidates: 'عرض المرشحين',
      whatsappUs: 'تواصل عبر واتساب',
      callUs: 'اتصل بنا',
      qualityTitle: 'عمالة منزلية متميزة',
      qualityText: 'رعاية يمكنك الوثوق بها،<br>ومساعدة يمكنك الاعتماد عليها.',
      whyTitle: 'لماذا تختار بيرل آيلاند للقوى العاملة؟',
      verifiedTitle: 'مرشحون موثوقون',
      verifiedText: 'يتم فحص جميع المرشحين<br>والتحقق منهم',
      experiencedTitle: 'عمالة ذات خبرة',
      experiencedText: 'عمالة مدربة وذات خبرة<br>لمنزلك',
      supportTitle: 'دعم موثوق',
      supportText: 'ندعمك قبل التوظيف<br>وبعده',
      safeTitle: 'آمن وموثوق',
      safeText: 'رضاك وسلامتك<br>من أولوياتنا',
      contactUs: 'تواصل معنا',
      address: 'الطابق الثالث، مكتب 32، البرج الحديث<br>مبنى برجر جراج، السوق، شارع الخوض<br>السيب 112، سلطنة عمان',
      callNumber: 'اتصل +968 7114 7179',
      emailUs: 'راسلنا بالبريد الإلكتروني',
      workingHours: 'ساعات العمل',
      open: 'مفتوح',
      closes: 'يغلق الساعة 9 مساءً',
      eyebrowCandidates: 'المرشحون',
      candidateHeading: 'اعثر على العاملة المناسبة لمنزلك',
      candidateIntro: 'تصفح المرشحين الموجودين حالياً في عمان أو المتاحين للاستقدام من الخارج.',
      inOman: 'داخل عمان',
      overseas: 'خارج عمان',
      selectCandidate: 'اختر مرشحاً',
      selectCandidateText: 'اختر «عرض المزيد من التفاصيل» للاطلاع على الراتب ومدة العقد واللغات والمهارات وخيارات السيرة الذاتية.',
      footer: '© 2026 بيرل آيلاند للقوى العاملة. جميع الحقوق محفوظة.',
      years: 'سنة',
      available: 'متاح',
      reserved: 'محجوز',
      processing: 'قيد الإجراءات',
      unavailable: 'غير متاح',
      seeMore: 'عرض المزيد من التفاصيل',
      noCandidates: 'لا يوجد مرشحون متاحون',
      checkLater: 'يرجى التحقق مرة أخرى لاحقاً.',
      loadingCandidates: 'جارٍ تحميل المرشحين...',
      unableLoad: 'تعذر تحميل المرشحين',
      tryAgain: 'يرجى المحاولة مرة أخرى لاحقاً.',
      salary: 'الراتب',
      contractPeriod: 'مدة العقد',
      languages: 'اللغات',
      skills: 'المهارات',
      contactUsValue: 'تواصل معنا',
      languageDetails: 'تواصل معنا لمعرفة تفاصيل اللغات.',
      skillDetails: 'تواصل معنا لمعرفة تفاصيل المهارات.',
      downloadCv: 'تحميل السيرة الذاتية (PDF)',
      cvUnavailable: 'السيرة الذاتية غير متاحة',
      enquireWhatsapp: 'استفسر عبر واتساب',
      preparingCv: 'جارٍ تجهيز السيرة الذاتية...',
      cvDownloadUnavailable: 'تحميل السيرة الذاتية غير متاح حالياً.',
      whatsappServiceMessage: 'مرحباً، أنا مهتم بخدماتكم'
    }
  };

  const valueMaps = {
    ar: {
      nationality: {
        'Sri Lankan': 'سريلانكية', 'Sri Lanka': 'سريلانكية', 'Nepalese': 'نيبالية', 'Nepal': 'نيبالية',
        'Indian': 'هندية', 'India': 'هندية', 'Indonesian': 'إندونيسية', 'Indonesia': 'إندونيسية',
        'Filipino': 'فلبينية', 'Philippines': 'فلبينية', 'Ethiopian': 'إثيوبية', 'Ethiopia': 'إثيوبية',
        'Bangladeshi': 'بنغلاديشية', 'Bangladesh': 'بنغلاديشية', 'Ugandan': 'أوغندية', 'Uganda': 'أوغندية',
        'Kenyan': 'كينية', 'Kenya': 'كينية', 'Ghanaian': 'غانية', 'Ghana': 'غانية'
      },
      profession: {
        'Housemaid': 'عاملة منزلية', 'House Maid': 'عاملة منزلية', 'Domestic Worker': 'عاملة منزلية',
        'Nanny': 'مربية أطفال', 'Caregiver': 'مقدمة رعاية', 'Cook': 'طباخة', 'Cleaner': 'عاملة نظافة'
      },
      skill: {
        'Baby Care': 'رعاية الأطفال', 'Cleaning': 'التنظيف', 'Washing': 'الغسيل', 'Ironing': 'الكي',
        'Basic Cooking': 'الطبخ الأساسي', 'Cooking': 'الطبخ', 'Elderly Care': 'رعاية كبار السن',
        'Child Care': 'رعاية الأطفال'
      },
      language: { 'Arabic': 'العربية', 'English': 'الإنجليزية', 'Hindi': 'الهندية', 'Malayalam': 'المالايالامية', 'Tamil': 'التاميلية' },
      level: { 'Basic': 'أساسي', 'Moderate': 'متوسط', 'Good': 'جيد', 'Very Good': 'جيد جداً', 'Fluent': 'بطلاقة', 'Excellent': 'ممتاز' }
    }
  };

  let language = localStorage.getItem(STORAGE_KEY) === 'ar' ? 'ar' : 'en';
  const t = key => (copy[language] && copy[language][key]) || copy.en[key] || key;
  const mapValue = (group, value) => {
    if (language !== 'ar') return value;
    return valueMaps.ar[group]?.[String(value || '').trim()] || value;
  };

  const setHtml = (selector, value) => {
    const el = document.querySelector(selector);
    if (el) el.innerHTML = value;
  };
  const setText = (selector, value) => {
    const el = document.querySelector(selector);
    if (el) el.textContent = value;
  };

  function translateStatic() {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.body.classList.toggle('is-arabic', language === 'ar');

    setText('.main-nav a[href="#home"]', t('home'));
    setText('.main-nav a[href="#candidates"]', t('candidates'));
    setText('.home-admin-btn span', t('login'));
    setHtml('.hero h1', t('heroTitle'));
    setText('.hero-text', t('heroText'));
    setText('.mini-benefit:nth-child(1) strong', t('trustedTitle'));
    setHtml('.mini-benefit:nth-child(1) span', t('trustedText'));
    setText('.mini-benefit:nth-child(2) strong', t('professionalTitle'));
    setHtml('.mini-benefit:nth-child(2) span', t('professionalText'));
    setText('.btn-primary .btn-left', t('viewCandidates'));
    setText('.contact-actions .whatsapp', t('whatsappUs'));
    setText('.contact-actions .call', t('callUs'));
    setText('.quality-card strong', t('qualityTitle'));
    setHtml('.quality-card p', t('qualityText'));
    setText('.why .section-heading h2', t('whyTitle'));
    setText('.why-card:nth-child(1) h3', t('verifiedTitle'));
    setHtml('.why-card:nth-child(1) p', t('verifiedText'));
    setText('.why-card:nth-child(2) h3', t('experiencedTitle'));
    setHtml('.why-card:nth-child(2) p', t('experiencedText'));
    setText('.why-card:nth-child(3) h3', t('supportTitle'));
    setHtml('.why-card:nth-child(3) p', t('supportText'));
    setText('.why-card:nth-child(4) h3', t('safeTitle'));
    setHtml('.why-card:nth-child(4) p', t('safeText'));
    setText('.contact-section .section-heading h2', t('contactUs'));
    setHtml('.contact-details .contact-row:first-child div', t('address'));
    setText('.contact-buttons .whatsapp-fill', t('whatsappUs'));
    setText('.contact-buttons a[href^="tel:"]', t('callNumber'));
    setText('.contact-buttons a[href^="mailto:"]', t('emailUs'));
    setText('.hours strong', t('workingHours'));
    setText('.hours .open', t('open'));
    const hourSpans = document.querySelectorAll('.hours > span');
    if (hourSpans[2]) hourSpans[2].textContent = t('closes');
    setText('.candidates-header .eyebrow', t('eyebrowCandidates'));
    setText('.candidates-header h2', t('candidateHeading'));
    setText('.candidates-intro', t('candidateIntro'));
    setText('.candidate-tab[data-tab="oman"]', t('inOman'));
    setText('.candidate-tab[data-tab="overseas"]', t('overseas'));
    setText('#panelEmpty h3', t('selectCandidate'));
    setText('#panelEmpty p', t('selectCandidateText'));
    setText('footer', t('footer'));

    const serviceText = encodeURIComponent(t('whatsappServiceMessage'));
    document.querySelectorAll('a[href*="wa.me/"]').forEach(link => {
      if (link.classList.contains('whatsapp-enquiry')) return;
      const match = link.href.match(/wa\.me\/(\d+)/);
      if (match) link.href = `https://wa.me/${match[1]}?text=${serviceText}`;
    });

    updateLanguageButton();
    if (window.lucide) window.lucide.createIcons();
  }

  function updateLanguageButton() {
    const label = document.querySelector('.language-btn > span');
    if (label) label.textContent = t('language');
    document.querySelectorAll('.language-option').forEach(option => {
      option.classList.toggle('active', option.dataset.language === language);
    });
  }

  function installMenu() {
    const button = document.querySelector('.language-btn');
    if (!button || button.dataset.ready === 'true') return;
    button.dataset.ready = 'true';
    button.setAttribute('aria-haspopup', 'menu');
    button.setAttribute('aria-expanded', 'false');

    const wrapper = document.createElement('div');
    wrapper.className = 'language-switcher';
    button.parentNode.insertBefore(wrapper, button);
    wrapper.appendChild(button);

    const menu = document.createElement('div');
    menu.className = 'language-menu';
    menu.setAttribute('role', 'menu');
    menu.innerHTML = `
      <button type="button" class="language-option" data-language="en" role="menuitem">English</button>
      <button type="button" class="language-option" data-language="ar" role="menuitem">العربية</button>`;
    wrapper.appendChild(menu);

    button.addEventListener('click', event => {
      event.stopPropagation();
      const open = wrapper.classList.toggle('open');
      button.setAttribute('aria-expanded', String(open));
    });

    menu.querySelectorAll('.language-option').forEach(option => {
      option.addEventListener('click', () => setLanguage(option.dataset.language));
    });

    document.addEventListener('click', () => {
      wrapper.classList.remove('open');
      button.setAttribute('aria-expanded', 'false');
    });
  }

  function installStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .language-switcher{position:relative}
      .language-menu{display:none;position:absolute;top:calc(100% + 8px);right:0;min-width:142px;background:#fff;border:1px solid #dfe3ea;border-radius:10px;padding:6px;box-shadow:0 12px 30px rgba(13,46,99,.14);z-index:80}
      .language-switcher.open .language-menu{display:grid}
      .language-option{border:0;background:transparent;border-radius:7px;padding:10px 12px;text-align:left;color:#25334b;font-weight:700;cursor:pointer}
      .language-option:hover,.language-option.active{background:#f0f5fb;color:#0d2e63}
      html[dir="rtl"] body{font-family:Tahoma,Arial,sans-serif}
      html[dir="rtl"] .language-menu{right:auto;left:0}
      html[dir="rtl"] .language-option{text-align:right}
      html[dir="rtl"] .hero-copy,html[dir="rtl"] .candidate-card,html[dir="rtl"] .candidate-panel,html[dir="rtl"] .candidates-header,html[dir="rtl"] .contact-details{text-align:right}
      html[dir="rtl"] .candidate-id{align-self:flex-end}
      html[dir="rtl"] .btn-wide>svg,html[dir="rtl"] .details-btn svg{transform:scaleX(-1)}
      html[dir="rtl"] .contact-row{grid-template-columns:1fr 34px}
      html[dir="rtl"] .contact-row>svg{grid-column:2;grid-row:1}
      html[dir="rtl"] .contact-row>div,html[dir="rtl"] .contact-row>a{grid-column:1;grid-row:1}
      html[dir="rtl"] a[href^="tel:"],html[dir="rtl"] a[href^="mailto:"]{direction:ltr;unicode-bidi:isolate}
      html[dir="rtl"] .panel-close{right:auto;left:16px}
      html[dir="rtl"] .panel-profile,html[dir="rtl"] .candidate-meta,html[dir="rtl"] .candidate-profession,html[dir="rtl"] .detail-title,html[dir="rtl"] .detail-line span{direction:rtl}
      html[dir="rtl"] .detail-block ul{margin:12px 28px 0 0}
      html[dir="rtl"] .skill-list{justify-content:flex-start}
      @media(max-width:560px){.language-menu{min-width:125px}}
    `;
    document.head.appendChild(style);
  }

  function setLanguage(nextLanguage) {
    language = nextLanguage === 'ar' ? 'ar' : 'en';
    localStorage.setItem(STORAGE_KEY, language);
    translateStatic();
    document.querySelector('.language-switcher')?.classList.remove('open');
    document.querySelector('.language-btn')?.setAttribute('aria-expanded', 'false');
    window.dispatchEvent(new CustomEvent('pearl-language-change', { detail: { language } }));
  }

  window.PearlI18n = {
    t,
    mapValue,
    setLanguage,
    get language() { return language; }
  };

  installStyles();
  installMenu();
  translateStatic();
})();