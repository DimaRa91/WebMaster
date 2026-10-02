import React from 'react';
import {AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';

// Day 05 — "Миф или факт": swipe cards. Each card: statement → 1-second guess window
// with a timer → swipe on the beat (red flood = миф, green = факт) → answer.
// 120 BPM: 1 beat = 15 frames; one card = 2 bars = 120 frames. Events mirror music/compose_d05.py.

const M = {
  base: '#14121C',
  myth: '#FF3B5C',
  fact: '#19C37D',
  card: '#FFFFFF',
  ink: '#15131D',
  soft: '#6E6A80',
};
const FONT = 'Manrope, sans-serif';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const sp = (f: number, at: number, cfg: object = {}) => spring({frame: f - at, fps: 30, config: {damping: 12, stiffness: 220, mass: 0.6, ...cfg}});

const CARDS: {q: string; myth: boolean; a: string[]}[] = [
  {q: 'Из Европы сейчас нельзя возить мелкие партии', myth: true, a: ['Возим от одной коробки.', 'Груз копится на складе', 'и уходит одной партией.']},
  {q: 'Если не можете платить в Европу — сделка сорвётся', myth: true, a: ['Проведём оплату инвойса', 'поставщику за вас.']},
  {q: 'Сборный груз — это всегда «серая» растаможка', myth: true, a: ['Белая растаможка', 'и полный пакет документов', 'для бухгалтерии.']},
  {q: 'Что товар под санкциями, узнаешь только на границе', myth: true, a: ['Проверим товар, включая', 'санкционные коды, ещё', 'до отправки.']},
  {q: 'Из Гуанчжоу можно везти по ЖД, авто и авиа', myth: false, a: ['ЖД — 35–45 дней,', 'авто — 25–30 дней,', 'авиа — организуем.']},
];

export const D05 = {
  card0: 60,
  cardLen: 120,
  swipeAt: 45, // local frame in a card
  cta: 60 + 120 * CARDS.length, // 660
  total: 660 + 180,
};

const Verdict: React.FC<{myth: boolean; size: number}> = ({myth, size}) => (
  <div style={{fontFamily: FONT, fontWeight: 800, fontSize: size, lineHeight: 1, color: '#fff', letterSpacing: '-0.02em'}}>{myth ? 'МИФ' : 'ФАКТ'}</div>
);

const Card: React.FC<{f: number; i: number}> = ({f, i}) => {
  const c = CARDS[i];
  const enter = sp(f, 0, {damping: 13, stiffness: 200});
  const sw = interpolate(f, [D05.swipeAt, D05.swipeAt + 12], [0, 1], {...clamp, easing: (t) => t * t});
  const dir = c.myth ? -1 : 1;
  const wiggle = f > 14 && f < D05.swipeAt ? Math.sin(f * 0.5) * 3 : 0;
  const timer = interpolate(f, [12, D05.swipeAt], [1, 0], clamp);
  const flood = interpolate(f, [D05.swipeAt, D05.swipeAt + 8], [0, 1], clamp);
  const ans = sp(f, D05.swipeAt + 8, {damping: 11, stiffness: 240});
  const color = c.myth ? M.myth : M.fact;
  return (
    <AbsoluteFill>
      {/* verdict flood */}
      <AbsoluteFill style={{background: color, clipPath: `circle(${flood * 160}% at ${c.myth ? '0%' : '100%'} 50%)`}} />
      {/* statement card */}
      {sw < 1 && (
        <div
          style={{
            position: 'absolute',
            left: 110,
            top: 420,
            width: 860,
            height: 760,
            borderRadius: 48,
            background: M.card,
            boxShadow: '0 40px 80px rgba(0,0,0,0.45)',
            transform: `translate(${dir * sw * 1400}px, ${(1 - enter) * 900 - sw * 120}px) rotate(${wiggle + dir * sw * 30 + (1 - enter) * 12}deg)`,
            padding: '56px 56px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 28, color: M.soft, letterSpacing: '0.08em'}}>{`УТВЕРЖДЕНИЕ ${i + 1} / ${CARDS.length}`}</div>
          <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 200, lineHeight: 0.6, color: '#E9E6F2', marginTop: 40}}>“</div>
          <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 64, lineHeight: 1.12, color: M.ink, marginTop: 10, letterSpacing: '-0.01em'}}>{c.q}</div>
          <div style={{flex: 1}} />
          {/* guess timer */}
          <div style={{height: 14, borderRadius: 7, background: '#EEEBF5', overflow: 'hidden'}}>
            <div style={{width: `${timer * 100}%`, height: '100%', background: M.ink}} />
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 20, fontFamily: FONT, fontWeight: 800, fontSize: 34}}>
            <span style={{color: M.myth}}>← МИФ</span>
            <span style={{color: M.soft, fontWeight: 700, fontSize: 28}}>{f < D05.swipeAt ? `${Math.max(1, Math.ceil(timer * 2))} сек` : ''}</span>
            <span style={{color: M.fact}}>ФАКТ →</span>
          </div>
          {/* stamp on the card while it flies */}
          {sw > 0 && (
            <div style={{position: 'absolute', top: 60, [c.myth ? 'right' : 'left']: 50, border: `10px solid ${color}`, borderRadius: 20, padding: '6px 24px', transform: `rotate(${c.myth ? 14 : -14}deg)`, fontFamily: FONT, fontWeight: 800, fontSize: 80, color}}>{c.myth ? 'МИФ' : 'ФАКТ'}</div>
          )}
        </div>
      )}
      {/* answer */}
      {f >= D05.swipeAt + 8 && (
        <div style={{position: 'absolute', left: 110, right: 120, top: 500, transform: `translateY(${(1 - ans) * 120}px)`, opacity: Math.min(1, ans * 2)}}>
          <div style={{transform: `scale(${interpolate(ans, [0, 1], [1.5, 1])})`, transformOrigin: 'left center'}}>
            <Verdict myth={c.myth} size={230} />
          </div>
          <div style={{height: 10, width: 160, background: '#fff', borderRadius: 5, margin: '30px 0 40px'}} />
          {c.a.map((ln, k) => (
            <div key={k} style={{fontFamily: FONT, fontWeight: 800, fontSize: 60, lineHeight: 1.18, color: '#fff', opacity: interpolate(f, [D05.swipeAt + 14 + k * 6, D05.swipeAt + 22 + k * 6], [0, 1], clamp)}}>
              {ln}
            </div>
          ))}
        </div>
      )}
    </AbsoluteFill>
  );
};

const Hook: React.FC<{f: number}> = ({f}) => {
  const a = sp(f, -8, {damping: 9});
  const b = sp(f, -3, {damping: 9});
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: M.myth, clipPath: `polygon(0 0, ${50 + Math.sin(f / 6) * 4}% 0, ${50 - Math.sin(f / 6) * 4}% 100%, 0 100%)`}} />
      <AbsoluteFill style={{background: M.fact, clipPath: `polygon(${50 + Math.sin(f / 6) * 4}% 0, 100% 0, 100% 100%, ${50 - Math.sin(f / 6) * 4}% 100%)`}} />
      <div style={{position: 'absolute', left: 90, top: 470, transform: `translateX(${(1 - a) * -600}px) rotate(-4deg)`}}>
        <Verdict myth size={210} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 720, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 90, color: '#fff', transform: `scale(${interpolate(sp(f, 4, {damping: 7}), [0, 1], [1.8, 1])})`}}>или</div>
      <div style={{position: 'absolute', right: 120, top: 860, transform: `translateX(${(1 - b) * 600}px) rotate(4deg)`}}>
        <Verdict myth={false} size={210} />
      </div>
      <div style={{position: 'absolute', left: 90, right: 120, top: 1160, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 46, color: '#fff', opacity: interpolate(f, [18, 26], [0, 1], clamp), background: M.ink, borderRadius: 24, padding: '20px 10px'}}>
        5 утверждений об импорте
      </div>
    </AbsoluteFill>
  );
};

const Cta: React.FC<{f: number}> = ({f}) => {
  const l = f - D05.cta;
  const a = sp(l, 0, {damping: 10});
  const b = sp(l, 16, {damping: 9, stiffness: 260});
  return (
    <AbsoluteFill style={{background: M.base}}>
      <div style={{position: 'absolute', left: 90, right: 120, top: 330, transform: `translateY(${(1 - a) * 80}px)`, opacity: a}}>
        <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 80, lineHeight: 1.05, color: '#fff'}}>Сколько угадали?</div>
        <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 44, lineHeight: 1.3, color: '#BDB8CF', marginTop: 30}}>
          Напишите в комментариях,
          <br />
          а остальное посчитаем мы
        </div>
      </div>
      <div style={{position: 'absolute', left: 90, right: 120, top: 760, display: 'flex', gap: 18}}>
        {CARDS.map((c, k) => (
          <div key={k} style={{flex: 1, height: 120, borderRadius: 24, background: c.myth ? M.myth : M.fact, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 30, color: '#fff', transform: `translateY(${(1 - sp(l, 6 + k * 3, {damping: 9})) * 200}px)`}}>
            {c.myth ? 'МИФ' : 'ФАКТ'}
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 90, right: 120, top: 980, transform: `scale(${interpolate(b, [0, 1], [0.5, 1])})`, opacity: Math.min(1, b * 2)}}>
        <div style={{background: M.fact, borderRadius: 40, padding: '34px 20px 38px', textAlign: 'center', boxShadow: '0 14px 0 #0E8A57'}}>
          <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 64, color: '#fff', lineHeight: 1}}>РАССЧИТАТЬ</div>
          <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 42, color: '#fff', marginTop: 10}}>СТОИМОСТЬ ДОСТАВКИ</div>
        </div>
        <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 34, color: '#BDB8CF', textAlign: 'center', marginTop: 30, opacity: interpolate(l, [36, 46], [0, 1], clamp)}}>
          Пришлите инвойс или список товаров
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const MythFact: React.FC = () => {
  const f = useCurrentFrame();
  const idx = Math.floor((f - D05.card0) / D05.cardLen);
  return (
    <AbsoluteFill style={{background: M.base, overflow: 'hidden'}}>
      <Audio src={staticFile('d05-pop.wav')} />
      {f < D05.card0 && <Hook f={f} />}
      {f >= D05.card0 && f < D05.cta && <Card f={(f - D05.card0) % D05.cardLen} i={idx} />}
      {f >= D05.cta && <Cta f={f} />}
      {/* subtle grain */}
      <AbsoluteFill style={{opacity: 0.05, backgroundImage: 'radial-gradient(#fff 1px, transparent 1.5px)', backgroundSize: '6px 6px', pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};
