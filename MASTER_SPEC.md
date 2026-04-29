# NT CSR Training Portal — Master Spec

**Project owner:** Trevor (Co-Founder, Neighbors Trailer)
**Purpose:** Internal web app to train new Customer Service Representatives. Replaces failed info-dump training with structured modules, AI tutor, scenarios, and final cert exam.
**Status:** This document is the shared contract between three parallel Claude Code sessions building this app simultaneously. All sessions must conform to the API contracts, database schema, and content shapes defined here.

---

## Architecture

- **Backend:** Node.js + Express + better-sqlite3 + Anthropic SDK (`@anthropic-ai/sdk`)
- **Frontend:** React 18 + Vite + TypeScript + Tailwind CSS + React Router
- **Database:** SQLite (file at `backend/data/training.db`) — sufficient for low-traffic internal tool
- **Auth:** bcrypt password hashing + JWT in httpOnly cookie, expires after 30 days
- **AI:** Anthropic Claude Sonnet 4 via API, system prompts loaded from curriculum + KB
- **Deployment:** Existing DigitalOcean droplet (`137.184.17.54`), PM2-managed, Nginx reverse proxy, DuckDNS subdomain, Let's Encrypt SSL
- **Hosting target subdomain:** `nt-csr-training.duckdns.org` (free DDNS — Trevor will register this on duckdns.org)

## Repository structure

```
nt-csr-training/
├── backend/                  # Built by Session 1
│   ├── package.json
│   ├── server.js             # Express entry point, port 3100
│   ├── .env.example
│   ├── .gitignore
│   ├── data/                 # SQLite file lives here (gitignored)
│   ├── db/
│   │   ├── init.js           # Schema creation + migrations
│   │   └── db.js             # Connection helper
│   ├── middleware/
│   │   ├── auth.js           # JWT verification
│   │   └── admin.js          # Role check
│   ├── routes/
│   │   ├── auth.js           # /api/auth/*
│   │   ├── modules.js        # /api/modules/*
│   │   ├── progress.js       # /api/progress/*
│   │   ├── quiz.js           # /api/quiz/*
│   │   ├── exam.js           # /api/exam/*
│   │   ├── ai.js             # /api/ai/*
│   │   └── admin.js          # /api/admin/*
│   ├── lib/
│   │   ├── anthropic.js      # Claude API wrapper + system prompts
│   │   └── content.js        # Loads modules.json, KB, exam questions
│   └── scripts/
│       └── create-admin.js   # CLI tool to create admin/trainee users
├── frontend/                 # Built by Session 2
│   ├── package.json
│   ├── vite.config.ts        # Proxies /api to localhost:3100
│   ├── index.html
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── tsconfig.json
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── index.css
│       ├── api/client.ts     # Fetch wrapper with auth
│       ├── contexts/AuthContext.tsx
│       ├── components/       # Layout, ModuleCard, AIChat, Quiz, ProgressBar, ProtectedRoute
│       └── pages/            # Login, Dashboard, Module, Quiz, Roleplay, FinalExam, Certificate, Admin
├── content/                  # Built by Session 3
│   ├── modules.json          # Structured 11-module curriculum
│   ├── knowledge-base.txt    # Copy of unified NT KB (Session 3 places it here)
│   ├── exam-questions.json   # Final cert exam question pool
│   └── critical-facts.json   # The 12 must-know facts from Module 10
├── deploy/                   # Built by Session 3
│   ├── setup-droplet.sh      # Full deployment script for the DO droplet
│   ├── duckdns.sh            # DuckDNS IP updater (runs via cron)
│   ├── nginx.conf            # Reverse proxy config
│   ├── ecosystem.config.js   # PM2 config
│   └── ssl.sh                # Let's Encrypt setup script
├── README.md
├── DEPLOYMENT.md             # Step-by-step deploy guide
└── .gitignore
```

---

## API Contract

All API endpoints are prefixed with `/api`. JSON requests/responses unless noted. Auth via httpOnly JWT cookie except where noted.

### Auth
- `POST /api/auth/login` — body `{ username, password }` → sets cookie, returns `{ user: { id, username, name, role } }`
- `POST /api/auth/logout` — clears cookie
- `GET /api/auth/me` — returns current user or 401

### Modules
- `GET /api/modules` — returns all 11 modules with status for current user: `[{ id, number, title, description, estimated_minutes, status, quiz_score }]`
- `GET /api/modules/:id` — full module content: `{ id, number, title, learning_objectives, sections: [...], scenarios: [...], quiz: [...] }`

### Progress
- `POST /api/progress/:moduleId/start` — marks status as `in_progress`
- `POST /api/progress/:moduleId/complete` — marks `completed` (only if quiz score >= 70%)
- `GET /api/progress` — full progress object for current user

### Quiz
- `POST /api/quiz/:moduleId/submit` — body `{ answers: [{ questionId, answer }] }` → `{ score, total, passed, feedback: [{ questionId, correct, explanation }] }`

### AI
- `POST /api/ai/tutor` — body `{ moduleId, message, history: [{ role, content }] }` → `{ message, history }` (full response, not streaming for v1 to keep things simple)
- `POST /api/ai/grade-response` — body `{ moduleId, scenarioId, response }` → `{ score: 0-10, feedback, strengths: [], weaknesses: [] }`
- `POST /api/ai/roleplay` — body `{ moduleId, scenarioId, message, history }` → `{ message, history }` (Claude plays the customer)
- `POST /api/ai/grade-roleplay` — body `{ moduleId, scenarioId, transcript: [...] }` → `{ score, feedback, perCriteria: [...] }`

### Exam
- `POST /api/exam/start` — generates 25 questions sampled across all modules, returns `{ examId, questions: [...] }`
- `POST /api/exam/submit` — body `{ examId, answers }` → `{ score, total, passed, perModuleBreakdown }`
- `GET /api/exam/results` — returns latest exam result for current user (for certificate page)

### Admin (admin role required)
- `GET /api/admin/users` — all users with progress summary
- `POST /api/admin/users` — body `{ username, password, name, role }` → creates user
- `POST /api/admin/users/:id/reset` — resets all progress for user
- `DELETE /api/admin/users/:id` — deletes user

---

## Database Schema (SQLite)

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'trainee',  -- 'trainee' | 'admin'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  module_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available',  -- 'locked' | 'available' | 'in_progress' | 'completed'
  quiz_score INTEGER,
  started_at DATETIME,
  completed_at DATETIME,
  UNIQUE(user_id, module_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE quiz_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  module_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  answers_json TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE scenario_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  module_id TEXT NOT NULL,
  scenario_id TEXT NOT NULL,
  transcript_json TEXT NOT NULL,
  grade_json TEXT,
  score INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE ai_conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  module_id TEXT,
  scenario_id TEXT,
  mode TEXT NOT NULL,  -- 'tutor' | 'roleplay'
  messages_json TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE final_exam_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  answers_json TEXT NOT NULL,
  per_module_breakdown_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_progress_user ON progress(user_id);
CREATE INDEX idx_quiz_user_module ON quiz_attempts(user_id, module_id);
```

---

## Content Shape — `content/modules.json`

The structured curriculum data, derived from `nt-csr-training-curriculum.md`. Session 3 builds this.

```json
{
  "modules": [
    {
      "id": "module-1",
      "number": 1,
      "title": "Platform Foundations",
      "description": "Overview of NT, roles, lifecycle, and terminology",
      "estimated_minutes": 15,
      "learning_objectives": [
        "Explain what Neighbors Trailer is in one sentence",
        "Distinguish between Renter and Owner roles",
        "Walk through the full booking lifecycle from search to payout"
      ],
      "sections": [
        {
          "id": "section-1-1",
          "title": "What is Neighbors Trailer?",
          "content_md": "Neighbors Trailer is a peer-to-peer trailer rental marketplace...",
          "key_points": ["Peer-to-peer marketplace", "NT does not own trailers", "..."]
        }
      ],
      "kb_references": [
        "Why Rent from Neighbors Trailer?",
        "How It Works"
      ],
      "scenarios": [
        {
          "id": "module-1-scenario-1",
          "type": "free_response",
          "prompt": "A friend asks at dinner: 'What does Neighbors Trailer actually do? Aren't they just like Turo for trailers?' Give a 30-second pitch.",
          "rubric": [
            "Mentions peer-to-peer marketplace model",
            "Explains owner/renter dynamic",
            "Mentions NT's role as facilitator (payments, verification, insurance)",
            "Concise — fits in 30 seconds"
          ]
        },
        {
          "id": "module-1-scenario-2",
          "type": "roleplay",
          "prompt": "You're answering an inbound call. The caller is a brand-new renter and confused about how the platform works.",
          "customer_persona": "First-time renter, friendly but uncertain. Has never used a peer-to-peer platform before.",
          "rubric": [
            "Friendly opening with name",
            "Explains lifecycle clearly",
            "Doesn't info-dump",
            "Asks if they have specific questions"
          ]
        }
      ],
      "quiz": [
        {
          "id": "m1-q1",
          "question": "Does Neighbors Trailer own the trailers it rents?",
          "type": "multiple_choice",
          "options": ["Yes", "No"],
          "correct_index": 1,
          "explanation": "NT is a peer-to-peer marketplace. Owners list their trailers; NT facilitates the transaction."
        },
        {
          "id": "m1-q2",
          "question": "When is the pickup address shared with the renter?",
          "type": "multiple_choice",
          "options": [
            "Immediately after booking request",
            "After owner accepts the booking",
            "Only after ID verification completes",
            "When the rental starts"
          ],
          "correct_index": 1,
          "explanation": "Pickup address shows on the booking details page automatically after owner acceptance."
        }
      ],
      "passing_score_percent": 70
    }
  ]
}
```

Modules 1-11 follow this structure. Module 11 (Final Cert Exam) has `type: "exam"` instead of regular sections, and references `content/exam-questions.json`.

## Content Shape — `content/exam-questions.json`

Pool of 50+ exam questions covering all modules. Backend samples 25 at random when an exam starts.

```json
{
  "questions": [
    {
      "id": "exam-q1",
      "module_ref": "module-7",
      "question": "What's the maximum refundable amount on early return?",
      "type": "multiple_choice",
      "options": ["75% of rent", "80% of rent for unused portion", "100% of unused portion", "No refund"],
      "correct_index": 1,
      "explanation": "Per Section 20 of TOS, the max refund is 80% of rent for the unused portion. Help center text saying 75% is out of date."
    }
  ]
}
```

## Content Shape — `content/critical-facts.json`

The 12 must-know facts from Module 10, used for the spaced-repetition drilling required before unlocking the final exam.

```json
{
  "facts": [
    {
      "id": "fact-1",
      "fact": "Early return refund maximum is 80% of rent for unused portion. Not 75%. The help center is out of date.",
      "test_question": "What is the maximum refund on an early return?",
      "test_answer": "80% of rent for the unused portion"
    }
  ]
}
```

---

## Frontend Routes

| Route | Page | Auth |
|---|---|---|
| `/login` | Login form | Public |
| `/` | Dashboard (module cards) | Required |
| `/module/:id` | Lesson page with embedded AI tutor sidebar | Required |
| `/module/:id/quiz` | Quiz UI | Required, must have started module |
| `/module/:id/scenario/:scenarioId` | Scenario practice (free response or roleplay) | Required |
| `/exam` | Final cert exam | Required, must have completed modules 1-10 |
| `/certificate` | Certificate of completion (printable) | Required, must have passed exam |
| `/admin` | Admin user management | Admin only |

## UI Behavior

- Dashboard: 11 module cards in a grid. Each card shows: number, title, status badge (locked/available/in progress/completed), quiz score (if attempted), CTA button.
- Module cards are unlocked sequentially: Module N+1 unlocks when Module N's quiz is passed (≥70%).
- Module 11 (final cert) requires modules 1-10 completed AND a passing score on the Module 10 critical-facts drill.
- Module page layout: lesson content (left, ~65% width) + AI tutor chat panel (right, ~35% width, collapsible). Section nav at top. "Take quiz" button at the bottom unlocks after scrolling through all sections.
- Quiz UI: one question at a time, submit per question OR all at once. Show feedback after submission.
- Roleplay UI: full-screen chat, AI plays customer based on persona. "End conversation" button triggers grading.
- Final exam: 25 questions, no AI tutor available, timer optional (10 min/question = 4 hours, generous).
- Certificate page: clean printable layout with trainee name, completion date, final score.

## Styling

- Use Tailwind. No custom CSS frameworks.
- NT brand colors (subtle): primary green `#00bf63`, neutral grays for chrome.
- Don't borrow TrailerBase brand colors. This is an NT product.
- Clean, professional, light mode primary.

---

## Auth Flow

1. Admin runs `node backend/scripts/create-admin.js` to create users
2. Trainee navigates to `/login`, enters username + password
3. Backend validates with bcrypt, issues JWT in httpOnly cookie
4. Frontend stores no token — relies on cookie auto-sent with every request
5. Logout clears cookie
6. JWT secret stored in `backend/.env` as `JWT_SECRET` (long random string)
7. Cookie config: `httpOnly: true`, `secure: true` in production, `sameSite: 'lax'`, 30-day expiry

## AI System Prompts (high-level — Session 1 implements)

**Tutor mode:**
> You are the NT CSR Trainer. The trainee is currently working through Module {N}: {title}. Their goal is to learn {objectives}. The unified knowledge base and module content are below as context. Answer their questions clearly and concisely. Don't info-dump. Reference KB articles by title. The curriculum overrides the KB on the early-return refund (80%, not 75%).

**Roleplay mode:**
> You are playing a customer of Neighbors Trailer. Your persona: {persona}. Stay in character. Don't break character to give hints. Respond naturally as the customer would. The trainee is the CSR. After they end the conversation, you will be graded on how realistic and challenging the scenario was — but during the conversation, just be the customer.

**Grading mode (free-response):**
> You are grading a CSR trainee's response to a scenario. The scenario was: {prompt}. The rubric is: {rubric}. The trainee's response is: {response}. Score from 0-10 against the rubric. Provide specific, honest feedback — strengths and weaknesses. Don't be excessively kind; the cost of false confidence is real customer mistakes later.

**Exam grading:**
> You are scoring a CSR's final certification exam. Multi-choice questions are scored automatically (already done). For any short-answer questions, evaluate based on whether the trainee identified the correct policy/procedure, communicated it clearly, and showed appropriate escalation judgment.

---

## Environment Variables (`backend/.env`)

```
PORT=3100
NODE_ENV=production
JWT_SECRET=<generate with: openssl rand -hex 64>
ANTHROPIC_API_KEY=sk-ant-...
DB_PATH=./data/training.db
COOKIE_DOMAIN=nt-csr-training.duckdns.org
```

## Source files Session 3 needs

- `nt-csr-training-curriculum.md` — the existing curriculum doc (Trevor will provide as upload)
- `unified-knowledge-base.txt` — the existing NT KB (Trevor will provide as upload)

These get used to build `content/modules.json`, `content/exam-questions.json`, and `content/critical-facts.json`. The KB gets copied verbatim to `content/knowledge-base.txt`.

---

## Cross-session coordination rules

1. **Don't modify another session's files.** Backend session = `backend/` only. Frontend session = `frontend/` only. Content+deploy session = `content/` and `deploy/` and root files only.
2. **Lock the API contract.** If a session needs an endpoint not listed above, document the addition in a comment in this spec — don't silently add it.
3. **Lock the DB schema.** If schema changes, document in this spec.
4. **Lock the content shapes.** If `modules.json` shape changes, the backend session must update its loader and the frontend session must update its types.
5. **Keep `node_modules` out of git.** Each session installs its own.

## Manual smoke test (after all 3 sessions merge)

```bash
# Backend
cd backend && npm install && npm start
# Confirm: server listening on 3100

# In another terminal — create first admin
cd backend && node scripts/create-admin.js admin admin@example.com "Trevor" --admin

# Frontend
cd frontend && npm install && npm run dev
# Confirm: Vite running, navigate to http://localhost:5173
# Login with admin credentials, see dashboard, click into Module 1

# Module page
# Confirm: lesson renders, AI tutor chat panel works, quiz button visible

# Quiz
# Confirm: questions render, submit works, feedback shows
```
