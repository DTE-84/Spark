export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Ensure body is parsed (Vercel automatically parses JSON bodies)
  const { license_key } = req.body || {};
  const productId = process.env.GUMROAD_PRODUCT_ID;

  if (!license_key) {
    return res.status(400).json({ error: 'License key is required' });
  }

  if (!productId) {
    // In development, if you don't have an ID set, we might want to mock success or return an error
    return res.status(500).json({ error: 'Gumroad Product ID is not configured on the server.' });
  }

  try {
    const response = await fetch('https://api.gumroad.com/v2/licenses/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id: productId,
        license_key: license_key,
      }),
    });

    const data = await response.json();

    if (data.success && data.purchase && !data.purchase.refunded) {
      return res.status(200).json(data);
    } else {
      return res.status(400).json({ error: 'Invalid or inactive license key.', details: data });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error while verifying license.' });
  }
}
