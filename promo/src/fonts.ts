import {continueRender, delayRender, staticFile} from 'remotion';

const CYR = 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116';
const LAT =
  'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2190-2199, U+2212, U+2215, U+FEFF, U+FFFD';

const faces: [string, string, string, string?][] = [
  ['Unbounded', 'unbounded', '800'],
  ['Unbounded', 'unbounded', '900'],
  ['Inter', 'inter', '500'],
  ['Inter', 'inter', '700'],
  ['Inter', 'inter', '800'],
  ['JetBrains Mono', 'jetbrains-mono', '500'],
  ['JetBrains Mono', 'jetbrains-mono', '700'],
  ['Playfair Display', 'playfair-display', '700'],
  ['Playfair Display', 'playfair-display', '900'],
  ['Playfair Display', 'playfair-display', '900', 'italic'],
  ['IBM Plex Mono', 'ibm-plex-mono', '400'],
  ['IBM Plex Mono', 'ibm-plex-mono', '600'],
  ['Rubik', 'rubik', '500'],
  ['Rubik', 'rubik', '700'],
  ['Rubik', 'rubik', '900'],
  ['Manrope', 'manrope', '500'],
  ['Manrope', 'manrope', '700'],
  ['Manrope', 'manrope', '800'],
];

const handle = delayRender('fonts');
const loads: Promise<unknown>[] = [];
for (const [family, file, weight, style = 'normal'] of faces) {
  for (const [subset, range] of [
    ['cyrillic', CYR],
    ['latin', LAT],
  ]) {
    const ff = new FontFace(family, `url(${staticFile(`fonts/${file}-${subset}-${weight}-${style}.woff2`)}) format('woff2')`, {
      weight,
      style,
      unicodeRange: range,
    });
    document.fonts.add(ff);
    loads.push(ff.load());
  }
}
Promise.all(loads)
  .then(() => continueRender(handle))
  .catch((e) => {
    console.error(e);
    continueRender(handle);
  });
