import Head from 'next/head';
import { useState } from 'react';

export default function DeleteAccountPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!email.trim()) return;
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch('/api/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setStatus(data.success ? 'success' : 'error');
    } catch (e) {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Gifty — Vymazanie účtu</title>
      </Head>
      <div className="page-bg">
        <div className="card">
          <div className="card-hero" style={{ height: 140 }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(239,68,68,.2) 0%, transparent 65%)' }} />
            <img src="/weblogo.png" alt="Gifty" className="logo-img" style={{ position: 'relative', zIndex: 2 }} />
          </div>

          <div className="card-body">
            <div className="badge" style={{ background: 'rgba(239,68,68,.1)', borderColor: 'rgba(239,68,68,.2)' }}>
              <span className="badge-dot" style={{ background: '#EF4444', boxShadow: '0 0 6px 2px rgba(239,68,68,.4)' }} />
              Vymazanie účtu
            </div>

            {status === 'success' ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                <div className="heading">Účet bol vymazaný</div>
                <p className="desc">Všetky tvoje dáta boli trvalo odstránené z našich serverov.</p>
              </div>
            ) : (
              <>
                <div className="heading">Vymazať môj účet</div>
                <p className="desc">Zadaj e-mailovú adresu svojho Gifty účtu. Všetky tvoje dáta budú trvalo vymazané.</p>

                <input
                  className="input"
                  type="email"
                  placeholder="tvoj@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ marginBottom: 12 }}
                />

                {status === 'error' && (
                  <div style={{ fontSize: 13, color: '#EF4444', marginBottom: 12 }}>
                    ❌ Účet nebol nájdený alebo nastala chyba.
                  </div>
                )}

                <button
                  onClick={handleDelete}
                  disabled={loading || !email.trim()}
                  style={{ width: '100%', padding: '13px 20px', background: loading ? 'rgba(239,68,68,.5)' : '#EF4444', color: '#fff', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  {loading ? <span className="spinner" /> : '🗑️ Vymazať môj účet'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
