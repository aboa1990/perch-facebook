import type { Product } from './products';

const money = (n: number) => `MVR ${n.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

function fallback(p: Product) {
  return `New at PERCH: ${p.name}${p.brand ? ' by ' + p.brand : ''}. ${money(p.price)}${p.oldPrice ? ` (was ${money(p.oldPrice)})` : ''}. Delivered across the Upper North.\n\nOrder now: ${p.url}\n\n#PERCH #MaldivesShopping`;
}

export async function writeCaption(p: Product): Promise<string> {
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY!, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: process.env.CLAUDE_MODEL ?? 'claude-haiku-5-5',
        max_tokens: 400,
        messages: [{ role: 'user', content:
          `Write a Facebook caption for PERCH, a Maldives online store (delivery across the Upper North, prices in MVR). ` +
          `2-3 short, warm sentences, at most two emoji, no made-up facts. Mention the price ${money(p.price)}` +
          `${p.oldPrice ? ` (was ${money(p.oldPrice)})` : ''}${p.stock <= 3 ? ` and that only ${p.stock} left` : ''}. ` +
          `Then a line "Order now: ${p.url}" and 3 hashtags. Plain text only, output the caption and nothing else.\n\n` +
          `Product: ${p.name}\nBrand: ${p.brand}` }],
      }),
    });
    const j = await r.json();
    const text = j.content?.find((c: any) => c.type === 'text')?.text?.trim();
    return text || fallback(p);
  } catch { return fallback(p); }
}
