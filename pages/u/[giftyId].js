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
              <svg width="72" height="72" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="lg1" x1="6" y1="6" x2="58" y2="58">
                    <stop offset="0%" stopColor="#7B5CF5"/>
                    <stop offset="100%" stopColor="#C084FC"/>
                  </linearGradient>
                </defs>
                <rect x="6" y="30" width="52" height="28" rx="7" stroke="url(#lg1)" strokeWidth="3"/>
                <rect x="13" y="18" width="38" height="14" rx="5" stroke="url(#lg1)" strokeWidth="3"/>
                <path d="M32 18C32 18 26 8 20 12C14 16 20 18 32 18C44 18 50 16 44 12C38 8 32 18 32 18Z" stroke="url(#lg1)" strokeWidth="2.5"/>
                <path d="M27 46C27 46 30 50 32 47C34 44 32 40 29 42C26 44 27 46 27 46Z" fill="url(#lg1)"/>
                <line x1="32" y1="18" x2="32" y2="58" stroke="url(#lg1)" strokeWidth="2.5"/>
              </svg>
              <span style={{ fontSize: 28, fontWeight: 800, background: 'linear-gradient(135deg, #fff 0%, #C084FC 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Gifty</span>
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
