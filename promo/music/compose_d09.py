"""Day 09 — trap at 150 BPM (half-time feel): 808 glides, hat rolls, glitch hits for cargo, bells for white."""
import sys
sys.path.insert(0, 'music')
from synth import *

ROUND0, RLEN = 48, 96
VERDICT = ROUND0 + RLEN * 4
CTA = VERDICT + 96
TOTAL = CTA + 144
m = Mix(TOTAL, 9)
beat = 12 / 30


def b808(n, d, glide=None):
    t = t_arr(d)
    f = note(n) if glide is None else note(n) + (note(glide) - note(n)) * np.exp(-t / 0.08)
    return np.tanh(np.sin(2 * np.pi * np.cumsum(np.full(len(t), 1.0) * f) / SR) * 2.5) * np.exp(-t / (d * 0.7))


def glitch():
    t = t_arr(0.2)
    s = np.sign(np.sin(2 * np.pi * (300 + 2000 * rng.random()) * t)) * (rng.random(len(t)) > 0.4)
    return lp(s, 5000) * np.exp(-t / 0.08) * 0.4


notes808 = [38, 38, 41, 36]
for b in range(int(m.seconds / beat) + 1):
    t = b * beat
    fr = t * 30
    bar = b // 4
    pos = b % 4
    if CTA - 12 <= fr < CTA:
        continue
    if b >= 4:
        if pos == 0:
            m.put(kick(120, 0.2), t, 0.9)
            m.put(b808(notes808[bar % 4], beat * 2.5, glide=notes808[bar % 4] + 5 if bar % 2 else None), t, 0.7)
        if pos == 2:
            m.put(clap(), t, 0.7)
            m.put(snare(190, 0.12), t, 0.4)
        if pos == 3 and bar % 2 == 1:
            m.put(kick(120, 0.15), t + beat / 2, 0.6)
        rolls = 3 if (pos == 3 and bar % 2) else 2
        for k in range(rolls):
            m.put(hat(), t + k * beat / rolls, 0.3, 0.3)
    if pos == 0:
        m.put(pad([62, 65, 69], beat * 4, cutoff=1200), t, 0.3)
    if pos in (0, 2) and b >= 4:
        m.put(bell([74, 77, 81, 79][(b // 2) % 4], 0.8), t, 0.12, -0.3)

m.at_frame(glitch(), 0, 0.7)
m.at_frame(impact(1.0), 6, 0.6)
m.at_frame(bell(86), 10, 0.4)
for r in range(4):
    S = ROUND0 + r * RLEN
    m.at_frame(whoosh(0.4), S, 0.4)
    m.at_frame(glitch(), S + 6, 0.8)
    m.at_frame(whoosh(0.4), S + 18, 0.4, 0.4)
    m.at_frame(buzzer(), S + 36, 0.35)
    m.at_frame(bell(88), S + 48, 0.5)
m.at_frame(impact(1.2), VERDICT + 4, 0.7)
for i in range(3):
    m.at_frame(pop(900 + 200 * i), VERDICT + 24 + i * 12, 0.5)
m.at_frame(riser(0.4), CTA - 12, 0.4)
m.at_frame(impact(1.4), CTA, 0.7)
m.write('public/d09-trap.wav', reverb=0.12, drive=1.7, gain=0.85)
print('ok')
