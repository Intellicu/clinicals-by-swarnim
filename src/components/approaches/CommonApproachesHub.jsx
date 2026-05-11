import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, AlertTriangle, ChevronRight, ChevronDown, ArrowLeft,
  Activity, Heart, Droplet, Brain, Stethoscope, FlaskConical,
  TestTube, Zap, BookOpen, CheckCircle, Microscope, Shield
} from "lucide-react";

const APPROACHES = [
  {
    id: "fever-rash", title: "Fever + Rash", icon: Zap, color: "bg-red-600",
    badge: "Emergency", urgency: "high",
    subspecialties: {
      Nephrology: {
        ddx: ["IgAV (HSP) — palpable purpura + nephritis", "SLE — malar rash + nephritis", "ANCA vasculitis — purpura + RPGN", "HUS — microangiopathic hemolysis + AKI"],
        red_flags: ["Purpura + AKI → ANCA vasculitis, HUS", "Malar rash + hematuria/proteinuria → SLE nephritis", "Purpura + thrombocytopenia → consider TTP/HUS"],
        investigations: ["Urine dipstick + UPCR", "Creatinine, CBC, LFT", "C3/C4, ANA, anti-dsDNA", "ANCA (MPO/PR3)", "ADAMTS13 if TTP suspected"],
        management: ["Nephrology urgent referral if AKI or RPGN features", "IV steroids if vasculitis + renal involvement", "PLEX if ANCA vasculitis or TTP"]
      },
      Rheumatology: {
        ddx: ["JIA systemic (Still's) — quotidian rash + fever", "SLE — photosensitive rash + fever", "Kawasaki disease — polymorphic rash + mucocutaneous features", "MAS — hemorrhagic rash in sJIA"],
        red_flags: ["Rash + macrophage activation features (ferritin >10,000) → MAS emergency", "Kawasaki + coronary artery features → urgent cardiology", "SLE + serositis/CNS → active systemic disease"],
        investigations: ["ANA, anti-dsDNA, complement levels", "Ferritin (very high in sJIA/MAS)", "Echo for Kawasaki", "Skin biopsy if vasculitic rash"],
        management: ["sJIA: NSAIDs → IL-1/IL-6 inhibitors", "SLE: hydroxychloroquine + steroids", "Kawasaki: IVIG 2g/kg + aspirin"]
      },
      "Critical Care": {
        ddx: ["Septicemia with rash (meningococcal, staphylococcal)", "Toxic shock syndrome (TSS)", "Stevens-Johnson / TEN (drug reaction)", "Viral exanthem with sepsis picture"],
        red_flags: ["Non-blanching purpura + fever + hypotension → Meningococcal sepsis", "Mucosal involvement → SJS/TEN", "Fever + rash + organ failure → toxic shock"],
        investigations: ["Blood culture immediately", "CBC, CRP, Procalcitonin, Lactate", "Coagulation: PT/APTT/D-dimer (DIC)", "Blood smear for parasites"],
        management: ["Broad-spectrum antibiotics immediately (meningococcal: Ceftriaxone IV)", "IV fluids + vasopressors if shock", "Dermatology + ID consult for SJS/TEN"]
      }
    },
    pearls: ["Non-blanching purpura = meningococcal until proven otherwise", "IgAV purpura is palpable and gravity-dependent (legs/buttocks)", "MAS ferritin >10,000 is a key diagnostic trigger"],
    calculators: ["SLEDAI-2K", "MAS criteria (Ravelli)"],
    linked_drugs: ["Ceftriaxone IV", "Methylprednisolone", "IVIG"]
  },
  {
    id: "hematuria", title: "Hematuria", icon: Droplet, color: "bg-rose-600",
    badge: "Nephrology", urgency: "medium",
    subspecialties: {
      Nephrology: {
        ddx: ["Glomerular: IgAN, PSGN, Alport, thin BMD, Lupus, MPGN", "Non-glomerular: UTI, hypercalciuria, stones, trauma", "Vascular: nutcracker, renal vein thrombosis"],
        red_flags: ["Gross hematuria + hypertension + edema → nephritic syndrome", "Cola-colored urine 1-3d post-URTI → IgAN", "Hematuria + hearing loss → Alport syndrome", "Hematuria + thrombocytopenia → HUS"],
        investigations: ["Urine microscopy: dysmorphic RBCs (>5% = glomerular)", "Spot UPCR (protein:creatinine)", "C3/C4 (low = PSGN, Lupus, MPGN)", "Urine Ca:Cr ratio (hypercalciuria)", "ANA, ANCA if systemic features"],
        management: ["Isolated microhematuria + normal workup → 6-12 monthly review", "Hypercalciuria: hydration, thiazide if persistent", "Symptomatic IgAN: ACE-i", "GN: biopsy + specific immunosuppression"]
      },
      Rheumatology: {
        ddx: ["Lupus nephritis (Class III/IV) — hematuria + proteinuria", "ANCA vasculitis — crescentic GN", "IgAV nephritis — palpable purpura history", "Polyarteritis nodosa — rarer"],
        red_flags: ["ANA positive + hematuria → check anti-dsDNA, C3/C4 immediately", "ANCA + rapidly deteriorating GFR → RPGN, urgent biopsy"],
        investigations: ["ANA, anti-dsDNA, ANCA, anti-GBM", "Complement C3/C4", "Renal biopsy if indicated"],
        management: ["SLE nephritis: hydroxychloroquine + mycophenolate/cyclophosphamide", "ANCA: cyclophosphamide/rituximab + steroids"]
      }
    },
    pearls: ["Dysmorphic RBCs confirm glomerular origin", "Low C3 → PSGN, MPGN, Lupus; Normal C3 → IgAN, Alport, thin BMD", "Hypercalciuria: urine Ca:Cr >0.21 mg/mg"],
    calculators: ["AKI Stager", "CKD Stager"],
    linked_drugs: ["ACE inhibitor", "Prednisolone", "Cyclophosphamide"]
  },
  {
    id: "edema", title: "Edema", icon: Activity, color: "bg-blue-600",
    badge: "Nephrology", urgency: "medium",
    subspecialties: {
      Nephrology: {
        ddx: ["Nephrotic syndrome (heavy proteinuria, hypoalbuminemia)", "AKI/CKD with fluid overload", "Hypoproteinemia — protein-losing enteropathy, malnutrition", "Obstructive uropathy with anasarca"],
        red_flags: ["Scrotal/labial edema + anasarca → severe NS, risk of infection/thrombosis", "Edema + oliguria + severe HTN → AKI or acute severe NS", "Periorbital edema mistaken for allergy → child with NS frequently missed"],
        investigations: ["Urine dipstick: 3-4+ protein confirms NS", "Spot UPCR (>2.0 = nephrotic range)", "Serum albumin (<25 g/L = hypoalbuminemia)", "Serum cholesterol (elevated = NS)", "C3/C4, ANA (if age >6y or atypical)"],
        management: ["Idiopathic NS: Prednisolone 60mg/m²/day (ISKDC protocol)", "Salt restriction + diuretics (careful in hypoalbuminemia)", "Albumin infusion: only for severe hypovolemia with diuretic use", "Anticoagulation prophylaxis for severe NS"]
      },
      "Critical Care": {
        ddx: ["Cardiac failure (congestive) — dependent edema, hepatomegaly", "ARDS with anasarca in ICU", "Capillary leak syndrome", "Burns — third-space losses"],
        red_flags: ["Edema + respiratory distress → pulmonary edema, urgent diuresis/ventilation", "Edema + hypotension → distributive shock vs cardiogenic"],
        investigations: ["CXR (cardiac size, pulmonary edema)", "Echo (LV function, effusion)", "BNP / NT-proBNP", "Urine Na, FENa"],
        management: ["Cardiac: diuretics + afterload reduction + treat underlying cause", "Hypoalbuminemia: albumin infusion + diuretics", "Fluid restriction in anuric state"]
      }
    },
    pearls: ["First morning periorbital puffiness = classic NS presentation in children", "Albumin infusion without diuretics just expands intravascular then redistributes", "Thrombosis risk in NS: immobilization, infection, IV procedures are triggers"],
    calculators: ["Fluid Calculator"],
    linked_drugs: ["Prednisolone", "Furosemide", "Albumin 20%"]
  },
  {
    id: "hypertension", title: "Hypertension", icon: Heart, color: "bg-red-600",
    badge: "Emergency Possible", urgency: "medium",
    subspecialties: {
      Nephrology: {
        ddx: ["Renal parenchymal: GN, PKD, reflux nephropathy (most common)", "Renovascular: renal artery stenosis, FMD", "CKD-related hypertension", "Post-transplant HTN"],
        red_flags: ["BP >99th+5mmHg → hypertensive emergency", "HTN + seizures → PRES", "HTN + hematuria + edema → acute GN", "HTN in neonate → renal artery thrombosis"],
        investigations: ["Urine: dipstick, UPCR, culture", "Creatinine, electrolytes, CBC", "USG KUB with Doppler", "Renin:aldosterone (if hypokalemia or refractory)", "ABPM for white-coat confirmation"],
        management: ["Stage 1: lifestyle + treat cause", "Stage 2 or symptomatic: ACE-i (CKD/proteinuric) or CCB (non-proteinuric)", "Emergency: IV labetalol/nicardipine, reduce by 25% first hour", "CKD: target BP <50th%ile; proteinuria <75th%ile"]
      },
      Rheumatology: {
        ddx: ["Systemic vasculitis (Takayasu) — upper limb BP discrepancy", "Antiphospholipid syndrome — renovascular involvement", "Lupus nephritis — secondary HTN"],
        red_flags: ["BP discrepancy between arms → Takayasu arteritis", "SLE + uncontrolled HTN → active renal involvement"],
        investigations: ["Arm BP bilateral", "MR Angiogram if Takayasu suspected", "APLA panel (APS)"],
        management: ["Takayasu: steroids + immunosuppression + vascular surgery if needed"]
      }
    },
    pearls: ["Cuff size error is #1 cause of inaccurate BP reading in children", "Renal parenchymal disease = #1 secondary cause of HTN in children", "Always check both arms — coarctation causes right > left discrepancy"],
    calculators: ["BP Percentiles Calculator", "CKD Stager"],
    linked_drugs: ["Enalapril", "Amlodipine", "Labetalol IV", "Nicardipine IV"]
  },
  {
    id: "arthritis", title: "Arthritis", icon: Shield, color: "bg-purple-600",
    badge: "Rheumatology", urgency: "medium",
    subspecialties: {
      Rheumatology: {
        ddx: ["JIA (oligoarticular, polyarticular, systemic)", "Reactive arthritis (post-strep, enteric)", "SLE arthritis", "Psoriatic arthritis", "Septic arthritis (emergency)"],
        red_flags: ["Hot, extremely tender single joint with fever → septic arthritis (emergency)", "Arthritis + rash + fever → sJIA, reactive, SLE", "Arthritis + uveitis → JIA (eye exam mandatory)", "Arthritis + back pain in older teen → spondyloarthropathy"],
        investigations: ["CBC, ESR, CRP (inflammatory markers)", "ANA (screening for sJIA, SLE)", "RF, anti-CCP (polyarticular JIA)", "ASO titer (post-streptococcal)", "Joint fluid: cell count, culture, crystals", "X-ray joints (baseline)", "Slit-lamp exam (uveitis screening)"],
        management: ["NSAIDs: first-line for all JIA subtypes", "Intra-articular steroids: oligoarticular JIA", "MTX: polyarticular JIA first-line DMARD", "Biologics: anti-TNF (etanercept), IL-6 (tocilizumab) for refractory", "Septic arthritis: emergency joint wash + IV antibiotics"]
      },
      Nephrology: {
        ddx: ["Lupus nephritis with arthritis (dual presentation)", "IgAV — arthritis + purpura + nephritis", "HUS — arthralgia can occur"],
        red_flags: ["Arthritis + hematuria/proteinuria → SLE nephritis likely", "Arthritis + palpable purpura + edema → IgAV nephritis"],
        investigations: ["Urine dipstick + UPCR", "ANA, anti-dsDNA, C3/C4"],
        management: ["SLE: hydroxychloroquine as backbone", "IgAV with nephritis: nephrology co-management"]
      }
    },
    pearls: ["Fever + arthritis + rash = sJIA until proven — check ferritin", "Uveitis is silent — all JIA patients need slit-lamp q3-6 months", "JADAS-27 score quantifies disease activity for JIA"],
    calculators: ["JADAS-27", "SLEDAI-2K"],
    linked_drugs: ["Naproxen", "Methotrexate", "Etanercept", "Tocilizumab"]
  },
  {
    id: "rpgn", title: "RPGN", icon: AlertTriangle, color: "bg-red-700",
    badge: "Emergency", urgency: "critical",
    subspecialties: {
      Nephrology: {
        ddx: ["Immune complex: SLE, IgAN, PSGN, IgAV", "Pauci-immune: ANCA vasculitis (MPA, GPA)", "Anti-GBM: Goodpasture syndrome", "Mixed/other: TMA, thrombotic microangiopathy"],
        red_flags: ["GFR declining >50% in <3 months → RPGN until proven", "Hematuria + proteinuria + rapidly rising creatinine → urgent biopsy", "Pulmonary hemorrhage + hematuria → Goodpasture/ANCA emergency"],
        investigations: ["Urgent ANCA (MPO/PR3), anti-GBM antibody", "ANA, anti-dsDNA, C3/C4, APLA", "ASO (post-strep)", "Renal biopsy: crescents >50% = RPGN confirmed", "Urine RBC casts (GN pattern)", "CXR (pulmonary hemorrhage)"],
        management: ["IV methylprednisolone pulse 500-1000mg/day × 3", "Plasmapheresis: anti-GBM disease or ANCA with pulmonary hemorrhage", "Cyclophosphamide IV: ANCA or SLE Class IV", "Rituximab: as alternative to cyclophosphamide in ANCA", "Dialysis if ESRD at presentation — recovery still possible"]
      },
      Rheumatology: {
        ddx: ["SLE Class III/IV + crescentic features", "ANCA vasculitis with renal and pulmonary involvement"],
        red_flags: ["SLE + crescent GN + AKI → most severe form, aggressive treatment"],
        investigations: ["Anti-dsDNA, complement, ANCA, anti-GBM", "Biopsy essential for classification"],
        management: ["SLE: IV cyclophosphamide (NIH protocol) + steroids", "Rituximab: SLE refractory cases"]
      }
    },
    pearls: ["RPGN = urological emergency — hours matter", "Anti-GBM: linear IgG on IF — worst prognosis, must do PLEX immediately", "ANCA-negative pauci-immune crescentic GN exists (5-10%) — still treat aggressively"],
    calculators: ["AKI Stager", "SLEDAI-2K"],
    linked_drugs: ["Methylprednisolone IV", "Cyclophosphamide", "Rituximab"]
  },
  {
    id: "cytopenia", title: "Cytopenia + Inflammation", icon: Microscope, color: "bg-rose-700",
    badge: "Rheumatology+Critical", urgency: "high",
    subspecialties: {
      Rheumatology: {
        ddx: ["Macrophage Activation Syndrome (MAS) — sJIA, SLE", "SLE cytopenias (Coombs+, immune thrombocytopenia)", "Hemophagocytic lymphohistiocytosis (HLH) — primary vs secondary", "Drug-induced cytopenia (MTX, cyclophosphamide)"],
        red_flags: ["Ferritin >10,000 + fever + organomegaly → MAS/HLH", "Falling ESR despite worsening disease → cytokine storm (MAS)", "Platelet <100 + hematocrit drop in sJIA → MAS alert"],
        investigations: ["Ferritin (serial — key MAS marker)", "CBC with manual differential (hemophagocytes)", "Bone marrow biopsy if HLH suspected", "Triglycerides, fibrinogen (low in MAS/HLH)", "NK cell function, sCD25 (primary HLH workup)"],
        management: ["MAS: IV methylprednisolone pulse first line", "sJIA-MAS: Anakinra (IL-1 inhibitor) — very effective", "HLH-2004 protocol if primary HLH confirmed", "Cyclosporine in refractory MAS"]
      },
      Nephrology: {
        ddx: ["TMA — HUS, TTP (microangiopathic hemolytic anemia + thrombocytopenia)", "Lupus with hematological involvement"],
        red_flags: ["Microangiopathic hemolytic anemia + thrombocytopenia + AKI → TMA/HUS"],
        investigations: ["Peripheral smear (schistocytes)", "LDH, haptoglobin", "ADAMTS13 activity (TTP)", "Stool O157:H7 (D+HUS)", "Complement panel (aHUS)"],
        management: ["STEC-HUS: supportive, no antibiotics", "TTP: urgent PLEX", "aHUS: Eculizumab (complement inhibitor)"]
      }
    },
    pearls: ["MAS: falling ESR in active sJIA = danger sign (fibrinogen consumed)", "Ferritin >500 triggers MAS workup; >10,000 = high specificity", "sCD163 may be more specific than ferritin for MAS"],
    calculators: ["MAS 2016 Criteria"],
    linked_drugs: ["Anakinra", "Cyclosporine", "Eculizumab"]
  },
  {
    id: "electrolytes", title: "Electrolyte Disorders", icon: FlaskConical, color: "bg-teal-600",
    badge: "Emergency Possible", urgency: "high",
    subspecialties: {
      Nephrology: {
        ddx: ["Hyponatremia: SIADH, renal salt wasting, NS, CKD", "Hyperkalemia: AKI, CKD, RTA type 4, ACE-i, Addison", "Hypokalemia: Bartter, Gitelman, RTA type 1, diuretics", "Hypocalcemia: hypoparathyroidism, vitamin D deficiency, CKD"],
        red_flags: ["K+ >6.5 + ECG changes → EMERGENCY", "Na <120 with symptoms → Rapid correction risk (ODS)", "Ca <1.8 + tetany/seizures → Emergency calcium", "Rapid Na correction >8-10 mEq/24h → Osmotic demyelination"],
        investigations: ["Urine Na, K, Cl, osmolality", "Serum K, Na, Mg, Ca, phosphate, bicarbonate", "ABG, TTKG", "Aldosterone, renin (if hypokalemia)", "ECG (hyperkalemia)"],
        management: ["Hyperkalemia: calcium gluconate + insulin/glucose + salbutamol + kayexalate", "Hyponatremia: fluid restriction (SIADH) or salt replacement (salt wasting)", "Hypokalemia: oral/IV potassium + treat cause", "Bartter/Gitelman: potassium + indomethacin + magnesium (Gitelman)"]
      },
      "Critical Care": {
        ddx: ["ICU-acquired hyponatremia (excessive hypotonic fluids)", "Refeeding syndrome (hypophosphatemia)", "Post-cardiac surgery electrolyte disturbances"],
        red_flags: ["Sodium <125 in ICU patient → SIADH vs cerebral salt wasting", "Phosphate <0.5 mmol/L with refeeding → cardiac arrest risk"],
        investigations: ["Serum + urine osmolality pair", "Serial electrolytes 4-6 hourly in ICU"],
        management: ["Cerebral salt wasting vs SIADH: key distinction (volume status)", "Hypertonic saline 3% if symptomatic hyponatremia (seizures)"]
      }
    },
    pearls: ["Hyperkalemia without ECG changes is still dangerous — always get ECG first", "FENa in hyponatremia: <1% = renal sodium retention; >1% = renal salt wasting", "Bartter: hypokalemia + metabolic alkalosis + normal BP; Liddle: hypokalemia + HTN"],
    calculators: ["Sodium Correction Calculator", "Potassium Calculator", "TTKG", "FENa"],
    linked_drugs: ["Calcium gluconate", "Insulin-glucose", "KCl IV", "Indomethacin (Bartter)"]
  },
  {
    id: "recurrent-fever", title: "Recurrent Fever", icon: Zap, color: "bg-amber-600",
    badge: "Rheumatology", urgency: "medium",
    subspecialties: {
      Rheumatology: {
        ddx: ["PFAPA (periodic fever, aphthous stomatitis, pharyngitis, adenopathy)", "TRAPS (TNF receptor-associated periodic syndrome)", "FMF (familial Mediterranean fever) — recurrent serositis + fever", "MKD (mevalonate kinase deficiency)", "CAPS (cryopyrin-associated periodic syndrome)"],
        red_flags: ["Periodic fever + renal amyloidosis → FMF complication", "Fever + rash + aseptic meningitis → CAPS", "Extremely high ferritin with fever recurrence → sJIA/MAS"],
        investigations: ["Full blood count + CRP during and between attacks", "Genetic panel: MEFV, TNFRSF1A, MVK, NLRP3", "SAA (serum amyloid A) in FMF for amyloidosis screening", "Audiogram (CAPS can cause sensorineural hearing loss)"],
        management: ["PFAPA: corticosteroid burst during attack (very effective)", "FMF: colchicine daily (prevents attacks + amyloidosis)", "TRAPS: IL-1 inhibitors (anakinra/canakinumab)", "CAPS: IL-1 blockade (canakinumab)"]
      },
      Nephrology: {
        ddx: ["FMF amyloidosis — proteinuria is first sign of renal amyloid", "Recurrent pyelonephritis with structural anomaly"],
        red_flags: ["Periodic fever + new proteinuria → amyloidosis workup", "Recurrent UTI + fever → VUR or structural anomaly workup"],
        investigations: ["UPCR at each attack (FMF amyloid screening)", "Renal biopsy if proteinuria develops in periodic fever"],
        management: ["FMF amyloidosis: IL-1 inhibitors if colchicine fails"]
      }
    },
    pearls: ["PFAPA is most common — prednisone 1mg/kg aborts attack within hours", "FMF: MEFV gene positive in ~70% — negative doesn't exclude diagnosis", "Ask about ethnicity in periodic fever: FMF more common in Middle East, Turkey, Armenia"],
    calculators: ["Eurofever score (FMF classification)"],
    linked_drugs: ["Colchicine", "Canakinumab", "Anakinra"]
  },
];

const URGENCY_COLORS = {
  critical: "bg-red-100 text-red-800 border-red-300",
  high: "bg-orange-100 text-orange-800 border-orange-300",
  medium: "bg-blue-100 text-blue-800 border-blue-300",
};

const SUBSPECIALTY_COLORS = {
  Nephrology: "bg-blue-600",
  Rheumatology: "bg-purple-600",
  Immunology: "bg-rose-600",
  "Critical Care": "bg-red-700",
};

export default function CommonApproachesHub() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [activeSubspec, setActiveSubspec] = useState(null);
  const [activeSection, setActiveSection] = useState("ddx");

  const filtered = APPROACHES.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase())
  );

  const approach = selected ? APPROACHES.find(a => a.id === selected) : null;

  const SECTIONS = [
    { key: "ddx", label: "Differentials" },
    { key: "red_flags", label: "Red Flags" },
    { key: "investigations", label: "Investigations" },
    { key: "management", label: "Management" },
  ];

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <Input className="pl-9 bg-white" placeholder="Search approaches (Fever + Rash, RPGN, Arthritis…)" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {!approach ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(a => {
            const Icon = a.icon;
            return (
              <Card key={a.id} className="cursor-pointer hover:shadow-xl transition-all border-2 hover:border-cyan-400 group" onClick={() => { setSelected(a.id); setActiveSubspec(Object.keys(a.subspecialties)[0]); setActiveSection("ddx"); }}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-10 h-10 ${a.color} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{a.title}</h3>
                      <Badge className={`text-xs mt-1 border ${URGENCY_COLORS[a.urgency]}`}>{a.badge}</Badge>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {Object.keys(a.subspecialties).map(s => (
                      <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{s}</span>
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
            <ArrowLeft className="w-4 h-4" /> All Approaches
          </Button>

          <div className={`rounded-2xl ${approach.color} p-4 text-white mb-4 shadow-lg`}>
            <div className="flex items-center gap-3 mb-2">
              {React.createElement(approach.icon, { className: "w-8 h-8" })}
              <div>
                <h2 className="text-2xl font-bold">{approach.title}</h2>
                <Badge className="bg-white/20 text-white border-white/30 text-xs mt-1">{approach.badge}</Badge>
              </div>
            </div>
            {approach.pearls && (
              <div className="mt-2 space-y-1">
                {approach.pearls.map((p, i) => (
                  <p key={i} className="text-xs text-white/90">⭐ {p}</p>
                ))}
              </div>
            )}
            {(approach.calculators?.length > 0 || approach.linked_drugs?.length > 0) && (
              <div className="flex flex-wrap gap-2 mt-3">
                {approach.calculators?.map(c => <Badge key={c} className="bg-white/20 text-white text-xs">{c}</Badge>)}
                {approach.linked_drugs?.map(d => <Badge key={d} className="bg-white/20 text-white text-xs">{d}</Badge>)}
              </div>
            )}
          </div>

          {/* Subspecialty tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
            {Object.keys(approach.subspecialties).map(s => (
              <button key={s} onClick={() => setActiveSubspec(s)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all border-2 ${activeSubspec === s ? `${SUBSPECIALTY_COLORS[s] || "bg-slate-700"} text-white border-transparent shadow` : "bg-white border-slate-200 text-slate-600"}`}>
                {s}
              </button>
            ))}
          </div>

          {activeSubspec && approach.subspecialties[activeSubspec] && (
            <>
              {/* Section tabs */}
              <div className="flex gap-1 mb-4 bg-slate-100 rounded-xl p-1">
                {SECTIONS.map(s => (
                  <button key={s.key} onClick={() => setActiveSection(s.key)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeSection === s.key ? "bg-white text-slate-900 shadow" : "text-slate-500"}`}>
                    {s.label}
                  </button>
                ))}
              </div>

              <Card className="border-2">
                <CardContent className="p-4">
                  {activeSection === "red_flags" ? (
                    <div className="space-y-2">
                      {approach.subspecialties[activeSubspec].red_flags.map((f, i) => (
                        <div key={i} className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                          <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-red-800 font-medium">{f}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {approach.subspecialties[activeSubspec][activeSection]?.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700 border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                          <ChevronRight className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}
    </div>
  );
}