#!/usr/bin/env python3
"""Transcribe an audio file into a timestamped script.

Sends the audio to the OpenAI Whisper API and writes out segment-level
timestamps in the `[MM:SS] line` script format used across Black Star's
content pipeline (matches the input expected by the openart-script-frames
workflow), plus SRT/VTT/plain-text/JSON as alternate formats.

Usage:
    export OPENAI_API_KEY=sk-...
    python3 scripts/transcribe_audio.py voiceover.mp3
    python3 scripts/transcribe_audio.py voiceover.mp3 --format srt --out captions.srt

Requires: pip install -r scripts/requirements-transcribe.txt
The Whisper API caps uploads at 25MB; split or compress longer files first.
"""

import argparse
import json
import os
import sys

MAX_UPLOAD_BYTES = 25 * 1024 * 1024


def fmt_script_ts(seconds):
    m, s = divmod(int(seconds), 60)
    h, m = divmod(m, 60)
    return f"{h:02d}:{m:02d}:{s:02d}" if h else f"{m:02d}:{s:02d}"


def fmt_srt_ts(seconds):
    whole_s, msec = divmod(round(seconds * 1000), 1000)
    m, s = divmod(whole_s, 60)
    h, m = divmod(m, 60)
    return f"{h:02d}:{m:02d}:{s:02d},{msec:03d}"


def fmt_vtt_ts(seconds):
    whole_s, msec = divmod(round(seconds * 1000), 1000)
    m, s = divmod(whole_s, 60)
    h, m = divmod(m, 60)
    return f"{h:02d}:{m:02d}:{s:02d}.{msec:03d}"


def transcribe(audio_path, model, language, prompt):
    from openai import OpenAI

    client = OpenAI()
    with open(audio_path, "rb") as f:
        kwargs = {
            "model": model,
            "file": f,
            "response_format": "verbose_json",
            "timestamp_granularities": ["segment"],
        }
        if language:
            kwargs["language"] = language
        if prompt:
            kwargs["prompt"] = prompt
        result = client.audio.transcriptions.create(**kwargs)
    return [
        {"start": seg.start, "end": seg.end, "text": seg.text.strip()}
        for seg in result.segments
    ]


def render(segments, fmt):
    if fmt == "script":
        return "\n".join(f"[{fmt_script_ts(seg['start'])}] {seg['text']}" for seg in segments)
    if fmt == "txt":
        return " ".join(seg["text"] for seg in segments)
    if fmt == "json":
        return json.dumps(segments, indent=2, ensure_ascii=False)
    if fmt == "srt":
        blocks = [
            f"{i}\n{fmt_srt_ts(seg['start'])} --> {fmt_srt_ts(seg['end'])}\n{seg['text']}"
            for i, seg in enumerate(segments, start=1)
        ]
        return "\n\n".join(blocks)
    if fmt == "vtt":
        blocks = [
            f"{fmt_vtt_ts(seg['start'])} --> {fmt_vtt_ts(seg['end'])}\n{seg['text']}"
            for seg in segments
        ]
        return "WEBVTT\n\n" + "\n\n".join(blocks)
    raise ValueError(f"Unknown format: {fmt}")


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("audio", help="Path to the audio file (mp3, wav, m4a, ...)")
    parser.add_argument("--format", "-f", choices=["script", "srt", "vtt", "txt", "json"], default="script",
                         help="Output format (default: script, i.e. [MM:SS] line per segment)")
    parser.add_argument("--out", "-o", help="Write output to this file instead of stdout")
    parser.add_argument("--model", default="whisper-1", help="Whisper API model (default: whisper-1)")
    parser.add_argument("--language", help="ISO-639-1 language hint, e.g. 'en' (improves accuracy/speed)")
    parser.add_argument("--prompt", help="Optional context to prime the transcription (names, jargon, style)")
    args = parser.parse_args()

    if not os.path.isfile(args.audio):
        raise SystemExit(f"No such file: {args.audio}")
    size = os.path.getsize(args.audio)
    if size > MAX_UPLOAD_BYTES:
        raise SystemExit(
            f"{args.audio} is {size / 1024 / 1024:.1f}MB, over the Whisper API's 25MB limit. "
            "Compress it or split it into smaller chunks first."
        )
    if not os.environ.get("OPENAI_API_KEY"):
        raise SystemExit("Set OPENAI_API_KEY before running this script.")

    segments = transcribe(args.audio, args.model, args.language, args.prompt)
    output = render(segments, args.format)

    if args.out:
        with open(args.out, "w", encoding="utf-8") as f:
            f.write(output + "\n")
        print(f"Wrote {args.out} ({len(segments)} segments)", file=sys.stderr)
    else:
        print(output)


if __name__ == "__main__":
    main()
