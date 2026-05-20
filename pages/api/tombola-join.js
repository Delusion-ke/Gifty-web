import { initFirebaseAdmin } from '../../lib/firebaseAdmin';

function generateVS() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { code, name } = req.body;
  if (!code || !name?.trim()) return res.status(400).json({ error: 'Chýba kód alebo meno' });

  try {
    const admin = initFirebaseAdmin();
    const db = admin.firestore();

    const snap = await db.collection('tombolas').where('code', '==', code.toUpperCase()).limit(1).get();
    if (snap.empty) return res.status(404).json({ error: 'Tombola nenájdená' });

    const tombolaDoc = snap.docs[0];
    const tombola = tombolaDoc.data();

    if (tombola.status !== 'open') return res.status(400).json({ error: 'Tombola je uzavretá' });

    let ticket = null;

    if (tombola.isPaid && tombola.ownerIban) {
      let vs = generateVS();
      const existing = await db.collection('tombolas').doc(tombolaDoc.id)
        .collection('participants').where('variableSymbol', '==', vs).get();
      if (!existing.empty) vs = String(parseInt(vs) + 1);

      let qrImage = null;
      try {
        const QRCode = require('qrcode');
        const bysquare = await import('bysquare');
        const { encode, PaymentOptions, CurrencyCode } = bysquare;
        const payload = encode({
          payments: [{
            type: PaymentOptions.PaymentOrder,
            amount: tombola.ticketPrice,
            currencyCode: CurrencyCode.EUR,
            bankAccounts: [{ iban: tombola.ownerIban }],
            variableSymbol: vs,
            paymentNote: `Tombola: ${tombola.title}`,
            beneficiary: { name: tombola.ownerName || 'Gifty' },
          }],
        });
        qrImage = await QRCode.toDataURL(payload, { errorCorrectionLevel: 'M', margin: 2, width: 400 });
      } catch (e) {
        console.log('QR gen error:', e.message);
      }

      await db.collection('tombolas').doc(tombolaDoc.id).collection('participants').add({
        name: name.trim(),
        status: 'pending',
        variableSymbol: vs,
        joinedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      ticket = { vs, price: tombola.ticketPrice, iban: tombola.ownerIban, qrImage };
    } else {
      await db.collection('tombolas').doc(tombolaDoc.id).collection('participants').add({
        name: name.trim(),
        status: 'confirmed',
        joinedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      await db.collection('tombolas').doc(tombolaDoc.id).update({
        participantCount: admin.firestore.FieldValue.increment(1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    const participantsSnap = await db.collection('tombolas').doc(tombolaDoc.id).collection('participants').get();

    return res.status(200).json({
      success: true,
      participantCount: participantsSnap.size,
      ticket,
      results: tombola.results || null,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
