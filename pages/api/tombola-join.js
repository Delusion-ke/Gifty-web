// pages/api/tombola-join.js
import { initFirebaseAdmin } from '../../lib/firebaseAdmin';

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

    const doc = snap.docs[0];
    const data = doc.data();

    if (data.status !== 'open') return res.status(400).json({ error: 'Tombola je uzavretá' });

    // Pridaj účastníka
    await db.collection('tombolas').doc(doc.id).collection('participants').add({
      name: name.trim(),
      joinedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const participantsSnap = await db.collection('tombolas').doc(doc.id).collection('participants').get();

    return res.status(200).json({
      success: true,
      participantCount: participantsSnap.size,
      results: data.results || null,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
