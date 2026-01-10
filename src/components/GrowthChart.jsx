import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Scatter, ScatterChart, ZAxis } from 'recharts';
import { TrendingUp } from 'lucide-react';

// IAP Growth Standards (simplified - based on WHO adapted for Indian children)
const IAP_HEIGHT_PERCENTILES = {
  male: {
    "5": [49.9, 75.7, 87.8, 96.1, 102.9, 109.2, 115.0, 120.6, 125.8, 130.8, 135.7, 140.4, 145.2, 150.1, 155.4, 161.2, 166.8, 170.8, 173.4],
    "50": [50.8, 78.0, 91.4, 100.4, 107.9, 114.6, 120.8, 126.6, 132.2, 137.5, 142.9, 148.1, 153.6, 159.4, 165.3, 170.7, 174.5, 176.5, 177.0],
    "95": [51.7, 80.2, 94.9, 104.5, 112.7, 119.9, 126.5, 132.6, 138.5, 144.2, 150.0, 155.8, 162.0, 168.7, 175.2, 180.2, 182.2, 182.2, 180.6]
  },
  female: {
    "5": [49.2, 74.0, 85.4, 93.9, 100.6, 106.6, 112.2, 117.6, 122.7, 127.5, 132.2, 137.2, 142.2, 146.8, 150.4, 152.7, 154.1, 154.6, 154.7],
    "50": [50.0, 76.0, 88.3, 97.1, 104.1, 110.2, 116.0, 121.5, 127.0, 132.2, 137.5, 142.9, 148.1, 152.4, 155.4, 157.1, 158.0, 158.4, 158.6],
    "95": [50.8, 78.1, 91.2, 100.3, 107.5, 113.8, 119.8, 125.4, 131.2, 136.9, 142.7, 148.6, 154.0, 158.0, 160.4, 161.5, 161.9, 162.2, 162.5]
  }
};

const IAP_WEIGHT_PERCENTILES = {
  male: {
    "5": [2.9, 9.2, 12.1, 13.8, 15.0, 15.9, 16.7, 17.5, 18.4, 19.4, 20.7, 22.3, 24.4, 27.2, 30.9, 35.5, 40.5, 45.3, 49.0],
    "50": [3.3, 10.2, 13.7, 15.7, 17.2, 18.3, 19.4, 20.5, 21.7, 23.1, 24.8, 27.0, 29.9, 33.6, 38.2, 43.8, 49.8, 55.2, 59.0],
    "95": [3.9, 11.8, 16.3, 18.8, 20.7, 22.2, 23.6, 25.0, 26.6, 28.5, 30.8, 33.7, 37.4, 42.0, 47.8, 54.5, 60.9, 65.9, 69.0]
  },
  female: {
    "5": [2.8, 8.5, 11.0, 12.6, 13.7, 14.5, 15.3, 16.0, 16.8, 17.9, 19.4, 21.4, 23.9, 26.9, 30.2, 33.4, 36.2, 38.4, 39.9],
    "50": [3.2, 9.5, 12.4, 14.3, 15.8, 16.8, 17.9, 18.9, 20.1, 21.5, 23.4, 25.8, 28.9, 32.6, 36.6, 40.4, 43.7, 46.0, 47.4],
    "95": [3.7, 10.9, 14.8, 17.2, 19.0, 20.4, 21.7, 23.1, 24.7, 26.7, 29.3, 32.6, 36.7, 41.4, 46.4, 50.8, 54.3, 56.5, 57.5]
  }
};

export default function GrowthChart({ gender, age, height, weight }) {
  const genderKey = gender?.toLowerCase() === 'male' ? 'male' : 'female';
  const ageYears = Math.floor(parseFloat(age) || 0);
  
  // Generate chart data
  const heightData = [];
  const weightData = [];
  
  for (let i = 0; i <= 18; i++) {
    heightData.push({
      age: i,
      p5: IAP_HEIGHT_PERCENTILES[genderKey]["5"][i],
      p50: IAP_HEIGHT_PERCENTILES[genderKey]["50"][i],
      p95: IAP_HEIGHT_PERCENTILES[genderKey]["95"][i]
    });
    
    weightData.push({
      age: i,
      p5: IAP_WEIGHT_PERCENTILES[genderKey]["5"][i],
      p50: IAP_WEIGHT_PERCENTILES[genderKey]["50"][i],
      p95: IAP_WEIGHT_PERCENTILES[genderKey]["95"][i]
    });
  }

  const patientPoint = ageYears >= 0 && ageYears <= 18 ? [{
    age: ageYears,
    value: parseFloat(height) || 0
  }] : [];

  const patientWeightPoint = ageYears >= 0 && ageYears <= 18 ? [{
    age: ageYears,
    value: parseFloat(weight) || 0
  }] : [];

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            IAP Growth Charts (Height-for-Age)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={heightData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="age" label={{ value: 'Age (years)', position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: 'Height (cm)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Line type="monotone" dataKey="p5" stroke="#fbbf24" strokeWidth={2} name="5th percentile" dot={false} />
              <Line type="monotone" dataKey="p50" stroke="#3b82f6" strokeWidth={2} name="50th percentile" dot={false} />
              <Line type="monotone" dataKey="p95" stroke="#10b981" strokeWidth={2} name="95th percentile" dot={false} />
              {patientPoint.length > 0 && patientPoint[0].value > 0 && (
                <Scatter data={patientPoint} fill="#ef4444">
                  {patientPoint.map((entry, index) => (
                    <circle key={index} cx={entry.age} cy={entry.value} r={8} fill="#ef4444" stroke="#fff" strokeWidth={2} />
                  ))}
                </Scatter>
              )}
            </LineChart>
          </ResponsiveContainer>
          
          <div className="mt-4 flex gap-2 flex-wrap justify-center">
            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">5th %ile</Badge>
            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">50th %ile</Badge>
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">95th %ile</Badge>
            <Badge className="bg-red-500 text-white">Patient</Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-teal-50 border-2 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            IAP Growth Charts (Weight-for-Age)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weightData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="age" label={{ value: 'Age (years)', position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Line type="monotone" dataKey="p5" stroke="#fbbf24" strokeWidth={2} name="5th percentile" dot={false} />
              <Line type="monotone" dataKey="p50" stroke="#3b82f6" strokeWidth={2} name="50th percentile" dot={false} />
              <Line type="monotone" dataKey="p95" stroke="#10b981" strokeWidth={2} name="95th percentile" dot={false} />
              {patientWeightPoint.length > 0 && patientWeightPoint[0].value > 0 && (
                <Scatter data={patientWeightPoint} fill="#ef4444">
                  {patientWeightPoint.map((entry, index) => (
                    <circle key={index} cx={entry.age} cy={entry.value} r={8} fill="#ef4444" stroke="#fff" strokeWidth={2} />
                  ))}
                </Scatter>
              )}
            </LineChart>
          </ResponsiveContainer>
          
          <div className="mt-4 text-center text-sm text-slate-600">
            <p><strong>Reference:</strong> IAP Growth Charts based on WHO standards adapted for Indian children (Khadilkar et al., 2015)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}