import Head from 'next/head';
import { useState, useEffect } from 'react';

export default function TombolaPage({ tombola, code }) {
  const [name, setName] = useState('');
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [participants, setParticipants] = useState(tombola?.participantCount || 0);
  const [results, setResults] = useState(tombola?.results || null);
  const [myResult, setMyResult] = useState(null);
  const [myTicket, setMyTicket] = useState(null); // { vs, qrImage }

  const isDrawn = tombola?.status === 'drawn';
  const isClosed = tombola?.status === 'closed';

  async function handleJoin() {
    if (!name.trim()) { setError('Zadaj svoje meno'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/tombola-join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Chyba'); return; }
      setJoined(true);
      setParticipants(data.participantCount);
      if (data.ticket) setMyTicket(data.ticket);
      if (data.results) {
        setResults(data.results);
        const mine = data.results.find(r => r.winnerName === name.trim());
        setMyResult(mine || null);
      }
    } catch (e) {
      setError('Chyba siete');
    } finally {
      setLoading(false);
    }
  }

  if (!tombola) {
    return (
      <>
        <Head><title>Gifty — Tombola nenájdená</title></Head>
        <div className="page-bg">
          <div className="card">
            <div className="card-hero">
              <span style={{ fontSize: 56 }}>🎟️</span>
            </div>
            <div className="card-body">
              <div className="heading">Tombola nenájdená</div>
              <p className="desc">Skontroluj odkaz alebo naskenuj QR kód znovu.</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{`${tombola.title} — Gifty Tombola`}</title>
        <meta name="description" content={`Zapoj sa do tomboly: ${tombola.title}`} />
        <meta property="og:title" content={`🎟️ ${tombola.title}`} />
        <meta property="og:description" content={`Zapoj sa do tomboly a vyhraj skvelé ceny!`} />
        <meta property="og:image" content="https://gifty.cloud/og-image.png" />
      </Head>

      <div className="page-bg">
        <div className="card" style={{ maxWidth: 460 }}>
          {/* Hero */}
          <div className="card-hero" style={{ height: 160 }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(123,92,245,.4) 0%, transparent 65%)' }} />
            <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
              <div style={{ fontSize: 52, marginBottom: 4 }}>🎟️</div>
              <img src="/weblogo.png" alt="Gifty" style={{ width: 80, mixBlendMode: 'screen', filter: 'drop-shadow(0 4px 12px rgba(123,92,245,.5))' }} />
            </div>
          </div>

          <div className="card-body">
            <div className="badge">
              <span className="badge-dot" />
              {isDrawn ? 'Výsledky tomboly' : isClosed ? 'Tombola uzavretá' : 'Živá tombola'}
            </div>

            <div className="heading">{tombola.title}</div>

            {tombola.description && (
              <p className="desc">{tombola.description}</p>
            )}

            {/* Ceny */}
            {tombola.prizes?.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', letterSpacing: 1, marginBottom: 10 }}>CENY</div>
                {tombola.prizes.map((prize, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--surface2)', borderRadius: 12, marginBottom: 6, border: '1px solid var(--border)' }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--violet-pale)', border: '1px solid var(--violet-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: 'var(--violet-light)', flexShrink: 0 }}>
                      {i + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{prize.name}</div>
                      {prize.description && <div style={{ fontSize: 12, color: 'var(--muted)' }}>{prize.description}</div>}
                    </div>
                    {/* Výherca ak je known */}
                    {isDrawn && prize.winner && (
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#A78BFA', background: 'var(--violet-pale)', padding: '3px 8px', borderRadius: 6 }}>
                        🏆 {prize.winner}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Môj výsledok */}
            {isDrawn && joined && myResult && (
              <div style={{ padding: 20, background: 'linear-gradient(135deg, rgba(123,92,245,.15), rgba(192,132,252,.1))', border: '1px solid var(--violet-border)', borderRadius: 16, marginBottom: 20, textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
                <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Vyhral(a) si!</div>
                <div style={{ fontSize: 15, color: 'var(--violet-light)', fontWeight: 600 }}>{myResult.prizeName}</div>
              </div>
            )}

            {isDrawn && joined && !myResult && (
              <div style={{ padding: 16, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 12, marginBottom: 20, textAlign: 'center' }}>
                <div style={{ fontSize: 14, color: 'var(--muted)' }}>Tentokrát sa nám to nevyšlo 😔<br />Skúsime to nabudúce!</div>
              </div>
            )}

            <div className="divider" />

            {/* Počet účastníkov */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: isDrawn ? '#A78BFA' : '#22C55E', boxShadow: isDrawn ? 'none' : '0 0 6px 2px rgba(34,197,94,.4)' }} />
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                {participants} {participants === 1 ? 'účastník' : participants < 5 ? 'účastníci' : 'účastníkov'} zapojených
              </span>
            </div>

            {/* Join form */}
            {!joined && !isDrawn && !isClosed && (
              <div>
                <input
                  className="input"
                  type="text"
                  placeholder="Tvoje meno..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleJoin()}
                  style={{ marginBottom: 10 }}
                  maxLength={50}
                />
                {error && <div style={{ fontSize: 12, color: '#EF4444', marginBottom: 8 }}>{error}</div>}
                <button className="btn-primary" onClick={handleJoin} disabled={loading}>
                  {loading ? <span className="spinner" /> : '🎟️ Zapojiť sa do tomboly'}
                </button>
              </div>
            )}

            {joined && !isDrawn && !myTicket && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #22C55E, #16A34A)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', boxShadow: '0 8px 24px rgba(34,197,94,.3)' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 6 }}>Si zapojený(á)!</div>
                <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>Čakaj na žrebovanie.<br/>Výsledky sa zobrazia priamo tu.</div>
              </div>
            )}

            {/* Platený lístok — QR + VS */}
            {joined && myTicket && !isDrawn && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)', letterSpacing: 1, marginBottom: 12 }}>
                  ZAPLAŤ ZA LÍSTOK
                </div>
                <div style={{ padding: 16, background: 'var(--surface2)', borderRadius: 16, border: '1px solid var(--border)', marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: 'var(--muted)' }}>Suma</span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--violet-light)' }}>€{myTicket.price?.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: 'var(--muted)' }}>Variabilný symbol</span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', cursor: 'pointer' }}
                      onClick={() => navigator.clipboard?.writeText(myTicket.vs)}>
                      {myTicket.vs} 📋
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, color: 'var(--muted)' }}>IBAN</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', cursor: 'pointer' }}
                      onClick={() => navigator.clipboard?.writeText(myTicket.iban)}>
                      {myTicket.iban?.slice(0, 8)}... 📋
                    </span>
                  </div>
                </div>

                {myTicket.qrImage && (
                  <div style={{ textAlign: 'center', marginBottom: 12 }}>
                    <div style={{ display: 'inline-block', padding: 12, background: '#fff', borderRadius: 12 }}>
                      <img src={myTicket.qrImage} alt="QR platba" style={{ width: 200, height: 200 }} />
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
                      Naskenuj v bankovej appke a zaplať
                    </div>
                  </div>
                )}

                <div style={{ padding: 12, background: 'rgba(245,158,11,0.1)', borderRadius: 12, border: '1px solid rgba(245,158,11,0.3)', fontSize: 13, color: '#F59E0B', textAlign: 'center' }}>
                  ⏳ Po zaplatení organizátor potvrdí tvoj lístok
                </div>
              </div>
            )}

            {isClosed && !isDrawn && (
              <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--muted)', fontSize: 14 }}>
                Tombola je uzavretá.
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: 20, fontSize: 12, color: 'rgba(255,255,255,.2)', textAlign: 'center' }}>
          Powered by <a href="https://gifty.cloud" style={{ color: 'var(--violet-light)', textDecoration: 'none' }}>Gifty</a>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps({ params }) {
  const { code } = params;
  let tombola = null;

  try {
    const { initFirebaseAdmin } = require('../../lib/firebaseAdmin');
    const admin = initFirebaseAdmin();
    const db = admin.firestore();

    const snap = await db.collection('tombolas').where('code', '==', code.toUpperCase()).limit(1).get();
    if (!snap.empty) {
      const doc = snap.docs[0];
      const data = doc.data();

      // Načítaj počet účastníkov
      const participantsSnap = await db.collection('tombolas').doc(doc.id).collection('participants').get();

      tombola = {
        id: doc.id,
        title: data.title || 'Tombola',
        description: data.description || null,
        status: data.status || 'open',
        prizes: (data.prizes || []).map(p => ({
          name: p.name,
          description: p.description || null,
          winner: p.winner || null,
        })),
        participantCount: participantsSnap.size,
        results: data.results || null,
      };
    }
  } catch (e) {
    console.log('Tombola load error:', e.message);
  }

  return { props: { tombola, code: code.toUpperCase() } };
}
