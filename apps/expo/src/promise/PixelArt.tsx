import type { ViewStyle } from "react-native";
import { useEffect, useRef, useState } from "react";
import { Animated, View } from "react-native";
import Svg, { Rect } from "react-native-svg";

import { PIXEL_PALETTES } from "./theme";

interface PixelArtProps {
  grid: string;
  palette: Record<string, string>;
  scale?: number;
  style?: ViewStyle;
}

export function PixelArt({ grid, palette, scale = 4, style }: PixelArtProps) {
  const lines = grid
    .trim()
    .split("\n")
    .map((l) => l.replace(/\s+$/, ""));
  const h = lines.length;
  const w = Math.max(...lines.map((l) => l.length));

  const rects: { x: number; y: number; fill: string }[] = [];
  for (let y = 0; y < h; y++) {
    const row = lines[y]!.padEnd(w, ".");
    for (let x = 0; x < w; x++) {
      const ch = row[x];
      if (ch === "." || ch === " " || ch === undefined) continue;
      const c = palette[ch];
      if (!c) continue;
      rects.push({ x: x * scale, y: y * scale, fill: c });
    }
  }
  return (
    <View style={[{ width: w * scale, height: h * scale }, style]}>
      <Svg width={w * scale} height={h * scale}>
        {rects.map((r, i) => (
          <Rect
            key={i}
            x={r.x}
            y={r.y}
            width={scale}
            height={scale}
            fill={r.fill}
          />
        ))}
      </Svg>
    </View>
  );
}

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
....oHHsskkkksskkHo.....
.....oHHssssssHHHo......
......ooHHHHHHHo........
....ooooSSSSSSSooo......
...oSSSSSSSSSSSSSSo.....
..oSSSwwwwSSSSSSSSSo....
..oSSwwwTTwwSSSSSSSSSo..
.oSSSwwTTTTwwSSSSSSSSSo.
.oSSSSwwTTwwSSSSSSSSSo..
.oSSSSSwwwwSSSSSSSSSo...
.oSSSSSSwwSSSSSSSSSo....
.oSSSSSSSwSSSSSSSSo.....
oSSSSSSSSSSSSSSSSo......
oSSSSSSSSSSSSSSSo.......
oSSSSSSSSSSSSSSo........
oSSSSSSSSSSSSSo.........
oSSSSSSSSSSSSo..........
.ooooooooooooo..........
`;

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

const SPRITES = {
  defense: SPRITE_DEFENSE,
  defensePoint: SPRITE_DEFENSE_POINT,
  prosecutor: SPRITE_PROSECUTOR,
  judge: SPRITE_JUDGE,
} as const;

export type CharacterKind = keyof typeof SPRITES;

function buildPalette(): Record<string, string> {
  const p = PIXEL_PALETTES.chunky;
  return {
    o: p.outline,
    H: p.hair,
    h: p.hairLight,
    s: p.skin,
    k: p.skin,
    e: p.eye,
    m: p.mouth,
    c: p.cheek,
    S: p.suit,
    C: p.suitLight,
    w: p.shirt,
    T: p.tie,
    r: p.outline,
    W: p.wig,
    V: p.wigShade,
    R: p.robe,
    A: p.accentDark,
    a: p.accent,
    B: p.hair,
  };
}

interface CharacterProps {
  kind?: CharacterKind;
  scale?: number;
  style?: ViewStyle;
}
export function Character({
  kind = "defense",
  scale = 4,
  style,
}: CharacterProps) {
  return (
    <PixelArt
      grid={SPRITES[kind]}
      palette={buildPalette()}
      scale={scale}
      style={style}
    />
  );
}

const SPRITE_HEART = `
.HH..HH.
HHHHHHHH
HHHHHHHH
.HHHHHH.
..HHHH..
...HH...
`;

interface PixelHeartProps {
  filled?: boolean;
  scale?: number;
}
export function PixelHeart({ filled = true, scale = 3 }: PixelHeartProps) {
  return (
    <PixelArt
      grid={SPRITE_HEART}
      palette={{ H: filled ? "#E0354A" : "#5A3030" }}
      scale={scale}
    />
  );
}

interface IdleBobProps {
  children: React.ReactNode;
  amp?: number;
  speed?: number;
  delay?: number;
  style?: ViewStyle;
}
export function IdleBob({
  children,
  amp = 2,
  speed = 1.2,
  delay = 0,
  style,
}: IdleBobProps) {
  const anim = useRef(new Animated.Value(0)).current;
  const [_, force] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const start = Date.now();
    const tick = () => {
      if (cancelled) return;
      const t = ((Date.now() - start) / 1000) * speed;
      const y = Math.sin(t * Math.PI + delay) * amp;
      anim.setValue(y);
      requestAnimationFrame(tick);
    };
    tick();
    return () => {
      cancelled = true;
      void force;
    };
  }, [amp, speed, delay, anim]);

  return (
    <Animated.View style={[{ transform: [{ translateY: anim }] }, style]}>
      {children}
    </Animated.View>
  );
}
