import { ArrowRight, CheckCircle2, Clock, Lock, PlayCircle, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ModuleSummary } from '../types';

interface Props {
  module: ModuleSummary;
  isFinalExam?: boolean;
}

const STATUS_CONFIG: Record<
  ModuleSummary['status'],
  { label: string; color: string; icon: React.ReactNode }
> = {
  completed: {
    label: 'Completed',
    color: 'bg-emerald-100 text-emerald-800 ring-emerald-600/20',
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  in_progress: {
    label: 'In progress',
    color: 'bg-amber-100 text-amber-800 ring-amber-600/20',
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  available: {
    label: 'Available',
    color: 'bg-blue-100 text-blue-800 ring-blue-600/20',
    icon: <PlayCircle className="h-3.5 w-3.5" />,
  },
  locked: {
    label: 'Locked',
    color: 'bg-gray-100 text-gray-600 ring-gray-500/20',
    icon: <Lock className="h-3.5 w-3.5" />,
  },
};

function ctaText(status: ModuleSummary['status'], isFinalExam: boolean) {
  if (isFinalExam) {
    if (status === 'completed') return 'View certificate';
    if (status === 'locked') return 'Locked';
    return 'Start exam';
  }
  if (status === 'completed') return 'Review';
  if (status === 'in_progress') return 'Continue';
  if (status === 'available') return 'Start';
  return 'Locked';
}

export default function ModuleCard({ module, isFinalExam = false }: Props) {
  const statusCfg = STATUS_CONFIG[module.status];
  const locked = module.status === 'locked';

  const target = isFinalExam
    ? module.status === 'completed'
      ? '/certificate'
      : '/exam'
    : `/module/${module.id}`;

  const cardClasses = isFinalExam
    ? 'card relative flex flex-col overflow-hidden border-2 border-nt-primary/40 bg-gradient-to-br from-white to-nt-primary/5 p-6 shadow-md sm:col-span-2 lg:col-span-3'
    : 'card flex flex-col p-5 transition hover:shadow-md';

  return (
    <div className={cardClasses}>
      {isFinalExam && (
        <div className="absolute right-4 top-4 hidden sm:block">
          <Trophy className="h-10 w-10 text-nt-primary/40" />
        </div>
      )}

      <div className="mb-3 flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center text-xs font-semibold uppercase tracking-wide ${
            isFinalExam ? 'text-nt-primary-dark' : 'text-gray-500'
          }`}
        >
          {isFinalExam ? 'Final certification' : `Module ${module.number}`}
        </span>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${statusCfg.color}`}
        >
          {statusCfg.icon}
          {statusCfg.label}
        </span>
      </div>

      <h3 className={`font-semibold text-gray-900 ${isFinalExam ? 'text-2xl' : 'text-lg'}`}>
        {module.title}
      </h3>
      <p className="mt-1 line-clamp-2 text-sm text-gray-600">{module.description}</p>

      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          ~{module.estimated_minutes} min
        </span>
        {module.quiz_score !== null && (
          <span className="font-medium text-gray-700">
            Quiz: <span className="text-nt-primary-dark">{module.quiz_score}%</span>
          </span>
        )}
      </div>

      <div className="mt-5 flex justify-end">
        {locked ? (
          <span className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-500">
            <Lock className="h-4 w-4" /> Locked
          </span>
        ) : (
          <Link to={target} className="btn-primary">
            {ctaText(module.status, isFinalExam)}
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
