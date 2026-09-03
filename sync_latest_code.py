import os
import tarfile
import subprocess
import time

SSH_KEY = r'C:\Users\daarv\.ssh\id_ed25519'
HOST = 'mediaworksr@35.225.45.190'
SSH_OPTS = ['-o', 'StrictHostKeyChecking=no', '-i', SSH_KEY]

archive_path = r'C:\Users\daarv\.gemini\antigravity\scratch\latest_sync.tar.gz'

print('[1/4] Packaging latest local files from all 3 platforms...')

def should_exclude(tarinfo):
    name = tarinfo.name
    excluded = ['node_modules', 'venv', '.next', '.git', '__pycache__', '.pytest_cache', 'chroma_db', 'dist', 'out']
    for exc in excluded:
        if f'/{exc}/' in name or name.endswith(f'/{exc}') or name.startswith(f'{exc}/') or name == exc:
            return None
    return tarinfo

with tarfile.open(archive_path, 'w:gz') as tar:
    tar.add(r'C:\Users\daarv\.gemini\antigravity\scratch\FinGenIQ', arcname='fingeniq', filter=should_exclude)
    tar.add(r'C:\Users\daarv\.gemini\antigravity\scratch\aarkaai3b', arcname='aarkaai3b', filter=should_exclude)
    tar.add(r'C:\Users\daarv\.gemini\antigravity\scratch\synthetix-site', arcname='synthetix-site', filter=should_exclude)

archive_size_mb = os.path.getsize(archive_path) / (1024 * 1024)
print(f'-> Archive created: {archive_size_mb:.2f} MB')

print('[2/4] Uploading latest files to GCP VM...')
subprocess.run(['scp'] + SSH_OPTS + [archive_path, f'{HOST}:/home/mediaworksr/latest_sync.tar.gz'], check=True)
print('-> Upload finished!')

print('[3/4] Extracting and updating files on remote VM...')
remote_script = (
    "cd /home/mediaworksr\n"
    "tar -xzf latest_sync.tar.gz\n"
    "rm -f latest_sync.tar.gz\n"
    "chmod -R 755 /home/mediaworksr/fingeniq /home/mediaworksr/aarkaai3b /home/mediaworksr/synthetix-site\n"
    "chmod -R +x /home/mediaworksr/aarkaai3b/frontend/node_modules/.bin 2>/dev/null || true\n"
    "chmod -R +x /home/mediaworksr/synthetix-site/node_modules/.bin 2>/dev/null || true\n"
    "chmod -R +x /home/mediaworksr/fingeniq/node_modules/.bin 2>/dev/null || true\n"
    "cd /home/mediaworksr/fingeniq/node_modules\n"
    "ln -sf better-sqlite3 better-sqlite3-90e2652d1716b047 2>/dev/null || true\n"
    ". /home/mediaworksr/.nvm/nvm.sh\n"
    "pm2 restart all\n"
    "pm2 save\n"
    "sleep 3\n"
    "pm2 list\n"
)

subprocess.run(['ssh'] + SSH_OPTS + [HOST, remote_script], check=True)
print('[4/4] All latest files synced and services restarted successfully!')
