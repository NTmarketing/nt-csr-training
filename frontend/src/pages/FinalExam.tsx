import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  Loader2,
  XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { exam } from '../api/client';
import type { ExamQuestion, ExamResult, QuizAnswer } from '../types';

type Phase = 'intro' | 'taking' | 'submitting' | 'results';

export default function FinalExam() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('intro');
  const [examId, setExamId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [result, setResult] = useState<ExamResult | null>(null);

  const handleStart = async () => {
    setStarting(true);
    setError(null);
    try {
      const r = await exam.start();
      setExamId(r.examId);
      setQuestions(r.questions);
      setCurrentIdx(0);
      setAnswers({});
      setPhase('taking');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start exam');
    } finally {
      setStarting(false);
    }
  };

  const handleSubmit = async () => {
    if (!examId) return;
    setPhase('submitting');
    setError(null);
    try {
      const payload: QuizAnswer[] = questions.map((q) => ({
        questionId: q.id,
        answer: answers[q.id] ?? '',
      }));
      const r = await exam.submit(examId, payload);
      setResult(r);
      setPhase('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
      setPhase('taking');
    }
  };

  const allAnswered = useMemo(
    () => questions.length > 0 && questions.every((q) => answers[q.id] !== undefined && answers[q.id] !== ''),
    [questions, answers],
  );

  if (phase === 'intro') {
    return (
      <div className="mx-auto max-w-2xl">
        <Link to="/" className="mb-3 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>

        <div className="card border-2 border-nt-primary/30 bg-gradient-to-br from-white to-nt-primary/5 p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-nt-primary/10 text-nt-primary-dark">
            <Award className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Final Certification Exam</h1>
          <p className="mt-2 text-sm text-gray-600">
            This is the final cert exam. 25 questions across all modules. You'll need 21/25 (84%) to pass.
          </p>

          <ul className="mx-auto mt-5 max-w-md space-y-1 text-left text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-nt-primary" /> Questions are sampled from
              the full curriculum.
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-nt-primary" /> No AI tutor available
              during the exam.
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-nt-primary" /> You can navigate back to
              review answers before submitting.
            </li>
          </ul>

          {error && (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button onClick={handleStart} disabled={starting} className="btn-primary mx-auto mt-6">
            {starting && <Loader2 className="h-4 w-4 animate-spin" />}
            Start exam
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'results' && result) {
    return <ExamResultsView result={result} onDashboard={() => navigate('/')} />;
  }

  const current = questions[currentIdx];

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between text-sm text-gray-600">
        <span>
          Question <span className="font-semibold text-gray-900">{currentIdx + 1}</span> of {questions.length}
        </span>
        <span>{Object.keys(answers).length} answered</span>
      </div>

      <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full bg-nt-primary"
          style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className="card p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-900">{current.question}</h3>
        <ExamQuestionInput
          question={current}
          value={answers[current.id]}
          onChange={(v) => setAnswers((prev) => ({ ...prev, [current.id]: v }))}
        />

        {error && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
            disabled={currentIdx === 0}
            className="btn-secondary"
          >
            <ArrowLeft className="h-4 w-4" /> Previous
          </button>

          {currentIdx < questions.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))}
              className="btn-primary"
            >
              Next <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!allAnswered || phase === 'submitting'}
              className="btn-primary"
            >
              {phase === 'submitting' && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit exam
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ExamQuestionInput({
  question,
  value,
  onChange,
}: {
  question: ExamQuestion;
  value: string | number | undefined;
  onChange: (v: string | number) => void;
}) {
  if (question.type === 'multiple_choice' || question.type === 'true_false') {
    const options = question.options ?? (question.type === 'true_false' ? ['True', 'False'] : []);
    return (
      <div className="space-y-2">
        {options.map((opt, idx) => {
          const selected = value === idx;
          return (
            <label
              key={idx}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
                selected
                  ? 'border-nt-primary bg-nt-primary/5'
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name={question.id}
                checked={selected}
                onChange={() => onChange(idx)}
                className="mt-0.5 h-4 w-4 accent-nt-primary"
              />
              <span className="text-sm text-gray-800">{opt}</span>
            </label>
          );
        })}
      </div>
    );
  }
  return (
    <textarea
      value={(value as string) ?? ''}
      onChange={(e) => onChange(e.target.value)}
      rows={5}
      className="input"
      placeholder="Type your answer…"
    />
  );
}

function ExamResultsView({ result, onDashboard }: { result: ExamResult; onDashboard: () => void }) {
  const pct = Math.round((result.score / result.total) * 100);
  return (
    <div className="mx-auto max-w-2xl">
      <div
        className={`card mb-6 p-8 text-center ${
          result.passed ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'
        }`}
      >
        <div
          className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full ${
            result.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
          }`}
        >
          {result.passed ? <Award className="h-7 w-7" /> : <AlertCircle className="h-7 w-7" />}
        </div>
        <div className="text-sm font-semibold uppercase tracking-wide">
          {result.passed ? 'Certified' : 'Did not pass'}
        </div>
        <div className="mt-1 text-4xl font-bold text-gray-900">
          {result.score} / {result.total}
        </div>
        <div className="text-sm text-gray-600">{pct}%</div>

        <div className="mt-6 flex items-center justify-center gap-3">
          {result.passed ? (
            <Link to="/certificate" className="btn-primary">
              <Award className="h-4 w-4" /> View certificate
            </Link>
          ) : (
            <button onClick={onDashboard} className="btn-primary">
              Back to dashboard
            </button>
          )}
        </div>
      </div>

      {result.perModuleBreakdown && result.perModuleBreakdown.length > 0 && (
        <div className="card p-5">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Per-module breakdown</h3>
          <ul className="space-y-2">
            {result.perModuleBreakdown.map((b) => {
              const ok = b.correct === b.total;
              return (
                <li
                  key={b.module_ref}
                  className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2 text-sm"
                >
                  <span className="flex items-center gap-2">
                    {ok ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="font-medium text-gray-900">{b.module_ref}</span>
                  </span>
                  <span className="text-gray-700">
                    {b.correct} / {b.total}
                  </span>
                </li>
              );
            })}
          </ul>
          {!result.passed && (
            <p className="mt-3 text-xs text-gray-600">
              Review the modules where you missed questions, then retake the exam.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
