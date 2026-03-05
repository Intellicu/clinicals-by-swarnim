import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Info } from "lucide-react";

export default function AcidBasePathway() {
  const [vals, setVals] = useState({ ph: "", pco2: "", hco3: "", na: "", cl: "" });
  const [interp, setInterp] = useState(null);

  const interpret = () => {
    const ph = parseFloat(vals.ph), pco2 = parseFloat(vals.pco2), hco3 = parseFloat(vals.hco3);
    const na = parseFloat(vals.na), cl = parseFloat(vals.cl);
    if (!ph || !pco2 || !hco3) return;
    let primary = "", compensation = "", ag = "";
    if (ph < 7.35) {
      primary = pco2 > 45 ? "Respiratory Acidosis" : "Metabolic Acidosis";
    } else if (ph > 7.45) {
      primary = pco2 < 35 ? "Respiratory Alkalosis" : "Metabolic Alkalosis";
    } else {
      primary = "Normal / Compensated";
    }
    if (!isNaN(na) && !isNaN(cl)) {
      const agv = na - (cl + hco3);
      ag = `Anion Gap: ${agv.toFixed(1)} mEq/L (${agv > 12 ? "ELEVATED — consider MUDPILES" : "Normal"})`;
    }
    setInterp({ primary, ag });
  };

  return (
    <div className="space-y-4">
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-blue-800"><strong>Systematic Acid-Base Interpretation</strong> — 5-step approach</AlertDescription>
      </Alert>

      <Card>
        <CardHeader><CardTitle className="text-base">ABG Interpreter</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {[["ph","pH (7.35-7.45)"],["pco2","pCO₂ (35-45)"],["hco3","HCO₃ (22-26)"],["na","Na+ (optional)"],["cl","Cl- (optional)"]].map(([k,l]) => (
              <div key={k}><Label className="text-xs">{l}</Label><Input type="number" value={vals[k]} onChange={e => setVals(v => ({...v,[k]:e.target.value}))} className="mt-1" /></div>
            ))}
          </div>
          <button onClick={interpret} className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Interpret ABG</button>
          {interp && (
            <div className="space-y-2">
              <div className="bg-slate-100 rounded-lg p-3"><p className="font-bold text-slate-900">{interp.primary}</p></div>
              {interp.ag && <div className="bg-purple-50 rounded-lg p-3 text-sm text-purple-900">{interp.ag}</div>}
            </div>
          )}
        </CardContent>
      </Card>

      {[
        { title: "5-Step Approach", color: "bg-blue-50 border-blue-200", items: [
          "Step 1: Is pH acidotic (<7.35), normal, or alkalotic (>7.45)?",
          "Step 2: Primary disorder — if acidosis: is pCO2 high (respiratory) or HCO3 low (metabolic)?",
          "Step 3: Is compensation adequate? (Winter's formula for met. acidosis: expected pCO2 = 1.5×HCO3 + 8 ± 2)",
          "Step 4: Calculate anion gap = Na − (Cl + HCO3) — normal 8–12 mEq/L",
          "Step 5: If AG elevated, calculate delta-delta to detect mixed disorders"
        ]},
        { title: "High AG Metabolic Acidosis — MUDPILES", color: "bg-red-50 border-red-200", items: [
          "M — Methanol/Metformin", "U — Uremia", "D — DKA",
          "P — Propylene glycol/Paraldehyde", "I — Isoniazid/Iron", "L — Lactic acidosis",
          "E — Ethylene glycol", "S — Salicylates"
        ]},
        { title: "Normal AG Metabolic Acidosis — HARDUPS", color: "bg-amber-50 border-amber-200", items: [
          "H — Hyperalimentation", "A — Acetazolamide", "R — RTA (all types)",
          "D — Diarrhea (GI bicarbonate loss)", "U — Ureterosigmoidostomy",
          "P — Post-hypocapnia", "S — Spironolactone"
        ]}
      ].map((s,i) => (
        <Card key={i} className={`border-2 ${s.color}`}>
          <CardHeader className="pb-2"><CardTitle className="text-sm">{s.title}</CardTitle></CardHeader>
          <CardContent><ul className="space-y-1">{s.items.map((item,j) => (
            <li key={j} className="flex items-start gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" /><span>{item}</span></li>
          ))}</ul></CardContent>
        </Card>
      ))}
    </div>
  );
}