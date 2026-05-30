import React, { useState, useEffect } from 'react';
import { usePatient } from './PatientContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  TrendingUp, 
  CheckCircle2,
  ChevronRight,
  Activity,
  Ruler,
  Heart,
  Calculator,
  Info,
  Pill,
  ChevronDown,
  ChevronUp,
  Camera,
  Loader2
} from "lucide-react";
import { base44 } from "@/api/base44Client";

const COMMON_DRUGS = [
  { 
    name: "Prednisolone", 
    dosePerKg: 2, 
    unit: "mg", 
    frequency: "Once daily", 
    maxDose: 60, 
    indication: "Nephrotic syndrome, GN",
    formulations: ["5mg, 10mg, 20mg tablets", "5mg/5mL syrup"],
    sideEffects: ["Cushingoid features", "Growth suppression", "HTN", "Hyperglycemia", "Cataracts"],
    monitoring: ["BP every visit", "Weight weekly", "Glucose monthly", "Height q3mo", "Eye exam yearly"]
  },
  { 
    name: "Amlodipine", 
    dosePerKg: 0.1, 
    unit: "mg", 
    frequency: "Once daily", 
    maxDose: 10, 
    indication: "Hypertension",
    formulations: ["2.5mg, 5mg, 10mg tablets"],
    sideEffects: ["Peripheral edema", "Headache", "Flushing"],
    monitoring: ["BP every visit", "Edema assessment"]
  },
  { 
    name: "Enalapril", 
    dosePerKg: 0.1, 
    unit: "mg", 
    frequency: "BID", 
    maxDose: 40, 
    indication: "Proteinuria, HTN",
    formulations: ["2.5mg, 5mg, 10mg, 20mg tablets"],
    sideEffects: ["Hyperkalemia", "Cough", "Angioedema (rare)", "AKI"],
    monitoring: ["Cr, K+ at 1-2 weeks", "BP every visit", "UPCR q3mo"]
  },
  { 
    name: "Furosemide", 
    dosePerKg: 1, 
    unit: "mg", 
    frequency: "BID", 
    maxDose: 40, 
    indication: "Edema, HTN",
    formulations: ["10mg, 20mg, 40mg tablets", "10mg/mL injection", "10mg/mL oral solution"],
    sideEffects: ["Hypokalemia", "Hyponatremia", "Dehydration", "Ototoxicity (high IV doses)"],
    monitoring: ["Electrolytes weekly initially", "Hydration status", "Hearing if high IV doses"]
  },
  { 
    name: "Tacrolimus", 
    dosePerKg: 0.05, 
    unit: "mg", 
    frequency: "BID", 
    indication: "SRNS, transplant",
    formulations: ["0.5mg, 1mg, 2mg, 5mg capsules"],
    sideEffects: ["Nephrotoxicity", "Tremor", "Hyperglycemia", "Hyperkalemia", "Hypomagnesemia"],
    monitoring: ["Trough 12h post-dose (target 5-7 ng/mL)", "Cr q2-4wk", "K, Mg, glucose monthly"],
    targetLevel: "5-7 ng/mL (SDNS/FRNS), 5-10 ng/mL (SRNS)"
  },
  { 
    name: "MMF (Mycophenolate)", 
    dosePerM2: 600, 
    unit: "mg/m²", 
    frequency: "BID", 
    indication: "SDNS, SRNS",
    formulations: ["250mg, 500mg tablets", "200mg/mL suspension"],
    sideEffects: ["Diarrhea", "Leukopenia", "Infections", "GI upset"],
    monitoring: ["CBC q4-6wk", "LFT q3mo", "MPA trough if available (target 1.5-3 mcg/mL)"]
  },
  { 
    name: "Cyclophosphamide", 
    dosePerKg: 2, 
    unit: "mg", 
    frequency: "Daily", 
    indication: "SDNS, FRNS, RPGN",
    formulations: ["50mg tablets", "200mg, 500mg, 1000mg vials for IV"],
    sideEffects: ["Bone marrow suppression", "Hemorrhagic cystitis", "Alopecia", "Gonadotoxicity", "Malignancy risk"],
    monitoring: ["CBC weekly", "Urine for hematuria monthly", "Max cumulative 168 mg/kg", "Hydration during therapy"],
    maxCumulative: "168 mg/kg total lifetime dose"
  },
  { 
    name: "Levamisole", 
    dosePerKg: 2.5, 
    unit: "mg", 
    frequency: "Alternate days", 
    indication: "FRNS (steroid-sparing)",
    formulations: ["50mg tablets (veterinary formulations in India)"],
    sideEffects: ["Neutropenia (rare)", "Vasculitis (rare)", "GI upset"],
    monitoring: ["CBC with ANC q3mo", "Watch for skin rash"]
  },
  { 
    name: "Labetalol IV", 
    dosePerKg: 0.2, 
    unit: "mg", 
    frequency: "Bolus q10-15min", 
    maxDose: 40, 
    indication: "Hypertensive emergency",
    formulations: ["5mg/mL injection"],
    sideEffects: ["Bronchospasm", "Bradycardia", "Hypotension"],
    monitoring: ["BP q5min", "HR continuous", "ECG"],
    infusion: "0.25-3 mg/kg/hr continuous"
  },
  { 
    name: "Nicardipine IV", 
    dosePerKgHr: 0.5, 
    unit: "mcg/kg/min", 
    maxDose: 5, 
    indication: "Hypertensive emergency",
    formulations: ["0.1mg/mL, 0.2mg/mL injection"],
    sideEffects: ["Tachycardia", "Headache", "Flushing"],
    monitoring: ["BP q5-10min during titration"],
    titration: "Increase by 0.5-1 mcg/kg/min q5-15min"
  }
];

export default function QuickCalculations() {
  const { patientData, updatePatientData } = usePatient();
  const [calculations, setCalculations] = useState(null);
  const [showBPDialog, setShowBPDialog] = useState(false);
  const [bpDetails, setBpDetails] = useState(null);
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [showDrugCalc, setShowDrugCalc] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleOCR = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setOcrLoading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: 'Extract clinical values from this medical document/lab report image. Return null for any not found.',
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            weight: { type: "number" },
            height: { type: "number" },
            serumCreatinine: { type: "number" },
            systolicBP: { type: "number" },
            diastolicBP: { type: "number" },
            hemoglobin: { type: "number" }
          }
        }
      });
      const updates = {};
      Object.entries(result).forEach(([k, v]) => { if (v !== null && v !== undefined) updates[k] = String(v); });
      updatePatientData({ ...patientData, ...updates });
      const count = Object.keys(updates).length;
      if (count > 0) {
        import('sonner').then(({ toast }) => toast.success(`OCR filled ${count} value(s)`));
      }
    } catch {
      import('sonner').then(({ toast }) => toast.error('OCR failed. Try a clearer image.'));
    } finally {
      setOcrLoading(false);
      e.target.value = '';
    }
  };

  useEffect(() => {
    if (patientData.weight && patientData.height && patientData.age) {
      calculateAll();
    }
  }, [patientData]);

  const calculateAll = () => {
    const weight = parseFloat(patientData.weight);
    const height = parseFloat(patientData.height);
    const age = parseFloat(patientData.age);
    const gender = patientData.gender || "male";
    const cr = parseFloat(patientData.serumCreatinine);
    const sysBP = parseFloat(patientData.systolicBP);
    const diaBP = parseFloat(patientData.diastolicBP);

    const results = [];

    const getPercentile = (value, mean, sd) => {
      const z = (value - mean) / sd;
      if (z < -2) return "<3rd";
      if (z < -1) return "3rd-15th";
      if (z < 0) return "15th-50th";
      if (z < 1) return "50th-85th";
      if (z < 2) return "85th-97th";
      return ">97th";
    };

    // Weight Percentile
    if (weight && age) {
      let meanWeight = age <= 2 ? 10 + (age * 2) : age <= 10 ? 10 + (age * 2.5) : 35 + ((age - 10) * 5);
      let sdWeight = age <= 2 ? 1.5 : age <= 10 ? 3 : 8;
      const weightPercentile = getPercentile(weight, meanWeight, sdWeight);
      let weightColor = weightPercentile.includes("<3rd") || weightPercentile.includes(">97th") ? "red" : weightPercentile.includes("3rd") || weightPercentile.includes("85th-97th") ? "amber" : "green";

      results.push({
        name: "Weight",
        icon: Ruler,
        value: `${weight} kg`,
        subtext: `${weightPercentile} percentile`,
        color: weightColor,
        page: "Anthropometry"
      });
    }

    // Height Percentile
    if (height && age) {
      let meanHeight = age <= 2 ? 75 + (age * 10) : age <= 10 ? 85 + (age * 6) : 140 + ((age - 10) * 6);
      let sdHeight = age <= 2 ? 4 : age <= 10 ? 6 : 8;
      const heightPercentile = getPercentile(height, meanHeight, sdHeight);
      let heightColor = heightPercentile.includes("<3rd") || heightPercentile.includes(">97th") ? "red" : heightPercentile.includes("3rd") || heightPercentile.includes("85th-97th") ? "amber" : "green";

      results.push({
        name: "Height",
        icon: Ruler,
        value: `${height} cm`,
        subtext: `${heightPercentile} percentile`,
        color: heightColor,
        page: "Anthropometry"
      });
    }

    // BMI
    if (weight && height) {
      const heightM = height / 100;
      const bmi = weight / (heightM * heightM);
      let bmiMean = 16 + (age * 0.5);
      let bmiSD = 2.5;
      const bmiPercentile = getPercentile(bmi, bmiMean, bmiSD);
      
      let bmiCategory = "";
      let bmiColor = "green";
      
      if (bmiPercentile.includes("<3rd")) {
        bmiCategory = "Severely underweight";
        bmiColor = "red";
      } else if (bmiPercentile.includes("3rd")) {
        bmiCategory = "Underweight";
        bmiColor = "amber";
      } else if (bmiPercentile.includes("15th-50th") || bmiPercentile.includes("50th-85th")) {
        bmiCategory = "Normal";
      } else if (bmiPercentile.includes("85th-97th")) {
        bmiCategory = "Overweight";
        bmiColor = "amber";
      } else {
        bmiCategory = "Obese";
        bmiColor = "red";
      }

      results.push({
        name: "BMI",
        icon: Calculator,
        value: `${bmi.toFixed(1)} kg/m²`,
        subtext: `${bmiPercentile} - ${bmiCategory}`,
        color: bmiColor,
        page: "Anthropometry"
      });
    }

    // BSA
    if (weight && height) {
      const bsa = Math.sqrt((height * weight) / 3600);
      results.push({
        name: "BSA",
        icon: Calculator,
        value: `${bsa.toFixed(2)} m²`,
        subtext: "Mosteller formula",
        color: "blue",
        page: "Anthropometry"
      });
    }

    // eGFR
    if (height && cr) {
      const eGFR = (0.413 * height / cr);
      let stage = eGFR >= 90 ? "G1 - Normal" : eGFR >= 60 ? "G2 - Mild ↓" : eGFR >= 30 ? "G3 - Moderate ↓" : eGFR >= 15 ? "G4 - Severe ↓" : "G5 - Failure";
      let gfrColor = eGFR >= 60 ? "green" : eGFR >= 30 ? "amber" : "red";

      results.push({
        name: "eGFR (Schwartz)",
        icon: Activity,
        value: `${eGFR.toFixed(1)} mL/min/1.73m²`,
        subtext: stage,
        color: gfrColor,
        page: "SchwartzGFR"
      });
    }

    // BP with detailed centiles
    if (sysBP && diaBP && age) {
      const bpData = calculateBPPercentiles(sysBP, diaBP, age, gender, height);
      results.push({
        name: "Blood Pressure",
        icon: Heart,
        value: `${sysBP}/${diaBP} mmHg`,
        subtext: bpData.category,
        color: bpData.color,
        page: "BPPercentiles",
        clickAction: () => {
          setBpDetails(bpData);
          setShowBPDialog(true);
        }
      });
    }

    setCalculations(results);
  };

  const calculateBPPercentiles = (sysBP, diaBP, age, gender, height) => {
    let sbp50th, sbp90th, sbp95th, sbp99th;
    let dbp50th, dbp90th, dbp95th, dbp99th;

    if (age <= 5) {
      sbp50th = 95; sbp90th = 105; sbp95th = 109; sbp99th = 113;
      dbp50th = 55; dbp90th = 65; dbp95th = 69; dbp99th = 73;
    } else if (age <= 10) {
      sbp50th = 100; sbp90th = 110; sbp95th = 114; sbp99th = 118;
      dbp50th = 60; dbp90th = 70; dbp95th = 74; dbp99th = 78;
    } else {
      sbp50th = 115; sbp90th = 125; sbp95th = 130; sbp99th = 135;
      dbp50th = 70; dbp90th = 78; dbp95th = 82; dbp99th = 86;
    }

    let category = "";
    let color = "green";
    let details = "";

    if (sysBP >= sbp95th + 12 || diaBP >= dbp95th + 12) {
      category = "Stage 2 HTN";
      color = "red";
      details = `Severe hypertension. BP ${sysBP}/${diaBP} is ≥95th percentile + 12 mmHg for age ${age}. Requires immediate evaluation and treatment.`;
    } else if (sysBP >= sbp95th || diaBP >= dbp95th) {
      category = "Stage 1 HTN";
      color = "red";
      details = `Hypertension confirmed. BP ${sysBP}/${diaBP} is ≥95th percentile for age ${age}. Requires treatment and workup.`;
    } else if (sysBP >= sbp90th || diaBP >= dbp90th) {
      category = "Elevated BP";
      color = "amber";
      details = `Elevated blood pressure. BP ${sysBP}/${diaBP} is 90th-95th percentile for age ${age}. Lifestyle modifications and monitoring recommended.`;
    } else {
      category = "Normal BP";
      color = "green";
      details = `Normal blood pressure. BP ${sysBP}/${diaBP} is <90th percentile for age ${age}.`;
    }

    return {
      category,
      color,
      details,
      percentiles: {
        "50th": `${sbp50th}/${dbp50th}`,
        "90th": `${sbp90th}/${dbp90th}`,
        "95th": `${sbp95th}/${dbp95th}`,
        "99th": `${sbp99th}/${dbp99th}`
      },
      current: `${sysBP}/${diaBP}`
    };
  };

  if (!calculations || calculations.length === 0) {
    return null;
  }

  return (
    <>
      <Card className="bg-gradient-to-r from-green-50 to-teal-50 border-2 border-green-300 shadow-md mb-4">
        {/* Compact Header — always visible */}
        <div
          className="flex items-center justify-between px-3 py-2.5 cursor-pointer select-none"
          onClick={() => setCollapsed(c => !c)}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span className="text-sm font-bold text-slate-800">Quick Calculations</span>
            <span className="text-xs text-slate-500 hidden sm:inline">({calculations.length} results)</span>
          </div>
          <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
            <input type="file" accept="image/*" capture="environment" id="qc-ocr" className="hidden" onChange={handleOCR} />
            <label htmlFor="qc-ocr">
              <Button type="button" size="sm" variant="outline" className="cursor-pointer border-green-300 text-green-700 hover:bg-green-50 h-7 text-xs gap-1 px-2" asChild>
                <span>
                  {ocrLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
                  <span className="hidden sm:inline">{ocrLoading ? 'Scanning…' : 'OCR'}</span>
                </span>
              </Button>
            </label>
            <button
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-green-100 transition-colors"
              onClick={() => setCollapsed(c => !c)}
              aria-label="Toggle section"
            >
              {collapsed ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronUp className="w-4 h-4 text-slate-500" />}
            </button>
          </div>
        </div>

        {!collapsed && (
          <CardContent className="px-3 pb-3 pt-0 border-t border-green-200">
          {/* Results grid — compact rows */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-2 mb-3">
            {calculations.map((calc, idx) => {
              const IconComponent = calc.icon;
              const iconBg = {
                green: "bg-green-100 text-green-600",
                amber: "bg-amber-100 text-amber-600",
                red: "bg-red-100 text-red-600",
                blue: "bg-blue-100 text-blue-600"
              }[calc.color] || "bg-slate-100 text-slate-600";

              const rowBg = {
                green: "bg-green-50 border-green-200",
                amber: "bg-amber-50 border-amber-200",
                red: "bg-red-50 border-red-200",
                blue: "bg-blue-50 border-blue-200"
              }[calc.color] || "bg-slate-50 border-slate-200";

              const inner = (
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${rowBg} hover:shadow-sm transition-all cursor-pointer group`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                    <IconComponent className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-slate-500 leading-tight">{calc.name}</div>
                    <div className="text-sm font-bold text-slate-900 leading-tight truncate">{calc.value}</div>
                    <div className="text-xs text-slate-400 leading-tight truncate">{calc.subtext}</div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 flex-shrink-0" />
                </div>
              );

              if (calc.clickAction) {
                return <div key={idx} onClick={calc.clickAction}>{inner}</div>;
              }
              return <Link key={idx} to={createPageUrl(calc.page)}>{inner}</Link>;
            })}
          </div>

          {/* Drug Calculator */}
          <div className="border-t border-green-200 pt-2">
            <button
              className="w-full flex items-center justify-between py-1.5 group"
              onClick={() => setShowDrugCalc(!showDrugCalc)}
            >
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Pill className="w-3.5 h-3.5 text-purple-600" />
                Quick Drug Dosing
              </span>
              {showDrugCalc ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
            </button>
            
            {showDrugCalc && patientData.weight && (
              <div className="space-y-2 mt-1">
                <Select value={selectedDrug?.name} onValueChange={(drugName) => setSelectedDrug(COMMON_DRUGS.find(d => d.name === drugName))}>
                  <SelectTrigger className="bg-white border border-purple-200 h-8 text-xs">
                    <SelectValue placeholder="Select medication for quick dosing..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-80">
                    {COMMON_DRUGS.map((drug) => (
                      <SelectItem key={drug.name} value={drug.name}>
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium">{drug.name}</span>
                          <span className="text-xs text-slate-500 ml-4">{drug.indication}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedDrug && (
                  <Card className="bg-white border border-purple-300 shadow-sm">
                    <CardHeader className="bg-purple-50 border-b py-2 px-3">
                      <CardTitle className="text-sm text-purple-900">{selectedDrug.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 space-y-2">
                      <div className="bg-purple-50 px-3 py-2 rounded-lg border border-purple-200">
                        <p className="text-xs text-slate-600 mb-0.5"><strong>Calculated Dose:</strong></p>
                        <p className="text-lg font-bold text-purple-700">
                          {(() => {
                            if (selectedDrug.dosePerM2) {
                              const bsaCalc = calculations.find(c => c.name === "BSA");
                              if (!bsaCalc) return "Enter height for BSA calculation";
                              const bsaVal = parseFloat(bsaCalc.value);
                              return `${(selectedDrug.dosePerM2 * bsaVal).toFixed(1)} ${selectedDrug.unit}`;
                            } else {
                              const calc = selectedDrug.dosePerKg * parseFloat(patientData.weight);
                              const dose = selectedDrug.maxDose && calc > selectedDrug.maxDose ? selectedDrug.maxDose : calc;
                              return `${dose.toFixed(1)} ${selectedDrug.unit}`;
                            }
                          })()}
                        </p>
                        <p className="text-xs text-purple-600 mt-0.5">{selectedDrug.frequency}</p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-slate-600">Indication: <span className="font-normal">{selectedDrug.indication}</span></p>
                      </div>

                      {selectedDrug.formulations && (
                        <div>
                          <p className="text-xs font-semibold text-slate-600 mb-0.5">Formulations:</p>
                          <ul className="text-xs text-slate-500 space-y-0.5">
                            {selectedDrug.formulations.map((form, idx) => (
                              <li key={idx}>• {form}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {selectedDrug.sideEffects && (
                        <div className="bg-red-50 px-2 py-1.5 rounded-lg border border-red-200">
                          <p className="text-xs font-semibold text-red-800 mb-1">Side Effects:</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedDrug.sideEffects.map((effect, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs border-red-300 text-red-700 py-0">
                                {effect}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedDrug.monitoring && (
                        <div className="bg-blue-50 px-2 py-1.5 rounded-lg border border-blue-200">
                          <p className="text-xs font-semibold text-blue-800 mb-0.5">Monitoring:</p>
                          <ul className="text-xs text-blue-700 space-y-0.5">
                            {selectedDrug.monitoring.map((mon, idx) => (
                              <li key={idx}>• {mon}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {(selectedDrug.targetLevel || selectedDrug.maxCumulative || selectedDrug.infusion || selectedDrug.titration) && (
                        <Alert className="bg-amber-50 border-amber-200 py-1.5">
                          <Info className="w-3.5 h-3.5 text-amber-600" />
                          <AlertDescription className="text-xs text-amber-900">
                            {selectedDrug.targetLevel && <p><strong>Target:</strong> {selectedDrug.targetLevel}</p>}
                            {selectedDrug.maxCumulative && <p><strong>Max Cumulative:</strong> {selectedDrug.maxCumulative}</p>}
                            {selectedDrug.infusion && <p><strong>Infusion:</strong> {selectedDrug.infusion}</p>}
                            {selectedDrug.titration && <p><strong>Titration:</strong> {selectedDrug.titration}</p>}
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
          </CardContent>
        )}
      </Card>

      {/* BP Details Dialog */}
      <Dialog open={showBPDialog} onOpenChange={setShowBPDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Heart className="w-6 h-6 text-red-600" />
              Blood Pressure Percentiles - Detailed View
            </DialogTitle>
          </DialogHeader>
          {bpDetails && (
            <div className="space-y-4">
              <Alert className={`border-2 ${
                bpDetails.color === "red" ? "bg-red-50 border-red-300" :
                bpDetails.color === "amber" ? "bg-amber-50 border-amber-300" :
                "bg-green-50 border-green-300"
              }`}>
                <AlertDescription className={`${
                  bpDetails.color === "red" ? "text-red-900" :
                  bpDetails.color === "amber" ? "text-amber-900" :
                  "text-green-900"
                } font-medium`}>
                  {bpDetails.details}
                </AlertDescription>
              </Alert>

              <Card className="border-2 border-slate-200">
                <CardHeader className="bg-slate-50 border-b">
                  <CardTitle className="text-base">BP Reference Values for Age {patientData.age} years</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Percentile</th>
                        <th className="text-left py-2">BP (mmHg)</th>
                        <th className="text-left py-2">Category</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2">50th</td>
                        <td className="font-mono">{bpDetails.percentiles["50th"]}</td>
                        <td>Normal</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">90th</td>
                        <td className="font-mono">{bpDetails.percentiles["90th"]}</td>
                        <td>Upper Normal</td>
                      </tr>
                      <tr className="border-b bg-amber-50">
                        <td className="py-2 font-semibold">95th</td>
                        <td className="font-mono font-semibold">{bpDetails.percentiles["95th"]}</td>
                        <td className="font-semibold text-amber-700">HTN Threshold</td>
                      </tr>
                      <tr className="bg-red-50">
                        <td className="py-2 font-semibold">99th</td>
                        <td className="font-mono font-semibold">{bpDetails.percentiles["99th"]}</td>
                        <td className="font-semibold text-red-700">Severe HTN</td>
                      </tr>
                      <tr className="border-t-2 bg-blue-50">
                        <td className="py-3 font-bold">Patient's BP</td>
                        <td className="font-mono font-bold text-lg text-blue-700">{bpDetails.current}</td>
                        <td className="font-bold text-blue-700">{bpDetails.category}</td>
                      </tr>
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}