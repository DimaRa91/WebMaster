"""Day 12 — breakbeat at 120 BPM: syncopated kick/snare break, organ-ish chords, newsroom typewriter and marker FX."""
import sys
sys.path.insert(0, 'music')
from synth import *

ERR0, ELEN = 60, 120
CTA = ERR0 + ELEN * 5
TOTAL = CTA + 180
m = Mix(TOTAL, 12)
beat = 0.5
# break pattern on 16ths: K . . K | S . K . | . K K . | S . . K
pat = 'K..KS.K..KK.S..K'
organ_prog = [[60, 64, 67, 70], [65, 69, 72, 75], [62, 65, 69, 72], [67, 71, 74, 77]]
for bar in range(int(m.seconds / 2) + 1):
    t0 = bar * 2.0
    m.put(saw_stack(organ_prog[bar % 4], 2.0, cutoff=1400, detune=0.003, attack=0.05, release=0.3), t0, 0.22)
    m.put(bass([36, 41, 38, 43][bar % 4], 0.5, 1.6), t0, 0.5)
    m.put(bass([36, 41, 38, 43][bar % 4], 0.3, 1.6), t0 + 0.75, 0.4)
    for k, c in enumerate(pat):
        t = t0 + k * beat / 4
        fr = t * 30
        if CTA - 15 <= fr < CTA or fr < 0:
            continue
        if c == 'K':
            m.put(kick(110, 0.15), t, 0.85)
        elif c == 'S':
            m.put(snare(210, 0.13), t, 0.6)
        m.put(hat(), t, 0.18 if k % 2 else 0.28, 0.3)

m.at_frame(impact(1.2), 0, 0.6)
for k in range(12):
    m.at_frame(click(1300), 4 + k * 2, 0.3)
for i in range(5):
    S = ERR0 + i * ELEN
    m.at_frame(thud(), S, 0.6)
    m.at_frame(scribble(0.45), S + 42, 0.8)
    m.at_frame(buzzer(), S + 46, 0.25)
    m.at_frame(scribble(1.2), S + 58, 0.4)
m.at_frame(impact(1.2), CTA, 0.6)
m.at_frame(thud(), CTA + 24, 0.8)
m.write('public/d12-breaks.wav', reverb=0.12, drive=1.7, gain=0.85)
print('ok')
