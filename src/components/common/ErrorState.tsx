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
      className={`flex flex-col items-center justify-center p-10 rounded-3xl glass-panel text-center border-rose-500/30 relative overflow-hidden ${className}`}
      role="alert"
    >
      <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center text-rose-400 mb-4 shadow-lg shadow-rose-500/20">
          <AlertCircle size={24} />
        </div>
        <h3 className="text-sm font-extrabold text-white">{title}</h3>
        <p className="text-xs text-slate-300 mt-1.5 max-w-sm leading-relaxed">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-400/30 transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <RotateCcw size={13} />
            Retry Connection
          </button>
        )}
      </div>
    </div>
  );
}
