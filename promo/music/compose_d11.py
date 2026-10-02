"""Day 11 — synthwave at 100 BPM: gated pads, saw bass in 8ths, big snare; terminal keystrokes and beeps on cue."""
import sys
sys.path.insert(0, 'music')
from synth import *

TERM = 72
MSG = TERM + 72 * 5
CTA = MSG + 72
TOTAL = CTA + 180
m = Mix(TOTAL, 11)
beat = 0.6
prog = [[57, 60, 64], [53, 57, 60], [55, 59, 62], [52, 55, 59]]  # Am F G Em
roots = [33, 29, 31, 28]
for b in range(int(m.seconds / beat) + 1):
    t = b * beat
    fr = t * 30
    bar = b // 4
    ch = prog[bar % 4]
    if b % 4 == 0:
        m.put(saw_stack([n + 12 for n in ch], beat * 4, cutoff=1800, detune=0.008, attack=0.3, release=0.6), t, 0.35)
    if CTA - 18 <= fr < CTA:
        continue
    for k in range(2):
        m.put(bass(roots[bar % 4] + 12, beat / 2 * 0.9, 2.5), t + k * beat / 2, 0.5)
    if b >= 4:
        m.put(kick(90, 0.2), t, 0.85)
        if b % 2 == 1:
            m.put(snare(180, 0.22), t, 0.65)
        m.put(hat(), t + beat / 2, 0.3, 0.3)
    m.put(pluck(ch[b % 3] + 24, 0.2, 2200), t + beat * 0.75, 0.15, -0.3)

m.at_frame(buzzer(), 0, 0.4)
for k in range(10):
    m.at_frame(click(1500 + 100 * (k % 3)), 2 + k * 2, 0.35)
# terminal typing & beeps — line starts follow Terminal.tsx
lines = [(0, 32), (30, 36), (100, 40), (190, 42), (270, 31)]
for at, n in lines:
    for k in range(n):
        m.at_frame(click(1400 + 300 * ((k * 7) % 3)), TERM + at + k * 0.6, 0.18)
for done in (80, 170, 250):
    m.at_frame(bell(88, 0.5), TERM + done, 0.4)
m.at_frame(impact(1.2), TERM + 270, 0.5)
m.at_frame(whoosh(0.5), MSG - 6, 0.4)
m.at_frame(impact(1.0), MSG, 0.5)
m.at_frame(riser(0.6), CTA - 18, 0.4)
m.at_frame(impact(1.4), CTA, 0.6)
m.write('public/d11-synthwave.wav', reverb=0.25, rev_len=1.6, drive=1.7, gain=0.85)
print('ok')
