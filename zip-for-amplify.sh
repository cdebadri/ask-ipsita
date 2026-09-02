#!/usr/bin/env bash
# Zips this site for AWS Amplify's manual "Deploy without Git provider" flow.
# Amplify expects index.html at the zip root, so we cd into the project dir
# and zip its contents directly (not the folder itself).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT="${1:-$SCRIPT_DIR/build/website.zip}"

cd "$SCRIPT_DIR"
mkdir -p "$(dirname "$OUTPUT")"
rm -f "$OUTPUT"

zip -r "$OUTPUT" . \
  -x ".claude/*" \
  -x ".git/*" \
  -x "tests/*" \
  -x "node_modules/*" \
  -x "build/*" \
  -x "*.md" \
  -x "*.zip" \
  -x "zip-for-amplify.sh" \
  -x ".gitignore" \
  -x ".DS_Store" \
  -x "**/.DS_Store"

echo ""
echo "Amplify-ready zip created at: $OUTPUT"
unzip -l "$OUTPUT"
