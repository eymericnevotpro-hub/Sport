/* theme.jsx — tokens, icons, shared primitives (ES module) */

export const T = {
  ink:   '#0E1A14',
  ink2:  '#5E6E66',
  ink3:  '#94A39B',
  line:  '#E8EDEA',
  bg:    '#F3F6F4',
  card:  '#FFFFFF',
  mint:  '#16E0A0',
  mintDk:'#06B27C',
  mintSoft:'#DEFBEF',
  amber: '#FFB020',
  amberSoft:'#FFF1D6',
  coral: '#FF5A7A',
  coralSoft:'#FFE1E8',
  indigo:'#6E7BFF',
  indigoSoft:'#E6E8FF',
  shadow:  '0 6px 22px rgba(14,26,20,0.07)',
  shadowUp:'0 -8px 30px rgba(14,26,20,0.08)',
  pop:     '0 16px 34px rgba(14,26,20,0.16)',
  glow:    '0 12px 26px rgba(22,224,160,0.40)',
  rCard: 28, rPill: 999, rChip: 16,
  font: "'Plus Jakarta Sans', system-ui, sans-serif",
  mono: "'Space Grotesk', system-ui, sans-serif",
  spring: 'cubic-bezier(.34,1.56,.64,1)',
};

// ── Icon set (stroke, 24 grid) ───────────────────────────────
export function Icon({ name, size = 24, color = 'currentColor', sw = 2.2, fill = 'none', style }) {
  const p = { fill: 'none', stroke: color, strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const paths = {
    home: <><path {...p} d="M4 11.5 12 5l8 6.5"/><path {...p} d="M6 10v9h12v-9"/></>,
    dumbbell: <><path {...p} d="M3 9v6M6 7v10M18 7v10M21 9v6M6 12h12"/></>,
    fork: <><path {...p} d="M7 3v7a2 2 0 0 0 2 2 2 2 0 0 0 2-2V3M9 12v9M17 3c-1.5 0-2.5 2-2.5 5s1 4 2.5 4M17 3v18"/></>,
    chart: <><path {...p} d="M5 19V11M12 19V5M19 19v-6"/></>,
    play: <path fill={color} stroke="none" d="M8 5.5v13l11-6.5-11-6.5Z"/>,
    pause: <><rect x="7" y="6" width="3.2" height="12" rx="1.2" fill={color} stroke="none"/><rect x="14" y="6" width="3.2" height="12" rx="1.2" fill={color} stroke="none"/></>,
    check: <path {...p} d="M5 12.5 10 17l9-10"/>,
    plus: <><path {...p} d="M12 5v14M5 12h14"/></>,
    minus: <path {...p} d="M5 12h14"/>,
    x: <path {...p} d="M6 6l12 12M18 6 6 18"/>,
    flame: <path {...p} d="M12 3c.5 3-2 4-2 7a2 2 0 1 0 4 0c0 0 1 1 1 2.5A4.5 4.5 0 1 1 8 14.5C8 9 12 8 12 3Z"/>,
    clock: <><circle {...p} cx="12" cy="12" r="8"/><path {...p} d="M12 8v4l3 2"/></>,
    chevR: <path {...p} d="M9 6l6 6-6 6"/>,
    chevL: <path {...p} d="M15 6l-6 6 6 6"/>,
    chevD: <path {...p} d="M6 9l6 6 6-6"/>,
    bolt: <path {...p} d="M13 3 5 13h6l-1 8 8-10h-6l1-8Z"/>,
    drop: <path {...p} d="M12 3c4 5 6 7.5 6 10.5A6 6 0 1 1 6 13.5C6 10.5 8 8 12 3Z"/>,
    arrowU: <><path {...p} d="M12 19V5M6 11l6-6 6 6"/></>,
    arrowD: <><path {...p} d="M12 5v14M6 13l6 6 6-6"/></>,
    sparkle: <><path {...p} d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6L12 4Z"/><path {...p} d="M18.5 4.5l.5 1.5.5-1.5M5 17l.6 1.8L7.4 19"/></>,
    camera: <><path {...p} d="M4 8.5h3l1.5-2h7L17 8.5h3v10H4v-10Z"/><circle {...p} cx="12" cy="13" r="3"/></>,
    skip: <><path {...p} d="M6 6l8 6-8 6V6Z"/><path {...p} d="M18 6v12"/></>,
    bell: <><path {...p} d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2H4.5L6 16Z"/><path {...p} d="M10 20a2 2 0 0 0 4 0"/></>,
    timer: <><circle {...p} cx="12" cy="13" r="7"/><path {...p} d="M12 13V9M9 3h6"/></>,
    weight: <><path {...p} d="M7 9h10l1.5 9.5h-13L7 9Z"/><path {...p} d="M9.5 9a2.5 2.5 0 1 1 5 0"/></>,
    target: <><circle {...p} cx="12" cy="12" r="8"/><circle {...p} cx="12" cy="12" r="3.4"/></>,
    grid: <><rect {...p} x="4" y="4" width="7" height="7" rx="2"/><rect {...p} x="13" y="4" width="7" height="7" rx="2"/><rect {...p} x="4" y="13" width="7" height="7" rx="2"/><rect {...p} x="13" y="13" width="7" height="7" rx="2"/></>,
    info: <><circle {...p} cx="12" cy="12" r="8"/><path {...p} d="M12 11v5M12 8h.01"/></>,
    moon: <path {...p} d="M20 14.5A8 8 0 1 1 9.5 4 6.5 6.5 0 0 0 20 14.5Z"/>,
    settings: <><circle {...p} cx="12" cy="12" r="3"/><path {...p} d="M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1M18.7 18.7l-2.1-2.1M7.4 7.4 5.3 5.3"/></>,
    chat: <><path {...p} d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-4 4v-4H6"/><path {...p} d="M8 9h8M8 12h5"/></>,
    send: <path {...p} d="M4 12 20 4l-6 16-3-7-7-1Z"/>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block', flexShrink: 0, ...style }}>
      {paths[name] || null}
    </svg>
  );
}

// ── Progress ring ────────────────────────────────────────────
export function Ring({ size = 84, stroke = 9, value = 0.5, color = T.mint, track = '#EEF2F0', children, glow = false, anim = true }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - Math.max(0, Math.min(1, value)));
  return (
    <div style={{ position: 'relative', width: size, height: size, animation: anim ? 'popIn .5s .04s forwards' : 'none' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', filter: glow ? `drop-shadow(0 4px 10px ${color}66)` : 'none' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
          style={{ transition: `stroke-dashoffset .9s ${T.spring}` }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </div>
    </div>
  );
}

// ── Macro bar ────────────────────────────────────────────────
export function MacroBar({ label, value, total, color, unit = 'g' }) {
  const pct = Math.max(0, Math.min(1, value / total));
  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: T.ink2 }}>{label}</span>
        <span style={{ fontSize: 11.5, fontWeight: 600, color: T.ink3 }}>{value}<span style={{ opacity: .6 }}>/{total}{unit}</span></span>
      </div>
      <div style={{ height: 8, borderRadius: 999, background: '#EEF2F0', overflow: 'hidden' }}>
        <div style={{ width: `${pct*100}%`, height: '100%', borderRadius: 999, background: color, transition: `width .9s ${T.spring}` }} />
      </div>
    </div>
  );
}

// ── Pill / chip ──────────────────────────────────────────────
export function Chip({ children, bg = T.mintSoft, color = T.mintDk, icon, style }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 11px',
      borderRadius: 999, background: bg, color, fontSize: 12.5, fontWeight: 700, ...style }}>
      {icon && <Icon name={icon} size={14} sw={2.6} />}{children}
    </span>
  );
}

// ── Section header ───────────────────────────────────────────
export function SectionTitle({ children, action, onAction }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '4px 2px 12px' }}>
      <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, letterSpacing: -0.4 }}>{children}</h2>
      {action && <span onClick={onAction} className="presslite" style={{ fontSize: 13, fontWeight: 700, color: T.mintDk, cursor: 'pointer' }}>{action}</span>}
    </div>
  );
}

// ── Bottom sheet ─────────────────────────────────────────────
export function Sheet({ open, onClose, children, title }) {
  if (!open) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 60, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(14,26,20,.38)', animation: 'fadeIn .25s .04s forwards', backdropFilter: 'blur(2px)' }} />
      <div style={{ position: 'relative', background: '#fff', borderRadius: '28px 28px 0 0', padding: '14px 20px 26px',
        animation: `sheetUp .42s ${T.spring} .04s forwards`, boxShadow: '0 -20px 50px rgba(0,0,0,.18)' }}>
        <div style={{ width: 44, height: 5, borderRadius: 999, background: '#E2E8E5', margin: '0 auto 14px' }} />
        {title && <h3 style={{ margin: '0 0 14px', fontSize: 19, fontWeight: 800, letterSpacing: -0.3 }}>{title}</h3>}
        {children}
      </div>
    </div>
  );
}

// ── Animated exercise demo (anatomical illustration GIF) ──
export function ExerciseGif({ src, radius = 16, style }) {
  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: radius, background: '#FFFFFF', ...style }}>
      <img src={src} alt="" draggable="false" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', userSelect: 'none' }} />
    </div>
  );
}

// ── Accent palettes (tweakable) ──────────────────────────────
export const ACCENTS = {
  '#16E0A0': { mint: '#16E0A0', mintDk: '#06B27C', mintSoft: '#DEFBEF', glowC: '22,224,160' },
  '#20D3D3': { mint: '#20D3D3', mintDk: '#0BA6A6', mintSoft: '#D6F8F8', glowC: '32,211,211' },
  '#FF7A4D': { mint: '#FF7A4D', mintDk: '#E8551F', mintSoft: '#FFE3D6', glowC: '255,122,77' },
  '#B9E62E': { mint: '#B9E62E', mintDk: '#86B000', mintSoft: '#EEFAC9', glowC: '160,200,0' },
};
export function applyAccent(hex) {
  const a = ACCENTS[hex] || ACCENTS['#16E0A0'];
  T.mint = a.mint; T.mintDk = a.mintDk; T.mintSoft = a.mintSoft;
  T.glow = `0 12px 26px rgba(${a.glowC},0.40)`;
}
