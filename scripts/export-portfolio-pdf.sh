#!/usr/bin/env bash
# Exports every portfolio print view (and the combined one) to PDF with headless Chromium.
# Usage: scripts/export-portfolio-pdf.sh [base-url] [out-dir]
# CHROME can point at any Chromium/Chrome binary; defaults to Playwright's cached headless shell.
set -euo pipefail

BASE_URL="${1:-http://localhost:3000}"
OUT_DIR="${2:-./portfolio-pdf}"
CHROME="${CHROME:-$(ls -d "$HOME"/Library/Caches/ms-playwright/chromium_headless_shell-*/chrome-headless-shell-*/chrome-headless-shell 2>/dev/null | tail -1)}"

if [[ -z "$CHROME" || ! -x "$CHROME" ]]; then
  echo "Chromium not found. Set CHROME=/path/to/chrome" >&2
  exit 1
fi

mkdir -p "$OUT_DIR"
slugs=$(sed -n "s/^  slug: '\(.*\)',$/\1/p" src/domain/portfolio/data/*.ts)

print_pdf() {
  "$CHROME" --headless --no-pdf-header-footer --virtual-time-budget=8000 --print-to-pdf="$2" "$1" >/dev/null 2>&1
  echo "$2"
}

for slug in $slugs; do
  print_pdf "$BASE_URL/portfolio/$slug/print" "$OUT_DIR/$slug.pdf"
done
print_pdf "$BASE_URL/portfolio/print" "$OUT_DIR/portfolio.pdf"
