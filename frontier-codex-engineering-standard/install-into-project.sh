#!/usr/bin/env bash
set -euo pipefail

SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR="${1:-}"

if [[ -z "$TARGET_DIR" ]]; then
  echo "Usage: ./install-into-project.sh /absolute/or/relative/project/path"
  exit 1
fi

mkdir -p "$TARGET_DIR"

for item in AGENTS.md docs templates; do
  cp -R "$SOURCE_DIR/$item" "$TARGET_DIR/"
done

if [[ ! -f "$TARGET_DIR/PROJECT_PROFILE.md" ]]; then
  cp "$SOURCE_DIR/PROJECT_PROFILE.md" "$TARGET_DIR/PROJECT_PROFILE.md"
else
  echo "Preserved existing PROJECT_PROFILE.md"
fi

echo "Engineering standard installed into: $TARGET_DIR"
echo "Next: customise PROJECT_PROFILE.md before assigning substantial Codex work."
