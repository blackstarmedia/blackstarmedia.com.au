# Video edit toolkit (talking-head footage)

Used by the **Module I: Video edit** step of the YouTube workflow skill (`yt-content-engine`).
Produces a 1080x1920 draft with punch-in zooms, themed icons and vector graphics, and karaoke captions.
Footage colours are never graded.

## Files
- `overlay.py` - icon discs, burst rings, sparkles, progress line, labels and karaoke captions, composited per frame with Pillow and piped through ffmpeg (audio copied).
- `apply_theme.py` - recolours Adam Gan's `fx.py` to the Black Star palette (silver/white, no yellow/orange/green).
- `example_effects_plan.json` - the zoom / pop-word / checklist plan used on the first clip.

## Run
1. `git clone https://github.com/adamgodigital/claude-reel-effects` into a clean folder, then `bash scripts/setup.sh` (needs ffmpeg).
2. `python apply_theme.py claude-reel-effects/scripts/fx.py`
3. Trim, transcribe, render the base (no skill captions):
   ```
   .venv/bin/python scripts/trim.py clip.mov clip_trim.mp4
   WHISPER_MODEL=base .venv/bin/python scripts/words.py clip_trim.mp4     # fix misheard words in clip_trim.words.json
   .venv/bin/python scripts/fx.py --plan plan.json clip_trim.mp4 base.mp4
   ```
4. Edit the event times and icons in `draw_frame()` of `overlay.py` to match `clip_trim.words.json` (they are written for the Suno Visuals clip), then:
   ```
   python overlay.py base.mp4 out.mp4 clip_trim.words.json claude-reel-effects/fonts
   python overlay.py base.mp4 out.mp4 clip_trim.words.json claude-reel-effects/fonts 3.0,12.5   # stills to check first
   ```
   Needs `pip install pillow numpy` and ffmpeg.

## Rules that worked
- Zoom 1.25-1.35 max, about one per 4-6 s, never during a pop-word, and never so far that the head reaches the icons (top 20% of the frame).
- Graphics stay in the top third; captions at 80% of height (96.8% while a checklist card shows).
- Palette: `#000000`, `#FFFFFF`, `#CBD0D8`, `#E8EBEF`, surface `#16181C`, muted `#71767B`. Labels in Space Mono Bold; the star is drawn as a vector because that font has no star glyph.
- Captions come from the automatic transcript. Check for misheard words and watch the full video before posting.

Credit: base effects by Adam Gan (adamgodigital/claude-reel-effects).
