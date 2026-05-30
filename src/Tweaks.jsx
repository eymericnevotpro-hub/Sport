/* Tweaks.jsx — floating accent/motion panel (production-friendly trigger) */
import React from 'react';
import { ACCENTS, applyAccent, Icon } from './theme.jsx';

export function Tweaks({ accent, setAccent, reduceMotion, setReduceMotion }) {
  const [open, setOpen] = React.useState(false);
  const swatches = Object.keys(ACCENTS);

  return (
    <>
      {/* trigger */}
      <button onClick={() => setOpen((o) => !o)} aria-label="Réglages"
        style={{
          position: 'fixed', right: 16, bottom: 16, zIndex: 2147483646,
          width: 44, height: 44, borderRadius: 14, border: 'none', cursor: 'pointer',
          background: 'rgba(20,32,25,.9)', color: '#fff', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(0,0,0,.28)', backdropFilter: 'blur(8px)',
        }}>
        <Icon name="settings" size={22} color="#fff" sw={2.1} />
      </button>

      {open && (
        <div style={{
          position: 'fixed', right: 16, bottom: 70, zIndex: 2147483646, width: 240,
          background: 'rgba(250,252,251,.92)', color: '#16231C', borderRadius: 16,
          border: '.5px solid rgba(255,255,255,.6)', padding: '14px 16px 16px',
          boxShadow: '0 14px 44px rgba(0,0,0,.22)', backdropFilter: 'blur(20px) saturate(160%)',
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <b style={{ fontSize: 13, fontWeight: 800 }}>Réglages</b>
            <span onClick={() => setOpen(false)} style={{ cursor: 'pointer', color: 'rgba(0,0,0,.45)', fontSize: 14 }}>✕</span>
          </div>

          <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: .6, textTransform: 'uppercase', color: 'rgba(0,0,0,.4)', marginBottom: 8 }}>Couleur d'accent</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {swatches.map((hex) => {
              const on = accent === hex;
              return (
                <button key={hex} onClick={() => { applyAccent(hex); setAccent(hex); }} aria-label={hex}
                  style={{
                    flex: 1, height: 38, borderRadius: 10, cursor: 'pointer', position: 'relative',
                    border: 'none', background: ACCENTS[hex].mint,
                    boxShadow: on ? '0 0 0 2.5px rgba(0,0,0,.82)' : '0 0 0 .5px rgba(0,0,0,.12)',
                  }}>
                  {on && (
                    <svg viewBox="0 0 14 14" width="14" height="14" style={{ position: 'absolute', top: 4, left: 4 }}>
                      <path d="M3 7.2 5.8 10 11 4.2" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" stroke="rgba(0,0,0,.78)" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: 'rgba(0,0,0,.7)' }}>Réduire les animations</span>
            <button onClick={() => setReduceMotion(!reduceMotion)} role="switch" aria-checked={reduceMotion}
              style={{ position: 'relative', width: 38, height: 22, borderRadius: 999, border: 'none', cursor: 'pointer', background: reduceMotion ? '#34c759' : 'rgba(0,0,0,.18)', transition: 'background .15s' }}>
              <i style={{ position: 'absolute', top: 2, left: 2, width: 18, height: 18, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,.25)', transition: 'transform .15s', transform: reduceMotion ? 'translateX(16px)' : 'none' }} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
