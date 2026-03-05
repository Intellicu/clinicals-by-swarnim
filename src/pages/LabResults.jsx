import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TestTube, Plus, AlertTriangle, CheckCircle2, TrendingUp, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

// Age-based reference ranges (pediatric nephrology key tests)
function getReference(name, ageYears) {
  const a = parseFloat(ageYears) || 5;
  const refs = {
    'Hemoglobin': a < 2 ? [10.5, 13.5] : a < 6 ? [11.5, 14.5] : a < 12 ? [11.5, 15.5] : [12, 16],
    'Hb': a < 2 ? [10.5, 13.5] : a < 6 ? [11.5, 14.5] : a < 12 ? [11.5, 15.5] : [12, 16],
    'Albumin': [3.5, 5.0],
    'Creatinine': a < 2 ? [0.2, 0.5] : a < 6 ? [0.3, 0.6] : a < 12 ? [0.4, 0.8] : [0.6, 1.0],
    'Cr': a < 2 ? [0.2, 0.5] : a < 6 ? [0.3, 0.6] : a < 12 ? [0.4, 0.8] : [0.6, 1.0],
    'BUN': [7, 18],
    'Urea': [15, 40],
    'Sodium': [135, 145],
    'Na': [135, 145],
    'Potassium': [3.5, 5.0],
    'K': [3.5, 5.0],
    'Chloride': [98, 106],
    'Bicarbonate': [22, 29],
    'HCO3': [22, 29],
    'Calcium': [8.8, 10.4],
    'Ca': [8.8, 10.4],
    'Phosphorus': a < 2 ? [4.5, 8.3] : a < 5 ? [4.5, 6.5] : a < 12 ? [3.5, 5.5] : [2.5, 4.5],
    'Phosphate': a < 2 ? [4.5, 8.3] : a < 5 ? [4.5, 6.5] : a < 12 ? [3.5, 5.5] : [2.5, 4.5],
    'Magnesium': [1.7, 2.4],
    'Uric Acid': a < 12 ? [2.0, 5.5] : [2.5, 7.0],
    'Cholesterol': [0, 170],
    'Triglycerides': [0, 150],
    'PTH': [10, 65],
    'eGFR': [90, 999],
    'CRP': [0, 10],
    'ESR': [0, 20],
    'Total Protein': [6.0, 8.0],
    'WBC': [4.5, 13.5],
    'Platelets': [150, 450],
    'Urine Protein': [0, 30],
  };
  return refs[name] || null;
}

function flagStatus(name, value, ageYears) {
  const ref = getReference(name, ageYears);
  if (!ref) return 'Normal';
  const [low, high] = ref;
  if (value < low * 0.8 || value > high * 1.5) return value < low ? 'Critical Low' : 'Critical High';
  if (value < low) return 'Low';
  if (value > high) return 'High';
  return 'Normal';
}

const STATUS_STYLE = {
  Normal: 'bg-green-100 text-green-700',
  Low: 'bg-blue-100 text-blue-700',
  High: 'bg-amber-100 text-amber-700',
  'Critical Low': 'bg-red-100 text-red-700',
  'Critical High': 'bg-red-100 text-red-700',
};

const COMMON_PANELS = [
  { name: 'Renal Function', tests: ['BUN', 'Creatinine', 'Sodium', 'Potassium', 'Bicarbonate', 'Calcium', 'Phosphorus', 'Albumin', 'eGFR'] },
  { name: 'CBC', tests: ['Hemoglobin', 'WBC', 'Platelets'] },
  { name: 'Lipids', tests: ['Cholesterol', 'Triglycerides'] },
  { name: 'Urine', tests: ['Urine Protein', 'Urine Creatinine'] },
];

function TrendChart({ data, param, ageYears }) {
  const ref = getReference(param, ageYears);
  return (
    <div className="h-40">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
          <Tooltip />
          {ref && <ReferenceLine y={ref[0]} stroke="#3b82f6" strokeDasharray="4 4" label={{ value: 'Low', fontSize: 9 }} />}
          {ref && <ReferenceLine y={ref[1]} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'High', fontSize: 9 }} />}
          <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function LabResults() {
  const queryClient = useQueryClient();
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [panel, setPanel] = useState(COMMON_PANELS[0]);
  const [testDate, setTestDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [testValues, setTestValues] = useState({});
  const [expandedParam, setExpandedParam] = useState(null);

  const { data: patients = [] } = useQuery({ queryKey: ['patients'], queryFn: () => base44.entities.Patient.list() });
  const { data: labResults = [] } = useQuery({
    queryKey: ['lab-results', selectedPatient?.id],
    queryFn: () => base44.entities.LabResult.filter({ patient_id: selectedPatient.id }, 'test_date', 50),
    enabled: !!selectedPatient?.id,
  });

  const createMutation = useMutation({
    mutationFn: () => {
      const params = panel.tests.map(name => {
        const val = parseFloat(testValues[name]);
        if (!val) return null;
        const status = flagStatus(name, val, selectedPatient?.age_years);
        const ref = getReference(name, selectedPatient?.age_years);
        return { name, value: val, unit: '', status, reference_low: ref?.[0], reference_high: ref?.[1] };
      }).filter(Boolean);
      if (!params.length) throw new Error('No values entered');
      return base44.entities.LabResult.create({
        patient_id: selectedPatient.id,
        patient_name: selectedPatient.patient_name,
        test_date: testDate,
        parameters: params,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-results', selectedPatient?.id] });
      setShowNew(false);
      setTestValues({});
      toast.success('Lab results saved!');
    },
    onError: (e) => toast.error(e.message || 'Failed to save')
  });

  // Flatten parameters for trend analysis
  const trendData = {};
  labResults.forEach(result => {
    result.parameters?.forEach(p => {
      if (!trendData[p.name]) trendData[p.name] = [];
      trendData[p.name].push({ date: result.test_date, value: p.value });
    });
  });

  const abnormals = labResults.flatMap(r =>
    (r.parameters || []).filter(p => p.status !== 'Normal').map(p => ({ ...p, date: r.test_date }))
  );

  return (
    <div className="max-w-5xl mx-auto p-4 pb-24">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
            <TestTube className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Lab Results</h1>
            <p className="text-xs text-slate-500">Input, flag & trend lab parameters</p>
          </div>
        </div>
        {selectedPatient && (
          <Button onClick={() => setShowNew(true)} className="gap-2 bg-indigo-600 hover:bg-indigo-700" size="sm">
            <Plus className="w-4 h-4" />Add Results
          </Button>
        )}
      </div>

      {/* Patient select */}
      <div className="mb-5">
        <Label className="text-xs">Select Patient</Label>
        <Select value={selectedPatient?.id || ''} onValueChange={id => setSelectedPatient(patients.find(p => p.id === id))}>
          <SelectTrigger><SelectValue placeholder="Choose patient..." /></SelectTrigger>
          <SelectContent>{patients.map(p => <SelectItem key={p.id} value={p.id}>{p.patient_name} — {p.cr_number}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {selectedPatient && (
        <>
          {/* Abnormal flags */}
          {abnormals.length > 0 && (
            <Card className="mb-4 border-red-200 bg-red-50">
              <CardContent className="p-4">
                <p className="text-sm font-bold text-red-700 flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4" />{abnormals.length} Abnormal Result{abnormals.length > 1 ? 's' : ''}
                </p>
                <div className="flex flex-wrap gap-2">
                  {abnormals.slice(0, 8).map((p, i) => (
                    <Badge key={i} className={`${STATUS_STYLE[p.status]} text-xs gap-1`}>
                      {p.name}: {p.value} ({p.status}) — {p.date}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Trends */}
          {Object.keys(trendData).length > 0 && (
            <div className="mb-5 space-y-3">
              <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2"><TrendingUp className="w-4 h-4" />Trend Charts</h2>
              {Object.entries(trendData).filter(([_, d]) => d.length >= 2).map(([param, data]) => (
                <Card key={param}>
                  <button className="w-full" onClick={() => setExpandedParam(expandedParam === param ? null : param)}>
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                      <CardTitle className="text-sm">{param}</CardTitle>
                      {expandedParam === param ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </CardHeader>
                  </button>
                  {expandedParam === param && (
                    <CardContent className="pt-0">
                      <TrendChart data={data} param={param} ageYears={selectedPatient.age_years} />
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}

          {/* Results History */}
          <div className="space-y-3">
            {labResults.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <TestTube className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p>No lab results yet. Click "Add Results" to get started.</p>
              </div>
            ) : labResults.map(result => (
              <Card key={result.id}>
                <CardContent className="p-4">
                  <p className="font-semibold text-sm mb-2">{result.test_date} — {result.lab_name || 'Lab'}</p>
                  <div className="flex flex-wrap gap-2">
                    {result.parameters?.map((p, i) => (
                      <div key={i} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium ${STATUS_STYLE[p.status] || 'bg-slate-100 text-slate-600'}`}>
                        {p.status !== 'Normal' && <AlertTriangle className="w-3 h-3" />}
                        {p.name}: <strong>{p.value}</strong>
                        {p.reference_low && <span className="opacity-60 text-xs">({p.reference_low}–{p.reference_high})</span>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* New Results Dialog */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Add Lab Results — {selectedPatient?.patient_name}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Test Date</Label>
                <Input type="date" value={testDate} onChange={e => setTestDate(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Panel</Label>
                <Select value={panel.name} onValueChange={v => { setPanel(COMMON_PANELS.find(p => p.name === v)); setTestValues({}); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{COMMON_PANELS.map(p => <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              {panel.tests.map(name => {
                const val = parseFloat(testValues[name]);
                const status = val ? flagStatus(name, val, selectedPatient?.age_years) : null;
                const ref = getReference(name, selectedPatient?.age_years);
                return (
                  <div key={name} className="flex items-center gap-2">
                    <Label className="text-xs w-32 shrink-0">{name}</Label>
                    <Input type="number" step="0.01" placeholder={ref ? `${ref[0]}–${ref[1]}` : '—'}
                      value={testValues[name] || ''}
                      onChange={e => setTestValues(p => ({ ...p, [name]: e.target.value }))}
                      className={`flex-1 text-sm ${status && status !== 'Normal' ? 'border-red-300 bg-red-50' : ''}`}
                    />
                    {status && (
                      <Badge className={`${STATUS_STYLE[status]} text-xs shrink-0`}>
                        {status}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>

            <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending} className="w-full bg-indigo-600">
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
              Save Lab Results
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}