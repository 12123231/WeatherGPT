import { useState, useEffect } from 'react';
import type { ConnectionStatus } from '../types/weather';

/**
 * Simple connection status hook.
 * Uses the browser's online/offline events for now.
 * TODO: Enhance with real service-worker and backend ping when available.
 */
export function useConnectionStatus() {
  const [status, setStatus] = useState<ConnectionStatus>(
    navigator.onLine ? 'online' : 'offline'
  );
  const [lastSynced, setLastSynced] = useState<string>(new Date().toISOString());

  useEffect(() => {
    const goOnline = () => {
      setStatus('online');
      setLastSynced(new Date().toISOString());
    };
    const goOffline = () => setStatus('offline');

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return { status, lastSynced };
}
