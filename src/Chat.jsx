/* Chat.jsx — assistant Claude intégré (questions + changements appliqués) */
import React from 'react';
import { T, Icon } from './theme.jsx';
import { getProfile, setField } from './profileStore.js';
import { getProgramId, setProgramId, setDayExercises, withOverride } from './programStore.js';
import { getProgramById, PROGRAMS, exerciseList, makeExercise } from './programs.js';
import { computeNutritionGoal } from './nutrition.js';
import { setMeals } from './nutritionStore.js';

function applyActions(actions) {
  const applied = [];
  for (const a of actions || []) {
    if (a.type === 'set_program' && PROGRAMS.some((p) => p.id === a.programId)) {
      setProgramId(a.programId);
      applied.push('Programme : ' + getProgramById(a.programId).name);
    } else if (a.type === 'set_nutrition' && a.kcal) {
      setField('nutritionOverride', {
        kcalGoal: Math.round(a.kcal),
        p: Math.round(a.protein || 0), c: Math.round(a.carbs || 0), f: Math.round(a.fat || 0),
      });
      applied.push('Nutrition : ' + Math.round(a.kcal) + ' kcal');
    } else if (a.type === 'set_meal_plan' && Array.isArray(a.items)) {
      const m = { b: [], l: [], s: [], d: [] };
      for (const it of a.items) {
        if (m[it.meal]) m[it.meal].push({ name: it.name, qty: it.qty, unit: it.unit, kcal: it.kcal, p: it.protein, c: it.carbs, f: it.fat });
      }
      setMeals(m);
      applied.push('Plan nutrition mis à jour');
    } else if (a.type === 'set_day_exercises' && a.day && Array.isArray(a.exercises)) {
      const exos = a.exercises
        .map((e) => makeExercise(e.key, e.sets, e.reps, e.weight, e.rest))
        .filter(Boolean);
      if (exos.length) { setDayExercises(a.day, exos); applied.push('Séance « ' + a.day + ' » modifiée'); }
    }
  }
  return applied;
}

function buildContext() {
  const p = getProfile();
  const pr = getProgramById(getProgramId());
  const g = computeNutritionGoal(p);
  return {
    sexe: p.sex, age: p.age, niveau: p.level, objectif: p.goal,
    poidsKg: p.weight, tailleCm: p.height,
    mensurations_cm: { poitrine: p.poitrine, bras: p.bras, tourDeTaille: p.taille, cuisse: p.cuisse },
    programmeActuel: pr.name, programmeId: pr.id,
    nutritionCible: { kcal: g.kcalGoal, prot: g.p, gluc: g.c, lip: g.f },
    // Jours du programme actuel (titres = identifiants pour set_day_exercises)
    joursDuProgramme: pr.days.map((d) => ({
      titre: d.title,
      exercices: withOverride(d).exercises.map((e) => ({ nom: e.name, series: e.sets, reps: e.reps })),
    })),
    // Bibliothèque d'exercices disponibles (clés valides pour set_day_exercises)
    exercicesDisponibles: exerciseList(),
  };
}

export function Chat({ landscape }) {
  const [open, setOpen] = React.useState(false);
  const [msgs, setMsgs] = React.useState([
    { role: 'assistant', content: 'Salut Brick 👋 Je suis ton coach IA. Demande-moi un conseil, ou un changement (ex. « passe-moi en PPL », « adapte ma nutrition pour sécher »).' },
  ]);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const scrollRef = React.useRef(null);

  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgs, open, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const next = [...msgs, { role: 'user', content: text }];
    setMsgs(next);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next.filter((m) => m.role !== 'system'), context: buildContext() }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Indisponible');
      const data = await res.json();
      const applied = applyActions(data.actions);
      let content = data.reply || '…';
      if (applied.length) content += '\n\n✅ Appliqué — ' + applied.join(' · ');
      setMsgs((m) => [...m, { role: 'assistant', content }]);
    } catch (e) {
      setMsgs((m) => [...m, { role: 'assistant', content: '⚠️ ' + (e.message || 'Erreur, réessaie.') }]);
    } finally {
      setLoading(false);
    }
  };

  const fabPos = landscape
    ? { right: 16, bottom: 'calc(16px + env(safe-area-inset-bottom))' }
    : { right: 16, bottom: 'calc(80px + env(safe-area-inset-bottom))' };

  return (
    <>
      {!open && (
        <button onClick={() => setOpen(true)} aria-label="Assistant IA" style={{
          position: 'absolute', ...fabPos, zIndex: 90, width: 54, height: 54, borderRadius: 18, border: 'none',
          cursor: 'pointer', background: T.ink, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: T.pop,
        }}>
          <Icon name="chat" size={26} color={T.mint} sw={2.2} />
        </button>
      )}

      {open && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 95, display: 'flex', flexDirection: 'column', background: T.bg, fontFamily: T.font, animation: 'fadeIn .2s .02s forwards' }}>
          {/* header */}
          <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 12, padding: 'calc(14px + env(safe-area-inset-top)) 16px 12px', background: '#fff', boxShadow: T.shadow }}>
            <div style={{ width: 40, height: 40, borderRadius: 13, background: T.ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="chat" size={22} color={T.mint} sw={2.2} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: -0.3 }}>Coach IA</div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: T.mintDk }}>Claude · sport & nutrition</div>
            </div>
            <div onClick={() => setOpen(false)} className="presslite" style={{ width: 38, height: 38, borderRadius: 12, background: '#F1F4F2', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Icon name="x" size={20} color={T.ink} />
            </div>
          </div>

          {/* messages */}
          <div ref={scrollRef} className="app-scroll" style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%',
                background: m.role === 'user' ? T.mint : '#fff', color: m.role === 'user' ? '#08231A' : T.ink,
                borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                padding: '11px 14px', boxShadow: T.shadow, fontSize: 14.5, fontWeight: 500, lineHeight: 1.45, whiteSpace: 'pre-wrap' }}>
                {m.content}
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start', background: '#fff', borderRadius: '18px 18px 18px 4px', padding: '12px 16px', boxShadow: T.shadow, display: 'flex', gap: 5 }}>
                {[0, 1, 2].map((i) => <span key={i} style={{ width: 7, height: 7, borderRadius: 999, background: T.ink3, display: 'inline-block', animation: `ringPulse 1s ${i * 0.15}s ease-in-out infinite` }} />)}
              </div>
            )}
          </div>

          {/* input */}
          <div style={{ flexShrink: 0, padding: '10px 12px calc(12px + env(safe-area-inset-bottom))', background: '#fff', boxShadow: T.shadowUp, display: 'flex', alignItems: 'center', gap: 9 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
              placeholder="Demande un conseil ou un changement…"
              style={{ flex: 1, border: 'none', background: '#F1F4F2', borderRadius: 14, padding: '13px 15px', fontSize: 14.5, fontFamily: T.font, outline: 'none', color: T.ink, minWidth: 0 }}
            />
            <button onClick={send} disabled={loading || !input.trim()} className="presslite" style={{ width: 46, height: 46, borderRadius: 14, border: 'none', cursor: input.trim() ? 'pointer' : 'default', background: input.trim() ? T.mint : '#E6ECE9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="send" size={22} color={input.trim() ? '#08231A' : T.ink3} sw={2.2} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
