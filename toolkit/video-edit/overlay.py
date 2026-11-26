#!/usr/bin/env python3
"""Black Star Media icon / vector / karaoke-caption overlay for talking-head clips.

usage: overlay.py base.mp4 out.mp4 words.json [fonts_dir]
       overlay.py base.mp4 out.mp4 words.json fonts_dir t1,t2,...   (writes ov_<t>.png stills)

The event timings in draw_frame() were written for one specific clip (Suno Visuals).
For a new clip, edit those times/icons from words.json (see README.md).
"""
import math, subprocess, sys, random
import numpy as np
from PIL import Image, ImageDraw, ImageFont

SRC, DST = sys.argv[1], sys.argv[2]
WORDS_JSON = sys.argv[3]
FD = (sys.argv[4] if len(sys.argv) > 4 else 'fonts').rstrip('/') + '/'
W, H = 1080, 1920
FPS = 30
SIL, WHT, MUT, SURF = (203, 208, 216), (232, 235, 239), (113, 118, 123), (22, 24, 28)
MONO = FD + 'SpaceMono-Bold.ttf'; SERIF = FD + 'PlayfairDisplay.ttf'

def ease_back(x, s=1.9):
    x = min(max(x, 0), 1); x -= 1
    return x * x * ((s + 1) * x + s) + 1
def ease_out(x): x = min(max(x, 0), 1); return 1 - (1 - x) ** 3
def clamp(x): return min(max(x, 0), 1)

# ---------- vector icons, drawn on a 400px canvas, 5px-ish silver strokes ----------
S = 400
def icon(name, phase=0.0):
    im = Image.new('RGBA', (S, S), (0, 0, 0, 0)); d = ImageDraw.Draw(im); c = WHT + (255,); w = 16
    def L(pts, ww=w): d.line(pts, fill=c, width=ww, joint='curve')
    if name == 'bulb':
        d.ellipse([110, 60, 290, 240], outline=c, width=w); L([(165, 235), (165, 290), (235, 290), (235, 235)])
        L([(160, 325), (240, 325)]); L([(175, 358), (225, 358)])
        for a in (-60, -30, 0, 30, 60):
            r = math.radians(a - 90); d.line([(200 + 140 * math.cos(r), 150 + 140 * math.sin(r)), (200 + 175 * math.cos(r), 150 + 175 * math.sin(r))], fill=c, width=12)
    elif name == 'note':
        d.ellipse([90, 250, 190, 330], fill=c); L([(180, 285), (180, 80)], 18); L([(180, 80), (290, 130), (290, 210)], 18); d.ellipse([220, 190, 320, 270], fill=c)
    elif name == 'pen':
        d.polygon([(110, 300), (130, 240), (290, 80), (330, 120), (170, 280)], outline=c, width=w); L([(130, 240), (170, 280)]); L([(95, 330), (130, 300)], 14)
        L([(250, 120), (290, 160)], 12)
    elif name == 'wave':
        hs = [40, 110, 190, 120, 230, 150, 80, 170, 60]
        for i, h in enumerate(hs):
            h = h * (0.55 + 0.45 * math.sin(phase * 7 + i * 1.3)) if phase else h
            x = 55 + i * 36; d.rounded_rectangle([x - 9, 200 - h / 2 - 8, x + 9, 200 + h / 2 + 8], 9, fill=c)
    elif name == 'video':
        d.rounded_rectangle([70, 150, 330, 320], 22, outline=c, width=w); d.rounded_rectangle([70, 90, 330, 150], 14, outline=c, width=w)
        for x in (130, 200, 270): L([(x, 150), (x - 38, 92)], 12)
        d.polygon([(175, 195), (175, 275), (240, 235)], fill=c)
    elif name == 'play':
        d.polygon([(135, 90), (135, 310), (320, 200)], outline=c, width=w, fill=None); d.polygon([(170, 140), (170, 260), (270, 200)], fill=c)
    elif name == 'bolt':
        d.polygon([(235, 40), (110, 220), (195, 220), (160, 360), (300, 165), (215, 165)], fill=c)
    elif name == 'coin':
        d.ellipse([70, 70, 330, 330], outline=c, width=w); d.ellipse([105, 105, 295, 295], outline=c, width=8)
        f = ImageFont.truetype(SERIF, 190); d.text((200, 205), '$', font=f, fill=c, anchor='mm')
    elif name == 'chart':
        for i, h in enumerate((70, 120, 175)): x = 80 + i * 85; d.rounded_rectangle([x, 330 - h, x + 55, 330], 8, fill=c)
        L([(70, 215), (160, 160), (230, 190), (330, 70)], 14); L([(330, 70), (280, 75)], 14); L([(330, 70), (325, 120)], 14)
    elif name == 'mega':
        d.polygon([(80, 160), (220, 100), (220, 290), (80, 240)], outline=c, width=w); d.rounded_rectangle([50, 160, 90, 240], 8, fill=c)
        L([(120, 245), (140, 330)], 18)
        for r, a in ((60, 1), (100, 1)): d.arc([240 - r // 2, 195 - r, 240 + r, 195 + r], -50, 50, fill=c, width=12)
    elif name == 'mic':
        d.rounded_rectangle([145, 50, 255, 220], 55, outline=c, width=w); d.arc([95, 130, 305, 290], 0, 180, fill=c, width=w)
        L([(200, 290), (200, 345)]); L([(150, 348), (250, 348)])
    elif name == 'layers':
        for dy in (0, 60, 120):
            d.polygon([(200, 90 + dy), (330, 150 + dy), (200, 210 + dy), (70, 150 + dy)], outline=c, width=w - 4)
    elif name == 'cursor':
        d.polygon([(110, 60), (110, 300), (175, 245), (225, 340), (265, 320), (215, 230), (300, 225)], fill=c)
    elif name == 'star':
        pts = []
        for i in range(10):
            r = 170 if i % 2 == 0 else 72; a = math.radians(-90 + i * 36); pts.append((200 + r * math.cos(a), 205 + r * math.sin(a)))
        d.polygon(pts, fill=c)
    elif name == 'spark':
        pts = []
        for i in range(8):
            r = 185 if i % 2 == 0 else 28; a = math.radians(-90 + i * 45); pts.append((200 + r * math.cos(a), 200 + r * math.sin(a)))
        d.polygon(pts, fill=c)
    elif name == 'heart':
        d.polygon([(200, 330), (60, 190), (60, 120), (110, 70), (160, 80), (200, 130), (240, 80), (290, 70), (340, 120), (340, 190)], fill=c)
    return im

_disc = {}
def disc(name, d_px=300, phase=0.0, ring=True):
    """glass disc (site surface colour, hairline ring) + icon."""
    key = (name, d_px, round(phase * 20) if name == 'wave' else 0, ring)
    if key in _disc: return _disc[key]
    k = 2; N = d_px * k; base = Image.new('RGBA', (N, N), (0, 0, 0, 0)); g = ImageDraw.Draw(base)
    if ring:
        g.ellipse([0, 0, N - 1, N - 1], fill=SURF + (232,)); g.ellipse([0, 0, N - 1, N - 1], outline=(255, 255, 255, 70), width=3 * k // 2 + 2)
        g.ellipse([N * 0.05, N * 0.05, N * 0.95, N * 0.95], outline=(255, 255, 255, 22), width=2)
        ic = icon(name, phase).resize((int(N * 0.62), int(N * 0.62)), Image.LANCZOS); base.alpha_composite(ic, ((N - ic.width) // 2, (N - ic.height) // 2))
    else:
        ic = icon(name, phase).resize((N, N), Image.LANCZOS); base.alpha_composite(ic)
    out = base.resize((d_px, d_px), Image.LANCZOS)
    if name != 'wave': _disc[key] = out
    return out

_lab = {}
def label(text, size=30, fill=SIL, pill=True, serif=False):
    key = (text, size, pill, serif)
    if key in _lab: return _lab[key]
    f = ImageFont.truetype(SERIF if serif else MONO, size)
    star = text.startswith('★'); t = text.lstrip('★ ').strip() if star else text
    sw = int(size * 1.1) if star else 0
    wd = int(f.getlength(t)) + (44 if pill else 0) + sw; hg = size + (26 if pill else 12)
    im = Image.new('RGBA', (wd + 8, hg + 8), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    if pill:
        d.rounded_rectangle([4, 4, wd + 4, hg + 4], (hg) // 2, fill=SURF + (225,), outline=(255, 255, 255, 60), width=2)
    x0 = 4 + (22 if pill else 0)
    if star:
        st = disc('star', int(size * 0.9), ring=False); im.alpha_composite(st, (x0, (hg + 8 - st.height) // 2 - 1))
    d.text((x0 + sw, (hg + 8) / 2 + 1), t, font=f, fill=fill + (255,), anchor='lm')
    _lab[key] = im; return im

def paste(layer, im, cx, cy, scale=1.0, alpha=1.0, rot=0):
    if scale <= 0.02 or alpha <= 0.01: return
    if scale != 1.0: im = im.resize((max(2, int(im.width * scale)), max(2, int(im.height * scale))), Image.BILINEAR)
    if rot: im = im.rotate(rot, resample=Image.BICUBIC, expand=True)
    if alpha < 1.0:
        a = im.getchannel('A').point(lambda v: int(v * alpha)); im = im.copy(); im.putalpha(a)
    layer.alpha_composite(im, (int(cx - im.width / 2), int(cy - im.height / 2))) if (0 <= cx - im.width / 2 and cx + im.width / 2 <= W and 0 <= cy - im.height / 2 and cy + im.height / 2 <= H) else _clip_paste(layer, im, cx, cy)

def _clip_paste(layer, im, cx, cy):
    x, y = int(cx - im.width / 2), int(cy - im.height / 2)
    sx, sy = max(0, -x), max(0, -y); ex, ey = min(im.width, W - x), min(im.height, H - y)
    if ex > sx and ey > sy: layer.alpha_composite(im.crop((sx, sy, ex, ey)), (x + sx, y + sy))

# ---------- animated pieces ----------
def pop_item(layer, t, t0, t1, name, x, y, d_px=200, lab=None, float_amp=7, tilt=0):
    if not (t0 <= t < t1 + 0.35): return
    lt = t - t0; out = clamp((t1 + 0.35 - t) / 0.35) if t >= t1 else 1.0
    sc = ease_back(lt / 0.35) * (0.7 + 0.3 * out)
    fy = y + math.sin(lt * 3.2) * float_amp
    paste(layer, disc(name, d_px, phase=t), x, fy, sc, out, rot=tilt * (1 - ease_out(lt / 0.5)))
    if lab: paste(layer, label(lab, 26), x, fy + d_px / 2 + 34, ease_back((lt - 0.12) / 0.3), out)

def burst(layer, t, t0, x, y, n=14, r0=60, r1=260, life=0.65, w=7):
    lt = t - t0
    if not (0 <= lt < life): return
    p = ease_out(lt / life); a = int(255 * (1 - p))
    ov = Image.new('RGBA', (r1 * 2 + 40, r1 * 2 + 40), (0, 0, 0, 0)); d = ImageDraw.Draw(ov); cx = cy = r1 + 20
    for i in range(n):
        ang = i / n * math.tau + 0.2; ra = r0 + (r1 - r0) * p * 0.9; rb = ra + 40 * (1 - p) + 8
        d.line([(cx + ra * math.cos(ang), cy + ra * math.sin(ang)), (cx + rb * math.cos(ang), cy + rb * math.sin(ang))], fill=WHT + (a,), width=w)
    rr = r0 + (r1 - r0) * p; d.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], outline=SIL + (int(a * 0.8),), width=5)
    _clip_paste(layer, ov, x, y)

def sparkle(layer, t, t0, x, y, size=70, life=1.1, rot=0):
    lt = t - t0
    if not (0 <= lt < life): return
    s = math.sin(clamp(lt / life) * math.pi); paste(layer, disc('spark', size, ring=False), x, y, 0.3 + 0.9 * s, min(1, s * 1.6), rot=rot + lt * 90)

def pipeline(layer, t, items, t_end, y=0.115 * H, d_px=150):
    """row of icon discs joined by a line that fills as each beat is spoken."""
    t_first = items[0][0]
    if not (t_first <= t < t_end + 0.4): return
    out = clamp((t_end + 0.4 - t) / 0.4) if t >= t_end else 1.0
    n = len(items); xs = [W * (0.13 + 0.185 * i) for i in range(n)]
    ov = Image.new('RGBA', (W, 260), (0, 0, 0, 0)); d = ImageDraw.Draw(ov); cy = 130
    d.line([(xs[0], cy), (xs[-1], cy)], fill=(255, 255, 255, 40), width=5)
    prog = xs[0]
    for i, (ti, nm, lb) in enumerate(items):
        if t >= ti: prog = max(prog, xs[i] if t >= ti + 0.45 else xs[i - 1] + (xs[i] - xs[i - 1]) * clamp((t - ti) / 0.45) if i else xs[0])
    d.line([(xs[0], cy), (prog, cy)], fill=WHT + (255,), width=7)
    layer.alpha_composite(Image.eval(ov, lambda v: v) if out >= 1 else _fade(ov, out), (0, int(y - 130)))
    for (ti, nm, lb), x in zip(items, xs):
        if t < ti: continue
        lt = t - ti; sc = ease_back(lt / 0.35) * (0.75 + 0.25 * out)
        paste(layer, disc(nm, d_px, phase=t), x, y, sc, out)
        paste(layer, label(lb, 24), x, y + d_px / 2 + 32, ease_back((lt - 0.1) / 0.3), out)

def _fade(im, a):
    im = im.copy(); im.putalpha(im.getchannel('A').point(lambda v: int(v * a))); return im

def stars_row(layer, t, t0, t1, y, label_txt):
    if not (t0 <= t < t1 + 0.3): return
    out = clamp((t1 + 0.3 - t) / 0.3) if t >= t1 else 1.0
    for i in range(5):
        ti = t0 + i * 0.16
        if t < ti: continue
        paste(layer, disc('star', 120, ring=False), W * (0.5 + (i - 2) * 0.17), y + math.sin((t - ti) * 4 + i) * 5, ease_back((t - ti) / 0.3), out)
    paste(layer, label(label_txt, 28), W / 2, y + 100, ease_back((t - t0 - 0.5) / 0.3), out)

def progress_line(layer, t, T):
    w = int(W * t / T); d = ImageDraw.Draw(layer); d.rectangle([0, 0, W, 8], fill=(0, 0, 0, 110)); d.rectangle([0, 0, w, 8], fill=WHT + (255,))
    d.ellipse([w - 9, -3, w + 9, 15], fill=WHT + (255,))

random.seed(7)
TW = [(random.random() * W, random.random() * H * 0.9, random.random() * 6.28, 12 + random.random() * 16) for _ in range(16)]
def twinkles(layer, t):
    for i, (x, y, ph, sz) in enumerate(TW):
        a = (math.sin(t * 1.6 + ph) + 1) / 2
        paste(layer, disc('spark', int(sz * 2), ring=False), (x + t * 6 * (1 + i % 3)) % W, y - (t * 9 * (1 + i % 2)) % (H * 0.9) + H * 0.9 * 0, 1, 0.18 + 0.4 * a)

def tag(layer, t, t0, t1, text, x, y, serif=False, size=30):
    if not (t0 <= t < t1 + 0.3): return
    out = clamp((t1 + 0.3 - t) / 0.3) if t >= t1 else 1.0
    paste(layer, label(text, size, WHT if serif else SIL), x, y, ease_back((t - t0) / 0.3), out)


# ---------- karaoke captions ----------
import json, re
WORDS = [dict(w=re.sub(r"[\.,;:!?]+$", "", x['w']), s=x['s'], e=x['e'], p=bool(re.search(r"[\.,;:!?]$", x['w']))) for x in json.load(open(WORDS_JSON)) if x['w'].strip()]
def build_blocks():
    blocks, cur = [], []
    for w in WORDS:
        if cur and (len(cur) >= 4 or w['s'] - cur[-1]['e'] > 0.55 or cur[-1]['p'] or sum(len(x['w']) for x in cur) + len(w['w']) > 24):
            blocks.append(cur); cur = []
        cur.append(w)
    if cur: blocks.append(cur)
    return blocks
BLOCKS = build_blocks()
PF = FD + 'Poppins-ExtraBold.ttf'
_wf = {}
def wfont(sz):
    if sz not in _wf: _wf[sz] = ImageFont.truetype(PF, sz)
    return _wf[sz]
_ws = {}
def word_sprite(txt, sz, active, dim=False):
    key = (txt, sz, active, dim)
    if key in _ws: return _ws[key]
    f = wfont(sz); wd = int(f.getlength(txt)); asc, desc = f.getmetrics(); pad = 26 if active else 10
    im = Image.new('RGBA', (wd + 2 * pad + 24, asc + desc + 2 * pad + 8), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    if active:
        d.rounded_rectangle([12, 12, im.width - 12, im.height - 4], 26, fill=(0, 0, 0, 90))  # soft drop
        d.rounded_rectangle([8, 6, im.width - 16, im.height - 12], 26, fill=WHT + (255,))
        d.text((pad + 4 - 4, pad + asc - 2), txt, font=f, fill=(14, 16, 20, 255), anchor='ls')
    else:
        d.text((pad, pad + asc), txt, font=f, fill=(255, 255, 255, 150 if dim else 255), anchor='ls', stroke_width=6, stroke_fill=(0, 0, 0, 170 if not dim else 90))
    _ws[key] = (im, wd + 2 * pad, asc + desc + 2 * pad); return _ws[key]

def karaoke(layer, t, cy):
    cur = None
    for i, b in enumerate(BLOCKS):
        end = b[-1]['e'] + 0.3
        if i + 1 < len(BLOCKS) and BLOCKS[i + 1][0]['s'] - b[-1]['e'] < 0.7: end = BLOCKS[i + 1][0]['s'] - 0.02
        if b[0]['s'] - 0.05 <= t < end: cur = b; break
    if not cur: return
    ai = max([i for i, w in enumerate(cur) if w['s'] - 0.03 <= t] or [0])
    aw = cur[ai]; k = ease_back((t - aw['s'] + 0.03) / 0.14, 2.6)
    act_sz = 70 + int(round(40 * clamp(k * 1.0) / 4)) * 4 if k <= 1 else 112
    sizes = [act_sz if i == ai else 62 for i in range(len(cur))]
    sps = [word_sprite(w['w'], sz, i == ai, dim=False) for i, (w, sz) in enumerate(zip(cur, sizes))]
    gap = 6; tot = sum(sp[1] for sp in sps) + gap * (len(sps) - 1)
    fit = min(1.0, 1000 / tot); x = W / 2 - tot * fit / 2
    for (im, wd, hg), sz in zip(sps, sizes):
        cx = x + wd * fit / 2
        sc = fit if fit != 1.0 else 1.0
        paste(layer, im, cx, cy, sc, 1.0)
        x += (wd + gap) * fit

def draw_frame(t, T):
    L = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    twinkles(L, t); progress_line(L, t, T)
    # intro: 0.6s ★ tag + 2.2 Suno Visuals
    tag(L, t, 0.3, 2.0, '★ BLACK STAR MEDIA', W / 2, 0.075 * H)
    pop_item(L, t, 2.15, 4.2, 'play', W * 0.5, 0.135 * H, 190, 'SUNO VISUALS', tilt=-12)
    burst(L, t, 2.15, W * 0.5, 0.135 * H)
    for (x, y, tt, rr) in ((0.09, 0.27, 2.3, 20), (0.91, 0.26, 2.45, -20), (0.14, 0.20, 2.6, 0), (0.86, 0.19, 2.7, 0)):
        sparkle(L, t, tt, W * x, H * y, 80, 1.2, rr)
    # mind blown
    burst(L, t, 5.45, W * 0.5, 0.2 * H, n=18, r0=80, r1=330, life=0.8, w=9)
    pop_item(L, t, 5.4, 7.0, 'bolt', W * 0.82, 0.14 * H, 190, 'MIND BLOWN', tilt=14)
    pop_item(L, t, 5.55, 7.0, 'spark', W * 0.17, 0.15 * H, 150)
    sparkle(L, t, 5.7, W * 0.88, 0.30 * H, 90, 1.0); sparkle(L, t, 5.85, W * 0.1, 0.30 * H, 70, 1.0)
    # understanding / concept
    for tt, x, y in ((7.65, 0.12, 0.2), (7.8, 0.88, 0.17), (8.0, 0.5, 0.1)): sparkle(L, t, tt, W * x, H * y, 90, 1.1)
    # pipeline: concept -> song -> lyrics -> music -> video
    pipeline(L, t, [(10.9, 'bulb', 'CONCEPT'), (13.15, 'note', 'SONG'), (14.9, 'pen', 'LYRICS'), (16.7, 'wave', 'MUSIC'), (18.7, 'video', 'VIDEO')], 21.2)
    burst(L, t, 10.95, W * 0.13, 0.115 * H, n=10, r0=50, r1=160, life=0.5, w=6)
    tag(L, t, 20.1, 22.0, '★  ALL ON ONE PLATFORM', W / 2, 0.215 * H, size=30)
    # incredible
    stars_row(L, t, 22.15, 25.0, 0.125 * H, 'INCREDIBLE'); burst(L, t, 22.2, W / 2, 0.125 * H, n=16, r0=120, r1=340, life=0.8)
    # video comes out great / viable
    sparkle(L, t, 25.3, W * 0.88, 0.2 * H, 100, 1.1); sparkle(L, t, 25.45, W * 0.1, 0.16 * H, 80, 1.1)
    pop_item(L, t, 27.6, 29.2, 'song' if False else 'note', W * 0.84, 0.15 * H, 160, 'THE SONG', tilt=10)
    pop_item(L, t, 30.9, 33.3, 'chart', W * 0.5, 0.13 * H, 190, 'COMMERCIALLY VIABLE', tilt=-8); burst(L, t, 30.95, W * 0.5, 0.13 * H)
    # money
    pop_item(L, t, 33.7, 36.2, 'coin', W * 0.82, 0.14 * H, 190, 'MAKE MONEY', tilt=15); burst(L, t, 33.75, W * 0.82, 0.14 * H, n=12, r0=60, r1=220)
    sparkle(L, t, 33.9, W * 0.15, 0.18 * H, 90, 1.1)
    # marketing
    pop_item(L, t, 36.5, 38.8, 'mega', W * 0.5, 0.115 * H, 190, None, tilt=-10); burst(L, t, 36.55, W * 0.5, 0.115 * H, n=16, r0=70, r1=280, life=0.7)
    pop_item(L, t, 36.7, 38.8, 'chart', W * 0.86, 0.17 * H, 150); pop_item(L, t, 36.8, 38.8, 'spark', W * 0.14, 0.17 * H, 130)
    # great tool
    sparkle(L, t, 39.3, W * 0.85, 0.15 * H, 100, 1.2); sparkle(L, t, 39.45, W * 0.13, 0.2 * H, 80, 1.2)
    # hobby / songwriter
    pop_item(L, t, 42.8, 45.0, 'mic', W * 0.2, 0.14 * H, 170, 'HOBBY', tilt=-10); pop_item(L, t, 43.35, 45.2, 'note', W * 0.8, 0.14 * H, 170, 'SONGWRITER', tilt=10)
    # try it + outro
    burst(L, t, 46.4, W * 0.5, 0.15 * H, n=20, r0=90, r1=360, life=0.9, w=10)
    pop_item(L, t, 46.4, T + 1, 'cursor', W * 0.5, 0.14 * H, 200, 'TRY IT', float_amp=10)
    tag(L, t, 46.9, T + 1, '★ BLACK STAR MEDIA', W / 2, 0.285 * H, serif=False)
    karaoke(L, t, H * (0.968 if 12.8 <= t < 20.6 else 0.80))
    return L

def main():
    pr = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', SRC], capture_output=True, text=True)
    T = float(pr.stdout.strip())
    dec = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', SRC, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE, bufsize=10 ** 8)
    enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-', '-i', SRC,
                            '-map', '0:v', '-map', '1:a?', '-c:v', 'libx264', '-crf', '18', '-preset', 'veryfast', '-pix_fmt', 'yuv420p',
                            '-c:a', 'copy', '-shortest', '-movflags', '+faststart', DST], stdin=subprocess.PIPE)
    n = 0; fb = W * H * 3
    while True:
        buf = dec.stdout.read(fb)
        if len(buf) < fb: break
        t = n / FPS
        base = Image.frombuffer('RGB', (W, H), buf, 'raw', 'RGB', 0, 1).convert('RGBA')
        base.alpha_composite(draw_frame(t, T))
        enc.stdin.write(base.convert('RGB').tobytes()); n += 1
        if n % 150 == 0: print(f'{t:.1f}s', flush=True)
    enc.stdin.close(); enc.wait(); print('Done', DST, n, 'frames')

if __name__ == '__main__':
    if len(sys.argv) > 5:  # stills
        for tt in sys.argv[5].split(','):
            tt = float(tt); r = subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(tt), '-i', SRC, '-frames:v', '1', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True).stdout
            b = Image.frombuffer('RGB', (W, H), r, 'raw', 'RGB', 0, 1).convert('RGBA'); b.alpha_composite(draw_frame(tt, 48.2)); b.convert('RGB').save(f'ov_{tt:.1f}.png')
    else:
        main()
