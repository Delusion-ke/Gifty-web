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
            <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <svg width="90" height="90" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="gLogo" x1="20" y1="10" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#A855F7"/>
                    <stop offset="100%" stopColor="#EC4899"/>
                  </linearGradient>
                </defs>
                {/* Maška — ľavá slučka */}
                <path d="M60 28 C60 28 44 8 36 14 C28 20 38 28 60 28Z" stroke="url(#gLogo)" strokeWidth="5" strokeLinecap="round" fill="none"/>
                {/* Maška — pravá slučka */}
                <path d="M60 28 C60 28 76 8 84 14 C92 20 82 28 60 28Z" stroke="url(#gLogo)" strokeWidth="5" strokeLinecap="round" fill="none"/>
                {/* Telo krabičky */}
                <rect x="22" y="42" width="76" height="62" rx="10" stroke="url(#gLogo)" strokeWidth="5" fill="none"/>
                {/* Vrchná časť krabičky */}
                <rect x="16" y="28" width="88" height="16" rx="6" stroke="url(#gLogo)" strokeWidth="5" fill="none"/>
                {/* Srdce vo vnútri */}
                <path d="M60 90 C60 90 40 75 40 63 C40 55 47 50 53.5 53 C56.5 54.5 58.5 57 60 59 C61.5 57 63.5 54.5 66.5 53 C73 50 80 55 80 63 C80 75 60 90 60 90Z" stroke="url(#gLogo)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                {/* Malé srdce pod krabičkou */}
                <path d="M60 107 C60 107 56 104 56 101.5 C56 99.5 57.5 98 59 98.8 C59.7 99.2 60 99.8 60 99.8 C60 99.8 60.3 99.2 61 98.8 C62.5 98 64 99.5 64 101.5 C64 104 60 107 60 107Z" fill="#6366F1"/>
              </svg>
              <span style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: -0.5 }}>Gifty</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', letterSpacing: 1 }}>Celebrate together.</span>
            </div>
          </div>

          <div className="card-body">
            <div className="badge">
              <span className="badge-dot" />
              Gifty Wishlist
            </div>

            {profile && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 16, padding: 14, marginBottom: 20 }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, #7B5CF5, #C084FC)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                  {name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{name}</div>
                  {profile.giftyId && (
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{profile.giftyId}</div>
                  )}
                </div>
              </div>
            )}

            <div className="heading">
              <em>{name}</em><br />ťa pozýva na Gifty
            </div>
            <p className="desc">
              Pozri môj wishlist a prispej presne na to čo si prajem — jedným skenovaním QR kódu.
            </p>

            <div className="divider" />

            <a href={`gifty://u/${giftyId}`} className="btn-primary" style={{ marginBottom: 12 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h6v6M10 14L21 3M18 13v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h8" />
              </svg>
              Otvoriť v Gifty
            </a>

            <div className="store-row">
              <a href="https://play.google.com/store/apps/details?id=com.gifty.cloud" className="store-btn" target="_blank" rel="noreferrer">
                Google Play
              </a>
              <a href="https://apps.apple.com/app/gifty" className="store-btn" target="_blank" rel="noreferrer">
                App Store
              </a>
            </div>
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
