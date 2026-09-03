import os
import tarfile
import subprocess
import time

SSH_KEY = r'C:\Users\daarv\.ssh\id_ed25519'
HOST = 'mediaworksr@35.225.45.190'
SSH_OPTS = ['-o', 'StrictHostKeyChecking=no', '-i', SSH_KEY]

archive_path = r'C:\Users\daarv\.gemini\antigravity\scratch\sync_3_platforms.tar.gz'

print('=====================================================')
print(' Uploading ONLY 3 Platforms:')
print('  1. FinGenIQ       (fingeniq.com)')
print('  2. Synthetix Site (synthetixanalytics.com)')
print('  3. Aarkaa AI 3B   (aarka-ai.com)')
print('=====================================================')

def exclude_filter(tarinfo):
    name = tarinfo.name
    # Exclude system node_modules and virtualenv as they are Linux-specific
    for exc in ['node_modules', 'venv', '.git', '__pycache__']:
        if f'/{exc}/' in name or name.endswith(f'/{exc}') or name.startswith(f'{exc}/') or name == exc:
            return None
    return tarinfo

print('[1/4] Archiving FinGenIQ, Synthetix, and Aarkaa AI...')
with tarfile.open(archive_path, 'w:gz') as tar:
    print('  + Adding FinGenIQ...')
    tar.add(r'C:\Users\daarv\.gemini\antigravity\scratch\FinGenIQ', arcname='fingeniq', filter=exclude_filter)
    
    print('  + Adding Synthetix Site...')
    tar.add(r'C:\Users\daarv\.gemini\antigravity\scratch\synthetix-site', arcname='synthetix-site', filter=exclude_filter)
    
    print('  + Adding Aarkaa AI 3B...')
    tar.add(r'C:\Users\daarv\.gemini\antigravity\scratch\aarkaai3b', arcname='aarkaai3b', filter=exclude_filter)

size_mb = os.path.getsize(archive_path) / (1024 * 1024)
print(f'-> Archive created: {size_mb:.2f} MB')

print('[2/4] Uploading to Google Cloud VM (35.225.45.190)...')
subprocess.run(['scp'] + SSH_OPTS + [archive_path, f'{HOST}:/home/mediaworksr/sync_3_platforms.tar.gz'], check=True)
print('-> Upload complete!')

print('[3/4] Extracting and updating files on server...')
remote_commands = (
    "cd /home/mediaworksr\n"
    "tar -xzf sync_3_platforms.tar.gz\n"
    "rm -f sync_3_platforms.tar.gz\n"
    "chmod -R 755 /home/mediaworksr/fingeniq /home/mediaworksr/aarkaai3b /home/mediaworksr/synthetix-site\n"
    "chmod -R +x /home/mediaworksr/aarkaai3b/frontend/node_modules/.bin 2>/dev/null || true\n"
    "chmod -R +x /home/mediaworksr/synthetix-site/node_modules/.bin 2>/dev/null || true\n"
    "chmod -R +x /home/mediaworksr/fingeniq/node_modules/.bin 2>/dev/null || true\n"
    "cd /home/mediaworksr/fingeniq/node_modules\n"
    "ln -sf better-sqlite3 better-sqlite3-90e2652d1716b047 2>/dev/null || true\n"
    "for h in $(grep -roh 'better-sqlite3-[a-f0-9]*' ../.next/ 2>/dev/null | sort -u); do\n"
    "    ln -sf better-sqlite3 \"$h\" 2>/dev/null || true\n"
    "done\n"
    ". /home/mediaworksr/.nvm/nvm.sh\n"
    "pm2 restart all\n"
    "pm2 save\n"
    "sleep 2\n"
    "pm2 list\n"
)

subprocess.run(['ssh'] + SSH_OPTS + [HOST, remote_commands], check=True)
print('[4/4] Restart complete! All 3 platforms are updated.')
