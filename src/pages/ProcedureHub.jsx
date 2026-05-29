import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, ChevronDown, ChevronUp, Stethoscope, Droplet, Activity, Shield } from "lucide-react";

const PROCEDURES = [
  {
    id: "kidney_biopsy",
    title: "Kidney Biopsy Checklist",
    icon: Shield,
    color: "from-blue-600 to-indigo-700",
    badge: "Percutaneous / US-guided",
    sections: [
      {
        heading: "Pre-procedure Checklist",
        color: "bg-blue-50 border-blue-200",
        items: [
          "Informed written consent (parent + assent if child >7y)",
          "BP controlled: target <130/80 mmHg; hold ACEi/ARB 48h pre",
          "Haemoglobin ≥8 g/dL (transfuse if <8 and urgent biopsy required)",
          "Platelet count ≥80,000/mm³",
          "PT/INR ≤1.5; APTT within normal limits",
          "Creatinine + eGFR documented",
          "Stop anticoagulants: Warfarin ≥5 days; LMWH 12–24h; Aspirin 7–10 days; NSAIDs 5–7 days",
          "Stop Clopidogrel ≥7 days pre",
          "Renal ultrasound: confirm size, position, exclude single kidney unless unavoidable",
          "IV access secured",
          "Group & crossmatch (hold 2 units PRBC on standby)",
          "Anaesthesia assessment: GA vs sedation vs LA plan",
          "NPO: 4–6h (solids), 2h (clear fluids) per local protocol",
          "Baseline urinalysis (dipstick haematuria documented)",
        ],
      },
      {
        heading: "Procedure — US-guided Percutaneous",
        color: "bg-slate-50 border-slate-200",
        items: [
          "Position: prone; pillow under abdomen to move kidney posteriorly",
          "Ultrasound: identify lower pole of left kidney (preferred: further from liver, IVC)",
          "Sterilise field: chlorhexidine + drape",
          "LA: 1% lignocaine to skin + track, wait 2–3 min",
          "Introduce 14G or 16G automated spring-loaded biopsy gun",
          "Confirm needle position with US before firing",
          "Target: lower pole cortex, avoid hilum and medulla",
          "Minimum 2 cores; optimally 3 cores (LM + IF + EM)",
          "Immediately inspect core under loupe: cortex = pale/tan; medulla = dark red",
          "Minimum 10 glomeruli for adequate sample (aim 15–20)",
          "Place sample: one in formalin (LM), one in Michel's / liquid nitrogen (IF), one in glutaraldehyde (EM)",
          "Apply direct pressure to flank ×10 min post",
        ],
      },
      {
        heading: "Post-procedure Monitoring",
        color: "bg-amber-50 border-amber-200",
        items: [
          "Bed rest: 6h post-biopsy minimum",
          "Vital signs q15min ×1h, then q30min ×2h, then q1h ×3h",
          "Monitor urine output and colour (haematuria chart)",
          "Repeat USS at 2–4h to exclude haematoma if concern",
          "Ensure adequate oral fluid intake (3–4 L/day)",
          "Discharge criteria: stable vitals, urine clearing, no flank pain, tolerating orals",
          "Discharge instructions: no strenuous activity 2w, no NSAIDs 1w, return if gross haematuria",
          "Expected: haematuria up to 24–48h post — reassure",
        ],
      },
      {
        heading: "Complications & Management",
        color: "bg-red-50 border-red-200",
        items: [
          "Haematuria (gross): most resolve with hydration; uroradiology if persistent >48h",
          "Perinephric haematoma: small (<3 cm) → conservative; large → transfusion ± angioembolism",
          "Arteriovenous fistula: haematuria + HTN + bruit → angiography + embolisation",
          "Inadvertent organ biopsy (liver, spleen): rare; observe; surgical review if haematoma",
          "Infection: rare; prophylactic abx not routinely recommended",
          "Failed biopsy / inadequate sample: discuss with nephropathologist; repeat vs open biopsy",
        ],
      },
    ],
  },
  {
    id: "hd_catheter",
    title: "HD Catheter Insertion Guide",
    icon: Droplet,
    color: "from-teal-600 to-cyan-700",
    badge: "Tunnelled / Non-tunnelled",
    sections: [
      {
        heading: "Site Selection",
        color: "bg-teal-50 border-teal-200",
        items: [
          "Preferred order: Right IJV → Left IJV → Femoral vein (temporary) → Subclavian (last resort — risk of stenosis)",
          "Avoid subclavian if potential future AVF on same side",
          "Tunnelled vs non-tunnelled: non-tunnelled for short-term (<3w) only",
          "Paediatric catheter sizing: <10 kg: 8Fr; 10–25 kg: 10Fr; >25 kg: 11.5–12Fr",
        ],
      },
      {
        heading: "Pre-procedure Checklist",
        color: "bg-slate-50 border-slate-200",
        items: [
          "Written consent obtained",
          "Platelet ≥50,000; INR ≤2.0 (correct coagulopathy first)",
          "Stop anticoagulants: LMWH 12h pre",
          "US Doppler: confirm venous patency and anatomy",
          "Position: supine with Trendelenburg (IJV) or flat (femoral); head turned to contralateral side (IJV)",
          "Full sterile barrier precautions: cap, mask, gown, gloves, large drape",
          "Chlorhexidine skin prep; allow to dry",
          "Confirm US machine, guidewire (0.035\"), dilators, catheter, suture kit on table",
          "Confirm exit port labels: arterial (red) = proximal / venous (blue) = distal",
        ],
      },
      {
        heading: "Seldinger Technique (US-guided)",
        color: "bg-blue-50 border-blue-200",
        items: [
          "Needle in-plane with probe: visualise needle entering vein",
          "Aspirate dark venous blood: confirm non-pulsatile (if pulsatile → arterial → remove, compress ×10 min)",
          "Pass guidewire through needle; confirm position under US or fluoroscopy",
          "Remove needle; nick skin with #11 blade; dilate with sequential dilators",
          "Advance catheter over wire to appropriate depth: Right IJV 15 cm adult / 10 cm peds",
          "Remove wire; aspirate and flush both ports with saline",
          "Confirm blood flashback and easy flush both ports",
          "For tunnelled catheters: create tunnel before final insertion; secure exit site",
          "Secure with suture; apply occlusive dressing",
          "CXR mandatory for IJV / subclavian — confirm tip at SVC/RA junction; exclude pneumothorax",
        ],
      },
      {
        heading: "Post-procedure Care",
        color: "bg-amber-50 border-amber-200",
        items: [
          "Lock each port with heparin 1000 IU/mL (or trisodium citrate per local protocol)",
          "Catheter care: aseptic technique for every access; chlorhexidine hub scrub ×15 sec",
          "Cap and label each port clearly",
          "Dressing change: every 72h or when soiled",
          "Assess daily for signs of CRBSI: fever, exit site erythema/discharge, rigors during dialysis",
          "Document catheter insertion details: date, site, tip position, inserted by",
        ],
      },
    ],
  },
  {
    id: "capd_catheter",
    title: "CAPD Catheter Insertion Guide",
    icon: Activity,
    color: "from-cyan-600 to-blue-700",
    badge: "Tenckhoff / Swan-neck",
    sections: [
      {
        heading: "Pre-operative Assessment",
        color: "bg-cyan-50 border-cyan-200",
        items: [
          "BMI assessment and abdominal wall evaluation (obesity, hernias, scars)",
          "Bowel preparation: laxatives 24h pre to evacuate constipation",
          "Bladder: empty immediately pre-procedure",
          "Screen for Staph aureus nasal carriage (MRSA swab): if positive → decolonise with mupirocin nasal ointment + chlorhexidine wash ×5 days",
          "Prophylactic antibiotics: IV cefazolin 1g (or 15 mg/kg) at induction OR vancomycin if MRSA risk",
          "Exit site planning: mark on day before in sitting position — avoid belt line, skin folds, scars, umbilicus",
          "Optimise nutritional status (albumin >25 g/L preferred)",
          "Consent: include risk of hernia, leak, infection, technique failure",
        ],
      },
      {
        heading: "Catheter Selection",
        color: "bg-slate-50 border-slate-200",
        items: [
          "Standard: double-cuff Tenckhoff catheter (curled tip preferred in paeds)",
          "Swan-neck Missouri / Toronto Western: for obese patients or specific anatomies",
          "Paediatric sizing: <1 y: neonatal Tenckhoff; 1–5 y: child size; >5 y: adult/child depending on size",
          "Tunnel direction: downward exit (swan-neck) preferred — reduced infection rates",
        ],
      },
      {
        heading: "Surgical Technique (Mini-laparotomy)",
        color: "bg-blue-50 border-blue-200",
        items: [
          "Incision: 2–3 cm paramedian or midline, 2 cm below umbilicus",
          "Dissect to peritoneum: haemostatsis, enter with purse-string suture in situ",
          "Introduce catheter: tip directed to rectovesical pouch (aim for pelvis, left or right side)",
          "Confirm free flow of fluid / saline irrigation",
          "Tie purse-string sutures around catheter at peritoneum",
          "Secure deep cuff: within rectus muscle or at fascial level",
          "Tunnel subcutaneously: 2 cm below skin; exit site downward-facing",
          "Secure superficial cuff: 2 cm inside exit site",
          "Flush with 100–200 mL heparinised saline (500 IU/mL) and confirm drainage",
          "Apply exit site dressing: do not disturb for 5–7 days",
        ],
      },
      {
        heading: "Break-in Protocol & Post-op",
        color: "bg-amber-50 border-amber-200",
        items: [
          "Preferred: 2-week rest before use (urgent: supine low-volume exchanges possible from day 1–3)",
          "Start flushing: 250 mL hep saline twice weekly if not using immediately",
          "PD training: begin once exit site healed (2–4 weeks)",
          "Exit site care: clean with chlorhexidine daily; no submerging in water",
          "Early complications: leak, poor drainage (reposition, bowel constipation), haematoma",
          "Drain cloudy effluent → send for cell count, culture, Gram stain → peritonitis protocol",
        ],
      },
    ],
  },
  {
    id: "crrt_setup",
    title: "CRRT Setup Guide",
    icon: Activity,
    color: "from-indigo-600 to-purple-700",
    badge: "CVVH / CVVHDF / CVVHD",
    sections: [
      {
        heading: "Machine Preparation & Mode Selection",
        color: "bg-indigo-50 border-indigo-200",
        items: [
          "Mode selection: CVVH (convection) vs CVVHD (diffusion) vs CVVHDF (combined)",
          "Prescription dose: 20–25 mL/kg/h (standard) up to 35 mL/kg/h (sepsis/metabolic crisis)",
          "Paediatric dose: typically 2000–3000 mL/1.73m²/h (delivered dose target)",
          "Blood flow: start 3–5 mL/kg/min; adjust to achieve dose with filter life >24h",
          "Anticoagulation: regional citrate (preferred, if no hepatic failure) or unfractionated heparin",
          "Filter selection: AV600S (low volume), HF1400 (high volume), paediatric: ST100 or equivalent",
          "Prime circuit with 1L saline + 5000 IU heparin (standard adult); use blood prime if patient <10 kg",
        ],
      },
      {
        heading: "Anticoagulation Setup (Regional Citrate — RCA)",
        color: "bg-purple-50 border-purple-200",
        items: [
          "Citrate solution: 4% trisodium citrate at 3× blood flow rate (mL/h) as starting point",
          "Calcium replacement: IV CaCl₂ or calcium gluconate into return limb; target ionised Ca 1.1–1.3 mmol/L systemically",
          "Monitor circuit ionised Ca every 6h: target 0.25–0.35 mmol/L in filter",
          "Systemic Ca every 6h; adjust CaCl₂ infusion accordingly",
          "Calcium:citrate ratio: if >2.5 suggests citrate accumulation → reduce citrate or switch anticoag",
          "Hepatic failure: citrate accumulates → use heparin instead",
          "For Heparin RCA: 10–15 U/kg/h; target APTT 1.5–2× normal",
        ],
      },
      {
        heading: "Fluid Balance & Electrolyte Management",
        color: "bg-blue-50 border-blue-200",
        items: [
          "Net fluid removal (UFR): set based on clinical fluid balance target",
          "Replace potassium in replacement/dialysate fluid: adjust as per serum K⁺",
          "Phosphate: CRRT removes significant phosphate; monitor daily; supplement via replacement fluid or IV",
          "Sodium: replacement fluids typically 130–140 mmol/L; adjust if hypo/hypernatraemia",
          "Magnesium: monitor and replace (citrate chelation increases Mg loss)",
          "Temperature: warm replacement fluid or external warming; patients easily become hypothermic",
          "Drug dosing: most antibiotics, antifungals require dose adjustment — consult CRRT drug dosing charts",
        ],
      },
      {
        heading: "Troubleshooting & Filter Life Optimisation",
        color: "bg-amber-50 border-amber-200",
        items: [
          "High transmembrane pressure (TMP >250 mmHg) → filter clotting: check anticoag, kinking",
          "Low blood flow alarms: check access function, repositioning, suction",
          "Air detector alarm: inspect circuit for air, clamp and investigate before resuming",
          "Blood visible in effluent: membrane rupture → stop immediately → change circuit",
          "Filter life target: >20h with citrate; <12h with heparin alone may indicate inadequate anticoag",
          "Daily labs: FBC, UEC, LFTs, calcium, phosphate, magnesium, pH, lactate",
          "Document: hourly flow rates, fluid balance, circuit pressures, anticoagulation levels",
        ],
      },
    ],
  },
  {
    id: "pet_test",
    title: "Peritoneal Equilibration Test (PET)",
    icon: Stethoscope,
    color: "from-green-600 to-teal-700",
    badge: "Standard 4h Dwell",
    sections: [
      {
        heading: "PET — Purpose & Timing",
        color: "bg-green-50 border-green-200",
        items: [
          "Purpose: characterise peritoneal membrane transport and identify appropriate PD prescription",
          "Timing: perform at 4–8 weeks after PD initiation (after peritoneal inflammation resolves)",
          "Repeat if: peritonitis, change in dialysis adequacy, clinical deterioration",
          "Types: Standard PET (glucose 2.27%), Fast PET (modified), mini-PET",
          "Do NOT perform within 4 weeks of peritonitis episode",
          "Patient preparation: overnight drain and instil 2L (adult) / volume per BSA (paeds) of 2.27% glucose",
        ],
      },
      {
        heading: "Standard PET Protocol (4-hour Dwell)",
        color: "bg-teal-50 border-teal-200",
        items: [
          "T=0 (start): Drain overnight exchange completely; instil 2L of 2.27% glucose over 10 min",
          "Collect dialysate sample D0 at 2-min dwell time (initial concentration — D₀ glucose)",
          "Blood sample at T=0 for creatinine and glucose",
          "T=2h: collect 200 mL dialysate; return remaining volume; collect blood sample",
          "Calculate D2/D0 glucose ratio and D/P creatinine at 2h",
          "T=4h: drain completely over 20 min; measure total drain volume",
          "Collect dialysate sample D4h for creatinine and glucose",
          "Blood sample at 4h for creatinine and glucose",
          "Calculate D4/P4 creatinine ratio (primary PET result)",
          "Calculate D4/D0 glucose ratio (reflects glucose absorption)",
        ],
      },
      {
        heading: "PET Result Interpretation",
        color: "bg-blue-50 border-blue-200",
        items: [
          "High transporter (D/P Cr >0.81): rapid glucose absorption, poor UF → at risk fluid overload; use short dwells (APD preferred)",
          "High-average (D/P Cr 0.65–0.81): adequate transport; standard CAPD or APD well-tolerated",
          "Low-average (D/P Cr 0.50–0.65): slow transport; adequate with standard CAPD",
          "Low transporter (D/P Cr <0.50): very slow transport; long dwells; consider HD if ultrafiltration poor",
          "Ultrafiltration failure: net UF <400 mL at 4h with 2.27% dextrose → investigate cause",
          "Paediatric normals differ: consult BSA-based reference ranges",
          "Document: D/P Cr 4h, D/D0 glucose 4h, net UF volume at 4h",
        ],
      },
      {
        heading: "Prescription Adjustment Based on PET",
        color: "bg-amber-50 border-amber-200",
        items: [
          "High transporter → APD: short cycles 1–2h; avoid long daytime dwells with standard glucose",
          "High transporter + fluid overload → consider icodextrin for long dwell (daytime or overnight)",
          "High-average/Low-average → CAPD 4× 2L exchanges; or APD with 8–9h overnight",
          "Low transporter → CAPD with long dwells 6–8h; adequate time for solute equilibration",
          "Inadequate dialysis Kt/V: increase number of exchanges or volume per exchange",
          "Serial PET decline over months → membrane failure / encapsulating peritoneal sclerosis workup",
        ],
      },
    ],
  },
];

function ProcedureCard({ proc }) {
  const [openSection, setOpenSection] = useState(null);
  const [checkedItems, setCheckedItems] = useState({});
  const Icon = proc.icon;

  const toggleCheck = (sIdx, iIdx) => {
    const key = `${sIdx}-${iIdx}`;
    setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Card className="overflow-hidden">
      <div className={`bg-gradient-to-r ${proc.color} p-4 text-white`}>
        <div className="flex items-center gap-3">
          <Icon className="w-7 h-7 opacity-90" />
          <div>
            <h3 className="font-bold text-base">{proc.title}</h3>
            <Badge className="bg-white/20 text-white text-xs mt-1">{proc.badge}</Badge>
          </div>
        </div>
      </div>
      <CardContent className="p-0 divide-y divide-slate-100">
        {proc.sections.map((section, sIdx) => (
          <div key={sIdx}>
            <button
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 transition-colors"
              onClick={() => setOpenSection(openSection === sIdx ? null : sIdx)}
            >
              <span className="text-sm font-semibold text-slate-800">{section.heading}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">{section.items.length} items</span>
                {openSection === sIdx ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </button>
            {openSection === sIdx && (
              <div className={`px-4 pb-4 border-t ${section.color} border`}>
                <div className="mt-3 space-y-2">
                  {section.items.map((item, iIdx) => {
                    const key = `${sIdx}-${iIdx}`;
                    const checked = checkedItems[key];
                    return (
                      <button
                        key={iIdx}
                        className="w-full flex items-start gap-2.5 text-left p-2 rounded-lg hover:bg-white/60 transition-colors"
                        onClick={() => toggleCheck(sIdx, iIdx)}
                      >
                        <div className={`flex-shrink-0 w-5 h-5 rounded border-2 mt-0.5 flex items-center justify-center transition-colors ${checked ? "bg-green-500 border-green-500" : "border-slate-300 bg-white"}`}>
                          {checked && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <span className={`text-xs leading-relaxed ${checked ? "line-through text-slate-400" : "text-slate-700"}`}>{item}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function ProcedureHub() {
  const [activeProc, setActiveProc] = useState(PROCEDURES[0].id);
  const currentProc = PROCEDURES.find(p => p.id === activeProc);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-3xl mx-auto px-3 py-4 space-y-4">
        {/* Header */}
        <Card className="bg-gradient-to-r from-slate-700 to-slate-900 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Stethoscope className="w-8 h-8 opacity-90" />
              <div>
                <h1 className="font-bold text-lg">Procedural Medicine Hub</h1>
                <p className="text-slate-300 text-xs">Interactive checklists for nephrology procedures</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Alert className="bg-amber-50 border-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <AlertDescription className="text-xs text-amber-800">
            <strong>Educational Use Only.</strong> Always follow your institutional protocols. Procedures must be performed by appropriately trained personnel under supervision.
          </AlertDescription>
        </Alert>

        {/* Procedure selector */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {PROCEDURES.map(p => (
            <button
              key={p.id}
              onClick={() => setActiveProc(p.id)}
              className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap ${activeProc === p.id ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"}`}
            >
              {p.title.split(" ").slice(0, 3).join(" ")}
            </button>
          ))}
        </div>

        {currentProc && <ProcedureCard proc={currentProc} />}
      </div>
    </div>
  );
}