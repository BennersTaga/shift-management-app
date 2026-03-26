import { getGasUrl } from './_gasClient.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const shiftData = req.body;

    if (!shiftData?.employeeId || !Array.isArray(shiftData?.shifts)) {
      return res.status(400).json({ success: false, message: 'Invalid shift payload' });
    }

    const gasUrl = new URL(getGasUrl());
    gasUrl.searchParams.set('method', 'POST');
    gasUrl.searchParams.set('data', JSON.stringify(shiftData));

    const response = await fetch(gasUrl, { method: 'GET' });

    if (!response.ok) {
      return res.status(502).json({ success: false, message: 'Upstream request failed' });
    }

    const result = await response.json();
    return res.status(200).json(result);
  } catch (error) {
    console.error('shifts api error', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}
