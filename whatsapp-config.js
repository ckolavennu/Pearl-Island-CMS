(() => {
  const WHATSAPP_NUMBER = '96897297224';

  function updateWhatsAppLinks(root = document) {
    root.querySelectorAll?.('a[href*="wa.me/"]').forEach(link => {
      link.href = link.href.replace(/wa\.me\/\d+/, `wa.me/${WHATSAPP_NUMBER}`);
    });
  }

  updateWhatsAppLinks();

  const observer = new MutationObserver(() => updateWhatsAppLinks());
  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  }

  window.PEARL_ISLAND_WHATSAPP_NUMBER = WHATSAPP_NUMBER;
})();
