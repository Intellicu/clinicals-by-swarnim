import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Droplet, Brain, Activity, TestTube, BookOpen, Stethoscope,
  AlertTriangle, Baby, Microscope, BarChart2
} from "lucide-react";
import CAKUTMasterCenter from "../components/cakut/CAKUTMasterCenter";
import NeurogenicBladderCenter from "../components/urology/NeurogenicBladderCenter";
import UroflowAIAnalyzer from "../components/urology/UroflowAIAnalyzer";
import TubularDisorderLab from "../components/tubular/TubularDisorderLab";
import BiostatisticsAcademy from "../components/research/BiostatisticsAcademy";

const UTIMasterModule = () => {
  const [ageGroup, setAgeGroup] = useState("infant");

  const AGE_PATHWAYS = {
    neonate: {
      label: "Neonate (<28 days)",
      urgency: "Sepsis workup mandatory",
      keySteps: [
        "Full septic workup: CBC, CRP, blood culture, CSF, urine culture (SPA or catheter specimen)",
        "IV antibiotics: Ampicillin 50mg/kg q12h + Gentamicin 5mg/kg q24h",
        "Duration: 10–14 days IV if culture positive",
        "Imaging: USS kidneys + bladder within 24–48h",
        "VCUG: after treatment if USS abnormal",
        "Follow-up: Urine culture 48–72h post-treatment",
      ],
      antibiotics: [
        { drug: "Ampicillin", dose: "50 mg/kg/dose q12h IV", note: "For GBS, Listeria coverage. Adjust for CKD." },
        { drug: "Gentamicin", dose: "5 mg/kg q24h IV", note: "TDM required. Avoid if eGFR very low. Levels at 1h and 23h." },
        { drug: "Cefotaxime", dose: "50 mg/kg q12h IV", note: "Alternative to aminoglycoside. Less nephrotoxic." },
      ]
    },
    infant: {
      label: "Infant (1–24 months)",
      urgency: "Febrile UTI — imaging needed",
      keySteps: [
        "Urine collection: Catheter specimen or SPA preferred. Mid-stream if toilet trained.",
        "Urinalysis + culture before starting antibiotics",
        "IV or IM if <3 months or unwell: Ceftriaxone 50mg/kg/day",
        "Oral if >3 months, well: Trimethoprim-sulfamethoxazole, cefixime",
        "Duration: 7–10 days for febrile UTI",
        "RBUS after first febrile UTI",
        "VCUG if USS abnormal or recurrent febrile UTI",
      ],
      antibiotics: [
        { drug: "Ceftriaxone", dose: "50 mg/kg/day IV/IM OD", note: "If <3mo or systemically unwell. Renal-safe." },
        { drug: "Cefixime", dose: "8 mg/kg/day PO BID", note: "Oral step-down. Brands: Taxim-O, Cefix." },
        { drug: "TMP-SMX", dose: "6–12 mg TMP/kg/day BID", note: "Check local resistance pattern. Avoid <2 months." },
        { drug: "Nitrofurantoin", dose: "5–7 mg/kg/day QID", note: "LOWER UTI only. NOT for febrile/pyelonephritis." },
      ]
    },
    child: {
      label: "Child (2–12 years)",
      urgency: "Depends on severity",
      keySteps: [
        "Clean mid-stream urine — properly collected",
        "Dipstick + culture",
        "Oral antibiotics first-line if not systemically unwell",
        "Duration: 5 days for lower UTI; 7–10 for febrile UTI",
        "Imaging: RBUS only if recurrent/abnormal response",
        "Screen for BBD: bladder diary, bowel habits, voiding pattern",
        "CAP if VUR Grade III–IV or recurrent febrile UTI",
      ],
      antibiotics: [
        { drug: "TMP-SMX", dose: "6 mg TMP/kg/day BID PO", note: "First-line if susceptible. Cekinol, Bactrim." },
        { drug: "Cephalexin", dose: "25 mg/kg/day QID PO", note: "Oral cephalosporin. Ceporex, Cephaxin." },
        { drug: "Amoxicillin-clavulanate", dose: "25–45 mg/kg/day BID PO", note: "If resistant organisms suspected. Augmentin." },
        { drug: "Nitrofurantoin (CAP)", dose: "1–2 mg/kg/day OD", note: "Long-term prophylaxis. Monitor LFTs annually." },
        { drug: "TMP (CAP)", dose: "1–2 mg/kg/day OD", note: "Prophylaxis option. Low dose." },
      ]
    },
    resistant: {
      label: "Resistant Organisms / ESBL",
      urgency: "MDR UTI — escalation needed",
      keySteps: [
        "ESBL-producing organisms: E. coli, Klebsiella",
        "IV carbapenem: Meropenem 20mg/kg q8h",
        "Oral step-down: Fosfomycin (if susceptible), Nitrofurantoin for lower UTI",
        "Avoid cephalosporins if ESBL confirmed",
        "Colistin: last resort, significant nephrotoxicity",
        "Duration: minimum 10–14 days for febrile MDR UTI",
        "Repeat culture 48h after start and 5 days post-treatment",
      ],
      antibiotics: [
        { drug: "Meropenem", dose: "20 mg/kg q8h IV", note: "For ESBL. Adjust in CKD (eGFR-based)." },
        { drug: "Ertapenem", dose: "15–20 mg/kg/day IV OD", note: "Outpatient-friendly once-daily carbapenem." },
        { drug: "Fosfomycin", dose: "100 mg/kg/day q8h IV", note: "ESBL lower UTI. Oral available in some countries." },
        { drug: "Colistin", dose: "2.5–5 mg/kg/day IV divided q8–12h", note: "Last resort. Monitor renal function closely daily." },
      ]
    }
  };

  const current = AGE_PATHWAYS[ageGroup];

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-red-700 to-orange-600 p-5 text-white">
        <div className="flex items-center gap-3">
          <Microscope className="w-7 h-7" />
          <div>
            <h2 className="text-xl font-bold">UTI Master Module</h2>
            <p className="text-red-100 text-sm">Age-stratified pathways · Antibiotic cards · Imaging logic · CAP guidance</p>
          </div>
        </div>
      </div>

      {/* Age group selector */}
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
          <div className="flex items-center gap-2 mb-3">
            <h3 className="font-bold text-slate-800">{current.label}</h3>
            <Badge className={`text-xs ${ageGroup === "resistant" ? "bg-red-200 text-red-700" : "bg-blue-100 text-blue-700"}`}>{current.urgency}</Badge>
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
                <div className="flex items-center justify-between">
                  <p className="font-bold text-sm text-slate-800">{ab.drug}</p>
                  <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{ab.dose}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{ab.note}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* IV to oral switch guidance */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-3">
          <p className="text-sm font-bold text-green-800 mb-2">IV → Oral Switch Criteria</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {["Afebrile >24h", "CRP falling", "Tolerating oral feeds", "Culture sensitivity confirmed", "No signs of sepsis", "Urine culture improving"].map(c => (
              <p key={c} className="text-slate-600">✓ {c}</p>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Imaging logic */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-3">
          <p className="text-sm font-bold text-amber-800 mb-2">Imaging Decision Logic</p>
          <div className="space-y-2 text-xs">
            <p className="text-slate-600"><span className="font-bold">RBUS:</span> All children after first febrile UTI. Also if unusual organism, recurrent UTI, poor response.</p>
            <p className="text-slate-600"><span className="font-bold">VCUG:</span> Abnormal RBUS, Grade 3+ VUR suspected, sibling with VUR, recurrent febrile UTI.</p>
            <p className="text-slate-600"><span className="font-bold">DMSA:</span> Acute: cortical defects. Scar: &gt;6 months post-UTI. Essential for VUR management decisions.</p>
            <p className="text-slate-600"><span className="font-bold">MAG3:</span> Suspected obstruction. Differential function assessment.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const TABS = [
  { id: "cakut", label: "CAKUT Center", icon: Droplet, badge: "8 modules" },
  { id: "neuro_bladder", label: "Neurogenic Bladder", icon: Brain, badge: "Flagship" },
  { id: "uroflow", label: "Uroflow AI", icon: Activity, badge: "AI" },
  { id: "tubular", label: "Tubular Lab", icon: TestTube, badge: "RTA + Stones" },
  { id: "uti", label: "UTI Master", icon: Microscope, badge: "All ages" },
  { id: "biostat", label: "Biostatistics", icon: BarChart2, badge: "Academy" },
];

export default function UrologyNephrologyHub() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-3 md:p-6">
      <div className="max-w-4xl mx-auto space-y-4">

        {/* Hero */}
        <div className="rounded-2xl bg-gradient-to-br from-blue-800 via-indigo-700 to-violet-700 p-5 text-white shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Nephrology & Urology Intelligence Hub</h1>
              <p className="text-blue-100 text-sm mt-1">CAKUT · Neurogenic Bladder · Tubular Disorders · UTI · Research Academy</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {["AI-powered", "Fellowship-grade", "Mobile-native", "Resident teaching", "Evidence-based"].map(t => (
                  <span key={t} className="text-xs bg-white/20 px-2 py-0.5 rounded-full text-white">{t}</span>
                ))}
              </div>
            </div>
            <Badge className="bg-white/20 text-white border-white/30 border text-xs flex-shrink-0">v2.0</Badge>
          </div>
        </div>

        {/* Module tabs */}
        <Tabs defaultValue="cakut">
          <TabsList className="flex w-full h-auto overflow-x-auto bg-white border-2 border-slate-200 shadow-sm p-1 rounded-xl gap-1">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex flex-col items-center gap-1 py-2 px-2.5 flex-shrink-0 text-xs rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs">{tab.label}</span>
                  <span className="text-xs opacity-70">{tab.badge}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="cakut" className="mt-4">
            <CAKUTMasterCenter />
          </TabsContent>
          <TabsContent value="neuro_bladder" className="mt-4">
            <NeurogenicBladderCenter />
          </TabsContent>
          <TabsContent value="uroflow" className="mt-4">
            <UroflowAIAnalyzer />
          </TabsContent>
          <TabsContent value="tubular" className="mt-4">
            <TubularDisorderLab />
          </TabsContent>
          <TabsContent value="uti" className="mt-4">
            <UTIMasterModule />
          </TabsContent>
          <TabsContent value="biostat" className="mt-4">
            <BiostatisticsAcademy />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}