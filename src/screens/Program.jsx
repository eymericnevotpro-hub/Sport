/* screens/Program.jsx — program picker + weekly day strip + selected workout */
import React from 'react';
import { T, Icon, Chip, Sheet, ExerciseGif } from '../theme.jsx';
import { getProgramId, setProgramId, subscribeProgram, withOverride } from '../programStore.js';
import { subscribeProfile } from '../profileStore.js';
import { PROGRAMS, getProgramById, WEEKDAYS, durationOf, todayIndex, dayForSlot, shortLabel, adaptDay } from '../programs.js';

export function ProgramScreen({ openSession }) {
  const [, bump] = React.useReducer((x) => x + 1, 0);
  const [picker, setPicker] = React.useState(false);
  const tIdx = todayIndex();
  const [slot, setSlot] = React.useState(tIdx);

  React.useEffect(() => subscribeProgram(bump), []);
  React.useEffect(() => subscribeProfile(bump), []);

  const program = getProgramById(getProgramId());
  const rawDay = withOverride(dayForSlot(program, slot));
  const day = adaptDay(rawDay); // affichage avec exos perso + charges adaptées

  return (
    <div style={{ padding: '6px 18px 12px', animation: 'fadeIn .4s .04s forwards' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '10px 2px 14px', gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: T.ink3, letterSpacing: .3, textTransform: 'uppercase' }}>Mon programme</div>
          <h1 style={{ margin: '3px 0 0', fontSize: 25, fontWeight: 800, letterSpacing: -0.7, lineHeight: 1.05 }}>{program.name}</h1>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: T.mintDk, marginTop: 3 }}>{program.sub}</div>
        </div>
        <div onClick={() => setPicker(true)} className="presslite" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6, padding: '10px 13px', borderRadius: 14, background: T.ink, color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer', boxShadow: T.shadow }}>
          <Icon name="grid" size={16} color="#fff" sw={2.3} /> Changer
        </div>
      </div>

      {/* week strip — every day of the program */}
      <div className="app-scroll" style={{ display: 'flex', gap: 9, overflowX: 'auto', margin: '0 -18px', padding: '0 18px 4px' }}>
        {WEEKDAYS.map((wd, i) => {
          const d = dayForSlot(program, i);
          const sel = i === slot;
          const isToday = i === tIdx;
          return (
            <div key={i} onClick={() => setSlot(i)} className="presslite" style={{ flexShrink: 0, width: 66, padding: '11px 6px', borderRadius: 18, textAlign: 'center', cursor: 'pointer',
              background: sel ? T.ink : '#fff', color: sel ? '#fff' : T.ink, boxShadow: sel ? T.pop : T.shadow, border: sel ? 'none' : '1px solid '+T.line }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: sel ? 'rgba(255,255,255,.6)' : (isToday ? T.mintDk : T.ink3) }}>{wd}{isToday ? ' •' : ''}</div>
              <div style={{ fontSize: 12.5, fontWeight: 800, margin: '6px 0 7px', lineHeight: 1.1, minHeight: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', color: d ? (sel ? '#fff' : T.ink) : (sel ? 'rgba(255,255,255,.5)' : T.ink3) }}>{shortLabel(d)}</div>
              <div style={{ width: 7, height: 7, borderRadius: 999, margin: '0 auto', background: d ? (sel ? T.mint : T.mintDk) : '#D7DEDA' }} />
            </div>
          );
        })}
      </div>

      {/* selected day */}
      {day ? (
        <div style={{ marginTop: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, gap: 10 }}>
            <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800, letterSpacing: -0.5, minWidth: 0 }}>{day.title}</h2>
            <Chip icon="bolt" bg={T.mintSoft} color={T.mintDk}>{slot === tIdx ? "Aujourd'hui" : WEEKDAYS[slot]}</Chip>
          </div>

          <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
            <StatPill icon="dumbbell" big={day.exercises.length} small="exercices" />
            <StatPill icon="clock" big={durationOf(day)} small="minutes" />
            <StatPill icon="flame" big={'~' + day.kcal} small="kcal" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {day.exercises.map((ex, i) => (
              <div key={i} className="presslite" style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#fff', borderRadius: 22, padding: 10, boxShadow: T.shadow }}>
                <div style={{ position: 'relative', width: 62, height: 62, borderRadius: 16, overflow: 'hidden', background: '#fff', flexShrink: 0, border: '1px solid '+T.line }}>
                  <ExerciseGif src={ex.gif} radius={16} style={{ width: 62, height: 62 }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: -0.3, lineHeight: 1.15 }}>{ex.name}</div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 5, fontSize: 12.5, fontWeight: 600, color: T.ink2 }}>
                    <span>{ex.sets} × {ex.reps}</span>
                    <span style={{ color: T.line }}>|</span>
                    <span>{ex.weight ? ex.weight + ' kg' : 'Poids du corps'}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11.5, fontWeight: 700, color: T.ink3 }}>
                    <Icon name="timer" size={14} sw={2.2} color={T.ink3} />{ex.rest}s
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button onClick={() => openSession(rawDay)} className="press" style={{ width: '100%', marginTop: 22, border: 'none', cursor: 'pointer',
            padding: '17px', borderRadius: 999, background: T.mint, color: '#08231A', fontSize: 16.5, fontWeight: 800, fontFamily: T.font,
            boxShadow: T.glow, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9 }}>
            <Icon name="play" size={20} color="#08231A" /> Commencer la séance
          </button>
        </div>
      ) : (
        <div style={{ marginTop: 22, background: '#fff', borderRadius: T.rCard, padding: '34px 20px', boxShadow: T.shadow, textAlign: 'center' }}>
          <div style={{ width: 60, height: 60, borderRadius: 999, background: T.mintSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <Icon name="moon" size={28} color={T.mintDk} sw={2.2} />
          </div>
          <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: -0.4 }}>Jour de repos</div>
          <p style={{ margin: '8px 0 0', fontSize: 13.5, fontWeight: 600, color: T.ink2, lineHeight: 1.45 }}>Récupération prévue {WEEKDAYS[slot] === WEEKDAYS[tIdx] ? "aujourd'hui" : 'ce jour'}. Repos, étirements, et bonne nutrition 💤</p>
        </div>
      )}

      {/* program picker */}
      <Sheet open={picker} onClose={() => setPicker(false)} title="Choisir un programme">
        <p style={{ margin: '0 2px 14px', fontSize: 13, lineHeight: 1.5, color: T.ink2, fontWeight: 600 }}>Sélectionne ta répartition d'entraînement hebdomadaire.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {PROGRAMS.map((p) => {
            const on = p.id === program.id;
            const sessions = p.week.filter((s) => s !== 'rest').length;
            return (
              <div key={p.id} onClick={() => { setProgramId(p.id); setSlot(todayIndex()); setPicker(false); }} className="presslite" style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '14px 15px', borderRadius: 18, cursor: 'pointer',
                background: on ? T.ink : '#F7F9F8', color: on ? '#fff' : T.ink, border: on ? 'none' : '1px solid '+T.line }}>
                <div style={{ width: 42, height: 42, borderRadius: 13, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: on ? 'rgba(255,255,255,.12)' : T.mintSoft }}>
                  <Icon name="dumbbell" size={21} color={on ? T.mint : T.mintDk} sw={2.3} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15.5, fontWeight: 800, letterSpacing: -0.3 }}>{p.name}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: on ? 'rgba(255,255,255,.6)' : T.ink3, marginTop: 2 }}>{p.sub} · {sessions} séances</div>
                </div>
                {on
                  ? <Icon name="check" size={22} color={T.mint} sw={3} />
                  : <Icon name="chevR" size={20} color={T.ink3} sw={2.4} />}
              </div>
            );
          })}
        </div>
      </Sheet>
    </div>
  );
}

function StatPill({ icon, big, small }) {
  return (
    <div style={{ flex: 1, background: '#fff', borderRadius: 18, padding: '12px 8px', boxShadow: T.shadow, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <Icon name={icon} size={19} color={T.mintDk} sw={2.3} />
      <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.4, lineHeight: 1 }}>{big}</div>
      <div style={{ fontSize: 11, fontWeight: 700, color: T.ink3 }}>{small}</div>
    </div>
  );
}
