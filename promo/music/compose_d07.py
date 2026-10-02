"""Day 07 — acoustic: Karplus–Strong guitar strums, shaker, soft kick; marker scribbles on each note. 100 BPM."""
import sys
sys.path.insert(0, 'music')
from synth import *

TOTAL = 72 + 72 * 6 + 198
ITEM0, ITEM_LEN, CTA = 72, 72, 72 + 72 * 6
m = Mix(TOTAL, 7)
chords = [[52, 59, 64, 67, 71], [48, 55, 60, 64, 67], [43, 50, 55, 59, 62], [50, 57, 62, 66, 69]]  # Em C G D (open voicings)
beat = 0.6


def strum(ns, at, up=False, g=0.25):
    order = ns[::-1] if up else ns
    for k, n in enumerate(order):
        m.put(guitar(n, 1.2), at + k * 0.012, g * (0.7 if up else 1.0), (k - 2) * 0.12)


for b in range(int(m.seconds / beat) + 1):
    t = b * beat
    bar = b // 4
    ch = chords[bar % 4]
    strum(ch, t, False)
    strum(ch[1:], t + beat / 2, True, 0.18)
    if b >= 4:
        if b % 2 == 0:
            m.put(kick(70, 0.15), t, 0.55)
        m.put(hp(noise(0.08), 6000)[:int(0.08 * SR)] * np.exp(-t_arr(0.08) / 0.02) * 0.4, t + beat / 2, 0.6, 0.4)
        if b % 2 == 1:
            m.put(snare(220, 0.07), t, 0.25)

m.at_frame(pop(700), 0, 0.5)
for k in range(4):
    m.at_frame(scribble(0.35), 2 + k * 9, 0.35)
for i in range(6):
    at = ITEM0 + i * ITEM_LEN
    m.at_frame(pop(900 + 60 * i), at, 0.6)
    m.at_frame(scribble(0.7), at + 4, 0.45)
    m.at_frame(scribble(0.4), at + 34, 0.3)
    m.at_frame(scribble(0.25), at + 50, 0.5)
m.at_frame(whoosh(0.5), CTA - 6, 0.5)
m.at_frame(thud(), CTA + 10, 0.7)
m.at_frame(impact(1.2), CTA + 36, 0.5)
m.at_frame(bell(83), CTA + 36, 0.4)
m.write('public/d07-acoustic.wav', reverb=0.2, rev_len=1.4, drive=1.8, gain=0.9)
print('ok')
