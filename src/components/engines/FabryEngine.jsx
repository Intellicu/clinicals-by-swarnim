import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, ChevronRight, ArrowLeft, AlertCircle, Dna, Heart, Eye, Activity, Microscope, Users, Zap } from "lucide-react";

const STEPS = ["Entry & Triggers", "Phenotype Recognition", "Probability", "Diagnostic Pathway", "Treatment Engine", "Family Screening", "Summary"];

const PHENOTYPE_QUESTIONS = {
  neurologic: [
    { id: "burning_pain", label: "Burning / neuropathic pain in hands/feet" },
    { id: "acroparesthesia", label: "Acroparesthesia (tingling, burning extremities)" },
    { id: "exercise_intolerance", label: "Exercise intolerance" },
    { id: "heat_intolerance", label: "Heat/cold intolerance" },
    { id: "hypohidrosis", label: "Hypohidrosis / anhidrosis" },
  ],
  renal: [
    { id: "proteinuria", label: "Proteinuria (unexplained)" },
    { id: "fsgs", label: "FSGS on biopsy" },
    { id: "ckd", label: "CKD unexplained" },
    { id: "dialysis", label: "Dialysis / prior renal failure" },
  ],
  cardiac: [
    { id: "lvh", label: "LVH (left ventricular hypertrophy)" },
    { id: "arrhythmia", label: "Arrhythmia / conduction defect" },
    { id: "cardiomyopathy", label: "Hypertrophic cardiomyopathy" },
  ],
  ophthalmic: [
    { id: "corneal_verticillata", label: "Corneal verticillata (slit-lamp)" },
  ],
  dermatologic: [
    { id: "angiokeratoma", label: "Angiokeratoma (periumbilical, bathing trunk distribution)" },
  ],
};

function calcProbability(answers) {
  const yes = Object.values(answers).filter(Boolean).length;
  if (yes >= 5) return "Very High";
  if (yes >= 3) return "High";
  if (yes >= 1) return "Moderate";
  return "Low";
}

const PROB_COLORS = {
  "Very High": "bg-red-600 text-white",
  "High": "bg-orange-500 text-white",
  "Moderate": "bg-amber-400 text-black",
  "Low": "bg-slate-200 text-slate-700",
};

export default function FabryEngine() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [sex, setSex] = useState("");
  const [hasMutation, setHasMutation] = useState(null);
  const [enzymeResult, setEnzymeResult] = useState("");

  const toggleAnswer = (id) => setAnswers(a => ({ ...a, [id]: !a[id] }));
  const probability = calcProbability(answers);

  const renderEntry = () => (
    <div className="space-y-3">
      <Alert className="bg-violet-50 border-violet-200">
        <Dna className="w-4 h-4 text-violet-600" />
        <AlertDescription className="text-violet-800 text-sm">
          <strong>Fabry Disease Engine:</strong> GLA gene mutation → Alpha-Gal A enzyme deficiency → lysosomal Gb3 accumulation. X-linked lysosomal storage disorder. Classic (males) and attenuated (females/late-onset) phenotypes.
        </AlertDescription>
      </Alert>
      <div className="rounded-xl bg-violet-50 border border-violet-200 p-3 space-y-2">
        <p className="text-xs font-bold text-violet-900 uppercase tracking-wide">Entry Triggers — Launch Fabry Pathway if ANY present:</p>
        {["Unexplained proteinuria / FSGS / CKD", "Neuropathic/burning pain in childhood", "Angiokeratoma", "Family history of CKD / LVH / Fabry", "LVH without clear cause", "Corneal verticillata on slit-lamp", "Unexplained stroke in young adult"].map((t, i) => (
          <div key={i} className="flex items-start gap-2 text-xs text-violet-800">
            <ChevronRight className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-violet-500" />{t}
          </div>
        ))}
      </div>
      <Button className="w-full bg-violet-600 hover:bg-violet-700" onClick={() => setStep(1)}>
        Launch Fabry Engine <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );

  const renderPhenotype = () => (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-slate-700">Check all features present in this patient:</p>
      {Object.entries(PHENOTYPE_QUESTIONS).map(([domain, questions]) => (
        <Card key={domain} className="border-slate-200">
          <CardHeader className="py-2 px-3 bg-slate-50 border-b">
            <CardTitle className="text-xs uppercase font-bold text-slate-600 tracking-wider capitalize">{domain}</CardTitle>
          </CardHeader>
          <CardContent className="p-3 space-y-1.5">
            {questions.map(q => (
              <button key={q.id} onClick={() => toggleAnswer(q.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-left text-sm ${answers[q.id] ? "bg-violet-50 border-violet-300 text-violet-800" : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"}`}>
                {answers[q.id] ? <CheckCircle2 className="w-4 h-4 text-violet-600 flex-shrink-0" /> : <Circle className="w-4 h-4 text-slate-300 flex-shrink-0" />}
                {q.label}
              </button>
            ))}
          </CardContent>
        </Card>
      ))}
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setStep(0)} className="flex-1"><ArrowLeft className="w-4 h-4 mr-1" />Back</Button>
        <Button className="flex-1 bg-violet-600 hover:bg-violet-700" onClick={() => setStep(2)}>Next: Probability <ChevronRight className="w-4 h-4 ml-1" /></Button>
      </div>
    </div>
  );

  const renderProbability = () => {
    const yesCount = Object.values(answers).filter(Boolean).length;
    const yesFeatures = Object.entries(PHENOTYPE_QUESTIONS).flatMap(([, qs]) => qs).filter(q => answers[q.id]);
    return (
      <div className="space-y-3">
        <div className={`rounded-xl p-4 text-center ${PROB_COLORS[probability]}`}>
          <p className="text-lg font-bold">Fabry Likelihood: {probability}</p>
          <p className="text-sm opacity-80">{yesCount} features present</p>
        </div>
        {yesFeatures.length > 0 && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-3 space-y-1">
              <p className="text-xs font-bold text-green-800 mb-2">Features identified:</p>
              {yesFeatures.map(q => (
                <div key={q.id} className="flex items-start gap-2 text-xs text-green-800">
                  <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-green-600 flex-shrink-0" />{q.label}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-3 space-y-1 text-xs text-amber-900">
            <p className="font-bold mb-1">Differential to consider:</p>
            {[["Fabry Disease (GLA)", probability === "Very High" || probability === "High" ? "High" : "Moderate"],
              ["Small fiber neuropathy (other)", "Moderate"],
              ["Other lysosomal storage disorders", "Low"],
              ["HCM — other causes", "Low"]].map(([dx, lk]) => (
              <div key={dx} className="flex justify-between"><span>{dx}</span><Badge className={lk === "High" ? "bg-orange-500 text-white" : lk === "Moderate" ? "bg-amber-400 text-black" : "bg-slate-200 text-slate-700"}>{lk}</Badge></div>
            ))}
          </CardContent>
        </Card>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setStep(1)} className="flex-1"><ArrowLeft className="w-4 h-4 mr-1" />Back</Button>
          <Button className="flex-1 bg-violet-600 hover:bg-violet-700" onClick={() => setStep(3)}>Diagnostic Pathway <ChevronRight className="w-4 h-4 ml-1" /></Button>
        </div>
      </div>
    );
  };

  const renderDiagnostic = () => (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-slate-700 mb-2">Select biological sex to guide diagnostic pathway:</p>
      <div className="grid grid-cols-2 gap-2">
        {["Male", "Female"].map(s => (
          <button key={s} onClick={() => setSex(s)}
            className={`p-3 rounded-xl border-2 font-semibold text-sm transition-all ${sex === s ? "border-violet-500 bg-violet-50 text-violet-800" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"}`}>
            {s}
          </button>
        ))}
      </div>
      {sex === "Male" && (
        <div className="space-y-2">
          <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-3 space-y-2">
            <p className="text-xs font-bold text-blue-900">Step 1 → Alpha-Galactosidase A (Alpha-Gal A) Enzyme Assay</p>
            <p className="text-xs text-blue-800">DBS (Dried Blood Spot) or plasma — send to metabolic laboratory</p>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {["Low (<1% activity)", "Borderline (1–10%)", "Normal (>10%)"].slice(0, 2).map((r, i) => (
                <button key={r} onClick={() => setEnzymeResult(r)}
                  className={`p-2 rounded-lg border text-xs font-medium transition-all ${enzymeResult === r ? "border-violet-400 bg-violet-50 text-violet-800" : "border-slate-200 bg-white text-slate-700"}`}>
                  {r}
                </button>
              ))}
            </div>
          </div>
          {enzymeResult.includes("Low") && (
            <div className="rounded-xl border-2 border-violet-200 bg-violet-50 p-3 space-y-1 text-xs text-violet-900">
              <p className="font-bold">Step 2 → GLA Gene Sequencing</p>
              <p>Enzyme low → CONFIRM with GLA mutation analysis</p>
              <p>→ Also measure plasma/urine Lyso-Gb3 (biomarker severity)</p>
              <p className="font-bold mt-2 text-violet-800">If GLA mutation confirmed → Fabry Disease DIAGNOSED</p>
            </div>
          )}
          {enzymeResult.includes("Borderline") && (
            <Alert className="bg-amber-50 border-amber-200">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <AlertDescription className="text-amber-800 text-xs">Borderline: Proceed to GLA sequencing. Some attenuated variants have borderline enzyme activity. Lyso-Gb3 may help differentiate.</AlertDescription>
            </Alert>
          )}
        </div>
      )}
      {sex === "Female" && (
        <div className="rounded-xl border-2 border-pink-200 bg-pink-50 p-3 space-y-2">
          <p className="text-xs font-bold text-pink-900">Females — Enzyme assay unreliable due to X-inactivation</p>
          <p className="text-xs text-pink-800">Step 1 → GLA Gene Sequencing directly (Sanger or NGS)</p>
          <p className="text-xs text-pink-800">Step 2 → Lyso-Gb3 plasma level (biomarker, may be elevated even with normal enzyme)</p>
          <p className="text-xs text-pink-800">Step 3 → End-organ assessment: Echo, ECG, renal function, ophthalmology</p>
        </div>
      )}
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setStep(2)} className="flex-1"><ArrowLeft className="w-4 h-4 mr-1" />Back</Button>
        <Button className="flex-1 bg-violet-600 hover:bg-violet-700" onClick={() => setStep(4)}>Treatment Engine <ChevronRight className="w-4 h-4 ml-1" /></Button>
      </div>
    </div>
  );

  const renderTreatment = () => (
    <div className="space-y-3">
      {[
        { title: "Enzyme Replacement Therapy (ERT) Eligibility", color: "bg-green-50 border-green-200", items: [
          "Classic Fabry (males with <1% enzyme activity): Agalsidase alfa (Replagal) 0.2 mg/kg IV q2w OR Agalsidase beta (Fabrazyme) 1 mg/kg IV q2w",
          "Symptomatic females with confirmed GLA mutation: ERT indicated",
          "Initiate BEFORE end-organ damage for maximum benefit",
          "India access: Available via compassionate use / ERKNet-affiliated centres",
        ]},
        { title: "Migalastat Eligibility (Oral Chaperone Therapy)", color: "bg-blue-50 border-blue-200", items: [
          "Amenable GLA variants ONLY — check amenability database (GalafoldAmenability.com)",
          "Dose: 123 mg every other day (EOD) — NOT daily",
          "Age ≥12 years only (India: compassionate access)",
          "Advantage: oral, no infusion reactions",
        ]},
        { title: "Nephrology Monitoring Protocol", color: "bg-violet-50 border-violet-200", items: [
          "eGFR + UPCR every 3–6 months",
          "Annual kidney biopsy not needed if stable on ERT",
          "ACEi/ARB: all patients with proteinuria",
          "Transplant: ERT should continue post-transplant (does NOT reverse native kidney damage)",
        ]},
        { title: "Multisystem Monitoring", color: "bg-amber-50 border-amber-200", items: [
          "Cardiology: Annual Echo + ECG (LVH, arrhythmia, LGE on MRI)",
          "Neurology: Brain MRI, pain score (BPI), stroke prevention (aspirin/anticoagulation if LVH or arrhythmia)",
          "Ophthalmology: Annual slit-lamp (corneal verticillata, posterior lens opacity)",
          "GI: Gut symptoms — low-fat diet, metoclopramide for gastroparesis",
        ]},
      ].map((s, i) => (
        <div key={i} className={`rounded-xl border-2 p-3 ${s.color}`}>
          <p className="text-xs font-bold text-slate-800 mb-2">{s.title}</p>
          {s.items.map((item, j) => (
            <div key={j} className="flex items-start gap-1.5 text-xs text-slate-700 mb-1">
              <span className="text-violet-500 font-bold flex-shrink-0">→</span>{item}
            </div>
          ))}
        </div>
      ))}
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setStep(3)} className="flex-1"><ArrowLeft className="w-4 h-4 mr-1" />Back</Button>
        <Button className="flex-1 bg-violet-600 hover:bg-violet-700" onClick={() => setStep(5)}>Family Screening <ChevronRight className="w-4 h-4 ml-1" /></Button>
      </div>
    </div>
  );

  const renderFamily = () => (
    <div className="space-y-3">
      <div className="rounded-xl bg-violet-50 border-2 border-violet-200 p-3 space-y-2">
        <p className="text-xs font-bold text-violet-900 flex items-center gap-2"><Users className="w-4 h-4" />Cascade Family Screening Protocol</p>
        {[
          "X-linked inheritance: Carrier females can be SYMPTOMATIC (attenuated phenotype)",
          "All first-degree relatives should be tested: siblings, children, parents",
          "Males: Enzyme assay (DBS) — fast, cost-effective",
          "Females: GLA gene sequencing (enzyme unreliable in carriers)",
          "If GLA mutation known in proband: Test for SPECIFIC mutation in family",
          "Children: Test from age 5–8 years for planning",
        ].map((item, j) => (
          <div key={j} className="flex items-start gap-1.5 text-xs text-violet-800">
            <ChevronRight className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-violet-500" />{item}
          </div>
        ))}
      </div>
      <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-1 text-xs text-slate-700">
        <p className="font-bold text-slate-800 mb-1">Risk Prediction by Relationship:</p>
        {[["Daughters of affected father", "100% carriers"], ["Sons of affected father", "0% (Y chromosome)"], ["Siblings of carrier mother", "50% chance (males affected, females carriers)"], ["Children of carrier mother", "50% affected males, 50% carrier females"]].map(([rel, risk]) => (
          <div key={rel} className="flex justify-between items-center py-0.5 border-b border-slate-100">
            <span>{rel}</span><span className="font-semibold text-violet-700">{risk}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setStep(4)} className="flex-1"><ArrowLeft className="w-4 h-4 mr-1" />Back</Button>
        <Button className="flex-1 bg-violet-600 hover:bg-violet-700" onClick={() => setStep(6)}>View Summary <ChevronRight className="w-4 h-4 ml-1" /></Button>
      </div>
    </div>
  );

  const renderSummary = () => {
    const yesFeatures = Object.entries(PHENOTYPE_QUESTIONS).flatMap(([, qs]) => qs).filter(q => answers[q.id]);
    return (
      <div className="space-y-3">
        <div className={`rounded-xl p-4 ${PROB_COLORS[probability]}`}>
          <p className="text-base font-bold">Fabry Disease Likelihood: {probability}</p>
          <p className="text-sm opacity-90">{yesFeatures.length} phenotypic features identified</p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            { label: "Diagnostic Test", value: sex === "Female" ? "GLA Sequencing + Lyso-Gb3" : "Alpha-Gal A enzyme → GLA sequencing" },
            { label: "Genetics", value: "GLA gene (Xq22.1), X-linked" },
            { label: "Treatment", value: "ERT (Agalsidase) or Migalastat (if amenable)" },
            { label: "Monitoring", value: "Renal, cardiac, neurologic, ophthalmologic" },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white border border-slate-200 rounded-xl p-2.5">
              <p className="text-slate-500 text-xs">{label}</p>
              <p className="font-semibold text-slate-800">{value}</p>
            </div>
          ))}
        </div>
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900 space-y-1">
          <p className="font-bold">Recommended Investigations</p>
          <p>Must Order: Alpha-Gal A enzyme (males), GLA sequencing, Lyso-Gb3, eGFR, UPCR</p>
          <p>Should Order: Echo, ECG, slit-lamp exam, brain MRI, audiometry</p>
          <p>Advanced: Skin biopsy (inclusions), WES if GLA negative + high suspicion</p>
        </div>
        <Button className="w-full bg-violet-600 hover:bg-violet-700" onClick={() => { setStep(0); setAnswers({}); setSex(""); setHasMutation(null); setEnzymeResult(""); }}>
          Start New Case
        </Button>
      </div>
    );
  };

  const steps = [renderEntry, renderPhenotype, renderProbability, renderDiagnostic, renderTreatment, renderFamily, renderSummary];

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-violet-700 to-purple-600 p-4 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Dna className="w-5 h-5" />
          <h3 className="text-sm font-bold">Fabry Disease Intelligence Engine</h3>
          <Badge className="bg-white/20 text-white text-xs border-white/30">Rare Disease · X-linked</Badge>
        </div>
        <p className="text-xs text-violet-100">Recognition → Diagnosis → Genetics → Treatment → Family Screening</p>
        <div className="flex gap-1 mt-2 flex-wrap">
          {STEPS.map((s, i) => (
            <span key={i} className={`text-xs px-2 py-0.5 rounded-full ${i === step ? "bg-white text-violet-700 font-semibold" : i < step ? "bg-violet-500 text-white" : "bg-white/10 text-violet-200"}`}>{i + 1}. {s}</span>
          ))}
        </div>
      </div>
      {steps[step]()}
    </div>
  );
}