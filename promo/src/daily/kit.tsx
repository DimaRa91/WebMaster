import {Easing, interpolate, spring} from 'remotion';

// Small helpers shared by the daily videos. Each day keeps its own palette, fonts and layout.
export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const ease = Easing.bezier(0.6, 0, 0.3, 1);
export const sp = (f: number, at: number, cfg: object = {}) =>
  spring({frame: f - at, fps: 30, config: {damping: 12, stiffness: 220, mass: 0.6, ...cfg}});
export const fade = (f: number, a: number, b: number, from = 0, to = 1) => interpolate(f, [a, b], [from, to], clamp);
/** Reveal `text` one character every `rate` frames starting at `at`. */
export const typed = (text: string, f: number, at: number, rate = 1.5) => text.slice(0, Math.max(0, Math.floor((f - at) / rate)));
