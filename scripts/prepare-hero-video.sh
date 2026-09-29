#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# prepare-hero-video.sh
#
# Re-encodes the source Pexels CC0 solar-rooftop clip for scroll-scrub playback
# in the Solaria Brasil hero, and extracts a poster JPG for the mobile / reduced
# motion fallback.
#
# Source licence: Pexels Content License (CC0)
#   https://www.pexels.com/license/
#   "It is completely free to use, both for commercial and personal use."
#
# Why these flags:
#   640x360  — small canvas, scrub playback only ever shows one frame at a time.
#   crf 28   — visually clean for soft architectural b-roll at 360p.
#   -g 1     — one GOP = one frame. This is the key trick for smooth
#              video.currentTime scrubbing: every frame is an IDR keyframe so
#              the browser can seek to it instantly without re-buffering.
#   -bf 0    — no B-frames. B-frames reference both past and future, which
#              breaks random-access seeks. With -g 1 + -bf 0, scrubbing is
#              frame-accurate.
#   -movflags +faststart — moves the moov atom to the front of the file so the
#              browser can begin playback before the full file is downloaded.
#   -an      — no audio. The hero is muted by default and we don't need the
#              bytes; removing audio also removes any need for browser autoplay
#              gesture handling.
#
# Usage:
#   ./scripts/prepare-hero-video.sh
#   ./scripts/prepare-hero-video.sh ./public/videos/other.mp4 ./public/hero
#
# Idempotent: overwrites existing outputs without prompting. Safe to re-run.
# ──────────────────────────────────────────────────────────────────────────────

set -euo pipefail

INPUT="${1:-./public/videos/solar-rooftop.mp4}"
OUTPUT_DIR="${2:-./public/hero}"
BASENAME="solar-install"

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "✗ ffmpeg is not on PATH. Install with: brew install ffmpeg" >&2
  exit 1
fi

if [[ ! -f "$INPUT" ]]; then
  echo "✗ Input file not found: $INPUT" >&2
  echo "  Pass the source mp4 as the first argument, e.g.:" >&2
  echo "    ./scripts/prepare-hero-video.sh ./public/videos/solar-rooftop.mp4" >&2
  exit 1
fi

mkdir -p "$OUTPUT_DIR"

MP4_OUT="${OUTPUT_DIR}/${BASENAME}.mp4"
JPG_OUT="${OUTPUT_DIR}/${BASENAME}-poster.jpg"

echo "→ Input:  $INPUT"
echo "→ Output: $OUTPUT_DIR"
echo

# ── Re-encode the scrub-friendly MP4 ────────────────────────────────────────
# yuv420p + even dimensions are required for broad browser playback (Safari
# in particular refuses high-bit-depth or odd-sized H.264 streams).
ffmpeg -y -i "$INPUT" \
  -vf "scale=640:360:flags=lanczos,format=yuv420p" \
  -c:v libx264 \
  -preset medium \
  -crf 28 \
  -g 1 \
  -bf 0 \
  -pix_fmt yuv420p \
  -an \
  -movflags +faststart \
  "$MP4_OUT"

# ── Extract poster JPG at ~0.5s in, scaled to 1280px wide ───────────────────
# 1280 wide is plenty for a desktop hero on a 2x display, and Next/Image will
# downscale further when generating srcset candidates.
ffmpeg -y -i "$INPUT" \
  -ss 0.5 \
  -frames:v 1 \
  -vf "scale=1280:-2:flags=lanczos" \
  -q:v 3 \
  "$JPG_OUT"

# ── Report final sizes ───────────────────────────────────────────────────────
echo
echo "✓ Done. Final files:"
if [[ -f "$MP4_OUT" ]]; then
  mp4_bytes=$(wc -c <"$MP4_OUT" | tr -d ' ')
  mp4_kb=$((mp4_bytes / 1024))
  mp4_dur=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$MP4_OUT" 2>/dev/null || echo "n/a")
  printf "  %-44s %8d KB   duration=%ss\n" "$MP4_OUT" "$mp4_kb" "$mp4_dur"
fi
if [[ -f "$JPG_OUT" ]]; then
  jpg_bytes=$(wc -c <"$JPG_OUT" | tr -d ' ')
  jpg_kb=$((jpg_bytes / 1024))
  jpg_dims=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "$JPG_OUT" 2>/dev/null || echo "?x?")
  printf "  %-44s %8d KB   %s\n" "$JPG_OUT" "$jpg_kb" "$jpg_dims"
fi
