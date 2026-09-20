#!/usr/bin/env python3
"""Fetch the latest upload for each Black Star YouTube channel and write
assets/data/latest-videos.json. Run by .github/workflows/latest-videos.yml
on a schedule; no API key required (uses YouTube's public RSS feeds)."""

import json
import os
import time
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone

# handle (matches data-channel="" in index.html) -> YouTube channelId
CHANNELS = {
    "AiMegaVault": "UCA1XEbpgIcieDubVpZ0iPMg",
    "NeoSoulMusic26": "UC8ivIqJOczROwW3AUM4j1Ow",
}

NS = {
    "atom": "http://www.w3.org/2005/Atom",
    "yt": "http://www.youtube.com/xml/schemas/2015",
}
FEED = "https://www.youtube.com/feeds/videos.xml?channel_id={}"
OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "data", "latest-videos.json")

# The feed occasionally 404s/500s transiently (observed independent of channel
# or environment) — retry a few times with backoff before giving up.
RETRIES = 4
BACKOFF_SECONDS = 5


def fetch(channel_id):
    req = urllib.request.Request(FEED.format(channel_id), headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()


def latest(channel_id):
    last_error = None
    for attempt in range(1, RETRIES + 1):
        try:
            root = ET.fromstring(fetch(channel_id))
            break
        except (urllib.error.URLError, ET.ParseError) as exc:
            last_error = exc
            if attempt < RETRIES:
                time.sleep(BACKOFF_SECONDS * attempt)
    else:
        print(f"  giving up on {channel_id} after {RETRIES} attempts: {last_error}")
        return None

    entry = root.find("atom:entry", NS)  # feed lists newest entry first
    if entry is None:
        return None
    return {
        "channelId": channel_id,
        "videoId": entry.findtext("yt:videoId", default="", namespaces=NS).strip(),
        "title": (entry.findtext("atom:title", default="", namespaces=NS) or "").strip(),
    }


def main():
    try:
        with open(OUT, encoding="utf-8") as f:
            existing = json.load(f).get("channels", {})
    except (FileNotFoundError, json.JSONDecodeError):
        existing = {}

    channels = {}
    changed = False
    for handle, cid in CHANNELS.items():
        info = latest(cid)
        if info and info["videoId"]:
            channels[handle] = info
            if existing.get(handle) != info:
                changed = True
        elif handle in existing:
            print(f"  keeping last-known video for {handle} (fetch failed)")
            channels[handle] = existing[handle]
        else:
            raise SystemExit(f"No video found for {handle} ({cid}) and no prior value to fall back to")

    if not changed:
        print("No new uploads detected; leaving file untouched.")
        return

    data = {
        "updated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "channels": channels,
    }
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print(json.dumps(data, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
