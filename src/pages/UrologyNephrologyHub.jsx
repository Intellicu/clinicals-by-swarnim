import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Droplet, Brain, Activity, TestTube, BookOpen,
  Microscope, BarChart2, Users, Heart, FlaskConical,
  ChevronDown, ChevronUp, ExternalLink, ArrowRight,
  Shield, Zap, Info, AlertTriangle, Printer, CheckCircle
} from "lucide-react";

import CAKUTMasterCenter from "../components/cakut/CAKUTMasterCenter";
import NeurogenicBladderCenter from "../components/urology/NeurogenicBladderCenter";
import UroflowAIAnalyzer from "../components/urology/UroflowAIAnalyzer";
import UDSInterpreter from "../components/urology/UDSInterpreter";
import BBDICCSModule from "../components/urology/BBDICCSModule";
import TubularDisorderLab from "../components/tubular/TubularDisorderLab";
import BiostatisticsAcademy from "../components/research/BiostatisticsAcademy";

// ── UTI Master Module ────────────────────────────────────────────────────────
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
      { drug: "Ampicillin", dose: "50 mg/kg/dose q12h IV", note: "GBS, Listeria coverage. Adjust in CKD." },
      { drug: "Gentamicin", dose: "5 mg/kg q24h IV", note: "TDM required. Levels at 1h and 23h." },
      { drug: "Cefotaxime", dose: "50 mg/kg q12h IV", note: "Alternative; less nephrotoxic." },
    ]
  },
  infant: {
    label: "Infant (1–24 months)", urgency: "Febrile UTI — imaging needed", ref: "ISPN 2020 / AAP 2021",
    keySteps: [
      "Catheter/SPA specimen preferred. MSU if toilet trained.",
      "Urinalysis + culture before antibiotics",
      "IV/IM if febrile and unwell: Ceftriaxone 50mg/kg/day",
      "Oral if well: TMP-SMX or cefixime",
      "Duration: 7–10 days febrile UTI",
      "RBUS after first febrile UTI",
    ],
    antibiotics: [
      { drug: "Ceftriaxone", dose: "50 mg/kg/day IV/IM OD", note: "If febrile or systemically unwell." },
      { drug: "Cefixime", dose: "8 mg/kg/day PO BID", note: "Oral step-down. Taxim-O, Cefix." },
      { drug: "TMP-SMX", dose: "6–12 mg TMP/kg/day BID", note: "Check resistance. Avoid under 2 months." },
      { drug: "Nitrofurantoin", dose: "5–7 mg/kg/day QID", note: "Lower UTI ONLY. Not for febrile UTI." },
    ]
  },
  child: {
    label: "Child (2–12 years)", urgency: "Depends on severity", ref: "ISPN 2020",
    keySteps: [
      "Clean MSU — proper mid-stream collection essential",
      "Dipstick + culture before starting antibiotics",
      "Oral antibiotics first-line if not systemically unwell",
      "Duration: 5 days lower UTI; 7–10 febrile UTI",
      "Screen for BBD: bladder diary, bowel habits, voiding pattern",
      "CAP if VUR Grade III–IV or recurrent febrile UTI",
    ],
    antibiotics: [
      { drug: "TMP-SMX", dose: "6 mg TMP/kg/day BID PO", note: "First-line if susceptible. Cekinol." },
      { drug: "Cephalexin", dose: "25 mg/kg/day QID PO", note: "Oral cephalosporin. Ceporex." },
      { drug: "Amox-clavulanate", dose: "25–45 mg/kg/day BID PO", note: "Resistant organisms. Augmentin." },
      { drug: "Nitrofurantoin (CAP)", dose: "1–2 mg/kg/day OD HS", note: "Long-term prophylaxis. Monitor LFTs." },
    ]
  },
  resistant: {
    label: "MDR/ESBL Organisms", urgency: "MDR UTI — escalation needed", ref: "ISPN / Local AST",
    keySteps: [
      "ESBL-producing organisms: E. coli, Klebsiella — no cephalosporins",
      "IV Meropenem: 20mg/kg q8h",
      "Ertapenem: once-daily option for step-down",
      "Oral: Fosfomycin (if susceptible) for lower UTI",
      "Duration: minimum 10–14 days for febrile MDR UTI",
    ],
    antibiotics: [
      { drug: "Meropenem", dose: "20 mg/kg q8h IV", note: "ESBL first choice. eGFR-adjust." },
      { drug: "Ertapenem", dose: "15–20 mg/kg/day OD IV", note: "Outpatient-friendly carbapenem." },
      { drug: "Fosfomycin", dose: "100 mg/kg/day q8h IV", note: "ESBL lower UTI. Oral in some countries." },
      { drug: "Colistin", dose: "2.5–5 mg/kg/day divided q8–12h", note: "Last resort. Monitor renal daily." },
    ]
  }
};

const UTI_FAMILY_TIPS = [
  "Give every dose of antibiotic — do not stop early, even if your child feels better.",
  "Encourage regular voiding — every 2–3 hours, do not hold urine.",
  "Ensure good fluid intake — clear urine is the goal.",
  "Wipe front to back after toileting to prevent bacterial spread.",
  "Return immediately if fever persists beyond 48 hours of antibiotics.",
  "Watch for: vomiting, back/loin pain, no improvement after 2 days.",
];

function UTIMasterModule() {
  const [ageGroup, setAgeGroup] = useState("infant");
  const [activeTab, setActiveTab] = useState("clinician");
  const current = AGE_PATHWAYS[ageGroup];

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-red-700 to-orange-600 p-5 text-white">
        <div className="flex items-center gap-3">
          <Microscope className="w-7 h-7" />
          <div>
            <h2 className="text-xl font-bold">UTI Master Module</h2>
            <p className="text-red-100 text-sm">ISPN-based · Age-stratified · Antibiotic cards · Family education</p>
          </div>
        </div>
      </div>

      <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
        {[{ id: "clinician", label: "Clinician" }, { id: "resident", label: "Resident Pearls" }, { id: "family", label: "Family Education" }].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${activeTab === t.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "clinician" && (
        <>
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
                <Badge className={`text-xs ${ageGroup === "resistant" ? "bg-red-200 text-red-700" : "bg-blue-100 text-blue-700"}`}>{current.urgency}</Badge>
                <Badge className="bg-slate-100 text-slate-500 text-xs">Ref: {current.ref}</Badge>
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
                {[
                  { label: "RBUS", text: "All children after first febrile UTI, unusual organism, poor response." },
                  { label: "VCUG", text: "Abnormal RBUS, Grade 3+ VUR suspected, sibling with VUR, recurrent febrile UTI in males." },
                  { label: "DMSA", text: "Acute (cortical defects). Scar assessment after 6 months post-UTI." },
                  { label: "MAG3", text: "Suspected obstruction. Differential renal function assessment." },
                ].map(r => (
                  <p key={r.label} className="text-slate-600"><span className="font-bold">{r.label}:</span> {r.text}</p>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === "resident" && (
        <div className="space-y-3">
          {[
            { q: "When NOT to use nitrofurantoin?", a: "Febrile UTI (pyelonephritis) — doesn't achieve adequate renal tissue levels. Also avoid in CKD (eGFR <30) and neonates." },
            { q: "VCUG timing after UTI?", a: "Wait until urine sterile and child well. Usually 2–6 weeks after completion of treatment to avoid false-positive VUR grading due to inflammation." },
            { q: "DMSA for scar vs acute?", a: "Acute phase DMSA (within 5 days): shows photopenic areas (uptake defects). Repeat after 6 months to confirm permanent scar (cortical thinning/loss)." },
            { q: "CAP — who benefits?", a: "VUR Grade III-IV, frequent febrile recurrences, post-transplant, single kidney + VUR, vesicoureteral reflux + BBD." },
            { q: "Sterile pyuria + culture negative?", a: "Consider TB, Chlamydia, Adenovirus, partly treated UTI. DMSA and further workup warranted." },
          ].map((p, i) => (
            <Card key={i} className="border-amber-200 bg-amber-50">
              <CardContent className="p-3">
                <p className="font-bold text-sm text-amber-800 mb-1">Q: {p.q}</p>
                <p className="text-xs text-amber-900">{p.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === "family" && (
        <div className="space-y-3">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <p className="text-sm font-bold text-green-800 mb-3">📋 Family Education — Urinary Tract Infection</p>
              <p className="text-xs text-green-700 mb-3">A UTI is an infection in the urinary system (kidneys, bladder, or tubes between them). It is common in children and fully treatable with antibiotics.</p>
              <div className="space-y-2">
                {UTI_FAMILY_TIPS.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-700">{tip}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-3">
              <p className="text-sm font-bold text-red-800 mb-2">🚨 Warning Signs — Return Immediately If:</p>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {["Fever above 38.5°C persisting", "Child vomiting medications", "No improvement after 48h", "Back or side pain", "Blood in urine", "Not passing urine for 8+ hours"].map(w => (
                  <p key={w} className="text-red-700 flex items-center gap-1">⚠ {w}</p>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-3">
              <p className="text-sm font-bold text-blue-800 mb-2">💧 Hydration & Toilet Habits</p>
              <div className="space-y-1 text-xs text-blue-900">
                <p>• Drink 6–8 glasses of water/day (age-appropriate)</p>
                <p>• Void every 2–3 hours — do not hold urine</p>
                <p>• Girls: wipe front to back always</p>
                <p>• Avoid bubble baths and tight synthetic clothing</p>
                <p>• Constipation worsens UTI risk — ensure regular stools</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// ── GN Panel ─────────────────────────────────────────────────────────────────
const GN_CONDITIONS = [
  { name: "Minimal Change Disease (MCD)", tag: "Nephrotic", color: "bg-purple-100 text-purple-800", keys: ["Empirical steroids in children — no biopsy for first episode", "Prednisolone 60 mg/m² × 4–6 wks, then taper", "Steroid-sensitive in >90% children", "Relapse: cyclophosphamide 2mg/kg × 8–12 wks"], parentCounseling: ["Steroid treatment is very effective — over 90% children respond", "Urine protein testing at home with dipstick daily", "Relapse does not mean failure — it is managed with repeat steroids", "Avoid infections: can trigger relapses"], dietGuidance: ["Low salt diet during active disease and steroid treatment", "Normal protein unless advised otherwise", "Adequate calcium and Vitamin D (steroids deplete these)", "Fluid restriction only if severe oedema"] },
  { name: "FSGS", tag: "Nephrotic", color: "bg-purple-100 text-purple-800", keys: ["Biopsy essential", "Steroid trial 8–16 wks", "Calcineurin inhibitors second-line", "Genetic testing in children — NPHS2, TRPC6, INF2"] },
  { name: "Membranous Nephropathy (MN)", tag: "Nephrotic", color: "bg-purple-100 text-purple-800", keys: ["PLA2R antibody testing", "KDIGO 2021 — conservative first", "Rituximab preferred over CYC", "Monitor PLA2R titres for response"] },
  { name: "IgA Nephropathy (IgAN)", tag: "Haematuria/Mixed", color: "bg-rose-100 text-rose-800", keys: ["Oxford MEST-C score guides prognosis", "SGLT2i: nephroprotection", "Budesonide (Nefecon) if high risk", "ACEi/ARB first-line for proteinuria"] },
  { name: "IgA Vasculitis (HSP) Nephritis", tag: "Vasculitis", color: "bg-orange-100 text-orange-800", keys: ["ISKDC criteria", "UPCR monitoring mandatory", "Steroids if nephrotic/severe nephritic", "KDIGO 2021 guidance"] },
  { name: "Lupus Nephritis (LN)", tag: "Autoimmune", color: "bg-pink-100 text-pink-800", keys: ["ISN/RPS class I–VI — biopsy mandatory", "MPA + steroids standard induction", "Belimumab / voclosporin — adjunct", "Maintenance: MMF or Aza × 3+ years"] },
  { name: "ANCA Vasculitis (GPA/MPA)", tag: "Vasculitis", color: "bg-orange-100 text-orange-800", keys: ["Rituximab preferred over CYC for induction", "Pulse methylprednisolone IV", "PLEX for RPGN + pulmonary haemorrhage", "Maintenance: rituximab every 6 months"] },
  { name: "HUS / TMA", tag: "TMA", color: "bg-red-100 text-red-800", keys: ["STEC-HUS: supportive — no antibiotics, no antimotility", "aHUS: Eculizumab urgent", "ADAMTS13 for TTP — plasma exchange urgent", "Monitor smear, LDH, platelets, creatinine"] },
  { name: "RPGN", tag: "Nephritic", color: "bg-red-100 text-red-800", keys: ["Rapidly progressive GN — emergency", "Pulse MP + immunosuppression urgent", "Identify: ANCA, anti-GBM, immune complex", "PLEX for anti-GBM and ANCA + pulmonary haemorrhage"] },
  { name: "Post-Streptococcal GN (PSGN)", tag: "Nephritic", color: "bg-blue-100 text-blue-800", keys: ["ASO / anti-DNase B elevated", "Low C3, normal C4", "Mostly self-limiting in children", "Antihypertensives + fluid/salt restriction"] },
  { name: "C3 Glomerulopathy (C3G)", tag: "Complement", color: "bg-teal-100 text-teal-800", keys: ["C3G: C3 dominant with complement dysregulation", "Genetic complement testing (CFH, CFI, CD46)", "Eculizumab / avacopan: emerging options", "Mycophenolate + RAAS blockade standard"] },
  { name: "Congenital Nephrotic Syndrome", tag: "Genetic", color: "bg-indigo-100 text-indigo-800", keys: ["NPHS1 / NPHS2 mutations (Finnish type)", "Albumin infusions + nutrition support", "Early bilateral nephrectomy + dialysis", "Transplant recommended after reaching 9 kg"] },
];

function GNBridgePanel() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");
  const filters = ["All", "Nephrotic", "Haematuria/Mixed", "Vasculitis", "Autoimmune", "TMA", "Nephritic", "Complement", "Genetic"];
  const filtered = filter === "All" ? GN_CONDITIONS : GN_CONDITIONS.filter(c => c.tag === filter);
  const [open, setOpen] = useState(null);
  const [subTab, setSubTab] = useState({});

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-pink-700 to-rose-600 p-5 text-white">
        <div className="flex items-center gap-3">
          <FlaskConical className="w-7 h-7" />
          <div>
            <h2 className="text-xl font-bold">Glomerular Diseases & GN</h2>
            <p className="text-pink-100 text-sm">KDIGO 2021 · ISKDC · Pediatric pathways · Biopsy guidance</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${filter === f ? "bg-pink-600 text-white border-pink-600" : "bg-white text-slate-600 border-slate-200 hover:border-pink-300"}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((cond, i) => (
          <Card key={i} className="border-slate-200 shadow-sm">
            <CardContent className="p-0">
              <button className="w-full flex items-center justify-between p-3 text-left" onClick={() => setOpen(open === i ? null : i)}>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm text-slate-800">{cond.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cond.color}`}>{cond.tag}</span>
                </div>
                {open === i ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
              </button>
              {open === i && (
                <div className="border-t border-slate-100">
                  {(cond.parentCounseling || cond.dietGuidance) && (
                    <div className="flex gap-1 px-3 pt-2 pb-1">
                      {["clinical", "parent", "diet"].map(t => (
                        <button key={t} onClick={() => setSubTab(prev => ({ ...prev, [i]: t }))}
                          className={`px-2 py-1 rounded text-xs font-medium transition-all ${(subTab[i] || "clinical") === t ? "bg-pink-100 text-pink-700" : "text-slate-500 hover:bg-slate-100"}`}>
                          {t === "clinical" ? "Clinical" : t === "parent" ? "Parent Counseling" : "Diet Guidance"}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="px-3 pb-3 space-y-1">
                    {((subTab[i] || "clinical") === "clinical" ? cond.keys : (subTab[i] === "parent" ? cond.parentCounseling : cond.dietGuidance) || cond.keys).map((k, j) => (
                      <div key={j} className="flex items-start gap-2">
                        <ArrowRight className="w-3 h-3 text-pink-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-slate-700">{k}</p>
                      </div>
                    ))}
                    <Button size="sm" variant="outline" className="mt-2 text-xs border-pink-200 text-pink-700 hover:bg-pink-50" onClick={() => navigate("/GlomerularDiseases")}>
                      <ExternalLink className="w-3 h-3 mr-1" /> Full GN Pathways
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-slate-200 bg-slate-50">
        <CardContent className="p-3">
          <p className="text-xs font-bold text-slate-500 mb-1">References</p>
          <p className="text-xs text-slate-600">KDIGO 2021 Glomerular Diseases · ISKDC Criteria · IPNA Clinical Practice Recommendations · SHARE Guidelines</p>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Neurogenic Bladder — with contextual family education tab ─────────────────
function NeurogenicBladderWithEd() {
  const [mainTab, setMainTab] = useState("clinician");

  const CIC_STEPS = [
    { n: 1, title: "Wash Hands", desc: "20 seconds with soap and water. Clean technique — sterile gloves not required at home." },
    { n: 2, title: "Prepare Equipment", desc: "Catheter (reuse or single-use), lubricant, collection vessel, wipes." },
    { n: 3, title: "Positioning", desc: "Lying down or seated. Girls may use mirror initially. Boys — retract foreskin if uncircumcised." },
    { n: 4, title: "Locate Urethra", desc: "Girls: clitoral hood → urethra → vagina. Front opening = urethra." },
    { n: 5, title: "Lubricate Catheter", desc: "Apply lubricant to tip. Hydrophilic catheters: activate with water." },
    { n: 6, title: "Insert Catheter", desc: "Gently, no force. If resistance → don't push. Try tilting angle." },
    { n: 7, title: "Drain Completely", desc: "Hold in place until flow stops. Advance slightly. Then slowly withdraw." },
    { n: 8, title: "Clean & Store", desc: "Wash with soap, rinse, air dry. Store in clean dry container." },
  ];

  return (
    <div className="space-y-3">
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
        {[{ id: "clinician", label: "Clinician" }, { id: "resident", label: "Resident Teaching" }, { id: "family", label: "Family Education" }, { id: "monitoring", label: "Monitoring" }].map(t => (
          <button key={t.id} onClick={() => setMainTab(t.id)}
            className={`flex-1 py-1.5 px-1 rounded-lg text-xs font-semibold transition-all ${mainTab === t.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {mainTab === "clinician" && <NeurogenicBladderCenter />}

      {mainTab === "resident" && (
        <div className="space-y-3">
          {[
            { q: "Safe bladder pressure threshold?", a: "Storage pressure below 40 cmH₂O. Higher pressures cause upper tract damage — urodynamics mandatory to assess." },
            { q: "CIC frequency — how to determine?", a: "Aim for voided/catheterized volume <400 mL (or <50% expected bladder capacity). Usually every 3–4 hours. Bladder diary guides frequency." },
            { q: "Anticholinergics in neurogenic bladder?", a: "Oxybutynin first-line (oral or intravesical). Tolterodine, solifenacin alternatives. Intravesical oxybutynin reduces systemic side-effects. Monitor for constipation, dry mouth." },
            { q: "When to refer for botox?", a: "Failed 2 anticholinergics + adequate CIC. Botulinum toxin A injection into detrusor — effective in NDO, reduces overactivity." },
            { q: "VUR in neurogenic bladder — management?", a: "High-pressure bladder is the primary driver. Optimize bladder management first. CAP if high-grade VUR. Surgical correction only after bladder pressures normalized." },
          ].map((p, i) => (
            <Card key={i} className="border-violet-200 bg-violet-50">
              <CardContent className="p-3">
                <p className="font-bold text-sm text-violet-800 mb-1">Q: {p.q}</p>
                <p className="text-xs text-violet-900">{p.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {mainTab === "family" && (
        <div className="space-y-3">
          <Card className="border-teal-200 bg-teal-50">
            <CardContent className="p-4">
              <p className="text-base font-bold text-teal-800 mb-2">Clean Intermittent Catheterization (CIC) — Family Training Guide</p>
              <p className="text-xs text-teal-700 mb-3">CIC is not painful when done correctly. It is the safest way to empty the bladder completely and protect the kidneys. It is clean, not sterile.</p>
              <p className="text-xs font-bold text-teal-700 uppercase tracking-wider mb-2">Step-by-Step Technique</p>
              <div className="space-y-2">
                {CIC_STEPS.map(s => (
                  <div key={s.n} className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{s.n}</span>
                    <div>
                      <p className="font-semibold text-xs text-teal-900">{s.title}</p>
                      <p className="text-xs text-slate-600">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-3">
              <p className="text-sm font-bold text-blue-800 mb-2">Urotherapy — Bladder Retraining at Home</p>
              <div className="space-y-1 text-xs text-blue-900">
                <p>• Scheduled voiding / CIC every 2–3 hours during the day</p>
                <p>• Keep a bladder diary: record times, volumes, leaks</p>
                <p>• Encourage double voiding: void, wait 5 min, void again</p>
                <p>• Biofeedback exercises (pelvic floor relaxation for DSD)</p>
                <p>• Avoid constipation — bowel directly affects bladder</p>
                <p>• Hydration: 1–1.5 litres/day (not all at once)</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-3">
              <p className="text-sm font-bold text-amber-800 mb-2">Constipation & Bladder Connection</p>
              <p className="text-xs text-amber-900">A full rectum presses on the bladder, causing urgency, leaking, and incomplete emptying. Regular stools are essential for bladder health. High-fibre diet, adequate water, regular toilet sitting (5–10 min after meals) are recommended.</p>
            </CardContent>
          </Card>
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-3">
              <p className="text-sm font-bold text-red-800 mb-2">Warning Signs — Contact Your Doctor If:</p>
              <div className="grid grid-cols-2 gap-1 text-xs">
                {["Fever above 38°C", "Cloudy/smelly urine", "Blood in urine", "Cannot pass catheter", "Increasing leakage", "Back/loin pain"].map(w => (
                  <p key={w} className="text-red-700">⚠ {w}</p>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {mainTab === "monitoring" && (
        <div className="space-y-3">
          {[
            { label: "Renal USS", freq: "6–12 monthly", detail: "Check for hydronephrosis, scarring, stones, bladder wall thickening" },
            { label: "VCUG / RNC", freq: "As clinically indicated", detail: "VUR grading, bladder morphology, post-void residual" },
            { label: "Urodynamics (UDS)", freq: "Annually or after change", detail: "Bladder compliance, capacity, leak point pressure, detrusor overactivity" },
            { label: "Serum Creatinine / eGFR", freq: "3–6 monthly", detail: "Early CKD detection" },
            { label: "Urine Culture", freq: "Symptomatic or if cloudy", detail: "Bacteriuria alone without symptoms does not need treatment" },
            { label: "Bladder Diary", freq: "Monthly", detail: "Voided volumes, CIC times, leakage episodes, bowel chart" },
          ].map((m, i) => (
            <Card key={i} className="border-slate-200">
              <CardContent className="p-3 flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-sm text-slate-800">{m.label}</p>
                  <p className="text-xs text-slate-600">{m.detail}</p>
                </div>
                <Badge className="bg-blue-100 text-blue-700 text-xs flex-shrink-0">{m.freq}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ── SECTIONS CONFIG ───────────────────────────────────────────────────────────
const SECTIONS = [
  {
    id: "glomerular", label: "Glomerular", subtitle: "NS · GN · TMA · Vasculitis",
    icon: FlaskConical, color: "from-pink-600 to-rose-600",
    tabs: [
      { id: "gn", label: "GN & Glomerular Diseases", icon: FlaskConical, badge: "12 conditions" },
    ]
  },
  {
    id: "tubular", label: "Tubular & Electrolytes", subtitle: "RTA · Bartter · Stones",
    icon: TestTube, color: "from-teal-600 to-cyan-600",
    tabs: [
      { id: "tubular", label: "Tubular Disorder Lab", icon: TestTube, badge: "RTA · Stones" },
    ]
  },
  {
    id: "cakut_urology", label: "CAKUT & Urology", subtitle: "CAKUT · Bladder · UDS · UTI",
    icon: Activity, color: "from-violet-600 to-purple-600",
    tabs: [
      { id: "cakut", label: "CAKUT", icon: Droplet, badge: "Antenatal · VUR · PUV" },
      { id: "neuro_bladder", label: "Neurogenic Bladder", icon: Brain, badge: "CIC · UDS" },
      { id: "bbd", label: "BBD / ICCS", icon: BookOpen, badge: "ICCS 2016" },
      { id: "uroflow", label: "Uroflow AI", icon: Activity, badge: "ICCS" },
      { id: "uds", label: "UDS Interpreter", icon: BarChart2, badge: "Full UDS" },
      { id: "uti", label: "UTI Master", icon: Microscope, badge: "ISPN" },
    ]
  },
  {
    id: "dialysis_icu", label: "Dialysis & ICU", subtitle: "HD · PD · CRRT · PLEX",
    icon: Heart, color: "from-blue-600 to-cyan-700",
    tabs: [
      { id: "rrt_link", label: "RRT / Dialysis Module", icon: Heart, badge: "Full RRT" },
    ]
  },
  {
    id: "htn_imaging", label: "HTN & Imaging", subtitle: "Hypertension · ABPM · VCUG",
    icon: BarChart2, color: "from-orange-600 to-red-600",
    tabs: [
      { id: "htn_link", label: "Hypertension Module", icon: BarChart2, badge: "AAP 2017" },
    ]
  },
];

function SectionNav({ activeSectionId, onSelectSection }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {SECTIONS.map(s => {
        const Icon = s.icon;
        const active = activeSectionId === s.id;
        return (
          <button key={s.id} onClick={() => onSelectSection(s)}
            className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left ${active ? "bg-gradient-to-r " + s.color + " text-white border-transparent shadow-md" : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"}`}>
            <Icon className="w-4 h-4 flex-shrink-0" />
            <div className="min-w-0">
              <p className="font-semibold text-xs truncate">{s.label}</p>
              <p className={`text-xs truncate ${active ? "text-white/70" : "text-slate-400"}`}>{s.subtitle}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function LinkPanel({ title, subtitle, url, color }) {
  const navigate = useNavigate();
  return (
    <Card className={`border-2 ${color}`}>
      <CardContent className="p-6 flex flex-col items-center text-center gap-3">
        <ExternalLink className="w-8 h-8 text-slate-500" />
        <div>
          <p className="font-bold text-slate-800">{title}</p>
          <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
        </div>
        <Button onClick={() => navigate(url)} className="mt-2">Open Module</Button>
      </CardContent>
    </Card>
  );
}

export default function UrologyNephrologyHub() {
  const [activeSection, setActiveSection] = useState(SECTIONS[0]);
  const [activeTab, setActiveTab] = useState(SECTIONS[0].tabs[0].id);

  const handleSectionChange = (section) => {
    setActiveSection(section);
    setActiveTab(section.tabs[0].id);
  };

  const renderTabContent = (tabId) => {
    switch (tabId) {
      case "gn": return <GNBridgePanel />;
      case "tubular": return <TubularDisorderLab />;
      case "cakut": return <CAKUTMasterCenter />;
      case "neuro_bladder": return <NeurogenicBladderWithEd />;
      case "uroflow": return <UroflowAIAnalyzer />;
      case "uds": return <UDSInterpreter />;
      case "bbd": return <BBDICCSModule />;
      case "uti": return <UTIMasterModule />;
      case "rrt_link": return <LinkPanel title="Dialysis & RRT Module" subtitle="HD · PD · CRRT · SLED · PLEX · Adequacy calculators" url="/RRTAssistant" color="border-blue-200 bg-blue-50" />;
      case "htn_link": return <LinkPanel title="Hypertension & BP Module" subtitle="Pediatric HTN · ABPM · AAP 2017 · Emergency HTN · Monogenic causes" url="/BPPercentiles" color="border-orange-200 bg-orange-50" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-3 md:p-6">
      <div className="max-w-4xl mx-auto space-y-4">

        {/* Hero */}
        <div className="rounded-2xl bg-gradient-to-br from-blue-800 via-indigo-700 to-violet-700 p-5 text-white shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Pediatric Nephrology & Urology Hub</h1>
              <p className="text-blue-100 text-sm mt-1">Glomerular · CAKUT · Tubular · UTI · Neurogenic Bladder · BBD · Dialysis · HTN</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {["KDIGO 2021", "ISPN-based", "ICCS 2016", "Fellowship-grade", "Family-inclusive"].map(t => (
                  <span key={t} className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{t}</span>
                ))}
              </div>
            </div>
            <Badge className="bg-white/20 text-white border-white/30 border text-xs flex-shrink-0">v4.0</Badge>
          </div>
        </div>

        {/* Section navigation */}
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select Section</p>
          <SectionNav activeSectionId={activeSection.id} onSelectSection={handleSectionChange} />
        </div>

        {/* Module tabs */}
        {activeSection.tabs.length > 1 && (
          <div className={`rounded-xl bg-gradient-to-r ${activeSection.color} p-1`}>
            <div className="bg-white rounded-lg overflow-hidden">
              <div className="flex overflow-x-auto gap-0.5 p-1 bg-slate-50">
                {activeSection.tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium flex-shrink-0 transition-all ${activeTab === tab.id ? "bg-white text-slate-900 shadow-sm font-semibold" : "text-slate-500 hover:text-slate-700"}`}>
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                      <Badge className="bg-slate-100 text-slate-500 text-xs">{tab.badge}</Badge>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="mt-2">
          {renderTabContent(activeTab)}
        </div>

      </div>
    </div>
  );
}