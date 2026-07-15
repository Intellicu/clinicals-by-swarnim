import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Search, ChevronDown, ChevronRight, AlertTriangle, CheckCircle, 
  Microscope, Activity, Heart, Droplet, Eye, Brain, 
  ArrowRight, BookOpen, Stethoscope, FlaskConical, List, Layers
} from "lucide-react";
import CommonApproachesHub from "../components/approaches/CommonApproachesHub";
import ScoringClassificationHub from "../components/scoring/ScoringClassificationHub";

const APPROACHES = [
  {
    id: "hematuria",
    title: "Hematuria",
    icon: Droplet,
    color: "bg-red-600",
    badge: "red",
    overview: "Gross or microscopic blood in urine (>5 RBC/HPF on microscopy)",
    initial_assessment: [
      "Confirm true hematuria (rule out pseudohematuria: myoglobin, hemoglobin, beetroot, rifampicin)",
      "Gross vs microscopic — onset, duration, timing (initial, terminal, total)",
      "Associated pain (colic → stones), dysuria (UTI), edema (GN), trauma",
      "Family history: Alport, polycystic, IgAN, stones",
      "Medications: NSAIDs, anticoagulants, cyclophosphamide"
    ],
    red_flags: [
      "Gross hematuria + proteinuria → glomerulonephritis",
      "Gross hematuria + hypertension + edema → PSGN, IgAN, Lupus",
      "Cola-colored urine within 1–3 days post-URTI → IgAN",
      "Frank bleeding + clots → urothelial pathology",
      "Hematuria + hearing loss → Alport syndrome",
      "Hematuria + thrombocytopenia → HUS"
    ],
    differentials: [
      "Glomerular: IgAN, PSGN, Alport, thin BMD, Lupus nephritis, MPGN",
      "Non-glomerular: UTI, urolithiasis, trauma, hypercalciuria, tumors",
      "Vascular: nutcracker syndrome, renal vein thrombosis",
      "Systemic: HSP/IgAV, SLE, HUS, Sickle cell"
    ],
    investigations: [
      "Urine: dipstick, microscopy (RBC morphology — dysmorphic → GN), culture, spot UPCR",
      "Blood: CBC, creatinine, urea, electrolytes, albumin, C3/C4, ANA, ANCA, anti-dsDNA",
      "24h urine calcium/creatinine ratio (hypercalciuria screening)",
      "Imaging: USG KUB (first line) — stones, structural anomalies",
      "Kidney biopsy if: persistent + proteinuria, declining GFR, hypertension"
    ],
    management: [
      "Isolated microscopic hematuria with normal workup → observe 6–12 monthly",
      "Hypercalciuria: hydration, dietary calcium advice, thiazides if persistent",
      "UTI: appropriate antibiotics by culture",
      "GN: nephrology referral, biopsy, immunosuppression per diagnosis",
      "Alport: ACE inhibitor early, genetic counseling"
    ],
    followup: [
      "Isolated hematuria: BP, urinalysis, UPCR every 6–12 months",
      "If proteinuria develops → re-evaluate, consider biopsy",
      "Family screening if hereditary cause suspected"
    ],
    pearls: [
      "Dysmorphic RBCs (acanthocytes >5%) indicate glomerular bleeding",
      "Cola-colored urine 1–3 days post-URTI = IgAN (vs 10–21 days in PSGN)",
      "Low C3 → PSGN, MPGN, Lupus. Normal complement → IgAN, Alport, thin BMD",
      "Hypercalciuria is commonest cause of isolated hematuria in children"
    ]
  },
  {
    id: "proteinuria",
    title: "Proteinuria",
    icon: FlaskConical,
    color: "bg-blue-600",
    badge: "blue",
    overview: "Urine protein >150mg/day or spot UPCR >0.2 (age-dependent); nephrotic range UPCR >2.0",
    initial_assessment: [
      "Quantify: dipstick grade, spot UPCR (first morning), 24h urine protein",
      "Timing: orthostatic (postural) vs fixed proteinuria",
      "Associated edema, hypertension, hematuria, systemic symptoms",
      "Age of onset, duration, family history of renal disease",
      "Medications: NSAIDs, gold, penicillamine"
    ],
    red_flags: [
      "Nephrotic range proteinuria (UPCR >2) + edema → Nephrotic syndrome",
      "Proteinuria + hematuria + hypertension → Nephritic-nephrotic syndrome",
      "Proteinuria + declining GFR → progressive glomerulonephritis",
      "Proteinuria + rash/joints/fever → SLE",
      "Protein + glucose + phosphaturia → Fanconi syndrome"
    ],
    differentials: [
      "Glomerular: MCD, FSGS, MN, IgAN, Lupus nephritis, diabetic nephropathy",
      "Tubular: Fanconi, ATN, interstitial nephritis",
      "Overflow: multiple myeloma, hemoglobinuria, myoglobinuria",
      "Orthostatic/postural (benign, young adolescents)",
      "Transient: fever, exercise, UTI, stress"
    ],
    investigations: [
      "Spot UPCR (first morning void) — most reliable in children",
      "Orthostatic test: first morning void UPCR vs after standing 2h",
      "Urine microscopy, culture",
      "CBC, LFT, creatinine, albumin, cholesterol, C3/C4",
      "ANA, anti-dsDNA, ANCA if systemic features",
      "USG kidneys",
      "Kidney biopsy: atypical NS, steroid-resistant, adult-onset, declining GFR"
    ],
    management: [
      "Orthostatic proteinuria: reassurance, annual follow-up",
      "Nephrotic syndrome: prednisolone 60mg/m²/day (max 60mg) × 4–6 weeks per ISKDC",
      "Steroid-resistant: biopsy + calcineurin inhibitor / MMF / Rituximab",
      "FSGS: high-dose steroids, ACE inhibitor (renoprotection)",
      "Lupus nephritis: hydroxychloroquine + mycophenolate/cyclophosphamide"
    ],
    followup: [
      "NS in remission: dipstick monitoring daily at home",
      "UPCR every 3 months in remission, monthly in relapse",
      "Annual GFR, BP monitoring in all persistent proteinuria"
    ],
    pearls: [
      "First morning void UPCR avoids orthostatic effect",
      "Low albumin (<25 g/L) + edema + heavy proteinuria = nephrotic syndrome",
      "Hematuria with proteinuria → nephritic/nephrotic overlap, biopsy likely",
      "Transient proteinuria in fever can be up to 2+ on dipstick — repeat in 2 weeks"
    ]
  },
  {
    id: "hypertension",
    title: "Hypertension",
    icon: Heart,
    color: "bg-rose-600",
    badge: "rose",
    overview: "BP ≥95th percentile for age/sex/height on ≥3 occasions (2017 AAP guidelines)",
    initial_assessment: [
      "Correct cuff size (bladder covers 80% arm circumference)",
      "Measure in right arm, seated, after 5 min rest",
      "Height percentile for BP interpretation",
      "Symptoms: headache, visual disturbance, chest pain, epistaxis",
      "History: UTI, renal disease, medications, family history, obesity"
    ],
    red_flags: [
      "BP >99th+5mmHg = Hypertensive urgency/emergency",
      "Severe headache + papilledema → hypertensive encephalopathy",
      "Seizures + hypertension → PRES",
      "Hypertension in neonate → renal artery thrombosis",
      "Hypertension + hematuria + UPCR > 0.5 → GN"
    ],
    differentials: [
      "Renal parenchymal: CKD, GN, PKD, reflux nephropathy (most common secondary cause)",
      "Renovascular: renal artery stenosis, fibromuscular dysplasia",
      "Endocrine: pheochromocytoma, Cushing, hyperaldosteronism, hyperthyroidism",
      "Cardiac: coarctation of aorta",
      "Essential: adolescents, obesity, family history"
    ],
    investigations: [
      "Urine: dipstick, microscopy, UPCR, culture",
      "Blood: creatinine, electrolytes, CBC, glucose, lipids",
      "USG KUB with Doppler (renal artery stenosis screening)",
      "Echocardiography (LVH assessment — end-organ damage)",
      "Plasma renin, aldosterone (if hypokalemia or difficult-to-control HTN)",
      "Plasma/urine metanephrines (if paroxysmal, sweating, pallor)",
      "Ambulatory BP monitoring (ABPM) — white coat vs true HTN"
    ],
    management: [
      "Stage 1 (≥95th–<95th+12 mmHg, or 130/80–139/89): lifestyle + treat underlying cause",
      "Stage 2 (≥95th+12 mmHg, or ≥140/90): start antihypertensive immediately",
      "1st line: ACE inhibitor (CKD/proteinuric) or calcium channel blocker",
      "Hypertensive emergency: IV labetalol / nicardipine — reduce BP by 25% in first hour",
      "PRES: magnesium, anti-epileptics, BP reduction"
    ],
    followup: [
      "Reassess BP 1–2 weeks after starting treatment",
      "Target BP <90th percentile",
      "Annual echo if antihypertensive treatment continued",
      "ABPM annually to assess nocturnal dipping"
    ],
    pearls: [
      "Renal parenchymal disease is #1 secondary cause of HTN in children",
      "Always check both arms — coarctation may be missed",
      "White coat HTN (15–40%): confirm with ABPM or home readings",
      "ACE inhibitor has dual benefit in CKD/proteinuria: BP + renoprotection"
    ]
  },
  {
    id: "aki",
    title: "Acute Kidney Injury",
    icon: Activity,
    color: "bg-orange-600",
    badge: "orange",
    overview: "KDIGO: ↑Cr ≥0.3mg/dL in 48h OR ↑Cr ×1.5 from baseline OR UO <0.5mL/kg/h for 6h",
    initial_assessment: [
      "Establish baseline creatinine (prior records, estimate from age/weight if unavailable)",
      "Urine output documentation (catheterize if critically ill)",
      "Volume status: dehydration vs overload vs normovolemic",
      "Recent medications: NSAIDs, aminoglycosides, contrast, ACE-i",
      "Preceding illness: D+HUS, sepsis, GN, obstruction"
    ],
    red_flags: [
      "Oligoanuria <0.5mL/kg/h despite adequate resuscitation → intrinsic AKI",
      "AKI + bloody diarrhea + thrombocytopenia → HUS",
      "AKI + rash + arthritis → SLE, Vasculitis",
      "AKI + hypercalcemia + eosinophilia → interstitial nephritis",
      "Hyperkalemia >6.5 + ECG changes → emergency treatment",
      "Pulmonary edema + severe HTN → urgent dialysis indication"
    ],
    differentials: [
      "Pre-renal: dehydration, sepsis, cardiac failure, hypoalbuminemia",
      "Intrinsic renal: ATN, GN, HUS, interstitial nephritis, drug toxicity",
      "Post-renal: bilateral obstruction, posterior urethral valve, neurogenic bladder"
    ],
    investigations: [
      "Urine: dipstick, microscopy (granular casts → ATN; RBC casts → GN), Na, creatinine, FENa",
      "FENa <1% → pre-renal; FENa >2% → ATN (except contrast/myoglobin)",
      "Blood: CBC, electrolytes, creatinine, urea, ABG, LDH, peripheral smear (HUS)",
      "USG KUB (exclude obstruction, assess kidney size)",
      "Biopsy if: intrinsic AKI of unclear cause, suspected GN"
    ],
    management: [
      "Stage 1: treat cause, avoid nephrotoxins, optimize fluids",
      "Stage 2–3: nephrology review, renal replacement therapy indications",
      "Fluid: 10–20mL/kg bolus if pre-renal, then reassess",
      "Hyperkalemia: calcium gluconate (cardiac protection) + insulin/glucose + salbutamol",
      "Dialysis indications: AEIOU (Acidosis, Electrolytes, Intoxication, Overload, Uremia)"
    ],
    followup: [
      "90-day creatinine: 25% develop CKD after AKI",
      "Annual BP, UPCR, GFR for 5 years post-AKI",
      "Avoid nephrotoxins permanently in those with residual damage"
    ],
    pearls: [
      "FEUrea <35% more reliable than FENa in patients on diuretics",
      "Muddy brown casts = ATN; RBC casts = glomerulonephritis",
      "D+HUS: supportive care — no antibiotics for STEC HUS (may worsen)",
      "AKI creatinine may underestimate severity in early illness due to volume dilution"
    ]
  },
  {
    id: "ckd",
    title: "CKD Approach",
    icon: Brain,
    color: "bg-indigo-600",
    badge: "indigo",
    overview: "eGFR <60 mL/min/1.73m² or markers of kidney damage >3 months",
    initial_assessment: [
      "Duration: acute vs chronic (small kidneys, anemia, bone disease → chronic)",
      "Cause: congenital (CAKUT), glomerular (GN), hereditary, metabolic",
      "Current GFR + trajectory: progression rate, triggers for decline",
      "Complications: anemia, growth failure, bone disease, hypertension, acidosis",
      "Medications affecting GFR: NSAIDs, aminoglycosides, contrast"
    ],
    red_flags: [
      "Rapidly declining GFR (>5mL/min/yr) → modifiable cause, urgent review",
      "Severe anemia (Hb <7) + CKD → EPO therapy, transfusion if symptomatic",
      "CKD stage 4–5 + acidosis → urgent bicarbonate, RRT planning",
      "CKD + seizures → hypertensive encephalopathy, uremia",
      "Growth velocity <−2 SD → growth hormone therapy consideration"
    ],
    differentials: [
      "CAKUT (most common in children): renal dysplasia, obstructive uropathy, VUR",
      "Glomerular: FSGS, IgAN, Alport, SLE, MPGN",
      "Hereditary: Alport, ARPKD, nephronophthisis",
      "Metabolic: primary hyperoxaluria, cystinosis",
      "Vascular: HUS sequelae, renal artery stenosis"
    ],
    investigations: [
      "eGFR (bedside Schwartz: k × height/creatinine; k=0.413 for children)",
      "Urine UPCR, microscopy, culture",
      "CBC, electrolytes, creatinine, albumin, LFT, calcium, phosphate, PTH",
      "25-OH vitamin D, ferritin, transferrin saturation",
      "USG KUB, DMSA scan (scarring), MCUG (VUR), genetic panel if hereditary",
      "CXR, Echo (cardiomegaly, pericardial effusion, LVH)"
    ],
    management: [
      "ACE inhibitor: renoprotection in proteinuric CKD (all stages)",
      "BP target: <50th percentile; <75th if proteinuria",
      "Anemia: target Hb 10–12 g/dL with EPO + iron",
      "CKD-MBD: phosphate restriction, calcium-based/non-calcium binders, active vitamin D",
      "Nutrition: adequate calories for growth, protein per KDOQI, restrict phosphate",
      "Growth: rhGH if growth velocity <−2 SD and GFR >15",
      "RRT planning: at eGFR 15–20, especially in children"
    ],
    followup: [
      "CKD 1–2: every 6–12 months",
      "CKD 3: every 3–6 months",
      "CKD 4–5: every 1–3 months with RRT team",
      "School/developmental assessment annually"
    ],
    pearls: [
      "CAKUT accounts for ~50% of pediatric CKD — always do USG",
      "Acidosis exacerbates bone disease and growth failure — target HCO3 >22",
      "Avoid phosphate-containing laxatives/enemas in CKD 4–5",
      "Constipation worsens uremia — bowel management important in CKD"
    ]
  },
  {
    id: "polyuria",
    title: "Polyuria",
    icon: Droplet,
    color: "bg-cyan-600",
    badge: "cyan",
    overview: "Urine output >2L/m²/day (or >40mL/kg/day); always differentiate DI vs primary polydipsia",
    initial_assessment: [
      "Quantify: 24h urine output or timed collection",
      "Thirst pattern: primary polydipsia (drinks first) vs DI (polyuria first)",
      "Nocturia (suggests DI) vs absence of nocturia (primary polydipsia)",
      "Onset: neonatal → congenital nephrogenic DI; post-head injury → central DI",
      "Medications: lithium, amphotericin, demeclocycline → nephrogenic DI"
    ],
    red_flags: [
      "Hypernatremia + polyuria → central or nephrogenic DI (medical emergency if severe)",
      "Polyuria + hypokalemia + metabolic alkalosis → Bartter syndrome",
      "Polyuria + growth failure + rickets → nephronophthisis, Fanconi",
      "Polyuria + polydipsia + weight loss + ketosis → T1DM (rule out first)",
      "Neonatal polyuria + poor feeding → severe nephrogenic DI"
    ],
    differentials: [
      "Central DI: idiopathic, post-traumatic, post-surgical, Langerhans histiocytosis, craniopharyngioma",
      "Nephrogenic DI: X-linked (AVPR2), autosomal (AQP2), lithium, hypercalcemia, hypokalemia",
      "Primary polydipsia: psychogenic, habitual, hypothalamic",
      "Osmotic diuresis: diabetes mellitus, glycosuria, post-obstructive diuresis"
    ],
    investigations: [
      "Urine osmolality: >700 mOsm/kg → rules out DI; <300 → DI likely",
      "Serum Na, osmolality, glucose, calcium, potassium",
      "Water deprivation test (supervised): distinguish DI from primary polydipsia",
      "DDAVP response: central DI concentrates urine; nephrogenic DI does not",
      "MRI brain: central DI (absent posterior pituitary bright spot)"
    ],
    management: [
      "Central DI: DDAVP intranasal/oral; restrict water intake",
      "Nephrogenic DI: hydrochlorothiazide + amiloride; indomethacin; treat cause",
      "Primary polydipsia: behavioral modification, supervised fluid restriction",
      "Bartter: potassium supplementation, indomethacin, amiloride"
    ],
    followup: [
      "Central DI: monitor Na, urine osmolality monthly initially",
      "MRI brain 6-monthly if idiopathic central DI (may reveal tumor)",
      "Nephrogenic DI: electrolytes every 3 months"
    ],
    pearls: [
      "Always exclude T1DM (blood glucose) before water deprivation test",
      "Urine osmolality >700 after overnight fast essentially rules out significant DI",
      "Lithium causes nephrogenic DI — ask about psychiatric medications",
      "X-linked nephrogenic DI: females may be carriers with partial phenotype"
    ]
  },
  {
    id: "neurogenic-bladder",
    title: "Neurogenic Bladder",
    icon: Brain,
    color: "bg-purple-600",
    badge: "purple",
    overview: "Bladder dysfunction due to neurological disease affecting sensory/motor control of micturition",
    initial_assessment: [
      "Underlying diagnosis: spina bifida, sacral agenesis, spinal cord injury, tethered cord",
      "Voiding pattern: frequency, urgency, incomplete emptying, post-void residual",
      "Incontinence type: stress, urgency, overflow, continuous (total incontinence)",
      "Bowel function: constipation, soiling (often coexists)",
      "UTI history, previous urological procedures, renal function"
    ],
    red_flags: [
      "Hydronephrosis + neurogenic bladder → high-pressure bladder, urgent UDS",
      "Recurrent febrile UTIs → vesicoureteric reflux likely",
      "New neurological symptoms in known spina bifida → tethered cord",
      "Deteriorating renal function + neurogenic bladder → RRT risk",
      "Autonomic dysreflexia: sudden severe HTN in high spinal injury"
    ],
    differentials: [
      "Spina bifida / myelomeningocele (most common)",
      "Sacral agenesis",
      "Spinal cord tumors",
      "Tethered cord syndrome",
      "Transverse myelitis, Guillain-Barré",
      "Posterior urethral valve (functional component)"
    ],
    investigations: [
      "Urinalysis, culture",
      "Renal USG + post-void residual",
      "MCUG: VUR, bladder morphology",
      "Urodynamic study (UDS): cystometry, sphincter EMG, pressure-flow",
      "Spine MRI: tethered cord, level of lesion",
      "Creatinine, eGFR"
    ],
    management: [
      "Clean intermittent catheterization (CIC): cornerstone of management",
      "CIC frequency: every 3–4 hours (maintain volume <300mL/catheterization)",
      "Anticholinergics (oxybutynin/tolterodine): reduce detrusor overactivity",
      "Bowel program: high fiber, adequate fluids, laxatives if needed",
      "Prophylactic antibiotics: if recurrent febrile UTIs or VUR",
      "Surgical: bladder augmentation, Mitrofanoff, artificial sphincter"
    ],
    followup: [
      "USG renal annually (hydronephrosis monitoring)",
      "UDS every 1–2 years (or when clinical change)",
      "Creatinine/GFR annually",
      "Urology + nephrology + rehabilitation MDT"
    ],
    pearls: [
      "CIC is not a risk for UTI — bacterial colonization ≠ infection",
      "High bladder storage pressure (>40 cmH2O) is the main risk to upper tracts",
      "Anticholinergics reduce leak point pressure and protect kidneys",
      "Tethered cord re-tethering may present as new incontinence in known spina bifida"
    ]
  },
  {
    id: "bbd",
    title: "Bladder Bowel Dysfunction",
    icon: Activity,
    color: "bg-amber-600",
    badge: "amber",
    overview: "Functional lower urinary tract dysfunction + bowel dysfunction without neurological cause",
    initial_assessment: [
      "Voiding diary: frequency, volumes, urgency episodes, leaks",
      "Bowel history: constipation, soiling, stool frequency, Bristol stool scale",
      "Drinking habits: volume, type (carbonated, caffeine), timing",
      "Previous UTIs, VUR, previous investigations",
      "Psychological/school/social factors (hiding, avoidance of school toilets)"
    ],
    red_flags: [
      "BBD + VUR → high risk for renal scarring, prophylactic antibiotics",
      "Continuous incontinence → ectopic ureter, fistula",
      "BBD + hematuria → rule out pathology",
      "Neurological features (gait, reflexes, tufts of hair on back) → spine imaging",
      "BBD unresponsive to first-line treatment → urodynamics"
    ],
    differentials: [
      "Overactive bladder (OAB)",
      "Underactive bladder / voiding postponement",
      "Dysfunctional voiding (detrusor-sphincter dyssynergia)",
      "Stress incontinence (girls, giggle incontinence)",
      "Nocturnal enuresis (isolated vs combined)",
      "Constipation-only",
      "UTI-related urgency"
    ],
    investigations: [
      "Voiding diary (3-day minimum)",
      "Uroflowmetry + post-void residual (non-invasive, first step)",
      "Renal USG + bladder wall thickness",
      "MCUG if recurrent UTIs (exclude VUR)",
      "Spine MRI if suspected tethered cord / sacral anomaly",
      "UDS only if non-responder or atypical features"
    ],
    management: [
      "Urotherapy (first line): bladder training, timed voiding every 2–3h",
      "Bowel treatment: high fiber, adequate fluid, PEG/lactulose",
      "Avoid: caffeine, carbonated drinks",
      "Proper voiding posture: feet supported, knees at 90°",
      "Overactive bladder: oxybutynin (antimuscarinic)",
      "Dysfunctional voiding: biofeedback, pelvic floor physiotherapy",
      "Enuresis: DDAVP (nocturnal), alarm therapy (primary nocturnal enuresis)"
    ],
    followup: [
      "6–8 weeks after urotherapy initiation",
      "Uroflowmetry + PVR at each visit",
      "UTI surveillance if VUR present"
    ],
    pearls: [
      "Treat constipation FIRST — many LUT symptoms resolve",
      "Uroflowmetry is underused — provides bell-shaped, plateau, interrupted, staccato patterns",
      "Bell-shaped curve = normal; Plateau = outlet obstruction; Staccato/interrupted = dysfunctional voiding",
      "OAB + VUR: treat both together for renal protection"
    ]
  },
  {
    id: "cakut",
    title: "CAKUT",
    icon: Eye,
    color: "bg-teal-600",
    badge: "teal",
    overview: "Congenital Anomalies of Kidney and Urinary Tract — spectrum from renal agenesis to mild VUR",
    initial_assessment: [
      "Antenatal history: oligohydramnios, bilateral hydronephrosis, abnormal anomaly scan",
      "Postnatal: UTIs, poor urinary stream (PUV), abdominal mass (UPJ obstruction)",
      "Family history (HNF1B, PAX2 mutations → autosomal dominant)",
      "Renal function at presentation: creatinine, UPCR",
      "Imaging history: previous USG, DMSA, MCUG reports"
    ],
    red_flags: [
      "Bilateral severe hydronephrosis in male neonate → PUV until proven otherwise",
      "Oligohydramnios + bilateral renal anomalies → Potter sequence risk",
      "CAKUT + proteinuria → glomerular involvement (renal dysplasia)",
      "CAKUT + extrarenal anomalies → VACTERL, chromosomal syndromic",
      "Renal dysplasia bilateral → early CKD, needs RRT planning"
    ],
    differentials: [
      "Hydronephrosis: UPJ obstruction, VUR, megaureter, ureterocele",
      "Cystic: MCDK, ARPKD, ADPKD, nephronophthisis",
      "Renal agenesis / hypoplasia / dysplasia",
      "Horseshoe kidney, duplex system",
      "Posterior urethral valves (PUV)",
      "Prune belly syndrome"
    ],
    investigations: [
      "Renal USG (antenatal hydronephrosis classification: SFU grade 1–4)",
      "MCUG: exclude VUR, PUV (indicated in all boys with antenatal hydronephrosis)",
      "MAG3 renogram + diuresis: distinguish obstructive vs non-obstructive hydronephrosis",
      "DMSA scan: renal scars, differential function (significant if <45%)",
      "Creatinine, electrolytes, UPCR",
      "Genetic testing: HNF1B panel if multicystic dysplasia + extrarenal features"
    ],
    management: [
      "Mild hydronephrosis (SFU 1–2): observe, serial USG",
      "SFU 3–4: MAG3 renogram; pyeloplasty if obstructed with declining function",
      "VUR grade 1–2: observe; grade 3–5: prophylactic antibiotics; grade 4–5: consider surgery",
      "PUV: cystoscopy + valve ablation as neonatal emergency",
      "MCDK: observe (85% involute); nephrectomy if hypertension or growth",
      "Renal dysplasia: manage CKD complications per KDIGO"
    ],
    followup: [
      "Antenatal hydronephrosis: postnatal USG at 48–72h (if bilateral/severe) or 4–6 weeks",
      "Annual USG, UPCR, creatinine in all CAKUT",
      "DMSA every 2–3 years in VUR or UTI history"
    ],
    pearls: [
      "Posterior urethral valve: #1 cause of severe obstructive uropathy in boys",
      "SFU grading: Grade 4 (parenchymal thinning) needs urgent MAG3",
      "DMSA > 45% differential function in obstructed kidney: conservative management acceptable",
      "HNF1B mutations: renal cysts + diabetes + liver anomalies (RCAD syndrome)"
    ]
  },
  {
    id: "antenatal-hydronephrosis",
    title: "Antenatal Hydronephrosis",
    icon: Eye,
    color: "bg-green-600",
    badge: "green",
    overview: "Renal pelvis AP diameter ≥4mm in second trimester, ≥7mm in third trimester",
    initial_assessment: [
      "Antenatal APD (anterior-posterior diameter) measurement at each scan",
      "Laterality: unilateral vs bilateral (bilateral warrants urgent postnatal workup)",
      "SFU grading: calyceal dilatation, parenchymal thickness",
      "Sex: male → always exclude PUV",
      "Amniotic fluid index (oligohydramnios suggests bilateral functional compromise)"
    ],
    red_flags: [
      "Bilateral hydronephrosis in male fetus → PUV, posterior urethral obstruction",
      "Oligohydramnios + bilateral HN → severe obstruction, pulmonary hypoplasia risk",
      "APD >15mm in 3rd trimester → high-grade obstruction",
      "Dilated ureter (hydroureteronephrosis) → VUR, primary megaureter, ureterocele"
    ],
    differentials: [
      "Physiological/transient (50–70%): resolves postnatally",
      "UPJ obstruction (most common surgical cause)",
      "VUR (grade 3–5)",
      "Megaureter (obstructive vs refluxing)",
      "Ureterocele",
      "PUV (bilateral in male)",
      "MCDK (contralateral HN due to VUR or single kidney hypertrophy)"
    ],
    investigations: [
      "Postnatal USG: timing depends on severity",
      "Mild-moderate unilateral: USG at 4–6 weeks (avoid first 48h, falsely normal due to physiological oliguria)",
      "Severe bilateral or suspected PUV: USG within 48–72h + urology referral",
      "MCUG: males with bilateral HN, any HN with UTI",
      "MAG3 renogram: functional obstruction assessment (at 6 weeks or later)",
      "Creatinine at birth and day 3 (lower limit of normal = maternal creatinine initially)"
    ],
    management: [
      "Mild (SFU 1): discharge home with USG at 4–6 weeks",
      "Moderate (SFU 2–3): antibiotic prophylaxis pending MCUG ± renogram",
      "Severe (SFU 4) / bilateral: urgent neonatology + urology review",
      "PUV: bladder catheterization → stabilize → cystoscopy + valve ablation",
      "UPJ obstruction: pyeloplasty if function <40% or obstructed renogram"
    ],
    followup: [
      "Mild resolved: single USG at 6 months then discharge",
      "Persistent hydronephrosis: 6-monthly USG, annual creatinine/UPCR",
      "Post-pyeloplasty: MAG3 at 3 months, then annually"
    ],
    pearls: [
      "Postnatal USG in first 48h may miss mild HN (relative oliguria)",
      "50% of antenatal HN is physiological and resolves spontaneously",
      "Antibiotic prophylaxis: co-trimoxazole 1.25–2.5mg/kg once nightly",
      "All male neonates with antenatal bilateral HN need MCUG to exclude PUV"
    ]
  }
];

const BADGE_COLORS = {
  red: "bg-red-100 text-red-700",
  blue: "bg-blue-100 text-blue-700",
  rose: "bg-rose-100 text-rose-700",
  orange: "bg-orange-100 text-orange-700",
  indigo: "bg-indigo-100 text-indigo-700",
  cyan: "bg-cyan-100 text-cyan-700",
  purple: "bg-purple-100 text-purple-700",
  amber: "bg-amber-100 text-amber-700",
  teal: "bg-teal-100 text-teal-700",
  green: "bg-green-100 text-green-700",
};

function SectionBlock({ title, items, icon: Icon, color }) {
  return (
    <div className="mb-4">
      <div className={`flex items-center gap-2 mb-2 pb-1 border-b-2 ${color.replace("bg-", "border-").replace("-600", "-200")}`}>
        <Icon className={`w-4 h-4 ${color.replace("bg-", "text-")}`} />
        <h4 className="font-semibold text-slate-800 text-sm">{title}</h4>
      </div>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ClinicalApproaches() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [activeSection, setActiveSection] = useState("initial_assessment");

  const filtered = APPROACHES.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.overview.toLowerCase().includes(search.toLowerCase())
  );

  const approach = selected ? APPROACHES.find(a => a.id === selected) : null;

  const SECTIONS = [
    { key: "initial_assessment", label: "Initial Assessment", icon: Stethoscope },
    { key: "red_flags", label: "Red Flags", icon: AlertTriangle },
    { key: "differentials", label: "Differentials", icon: List },
    { key: "investigations", label: "Investigations", icon: Microscope },
    { key: "management", label: "Management", icon: CheckCircle },
    { key: "followup", label: "Follow-up", icon: ArrowRight },
    { key: "pearls", label: "Exam Pearls", icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 rounded-2xl bg-gradient-to-r from-cyan-700 via-teal-600 to-blue-700 p-6 text-white shadow-xl">
          <div className="flex items-center gap-3 mb-1">
            <Stethoscope className="w-8 h-8" />
            <div>
              <h1 className="text-3xl font-bold">Clinical Approaches</h1>
              <p className="text-cyan-100 text-sm">Structured diagnostic & management algorithms — Nephrology + Rheumatology + Critical Care</p>
            </div>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="common">
          <TabsList className="flex w-full bg-white border shadow-sm h-auto mb-4 overflow-x-auto">
            <TabsTrigger value="common" className="flex items-center gap-1.5 text-xs md:text-sm flex-shrink-0">
              <Layers className="w-4 h-4" /> Common Approaches
            </TabsTrigger>
            <TabsTrigger value="scoring" className="flex items-center gap-1.5 text-xs md:text-sm flex-shrink-0">
              <Activity className="w-4 h-4" /> Scoring & Classifications
            </TabsTrigger>
            <TabsTrigger value="nephrology" className="flex items-center gap-1.5 text-xs md:text-sm flex-shrink-0">
              <Droplet className="w-4 h-4" /> Nephrology Approaches
            </TabsTrigger>
          </TabsList>

          <TabsContent value="common">
            <CommonApproachesHub />
          </TabsContent>

          <TabsContent value="scoring">
            <ScoringClassificationHub />
          </TabsContent>

          <TabsContent value="nephrology">
            {/* original nephrology content below */}

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            className="pl-10 bg-white border-2 border-slate-200 h-11"
            placeholder="Search nephrology approaches..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {!approach ? (
          /* Grid of approach cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(a => {
              const Icon = a.icon;
              return (
                <Card
                  key={a.id}
                  className="cursor-pointer hover:shadow-xl transition-all duration-200 border-2 hover:border-cyan-400 group"
                  onClick={() => { setSelected(a.id); setActiveSection("initial_assessment"); }}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-11 h-11 ${a.color} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-md`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 text-base">{a.title}</h3>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{a.overview}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <Badge className={`text-xs ${BADGE_COLORS[a.badge]}`}>{a.red_flags.length} Red Flags</Badge>
                      <Badge className="text-xs bg-slate-100 text-slate-600">{a.differentials.length} Differentials</Badge>
                      <Badge className="text-xs bg-emerald-100 text-emerald-700">{a.pearls.length} Pearls</Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          /* Detail view */
          <div>
            <Button variant="outline" onClick={() => setSelected(null)} className="mb-4 gap-2">
              <ChevronDown className="w-4 h-4 rotate-90" />
              Back to All Approaches
            </Button>

            <div className="grid lg:grid-cols-4 gap-6">
              {/* Sidebar nav */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardContent className="p-3">
                    <div className={`w-full ${approach.color} rounded-xl p-4 text-white mb-3`}>
                      <h2 className="font-bold text-xl">{approach.title}</h2>
                      <p className="text-xs mt-1 opacity-90">{approach.overview}</p>
                    </div>
                    <div className="space-y-1">
                      {SECTIONS.map(s => {
                        const SIcon = s.icon;
                        return (
                          <button
                            key={s.key}
                            onClick={() => setActiveSection(s.key)}
                            className={`w-full text-left flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeSection === s.key ? "bg-cyan-600 text-white" : "hover:bg-slate-100 text-slate-700"}`}
                          >
                            <SIcon className="w-4 h-4 flex-shrink-0" />
                            {s.label}
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Content */}
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-cyan-50">
                    <CardTitle className="flex items-center gap-2">
                      {SECTIONS.find(s => s.key === activeSection) && React.createElement(SECTIONS.find(s => s.key === activeSection).icon, { className: "w-5 h-5 text-cyan-600" })}
                      {SECTIONS.find(s => s.key === activeSection)?.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {activeSection === "red_flags" ? (
                      <ul className="space-y-2">
                        {approach.red_flags.map((flag, i) => (
                          <li key={i} className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                            <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-red-800 font-medium">{flag}</span>
                          </li>
                        ))}
                      </ul>
                    ) : activeSection === "pearls" ? (
                      <ul className="space-y-2">
                        {approach.pearls.map((pearl, i) => (
                          <li key={i} className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                            <BookOpen className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-amber-900">{pearl}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <ul className="space-y-2">
                        {approach[activeSection]?.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-700 border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                            <ChevronRight className="w-4 h-4 text-cyan-500 mt-0.5 flex-shrink-0" />
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}