#!/usr/bin/env python3
"""Rebuild assets/data/downloads.json from the mirrored PDFs in assets/downloads/.

The website's Downloads page (downloads.html) renders its cards from this
manifest. PDFs are mirrored into assets/downloads/ from the Google Drive
"Website/Downloads" folder; each immediate subfolder becomes a group/section on
the page, and loose files fall into a default group.

Workflow when new PDFs are added to Drive:
  1. The agent downloads them into assets/downloads/<Group>/<file>.pdf
  2. Run this script to regenerate the manifest:
         python3 scripts/build_downloads_manifest.py
  3. Commit assets/downloads/ + assets/data/downloads.json

Filenames become display titles automatically (humanised). To set a custom
title or add a description, edit downloads.json after generating — this script
preserves existing "title" and "description" values matched by file path on
the next run.
"""

import json
import os
from datetime import datetime, timezone

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DL_DIR = os.path.join(ROOT, "assets", "downloads")
OUT = os.path.join(ROOT, "assets", "data", "downloads.json")
DEFAULT_GROUP = "Resources"


def humanise(filename):
    """guide_v2-final.pdf -> 'Guide V2 Final'."""
    name = os.path.splitext(filename)[0]
    name = name.replace("_", " ").replace("-", " ")
    words = [w for w in name.split() if w]
    return " ".join(w if (w.isupper() or any(c.isdigit() for c in w)) else w.capitalize()
                     for w in words) or filename


def human_size(num_bytes):
    size = float(num_bytes)
    for unit in ("B", "KB", "MB", "GB"):
        if size < 1024 or unit == "GB":
            return (f"{int(round(size))} {unit}" if unit in ("B", "KB")
                    else f"{size:.1f} {unit}")
        size /= 1024


def load_overrides():
    """Map file path -> {title?, description?} from the existing manifest."""
    overrides = {}
    if not os.path.exists(OUT):
        return overrides
    try:
        with open(OUT, encoding="utf-8") as f:
            data = json.load(f)
    except (json.JSONDecodeError, OSError):
        return overrides
    for group in data.get("groups", []):
        for item in group.get("items", []):
            if item.get("file"):
                overrides[item["file"]] = {
                    k: item[k] for k in ("title", "description") if item.get(k)
                }
    return overrides


def collect():
    overrides = load_overrides()
    groups = {}  # group name -> list of items

    for dirpath, _dirnames, filenames in os.walk(DL_DIR):
        for fn in sorted(filenames):
            if not fn.lower().endswith(".pdf"):
                continue
            abs_path = os.path.join(dirpath, fn)
            rel_from_dl = os.path.relpath(abs_path, DL_DIR)
            parts = rel_from_dl.split(os.sep)
            group_name = parts[0] if len(parts) > 1 else DEFAULT_GROUP
            web_path = "assets/downloads/" + rel_from_dl.replace(os.sep, "/")
            ov = overrides.get(web_path, {})
            groups.setdefault(group_name, []).append({
                "title": ov.get("title") or humanise(fn),
                "description": ov.get("description", ""),
                "file": web_path,
                "type": "PDF",
                "size": human_size(os.path.getsize(abs_path)),
            })

    # Stable ordering: default group last, others alphabetical
    ordered = sorted(groups.keys(), key=lambda g: (g == DEFAULT_GROUP, g.lower()))
    return [{"name": g, "items": groups[g]} for g in ordered]


def main():
    groups = collect()
    total = sum(len(g["items"]) for g in groups)
    data = {
        "updated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ") if total else None,
        "source": "Google Drive · Website/Downloads",
        "groups": groups,
    }
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print(f"Wrote {os.path.relpath(OUT, ROOT)} — {total} file(s) in {len(groups)} group(s).")


if __name__ == "__main__":
    main()
