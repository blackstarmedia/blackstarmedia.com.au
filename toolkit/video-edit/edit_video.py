#!/usr/bin/env python3
"""One command: raw talking-head clip -> Black Star Media draft (zooms, icons, karaoke captions).

usage: python edit_video.py clip.mov --skill /path/to/claude-reel-effects [--out draft.mp4] [--workdir DIR] [--fix-words]

First run: it themes the skill's fx.py, trims pauses, transcribes, writes a zoom plan and renders.
Run with --fix-words after editing <workdir>/<name>_trim.words.json (misheard names) to re-render without re-transcribing.
Footage colours are never graded. Needs ffmpeg, the skill's .venv (bash scripts/setup.sh in the skill folder) and Pillow.
"""
import argparse, json, os, shutil, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
ap = argparse.ArgumentParser(); ap.add_argument('clip'); ap.add_argument('--skill', required=True); ap.add_argument('--out'); ap.add_argument('--workdir')
ap.add_argument('--fix-words', action='store_true'); a = ap.parse_args()
skill = os.path.abspath(a.skill); py = os.path.join(skill, '.venv', 'bin', 'python')
if not os.path.exists(py): sys.exit(f'Skill not set up: run `bash scripts/setup.sh` inside {skill} first.')
name = os.path.splitext(os.path.basename(a.clip))[0]
wd = os.path.abspath(a.workdir or f'{name}_edit'); os.makedirs(wd, exist_ok=True)
def run(cmd, **kw): print('>', ' '.join(map(str, cmd))[:160], flush=True); return subprocess.run(cmd, check=True, **kw)
trim, words, plan, base = (os.path.join(wd, f'{name}_trim.mp4'), os.path.join(wd, f'{name}_trim.words.json'), os.path.join(wd, 'plan.json'), os.path.join(wd, 'base.mp4'))
out = a.out or os.path.join(wd, f'{name}_draft.mp4')
run([sys.executable, '-I', os.path.join(HERE, 'apply_theme.py'), os.path.join(skill, 'scripts', 'fx.py')])
if not a.fix_words:
    run([py, os.path.join(skill, 'scripts', 'trim.py'), a.clip, trim])
    run([py, os.path.join(skill, 'scripts', 'words.py'), trim], env={**os.environ, 'WHISPER_MODEL': os.environ.get('WHISPER_MODEL', 'base')})
T = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', trim], capture_output=True, text=True).stdout)
run([sys.executable, os.path.join(HERE, 'make_plan.py'), words, plan, str(T)])
run([py, os.path.join(skill, 'scripts', 'fx.py'), '--plan', plan, trim, base])
run([py, os.path.join(HERE, 'overlay.py'), base, out, words, os.path.join(skill, 'fonts')])
print(f'\nDRAFT: {out}\nWords file (fix misheard words, then rerun with --fix-words): {words}')
