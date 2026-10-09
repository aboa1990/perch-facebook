import { ImageResponse } from 'next/og';
import { getProducts } from '@/lib/products';
import { renderPost, W, H } from '@/lib/layouts';

export const runtime = 'edge';

async function font(origin: string, file: string) {
  const res = await fetch(`${origin}/fonts/${file}`);
  if (!res.ok) throw new Error(`Font file missing: /fonts/${file} (status ${res.status}). Upload the public/fonts folder to GitHub.`);
  return res.arrayBuffer();
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const products = await getProducts();
    const p = products.find((x) => x.id === url.searchParams.get('id')) ?? products[0];
    const w = url.searchParams.get('w');
    const [regular, bold, serif] = await Promise.all([
      font(url.origin, 'dm-sans-400.woff'), font(url.origin, 'dm-sans-700.woff'), font(url.origin, 'fraunces-700.woff'),
    ]);
    return new ImageResponse(renderPost(p, `${url.origin}/logo-white.png`, w ? Number(w) : undefined), {
      width: W, height: H,
      fonts: [
        { name: 'DM Sans', data: regular, weight: 400, style: 'normal' },
        { name: 'DM Sans', data: bold, weight: 700, style: 'normal' },
        { name: 'Fraunces', data: serif, weight: 700, style: 'normal' },
      ],
    });
  } catch (e) {
    return new Response('Render error: ' + (e instanceof Error ? e.message : String(e)), { status: 500 });
  }
}
