import os
import shutil
import tarfile
import subprocess
import time
import sys

REMOTE_IP = 35.225.45.190
POSSIBLE_USERS = [sathishbadri2015, ubuntu, daarv]
SSH_KEY = rC:\Users\daarv\.ssh\id_ed25519

SSH_OPTS = [
    -o, StrictHostKeyChecking=no,
    -o, ConnectTimeout=10,
    -i, SSH_KEY
]

def find_active_user():
    print(f\n[+] Testing SSH connectivity to {REMOTE_IP}...)
    for u in POSSIBLE_USERS:
        res = subprocess.run([ssh] + SSH_OPTS + [f{u}@{REMOTE_IP}, echo SSH_OK], capture_output=True, text=True)
        if res.returncode == 0 and SSH_OK in res.stdout:
            print(f -> Connected successfully as user: {u})
            return u
    return None

def package_fingeniq():
    print(\n[1/3] Packaging FinGenIQ...)
    standalone_dir = ./.next/standalone
    if not os.path.exists(standalone_dir):
        print( ! Error: .next/standalone not found. Run npm run build first.)
        return False
    
    # Copy public and static assets into standalone
    if os.path.exists(./public):
        shutil.copytree(./public, os.path.join(standalone_dir, public), dirs_exist_ok=True)
    if os.path.exists(./.next/static):
        shutil.copytree(./.next/static, os.path.join(standalone_dir, .next, static), dirs_exist_ok=True)
    if os.path.exists(./Lessons):
        shutil.copytree(./Lessons, os.path.join(standalone_dir, Lessons), dirs_exist_ok=True)
    if os.path.exists(./src/lib/schema.sql):
        os.makedirs(os.path.join(standalone_dir, src, lib), exist_ok=True)
        shutil.copy2(./src/lib/schema.sql, os.path.join(standalone_dir, src, lib, schema.sql))
    
    archive_name = fingeniq_gcp.tar.gz
    with tarfile.open(archive_name, w:gz) as tar:
        for item in os.listdir(standalone_dir):
            tar.add(os.path.join(standalone_dir, item), arcname=item)
    print(f -> Created {archive_name} ({os.path.getsize(archive_name)/(1024*1024):.2f} MB))
    return archive_name

def deploy_all(user):
    remote_host = f{user}@{REMOTE_IP}
    remote_home = f/home/{user}
    
    print(\n[2/3] Uploading configs and packages to GCP VM...)
    subprocess.run([ssh] + SSH_OPTS + [remote_host, fmkdir -p {remote_home}/fingeniq {remote_home}/aarkaai3b {remote_home}/synthetix-site], check=True)
    
    # 1. Upload Nginx config
    subprocess.run([scp] + SSH_OPTS + [nginx_prod_all.conf, f{remote_host}:{remote_home}/nginx_prod_all.conf], check=True)
    
    # 2. Upload setup script
    subprocess.run([scp] + SSH_OPTS + [setup_vm_all_services.sh, f{remote_host}:{remote_home}/setup_vm_all_services.sh], check=True)
    
    # 3. Upload FinGenIQ
    subprocess.run([scp] + SSH_OPTS + [fingeniq_gcp.tar.gz, f{remote_host}:{remote_home}/fingeniq/fingeniq_gcp.tar.gz], check=True)
    
    print(\n[3/3] Executing automated server setup and starting all services...)
    remote_exec = (
        fcd {remote_home}/fingeniq && tar -xzf fingeniq_gcp.tar.gz && rm -f fingeniq_gcp.tar.gz && 
        fchmod +x {remote_home}/setup_vm_all_services.sh && 
        fbash {remote_home}/setup_vm_all_services.sh
    )
    subprocess.run([ssh] + SSH_OPTS + [remote_host, remote_exec])

def main():
    print(= * 60)
    print(f Master GCP Deployment Suite -> {REMOTE_IP})
    print(= * 60)
    
    user = find_active_user()
    if not user:
        print(\n[!] SSH key not authorized yet.)
        print(fPlease add your public key from C:\\Users\\daarv\\.ssh\\id_ed25519.pub to the GCP VM instance.)
        return
    
    if package_fingeniq():
        deploy_all(user)
        print(\n Deployment execution completed.)

if __name__ == __main__:
    main()
