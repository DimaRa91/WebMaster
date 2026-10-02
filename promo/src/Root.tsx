import React from 'react';
import {Composition} from 'remotion';
import './fonts';
import {Promo} from './Promo';
import {Steps} from './daily/d02/Steps';
import {Board, D03} from './daily/d03/Board';
import {ChinaModes, D04} from './daily/d04/ChinaModes';
import {D05, MythFact} from './daily/d05/MythFact';
import {D06, Warehouse} from './daily/d06/Warehouse';
import {Checklist, D07} from './daily/d07/Checklist';
import {Blueprint, D08} from './daily/d08/Blueprint';
import {D09, Versus} from './daily/d09/Versus';
import {D10, Marking} from './daily/d10/Marking';
import {D11, Terminal} from './daily/d11/Terminal';
import {D12, Newspaper} from './daily/d12/Newspaper';
import {D13, PaperExplainer} from './daily/d13/Paper';
import {FPS, H, W} from './theme';

// Day 01 = "Promo" (kinetic promo), day 02 onwards live in src/daily/.
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Promo" component={Promo} durationInFrames={50 * FPS} fps={FPS} width={W} height={H} defaultProps={{safeZones: false}} />
    <Composition id="D02-Steps" component={Steps} durationInFrames={1040} fps={FPS} width={W} height={H} />
    <Composition id="D03-Board" component={Board} durationInFrames={D03.total} fps={FPS} width={W} height={H} />
    <Composition id="D04-China" component={ChinaModes} durationInFrames={D04.total} fps={FPS} width={W} height={H} />
    <Composition id="D05-MythFact" component={MythFact} durationInFrames={D05.total} fps={FPS} width={W} height={H} />
    <Composition id="D06-Warehouse" component={Warehouse} durationInFrames={D06.total} fps={FPS} width={W} height={H} />
    <Composition id="D07-Checklist" component={Checklist} durationInFrames={D07.total} fps={FPS} width={W} height={H} />
    <Composition id="D08-Blueprint" component={Blueprint} durationInFrames={D08.total} fps={FPS} width={W} height={H} />
    <Composition id="D09-Versus" component={Versus} durationInFrames={D09.total} fps={FPS} width={W} height={H} />
    <Composition id="D10-Marking" component={Marking} durationInFrames={D10.total} fps={FPS} width={W} height={H} />
    <Composition id="D11-Terminal" component={Terminal} durationInFrames={D11.total} fps={FPS} width={W} height={H} />
    <Composition id="D12-Newspaper" component={Newspaper} durationInFrames={D12.total} fps={FPS} width={W} height={H} />
    <Composition id="D13-Paper" component={PaperExplainer} durationInFrames={D13.total} fps={FPS} width={W} height={H} />
  </>
);
