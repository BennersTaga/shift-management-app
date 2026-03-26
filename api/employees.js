import { getGasUrl, sanitizeEmployees } from './_gasClient.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const response = await fetch(getGasUrl(), { method: 'GET' });

    if (!response.ok) {
      return res.status(502).json({ success: false, message: 'Upstream request failed' });
    }

    const result = await response.json();

    if (!result?.success) {
      return res.status(502).json({
        success: false,
        message: result?.message || 'Failed to fetch employees from upstream',
      });
    }

    return res.status(200).json({
      success: true,
      employees: sanitizeEmployees(result.employees),
      systemSettings: result.systemSettings || null,
    });
  } catch (error) {
    console.error('employees api error', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}
