'use client';
import { useState } from 'react';

type Item = { id: string; name: string; brand: string; price: number; image: string };
type View = { item: Item; caption: string; stamp: number };

const btn = { border: 0, borderRadius: 999, padding: '12px 18px', fontSize: 16, fontWeight: 700, cursor: 'pointer', textDecoration: 'none', display: 'inline-block', textAlign: 'center' } as const;
const small = { ...btn, padding: '8px 14px', fontSize: 14 } as const;

export default function Admin() {
  const [secret, setSecret] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState<View | null>(null);
  const auth = { Authorization: `Bearer ${secret}` };

  async function load() {
    setMsg('Loading products…');
    const r = await fetch('/api/admin?action=list', { headers: auth });
    if (!r.ok) return setMsg(r.status === 401 ? 'Wrong secret.' : 'Could not load the products.');
    setItems(await r.json());
    setMsg('');
  }

  async function openPreview(it: Item) {
    setView({ item: it, caption: '', stamp: Date.now() });
    setMsg('Writing the caption…');
    const r = await fetch(`/api/admin?action=caption&id=${it.id}`, { headers: auth });
    const j = await r.json().catch(() => ({} as any));
    setView((v) => (v && v.item.id === it.id ? { ...v, caption: j.caption ?? '' } : v));
    setMsg(j.caption ? '' : 'Could not write the caption.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function postNow(it: Item, caption?: string) {
    setBusy(true); setMsg(`Posting "${it.name}"…`);
    const r = await fetch('/api/post-product', { method: 'POST', headers: { ...auth, 'Content-Type': 'application/json' }, body: JSON.stringify({ id: it.id, now: true, caption }) });
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

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
    setMsg('Copied. Paste it into your Facebook post.');
  }

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: 20, fontFamily: 'system-ui, sans-serif', color: '#4A2F3A' }}>
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

      {view ? (
        <section style={{ background: '#fff', borderRadius: 16, padding: 16, marginTop: 12, border: '2px solid #8A5A6B' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <strong>{view.item.name}</strong>
            <button onClick={() => setView(null)} style={{ ...small, background: '#F3DCE3', color: '#4A2F3A' }}>Close</button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ flex: '1 1 260px', maxWidth: 340 }}>
              <img src={`/api/render?id=${view.item.id}&v=${view.stamp}`} alt="Post picture" style={{ width: '100%', borderRadius: 12, background: '#eee' }} />
              <a href={`/api/render?id=${view.item.id}&v=${view.stamp}`} download={`perch-${view.item.id}.png`} style={{ ...small, background: '#F3DCE3', color: '#4A2F3A', marginTop: 10, width: '100%', boxSizing: 'border-box' }}>Download picture</a>
            </div>
            <div style={{ flex: '1 1 260px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <textarea value={view.caption} onChange={(e) => setView({ ...view, caption: e.target.value })} rows={11} placeholder="Writing the caption…" style={{ width: '100%', boxSizing: 'border-box', padding: 12, fontSize: 16, borderRadius: 10, border: '1px solid #cbb', fontFamily: 'inherit' }} />
              <button onClick={() => copy(view.caption)} disabled={!view.caption} style={{ ...btn, background: '#F3DCE3', color: '#4A2F3A' }}>Copy caption</button>
              <button onClick={() => postNow(view.item, view.caption)} disabled={busy || !view.caption} style={{ ...btn, background: '#8A5A6B', color: '#fff' }}>Post this to Facebook</button>
            </div>
          </div>
        </section>
      ) : null}

      {items.map((it) => (
        <div key={it.id} style={{ display: 'flex', gap: 12, background: '#fff', borderRadius: 14, padding: 12, marginTop: 12 }}>
          <img src={it.image} alt="" width={84} height={110} style={{ objectFit: 'cover', borderRadius: 10 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700 }}>{it.name}</div>
            <div style={{ fontSize: 14, color: '#8A5A6B' }}>MVR {it.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
              <button onClick={() => openPreview(it)} style={{ ...small, background: '#F3DCE3', color: '#4A2F3A' }}>Preview</button>
              <button onClick={() => postNow(it)} disabled={busy} style={{ ...small, background: '#8A5A6B', color: '#fff' }}>Post now</button>
            </div>
          </div>
        </div>
      ))}
    </main>
  );
}
