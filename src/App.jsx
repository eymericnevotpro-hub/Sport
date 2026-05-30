/* App.jsx — routing, bottom nav, program-driven today, full-screen shell */
import React from 'react';
import { T, Icon } from './theme.jsx';
import { HomeScreen } from './screens/Home.jsx';
import { ProgramScreen } from './screens/Program.jsx';
import { SessionScreen } from './screens/Session.jsx';
import { NutritionScreen } from './screens/Nutrition.jsx';
import { ProgressScreen } from './screens/Progress.jsx';
import { Tweaks } from './Tweaks.jsx';
import { getProgramId, subscribeProgram } from './programStore.js';
import { getProgramById, todayIndex, dayForSlot } from './programs.js';

// Nutrition goals (targets); consumed values start at 0 — user logs his own.
const NUTRITION_GOAL = { kcalGoal: 2200, p: 160, c: 220, f: 70 };

const NAV = [
  { k: 'home', l: 'Accueil', icon: 'home' },
  { k: 'program', l: 'Séance', icon: 'dumbbell' },
  { k: 'nutrition', l: 'Nutrition', icon: 'fork' },
  { k: 'progress', l: 'Progrès', icon: 'chart' },
];

function Phone({ accent }) {
  const [tab, setTab] = React.useState('home');
  const [sessionDay, setSessionDay] = React.useState(null);
  const [, bump] = React.useReducer((x) => x + 1, 0);

  React.useEffect(() => subscribeProgram(bump), []);

  const program = getProgramById(getProgramId());
  const tIdx = todayIndex();
  const todayDay = dayForSlot(program, tIdx);

  const openSession = (day) => { if (day) { setSessionDay(day); } };

  const screen = () => {
    switch (tab) {
      case 'home': return <HomeScreen user="Brick" today={todayDay} nutritionGoal={NUTRITION_GOAL}
        nav={setTab} openToday={() => openSession(todayDay)} goProgram={() => setTab('program')} />;
      case 'program': return <ProgramScreen openSession={openSession} />;
      case 'nutrition': return <NutritionScreen goal={NUTRITION_GOAL} />;
      case 'progress': return <ProgressScreen />;
      default: return null;
    }
  };

  return (
    <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', background: T.bg, fontFamily: T.font }}>
      <div key={tab + accent} className="app-scroll" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingTop: 'env(safe-area-inset-top)' }}>
        {screen()}
      </div>

      {/* bottom nav */}
      <div style={{ flexShrink: 0, background: '#fff', boxShadow: T.shadowUp, padding: '8px 12px calc(10px + env(safe-area-inset-bottom))', display: 'flex', justifyContent: 'space-around', borderTop: '1px solid '+T.line }}>
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

      {sessionDay && (
        <SessionScreen today={sessionDay} onClose={() => setSessionDay(null)}
          onFinish={(dest) => { setSessionDay(null); if (dest === 'progress') setTab('progress'); }} />
      )}
    </div>
  );
}

export default function App() {
  const [accent, setAccent] = React.useState('#16E0A0');
  const [reduceMotion, setReduceMotion] = React.useState(false);

  React.useEffect(() => { document.body.classList.toggle('noanim', reduceMotion); }, [reduceMotion]);

  return (
    <>
      {/* Full-screen on phones; capped to a phone-width column on wider screens. */}
      <div style={{
        position: 'relative', width: '100%', maxWidth: 480, height: '100%',
        background: T.bg, overflow: 'hidden', boxShadow: '0 0 60px rgba(14,26,20,.10)',
      }}>
        <Phone accent={accent} />
      </div>
      <Tweaks accent={accent} setAccent={setAccent} reduceMotion={reduceMotion} setReduceMotion={setReduceMotion} />
    </>
  );
}
