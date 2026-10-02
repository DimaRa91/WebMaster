import React from 'react';
import {AbsoluteFill, Audio, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import {fade, sp} from '../kit';

// Day 09 — "Карго или белая доставка из Китая?" A versus battle: grey glitchy cargo (top)
// against clean neon "white" delivery (bottom), four rounds and a score.
// 150 BPM: 1 beat = 12 frames, 1 bar = 48 frames.

const V = {
  bg: '#07070C',
  grey: '#6C6C78',
  greyBg: '#1A1A22',
  neon: '#00F5C4',
  neon2: '#FF2E88',
  white: '#F4F6FF',
};
const FONT = '"Russo One", sans-serif';
const BODY = 'Manrope, sans-serif';

const ROUNDS = [
  {k: 'ДОКУМЕНТЫ', cargo: 'товар без документов на вашу компанию', white: 'полный пакет документов для бухгалтерии'},
  {k: 'РАСТАМОЖКА', cargo: '«серая» схема через третьих лиц', white: 'белая растаможка, всё официально'},
  {k: 'РИСКИ', cargo: 'груз могут задержать — вернуть сложно', white: 'груз застрахован, товар проверен по санкционным кодам'},
  {k: 'ПРОДАЖИ', cargo: 'дешевле на старте, но товар сложно показать в учёте', white: 'товар можно законно продавать, марки «Честный знак» закажем'},
];

export const D09 = {round0: 48, roundLen: 96, verdict: 48 + 96 * 4, cta: 48 + 96 * 4 + 96, total: 48 + 96 * 4 + 96 + 144};

const Glitch: React.FC<{f: number; children: React.ReactNode; amt?: number}> = ({f, children, amt = 1}) => {
  const j = Math.floor(f / 3);
  const dx = (random(`gx${j}`) - 0.5) * 16 * amt;
  return (
    <div style={{position: 'relative'}}>
      <div style={{position: 'absolute', inset: 0, transform: `translateX(${dx + 4}px)`, color: '#FF2E88', opacity: 0.35 * amt, mixBlendMode: 'screen'}}>{children}</div>
      <div style={{position: 'absolute', inset: 0, transform: `translateX(${-dx - 4}px)`, color: '#3AA0FF', opacity: 0.35 * amt, mixBlendMode: 'screen'}}>{children}</div>
      <div style={{position: 'relative'}}>{children}</div>
    </div>
  );
};

const Panel: React.FC<{cargo: boolean; f: number; at: number; text: string; win?: boolean}> = ({cargo, f, at, text, win}) => {
  const s = sp(f, at, {damping: 12, stiffness: 240});
  const color = cargo ? V.grey : V.neon;
  return (
    <div
      style={{
        position: 'absolute',
        left: 90,
        right: 120,
        top: cargo ? 470 : 1010,
        height: 380,
        borderRadius: 28,
        border: `4px solid ${color}`,
        background: cargo ? `repeating-linear-gradient(0deg, ${V.greyBg} 0 3px, #15151C 3px 6px)` : 'rgba(0,245,196,0.06)',
        boxShadow: cargo ? 'none' : `0 0 40px rgba(0,245,196,0.35), inset 0 0 30px rgba(0,245,196,0.15)`,
        padding: '34px 36px',
        boxSizing: 'border-box',
        transform: `translateX(${(1 - s) * (cargo ? -900 : 900)}px)`,
      }}
    >
      <div style={{fontFamily: FONT, fontSize: 52, color, letterSpacing: '0.03em'}}>{cargo ? 'КАРГО' : 'БЕЛАЯ ДОСТАВКА'}</div>
      <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 48, lineHeight: 1.18, color: cargo ? '#A9A9B6' : V.white, marginTop: 22}}>
        {cargo ? <Glitch f={f} amt={0.6}>{text}</Glitch> : text}
      </div>
      {win !== undefined && f >= at + 30 && (
        <div style={{position: 'absolute', right: -16, top: -26, width: 86, height: 86, borderRadius: 43, background: win ? V.neon : '#2A2A33', border: `4px solid ${win ? V.neon : V.grey}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontSize: 46, color: win ? V.bg : V.grey, transform: `scale(${sp(f, at + 30, {damping: 8, stiffness: 320})})`}}>{win ? '✓' : '✕'}</div>
      )}
    </div>
  );
};

export const Versus: React.FC = () => {
  const f = useCurrentFrame();
  const pulse = 1 + 0.03 * Math.max(0, 1 - (f % 24) / 8);
  const round = Math.floor((f - D09.round0) / D09.roundLen);
  const inRounds = f >= D09.round0 && f < D09.verdict;
  const rl = (f - D09.round0) % D09.roundLen;
  const score = Math.max(0, Math.min(4, Math.floor((f - D09.round0 - 30) / D09.roundLen) + 1));
  return (
    <AbsoluteFill style={{background: V.bg, overflow: 'hidden'}}>
      <Audio src={staticFile('d09-trap.wav')} />
      {/* neon floor grid on the lower half */}
      <AbsoluteFill style={{top: 960, backgroundImage: `linear-gradient(rgba(0,245,196,0.18) 2px, transparent 2px), linear-gradient(90deg, rgba(0,245,196,0.18) 2px, transparent 2px)`, backgroundSize: '80px 80px', backgroundPosition: `0 ${(f * 3) % 80}px`, transform: 'perspective(600px) rotateX(55deg)', transformOrigin: 'top', opacity: 0.6}} />
      {/* grey static on the upper half */}
      <AbsoluteFill style={{bottom: 960, opacity: 0.08, backgroundImage: `radial-gradient(#fff 1px, transparent 1.5px)`, backgroundSize: '6px 6px', backgroundPosition: `0 ${Math.floor(f / 6) * 2}px`}} />

      {/* hook */}
      {f < D09.round0 && (
        <>
          <div style={{position: 'absolute', left: 90, right: 120, top: 420, transform: `translateX(${(1 - sp(f, -8, {damping: 10})) * -600}px)`}}>
            <Glitch f={f}>
              <div style={{fontFamily: FONT, fontSize: 170, color: V.grey, lineHeight: 1}}>КАРГО</div>
            </Glitch>
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 690, textAlign: 'center', fontFamily: FONT, fontSize: 110, color: V.neon2, textShadow: `0 0 30px ${V.neon2}`, transform: `scale(${pulse * interpolate(sp(f, -2, {damping: 7}), [0, 1], [2, 1])})`}}>VS</div>
          <div style={{position: 'absolute', left: 90, right: 120, top: 900, textAlign: 'right', transform: `translateX(${(1 - sp(f, -4, {damping: 10})) * 600}px)`}}>
            <div style={{fontFamily: FONT, fontSize: 116, color: V.neon, lineHeight: 1, textShadow: `0 0 30px ${V.neon}`}}>БЕЛАЯ</div>
            <div style={{fontFamily: FONT, fontSize: 92, color: V.white, lineHeight: 1.1}}>ДОСТАВКА</div>
          </div>
          <div style={{position: 'absolute', left: 90, right: 120, top: 1260, textAlign: 'center', fontFamily: BODY, fontWeight: 800, fontSize: 46, color: V.white, opacity: fade(f, 12, 20)}}>Что выбрать бизнесу, который везёт из Китая?</div>
        </>
      )}

      {/* rounds */}
      {inRounds && (
        <>
          <div style={{position: 'absolute', left: 90, right: 120, top: 290, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div style={{fontFamily: FONT, fontSize: 40, color: V.white}}>{`РАУНД ${round + 1}/4`}</div>
            <div style={{fontFamily: FONT, fontSize: 40, color: V.white}}>
              <span style={{color: V.grey}}>0</span> : <span style={{color: V.neon}}>{score}</span>
            </div>
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 880, textAlign: 'center', fontFamily: FONT, fontSize: 76, color: V.neon2, textShadow: `0 0 24px ${V.neon2}`, transform: `scale(${interpolate(sp(rl, 0, {damping: 8}), [0, 1], [1.8, 1]) * pulse})`}}>
            {ROUNDS[round].k}
          </div>
          <Panel cargo f={rl} at={6} text={ROUNDS[round].cargo} win={false} />
          <Panel cargo={false} f={rl} at={18} text={ROUNDS[round].white} win />
        </>
      )}

      {/* verdict */}
      {f >= D09.verdict && f < D09.cta && (() => {
        const l = f - D09.verdict;
        return (
          <div style={{position: 'absolute', left: 90, right: 120, top: 340}}>
            <div style={{fontFamily: FONT, fontSize: 60, color: V.white, opacity: fade(l, 0, 8)}}>ДЛЯ БИЗНЕСА</div>
            <div style={{fontFamily: FONT, fontSize: 130, color: V.neon, textShadow: `0 0 40px ${V.neon}`, lineHeight: 1, transform: `scale(${interpolate(sp(l, 4, {damping: 8}), [0, 1], [1.6, 1])})`, transformOrigin: 'left'}}>4 : 0</div>
            <div style={{fontFamily: FONT, fontSize: 70, color: V.neon, marginTop: 10, opacity: fade(l, 10, 18)}}>БЕЛАЯ ДОСТАВКА</div>
            <div style={{marginTop: 60, display: 'flex', flexDirection: 'column', gap: 18}}>
              {[
                ['ЖД', '35–45 дней'],
                ['АВТО', '25–30 дней'],
                ['АВИА', 'организуем'],
              ].map(([k, v], i) => (
                <div key={k} style={{display: 'flex', justifyContent: 'space-between', border: `3px solid ${V.neon}`, borderRadius: 18, padding: '18px 26px', opacity: fade(l, 24 + i * 12, 30 + i * 12), transform: `translateX(${(1 - sp(l, 24 + i * 12)) * 300}px)`}}>
                  <span style={{fontFamily: FONT, fontSize: 48, color: V.white}}>{k}</span>
                  <span style={{fontFamily: FONT, fontSize: 48, color: V.neon}}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 40, color: V.white, marginTop: 30, opacity: fade(l, 60, 70)}}>Гуанчжоу → Москва, белая растаможка</div>
          </div>
        );
      })()}

      {/* CTA */}
      {f >= D09.cta && (() => {
        const l = f - D09.cta;
        const b = sp(l, 12, {damping: 9, stiffness: 260});
        return (
          <>
            <div style={{position: 'absolute', left: 90, right: 120, top: 380, opacity: fade(l, 0, 8)}}>
              <div style={{fontFamily: FONT, fontSize: 92, color: V.white, lineHeight: 1.05}}>ВЕЗЁТЕ</div>
              <div style={{fontFamily: FONT, fontSize: 92, color: V.white, lineHeight: 1.05}}>ИЗ КИТАЯ?</div>
              <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 44, color: '#B9BCCB', marginTop: 30, lineHeight: 1.3}}>Пришлите инвойс или список товаров — посчитаем белую доставку до Москвы</div>
            </div>
            <div style={{position: 'absolute', left: 90, right: 120, top: 1030, transform: `scale(${interpolate(b, [0, 1], [0.5, 1]) * pulse})`, opacity: Math.min(1, b * 2)}}>
              <div style={{background: V.neon, borderRadius: 30, padding: '34px 20px 38px', textAlign: 'center', boxShadow: `0 0 50px ${V.neon}`}}>
                <div style={{fontFamily: FONT, fontSize: 64, color: V.bg, lineHeight: 1}}>РАССЧИТАТЬ</div>
                <div style={{fontFamily: FONT, fontSize: 42, color: V.bg, marginTop: 10}}>СТОИМОСТЬ ДОСТАВКИ</div>
              </div>
            </div>
          </>
        );
      })()}
    </AbsoluteFill>
  );
};
