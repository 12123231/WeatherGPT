import { Loader2 } from 'lucide-react';

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
      className={`flex flex-col items-center justify-center p-8 rounded-xl bg-white border border-slate-200 text-center ${className}`}
      role="status"
      aria-live="polite"
    >
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
      <p className="text-sm font-medium text-slate-700">{message}</p>
      <p className="text-xs text-slate-400 mt-1">Fetching telemetry and risk metrics</p>
    </div>
  );
}
