# SHAREHOUSE.AI — Show Bible

**Format:** 2D animated comedy series, Season 1 = 5 episodes x 6 minutes.
**Tone:** Intelligent, fast, witty satire — mockumentary-adjacent, occasional direct-to-camera asides. Think *Big Mouth*-pace dialogue with a *Portlandia* target: not "AI is evil," but "AI is a slightly-better-than-us shortcut for things we were always too lazy or too awkward to do ourselves — and that's the joke."
**Premise:** Four flatmates from wildly different life stages and backgrounds share a too-expensive apartment purely to survive the cost of living. None of them agree on anything except rent is due on the 1st. Every episode, one facet of daily life gets quietly outsourced to an AI — and it works *just* well enough to be dangerous.
**Thesis line (says it out loud in the finale):** "We never needed it. We just like it better when the awkward part isn't our fault."

## Visual style
Clean flat-cel 2D animation built on confident linework — same DNA as a coloring-book character turnaround: bold outlines, minimal cross-hatching, big readable silhouettes, expressive faces held on 2s for comedy timing. Backgrounds slightly looser/painterly than character line art so characters pop. Color palette per character (see character bible) stays consistent across all episodes for at-a-glance recognition even in a busy group shot.

## Setting
**The Sharehouse** — a slightly-too-small 3-bedroom apartment with a 4th "bedroom" that used to be a home office (Priya's room, has no closet, everyone brings it up). Recurring locations: Kitchen (kitchen bench = the show's real stage), Living Room (the couch, communal laptop, chore wheel nobody follows), Kai's room, Priya's room, the hallway bathroom (one bathroom, four adults, constant background tension), the building's shared laundry.

## Recurring props / bits
- **GLENN** — a smart speaker with googly eyes stuck on it, unofficial 5th flatmate, deadpan Greek-chorus AI voice that narrates the house's data (power usage, "fun facts," passive judgment). Never resolved who bought Glenn. Nobody will admit to owning Glenn.
- **The heart mug** — Dave's mug. A running territorial dispute. Pays off in the Ep1 tag.
- **The chore wheel** — physical, ignored, eventually replaced by an app in Ep5 with escalating consequences.
- **"As a general concept"** — Kai's verbal tic once an AI is coaching his phrasing; recurs across episodes as shorthand for "the algorithm is talking, not him."

## Characters
See `01-character-bible.md` for full character sheets and OpenArt reference-sheet prompts.

## Season 1 episode themes
See `02-season-themes.md`.

## Production pipeline (this project)
1. **Themes** → season arc, one AI-in-daily-life facet per episode.
2. **Script** → full dialogue + action script per episode.
3. **Storyboard** → shot-by-shot breakdown generated from the script (framing, action, dialogue, timing).
4. **Image prompts** → one OpenArt prompt per storyboard shot, built off the character reference sheets for visual consistency.
5. **Audio prompts** → voice direction per character line, SFX cue list, and live-audience-laughter cue placed at every punchline beat.
6. **Generation** → character sheets and hero shots pushed into OpenArt (project: "Sharehouse.AI"); subsequent shots chain off the character sheet's hosted image as the image2image reference to keep faces/outfits/colors locked across the episode.

## Repo layout
```
ai-comedy-series/
  00-show-bible.md
  01-character-bible.md
  02-season-themes.md
  episode-01-the-algorithm-made-me-do-it/
    script.md
    storyboard.md
    image-prompts.md
    audio-prompts.md
  reference/            (source Grok reference images, as supplied)
```
