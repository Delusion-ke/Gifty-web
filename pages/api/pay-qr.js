export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { iban, amount, vs, message, recipientName } = req.body;
    if (!iban) return res.status(400).json({ error: 'Missing IBAN' });

    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) return res.status(400).json({ error: 'Invalid amount' });

    const cleanIban = iban.replace(/\s/g, '').toUpperCase();

    const QRCode = require('qrcode');
    const bysquare = await import('bysquare');

    console.log('bysquare keys:', Object.keys(bysquare));

    // Nájdi encode funkciu
    const encode = bysquare.encode
      || bysquare.default?.encode
      || (typeof bysquare.default === 'function' ? bysquare.default : null);

    if (!encode || typeof encode !== 'function') {
      throw new Error('encode not found. Keys: ' + Object.keys(bysquare).join(', '));
    }

    // PaymentOptions.PaymentOrder = 1, CurrencyCode.EUR = 'EUR' v bysquare v4
    const PaymentOptions = bysquare.PaymentOptions ?? bysquare.default?.PaymentOptions ?? {};
    const CurrencyCode = bysquare.CurrencyCode ?? bysquare.default?.CurrencyCode ?? {};

    const paymentType = PaymentOptions?.PaymentOrder ?? 1;
    const currency = CurrencyCode?.EUR ?? 'EUR';

    console.log('paymentType:', paymentType, 'currency:', currency);

    const payload = encode({
      payments: [{
        type: paymentType,
        amount: parsedAmount,
        currencyCode: currency,
        bankAccounts: [{ iban: cleanIban }],
        variableSymbol: vs || undefined,
        paymentNote: message || 'Gifty',
        beneficiary: { name: recipientName || 'Gifty User' },
      }],
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
}
