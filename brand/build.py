"""Generates the TUTTI logo set as clean SVG (all letters are drawn geometry, no fonts)."""
INK, CREAM, ORANGE, COBALT = '#0B0C12', '#F3EEE2', '#FF4D12', '#2236FF'

def mark(x=0, y=0, s=1.0, light=True):
    """Three cargo blocks packed into one box; the gaps between them form a T."""
    b2 = INK if light else CREAM
    r = 10 * s
    def rect(rx, ry, w, h, c):
        return f'<rect x="{x+rx*s:.1f}" y="{y+ry*s:.1f}" width="{w*s:.1f}" height="{h*s:.1f}" rx="{r:.1f}" fill="{c}"/>'
    return (rect(0, 0, 120, 40, ORANGE) + rect(0, 58, 51, 62, b2) + rect(69, 58, 51, 62, COBALT))

def T(x):
    return f'<rect x="{x}" y="0" width="84" height="28"/><rect x="{x+28}" y="0" width="28" height="100"/>'

def cup(x, deep=51):
    return (f'<path d="M{x} 0H{x+28}V{deep}A21 21 0 0 0 {x+70} {deep}V0H{x+98}V{deep}'
            f'A49 49 0 0 1 {x} {deep}Z"/>')

def box(x, y):
    return f'<rect x="{x}" y="{y}" width="26" height="26" rx="3" fill="{ORANGE}"/>'

def word_lat(color):
    # T U TT I — the U carries a parcel, the double T shares one bar
    g = T(0) + cup(98) + box(134, 40)
    g += '<rect x="210" y="0" width="182" height="28"/><rect x="238" y="0" width="28" height="100"/><rect x="336" y="0" width="28" height="100"/>'
    g += '<rect x="406" y="0" width="28" height="100"/>'
    return f'<g fill="{color}">{g}</g>', 434

def svg(w, h, body, bg=None):
    bgr = f'<rect width="{w}" height="{h}" fill="{bg}"/>' if bg else ''
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">{bgr}{body}</svg>\n'

def horizontal(light=True):
    fg = INK if light else CREAM
    word, ww = word_lat(fg)
    W = 120 + 40 + ww
    body = mark(0, 0, 1, light) + f'<g transform="translate(160 10)">{word}</g>'
    return W, 120, body

def write(name, w, h, body, bg=None, pad=0):
    W, H = w + 2 * pad, h + 2 * pad
    open(name, 'w').write(svg(W, H, f'<g transform="translate({pad} {pad})">{body}</g>', bg))

if __name__ == '__main__':
    write('tutti-mark.svg', 120, 120, mark(), pad=0)
    write('tutti-mark-dark.svg', 120, 120, mark(light=False), bg=INK, pad=20)
    for light in (True, False):
        w, h, b = horizontal(light)
        write(f"tutti-logo{'' if light else '-dark'}.svg", w, h, b, bg=None if light else INK, pad=0 if light else 30)
    # social avatar: circle-safe, mark on orange-free ink tile
    av = f'<rect width="400" height="400" fill="{INK}"/>' + mark(110, 110, 1.5, light=False)
    open('tutti-avatar.svg', 'w').write(svg(400, 400, av))
    print('ok')
