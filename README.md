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
├── index.html            # Home — all sections incl. #downloads + admin modal
├── profile.html          # Company profile page
├── CNAME                 # Custom domain for GitHub Pages
├── .nojekyll             # Tell GitHub Pages to serve files as-is (no Jekyll)
├── robots.txt
├── sitemap.xml
├── scripts/
│   ├── update_latest_videos.py # Refresh latest-videos.json (GitHub Action)
│   └── email-delivery.gs       # Apps Script web app: email capture + delivery
├── assets/
│   ├── css/styles.css    # Design system + all components
│   ├── js/main.js        # Nav, reveals, starfield, lazy embeds
│   ├── js/downloads.js   # Downloads section: Drive listing + email gate + admin upload
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
| `YOUR_FORM_ID` (contact form `action`) | Formspree form ID | <https://formspree.io> | ⬜ todo |
| TikTok URL (footer) | Real profile link | — | ✅ wired |

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

## Downloads section (Drive listing + email gate + admin upload)

The homepage `#downloads` section lists PDF resources straight from a Google
Drive folder. Each card shows an **email opt-in form** — the visitor enters
their email, the address is saved to your list, and an automated thank-you email
delivers the download link. There's also a hidden **admin panel** to upload new
PDFs to Drive from the browser.

**How it fits together (no backend — static site + Google):**

| Piece | Role |
|---|---|
| `assets/js/downloads.js` | Lists PDFs from the Drive folder (Drive API), renders cards with the email form, runs the admin upload modal. |
| Google Drive folder | Holds the PDFs (shared "Anyone with link → Viewer"). |
| `scripts/email-delivery.gs` | Apps Script web app: validates the file is in your folder, logs the email to a Google Sheet, emails the download link. |
| Google Sheet | "Black Star — Download Signups" — your email database (auto-created on first signup). |

**Setup — two parts:**

1. **Listing + admin upload** — follow the header comment in
   [`assets/js/downloads.js`](assets/js/downloads.js): create a Google Cloud
   project, enable the Drive API, make an API key + OAuth client ID, create the
   Drive folder (share "Anyone with link → Viewer"), and fill in
   `DRIVE_API_KEY`, `DRIVE_CLIENT_ID`, `DRIVE_FOLDER_ID`.
2. **Email gate** — follow the header in
   [`scripts/email-delivery.gs`](scripts/email-delivery.gs): paste it into a new
   Apps Script project, set `DOWNLOADS_FOLDER_ID` to the **same** folder id,
   deploy as a Web app ("Execute as: Me", "Who has access: Anyone"), and put the
   `/exec` URL into `downloads.js` → `EMAIL_ENDPOINT`.

**Adding a resource:** open the admin panel (**Shift + Alt + A**), sign in, and
upload the PDF — it appears in the section automatically and is immediately
deliverable (no per-file config; the script accepts any PDF in the folder).

Degrades gracefully: before keys are set it shows placeholder "coming soon"
cards; if `EMAIL_ENDPOINT` is unset it shows a direct download link instead of
the form.

> **Gate strength:** because the folder is listed client-side, file ids are
> visible in the page, so a technical user could derive a direct Drive link —
> the gate captures ~all normal visitors but isn't airtight. For a strict gate,
> switch to server-side listing (Apps Script `doGet`) with a private folder.

> **Compliance (AU Spam Act 2003):** the form requires a consent checkbox, and
> the delivery email identifies the sender and includes an unsubscribe line. For
> large-scale bulk campaigns later, export the Sheet into a dedicated email tool
> (MailerLite, Brevo, etc.) that handles unsubscribe + deliverability at scale.

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
