import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Baby, Brain, Activity, Scale, Heart, Syringe, Eye, Ear, AlertTriangle,
  CheckCircle, ChevronDown, ChevronUp, Stethoscope, TrendingUp, Microscope,
  BookOpen, Info, Zap, Wind, Shield, Users
} from "lucide-react";

// ─── IAP Screening Algorithms ─────────────────────────────────────────────────
const SCREENING_TOOLS = [
  {
    id: "mchat",
    name: "M-CHAT-R/F (Autism Screening)",
    icon: Brain,
    color: "violet",
    who: "AAP / IAP 2022",
    age: "16–30 months",
    frequency: "18 months + 24 months routine",
    description: "Modified Checklist for Autism in Toddlers - Revised with Follow-up. Screen all children at 18 and 24 months.",
    questions: [
      "Does your child respond to name when called?",
      "Does your child point to show interest (e.g., pointing at airplane)?",
      "Does your child bring objects to show you (for sharing)?",
      "Does your child make eye contact with you?",
      "Does your child smile in response to your smile?",
      "Does your child pretend play (e.g., feed a doll)?",
      "Does your child follow where you point?",
      "Does your child wave bye-bye?",
      "Does your child try to imitate words or sounds you say?",
      "Does your child look at your face when you do something new?",
    ],
    scoring: "0-2 Low Risk, 3-7 Medium (follow-up), 8-20 HIGH RISK → refer immediately",
    redFlags: ["No back-and-forth gestures by 9 months", "No words by 16 months", "No 2-word phrases by 24 months", "Any regression at any age"],
    action: "Score ≥3: Phone follow-up interview (M-CHAT-R/F). Score ≥2 on follow-up: Refer to specialist immediately. India: AIIMS ISAA scale for confirmation.",
    references: ["IAP ASD Guidelines 2022", "AAP Autism Algorithm 2020", "INCLEN India ASD Study 2017"],
  },
  {
    id: "development",
    name: "Developmental Surveillance (IAP Milestones)",
    icon: Baby,
    color: "teal",
    who: "IAP 2021 / WHO",
    age: "Birth to 5 years",
    frequency: "Every visit (well-child care)",
    description: "Structured developmental surveillance using IAP milestones chart. Ask, observe, and screen at each visit.",
    algorithm: [
      { age: "2 months", check: "Social smile, tracks face, startles to sound, lifts head 45°" },
      { age: "4 months", check: "Holds head steady, laughs, reaches for objects, coos" },
      { age: "6 months", check: "Sits with support, babbles, transfers objects, stranger anxiety" },
      { age: "9 months", check: "Sits unsupported, pincer grasp developing, says mama/dada non-specifically" },
      { age: "12 months", check: "Pulls to stand, walks with support, 2-3 words, waves bye, imitates" },
      { age: "15 months", check: "Walks independently, 4-6 words, follows 1-step commands, scribbles" },
      { age: "18 months", check: "Runs, 10 words, identifies body parts, combines 2 words soon" },
      { age: "24 months", check: "2-word phrases, runs well, 50% understandable speech, parallel play" },
      { age: "3 years", check: "3-word sentences, rides tricycle, knows name/age/sex, dresses with help" },
      { age: "5 years", check: "Counts to 10, draws person with 6 parts, skips, reads simple words" },
    ],
    redFlags: ["No smile by 2m", "No babbling by 12m", "No words by 16m", "No 2-word phrases by 24m", "Loss of any skill at any age"],
    action: "Refer for detailed developmental assessment if any red flag. Use M-CHAT at 18/24m. Consider hearing test if speech delay.",
    references: ["IAP Developmental Surveillance 2021", "WHO Multicentre Growth Reference Study"],
  },
  {
    id: "anemia-nbs",
    name: "Newborn Screening (NBS) — India NNBS",
    icon: Microscope,
    color: "blue",
    who: "MoHFW India / IAP",
    age: "Day 2-4 of life",
    frequency: "Once at birth",
    description: "National Neonatal Screening Programme. India NBS panel (state-wise variation). Metabolic + endocrine + haematological screening.",
    algorithm: [
      { age: "Core (National)", check: "CH (Congenital Hypothyroidism) — TSH heel-prick" },
      { age: "Core (National)", check: "G6PD Deficiency — important in India (high burden)" },
      { age: "Core (National)", check: "Sickle Cell Disease — high burden tribal/central India" },
      { age: "Core (National)", check: "CAH (Congenital Adrenal Hyperplasia) — 17-OH-Progesterone" },
      { age: "Expanded (State)", check: "PKU, MSUD, Biotinidase deficiency, GA-1" },
      { age: "Expanded (State)", check: "Cystic Fibrosis — IRT (Immunoreactive Trypsinogen)" },
    ],
    redFlags: ["TSH >20 mIU/L on heel-prick", "G6PD <30% activity", "Abnormal haemoglobin pattern", "17-OHP >90 nmol/L"],
    action: "Abnormal screen: REPEAT immediately (confirmatory test). Do NOT wait for symptoms. Refer to tertiary centre within 7-14 days of abnormal result.",
    references: ["NNBS India Protocol 2022", "IAP NBS Guidelines 2023", "NHM India Newborn Care"],
  },
  {
    id: "growth-screening",
    name: "Growth Monitoring & Malnutrition Screening",
    icon: Scale,
    color: "green",
    who: "WHO/IAP/NHM India",
    age: "0-18 years (all children)",
    frequency: "Monthly <1yr, quarterly 1-5yr, 6-monthly >5yr",
    description: "Plot weight, height, head circumference on WHO growth charts. Calculate Z-scores. Screen using MUAC for <5 years.",
    algorithm: [
      { age: "Plot on WHO chart", check: "Weight-for-age, Height-for-age, Weight-for-height Z-scores" },
      { age: "MUAC (<5 years)", check: "<11.5 cm = SAM (severe), 11.5-12.5 cm = MAM (moderate)" },
      { age: "Classify", check: "Stunting: HAZ <-2SD | Wasting: WHZ <-2SD | Underweight: WAZ <-2SD" },
      { age: "SAM criteria (any one)", check: "WHZ <-3SD OR MUAC <11.5 cm OR bilateral pitting oedema" },
      { age: "Overweight/Obesity", check: "BMI >+1SD (overweight) or >+2SD (obese) on WHO chart for age/sex" },
    ],
    redFlags: ["No weight gain in 3 visits", "Weight loss any visit", "MUAC <11.5 cm", "Bilateral pitting oedema", "Rapid weight gain (obesity)"],
    action: "SAM: Refer to F-MAS or NRC immediately. MAM: CMAM programme, RUTF. Stunting: Diet counselling + nutrition rehabilitation. Obesity: Lifestyle intervention + CBT family therapy.",
    references: ["WHO Growth Standards 2006", "IAP SAM Guidelines 2023", "NHM CMAM Protocol India"],
  },
  {
    id: "vision-hearing",
    name: "Vision & Hearing Screening",
    icon: Eye,
    color: "amber",
    who: "IAP / WHO / AIIMS",
    age: "Newborn to 5 years",
    frequency: "Newborn + 6m + 12m + 3yr + 5yr",
    description: "Universal hearing screening (UNHS) at birth. Vision screening at every well-child visit. Critical for early language development.",
    algorithm: [
      { age: "HEARING — Newborn", check: "OAE (Otoacoustic Emissions) — universal at birth (NICU & normal newborns)" },
      { age: "HEARING — Fail OAE", check: "AABR (Automated ABR) within 1 month → diagnostic ABR if fails" },
      { age: "HEARING — Refer by", check: "Audiologist by 3 months, hearing aids by 6 months (1-3-6 rule)" },
      { age: "VISION — Red reflex", check: "All newborns before discharge — rule out cataract, retinoblastoma" },
      { age: "VISION — 4-5 years", check: "LogMAR/Snellen chart — refer if VA <6/18 or anisometropia" },
      { age: "RISK FACTORS", check: "Risk for hearing loss: NICU >5d, ototoxic drugs, family Hx, craniofacial anomaly, meningitis" },
    ],
    redFlags: ["Fails OAE at birth", "No visual tracking by 6 weeks", "White pupillary reflex (leukocoria)", "Strabismus at any age", "No startle to sound by 6 months"],
    action: "HEARING: EHDI — Early Hearing Detection and Intervention. India: AIIMS NICU protocol, Cochlear implant centre referral. VISION: Ophthalmology referral for failed red reflex urgently.",
    references: ["AIIMS UNHS Protocol 2022", "IAP Hearing Guidelines 2021", "AAP Vision Screening 2016"],
  },
  {
    id: "anemia-screening",
    name: "Anaemia Screening & IDA Protocol",
    icon: Activity,
    color: "rose",
    who: "WHO / IAP / NHM India",
    age: "6 months – 18 years",
    frequency: "Annual; 6m interval if risk factors",
    description: "Iron deficiency anaemia is the most common nutritional deficiency in Indian children. Screen all at 9-12 months, annually thereafter.",
    algorithm: [
      { age: "Hb thresholds (WHO)", check: "6m-5yr: <11 g/dL | 5-12yr: <11.5 g/dL | 12-15yr: <12 g/dL | 15yr+ (boys): <13 g/dL" },
      { age: "IDA screening labs", check: "Hb, MCV, MCH, serum ferritin (<12 ng/mL), TIBC, serum iron, transferrin saturation" },
      { age: "Classify severity", check: "Mild: Hb 10-11 | Moderate: Hb 7-10 | Severe: Hb <7 | Very severe: <4 g/dL" },
      { age: "WIFS Programme", check: "India: Weekly Iron Folic Acid Supplementation — all school children (National Programme)" },
      { age: "Treatment IDA", check: "Elemental iron 3-6 mg/kg/day (max 60mg/dose) for 3-4 months + treat underlying cause" },
    ],
    redFlags: ["Hb <7 g/dL (severe anaemia)", "Hb 4-6 with respiratory distress (transfuse)", "Pallor + splenomegaly (haemolytic)", "Jaundice + anaemia", "Not responding to oral iron in 4 weeks"],
    action: "Iron deficiency confirmed: treat with therapeutic iron 3-6 mg/kg/day elemental iron for minimum 3 months. Recheck Hb at 4 weeks (expect rise ≥1 g/dL). Dietary counselling. WIFS if eligible. Refer if no response.",
    references: ["WHO Anaemia Guidelines 2023", "IAP IDA Protocol 2021", "NHM WIFS India 2022"],
  },
  {
    id: "bp-screening",
    name: "Blood Pressure Screening in Children",
    icon: Heart,
    color: "red",
    who: "AAP 2017 / ISPN / IAP",
    age: "≥3 years at every visit",
    frequency: "Annual ≥3yr; every visit if risk factors",
    description: "Screen BP at every well-child visit from age 3 years. Use appropriate cuff size. Refer to AAP 2017 percentile tables.",
    algorithm: [
      { age: "Cuff selection", check: "Bladder width = 40% arm circumference; length = 80-100% arm circumference" },
      { age: "Classification (AAP 2017)", check: "Normal: <90th %ile | Elevated: 90-95th %ile | Stage 1 HTN: 95-99th + 12mmHg | Stage 2 HTN: >99th + 12mmHg" },
      { age: "Measurement", check: "Seated, quiet, right arm, 2 readings separated by 1-2 min; use average" },
      { age: "Elevated BP", check: "Repeat in 1-2 weeks. If persistent → 3 separate visits → confirm HTN" },
      { age: "HTN workup", check: "Urine (urinalysis + culture), Cr, BMP, lipids, ABPM, echo (LVH), renal USS" },
    ],
    redFlags: ["BP ≥30 mmHg above 95th percentile", "Headache + visual changes + BP high", "Papilloedema", "Seizure with hypertension", "Stage 2 HTN at first presentation"],
    action: "Stage 1 HTN: lifestyle + follow-up 1-2 weeks. Stage 2: immediate evaluation and treatment. HTN emergency: IV therapy within 1 hour target <25% reduction in 8h. Refer nephrology if <13 years or secondary cause suspected.",
    references: ["AAP HTN Guidelines 2017", "ISPN 2022", "IAP BP Percentiles 2015"],
  },
  {
    id: "tb-screening",
    name: "TB Screening in Children (India)",
    icon: Wind,
    color: "orange",
    who: "NTEP India / IAP / WHO",
    age: "All ages — high burden country",
    frequency: "Active case finding + contact screening",
    description: "India has highest TB burden globally. All children with risk factors or symptoms should be screened. NTEP 2023 algorithm.",
    algorithm: [
      { age: "Symptom screen", check: "Cough >2 weeks, fever >2 weeks, weight loss/not gaining, lethargy, neck swelling" },
      { age: "Contact screen", check: "All children <5yr contacts of sputum smear-positive TB: screen + give TPT" },
      { age: "Diagnosis <5yr", check: "3 gastric aspirates for AFB/Xpert + CXR (hilar adenopathy, consolidation, miliary)" },
      { age: "Diagnosis ≥5yr", check: "Sputum Xpert MTB/RIF × 2 + CXR + TST (>10mm if BCG, >5mm if immunocompromised)" },
      { age: "IGRA (India)", check: "QuantiFERON-TB Gold if TST inconclusive or BCG vaccinated >5 years ago" },
      { age: "TPT (TB preventive)", check: "All contacts <5yr → 6H (INH 10mg/kg/day × 6 months) regardless of TST" },
    ],
    redFlags: ["Meningism + fever (TBM)", "Miliary pattern on CXR", "TB + HIV coinfection", "Drug-resistant TB suspected", "Severe malnutrition + TB (30% mortality)"],
    action: "Presumptive TB: start workup, don't delay treatment. NTEP NIKSHAY registration mandatory. Standard regimen 2HRZE/4HR. India: bedaquiline for MDR-TB in children ≥5yr. SAM + TB: treat both simultaneously.",
    references: ["NTEP India 2022 Pediatric TB Guidelines", "WHO Childhood TB 2022", "IAP TB Guidelines 2021"],
  },
  {
    id: "obesity-screen",
    name: "Childhood Obesity Screening & Management",
    icon: TrendingUp,
    color: "indigo",
    who: "IAP / WHO / IAPCP",
    age: "2–18 years",
    frequency: "Annual BMI plotting",
    description: "Plot BMI-for-age on WHO reference charts. India-specific IAP reference (2015) for 5-18 years. Assess metabolic risk.",
    algorithm: [
      { age: "BMI classification", check: "<5yr: use WHO weight-for-height. ≥5yr: BMI-for-age z-score or percentile" },
      { age: "Overweight", check: ">+1SD (WHO) or >85th percentile (IAP 2015)" },
      { age: "Obesity", check: ">+2SD (WHO) or >95th percentile (IAP 2015) — NOTE: Lower cut-offs for Asian children" },
      { age: "Metabolic screen", check: "Fasting glucose, insulin (HOMA-IR), lipid profile, LFT (NAFLD), BP, waist circumference" },
      { age: "Intervention", check: "Lifestyle modification (diet + activity) is first-line for all stages" },
      { age: "Pharmacotherapy", check: "Orlistat (>12yr, BMI >95%ile + comorbidity): 120mg TDS with meals; limited evidence in India" },
    ],
    redFlags: ["BMI >+3SD (morbid obesity)", "Hypertension + obesity", "Fasting glucose >100 (pre-DM)", "Sleep apnoea symptoms", "Acanthosis nigricans + obesity (IR)"],
    action: "Lifestyle intervention: 150 min/week MVPA, limit screen time <2h/day, no sugary drinks, family-based approach. Refer if BMI >35 or metabolic complications. India: IAPCP childhood obesity guidelines 2015.",
    references: ["IAP Growth Charts 2015", "IAPCP Obesity Guidelines 2015", "WHO Obesity Report 2022"],
  },
  {
    id: "congenital-heart",
    name: "Critical CHD Screening (CCHD) — Pulse Oximetry",
    icon: Heart,
    color: "red",
    who: "AAP / IAP",
    age: "24-48 hours of life (all newborns)",
    frequency: "Once at birth",
    description: "Critical Congenital Heart Disease screening using pulse oximetry before discharge. Detects 7 key defects.",
    algorithm: [
      { age: "Measurement", check: "SpO2 of right hand (preductal) AND either foot (postductal) at 24-48h" },
      { age: "Positive screen", check: "SpO2 <90% (any reading) OR SpO2 90-94% (3 readings 1h apart) OR >3% difference pre/postductal" },
      { age: "7 Critical CHDs", check: "HLHS, Pulmonary atresia, TOF, TAPVR, TGA, Tricuspid atresia, Truncus arteriosus" },
      { age: "Also detected", check: "Coarctation, Interrupted aortic arch, Critical PS, Large VSD (if cyanotic)" },
      { age: "Echocardiogram", check: "All positive screens → urgent echo → paediatric cardiology same-day referral" },
    ],
    redFlags: ["SpO2 <90% on room air", "Central cyanosis", "Bounding pulses + wide pulse pressure (PDA)", "Absent femoral pulses (CoA)", "Hepatomegaly + tachycardia (heart failure)"],
    action: "POSITIVE: Do NOT discharge. Urgent paediatric cardiology referral + echo. If SpO2 <90%: prostaglandin E1 (0.05-0.1 mcg/kg/min) if duct-dependent lesion suspected. India: IAP-AIIMS neonatal cardiac protocol.",
    references: ["AAP CCHD Screening 2018", "IAP Newborn Care 2022", "AIIMS Paediatric Cardiology Protocol"],
  },
];

// ─── IAP Vaccination Quick Reference ─────────────────────────────────────────
const IAP_VACCINES_QUICK = [
  { age: "Birth", vaccines: ["BCG (0.05mL ID left arm)", "OPV-0", "HBV-1"], note: "Before discharge" },
  { age: "6 weeks", vaccines: ["OPV-1", "IPV-1", "HBV-2", "DTwP/DTaP-1", "Hib-1", "PCV-1", "Rotavirus-1"], note: "First PENTA dose" },
  { age: "10 weeks", vaccines: ["OPV-2", "DTwP/DTaP-2", "Hib-2", "PCV-2", "Rotavirus-2"], note: "" },
  { age: "14 weeks", vaccines: ["OPV-3", "IPV-2", "DTwP/DTaP-3", "Hib-3", "PCV-3", "Rotavirus-3 (if applicable)"], note: "IPV-2 important" },
  { age: "6 months", vaccines: ["OPV-4", "HBV-3", "Influenza-1"], note: "Annual influenza after" },
  { age: "9 months", vaccines: ["MMR-1", "MenC (high-risk)", "NMF (if not given at 6m)"], note: "MMR begins" },
  { age: "12 months", vaccines: ["Hepatitis A-1", "Varicella-1", "PCV Booster (if 3+1 schedule)"], note: "" },
  { age: "15 months", vaccines: ["MMR-2", "Varicella-2", "DTwP/DTaP B1", "Hib B1", "IPV B1"], note: "Important boosters" },
  { age: "18 months", vaccines: ["Hepatitis A-2", "DTwP B2"], note: "" },
  { age: "2 years", vaccines: ["Typhoid (TCV — conjugated)", "JE (endemic areas)", "Meningococcal (high-risk)"], note: "IAP 2023 TCV preferred" },
  { age: "4-6 years", vaccines: ["DT/DTaP B3", "OPV B3", "MMR-3 (optional)"], note: "Pre-school booster" },
  { age: "9-14 years", vaccines: ["HPV (2 doses if <15yr, 3 doses if ≥15yr)", "Tdap", "Influenza (annual)"], note: "IAP 2023 HPV for all genders" },
];

// ─── Growth Calculators Quick Reference ──────────────────────────────────────
const GROWTH_CALCS = [
  { name: "Weight estimation (Lundergan)", formula: "Age 1-9yr: (age × 2) + 10 kg", note: "e.g., 5yr = 20 kg" },
  { name: "Weight estimation (Weech)", formula: "Age 1-12yr: (age × 2) + 8 kg", note: "Alternate formula" },
  { name: "Height estimation", formula: ">2yr: (age × 6) + 77 cm", note: "Rough estimate" },
  { name: "Head circumference", formula: "Term: 33-35cm | 1yr: ~46cm | 2yr: ~49cm | Adult: ~57cm", note: "Grow 2cm/month (0-3m)" },
  { name: "MUAC (<5yr)", formula: "<11.5cm=SAM | 11.5-12.5cm=MAM | >12.5cm=Normal", note: "MUAC tape" },
  { name: "BMI formula", formula: "Weight(kg) / Height(m)²", note: "Plot on age/sex chart" },
  { name: "Ideal body weight (IBW)", formula: "Height-for-age 50th percentile weight", note: "Use for drug dosing in obese" },
  { name: "BSA (Mosteller)", formula: "√([Ht cm × Wt kg] / 3600)", note: "For chemo, calcineurin dosing" },
];

function AccCard({ title, icon: Icon, color, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const colors = {
    violet: "bg-violet-50 border-violet-200 text-violet-800",
    teal: "bg-teal-50 border-teal-200 text-teal-800",
    blue: "bg-blue-50 border-blue-200 text-blue-800",
    green: "bg-green-50 border-green-200 text-green-800",
    amber: "bg-amber-50 border-amber-200 text-amber-800",
    rose: "bg-rose-50 border-rose-200 text-rose-800",
    red: "bg-red-50 border-red-200 text-red-800",
    orange: "bg-orange-50 border-orange-200 text-orange-800",
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-800",
  };
  const cls = colors[color] || colors.blue;
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between p-3 text-left ${cls}`}>
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 flex-shrink-0" />
          <span className="font-bold text-sm">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {open && <div className="p-3 bg-white">{children}</div>}
    </div>
  );
}

function ScreeningToolCard({ tool }) {
  const [open, setOpen] = useState(false);
  const Icon = tool.icon;
  const colorMap = {
    violet: "bg-violet-100 text-violet-800 border-violet-300",
    teal: "bg-teal-100 text-teal-800 border-teal-300",
    blue: "bg-blue-100 text-blue-800 border-blue-300",
    green: "bg-green-100 text-green-800 border-green-300",
    amber: "bg-amber-100 text-amber-800 border-amber-300",
    rose: "bg-rose-100 text-rose-800 border-rose-300",
    red: "bg-red-100 text-red-800 border-red-300",
    orange: "bg-orange-100 text-orange-800 border-orange-300",
    indigo: "bg-indigo-100 text-indigo-800 border-indigo-300",
  };
  const headerMap = {
    violet: "bg-violet-50 border-violet-200",
    teal: "bg-teal-50 border-teal-200",
    blue: "bg-blue-50 border-blue-200",
    green: "bg-green-50 border-green-200",
    amber: "bg-amber-50 border-amber-200",
    rose: "bg-rose-50 border-rose-200",
    red: "bg-red-50 border-red-200",
    orange: "bg-orange-50 border-orange-200",
    indigo: "bg-indigo-50 border-indigo-200",
  };
  const cls = colorMap[tool.color] || colorMap.blue;
  const hCls = headerMap[tool.color] || headerMap.blue;

  return (
    <Card className="border border-slate-200">
      <button className="w-full text-left" onClick={() => setOpen(!open)}>
        <CardHeader className={`py-2.5 px-3 border-b ${hCls}`}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cls}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm text-slate-900 leading-snug">{tool.name}</p>
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  <Badge className={`${cls} text-xs border`}>{tool.who}</Badge>
                  <Badge variant="outline" className="text-xs">{tool.age}</Badge>
                </div>
              </div>
            </div>
            {open ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />}
          </div>
        </CardHeader>
      </button>
      {open && (
        <CardContent className="p-3 space-y-3">
          <p className="text-xs text-slate-600 leading-relaxed">{tool.description}</p>
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 rounded-lg p-2">
            <Syringe className="w-3.5 h-3.5 text-slate-400" />
            <span>Frequency: <strong>{tool.frequency}</strong></span>
          </div>

          {tool.algorithm && (
            <div>
              <p className="text-xs font-bold text-slate-700 mb-1.5">Algorithm / Protocol:</p>
              <div className="space-y-1.5">
                {tool.algorithm.map((step, i) => (
                  <div key={i} className="flex gap-2 text-xs">
                    <span className="flex-shrink-0 font-semibold text-slate-500 min-w-[90px]">{step.age}</span>
                    <span className="text-slate-700 leading-relaxed">{step.check}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tool.questions && (
            <div>
              <p className="text-xs font-bold text-slate-700 mb-1.5">Key Screening Questions:</p>
              <ol className="space-y-1">
                {tool.questions.map((q, i) => (
                  <li key={i} className="text-xs text-slate-700 flex items-start gap-1.5">
                    <span className="font-bold text-slate-400 min-w-[18px]">{i + 1}.</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {tool.scoring && (
            <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
              <strong>Scoring: </strong>{tool.scoring}
            </div>
          )}

          {tool.redFlags && (
            <div>
              <p className="text-xs font-bold text-red-700 mb-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Red Flags — Refer Immediately:
              </p>
              <ul className="space-y-1">
                {tool.redFlags.map((flag, i) => (
                  <li key={i} className="text-xs text-red-800 flex items-start gap-1.5 p-1.5 bg-red-50 rounded border border-red-100">
                    <AlertTriangle className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
                    {flag}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tool.action && (
            <div className="p-2.5 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-xs font-bold text-green-800 mb-1 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Action Protocol:
              </p>
              <p className="text-xs text-green-900 leading-relaxed">{tool.action}</p>
            </div>
          )}

          {tool.references && (
            <div className="flex flex-wrap gap-1">
              {tool.references.map((r, i) => (
                <Badge key={i} variant="outline" className="text-xs">{r}</Badge>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

export default function IAPScreeningTools() {
  const [activeSection, setActiveSection] = useState("screening");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
        <Shield className="w-6 h-6 text-green-700 flex-shrink-0" />
        <div>
          <h2 className="font-bold text-green-900 text-sm">IAP Screening Tools & Calculators</h2>
          <p className="text-xs text-green-700">IAP 2023 · WHO · NHM India · AAP — Complete screening algorithms for General Pediatricians</p>
        </div>
      </div>

      {/* Section nav */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: "screening", label: "Screening Algorithms", icon: Microscope },
          { id: "vaccines", label: "IAP Vaccine Schedule", icon: Syringe },
          { id: "growth-calcs", label: "Growth Formulas", icon: Scale },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveSection(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap border transition-all flex-shrink-0 ${activeSection === tab.id ? "bg-green-600 text-white border-transparent" : "bg-white text-slate-600 border-slate-200"}`}>
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeSection === "screening" && (
        <div className="space-y-3">
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="w-4 h-4 text-blue-600" />
            <AlertDescription className="text-blue-800 text-xs">
              These screening tools follow <strong>IAP Standard Treatment Guidelines</strong> (iapindia.org/standard-treatment-guidelines/) and WHO recommendations. Tap any tool to expand the full algorithm.
            </AlertDescription>
          </Alert>
          {SCREENING_TOOLS.map(tool => (
            <ScreeningToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      )}

      {activeSection === "vaccines" && (
        <div className="space-y-3">
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="w-4 h-4 text-blue-600" />
            <AlertDescription className="text-blue-800 text-xs">
              <strong>IAP Recommended Immunization Schedule 2023.</strong> NIS (National Immunization Schedule) vaccines are free. IAP-recommended vaccines include additional vaccines beyond NIS.
            </AlertDescription>
          </Alert>
          {IAP_VACCINES_QUICK.map((row, i) => (
            <Card key={i} className="border border-blue-100">
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  <div className="w-16 flex-shrink-0">
                    <Badge className="bg-blue-600 text-white text-xs w-full justify-center">{row.age}</Badge>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-1">
                      {row.vaccines.map((v, vi) => (
                        <Badge key={vi} variant="outline" className="text-xs">{v}</Badge>
                      ))}
                    </div>
                    {row.note && <p className="text-xs text-slate-500 mt-1">{row.note}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          <Alert className="bg-amber-50 border-amber-200">
            <AlertDescription className="text-amber-800 text-xs">
              <strong>India Catch-up:</strong> Any missed vaccines should be given as soon as possible (no restart). Check NIS and IAP website for latest updates. HPV for all genders from age 9-14 (IAP 2023 update).
            </AlertDescription>
          </Alert>
        </div>
      )}

      {activeSection === "growth-calcs" && (
        <div className="space-y-3">
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="w-4 h-4 text-blue-600" />
            <AlertDescription className="text-blue-800 text-xs">
              Quick estimation formulas for clinical use. For accurate assessment, always plot on WHO growth charts.
            </AlertDescription>
          </Alert>
          {GROWTH_CALCS.map((calc, i) => (
            <Card key={i} className="border border-slate-200">
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-green-100 text-green-700 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">{i + 1}</div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{calc.name}</p>
                    <p className="text-xs font-mono text-blue-800 bg-blue-50 rounded px-2 py-1 mt-1 inline-block">{calc.formula}</p>
                    {calc.note && <p className="text-xs text-slate-500 mt-0.5">{calc.note}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          <Card className="border border-green-200 bg-green-50">
            <CardContent className="p-3">
              <p className="text-xs font-bold text-green-800 mb-2">Drug Dosing Rules of Thumb</p>
              <div className="space-y-1.5">
                {[
                  "Paracetamol: 15 mg/kg/dose q4-6h (max 5 doses/24h, max 1g/dose)",
                  "Ibuprofen: 10 mg/kg/dose q6-8h (max 400mg/dose) — avoid <3 months",
                  "Amoxicillin: 40-90 mg/kg/day ÷ TDS (standard dose) — up to 3g/day",
                  "Azithromycin: 10 mg/kg day 1, then 5 mg/kg days 2-5",
                  "ORS: 75 mL/kg over 4h (some dehydration) OR 100 mL/kg IV (severe)",
                  "Gentamicin: 7.5 mg/kg/day OD (neonates: 5 mg/kg q36h for term)",
                  "Adrenaline (anaphylaxis): 0.01 mg/kg IM (max 0.5 mg) 1:1000",
                  "Salbutamol MDI: 2-6 puffs via spacer q20min (acute asthma)",
                ].map((d, i) => (
                  <p key={i} className="text-xs text-green-900 flex items-start gap-1.5">
                    <span className="font-bold text-green-600">→</span>
                    {d}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}