/* nutritionStore.js — journal alimentaire du jour (repas + hydratation),
   persisté en localStorage et synchronisé. Se réinitialise chaque jour. */

const KEY = 'bond.nutrition.v1';

function today() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
const empty = () => ({ date: today(), meals: { b: [], l: [], s: [], d: [] }, water: 0 });

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (s && s.date === today() && s.meals) return s;
  } catch { /* ignore */ }
  return empty();
}

let state = load();
const subs = new Set();

function persist() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* quota */ } }
function notify() { subs.forEach((fn) => fn()); }
function ensureToday() { if (state.date !== today()) { state = empty(); persist(); } }

export function getNutrition() { ensureToday(); return state; }
export function subscribeNutrition(fn) { subs.add(fn); return () => subs.delete(fn); }

export function addItem(mealId, food) {
  ensureToday();
  state = { ...state, meals: { ...state.meals, [mealId]: [...(state.meals[mealId] || []), food] } };
  persist(); notify();
}
export function removeItem(mealId, idx) {
  ensureToday();
  state = { ...state, meals: { ...state.meals, [mealId]: state.meals[mealId].filter((_, i) => i !== idx) } };
  persist(); notify();
}
export function setWater(n) {
  ensureToday();
  state = { ...state, water: Math.max(0, n) };
  persist(); notify();
}
export function clearMeals() {
  ensureToday();
  state = { ...state, meals: { b: [], l: [], s: [], d: [] } };
  persist(); notify();
}

// Remplace tout le plan (utilisé par le chat IA). meals = {b,l,s,d} d'aliments.
function sanitizeFood(it) {
  return {
    name: String(it.name || 'Aliment').slice(0, 60),
    qty: typeof it.qty === 'number' ? it.qty : null,
    unit: typeof it.unit === 'string' ? it.unit : '',
    kcal: Math.round(it.kcal || 0),
    p: Math.round(it.p || it.protein || 0),
    c: Math.round(it.c || it.carbs || 0),
    f: Math.round(it.f || it.fat || 0),
  };
}
export function setMeals(meals) {
  ensureToday();
  const clean = { b: [], l: [], s: [], d: [] };
  for (const k of ['b', 'l', 's', 'd']) {
    if (Array.isArray(meals && meals[k])) clean[k] = meals[k].map(sanitizeFood);
  }
  state = { ...state, meals: clean };
  persist(); notify();
}

// Cloud sync hooks.
export function exportState() { return state; }
export function importState(s) {
  if (s && typeof s === 'object' && s.date === today() && s.meals) { state = s; persist(); notify(); }
}

// Plan du jour : base ~2280 kcal (quantités en grammes) mise à l'échelle
// sur l'objectif calorique — les quantités ET les macros se recalculent.
const BASE_KCAL = 2280;
const BASE = {
  b: [
    { name: "Flocons d'avoine", qty: 80, unit: 'g', kcal: 300, p: 10, c: 54, f: 6 },
    { name: 'Whey', qty: 30, unit: 'g', kcal: 120, p: 24, c: 3, f: 2 },
    { name: 'Banane', qty: 120, unit: 'g', kcal: 90, p: 1, c: 23, f: 0 },
  ],
  l: [
    { name: 'Poulet grillé', qty: 150, unit: 'g', kcal: 250, p: 47, c: 0, f: 6 },
    { name: 'Riz basmati (cuit)', qty: 150, unit: 'g', kcal: 200, p: 4, c: 44, f: 0 },
    { name: 'Légumes verts', qty: 150, unit: 'g', kcal: 80, p: 5, c: 12, f: 1 },
    { name: "Huile d'olive", qty: 10, unit: 'g', kcal: 90, p: 0, c: 0, f: 10 },
  ],
  s: [
    { name: 'Skyr', qty: 150, unit: 'g', kcal: 120, p: 20, c: 8, f: 0 },
    { name: 'Amandes', qty: 30, unit: 'g', kcal: 180, p: 7, c: 6, f: 16 },
    { name: 'Pomme', qty: 150, unit: 'g', kcal: 80, p: 0, c: 21, f: 0 },
  ],
  d: [
    { name: 'Saumon', qty: 150, unit: 'g', kcal: 280, p: 34, c: 0, f: 16 },
    { name: 'Patate douce', qty: 200, unit: 'g', kcal: 180, p: 3, c: 41, f: 0 },
    { name: 'Légumes', qty: 150, unit: 'g', kcal: 80, p: 5, c: 12, f: 1 },
  ],
};

export function generatePlan(kcalGoal) {
  ensureToday();
  const k = Math.max(0.5, Math.min(2, (kcalGoal || BASE_KCAL) / BASE_KCAL));
  const scale = (it) => ({
    name: it.name,
    qty: it.unit === 'g' ? Math.max(5, Math.round((it.qty * k) / 5) * 5) : Math.round(it.qty * k),
    unit: it.unit,
    kcal: Math.round(it.kcal * k),
    p: Math.round(it.p * k), c: Math.round(it.c * k), f: Math.round(it.f * k),
  });
  const meals = {};
  for (const m of ['b', 'l', 's', 'd']) meals[m] = BASE[m].map(scale);
  state = { ...state, meals };
  persist(); notify();
}
