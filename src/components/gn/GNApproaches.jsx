import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronDown, ChevronUp, AlertTriangle, GitBranch, Activity } from "lucide-react";

const GN_APPROACHES = [
  {
    id: "nephrotic",
    name: "Nephrotic Syndrome",
    icon: "💧",
    urgency: "high",
    differentials: ["MCD (children >90%)", "FSGS (primary/genetic/secondary)", "Membranous Nephropathy (adults)", "Diabetic Nephropathy", "Lupus Class V", "Congenital NS (neonates)"],
    redFlags: ["Oliguria/anuria → AKI", "Serum albumin <1.5 g/dL", "Respiratory distress (pleural effusion/pulmonary oedema)", "Peritonitis (SBP risk)", "Hypertensive emergency", "Rapidly rising creatinine"],
    investigations: ["Urine PCR (or 24h protein)", "Serum albumin, cholesterol, triglycerides", "eGFR + creatinine", "ANA, dsDNA, complement C3/C4 (all children)", "Hepatitis B/C serology", "Genetic panel if <1y or steroid-resistant"],
    biopsyIndications: ["Age <1y or >12y (1st episode)", "Haematuria + proteinuria", "Low complement", "Steroid resistance (no response 4–6 weeks)", "Family history CKD", "Hypertension at onset"],
    escalationTriggers: ["No remission after 4–6 weeks steroids → SRNS pathway", "Frequent relapses (≥2 in 6 months) → steroid-sparing agent", "Albumin <2.0 g/dL + clinical oedema → albumin infusion ± furosemide", "eGFR drop >25% → urgent nephrology"],
    dialysisTriggers: ["Severe AKI (oliguria >24h, rising creatinine)", "Refractory fluid overload unresponsive to IV diuretics", "Hyperkalemia >6.5 mEq/L despite management"],
    emergencyWarnings: ["Hypovolaemic shock from over-diuresis in severe hypoalbuminaemia", "SBP in child on long-term steroids — fever + abdominal pain → urgent ascitic tap", "Deep vein thrombosis/PE (hypercoagulable state)"],
    linkedPathways: ["mcd", "fsgs", "membranous", "congenital_nephrotic", "lupus"],
    refs: ["KDIGO 2021 GD", "IPNA NS Guideline 2019", "ISKDC Protocol"],
    evidence_grade: "Strong",
  },
  {
    id: "hematuria",
    name: "Hematuria (Gross/Microscopic)",
    icon: "🔴",
    urgency: "medium",
    differentials: ["IgA Nephropathy", "Thin GBM / Alport Syndrome", "PSGN", "IgA Vasculitis (HSP)", "Bladder/UTI", "Stones", "Wilms tumour (child)", "Nutcracker syndrome"],
    redFlags: ["Haematuria + proteinuria → GN until proven otherwise", "Rapidly falling eGFR + haematuria → RPGN emergency", "Haematuria + hypertension + AKI → urgent biopsy", "Frank haematuria with clots → urological emergency"],
    investigations: ["Urine microscopy (RBC casts = glomerular)", "Urine PCR + dipstick", "Serum creatinine, eGFR", "C3/C4, ANA, ANCA, anti-GBM antibody", "ASOT, anti-DNAse B (post-strep screen)", "Genetic: COL4A3/4/5 if family history", "Renal USS ± Doppler"],
    biopsyIndications: ["Haematuria + proteinuria (PCR >0.5)", "Persistent haematuria >6 months", "Haematuria + impaired GFR", "Family history of haematuria + CKD/ESKD", "RBC casts on microscopy"],
    escalationTriggers: ["C3 low → PSGN, C3GN, MPGN, SLE workup", "Persistent low C3 >8 weeks → biopsy (not PSGN)", "Rising creatinine + haematuria → RPGN protocol"],
    dialysisTriggers: ["Acute volume overload with rapidly progressive GN", "Hyperkalaemia + oliguria"],
    emergencyWarnings: ["RPGN: do NOT delay — daily creatinine rise + haematuria → immediate workup + treatment"],
    linkedPathways: ["psgn", "igan", "thin_gbm", "alport", "c3gn"],
    refs: ["KDIGO 2021", "IPNA Clinical Guidelines"],
    evidence_grade: "Strong",
  },
  {
    id: "proteinuria",
    name: "Proteinuria Evaluation",
    icon: "🔬",
    urgency: "medium",
    differentials: ["Glomerular (>2+ protein in urine microscopy)", "Tubular (proximal tubulopathy, Fanconi)", "Overflow (myeloma light chains)", "Orthostatic proteinuria (benign — children)"],
    redFlags: ["PCR >3.5 (nephrotic range)", "Proteinuria + haematuria (→ GN workup urgent)", "Proteinuria + falling eGFR → biopsy urgently", "New proteinuria in known diabetic → DKD progression"],
    investigations: ["First morning urine PCR (exclude orthostatic)", "Urine microscopy", "Serum albumin, creatinine, eGFR", "ANA, C3, C4, anti-dsDNA", "HBA1c + glucose (DKD)", "SPEP/UPEP if age >40 or monoclonal protein suspected"],
    biopsyIndications: ["PCR >1.0 persistent >3 months", "Nephrotic-range proteinuria (PCR >3.5)", "Proteinuria + haematuria", "Falling eGFR + proteinuria"],
    escalationTriggers: ["Persistent PCR >1.0 on ACEi → biopsy + consider specific therapy", "Rapidly rising PCR → urgent nephrology", "Albumin <3 g/dL → nephrotic management"],
    dialysisTriggers: ["Not a direct trigger; monitor eGFR trajectory"],
    emergencyWarnings: ["Heavy proteinuria + albumin <1.5 → thrombosis risk — consider anticoagulation", "Proteinuria + hypertensive crisis → emergency management"],
    linkedPathways: ["mcd", "fsgs", "membranous", "diabetic_nephropathy", "alport"],
    refs: ["KDIGO 2021 GD", "KDIGO 2024 Alport"],
    evidence_grade: "Strong",
  },
  {
    id: "aki",
    name: "AKI in GN Context",
    icon: "⚡",
    urgency: "critical",
    differentials: ["Pre-renal AKI (volume depletion — common in NS)", "Rapidly Progressive GN (RPGN)", "TMA / HUS", "AKI on CKD (new insult)", "Drug-induced (CNI, NSAIDs)", "Obstruction (posterior urethral valves)"],
    redFlags: ["Oliguria/anuria >6h", "Creatinine doubling in <24h", "Hyperkalaemia + metabolic acidosis", "Pulmonary oedema", "Haematuria + rapidly rising creatinine → RPGN"],
    investigations: ["Urinalysis + microscopy (RBC casts = GN, muddy brown casts = ATN)", "Serial creatinine q6–12h in acute phase", "K+, bicarbonate, phosphate, calcium", "ANCA, anti-GBM if GN suspected", "Renal USS urgently"],
    biopsyIndications: ["Unexplained AKI + proteinuria/haematuria", "AKI not recovering as expected", "RPGN: immediate biopsy + treatment"],
    escalationTriggers: ["No improvement in 48h despite volume optimisation → nephrology consult", "ANCA/anti-GBM positive → start treatment without waiting for biopsy report", "Creatinine >300 μmol/L rising → consider dialysis planning"],
    dialysisTriggers: ["Oliguria with creatinine >500 μmol/L", "Hyperkalaemia K+ >6.5 resistant", "Severe metabolic acidosis pH <7.1", "Fluid overload unresponsive to diuretics", "Uraemic encephalopathy/pericarditis"],
    emergencyWarnings: ["RPGN: delay = irreversible loss of nephrons — treat empirically if ANCA positive", "Anti-GBM: start plasma exchange + CYC same day — do NOT wait for biopsy"],
    linkedPathways: ["anca", "antigbm", "aahu", "lupus"],
    refs: ["KDIGO AKI 2012", "KDIGO 2021 GD"],
    evidence_grade: "Strong",
  },
  {
    id: "rpgn",
    name: "RPGN (Rapidly Progressive GN)",
    icon: "🚨",
    urgency: "critical",
    differentials: ["ANCA-associated (GPA/MPA) — most common", "Anti-GBM (Goodpasture)", "Immune complex (lupus, IgA, post-infectious)", "Double-positive ANCA + anti-GBM"],
    redFlags: ["Creatinine doubling in days to weeks", "Haematuria + proteinuria + rising creatinine = RPGN until proven otherwise", "Haemoptysis (pulmonary-renal syndrome — Goodpasture or ANCA)", "Oliguria"],
    investigations: ["ANCA (PR3 + MPO — ELISA + IIF)", "Anti-GBM antibody", "ANA, C3/C4, anti-dsDNA", "Urgent renal biopsy (within 24h if possible)", "CXR + HRCT chest (haemorrhage)"],
    biopsyIndications: ["RPGN: urgent biopsy MANDATORY — crescentic GN guides ALL treatment"],
    escalationTriggers: ["ANCA or anti-GBM positive → start treatment before biopsy results", "Pulmonary haemorrhage → ICU + plasma exchange", "Creatinine >500 μmol/L → add plasma exchange"],
    dialysisTriggers: ["Creatinine >600 μmol/L or oliguria at presentation — dialysis likely needed", "Initiate even if starting immunosuppression — recovery possible"],
    emergencyWarnings: ["Plasma exchange for anti-GBM: start same day (4L daily × 14 days)", "Rituximab or pulse CYC: do not delay pending biopsy — treat empirically", "Pulmonary haemorrhage: ICU ventilation may be required"],
    linkedPathways: ["anca", "antigbm", "lupus", "c3gn"],
    refs: ["KDIGO 2021 GD", "ACR/EULAR AAV 2022"],
    evidence_grade: "Strong",
  },
  {
    id: "edema",
    name: "Nephrotic Oedema Management",
    icon: "💦",
    urgency: "high",
    differentials: ["Primary NS oedema (albumin + Na retention)", "Cardiac oedema (check echo)", "Hepatic oedema (LFT)", "Lymphoedema (painless non-pitting, lower limbs)"],
    redFlags: ["Scrotal/labial oedema + dyspnoea → pleural effusion (urgent)", "Ascites + abdominal pain → SBP", "Pitting oedema + warm legs → exclude DVT", "Severe periorbital oedema → albumin <1.0 g/dL"],
    investigations: ["Serum albumin, Na, creatinine", "BNP if cardiac cause suspected", "Echo if refractory oedema", "Urine PCR — confirm NS"],
    biopsyIndications: ["Based on underlying GN — not oedema alone"],
    escalationTriggers: ["No response to oral furosemide → IV furosemide 1 mg/kg/dose", "IV furosemide ineffective → add metolazone or combine thiazide", "Albumin <2.0 → 20% albumin 1 g/kg + furosemide 1 mg/kg IV"],
    dialysisTriggers: ["Refractory fluid overload + AKI → ultrafiltration"],
    emergencyWarnings: ["Hypovolaemia from over-diuresis: check BP, urine output, albumin before escalating diuretics", "Pulmonary oedema in hypoalbuminaemia: careful with fluids — albumin helps mobilise"],
    linkedPathways: ["mcd", "fsgs", "membranous"],
    refs: ["KDIGO 2021", "IPNA NS 2019"],
    evidence_grade: "Moderate",
  },
  {
    id: "hypertension",
    name: "Hypertension in GN",
    icon: "❤️",
    urgency: "high",
    differentials: ["Glomerulonephritis (most causes → HTN)", "Renovascular (renal artery stenosis)", "Primary HTN on background of GN", "Steroid-induced HTN", "CNI-induced HTN (tacrolimus/cyclosporin)"],
    redFlags: ["Hypertensive encephalopathy (BP >170/110 + altered consciousness)", "Hypertensive emergency with proteinuria → eclampsia-like presentation", "BP >170/110 + retinal changes → hypertensive urgency", "Severe headache + visual disturbance"],
    investigations: ["BP both arms, 4 limbs (coarctation)", "Urine PCR + dipstick", "Fundoscopy", "ECG (LVH)", "Echo if BP severe", "Renal USS + Doppler (RAS)"],
    biopsyIndications: ["Based on underlying GN cause — not HTN alone"],
    escalationTriggers: ["BP >99th%ile + proteinuria → ACEi/ARB first-line", "Steroid-induced HTN → amlodipine (not RAAS)", "CNI HTN → amlodipine ± dose reduction"],
    dialysisTriggers: ["Hypertensive emergency + AKI + volume overload → emergent dialysis"],
    emergencyWarnings: ["IV labetalol 1–3 mg/kg/h OR IV nicardipine for hypertensive emergency", "Avoid ACEi/ARB in bilateral RAS", "RPGN + severe HTN → treat both simultaneously"],
    linkedPathways: ["anca", "lupus", "psgn", "diabetic_nephropathy"],
    refs: ["AAP BP Guidelines 2017", "KDIGO CKD-MBD 2017"],
    evidence_grade: "Strong",
  },
  {
    id: "ckd_progression",
    name: "CKD Progression in GN",
    icon: "📉",
    urgency: "medium",
    differentials: ["Progressive GN (IgAN, FSGS, C3GN)", "AKI-on-CKD episodes", "DKD", "Alport syndrome", "Renovascular disease"],
    redFlags: ["eGFR decline >5 mL/min/year → accelerated progression", "PCR >1.0 persistent → high risk of ESKD", "Anaemia + CKD → ESA workup", "CKD-MBD: Ca/PO4 imbalance → phosphate binder"],
    investigations: ["Serial eGFR (monthly if declining rapidly)", "Urine PCR monthly", "CBC (anaemia)", "Bone profile: Ca, PO4, PTH, Vitamin D", "Iron studies (before ESA)", "eGFR slope calculation"],
    biopsyIndications: ["Unexplained rapid decline (>5 mL/min/year)", "New proteinuria on existing CKD (new GN superimposed)"],
    escalationTriggers: ["eGFR <30 → nephrology for RRT planning", "eGFR <20 → AV fistula referral/PD catheter", "Anaemia Hb <10 → ESA + iron", "PTH >300 → phosphate binder + Vitamin D analog"],
    dialysisTriggers: ["eGFR <10–15 + uraemic symptoms", "eGFR <10 regardless of symptoms", "Hyperkalaemia, acidosis, fluid overload not medically managed"],
    emergencyWarnings: ["Contrast nephropathy: avoid iodinated contrast if eGFR <30 without adequate hydration", "Nephrotoxic drugs: NSAIDs, aminoglycosides — absolute avoid in CKD 3b+"],
    linkedPathways: ["alport", "diabetic_nephropathy", "igan", "c3gn"],
    refs: ["KDIGO CKD 2024", "KDIGO 2022 DM-CKD"],
    evidence_grade: "Strong",
  },
  {
    id: "electrolytes",
    name: "Electrolyte Disturbances in GN",
    icon: "⚗️",
    urgency: "high",
    differentials: {
      hyponatraemia: ["SIADH (nephrotic)", "Oedema-associated dilutional hyponatraemia", "Iatrogenic (over-diuresis)"],
      hyperkalemia: ["GN with impaired eGFR", "ACEi/ARB-induced", "Acidosis (K+ shift)", "Adrenal insufficiency (steroid withdrawal)"],
      acidosis: ["RTA (tubular — Fanconi)", "Uraemic acidosis (low GFR)", "Diarrhoea losses"],
    },
    redFlags: ["K+ >6.5 mEq/L → ECG + emergency management", "pH <7.2 → IV bicarbonate or dialysis", "Na <125 mEq/L + symptoms → hypertonic saline"],
    investigations: ["Na, K+, bicarbonate, chloride", "Blood gas (venous acceptable)", "Urine Na (SIADH vs hypovolaemia)", "Urine K (FEK — renal vs GI K loss)", "TTKG for renal K handling"],
    biopsyIndications: ["Tubular proteinuria + electrolyte disorder → Fanconi → consider tubular disease biopsy"],
    escalationTriggers: ["K+ >6.0 → IV calcium gluconate + salbutamol nebs + kayexalate or patiromer", "Bicarbonate <15 mEq/L → oral sodium bicarbonate 1–2 mEq/kg/day", "Na <130 → fluid restrict + cause-specific management"],
    dialysisTriggers: ["K+ >6.5 unresponsive to medical management", "Severe acidosis pH <7.1 with AKI"],
    emergencyWarnings: ["Hyperkalemia on ECG (peaked T, wide QRS, sine wave) → calcium gluconate IV FIRST", "Rapid Na correction >12 mEq/L/24h → osmotic demyelination syndrome"],
    linkedPathways: ["aki", "ckd_progression"],
    refs: ["KDIGO AKI 2012", "KDIGO CKD 2024"],
    evidence_grade: "Strong",
  },
  {
    id: "tubulopathies",
    name: "Tubulopathies / Fanconi Syndrome",
    icon: "🧪",
    urgency: "medium",
    differentials: ["Fanconi syndrome (generalised proximal tubule dysfunction)", "RTA Type 1 (distal)", "RTA Type 2 (proximal)", "Bartter syndrome", "Gitelman syndrome", "ADTKD (UMOD/REN mutations)"],
    redFlags: ["Rickets + polyuria in child → Fanconi first", "Renal stones + acidosis + K loss → dRTA", "Severe hypokalemia + alkalosis → Bartter/Gitelman", "Aminoaciduria + glycosuria + phosphaturia → complete Fanconi"],
    investigations: ["Urine glucose (glycosuria with normal blood glucose)", "Urine amino acids (aminoaciduria)", "Urine phosphate + TRP (TmP/GFR <0.65 → tubular phosphate leak)", "Urine β2 microglobulin (tubular proteinuria)", "Serum K, PO4, bicarbonate, calcium"],
    biopsyIndications: ["Secondary Fanconi (Wilson's, mitochondrial, galactosaemia) after metabolic workup", "Genetic cause not identified"],
    escalationTriggers: ["Severe hypophosphataemia (<0.8) → IV phosphate replacement", "Severe rickets → Vitamin D + phosphate supplements", "Severe hypokalemia <2.5 → IV K replacement"],
    dialysisTriggers: ["Not direct; monitor eGFR trajectory"],
    emergencyWarnings: ["Hypokalaemia + weakness + paralysis → IV K in monitored setting", "Metabolic acidosis + vomiting + dehydration → IV bicarbonate"],
    linkedPathways: [],
    refs: ["KDIGO CKD 2024", "IPNA Tubular Disorders"],
    evidence_grade: "Moderate",
  },
  {
    id: "nephritic",
    name: "Nephritic Syndrome",
    icon: "🔥",
    urgency: "high",
    differentials: ["PSGN (most common child)", "IgA Nephropathy", "MPGN", "SLE (Class III/IV)", "ANCA vasculitis", "Anti-GBM disease"],
    redFlags: ["Haematuria + HTN + oedema + oliguria (full nephritic picture) → urgent workup", "C3 low → PSGN/C3GN/SLE/MPGN", "Rising creatinine + haematuria → RPGN"], 
    investigations: ["RBC casts on microscopy (pathognomonic for GN)", "C3, C4, CH50, AH50", "ANCA, anti-GBM, ANA, anti-dsDNA", "ASOT/anti-DNAse B (PSGN screen)", "Renal function + urine PCR"],
    biopsyIndications: ["All nephritic syndrome except classical PSGN", "Any nephritic + falling GFR"],
    escalationTriggers: ["C3 persistently low >8 weeks → biopsy (not PSGN)", "Creatinine rising → RPGN workup", "ANCA/anti-GBM positive → empirical treatment"],
    dialysisTriggers: ["As per RPGN/AKI criteria above"],
    emergencyWarnings: ["Nephritic + pulmonary symptoms → pulmonary-renal syndrome (Goodpasture/ANCA)", "HTN emergency in nephritic syndrome → IV antihypertensives"],
    linkedPathways: ["psgn", "anca", "antigbm", "lupus", "mpgn"],
    refs: ["KDIGO 2021 GD"],
    evidence_grade: "Strong",
  },
  {
    id: "tma",
    name: "TMA / HUS Approach",
    icon: "🩸",
    urgency: "critical",
    differentials: ["STEC-HUS (typical D+ — most common in children)", "aHUS (complement-mediated)", "TTP (ADAMTS13 deficiency)", "Secondary TMA (SLE, malignancy, medications, pregnancy)"],
    redFlags: ["Triad: MAHA + thrombocytopenia + AKI = TMA → emergency workup", "Haemolysis + falling Hb + fragmented cells (schistocytes)", "Oliguria + bloody diarrhoea in child → STEC-HUS", "ADAMTS13 <10% → TTP → urgent PLEX"],
    investigations: ["Blood film for schistocytes (MANDATORY)", "LDH, haptoglobin, direct Coombs (negative = mechanical haemolysis)", "ADAMTS13 activity (TTP if <10%)", "Stool STEC culture + Shiga toxin PCR", "Complement panel: C3, C4, CFH, CFI, anti-CFH Ab"],
    biopsyIndications: ["After acute phase stabilised — guides duration of eculizumab", "Genetic panel drives decision more than biopsy in aHUS"],
    escalationTriggers: ["ADAMTS13 <10% → TTP: urgent daily PLEX + steroids + rituximab", "STEC-HUS not resolving → aHUS or complication", "aHUS: eculizumab IMMEDIATELY — genetic testing after"],
    dialysisTriggers: ["AKI in HUS/TMA: dialysis early if oliguria + K+ or fluid overload", "Most aHUS: dialysis at presentation but renal recovery possible with eculizumab"],
    emergencyWarnings: ["STEC-HUS: NO antibiotics, NO antiplatelets, NO antidiarrhoeals — worsen prognosis", "TTP: mortality >90% untreated — same day PLEX", "aHUS without eculizumab: 33% die in first episode"],
    linkedPathways: ["aahu"],
    refs: ["KDIGO 2021 GD", "International aHUS Registry"],
    evidence_grade: "Strong",
  },
];

const URGENCY_COLORS = {
  critical: "border-red-300 bg-red-50",
  high: "border-amber-300 bg-amber-50",
  medium: "border-blue-200 bg-blue-50",
};

const BADGE_COLORS = {
  critical: "bg-red-100 text-red-800 border-red-300",
  high: "bg-amber-100 text-amber-800 border-amber-300",
  medium: "bg-blue-100 text-blue-800 border-blue-300",
};

function ApproachCard({ appr }) {
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState("differentials");

  const sections = [
    { id: "differentials", label: "🔍 Differentials" },
    { id: "redflags", label: "🚨 Red Flags" },
    { id: "investigations", label: "🔬 Investigations" },
    { id: "biopsy", label: "🧫 Biopsy" },
    { id: "escalation", label: "⬆️ Escalation" },
    { id: "dialysis", label: "💧 Dialysis" },
    { id: "emergency", label: "⚠️ Emergency" },
  ];

  const content = {
    differentials: Array.isArray(appr.differentials) ? appr.differentials :
      Object.entries(appr.differentials).flatMap(([k, v]) => [`${k.toUpperCase()}:`, ...v]),
    redflags: appr.redFlags,
    investigations: appr.investigations,
    biopsy: appr.biopsyIndications,
    escalation: appr.escalationTriggers,
    dialysis: appr.dialysisTriggers,
    emergency: appr.emergencyWarnings,
  };

  const sectionColors = {
    differentials: "bg-blue-50 border-blue-200 text-blue-900",
    redflags: "bg-red-50 border-red-200 text-red-900",
    investigations: "bg-indigo-50 border-indigo-200 text-indigo-900",
    biopsy: "bg-purple-50 border-purple-200 text-purple-900",
    escalation: "bg-amber-50 border-amber-200 text-amber-900",
    dialysis: "bg-cyan-50 border-cyan-200 text-cyan-900",
    emergency: "bg-rose-50 border-rose-200 text-rose-900",
  };

  return (
    <Card className={`border-2 ${URGENCY_COLORS[appr.urgency] || "border-slate-200 bg-white"}`}>
      <CardHeader className="pb-2 cursor-pointer" onClick={() => setOpen(o => !o)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{appr.icon}</span>
            <div>
              <span className="font-bold text-sm text-slate-900">{appr.name}</span>
              <div className="flex gap-1.5 mt-0.5 flex-wrap">
                <Badge className={`text-xs border ${BADGE_COLORS[appr.urgency]}`}>
                  {appr.urgency === "critical" ? "🔴 Critical" : appr.urgency === "high" ? "🟠 High" : "🔵 Standard"}
                </Badge>
                <Badge className="bg-slate-100 text-slate-600 text-xs">{appr.evidence_grade}</Badge>
              </div>
            </div>
          </div>
          {open ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
        </div>
      </CardHeader>

      {open && (
        <CardContent className="pt-0 space-y-3">
          {/* Section tabs */}
          <div className="flex gap-1 flex-wrap border-b pb-2">
            {sections.map(s => (
              <button key={s.id} onClick={() => setSection(s.id)}
                className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors ${section === s.id ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                {s.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className={`rounded-lg p-2 border ${sectionColors[section]} space-y-1.5`}>
            {(content[section] || []).map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <span className="font-bold flex-shrink-0 opacity-60">{i + 1}.</span>
                <span>{item}</span>
              </div>
            ))}
          </div>

          {/* Linked pathways */}
          {appr.linkedPathways?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              <span className="text-xs text-slate-500 font-semibold">🔗 Linked:</span>
              {appr.linkedPathways.map(p => (
                <Badge key={p} variant="outline" className="text-xs cursor-pointer hover:bg-blue-50">
                  {p.toUpperCase()}
                </Badge>
              ))}
            </div>
          )}

          <p className="text-xs text-slate-400">📚 {appr.refs?.join(" · ")}</p>
        </CardContent>
      )}
    </Card>
  );
}

export default function GNApproaches() {
  const [filter, setFilter] = useState("All");
  const urgencyFilters = ["All", "critical", "high", "medium"];

  const filtered = filter === "All" ? GN_APPROACHES : GN_APPROACHES.filter(a => a.urgency === filter);

  return (
    <div className="space-y-3">
      <Alert className="bg-indigo-50 border-indigo-200">
        <GitBranch className="w-4 h-4 text-indigo-600" />
        <AlertDescription className="text-xs text-indigo-900">
          <strong>Clinical Approaches:</strong> {GN_APPROACHES.length} structured algorithms — differentials, red flags, investigations, biopsy indications, escalation triggers, dialysis triggers, emergency warnings.
        </AlertDescription>
      </Alert>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {urgencyFilters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-full border font-semibold transition-all capitalize ${filter === f ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"}`}>
            {f === "All" ? "All Approaches" : f === "critical" ? "🔴 Critical" : f === "high" ? "🟠 High Priority" : "🔵 Standard"}
          </button>
        ))}
        <span className="text-xs text-slate-400 self-center">{filtered.length} approaches</span>
      </div>

      {filtered.map(a => <ApproachCard key={a.id} appr={a} />)}
    </div>
  );
}