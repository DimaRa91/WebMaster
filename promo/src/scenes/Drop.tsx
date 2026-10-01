import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame} from 'remotion';
import {C, F, SAFE_CY} from '../theme';
import {Display, Fill, Grid, Marquee, Mono, easeIn, easeInOut, easeOut, lerp, punch, shake, sp} from '../lib';

// local 0–360 (global 360–720 = 12–24s). 1 bar = 60f.
//   0–60    wall: "из Италии и Европы → в Москву"
//   60–180  map: Rimini close-up (factories) → camera pulls out → Vilnius, Moscow, transit times
//   180–240 consolidation tetris: "от одной коробки", crate, insurance
//   240–300 truck: what we carry (word swaps on 8th notes)
//   300–360 four solution cards — each answers a pain from the САНКЦИИ block
const beats = (from: number, to: number) => {
  const r: number[] = [];
  for (let b = from; b < to; b += 15) r.push(b);
  return r;
};

/* ---------- type wall ---------- */
const Wall: React.FC<{f: number}> = ({f}) => {
  const hits = beats(0, 60);
  const card = sp(f, 0, 30, {damping: 9, stiffness: 260});
  const chip = sp(f, 30, 30, {damping: 10, stiffness: 300});
  return (
    <Fill bg={C.orange}>
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          transform: `rotate(-10deg) scale(${1.35 * punch(f, hits, 0.03)})`,
          WebkitMaskImage: 'linear-gradient(transparent 8%, #000 22%, #000 78%, transparent 92%)',
        }}
      >
        {new Array(10).fill(0).map((_, i) => (
          <Marquee key={i} text="СБОРНЫЕ ГРУЗЫ" size={140} color={C.ink} outline={i % 2 === 1} speed={i % 2 ? 16 : -16} offset={i * 410} />
        ))}
      </AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', top: SAFE_CY - 960}}>
        <div
          style={{
            background: C.cream,
            padding: '40px 50px 46px',
            transform: `scale(${interpolate(card, [0, 1], [0.2, 1]) * punch(f, hits.slice(1), 0.04)}) rotate(${-4 + (1 - card) * 30}deg)`,
            boxShadow: `24px 24px 0 ${C.ink}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Mono size={28} color={C.orange}>
            {'СБОРНЫЕ ГРУЗЫ'}
          </Mono>
          <Display size={84} color={C.ink} style={{marginTop: 16}}>
            {'ИЗ ИТАЛИИ'}
          </Display>
          <Display size={84} color={C.ink} style={{marginTop: 6}}>
            {'И ЕВРОПЫ'}
          </Display>
          <Display size={84} color={C.orange} style={{marginTop: 6}}>
            {'→ В МОСКВУ'}
          </Display>
        </div>
        <div
          style={{
            marginTop: 70,
            background: C.ink,
            color: C.cream,
            borderRadius: 100,
            padding: '20px 40px',
            fontFamily: F.display,
            fontWeight: 800,
            fontSize: 44,
            transform: `scale(${chip}) rotate(3deg)`,
            letterSpacing: '0.02em',
          }}
        >
          ДЛЯ ВАШЕГО БИЗНЕСА
        </div>
      </AbsoluteFill>
    </Fill>
  );
};

/* ---------- map ---------- */
type Pt = {x: number; y: number};
// Equirectangular projection tuned so the whole route fits the safe area at zoom 1.
const geo = (lon: number, lat: number): Pt => ({x: 110 + (lon - 5) * 26.05, y: 600 + (56.2 - lat) * 40.7});
const G = {
  rimini: geo(12.57, 44.06),
  de: geo(10.0, 51.0),
  pl: geo(19.4, 52.0),
  nl: geo(5.3, 52.1),
  cz: geo(15.5, 49.8),
  at: geo(14.5, 47.5),
  vilnius: geo(25.28, 54.69),
  moscow: geo(37.62, 55.75),
};
const ITALY_ZOOM = 8;
const ITALY_C: Pt = {x: 300, y: 1098};
const FULL_C: Pt = {x: 540, y: 900};

// Italy close-up is schematic (real distances are a few dozen km — that's the point: "рядом").
const RIM_A: Pt = {x: 560, y: 840};
const FACTORIES = [
  {k: 'tile', city: 'САССУОЛО', what: 'ПЛИТКА', p: {x: 230, y: 640}, at: 3},
  {k: 'sofa', city: 'ПЕЗАРО', what: 'МЕБЕЛЬ', p: {x: 840, y: 980}, at: 15},
  {k: 'shoe', city: 'МАРКЕ', what: 'ОБУВЬ', p: {x: 380, y: 1120}, at: 27},
];

const FactoryIcon: React.FC<{k: string; size: number}> = ({k, size}) => {
  const st = {fill: 'none', stroke: C.ink, strokeWidth: 7, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      {k === 'tile' && (
        <g {...st}>
          <rect x={18} y={18} width={30} height={30} />
          <rect x={52} y={18} width={30} height={30} />
          <rect x={18} y={52} width={30} height={30} />
          <rect x={52} y={52} width={30} height={30} fill={C.orange} />
        </g>
      )}
      {k === 'sofa' && (
        <g {...st}>
          <path d="M 22 50 L 22 32 L 78 32 L 78 50" />
          <path d="M 12 48 L 22 48 L 22 60 L 78 60 L 78 48 L 88 48 L 88 74 L 12 74 Z" fill={C.orange} />
          <path d="M 18 74 L 18 84 M 82 74 L 82 84" />
        </g>
      )}
      {k === 'shoe' && (
        <g {...st}>
          <path d="M 12 72 L 14 34 L 36 34 L 46 52 L 74 58 Q 90 61 88 74 Z" fill={C.orange} />
          <path d="M 12 80 L 88 80" />
        </g>
      )}
    </svg>
  );
};

const WarehouseDot: React.FC<{p: Pt; r: number; label: string; pop: number; labelSide?: 'below' | 'aboveLeft' | 'belowLeft'}> = ({p, r, label, pop, labelSide = 'below'}) => {
  const pos: React.CSSProperties =
    labelSide === 'below'
      ? {left: p.x, top: p.y + r + 14, transform: `translateX(-50%) scale(${pop})`}
      : labelSide === 'aboveLeft'
        ? {left: p.x - r - 6, top: p.y - r - 52, transform: `translateX(-100%) scale(${pop})`, transformOrigin: 'right bottom'}
        : {left: p.x - r - 6, top: p.y + r - 6, transform: `translateX(-100%) scale(${pop})`, transformOrigin: 'right top'};
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: p.x - r,
          top: p.y - r,
          width: r * 2,
          height: r * 2,
          borderRadius: r * 2,
          background: C.orange,
          border: `${Math.max(5, r * 0.1)}px solid ${C.cream}`,
          boxSizing: 'border-box',
          transform: `scale(${pop})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width={r * 1.1} height={r * 1.1} viewBox="0 0 100 100">
          <path d="M 12 46 L 50 18 L 88 46 L 88 86 L 12 86 Z" fill={C.cream} />
          <rect x={36} y={56} width={28} height={30} fill={C.orange} />
        </svg>
      </div>
      <div
        style={{
          position: 'absolute',
          ...pos,
          background: C.ink,
          padding: '8px 14px',
          whiteSpace: 'nowrap',
        }}
      >
        <Display size={r > 50 ? 40 : 28} color={C.cream}>
          {label}
        </Display>
      </div>
    </>
  );
};

const MapScene: React.FC<{f: number}> = ({f}) => {
  // camera: Italy close-up (slow push) → fast pull-out on the whoosh into the 16s crash
  const out = lerp(f, 44, 64, 0, 1, easeInOut);
  const push = lerp(f, 0, 44, 1, 1.08, (t) => t);
  const zoom = Math.exp(Math.log(ITALY_ZOOM * push) * (1 - out));
  const c = {x: interpolate(out, [0, 1], [ITALY_C.x, FULL_C.x]), y: interpolate(out, [0, 1], [ITALY_C.y, FULL_C.y])};
  const scr = (p: Pt): Pt => ({x: (p.x - c.x) * zoom + 540, y: (p.y - c.y) * zoom + 900});
  const rimNow = scr(G.rimini);
  // Italy layer collapses into Rimini's real position as the camera pulls out
  const kA = zoom / ITALY_ZOOM;
  const italyAlpha = lerp(f, 48, 60, 1, 0);
  const euAlpha = lerp(f, 54, 64, 0, 1);

  const gs = 40 * zoom;
  const dotR = Math.min(9, 2.6 * Math.sqrt(zoom));
  const bgx = (((540 - c.x * zoom) % gs) + gs) % gs;
  const bgy = (((900 - c.y * zoom) % gs) + gs) % gs;

  const v = scr(G.vilnius);
  const m = scr(G.moscow);
  const r = rimNow;
  const feeders = [G.de, G.pl, G.nl, G.cz, G.at].map(scr);
  const trunkR = lerp(f, 72, 94, 0, 1, easeInOut);
  const trunkV = lerp(f, 78, 94, 0, 1, easeInOut);
  const mPop = sp(f, 94, 30, {damping: 8, stiffness: 260});
  const rimCtl = scr({x: 760, y: 1060});
  const vilCtl = scr({x: 800, y: 590});

  const titleA = lerp(f, 56, 62, 1, 0);
  const titleB = sp(f, 60, 30, {damping: 13, stiffness: 220});

  return (
    <Fill bg={C.cobalt}>
      <AbsoluteFill style={{backgroundImage: `radial-gradient(${C.cream}38 ${dotR}px, transparent ${dotR + 0.5}px)`, backgroundSize: `${gs}px ${gs}px`, backgroundPosition: `${bgx}px ${bgy}px`}} />
      {/* giant background word */}
      <AbsoluteFill style={{justifyContent: 'center', opacity: 0.1}}>
        <div style={{transform: 'rotate(-90deg) translateY(-330px)'}}>
          <Marquee text={f < 58 ? 'ИТАЛИЯ' : 'ЕВРОПА'} size={260} color={C.cream} speed={10} outline />
        </div>
      </AbsoluteFill>

      {/* ---- Europe layer (geo, camera) ---- */}
      <AbsoluteFill style={{opacity: euAlpha}}>
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
          {feeders.map((p, i) => {
            const t = lerp(f, 62 + i * 3, 76 + i * 3, 0, 1, easeOut);
            return (
              <g key={i}>
                <line x1={p.x} y1={p.y} x2={p.x + (v.x - p.x) * t} y2={p.y + (v.y - p.y) * t} stroke={C.cream} strokeWidth={5} strokeLinecap="round" strokeDasharray="14 10" strokeDashoffset={-f * 2} />
                <circle cx={p.x} cy={p.y} r={i < 2 ? 13 : 9} fill={C.cream} />
              </g>
            );
          })}
          <path d={`M ${r.x} ${r.y} Q ${rimCtl.x} ${rimCtl.y} ${m.x} ${m.y}`} fill="none" stroke={C.orange} strokeWidth={16} strokeLinecap="round" pathLength={1} strokeDasharray={`${trunkR} 1`} />
          <path d={`M ${v.x} ${v.y} Q ${vilCtl.x} ${vilCtl.y} ${m.x} ${m.y}`} fill="none" stroke={C.cream} strokeWidth={16} strokeLinecap="round" pathLength={1} strokeDasharray={`${trunkV} 1`} />
          <circle cx={m.x} cy={m.y} r={28 * mPop} fill={C.cream} />
          <circle cx={m.x} cy={m.y} r={28 + Math.max(0, f - 94) * 5} fill="none" stroke={C.cream} strokeWidth={4} opacity={f > 94 ? Math.max(0, 1 - (f - 94) / 10) : 0} />
        </svg>
        <Mono size={22} color={C.cream} style={{position: 'absolute', left: feeders[0].x - 70, top: feeders[0].y + 20, opacity: lerp(f, 64, 70, 0, 1)}}>
          ГЕРМАНИЯ
        </Mono>
        <Mono size={22} color={C.cream} style={{position: 'absolute', left: feeders[1].x - 50, top: feeders[1].y + 20, opacity: lerp(f, 66, 72, 0, 1)}}>
          ПОЛЬША
        </Mono>
        <Mono size={20} color={C.cream} style={{position: 'absolute', left: 110, top: 885, opacity: lerp(f, 70, 76, 0, 0.85)}}>
          {'+ ДРУГИЕ СТРАНЫ ЕС'}
        </Mono>
        <WarehouseDot p={v} r={30} label="ВИЛЬНЮС" pop={sp(f, 60, 30, {damping: 9, stiffness: 260})} labelSide="aboveLeft" />
        <WarehouseDot p={r} r={30} label="РИМИНИ" pop={f >= 58 ? 1 : 0} labelSide="belowLeft" />
        <div style={{position: 'absolute', right: 1080 - 990, top: m.y - 104, opacity: lerp(f, 94, 98, 0, 1), transform: `translateY(${(1 - mPop) * 30}px)`}}>
          <Display size={58} color={C.cream}>
            {'МОСКВА'}
          </Display>
        </div>
        {/* transit timetable */}
        {[
          {from: 'РИМИНИ', d: '18–25', u: 'ДНЕЙ', col: C.orange, at: 90},
          {from: 'ВИЛЬНЮС', d: '14–21', u: 'ДЕНЬ', col: C.cream, at: 97},
        ].map((row, i) => {
          const s = sp(f, row.at, 30, {damping: 14, stiffness: 240});
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 110,
                width: 850,
                top: 1196 + i * 112,
                height: 96,
                background: C.ink,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 26px',
                boxSizing: 'border-box',
                clipPath: `inset(0 ${(1 - s) * 100}% 0 0)`,
                borderLeft: `14px solid ${row.col}`,
              }}
            >
              <Mono size={26} color={C.cream}>{`${row.from} → МОСКВА`}</Mono>
              <div style={{display: 'flex', alignItems: 'baseline', gap: 12}}>
                <Display size={54} color={row.col}>
                  {row.d}
                </Display>
                <Mono size={24} color={C.cream}>
                  {row.u}
                </Mono>
              </div>
            </div>
          );
        })}
      </AbsoluteFill>

      {/* ---- Italy close-up layer (schematic) ---- */}
      {italyAlpha > 0 && (
        <AbsoluteFill
          style={{
            opacity: italyAlpha,
            transformOrigin: `${RIM_A.x}px ${RIM_A.y}px`,
            transform: `translate(${rimNow.x - RIM_A.x}px, ${rimNow.y - RIM_A.y}px) scale(${kA})`,
          }}
        >
          <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
            {FACTORIES.map((fc, i) => {
              const t = lerp(f, fc.at + 2, fc.at + 14, 0, 1, easeInOut);
              return (
                <path
                  key={i}
                  d={`M ${fc.p.x} ${fc.p.y} L ${RIM_A.x} ${RIM_A.y}`}
                  stroke={C.cream}
                  strokeWidth={8}
                  strokeLinecap="round"
                  pathLength={1}
                  strokeDasharray={`${t} 1`}
                />
              );
            })}
          </svg>
          {FACTORIES.map((fc, i) => {
            const pop = sp(f, fc.at, 30, {damping: 10, stiffness: 260});
            return (
              <div key={i} style={{position: 'absolute', left: fc.p.x - 70, top: fc.p.y - 70, width: 140, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${pop})`}}>
                <div style={{width: 140, height: 140, borderRadius: 28, background: C.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `10px 10px 0 ${C.ink}`}}>
                  <FactoryIcon k={fc.k} size={104} />
                </div>
                <div style={{marginTop: 18, whiteSpace: 'nowrap'}}>
                  <Display size={34} color={C.cream}>
                    {fc.city}
                  </Display>
                </div>
                <Mono size={22} color={C.ink} style={{marginTop: 8, background: C.orange, padding: '4px 10px'}}>
                  {fc.what}
                </Mono>
              </div>
            );
          })}
          <WarehouseDot p={RIM_A} r={78} label="РИМИНИ" pop={sp(f, 0, 30, {damping: 9, stiffness: 240})} />
        </AbsoluteFill>
      )}

      {/* titles */}
      <div style={{position: 'absolute', top: 290, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: titleA, transform: `translateY(${(1 - sp(f, 0, 30)) * -80 - (1 - titleA) * 60}px)`}}>
        <Display size={80} color={C.cream}>
          {'СВОЙ СКЛАД'}
        </Display>
        <Display size={80} color={C.orange} style={{marginTop: 8}}>
          {'В РИМИНИ'}
        </Display>
      </div>
      {f >= 60 && (
        <div style={{position: 'absolute', top: 290, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `translateY(${(1 - titleB) * 60}px)`, opacity: titleB}}>
          <Display size={80} color={C.cream}>
            {'+ СКЛАД'}
          </Display>
          <Display size={80} color={C.cream} style={{marginTop: 8}}>
            {'В ВИЛЬНЮСЕ'}
          </Display>
        </div>
      )}
      {f < 58 && (
        <div style={{position: 'absolute', top: 1370, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: lerp(f, 30, 34, 0, 1) * lerp(f, 50, 56, 1, 0)}}>
          <div style={{background: C.orange, padding: '14px 28px', transform: `rotate(-2deg) scale(${sp(f, 30, 30, {damping: 10, stiffness: 300})})`}}>
            <Display size={42} color={C.ink}>
              {'ЗАБИРАЕМ С ФАБРИК САМИ'}
            </Display>
          </div>
        </div>
      )}
    </Fill>
  );
};

/* ---------- consolidation tetris ---------- */
const BOXES = [
  {c: 'ПЕЗАРО', x: 0, y: 2, w: 2, h: 1, col: C.orange},
  {c: 'САССУОЛО', x: 2, y: 1, w: 1, h: 2, col: C.cobalt},
  {c: 'МАРКЕ', x: 3, y: 2, w: 1, h: 1, col: C.kraft},
  {c: 'DE', x: 0, y: 1, w: 1, h: 1, col: C.ink},
  {c: 'PL', x: 1, y: 0, w: 1, h: 2, col: C.kraft},
  {c: 'СВЕТ', x: 3, y: 0, w: 1, h: 2, col: C.kraft, crate: true},
  {c: 'IT', x: 0, y: 0, w: 1, h: 1, col: C.cobalt},
  {c: 'EU', x: 2, y: 0, w: 1, h: 1, col: C.ink},
];
const CELL = 200;
const CW = CELL * 4;
const CH = CELL * 3;

const Tetris: React.FC<{f: number}> = ({f}) => {
  const ox = (1080 - CW) / 2;
  const oy = 700;
  const landHits = BOXES.map((_, i) => 5 + i * 6);
  const sh = shake(f, [...landHits, 52], 8, 4);
  const filled = BOXES.filter((_, i) => f >= landHits[i]).length;
  const stamp = sp(f, 50, 30, {damping: 9, stiffness: 320});
  return (
    <Fill bg={C.cream}>
      <Grid color={C.ink} opacity={0.06} size={50} />
      <div style={{position: 'absolute', top: 290, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <Display size={104} color={C.ink}>
          {'ОТ ОДНОЙ'}
        </Display>
        <div style={{background: C.ink, padding: '10px 26px', marginTop: 14, transform: `rotate(-2deg) scale(${punch(f, [0, 30], 0.06)})`}}>
          <Display size={96} color={C.orange}>
            {'КОРОБКИ'}
          </Display>
        </div>
      </div>
      <AbsoluteFill style={{transform: `translate(${sh.x}px, ${sh.y}px)`}}>
        <div style={{position: 'absolute', left: ox - 16, top: oy - 16, width: CW + 32, height: CH + 32, border: `12px solid ${C.ink}`, borderTop: 'none'}} />
        {BOXES.map((b, i) => {
          const land = landHits[i];
          if (f < land - 7) return null;
          const t = interpolate(f, [land - 7, land], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeIn});
          const y = oy + b.y * CELL;
          const bounce = f >= land ? Math.exp(-(f - land) / 3) * Math.sin((f - land) * 1.6) * 14 : 0;
          const light = b.col === C.ink || b.col === C.cobalt;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: ox + b.x * CELL + 6,
                top: interpolate(t, [0, 1], [-420, y]) + 6 - bounce,
                width: b.w * CELL - 12,
                height: b.h * CELL - 12,
                background: b.crate
                  ? `repeating-linear-gradient(0deg, ${C.kraftDark} 0 10px, ${C.kraft} 10px 58px), ${C.kraft}`
                  : b.col,
                border: `6px solid ${C.ink}`,
                padding: 14,
                boxSizing: 'border-box',
                transform: `rotate(${(1 - t) * (i % 2 ? 10 : -10)}deg)`,
                overflow: 'hidden',
              }}
            >
              {b.crate && (
                <svg width="100%" height="100%" style={{position: 'absolute', inset: 0}} preserveAspectRatio="none" viewBox="0 0 100 100">
                  <path d="M 0 0 L 100 100 M 100 0 L 0 100" stroke={C.kraftDark} strokeWidth={6} vectorEffect="non-scaling-stroke" />
                </svg>
              )}
              <span style={{position: 'relative', fontFamily: F.mono, fontWeight: 700, fontSize: 26, color: light ? C.cream : C.ink, background: b.crate ? C.cream : undefined, padding: b.crate ? '2px 6px' : undefined}}>
                {b.c}
              </span>
              {b.crate && (
                <div style={{position: 'absolute', left: 14, bottom: 22, fontFamily: F.mono, fontWeight: 700, fontSize: 20, color: C.red, border: `3px solid ${C.red}`, padding: '2px 6px', background: C.cream, transform: 'rotate(-8deg)'}}>
                  ХРУПКОЕ
                </div>
              )}
            </div>
          );
        })}
        {/* insurance stamp */}
        {f >= 50 && (
          <div style={{position: 'absolute', left: 0, right: 0, top: oy + CH / 2 - 70, display: 'flex', justifyContent: 'center'}}>
            <div
              style={{
                border: `10px solid ${C.cobalt}`,
                background: 'rgba(243,238,226,0.92)',
                padding: '16px 26px',
                transform: `rotate(-10deg) scale(${interpolate(stamp, [0, 1], [2.6, 1])})`,
                opacity: Math.min(1, stamp * 3),
              }}
            >
              <Display size={58} color={C.cobalt}>
                {'ЗАСТРАХОВАНО ✓'}
              </Display>
            </div>
          </div>
        )}
      </AbsoluteFill>
      <div style={{position: 'absolute', top: oy + CH + 50, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 20}}>
        <Mono size={32} color={C.ink}>
          {`ЗАКАЗОВ: ${filled}`}
        </Mono>
        <Mono size={32} color={C.orange}>
          {'→ 1 ПАРТИЯ'}
        </Mono>
      </div>
    </Fill>
  );
};

/* ---------- truck: what we carry ---------- */
const CARGO = ['МЕБЕЛЬ', 'СВЕТ', 'ПЛИТКУ', 'САНТЕХНИКУ', 'ОБУВЬ', 'ОДЕЖДУ', 'КОМПЛЕКТУЮЩИЕ', 'ОБОРУДОВАНИЕ'];

const Truck: React.FC<{f: number}> = ({f}) => {
  const enter = lerp(f, 0, 12, -900, 0, easeOut);
  const exit = interpolate(f, [46, 60], [0, 1600], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeIn});
  const x = enter + exit;
  const bob = Math.sin(f * 1.7) * 3;
  const ty = SAFE_CY + 90;
  const idx = Math.min(CARGO.length - 1, Math.floor(f / 7.5));
  const word = CARGO[idx];
  const wt = f - idx * 7.5;
  const wIn = Math.min(1, (wt + 1) / 3);
  const size = Math.min(132, Math.floor(900 / word.length));
  return (
    <Fill bg={C.ink}>
      {new Array(18).fill(0).map((_, i) => {
        const y = 300 + random(`ly${i}`) * 1250;
        const len = 200 + random(`ll${i}`) * 500;
        const sx = ((random(`lx${i}`) * 2200 - f * (60 + random(`lv${i}`) * 50)) % 2200) + 2200;
        return <div key={i} style={{position: 'absolute', top: y, left: (sx % 2200) - 600, width: len, height: 4, background: i % 4 ? C.cream : C.orange, opacity: 0.16}} />;
      })}
      <div style={{position: 'absolute', top: ty + 230, left: 0, right: 0, height: 8, background: C.cream, opacity: 0.4}} />
      {new Array(12).fill(0).map((_, i) => (
        <div key={i} style={{position: 'absolute', top: ty + 270, left: (((i * 200 - f * 45) % 2400) + 2400) % 2400 - 200, width: 110, height: 10, background: C.orange}} />
      ))}
      <div style={{position: 'absolute', top: 300, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <Mono size={34} color={C.orange}>
          {'ВЕЗЁМ'}
        </Mono>
        <div style={{height: 190, marginTop: 10, display: 'flex', alignItems: 'center', overflow: 'hidden'}}>
          <div style={{transform: `translateY(${(1 - wIn) * 90}px) scale(${1 + (1 - wIn) * 0.2})`, opacity: wIn}}>
            <Display size={size} color={C.cream}>
              {word}
            </Display>
          </div>
        </div>
        <div style={{display: 'flex', gap: 10, marginTop: 6}}>
          {CARGO.map((_, i) => (
            <div key={i} style={{width: i === idx ? 40 : 14, height: 14, borderRadius: 14, background: i <= idx ? C.orange : `${C.cream}44`}} />
          ))}
        </div>
      </div>
      {/* truck */}
      <div style={{position: 'absolute', left: 90 + x, top: ty - 220 + bob, width: 900, height: 440, filter: exit > 10 ? `blur(${Math.min(12, exit / 60)}px)` : undefined}}>
        <div style={{position: 'absolute', left: 0, top: 40, width: 640, height: 330, background: C.orange, border: `8px solid ${C.cream}`, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{position: 'absolute', inset: 0, background: `repeating-linear-gradient(90deg, transparent 0 56px, rgba(0,0,0,0.12) 56px 62px)`}} />
          <Display size={44} color={C.ink}>
            {'ИТАЛИЯ → МОСКВА'}
          </Display>
        </div>
        <div style={{position: 'absolute', left: 660, top: 130, width: 220, height: 240, background: C.cream, borderRadius: '10px 70px 10px 10px'}}>
          <div style={{position: 'absolute', left: 110, top: 26, width: 86, height: 80, background: C.cobalt, borderRadius: '6px 46px 6px 6px'}} />
          <div style={{position: 'absolute', right: -12, bottom: 30, width: 26, height: 40, background: C.orange}} />
        </div>
        {[90, 210, 520, 720, 820].map((wx, i) => (
          <div key={i} style={{position: 'absolute', left: wx - 46, top: 330, width: 92, height: 92, borderRadius: 92, background: C.ink, border: `12px solid ${C.cream}`, boxSizing: 'border-box', transform: `rotate(${f * 40}deg)`}}>
            <div style={{position: 'absolute', left: 32, top: 4, width: 4, height: 60, background: C.cream}} />
          </div>
        ))}
      </div>
      <Mono size={24} color={C.cream} style={{position: 'absolute', left: 0, right: 0, top: ty + 330, textAlign: 'center', opacity: 0.75, lineHeight: 1.5}}>
        {'И ДРУГИЕ ТОВАРЫ,\nРАЗРЕШЁННЫЕ К ВЫВОЗУ ИЗ ЕС'}
      </Mono>
    </Fill>
  );
};

/* ---------- solutions on the beat (mirror the four pains) ---------- */
const BENEFITS = [
  {bg: C.orange, fg: C.ink, a: 'ОПЛАТИМ', b: 'ИНВОЙС', sa: 112, sb: 112, ic: 'eur'},
  {bg: C.cream, fg: C.ink, a: 'БЕЛАЯ', b: 'РАСТАМОЖКА', sa: 120, sb: 88, ic: 'shield'},
  {bg: C.cobalt, fg: C.cream, a: 'ПОЛНЫЙ ПАКЕТ', b: 'ДОКУМЕНТОВ', sa: 72, sb: 88, ic: 'doc'},
  {bg: C.ink, fg: C.orange, a: 'ПРОВЕРКА', b: 'ПО САНКЦИЯМ', sa: 100, sb: 80, ic: 'search'},
];

const Icon: React.FC<{k: string; color: string; t: number}> = ({k, color, t}) => {
  const common = {fill: 'none', stroke: color, strokeWidth: 16, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, pathLength: 1, strokeDasharray: `${t} 1`};
  return (
    <svg width={240} height={240} viewBox="0 0 260 260">
      {k === 'eur' && (
        <>
          <circle cx={130} cy={130} r={105} {...common} />
          <path d="M 165 85 A 55 55 0 1 0 165 175 M 70 115 L 140 115 M 70 145 L 140 145" {...common} />
        </>
      )}
      {k === 'shield' && (
        <>
          <path d="M 130 20 L 225 55 L 225 130 C 225 190 180 225 130 245 C 80 225 35 190 35 130 L 35 55 Z" {...common} />
          <path d="M 85 132 L 118 165 L 180 100" {...common} />
        </>
      )}
      {k === 'doc' && (
        <>
          <path d="M 60 20 L 160 20 L 210 70 L 210 240 L 60 240 Z" {...common} />
          <path d="M 95 120 L 175 120 M 95 160 L 175 160 M 95 200 L 140 200" {...common} />
        </>
      )}
      {k === 'search' && (
        <>
          <circle cx={110} cy={110} r={75} {...common} />
          <path d="M 165 165 L 235 235 M 80 112 L 102 134 L 142 90" {...common} />
        </>
      )}
    </svg>
  );
};

const Benefit: React.FC<{f: number; i: number}> = ({f, i}) => {
  const b = BENEFITS[i];
  const s = sp(f, 0, 30, {damping: 11, stiffness: 300, mass: 0.5});
  const dir = i % 2 ? 1 : -1;
  return (
    <Fill bg={b.bg}>
      <AbsoluteFill style={{opacity: 0.1, justifyContent: 'center', transform: `rotate(${dir * 90}deg)`}}>
        <Marquee text={b.b} size={300} color={b.fg} speed={30 * dir} outline />
      </AbsoluteFill>
      <Mono size={30} color={b.fg} style={{position: 'absolute', left: 100, top: 300}}>{`РЕШЕНИЕ 0${i + 1}/04`}</Mono>
      <div style={{position: 'absolute', top: SAFE_CY - 350, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{transform: `scale(${interpolate(s, [0, 1], [0.4, 1])}) rotate(${(1 - s) * 60 * dir}deg)`}}>
          <Icon k={b.ic} color={b.fg} t={lerp(f, 0, 11, 0, 1)} />
        </div>
        <div style={{transform: `translateX(${(1 - s) * 500 * dir}px)`, marginTop: 50}}>
          <Display size={b.sa} color={b.fg}>
            {b.a}
          </Display>
        </div>
        <div style={{transform: `translateX(${(1 - s) * -500 * dir}px)`, marginTop: 14}}>
          <Display size={b.sb} color={b.fg}>
            {b.b}
          </Display>
        </div>
      </div>
    </Fill>
  );
};

export const Drop: React.FC = () => {
  const f = useCurrentFrame();
  if (f < 60) return <Wall f={f} />;
  if (f < 180) return <MapScene f={f - 60} />;
  if (f < 240) return <Tetris f={f - 180} />;
  if (f < 300) return <Truck f={f - 240} />;
  return <Benefit f={(f - 300) % 15} i={Math.floor((f - 300) / 15)} />;
};
