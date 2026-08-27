export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed.' });

  const url = process.env.SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRole) return res.status(500).json({ error: 'Server Supabase environment variables are not configured.' });

  try {
    const code = String(req.query?.code || '').trim().toUpperCase();
    if (!code) return res.status(400).json({ error: 'Candidate code is required.' });

    const candidateResponse = await fetch(
      `${url}/rest/v1/candidates?candidate_code=eq.${encodeURIComponent(code)}&is_published=eq.true&select=cv_path&limit=1`,
      {
        headers: {
          apikey: serviceRole,
          Authorization: `Bearer ${serviceRole}`
        }
      }
    );
    if (!candidateResponse.ok) throw new Error('Unable to verify candidate.');
    const rows = await candidateResponse.json();
    if (!rows.length || !rows[0].cv_path) return res.status(404).json({ error: 'CV is not available for this candidate.' });

    const signResponse = await fetch(
      `${url}/storage/v1/object/sign/candidate-cvs/${rows[0].cv_path.split('/').map(encodeURIComponent).join('/')}`,
      {
        method: 'POST',
        headers: {
          apikey: serviceRole,
          Authorization: `Bearer ${serviceRole}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ expiresIn: 60 })
      }
    );
    const signed = await signResponse.json();
    if (!signResponse.ok) throw new Error(signed.message || signed.error || 'Unable to create CV download link.');

    const raw = signed.signedURL || signed.signedUrl || signed.url;
    if (!raw) throw new Error('Supabase did not return a signed URL.');
    const signedUrl = raw.startsWith('http') ? raw : `${url}/storage/v1${raw.startsWith('/') ? '' : '/'}${raw}`;

    return res.status(200).json({ url: signedUrl });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Unexpected server error.' });
  }
}