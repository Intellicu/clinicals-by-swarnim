import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  ChevronDown, ChevronUp, AlertTriangle, CheckCircle, RotateCcw,
  Zap, BookOpen, Users, ExternalLink, ChevronRight, FlaskConical,
  Heart, Printer, TrendingUp, Lightbulb, Activity, Info
} from "lucide-react";

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

// ─── Rationale map per feature ─────────────────────────────────────────────────
const RATIONALES = {
  fsgs: "Unexplained FSGS in a child — especially with neuropathic pain — increases likelihood of Fabry nephropathy. Podocyte Gb3 accumulation mimics FSGS histologically.",
  cornea_vert: "Cornea verticillata (whorl-pattern corneal opacity) is highly suggestive of Fabry disease and is pathognomonic when present. Requires slit-lamp examination.",
  acropares: "Acroparesthesia — burning, tingling pain in the hands and feet — is often the first symptom in children with Fabry disease, frequently misdiagnosed as rheumatological or anxiety-related.",
  pain_crises: "Recurrent neuropathic pain crises triggered by fever, heat, or exercise are a classic pediatric presentation of Fabry disease and are frequently overlooked for years.",
  angiokeratoma: "Angiokeratoma in the bathing trunk distribution is nearly pathognomonic for Fabry disease and warrants immediate enzyme assay.",
  lvh: "Unexplained LVH in a young patient — especially without hypertension — should always trigger Fabry screening. Cardiac Fabry disease can occur even without renal/neurological symptoms.",
  maternal_disease: "X-linked inheritance means maternal lineage review is critical. Affected maternal uncles, maternal relatives on dialysis, or early maternal-side strokes are red flags for GLA mutation.",
  early_dialysis: "A family member on dialysis at a young age (especially maternal lineage) strongly suggests an inherited nephropathy — Fabry disease is a key diagnosis to exclude.",
  recurrent_pain_child: "Pediatric neuropathic pain crises are commonly overlooked. Children may not describe 'burning' — they often present as 'aches', school avoidance, or exercise refusal.",
  ckd_unclear: "CKD without a clear cause in a child or adolescent mandates consideration of inherited kidney diseases including Fabry. Up to 1% of unexplained ESRD cases carry GLA mutations.",
  stroke_tia: "Stroke or TIA in a young patient (<45 years) — particularly posterior circulation — is a well-recognised Fabry complication and warrants urgent alpha-GAL A assay.",
  proteinuria: "Fabry disease may initially present as isolated proteinuria, indistinguishable from other glomerular diseases without enzyme assay or biopsy with EM.",
};

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
        contributors.push({ id: f.id, label: f.label, weight: f.weight, domain: domain.label, color: domain.color });
      }
    });
    if (dScore > 0) domainScores[domain.id] = { label: domain.label, score: dScore, icon: domain.icon };
  });

  contributors.sort((a, b) => b.weight - a.weight);
  return { total, contributors, domainScores };
}

function getRisk(total) {
  if (total === 0) return { level: "Low Suspicion", key: "low", color: "green", badge: "bg-green-100 text-green-800", alert: "bg-green-50 border-green-200", icon: CheckCircle, iconColor: "text-green-600" };
  if (total <= 4) return { level: "Possible Fabry Disease", key: "possible", color: "amber", badge: "bg-amber-100 text-amber-800", alert: "bg-amber-50 border-amber-300", icon: AlertTriangle, iconColor: "text-amber-600" };
  if (total <= 9) return { level: "High Suspicion for Fabry Disease", key: "high", color: "orange", badge: "bg-orange-100 text-orange-800", alert: "bg-orange-50 border-orange-300", icon: AlertTriangle, iconColor: "text-orange-600" };
  return { level: "Urgent Genetics / Enzyme Referral", key: "urgent", color: "red", badge: "bg-red-100 text-red-800", alert: "bg-red-50 border-red-400 border-2", icon: AlertTriangle, iconColor: "text-red-600" };
}

// ─── Post-score guidance per risk level ──────────────────────────────────────
const GUIDANCE = {
  low: {
    summary: "No specific Fabry features identified at this time. Monitor clinically and reassess if new multi-system features develop.",
    actions: [
      { icon: "📋", label: "Monitor Clinically", detail: "Annual renal function, urine protein:creatinine ratio, BP monitoring." },
      { icon: "🔁", label: "Reassess if New Features", detail: "If acroparesthesia, angiokeratoma, cornea verticillata, LVH, or family history of unexplained CKD emerge, repeat screening." },
      { icon: "📚", label: "Educational Pearl", detail: "Fabry disease may initially present as isolated proteinuria with no other features. Enzyme assay is low-cost and highly sensitive in males." },
    ],
    investigations: [],
    genetics: [],
    referrals: [],
    transplant_note: null,
  },
  possible: {
    summary: "Some features are consistent with Fabry disease. Alpha-galactosidase A enzyme assay and detailed family history review are the immediate next steps.",
    actions: [
      { icon: "🧪", label: "Alpha-Galactosidase A Enzyme Assay", detail: "Send plasma or leucocyte alpha-GAL A activity. Note: enzyme may be normal in females — always proceed to GLA sequencing in females regardless." },
      { icon: "👨‍👩‍👧", label: "Review Maternal Family History", detail: "Construct 3-generation pedigree focusing on maternal lineage — early dialysis, stroke <50 yrs, unexplained CKD, cardiomyopathy." },
      { icon: "🫘", label: "Nephrology / Genetics Review", detail: "If persistent proteinuria or CKD without clear cause, refer to paediatric nephrology and clinical genetics for formal evaluation." },
      { icon: "💧", label: "Lyso-Gb3 Measurement", detail: "Urine and plasma lyso-Gb3 is more sensitive than enzyme assay — especially useful in females and late-onset variants." },
    ],
    investigations: ["Alpha-galactosidase A enzyme activity (plasma/leucocytes)", "Lyso-Gb3 (urine + plasma)", "Urine protein:creatinine ratio", "ECG baseline", "Ophthalmology (slit lamp for cornea verticillata)"],
    genetics: ["GLA gene sequencing (especially females — enzyme may be normal)", "Maternal family history pedigree construction"],
    referrals: ["Paediatric Nephrology", "Clinical Genetics", "Ophthalmology"],
    transplant_note: null,
  },
  high: {
    summary: "Multiple converging features strongly suggest Fabry disease. Urgent biochemical and genetic testing is indicated. Multi-specialist referral is recommended without delay.",
    actions: [
      { icon: "🩸", label: "DBS / Enzyme Testing (Urgent)", detail: "Dried blood spot (DBS) alpha-GAL A activity is a convenient first-line test. Follow with leucocyte enzyme assay for confirmation. Do NOT rely on DBS alone in females." },
      { icon: "💧", label: "Lyso-Gb3 (Urine + Plasma)", detail: "Lyso-Gb3 is elevated in classic Fabry disease and most carrier females. Strongly supports diagnosis and is used for monitoring ERT response." },
      { icon: "🧬", label: "GLA Gene Sequencing", detail: "Essential for confirmation and to classify mutation as amenable (chaperone therapy) vs non-amenable (ERT). Enables family cascade screening." },
      { icon: "👁️", label: "Ophthalmology + Cardiology Evaluation", detail: "Slit-lamp exam for cornea verticillata. Echo + ECG for LVH/cardiomyopathy. Cardiac Fabry can present without renal/neurological features." },
      { icon: "👨‍👩‍👧", label: "Family Cascade Screening", detail: "All at-risk maternal relatives should be screened. Male relatives: enzyme assay. Female relatives: GLA sequencing (enzyme may be normal)." },
    ],
    investigations: ["Alpha-galactosidase A enzyme (urgent — DBS then leucocytes)", "Lyso-Gb3 (urine + plasma)", "GLA gene sequencing", "Urine protein + ACR", "ECG + Echocardiogram", "Renal evaluation (eGFR, ultrasound)", "Brain MRI (if stroke/TIA/neuro features)"],
    genetics: ["GLA gene sequencing (full gene)", "Family cascade: enzyme in males, sequencing in females", "Mutation amenability check (for migalastat eligibility)"],
    referrals: ["Paediatric Nephrology (urgent)", "Clinical Genetics (urgent)", "Cardiology", "Neurology (if stroke/neuropathy)", "Ophthalmology"],
    transplant_note: null,
  },
  urgent: {
    summary: "High-probability Fabry disease with multiple converging features. URGENT genetics referral and enzyme assay required. Coordinate multi-specialist evaluation immediately.",
    actions: [
      { icon: "🚨", label: "Urgent Genetics Referral", detail: "Same-day or next available referral to clinical genetics. Inform regarding X-linked lysosomal storage disorder with multi-organ involvement." },
      { icon: "🩸", label: "Urgent DBS / Enzyme Assay", detail: "Send DBS and plasma alpha-GAL A immediately. Do not wait for genetics appointment. Results will guide urgency of ERT initiation." },
      { icon: "🏥", label: "Complete Multi-System Evaluation", detail: "Cardiology (echo, ECG, Holter), Neurology (brain MRI, nerve conduction), Nephrology (renal biopsy consideration), Ophthalmology (slit lamp)." },
      { icon: "🤝", label: "Nephrology / Cardiology / Genetics Coordination", detail: "Multi-disciplinary team meeting essential. ERT decisions (agalsidase alfa or beta) should be made jointly with genetics and organ-specific specialists." },
      { icon: "⚠️", label: "Transplant Implications (if advanced CKD)", detail: "If approaching ESRD: Fabry diagnosis MUST be confirmed pre-transplant. Continue ERT post-transplant — transplant corrects renal failure but not systemic Gb3 accumulation. Cardiac clearance essential pre-transplant." },
    ],
    investigations: ["Alpha-GAL A enzyme assay (DBS + leucocytes — URGENT)", "Lyso-Gb3 (urine + plasma — URGENT)", "GLA gene sequencing", "Full cardiac workup (echo, ECG, Holter, cardiac MRI if available)", "Brain MRI + MRA", "Nerve conduction studies", "Renal biopsy with EM and IF", "24h urine protein, eGFR"],
    genetics: ["GLA full gene sequencing (expedited)", "Mutation amenability check", "Immediate family cascade screening", "Genetic counselling for patient and family"],
    referrals: ["Clinical Genetics (urgent)", "Paediatric Nephrology (urgent)", "Cardiology (urgent)", "Neurology", "Ophthalmology", "Transplant team (if CKD stage 4–5)"],
    transplant_note: "⚠️ Transplant Warning: Kidney transplant corrects renal failure but does NOT stop systemic Gb3 accumulation. ERT must continue post-transplant. Cardiac and neurological evaluation are mandatory pre-transplant listing.",
  },
};

// ─── Action cards ─────────────────────────────────────────────────────────────
const ACTION_CARDS_BASE = [
  { id: "dbs", icon: "🩸", label: "Order DBS Testing", desc: "Dried blood spot alpha-GAL A assay — convenient first-line test", color: "blue" },
  { id: "gla", icon: "🧬", label: "GLA Sequencing", desc: "Full GLA gene sequencing — essential in females and for family cascade", color: "purple" },
  { id: "genetics", icon: "🏥", label: "Refer to Genetics", desc: "Clinical genetics referral for Fabry disease evaluation and counselling", color: "violet" },
  { id: "family", icon: "👨‍👩‍👧", label: "Start Family Screening", desc: "Maternal lineage cascade screening — enzyme in males, GLA sequencing in females", color: "amber" },
  { id: "fabry_pathway", icon: "📋", label: "Open Fabry Pathway", desc: "Full Fabry disease clinical management pathway", color: "teal" },
  { id: "ckd_fsgs", icon: "🫘", label: "CKD / FSGS Overlap Pathways", desc: "Differential diagnosis: FSGS, podocytopathy, inherited nephropathy", color: "indigo" },
];

// ─── Clinical Pearls ──────────────────────────────────────────────────────────
const CLINICAL_PEARLS = [
  { pearl: "Fabry disease may initially present as isolated proteinuria or FSGS — enzyme assay should be part of any unexplained proteinuria workup in children.", highlight: "FSGS / isolated proteinuria" },
  { pearl: "Pediatric neuropathic pain crises are commonly overlooked. Children describe 'aches' or refuse exercise — the classic 'burning' description may be absent in young children.", highlight: "Pediatric pain crises" },
  { pearl: "Family history along the maternal lineage is highly important. Maternal uncles on dialysis or with early stroke are red flags for GLA mutation in the family.", highlight: "Maternal lineage" },
  { pearl: "Alpha-galactosidase A enzyme assay can be NORMAL in heterozygous females. Always perform GLA gene sequencing in females — never rely on enzyme alone.", highlight: "Females: enzyme may be normal" },
  { pearl: "Cornea verticillata is pathognomonic — it is asymptomatic and requires slit-lamp examination. It is present in >70% of classically affected males and many carrier females.", highlight: "Cornea verticillata" },
  { pearl: "The average diagnostic delay in Fabry disease is 10–15 years from symptom onset. Maintaining a low threshold for screening is critical in paediatric nephrology.", highlight: "Diagnostic delay 10–15 years" },
  { pearl: "Lyso-Gb3 (not Gb3) is the sensitive biomarker — elevated in classic males, most carrier females, and some late-onset variants. Useful for monitoring ERT response.", highlight: "Lyso-Gb3 is the key biomarker" },
];

// ─── Longitudinal tracking (localStorage-backed) ─────────────────────────────
function useLongitudinalTracking() {
  const KEY = "fabry_score_history";
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
  const save = (score, level) => {
    const history = load();
    history.push({ date: new Date().toLocaleDateString(), score, level });
    if (history.length > 5) history.shift();
    localStorage.setItem(KEY, JSON.stringify(history));
    return history;
  };
  return { load, save };
}

// ─── Bar chart for SHAP-style contributors ────────────────────────────────────
const BAR_COLORS = {
  blue: "bg-blue-500", violet: "bg-violet-500", red: "bg-red-500",
  amber: "bg-amber-500", pink: "bg-pink-500", teal: "bg-teal-500",
  purple: "bg-purple-500", orange: "bg-orange-500",
};
const MAX_WEIGHT = 6;

function ContributorBar({ item }) {
  const [showRationale, setShowRationale] = useState(false);
  const pct = Math.round((item.weight / MAX_WEIGHT) * 100);
  const barColor = BAR_COLORS[item.color] || "bg-slate-400";
  const rationale = RATIONALES[item.id];

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-700 flex-1 pr-2 font-medium">{item.label}</span>
        <div className="flex items-center gap-1">
          {rationale && (
            <button onClick={() => setShowRationale(!showRationale)} className="text-slate-400 hover:text-violet-600 transition-colors">
              <Info className="w-3 h-3" />
            </button>
          )}
          <span className="font-bold text-slate-800 flex-shrink-0">+{item.weight}</span>
        </div>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${barColor} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-slate-400">{item.domain}</p>
      {showRationale && rationale && (
        <div className="bg-violet-50 border border-violet-200 rounded-lg p-2 text-xs text-violet-800 italic">
          💡 {rationale}
        </div>
      )}
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

// ─── Printable Summary ───────────────────────────────────────────────────────
function PrintSummary({ checked, total, risk, contributors, domainScores, steps, guidance }) {
  const printRef = useRef();

  const handlePrint = () => {
    const content = printRef.current.innerHTML;
    const win = window.open("", "_blank");
    win.document.write(`
      <html><head><title>Fabry Screening Summary</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 13px; color: #1e293b; padding: 24px; }
        h1 { color: #6d28d9; } h2 { color: #374151; font-size: 15px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
        .red { background: #fee2e2; color: #991b1b; } .orange { background: #ffedd5; color: #9a3412; }
        .amber { background: #fef3c7; color: #92400e; } .green { background: #dcfce7; color: #166534; }
        ul { margin: 4px 0; padding-left: 18px; } li { margin: 2px 0; }
        .section { margin-bottom: 16px; }
        .disclaimer { margin-top: 24px; font-size: 11px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 8px; }
      </style></head><body>${content}
      <div class="disclaimer">Generated by CliniCals Hub — Fabry Disease Screening Tool. For clinical decision support only. Always correlate with specialist opinion.</div>
      </body></html>`);
    win.document.close();
    win.print();
  };

  const features = Object.entries(checked).filter(([, v]) => v).map(([k]) => {
    for (const d of DOMAINS) { const f = d.features.find(f => f.id === k); if (f) return `${f.label} (+${f.weight})`; }
    return k;
  });

  return (
    <Card className="bg-white border border-slate-200 shadow-sm">
      <CardHeader className="py-3 px-4 border-b bg-slate-50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2"><Printer className="w-4 h-4 text-slate-500" />Printable Summary</CardTitle>
          <Button size="sm" variant="outline" onClick={handlePrint} className="text-xs h-7">
            <Printer className="w-3 h-3 mr-1" />Print / Export
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div ref={printRef}>
          <h1>Fabry Disease Screening Summary</h1>
          <p style={{ color: "#6b7280", fontSize: "12px" }}>Generated: {new Date().toLocaleDateString()} | CliniCals Hub — Paediatric Nephrology</p>

          <div className="section">
            <h2>Risk Category</h2>
            <p><strong>{risk.level}</strong> — Suspicion Score: {total}</p>
            <p style={{ marginTop: "4px" }}>{guidance.summary}</p>
          </div>

          <div className="section">
            <h2>Patient Features Present ({features.length})</h2>
            <ul>{features.map((f, i) => <li key={i}>{f}</li>)}</ul>
          </div>

          {contributors.length > 0 && (
            <div className="section">
              <h2>Contributor Analysis</h2>
              <ul>{contributors.map((c, i) => <li key={i}>{c.label} — +{c.weight} ({c.domain})</li>)}</ul>
            </div>
          )}

          {steps.investigations.length > 0 && (
            <div className="section">
              <h2>Suggested Investigations</h2>
              <ul>{steps.investigations.map((t, i) => <li key={i}>{t}</li>)}</ul>
            </div>
          )}

          {steps.genetics.length > 0 && (
            <div className="section">
              <h2>Genetic Testing</h2>
              <ul>{steps.genetics.map((g, i) => <li key={i}>{g}</li>)}</ul>
            </div>
          )}

          {steps.referrals.length > 0 && (
            <div className="section">
              <h2>Referral Recommendations</h2>
              <ul>{steps.referrals.map((r, i) => <li key={i}>{r}</li>)}</ul>
            </div>
          )}

          {guidance.transplant_note && (
            <div className="section">
              <h2>Transplant Note</h2>
              <p>{guidance.transplant_note}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function FabryScreeningTool({ isAdmin }) {
  const [checked, setChecked] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [showTeaching, setShowTeaching] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
  const [scoreHistory, setScoreHistory] = useState([]);
  const resultsRef = useRef(null);
  const tracking = useLongitudinalTracking();

  const toggle = (id) => setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  const { total, contributors, domainScores } = scoreFabry(checked);
  const risk = getRisk(total);
  const guidance = GUIDANCE[risk.key];
  const checkedCount = Object.values(checked).filter(Boolean).length;
  const RiskIcon = risk.icon;

  const handleCalculate = () => {
    const history = tracking.save(total, risk.level);
    setScoreHistory(history);
    setSubmitted(true);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  const handleReset = () => { setChecked({}); setSubmitted(false); };

  return (
    <div className="space-y-4 pb-32 relative">
      {/* Header */}
      <div className="bg-gradient-to-br from-violet-700 to-purple-800 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">💜</div>
          <div>
            <h2 className="text-lg font-bold">Fabry Disease Screening Tool</h2>
            <p className="text-violet-200 text-xs">Rare Disease Module by Swarnim · Pediatric Nephrology · Rapid OPD Workflow</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge className="bg-white/20 text-xs">X-linked · GLA Gene</Badge>
          <Badge className="bg-white/20 text-xs">Alpha-Galactosidase A Deficiency</Badge>
          <Badge className="bg-green-400/80 text-xs">Weighted Suspicion Score</Badge>
        </div>
        <p className="text-xs text-violet-200 mt-3">Check ALL features present. Tap ℹ️ next to each contributor for clinical rationale. Tap "Calculate Fabry Risk" for full explainable report.</p>
      </div>

      {/* Live score preview */}
      {checkedCount > 0 && (
        <div className="bg-violet-50 border border-violet-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <Activity className="w-5 h-5 text-violet-600 flex-shrink-0" />
          <div className="flex-1">
            <span className="text-sm font-semibold text-violet-900">Live Score: {total}</span>
            <span className="text-xs text-violet-600 ml-2">({checkedCount} features selected)</span>
          </div>
          <Badge className={risk.badge}>{risk.level}</Badge>
        </div>
      )}

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
                <div key={f.id}
                  className={`flex items-start gap-3 p-2.5 rounded-lg transition-colors cursor-pointer ${checked[f.id] ? "bg-violet-50 border border-violet-200" : "hover:bg-slate-50"}`}
                  onClick={() => toggle(f.id)}>
                  <Checkbox checked={!!checked[f.id]} onCheckedChange={() => toggle(f.id)} className="mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <Label className="text-sm text-slate-800 cursor-pointer leading-tight">{f.label}</Label>
                    {checked[f.id] && RATIONALES[f.id] && (
                      <p className="text-xs text-violet-600 mt-1 italic leading-tight">{RATIONALES[f.id]}</p>
                    )}
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

      {/* Non-sticky inline Calculate Button (always visible) */}
      <div className="bg-white border-2 border-violet-300 rounded-2xl p-4 shadow-md">
        <div className="flex gap-3 mb-3">
          <Button
            onClick={handleCalculate}
            className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm h-12 shadow-lg"
            disabled={checkedCount === 0}
          >
            <Zap className="w-4 h-4 mr-2" />
            {checkedCount === 0 ? "Select features above to calculate" : `Calculate Fabry Risk · ${checkedCount} features · Score ${total}`}
          </Button>
          <Button variant="outline" onClick={handleReset} className="px-4 h-12 border-violet-300">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
        <Alert className="bg-amber-50 border-amber-200 py-2">
          <AlertDescription className="text-xs text-amber-800">
            ⚠️ <strong>Learning Tool Only.</strong> This is an AI-assisted clinical decision support tool for educational purposes. It is <strong>not a diagnostic tool</strong>. All clinical decisions must be made by a qualified clinician. Clinician discretion is advised. <strong>Rare Disease Module by Swarnim.</strong>
          </AlertDescription>
        </Alert>
      </div>

      {/* Sticky floating button for mobile scroll convenience */}
      <div className="fixed bottom-20 right-4 z-50 lg:hidden">
        <Button
          onClick={handleCalculate}
          disabled={checkedCount === 0}
          className="bg-violet-600 hover:bg-violet-700 text-white rounded-full h-14 w-14 shadow-xl p-0 flex items-center justify-center"
          title={`Calculate Fabry Risk (Score: ${total})`}
        >
          <Zap className="w-6 h-6" />
        </Button>
        {checkedCount > 0 && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">{total}</div>
        )}
      </div>

      {/* ─── RESULTS ──────────────────────────────────────────────────────────── */}
      {submitted && (
        <div ref={resultsRef} className="space-y-4 pt-2">

          {/* ── Risk Banner ── */}
          <Alert className={`border-2 ${risk.alert}`}>
            <div className="flex items-start gap-3">
              <RiskIcon className={`w-7 h-7 flex-shrink-0 mt-0.5 ${risk.iconColor}`} />
              <AlertDescription className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="font-bold text-lg">{risk.level}</span>
                  <Badge className={`${risk.badge} text-sm px-3`}>Score: {total}</Badge>
                </div>
                <p className="text-sm leading-relaxed">{guidance.summary}</p>
              </AlertDescription>
            </div>
          </Alert>

          {/* ── Post-Score Action Guidance ── */}
          <Card className="bg-white border border-slate-200 shadow-sm">
            <CardHeader className="py-3 px-4 border-b bg-slate-50">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-violet-500" />Structured Post-Score Guidance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {guidance.actions.map((a, i) => (
                <div key={i} className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <span className="text-xl flex-shrink-0">{a.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{a.label}</p>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{a.detail}</p>
                  </div>
                </div>
              ))}
              {guidance.transplant_note && (
                <Alert className="bg-red-50 border-red-300">
                  <AlertDescription className="text-xs text-red-800 font-medium">{guidance.transplant_note}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* ── SHAP contributor bars ── */}
          {contributors.length > 0 && (
            <Card className="bg-white border border-slate-200 shadow-sm">
              <CardHeader className="py-3 px-4 border-b bg-slate-50">
                <CardTitle className="text-sm">Explainable Risk Analysis — Contributor Breakdown</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">Tap ℹ️ on each feature for clinical rationale. Bar length = relative weight.</p>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {contributors.map((c, i) => <ContributorBar key={i} item={c} />)}
              </CardContent>
            </Card>
          )}

          {/* ── Domain Summary ── */}
          {Object.keys(domainScores).length > 0 && (
            <Card className="bg-white border border-slate-200 shadow-sm">
              <CardHeader className="py-3 px-4 border-b bg-slate-50">
                <CardTitle className="text-sm">Domain Contribution Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.values(domainScores).map((d, i) => (
                    <div key={i} className="bg-violet-50 border border-violet-200 rounded-xl p-3 text-center">
                      <span className="text-2xl">{d.icon}</span>
                      <p className="text-xs font-semibold text-violet-900 mt-1 leading-tight">{d.label}</p>
                      <p className="text-xl font-bold text-violet-700">+{d.score}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Investigations + Genetics + Referrals ── */}
          {(guidance.investigations.length > 0 || guidance.genetics.length > 0 || guidance.referrals.length > 0) && (
            <Card className="bg-indigo-50 border border-indigo-200 shadow-sm">
              <CardHeader className="py-3 px-4 border-b border-indigo-200">
                <CardTitle className="text-sm text-indigo-900 flex items-center gap-2"><FlaskConical className="w-4 h-4" />Investigations, Genetics & Referrals</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {guidance.investigations.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-indigo-800 uppercase mb-2">Suggested Investigations</p>
                    <div className="space-y-1">
                      {guidance.investigations.map((t, i) => (
                        <div key={i} className="flex items-start gap-2 bg-white rounded-lg p-2 text-xs text-indigo-900">
                          <ChevronRight className="w-3 h-3 flex-shrink-0 mt-0.5 text-indigo-400" />{t}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {guidance.genetics.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-purple-800 uppercase mb-2">🧬 Genetic Testing</p>
                    <div className="space-y-1">
                      {guidance.genetics.map((g, i) => (
                        <div key={i} className="flex items-start gap-2 bg-purple-50 rounded-lg p-2 text-xs text-purple-900">
                          <ChevronRight className="w-3 h-3 flex-shrink-0 mt-0.5 text-purple-400" />{g}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {guidance.referrals.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-blue-800 uppercase mb-2">Specialist Referrals</p>
                    <div className="flex flex-wrap gap-2">
                      {guidance.referrals.map((r, i) => (
                        <Badge key={i} className="bg-blue-100 text-blue-800 text-xs">{r}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* ── Dedicated Action Cards ── */}
          {total > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-600 uppercase mb-2 tracking-wide">Quick Action Cards</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {ACTION_CARDS_BASE.map((a) => (
                  <div key={a.id} className="bg-white border border-slate-200 rounded-xl p-3 hover:border-violet-300 hover:shadow-sm transition-all cursor-pointer">
                    <span className="text-xl">{a.icon}</span>
                    <p className="text-xs font-bold text-slate-800 mt-1 leading-tight">{a.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-tight">{a.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Family Screening ── */}
          {total >= 4 && (
            <Card className="bg-white border border-amber-200 shadow-sm">
              <CardHeader className="py-3 px-4 border-b bg-amber-50">
                <CardTitle className="text-sm text-amber-900 flex items-center gap-2"><Users className="w-4 h-4" />Family Screening Guidance</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                <div className="bg-amber-50 rounded-lg p-3 space-y-1">
                  <p className="font-semibold text-amber-900 text-sm">Maternal Lineage Review (X-linked inheritance)</p>
                  <ul className="text-xs space-y-1 text-amber-800">
                    <li>• Patient's mother: likely carrier — GLA sequencing + enzyme assay + lyso-Gb3</li>
                    <li>• Maternal uncles: 50% risk of being affected — enzyme assay</li>
                    <li>• Patient's sisters: 50% carrier risk — GLA sequencing</li>
                    <li>• Patient's daughters (if female): obligate carriers — screen and counsel</li>
                    <li>• Patient's sons (if male): unaffected (receive Y chromosome)</li>
                  </ul>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-900">
                  <strong>Sibling Screening:</strong> Male siblings → enzyme assay urgently. Female siblings → GLA sequencing (enzyme may be normal in carriers).
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Clinical Pearls ── */}
          <Card className="bg-white border border-yellow-200 shadow-sm">
            <CardHeader className="py-3 px-4 border-b bg-yellow-50">
              <CardTitle className="text-sm text-yellow-900 flex items-center gap-2"><Lightbulb className="w-4 h-4" />Clinical Pearls — Fabry Disease</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              {CLINICAL_PEARLS.map((p, i) => (
                <div key={i} className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <span className="text-base flex-shrink-0">💡</span>
                  <div>
                    <Badge className="bg-yellow-200 text-yellow-900 text-xs mb-1">{p.highlight}</Badge>
                    <p className="text-xs text-slate-700 leading-relaxed">{p.pearl}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* ── Longitudinal Tracking ── */}
          <Card className="bg-white border border-slate-200 shadow-sm">
            <button
              className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 text-left rounded-t-xl"
              onClick={() => setShowTracking(!showTracking)}
            >
              <span className="font-semibold text-sm text-slate-800 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-violet-500" />Longitudinal Risk Tracking
              </span>
              {showTracking ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showTracking && (
              <CardContent className="p-4 border-t border-slate-100 space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  {(scoreHistory.length > 0 ? scoreHistory : [{ date: "—", score: "—", level: "No history" }, { date: "—", score: "—", level: "" }, { date: new Date().toLocaleDateString(), score: total, level: risk.level }]).slice(-3).map((h, i, arr) => (
                    <div key={i} className={`rounded-xl p-3 text-center border ${i === arr.length - 1 ? "bg-violet-50 border-violet-300" : "bg-slate-50 border-slate-200"}`}>
                      <p className="text-xs text-slate-500">{h.date}</p>
                      <p className="text-xl font-bold text-violet-700">{h.score}</p>
                      <p className="text-xs text-slate-600 leading-tight">{h.level}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-violet-50 border border-violet-200 rounded-lg p-3 text-xs text-violet-800">
                  <strong>Evolving Suspicion Trend:</strong> Scores are saved locally in this browser session. If score increases across visits, consider escalating to formal genetics referral. New features appearing over time (cornea verticillata, LVH, proteinuria) are each independent triggers for re-evaluation.
                </div>
                {scoreHistory.length > 1 && scoreHistory[scoreHistory.length - 1]?.score > scoreHistory[scoreHistory.length - 2]?.score && (
                  <Alert className="bg-orange-50 border-orange-300">
                    <AlertDescription className="text-xs text-orange-800 font-medium">
                      ⬆️ Suspicion score has increased since last visit. Consider escalating evaluation.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            )}
          </Card>

          {/* ── Printable Summary ── */}
          <PrintSummary
            checked={checked}
            total={total}
            risk={risk}
            contributors={contributors}
            domainScores={domainScores}
            steps={guidance}
            guidance={guidance}
          />
        </div>
      )}

      {/* ── Teaching Layer ── */}
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

      {/* Admin Note */}
      {isAdmin && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertDescription className="text-xs text-amber-800">
            <strong>Admin:</strong> Scoring weights, thresholds, and references are editable via the RareDiseaseContent entity (content_type: "pathway", section_id: "fabry_screening").
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}