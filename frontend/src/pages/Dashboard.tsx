import { AlertCircle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { modules } from '../api/client';
import ModuleCard from '../components/ModuleCard';
import { useAuth } from '../contexts/AuthContext';
import type { ModuleSummary } from '../types';

export default function Dashboard() {
  const { user } = useAuth();
  const [items, setItems] = useState<ModuleSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    modules
      .list()
      .then((list) => {
        if (mounted) setItems(list);
      })
      .catch((err) => {
        if (mounted) setError(err instanceof Error ? err.message : 'Failed to load modules');
      });
    return () => {
      mounted = false;
    };
  }, []);

  const firstName = user?.name?.split(' ')[0] ?? user?.username ?? '';

  const completed = items?.filter((m) => m.status === 'completed').length ?? 0;
  const totalLearning = items ? Math.max(0, items.length - 1) : 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {firstName}</h1>
        <p className="mt-1 text-sm text-gray-600">
          {items
            ? `${completed} of ${items.length} modules completed`
            : 'Loading your training progress…'}
        </p>
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <div className="font-semibold">Couldn't load modules</div>
            <div>{error}</div>
          </div>
        </div>
      )}

      {!items && !error && (
        <div className="flex items-center justify-center py-20 text-gray-500">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}

      {items && (
        <>
          {totalLearning > 0 && (
            <section className="mb-8">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                Learning modules
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items
                  .filter((m) => m.number < 11)
                  .map((m) => (
                    <ModuleCard key={m.id} module={m} />
                  ))}
              </div>
            </section>
          )}

          {items.find((m) => m.number === 11) && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                Final certification
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <ModuleCard module={items.find((m) => m.number === 11)!} isFinalExam />
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
