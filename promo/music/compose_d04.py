"""
Day 04 soundtrack — "3 способа из Китая". Original funk, synthesized with numpy.
100 BPM: 1 beat = 18 frames, 1 bar = 72 frames. Hits follow src/daily/d04/ChinaModes.tsx.
"""
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt, fftconvolve

SR = 48000
FPS = 30
TOTAL = 864
N = int(SR * TOTAL / FPS)
BEAT = 0.6
rng = np.random.default_rng(4)
L = np.zeros(N)
R = np.zeros(N)

HOOK_ICONS = [6, 24, 42]
RACE, AUTO_ARR, RAIL_ARR, CHART, LIST, LIST_STEP, CTA = 72, 198, 252, 288, 432, 36, 648


def t_arr(d):
    return np.arange(int(d * SR)) / SR


def lp(x, f):
    return sosfilt(butter(2, f, 'low', fs=SR, output='sos'), x)


def hp(x, f):
    return sosfilt(butter(2, f, 'high', fs=SR, output='sos'), x)


def bp(x, lo, hi):
    return sosfilt(butter(2, [lo, hi], 'band', fs=SR, output='sos'), x)


def note(n):
    return 440 * 2 ** ((n - 69) / 12)


def put(sig, at, g=1.0, pan=0.0):
    i = int(at * SR)
    if i < 0 or i >= N:
        return
    n = min(len(sig), N - i)
    L[i:i + n] += sig[:n] * g * np.sqrt(1 - pan)
    R[i:i + n] += sig[:n] * g * np.sqrt(1 + pan)


def kick():
    t = t_arr(0.3)
    f = 55 + 90 * np.exp(-t / 0.03)
    return np.tanh(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.16) * 1.8)


def snare(ghost=False):
    t = t_arr(0.22)
    body = np.sin(2 * np.pi * 210 * t) * np.exp(-t / 0.04)
    nz = bp(rng.standard_normal(len(t)), 1800, 9000) * np.exp(-t / (0.05 if ghost else 0.1))
    return (0.6 * body + nz) * (0.3 if ghost else 1.0)


def hat(open_=False):
    t = t_arr(0.2 if open_ else 0.04)
    return hp(rng.standard_normal(len(t)), 8000) * np.exp(-t / (0.06 if open_ else 0.01)) * 0.45


def slap(n, d=0.18):
    t = t_arr(d)
    f = note(n)
    s = np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / 0.03)
    return np.tanh(s * 1.8) * np.exp(-t / 0.12) * np.minimum(1, t / 0.002)


def clav(ns, d=0.12, bright=1.0):
    t = t_arr(d)
    s = sum(((note(n) * t) % 1.0 * 2 - 1) for n in ns) / len(ns)
    a = lp(s, 4500 * bright)
    return bp(a, 400, 3500) * np.exp(-t / 0.05) * 1.4


def brass(ns, d=0.4):
    t = t_arr(d)
    s = sum(((note(n) * (1 + 0.003 * k) * t) % 1.0 * 2 - 1) for k, n in enumerate(ns)) / len(ns)
    env = np.minimum(1, t / 0.02) * np.exp(-t / 0.25)
    return lp(s, 2800) * env


def whistle(d=0.35):
    t = t_arr(d)
    f = 2200 + 200 * np.sin(2 * np.pi * 30 * t)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.minimum(1, t / 0.01) * np.exp(-t / 0.2) * 0.4


def pop(f0=900):
    t = t_arr(0.12)
    return np.sin(2 * np.pi * (f0 + 1200 * np.exp(-t / 0.015)) * t) * np.exp(-t / 0.05) * 0.7


def whoosh(d=0.4):
    t = t_arr(d)
    n = rng.standard_normal(len(t))
    out = sum(bp(n, lo, lo * 2) * np.clip(1 - abs(t / d * 3 - k), 0, 1) for k, lo in enumerate([400, 1200, 3500, 8000]))
    return out * np.sin(np.pi * t / d) * 0.6


def impact():
    t = t_arr(1.5)
    f = 45 + 90 * np.exp(-t / 0.05)
    return np.tanh((np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.4) + lp(rng.standard_normal(len(t)), 2500) * np.exp(-t / 0.1) * 0.5) * 1.6)


# E minor funk: Em9 – A13 vamp
chords = [[64, 67, 71, 74], [61, 66, 69, 73]]
bassline = [40, None, 52, 40, None, 43, 45, None, 40, 40, None, 50, 52, None, 47, 45]  # 16ths per bar
bars = TOTAL / 72
for b in range(int(np.ceil(bars))):
    t0 = b * 4 * BEAT
    for s16 in range(16):
        at = t0 + s16 * BEAT / 4
        if at * FPS >= TOTAL:
            break
        frame = at * FPS
        if frame >= CTA - 18 and frame < CTA:  # one-beat break before the CTA hit
            continue
        beat_i = s16 // 4
        pos = s16 % 4
        if pos == 0 and beat_i in (0, 2):
            put(kick(), at, 0.95)
        if s16 in (10,):
            put(kick(), at, 0.6)
        if pos == 0 and beat_i in (1, 3):
            put(snare(), at, 0.75)
        elif s16 in (7, 14):
            put(snare(True), at, 1.0)
        put(hat(open_=(s16 == 14)), at, 0.3 if pos % 2 else 0.4, 0.3)
        bn = bassline[s16]
        if bn is not None:
            put(slap(bn), at, 0.6)
        if s16 in (2, 6, 9, 13):
            put(clav(chords[(b // 1) % 2], bright=0.6 + 0.4 * (s16 % 2)), at, 0.4, -0.3)

# --- edit hits ---
for i, fr in enumerate(HOOK_ICONS):
    put(pop(700 + 200 * i), fr / FPS, 0.6)
put(brass([64, 67, 71]), 0, 0.5)
put(whistle(), RACE / FPS, 0.8)
put(whoosh(0.6), (RACE + 18) / FPS, 0.5, 0.4)  # plane
for fr in (AUTO_ARR, RAIL_ARR):
    put(brass([71, 74, 78], 0.35), fr / FPS, 0.55)
    put(pop(1400), fr / FPS, 0.4)
for fr in (CHART, LIST, CTA):
    put(whoosh(0.4), (fr - 6) / FPS, 0.5)
for i in range(3):
    put(pop(600 + 150 * i), (CHART + 20 + i * 18) / FPS, 0.4)
for i in range(5):
    put(pop(1000 + 120 * i), (LIST + 18 + i * LIST_STEP) / FPS, 0.5)
    put(brass([76 + [0, 2, 3, 5, 7][i]], 0.2), (LIST + 18 + i * LIST_STEP) / FPS, 0.25)
put(impact(), CTA / FPS, 0.8)
put(brass([64, 67, 71, 74], 1.2), CTA / FPS, 0.6)
put(pop(1600), (CTA + 90) / FPS, 0.5)  # button press

ir_n = int(0.8 * SR)
ir = rng.standard_normal(ir_n) * np.exp(-np.arange(ir_n) / SR / 0.15)
ir /= np.sqrt(np.sum(ir ** 2))
L = L + 0.1 * fftconvolve(L, ir)[:N]
R = R + 0.1 * fftconvolve(R, ir)[:N]
peak = max(np.abs(L).max(), np.abs(R).max())
L = np.tanh(L / peak * 1.5)
R = np.tanh(R / peak * 1.5)
fade = np.ones(N)
fs = int((TOTAL / FPS - 1.5) * SR)
fade[fs:] = np.linspace(1, 0, N - fs) ** 1.5
wavfile.write('public/d04-funk.wav', SR, (np.stack([L * fade, R * fade], 1) * 0.82 * 32767).astype(np.int16))
print('ok')
