// ui-kit.jsx — light, playful UI primitives shared across screens

const C = {
  bg: '#F2FBF4',
  paper: '#FFFFFF',
  ink: '#1F3A2A',
  ink2: '#4A6655',
  muted: '#8AA092',
  line: '#E2EFE6',
  primary: '#2EB872',
  primaryDk: '#239658',
  primaryInk: '#FFFFFF',
  accent: '#FFD166',
  warm: '#FF9A6C',
  danger: '#E05767',
  chip: '#E9F6EE',
  chipWarm: '#FFF1DD',
  chipDanger: '#FCE4E7',
};

const Btn = ({ children, kind = 'primary', size = 'lg', onClick, style, icon }) => {
  const base = {
    border: 'none', borderRadius: 16, cursor: 'pointer',
    fontFamily: 'Onest, Inter, system-ui', fontWeight: 600,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    transition: 'transform .08s ease, box-shadow .15s',
    letterSpacing: -0.2,
  };
  const sizes = {
    lg: { fontSize: 17, padding: '16px 20px', minHeight: 54 },
    md: { fontSize: 15, padding: '12px 16px', minHeight: 44 },
    sm: { fontSize: 13, padding: '8px 12px', minHeight: 32, borderRadius: 10 },
  };
  const kinds = {
    primary: { background: C.ink, color: '#fff', boxShadow: '0 2px 0 #0a1a12, 0 8px 18px rgba(31,58,42,0.18)' },
    accent: { background: C.accent, color: C.ink, boxShadow: '0 2px 0 #c99a3d' },
    green: { background: C.primary, color: '#fff', boxShadow: '0 2px 0 #1a7d49' },
    soft: { background: C.chip, color: C.ink },
    ghost: { background: 'transparent', color: C.ink },
    danger: { background: C.danger, color: '#fff', boxShadow: '0 2px 0 #9a3340' },
  };
  return (
    <button onClick={onClick}
      onMouseDown={(e) => (e.currentTarget.style.transform = 'translateY(1px)')}
      onMouseUp={(e) => (e.currentTarget.style.transform = '')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = '')}
      style={{ ...base, ...sizes[size], ...kinds[kind], width: '100%', ...style }}>
      {icon}{children}
    </button>
  );
};

const Card = ({ children, style, onClick }) => (
  <div onClick={onClick} style={{
    background: C.paper, borderRadius: 22, padding: 18,
    boxShadow: '0 1px 0 ' + C.line + ', 0 6px 16px rgba(31,58,42,0.04)',
    cursor: onClick ? 'pointer' : 'default',
    ...style,
  }}>{children}</div>
);

const Chip = ({ children, tone = 'green', style }) => {
  const tones = {
    green: { bg: C.chip, fg: '#1a7d49' },
    warm:  { bg: C.chipWarm, fg: '#A4691B' },
    danger:{ bg: C.chipDanger, fg: '#9a3340' },
    ink:   { bg: '#EAF1ED', fg: C.ink },
  }[tone];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: tones.bg, color: tones.fg,
      padding: '4px 10px', borderRadius: 999,
      fontSize: 12, fontWeight: 600, letterSpacing: 0.1,
      fontFamily: 'Onest, Inter, system-ui',
      ...style,
    }}>{children}</span>
  );
};

// Striped placeholder (per system prompt — for missing imagery only)
const Placeholder = ({ w = '100%', h = 80, label, style }) => (
  <div style={{
    width: w, height: h, borderRadius: 10,
    backgroundImage: 'repeating-linear-gradient(135deg, #EAF1ED 0 8px, #DCE7E0 8px 16px)',
    color: C.muted, fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 11,
    display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
    padding: 8, ...style,
  }}>{label}</div>
);

// Progress ring
const Ring = ({ pct = 60, size = 56, stroke = 6, color = C.primary, track = C.line, label }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} stroke={track} strokeWidth={stroke} fill="none"/>
        <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={stroke} fill="none"
          strokeLinecap="round"
          strokeDasharray={`${(pct/100)*c} ${c}`}
          transform={`rotate(-90 ${size/2} ${size/2})`} />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Onest', fontWeight: 700, fontSize: size > 60 ? 16 : 13, color: C.ink,
      }}>{label ?? `${pct}%`}</div>
    </div>
  );
};

// Bottom tab bar
const TabBar = ({ active = 'home', onSelect = () => {} }) => {
  const tabs = [
    { id: 'home', label: 'Pacts', icon: '◉' },
    { id: 'create', label: 'New', icon: '＋' },
    { id: 'me', label: 'Me', icon: '◐' },
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 30,
      paddingBottom: 28, paddingTop: 8,
      background: 'linear-gradient(180deg, rgba(242,251,244,0) 0%, ' + C.bg + ' 40%)',
      display: 'flex', justifyContent: 'space-around',
    }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onSelect(t.id)}
          style={{
            border: 'none', background: 'transparent', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            color: active === t.id ? C.ink : C.muted, fontFamily: 'Onest', fontSize: 11, fontWeight: 600,
            padding: '4px 16px',
          }}>
          <span style={{
            width: 36, height: 36, borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: active === t.id ? C.ink : 'transparent',
            color: active === t.id ? '#fff' : C.ink2,
            fontSize: 18, fontWeight: 700,
          }}>{t.icon}</span>
          {t.label}
        </button>
      ))}
    </div>
  );
};

// Top bar (in-app)
const TopBar = ({ title, leading, trailing, subtitle }) => (
  <div style={{
    padding: '64px 20px 12px', display: 'flex', alignItems: 'center', gap: 12,
  }}>
    <div style={{ width: 36 }}>{leading}</div>
    <div style={{ flex: 1, textAlign: 'center' }}>
      <div style={{ fontFamily: 'Onest', fontWeight: 700, fontSize: 17, color: C.ink, letterSpacing: -0.2 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 11, color: C.muted, fontFamily: 'Onest' }}>{subtitle}</div>}
    </div>
    <div style={{ width: 36, display: 'flex', justifyContent: 'flex-end' }}>{trailing}</div>
  </div>
);

const IconBack = ({ color = C.ink }) => (
  <div style={{
    width: 36, height: 36, borderRadius: 18, background: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 1px 0 ' + C.line,
  }}>
    <svg width="9" height="14" viewBox="0 0 9 14"><path d="M7.5 1L1.5 7l6 6" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
  </div>
);

Object.assign(window, { C, Btn, Card, Chip, Placeholder, Ring, TabBar, TopBar, IconBack });
