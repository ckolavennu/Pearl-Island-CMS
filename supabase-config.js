(() => {
  const SUPABASE_URL = 'https://mrhigdoquocsftqaajwh.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_kBIdJ9rbChMEeI0n2bqSxg_mkehHjmM';
  const WHATSAPP_NUMBER = '96897297224';

  if (!window.supabase) {
    throw new Error('Supabase JS failed to load.');
  }

  window.supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
  );

  function updateWhatsAppLinks(root = document) {
    root.querySelectorAll?.('a[href*="wa.me/"]').forEach(link => {
      link.href = link.href.replace(/wa\.me\/\d+/, `wa.me/${WHATSAPP_NUMBER}`);
    });
  }

  updateWhatsAppLinks();
  if (document.body) {
    new MutationObserver(() => updateWhatsAppLinks())
      .observe(document.body, { childList: true, subtree: true });
  }

  // Handle CV downloads at the document capture phase so mobile browsers do not
  // block the navigation as an async popup. The API returns a short-lived signed
  // URL with Supabase's `download` parameter, so navigation starts a real download.
  document.addEventListener('click', async event => {
    const button = event.target.closest?.('#downloadCvButton');
    if (!button || button.disabled) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    const code = document.querySelector('.panel-id')?.textContent?.trim();
    if (!code) {
      alert('Unable to determine the candidate CV.');
      return;
    }

    const originalHtml = button.innerHTML;
    button.disabled = true;
    button.textContent = document.documentElement.lang === 'ar'
      ? 'جارٍ تجهيز السيرة الذاتية...'
      : 'Preparing CV...';

    try {
      const response = await fetch(`/api/candidate-cv?code=${encodeURIComponent(code)}`, {
        method: 'GET',
        cache: 'no-store'
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.url) {
        throw new Error(result.error || 'CV download is unavailable right now.');
      }

      // Same-tab navigation is intentionally used here. Unlike window.open()
      // after an awaited request, it is not blocked by mobile popup protection.
      window.location.assign(result.url);
    } catch (error) {
      alert(error.message || 'CV download is unavailable right now.');
    } finally {
      button.disabled = false;
      button.innerHTML = originalHtml;
      if (window.lucide) window.lucide.createIcons();
    }
  }, true);

  window.PEARL_ISLAND_SUPABASE = {
    url: SUPABASE_URL,
    publishableKey: SUPABASE_PUBLISHABLE_KEY
  };
  window.PEARL_ISLAND_WHATSAPP_NUMBER = WHATSAPP_NUMBER;
})();