import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {Cta} from './scenes/Cta';
import {Drop} from './scenes/Drop';
import {Hook} from './scenes/Hook';
import {Sanctions} from './scenes/Sanctions';
import {Turn} from './scenes/Turn';
import {Flash, Grain} from './lib';
import {C, SAFE} from './theme';

// Edit is locked to the soundtrack grid: 120 BPM → 15 frames per beat.
//   0–90    HOOK        (0–3s)
//   90–270  САНКЦИИ     (3–9s)
//   270–360 ПОВОРОТ     (9–12s)
//   360–720 РЕШЕНИЕ     (12–24s, the drop)
//   720–900 CTA         (24–30s, final hit at 26.0s)
export const Promo: React.FC<{safeZones: boolean}> = ({safeZones}) => (
  <AbsoluteFill style={{background: C.ink}}>
    <Audio src={staticFile('soundtrack.wav')} />
    <Sequence durationInFrames={90}>
      <Hook />
    </Sequence>
    <Sequence from={90} durationInFrames={180}>
      <Sanctions />
    </Sequence>
    <Sequence from={270} durationInFrames={90}>
      <Turn />
    </Sequence>
    <Sequence from={360} durationInFrames={360}>
      <Drop />
    </Sequence>
    <Sequence from={720} durationInFrames={180}>
      <Cta />
    </Sequence>
    <Flash at={[90, 360, 780]} dur={6} />
    <Flash at={[150, 420, 540, 600, 660]} dur={3} color={C.cream} />
    <Grain opacity={0.08} />
    {/* vignette */}
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.28) 100%)', pointerEvents: 'none'}} />
    {safeZones && (
      <AbsoluteFill style={{pointerEvents: 'none'}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: SAFE.top, background: 'rgba(0,255,0,0.25)'}} />
        <div style={{position: 'absolute', left: 0, right: 0, top: SAFE.bottom, bottom: 0, background: 'rgba(0,255,0,0.25)'}} />
        <div style={{position: 'absolute', left: SAFE.right, right: 0, top: 900, bottom: 0, background: 'rgba(0,255,0,0.25)'}} />
        <div style={{position: 'absolute', left: SAFE.left, right: 1080 - SAFE.right, top: SAFE.top, bottom: 1920 - SAFE.bottom, border: '3px dashed lime'}} />
      </AbsoluteFill>
    )}
  </AbsoluteFill>
);
