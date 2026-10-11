import { getProducts } from '@/lib/products';
import { writeCaption } from '@/lib/caption';

export const maxDuration = 60;

// Used by the /admin page. Needs the same secret as the other endpoints.
export async function GET(req: Request) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) return new Response('Unauthorized', { status: 401 });
  const url = new URL(req.url);
  const products = await getProducts();
  if (url.searchParams.get('action') === 'caption') {
    const p = products.find((x) => x.id === url.searchParams.get('id'));
    if (!p) return Response.json({ error: 'Product not found' }, { status: 404 });
    return Response.json({ caption: await writeCaption(p) });
  }
  return Response.json(products.map(({ id, name, brand, price, image }) => ({ id, name, brand, price, image })));
}
