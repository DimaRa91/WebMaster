import React from 'react';
import {AbsoluteFill, Audio, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import {clamp, ease, fade, sp} from '../kit';

// Day 13 — "Что такое сборный груз — за 20 секунд". Paper cut-out stop motion: everything moves
// "on threes" (10 fps) with a little hand-made jitter. 120 BPM: 1 beat = 15 frames.

const P = {
  bg: '#F6E7CF',
  sky: '#BFE3E8',
  truck: '#E4572E',
  truckDark: '#B9431F',
  cab: '#2E4057',
  ink: '#2B2118',
  boxes: ['#F2B134', '#7CB518', '#4F86C6', '#E86A92', '#9B5DE5', '#F28F3B'],
  you: '#E4572E',
};
const FONT = 'Comfortaa, sans-serif';

export const D13 = {lonely: 60, shared: 180, pay: 300, store: 420, cta: 540, total: 720};

/** Paper sheet: flat colour, torn-ish shadow, slight stop-motion wobble. */
const Paper: React.FC<{x: number; y: number; w: number; h: number; color: string; seed: string; f: number; r?: number; children?: React.ReactNode; radius?: number}> = ({x, y, w, h, color, seed, f, r = 0, children, radius = 10}) => {
  const step = Math.floor(f / 3);
  const wob = (random(`${seed}-${step}`) - 0.5) * 1.6;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        background: color,
        borderRadius: radius,
        boxShadow: '0 6px 0 rgba(0,0,0,0.12), 0 14px 22px rgba(0,0,0,0.18)',
        transform: `rotate(${r + wob}deg)`,
      }}
    >
      {children}
    </div>
  );
};

const Caption: React.FC<{f: number; at: number; title: string; sub?: string}> = ({f, at, title, sub}) => {
  const s = sp(f, at, {damping: 12});
  return (
    <div style={{position: 'absolute', left: 90, right: 120, top: 290, transform: `translateY(${(1 - s) * -60}px) rotate(${(random(`c${Math.floor(f / 3)}`) - 0.5) * 0.8}deg)`, opacity: s}}>
      <div style={{display: 'inline-block', background: '#FFFDF7', padding: '22px 30px', borderRadius: 14, boxShadow: '0 8px 0 rgba(0,0,0,0.1)'}}>
        <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 62, lineHeight: 1.12, color: P.ink}}>{title}</div>
        {sub && <div style={{fontFamily: FONT, fontWeight: 500, fontSize: 40, lineHeight: 1.25, color: '#6B5B4A', marginTop: 12}}>{sub}</div>}
      </div>
    </div>
  );
};

const Truck: React.FC<{f: number; x: number; children?: React.ReactNode}> = ({f, x, children}) => (
  <>
    <Paper x={x} y={900} w={640} h={360} color={P.truck} seed="trailer" f={f} radius={18}>
      <div style={{position: 'absolute', inset: 18, background: '#FFF4E4', borderRadius: 10}} />
      {children}
    </Paper>
    <Paper x={x + 655} y={1010} w={190} h={250} color={P.cab} seed="cab" f={f} radius={18}>
      <div style={{position: 'absolute', left: 70, top: 26, width: 96, height: 80, background: P.sky, borderRadius: 8}} />
    </Paper>
    {[x + 90, x + 230, x + 520, x + 740].map((wx, i) => (
      <Paper key={i} x={wx} y={1225} w={90} h={90} color={P.ink} seed={`w${i}`} f={f} radius={45} r={f * 12}>
        <div style={{position: 'absolute', inset: 26, borderRadius: 20, background: '#CFC6B8'}} />
      </Paper>
    ))}
  </>
);

/** Cargo box with an optional tag. Coordinates are inside the trailer. */
const Box: React.FC<{f: number; seed: string; x: number; y: number; s?: number; color: string; tag?: string; glow?: boolean}> = ({f, seed, x, y, s = 130, color, tag, glow}) => (
  <Paper x={x} y={y} w={s} h={s} color={color} seed={seed} f={f} radius={8}>
    <div style={{position: 'absolute', left: s * 0.42, width: s * 0.16, top: 0, bottom: 0, background: 'rgba(255,255,255,0.35)'}} />
    {tag && (
      <div style={{position: 'absolute', left: '50%', top: -44, transform: 'translateX(-50%)', background: glow ? P.you : '#FFFDF7', color: glow ? '#fff' : P.ink, fontFamily: FONT, fontWeight: 700, fontSize: 24, padding: '6px 12px', borderRadius: 10, whiteSpace: 'nowrap', boxShadow: '0 4px 0 rgba(0,0,0,0.12)'}}>{tag}</div>
    )}
    {glow && <div style={{position: 'absolute', inset: -12, border: `6px dashed ${P.you}`, borderRadius: 14}} />}
  </Paper>
);

export const PaperExplainer: React.FC = () => {
  const f = useCurrentFrame();
  const q = Math.floor(f / 3) * 3; // stop-motion time
  const truckX = interpolate(q, [0, 40], [-900, 100], {...clamp, easing: ease}) + interpolate(q, [D13.store - 10, D13.store + 20, D13.cta - 30, D13.cta], [0, 0, 0, 1100], clamp);
  const drop = (at: number) => interpolate(q, [at, at + 12], [-900, 0], {...clamp, easing: ease});
  const sharedBoxes = [
    {x: 40, y: 175, c: P.boxes[1], tag: 'клиент 2', at: D13.shared + 6},
    {x: 190, y: 175, c: P.boxes[2], tag: 'клиент 3', at: D13.shared + 15},
    {x: 340, y: 175, c: P.boxes[3], tag: 'клиент 4', at: D13.shared + 24},
    {x: 115, y: 40, c: P.boxes[4], tag: 'клиент 5', at: D13.shared + 33},
    {x: 265, y: 40, c: P.boxes[5], tag: 'клиент 6', at: D13.shared + 42},
  ];
  const inStore = q >= D13.store && q < D13.cta;
  return (
    <AbsoluteFill style={{background: P.bg, overflow: 'hidden'}}>
      <Audio src={staticFile('d13-ukulele.wav')} />
      {/* paper texture & cut-out hills */}
      <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(120,90,50,0.08) 1px, transparent 1.5px)', backgroundSize: '9px 9px'}} />
      <Paper x={-100} y={1290} w={1300} h={700} color="#9CC69B" seed="hill" f={f} radius={300} r={-3} />
      <Paper x={-200} y={1330} w={1500} h={700} color="#7FB27E" seed="hill2" f={f} radius={300} r={2} />
      {f < D13.cta && f >= D13.lonely && <Paper x={800} y={650} w={130} h={130} color="#F9C74F" seed="sun" f={f} radius={65} />}

      {/* hook */}
      {f < D13.lonely && (
        <div style={{position: 'absolute', left: 90, right: 120, top: 330}}>
          <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 104, lineHeight: 1.05, color: P.ink, transform: `rotate(${(random(`hk${Math.floor(f / 3)}`) - 0.5) * 1.2}deg) scale(${interpolate(sp(f, -6, {damping: 9}), [0, 1], [1.3, 1])})`, transformOrigin: 'left'}}>
            Что такое
            <br />
            <span style={{color: P.truck}}>сборный груз?</span>
          </div>
          <div style={{display: 'inline-block', marginTop: 40, background: P.cab, color: '#fff', fontFamily: FONT, fontWeight: 700, fontSize: 48, padding: '16px 28px', borderRadius: 14, opacity: fade(f, 8, 16)}}>Объясняем за 20 секунд</div>
        </div>
      )}

      {f >= D13.lonely && f < D13.shared && <Caption f={f} at={D13.lonely} title="Ваш груз — одна коробка" sub="Целая машина ради неё — дорого" />}
      {f >= D13.shared && f < D13.pay && <Caption f={f} at={D13.shared} title="Сборный груз:" sub="в одной машине — товары разных клиентов" />}
      {f >= D13.pay && f < D13.store && <Caption f={f} at={D13.pay} title="Каждый платит" sub="только за своё место в машине" />}
      {f >= D13.store && f < D13.cta && <Caption f={f} at={D13.store} title="Груз копится на складе" sub="пока вы собираете заказы с разных фабрик — и едет одной партией" />}

      {/* truck with boxes */}
      {f >= D13.lonely - 10 && f < D13.cta + 10 && (
        <Truck f={f} x={truckX}>
          <Box f={f} seed="you" x={490} y={175 + (q < D13.lonely + 12 ? drop(D13.lonely) : 0)} color={P.you} tag="ваш груз" glow={q >= D13.pay} />
          {q >= D13.shared && sharedBoxes.map((b, i) => (q >= b.at ? <Box key={i} f={f} seed={`b${i}`} x={b.x} y={b.y + drop(b.at)} color={b.c} tag={q < D13.pay ? b.tag : undefined} /> : null))}
        </Truck>
      )}
      {/* price tag on your box */}
      {f >= D13.pay + 20 && f < D13.store && (
        <div style={{position: 'absolute', left: truckX + 520, top: 1080, transform: `rotate(-8deg) scale(${sp(f, D13.pay + 20, {damping: 8})})`, background: '#FFFDF7', border: `5px solid ${P.you}`, borderRadius: 16, padding: '10px 18px', fontFamily: FONT, fontWeight: 700, fontSize: 34, color: P.you}}>
          ваша часть
        </div>
      )}
      {/* warehouse shelf counter */}
      {inStore && (
        <div style={{position: 'absolute', left: 90, top: 650, display: 'flex', gap: 14}}>
          {['фабрика 1', 'фабрика 2', 'фабрика 3'].map((t, i) => (
            <div key={i} style={{background: '#FFFDF7', borderRadius: 12, padding: '10px 16px', fontFamily: FONT, fontWeight: 700, fontSize: 30, color: P.ink, transform: `translateY(${(1 - sp(f, D13.store + 12 + i * 12, {damping: 9})) * -200}px)`, boxShadow: '0 5px 0 rgba(0,0,0,0.12)'}}>{`${t} ✓`}</div>
          ))}
        </div>
      )}

      {/* CTA */}
      {f >= D13.cta && (() => {
        const c = f - D13.cta;
        const b = sp(c, 20, {damping: 9, stiffness: 260});
        return (
          <div style={{position: 'absolute', left: 90, right: 120, top: 360}}>
            <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 84, lineHeight: 1.08, color: P.ink, opacity: fade(c, 0, 9)}}>
              Возим сборные грузы
              <br />
              <span style={{color: P.truck}}>от одной коробки</span>
            </div>
            <div style={{fontFamily: FONT, fontWeight: 500, fontSize: 42, lineHeight: 1.3, color: '#6B5B4A', marginTop: 26, opacity: fade(c, 8, 18)}}>Европа и Китай → Москва · отправки каждую неделю</div>
            <div style={{marginTop: 70, transform: `rotate(${(random(`cta${Math.floor(f / 3)}`) - 0.5) * 1.2}deg) scale(${interpolate(b, [0, 1], [0.5, 1])})`, opacity: Math.min(1, b * 2)}}>
              <div style={{background: P.truck, borderRadius: 26, padding: '30px 20px 34px', textAlign: 'center', boxShadow: `0 10px 0 ${P.truckDark}`}}>
                <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 60, color: '#fff', lineHeight: 1}}>Рассчитать</div>
                <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 40, color: '#fff', marginTop: 10}}>стоимость доставки</div>
              </div>
              <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 32, color: P.ink, textAlign: 'center', marginTop: 26, opacity: fade(c, 40, 50)}}>Пришлите инвойс или список товаров</div>
            </div>
          </div>
        );
      })()}
    </AbsoluteFill>
  );
};
