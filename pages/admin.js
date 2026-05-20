import Head from 'next/head';
import { useState } from 'react';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [giftyId, setGiftyId] = useState('');
  const [months, setMonths] = useState('1');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function doAction(action) {
    if (!giftyId.trim()) { setResult({ error: 'Zadaj Gifty ID' }); return; }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/admin-premium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, giftyId: giftyId.trim().toUpperCase(), action, months }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setResult({ error: e.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head><title>Gifty Admin</title></Head>
      <div className="page-bg">
        <div className="card" style={{ maxWidth: 480 }}>
          <div className="card-hero" style={{ height: 120 }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(123,92,245,.4) 0%, transparent 65%)' }} />
            <img src="/weblogo.png" alt="Gifty" className="logo-img" style={{ position: 'relative', zIndex: 2 }} />
          </div>

          <div className="card-body">
            <div className="badge"><span className="badge-dot" />Admin Panel</div>

            {!loggedIn ? (
              <div>
                <div className="heading" style={{ marginBottom: 20 }}>Prihlásenie</div>
                <input className="input" type="password" placeholder="Admin heslo" value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && password && setLoggedIn(true)}
                  style={{ marginBottom: 12 }} />
                <button className="btn-primary" onClick={() => password && setLoggedIn(true)}>
                  Prihlásiť sa
                </button>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div className="heading" style={{ marginBottom: 0 }}>Premium správa</div>
                  <button onClick={() => { setLoggedIn(false); setPassword(''); }} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 13 }}>
                    Odhlásiť
                  </button>
                </div>

                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', letterSpacing: 1, display: 'block', marginBottom: 6 }}>GIFTY ID</label>
                <input className="input" type="text" placeholder="GIFTY-XXXX-XXXX"
                  value={giftyId} onChange={e => setGiftyId(e.target.value.toUpperCase())}
                  style={{ marginBottom: 12 }} />

                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', letterSpacing: 1, display: 'block', marginBottom: 6 }}>MESIACE</label>
                <input className="input" type="number" min="1" max="24" value={months}
                  onChange={e => setMonths(e.target.value)}
                  style={{ marginBottom: 16 }} />

                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <button className="btn-primary" onClick={() => doAction('activate')} disabled={loading} style={{ flex: 2 }}>
                    {loading ? <span className="spinner" /> : '✅ Aktivovať Premium'}
                  </button>
                  <button className="btn-secondary" onClick={() => doAction('check')} disabled={loading} style={{ flex: 1 }}>
                    🔍 Check
                  </button>
                </div>
                <button className="btn-secondary" onClick={() => doAction('deactivate')} disabled={loading} style={{ borderColor: '#EF4444', color: '#EF4444' }}>
                  ❌ Deaktivovať Premium
                </button>

                {result && (
                  <div style={{ marginTop: 16, padding: 14, background: result.error ? 'rgba(239,68,68,.1)' : 'rgba(34,197,94,.1)', border: `1px solid ${result.error ? 'rgba(239,68,68,.3)' : 'rgba(34,197,94,.3)'}`, borderRadius: 12, fontSize: 13 }}>
                    {result.error ? `❌ ${result.error}` : result.message || JSON.stringify(result.user, null, 2)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
