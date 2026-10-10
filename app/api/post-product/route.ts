import { getProducts } from '@/lib/products';
import { postProduct, nextOpenTime } from '@/lib/facebook';

export const maxDuration = 60;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Your store calls this right after a new product is saved:
//   POST /api/post-product   Authorization: Bearer <CRON_SECRET>   body: {"id": "<product id>"}
export async function POST(req: Request) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) return new Response('Unauthorized', { status: 401 });
  const { id } = await req.json().catch(() => ({} as any));
  if (!id) return Response.json({ ok: false, error: 'Send {"id": "PRODUCT_ID"}' }, { status: 400 });

  let p = (await getProducts()).find((x) => x.id === String(id));
  if (!p) { await sleep(4000); p = (await getProducts()).find((x) => x.id === String(id)); } // the store list can lag a moment
  if (!p) return Response.json({ ok: false, error: 'Product not found, or hidden / out of stock / no photo.' }, { status: 404 });

  const when = nextOpenTime();
  const origin = process.env.APP_URL ?? new URL(req.url).origin;
  const result = await postProduct(p, origin, when);
  return Response.json({ product: p.name, publishAt: when ? new Date(when).toISOString() : 'now', ...result });
}
