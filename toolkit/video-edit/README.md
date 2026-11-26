# Video edit toolkit (talking-head footage)

Used by **Module I: Video edit** of the YouTube workflow skill (`yt-content-engine`).
Turns a raw talking-head clip into a 1080x1920 draft: punch-in zooms, themed icons and vector graphics, and karaoke captions.
Footage colours are never graded.

## One-time setup
```
git clone https://github.com/adamgodigital/claude-reel-effects ~/claude-reel-effects
cd ~/claude-reel-effects && bash scripts/setup.sh        # needs ffmpeg; prints READY
```

## Every clip
```
python toolkit/video-edit/edit_video.py my_clip.mov --skill ~/claude-reel-effects
```
It themes the skill, trims pauses, transcribes, picks zooms and icons from the spoken words, renders, and prints the draft path.
Open `<workdir>/<name>_trim.words.json`, fix any misheard words, then re-render without re-transcribing:
```
python toolkit/video-edit/edit_video.py my_clip.mov --skill ~/claude-reel-effects --fix-words
```
Needs `pip install pillow numpy` for the python you run it with, plus ffmpeg.

## Files
- `edit_video.py` - the one-command runner.
- `triggers.py` - spoken word -> icon/label map (bulb, note, pen, waveform, video, play, coin, megaphone, chart, bolt, mic, layers, cursor, heart, star row). Add words here to add icons.
- `make_plan.py` - writes the punch-in zoom plan (about one per 4-6 s, 1.25-1.35x).
- `overlay.py` - icons, burst rings, sparkles, progress line, labels and karaoke captions (Pillow, per frame, audio copied).
- `apply_theme.py` - recolours the skill's `fx.py` to the Black Star palette. Safe to run twice.
- `example_effects_plan.json` - a hand-written plan from the first clip (zooms, pop-word, checklist) for reference.

## Rules that worked
- Zoom 1.25-1.35 max, never during a pop-word, never so far that the head reaches the icons (top 20% of the frame).
- Graphics stay in the top third; captions at 80% of height (96.8% if you add a checklist card).
- Palette: `#000000`, `#FFFFFF`, `#CBD0D8`, `#E8EBEF`, surface `#16181C`, muted `#71767B`. Labels in Space Mono Bold; the star is drawn as a vector (the font has no star glyph).
- Landscape clips run but are not tuned for it. Captions come from the automatic transcript: check them, and watch the whole video before posting.

Credit: base effects by Adam Gan (adamgodigital/claude-reel-effects).
