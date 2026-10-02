import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {fade, sp} from '../kit';

// Day 12 — "5 ошибок импортёра": a newspaper front page. Each mistake is a headline that gets
// struck through with a red marker on the beat, the fix is handwritten below. 120 BPM.

const N = {
  paper: '#EFE9DC',
  paperDark: '#E2DACA',
  ink: '#161412',
  grey: '#6E675C',
  red: '#D21F2B',
};
const HEAD = 'Oswald, sans-serif';
const SERIF = '"PT Serif", Georgia, serif';
const HAND = 'Caveat, cursive';

const ERRORS = [
  {e: 'Везти через «серое» карго', fix: 'белая растаможка и документы для бухгалтерии'},
  {e: 'Не проверить товар на санкции', fix: 'проверим, включая санкционные коды, до отправки'},
  {e: 'Забыть про объём груза', fix: 'платите за вес или объём — что больше, укажите габариты'},
  {e: 'Ввезти товар без «Честного знака»', fix: 'марки для маркируемых товаров закажем мы'},
  {e: 'Не учесть праздники в Китае', fix: 'в праздники сроки растут — планируйте отправку заранее'},
];

export const D12 = {err0: 60, errLen: 120, cta: 60 + 120 * 5, total: 60 + 120 * 5 + 180};

const Masthead: React.FC = () => (
  <div style={{position: 'absolute', left: 80, right: 110, top: 270, borderBottom: `6px double ${N.ink}`, paddingBottom: 10}}>
    <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: SERIF, fontSize: 24, color: N.grey}}>
      <span>Выпуск для бизнеса</span>
      <span>Европа · Китай → Москва</span>
    </div>
    <div style={{fontFamily: HEAD, fontWeight: 700, fontSize: 86, color: N.ink, textAlign: 'center', letterSpacing: '0.02em', lineHeight: 1.05}}>ВЕСТНИК ИМПОРТЁРА</div>
  </div>
);

const Strike: React.FC<{t: number}> = ({t}) => (
  <svg width={880} height={230} viewBox="0 0 880 230" style={{position: 'absolute', left: -10, top: 0, overflow: 'visible'}}>
    <path d="M 0 190 Q 300 150 480 110 T 900 30" fill="none" stroke={N.red} strokeWidth={16} strokeLinecap="round" pathLength={1} strokeDasharray={`${t} 1`} opacity={0.9} />
  </svg>
);

export const Newspaper: React.FC = () => {
  const f = useCurrentFrame();
  const idx = Math.floor((f - D12.err0) / D12.errLen);
  const l = (f - D12.err0) % D12.errLen;
  return (
    <AbsoluteFill style={{background: N.paper, overflow: 'hidden'}}>
      <Audio src={staticFile('d12-breaks.wav')} />
      {/* newsprint texture */}
      <AbsoluteFill style={{backgroundImage: `radial-gradient(${N.paperDark} 1px, transparent 1.5px)`, backgroundSize: '7px 7px', opacity: 0.6}} />
      <Masthead />

      {/* hook: front page */}
      {f < D12.err0 && (
        <div style={{position: 'absolute', left: 80, right: 110, top: 470, transform: `scale(${interpolate(sp(f, -8, {damping: 10}), [0, 1], [1.25, 1])}) rotate(${(1 - sp(f, -8, {damping: 10})) * -3}deg)`}}>
          <div style={{fontFamily: HEAD, fontWeight: 700, fontSize: 250, lineHeight: 0.9, color: N.red}}>5</div>
          <div style={{fontFamily: HEAD, fontWeight: 700, fontSize: 116, lineHeight: 0.98, color: N.ink, textTransform: 'uppercase'}}>
            ошибок
            <br />
            импортёра,
          </div>
          <div style={{fontFamily: HEAD, fontWeight: 500, fontSize: 74, lineHeight: 1.05, color: N.ink, textTransform: 'uppercase', marginTop: 10, opacity: fade(f, 10, 18)}}>которые стоят денег</div>
          <div style={{fontFamily: SERIF, fontSize: 36, lineHeight: 1.4, color: N.grey, marginTop: 30, opacity: fade(f, 18, 26), columnCount: 2, columnGap: 40}}>
            Собрали самые частые промахи при ввозе товаров из Европы и Китая — и как их избежать.
          </div>
        </div>
      )}

      {/* mistakes */}
      {f >= D12.err0 && f < D12.cta && (() => {
        const er = ERRORS[idx];
        const s = sp(l, 0, {damping: 12, stiffness: 220});
        const strike = interpolate(l, [42, 54], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        const fixChars = Math.max(0, Math.floor((l - 58) / 0.7));
        return (
          <div style={{position: 'absolute', left: 80, right: 110, top: 470}}>
            <div style={{display: 'flex', alignItems: 'baseline', gap: 20, borderBottom: `3px solid ${N.ink}`, paddingBottom: 12}}>
              <div style={{fontFamily: HEAD, fontWeight: 700, fontSize: 40, color: N.red}}>{`ОШИБКА №${idx + 1}`}</div>
              <div style={{fontFamily: SERIF, fontSize: 28, color: N.grey}}>из 5</div>
            </div>
            <div style={{position: 'relative', marginTop: 40, transform: `translateY(${(1 - s) * 80}px)`, opacity: s}}>
              <div style={{fontFamily: HEAD, fontWeight: 700, fontSize: 108, lineHeight: 1.0, color: N.ink, textTransform: 'uppercase', minHeight: 216}}>{er.e}</div>
              {strike > 0 && <Strike t={strike} />}
            </div>
            {l >= 58 && (
              <div style={{marginTop: 50, transform: `rotate(-2deg)`}}>
                <div style={{fontFamily: HAND, fontWeight: 700, fontSize: 52, color: N.red}}>Как правильно:</div>
                <div style={{fontFamily: HAND, fontWeight: 700, fontSize: 74, lineHeight: 1.0, color: N.red, marginTop: 6}}>{er.fix.slice(0, fixChars)}</div>
              </div>
            )}
            {/* decorative column text */}
            <div style={{position: 'absolute', left: 0, right: 0, top: 860, fontFamily: SERIF, fontSize: 22, lineHeight: 1.5, color: '#B4AC9D', columnCount: 3, columnGap: 30, height: 120, overflow: 'hidden'}}>
              {'Импорт · логистика · таможня · сборные грузы · Римини · Вильнюс · Гуанчжоу · документы · маркировка · '.repeat(6)}
            </div>
          </div>
        );
      })()}

      {/* CTA */}
      {f >= D12.cta && (() => {
        const c = f - D12.cta;
        const b = sp(c, 24, {damping: 9, stiffness: 260});
        return (
          <div style={{position: 'absolute', left: 80, right: 110, top: 470}}>
            <div style={{fontFamily: HEAD, fontWeight: 700, fontSize: 104, lineHeight: 1.0, color: N.ink, textTransform: 'uppercase', transform: `scale(${interpolate(sp(c, 0, {damping: 9}), [0, 1], [1.3, 1])})`, transformOrigin: 'left'}}>
              Без ошибок —
              <br />
              <span style={{color: N.red}}>с нами</span>
            </div>
            <div style={{fontFamily: SERIF, fontSize: 42, lineHeight: 1.35, color: N.ink, marginTop: 30, opacity: fade(c, 10, 20)}}>
              Пришлите инвойс или список товаров — проверим и посчитаем доставку до склада в Москве.
            </div>
            <div style={{marginTop: 60, transform: `rotate(-3deg) scale(${interpolate(b, [0, 1], [2, 1])})`, opacity: Math.min(1, b * 3), border: `8px solid ${N.red}`, padding: '24px 10px 28px', textAlign: 'center'}}>
              <div style={{fontFamily: HEAD, fontWeight: 700, fontSize: 70, color: N.red, lineHeight: 1}}>РАССЧИТАТЬ</div>
              <div style={{fontFamily: HEAD, fontWeight: 700, fontSize: 46, color: N.red, marginTop: 8}}>СТОИМОСТЬ ДОСТАВКИ</div>
            </div>
          </div>
        );
      })()}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 60%, rgba(60,40,10,0.18) 100%)', pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};
