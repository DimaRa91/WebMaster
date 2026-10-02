#!/usr/bin/env bash
# Builds lounge versions of the finished videos: the picture is copied as-is,
# only the soundtrack is replaced with music/lounge.py at the video's own tempo.
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p public/lounge out/lounge
# file            frames  bpm  seed
while read -r name frames bpm seed; do
  [ -z "$name" ] && continue
  python3 music/lounge.py "$frames" "$bpm" "$seed" "public/lounge/$name.wav" >/dev/null
  ffmpeg -nostdin -y -hide_banner -loglevel error -i "out/$name.mp4" -i "public/lounge/$name.wav" \
    -map 0:v -map 1:a -c:v copy -af "loudnorm=I=-14:TP=-1.5:LRA=9" -c:a aac -b:a 256k -ar 48000 \
    -shortest -movflags +faststart "out/lounge/$name-lounge.mp4"
  echo "done $name"
done <<'LIST'
promo                       1500 120 101
d02-5-shagov                1040  90 102
d03-tablo                    660 120 103
d04-kitay-3-sposoba          864 100 104
d05-mif-ili-fakt             840 120 105
d06-sklad-rimini             930  90 106
d07-chek-list                702 100 107
d08-ves-ili-obem             630 120 108
d09-kargo-vs-belaya          672 150 109
d10-chestny-znak             600 120 110
d11-proverka-sankcii         684 100 111
d12-5-oshibok                840 120 112
d13-chto-takoe-sborny-gruz   720 120 113
LIST
