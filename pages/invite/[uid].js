import Head from 'next/head';

export default function InvitePage({ name, uid }) {
  return (
    <>
      <Head>
        <title>{name ? `${name} ťa pozýva — Gifty` : 'Gifty — Pozvánka'}</title>
        <meta name="description" content="Wishlisty, skupinové darčeky a QR platby — všetko na jednom mieste." />
        <meta property="og:title" content="Pozývam ťa na Gifty 🎁" />
        <meta property="og:description" content="Zabudni na obálky s peniazmi. Pozri môj wishlist a prispej presne na to čo si prajem — jedným skenovaním QR kódu." />
        <meta property="og:image" content="https://gifty.cloud/og-image.png" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Gifty" />
      </Head>

      <div className="page-bg">
        <div className="card">
          <div className="card-hero">
            <img src="/weblogo.png" alt="Gifty" className="logo-img" />
          </div>

          <div className="card-body">
            <div className="badge">
              <span className="badge-dot" />
              Osobná pozvánka
            </div>

            <div className="heading">
              <em>{name || 'Niekto'}</em> ťa pozýva<br />na Gifty
            </div>
            <p className="desc">
              Wishlisty, skupinové darčeky a QR platby — všetko na jednom mieste. Žiadne obálky s peniazmi, žiadny stres.
            </p>

            <div className="divider" />

            <a href={`gifty://invite/${uid}`} className="btn-primary" style={{ marginBottom: 12 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h6v6M10 14L21 3M18 13v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h8" />
              </svg>
              Otvoriť v Gifty
            </a>

            <div className="store-row">
              <a href="https://play.google.com/store/apps/details?id=com.gifty.cloud" className="store-btn" target="_blank" rel="noreferrer">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 20.5v-17l17.5 8.5L3 20.5z"/></svg>
                Google Play
              </a>
              <a href="https://apps.apple.com/app/gifty" className="store-btn" target="_blank" rel="noreferrer">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
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
  const { uid } = params;
  let name = null;

  try {
    const PROJECT_ID = 'gifty-f57bc';
    const res = await fetch(`https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/profiles/${uid}`);
    if (res.ok) {
      const data = await res.json();
      name = data.fields?.name?.stringValue || null;
    }
  } catch (e) {}

  return { props: { name, uid } };
}
