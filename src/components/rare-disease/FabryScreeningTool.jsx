import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp, AlertTriangle, CheckCircle, RotateCcw, Zap, BookOpen, Users, ExternalLink, ChevronRight, FlaskConical, Heart } from "lucide-react";

// ─── Scoring Domains ───────────────────────────────────────────────────────────
const DOMAINS = [
  {
    id: "renal", label: "Renal Features", icon: "🫘", color: "blue",
    features: [
      { id: "proteinuria", label: "Proteinuria (unexplained, persistent)", weight: 3 },
      { id: "ckd_unclear", label: "CKD of unclear etiology", weight: 4 },
      { id: "fsgs", label: "FSGS / podocytopathy on biopsy", weight: 4 },
      { id: "hematuria", label: "Microscopic hematuria (persistent, unexplained)", weight: 2 },
      { id: "resistant_htn", label: "Resistant hypertension in young patient", weight: 2 },
      { id: "family_ckd", label: "Family history of unexplained CKD", weight: 3 },
    ]
  },
  {
    id: "neuro", label: "Neurologic Features", icon: "🧠", color: "violet",
    features: [
      { id: "acropares", label: "Acroparesthesia (burning pain hands/feet)", weight: 5 },
      { id: "pain_crises", label: "Recurrent burning pain crises", weight: 5 },
      { id: "heat_intolerance", label: "Heat / cold intolerance", weight: 3 },
      { id: "hypohidrosis", label: "Hypohidrosis / anhidrosis", weight: 3 },
      { id: "exercise_intolerance", label: "Exercise intolerance", weight: 2 },
      { id: "stroke_tia", label: "Stroke / TIA in young patient (<45 yrs)", weight: 4 },
    ]
  },
  {
    id: "cardiac", label: "Cardiac Features", icon: "❤️", color: "red",
    features: [
      { id: "lvh", label: "Left ventricular hypertrophy (LVH) — unexplained", weight: 5 },
      { id: "arrhythmia", label: "Arrhythmia / conduction abnormality", weight: 3 },
      { id: "cardiomyopathy", label: "Unexplained cardiomyopathy", weight: 4 },
    ]
  },
  {
    id: "gi", label: "Gastrointestinal Features", icon: "🫃", color: "amber",
    features: [
      { id: "postprandial_pain", label: "Post-prandial abdominal pain", weight: 3 },
      { id: "diarrhea", label: "Diarrhea / bowel irregularity (chronic)", weight: 2 },
      { id: "abdo_pain", label: "Chronic unexplained abdominal pain", weight: 2 },
    ]
  },
  {
    id: "derm", label: "Dermatologic Features", icon: "🩺", color: "pink",
    features: [
      { id: "angiokeratoma", label: "Angiokeratoma (umbilical, groin, bathing trunk)", weight: 6 },
      { id: "rash", label: "Characteristic vascular rash / telangiectasias", weight: 3 },
    ]
  },
  {
    id: "ophthalmic", label: "Ophthalmologic Features", icon: "👁️", color: "teal",
    features: [
      { id: "cornea_vert", label: "Cornea verticillata (whorl pattern, slit lamp)", weight: 6 },
      { id: "visual_symptoms", label: "Visual symptoms / posterior subcapsular lens opacity", weight: 2 },
    ]
  },
  {
    id: "family_hx", label: "Family History", icon: "👨‍👩‍👧", color: "purple",
    features: [
      { id: "maternal_disease", label: "Maternal lineage disease (X-linked — maternal uncles)", weight: 4 },
      { id: "early_dialysis", label: "Family member on dialysis at young age", weight: 4 },
      { id: "early_stroke_fam", label: "Early stroke in family (maternal side)", weight: 3 },
      { id: "fam_cardiomyo", label: "Family cardiomyopathy / LVH", weight: 3 },
      { id: "fam_ckd_unexplained", label: "Multiple family members: unexplained CKD", weight: 4 },
    ]
  },
  {
    id: "peds", label: "Pediatric Red Flags", icon: "🧒", color: "orange",
    features: [
      { id: "recurrent_pain_child", label: "Recurrent unexplained pain crises in child/adolescent", weight: 5 },
      { id: "adolescent_ckd", label: "CKD onset in adolescence without clear cause", weight: 4 },
      { id: "resistant_proteinuria", label: "Resistant proteinuria not responding to therapy", weight: 3 },
      { id: "growth_issues", label: "Growth impairment with unexplained renal/multi-organ disease", weight: 2 },
    ]
  },
];

// ─── Scoring ──────────────────────────────────────────────────────────────────
function scoreFabry(checked) {
  let total = 0;
  const contributors = [];
  const domainScores = {};

  DOMAINS.forEach(domain => {
    let dScore = 0;
    domain.features.forEach(f => {
      if (checked[f.id]) {
        total += f.weight;
        dScore += f.weight;
        contributors.push({ label: f.label, weight: f.weight, domain: domain.label, color: domain.color });
      }
    });
    if (dScore > 0) domainScores[domain.id] = { label: domain.label, score: dScore, icon: domain.icon };
  });

  contributors.sort((a, b) => b.weight - a.weight);
  return { total, contributors, domainScores };
}

function getRisk(total) {
  if (total === 0) return { level: "Low Suspicion", color: "green", badge: "bg-green-100 text-green-800", alert: "bg-green-50 border-green-200", icon: CheckCircle };
  if (total <= 4) return { level: "Possible Fabry Disease", color: "amber", badge: "bg-amber-100 text-amber-800", alert: "bg-amber-50 border-amber-200", icon: AlertTriangle };
  if (total <= 9) return { level: "High Suspicion for Fabry Disease", color: "orange", badge: "bg-orange-100 text-orange-800", alert: "bg-orange-50 border-orange-300", icon: AlertTriangle };
  return { level: "Urgent Genetics / Enzyme Referral", color: "red", badge: "bg-red-100 text-red-800", alert: "bg-red-50 border-red-400 border-2", icon: AlertTriangle };
}

const NEXT_STEPS = {
  low: {
    tests: ["Urine protein:creatinine ratio (annual)", "BP monitoring", "Annual renal function"],
    genetics: [],
    referrals: ["Reassess if new features develop"],
  },
  possible: {
    tests: ["Alpha-galactosidase A enzyme activity (plasma/leucocytes)", "Lyso-Gb3 (urine + plasma)", "Urine protein quantification (24h or spot ACR)", "ECG (baseline)"],
    genetics: ["GLA gene sequencing (especially females — enzyme may be normal)", "Maternal family history detailed pedigree"],
    referrals: ["Paediatric Nephrology", "Clinical Genetics", "Ophthalmology (slit lamp for cornea verticillata)"],
  },
  high: {
    tests: ["Alpha-galactosidase A enzyme activity (urgent)", "Lyso-Gb3 (urine + plasma)", "Urine protein + ACR", "ECG + Echocardiogram", "Renal evaluation (eGFR, ultrasound)", "Brain MRI (if neuro features)"],
    genetics: ["GLA gene sequencing", "Family cascade screening (siblings, maternal relatives)", "Enzyme activity in at-risk females"],
    referrals: ["Paediatric Nephrology (urgent)", "Clinical Genetics (urgent)", "Cardiology", "Neurology (if stroke/neuropathy)", "Ophthalmology"],
  },
};

function getNextStepsKey(total) {
  if (total <= 0) return "low";
  if (total <= 4) return "possible";
  return "high";
}

// ─── Bar chart for SHAP-style contributors ────────────────────────────────────
const BAR_COLORS = {
  blue: "bg-blue-500", violet: "bg-violet-500", red: "bg-red-500",
  amber: "bg-amber-500", pink: "bg-pink-500", teal: "bg-teal-500",
  purple: "bg-purple-500", orange: "bg-orange-500",
};
const MAX_WEIGHT = 6;

function ContributorBar({ item }) {
  const pct = Math.round((item.weight / MAX_WEIGHT) * 100);
  const barColor = BAR_COLORS[item.color] || "bg-slate-400";
  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-700 truncate flex-1 pr-2">{item.label}</span>
        <span className="font-bold text-slate-800 flex-shrink-0">+{item.weight}</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${barColor} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-slate-400">{item.domain}</p>
    </div>
  );
}

// ─── Teaching Cards ───────────────────────────────────────────────────────────
const TEACHING = [
  { title: "Fabry Disease Overview", icon: "🔬", content: "Fabry disease is an X-linked lysosomal storage disorder caused by deficiency of alpha-galactosidase A (GLA gene, Xq22). This leads to progressive accumulation of globotriaosylceramide (Gb3) and its deacylated form lyso-Gb3 in endothelial, renal, cardiac, and neural cells. Prevalence ~1:40,000 males; females variably affected due to X-inactivation." },
  { title: "X-Linked Inheritance", icon: "🧬", content: "GLA is on the X chromosome. Affected males (hemizygous) have no functional enzyme — severe classic phenotype. Carrier females (heterozygous) show variable disease from asymptomatic to nearly as severe as males due to random X-inactivation (lyonisation). Enzyme assay may be NORMAL in carrier females — always do GLA gene sequencing in females." },
  { title: "Pediatric Clues to Diagnosis", icon: "🧒", content: "In children and adolescents: (1) Unexplained acroparesthesia — burning hands/feet, especially triggered by heat/exercise/fever. (2) Angiokeratoma appearing at bathing trunk distribution from puberty. (3) Hypohidrosis — poor sweating, heat intolerance. (4) Cornea verticillata on slit lamp (asymptomatic in children, pathognomonic). (5) Fatigue and exercise intolerance. Diagnosis often delayed 10-15 years from symptom onset." },
  { title: "Renal Progression", icon: "🫘", content: "Renal involvement: podocyte Gb3 accumulation → proteinuria (early marker) → progressive CKD. Renal biopsy: zebra bodies (lamellated inclusions) in podocytes/tubular cells on EM — pathognomonic. Lyso-Gb3 is more sensitive marker than Gb3. Without ERT, ESRD by 3rd–4th decade in classic males. ACEi/ARB for proteinuria regardless of ERT status." },
  { title: "Enzyme Replacement Therapy (ERT)", icon: "💉", content: "Two ERTs available: Agalsidase alfa (Replagal, 0.2 mg/kg IV every 2 weeks) and Agalsidase beta (Fabrazyme, 1 mg/kg IV every 2 weeks). ERT clears Gb3 from vessels and kidneys — slows renal decline if started before significant fibrosis. Infusion reactions common (pre-medicate). Current guidance: start ERT in symptomatic males regardless of age; consider in females with organ involvement." },
  { title: "Chaperone Therapy — Migalastat", icon: "💊", content: "Migalastat (Galafold): oral pharmacological chaperone — stabilises misfolded alpha-GAL A protein. Only for amenable mutations (~50% of known mutations). Check amenability at FDA database before prescribing. Dose: 123 mg every other day (adults). Not yet approved <16 years but trials ongoing. Advantage: oral, self-administered, avoids IV infusion." },
  { title: "Transplant & Dialysis", icon: "🏥", content: "Kidney transplant: corrects renal failure but does NOT correct systemic Gb3 accumulation. Continue ERT post-transplant for cardiac/neurological protection. Dialysis: HD and PD both feasible but Gb3 accumulates systemically — dialysis does not clear it. Transplant outcomes good; cardiac evaluation critical pre-transplant. No recurrence in donor kidney (donor enzyme is normal)." },
  { title: "Family Screening Imperative", icon: "👨‍👩‍👧", content: "Once index case identified: (1) All sisters of affected males: GLA sequencing + enzyme assay + lyso-Gb3. (2) Daughters of affected males: obligate carriers — screen and counsel. (3) Sons of affected males: unaffected (Y chromosome). (4) Maternal family: mother is likely carrier — screen maternal uncles. (5) Screening tools: enzyme activity (males) + GLA sequencing (all). Early diagnosis enables preventive ERT before organ damage." },
];

function TeachingCard({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-blue-50 text-left transition-colors">
        <span className="text-lg">{item.icon}</span>
        <span className="font-semibold text-sm text-slate-800 flex-1">{item.title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && <div className="p-4 bg-white text-sm text-slate-700 leading-relaxed border-t border-slate-100">{item.content}</div>}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function FabryScreeningTool({ isAdmin }) {
  const [checked, setChecked] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [showTeaching, setShowTeaching] = useState(false);
  const [showTracking, setShowTracking] = useState(false);

  const toggle = (id) => setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  const { total, contributors, domainScores } = scoreFabry(checked);
  const risk = getRisk(total);
  const nextKey = getNextStepsKey(total);
  const steps = NEXT_STEPS[nextKey];
  const checkedCount = Object.values(checked).filter(Boolean).length;

  const RiskIcon = risk.icon;

  return (
    <div className="space-y-4 pb-24 relative">
      {/* Header */}
      <div className="bg-gradient-to-br from-violet-700 to-purple-800 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">💜</div>
          <div>
            <h2 className="text-lg font-bold">Fabry Disease Screening Tool</h2>
            <p className="text-violet-200 text-xs">Pediatric Nephrology · Rapid OPD Workflow</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge className="bg-white/20 text-xs">X-linked · GLA Gene</Badge>
          <Badge className="bg-white/20 text-xs">Alpha-Galactosidase A Deficiency</Badge>
          <Badge className="bg-green-400/80 text-xs">Weighted Suspicion Score</Badge>
        </div>
        <p className="text-xs text-violet-200 mt-3">Check ALL features present in your patient. Score auto-calculates. Tap "Calculate Risk" for full explainable report.</p>
      </div>

      {/* Screening Domains */}
      {DOMAINS.map(domain => (
        <Card key={domain.id} className="bg-white border border-slate-200 shadow-sm">
          <CardHeader className="py-3 px-4 border-b bg-slate-50">
            <CardTitle className="text-sm flex items-center gap-2">
              <span>{domain.icon}</span>{domain.label}
              {Object.keys(checked).filter(k => checked[k] && domain.features.find(f => f.id === k)).length > 0 && (
                <Badge className="bg-violet-100 text-violet-800 text-xs ml-auto">
                  {Object.keys(checked).filter(k => checked[k] && domain.features.find(f => f.id === k)).length} selected
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {domain.features.map(f => (
                <div key={f.id} className={`flex items-start gap-3 p-2.5 rounded-lg transition-colors cursor-pointer ${checked[f.id] ? "bg-violet-50 border border-violet-200" : "hover:bg-slate-50"}`}
                  onClick={() => toggle(f.id)}>
                  <Checkbox checked={!!checked[f.id]} onCheckedChange={() => toggle(f.id)} className="mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <Label className="text-sm text-slate-800 cursor-pointer leading-tight">{f.label}</Label>
                  </div>
                  <Badge className={`text-xs flex-shrink-0 ${f.weight >= 5 ? "bg-red-100 text-red-700" : f.weight >= 3 ? "bg-orange-100 text-orange-700" : "bg-slate-100 text-slate-600"}`}>
                    +{f.weight}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Sticky Calculate Button */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg lg:relative lg:bg-transparent lg:shadow-none lg:border-none lg:p-0">
        <div className="max-w-2xl mx-auto flex gap-3">
          <Button
            onClick={() => setSubmitted(true)}
            className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-bold"
            disabled={checkedCount === 0}
          >
            <Zap className="w-4 h-4 mr-2" />
            Calculate Fabry Risk {checkedCount > 0 && `(${checkedCount} features)`}
          </Button>
          <Button variant="outline" onClick={() => { setChecked({}); setSubmitted(false); }} className="px-3">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Results */}
      {submitted && (
        <div className="space-y-4">
          {/* Risk Level */}
          <Alert className={`border-2 ${risk.alert}`}>
            <div className="flex items-start gap-3">
              <RiskIcon className={`w-6 h-6 flex-shrink-0 mt-0.5 ${total >= 10 ? "text-red-600" : total >= 5 ? "text-orange-600" : total >= 1 ? "text-amber-600" : "text-green-600"}`} />
              <AlertDescription className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="font-bold text-base">{risk.level}</span>
                  <Badge className={risk.badge}>Score: {total}</Badge>
                </div>
                {total === 0 && <p className="text-sm text-slate-700">No specific features suggesting Fabry disease identified. Routine follow-up recommended. Reassess if new features develop.</p>}
                {total > 0 && total <= 4 && <p className="text-sm text-slate-700">Some features warrant Fabry evaluation. Alpha-galactosidase A enzyme assay and lyso-Gb3 recommended. GLA sequencing especially important in females.</p>}
                {total > 4 && total <= 9 && <p className="text-sm text-slate-700">Multiple features strongly suggest Fabry disease. Urgent biochemical and genetic testing indicated. Multi-specialist referral recommended.</p>}
                {total >= 10 && <p className="text-sm text-slate-700">High-probability Fabry disease. URGENT enzyme assay, lyso-Gb3, and GLA sequencing. Immediate genetics/nephrology referral. Assess for cardiac and neurological involvement.</p>}
              </AlertDescription>
            </div>
          </Alert>

          {/* SHAP-style contributor bars */}
          {contributors.length > 0 && (
            <Card className="bg-white border border-slate-200 shadow-sm">
              <CardHeader className="py-3 px-4 border-b bg-slate-50">
                <CardTitle className="text-sm">Explainable Risk Reasoning — Major Contributors</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">Each bar shows relative contribution to Fabry suspicion score</p>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {contributors.map((c, i) => <ContributorBar key={i} item={c} />)}
              </CardContent>
            </Card>
          )}

          {/* Domain Summary */}
          {Object.keys(domainScores).length > 0 && (
            <Card className="bg-white border border-slate-200 shadow-sm">
              <CardHeader className="py-3 px-4 border-b bg-slate-50">
                <CardTitle className="text-sm">Domain Contribution Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {Object.values(domainScores).map((d, i) => (
                    <div key={i} className="bg-violet-50 border border-violet-200 rounded-lg p-3 text-center">
                      <span className="text-2xl">{d.icon}</span>
                      <p className="text-xs font-semibold text-violet-900 mt-1 leading-tight">{d.label}</p>
                      <p className="text-lg font-bold text-violet-700">+{d.score}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Next Steps */}
          {total > 0 && (
            <Card className="bg-indigo-50 border border-indigo-200 shadow-sm">
              <CardHeader className="py-3 px-4 border-b border-indigo-200">
                <CardTitle className="text-sm text-indigo-900">Next-Step Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {steps.tests.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-indigo-800 uppercase mb-2 flex items-center gap-1"><FlaskConical className="w-3.5 h-3.5" />Suggested Investigations</p>
                    <div className="space-y-1">
                      {steps.tests.map((t, i) => (
                        <div key={i} className="flex items-start gap-2 bg-white rounded-lg p-2 text-xs text-indigo-900">
                          <ChevronRight className="w-3 h-3 flex-shrink-0 mt-0.5 text-indigo-400" />{t}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {steps.genetics.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-purple-800 uppercase mb-2 flex items-center gap-1">🧬 Genetic Testing</p>
                    <div className="space-y-1">
                      {steps.genetics.map((g, i) => (
                        <div key={i} className="flex items-start gap-2 bg-purple-50 rounded-lg p-2 text-xs text-purple-900">
                          <ChevronRight className="w-3 h-3 flex-shrink-0 mt-0.5 text-purple-400" />{g}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {steps.referrals.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-blue-800 uppercase mb-2 flex items-center gap-1"><Users className="w-3.5 h-3.5" />Specialist Referrals</p>
                    <div className="flex flex-wrap gap-2">
                      {steps.referrals.map((r, i) => (
                        <Badge key={i} className="bg-blue-100 text-blue-800 text-xs">{r}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Family Screening Guidance */}
          {total >= 4 && (
            <Card className="bg-white border border-amber-200 shadow-sm">
              <CardHeader className="py-3 px-4 border-b bg-amber-50">
                <CardTitle className="text-sm text-amber-900 flex items-center gap-2"><Users className="w-4 h-4" />Family Screening Guidance</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2 text-sm text-slate-700">
                <div className="bg-amber-50 rounded-lg p-3 space-y-1">
                  <p className="font-semibold text-amber-900">Maternal Lineage Review (X-linked inheritance)</p>
                  <ul className="text-xs space-y-1 text-amber-800">
                    <li>• Patient's mother: likely carrier — GLA sequencing + enzyme assay + lyso-Gb3</li>
                    <li>• Maternal uncles: 50% risk of being affected — enzyme assay</li>
                    <li>• Patient's sisters: 50% carrier risk — GLA sequencing</li>
                    <li>• Patient's daughters (if female): obligate carriers — screen and counsel</li>
                    <li>• Patient's sons (if male): unaffected (receive Y chromosome)</li>
                  </ul>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="font-semibold text-slate-800 mb-1">Pedigree Workflow</p>
                  <p className="text-xs text-slate-600">Draw 3-generation pedigree focusing on maternal side. Mark: early dialysis, stroke &lt;50 yrs, cardiomyopathy, CKD of unclear cause. All family members with symptoms or positive pedigree markers should have enzyme assay ± GLA sequencing.</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-900">
                  <strong>Sibling Screening:</strong> All male siblings of an affected male: enzyme assay urgently. All female siblings: GLA sequencing (enzyme may be normal in carriers).
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cross-links */}
          <Card className="bg-white border border-violet-200 shadow-sm">
            <CardHeader className="py-3 px-4 border-b bg-violet-50">
              <CardTitle className="text-sm text-violet-900 flex items-center gap-2"><ExternalLink className="w-4 h-4" />Cross-links & Related Resources</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  { label: "Fabry Disease Pathway", desc: "Full clinical protocol", color: "violet" },
                  { label: "CKD Pathways", desc: "CKD staging & management", color: "blue" },
                  { label: "FSGS Pathway", desc: "Podocytopathy workup", color: "teal" },
                  { label: "Genetics Workflow", desc: "GLA sequencing guide", color: "purple" },
                  { label: "Monitoring Templates", desc: "Fabry monitoring protocol", color: "indigo" },
                  { label: "AI Rare Analyzers", desc: "Fabry pattern analyzer", color: "pink" },
                ].map((l, i) => (
                  <div key={i} className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs">
                    <p className="font-semibold text-slate-800">{l.label}</p>
                    <p className="text-slate-500">{l.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Longitudinal Tracking Placeholder */}
          <Card className="bg-white border border-slate-200 shadow-sm">
            <button className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 text-left rounded-t-lg" onClick={() => setShowTracking(!showTracking)}>
              <span className="font-semibold text-sm text-slate-800 flex items-center gap-2"><Heart className="w-4 h-4 text-violet-500" />Longitudinal Fabry Suspicion Tracking</span>
              {showTracking ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showTracking && (
              <CardContent className="p-4 border-t border-slate-100">
                <div className="bg-violet-50 border border-violet-200 rounded-lg p-4 text-center">
                  <p className="text-sm font-semibold text-violet-900 mb-1">Tracking Dashboard</p>
                  <p className="text-xs text-violet-700 mb-3">Save current screening result to patient record to track evolving Fabry suspicion over time. Compare scores across visits. Alert when score crosses action thresholds.</p>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {["Visit 1", "Visit 2", "Current"].map((v, i) => (
                      <div key={i} className="bg-white rounded p-2 text-center border border-violet-100">
                        <p className="text-xs text-slate-500">{v}</p>
                        <p className="text-lg font-bold text-violet-700">{i === 2 ? total : "—"}</p>
                      </div>
                    ))}
                  </div>
                  <Badge className="bg-violet-200 text-violet-800 text-xs">Coming Soon — Link to Patient Record</Badge>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      )}

      {/* Teaching Layer */}
      <div className="border border-blue-200 rounded-xl overflow-hidden">
        <button
          className="w-full flex items-center gap-3 px-4 py-4 bg-blue-50 hover:bg-blue-100 text-left transition-colors"
          onClick={() => setShowTeaching(!showTeaching)}
        >
          <BookOpen className="w-5 h-5 text-blue-600" />
          <div className="flex-1">
            <span className="font-bold text-sm text-blue-900">Fabry Disease Teaching Layer</span>
            <p className="text-xs text-blue-700 mt-0.5">Overview · Genetics · Diagnosis · Treatment · Transplant</p>
          </div>
          {showTeaching ? <ChevronUp className="w-4 h-4 text-blue-400" /> : <ChevronDown className="w-4 h-4 text-blue-400" />}
        </button>
        {showTeaching && (
          <div className="p-3 bg-white space-y-2">
            {TEACHING.map((t, i) => <TeachingCard key={i} item={t} />)}
          </div>
        )}
      </div>

      {/* Admin Governance Note */}
      {isAdmin && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertDescription className="text-xs text-amber-800">
            <strong>Admin:</strong> Scoring weights, thresholds, and references are editable via the RareDiseaseContent entity (content_type: "pathway", section_id: "fabry_screening"). Version tracking and draft/published states available in the database.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}