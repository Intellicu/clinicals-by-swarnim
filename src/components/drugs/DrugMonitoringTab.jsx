/**
 * DrugMonitoringTab — Pre-treatment workup and post-treatment monitoring panel
 * for each drug. Displayed as a "Monitoring" tab inside DrugDetailCard.
 */
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle, Activity, FlaskConical, Shield, Clock } from "lucide-react";

const DRUG_MONITORING_PROFILES = {
  tacrolimus: {
    pre_treatment: {
      label: "Before Starting Tacrolimus",
      items: [
        "Tacrolimus trough (C0) baseline — not applicable unless switching",
        "Serum creatinine + eGFR",
        "Potassium, magnesium, phosphate",
        "Fasting blood glucose (PTDM risk)",
        "LFTs (AST, ALT, bilirubin)",
        "CBC (baseline counts)",
        "HBsAg, Anti-HBc (reactivation risk in transplant)",
        "CMV PCR (transplant patients)",
        "Blood pressure",
      ],
      vaccines: "Ensure all live vaccines given ≥4 weeks BEFORE starting. No live vaccines after initiation.",
      notes: "For SRNS: genetic panel recommended before starting CNI (NPHS2, WT1, etc.)",
    },
    post_treatment: {
      label: "Ongoing Monitoring Schedule",
      schedule: [
        { when: "Week 1", checks: ["Tacrolimus trough (C0)", "Creatinine", "Potassium", "Glucose"] },
        { when: "Month 1", checks: ["Tacrolimus C0", "Creatinine", "Electrolytes", "LFTs", "CBC", "BP"] },
        { when: "Month 3", checks: ["Tacrolimus C0", "Creatinine", "eGFR", "Electrolytes", "LFTs", "UPCR", "Glucose"] },
        { when: "Every 3 months", checks: ["Tacrolimus C0", "Creatinine", "Electrolytes", "UPCR", "BP", "Glucose"] },
      ],
      targets: [
        { param: "Tacrolimus C0 — SRNS/SDNS", target: "4–8 ng/mL" },
        { param: "Tacrolimus C0 — Post-Transplant (0–3m)", target: "8–12 ng/mL" },
        { param: "Tacrolimus C0 — Post-Transplant (>12m)", target: "5–8 ng/mL" },
        { param: "BP target", target: "<90th percentile for age/height" },
        { param: "Creatinine rise acceptable", target: "≤25% above baseline" },
      ],
      redFlags: [
        "Creatinine rise >25% above baseline — reduce dose, check for nephrotoxicity",
        "Trough >15 ng/mL — dose toxicity, reduce immediately",
        "New-onset hyperglycaemia — check HbA1c, consider PTDM",
        "Tremor, headache, seizures — neurotoxicity — recheck trough",
      ],
    },
  },
  rituximab: {
    pre_treatment: {
      label: "Mandatory Pre-Rituximab Workup",
      items: [
        "CBC with differential (baseline counts)",
        "Serum IgG (baseline — hypogammaglobulinaemia risk)",
        "HBsAg and Anti-HBc (MANDATORY — reactivation risk)",
        "HIV serology",
        "ALT/AST (LFTs)",
        "CD19/CD20 B-cell count (baseline)",
        "CMV and EBV PCR",
        "Varicella (VZV) serology if no prior vaccination",
        "Urine culture (exclude active UTI)",
        "ECG (if cardiac history)",
      ],
      vaccines: "CRITICAL: All live vaccines (MMR, varicella, BCG) must be given ≥4 weeks BEFORE rituximab. After rituximab, no live vaccines for 6 months minimum.",
      notes: "Hepatitis B prophylaxis (entecavir or lamivudine) mandatory if HBsAg+. HBcAb+ without active infection: prophylaxis recommended.",
    },
    post_treatment: {
      label: "Post-Rituximab Monitoring",
      schedule: [
        { when: "4 weeks post-dose", checks: ["CD19 count (target <1%)", "CBC", "IgG"] },
        { when: "3 months", checks: ["CD19/CD20", "IgG", "CBC", "UPCR", "Creatinine"] },
        { when: "6 months", checks: ["CD19/CD20", "IgG", "CBC", "UPCR", "CMV PCR if symptoms"] },
        { when: "9 & 12 months", checks: ["CD19/CD20", "IgG", "CBC"] },
        { when: "Annually", checks: ["IgG", "CD19 to guide re-dosing", "CBC"] },
      ],
      targets: [
        { param: "CD19 depletion", target: "<1% of lymphocytes at 4 weeks" },
        { param: "IgG — hold if", target: "<400 mg/dL (consider IVIG)" },
        { param: "Re-dose trigger", target: "CD19 >1% + clinical relapse" },
      ],
      redFlags: [
        "Fever during infusion — stop infusion, give antihistamine + hydrocortisone",
        "IgG <400 mg/dL — risk of serious infection, consider IVIG",
        "Persistent B-cell depletion >12 months — monitor closely for infection",
        "PML symptoms (progressive neurological changes) — urgent MRI, JC virus PCR",
      ],
    },
  },
  cyclosporine: {
    pre_treatment: {
      label: "Before Starting Cyclosporine",
      items: [
        "Serum creatinine + eGFR (MUST be normal or near-normal baseline)",
        "Blood pressure (bilateral)",
        "Cyclosporine C0 baseline — not applicable first time",
        "Potassium, magnesium",
        "Lipid profile (triglycerides, LDL)",
        "LFTs",
        "CBC",
        "Uric acid (gout risk)",
        "Urinalysis + UPCR",
      ],
      vaccines: "No live vaccines during therapy. Ensure all live vaccines completed before starting.",
      notes: "Do NOT start if eGFR is already declining or creatinine elevated >30% above age-expected.",
    },
    post_treatment: {
      label: "Cyclosporine Monitoring Schedule",
      schedule: [
        { when: "Week 1–2", checks: ["C0 trough OR C2", "Creatinine", "K+", "Mg²⁺", "BP"] },
        { when: "Monthly (first 3m)", checks: ["C0/C2 trough", "Creatinine", "BP", "K+", "Lipids"] },
        { when: "Every 3 months", checks: ["C0/C2", "Creatinine", "eGFR", "BP", "Lipids", "UPCR"] },
      ],
      targets: [
        { param: "C0 — SRNS/SDNS/FRNS", target: "80–120 ng/mL" },
        { param: "C0 — Transplant maintenance", target: "100–150 ng/mL (or C2: 800–1200 ng/mL)" },
        { param: "Creatinine rise limit", target: "≤25% above baseline — reduce if >30%" },
        { param: "BP target", target: "<90th percentile" },
      ],
      redFlags: [
        "Creatinine rise >25% above baseline — dose reduction, check for calcineurin nephrotoxicity",
        "BP uncontrolled — add amlodipine (note: mild increase in cyclosporine levels)",
        "Hypertrichosis, gingival hyperplasia — inform family (cosmetic, dose-dependent)",
        "C0 >200 ng/mL — toxicity range, reduce dose",
      ],
    },
  },
  cyclophosphamide: {
    pre_treatment: {
      label: "Before Cyclophosphamide Pulse",
      items: [
        "CBC + differential (WBC must be >3000/mm³, PMN >1500/mm³)",
        "Urinalysis (NO haematuria — if present, delay and investigate)",
        "Serum creatinine + eGFR",
        "LFTs",
        "Urine culture (exclude UTI before pulse)",
        "Consider fertility counselling (gonadotoxicity, especially girls >10y)",
        "Calculate cumulative dose (oral: max 168 mg/kg total)",
      ],
      vaccines: "No live vaccines during treatment and 6 months after. Ensure MMR/varicella before starting.",
      notes: "Mesna (IV uroprotection) MANDATORY for all IV pulses >500 mg/m². Hyperhydration: 2–3 L/m²/24h.",
    },
    post_treatment: {
      label: "Post-Cyclophosphamide Monitoring",
      schedule: [
        { when: "Day 10–14 (nadir)", checks: ["CBC — WBC nadir check"] },
        { when: "Before each pulse", checks: ["CBC", "Urinalysis", "Creatinine", "Urine culture"] },
        { when: "Monthly (oral course)", checks: ["CBC weekly first month", "Urinalysis for haematuria"] },
        { when: "End of course", checks: ["CBC", "Urinalysis", "Cumulative dose calculation"] },
      ],
      targets: [
        { param: "WBC nadir (day 10–14)", target: ">2000/mm³ to continue" },
        { param: "PMN before next pulse", target: ">1500/mm³" },
        { param: "Urinalysis", target: "No haematuria before each dose" },
        { param: "Max cumulative dose (oral)", target: "168 mg/kg total — gonadotoxicity" },
      ],
      redFlags: [
        "Macroscopic haematuria — stop drug, urgent urology review (haemorrhagic cystitis)",
        "Fever + neutropenia (PMN <500) — febrile neutropenia protocol: admit + IV antibiotics",
        "WBC <3000 at day 10–14 nadir — delay next pulse until recovery",
        "Azoospermia risk in males receiving >cumulative 200 mg/kg — discuss sperm banking",
      ],
    },
  },
  mmf: {
    pre_treatment: {
      label: "Before Starting MMF (Mycophenolate)",
      items: [
        "CBC + differential (baseline)",
        "LFTs (ALT, AST, bilirubin)",
        "Serum creatinine",
        "Pregnancy test in adolescent females (TERATOGENIC — Category D)",
        "Contraception counselling for adolescent females",
        "CMV status (transplant patients)",
      ],
      vaccines: "No live vaccines during therapy.",
      notes: "Teratogenic — Document counselling for females of childbearing age. Use two forms of contraception.",
    },
    post_treatment: {
      label: "MMF Monitoring Schedule",
      schedule: [
        { when: "Monthly (first 3m)", checks: ["CBC", "LFTs", "Creatinine"] },
        { when: "Every 3 months", checks: ["CBC", "LFTs", "Creatinine", "UPCR"] },
        { when: "Post-transplant", checks: ["CMV/BK PCR at 3 and 6 months", "CBC monthly"] },
      ],
      targets: [
        { param: "WBC — hold if", target: "<3000/mm³ (reduce or hold dose)" },
        { param: "MPA AUC (if TDM)", target: "30–60 mg·h/L" },
      ],
      redFlags: [
        "Severe diarrhoea — consider MMF-related GI toxicity; switch to EC-MPS",
        "CMV disease — reduce or hold MMF, start ganciclovir",
        "WBC <3000 — hold dose, check for sepsis",
        "BK nephropathy — reduce immunosuppression, specialist review",
      ],
    },
  },
  prednisolone: {
    pre_treatment: {
      label: "Before Starting / Prolonged Prednisolone",
      items: [
        "Weight + height (baseline growth record)",
        "Blood pressure",
        "Fasting blood glucose",
        "Varicella serology / vaccination status (chickenpox risk)",
        "TB screening (Mantoux / IGRA if high-risk area)",
        "Bone density (DEXA if >3 months anticipated therapy)",
        "Ophthalmology referral if >3 months planned",
      ],
      vaccines: "No live vaccines during high-dose (>2 mg/kg/day or >20 mg/day). MMR, varicella — defer. Annual inactivated influenza recommended.",
      notes: "Start calcium 500 mg + Vit D 400 IU from day 1 for all children on >4 weeks steroids.",
    },
    post_treatment: {
      label: "Prednisolone Monitoring Schedule",
      schedule: [
        { when: "Weekly (induction)", checks: ["BP", "Weight", "Urine dipstick"] },
        { when: "Monthly", checks: ["BP", "Weight", "Height", "Glucose", "Urine dipstick"] },
        { when: "Every 3 months", checks: ["Height velocity", "Bone profile", "Ophthalmology if ongoing"] },
        { when: "Annually", checks: ["DEXA scan (if >3m cumulative)", "Ophthalmology (cataract/glaucoma)"] },
      ],
      targets: [
        { param: "BP", target: "<90th percentile" },
        { param: "Height velocity", target: "Normal for age — concern if >1.5 SD below" },
        { param: "Urine dipstick", target: "Negative for 3 consecutive days = remission" },
      ],
      redFlags: [
        "Varicella exposure — give VZV immunoglobulin within 96h if non-immune",
        "Cushingoid features — excessive side effects, discuss dose reduction",
        "Growth suppression (<-2 SD velocity) — consider alternate-day dosing",
        "Steroid psychosis — urgent psychiatric review, consider dose reduction",
      ],
    },
  },
};

export default function DrugMonitoringTab({ drug }) {
  const key = drug?.generic_name?.toLowerCase().replace(/\s+/g, "").replace(/mofetil|mycophenolate/, "mmf") || "";
  const profile = DRUG_MONITORING_PROFILES[key] || null;

  if (!profile) {
    return (
      <div className="text-center py-8 text-slate-400 text-sm">
        <Activity className="w-8 h-8 mx-auto mb-2 text-slate-300" />
        <p>Detailed monitoring protocol not available for this drug.</p>
        <p className="text-xs mt-1">Refer to local institutional protocol or drug monograph.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Pre-treatment workup */}
      <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
        <div className="flex items-center gap-2 mb-2">
          <FlaskConical className="w-4 h-4 text-blue-700" />
          <p className="text-xs font-bold text-blue-800 uppercase tracking-wide">{profile.pre_treatment.label}</p>
        </div>
        <div className="space-y-1">
          {profile.pre_treatment.items.map((item, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-blue-900">
              <CheckCircle className="w-3 h-3 mt-0.5 text-blue-500 flex-shrink-0" />
              {item}
            </div>
          ))}
        </div>
        {profile.pre_treatment.vaccines && (
          <div className="mt-2 bg-amber-50 rounded-lg px-2.5 py-2 border border-amber-200">
            <p className="text-xs font-bold text-amber-800">Vaccine Advisory:</p>
            <p className="text-xs text-amber-800 mt-0.5">{profile.pre_treatment.vaccines}</p>
          </div>
        )}
        {profile.pre_treatment.notes && (
          <p className="text-xs text-blue-700 italic mt-2">{profile.pre_treatment.notes}</p>
        )}
      </div>

      {/* Monitoring schedule */}
      <div className="bg-green-50 rounded-xl p-3 border border-green-200">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-green-700" />
          <p className="text-xs font-bold text-green-800 uppercase tracking-wide">{profile.post_treatment.label}</p>
        </div>
        <div className="space-y-2">
          {profile.post_treatment.schedule.map((row, i) => (
            <div key={i} className="bg-white rounded-lg px-2.5 py-2 border border-green-200">
              <p className="text-xs font-bold text-green-800 mb-1">{row.when}</p>
              <div className="flex flex-wrap gap-1">
                {row.checks.map((c, j) => (
                  <span key={j} className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">{c}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Targets */}
      {profile.post_treatment.targets?.length > 0 && (
        <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-200">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-indigo-700" />
            <p className="text-xs font-bold text-indigo-800 uppercase tracking-wide">Monitoring Targets</p>
          </div>
          {profile.post_treatment.targets.map((t, i) => (
            <div key={i} className="flex items-center justify-between py-1.5 border-b border-indigo-100 last:border-0 gap-2">
              <span className="text-xs text-indigo-700">{t.param}</span>
              <Badge className="bg-indigo-600 text-white text-xs flex-shrink-0">{t.target}</Badge>
            </div>
          ))}
        </div>
      )}

      {/* Red flags */}
      {profile.post_treatment.redFlags?.length > 0 && (
        <Alert className="bg-red-50 border-red-300">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <AlertDescription>
            <p className="text-xs font-bold text-red-800 mb-1.5">Red Flag Situations — Act Immediately</p>
            {profile.post_treatment.redFlags.map((f, i) => (
              <div key={i} className="flex items-start gap-1.5 text-xs text-red-800 mb-1.5">
                <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" /> {f}
              </div>
            ))}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}