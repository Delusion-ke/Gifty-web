import { initFirebaseAdmin } from '../../lib/firebaseAdmin';

async function deleteWhere(db, collection, field, userId) {
  const snap = await db.collection(collection).where(field, '==', userId).get();
  const batch = db.batch();
  snap.docs.forEach(doc => batch.delete(doc.ref));
  if (snap.docs.length > 0) await batch.commit();
}

async function deleteWhereArrayContains(db, collection, field, userId) {
  const snap = await db.collection(collection).where(field, 'array-contains', userId).get();
  const batch = db.batch();
  snap.docs.forEach(doc => batch.delete(doc.ref));
  if (snap.docs.length > 0) await batch.commit();
}

export default async function handler(req, res) {
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
    const admin = initFirebaseAdmin();
    const db = admin.firestore();
    const auth = admin.auth();

    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
    } catch (e) {
      return res.status(404).json({ error: 'Účet s touto e-mailovou adresou nebol nájdený.' });
    }

    const uid = userRecord.uid;

    await Promise.all([
      db.collection('profiles').doc(uid).delete().catch(() => {}),
      deleteWhere(db, 'wishes', 'ownerId', uid),
      deleteWhere(db, 'notifications', 'userId', uid),
      deleteWhere(db, 'contributions', 'userId', uid),
      deleteWhere(db, 'wishContributions', 'contributorUserId', uid),
      deleteWhere(db, 'groups', 'ownerId', uid),
      deleteWhere(db, 'tombolas', 'ownerId', uid),
      deleteWhereArrayContains(db, 'people', 'ownerIds', uid),
    ]);

    await auth.deleteUser(uid);
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Interná chyba servera.' });
  }
}
