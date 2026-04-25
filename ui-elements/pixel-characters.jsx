// pixel-characters.jsx — string-grid → box-shadow sprites
// Each sprite is a tiny ASCII grid where each character maps to a color.
// We render via box-shadow on a 1×1 dot, scaled up. Crisp at any size.

const PixelArt = ({ grid, palette, scale = 6, style }) => {
  const lines = grid.trim().split('\n').map(l => l.replace(/\s+$/, ''));
  const h = lines.length;
  const w = Math.max(...lines.map(l => l.length));
  const shadows = [];
  for (let y = 0; y < h; y++) {
    const row = lines[y].padEnd(w, '.');
    for (let x = 0; x < w; x++) {
      const ch = row[x];
      if (ch === '.' || ch === ' ') continue;
      const c = palette[ch];
      if (!c) continue;
      shadows.push(`${x * scale}px ${y * scale}px 0 0 ${c}`);
    }
  }
  return (
    <div style={{
      width: w * scale, height: h * scale,
      position: 'relative', flexShrink: 0,
      ...style,
    }}>
      <div style={{
        width: scale, height: scale, position: 'absolute', top: 0, left: 0,
        boxShadow: shadows.join(','),
      }} />
    </div>
  );
};

// ─── PALETTES ────────────────────────────────────────────────
// 'chunky'  — saturated 16-bit (default)
// 'crisp'   — clean 8-bit, fewer colors
// 'gameboy' — 4-tone green mono

const STYLES = {
  chunky: {
    skin: '#F8C9A0', skinShade: '#D89870',
    hair: '#3E2A1E', hairLight: '#6B4A2E',
    suit: '#1B5E91', suitDark: '#103A5C', suitLight: '#3A86C1',
    shirt: '#FAFAF7', tie: '#E0454D', tieDark: '#9B2828',
    eye: '#1A1A1A', mouth: '#1A1A1A', cheek: '#FFB0A0',
    outline: '#1F1A18',
    // judge specific
    robe: '#1A1A1A', robeShade: '#0A0A0A', collar: '#FFFFFF', wig: '#E8E8E8', wigShade: '#B5B5B5',
    // accent
    accent: '#FFD166', accentDark: '#C99A3D',
    danger: '#E05767', success: '#2EB872',
  },
  crisp: {
    skin: '#FCD3A7', skinShade: '#E0A47A',
    hair: '#2A1810', hairLight: '#5A3820',
    suit: '#2563C0', suitDark: '#163E80', suitLight: '#5C8FE0',
    shirt: '#FFFFFF', tie: '#D63A3A', tieDark: '#8A1F1F',
    eye: '#0A0A0A', mouth: '#0A0A0A', cheek: '#FF9090',
    outline: '#0A0A0A',
    robe: '#101010', robeShade: '#000000', collar: '#FFFFFF', wig: '#F0F0F0', wigShade: '#A8A8A8',
    accent: '#FFC93C', accentDark: '#B88A20',
    danger: '#E0354A', success: '#1FA85F',
  },
  gameboy: {
    skin: '#9BBC0F', skinShade: '#306230',
    hair: '#0F380F', hairLight: '#306230',
    suit: '#306230', suitDark: '#0F380F', suitLight: '#8BAC0F',
    shirt: '#9BBC0F', tie: '#0F380F', tieDark: '#0F380F',
    eye: '#0F380F', mouth: '#0F380F', cheek: '#306230',
    outline: '#0F380F',
    robe: '#0F380F', robeShade: '#0F380F', collar: '#9BBC0F', wig: '#9BBC0F', wigShade: '#306230',
    accent: '#9BBC0F', accentDark: '#306230',
    danger: '#0F380F', success: '#306230',
  },
};

// ─── SPRITES ─────────────────────────────────────────────────
// 24w x 32h grid for half-bodies (bust-up) — keeps things readable

// You — defense attorney, finger-point
const SPRITE_DEFENSE = `
........oooooooo........
......ooHHHHHHHHoo......
.....oHHhhhhhhhhhHo.....
.....oHhhhhhhhhhhHo.....
.....oHsssssssssHHo.....
....oHsskskkksskkHo.....
....oHskeskskeskkHo.....
....oHsskkkkksskkHo.....
....oHsskkmmmksskHo.....
....oHHsskkkksskkHo.....
.....oHHssssssHHHo......
......ooHHHHHHHo........
....ooooSSSSSSSooo......
...oSSSSSSSSSSSSSSo.....
..oSSSwwwwSSSSSSSSSo....
..oSSwwwTTwwSSSSSSSSo...
.oSSSwwTTTTwwSSSSSSSSo..
.oSSSSwwTTwwSSSSSSSSSo..
.oSSSSSwwwwSSSSSSSSSSo..
.oSSSSSSwwSSSSSSSSSSSo..
.oSSSSSSSwSSSSSSSSSSSo..
oSSSSSSSSSSSSSSSSSSSSSo.
oSSSSSSSSSSSSSSSSSSSSSo.
oSSSSSSSSSSSSSSSSSSSSSo.
oSSSSSSSSSSSSSSSSSSSSSo.
oSSSSSSSSSSSSSSSSSSSSSo.
.ooooooooooooooooooooo..
`;

// Defense pointing forward (objection!) — same head, arm extended
const SPRITE_DEFENSE_POINT = `
........oooooooo........
......ooHHHHHHHHoo......
.....oHHhhhhhhhhhHo.....
.....oHhhhhhhhhhhHo.....
.....oHsssssssssHHo.....
....oHsskskkksskkHo.....
....oHskeskskeskkHo.....
....oHsskkkkksskkHo.....
....oHsskkmmmksskHo.....
....oHHsskkkksskkHooooooo
.....oHHssssssHHHosssssoo
......ooHHHHHHHosssssssoo
....ooooSSSSSSSosssssssoo
...oSSSSSSSSSSSSSSosskskooo
..oSSSwwwwSSSSSSSSSooooosko
..oSSwwwTTwwSSSSSSSSSo.ookoo
.oSSSwwTTTTwwSSSSSSSSSo.....
.oSSSSwwTTwwSSSSSSSSSo......
.oSSSSSwwwwSSSSSSSSSo.......
.oSSSSSSwwSSSSSSSSSo........
.oSSSSSSSwSSSSSSSSo.........
oSSSSSSSSSSSSSSSSSo.........
oSSSSSSSSSSSSSSSSo..........
oSSSSSSSSSSSSSSSo...........
oSSSSSSSSSSSSSSo............
oSSSSSSSSSSSSSo.............
.ooooooooooooo..............
`;

// Prosecutor — slick hair, smug grin
const SPRITE_PROSECUTOR = `
........oooooooo........
.......oHHHHHHHHo.......
......oHhhhhhhhHHo......
.....oHhhhhhhhhhhho.....
.....oHhhssssshhhho.....
....oHHssssssssshhho....
....oHsskskkksskskho....
....oHskeskskeskskho....
....oHsskkkkkkskskho....
....oHsskkmmmkskskho....
....oHHsskkkkkskskHo....
.....oHHssssssshhHo.....
......ooHHHHHHHHHo......
.....oooooSSSSSooooo....
....oCCCCCCSSSSCCCCCCo..
...oCCwwwwwSSSwwwwwCCo..
...oCCwwTTwwSwwTTwwCCo..
..oCCwwTTTTwwwwTTTTwwCCo
..oCCCwwTTwwSSwwTTwwCCCo
..oCCCCwwwwSSSSwwwwCCCCo
..oCCCCCwwSSSSSSwwCCCCCo
..oCCCCCCSSSSSSSSCCCCCCo
..oCCCCCCSSSSSSSSCCCCCCo
..oCCCCCCSSSSSSSSCCCCCCo
..oCCCCCCSSSSSSSSCCCCCCo
..oCCCCCCSSSSSSSSCCCCCCo
..oooooooooooooooooooooo
`;

// Judge — wig, robe, gavel raised
const SPRITE_JUDGE = `
........rrrrrrrr........
.......rWWWWWWWWr.......
......rWWWWWWWWWWr......
.....rWWWWWWWWWWWWr.....
.....rWWWVWWWWVWWWr.....
....rWVWWWWWWWWWVWWr....
....rWVssssssssVssWr....
....rWsskeskskeskWWr....
....rWsskkkkkkkskWWr....
....rWsskkmmmksskWWr....
....rWWssskkkksshWWr....
.....rWWWssssssWWWr.....
......rrrCCCCCrrrr......
.....rRRCCCCCCCCRRr.....
....rRRRRCCCCCCRRRRr....
...rRRRRRRRRRRRRRRRRr...
..rRRRRRRRRRRRRRRRRRRr..
..rRRRRRRRRRRRRRRRRRRr..
..rRRRRRRRRRRRRRRRRRRr..
..rRRRRRRRRRRRRRRRRRRr..
..rRRRRRRRRRRRRRRRRRRr..
.rRRRRRRRRRRRRRRRRRRRRr.
.rRRRRRRRRRRRRRRRRRRRRr.
.rRRRRRRRRRRRRRRRRRRRRr.
.rRRRRRRRRRRRRRRRRRRRRr.
.rRRRRRRRRRRRRRRRRRRRRr.
..rrrrrrrrrrrrrrrrrrrr..
`;

// Gavel
const SPRITE_GAVEL = `
.....AAAA.....
.....AaaA.....
.....AaaA.....
.AAAAAaaAAAAA.
.AaaaaaaaaaaA.
.AaaaaaaaaaaA.
.AAAAAaaAAAAA.
.....AaaA.....
.....AaaA.....
.....AaaA.....
.....AaaA.....
....BBBBBB....
....BBBBBB....
`;

const charPalette = (artStyle, sprite) => {
  const p = STYLES[artStyle] || STYLES.chunky;
  const base = {
    'o': p.outline,
    'H': p.hair,
    'h': p.hairLight,
    's': p.skin,
    'k': p.skin,
    'e': p.eye,
    'm': p.mouth,
    'c': p.cheek,
    'S': p.suit,
    'C': p.suitLight,
    'w': p.shirt,
    'T': p.tie,
    'r': p.outline,
    'W': p.wig,
    'V': p.wigShade,
    'R': p.robe,
    'A': p.accentDark,
    'a': p.accent,
    'B': p.hair,
  };
  return base;
};

const Character = ({ kind = 'defense', art = 'chunky', scale = 4, style }) => {
  const sprites = {
    defense: SPRITE_DEFENSE,
    defensePoint: SPRITE_DEFENSE_POINT,
    prosecutor: SPRITE_PROSECUTOR,
    judge: SPRITE_JUDGE,
  };
  return <PixelArt grid={sprites[kind]} palette={charPalette(art, kind)} scale={scale} style={style} />;
};

// Pixel heart for credibility meter
const SPRITE_HEART = `
.HH..HH.
HHHHHHHH
HHHHHHHH
.HHHHHH.
..HHHH..
...HH...
`;

const PixelHeart = ({ filled = true, scale = 3 }) => (
  <PixelArt grid={SPRITE_HEART} palette={{ H: filled ? '#E0354A' : '#5A3030' }} scale={scale} />
);

// Animated idle bobbing wrapper
const IdleBob = ({ children, amp = 2, speed = 1.2, delay = 0, style }) => {
  const [t, setT] = React.useState(0);
  React.useEffect(() => {
    let raf, start = performance.now();
    const tick = (now) => {
      setT(((now - start) / 1000) * speed);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [speed]);
  const y = Math.sin(t * Math.PI + delay) * amp;
  return <div style={{ transform: `translateY(${y}px)`, ...style }}>{children}</div>;
};

Object.assign(window, { PixelArt, Character, PixelHeart, IdleBob, STYLES });
