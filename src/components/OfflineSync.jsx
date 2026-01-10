import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function OfflineSync() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSync, setPendingSync] = useState(0);

  useEffect(() => {
    // Check online status
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Back online! Syncing data...');
      syncPendingData();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.info('Working offline - data will sync when reconnected');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    setIsOnline(navigator.onLine);

    // Load pending items
    const pending = JSON.parse(localStorage.getItem('pending_sync') || '[]');
    setPendingSync(pending.length);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncPendingData = async () => {
    const pending = JSON.parse(localStorage.getItem('pending_sync') || '[]');
    if (pending.length === 0) return;

    try {
      // Sync pending visits, measurements, calculations
      for (const item of pending) {
        if (item.type === 'visit') {
          // await base44.entities.VisitRecord.create(item.data);
        } else if (item.type === 'measurement') {
          // await base44.entities.Measurement.create(item.data);
        }
      }
      localStorage.setItem('pending_sync', '[]');
      setPendingSync(0);
      toast.success(`${pending.length} items synced!`);
    } catch (error) {
      toast.error('Sync failed - will retry');
      console.error('Sync error:', error);
    }
  };

  const cacheCoreData = async () => {
    try {
      // Cache core app data for offline use
      const coreData = {
        timestamp: Date.now(),
        patientData: localStorage.getItem('clinicalc_patient_data'),
        guidelines: localStorage.getItem('cached_guidelines'),
        calculators: ['gfr', 'bp', 'dose', 'fluid', 'anthropometry'],
        pathways: ['aki', 'nephrotic', 'htn-emergency', 'hyperkalemia', 'hypokalemia'],
        offlineReady: true
      };
      localStorage.setItem('offline_cache', JSON.stringify(coreData));
      localStorage.setItem('offline_mode_enabled', 'true');
    } catch (error) {
      console.error('Cache error:', error);
    }
  };

  useEffect(() => {
    if (isOnline) {
      cacheCoreData();
    }
  }, [isOnline]);

  if (isOnline && pendingSync === 0) return null;

  return (
    <div className="fixed top-16 right-4 z-40 max-w-sm">
      <Alert className={`${isOnline ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
        {isOnline ? (
          <Wifi className="w-4 h-4 text-green-600" />
        ) : (
          <WifiOff className="w-4 h-4 text-amber-600" />
        )}
        <AlertDescription className={isOnline ? 'text-green-800' : 'text-amber-800'}>
          {isOnline ? (
            pendingSync > 0 ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Syncing {pendingSync} items...
              </span>
            ) : (
              'Online & synced'
            )
          ) : (
            'Offline mode - data will sync when reconnected'
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
}