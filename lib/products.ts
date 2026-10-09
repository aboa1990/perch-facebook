import { MAX_PER_DAY, MIN_PER_DAY } from './config';

export type Product = {
  id: string; name: string; brand: string; price: number; oldPrice?: number;
  discount?: number; stock: number; image: string; url: string; createdAt?: string;
};

const STORE = process.env.STORE_URL!;
const abs = (u: string) => (u.startsWith('http') ? u : STORE + (u.startsWith('/') ? u : '/' + u));

const first = (...v: any[]) => v.find((x) => x !== undefined && x !== null && x !== '');
const text = (x: any) => (x && typeof x === 'object' ? String(x.name ?? x.title ?? '') : String(x ?? ''));

function mediaUrl(x: any): string {
  if (x && typeof x === 'object') x = first(x.url, x.src, x.id, x._id);
  const s = String(x ?? '');
  if (!s) return '';
  if (/^https?:/.test(s)) return s;
  if (s.startsWith('/')) return STORE + s;
  if (/^[a-f0-9]{24}$/i.test(s)) return `${STORE}/api/media/${s}`; // PERCH serves photos at /api/media/<id>
  return `${STORE}/${s}`;
}

// Understands the usual field names. Open /api/debug/products on your deployed project to see
// exactly what it reads from your store; if a field is wrong, tell me and I'll adjust this function.
export function normalize(r: any): Product | null {
  const id = String(first(r.id, r._id, r.slug) ?? '');
  const price = Number(first(r.price, r.salePrice, r.sellingPrice));
  let old = Number(first(r.oldPrice, r.comparePrice, r.originalPrice, r.compareAtPrice, r.listPrice, r.mrp) ?? 0);
  const pct = Number(first(r.discount, r.discountPercent, r.discountPercentage) ?? 0);
  if (!old && pct > 0 && price) old = Math.round(price / (1 - pct / 100));
  const image = mediaUrl(first(r.image, r.images?.[0], r.photos?.[0], r.media?.[0], r.thumbnail));
  if (!id || !price || !image) return null;
  return {
    id, price, image,
    name: text(first(r.name, r.title)),
    brand: text(first(r.brand, r.brandName, r.vendor)),
    oldPrice: old > price ? old : undefined,
    discount: old > price ? Math.round((1 - price / old) * 100) : undefined,
    stock: Number(first(r.stock, r.quantity, r.inventory, r.countInStock) ?? 1),
    url: `${STORE}/product/${id}`,
    createdAt: first(r.createdAt, r.created_at, r.addedAt),
  };
}

export async function getRaw(): Promise<any[]> {
  const res = await fetch(process.env.PRODUCTS_API_URL!, { cache: 'no-store' });
  const raw = await res.json();
  return Array.isArray(raw) ? raw : raw.products ?? raw.items ?? raw.data ?? [];
}

export async function getProducts(): Promise<Product[]> {
  return (await getRaw()).map(normalize).filter((p): p is Product => !!p && p.stock > 0);
}

// Stateless daily pick. Posts at least MIN_PER_DAY a day, and enough per day that every
// product is posted again within 7 days. Products added in the last 7 days go first.
export function pickForDay(products: Product[], now = Date.now()): Product[] {
  const count = Math.min(MAX_PER_DAY, Math.max(MIN_PER_DAY, Math.ceil(products.length / 7)), products.length);
  const fresh = products.filter((p) => p.createdAt && now - +new Date(p.createdAt) < 7 * 864e5);
  const rest = products.filter((p) => !fresh.includes(p)).sort((a, b) => a.id.localeCompare(b.id));
  const out: Product[] = fresh.slice(0, count);
  const day = Math.floor(now / 864e5);
  for (let i = 0; out.length < count && i < products.length * 2 && rest.length; i++) {
    const c = rest[(day * count + i) % rest.length];
    if (!out.includes(c)) out.push(c);
  }
  return out;
}
