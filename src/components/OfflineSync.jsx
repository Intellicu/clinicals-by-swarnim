import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { getQueueCount, subscribeQueue, flushQueue } from '@/lib/offline/syncQueue';

export default function OfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pending, setPending] = useState(getQueueCount());
  const [syncing, setSyncing] = useState(false);

  const sync = async () => {
    if (getQueueCount() === 0) return;
    setSyncing(true);
    const { synced, failed } = await flushQueue();
    setSyncing(false);
    setPending(getQueueCount());
    if (synced) toast.success(`${synced} item${synced > 1 ? 's' : ''} synced`);
    if (failed) toast.error(`${failed} item${failed > 1 ? 's' : ''} could not sync — will retry`);
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (getQueueCount() > 0) toast.success('Back online — syncing queued data…');
      sync();
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.info('Working offline — entries will sync when reconnected');
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    const unsub = subscribeQueue(setPending);
    if (navigator.onLine) sync(); // flush anything left over from a previous session
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsub();
    };
  }, []);

  if (isOnline && pending === 0) return null;

  return (
    <div className="fixed top-16 right-4 z-40 max-w-sm">
      <Alert className={isOnline ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}>
        {isOnline ? <Wifi className="w-4 h-4 text-green-600" /> : <WifiOff className="w-4 h-4 text-amber-600" />}
        <AlertDescription className={isOnline ? 'text-green-800' : 'text-amber-800'}>
          {isOnline ? (
            <span className="flex items-center gap-2">
              {syncing && <RefreshCw className="w-3 h-3 animate-spin" />}
              {syncing
                ? `Syncing ${pending} item${pending > 1 ? 's' : ''}…`
                : `${pending} item${pending > 1 ? 's' : ''} waiting to sync`}
              {!syncing && (
                <button onClick={sync} className="underline font-semibold">Sync now</button>
              )}
            </span>
          ) : pending > 0 ? (
            `Offline — ${pending} entr${pending > 1 ? 'ies' : 'y'} queued, will sync when reconnected`
          ) : (
            'Offline mode — data will sync when reconnected'
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
}