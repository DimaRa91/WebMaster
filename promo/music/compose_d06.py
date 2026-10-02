"""
Day 06 soundtrack — "Склад в Римини". Original warm ambient with marimba, synthesized with numpy.
90 BPM: 1 beat = 20 frames; each step = 6 beats. Cues follow src/daily/d06/Warehouse.tsx.
"""
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt, fftconvolve

SR = 48000
FPS = 30
STEP0, STEP_LEN, STEPS = 60, 120, 6
CTA = STEP0 + STEP_LEN * STEPS
TOTAL = CTA + 150
N = int(SR * TOTAL / FPS)
BEAT = 20 / FPS
rng = np.random.default_rng(6)
L = np.zeros(N)
R = np.zeros(N)


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


def marimba(n, d=0.6):
    t = t_arr(d)
    f = note(n)
    return (np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 4 * f * t) * np.exp(-t / 0.02)) * np.exp(-t / 0.25)


def pad(ns, d):
    t = t_arr(d)
    s = sum(np.sin(2 * np.pi * note(n) * t + 0.3 * np.sin(2 * np.pi * 0.3 * t + k)) for k, n in enumerate(ns)) / len(ns)
    env = np.minimum(1, t / 1.0) * np.minimum(1, (d - t) / 1.0).clip(0, 1)
    return lp(s, 2000) * env * 0.5


def kick():
    t = t_arr(0.3)
    f = 48 + 60 * np.exp(-t / 0.03)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.2) * 0.8


def shaker():
    t = t_arr(0.08)
    return bp(rng.standard_normal(len(t)), 4000, 10000) * np.exp(-t / 0.02) * 0.3


def chime(n):
    t = t_arr(1.2)
    return (np.sin(2 * np.pi * note(n) * t) + 0.4 * np.sin(2 * np.pi * note(n) * 2.76 * t)) * np.exp(-t / 0.4) * 0.5


def whoosh(d=0.6):
    t = t_arr(d)
    n = rng.standard_normal(len(t))
    out = sum(bp(n, lo, lo * 2) * np.clip(1 - abs(t / d * 3 - k), 0, 1) for k, lo in enumerate([300, 900, 2500, 6000]))
    return out * np.sin(np.pi * t / d) * 0.4


def thud():
    t = t_arr(0.25)
    return np.sin(2 * np.pi * (80 + 60 * np.exp(-t / 0.02)) * t) * np.exp(-t / 0.07) * 0.8


def scan_beep():
    t = t_arr(0.12)
    return np.sin(2 * np.pi * 1760 * t) * np.exp(-t / 0.05) * 0.3


# D major-ish warm progression, 6 beats per chord (one per step)
chords = [[62, 66, 69, 73], [59, 62, 66, 69], [55, 59, 62, 66], [57, 61, 64, 69], [62, 66, 69, 74], [55, 59, 64, 67], [62, 66, 69, 73]]
melody = [74, 76, 78, 81, 78, 76]
total_s = TOTAL / FPS
put(pad(chords[0], STEP0 / FPS + 0.5), 0, 0.6)
for i in range(STEPS + 1):
    t0 = (STEP0 + i * STEP_LEN) / FPS
    dur = (STEP_LEN if i < STEPS else 150) / FPS
    put(pad(chords[i], dur + 0.8), t0, 0.6)
    for b in range(6 if i < STEPS else 7):
        bt = t0 + b * BEAT
        if bt >= total_s:
            break
        if i < STEPS:
            if b in (0, 3):
                put(kick(), bt, 0.6)
            put(shaker(), bt + BEAT / 2, 0.5, 0.3)
            put(marimba(melody[(b + i) % 6] - (12 if b % 2 else 0)), bt, 0.35, -0.2 if b % 2 else 0.2)
# hook: marimba sparkle
for k, n in enumerate([74, 78, 81]):
    put(marimba(n), k * BEAT, 0.4)

# cues
st = lambda i: STEP0 + i * STEP_LEN
put(whoosh(), (st(0) + 10) / FPS, 0.5)
for fr in (st(0) + 40, st(0) + 46, st(0) + 56):
    put(thud(), fr / FPS, 0.6)
for k in range(3):
    put(scan_beep(), (st(1) + 20 + k * 20) / FPS, 1.0)
put(chime(81), (st(1) + 70) / FPS, 0.6)
for k in range(3):
    put(thud(), (st(2) + 25 + k * 13) / FPS, 0.5)
put(chime(86), (st(3) + 16) / FPS, 0.6)
for k in range(6):
    put(thud(), (st(4) + 20 + k * 13) / FPS, 0.5)
put(whoosh(0.8), (st(5) - 4) / FPS, 0.5)
put(whoosh(1.2), (st(5) + 70) / FPS, 0.6)
put(chime(86), CTA / FPS, 0.6)
put(chime(90), (CTA + 14) / FPS, 0.5)

ir_n = int(2.0 * SR)
ir = rng.standard_normal(ir_n) * np.exp(-np.arange(ir_n) / SR / 0.45)
ir = lp(ir, 6000)
ir /= np.sqrt(np.sum(ir ** 2))
L = L + 0.25 * fftconvolve(L, ir)[:N]
R = R + 0.25 * fftconvolve(R, ir)[:N]
peak = max(np.abs(L).max(), np.abs(R).max())
L = np.tanh(L / peak * 1.4)
R = np.tanh(R / peak * 1.4)
fade = np.ones(N)
fs = int((total_s - 2) * SR)
fade[fs:] = np.linspace(1, 0, N - fs) ** 1.5
wavfile.write('public/d06-ambient.wav', SR, (np.stack([L * fade, R * fade], 1) * 0.85 * 32767).astype(np.int16))
print('ok')
