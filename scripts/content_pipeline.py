#!/usr/bin/env python3
"""Stage 1 of the automated content pipeline: turn a raw audio recording into
a timestamped script.

    raw audio  -->  [this script]  -->  timestamped script.txt
                                              |
                                              v
                          openart-script-frames skill (Claude Code)
                                  --> one storyboard image per timestamp
                                              |
                                              v
                          video-editor-pipeline skill (Claude Code)
                                  --> final edited video

This script only does the deterministic transcription step. The two steps
after it need a Claude Code session: turning a script line into a storyboard
*idea* and generating the image both take judgement, and image generation
runs through the OpenArt tool connection rather than a portable API key, so
they can't be scripted headlessly here. Run this first, then hand the
script.txt it writes to those two skills in order.

Usage:
    export OPENAI_API_KEY=sk-...
    python3 scripts/content_pipeline.py voiceover.mp3 --name my-video
"""

import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from transcribe_audio import render, transcribe, validate_audio_source  # noqa: E402

OUTPUT_ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "output")


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("audio", help="Path to the audio file to transcribe")
    parser.add_argument("--name", help="Run name / output folder (default: audio filename without extension)")
    parser.add_argument("--model", default="whisper-1", help="Whisper API model (default: whisper-1)")
    parser.add_argument("--language", help="ISO-639-1 language hint, e.g. 'en'")
    parser.add_argument("--prompt", help="Optional context to prime the transcription (names, jargon, style)")
    args = parser.parse_args()

    validate_audio_source(args.audio)

    name = args.name or os.path.splitext(os.path.basename(args.audio))[0]
    run_dir = os.path.join(OUTPUT_ROOT, name)
    os.makedirs(run_dir, exist_ok=True)

    print(f"Transcribing {args.audio}...", file=sys.stderr)
    segments = transcribe(args.audio, args.model, args.language, args.prompt)
    script_path = os.path.join(run_dir, "script.txt")
    with open(script_path, "w", encoding="utf-8") as f:
        f.write(render(segments, "script") + "\n")

    print(f"Wrote {script_path} ({len(segments)} segments)")
    print()
    print("Next, in a Claude Code session:")
    print(f"  1. openart-script-frames skill on {script_path}")
    print(f"     -> output/{name}/frames/ (one storyboard image per timestamp)")
    print(f"  2. video-editor-pipeline skill with {args.audio} + {script_path} + the frames folder")
    print("     -> final edited video with captions, B-roll, and music")


if __name__ == "__main__":
    main()
