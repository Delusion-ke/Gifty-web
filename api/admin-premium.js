const admin = require('firebase-admin');

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const db = admin.firestore();

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://gifty.cloud');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { password, giftyId, action, months } = req.body;

  // Overenie hesla
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Nesprávne heslo' });
  }

  if (!giftyId) {
    return res.status(400).json({ error: 'Chýba Gifty ID' });
  }

  try {
    // Nájdi profil podľa Gifty ID
    const snap = await db.collection('profiles')
      .where('giftyId', '==', giftyId.trim().toUpperCase())
      .get();

    if (snap.empty) {
      return res.status(404).json({ error: `Používateľ s Gifty ID ${giftyId} nebol nájdený` });
    }

    const userDoc = snap.docs[0];
    const userData = userDoc.data();

    if (action === 'activate') {
      // Vypočítaj premiumUntil
      const monthsNum = parseInt(months) || 1;
      const premiumUntil = new Date();
      premiumUntil.setMonth(premiumUntil.getMonth() + monthsNum);

      await userDoc.ref.update({
        isPremium: true,
        premiumUntil: admin.firestore.Timestamp.fromDate(premiumUntil),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return res.status(200).json({
        success: true,
        message: `Premium aktivované pre ${userData.name} (${giftyId}) do ${premiumUntil.toLocaleDateString('sk-SK')}`,
        user: { name: userData.name, email: userData.email, giftyId }
      });

    } else if (action === 'deactivate') {
      await userDoc.ref.update({
        isPremium: false,
        premiumUntil: null,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return res.status(200).json({
        success: true,
        message: `Premium deaktivované pre ${userData.name} (${giftyId})`,
        user: { name: userData.name, email: userData.email, giftyId }
      });

    } else if (action === 'check') {
      return res.status(200).json({
        success: true,
        user: {
          name: userData.name,
          email: userData.email,
          giftyId: userData.giftyId,
          isPremium: userData.isPremium || false,
          premiumUntil: userData.premiumUntil?.toDate?.()?.toLocaleDateString('sk-SK') || null,
        }
      });
    }

    return res.status(400).json({ error: 'Neznáma akcia' });

  } catch (err) {
    console.error('Admin premium error:', err);
    return res.status(500).json({ error: 'Interná chyba servera' });
  }
};
