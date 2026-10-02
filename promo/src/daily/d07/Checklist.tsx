import React from 'react';
import {AbsoluteFill, Audio, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import {fade, sp, typed} from '../kit';

// Day 07 — "Чек-лист перед заказом у фабрики в Италии": sticky notes pinned to a cork board,
// written with a marker on the beat. 100 BPM: 1 beat = 18 frames, 1 bar = 72 frames.

const K = {
  cork: '#C49A6C',
  corkDark: '#A87F55',
  ink: '#1C1C1C',
  red: '#D7263D',
  notes: ['#FFE873', '#FF9FB2', '#9FD8FF', '#B6F09C', '#FFC58A', '#D9C2FF'],
};
const HAND = 'Caveat, cursive';
const BODY = 'Nunito, sans-serif';

const ITEMS = [
  {t: 'Инвойс или список товаров', s: 'с ценами и количеством'},
  {t: 'Вес брутто и габариты', s: 'платите за вес или объём — что больше'},
  {t: 'Коды ТН ВЭД', s: 'проверим на санкции до отправки'},
  {t: 'Нужен «Честный знак»?', s: 'марки закажем мы'},
  {t: 'Есть хрупкое?', s: 'сделаем обрешётку и застрахуем'},
  {t: 'Адрес фабрики', s: 'заберём товар сами'},
];

export const D07 = {item0: 72, itemLen: 72, cta: 72 + 72 * 6, total: 72 + 72 * 6 + 198};

const Pin: React.FC<{color?: string}> = ({color = K.red}) => (
  <div style={{position: 'absolute', left: '50%', top: -18, width: 36, height: 36, marginLeft: -18, borderRadius: 18, background: `radial-gradient(circle at 35% 35%, #fff8 0 4px, ${color} 6px)`, boxShadow: '0 6px 8px rgba(0,0,0,0.35)'}} />
);

const Note: React.FC<{color: string; w: number; h: number; rot: number; children: React.ReactNode; style?: React.CSSProperties}> = ({color, w, h, rot, children, style}) => (
  <div
    style={{
      position: 'absolute',
      width: w,
      height: h,
      background: color,
      backgroundImage: 'linear-gradient(160deg, transparent 70%, rgba(0,0,0,0.07))',
      boxShadow: '0 18px 30px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)',
      transform: `rotate(${rot}deg)`,
      padding: '30px 28px',
      boxSizing: 'border-box',
      ...style,
    }}
  >
    <Pin />
    {children}
  </div>
);

const Tick: React.FC<{t: number; size?: number}> = ({t, size = 70}) => (
  <svg width={size} height={size} viewBox="0 0 70 70" style={{position: 'absolute', right: 18, bottom: 14}}>
    <path d="M 8 38 L 26 56 L 62 12" fill="none" stroke={K.red} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${t} 1`} />
  </svg>
);

export const Checklist: React.FC = () => {
  const f = useCurrentFrame();
  const hookOut = fade(f, D07.item0 - 10, D07.item0, 1, 0);
  return (
    <AbsoluteFill style={{background: K.cork, overflow: 'hidden'}}>
      <Audio src={staticFile('d07-acoustic.wav')} />
      {/* cork texture */}
      <AbsoluteFill style={{backgroundImage: `radial-gradient(${K.corkDark} 2px, transparent 2.5px), radial-gradient(#D7B183 1.5px, transparent 2px)`, backgroundSize: '22px 22px, 15px 15px', backgroundPosition: '0 0, 7px 9px', opacity: 0.7}} />
      <AbsoluteFill style={{boxShadow: 'inset 0 0 0 40px #6B4A2B, inset 0 0 120px rgba(0,0,0,0.45)'}} />

      {/* hook */}
      {f < D07.item0 && (
        <Note color={K.notes[0]} w={860} h={760} rot={-3} style={{left: 110, top: 420, opacity: hookOut, transform: `rotate(-3deg) scale(${interpolate(sp(f, -6, {damping: 9}), [0, 1], [1.3, 1])})`}}>
          <div style={{fontFamily: HAND, fontWeight: 700, fontSize: 110, lineHeight: 0.95, color: K.ink, marginTop: 30}}>
            Заказываете
            <br />
            на фабрике
            <br />в <span style={{color: K.red}}>Италии?</span>
          </div>
          <div style={{fontFamily: HAND, fontWeight: 600, fontSize: 64, color: K.ink, marginTop: 40, opacity: fade(f, 14, 24)}}>
            Проверьте 6 пунктов →
          </div>
        </Note>
      )}

      {/* board title */}
      {f >= D07.item0 && (
        <div style={{position: 'absolute', left: 90, right: 120, top: 290, fontFamily: HAND, fontWeight: 700, fontSize: 92, color: '#FFF4E0', textShadow: '0 4px 10px rgba(0,0,0,0.4)', opacity: fade(f, D07.item0, D07.item0 + 10)}}>
          Чек-лист перед заказом
        </div>
      )}

      {/* six notes */}
      {f >= D07.item0 &&
        ITEMS.map((it, i) => {
          const at = D07.item0 + i * D07.itemLen;
          if (f < at) return null;
          const col = i % 2;
          const row = Math.floor(i / 2);
          const s = sp(f, at, {damping: 11, stiffness: 240});
          const rot = (random(`r${i}`) - 0.5) * 6;
          const fresh = f < at + D07.itemLen && f < D07.cta;
          return (
            <Note
              key={i}
              color={K.notes[i]}
              w={420}
              h={300}
              rot={rot}
              style={{left: 95 + col * 450, top: 430 + row * 335, transform: `rotate(${rot}deg) scale(${interpolate(s, [0, 1], [1.6, 1])})`, zIndex: fresh ? 2 : 1}}
            >
              <div style={{fontFamily: BODY, fontWeight: 900, fontSize: 26, color: 'rgba(0,0,0,0.45)'}}>{`0${i + 1}`}</div>
              <div style={{fontFamily: HAND, fontWeight: 700, fontSize: 54, lineHeight: 1, color: K.ink, marginTop: 6, minHeight: 108}}>{typed(it.t, f, at + 4, 1.1)}</div>
              <div style={{fontFamily: HAND, fontWeight: 600, fontSize: 36, lineHeight: 1.05, color: '#3A3A3A', marginTop: 8, opacity: fade(f, at + 34, at + 42), paddingRight: 60}}>{it.s}</div>
              <Tick t={fade(f, at + 50, at + 60)} />
            </Note>
          );
        })}

      {/* CTA */}
      {f >= D07.cta && (() => {
        const s = sp(f, D07.cta, {damping: 10, stiffness: 200});
        return (
          <>
            <AbsoluteFill style={{background: `rgba(30,20,10,${0.55 * s})`, zIndex: 5}} />
            <Note color="#FFFFFF" w={880} h={900} rot={2} style={{zIndex: 6, left: 100, top: 400, transform: `translateY(${(1 - s) * 1200}px) rotate(${2 - (1 - s) * 10}deg)`}}>
              <div style={{fontFamily: HAND, fontWeight: 700, fontSize: 96, lineHeight: 0.98, color: K.ink, marginTop: 20}}>
                Всё собрали?
                <br />
                <span style={{color: K.red}}>Пришлите нам</span>
              </div>
              <div style={{fontFamily: HAND, fontWeight: 600, fontSize: 56, color: '#333', marginTop: 30, lineHeight: 1.1}}>
                инвойс или список товаров —
                <br />
                посчитаем доставку до Москвы
              </div>
              <div
                style={{
                  marginTop: 70,
                  border: `8px solid ${K.red}`,
                  borderRadius: 24,
                  padding: '20px 10px',
                  textAlign: 'center',
                  transform: `rotate(-3deg) scale(${interpolate(sp(f, D07.cta + 36, {damping: 8, stiffness: 300}), [0, 1], [2, 1])})`,
                  opacity: fade(f, D07.cta + 36, D07.cta + 40),
                }}
              >
                <div style={{fontFamily: BODY, fontWeight: 900, fontSize: 56, color: K.red, lineHeight: 1}}>РАССЧИТАТЬ</div>
                <div style={{fontFamily: BODY, fontWeight: 900, fontSize: 38, color: K.red, marginTop: 8}}>СТОИМОСТЬ ДОСТАВКИ</div>
              </div>
            </Note>
          </>
        );
      })()}
      <AbsoluteFill style={{background: 'radial-gradient(circle at 30% 15%, rgba(255,240,200,0.18), transparent 55%)', pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};
