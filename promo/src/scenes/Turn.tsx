import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C} from '../theme';
import {Display, Fill, Grid, Mono, easeIn, easeInOut, lerp, sp} from '../lib';

// local 0–90 (global 270–360). Riser. "НО ЕСТЬ / ДРУГОЙ / МАРШРУТ".
// The route bends 90° around the block, camera rolls with it and dives into
// the route head; 81–90 is the musical gap → a single pulsing dot.
const PATH = 'M 300 1600 L 300 1290 Q 300 1190 400 1190 L 680 1190 Q 780 1190 780 1090 L 780 820';
const HEAD = {x: 780, y: 820};

export const Turn: React.FC = () => {
  const f = useCurrentFrame();
  const draw = lerp(f, 0, 70, 0, 1, easeInOut);
  const roll = lerp(f, 40, 80, 0, -90, easeInOut);
  const dive = interpolate(f, [55, 81], [1, 9], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeIn});
  const words = [
    {t: 'НО ЕСТЬ', at: 0, c: C.cream, size: 120},
    {t: 'ДРУГОЙ', at: 15, c: C.cream, size: 140},
    {t: 'МАРШРУТ', at: 30, c: C.orange, size: 116},
  ];
  if (f >= 81) {
    const p = sp(f, 81, 30, {damping: 6, stiffness: 400});
    return (
      <Fill bg={C.ink}>
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
          <div style={{width: 40, height: 40, borderRadius: 40, background: C.orange, transform: `scale(${interpolate(p, [0, 1], [6, 1])})`, boxShadow: `0 0 60px ${C.orange}`}} />
        </AbsoluteFill>
      </Fill>
    );
  }
  return (
    <Fill bg={C.ink}>
      <AbsoluteFill style={{transform: `rotate(${roll}deg) scale(${dive})`, transformOrigin: `${HEAD.x}px ${HEAD.y}px`}}>
        <Grid color={C.cream} opacity={0.07} size={90} />
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
          {/* obstacle */}
          <g opacity={lerp(f, 4, 12, 0, 1)}>
            <rect x={200} y={860} width={200} height={200} fill="none" stroke={C.red} strokeWidth={10} strokeDasharray="22 14" />
            <path d="M 225 885 L 375 1035 M 375 885 L 225 1035" stroke={C.red} strokeWidth={10} />
          </g>
          <path d={PATH} fill="none" stroke={C.orange} strokeWidth={26} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${draw} 1`} />
          <path d={PATH} fill="none" stroke={C.orange} strokeWidth={70} strokeLinecap="round" opacity={0.15} pathLength={1} strokeDasharray={`${draw} 1`} />
        </svg>
        <Mono size={28} color={C.cream} style={{position: 'absolute', left: 100, top: 1420, opacity: 0.7}}>
          {'ПОВОРОТ → 90°'}
        </Mono>
      </AbsoluteFill>
      <AbsoluteFill style={{transform: `scale(${1 + (dive - 1) * 0.15})`, opacity: lerp(f, 66, 80, 1, 0)}}>
        <div style={{position: 'absolute', top: 330, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14}}>
          {words.map((w, i) => {
            const s = sp(f, w.at, 30, {damping: 12, stiffness: 200});
            return (
              <div key={i} style={{opacity: f >= w.at ? 1 : 0, transform: `translateY(${(1 - s) * 120}px) rotate(${(1 - s) * -24}deg)`}}>
                <Display size={w.size} color={w.c}>
                  {w.t}
                </Display>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </Fill>
  );
};
