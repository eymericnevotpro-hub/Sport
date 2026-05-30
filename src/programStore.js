/* programStore.js — programme actif + personnalisations d'exercices par jour. */
import { PROGRAMS } from './programs.js';

const KEY = 'bond.program.v1';
const OKEY = 'bond.dayoverrides.v1';

function load() {
  try {
    const id = localStorage.getItem(KEY);
    return PROGRAMS.some((p) => p.id === id) ? id : PROGRAMS[0].id;
  } catch { return PROGRAMS[0].id; }
}
function loadOverrides() {
  try { return JSON.parse(localStorage.getItem(OKEY) || '{}') || {}; }
  catch { return {}; }
}

let current = load();
let overrides = loadOverrides(); // { [dayTitle]: [exercise objects] }
const subs = new Set();

function persistId() { try { localStorage.setItem(KEY, current); } catch { /* quota */ } }
function persistOverrides() { try { localStorage.setItem(OKEY, JSON.stringify(overrides)); } catch { /* quota */ } }
function notify() { subs.forEach((fn) => fn()); }

export function getProgramId() { return current; }

export function setProgramId(id) {
  if (!PROGRAMS.some((p) => p.id === id)) return;
  current = id; persistId(); notify();
}

export function subscribeProgram(fn) { subs.add(fn); return () => subs.delete(fn); }

// ── Personnalisation des exercices d'un jour (par titre de séance) ──
export function getDayOverride(title) { return overrides[title] || null; }
export function setDayExercises(title, exercises) {
  if (!title || !Array.isArray(exercises) || !exercises.length) return;
  overrides = { ...overrides, [title]: exercises };
  persistOverrides(); notify();
}
export function clearDayOverride(title) {
  if (!overrides[title]) return;
  const o = { ...overrides }; delete o[title]; overrides = o;
  persistOverrides(); notify();
}
// Remplace les exercices d'un jour par sa version personnalisée si elle existe.
export function withOverride(day) {
  if (!day) return day;
  const ov = overrides[day.title];
  return ov ? { ...day, exercises: ov } : day;
}

// ── Cloud sync ──
export function exportState() { return { id: current, overrides }; }
export function importState(s) {
  if (typeof s === 'string') {
    if (PROGRAMS.some((p) => p.id === s)) { current = s; persistId(); notify(); }
    return;
  }
  if (s && typeof s === 'object') {
    if (s.id && PROGRAMS.some((p) => p.id === s.id)) { current = s.id; persistId(); }
    if (s.overrides && typeof s.overrides === 'object') { overrides = s.overrides; persistOverrides(); }
    notify();
  }
}
