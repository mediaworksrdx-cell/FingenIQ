#!/bin/bash
set -e
export NVM_DIR= C:\Users\daarv/.nvm
if [ ! -d  ]; then
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
fi
[ -s /nvm.sh ] && \. /nvm.sh
nvm install 20.18.0
nvm use 20.18.0
nvm alias default 20.18.0
npm install -g pm2

cd /home/mediaworksr/fingeniq
(npm rebuild better-sqlite3 2>/dev/null || npm install better-sqlite3 --no-save 2>/dev/null || true)

pm2 delete all 2>/dev/null || true
PORT=3001 NODE_ENV=production pm2 start server.js --name fingeniq
pm2 save
sleep 3
pm2 list
curl -sI http://127.0.0.1:3001/ | head -n 10 || true
