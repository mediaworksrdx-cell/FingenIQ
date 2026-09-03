import os
import tarfile
import subprocess
import time

SSH_KEY = r'C:\Users\daarv\.ssh\id_ed25519'
HOST = 'mediaworksr@35.225.45.190'
SSH_OPTS = ['-o', 'StrictHostKeyChecking=no', '-i', SSH_KEY]

archive_path = r'C:\Users\daarv\.gemini\antigravity\scratch\fingeniq_fresh_build.tar.gz'

print('[1/4] Archiving freshly compiled FinGenIQ (with clean .next build)...')

def exclude_filter(tarinfo):
    name = tarinfo.name
    for exc in ['node_modules', '.git', '__pycache__', '.next/cache']:
        if f'/{exc}/' in name or name.endswith(f'/{exc}') or name.startswith(f'{exc}/') or name == exc:
            return None
    return tarinfo

with tarfile.open(archive_path, 'w:gz') as tar:
    tar.add(r'C:\Users\daarv\.gemini\antigravity\scratch\FinGenIQ', arcname='fingeniq', filter=exclude_filter)

size_mb = os.path.getsize(archive_path) / (1024 * 1024)
print(f'-> Archive Size: {size_mb:.2f} MB')

print('[2/4] Uploading fresh build to GCP VM...')
subprocess.run(['scp'] + SSH_OPTS + [archive_path, f'{HOST}:/home/mediaworksr/fingeniq_fresh_build.tar.gz'], check=True)

print('[3/4] Extracting on server and linking SQLite...')
remote_script = (
    "cd /home/mediaworksr\n"
    "tar -xzf fingeniq_fresh_build.tar.gz\n"
    "rm -f fingeniq_fresh_build.tar.gz\n"
    "chmod -R 755 /home/mediaworksr/fingeniq\n"
    "chmod -R +x /home/mediaworksr/fingeniq/node_modules/.bin 2>/dev/null || true\n"
    "cd /home/mediaworksr/fingeniq/node_modules\n"
    "ln -sf better-sqlite3 better-sqlite3-90e2652d1716b047 2>/dev/null || true\n"
    "for h in $(grep -roh 'better-sqlite3-[a-f0-9]*' ../.next/ 2>/dev/null | sort -u); do\n"
    "    ln -sf better-sqlite3 \"$h\" 2>/dev/null || true\n"
    "done\n"
    ". /home/mediaworksr/.nvm/nvm.sh\n"
    "pm2 restart fingeniq\n"
    "pm2 save\n"
    "sleep 2\n"
    "pm2 list\n"
)

subprocess.run(['ssh'] + SSH_OPTS + [HOST, remote_script], check=True)
print('[4/4] Successfully deployed clean build to live server!')
