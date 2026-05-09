import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calculator, AlertTriangle, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { resolveDose, applyRenalAdjustment, STANDARD_DOSE_TEMPLATES } from "@/lib/clinicalOS/DoseEngine";

const DIALYSIS_OPTIONS = ["None", "HD", "PD", "CRRT", "SLED"];

export default function DoseCalculatorPanel({ initialContext = {} }) {
  const [ctx, setCtx] = useState({
    weight: initialContext.weight || "",
    height: initialContext.height || "",
    eGFR: initialContext.eGFR || "",
    dialysis_type: initialContext.dialysis_type || "None",
    serum_potassium: initialContext.serum_potassium || "",
    bp_percentile: initialContext.bp_percentile || "",
  });
  const [selectedDrug, setSelectedDrug] = useState("prednisolone_ns");
  const [result, setResult] = useState(null);
  const [showContext, setShowContext] = useState(true);

  const patientContext = {
    weight: parseFloat(ctx.weight) || 0,
    height: parseFloat(ctx.height) || 0,
    eGFR: parseFloat(ctx.eGFR) || null,
    dialysis_type: ctx.dialysis_type !== "None" ? ctx.dialysis_type : null,
    serum_potassium: parseFloat(ctx.serum_potassium) || null,
    bp_percentile: parseFloat(ctx.bp_percentile) || null,
  };

  const handleCalculate = () => {
    const template = STANDARD_DOSE_TEMPLATES[selectedDrug];
    if (!template) return;
    const res = resolveDose(template.template, patientContext);
    setResult({ ...res, template, drug: selectedDrug });
  };

  const DRUG_LABELS = {
    prednisolone_ns: "Prednisolone (NS induction)",
    prednisolone_alt_day: "Prednisolone (Alternate day)",
    furosemide: "Furosemide",
    enalapril: "Enalapril",
    tacrolimus_ns: "Tacrolimus (NS - SDNS/SRNS)",
    tacrolimus_transplant: "Tacrolimus (Transplant)",
    amlodipine: "Amlodipine",
    calcium_gluconate: "Calcium Gluconate 10%",
    sodium_bicarbonate: "Sodium Bicarbonate",
    albumin_20: "Albumin 20% IV",
    mmf: "MMF (Mycophenolate)",
    levamisole: "Levamisole",
  };

  return (
    <Card className="border-2 border-blue-200 shadow-md">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Calculator className="w-5 h-5 text-blue-600" />
          Dynamic Dose Engine
          <Badge className="ml-auto bg-blue-600 text-white text-xs">Renal-Adjusted</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">

        {/* Patient Context */}
        <div>
          <button className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2 w-full"
            onClick={() => setShowContext(!showContext)}>
            Patient Context {showContext ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showContext && (
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: "weight", label: "Weight (kg)", placeholder: "e.g. 25" },
                { key: "height", label: "Height (cm)", placeholder: "e.g. 120" },
                { key: "eGFR", label: "eGFR (mL/min/1.73m²)", placeholder: "e.g. 45" },
                { key: "serum_potassium", label: "K+ (mmol/L)", placeholder: "e.g. 5.2" },
                { key: "bp_percentile", label: "BP Percentile", placeholder: "e.g. 96" },
              ].map(field => (
                <div key={field.key}>
                  <label className="text-xs text-slate-500 block mb-0.5">{field.label}</label>
                  <input
                    type="number"
                    placeholder={field.placeholder}
                    value={ctx[field.key]}
                    onChange={e => setCtx(prev => ({ ...prev, [field.key]: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
              ))}
              <div>
                <label className="text-xs text-slate-500 block mb-0.5">Dialysis</label>
                <select
                  value={ctx.dialysis_type}
                  onChange={e => setCtx(prev => ({ ...prev, dialysis_type: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  {DIALYSIS_OPTIONS.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Drug Selection */}
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1">Select Drug</label>
          <select
            value={selectedDrug}
            onChange={e => { setSelectedDrug(e.target.value); setResult(null); }}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            {Object.entries(DRUG_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        <Button onClick={handleCalculate} className="w-full bg-blue-600 hover:bg-blue-700">
          <Calculator className="w-4 h-4 mr-2" /> Calculate Dose
        </Button>

        {/* Result */}
        {result && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-xs font-bold text-green-800 uppercase">Calculated Dose</span>
            </div>
            <p className="text-lg font-bold text-slate-900">{result.resolved}</p>
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="outline" className="text-xs">{result.template.frequency}</Badge>
              <Badge variant="outline" className="text-xs">{result.template.route}</Badge>
              <Badge className="text-xs bg-blue-100 text-blue-800 border-0">{result.template.indication}</Badge>
            </div>
            {result.template.trough_target && (
              <p className="text-xs text-slate-600 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                Target trough: <strong>{result.template.trough_target}</strong>
              </p>
            )}
            {result.warnings.length > 0 && (
              <div className="space-y-1 mt-2">
                {result.warnings.map((w, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-xs text-amber-800 bg-amber-50 rounded px-2 py-1 border border-amber-200">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-amber-600" />
                    {w}
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-slate-400 mt-1">Always verify against current patient weight and clinical judgment.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}