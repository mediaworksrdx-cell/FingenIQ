import subprocess

SSH_KEY = r'C:\Users\daarv\.ssh\id_ed25519'
HOST = 'mediaworksr@35.225.45.190'
SSH_OPTS = ['-o', 'StrictHostKeyChecking=no', '-i', SSH_KEY]

script = r'''#!/bin/bash
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
'''

with open('execute_setup.sh', 'w', newline='\n') as f:
    f.write(script)

print('Uploading execute_setup.sh...')
subprocess.run(['scp'] + SSH_OPTS + ['execute_setup.sh', f'{HOST}:/home/mediaworksr/execute_setup.sh'], check=True)
print('Running setup script on VM...')
subprocess.run(['ssh'] + SSH_OPTS + [HOST, 'bash /home/mediaworksr/execute_setup.sh'])