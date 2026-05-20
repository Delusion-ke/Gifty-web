import Head from 'next/head';

export default function ProfilePage({ profile, giftyId }) {
  const name = profile?.name || 'Gifty používateľ';

  return (
    <>
      <Head>
        <title>{`${name} — Gifty Wishlist`}</title>
        <meta name="description" content="Pozri môj wishlist a prispej presne na to čo si prajem cez QR platbu." />
        <meta property="og:title" content={`Pozri môj Gifty wishlist 🎁`} />
        <meta property="og:description" content="Zabudni na obálky s peniazmi. Prispej presne na to čo si prajem — jedným skenovaním QR kódu." />
        <meta property="og:image" content="https://gifty.cloud/og-image.png" />
        <meta property="og:type" content="website" />
      </Head>

      <div className="page-bg">
        <div className="card">
          <div className="card-hero" style={{ height: 220 }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(123,92,245,.35) 0%, transparent 65%)' }} />
            <img src="/weblogo.png" alt="Gifty" className="logo-img" style={{ position: 'relative', zIndex: 2 }} />
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
    const PROJECT_ID = 'gifty-f57bc';
    const res = await fetch(`https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: 'profiles' }],
          where: { fieldFilter: { field: { fieldPath: 'giftyId' }, op: 'EQUAL', value: { stringValue: giftyId } } },
          limit: 1,
        },
      }),
    });
    const data = await res.json();
    const doc = data?.[0]?.document;
    if (doc?.fields) {
      const f = doc.fields;
      profile = {
        name: f.name?.stringValue || null,
        giftyId: f.giftyId?.stringValue || giftyId,
        avatarUrl: f.avatarUrl?.stringValue || null,
      };
    }
  } catch (e) {}

  return { props: { profile, giftyId } };
}
