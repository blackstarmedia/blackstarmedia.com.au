#!/usr/bin/env bash
# Black Star Media — open-source GitHub toolkit helper (macOS, Apple Silicon).
# Installs, starts, checks and connects the 9 tools listed in toolkit/github-tools.json.
#
#   ./scripts/gh_tools.sh list                 # what each tool is and where it plugs in
#   ./scripts/gh_tools.sh install-apps         # desktop apps: Open Generative AI, VoiceStudio,
#                                              #   AppFlowy, OpenWhispr, Cap
#   ./scripts/gh_tools.sh up <server>          # openseo | openproject | caldiy | chatwoot
#   ./scripts/gh_tools.sh down <server>
#   ./scripts/gh_tools.sh status               # what is installed / running
#   ./scripts/gh_tools.sh mcp                  # connect VoiceStudio + OpenSEO to Claude Code
#
# Needs: Homebrew (desktop apps), Docker Desktop (servers), git, openssl, curl.
# Servers live in $GH_TOOLS_DIR (default ~/BlackStar/gh-tools).
# Bash 3.2 compatible (the macOS default shell).

set -euo pipefail

TOOLS_DIR="${GH_TOOLS_DIR:-$HOME/BlackStar/gh-tools}"

# Port plan — chosen so every server can run side by side.
PORT_CALDIY=3000
PORT_OPENSEO=3101
PORT_CHATWOOT=3200
PORT_VOICESTUDIO=3900
PORT_OPENPROJECT=8080

say()  { printf '\033[1;33m▸\033[0m %s\n' "$*"; }
ok()   { printf '\033[1;32m✔\033[0m %s\n' "$*"; }
warn() { printf '\033[1;31m!\033[0m %s\n' "$*" >&2; }
die()  { warn "$*"; exit 1; }

need() { command -v "$1" >/dev/null 2>&1 || die "$1 is not installed. $2"; }
need_docker() {
  need docker "Install Docker Desktop: https://www.docker.com/products/docker-desktop/"
  docker info >/dev/null 2>&1 || die "Docker Desktop is installed but not running. Open it, then retry."
}

# setenv KEY VALUE FILE — replace KEY=… in FILE, or append it.
setenv() {
  local key="$1" val="$2" file="$3" tmp
  tmp="$(mktemp)"
  awk -v k="$key" -v v="$val" '
    BEGIN { done = 0 }
    $0 ~ "^"k"=" { print k"="v; done = 1; next }
    { print }
    END { if (!done) print k"="v }
  ' "$file" > "$tmp" && mv "$tmp" "$file"
}

clone() { # clone OWNER/REPO DIR [extra git args]
  local repo="$1" dir="$2"; shift 2
  if [ -d "$dir/.git" ]; then
    say "Updating $repo"; git -C "$dir" pull --ff-only --quiet || warn "Could not fast-forward $dir; leaving it as is."
  else
    say "Cloning $repo"; mkdir -p "$(dirname "$dir")"
    git clone --depth 1 "$@" "https://github.com/$repo.git" "$dir"
  fi
}

# ---------------------------------------------------------------- list
cmd_list() {
  cat <<'EOF'
  #  Tool                 Replaces     Run as    Workflow stage
  1  Open Generative AI   Higgsfield   desktop   03 Production — images, cinematic video, B-roll
  2  VoiceStudio          ElevenLabs   desktop   03 Production — voiceover, cloning, dubbing (MCP)
  3  OpenSEO              Semrush      docker    05 Distribution — keywords, rank tracking, audits (MCP)
  4  AppFlowy             Notion       desktop   01 Ideation — idea banks, scripts, calendar
  5  OpenWhispr           Wispr Flow   desktop   01/02 — dictate ideas, hooks and prompts anywhere
  6  OpenProject          Asana        docker    All — one production board per video
  7  Cal.diy              Calendly     docker    Business — sponsor/collab/workshop bookings
  8  Chatwoot             Intercom     docker    05 Distribution — leads + DMs in one inbox
  9  Cap                  Loom         desktop   03/04 — screen recordings for tutorials
EOF
}

# ---------------------------------------------------------------- desktop apps
cask() { # cask NAME FALLBACK_URL
  if brew install --cask "$1"; then ok "$1 installed"
  else warn "Homebrew could not install $1 — opening the download page."; open "$2"; fi
}

install_ogai() {
  say "Open Generative AI: fetching the latest Apple Silicon DMG"
  local url
  url="$(curl -fsSL https://api.github.com/repos/Anil-matcha/Open-Generative-AI/releases/latest \
        | grep -o '"browser_download_url": *"[^"]*arm64\.dmg"' | head -1 | sed 's/.*"\(http[^"]*\)"/\1/')" || true
  if [ -n "${url:-}" ]; then
    curl -fL -o "$HOME/Downloads/OpenGenerativeAI-arm64.dmg" "$url"
    open "$HOME/Downloads/OpenGenerativeAI-arm64.dmg"
    ok "DMG opened — drag the app to Applications. First launch: right-click → Open (it isn't notarised)."
  else
    warn "Couldn't find the DMG automatically — opening releases page."
    open "https://github.com/Anil-matcha/Open-Generative-AI/releases/latest"
  fi
}

cmd_install_apps() {
  need brew "Install Homebrew: https://brew.sh"
  install_ogai
  brew tap debpalash/tap
  brew trust --cask debpalash/tap/voicestudio 2>/dev/null || true
  cask debpalash/tap/voicestudio "https://github.com/debpalash/VoiceStudio/releases/latest"
  cask appflowy   "https://github.com/AppFlowy-IO/AppFlowy/releases/latest"
  cask openwhispr "https://github.com/OpenWhispr/openwhispr/releases/latest"
  cask cap        "https://cap.so/download"
  cat <<EOF

Next:
  • VoiceStudio: open it once and let it download a model. Before using a voice on a
    monetised video, choose a commercially licensed engine — the default OmniVoice
    weights are non-commercial (CC-BY-NC).
  • OpenWhispr + Cap: allow Microphone, Accessibility and Screen Recording when macOS asks.
  • Then run:  $0 mcp
EOF
}

# ---------------------------------------------------------------- servers
up_openseo() {
  local d="$TOOLS_DIR/open-seo" env
  clone every-app/open-seo "$d"
  env="$d/deploy/standalone/.env"
  [ -f "$env" ] || cp "$d/deploy/standalone/.env.example" "$env"
  grep -q '^STORAGE_SECRET_KEY=replace' "$env" && setenv STORAGE_SECRET_KEY "$(openssl rand -hex 32)" "$env"
  setenv PORT "$PORT_OPENSEO" "$env"
  setenv BETTER_AUTH_URL "http://localhost:$PORT_OPENSEO" "$env"
  if ! grep -q '^DATAFORSEO_API_KEY=.' "$env" && ! grep -q '^TREG_API_TOKEN=.' "$env"; then
    warn "No DATAFORSEO_API_KEY in $env yet. OpenSEO will start, but SEO data needs that key."
  fi
  (cd "$d" && COMPOSE_FILE=deploy/standalone/compose.yaml docker compose pull && \
              COMPOSE_FILE=deploy/standalone/compose.yaml docker compose up -d)
  ok "OpenSEO → http://localhost:$PORT_OPENSEO  (create the admin account straight away)"
}

up_openproject() {
  local secret_file="$TOOLS_DIR/openproject.secret"
  mkdir -p "$TOOLS_DIR"
  [ -f "$secret_file" ] || openssl rand -hex 64 > "$secret_file"
  if docker ps -a --format '{{.Names}}' | grep -qx openproject; then
    docker start openproject >/dev/null
  else
    docker run -d --name openproject --restart unless-stopped -p "127.0.0.1:$PORT_OPENPROJECT:80" \
      -e SECRET_KEY_BASE="$(cat "$secret_file")" \
      -e OPENPROJECT_HOST__NAME="localhost:$PORT_OPENPROJECT" \
      -e OPENPROJECT_HTTPS=false -e OPENPROJECT_DEFAULT__LANGUAGE=en \
      -v openproject_pgdata:/var/openproject/pgdata -v openproject_assets:/var/openproject/assets \
      openproject/openproject:18
  fi
  ok "OpenProject → http://localhost:$PORT_OPENPROJECT  (first boot takes a few minutes; login admin / admin)"
}

up_caldiy() {
  local d="$TOOLS_DIR/cal.diy" env
  clone calcom/cal.diy "$d" --recursive
  env="$d/.env"
  [ -f "$env" ] || cp "$d/.env.example" "$env"
  grep -q '^NEXTAUTH_SECRET=.' "$env"        || setenv NEXTAUTH_SECRET "$(openssl rand -base64 32)" "$env"
  grep -q '^CALENDSO_ENCRYPTION_KEY=.' "$env" || setenv CALENDSO_ENCRYPTION_KEY "$(openssl rand -base64 24)" "$env"
  # The compose file builds DATABASE_URL from these; they match its bundled Postgres.
  setenv POSTGRES_USER unicorn_user "$env"
  setenv POSTGRES_PASSWORD magical_password "$env"
  setenv POSTGRES_DB calendso "$env"
  setenv DATABASE_HOST database:5432 "$env"
  setenv DATABASE_URL "postgresql://unicorn_user:magical_password@database:5432/calendso" "$env"
  setenv NEXT_PUBLIC_WEBAPP_URL "http://localhost:$PORT_CALDIY" "$env"
  (cd "$d" && docker compose up -d database redis calcom)
  ok "Cal.diy → http://localhost:$PORT_CALDIY  (first start can take a while; personal use only)"
}

up_chatwoot() {
  local d="$TOOLS_DIR/chatwoot" env compose
  mkdir -p "$d"
  compose="$d/docker-compose.yaml"; env="$d/.env"
  if [ ! -f "$compose" ]; then
    curl -fsSL -o "$compose" https://raw.githubusercontent.com/chatwoot/chatwoot/develop/docker-compose.production.yaml
    # Move host ports off 3000/5432/6379 so Chatwoot can run beside Cal.diy, and pass the DB password through.
    sed -i.bak -e "s/'127.0.0.1:3000:3000'/'127.0.0.1:$PORT_CHATWOOT:3000'/" \
              -e "s/'127.0.0.1:5432:5432'/'127.0.0.1:5532:5432'/" \
              -e "s/'127.0.0.1:6379:6379'/'127.0.0.1:6479:6379'/" \
              -e 's/- POSTGRES_PASSWORD=$/- POSTGRES_PASSWORD=${POSTGRES_PASSWORD}/' "$compose" && rm -f "$compose.bak"
  fi
  if [ ! -f "$env" ]; then
    curl -fsSL -o "$env" https://raw.githubusercontent.com/chatwoot/chatwoot/develop/.env.example
    setenv SECRET_KEY_BASE "$(openssl rand -hex 64)" "$env"
    setenv FRONTEND_URL "http://localhost:$PORT_CHATWOOT" "$env"
    setenv POSTGRES_PASSWORD "$(openssl rand -hex 16)" "$env"
    setenv REDIS_PASSWORD "$(openssl rand -hex 16)" "$env"
    (cd "$d" && docker compose run --rm rails bundle exec rails db:chatwoot_prepare)
  fi
  (cd "$d" && docker compose up -d)
  ok "Chatwoot → http://localhost:$PORT_CHATWOOT  (create your account on first visit)"
}

cmd_up() {
  need_docker; need git ""; need openssl ""
  case "${1:-}" in
    openseo) up_openseo ;; openproject) up_openproject ;;
    caldiy|cal|cal.diy) up_caldiy ;; chatwoot) up_chatwoot ;;
    *) die "up needs one of: openseo openproject caldiy chatwoot" ;;
  esac
}

cmd_down() {
  need_docker
  case "${1:-}" in
    openseo)  (cd "$TOOLS_DIR/open-seo" && COMPOSE_FILE=deploy/standalone/compose.yaml docker compose down) ;;
    openproject) docker stop openproject ;;
    caldiy|cal|cal.diy) (cd "$TOOLS_DIR/cal.diy" && docker compose down) ;;
    chatwoot) (cd "$TOOLS_DIR/chatwoot" && docker compose down) ;;
    *) die "down needs one of: openseo openproject caldiy chatwoot" ;;
  esac
  ok "Stopped $1 (data kept)."
}

# ---------------------------------------------------------------- status
app_status() { # app_status LABEL PATTERN
  if ls /Applications 2>/dev/null | grep -qi "$2"; then ok "$1 installed"; else warn "$1 not installed"; fi
}
port_status() { # port_status LABEL PORT
  if curl -s -o /dev/null --max-time 3 "http://localhost:$2"; then ok "$1 running on :$2"; else warn "$1 not reachable on :$2"; fi
}
cmd_status() {
  app_status "Open Generative AI" "generative"
  app_status "VoiceStudio"        "voicestudio"
  app_status "AppFlowy"           "appflowy"
  app_status "OpenWhispr"         "openwhispr"
  app_status "Cap"                "^cap"
  port_status "VoiceStudio API/MCP" "$PORT_VOICESTUDIO"
  port_status "OpenSEO"     "$PORT_OPENSEO"
  port_status "OpenProject" "$PORT_OPENPROJECT"
  port_status "Cal.diy"     "$PORT_CALDIY"
  port_status "Chatwoot"    "$PORT_CHATWOOT"
}

# ---------------------------------------------------------------- MCP
cmd_mcp() {
  if command -v claude >/dev/null 2>&1; then
    claude mcp add --scope user --transport http voicestudio "http://localhost:$PORT_VOICESTUDIO/mcp/" \
      && ok "VoiceStudio MCP added to Claude Code" || warn "VoiceStudio MCP not added (already there?)"
    claude mcp add --scope user --transport http openseo "http://localhost:$PORT_OPENSEO/mcp" \
      && ok "OpenSEO MCP added to Claude Code (sign in, or use an API key from OpenSEO → Settings)" \
      || warn "OpenSEO MCP not added (already there?)"
  else
    warn "Claude Code CLI not found. Add these MCP servers in your MCP client instead:"
  fi
  cat <<EOF
  voicestudio  http://localhost:$PORT_VOICESTUDIO/mcp/   (VoiceStudio app must be open)
  openseo      http://localhost:$PORT_OPENSEO/mcp        (run: $0 up openseo)
The other seven tools have no MCP server; Claude drives them through the browser or files.
EOF
}

case "${1:-list}" in
  list) cmd_list ;;
  install-apps) cmd_install_apps ;;
  up) cmd_up "${2:-}" ;;
  down) cmd_down "${2:-}" ;;
  status) cmd_status ;;
  mcp) cmd_mcp ;;
  -h|--help|help) sed -n 2,15p "$0" ;;
  *) die "Unknown command: $1 (try: list, install-apps, up, down, status, mcp)" ;;
esac
