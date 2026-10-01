// Brand system: "СБОРНЫЕ ГРУЗЫ · ЕВРОПА → РОССИЯ"
export const C = {
  ink: '#0B0C12',
  cream: '#F3EEE2',
  orange: '#FF4D12',
  cobalt: '#2236FF',
  red: '#E5000F',
  kraft: '#C99559',
  kraftDark: '#9C6C38',
  grey: '#8A8C96',
};

export const F = {
  display: 'Unbounded, sans-serif',
  body: 'Inter, sans-serif',
  mono: '"JetBrains Mono", monospace',
};

export const FPS = 30;
export const BEAT = 15; // frames per beat @120 BPM
export const W = 1080;
export const H = 1920;

// One safe area that works for Instagram Reels, TikTok and YouTube Shorts at once
// (TikTok is the strictest): top ~260px status bar + header; bottom ~480px caption,
// sound and buttons; right ~120px action column from mid-screen down.
export const SAFE = {top: 260, bottom: 1440, left: 80, right: 960, rightFrom: 800};
export const SAFE_CY = (SAFE.top + SAFE.bottom) / 2;
