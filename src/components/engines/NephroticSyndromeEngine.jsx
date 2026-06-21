/**
 * Nephrotic Syndrome Intelligence Engine — CIEE Integrated
 * Full LEILA-style: First episode → relapse → FRNS → SDNS → SRNS → Congenital
 * CIEE: 7-component patent architecture (PatientContextLayer, PrescriptionSuppressor,
 *        TraceabilityLinker, MonitoringRuleGenerator, PathwayExecutionEngine)
 */
import React, { useState } from "react";
import {
  EngineHeader, QuestionCard, MultiChoiceCard, PathwayTrail,
  DifferentialTable, InvestigationPanel, MonitoringPanel,
  GuidelineSource, RiskBadge, ResultHeader, ReasoningPanel, TreatmentPanel, EmergencyBanner
} from "./EngineShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle, ArrowRight, CheckCircle2, ShieldCheck, ShieldAlert,
  Activity, Dna, FlaskConical, ChevronRight, AlertCircle, BookOpen
} from "lucide-react";
import {
  buildTraceabilityLink, checkPrescriptionSuppressor,
  generateMonitoringRules, GUIDELINE_SOURCES, SRNS_PATHWAY
} from "@/lib/CIEEEngine";
import CIEEEngineRunner from "@/components/clinical-ai/CIEEEngineRunner";
import { SSNS_PATHWAY, SSNS_SOURCES } from "@/lib/engines/ssnsEngine";

// ── CIEE Sub-components ───────────────────────────────────────────────────────

function TraceabilityBadge({ sourceId }) {
  const gs = GUIDELINE_SOURCES[sourceId];
  if (!gs) return null;
  return (
    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
      <ShieldCheck className="w-3 h-3 text-slate-400 flex-shrink-0" />
      <span className="text-[10px] text-slate-500">{gs.guideline_name}</span>
      {gs.evidence_grade && (
        <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">
          Grade {gs.evidence_grade}
        </span>
      )}
      {gs.pmid && (
        <span className="text-[9px] text-slate-400">PMID {gs.pmid}</span>
      )}
    </div>
  );
}

function SuppressionBanner({ drug, cieeCtx }) {
  const check = checkPrescriptionSuppressor(drug, {
    ...cieeCtx,
    genetic_variant_status: (cieeCtx.acmg_class === 'Pathogenic' || cieeCtx.acmg_class === 'Likely Pathogenic') ? 'PATHOGENIC' : 'UNKNOWN',
  });
  if (!check.suppressed) return null;
  return (
    <div className="bg-red-50 border-2 border-red-400 rounded-xl px-4 py-3 flex items-start gap-2">
      <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-bold text-red-800">CIEE PrescriptionSuppressor — CNI BLOCKED</p>
        <p className="text-xs text-red-700 mt-0.5">{check.reason}</p>
        <TraceabilityBadge sourceId={check.guideline_source_id} />
      </div>
    </div>
  );
}

function CIEEMonitoringPanel({ drugs = [], cieeCtx = {} }) {
  const rules = generateMonitoringRules(drugs, cieeCtx);
  if (!rules.length) return null;
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
      <div className="flex items-center gap-1.5 mb-2">
        <Activity className="w-3.5 h-3.5 text-slate-500" />
        <span className="text-xs font-bold text-slate-700">CIEE Monitoring Rules</span>
        <Badge variant="outline" className="text-[9px] py-0">MonitoringRuleGenerator</Badge>
      </div>
      <div className="space-y-1.5">
        {rules.map((r, i) => (
          <div key={i} className="bg-white rounded p-2 border border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-800">{r.monitoring_parameter}</span>
              <span className="text-[10px] text-slate-500">{r.frequency}</span>
            </div>
            <div className="flex gap-1 mt-0.5 flex-wrap">
              <span className="text-[10px] text-slate-600">Target: {r.target_value}</span>
              {r.alert_condition && (
                <span className="text-[9px] text-red-600">⚠ {r.alert_condition}</span>
              )}
            </div>
            {r.evidence_grade && (
              <span className="text-[9px] bg-slate-100 text-slate-600 px-1 rounded">Grade {r.evidence_grade}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Context-driven option recommendation (patent: context-divergent execution).
// Highlights the option that the entered PatientContext vector implies.
function recommendIndex(node, ctx) {
  if (node.id === 'DN-05' && ctx.acmg_class) {
    const p = ctx.acmg_class === 'Pathogenic' || ctx.acmg_class === 'Likely Pathogenic' || ctx.genetic_variant_status === 'PATHOGENIC';
    return p ? 0 : 1;
  }
  if (node.id === 'DN-06' && ctx.biopsy_histology && ctx.biopsy_histology !== 'Unknown') {
    return (ctx.biopsy_histology || '').toUpperCase().includes('FSGS') ? 0 : 1;
  }
  if (node.id === 'DN-12' && typeof ctx.tdm_in_range === 'boolean') return ctx.tdm_in_range ? 0 : 1;
  if (node.id === 'DN-17' && typeof ctx.dialysis_status === 'boolean') return ctx.dialysis_status ? 0 : 1;
  return -1;
}


function PatientContextPanel({ cieeCtx, setCieeCtx, onDone }) {
  const field = (key, label, placeholder, type = 'text') => (
    <div>
      <label className="text-xs font-semibold text-slate-700 mb-1 block">{label}</label>
      <Input
        type={type}
        value={cieeCtx[key] || ''}
        onChange={e => setCieeCtx(c => ({ ...c, [key]: e.target.value }))}
        placeholder={placeholder}
        className="text-sm h-8"
      />
    </div>
  );
  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <FlaskConical className="w-4 h-4 text-indigo-700" />
        <span className="text-sm font-bold text-indigo-800">CIEE PatientContextLayer</span>
        <Badge className="bg-indigo-600 text-[10px]">Component 3</Badge>
      </div>
      <p className="text-[11px] text-indigo-600">
        Enter patient parameters to enable CIEE PrescriptionSuppressor and TraceabilityLinker.
        This context is threaded through all pathway decisions.
      </p>
      <div className="grid grid-cols-2 gap-2">
        {field('age_months', 'Age (months)', 'e.g. 36', 'number')}
        {field('weight_kg', 'Weight (kg)', 'e.g. 14.5', 'number')}
        {field('height_cm', 'Height (cm)', 'e.g. 95 (Schwartz GFR)', 'number')}
        {field('creatinine_mg_dL', 'Creatinine (mg/dL)', 'e.g. 0.4', 'number')}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs font-semibold text-slate-700 mb-1 block">ACMG Variant Class</label>
          <select
            value={cieeCtx.acmg_class || ''}
            onChange={e => setCieeCtx(c => ({ ...c, acmg_class: e.target.value }))}
            className="w-full text-sm h-8 px-2 border rounded-md bg-white"
          >
            <option value="">Unknown</option>
            <option value="Pathogenic">Pathogenic</option>
            <option value="Likely Pathogenic">Likely Pathogenic</option>
            <option value="VUS">VUS</option>
            <option value="Likely Benign">Likely Benign</option>
            <option value="Benign">Benign</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-700 mb-1 block">Gene (if known)</label>
          <select
            value={cieeCtx.genetic_gene || ''}
            onChange={e => setCieeCtx(c => ({ ...c, genetic_gene: e.target.value }))}
            className="w-full text-sm h-8 px-2 border rounded-md bg-white"
          >
            <option value="">Unknown</option>
            {['NPHS1','NPHS2','WT1','LAMB2','PLCE1','TRPC6','INF2','ACTN4','CD2AP','COL4A3','COL4A4','COL4A5'].map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-700 mb-1 block">Biopsy Histology</label>
        <select
          value={cieeCtx.biopsy_histology || ''}
          onChange={e => setCieeCtx(c => ({ ...c, biopsy_histology: e.target.value }))}
          className="w-full text-sm h-8 px-2 border rounded-md bg-white"
        >
          <option value="">Not yet done / Unknown</option>
          <option value="MCD">MCD — Minimal Change Disease</option>
          <option value="FSGS">FSGS — Focal Segmental Glomerulosclerosis</option>
          <option value="FSGS-tip">FSGS — Tip Lesion variant</option>
          <option value="FSGS-collapsing">FSGS — Collapsing variant</option>
          <option value="DMS">DMS — Diffuse Mesangial Sclerosis</option>
          <option value="MN">MN — Membranous Nephropathy</option>
          <option value="MPGN">MPGN</option>
          <option value="IgAN">IgA Nephropathy</option>
        </select>
      </div>
      {cieeCtx.height_cm && cieeCtx.creatinine_mg_dL && (
        <div className="bg-white rounded-lg p-2 border border-indigo-100">
          <p className="text-[10px] text-indigo-600 font-semibold">
            Schwartz eGFR = (0.413 × {cieeCtx.height_cm}) / {cieeCtx.creatinine_mg_dL} ={' '}
            <span className="text-indigo-900 font-bold">
              {((0.413 * parseFloat(cieeCtx.height_cm)) / parseFloat(cieeCtx.creatinine_mg_dL)).toFixed(1)} mL/min/1.73m²
            </span>
          </p>
        </div>
      )}
      <Button onClick={onDone} className="w-full bg-indigo-600 text-white text-sm h-9">
        <ChevronRight className="w-4 h-4 mr-1" />
        Continue to Clinical Pathway
      </Button>
      <button onClick={onDone} className="w-full text-[11px] text-indigo-500 underline text-center">
        Skip — start without patient context
      </button>
    </div>
  );
}

// ── Main Engine ───────────────────────────────────────────────────────────────

const INITIAL = { step: 0, answers: {}, trail: ["Edema / Proteinuria Query"] };
const INITIAL_CIEE_CTX = {
  age_months: '', weight_kg: '', height_cm: '', creatinine_mg_dL: '',
  acmg_class: '', genetic_gene: '', biopsy_histology: '',
};

export default function NephroticSyndromeEngine() {
  const [state, setState] = useState(INITIAL);
  const [cieeCtx, setCieeCtx] = useState(INITIAL_CIEE_CTX);
  const [showCtxPanel, setShowCtxPanel] = useState(true);
  const { step, answers, trail } = state;

  const ans = (key, val, label) => setState(s => ({
    step: s.step + 1,
    answers: { ...s.answers, [key]: val },
    trail: [...s.trail, label]
  }));
  const reset = () => { setState(INITIAL); setShowCtxPanel(true); };

  // Seed the pathway context vector from the PatientContextLayer inputs.
  const buildStepperCtx = () => ({
    age_months: parseFloat(cieeCtx.age_months) || null,
    weight_kg: parseFloat(cieeCtx.weight_kg) || null,
    height_cm: parseFloat(cieeCtx.height_cm) || null,
    creatinine_mg_dL: parseFloat(cieeCtx.creatinine_mg_dL) || null,
    acmg_class: cieeCtx.acmg_class || '',
    genetic_gene: cieeCtx.genetic_gene || null,
    genetic_variant_status: (cieeCtx.acmg_class === 'Pathogenic' || cieeCtx.acmg_class === 'Likely Pathogenic') ? 'PATHOGENIC' : 'UNKNOWN',
    biopsy_histology: cieeCtx.biopsy_histology || 'Unknown',
  });

  // ── CIEE PatientContextPanel (shown first) ────────────────────────────────
  if (showCtxPanel) return (
    <div className="space-y-3">
      <EngineHeader title="Nephrotic Syndrome Engine" subtitle="First Episode · Relapse · FRNS · SDNS · SRNS · Congenital" color="violet" onReset={reset} />
      <PatientContextPanel cieeCtx={cieeCtx} setCieeCtx={setCieeCtx} onDone={() => setShowCtxPanel(false)} />
    </div>
  );

  // ── Step 0: Confirm nephrotic syndrome ────────────────────────────────────
  if (step === 0) return (
    <div className="space-y-3">
      <EngineHeader title="Nephrotic Syndrome Engine" subtitle="First Episode · Relapse · FRNS · SDNS · SRNS · Congenital" color="violet" onReset={reset} step={1} totalSteps={8} />
      <div className="bg-violet-50 border border-violet-200 rounded-xl p-3 space-y-1">
        <p className="text-xs font-bold text-violet-800">Diagnostic Criteria (must satisfy all 3):</p>
        {["Proteinuria: UPCR ≥2 mg/mg or dipstick ≥3+", "Hypoalbuminaemia: serum albumin <2.5 g/dL", "Oedema: periorbital / dependent / anasarca"].map((c, i) => (
          <div key={i} className="flex items-start gap-1.5 text-xs text-violet-900"><ArrowRight className="w-3 h-3 text-violet-500 flex-shrink-0 mt-0.5" />{c}</div>
        ))}
      </div>
      <QuestionCard
        question="Are the nephrotic syndrome criteria fulfilled?"
        detail="UPCR ≥2 mg/mg + albumin <2.5 g/dL + oedema"
        onYes={() => ans("ns_confirmed", true, "NS Confirmed")}
        onNo={() => ans("ns_confirmed", false, "NS Not Confirmed")}
        color="violet"
      />
    </div>
  );

  if (step === 1 && answers.ns_confirmed === false) return (
    <div className="space-y-3">
      <EngineHeader title="Nephrotic Syndrome Engine" color="violet" subtitle="Exit" onReset={reset} />
      <ResultHeader diagnosis="NS criteria NOT met — consider alternative diagnosis" risk="yellow" />
      <InvestigationPanel
        mustOrder={["Repeat UPCR (first-morning sample)", "Serum albumin, total protein", "Urine dipstick × 3 days"]}
        shouldOrder={["Renal function, electrolytes", "Complement C3/C4 (if haematuria)", "ANA, anti-dsDNA if systemic features"]}
      />
      <GuidelineSource text="Consider: orthostatic proteinuria, nephritic syndrome, non-renal causes of oedema (cardiac, hepatic)." />
      <TraceabilityBadge sourceId="GS-IPNA-2021-NS" />
    </div>
  );

  // ── Step 1: Age ────────────────────────────────────────────────────────────
  if (step === 1) return (
    <div className="space-y-3">
      <EngineHeader title="Nephrotic Syndrome Engine" color="violet" subtitle="Age Classification" onReset={reset} step={2} totalSteps={8} />
      <PathwayTrail steps={trail} />
      <MultiChoiceCard
        question="What is the patient's age at onset?"
        detail="Age determines likelihood of genetic/congenital NS and biopsy thresholds"
        color="violet"
        options={[
          { label: "< 3 months (congenital NS)", onSelect: () => ans("age_group", "congenital", "Age <3 months") },
          { label: "3–12 months (infantile NS)", onSelect: () => ans("age_group", "infantile", "Age 3–12 months") },
          { label: "1–8 years (typical SSNS age)", onSelect: () => ans("age_group", "typical", "Age 1–8 yrs") },
          { label: "> 8 years (atypical age)", onSelect: () => ans("age_group", "older", "Age >8 yrs") },
        ]}
      />
    </div>
  );

  // ── Congenital NS branch ───────────────────────────────────────────────────
  if (step === 2 && answers.age_group === "congenital") return (
    <div className="space-y-3">
      <EngineHeader title="Congenital NS Engine" color="red" subtitle="Onset <3 months — Always genetic" onReset={reset} />
      <EmergencyBanner text="Congenital NS: massive proteinuria from birth. ALWAYS genetic — immediate workup required." />
      <PathwayTrail steps={[...trail, "Congenital NS → Genetic Emergency"]} />
      <ResultHeader diagnosis="Congenital Nephrotic Syndrome" risk="red" urgent />
      <SuppressionBanner drug="tacrolimus" cieeCtx={cieeCtx} />
      <DifferentialTable rows={[
        { dx: "Finnish-type NS (NPHS1/nephrin)", pct: 80, label: "Most Common" },
        { dx: "Podocin mutation (NPHS2)", pct: 10, label: "Likely" },
        { dx: "WT1 mutation (Denys-Drash)", pct: 5, label: "Consider" },
        { dx: "LAMB2 mutation (Pierson syndrome)", pct: 3, label: "Rare" },
        { dx: "PLCε1 / PLCE1", pct: 2, label: "Rare" },
      ]} />
      <InvestigationPanel
        mustOrder={["Full genetic panel: NPHS1, NPHS2, WT1, LAMB2, PLCE1 (WES)", "Renal biopsy (DMS: diffuse mesangial sclerosis is classic)", "Karyotype (WT1: Denys-Drash — Wilms tumour risk)", "Ophthalmology (LAMB2: Pierson — microcoria)"]}
        shouldOrder={["AFP (elevated in Finnish-type)", "Renal USG", "Parental genetic testing"]}
        advanced={["Whole exome sequencing if panel negative", "Pathology EM"]}
      />
      <TreatmentPanel title="Management" items={[
        "NO steroids — glucocorticoid-resistant by definition",
        "IV albumin + furosemide for oedema control",
        "High-calorie nasogastric feeding (massive protein losses)",
        "ACEi/ARB to reduce proteinuria",
        "Bilateral nephrectomy + dialysis → kidney transplant (only cure for Finnish-type)",
        "WT1 mutations: bilateral prophylactic nephrectomy (Wilms tumour risk >90%)",
        "Nephrectomy timing: when ESKD symptoms, not before"
      ]} />
      <MonitoringPanel items={[
        "Daily weight, urine dipstick",
        "Weekly electrolytes, albumin, creatinine",
        "Monthly renal function",
        "6-monthly USG for Wilms (WT1 mutations) — until nephrectomy",
        "Genetics multidisciplinary team review"
      ]} />
      <CIEEMonitoringPanel drugs={[]} cieeCtx={cieeCtx} />
      <GuidelineSource text="IPNA 2021 · KDIGO 2012 · ERKNet Congenital NS Pathway · Finnish-type: Patrakka J, JASN 2000" />
      <TraceabilityBadge sourceId="GS-ISPN-2021-GENETICS" />
    </div>
  );

  // ── Step 2 (for typical/infantile/older): Atypical features? ──────────────
  if (step === 2) return (
    <div className="space-y-3">
      <EngineHeader title="Nephrotic Syndrome Engine" color="violet" subtitle="Atypical Feature Screening" onReset={reset} step={3} totalSteps={8} />
      <PathwayTrail steps={trail} />
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
        <p className="text-xs font-bold text-amber-800 mb-1.5">Atypical features (any ONE = biopsy/genetic workup):</p>
        {["Haematuria (persistent, especially macroscopic)", "Hypertension (>95th percentile for age)", "Low complement C3/C4", "Acute kidney injury at presentation", "Family history of NS or CKD", "Extra-renal features (hearing loss, ocular, syndromic)"].map((f, i) => (
          <div key={i} className="flex items-start gap-1.5 text-xs text-amber-900"><ArrowRight className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />{f}</div>
        ))}
      </div>
      <QuestionCard
        question="Are any atypical features present?"
        onYes={() => ans("atypical", true, "Atypical Features Present")}
        onNo={() => ans("atypical", false, "No Atypical Features")}
        color="violet"
      />
    </div>
  );

  // ── Step 3: First episode or relapse? ─────────────────────────────────────
  if (step === 3 && answers.atypical === false) return (
    <div className="space-y-3">
      <EngineHeader title="Nephrotic Syndrome Engine" color="violet" subtitle="Episode Classification" onReset={reset} step={4} totalSteps={8} />
      <PathwayTrail steps={trail} />
      <MultiChoiceCard
        question="Is this the first episode or a relapse?"
        color="violet"
        options={[
          { label: "First episode", onSelect: () => ans("episode", "first", "First Episode") },
          { label: "Relapse (dipstick ≥3+ × 3 days after remission)", onSelect: () => ans("episode", "relapse", "Relapse") },
        ]}
      />
    </div>
  );

  // ── First episode → IPNA 2022 SSNS CIEE pathway (initial PDN) ──────────────
  if (step === 4 && answers.episode === "first") return (
    <div className="space-y-3">
      <EngineHeader title="First Episode SSNS" color="violet" subtitle="IPNA 2022 — initial prednisolone & response" onReset={reset} />
      <PathwayTrail steps={[...trail, "First Episode → IPNA SSNS pathway"]} />
      <CIEEEngineRunner
        pathway={SSNS_PATHWAY}
        sources={SSNS_SOURCES}
        initialCtx={buildStepperCtx()}
        entry="DN-06"
        title="SSNS Management Engine"
        subtitle="IPNA 2022 · first episode → response → relapse"
      />
    </div>
  );

  // ── Relapse → classify relapse pattern ────────────────────────────────────
  if (step === 4 && answers.episode === "relapse") return (
    <div className="space-y-3">
      <EngineHeader title="Relapse Classification" color="violet" subtitle="Frequent Relapser / Steroid Dependent / Steroid Resistant" onReset={reset} step={5} totalSteps={8} />
      <PathwayTrail steps={trail} />
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs space-y-1">
        <p className="font-bold text-blue-800">Definitions:</p>
        <p><span className="font-semibold">Relapse:</span> dipstick ≥3+ × 3 days after confirmed remission</p>
        <p><span className="font-semibold">Frequent Relapse (FRNS):</span> ≥2 relapses in 6 months OR ≥4 in 12 months</p>
        <p><span className="font-semibold">Steroid Dependent (SDNS):</span> relapse during steroid taper OR within 14 days of stopping</p>
        <p><span className="font-semibold">Steroid Resistant (SRNS):</span> no remission after 4 weeks full-dose prednisolone</p>
      </div>
      <MultiChoiceCard
        question="Which relapse pattern best describes this patient?"
        color="violet"
        options={[
          { label: "Infrequent relapse (<2 in 6 months)", onSelect: () => ans("relapse_type", "infrequent", "Infrequent Relapse") },
          { label: "Frequent relapser (FRNS: ≥2/6m or ≥4/12m)", onSelect: () => ans("relapse_type", "frns", "FRNS") },
          { label: "Steroid dependent (relapse on taper/within 14d off)", onSelect: () => ans("relapse_type", "sdns", "SDNS") },
          { label: "No remission after 4 weeks steroids (SRNS)", onSelect: () => ans("relapse_type", "srns", "SRNS") },
        ]}
      />
    </div>
  );

  // ── Infrequent relapse → IPNA 2022 SSNS CIEE pathway ──────────────────────
  if (answers.relapse_type === "infrequent") return (
    <div className="space-y-3">
      <EngineHeader title="Infrequent Relapse" color="violet" subtitle="IPNA 2022 — standard prednisolone course" onReset={reset} />
      <PathwayTrail steps={[...trail, "Infrequent Relapse → IPNA SSNS pathway"]} />
      <CIEEEngineRunner
        pathway={SSNS_PATHWAY}
        sources={SSNS_SOURCES}
        initialCtx={{ ...buildStepperCtx(), relapse_type: 'infrequent' }}
        entry="DN-11"
        title="SSNS Management Engine"
        subtitle="IPNA 2022 · infrequent relapse"
      />
    </div>
  );

  // ── FRNS → IPNA 2022 SSNS CIEE pathway (steroid-sparing selection) ─────────
  if (answers.relapse_type === "frns") return (
    <div className="space-y-3">
      <EngineHeader title="Frequent Relapsing NS (FRNS)" color="violet" subtitle="IPNA 2022 — steroid-sparing agent selection" onReset={reset} />
      <PathwayTrail steps={[...trail, "FRNS → IPNA SSNS pathway"]} />
      <CIEEEngineRunner
        pathway={SSNS_PATHWAY}
        sources={SSNS_SOURCES}
        initialCtx={{ ...buildStepperCtx(), relapse_type: 'FRNS' }}
        entry="DN-12"
        title="SSNS Management Engine"
        subtitle="IPNA 2022 · FRNS steroid-sparing"
      />
    </div>
  );

  // ── SDNS → IPNA 2022 SSNS CIEE pathway (steroid minimisation) ──────────────
  if (answers.relapse_type === "sdns") return (
    <div className="space-y-3">
      <EngineHeader title="Steroid Dependent NS (SDNS)" color="violet" subtitle="IPNA 2022 — steroid-sparing & minimisation" onReset={reset} />
      <PathwayTrail steps={[...trail, "SDNS → IPNA SSNS pathway"]} />
      <CIEEEngineRunner
        pathway={SSNS_PATHWAY}
        sources={SSNS_SOURCES}
        initialCtx={{ ...buildStepperCtx(), relapse_type: 'SDNS' }}
        entry="DN-12"
        title="SSNS Management Engine"
        subtitle="IPNA 2022 · SDNS steroid-sparing"
      />
    </div>
  );

  // ── SRNS + Atypical NS → interactive CIEE Pathway Engine ────────────────────
  if (answers.relapse_type === "srns" || (step === 3 && answers.atypical === true)) {
    const isSRNS = answers.relapse_type === "srns";
    return (
      <div className="space-y-3">
        <EngineHeader title="SRNS / Atypical NS Engine" color="red" subtitle="CIEE Pathway Engine — step-by-step decision support" onReset={reset} />
        <EmergencyBanner text="SRNS: Renal biopsy + genetic panel MANDATORY before starting CNI therapy." />
        <PathwayTrail steps={[...trail, isSRNS ? "SRNS" : "Atypical NS", "CIEE Pathway"]} />
        <ResultHeader diagnosis={isSRNS ? "Steroid-Resistant NS (SRNS)" : "Atypical NS — Biopsy Required"} risk="red" urgent />

        {/* Interactive PathwayExecutionEngine — traverses the SRNS decision graph node by node */}
        <CIEEEngineRunner
          pathway={SRNS_PATHWAY}
          sources={GUIDELINE_SOURCES}
          initialCtx={buildStepperCtx()}
          recommend={recommendIndex}
          title="CIEE Pathway Engine"
          subtitle="SRNS Management · ISPN 2021 · interactive node traversal"
        />

        {/* Reference differential (collapsed below the live pathway) */}
        <details className="bg-white border border-slate-200 rounded-xl">
          <summary className="px-3 py-2 text-xs font-semibold text-slate-600 cursor-pointer">Reference — SRNS differential & workup</summary>
          <div className="p-3 pt-0 space-y-3">
            <DifferentialTable rows={[
              { dx: "FSGS (focal segmental glomerulosclerosis)", pct: 50, label: "Most Common" },
              { dx: "MCD (minimal change disease, steroid-resistant subset)", pct: 20, label: "Possible" },
              { dx: "DMS (diffuse mesangial sclerosis — genetic)", pct: 10, label: "Consider if <1yr" },
              { dx: "Genetic NS (NPHS1/2, WT1, PLCE1, COQ mutations)", pct: 15, label: "Test all SRNS" },
              { dx: "Lupus nephritis class V", pct: 3, label: "If ANA +" },
              { dx: "Membranous nephropathy", pct: 2, label: "Rare in children" },
            ]} />
            <InvestigationPanel
              mustOrder={[
                "Genetic panel: NPHS1, NPHS2, PLCE1, WT1, LAMB2, CD2AP, TRPC6, INF2",
                "Renal biopsy: LM + IF + EM — classify FSGS variant (Columbia classification)",
                "ANA, anti-dsDNA, C3, C4, anti-GBM (secondary NS exclusion)",
                "HBsAg, anti-HCV, HIV serology",
              ]}
              shouldOrder={["24h urine protein / UPCR daily", "CNI trough BEFORE start", "USG kidneys"]}
              advanced={["WES if targeted panel negative + onset <5yr"]}
            />
            <GuidelineSource text="KDIGO 2021 · IPNA/ISPN 2021 SRNS Recommendations · FSGS Columbia Classification (D'Agati 2004)" />
            <TraceabilityBadge sourceId="GS-ISPN-2021-SRNS" />
          </div>
        </details>
      </div>
    );
  }

  return null;
}
