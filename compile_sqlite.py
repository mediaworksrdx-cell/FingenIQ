import subprocess

SSH_KEY = r'C:\Users\daarv\.ssh\id_ed25519'
HOST = 'mediaworksr@35.225.45.190'
SSH_OPTS = ['-o', 'StrictHostKeyChecking=no', '-i', SSH_KEY]

cmd = (
    "sudo apt-get update\n"
    "sudo apt-get install -y build-essential python3-dev\n"
    ". /home/mediaworksr/.nvm/nvm.sh\n"
    "cd /home/mediaworksr/fingeniq\n"
    "rm -rf node_modules/better-sqlite3\n"
    "npm install better-sqlite3 --build-from-source\n"
    "cd /home/mediaworksr/fingeniq/node_modules\n"
    "ln -sf better-sqlite3 better-sqlite3-90e2652d1716b047\n"
    "cd /home/mediaworksr/fingeniq\n"
    "pm2 restart fingeniq\n"
    "sleep 3\n"
    "curl -sI http://127.0.0.1:3001/admin/login | head -n 10\n"
)

subprocess.run(['ssh'] + SSH_OPTS + [HOST, cmd], check=True)
print('Compilation & restart completed successfully!')
