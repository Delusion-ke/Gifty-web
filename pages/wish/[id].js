import Head from 'next/head';

export default function WishPage({ wish, id }) {
  const pct = wish?.targetAmount > 0
    ? Math.min(Math.round((wish.contributedAmount / wish.targetAmount) * 100), 100)
    : 0;

  return (
    <>
      <Head>
        <title>{wish?.title ? `${wish.title} — Gifty` : 'Gifty — Prianie'}</title>
        <meta name="description" content="Pozri si toto prianie na Gifty a prispej na darček." />
        <meta property="og:title" content={wish?.title || 'Gifty — Prianie'} />
        <meta property="og:description" content={`Prispej na darček: ${wish?.title || ''}`} />
        <meta property="og:image" content={wish?.imageUrl || 'https://gifty.cloud/og-image.png'} />
        <meta property="og:type" content="website" />
      </Head>

      <div className="page-bg">
        <div className="card">
          <div className="card-hero">
            {wish?.imageUrl ? (
              <img src={wish.imageUrl} alt={wish.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '28px 28px 0 0' }} />
            ) : (
              <div style={{ fontSize: 56 }}>🎁</div>
            )}
          </div>

          <div className="card-body">
            <div className="badge">
              <span className="badge-dot" />
              Prianie na Gifty
            </div>

            <div className="heading">{wish?.title || 'Prianie'}</div>

            <div style={{ fontSize: 28, fontWeight: 800, background: 'linear-gradient(135deg, #7B5CF5, #C084FC)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 16 }}>
              €{(wish?.contributedAmount || 0).toFixed(0)} / €{(wish?.targetAmount || 0).toFixed(0)}
            </div>

            {/* Progress bar */}
            <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 8, height: 8, overflow: 'hidden', marginBottom: 6 }}>
              <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #7B5CF5, #C084FC)', borderRadius: 8, transition: 'width .6s ease' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)', marginBottom: 20 }}>
              <span>€{(wish?.contributedAmount || 0).toFixed(0)} vyzbierané</span>
              <span>{pct}%</span>
            </div>

            <div className="divider" />

            <a href={`gifty://wish/${id}`} className="btn-primary" style={{ marginBottom: 12 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 12v10H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/>
                <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
                <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
              </svg>
              Prispieť cez Gifty
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
  const { id } = params;
  let wish = null;

  try {
    const PROJECT_ID = 'gifty-f57bc';
    const res = await fetch(`https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/wishes/${id}`);
    if (res.ok) {
      const data = await res.json();
      const f = data.fields;
      if (f) {
        wish = {
          title: f.title?.stringValue || null,
          targetAmount: parseFloat(f.targetAmount?.integerValue || f.targetAmount?.doubleValue || 0),
          contributedAmount: parseFloat(f.contributedAmount?.integerValue || f.contributedAmount?.doubleValue || 0),
          imageUrl: f.imageUrl?.stringValue || null,
        };
      }
    }
  } catch (e) {}

  return { props: { wish, id } };
}
