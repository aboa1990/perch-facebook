import { getProducts, pickForDay } from '@/lib/products';
import { writeCaption } from '@/lib/caption';
import { FIRST_POST_HOUR, LAST_POST_HOUR, TZ_OFFSET_HOURS } from '@/lib/config';

export const maxDuration = 60;
const GRAPH = `https://graph.facebook.com/${process.env.GRAPH_VERSION ?? 'v21.0'}`;

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
    const p = picks[i];
    const body = new URLSearchParams({
      url: `${origin}/api/render?id=${encodeURIComponent(p.id)}`,
      caption: await writeCaption(p),
      published: 'false',
      scheduled_publish_time: String(Math.floor(times[i] / 1000)),
      access_token: process.env.FB_PAGE_TOKEN!,
    });
    const r = await fetch(`${GRAPH}/${process.env.FB_PAGE_ID}/photos`, { method: 'POST', body });
    results.push({ product: p.name, scheduledFor: new Date(times[i]).toISOString(), ok: r.ok, response: await r.json() });
  }
  return Response.json(results);
}
