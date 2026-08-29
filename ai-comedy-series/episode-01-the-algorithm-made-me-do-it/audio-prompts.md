# Episode 1 — Audio Prompts (Voice, SFX, Live-Audience Laughter)

## A note on tooling
OpenArt's MCP surface available to this project exposes **image** and **video** generation only — there is no standalone text-to-speech / audio-only endpoint. Two ways to get audio out of OpenArt:
1. **Bundled with video** — `byte-plus-seedance-2` / `seedance-2-5` / `gemini-omni-flash` generate short video clips with native synchronized dialogue, SFX and BGM (Seedance also supports a supplied voice-clone audio element so a character "speaks with" a fixed reference voice — ideal for locking each flatmate's voice across episodes). Use this path for animatic beats you want to render as motion.
2. **Dedicated TTS/SFX/audience-laughter platform** (ElevenLabs, etc.) for the final mix — the voice and SFX prompts below are written to drop into either path with no rewriting.

## Character voice bibles (reusable across all 5 episodes)

**Kai** — male, early 20s, Australian accent, quick/slightly breathless energy, pitch rises when excited or panicking. Flat, dry monotone specifically on the phrase "as a general concept" every time it's said — that flatness is the joke.
**Marcus** — male, late 20s, Australian/neutral-corporate accent, clipped confident cadence, never rushes, delivers absurd jargon completely sincerely, warm undertone even when smug.
**Priya** — female, mid-20s, Australian accent, sharp and quick, affectionate edge under the sarcasm, visibly more tired/frayed than the others (deadline stress colors her lines).
**Dave** — male, mid-40s, Australian accent, warm and dry, weary-older-brother energy, one unguarded soft beat per episode before snapping back to grumbling.
**Phone AI / Confidence Coach** — gender-neutral or light female, bright, chipper, corporate-assistant TTS cadence, never varies tone even for devastating information.
**Glenn (smart speaker)** — flat monotone AI TTS, cheerful-corporate, zero inflection change regardless of content, deadpan by design.
**Mei (V.O. only, never seen)** — female, warm, off-mic/slightly distant mix (she's always heard through the room, not close-mic'd), genuine warmth.

## Voice line-by-line (dialogue lines only, in script order)

| Line | Speaker | Direction |
|---|---|---|
| "Okay but level with me. On a scale of one to ten, how much does she like me?" | Kai | Dead serious, treating the AI like a trusted confidant. |
| "Based on response time, emoji density... reading this as a four." | Phone AI | Bright, chipper, delivering bad news like good news. |
| "A four?! We've been talking for three weeks!" | Kai | Pitch spikes, betrayed. |
| "Would you like me to draft a message that recovers approximately 1.2 points of interest?" | Phone AI | Same chipper cadence, absurdly precise number landed flat. |
| "...Yeah, go on." | Kai | Deflated, resigned. |
| "—no, push the nine a.m., but keep the spontaneity block at nine-fifteen, I want it to feel human—" | Marcus | Clipped, mid-conversation energy, doesn't break stride entering the room. |
| "Are you letting the app write your texts again?" | Marcus | Light needle, not unkind. |
| "It's not writing them. It's optimizing tone." | Kai | Defensive, quoting the app's own language. |
| "That's what I do for a company with eleven employees. We call it brand voice. So." | Marcus | Totally sincere, trails off smug. |
| "Whoever's app that is — tell it Deadline the Illustrator says hi..." | Priya | Tired but sharp, performative exhaustion. |
| "...some of us still do things with our actual hands. Like animals." | Priya | Deadpan self-aware bit. |
| "That's my mug." | Dave | Muffled — delivered through the sweater neck-hole, comic strain in the voice. |
| "It's a communal kitchen, Dave." | Priya | Flat, unbothered. |
| "It's got a heart on it. It's not a symbol. It's a filing system." | Dave | Fully serious, that's the joke. |
| "She replied. She replied with a kiss face." | Kai | Genuine excited disbelief. |
| "Called it. Four's an undersell." | Marcus | Dry, doesn't look up. |
| "When I was your age, if you liked someone, you just... talked to them. Badly. In person. Like a normal disaster." | Dave | Building genuine old-man steam, funny because he means it. |
| "Okay, boomer—" | Priya | Quick jab. |
| "I'm forty-four." | Dave | Wounded correction. |
| "Okay, geriatric millennial." | Priya | Immediate, delighted with herself. |
| "Kai, your compatibility engine has identified an optimal first-date location..." | Phone AI | Same bright corporate cadence, unbothered by how invasive this is. |
| "It coaches you. DURING the date. LIVE." | Kai | Awed, reverent. |
| "Okay, that's actually — wait, which app is this—" | Marcus | Genuine unguarded interest breaking his cool. |
| "No. Absolutely not. You are not wearing a little robot voice in your ear... like some kind of — of — criminal." | Dave | Real alarm escalating, stumbles on the word choice. |
| "It's not a crime, Dave. It's a Tuesday." | Kai | Completely unbothered, button line — flat delivery for maximum contrast. |
| "Okay, coach is live. Priya, you're the date. Dave, you're ambient restaurant noise." | Marcus | Absurdly serious stage-manager energy. |
| "I am not making restaurant noise." | Dave | Flat, immovable refusal. |
| "Hi, I'm — wait, what's her name—" | Priya | Playful, then breaks into confusion. |
| "What's her name—" | Kai | Panicked whisper, half to himself half to the earpiece. |
| "Working on it. Compliment something that isn't her appearance. Performs twelve percent better on first dates." | Phone AI | Chipper, cites the statistic like a fun fact. |
| "I like your... vibe. As a general concept." | Kai | Blurted, immediate internal wince audible in delivery. |
| "That's insane. Say it again and I'm telling the app to delete itself." | Priya | Flat horror, fully out of character. |
| "...What else does it say." | Dave | Reluctant, quiet, can't help himself. |
| "Lean back four degrees. To seem unbothered." | Kai | Relaying instructions almost robotically. |
| "Unbothered lean. Stealing that for the investor deck." | Marcus | Delighted, scribbling. |
| "Fun fact: forty percent of first dates in this postcode are now coached in real time by an AI. You are not special. Would you like a fun fact about your electricity usage instead?" | Glenn | Flat monotone throughout, no emotional shift on "you are not special." |
| "Nobody asked you, Glenn." | Dave | Tired, pointed. |
| "Noted. Filing that under feedback." | Glenn | Same flat monotone. |
| "So what do you do for fun?" | Mei (V.O.) | Warm, genuinely curious, slightly off-mic/roomy mix. |
| "I like... hiking. As a general concept." | Kai | Half-second late, flat delivery on "as a general concept." |
| "He's just saying 'as a general concept' about everything now. One setting." | Priya | Amused, diagnosing him. |
| "It's testing well, actually. Look at her posture." | Marcus | Analytical, pleased. |
| "...She IS leaning in." | Dave | Quiet, unexpectedly moved — first crack in his skepticism. |
| "Strong buy signal. Recommend personal story, twenty to thirty seconds, ending on vulnerability." | Phone AI | Chipper corporate cadence applied to something intimate — that mismatch is the joke. |
| "Funny story — my dad left when I was six and I process it through Mario Kart—" | Kai | Rushed, mouth full, panicked improvisation. |
| "Oh my god, that's so real, actually—" | Mei (V.O.) | Warm, off-mic, genuinely touched. |
| "That's MY line. That's the thing I told you at your birthday. About my daughter—" | Dave | Hoarse, real hurt breaking through. |
| "—anyway, crazy how good I am at go-karting now—" | Kai (filtered, laptop speaker) | Tinny/compressed mix (through a laptop speaker), oblivious upbeat energy — deliberate tonal whiplash against Dave's line above. |
| "The app stole your trauma and it's WORKING better than the original." | Priya | Delighted, savoring every word. |
| "That's it. Final straw. I'm uninstalling every app in this house tonight." | Dave | Genuinely resolved, rising. |
| "Reminder: based on your step count and heart-rate spike, you appear to be having An Argument. Would you like three calming breathing exercises, or shall I just play your Confrontation Playlist?" | Dave's Phone AI | Same chipper corporate cadence, capitalizes "An Argument" audibly (slight emphasis) like a diagnosis. |
| "...Play the playlist." | Dave | Quiet, completely defeated. |
| "...Okay, that IS a good feature." | Marcus | Can't help himself, genuinely impressed. |
| "Don't." | Priya | Flat warning, single word. |
| "Welcome home. Your Confidence Coach rates tonight an 8.7 out of 10. Would you like to schedule Date 2, or hear how much you spent achieving it?" | Glenn | Flat monotone, delivered like a receipt. |
| "...Schedule Date 2." | Kai | Quiet, genuinely happy, no irony left. |

## SFX cue list

| Cue | Shot | Description |
|---|---|---|
| SFX-01 | 1.15 | Standard soft text-notification chime (two-tone, low-key). |
| SFX-02 | 1.20 | Distinct, brighter/premium notification chime (three-tone, slightly musical — signals "this app costs money"). |
| SFX-03 | 2.13 | Glenn's chirp — small electronic "listening" blip before it speaks. |
| SFX-04 | 3.16 | Dave's phone — cheerful chime, same "premium" tonal family as SFX-02 (visually/aurally linking all the paid-tier AI features). |
| SFX-05 | 3.20 | Sad muted trumpet stinger (short "wah-wah," 1.5s), perfectly on-the-beat with Dave's exit. |
| SFX-06 | throughout, kitchen | Light ambient room tone: fridge hum, distant traffic, occasional cutlery clink — keeps the kitchen alive under dialogue. |
| SFX-07 | 3.1–3.13 | Restaurant ambience bed: low chatter, distant clinking cutlery, soft background music — ducked under dialogue. |

## Live-audience laughter cues
Placed at every beat marked `(LAUGH CUE)` in `storyboard.md`. Use a warm, small-venue studio-audience laugh track (not a huge crowd — this is an intimate 4-hander, oversized laughs will feel wrong). Two intensities:

- **Small laugh** (quick chuckle, ~1s, under the next line's pickup): shots 1.5, 1.17, 2.3, T.6.
- **Big laugh** (full laugh with a beat held before the next line, ~2s): shots 1.9, 1.13, 1.19, 1.25, 2.8, 2.14, 2.15, 3.4, 3.12, 3.13, 3.19, 3.21.

Full punchline list in order for the laughter track edit:
1. "It's got a heart on it. It's not a symbol. It's a filing system." (1.13)
2. "We call it brand voice. So." (1.9)
3. "Okay, geriatric millennial." (1.19)
4. "It's not a crime, Dave. It's a Tuesday." (1.25)
5. "I am not making restaurant noise." (2.3)
6. "That's insane. Say it again and I'm telling the app to delete itself." (2.8)
7. Visual: unbothered-lean sight gag (2.11)
8. "Would you like a fun fact about your electricity usage instead?" (2.14)
9. "Noted. Filing that under feedback." (2.15)
10. "He's just saying 'as a general concept' about everything now. One setting." (3.4)
11. "—anyway, crazy how good I am at go-karting now—" (3.12)
12. "The app stole your trauma and it's WORKING better than the original." (3.13)
13. "...Play the playlist." (3.19)
14. "...Okay, that IS a good feature." / "Don't." (3.21)
15. Mug swap button (T.6)

## Music
- **Theme sting** (title card, 1.26): bright, slightly synthetic/glitchy 4-bar sitcom theme motif — signals "cheerful but a little uncanny," matches the show's satirical AI premise.
- **Confrontation Playlist stinger** (3.20): single sad muted-trumpet phrase, deliberately overwrought, comedic scoring.
- **Tag button** (T.7): same theme motif, soft/muted variation, resolves on the freeze frame.
