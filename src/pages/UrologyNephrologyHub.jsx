import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Droplet, Brain, Activity, TestTube, BookOpen,
  AlertTriangle, Microscope, BarChart2, Heart, FlaskConical,
  ChevronDown, ChevronUp, ExternalLink, ArrowRight, Stethoscope,
  Syringe, Shield, Camera
} from "lucide-react";

// Core modules
import CAKUTMasterCenter from "../components/cakut/CAKUTMasterCenter";
import NeurogenicBladderCenter from "../components/urology/NeurogenicBladderCenter";
import UroflowAIAnalyzer from "../components/urology/UroflowAIAnalyzer";
import UDSInterpreter from "../components/urology/UDSInterpreter";
import BBDICCSModule from "../components/urology/BBDICCSModule";
import TubularDisorderLab from "../components/tubular/TubularDisorderLab";

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

function UTIMasterModule() {
  const [ageGroup, setAgeGroup] = useState("infant");
  const current = AGE_PATHWAYS[ageGroup];
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-red-700 to-orange-600 p-5 text-white">
        <div className="flex items-center gap-3">
          <Microscope className="w-7 h-7" />
          <div>
            <h2 className="text-xl font-bold">UTI Master Module</h2>
            <p className="text-red-100 text-sm">ISPN-based · Age-stratified pathways · Antibiotic cards · Imaging logic</p>
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

// ── GN Bridge Panel ──────────────────────────────────────────────────────────
const GN_CONDITIONS = [
  { name: "Minimal Change Disease (MCD)", tag: "Nephrotic", color: "bg-purple-100 text-purple-800", keys: ["Empirical steroids in children", "No biopsy first episode", "Prednisolone 60 mg/m² × 4–6 wks", "SR: >90% children"] },
  { name: "FSGS", tag: "Nephrotic", color: "bg-purple-100 text-purple-800", keys: ["Biopsy essential", "Steroid trial 8–16 wks", "Calcineurin inhibitors second-line", "Genetic testing in children"] },
  { name: "Membranous Nephropathy (MN)", tag: "Nephrotic", color: "bg-purple-100 text-purple-800", keys: ["PLA2R antibody testing", "KDIGO 2021 — conservative first", "Rituximab preferred over CYC", "Monitor PLA2R titres"] },
  { name: "IgA Nephropathy (IgAN)", tag: "Haematuria/Mixed", color: "bg-rose-100 text-rose-800", keys: ["Oxford MEST-C score", "SGLT2i: nephroprotection", "Budesonide if high risk", "ACEi/ARB first-line"] },
  { name: "IgA Vasculitis (HSP) Nephritis", tag: "Vasculitis", color: "bg-orange-100 text-orange-800", keys: ["ISKDC criteria", "UPCR monitoring", "Steroids if nephrotic/nephritic", "KDIGO 2021 guidance"] },
  { name: "Lupus Nephritis (LN)", tag: "Autoimmune", color: "bg-pink-100 text-pink-800", keys: ["ISN/RPS class I–VI", "MPA + steroids standard", "Belimumab/voclosporin add-on", "Renal biopsy mandatory"] },
  { name: "ANCA Vasculitis (GPA/MPA)", tag: "Vasculitis", color: "bg-orange-100 text-orange-800", keys: ["Rituximab preferred over CYC", "Pulse MP induction", "ANCA monitoring", "Maintenance 12–24 months"] },
  { name: "HUS / TMA", tag: "TMA", color: "bg-red-100 text-red-800", keys: ["STEC-HUS: supportive", "aHUS: Eculizumab urgent", "ADAMTS13 for TTP", "Plasma exchange in TTP"] },
  { name: "Nephrotic Syndrome (Childhood)", tag: "Nephrotic", color: "bg-purple-100 text-purple-800", keys: ["ISKDC protocol", "Relapse: >3+ dipstick × 3 days", "Frequent relapse: MMF / Levamisole", "SRNS: CNI / Rituximab"] },
  { name: "Post-Streptococcal GN (PSGN)", tag: "Nephritic", color: "bg-blue-100 text-blue-800", keys: ["ASO / anti-DNase B", "Low C3, normal C4", "Mostly self-limiting", "HTN management key"] },
  { name: "C3 Glomerulopathy (C3G)", tag: "Complement", color: "bg-indigo-100 text-indigo-800", keys: ["Dense deposit disease (DDD) + C3GN", "Low C3, normal C4, normal C2", "Genetic complement pathway mutations", "Eculizumab/avacopan in trials"] },
  { name: "Congenital Nephrotic Syndrome", tag: "Genetic", color: "bg-indigo-100 text-indigo-800", keys: ["NPHS1 / NPHS2 mutations", "Albumin infusions + nutrition", "Early bilateral nephrectomy + dialysis", "Transplant after 9 kg"] },
];

function GNBridgePanel() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");
  const filters = ["All", "Nephrotic", "Haematuria/Mixed", "Vasculitis", "Autoimmune", "TMA", "Nephritic", "Complement", "Genetic"];
  const filtered = filter === "All" ? GN_CONDITIONS : GN_CONDITIONS.filter(c => c.tag === filter);
  const [open, setOpen] = useState(null);
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-pink-700 to-rose-600 p-5 text-white">
        <div className="flex items-center gap-3">
          <FlaskConical className="w-7 h-7" />
          <div>
            <h2 className="text-xl font-bold">Glomerular Diseases & GN</h2>
            <p className="text-pink-100 text-sm">KDIGO 2021 · ISKDC · NS · RPGN · Vasculitis · TMA · C3G</p>
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
                <div className="px-3 pb-3 border-t border-slate-100 pt-2 space-y-1">
                  {cond.keys.map((k, j) => (
                    <div key={j} className="flex items-start gap-2">
                      <ArrowRight className="w-3 h-3 text-pink-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-700">{k}</p>
                    </div>
                  ))}
                  <Button size="sm" variant="outline"
                    className="mt-2 text-xs border-pink-200 text-pink-700 hover:bg-pink-50"
                    onClick={() => navigate("/GlomerularDiseases")}>
                    <ExternalLink className="w-3 h-3 mr-1" /> Full GN Pathways
                  </Button>
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

// ── Dialysis & ICU Panel ──────────────────────────────────────────────────────
function DialysisICUPanel() {
  const [open, setOpen] = useState(null);
  const MODALITIES = [
    { name: "Hemodialysis (HD)", color: "bg-blue-50 border-blue-300", badge: "bg-blue-100 text-blue-800",
      keys: ["Kt/V target >1.2 per session", "Blood flow: 5–8 mL/kg/min", "3× weekly chronic HD", "Access: AVF preferred, temporary CVC in AKI", "Dry weight reassessment every session", "Intradialytic hypotension — most common complication"] },
    { name: "Peritoneal Dialysis (PD)", color: "bg-teal-50 border-teal-300", badge: "bg-teal-100 text-teal-800",
      keys: ["Preferred in infants + young children", "CCPD overnight — 8–10h nightly", "Daily PET for membrane characterization", "Exit site care: daily chlorhexidine", "Peritonitis: gram-positive most common", "APD allows school attendance"] },
    { name: "CRRT (Continuous RRT)", color: "bg-red-50 border-red-300", badge: "bg-red-100 text-red-800",
      keys: ["PICU-based. AKI with hemodynamic instability", "Target dose: 25–35 mL/kg/hr", "Filter life: 48–72h (citrate anticoagulation)", "Monitor: electrolytes q6h, citrate toxicity", "CVVHDF most common mode in pediatrics"] },
    { name: "PLEX / Plasma Exchange", color: "bg-purple-50 border-purple-300", badge: "bg-purple-100 text-purple-800",
      keys: ["aHUS, ANCA vasculitis, TTP, anti-GBM disease", "1–1.5 plasma volumes per session", "Replacement: FFP or albumin (by indication)", "Monitor coagulation, calcium, IgG levels"] },
  ];
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-cyan-700 to-blue-700 p-5 text-white">
        <div className="flex items-center gap-3">
          <Activity className="w-7 h-7" />
          <div>
            <h2 className="text-xl font-bold">Dialysis & ICU Nephrology</h2>
            <p className="text-cyan-100 text-sm">HD · PD · CRRT · PLEX · Adequacy — Pediatric protocols</p>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {MODALITIES.map((m, i) => (
          <Card key={i} className={`border-2 ${m.color}`}>
            <CardContent className="p-0">
              <button className="w-full flex items-center justify-between p-3 text-left" onClick={() => setOpen(open === i ? null : i)}>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-slate-800">{m.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${m.badge}`}>Protocol</span>
                </div>
                {open === i ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>
              {open === i && (
                <div className="px-3 pb-3 border-t border-slate-100 pt-2 space-y-1">
                  {m.keys.map((k, j) => (
                    <div key={j} className="flex items-start gap-2">
                      <ArrowRight className="w-3 h-3 text-blue-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-700">{k}</p>
                    </div>
                  ))}
                  <Link to="/RRTAssistant">
                    <Button size="sm" variant="outline" className="mt-2 text-xs border-blue-200 text-blue-700 hover:bg-blue-50">
                      <ExternalLink className="w-3 h-3 mr-1" /> Full RRT Module
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Transplant Panel ──────────────────────────────────────────────────────────
function TransplantPanel() {
  const [open, setOpen] = useState(null);
  const TOPICS = [
    { name: "Immunosuppression Protocols", color: "bg-purple-50 border-purple-200",
      keys: ["Induction: Basiliximab (IL-2R antagonist) preferred", "Maintenance: TAC + MMF + prednisolone (triple therapy)", "Tacrolimus: target trough 10–15 ng/mL (1st 3mo) → 5–10 (maintenance)", "MMF: 600 mg/m²/dose BD. Reduce in diarrhea/cytopenias", "Steroid withdrawal: at 3–6 months in low-risk patients"] },
    { name: "BK Virus Nephropathy", color: "bg-amber-50 border-amber-200",
      keys: ["Monitor: plasma BK PCR monthly × 2 years", "BK viremia >10,000 copies → reduce immunosuppression", "Cidofovir: used in refractory (nephrotoxic — monitor carefully)", "Leflunomide: alternative; anti-BK + immunosuppressive", "Biopsy: SV40 staining for BK nephropathy confirmation"] },
    { name: "CMV Disease", color: "bg-red-50 border-red-200",
      keys: ["High risk: D+/R− (donor positive, recipient negative)", "Prophylaxis: Valganciclovir 450mg/m² × 3–6 months", "Treatment: IV Ganciclovir 5 mg/kg BD × 2–3 weeks", "Resistant CMV: Foscarnet or Maribavir (newer)"] },
    { name: "Rejection", color: "bg-rose-50 border-rose-200",
      keys: ["T-cell mediated (TCMR): pulse steroids 10 mg/kg × 3 days", "ABMR: PLEX + IVIG + Rituximab", "DSA monitoring: at transplant, 1, 3, 6, 12 months + annually", "Banff 2022 classification for biopsy grading"] },
    { name: "PTLD", color: "bg-slate-50 border-slate-200",
      keys: ["Post-transplant lymphoproliferative disorder — EBV-driven", "Reduce immunosuppression first-line", "Rituximab: for CD20+ PTLD", "CHOP: for aggressive diffuse large B-cell lymphoma"] },
  ];
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-violet-700 to-purple-600 p-5 text-white">
        <div className="flex items-center gap-3">
          <Syringe className="w-7 h-7" />
          <div>
            <h2 className="text-xl font-bold">Transplant Nephrology</h2>
            <p className="text-violet-100 text-sm">Immunosuppression · BK · CMV · Rejection · PTLD</p>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {TOPICS.map((t, i) => (
          <Card key={i} className={`border-2 ${t.color}`}>
            <CardContent className="p-0">
              <button className="w-full flex items-center justify-between p-3 text-left" onClick={() => setOpen(open === i ? null : i)}>
                <span className="font-semibold text-sm text-slate-800">{t.name}</span>
                {open === i ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>
              {open === i && (
                <div className="px-3 pb-3 border-t border-slate-100 pt-2 space-y-1">
                  {t.keys.map((k, j) => (
                    <div key={j} className="flex items-start gap-2">
                      <ArrowRight className="w-3 h-3 text-violet-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-700">{k}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Hypertension Panel ────────────────────────────────────────────────────────
function HypertensionPanel() {
  const [open, setOpen] = useState(null);
  const TOPICS = [
    { name: "Pediatric HTN Classification (2017 AAP)", color: "bg-orange-50 border-orange-200",
      keys: ["Normal: <90th percentile", "Elevated: 90–95th", "Stage 1 HTN: 95th–95th+12 mmHg or 130/80–139/89", "Stage 2 HTN: >95th+12 or ≥140/90 (whichever lower)", "3 separate readings required for diagnosis"] },
    { name: "Neonatal Hypertension", color: "bg-red-50 border-red-200",
      keys: ["Systolic >p95 for gestational age + postnatal age", "Most common cause: renovascular (RAS, thrombus)", "Term neonate: >90 mmHg systolic is abnormal", "Amlodipine: 0.1 mg/kg OD — preferred oral", "Hydralazine/labetalol IV in hypertensive crisis"] },
    { name: "ABPM (Ambulatory BP Monitoring)", color: "bg-blue-50 border-blue-200",
      keys: ["24h monitoring: confirms white-coat vs true HTN", "Nocturnal dipping <10% → non-dipping → CKD risk", "Masked HTN: normal clinic but elevated ABPM", "Load >25% = abnormal", "Essential in CKD, renal transplant, adrenal conditions"] },
    { name: "Monogenic Hypertension", color: "bg-green-50 border-green-200",
      keys: ["Low renin + hypokalemia → suspect: GRA, Liddle, AME", "GRA: dexamethasone suppression test + genetic panel", "Liddle syndrome: ENAC mutation → amiloride responsive", "Gordon syndrome (PHA2): WNK kinase mutation → thiazide-responsive"] },
    { name: "Hypertensive Emergency Management", color: "bg-rose-50 border-rose-200",
      keys: ["Target: reduce MAP by no more than 25% in first 8h", "IV labetalol: 0.25–1 mg/kg/hr infusion", "IV nicardipine: 0.5–3 mcg/kg/min (preferred)", "Avoid sudden drops — risk of hypoperfusion/stroke"] },
  ];
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-orange-600 to-red-600 p-5 text-white">
        <div className="flex items-center gap-3">
          <Shield className="w-7 h-7" />
          <div>
            <h2 className="text-xl font-bold">Hypertension — Pediatric</h2>
            <p className="text-orange-100 text-sm">Classification · Neonatal HTN · ABPM · Monogenic · Emergency</p>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {TOPICS.map((t, i) => (
          <Card key={i} className={`border-2 ${t.color}`}>
            <CardContent className="p-0">
              <button className="w-full flex items-center justify-between p-3 text-left" onClick={() => setOpen(open === i ? null : i)}>
                <span className="font-semibold text-sm text-slate-800">{t.name}</span>
                {open === i ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>
              {open === i && (
                <div className="px-3 pb-3 border-t border-slate-100 pt-2 space-y-1">
                  {t.keys.map((k, j) => (
                    <div key={j} className="flex items-start gap-2">
                      <ArrowRight className="w-3 h-3 text-orange-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-700">{k}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Imaging & Diagnostics Panel ───────────────────────────────────────────────
function ImagingDiagnosticsPanel() {
  const [open, setOpen] = useState(null);
  const MODALITIES = [
    { name: "Renal Ultrasound (RBUS)", color: "bg-blue-50 border-blue-200",
      keys: ["First-line for all renal/urological conditions", "Assess: size, echogenicity, corticomedullary differentiation", "Hydronephrosis grading: SFU 0–IV or APRPD in mm", "Increased echogenicity → medical renal disease", "Bladder wall thickness >3mm (full) → outlet obstruction"] },
    { name: "VCUG (Voiding Cystourethrogram)", color: "bg-amber-50 border-amber-200",
      keys: ["VUR grading: I–V (NIDDK criteria)", "Perform after UTI resolves + prophylactic antibiotics", "Fluoroscopic cyclic VCUG: increases grade detection", "Posterior urethral valves: VCUG is diagnostic"] },
    { name: "DMSA Scan", color: "bg-green-50 border-green-200",
      keys: ["99mTc-DMSA: cortical binding — renal scarring + function", "Acute phase (top-down): diagnose pyelonephritis", "Delayed phase (>6 months post-UTI): permanent scarring", "Split function: one kidney <40% = significant asymmetry"] },
    { name: "MAG3 Scan + Diuresis", color: "bg-teal-50 border-teal-200",
      keys: ["Tubular secretion tracer — drainage + differential function", "T½ (drainage half-time): obstructed if >20 min post-diuretic", "Differential function: each kidney's % contribution to total GFR", "Pre and post-pyeloplasty — MAG3 for drainage improvement"] },
    { name: "Renal Biopsy Interpretation", color: "bg-rose-50 border-rose-200",
      keys: ["Light microscopy: H&E, PAS, Masson, Jones' silver", "Immunofluorescence: IgG, IgA, IgM, C3, C1q, fibrinogen", "Electron microscopy: podocyte effacement, deposits location", "Oxford MEST-C score for IgAN", "ISN/RPS classification for Lupus Nephritis (Class I–VI)"] },
  ];
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-teal-700 to-cyan-700 p-5 text-white">
        <div className="flex items-center gap-3">
          <Camera className="w-7 h-7" />
          <div>
            <h2 className="text-xl font-bold">Imaging & Diagnostics</h2>
            <p className="text-teal-100 text-sm">RBUS · VCUG · DMSA · MAG3 · Biopsy · UDS · Uroflowmetry</p>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {MODALITIES.map((m, i) => (
          <Card key={i} className={`border-2 ${m.color}`}>
            <CardContent className="p-0">
              <button className="w-full flex items-center justify-between p-3 text-left" onClick={() => setOpen(open === i ? null : i)}>
                <span className="font-semibold text-sm text-slate-800">{m.name}</span>
                {open === i ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>
              {open === i && (
                <div className="px-3 pb-3 border-t border-slate-100 pt-2 space-y-1">
                  {m.keys.map((k, j) => (
                    <div key={j} className="flex items-start gap-2">
                      <ArrowRight className="w-3 h-3 text-teal-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-700">{k}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        <Card className="border-slate-200 bg-slate-50">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-slate-500 mb-2">UDS Interpreter and Uroflow AI Analyzer are in the CAKUT & Urology section</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Sections config ───────────────────────────────────────────────────────────
const SECTIONS = [
  {
    id: "glomerular",
    label: "Glomerular",
    subtitle: "NS · GN · Vasculitis · TMA",
    icon: FlaskConical,
    color: "from-pink-600 to-rose-600",
    tabs: [
      { id: "gn", label: "Glomerular / GN", icon: FlaskConical, badge: "12 conditions" },
    ]
  },
  {
    id: "tubular",
    label: "Tubular",
    subtitle: "RTA · Bartter · Stones",
    icon: TestTube,
    color: "from-indigo-600 to-blue-600",
    tabs: [
      { id: "tubular_lab", label: "Tubular & Electrolytes", icon: TestTube, badge: "RTA · Stones" },
    ]
  },
  {
    id: "urology",
    label: "CAKUT & Urology",
    subtitle: "NGB · BBD · UTI · UDS",
    icon: Activity,
    color: "from-violet-600 to-purple-600",
    tabs: [
      { id: "cakut", label: "CAKUT", icon: Droplet, badge: "8 conditions" },
      { id: "neuro_bladder", label: "Neurogenic Bladder", icon: Brain, badge: "Flagship" },
      { id: "bbd", label: "BBD / ICCS", icon: BookOpen, badge: "ICCS 2016" },
      { id: "uroflow", label: "Uroflow AI", icon: Activity, badge: "ICCS" },
      { id: "uds", label: "UDS Interpreter", icon: BarChart2, badge: "Full UDS" },
      { id: "uti", label: "UTI Master", icon: Microscope, badge: "ISPN" },
    ]
  },
  {
    id: "dialysis",
    label: "Dialysis & ICU",
    subtitle: "HD · PD · CRRT · PLEX",
    icon: Stethoscope,
    color: "from-cyan-600 to-blue-700",
    tabs: [
      { id: "dialysis", label: "Dialysis & ICU", icon: Stethoscope, badge: "HD · PD · CRRT" },
    ]
  },
  {
    id: "transplant",
    label: "Transplant",
    subtitle: "IS · BK · CMV · Rejection",
    icon: Syringe,
    color: "from-violet-700 to-purple-700",
    tabs: [
      { id: "transplant", label: "Transplant", icon: Syringe, badge: "IS · BK · CMV" },
    ]
  },
  {
    id: "hypertension",
    label: "Hypertension",
    subtitle: "Pediatric · Neonatal · ABPM",
    icon: Shield,
    color: "from-orange-600 to-red-600",
    tabs: [
      { id: "htn", label: "Hypertension", icon: Shield, badge: "AAP 2017" },
    ]
  },
  {
    id: "imaging",
    label: "Imaging & Dx",
    subtitle: "RBUS · VCUG · DMSA",
    icon: Camera,
    color: "from-teal-600 to-cyan-700",
    tabs: [
      { id: "imaging", label: "Imaging & Diagnostics", icon: Camera, badge: "RBUS · DMSA · MAG3" },
    ]
  },
];

function SectionNav({ activeSectionId, onSelectSection }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {SECTIONS.map(s => {
        const Icon = s.icon;
        const active = activeSectionId === s.id;
        return (
          <button
            key={s.id}
            onClick={() => onSelectSection(s)}
            className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left ${active ? "bg-gradient-to-r " + s.color + " text-white border-transparent shadow-md" : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"}`}
          >
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

export default function UrologyNephrologyHub() {
  const [activeSection, setActiveSection] = useState(SECTIONS[0]);
  const [activeTab, setActiveTab] = useState("gn");

  const handleSectionChange = (section) => {
    setActiveSection(section);
    setActiveTab(section.tabs[0].id);
  };

  const renderTabContent = (tabId) => {
    switch (tabId) {
      case "gn": return <GNBridgePanel />;
      case "tubular_lab": return <TubularDisorderLab />;
      case "cakut": return <CAKUTMasterCenter />;
      case "neuro_bladder": return <NeurogenicBladderCenter />;
      case "bbd": return <BBDICCSModule />;
      case "uroflow": return <UroflowAIAnalyzer />;
      case "uds": return <UDSInterpreter />;
      case "uti": return <UTIMasterModule />;
      case "dialysis": return <DialysisICUPanel />;
      case "transplant": return <TransplantPanel />;
      case "htn": return <HypertensionPanel />;
      case "imaging": return <ImagingDiagnosticsPanel />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-3 md:p-6">
      <div className="max-w-5xl mx-auto space-y-4">

        {/* Hero */}
        <div className="rounded-2xl bg-gradient-to-br from-blue-800 via-indigo-700 to-violet-700 p-5 text-white shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Pediatric Nephrology & Urology Hub</h1>
              <p className="text-blue-100 text-sm mt-1">Glomerular · Tubular · CAKUT & Urology · Dialysis · Transplant · Hypertension · Imaging</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {["KDIGO 2021", "ISPN-based", "ICCS 2016", "Fellowship-grade", "Mobile-first"].map(t => (
                  <span key={t} className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{t}</span>
                ))}
              </div>
            </div>
            <Badge className="bg-white/20 text-white border-white/30 border text-xs flex-shrink-0">v4.0</Badge>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <span>Hub</span>
          <span>›</span>
          <span className="font-semibold text-slate-700">{activeSection.label}</span>
          {activeSection.tabs.length > 1 && (
            <>
              <span>›</span>
              <span className="text-slate-500">{activeSection.tabs.find(t => t.id === activeTab)?.label}</span>
            </>
          )}
        </div>

        {/* Section navigation */}
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Clinical Domains</p>
          <SectionNav activeSectionId={activeSection.id} onSelectSection={handleSectionChange} />
        </div>

        {/* Module tabs within section */}
        {activeSection.tabs.length > 1 && (
          <div className={`rounded-xl bg-gradient-to-r ${activeSection.color} p-1`}>
            <div className="bg-white rounded-lg overflow-hidden">
              <div className="flex overflow-x-auto gap-0.5 p-1 bg-slate-50">
                {activeSection.tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium flex-shrink-0 transition-all ${activeTab === tab.id ? "bg-white text-slate-900 shadow-sm font-semibold" : "text-slate-500 hover:text-slate-700"}`}
                    >
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