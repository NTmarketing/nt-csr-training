# Claude Code — Session 2: Frontend

First, run: `cd frontend && npm install && cd ../backend && npm install` (worktrees don't include node_modules — this primes both even though you'll only build frontend in this session).

You are building the **frontend** for the NT CSR Training Portal. Your scope is everything inside `frontend/`. Do not modify `backend/`, `content/`, or `deploy/` — other parallel Claude Code sessions are working those.

## Required reading first

Read `MASTER_SPEC.md` at the repo root. That document defines:
- The full API contract you must consume
- The frontend route map
- UI behavior expectations
- Styling guidance (Tailwind, NT brand colors `#00bf63`, professional/clean light mode)
- The shape of `content/modules.json` so your TypeScript types match

Do not deviate from the API contract or routes in MASTER_SPEC.md.

## Your deliverables

Create these files inside `frontend/`:

```
frontend/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── .gitignore
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── types.ts
    ├── api/
    │   └── client.ts
    ├── contexts/
    │   └── AuthContext.tsx
    ├── components/
    │   ├── Layout.tsx
    │   ├── ModuleCard.tsx
    │   ├── AIChat.tsx
    │   ├── Quiz.tsx
    │   ├── ProgressBar.tsx
    │   └── ProtectedRoute.tsx
    └── pages/
        ├── Login.tsx
        ├── Dashboard.tsx
        ├── Module.tsx
        ├── QuizPage.tsx
        ├── Roleplay.tsx
        ├── FinalExam.tsx
        ├── Certificate.tsx
        └── Admin.tsx
```

## Implementation notes

**Stack:** React 18 + Vite + TypeScript + Tailwind + React Router 6.

**Dependencies:**
```
react react-dom react-router-dom
```
**Dev:**
```
@vitejs/plugin-react @types/react @types/react-dom
typescript vite tailwindcss postcss autoprefixer
```

**vite.config.ts:**
- Standard React plugin
- Dev server on port 5173
- Proxy `/api` to `http://localhost:3100` with `changeOrigin: true` and `cookies: true`

**Tailwind:**
- Standard setup, scan `./index.html` and `./src/**/*.{js,ts,jsx,tsx}`
- Extend theme with NT colors:
  ```js
  colors: {
    nt: {
      primary: '#00bf63',
      'primary-dark': '#009b50',
      'primary-light': '#33d180',
    }
  }
  ```

**API client (`src/api/client.ts`):**
- Wrapper around `fetch` that:
  - Always sends `credentials: 'include'` (for cookies)
  - Sets `Content-Type: application/json` on requests with bodies
  - Throws on non-2xx (with parsed error message)
  - Has typed methods: `apiClient.get<T>(path)`, `.post<T>(path, body)`, `.delete<T>(path)`
- Export individual API helpers: `auth.login(...)`, `modules.list()`, `modules.get(id)`, `progress.start(id)`, `quiz.submit(id, answers)`, `ai.tutor(...)`, `ai.roleplay(...)`, `exam.start()`, `exam.submit(...)`, `admin.users.list()`, etc.

**Auth context (`src/contexts/AuthContext.tsx`):**
- Provides `user`, `loading`, `login(username, password)`, `logout()`, `refresh()`
- On mount, calls `GET /api/auth/me` to populate user
- Wraps the entire app in `App.tsx`

**Protected routes (`src/components/ProtectedRoute.tsx`):**
- Reads from AuthContext
- If loading: render a centered spinner
- If no user: redirect to `/login`
- If `requireAdmin` prop and user is not admin: redirect to `/`

**Routes in App.tsx:**
- `/login` → Login (public)
- `/` → Dashboard (protected)
- `/module/:id` → Module (protected)
- `/module/:id/quiz` → QuizPage (protected)
- `/module/:id/scenario/:scenarioId` → Roleplay (protected)
- `/exam` → FinalExam (protected)
- `/certificate` → Certificate (protected)
- `/admin` → Admin (protected, requireAdmin)
- `*` → 404 / redirect to `/`

**Login page:**
- Centered card, NT logo placeholder text "Neighbors Trailer — CSR Training"
- Username + password inputs
- Submit calls `auth.login`, on success navigate to `/`
- Display errors clearly

**Dashboard:**
- Welcome message with trainee's first name
- Grid of 11 ModuleCards
- Each card shows: module number, title, status badge, quiz score (if attempted), CTA button
- Status colors:
  - `completed`: green check, "Review" button
  - `in_progress`: amber, "Continue" button
  - `available`: blue, "Start" button
  - `locked`: gray, lock icon, no CTA
- Module 11 (Final Exam) gets a different visual treatment — slightly larger card, distinct color

**Module page:**
- Two-column layout on desktop: lesson content (left, 60%) + AI tutor sidebar (right, 40%)
- Mobile: single column, AI tutor in a collapsible drawer
- Top: module title, progress bar (sections viewed / total)
- Sections rendered from `content_md` markdown (use `react-markdown` or simple custom renderer — pick whichever; keep deps light)
- Section nav: Previous/Next buttons at the bottom of each section
- After viewing all sections, "Take Quiz" button activates
- Track viewed sections in component state (don't worry about persisting)
- AI Chat component embedded in sidebar — pre-loaded with module context

**AIChat component:**
- Reusable: `<AIChat mode="tutor" moduleId={id} />` or `<AIChat mode="roleplay" moduleId={id} scenarioId={...} />`
- Message list (assistant left, user right)
- Input box with send button (Enter to send)
- Shows typing indicator while waiting
- For roleplay: includes "End conversation & grade me" button at top

**Quiz page:**
- Show all questions on one page (or paginated — pick one, simpler is one-per-page with "Next")
- Submit button → calls API → display results screen with per-question feedback
- If passed: button to return to dashboard (module marked complete server-side)
- If failed: button to retry quiz OR review the module again
- Show explanation for each question after submit

**Roleplay page:**
- Full-screen chat with the AI
- Top bar: scenario title, persona description, "End & Grade" button
- AI plays customer; trainee responds
- After "End & Grade", show grading screen with score (0-10) and feedback

**Final Exam page:**
- Confirmation screen before starting ("This is the final cert exam. 25 questions across all modules. You'll need 21/25 to pass.")
- Start button → fetch questions → render one at a time
- Progress indicator (Question N of 25)
- No back navigation (lock answers as user moves forward) — actually allow back nav, just don't allow accidental skip
- Submit at the end → results screen with score, pass/fail, per-module breakdown
- If passed: link to `/certificate`
- If failed: list of modules to remediate, link back to dashboard

**Certificate page:**
- Print-friendly layout
- "Certificate of Completion" header, NT branding text
- Trainee name, completion date, final score
- Print button (CSS print styles to hide chrome)

**Admin page:**
- Table of users with: username, name, role, modules completed, last activity
- "Create user" form (username, name, password, role)
- Per-row actions: Reset progress, Delete

## Styling notes

- Use Tailwind utility classes — no separate CSS modules unless absolutely needed
- Card-based layouts, generous whitespace
- Round corners (`rounded-lg` or `rounded-xl`)
- Subtle shadows (`shadow-sm` to `shadow-md`)
- Primary action buttons: `bg-nt-primary hover:bg-nt-primary-dark text-white`
- Use lucide-react for icons (install it)

## TypeScript

Define shared types in `src/types.ts`:

```ts
export type Role = 'trainee' | 'admin';
export type ModuleStatus = 'locked' | 'available' | 'in_progress' | 'completed';

export interface User { id: number; username: string; name: string; role: Role; }
export interface ModuleSummary { id: string; number: number; title: string; description: string; estimated_minutes: number; status: ModuleStatus; quiz_score: number | null; }
export interface ModuleSection { id: string; title: string; content_md: string; key_points: string[]; }
export interface ModuleScenario { id: string; type: 'free_response' | 'roleplay'; prompt: string; customer_persona?: string; rubric: string[]; }
export interface ModuleQuizQuestion { id: string; question: string; type: 'multiple_choice' | 'true_false' | 'short_answer'; options?: string[]; correct_index?: number; explanation: string; }
export interface ModuleFull extends ModuleSummary { learning_objectives: string[]; sections: ModuleSection[]; scenarios: ModuleScenario[]; quiz: ModuleQuizQuestion[]; kb_references: string[]; passing_score_percent: number; }
export interface ChatMessage { role: 'user' | 'assistant'; content: string; }
```

## After you finish

Print the following self-check:

```bash
cd frontend && npm install
npm run build  # Should succeed with no TypeScript errors
npm run dev &
sleep 3
curl -I http://localhost:5173  # Should return 200
```

Note: the frontend won't fully work until the backend is also running (login will fail), but the build should pass cleanly. Stop and report status.
