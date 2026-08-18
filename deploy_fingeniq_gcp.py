import os
import shutil
import tarfile
import subprocess
import time

REMOTE_IP = "136.85.114.150"
REMOTE_USER = "sathishbadri2015"
REMOTE_HOST = f"{REMOTE_USER}@{REMOTE_IP}"
SSH_KEY = r"C:\Users\daarv\.ssh\id_ed25519"
ARCHIVE_NAME = "fingeniq_gcp.tar.gz"
REMOTE_DIR = f"/home/{REMOTE_USER}/fingeniq"

STANDALONE_DIR = "./.next/standalone"
STATIC_DIR = "./.next/static"
PUBLIC_DIR = "./public"

SSH_OPTS = [
    "-o", "StrictHostKeyChecking=no",
    "-i", SSH_KEY
]

def package_fingeniq():
    print("\n[1/4] Preparing FinGenIQ standalone package...")
    if not os.path.exists(STANDALONE_DIR):
        print("Error: .next/standalone does not exist yet.")
        return False

    dest_public = os.path.join(STANDALONE_DIR, "public")
    if os.path.exists(dest_public):
        shutil.rmtree(dest_public)
    if os.path.exists(PUBLIC_DIR):
        shutil.copytree(PUBLIC_DIR, dest_public)
        print("  + Copied public assets")

    dest_static = os.path.join(STANDALONE_DIR, ".next", "static")
    if os.path.exists(dest_static):
        shutil.rmtree(dest_static)
    if os.path.exists(STATIC_DIR):
        shutil.copytree(STATIC_DIR, dest_static)
        print("  + Copied static CSS/JS assets")

    # If Lessons exists, copy Lessons into standalone
    if os.path.exists("./Lessons"):
        dest_lessons = os.path.join(STANDALONE_DIR, "Lessons")
        if os.path.exists(dest_lessons):
            shutil.rmtree(dest_lessons)
        shutil.copytree("./Lessons", dest_lessons)
        print("  + Copied Lessons directory")

    if os.path.exists(ARCHIVE_NAME):
        os.remove(ARCHIVE_NAME)

    print(f"\n[2/4] Packaging into {ARCHIVE_NAME}...")
    with tarfile.open(ARCHIVE_NAME, "w:gz") as tar:
        for item in os.listdir(STANDALONE_DIR):
            full_path = os.path.join(STANDALONE_DIR, item)
            tar.add(full_path, arcname=item)

    size_mb = os.path.getsize(ARCHIVE_NAME) / (1024 * 1024)
    print(f"-> Archive created: {ARCHIVE_NAME} ({size_mb:.2f} MB)")
    return True

def deploy_remote():
    print("\n[3/4] Uploading FinGenIQ package to GCP VM...")
    subprocess.run(["ssh"] + SSH_OPTS + [REMOTE_HOST, f"mkdir -p {REMOTE_DIR}"], check=True)
    scp_cmd = ["scp"] + SSH_OPTS + [ARCHIVE_NAME, f"{REMOTE_HOST}:{REMOTE_DIR}/{ARCHIVE_NAME}"]
    res = subprocess.run(scp_cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"SCP failed: {res.stderr}")
        return False
    print("-> Upload complete.")

    print("\n[4/4] Extracting and starting FinGenIQ server on port 3001...")
    remote_cmd = (
        f"cd {REMOTE_DIR} && "
        f"tar -xzf {ARCHIVE_NAME} && "
        f"rm -f {ARCHIVE_NAME} && "
        f"export NVM_DIR=\"$HOME/.nvm\" && "
        f"[ -s \"$NVM_DIR/nvm.sh\" ] && \\. \"$NVM_DIR/nvm.sh\" && "
        f"pkill -f 'PORT=3001 node server.js' 2>/dev/null || true && "
        f"PORT=3001 nohup node server.js > fingeniq.log 2>&1 & "
        f"sleep 3 && "
        f"ps aux | grep 'server.js' | grep -v grep || true && "
        f"curl -s -o /dev/null -w 'FinGenIQ HTTP Code: %{{http_code}}\\n' http://127.0.0.1:3001/ || true"
    )
    res = subprocess.run(["ssh"] + SSH_OPTS + [REMOTE_HOST, remote_cmd], capture_output=True, text=True)
    print(res.stdout)
    return True

def main():
    print("=" * 60)
    print("Deploying FinGenIQ to GCP Compute Engine (136.85.114.150:3001)")
    print("=" * 60)
    if package_fingeniq():
        deploy_remote()

if __name__ == "__main__":
    main()
