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
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-md transition-all duration-200 ${
        isOnline
          ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-300 shadow-sm shadow-emerald-500/10'
          : isSyncing
          ? 'bg-blue-500/15 border-blue-400/30 text-blue-300 shadow-sm shadow-blue-500/10'
          : 'bg-amber-500/15 border-amber-400/30 text-amber-300 shadow-sm shadow-amber-500/10'
      } ${className}`}
      title={
        isOnline
          ? 'Connected to live weather network'
          : isSyncing
          ? 'Synchronizing weather updates...'
          : 'Offline mode: displaying cached forecast data'
      }
    >
      <span className="relative flex h-2 w-2">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            isOnline ? 'bg-emerald-400' : isSyncing ? 'bg-blue-400' : 'bg-amber-400'
          }`}
        />
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            isOnline ? 'bg-emerald-400' : isSyncing ? 'bg-blue-400' : 'bg-amber-400'
          }`}
        />
      </span>

      <div className="flex items-center gap-1.5">
        {isOnline ? (
          <Wifi size={12} className="shrink-0 text-emerald-400" />
        ) : isSyncing ? (
          <RefreshCw size={12} className="shrink-0 animate-spin text-blue-400" />
        ) : (
          <WifiOff size={12} className="shrink-0 text-amber-400" />
        )}
        <span className="capitalize">{status}</span>
      </div>

      {lastSynced && (
        <span className="text-[10px] text-slate-300 border-l border-white/20 pl-1.5 hidden sm:inline">
          {isOnline ? 'Synced' : 'Cached'}: {formatLastUpdated(lastSynced)}
        </span>
      )}
    </div>
  );
}
