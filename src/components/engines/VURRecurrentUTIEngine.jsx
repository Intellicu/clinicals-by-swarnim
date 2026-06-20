import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, ChevronRight, ArrowLeft, Activity, AlertCircle, Microscope } from "lucide-react";

// Recurrent UTI risk factors (Revised ISPN 2023)
const RISK_FACTORS = [
  { id: "age_lt2", label: "Age < 2 years (higher risk group)" },
  { id: "male_uncircumcised", label: "Uncircumcised male <1 year" },
  { id: "febrile", label: "Febrile UTI (temp >38°C) — upper tract involvement" },
  { id: "recurrent", label: "≥2 febrile UTIs in 12 months or ≥3 any UTIs" },
  { id: "antenatal_hdn", label: "Antenatal hydronephrosis (SFU grade ≥2)" },
  { id: "bbd", label: "Bladder-bowel dysfunction (BBD) — ISPN key risk factor" },
  { id: "family_hx_vur", label: "Family history of VUR (1st-degree relative)" },
  { id: "abnormal_usg", label: "Abnormal renal USS (hydroureteronephrosis, scarring, parenchymal thinning)" },
  { id: "dmsa_scar", label: "DMSA-confirmed renal scar (permanent cortical defect)" },
  { id: "single_kidney", label: "Solitary / duplex kidney" },
];

// Management aligned with Revised ISPN 2023 (conservative; prophylaxis limited to high-grade)
const VUR_GRADES = [
  { grade: "I", desc: "Ureter only (no calyceal filling)", management: "Low-grade — no antibiotic prophylaxis. High spontaneous resolution. Treat BBD if present." },
  { grade: "II", desc: "Ureter + pelvis without dilation", management: "Low-grade — no antibiotic prophylaxis. Consider only if recurrent febrile UTI with BBD." },
  { grade: "III", desc: "Mild to moderate ureteral dilation", management: "High-grade — antibiotic prophylaxis first-line + evaluate/treat BBD with urotherapy." },
  { grade: "IV", desc: "Marked dilation with tortuous ureter", management: "High-grade — prophylaxis + treat BBD. Surgery only for breakthrough febrile UTI despite prophylaxis." },
  { grade: "V", desc: "Severe dilation, intrarenal reflux", management: "High-grade — prophylaxis + treat BBD. Reimplantation if breakthrough febrile UTI despite prophylaxis." },
];

export default function VURRecurrentUTIEngine() {
  const [step, setStep] = useState(0);
  const [riskFactors, setRiskFactors] = useState({});
  const [vurGrade, setVurGrade] = useState("");
  const [hasDMSA, setHasDMSA] = useState(null);
  const [hasScarring, setHasScarring] = useState(null);

  const toggle = (id) => setRiskFactors(r => ({ ...r, [id]: !r[id] }));
  const riskScore = Object.values(riskFactors).filter(Boolean).length;
  const risk = riskScore >= 4 ? "High" : riskScore >= 2 ? "Intermediate" : "Low";

  const RISK_COLORS = { High: "bg-red-600 text-white", Intermediate: "bg-amber-500 text-white", Low: "bg-green-500 text-white" };

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-teal-700 to-cyan-600 p-4 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Activity className="w-5 h-5" />
          <h3 className="text-sm font-bold">Recurrent UTI / VUR Intelligence Engine</h3>
          <Badge className="bg-white/20 text-white text-xs border-white/30">Revised ISPN 2023 · IPNA</Badge>
        </div>
        <p className="text-xs text-teal-100">ISPN 2023: Risk stratification → Conservative imaging → VUR grading → Management → Follow-up</p>
      </div>

      {step === 0 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-700">Select ALL risk factors present:</p>
          {RISK_FACTORS.map(q => (
            <button key={q.id} onClick={() => toggle(q.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-left text-sm ${riskFactors[q.id] ? "bg-teal-50 border-teal-300 text-teal-800" : "bg-white border-slate-200 text-slate-700"}`}>
              {riskFactors[q.id] ? <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" /> : <Circle className="w-4 h-4 text-slate-300 flex-shrink-0" />}
              {q.label}
            </button>
          ))}
          <div className={`rounded-xl p-3 text-center ${RISK_COLORS[risk]}`}>
            <p className="font-bold text-sm">Risk Level: {risk} ({riskScore} factors)</p>
          </div>
          <Button className="w-full bg-teal-600 hover:bg-teal-700" onClick={() => setStep(1)}>Imaging Algorithm <ChevronRight className="w-4 h-4 ml-1" /></Button>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-800">Imaging Recommendations:</p>
          {[
            { test: "Ultrasound KUB", when: "ALL children after a UTI (kidneys, ureters, bladder). Detects anomalies and clues to BBD.", icon: "🔍" },
            { test: "MCU / VCUG", when: "ONLY if: non-E. coli UTI in a child <2 years, abnormal ultrasound, OR recurrent UTI. Perform after the UTI is treated (≈2–3 weeks). Restricting MCU improves yield and avoids radiation.", icon: "📷" },
            { test: "Late-phase DMSA", when: "ONLY for recurrent UTI or high-grade VUR — perform 4–6 months after UTI to detect permanent scars. AVOID acute-phase DMSA (low specificity; cannot distinguish acute pyelonephritis from scar).", icon: "☢️" },
            { test: "MAG3 Diuretic Renogram", when: "If ultrasound shows significant hydronephrosis — rule out obstruction (UPJ/UVJ).", icon: "🔬" },
          ].map((item, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-sm font-bold text-slate-800">{item.icon} {item.test}</p>
              <p className="text-xs text-slate-600 mt-1">{item.when}</p>
            </div>
          ))}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(0)} className="flex-1"><ArrowLeft className="w-4 h-4 mr-1" />Back</Button>
            <Button className="flex-1 bg-teal-600 hover:bg-teal-700" onClick={() => setStep(2)}>VUR Grading <ChevronRight className="w-4 h-4 ml-1" /></Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-700">VUR Grade on VCUG:</p>
          {VUR_GRADES.map(g => (
            <button key={g.grade} onClick={() => setVurGrade(g.grade)}
              className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl border-2 transition-all text-left ${vurGrade === g.grade ? "border-teal-500 bg-teal-50" : "border-slate-200 bg-white hover:border-slate-300"}`}>
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${vurGrade === g.grade ? "bg-teal-600 text-white" : "bg-slate-200 text-slate-700"}`}>
                {g.grade}
              </span>
              <div>
                <p className={`text-sm font-semibold ${vurGrade === g.grade ? "text-teal-800" : "text-slate-800"}`}>{g.desc}</p>
                <p className="text-xs text-slate-500 mt-0.5">{g.management}</p>
              </div>
            </button>
          ))}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(1)} className="flex-1"><ArrowLeft className="w-4 h-4 mr-1" />Back</Button>
            <Button className="flex-1 bg-teal-600 hover:bg-teal-700" disabled={!vurGrade} onClick={() => setStep(3)}>Management Plan <ChevronRight className="w-4 h-4 ml-1" /></Button>
          </div>
        </div>
      )}

      {step === 3 && vurGrade && (
        <div className="space-y-3">
          {[
            { title: "Antibiotic Prophylaxis — ISPN 2023 (limited indications)", color: "bg-blue-50 border-blue-200", items: [
              "Indicated: high-grade VUR (grades III–V)",
              "Also: recurrent febrile UTI with BBD (irrespective of VUR); infants with low-grade VUR may be considered",
              "NOT for normal urinary tract or low-grade VUR alone; NOT for antenatal hydronephrosis awaiting evaluation",
              "Cotrimoxazole or nitrofurantoin (>3 months); cephalexin in young infants — AVOID amoxicillin-clavulanate (resistance)",
              "BBD MUST be treated concurrently with urotherapy (± laxatives) — strong recommendation",
              "Discontinue if toilet-trained, no BBD, and no febrile UTI in the preceding 1 year",
            ]},
            { title: "Endoscopic Correction (bulking agent)", color: "bg-amber-50 border-amber-200", items: [
              "Subureteric injection of a bulking agent — minimally invasive",
              "Lower success rate than ureteric reimplantation — discuss with caregivers",
              "An option where there is parental hesitancy to use long-term antibiotics",
            ]},
            { title: "Surgical Reimplantation", color: "bg-green-50 border-green-200", items: [
              "Reserved for recurrent breakthrough febrile UTI despite prophylaxis AND optimal BBD management",
              "More effective than prophylaxis at preventing febrile UTI, but neither reduces the risk of kidney scarring",
              "Cohen cross-trigonal reimplantation (most common); robotic/laparoscopic options available",
            ]},
            { title: "Follow-up Schedule — ISPN 2023", color: "bg-slate-50 border-slate-200", items: [
              "Ultrasound periodically to monitor kidney growth in persistent high-grade VUR",
              "Repeat cystography NOT routine — only after 4–8 years if deemed necessary",
              "Repeat DMSA only with recurrence of febrile UTI",
              "Reflux nephropathy: growth, BP, proteinuria and kidney function at each visit",
              "Screen siblings <3 years with ultrasound (MCU only if abnormal US or febrile UTI)",
            ]},
          ].map((s, i) => (
            <div key={i} className={`rounded-xl border-2 p-3 ${s.color}`}>
              <p className="text-xs font-bold text-slate-800 mb-2">{s.title}</p>
              {s.items.map((item, j) => <div key={j} className="flex items-start gap-1.5 text-xs text-slate-700 mb-1"><ChevronRight className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-teal-600" />{item}</div>)}
            </div>
          ))}
          <Button className="w-full bg-teal-600 hover:bg-teal-700" onClick={() => { setStep(0); setRiskFactors({}); setVurGrade(""); }}>New Case</Button>
        </div>
      )}
    </div>
  );
}