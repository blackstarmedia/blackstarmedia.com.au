#!/usr/bin/env python3
"""Write an effects plan for fx.py: a quick punch-in on each trigger word. usage: make_plan.py words.json plan.json duration"""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from triggers import events, clean
words = json.load(open(sys.argv[1])); T = float(sys.argv[3]); out = []; last = -9
for e in events(words, T):
    if e['t0'] - last < 3.5 or e['t0'] > T - 1.2: continue
    z = 1.35 if e['icon'] in ('bolt', 'star') else 1.25
    out.append({'fx': 'lean-in', 'start': round(e['t0'] - 0.05, 2), 'end': round(e['t0'] + 0.95, 2), 'zoom': z}); last = e['t0']
json.dump({'effects': out}, open(sys.argv[2], 'w'), indent=1); print(f'{len(out)} zooms -> {sys.argv[2]}')
