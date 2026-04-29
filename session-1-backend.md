# Claude Code — Session 1: Backend

First, run: `cd frontend && npm install && cd ../backend && npm install` (worktrees don't include node_modules — this primes both even though you'll only build backend in this session).

You are building the **backend** for the NT CSR Training Portal. Your scope is everything inside `backend/`. Do not modify `frontend/`, `content/`, or `deploy/` — other parallel Claude Code sessions are working those.

## Required reading first

Read `MASTER_SPEC.md` at the repo root. That document defines:
- The full API contract you must implement
- The database schema you must create
- Environment variables
- AI system prompts (high-level — you implement)

Do not deviate from the API contract or schema in MASTER_SPEC.md. If you find a real reason to deviate, add a comment to the spec rather than silently changing it.

## Your deliverables

Create these files inside `backend/`:

```
backend/
├── package.json
├── .env.example
├── .gitignore
├── server.js
├── db/
│   ├── init.js
│   └── db.js
├── middleware/
│   ├── auth.js
│   └── admin.js
├── routes/
│   ├── auth.js
│   ├── modules.js
│   ├── progress.js
│   ├── quiz.js
│   ├── exam.js
│   ├── ai.js
│   └── admin.js
├── lib/
│   ├── anthropic.js
│   └── content.js
└── scripts/
    └── create-admin.js
```

## Implementation notes

**Dependencies to install:** `express`, `better-sqlite3`, `bcrypt`, `jsonwebtoken`, `cookie-parser`, `cors`, `dotenv`, `@anthropic-ai/sdk`, `nodemon` (dev).

**Server:**
- Listens on `PORT` env var (default 3100)
- Uses `cookie-parser` and `cors` (with credentials, origin from `FRONTEND_ORIGIN` env)
- All routes mounted at `/api/*`
- 404 handler and global error handler
- Runs `db/init.js` on startup if DB file doesn't exist

**Database (`db/init.js`):**
- Creates the `data/` directory if missing
- Opens `data/training.db` via better-sqlite3
- Runs schema from MASTER_SPEC.md
- Idempotent (uses `CREATE TABLE IF NOT EXISTS`)

**Auth:**
- bcrypt with cost 12
- JWT signed with `JWT_SECRET`, 30-day expiry
- Stored in httpOnly cookie named `token`
- `secure: true` only when `NODE_ENV=production`
- `sameSite: 'lax'`
- Auth middleware reads cookie, attaches `req.user = { id, username, role }`
- Admin middleware checks `req.user.role === 'admin'` (run after auth middleware)

**Routes — implement exactly as MASTER_SPEC.md defines:**
- `routes/auth.js` — login, logout, me
- `routes/modules.js` — list (with progress), get one
- `routes/progress.js` — start, complete, get all
- `routes/quiz.js` — submit (auto-grade MCQ, store attempt, mark module complete if passed)
- `routes/exam.js` — start (sample 25 questions from `content/exam-questions.json`), submit, results
- `routes/ai.js` — tutor, grade-response, roleplay, grade-roleplay
- `routes/admin.js` — list users, create, reset progress, delete

**Module unlock logic (in `routes/modules.js`):**
- Module 1 always available
- Module N (N>1) becomes available when module N-1 has `status='completed'`
- Final exam (module 11) becomes available when modules 1-10 are all completed
- Compute status on the fly when serving `GET /api/modules`

**AI integration (`lib/anthropic.js`):**
- Use `claude-sonnet-4-20250514` (or `claude-opus-4-7` if you want higher quality — Sonnet 4 is plenty)
- Wrap Anthropic SDK with these methods:
  - `tutorChat(moduleContent, kbContext, userMessage, history)` → returns assistant message
  - `gradeResponse(scenario, rubric, response)` → returns `{ score, feedback, strengths, weaknesses }` (parse JSON from response, prompt accordingly)
  - `roleplayCustomer(scenario, persona, userMessage, history)` → assistant message in character
  - `gradeRoleplay(scenario, transcript, rubric)` → `{ score, feedback, perCriteria }`
- For grading modes, instruct Claude to respond in JSON only and parse the response. Strip ```json fences if present.
- System prompts should follow the high-level guidance in MASTER_SPEC.md. Keep tutor responses concise (no info-dumping).
- Set `max_tokens: 2048` for tutor, `max_tokens: 1024` for grading.

**Content loader (`lib/content.js`):**
- Loads `../content/modules.json`, `../content/exam-questions.json`, `../content/critical-facts.json`, `../content/knowledge-base.txt` at startup
- Caches in memory
- Exposes: `getModules()`, `getModule(id)`, `getExamQuestions()`, `getCriticalFacts()`, `getKB()`
- If content files don't exist yet (Session 3 in progress), log a warning and serve empty arrays — don't crash.

**Quiz grading:**
- MCQ questions auto-grade by comparing `correct_index`
- Calculate `score` (number correct), `total` (number of questions), `passed` (score/total >= passing_score_percent/100)
- If passed, mark module as completed in progress table
- Return per-question feedback with explanations

**create-admin.js script:**
```bash
node scripts/create-admin.js <username> <name> [--admin]
```
- Prompts for password (hidden input via readline)
- Hashes with bcrypt, inserts into users table
- Prints success message

**.env.example:**
```
PORT=3100
NODE_ENV=development
JWT_SECRET=replace-with-openssl-rand-hex-64
ANTHROPIC_API_KEY=sk-ant-replace-me
FRONTEND_ORIGIN=http://localhost:5173
DB_PATH=./data/training.db
```

**.gitignore:**
```
node_modules/
data/
.env
*.log
```

## After you finish

Print the following self-check:

```bash
cd backend && npm install
node db/init.js  # Should create data/training.db
npm start &
sleep 2
curl http://localhost:3100/api/auth/me  # Should return 401
```

If all three steps succeed, you're done. Stop and report status.
