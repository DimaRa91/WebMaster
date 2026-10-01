import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {C, F} from '../theme';
import {Display, Fill, Grid, Mono, easeInOut, easeOut, lerp, punch, sp} from '../lib';

/* ---------- China: Guangzhou → Moscow, three modes (120f) ---------- */
type Pt = {x: number; y: number};
const MSK: Pt = {x: 410, y: 640};
const GZ: Pt = {x: 800, y: 880};
const ROUTES = [
  {k: 'rail', label: 'ЖД', ctl: {x: 700, y: 520}, at: 8, col: C.cream},
  {k: 'auto', label: 'АВТО', ctl: {x: 500, y: 1000}, at: 30, col: C.orange},
  {k: 'air', label: 'АВИА', ctl: {x: 580, y: 330}, at: 52, col: C.cobalt},
];
const qp = (a: Pt, c: Pt, b: Pt, t: number): Pt => ({
  x: (1 - t) ** 2 * a.x + 2 * (1 - t) * t * c.x + t * t * b.x,
  y: (1 - t) ** 2 * a.y + 2 * (1 - t) * t * c.y + t * t * b.y,
});

const Plane: React.FC<{p: Pt; angle: number}> = ({p, angle}) => (
  <svg width={70} height={70} viewBox="0 0 100 100" style={{position: 'absolute', left: p.x - 35, top: p.y - 35, transform: `rotate(${angle}deg)`}}>
    <path d="M 95 50 L 60 42 L 38 8 L 28 8 L 40 42 L 16 44 L 8 32 L 2 32 L 6 50 L 2 68 L 8 68 L 16 56 L 40 58 L 28 92 L 38 92 L 60 58 Z" fill={C.cream} />
  </svg>
);

export const China: React.FC<{f: number}> = ({f}) => {
  const title = sp(f, 0, 30, {damping: 12, stiffness: 220});
  const rows = [
    {mode: 'ЖД', d: '35–45', u: 'ДНЕЙ', col: C.cream, at: 22},
    {mode: 'АВТО', d: '25–30', u: 'ДНЕЙ', col: C.orange, at: 44},
    {mode: 'АВИА', d: 'ОРГАНИЗУЕМ', u: '', col: C.cobalt, at: 66},
  ];
  return (
    <Fill bg={C.ink}>
      <AbsoluteFill style={{backgroundImage: `radial-gradient(${C.cream}26 2.6px, transparent 3px)`, backgroundSize: '40px 40px', backgroundPosition: `${-f * 0.6}px 0`}} />
      <div style={{position: 'absolute', top: 290, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `translateY(${(1 - title) * -70}px)`, opacity: title}}>
        <Display size={80} color={C.cream}>
          {'+ КИТАЙ'}
        </Display>
        <Display size={80} color={C.orange} style={{marginTop: 8}}>
          {'ГУАНЧЖОУ'}
        </Display>
      </div>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {ROUTES.map((r, i) => {
          const t = lerp(f, r.at, r.at + 24, 0, 1, easeInOut);
          const d = `M ${GZ.x} ${GZ.y} Q ${r.ctl.x} ${r.ctl.y} ${MSK.x} ${MSK.y}`;
          return (
            <g key={i}>
              <path
                d={d}
                fill="none"
                stroke={r.col}
                strokeWidth={r.k === 'air' ? 6 : 10}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={`${t} 1`}
              />
            </g>
          );
        })}
        <circle cx={GZ.x} cy={GZ.y} r={30 * sp(f, 2, 30, {damping: 9})} fill={C.orange} stroke={C.cream} strokeWidth={6} />
        <circle cx={MSK.x} cy={MSK.y} r={30 * sp(f, 26, 30, {damping: 9})} fill={C.cream} />
      </svg>
      {ROUTES.map((r, i) => {
        const t = lerp(f, r.at, r.at + 24, 0, 1, easeInOut);
        if (t <= 0) return null;
        const mid = qp(GZ, r.ctl, MSK, 0.5);
        const pop = sp(f, r.at + 12, 30, {damping: 10, stiffness: 280});
        return (
          <div key={i} style={{position: 'absolute', left: mid.x, top: mid.y, transform: `translate(-50%, -50%) scale(${pop})`, background: r.col, padding: '6px 14px', borderRadius: 8}}>
            <Display size={30} color={r.col === C.cream ? C.ink : r.col === C.cobalt ? C.cream : C.ink}>
              {r.label}
            </Display>
          </div>
        );
      })}
      {(() => {
        const air = ROUTES[2];
        const t = lerp(f, air.at, air.at + 24, 0, 1, easeInOut);
        if (t <= 0 || t >= 1) return null;
        const p = qp(GZ, air.ctl, MSK, t);
        const p2 = qp(GZ, air.ctl, MSK, Math.min(1, t + 0.01));
        const ang = (Math.atan2(p2.y - p.y, p2.x - p.x) * 180) / Math.PI;
        return <Plane p={p} angle={ang} />;
      })()}
      <div style={{position: 'absolute', right: 1080 - 940, top: GZ.y + 50, opacity: lerp(f, 4, 10, 0, 1)}}>
        <Display size={44} color={C.cream}>
          {'ГУАНЧЖОУ'}
        </Display>
      </div>
      <div style={{position: 'absolute', right: 1080 - (MSK.x - 44), top: MSK.y - 22, opacity: lerp(f, 26, 32, 0, 1)}}>
        <Display size={44} color={C.cream}>
          {'МОСКВА'}
        </Display>
      </div>
      {/* timetable */}
      {rows.map((row, i) => {
        const s = sp(f, row.at, 30, {damping: 14, stiffness: 240});
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 110,
              width: 850,
              top: 1110 + i * 106,
              height: 92,
              background: '#1B1C25',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 26px',
              boxSizing: 'border-box',
              clipPath: `inset(0 ${(1 - s) * 100}% 0 0)`,
              borderLeft: `14px solid ${row.col}`,
            }}
          >
            <Display size={40} color={C.cream}>
              {row.mode}
            </Display>
            <div style={{display: 'flex', alignItems: 'baseline', gap: 12}}>
              <Display size={50} color={row.col === C.cobalt ? '#7F8CFF' : row.col}>
                {row.d}
              </Display>
              <Mono size={24} color={C.cream}>
                {row.u}
              </Mono>
            </div>
          </div>
        );
      })}
    </Fill>
  );
};

/* ---------- personal manager: messenger mock (120f) ---------- */
const MSGS = [
  {me: false, at: 10, t: 'Добрый день! 2 паллеты из Гуанчжоу. Сколько по срокам?'},
  {me: true, at: 34, t: 'Здравствуйте! Авто 25–30 дней, ЖД 35–45.'},
  {me: true, at: 56, t: 'Проверю коды ТН ВЭД и пришлю расчёт до склада в Москве.'},
  {me: true, at: 78, t: 'Марки «Честный знак» тоже закажем ✓'},
];

export const Chat: React.FC<{f: number}> = ({f}) => {
  const title = sp(f, 0, 30, {damping: 12, stiffness: 220});
  const phone = sp(f, 2, 30, {damping: 14, stiffness: 140});
  const typing = MSGS.find((m) => m.me && f >= m.at - 12 && f < m.at);
  return (
    <Fill bg={C.cobalt}>
      <Grid color={C.cream} opacity={0.08} size={60} />
      <div style={{position: 'absolute', top: 280, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `translateY(${(1 - title) * -70}px)`, opacity: title}}>
        <Display size={70} color={C.cream}>
          {'ПЕРСОНАЛЬНЫЙ'}
        </Display>
        <Display size={70} color={C.orange} style={{marginTop: 8}}>
          {'МЕНЕДЖЕР'}
        </Display>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 130,
          width: 820,
          top: 500,
          height: 920,
          borderRadius: 48,
          background: C.cream,
          boxShadow: `18px 18px 0 ${C.ink}`,
          transform: `translateY(${(1 - phone) * 900}px) rotate(${(1 - phone) * 8}deg)`,
          overflow: 'hidden',
          fontFamily: F.body,
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', gap: 18, padding: '26px 32px', background: C.ink}}>
          <div style={{width: 64, height: 64, borderRadius: 64, background: C.orange, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.display, fontWeight: 900, fontSize: 28, color: C.ink}}>М</div>
          <div>
            <div style={{fontWeight: 700, fontSize: 30, color: C.cream}}>Ваш менеджер</div>
            <div style={{fontFamily: F.mono, fontSize: 20, color: '#7CFFB0', fontWeight: 500}}>{typing ? 'печатает…' : 'на связи'}</div>
          </div>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 18, padding: '30px 28px'}}>
          {MSGS.filter((m) => f >= m.at).map((m, i) => {
            const s = sp(f, m.at, 30, {damping: 13, stiffness: 260});
            return (
              <div
                key={i}
                style={{
                  alignSelf: m.me ? 'flex-start' : 'flex-end',
                  maxWidth: 600,
                  background: m.me ? C.ink : C.orange,
                  color: m.me ? C.cream : C.ink,
                  fontSize: 33,
                  fontWeight: 600,
                  lineHeight: 1.3,
                  padding: '18px 24px',
                  borderRadius: m.me ? '8px 28px 28px 28px' : '28px 8px 28px 28px',
                  transform: `translateY(${(1 - s) * 40}px) scale(${0.85 + 0.15 * s})`,
                  transformOrigin: m.me ? 'left top' : 'right top',
                  opacity: s,
                }}
              >
                {m.t}
              </div>
            );
          })}
          {typing && (
            <div style={{alignSelf: 'flex-start', background: C.ink, borderRadius: 28, padding: '20px 26px', display: 'flex', gap: 10}}>
              {[0, 1, 2].map((k) => (
                <div key={k} style={{width: 14, height: 14, borderRadius: 14, background: C.cream, opacity: 0.35 + 0.65 * Math.max(0, Math.sin((f - k * 3) * 0.5))}} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Fill>
  );
};

/* ---------- weekly departures (60f) ---------- */
export const Weekly: React.FC<{f: number}> = ({f}) => {
  const weeks = ['НЕДЕЛЯ 1', 'НЕДЕЛЯ 2', 'НЕДЕЛЯ 3', 'НЕДЕЛЯ 4'];
  return (
    <Fill bg={C.cream}>
      <Grid color={C.ink} opacity={0.06} size={50} />
      <div style={{position: 'absolute', top: 290, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <Display size={92} color={C.ink}>
          {'ОТПРАВКИ'}
        </Display>
        <div style={{background: C.ink, padding: '10px 24px', marginTop: 14, transform: `rotate(-2deg) scale(${punch(f, [0, 30], 0.05)})`}}>
          <Display size={70} color={C.orange}>
            {'КАЖДУЮ НЕДЕЛЮ'}
          </Display>
        </div>
      </div>
      <div style={{position: 'absolute', top: 640, left: 110, width: 850, display: 'flex', flexDirection: 'column', gap: 22}}>
        {weeks.map((w, i) => {
          const at = 6 + i * 11;
          const go = interpolate(f, [at, at + 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut});
          const stamp = sp(f, at + 8, 30, {damping: 9, stiffness: 320});
          return (
            <div key={i} style={{height: 150, borderRadius: 20, border: `5px solid ${C.ink}`, position: 'relative', overflow: 'hidden', background: '#FBF8F1'}}>
              <Mono size={26} color={C.ink} style={{position: 'absolute', left: 26, top: 22}}>
                {w}
              </Mono>
              {/* road */}
              <div style={{position: 'absolute', left: 0, right: 0, bottom: 34, height: 6, background: C.ink, opacity: 0.15}} />
              {/* mini truck */}
              <div style={{position: 'absolute', bottom: 40, left: interpolate(go, [0, 1], [-260, 250]), width: 230, height: 80}}>
                <div style={{position: 'absolute', left: 0, top: 0, width: 160, height: 66, background: C.orange, border: `4px solid ${C.ink}`, boxSizing: 'border-box'}} />
                <div style={{position: 'absolute', left: 166, top: 18, width: 58, height: 48, background: C.ink, borderRadius: '4px 20px 4px 4px'}} />
                {[30, 120, 196].map((x) => (
                  <div key={x} style={{position: 'absolute', left: x - 12, top: 58, width: 24, height: 24, borderRadius: 24, background: C.ink}} />
                ))}
              </div>
              {f >= at + 8 && (
                <div style={{position: 'absolute', right: 26, top: 36, border: `5px solid ${C.cobalt}`, padding: '6px 14px', transform: `rotate(-8deg) scale(${interpolate(stamp, [0, 1], [2.2, 1])})`, opacity: Math.min(1, stamp * 3)}}>
                  <Display size={34} color={C.cobalt}>
                    {'ОТПРАВЛЕНО'}
                  </Display>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Fill>
  );
};

/* ---------- recap checklist (150f) ---------- */
const RECAP = [
  'Европа и Китай → Москва',
  'Авто, ЖД и авиа',
  'От одной коробки',
  'Белая растаможка, все документы',
  'Проверка санкционных кодов',
  'Марки «Честный знак»',
  'Отправки каждую неделю',
  'Персональный менеджер',
];

export const Recap: React.FC<{f: number}> = ({f}) => {
  const title = sp(f, 0, 30, {damping: 12, stiffness: 220});
  return (
    <Fill bg={C.ink}>
      <Grid color={C.cream} opacity={0.05} size={60} />
      <div style={{position: 'absolute', top: 290, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${interpolate(title, [0, 1], [1.4, 1])})`, opacity: title}}>
        <Display size={88} color={C.cream}>
          {'ВСЁ'}
        </Display>
        <Display size={88} color={C.orange} style={{marginTop: 8}}>
          {'ПОД КЛЮЧ'}
        </Display>
      </div>
      <div style={{position: 'absolute', top: 560, left: 110, width: 850, display: 'flex', flexDirection: 'column', gap: 16}}>
        {RECAP.map((r, i) => {
          const at = 10 + i * 12;
          const s = sp(f, at, 30, {damping: 13, stiffness: 260});
          const tick = sp(f, at + 4, 30, {damping: 8, stiffness: 320});
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 24, height: 88, opacity: f >= at ? 1 : 0.12, transform: `translateX(${(1 - s) * -80}px)`}}>
              <div style={{width: 64, height: 64, flex: '0 0 64px', borderRadius: 14, background: f >= at + 4 ? C.orange : 'transparent', border: `5px solid ${C.orange}`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <svg width={40} height={40} viewBox="0 0 40 40" style={{transform: `scale(${f >= at + 4 ? tick : 0})`}}>
                  <path d="M 6 21 L 16 31 L 34 10" fill="none" stroke={C.ink} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 38, color: C.cream, lineHeight: 1.1}}>{r}</div>
            </div>
          );
        })}
      </div>
    </Fill>
  );
};
