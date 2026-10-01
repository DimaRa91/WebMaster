import React from 'react';
import {Composition} from 'remotion';
import './fonts';
import {Promo} from './Promo';
import {Steps} from './daily/d02/Steps';
import {FPS, H, W} from './theme';

// Day 01 = "Promo" (kinetic promo), day 02 onwards live in src/daily/.
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Promo" component={Promo} durationInFrames={50 * FPS} fps={FPS} width={W} height={H} defaultProps={{safeZones: false}} />
    <Composition id="D02-Steps" component={Steps} durationInFrames={1040} fps={FPS} width={W} height={H} />
  </>
);
