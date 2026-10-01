import React from 'react';
import {Composition} from 'remotion';
import './fonts';
import {Promo} from './Promo';
import {FPS, H, W} from './theme';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Promo"
    component={Promo}
    durationInFrames={50 * FPS}
    fps={FPS}
    width={W}
    height={H}
    defaultProps={{safeZones: false}}
  />
);
