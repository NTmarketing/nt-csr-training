import {
  ArrowLeft,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  GraduationCap,
  Loader2,
  MessageSquare,
  Sparkles,
  Trophy,
  XCircle,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { admin } from '../api/client';
import type {
  TraineeActivityEvent,
  TraineeConversation,
  TraineeDetail,
  TraineeQuizAttempt,
  TraineeScenarioAttempt,
} from '../types';

type Tab = 'progress' | 'quizzes' | 'scenarios' | 'conversations' | 'activity';

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function formatDate(s: string | null | undefined): string {
  if (!s) return '—';
  return new Date(s).toLocaleString();
}

export default function AdminTrainee() {
  const { id } = useParams<{ id: string }>();
  const userId = Number(id);

  const [detail, setDetail] = useState<TraineeDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('progress');

  const [activity, setActivity] = useState<TraineeActivityEvent[] | null>(null);
  const [conversations, setConversations] = useState<TraineeConversation[] | null>(null);
  const [scenarios, setScenarios] = useState<TraineeScenarioAttempt[] | null>(null);
  const [quizzes, setQuizzes] = useState<TraineeQuizAttempt[] | null>(null);

  useEffect(() => {
    if (!Number.isInteger(userId)) {
      setError('Invalid trainee id');
      return;
    }
    let mounted = true;
    admin
      .getTrainee(userId)
      .then((d) => mounted && setDetail(d))
      .catch((err) => mounted && setError(err instanceof Error ? err.message : 'Failed to load'));
    return () => {
      mounted = false;
    };
  }, [userId]);

  useEffect(() => {
    if (!Number.isInteger(userId)) return;
    if (tab === 'quizzes' && quizzes === null) {
      admin.getTraineeQuizzes(userId).then(setQuizzes).catch(() => setQuizzes([]));
    } else if (tab === 'scenarios' && scenarios === null) {
      admin.getTraineeScenarios(userId).then(setScenarios).catch(() => setScenarios([]));
    } else if (tab === 'conversations' && conversations === null) {
      admin.getTraineeConversations(userId).then(setConversations).catch(() => setConversations([]));
    } else if (tab === 'activity' && activity === null) {
      admin.getTraineeActivity(userId).then(setActivity).catch(() => setActivity([]));
    }
  }, [tab, userId, quizzes, scenarios, conversations, activity]);

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        {error}
        <div className="mt-2">
          <Link to="/admin" className="underline">
            Back to admin
          </Link>
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const { user, stats, module_progress } = detail;

  return (
    <div>
      <Link
        to="/admin"
        className="mb-3 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" /> Back to admin
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
        <div className="mt-1 text-sm text-gray-600">
          @{user.username} · {user.role} · joined {formatDate(user.created_at)}
        </div>
        {stats.last_activity_at && (
          <div className="text-xs text-gray-500">
            Last activity {formatDate(stats.last_activity_at)}
          </div>
        )}
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard icon={<BookOpen className="h-4 w-4" />} label="Modules complete" value={`${stats.modules_completed}`} />
        <StatCard icon={<Clock className="h-4 w-4" />} label="Time spent" value={formatDuration(stats.total_time_seconds)} />
        <StatCard icon={<GraduationCap className="h-4 w-4" />} label="Quiz attempts" value={`${stats.quiz_attempts_total}`} />
        <StatCard icon={<Sparkles className="h-4 w-4" />} label="Scenario attempts" value={`${stats.scenario_attempts_total}`} />
        <StatCard
          icon={<Trophy className="h-4 w-4" />}
          label="Final exam"
          value={stats.final_exam_passed === null ? 'Not taken' : stats.final_exam_passed ? 'Passed' : 'Failed'}
        />
      </div>

      <div className="mb-4 flex flex-wrap gap-1 border-b border-gray-200">
        <TabButton active={tab === 'progress'} onClick={() => setTab('progress')}>
          Module progress
        </TabButton>
        <TabButton active={tab === 'quizzes'} onClick={() => setTab('quizzes')}>
          Quiz attempts
        </TabButton>
        <TabButton active={tab === 'scenarios'} onClick={() => setTab('scenarios')}>
          Practice scenarios
        </TabButton>
        <TabButton active={tab === 'conversations'} onClick={() => setTab('conversations')}>
          AI tutor conversations
        </TabButton>
        <TabButton active={tab === 'activity'} onClick={() => setTab('activity')}>
          Activity feed
        </TabButton>
      </div>

      {tab === 'progress' && <ProgressTable rows={module_progress} />}
      {tab === 'quizzes' && <QuizzesView rows={quizzes} />}
      {tab === 'scenarios' && <ScenariosView rows={scenarios} />}
      {tab === 'conversations' && <ConversationsView rows={conversations} />}
      {tab === 'activity' && <ActivityFeed events={activity} />}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="card p-3">
      <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-gray-500">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-xl font-bold text-gray-900">{value}</div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition ${
        active
          ? 'border-nt-primary text-nt-primary-dark'
          : 'border-transparent text-gray-600 hover:text-gray-900'
      }`}
    >
      {children}
    </button>
  );
}

function ProgressTable({ rows }: { rows: TraineeDetail['module_progress'] }) {
  return (
    <div className="card overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-4 py-3">Module</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Quiz score</th>
            <th className="px-4 py-3">Time spent</th>
            <th className="px-4 py-3">Started</th>
            <th className="px-4 py-3">Completed</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {rows.map((r) => (
            <tr key={r.module_id}>
              <td className="px-4 py-3 font-medium text-gray-900">
                <span className="text-xs text-gray-500">M{r.module_number}</span> {r.module_title}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={r.status} />
              </td>
              <td className="px-4 py-3 text-gray-700">
                {r.quiz_score == null ? '—' : `${r.quiz_score}%`}
              </td>
              <td className="px-4 py-3 text-gray-700">{formatDuration(r.time_seconds)}</td>
              <td className="px-4 py-3 text-gray-600">{formatDate(r.started_at)}</td>
              <td className="px-4 py-3 text-gray-600">{formatDate(r.completed_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    completed: 'bg-emerald-100 text-emerald-800',
    in_progress: 'bg-amber-100 text-amber-800',
    available: 'bg-gray-100 text-gray-700',
    locked: 'bg-gray-100 text-gray-500',
  };
  const cls = styles[status] || 'bg-gray-100 text-gray-700';
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {status.replace('_', ' ')}
    </span>
  );
}

function Collapsible({
  header,
  children,
  defaultOpen = false,
}: {
  header: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card mb-3">
      <button
        type="button"
        className="flex w-full items-center justify-between p-3 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex-1">{header}</div>
        {open ? <ChevronDown className="h-4 w-4 text-gray-500" /> : <ChevronRight className="h-4 w-4 text-gray-500" />}
      </button>
      {open && <div className="border-t border-gray-200 p-4">{children}</div>}
    </div>
  );
}

function QuizzesView({ rows }: { rows: TraineeQuizAttempt[] | null }) {
  if (rows === null) return <Loading />;
  if (rows.length === 0) return <Empty msg="No quiz attempts yet." />;
  return (
    <div>
      {rows.map((r) => (
        <Collapsible
          key={r.id}
          header={
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-sm font-semibold text-gray-900">{r.module_title}</div>
                <div className="text-xs text-gray-500">{formatDate(r.created_at)}</div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    r.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {r.passed ? 'Passed' : 'Failed'}
                </span>
                <span className="font-medium text-gray-900">
                  {r.score} / {r.total}
                </span>
              </div>
            </div>
          }
        >
          <ol className="space-y-3">
            {r.questions.map((q, idx) => (
              <li key={q.question_id} className="rounded-md border border-gray-200 p-3">
                <div className="mb-1 flex items-start gap-2">
                  {q.correct ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  ) : (
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                  )}
                  <div className="text-sm font-medium text-gray-900">
                    Q{idx + 1}. {q.question}
                  </div>
                </div>
                <div className="ml-6 space-y-1 text-xs text-gray-700">
                  <div>
                    <span className="font-semibold">Trainee answer:</span>{' '}
                    {q.trainee_answer == null
                      ? '—'
                      : q.options && typeof q.trainee_answer === 'number'
                        ? q.options[q.trainee_answer] ?? String(q.trainee_answer)
                        : String(q.trainee_answer)}
                  </div>
                  <div>
                    <span className="font-semibold">Correct answer:</span>{' '}
                    {q.correct_answer_text ?? (q.correct_index != null ? `Option ${q.correct_index}` : '—')}
                  </div>
                  {q.explanation && (
                    <div className="text-gray-600">
                      <span className="font-semibold">Explanation:</span> {q.explanation}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </Collapsible>
      ))}
    </div>
  );
}

function ScenariosView({ rows }: { rows: TraineeScenarioAttempt[] | null }) {
  if (rows === null) return <Loading />;
  if (rows.length === 0) return <Empty msg="No scenario attempts yet." />;
  return (
    <div>
      {rows.map((r) => (
        <Collapsible
          key={r.id}
          header={
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-sm font-semibold text-gray-900">
                  {r.module_title} · {r.scenario_id}
                </div>
                <div className="text-xs text-gray-500">{formatDate(r.created_at)}</div>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {r.score == null ? '—' : `${r.score} / 10`}
              </span>
            </div>
          }
        >
          {r.scenario_prompt && (
            <div className="mb-3 rounded-md bg-gray-50 p-3 text-sm text-gray-700">
              <div className="text-xs font-semibold uppercase text-gray-500">Prompt</div>
              <p className="mt-1 whitespace-pre-wrap">{r.scenario_prompt}</p>
            </div>
          )}
          <div className="mb-3">
            <div className="mb-2 text-xs font-semibold uppercase text-gray-500">Transcript</div>
            <div className="space-y-2">
              {r.transcript.map((m, i) => (
                <div
                  key={i}
                  className={`rounded-md p-2 text-sm ${
                    m.role === 'user'
                      ? 'bg-nt-primary/5 text-gray-900'
                      : 'bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="text-[10px] font-semibold uppercase text-gray-500">{m.role}</div>
                  <div className="mt-0.5 whitespace-pre-wrap">{m.content}</div>
                </div>
              ))}
            </div>
          </div>
          {r.grade && (
            <div className="rounded-md border border-gray-200 p-3 text-sm">
              <div className="text-xs font-semibold uppercase text-gray-500">AI grade</div>
              <p className="mt-1 whitespace-pre-wrap text-gray-800">{r.grade.feedback}</p>
              {'strengths' in r.grade && (
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div>
                    <div className="text-xs font-semibold text-emerald-700">Strengths</div>
                    <ul className="list-disc pl-5 text-xs text-gray-700">
                      {r.grade.strengths.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-amber-700">Weaknesses</div>
                    <ul className="list-disc pl-5 text-xs text-gray-700">
                      {r.grade.weaknesses.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              {'perCriteria' in r.grade && (
                <ul className="mt-2 space-y-1">
                  {r.grade.perCriteria.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs">
                      {c.met ? (
                        <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" />
                      ) : (
                        <XCircle className="mt-0.5 h-3 w-3 shrink-0 text-red-600" />
                      )}
                      <div>
                        <div className="font-medium text-gray-900">{c.criterion}</div>
                        {c.note && <div className="text-gray-600">{c.note}</div>}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </Collapsible>
      ))}
    </div>
  );
}

function ConversationsView({ rows }: { rows: TraineeConversation[] | null }) {
  const grouped = useMemo(() => {
    if (!rows) return null;
    const m = new Map<string, TraineeConversation[]>();
    for (const c of rows) {
      const key = c.module_title || c.module_id || 'No module';
      const arr = m.get(key) || [];
      arr.push(c);
      m.set(key, arr);
    }
    return Array.from(m.entries());
  }, [rows]);

  if (grouped === null) return <Loading />;
  if (grouped.length === 0) return <Empty msg="No AI tutor conversations yet." />;

  return (
    <div>
      {grouped.map(([groupName, convs]) => (
        <div key={groupName} className="mb-5">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            {groupName}
          </div>
          {convs.map((c) => (
            <Collapsible
              key={c.id}
              header={
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {c.mode} · {c.messages.length} messages
                      </div>
                      <div className="text-xs text-gray-500">{formatDate(c.updated_at)}</div>
                    </div>
                  </div>
                </div>
              }
            >
              <div className="space-y-2">
                {c.messages.map((m, i) => (
                  <div
                    key={i}
                    className={`rounded-md p-2 text-sm ${
                      m.role === 'user'
                        ? 'bg-nt-primary/5 text-gray-900'
                        : 'bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="text-[10px] font-semibold uppercase text-gray-500">{m.role}</div>
                    <div className="mt-0.5 whitespace-pre-wrap">{m.content}</div>
                  </div>
                ))}
              </div>
            </Collapsible>
          ))}
        </div>
      ))}
    </div>
  );
}

function ActivityFeed({ events }: { events: TraineeActivityEvent[] | null }) {
  if (events === null) return <Loading />;
  if (events.length === 0) return <Empty msg="No activity yet." />;
  return (
    <ul className="space-y-2">
      {events.map((e, i) => (
        <li key={i} className="card flex items-start gap-3 p-3">
          <ActivityIcon type={e.type} />
          <div className="flex-1">
            <div className="text-sm text-gray-900">
              <ActivityLabel event={e} />
            </div>
            <div className="text-xs text-gray-500">{formatDate(e.timestamp)}</div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function ActivityIcon({ type }: { type: TraineeActivityEvent['type'] }) {
  const cls = 'h-4 w-4 mt-0.5 shrink-0';
  switch (type) {
    case 'section_view':
      return <BookOpen className={`${cls} text-gray-500`} />;
    case 'quiz_attempt':
      return <GraduationCap className={`${cls} text-blue-600`} />;
    case 'scenario_attempt':
      return <Sparkles className={`${cls} text-amber-600`} />;
    case 'ai_conversation':
      return <Brain className={`${cls} text-purple-600`} />;
    case 'final_exam':
      return <Trophy className={`${cls} text-emerald-600`} />;
  }
}

function ActivityLabel({ event }: { event: TraineeActivityEvent }) {
  switch (event.type) {
    case 'section_view':
      return (
        <span>
          Viewed section <span className="font-medium">{event.section_id}</span> in{' '}
          <span className="font-medium">{event.module_title}</span> for{' '}
          {formatDuration(event.duration_seconds)}
        </span>
      );
    case 'quiz_attempt':
      return (
        <span>
          {event.passed ? 'Passed' : 'Failed'} quiz for{' '}
          <span className="font-medium">{event.module_title}</span> · {event.score}/{event.total}
        </span>
      );
    case 'scenario_attempt':
      return (
        <span>
          Scenario <span className="font-medium">{event.scenario_id}</span> ·{' '}
          {event.module_title} · {event.score == null ? '—' : `${event.score}/10`}
        </span>
      );
    case 'ai_conversation':
      return (
        <span>
          AI {event.mode} · {event.message_count} messages
          {event.module_title ? ` · ${event.module_title}` : ''}
          {event.last_message_preview && (
            <span className="block text-xs text-gray-500">
              "{event.last_message_preview}"
            </span>
          )}
        </span>
      );
    case 'final_exam':
      return (
        <span>
          Final exam {event.passed ? 'passed' : 'failed'} · {event.score}/{event.total}
        </span>
      );
  }
}

function Loading() {
  return (
    <div className="flex items-center justify-center py-12 text-gray-500">
      <Loader2 className="h-5 w-5 animate-spin" />
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return <div className="card p-6 text-center text-sm text-gray-500">{msg}</div>;
}
