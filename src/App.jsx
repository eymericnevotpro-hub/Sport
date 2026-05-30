/* App.jsx — data, routing, bottom nav, device stage + scaling */
import React from 'react';
import { T, Icon } from './theme.jsx';
import { AndroidDevice } from './AndroidFrame.jsx';
import { HomeScreen } from './screens/Home.jsx';
import { ProgramScreen } from './screens/Program.jsx';
import { SessionScreen } from './screens/Session.jsx';
import { NutritionScreen } from './screens/Nutrition.jsx';
import { ProgressScreen } from './screens/Progress.jsx';
import { Tweaks } from './Tweaks.jsx';

const TODAY = {
  title: 'Pecs & Triceps',
  duration: 45,
  kcal: 430,
  exercises: [
    { name: 'Développé couché haltères', sets: 4, reps: 12, weight: 24, rest: 90, img: '/exercises/Dumbbell_Bench_Press' },
    { name: 'Écarté incliné à la poulie', sets: 3, reps: 15, weight: 12, rest: 75, img: '/exercises/Incline_Dumbbell_Flyes' },
    { name: 'Développé incliné machine', sets: 4, reps: 10, weight: 40, rest: 90, img: '/exercises/Incline_Dumbbell_Press' },
    { name: 'Dips lestés', sets: 3, reps: 12, weight: 10, rest: 75, img: '/exercises/Dips_-_Triceps_Version' },
    { name: 'Extension triceps poulie', sets: 3, reps: 15, weight: 25, rest: 60, img: '/exercises/Triceps_Pushdown' },
    { name: 'Barre au front', sets: 3, reps: 12, weight: 20, rest: 60, img: '/exercises/EZ-Bar_Skullcrusher' },
  ],
};
const NUTRITION = { kcal: 1440, kcalGoal: 2200, p: 145, pGoal: 160, c: 150, cGoal: 220, f: 30, fGoal: 70 };
const MACRO_GOAL = { p: 160, c: 220, f: 70 };

const NAV = [
  { k: 'home', l: 'Accueil', icon: 'home' },
  { k: 'program', l: 'Séance', icon: 'dumbbell' },
  { k: 'nutrition', l: 'Nutrition', icon: 'fork' },
  { k: 'progress', l: 'Progrès', icon: 'chart' },
];

function Phone({ accent }) {
  const [tab, setTab] = React.useState('home');
  const [session, setSession] = React.useState(false);

  const screen = () => {
    switch (tab) {
      case 'home': return <HomeScreen user="Léa" streak={12} today={TODAY} nutrition={NUTRITION} nav={setTab} openSession={() => setSession(true)} />;
      case 'program': return <ProgramScreen today={TODAY} openSession={() => setSession(true)} />;
      case 'nutrition': return <NutritionScreen kcalGoal={NUTRITION.kcalGoal} macroGoal={MACRO_GOAL} />;
      case 'progress': return <ProgressScreen />;
      default: return null;
    }
  };

  return (
    <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', background: T.bg, fontFamily: T.font }}>
      <div key={tab + accent} className="app-scroll" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {screen()}
      </div>

      {/* bottom nav */}
      <div style={{ flexShrink: 0, background: '#fff', boxShadow: T.shadowUp, padding: '8px 12px 10px', display: 'flex', justifyContent: 'space-around', borderTop: '1px solid '+T.line }}>
        {NAV.map(n => {
          const on = tab === n.k;
          return (
            <div key={n.k} onClick={() => setTab(n.k)} className="presslite" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, cursor: 'pointer', padding: '4px 0' }}>
              <div style={{ width: 52, height: 32, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: on ? T.mintSoft : 'transparent', transition: `background .3s ${T.spring}` }}>
                <Icon name={n.icon} size={23} color={on ? T.mintDk : T.ink3} sw={on ? 2.5 : 2.1} />
              </div>
              <span style={{ fontSize: 10.5, fontWeight: on ? 800 : 600, color: on ? T.ink : T.ink3 }}>{n.l}</span>
            </div>
          );
        })}
      </div>

      {session && (
        <SessionScreen today={TODAY} onClose={() => setSession(false)}
          onFinish={(dest) => { setSession(false); if (dest === 'progress') setTab('progress'); }} />
      )}
    </div>
  );
}

export default function App() {
  const [accent, setAccent] = React.useState('#16E0A0');
  const [reduceMotion, setReduceMotion] = React.useState(false);
  const stageRef = React.useRef(null);

  React.useEffect(() => { document.body.classList.toggle('noanim', reduceMotion); }, [reduceMotion]);

  // Scale the fixed-size phone stage to fit the viewport.
  React.useEffect(() => {
    const fit = () => {
      const stage = stageRef.current;
      if (!stage) return;
      const W = 412 + 16, H = 892 + 16; // device + border
      const pad = 24;
      const s = Math.min((window.innerWidth - pad) / W, (window.innerHeight - pad) / H, 1.1);
      stage.style.transform = `scale(${s})`;
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  return (
    <>
      <div id="stage" ref={stageRef}>
        <AndroidDevice>
          <Phone accent={accent} />
        </AndroidDevice>
      </div>
      <Tweaks accent={accent} setAccent={setAccent} reduceMotion={reduceMotion} setReduceMotion={setReduceMotion} />
    </>
  );
}
