import type { Product } from './products';
import { designForWeek, type Palette } from './config';

export const W = 1080;
export const H = 1350;
const money = (n: number) => `MVR ${n.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

const Photo = ({ p, height = H }: { p: Product; height?: number }) => (
  <div style={{ position: 'absolute', top: 0, left: 0, width: W, height, display: 'flex', background: '#1b1b1b' }}>
    <img src={p.image} width={W} height={height} style={{ width: W, height, objectFit: 'cover' }} />
  </div>
);

// Dark fade at the top so the white logo always reads, plus the discount sticker.
const Top = ({ logo, p }: { logo: string; p: Product }) => (
  <div style={{ position: 'absolute', top: 0, left: 0, width: W, height: 300, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '52px 56px 0', boxSizing: 'border-box', background: 'linear-gradient(to bottom, rgba(0,0,0,0.55), rgba(0,0,0,0))' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: '#FFFFFF', fontFamily: 'DM Sans', fontSize: 40, fontWeight: 400, letterSpacing: 10 }}>
      <img src={logo} width={48} height={64} />
      <span>PERCH</span>
    </div>
    {p.discount ? (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 176, height: 176, borderRadius: 88, background: '#D6204F', color: '#FFFFFF', fontFamily: 'DM Sans' }}>
        <span style={{ fontSize: 66, fontWeight: 700, lineHeight: 1 }}>{`-${p.discount}%`}</span>
        <span style={{ fontSize: 28, fontWeight: 700, letterSpacing: 5 }}>OFF</span>
      </div>
    ) : null}
  </div>
);

const Info = ({ p, ink, priceInk, compact }: { p: Product; ink: string; priceInk: string; compact?: boolean }) => {
  const n = p.name.length;
  const nameSize = compact ? (n > 30 ? 46 : 54) : n > 30 ? 56 : 68;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 10 : 14, color: ink }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', fontFamily: 'DM Sans', fontSize: 30, fontWeight: 700, letterSpacing: 5 }}>{p.brand.toUpperCase()}</div>
        {p.stock <= 3 ? (
          <div style={{ display: 'flex', background: '#FFF3D6', color: '#7A4300', borderRadius: 999, padding: '8px 24px', fontFamily: 'DM Sans', fontSize: 30, fontWeight: 700 }}>{`Only ${p.stock} left`}</div>
        ) : null}
      </div>
      <div style={{ display: 'flex', fontFamily: 'Fraunces', fontSize: nameSize, fontWeight: 700, lineHeight: 1.08 }}>{p.name}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 20, fontFamily: 'DM Sans' }}>
        <span style={{ fontSize: compact ? 58 : 68, fontWeight: 700, color: priceInk }}>{money(p.price)}</span>
        {p.oldPrice ? <span style={{ fontSize: 38, fontWeight: 400, textDecoration: 'line-through', opacity: 0.8 }}>{money(p.oldPrice)}</span> : null}
      </div>
    </div>
  );
};

const Cta = ({ bg, ink, sub, compact }: { bg: string; ink: string; sub: string; compact?: boolean }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, fontFamily: 'DM Sans' }}>
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%', background: bg, color: ink, borderRadius: 999, padding: compact ? '22px 0' : '26px 0', fontSize: 46, fontWeight: 700 }}>Shop now</div>
    <div style={{ display: 'flex', fontSize: 30, fontWeight: 400, color: sub }}>Delivered across the Upper North</div>
  </div>
);

export function renderPost(p: Product, logo: string, week?: number) {
  const { palette: pal, layout } = designForWeek(week);
  const root = { width: W, height: H, display: 'flex', position: 'relative', background: '#111' } as const;

  if (layout === 'card') {
    return (
      <div style={root}>
        <Photo p={p} />
        <Top logo={logo} p={p} />
        <div style={{ position: 'absolute', left: 48, right: 48, bottom: 48, display: 'flex', flexDirection: 'column', gap: 26, background: '#FFFFFF', borderRadius: 36, padding: 40 }}>
          <Info p={p} ink="#4A2F3A" priceInk="#C01A45" />
          <Cta bg={pal.accent} ink="#FFFFFF" sub="#4A2F3A" />
        </div>
      </div>
    );
  }
  if (layout === 'panel') {
    return (
      <div style={{ ...root, background: pal.sheet }}>
        <Photo p={p} height={930} />
        <Top logo={logo} p={p} />
        <div style={{ position: 'absolute', left: 0, bottom: 0, width: W, height: 500, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: pal.sheet, borderRadius: '56px 56px 0 0', padding: '44px 56px 48px', boxSizing: 'border-box' }}>
          <Info p={p} ink={pal.sheetInk} priceInk={pal.sheetInk} compact />
          <Cta bg={pal.sheetInk} ink={pal.sheet} sub={pal.sheetInk} compact />
        </div>
      </div>
    );
  }
  return (
    <div style={root}>
      <Photo p={p} />
      <div style={{ position: 'absolute', left: 0, bottom: 0, width: W, height: 840, display: 'flex', background: `linear-gradient(to top, ${pal.tint} 0%, ${pal.tint} 62%, rgba(0,0,0,0) 100%)` }} />
      <Top logo={logo} p={p} />
      <div style={{ position: 'absolute', left: 56, right: 56, bottom: 56, display: 'flex', flexDirection: 'column', gap: 30 }}>
        <Info p={p} ink="#FFFFFF" priceInk="#FFFFFF" />
        <Cta bg="#FFFFFF" ink="#2A1A21" sub="#FFFFFF" />
      </div>
    </div>
  );
}
