# NT CSR Training Portal

Internal web app for training new Customer Service Representatives at Neighbors Trailer. Replaces the previous info-dump training with a structured 11-module curriculum, an AI tutor, scenario practice (free response and roleplay), and a final certification exam.

Built as a Node.js + Express backend (SQLite, JWT auth, Anthropic Claude) and a React + Vite + TypeScript frontend, deployed to an existing DigitalOcean droplet behind Nginx with a free DuckDNS subdomain and Let's Encrypt SSL.

## Repository layout

```
backend/    Express API, SQLite, Anthropic SDK
frontend/   React + Vite + TypeScript + Tailwind
content/    Curriculum (modules.json), KB, exam questions, critical facts
deploy/     Droplet setup script, nginx config, PM2 config, SSL + DuckDNS
```

See [MASTER_SPEC.md](MASTER_SPEC.md) for the full architecture, API contract, and content shapes.

## Local development

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Fill in JWT_SECRET (openssl rand -hex 64) and ANTHROPIC_API_KEY
node db/init.js
npm run dev

# Frontend (separate terminal)
cd frontend
npm install
npm run dev

# Open http://localhost:5173
```

The Vite dev server proxies `/api` to the backend on `http://localhost:3100`, so you don't need to set anything else up.

To create a local admin so you can log in:

```bash
cd backend
node scripts/create-admin.js trevor "Trevor" --admin
```

## Production deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for the step-by-step droplet setup. The full process is automated by `deploy/setup-droplet.sh`.

## Adding new trainees

```bash
cd /opt/nt-csr-training/backend
node scripts/create-admin.js <username> "<Display Name>"     # trainee
node scripts/create-admin.js <username> "<Display Name>" --admin   # admin
```
