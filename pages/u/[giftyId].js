import Head from 'next/head';

export default function ProfilePage({ profile, giftyId }) {
  const name = profile?.name || 'Gifty používateľ';
  const pageUrl = `https://gifty.cloud/u/${giftyId}`;
  const ogTitle = `${name} má wishlist na Gifty 🎁`;
  const ogDescription = `Pozri čo si ${name} praje a prispej presne na to čo chce — jedným skenovaním QR kódu. Žiadne darčekové tašky, žiadne nevhodné darčeky.`;
  const ogImage = profile?.avatarUrl
    ? `https://gifty.cloud/api/og?name=${encodeURIComponent(name)}&giftyId=${giftyId}`
    : 'https://gifty.cloud/og-image.png';

  return (
    <>
      <Head>
        <title>{`${name} — Gifty Wishlist`}</title>
        <meta name="description" content={ogDescription} />

        {/* Open Graph — WhatsApp, Messenger, Facebook */}
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={ogDescription} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Gifty" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={ogTitle} />
        <meta name="twitter:description" content={ogDescription} />
        <meta name="twitter:image" content={ogImage} />
      </Head>

      <div className="page-bg">
        <div className="card">
          <div className="card-hero" style={{ height: 220 }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(123,92,245,.35) 0%, transparent 65%)' }} />
            <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <img
                src="/weblogo.png"
                alt="Gifty"
                style={{ width: 180, height: 180, objectFit: 'contain', mixBlendMode: 'screen' }}
              />
            </div>
          </div>
      </div>
    </>
  );
}

export async function getServerSideProps({ params }) {
  const { giftyId } = params;
  let profile = null;

  try {
    const { initFirebaseAdmin } = require('../../lib/firebaseAdmin');
    const admin = initFirebaseAdmin();
    const db = admin.firestore();

    const snap = await db.collection('profiles')
      .where('giftyId', '==', giftyId)
      .limit(1)
      .get();

    if (!snap.empty) {
      const doc = snap.docs[0].data();
      profile = {
        name: doc.name || null,
        giftyId: doc.giftyId || giftyId,
        avatarUrl: doc.avatarUrl || null,
      };
    }
  } catch (e) {
    console.error('getServerSideProps error:', e.message);
  }

  return { props: { profile, giftyId } };
}
