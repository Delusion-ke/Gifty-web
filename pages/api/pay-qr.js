import QRCode from 'qrcode';
import { encode, PaymentOptions, CurrencyCode } from 'bysquare';

// ✅ Povedz Next.js aby NEBUNDLOVAL tento súbor — nechaj Node.js načítať ESM natívne
export const config = {
  api: {
    bodyParser: true,
  },
};

// ── IBAN dĺžky podľa krajiny ──────────────────────────────────────────
const IBAN_LENGTHS = {
  SK: 24, CZ: 24, AT: 20, DE: 22, PL: 28, HU: 28,
  GB: 22, FR: 27, IT: 27, ES: 24, NL: 18, BE: 16,
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { iban, amount, vs, message, recipientName } = req.body;

    if (!iban) return res.status(400).json({ error: 'Chýba IBAN' });

    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      return res.status(400).json({ error: 'Neplatná suma' });
    }

    // Normalizuj IBAN
    const cleanIban = iban.replace(/\s/g, '').toUpperCase();

    // Validuj dĺžku
    const countryCode = cleanIban.substring(0, 2);
    const expectedLength = IBAN_LENGTHS[countryCode];
    if (expectedLength && cleanIban.length !== expectedLength) {
      return res.status(400).json({
        error: `IBAN ${countryCode} má mať ${expectedLength} znakov, tvoj má ${cleanIban.length}. Oprav ho v Nastaveniach → Účet.`,
      });
    }

    console.log('Generating QR for:', countryCode, cleanIban.substring(0, 8) + '...', 'amount:', parsedAmount);

    // ✅ encode() sa volá priamo — nie cez dynamic import
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

    console.log('QR generated successfully');
    return res.status(200).json({ success: true, image });

  } catch (err) {
    console.error('PAY QR ERROR:', err);
    return res.status(500).json({ error: err.message || 'QR generation failed' });
  }
}