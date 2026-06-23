import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Shield, Activity, Syringe, Thermometer, BookOpen, ChevronDown, ChevronUp, FlaskConical, Clock } from "lucide-react";

// Soliris PI India v1.0 Jan 2025 + EMA SmPC 2024
const WEIGHT_BANDS = [
  {
    range: "5 to <10 kg",
    induction: "300 mg single dose (Week 1)",
    maintenance: "300 mg at Week 2; then 300 mg every 3 weeks",
    pe_supplement: "300 mg per PE/exchange session",
    ffp_supplement: "300 mg per FFP infusion",
  },
  {
    range: "10 to <20 kg",
    induction: "600 mg single dose (Week 1)",
    maintenance: "300 mg at Week 2; then 300 mg every 2 weeks",
    pe_supplement: "300 mg per PE/exchange session",
    ffp_supplement: "300 mg per FFP infusion",
  },
  {
    range: "20 to <30 kg",
    induction: "600 mg weekly × 2 weeks (Weeks 1–2)",
    maintenance: "600 mg at Week 3; then 600 mg every 2 weeks",
    pe_supplement: "600 mg per PE/exchange session",
    ffp_supplement: "300 mg per FFP infusion",
  },
  {
    range: "30 to <40 kg",
    induction: "600 mg weekly × 2 weeks (Weeks 1–2)",
    maintenance: "900 mg at Week 3; then 900 mg every 2 weeks",
    pe_supplement: "600 mg per PE/exchange session",
    ffp_supplement: "300 mg per FFP infusion",
  },
  {
    range: "≥40 kg (Adult ≥18 yrs)",
    induction: "900 mg IV weekly × 4 weeks (Weeks 1–4)",
    maintenance: "1200 mg at Week 5; then 1200 mg every 2 weeks",
    pe_supplement: "600 mg per PE/exchange session",
    ffp_supplement: "300 mg per FFP infusion",
  },
];

const DILUTION_TABLE = [
  { dose: "300 mg", drugVol: "30 mL", diluent: "30 mL", finalVol: "60 mL" },
  { dose: "600 mg", drugVol: "60 mL", diluent: "60 mL", finalVol: "120 mL" },
  { dose: "900 mg", drugVol: "90 mL", diluent: "90 mL", finalVol: "180 mL" },
  { dose: "1200 mg", drugVol: "120 mL", diluent: "120 mL", finalVol: "240 mL" },
];

const VACCINES = [
  { name: "Meningococcal MenACWY", type: "Essential", note: "≥2 weeks before first dose (or antibiotics from Day 1)" },
  { name: "Meningococcal MenB (Bexsero/Trumenba)", type: "Essential", note: "2-dose schedule, ≥2 weeks before first dose" },
  { name: "Pneumococcal PCV13 + PPSV23", type: "Essential", note: "PCV13 primary, PPSV23 booster at ≥2 years" },
  { name: "Haemophilus influenzae type b (Hib)", type: "Essential", note: "Primary series or booster if not completed" },
  { name: "Influenza (inactivated)", type: "Annual", note: "Annual dose — inactivated only, not live attenuated" },
];

const MONITORING = [
  { test: "LDH", frequency: "Before every infusion", note: "Rising LDH = TMA activity — urgent review" },
  { test: "Platelets", frequency: "Before every infusion", note: "<100 × 10⁹/L — stop, review, consider supplemental eculizumab" },
  { test: "Creatinine / eGFR", frequency: "Before every infusion", note: "Monitor renal recovery trajectory" },
  { test: "Haemoglobin", frequency: "Before every infusion", note: "Falling Hb = breakthrough haemolysis / TMA" },
  { test: "Urinalysis + protein:creatinine", frequency: "Before every infusion", note: "Persistent proteinuria = residual renal injury" },
  { test: "Haptoglobin", frequency: "Monthly", note: "Undetectable = active haemolysis" },
  { test: "CH50 / AP50", frequency: "Monthly", note: "Target: complete complement inhibition (CH50 undetectable)" },
  { test: "Free Hb (plasma)", frequency: "Monthly", note: "Elevated = intravascular haemolysis" },
  { test: "Meningococcal antibody titres", frequency: "Annual", note: "Confirm ongoing vaccine protection" },
];

export default function EculizumabGuidance() {
  const [weight, setWeight] = useState("");
  const [showPrep, setShowPrep] = useState(false);
  const [showTransplant, setShowTransplant] = useState(false);
  const [showRefs, setShowRefs] = useState(false);

  const weightNum = parseFloat(weight);
  const selectedBand = WEIGHT_BANDS.find(b => {
    if (b.range.includes("5 to <10"))  return weightNum >= 5  && weightNum < 10;
    if (b.range.includes("10 to <20")) return weightNum >= 10 && weightNum < 20;
    if (b.range.includes("20 to <30")) return weightNum >= 20 && weightNum < 30;
    if (b.range.includes("30 to <40")) return weightNum >= 30 && weightNum < 40;
    if (b.range.includes("≥40"))       return weightNum >= 40;
    return false;
  });
  const isAdult = selectedBand?.range.includes("≥40");

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white border-0">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <Shield className="w-10 h-10 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-bold">Eculizumab (Soliris™) — aHUS Dosing Protocol</h2>
              <p className="text-blue-200 text-sm mt-1">
                Complement C5 inhibitor · Terminal complement blockade · Atypical HUS
              </p>
              <div className="flex gap-2 flex-wrap mt-2">
                <Badge className="bg-white/20 text-xs">Soliris PI India v1.0 Jan 2025</Badge>
                <Badge className="bg-white/20 text-xs">EMA SmPC 2024</Badge>
                <Badge className="bg-white/20 text-xs">KDIGO aHUS 2021</Badge>
              </div>
              <p className="text-blue-300 text-[11px] mt-2">Vial: 300 mg/30 mL (10 mg/mL) · Single-use · Store 2–8°C</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* INFECTION EMERGENCY WARNING */}
      <Alert className="bg-red-600 border-red-700 border-2 text-white">
        <AlertTriangle className="w-6 h-6 text-white" />
        <AlertDescription>
          <p className="font-bold text-lg mb-1">🚨 CRITICAL MENINGOCOCCAL RISK</p>
          <p className="text-sm">
            Eculizumab BLOCKS terminal complement → severely impairs meningococcal killing.
            ANY patient with <strong>FEVER ≥38°C, headache, neck stiffness, or purpuric rash</strong> =
            treat as <strong>MENINGOCOCCAL EMERGENCY: Ceftriaxone 100 mg/kg (max 2 g) IV IMMEDIATELY</strong>,
            before LP, before cultures.
            <br />
            <strong>Every patient/family must carry a Patient Emergency Card.</strong>
          </p>
        </AlertDescription>
      </Alert>

      {/* Weight-based dosing calculator */}
      <Card className="bg-white border border-blue-200 shadow-sm">
        <CardHeader className="bg-blue-50 border-b py-3 px-5">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" /> Weight-Based Dosing Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="max-w-xs">
            <Label className="text-xs font-semibold">Patient Weight (kg)</Label>
            <Input value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 18" className="mt-1" />
          </div>

          {selectedBand && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border-2 bg-indigo-50 border-indigo-300 p-4">
                  <p className="text-xs uppercase font-bold text-indigo-500 mb-1">Induction Phase</p>
                  <p className="font-bold text-slate-900 text-sm">{selectedBand.induction}</p>
                </div>
                <div className="rounded-xl border-2 bg-green-50 border-green-300 p-4">
                  <p className="text-xs uppercase font-bold text-green-600 mb-1">Maintenance Phase</p>
                  <p className="font-bold text-slate-900 text-sm">{selectedBand.maintenance}</p>
                </div>
              </div>

              <Alert className="bg-amber-50 border-amber-300">
                <AlertDescription className="text-amber-800 text-xs space-y-1">
                  <p className="font-bold">Supplemental Dosing — Plasma Interventions</p>
                  <p>
                    <strong>Plasmapheresis / Plasma Exchange:</strong> {selectedBand.pe_supplement} —
                    give within <strong>60 minutes AFTER</strong> each session.
                  </p>
                  <p>
                    <strong>Fresh Frozen Plasma infusion:</strong> {selectedBand.ffp_supplement} —
                    give <strong>60 minutes BEFORE</strong> each FFP infusion.
                  </p>
                  <p className="text-[11px] text-amber-700 mt-1">
                    Supplemental dose based on most recent Soliris™ dose received:
                    if last dose was 300 mg → supplement 300 mg; if ≥600 mg → supplement 600 mg.
                    Note: FFP timing is opposite to PE (give BEFORE, not after).
                  </p>
                </AlertDescription>
              </Alert>

              <Alert className="bg-blue-50 border-blue-200">
                <AlertDescription className="text-blue-800 text-xs space-y-1">
                  <p><strong>Infusion time ({isAdult ? "adult" : "paediatric"}):</strong>{" "}
                    {isAdult ? "25–45 minutes (max 2 hours if slowed)" : "1–4 hours (max 4 hours if slowed)"}
                  </p>
                  <p><strong>Post-infusion observation:</strong> Monitor patient for 1 hour after infusion completion.</p>
                  <p><strong>Route:</strong> IV infusion only — do NOT give as IV push or bolus injection.</p>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Full dosing table */}
          <div>
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Complete Dosing Table</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="text-left px-3 py-2 font-semibold border border-slate-200">Weight</th>
                    <th className="text-left px-3 py-2 font-semibold border border-slate-200">Induction</th>
                    <th className="text-left px-3 py-2 font-semibold border border-slate-200">Maintenance</th>
                    <th className="text-left px-3 py-2 font-semibold border border-slate-200">PE Supplement (after)</th>
                    <th className="text-left px-3 py-2 font-semibold border border-slate-200">FFP Supplement (before)</th>
                  </tr>
                </thead>
                <tbody>
                  {WEIGHT_BANDS.map((b, i) => (
                    <tr key={i}
                      className={`${weight && selectedBand === b ? "bg-blue-100 font-semibold" : i % 2 === 0 ? "bg-white" : "bg-slate-50"}`}>
                      <td className="px-3 py-2 border border-slate-200 whitespace-nowrap">{b.range}</td>
                      <td className="px-3 py-2 border border-slate-200">{b.induction}</td>
                      <td className="px-3 py-2 border border-slate-200">{b.maintenance}</td>
                      <td className="px-3 py-2 border border-slate-200">{b.pe_supplement}</td>
                      <td className="px-3 py-2 border border-slate-200">{b.ffp_supplement}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-slate-500 mt-1.5">
              Maintenance doses may be given within ±2 days of scheduled time point.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Preparation & Administration */}
      <Card className="bg-white border border-slate-200">
        <CardHeader className="bg-slate-50 border-b py-3 px-5">
          <button className="w-full flex items-center justify-between text-sm font-bold text-slate-700"
            onClick={() => setShowPrep(!showPrep)}>
            <span className="flex items-center gap-2"><FlaskConical className="w-4 h-4" /> Preparation & Administration</span>
            {showPrep ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </CardHeader>
        {showPrep && (
          <CardContent className="p-4 space-y-4 text-xs text-slate-700">
            {/* Step 1 */}
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0 text-sm">1</div>
              <div>
                <p className="font-semibold text-slate-900 mb-1">Inspect the vial</p>
                <p>Visually inspect for particulate matter and discolouration. Solution should be clear and colourless. Do not use if cloudy or discoloured.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0 text-sm">2</div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900 mb-1">Dilute to 5 mg/mL</p>
                <p className="mb-2">Withdraw required volume from vial(s), transfer to infusion bag. Diluents: <strong>0.9% NaCl</strong>, <strong>0.45% NaCl</strong>, or <strong>5% Dextrose in water</strong>. Volume of diluent = volume of drug.</p>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-blue-50">
                        <th className="text-left px-2 py-1.5 font-semibold border border-blue-200">Dose</th>
                        <th className="text-left px-2 py-1.5 font-semibold border border-blue-200">Drug Volume</th>
                        <th className="text-left px-2 py-1.5 font-semibold border border-blue-200">Diluent Volume</th>
                        <th className="text-left px-2 py-1.5 font-semibold border border-blue-200">Final Volume</th>
                      </tr>
                    </thead>
                    <tbody>
                      {DILUTION_TABLE.map((r, i) => (
                        <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                          <td className="px-2 py-1.5 font-bold border border-slate-200">{r.dose}</td>
                          <td className="px-2 py-1.5 border border-slate-200">{r.drugVol}</td>
                          <td className="px-2 py-1.5 border border-slate-200">{r.diluent}</td>
                          <td className="px-2 py-1.5 font-semibold border border-slate-200 text-blue-700">{r.finalVol} @ 5 mg/mL</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0 text-sm">3</div>
              <div>
                <p className="font-semibold text-slate-900 mb-1">Mix and check</p>
                <p>Gently agitate the bag to ensure thorough mixing. Admixture should be clear and colourless. Allow to reach room temperature (18–25°C) before administering. <strong>Do not heat in microwave.</strong></p>
                <p className="text-amber-700 font-semibold mt-1">⚠ Use immediately after dilution.</p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0 text-sm">4</div>
              <div>
                <p className="font-semibold text-slate-900 mb-1">Infusion</p>
                <p><strong>Do NOT give as IV push or bolus.</strong> Administer by IV infusion only, via gravity feed, syringe pump, or infusion pump.</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div className="bg-slate-50 rounded-lg p-2 border border-slate-200">
                    <p className="font-semibold text-slate-700">Adults (≥18 yrs)</p>
                    <p>25–45 minutes</p>
                    <p className="text-slate-500">Max 2 hours if slowed</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2 border border-slate-200">
                    <p className="font-semibold text-slate-700">Paediatric (&lt;18 yrs)</p>
                    <p>1–4 hours</p>
                    <p className="text-slate-500">Max 4 hours if slowed</p>
                  </div>
                </div>
                <p className="mt-1.5 text-slate-500">Monitor patient throughout infusion. If adverse reaction — slow or stop at physician discretion. No need to protect diluted solution from light during administration.</p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-green-600 text-white flex items-center justify-center font-bold flex-shrink-0 text-sm">5</div>
              <div>
                <p className="font-semibold text-slate-900 mb-1">Post-infusion observation</p>
                <p><strong>Observe patient for 1 hour</strong> after infusion completion.</p>
              </div>
            </div>

            {/* Storage */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1">
              <p className="font-bold text-slate-800">Storage</p>
              <p>• Undiluted: <strong>2–8°C</strong> in original carton, protected from light</p>
              <p>• May be held at <strong>room temperature (≤25°C) for up to 3 days</strong> then returned to refrigerator</p>
              <p>• <strong>Do not freeze.</strong> Do not use beyond expiry date.</p>
              <p>• Vials are <strong>single-use</strong> — discard any unused portion</p>
              <p>• Do not mix with other medicinal products</p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Indications */}
      <Card className="bg-white border border-slate-200">
        <CardHeader className="bg-slate-50 border-b py-3 px-5">
          <CardTitle className="text-sm">Indications (Complement-mediated aHUS)</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <p className="text-xs text-slate-600 mb-3 italic">
            Soliris™ is indicated for the treatment of patients with aHUS to inhibit complement-mediated thrombotic microangiopathy.
          </p>
          <div className="space-y-2 text-sm text-slate-700">
            {[
              "Complement-mediated (atypical) HUS confirmed by CFH/CFI/CD46/C3/CFB/THBD/DGKE genetic mutation OR functional complement testing",
              "STEC-negative TMA with complement activation evidence (low C3, elevated sC5b-9)",
              "Recurrent episodes of TMA not explained by ADAMTS13 deficiency or Shiga toxin",
              "Living-donor kidney transplant in patient with previous aHUS from high-risk mutation (CFH, CFI, C3, CFB)",
              "Transplant — prophylactic/therapeutic for graft aHUS recurrence",
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
              <strong>Meningococcal vaccination is required before starting Soliris™.</strong>{" "}
              Vaccinate ≥2 weeks before starting treatment, OR give prophylactic antibiotics if treatment must begin in less than 2 weeks.
              Follow national guidelines for relevant serogroups. Monitor closely post-vaccination in aHUS — vaccination may trigger complement activation and exacerbate TMA.
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
            <p className="text-xs text-amber-800">Phenoxymethylpenicillin (Penicillin V) 250 mg BD (≥12 yrs; 125 mg BD for younger) OR Amoxicillin 250 mg BD. Continue until 2 weeks post-vaccination. Consider lifelong prophylaxis in high-risk patients.</p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-700">
            <p><strong>Other systemic infections:</strong> Administer with caution in patients with active systemic infections. Increased susceptibility to <em>Neisseria</em> species and other encapsulated bacteria.</p>
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
                  <th className="text-left px-3 py-2 font-semibold border border-slate-200">Test</th>
                  <th className="text-left px-3 py-2 font-semibold border border-slate-200">Frequency</th>
                  <th className="text-left px-3 py-2 font-semibold border border-slate-200">Clinical Note</th>
                </tr>
              </thead>
              <tbody>
                {MONITORING.map((m, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                    <td className="px-3 py-2 font-semibold text-slate-900 border border-slate-200">{m.test}</td>
                    <td className="px-3 py-2 text-slate-700 border border-slate-200">{m.frequency}</td>
                    <td className="px-3 py-2 text-slate-600 italic border border-slate-200">{m.note}</td>
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
            <p><strong>Peri-operative:</strong> Give eculizumab within 24 hours of transplant. Then maintain weekly dosing for first 3 months, then standard maintenance.</p>
            <p><strong>Post-transplant monitoring:</strong> LDH, platelets, creatinine daily for first week, then weekly for 3 months, then per maintenance schedule.</p>
            <p><strong>TMA recurrence post-transplant:</strong> Increase frequency (weekly) and check trough levels. Consider plasma exchange + eculizumab supplemental dosing.</p>
            <p><strong>Living donor:</strong> Screen donor for same complement mutations. Avoid donors with known pathogenic mutations.</p>
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
              { ref: "Soliris™ (Eculizumab) India Prescribing Information v1.0, AstraZeneca Pharma India Ltd, 15 Jan 2025. Approval ID: EM-10138", year: "2025", type: "PI" },
              { ref: "EMA Soliris (eculizumab) Summary of Product Characteristics 2024", year: "2024", type: "SmPC" },
              { ref: "Indian Journal of Nephrology 2025 — Eculizumab in Paediatric aHUS: Indian Consensus Guidance", year: "2025", type: "Guideline" },
              { ref: "Legendre CM, Licht C, Muus P, et al. Terminal complement inhibitor eculizumab in atypical hemolytic–uremic syndrome. N Engl J Med. 2013;368:2169–81", year: "2013", type: "RCT" },
              { ref: "Greenbaum LA, Fila M, Ardissino G, et al. Eculizumab is a safe and effective treatment in pediatric patients with aHUS. Kidney Int. 2016;89:701–11", year: "2016", type: "Cohort" },
              { ref: "KDIGO Controversies Conference on Atypical HUS Management. Kidney Int. 2021", year: "2021", type: "Guideline" },
              { ref: "European Working Group on Atypical HUS. Eculizumab dosing during plasma exchange. Kidney Int. 2015;88:891", year: "2015", type: "Guidance" },
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
