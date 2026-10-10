import { writeCaption } from './caption';
import { weekIndex, QUIET_START, QUIET_END, TZ_OFFSET_HOURS } from './config';
import type { Product } from './products';

const GRAPH = `https://graph.facebook.com/${process.env.GRAPH_VERSION ?? 'v21.0'}`;

// Posts a product photo to the Page. With publishAtMs it is scheduled; without it, it goes live now.
export async function postProduct(p: Product, origin: string, publishAtMs?: number, tag?: string) {
  // w and d make the picture address new every day, so an old cached image is never reused
  const image = `${origin}/api/render?id=${encodeURIComponent(p.id)}&w=${weekIndex()}&d=${Math.floor(Date.now() / 864e5)}${tag ? `&tag=${tag}` : ''}`;
  const body = new URLSearchParams({ url: image, caption: await writeCaption(p), access_token: process.env.FB_PAGE_TOKEN! });
  if (publishAtMs) {
    body.set('published', 'false');
    body.set('scheduled_publish_time', String(Math.floor(publishAtMs / 1000)));
  }
  const r = await fetch(`${GRAPH}/${process.env.FB_PAGE_ID}/photos`, { method: 'POST', body });
  return { ok: r.ok, response: await r.json() };
}

// If it is night in the Maldives, return the time of the next 09:00 so customers see the post in the morning.
export function nextOpenTime(now = Date.now()): number | undefined {
  const offset = TZ_OFFSET_HOURS * 3600e3;
  const local = new Date(now + offset);
  const hour = local.getUTCHours();
  if (hour < QUIET_START && hour >= QUIET_END) return undefined;
  const localMidnightUtc = Math.floor((now + offset) / 864e5) * 864e5 - offset;
  const nineToday = localMidnightUtc + 9 * 3600e3;
  return hour < QUIET_END ? nineToday : nineToday + 864e5;
}
