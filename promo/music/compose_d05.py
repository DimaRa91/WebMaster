"""
Day 05 soundtrack — "Миф или факт". Original bright pop beat, synthesized with numpy.
120 BPM: 1 beat = 15 frames. Swipes, buzzers and dings follow src/daily/d05/MythFact.tsx.
"""
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt, fftconvolve

SR = 48000
FPS = 30
TOTAL = 840
N = int(SR * TOTAL / FPS)
B = 0.5
rng = np.random.default_rng(5)
L = np.zeros(N)
R = np.zeros(N)

CARD0, CARD_LEN, SWIPE, CTA = 60, 120, 45, 660
MYTHS = [True, True, True, True, False]


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
    f = 52 + 120 * np.exp(-t / 0.025)
    return np.tanh(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.18) * 1.8)


def clap():
    t = t_arr(0.25)
    e = sum(np.exp(-np.clip(t - o, 0, None) / (0.01 if k < 2 else 0.09)) * (t >= o) for k, o in enumerate([0, 0.01, 0.022]))
    return bp(rng.standard_normal(len(t)), 900, 6000) * e * 0.7


def hat():
    t = t_arr(0.05)
    return hp(rng.standard_normal(len(t)), 9000) * np.exp(-t / 0.012) * 0.4


def pluck(n, d=0.22):
    t = t_arr(d)
    f = note(n)
    s = ((f * t) % 1 * 2 - 1) * 0.5 + np.sin(2 * np.pi * f * t)
    return lp(s, 3500) * np.exp(-t / 0.08)


def bass(n, d=0.24):
    t = t_arr(d)
    return np.tanh(np.sin(2 * np.pi * note(n) * t) * 2) * np.exp(-t / 0.15) * np.minimum(1, t / 0.003)


def pad(ns, d):
    t = t_arr(d)
    s = sum(((note(x) * (1 + 0.004 * k) * t) % 1 * 2 - 1) for k, x in enumerate(ns)) / len(ns)
    return lp(s, 1600) * np.minimum(1, t / 0.2) * np.minimum(1, (d - t) / 0.3).clip(0, 1) * 0.5


def swish(d=0.35):
    t = t_arr(d)
    n = rng.standard_normal(len(t))
    out = sum(bp(n, lo, lo * 2) * np.clip(1 - abs(t / d * 3 - k), 0, 1) for k, lo in enumerate([500, 1500, 4000, 9000]))
    return out * np.sin(np.pi * t / d) * 0.7


def buzzer():
    t = t_arr(0.45)
    s = np.sign(np.sin(2 * np.pi * 110 * t)) * 0.5 + np.sign(np.sin(2 * np.pi * 116 * t)) * 0.5
    return lp(s, 1800) * np.exp(-t / 0.3) * 0.6


def ding():
    t = t_arr(1.0)
    return sum(np.sin(2 * np.pi * note(n) * t) * np.exp(-t / 0.35) for n in (84, 88, 91)) / 3 * 0.8


def tick():
    t = t_arr(0.04)
    return np.sin(2 * np.pi * 1800 * t) * np.exp(-t / 0.008) * 0.5


def impact():
    t = t_arr(1.5)
    f = 45 + 100 * np.exp(-t / 0.05)
    return np.tanh((np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.4) + lp(rng.standard_normal(len(t)), 2500) * np.exp(-t / 0.1) * 0.5) * 1.6)


# C major pop: C – G – Am – F, one chord per bar
prog = [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]]
roots = [36, 43, 45, 41]
melody = [72, 76, 79, 76, 74, 79, 77, 76]
total_s = TOTAL / FPS
for bar in range(int(total_s / 2) + 1):
    t0 = bar * 2.0
    ch = bar % 4
    put(pad(prog[ch], 2.0), t0, 0.35)
    for b in range(4):
        bt = t0 + b * B
        if bt >= total_s:
            break
        fr = bt * FPS
        quiet = fr >= CTA - 15 and fr < CTA
        if not quiet:
            put(kick(), bt, 0.9)
            if b in (1, 3):
                put(clap(), bt, 0.6)
            put(hat(), bt + B / 2, 0.35, 0.3)
            put(bass(roots[ch]), bt + B / 2, 0.5)
        for k in range(2):
            put(pluck(melody[(b * 2 + k + bar) % 8]), bt + k * B / 2, 0.22, -0.3)

# --- edit events ---
put(impact(), 0, 0.6)
put(swish(), 4 / FPS, 0.4, -0.5)
put(swish(), 0, 0.4, 0.5)
for i, myth in enumerate(MYTHS):
    S = CARD0 + i * CARD_LEN
    put(swish(0.3), S / FPS, 0.35)
    for k in (15, 30):  # countdown ticks
        put(tick(), (S + k) / FPS, 0.6)
    put(swish(0.4), (S + SWIPE) / FPS, 0.6, -0.6 if myth else 0.6)
    put(buzzer() if myth else ding(), (S + SWIPE + 2) / FPS, 0.6)
put(impact(), CTA / FPS, 0.8)
put(ding(), (CTA + 16) / FPS, 0.5)

ir_n = int(0.9 * SR)
ir = rng.standard_normal(ir_n) * np.exp(-np.arange(ir_n) / SR / 0.18)
ir /= np.sqrt(np.sum(ir ** 2))
L = L + 0.12 * fftconvolve(L, ir)[:N]
R = R + 0.12 * fftconvolve(R, ir)[:N]
peak = max(np.abs(L).max(), np.abs(R).max())
L = np.tanh(L / peak * 1.5)
R = np.tanh(R / peak * 1.5)
fade = np.ones(N)
fs = int((total_s - 1.5) * SR)
fade[fs:] = np.linspace(1, 0, N - fs) ** 1.5
wavfile.write('public/d05-pop.wav', SR, (np.stack([L * fade, R * fade], 1) * 0.8 * 32767).astype(np.int16))
print('ok')
