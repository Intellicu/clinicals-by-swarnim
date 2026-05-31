import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle2, ArrowRight, ArrowDown, Calculator, Activity } from "lucide-react";
import { TMADecisionEngine, EculizumabEngine } from "./DecisionEngines";

const TABS = ["TMA Engine", "STEC-HUS Protocol", "aHUS + PLEX", "Eculizumab Dosing"];

export default function HUSPathway() {
  const [tab, setTab] = useState(0);

  return (
    <div className="space-y-4">
      <Alert className="bg-red-50 border-red-300 border-2">
        <AlertTriangle className="w-5 h-5 text-red-600" />
        <AlertDescription className="text-red-900 text-xs">
          <strong>MEDICAL EMERGENCY:</strong> TMA (HUS/TTP/aHUS) is life-threatening. Differentiate STEC-HUS from aHUS before treatment. Do NOT use eculizumab for STEC-HUS or TTP.
        </AlertDescription>
      </Alert>

      <div className="flex flex-wrap gap-1.5">
        {TABS.map((t, i) => (
          <button key={i} onClick={() => setTab(i)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${tab === i ? "bg-red-700 text-white border-red-700" : "bg-white border-slate-200 text-slate-600 hover:border-red-300"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 0 && <TMADecisionEngine />}

      {tab === 1 && (
        <div className="space-y-3">
          <div className="rounded-xl bg-gradient-to-r from-orange-700 to-red-700 p-4 text-white">
            <h3 className="text-sm font-bold">STEC-HUS Management Protocol</h3>
            <p className="text-xs text-orange-100">Shiga-toxin E. coli O157:H7 · KDIGO 2022 · ISPN</p>
          </div>
          {[
            { title: "Immediate Assessment", color: "bg-blue-50 border-blue-200", items: [
              "Confirm TMA triad: MAHA (Hb <10 + schistocytes ≥2%) + thrombocytopenia (Plt <150k) + AKI",
              "Stool culture + PCR (stx1/stx2/eae) + Shiga-toxin ELISA",
              "Peripheral smear URGENTLY — report schistocyte %",
              "ADAMTS13 activity (store frozen citrated plasma before any PEX)",
              "Anti-CFH antibodies — crucial to distinguish aHUS",
              "FBC, LDH, haptoglobin (undetectable = MAHA), renal panel, urinalysis"
            ]},
            { title: "Key DO NOTs", color: "bg-red-50 border-red-200", items: [
              "NO antibiotics — increases Shiga-toxin release by lysing bacteria → worsens HUS",
              "NO anti-motility agents (loperamide, opioids) — prolong toxin exposure",
              "NO plasma exchange for STEC-HUS (does not help, may worsen)",
              "NO eculizumab for STEC-HUS (not beneficial per ECUSTEC trial)",
              "NO NSAIDs — nephrotoxic in AKI"
            ]},
            { title: "Supportive Management", color: "bg-green-50 border-green-200", items: [
              "IV fluids: early isotonic normal saline from prodromal diarrhoea onset — prevents severe AKI",
              "Strict fluid balance — avoid fluid overload (worsens cerebral oedema + pulmonary oedema in AKI)",
              "Transfuse pRBC if Hb <7 g/dL (aim 8–9 g/dL — avoid >10 in AKI)",
              "Platelet transfusion ONLY if active bleeding or pre-procedure — avoid otherwise (worsens TMA)",
              "Antihypertensives: amlodipine or labetalol for severe HTN",
              "Dialysis: initiate early per KDIGO AKI criteria (AEIOU criteria)"
            ]},
            { title: "Neurological HUS (severe)", color: "bg-purple-50 border-purple-200", items: [
              "Seizures/encephalopathy in 20–50% STEC-HUS — high-risk marker",
              "MRI brain: basal ganglia + white matter lesions (PRES, direct toxin effect)",
              "Eculizumab: CONSIDER in neurological STEC-HUS with deterioration (NOT routine) — case-by-case decision with specialist",
              "Maintain MAP to prevent cerebral hypoperfusion",
              "Levetiracetam for seizures (avoid enzyme-inducing AEDs)"
            ]},
          ].map((s, i) => (
            <Card key={i} className={`border-2 ${s.color}`}>
              <CardHeader className="pb-2 pt-3 px-3"><CardTitle className="text-xs font-bold">{s.title}</CardTitle></CardHeader>
              <CardContent className="px-3 pb-3">
                <ul className="space-y-1">{s.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-2 text-xs text-slate-800">
                    <ArrowRight className="w-3 h-3 text-blue-500 flex-shrink-0 mt-0.5" />{item}
                  </li>
                ))}</ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {tab === 2 && (
        <div className="space-y-3">
          <div className="rounded-xl bg-gradient-to-r from-red-800 to-rose-700 p-4 text-white">
            <h3 className="text-sm font-bold">aHUS — Complement-Mediated TMA</h3>
            <p className="text-xs text-red-100">Non-diarrhoeal TMA · Genetic complement dysregulation · Eculizumab life-saving</p>
          </div>
          {[
            { title: "Diagnostic Criteria for aHUS", color: "bg-blue-50 border-blue-200", items: [
              "TMA CONFIRMED (MAHA + thrombocytopenia + organ injury)",
              "STEC-HUS excluded: stool Shiga-toxin NEGATIVE (stool PCR + culture)",
              "TTP excluded: ADAMTS13 activity >10%",
              "No secondary cause (SLE, drugs, HSCT, HIV, malignancy)",
              "Complement markers: low C3, normal C4, low Factor H level, anti-CFH Ab"
            ]},
            { title: "Pre-Treatment Checklist", color: "bg-amber-50 border-amber-200", items: [
              "MenACWY + MenB vaccines BEFORE eculizumab (or co-prescribe penicillin V 250mg BD prophylaxis if urgent)",
              "Store 10 mL frozen EDTA plasma BEFORE any PEX or eculizumab",
              "Genetic panel: CFH, CFI, MCP/CD46, C3, CFB, THBD, CFHR1/3 (send to AIIMS/Medgenome)",
              "Anti-CFH antibody titre (ELISA) — if >150 AU/mL: anti-CFH–mediated aHUS protocol",
              "Baseline: C3, C4, CH50, AH50, Factor H, Factor I, sC5b-9"
            ]},
            { title: "Plasma Exchange Protocol (Bridge to Eculizumab)", color: "bg-slate-50 border-slate-200", items: [
              "Initiate PEX if eculizumab unavailable — NOT definitive treatment",
              "Volume: 1–1.5× plasma volume (40–60 mL/kg); replacement with FFP",
              "Daily × 5 sessions, then every 48h × 2 weeks, then 3× weekly",
              "Central access: large-bore CVC or Permcath required",
              "Monitor: platelets, LDH, haptoglobin, creatinine after each session",
              "Transition to eculizumab as soon as available — continue PEX until therapeutic eculizumab levels"
            ]},
            { title: "Anti-CFH Antibody–Mediated aHUS (Special Protocol)", color: "bg-purple-50 border-purple-200", items: [
              "Anti-CFH Ab titre >150 AU/mL: aggressive immune suppression + PEX",
              "PEX daily × 5–7 days to remove Ab; taper over 4–6 weeks",
              "Prednisolone 1–2 mg/kg/day × 1 month → alternate day taper",
              "IV Cyclophosphamide 500 mg/m² q3-4w × 3–5 doses (or Rituximab 375 mg/m² × 2 doses)",
              "Monitor Ab titres: target <150 AU/mL; may taper eculizumab if sustained clearance",
              "India: anti-CFH Ab test at AIIMS-New Delhi, PGIMER Chandigarh"
            ]},
          ].map((s, i) => (
            <Card key={i} className={`border-2 ${s.color}`}>
              <CardHeader className="pb-2 pt-3 px-3"><CardTitle className="text-xs font-bold">{s.title}</CardTitle></CardHeader>
              <CardContent className="px-3 pb-3">
                <ul className="space-y-1">{s.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-2 text-xs text-slate-800">
                    <CheckCircle2 className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />{item}
                  </li>
                ))}</ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {tab === 3 && <EculizumabEngine />}
    </div>
  );
}