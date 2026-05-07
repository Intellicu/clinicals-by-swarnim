import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ClipboardList, AlertTriangle, Droplet, Activity, Heart,
  TestTube, Pill, ChevronRight, Search, ArrowLeft, CheckSquare,
  Stethoscope, FlaskConical, Bell, Users
} from "lucide-react";

const ORDER_SETS = [
  {
    id: "aki",
    title: "Acute Kidney Injury (AKI)",
    color: "bg-orange-600",
    icon: Activity,
    badge: "orange",
    diagnosis: "AKI — Stage-based orders (KDIGO staging)",
    admission_type: "Pediatric Nephrology Ward / HDU",
    diagnosis_codes: ["Prerenal AKI", "Intrinsic AKI (ATN/GN)", "Post-renal AKI", "HUS-AKI"],
    labs: [
      "Serum creatinine, urea, electrolytes (Na, K, Cl, HCO3) — STAT and every 8–12h",
      "CBC with differential, blood film (? HUS — fragmented RBCs, thrombocytopenia)",
      "ABG / venous blood gas",
      "LDH, SGOT/SGPT (if HUS suspected)",
      "Spot urine: dipstick, microscopy (casts!), UNa, UCreatinine, FENa calculation",
      "Urine culture and sensitivity",
      "C3, C4, ANA, ANCA, anti-GBM — if GN suspected",
      "USG KUB (urgent, rule out obstruction) — within 4h of admission",
      "Peripheral smear for fragmented cells (HUS)",
      "Recheck electrolytes, creatinine 6–8h after any intervention"
    ],
    fluids: [
      "If pre-renal (FENa <1%, dehydrated): 10–20 mL/kg 0.9% NaCl bolus over 30 min, reassess",
      "If volume replete/overloaded: restrict to insensible losses + previous hour UO",
      "Maintenance fluid: 0.45% NaCl + 5% dextrose at calculated rate ONLY if not oliguric",
      "Oliguric AKI: restrict IV fluids to 300–400 mL/m²/day + replacement of measured outputs only",
      "Avoid potassium in IV fluids until K⁺ confirmed normal",
      "Avoid hypotonic fluids (0.2% NaCl) in renal impairment — hyponatremia risk"
    ],
    medications: [
      "HOLD: NSAIDs, ACE inhibitors, ARBs, aminoglycosides, contrast agents",
      "Furosemide 1–2 mg/kg IV if fluid overloaded with some urine output — NOT for oliguric ATN",
      "NaHCO3: if HCO3 <16 and hemodynamically stable: 1–2 mEq/kg IV over 2–4h",
      "Antihypertensive if BP >99th percentile: amlodipine 0.1 mg/kg OD or nifedipine SR",
      "H2 blocker or PPI: if uremic (ranitidine 1 mg/kg or omeprazole 0.5 mg/kg)"
    ],
    monitoring: [
      "Strict fluid balance — hourly urine output (catheterize if oliguric)",
      "Twice daily weight (same time, same scale, same clothing)",
      "BP 4-hourly (or continuous if unstable)",
      "Electrolytes 8–12h until stable",
      "Daily creatinine",
      "Continuous cardiac monitoring if K⁺ >6.0 mEq/L"
    ],
    nursing: [
      "Strict input-output chart — every hour for urine, document all drains",
      "Weigh patient every 12h",
      "No potassium in IV drips unless ordered by doctor",
      "Report: UO <0.5 mL/kg/h for 2h, BP >99th percentile, K⁺ >6.0",
      "Oral fluid allowed per doctor's instruction only — measure all given"
    ],
    consults: [
      "Pediatric Nephrology (if not already) — for Stage 2+ AKI",
      "Pediatric Urology — if obstruction suspected (urgently)",
      "Intensive Care — if Stage 3 AKI, refractory hyperkalemia, respiratory compromise",
      "Hematology — if HUS with neurological involvement or refractory thrombocytopenia"
    ],
    dialysis_triggers: [
      "K⁺ >6.5 mEq/L refractory to medical management",
      "HCO3 <10 mEq/L / pH <7.1",
      "Fluid overload with pulmonary edema unresponsive to furosemide",
      "Uremic encephalopathy, pericarditis, bleeding",
      "BUN >150 mg/dL (or rising rapidly)"
    ]
  },
  {
    id: "ns",
    title: "Nephrotic Syndrome — Active Relapse",
    color: "bg-blue-600",
    icon: Droplet,
    badge: "blue",
    diagnosis: "Nephrotic syndrome — relapse (UPCR >2.0, edema, hypoalbuminemia)",
    admission_type: "Pediatric Nephrology Ward (admit if severe edema, infection, or complications)",
    diagnosis_codes: ["SSNS relapse", "FRNS/SDNS relapse", "SRNS", "New presentation NS"],
    labs: [
      "Spot UPCR (first morning), urine dipstick, microscopy, culture",
      "Serum albumin, total protein, cholesterol, triglycerides",
      "Serum creatinine, electrolytes, CBC",
      "ANA, anti-dsDNA, C3/C4 (if first episode, >12 years, or atypical)",
      "ANCA, anti-GBM if rapidly progressive features",
      "Hepatitis B surface antigen, HIV if first episode in endemic area",
      "USG KUB: kidney size, echogenicity, ascites assessment",
      "Ascitic fluid analysis if tense ascites (rule out SBP)",
      "Blood culture if fever ≥38°C (spontaneous bacterial peritonitis risk)"
    ],
    fluids: [
      "Fluid restriction: only if severe hyponatremia (Na <125) or respiratory compromise",
      "Avoid IV NS for edema — worsens proteinuria",
      "20% albumin infusion 0.5–1 g/kg over 4h ONLY IF: serum albumin <15 g/L + symptomatic (respiratory compromise, severe anasarca, renal failure)",
      "Follow albumin infusion with furosemide 1 mg/kg IV immediately after (to prevent pulmonary edema)",
      "Ascites: therapeutic tap only if tense causing respiratory compromise"
    ],
    medications: [
      "Prednisolone 2 mg/kg/day (max 60 mg) in 2 divided doses (standard ISKDC relapse protocol)",
      "If FRNS: discuss alternate day steroids or steroid-sparing agent with attending",
      "Furosemide 1 mg/kg PO BID for symptomatic edema management (only if urine output adequate)",
      "Spironolactone 1–2 mg/kg/day: if furosemide resistance (add-on)",
      "Enalapril 0.1 mg/kg OD: antiproteinuric (start only when creatinine is normal)",
      "Penicillin V prophylaxis if previous SBP or high-risk",
      "Calcium + Vitamin D: cholecalciferol 400–800 IU/day + calcium 500 mg/day (steroid-related)",
      "Omeprazole 0.5–1 mg/kg OD: gastric protection during high-dose steroids"
    ],
    monitoring: [
      "Daily weight and urine dipstick (document in chart)",
      "BP twice daily (risk of hypertension with steroid therapy)",
      "Urine protein by dipstick every day",
      "Blood glucose every 3 days in first week (steroid hyperglycemia)",
      "Serum electrolytes weekly",
      "Fortnightly UPCR, albumin, creatinine"
    ],
    nursing: [
      "Weigh daily — morning after void, same clothes",
      "Urine dipstick daily — document result in chart",
      "Report: fever >38°C (SBP), abdominal pain, respiratory distress, severe edema worsening",
      "Measure abdominal girth daily if ascites",
      "No IM injections if severe edema (poor absorption)",
      "Skin care for edematous areas — repositioning every 2h"
    ],
    consults: [
      "Dietitian: low sodium (no-added-salt diet), adequate protein intake",
      "Ophthalmology: if steroids >3 months (cataract screening)",
      "Endocrinology: if hyperglycemia on steroids or growth failure",
      "Pediatric Nephrology Fellow: if steroid-resistant after 8 weeks"
    ],
    dialysis_triggers: [
      "AKI complicating NS with oliguria refractory to diuretics",
      "Severe fluid overload with pulmonary compromise",
      "Hyperkalemia secondary to AKI"
    ]
  },
  {
    id: "ckd",
    title: "CKD — Acute on Chronic Decompensation",
    color: "bg-indigo-600",
    icon: Heart,
    badge: "indigo",
    diagnosis: "CKD stage G4/G5 — acute decompensation / first admission for workup",
    admission_type: "Pediatric Nephrology Ward",
    diagnosis_codes: ["CKD G4", "CKD G5 (pre-dialysis)", "CKD G5D (on dialysis)"],
    labs: [
      "Creatinine, eGFR (bedside Schwartz), BUN, electrolytes",
      "CBC — Hb (anemia), MCV (iron deficiency vs EPO deficiency)",
      "Serum iron, TIBC, ferritin, transferrin saturation",
      "Calcium, phosphate, alkaline phosphatase, PTH (intact)",
      "25-OH Vitamin D",
      "Albumin, total protein, LFT",
      "ABG or venous blood gas (HCO3 level)",
      "Spot UPCR",
      "USG KUB: kidney size (small = chronic), echogenicity, obstruction",
      "Chest X-ray: cardiomegaly, pericardial effusion, pulmonary edema"
    ],
    fluids: [
      "Fluid restriction if fluid overloaded: 400 mL/m²/day + previous day UO",
      "Avoid 0.9% NaCl (Na load) unless dehydrated",
      "IV access for medications only — minimize unnecessary IV fluids",
      "If dehydrated (pre-renal AKI on CKD): cautious 10 mL/kg NS bolus, reassess"
    ],
    medications: [
      "STOP: NSAIDs, nephrotoxic antibiotics, K-sparing diuretics if K elevated, contrast agents",
      "ACE inhibitor: continue if proteinuric — HOLD only if K >5.5 or creatinine rising >30%",
      "Antihypertensive: target BP <50th percentile. Amlodipine + ACE-i preferred",
      "NaHCO3 (sodium bicarbonate): 1–3 mEq/kg/day PO — if HCO3 <22",
      "Phosphate binder (calcium carbonate) with meals if phosphate >1.5 mmol/L",
      "Active vitamin D (calcitriol 0.01–0.05 mcg/kg/day) if PTH elevated + low vitamin D",
      "EPO 100–150 u/kg SC 3x/week: start if Hb <10 g/dL and iron replete",
      "IV iron sucrose if TSAT <20% or ferritin <100"
    ],
    monitoring: [
      "Twice daily BP",
      "Daily fluid balance",
      "Daily weight",
      "Weekly: CBC, creatinine, electrolytes, phosphate, calcium",
      "Fortnightly: PTH, 25-OH Vitamin D (while adjusting)",
      "Growth velocity every 3 months (height, weight, head circumference)"
    ],
    nursing: [
      "Strict fluid chart — report if UO <1 mL/kg/h",
      "Low phosphate, low potassium diet (if K >5.5)",
      "No potassium in IV fluids",
      "Report: confusion/altered behavior (uremic encephalopathy), new onset headache, respiratory distress",
      "Monthly weight and height for growth monitoring"
    ],
    consults: [
      "Dietitian: renal diet counseling (phosphate, protein, potassium, calorie goals)",
      "Social worker: chronic disease support, school/financial assistance",
      "Transplant team: evaluation if GFR heading to <15 (pre-emptive transplant listing)",
      "Pediatric Endocrinology: growth failure evaluation for rhGH therapy"
    ],
    dialysis_triggers: [
      "eGFR <10 mL/min/1.73m² with symptoms",
      "Refractory hyperkalemia, acidosis, fluid overload",
      "Pericarditis, uremic encephalopathy",
      "Growth failure refractory to conservative management at GFR <15"
    ]
  },
  {
    id: "dialysis",
    title: "Dialysis Initiation — Pediatric",
    color: "bg-teal-600",
    icon: FlaskConical,
    badge: "teal",
    diagnosis: "Initiation of renal replacement therapy (CRRT / HD / PD)",
    admission_type: "Pediatric ICU / Nephrology HDU",
    diagnosis_codes: ["AKI Stage 3 — dialysis initiation", "CKD G5D — dialysis start", "CRRT for sepsis-AKI"],
    labs: [
      "Pre-dialysis: K, creatinine, BUN, phosphate, albumin, ABG, CBC",
      "Coagulation screen (aPTT, PT/INR, fibrinogen) before CRRT",
      "Blood culture before IV access insertion",
      "Type and crossmatch (hold for first HD if first time)",
      "Hepatitis B, C, HIV serology (baseline before chronic dialysis)",
      "Post-dialysis (1h): K, creatinine, BUN — calculate URR and Kt/V",
      "Weekly: CBC, electrolytes, albumin, phosphate, calcium",
      "Monthly: PTH, ferritin, TSAT, adequacy parameters"
    ],
    fluids: [
      "CRRT: replacement fluid and dialysate per CRRT prescription (35 mL/kg/hr effluent dose)",
      "HD: no IV fluids during session except prescribed — UF to reach dry weight",
      "PD: PD fluid per prescription (exchanges per day, dwell time, drain volume)",
      "Interdialytic (between HD): fluid restriction 500 mL + previous day UO"
    ],
    medications: [
      "Heparin (HD): 10–20 u/kg bolus + 10 u/kg/hr infusion intra-dialysis (ACT 200–250s)",
      "Regional citrate anticoagulation (CRRT preferred in bleeding risk): per protocol",
      "Iron sucrose IV: if TSAT <20% — 1 mg/kg/session (max 200mg) × 5 sessions",
      "EPO: 100–150 u/kg SC 3x/week on dialysis days (Hb target 10–12 g/dL)",
      "Phosphate binder: calcium carbonate with every meal",
      "Calcitriol: 0.01–0.05 mcg/kg/day PO",
      "HOLD: all potentially nephrotoxic medications",
      "Dose adjust ALL renally-cleared medications per eGFR <10"
    ],
    monitoring: [
      "Intradialytic BP every 30 min",
      "Pre and post-dialysis weight (UF calculation)",
      "Access patency (flow rates, pressures) — document each session",
      "CRRT: hourly fluid balance, filter life, pressures",
      "Kt/V every 2 weeks (HD adequacy) — target >1.4/session",
      "PD: monthly PET (peritoneal equilibration test) first 3 months"
    ],
    nursing: [
      "Access care: HD catheter/AVF — sterile technique, no BP/blood draw from AVF arm",
      "PD exit site: daily cleaning with povidone iodine or chlorhexidine",
      "Report: fever during/after dialysis, shivering, redness at access site",
      "Fluid balance: all PD drain volumes to be measured and documented",
      "Patient/family education: home PD training (if CAPD planned)"
    ],
    consults: [
      "Pediatric Vascular Surgery: AVF creation planning for chronic HD",
      "Interventional Radiology: tunneled catheter placement",
      "Transplant team: ongoing evaluation for listing",
      "Dietitian: specialized dialysis diet (high protein, phosphate/K restriction)"
    ],
    dialysis_triggers: [
      "N/A — this IS the dialysis admission",
      "Escalation to CRRT: hemodynamic instability on HD",
      "ICU consultation: deteriorating clinical status"
    ]
  },
  {
    id: "uti",
    title: "Febrile UTI / Pyelonephritis",
    color: "bg-rose-600",
    icon: Stethoscope,
    badge: "rose",
    diagnosis: "First febrile UTI / pyelonephritis in child <5 years OR recurrent UTI with structural anomaly",
    admission_type: "Pediatric Ward (admit <3 months, severe, or unable to tolerate oral)",
    diagnosis_codes: ["First febrile UTI", "Recurrent UTI with VUR", "UTI with AKI", "UTI + renal scar"],
    labs: [
      "Urine: catheter sample or suprapubic aspirate (<3 years) for MC&S — before antibiotics",
      "Urinalysis: pyuria >5 WBC/HPF, bacteria, nitrites",
      "CBC: WBC count, CRP, procalcitonin (assess systemic severity)",
      "Blood culture × 2 (if septic-appearing or <3 months)",
      "Creatinine, electrolytes",
      "Renal USG within 24h of admission (? structural anomaly, abscess, obstruction)",
      "DMSA scan: 4–6 months post-UTI (scarring assessment) — do NOT in acute phase",
      "MCUG: 6–8 weeks post-UTI if: <3 years male, recurrent UTIs, dilated system on USG",
      "Urine dipstick daily while on treatment"
    ],
    fluids: [
      "Encourage oral fluids (high fluid intake reduces bacterial colonization)",
      "IV hydration: 0.9% NaCl + 5% dextrose at maintenance if unable to tolerate orally or dehydrated",
      "Switch to oral as soon as tolerated (usually 24–48h after IV antibiotics)"
    ],
    medications: [
      "IV Cefotaxime 150 mg/kg/day divided q6h (or Ceftriaxone 75 mg/kg OD if once daily preferred)",
      "Alternative if ESBL suspected (prior resistant UTI): IV Piperacillin-tazobactam 300 mg/kg/day divided q6h",
      "Step-down to oral once afebrile 24–48h: Co-trimoxazole (if sensitive) or Cefixime 8 mg/kg OD × 10 days total",
      "Post-acute prophylaxis: Co-trimoxazole 1.25 mg/kg nocte — if VUR grade 3+ or recurrent",
      "Antipyretics: paracetamol 15 mg/kg q6h PRN",
      "Probiotic consideration (Lactobacillus) in UTI-prone patients — not mandatory"
    ],
    monitoring: [
      "Temperature 4-hourly",
      "Urine dipstick daily — document WBC, bacteria",
      "Creatinine and electrolytes on day 3 if still febrile / elevated on admission",
      "Repeat urine MC&S 48–72h after antibiotics (if not improving)",
      "BP daily (hypertension from pyelonephritis or underlying renal scarring)"
    ],
    nursing: [
      "Ensure adequate oral fluid intake — encourage by mouth",
      "Clean catch urine technique if older child, catheter if <2 years",
      "Report: persisting fever >38°C after 48h of IV antibiotics",
      "Hygiene counseling for girls: front-to-back wiping",
      "Voiding advice: regular voiding (every 2–3h), complete bladder emptying"
    ],
    consults: [
      "Pediatric Urology: if VUR grade 3–5, recurrent febrile UTI, or structural anomaly on USG",
      "Pediatric Nephrology: if AKI, CKD, bilateral renal scars, renal failure to thrive",
      "Microbiology: if resistant organism (ESBL, carbapenemase) for antibiotic guidance"
    ],
    dialysis_triggers: [
      "UTI-associated AKI with oliguria — see AKI order set",
      "Urosepsis with hemodynamic instability — ICU transfer"
    ]
  }
];

const BADGE_COLORS = {
  orange: "bg-orange-100 text-orange-700",
  blue: "bg-blue-100 text-blue-700",
  indigo: "bg-indigo-100 text-indigo-700",
  teal: "bg-teal-100 text-teal-700",
  rose: "bg-rose-100 text-rose-700",
};

const SECTION_TABS = [
  { key: "labs", label: "Labs & Imaging", icon: TestTube },
  { key: "fluids", label: "Fluids", icon: Droplet },
  { key: "medications", label: "Medications", icon: Pill },
  { key: "monitoring", label: "Monitoring", icon: Activity },
  { key: "nursing", label: "Nursing Instructions", icon: Bell },
  { key: "consults", label: "Consults", icon: Users },
  { key: "dialysis_triggers", label: "Dialysis / Escalation Triggers", icon: AlertTriangle },
];

export default function AdmissionOrders() {
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("labs");

  const order = selected ? ORDER_SETS.find(o => o.id === selected) : null;
  const filtered = ORDER_SETS.filter(o =>
    o.title.toLowerCase().includes(search.toLowerCase()) ||
    o.diagnosis.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-indigo-700 via-blue-600 to-teal-600 p-6 text-white shadow-xl">
          <div className="flex items-center gap-3">
            <ClipboardList className="w-9 h-9" />
            <div>
              <h1 className="text-3xl font-bold">Admission Order Sets</h1>
              <p className="text-indigo-100 text-sm mt-0.5">Disease-specific orders: labs, fluids, medications, monitoring, nursing, consults</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {ORDER_SETS.map(o => (
              <button
                key={o.id}
                onClick={() => { setSelected(o.id); setActiveTab("labs"); }}
                className={`text-xs px-3 py-1 rounded-full border border-white/30 transition-all ${selected === o.id ? "bg-white text-indigo-800 font-bold" : "bg-white/20 hover:bg-white/30 text-white"}`}
              >
                {o.title.split("—")[0].trim()}
              </button>
            ))}
          </div>
        </div>

        {!order && (
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input className="pl-10 bg-white" placeholder="Search order sets..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        )}

        {!order ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(o => {
              const Icon = o.icon;
              return (
                <Card
                  key={o.id}
                  onClick={() => { setSelected(o.id); setActiveTab("labs"); }}
                  className="cursor-pointer hover:shadow-xl transition-all border-2 hover:border-indigo-400 group"
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-12 h-12 ${o.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-md flex-shrink-0`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900">{o.title}</h3>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{o.diagnosis}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {o.diagnosis_codes.map((code, i) => (
                        <Badge key={i} className={`text-xs ${BADGE_COLORS[o.badge]}`}>{code}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div>
            <Button variant="outline" onClick={() => setSelected(null)} className="mb-4 gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to All Order Sets
            </Button>

            <div className="grid lg:grid-cols-4 gap-6">
              {/* Sidebar */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardContent className="p-3">
                    <div className={`${order.color} rounded-xl p-4 text-white mb-3`}>
                      <h2 className="font-bold text-lg">{order.title}</h2>
                      <p className="text-xs mt-1 opacity-90">{order.admission_type}</p>
                    </div>
                    <div className="space-y-1">
                      {SECTION_TABS.map(tab => (
                        <button
                          key={tab.key}
                          onClick={() => setActiveTab(tab.key)}
                          className={`w-full text-left flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.key ? "bg-indigo-600 text-white" : "hover:bg-slate-100 text-slate-700"}`}
                        >
                          <tab.icon className="w-4 h-4 flex-shrink-0" />
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Content */}
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-indigo-50">
                    <CardTitle className="flex items-center gap-2">
                      {SECTION_TABS.find(t => t.key === activeTab) && React.createElement(SECTION_TABS.find(t => t.key === activeTab).icon, { className: "w-5 h-5 text-indigo-600" })}
                      {SECTION_TABS.find(t => t.key === activeTab)?.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {activeTab === "dialysis_triggers" ? (
                      <ul className="space-y-2">
                        {order[activeTab].map((item, i) => (
                          <li key={i} className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                            <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-red-800 font-medium">{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <ul className="space-y-2">
                        {order[activeTab]?.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-700 border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                            <CheckSquare className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}