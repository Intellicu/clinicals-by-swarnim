import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calculator, Brain, BookOpen, X, Activity, Heart, 
  Droplet, Pill, TestTube, Baby
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ClinicalToolsSidebar({ isOpen, onClose }) {
  const [gfrInputs, setGfrInputs] = useState({ height: '', creatinine: '' });
  const [gfrResult, setGfrResult] = useState(null);

  const quickCalculators = [
    { name: 'Schwartz GFR', icon: Activity, path: 'SchwartzGFR' },
    { name: 'BP Percentiles', icon: Heart, path: 'BPPercentiles' },
    { name: 'Dose Calculator', icon: Pill, path: 'DoseCalculator' },
    { name: 'Fluid Calculator', icon: Droplet, path: 'FluidCalculator' },
    { name: 'Anthropometry', icon: Baby, path: 'Anthropometry' },
    { name: 'FENa Calculator', icon: TestTube, path: 'FENaCalculator' }
  ];

  const calculateGFR = () => {
    const height = parseFloat(gfrInputs.height);
    const creatinine = parseFloat(gfrInputs.creatinine);
    
    if (height && creatinine) {
      const gfr = (0.413 * height) / creatinine;
      setGfrResult(gfr.toFixed(1));
    }
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full bg-white border-l-2 border-slate-200 shadow-2xl transition-transform duration-300 z-50 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      } lg:translate-x-0 lg:static lg:w-96 overflow-auto`}
    >
      <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between z-10">
        <h2 className="font-bold text-lg">Clinical Tools</h2>
        <Button variant="ghost" size="sm" onClick={onClose} className="lg:hidden">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="p-4 space-y-4">
        <Tabs defaultValue="calculators">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="calculators">
              <Calculator className="w-4 h-4 mr-2" />
              Calculators
            </TabsTrigger>
            <TabsTrigger value="ai">
              <Brain className="w-4 h-4 mr-2" />
              AI Assistant
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calculators" className="space-y-4">
            {/* Quick GFR Calculator */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Quick GFR (Schwartz)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-xs text-slate-600">Height (cm)</label>
                  <Input
                    type="number"
                    value={gfrInputs.height}
                    onChange={(e) => setGfrInputs({...gfrInputs, height: e.target.value})}
                    placeholder="150"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600">Creatinine (mg/dL)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={gfrInputs.creatinine}
                    onChange={(e) => setGfrInputs({...gfrInputs, creatinine: e.target.value})}
                    placeholder="0.8"
                    className="mt-1"
                  />
                </div>
                <Button onClick={calculateGFR} size="sm" className="w-full">
                  Calculate
                </Button>
                {gfrResult && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                    <div className="text-xs text-blue-600 mb-1">eGFR</div>
                    <div className="text-2xl font-bold text-blue-900">{gfrResult}</div>
                    <div className="text-xs text-blue-600">mL/min/1.73m²</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Access Tools */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">All Calculators</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {quickCalculators.map(tool => {
                  const Icon = tool.icon;
                  return (
                    <Link key={tool.name} to={createPageUrl(tool.path)} target="_blank">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Icon className="w-4 h-4 mr-2 text-blue-600" />
                        {tool.name}
                      </Button>
                    </Link>
                  );
                })}
              </CardContent>
            </Card>

            {/* Guidelines */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Quick Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to={createPageUrl("Guidelines")} target="_blank">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    View All Guidelines
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-600" />
                  AI Clinical Assistant
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-slate-600">
                  Get AI-powered clinical decision support, differential diagnosis, and treatment suggestions.
                </p>
                <Link to={createPageUrl("AIAssistant")} target="_blank">
                  <Button className="w-full bg-purple-600">
                    <Brain className="w-4 h-4 mr-2" />
                    Open AI Assistant
                  </Button>
                </Link>
                <Link to={createPageUrl("ClinicalSupport")} target="_blank">
                  <Button variant="outline" className="w-full">
                    Clinical Pathways
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}