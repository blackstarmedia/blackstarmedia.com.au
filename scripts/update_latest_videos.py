#!/usr/bin/env python3
"""Fetch the latest upload for each Black Star YouTube channel and write
assets/data/latest-videos.json. Run by .github/workflows/latest-videos.yml
on a schedule; no API key required (uses YouTube's public RSS feeds)."""

import json
import os
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


def latest(channel_id):
    req = urllib.request.Request(FEED.format(channel_id), headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        root = ET.fromstring(r.read())
    entry = root.find("atom:entry", NS)  # feed lists newest entry first
    if entry is None:
        return None
    return {
        "channelId": channel_id,
        "videoId": entry.findtext("yt:videoId", default="", namespaces=NS).strip(),
        "title": (entry.findtext("atom:title", default="", namespaces=NS) or "").strip(),
    }


def main():
    channels = {}
    for handle, cid in CHANNELS.items():
        info = latest(cid)
        if info and info["videoId"]:
            channels[handle] = info
        else:
            raise SystemExit(f"No video found for {handle} ({cid})")

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
