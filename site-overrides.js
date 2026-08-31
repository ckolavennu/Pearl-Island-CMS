(() => {
  const ARABIC_HERO_TITLE = 'مكتب توظيف العمالة المنزلية';
  const CALL_NUMBER = '+968 7114 7179';
  const easternArabicDigits = /[٠-٩۰-۹]/g;
  const digitMap = {
    '٠':'0','١':'1','٢':'2','٣':'3','٤':'4','٥':'5','٦':'6','٧':'7','٨':'8','٩':'9',
    '۰':'0','۱':'1','۲':'2','۳':'3','۴':'4','۵':'5','۶':'6','۷':'7','۸':'8','۹':'9'
  };

  function isArabic() {
    return document.documentElement.lang === 'ar' ||
      localStorage.getItem('pearl-island-language') === 'ar';
  }

  function normalizeDigits(root) {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      if (easternArabicDigits.test(node.nodeValue || '')) {
        easternArabicDigits.lastIndex = 0;
        node.nodeValue = node.nodeValue.replace(easternArabicDigits, d => digitMap[d] || d);
      }
      easternArabicDigits.lastIndex = 0;
    });
  }

  function fixArabicCallButton() {
    const callButton = document.querySelector('.contact-buttons a[href^="tel:"]');
    if (!callButton || !isArabic()) return;

    const currentNumber = callButton.querySelector('.pearl-call-number')?.textContent?.trim();
    if (currentNumber === CALL_NUMBER) return;

    callButton.innerHTML = `
      <i data-lucide="phone"></i>
      <span class="pearl-call-number" dir="ltr">${CALL_NUMBER}</span>
    `;

    if (window.lucide) window.lucide.createIcons();
  }

  function applyArabicCustomizations() {
    if (!isArabic()) return;

    const hero = document.querySelector('.hero h1');
    if (hero && hero.textContent.trim() !== ARABIC_HERO_TITLE) {
      hero.textContent = ARABIC_HERO_TITLE;
    }

    fixArabicCallButton();

    // Keep customer-facing numbers in familiar 0-9 digits even when the UI is RTL.
    normalizeDigits(document.body);
  }

  function addBidiStyles() {
    if (document.getElementById('pearl-arabic-number-styles')) return;
    const style = document.createElement('style');
    style.id = 'pearl-arabic-number-styles';
    style.textContent = `
      html[dir="rtl"] a[href^="tel:"],
      html[dir="rtl"] a[href*="wa.me/"],
      html[dir="rtl"] .candidate-id,
      html[dir="rtl"] .panel-id,
      html[dir="rtl"] .detail-line strong,
      html[dir="rtl"] .pearl-call-number {
        direction: ltr;
        unicode-bidi: isolate;
      }

      html[dir="rtl"] .contact-buttons a[href^="tel:"] {
        direction: ltr;
      }
    `;
    document.head.appendChild(style);
  }

  addBidiStyles();
  window.addEventListener('pearl-language-change', () => setTimeout(applyArabicCustomizations, 0));
  document.addEventListener('DOMContentLoaded', applyArabicCustomizations);

  const observer = new MutationObserver(() => applyArabicCustomizations());
  if (document.documentElement) {
    observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  }

  setTimeout(applyArabicCustomizations, 0);
  setTimeout(applyArabicCustomizations, 300);
})();
