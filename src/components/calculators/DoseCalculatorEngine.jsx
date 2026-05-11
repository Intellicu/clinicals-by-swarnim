import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Info, ChevronDown, ChevronUp } from "lucide-react";

const DRUGS = [
  { name: "Prednisolone",       dosePerKg: 2,    maxDose: 60,  unit: "mg",  freq: "OD",   route: "PO",  note: "Take with food, morning. Max 60mg/day for NS.",   renalAdj: "No adjustment needed" },
  { name: "Cyclophosphamide",   doseBSA: 500,    maxDose: null,unit: "mg",  freq: "Once", route: "IV/PO", note: "BSA-based. IV: 500mg/m² q4w. Check WBC before each dose.", renalAdj: "eGFR <30: reduce by 25–50%. eGFR<10: avoid" },
  { name: "Tacrolimus",         dosePerKg: 0.1,  maxDose: null,unit: "mg",  freq: "BD",   route: "PO",  note: "Target trough 5–10 ng/mL (NS); 8–12 (transplant). Empty stomach, consistent timing. Avoid grapefruit.", renalAdj: "Dose by TDM, not eGFR" },
  { name: "Cyclosporine",       dosePerKg: 5,    maxDose: null,unit: "mg",  freq: "BD",   route: "PO",  note: "Target trough 100–200 ng/mL. Consistent timing with/without food. Monitor BP and Cr.", renalAdj: "Dose by TDM" },
  { name: "MMF (Mycophenolate)",doseBSA: 600,    maxDose: 2000,unit: "mg",  freq: "BD",   route: "PO",  note: "BSA-based: 600mg/m²/dose BD (max 2g/day). Do not crush enteric-coated. Avoid during pregnancy.", renalAdj: "eGFR <25: max 1g/day" },
  { name: "Azathioprine",       dosePerKg: 2,    maxDose: 150, unit: "mg",  freq: "OD",   route: "PO",  note: "Check TPMT before starting. Avoid allopurinol. With food.", renalAdj: "eGFR <10: reduce to 75% of dose" },
  { name: "Rituximab",          doseBSA: 375,    maxDose: null,unit: "mg",  freq: "q4w",  route: "IV",  note: "BSA-based: 375mg/m². Pre-medicate with paracetamol + antihistamine + methylprednisolone. Monitor for 2h post-infusion.", renalAdj: "No specific adjustment needed" },
  { name: "Methotrexate",       dosePerKg: 0.5,  maxDose: 25,  unit: "mg",  freq: "Once/week", route: "PO/SC", note: "WEEKLY only. Give folic acid 5mg next day. Avoid alcohol. Check LFT monthly.", renalAdj: "eGFR <30: reduce 50%. eGFR<15: avoid" },
  { name: "Hydroxychloroquine", dosePerKg: 5,    maxDose: 400, unit: "mg",  freq: "OD",   route: "PO",  note: "Max 5mg/kg actual BW. Ophthalmology review 5 yearly. Take with food.", renalAdj: "No significant adjustment" },
  { name: "Enalapril",          dosePerKg: 0.1,  maxDose: 40,  unit: "mg",  freq: "OD-BD",route: "PO",  note: "Start low 0.08mg/kg. Monitor K+, Cr within 1 week of starting.", renalAdj: "eGFR 30–60: reduce by 50%. eGFR<30: avoid" },
  { name: "Amlodipine",         dosePerKg: 0.1,  maxDose: 10,  unit: "mg",  freq: "OD",   route: "PO",  note: "Start 0.1mg/kg/day. Max 0.6mg/kg or 10mg. Can crush tablet.", renalAdj: "No adjustment needed" },
  { name: "Furosemide",         dosePerKg: 1,    maxDose: 80,  unit: "mg",  freq: "BD",   route: "PO/IV",note: "PO: 1–2mg/kg/dose. IV: 0.5–1mg/kg. Monitor K+, dehydration.", renalAdj: "Higher doses may be needed in CKD" },
  { name: "Trimethoprim/SMX",   dosePerKg: 2.5,  maxDose: 80,  unit: "mg TMP", freq: "OD (prophylaxis)", route: "PO", note: "PCP prophylaxis: 5mg/kg TMP 3×/week or 2.5mg/kg OD. On immunosuppression.", renalAdj: "eGFR <30: 50% dose. eGFR<10: avoid" },
];

function bsaFromWeightHeight(w, h) {
  return Math.sqrt((h * w) / 3600);
}

function AccordionSection({ title, color = "blue", children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden mb-2">
      <button onClick={() => setOpen(o => !o)} className={`w-full flex items-center justify-between px-4 py-2.5 bg-${color}-600 text-white font-semibold text-sm`}>
        {title}{open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {open && <div className="p-3 bg-white">{children}</div>}
    </div>
  );
}

export default function DoseCalculatorEngine() {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [egfr, setEgfr] = useState("");
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [results, setResults] = useState(null);

  const bsa = weight && height ? bsaFromWeightHeight(parseFloat(weight), parseFloat(height)).toFixed(2) : null;

  const calculate = (drug) => {
    const w = parseFloat(weight);
    const b = bsa ? parseFloat(bsa) : null;
    if (!w) return;

    let calc = null;
    if (drug.dosePerKg) {
      const raw = drug.dosePerKg * w;
      const capped = drug.maxDose ? Math.min(raw, drug.maxDose) : raw;
      calc = { type: "weight", raw: raw.toFixed(1), capped: capped.toFixed(1), unit: drug.unit, perKg: drug.dosePerKg };
    } else if (drug.doseBSA && b) {
      const raw = drug.doseBSA * b;
      const capped = drug.maxDose ? Math.min(raw, drug.maxDose) : raw;
      calc = { type: "bsa", raw: raw.toFixed(1), capped: capped.toFixed(1), unit: drug.unit, bsa: b };
    }

    setSelectedDrug(drug);
    setResults(calc);
  };

  return (
    <div className="space-y-4">
      {/* Patient inputs */}
      <Card className="bg-slate-50 border-2">
        <CardContent className="pt-4">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">Patient Parameters</p>
          <div className="grid grid-cols-3 gap-3">
            <div><Label className="text-xs">Weight (kg)</Label><Input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 30" className="mt-1 bg-white" /></div>
            <div><Label className="text-xs">Height (cm)</Label><Input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="e.g. 130" className="mt-1 bg-white" /></div>
            <div><Label className="text-xs">eGFR (mL/min)</Label><Input type="number" value={egfr} onChange={e => setEgfr(e.target.value)} placeholder="e.g. 45" className="mt-1 bg-white" /></div>
          </div>
          {bsa && <div className="mt-2 text-xs bg-blue-50 rounded-lg p-2 text-blue-800">BSA (Mosteller): <strong>{bsa} m²</strong> — auto-used for BSA-based drugs</div>}
        </CardContent>
      </Card>

      {/* Drug list */}
      <div className="space-y-2">
        {DRUGS.map((drug) => (
          <Card key={drug.name} className={`cursor-pointer border-2 transition-all hover:shadow-md ${selectedDrug?.name === drug.name ? "border-blue-400 bg-blue-50" : "border-slate-200"}`} onClick={() => calculate(drug)}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900">{drug.name}</span>
                    <Badge className="bg-slate-100 text-slate-600 text-xs">{drug.route}</Badge>
                    <Badge className="bg-blue-100 text-blue-700 text-xs">{drug.freq}</Badge>
                    {drug.doseBSA && <Badge className="bg-purple-100 text-purple-700 text-xs">BSA-based</Badge>}
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1">{drug.note}</p>
                </div>
                {selectedDrug?.name === drug.name && results && (
                  <div className="ml-3 text-right">
                    <div className="text-lg font-bold text-blue-700">{results.capped} {results.unit}</div>
                    {results.capped !== results.raw && <div className="text-xs text-orange-600">Capped (raw: {results.raw})</div>}
                  </div>
                )}
              </div>

              {selectedDrug?.name === drug.name && results && (
                <div className="mt-3 space-y-2">
                  <div className="bg-white rounded-lg p-3 border border-blue-200 text-sm">
                    {results.type === "weight" && <p>Dose: <strong>{results.perKg} mg/kg × {weight} kg = {results.raw} mg</strong>{drug.maxDose ? ` → Capped at ${drug.maxDose}mg → <strong>${results.capped} mg</strong>` : ""}</p>}
                    {results.type === "bsa" && <p>Dose: <strong>{drug.doseBSA} mg/m² × {bsa} m² = {results.raw} mg</strong>{drug.maxDose ? ` → Max ${drug.maxDose}mg → <strong>${results.capped} mg</strong>` : ""}</p>}
                  </div>
                  {egfr && (
                    <div className={`rounded-lg p-2 text-xs ${parseFloat(egfr) < 30 ? "bg-red-50 text-red-800" : "bg-green-50 text-green-800"}`}>
                      <strong>Renal adjustment (eGFR {egfr}):</strong> {drug.renalAdj}
                    </div>
                  )}
                  <div className="bg-amber-50 rounded-lg p-2 text-xs text-amber-800">
                    <strong>Clinical note:</strong> {drug.note}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Alert className="bg-amber-50 border-amber-200">
        <AlertTriangle className="w-4 h-4 text-amber-600" />
        <AlertDescription className="text-amber-800 text-xs">
          Always verify calculated doses against current formulary. Doses shown are starting/standard ranges. Individual variation, organ function, and TDM may require modification.
        </AlertDescription>
      </Alert>
    </div>
  );
}