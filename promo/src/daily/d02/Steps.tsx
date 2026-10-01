import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, random, spring, staticFile, useCurrentFrame} from 'remotion';

// Day 02 — "5 шагов": dossier on a desk. Sheets of paper land on a pile, titles are
// typewritten, every step is approved with a rubber stamp on the bar downbeat.
// 90 BPM: 1 beat = 20 frames, 1 bar = 80 frames. Events mirror music/compose_d02.py.

const P = {
  desk: '#1E3A2F',
  deskDark: '#142920',
  paper: '#F4EFE4',
  paperShade: '#E6DFCF',
  ink: '#1A1A1A',
  red: '#C8102E',
  pencil: '#F2C14E',
  rule: '#C9BFA8',
};
const SERIF = '"Playfair Display", Georgia, serif';
const TYPE = '"IBM Plex Mono", monospace';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const sp = (f: number, at: number, cfg: object = {}) => spring({frame: f - at, fps: 30, config: {damping: 13, stiffness: 180, mass: 0.6, ...cfg}});

const STEPS = [
  {title: 'ПРИШЛИТЕ|ИНВОЙС', lines: ['или список товаров', 'с весом и объёмом'], stamp: 'ПРИНЯТО'},
  {title: 'ПРОВЕРИМ|ТОВАР', lines: ['включая санкционные коды', '— ещё до отправки'], stamp: 'ПРОВЕРЕНО'},
  {title: 'ОПЛАТИМ|И ЗАБЕРЁМ', lines: ['оплатим инвойс поставщику,', 'заберём с фабрики', 'на наш склад в Римини'], stamp: 'ОПЛАЧЕНО'},
  {title: 'УПАКУЕМ|И ЗАСТРАХУЕМ', lines: ['переупаковка, обрешётка,', 'одна партия с другими', 'вашими заказами'], stamp: 'ЗАСТРАХОВАНО'},
  {title: 'РАСТАМОЖИМ|И ПРИВЕЗЁМ', lines: ['белая растаможка, документы,', 'марки «Честный знак»,', '18–25 дней до склада в Москве'], stamp: 'ДОСТАВЛЕНО'},
];
const STEP0 = 80;
const STEP_LEN = 160;
const CTA0 = STEP0 + STEP_LEN * STEPS.length; // 880

/** Typewriter: n chars after `at`, one per `rate` frames, with a caret. */
const Typed: React.FC<{text: string; f: number; at: number; rate?: number; caret?: boolean}> = ({text, f, at, rate = 2, caret = true}) => {
  const n = Math.max(0, Math.min(text.length, Math.floor((f - at) / rate) + 1));
  const done = n >= text.length;
  return (
    <>
      {text.slice(0, f < at ? 0 : n)}
      {caret && f >= at && (!done || Math.floor(f / 8) % 2 === 0) && <span style={{color: P.red}}>▍</span>}
    </>
  );
};

const Stamp: React.FC<{text: string; f: number; at: number; size?: number; rot?: number}> = ({text, f, at, size = 64, rot = -12}) => {
  if (f < at) return null;
  const s = sp(f, at, {damping: 9, stiffness: 420, mass: 0.5});
  return (
    <div
      style={{
        display: 'inline-block',
        border: `${size * 0.14}px solid ${P.red}`,
        borderRadius: size * 0.18,
        padding: `${size * 0.16}px ${size * 0.34}px`,
        fontFamily: TYPE,
        fontWeight: 600,
        fontSize: size,
        letterSpacing: '0.06em',
        color: P.red,
        whiteSpace: 'pre',
        textAlign: 'center',
        lineHeight: 1.15,
        transform: `rotate(${rot}deg) scale(${interpolate(s, [0, 1], [2.4, 1])})`,
        opacity: Math.min(0.9, s * 3),
        mixBlendMode: 'multiply',
        // worn ink
        WebkitMaskImage: `repeating-radial-gradient(circle at ${30 + random(text) * 40}% 40%, #000 0 3px, rgba(0,0,0,0.82) 3px 5px)`,
      }}
    >
      {text}
    </div>
  );
};

const Clip: React.FC = () => (
  <svg width={70} height={150} viewBox="0 0 70 150" style={{position: 'absolute', left: 70, top: -40}}>
    <path d="M 20 140 L 20 30 A 15 15 0 0 1 50 30 L 50 120 A 9 9 0 0 1 32 120 L 32 45" fill="none" stroke="#8C8C8C" strokeWidth={7} strokeLinecap="round" />
  </svg>
);

/** One sheet of paper. `land` is the frame it lands on the pile. */
const Sheet: React.FC<{f: number; land: number; seed: number; children: React.ReactNode}> = ({f, land, seed, children}) => {
  const s = sp(f, land - 14, {damping: 15, stiffness: 120});
  const rot = (random(`r${seed}`) - 0.5) * 5;
  const fromX = (random(`x${seed}`) > 0.5 ? 1 : -1) * 900;
  return (
    <div
      style={{
        position: 'absolute',
        left: 100,
        top: 290,
        width: 880,
        height: 1120,
        background: `linear-gradient(170deg, ${P.paper} 60%, ${P.paperShade})`,
        borderRadius: 6,
        boxShadow: '0 30px 60px rgba(0,0,0,0.35), 0 4px 10px rgba(0,0,0,0.2)',
        transform: `translate(${(1 - s) * fromX}px, ${(1 - s) * 500}px) rotate(${rot + (1 - s) * 25}deg)`,
        padding: '70px 70px 60px',
        boxSizing: 'border-box',
      }}
    >
      {/* paper grain + ruled margin */}
      <div style={{position: 'absolute', left: 52, top: 0, bottom: 0, width: 2, background: '#E8A0A0', opacity: 0.5}} />
      <Clip />
      <div style={{position: 'relative', height: '100%'}}>{children}</div>
    </div>
  );
};

const Header: React.FC<{left: string; right: string}> = ({left, right}) => (
  <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: TYPE, fontWeight: 600, fontSize: 26, color: P.ink, letterSpacing: '0.08em', borderBottom: `3px solid ${P.ink}`, paddingBottom: 14}}>
    <span>{left}</span>
    <span>{right}</span>
  </div>
);

const StepSheet: React.FC<{f: number; i: number}> = ({f, i}) => {
  const st = STEPS[i];
  const S = STEP0 + STEP_LEN * i;
  const [l1, l2] = st.title.split('|');
  const typeAt = S + 14;
  return (
    <Sheet f={f} land={S} seed={i + 1}>
      <Header left={`ШАГ 0${i + 1} / 05`} right="ИТАЛИЯ → МОСКВА" />
      <div style={{position: 'absolute', right: -10, top: 36, fontFamily: SERIF, fontWeight: 900, fontStyle: 'italic', fontSize: 250, lineHeight: 0.8, color: P.red, opacity: 0.9, transform: `translateY(${(1 - sp(f, S, {damping: 10})) * 80}px)`}}>{i + 1}</div>
      <div style={{fontFamily: SERIF, fontWeight: 900, fontSize: 80, lineHeight: 1.04, color: P.ink, marginTop: 270, position: 'relative'}}>
        <div>
          <Typed text={l1} f={f} at={typeAt} caret={false} />
        </div>
        <div>
          <Typed text={l2} f={f} at={typeAt + 2 * (l1.length + 1)} />
        </div>
      </div>
      <div style={{marginTop: 50, display: 'flex', flexDirection: 'column', gap: 12}}>
        {st.lines.map((ln, k) => {
          const at = S + 52 + k * 10;
          const o = interpolate(f, [at, at + 8], [0, 1], clamp);
          return (
            <div key={k} style={{fontFamily: TYPE, fontSize: 40, color: P.ink, opacity: o, transform: `translateX(${(1 - o) * 30}px)`, borderBottom: `2px dashed ${P.rule}`, paddingBottom: 10}}>
              {ln}
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', right: 10, bottom: 40}}>
        <Stamp text={st.stamp} f={f} at={S + 80} size={st.stamp.length > 10 ? 54 : 64} rot={-10 + random(`s${i}`) * 6} />
      </div>
      {/* pencil tick in the margin after the stamp */}
      {f >= S + 86 && (
        <svg width={90} height={90} viewBox="0 0 90 90" style={{position: 'absolute', left: -50, bottom: 70}}>
          <path d="M 10 50 L 35 75 L 82 14" fill="none" stroke={P.ink} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${interpolate(f, [S + 86, S + 96], [0, 1], clamp)} 1`} />
        </svg>
      )}
    </Sheet>
  );
};

const HookSheet: React.FC<{f: number}> = ({f}) => (
  <Sheet f={f} land={-10} seed={0}>
    <Header left="ИНСТРУКЦИЯ" right="ДЛЯ ИМПОРТЁРОВ" />
    <div style={{fontFamily: SERIF, fontWeight: 900, fontSize: 104, lineHeight: 1.0, color: P.ink, marginTop: 60}}>
      <Typed text="Как привезти" f={f} at={-12} rate={1} caret={false} />
      <br />
      <Typed text="товар" f={f} at={1} rate={1} caret={false} />
      <br />
      <Typed text="с фабрики" f={f} at={7} rate={1} caret={false} />
      <br />
      <span style={{fontStyle: 'italic', color: P.red}}>
        <Typed text="в Италии?" f={f} at={17} rate={1} />
      </span>
    </div>
    <div style={{position: 'absolute', right: 0, bottom: 140}}>
      <Stamp text="5 ШАГОВ" f={f} at={40} size={92} rot={-14} />
    </div>
  </Sheet>
);

const CtaSheet: React.FC<{f: number}> = ({f}) => {
  const fields = [
    {k: 'Инвойс или список товаров', at: CTA0 + 50},
    {k: 'Вес и объём', at: CTA0 + 60},
    {k: 'Откуда: Италия, Европа, Китай', at: CTA0 + 70},
  ];
  return (
    <Sheet f={f} land={CTA0} seed={9}>
      <Header left="ФОРМА 01" right="ДО СКЛАДА В МОСКВЕ" />
      <div style={{fontFamily: SERIF, fontWeight: 900, fontSize: 92, lineHeight: 1.0, color: P.ink, marginTop: 50}}>
        <Typed text="ЗАЯВКА НА РАСЧЁТ" f={f} at={CTA0 + 14} />
      </div>
      <div style={{marginTop: 60, display: 'flex', flexDirection: 'column', gap: 26}}>
        {fields.map((fl, k) => (
          <div key={k} style={{display: 'flex', alignItems: 'flex-end', gap: 18, fontFamily: TYPE, fontSize: 36, color: P.ink, opacity: interpolate(f, [fl.at - 6, fl.at], [0, 1], clamp)}}>
            <div style={{width: 44, height: 44, border: `4px solid ${P.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 44px'}}>
              {f >= fl.at + 4 && <span style={{color: P.red, fontWeight: 600, fontSize: 40, lineHeight: 1}}>✓</span>}
            </div>
            <div style={{borderBottom: `2px dashed ${P.rule}`, flex: 1, paddingBottom: 6}}>{fl.k}</div>
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26}}>
        <Stamp text={'РАССЧИТАТЬ СТОИМОСТЬ\nДОСТАВКИ'} f={f} at={960} size={50} rot={-4} />
        <div style={{fontFamily: TYPE, fontSize: 28, color: P.ink, opacity: interpolate(f, [975, 990], [0, 0.8], clamp), textAlign: 'center', lineHeight: 1.4}}>
          Пришлите инвойс — подготовим расчёт
        </div>
      </div>
    </Sheet>
  );
};

/** Older sheets peek out from under the current one. */
const Pile: React.FC<{count: number}> = ({count}) => (
  <>
    {new Array(Math.min(count, 3)).fill(0).map((_, k) => (
      <div
        key={k}
        style={{
          position: 'absolute',
          left: 100,
          top: 290,
          width: 880,
          height: 1120,
          background: P.paperShade,
          borderRadius: 6,
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          transform: `rotate(${(random(`p${count}-${k}`) - 0.5) * 9}deg) translate(${(random(`q${count}-${k}`) - 0.5) * 40}px, ${k * 6}px)`,
        }}
      />
    ))}
  </>
);

export const Steps: React.FC = () => {
  const f = useCurrentFrame();
  const idx = f < STEP0 ? -1 : f < CTA0 ? Math.floor((f - STEP0) / STEP_LEN) : 5;
  // camera: slow push, small kick on every stamp
  const stampFrames = [40, ...STEPS.map((_, i) => STEP0 + STEP_LEN * i + 80), 960];
  let kick = 0;
  for (const s of stampFrames) if (f >= s && f < s + 12) kick = Math.max(kick, Math.exp(-(f - s) / 3));
  const cam = 1 + ((f % 160) / 160) * 0.03 + kick * 0.015;
  return (
    <AbsoluteFill style={{background: P.desk, overflow: 'hidden'}}>
      <Audio src={staticFile('d02-lofi.wav')} />
      {/* felt texture */}
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 40%, ${P.desk} 0%, ${P.deskDark} 90%)`}} />
      <AbsoluteFill style={{opacity: 0.25, backgroundImage: `repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0 2px, transparent 2px 6px)`}} />
      {/* pencil on the desk */}
      <div style={{position: 'absolute', left: 640, top: 1560, width: 520, height: 34, background: P.pencil, borderRadius: 6, transform: 'rotate(-18deg)', boxShadow: '0 10px 20px rgba(0,0,0,0.35)'}}>
        <div style={{position: 'absolute', left: -40, top: 0, width: 0, height: 0, borderRight: `40px solid #E9C9A0`, borderTop: '17px solid transparent', borderBottom: '17px solid transparent'}} />
      </div>
      <AbsoluteFill style={{transform: `scale(${cam})`, transformOrigin: '540px 850px'}}>
        <Pile count={idx + 1} />
        {idx === -1 && <HookSheet f={f} />}
        {idx >= 0 && idx < 5 && <StepSheet f={f} i={idx} />}
        {idx === 5 && <CtaSheet f={f} />}
        {/* next sheet flies in over the current one */}
        {(() => {
          const next = idx + 1;
          const nextLand = next < 5 ? STEP0 + STEP_LEN * next : CTA0;
          if (next > 5 || f < nextLand - 14 || f >= nextLand) return null;
          return next < 5 ? <StepSheet f={f} i={next} /> : <CtaSheet f={f} />;
        })()}
      </AbsoluteFill>
      {/* warm lamp light + grain */}
      <AbsoluteFill style={{background: 'radial-gradient(circle at 30% 20%, rgba(255,220,160,0.18), transparent 55%)', pointerEvents: 'none'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.45) 100%)', pointerEvents: 'none'}} />
      <Sequence from={0}>
        <AbsoluteFill style={{opacity: 0.07, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
          <svg width="100%" height="100%">
            <filter id={`n${f % 12}`}>
              <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={f % 12} />
            </filter>
            <rect width="100%" height="100%" filter={`url(#n${f % 12})`} />
          </svg>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
