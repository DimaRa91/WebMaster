"""
Day 03 soundtrack — "Табло отправлений". Original minimal techno, synthesized with numpy.
120 BPM: 1 beat = 15 frames. Flap-ticking bursts follow the board timing in src/daily/d03/Board.tsx.
"""
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt, fftconvolve

SR = 48000
FPS = 30
TOTAL = 660
N = int(SR * TOTAL / FPS)
B = 0.5  # beat, s
rng = np.random.default_rng(3)
L = np.zeros(N)
R = np.zeros(N)

HEADER = -14
ROWS = [30, 90, 150, 210, 270]
CTA = 450


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
    if i >= N or i < 0:
        return
    n = min(len(sig), N - i)
    L[i:i + n] += sig[:n] * g * np.sqrt(1 - pan)
    R[i:i + n] += sig[:n] * g * np.sqrt(1 + pan)


def kick():
    t = t_arr(0.35)
    f = 50 + 110 * np.exp(-t / 0.03)
    return np.tanh(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.2) * 2)


def ohat():
    t = t_arr(0.18)
    return hp(rng.standard_normal(len(t)), 7000) * np.exp(-t / 0.05) * 0.5


def clap():
    t = t_arr(0.25)
    e = sum(np.exp(-np.clip(t - o, 0, None) / (0.01 if k < 2 else 0.08)) * (t >= o) for k, o in enumerate([0, 0.012, 0.024]))
    return bp(rng.standard_normal(len(t)), 1000, 5000) * e * 0.6


def rimshot():
    t = t_arr(0.06)
    return np.sin(2 * np.pi * 1700 * t) * np.exp(-t / 0.01) * 0.6


def bass(n, d=0.2):
    t = t_arr(d)
    f = note(n)
    s = np.sign(np.sin(2 * np.pi * f * t)) * 0.5 + np.sin(2 * np.pi * f * t)
    cutoff = 300 + 1500 * np.exp(-t / 0.05)
    return lp(s, 900) * np.exp(-t / 0.12) * np.minimum(1, t / 0.003)


def stab(ns, d=0.25):
    t = t_arr(d)
    s = sum(np.sin(2 * np.pi * note(n) * t) + 0.4 * np.sin(2 * np.pi * note(n) * 2.01 * t) for n in ns) / len(ns)
    return s * np.exp(-t / 0.08) * 0.6


def tick():
    t = t_arr(0.02)
    return (hp(rng.standard_normal(len(t)), 3000) * np.exp(-t / 0.002) + np.sin(2 * np.pi * (2400 + 800 * rng.random()) * t) * np.exp(-t / 0.003) * 0.5) * 0.5


def flaps(at_frame, frames=22, density=1.0, pan=0.0):
    for k in range(frames):
        for _ in range(int(3 * density * (1 - k / frames) + 1)):
            put(tick(), (at_frame + k + rng.random()) / FPS, 0.12, pan + (rng.random() - 0.5) * 0.6)


def riser(d):
    t = t_arr(d)
    x = t / d
    n = rng.standard_normal(len(t))
    out = sum(bp(n, lo, lo * 2) * np.clip(1 - abs(x ** 1.4 * 4 - k), 0, 1) for k, lo in enumerate([300, 800, 2000, 5000, 10000]))
    return out * x ** 2 * 0.6


def impact():
    t = t_arr(2.0)
    f = 40 + 100 * np.exp(-t / 0.05)
    return np.tanh((np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.5) + lp(rng.standard_normal(len(t)), 2000) * np.exp(-t / 0.15) * 0.5) * 1.6)


bassline = [45, 45, 57, 45, 48, 45, 52, 43]  # A minor, 8th notes
end_groove = CTA / FPS + 6.5
for bt in np.arange(0, end_groove, B):
    bar = int(bt // 2)
    in_break = (CTA / FPS - 1.0) <= bt < CTA / FPS
    if not in_break:
        put(kick(), bt, 0.9)
        if bar >= 1:
            put(ohat(), bt + B / 2, 0.35, 0.3)
        if bar >= 2 and int(bt / B) % 2 == 1:
            put(clap(), bt, 0.55)
        for k in range(2):
            idx = (int(bt / B) * 2 + k) % 8
            put(bass(bassline[idx]), bt + k * B / 2, 0.55)
    if bar >= 3 and int(bt / B) % 4 == 3:
        put(stab([69, 72, 76]), bt + B * 0.75, 0.35, -0.3)
    if int(bt / B) % 8 in (2, 5):
        put(rimshot(), bt + B * 0.25, 0.3, 0.5)

# flap bursts
flaps(HEADER, 24, 1.4)
for r in ROWS:
    flaps(r, 24, 1.0, -0.2)
    flaps(r + 4, 30, 1.2, 0.2)
# status lamps
for r in ROWS:
    put(stab([81], 0.15), (r + 26) / FPS, 0.25, 0.4)
# CTA
put(riser(1.0), CTA / FPS - 1.0, 0.8)
put(impact(), CTA / FPS, 0.9)
put(stab([57, 60, 64, 69], 1.2), CTA / FPS, 0.6)
flaps(CTA, 24, 1.6)
for k, off in enumerate([4, 12, 20]):
    flaps(CTA + off, 20, 1.2, (k - 1) * 0.4)
for off in (40, 48, 56):
    flaps(CTA + off, 22, 0.9)

# mix
ir_n = int(1.0 * SR)
ir = rng.standard_normal(ir_n) * np.exp(-np.arange(ir_n) / SR / 0.2)
ir /= np.sqrt(np.sum(ir ** 2))
L = L + 0.12 * fftconvolve(L, ir)[:N]
R = R + 0.12 * fftconvolve(R, ir)[:N]
peak = max(np.abs(L).max(), np.abs(R).max())
L = np.tanh(L / peak * 1.6)
R = np.tanh(R / peak * 1.6)
fade = np.ones(N)
fs = int((TOTAL / FPS - 1.5) * SR)
fade[fs:] = np.linspace(1, 0, N - fs) ** 1.5
wavfile.write('public/d03-techno.wav', SR, (np.stack([L * fade, R * fade], 1) * 0.72 * 32767).astype(np.int16))
print('ok')
