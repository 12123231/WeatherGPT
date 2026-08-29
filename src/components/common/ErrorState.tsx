import { AlertCircle, RotateCcw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export default function ErrorState({
  title = 'Failed to load weather data',
  message,
  onRetry,
  className = '',
}: ErrorStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-10 rounded-2xl glass-panel text-center border-rose-500/20 ${className}`}
      role="alert"
    >
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-rose-500/30 flex items-center justify-center text-rose-400 mb-3">
          <AlertCircle size={20} />
        </div>
        <h3 className="text-sm font-bold text-white">{title}</h3>
        <p className="text-xs text-slate-300 mt-1 max-w-sm leading-relaxed">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-rose-300 border border-rose-500/30 transition-colors cursor-pointer"
          >
            <RotateCcw size={12} />
            Retry Connection
          </button>
        )}
      </div>
    </div>
  );
}
