#!/usr/bin/env python3
"""Generate PWA/iOS icons with no image libraries (pure stdlib: zlib + struct).

Use this when the environment has no ImageMagick/PIL — check first with:
  which convert magick
  python3 -c "import PIL"
If either is available, prefer that instead; this is the fallback.

CUSTOMIZE the draw() function below for the project's actual icon — a
solid brand-color background plus one simple centered glyph (an emoji-like
shape built from basic fills, or a monogram). Keep shapes simple: this does
per-pixel point-in-polygon tests, so anything elaborate gets slow and messy
at 512x512. See literary_lumineers' public/icon-512.png (an open book + star)
for a worked example of the polygon-fill approach for a non-trivial glyph.

Run with: OUT_DIR=public python3 generate_icons.py
Produces: icon-512.png, icon-192.png, apple-touch-icon.png (180), favicon-32.png
"""
import struct
import zlib
import os

BG = (43, 74, 107)       # TODO: brand background color
FG = (250, 246, 238)     # TODO: brand glyph color


def draw(pixels, w, h, set_px):
    """CUSTOMIZE: paint the glyph into `pixels`. Default: a centered circle."""
    cx, cy, r = w / 2, h / 2, w * 0.28
    for y in range(h):
        for x in range(w):
            if (x - cx) ** 2 + (y - cy) ** 2 <= r * r:
                set_px(x, y, FG)


def make_png(path, size):
    w = h = size
    pixels = [[BG for _ in range(w)] for _ in range(h)]

    def set_px(x, y, color):
        if 0 <= x < w and 0 <= y < h:
            pixels[y][x] = color

    draw(pixels, w, h, set_px)

    raw = bytearray()
    for y in range(h):
        raw.append(0)  # filter type 0 (none) — required per scanline
        for x in range(w):
            r, g, b = pixels[y][x]
            raw += bytes((r, g, b))

    def chunk(tag, data):
        return (struct.pack('>I', len(data)) + tag + data +
                struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff))

    sig = b'\x89PNG\r\n\x1a\n'
    ihdr = struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0)  # 8-bit RGB
    idat = zlib.compress(bytes(raw), 9)
    png = sig + chunk(b'IHDR', ihdr) + chunk(b'IDAT', idat) + chunk(b'IEND', b'')

    with open(path, 'wb') as f:
        f.write(png)


if __name__ == '__main__':
    out_dir = os.environ.get('OUT_DIR', '.')
    os.makedirs(out_dir, exist_ok=True)
    for size, name in [(512, 'icon-512.png'), (192, 'icon-192.png'),
                        (180, 'apple-touch-icon.png'), (32, 'favicon-32.png')]:
        make_png(os.path.join(out_dir, name), size)
        print('wrote', name)
