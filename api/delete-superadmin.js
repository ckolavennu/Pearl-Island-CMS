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
        apikey: env.serviceRole
      }
    }
  );
  if (!adminResponse.ok) {
    const detail = await adminResponse.text().catch(() => '');
    throw new Error(detail || 'Unable to verify superadmin access.');
  }
  const admins = await adminResponse.json();
  if (!admins.length) throw new Error('Superadmin access required.');
  return user;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });

  try {
    const env = requiredEnv();
    const requester = await verifyRequester(req, env);
    const userId = String(req.body?.userId || '').trim();
    if (!userId) return res.status(400).json({ error: 'User ID is required.' });
    if (userId === requester.id) return res.status(400).json({ error: 'You cannot remove the account you are currently signed in with.' });

    const listResponse = await fetch(`${env.url}/rest/v1/superadmins?select=id`, {
      headers: {
        apikey: env.serviceRole
      }
    });
    if (!listResponse.ok) throw new Error('Unable to read superadmin accounts.');
    const admins = await listResponse.json();
    if (admins.length <= 1) return res.status(400).json({ error: 'At least one superadmin account must remain.' });
    if (!admins.some(a => a.id === userId)) return res.status(404).json({ error: 'Superadmin account not found.' });

    const deleteResponse = await fetch(`${env.url}/auth/v1/admin/users/${encodeURIComponent(userId)}`, {
      method: 'DELETE',
      headers: {
        apikey: env.serviceRole
      }
    });

    if (!deleteResponse.ok) {
      const detail = await deleteResponse.json().catch(() => ({}));
      return res.status(deleteResponse.status).json({ error: detail.msg || detail.message || detail.error || 'Unable to remove superadmin.' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Unexpected server error.' });
  }
}
