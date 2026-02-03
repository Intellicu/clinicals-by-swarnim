import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function MonitoringTrendsChart({ logs, parameterType }) {
  const getParameterValue = (log) => {
    switch(parameterType) {
      case 'Urine_Protein':
        const proteinMap = { 'Negative': 0, 'Trace': 0.5, '1+': 1, '2+': 2, '3+': 3, '4+': 4 };
        return proteinMap[log.protein_result] || 0;
      case 'Weight':
        return log.weight_kg;
      case 'Blood_Pressure':
        return log.bp_systolic;
      case 'Medications':
        return log.prednisolone_dose;
      default:
        return null;
    }
  };

  const chartData = logs
    .filter(log => log.module_type === parameterType)
    .map(log => ({
      date: new Date(log.log_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      value: getParameterValue(log),
      fullDate: log.log_date
    }))
    .reverse()
    .slice(-14); // Last 14 days

  if (chartData.length === 0) {
    return null;
  }

  const values = chartData.map(d => d.value).filter(v => v !== null);
  const avgValue = values.reduce((a, b) => a + b, 0) / values.length;
  const latestValue = values[values.length - 1];
  const previousValue = values[values.length - 2];
  
  const trend = previousValue ? 
    (latestValue > previousValue ? 'up' : latestValue < previousValue ? 'down' : 'stable') : 
    'stable';

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-red-600' : trend === 'down' ? 'text-green-600' : 'text-slate-600';

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{parameterType.replace('_', ' ')} Trend</CardTitle>
          <div className="flex items-center gap-2">
            <TrendIcon className={`w-4 h-4 ${trendColor}`} />
            <Badge variant="outline" className="text-xs">
              Avg: {avgValue.toFixed(1)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 11 }}
              stroke="#94a3b8"
            />
            <YAxis 
              tick={{ fontSize: 11 }}
              stroke="#94a3b8"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}