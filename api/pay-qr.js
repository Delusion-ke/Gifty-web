const QRCode = require('qrcode');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://gifty.cloud');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { iban, amount, vs, message, recipientName } = req.body;

    if (!iban) return res.status(400).json({ error: 'Missing IBAN' });

    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) return res.status(400).json({ error: 'Invalid amount' });

    const { encode } = await import('bysquare/pay');

    const payload = encode({
      payments: [
        {
          type: 1,
          amount: parsedAmount,
          currencyCode: 'EUR',
          bankAccounts: [{ iban: iban.replace(/\s/g, '') }],
          variableSymbol: vs || undefined,
          paymentNote: message || 'Gifty contribution',
          beneficiary: { name: recipientName || 'Gifty User' },
        },
      ],
    });

    const image = await QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 512,
    });

    return res.status(200).json({ success: true, image });
  } catch (err) {
    console.error('PAY QR ERROR:', err);
    return res.status(500).json({ error: err.message || 'QR generation failed' });
  }
};