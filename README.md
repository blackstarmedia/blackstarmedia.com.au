# Black Star Media &amp; Entertainment

Flagship website for Black Star Media &amp; Entertainment — Brisbane, QLD.
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
├── index.html            # The whole site (single page, anchored sections)
├── CNAME                 # Custom domain for GitHub Pages
├── .nojekyll             # Tell GitHub Pages to serve files as-is (no Jekyll)
├── robots.txt
├── sitemap.xml
├── assets/
│   ├── css/styles.css    # Design system + all components
│   ├── js/main.js        # Nav, reveals, starfield, mobile menu, lazy embeds
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

| Token / location | Replace with | Where to get it |
|---|---|---|
| `ARTIST_ID` (index.html, Spotify iframe) | Tha Mega Boy Band Spotify artist ID | Spotify for Artists |
| `VIDEO_ID_AIMEGAVAULT` (`data-yt`) | Latest AI MegaVault video ID | YouTube Studio |
| `VIDEO_ID_NEOSOUL` (`data-yt`) | Latest NeoSoul Music video ID | YouTube Studio |
| `@AIMegaVault`, `@NeoSoulMusic` | Real channel handles | YouTube |
| `ca-pub-XXXXXXXXXXXXXXXX` | AdSense publisher ID | Google AdSense |
| `data-ad-slot="0000000000"` | AdSense slot IDs | Google AdSense |
| `YOUR_FORM_ID` (contact form `action`) | Formspree form ID | <https://formspree.io> |
| ABN `00 000 000 000` (footer) | Real ABN | ATO |
| Social URLs (footer) | Real profile links | — |

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

```
--color-black   #0A0A0A   --color-gold      #C9A84C
--color-white   #FFFFFF   --color-surface   #1C1C1E
--color-muted   #6E6E73   --font-display    Playfair Display
                          --font-body       DM Sans
                          --font-mono       Space Mono
```

© 2026 Black Star Media &amp; Entertainment.
