# Claude Code — Session 3: Content + Deployment

First, run: `cd frontend && npm install && cd ../backend && npm install` (worktrees don't include node_modules — this primes both even though you'll only build content/deploy in this session).

You are building **the structured curriculum content and the deployment scripts** for the NT CSR Training Portal. Your scope is `content/`, `deploy/`, plus root-level `README.md`, `DEPLOYMENT.md`, and `.gitignore`. Do not modify `backend/` or `frontend/` — other parallel Claude Code sessions are working those.

## Required reading first

Read `MASTER_SPEC.md` at the repo root. That document defines:
- The exact JSON shapes for `content/modules.json`, `content/exam-questions.json`, `content/critical-facts.json`
- The deployment target (existing droplet `137.184.17.54`, PM2, Nginx, DuckDNS)
- The hostname target (`nt-csr-training.duckdns.org`)

Also read these source documents at the repo root (Trevor will place them there before starting):
- `nt-csr-training-curriculum.md` — the existing 11-module curriculum
- `unified-knowledge-base.txt` — the existing NT knowledge base

## Your deliverables

```
content/
├── modules.json              # 11 modules structured per MASTER_SPEC.md
├── knowledge-base.txt        # Copy of unified-knowledge-base.txt verbatim
├── exam-questions.json       # 50+ exam questions across modules
└── critical-facts.json       # The 12 must-know facts from Module 10
deploy/
├── setup-droplet.sh          # Master deployment script (run on the droplet)
├── duckdns.sh                # DuckDNS IP updater (cron'd every 5 min)
├── nginx.conf                # Reverse proxy config for nginx
├── ecosystem.config.js       # PM2 config
└── ssl.sh                    # Let's Encrypt setup script
README.md
DEPLOYMENT.md
.gitignore                    # Root-level gitignore
```

## Implementation notes — Content

**`content/modules.json`:**
- Convert all 11 modules from `nt-csr-training-curriculum.md` into the JSON shape from MASTER_SPEC.md
- Each module gets:
  - `id`, `number`, `title`, `description`, `estimated_minutes` (estimate based on content depth — 10-20 min typical)
  - `learning_objectives` (3-5 bullets, lifted from curriculum)
  - `sections` (2-5 per module, breaking the "Core concepts" content into logical chunks)
  - `kb_references` (titles of relevant articles from the curriculum)
  - `scenarios` (3-5 per module, mix of `free_response` and `roleplay` types)
  - `quiz` (3-5 mostly multiple-choice, ≥1 short-answer where appropriate)
  - `passing_score_percent: 70`
- For Module 11 (Final Cert), set `type: "exam"` and minimal sections; the actual questions come from `exam-questions.json`
- IMPORTANT: Bake the corrected policies into the content (80% early-return refund, $25 fee from owner payout, etc.) — see Module 10 in the curriculum
- Each `content_md` field is markdown — multi-paragraph is fine, but section content should be digestible (not a wall of text)

**`content/knowledge-base.txt`:**
- Copy `unified-knowledge-base.txt` verbatim to this path. No transformation.

**`content/exam-questions.json`:**
- Build a pool of 50+ questions covering all 10 content modules (not Module 11 itself)
- Aim for ~5 questions per module
- Mostly multiple choice; some short-answer where it makes sense (e.g., "What's the maximum refund on early return?")
- For each question include `module_ref` so the backend can build per-module breakdown after exam
- For short-answer questions, include `expected_keywords` array — backend uses Claude to grade those
- Make questions realistic — situations a CSR will actually face

**`content/critical-facts.json`:**
- The 12 must-know facts listed in Module 10 of the curriculum
- Each fact gets `id`, `fact` (the statement), `test_question`, `test_answer` (canonical answer for grading)

## Implementation notes — Deployment

**Target environment:** Existing DigitalOcean droplet at `137.184.17.54`. Node.js, PM2, and Nginx are already installed (other NT services run there). Project will live at `/opt/nt-csr-training/`.

**`deploy/duckdns.sh`:**
```bash
#!/bin/bash
# DuckDNS IP updater — runs via cron every 5 minutes
# Trevor must register the subdomain at duckdns.org first and provide:
#   - DUCKDNS_DOMAIN (e.g. "nt-csr-training")
#   - DUCKDNS_TOKEN (from duckdns.org account)
# Set these in /opt/nt-csr-training/.duckdns.env

set -e
source /opt/nt-csr-training/.duckdns.env
curl -sk "https://www.duckdns.org/update?domains=${DUCKDNS_DOMAIN}&token=${DUCKDNS_TOKEN}&ip=" \
  > /var/log/duckdns.log 2>&1
```

**`deploy/nginx.conf`:**
- Server block listening on 80 (HTTP) and 443 (HTTPS) for `nt-csr-training.duckdns.org`
- HTTP redirects to HTTPS
- HTTPS:
  - SSL certificates from Let's Encrypt at standard paths
  - `location /` → proxy to `http://localhost:5180` (frontend, served by serve or the frontend build)
  - `location /api` → proxy to `http://localhost:3100`
  - Standard proxy headers (`X-Real-IP`, `X-Forwarded-For`, `Host`, `X-Forwarded-Proto`)
  - `proxy_pass_request_headers on` so cookies forward
- Note: the frontend should be built and served as static files. Use a simple `serve` or `http-server` setup OR have nginx serve the static `frontend/dist/` directly (cleaner — recommend this).

**Recommended config:** Have Nginx serve `/opt/nt-csr-training/frontend/dist/` directly for static files, with a fallback to `index.html` for SPA routes:
```nginx
location / {
  root /opt/nt-csr-training/frontend/dist;
  try_files $uri $uri/ /index.html;
}
location /api {
  proxy_pass http://localhost:3100;
  # ...headers
}
```

**`deploy/ecosystem.config.js` (PM2):**
- One app: `nt-csr-training-backend`
  - `script: backend/server.js`
  - `cwd: /opt/nt-csr-training`
  - `env_production: { NODE_ENV: 'production' }`
  - `instances: 1`, `autorestart: true`, `max_memory_restart: '500M'`
- Logs to `/opt/nt-csr-training/logs/`
- (Frontend doesn't need PM2 — Nginx serves static files)

**`deploy/ssl.sh`:**
- Installs certbot if missing (`apt-get install -y certbot python3-certbot-nginx`)
- Runs certbot in nginx mode for the DuckDNS subdomain:
  ```bash
  certbot --nginx -d nt-csr-training.duckdns.org --non-interactive --agree-tos -m marketing@neighborstrailer.com
  ```
- Sets up auto-renewal (`certbot` handles this via systemd timer by default — verify and confirm)

**`deploy/setup-droplet.sh`:**
This is the master script Trevor runs on the droplet. It should:
1. Verify it's running as root
2. Verify required env vars are present (or read from a setup `.env` file)
3. Clone the repo to `/opt/nt-csr-training`
4. Create `.duckdns.env` with the DuckDNS domain + token
5. Run `deploy/duckdns.sh` once to register IP
6. Wait 60 seconds, verify `nt-csr-training.duckdns.org` resolves to the droplet IP (`dig +short`)
7. Install backend deps: `cd backend && npm install --production`
8. Install frontend deps: `cd frontend && npm install`
9. Build frontend: `cd frontend && npm run build`
10. Initialize backend DB: `cd backend && node db/init.js`
11. Copy `nginx.conf` to `/etc/nginx/sites-available/nt-csr-training`, symlink to `sites-enabled`, test and reload Nginx
12. Run `ssl.sh` to get the cert
13. Start backend with PM2: `pm2 start ecosystem.config.js && pm2 save`
14. Add cron entry for DuckDNS updater: `*/5 * * * * /opt/nt-csr-training/deploy/duckdns.sh`
15. Print success summary with the URL and next steps

The script should be idempotent where possible and use `set -e` to fail fast.

**`README.md`:**
- One-paragraph description of the project
- Quick local dev instructions:
  ```bash
  # Backend
  cd backend && npm install && cp .env.example .env
  # (fill in JWT_SECRET and ANTHROPIC_API_KEY)
  node db/init.js
  npm run dev

  # Frontend (separate terminal)
  cd frontend && npm install && npm run dev

  # Open http://localhost:5173
  ```
- Link to `DEPLOYMENT.md` for production setup

**`DEPLOYMENT.md`:**
Step-by-step guide for Trevor. Sections:
1. **Prerequisites** — DuckDNS account + subdomain registered, Anthropic API key, droplet root access
2. **DuckDNS setup** — register account at duckdns.org, create subdomain `nt-csr-training`, copy the token
3. **Droplet preparation** — confirms Node 20+, PM2, Nginx already installed (commands to verify)
4. **Clone and deploy** — `git clone` and run `setup-droplet.sh`
5. **Create first admin user** — `cd /opt/nt-csr-training/backend && node scripts/create-admin.js trevor "Trevor" --admin`
6. **Verification** — visit `https://nt-csr-training.duckdns.org`, log in, smoke test
7. **Adding new trainees** — `node scripts/create-admin.js newhire "Jane Smith"` (no --admin flag)
8. **Updating** — `git pull`, `cd frontend && npm run build`, `pm2 restart nt-csr-training-backend`
9. **Logs** — `pm2 logs nt-csr-training-backend`, Nginx access/error log paths
10. **Troubleshooting** — common issues (DuckDNS not resolving, certbot failure, port conflicts)

**Root `.gitignore`:**
```
node_modules/
**/node_modules/
.env
.env.local
**/data/
**/dist/
**/build/
*.log
.DS_Store
.duckdns.env
```

## After you finish

Print this self-check:

```bash
# Validate JSON files
cd content && node -e "JSON.parse(require('fs').readFileSync('modules.json'))" && echo "modules.json OK"
node -e "JSON.parse(require('fs').readFileSync('exam-questions.json'))" && echo "exam-questions.json OK"
node -e "JSON.parse(require('fs').readFileSync('critical-facts.json'))" && echo "critical-facts.json OK"

# Count modules and exam questions
node -e "console.log('modules:', JSON.parse(require('fs').readFileSync('modules.json')).modules.length)"
node -e "console.log('exam questions:', JSON.parse(require('fs').readFileSync('exam-questions.json')).questions.length)"

# Validate shell scripts
cd ../deploy && bash -n setup-droplet.sh && echo "setup-droplet.sh syntax OK"
bash -n duckdns.sh && echo "duckdns.sh syntax OK"
bash -n ssl.sh && echo "ssl.sh syntax OK"
```

If all checks pass and module count is 11, exam question count is 50+, you're done. Stop and report status.
