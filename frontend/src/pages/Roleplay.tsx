import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Send,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ai, modules } from '../api/client';
import AIChat from '../components/AIChat';
import type {
  ChatMessage,
  FreeResponseGrade,
  ModuleFull,
  ModuleScenario,
  RoleplayGrade,
} from '../types';

export default function Roleplay() {
  const { id, scenarioId } = useParams<{ id: string; scenarioId: string }>();
  const navigate = useNavigate();
  const [module, setModule] = useState<ModuleFull | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [grade, setGrade] = useState<RoleplayGrade | FreeResponseGrade | null>(null);
  const [grading, setGrading] = useState(false);
  const [freeResponse, setFreeResponse] = useState('');

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    modules
      .get(id)
      .then((m) => {
        if (mounted) setModule(m);
      })
      .catch((err) => {
        if (mounted) setError(err instanceof Error ? err.message : 'Failed to load scenario');
      });
    return () => {
      mounted = false;
    };
  }, [id]);

  // Reset per-scenario state when navigating between scenarios. The component
  // stays mounted across /scenario/:scenarioId transitions within the same
  // module (the load effect above keys on moduleId only), so without this the
  // grade screen and any typed free-response leak from one scenario to the next.
  useEffect(() => {
    setGrade(null);
    setFreeResponse('');
    setGrading(false);
  }, [scenarioId]);

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        <AlertCircle className="mb-1 inline h-4 w-4" /> {error}
      </div>
    );
  }

  if (!module) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const scenario: ModuleScenario | undefined = module.scenarios.find((s) => s.id === scenarioId);

  if (!scenario) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        Scenario not found.{' '}
        <Link to={`/module/${module.id}`} className="underline">
          Back to module
        </Link>
      </div>
    );
  }

  const handleEndRoleplay = async (transcript: ChatMessage[]) => {
    if (!id || !scenarioId) return;
    setGrading(true);
    try {
      const result = await ai.gradeRoleplay(id, scenarioId, transcript);
      setGrade(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Grading failed');
    } finally {
      setGrading(false);
    }
  };

  const handleSubmitFreeResponse = async () => {
    if (!id || !scenarioId || !freeResponse.trim()) return;
    setGrading(true);
    setError(null);
    try {
      const result = await ai.gradeResponse(id, scenarioId, freeResponse.trim());
      setGrade(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Grading failed');
    } finally {
      setGrading(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Link
          to={`/module/${module.id}`}
          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" /> Back to module
        </Link>
        <div className="flex items-center gap-2">
          {scenario.type === 'roleplay' && scenario.difficulty === 'easy' && (
            <span className="rounded-full bg-nt-green-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-nt-green-700">
              Easy
            </span>
          )}
          {scenario.type === 'roleplay' && scenario.difficulty === 'hard' && (
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
              Challenging
            </span>
          )}
          <span className="text-xs font-semibold uppercase tracking-wide text-nt-green-700">
            {scenario.type === 'roleplay' ? 'Roleplay' : 'Free response'} · Module {module.number}
          </span>
        </div>
      </div>

      <div className="card mb-6 p-5">
        <h1 className="text-lg font-semibold text-gray-900">Practice scenario</h1>
        <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{scenario.prompt}</p>
        {scenario.customer_persona && (
          <div className="mt-3 rounded-md bg-gray-50 p-3 text-xs text-gray-600">
            <span className="font-semibold text-gray-800">Customer persona:</span>{' '}
            {scenario.customer_persona}
          </div>
        )}
        {scenario.rubric?.length > 0 && (
          <div className="mt-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              You'll be graded on
            </div>
            <ul className="mt-1 list-disc space-y-0.5 pl-5 text-xs text-gray-700">
              {scenario.rubric.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {grade ? (() => {
        // Decide where the forward button leads. Treat the just-attempted
        // current scenario as attempted regardless of stale completion state.
        const completion = module.scenario_completion ?? {};
        const nextUnattempted = module.scenarios.find(
          (s) => s.id !== scenario.id && !completion[s.id]?.attempted,
        );
        const hasQuiz = (module.quiz || []).length > 0;
        let nextLabel: string;
        let nextHref: string;
        if (nextUnattempted) {
          nextLabel = 'Next';
          nextHref = `/module/${module.id}/scenario/${nextUnattempted.id}`;
        } else if (hasQuiz) {
          nextLabel = 'Start Quiz';
          nextHref = `/module/${module.id}/quiz`;
        } else {
          nextLabel = 'Back to module';
          nextHref = `/module/${module.id}`;
        }
        return (
          <GradeView
            grade={grade}
            type={scenario.type}
            onRetry={() => {
              setGrade(null);
              setFreeResponse('');
            }}
            onNext={() => navigate(nextHref)}
            nextLabel={nextLabel}
          />
        );
      })() : scenario.type === 'roleplay' ? (
        <div className="h-[60vh] min-h-[420px]">
          <AIChat
            mode="roleplay"
            moduleId={module.id}
            scenarioId={scenario.id}
            onEndConversation={handleEndRoleplay}
            initialGreeting={`(Customer line picks up — start the conversation as the CSR. ${scenario.customer_persona ?? ''})`}
          />
          {grading && (
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
              <Loader2 className="h-4 w-4 animate-spin" /> Grading your conversation…
            </div>
          )}
        </div>
      ) : (
        <div className="card p-5">
          <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Sparkles className="h-4 w-4 text-nt-green-700" />
            Your response
          </label>
          <textarea
            value={freeResponse}
            onChange={(e) => setFreeResponse(e.target.value)}
            rows={8}
            placeholder="Write your answer as if you're talking to the customer…"
            className="input"
          />
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={handleSubmitFreeResponse}
              disabled={grading || !freeResponse.trim()}
              className="btn-primary"
            >
              {grading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Submit for grading
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function GradeView({
  grade,
  type,
  onRetry,
  onNext,
  nextLabel,
}: {
  grade: RoleplayGrade | FreeResponseGrade;
  type: 'free_response' | 'roleplay';
  onRetry: () => void;
  onNext: () => void;
  nextLabel: string;
}) {
  const score = grade.score;
  const passed = score >= 7;

  // Decide between numeric X/10 and a status badge.
  // Free response: hide number when weaknesses are empty AND strengths are non-empty.
  // Roleplay: hide number when every perCriteria item is met.
  // Edge case (free response, both empty): show "Recorded".
  let scoreDisplay: 'numeric' | 'solid' | 'recorded' = 'numeric';
  if (type === 'free_response' && 'strengths' in grade) {
    const hasS = Array.isArray(grade.strengths) && grade.strengths.length > 0;
    const hasW = Array.isArray(grade.weaknesses) && grade.weaknesses.length > 0;
    if (!hasW && hasS) scoreDisplay = 'solid';
    else if (!hasW && !hasS) scoreDisplay = 'recorded';
  } else if (type === 'roleplay' && 'perCriteria' in grade) {
    const allMet = Array.isArray(grade.perCriteria)
      && grade.perCriteria.length > 0
      && grade.perCriteria.every((c) => c.met);
    if (allMet) scoreDisplay = 'solid';
  }

  return (
    <div className="card p-6">
      {scoreDisplay === 'numeric' && (
        <div
          className={`mb-5 rounded-lg p-4 ${
            passed ? 'bg-nt-green-50 text-nt-green-700' : 'bg-amber-50 text-amber-700'
          }`}
        >
          <div className="text-sm font-medium uppercase tracking-wide">Grade</div>
          <div className="text-3xl font-bold">{score} / 10</div>
        </div>
      )}
      {scoreDisplay === 'solid' && (
        <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-nt-green-50 px-4 py-2 text-sm font-semibold text-nt-green-700">
          <CheckCircle2 className="h-4 w-4" /> Solid
        </div>
      )}
      {scoreDisplay === 'recorded' && (
        <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">
          Recorded
        </div>
      )}

      <h3 className="mb-1 text-sm font-semibold text-gray-900">Feedback</h3>
      <p className="mb-4 whitespace-pre-wrap text-sm text-gray-700">{grade.feedback}</p>

      {type === 'free_response' && 'strengths' in grade && (() => {
        const hasStrengths = Array.isArray(grade.strengths) && grade.strengths.length > 0;
        const hasWeaknesses = Array.isArray(grade.weaknesses) && grade.weaknesses.length > 0;
        if (!hasStrengths && !hasWeaknesses) return null;
        // Single-section layout when only one bucket has content; two-up grid otherwise.
        const single = hasStrengths !== hasWeaknesses;
        return (
          <div className={single ? '' : 'grid grid-cols-1 gap-4 sm:grid-cols-2'}>
            {hasStrengths && (
              <div>
                <div className="mb-1 text-xs font-semibold uppercase text-nt-green-700">Strengths</div>
                <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
                  {grade.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
            {hasWeaknesses && (
              <div>
                <div className="mb-1 text-xs font-semibold uppercase text-amber-700">To improve</div>
                <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
                  {grade.weaknesses.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })()}

      {type === 'roleplay' && 'perCriteria' in grade && (
        <ul className="space-y-2">
          {grade.perCriteria.map((c, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              {c.met ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-nt-green-600" />
              ) : (
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              )}
              <div>
                <div className="font-medium text-gray-900">{c.criterion}</div>
                {c.note && <div className="text-gray-600">{c.note}</div>}
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 flex justify-end gap-2">
        {/* "Try again" only when the trainee actually flubbed it (score < 6).
            For score 6+ (including the "Solid" badge case, which always reflects
            a high underlying numeric), the only forward button is shown. If the
            API somehow didn't return a numeric, default to hiding Try Again. */}
        {typeof score === 'number' && score < 6 && (
          <button onClick={onRetry} className="btn-secondary">
            Try again
          </button>
        )}
        <button onClick={onNext} className="btn-primary">
          {nextLabel} <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

