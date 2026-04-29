import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ModuleQuizQuestion, QuizAnswer, QuizResult } from '../types';

interface Props {
  questions: ModuleQuizQuestion[];
  onSubmit: (answers: QuizAnswer[]) => Promise<QuizResult>;
  passingPct?: number;
}

export default function Quiz({ questions, onSubmit, passingPct = 70 }: Props) {
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<QuizResult | null>(null);

  const current = questions[currentIdx];
  const total = questions.length;

  const isAnswered = (q: ModuleQuizQuestion): boolean => {
    const v = answers[q.id];
    if (v === undefined) return false;
    if (q.type === 'short_answer') return typeof v === 'string' && v.trim().length > 0;
    return v !== '';
  };

  const currentAnswered = isAnswered(current);
  const allAnswered = useMemo(
    () => questions.every(isAnswered),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [questions, answers],
  );

  const setAnswer = (qid: string, value: string | number) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const payload: QuizAnswer[] = questions.map((q) => ({
        questionId: q.id,
        answer: answers[q.id] ?? '',
      }));
      const r = await onSubmit(payload);
      setResult(r);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return <QuizResultsView result={result} questions={questions} passingPct={passingPct} />;
  }

  return (
    <div className="card mx-auto max-w-2xl p-6">
      <div className="mb-4 flex items-center justify-between text-sm text-gray-600">
        <span>
          Question <span className="font-semibold text-gray-900">{currentIdx + 1}</span> of {total}
        </span>
        <span>{Object.keys(answers).length} answered</span>
      </div>

      <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full bg-nt-primary transition-all"
          style={{ width: `${((currentIdx + 1) / total) * 100}%` }}
        />
      </div>

      <h3 className="mb-5 text-lg font-semibold text-gray-900">{current.question}</h3>

      <QuestionInput
        question={current}
        value={answers[current.id]}
        onChange={(v) => setAnswer(current.id, v)}
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

        {currentIdx < total - 1 ? (
          <div className="flex flex-col items-end gap-1">
            <button
              type="button"
              onClick={() => setCurrentIdx((i) => Math.min(total - 1, i + 1))}
              disabled={!currentAnswered}
              className="btn-primary"
            >
              Next <ArrowRight className="h-4 w-4" />
            </button>
            {!currentAnswered && (
              <span className="text-xs text-gray-500">Select an answer to continue</span>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-end gap-1">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
              className="btn-primary"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Submit quiz
            </button>
            {!allAnswered && (
              <span className="text-xs text-gray-500">Answer all questions to submit</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function QuestionInput({
  question,
  value,
  onChange,
}: {
  question: ModuleQuizQuestion;
  value: string | number | undefined;
  onChange: (v: string | number) => void;
}) {
  if (question.type === 'multiple_choice' || question.type === 'true_false') {
    const options =
      question.options ?? (question.type === 'true_false' ? ['True', 'False'] : []);
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
      rows={4}
      placeholder="Type your answer…"
      className="input"
    />
  );
}

function QuizResultsView({
  result,
  questions,
  passingPct,
}: {
  result: QuizResult;
  questions: ModuleQuizQuestion[];
  passingPct: number;
}) {
  const pct = Math.round((result.score / result.total) * 100);
  return (
    <div className="card mx-auto max-w-2xl p-6">
      <div
        className={`mb-6 rounded-lg p-4 ${
          result.passed ? 'bg-emerald-50 text-emerald-900' : 'bg-amber-50 text-amber-900'
        }`}
      >
        <div className="text-sm font-medium uppercase tracking-wide">
          {result.passed ? 'Passed' : 'Did not pass'}
        </div>
        <div className="mt-1 text-3xl font-bold">
          {result.score} / {result.total} <span className="text-base font-medium">({pct}%)</span>
        </div>
        <div className="mt-1 text-sm">
          {result.passed
            ? 'Module marked complete. Nice work.'
            : `You need ${passingPct}% to pass — review the module and try again.`}
        </div>
      </div>

      <ol className="space-y-4">
        {questions.map((q, idx) => {
          const fb = result.feedback.find((f) => f.questionId === q.id);
          if (!fb) return null;
          return (
            <li key={q.id} className="rounded-lg border border-gray-200 p-4">
              <div className="mb-1 flex items-start gap-2">
                {fb.correct ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                ) : (
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                )}
                <div>
                  <div className="text-xs font-semibold uppercase text-gray-500">
                    Question {idx + 1}
                  </div>
                  <div className="font-medium text-gray-900">{q.question}</div>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-700">{fb.explanation || q.explanation}</div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
