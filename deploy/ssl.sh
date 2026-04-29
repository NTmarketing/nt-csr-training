#!/bin/bash
# Let's Encrypt SSL setup for nt-csr-training.duckdns.org.
# Idempotent — safe to re-run; certbot will skip if cert already exists.
# Auto-renewal is handled by certbot's systemd timer (verified at the end).

set -e

DOMAIN="nt-csr-training.duckdns.org"
EMAIL="marketing@neighborstrailer.com"

echo "==> Checking for certbot..."
if ! command -v certbot >/dev/null 2>&1; then
  echo "==> Installing certbot..."
  apt-get update
  apt-get install -y certbot python3-certbot-nginx
else
  echo "==> certbot already installed."
fi

echo "==> Issuing/renewing certificate for $DOMAIN..."
certbot --nginx \
  -d "$DOMAIN" \
  --non-interactive \
  --agree-tos \
  -m "$EMAIL" \
  --redirect

echo "==> Verifying auto-renewal timer is active..."
if systemctl list-timers --all 2>/dev/null | grep -q certbot; then
  echo "    certbot.timer is registered."
  systemctl status certbot.timer --no-pager || true
else
  echo "    WARNING: certbot.timer not detected. Renewal may not be automated."
  echo "    Run: systemctl enable --now certbot.timer"
fi

echo "==> SSL setup complete for $DOMAIN."
