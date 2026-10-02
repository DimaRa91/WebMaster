import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {clamp, ease, fade, sp, typed} from '../kit';

// Day 08 — "Вес или объём: за что вы платите в сборном грузе". Engineering blueprint:
// lines draw themselves, dimension arrows, a balance beam. 120 BPM: 1 beat = 15 frames.

const B = {
  bg: '#0B3D91',
  bgDark: '#082E6E',
  line: '#EAF2FF',
  grid: 'rgba(234,242,255,0.10)',
  gridBold: 'rgba(234,242,255,0.18)',
  yellow: '#FFD24A',
  dim: '#9DB8E6',
};
const FONT = '"Exo 2", sans-serif';

export const D08 = {box: 60, balance: 210, examples: 330, cta: 450, total: 630};

const draw = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], {...clamp, easing: ease});

const Title: React.FC<{children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties}> = ({children, size = 76, color = B.line, style}) => (
  <div style={{fontFamily: FONT, fontWeight: 800, fontSize: size, lineHeight: 1.04, color, textTransform: 'uppercase', ...style}}>{children}</div>
);

/** Isometric wireframe box with dimension lines. */
const BoxDrawing: React.FC<{f: number}> = ({f}) => {
  const a = D08.box;
  const cx = 540;
  const cy = 860;
  const u = 210; // unit length in px for 1 m
  const iso = (x: number, y: number, z: number): [number, number] => [cx + (x - y) * u * 0.866, cy + (x + y) * u * 0.5 - z * u];
  const X = 1.2;
  const Y = 0.8;
  const Z = 1.0;
  const ox = -X / 2;
  const oy = -Y / 2;
  const pt = (x: number, y: number, z: number) => iso(ox + x, oy + y, z - 0.3).join(' ');
  const edges = [
    `M ${pt(0, Y, 0)} L ${pt(X, Y, 0)} L ${pt(X, 0, 0)}`,
    `M ${pt(0, Y, 0)} L ${pt(0, Y, Z)} M ${pt(X, Y, 0)} L ${pt(X, Y, Z)} M ${pt(X, 0, 0)} L ${pt(X, 0, Z)}`,
    `M ${pt(0, Y, Z)} L ${pt(X, Y, Z)} L ${pt(X, 0, Z)} L ${pt(0, 0, Z)} Z`,
  ];
  const hidden = `M ${pt(0, 0, 0)} L ${pt(X, 0, 0)} M ${pt(0, 0, 0)} L ${pt(0, Y, 0)} M ${pt(0, 0, 0)} L ${pt(0, 0, Z)}`;
  const dims = [
    {p1: [0, Y + 0.25, 0], p2: [X, Y + 0.25, 0], label: '1,2 м', at: a + 36},
    {p1: [X + 0.25, Y, 0], p2: [X + 0.25, 0, 0], label: '0,8 м', at: a + 44},
    {p1: [-0.25, Y, 0], p2: [-0.25, Y, Z], label: '1,0 м', at: a + 52},
  ];
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      <path d={hidden} stroke={B.dim} strokeWidth={3} strokeDasharray="12 10" fill="none" opacity={draw(f, a + 6, a + 24)} />
      {edges.map((d, i) => (
        <path key={i} d={d} stroke={B.line} strokeWidth={6} fill="none" strokeLinejoin="round" pathLength={1} strokeDasharray={`${draw(f, a + i * 8, a + 22 + i * 8)} 1`} />
      ))}
      {dims.map((d, i) => {
        const [x1, y1] = iso(ox + d.p1[0], oy + d.p1[1], d.p1[2] - 0.3);
        const [x2, y2] = iso(ox + d.p2[0], oy + d.p2[1], d.p2[2] - 0.3);
        const t = draw(f, d.at, d.at + 10);
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;
        return (
          <g key={i} opacity={t}>
            <line x1={x1} y1={y1} x2={x1 + (x2 - x1) * t} y2={y1 + (y2 - y1) * t} stroke={B.yellow} strokeWidth={4} markerEnd="url(#arr)" markerStart="url(#arr)" />
            <rect x={mx - 78} y={my - 30} width={156} height={56} rx={10} fill={B.bg} stroke={B.yellow} strokeWidth={3} />
            <text x={mx} y={my + 12} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34} fill={B.yellow}>
              {d.label}
            </text>
          </g>
        );
      })}
      <defs>
        <marker id="arr" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={B.yellow} />
        </marker>
      </defs>
    </svg>
  );
};

const Balance: React.FC<{f: number}> = ({f}) => {
  const a = D08.balance;
  const tilt = interpolate(f, [a + 20, a + 40, a + 60, a + 80, a + 100], [0, -9, 9, -6, 6], clamp);
  const cx = 540;
  const cy = 980;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <path d={`M ${cx - 70} ${cy + 260} L ${cx} ${cy} L ${cx + 70} ${cy + 260} Z`} fill="none" stroke={B.line} strokeWidth={6} pathLength={1} strokeDasharray={`${draw(f, a, a + 15)} 1`} />
        <g transform={`rotate(${tilt} ${cx} ${cy})`} opacity={fade(f, a + 8, a + 16)}>
          <line x1={cx - 380} y1={cy} x2={cx + 380} y2={cy} stroke={B.line} strokeWidth={8} strokeLinecap="round" />
          <line x1={cx - 330} y1={cy} x2={cx - 330} y2={cy + 70} stroke={B.line} strokeWidth={4} />
          <line x1={cx + 330} y1={cy} x2={cx + 330} y2={cy + 70} stroke={B.line} strokeWidth={4} />
          <g transform={`translate(${cx - 330} ${cy + 70}) rotate(${-tilt})`}>
            <rect x={-130} y={0} width={260} height={150} rx={16} fill={B.bgDark} stroke={B.line} strokeWidth={4} />
            <text x={0} y={60} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={36} fill={B.line}>
              ВЕС
            </text>
            <text x={0} y={112} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill={B.dim}>
              брутто
            </text>
          </g>
          <g transform={`translate(${cx + 330} ${cy + 70}) rotate(${-tilt})`}>
            <rect x={-130} y={0} width={260} height={150} rx={16} fill={B.bgDark} stroke={B.yellow} strokeWidth={4} />
            <text x={0} y={60} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={36} fill={B.yellow}>
              ОБЪЁМ
            </text>
            <text x={0} y={112} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill={B.yellow}>
              м³
            </text>
          </g>
        </g>
      </svg>
      <div style={{position: 'absolute', left: 90, right: 120, top: 1330, textAlign: 'center', opacity: fade(f, a + 60, a + 70)}}>
        <Title size={46} color={B.yellow}>
          считают по тому, что больше
        </Title>
      </div>
    </AbsoluteFill>
  );
};

const Examples: React.FC<{f: number}> = ({f}) => {
  const a = D08.examples;
  const rows = [
    {k: 'Мебель, свет', v: 'лёгкие, но объёмные', r: 'чаще по объёму', at: a + 10, c: B.yellow},
    {k: 'Плитка', v: 'тяжёлая и компактная', r: 'чаще по весу', at: a + 40, c: B.line},
  ];
  return (
    <div style={{position: 'absolute', left: 90, right: 120, top: 560, display: 'flex', flexDirection: 'column', gap: 40}}>
      {rows.map((r, i) => {
        const s = sp(f, r.at, {damping: 13});
        return (
          <div key={i} style={{border: `4px solid ${r.c}`, borderRadius: 20, padding: '30px 34px', transform: `translateX(${(1 - s) * -800}px)`, background: 'rgba(8,46,110,0.7)'}}>
            <Title size={64} color={r.c}>
              {r.k}
            </Title>
            <div style={{fontFamily: FONT, fontWeight: 500, fontSize: 40, color: B.line, marginTop: 10}}>{r.v}</div>
            <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 46, color: r.c, marginTop: 18}}>→ {r.r}</div>
          </div>
        );
      })}
      <div style={{fontFamily: FONT, fontWeight: 500, fontSize: 38, lineHeight: 1.3, color: B.dim, opacity: fade(f, a + 80, a + 90)}}>
        Для точного расчёта нужен вес брутто и габариты каждого места
      </div>
    </div>
  );
};

export const Blueprint: React.FC = () => {
  const f = useCurrentFrame();
  const scene = f < D08.box ? 0 : f < D08.balance ? 1 : f < D08.examples ? 2 : f < D08.cta ? 3 : 4;
  const titles = [
    ['За что вы платите', 'вес или объём?'],
    ['Шаг 1', 'считаем объём'],
    ['Шаг 2', 'сравниваем'],
    ['На практике', ''],
  ];
  const sceneStart = [0, D08.box, D08.balance, D08.examples][Math.min(scene, 3)];
  const t = sp(f, scene === 0 ? -10 : sceneStart, {damping: 13});
  return (
    <AbsoluteFill style={{background: B.bg, overflow: 'hidden'}}>
      <Audio src={staticFile('d08-arp.wav')} />
      <AbsoluteFill style={{backgroundImage: `linear-gradient(${B.grid} 1px, transparent 1px), linear-gradient(90deg, ${B.grid} 1px, transparent 1px), linear-gradient(${B.gridBold} 2px, transparent 2px), linear-gradient(90deg, ${B.gridBold} 2px, transparent 2px)`, backgroundSize: '30px 30px, 30px 30px, 150px 150px, 150px 150px'}} />
      {/* title block, like a drawing stamp */}
      {scene < 4 && (
        <div style={{position: 'absolute', left: 90, right: 120, top: 290, transform: `translateY(${(1 - t) * -40}px)`, opacity: t}}>
          <div style={{fontFamily: FONT, fontWeight: 500, fontSize: 30, color: B.dim, letterSpacing: '0.12em'}}>{`ЛИСТ ${scene + 1} / 4 · СБОРНЫЙ ГРУЗ`}</div>
          <Title size={scene === 0 ? 92 : 70} style={{marginTop: 8}}>
            {titles[scene][0]}
          </Title>
          {titles[scene][1] && (
            <Title size={scene === 0 ? 92 : 70} color={B.yellow}>
              {titles[scene][1]}
            </Title>
          )}
        </div>
      )}
      {scene === 0 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 860, display: 'flex', justifyContent: 'center', gap: 60, opacity: 1}}>
          {['КГ', 'М³'].map((u, i) => (
            <div key={u} style={{width: 330, height: 330, border: `6px solid ${i ? B.yellow : B.line}`, borderRadius: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `rotate(${(i ? 1 : -1) * 4}deg) scale(${sp(f, -6 + i * 10, {damping: 8})})`}}>
              <Title size={140} color={i ? B.yellow : B.line}>
                {u}
              </Title>
            </div>
          ))}
        </div>
      )}
      {scene === 1 && (
        <>
          <BoxDrawing f={f} />
          <div style={{position: 'absolute', left: 90, right: 120, top: 1280, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 64, color: B.line}}>
            {typed('1,2 × 0,8 × 1,0 = 0,96 м³', f, D08.box + 70, 1.6)}
          </div>
        </>
      )}
      {scene === 2 && <Balance f={f} />}
      {scene === 3 && <Examples f={f} />}
      {scene === 4 && (() => {
        const l = f - D08.cta;
        const b = sp(l, 20, {damping: 9, stiffness: 260});
        return (
          <>
            <div style={{position: 'absolute', left: 90, right: 120, top: 330, opacity: fade(l, 0, 10)}}>
              <Title size={84}>Посчитаем</Title>
              <Title size={84} color={B.yellow}>
                точно
              </Title>
              <div style={{fontFamily: FONT, fontWeight: 500, fontSize: 44, lineHeight: 1.3, color: B.line, marginTop: 30}}>
                Пришлите инвойс или список товаров с весом и объёмом — подготовим расчёт до склада в Москве
              </div>
            </div>
            <div style={{position: 'absolute', left: 90, right: 120, top: 1000, transform: `scale(${interpolate(b, [0, 1], [0.5, 1])})`, opacity: Math.min(1, b * 2)}}>
              <div style={{background: B.yellow, borderRadius: 24, padding: '34px 20px 38px', textAlign: 'center', boxShadow: `0 0 0 6px ${B.bg}, 0 0 0 10px ${B.yellow}`}}>
                <Title size={64} color={B.bg}>
                  Рассчитать
                </Title>
                <Title size={42} color={B.bg} style={{marginTop: 10}}>
                  стоимость доставки
                </Title>
              </div>
            </div>
          </>
        );
      })()}
    </AbsoluteFill>
  );
};
