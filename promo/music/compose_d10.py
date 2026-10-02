"""Day 10 — 8-bit chiptune at 120 BPM: square-wave lead and arps, triangle bass, noise drums, coin/level-up FX."""
import sys
sys.path.insert(0, 'music')
from synth import *

LVL0, LVL_LEN = 60, 90
CTA = LVL0 + LVL_LEN * 4
TOTAL = CTA + 180
m = Mix(TOTAL, 10)
beat = 0.5


def square(n, d, duty=0.5, decay=0.25):
    t = t_arr(d)
    ph = (note(n) * t) % 1
    return np.where(ph < duty, 1.0, -1.0) * np.exp(-t / decay) * 0.35


def tri(n, d):
    t = t_arr(d)
    ph = (note(n) * t) % 1
    return (4 * np.abs(ph - 0.5) - 1) * np.minimum(1, (d - t) / 0.02).clip(0, 1) * 0.6


def nkick():
    t = t_arr(0.12)
    return np.sin(2 * np.pi * (60 + 200 * np.exp(-t / 0.01)) * t) * np.exp(-t / 0.05)


def nsnare():
    t = t_arr(0.12)
    return (rng.random(len(t)) * 2 - 1) * np.exp(-t / 0.04) * 0.6


def coin():
    return np.concatenate([square(83, 0.06, 0.5, 1), square(88, 0.25, 0.5, 0.12)])


def levelup():
    return np.concatenate([square(n, 0.07, 0.25, 1) for n in (72, 76, 79, 84, 88, 91)] + [square(96, 0.3, 0.25, 0.15)])


lead = [76, 79, 81, 79, 76, 74, 72, 74, 76, 76, 79, 83, 81, 79, 76, 74]
basses = [45, 45, 41, 41, 48, 48, 43, 43]
for b in range(int(m.seconds / beat) + 1):
    t = b * beat
    fr = t * 30
    if CTA - 15 <= fr < CTA:
        continue
    m.put(tri(basses[(b // 2) % 8] - 12 + 12, beat * 0.9), t, 0.5)
    m.put(nkick(), t, 0.7)
    if b % 2 == 1:
        m.put(nsnare(), t, 0.5)
    m.put(nsnare()[: int(0.03 * SR)] * 0.5, t + beat / 2, 0.4, 0.3)
    for k in range(2):
        m.put(square(lead[(b * 2 + k) % 16], beat / 2 * 0.9, 0.25, 0.2), t + k * beat / 2, 0.45, -0.2)
    m.put(square(basses[(b // 2) % 8] + 24, 0.1, 0.125, 0.05), t + beat * 0.75, 0.25, 0.3)

m.at_frame(levelup(), 0, 0.5)
for i in range(4):
    S = LVL0 + i * LVL_LEN
    m.at_frame(coin(), S, 0.6)
    for k in range(0, 60, 4):
        m.at_frame(square(90, 0.02, 0.5, 1), S + 14 + k, 0.1)
    m.at_frame(coin(), S + 60, 0.7)
m.at_frame(levelup(), CTA, 0.7)
m.at_frame(coin(), CTA + 24, 0.6)
m.write('public/d10-chip.wav', reverb=0.08, drive=1.6, gain=0.8)
print('ok')
