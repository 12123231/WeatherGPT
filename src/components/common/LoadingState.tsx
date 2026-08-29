import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export default function LoadingState({
  message = 'Loading weather telemetry...',
  className = '',
}: LoadingStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-10 rounded-2xl glass-panel text-center ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-sky-400 mb-3">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
        <p className="text-sm font-semibold text-white tracking-tight">
          {message}
        </p>
        <p className="text-xs text-slate-400 mt-1">Connecting to meteorological telemetry network</p>
      </div>
    </div>
  );
}
