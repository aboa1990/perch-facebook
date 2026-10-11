'use client';
import { useState } from 'react';

type Item = { id: string; name: string; brand: string; price: number; image: string };

const btn = { border: 0, borderRadius: 999, padding: '12px 18px', fontSize: 16, fontWeight: 700, cursor: 'pointer' } as const;

export default function Admin() {
  const [secret, setSecret] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const auth = { Authorization: `Bearer ${secret}` };

  async function load() {
    setMsg('Loading products…');
    const r = await fetch('/api/admin?action=list', { headers: auth });
    if (!r.ok) return setMsg(r.status === 401 ? 'Wrong secret.' : 'Could not load the products.');
    setItems(await r.json());
    setMsg('');
  }

  async function postNow(it: Item) {
    setBusy(true); setMsg(`Posting "${it.name}"…`);
    const r = await fetch('/api/post-product', { method: 'POST', headers: { ...auth, 'Content-Type': 'application/json' }, body: JSON.stringify({ id: it.id, now: true }) });
    const j = await r.json().catch(() => ({} as any));
    setBusy(false);
    setMsg(j.ok ? `Posted to Facebook: ${it.name}` : `Facebook said: ${j.response?.error?.message ?? j.error ?? 'error ' + r.status}`);
  }

  async function runBatch() {
    setBusy(true); setMsg("Scheduling today's posts…");
    const r = await fetch('/api/cron/post', { headers: auth });
    const j = await r.json().catch(() => null);
    setBusy(false);
    if (!Array.isArray(j)) return setMsg(r.status === 401 ? 'Wrong secret.' : 'Something went wrong.');
    const ok = j.filter((x: any) => x.ok).length;
    const bad = j.find((x: any) => !x.ok);
    setMsg(`${ok} of ${j.length} posts scheduled.` + (bad ? ` Facebook said: ${bad.response?.error?.message}` : ''));
  }

  async function copyCaption(it: Item) {
    setMsg('Writing the caption…');
    const r = await fetch(`/api/admin?action=caption&id=${it.id}`, { headers: auth });
    const j = await r.json().catch(() => ({} as any));
    if (!j.caption) return setMsg('Could not write the caption.');
    await navigator.clipboard.writeText(j.caption);
    setMsg('Caption copied. Paste it into your Facebook post.');
  }

  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: 20, fontFamily: 'system-ui, sans-serif', color: '#4A2F3A' }}>
      <h1 style={{ margin: '0 0 4px' }}>PERCH Poster</h1>
      <p style={{ marginTop: 0, color: '#8A5A6B' }}>Post products to Facebook by hand.</p>

      {items.length === 0 ? (
        <div style={{ display: 'flex', gap: 10 }}>
          <input type="password" value={secret} onChange={(e) => setSecret(e.target.value)} placeholder="Your secret" style={{ flex: 1, padding: 12, fontSize: 16, borderRadius: 10, border: '1px solid #cbb' }} />
          <button onClick={load} style={{ ...btn, background: '#8A5A6B', color: '#fff' }}>Open</button>
        </div>
      ) : (
        <button onClick={runBatch} disabled={busy} style={{ ...btn, background: '#4A2F3A', color: '#fff', width: '100%' }}>Run today&apos;s batch (schedule posts)</button>
      )}

      {msg ? <p style={{ background: '#fff', border: '1px solid #e3d3d9', borderRadius: 10, padding: 12 }}>{msg}</p> : null}

      {items.map((it) => (
        <div key={it.id} style={{ display: 'flex', gap: 12, background: '#fff', borderRadius: 14, padding: 12, marginTop: 12 }}>
          <img src={it.image} alt="" width={84} height={110} style={{ objectFit: 'cover', borderRadius: 10 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700 }}>{it.name}</div>
            <div style={{ fontSize: 14, color: '#8A5A6B' }}>MVR {it.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
              <button onClick={() => postNow(it)} disabled={busy} style={{ ...btn, background: '#8A5A6B', color: '#fff', padding: '8px 14px', fontSize: 14 }}>Post now</button>
              <a href={`/api/render?id=${it.id}&v=${Date.now()}`} target="_blank" rel="noreferrer" style={{ ...btn, background: '#F3DCE3', color: '#4A2F3A', padding: '8px 14px', fontSize: 14, textDecoration: 'none' }}>Image</a>
              <button onClick={() => copyCaption(it)} style={{ ...btn, background: '#F3DCE3', color: '#4A2F3A', padding: '8px 14px', fontSize: 14 }}>Copy caption</button>
            </div>
          </div>
        </div>
      ))}
    </main>
  );
}
