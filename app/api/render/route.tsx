import { ImageResponse } from 'next/og';
import { getProducts, type Product } from '@/lib/products';
import { designForWeek, type Palette } from '@/lib/config';

export const runtime = 'edge';
const money = (n: number) => `MVR ${n.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

const Badges = ({ p }: { p: Product }) => (
  <>
    {p.discount ? <div style={{ position: 'absolute', top: 24, left: 24, display: 'flex', background: '#D6204F', color: '#fff', borderRadius: 999, padding: '10px 26px', fontSize: 32, fontWeight: 700 }}>{`-${p.discount}%`}</div> : null}
    {p.stock <= 3 ? <div style={{ position: 'absolute', bottom: 24, left: 24, display: 'flex', background: '#FFF3D6', color: '#7A4300', borderRadius: 999, padding: '10px 26px', fontSize: 26, fontWeight: 700 }}>{`Only ${p.stock} left`}</div> : null}
  </>
);

const Photo = ({ p, pal, radius, style }: { p: Product; pal: Palette; radius: any; style: any }) => (
  <div style={{ display: 'flex', position: 'relative', overflow: 'hidden', background: pal.soft, borderRadius: radius, ...style }}>
    <img src={p.image} width={1000} height={1000} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
    <Badges p={p} />
  </div>
);

const Head = ({ pal, logo, p }: { pal: Palette; logo: string; p: Product }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 36, letterSpacing: 10 }}>
      <img src={logo} width={48} height={64} />
      <span>PERCH</span>
    </div>
    {p.brand ? <div style={{ display: 'flex', fontSize: 24, fontWeight: 700, letterSpacing: 3, border: `2px solid ${pal.ink}`, borderRadius: 999, padding: '8px 22px' }}>{p.brand.toUpperCase()}</div> : null}
  </div>
);

const Info = ({ p, size }: { p: Product; size: number }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <div style={{ display: 'flex', fontSize: size, fontWeight: 700, lineHeight: 1.05 }}>{p.name}</div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
      <span style={{ fontSize: 50, fontWeight: 700 }}>{money(p.price)}</span>
      {p.oldPrice ? <span style={{ fontSize: 30, textDecoration: 'line-through', opacity: 0.8 }}>{money(p.oldPrice)}</span> : null}
    </div>
  </div>
);

const Cta = ({ pal }: { pal: Palette }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
    <div style={{ display: 'flex', background: pal.btnBg, color: pal.btnInk, borderRadius: 999, padding: '20px 38px', fontSize: 30, fontWeight: 700 }}>Shop now</div>
    <div style={{ display: 'flex', fontSize: 22 }}>Delivered across the Upper North</div>
  </div>
);

export async function GET(req: Request) {
  const url = new URL(req.url);
  const products = await getProducts();
  const p = products.find((x) => x.id === url.searchParams.get('id')) ?? products[0];
  const w = url.searchParams.get('w');
  const { palette: pal, layout } = designForWeek(w ? Number(w) : undefined);
  const logo = `${url.origin}/${pal.dark ? 'logo-white' : 'logo-mauve'}.png`;
  const root = { width: '100%', height: '100%', display: 'flex', background: pal.bg, color: pal.ink, padding: 56 } as const;

  let body;
  if (layout === 'frame') {
    body = (
      <div style={{ ...root, flexDirection: 'column', gap: 28 }}>
        <Head pal={pal} logo={logo} p={p} />
        <Photo p={p} pal={pal} radius={28} style={{ flex: 1 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 32 }}>
          <Info p={p} size={56} /><Cta pal={pal} />
        </div>
      </div>
    );
  } else if (layout === 'split') {
    body = (
      <div style={{ ...root, gap: 48 }}>
        <div style={{ display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'space-between' }}>
          <Head pal={pal} logo={logo} p={{ ...p, brand: '' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {p.brand ? <div style={{ display: 'flex', fontSize: 26, fontWeight: 700, letterSpacing: 4 }}>{p.brand.toUpperCase()}</div> : null}
            {p.discount ? <div style={{ display: 'flex', fontSize: 200, fontWeight: 700, lineHeight: 0.9 }}>{`-${p.discount}%`}</div> : null}
            <Info p={p} size={46} />
          </div>
          <Cta pal={pal} />
        </div>
        <Photo p={p} pal={pal} radius="230px 230px 28px 28px" style={{ width: 460 }} />
      </div>
    );
  } else {
    body = (
      <div style={{ ...root, flexDirection: 'column', alignItems: 'center', gap: 28 }}>
        <Head pal={pal} logo={logo} p={p} />
        <Photo p={p} pal={pal} radius={290} style={{ width: 580, height: 580, border: `12px solid ${pal.btnBg}` }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}><Info p={p} size={54} /></div>
        <Cta pal={pal} />
      </div>
    );
  }
  return new ImageResponse(body, { width: 1080, height: 1350 });
}
