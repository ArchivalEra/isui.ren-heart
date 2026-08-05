#!/usr/bin/env python3
# 裁切 logo.png 的透明边（图形占满画布——CSS 定位基于图形而非画布）
# 用法：python3 scripts/trim-logo.py（输出 logo-trimmed.png + 打印 CSS 补偿百分比）
# 输出补偿值需手工同步到 styles.css 的 .heart-logo transform
import zlib, struct

def decode_png(path):
    with open(path, 'rb') as f:
        d = f.read()
    w, h = struct.unpack('>II', d[16:24])
    pos, idat = 8, b''
    while pos < len(d):
        ln = struct.unpack('>I', d[pos:pos+4])[0]
        typ = d[pos+4:pos+8]
        if typ == b'IDAT':
            idat += d[pos+8:pos+8+ln]
        pos += 12 + ln
    raw = zlib.decompress(idat)
    stride = w * 4 + 1
    rows, prev = [], [0] * (w * 4)
    for y in range(h):
        row = bytearray(raw[y * stride:(y + 1) * stride])
        ft = row[0]
        px = list(row[1:])
        for i in range(len(px)):
            a = px[i - 4] if i >= 4 else 0
            b = prev[i]
            c = prev[i - 4] if i >= 4 else 0
            if ft == 1:
                px[i] = (px[i] + a) & 255
            elif ft == 2:
                px[i] = (px[i] + b) & 255
            elif ft == 3:
                px[i] = (px[i] + ((a + b) // 2)) & 255
            elif ft == 4:
                p = a + b - c
                pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
                pr = a if (pa <= pb and pa <= pc) else (b if pb <= pc else c)
                px[i] = (px[i] + pr) & 255
        rows.append(px)
        prev = px
    return w, h, rows

def encode_png(w, h, rows):
    def chunk(typ, data):
        c = struct.pack('>I', len(data)) + typ + data
        return c + struct.pack('>I', zlib.crc32(typ + data) & 0xffffffff)

    raw = bytearray()
    for y in range(h):
        raw.append(0)
        raw.extend(rows[y])
    ihdr = struct.pack('>IIBBBBB', w, h, 8, 6, 0, 0, 0)
    return (b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', ihdr)
            + chunk(b'IDAT', zlib.compress(bytes(raw), 9)) + chunk(b'IEND', b''))

w, h, rows = decode_png('public/logo.png')
TH, PAD = 10, 4
x0, y0, x1, y1 = w, h, -1, -1
for y in range(h):
    for x in range(w):
        if rows[y][x * 4 + 3] > TH:
            if x < x0:
                x0 = x
            if x > x1:
                x1 = x
            if y < y0:
                y0 = y
            if y > y1:
                y1 = y
x0p, y0p = max(0, x0 - PAD), max(0, y0 - PAD)
x1p, y1p = min(w - 1, x1 + PAD), min(h - 1, y1 + PAD)
W2, H2 = x1p - x0p + 1, y1p - y0p + 1
cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
# transform % 相对「新画布」尺寸（渲染时缩放一致）
cxp = (cx - w / 2) / W2 * 100
cyp = (cy - h / 2) / H2 * 100
out_rows = [rows[y][x0p * 4:(x1p + 1) * 4] for y in range(y0p, y1p + 1)]
with open('public/logo-trimmed.png', 'wb') as f:
    f.write(encode_png(W2, H2, out_rows))
print(f'trimmed {W2}x{H2}')
print(f'CSS 补偿: transform: translate(calc(-50% {cxp:+.3f}%), calc(-50% {cyp:+.3f}%))')
