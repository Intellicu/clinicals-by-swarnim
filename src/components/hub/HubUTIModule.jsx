import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Microscope, ArrowRight } from "lucide-react";

const AGE_PATHWAYS = {
  neonate: {
    label: "Neonate (<28 days)", urgency: "Sepsis workup mandatory", ref: "ISPN/AAP/NICE",
    keySteps: [
      "Full septic workup: CBC, CRP, blood culture, CSF, urine culture (SPA/catheter)",
      "IV antibiotics: Ampicillin 50mg/kg q12h + Gentamicin 5mg/kg q24h",
      "Duration: 10–14 days IV if culture positive",
      "Imaging: Renal-bladder USS within 24–48h",
      "VCUG: after treatment if USS abnormal",
    ],
    antibiotics: [
      { drug: "Ampicillin", dose: "50 mg/kg/dose q12h IV", note: "GBS, Listeria coverage." },
      { drug: "Gentamicin", dose: "5 mg/kg q24h IV", note: "TDM required." },
      { drug: "Cefotaxime", dose: "50 mg/kg q12h IV", note: "Alternative." },
    ]
  },
  infant: {
    label: "Infant (1–24 months)", urgency: "Febrile UTI — imaging needed", ref: "ISPN 2020 / AAP 2021",
    keySteps: [
      "Catheter/SPA specimen preferred",
      "IV/IM if <3 months or unwell: Ceftriaxone 50mg/kg/day",
      "Oral if >3 months, well: TMP-SMX or cefixime",
      "Duration: 7–10 days febrile UTI",
      "RBUS after first febrile UTI",
    ],
    antibiotics: [
      { drug: "Ceftriaxone", dose: "50 mg/kg/day IV/IM OD", note: "If <3mo or unwell." },
      { drug: "Cefixime", dose: "8 mg/kg/day PO BID", note: "Oral step-down." },
      { drug: "TMP-SMX", dose: "6–12 mg TMP/kg/day BID", note: "Check resistance." },
    ]
  },
  child: {
    label: "Child (2–12 years)", urgency: "Depends on severity", ref: "ISPN 2020",
    keySteps: [
      "Clean MSU — proper mid-stream collection",
      "Oral antibiotics first-line if not systemically unwell",
      "Duration: 5 days lower UTI; 7–10 febrile UTI",
      "Screen for BBD: bladder diary, bowel habits, voiding pattern",
      "CAP if VUR Grade III–IV or recurrent febrile UTI",
    ],
    antibiotics: [
      { drug: "TMP-SMX", dose: "6 mg TMP/kg/day BID PO", note: "First-line if susceptible." },
      { drug: "Cephalexin", dose: "25 mg/kg/day QID PO", note: "Oral cephalosporin." },
      { drug: "Nitrofurantoin (CAP)", dose: "1–2 mg/kg/day OD HS", note: "Long-term prophylaxis." },
    ]
  },
  resistant: {
    label: "MDR/ESBL Organisms", urgency: "MDR UTI — escalation needed", ref: "ISPN / Local AST",
    keySteps: [
      "ESBL-producing organisms — no cephalosporins",
      "IV Meropenem: 20mg/kg q8h",
      "Oral: Fosfomycin (if susceptible) for lower UTI",
      "Duration: minimum 10–14 days for febrile MDR UTI",
    ],
    antibiotics: [
      { drug: "Meropenem", dose: "20 mg/kg q8h IV", note: "ESBL first choice." },
      { drug: "Ertapenem", dose: "15–20 mg/kg/day OD IV", note: "Outpatient-friendly." },
      { drug: "Fosfomycin", dose: "100 mg/kg/day q8h IV", note: "ESBL lower UTI." },
    ]
  }
};

export default function HubUTIModule() {
  const [ageGroup, setAgeGroup] = useState("infant");
  const current = AGE_PATHWAYS[ageGroup];
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-red-700 to-orange-600 p-5 text-white">
        <div className="flex items-center gap-3">
          <Microscope className="w-7 h-7" />
          <div>
            <h2 className="text-xl font-bold">UTI & Antimicrobial Stewardship</h2>
            <p className="text-red-100 text-sm">ISPN-based · Age-stratified pathways · Antibiotic cards · Imaging logic · CAP · Resistant organisms</p>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {Object.entries(AGE_PATHWAYS).map(([key, val]) => (
          <button key={key} onClick={() => setAgeGroup(key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all ${ageGroup === key ? "bg-red-600 text-white border-red-600" : "bg-white text-slate-600 border-slate-200 hover:border-red-300"}`}>
            {val.label}
          </button>
        ))}
      </div>
      <Card className={`border-2 ${ageGroup === "resistant" ? "border-red-400 bg-red-50" : "border-blue-200 bg-blue-50"}`}>
        <CardContent className="p-4">
          <div className="flex items-center flex-wrap gap-2 mb-3">
            <h3 className="font-bold text-slate-800">{current.label}</h3>
            <Badge className="bg-blue-100 text-blue-700 text-xs">{current.urgency}</Badge>
          </div>
          <div className="space-y-2 mb-4">
            {current.keySteps.map((step, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="w-5 h-5 bg-white border-2 border-blue-300 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                <p className="text-xs text-slate-700">{step}</p>
              </div>
            ))}
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Antibiotic Cards</p>
          <div className="space-y-2">
            {current.antibiotics.map((ab, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-3">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <p className="font-bold text-sm text-slate-800">{ab.drug}</p>
                  <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{ab.dose}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{ab.note}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-3">
          <p className="text-sm font-bold text-amber-800 mb-2">Imaging Decision Logic (ISPN/NICE)</p>
          <div className="space-y-1.5 text-xs">
            <p className="text-slate-600"><span className="font-bold">RBUS:</span> All children after first febrile UTI, unusual organism, poor response, &lt;3 months age.</p>
            <p className="text-slate-600"><span className="font-bold">VCUG:</span> Abnormal RBUS, Grade 3+ VUR suspected, sibling with VUR, recurrent febrile UTI in males.</p>
            <p className="text-slate-600"><span className="font-bold">DMSA:</span> Acute cortical defects. Scar assessment: &gt;6 months post-UTI.</p>
            <p className="text-slate-600"><span className="font-bold">CAP indications:</span> VUR Grade III–IV, recurrent febrile UTI despite treatment, post-transplant.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}