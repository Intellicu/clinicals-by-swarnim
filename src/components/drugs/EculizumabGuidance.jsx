import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Shield, Activity, Syringe, Thermometer, BookOpen, ChevronDown, ChevronUp } from "lucide-react";

// Weight-based pediatric dosing table per IJN 2025 / EMA label
const WEIGHT_BANDS = [
  { range: "5 to <10 kg",  induction: "300 mg × 1 dose",    maintenance: "300 mg every 3 weeks",  pe_supplement: "300 mg per PE session" },
  { range: "10 to <20 kg", induction: "600 mg × 1 dose",    maintenance: "300 mg every 2 weeks",  pe_supplement: "300 mg per PE session" },
  { range: "20 to <30 kg", induction: "600 mg × 2 doses (wk 1+2)", maintenance: "600 mg every 2 weeks", pe_supplement: "300 mg per PE session" },
  { range: "30 to <40 kg", induction: "900 mg × 2 doses (wk 1+2)", maintenance: "1200 mg every 2 weeks", pe_supplement: "600 mg per PE session" },
  { range: "≥40 kg (adult)", induction: "900 mg × 4 doses (wk 1–4)", maintenance: "1200 mg every 2 weeks", pe_supplement: "600 mg per PE session" },
];

const VACCINES = [
  { name: "Meningococcal MenACWY", type: "Essential", note: "≥2 weeks before first dose (or antibiotics from day 1)" },
  { name: "Meningococcal MenB (Bexsero/Trumenba)", type: "Essential", note: "2-dose schedule, ≥2 weeks before first dose" },
  { name: "Pneumococcal PCV13 + PPSV23", type: "Essential", note: "PCV13 primary, PPSV23 booster at ≥2 years" },
  { name: "Haemophilus influenzae type b (Hib)", type: "Essential", note: "Primary series or booster if not completed" },
  { name: "Influenza (inactivated)", type: "Annual", note: "Annual dose — inactivated only, not live attenuated" },
];

const MONITORING = [
  { test: "LDH", frequency: "Before every infusion (aHUS activity marker)", note: "Rising LDH = TMA activity — urgent review" },
  { test: "Platelets", frequency: "Before every infusion", note: "<100 × 10⁹/L — stop, review, consider supplemental eculizumab" },
  { test: "Creatinine / eGFR", frequency: "Before every infusion", note: "Monitor renal recovery trajectory" },
  { test: "Haemoglobin", frequency: "Before every infusion", note: "Haemolytic anaemia — falling Hb = breakthrough TMA" },
  { test: "Haptoglobin", frequency: "Monthly", note: "Undetectable = active haemolysis" },
  { test: "CH50 / AP50", frequency: "Monthly", note: "Target: complete complement inhibition (CH50 undetectable)" },
  { test: "Free Hb (plasma)", frequency: "Monthly", note: "Elevated = intravascular haemolysis" },
  { test: "Meningococcal antibody titres", frequency: "Annual", note: "Confirm ongoing vaccine protection" },
  { test: "Urinalysis + protein:creatinine", frequency: "Before every infusion", note: "Persistent proteinuria = residual renal injury" },
];

export default function EculizumabGuidance() {
  const [weight, setWeight] = useState("");
  const [showTransplant, setShowTransplant] = useState(false);
  const [showRefs, setShowRefs] = useState(false);

  const weightNum = parseFloat(weight);
  const selectedBand = WEIGHT_BANDS.find(b => {
    if (b.range.includes("5 to <10")) return weightNum >= 5 && weightNum < 10;
    if (b.range.includes("10 to <20")) return weightNum >= 10 && weightNum < 20;
    if (b.range.includes("20 to <30")) return weightNum >= 20 && weightNum < 30;
    if (b.range.includes("30 to <40")) return weightNum >= 30 && weightNum < 40;
    if (b.range.includes("≥40")) return weightNum >= 40;
    return false;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white border-0">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <Shield className="w-10 h-10 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-bold">Eculizumab (Soliris) — Paediatric aHUS Protocol</h2>
              <p className="text-blue-200 text-sm mt-1">
                Complement C5 inhibitor · Terminal complement blockade · Atypical HUS
              </p>
              <div className="flex gap-2 flex-wrap mt-2">
                <Badge className="bg-white/20 text-xs">IJN 2025 Evidence</Badge>
                <Badge className="bg-white/20 text-xs">KDIGO aHUS 2021</Badge>
                <Badge className="bg-green-400/80 text-xs">✓ Expert Reviewed — May 2025</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* INFECTION EMERGENCY WARNING */}
      <Alert className="bg-red-600 border-red-700 border-2 text-white">
        <AlertTriangle className="w-6 h-6 text-white" />
        <AlertDescription>
          <p className="font-bold text-lg mb-1">🚨 CRITICAL MENINGOCOCCAL RISK WARNING</p>
          <p className="text-sm">
            Eculizumab BLOCKS terminal complement activation → severely impairs meningococcal bactericidal killing.
            ANY patient on eculizumab with FEVER ≥38°C, headache, neck stiffness, or purpuric rash must be treated
            as <strong>MENINGOCOCCAL EMERGENCY</strong>: <strong>Ceftriaxone 100 mg/kg (max 2 g) IV IMMEDIATELY</strong>,
            before LP, before confirmatory cultures.
            <br />
            <strong>Every patient/family must carry a Patient Emergency Card.</strong>
          </p>
        </AlertDescription>
      </Alert>

      {/* Weight-based dosing calculator */}
      <Card className="bg-white border border-blue-200 shadow-sm">
        <CardHeader className="bg-blue-50 border-b py-3 px-5">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" /> Weight-Based Paediatric Dosing
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="max-w-xs">
            <Label className="text-xs font-semibold">Patient Weight (kg)</Label>
            <Input value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 18" className="mt-1" />
          </div>

          {selectedBand && (
            <div className="grid md:grid-cols-3 gap-3">
              {[
                { label: "Weight Band", value: selectedBand.range, color: "bg-blue-50 border-blue-200" },
                { label: "Induction", value: selectedBand.induction, color: "bg-indigo-50 border-indigo-300" },
                { label: "Maintenance", value: selectedBand.maintenance, color: "bg-green-50 border-green-300" },
              ].map(({ label, value, color }) => (
                <div key={label} className={`rounded-xl border-2 p-4 ${color}`}>
                  <p className="text-xs uppercase font-bold text-slate-500 mb-1">{label}</p>
                  <p className="font-bold text-slate-900">{value}</p>
                </div>
              ))}
            </div>
          )}

          {selectedBand && (
            <Alert className="bg-amber-50 border-amber-300">
              <AlertDescription className="text-amber-800 text-sm">
                <strong>Plasma Exchange Supplemental Dose:</strong> {selectedBand.pe_supplement} within 60 minutes of each PE session completion.
                If PE done within 1 week before scheduled dose — give supplemental dose after PE and keep scheduled dose on time.
              </AlertDescription>
            </Alert>
          )}

          {/* Full dosing table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="text-left px-3 py-2 font-semibold">Weight</th>
                  <th className="text-left px-3 py-2 font-semibold">Induction</th>
                  <th className="text-left px-3 py-2 font-semibold">Maintenance</th>
                  <th className="text-left px-3 py-2 font-semibold">Post-PE Supplement</th>
                </tr>
              </thead>
              <tbody>
                {WEIGHT_BANDS.map((b, i) => (
                  <tr key={i}
                    className={`${weight && selectedBand === b ? "bg-blue-100 font-bold" : i % 2 === 0 ? "bg-white" : "bg-slate-50"}`}>
                    <td className="px-3 py-2">{b.range}</td>
                    <td className="px-3 py-2">{b.induction}</td>
                    <td className="px-3 py-2">{b.maintenance}</td>
                    <td className="px-3 py-2">{b.pe_supplement}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-700 space-y-1">
            <p><strong>Infusion:</strong> IV over 35 minutes (paediatric doses). Do not exceed 2 hours total infusion time.</p>
            <p><strong>Pre-infusion:</strong> Antihistamine + paracetamol 30 minutes before. Corticosteroid for first infusion if hypersensitivity history.</p>
            <p><strong>Dilution:</strong> 0.9% NaCl or 5% dextrose to 5 mg/mL. Gently invert, do not shake.</p>
            <p><strong>Storage:</strong> Undiluted: 2–8°C. Diluted: stable 24 hours at 2–8°C.</p>
          </div>
        </CardContent>
      </Card>

      {/* Indications */}
      <Card className="bg-white border border-slate-200">
        <CardHeader className="bg-slate-50 border-b py-3 px-5">
          <CardTitle className="text-sm">Indications (Complement-mediated aHUS)</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-2 text-sm text-slate-700">
            {[
              "Complement-mediated (atypical) HUS confirmed by CFH/CFI/CD46/C3/CFB/THBD/DGKE genetic mutation OR functional complement testing",
              "STEC-negative TMA with complement activation evidence (low C3, elevated sC5b-9)",
              "Recurrent episodes of TMA not explained by ADAMTS13 deficiency or Shiga toxin",
              "Living-donor kidney transplant in patient with previous aHUS from high-risk mutation (CFH, CFI, C3, CFB)",
              "Transplant — prophylactic/therapeutic for graft aHUS recurrence"
            ].map((ind, i) => (
              <div key={i} className="flex items-start gap-2 bg-blue-50 p-3 rounded-lg">
                <span className="text-blue-600 font-bold text-xs mt-0.5">{i + 1}.</span>
                <span className="text-xs">{ind}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Vaccines */}
      <Card className="bg-white border border-red-200">
        <CardHeader className="bg-red-50 border-b py-3 px-5">
          <CardTitle className="text-sm flex items-center gap-2">
            <Syringe className="w-4 h-4 text-red-600" /> Mandatory Vaccination Protocol
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-2">
          <Alert className="bg-red-50 border-red-300 mb-3">
            <AlertDescription className="text-xs text-red-800">
              <strong>Vaccines MUST be given ≥2 weeks before starting eculizumab.</strong>
              In urgent aHUS requiring immediate treatment: start empiric antibiotic prophylaxis from Day 1 and vaccinate as soon as clinically possible.
            </AlertDescription>
          </Alert>
          {VACCINES.map((v, i) => (
            <div key={i} className="flex items-start gap-3 bg-white border border-red-200 rounded-lg p-3">
              <Badge className={`text-xs flex-shrink-0 ${v.type === "Essential" ? "bg-red-600 text-white" : "bg-amber-400 text-white"}`}>
                {v.type}
              </Badge>
              <div>
                <p className="font-semibold text-sm text-slate-900">{v.name}</p>
                <p className="text-xs text-slate-600 mt-0.5">{v.note}</p>
              </div>
            </div>
          ))}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-2">
            <p className="text-xs font-bold text-amber-900 mb-1">Antibiotic Prophylaxis (if vaccines not possible before starting):</p>
            <p className="text-xs text-amber-800">Phenoxymethylpenicillin (Penicillin V) 250 mg BD (if ≥12 years; 125 mg BD for younger) OR Amoxicillin 250 mg BD. Continue until 2 weeks post-vaccination. Consider lifelong prophylaxis in asplenic/high-risk patients.</p>
          </div>
        </CardContent>
      </Card>

      {/* Monitoring */}
      <Card className="bg-white border border-slate-200">
        <CardHeader className="bg-green-50 border-b py-3 px-5">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-green-600" /> Monitoring Protocol
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="text-left px-3 py-2 font-semibold">Test</th>
                  <th className="text-left px-3 py-2 font-semibold">Frequency</th>
                  <th className="text-left px-3 py-2 font-semibold">Clinical Note</th>
                </tr>
              </thead>
              <tbody>
                {MONITORING.map((m, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                    <td className="px-3 py-2 font-semibold text-slate-900">{m.test}</td>
                    <td className="px-3 py-2 text-slate-700">{m.frequency}</td>
                    <td className="px-3 py-2 text-slate-600 italic">{m.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Transplant overlap */}
      <Card className="bg-white border border-slate-200">
        <CardHeader className="bg-slate-50 border-b py-3 px-5">
          <button className="w-full flex items-center justify-between text-sm font-bold text-slate-700"
            onClick={() => setShowTransplant(!showTransplant)}>
            <span>Transplant Overlap Guidance</span>
            {showTransplant ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </CardHeader>
        {showTransplant && (
          <CardContent className="p-4 space-y-3 text-sm text-slate-700">
            <p><strong>Pre-transplant:</strong> Start eculizumab at transplant if high-risk CFH/CFI/C3/CFB mutation. Ensure meningococcal vaccinations complete ≥2 weeks before OR antibiotic prophylaxis started.</p>
            <p><strong>Peri-operative:</strong> Give eculizumab within 24 hours of transplant (peri-operative dose). Then maintain weekly dosing for first 3 months, then standard maintenance schedule.</p>
            <p><strong>Post-transplant monitoring:</strong> LDH, platelets, creatinine daily for first week, then weekly for 3 months, then per maintenance schedule.</p>
            <p><strong>TMA recurrence post-transplant:</strong> Increase frequency (weekly) and check trough eculizumab levels. Consider plasma exchange + eculizumab supplemental dosing.</p>
            <p><strong>Living donor:</strong> Donor should be screened for same complement mutations. Avoid donors with known pathogenic mutations.</p>
          </CardContent>
        )}
      </Card>

      {/* References */}
      <Card className="bg-white border border-slate-200">
        <CardHeader className="bg-slate-50 border-b py-3 px-5">
          <button className="w-full flex items-center justify-between text-sm font-bold text-slate-700"
            onClick={() => setShowRefs(!showRefs)}>
            <span className="flex items-center gap-2"><BookOpen className="w-4 h-4" /> Evidence Base & References</span>
            {showRefs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </CardHeader>
        {showRefs && (
          <CardContent className="p-4 space-y-2 text-xs text-slate-700">
            {[
              { ref: "Indian Journal of Nephrology 2025 — Eculizumab in Paediatric aHUS: Indian Consensus Guidance", year: "2025", type: "Guideline" },
              { ref: "Legendre CM, Licht C, Muus P, et al. Terminal complement inhibitor eculizumab in atypical hemolytic–uremic syndrome. N Engl J Med. 2013;368:2169–81", year: "2013", type: "RCT" },
              { ref: "Greenbaum LA, Fila M, Ardissino G, et al. Eculizumab is a safe and effective treatment in pediatric patients with aHUS. Kidney Int. 2016;89:701–11", year: "2016", type: "Cohort" },
              { ref: "KDIGO Controversies Conference on Atypical HUS Management. Kidney Int. 2021", year: "2021", type: "Guideline" },
              { ref: "European Working Group on Atypical HUS. Eculizumab dosing during plasma exchange. Kidney Int. 2015;88:891", year: "2015", type: "Guidance" },
              { ref: "EMA Soliris (eculizumab) Summary of Product Characteristics 2024", year: "2024", type: "SmPC" },
            ].map((r, i) => (
              <div key={i} className="flex items-start gap-2 bg-slate-50 p-2 rounded">
                <Badge variant="outline" className="text-xs flex-shrink-0">{r.type}</Badge>
                <span>{r.ref}</span>
              </div>
            ))}
          </CardContent>
        )}
      </Card>
    </div>
  );
}