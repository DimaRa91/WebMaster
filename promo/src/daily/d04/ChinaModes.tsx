import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';

// Day 04 — "3 способа привезти товар из Китая". Flat, bold infographic on yellow.
// 100 BPM: 1 beat = 18 frames, 1 bar = 72 frames. Events mirror music/compose_d04.py.

const K = {
  bg: '#FFD84D',
  ink: '#121212',
  paper: '#FFF8E1',
  rail: '#0FA3A3',
  auto: '#FF5A4E',
  air: '#6A4CFF',
  muted: '#8A7A3A',
};
const FONT = 'Rubik, sans-serif';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const sp = (f: number, at: number, cfg: object = {}) => spring({frame: f - at, fps: 30, config: {damping: 11, stiffness: 220, mass: 0.6, ...cfg}});
const ease = Easing.bezier(0.6, 0, 0.3, 1);

export const D04 = {
  hookIcons: [6, 24, 42],
  race: 72, // gun at 72, auto arrives 198, rail 252, plane crosses 100–150
  autoArrive: 198,
  railArrive: 252,
  chart: 288,
  list: 432,
  listStep: 36,
  cta: 648,
  total: 864,
};

/* ---------- icons ---------- */
export const Train: React.FC<{size: number; color: string}> = ({size, color}) => (
  <svg width={size} height={size * 0.7} viewBox="0 0 140 98">
    <rect x={6} y={10} width={128} height={64} rx={18} fill={color} />
    <rect x={20} y={22} width={30} height={22} rx={5} fill={K.paper} />
    <rect x={56} y={22} width={30} height={22} rx={5} fill={K.paper} />
    <rect x={92} y={22} width={30} height={22} rx={5} fill={K.paper} />
    <rect x={6} y={54} width={128} height={8} fill={K.ink} opacity={0.25} />
    <circle cx={34} cy={80} r={11} fill={K.ink} />
    <circle cx={106} cy={80} r={11} fill={K.ink} />
    <rect x={0} y={92} width={140} height={6} rx={3} fill={K.ink} />
  </svg>
);
export const TruckIcon: React.FC<{size: number; color: string}> = ({size, color}) => (
  <svg width={size} height={size * 0.7} viewBox="0 0 140 98">
    <rect x={4} y={14} width={88} height={58} rx={8} fill={color} />
    <path d="M 96 34 L 120 34 L 136 54 L 136 72 L 96 72 Z" fill={K.ink} />
    <rect x={104} y={40} width={16} height={12} rx={2} fill={K.paper} />
    <circle cx={30} cy={80} r={12} fill={K.ink} />
    <circle cx={112} cy={80} r={12} fill={K.ink} />
  </svg>
);
export const Plane: React.FC<{size: number; color: string}> = ({size, color}) => (
  <svg width={size} height={size * 0.7} viewBox="0 0 140 98">
    <path d="M 8 52 Q 8 40 24 40 L 120 40 Q 136 40 136 49 Q 136 58 120 58 L 24 58 Q 8 58 8 52 Z" fill={color} />
    <path d="M 58 40 L 82 6 L 96 6 L 86 40 Z M 58 58 L 82 92 L 96 92 L 86 58 Z M 14 40 L 6 22 L 18 22 L 30 40 Z" fill={color} />
    <circle cx={112} cy={49} r={4} fill={K.paper} />
    <circle cx={98} cy={49} r={4} fill={K.paper} />
  </svg>
);

const MODES = [
  {k: 'auto', name: 'АВТО', color: K.auto, Icon: TruckIcon, from: 25, to: 30, label: '25–30 ДНЕЙ'},
  {k: 'rail', name: 'ЖД', color: K.rail, Icon: Train, from: 35, to: 45, label: '35–45 ДНЕЙ'},
  {k: 'air', name: 'АВИА', color: K.air, Icon: Plane, from: 0, to: 0, label: 'СРОК — ПО ЗАПРОСУ'},
];

const Title: React.FC<{children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties}> = ({children, size = 90, color = K.ink, style}) => (
  <div style={{fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 0.95, color, textTransform: 'uppercase', letterSpacing: '-0.01em', ...style}}>{children}</div>
);

/* ---------- 0–72 hook ---------- */
const Hook: React.FC<{f: number}> = ({f}) => {
  const big = sp(f, -6, {damping: 9});
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 300, left: 90, right: 90}}>
        <div style={{display: 'flex', alignItems: 'flex-end', gap: 26, transform: `scale(${interpolate(big, [0, 1], [1.6, 1])})`, transformOrigin: 'left bottom'}}>
          <Title size={360}>3</Title>
          <Title size={120} style={{paddingBottom: 36}}>
            СПОСОБА
          </Title>
        </div>
        <Title size={70} style={{marginTop: 20, opacity: interpolate(f, [6, 14], [0, 1], clamp)}}>
          ПРИВЕЗТИ ТОВАР
        </Title>
        <Title size={70} style={{marginTop: 6, opacity: interpolate(f, [12, 20], [0, 1], clamp)}}>
          ИЗ <span style={{background: K.ink, color: K.bg, padding: '0 14px'}}>КИТАЯ</span>
        </Title>
      </div>
      <div style={{position: 'absolute', top: 1000, left: 90, right: 90, display: 'flex', justifyContent: 'space-between'}}>
        {MODES.map((m, i) => {
          const s = sp(f, D04.hookIcons[i], {damping: 8, stiffness: 300});
          return (
            <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, transform: `translateY(${(1 - s) * 260}px) rotate(${(1 - s) * 30}deg)`, opacity: Math.min(1, s * 2)}}>
              <div style={{width: 240, height: 240, borderRadius: 120, background: K.paper, border: `8px solid ${K.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <m.Icon size={170} color={m.color} />
              </div>
              <Title size={50}>{m.name}</Title>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ---------- 72–288 race ---------- */
const Race: React.FC<{f: number}> = ({f}) => {
  const g = f - D04.race;
  const day = Math.round(interpolate(f, [D04.race, D04.railArrive + 6], [0, 45], clamp));
  const x0 = 140;
  const x1 = 900;
  const posAuto = interpolate(f, [D04.race, D04.autoArrive], [0, 1], {...clamp, easing: Easing.bezier(0.3, 0, 0.6, 1)});
  const posRail = interpolate(f, [D04.race, D04.railArrive], [0, 1], {...clamp, easing: Easing.bezier(0.4, 0, 0.6, 1)});
  const posAir = interpolate(f, [D04.race + 18, D04.race + 60], [0, 1], {...clamp, easing: ease});
  const lanes = [
    {m: MODES[2], p: posAir, y: 640, stamp: f >= D04.race + 60 ? 'ПО ЗАПРОСУ' : ''},
    {m: MODES[0], p: posAuto, y: 900, stamp: f >= D04.autoArrive ? '25–30 ДНЕЙ' : ''},
    {m: MODES[1], p: posRail, y: 1160, stamp: f >= D04.railArrive ? '35–45 ДНЕЙ' : ''},
  ];
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 290, left: 90, right: 90, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end'}}>
        <div>
          <Title size={44} style={{color: K.muted}}>ГУАНЧЖОУ →</Title>
          <Title size={80}>МОСКВА</Title>
        </div>
        <div style={{textAlign: 'right', background: K.ink, borderRadius: 24, padding: '14px 24px'}}>
          <Title size={96} color={K.bg} style={{fontVariantNumeric: 'tabular-nums'}}>
            {g < 0 ? 0 : day}
          </Title>
          <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 26, color: K.paper}}>ДЕНЬ В ПУТИ</div>
        </div>
      </div>
      {/* finish line */}
      <div style={{position: 'absolute', left: x1 + 30, top: 560, width: 18, height: 760, backgroundImage: `repeating-linear-gradient(0deg, ${K.ink} 0 18px, ${K.paper} 18px 36px)`}} />
      {lanes.map((ln, i) => {
        const x = x0 + (x1 - x0 - 140) * ln.p;
        const bob = Math.sin((g + i * 7) * 0.9) * (ln.p > 0 && ln.p < 1 ? 4 : 0);
        const st = ln.stamp ? sp(f, ln.m.k === 'air' ? D04.race + 60 : ln.m.k === 'auto' ? D04.autoArrive : D04.railArrive, {damping: 8, stiffness: 320}) : 0;
        return (
          <div key={i}>
            <div style={{position: 'absolute', left: x0, width: x1 - x0 + 30, top: ln.y + 92, height: 12, borderRadius: 6, background: K.ink, opacity: 0.15}} />
            <div style={{position: 'absolute', left: x0, width: (x1 - x0) * ln.p, top: ln.y + 92, height: 12, borderRadius: 6, background: ln.m.color}} />
            <div style={{position: 'absolute', left: x, top: ln.y + bob}}>
              <ln.m.Icon size={140} color={ln.m.color} />
            </div>
            <Title size={36} color={ln.m.color} style={{position: 'absolute', left: x0, top: ln.y - 40}}>
              {ln.m.name}
            </Title>
            {ln.stamp && (
              <div style={{position: 'absolute', right: 140, top: ln.y - 52, background: ln.m.color, color: K.paper, borderRadius: 14, padding: '8px 16px', transform: `scale(${interpolate(st, [0, 1], [2, 1])}) rotate(-4deg)`, transformOrigin: 'right center'}}>
                <Title size={36} color={K.paper}>
                  {ln.stamp}
                </Title>
              </div>
            )}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ---------- 288–432 range chart ---------- */
const Chart: React.FC<{f: number}> = ({f}) => {
  const l = f - D04.chart;
  const axis0 = 120;
  const axisW = 800; // 0..50 days
  const dx = (d: number) => axis0 + (d / 50) * axisW;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 290, left: 90, right: 90}}>
        <Title size={84}>СРОКИ</Title>
        <Title size={84} color={K.paper} style={{WebkitTextStroke: `4px ${K.ink}`}}>
          ДО МОСКВЫ
        </Title>
      </div>
      <div style={{position: 'absolute', top: 580, left: 0, right: 0, height: 860}}>
        {[0, 10, 20, 30, 40, 50].map((d) => (
          <div key={d}>
            <div style={{position: 'absolute', left: dx(d), top: 0, width: 3, height: 760, background: K.ink, opacity: 0.12}} />
            <div style={{position: 'absolute', left: dx(d) - 30, width: 60, top: 772, textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 34, color: K.ink, opacity: interpolate(l, [0, 10], [0, 0.8], clamp)}}>{d}</div>
          </div>
        ))}
        <div style={{position: 'absolute', left: axis0, top: 816, fontFamily: FONT, fontWeight: 700, fontSize: 28, color: K.muted}}>ДНЕЙ В ПУТИ</div>
        {MODES.map((m, i) => {
          const at = 10 + i * 18;
          const s = interpolate(l, [at, at + 14], [0, 1], {...clamp, easing: ease});
          const y = 30 + i * 250;
          if (m.k === 'air') {
            return (
              <div key={i} style={{position: 'absolute', left: axis0, top: y, opacity: s}}>
                <Title size={40} color={m.color}>{m.name}</Title>
                <div style={{marginTop: 12, width: axisW * s, height: 86, borderRadius: 43, border: `6px dashed ${m.color}`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', paddingLeft: 30, overflow: 'hidden'}}>
                  <Title size={36} color={m.color} style={{whiteSpace: 'nowrap'}}>
                    СРОК — ПО ЗАПРОСУ
                  </Title>
                </div>
              </div>
            );
          }
          const left = dx(m.from);
          const full = dx(m.to) - dx(m.from);
          return (
            <div key={i}>
              <Title size={40} color={m.color} style={{position: 'absolute', left: axis0, top: y}}>
                {m.name}
              </Title>
              {/* dotted lead-in from 0 */}
              <div style={{position: 'absolute', left: axis0, top: y + 92, width: (left - axis0) * s, height: 6, backgroundImage: `repeating-linear-gradient(90deg, ${m.color} 0 14px, transparent 14px 26px)`}} />
              <div style={{position: 'absolute', left, top: y + 52, width: Math.max(0, full * interpolate(l, [at + 10, at + 22], [0, 1], {...clamp, easing: ease})), height: 86, borderRadius: 43, background: m.color, border: `6px solid ${K.ink}`, boxSizing: 'border-box'}} />
              <Title size={44} color={K.ink} style={{position: 'absolute', left: left + full + 24, top: y + 72, opacity: interpolate(l, [at + 20, at + 26], [0, 1], clamp), whiteSpace: 'nowrap'}}>
                {m.from}–{m.to}
              </Title>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ---------- 432–648 checklist ---------- */
const LIST = ['От одной коробки', 'Проверка санкционных кодов', 'Белая растаможка и все документы', 'Марки «Честный знак»', 'Персональный менеджер'];
const Checklist: React.FC<{f: number}> = ({f}) => (
  <AbsoluteFill>
    <div style={{position: 'absolute', top: 290, left: 90, right: 90}}>
      <Title size={64} style={{color: K.muted}}>
        ЧТО БЫ ВЫ
      </Title>
      <Title size={96}>НИ ВЫБРАЛИ</Title>
    </div>
    <div style={{position: 'absolute', top: 590, left: 90, right: 120, display: 'flex', flexDirection: 'column', gap: 32}}>
      {LIST.map((t, i) => {
        const at = D04.list + 18 + i * D04.listStep;
        const s = sp(f, at, {damping: 12, stiffness: 260});
        const colors = [K.auto, K.rail, K.air, K.auto, K.rail];
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 26, background: K.paper, border: `6px solid ${K.ink}`, borderRadius: 28, padding: '30px 28px', boxShadow: `10px 10px 0 ${K.ink}`, opacity: f >= at ? 1 : 0, transform: `translateX(${(1 - s) * -700}px) rotate(${(1 - s) * -6}deg)`}}>
            <div style={{width: 70, height: 70, flex: '0 0 70px', borderRadius: 35, background: colors[i], display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <svg width={42} height={42} viewBox="0 0 40 40">
                <path d="M 7 21 L 16 30 L 33 10" fill="none" stroke={K.paper} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 44, color: K.ink, lineHeight: 1.1}}>{t}</div>
          </div>
        );
      })}
    </div>
  </AbsoluteFill>
);

/* ---------- 648–864 CTA ---------- */
const Cta: React.FC<{f: number}> = ({f}) => {
  const s = sp(f, D04.cta, {damping: 9, stiffness: 240});
  const b = sp(f, D04.cta + 18, {damping: 9, stiffness: 260});
  const press = f >= D04.cta + 90 && f < D04.cta + 96 ? 0.95 : 1;
  return (
    <AbsoluteFill style={{background: K.ink}}>
      <div style={{position: 'absolute', top: 300, left: 90, right: 90, transform: `scale(${interpolate(s, [0, 1], [1.3, 1])})`, transformOrigin: 'left top', opacity: s}}>
        <Title size={70} color={K.bg}>
          НЕ ЗНАЕТЕ,
        </Title>
        <Title size={70} color={K.bg}>
          ЧТО ВЫБРАТЬ?
        </Title>
        <div style={{fontFamily: FONT, fontWeight: 500, fontSize: 40, color: K.paper, marginTop: 26, lineHeight: 1.3}}>
          Менеджер подберёт способ
          <br />
          под ваш груз и сроки
        </div>
      </div>
      <div style={{position: 'absolute', top: 880, left: 90, right: 120, display: 'flex', gap: 20, opacity: interpolate(f, [D04.cta + 8, D04.cta + 16], [0, 1], clamp)}}>
        {MODES.map((m, i) => (
          <div key={i} style={{flex: 1, height: 150, borderRadius: 24, background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `translateY(${Math.sin((f + i * 10) / 9) * 6}px)`}}>
            <m.Icon size={120} color={K.paper} />
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', top: 1110, left: 90, right: 120, transform: `scale(${interpolate(b, [0, 1], [0.5, 1]) * press})`, opacity: Math.min(1, b * 2)}}>
        <div style={{background: K.bg, borderRadius: 34, padding: '30px 20px 34px', textAlign: 'center', boxShadow: `0 ${press < 1 ? 4 : 14}px 0 #B8962A`}}>
          <Title size={64}>РАССЧИТАТЬ</Title>
          <Title size={44} style={{marginTop: 10}}>
            СТОИМОСТЬ ДОСТАВКИ
          </Title>
        </div>
        <div style={{fontFamily: FONT, fontWeight: 500, fontSize: 32, color: K.paper, textAlign: 'center', marginTop: 26, opacity: interpolate(f, [D04.cta + 40, D04.cta + 50], [0, 0.85], clamp)}}>
          Пришлите инвойс или список товаров
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const ChinaModes: React.FC = () => {
  const f = useCurrentFrame();
  // big wipe between sections: a coloured bar sweeps across on each section change
  const cuts = [D04.race, D04.chart, D04.list, D04.cta];
  let wipe = -1;
  let wipeColor = K.auto;
  cuts.forEach((c, i) => {
    if (f >= c - 6 && f < c + 6) {
      wipe = (f - (c - 6)) / 12;
      wipeColor = [K.rail, K.auto, K.air, K.ink][i];
    }
  });
  return (
    <AbsoluteFill style={{background: K.bg, overflow: 'hidden'}}>
      <Audio src={staticFile('d04-funk.wav')} />
      {/* halftone dots */}
      <AbsoluteFill style={{backgroundImage: `radial-gradient(${K.ink}14 3px, transparent 3.5px)`, backgroundSize: '34px 34px', backgroundPosition: `${f * 0.5}px ${f * 0.3}px`}} />
      {f < D04.race && <Hook f={f} />}
      {f >= D04.race && f < D04.chart && <Race f={f} />}
      {f >= D04.chart && f < D04.list && <Chart f={f} />}
      {f >= D04.list && f < D04.cta && <Checklist f={f} />}
      {f >= D04.cta && <Cta f={f} />}
      {wipe >= 0 && <div style={{position: 'absolute', top: 0, bottom: 0, left: interpolate(wipe, [0, 1], [-1300, 1300]), width: 1200, background: wipeColor, transform: 'skewX(-12deg)'}} />}
    </AbsoluteFill>
  );
};
