"""Day 13 — ukulele (Karplus–Strong, high strings), claps and glockenspiel at 120 BPM; paper rustle and pops on cue."""
import sys
sys.path.insert(0, 'music')
from synth import *

LONELY, SHARED, PAY, STORE, CTA, TOTAL = 60, 180, 300, 420, 540, 720
m = Mix(TOTAL, 13)
beat = 0.5
chords = [[67, 72, 76, 79], [67, 71, 74, 79], [69, 72, 76, 81], [65, 69, 72, 77]]  # C G Am F (uke voicings)
strum_pat = [(0, False), (0.5, False), (0.75, True), (1.25, True), (1.5, False), (1.75, True)]
for bar in range(int(m.seconds / 2) + 1):
    t0 = bar * 2.0
    ch = chords[bar % 4]
    for off, up in strum_pat:
        order = ch[::-1] if up else ch
        for k, n in enumerate(order):
            m.put(guitar(n, 0.6), t0 + off + k * 0.01, 0.16 if up else 0.22, (k - 1.5) * 0.15)
    m.put(bass([48, 43, 45, 41][bar % 4], 0.45, 1.3), t0, 0.4)
    m.put(bass([48, 43, 45, 41][bar % 4], 0.3, 1.3), t0 + 1.0, 0.3)
    for b in range(4):
        t = t0 + b * beat
        if t * 30 >= LONELY:
            m.put(kick(70, 0.12), t, 0.5)
            if b % 2 == 1:
                m.put(clap(), t, 0.4)
    m.put(bell([84, 88, 91, 86][bar % 4], 0.8), t0 + 1.5, 0.15)


def rustle(d=0.3):
    t = t_arr(d)
    return bp(noise(d), 2500, 9000)[:len(t)] * (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 23 * t))) * np.sin(np.pi * t / d) * 0.5


m.at_frame(rustle(0.4), 0, 0.6)
m.at_frame(pop(800), 8, 0.5)
m.at_frame(rustle(0.6), LONELY - 10, 0.5)
m.at_frame(thud(), LONELY + 12, 0.6)
for k in range(5):
    m.at_frame(thud(), SHARED + 18 + k * 9, 0.5)
    m.at_frame(pop(900 + 80 * k), SHARED + 6 + k * 9, 0.3)
m.at_frame(bell(91), PAY + 20, 0.5)
for k in range(3):
    m.at_frame(pop(1100 + 150 * k), STORE + 12 + k * 12, 0.5)
m.at_frame(whoosh(0.8), CTA - 30, 0.5)
m.at_frame(bell(96), CTA + 20, 0.4)
m.write('public/d13-ukulele.wav', reverb=0.18, rev_len=1.2, drive=1.7, gain=0.85)
print('ok')
