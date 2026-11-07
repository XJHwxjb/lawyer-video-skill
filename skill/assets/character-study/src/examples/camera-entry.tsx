import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {CameraExample} from './CameraExample';
registerRoot(() => <Composition id="CameraExample" component={CameraExample} width={1920} height={1080} fps={30} durationInFrames={180}/>);
