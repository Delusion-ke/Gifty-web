const admin = require('firebase-admin');

// Initialize Firebase Admin SDK (only once)
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();
const auth = admin.auth();

// Delete all documents in a collection where a field matches userId
async function deleteWhere(collection, field, userId) {
  const snap = await db.collection(collection).where(field, '==', userId).get();
  const batch = db.batch();
  snap.docs.forEach(doc => batch.delete(doc.ref));
  if (snap.docs.length > 0) await batch.commit();
}

// Delete all documents in a collection where userId is in an array field
async function deleteWhereArrayContains(collection, field, userId) {
  const snap = await db.collection(collection).where(field, 'array-contains', userId).get();
  const batch = db.batch();
  snap.docs.forEach(doc => batch.delete(doc.ref));
  if (snap.docs.length > 0) await batch.commit();
}

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://gifty.cloud');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Neplatná e-mailová adresa.' });
  }

  try {
    // 1. Get user by email
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
    } catch (e) {
      return res.status(404).json({ error: 'Účet s touto e-mailovou adresou nebol nájdený.' });
    }

    const uid = userRecord.uid;

    // 2. Delete Firestore data in parallel
    await Promise.all([
      // Profile
      db.collection('profiles').doc(uid).delete().catch(() => {}),

      // Wishes owned by user
      deleteWhere('wishes', 'ownerId', uid),

      // Notifications for user
      deleteWhere('notifications', 'userId', uid),

      // Contributions by user
      deleteWhere('contributions', 'userId', uid),
      deleteWhere('wishContributions', 'contributorUserId', uid),

      // Groups owned by user
      deleteWhere('groups', 'ownerId', uid),

      // People owned by user (ownerIds array)
      deleteWhereArrayContains('people', 'ownerIds', uid),
    ]);

    // 3. Delete Firebase Auth user
    await auth.deleteUser(uid);

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('Delete account error:', err);
    return res.status(500).json({ error: 'Interná chyba servera. Skús to znova neskôr.' });
  }
};
