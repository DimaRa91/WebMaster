import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, F} from './theme';

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const lerp = (f: number, a: number, b: number, from: number, to: number, ease = Easing.bezier(0.2, 0.8, 0.2, 1)) =>
  interpolate(f, [a, b], [from, to], {...clamp, easing: ease});

export const easeIn = Easing.bezier(0.6, 0, 0.9, 0.4);
export const easeOut = Easing.bezier(0.1, 0.9, 0.2, 1);
export const easeInOut = Easing.bezier(0.7, 0, 0.3, 1);

export const useSpring = (delay = 0, config: Partial<{damping: number; stiffness: number; mass: number}> = {}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - delay, fps, config: {damping: 12, stiffness: 180, mass: 0.6, ...config}});
};

export const sp = (frame: number, delay: number, fps = 30, config: Partial<{damping: number; stiffness: number; mass: number}> = {}) =>
  spring({frame: frame - delay, fps, config: {damping: 12, stiffness: 180, mass: 0.6, ...config}});

/** Camera shake that kicks on each hit frame and decays. */
export const shake = (frame: number, hits: number[], amp = 30, decay = 7) => {
  let x = 0;
  let y = 0;
  let r = 0;
  for (const h of hits) {
    const d = frame - h;
    if (d < 0 || d > decay * 4) continue;
    const k = Math.exp(-d / decay) * amp;
    x += (random(`x${h}-${frame}`) - 0.5) * 2 * k;
    y += (random(`y${h}-${frame}`) - 0.5) * 2 * k;
    r += (random(`r${h}-${frame}`) - 0.5) * 0.08 * k;
  }
  return {x, y, r};
};

/** Punch: quick scale bump on hit frames. */
export const punch = (frame: number, hits: number[], amt = 0.08, decay = 5) => {
  let s = 0;
  for (const h of hits) {
    const d = frame - h;
    if (d >= 0 && d < 30) s += amt * Math.exp(-d / decay);
  }
  return 1 + s;
};

export const Fill: React.FC<{bg?: string; children?: React.ReactNode; style?: React.CSSProperties}> = ({bg, children, style}) => (
  <AbsoluteFill style={{background: bg, overflow: 'hidden', ...style}}>{children}</AbsoluteFill>
);

/** Headline text with optional RGB split. */
export const Display: React.FC<{
  children: React.ReactNode;
  size: number;
  color?: string;
  split?: number;
  weight?: number;
  style?: React.CSSProperties;
  stroke?: string;
  tracking?: number;
}> = ({children, size, color = C.ink, split = 0, weight = 900, style, stroke, tracking = -0.02}) => {
  const base: React.CSSProperties = {
    fontFamily: F.display,
    fontWeight: weight,
    fontSize: size,
    lineHeight: 0.92,
    letterSpacing: `${tracking}em`,
    textTransform: 'uppercase',
    whiteSpace: 'pre',
    textAlign: 'center',
  };
  const txt = (
    <div
      style={{
        ...base,
        color: stroke ? 'transparent' : color,
        WebkitTextStroke: stroke ? `${Math.max(2, size * 0.022)}px ${stroke}` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
  if (!split) return txt;
  return (
    <div style={{position: 'relative'}}>
      <div style={{position: 'absolute', inset: 0, transform: `translate(${-split}px, ${split * 0.3}px)`, opacity: 0.9}}>
        <div style={{...base, color: '#00E5FF', mixBlendMode: 'screen', ...style}}>{children}</div>
      </div>
      <div style={{position: 'absolute', inset: 0, transform: `translate(${split}px, ${-split * 0.3}px)`, opacity: 0.9}}>
        <div style={{...base, color: '#FF0040', mixBlendMode: 'screen', ...style}}>{children}</div>
      </div>
      <div style={{position: 'relative'}}>{txt}</div>
    </div>
  );
};

export const Mono: React.FC<{children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties}> = ({
  children,
  size = 28,
  color = C.ink,
  style,
}) => (
  <div
    style={{
      fontFamily: F.mono,
      fontWeight: 700,
      fontSize: size,
      color,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      whiteSpace: 'pre',
      ...style,
    }}
  >
    {children}
  </div>
);

export const Center: React.FC<{children: React.ReactNode; y?: number; style?: React.CSSProperties}> = ({children, y, style}) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      right: 0,
      top: y ?? 0,
      bottom: y === undefined ? 0 : undefined,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: y === undefined ? 'center' : 'flex-start',
      ...style,
    }}
  >
    {children}
  </div>
);

/** Animated film grain. */
export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.07}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none', opacity, mixBlendMode: 'overlay'}}>
      <svg width="100%" height="100%">
        <filter id={`g${frame}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={frame % 24} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#g${frame})`} />
      </svg>
    </AbsoluteFill>
  );
};

/** Flash overlay that decays from a frame. */
export const Flash: React.FC<{at: number[]; color?: string; dur?: number}> = ({at, color = '#fff', dur = 5}) => {
  const frame = useCurrentFrame();
  let o = 0;
  for (const a of at) {
    const d = frame - a;
    if (d >= 0 && d < dur) o = Math.max(o, 1 - d / dur);
  }
  if (!o) return null;
  return <AbsoluteFill style={{background: color, opacity: o, pointerEvents: 'none'}} />;
};

/** Infinite horizontal marquee row. */
export const Marquee: React.FC<{
  text: string;
  speed: number;
  size: number;
  color: string;
  outline?: boolean;
  offset?: number;
  font?: string;
  weight?: number;
}> = ({text, speed, size, color, outline, offset = 0, font = F.display, weight = 900}) => {
  const frame = useCurrentFrame();
  const unit = text + '   ';
  const approx = unit.length * size * 0.82;
  const x = (((frame * speed + offset) % approx) + approx) % approx;
  return (
    <div
      style={{
        whiteSpace: 'pre',
        fontFamily: font,
        fontWeight: weight,
        fontSize: size,
        lineHeight: 1,
        textTransform: 'uppercase',
        letterSpacing: '-0.02em',
        color: outline ? 'transparent' : color,
        WebkitTextStroke: outline ? `${Math.max(2, size * 0.02)}px ${color}` : undefined,
        transform: `translateX(${-x}px)`,
      }}
    >
      {unit.repeat(8)}
    </div>
  );
};

/** Hazard tape with scrolling text. */
export const Tape: React.FC<{text: string; bg: string; fg: string; speed: number; angle: number; y: number; progress: number}> = ({
  text,
  bg,
  fg,
  speed,
  angle,
  y,
  progress,
}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: 'absolute',
        left: -400,
        width: 1880,
        top: y,
        height: 120,
        background: bg,
        transform: `rotate(${angle}deg) translateX(${(1 - progress) * (angle > 0 ? -2000 : 2000)}px)`,
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
        borderTop: `8px solid ${fg}`,
        borderBottom: `8px solid ${fg}`,
      }}
    >
      <div
        style={{
          whiteSpace: 'pre',
          fontFamily: F.display,
          fontWeight: 900,
          fontSize: 56,
          color: fg,
          transform: `translateX(${-((frame * speed) % 900)}px)`,
          letterSpacing: '0.02em',
        }}
      >
        {(text + '  ✕  ').repeat(12)}
      </div>
    </div>
  );
};

export const Grid: React.FC<{color: string; size?: number; opacity?: number; offsetY?: number}> = ({color, size = 90, opacity = 0.15, offsetY = 0}) => (
  <AbsoluteFill
    style={{
      opacity,
      backgroundImage: `linear-gradient(${color} 2px, transparent 2px), linear-gradient(90deg, ${color} 2px, transparent 2px)`,
      backgroundSize: `${size}px ${size}px`,
      backgroundPosition: `0 ${offsetY}px`,
    }}
  />
);

/** Brand mark: three cargo blocks that consolidate into an arrow. */
export const Logo: React.FC<{size?: number; color?: string; accent?: string; t?: number}> = ({size = 160, color = C.ink, accent = C.orange, t = 1}) => {
  const k = Math.min(1, Math.max(0, t));
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect x={8 - (1 - k) * 30} y={52} width={26} height={26} rx={3} fill={color} />
      <rect x={8 - (1 - k) * 50} y={22} width={26} height={26} rx={3} fill={color} opacity={0.55} />
      <rect x={38 - (1 - k) * 40} y={52} width={26} height={26} rx={3} fill={color} />
      <path d={`M 68 30 L 94 65 L 68 100 L 68 82 L 50 82 L 50 48 L 68 48 Z`} fill={accent} transform={`translate(${(1 - k) * 60} -15)`} />
    </svg>
  );
};
