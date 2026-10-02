import React from 'react';
import {AbsoluteFill, Audio, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import {fade, sp, typed} from '../kit';

// Day 10 — "«Честный знак» при импорте": an 8-bit game. A DataMatrix code assembles from pixels,
// four "levels" explain the rules, a chiptune plays. 120 BPM: 1 beat = 15 frames.

const G = {
  bg: '#1B1035',
  bg2: '#2A1A52',
  yellow: '#FFE14D',
  cyan: '#4DF3FF',
  pink: '#FF4DA6',
  white: '#F6F3FF',
  dim: '#8C7FB8',
};
const PIX = '"Press Start 2P", monospace';
const BODY = 'Inter, sans-serif';

const LEVELS = [
  {t: 'КАКИЕ ТОВАРЫ', b: 'Обувь, одежда и другие маркируемые товары нельзя продавать без кода «Честный знак»'},
  {t: 'КОГДА НАНОСИТЬ', b: 'При ввозе не из ЕАЭС — до таможенного выпуска товара'},
  {t: 'ГДЕ НАНОСИТЬ', b: 'На фабрике или на складе за рубежом — до отправки в Россию'},
  {t: 'КТО ЗАКАЖЕТ', b: 'Марки «Честный знак» для вашего груза закажем мы'},
];

export const D10 = {lvl0: 60, lvlLen: 90, cta: 60 + 90 * 4, total: 60 + 90 * 4 + 180};

/** 14×14 DataMatrix-style pattern that fills in pixel by pixel. */
const Matrix: React.FC<{f: number; at: number; size: number; color?: string}> = ({f, at, size, color = G.white}) => {
  const n = 14;
  const cell = size / n;
  const cells: React.ReactNode[] = [];
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const border = x === 0 || y === n - 1 || (y === 0 && x % 2 === 0) || (x === n - 1 && y % 2 === 1);
      const on = border || random(`m${x}-${y}`) > 0.52;
      if (!on) continue;
      const appear = at + random(`a${x}-${y}`) * 24;
      if (f < appear) continue;
      cells.push(<rect key={`${x}-${y}`} x={x * cell} y={y * cell} width={cell + 0.5} height={cell + 0.5} fill={color} />);
    }
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {cells}
    </svg>
  );
};

const Heart: React.FC<{on: boolean}> = ({on}) => (
  <svg width={48} height={42} viewBox="0 0 8 7" shapeRendering="crispEdges">
    <path d="M1 0h2v1h2V0h2v1h1v3H7v1H6v1H5v1H3V6H2V5H1V4H0V1h1z" fill={on ? G.pink : '#3A2C6A'} />
  </svg>
);

export const Marking: React.FC = () => {
  const f = useCurrentFrame();
  const lvl = Math.floor((f - D10.lvl0) / D10.lvlLen);
  const l = (f - D10.lvl0) % D10.lvlLen;
  const blink = Math.floor(f / 8) % 2 === 0;
  return (
    <AbsoluteFill style={{background: G.bg, overflow: 'hidden', imageRendering: 'pixelated'}}>
      <Audio src={staticFile('d10-chip.wav')} />
      <AbsoluteFill style={{backgroundImage: `linear-gradient(${G.bg2} 2px, transparent 2px), linear-gradient(90deg, ${G.bg2} 2px, transparent 2px)`, backgroundSize: '40px 40px'}} />
      {/* scanlines */}
      <AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0 3px, transparent 3px 6px)', pointerEvents: 'none', zIndex: 5}} />

      {/* HUD */}
      <div style={{position: 'absolute', left: 90, right: 120, top: 280, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div style={{fontFamily: PIX, fontSize: 26, color: G.cyan}}>{f < D10.lvl0 ? 'СТАРТ' : f < D10.cta ? `УРОВЕНЬ ${lvl + 1}/4` : 'ПОБЕДА'}</div>
        <div style={{display: 'flex', gap: 8}}>
          {[0, 1, 2, 3].map((k) => (
            <Heart key={k} on={f >= D10.lvl0 + k * D10.lvlLen + 60 || f >= D10.cta} />
          ))}
        </div>
      </div>

      {/* hook */}
      {f < D10.lvl0 && (
        <div style={{position: 'absolute', left: 90, right: 120, top: 420}}>
          <div style={{fontFamily: PIX, fontSize: 54, lineHeight: 1.4, color: G.yellow}}>ВЕЗЁТЕ ОБУВЬ ИЛИ ОДЕЖДУ?</div>
          <div style={{display: 'flex', justifyContent: 'center', marginTop: 70}}>
            <div style={{background: G.white, padding: 30, transform: `scale(${sp(f, -4, {damping: 9})})`}}>
              <Matrix f={f} at={-24} size={380} color={G.bg} />
            </div>
          </div>
          <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 50, lineHeight: 1.2, color: G.white, marginTop: 60, textAlign: 'center', opacity: fade(f, 14, 22)}}>
            Без «Честного знака» их не продать
          </div>
        </div>
      )}

      {/* levels */}
      {f >= D10.lvl0 && f < D10.cta && (
        <div style={{position: 'absolute', left: 90, right: 120, top: 400}}>
          <div style={{fontFamily: PIX, fontSize: 52, lineHeight: 1.35, color: G.yellow, transform: `translateX(${(1 - sp(l, 0, {damping: 10})) * -700}px)`}}>{LEVELS[lvl].t}</div>
          <div style={{display: 'flex', justifyContent: 'center', marginTop: 50}}>
            <div style={{background: G.white, padding: 24, transform: `rotate(${(lvl % 2 ? 1 : -1) * 3}deg)`}}>
              <Matrix f={l} at={0} size={300} color={[G.bg, '#3A1E7A', G.bg, '#5A2E00'][lvl]} />
            </div>
          </div>
          <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 52, lineHeight: 1.22, color: G.white, marginTop: 56, minHeight: 260}}>
            {typed(LEVELS[lvl].b, l, 14, 0.7)}
            {l > 14 && blink && <span style={{color: G.cyan}}>▌</span>}
          </div>
          {l >= 60 && (
            <div style={{fontFamily: PIX, fontSize: 30, color: G.cyan, marginTop: 10, transform: `scale(${sp(l, 60, {damping: 7, stiffness: 300})})`, transformOrigin: 'left'}}>+1 ЖИЗНЬ ✓</div>
          )}
        </div>
      )}

      {/* CTA */}
      {f >= D10.cta && (() => {
        const c = f - D10.cta;
        const b = sp(c, 24, {damping: 9, stiffness: 260});
        return (
          <div style={{position: 'absolute', left: 90, right: 120, top: 400}}>
            <div style={{fontFamily: PIX, fontSize: 60, lineHeight: 1.35, color: G.yellow, transform: `scale(${interpolate(sp(c, 0, {damping: 8}), [0, 1], [1.6, 1])})`, transformOrigin: 'left'}}>УРОВЕНЬ ПРОЙДЕН</div>
            <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 48, lineHeight: 1.25, color: G.white, marginTop: 40, opacity: fade(c, 8, 16)}}>
              Привезём груз, закажем марки, сделаем белую растаможку
            </div>
            <div style={{fontFamily: BODY, fontWeight: 600, fontSize: 34, lineHeight: 1.3, color: G.dim, marginTop: 24, opacity: fade(c, 14, 22)}}>
              Перечень маркируемых товаров расширяется — проверим ваш товар
            </div>
            <div style={{marginTop: 70, transform: `scale(${interpolate(b, [0, 1], [0.5, 1])})`, opacity: Math.min(1, b * 2)}}>
              <div style={{background: G.yellow, padding: '30px 20px 34px', textAlign: 'center', boxShadow: `8px 8px 0 ${G.pink}`}}>
                <div style={{fontFamily: PIX, fontSize: 44, color: G.bg, lineHeight: 1.3}}>РАССЧИТАТЬ</div>
                <div style={{fontFamily: PIX, fontSize: 26, color: G.bg, marginTop: 12, lineHeight: 1.4}}>СТОИМОСТЬ ДОСТАВКИ</div>
              </div>
              <div style={{fontFamily: BODY, fontWeight: 700, fontSize: 32, color: G.white, textAlign: 'center', marginTop: 28, opacity: fade(c, 50, 60)}}>
                Пришлите инвойс или список товаров
              </div>
            </div>
          </div>
        );
      })()}
    </AbsoluteFill>
  );
};
