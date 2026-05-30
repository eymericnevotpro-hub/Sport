/* screens/Progress.jsx — photo tracking + editable measurements + real Claude AI analysis */
import React from 'react';
import { T, Icon, Chip, SectionTitle, Sheet } from '../theme.jsx';
import { ImageSlot } from '../ImageSlot.jsx';
import { getPhoto, subscribe } from '../photoStore.js';
import {
  getProfile, subscribeProfile, setField, delta, fmt, fmtDelta,
  getBaseline, GOALS, FIELDS, HEIGHT_FIELD,
} from '../profileStore.js';
import { getProgramId } from '../programStore.js';
import { getProgramById } from '../programs.js';

const DEFAULT_CHANGES = [
  { type: 'add', title: 'Soulevé de terre roumain', sub: 'Ajouté · Jeudi jambes · 4 × 10' },
  { type: 'add', title: '2ᵉ séance jambes / semaine', sub: 'Ajouté · Dimanche' },
  { type: 'up', title: 'Développé couché', sub: 'Charge +2,5 kg · progression détectée' },
  { type: 'down', title: 'Volume biceps', sub: '−1 série · récupération' },
];

const NOW_IDS = [
  { id: 'cmp-now-face', label: 'face (actuelle)' },
  { id: 'cmp-now-side', label: 'côté (actuelle)' },
  { id: 'cmp-now-back', label: 'dos (actuelle)' },
];
const BEFORE_IDS = [
  { id: 'cmp-before-face', label: 'face (avant)' },
  { id: 'cmp-before-side', label: 'côté (avant)' },
  { id: 'cmp-before-back', label: 'dos (avant)' },
];

export function ProgressScreen() {
  const [tab, setTab] = React.useState('photos');
  const [angle, setAngle] = React.useState('face');
  const [aiOpen, setAiOpen] = React.useState(false);
  const [editor, setEditor] = React.useState(false);
  const [toast, setToast] = React.useState(false);
  const [, bump] = React.useReducer((x) => x + 1, 0);

  const [ai, setAi] = React.useState({ status: 'idle', summary: null, changes: DEFAULT_CHANGES, error: null });

  React.useEffect(() => subscribe(bump), []);
  React.useEffect(() => subscribeProfile(bump), []);

  const p = getProfile();
  const angles = [{ k: 'face', l: 'Face' }, { k: 'side', l: 'Côté' }, { k: 'back', l: 'Dos' }];

  const runAnalysis = async () => {
    const photos = [];
    for (const { id, label } of [...NOW_IDS, ...BEFORE_IDS]) {
      const url = getPhoto(id);
      if (url) photos.push({ label, dataUrl: url });
    }
    if (!photos.length) {
      setAi((a) => ({ ...a, status: 'error', error: 'Ajoute au moins une photo de progression ci-dessous, puis relance l’analyse.' }));
      return;
    }
    setAi((a) => ({ ...a, status: 'loading', error: null }));
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photos,
          context: {
            name: p.name,
            sex: p.sex,
            goal: p.goal,
            heightCm: p.height,
            weightKg: p.weight,
            weightDeltaKg: delta('weight'),
            weeks: 5,
            measurements_cm: { poitrine: p.poitrine, tour_de_bras: p.bras, tour_de_taille: p.taille, cuisse: p.cuisse },
            measurement_deltas_cm: { poitrine: delta('poitrine'), tour_de_bras: delta('bras'), taille: delta('taille'), cuisse: delta('cuisse') },
            program: (() => { const pr = getProgramById(getProgramId()); return `${pr.name} (${pr.sub})`; })(),
          },
        }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Analyse indisponible');
      const data = await res.json();
      setAi({
        status: 'done',
        summary: data.summary || null,
        changes: Array.isArray(data.changes) && data.changes.length ? data.changes : DEFAULT_CHANGES,
        error: null,
      });
    } catch (e) {
      setAi((a) => ({ ...a, status: 'error', error: e.message || 'Analyse indisponible' }));
    }
  };

  return (
    <div style={{ padding: '6px 18px 12px', animation: 'fadeIn .4s .04s forwards' }}>
      <div style={{ padding: '10px 2px 16px' }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: T.ink3, letterSpacing: .3, textTransform: 'uppercase' }}>Mon évolution</div>
        <h1 style={{ margin: '3px 0 0', fontSize: 26, fontWeight: 800, letterSpacing: -0.7 }}>Progrès</h1>
      </div>

      {/* segment */}
      <div style={{ display: 'flex', gap: 5, background: '#E9EEEB', borderRadius: 999, padding: 5, marginBottom: 18 }}>
        {[['photos', 'Photos'], ['stats', 'Statistiques']].map(([k, l]) => (
          <div key={k} onClick={() => setTab(k)} className="presslite" style={{ flex: 1, textAlign: 'center', padding: '10px', borderRadius: 999, fontSize: 14, fontWeight: 800, cursor: 'pointer',
            background: tab === k ? '#fff' : 'transparent', color: tab === k ? T.ink : T.ink3, boxShadow: tab === k ? T.shadow : 'none' }}>{l}</div>
        ))}
      </div>

      {tab === 'photos' ? (
        <>
          {/* AI analysis */}
          <div style={{ background: 'linear-gradient(150deg,#1B2233,#0E1320)', borderRadius: T.rCard, padding: 20, color: '#fff', position: 'relative', overflow: 'hidden', boxShadow: T.pop }}>
            <div style={{ position: 'absolute', right: -36, top: -36, width: 150, height: 150, borderRadius: 999, background: 'radial-gradient(circle, rgba(110,123,255,.4), transparent 70%)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 13 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 11px', borderRadius: 999, background: 'rgba(110,123,255,.2)', color: '#B6BCFF', fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: .4 }}>
                <Icon name="sparkle" size={14} sw={2.4}/> Analyse IA
              </span>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: 'rgba(255,255,255,.45)' }}>
                {ai.status === 'done' ? 'à l’instant' : 'Claude Vision'}
              </span>
            </div>

            {ai.status === 'loading' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0 2px' }}>
                <span style={{ width: 20, height: 20, borderRadius: 999, border: '2.5px solid rgba(255,255,255,.25)', borderTopColor: T.mint, display: 'inline-block', animation: 'spin .8s linear infinite' }} />
                <span style={{ fontSize: 14.5, fontWeight: 700, color: 'rgba(255,255,255,.9)' }}>Claude analyse tes photos…</span>
              </div>
            ) : ai.summary ? (
              <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.5, fontWeight: 600, color: 'rgba(255,255,255,.92)' }}>{ai.summary}</p>
            ) : (
              <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.5, fontWeight: 600, color: 'rgba(255,255,255,.92)' }}>
                Ajoute tes photos face · côté · dos et renseigne tes mensurations, puis lance l'analyse : Claude évalue ton évolution et adapte ton programme.
              </p>
            )}

            {ai.error && (
              <p style={{ margin: '12px 0 0', fontSize: 13, fontWeight: 700, color: '#FFB7C2' }}>{ai.error}</p>
            )}

            {/* mensurations entry point — relie les mensurations au programme */}
            <div onClick={() => setEditor(true)} className="presslite" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, padding: '10px 12px', borderRadius: 14, background: 'rgba(255,255,255,.08)', cursor: 'pointer' }}>
              <Icon name="target" size={17} color="#B6BCFF" sw={2.3} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 800 }}>{p.goal} · {fmt(p.weight)} kg</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.55)' }}>Mensurations utilisées pour adapter le programme</div>
              </div>
              <Icon name="chevR" size={16} color="rgba(255,255,255,.6)" sw={2.4} />
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              <button onClick={runAnalysis} disabled={ai.status === 'loading'} className="press" style={{ flex: 1, border: 'none', cursor: ai.status === 'loading' ? 'default' : 'pointer', padding: '14px', borderRadius: 999, background: ai.status === 'loading' ? 'rgba(255,255,255,.14)' : T.mint, color: ai.status === 'loading' ? 'rgba(255,255,255,.7)' : '#08231A', fontSize: 14.5, fontWeight: 800, fontFamily: T.font, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Icon name="sparkle" size={17} color={ai.status === 'loading' ? 'rgba(255,255,255,.7)' : '#08231A'} sw={2.4}/>
                {ai.status === 'done' ? 'Relancer l’analyse' : ai.status === 'loading' ? 'Analyse…' : 'Lancer l’analyse IA'}
              </button>
              {ai.status === 'done' && (
                <button onClick={() => setAiOpen(true)} className="press" style={{ border: 'none', cursor: 'pointer', padding: '14px 16px', borderRadius: 999, background: 'rgba(255,255,255,.12)', color: '#fff', fontSize: 14.5, fontWeight: 800, fontFamily: T.font, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  Programme <Icon name="chevR" size={17} color="#fff" sw={2.6}/>
                </button>
              )}
            </div>
          </div>

          {/* comparison */}
          <div style={{ marginTop: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, letterSpacing: -0.4 }}>Comparaison</h2>
              <div style={{ display: 'flex', gap: 4, background: '#E9EEEB', borderRadius: 999, padding: 4 }}>
                {angles.map(a => (
                  <div key={a.k} onClick={() => setAngle(a.k)} className="presslite" style={{ padding: '6px 13px', borderRadius: 999, fontSize: 12.5, fontWeight: 800, cursor: 'pointer',
                    background: angle === a.k ? T.ink : 'transparent', color: angle === a.k ? '#fff' : T.ink3 }}>{a.l}</div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'stretch' }}>
              <PhotoCol id={'cmp-before-' + angle} date="Avant" weight={getBaseline('weight') ? fmt(getBaseline('weight')) + ' kg' : '—'} tag="Avant" tagBg="#EEF2F0" tagColor={T.ink2} />
              <PhotoCol id={'cmp-now-' + angle} date="Aujourd'hui" weight={p.weight ? fmt(p.weight) + ' kg' : 'à renseigner'} tag="Maintenant" tagBg={T.mintSoft} tagColor={T.mintDk} live />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
              {delta('weight') !== 0 ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 999, background: '#fff', boxShadow: T.shadow, fontSize: 13.5, fontWeight: 800 }}>
                  <Icon name={delta('weight') <= 0 ? 'arrowD' : 'arrowU'} size={16} color={T.mintDk} sw={2.6}/> {fmtDelta(delta('weight'))} kg <span style={{ color: T.ink3, fontWeight: 700 }}>depuis le début</span>
                </span>
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 999, background: '#fff', boxShadow: T.shadow, fontSize: 13, fontWeight: 700, color: T.ink3 }}>
                  <Icon name="info" size={15} color={T.ink3} sw={2.4}/> Renseigne ton poids pour suivre l'évolution
                </span>
              )}
            </div>
          </div>

          {/* timeline */}
          <div style={{ marginTop: 24 }}>
            <SectionTitle action="Tout voir">Historique</SectionTitle>
            <div className="app-scroll" style={{ display: 'flex', gap: 10, overflowX: 'auto', margin: '0 -18px', padding: '0 18px 4px' }}>
              {['Photo 1', 'Photo 2', 'Photo 3', 'Photo 4'].map((d, i) => (
                <div key={i} className="presslite" style={{ flexShrink: 0, width: 92 }}>
                  <div style={{ borderRadius: 16, overflow: 'hidden', background: '#E9EEEB', boxShadow: T.shadow }}>
                    <ImageSlot id={'tl-' + i} shape="rounded" radius={16} style={{ width: 92, height: 116 }} placeholder="+" />
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 800, marginTop: 7 }}>{d}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <StatsTab profile={p} onEdit={() => setEditor(true)} />
      )}

      {/* measurements editor */}
      <MeasureEditor open={editor} onClose={() => setEditor(false)} profile={p} />

      {/* AI program sheet */}
      <Sheet open={aiOpen} onClose={() => setAiOpen(false)} title="Programme ajusté par l'IA">
        <p style={{ margin: '0 2px 16px', fontSize: 13.5, lineHeight: 1.5, color: T.ink2, fontWeight: 600 }}>Basé sur tes photos, ton poids et tes mensurations.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ai.changes.map((ch, i) => <ChangeRow key={i} type={ch.type} title={ch.title} sub={ch.sub} />)}
        </div>
        <button onClick={() => { setAiOpen(false); setToast(true); setTimeout(() => setToast(false), 2600); }} className="press" style={{ width: '100%', marginTop: 18, border: 'none', cursor: 'pointer', padding: '16px', borderRadius: 999, background: T.mint, color: '#08231A', fontSize: 15.5, fontWeight: 800, fontFamily: T.font, boxShadow: T.glow }}>
          Appliquer ce programme
        </button>
      </Sheet>

      {toast && (
        <div style={{ position: 'absolute', bottom: 96, left: 18, right: 18, zIndex: 80, background: T.ink, color: '#fff', borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: T.pop, animation: 'slideUp .4s .04s forwards' }}>
          <Icon name="check" size={20} color={T.mint} sw={3}/>
          <span style={{ fontSize: 14, fontWeight: 700 }}>Nouveau programme appliqué dès lundi</span>
        </div>
      )}
    </div>
  );
}

function PhotoCol({ id, date, weight, tag, tagBg, tagColor, live }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ position: 'relative', borderRadius: 22, overflow: 'hidden', background: '#E9EEEB', boxShadow: T.shadow }}>
        <ImageSlot id={id} shape="rounded" radius={22} style={{ width: '100%', height: 210 }} placeholder={live ? 'Prends ta photo' : 'Dépose la photo'} />
        <span style={{ position: 'absolute', top: 10, left: 10, padding: '5px 10px', borderRadius: 999, background: tagBg, color: tagColor, fontSize: 11, fontWeight: 800, pointerEvents: 'none' }}>{tag}</span>
        {live && <span style={{ position: 'absolute', bottom: 10, right: 10, width: 34, height: 34, borderRadius: 999, background: T.mint, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: T.glow, pointerEvents: 'none' }}><Icon name="camera" size={18} color="#08231A" sw={2.4}/></span>}
      </div>
      <div style={{ marginTop: 9 }}>
        <div style={{ fontSize: 13.5, fontWeight: 800 }}>{date}</div>
        <div style={{ fontSize: 12, fontWeight: 700, color: T.ink3 }}>{weight}</div>
      </div>
    </div>
  );
}

function ChangeRow({ type, title, sub }) {
  const map = {
    add: { icon: 'plus', bg: T.mintSoft, color: T.mintDk },
    up: { icon: 'arrowU', bg: T.amberSoft, color: '#C77A00' },
    down: { icon: 'arrowD', bg: T.indigoSoft, color: T.indigo },
  }[type] || { icon: 'info', bg: T.mintSoft, color: T.mintDk };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 13, background: '#F7F9F8', borderRadius: 18, padding: '13px 14px' }}>
      <div style={{ width: 40, height: 40, borderRadius: 13, background: map.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon name={map.icon} size={20} color={map.color} sw={2.6} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 800, letterSpacing: -0.2 }}>{title}</div>
        <div style={{ fontSize: 12, fontWeight: 600, color: T.ink3, marginTop: 2 }}>{sub}</div>
      </div>
    </div>
  );
}

function StatsTab({ profile, onEdit }) {
  const wd = delta('weight');
  const base = getBaseline('weight');
  return (
    <>
      <div style={{ background: '#fff', borderRadius: T.rCard, padding: 20, boxShadow: T.shadow }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 4 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.ink3 }}>Poids actuel</div>
            <div style={{ fontFamily: T.mono, fontSize: 30, fontWeight: 700, letterSpacing: -0.5 }}>{profile.weight ? fmt(profile.weight) : '—'} <span style={{ fontSize: 16, color: T.ink3 }}>kg</span></div>
          </div>
          {wd !== 0 && <Chip icon={wd <= 0 ? 'arrowD' : 'arrowU'} bg={T.mintSoft} color={T.mintDk}>{fmtDelta(wd)} kg</Chip>}
        </div>
        {profile.weight ? (
          <div style={{ fontSize: 12.5, fontWeight: 600, color: T.ink3, marginTop: 6 }}>
            {base ? <>Départ {fmt(base)} kg · objectif {profile.goal.toLowerCase()}</> : <>Premier relevé enregistré 💪</>}
          </div>
        ) : (
          <div onClick={onEdit} className="presslite" style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', borderRadius: 14, background: '#F7F9F8', cursor: 'pointer' }}>
            <Icon name="plus" size={18} color={T.mintDk} sw={2.6}/>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: T.ink2 }}>Renseigne ton poids pour démarrer ton suivi</span>
          </div>
        )}
      </div>

      <div style={{ marginTop: 22 }}>
        <SectionTitle action="Modifier" onAction={onEdit}>Mensurations</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {FIELDS.map((f) => {
            const d = delta(f.key);
            return <Measure key={f.key} label={f.label} value={profile[f.key] ? fmt(profile[f.key]) : '—'} delta={fmtDelta(d)} showDelta={d !== 0} up={d >= 0} />;
          })}
        </div>
        <button onClick={onEdit} className="press" style={{ width: '100%', marginTop: 14, border: 'none', cursor: 'pointer', padding: '14px', borderRadius: 999, background: T.ink, color: '#fff', fontSize: 14.5, fontWeight: 800, fontFamily: T.font, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Icon name="plus" size={18} color="#fff" sw={2.6}/> Mettre à jour mes mensurations
        </button>
      </div>
    </>
  );
}

function Measure({ label, value, delta: d, up, showDelta }) {
  return (
    <div style={{ background: '#fff', borderRadius: 20, padding: '15px 16px', boxShadow: T.shadow }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: T.ink3 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 5 }}>
        <span style={{ fontFamily: T.mono, fontSize: 23, fontWeight: 700, letterSpacing: -0.5 }}>{value}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: T.ink3 }}>cm</span>
      </div>
      {showDelta && (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, marginTop: 8, fontSize: 12, fontWeight: 800, color: up ? T.mintDk : T.indigo }}>
          <Icon name={up ? 'arrowU' : 'arrowD'} size={14} sw={2.8} /> {d} cm
        </span>
      )}
    </div>
  );
}

function MeasureEditor({ open, onClose, profile }) {
  const rows = [{ key: 'weight', label: 'Poids', unit: 'kg', step: 0.1 }, HEIGHT_FIELD, ...FIELDS];
  return (
    <Sheet open={open} onClose={onClose} title="Mes mensurations">
      <p style={{ margin: '0 2px 14px', fontSize: 13, lineHeight: 1.5, color: T.ink2, fontWeight: 600 }}>
        Tiens-les à jour : l'IA s'en sert pour adapter ton programme.
      </p>

      <div style={{ fontSize: 12, fontWeight: 800, color: T.ink3, textTransform: 'uppercase', letterSpacing: .4, margin: '0 2px 8px' }}>Objectif</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        {GOALS.map((g) => {
          const on = profile.goal === g;
          return (
            <div key={g} onClick={() => setField('goal', g)} className="presslite" style={{ padding: '9px 14px', borderRadius: 999, fontSize: 13, fontWeight: 800, cursor: 'pointer',
              background: on ? T.ink : '#F1F4F2', color: on ? '#fff' : T.ink2 }}>{g}</div>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {rows.map((f) => (
          <NumberRow key={f.key} label={f.label} unit={f.unit} value={profile[f.key]} step={f.step}
            onChange={(v) => setField(f.key, Math.max(0, Math.round(v * 10) / 10))} />
        ))}
      </div>

      <button onClick={onClose} className="press" style={{ width: '100%', marginTop: 18, border: 'none', cursor: 'pointer', padding: '16px', borderRadius: 999, background: T.mint, color: '#08231A', fontSize: 15.5, fontWeight: 800, fontFamily: T.font, boxShadow: T.glow }}>
        Enregistrer
      </button>
    </Sheet>
  );
}

function NumberRow({ label, unit, value, step, onChange }) {
  // Local text so the field can be typed freely (partial values, commas) — the
  // store is updated as you type, but we only re-sync the text from `value`
  // while the input is NOT focused, so typing isn't clobbered.
  const [text, setText] = React.useState(fmt(value));
  const [focused, setFocused] = React.useState(false);
  React.useEffect(() => { if (!focused) setText(fmt(value)); }, [value, focused]);

  const commit = (raw) => {
    const n = parseFloat(String(raw).replace(',', '.'));
    if (!Number.isNaN(n)) onChange(Math.max(0, Math.round(n * 10) / 10));
  };

  const btn = (icon, fn) => (
    <div onClick={fn} className="presslite" style={{ width: 38, height: 38, borderRadius: 12, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: T.shadow, flexShrink: 0 }}>
      <Icon name={icon} size={19} color={T.ink} sw={2.6} />
    </div>
  );

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#F7F9F8', borderRadius: 16, padding: '10px 12px' }}>
      <span style={{ flex: 1, fontSize: 14.5, fontWeight: 700, color: T.ink, minWidth: 0 }}>{label}</span>
      {btn('minus', () => onChange(Math.max(0, Math.round((value - step) * 10) / 10)))}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, justifyContent: 'center' }}>
        <input
          type="text"
          inputMode="decimal"
          value={text}
          onFocus={(e) => { setFocused(true); e.target.select(); }}
          onBlur={() => { commit(text); setFocused(false); }}
          onChange={(e) => { setText(e.target.value); commit(e.target.value); }}
          onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
          style={{ width: 52, border: 'none', background: 'transparent', textAlign: 'right', fontFamily: T.mono, fontSize: 20, fontWeight: 700, color: T.ink, outline: 'none', padding: 0 }}
        />
        <span style={{ fontSize: 12, color: T.ink3, fontWeight: 700 }}>{unit}</span>
      </div>
      {btn('plus', () => onChange(Math.round((value + step) * 10) / 10))}
    </div>
  );
}
