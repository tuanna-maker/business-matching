#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

# Load shared environment variables from repo root.
if [[ -f ".env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source ".env"
  set +a
fi

MODE="${1:-api}"

case "$MODE" in
  api)
    pnpm --filter api build
    pnpm --filter api start
    ;;
  web)
    pnpm --filter iec-hub-v4 build
    pnpm --filter iec-hub-v4 start
    ;;
  *)
    echo "Usage: ./run.sh [api|web]"
    exit 1
    ;;
esac
