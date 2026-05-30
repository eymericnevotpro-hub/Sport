/* screens/Session.jsx — real-time workout flow */
import React from 'react';
import { T, Icon, Ring, Chip, ExerciseGif } from '../theme.jsx';

export function SessionScreen({ today, onClose, onFinish }) {
  const ex0 = today.exercises;
  const [sets, setSets] = React.useState(() =>
    ex0.map(ex => Array.from({ length: ex.sets }, () => ({ reps: ex.reps, weight: ex.weight, done: false })))
  );
  const [resting, setResting] = React.useState(false);
  const [restLeft, setRestLeft] = React.useState(0);
  const [restDur, setRestDur] = React.useState(60);
  const [finished, setFinished] = React.useState(false);
  const [startTime] = React.useState(Date.now());

  // derive active position
  let activeEx = -1, activeSet = -1;
  for (let i = 0; i < sets.length; i++) {
    const s = sets[i].findIndex(x => !x.done);
    if (s !== -1) { activeEx = i; activeSet = s; break; }
  }

  const totalSets = sets.reduce((a, s) => a + s.length, 0);
  const doneSets = sets.reduce((a, s) => a + s.filter(x => x.done).length, 0);

  // rest countdown
  React.useEffect(() => {
    if (!resting) return;
    if (restLeft <= 0) { setResting(false); return; }
    const t = setTimeout(() => setRestLeft(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [resting, restLeft]);

  const setField = (exi, seti, field, val) => {
    setSets(prev => prev.map((s, i) => i !== exi ? s : s.map((x, j) => j !== seti ? x : { ...x, [field]: Math.max(0, val) })));
  };

  const validate = () => {
    const exi = activeEx, seti = activeSet;
    const next = sets.map((s, i) => i !== exi ? s : s.map((x, j) => j !== seti ? x : { ...x, done: true }));
    setSets(next);
    const stillLeft = next.some(s => s.some(x => !x.done));
    if (!stillLeft) { setFinished(true); return; }
    const dur = ex0[exi].rest;
    setRestDur(dur); setRestLeft(dur); setResting(true);
  };

  if (finished) return <FinishView today={today} sets={sets} startTime={startTime} onFinish={onFinish} />;

  const ex = ex0[activeEx];
  const cur = sets[activeEx][activeSet];

  // next-up for rest preview
  let nextLabel = '';
  {
    const tmp = sets.map((s, i) => i !== activeEx ? s : s.map((x, j) => j !== activeSet ? x : { ...x, done: true }));
    for (let i = 0; i < tmp.length; i++) { const s = tmp[i].findIndex(x => !x.done); if (s !== -1) { nextLabel = `${ex0[i].name} · Série ${s + 1}`; break; } }
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: T.bg, zIndex: 50, display: 'flex', flexDirection: 'column', fontFamily: T.font }}>
      {/* header */}
      <div style={{ padding: '14px 18px 10px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div onClick={onClose} className="presslite" style={{ width: 40, height: 40, borderRadius: 13, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: T.shadow }}>
            <Icon name="x" size={20} color={T.ink} />
          </div>
          <div style={{ flex: 1, height: 8, borderRadius: 999, background: '#E6ECE9', overflow: 'hidden' }}>
            <div style={{ width: `${(doneSets / totalSets) * 100}%`, height: '100%', borderRadius: 999, background: T.mint, transition: `width .5s ${T.spring}` }} />
          </div>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.ink2, minWidth: 38, textAlign: 'right' }}>{doneSets}/{totalSets}</div>
        </div>
      </div>

      <div className="app-scroll" style={{ flex: 1, overflowY: 'auto', padding: '4px 18px 24px' }}>
        {/* GIF */}
        <div style={{ position: 'relative', borderRadius: 28, overflow: 'hidden', boxShadow: T.shadow, background: '#E9EEEB' }}>
          <ExerciseGif src={ex.gif} radius={28} style={{ width: '100%', height: 250 }} />
          <span style={{ position: 'absolute', top: 12, left: 12, display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 11px', borderRadius: 999, background: 'rgba(14,26,20,.72)', color: '#fff', fontSize: 11.5, fontWeight: 800, backdropFilter: 'blur(6px)' }}>
            <Icon name="dumbbell" size={13} color={T.mint} sw={2.6}/> Exercice {activeEx + 1}/{ex0.length}
          </span>
          <span className="presslite" style={{ position: 'absolute', top: 12, right: 12, display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 11px', borderRadius: 999, background: 'rgba(255,255,255,.92)', color: T.ink, fontSize: 11.5, fontWeight: 800, boxShadow: T.shadow }}>
            <Icon name="info" size={14} sw={2.4}/> Technique
          </span>
        </div>

        {/* title */}
        <div style={{ margin: '18px 2px 14px' }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: -0.6, lineHeight: 1.08 }}>{ex.name}</h1>
          <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 13, fontWeight: 700, color: T.ink2 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="target" size={15} sw={2.2} color={T.mintDk}/>{ex.reps} reps cible</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="timer" size={15} sw={2.2} color={T.mintDk}/>repos {ex.rest}s</span>
          </div>
        </div>

        {/* sets chips */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {sets[activeEx].map((s, i) => {
            const isCur = i === activeSet;
            return (
              <div key={i} style={{ flex: 1, height: 44, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontSize: 14, fontWeight: 800,
                background: s.done ? T.mint : isCur ? '#fff' : '#EEF2F0',
                color: s.done ? '#08231A' : isCur ? T.ink : T.ink3,
                border: isCur ? `2px solid ${T.ink}` : '2px solid transparent',
                boxShadow: isCur ? T.shadow : 'none' }}>
                {s.done ? <span style={{ animation: 'checkPop .4s .04s forwards' }}><Icon name="check" size={18} color="#08231A" sw={3}/></span> : `S${i + 1}`}
              </div>
            );
          })}
        </div>

        {/* current set steppers */}
        <div style={{ background: '#fff', borderRadius: 26, padding: '16px 16px 18px', boxShadow: T.shadow }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontSize: 15, fontWeight: 800 }}>Série {activeSet + 1} <span style={{ color: T.ink3 }}>/ {ex.sets}</span></span>
            <Chip icon="bolt" bg={T.mintSoft} color={T.mintDk}>En cours</Chip>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Stepper label="Répétitions" value={cur.reps} step={1} onChange={v => setField(activeEx, activeSet, 'reps', v)} />
            <Stepper label="Poids (kg)" value={cur.weight} step={2.5} dec onChange={v => setField(activeEx, activeSet, 'weight', v)} />
          </div>
        </div>
      </div>

      {/* validate */}
      <div style={{ flexShrink: 0, padding: '12px 18px 16px', background: 'linear-gradient(180deg, rgba(243,246,244,0), '+T.bg+' 30%)' }}>
        <button onClick={validate} className="press" style={{ width: '100%', border: 'none', cursor: 'pointer', padding: '18px', borderRadius: 999,
          background: T.mint, color: '#08231A', fontSize: 17, fontWeight: 800, fontFamily: T.font, boxShadow: T.glow,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9 }}>
          <Icon name="check" size={22} color="#08231A" sw={3}/> Valider la série
        </button>
      </div>

      {/* rest overlay */}
      {resting && <RestOverlay left={restLeft} dur={restDur} nextLabel={nextLabel}
        onSkip={() => setResting(false)}
        onAdd={() => { setRestLeft(v => v + 15); setRestDur(d => d + 15); }} />}
    </div>
  );
}

function Stepper({ label, value, step, onChange, dec = false }) {
  const fmt = v => dec ? (Math.round(v * 10) / 10).toString().replace('.', ',') : v;
  const btn = (icon, fn) => (
    <div onClick={fn} className="presslite" style={{ width: 40, height: 40, borderRadius: 13, background: '#F1F4F2', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
      <Icon name={icon} size={20} color={T.ink} sw={2.6} />
    </div>
  );
  return (
    <div style={{ flex: 1, background: '#F7F9F8', borderRadius: 20, padding: '12px 10px 14px', textAlign: 'center' }}>
      <div style={{ fontSize: 11.5, fontWeight: 700, color: T.ink3, marginBottom: 8 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
        {btn('minus', () => onChange(value - step))}
        <span style={{ fontFamily: T.mono, fontSize: 26, fontWeight: 700, minWidth: 44 }}>{fmt(value)}</span>
        {btn('plus', () => onChange(value + step))}
      </div>
    </div>
  );
}

function RestOverlay({ left, dur, nextLabel, onSkip, onAdd }) {
  const mm = Math.floor(left / 60), ss = left % 60;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 70, background: 'linear-gradient(165deg,#13211A,#0B140F)', color: '#fff',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 28, animation: 'fadeIn .3s .04s forwards' }}>
      <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 2, color: T.mint, textTransform: 'uppercase' }}>Repos</div>
      <div style={{ position: 'relative', margin: '24px 0 8px', animation: 'ringPulse 2s ease-in-out infinite' }}>
        <Ring size={220} stroke={14} value={left / dur} color={T.mint} track="rgba(255,255,255,.10)" glow anim={false}>
          <div style={{ fontFamily: T.mono, fontSize: 60, fontWeight: 700, lineHeight: 1, letterSpacing: -1 }}>{mm}:{ss.toString().padStart(2, '0')}</div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: 'rgba(255,255,255,.5)', marginTop: 4 }}>récupération</div>
        </Ring>
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 22 }}>
        <button onClick={onAdd} className="presslite" style={{ border: '1.5px solid rgba(255,255,255,.22)', background: 'rgba(255,255,255,.06)', color: '#fff', padding: '13px 20px', borderRadius: 999, fontSize: 14.5, fontWeight: 800, fontFamily: T.font, cursor: 'pointer' }}>+15 s</button>
        <button onClick={onSkip} className="press" style={{ border: 'none', background: T.mint, color: '#08231A', padding: '13px 26px', borderRadius: 999, fontSize: 14.5, fontWeight: 800, fontFamily: T.font, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7, boxShadow: T.glow }}>
          <Icon name="skip" size={18} color="#08231A" sw={2.4}/> Passer
        </button>
      </div>
      {nextLabel && (
        <div style={{ position: 'absolute', bottom: 34, left: 28, right: 28, background: 'rgba(255,255,255,.07)', borderRadius: 18, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Icon name="arrowU" size={18} color={T.mint} sw={2.4}/>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: .5 }}>À suivre</div>
            <div style={{ fontSize: 14.5, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{nextLabel}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function FinishView({ today, sets, startTime, onFinish }) {
  const volume = sets.reduce((a, s) => a + s.reduce((b, x) => b + (x.done ? x.reps * x.weight : 0), 0), 0);
  const nSets = sets.reduce((a, s) => a + s.filter(x => x.done).length, 0);
  const mins = Math.max(1, Math.round((Date.now() - startTime) / 60000));
  const stat = (big, small, color) => (
    <div style={{ flex: 1, background: '#fff', borderRadius: 20, padding: '14px 8px', textAlign: 'center', boxShadow: T.shadow }}>
      <div style={{ fontFamily: T.mono, fontSize: 22, fontWeight: 700, color, letterSpacing: -0.5 }}>{big}</div>
      <div style={{ fontSize: 11, fontWeight: 700, color: T.ink3, marginTop: 3 }}>{small}</div>
    </div>
  );
  return (
    <div style={{ position: 'absolute', inset: 0, background: T.bg, zIndex: 50, display: 'flex', flexDirection: 'column', fontFamily: T.font }}>
      <div className="app-scroll" style={{ flex: 1, overflowY: 'auto', padding: '40px 22px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: 96, height: 96, borderRadius: 999, background: T.mint, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: T.glow, animation: 'popIn .5s .04s forwards' }}>
          <Icon name="check" size={52} color="#08231A" sw={3} />
        </div>
        <h1 style={{ margin: '22px 0 6px', fontSize: 28, fontWeight: 800, letterSpacing: -0.7, textAlign: 'center', animation: 'slideUp .5s .05s forwards' }}>Séance terminée !</h1>
        <p style={{ margin: 0, fontSize: 14.5, fontWeight: 600, color: T.ink2, textAlign: 'center', animation: 'slideUp .5s .1s forwards' }}>{today.title} · beau travail 💪</p>

        <div style={{ display: 'flex', gap: 10, width: '100%', marginTop: 26, animation: 'slideUp .5s .15s forwards' }}>
          {stat(mins + ' min', 'Durée', T.ink)}
          {stat(nSets, 'Séries', T.mintDk)}
          {stat((volume / 1000).toFixed(1).replace('.', ',') + ' t', 'Volume', T.amber)}
          {stat('~' + today.kcal, 'Kcal', T.coral)}
        </div>

        {/* progress photo prompt */}
        <div style={{ width: '100%', marginTop: 16, background: 'linear-gradient(150deg,#142019,#0E1A14)', borderRadius: 26, padding: 20, color: '#fff', animation: 'slideUp .5s .2s forwards', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -30, top: -30, width: 120, height: 120, borderRadius: 999, background: 'radial-gradient(circle, rgba(110,123,255,.35), transparent 70%)' }} />
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 999, background: 'rgba(110,123,255,.18)', color: '#AEB6FF', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: .4 }}>
            <Icon name="sparkle" size={13} sw={2.4}/> Suivi IA
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.4, marginTop: 12 }}>Capture ta progression</div>
          <p style={{ margin: '7px 0 16px', fontSize: 13.5, lineHeight: 1.45, color: 'rgba(255,255,255,.72)' }}>Une photo face · côté · dos aujourd'hui permet à l'IA de suivre ton évolution et d'ajuster ton programme.</p>
          <button onClick={() => onFinish('progress')} className="press" style={{ width: '100%', border: 'none', cursor: 'pointer', padding: '15px', borderRadius: 999, background: T.mint, color: '#08231A', fontSize: 15.5, fontWeight: 800, fontFamily: T.font, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Icon name="camera" size={19} color="#08231A" sw={2.4}/> Ajouter une photo
          </button>
        </div>
      </div>
      <div style={{ flexShrink: 0, padding: '6px 22px 18px' }}>
        <button onClick={() => onFinish(null)} className="presslite" style={{ width: '100%', border: 'none', cursor: 'pointer', padding: '15px', borderRadius: 999, background: '#fff', color: T.ink, fontSize: 15.5, fontWeight: 800, fontFamily: T.font, boxShadow: T.shadow }}>
          Terminer
        </button>
      </div>
    </div>
  );
}
