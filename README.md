# Black Star Media &amp; Entertainment

Flagship website for Black Star Media &amp; Entertainment.
Single-page, Apple-inspired dark cinematic design. Pure static HTML/CSS/JS,
**no build step**, deploys directly to GitHub Pages.

---

## Tech approach

| Decision | Choice | Why |
|---|---|---|
| Framework | None (vanilla HTML/CSS/JS) | Zero build, instant load, perfect for GitHub Pages with no Node.js installed |
| Styling | Hand-authored CSS + custom properties | Brand tokens in `:root`; Apple polish from typography + spacing, not a framework |
| Motion | IntersectionObserver scroll reveals + a light canvas starfield | "Tasteful &amp; subtle", respects `prefers-reduced-motion` |
| Fonts | Google Fonts — Playfair Display, DM Sans, Space Mono | Editorial display + clean body + mono labels |
| Hosting | GitHub Pages + custom domain via `CNAME` | Free, fast, static |

> Want server-rendered dynamic venture/music pages later? This can migrate to a
> Next.js static export. For now the single page covers every launch goal
> (AdSense, YouTube/Spotify embeds, traffic landing hub).

---

## Project structure

```
.
├── index.html            # Home — all sections
├── profile.html          # Company profile page
├── pipeline.html         # The Pipeline — six-stage production process page
├── journal.html          # Journal — Suno/AI music commentary
├── suno-poster.html      # Email-gated PDF landing page
├── privacy.html          # Privacy Policy
├── terms.html            # Terms of Use
├── CNAME                 # Custom domain for GitHub Pages
├── .nojekyll             # Tell GitHub Pages to serve files as-is (no Jekyll)
├── robots.txt
├── sitemap.xml
├── scripts/
│   ├── update_latest_videos.py   # Refresh latest-videos.json (GitHub Action)
│   ├── transcribe_audio.py       # Transcribe + timestamp an audio script (local CLI)
│   ├── content_pipeline.py       # Stage 1 of the automated content pipeline (see below)
│   ├── requirements-transcribe.txt  # pip deps for transcribe_audio.py / content_pipeline.py
│   ├── email-delivery.gs         # Apps Script web app: email capture + delivery
│   └── suno-poster-delivery.gs   # Apps Script web app: suno-poster.html's email gate
├── assets/
│   ├── css/styles.css    # Design system + all components
│   ├── js/main.js        # Nav, reveals, starfield, lazy embeds
│   ├── js/process.js     # Homepage "How We Work" accordion interaction
│   ├── js/consent.js     # Cookie consent banner + Google Consent Mode
│   ├── data/
│   │   └── latest-videos.json   # Newest YouTube upload per channel
│   └── img/
│       ├── favicon.svg
│       ├── ventures/     # Drop venture photography here
│       ├── team/         # Founder headshot
│       └── press/        # Press kit assets
└── README.md
```

---

## Preview locally

No Node needed — use Python (already on your Mac):

```bash
cd blackstarmedia.com.au
python3 -m http.server 8000
```

Open <http://localhost:8000>. (Just opening `index.html` directly also works,
but a server is closer to production.)

---

## Placeholders to fill in before launch

Search the codebase for these tokens and replace them:

| Token / location | Replace with | Where to get it | Status |
|---|---|---|---|
| Spotify artist `6v0R5eHKsjwcvml4rpPpng` | Tha MEGA BOY BAND | Spotify | ✅ wired |
| AI MEGA VAULT video `Kl5MOpvXuD8` + `@AiMegaVault` | Featured video / channel | YouTube | ✅ wired |
| NeoSoul Music video `Dv8crFNMlBo` + `@NeoSoulMusic26` | Featured video / channel | YouTube | ✅ wired |
| AdSense publisher ID | `ca-pub-6512943011057060` | Google AdSense | ✅ wired |
| `data-ad-slot="0000000000"` | Real AdSense slot IDs (once you create ad units) | Google AdSense | ⬜ todo |
| TikTok URL (footer) | Real profile link | — | ✅ wired |

> The homepage contact form was replaced with a direct `mailto:` link — the
> Formspree form and its `YOUR_FORM_ID` placeholder were removed rather than
> configured, since a working mailto CTA is simpler and Formspree wasn't set up.

> Instagram and Facebook icons were removed from the footer (they pointed to
> the generic homepages, not a real Black Star Media profile — a dead-link
> risk for AdSense review). Add them back once real profile URLs exist.

**Swapping the featured AI MEGA VAULT video:** in `index.html`, change the
`data-yt="…"` value and the `hqdefault.jpg` thumbnail URL in the same block to
the new 11-character video ID. (A static site can't auto-pull the latest upload
without the YouTube Data API.)

### Venture imagery
The venture cards and hero use CSS gradient fallbacks so the site looks finished
today. To use real photos, set a background image on `.venture__bg`, e.g.:

```html
<span class="venture__bg" style="background-image:url('assets/img/ventures/mosaic.jpg');"></span>
```

---

## Activating Google AdSense

The AdSense loader script (`ca-pub-6512943011057060`) is already live in the
`<head>` of every page, and `ads.txt` at the site root authorises Google as a
seller for that publisher ID — both required before AdSense will serve ads on
this domain.

1. Get approved at <https://www.google.com/adsense> with the live domain (if
   not already approved).
2. For each `<!-- AD SLOT: … -->` block, uncomment the `<ins class="adsbygoogle">`
   tag and replace `data-ad-slot="0000000000"` with the real slot ID from a
   matching ad unit you create in the AdSense dashboard.
3. The placeholder boxes you see now are just visual stand-ins — they disappear
   once real ad units render. Until slots are configured, AdSense's Auto ads
   (enabled from the AdSense dashboard) can still serve ads using just the
   loader script.
4. In AdSense → **Privacy & messaging**, turn on a consent message for
   EEA/UK/Switzerland traffic. The site already sends Google's Consent Mode
   default (`denied`) via `assets/js/consent.js` and a cookie banner that
   updates consent to `granted`/`denied` based on the visitor's choice — the
   dashboard message and this code-side signal work together, so an AdSense
   Privacy & messaging message should still be configured for full compliance.
5. Compliance pages are live at `/privacy.html` and `/terms.html` (linked from
   every footer) — update the contact details or add a company entity/ABN if
   that changes.

---

## Downloads (email-gated PDF via suno-poster.html)

The homepage `#downloads` section is a static featured-resource card linking
to [`suno-poster.html`](suno-poster.html), a dedicated landing page with its
own email-capture form. The visitor enters their email, the address is logged
to a Google Sheet, and an automated email delivers the PDF link — no backend,
just a static page + a Google Apps Script.

| Piece | Role |
|---|---|
| `suno-poster.html` inline script | Renders the capture form and posts the email to the Apps Script endpoint. |
| `scripts/suno-poster-delivery.gs` | Apps Script web app: logs the email to a Google Sheet and sends the delivery email. |
| Google Sheet | Email database (auto-created on first signup). |

Degrades gracefully: if the Apps Script endpoint isn't configured, the form
shows the download button immediately instead of gating it.

> The earlier Google Drive-backed multi-resource listing (`assets/js/downloads.js`,
> with an admin upload panel) was removed — it was never fully configured and
> sat unused, showing placeholder "coming soon" cards. `scripts/email-delivery.gs`
> was written for that flow; it's no longer wired to any page but is kept as a
> reference if the Drive-listing approach comes back.

> **Compliance (AU Spam Act 2003):** the form requires a consent checkbox, and
> the delivery email identifies the sender and includes an unsubscribe line. For
> large-scale bulk campaigns later, export the Sheet into a dedicated email tool
> (MailerLite, Brevo, etc.) that handles unsubscribe + deliverability at scale.

---

## Transcribing audio scripts (`scripts/transcribe_audio.py`)

A local CLI (not a GitHub Action — run it on your Mac) that sends an audio
file to the OpenAI Whisper API and writes back a timestamped script:

```bash
pip install -r scripts/requirements-transcribe.txt
export OPENAI_API_KEY=sk-...
python3 scripts/transcribe_audio.py voiceover.mp3
```

By default it prints one `[MM:SS] line` per segment — the same bracketed
timestamp format the video/content pipeline expects as script input. Pass
`--format srt` or `--format vtt` for captions, `--format txt` for a plain
transcript, or `--format json` for raw segment data; `--out FILE` writes to
a file instead of stdout. `--language` and `--prompt` can hint the model
with an ISO-639-1 code or context (names, jargon) for better accuracy. The
Whisper API caps uploads at 25MB — compress or split longer recordings
first.

---

## Automated content pipeline (raw audio → storyboard frames → edited video)

Three stages turn a voiceover recording into a fully edited video. The first
is a plain local script; the other two are Claude Code skills, because they
need judgement (what idea does this line illustrate?) and tool connections
(OpenArt, Descript) that don't belong in a portable script.

| Stage | What runs it | What it does |
|---|---|---|
| 1. Transcribe | `scripts/content_pipeline.py` (local CLI) | Audio → `output/<name>/script.txt`, a timestamped script |
| 2. Storyboard frames | `openart-script-frames` skill | `script.txt` → `output/<name>/frames/`, one image per timestamp |
| 3. Final cut | `video-editor-pipeline` skill | Audio + script + frames → edited video (captions, B-roll, music) |

```bash
pip install -r scripts/requirements-transcribe.txt
export OPENAI_API_KEY=sk-...
python3 scripts/content_pipeline.py voiceover.mp3 --name my-video
```

That writes `output/my-video/script.txt` and prints the two follow-up skill
invocations to run in a Claude Code session. `output/` is gitignored — it's
per-run scratch content, not part of the site.

---

## Deploy to GitHub Pages

1. Create a GitHub repo (e.g. `blackstarmedia-website`).
2. Push this folder:
   ```bash
   git add .
   git commit -m "Initial site scaffold"
   git branch -M main
   git remote add origin https://github.com/<you>/<repo>.git
   git push -u origin main
   ```
3. Repo → **Settings → Pages** → Source: `Deploy from a branch` → Branch: `main` / `/ (root)`.
4. The `CNAME` file sets the custom domain to `blackstarmedia.com.au`.
   At your domain registrar, add DNS records pointing to GitHub Pages:
   - Four `A` records → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - One `CNAME` record for `www` → `<you>.github.io`
5. In **Settings → Pages**, tick **Enforce HTTPS** once the cert is issued.

---

## Brand tokens (quick reference)

Palette: Grok/xAI-style mono (dark theme, blue accent).

```
--color-black   #000000   --color-gold*     #1D9BF0   (* accent — blue)
--color-white   #FFFFFF   --color-surface   #16181C
--color-muted   #71767B   --color-surface-2 #0E1013
                          --font-display    Playfair Display
                          --font-body       DM Sans
                          --font-mono       Space Mono
```

> Note: the accent custom property is still named `--color-gold` for
> continuity — its value is now the accent blue. Change that one line to
> re-theme every accent on the site.

© 2026 Black Star Media &amp; Entertainment.
