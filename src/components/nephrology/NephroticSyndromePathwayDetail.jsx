import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, CheckCircle, Calculator, Activity, Pill, Info, ChevronDown, ChevronUp } from "lucide-react";

// ─── First Episode Protocol (ISPN 2022) ──────────────────────────────────────
function FirstEpisodeProtocol() {
  const [weight, setWeight] = useState("");
  const [dose, setDose] = useState(null);

  const calculate = () => {
    const wt = parseFloat(weight);
    if (!wt) return;
    const bsa = Math.sqrt((wt * 110) / 3600);
    const daily_bsa_dose = Math.min(60, Math.round(bsa * 60 * 10) / 10);
    const altday_bsa_dose = Math.min(40, Math.round(bsa * 40 * 10) / 10);
    setDose({ wt, daily_bsa_dose, altday_bsa_dose });
  };

  return (
    <div className="space-y-4">
      <Alert className="bg-indigo-50 border-indigo-300 border-2">
        <Info className="w-4 h-4 text-indigo-600" />
        <AlertDescription className="text-indigo-900 text-xs">
          <strong>ISPN 2022 Protocol:</strong> Prednisolone 60 mg/m²/day (max 60 mg) × 6 weeks (daily), then 40 mg/m² on alternate days × 6 weeks, then taper. 
          <span className="text-indigo-700 font-bold"> Longer initial treatment (12 weeks) significantly reduces relapse risk vs ISKDC 8-week.</span>
        </AlertDescription>
      </Alert>

      <Card className="bg-white border border-slate-200">
        <CardHeader className="bg-slate-50 border-b py-3 px-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calculator className="w-4 h-4 text-blue-600" />
            Prednisolone Dose Calculator (BSA-based — ISPN 2022)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label className="text-xs">Weight (kg)</Label>
              <Input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="18" className="mt-1 text-sm" />
            </div>
            <div className="flex items-end">
              <Button onClick={calculate} size="sm" className="bg-indigo-600">Calculate</Button>
            </div>
          </div>

          {dose && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 space-y-2 text-xs">
              <p className="font-bold text-indigo-900">📊 ISPN Protocol for {dose.wt} kg child (BSA ≈ {(Math.sqrt((dose.wt * 110) / 3600)).toFixed(2)} m²)</p>
              {[
                ["Phase 1 — Daily × 6 weeks", `${dose.daily_bsa_dose} mg OD (60 mg/m²/day, max 60 mg)`, "Induce remission"],
                ["Phase 2 — Alt-day × 6 weeks", `${dose.altday_bsa_dose} mg EOD (40 mg/m²/alt-day, max 40 mg)`, "Consolidate remission"],
                ["Phase 3 — Taper over 4-8 wks", "Reduce by 25% every 2 weeks", "Prevent adrenal suppression"],
              ].map(([phase, d, goal]) => (
                <div key={phase} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white rounded p-2 border border-indigo-100 gap-1">
                  <span className="font-semibold text-indigo-800">{phase}</span>
                  <span className="font-bold text-indigo-900">{d}</span>
                  <span className="text-slate-500">{goal}</span>
                </div>
              ))}
              <p className="text-indigo-700 font-medium">⏱ Total: 16-20 weeks. ISPN evidence: extended initial Rx ↓ relapse risk by ~30% vs 8-week ISKDC regimen.</p>
            </div>
          )}

          <div className="mt-3">
            <p className="text-xs font-bold text-slate-700 mb-2">ISPN 2022 Prednisolone Protocol (first episode):</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead><tr className="bg-indigo-50">
                  <th className="border border-slate-300 p-1.5 text-left">Phase</th>
                  <th className="border border-slate-300 p-1.5 text-left">Duration</th>
                  <th className="border border-slate-300 p-1.5 text-left">Dose</th>
                  <th className="border border-slate-300 p-1.5 text-left">Goal</th>
                </tr></thead>
                <tbody>
                  {[
                    ["1 (Daily induction)", "6 weeks", "60 mg/m²/day (max 60 mg)", "Induce remission"],
                    ["2 (Alt-day consolidation)", "6 weeks", "40 mg/m²/alt-day (max 40 mg)", "Maintain remission"],
                    ["3 (Taper)", "4-8 weeks", "Reduce by 25% per 2 wks", "Prevent adrenal suppression"],
                  ].map(([p, d, dose, goal]) => (
                    <tr key={p}>
                      <td className="border border-slate-300 p-1.5 font-medium">{p}</td>
                      <td className="border border-slate-300 p-1.5">{d}</td>
                      <td className="border border-slate-300 p-1.5 text-indigo-700 font-medium">{dose}</td>
                      <td className="border border-slate-300 p-1.5">{goal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              <strong>ISPN vs ISKDC:</strong> ISPN recommends 6+6 weeks (BSA-based) vs ISKDC's 4+4 weeks (weight-based). 
              Meta-analyses show longer therapy significantly reduces 12-24 month relapse rates.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border border-slate-200">
        <CardHeader className="bg-slate-50 border-b py-3 px-4">
          <CardTitle className="text-sm">🩺 Monitoring at First Episode (ISPN 2022)</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid md:grid-cols-2 gap-3 text-xs">
            <div>
              <p className="font-bold text-slate-800 mb-1">Baseline (before steroids):</p>
              {[
                "FBC, U&E, LFT, albumin, cholesterol",
                "Urinalysis + microscopy + UPCR",
                "Complement C3/C4 (if atypical features)",
                "ANA (if age >10y or atypical)",
                "HBsAg, VZV/varicella serology",
                "Mantoux/IGRA (mandatory TB screen — India)",
                "Height, weight, BP (BP percentile)"
              ].map(t => <p key={t} className="text-slate-700">• {t}</p>)}
            </div>
            <div>
              <p className="font-bold text-slate-800 mb-1">During treatment:</p>
              {[
                "Daily urine dipstick (parent records at home)",
                "Weekly weight + BP (first 6 weeks)",
                "Fasting glucose at 4 weeks (steroid DM)",
                "Serum albumin at week 4 and 8",
                "BP monthly throughout"
              ].map(t => <p key={t} className="text-slate-700">• {t}</p>)}
              <p className="font-bold text-slate-800 mb-1 mt-3">Vaccinations (BEFORE steroids if possible):</p>
              {[
                "Pneumococcal (PCV13 + PPSV23) — mandatory",
                "Varicella (live — only when NOT on steroids, in remission)",
                "Influenza (annual, inactivated — safe on steroids)",
                "HBV — if not vaccinated"
              ].map(t => <p key={t} className="text-slate-700">• {t}</p>)}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-4 text-xs">
          <p className="font-bold text-amber-900 mb-2">📋 Indian Context — ISPN vs ISKDC</p>
          <div className="space-y-1 text-amber-800">
            <p>• <strong>ISPN 2022</strong> (International Study of Pediatric Nephrology): 6+6 week BSA-based protocol — preferred globally</p>
            <p>• <strong>ISKDC protocol</strong> (older, weight-based 2+1.5 mg/kg, 4+4 weeks): still widely used but has higher relapse rates</p>
            <p>• IAP/ISPN India endorses ISPN 2022 for new first-episode NS patients</p>
            <p>• TB screening (Mantoux/IGRA) before steroids is <strong>mandatory in India</strong></p>
            <p>• Nutritional assessment + catch-up nutrition important — many Indian children have pre-existing malnutrition</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Relapse Classification (ISPN 2022) ─────────────────────────────────────
function RelapseClassifier() {
  const [relapseHistory, setRelapseHistory] = useState({ relapses6mo: "", relapses12mo: "", sdns: false, srns: false });
  const [classification, setClassification] = useState(null);

  const classify = () => {
    const r6 = parseInt(relapseHistory.relapses6mo) || 0;
    const r12 = parseInt(relapseHistory.relapses12mo) || 0;

    let result = { type: "", abbr: "", color: "green", treatment: [], monitoring: [] };

    if (relapseHistory.srns) {
      result = {
        type: "Steroid-Resistant Nephrotic Syndrome",
        abbr: "SRNS",
        color: "red",
        treatment: [
          "Kidney biopsy mandatory (MCD vs FSGS vs genetic)",
          "Genetic panel: NPHS1, NPHS2, WT1, ACTN4, TRPC6, COL4A3-5",
          "Calcineurin inhibitor: Tacrolimus 0.1-0.15 mg/kg/day (trough 5-10 ng/mL) × 6-12 months",
          "OR Cyclosporine 3-5 mg/kg/day (trough 80-120 ng/mL)",
          "Add MMF 300-600 mg/m²/dose BID if CNI partial response",
          "ACEi/ARB: mandatory to reduce proteinuria",
          "Rituximab: for primary SRNS failing CNI (limited evidence)"
        ],
        monitoring: ["UPCR monthly", "CNI drug levels weekly until stable, then monthly", "eGFR, LFT 3-monthly", "BP monthly", "Genetic result guides long-term plan"]
      };
    } else if (relapseHistory.sdns) {
      result = {
        type: "Steroid-Dependent Nephrotic Syndrome",
        abbr: "SDNS",
        color: "red",
        treatment: [
          "ISPN first-line: Levamisole 2.5 mg/kg alt-day × 12-24 months (cheap, effective, IAP endorsed)",
          "Option 2: MMF 300-600 mg/m²/dose BID (well tolerated, GI side effects)",
          "Option 3: Cyclosporine 3-5 mg/kg/day — TDM mandatory (trough 80-120 ng/mL)",
          "Option 4: Tacrolimus 0.1-0.15 mg/kg/day — TDM (trough 4-8 ng/mL)",
          "Option 5: Rituximab 375 mg/m² IV × 1-4 doses — for CNI-dependent SDNS",
          "Option 6: Mycophenolate + low-dose CNI combination",
          "Minimize prednisolone to lowest effective dose while on steroid-sparing agent"
        ],
        monitoring: ["UPCR monthly", "Drug levels (CNI/Tacrolimus) 1-2x/week initially", "FBC + LFT 3-monthly (levamisole: FBC — neutropenia risk)", "Lipids, Glucose, eGFR 6-monthly", "Growth velocity 6-monthly", "BP monthly"]
      };
    } else if (r6 >= 2 || r12 >= 4) {
      result = {
        type: "Frequently Relapsing Nephrotic Syndrome",
        abbr: "FRNS",
        color: "amber",
        treatment: [
          "Treat each relapse: Prednisolone 2 mg/kg/day (or 60 mg/m²/day) until 3 negative dipsticks, then 40 mg/m² alt-day × 4 weeks, taper",
          "ISPN: Start steroid-sparing if ≥3 relapses OR significant steroid toxicity",
          "First-line steroid-sparing: Levamisole 2.5 mg/kg alt-day (cheapest, Indian first-line, IAP endorsed)",
          "If 4+ relapses: Cyclophosphamide 2-3 mg/kg/day × 8-12 weeks (check WBC, cumulative dose)",
          "MMF or CNI if cyclophosphamide fails or cumulative dose limit reached",
          "Ensure full vaccination between relapses (pneumococcal + varicella)"
        ],
        monitoring: ["Daily home urine dipstick", "BP weekly during relapse, monthly in remission", "UPCR monthly on steroid-sparing", "FBC 3-monthly (levamisole: neutropenia)", "Annual: growth, lipids, DEXA if high steroid burden"]
      };
    } else {
      result = {
        type: "Infrequently Relapsing Nephrotic Syndrome",
        abbr: "IRNS",
        color: "blue",
        treatment: [
          "Treat each relapse: Prednisolone 2 mg/kg/day until 3 consecutive negative dipsticks",
          "Then: 40 mg/m²/alt-day × 4 weeks, then taper over 4 weeks",
          "No steroid-sparing agent needed at this stage",
          "Educate family thoroughly on daily dipstick monitoring",
          "Ensure all vaccinations up to date in remission",
          "Monitor for infection triggers of relapse (especially URTI)"
        ],
        monitoring: ["Daily home urine dipstick", "Weight + BP monthly", "Annual review: height, lipids, BP, urine"]
      };
    }
    setClassification(result);
  };

  const classColors = { red: "border-red-300 bg-red-50", amber: "border-amber-300 bg-amber-50", blue: "border-blue-300 bg-blue-50" };
  const textColors = { red: "text-red-900", amber: "text-amber-900", blue: "text-blue-900" };

  return (
    <div className="space-y-4">
      <Card className="bg-white border border-slate-200">
        <CardHeader className="bg-slate-50 border-b py-3 px-4">
          <CardTitle className="text-sm">NS Relapse Classification Tool (ISPN 2022)</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Relapses in last 6 months</Label>
              <Input type="number" min="0" max="10" value={relapseHistory.relapses6mo}
                onChange={e => setRelapseHistory(p => ({ ...p, relapses6mo: e.target.value }))} className="mt-1 text-sm" />
            </div>
            <div>
              <Label className="text-xs">Relapses in last 12 months</Label>
              <Input type="number" min="0" max="20" value={relapseHistory.relapses12mo}
                onChange={e => setRelapseHistory(p => ({ ...p, relapses12mo: e.target.value }))} className="mt-1 text-sm" />
            </div>
          </div>
          <div className="space-y-2 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={relapseHistory.sdns}
                onChange={e => setRelapseHistory(p => ({ ...p, sdns: e.target.checked }))} />
              Relapses during steroid taper OR within 2 weeks of stopping steroids (SDNS)
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={relapseHistory.srns}
                onChange={e => setRelapseHistory(p => ({ ...p, srns: e.target.checked }))} />
              No remission after 4 weeks of daily prednisolone (SRNS)
            </label>
          </div>
          <Button onClick={classify} size="sm" className="bg-indigo-600 hover:bg-indigo-700 w-full">Classify & Get Protocol</Button>
        </CardContent>
      </Card>

      {classification && (
        <Card className={`border-2 ${classColors[classification.color] || "border-slate-200"}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Badge className={`text-base px-3 py-1 ${classification.color === 'red' ? 'bg-red-600' : classification.color === 'amber' ? 'bg-amber-600' : 'bg-blue-600'} text-white`}>
                {classification.abbr}
              </Badge>
              <p className={`font-bold ${textColors[classification.color]}`}>{classification.type}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-xs">
              <div>
                <p className="font-bold text-slate-900 mb-2">🏥 ISPN 2022 Treatment Strategy</p>
                {classification.treatment.map((t, i) => (
                  <div key={i} className="flex items-start gap-2 mb-1.5">
                    <span className="text-indigo-600 font-bold flex-shrink-0">{i + 1}.</span>
                    <span className="text-slate-700">{t}</span>
                  </div>
                ))}
              </div>
              <div>
                <p className="font-bold text-slate-900 mb-2">📊 Monitoring Plan</p>
                {classification.monitoring.map((m, i) => (
                  <div key={i} className="flex items-start gap-2 mb-1.5">
                    <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700">{m}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-white border border-slate-200">
        <CardContent className="p-4">
          <p className="text-xs font-bold text-slate-900 mb-3">📋 ISPN 2022 Definitions</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead><tr className="bg-slate-100">
                <th className="border border-slate-300 p-1.5 text-left">Term</th>
                <th className="border border-slate-300 p-1.5 text-left">ISPN 2022 Definition</th>
              </tr></thead>
              <tbody>
                {[
                  ["Remission", "Urine dipstick Nil/Trace × 3 consecutive days OR UPCR <0.2 mg/mg"],
                  ["Relapse", "Dipstick ≥2+ × 3 consecutive days after remission OR UPCR ≥2.0 mg/mg (with return of symptoms)"],
                  ["FRNS", "≥2 relapses within 6 months of initial response OR ≥4 relapses within any 12-month period"],
                  ["SDNS", "Relapses during steroid taper OR within 2 weeks of stopping steroids (≥2 episodes)"],
                  ["SRNS", "No complete remission after 4-6 weeks of daily prednisolone (60 mg/m²/day)"],
                  ["Late SRNS", "SRNS after initial steroid-sensitivity — biopsy mandatory"],
                ].map(([term, def]) => (
                  <tr key={term}>
                    <td className="border border-slate-300 p-1.5 font-medium text-indigo-800">{term}</td>
                    <td className="border border-slate-300 p-1.5 text-slate-700">{def}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Steroid Toxicity Monitor ─────────────────────────────────────────────────
function SteroidToxicityMonitor() {
  const TOXICITIES = [
    { system: "Growth", effects: ["Short stature (GH suppression)", "Bone age delay", "Reduced growth velocity (<5 cm/year)", "Pubertal delay"], monitoring: "Height velocity 6-monthly, bone age X-ray annually, IGF-1 if growth failure", threshold: "Cumulative dose >150 mg/kg/year or daily steroids >6 months" },
    { system: "Metabolic", effects: ["Hyperglycaemia / Steroid DM (HbA1c, fasting glucose)", "Cushingoid habitus", "Hyperlipidaemia (cholesterol, TG)", "Weight gain / central obesity"], monitoring: "Fasting glucose 3-monthly, lipid profile 6-monthly, BP monthly, weight monthly", threshold: "Any dose >2 weeks" },
    { system: "Bone", effects: ["Osteopenia / osteoporosis", "Vertebral compression fractures (pain)", "Avascular necrosis (hip — limp)"], monitoring: "DEXA scan if on steroids >3 months or cumulative >1000 mg. Calcium 500-1000 mg/day + Vit D 1000 IU/day.", threshold: "Cumulative prednisolone >1000 mg" },
    { system: "Adrenal", effects: ["Adrenal suppression", "Adrenal crisis on illness/surgery", "Low morning cortisol"], monitoring: "NEVER stop abruptly. Sick day rules: double dose if fever/illness. Morning cortisol if symptomatic.", threshold: "Daily steroids > 2 weeks (at any dose)" },
    { system: "Infection", effects: ["↑ bacterial infection risk (pneumococcal, sepsis)", "Disseminated varicella (life-threatening)", "PCP pneumonia (if high-dose + immunosuppressant)", "Strongyloides dissemination (tropical settings)"], monitoring: "VZV IgG. No live vaccines. Cotrimoxazole prophylaxis if high-dose + IS. Ivermectin if endemic area.", threshold: "Prednisolone >20 mg/day for >4 weeks" },
    { system: "Ophthalmology", effects: ["Posterior subcapsular cataract", "Glaucoma (↑ IOP)", "Papilloedema (pseudotumour cerebri — rare)"], monitoring: "Annual slit-lamp + IOP check for all chronic steroid patients", threshold: "Any prolonged course >3 months" },
    { system: "Behavioural/Neurological", effects: ["Mood swings, emotional lability", "Insomnia, hyperactivity", "Cognitive impact in prolonged use", "Rare: steroid psychosis at high doses"], monitoring: "Parent questionnaire, teacher assessment, sleep diary. Consider melatonin for insomnia.", threshold: "High-dose induction phase (>2 mg/kg/day)" },
  ];

  return (
    <div className="space-y-3">
      <Alert className="bg-amber-50 border-amber-300 border-2">
        <AlertTriangle className="w-4 h-4 text-amber-600" />
        <AlertDescription className="text-amber-900 text-xs">
          <strong>Steroid toxicity monitoring is mandatory</strong> for all children on chronic/repeated steroid courses. Document cumulative dose at every visit. Minimise steroid exposure with early steroid-sparing therapy.
        </AlertDescription>
      </Alert>

      {TOXICITIES.map(({ system, effects, monitoring, threshold }) => (
        <Card key={system} className="bg-white border border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Activity className="w-5 h-5 text-amber-700" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-900 text-sm mb-1">{system} Toxicity</p>
                <div className="grid md:grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="font-semibold text-red-700 mb-1">Adverse Effects:</p>
                    {effects.map(e => <p key={e} className="text-slate-700">• {e}</p>)}
                  </div>
                  <div>
                    <p className="font-semibold text-blue-700 mb-1">Monitoring:</p>
                    <p className="text-slate-700">{monitoring}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-amber-700 mb-1">Risk Threshold:</p>
                    <p className="text-slate-700">{threshold}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Card className="bg-indigo-50 border-indigo-200 border-2">
        <CardContent className="p-4 text-xs">
          <p className="font-bold text-indigo-900 mb-2">💊 Steroid-Protective Adjuncts (ISPN Recommended)</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              ["Calcium", "500-1000 mg/day elemental Ca (diet + supplement)"],
              ["Vitamin D", "1000-2000 IU/day cholecalciferol"],
              ["BP monitoring", "Monthly — ACEi if persistent hypertension"],
              ["Lifestyle", "Low salt, low sugar, high protein, exercise"],
              ["Vaccinations", "Pneumococcal + influenza annually"],
              ["DEXA scan", "If on steroids >3 months cumulative"],
            ].map(([k, v]) => (
              <div key={k} className="bg-white rounded p-2 border border-indigo-100">
                <strong className="text-indigo-800">{k}:</strong> <span className="text-indigo-700">{v}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Steroid-Sparing Drugs ────────────────────────────────────────────────────
function SteroidSparingDrugs() {
  const [expanded, setExpanded] = useState({});
  const toggle = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  const DRUGS = [
    {
      id: "levamisole",
      name: "Levamisole",
      class: "Immunomodulator",
      badge: "First-line (IAP/ISPN India)",
      badgeColor: "bg-green-600",
      indication: "FRNS, SDNS — first-line steroid-sparing in India (cheapest, well-tolerated)",
      dose: "2.5 mg/kg on alternate days (max 150 mg/dose)",
      duration: "12-24 months (can extend if well-tolerated)",
      mechanism: "Immunomodulatory — restores T-cell balance; enhances Th1 response",
      sideEffects: [
        "Neutropenia (FBC monitoring mandatory — stop if ANC <1000/mm³)",
        "Agranulocytosis (rare but serious — check FBC monthly)",
        "Hepatotoxicity (LFT 3-monthly)",
        "GI upset, nausea (mild)",
        "Vasculitis-like skin reaction (rare — discontinue if occurs)"
      ],
      monitoring: "FBC + LFT monthly × 3, then 3-monthly. UPCR monthly. Growth 6-monthly.",
      cost: "Very low — ~₹5-10/tablet (generic available in India)",
      pearls: ["ISPN: first-line for FRNS/SDNS in resource-limited settings", "Can maintain steroid-free remission in 50-60% of FRNS patients", "Must continue for ≥12 months — premature discontinuation risks relapse", "IAP guidelines strongly endorse for Indian pediatric practice"]
    },
    {
      id: "mmf",
      name: "Mycophenolate Mofetil (MMF)",
      class: "Antiproliferative IS",
      badge: "Second-line FRNS/SDNS",
      badgeColor: "bg-blue-600",
      indication: "FRNS, SDNS — especially when levamisole fails or steroid toxicity is significant",
      dose: "300-600 mg/m²/dose BID (max 1000 mg/dose, total max 2 g/day)",
      duration: "12-24 months; can continue longer if well-tolerated",
      mechanism: "Inhibits IMPDH enzyme → blocks de novo purine synthesis → antiproliferative on T and B lymphocytes",
      sideEffects: [
        "GI — nausea, vomiting, diarrhoea (dose-dependent, reduce dose)",
        "Bone marrow suppression — leukopenia, anaemia (FBC monitoring)",
        "Opportunistic infections (PCP — consider cotrimoxazole prophylaxis)",
        "Teratogenic — contraception counselling in adolescent females",
        "Rarely: progressive multifocal leukoencephalopathy (PML)"
      ],
      monitoring: "FBC + LFT monthly × 3, then 3-monthly. UPCR monthly. HBV/HCV status before starting.",
      cost: "Moderate — ₹20-50/tablet. Biosimilar/generic (Mycophenolate acid — Myfortic) available.",
      pearls: ["Well tolerated compared to CNI and cyclophosphamide", "Does NOT require TDM (unlike CNI)", "Effective in 50-70% of FRNS/SDNS", "Enteric-coated formulation (Mycophenolic acid) reduces GI side effects"]
    },
    {
      id: "cyclosporine",
      name: "Cyclosporine (CSA)",
      class: "Calcineurin Inhibitor (CNI)",
      badge: "SDNS / SRNS",
      badgeColor: "bg-purple-600",
      indication: "SDNS, FRNS not responding to levamisole/MMF; early SRNS",
      dose: "3-5 mg/kg/day in 2 divided doses. Start low (2 mg/kg/day), titrate to trough.",
      duration: "12-24 months (assess nephrotoxicity — biopsy if >2 years)",
      mechanism: "Inhibits calcineurin → blocks IL-2 → T-cell suppression. Also direct podocyte stabilisation.",
      sideEffects: [
        "Nephrotoxicity — dose-dependent, chronic interstitial fibrosis (TDM essential)",
        "Hypertension — treat with amlodipine",
        "Gingival hyperplasia — dental hygiene important",
        "Hypertrichosis (cosmetically distressing in girls)",
        "Dyslipidaemia — monitor lipid profile",
        "Tremor, headache (neurological side effects)"
      ],
      monitoring: "Trough level (C0): 80-120 ng/mL. Serum creatinine monthly. BP monthly. Lipids 6-monthly. Biopsy after 2 years if continuing.",
      cost: "High — ₹100-300/tablet. Neoral (modified release) preferred over Sandimmune.",
      pearls: ["TDM is MANDATORY for all CNI therapy", "Switch to Neoral (modified release) formulation — better bioavailability", "Grapefruit juice increases CSA levels — avoid", "Biopsy after 2 years: CSA nephrotoxicity can be silent", "Amlodipine for HTN — not diltiazem/verapamil (increase CSA levels via CYP3A4)"]
    },
    {
      id: "tacrolimus",
      name: "Tacrolimus (TAC)",
      class: "Calcineurin Inhibitor (CNI)",
      badge: "SDNS / SRNS",
      badgeColor: "bg-purple-700",
      indication: "SDNS, SRNS — especially when CSA fails or CSA side effects are unacceptable",
      dose: "0.1-0.15 mg/kg/day in 2 divided doses. Start 0.05-0.1 mg/kg/day, titrate.",
      duration: "12-24 months (reassess nephrotoxicity)",
      mechanism: "Binds FKBP12 → inhibits calcineurin → blocks IL-2 → T-cell suppression. ~10× more potent than CSA.",
      sideEffects: [
        "Nephrotoxicity (similar to CSA — TDM essential)",
        "Hyperglycaemia / New-onset DM (more than CSA)",
        "Neurotoxicity — tremor, headache, paraesthesia",
        "Alopecia (cosmetically distressing)",
        "Hypertension (less than CSA)",
        "GI effects — nausea, diarrhoea"
      ],
      monitoring: "Trough level (C0): 4-8 ng/mL (SRNS: up to 10 ng/mL). Fasting glucose monthly. Serum Cr monthly. BP monthly.",
      cost: "Very high — ₹200-500/tablet. Generic Tacrolimus (Pangraf, Tacrograf) available in India.",
      pearls: ["Preferred over CSA: less hirsutism/gingival hyperplasia (better cosmetic profile)", "Higher DM risk — monitor glucose closely, especially in obese/family history DM", "Avoid grapefruit; many drug interactions via CYP3A4 (antifungals, macrolides increase levels)", "SRNS: TAC + steroid gives ~50-60% complete/partial remission in primary FSGS"]
    },
    {
      id: "cyclophosphamide",
      name: "Cyclophosphamide (CYC)",
      class: "Alkylating Agent",
      badge: "FRNS — short course",
      badgeColor: "bg-orange-600",
      indication: "FRNS with significant steroid toxicity; after levamisole failure. NOT for SDNS alone.",
      dose: "2-3 mg/kg/day orally × 8-12 weeks (cumulative dose limit: 168-200 mg/kg total)",
      duration: "SINGLE COURSE ONLY (usually 8-12 weeks). Second course rarely justified.",
      mechanism: "Alkylating agent — causes DNA crosslinks → kills rapidly dividing lymphocytes → immunosuppression",
      sideEffects: [
        "Haemorrhagic cystitis — HYDRATION essential (2 L/m²/day oral fluids, mesna IV if IV pulse)",
        "Bone marrow suppression — neutropenia, thrombocytopenia (FBC weekly)",
        "Gonadotoxicity — IRREVERSIBLE infertility at high cumulative doses (counsel family)",
        "Alopecia (reversible)",
        "Nausea/vomiting (antiemetics required)",
        "Increased infection risk (withhold if ANC <1500/mm³)",
        "Bladder malignancy (long-term risk with high cumulative doses)"
      ],
      monitoring: "FBC weekly during treatment. Urinalysis for blood — hold if haematuria. Total cumulative dose ≤200 mg/kg (lifetime limit). Growth monitoring.",
      cost: "Low — ₹2-10/tablet (generic available).",
      pearls: ["SINGLE 8-12 week course — repeat courses increase toxicity and are rarely needed", "Cumulative dose limit: 168-200 mg/kg TOTAL — do not exceed", "Oral hydration: 2 L/m²/day or more — prevents cystitis", "Withhold if ANC <1500 or WBC <3000", "Gonadotoxicity risk: discuss banking options for adolescents", "NOT recommended for SDNS alone — use CNI/MMF instead"]
    },
    {
      id: "rituximab",
      name: "Rituximab (RTX)",
      class: "Anti-CD20 Monoclonal Antibody",
      badge: "Refractory SDNS / SRNS",
      badgeColor: "bg-red-600",
      indication: "CNI-dependent SDNS, refractory FRNS/SDNS, primary SRNS (off-label)",
      dose: "375 mg/m²/dose IV (max 500 mg/dose) × 1-4 doses (weekly × 4 OR × 1-2 doses)",
      duration: "Single course; repeat in 6-12 months if needed (CD19 count to guide redosing)",
      mechanism: "Depletes CD20+ B cells → reduces B-cell-mediated dysregulation of T-cell podocyte crosstalk",
      sideEffects: [
        "Infusion reactions (premedicate: paracetamol + IV chlorpheniramine + prednisolone)",
        "Hypogammaglobulinaemia (check IgG before and after — replace if <400 mg/dL)",
        "Serious infections (bacterial, PCP, HBV reactivation — screen before use)",
        "PML (progressive multifocal leukoencephalopathy — rare but fatal)",
        "Late-onset neutropenia (check FBC 4-6 weeks post-infusion)",
        "Do NOT give live vaccines for 12 months post-Rituximab"
      ],
      monitoring: "CD19/20 count (target <1% for B-cell depletion). IgG 3-monthly. FBC monthly. HBV serology before. Annual serum immunoglobulins.",
      cost: "Very high — ₹20,000-40,000/vial. Biosimilar Rituximab (Ristova, Mabtas) available India at lower cost (~₹8,000-15,000).",
      pearls: ["Pre-treat with paracetamol + antihistamine + prednisolone 30 min before infusion", "Check IgG level before each course — hold if severe hypogammaglobulinaemia", "HBV screening mandatory — reactivation can be fatal", "Biosimilar rituximab (Ristova) available in India — comparable efficacy, lower cost", "CD19 monitoring: redose when CD19 returns >1% (usually 6-12 months)", "ISPN: effective for CNI-dependent SDNS — 60-70% can achieve steroid-free remission"]
    },
  ];

  return (
    <div className="space-y-3">
      <Alert className="bg-purple-50 border-purple-200">
        <Pill className="w-4 h-4 text-purple-600" />
        <AlertDescription className="text-purple-900 text-xs">
          <strong>Steroid-Sparing Agents (ISPN 2022):</strong> Indicated for FRNS, SDNS, or significant steroid toxicity. Choice depends on disease severity, cost, and availability.
          Indian first-line: <strong>Levamisole</strong> (cheap, effective). Escalate to MMF → CNI → Rituximab as needed.
        </AlertDescription>
      </Alert>

      {/* Quick comparison table */}
      <Card className="bg-white border border-slate-200">
        <CardHeader className="bg-slate-50 border-b py-2 px-4">
          <CardTitle className="text-xs font-bold text-slate-700">Quick Comparison — Steroid-Sparing Drugs</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead><tr className="bg-slate-100">
                <th className="border border-slate-200 p-1.5 text-left">Drug</th>
                <th className="border border-slate-200 p-1.5 text-left">Indication</th>
                <th className="border border-slate-200 p-1.5 text-left">Key Monitoring</th>
                <th className="border border-slate-200 p-1.5 text-left">Cost (India)</th>
              </tr></thead>
              <tbody>
                {[
                  ["Levamisole", "FRNS, SDNS (1st line)", "FBC monthly (neutropenia)", "Very Low ₹"],
                  ["MMF", "FRNS, SDNS (2nd line)", "FBC, LFT 3-monthly", "Moderate ₹₹"],
                  ["Cyclosporine", "SDNS, SRNS", "Trough 80-120 ng/mL, Cr", "High ₹₹₹"],
                  ["Tacrolimus", "SDNS, SRNS", "Trough 4-8 ng/mL, Glucose", "Very High ₹₹₹₹"],
                  ["Cyclophosphamide", "FRNS (single course)", "FBC weekly, urine", "Low ₹"],
                  ["Rituximab", "Refractory SDNS/SRNS", "CD19, IgG, HBV, FBC", "Very High ₹₹₹₹₹"],
                ].map(([drug, ind, mon, cost]) => (
                  <tr key={drug} className="hover:bg-slate-50">
                    <td className="border border-slate-200 p-1.5 font-medium text-purple-800">{drug}</td>
                    <td className="border border-slate-200 p-1.5">{ind}</td>
                    <td className="border border-slate-200 p-1.5">{mon}</td>
                    <td className="border border-slate-200 p-1.5">{cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Detailed drug cards */}
      {DRUGS.map(drug => (
        <Card key={drug.id} className="bg-white border border-slate-200">
          <CardHeader
            className="py-3 px-4 cursor-pointer hover:bg-slate-50"
            onClick={() => toggle(drug.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <Pill className="w-4 h-4 text-purple-600 flex-shrink-0" />
                <span className="font-bold text-slate-900 text-sm">{drug.name}</span>
                <Badge className={`text-xs text-white ${drug.badgeColor}`}>{drug.badge}</Badge>
                <Badge variant="outline" className="text-xs">{drug.class}</Badge>
              </div>
              {expanded[drug.id] ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </div>
            {!expanded[drug.id] && (
              <p className="text-xs text-slate-500 mt-1">{drug.indication}</p>
            )}
          </CardHeader>

          {expanded[drug.id] && (
            <CardContent className="px-4 pb-4 space-y-3">
              <div className="grid md:grid-cols-2 gap-3">
                <div className="bg-blue-50 rounded-lg p-3 space-y-1.5 text-xs">
                  <p className="font-bold text-blue-900">📋 Indication</p>
                  <p className="text-blue-800">{drug.indication}</p>
                  <p className="font-bold text-blue-900 mt-2">💊 Dose</p>
                  <p className="text-blue-800 font-medium">{drug.dose}</p>
                  <p className="text-blue-700">Duration: {drug.duration}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 space-y-1.5 text-xs">
                  <p className="font-bold text-slate-800">⚙️ Mechanism</p>
                  <p className="text-slate-700">{drug.mechanism}</p>
                  <p className="font-bold text-slate-800 mt-2">💰 Cost (India)</p>
                  <p className="text-slate-700">{drug.cost}</p>
                </div>
              </div>

              <div className="bg-red-50 rounded-lg p-3 text-xs">
                <p className="font-bold text-red-900 mb-1.5">⚠️ Side Effects</p>
                {drug.sideEffects.map((se, i) => (
                  <p key={i} className="text-red-800">• {se}</p>
                ))}
              </div>

              <div className="bg-amber-50 rounded-lg p-3 text-xs">
                <p className="font-bold text-amber-900 mb-1.5">📊 Monitoring Protocol</p>
                <p className="text-amber-800">{drug.monitoring}</p>
              </div>

              <div className="bg-green-50 rounded-lg p-3 text-xs">
                <p className="font-bold text-green-900 mb-1.5">💡 Clinical Pearls</p>
                {drug.pearls.map((p, i) => (
                  <p key={i} className="text-green-800">• {p}</p>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────
export default function NephroticSyndromePathwayDetail({ defaultTab }) {
  return (
    <div className="space-y-4">
      <Tabs defaultValue={defaultTab === "sparing" ? "sparing" : "first-episode"}>
        <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-slate-100 p-1">
          <TabsTrigger value="first-episode" className="text-xs flex-1">🩺 First Episode</TabsTrigger>
          <TabsTrigger value="relapse" className="text-xs flex-1">🔁 Relapse Classifier</TabsTrigger>
          <TabsTrigger value="toxicity" className="text-xs flex-1">⚠️ Steroid Toxicity</TabsTrigger>
          <TabsTrigger value="sparing" className="text-xs flex-1">💊 Steroid-Sparing Drugs</TabsTrigger>
        </TabsList>
        <TabsContent value="first-episode" className="mt-3"><FirstEpisodeProtocol /></TabsContent>
        <TabsContent value="relapse" className="mt-3"><RelapseClassifier /></TabsContent>
        <TabsContent value="toxicity" className="mt-3"><SteroidToxicityMonitor /></TabsContent>
        <TabsContent value="sparing" className="mt-3"><SteroidSparingDrugs /></TabsContent>
      </Tabs>
    </div>
  );
}