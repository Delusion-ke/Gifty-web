const QRCode = require('qrcode');

module.exports = async function handler(req, res) {
  // ✅ OPRAVA: mobilné appky neposielajú Origin header — povolíme všetky origins
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { iban, amount, vs, message, recipientName } = req.body;

    console.log('PAY QR REQUEST:', { iban: iban ? iban.substring(0, 8) + '...' : null, amount, vs, message });

    if (!iban) return res.status(400).json({ error: 'Missing IBAN' });

    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) return res.status(400).json({ error: 'Invalid amount' });

    // Normalize IBAN — odstráň medzery
    const cleanIban = iban.replace(/\s/g, '').toUpperCase();

    // bysquare v4 — ESM only, use dynamic import
    const bysquare = await import('bysquare');
    const { encode, PaymentOptions, CurrencyCode } = bysquare;

    const payload = encode({
      payments: [
        {
          type: PaymentOptions.PaymentOrder,
          amount: parsedAmount,
          currencyCode: CurrencyCode.EUR,
          bankAccounts: [{ iban: cleanIban }],
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

    console.log('PAY QR SUCCESS for IBAN:', cleanIban.substring(0, 8) + '...');
    return res.status(200).json({ success: true, image });

  } catch (err) {
    console.error('PAY QR ERROR:', err);
    return res.status(500).json({ error: err.message || 'QR generation failed' });
  }
};