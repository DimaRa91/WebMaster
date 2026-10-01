import React from 'react';
import {AbsoluteFill, Audio, interpolate, random, spring, staticFile, useCurrentFrame} from 'remotion';

// Day 03 — "Табло отправлений": a split-flap departure board.
// 120 BPM: 1 beat = 15 frames. Flap bursts and the CTA flip mirror music/compose_d03.py.

const B = {
  bg: '#0C0D10',
  board: '#16181D',
  cell: '#22252C',
  cellHi: '#2C3038',
  text: '#F1EEE6',
  amber: '#FFC23D',
  green: '#3DDC84',
  dim: '#5B606B',
};
const FONT = '"JetBrains Mono", monospace';
const CHARSET = 'АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЫЭЮЯ0123456789–·';

export const D03 = {
  header: -14, // header is already flipping on frame 0
  rows: [30, 90, 150, 210, 270], // one row per bar, on the 2nd beat
  cta: 450,
  total: 660,
};

const ROWS = [
  {city: 'РИМИНИ', info: 'СБОРНЫЙ 18–25 ДН', status: 'ЕЖЕНЕДЕЛЬНО', flag: 'IT'},
  {city: 'ВИЛЬНЮС', info: 'СБОРНЫЙ 14–21 ДН', status: 'ЕЖЕНЕДЕЛЬНО', flag: 'LT'},
  {city: 'ГУАНЧЖОУ', info: 'ЖД      35–45 ДН', status: 'ЕЖЕНЕДЕЛЬНО', flag: 'CN'},
  {city: 'ГУАНЧЖОУ', info: 'АВТО    25–30 ДН', status: 'ЕЖЕНЕДЕЛЬНО', flag: 'CN'},
  {city: 'ГУАНЧЖОУ', info: 'АВИА  ПО ЗАПРОСУ', status: 'ОРГАНИЗУЕМ', flag: 'CN'},
];
const TICKER = 'ОТ ОДНОЙ КОРОБКИ  ·  БЕЛАЯ РАСТАМОЖКА  ·  ПРОВЕРКА САНКЦИОННЫХ КОДОВ  ·  МАРКИ «ЧЕСТНЫЙ ЗНАК»  ·  ПОЛНЫЙ ПАКЕТ ДОКУМЕНТОВ  ·  ПЕРСОНАЛЬНЫЙ МЕНЕДЖЕР  ·  ';

/** One split-flap cell: spins through random letters, then lands on `ch` at `settle`. */
const Flap: React.FC<{ch: string; f: number; start: number; settle: number; w: number; h: number; color?: string; seed: string}> = ({ch, f, start, settle, w, h, color = B.text, seed}) => {
  let shown = ' ';
  let flipPhase = 0;
  if (f >= settle) {
    shown = ch;
    flipPhase = Math.max(0, 1 - (f - settle) / 3);
  } else if (f >= start) {
    const step = Math.floor((f - start) / 2);
    shown = ch === ' ' && f > settle - 4 ? ' ' : CHARSET[Math.floor(random(`${seed}-${step}`) * CHARSET.length)];
    flipPhase = ((f - start) % 2) / 2 + 0.5;
  }
  return (
    <div
      style={{
        width: w,
        height: h,
        position: 'relative',
        background: `linear-gradient(${B.cellHi} 0 49%, #0A0B0D 49% 51%, ${B.cell} 51%)`,
        borderRadius: 6,
        boxShadow: 'inset 0 -3px 0 rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        fontFamily: FONT,
        fontWeight: 700,
        fontSize: h * 0.72,
        color,
      }}
    >
      <span style={{transform: `scaleY(${1 - flipPhase * 0.55})`, display: 'inline-block'}}>{shown}</span>
      {/* falling top flap */}
      {flipPhase > 0 && <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: '50%', background: B.cellHi, transformOrigin: 'bottom', transform: `scaleY(${flipPhase})`, opacity: 0.85}} />}
    </div>
  );
};

/** A word laid out on `n` flap cells, cascading left to right. */
const FlapRow: React.FC<{text: string; n: number; f: number; at: number; w: number; h: number; gap?: number; color?: string; seed: string; spread?: number}> = ({text, n, f, at, w, h, gap = 6, color, seed, spread = 1.2}) => {
  const chars = text.padEnd(n, ' ').slice(0, n).split('');
  return (
    <div style={{display: 'flex', gap}}>
      {chars.map((c, i) => {
        const settle = at + Math.round(i * spread + 6 + random(`${seed}s${i}`) * 10);
        return <Flap key={i} ch={c} f={f} start={at + Math.round(i * 0.5)} settle={settle} w={w} h={h} color={color} seed={`${seed}${i}`} />;
      })}
    </div>
  );
};

const Lamp: React.FC<{f: number; on: number; color: string}> = ({f, on, color}) => (
  <div style={{width: 18, height: 18, borderRadius: 18, background: f >= on ? color : B.dim, boxShadow: f >= on ? `0 0 14px ${color}` : 'none', opacity: f >= on && Math.floor(f / 10) % 2 ? 0.55 : 1}} />
);

export const Board: React.FC = () => {
  const f = useCurrentFrame();
  const ctaMode = f >= D03.cta;
  const tilt = interpolate(f, [0, D03.total], [10, 4]);
  const drift = interpolate(f, [0, D03.total], [1.04, 1.0]);
  const flash = f >= D03.cta && f < D03.cta + 6 ? 1 - (f - D03.cta) / 6 : 0;
  const pulse = spring({frame: f - D03.cta, fps: 30, config: {damping: 10, stiffness: 200}});

  return (
    <AbsoluteFill style={{background: B.bg, overflow: 'hidden'}}>
      <Audio src={staticFile('d03-techno.wav')} />
      {/* station bokeh */}
      {new Array(14).fill(0).map((_, i) => {
        const x = random(`bx${i}`) * 1080;
        const y = random(`by${i}`) * 1920;
        const r = 60 + random(`br${i}`) * 140;
        const c = i % 3 === 0 ? B.amber : i % 3 === 1 ? '#6FA8FF' : '#FFFFFF';
        return <div key={i} style={{position: 'absolute', left: x - r + Math.sin((f + i * 20) / 60) * 20, top: y - r, width: r * 2, height: r * 2, borderRadius: r * 2, background: c, opacity: 0.06, filter: 'blur(30px)'}} />;
      })}

      <AbsoluteFill style={{perspective: 2400}}>
        <div
          style={{
            position: 'absolute',
            left: 80,
            top: 270,
            width: 920,
            height: 1150,
            background: B.board,
            borderRadius: 24,
            border: '6px solid #2A2D35',
            boxShadow: '0 50px 120px rgba(0,0,0,0.7)',
            transform: `rotateX(${tilt}deg) scale(${drift})`,
            transformOrigin: '50% 0%',
            padding: '34px 44px',
            boxSizing: 'border-box',
          }}
        >
          {/* header */}
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <FlapRow text={ctaMode ? 'ВАШ ГРУЗ' : 'ОТПРАВЛЕНИЯ'} n={11} f={f} at={ctaMode ? D03.cta : D03.header} w={60} h={80} gap={5} color={B.amber} seed={ctaMode ? 'hc' : 'h'} />
            <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 30, color: B.text, opacity: 0.85}}>{`${String(9 + Math.floor(f / 300)).padStart(2, '0')}:${String(Math.floor(f / 5) % 60).padStart(2, '0')}`}</div>
          </div>
          <div style={{fontFamily: FONT, fontWeight: 500, fontSize: 26, color: B.dim, marginTop: 14, letterSpacing: '0.1em'}}>
            {ctaMode ? 'ИТАЛИЯ · ЕВРОПА · КИТАЙ' : 'НАЗНАЧЕНИЕ: СКЛАД В МОСКВЕ'}
          </div>
          <div style={{height: 3, background: '#2A2D35', margin: '22px 0 26px'}} />

          {!ctaMode &&
            ROWS.map((r, i) => {
              const at = D03.rows[i];
              return (
                <div key={i} style={{marginBottom: 26, opacity: f >= at - 2 ? 1 : 0.25}}>
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
                      <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 22, color: B.bg, background: f >= at ? B.amber : B.dim, borderRadius: 6, padding: '4px 8px'}}>{r.flag}</div>
                      <FlapRow text={f >= at ? r.city : ''} n={8} f={f} at={at} w={62} h={84} gap={5} seed={`c${i}`} />
                    </div>
                    <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                      <Lamp f={f} on={at + 26} color={i === 4 ? B.amber : B.green} />
                    </div>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8}}>
                    <FlapRow text={f >= at ? r.info : ''} n={16} f={f} at={at + 4} w={36} h={52} gap={3} color={B.text} seed={`i${i}`} spread={0.8} />
                    <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 24, color: i === 4 ? B.amber : B.green, opacity: f >= at + 26 ? 1 : 0, letterSpacing: '0.04em'}}>{r.status}</div>
                  </div>
                </div>
              );
            })}

          {ctaMode && (
            <div style={{display: 'flex', flexDirection: 'column', gap: 18, marginTop: 40, transform: `scale(${0.96 + 0.04 * pulse})`, transformOrigin: 'left top'}}>
              <FlapRow text="РАССЧИТАТЬ" n={10} f={f} at={D03.cta + 4} w={74} h={106} gap={6} color={B.amber} seed="k1" />
              <FlapRow text="СТОИМОСТЬ" n={10} f={f} at={D03.cta + 12} w={74} h={106} gap={6} seed="k2" />
              <FlapRow text="ДОСТАВКИ" n={10} f={f} at={D03.cta + 20} w={74} h={106} gap={6} seed="k3" />
              <div style={{height: 3, background: '#2A2D35', margin: '20px 0 10px'}} />
              <FlapRow text="ПРИШЛИТЕ ИНВОЙС" n={16} f={f} at={D03.cta + 40} w={46} h={64} gap={4} color={B.green} seed="k4" spread={0.9} />
              <FlapRow text="ИЛИ СПИСОК" n={16} f={f} at={D03.cta + 48} w={46} h={64} gap={4} color={B.green} seed="k5" spread={0.9} />
              <FlapRow text="ТОВАРОВ" n={16} f={f} at={D03.cta + 56} w={46} h={64} gap={4} color={B.green} seed="k6" spread={0.9} />
            </div>
          )}

          {/* LED ticker */}
          <div style={{position: 'absolute', left: 44, right: 44, bottom: 30, height: 64, background: '#07080A', borderRadius: 10, overflow: 'hidden', display: 'flex', alignItems: 'center', opacity: f >= 90 ? 1 : 0}}>
            <div
              style={{
                whiteSpace: 'pre',
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: 32,
                color: B.amber,
                textShadow: `0 0 10px ${B.amber}`,
                transform: `translateX(${880 - ((f - 90) * 7) % (TICKER.length * 19.2)}px)`,
                backgroundImage: 'none',
              }}
            >
              {TICKER.repeat(3)}
            </div>
            <div style={{position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(0,0,0,0.55) 1px, transparent 1.5px)', backgroundSize: '5px 5px'}} />
          </div>
        </div>
      </AbsoluteFill>
      {/* glass reflection */}
      <AbsoluteFill style={{background: 'linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.05) 42%, transparent 50%)', transform: `translateX(${interpolate(f % 220, [0, 220], [-700, 700])}px)`, pointerEvents: 'none'}} />
      <AbsoluteFill style={{background: '#FFF', opacity: flash * 0.6, pointerEvents: 'none'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.55) 100%)', pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};
