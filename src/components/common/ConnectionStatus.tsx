import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import type { ConnectionStatus as ConnectionStatusType } from '../../types/weather';
import { formatLastUpdated } from '../../utils/formatters';

interface ConnectionStatusProps {
  status: ConnectionStatusType;
  lastSynced?: string;
  className?: string;
}

export default function ConnectionStatus({
  status,
  lastSynced,
  className = '',
}: ConnectionStatusProps) {
  const isOnline = status === 'online';
  const isSyncing = status === 'syncing';

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border backdrop-blur-md transition-colors ${
        isOnline
          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
          : isSyncing
          ? 'bg-sky-500/10 border-sky-500/20 text-sky-400'
          : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
      } ${className}`}
      title={
        isOnline
          ? 'Connected to live telemetry network'
          : isSyncing
          ? 'Synchronizing meteorological data...'
          : 'Offline mode: displaying cached forecast'
      }
    >
      <span className="relative flex h-1.5 w-1.5">
        <span
          className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
            isOnline ? 'bg-emerald-400' : isSyncing ? 'bg-sky-400' : 'bg-amber-400'
          }`}
        />
      </span>

      <div className="flex items-center gap-1">
        {isOnline ? (
          <Wifi size={11} className="shrink-0 text-emerald-400" />
        ) : isSyncing ? (
          <RefreshCw size={11} className="shrink-0 animate-spin text-sky-400" />
        ) : (
          <WifiOff size={11} className="shrink-0 text-amber-400" />
        )}
        <span className="capitalize text-[11px]">{status}</span>
      </div>

      {lastSynced && (
        <span className="text-[10px] text-slate-400 border-l border-white/[0.1] pl-1.5 hidden sm:inline">
          {formatLastUpdated(lastSynced)}
        </span>
      )}
    </div>
  );
}
