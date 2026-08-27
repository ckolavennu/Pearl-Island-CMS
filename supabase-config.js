(() => {
  const SUPABASE_URL = 'https://mrhigdoquocsftqaajwh.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_kBIdJ9rbChMEeI0n2bqSxg_mkehHjmM';

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

  window.PEARL_ISLAND_SUPABASE = {
    url: SUPABASE_URL,
    publishableKey: SUPABASE_PUBLISHABLE_KEY
  };
})();