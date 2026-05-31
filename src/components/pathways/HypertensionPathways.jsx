import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Heart, Info, AlertTriangle } from "lucide-react";

const CONDITIONS = {
  bp_classification: {
    title: "BP Measurement & Classification",
    tag: "Hypertension",
    color: "bg-red-100 text-red-800",
    guidance: "AAP 2017 · ISPN",
    overview: "Correct BP measurement technique is foundational. Use validated oscillometric device (Omron HBP-1120 recommended by ISPN). BP interpretation requires age/sex/height-specific percentile tables for children <13 years; fixed thresholds for ≥13 years.",
    diagnosis: [
      "CLASSIFICATION (Children <13y — percentile-based by age/sex/height):",
      "Normal: <90th percentile",
      "Elevated: 90th to <95th percentile (or 120/80 to <95th percentile, whichever is lower)",
      "Stage 1 HTN: 95th percentile to <95th+12 mmHg (or 130/80 to 139/89 mmHg)",
      "Stage 2 HTN: ≥95th+12 mmHg (or ≥140/90 mmHg)",
      "CLASSIFICATION (Adolescents ≥13y — fixed thresholds, AAP 2017):",
      "Normal: <120/<80 mmHg",
      "Elevated: 120–129/<80 mmHg",
      "Stage 1 HTN: 130–139/80–89 mmHg",
      "Stage 2 HTN: ≥140/≥90 mmHg",
      "Confirm diagnosis: ≥3 separate occasions (except urgency/emergency)",
      "Cuff: bladder covers 80–100% arm circumference; too small → falsely HIGH",
      "Position: right arm, seated, supported, 5 min rest, no caffeine/exercise 30 min prior",
      "Omron HBP-1120: ISPN-recommended validated oscillometric device for paediatric use in India"
    ],
    treatment: [
      "Stage 1 (no symptoms, no CKD, no organ damage): lifestyle modification × 3–6 months before drug therapy",
      "Stage 2 OR symptomatic OR secondary HTN: start antihypertensive immediately",
      "Lifestyle: DASH diet (sodium <2g/day), weight loss if obese, 30–60 min aerobic exercise/day",
      "1st line drug choices: ACEi/ARB (CKD/proteinuria), CCB (amlodipine) for general/secondary HTN",
      "Target BP: <90th percentile for age/sex/height (CKD patients: <50th percentile per KDIGO)",
      "Thiazide diuretics: volume-mediated HTN (e.g. CKD, obesity)",
      "Beta-blockers: avoid as 1st line in children unless specific indication (e.g. portal HTN)"
    ],
    monitoring: [
      "Confirm with ABPM if white coat suspected (15–40% of paediatric HTN referrals)",
      "Home BP monitoring: twice daily × 7 days with validated paediatric device",
      "ABPM: gold standard — 24h profile, nocturnal dipping pattern, masked HTN detection",
      "End-organ assessment at diagnosis: echocardiogram (LVH), fundoscopy, urine UPCR, eGFR",
      "Repeat echocardiogram 6-monthly if LVH detected"
    ],
    pearls: [
      "Stage 1 vs Stage 2 distinction changed in AAP 2017: Stage 1 upper limit is 95th+12mmHg (NOT 99th+5mmHg as in old JNC4 criteria)",
      "Old classification used 99th+5mmHg for Stage 2 — this is now ONLY Stage 2 threshold upper boundary",
      "Omron HBP-1120 (~₹6000 in India) — worthwhile investment for any nephrology clinic",
      "Non-dipping (nocturnal BP <10% fall): associated with CKD progression and cardiovascular risk",
      "White coat HTN: ABPM before starting medication — avoid unnecessary treatment",
      "Secondary HTN much more common in children than adults (>85%) — always investigate cause"
    ]
  },
  htn_emergency: {
    title: "Hypertensive Emergency & PRES",
    tag: "Emergency",
    color: "bg-red-100 text-red-800",
    guidance: "ISPN · AAP 2017 Protocol",
    overview: "BP >99th percentile + 5mmHg with acute end-organ damage (encephalopathy, seizures, retinopathy, AKI, cardiac failure). PRES (Posterior Reversible Encephalopathy Syndrome) is a feared complication.",
    diagnosis: ["BP >99th+5mmHg + headache, vomiting, altered consciousness, seizures, visual disturbance", "PRES: MRI FLAIR — hyperintense lesions in posterior parieto-occipital cortex (bilateral, symmetric)", "Fundoscopy: papilledema, flame hemorrhages, exudates (hypertensive retinopathy grade 3–4)", "Urgent workup: renal function, electrolytes, CBC, urinalysis, UPCR, echo, renal USG+Doppler", "Causes: glomerulonephritis (most common paediatric), renal artery stenosis, coarctation, pheochromocytoma"],
    treatment: ["Goal: reduce MAP by 25% in first HOUR (not to normal — risk of cerebral ischemia if too rapid)", "IV Labetalol: 0.2-1 mg/kg/dose (max 40mg), then infusion 0.25-3 mg/kg/h — preferred agent", "IV Nicardipine: 1-3 mcg/kg/min infusion — 2nd line or labetalol unavailable", "IV Sodium nitroprusside: 0.3-10 mcg/kg/min — reserved for refractory cases (cyanide risk)", "PRES management: BP reduction (as above) + seizure control (levetiracetam/phenobarb) + magnesium if eclamptic", "Avoid: sublingual nifedipine (uncontrolled drop), IV hydralazine (unpredictable)", "India: IV labetalol vials available at most tertiary centres; IV nicardipine less available — have oral amlodipine/nifedipine as bridge"],
    monitoring: ["Continuous BP monitoring (arterial line if available) during IV therapy", "Target reduction: 25% MAP in 1h → 50% in 24h → normal over 48-72h", "Neuroimaging: MRI within 24h if encephalopathy/seizures (PRES)", "Renal function, electrolytes 4-6 hourly", "Retinal exam once BP controlled"],
    pearls: ["PRES can occur at relatively lower BP in CKD patients — threshold is relative not absolute", "Labetalol contraindicated in asthma/reactive airways — use nicardipine instead", "AKI + hypertensive emergency → consider GN, HUS, TMA urgently", "Posterior headache + visual changes + seizures in child with CKD = PRES until proven otherwise"]
  },
  secondary_htn: {
    title: "Secondary Hypertension — Renovascular & Endocrine",
    tag: "Hypertension",
    color: "bg-orange-100 text-orange-800",
    guidance: "ISPN · AAP 2017",
    overview: "Secondary HTN accounts for >85% of paediatric hypertension (vs 5% adults). Renal parenchymal (#1), renovascular (#2), endocrine causes. Systematic workup mandatory in all children.",
    diagnosis: ["Renal parenchymal (60%): CKD, GN, CAKUT, PKD — USG KUB, UPCR, creatinine", "Renovascular (10-15%): renal artery stenosis (fibromuscular dysplasia, neurofibromatosis, Takayasu)", "  → Doppler USG (screening), CTA/MRA renal arteries, angiography (gold standard)", "Coarctation of aorta: BP difference >10mmHg between arms, weak femoral pulses, rib notching on CXR, MRI aorta", "Endocrine causes:", "  Pheochromocytoma: paroxysmal HTN, sweating, pallor, headache → plasma/urine metanephrines, MIBG scan", "  Primary hyperaldosteronism: hypokalemia + HTN + low renin → aldosterone:renin ratio >30", "  Cushing syndrome: centripetal obesity, striae, hyperglycemia → 24h urine cortisol, overnight dexamethasone suppression", "  Hyperthyroidism: wide pulse pressure, tachycardia, goitre → TSH, FT4"],
    treatment: ["Renovascular HTN: angioplasty ± stent (FMD responds well), surgical revascularisation", "Pheochromocytoma: alpha-blockade FIRST (phenoxybenzamine) then beta-blockade then surgery", "Hyperaldosteronism: spironolactone/eplerenone; adrenal adenoma → laparoscopic adrenalectomy", "Cushing: treat underlying (adenoma, ectopic ACTH, exogenous steroid tapering)", "Coarctation: balloon angioplasty or surgical repair", "India: plasma metanephrines (AIIMS, CMC); adrenal CT/MRI widely available; angioplasty at AIIMS, PGIMER, Medanta"],
    monitoring: ["Post-angioplasty: BP monitoring + Doppler USG at 3, 6, 12 months", "Pheochromocytoma post-surgery: urine metanephrines 6-monthly (recurrence/malignancy)", "Genetic screening: VHL, RET, SDHB/C/D mutations in pheochromocytoma (especially if bilateral or young)"],
    pearls: ["Always check femoral pulses in hypertensive children — coarctation is easily missed", "Renovascular HTN: suspect if age <5y, no obesity, BP resistant to 2 drugs", "Pheochromocytoma: paroxysmal symptoms + family history — treat as pheo until proven otherwise", "10% rule of pheo: 10% bilateral, 10% extra-adrenal, 10% malignant, 10% familial"]
  },
  neonatal_htn: {
    title: "Neonatal Hypertension",
    tag: "Neonatal",
    color: "bg-pink-100 text-pink-800",
    guidance: "AAP · ISPN · NeoKidney Guidelines",
    overview: "BP >95th percentile for gestational age, postnatal age, and sex. Incidence ~1% NICU. Most common cause: umbilical arterial catheter (UAC) thrombosis → renal artery thrombosis.",
    diagnosis: ["UAC-related renal artery thrombosis (most common): sudden severe HTN in neonate with UAC", "  → Doppler USG: absent/reduced flow in renal artery; thrombosis", "Renal vein thrombosis: flank mass + haematuria + thrombocytopenia + anemia", "ADPKD/ARPKD: bilateral enlarged echogenic kidneys on USG", "Renovascular: fibromuscular dysplasia, Takayasu (rare in neonates)", "Medication-related: corticosteroids, dopamine, excessive IV fluids", "Endocrine: congenital adrenal hyperplasia (salt-wasting with HTN in 11β-OH or 17α-OH deficiency)", "BP measurement: Doppler cuff (oscillometric) — appropriate cuff size critical; all 4 limbs if coarctation suspected"],
    treatment: ["UAC renal thrombosis: antithrombotics controversial — discuss with haematology; treat hypertension", "Acute severe HTN: IV labetalol OR IV nicardipine (doses as per neonate tables)", "Oral maintenance: amlodipine 0.1-0.6 mg/kg/day (CCB — preferred oral in neonates)", "Captopril: 0.01-0.05 mg/kg/dose q8-12h — ACEi (do NOT use in bilateral RAS or solitary kidney)", "Hydralazine: 0.1-0.5 mg/kg/dose IV q6-8h — alternative IV agent", "India: captopril solution (compounded 1 mg/mL); amlodipine suspension (compounded)"],
    monitoring: ["4-limb BP at diagnosis (exclude coarctation)", "Doppler USG renal arteries: baseline, then 2-weekly if thrombus", "Creatinine, electrolytes daily initially; then 3-weekly", "Long-term follow-up: 25% develop hypertension in childhood after neonatal AKI"],
    pearls: ["Neonatal HTN most often iatrogenic (UAC) — prevent by proper UAC placement (T6-T10)", "Captopril causes profound hypotension in neonates — start with very low dose and only oral", "Renal vein thrombosis: USG shows enlarged echogenic kidney — distinct from renal artery thrombosis", "Always check 4-limb BP — coarctation in neonates may have only subtle femoral pulse difference"]
  }
};

export default function HypertensionPathways({ condition }) {
  const [section, setSection] = useState("overview");
  const data = CONDITIONS[condition];
  if (!data) return null;

  const sections = [
    { key: "overview", label: "Overview" },
    { key: "diagnosis", label: "Diagnosis" },
    { key: "treatment", label: "Treatment" },
    { key: "monitoring", label: "Monitoring" },
    { key: "pearls", label: "Pearls" },
  ];

  return (
    <div className="space-y-4">
      <div className={`rounded-xl p-5 text-white ${data.tag === "Emergency" ? "bg-gradient-to-r from-red-700 to-rose-700" : data.tag === "Neonatal" ? "bg-gradient-to-r from-pink-700 to-rose-700" : "bg-gradient-to-r from-orange-700 to-red-700"}`}>
        <div className="flex items-center gap-3">
          <Heart className="w-7 h-7" />
          <div>
            <h2 className="text-xl font-bold">{data.title}</h2>
            <p className="text-red-100 text-sm">{data.guidance}</p>
          </div>
        </div>
        <span className={`mt-2 inline-block text-xs px-2 py-0.5 rounded-full font-medium ${data.color}`}>{data.tag}</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {sections.map(s => (
          <button key={s.key} onClick={() => setSection(s.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${section === s.key ? "bg-red-700 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-red-300"}`}>
            {s.label}
          </button>
        ))}
      </div>

      <Card className="border-slate-200">
        <CardContent className="p-4 space-y-2">
          {section === "overview" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-900 leading-relaxed">{data.overview}</p>
            </div>
          )}
          {section !== "overview" && data[section]?.map((item, i) => {
            const isSubItem = item.startsWith("  ");
            const isHeader = item.endsWith(":") && !item.startsWith("  ");
            return (
              <div key={i} className={`flex items-start gap-2 p-2.5 rounded-lg ${
                isHeader ? "bg-slate-100 border border-slate-300" :
                isSubItem ? "ml-4 bg-slate-50 border border-slate-100" :
                section === "pearls" ? "bg-amber-50 border border-amber-200" :
                section === "treatment" ? "bg-green-50 border border-green-200" :
                section === "diagnosis" ? "bg-blue-50 border border-blue-200" :
                "bg-slate-50 border border-slate-200"
              }`}>
                {isHeader ? null : <ArrowRight className={`w-3 h-3 flex-shrink-0 mt-0.5 ${section === "pearls" ? "text-amber-600" : section === "treatment" ? "text-green-600" : "text-blue-500"}`} />}
                <p className={`text-xs leading-relaxed ${isHeader ? "font-bold text-slate-700 w-full" : "text-slate-800"}`}>{item.trim()}</p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {data.tag === "Emergency" && (
        <Card className="border-red-300 bg-red-50">
          <CardContent className="p-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-800"><strong>Emergency:</strong> Target 25% MAP reduction in first hour — too rapid correction risks watershed infarction</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}