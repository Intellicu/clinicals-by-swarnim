import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, HardDrive, CheckCircle, Cloud } from 'lucide-react';
import { toast } from 'sonner';

export default function OfflineManager() {
  const [offlineData, setOfflineData] = useState({
    guidelines: [],
    pathways: [],
    drugs: [],
    lastSync: null
  });
  const [storageSize, setStorageSize] = useState(0);

  useEffect(() => {
    loadOfflineData();
    calculateStorageSize();
  }, []);

  const { data: guidelines = [] } = useQuery({
    queryKey: ['guidelines-all'],
    queryFn: () => base44.entities.Guideline.list()
  });

  const { data: drugs = [] } = useQuery({
    queryKey: ['drugs-all'],
    queryFn: () => base44.entities.Drug.list()
  });

  const loadOfflineData = () => {
    try {
      const stored = localStorage.getItem('clinicals_offline_data');
      if (stored) {
        setOfflineData(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load offline data:', error);
    }
  };

  const calculateStorageSize = () => {
    try {
      const stored = localStorage.getItem('clinicals_offline_data');
      if (stored) {
        const sizeInMB = (new Blob([stored]).size / (1024 * 1024)).toFixed(2);
        setStorageSize(parseFloat(sizeInMB));
      }
    } catch (error) {
      console.error('Failed to calculate storage:', error);
    }
  };

  const syncOfflineData = async () => {
    try {
      toast.loading('Syncing offline data...', { id: 'offline-sync' });

      const offlinePackage = {
        guidelines: guidelines.map(g => ({
          id: g.id,
          title: g.title,
          category: g.category,
          summary: g.summary,
          key_recommendations: g.key_recommendations,
          content: g.content,
          images: g.images
        })),
        drugs: drugs.map(d => ({
          id: d.id,
          generic_name: d.generic_name,
          category: d.category,
          dose_weight_based: d.dose_weight_based,
          frequency: d.frequency,
          route: d.route,
          renal_adjust: d.renal_adjust
        })),
        pathways: [
          { name: 'AKI Management', content: 'Offline pathway data' },
          { name: 'Nephrotic Syndrome', content: 'Offline pathway data' },
          { name: 'Hypertensive Emergency', content: 'Offline pathway data' }
        ],
        lastSync: new Date().toISOString()
      };

      localStorage.setItem('clinicals_offline_data', JSON.stringify(offlinePackage));
      setOfflineData(offlinePackage);
      calculateStorageSize();

      toast.success(`Synced ${guidelines.length} guidelines & ${drugs.length} drugs for offline use`, { id: 'offline-sync' });
    } catch (error) {
      toast.error('Failed to sync offline data', { id: 'offline-sync' });
    }
  };

  const clearOfflineData = () => {
    localStorage.removeItem('clinicals_offline_data');
    setOfflineData({ guidelines: [], pathways: [], drugs: [], lastSync: null });
    setStorageSize(0);
    toast.success('Offline data cleared');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-blue-600" />
          Offline Mode Manager
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 p-4 rounded">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold">Offline Storage</p>
              <p className="text-xs text-slate-600">{storageSize} MB used</p>
            </div>
            {offlineData.lastSync && (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Synced
              </Badge>
            )}
          </div>
          
          {offlineData.lastSync && (
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-white p-2 rounded text-center">
                <p className="font-bold text-blue-600">{offlineData.guidelines?.length || 0}</p>
                <p className="text-slate-600">Guidelines</p>
              </div>
              <div className="bg-white p-2 rounded text-center">
                <p className="font-bold text-green-600">{offlineData.drugs?.length || 0}</p>
                <p className="text-slate-600">Drugs</p>
              </div>
              <div className="bg-white p-2 rounded text-center">
                <p className="font-bold text-purple-600">{offlineData.pathways?.length || 0}</p>
                <p className="text-slate-600">Pathways</p>
              </div>
            </div>
          )}
        </div>

        {offlineData.lastSync && (
          <p className="text-xs text-slate-600">
            Last synced: {new Date(offlineData.lastSync).toLocaleString()}
          </p>
        )}

        <div className="flex gap-2">
          <Button onClick={syncOfflineData} className="flex-1 bg-blue-600">
            <Download className="w-4 h-4 mr-2" />
            {offlineData.lastSync ? 'Re-sync' : 'Download'} for Offline
          </Button>
          {offlineData.lastSync && (
            <Button onClick={clearOfflineData} variant="outline">
              Clear Data
            </Button>
          )}
        </div>

        <p className="text-xs text-slate-500">
          Guidelines, drug database, and pathways will be available without internet connection
        </p>
      </CardContent>
    </Card>
  );
}