import { initFirebaseAdmin } from '../../lib/firebaseAdmin';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://gifty.cloud');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const admin = initFirebaseAdmin();
    const db = admin.firestore();

    const { password, giftyId, action, months } = req.body;

    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Nesprávne heslo' });
    }

    if (!giftyId) return res.status(400).json({ error: 'Chýba Gifty ID' });

    const snap = await db.collection('profiles').where('giftyId', '==', giftyId.trim().toUpperCase()).get();
    if (snap.empty) return res.status(404).json({ error: `Používateľ s Gifty ID ${giftyId} nebol nájdený` });

    const userDoc = snap.docs[0];
    const userData = userDoc.data();

    if (action === 'activate') {
      const monthsNum = parseInt(months, 10) || 1;
      const premiumUntil = new Date();
      premiumUntil.setMonth(premiumUntil.getMonth() + monthsNum);

      await userDoc.ref.update({
        isPremium: true,
        premiumUntil: admin.firestore.Timestamp.fromDate(premiumUntil),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return res.status(200).json({
        success: true,
        message: `Premium aktivované pre ${userData.name} (${giftyId})`,
        user: { name: userData.name, email: userData.email, giftyId },
      });
    }

    if (action === 'deactivate') {
      await userDoc.ref.update({
        isPremium: false,
        premiumUntil: null,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      return res.status(200).json({ success: true, message: `Premium deaktivované pre ${userData.name} (${giftyId})` });
    }

    if (action === 'check') {
      return res.status(200).json({
        success: true,
        user: {
          name: userData.name,
          email: userData.email,
          giftyId: userData.giftyId,
          isPremium: userData.isPremium || false,
          premiumUntil: userData.premiumUntil?.toDate?.()?.toLocaleDateString('sk-SK') || null,
        },
      });
    }

    return res.status(400).json({ error: 'Neznáma akcia' });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Interná chyba servera' });
  }
}
