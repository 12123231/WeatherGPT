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
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
        isOnline
          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
          : isSyncing
          ? 'bg-blue-50 border-blue-200 text-blue-700'
          : 'bg-amber-50 border-amber-200 text-amber-700'
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
            isOnline ? 'bg-emerald-500' : isSyncing ? 'bg-blue-500' : 'bg-amber-500'
          }`}
        />
      </span>

      <div className="flex items-center gap-1">
        {isOnline ? (
          <Wifi size={12} className="shrink-0" />
        ) : isSyncing ? (
          <RefreshCw size={12} className="shrink-0 animate-spin" />
        ) : (
          <WifiOff size={12} className="shrink-0" />
        )}
        <span className="capitalize">{status}</span>
      </div>

      {lastSynced && (
        <span className="text-[11px] opacity-75 border-l border-current/20 pl-1.5 hidden sm:inline">
          {isOnline ? 'Synced' : 'Cached'}: {formatLastUpdated(lastSynced)}
        </span>
      )}
    </div>
  );
}
