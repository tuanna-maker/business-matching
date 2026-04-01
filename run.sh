#!/usr/bin/env bash
set -euo pipefail

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
