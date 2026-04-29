import { ArrowLeft, Award, Loader2, Printer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { exam } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import type { ExamResult } from '../types';

export default function Certificate() {
  const { user } = useAuth();
  const [result, setResult] = useState<ExamResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    exam
      .results()
      .then((r) => {
        if (mounted) setResult(r);
      })
      .catch((err) => {
        if (mounted) setError(err instanceof Error ? err.message : 'No exam results found');
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (error) {
    return (
      <div className="mx-auto max-w-2xl">
        <Link to="/" className="mb-3 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {error}. Pass the final exam to earn your certificate.
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!result.passed) {
    return (
      <div className="mx-auto max-w-2xl">
        <Link to="/" className="mb-3 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          You haven't passed the final exam yet. Retake it from the dashboard.
        </div>
      </div>
    );
  }

  const completedDate = result.completed_at
    ? new Date(result.completed_at)
    : new Date();
  const dateStr = completedDate.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const traineeName = result.user_name ?? user?.name ?? user?.username ?? '';
  const pct = Math.round((result.score / result.total) * 100);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="no-print mb-4 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>
        <button onClick={() => window.print()} className="btn-primary">
          <Printer className="h-4 w-4" /> Print certificate
        </button>
      </div>

      <div className="relative overflow-hidden rounded-2xl border-[6px] border-double border-nt-primary bg-white p-12 text-center shadow-md">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(0,191,99,0.06),_transparent_60%)]" />

        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-nt-primary text-white shadow">
          <Award className="h-8 w-8" />
        </div>

        <div className="text-sm font-semibold uppercase tracking-[0.25em] text-gray-500">
          Neighbors Trailer
        </div>
        <h1 className="mt-2 text-4xl font-bold text-gray-900">Certificate of Completion</h1>
        <p className="mt-3 text-sm text-gray-600">
          This certifies that
        </p>

        <div className="my-4 text-3xl font-semibold text-nt-primary-dark">{traineeName}</div>

        <p className="mx-auto max-w-md text-sm text-gray-700">
          has successfully completed the Neighbors Trailer Customer Service Representative training program
          and passed the final certification exam.
        </p>

        <div className="mx-auto mt-8 grid max-w-md grid-cols-2 gap-6 text-sm">
          <div>
            <div className="text-xs uppercase tracking-wide text-gray-500">Date</div>
            <div className="mt-0.5 font-semibold text-gray-900">{dateStr}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-gray-500">Final score</div>
            <div className="mt-0.5 font-semibold text-gray-900">
              {result.score} / {result.total} ({pct}%)
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-200 pt-4 text-xs text-gray-500">
          Neighbors Trailer · CSR Training Portal
        </div>
      </div>
    </div>
  );
}
