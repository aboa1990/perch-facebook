import { getProducts, pickForDay } from '@/lib/products';
import { postProduct } from '@/lib/facebook';
import { FIRST_POST_HOUR, LAST_POST_HOUR, TZ_OFFSET_HOURS } from '@/lib/config';

export const maxDuration = 60;

// Evenly spread today's posts between FIRST_POST_HOUR and LAST_POST_HOUR (local time).
function slots(n: number, now = Date.now()) {
  const offset = TZ_OFFSET_HOURS * 3600e3;
  const localMidnightUtc = Math.floor((now + offset) / 864e5) * 864e5 - offset;
  return Array.from({ length: n }, (_, i) => {
    const hour = n === 1 ? 12 : FIRST_POST_HOUR + (i * (LAST_POST_HOUR - FIRST_POST_HOUR)) / (n - 1);
    return Math.max(localMidnightUtc + hour * 3600e3, now + 15 * 60e3);
  });
}

export async function GET(req: Request) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) return new Response('Unauthorized', { status: 401 });
  const origin = process.env.APP_URL ?? new URL(req.url).origin;
  const picks = pickForDay(await getProducts());
  const times = slots(picks.length);
  const results = [];
  for (let i = 0; i < picks.length; i++) {
    const r = await postProduct(picks[i], origin, times[i]);
    results.push({ product: picks[i].name, scheduledFor: new Date(times[i]).toISOString(), ...r });
  }
  return Response.json(results);
}
