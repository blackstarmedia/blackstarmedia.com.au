# Episode 1 — OpenArt Image Prompts

**Model:** `nano-banana-pro`, mode `image2image` (multi-subject consistency, up to 5 people, blends up to 14 references — enough to hold all 4 flatmates plus Glenn in one frame). Fall back to `nano-banana-2-lite` / `text2image` for wide establishing shots with no named character in frame.
**Reference chain:** every shot's `params.referenceImages` = the hosted URLs of the character reference sheets (`01-character-bible.md`) for every character appearing in that shot, so faces/outfits/palettes stay locked across all 55 shots.
**Project:** OpenArt project `Sharehouse.AI`.

### Global style prefix
*(prepend to every shot prompt below)*

> Flat 2D animation still frame, clean bold black linework, minimal shading, flat cel color fills, coloring-book-clean line quality, warm slightly desaturated share-house sitcom palette, soft even lighting, 16:9 widescreen animation frame, character faces and outfits must exactly match the supplied reference images.

### Per-shot prompts

| Shot | OpenArt prompt (append to global prefix) |
|---|---|
| 1.1 | Wide establishing shot of a cramped, lived-in share-house kitchen: mismatched mugs on open shelving, a physical chore wheel pinned to the wall, a cylindrical white smart speaker with two slightly mismatched googly eyes ("Glenn") on the counter, morning light through a small window. No characters in frame. |
| 1.2 | Medium shot, Kai (reference: Kai sheet) at the kitchen bench, hunched over a cereal box eating straight from it one-handed, phone in his other hand, thumb mid-scroll, focused expression. |
| 1.3 | Extreme close-up, smartphone screen held at an angle (over-the-shoulder framing), messaging app UI with a glowing AI-assistant icon mid-"thinking" animation, soft blue glow. |
| 1.4 | Close-up on Kai's face (reference: Kai sheet), eyes wide, mouth open in comic betrayal, eyebrows shot up. |
| 1.5 | Medium shot, Kai's shoulders slumped, resigned nod toward his phone, deflated posture. |
| 1.6 | Wide shot, kitchen doorway: Marcus (reference: Marcus sheet) entering mid-stride, one AirPod visible, silver laptop tucked under one arm, protein shake bottle in the other hand, confident walk. |
| 1.7 | Medium two-shot, Marcus and Kai facing each other across the kitchen bench, Marcus's eyebrow raised knowingly. |
| 1.8 | Medium shot, Kai shrugging defensively, one hand up. |
| 1.9 | Medium shot, Marcus sipping his shake with total nonchalance, matter-of-fact expression. |
| 1.10 | Wide shot, kitchen doorway: Priya (reference: Priya sheet) entering, hair disheveled and voluminous, small charcoal smudge on one cheek, sketchbook tucked under her arm, tired but pointed expression. |
| 1.11 | Medium shot, Priya mid-gesture with her pencil-holding hand, making a point, tired-but-sharp expression. |
| 1.12 | Close-up insert, hand (Priya's) lifting a white mug with a red heart printed on it off an open shelf. |
| 1.13 | Medium shot, Dave (reference: Dave sheet) frozen in the doorway with his head only halfway through his sweater's neck hole, comic horror expression, sweater bunched around his face. |
| 1.14 | Medium two-shot, Priya (mug in hand, arms crossed) facing Dave (now fully in his sweater, hand extended toward the mug), deadpan standoff. |
| 1.15 | Close-up insert, smartphone screen, a notification banner sliding in with a small chime-burst graphic. |
| 1.16 | Close-up, Kai's face lit up with delight, big open grin, eyes on his phone. |
| 1.17 | Medium shot, Marcus not even looking up from his shake, deadpan smug half-smile. |
| 1.18 | Wide group shot, all four flatmates in the kitchen, Dave mid-gesture addressing the room, exasperated open-armed pose. |
| 1.19 | Medium two-shot, Priya and Dave in a rapid deadpan back-and-forth, both slightly leaning toward each other. |
| 1.20 | Close-up insert, smartphone screen, a brighter more polished/corporate notification card animating in (visually distinct color scheme from shot 1.15). |
| 1.21 | Close-up, phone screen showing a glowing "Confidence Coach — LIVE" UI card with a waveform icon. |
| 1.22 | Close-up, Kai's face, awestruck, phone held up reverently in both hands like a sacred object. |
| 1.23 | Medium shot, Marcus sitting up sharply on a kitchen stool, intrigued and alert, one finger raised mid-question. |
| 1.24 | Medium shot, Dave stepping forward, pointing accusingly, real alarm under a comic scowl. |
| 1.25 | Close two-shot, Kai completely unbothered/relaxed next to a scandalized Dave. |
| 1.26 | Full-frame graphic: frozen kitchen tableau of all four characters, with a bold animated title-card treatment reading "SHAREHOUSE.AI" wiping across the frame, flat sitcom color palette. |
| 2.1 | Wide shot, living room: Kai standing centre-frame in his best hoodie, one wireless earpiece glowing faintly, arms out in a "mic check" stance; Marcus (holding a clipboard), Priya, and Dave arranged around him like a pit crew. |
| 2.2 | Medium shot, Marcus holding a clipboard with exaggerated seriousness, addressing the room. |
| 2.3 | Medium shot, Dave, arms crossed, flat refusal expression. |
| 2.4 | Medium shot, Priya mid-hair-flip, snapping into a playful "date" character, then breaking character with a raised eyebrow. |
| 2.5 | Close-up, Kai's face, sudden panic, mouth half-open, whispering urgently. |
| 2.6 | Close-up insert, earpiece glowing with a pulsing waveform graphic. |
| 2.7 | Close-up, Kai blurting a line, immediately visibly regretting it, wincing. |
| 2.8 | Medium shot, Priya, deadpan horror, hand half-raised as if reaching for an off switch. |
| 2.9 | Medium shot, Dave leaning in without meaning to, fully hooked, curious expression. |
| 2.10 | Medium two-shot, Kai and Dave both leaning back at the exact same odd angle, matching deadpan expressions — visual sight gag. |
| 2.11 | Wide shot, the whole room staring at Kai and Dave leaning back in unison, Priya and Marcus's reaction faces. |
| 2.12 | Medium shot, Marcus scribbling excitedly on his own phone, delighted grin. |
| 2.13 | Close-up insert, Glenn the smart speaker on a side table, googly eyes wobbling mid-chirp, small sound-wave graphic. |
| 2.14 | Wide shot, all four flatmates turned to stare flatly at Glenn in unison. |
| 2.15 | Medium shot, Dave pointing at Glenn, done with everything, weary expression. |
| 3.1 | Wide shot, warm-lit restaurant table, Kai seated across from an empty/silhouetted chair (date never shown on camera), earpiece glowing faintly, restaurant ambience in the background. |
| 3.2 | Medium shot, Kai mid-listen, half-second delay before answering, slightly glazed focused expression. |
| 3.3 | Wide shot, living room, Marcus, Priya, and Dave crowded on the couch around an open laptop showing a small live video-call window, popcorn bowl between them. |
| 3.4 | Medium shot, Priya pointing at the laptop screen, amused/exasperated. |
| 3.5 | Medium shot, Marcus pointing analytically at the laptop screen, professional focus. |
| 3.6 | Close-up, Dave leaning toward the laptop, quietly moved, soft unguarded expression. |
| 3.7 | Close-up, Kai at the restaurant table, earpiece glowing brighter, listening intently. |
| 3.8 | Medium shot, Kai mid-bite, panicked wide eyes, talking with his mouth full. |
| 3.9 | Wide shot, restaurant table from Kai's POV, warm out-of-focus ambience, empty chair across (date implied, never shown). |
| 3.10 | Wide shot, living room, Priya and Marcus slowly turning in unison to look at Dave, dead silence beat. |
| 3.11 | Close-up, Dave, hand to chest, hoarse wounded expression. |
| 3.12 | Insert, laptop screen showing tiny video-call window of Kai talking, small speaker-icon sound waves. |
| 3.13 | Medium shot, Priya leaning toward Dave, savoring the moment with a wicked grin. |
| 3.14 | Wide shot, Dave rising from the couch, heart mug somehow still in hand, wounded-on-principle expression. |
| 3.15 | Medium shot, Dave mid-stride walking determinedly toward a door. |
| 3.16 | Close-up insert, back pocket of Dave's trousers, phone glowing and chiming, small notification graphic. |
| 3.17 | Close-up, phone screen, a calm pastel-colored notification card with two button options. |
| 3.18 | Close-up, Dave's face, frozen mid-stride, all the fight visibly draining out of his expression. |
| 3.19 | Close-up, Dave, quiet and defeated, shoulders dropped. |
| 3.20 | Wide shot, Dave walking out of frame through a doorway, single warm spotlight on him, exaggerated tragic-dignity posture, small musical-note graphic. |
| 3.21 | Medium two-shot, Marcus and Priya on the couch watching the doorway, Marcus intrigued, Priya unimpressed. |
| T.1 | Wide shot, dark kitchen at night, Kai entering through the doorway, grinning, zipping up his hoodie. |
| T.2 | Medium shot, Kai at the open fridge, fridge light illuminating his face from below/front, Glenn visible glowing faintly on the dark counter. |
| T.3 | Close-up, Kai's face, genuine unguarded happiness, warm fridge light. |
| T.4 | Close-up insert, Kai's hand reaching toward the heart mug on the shelf. |
| T.5 | Close-up, Kai's face, a beat of guilt as he looks at the mug. |
| T.6 | Close-up insert, hand placing the heart mug back and picking up a plain different mug instead. |
| T.7 | Wide freeze-frame, Kai mid-reach for the other mug, warm kitchen-at-night lighting, with title-card text overlay treatment reading "We didn't need it. It just made the awkward bit easier." |

### Character reference sheets (generate first, before any shot above)
1. Kai reference sheet — prompt in `01-character-bible.md`, model `nano-banana-pro` `text2image`.
2. Marcus reference sheet — same.
3. Priya reference sheet — same.
4. Dave reference sheet — same.
Each generation's resulting hosted image URL becomes that character's `referenceImages` entry for every shot above featuring them.
