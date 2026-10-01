import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Build, EndCard} from './scenes/Cta';
import {BENEFITS, Benefit, MapScene, Tetris, Truck, Wall} from './scenes/Drop';
import {Chat, China, Recap, Weekly} from './scenes/Extra';
import {Hook} from './scenes/Hook';
import {Sanctions} from './scenes/Sanctions';
import {Turn} from './scenes/Turn';
import {Flash, Grain} from './lib';
import {C, SAFE} from './theme';

// Edit is locked to the soundtrack grid: 120 BPM → 15 frames per beat, 60 per bar.
const Scene: React.FC<{render: (f: number) => React.ReactNode}> = ({render}) => <>{render(useCurrentFrame())}</>;

const CARD = 30; // one solution card = 2 beats
// [from, duration, render]
const TIMELINE: [number, number, (f: number) => React.ReactNode][] = [
  [0, 90, () => <Hook />], //                                0–3s   hook
  [90, 180, () => <Sanctions />], //                         3–9s   problem
  [270, 90, () => <Turn />], //                              9–12s  turn + gap
  [360, 60, (f) => <Wall f={f} />], //                       12s    drop
  [420, 120, (f) => <MapScene f={f} />], //                  14s    Rimini → Vilnius → Moscow
  [540, 120, (f) => <China f={f} />], //                     18s    Guangzhou: rail / auto / air
  [660, 60, (f) => <Tetris f={f} />], //                     22s    from one box
  [720, 60, (f) => <Truck f={f} />], //                      24s    what we carry
  [780, CARD * BENEFITS.length, (f) => <Benefit f={f % CARD} i={Math.floor(f / CARD)} />], // 26–32s
  [960, 120, (f) => <Chat f={f} />], //                      32s    personal manager (breakdown)
  [1080, 60, (f) => <Weekly f={f} />], //                    36s    weekly departures
  [1140, 150, (f) => <Recap f={f} />], //                    38s    everything turnkey
  [1290, 60, (f) => <Build f={f} />], //                     43s    "сколько стоит?"
  [1350, 150, (f) => <EndCard f={f} />], //                  45s    final hit → CTA
];

export const Promo: React.FC<{safeZones: boolean}> = ({safeZones}) => (
  <AbsoluteFill style={{background: C.ink}}>
    <Audio src={staticFile('soundtrack.wav')} />
    {TIMELINE.map(([from, dur, render]) => (
      <Sequence key={from} from={from} durationInFrames={dur}>
        <Scene render={render} />
      </Sequence>
    ))}
    <Flash at={[90, 360, 1140, 1350]} dur={6} />
    <Flash at={[150, 420, 540, 660, 720, 780, 960, 1080]} dur={3} color={C.cream} />
    <Grain opacity={0.08} />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.28) 100%)', pointerEvents: 'none'}} />
    {safeZones && (
      <AbsoluteFill style={{pointerEvents: 'none'}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: SAFE.top, background: 'rgba(0,255,0,0.25)'}} />
        <div style={{position: 'absolute', left: 0, right: 0, top: SAFE.bottom, bottom: 0, background: 'rgba(0,255,0,0.25)'}} />
        <div style={{position: 'absolute', left: SAFE.right, right: 0, top: SAFE.rightFrom, bottom: 0, background: 'rgba(0,255,0,0.25)'}} />
        <div style={{position: 'absolute', left: SAFE.left, right: 1080 - SAFE.right, top: SAFE.top, bottom: 1920 - SAFE.bottom, border: '3px dashed lime'}} />
      </AbsoluteFill>
    )}
  </AbsoluteFill>
);
