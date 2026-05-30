/* profileStore.js — localStorage-backed body profile (weight, measurements, goal).
   Read by the Progress screen and sent to the AI so the program adapts. */

const KEY = 'bond.profile.v1';

// Baseline = first recorded value, captured the first time the user sets a
// field (0 = not yet recorded). Deltas are computed against it.
export const BASELINE_KEY = 'bond.baseline.v1';

const DEFAULTS = {
  name: 'Brick',
  sex: 'homme',
  goal: 'Prise de masse',
  weight: 0,
  height: 0,        // taille corporelle (hauteur)
  poitrine: 0,
  bras: 0,
  taille: 0,        // tour de taille (circonférence)
  cuisse: 0,
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

// Tracked measurements that show a delta vs their first recorded value.
const TRACKED = ['weight', 'poitrine', 'bras', 'taille', 'cuisse'];

let baseline = (() => {
  try { return JSON.parse(localStorage.getItem(BASELINE_KEY) || '{}') || {}; }
  catch { return {}; }
})();
function persistBaseline() {
  try { localStorage.setItem(BASELINE_KEY, JSON.stringify(baseline)); } catch { /* quota */ }
}

export function getProfile() { return profile; }
export function getBaseline(key) { return baseline[key] || 0; }

export function setField(key, value) {
  profile = { ...profile, [key]: value };
  persist();
  // Record the starting point the first time a tracked field gets a real value.
  if (TRACKED.includes(key) && !baseline[key] && value > 0) {
    baseline[key] = value;
    persistBaseline();
  }
  subs.forEach((fn) => fn());
}

export function subscribeProfile(fn) { subs.add(fn); return () => subs.delete(fn); }

export function delta(key) {
  const base = baseline[key] || 0;
  if (!base || !profile[key]) return 0;
  return Math.round((profile[key] - base) * 10) / 10;
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
