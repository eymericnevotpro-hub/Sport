/* App.jsx — routing, responsive nav (bottom in portrait / side rail in landscape) */
import React from 'react';
import { T, Icon, applyAccent } from './theme.jsx';
import { HomeScreen } from './screens/Home.jsx';
import { ProgramScreen } from './screens/Program.jsx';
import { SessionScreen } from './screens/Session.jsx';
import { NutritionScreen } from './screens/Nutrition.jsx';
import { ProgressScreen } from './screens/Progress.jsx';
import { getProgramId, subscribeProgram, withOverride } from './programStore.js';
import { getProgramById, todayIndex, dayForSlot, adaptDay } from './programs.js';
import { getProfile, subscribeProfile } from './profileStore.js';
import { computeNutritionGoal } from './nutrition.js';
import { Chat } from './Chat.jsx';

// Accent couleur par défaut : orange.
applyAccent('#FF7A4D');

const NAV = [
  { k: 'home', l: 'Accueil', icon: 'home' },
  { k: 'program', l: 'Séance', icon: 'dumbbell' },
  { k: 'nutrition', l: 'Nutrition', icon: 'fork' },
  { k: 'progress', l: 'Progrès', icon: 'chart' },
];

// Landscape = wide AND short (phone turned sideways). Tall screens (desktop,
// tablet portrait) keep the phone-style column with a bottom nav.
function useLandscape() {
  const get = () => typeof window !== 'undefined' && window.innerWidth > window.innerHeight && window.innerHeight < 560;
  const [land, setLand] = React.useState(get);
  React.useEffect(() => {
    const on = () => setLand(get());
    window.addEventListener('resize', on);
    window.addEventListener('orientationchange', on);
    return () => { window.removeEventListener('resize', on); window.removeEventListener('orientationchange', on); };
  }, []);
  return land;
}

function NavItem({ n, on, onClick, vertical }) {
  return (
    <div onClick={onClick} className="presslite" style={{
      flex: vertical ? '0 0 auto' : 1, width: vertical ? '100%' : undefined,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
      cursor: 'pointer', padding: vertical ? '8px 0' : '4px 0',
    }}>
      <div style={{ width: 52, height: 32, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: on ? T.mintSoft : 'transparent', transition: `background .3s ${T.spring}` }}>
        <Icon name={n.icon} size={23} color={on ? T.mintDk : T.ink3} sw={on ? 2.5 : 2.1} />
      </div>
      <span style={{ fontSize: 10.5, fontWeight: on ? 800 : 600, color: on ? T.ink : T.ink3 }}>{n.l}</span>
    </div>
  );
}

function Phone({ landscape }) {
  const [tab, setTab] = React.useState('home');
  const [sessionDay, setSessionDay] = React.useState(null);
  const [, bump] = React.useReducer((x) => x + 1, 0);

  React.useEffect(() => subscribeProgram(bump), []);
  React.useEffect(() => subscribeProfile(bump), []);

  const program = getProgramById(getProgramId());
  const tIdx = todayIndex();
  const todayDay = withOverride(dayForSlot(program, tIdx));
  const nutritionGoal = computeNutritionGoal(getProfile());

  // Charge la séance avec exercices personnalisés + poids adaptés au profil.
  const openSession = (day) => { if (day) { setSessionDay(adaptDay(withOverride(day))); } };

  const screen = () => {
    switch (tab) {
      case 'home': return <HomeScreen user="Brick" today={todayDay} nutritionGoal={nutritionGoal}
        nav={setTab} openToday={() => openSession(todayDay)} goProgram={() => setTab('program')} />;
      case 'program': return <ProgramScreen openSession={openSession} />;
      case 'nutrition': return <NutritionScreen goal={nutritionGoal} />;
      case 'progress': return <ProgressScreen />;
      default: return null;
    }
  };

  const session = sessionDay && (
    <SessionScreen today={sessionDay} onClose={() => setSessionDay(null)}
      onFinish={(dest) => { setSessionDay(null); if (dest === 'progress') setTab('progress'); }} />
  );

  // ── Landscape : nav latérale gauche + contenu centré ──
  if (landscape) {
    return (
      <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'row', background: T.bg, fontFamily: T.font }}>
        <div style={{
          flexShrink: 0, width: 92, background: '#fff', borderRight: '1px solid ' + T.line, boxShadow: T.shadow,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
          paddingLeft: 'env(safe-area-inset-left)',
          paddingTop: 'calc(10px + env(safe-area-inset-top))', paddingBottom: 'calc(10px + env(safe-area-inset-bottom))',
        }}>
          {NAV.map((n) => <NavItem key={n.k} n={n} on={tab === n.k} onClick={() => setTab(n.k)} vertical />)}
        </div>
        <div key={tab} className="app-scroll" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingTop: 'env(safe-area-inset-top)' }}>
          <div style={{ maxWidth: 640, margin: '0 auto' }}>{screen()}</div>
        </div>
        {session}
        <Chat landscape />
      </div>
    );
  }

  // ── Portrait : nav en bas ──
  return (
    <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', background: T.bg, fontFamily: T.font }}>
      <div key={tab} className="app-scroll" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingTop: 'env(safe-area-inset-top)' }}>
        {screen()}
      </div>
      <div style={{ flexShrink: 0, background: '#fff', boxShadow: T.shadowUp, padding: '8px 12px calc(10px + env(safe-area-inset-bottom))', display: 'flex', justifyContent: 'space-around', borderTop: '1px solid ' + T.line }}>
        {NAV.map((n) => <NavItem key={n.k} n={n} on={tab === n.k} onClick={() => setTab(n.k)} />)}
      </div>
      {session}
      <Chat landscape={false} />
    </div>
  );
}

export default function App() {
  const landscape = useLandscape();
  return (
    // Portrait : colonne format téléphone. Paysage : pleine largeur (max 1024) centrée.
    <div style={{
      position: 'relative', width: '100%', maxWidth: landscape ? 1024 : 480, height: '100%',
      background: T.bg, overflow: 'hidden', boxShadow: '0 0 60px rgba(14,26,20,.10)',
    }}>
      <Phone landscape={landscape} />
    </div>
  );
}
