"""
Downloads free stock footage (Pexels + Pixabay) for the realistic video series.

Needs network access to pexels.com / pixabay.com and two free API keys in the environment:
    PEXELS_API_KEY, PIXABAY_API_KEY
Usage:
    python3 stock/fetch_stock.py            # downloads every query below into stock/clips/
Each clip is saved with a JSON sidecar (author, source page, licence) for the credits in README.
Both licences allow free commercial use without attribution; we still keep the credits.
"""
import json
import os
import sys
import urllib.parse
import urllib.request

OUT = os.path.join(os.path.dirname(__file__), 'clips')
QUERIES = {
    'truck-highway': 'truck highway',
    'warehouse-pallets': 'warehouse pallets forklift',
    'loading-truck': 'loading truck boxes',
    'container-port': 'container port cranes',
    'freight-train': 'freight train containers',
    'cargo-plane': 'cargo airplane loading',
    'boxes-packing': 'packing boxes warehouse',
    'documents-office': 'business documents signing',
    'customs-check': 'customs inspection cargo',
    'furniture-factory': 'furniture factory',
    'ceramic-tiles': 'ceramic tiles factory',
    'shoes-workshop': 'shoes workshop handmade',
    'italy-road': 'italy road aerial',
    'moscow-city': 'moscow city aerial',
    'barcode-scan': 'barcode scanner package',
}


def get_json(url, headers=None):
    req = urllib.request.Request(url, headers={'User-Agent': 'promo-builder/1.0', **(headers or {})})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


def download(url, path):
    req = urllib.request.Request(url, headers={'User-Agent': 'promo-builder/1.0'})
    with urllib.request.urlopen(req, timeout=120) as r, open(path, 'wb') as f:
        f.write(r.read())


def pexels(slug, q, key, n=3):
    url = 'https://api.pexels.com/videos/search?' + urllib.parse.urlencode({'query': q, 'orientation': 'portrait', 'size': 'medium', 'per_page': n})
    data = get_json(url, {'Authorization': key})
    for i, v in enumerate(data.get('videos', [])):
        files = sorted([f for f in v['video_files'] if f.get('height', 0) >= 1280 and f['file_type'] == 'video/mp4'], key=lambda f: f['height'])
        if not files:
            continue
        base = os.path.join(OUT, f'{slug}-pexels-{i}')
        download(files[0]['link'], base + '.mp4')
        json.dump({'source': 'Pexels', 'page': v['url'], 'author': v['user']['name'], 'license': 'Pexels License'}, open(base + '.json', 'w'), ensure_ascii=False)
        print('ok', base)


def pixabay(slug, q, key, n=3):
    url = 'https://pixabay.com/api/videos/?' + urllib.parse.urlencode({'key': key, 'q': q, 'per_page': max(3, n), 'safesearch': 'true'})
    data = get_json(url)
    for i, v in enumerate(data.get('hits', [])[:n]):
        vid = v['videos'].get('large') or v['videos'].get('medium')
        if not vid or not vid.get('url'):
            continue
        base = os.path.join(OUT, f'{slug}-pixabay-{i}')
        download(vid['url'], base + '.mp4')
        json.dump({'source': 'Pixabay', 'page': v['pageURL'], 'author': v['user'], 'license': 'Pixabay Content License'}, open(base + '.json', 'w'), ensure_ascii=False)
        print('ok', base)


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    pk, xk = os.environ.get('PEXELS_API_KEY'), os.environ.get('PIXABAY_API_KEY')
    if not pk and not xk:
        sys.exit('Set PEXELS_API_KEY and/or PIXABAY_API_KEY')
    for slug, q in QUERIES.items():
        try:
            if pk:
                pexels(slug, q, pk)
            if xk:
                pixabay(slug, q, xk)
        except Exception as e:  # keep going on a single failed query
            print('fail', slug, e)
