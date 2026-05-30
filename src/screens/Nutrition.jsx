/* screens/Nutrition.jsx — journal alimentaire persistant, adapté au profil */
import React from 'react';
import { T, Icon, Ring, MacroBar, SectionTitle, Sheet } from '../theme.jsx';
import { setField } from '../profileStore.js';
import {
  getNutrition, subscribeNutrition, addItem, removeItem, setWater, generatePlan, clearMeals,
} from '../nutritionStore.js';

const MEALS = [
  { id: 'b', name: 'Petit-déjeuner', icon: 'moon' },
  { id: 'l', name: 'Déjeuner', icon: 'fork' },
  { id: 's', name: 'Collation', icon: 'bolt' },
  { id: 'd', name: 'Dîner', icon: 'fork' },
];

const SUGGESTIONS = [
  { name: 'Œufs brouillés (2)', kcal: 180, p: 14, c: 1, f: 13 },
  { name: 'Blanc de poulet 150g', kcal: 250, p: 47, c: 0, f: 6 },
  { name: 'Saumon 150g', kcal: 280, p: 34, c: 0, f: 16 },
  { name: 'Steak haché 5% 150g', kcal: 220, p: 33, c: 0, f: 9 },
  { name: 'Riz basmati 150g', kcal: 200, p: 4, c: 44, f: 0 },
  { name: 'Patate douce 200g', kcal: 180, p: 3, c: 41, f: 0 },
  { name: 'Flocons d’avoine 80g', kcal: 300, p: 10, c: 54, f: 6 },
  { name: 'Whey (1 dose)', kcal: 120, p: 24, c: 3, f: 2 },
  { name: 'Skyr nature', kcal: 120, p: 20, c: 8, f: 0 },
  { name: 'Fromage blanc 0%', kcal: 90, p: 16, c: 6, f: 0 },
  { name: 'Amandes 30g', kcal: 180, p: 7, c: 6, f: 16 },
  { name: 'Avocat ½', kcal: 160, p: 2, c: 9, f: 15 },
  { name: 'Banane', kcal: 90, p: 1, c: 23, f: 0 },
  { name: 'Barre protéinée', kcal: 210, p: 20, c: 21, f: 7 },
];

export function NutritionScreen({ goal }) {
  const kcalGoal = goal.kcalGoal;
  const macroGoal = { p: goal.p, c: goal.c, f: goal.f };
  const [, bump] = React.useReducer((x) => x + 1, 0);
  const [sheet, setSheet] = React.useState(null); // meal id

  React.useEffect(() => subscribeNutrition(bump), []);

  const nut = getNutrition();
  const meals = nut.meals;
  const water = nut.water;

  const sumField = (f) => MEALS.reduce((a, m) => a + (meals[m.id] || []).reduce((b, it) => b + (it[f] || 0), 0), 0);
  const kcal = sumField('kcal'), p = sumField('p'), c = sumField('c'), f = sumField('f');
  const kcalPct = kcalGoal ? kcal / kcalGoal : 0;
  const logged = MEALS.some((m) => (meals[m.id] || []).length);

  const addFood = (food) => { if (sheet) addItem(sheet, food); setSheet(null); };

  return (
    <div style={{ padding: '6px 18px 12px', animation: 'fadeIn .4s .04s forwards' }}>
      <div style={{ padding: '10px 2px 16px' }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: T.ink3, letterSpacing: .3, textTransform: 'uppercase' }}>Aujourd'hui</div>
        <h1 style={{ margin: '3px 0 0', fontSize: 26, fontWeight: 800, letterSpacing: -0.7 }}>Nutrition</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 999, background: goal.override ? T.indigoSoft : T.mintSoft, color: goal.override ? T.indigo : T.mintDk, fontSize: 11.5, fontWeight: 800 }}>
            <Icon name={goal.override ? 'sparkle' : 'target'} size={13} sw={2.4} />
            {goal.override ? 'Objectif IA' : goal.computed ? 'Adapté à ton profil' : 'Objectif par défaut'}
          </span>
          {goal.override && (
            <span onClick={() => setField('nutritionOverride', null)} className="presslite" style={{ fontSize: 11.5, fontWeight: 700, color: T.ink3, cursor: 'pointer', textDecoration: 'underline' }}>calcul auto</span>
          )}
        </div>
      </div>

      {/* calories + macros card */}
      <div style={{ background: '#fff', borderRadius: T.rCard, padding: 20, boxShadow: T.shadow }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Ring size={118} stroke={13} value={kcalPct} color={T.mint} glow>
            <div style={{ fontFamily: T.mono, fontSize: 30, fontWeight: 700, lineHeight: 1 }}>{kcalGoal - kcal}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.ink3, marginTop: 3 }}>kcal restantes</div>
          </Ring>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 14 }}>
              <span style={{ fontFamily: T.mono, fontSize: 20, fontWeight: 700 }}>{kcal}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: T.ink3 }}>/ {kcalGoal} kcal</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              <MacroBar label="Protéines" value={p} total={macroGoal.p} color={T.mint} />
              <MacroBar label="Glucides" value={c} total={macroGoal.c} color={T.amber} />
              <MacroBar label="Lipides" value={f} total={macroGoal.f} color={T.coral} />
            </div>
          </div>
        </div>
      </div>

      {/* plan auto */}
      <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
        <button onClick={() => generatePlan(kcalGoal)} className="press" style={{ flex: 1, border: 'none', cursor: 'pointer', padding: '13px', borderRadius: 16, background: T.ink, color: '#fff', fontSize: 14, fontWeight: 800, fontFamily: T.font, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Icon name="sparkle" size={17} color="#fff" sw={2.4} /> Générer mon plan du jour
        </button>
        {logged && (
          <button onClick={clearMeals} className="presslite" style={{ border: 'none', cursor: 'pointer', padding: '13px 15px', borderRadius: 16, background: '#fff', color: T.ink2, fontSize: 13.5, fontWeight: 800, fontFamily: T.font, boxShadow: T.shadow }}>
            Vider
          </button>
        )}
      </div>

      {/* water */}
      <div style={{ background: '#fff', borderRadius: 22, padding: '14px 16px', boxShadow: T.shadow, marginTop: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 42, height: 42, borderRadius: 13, background: T.indigoSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="drop" size={22} color={T.indigo} sw={2.2} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: 14, fontWeight: 800 }}>Hydratation</span>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: T.ink3 }}>{(water * 0.25).toFixed(2).replace('.', ',')} / 2 L</span>
          </div>
          <div style={{ display: 'flex', gap: 5, marginTop: 9 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} onClick={() => setWater(i + 1 === water ? i : i + 1)} className="presslite"
                style={{ flex: 1, height: 26, borderRadius: 8, cursor: 'pointer', background: i < water ? T.indigo : '#EEF2F0', transition: `background .3s ${T.spring}` }} />
            ))}
          </div>
        </div>
      </div>

      {/* meals */}
      <div style={{ marginTop: 22 }}>
        <SectionTitle>Repas</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {MEALS.map(m => {
            const items = meals[m.id] || [];
            const mk = items.reduce((a, it) => a + (it.kcal || 0), 0);
            return (
              <div key={m.id} style={{ background: '#fff', borderRadius: 24, padding: '14px 16px', boxShadow: T.shadow }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: items.length ? 12 : 4 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 12, background: T.mintSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={m.icon} size={19} color={T.mintDk} sw={2.2} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15.5, fontWeight: 800, letterSpacing: -0.3 }}>{m.name}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: T.ink3 }}>{mk ? mk + ' kcal' : 'Rien enregistré'}</div>
                  </div>
                  <div onClick={() => setSheet(m.id)} className="presslite" style={{ width: 34, height: 34, borderRadius: 11, background: T.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Icon name="plus" size={19} color="#fff" sw={2.6} />
                  </div>
                </div>
                {items.map((it, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderTop: '1px solid '+T.line }}>
                    <div style={{ width: 6, height: 6, borderRadius: 999, background: T.mint, flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: T.ink }}>{it.name}</span>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: T.ink3 }}>{it.kcal} kcal</span>
                    <div onClick={() => removeItem(m.id, i)} className="presslite" style={{ width: 24, height: 24, borderRadius: 999, background: '#F1F4F2', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                      <Icon name="x" size={13} color={T.ink3} sw={2.6} />
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <Sheet open={!!sheet} onClose={() => setSheet(null)} title="Ajouter un aliment">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#F1F4F2', borderRadius: 14, padding: '11px 14px', marginBottom: 14 }}>
          <Icon name="grid" size={18} color={T.ink3} sw={2.2} />
          <span style={{ fontSize: 14, fontWeight: 600, color: T.ink3 }}>Aliments fréquents</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflowY: 'auto' }} className="app-scroll">
          {SUGGESTIONS.map((s, i) => (
            <div key={i} onClick={() => addFood(s)} className="presslite" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', borderRadius: 16, background: '#F7F9F8', cursor: 'pointer' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14.5, fontWeight: 700 }}>{s.name}</div>
                <div style={{ fontSize: 11.5, fontWeight: 600, color: T.ink3, marginTop: 2 }}>P {s.p} · G {s.c} · L {s.f}</div>
              </div>
              <span style={{ fontFamily: T.mono, fontSize: 14, fontWeight: 700, color: T.ink2 }}>{s.kcal}</span>
              <div style={{ width: 30, height: 30, borderRadius: 999, background: T.mint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="plus" size={17} color="#08231A" sw={2.8} />
              </div>
            </div>
          ))}
        </div>
      </Sheet>
    </div>
  );
}
