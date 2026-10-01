import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, F, SAFE_CY} from '../theme';
import {Display, Fill, Logo, Mono, easeOut, lerp, shake, sp} from '../lib';

// local 0–180 (global 720–900 = 24–30s)
// 0–60  build: "СКОЛЬКО СТОИТ ВАША ДОСТАВКА?" + slot-machine digits
// 60    FINAL HIT → clean end card; tap on the button at 105 (27.5s)

const Slot: React.FC<{f: number; seed: number}> = ({f, seed}) => {
  const speed = 1 + f * 0.05;
  const v = Math.floor(f * speed + seed * 7) % 10;
  const blur = Math.min(8, 2 + f * 0.12);
  return (
    <div style={{width: 120, height: 190, background: C.cream, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
      <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 150, color: C.ink, filter: `blur(${blur}px)`, transform: `translateY(${((f * 37 + seed * 50) % 60) - 30}px)`}}>{v}</div>
    </div>
  );
};

const Build: React.FC<{f: number}> = ({f}) => {
  const zoom = lerp(f, 0, 60, 1, 1.1, (t) => t * t);
  const rollHits = [];
  for (let k = 30; k < 60; k += Math.max(2, 6 - Math.floor((k - 30) / 6))) rollHits.push(k);
  const sh = shake(f, [0, 15, 30, 45, ...rollHits], 6, 3);
  return (
    <Fill bg={C.ink}>
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 50%, ${C.cobalt}55, transparent 60%)`, opacity: lerp(f, 0, 60, 0.2, 1)}} />
      <AbsoluteFill style={{transform: `translate(${sh.x}px, ${sh.y}px) scale(${zoom})`}}>
        <div style={{position: 'absolute', top: SAFE_CY - 340, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          {['СКОЛЬКО', 'СТОИТ ВАША', 'ДОСТАВКА?'].map((w, i) => {
            const s = sp(f, i * 8, 30, {damping: 12, stiffness: 240});
            return (
              <div key={i} style={{transform: `translateY(${(1 - s) * 100}px)`, opacity: s, marginTop: i ? 10 : 0}}>
                <Display size={i === 1 ? 82 : 92} color={i === 2 ? C.orange : C.cream}>
                  {w}
                </Display>
              </div>
            );
          })}
          <div style={{display: 'flex', gap: 16, marginTop: 70, alignItems: 'center', opacity: lerp(f, 10, 16, 0, 1)}}>
            <Display size={110} color={C.cream}>
              €
            </Display>
            {[0, 1, 2].map((k) => (
              <Slot key={k} f={f} seed={k + 1} />
            ))}
            <Display size={110} color={C.orange}>
              ?
            </Display>
          </div>
        </div>
      </AbsoluteFill>
      {/* strobe on the roll */}
      <AbsoluteFill style={{background: C.cream, opacity: f > 40 && f % 4 === 0 ? 0.12 : 0}} />
    </Fill>
  );
};

const Social: React.FC<{k: 'ig' | 'tt' | 'yt'; color: string}> = ({k, color}) => (
  <svg width={64} height={64} viewBox="0 0 64 64">
    {k === 'ig' && (
      <>
        <rect x={6} y={6} width={52} height={52} rx={16} fill="none" stroke={color} strokeWidth={6} />
        <circle cx={32} cy={32} r={12} fill="none" stroke={color} strokeWidth={6} />
        <circle cx={47} cy={17} r={4} fill={color} />
      </>
    )}
    {k === 'tt' && <path d="M 36 6 L 36 42 A 10 10 0 1 1 26 32 M 36 6 C 38 16 46 22 54 22" fill="none" stroke={color} strokeWidth={7} strokeLinecap="round" />}
    {k === 'yt' && (
      <>
        <rect x={4} y={12} width={56} height={40} rx={12} fill={color} />
        <path d="M 27 22 L 42 32 L 27 42 Z" fill={C.cream} />
      </>
    )}
  </svg>
);

const EndCard: React.FC<{f: number}> = ({f}) => {
  // f: 0 = final hit
  const logo = sp(f, 0, 30, {damping: 10, stiffness: 200});
  const t1 = sp(f, 4, 30, {damping: 14, stiffness: 200});
  const t2 = sp(f, 8, 30, {damping: 14, stiffness: 200});
  const btn = sp(f, 12, 30, {damping: 9, stiffness: 220});
  const soc = sp(f, 18, 30, {damping: 14, stiffness: 200});
  const sh = shake(f, [0], 22, 5);
  // cursor tap at f=45
  const TAP = 45;
  const cur = sp(f, 28, 30, {damping: 16, stiffness: 120});
  const press = f >= TAP ? 1 - 0.07 * Math.exp(-(f - TAP) / 3) * (f - TAP < 3 ? 1 : 1) : 1;
  const ripple = f >= TAP ? (f - TAP) / 18 : 0;
  const btnTop = SAFE_CY - 40;
  // shine sweep once
  const shine = lerp(f, 52, 72, -0.3, 1.3);

  return (
    <Fill bg={C.cream}>
      {/* subtle brand stripe — ONE accent, keep the card clean */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 14, background: C.orange}} />
      <AbsoluteFill style={{transform: `translate(${sh.x}px, ${sh.y}px)`}}>
        <div style={{position: 'absolute', top: 300, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <div style={{transform: `scale(${interpolate(logo, [0, 1], [0.3, 1])})`}}>
            <Logo size={190} t={lerp(f, 0, 14, 0, 1, easeOut)} />
          </div>
          <div style={{marginTop: 34, transform: `translateY(${(1 - t1) * 60}px)`, opacity: t1}}>
            <Display size={70} color={C.ink}>
              {'СБОРНЫЕ ГРУЗЫ'}
            </Display>
          </div>
          <div style={{marginTop: 18, transform: `translateY(${(1 - t2) * 60}px)`, opacity: t2, display: 'flex', alignItems: 'center', gap: 22}}>
            <Mono size={34} color={C.ink}>
              {'ИТАЛИЯ · ЕВРОПА'}
            </Mono>
            <div style={{width: 90, height: 8, background: C.orange, position: 'relative'}}>
              <div style={{position: 'absolute', right: -6, top: -12, width: 0, height: 0, borderLeft: `24px solid ${C.orange}`, borderTop: '16px solid transparent', borderBottom: '16px solid transparent'}} />
            </div>
            <Mono size={34} color={C.ink}>
              МОСКВА
            </Mono>
          </div>
        </div>

        {/* CTA button */}
        <div style={{position: 'absolute', top: btnTop, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
          <div style={{position: 'relative', transform: `scale(${interpolate(btn, [0, 1], [0.6, 1]) * press})`, opacity: Math.min(1, btn * 2)}}>
            {ripple > 0 && ripple < 1 && (
              <div style={{position: 'absolute', inset: -40 * ripple, borderRadius: 40 + 40 * ripple, border: `6px solid ${C.orange}`, opacity: 1 - ripple}} />
            )}
            <div
              style={{
                width: 860,
                padding: '46px 30px 50px',
                borderRadius: 36,
                background: C.orange,
                boxShadow: `0 ${f >= TAP && f < TAP + 4 ? 4 : 16}px 0 ${C.ink}`,
                transform: `translateY(${f >= TAP && f < TAP + 4 ? 12 : 0}px)`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
                overflow: 'hidden',
                border: `6px solid ${C.ink}`,
                boxSizing: 'border-box',
              }}
            >
              <div style={{position: 'absolute', top: 0, bottom: 0, width: 160, left: `${shine * 100}%`, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)', transform: 'skewX(-20deg)'}} />
              <Display size={68} color={C.ink}>
                {'РАССЧИТАТЬ'}
              </Display>
              <Display size={46} color={C.ink} style={{marginTop: 14}}>
                {'СТОИМОСТЬ ДОСТАВКИ'}
              </Display>
            </div>
          </div>
        </div>

        {/* what to send */}
        <div
          style={{
            position: 'absolute',
            top: btnTop + 262,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontFamily: F.body,
            fontWeight: 700,
            fontSize: 31,
            lineHeight: 1.35,
            color: C.ink,
            opacity: soc * 0.85,
            transform: `translateY(${(1 - soc) * 30}px)`,
          }}
        >
          Пришлите инвойс или список товаров —
          <br />
          подготовим расчёт до склада в Москве
        </div>

        {/* cursor */}
        {f >= 28 && (
          <div
            style={{
              position: 'absolute',
              left: interpolate(cur, [0, 1], [1100, 700]),
              top: interpolate(cur, [0, 1], [1500, btnTop + 150]),
              transform: `scale(${f >= TAP && f < TAP + 5 ? 0.85 : 1}) rotate(-12deg)`,
              opacity: lerp(f, 80, 96, 1, 0),
            }}
          >
            <svg width={96} height={120} viewBox="0 0 24 30">
              <path d="M 2 2 L 2 24 L 8 18 L 12 28 L 16 26 L 12 17 L 20 17 Z" fill={C.ink} stroke={C.cream} strokeWidth={1.5} strokeLinejoin="round" />
            </svg>
          </div>
        )}

        {/* socials */}
        <div style={{position: 'absolute', top: 1310, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: soc, transform: `translateY(${(1 - soc) * 40}px)`}}>
          <div style={{display: 'flex', gap: 44, alignItems: 'center'}}>
            {(['ig', 'tt', 'yt'] as const).map((k) => (
              <Social key={k} k={k} color={C.ink} />
            ))}
          </div>
          <Mono size={24} color={C.ink} style={{marginTop: 18, opacity: 0.7}}>
            {'INSTAGRAM · TIKTOK · YOUTUBE'}
          </Mono>
        </div>
      </AbsoluteFill>
    </Fill>
  );
};

export const Cta: React.FC = () => {
  const f = useCurrentFrame();
  if (f < 60) return <Build f={f} />;
  return <EndCard f={f - 60} />;
};

