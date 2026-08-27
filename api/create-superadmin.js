const requiredEnv = () => {
  const url = process.env.SUPABASE_URL;
  const publishable = process.env.SUPABASE_PUBLISHABLE_KEY;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !publishable || !serviceRole) {
    throw new Error('Server Supabase environment variables are not configured.');
  }
  return { url, publishable, serviceRole };
};

async function verifyRequester(req, env) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) throw new Error('Missing authorization token.');

  const userResponse = await fetch(`${env.url}/auth/v1/user`, {
    headers: {
      apikey: env.publishable,
      Authorization: auth
    }
  });
  if (!userResponse.ok) throw new Error('Invalid session.');
  const user = await userResponse.json();

  const adminResponse = await fetch(
    `${env.url}/rest/v1/superadmins?id=eq.${encodeURIComponent(user.id)}&select=id`,
    {
      headers: {
        apikey: env.serviceRole,
        Authorization: `Bearer ${env.serviceRole}`
      }
    }
  );
  if (!adminResponse.ok) throw new Error('Unable to verify superadmin access.');
  const admins = await adminResponse.json();
  if (!admins.length) throw new Error('Superadmin access required.');
  return user;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });

  try {
    const env = requiredEnv();
    await verifyRequester(req, env);

    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    if (!email || !email.includes('@')) return res.status(400).json({ error: 'A valid email address is required.' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });

    const createResponse = await fetch(`${env.url}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        apikey: env.serviceRole,
        Authorization: `Bearer ${env.serviceRole}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password, email_confirm: true })
    });

    const created = await createResponse.json();
    if (!createResponse.ok) {
      return res.status(createResponse.status).json({ error: created.msg || created.message || created.error || 'Unable to create authentication account.' });
    }

    const userId = created.id || created.user?.id;
    if (!userId) throw new Error('Supabase did not return a user ID.');

    const profileResponse = await fetch(`${env.url}/rest/v1/superadmins`, {
      method: 'POST',
      headers: {
        apikey: env.serviceRole,
        Authorization: `Bearer ${env.serviceRole}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      },
      body: JSON.stringify({ id: userId, email, full_name: 'Super Administrator' })
    });

    if (!profileResponse.ok) {
      await fetch(`${env.url}/auth/v1/admin/users/${encodeURIComponent(userId)}`, {
        method: 'DELETE',
        headers: {
          apikey: env.serviceRole,
          Authorization: `Bearer ${env.serviceRole}`
        }
      });
      const detail = await profileResponse.text();
      throw new Error(detail || 'Unable to create superadmin profile.');
    }

    return res.status(201).json({ id: userId, email });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Unexpected server error.' });
  }
}