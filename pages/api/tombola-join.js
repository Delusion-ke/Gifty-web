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

  const { code, name, giftyUid, ticketCount = 1 } = req.body;
  if (!code || (!name?.trim() && !giftyUid)) {
    return res.status(400).json({ error: 'Chýba kód alebo meno' });
  }

  const count = Math.min(Math.max(parseInt(ticketCount) || 1, 1), 10); // max 10 lístkov

  try {
    const admin = initFirebaseAdmin();
    const db = admin.firestore();

    const snap = await db.collection('tombolas').where('code', '==', code.toUpperCase()).limit(1).get();
    if (snap.empty) return res.status(404).json({ error: 'Tombola nenájdená' });

    const tombolaDoc = snap.docs[0];
    const tombola = tombolaDoc.data();

    if (tombola.status !== 'open') return res.status(400).json({ error: 'Tombola je uzavretá' });

    // Načítaj meno Gifty usera
    let participantName = name?.trim() || 'Anonymný';
    if (giftyUid) {
      const profileSnap = await db.collection('profiles').doc(giftyUid).get();
      if (profileSnap.exists) participantName = profileSnap.data().name || participantName;
    }

    // Aktuálny počet účastníkov pre číslovanie lístkov
    const allSnap = await db.collection('tombolas').doc(tombolaDoc.id).collection('participants').get();
    let nextNumber = allSnap.size + 1;

    const ticketNumbers = [];
    for (let i = 0; i < count; i++) {
      ticketNumbers.push(String(nextNumber++).padStart(3, '0'));
    }

    let ticket = null;

    if (tombola.isPaid && tombola.ownerIban) {
      // Jeden VS pre všetky lístky — celková suma
      let vs = generateVS();
      const existingVS = await db.collection('tombolas').doc(tombolaDoc.id)
        .collection('participants').where('variableSymbol', '==', vs).get();
      if (!existingVS.empty) vs = String(parseInt(vs) + 1);

      const totalPrice = tombola.ticketPrice * count;

      // Vygeneruj QR pre celkovú sumu
      let qrImage = null;
      try {
        const QRCode = require('qrcode');
        const { encode, PaymentOptions, CurrencyCode } = await import('bysquare/pay');
        const payload = encode({
          payments: [{
            type: PaymentOptions.PaymentOrder,
            amount: totalPrice,
            currencyCode: CurrencyCode.EUR,
            bankAccounts: [{ iban: tombola.ownerIban }],
            variableSymbol: vs,
            paymentNote: `Tombola ${tombola.title} — ${count}x lístok`,
            beneficiary: { name: tombola.ownerName || 'Gifty' },
          }],
        });
        qrImage = await QRCode.toDataURL(payload, { errorCorrectionLevel: 'M', margin: 2, width: 400 });
      } catch (e) {
        console.log('QR error:', e.message);
      }

      // Pridaj každý lístok ako samostatný záznam — pending
      for (const ticketNum of ticketNumbers) {
        await db.collection('tombolas').doc(tombolaDoc.id).collection('participants').add({
          name: participantName,
          giftyUid: giftyUid || null,
          status: 'pending',
          variableSymbol: vs,
          ticketNumber: ticketNum,
          groupVs: vs, // rovnaký VS pre celú skupinu lístkov
          joinedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      ticket = {
        vs,
        totalPrice,
        price: tombola.ticketPrice,
        iban: tombola.ownerIban,
        qrImage,
        tickets: ticketNumbers,
      };
    } else {
      // Neplatená — priamo confirmed
      for (const ticketNum of ticketNumbers) {
        await db.collection('tombolas').doc(tombolaDoc.id).collection('participants').add({
          name: participantName,
          giftyUid: giftyUid || null,
          status: 'confirmed',
          ticketNumber: ticketNum,
          joinedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      await db.collection('tombolas').doc(tombolaDoc.id).update({
        participantCount: admin.firestore.FieldValue.increment(count),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      ticket = { tickets: ticketNumbers };
    }

    const updatedSnap = await db.collection('tombolas').doc(tombolaDoc.id).collection('participants').get();

    return res.status(200).json({
      success: true,
      participantCount: updatedSnap.size,
      ticket,
      results: tombola.results || null,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
