#!/bin/bash
# NT CSR Training Portal — Master deployment script.
# Run this on the DigitalOcean droplet as root.
#
# Required env vars (export before running, or set in /root/.nt-csr-setup.env):
#   DUCKDNS_DOMAIN     e.g. "nt-csr-training"
#   DUCKDNS_TOKEN      from duckdns.org account
#   ANTHROPIC_API_KEY  from console.anthropic.com
#   JWT_SECRET         long random string (script will auto-generate if unset)
#   REPO_URL           git URL of the nt-csr-training repo
#
# This script is idempotent where reasonable — re-running should be safe.

set -e
set -o pipefail

# ----- Config -----
INSTALL_DIR="/opt/nt-csr-training"
SETUP_ENV="/root/.nt-csr-setup.env"
DOMAIN="nt-csr-training.duckdns.org"
DEPLOY_DIR="$INSTALL_DIR/deploy"

# ----- 1. Root check -----
if [ "$(id -u)" -ne 0 ]; then
  echo "ERROR: This script must be run as root." >&2
  exit 1
fi

# ----- 2. Load setup env file if present -----
if [ -f "$SETUP_ENV" ]; then
  echo "==> Loading setup vars from $SETUP_ENV"
  # shellcheck disable=SC1090
  source "$SETUP_ENV"
fi

# ----- 3. Validate required env vars -----
MISSING=""
[ -z "${DUCKDNS_DOMAIN:-}" ] && MISSING="$MISSING DUCKDNS_DOMAIN"
[ -z "${DUCKDNS_TOKEN:-}" ] && MISSING="$MISSING DUCKDNS_TOKEN"
[ -z "${ANTHROPIC_API_KEY:-}" ] && MISSING="$MISSING ANTHROPIC_API_KEY"
[ -z "${REPO_URL:-}" ] && MISSING="$MISSING REPO_URL"

if [ -n "$MISSING" ]; then
  echo "ERROR: Missing required env vars:$MISSING" >&2
  echo "Either export them or put them in $SETUP_ENV (KEY=value, one per line)." >&2
  exit 1
fi

# Auto-generate JWT_SECRET if not provided
if [ -z "${JWT_SECRET:-}" ]; then
  JWT_SECRET="$(openssl rand -hex 64)"
  echo "==> JWT_SECRET not provided — generated a new one."
fi

# ----- 4. Verify required tools are installed -----
echo "==> Verifying required tools (node, npm, pm2, nginx, git, dig)..."
for cmd in node npm pm2 nginx git dig; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "ERROR: '$cmd' not found. Install it before running this script." >&2
    exit 1
  fi
done

# ----- 5. Clone or pull the repo -----
if [ -d "$INSTALL_DIR/.git" ]; then
  echo "==> Repo already at $INSTALL_DIR — pulling latest."
  git -C "$INSTALL_DIR" fetch --all
  git -C "$INSTALL_DIR" pull --ff-only || {
    echo "ERROR: git pull failed. Resolve manually before continuing." >&2
    exit 1
  }
else
  echo "==> Cloning repo to $INSTALL_DIR"
  git clone "$REPO_URL" "$INSTALL_DIR"
fi

# Make sure deploy scripts are executable (in case git didn't preserve mode)
chmod +x "$DEPLOY_DIR"/*.sh

# ----- 6. Create logs directory -----
mkdir -p "$INSTALL_DIR/logs"

# ----- 7. Write .duckdns.env -----
echo "==> Writing $INSTALL_DIR/.duckdns.env"
cat > "$INSTALL_DIR/.duckdns.env" <<EOF
DUCKDNS_DOMAIN=$DUCKDNS_DOMAIN
DUCKDNS_TOKEN=$DUCKDNS_TOKEN
EOF
chmod 600 "$INSTALL_DIR/.duckdns.env"

# ----- 8. Run DuckDNS updater once to register the IP -----
echo "==> Registering IP with DuckDNS..."
bash "$DEPLOY_DIR/duckdns.sh"

# ----- 9. Wait and verify DNS resolves to this droplet -----
echo "==> Waiting 60s for DNS propagation..."
sleep 60

DROPLET_IP="$(curl -s ifconfig.me || curl -s icanhazip.com)"
RESOLVED_IP="$(dig +short "$DOMAIN" @8.8.8.8 | head -n1)"

echo "    Droplet IP : $DROPLET_IP"
echo "    Resolved IP: $RESOLVED_IP"

if [ -z "$RESOLVED_IP" ] || [ "$DROPLET_IP" != "$RESOLVED_IP" ]; then
  echo "WARNING: $DOMAIN does not (yet) resolve to this droplet."
  echo "         Continuing — DNS may still be propagating. Re-check before SSL step."
fi

# ----- 10. Backend deps + .env -----
echo "==> Installing backend dependencies..."
cd "$INSTALL_DIR/backend"
npm install --production

echo "==> Writing backend/.env"
cat > "$INSTALL_DIR/backend/.env" <<EOF
PORT=3100
NODE_ENV=production
JWT_SECRET=$JWT_SECRET
ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY
DB_PATH=./data/training.db
COOKIE_DOMAIN=$DOMAIN
EOF
chmod 600 "$INSTALL_DIR/backend/.env"

# ----- 11. Initialize backend DB -----
echo "==> Initializing backend database..."
cd "$INSTALL_DIR/backend"
mkdir -p data
node db/init.js

# ----- 12. Frontend deps + build -----
echo "==> Installing and building frontend..."
cd "$INSTALL_DIR/frontend"
npm install
npm run build

# ----- 13. Nginx config -----
echo "==> Installing nginx config..."
cp "$DEPLOY_DIR/nginx.conf" /etc/nginx/sites-available/nt-csr-training
ln -sf /etc/nginx/sites-available/nt-csr-training /etc/nginx/sites-enabled/nt-csr-training

# Disable default site if present (it can conflict with the new server_name on :80)
if [ -L /etc/nginx/sites-enabled/default ]; then
  rm /etc/nginx/sites-enabled/default
fi

echo "==> Testing nginx config..."
nginx -t

echo "==> Reloading nginx..."
systemctl reload nginx

# ----- 14. SSL via Let's Encrypt -----
echo "==> Setting up SSL..."
bash "$DEPLOY_DIR/ssl.sh"

# ----- 15. Start backend with PM2 -----
echo "==> Starting backend under PM2..."
cd "$INSTALL_DIR"
pm2 start "$DEPLOY_DIR/ecosystem.config.js" --env production
pm2 save

# Make PM2 start on boot
pm2 startup systemd -u root --hp /root >/dev/null || true

# ----- 16. DuckDNS cron entry -----
echo "==> Installing DuckDNS cron entry (every 5 minutes)..."
CRON_LINE="*/5 * * * * /opt/nt-csr-training/deploy/duckdns.sh"
( crontab -l 2>/dev/null | grep -v -F "$DEPLOY_DIR/duckdns.sh" ; echo "$CRON_LINE" ) | crontab -

# ----- 17. Done -----
cat <<EOF

=============================================================
  NT CSR Training Portal — deployment complete
=============================================================
  URL:           https://$DOMAIN
  Install dir:   $INSTALL_DIR
  PM2 app:       nt-csr-training-backend
  Logs:          pm2 logs nt-csr-training-backend
  Nginx config:  /etc/nginx/sites-available/nt-csr-training

  NEXT STEPS:
    1. Create the first admin user:
         cd $INSTALL_DIR/backend
         node scripts/create-admin.js trevor "Trevor" --admin
    2. Visit https://$DOMAIN and log in.
    3. Smoke-test Module 1 and the AI tutor.
=============================================================
EOF
