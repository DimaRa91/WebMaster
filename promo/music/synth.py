"""Shared synth kit for the daily soundtracks. Everything is generated with numpy — no samples."""
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt, fftconvolve

SR = 48000
FPS = 30


class Mix:
    def __init__(self, frames, seed=0):
        self.n = int(SR * frames / FPS)
        self.L = np.zeros(self.n)
        self.R = np.zeros(self.n)
        self.rng = np.random.default_rng(seed)
        self.seconds = frames / FPS

    def put(self, sig, at, g=1.0, pan=0.0):
        i = int(at * SR)
        if i < 0 or i >= self.n:
            return
        k = min(len(sig), self.n - i)
        self.L[i:i + k] += sig[:k] * g * np.sqrt(1 - pan)
        self.R[i:i + k] += sig[:k] * g * np.sqrt(1 + pan)

    def at_frame(self, sig, frame, g=1.0, pan=0.0):
        self.put(sig, frame / FPS, g, pan)

    def write(self, path, reverb=0.15, rev_len=1.0, drive=1.5, gain=0.8, fade=1.5):
        L, R = self.L, self.R
        if reverb:
            n = int(rev_len * SR)
            ir = self.rng.standard_normal(n) * np.exp(-np.arange(n) / SR / (rev_len / 5))
            ir = lp(ir, 6000)
            ir /= np.sqrt(np.sum(ir ** 2))
            L = L + reverb * fftconvolve(L, ir)[:self.n]
            R = R + reverb * fftconvolve(R, ir)[:self.n]
        peak = max(np.abs(L).max(), np.abs(R).max()) or 1
        L = np.tanh(L / peak * drive)
        R = np.tanh(R / peak * drive)
        f = np.ones(self.n)
        s = int((self.seconds - fade) * SR)
        f[s:] = np.linspace(1, 0, self.n - s) ** 1.5
        wavfile.write(path, SR, (np.stack([L * f, R * f], 1) * gain * 32767).astype(np.int16))


rng = np.random.default_rng(42)


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


def noise(d):
    return rng.standard_normal(int(d * SR))


def kick(punch=110, decay=0.18):
    t = t_arr(0.35)
    f = 50 + punch * np.exp(-t / 0.03)
    return np.tanh(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / decay) * 1.8)


def snare(tone=200, decay=0.1):
    t = t_arr(0.25)
    return 0.5 * np.sin(2 * np.pi * tone * t) * np.exp(-t / 0.04) + bp(noise(0.25), 1500, 9000)[:len(t)] * np.exp(-t / decay)


def clap():
    t = t_arr(0.25)
    e = sum(np.exp(-np.clip(t - o, 0, None) / (0.01 if k < 2 else 0.09)) * (t >= o) for k, o in enumerate([0, 0.011, 0.023]))
    return bp(noise(0.25), 900, 6000)[:len(t)] * e * 0.7


def hat(open_=False):
    d = 0.2 if open_ else 0.05
    t = t_arr(d)
    return hp(noise(d), 8000)[:len(t)] * np.exp(-t / (0.06 if open_ else 0.012)) * 0.45


def bass(n, d=0.25, drive=2.0):
    t = t_arr(d)
    return np.tanh(np.sin(2 * np.pi * note(n) * t) * drive) * np.exp(-t / (d * 0.6)) * np.minimum(1, t / 0.003)


def saw_stack(ns, d, cutoff=2500, detune=0.004, attack=0.01, release=0.2):
    t = t_arr(d)
    s = sum(((note(n) * (1 + detune * (k % 3 - 1)) * t + k * 0.13) % 1 * 2 - 1) for k, n in enumerate(ns)) / len(ns)
    env = np.minimum(1, t / attack) * np.clip((d - t) / release, 0, 1)
    return lp(s, cutoff) * env


def pad(ns, d, cutoff=1600):
    t = t_arr(d)
    s = sum(np.sin(2 * np.pi * note(n) * t + 0.4 * np.sin(2 * np.pi * 0.25 * t + k)) for k, n in enumerate(ns)) / len(ns)
    env = np.minimum(1, t / 0.6) * np.clip((d - t) / 0.6, 0, 1)
    return lp(s, cutoff) * env * 0.6


def pluck(n, d=0.3, bright=3000):
    t = t_arr(d)
    f = note(n)
    s = ((f * t) % 1 * 2 - 1) * 0.5 + np.sin(2 * np.pi * f * t)
    return lp(s, bright) * np.exp(-t / 0.09)


def guitar(n, d=0.8):
    """Karplus–Strong plucked string."""
    f = note(n)
    period = int(SR / f)
    buf = rng.uniform(-1, 1, period)
    out = np.zeros(int(d * SR))
    for i in range(len(out)):
        out[i] = buf[i % period]
        buf[i % period] = 0.5 * (buf[i % period] + buf[(i + 1) % period]) * 0.996
    return lp(out, 4000)


def bell(n, d=1.0):
    t = t_arr(d)
    return (np.sin(2 * np.pi * note(n) * t) + 0.4 * np.sin(2 * np.pi * note(n) * 2.76 * t)) * np.exp(-t / 0.35) * 0.5


def whoosh(d=0.5):
    t = t_arr(d)
    n = noise(d)
    out = sum(bp(n, lo, lo * 2)[:len(t)] * np.clip(1 - abs(t / d * 3 - k), 0, 1) for k, lo in enumerate([400, 1200, 3500, 8000]))
    return out * np.sin(np.pi * t / d) * 0.6


def impact(d=1.5):
    t = t_arr(d)
    f = 42 + 100 * np.exp(-t / 0.05)
    return np.tanh((np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.4) + lp(noise(d), 2500)[:len(t)] * np.exp(-t / 0.1) * 0.5) * 1.6)


def click(f0=1800):
    t = t_arr(0.04)
    return np.sin(2 * np.pi * f0 * t) * np.exp(-t / 0.006) * 0.6 + hp(noise(0.04), 3000)[:len(t)] * np.exp(-t / 0.003) * 0.4


def pop(f0=900):
    t = t_arr(0.12)
    return np.sin(2 * np.pi * (f0 + 1200 * np.exp(-t / 0.015)) * t) * np.exp(-t / 0.05) * 0.7


def buzzer():
    t = t_arr(0.4)
    s = np.sign(np.sin(2 * np.pi * 110 * t)) * 0.5 + np.sign(np.sin(2 * np.pi * 117 * t)) * 0.5
    return lp(s, 1800) * np.exp(-t / 0.25) * 0.6


def thud():
    t = t_arr(0.25)
    return np.sin(2 * np.pi * (80 + 60 * np.exp(-t / 0.02)) * t) * np.exp(-t / 0.07) * 0.8


def scribble(d=0.4):
    """Marker on paper."""
    t = t_arr(d)
    n = bp(noise(d), 2000, 7000)[:len(t)]
    am = 0.5 + 0.5 * np.sin(2 * np.pi * 14 * t) ** 2
    return n * am * np.sin(np.pi * t / d) * 0.5


def riser(d):
    t = t_arr(d)
    x = t / d
    n = noise(d)
    out = sum(bp(n, lo, lo * 2)[:len(t)] * np.clip(1 - abs(x ** 1.4 * 4 - k), 0, 1) for k, lo in enumerate([300, 800, 2000, 5000, 10000]))
    return out * x ** 2 * 0.6


def beat_grid(mix, bpm, frames_from, frames_to, pattern):
    """Calls pattern(mix, t_seconds, beat_index) for every beat in the frame range."""
    beat = 60 / bpm
    t = frames_from / FPS
    i = 0
    while t < frames_to / FPS:
        pattern(mix, t, i)
        t += beat
        i += 1
