export const MAX_PER_DAY = 8;       // safety cap
export const MIN_PER_DAY = 2;       // always at least this many posts a day
export const TZ_OFFSET_HOURS = 5;   // Maldives is UTC+5
export const FIRST_POST_HOUR = 10;  // local time of the first post of the day
export const LAST_POST_HOUR = 20;   // local time of the last post of the day

// tint: dark overlay behind text. accent: button colour on white cards.
// sheet / sheetInk: background and text colour of the bottom panel layout.
export type Palette = { tint: string; accent: string; sheet: string; sheetInk: string };

// One palette and one layout per week; the pair changes every week.
export const PALETTES: Palette[] = [
  { tint: 'rgba(48,28,38,0.94)', accent: '#8A5A6B', sheet: '#6E4354', sheetInk: '#FFFFFF' },
  { tint: 'rgba(40,24,32,0.94)', accent: '#7A4C5E', sheet: '#F7F2F4', sheetInk: '#4A2F3A' },
  { tint: 'rgba(8,38,42,0.94)', accent: '#1F6F78', sheet: '#0E3B40', sheetInk: '#FFFFFF' },
  { tint: 'rgba(58,22,32,0.94)', accent: '#B0485F', sheet: '#F3DCE3', sheetInk: '#4A2F3A' },
  { tint: 'rgba(26,16,22,0.95)', accent: '#4A2F3A', sheet: '#2A1A21', sheetInk: '#F7F2F4' },
];
export const LAYOUTS = ['gradient', 'card', 'panel'] as const;

export const weekIndex = (t = Date.now()) => Math.floor(t / (7 * 864e5));
export const designForWeek = (w = weekIndex()) => ({ palette: PALETTES[w % PALETTES.length], layout: LAYOUTS[w % LAYOUTS.length] });
