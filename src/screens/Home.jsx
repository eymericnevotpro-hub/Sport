/* screens/Home.jsx */
import { T, Icon, Ring, MacroBar, SectionTitle } from '../theme.jsx';
import { ImageSlot } from '../ImageSlot.jsx';

export function HomeScreen({ nav, openSession, today, nutrition, streak, user }) {
  const kcalPct = nutrition.kcal / nutrition.kcalGoal;
  const week = [
    { d: 'L', v: 0.9, on: true }, { d: 'M', v: 0.5, on: true }, { d: 'M', v: 1.0, on: true },
    { d: 'J', v: 0.0, on: false }, { d: 'V', v: 0.7, on: true }, { d: 'S', v: 0.35, on: true, today: true }, { d: 'D', v: 0, on: false },
  ];
  return (
    <div style={{ padding: '6px 18px 12px', animation: 'fadeIn .4s .04s forwards' }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 2px 18px' }}>
        <div style={{ width: 46, height: 46, borderRadius: 16, overflow: 'hidden', flexShrink: 0, boxShadow: T.shadow }}>
          <ImageSlot id="home-avatar" shape="rounded" radius={16} style={{ width: 46, height: 46 }} placeholder="Photo" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: T.ink3 }}>Samedi 30 mai</div>
          <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: -0.4, lineHeight: 1.1 }}>Salut {user} 👋</div>
        </div>
        <div className="presslite" style={{ position: 'relative', width: 44, height: 44, borderRadius: 14, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: T.shadow }}>
          <Icon name="bell" size={21} color={T.ink} sw={2} />
          <span style={{ position: 'absolute', marginLeft: 18, marginTop: -16, width: 8, height: 8, borderRadius: 999, background: T.coral, border: '2px solid #fff' }} />
        </div>
      </div>

      {/* Hero — séance du jour */}
      <div className="press" onClick={openSession} style={{ position: 'relative', borderRadius: 30, background: 'linear-gradient(150deg, #142019 0%, #0E1A14 60%)', color: '#fff', padding: '20px 20px 22px', overflow: 'hidden', boxShadow: T.pop, cursor: 'pointer', animation: 'slideUp .5s .04s forwards' }}>
        <div style={{ position: 'absolute', right: -40, top: -40, width: 160, height: 160, borderRadius: 999, background: 'radial-gradient(circle, rgba(22,224,160,.30), transparent 70%)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 999, background: 'rgba(22,224,160,.16)', color: T.mint, fontSize: 11.5, fontWeight: 800, letterSpacing: .3, textTransform: 'uppercase' }}>
            <Icon name="bolt" size={13} sw={2.6} /> Séance du jour
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 25, fontWeight: 800, letterSpacing: -0.6, lineHeight: 1.05 }}>{today.title}</div>
            <div style={{ display: 'flex', gap: 14, marginTop: 12, color: 'rgba(255,255,255,.78)', fontSize: 13, fontWeight: 600 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="dumbbell" size={16} sw={2.2} color={T.mint}/>{today.exercises.length} exos</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="clock" size={16} sw={2.2} color={T.mint}/>{today.duration} min</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="flame" size={16} sw={2.2} color={T.mint}/>~{today.kcal} kcal</span>
            </div>
          </div>
          <div className="presslite" style={{ width: 60, height: 60, borderRadius: 999, background: T.mint, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: T.glow }}>
            <Icon name="play" size={28} color="#08231A" />
          </div>
        </div>
      </div>

      {/* objectifs du jour */}
      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        <GoalCard icon="dumbbell" color={T.mint} soft={T.mintSoft} value={0.16} label="Entraînement" big="1/1" sub="à faire" />
        <GoalCard icon="flame" color={T.coral} soft={T.coralSoft} value={0.62} label="Calories" big="430" sub="brûlées" />
        <GoalCard icon="bolt" color={T.amber} soft={T.amberSoft} value={0.78} label="Activité" big="78%" sub="objectif" />
      </div>

      {/* Nutrition snapshot */}
      <div style={{ marginTop: 22 }}>
        <SectionTitle action="Détails" onAction={() => nav('nutrition')}>Nutrition</SectionTitle>
        <div onClick={() => nav('nutrition')} className="press" style={{ background: '#fff', borderRadius: T.rCard, padding: 18, boxShadow: T.shadow, display: 'flex', alignItems: 'center', gap: 18, cursor: 'pointer' }}>
          <Ring size={88} stroke={10} value={kcalPct} color={T.mint} glow>
            <div style={{ fontFamily: T.mono, fontSize: 22, fontWeight: 700, lineHeight: 1 }}>{(nutrition.kcalGoal - nutrition.kcal)}</div>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: T.ink3, marginTop: 2 }}>kcal restantes</div>
          </Ring>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <MacroBar label="Protéines" value={nutrition.p} total={nutrition.pGoal} color={T.mint} />
            <MacroBar label="Glucides" value={nutrition.c} total={nutrition.cGoal} color={T.amber} />
            <MacroBar label="Lipides" value={nutrition.f} total={nutrition.fGoal} color={T.coral} />
          </div>
        </div>
      </div>

      {/* Cette semaine */}
      <div style={{ marginTop: 22 }}>
        <SectionTitle action="Stats" onAction={() => nav('progress')}>Cette semaine</SectionTitle>
        <div style={{ background: '#fff', borderRadius: T.rCard, padding: '18px 16px 14px', boxShadow: T.shadow }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.ink3 }}>Volume total</div>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>4 séances <span style={{ fontSize: 14, color: T.mintDk, fontWeight: 700 }}>· 12,4 t</span></div>
            </div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 999, background: T.amberSoft, color: '#C77A00', fontSize: 13, fontWeight: 800 }}>
              <span style={{ display: 'inline-block', animation: 'flameFlick 1.4s ease-in-out infinite' }}><Icon name="flame" size={16} color="#FF8A00" sw={2.6} /></span>{streak} j
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 76 }}>
            {week.map((b, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
                <div style={{ width: '100%', height: 56, borderRadius: 10, background: '#F1F4F2', display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
                  <div style={{ width: '100%', height: `${b.v*100}%`, borderRadius: 10, background: b.today ? T.mint : (b.on ? T.ink : 'transparent'), transition: `height .8s ${T.spring}`, transitionDelay: `${i*0.05}s` }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: b.today ? T.mintDk : T.ink3 }}>{b.d}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function GoalCard({ icon, color, soft, value, label, big }) {
  return (
    <div className="presslite" style={{ flex: 1, background: '#fff', borderRadius: 22, padding: '14px 12px', boxShadow: T.shadow, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <Ring size={52} stroke={6} value={value} color={color} track={soft} anim={false}>
        <Icon name={icon} size={20} color={color} sw={2.4} />
      </Ring>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: -0.4, lineHeight: 1 }}>{big}</div>
        <div style={{ fontSize: 10.5, fontWeight: 700, color: T.ink3, marginTop: 3 }}>{label}</div>
      </div>
    </div>
  );
}
