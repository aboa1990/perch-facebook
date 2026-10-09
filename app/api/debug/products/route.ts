import { getRaw, normalize } from '@/lib/products';

// Open /api/debug/products in a browser to check what the poster reads from your store.
export async function GET() {
  const raw = await getRaw();
  const parsed = raw.map(normalize);
  return Response.json({
    totalFromStore: raw.length,
    readOk: parsed.filter(Boolean).length,
    skipped: raw.filter((_, i) => !parsed[i]).slice(0, 2),
    firstRaw: raw[0],
    firstParsed: parsed[0],
  });
}
