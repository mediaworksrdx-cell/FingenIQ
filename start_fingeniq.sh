#!/usr/bin/env bash
set -e

APP_DIR="$HOME/fingeniq"
cd "$APP_DIR"

echo "Extracting fingeniq package..."
if [ -f "fingeniq_gcp.tar.gz" ]; then
    tar -xzf fingeniq_gcp.tar.gz
    rm -f fingeniq_gcp.tar.gz
fi

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

echo "Node version: $(node -v)"

# Stop any running fingeniq on port 3001
pkill -f "PORT=3001 node server.js" 2>/dev/null || true
sleep 1

echo "Starting FinGenIQ standalone server on port 3001..."
PORT=3001 nohup node server.js > fingeniq.log 2>&1 &

sleep 3
echo "Checking running process..."
ps aux | grep "server.js" | grep -v grep || true

echo ""
echo "Testing local endpoint on port 3001..."
curl -s -o /dev/null -w "FinGenIQ HTTP Response Code: %{http_code}\n" http://127.0.0.1:3001/ || true
