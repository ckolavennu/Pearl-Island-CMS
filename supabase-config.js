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

  window.PEARL_ISLAND_SUPABASE = {
    url: SUPABASE_URL,
    publishableKey: SUPABASE_PUBLISHABLE_KEY
  };
  window.PEARL_ISLAND_WHATSAPP_NUMBER = WHATSAPP_NUMBER;
})();