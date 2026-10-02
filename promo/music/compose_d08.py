"""Day 08 — synth arpeggio, 120 BPM; pencil/line sounds on the drawing, clicks on numbers."""
import sys
sys.path.insert(0, 'music')
from synth import *

TOTAL = 630
BOX, BAL, EX, CTA = 60, 210, 330, 450
m = Mix(TOTAL, 8)
B_ = 0.5
prog = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]  # Am F C G
roots = [45, 41, 36, 43]
for b in range(int(m.seconds / B_) + 1):
    t = b * B_
    bar = b // 4
    ch = prog[bar % 4]
    fr = t * 30
    for k in range(4):  # 16th arpeggio
        n = ch[(b * 4 + k) % 3] + (12 if k == 3 else 0)
        m.put(pluck(n + 12, 0.18, 2600), t + k * B_ / 4, 0.22, (k - 1.5) * 0.25)
    if fr < CTA - 15 or fr >= CTA:
        if b >= 2:
            m.put(kick(100, 0.16), t, 0.85)
            m.put(hat(), t + B_ / 2, 0.35, 0.3)
        if b >= 4 and b % 2 == 1:
            m.put(clap(), t, 0.55)
        m.put(bass(roots[bar % 4] - 12 + 12, 0.22), t + B_ / 2, 0.45)
    if b % 4 == 0:
        m.put(pad([n + 12 for n in ch], 2.0), t, 0.3)

m.at_frame(impact(1.0), 0, 0.5)
m.at_frame(pop(600), 6, 0.5)
m.at_frame(pop(900), 16, 0.5)
for k in range(3):
    m.at_frame(scribble(0.6), BOX + k * 8, 0.35)
for k in range(3):
    m.at_frame(click(2200), BOX + 36 + k * 8, 0.6)
for k in range(16):
    m.at_frame(click(1600), BOX + 70 + k * 1.6, 0.25)
m.at_frame(whoosh(0.5), BAL - 6, 0.5)
m.at_frame(thud(), BAL + 40, 0.7)
m.at_frame(thud(), BAL + 60, 0.7)
m.at_frame(thud(), BAL + 80, 0.5)
m.at_frame(thud(), BAL + 100, 0.5)
m.at_frame(whoosh(0.5), EX - 6, 0.5)
m.at_frame(thud(), EX + 10, 0.6)
m.at_frame(thud(), EX + 40, 0.6)
m.at_frame(riser(0.5), CTA - 15, 0.4)
m.at_frame(impact(1.4), CTA, 0.7)
m.at_frame(bell(81), CTA + 20, 0.5)
m.write('public/d08-arp.wav', reverb=0.15, drive=1.7, gain=0.85)
print('ok')
