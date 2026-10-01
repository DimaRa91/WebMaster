"""
Day 02 soundtrack — "5 шагов" (dossier style). Original lo-fi hip-hop, synthesized with numpy.
90 BPM, swing 8ths: 1 beat = 20 video frames @30fps, 1 bar = 80 frames.
The edit events below mirror src/daily/d02/Steps.tsx (typing, stamps, paper slides).
"""
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt, fftconvolve

SR = 48000
FPS = 30
BAR = 80  # frames
DUR = 1040 / FPS
N = int(SR * DUR)
rng = np.random.default_rng(11)
L = np.zeros(N)
R = np.zeros(N)


def fr(f):
    return f / FPS


def t_arr(d):
    return np.arange(int(d * SR)) / SR


def lp(x, f, o=2):
    return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)


def hp(x, f, o=2):
    return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)


def bp(x, lo, hi, o=2):
    return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)


def note(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def put(sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= N:
        return
    n = min(len(sig), N - i)
    L[i:i + n] += sig[:n] * gain * np.sqrt(0.5 * (1 - pan)) * 1.414
    R[i:i + n] += sig[:n] * gain * np.sqrt(0.5 * (1 + pan)) * 1.414


def kick():
    t = t_arr(0.4)
    f = 48 + 90 * np.exp(-t / 0.04)
    return np.tanh(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.22) * 1.4)


def rim():
    t = t_arr(0.15)
    body = np.sin(2 * np.pi * 820 * t) * np.exp(-t / 0.015)
    nz = bp(rng.standard_normal(len(t)), 1500, 6000) * np.exp(-t / 0.03)
    return 0.5 * body + 0.6 * nz


def snare():
    t = t_arr(0.3)
    return 0.4 * np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.05) + lp(bp(rng.standard_normal(len(t)), 1200, 7000), 5000) * np.exp(-t / 0.11)


def hat():
    t = t_arr(0.05)
    return hp(rng.standard_normal(len(t)), 8000, 4) * np.exp(-t / 0.012) * 0.4


def epiano(freqs, d):
    """Rhodes-ish: sine + soft FM bell, tremolo."""
    t = t_arr(d)
    out = np.zeros(len(t))
    for f in freqs:
        mod = np.sin(2 * np.pi * f * 1.0 * t) * 1.2 * np.exp(-t / 0.4)
        out += np.sin(2 * np.pi * f * t + mod) * (0.7 + 0.3 * np.exp(-t / 0.3))
    env = np.minimum(1, t / 0.01) * np.exp(-t / 1.6) * np.minimum(1, (d - t) / 0.2).clip(0, 1)
    trem = 1 + 0.12 * np.sin(2 * np.pi * 4.5 * t)
    return lp(out * env * trem / len(freqs), 3200)


def bass(f, d):
    t = t_arr(d)
    s = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t)
    return np.tanh(s * 1.3) * np.minimum(1, t / 0.01) * np.exp(-t / (d * 0.8))


def type_click():
    t = t_arr(0.04)
    return hp(rng.standard_normal(len(t)), 2500) * np.exp(-t / 0.004) * 0.7 + np.sin(2 * np.pi * (1800 + rng.random() * 600) * t) * np.exp(-t / 0.006) * 0.3


def carriage_bell():
    t = t_arr(0.6)
    return (np.sin(2 * np.pi * 2600 * t) + 0.5 * np.sin(2 * np.pi * 3900 * t)) * np.exp(-t / 0.18) * 0.35


def stamp():
    t = t_arr(0.35)
    thud = np.sin(2 * np.pi * (70 + 120 * np.exp(-t / 0.02)) * t) * np.exp(-t / 0.09)
    slap = lp(rng.standard_normal(len(t)), 3000) * np.exp(-t / 0.025)
    return np.tanh((thud + 0.8 * slap) * 1.8)


def paper(d=0.35):
    t = t_arr(d)
    n = bp(rng.standard_normal(len(t)), 1500, 9000)
    return n * np.sin(np.pi * np.clip(t / d, 0, 1)) ** 1.5 * 0.45


# ---------- groove: 13 bars ----------
prog = [
    [note(53), note(57), note(60), note(64)],  # Fmaj7
    [note(52), note(55), note(59), note(62)],  # Em7
    [note(50), note(53), note(57), note(60)],  # Dm7
    [note(48), note(52), note(55), note(59)],  # Cmaj7
]
roots = [note(41), note(40), note(38), note(36)]
beat = 60 / 90
swing = 0.58  # swung 8ths
for b in range(13):
    t0 = b * 4 * beat
    full = b >= 1 and b < 12
    put(epiano(prog[b % 4], 4 * beat), t0, 0.5)
    put(epiano([f * 2 for f in prog[b % 4][1:3]], beat), t0 + 2.5 * beat, 0.18, 0.3)
    if b == 0:
        continue
    put(bass(roots[b % 4], 1.6 * beat), t0, 0.55)
    put(bass(roots[b % 4] * 1.5, 0.8 * beat), t0 + 2.5 * beat, 0.4)
    if not full:
        continue
    for i in range(4):
        bt = t0 + i * beat
        if i in (0, 2):
            put(kick(), bt, 0.9)
        if i == 2:
            put(kick(), bt + swing * beat, 0.55)
        if i in (1, 3):
            put(snare(), bt, 0.55)
            put(rim(), bt, 0.25, 0.3)
        put(hat(), bt, 0.35, -0.3)
        put(hat(), bt + swing * beat, 0.22, -0.3)

# ---------- edit events (frames) — must match Steps.tsx ----------
# hook: title types 0..40, "5 ШАГОВ" stamp at 40
for k in range(0, 40, 2):
    put(type_click(), fr(k), 0.35, 0.2)
put(stamp(), fr(40), 0.9)
STEP_TITLE_LEN = [15, 14, 17, 20, 21]
for i in range(5):
    S = 80 + 160 * i
    put(paper(), fr(S - 4), 0.6, -0.2)
    for k in range(STEP_TITLE_LEN[i]):
        put(type_click(), fr(S + 14 + 2 * k), 0.3, 0.2)
    put(carriage_bell(), fr(S + 14 + 2 * STEP_TITLE_LEN[i] + 2), 0.5)
    put(stamp(), fr(S + 80), 1.0)
put(paper(), fr(876), 0.6, -0.2)
for k in range(16):
    put(type_click(), fr(894 + 2 * k), 0.3, 0.2)
put(stamp(), fr(960), 1.1)
# final chord ring-out
put(epiano([note(53), note(57), note(60), note(64), note(67)], 3.0), fr(960), 0.45)

# vinyl crackle + hiss bed
crackle = np.zeros(N)
idx = rng.integers(0, N, int(DUR * 25))
crackle[idx] = rng.standard_normal(len(idx)) * 0.5
crackle = hp(crackle, 1500) + hp(rng.standard_normal(N), 6000) * 0.006
L += crackle * 0.6
R += crackle * 0.6

# soft room
ir_n = int(1.2 * SR)
ir = rng.standard_normal(ir_n) * np.exp(-np.arange(ir_n) / SR / 0.25)
ir = lp(ir, 5000)
ir /= np.sqrt(np.sum(ir ** 2))
L = L + 0.15 * fftconvolve(L, ir)[:N]
R = R + 0.15 * fftconvolve(R, ir)[:N]
# lo-fi tone: gentle low-pass + saturation
L = lp(L, 9000)
R = lp(R, 9000)
peak = max(np.abs(L).max(), np.abs(R).max())
L = np.tanh(L / peak * 1.5)
R = np.tanh(R / peak * 1.5)
fade = np.ones(N)
fs = int((DUR - 1.2) * SR)
fade[fs:] = np.linspace(1, 0, N - fs) ** 1.5
L *= fade * 0.9
R *= fade * 0.9
wavfile.write('public/d02-lofi.wav', SR, (np.stack([L, R], 1) * 32767).astype(np.int16))
print('ok', DUR)
