export const MAX_PER_DAY = 8;       // safety cap
export const MIN_PER_DAY = 2;       // always at least this many posts a day
export const TZ_OFFSET_HOURS = 5;   // Maldives is UTC+5
export const FIRST_POST_HOUR = 10;  // local time of the first post of the day
export const LAST_POST_HOUR = 20;   // local time of the last post of the day

export type Palette = { bg: string; ink: string; soft: string; btnBg: string; btnInk: string; dark: boolean };

// One palette and one layout per week; the pair changes every week.
export const PALETTES: Palette[] = [
  { bg: 'linear-gradient(160deg,#6E4354,#8A5A6B 55%,#3E8FA0)', ink: '#FFFFFF', soft: '#F1E6EA', btnBg: '#FFFFFF', btnInk: '#4A2F3A', dark: true },
  { bg: '#F7F2F4', ink: '#4A2F3A', soft: '#E7D3DA', btnBg: '#8A5A6B', btnInk: '#FFFFFF', dark: false },
  { bg: 'linear-gradient(160deg,#0E3B40,#1F6F78)', ink: '#FFFFFF', soft: '#CFE3E8', btnBg: '#F2B8A8', btnInk: '#0E3B40', dark: true },
  { bg: '#F3DCE3', ink: '#4A2F3A', soft: '#FFFFFF', btnBg: '#4A2F3A', btnInk: '#FFFFFF', dark: false },
  { bg: 'linear-gradient(160deg,#2A1A21,#4A2F3A)', ink: '#F7F2F4', soft: '#E7D3DA', btnBg: '#E7C27D', btnInk: '#2A1A21', dark: true },
];
export const LAYOUTS = ['frame', 'split', 'circle'] as const;

export const weekIndex = (t = Date.now()) => Math.floor(t / (7 * 864e5));
export const designForWeek = (w = weekIndex()) => ({ palette: PALETTES[w % PALETTES.length], layout: LAYOUTS[w % LAYOUTS.length] });
