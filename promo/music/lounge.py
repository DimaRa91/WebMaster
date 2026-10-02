"""
Relaxing lounge soundtrack generator (original, synthesized with numpy).
Rhodes-style electric piano with jazzy 7th/9th chords, warm walking bass, brushed drums,
shaker, vibraphone phrases and a soft pad. The tempo matches each video's edit grid so the
cuts still land on beats; a laid-back half-time groove keeps it calm.

    python3 music/lounge.py <frames> <bpm> <seed> <out.wav>
"""
import sys
sys.path.insert(0, 'music')
from synth import *


def epiano(ns, d, bright=1.0):
    t = t_arr(d)
    out = np.zeros(len(t))
    for f in (note(n) for n in ns):
        mod = np.sin(2 * np.pi * f * t) * 1.1 * np.exp(-t / 0.5) * bright
        out += np.sin(2 * np.pi * f * t + mod) * (0.65 + 0.35 * np.exp(-t / 0.35))
    env = np.minimum(1, t / 0.008) * np.exp(-t / 2.2) * np.clip((d - t) / 0.25, 0, 1)
    trem = 1 + 0.15 * np.sin(2 * np.pi * 4.2 * t)
    return lp(out * env * trem / len(ns), 3000)


def vibes(n, d=1.6):
    t = t_arr(d)
    f = note(n)
    s = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 4 * f * t) * np.exp(-t / 0.05)
    return s * np.exp(-t / 0.8) * (1 + 0.25 * np.sin(2 * np.pi * 5.5 * t)) * 0.5


def upright(n, d):
    t = t_arr(d)
    f = note(n)
    s = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / 0.1)
    return lp(s, 900) * np.minimum(1, t / 0.006) * np.exp(-t / (d * 0.9))


def brush(d=0.25):
    t = t_arr(d)
    return bp(noise(d), 2500, 9000)[:len(t)] * np.exp(-t / 0.08) * 0.35


def soft_kick():
    t = t_arr(0.4)
    f = 45 + 50 * np.exp(-t / 0.04)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.22) * 0.9


def rim():
    t = t_arr(0.08)
    return (np.sin(2 * np.pi * 900 * t) * np.exp(-t / 0.012) + bp(noise(0.08), 2000, 6000)[:len(t)] * np.exp(-t / 0.02) * 0.5) * 0.5


def shaker():
    t = t_arr(0.07)
    return bp(noise(0.07), 5000, 11000)[:len(t)] * np.exp(-t / 0.02) * 0.25


# ii–V–I–vi in F with extensions:  Gm9  C13  Fmaj9  Dm9
CHORDS = [
    ([55, 58, 62, 65, 69], 43),
    ([58, 62, 64, 69], 48),
    ([57, 60, 64, 67], 41),
    ([53, 57, 60, 64], 38),
]
MELODY = [76, 74, 72, 69, 72, 74, 77, 76]


def make(frames, bpm, seed, out):
    m = Mix(frames, seed)
    # keep it laid-back: very fast edit grids get a half-time groove
    groove_bpm = bpm / 2 if bpm > 125 else bpm
    beat = 60 / groove_bpm
    bar_len = beat * 4
    bars = int(m.seconds / bar_len) + 1
    for b in range(bars):
        t0 = b * bar_len
        ch, root = CHORDS[b % 4]
        # rhodes: anticipated comping, soft
        m.put(epiano(ch, bar_len * 0.9), t0, 0.45)
        m.put(epiano(ch[1:4], beat * 1.2, 0.6), t0 + beat * 2.5, 0.22, 0.25)
        m.put(pad([n + 12 for n in ch[:3]], bar_len + 0.5, cutoff=1300), t0, 0.18)
        # walking-ish bass
        walk = [root, root + 7, root + 12, root + 10] if b % 2 == 0 else [root, root + 3, root + 5, root + 7]
        for k, n in enumerate(walk):
            m.put(upright(n, beat * 0.95), t0 + k * beat, 0.5)
        # drums: soft kick on 1 (and the "and" of 3), rim on 3, brushes, shaker
        if b >= 1:
            m.put(soft_kick(), t0, 0.6)
            m.put(soft_kick(), t0 + beat * 2.5, 0.35)
            m.put(rim(), t0 + beat * 2, 0.45, 0.2)
            for k in range(8):
                m.put(shaker(), t0 + k * beat / 2 + (0.02 if k % 2 else 0), 0.5 if k % 2 else 0.3, 0.35)
            for k in range(4):
                m.put(brush(), t0 + k * beat, 0.3, -0.3)
        # vibraphone phrase every other bar
        if b % 2 == 1:
            for k in range(4):
                m.put(vibes(MELODY[(b * 2 + k) % 8]), t0 + k * beat * 0.75, 0.22, -0.2)
    # gentle intro swell and a final chord that rings out
    m.put(epiano([65, 69, 72, 76, 79], 3.0), max(0, m.seconds - 3.0), 0.35)
    m.write(out, reverb=0.3, rev_len=2.2, drive=1.2, gain=0.8, fade=2.0)


if __name__ == '__main__':
    frames, bpm, seed, out = int(sys.argv[1]), float(sys.argv[2]), int(sys.argv[3]), sys.argv[4]
    make(frames, bpm, seed, out)
    print('ok', out)
