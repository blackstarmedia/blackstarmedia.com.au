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
├── index.html            # Home (single page, anchored sections)
├── profile.html          # Company profile page
├── downloads.html        # Download centre (renders from downloads.json)
├── CNAME                 # Custom domain for GitHub Pages
├── .nojekyll             # Tell GitHub Pages to serve files as-is (no Jekyll)
├── robots.txt
├── sitemap.xml
├── scripts/
│   ├── update_latest_videos.py     # Refresh latest-videos.json (GitHub Action)
│   └── build_downloads_manifest.py # Rebuild downloads.json from assets/downloads/
├── assets/
│   ├── css/styles.css    # Design system + all components
│   ├── js/main.js        # Nav, reveals, starfield, lazy embeds, downloads render
│   ├── data/
│   │   ├── latest-videos.json   # Newest YouTube upload per channel
│   │   └── downloads.json       # PDF download manifest (groups → items)
│   ├── downloads/        # Mirrored PDFs (synced from Drive Website/Downloads)
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
| `ca-pub-XXXXXXXXXXXXXXXX` | AdSense publisher ID | Google AdSense | ⬜ todo |
| `data-ad-slot="0000000000"` | AdSense slot IDs | Google AdSense | ⬜ todo |
| `YOUR_FORM_ID` (contact form `action`) | Formspree form ID | <https://formspree.io> | ⬜ todo |
| Instagram / TikTok / Facebook URLs (footer) | Real profile links | — | ⬜ todo |

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

1. Get approved at <https://www.google.com/adsense> with the live domain.
2. In `index.html` `<head>`, uncomment the AdSense `<script>` and add your `ca-pub-…` ID.
3. For each `<!-- AD SLOT: … -->` block, uncomment the `<ins class="adsbygoogle">`
   tag and add your `data-ad-client` and `data-ad-slot` IDs.
4. The placeholder boxes you see now are just visual stand-ins — they disappear
   once real ad units render.

---

## Downloads page (PDF resources from Google Drive)

`downloads.html` is a data-driven download centre. It renders cards from
`assets/data/downloads.json`; the PDFs themselves are mirrored into
`assets/downloads/` (GitHub Pages serves them — visitors never touch Drive, and
nothing in Drive needs to be public).

**Source of truth:** the Google Drive folder **`Website/Downloads`**. Each
subfolder there (e.g. `Suno:Visualised`) becomes a section on the page; loose
PDFs fall into a default "Resources" group.

**Adding / updating downloads:**

1. Upload PDFs into `Website/Downloads` (or a subfolder) in Google Drive.
2. Ask Claude to "re-sync downloads" — it mirrors the PDFs into
   `assets/downloads/<Group>/` and regenerates the manifest:
   ```bash
   python3 scripts/build_downloads_manifest.py
   ```
3. Commit `assets/downloads/` + `assets/data/downloads.json`.

Filenames become display titles automatically (humanised). To set a custom
title or add a description, edit `downloads.json` after generating — the script
preserves existing `title`/`description` values matched by file path on re-run.

The page degrades gracefully: an empty manifest shows a friendly "new resources
on their way" message, and a failed fetch shows a temporary-unavailable note.

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
