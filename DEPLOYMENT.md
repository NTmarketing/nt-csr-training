# Deployment Guide — NT CSR Training Portal

Step-by-step setup for the existing DigitalOcean droplet at `137.184.17.54`. The flow is:

1. Register a free DuckDNS subdomain
2. Verify the droplet has Node, PM2, and Nginx
3. Clone the repo and run `setup-droplet.sh`
4. Create the first admin user
5. Smoke-test the live site

The setup script is idempotent — re-running it after a failure or after a code update is safe.

---

## 1. Prerequisites

- **DuckDNS account** with subdomain registered (free). See "DuckDNS setup" below.
- **Anthropic API key** from [console.anthropic.com](https://console.anthropic.com).
- **Droplet root access** (`ssh root@137.184.17.54`).
- **GitHub repo URL** for `nt-csr-training` (the repo containing this guide).

## 2. DuckDNS setup

1. Go to [duckdns.org](https://www.duckdns.org) and sign in (Google/GitHub/etc).
2. In the **domains** section, type `nt-csr-training` and click **add domain**. The subdomain `nt-csr-training.duckdns.org` will appear in your list.
3. Copy the **token** shown at the top of the page (long hex string).
4. Save the domain (without `.duckdns.org`) and token — you'll need them in the next step.

## 3. Droplet preparation

SSH in:

```bash
ssh root@137.184.17.54
```

Verify the required tools are installed:

```bash
node --version    # Should be v20+
npm --version
pm2 --version
nginx -v
git --version
dig -v
```

If any are missing:

```bash
apt-get update
apt-get install -y nginx git dnsutils
# Node 20:
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
npm install -g pm2
```

## 4. Clone and deploy

The setup script reads its config from `/root/.nt-csr-setup.env`. Create it:

```bash
cat > /root/.nt-csr-setup.env <<'EOF'
DUCKDNS_DOMAIN=nt-csr-training
DUCKDNS_TOKEN=<paste-token-from-step-2>
ANTHROPIC_API_KEY=<your-anthropic-key>
REPO_URL=<git-url-of-this-repo>
EOF
chmod 600 /root/.nt-csr-setup.env
```

`JWT_SECRET` is optional — the script auto-generates one if you don't provide it.

Now clone the repo to a temporary spot and run the script:

```bash
git clone <REPO_URL> /tmp/nt-csr-training-bootstrap
bash /tmp/nt-csr-training-bootstrap/deploy/setup-droplet.sh
```

The script will:

1. Validate config and tooling
2. Clone the repo to `/opt/nt-csr-training`
3. Register the droplet's IP with DuckDNS
4. Wait 60 seconds and verify DNS resolution
5. Install backend deps and write `backend/.env`
6. Initialize the SQLite database
7. Install frontend deps and run `npm run build`
8. Install the nginx site config and reload
9. Issue a Let's Encrypt cert via certbot
10. Start the backend under PM2
11. Add a cron entry to refresh the DuckDNS IP every 5 minutes

When it finishes, you'll see a success summary with the URL.

## 5. Create the first admin user

```bash
cd /opt/nt-csr-training/backend
node scripts/create-admin.js trevor "Trevor" --admin
```

The script will prompt for a password. Pick a strong one — this account can manage all users.

## 6. Verification

1. Visit `https://nt-csr-training.duckdns.org` in a browser.
2. You should see the login page (no cert warning).
3. Log in with the admin account from step 5.
4. The dashboard should show all 11 modules.
5. Click into Module 1, scroll the lesson, open the AI tutor and ask a question, take the quiz, complete it.
6. Check `/admin` to confirm the admin user-management page loads.

If any step fails, see **Troubleshooting** below.

## 7. Adding new trainees

```bash
cd /opt/nt-csr-training/backend
node scripts/create-admin.js newhire "Jane Smith"        # trainee account
node scripts/create-admin.js manager "Pat Boss" --admin  # admin account
```

## 8. Updating after a code change

```bash
cd /opt/nt-csr-training
git pull
cd frontend && npm install && npm run build
cd ../backend && npm install --production
pm2 restart nt-csr-training-backend
```

If the database schema changed, also run `node backend/db/init.js` (it's idempotent — safe to re-run).

## 9. Logs and monitoring

- **Backend logs:** `pm2 logs nt-csr-training-backend`
- **Backend log files:** `/opt/nt-csr-training/logs/backend-out.log` and `backend-error.log`
- **Nginx access log:** `/var/log/nginx/access.log`
- **Nginx error log:** `/var/log/nginx/error.log`
- **DuckDNS update log:** `/var/log/duckdns.log`
- **PM2 process status:** `pm2 status`

## 10. Troubleshooting

### `nt-csr-training.duckdns.org` doesn't resolve

- Run `bash /opt/nt-csr-training/deploy/duckdns.sh` manually and check `/var/log/duckdns.log` for the response — `OK` means success, `KO` means bad token/domain.
- Check the cron entry exists: `crontab -l | grep duckdns`.
- DNS can take up to 5 minutes to propagate after the first registration.

### `certbot --nginx` failed

- Confirm DNS is resolving to the droplet first: `dig +short nt-csr-training.duckdns.org`. If it doesn't match the droplet IP, fix DuckDNS first and rerun.
- Confirm port 80 is open in the firewall: `ufw status` (allow 80, 443 if not already).
- Confirm nginx is running: `systemctl status nginx`.
- Re-run the cert step in isolation: `bash /opt/nt-csr-training/deploy/ssl.sh`.

### Backend won't start

- Check logs: `pm2 logs nt-csr-training-backend --lines 100`.
- Common causes: missing `.env` values, port 3100 already in use (`ss -tlnp | grep 3100`), database file permission issues (`ls -la /opt/nt-csr-training/backend/data/`).

### `502 Bad Gateway` from nginx

- The backend is down or not on port 3100. Run `pm2 status` and check logs.
- After confirming the backend is up: `systemctl reload nginx`.

### Frontend shows but `/api` returns 404

- The nginx site config may not be enabled. Check: `ls -la /etc/nginx/sites-enabled/`.
- Reinstall the config: `cp /opt/nt-csr-training/deploy/nginx.conf /etc/nginx/sites-available/nt-csr-training && nginx -t && systemctl reload nginx`.

### "Port 80/443 already in use"

- Another nginx site or service is bound. Disable conflicting sites: `rm /etc/nginx/sites-enabled/<other-site>` and reload nginx.
- The setup script removes `/etc/nginx/sites-enabled/default` automatically; if you have other sites on the droplet, make sure their `server_name` doesn't collide.

### Cert auto-renewal not running

- Check the timer: `systemctl status certbot.timer`.
- Enable it if needed: `systemctl enable --now certbot.timer`.
- Force a dry-run renewal: `certbot renew --dry-run`.
