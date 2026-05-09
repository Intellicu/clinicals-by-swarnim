import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pill, Copy, CheckCircle, AlertTriangle, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const PRESCRIPTION_TEMPLATES = {
  "Nephrotic Syndrome": [
    {
      id: "ns_relapse_ispn",
      name: "NS Relapse — ISPN 2023",
      indication: "Idiopathic nephrotic syndrome relapse (urine protein 3+ × 3 days)",
      drugs: [
        { name: "Prednisolone", dose: "2 mg/kg/day", max: "60 mg/day", duration: "4 weeks", frequency: "OD morning", route: "PO", note: "Then taper to 1.5 mg/kg alternate days × 4 weeks" }
      ],
      monitoring: ["Urine dipstick daily", "BP weekly", "Weight weekly", "Fasting blood sugar if symptomatic"],
      red_flags: ["BP >95th percentile", "Creatinine rise >25%", "Fever during relapse"],
      evidence: "ISPN 2023",
      doi: "https://doi.org/10.1038/s41581-023-00706-x"
    },
    {
      id: "frns_levamisole",
      name: "FRNS — Levamisole (ISKDC)",
      indication: "Frequently relapsing nephrotic syndrome (≥2 relapses/6mo)",
      drugs: [
        { name: "Levamisole", dose: "2.5 mg/kg", max: "150 mg", duration: "12–24 months", frequency: "Alternate days", route: "PO", note: "Monitor CBC every 3 months" }
      ],
      monitoring: ["CBC every 3 months (agranulocytosis risk)", "Urine dipstick weekly", "LFT every 6 months"],
      red_flags: ["ANC <1500/μL — stop immediately", "Fever + neutropenia"],
      evidence: "ISPN 2023 / ISKDC",
      doi: "https://doi.org/10.1038/s41581-023-00706-x"
    },
    {
      id: "srns_tacrolimus",
      name: "SRNS — Tacrolimus (ISPN 2023)",
      indication: "Steroid-resistant nephrotic syndrome (no remission after 8 weeks pred)",
      drugs: [
        { name: "Tacrolimus", dose: "0.1–0.2 mg/kg/day", max: null, duration: "12–24 months", frequency: "BD (12-hourly)", route: "PO", note: "Target trough 5–10 ng/mL. Take on empty stomach" },
        { name: "Prednisolone", dose: "0.5 mg/kg", max: "40 mg", duration: "Concurrent", frequency: "Alternate days", route: "PO", note: "Concurrent low-dose steroid" }
      ],
      monitoring: ["Tacrolimus trough (AM before dose) monthly", "Renal function monthly", "BP weekly", "Urine PCR monthly", "Fasting blood sugar"],
      red_flags: ["Trough >12 ng/mL — nephrotoxicity risk", "Creatinine rise >25%", "New-onset hypertension"],
      evidence: "ISPN 2023",
      doi: "https://doi.org/10.1038/s41581-023-00706-x"
    }
  ],
  "Hypertension": [
    {
      id: "ckd_htn_acei",
      name: "CKD Hypertension — ACE Inhibitor (ESCAPE/KDIGO)",
      indication: "CKD with proteinuria and/or hypertension (target BP <50th %ile)",
      drugs: [
        { name: "Ramipril", dose: "0.05–0.1 mg/kg/day", max: "10 mg/day", duration: "Long-term", frequency: "OD", route: "PO", note: "Start low, titrate. Monitor K+ and creatinine at 1 week" }
      ],
      monitoring: ["BP weekly initially", "Serum K+ at 1 week, then monthly", "Creatinine at 1 week then monthly", "Urine PCR monthly"],
      red_flags: ["K+ >5.5 mmol/L — reduce dose or stop", "Creatinine rise >30% above baseline — stop", "Dry cough (switch to ARB)"],
      evidence: "KDIGO 2012 / ESCAPE Trial",
      doi: "https://doi.org/10.1681/ASN.2009060642"
    },
    {
      id: "htn_emergency_iv",
      name: "Hypertensive Emergency — IV Labetalol",
      indication: "BP >Stage 2 with symptoms (headache, seizure, vision change)",
      drugs: [
        { name: "Labetalol IV", dose: "0.2–1 mg/kg/dose", max: "40 mg/dose", duration: "Acute", frequency: "IV bolus over 2 min; repeat q10 min PRN", route: "IV", note: "Max 3 mg/kg total. Avoid in asthma/heart block" }
      ],
      monitoring: ["BP every 5 minutes during infusion", "HR continuous monitoring", "Neurological status hourly", "Renal function 6-hourly"],
      red_flags: ["Bradycardia <50 bpm — stop", "Bronchospasm", "BP drop >25% in first hour (overshoot risk)"],
      evidence: "AAP 2017 / KDIGO",
      doi: "https://doi.org/10.1542/peds.2017-1904"
    }
  ],
  "Dialysis": [
    {
      id: "pd_peritonitis",
      name: "PD Peritonitis — Empirical (ISPD 2022)",
      indication: "PD peritonitis: cloudy effluent + WBC >100/μL (>50% PMN)",
      drugs: [
        { name: "Cefazolin IP", dose: "15 mg/kg", max: null, duration: "At least 14 days", frequency: "Each exchange (long dwell)", route: "Intraperitoneal", note: "Covers Gram-positives including Staph" },
        { name: "Ceftazidime IP", dose: "15 mg/kg", max: null, duration: "At least 14 days", frequency: "Each exchange (long dwell)", route: "Intraperitoneal", note: "Gram-negative coverage. Await culture and adjust" }
      ],
      monitoring: ["Effluent cell count day 3 and day 5", "Culture and sensitivity — adjust antibiotics", "Signs of response by day 3 (clearing)"],
      red_flags: ["No improvement by day 5 — consider catheter removal", "Fungi on culture — immediate catheter removal", "Refractory or recurrent peritonitis"],
      evidence: "ISPD 2022",
      doi: "https://doi.org/10.1177/08968608221093073"
    }
  ]
};

function DrugRow({ drug }) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 mb-1.5">
      <div className="flex items-start justify-between gap-2">
        <span className="font-bold text-sm text-blue-900">{drug.name}</span>
        <span className="text-xs text-blue-700 font-mono bg-blue-100 px-1.5 py-0.5 rounded">{drug.route}</span>
      </div>
      <div className="flex flex-wrap gap-2 mt-1 text-xs text-blue-800">
        <span>Dose: <strong>{drug.dose}</strong></span>
        {drug.max && <span>Max: <strong>{drug.max}</strong></span>}
        <span>Freq: <strong>{drug.frequency}</strong></span>
        <span>Duration: <strong>{drug.duration}</strong></span>
      </div>
      {drug.note && <p className="text-xs text-slate-600 mt-1 italic">{drug.note}</p>}
    </div>
  );
}

function TemplateCard({ template }) {
  const [copied, setCopied] = useState(false);

  const copyText = () => {
    const text = [
      `Prescription: ${template.name}`,
      `Indication: ${template.indication}`,
      ``,
      `MEDICATIONS:`,
      ...template.drugs.map(d => `• ${d.name}: ${d.dose} (max ${d.max || "—"}) ${d.frequency} × ${d.duration} [${d.route}]${d.note ? ` — ${d.note}` : ""}`),
      ``,
      `MONITORING: ${template.monitoring.join("; ")}`,
      `RED FLAGS: ${template.red_flags.join("; ")}`,
      `Evidence: ${template.evidence}`,
    ].join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Prescription copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden mb-3">
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-3 py-2.5 border-b border-slate-200 flex items-start justify-between gap-2">
        <div>
          <h4 className="font-bold text-sm text-slate-900">{template.name}</h4>
          <p className="text-xs text-slate-500 mt-0.5">{template.indication}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Badge className="text-xs bg-blue-600 text-white border-0">{template.evidence}</Badge>
          <Button size="sm" variant="outline" onClick={copyText} className="h-7 px-2 text-xs">
            {copied ? <CheckCircle className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
          </Button>
        </div>
      </div>
      <div className="p-3 space-y-2">
        <div>
          {template.drugs.map((d, i) => <DrugRow key={i} drug={d} />)}
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
          <p className="text-xs font-bold text-amber-800 mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Red Flags</p>
          <ul className="space-y-0.5">
            {template.red_flags.map((f, i) => <li key={i} className="text-xs text-amber-700">• {f}</li>)}
          </ul>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-2">
          <p className="text-xs font-bold text-green-800 mb-1">Monitoring</p>
          <ul className="space-y-0.5">
            {template.monitoring.map((m, i) => <li key={i} className="text-xs text-green-700">• {m}</li>)}
          </ul>
        </div>
        {template.doi && (
          <a href={template.doi} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-600 hover:underline mt-1">
            <ExternalLink className="w-3 h-3" />View guideline source
          </a>
        )}
      </div>
    </div>
  );
}

export default function StructuredPrescriptionPanel({ category }) {
  const categories = category
    ? [category]
    : Object.keys(PRESCRIPTION_TEMPLATES);

  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const templates = PRESCRIPTION_TEMPLATES[activeCategory] || [];

  return (
    <div>
      {!category && (
        <div className="flex gap-1.5 flex-wrap mb-3">
          {Object.keys(PRESCRIPTION_TEMPLATES).map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1 text-xs rounded-full font-semibold border transition-colors ${activeCategory === cat ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"}`}>
              {cat}
            </button>
          ))}
        </div>
      )}
      {templates.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-6">No templates for this category.</p>
      ) : (
        templates.map(t => <TemplateCard key={t.id} template={t} />)
      )}
    </div>
  );
}