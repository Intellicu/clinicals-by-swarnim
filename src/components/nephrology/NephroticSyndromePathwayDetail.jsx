import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Calculator, Pill, Activity } from "lucide-react";

// ─── First Episode Protocol ───────────────────────────────────────────────────
function FirstEpisodeProtocol() {
  const [weight, setWeight] = useState("");
  const [dose, setDose] = useState(null);

  const calculate = () => {
    const wt = parseFloat(weight);
    if (!wt) return;
    const mg_kg = Math.min(60, Math.round(wt * 2 * 10) / 10);
    const mg_m2 = Math.min(60, Math.round((Math.sqrt((wt * 110) / 3600)) * 60 * 10) / 10);
    setDose({ wt, mg_kg, altDose: mg_m2 });
  };

  return (
    <div className="space-y-4">
      <Alert className="bg-blue-50 border-blue-200">
        <CheckCircle className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-blue-900 text-xs">
          <strong>ISKDC / IPNA 2021 Protocol:</strong> Prednisolone 2 mg/kg/day (max 60 mg) × 4 weeks (daily), then 1.5 mg/kg alternate days × 4 weeks, then taper.
        </AlertDescription>
      </Alert>

      <Card className="bg-white border border-slate-200">
        <CardHeader className="bg-slate-50 border-b py-3 px-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calculator className="w-4 h-4 text-blue-600" />
            Prednisolone Dose Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label className="text-xs">Weight (kg)</Label>
              <Input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="18" className="mt-1 text-sm" />
            </div>
            <div className="flex items-end">
              <Button onClick={calculate} size="sm" className="bg-blue-600">Calculate</Button>
            </div>
          </div>

          {dose && (
            <div className="space-y-2 text-sm">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="font-bold text-blue-900 text-xs mb-2">📊 ISKDC Protocol for {dose.wt} kg child</p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center bg-white rounded p-2 border border-blue-100">
                    <span className="font-semibold text-blue-800">Phase 1 (Daily × 4 wks)</span>
                    <span className="font-bold text-blue-900">{dose.mg_kg} mg OD</span>
                  </div>
                  <div className="flex justify-between items-center bg-white rounded p-2 border border-blue-100">
                    <span className="font-semibold text-blue-800">Phase 2 (Alt-day × 4 wks)</span>
                    <span className="font-bold text-blue-900">{Math.min(40, Math.round(dose.wt * 1.5))} mg EOD</span>
                  </div>
                  <div className="flex justify-between items-center bg-white rounded p-2 border border-blue-100">
                    <span className="font-semibold text-blue-800">Taper (weeks 9-12)</span>
                    <span className="font-bold text-blue-900">Reduce by 0.5 mg/kg/2 wks</span>
                  </div>
                  <p className="text-blue-700 text-xs">Total duration: 12 weeks (minimum). Longer taper reduces relapse risk.</p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-3">
            <p className="text-xs font-bold text-slate-700 mb-2">ISKDC Prednisolone Protocol (all patients):</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead><tr className="bg-slate-100">
                  <th className="border border-slate-300 p-1.5">Phase</th>
                  <th className="border border-slate-300 p-1.5">Duration</th>
                  <th className="border border-slate-300 p-1.5">Dose</th>
                  <th className="border border-slate-300 p-1.5">Goal</th>
                </tr></thead>
                <tbody>
                  {[
                    ["1 (Induction)", "4 weeks", "2 mg/kg/day (max 60 mg)", "Induce remission"],
                    ["2 (Consolidation)", "4 weeks", "1.5 mg/kg alternate days", "Maintain remission"],
                    ["3 (Taper)", "4 weeks", "Reduce by 25% per 2 wks", "Prevent adrenal suppression"],
                  ].map(([p, d, dose, goal]) => (
                    <tr key={p}><td className="border border-slate-300 p-1.5">{p}</td>
                      <td className="border border-slate-300 p-1.5">{d}</td>
                      <td className="border border-slate-300 p-1.5 text-blue-700 font-medium">{dose}</td>
                      <td className="border border-slate-300 p-1.5">{goal}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border border-slate-200">
        <CardHeader className="bg-slate-50 border-b py-3 px-4">
          <CardTitle className="text-sm">🩺 Monitoring at First Episode</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid md:grid-cols-2 gap-3 text-xs">
            <div>
              <p className="font-bold text-slate-800 mb-1">Baseline (before steroids):</p>
              {["FBC, U&E, LFT, albumin", "Urinalysis + microscopy + UPCR", "Complement C3/C4, ANA (if ≥10y or atypical)", "HBsAg, VZV/varicella serology", "Mantoux/IGRA (TB screen)", "Height, weight, BP"].map(t => (
                <p key={t} className="text-slate-700">• {t}</p>
              ))}
            </div>
            <div>
              <p className="font-bold text-slate-800 mb-1">During treatment (weekly × 4 weeks):</p>
              {["Daily urine dipstick (parent records)", "Weekly weight + BP", "Glucose (steroid-induced DM)", "Albumin at week 4"].map(t => (
                <p key={t} className="text-slate-700">• {t}</p>
              ))}
              <p className="font-bold text-slate-800 mb-1 mt-3">Vaccinations (BEFORE steroids if possible):</p>
              {["Pneumococcal (PCV13 + PPSV23)", "Varicella (live — only when NOT on steroids)", "Influenza (annual, inactivated)"].map(t => (
                <p key={t} className="text-slate-700">• {t}</p>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Relapse Classification ───────────────────────────────────────────────────
function RelapseClassifier() {
  const [relapseHistory, setRelapseHistory] = useState({ relapses6mo: "", relapses12mo: "", sdns: false, onSteroids: false });
  const [classification, setClassification] = useState(null);

  const classify = () => {
    const r6 = parseInt(relapseHistory.relapses6mo) || 0;
    const r12 = parseInt(relapseHistory.relapses12mo) || 0;
    const sdns = relapseHistory.sdns;

    let result = { type: "", abbr: "", color: "green", treatment: [], monitoring: [] };

    if (sdns || relapseHistory.onSteroids) {
      result = {
        type: "Steroid-Dependent Nephrotic Syndrome",
        abbr: "SDNS",
        color: "red",
        treatment: [
          "Steroid-sparing agent — initiate promptly",
          "Option 1: Levamisole 2.5 mg/kg alt-day × 12-24 months (cheap, Indian first-line)",
          "Option 2: Mycophenolate mofetil (MMF) 300-600 mg/m²/dose BID",
          "Option 3: Cyclosporine 3-5 mg/kg/day (TDM: trough 80-120 ng/mL)",
          "Option 4: Tacrolimus 0.1-0.15 mg/kg/day (TDM: trough 4-8 ng/mL)",
          "Option 5: Rituximab 375 mg/m² IV × 1-4 doses (after CNI failure)"
        ],
        monitoring: ["UPCR monthly", "Drug levels (CNI/Tacrolimus)", "Lipids, Glucose, eGFR", "Growth velocity 6-monthly"]
      };
    } else if (r6 >= 2 || r12 >= 4) {
      result = {
        type: "Frequently Relapsing Nephrotic Syndrome",
        abbr: "FRNS",
        color: "amber",
        treatment: [
          "TREAT relapse: Prednisolone 2 mg/kg/day until remission, then 1.5 mg/kg alt-day × 4 weeks",
          "Steroid-sparing agent if ≥3 relapses: Levamisole (first-line, cheap)",
          "Consider Cyclophosphamide if 4+ relapses: 2-3 mg/kg/day × 8-12 weeks",
          "MMF or CNI if cyclophosphamide fails",
          "Ensure full vaccination (pneumococcal, varicella in remission)"
        ],
        monitoring: ["Daily home dipstick", "BP weekly", "UPCR monthly in steroid-sparing phase", "LFT/FBC 3-monthly on levamisole"]
      };
    } else {
      result = {
        type: "Infrequently Relapsing Nephrotic Syndrome",
        abbr: "IRNS",
        color: "blue",
        treatment: [
          "TREAT each relapse: Prednisolone 2 mg/kg/day until 3 consecutive negative dipsticks, then taper",
          "No steroid-sparing agent needed at this stage",
          "Educate family on daily dipstick monitoring",
          "Ensure vaccinations up to date during remission"
        ],
        monitoring: ["Daily home urine dipstick", "Weight + BP monthly", "Annual review: height, lipids, BP, urine"]
      };
    }

    setClassification(result);
  };

  const classColors = { red: "border-red-300 bg-red-50", amber: "border-amber-300 bg-amber-50", green: "border-green-300 bg-green-50", blue: "border-blue-300 bg-blue-50" };
  const textColors = { red: "text-red-900", amber: "text-amber-900", green: "text-green-900", blue: "text-blue-900" };

  return (
    <div className="space-y-4">
      <Card className="bg-white border border-slate-200">
        <CardHeader className="bg-slate-50 border-b py-3 px-4">
          <CardTitle className="text-sm">NS Relapse Classification Tool</CardTitle>
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
          <div className="flex gap-4 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={relapseHistory.sdns}
                onChange={e => setRelapseHistory(p => ({ ...p, sdns: e.target.checked }))} />
              Relapses while on steroids (≥2 consecutive relapses during taper)
            </label>
          </div>
          <Button onClick={classify} size="sm" className="bg-indigo-600 hover:bg-indigo-700 w-full">Classify</Button>
        </CardContent>
      </Card>

      {classification && (
        <Card className={`border-2 ${classColors[classification.color] || "border-slate-200 bg-slate-50"}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Badge className={`text-base px-3 py-1 ${classification.color === 'red' ? 'bg-red-600' : classification.color === 'amber' ? 'bg-amber-600' : 'bg-blue-600'} text-white`}>
                {classification.abbr}
              </Badge>
              <p className={`font-bold ${textColors[classification.color]}`}>{classification.type}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 text-xs">
              <div>
                <p className="font-bold text-slate-900 mb-2">🏥 Treatment Strategy</p>
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

      {/* Definitions */}
      <Card className="bg-white border border-slate-200">
        <CardContent className="p-4">
          <p className="text-xs font-bold text-slate-900 mb-3">📋 ISKDC/IPNA Definitions</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead><tr className="bg-slate-100">
                <th className="border border-slate-300 p-1.5 text-left">Term</th>
                <th className="border border-slate-300 p-1.5 text-left">Definition</th>
              </tr></thead>
              <tbody>
                {[
                  ["Remission", "Urine dipstick Nil/Trace × 3 consecutive days OR UPCR <0.2 mg/mg"],
                  ["Relapse", "Dipstick ≥2+ × 3 consecutive days after remission OR UPCR ≥2.0 mg/mg"],
                  ["FRNS", "≥2 relapses within 6 months of initial response OR ≥4 within 12 months"],
                  ["SDNS", "Relapses during steroid taper OR within 2 weeks of stopping"],
                  ["SRNS", "No remission after 4 weeks of prednisolone 2 mg/kg/day"],
                  ["Initial remission", "3 consecutive dipstick Nil within 4 weeks of steroid start"],
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
    { system: "Growth", effects: ["Short stature (GH suppression)", "Bone age delay", "Reduced growth velocity (<5 cm/year)"], monitoring: "Height velocity 6-monthly, bone age X-ray if concern", threshold: "Cumulative dose >150 mg/kg/year or persistent alternate-day > 1 mg/kg/EOD" },
    { system: "Metabolic", effects: ["Hyperglycaemia / Steroid DM", "Cushingoid features", "Hyperlipidaemia", "Weight gain"], monitoring: "Fasting glucose 3-monthly, lipid profile annually, BP monthly", threshold: "Any dose prolonged > 2 weeks" },
    { system: "Bone", effects: ["Osteopenia / osteoporosis", "Vertebral fractures", "Avascular necrosis (hip/knee)"], monitoring: "DEXA scan if on steroids >3 months, calcium + Vit D supplementation", threshold: "Cumulative dose >1000 mg prednisolone" },
    { system: "Adrenal", effects: ["Adrenal suppression", "Adrenal crisis on withdrawal", "Morning cortisol low"], monitoring: "Never stop steroids abruptly. Taper gradually. Sick day rules.", threshold: "Daily steroids > 2 weeks" },
    { system: "Infection", effects: ["Increased susceptibility to infection", "Disseminated varicella", "Pneumocystis jirovecii (PCP)"], monitoring: "VZV IgG status. Avoid live vaccines. Consider cotrimoxazole prophylaxis if high-dose.", threshold: "Prednisolone > 20 mg/day for > 4 weeks" },
    { system: "Ophthalmology", effects: ["Posterior subcapsular cataracts", "Glaucoma", "Increased IOP"], monitoring: "Annual ophthalmology review for all on chronic steroids", threshold: "Chronic low-dose or any prolonged course" },
    { system: "Behavioural", effects: ["Mood swings", "Insomnia", "Psychosis (rare at high dose)"], monitoring: "Parent/teacher questionnaire, sleep diary", threshold: "High-dose induction phase" },
  ];

  return (
    <div className="space-y-3">
      <Alert className="bg-amber-50 border-amber-300 border-2">
        <AlertTriangle className="w-4 h-4 text-amber-600" />
        <AlertDescription className="text-amber-900 text-xs">
          <strong>Steroid toxicity monitoring is mandatory for all children on chronic/repeated steroid courses.</strong> Document cumulative dose and screen at each visit.
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
          <p className="font-bold text-indigo-900 mb-2">💊 Steroid-Protective Adjuncts</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              ["Calcium", "500-1000 mg/day elemental Ca (diet + supplement)"],
              ["Vitamin D", "1000-2000 IU/day cholecalciferol"],
              ["BP monitoring", "Monthly — ACEi/ARB if persistent HTN"],
              ["Lifestyle", "Low salt, low sugar, high protein diet"],
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

export default function NephroticSyndromePathwayDetail() {
  return (
    <div className="space-y-4">
      <Tabs defaultValue="first-episode">
        <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-slate-100 p-1">
          <TabsTrigger value="first-episode" className="text-xs flex-1">🩺 First Episode Protocol</TabsTrigger>
          <TabsTrigger value="relapse" className="text-xs flex-1">🔁 Relapse Classifier</TabsTrigger>
          <TabsTrigger value="toxicity" className="text-xs flex-1">⚠️ Steroid Toxicity</TabsTrigger>
        </TabsList>
        <TabsContent value="first-episode" className="mt-3"><FirstEpisodeProtocol /></TabsContent>
        <TabsContent value="relapse" className="mt-3"><RelapseClassifier /></TabsContent>
        <TabsContent value="toxicity" className="mt-3"><SteroidToxicityMonitor /></TabsContent>
      </Tabs>
    </div>
  );
}