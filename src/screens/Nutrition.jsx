/* screens/Nutrition.jsx */
import React from 'react';
import { T, Icon, MacroBar, SectionTitle, Sheet } from '../theme.jsx';

export function NutritionScreen({ kcalGoal, macroGoal }) {
  const [meals, setMeals] = React.useState(() => ([
    { id: 'b', name: 'Petit-déjeuner', icon: 'moon', items: [
      { name: "Flocons d'avoine + banane", kcal: 320, p: 12, c: 58, f: 6 },
      { name: 'Whey vanille', kcal: 200, p: 40, c: 6, f: 3 },
    ] },
    { id: 'l', name: 'Déjeuner', icon: 'fork', items: [
      { name: 'Poulet grillé 180g', kcal: 300, p: 56, c: 0, f: 8 },
      { name: 'Riz basmati 150g', kcal: 280, p: 6, c: 60, f: 1 },
      { name: 'Brocoli vapeur', kcal: 100, p: 6, c: 14, f: 1 },
    ] },
    { id: 's', name: 'Collation', icon: 'bolt', items: [
      { name: 'Skyr nature', kcal: 120, p: 20, c: 8, f: 0 },
      { name: 'Amandes 20g', kcal: 120, p: 5, c: 4, f: 11 },
    ] },
    { id: 'd', name: 'Dîner', icon: 'fork', items: [] },
  ]));
  const [sheet, setSheet] = React.useState(null); // meal id
  const [water, setWater] = React.useState(5);

  const sum = (f) => meals.reduce((a, m) => a + m.items.reduce((b, it) => b + it[f], 0), 0);
  const kcal = sum('kcal'), p = sum('p'), c = sum('c'), f = sum('f');
  const kcalPct = kcal / kcalGoal;

  const suggestions = [
    { name: 'Œufs brouillés (2)', kcal: 180, p: 14, c: 1, f: 13 },
    { name: 'Saumon 150g', kcal: 280, p: 34, c: 0, f: 16 },
    { name: 'Patate douce 200g', kcal: 180, p: 3, c: 41, f: 0 },
    { name: 'Fromage blanc 0%', kcal: 90, p: 16, c: 6, f: 0 },
    { name: 'Avocat ½', kcal: 160, p: 2, c: 9, f: 15 },
    { name: 'Barre protéinée', kcal: 210, p: 20, c: 21, f: 7 },
  ];
  const addFood = (food) => {
    setMeals(prev => prev.map(m => m.id !== sheet ? m : { ...m, items: [...m.items, food] }));
    setSheet(null);
  };

  return (
    <div style={{ padding: '6px 18px 12px', animation: 'fadeIn .4s .04s forwards' }}>
      <div style={{ padding: '10px 2px 16px' }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: T.ink3, letterSpacing: .3, textTransform: 'uppercase' }}>Aujourd'hui</div>
        <h1 style={{ margin: '3px 0 0', fontSize: 26, fontWeight: 800, letterSpacing: -0.7 }}>Nutrition</h1>
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
          {meals.map(m => {
            const mk = m.items.reduce((a, it) => a + it.kcal, 0);
            return (
              <div key={m.id} style={{ background: '#fff', borderRadius: 24, padding: '14px 16px', boxShadow: T.shadow }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: m.items.length ? 12 : 4 }}>
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
                {m.items.map((it, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderTop: '1px solid '+T.line }}>
                    <div style={{ width: 6, height: 6, borderRadius: 999, background: T.mint, flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: T.ink }}>{it.name}</span>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: T.ink3 }}>{it.kcal} kcal</span>
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
          <span style={{ fontSize: 14, fontWeight: 600, color: T.ink3 }}>Rechercher ou scanner…</span>
        </div>
        <div style={{ fontSize: 12, fontWeight: 800, color: T.ink3, textTransform: 'uppercase', letterSpacing: .4, margin: '0 2px 10px' }}>Suggestions</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 280, overflowY: 'auto' }} className="app-scroll">
          {suggestions.map((s, i) => (
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
