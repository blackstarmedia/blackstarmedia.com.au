# Open-Source GitHub Toolkit — YouTube workflow Module H

Nine free GitHub projects that replace paid tools in the Black Star Media YouTube
workflow. This is Module H of the `yt-content-engine` skill. The tool list is in
[`github-tools.json`](github-tools.json) and the setup helper is
[`../scripts/gh_tools.sh`](../scripts/gh_tools.sh).

Source: an Ez Peter Short, "9 GitHub repos" (screen recording, 26 Nov 2026). Each
repo was checked on GitHub the same day: all nine exist, are public, were updated
within the last month, and use the licences shown below.

## The tools

| # | Tool | Repo | Replaces | What it does | Where it plugs in |
|---|---|---|---|---|---|
| 1 | Open Generative AI | [Anil-matcha/Open-Generative-AI](https://github.com/Anil-matcha/Open-Generative-AI) | Higgsfield | AI images and cinematic video clips | 03 Production: B-roll, thumbnails, scene clips |
| 2 | VoiceStudio | [debpalash/VoiceStudio](https://github.com/debpalash/VoiceStudio) | ElevenLabs | Local text-to-speech, voice cloning, voice design, dubbing, transcription | 03 Production: voiceover and dubbing |
| 3 | OpenSEO | [every-app/open-seo](https://github.com/every-app/open-seo) | Semrush | Keywords, rank tracking, backlinks, site audits | 05 Distribution: site and topic SEO |
| 4 | AppFlowy | [AppFlowy-IO/AppFlowy](https://github.com/AppFlowy-IO/AppFlowy) | Notion | Notes, docs, databases, boards; local AI models | 01 Ideation: idea bank, scripts, calendar |
| 5 | OpenWhispr | [OpenWhispr/openwhispr](https://github.com/OpenWhispr/openwhispr) | Wispr Flow | Hotkey dictation into any app, online or offline | 01–02: dictate ideas, hooks, prompts |
| 6 | OpenProject | [opf/openproject](https://github.com/opf/openproject) | Asana | Tasks, kanban, Gantt, time tracking | All stages: one production board per video |
| 7 | Cal.diy | [calcom/cal.diy](https://github.com/calcom/cal.diy) | Calendly | Booking pages synced to Google and Outlook calendars | Business: sponsor, collab and workshop calls |
| 8 | Chatwoot | [chatwoot/chatwoot](https://github.com/chatwoot/chatwoot) | Intercom | One inbox for site chat, email, socials, WhatsApp | 05 Distribution: leads and DMs |
| 9 | Cap | [CapSoftware/Cap](https://github.com/CapSoftware/Cap) | Loom | Screen + camera recording, editor, captions, share links | 03–04: tutorial screen recordings |

## Setup on the MacBook (one time)

```sh
./scripts/gh_tools.sh install-apps     # 1, 2, 4, 5, 9 — desktop apps via Homebrew / DMG
./scripts/gh_tools.sh up openseo       # needs Docker Desktop + a DataForSEO key
./scripts/gh_tools.sh up openproject   # optional: production board
./scripts/gh_tools.sh up caldiy        # optional: personal booking page
./scripts/gh_tools.sh up chatwoot      # optional: unified inbox
./scripts/gh_tools.sh mcp              # connect VoiceStudio + OpenSEO to Claude Code
./scripts/gh_tools.sh status           # check everything
```

Port plan (so the servers can run side by side): Cal.diy 3000, OpenSEO 3101,
Chatwoot 3200, VoiceStudio 3900, OpenProject 8080.

## How Claude reaches each tool

| Tool | Connection | Ready when |
|---|---|---|
| VoiceStudio | MCP `http://localhost:3900/mcp/` (generate_speech, clone_voice, design_voice, transcribe) | App open, model downloaded |
| OpenSEO | MCP `http://localhost:3101/mcp` (sign in or API key from Settings) | `up openseo` + DataForSEO key |
| Open Generative AI | Desktop app; Claude writes the prompts, you paste/run | App installed + MuAPI key |
| AppFlowy | Desktop app; Claude drafts Markdown to import | App installed |
| OpenWhispr | Desktop app; you dictate, text lands in any field | Mic + accessibility allowed |
| OpenProject | Browser at `localhost:8080`; Claude in Chrome can drive it | `up openproject` |
| Cal.diy | Browser at `localhost:3000` | `up caldiy` |
| Chatwoot | Browser at `localhost:3200` | `up chatwoot` |
| Cap | Desktop app; recordings feed `video-editor-pipeline` | Screen-recording permission |

## Read before using

- **VoiceStudio licence trap.** The app is AGPL-3.0 and free for commercial use, but
  its default OmniVoice model weights are **non-commercial (CC-BY-NC)**. For
  monetised channels, pick a commercially licensed engine in the Model Manager, or
  keep ElevenLabs for final voiceovers.
- **Not entirely free.** Open Generative AI's cloud models need a paid MuAPI key
  (its local engine needs an NVIDIA/AMD GPU, which the M1 doesn't have). OpenSEO
  needs a pay-as-you-go DataForSEO key.
- **Cal.diy** is labelled by its own maintainers as personal, non-production use.
  Use hosted Cal.com for client-facing bookings.
- **Chatwoot and Cal.diy** only serve the public once they run on a server (e.g. a
  VPS). On the laptop they're for trying out.
- **Star counts** in the source video (e.g. VoiceStudio 99.9K) are the video's, not
  re-checked.
