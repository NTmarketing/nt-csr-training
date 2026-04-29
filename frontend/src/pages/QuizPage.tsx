import { AlertCircle, ArrowLeft, BookOpen, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { modules, quiz } from '../api/client';
import Quiz from '../components/Quiz';
import type { ModuleFull, QuizAnswer, QuizResult } from '../types';

export default function QuizPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [module, setModule] = useState<ModuleFull | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    modules
      .get(id)
      .then((m) => {
        if (mounted) setModule(m);
      })
      .catch((err) => {
        if (mounted) setError(err instanceof Error ? err.message : 'Failed to load quiz');
      });
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleSubmit = async (answers: QuizAnswer[]) => {
    if (!id) throw new Error('Missing module id');
    const r = await quiz.submit(id, answers);
    setResult(r);
    return r;
  };

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        <div className="flex items-center gap-2 font-semibold">
          <AlertCircle className="h-4 w-4" /> Couldn't load quiz
        </div>
        <p className="mt-1">{error}</p>
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

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Link
          to={`/module/${module.id}`}
          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" /> Back to module
        </Link>
      </div>

      <div className="mb-6 text-center">
        <div className="text-xs font-semibold uppercase tracking-wide text-nt-primary-dark">
          Module {module.number} Quiz
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{module.title}</h1>
        <p className="mt-1 text-sm text-gray-600">
          {module.quiz.length} questions · Pass with {module.passing_score_percent ?? 70}%
        </p>
      </div>

      <Quiz
        questions={module.quiz}
        onSubmit={handleSubmit}
        passingPct={module.passing_score_percent ?? 70}
      />

      {result && (
        <div className="mx-auto mt-6 flex max-w-2xl justify-center gap-3">
          {result.passed ? (
            <button onClick={() => navigate('/')} className="btn-primary">
              Back to dashboard
            </button>
          ) : (
            <>
              <Link to={`/module/${module.id}`} className="btn-secondary">
                <BookOpen className="h-4 w-4" /> Review module
              </Link>
              <button onClick={() => window.location.reload()} className="btn-primary">
                Retry quiz
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
