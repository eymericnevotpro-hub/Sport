/* screens/Home.jsx */
import { T, Icon, Ring, MacroBar, SectionTitle } from '../theme.jsx';
import { ImageSlot } from '../ImageSlot.jsx';
import { durationOf, todayIndex, WEEKDAYS } from '../programs.js';
import { getProfile, measuresDue, photoDue } from '../profileStore.js';

function todayLabel() {
  try {
    const s = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    return s.charAt(0).toUpperCase() + s.slice(1);
  } catch { return ''; }
}

export function HomeScreen({ nav, openToday, goProgram, today, nutritionGoal, user }) {
  const tIdx = todayIndex();
  const week = WEEKDAYS.map((d, i) => ({ d: d[0], v: 0, on: false, today: i === tIdx }));
  const profile = getProfile();
  const remMeasures = measuresDue(14);
  const remPhoto = photoDue(30);

  return (
    <div style={{ padding: '6px 18px 12px', animation: 'fadeIn .4s .04s forwards' }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 2px 18px' }}>
        <div style={{ width: 46, height: 46, borderRadius: 16, overflow: 'hidden', flexShrink: 0, boxShadow: T.shadow }}>
          <ImageSlot id="home-avatar" shape="rounded" radius={16} style={{ width: 46, height: 46 }} placeholder="Photo" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: T.ink3 }}>{todayLabel()}</div>
          <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: -0.4, lineHeight: 1.1 }}>Salut {user} 👋</div>
        </div>
        <div className="presslite" style={{ position: 'relative', width: 44, height: 44, borderRadius: 14, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: T.shadow }}>
          <Icon name="bell" size={21} color={T.ink} sw={2} />
        </div>
      </div>

      {/* Rappels */}
      {(remPhoto || remMeasures) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          {remPhoto && (
            <ReminderCard icon="camera" accent={T.indigo} soft={T.indigoSoft}
              title="Photo du mois" text="Prends ta photo de face pour suivre ton évolution."
              onClick={() => nav('progress')} />
          )}
          {remMeasures && (
            <ReminderCard icon="target" accent={T.amber} soft={T.amberSoft}
              title="Mets à jour tes mensurations" text="Poids & mensurations : c'est le moment de les relever."
              onClick={() => nav('progress')} />
          )}
        </div>
      )}

      {/* Hero — séance du jour (ou repos) */}
      {today ? (
        <div className="press" onClick={openToday} style={{ position: 'relative', borderRadius: 30, background: 'linear-gradient(150deg, #142019 0%, #0E1A14 60%)', color: '#fff', padding: '20px 20px 22px', overflow: 'hidden', boxShadow: T.pop, cursor: 'pointer', animation: 'slideUp .5s .04s forwards' }}>
          <div style={{ position: 'absolute', right: -40, top: -40, width: 160, height: 160, borderRadius: 999, background: 'radial-gradient(circle, rgba(22,224,160,.30), transparent 70%)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 999, background: 'rgba(22,224,160,.16)', color: T.mint, fontSize: 11.5, fontWeight: 800, letterSpacing: .3, textTransform: 'uppercase' }}>
              <Icon name="bolt" size={13} sw={2.6} /> Séance du jour
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.6, lineHeight: 1.05 }}>{today.title}</div>
              <div style={{ display: 'flex', gap: 14, marginTop: 12, color: 'rgba(255,255,255,.78)', fontSize: 13, fontWeight: 600 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="dumbbell" size={16} sw={2.2} color={T.mint}/>{today.exercises.length} exos</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="clock" size={16} sw={2.2} color={T.mint}/>{durationOf(today)} min</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="flame" size={16} sw={2.2} color={T.mint}/>~{today.kcal} kcal</span>
              </div>
            </div>
            <div className="presslite" style={{ width: 60, height: 60, borderRadius: 999, background: T.mint, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: T.glow }}>
              <Icon name="play" size={28} color="#08231A" />
            </div>
          </div>
        </div>
      ) : (
        <div className="press" onClick={goProgram} style={{ position: 'relative', borderRadius: 30, background: 'linear-gradient(150deg, #142019 0%, #0E1A14 60%)', color: '#fff', padding: '22px 20px', overflow: 'hidden', boxShadow: T.pop, cursor: 'pointer', animation: 'slideUp .5s .04s forwards' }}>
          <div style={{ position: 'absolute', right: -40, top: -40, width: 160, height: 160, borderRadius: 999, background: 'radial-gradient(circle, rgba(110,123,255,.30), transparent 70%)' }} />
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 999, background: 'rgba(110,123,255,.18)', color: '#AEB6FF', fontSize: 11.5, fontWeight: 800, letterSpacing: .3, textTransform: 'uppercase' }}>
            <Icon name="moon" size={13} sw={2.4} /> Repos
          </span>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, marginTop: 12 }}>Jour de repos 💤</div>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: 'rgba(255,255,255,.72)', marginTop: 6 }}>Profites-en pour récupérer — ou consulte ton programme.</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 14, fontSize: 13.5, fontWeight: 800, color: T.mint }}>Voir mon programme <Icon name="chevR" size={16} color={T.mint} sw={2.6} /></div>
        </div>
      )}

      {/* objectifs du jour (à configurer — démarrent à 0) */}
      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        <GoalCard icon="dumbbell" color={T.mint} soft={T.mintSoft} value={0} label="Entraînement" big={today ? '0/1' : '—'} />
        <GoalCard icon="flame" color={T.coral} soft={T.coralSoft} value={0} label="Calories" big="0" />
        <GoalCard icon="bolt" color={T.amber} soft={T.amberSoft} value={0} label="Activité" big="0%" />
      </div>

      {/* Nutrition snapshot */}
      <div style={{ marginTop: 22 }}>
        <SectionTitle action="Détails" onAction={() => nav('nutrition')}>Nutrition</SectionTitle>
        <div onClick={() => nav('nutrition')} className="press" style={{ background: '#fff', borderRadius: T.rCard, padding: 18, boxShadow: T.shadow, display: 'flex', alignItems: 'center', gap: 18, cursor: 'pointer' }}>
          <Ring size={88} stroke={10} value={0} color={T.mint} glow>
            <div style={{ fontFamily: T.mono, fontSize: 22, fontWeight: 700, lineHeight: 1 }}>{nutritionGoal.kcalGoal}</div>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: T.ink3, marginTop: 2 }}>kcal restantes</div>
          </Ring>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <MacroBar label="Protéines" value={0} total={nutritionGoal.p} color={T.mint} />
            <MacroBar label="Glucides" value={0} total={nutritionGoal.c} color={T.amber} />
            <MacroBar label="Lipides" value={0} total={nutritionGoal.f} color={T.coral} />
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
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>0 séance <span style={{ fontSize: 14, color: T.mintDk, fontWeight: 700 }}>· 0 t</span></div>
            </div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 999, background: T.amberSoft, color: '#C77A00', fontSize: 13, fontWeight: 800 }}>
              <Icon name="flame" size={16} color="#FF8A00" sw={2.6} />0 j
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 76 }}>
            {week.map((b, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
                <div style={{ width: '100%', height: 56, borderRadius: 10, background: '#F1F4F2', display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
                  <div style={{ width: '100%', height: `${b.v*100}%`, borderRadius: 10, background: b.today ? T.mint : T.ink }} />
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

function ReminderCard({ icon, accent, soft, title, text, onClick }) {
  return (
    <div onClick={onClick} className="press" style={{ display: 'flex', alignItems: 'center', gap: 13, background: '#fff', borderRadius: 20, padding: '13px 15px', boxShadow: T.shadow, cursor: 'pointer', borderLeft: `4px solid ${accent}` }}>
      <div style={{ width: 42, height: 42, borderRadius: 13, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: soft }}>
        <Icon name={icon} size={22} color={accent} sw={2.3} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 800, letterSpacing: -0.2 }}>{title}</div>
        <div style={{ fontSize: 12, fontWeight: 600, color: T.ink3, marginTop: 2, lineHeight: 1.3 }}>{text}</div>
      </div>
      <Icon name="chevR" size={19} color={T.ink3} sw={2.4} />
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
