#!/bin/sh
mkdir -p /app/data
if [ ! -s /app/data/cierres.json ]; then
  cp -a /seed/. /app/data/ 2>/dev/null || true
fi
exec python3 /app/server.py
