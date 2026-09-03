import os
import tarfile
import subprocess
import time
import sys

SSH_KEY = r'C:\Users\daarv\.ssh\id_ed25519'
HOST = 'mediaworksr@35.225.45.190'
SSH_OPTS = ['-o', 'StrictHostKeyChecking=no', '-i', SSH_KEY]

archive_path = r'C:\Users\daarv\.gemini\antigravity\scratch\clean_sync_3_platforms.tar.gz'

print('===========================================================')
print(' Clean Sync for 3 Platforms from Scratch Directory:')
print('   1. FinGenIQ')
print('   2. Synthetix Site')
print('   3. Aarkaa AI 3B')
print('===========================================================')

def exclude_filter(tarinfo):
    name = tarinfo.name
    for exc in ['node_modules', 'venv', '.git', '__pycache__']:
        if f'/{exc}/' in name or name.endswith(f'/{exc}') or name.startswith(f'{exc}/') or name == exc:
            return None
    return tarinfo

print('[Step 1/4] Creating clean tar archive...')
if os.path.exists(archive_path):
    os.remove(archive_path)

with tarfile.open(archive_path, 'w:gz') as tar:
    print('  + Adding FinGenIQ...')
    tar.add(r'C:\Users\daarv\.gemini\antigravity\scratch\FinGenIQ', arcname='fingeniq', filter=exclude_filter)
    
    print('  + Adding Synthetix Site...')
    tar.add(r'C:\Users\daarv\.gemini\antigravity\scratch\synthetix-site', arcname='synthetix-site', filter=exclude_filter)
    
    print('  + Adding Aarkaa AI 3B...')
    tar.add(r'C:\Users\daarv\.gemini\antigravity\scratch\aarkaai3b', arcname='aarkaai3b', filter=exclude_filter)

size_mb = os.path.getsize(archive_path) / (1024 * 1024)
print(f'-> Archive Created: {size_mb:.2f} MB')

print('[Step 2/4] Uploading archive to GCP VM...')
subprocess.run(['scp'] + SSH_OPTS + [archive_path, f'{HOST}:/home/mediaworksr/clean_sync_3_platforms.tar.gz'], check=True)
print('-> Upload Finished!')

print('[Step 3/4] Extracting archive and configuring on server...')
remote_script = (
    "cd /home/mediaworksr\n"
    "tar -xzf clean_sync_3_platforms.tar.gz\n"
    "rm -f clean_sync_3_platforms.tar.gz\n"
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

print('[Step 4/4] Verification of all 3 live platforms...')
sys.stdout.flush()
