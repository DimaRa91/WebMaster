import React from 'react';
import {Composition} from 'remotion';
import './fonts';
import {Promo} from './Promo';
import {Steps} from './daily/d02/Steps';
import {Board, D03} from './daily/d03/Board';
import {ChinaModes, D04} from './daily/d04/ChinaModes';
import {D05, MythFact} from './daily/d05/MythFact';
import {FPS, H, W} from './theme';

// Day 01 = "Promo" (kinetic promo), day 02 onwards live in src/daily/.
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Promo" component={Promo} durationInFrames={50 * FPS} fps={FPS} width={W} height={H} defaultProps={{safeZones: false}} />
    <Composition id="D02-Steps" component={Steps} durationInFrames={1040} fps={FPS} width={W} height={H} />
    <Composition id="D03-Board" component={Board} durationInFrames={D03.total} fps={FPS} width={W} height={H} />
    <Composition id="D04-China" component={ChinaModes} durationInFrames={D04.total} fps={FPS} width={W} height={H} />
    <Composition id="D05-MythFact" component={MythFact} durationInFrames={D05.total} fps={FPS} width={W} height={H} />
  </>
);
