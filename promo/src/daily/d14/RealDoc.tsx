import React from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {clamp, ease, fade} from '../kit';

// Day 14 — first "realistic" video: real stock footage (Pexels), calm documentary captions,
// gentle grade and a lounge track. 90 BPM: 1 beat = 20 frames, cuts every 2–10 beats.

const R = {
  white: '#FFFFFF',
  soft: 'rgba(255,255,255,0.82)',
  accent: '#FF6A2B',
  ink: '#111318',
};
const FONT = 'Manrope, sans-serif';
const XF = 12; // crossfade length

type Shot = {src: string; from: number; to: number; start: number; pos: string; zoom: [number, number]};
const SHOTS: Shot[] = [
  {src: 'footage/highway.mp4', from: 0, to: 140, start: 54, pos: '30% 50%', zoom: [1.1, 1.02]},
  {src: 'footage/window.mp4', from: 140, to: 340, start: 0, pos: '74% 50%', zoom: [1.0, 1.08]},
  {src: 'footage/docs.mp4', from: 340, to: 540, start: 0, pos: '46% 50%', zoom: [1.06, 1.0]},
  {src: 'footage/port.mp4', from: 540, to: 720, start: 120, pos: '12% 50%', zoom: [1.0, 1.07]},
  {src: 'footage/moscow.mp4', from: 720, to: 900, start: 0, pos: '50% 50%', zoom: [1.0, 1.08]},
];

export const D14 = {total: 900};

const ShotView: React.FC<{s: Shot}> = ({s}) => {
  const f = useCurrentFrame();
  const len = s.to - s.from + XF;
  const z = interpolate(f, [0, len], s.zoom, clamp);
  const o = s.from === 0 ? 1 : fade(f, 0, XF);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <OffthreadVideo
        src={staticFile(s.src)}
        startFrom={s.start}
        muted
        style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: s.pos, transform: `scale(${z})`, filter: 'contrast(1.06) saturate(0.92) brightness(0.96)'}}
      />
    </AbsoluteFill>
  );
};

/** Lines rise softly one after another. */
const Rise: React.FC<{f: number; at: number; children: React.ReactNode; style?: React.CSSProperties}> = ({f, at, children, style}) => {
  const t = interpolate(f, [at, at + 16], [0, 1], {...clamp, easing: ease});
  return <div style={{opacity: t, transform: `translateY(${(1 - t) * 26}px)`, filter: `blur(${(1 - t) * 6}px)`, ...style}}>{children}</div>;
};

const Caption: React.FC<{f: number; from: number; to: number; kicker?: string; title: string; sub?: string}> = ({f, from, to, kicker, title, sub}) => {
  if (f < from || f >= to + XF) return null;
  const l = f - from;
  const out = fade(f, to - 6, to + 4, 1, 0);
  return (
    <div style={{position: 'absolute', left: 80, right: 120, top: 1010, opacity: out}}>
      {kicker && (
        <Rise f={l} at={6}>
          <div style={{display: 'flex', alignItems: 'center', gap: 16, fontFamily: FONT, fontWeight: 700, fontSize: 30, letterSpacing: '0.08em', color: R.accent, textTransform: 'uppercase', textShadow: '0 1px 10px rgba(0,0,0,0.85), 0 0 2px rgba(0,0,0,0.9)'}}>
            <div style={{width: 48, height: 4, background: R.accent, borderRadius: 2}} />
            {kicker}
          </div>
        </Rise>
      )}
      <Rise f={l} at={12} style={{marginTop: 22}}>
        <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 76, lineHeight: 1.08, color: R.white, textShadow: '0 2px 18px rgba(0,0,0,0.35)'}}>{title}</div>
      </Rise>
      {sub && (
        <Rise f={l} at={22} style={{marginTop: 22}}>
          <div style={{fontFamily: FONT, fontWeight: 500, fontSize: 40, lineHeight: 1.32, color: R.soft}}>{sub}</div>
        </Rise>
      )}
    </div>
  );
};

const TERMS: [string, string][] = [
  ['Римини → Москва', '18–25 дней'],
  ['Вильнюс → Москва', '14–21 день'],
  ['Гуанчжоу, авто', '25–30 дней'],
  ['Гуанчжоу, ЖД', '35–45 дней'],
  ['Авиадоставка', 'организуем'],
];

const Terms: React.FC<{f: number}> = ({f}) => {
  const from = 540;
  const to = 720;
  if (f < from || f >= to + XF) return null;
  const l = f - from;
  const out = fade(f, to - 6, to + 4, 1, 0);
  return (
    <div style={{position: 'absolute', left: 80, right: 120, top: 760, opacity: out}}>
      <Rise f={l} at={6}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, fontFamily: FONT, fontWeight: 700, fontSize: 30, letterSpacing: '0.08em', color: R.accent, textTransform: 'uppercase', textShadow: '0 1px 10px rgba(0,0,0,0.85), 0 0 2px rgba(0,0,0,0.9)'}}>
          <div style={{width: 48, height: 4, background: R.accent, borderRadius: 2}} />
          Отправки каждую неделю
        </div>
      </Rise>
      <Rise f={l} at={12} style={{marginTop: 20}}>
        <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 72, lineHeight: 1.08, color: R.white}}>Сроки до Москвы</div>
      </Rise>
      <div style={{marginTop: 30, borderRadius: 24, background: 'rgba(14,16,22,0.62)', backdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.14)', padding: '12px 30px'}}>
        {TERMS.map(([k, v], i) => (
          <Rise key={k} f={l} at={22 + i * 8}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '20px 0', borderTop: i ? '1px solid rgba(255,255,255,0.12)' : 'none'}}>
              <span style={{fontFamily: FONT, fontWeight: 500, fontSize: 38, color: R.soft}}>{k}</span>
              <span style={{fontFamily: FONT, fontWeight: 800, fontSize: 42, color: R.white}}>{v}</span>
            </div>
          </Rise>
        ))}
      </div>
    </div>
  );
};

const Cta: React.FC<{f: number}> = ({f}) => {
  const from = 720;
  if (f < from) return null;
  const l = f - from;
  const b = interpolate(l, [34, 52], [0, 1], {...clamp, easing: ease});
  return (
    <div style={{position: 'absolute', left: 80, right: 120, top: 930}}>
      <Rise f={l} at={8}>
        <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 70, lineHeight: 1.1, color: R.white}}>Пришлите инвойс или список товаров</div>
      </Rise>
      <Rise f={l} at={18} style={{marginTop: 22}}>
        <div style={{fontFamily: FONT, fontWeight: 500, fontSize: 40, lineHeight: 1.32, color: R.soft}}>Менеджер рассчитает доставку до склада в Москве</div>
      </Rise>
      <div style={{marginTop: 44, opacity: b, transform: `translateY(${(1 - b) * 24}px)`}}>
        <div style={{background: R.accent, borderRadius: 22, padding: '30px 20px 32px', textAlign: 'center', boxShadow: '0 16px 40px rgba(255,106,43,0.35)'}}>
          <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 50, color: R.white, letterSpacing: '0.02em', lineHeight: 1.1}}>РАССЧИТАТЬ СТОИМОСТЬ ДОСТАВКИ</div>
        </div>
      </div>
    </div>
  );
};

export const RealDoc: React.FC = () => {
  const f = useCurrentFrame();
  // darker grade under the terms table
  const dim = interpolate(f, [540, 560, 712, 730], [0, 0.25, 0.25, 0], clamp);
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <Audio src={staticFile('lounge/d14-real.wav')} />
      {SHOTS.map((s, i) => (
        <Sequence key={i} from={s.from} durationInFrames={s.to - s.from + XF}>
          <ShotView s={s} />
        </Sequence>
      ))}
      <AbsoluteFill style={{background: `rgba(0,0,0,${dim})`}} />
      {/* soft vignette + bottom gradient for legible captions */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, transparent 55%, rgba(0,0,0,0.35) 100%)'}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 18%, transparent 42%, rgba(0,0,0,0.55) 62%, rgba(0,0,0,0.82) 100%)'}} />

      {/* persistent top label */}
      <div style={{position: 'absolute', left: 80, top: 270, display: 'flex', alignItems: 'center', gap: 14, opacity: fade(f, 4, 20)}}>
        <div style={{width: 12, height: 12, borderRadius: 6, background: R.accent}} />
        <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 28, letterSpacing: '0.12em', color: R.white, textTransform: 'uppercase', textShadow: '0 1px 10px rgba(0,0,0,0.8)'}}>Сборные грузы · Европа · Китай → Москва</div>
      </div>

      <Caption f={f} from={0} to={140} kicker="Италия · Европа · Китай" title="Везёте товар из Европы и Китая?" sub="Сборные грузы — от одной коробки до целой машины" />
      <Caption f={f} from={140} to={340} kicker="Персональный менеджер" title="Один человек ведёт ваш груз" sub="От фабрики и оплаты инвойса — до склада в Москве" />
      <Caption f={f} from={340} to={540} kicker="Белая растаможка" title="Полный пакет документов" sub="Для вашей бухгалтерии. Проверим товар по санкционным кодам и закажем «Честный знак»" />
      <Terms f={f} />
      <Cta f={f} />
    </AbsoluteFill>
  );
};
