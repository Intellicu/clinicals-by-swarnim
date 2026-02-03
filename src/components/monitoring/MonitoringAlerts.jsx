import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

export default function MonitoringAlerts({ logs, monitoringPlan }) {
  const generateAlerts = () => {
    const alerts = [];
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Check adherence
    const recentLogs = logs.filter(log => new Date(log.log_date) >= sevenDaysAgo);
    const expectedLogs = 7 * (monitoringPlan?.modules?.filter(m => m.enabled && m.mandatory).length || 0);
    const adherenceRate = expectedLogs > 0 ? (recentLogs.length / expectedLogs) * 100 : 100;

    if (adherenceRate < 50) {
      alerts.push({
        type: 'urgent',
        title: 'Low Adherence',
        message: `Only ${adherenceRate.toFixed(0)}% of required logs completed in last 7 days`,
        icon: AlertCircle
      });
    } else if (adherenceRate < 80) {
      alerts.push({
        type: 'warning',
        title: 'Incomplete Logging',
        message: `${adherenceRate.toFixed(0)}% adherence - encourage daily logging`,
        icon: AlertTriangle
      });
    }

    // Check for proteinuria trend
    const proteinLogs = logs
      .filter(log => log.module_type === 'Urine_Protein')
      .sort((a, b) => new Date(b.log_date) - new Date(a.log_date))
      .slice(0, 3);

    if (proteinLogs.length >= 3) {
      const proteinMap = { 'Negative': 0, 'Trace': 0.5, '1+': 1, '2+': 2, '3+': 3, '4+': 4 };
      const values = proteinLogs.map(log => proteinMap[log.protein_result] || 0);
      const isIncreasing = values[0] > values[1] && values[1] > values[2];

      if (isIncreasing && values[0] >= 2) {
        alerts.push({
          type: 'urgent',
          title: 'Rising Proteinuria',
          message: 'Protein levels increasing over last 3 days - review needed',
          icon: AlertCircle
        });
      }
    }

    // Check BP if available
    const recentBP = logs
      .filter(log => log.module_type === 'Blood_Pressure' && new Date(log.log_date) >= sevenDaysAgo)
      .sort((a, b) => new Date(b.log_date) - new Date(a.log_date));

    const highBPCount = recentBP.filter(log => log.bp_systolic >= 140 || log.bp_diastolic >= 90).length;
    if (highBPCount >= 2) {
      alerts.push({
        type: 'warning',
        title: 'Elevated Blood Pressure',
        message: `${highBPCount} high readings in last 7 days`,
        icon: AlertTriangle
      });
    }

    // Good adherence message
    if (adherenceRate >= 80 && alerts.length === 0) {
      alerts.push({
        type: 'info',
        title: 'Good Adherence',
        message: 'Patient maintaining consistent logging',
        icon: CheckCircle2
      });
    }

    return alerts;
  };

  const alerts = generateAlerts();

  const alertStyles = {
    urgent: 'bg-red-50 border-red-200 text-red-900',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    info: 'bg-green-50 border-green-200 text-green-900'
  };

  const alertIcons = {
    urgent: { color: 'text-red-600', bg: 'bg-red-100' },
    warning: { color: 'text-yellow-600', bg: 'bg-yellow-100' },
    info: { color: 'text-green-600', bg: 'bg-green-100' }
  };

  return (
    <div className="space-y-2">
      {alerts.map((alert, idx) => {
        const Icon = alert.icon;
        const style = alertIcons[alert.type];
        
        return (
          <Card key={idx} className={`border-2 ${alertStyles[alert.type]}`}>
            <CardContent className="p-4 flex items-start gap-3">
              <div className={`w-8 h-8 rounded-lg ${style.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-4 h-4 ${style.color}`} />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm mb-1">{alert.title}</div>
                <div className="text-xs opacity-90">{alert.message}</div>
              </div>
              <Badge variant="outline" className="text-xs">
                {alert.type === 'urgent' ? 'Review' : alert.type === 'warning' ? 'Monitor' : 'OK'}
              </Badge>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}