import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Circle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  Loader2,
  MessageSquare,
  Target,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { modules, progress, sections } from '../api/client';
import AIChat from '../components/AIChat';
import Markdown from '../components/Markdown';
import MediaBlock from '../components/MediaBlock';
import ProgressBar from '../components/ProgressBar';
import type { ModuleFull } from '../types';

type Phase = 1 | 2 | 3;

const TONE_BADGES: Record<string, string> = {
  casual: 'bg-gray-100 text-gray-700',
  professional: 'bg-blue-100 text-blue-800',
  escalated: 'bg-red-100 text-red-800',
};
const TONE_LABEL: Record<string, string> = {
  casual: 'Casual',
  professional: 'Professional',
  escalated: 'Escalated',
};

export default function Module() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [module, setModule] = useState<ModuleFull | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sectionIdx, setSectionIdx] = useState(0);
  const [viewedSections, setViewedSections] = useState<Set<string>>(new Set());
  const [chatOpen, setChatOpen] = useState(false);
  const [objectivesOpen, setObjectivesOpen] = useState(true);

  const sectionTimer = useRef<{ moduleId: string; sectionId: string; start: number } | null>(null);

  const flushSectionTime = (useBeacon = false) => {
    const t = sectionTimer.current;
    sectionTimer.current = null;
    if (!t) return;
    const elapsed = Math.round((Date.now() - t.start) / 1000);
    if (elapsed < 2) return;
    const capped = Math.min(elapsed, 3600);
    if (useBeacon && typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const payload = JSON.stringify({
        moduleId: t.moduleId,
        sectionId: t.sectionId,
        durationSeconds: capped,
      });
      navigator.sendBeacon('/api/sections/view', new Blob([payload], { type: 'application/json' }));
    } else {
      sections.recordView(t.moduleId, t.sectionId, capped).catch(() => {});
    }
  };

  const startSectionTimer = (moduleId: string, sectionId: string) => {
    sectionTimer.current = { moduleId, sectionId, start: Date.now() };
  };

  const recordSectionViewed = (moduleId: string, sectionId: string) => {
    setViewedSections((prev) => {
      if (prev.has(sectionId)) return prev;
      const next = new Set(prev);
      next.add(sectionId);
      return next;
    });
    progress.markSectionViewed(moduleId, sectionId).catch(() => {});
  };

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    setModule(null);
    setSectionIdx(0);
    setViewedSections(new Set());
    setError(null);

    Promise.all([modules.get(id), progress.start(id).catch(() => null)])
      .then(([m]) => {
        if (!mounted) return;
        setModule(m);
        const persisted = new Set<string>(m.sections_viewed || []);
        if (m.sections.length) {
          persisted.add(m.sections[0].id);
          setViewedSections(persisted);
          startSectionTimer(m.id, m.sections[0].id);
          // Persist the first section as viewed (if not already).
          if (!(m.sections_viewed || []).includes(m.sections[0].id)) {
            progress.markSectionViewed(m.id, m.sections[0].id).catch(() => {});
          }
        } else {
          setViewedSections(persisted);
        }
      })
      .catch((err) => {
        if (mounted) setError(err instanceof Error ? err.message : 'Failed to load module');
      });

    return () => {
      mounted = false;
      flushSectionTime();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const onBeforeUnload = () => flushSectionTime(true);
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch when the tab regains focus so scenario completion + sections_viewed
  // sync after the trainee returns from /module/:id/scenario/:scenarioId.
  useEffect(() => {
    if (!id) return;
    const refetch = () => {
      modules
        .get(id)
        .then((m) =>
          setModule((prev) =>
            prev
              ? {
                  ...prev,
                  scenario_completion: m.scenario_completion,
                  sections_viewed: m.sections_viewed,
                }
              : m,
          ),
        )
        .then(() => {
          // hydrate viewedSections from server-merged state
          setViewedSections((prev) => {
            const merged = new Set(prev);
            return merged;
          });
        })
        .catch(() => {});
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible') refetch();
    };
    window.addEventListener('focus', refetch);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('focus', refetch);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [id]);

  // When sections_viewed changes from server, merge into viewed set.
  useEffect(() => {
    if (!module?.sections_viewed) return;
    setViewedSections((prev) => {
      const next = new Set(prev);
      let changed = false;
      for (const sid of module.sections_viewed) {
        if (!next.has(sid)) {
          next.add(sid);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [module?.sections_viewed]);

  const totalSections = module?.sections.length ?? 0;
  const allViewed = useMemo(
    () => !!module && module.sections.every((s) => viewedSections.has(s.id)),
    [module, viewedSections],
  );

  const scenarios = module?.scenarios ?? [];
  const completion = module?.scenario_completion ?? {};
  const completedScenarios = useMemo(
    () => scenarios.filter((s) => completion[s.id]?.attempted).length,
    [scenarios, completion],
  );
  const hasScenarios = scenarios.length > 0;
  const allScenariosDone = !hasScenarios || completedScenarios === scenarios.length;

  const phase2Visible = allViewed; // hide until lessons done
  const phase3Visible = allViewed && allScenariosDone; // hide until practice done
  const quizUnlocked = phase3Visible;

  const currentPhase: Phase = !allViewed
    ? 1
    : !allScenariosDone
      ? 2
      : 3;

  const goToSection = (idx: number) => {
    if (!module) return;
    const clamped = Math.max(0, Math.min(module.sections.length - 1, idx));
    if (clamped === sectionIdx) return;

    // Mark current section viewed (covers "scrolled past" — we treat advancing
    // past the section as having viewed it).
    if (clamped > sectionIdx) {
      const current = module.sections[sectionIdx];
      if (current) recordSectionViewed(module.id, current.id);
    }

    flushSectionTime();
    setSectionIdx(clamped);
    const next = module.sections[clamped];
    recordSectionViewed(module.id, next.id);
    startSectionTimer(module.id, next.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        <div className="flex items-center gap-2 font-semibold">
          <AlertCircle className="h-4 w-4" /> Couldn't load module
        </div>
        <p className="mt-1">{error}</p>
        <Link to="/" className="mt-2 inline-block text-red-900 underline">
          Back to dashboard
        </Link>
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

  const section = module.sections[sectionIdx];
  const totalPhases = hasScenarios ? 3 : 2;
  const stepsForIndicator = hasScenarios
    ? [
        { n: 1, label: 'Lessons', active: currentPhase === 1, done: allViewed },
        { n: 2, label: 'Practice', active: currentPhase === 2, done: allScenariosDone },
        { n: 3, label: 'Quiz', active: currentPhase === 3, done: false },
      ]
    : [
        { n: 1, label: 'Lessons', active: currentPhase === 1, done: allViewed },
        { n: 2, label: 'Quiz', active: currentPhase === 3, done: false },
      ];

  const nextUpBanner =
    currentPhase === 1
      ? hasScenarios
        ? 'Complete all sections to unlock practice scenarios.'
        : 'Complete all sections to unlock the quiz.'
      : currentPhase === 2
        ? 'Complete all scenarios to unlock the quiz.'
        : '';

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <Link to="/" className="mb-3 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </Link>

        <div className="mb-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-nt-primary-dark">
            Module {module.number}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{module.title}</h1>
          <p className="mt-1 text-sm text-gray-600">{module.description}</p>
        </div>

        <PhaseIndicator steps={stepsForIndicator} />

        <div className="mb-5">
          <ProgressBar value={viewedSections.size} max={totalSections} label="Sections viewed" />
        </div>

        {nextUpBanner && (
          <div className="mb-5 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
            <span className="font-semibold">Next up:</span> {nextUpBanner}
          </div>
        )}

        {module.learning_objectives?.length > 0 && (
          <div className="card mb-5">
            <button
              type="button"
              onClick={() => setObjectivesOpen((v) => !v)}
              className="flex w-full items-center justify-between p-4 text-left"
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <Target className="h-4 w-4 text-nt-primary-dark" />
                Learning objectives
              </span>
              {objectivesOpen ? (
                <ChevronUp className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              )}
            </button>
            {objectivesOpen && (
              <ul className="list-disc space-y-1 px-4 pb-4 pl-9 text-sm text-gray-700">
                {module.learning_objectives.map((obj, i) => (
                  <li key={i}>{obj}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Phase 1 — Lessons (always visible) */}
        <PhaseHeader step={1} total={totalPhases} title="Lessons" done={allViewed} />

        <div className="card p-6">
          <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
            <span>
              Section {sectionIdx + 1} of {totalSections}
            </span>
          </div>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">{section.title}</h2>

          <Markdown source={section.content_md} />

          {section.media && section.media.length > 0 && (
            <div className="mt-4">
              {section.media.map((block, i) => (
                <MediaBlock key={i} block={block} />
              ))}
            </div>
          )}

          {section.key_points?.length > 0 && (
            <div className="mt-6 rounded-lg border border-nt-primary/20 bg-nt-primary/5 p-4">
              <div className="mb-2 text-sm font-semibold text-nt-primary-dark">Key points</div>
              <ul className="list-disc space-y-1 pl-5 text-sm text-gray-800">
                {section.key_points.map((kp, i) => (
                  <li key={i}>{kp}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={() => goToSection(sectionIdx - 1)}
              disabled={sectionIdx === 0}
              className="btn-secondary"
            >
              <ArrowLeft className="h-4 w-4" /> Previous
            </button>

            {sectionIdx < totalSections - 1 ? (
              <button type="button" onClick={() => goToSection(sectionIdx + 1)} className="btn-primary">
                Next section <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (module && section) recordSectionViewed(module.id, section.id);
                }}
                disabled={allViewed}
                className="btn-primary"
              >
                {allViewed ? 'Lessons complete' : 'Mark lessons complete'}
              </button>
            )}
          </div>
        </div>

        {/* Phase 2 — Practice scenarios — hidden until Phase 1 complete */}
        {hasScenarios && phase2Visible && (
          <div className="mt-8">
            <PhaseHeader
              step={2}
              total={totalPhases}
              title="Practice scenarios"
              done={allScenariosDone}
              progress={`${completedScenarios} / ${scenarios.length}`}
            />
            <div
              className={`rounded-lg border p-4 ${
                allScenariosDone
                  ? 'border-emerald-200 bg-emerald-50/40'
                  : 'border-amber-200 bg-amber-50/40'
              }`}
            >
              <div className="mb-3 flex items-start gap-2 text-sm">
                <span className="font-medium text-gray-900">
                  Required: complete all practice scenarios before the quiz.
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {scenarios.map((sc) => {
                  const attempted = !!completion[sc.id]?.attempted;
                  const tone = sc.tone || 'professional';
                  return (
                    <Link key={sc.id} to={`/module/${module.id}/scenario/${sc.id}`}>
                      <div className="card flex h-full flex-col p-4 transition hover:shadow-md">
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold uppercase tracking-wide text-nt-primary-dark">
                              {sc.type === 'roleplay' ? 'Roleplay' : 'Free response'}
                            </span>
                            <ToneBadge tone={tone} />
                          </div>
                          {attempted ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                              <CheckCircle2 className="h-3 w-3" /> Completed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">
                              <Circle className="h-3 w-3" /> Not yet
                            </span>
                          )}
                        </div>
                        <p className="mt-2 line-clamp-3 text-sm text-gray-800">{sc.prompt}</p>
                        <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-gray-600">
                          {attempted ? 'Practice again' : 'Start practice'}{' '}
                          <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Phase 3 — Quiz — hidden until Phase 2 complete */}
        {phase3Visible && (
          <div className="mt-8">
            <PhaseHeader
              step={hasScenarios ? 3 : 2}
              total={totalPhases}
              title="Quiz"
              done={false}
            />
            <div className="rounded-lg border border-nt-primary/30 bg-nt-primary/5 p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm">
                  <span className="font-medium text-gray-900">
                    Ready when you are. You'll need {module.passing_score_percent}% to pass.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/module/${module.id}/quiz`)}
                  disabled={!quizUnlocked}
                  className="btn-primary shrink-0"
                  title={quizUnlocked ? 'Take the quiz' : 'Quiz locked'}
                >
                  <ClipboardCheck className="h-4 w-4" /> Take quiz
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <aside className="hidden lg:col-span-2 lg:block">
        <div className="sticky top-20 h-[calc(100vh-6rem)]">
          <AIChat
            mode="tutor"
            moduleId={module.id}
            initialGreeting={`Hi! I'm your AI tutor for "${module.title}". Ask me anything about the material — I can clarify, give examples, or quiz you.`}
          />
        </div>
      </aside>

      <button
        type="button"
        onClick={() => setChatOpen(true)}
        className="fixed bottom-4 right-4 z-30 inline-flex items-center gap-2 rounded-full bg-nt-primary px-4 py-3 text-sm font-semibold text-white shadow-lg lg:hidden"
      >
        <MessageSquare className="h-4 w-4" /> AI Tutor
      </button>

      {chatOpen && (
        <div className="fixed inset-0 z-40 flex flex-col bg-white lg:hidden">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <span className="font-semibold">AI Tutor</span>
            <button type="button" onClick={() => setChatOpen(false)} aria-label="Close">
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <AIChat
              mode="tutor"
              moduleId={module.id}
              initialGreeting={`Hi! I'm your AI tutor for "${module.title}".`}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function PhaseHeader({
  step,
  total,
  title,
  done,
  progress,
}: {
  step: number;
  total: number;
  title: string;
  done: boolean;
  progress?: string;
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
            done ? 'bg-emerald-600 text-white' : 'bg-nt-primary text-white'
          }`}
        >
          {done ? <CheckCircle2 className="h-4 w-4" /> : step}
        </span>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
          Phase {step} of {total} — {title}
        </h3>
      </div>
      {progress && <span className="text-xs font-medium text-gray-600">{progress}</span>}
    </div>
  );
}

function PhaseIndicator({
  steps,
}: {
  steps: { n: number; label: string; active: boolean; done: boolean }[];
}) {
  return (
    <ol className="mb-5 flex items-center gap-2 text-xs font-medium">
      {steps.map((s, i) => (
        <li key={s.n} className="flex items-center gap-2">
          <span
            className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
              s.done
                ? 'bg-emerald-600 text-white'
                : s.active
                  ? 'bg-nt-primary text-white'
                  : 'bg-gray-200 text-gray-500'
            }`}
          >
            {s.done ? <CheckCircle2 className="h-3.5 w-3.5" /> : s.n}
          </span>
          <span
            className={
              s.active
                ? 'text-nt-primary-dark'
                : s.done
                  ? 'text-emerald-700'
                  : 'text-gray-500'
            }
          >
            {s.label}
          </span>
          {i < steps.length - 1 && <span className="text-gray-300">→</span>}
        </li>
      ))}
    </ol>
  );
}

function ToneBadge({ tone }: { tone: string }) {
  const cls = TONE_BADGES[tone] || TONE_BADGES.professional;
  const label = TONE_LABEL[tone] || TONE_LABEL.professional;
  return (
    <span className={`inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${cls}`}>
      {label}
    </span>
  );
}
