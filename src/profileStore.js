/* profileStore.js — localStorage-backed body profile (weight, measurements, goal).
   Read by the Progress screen and sent to the AI so the program adapts. */

const KEY = 'bond.profile.v1';

// Baseline = starting point (≈ 5 weeks ago). Deltas are computed against it so
// the comparison badges update live when the user edits their measurements.
export const BASELINE = { weight: 80.5, poitrine: 102.5, bras: 37.3, taille: 85, cuisse: 59.2 };

const DEFAULTS = {
  name: 'Brick',
  sex: 'homme',
  goal: 'Prise de masse',
  weight: 78.4,
  height: 178,      // taille corporelle (hauteur)
  poitrine: 104,
  bras: 38.5,
  taille: 82,       // tour de taille (circonférence)
  cuisse: 60,
};

export const GOALS = ['Prise de masse', 'Perte de gras', 'Maintien', 'Force'];

// Champ « hauteur » à part : ne varie pas comme une mensuration, pas de delta.
export const HEIGHT_FIELD = { key: 'height', label: 'Taille (hauteur)', unit: 'cm', step: 1 };

export const FIELDS = [
  { key: 'poitrine', label: 'Poitrine', unit: 'cm', step: 0.5 },
  { key: 'bras', label: 'Tour de bras', unit: 'cm', step: 0.5 },
  { key: 'taille', label: 'Tour de taille', unit: 'cm', step: 0.5 },
  { key: 'cuisse', label: 'Cuisse', unit: 'cm', step: 0.5 },
];

let profile = load();
const subs = new Set();

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
    return { ...DEFAULTS, ...(saved && typeof saved === 'object' ? saved : {}) };
  } catch { return { ...DEFAULTS }; }
}
function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(profile)); } catch { /* quota */ }
}

export function getProfile() { return profile; }

export function setField(key, value) {
  profile = { ...profile, [key]: value };
  persist();
  subs.forEach((fn) => fn());
}

export function subscribeProfile(fn) { subs.add(fn); return () => subs.delete(fn); }

export function delta(key) {
  if (!(key in BASELINE)) return 0;
  return Math.round((profile[key] - BASELINE[key]) * 10) / 10;
}

// French number formatting: comma decimal, no trailing ".0".
export function fmt(n) {
  const r = Math.round(n * 10) / 10;
  return (Number.isInteger(r) ? String(r) : r.toFixed(1)).replace('.', ',');
}
export function fmtDelta(n) {
  const sign = n > 0 ? '+' : n < 0 ? '−' : '';
  return sign + fmt(Math.abs(n));
}
