#!/bin/bash
# Doppelklick: immer dieses Repo, sauberer .next, Port 3000 frei.
set -e
cd "$(dirname "$0")"
echo ""
echo "=== ScanDesk (sicherer Start) ==="
echo "Ordner: $(pwd -P)"
echo ""
exec node scripts/dev.cjs --clean
