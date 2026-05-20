import { initFirebaseAdmin } from '../../lib/firebaseAdmin';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { tombolaId, ownerUid } = req.body;
  if (!tombolaId || !ownerUid) return res.status(400).json({ error: 'Chýbajú parametre' });

  try {
    const admin = initFirebaseAdmin();
    const db = admin.firestore();

    const tombolaRef = db.collection('tombolas').doc(tombolaId);
    const tombolaSnap = await tombolaRef.get();
    if (!tombolaSnap.exists) return res.status(404).json({ error: 'Tombola nenájdená' });

    const tombola = tombolaSnap.data();
    if (tombola.ownerId !== ownerUid) return res.status(403).json({ error: 'Nemáš oprávnenie' });
    if (tombola.status === 'drawn') return res.status(400).json({ error: 'Tombola už bola žrebovaná' });

    // Načítaj účastníkov
    const participantsSnap = await tombolaRef.collection('participants').get();
    const participants = participantsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    if (participants.length === 0) return res.status(400).json({ error: 'Žiadni účastníci' });

    // Žrebuj — náhodne zamiešaj účastníkov
    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    const prizes = tombola.prizes || [];

    // Priraď výhercov ku cenám
    const results = prizes.map((prize, i) => ({
      prizeIndex: i,
      prizeName: prize.name,
      winnerId: shuffled[i % shuffled.length]?.id || null,
      winnerName: shuffled[i % shuffled.length]?.name || null,
    }));

    // Aktualizuj ceny s výhercami
    const updatedPrizes = prizes.map((prize, i) => ({
      ...prize,
      winner: results[i]?.winnerName || null,
      winnerId: results[i]?.winnerId || null,
    }));

    await tombolaRef.update({
      status: 'drawn',
      prizes: updatedPrizes,
      results,
      drawnAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Pošli push notifikácie výhercom (ak majú Gifty účet)
    for (const result of results) {
      if (!result.winnerId) continue;
      try {
        // Nájdi Gifty účet podľa mena (best effort)
        // Push cez notifications kolekciu
        const profileSnap = await db.collection('profiles').where('name', '==', result.winnerName).limit(1).get();
        if (!profileSnap.empty) {
          const profile = profileSnap.docs[0];
          await db.collection('notifications').add({
            userId: profile.id,
            kind: 'tombola_win',
            title: `🎉 Vyhral(a) si v tombole!`,
            subtitle: `${tombola.title} — Cena: ${result.prizeName}`,
            groupId: tombolaId,
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      } catch (e) {
        console.log('Notification error:', e.message);
      }
    }

    return res.status(200).json({ success: true, results, updatedPrizes });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
