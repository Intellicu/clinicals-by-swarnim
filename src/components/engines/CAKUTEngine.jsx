import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, ChevronRight, ArrowLeft, Baby, Droplet, Activity, AlertCircle } from "lucide-react";

const SUB_ENGINES = [
  { id: "puv", label: "PUV — Posterior Urethral Valves", desc: "URGENT: Male infant + bilateral HN + distended bladder", color: "bg-red-600" },
  { id: "vur", label: "VUR — Vesicoureteric Reflux", desc: "Grade I–V · CAP vs surgery · RIVUR trial", color: "bg-orange-600" },
  { id: "antenatal_hydro", label: "Antenatal Hydronephrosis", desc: "UTD classification, postnatal workup", color: "bg-blue-600" },
  { id: "upj", label: "UPJ Obstruction", desc: "Diagnosis, MAG3, pyeloplasty indications", color: "bg-teal-600" },
  { id: "megaureter", label: "Megaureter", desc: "Primary vs secondary, obstructed vs reflux", color: "bg-violet-600" },
  { id: "mcdk", label: "Multicystic Dysplastic Kidney", desc: "Involution monitoring, contralateral VUR", color: "bg-slate-600" },
  { id: "sfk", label: "Solitary Functioning Kidney", desc: "Compensatory hypertrophy, monitoring protocol", color: "bg-green-600" },
  { id: "duplex", label: "Duplex System / Ureterocele", desc: "Upper-lower pole, ureterocele, obstruction", color: "bg-purple-600" },
];

const ENGINE_CONTENT = {
  puv: {
    title: "Posterior Urethral Valves — URGENT",
    steps: [
      { heading: "⚠️ Red Flag Recognition — Suspect PUV if:", color: "bg-red-50 border-red-300", items: [
        "Male infant + bilateral hydronephrosis on antenatal or postnatal USG",
        "Distended bladder that does not empty on repeat scan",
        "Poor urinary stream / dribbling urine in male neonate",
        "Oligohydramnios on antenatal scan + male fetus",
        "Elevated creatinine in male neonate (above age-adjusted norm)",
      ]},
      { heading: "Immediate Investigations", color: "bg-blue-50 border-blue-200", items: [
        "Renal + bladder USG STAT: Bilateral HN + thick-walled bladder + dilated posterior urethra",
        "Serum creatinine + electrolytes: Assess renal function severity",
        "VCUG (voiding cystourethrogram): Gold standard — posterior urethral dilation = PUV",
        "Urinalysis: UTI screen (common at presentation)",
        "CXR if oligohydramnios: Pulmonary hypoplasia assessment",
      ]},
      { heading: "Management", color: "bg-green-50 border-green-200", items: [
        "Insert urethral catheter IMMEDIATELY — decompress bladder (8 Fr catheter)",
        "Post-obstructive diuresis: IV fluids replacement (urine output ml for ml for first 12h)",
        "Correct electrolytes: Hyperkalaemia, metabolic acidosis common",
        "Prophylactic antibiotics: Trimethoprim 2 mg/kg OD until definitive treatment",
        "Cystoscopic valve ablation (endoscopic): Definitive treatment when stable (>2–3 kg weight)",
        "Bilateral ureterostomy: If too small for cystoscopy or upper tract decompression needed",
      ]},
      { heading: "Long-term Monitoring (CKD Risk High)", color: "bg-amber-50 border-amber-200", items: [
        "eGFR every 3 months for 2 years, then 6-monthly: 30% reach ESKD by 30 years",
        "BP every 3 months: Hypertension very common post-PUV",
        "UPCR every 6 months: Proteinuria = poor prognosis marker",
        "Renal USG 6-monthly: Hydronephrosis resolution, bladder wall thickness",
        "Urodynamics at 1 year: 'Valve bladder' — detrusor overactivity + high pressure storage",
        "ACEi/ARB: If UPCR >0.2 mg/mg — renoprotective",
      ]},
    ]
  },
  vur: {
    title: "VUR — Vesicoureteric Reflux",
    steps: [
      { heading: "VUR Grading (International Classification)", color: "bg-blue-50 border-blue-200", items: [
        "Grade I: Reflux into ureter only (no pelvic dilation)",
        "Grade II: Reflux into collecting system; no calyceal dilation",
        "Grade III: Mild-moderate calyceal dilation; fornices preserved",
        "Grade IV: Moderate dilation; blunted fornices",
        "Grade V: Gross dilation + tortuous ureter + calyceal clubbing",
      ]},
      { heading: "Management by Grade (RIVUR Trial 2014 Evidence)", color: "bg-green-50 border-green-200", items: [
        "Grade I–II: Observation + good voiding habits; treat BBD; annual USG; no CAP unless recurrent UTI",
        "Grade III–IV: Continuous antibiotic prophylaxis (CAP) + annual DMSA; RIVUR trial: CAP reduces febrile UTI by 50% in grades I–IV + BBD",
        "Grade V: Early ureteric reimplantation (open Politano-Leadbetter or laparoscopic); manage associated renal dysplasia",
        "CAP drug choice: Trimethoprim 2 mg/kg OD or Nitrofurantoin 1 mg/kg OD (avoid in infants <3m or G6PD)",
        "Endoscopic STING (submucosal injection): Grades III–IV with breakthrough UTI on CAP — 70–80% success rate 1 injection",
      ]},
      { heading: "DMSA Scan — When and How to Use", color: "bg-amber-50 border-amber-200", items: [
        "Acute DMSA: 4–6 months after febrile UTI — detects renal scarring (not acute pyelonephritis)",
        "Grade III–IV VUR: DMSA at 1 year (baseline) and 3 years (scar progression)",
        "Differential function <45%: May indicate severe dysplasia — surgical planning",
        "New scars on serial DMSA despite CAP: Consider ureteric reimplantation",
      ]},
      { heading: "Long-term Monitoring", color: "bg-slate-50 border-slate-200", items: [
        "eGFR 6-monthly for 2 years post-resolution, then annually",
        "BP annually: Renal scarring → hypertension risk",
        "UPCR annually: Reflux nephropathy + scarring → proteinuria",
        "ACEi/ARB: If UPCR >0.2 mg/mg or hypertension",
        "VUR often resolves spontaneously by age 5–6y in grades I–III",
      ]},
    ]
  },
  antenatal_hydro: {
    title: "Antenatal Hydronephrosis Engine",
    steps: [
      { heading: "UTD Classification (Antenatal)", color: "bg-blue-50 border-blue-200", items: [
        "UTD A1 (Low risk): APD 4–<7mm (<28w) or 7–<10mm (≥28w) — postnatal USG at 4–6 weeks",
        "UTD A2–3 (Intermediate-High): APD ≥10mm (<28w) or ≥10mm (≥28w) + calyceal dilation — Postnatal evaluation + VCUG",
        "Bilateral or single kidney: Refer maternal-fetal medicine; consider vesicocentesis if oligohydramnios",
      ]},
      { heading: "Postnatal Management Algorithm", color: "bg-green-50 border-green-200", items: [
        "Do NOT obtain postnatal USG in first 24–48h (physiological oliguria may underestimate)",
        "Postnatal USG at 4–6 weeks: APD <10mm = reassurance; ≥10mm = continue workup",
        "VCUG: If bilateral HN, male infant, or UTD A2–3 (rule out PUV/VUR)",
        "MAG3 diuretic renogram: If HN persists >10mm or concern for obstruction",
        "Prophylactic antibiotics: If VCUG shows VUR or high-grade bilateral HN",
      ]},
    ]
  },
  upj: {
    title: "UPJ Obstruction Engine",
    steps: [
      { heading: "Diagnosis", color: "bg-amber-50 border-amber-200", items: [
        "SFU Grade 1–4 on postnatal USG (grade 3–4 = significant)",
        "MAG3 diuretic renogram: Differential function + washout t½ (>20 min = obstructed)",
        "Differential renal function <40% to affected side → surgical consideration",
      ]},
      { heading: "Pyeloplasty Indications (Anderson-Hynes)", color: "bg-red-50 border-red-200", items: [
        "Differential function <40% OR drop >10% on serial scans",
        "Washout t½ >20 minutes + symptoms (pain, UTI, palpable mass)",
        "Bilateral UPJ obstruction or single kidney with obstruction",
        "Conservative follow-up: Grade 1–2, function >45%, asymptomatic — USG every 6 months",
      ]},
    ]
  },
  megaureter: {
    title: "Megaureter Engine",
    steps: [
      { heading: "Classification", color: "bg-violet-50 border-violet-200", items: [
        "Primary obstructed megaureter: Adynamic juxtavesical segment → surgical repair",
        "Primary refluxing megaureter: VUR grade IV–V → VCUG, CAP vs reimplantation",
        "Secondary megaureter: Posterior urethral valves, neurogenic bladder, prune belly",
        "Diameter >7mm in neonate = megaureter",
      ]},
      { heading: "Management", color: "bg-green-50 border-green-200", items: [
        "Prophylactic antibiotics: Trimethoprim 2 mg/kg OD for high-grade refluxing megaureter",
        "MAG3 renogram: Functional obstruction vs non-obstructed",
        "Surgical reimplantation: Poor function, recurrent UTI, progressive dilation",
        "Most non-obstructed primary megaureters: Resolution by 2 years with conservative management",
      ]},
    ]
  },
  mcdk: {
    title: "Multicystic Dysplastic Kidney Engine",
    steps: [
      { heading: "Diagnosis & Natural History", color: "bg-teal-50 border-teal-200", items: [
        "Non-communicating cysts of variable size, no normal renal parenchyma",
        "Usually unilateral; bilateral = lethal (Potter sequence)",
        "Spontaneous involution: 60% by 5 years, 80% by 10 years",
        "Risk of hypertension from involuted MCDK — document BP annually",
      ]},
      { heading: "Monitoring Protocol", color: "bg-blue-50 border-blue-200", items: [
        "USG every 6–12 months until involution confirmed",
        "VCUG: Contralateral kidney — 10–18% have VUR",
        "Nephrectomy indications: Hypertension, recurrent pain, non-involution at >5 years, Wilms tumor concern (rare)",
        "Long-term: Annual BP, eGFR, UPCR — compensatory hypertrophy → glomerulomegaly → proteinuria risk",
      ]},
    ]
  },
  sfk: {
    title: "Solitary Functioning Kidney Engine",
    steps: [
      { heading: "Associated Anomalies — Must Check", color: "bg-red-50 border-red-200", items: [
        "Contralateral MCDK, agenesis, ectopia, cross-fused ectopia",
        "Ipsilateral: VUR, UPJ obstruction, duplex system — USG + VCUG",
        "Genital: Undescended testis (males), Müllerian abnormalities (females) — especially HNF1B",
        "Vertebral anomalies: VACTERL association",
      ]},
      { heading: "Monitoring Protocol", color: "bg-green-50 border-green-200", items: [
        "eGFR (Schwartz) every 6 months for 2 years, then annually",
        "UPCR annually — early marker of hyperfiltration injury",
        "BP every 6 months — treat ≥90th percentile",
        "Avoid nephrotoxins: NSAIDs, aminoglycosides, IV contrast (use NAC)",
        "Annual USG: Monitor compensatory hypertrophy and for acquired cysts",
        "ACEi/ARB if UPCR >0.2 mg/mg",
      ]},
    ]
  },
  duplex: {
    title: "Duplex System / Ureterocele Engine",
    steps: [
      { heading: "Anatomy & Classification", color: "bg-purple-50 border-purple-200", items: [
        "Complete duplex: Two separate ureters; upper pole ureter inserts lower (Weigert-Meyer rule)",
        "Upper pole: Tends to obstruct (ureterocele) or ectopic insertion",
        "Lower pole: Tends to reflux (VUR)",
        "Ureterocele: Cystic dilation of intravesical ureter — can obstruct bladder outlet",
      ]},
      { heading: "Investigation Pathway", color: "bg-blue-50 border-blue-200", items: [
        "USG: Upper pole cyst, caliectasis, ureterocele in bladder",
        "VCUG: VUR to lower pole; check if ureterocele causes bladder outlet obstruction",
        "MAG3 renogram: Upper pole differential function (if <10% = non-functioning)",
        "MRI urography: Best delineation of complex duplex anatomy",
      ]},
      { heading: "Management", color: "bg-green-50 border-green-200", items: [
        "Incidental ureterocele + normal function: CAP + observation",
        "Obstructing ureterocele: Endoscopic puncture (1st line) — risk of de novo VUR",
        "Non-functioning upper pole: Upper pole heminephroureterectomy",
        "Low-grade VUR to lower pole: CAP → resolution in 50% by 5 years",
      ]},
    ]
  },
};

export default function CAKUTEngine() {
  const [selected, setSelected] = useState(null);

  if (!selected) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl bg-gradient-to-r from-teal-700 to-blue-600 p-4 text-white">
          <div className="flex items-center gap-2 mb-1">
            <Baby className="w-5 h-5" />
            <h3 className="text-sm font-bold">CAKUT Diagnostic Engine</h3>
            <Badge className="bg-white/20 text-white text-xs border-white/30">Congenital Anomalies</Badge>
          </div>
          <p className="text-xs text-teal-100">Select a CAKUT sub-module for detailed decision support</p>
        </div>
        <div className="grid gap-2">
          {SUB_ENGINES.map(eng => (
            <button key={eng.id} onClick={() => setSelected(eng.id)}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-white text-left shadow-sm ${eng.color || "bg-teal-600"} hover:opacity-90 active:scale-95 transition-all`}>
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold">{eng.label}</p>
                <p className="text-xs opacity-80 mt-0.5">{eng.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const content = ENGINE_CONTENT[selected];
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-teal-700 to-blue-600 p-4 text-white">
        <div className="flex items-center gap-2">
          <Baby className="w-5 h-5" />
          <h3 className="text-sm font-bold">{content.title}</h3>
        </div>
      </div>
      {content.steps.map((s, i) => (
        <div key={i} className={`rounded-xl border-2 p-3 ${s.color}`}>
          <p className="text-xs font-bold text-slate-800 mb-2">{s.heading}</p>
          {s.items.map((item, j) => (
            <div key={j} className="flex items-start gap-1.5 text-xs text-slate-700 mb-1">
              <ChevronRight className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-teal-600" />{item}
            </div>
          ))}
        </div>
      ))}
      <Button variant="outline" onClick={() => setSelected(null)} className="w-full">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to CAKUT Modules
      </Button>
    </div>
  );
}