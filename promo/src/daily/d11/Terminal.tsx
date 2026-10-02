import React from 'react';
import {AbsoluteFill, Audio, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import {fade, sp, typed} from '../kit';

// Day 11 — "Как проверяют товар на санкции": a CRT terminal runs the check line by line.
// 100 BPM: 1 beat = 18 frames, 1 bar = 72 frames.

const T = {
  bg: '#050806',
  screen: '#07120C',
  green: '#39FF88',
  dim: '#1E7A48',
  amber: '#FFC857',
  red: '#FF4D5E',
  white: '#E8FFF1',
};
const MONO = '"JetBrains Mono", monospace';
const BODY = 'Inter, sans-serif';

export const D11 = {term: 72, msg: 72 + 72 * 5, cta: 72 + 72 * 5 + 72, total: 72 + 72 * 5 + 72 + 180};

type Line = {at: number; text: string; color?: string; progress?: [number, number]; ok?: string};
const LINES: Line[] = [
  {at: 0, text: '> проверка --инвойс invoice.pdf', color: T.white},
  {at: 30, text: '[1/3] код ТН ВЭД по описанию товара', progress: [44, 80], ok: 'определён'},
  {at: 100, text: '[2/3] ограничения ЕС, регламент 833/2014', progress: [114, 170], ok: 'сверено'},
  {at: 190, text: '[3/3] назначение и конечное использование', progress: [204, 250], ok: 'проверено'},
  {at: 270, text: 'РЕЗУЛЬТАТ: известен ДО отправки', color: T.amber},
];

const Bar: React.FC<{f: number; from: number; to: number}> = ({f, from, to}) => {
  const p = interpolate(f, [from, to], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const n = 18;
  const k = Math.round(p * n);
  return (
    <span>
      {'█'.repeat(k)}
      <span style={{color: T.dim}}>{'░'.repeat(n - k)}</span> {Math.round(p * 100)}%
    </span>
  );
};

export const Terminal: React.FC = () => {
  const f = useCurrentFrame();
  const flicker = 0.94 + random(`fl${Math.floor(f / 2)}`) * 0.06;
  const cursor = Math.floor(f / 9) % 2 === 0;
  const tl = f - D11.term;
  return (
    <AbsoluteFill style={{background: T.bg, overflow: 'hidden'}}>
      <Audio src={staticFile('d11-synthwave.wav')} />
      {/* CRT screen */}
      <div style={{position: 'absolute', left: 50, right: 50, top: 230, bottom: 420, borderRadius: 50, background: `radial-gradient(ellipse at center, #0B1C12 0%, ${T.screen} 70%, #030604 100%)`, boxShadow: 'inset 0 0 120px rgba(0,0,0,0.9), 0 0 0 14px #111814, 0 0 0 18px #26302A', opacity: flicker}} />
      <AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.28) 0 2px, transparent 2px 5px)', pointerEvents: 'none', zIndex: 4}} />

      {/* hook */}
      {f < D11.term && (
        <div style={{position: 'absolute', left: 100, right: 130, top: 420}}>
          <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 34, color: T.dim}}>{'> вопрос импортёра'}</div>
          <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 104, lineHeight: 1.08, color: T.red, marginTop: 30, textShadow: `0 0 24px ${T.red}`, transform: `translateX(${(random(`h${Math.floor(f / 3)}`) - 0.5) * 10}px)`}}>
            ТОВАР
            <br />
            ПОД
            <br />
            САНКЦИЯМИ?
          </div>
          <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 52, lineHeight: 1.2, color: T.white, marginTop: 50, opacity: fade(f, 10, 20)}}>
            Узнайте до отправки, а не на границе
          </div>
        </div>
      )}

      {/* terminal session */}
      {f >= D11.term && f < D11.msg && (
        <div style={{position: 'absolute', left: 100, right: 130, top: 330, fontFamily: MONO, fontWeight: 700, fontSize: 36, lineHeight: 1.45, color: T.green, textShadow: `0 0 10px rgba(57,255,136,0.6)`}}>
          <div style={{color: T.dim, fontSize: 28, marginBottom: 20}}>сборный груз · проверка до отправки</div>
          {LINES.map((ln, i) => {
            if (tl < ln.at) return null;
            const done = ln.progress && tl >= ln.progress[1];
            return (
              <div key={i} style={{marginBottom: 26, color: ln.color ?? T.green, fontSize: i === LINES.length - 1 ? 46 : 36}}>
                <div>{typed(ln.text, tl, ln.at, 0.6)}</div>
                {ln.progress && tl >= ln.progress[0] && (
                  <div style={{fontSize: 32}}>
                    <Bar f={tl} from={ln.progress[0]} to={ln.progress[1]} />
                  </div>
                )}
                {done && <div style={{color: T.white, transform: `scale(${sp(tl, ln.progress![1], {damping: 8})})`, transformOrigin: 'left', display: 'inline-block'}}>✓ {ln.ok}</div>}
              </div>
            );
          })}
          {cursor && <span>█</span>}
        </div>
      )}

      {/* message */}
      {f >= D11.msg && f < D11.cta && (() => {
        const l = f - D11.msg;
        return (
          <div style={{position: 'absolute', left: 100, right: 130, top: 460}}>
            <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 84, lineHeight: 1.1, color: T.green, textShadow: `0 0 24px ${T.green}`, transform: `scale(${interpolate(sp(l, 0, {damping: 9}), [0, 1], [1.4, 1])})`, transformOrigin: 'left'}}>
              ПРОВЕРЯЕМ
              <br />
              ДО ОТПРАВКИ
            </div>
            <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 50, lineHeight: 1.25, color: T.white, marginTop: 40, opacity: fade(l, 12, 22)}}>
              Включая санкционные коды — чтобы груз не застрял в пути
            </div>
          </div>
        );
      })()}

      {/* CTA */}
      {f >= D11.cta && (() => {
        const l = f - D11.cta;
        const b = sp(l, 20, {damping: 9, stiffness: 260});
        return (
          <div style={{position: 'absolute', left: 100, right: 130, top: 400}}>
            <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 40, color: T.dim}}>{'> следующий шаг'}</div>
            <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 64, lineHeight: 1.12, color: T.white, marginTop: 24, opacity: fade(l, 0, 10)}}>Пришлите инвойс или список товаров</div>
            <div style={{fontFamily: BODY, fontWeight: 600, fontSize: 42, lineHeight: 1.3, color: '#9FDDB8', marginTop: 24, opacity: fade(l, 8, 18)}}>Проверим товар и посчитаем доставку до склада в Москве</div>
            <div style={{marginTop: 70, transform: `scale(${interpolate(b, [0, 1], [0.5, 1])})`, opacity: Math.min(1, b * 2)}}>
              <div style={{border: `5px solid ${T.green}`, borderRadius: 20, padding: '30px 20px 34px', textAlign: 'center', background: 'rgba(57,255,136,0.12)', boxShadow: `0 0 40px rgba(57,255,136,0.5)`}}>
                <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 60, color: T.green, lineHeight: 1}}>[ РАССЧИТАТЬ ]</div>
                <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 36, color: T.green, marginTop: 12}}>стоимость доставки</div>
              </div>
            </div>
          </div>
        );
      })()}
    </AbsoluteFill>
  );
};
