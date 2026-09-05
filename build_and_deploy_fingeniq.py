import os
import tarfile
import subprocess
import time

SSH_KEY = r'C:\Users\daarv\.ssh\id_ed25519'
HOST = 'mediaworksr@35.225.45.190'
SSH_OPTS = ['-o', 'StrictHostKeyChecking=no', '-i', SSH_KEY]

archive_path = r'C:\Users\daarv\.gemini\antigravity\scratch\fingeniq_clean_src.tar.gz'

print('[1/4] Archiving FinGenIQ clean source files...')

def exclude_filter(tarinfo):
    name = tarinfo.name
    for exc in ['node_modules', '.next', '.git', '__pycache__', 'db.sqlite', 'fingeniq.db']:
        if f'/{exc}/' in name or name.endswith(f'/{exc}') or name.startswith(f'{exc}/') or name == exc:
            return None
    return tarinfo

with tarfile.open(archive_path, 'w:gz') as tar:
    tar.add(r'C:\Users\daarv\.gemini\antigravity\scratch\FinGenIQ', arcname='fingeniq', filter=exclude_filter)

print('[2/4] Uploading clean source to server...')
subprocess.run(['scp'] + SSH_OPTS + [archive_path, f'{HOST}:/home/mediaworksr/fingeniq_clean_src.tar.gz'], check=True)

print('[3/4] Extracting, compiling Next.js build natively, and re-linking modules on server...')
build_script = (
    "cd /home/mediaworksr\n"
    "tar -xzf fingeniq_clean_src.tar.gz\n"
    "rm -f fingeniq_clean_src.tar.gz\n"
    "cd /home/mediaworksr/fingeniq\n"
    ". /home/mediaworksr/.nvm/nvm.sh\n"
    "npm run build\n"
    "cp -f .next/standalone/server.js ./server.js 2>/dev/null || true\n"
    "cd /home/mediaworksr/fingeniq/node_modules\n"
    "ln -sf better-sqlite3 better-sqlite3-90e2652d1716b047 2>/dev/null || true\n"
    "for h in $(grep -roh 'better-sqlite3-[a-f0-9]*' ../.next/ 2>/dev/null | sort -u); do\n"
    "    ln -sf better-sqlite3 \"$h\" 2>/dev/null || true\n"
    "done\n"
    "pm2 restart fingeniq\n"
    "sleep 2\n"
    "pm2 list\n"
)

subprocess.run(['ssh'] + SSH_OPTS + [HOST, build_script], check=True)
print('[4/4] Clean production build complete and restarted!')
