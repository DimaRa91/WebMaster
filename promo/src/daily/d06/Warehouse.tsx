import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';

// Day 06 — "Что происходит с вашим грузом на складе в Римини". An isometric warehouse:
// one hero box goes receiving → check → crate → insurance → consolidation → dispatch.
// 90 BPM: 1 beat = 20 frames. Each step = 6 beats = 120 frames. Events mirror music/compose_d06.py.

const W = {
  bg: '#E8EEF2',
  floor: '#D5DEE6',
  floorLine: '#C3CED8',
  wall: '#C9D4DE',
  wallDark: '#B7C4D0',
  ink: '#1F2A36',
  teal: '#0E7C66',
  terra: '#D9643A',
  kraftTop: '#E2B37A',
  kraftL: '#C9955A',
  kraftR: '#B07D45',
  white: '#FFFFFF',
};
const FONT = 'Nunito, sans-serif';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.6, 0, 0.3, 1);
const sp = (f: number, at: number, cfg: object = {}) => spring({frame: f - at, fps: 30, config: {damping: 12, stiffness: 200, mass: 0.6, ...cfg}});

export const D06 = {hook: 0, step0: 60, stepLen: 120, steps: 6, cta: 60 + 120 * 6, total: 60 + 120 * 6 + 150};

const STEPS = [
  {t: 'Забираем с фабрики', s: 'Пезаро, Сассуоло, Марке — привозим на склад сами'},
  {t: 'Проверяем товар', s: 'включая санкционные коды — до отправки'},
  {t: 'Переупаковываем', s: 'делаем обрешётку для хрупкого'},
  {t: 'Страхуем груз', s: 'чтобы вы были спокойны за товар'},
  {t: 'Копим заказы', s: 'пока вы собираете товар с разных фабрик'},
  {t: 'Одна партия → Москва', s: '18–25 дней · отправки каждую неделю'},
];

/* ---------- isometric helpers ---------- */
const S = 52;
const OX = 540;
const OY = 760;
type V = [number, number, number];
const P = ([x, y, z]: V): [number, number] => [OX + (x - y) * S * 0.866, OY + (x + y) * S * 0.5 - z * S];
const poly = (pts: V[]) => pts.map((p) => P(p).join(',')).join(' ');

const Cuboid: React.FC<{x: number; y: number; z?: number; w: number; d: number; h: number; top: string; left: string; right: string; stroke?: string; children?: React.ReactNode}> = ({x, y, z = 0, w, d, h, top, left, right, stroke = 'rgba(0,0,0,0.12)', children}) => (
  <g>
    <polygon points={poly([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]])} fill={left} stroke={stroke} strokeWidth={1.5} />
    <polygon points={poly([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]])} fill={right} stroke={stroke} strokeWidth={1.5} />
    <polygon points={poly([[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]])} fill={top} stroke={stroke} strokeWidth={1.5} />
    {children}
  </g>
);

const Box: React.FC<{p: V; size?: number; crate?: number; tag?: string; tagColor?: string}> = ({p, size = 1, crate = 0, tag, tagColor = W.teal}) => {
  const [x, y, z] = p;
  const s = size;
  const slats = [0.15, 0.5, 0.85];
  return (
    <g>
      <Cuboid x={x} y={y} z={z} w={s} d={s} h={s} top={W.kraftTop} left={W.kraftL} right={W.kraftR} />
      {/* tape */}
      <polygon points={poly([[x + s * 0.42, y, z + s], [x + s * 0.58, y, z + s], [x + s * 0.58, y + s, z + s], [x + s * 0.42, y + s, z + s]])} fill="rgba(255,240,210,0.6)" />
      {crate > 0 &&
        slats.map((k, i) => (
          <g key={i} opacity={Math.min(1, crate * 3 - i)}>
            <polygon points={poly([[x - 0.04, y + s + 0.02, z + s * k - 0.06], [x + s + 0.04, y + s + 0.02, z + s * k - 0.06], [x + s + 0.04, y + s + 0.02, z + s * k + 0.06], [x - 0.04, y + s + 0.02, z + s * k + 0.06]])} fill="#8A5A2B" />
            <polygon points={poly([[x + s + 0.02, y - 0.04, z + s * k - 0.06], [x + s + 0.02, y + s + 0.04, z + s * k - 0.06], [x + s + 0.02, y + s + 0.04, z + s * k + 0.06], [x + s + 0.02, y - 0.04, z + s * k + 0.06]])} fill="#7A4D22" />
          </g>
        ))}
      {tag && (() => {
        const [tx, ty] = P([x + s / 2, y + s / 2, z + s + 0.55]);
        return (
          <g>
            <rect x={tx - 70} y={ty - 22} width={140} height={40} rx={20} fill={tagColor} />
            <text x={tx} y={ty + 7} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={22} fill={W.white}>
              {tag}
            </text>
          </g>
        );
      })()}
    </g>
  );
};

const FloorZone: React.FC<{x: number; y: number; w: number; d: number; color: string; label: string; on: number}> = ({x, y, w, d, color, label, on}) => {
  const [lx, ly] = P([x + w / 2, y + d / 2, 0]);
  return (
    <g opacity={0.35 + on * 0.65}>
      <polygon points={poly([[x, y, 0], [x + w, y, 0], [x + w, y + d, 0], [x, y + d, 0]])} fill={color} fillOpacity={0.18 + on * 0.17} stroke={color} strokeWidth={3} strokeDasharray="10 8" />
      <text x={lx} y={ly + 8} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={22} fill={color} transform={`rotate(0 ${lx} ${ly})`}>
        {label}
      </text>
    </g>
  );
};

const lerpV = (a: V, b: V, t: number): V => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

/* ---------- scene ---------- */
const Scene: React.FC<{f: number}> = ({f}) => {
  const st = (i: number) => D06.step0 + i * D06.stepLen;
  const RECV: V = [1, 8, 0];
  const CHECK: V = [4.5, 4.5, 0];
  const PAL: V = [7.6, 1.2, 0.2];
  // hero box path
  let hero: V = [1, 12.5, 0];
  hero = lerpV(hero, RECV, interpolate(f, [st(0) + 10, st(0) + 40], [0, 1], {...clamp, easing: ease}));
  hero = lerpV(hero, CHECK, interpolate(f, [st(1) - 10, st(1) + 14], [0, 1], {...clamp, easing: ease}));
  hero = lerpV(hero, PAL, interpolate(f, [st(4) - 10, st(4) + 16], [0, 1], {...clamp, easing: ease}));
  const crate = interpolate(f, [st(2) + 20, st(2) + 60], [0, 1], clamp);
  // other factory boxes arriving with the hero, later accumulating on the pallet
  const others: {from: V; to: V; at: number; tag: string}[] = [
    {from: [0, 13, 0], to: [0.1, 9.3, 0], at: st(0) + 20, tag: 'ПЛИТКА'},
    {from: [2, 13.5, 0], to: [2.3, 8.9, 0], at: st(0) + 30, tag: 'ОБУВЬ'},
  ];
  const palletBoxes: V[] = [
    [8.8, 1.2, 0.2],
    [7.6, 2.4, 0.2],
    [8.8, 2.4, 0.2],
    [7.6, 1.2, 1.2],
    [8.8, 1.2, 1.2],
    [8.2, 2.4, 1.2],
  ];
  const palArr = palletBoxes.map((_, k) => st(4) + 20 + k * 13);
  const ordersNow = 1 + palArr.filter((a) => f >= a).length;
  // dispatch: everything slides into a trailer that then leaves
  const load = interpolate(f, [st(5) + 30, st(5) + 60], [0, 1], {...clamp, easing: ease});
  const leave = interpolate(f, [st(5) + 70, st(5) + 110], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
  const truckIn = interpolate(f, [st(5) - 4, st(5) + 26], [0, 1], {...clamp, easing: ease});
  const trailerX = 10.4 + (1 - truckIn) * 6 + leave * 12;
  const scan = f >= st(1) + 14 && f < st(2) ? ((f - st(1) - 14) % 40) / 40 : -1;
  const checkOk = f >= st(1) + 70;
  const shield = sp(f, st(3) + 16, {damping: 9, stiffness: 260});

  const boxes: {p: V; key: string; crate?: number; tag?: string; tagColor?: string}[] = [];
  others.forEach((o, k) => {
    if (f < o.at) return;
    let p = lerpV(o.from, o.to, interpolate(f, [o.at, o.at + 26], [0, 1], {...clamp, easing: ease}));
    // after step 1 they head to the pallet as well
    p = lerpV(p, palletBoxes[k], interpolate(f, [st(4) - 6 + k * 6, st(4) + 20 + k * 6], [0, 1], {...clamp, easing: ease}));
    if (load > 0) p = lerpV(p, [trailerX + 0.6 + k * 0.3, 6.9, 0.6], load);
    boxes.push({p, key: `o${k}`});
  });
  palletBoxes.slice(2).forEach((pb, k) => {
    const at = palArr[k + 2];
    if (f < at - 10) return;
    let p = lerpV([pb[0], pb[1], pb[2] + 6], pb, interpolate(f, [at - 10, at], [0, 1], {...clamp, easing: Easing.in(Easing.quad)}));
    if (load > 0) p = lerpV(p, [trailerX + 1 + k * 0.4, 6.9, 0.6], load);
    boxes.push({p, key: `p${k}`});
  });
  let heroP = hero;
  if (load > 0) heroP = lerpV(hero, [trailerX + 0.3, 6.9, 0.6], load);
  boxes.push({p: heroP, key: 'hero', crate, tag: f >= st(0) && f < st(4) + 20 ? 'ВАШ ГРУЗ' : undefined});
  // painter's order: far (small x+y, low z) first
  boxes.sort((a, b) => a.p[0] + a.p[1] + a.p[2] * 0.01 - (b.p[0] + b.p[1] + b.p[2] * 0.01));
  const visible = (p: V) => !(leave > 0.02 && p[0] > 10);

  const [heroX, heroY] = P([heroP[0] + 0.5, heroP[1] + 0.5, heroP[2] + 1]);
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      {/* walls */}
      <polygon points={poly([[0, 0, 0], [10, 0, 0], [10, 0, 3.2], [0, 0, 3.2]])} fill={W.wall} />
      <polygon points={poly([[0, 0, 0], [0, 10, 0], [0, 10, 3.2], [0, 0, 3.2]])} fill={W.wallDark} />
      {(() => {
        const [sx, sy] = P([5, 0, 2.3]);
        return (
          <g transform={`translate(${sx} ${sy}) skewY(30)`}>
            <rect x={-150} y={-34} width={300} height={68} rx={10} fill={W.teal} />
            <text x={0} y={12} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={W.white}>
              СКЛАД · РИМИНИ
            </text>
          </g>
        );
      })()}
      {/* floor */}
      <polygon points={poly([[0, 0, 0], [10, 0, 0], [10, 10, 0], [0, 10, 0]])} fill={W.floor} />
      {new Array(11).fill(0).map((_, i) => (
        <g key={i}>
          <polyline points={poly([[i, 0, 0], [i, 10, 0]])} stroke={W.floorLine} strokeWidth={2} fill="none" />
          <polyline points={poly([[0, i, 0], [10, i, 0]])} stroke={W.floorLine} strokeWidth={2} fill="none" />
        </g>
      ))}
      <FloorZone x={0} y={7} w={3.4} d={3} color={W.terra} label="ПРИЁМКА" on={f >= st(0) && f < st(1) ? 1 : 0} />
      <FloorZone x={3.8} y={3.8} w={2.4} d={2.4} color={W.teal} label="ПРОВЕРКА" on={f >= st(1) && f < st(4) ? 1 : 0} />
      <FloorZone x={7} y={0.6} w={3} d={3} color={W.ink} label="КОНСОЛИДАЦИЯ" on={f >= st(4) ? 1 : 0} />
      {/* pallet */}
      <Cuboid x={7.4} y={1} w={2.6} d={2.6} h={0.2} top="#B98B55" left="#9B7040" right="#8A6236" />
      {/* scanner arch */}
      <Cuboid x={3.9} y={4.2} w={0.2} d={1.6} h={2.2} top={W.ink} left="#2E3B49" right="#3A4A5A" />
      <Cuboid x={5.9} y={4.2} w={0.2} d={1.6} h={2.2} top={W.ink} left="#2E3B49" right="#3A4A5A" />
      <Cuboid x={3.9} y={4.2} w={2.2} d={1.6} h={0.15} z={2.2} top={W.ink} left="#2E3B49" right="#3A4A5A" />
      {scan >= 0 && (
        <polygon points={poly([[4.1, 4.3 + scan * 1.4, 0], [5.9, 4.3 + scan * 1.4, 0], [5.9, 4.3 + scan * 1.4, 2.2], [4.1, 4.3 + scan * 1.4, 2.2]])} fill="#2BE3B8" opacity={0.35} />
      )}
      {/* trailer */}
      {truckIn > 0 && (
        <g>
          <Cuboid x={trailerX} y={6.5} w={3.4} d={1.6} h={1.9} top="#F2F5F8" left="#DCE3EA" right={W.terra} />
          <Cuboid x={trailerX + 3.5} y={6.6} w={1} d={1.4} h={1.5} top={W.ink} left="#2E3B49" right="#3A4A5A" />
        </g>
      )}
      {boxes.filter((b) => visible(b.p)).map((b) => (
        <Box key={b.key} p={b.p} crate={b.crate} tag={b.tag} tagColor={b.tagColor} />
      ))}
      {/* check badge */}
      {checkOk && f < st(3) && (
        <g transform={`translate(${heroX + 70} ${heroY - 40}) scale(${sp(f, st(1) + 70, {damping: 8})})`}>
          <circle r={34} fill={W.teal} />
          <path d="M -15 0 L -4 12 L 17 -12" stroke={W.white} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}
      {/* insurance shield */}
      {f >= st(3) + 16 && f < st(4) + 10 && (
        <g transform={`translate(${heroX} ${heroY - 110}) scale(${shield})`}>
          <path d="M 0 -56 L 46 -38 L 46 4 C 46 34 24 52 0 62 C -24 52 -46 34 -46 4 L -46 -38 Z" fill={W.teal} stroke={W.white} strokeWidth={6} />
          <path d="M -18 4 L -4 18 L 22 -12" stroke={W.white} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}
      {/* order counter on the pallet */}
      {f >= st(4) && f < st(5) + 30 && (() => {
        const [cx, cy] = P([8.7, 2.3, 3.4]);
        return (
          <g>
            <rect x={cx - 120} y={cy - 36} width={240} height={64} rx={32} fill={W.ink} />
            <text x={cx} y={cy + 9} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={28} fill={W.white}>{`ЗАКАЗОВ: ${ordersNow}`}</text>
          </g>
        );
      })()}
    </svg>
  );
};

/* ---------- captions ---------- */
const Caption: React.FC<{f: number}> = ({f}) => {
  if (f < D06.step0 || f >= D06.cta) return null;
  const i = Math.floor((f - D06.step0) / D06.stepLen);
  const l = (f - D06.step0) % D06.stepLen;
  const s = sp(l, 0, {damping: 13, stiffness: 220});
  const out = interpolate(l, [D06.stepLen - 8, D06.stepLen], [0, 1], clamp);
  return (
    <div style={{position: 'absolute', left: 90, right: 120, top: 290, transform: `translateY(${(1 - s) * 40 - out * 30}px)`, opacity: Math.min(s * 2, 1 - out)}}>
      <div style={{display: 'flex', gap: 10, marginBottom: 22}}>
        {STEPS.map((_, k) => (
          <div key={k} style={{height: 10, flex: 1, borderRadius: 5, background: k <= i ? W.teal : '#C3CED8'}} />
        ))}
      </div>
      <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 30, color: W.teal, letterSpacing: '0.06em'}}>{`ШАГ ${i + 1} ИЗ 6`}</div>
      <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 68, lineHeight: 1.04, color: W.ink, marginTop: 8, whiteSpace: 'nowrap'}}>{STEPS[i].t}</div>
      <div style={{fontFamily: FONT, fontWeight: 600, fontSize: 40, lineHeight: 1.25, color: '#4A5868', marginTop: 14}}>{STEPS[i].s}</div>
    </div>
  );
};

const Hook: React.FC<{f: number}> = ({f}) => {
  if (f >= D06.step0) return null;
  const o = interpolate(f, [D06.step0 - 12, D06.step0], [1, 0], clamp);
  return (
    <div style={{position: 'absolute', left: 90, right: 120, top: 290, opacity: o}}>
      <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 84, lineHeight: 1.02, color: W.ink}}>
        Что происходит
        <br />с вашим грузом
        <br />
        <span style={{color: W.teal}}>на складе в Римини?</span>
      </div>
    </div>
  );
};

const Cta: React.FC<{f: number}> = ({f}) => {
  if (f < D06.cta) return null;
  const l = f - D06.cta;
  const a = sp(l, 0, {damping: 14});
  const b = sp(l, 14, {damping: 9, stiffness: 260});
  return (
    <AbsoluteFill style={{background: `rgba(31,42,54,${0.92 * a})`}}>
      <div style={{position: 'absolute', left: 90, right: 120, top: 360, transform: `translateY(${(1 - a) * 60}px)`, opacity: a}}>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 86, lineHeight: 1.02, color: W.white}}>
          Ваш груз —
          <br />
          <span style={{color: '#2BE3B8'}}>под присмотром</span>
        </div>
        <div style={{fontFamily: FONT, fontWeight: 600, fontSize: 40, lineHeight: 1.3, color: '#C9D4DE', marginTop: 30}}>
          от фабрики в Италии
          <br />
          до склада в Москве
        </div>
      </div>
      <div style={{position: 'absolute', left: 90, right: 120, top: 1000, transform: `scale(${interpolate(b, [0, 1], [0.5, 1])})`, opacity: Math.min(1, b * 2)}}>
        <div style={{background: '#2BE3B8', borderRadius: 40, padding: '34px 20px 38px', textAlign: 'center', boxShadow: '0 14px 0 #0E7C66'}}>
          <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 64, color: W.ink, lineHeight: 1}}>РАССЧИТАТЬ</div>
          <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 42, color: W.ink, marginTop: 10}}>СТОИМОСТЬ ДОСТАВКИ</div>
        </div>
        <div style={{fontFamily: FONT, fontWeight: 600, fontSize: 34, color: '#C9D4DE', textAlign: 'center', marginTop: 30, opacity: interpolate(l, [30, 40], [0, 1], clamp)}}>
          Пришлите инвойс или список товаров
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Warehouse: React.FC = () => {
  const f = useCurrentFrame();
  // camera: start high and close (hook), settle, then slowly follow the hero's zone
  const zoomIn = interpolate(f, [0, D06.step0], [1.9, 1], {...clamp, easing: ease});
  const focus: [number, number][] = [
    [-40, 60],
    [-60, 40],
    [0, 40],
    [0, 40],
    [0, 40],
    [60, 0],
    [70, 0],
  ];
  const seg = Math.max(0, Math.min(focus.length - 2, Math.floor((f - D06.step0) / D06.stepLen)));
  const t = interpolate((f - D06.step0) % D06.stepLen, [0, 30], [0, 1], {...clamp, easing: ease});
  const fx = f < D06.step0 ? focus[0][0] : focus[seg][0] + (focus[seg + 1][0] - focus[seg][0]) * t;
  const fy = f < D06.step0 ? focus[0][1] : focus[seg][1] + (focus[seg + 1][1] - focus[seg][1]) * t;
  const drift = 1 + Math.sin(f / 90) * 0.01;
  return (
    <AbsoluteFill style={{background: W.bg, overflow: 'hidden'}}>
      <Audio src={staticFile('d06-ambient.wav')} />
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 60%, #F6F9FB 0%, #E8EEF2 55%, #DCE4EB 100%)'}} />
      <AbsoluteFill style={{transform: `translate(${-fx}px, ${fy + 40}px) scale(${zoomIn * drift * 1.25})`, transformOrigin: '540px 1000px'}}>
        <Scene f={f} />
      </AbsoluteFill>
      {/* keep the captions readable over the scene */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 700, background: `linear-gradient(${W.bg} 0%, ${W.bg} 70%, rgba(232,238,242,0) 100%)`, opacity: f < D06.cta ? 1 : 0}} />
      <Hook f={f} />
      <Caption f={f} />
      <Cta f={f} />
    </AbsoluteFill>
  );
};
