import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pill, Calculator, Plus, AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function DrugDoseAutoCalculator({ patientWeight, patientAge, onAddMedication }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [calculatedDose, setCalculatedDose] = useState(null);

  const { data: drugs = [] } = useQuery({
    queryKey: ['drugs'],
    queryFn: () => base44.entities.Drug.list()
  });

  const filteredDrugs = drugs.filter(d => 
    d.generic_name?.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 10);

  useEffect(() => {
    if (selectedDrug && patientWeight) {
      calculateDose();
    }
  }, [selectedDrug, patientWeight]);

  const calculateDose = () => {
    if (!selectedDrug || !patientWeight) return;

    const weight = parseFloat(patientWeight);
    let dosePerKg = parseFloat(selectedDrug.dose_weight_based);
    
    if (!dosePerKg) {
      setCalculatedDose(null);
      return;
    }

    const totalDose = dosePerKg * weight;
    const maxDose = selectedDrug.max_dose_per_day ? parseFloat(selectedDrug.max_dose_per_day) : Infinity;
    const finalDose = Math.min(totalDose, maxDose);

    setCalculatedDose({
      dose: finalDose.toFixed(1),
      unit: 'mg',
      frequency: selectedDrug.frequency,
      route: selectedDrug.route,
      formulations: selectedDrug.formulations || [],
      monitoring: selectedDrug.monitoring,
      maxExceeded: totalDose > maxDose
    });
  };

  const addToMedications = (formulation) => {
    if (!calculatedDose || !selectedDrug) return;

    const medication = {
      drug: selectedDrug.generic_name,
      dose: `${calculatedDose.dose} ${calculatedDose.unit}`,
      route: calculatedDose.route,
      frequency: calculatedDose.frequency,
      formulation: formulation?.form + ' ' + formulation?.strength,
      monitoring: calculatedDose.monitoring
    };

    onAddMedication(medication);
    toast.success('Medication added!');
    setSelectedDrug(null);
    setSearchQuery('');
  };

  return (
    <Card className="border-2 border-green-200">
      <CardHeader className="bg-green-50 border-b">
        <CardTitle className="text-base flex items-center gap-2">
          <Pill className="w-4 h-4 text-green-600" />
          Drug Dose Auto-Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <Input
          placeholder="Search drug name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {searchQuery && filteredDrugs.length > 0 && !selectedDrug && (
          <div className="border rounded-lg max-h-48 overflow-y-auto">
            {filteredDrugs.map((drug) => (
              <button
                key={drug.id}
                onClick={() => {
                  setSelectedDrug(drug);
                  setSearchQuery(drug.generic_name);
                }}
                className="w-full text-left px-3 py-2 hover:bg-green-50 border-b last:border-b-0 text-sm"
              >
                <div className="font-semibold">{drug.generic_name}</div>
                <div className="text-xs text-slate-600">{drug.therapeutic_class}</div>
              </button>
            ))}
          </div>
        )}

        {selectedDrug && calculatedDose && (
          <div className="space-y-3">
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="w-4 h-4 text-green-600" />
                  <span className="font-semibold text-green-900">Calculated Dose</span>
                </div>
                <div className="text-2xl font-bold text-green-700 mb-1">
                  {calculatedDose.dose} {calculatedDose.unit}
                </div>
                <div className="text-sm text-green-600">
                  {calculatedDose.frequency}, {calculatedDose.route}
                </div>
                {calculatedDose.maxExceeded && (
                  <Badge className="bg-red-500 text-white mt-2 text-xs">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Max dose applied
                  </Badge>
                )}
              </CardContent>
            </Card>

            {calculatedDose.formulations.length > 0 && (
              <div>
                <div className="text-sm font-semibold text-slate-700 mb-2">Select Formulation:</div>
                <div className="space-y-2">
                  {calculatedDose.formulations.map((form, idx) => (
                    <Button
                      key={idx}
                      onClick={() => addToMedications(form)}
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-3"
                    >
                      <Plus className="w-4 h-4 mr-2 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-sm">{form.form} - {form.strength}</div>
                        {form.pack_info && <div className="text-xs text-slate-600">{form.pack_info}</div>}
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {calculatedDose.monitoring && (
              <Card className="bg-amber-50 border-amber-200">
                <CardContent className="p-3">
                  <div className="text-xs font-semibold text-amber-900 mb-1">Monitoring Required:</div>
                  <div className="text-xs text-amber-800">{calculatedDose.monitoring}</div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}