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

    // bysquare v4 — encode je named export ale volá sa cez createPayment alebo priamo
    // Skúsime require namiesto dynamic import
    const bysquare = require('bysquare');
    console.log('bysquare keys (require):', Object.keys(bysquare));
    console.log('bysquare type:', typeof bysquare);
    console.log('bysquare.default type:', typeof bysquare.default);

    // V bysquare v4 je encode ako: bysquare.encode alebo default export
    const encode = bysquare.encode
      || bysquare.default?.encode
      || (typeof bysquare.default === 'function' ? bysquare.default : null)
      || (typeof bysquare === 'function' ? bysquare : null);

    if (!encode) {
      throw new Error('encode not found. All keys: ' + JSON.stringify(Object.keys(bysquare)));
    }

    const payload = encode({
      payments: [{
        type: 1,
        amount: parsedAmount,
        currencyCode: 'EUR',
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
