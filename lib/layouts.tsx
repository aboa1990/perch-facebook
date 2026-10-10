import type { Product } from './products';
import { designForWeek } from './config';

export const W = 1080;
export const H = 1350;
const money = (n: number) => `MVR ${n.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

// Long store titles never fit a post. Keep the part before a dash or comma, then trim to a clean 2 lines.
export function shortName(raw: string, max = 60) {
  let n = raw.replace(/[\u2018\u2019]/g, "'").trim();
  const cut = n.split(/\s[\u2013\u2014|-]\s|,\s/)[0];
  if (cut.length >= 12) n = cut;
  if (n.length > max) n = n.slice(0, max).replace(/\s+\S*$/, '').replace(/\s+(with|and|&|for|of|in|the|a)$/i, '') + '\u2026';
  return n;
}

const Photo = ({ p, height = H }: { p: Product; height?: number }) => (
  <div style={{ position: 'absolute', top: 0, left: 0, width: W, height, display: 'flex', background: '#1b1b1b' }}>
    <img src={p.image} width={W} height={height} style={{ width: W, height, objectFit: 'cover' }} />
  </div>
);

// Dark fade at the top so the white logo always reads, plus the discount sticker.
const Top = ({ logo, p, tag }: { logo: string; p: Product; tag?: string }) => (
  <div style={{ position: 'absolute', top: 0, left: 0, width: W, height: 300, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '52px 56px 0', boxSizing: 'border-box', background: 'linear-gradient(to bottom, rgba(0,0,0,0.55), rgba(0,0,0,0))' }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: '#FFFFFF', fontFamily: 'DM Sans', fontSize: 40, fontWeight: 400, letterSpacing: 10 }}>
        <img src={logo} width={48} height={64} />
        <span>PERCH</span>
      </div>
      {tag ? <div style={{ display: 'flex', background: '#FFFFFF', color: '#4A2F3A', borderRadius: 999, padding: '8px 26px', fontFamily: 'DM Sans', fontSize: 28, fontWeight: 700, letterSpacing: 5 }}>NEW IN</div> : null}
    </div>
    {p.discount ? (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 176, height: 176, borderRadius: 88, background: '#D6204F', color: '#FFFFFF', fontFamily: 'DM Sans' }}>
        <span style={{ fontSize: 66, fontWeight: 700, lineHeight: 1 }}>{`-${p.discount}%`}</span>
        <span style={{ fontSize: 28, fontWeight: 700, letterSpacing: 5 }}>OFF</span>
      </div>
    ) : null}
  </div>
);

const Info = ({ p, ink, priceInk, line, compact }: { p: Product; ink: string; priceInk: string; line: string; compact?: boolean }) => {
  const name = shortName(p.name);
  const n = name.length;
  const nameSize = (n <= 22 ? 76 : n <= 32 ? 66 : n <= 40 ? 58 : n <= 50 ? 52 : 46) - (compact ? 8 : 0);
  const brand = p.brand && p.brand.toUpperCase() !== 'PERCH' ? p.brand.toUpperCase() : '';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 14, color: ink }}>
      <div style={{ display: 'flex', justifyContent: brand ? 'space-between' : 'flex-start', alignItems: 'center', width: '100%' }}>
        <div style={{ display: 'flex', fontFamily: 'DM Sans', fontSize: 30, fontWeight: 700, letterSpacing: 5 }}>{brand}</div>
        {p.stock <= 3 ? (
          <div style={{ display: 'flex', background: '#FFF3D6', color: '#7A4300', borderRadius: 999, padding: '8px 24px', fontFamily: 'DM Sans', fontSize: 30, fontWeight: 700 }}>{`Only ${p.stock} left`}</div>
        ) : null}
      </div>
      <div style={{ display: 'flex', width: '100%', fontFamily: 'Fraunces', fontSize: nameSize, fontWeight: 700, lineHeight: 1.1 }}>{name}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 20, fontFamily: 'DM Sans' }}>
        <span style={{ fontSize: 76, fontWeight: 700, color: priceInk }}>{money(p.price)}</span>
        {p.oldPrice ? <span style={{ fontSize: 40, fontWeight: 400, textDecoration: 'line-through', opacity: 0.75 }}>{money(p.oldPrice)}</span> : null}
      </div>
      <div style={{ display: 'flex', width: '100%', height: 2, background: line, opacity: 0.35, marginTop: 6 }} />
      <div style={{ display: 'flex', fontFamily: 'DM Sans', fontSize: 32, fontWeight: 400 }}>Delivered across the Upper North</div>
    </div>
  );
};

export function renderPost(p: Product, logo: string, week?: number, tag?: string) {
  const { palette: pal, layout } = designForWeek(week);
  const root = { width: W, height: H, display: 'flex', position: 'relative', background: '#111' } as const;

  if (layout === 'card') {
    return (
      <div style={root}>
        <Photo p={p} />
        <Top logo={logo} p={p} tag={tag} />
        <div style={{ position: 'absolute', left: 48, right: 48, bottom: 48, display: 'flex', flexDirection: 'column', background: '#FFFFFF', borderRadius: 36, padding: '40px 44px', boxShadow: '0 24px 70px rgba(0,0,0,0.4)' }}>
          <Info p={p} ink="#4A2F3A" priceInk="#C01A45" line="#4A2F3A" />
        </div>
      </div>
    );
  }
  if (layout === 'panel') {
    return (
      <div style={{ ...root, background: pal.sheet }}>
        <Photo p={p} height={1010} />
        <Top logo={logo} p={p} tag={tag} />
        <div style={{ position: 'absolute', left: 0, bottom: 0, width: W, display: 'flex', flexDirection: 'column', background: pal.sheet, borderRadius: '56px 56px 0 0', padding: '48px 56px 52px', boxSizing: 'border-box' }}>
          <Info p={p} ink={pal.sheetInk} priceInk={pal.sheetInk} line={pal.sheetInk} />
        </div>
      </div>
    );
  }
  return (
    <div style={root}>
      <Photo p={p} />
      <div style={{ position: 'absolute', left: 0, bottom: 0, width: W, height: 760, display: 'flex', background: `linear-gradient(to top, ${pal.tint} 0%, ${pal.tint} 58%, rgba(0,0,0,0) 100%)` }} />
      <Top logo={logo} p={p} tag={tag} />
      <div style={{ position: 'absolute', left: 56, right: 56, bottom: 60, display: 'flex', flexDirection: 'column' }}>
        <Info p={p} ink="#FFFFFF" priceInk="#FFFFFF" line="#FFFFFF" />
      </div>
    </div>
  );
}
