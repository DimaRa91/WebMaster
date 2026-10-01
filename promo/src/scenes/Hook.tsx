import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame} from 'remotion';
import {C, F, SAFE_CY} from '../theme';
import {Display, Fill, Grid, Mono, easeIn, easeOut, lerp, punch, shake, sp} from '../lib';

// 0–90f. Four word slams on the beat (0,15,30,45), box lands at 60, box swallows camera 75–90.
const WORDS = [
  {t: 'ВЕЗЁТЕ', size: 170},
  {t: 'ТОВАР', size: 210},
  {t: 'ИЗ ЕВРОПЫ', size: 116},
  {t: 'И КИТАЯ?', size: 124},
];
const BG = [C.orange, C.ink, C.cobalt, C.cream];
const FG = [C.ink, C.cream, C.cream, C.ink];

export const Box3D: React.FC<{size: number; rx: number; ry: number; label?: boolean}> = ({size, rx, ry, label = true}) => {
  const s = size;
  const face = (tr: string, bg: string, content?: React.ReactNode): React.ReactNode => (
    <div
      style={{
        position: 'absolute',
        width: s,
        height: s,
        background: bg,
        transform: tr,
        backfaceVisibility: 'hidden',
        boxShadow: 'inset 0 0 0 4px rgba(0,0,0,0.12)',
        overflow: 'hidden',
      }}
    >
      {/* tape */}
      <div style={{position: 'absolute', left: s * 0.42, width: s * 0.16, top: 0, bottom: 0, background: 'rgba(255,240,210,0.35)'}} />
      {content}
    </div>
  );
  const labelEl = label ? (
    <div
      style={{
        position: 'absolute',
        left: s * 0.1,
        top: s * 0.56,
        width: s * 0.8,
        padding: `${s * 0.035}px ${s * 0.05}px`,
        background: C.cream,
        border: `${s * 0.012}px solid ${C.ink}`,
        fontFamily: F.mono,
        fontWeight: 700,
        fontSize: s * 0.075,
        color: C.ink,
        lineHeight: 1.15,
      }}
    >
      <div style={{display: 'flex', justifyContent: 'space-between'}}>
        <span>EU</span>
        <span style={{color: C.orange}}>→</span>
        <span>RU</span>
      </div>
      <div style={{fontSize: s * 0.05, marginTop: s * 0.015}}>СБОРНЫЙ ГРУЗ</div>
      <div style={{height: s * 0.06, marginTop: s * 0.02, background: `repeating-linear-gradient(90deg, ${C.ink} 0 3px, transparent 3px 6px, ${C.ink} 6px 8px, transparent 8px 13px)`}} />
    </div>
  ) : null;
  return (
    <div style={{width: s, height: s, position: 'relative', transformStyle: 'preserve-3d', transform: `rotateX(${rx}deg) rotateY(${ry}deg)`}}>
      {face(`translateZ(${s / 2}px)`, C.kraft, labelEl)}
      {face(`rotateY(180deg) translateZ(${s / 2}px)`, C.kraftDark)}
      {face(`rotateY(90deg) translateZ(${s / 2}px)`, C.kraftDark)}
      {face(`rotateY(-90deg) translateZ(${s / 2}px)`, '#B88347')}
      {face(`rotateX(90deg) translateZ(${s / 2}px)`, '#D9A86C')}
      {face(`rotateX(-90deg) translateZ(${s / 2}px)`, C.kraftDark)}
    </div>
  );
};

export const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const beat = Math.min(3, Math.floor(f / 15));
  const hits = [0, 15, 30, 45, 60];
  const sh = shake(f, hits, f >= 60 ? 40 : 18);
  const landed = f >= 60;

  // words phase
  const wordsOut = lerp(f, 52, 61, 0, 1, easeIn);
  const bg = f < 60 ? BG[beat] : C.orange;
  const fg = FG[beat];

  // box phase
  const drop = interpolate(f, [50, 60], [-1500, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeIn});
  const squash = landed ? 1 - 0.18 * Math.exp(-(f - 60) / 3) * Math.cos((f - 60) * 0.9) : 1;
  const zoom = interpolate(f, [76, 90], [1, 14], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeIn});
  const ry = interpolate(f, [50, 90], [-38, -18]);
  const rx = interpolate(f, [50, 90], [-22, -12]);

  return (
    <Fill bg={bg}>
      <Grid color={fg} opacity={0.08} size={120} offsetY={f * 4} />
      <AbsoluteFill style={{transform: `translate(${sh.x}px, ${sh.y}px) rotate(${sh.r}deg) scale(${punch(f, hits, 0.04)})`}}>
        {/* Word stack */}
        {f < 62 && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: SAFE_CY - 330,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 18,
              transform: `translateY(${-wordsOut * 1700}px)`,
            }}
          >
            {WORDS.map((w, i) => {
              const start = i === 0 ? -4 : i * 15 - 2;
              if (f < start) return <div key={i} style={{height: w.size * 0.92}} />;
              const s = sp(f, start, 30, {damping: 11, stiffness: 260, mass: 0.5});
              const sc = interpolate(s, [0, 1], [2.4, 1]);
              const split = Math.max(0, 14 * (1 - (f - start) / 8));
              return (
                <div key={i} style={{transform: `scale(${sc}) rotate(${(1 - s) * (i % 2 ? 8 : -8)}deg)`, opacity: Math.min(1, s * 3)}}>
                  <Display size={w.size} color={fg} split={split}>
                    {w.t}
                  </Display>
                </div>
              );
            })}
          </div>
        )}
        {/* corner HUD */}
        {f < 60 && (
          <>
            <Mono size={26} color={fg} style={{position: 'absolute', left: 90, top: 290, opacity: 0.8}}>
              {`EU → RU / ${String(f).padStart(3, '0')}`}
            </Mono>
            <Mono size={26} color={fg} style={{position: 'absolute', right: 90, top: 290, opacity: 0.8}}>
              {['●○○○', '●●○○', '●●●○', '●●●●'][beat]}
            </Mono>
          </>
        )}

        {/* BOX */}
        {f >= 50 && (
          <AbsoluteFill style={{perspective: 1600, alignItems: 'center', justifyContent: 'center'}}>
            <div
              style={{
                position: 'absolute',
                top: SAFE_CY - 330,
                transform: `translateY(${drop}px) scale(${zoom}) scaleY(${squash}) scaleX(${2 - squash})`,
                transformOrigin: '50% 70%',
              }}
            >
              <Box3D size={420} rx={rx} ry={ry} />
            </div>
          </AbsoluteFill>
        )}
        {/* dust */}
        {landed &&
          new Array(26).fill(0).map((_, i) => {
            const d = f - 60;
            const a = (i / 26) * Math.PI - Math.PI + (random(`a${i}`) - 0.5) * 0.4;
            const v = 14 + random(`v${i}`) * 26;
            const x = 540 + Math.cos(a) * v * d * (1 - d / 60);
            const y = SAFE_CY + 140 + Math.sin(a) * v * d * 0.4 + d * d * 0.3;
            const sz = 10 + random(`s${i}`) * 22;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: x,
                  top: y,
                  width: sz,
                  height: sz,
                  background: i % 3 ? C.ink : C.cream,
                  opacity: Math.max(0, 1 - d / 22),
                  transform: `rotate(${d * 20 + i * 30}deg)`,
                }}
              />
            );
          })}
        {/* caption under box */}
        {landed && f < 80 && (
          <div style={{position: 'absolute', left: 0, right: 0, top: SAFE_CY + 250, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14}}>
            {['СБОРНЫЕ ГРУЗЫ', 'ЕВРОПА · КИТАЙ → МОСКВА'].map((l, i) => {
              const s = sp(f, 62 + i * 3, 30, {damping: 14, stiffness: 220});
              return (
                <div
                  key={i}
                  style={{
                    background: i ? C.cream : C.ink,
                    padding: '10px 26px',
                    transform: `translateY(${(1 - s) * 80}px) rotate(${i ? 2 : -2}deg)`,
                    opacity: s * lerp(f, 74, 80, 1, 0),
                  }}
                >
                  <Display size={i ? 38 : 70} color={i ? C.ink : C.cream}>
                    {l}
                  </Display>
                </div>
              );
            })}
          </div>
        )}
      </AbsoluteFill>
      {/* zoom-through veil: kraft fills frame → hard cut to red */}
      <AbsoluteFill style={{background: C.kraft, opacity: lerp(f, 84, 89, 0, 1, easeOut)}} />
    </Fill>
  );
};
