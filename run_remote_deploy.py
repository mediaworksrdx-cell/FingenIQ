import subprocess
import os

SSH_KEY = r'C:\Users\daarv\.ssh\id_ed25519'
HOST = 'mediaworksr@35.225.45.190'
SSH_OPTS = ['-o', 'StrictHostKeyChecking=no', '-i', SSH_KEY]

script_lines = [
    #!/bin/bash,
    set -e,
    echo '=== [1/4] Installing NVM, Node.js 20 & PM2 ===',
    export NVM_DIR="C:\Users\daarv/.nvm",
    if [ ! -d "" ]; then,
     curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash,
    fi,
    [ -s "/nvm.sh" ] && \\. "/nvm.sh",
    nvm install 20.18.0,
    nvm use 20.18.0,
    nvm alias default 20.18.0,
    npm install -g pm2,
    ",
 echo 'Node version:' v24.14.0,
 echo 'PM2 version:' ,
 ,
 echo '=== [2/4] Setting up FinGenIQ (Port 3001) ===',
 cd /home/mediaworksr/fingeniq,
 (npm rebuild better-sqlite3 2>/dev/null || npm install better-sqlite3 --no-save 2>/dev/null || true),
 ,
 echo '=== [3/4] Setting up Synthetix (Port 3002) ===',
 cd /home/mediaworksr/synthetix-site,
 (npm install --production --no-save 2>/dev/null || true),
 ,
 echo '=== [4/4] Starting All Services via PM2 ===',
 pm2 delete all 2>/dev/null || true,
 ,
 # 1. FinGenIQ LMS (3001),
 cd /home/mediaworksr/fingeniq,
 if [ -f server.js ]; then,
     PORT=3001 NODE_ENV=production pm2 start server.js --name fingeniq,
 elif [ -f node_modules/next/dist/bin/next ]; then,
     PORT=3001 NODE_ENV=production pm2 start npm --name fingeniq -- start -- -p 3001,
 fi,
 ,
 # 2. Synthetix Frontend (3002),
 cd /home/mediaworksr/synthetix-site,
 if [ -f node_modules/next/dist/bin/next ]; then,
     PORT=3002 pm2 start npm --name synthetix-frontend -- start -- -p 3002,
 fi,
 ,
 pm2 save,
 pm2 list,
 ,
 echo '=== Testing Local Ports ===',
 sleep 3,
 curl -sI http://127.0.0.1:3001/ | head -n 5 || true,
 curl -sI http://127.0.0.1:3002/ | head -n 5 || true,
]

with open('execute_setup.sh', 'w', newline='\n') as f:
 f.write('\n'.join(script_lines) + '\n')

print('Uploading execute_setup.sh to VM...')
subprocess.run(['scp'] + SSH_OPTS + ['execute_setup.sh', f'{HOST}:/home/mediaworksr/execute_setup.sh'], check=True)

print('Running setup on VM...')
subprocess.run(['ssh'] + SSH_OPTS + [HOST, 'bash /home/mediaworksr/execute_setup.sh'])
