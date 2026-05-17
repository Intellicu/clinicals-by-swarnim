import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Thermometer, Search, X, ChevronDown, ChevronUp,
  AlertCircle, Activity, Baby, Users, Zap, Brain,
  GitBranch, Calculator, BookOpen, Stethoscope, Layers,
  ChevronRight, ArrowLeft, Shield, TestTube
} from "lucide-react";

// ── Endocrinology Conditions ──────────────────────────────────────────────────
const ENDO_CONDITIONS = [
  {
    id: "t1dm", name: "Type 1 Diabetes Mellitus", category: "Diabetes",
    urgency: "critical", guideline: "ISPAD 2022 · ADA 2024",
    overview: "Autoimmune destruction of pancreatic β-cells leading to absolute insulin deficiency. Presents with polyuria, polydipsia, weight loss. DKA in up to 30% at presentation.",
    criteria: ["Fasting glucose ≥126 mg/dL", "Random glucose ≥200 mg/dL + symptoms", "HbA1c ≥6.5%", "Positive islet autoantibodies (GAD65, IA-2, ZnT8)", "C-peptide very low/undetectable"],
    management: ["Start basal-bolus insulin immediately (0.5–1 U/kg/day)", "Insulin pump (CSII) if available — preferred in young children", "CGM monitoring — target TIR >70%", "HbA1c target <7% (53 mmol/mol)", "Carbohydrate counting education", "DKA prevention protocol — sick day rules", "Annual screening: nephropathy (UACR), retinopathy, neuropathy, thyroid, celiac"],
    danger_signs: ["DKA — vomiting, Kussmaul breathing, altered consciousness", "Severe hypoglycemia — seizure, loss of consciousness", "Hyperosmolar state", "Recurrent DKA (non-adherence)"],
    monitoring: ["HbA1c every 3 months", "CGM/SMBG daily", "Annual urine ACR", "Annual ophthalmology", "Thyroid function yearly", "Growth and pubertal staging every visit"],
    badge: "Diabetes", color: "orange"
  },
  {
    id: "t2dm", name: "Type 2 Diabetes Mellitus (Pediatric)", category: "Diabetes",
    urgency: "high", guideline: "ADA 2024 · ISPAD 2022",
    overview: "Increasingly common in obese adolescents. Insulin resistance with relative deficiency. Often asymptomatic — found on screening. Aggressive management needed to prevent early complications.",
    criteria: ["BMI >85th percentile + risk factors", "Fasting glucose ≥126 mg/dL on 2 occasions", "HbA1c ≥6.5%", "Negative autoantibodies (distinguishes from T1DM)", "Family history, acanthosis nigricans"],
    management: ["Metformin first-line (500–2000 mg/day)", "Lifestyle modification — diet + exercise", "Insulin if symptomatic or HbA1c >9%", "SGLT2i/GLP-1 agonists if ≥10 years (ADA 2024)", "BP control: ACEi if hypertensive", "Lipid management: statin if LDL >130 mg/dL"],
    danger_signs: ["Hyperosmolar hyperglycemic state (HHS)", "Severe symptomatic hyperglycemia", "DKA (less common but occurs)"],
    monitoring: ["HbA1c every 3 months initially", "Annual nephropathy screen", "Lipid panel annually", "Blood pressure every visit", "NAFLD screening (ALT, USS)"],
    badge: "Diabetes", color: "amber"
  },
  {
    id: "dka", name: "Diabetic Ketoacidosis (DKA)", category: "Emergency",
    urgency: "critical", guideline: "ISPAD 2022 · BSPED",
    overview: "Life-threatening metabolic emergency. pH <7.3, bicarbonate <15, ketonemia/ketonuria. Cerebral edema is the most feared complication (0.5–1% of DKA episodes).",
    criteria: ["Blood glucose >200 mg/dL", "Venous pH <7.3 or HCO3 <15 mEq/L", "Ketonemia >3 mmol/L or moderate-large ketonuria", "Mild: pH 7.2–7.3; Moderate: 7.1–7.2; Severe: <7.1"],
    management: ["Resuscitation: 10 mL/kg 0.9% NaCl bolus (repeat if shock)", "Rehydration over 48h — deficit + maintenance (avoid rapid)", "Insulin infusion: 0.05–0.1 U/kg/hr (NOT until 1–2h of fluids)", "Potassium replacement: add K to fluids once urine output established", "Never use bicarbonate", "Transition to SC insulin when pH >7.3, tolerating orally", "Monitor: glucose hourly, electrolytes 2-4 hourly, ECG"],
    danger_signs: ["Cerebral edema: headache, bradycardia, rising BP, altered GCS", "Severe hypokalemia (ECG changes)", "Hypoglycemia during treatment", "Aspiration risk — NG tube if vomiting"],
    monitoring: ["Hourly capillary glucose", "2-4 hourly electrolytes", "Continuous ECG during treatment", "Neurological obs every 30 min", "Strict fluid balance"],
    badge: "Emergency", color: "red"
  },
  {
    id: "ghd", name: "Growth Hormone Deficiency (GHD)", category: "Growth",
    urgency: "moderate", guideline: "ESPE 2016 · GH Research Society",
    overview: "Deficient GH secretion causing growth failure, delayed bone age, increased adiposity. Can be isolated or part of panhypopituitarism. Diagnosis requires stimulation testing.",
    criteria: ["Height SDS <-2 or height velocity <25th centile", "GH peak <10 µg/L on 2 stimulation tests (many centres use <7)", "Low IGF-1 for age/sex", "Delayed bone age", "MRI pituitary (midline defects, small pituitary)"],
    management: ["rhGH: 0.025–0.05 mg/kg/day SC nightly", "Transition therapy at puberty (higher doses)", "Monitor: IGF-1 (target 0 to +2 SDS)", "Review thyroid, cortisol, gonadotropins (panhypo screen)", "Bone age annually", "Reassess need after final height"],
    danger_signs: ["Panhypopituitarism — cortisol deficiency (adrenal crisis)", "Hypothyroidism", "Intracranial hypertension (rare)", "Slipped capital femoral epiphysis"],
    monitoring: ["Height velocity every 3–6 months", "IGF-1 every 6 months", "Annual bone age", "Fasting glucose/HbA1c", "Thyroid function 6-monthly"],
    badge: "Growth", color: "blue"
  },
  {
    id: "hypo", name: "Hypothyroidism (Congenital & Acquired)", category: "Thyroid",
    urgency: "high", guideline: "ETA · ATA 2014",
    overview: "Congenital hypothyroidism — commonest preventable cause of intellectual disability (1:3000). Acquired Hashimoto's thyroiditis is the commonest thyroid disorder in children.",
    criteria: ["TSH >10 mIU/L (borderline 5–10)", "Free T4 low or low-normal", "Anti-TPO/Anti-Tg antibodies (Hashimoto)", "Screening TSH elevated on newborn screen (congenital)", "Goitre on examination"],
    management: ["Levothyroxine: 10–15 µg/kg/day (neonate), 4–5 µg/kg/day (older)", "Take on empty stomach", "Target TSH: 0.5–2.5 mIU/L (neonate: 0.5–2)", "Dose adjust every 4–6 weeks until stable", "Lifelong replacement if permanent"],
    danger_signs: ["Myxedema coma (rare — severe hypothyroidism)", "Cardiac failure (pericardial effusion)", "Pseudo-precocious puberty (Van Wyk-Grumbach)", "Intellectual disability if untreated congenital"],
    monitoring: ["TFT every 4–6 weeks (initial), then 6-monthly", "Growth and pubertal staging", "Bone age if delayed", "Lipid profile if prolonged hypothyroidism"],
    badge: "Thyroid", color: "teal"
  },
  {
    id: "cah", name: "Congenital Adrenal Hyperplasia (CAH)", category: "Adrenal",
    urgency: "critical", guideline: "Endocrine Society 2018 · ESPE",
    overview: "Most commonly 21-hydroxylase deficiency — impaired cortisol (and aldosterone) synthesis with androgen excess. Classical CAH (salt-wasting or simple virilizing) vs non-classical CAH.",
    criteria: ["Elevated 17-OHP (>100 nmol/L classic; 6–100 non-classic)", "Adrenal crisis: hyponatremia, hyperkalemia, hypoglycemia in neonate", "Virilization of female genitalia (46,XX DSD)", "Precocious puberty / advanced bone age in males", "ACTH stimulation test for non-classic"],
    management: ["Hydrocortisone: 10–15 mg/m²/day in 3 divided doses", "Fludrocortisone: 50–100 µg/day (salt-wasting)", "Salt supplements in infancy", "Stress dosing: 3× hydrocortisone during illness/surgery", "Never miss doses — adrenal crisis risk", "Girls: genital surgery discussion with family"],
    danger_signs: ["Adrenal crisis: shock, vomiting, hypoglycemia", "Salt-wasting crisis in neonate (day 7–14 of life)", "Over-treatment — Cushingoid features, growth suppression", "Under-treatment — androgen excess, poor growth"],
    monitoring: ["17-OHP, androstenedione every 3–4 months", "Renin (salt-wasting — target upper normal)", "Growth velocity and bone age", "Blood pressure every visit", "DEXA scan (adult transition)"],
    badge: "Adrenal", color: "yellow"
  },
  {
    id: "precocious_puberty", name: "Precocious Puberty", category: "Puberty",
    urgency: "moderate", guideline: "Endocrine Society 2009",
    overview: "Central precocious puberty (CPP) — GnRH-dependent, <8y girls / <9y boys. Peripheral precocious puberty (PPP) — GnRH-independent (CAH, McCune-Albright, tumors).",
    criteria: ["Breast development <8y in girls, testicular enlargement <9y in boys", "Pubertal LH/FSH on stimulated testing (GnRH agonist test)", "Advanced bone age (>2 SD)", "MRI brain — exclude intracranial pathology", "Pelvic USS (ovarian/uterine development)"],
    management: ["GnRH agonist (leuprolide/triptorelin) for CPP", "Depot injection every 28 days or 3-monthly", "Address underlying cause for PPP", "Psychosocial support for child and family", "Monitor until pubertal age to restart — pause GnRHa"],
    danger_signs: ["Intracranial pathology — headache, visual changes", "Rapid progression", "Severe psychological distress", "McCune-Albright — fibrous dysplasia fractures"],
    monitoring: ["Height and bone age every 6 months", "LH/FSH levels (suppression check)", "Pubertal staging every 3–6 months", "Pelvic USS follow-up"],
    badge: "Puberty", color: "violet"
  },
  {
    id: "diabetes_insipidus", name: "Diabetes Insipidus (DI)", category: "Pituitary",
    urgency: "high", guideline: "Endocrine Society 2016",
    overview: "Central DI (AVP deficiency) vs nephrogenic DI (AVP resistance). Presents with polyuria, polydipsia, dilute urine. Risk of severe dehydration and hypernatremia.",
    criteria: ["Urine output >4 mL/kg/hr (child) / >2 L/m²/day", "Urine osmolality <300 mOsm/kg with high serum osmolality", "Water deprivation test: urine not concentrated", "Response to DDAVP (central DI) vs no response (nephrogenic)"],
    management: ["Central DI: DDAVP (desmopressin) — nasal/oral/SC", "Intranasal DDAVP: 5–20 µg OD-BD", "Nephrogenic DI: hydrochlorothiazide + amiloride ± indomethacin", "Adequate fluid intake — regulated thirst mechanism", "Low-solute diet (nephrogenic)"],
    danger_signs: ["Severe hypernatremia — seizure, brain damage", "Over-treatment with DDAVP — hyponatremia, seizure", "Rapid correction of hypernatremia — cerebral edema"],
    monitoring: ["Serum Na daily initially, then per clinical need", "Urine osmolality", "Fluid balance strictly", "Weight (detect fluid shifts)"],
    badge: "Pituitary", color: "indigo"
  },
];

const CATEGORIES = ["All", "Diabetes", "Emergency", "Growth", "Thyroid", "Adrenal", "Puberty", "Pituitary"];

const URGENCY_CONFIG = {
  critical: { label: "Critical", color: "bg-red-100 text-red-700 border-red-200" },
  high: { label: "High", color: "bg-amber-100 text-amber-700 border-amber-200" },
  moderate: { label: "Moderate", color: "bg-blue-100 text-blue-700 border-blue-200" },
};

const COLOR_MAP = {
  orange: "border-orange-200 bg-orange-50",
  amber: "border-amber-200 bg-amber-50",
  red: "border-red-200 bg-red-50",
  blue: "border-blue-200 bg-blue-50",
  teal: "border-teal-200 bg-teal-50",
  yellow: "border-yellow-200 bg-yellow-50",
  violet: "border-violet-200 bg-violet-50",
  indigo: "border-indigo-200 bg-indigo-50",
};

function ConditionCard({ c }) {
  const [open, setOpen] = useState(false);
  const urg = URGENCY_CONFIG[c.urgency] || URGENCY_CONFIG.moderate;
  const cardColor = COLOR_MAP[c.color] || COLOR_MAP.orange;

  return (
    <div className={`rounded-xl border-2 ${cardColor} overflow-hidden shadow-sm`}>
      <button onClick={() => setOpen(o => !o)}
        className="w-full text-left px-4 py-3 flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-slate-900">{c.name}</span>
            <Badge className={`text-xs border ${urg.color}`}>{urg.label}</Badge>
            <Badge variant="outline" className="text-xs">{c.badge}</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{c.guideline}</p>
          {!open && <p className="text-xs text-slate-600 mt-1 line-clamp-2">{c.overview}</p>}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-slate-200/60 pt-3">
          <p className="text-xs text-slate-700 leading-relaxed">{c.overview}</p>

          {[
            { title: "📋 Diagnostic Criteria", items: c.criteria, color: "bg-blue-50 border-blue-200" },
            { title: "🚨 Danger Signs", items: c.danger_signs, color: "bg-red-50 border-red-200" },
            { title: "🩺 Management", items: c.management, color: "bg-green-50 border-green-200" },
            { title: "📊 Monitoring", items: c.monitoring, color: "bg-purple-50 border-purple-200" },
          ].map(s => (
            <div key={s.title} className={`rounded-lg p-3 border ${s.color}`}>
              <p className="text-xs font-bold text-slate-700 mb-2">{s.title}</p>
              <ul className="space-y-1">
                {s.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-slate-700">
                    <span className="text-orange-400 font-bold min-w-[16px] mt-0.5">{i + 1}.</span>{item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const QUICK_LINKS = [
  { name: "DKA Protocol", icon: AlertCircle, page: "EmergencyHub", color: "bg-red-600" },
  { name: "Calculators", icon: Calculator, page: "CalculatorsHub", color: "bg-blue-600" },
  { name: "Drug Dosing", icon: Stethoscope, page: "DrugsDosing", color: "bg-violet-600" },
  { name: "Clinical Pathways", icon: GitBranch, page: "ClinicalSupport", color: "bg-sky-700" },
  { name: "Pathway Builder", icon: Layers, page: "PathwayBuilder", color: "bg-purple-600" },
  { name: "Research", icon: BookOpen, page: "ResearchHub", color: "bg-slate-600" },
];

export default function PediatricEndocrinology() {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = ENDO_CONDITIONS.filter(c => {
    const q = search.toLowerCase();
    const match = [c.name, c.category, c.overview, c.badge].join(" ").toLowerCase().includes(q);
    return (category === "All" || c.category === category) && (!search || match);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 px-4 py-5 shadow-xl">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <Link to={createPageUrl("Hub")}>
              <button className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <ArrowLeft className="w-4 h-4 text-white" />
              </button>
            </Link>
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Thermometer className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-white">Pediatric Endocrinology</h1>
              <p className="text-orange-100 text-xs">
                {ENDO_CONDITIONS.length}+ conditions · Diabetes · Growth · Thyroid · Adrenal · Puberty
              </p>
            </div>
          </div>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search conditions, e.g. DKA, thyroid, CAH…"
              className="w-full pl-9 pr-9 py-2.5 text-sm rounded-xl border-0 bg-white/90 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/50" />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-3 pt-3 pb-20 space-y-3">

        {/* Info banner */}
        <Alert className="bg-orange-50 border-orange-200">
          <BookOpen className="w-4 h-4 text-orange-600" />
          <AlertDescription className="text-xs text-orange-900">
            <strong>Pediatric Endocrinology Pathways</strong> — ISPAD 2022, ADA 2024, Endocrine Society, ESPE guidelines. Covers diabetes, growth, thyroid, adrenal and pubertal disorders.
          </AlertDescription>
        </Alert>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Total", count: ENDO_CONDITIONS.length, color: "bg-orange-50 border-orange-200 text-orange-700" },
            { label: "Critical", count: ENDO_CONDITIONS.filter(c => c.urgency === "critical").length, color: "bg-red-50 border-red-200 text-red-700" },
            { label: "High", count: ENDO_CONDITIONS.filter(c => c.urgency === "high").length, color: "bg-amber-50 border-amber-200 text-amber-700" },
            { label: "Showing", count: filtered.length, color: "bg-slate-50 border-slate-200 text-slate-700" },
          ].map(s => (
            <div key={s.label} className={`p-2 rounded-xl border-2 text-center ${s.color}`}>
              <p className="text-lg font-bold">{s.count}</p>
              <p className="text-xs font-semibold">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <Button key={cat} size="sm"
              variant={category === cat ? "default" : "outline"}
              onClick={() => setCategory(cat)}
              className={`text-xs h-7 ${category === cat ? "bg-orange-600 hover:bg-orange-700" : ""}`}>
              {cat}
            </Button>
          ))}
        </div>

        {/* Quick links */}
        <div>
          <p className="text-xs font-bold text-slate-600 mb-2">Quick Access</p>
          <div className="grid grid-cols-3 gap-2">
            {QUICK_LINKS.map(link => {
              const Icon = link.icon;
              return (
                <Link key={link.name} to={createPageUrl(link.page)}>
                  <div className={`${link.color} rounded-xl px-3 py-2.5 flex items-center gap-2 text-white active:scale-95 transition-transform`}>
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="text-xs font-semibold leading-tight">{link.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Condition cards */}
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">No conditions match your search</div>
        ) : (
          filtered.map(c => <ConditionCard key={c.id} c={c} />)
        )}

      </div>
    </div>
  );
}