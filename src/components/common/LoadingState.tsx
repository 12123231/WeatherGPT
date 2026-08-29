import { Loader2, Sparkles } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export default function LoadingState({
  message = 'Loading weather intelligence...',
  className = '',
}: LoadingStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-10 rounded-3xl glass-panel text-center relative overflow-hidden ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 mb-4 shadow-lg shadow-blue-500/20">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <p className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
          <Sparkles size={13} className="text-blue-400" />
          {message}
        </p>
        <p className="text-xs text-slate-400 mt-1">Synchronizing meteorological telemetry matrix</p>
      </div>
    </div>
  );
}
