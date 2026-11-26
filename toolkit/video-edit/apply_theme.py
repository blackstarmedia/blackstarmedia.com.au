#!/usr/bin/env python3
"""Recolour Adam Gan's claude-reel-effects (scripts/fx.py) to the Black Star Media palette.

usage: apply_theme.py path/to/claude-reel-effects/scripts/fx.py
Silver #CBD0D8 / #E8EBEF replace the yellow, gold, orange and green accents, and checklist
ticks become dark on a light circle. Safe to run twice. Does NOT grade the footage.
"""
import sys
p = sys.argv[1]; s = open(p).read()
R = [
 ("fill=((255, 226, 122) if w['k'] else (255, 255, 255))", "fill=((232, 235, 239) if w['k'] else (255, 255, 255))"),
 ("GREEN, BLUE, PURPLE, ORANGE, RED = (34, 197, 94), (10, 132, 255), (124, 92, 255), (217, 119, 87), (238, 34, 34)",
  "GREEN, BLUE, PURPLE, ORANGE, RED = (232, 235, 239), (10, 132, 255), (124, 92, 255), (203, 208, 216), (238, 34, 34)"),
 ("fill=(52, 199, 89, 255)); tick(d, x - rr * 0.5, y - rr * 0.45, rr, w=int(5 * u))",
  "fill=(232, 235, 239, 255)); tick(d, x - rr * 0.5, y - rr * 0.45, rr, color=(14, 16, 20, 255), w=int(5 * u))"),
 ("fc, mc = (255, 255, 255, 255), (52, 199, 89, 255)", "fc, mc = (255, 255, 255, 255), (203, 208, 216, 255)"),
 ("a0 + 100, fill=(217, 119, 87, 255), width=int(5 * u))", "a0 + 100, fill=(203, 208, 216, 255), width=int(5 * u))"),
 ("fill=(217, 119, 87, 255), width=int(7 * u)", "fill=(232, 235, 239, 255), width=int(7 * u)"),
]
n = 0
for a, b in R:
    if a in s: s = s.replace(a, b); n += 1
open(p, 'w').write(s); print(f'applied {n} of {len(R)} replacements (0 = already themed or fx.py changed upstream)')
