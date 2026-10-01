"""
Original soundtrack for the 30s promo — synthesized from scratch with numpy.
No samples, no third-party recordings → no copyright issues.

120 BPM, 1 beat = 0.5 s = 15 video frames @30fps.
Sections (seconds):
  0-3   HOOK      — four word-slams + box landing impact
  3-9   SANCTIONS — dark half-time 808, alarm stabs
  9-12  TURN      — filter-out, riser, snare roll, gap
  12-24 DROP      — four-on-the-floor, rolling bass, supersaw stabs, lead
  24-30 CTA       — build, final hit at 26.0, chord tail
"""
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt, fftconvolve

SR = 48000
DUR = 30.0
N = int(SR * DUR)
BEAT = 0.5
rng = np.random.default_rng(7)

L = np.zeros(N)
R = np.zeros(N)


def t_arr(d):
    return np.arange(int(d * SR)) / SR


def place(sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= N:
        return
    if sig.ndim == 1:
        sl, sr_ = sig, sig
    else:
        sl, sr_ = sig[0], sig[1]
    n = min(len(sl), N - i)
    gl = gain * np.sqrt(0.5 * (1 - pan))
    gr = gain * np.sqrt(0.5 * (1 + pan))
    L[i:i + n] += sl[:n] * gl * 1.414
    R[i:i + n] += sr_[:n] * gr * 1.414


def lp(x, f, order=2):
    return sosfilt(butter(order, min(f, SR / 2 - 100), 'low', fs=SR, output='sos'), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, 'high', fs=SR, output='sos'), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], 'band', fs=SR, output='sos'), x)


def env_exp(n, tau):
    return np.exp(-np.arange(n) / SR / tau)


def note(n):  # midi -> Hz
    return 440.0 * 2 ** ((n - 69) / 12)


# ---------- instruments ----------
def kick(punch=1.0, d=0.45):
    t = t_arr(d)
    f = 45 + 140 * np.exp(-t / 0.035) * punch
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.exp(-t / 0.18)
    click = hp(rng.standard_normal(len(t)), 3000) * np.exp(-t / 0.003) * 0.3
    return np.tanh((s + click) * 1.6)


def clap(d=0.35):
    t = t_arr(d)
    n = rng.standard_normal(len(t))
    e = np.zeros(len(t))
    for k, off in enumerate([0, 0.011, 0.022, 0.033]):
        i = int(off * SR)
        e[i:] += np.exp(-(t[i:] - off) / (0.012 if k < 3 else 0.12))
    return bp(n, 900, 5000) * e * 0.8


def snare(d=0.3, tone=200):
    t = t_arr(d)
    body = np.sin(2 * np.pi * tone * t) * np.exp(-t / 0.05)
    nz = bp(rng.standard_normal(len(t)), 1500, 9000) * np.exp(-t / 0.09)
    return 0.6 * body + 0.8 * nz


def hat(open_=False):
    d = 0.35 if open_ else 0.06
    t = t_arr(d)
    n = hp(rng.standard_normal(len(t)), 7000, 4)
    return n * np.exp(-t / (0.12 if open_ else 0.018)) * 0.5


def sub808(freq, d, glide_from=None, drive=2.5):
    t = t_arr(d)
    if glide_from:
        f = freq + (glide_from - freq) * np.exp(-t / 0.06)
    else:
        f = np.full(len(t), freq)
    ph = 2 * np.pi * np.cumsum(f) / SR
    e = np.minimum(1, t / 0.004) * np.exp(-t / (d * 0.7))
    return np.tanh(np.sin(ph) * drive) * e


def saw(freq, t):
    return 2 * ((freq * t) % 1.0) - 1


def supersaw(freqs, d, cutoff=4000, attack=0.005, release=0.15, voices=7, detune=0.012):
    t = t_arr(d)
    outL = np.zeros(len(t))
    outR = np.zeros(len(t))
    for f in freqs:
        for v in range(voices):
            dt = 1 + detune * (v - (voices - 1) / 2) / ((voices - 1) / 2)
            s = saw(f * dt, t + rng.random())
            p = (v / (voices - 1)) * 2 - 1
            outL += s * (1 - p) * 0.5
            outR += s * (1 + p) * 0.5
    e = np.minimum(1, t / attack) * np.minimum(1, np.maximum(0, (d - t) / release))
    k = 1 / (len(freqs) * voices)
    return np.array([lp(outL, cutoff) * e * k, lp(outR, cutoff) * e * k])


def pluck(freq, d=0.25):
    t = t_arr(d)
    s = saw(freq, t) * 0.6 + np.sign(np.sin(2 * np.pi * freq * 2 * t)) * 0.2
    s = lp(s, 2500) * np.exp(-t / 0.09)
    return s


def impact(d=2.5, pitch=55):
    t = t_arr(d)
    f = pitch + 120 * np.exp(-t / 0.05)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.5)
    nz = lp(rng.standard_normal(len(t)), 2500) * np.exp(-t / 0.25) * 0.6
    crack = hp(rng.standard_normal(len(t)), 2000) * np.exp(-t / 0.02) * 0.6
    return np.tanh((boom + nz + crack) * 1.8)


def slam(pitch=1.0):
    """Short, punchy word-hit: kick + metallic snap + noise."""
    t = t_arr(0.4)
    f = (60 + 300 * np.exp(-t / 0.02)) * pitch
    b = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.12)
    metal = sum(np.sin(2 * np.pi * fr * pitch * t) for fr in [523, 811, 1307]) * np.exp(-t / 0.06) * 0.15
    nz = bp(rng.standard_normal(len(t)), 2000, 8000) * np.exp(-t / 0.03) * 0.7
    return np.tanh((b + metal + nz) * 2)


def whoosh(d=0.6, up=True):
    t = t_arr(d)
    n = rng.standard_normal(len(t))
    out = np.zeros(len(t))
    seg = 256
    for i in range(0, len(t), seg):
        x = i / len(t)
        fc = 300 + 7000 * (x if up else 1 - x) ** 2
        out[i:i + seg] = 0  # placeholder, filtered below
    # time-varying via crossfade of a few static bands
    bands = [bp(n, lo, lo * 2.5) for lo in [250, 600, 1400, 3200, 7000]]
    pos = (t / d if up else 1 - t / d) * (len(bands) - 1)
    for k, b in enumerate(bands):
        w = np.clip(1 - np.abs(pos - k), 0, 1)
        out += b * w
    e = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 2
    return out * e * 0.9


def riser(d):
    t = t_arr(d)
    x = t / d
    n = rng.standard_normal(len(t))
    bands = [bp(n, lo, lo * 2) for lo in [200, 500, 1200, 2800, 6000, 10000]]
    pos = x ** 1.5 * (len(bands) - 1)
    out = sum(b * np.clip(1 - np.abs(pos - k), 0, 1) for k, b in enumerate(bands))
    f = 110 * 2 ** (x * 3)
    tone = saw(1, np.cumsum(f) / SR) * 0.25
    tone = lp(tone, 5000)
    return (out * 0.8 + tone) * x ** 2


def reverse_cymbal(d=1.0):
    t = t_arr(d)
    c = hp(rng.standard_normal(len(t)), 5000) * np.exp(-t / 0.35)
    return c[::-1] * 0.6


def pad(freqs, d, cutoff=1800):
    return supersaw(freqs, d, cutoff=cutoff, attack=0.4, release=1.2, voices=5, detune=0.008)


def alarm(d=0.45, f0=880):
    t = t_arr(d)
    f = f0 + 120 * np.sign(np.sin(2 * np.pi * 8 * t))
    s = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.3
    return lp(s, 3000) * np.exp(-t / 0.25)


def click():
    t = t_arr(0.05)
    return hp(rng.standard_normal(len(t)), 3000) * np.exp(-t / 0.004) * 0.8 + np.sin(2 * np.pi * 2200 * t) * np.exp(-t / 0.01) * 0.4


def chime(freqs, d=1.5):
    t = t_arr(d)
    s = sum(np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * f * 2.01 * t) for f in freqs)
    return s * np.exp(-t / 0.5) / len(freqs) * 0.5


# Separate buses so we can sidechain / filter by section
drums = [np.zeros(N), np.zeros(N)]
music = [np.zeros(N), np.zeros(N)]


def put(bus, sig, at, gain=1.0, pan=0.0):
    global L, R
    sl, sr_ = L, R
    L, R = bus[0], bus[1]
    place(sig, at, gain, pan)
    bus[0], bus[1] = L, R
    L, R = sl, sr_


# ---------- HOOK 0-3 ----------
for k, at in enumerate([0.0, 0.5, 1.0, 1.5]):
    put(drums, slam(1 + 0.12 * k), at, 0.9)
    put(drums, kick(1.2), at, 0.8)
    put(music, sub808(note(38 + [0, 0, 3, 5][k]), 0.45), at, 0.5)
put(drums, impact(2.0, 45), 2.0, 1.0)
put(music, sub808(note(26), 1.0, glide_from=note(38)), 2.0, 0.7)
put(music, whoosh(0.5, True), 2.5, 0.6)

# ---------- SANCTIONS 3-9 (D minor, dark) ----------
put(drums, impact(3.0, 40), 3.0, 1.0)
put(music, alarm(0.9, 740), 3.0, 0.35, -0.3)
put(music, pad([note(50), note(53), note(56)], 6.0, cutoff=900), 3.0, 0.5)  # D F Ab — diminished, tense
# half-time pattern
for bar in [3.0, 5.0, 7.0]:
    put(drums, kick(1.0), bar, 0.95)
    put(drums, kick(0.8), bar + 0.75, 0.7)
    put(drums, snare(), bar + 1.0, 0.75)
    for i in range(8):
        put(drums, hat(), bar + i * 0.25, 0.35 if i % 2 else 0.5, 0.3)
    # triplet hat roll
    for i in range(6):
        put(drums, hat(), bar + 1.5 + i * (0.5 / 6), 0.3, 0.3)
put(music, sub808(note(26), 1.4, glide_from=note(33)), 3.0, 0.8)
put(music, sub808(note(26), 0.7), 5.0, 0.8)
put(music, sub808(note(29), 0.7), 5.75, 0.7)
# pains list stabs at 6.0 6.5 7.0 7.5 (beats 12-15)
for k, at in enumerate([6.0, 6.5, 7.0, 7.5]):
    put(drums, slam(0.8 + 0.06 * k), at, 0.55)
    put(music, alarm(0.3, 600 + 80 * k), at, 0.25, 0.4 if k % 2 else -0.4)
put(music, sub808(note(26), 1.0, glide_from=note(20)), 7.0, 0.8)
put(drums, impact(1.5, 50), 8.0, 0.8)  # glitch freeze
put(music, whoosh(0.5, False), 8.5, 0.5)

# ---------- TURN 9-12 ----------
put(music, riser(2.75), 9.0, 0.6)
put(music, pad([note(50), note(53), note(57)], 2.6, cutoff=600), 9.0, 0.5)  # Dm resolving
roll_t = 10.0
step = 0.25
while roll_t < 11.5:
    put(drums, snare(0.15, 230), roll_t, 0.25 + 0.4 * (roll_t - 10) / 1.5)
    step = max(0.0625, step * 0.82)
    roll_t += step
put(drums, kick(1.0), 9.0, 0.6)
put(drums, kick(1.0), 10.0, 0.6)
put(music, reverse_cymbal(0.5), 11.5, 0.7)  # gap 11.5-12 only reverse swell

# ---------- DROP 12-24 (D minor -> Bb -> F -> C) ----------
prog = [
    (note(50), [note(62), note(65), note(69)]),  # Dm
    (note(46), [note(62), note(65), note(70)]),  # Bb
    (note(41), [note(60), note(65), note(69)]),  # F
    (note(48), [note(60), note(64), note(67)]),  # C
]
lead = [74, 77, 81, 79, 77, 74, 72, 74]  # 8th-note hook, varied per bar
put(drums, impact(2.0, 40), 12.0, 0.9)
for b in range(6):
    t0 = 12.0 + b * 2.0
    root, chord = prog[b % 4]
    for i in range(4):
        bt = t0 + i * 0.5
        put(drums, kick(1.1), bt, 1.0)
        put(drums, hat(open_=True), bt + 0.25, 0.35, 0.2)
        if i in (1, 3):
            put(drums, clap(), bt, 0.8)
            put(drums, snare(0.2), bt, 0.3)
        for j in range(4):
            put(drums, hat(), bt + j * 0.125, 0.2 if j % 2 else 0.3, -0.25)
        # rolling offbeat bass 16ths
        for j in (1, 2, 3):
            put(music, sub808(root / 2 if j != 2 else root, 0.11, drive=3), bt + j * 0.125, 0.55)
        # supersaw stab on the &
        put(music, supersaw(chord, 0.2, cutoff=3500 + 400 * b), bt + 0.25, 0.55)
    # lead pluck hook
    for k, n_ in enumerate(lead):
        nn = n_ + (0 if b % 2 == 0 else [0, 0, -2, 0, 2, 0, -2, -5][k])
        put(music, pluck(note(nn + 12)), t0 + k * 0.25 + (1.0 if k >= 4 else 0) * 0, 0.25, 0.35)
    if b in (2, 4):
        put(drums, hp(rng.standard_normal(int(1.5 * SR)), 4000) * env_exp(int(1.5 * SR), 0.4) * 0.5, t0, 0.6)  # crash
    if b < 5:
        put(music, whoosh(0.5, True), t0 + 1.5, 0.35)

# ---------- CTA 24-30 ----------
for i in range(4):
    bt = 24.0 + i * 0.5
    put(drums, kick(1.0), bt, 0.9)
    for j in range(2):
        put(drums, hat(), bt + 0.25 * j, 0.3)
put(music, supersaw([note(62), note(65), note(69)], 1.0, cutoff=2500), 24.0, 0.35)
put(music, supersaw([note(58), note(62), note(65)], 1.0, cutoff=2500), 25.0, 0.35)
r = 25.0
step = 0.125
while r < 26.0:
    put(drums, snare(0.12, 240), r, 0.2 + 0.4 * (r - 25.0))
    step = max(0.0625, step * 0.85)
    r += step
put(music, riser(1.0), 25.0, 0.4)
# FINAL HIT 26.0 — F major add9 big chord
put(drums, impact(3.5, 41), 26.0, 1.0)
put(drums, kick(1.3), 26.0, 0.8)
put(music, sub808(note(29), 2.5), 26.0, 0.8)
put(music, pad([note(53), note(57), note(60), note(67), note(72)], 3.9, cutoff=3200), 26.0, 0.6)
put(music, chime([note(84), note(88), note(91)], 2.5), 26.0, 0.35)
# button tap at 27.5
put(music, click(), 27.5, 0.6)
put(music, chime([note(96), note(100)], 1.2), 27.52, 0.25)
# soft heartbeat pulses
for at in [28.0, 29.0]:
    put(drums, kick(0.6, 0.3), at, 0.35)


# ---------- MIX ----------
def reverb(x, d=1.8, mix=0.18):
    ir_n = int(d * SR)
    ir = rng.standard_normal(ir_n) * np.exp(-np.arange(ir_n) / SR / (d / 5))
    ir = lp(ir, 6000)
    ir /= np.sqrt(np.sum(ir ** 2))
    return x + mix * fftconvolve(x, ir)[:len(x)]


# sidechain music to the kick during the drop (pumping)
sc = np.ones(N)
for b in range(int(12.0 / BEAT), int(26.0 / BEAT)):
    i = int(b * BEAT * SR)
    n = int(0.25 * SR)
    seg = 1 - 0.55 * np.exp(-np.arange(n) / SR / 0.07)
    sc[i:i + n] = np.minimum(sc[i:i + n], seg[:min(n, N - i)])

# turn section: low-pass the drums 9-12 (filtered build)
mL = reverb(music[0], mix=0.25) * sc
mR = reverb(music[1], mix=0.25) * sc
dL = reverb(drums[0], 1.0, 0.08)
dR = reverb(drums[1], 1.0, 0.08)
outL = mL + dL
outR = mR + dR

# master: gentle low-shelf-ish warmth via parallel low pass, then soft clip
outL = outL + 0.15 * lp(outL, 120)
outR = outR + 0.15 * lp(outR, 120)
peak = max(np.max(np.abs(outL)), np.max(np.abs(outR)))
outL /= peak / 1.6
outR /= peak / 1.6
outL = np.tanh(outL)
outR = np.tanh(outR)
# fade tail
fade = np.ones(N)
fs = int(28.6 * SR)
fade[fs:] = np.linspace(1, 0, N - fs) ** 1.5
outL *= fade * 0.95
outR *= fade * 0.95

wavfile.write('public/soundtrack.wav', SR, (np.stack([outL, outR], 1) * 32767).astype(np.int16))
print('ok, peak', peak)
