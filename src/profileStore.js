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
  level: 'Intermédiaire',
  age: 0,
  weight: 0,
  height: 0,        // taille corporelle (hauteur)
  poitrine: 0,
  bras: 0,
  taille: 0,        // tour de taille (circonférence)
  cuisse: 0,
  nutritionOverride: null, // {kcalGoal,p,c,f} appliqué depuis l'analyse IA
  lastMeasureAt: 0, // dernier enregistrement des mensurations (ms)
  lastPhotoAt: 0,   // dernière photo de progression (ms)
};

export const GOALS = ['Prise de masse', 'Perte de gras', 'Maintien', 'Force'];
export const LEVELS = ['Débutant', 'Intermédiaire', 'Avancé'];

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
// Le point de départ n'est exposé qu'une fois figé (sinon pas d'écart à montrer).
export function getBaseline(key) { return baseline.__committed ? (baseline[key] || 0) : 0; }

export function setField(key, value) {
  profile = { ...profile, [key]: value };
  persist();
  subs.forEach((fn) => fn());
}

// Fige le point de départ (appelé quand l'utilisateur enregistre son profil).
// Premier enregistrement → capture toutes les mesures actuelles comme base.
// Ensuite → ne complète que les mesures qui n'avaient pas encore de base.
export function commitBaseline() {
  const first = !baseline.__committed;
  let changed = false;
  for (const k of TRACKED) {
    if (profile[k] > 0 && (first || !baseline[k])) { baseline[k] = profile[k]; changed = true; }
  }
  if (!baseline.__committed) { baseline.__committed = true; changed = true; }
  if (changed) { persistBaseline(); subs.forEach((fn) => fn()); }
}

export function subscribeProfile(fn) { subs.add(fn); return () => subs.delete(fn); }

// Horodatage des rappels (mensurations / photos).
export function markMeasured() { profile = { ...profile, lastMeasureAt: Date.now() }; persist(); subs.forEach((fn) => fn()); }
export function markPhoto() { profile = { ...profile, lastPhotoAt: Date.now() }; persist(); subs.forEach((fn) => fn()); }

// Rappels : true quand c'est le moment (ou jamais fait). Intervalles en jours.
const DAY = 86400000;
export function measuresDue(days = 14) { const t = profile.lastMeasureAt; return !t || (Date.now() - t) > days * DAY; }
export function photoDue(days = 30) { const t = profile.lastPhotoAt; return !t || (Date.now() - t) > days * DAY; }

// Cloud sync hooks.
export function exportState() { return { profile, baseline }; }
export function importState(s) {
  if (!s || typeof s !== 'object') return;
  if (s.profile && typeof s.profile === 'object') { profile = { ...DEFAULTS, ...s.profile }; persist(); }
  if (s.baseline && typeof s.baseline === 'object') { baseline = s.baseline; persistBaseline(); }
  subs.forEach((fn) => fn());
}

export function delta(key) {
  if (!baseline.__committed) return 0; // pas encore de point de départ figé
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
