/* programsData.js — données de programmes pures (aucune dépendance React/store).
   Importable côté client ET côté serverless (api/today.js). */

// Bibliothèque d'exercices : clé → nom + GIF.
export const EX = {
  bench:        { name: 'Développé couché', gif: '/gif/developpe-couche.gif' },
  incline:      { name: 'Développé incliné', gif: '/gif/developpe-incline.gif' },
  fly:          { name: 'Écarté incliné', gif: '/gif/ecarte-incline.gif' },
  dips:         { name: 'Dips', gif: '/gif/dips.gif' },
  pushdown:     { name: 'Extension triceps poulie', gif: '/gif/extension-triceps.gif' },
  closegrip:    { name: 'Développé couché serré', gif: '/gif/developpe-serre.gif' },
  rope:         { name: 'Extension triceps corde', gif: '/gif/ropepushdown.gif' },
  pullup:       { name: 'Tractions', gif: '/gif/pullup.gif' },
  pulldown:     { name: 'Tirage vertical', gif: '/gif/pulldown.gif' },
  row:          { name: 'Rowing barre', gif: '/gif/row.gif' },
  seatedrow:    { name: 'Rowing assis poulie', gif: '/gif/seatedrow.gif' },
  barbellcurl:  { name: 'Curl barre', gif: '/gif/barbellcurl.gif' },
  dumbbellcurl: { name: 'Curl haltères', gif: '/gif/dumbbellcurl.gif' },
  hammercurl:   { name: 'Curl marteau', gif: '/gif/hammercurl.gif' },
  squat:        { name: 'Squat', gif: '/gif/squat.gif' },
  rdl:          { name: 'Soulevé de terre roumain', gif: '/gif/rdl.gif' },
  deadlift:     { name: 'Soulevé de terre', gif: '/gif/deadlift.gif' },
  lunge:        { name: 'Fentes haltères', gif: '/gif/lunge.gif' },
  legcurl:      { name: 'Leg curl allongé (machine)', gif: '/gif/legcurl.gif' },
  calf:         { name: 'Mollets debout', gif: '/gif/calf.gif' },
  hacksquat:    { name: 'Hack squat (machine)', gif: '/gif/hacksquat.gif' },
  legext:       { name: 'Leg extension (machine)', gif: '/gif/legext.gif' },
  seatedlegcurl:{ name: 'Leg curl assis (machine)', gif: '/gif/seatedlegcurl.gif' },
  seatedcalf:   { name: 'Mollets assis (machine)', gif: '/gif/seatedcalf.gif' },
  shoulderpress:{ name: 'Développé épaules', gif: '/gif/shoulderpress.gif' },
  ohp:          { name: 'Développé militaire', gif: '/gif/ohp.gif' },
  lateral:      { name: 'Élévations latérales', gif: '/gif/lateralraise.gif' },
  front:        { name: 'Élévations frontales', gif: '/gif/frontraise.gif' },
  reardelt:     { name: 'Oiseau (arrière d’épaule)', gif: '/gif/reardelt.gif' },
  shrug:        { name: 'Shrug (trapèzes)', gif: '/gif/shrug.gif' },
};

const ex = (key, sets, reps, weight, rest) => ({ ...EX[key], sets, reps, weight, rest });

export function exerciseList() {
  return Object.keys(EX).map((k) => ({ key: k, name: EX[k].name }));
}
export function makeExercise(key, sets, reps, weight, rest) {
  if (!EX[key]) return null;
  return { ...EX[key], sets: sets || 3, reps: reps || 12, weight: weight || 0, rest: rest || 75 };
}

const DAYS = {
  push:    { title: 'Push · Pecs / Épaules / Triceps', kcal: 430, exercises: [
    ex('bench', 4, 10, 40, 90), ex('incline', 3, 12, 24, 75), ex('shoulderpress', 3, 12, 16, 75),
    ex('lateral', 3, 15, 10, 60), ex('pushdown', 3, 15, 25, 60), ex('dips', 3, 12, 0, 60) ] },
  pull:    { title: 'Pull · Dos / Biceps', kcal: 420, exercises: [
    ex('pullup', 4, 8, 0, 90), ex('pulldown', 3, 12, 50, 75), ex('row', 4, 10, 50, 90),
    ex('seatedrow', 3, 12, 45, 75), ex('barbellcurl', 3, 12, 25, 60), ex('hammercurl', 3, 12, 12, 60) ] },
  legs:    { title: 'Legs · Jambes', kcal: 450, exercises: [
    ex('hacksquat', 4, 10, 80, 120), ex('legext', 4, 15, 45, 75), ex('seatedlegcurl', 3, 12, 40, 75),
    ex('legcurl', 3, 12, 35, 60), ex('seatedcalf', 4, 15, 40, 60) ] },

  pecs:    { title: 'Pectoraux', kcal: 400, exercises: [
    ex('bench', 4, 10, 40, 90), ex('incline', 4, 10, 28, 90), ex('fly', 3, 15, 12, 75),
    ex('dips', 3, 12, 0, 75) ] },
  dos:     { title: 'Dos', kcal: 430, exercises: [
    ex('pullup', 4, 8, 0, 90), ex('pulldown', 4, 10, 50, 90), ex('row', 4, 10, 50, 90),
    ex('seatedrow', 3, 12, 45, 75), ex('shrug', 3, 15, 30, 60) ] },
  jambes:  { title: 'Jambes', kcal: 470, exercises: [
    ex('hacksquat', 4, 10, 80, 120), ex('legext', 4, 15, 45, 75), ex('seatedlegcurl', 4, 12, 40, 75),
    ex('legcurl', 3, 12, 35, 60), ex('seatedcalf', 3, 15, 40, 60), ex('calf', 3, 15, 40, 45) ] },
  epaules: { title: 'Épaules', kcal: 350, exercises: [
    ex('ohp', 4, 10, 40, 90), ex('lateral', 4, 15, 10, 60), ex('front', 3, 12, 10, 60),
    ex('reardelt', 3, 15, 8, 60) ] },
  bras:    { title: 'Bras · Biceps / Triceps', kcal: 320, exercises: [
    ex('barbellcurl', 3, 12, 25, 60), ex('dumbbellcurl', 3, 12, 12, 60), ex('hammercurl', 3, 12, 12, 60),
    ex('pushdown', 3, 12, 25, 60), ex('closegrip', 3, 10, 30, 75), ex('rope', 3, 15, 20, 60) ] },

  haut:    { title: 'Haut du corps', kcal: 450, exercises: [
    ex('bench', 4, 10, 40, 90), ex('pulldown', 4, 10, 50, 90), ex('shoulderpress', 3, 12, 16, 75),
    ex('row', 3, 10, 50, 75), ex('barbellcurl', 3, 12, 25, 60), ex('pushdown', 3, 15, 25, 60) ] },
  bas:     { title: 'Bas du corps', kcal: 450, exercises: [
    ex('hacksquat', 4, 10, 80, 120), ex('legext', 4, 15, 45, 75), ex('seatedlegcurl', 3, 12, 40, 75),
    ex('legcurl', 3, 12, 35, 60), ex('seatedcalf', 4, 15, 40, 60) ] },

  full:    { title: 'Full Body', kcal: 500, exercises: [
    ex('hacksquat', 4, 10, 80, 120), ex('bench', 4, 10, 40, 90), ex('pulldown', 3, 12, 50, 75),
    ex('shoulderpress', 3, 12, 16, 75), ex('barbellcurl', 3, 12, 25, 60), ex('seatedcalf', 3, 15, 40, 60) ] },
};

export const PROGRAMS = [
  { id: 'ppl',      name: 'Push / Pull / Legs', sub: '6 jours / semaine', days: [DAYS.push, DAYS.pull, DAYS.legs],
    week: [0, 1, 2, 0, 1, 2, 'rest'] },
  { id: 'split',    name: 'Split par muscle',   sub: '5 jours · 1 groupe/jour', days: [DAYS.pecs, DAYS.dos, DAYS.jambes, DAYS.epaules, DAYS.bras],
    week: [0, 1, 2, 3, 4, 'rest', 'rest'] },
  { id: 'upperlow', name: 'Haut / Bas',         sub: '4 jours', days: [DAYS.haut, DAYS.bas],
    week: [0, 1, 'rest', 0, 1, 'rest', 'rest'] },
  { id: 'fullbody', name: 'Full Body',          sub: '3 jours', days: [DAYS.full],
    week: [0, 'rest', 0, 'rest', 0, 'rest', 'rest'] },
];

export const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export function getProgramById(id) {
  return PROGRAMS.find((p) => p.id === id) || PROGRAMS[0];
}
export function durationOf(day) {
  if (!day) return 0;
  const sets = day.exercises.reduce((a, e) => a + e.sets, 0);
  return Math.round(sets * 2.6);
}
export function todayIndex() {
  const js = new Date().getDay(); // 0 = Sunday
  return (js + 6) % 7;
}
export function dayForSlot(program, slot) {
  const v = program.week[slot];
  return v === 'rest' ? null : program.days[v];
}

const SHORT = {
  'Push · Pecs / Épaules / Triceps': 'Push', 'Pull · Dos / Biceps': 'Pull', 'Legs · Jambes': 'Legs',
  'Pectoraux': 'Pecs', 'Dos': 'Dos', 'Bras · Biceps / Triceps': 'Bras', 'Jambes': 'Jambes', 'Épaules': 'Épaules',
  'Haut du corps': 'Haut', 'Bas du corps': 'Bas', 'Full Body': 'Full',
};
export const shortLabel = (day) => (day ? (SHORT[day.title] || day.title.split(' · ')[0]) : 'Repos');

// Remplace les exercices d'un jour par sa version personnalisée (overrides map).
export function withOverrideData(day, overrides) {
  if (!day) return day;
  const ov = overrides && overrides[day.title];
  return ov ? { ...day, exercises: ov } : day;
}

// Adapte les charges au profil (profile = {weight, level}).
const REF_BW = 80;
const LEVEL_MULT = { 'Débutant': 0.7, 'Intermédiaire': 1.0, 'Avancé': 1.2 };
export function adaptDayWith(day, profile) {
  if (!day) return day;
  const bw = (profile && profile.weight) || 0;
  if (!bw) return day;
  const factor = (bw / REF_BW) * (LEVEL_MULT[(profile && profile.level)] || 1);
  return {
    ...day,
    exercises: day.exercises.map((e) => ({
      ...e,
      weight: e.weight ? Math.max(2.5, Math.round((e.weight * factor) / 2.5) * 2.5) : 0,
    })),
  };
}
