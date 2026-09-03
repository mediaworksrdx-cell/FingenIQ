#!/usr/bin/env bash
# ==============================================================================
# MASTER PROVISIONING & START SCRIPT FOR ALL 3 PLATFORMS ON GCP VM
# Platforms:
#   1. Aarkaa AI (Backend 5000, Frontend 3000) -> aarka-ai.com
#   2. FinGenIQ (LMS 3001)                     -> fingeniq.com
#   3. Synthetix Analytics (Frontend 3002)      -> synthetixanalytics.com
# ==============================================================================

set -e

echo ==========================================================
echo  Starting Full Setup for FinGenIQ, Aarkaa AI & Synthetix 
echo ==========================================================

USER_HOME=$HOME
NODE_VERSION=20.18.0

# 1. Update OS packages & install basic requirements
echo -e \n[1/6] Installing OS dependencies (Nginx, Python, Certbot, build tools)...
sudo apt-get update -y
sudo apt-get install -y nginx certbot python3-certbot-nginx python3-pip python3-venv curl wget git build-essential screen

# 2. Install Node.js via NVM & PM2
echo -e \n[2/6] Setting up Node.js & PM2...
export NVM_DIR=$USER_HOME/.nvm
if [ ! -d $NVM_DIR ]; then
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
fi
[ -s $NVM_DIR/nvm.sh ] && \. $NVM_DIR/nvm.sh
nvm install $NODE_VERSION
nvm use $NODE_VERSION
nvm alias default $NODE_VERSION

npm install -g pm2

# 3. Create target directories
echo -e \n[3/6] Setting up workspace directories...
mkdir -p $USER_HOME/fingeniq
mkdir -p $USER_HOME/aarka-frontend
mkdir -p $USER_HOME/synthetix-site
mkdir -p $USER_HOME/aarkaai3b

# 4. Setup Python Virtual Environment for FastAPI Backend
echo -e \n[4/6] Setting up Python venv for Aarkaa AI Backend...
if [ ! -d $USER_HOME/aarkaai3b/venv ]; then
    python3 -m venv $USER_HOME/aarkaai3b/venv
fi
$USER_HOME/aarkaai3b/venv/bin/pip install --upgrade pip
if [ -f $USER_HOME/aarkaai3b/requirements.txt ]; then
    $USER_HOME/aarkaai3b/venv/bin/pip install -r $USER_HOME/aarkaai3b/requirements.txt
fi

# 5. Build/Configure SQLite & Modules for FinGenIQ
if [ -d $USER_HOME/fingeniq ]; then
    cd $USER_HOME/fingeniq
    npm rebuild better-sqlite3 2>/dev/null || npm install better-sqlite3 --no-save 2>/dev/null || true
    if [ -d node_modules ]; then
        cd node_modules
        for h in $(grep -roh 'better-sqlite3-[a-f0-9]*' ../.next/ 2>/dev/null | sort -u); do
            ln -sf better-sqlite3 $h 2>/dev/null || true
        done
        cd ..
    fi
fi

# 6. Configure PM2 for all nodes
echo -e \n[5/6] Starting PM2 processes...
pm2 delete all 2>/dev/null || true

# (A) FinGenIQ (3001)
if [ -f $USER_HOME/fingeniq/server.js ]; then
    cd $USER_HOME/fingeniq
    PORT=3001 NODE_ENV=production pm2 start server.js --name fingeniq
fi

# (B) Aarkaa Frontend (3000)
if [ -d $USER_HOME/aarka-frontend ] && [ -f $USER_HOME/aarka-frontend/package.json ]; then
    cd $USER_HOME/aarka-frontend
    PORT=3000 pm2 start npm --name aarka-frontend -- start
fi

# (C) Synthetix Frontend (3002)
if [ -d $USER_HOME/synthetix-site ] && [ -f $USER_HOME/synthetix-site/package.json ]; then
    cd $USER_HOME/synthetix-site
    PORT=3002 pm2 start npm --name synthetix-frontend -- start
fi

# (D) Aarkaa AI Backend (5000)
if [ -f $USER_HOME/aarkaai3b/main.py ]; then
    cd $USER_HOME/aarkaai3b
    pm2 start $USER_HOME/aarkaai3b/venv/bin/uvicorn --name aarka-backend -- main:app --host 0.0.0.0 --port 5000
fi

pm2 save
sudo env PATH=$PATH:$USER_HOME/.nvm/versions/node/$(nvm current)/bin $(which pm2) startup systemd -u $USER --hp $USER_HOME 2>/dev/null || true

# 7. Apply Nginx Configuration
echo -e \n[6/6] Applying Nginx config...
if [ -f $USER_HOME/nginx_prod_all.conf ]; then
    sudo cp $USER_HOME/nginx_prod_all.conf /etc/nginx/sites-available/default
    sudo cp $USER_HOME/nginx_prod_all.conf /etc/nginx/conf.d/default.conf 2>/dev/null || true
    sudo nginx -t && sudo systemctl restart nginx
fi

echo -e \n==========================================================
echo  All services provisioned and started! 
echo ==========================================================
pm2 list
