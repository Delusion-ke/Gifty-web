import Head from 'next/head';

// Read content from existing HTML files and convert to React
export default function PrivacyPage() {
  return (
    <>
      <Head>
        <title>Gifty — Ochrana súkromia</title>
        <meta name="description" content="Ochrana osobných údajov — Gifty" />
      </Head>
      <div className="page-bg" style={{ alignItems: 'flex-start', justifyContent: 'flex-start', padding: '60px 20px' }}>
        <div style={{ maxWidth: 720, width: '100%', margin: '0 auto' }}>
          <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--violet-light)', textDecoration: 'none', fontSize: 14, marginBottom: 32 }}>
            ← Späť na Gifty
          </a>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Ochrana súkromia</h1>
          <p style={{ color: 'var(--muted)', marginBottom: 40 }}>Posledná aktualizácia: Máj 2026</p>

          <div style={{ color: 'var(--muted)', lineHeight: 1.8, fontSize: 15 }}>
            <h2 style={{ color: 'var(--text)', fontSize: 20, fontWeight: 700, marginBottom: 12 }}>1. Aké údaje zbierame</h2>
            <p style={{ marginBottom: 20 }}>Zbierame len údaje nevyhnutné pre fungovanie aplikácie: meno, e-mail, profilová fotka, IBAN (voliteľné) a dátumy (narodeniny, meniny).</p>

            <h2 style={{ color: 'var(--text)', fontSize: 20, fontWeight: 700, marginBottom: 12 }}>2. Ako používame vaše údaje</h2>
            <p style={{ marginBottom: 20 }}>Údaje používame výlučne na poskytovanie služieb Gifty — správu wishlistov, skupín a udalostí. IBAN zdieľame len s priateľmi, ktorým ste to výslovne povolili.</p>

            <h2 style={{ color: 'var(--text)', fontSize: 20, fontWeight: 700, marginBottom: 12 }}>3. Tretie strany</h2>
            <p style={{ marginBottom: 20 }}>Využívame Firebase (Google) na autentifikáciu a databázu, a Expo na push notifikácie. Nepredávame vaše údaje tretím stranám.</p>

            <h2 style={{ color: 'var(--text)', fontSize: 20, fontWeight: 700, marginBottom: 12 }}>4. Vymazanie údajov</h2>
            <p style={{ marginBottom: 20 }}>Môžete požiadať o vymazanie vášho účtu a všetkých údajov na stránke <a href="/delete-account" style={{ color: 'var(--violet-light)' }}>gifty.cloud/delete-account</a>.</p>

            <h2 style={{ color: 'var(--text)', fontSize: 20, fontWeight: 700, marginBottom: 12 }}>5. Kontakt</h2>
            <p>Pri otázkach nás kontaktujte na <a href="mailto:info@gifty.cloud" style={{ color: 'var(--violet-light)' }}>info@gifty.cloud</a>.</p>
          </div>
        </div>
      </div>
    </>
  );
}
