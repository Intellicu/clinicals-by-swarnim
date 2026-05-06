import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Activity, Stethoscope, TestTube } from "lucide-react";
import { calcBSA, calcSchwartzEgfr } from "./DoseEngine";

export default function PatientInputForm({ state, setState }) {
  const { age, weight, height, egfr, creatinine, bp, symptoms, labs, diagnosis } = state;

  const bsa = calcBSA(parseFloat(weight), parseFloat(height));
  const autoEgfr = calcSchwartzEgfr(parseFloat(creatinine), parseFloat(height), parseFloat(age));
  const effectiveEgfr = egfr || autoEgfr;

  const set = (field) => (e) => setState(prev => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="space-y-4">
      {/* Vitals */}
      <Card className="bg-white border border-indigo-200 shadow-sm">
        <CardHeader className="bg-indigo-50 border-b py-3 px-5">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-600" /> Patient Parameters
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <Label className="text-xs font-semibold text-slate-600">Age (years) *</Label>
            <Input value={age} onChange={set("age")} placeholder="8" className="mt-1 text-sm h-9" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-slate-600">Weight (kg) *</Label>
            <Input value={weight} onChange={set("weight")} placeholder="25" className="mt-1 text-sm h-9" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-slate-600">Height (cm)</Label>
            <Input value={height} onChange={set("height")} placeholder="110" className="mt-1 text-sm h-9" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-slate-600">BP (mmHg)</Label>
            <Input value={bp} onChange={set("bp")} placeholder="110/70" className="mt-1 text-sm h-9" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-slate-600">eGFR (mL/min)</Label>
            <Input value={egfr} onChange={set("egfr")} placeholder="auto-calculated if blank" className="mt-1 text-sm h-9" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-slate-600">Creatinine (mg/dL)</Label>
            <Input value={creatinine} onChange={set("creatinine")} placeholder="0.5" className="mt-1 text-sm h-9" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-slate-600">Diagnosis / Working Dx</Label>
            <Input value={diagnosis} onChange={set("diagnosis")} placeholder="NS relapse / AKI / CKD..." className="mt-1 text-sm h-9" />
          </div>
          <div className="flex flex-col gap-1 justify-end">
            {bsa && <Badge className="bg-teal-100 text-teal-800 text-xs justify-center">BSA {bsa} m²</Badge>}
            {autoEgfr && !egfr && <Badge className="bg-blue-100 text-blue-800 text-xs justify-center">eGFR≈{autoEgfr} (Schwartz)</Badge>}
            {effectiveEgfr && effectiveEgfr < 60 && <Badge className="bg-amber-100 text-amber-800 text-xs justify-center">⚠️ CKD — dose adjust</Badge>}
            {effectiveEgfr && effectiveEgfr < 30 && <Badge className="bg-red-100 text-red-800 text-xs justify-center">🔴 Severe renal impairment</Badge>}
          </div>
        </CardContent>
      </Card>

      {/* Clinical details */}
      <Card className="bg-white border border-indigo-200 shadow-sm">
        <CardHeader className="bg-indigo-50 border-b py-3 px-5">
          <CardTitle className="text-sm flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-indigo-600" /> Symptoms & Examination *
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Textarea value={symptoms} onChange={set("symptoms")}
            placeholder="e.g. Periorbital oedema for 5 days, 3+ proteinuria, albumin 1.8 g/dL, BP 105/68 mmHg, weight gain 3 kg, child is otherwise well..."
            className="text-sm min-h-[80px]" />
        </CardContent>
      </Card>

      {/* Labs */}
      <Card className="bg-white border border-indigo-200 shadow-sm">
        <CardHeader className="bg-indigo-50 border-b py-3 px-5">
          <CardTitle className="text-sm flex items-center gap-2">
            <TestTube className="w-4 h-4 text-indigo-600" /> Lab Results
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Textarea value={labs} onChange={set("labs")}
            placeholder="e.g. Urine protein 4+, Serum albumin 1.6, Creatinine 0.5, Cholesterol 320, Hb 11.2, Na 136, K 4.1..."
            className="text-sm min-h-[60px]" />
        </CardContent>
      </Card>
    </div>
  );
}