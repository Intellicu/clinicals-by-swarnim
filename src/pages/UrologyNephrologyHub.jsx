import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Droplet, Brain, Activity, TestTube, BookOpen,
  AlertTriangle, Microscope, BarChart2, Users, Heart, FlaskConical,
  ChevronDown, ChevronUp, ExternalLink, ArrowRight
} from "lucide-react";

// Core modules
import CAKUTMasterCenter from "../components/cakut/CAKUTMasterCenter";
import NeurogenicBladderCenter from "../components/urology/NeurogenicBladderCenter";
import UroflowAIAnalyzer from "../components/urology/UroflowAIAnalyzer";
import UDSInterpreter from "../components/urology/UDSInterpreter";
import BBDICCSModule from "../components/urology/BBDICCSModule";
import TubularDisorderLab from "../components/tubular/TubularDisorderLab";
import BiostatisticsAcademy from "../components/research/BiostatisticsAcademy";
import PatientFamilyEducation from "../components/urology/PatientFamilyEducation";
import PatientCockpitTimeline from "../components/nephrology/PatientCockpitTimeline";

// ── UTI Master Module (inline — preserved from previous) ────────────────────
const AGE_PATHWAYS = {
  neonate: {
    label: "Neonate (<28 days)",
    urgency: "Sepsis workup mandatory",
    ref: "ISPN/AAP/NICE",
    keySteps: [
      "Full septic workup: CBC, CRP, blood culture, CSF, urine culture (SPA/catheter)",
      "IV antibiotics: Ampicillin 50mg/kg q12h + Gentamicin 5mg/kg q24h",
      "Duration: 10–14 days IV if culture positive",
      "Imaging: Renal-bladder USS within 24–48h",
      "VCUG: after treatment if USS abnormal",
      "Follow-up: Urine culture 48–72h post-treatment",
    ],
    antibiotics: [
      { drug: "Ampicillin", dose: "50 mg/kg/dose q12h IV", note: "GBS, Listeria coverage. Adjust in CKD." },
      { drug: "Gentamicin", dose: "5 mg/kg q24h IV", note: "TDM required. Levels at 1h and 23h." },
      { drug: "Cefotaxime", dose: "50 mg/kg q12h IV", note: "Alternative; less nephrotoxic." },
    ]
  },
  infant: {
    label: "Infant (1–24 months)",
    urgency: "Febrile UTI — imaging needed",
    ref: "ISPN 2020 / AAP 2021",
    keySteps: [
      "Catheter/SPA specimen preferred. MSU if toilet trained.",
      "Urinalysis + culture before antibiotics",
      "IV/IM if <3 months or unwell: Ceftriaxone 50mg/kg/day",
      "Oral if >3 months, well: TMP-SMX or cefixime",
      "Duration: 7–10 days febrile UTI",
      "RBUS after first febrile UTI",
      "VCUG if USS abnormal or recurrent febrile UTI",
    ],
    antibiotics: [
      { drug: "Ceftriaxone", dose: "50 mg/kg/day IV/IM OD", note: "If <3mo or systemically unwell." },
      { drug: "Cefixime", dose: "8 mg/kg/day PO BID", note: "Oral step-down. Taxim-O, Cefix." },
      { drug: "TMP-SMX", dose: "6–12 mg TMP/kg/day BID", note: "Check resistance. Avoid <2 months." },
      { drug: "Nitrofurantoin", dose: "5–7 mg/kg/day QID", note: "Lower UTI ONLY. Not for febrile UTI." },
    ]
  },
  child: {
    label: "Child (2–12 years)",
    urgency: "Depends on severity",
    ref: "ISPN 2020",
    keySteps: [
      "Clean MSU — proper mid-stream collection essential",
      "Dipstick + culture before starting antibiotics",
      "Oral antibiotics first-line if not systemically unwell",
      "Duration: 5 days lower UTI; 7–10 febrile UTI",
      "RBUS only if recurrent or abnormal response",
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
    label: "MDR/ESBL Organisms",
    urgency: "MDR UTI — escalation needed",
    ref: "ISPN / Local AST",
    keySteps: [
      "ESBL-producing organisms: E. coli, Klebsiella — no cephalosporins",
      "IV Meropenem: 20mg/kg q8h",
      "Ertapenem: once-daily option for step-down",
      "Oral: Fosfomycin (if susceptible) for lower UTI",
      "Colistin: last resort — daily renal monitoring required",
      "Duration: minimum 10–14 days for febrile MDR UTI",
      "Repeat culture 48h after start and 5 days post-treatment",
    ],
    antibiotics: [
      { drug: "Meropenem", dose: "20 mg/kg q8h IV", note: "ESBL first choice. eGFR-adjust." },
      { drug: "Ertapenem", dose: "15–20 mg/kg/day OD IV", note: "Outpatient-friendly carbapenem." },
      { drug: "Fosfomycin", dose: "100 mg/kg/day q8h IV", note: "ESBL lower UTI. Oral in some countries." },
      { drug: "Colistin", dose: "2.5–5 mg/kg/day divided q8–12h", note: "Last resort. Monitor renal daily." },
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
            <p className="text-red-100 text-sm">ISPN-based · Age-stratified pathways · Antibiotic cards · Imaging logic · CAP guidance</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {Object.entries(AGE_PATHWAYS).map(([key, val]) => (
          <button
            key={key}
            onClick={() => setAgeGroup(key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all ${ageGroup === key ? "bg-red-600 text-white border-red-600" : "bg-white text-slate-600 border-slate-200 hover:border-red-300"}`}
          >
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

      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-3">
          <p className="text-sm font-bold text-green-800 mb-2">IV → Oral Switch Criteria</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {["Afebrile >24h", "CRP falling", "Tolerating oral feeds", "Culture sensitivity confirmed", "No signs of sepsis", "Urine improving on treatment"].map(c => (
              <p key={c} className="text-slate-600 flex items-center gap-1">✓ {c}</p>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-3">
          <p className="text-sm font-bold text-amber-800 mb-2">Imaging Decision Logic (ISPN/NICE)</p>
          <div className="space-y-2 text-xs">
            <p className="text-slate-600"><span className="font-bold">RBUS:</span> All children after first febrile UTI, unusual organism, poor response, &lt;3 months age.</p>
            <p className="text-slate-600"><span className="font-bold">VCUG:</span> Abnormal RBUS, Grade 3+ VUR suspected, sibling with VUR, recurrent febrile UTI in males.</p>
            <p className="text-slate-600"><span className="font-bold">DMSA:</span> Acute (cortical defects). Scar assessment: &gt;6 months post-UTI. VUR management decisions.</p>
            <p className="text-slate-600"><span className="font-bold">MAG3:</span> Suspected obstruction. Differential renal function assessment.</p>
            <p className="text-slate-600"><span className="font-bold">CAP indications:</span> VUR Grade III–IV, recurrent febrile UTI despite treatment, post-transplant, single kidney + VUR.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-slate-50">
        <CardContent className="p-3">
          <p className="text-xs font-bold text-slate-500 mb-1">References</p>
          <p className="text-xs text-slate-600">1. ISPN Pediatric UTI Guideline. 2. Subcommittee on Urinary Tract Infection. AAP 2011/2021 Reaffirmation. 3. NICE CG54 Urinary tract infection in under 16s. 4. EAU/ESPU Pediatric Urology Guidelines 2023.</p>
        </CardContent>
      </Card>
    </div>
  );
}

// ── GN Bridge Panel — links to existing GN pathways ────────────────────────
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
  { name: "Congenital Nephrotic Syndrome", tag: "Genetic", color: "bg-indigo-100 text-indigo-800", keys: ["NPHS1 / NPHS2 mutations", "Albumin infusions + nutrition", "Early bilateral nephrectomy + dialysis", "Transplant after 9 kg"] },
];

function GNBridgePanel() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");
  const filters = ["All", "Nephrotic", "Haematuria/Mixed", "Vasculitis", "Autoimmune", "TMA", "Nephritic", "Genetic"];
  const filtered = filter === "All" ? GN_CONDITIONS : GN_CONDITIONS.filter(c => c.tag === filter);
  const [open, setOpen] = useState(null);

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

// ── Main Hub sections config ────────────────────────────────────────────────
const SECTIONS = [
  {
    id: "nephrology",
    label: "Nephrology",
    subtitle: "Core kidney modules",
    icon: Droplet,
    color: "from-blue-600 to-indigo-600",
    tabs: [
      { id: "cakut", label: "CAKUT", icon: Droplet, badge: "8 conditions" },
      { id: "tubular", label: "Tubular Lab", icon: TestTube, badge: "RTA · Stones" },
      { id: "uti", label: "UTI Master", icon: Microscope, badge: "ISPN" },
      { id: "gn", label: "Glomerular / GN", icon: FlaskConical, badge: "Pathways" },
    ]
  },
  {
    id: "urology",
    label: "Urology & Bladder",
    subtitle: "Functional & structural",
    icon: Activity,
    color: "from-violet-600 to-purple-600",
    tabs: [
      { id: "neuro_bladder", label: "Neurogenic Bladder", icon: Brain, badge: "Flagship" },
      { id: "bbd", label: "BBD / ICCS", icon: BookOpen, badge: "ICCS 2016" },
      { id: "uroflow", label: "Uroflow AI", icon: Activity, badge: "ICCS" },
      { id: "uds", label: "UDS Interpreter", icon: BarChart2, badge: "Full UDS" },
    ]
  },
  {
    id: "cockpit",
    label: "Patient Cockpit",
    subtitle: "Timeline & PDF export",
    icon: Heart,
    color: "from-blue-700 to-indigo-700",
    tabs: [
      { id: "timeline", label: "Clinical Timeline", icon: Heart, badge: "Multi-module" },
    ]
  },
  {
    id: "education",
    label: "Patient & Family",
    subtitle: "Education & counseling",
    icon: Users,
    color: "from-emerald-600 to-teal-600",
    tabs: [
      { id: "family_edu", label: "Family Education", icon: Users, badge: "CIC · CKD · Tx" },
    ]
  },
  {
    id: "research",
    label: "Research & Stats",
    subtitle: "Academic tools",
    icon: BarChart2,
    color: "from-slate-600 to-slate-800",
    tabs: [
      { id: "biostat", label: "Biostatistics Academy", icon: BarChart2, badge: "Full course" },
    ]
  },
];

const ALL_TABS = SECTIONS.flatMap(s => s.tabs);

function SectionNav({ activeSectionId, onSelectSection }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {SECTIONS.map(s => {
        const Icon = s.icon;
        const active = activeSectionId === s.id;
        return (
          <button
            key={s.id}
            onClick={() => onSelectSection(s)}
            className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${active ? "bg-gradient-to-r " + s.color + " text-white border-transparent shadow-md" : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"}`}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-xs">{s.label}</p>
              <p className={`text-xs ${active ? "text-white/70" : "text-slate-400"}`}>{s.subtitle}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default function UrologyNephrologyHub() {
  const [activeSection, setActiveSection] = useState(SECTIONS[0]);
  const [activeTab, setActiveTab] = useState("cakut");

  const handleSectionChange = (section) => {
    setActiveSection(section);
    setActiveTab(section.tabs[0].id);
  };

  const renderTabContent = (tabId) => {
    switch (tabId) {
      case "cakut": return <CAKUTMasterCenter />;
      case "neuro_bladder": return <NeurogenicBladderCenter />;
      case "uroflow": return <UroflowAIAnalyzer />;
      case "uds": return <UDSInterpreter />;
      case "bbd": return <BBDICCSModule />;
      case "tubular": return <TubularDisorderLab />;
      case "uti": return <UTIMasterModule />;
      case "gn": return <GNBridgePanel />;
      case "timeline": return <PatientCockpitTimeline />;
      case "family_edu": return <PatientFamilyEducation />;
      case "biostat": return <BiostatisticsAcademy />;
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
              <p className="text-blue-100 text-sm mt-1">CAKUT · GN · Tubular · UTI · Neurogenic Bladder · BBD · UDS · Patient Cockpit · Education</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {["ICCS 2016", "ISPN-based", "AI-powered", "Fellowship-grade", "Mobile-native"].map(t => (
                  <span key={t} className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{t}</span>
                ))}
              </div>
            </div>
            <Badge className="bg-white/20 text-white border-white/30 border text-xs flex-shrink-0">v3.0</Badge>
          </div>
        </div>

        {/* Section navigation */}
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select Section</p>
          <SectionNav activeSectionId={activeSection.id} onSelectSection={handleSectionChange} />
        </div>

        {/* Module tabs within section */}
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

        {/* Content */}
        <div className="mt-2">
          {renderTabContent(activeTab)}
        </div>

      </div>
    </div>
  );
}