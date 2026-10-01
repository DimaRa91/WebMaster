import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame} from 'remotion';
import {C, F, SAFE_CY} from '../theme';
import {Display, Fill, Grid, Marquee, Mono, Tape, easeIn, easeOut, lerp, punch, shake, sp} from '../lib';

// local 0–180 (global 90–270)
// 0   САНКЦИИ stamp
// 60  broken route  (5.0s)
// 90/105/120/135 pains (6.0–7.5s)
// 150 freeze/glitch "бизнес на паузе"
// 165–180 drop out

const Stamp: React.FC<{f: number}> = ({f}) => {
  const s = sp(f, 0, 30, {damping: 9, stiffness: 300, mass: 0.6});
  const sc = interpolate(s, [0, 1], [3.2, 1]);
  const sh = shake(f, [0, 30], 46, 6);
  const tapeA = lerp(f, 8, 22, 0, 1, easeOut);
  const tapeB = lerp(f, 16, 30, 0, 1, easeOut);
  const zoom = lerp(f, 0, 60, 1, 1.12, (t) => t);
  return (
    <Fill bg={C.red}>
      {/* texture rows */}
      <AbsoluteFill style={{justifyContent: 'center', gap: 0, opacity: 0.22, transform: `rotate(-8deg) scale(1.3)`}}>
        {new Array(9).fill(0).map((_, i) => (
          <Marquee key={i} text="САНКЦИИ ✕ ОГРАНИЧЕНИЯ ✕" size={150} color={C.ink} outline speed={i % 2 ? 9 : -9} offset={i * 300} />
        ))}
      </AbsoluteFill>
      <AbsoluteFill style={{transform: `translate(${sh.x}px, ${sh.y}px) scale(${zoom * punch(f, [30], 0.05)})`}}>
        <Tape text="ЗАПРЕЩЕНО" bg={C.ink} fg={C.cream} speed={14} angle={-11} y={SAFE_CY - 470} progress={tapeA} />
        <Tape text="ОГРАНИЧЕНО" bg={C.cream} fg={C.ink} speed={-14} angle={9} y={SAFE_CY + 330} progress={tapeB} />
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', top: SAFE_CY - 960}}>
          <div style={{transform: `scale(${sc}) rotate(${-6 + (1 - s) * -10}deg)`, opacity: Math.min(1, s * 4)}}>
            <div style={{border: `16px solid ${C.ink}`, padding: '30px 34px 26px', background: 'rgba(229,0,15,0.0)'}}>
              <Display size={112} color={C.ink} split={Math.max(0, 18 * (1 - f / 10))}>
                САНКЦИИ
              </Display>
            </div>
          </div>
          <Mono size={30} color={C.ink} style={{marginTop: 34, opacity: lerp(f, 12, 20, 0, 1), transform: 'rotate(-6deg)'}}>
            {'// 2022 → СЕГОДНЯ'}
          </Mono>
        </AbsoluteFill>
      </AbsoluteFill>
    </Fill>
  );
};

const Broken: React.FC<{f: number}> = ({f}) => {
  // f local 0..30
  const draw = lerp(f, 0, 6, 0, 1);
  const breakT = lerp(f, 6, 30, 0, 1, easeIn);
  const xs = sp(f, 6, 30, {damping: 8, stiffness: 300});
  const sh = shake(f, [6], 36);
  return (
    <Fill bg={C.ink}>
      <Grid color={C.cream} opacity={0.06} />
      <AbsoluteFill style={{transform: `translate(${sh.x}px, ${sh.y}px)`}}>
        <Center2 top={SAFE_CY - 470}>
          <Display size={92} color={C.cream}>
            {'ПРЯМОЙ ПУТЬ'}
          </Display>
          <Display size={92} color={C.red} style={{marginTop: 10}}>
            {'ЗАКРЫТ'}
          </Display>
        </Center2>
        {/* route */}
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
          <g transform={`translate(0 ${SAFE_CY + 80})`}>
            <g transform={`translate(${-breakT * 40} ${breakT * breakT * 500}) rotate(${-breakT * 25} 180 0)`}>
              <line x1={180} y1={0} x2={180 + 360 * draw} y2={0} stroke={C.orange} strokeWidth={14} strokeDasharray="34 18" />
            </g>
            <g transform={`translate(${breakT * 40} ${breakT * breakT * 600}) rotate(${breakT * 30} 900 0)`}>
              {draw >= 1 && <line x1={540} y1={0} x2={900} y2={0} stroke={C.orange} strokeWidth={14} strokeDasharray="34 18" />}
            </g>
            <circle cx={180} cy={0} r={26} fill={C.cream} />
            <circle cx={900} cy={0} r={26} fill={C.cream} />
          </g>
        </svg>
        <Mono size={34} color={C.cream} style={{position: 'absolute', left: 110, top: SAFE_CY + 140}}>
          ЕВРОПА
        </Mono>
        <Mono size={34} color={C.cream} style={{position: 'absolute', right: 110, top: SAFE_CY + 140}}>
          РОССИЯ
        </Mono>
        {f >= 6 && (
          <div
            style={{
              position: 'absolute',
              left: 540 - 130,
              top: SAFE_CY + 80 - 130,
              width: 260,
              height: 260,
              transform: `scale(${interpolate(xs, [0, 1], [3, 1])}) rotate(${(1 - xs) * 40}deg)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: F.display,
              fontWeight: 900,
              fontSize: 300,
              color: C.red,
              lineHeight: 1,
            }}
          >
            ✕
          </div>
        )}
      </AbsoluteFill>
    </Fill>
  );
};

const Center2: React.FC<{top: number; children: React.ReactNode}> = ({top, children}) => (
  <div style={{position: 'absolute', top, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>{children}</div>
);

// Each pain is answered later by a matching solution card (Drop → Benefits).
const PAINS = [
  {bg: C.ink, fg: C.red, a: 'КАК ОПЛАТИТЬ', b: 'ИНВОЙС?', n: '01', sa: 74, sb: 128},
  {bg: C.red, fg: C.ink, a: 'МАЛЕНЬКИЙ', b: 'ОБЪЁМ?', n: '02', sa: 96, sb: 170},
  {bg: C.cream, fg: C.ink, a: 'ТАМОЖНЯ', b: 'СЕРАЯ?', n: '03', sa: 120, sb: 160},
  {bg: C.ink, fg: C.cream, a: 'ДОКУМЕНТЫ', b: 'ХАОС', n: '04', sa: 92, sb: 210},
];

const Pain: React.FC<{f: number; i: number}> = ({f, i}) => {
  const p = PAINS[i];
  const s = sp(f, 0, 30, {damping: 10, stiffness: 320, mass: 0.5});
  const sh = shake(f, [0], 24, 5);
  const jit = (k: number, amp: number) => (random(`j${i}${k}${Math.floor(f / 2)}`) - 0.5) * amp;
  let hero: React.ReactNode;
  if (i === 0) {
    hero = (
      <Display size={p.sb} color={C.cream} split={Math.max(3, 16 * (1 - f / 8))}>
        {p.b}
      </Display>
    );
  } else if (i === 1) {
    // "маленький объём" — the word itself shrinks
    hero = (
      <div style={{transform: `scale(${lerp(f, 2, 12, 1.15, 0.62)})`}}>
        <Display size={p.sb} color={C.cream}>
          {p.b}
        </Display>
      </div>
    );
  } else if (i === 2) {
    // "серая" — literally grey, flickering
    hero = (
      <div style={{transform: `translate(${jit(0, 18)}px, ${jit(1, 10)}px)`, opacity: 0.75 + jit(2, 0.5)}}>
        <Display size={p.sb} color={C.grey}>
          {p.b}
        </Display>
      </div>
    );
  } else {
    hero = (
      <div style={{position: 'relative'}}>
        {[0, 1, 2].map((k) => (
          <div key={k} style={{position: k ? 'absolute' : 'relative', inset: 0, transform: `rotate(${(k - 1) * 9 * s}deg) translate(${(k - 1) * 30}px, ${k * 8}px)`, opacity: k === 1 ? 1 : 0.4}}>
            <Display size={p.sb} color={k === 1 ? C.orange : C.cream} stroke={k === 1 ? undefined : C.cream}>
              {p.b}
            </Display>
          </div>
        ))}
      </div>
    );
  }
  return (
    <Fill bg={p.bg}>
      <Grid color={p.fg} opacity={0.08} size={60} />
      <AbsoluteFill style={{transform: `translate(${sh.x}px, ${sh.y}px)`}}>
        <Mono size={30} color={p.fg} style={{position: 'absolute', left: 100, top: 300}}>{`ПРОБЛЕМА ${p.n}/04`}</Mono>
        <Center2 top={SAFE_CY - 170}>
          <div style={{transform: `translateX(${(1 - s) * (i % 2 ? 600 : -600)}px)`}}>
            <Display size={p.sa} color={p.fg}>
              {p.a}
            </Display>
          </div>
          <div style={{transform: `scale(${interpolate(s, [0, 1], [1.8, 1])})`, marginTop: 24}}>{hero}</div>
        </Center2>
      </AbsoluteFill>
    </Fill>
  );
};

const Freeze: React.FC<{f: number}> = ({f}) => {
  // f 0..30 — glitch slices, pause icon, then drop away
  const slices = 14;
  const drop = lerp(f, 18, 30, 0, 1, easeIn);
  const glitchAmt = f < 4 ? 1 : f < 18 ? 0.25 + 0.25 * Math.sin(f) : 0.1;
  return (
    <Fill bg={C.ink}>
      <AbsoluteFill style={{transform: `translateY(${drop * 1920}px) rotate(${drop * 6}deg)`}}>
        {new Array(slices).fill(0).map((_, k) => {
          const h = 1920 / slices;
          const off = (random(`s${k}-${Math.floor(f / 2)}`) - 0.5) * 160 * glitchAmt;
          return (
            <div key={k} style={{position: 'absolute', left: 0, right: 0, top: k * h, height: h, overflow: 'hidden'}}>
              <div style={{position: 'absolute', left: off, top: -k * h, width: 1080, height: 1920, background: C.cream}}>
                <div style={{position: 'absolute', top: SAFE_CY - 430, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                  <div style={{display: 'flex', gap: 46, marginBottom: 60}}>
                    <div style={{width: 70, height: 250, background: C.red}} />
                    <div style={{width: 70, height: 250, background: C.red}} />
                  </div>
                  <Display size={88} color={C.ink}>
                    {'ВАШ БИЗНЕС'}
                  </Display>
                  <Display size={88} color={C.red} style={{marginTop: 12}}>
                    {'НА ПАУЗЕ?'}
                  </Display>
                </div>
              </div>
            </div>
          );
        })}
        {/* scanlines */}
        <AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.08) 0 2px, transparent 2px 6px)'}} />
        <Mono size={28} color={C.ink} style={{position: 'absolute', left: 100, top: 300, opacity: f % 6 < 3 ? 1 : 0.2}}>
          ● REC  ПАУЗА
        </Mono>
      </AbsoluteFill>
    </Fill>
  );
};

export const Sanctions: React.FC = () => {
  const f = useCurrentFrame();
  if (f < 60) return <Stamp f={f} />;
  if (f < 90) return <Broken f={f - 60} />;
  if (f < 150) {
    const i = Math.floor((f - 90) / 15);
    return <Pain f={(f - 90) % 15} i={i} />;
  }
  return <Freeze f={f - 150} />;
};
