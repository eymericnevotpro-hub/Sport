/* screens/Program.jsx */
import { T, Icon, Chip, ExerciseGif } from '../theme.jsx';

export function ProgramScreen({ openSession, today }) {
  const days = [
    { d: 'Lun', n: '26', label: 'Pecs · Tri', done: true },
    { d: 'Mar', n: '27', label: 'Dos · Bi', done: true },
    { d: 'Mer', n: '28', label: 'Repos', rest: true },
    { d: 'Jeu', n: '29', label: 'Jambes', done: true },
    { d: 'Ven', n: '30', label: 'Pecs · Tri', active: true },
    { d: 'Sam', n: '31', label: 'Épaules' },
    { d: 'Dim', n: '01', label: 'Repos', rest: true },
  ];
  return (
    <div style={{ padding: '6px 18px 12px', animation: 'fadeIn .4s .04s forwards' }}>
      <div style={{ padding: '10px 2px 16px' }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: T.ink3, letterSpacing: .3, textTransform: 'uppercase' }}>Mon programme</div>
        <h1 style={{ margin: '3px 0 0', fontSize: 26, fontWeight: 800, letterSpacing: -0.7 }}>Prise de masse · S4</h1>
      </div>

      {/* week strip */}
      <div className="app-scroll" style={{ display: 'flex', gap: 9, overflowX: 'auto', margin: '0 -18px', padding: '0 18px 4px' }}>
        {days.map((day, i) => {
          const active = day.active;
          return (
            <div key={i} className="presslite" style={{ flexShrink: 0, width: 60, padding: '12px 6px', borderRadius: 20, textAlign: 'center',
              background: active ? T.ink : '#fff', color: active ? '#fff' : T.ink, boxShadow: active ? T.pop : T.shadow,
              border: active ? 'none' : '1px solid '+T.line }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: active ? 'rgba(255,255,255,.6)' : T.ink3 }}>{day.d}</div>
              <div style={{ fontSize: 19, fontWeight: 800, margin: '2px 0 7px' }}>{day.n}</div>
              <div style={{ width: 7, height: 7, borderRadius: 999, margin: '0 auto',
                background: day.active ? T.mint : day.done ? T.mintDk : day.rest ? '#D7DEDA' : '#CBD4CF' }} />
            </div>
          );
        })}
      </div>

      {/* today's workout */}
      <div style={{ marginTop: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, letterSpacing: -0.5 }}>{today.title}</h2>
          <Chip icon="bolt" bg={T.mintSoft} color={T.mintDk}>Intermédiaire</Chip>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
          <StatPill icon="dumbbell" big={today.exercises.length} small="exercices" />
          <StatPill icon="clock" big={today.duration} small="minutes" />
          <StatPill icon="flame" big={'~'+today.kcal} small="kcal" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {today.exercises.map((ex, i) => (
            <div key={i} className="presslite" style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#fff', borderRadius: 22, padding: 10, boxShadow: T.shadow }}>
              <div style={{ position: 'relative', width: 62, height: 62, borderRadius: 16, overflow: 'hidden', background: '#F1F4F2', flexShrink: 0 }}>
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
                <span style={{ width: 26, height: 26, borderRadius: 999, background: '#F1F4F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="chevR" size={15} sw={2.4} color={T.ink2} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <button onClick={openSession} className="press" style={{ width: '100%', marginTop: 22, border: 'none', cursor: 'pointer',
        padding: '17px', borderRadius: 999, background: T.mint, color: '#08231A', fontSize: 16.5, fontWeight: 800, fontFamily: T.font,
        boxShadow: T.glow, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9 }}>
        <Icon name="play" size={20} color="#08231A" /> Commencer la séance
      </button>
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
