import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, ChevronRight, ArrowLeft, Activity, AlertCircle, Microscope } from "lucide-react";

// ISPN 2021 Recurrent UTI Risk Factors
const RISK_FACTORS = [
  { id: "age_lt2", label: "Age < 2 years (highest risk group — ISPN 2021)" },
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

const VUR_GRADES = [
  { grade: "I", desc: "Ureter only (no calyceal filling)", management: "Conservative — antibiotics / observation. VCUG in 12–18m if asymptomatic." },
  { grade: "II", desc: "Ureter + pelvis without dilation", management: "Conservative — prophylactic antibiotics if age <2y or recurrent UTI." },
  { grade: "III", desc: "Mild to moderate ureteral dilation", management: "CAP if age <5y with BBD or recurrent UTI. Consider endoscopic (STING) at age 3–5y if fails." },
  { grade: "IV", desc: "Marked dilation with tortuous ureter", management: "STING / endoscopic injection (Deflux) OR surgical reimplantation if breakthrough UTIs or scarring." },
  { grade: "V", desc: "Severe dilation, intrarenal reflux", management: "Surgical reimplantation (Cohen/Politano) — high risk of scarring. DMSA before and after." },
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
          <Badge className="bg-white/20 text-white text-xs border-white/30">ISPN 2021 · IPNA · EAU Guidelines</Badge>
        </div>
        <p className="text-xs text-teal-100">ISPN 2021: Risk stratification → Imaging → VUR grading → Management → Follow-up</p>
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
            { test: "USG Kidneys + Bladder", when: "ALL children with first febrile UTI. Repeat in 6 weeks if abnormal.", icon: "🔍" },
            { test: "VCUG (Voiding Cystourethrogram)", when: risk === "High" ? "RECOMMENDED — High risk: male <2y, bilateral HN, recurrent febrile UTI, abnormal USG, family history VUR" : risk === "Intermediate" ? "Consider — if recurrent febrile UTI or abnormal USG" : "Optional — Low risk; reserve for recurrence or specific indications", icon: "📷" },
            { test: "DMSA Scan", when: "Perform 4–6 MONTHS after acute pyelonephritis to assess for permanent renal scarring", icon: "☢️" },
            { test: "MAG3 Diuretic Renogram", when: "If USG shows significant hydronephrosis — rule out obstruction (UPJ/UVJ)", icon: "🔬" },
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
            { title: "CAP (Continuous Antibiotic Prophylaxis) — ISPN 2021", color: "bg-blue-50 border-blue-200", items: [
              "Trimethoprim 2 mg/kg OD (max 100 mg) — preferred first-line ≥3 months",
              "Nitrofurantoin 1–2 mg/kg OD (≥3 months, ≥40 weeks corrected gestation; avoid in G6PD deficiency)",
              "Cefalexin 10 mg/kg OD — first-line in neonates <3 months and if TMP/NFM contraindicated",
              "ISPN 2021 Indications: VUR grade III–V; recurrent febrile UTI (≥2); DMSA scar; age <1y with dilating VUR; BBD with recurrent UTI",
              "Duration: Until VUR resolves on imaging OR age 5y (re-evaluate) OR puberty; re-VCUG at 18–24m on CAP",
              "ISPN position: BBD MUST be treated concurrently — CAP alone fails if bladder dysfunction untreated",
            ]},
            { title: "Endoscopic (STING/HIT) Procedure", color: "bg-amber-50 border-amber-200", items: [
              "Subureteric injection of Deflux (dextranomer/hyaluronic acid)",
              "Success: Grade III ~75%, Grade IV ~60%, Grade V ~50%",
              "Indication: Breakthrough UTI on CAP, parental preference, grade III–IV",
              "Risk: De novo contralateral VUR in ~5%; ureterovesical obstruction (rare)",
            ]},
            { title: "Surgical Reimplantation", color: "bg-green-50 border-green-200", items: [
              "Cohen cross-trigonal reimplantation (most common in children)",
              "Indication: VUR grade V, failed endoscopic × 2, progressive scarring, parental preference",
              "Success rate >95% for grades III–V",
              "Robotic-assisted reimplantation: Available at specialised centres",
            ]},
            { title: "Follow-up Schedule", color: "bg-slate-50 border-slate-200", items: [
              "USG: Every 6 months while on CAP",
              "VCUG: Repeat at 1–2 years on CAP (resolution = stop CAP)",
              "DMSA: 6 months post-last febrile UTI, then annually if scarring",
              "BP + UPCR: Annually if DMSA shows scarring",
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