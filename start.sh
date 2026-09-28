#!/bin/sh
cd "$(dirname "$0")/brand"
exec python3 server.py
