import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronDown, ChevronUp, Calculator, Activity, AlertTriangle } from "lucide-react";

// ── Endocrine Calculators ─────────────────────────────────────────────────────
function CalcCard({ title, children, color = "blue" }) {
  const [open, setOpen] = useState(false);
  const colors = {
    blue: "bg-blue-600", green: "bg-green-600", purple: "bg-purple-600",
    orange: "bg-orange-600", teal: "bg-teal-600", rose: "bg-rose-600",
  };
  return (
    <Card className="bg-white border border-slate-200">
      <button onClick={() => setOpen(v => !v)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-t-xl text-left ${open ? colors[color] + " text-white" : "bg-slate-50 hover:bg-slate-100 text-slate-800"}`}>
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4" />
          <span className="text-sm font-bold">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {open && <CardContent className="p-4">{children}</CardContent>}
    </Card>
  );
}

function MidParentalHeight() {
  const [fh, setFh] = useState(""); const [mh, setMh] = useState(""); const [sex, setSex] = useState("male");
  const result = fh && mh ? (sex === "male" ? (parseFloat(fh) + parseFloat(mh) + 13) / 2 : (parseFloat(fh) + parseFloat(mh) - 13) / 2) : null;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1">Father Ht (cm)</label>
          <input type="number" value={fh} onChange={e => setFh(e.target.value)} className="w-full h-9 px-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1">Mother Ht (cm)</label>
          <input type="number" value={mh} onChange={e => setMh(e.target.value)} className="w-full h-9 px-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1">Child Sex</label>
          <select value={sex} onChange={e => setSex(e.target.value)} className="w-full h-9 px-2 text-sm rounded-lg border border-slate-300 focus:outline-none">
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
      </div>
      {result && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs font-semibold text-slate-600">Mid-Parental Height (Target)</p>
          <p className="text-2xl font-black text-blue-700">{result.toFixed(1)} cm</p>
          <p className="text-xs text-slate-500 mt-1">Normal range: ±8.5 cm (boys) / ±8 cm (girls)</p>
        </div>
      )}
    </div>
  );
}

function BonesAgeCalculator() {
  const [ba, setBa] = useState(""); const [ht, setHt] = useState(""); const [sex, setSex] = useState("male");
  // Simple predicted adult height (Bayley-Pinneau concept, simplified)
  // Use Roche-Wainer-Thissen simplified: PAH ≈ Current Height / (BA/20) for rough estimate
  const result = ba && ht ? (() => {
    const baF = parseFloat(ba); const htF = parseFloat(ht);
    // Simplified Bayley-Pinneau percent-of-adult from bone age
    const bpPercent = sex === "male"
      ? [0,0,0,0,0,0,0,0,0,0,0,0,0,0, 72,76,81,86,91,96,98,100,100,100,100][Math.min(Math.round(baF),24)] || 72
      : [0,0,0,0,0,0,0,0,0,0,0,0,0,0, 78,84,90,95,98,100,100,100,100,100,100][Math.min(Math.round(baF),24)] || 78;
    const pah = (htF / bpPercent) * 100;
    return { pah: pah.toFixed(1), bpPercent };
  })() : null;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1">Bone Age (years)</label>
          <input type="number" step="0.5" value={ba} onChange={e => setBa(e.target.value)} className="w-full h-9 px-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-300" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1">Current Ht (cm)</label>
          <input type="number" value={ht} onChange={e => setHt(e.target.value)} className="w-full h-9 px-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-300" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1">Sex</label>
          <select value={sex} onChange={e => setSex(e.target.value)} className="w-full h-9 px-2 text-sm rounded-lg border border-slate-300 focus:outline-none">
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
      </div>
      {result && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
          <p className="text-xs font-semibold text-slate-600">Predicted Adult Height (Bayley-Pinneau)</p>
          <p className="text-2xl font-black text-purple-700">{result.pah} cm</p>
          <p className="text-xs text-slate-500 mt-1">At BA {ba}y, child has achieved ~{result.bpPercent}% of adult height</p>
        </div>
      )}
    </div>
  );
}

function HbA1cConverter() {
  const [hba1c, setHba1c] = useState("");
  const avgGlucose = hba1c ? (28.7 * parseFloat(hba1c) - 46.7).toFixed(0) : null;
  const ifcc = hba1c ? ((parseFloat(hba1c) - 2.15) / 0.0915).toFixed(0) : null;
  const category = hba1c ? (parseFloat(hba1c) < 5.7 ? "Normal" : parseFloat(hba1c) < 6.5 ? "Pre-diabetes / HbA1c target if T1DM <7%" : parseFloat(hba1c) < 7 ? "Good control (T1DM target)" : parseFloat(hba1c) < 8 ? "Acceptable (T1DM)" : "Poor control") : null;
  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-semibold text-slate-600 block mb-1">HbA1c (% NGSP/DCCT)</label>
        <input type="number" step="0.1" value={hba1c} onChange={e => setHba1c(e.target.value)} placeholder="e.g. 7.5"
          className="w-full h-9 px-3 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-green-300" />
      </div>
      {avgGlucose && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-1">
          <p className="text-xs font-semibold text-slate-600">eAG (estimated average glucose)</p>
          <p className="text-2xl font-black text-green-700">{avgGlucose} mg/dL</p>
          <p className="text-xs text-slate-500">IFCC: {ifcc} mmol/mol</p>
          <Badge className={`text-xs ${parseFloat(hba1c) < 7 ? "bg-green-100 text-green-800" : parseFloat(hba1c) < 8 ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}`}>{category}</Badge>
        </div>
      )}
      <div className="text-xs text-slate-500 bg-slate-50 rounded-lg p-2">
        <strong>ADA/ISPAD targets:</strong> T1DM children &lt;7% (ideally) · Avoid hypoglycaemia in &lt;6y → target &lt;8%
      </div>
    </div>
  );
}

function InsulinDose() {
  const [wt, setWt] = useState(""); const [phase, setPhase] = useState("honeymoon");
  const doses = {
    honeymoon: { total: 0.3, label: "Honeymoon phase (newly diagnosed)" },
    prepubertal: { total: 0.7, label: "Pre-pubertal (stable)" },
    pubertal: { total: 1.0, label: "Pubertal (increased IR)" },
    sick: { total: 1.2, label: "Sick day / high requirement" },
  };
  const d = doses[phase];
  const total = wt && d ? (parseFloat(wt) * d.total).toFixed(1) : null;
  const basal = total ? (parseFloat(total) * 0.5).toFixed(1) : null;
  const bolus = total ? (parseFloat(total) * 0.5).toFixed(1) : null;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1">Weight (kg)</label>
          <input type="number" value={wt} onChange={e => setWt(e.target.value)} className="w-full h-9 px-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-300" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1">Phase</label>
          <select value={phase} onChange={e => setPhase(e.target.value)} className="w-full h-9 px-2 text-sm rounded-lg border border-slate-300 focus:outline-none">
            {Object.entries(doses).map(([k, v]) => <option key={k} value={k}>{v.label.split(' (')[0]}</option>)}
          </select>
        </div>
      </div>
      {total && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 space-y-2">
          <p className="text-xs text-slate-600">{d.label}</p>
          <p className="text-xl font-black text-orange-700">TDD = {total} units/day</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white rounded-lg p-2 border border-orange-200 text-center">
              <p className="text-xs text-slate-500">Basal (50%)</p>
              <p className="text-lg font-bold text-slate-800">{basal} U</p>
            </div>
            <div className="bg-white rounded-lg p-2 border border-orange-200 text-center">
              <p className="text-xs text-slate-500">Bolus (50%)</p>
              <p className="text-lg font-bold text-slate-800">{bolus} U</p>
            </div>
          </div>
          <p className="text-xs text-slate-500">Divide bolus ~evenly across 3 meals. Adjust based on SMBG. Not a substitute for clinical assessment.</p>
        </div>
      )}
    </div>
  );
}

function LevothyroxineDose() {
  const [age, setAge] = useState(""); const [wt, setWt] = useState("");
  const doseRanges = [
    { maxAge: 3, range: "10–15 mcg/kg/day", note: "Neonatal/infant — critical for brain development" },
    { maxAge: 12, range: "6–10 mcg/kg/day", note: "3–12 months" },
    { maxAge: 36, range: "5–6 mcg/kg/day", note: "1–3 years" },
    { maxAge: 72, range: "4–5 mcg/kg/day", note: "3–6 years" },
    { maxAge: 144, range: "3–4 mcg/kg/day", note: "6–12 years" },
    { maxAge: 216, range: "2–3 mcg/kg/day", note: ">12 years / adolescent" },
  ];
  const ageNum = parseFloat(age); const wtNum = parseFloat(wt);
  const bucket = doseRanges.find(r => ageNum <= r.maxAge) || doseRanges[doseRanges.length - 1];
  const [low, high] = bucket.range.match(/[\d.]+/g).map(Number);
  const lowDose = wtNum && low ? (wtNum * low).toFixed(0) : null;
  const highDose = wtNum && high ? (wtNum * high).toFixed(0) : null;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1">Age (months)</label>
          <input type="number" value={age} onChange={e => setAge(e.target.value)} className="w-full h-9 px-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-300" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1">Weight (kg)</label>
          <input type="number" value={wt} onChange={e => setWt(e.target.value)} className="w-full h-9 px-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-300" />
        </div>
      </div>
      {ageNum > 0 && (
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
          <p className="text-xs text-slate-600 mb-1">{bucket.note}</p>
          <p className="text-sm font-bold text-teal-800">Dose: {bucket.range}</p>
          {lowDose && highDose && (
            <p className="text-xl font-black text-teal-700 mt-1">{lowDose}–{highDose} mcg/day</p>
          )}
          <p className="text-xs text-slate-500 mt-1">Give once daily on empty stomach. Monitor TSH q4-6wk initially.</p>
        </div>
      )}
    </div>
  );
}

// ── Endocrine Pathways ────────────────────────────────────────────────────────
const ENDO_PATHWAYS = [
  {
    id: "diabetes",
    title: "Type 1 Diabetes (T1DM)",
    color: "bg-blue-600",
    badge: "bg-blue-100 text-blue-800",
    criteria: ["Polyuria, polydipsia, weight loss in a child", "Random BG >200 mg/dL + symptoms", "Fasting BG ≥126 mg/dL on 2 occasions", "HbA1c ≥6.5%", "C-peptide low/undetectable", "Autoantibodies: GAD, IAA, IA-2, ZnT8"],
    management: ["DKA: IV fluids (normal saline), insulin infusion 0.05-0.1 U/kg/hr, electrolyte correction", "Stable: Start basal-bolus regimen; TDD 0.5-1 U/kg/day", "CSII (pump) if available; sensor-augmented preferred", "Carbohydrate counting: 1 unit per 15g CHO (adjust per ICR)", "Correction factor: 1 unit drops glucose by 50mg/dL (1800 rule ÷ TDD)", "Sick day rules: never stop insulin; check ketones; increase fluid", "HbA1c target: <7% (ADA) / <7.5% (ISPAD); avoid hypoglycaemia", "Screening: annual ophthalmology, nephrology, lipids, thyroid, coeliac (after 5y)"],
    monitoring: ["SMBG 4x/day (pre-meal + bedtime) OR CGM", "HbA1c every 3 months", "Annual: urine albumin:creatinine, lipids, TSH, coeliac antibodies", "BP at every visit", "Injection site rotation check", "Hypoglycaemia frequency (target: none severe)"],
    refs: ["ISPAD 2022", "ADA Standards 2024", "IAP T1DM Guidelines"],
  },
  {
    id: "hypothyroid",
    title: "Congenital & Acquired Hypothyroidism",
    color: "bg-teal-600",
    badge: "bg-teal-100 text-teal-800",
    criteria: ["Congenital: NBS TSH >20 mIU/L (recall), confirm with serum TSH + free T4", "Acquired: goitre, growth failure, weight gain, constipation, cold intolerance, bradycardia", "TSH >10 mIU/L + low fT4 = overt hypothyroidism", "TSH 4.5–10 mIU/L + normal fT4 = subclinical hypothyroidism", "Autoimmune (Hashimoto): TPO antibodies, hypoechoic thyroid on US"],
    management: ["Congenital: Start LT4 within 2 weeks of birth (10-15 mcg/kg/day); critical for IQ", "Acquired: LT4 (see dose calculator); adjust by TSH q4-6wk then q6mo", "Give on empty stomach; avoid soy, iron, calcium within 4h", "Hashimoto's: replace only if TSH >10 or symptomatic", "Goitre: reassess at 6–12 months; most regress", "TSH target: 0.5–2.0 mIU/L (neonates); 0.5–3.0 mIU/L (children)"],
    monitoring: ["TSH + fT4: q2wk initially → q3mo → q6mo when stable", "Height/weight velocity at every visit", "Developmental milestones (especially if congenital)", "Bone age if growth failure", "TPO antibody titres q1-2y"],
    refs: ["ETA 2022", "ATA Guidelines 2023", "IAP Guidelines"],
  },
  {
    id: "short-stature",
    title: "Short Stature Evaluation",
    color: "bg-purple-600",
    badge: "bg-purple-100 text-purple-800",
    criteria: ["Height <-2SD or <3rd centile for age/sex", "Height velocity <4 cm/year (prepubertal)", "Familial: within parental target height range; bone age = chronological age", "Constitutional: delayed BA, puberty; positive family history", "Pathological: bone age retarded; growth velocity low; below MPH range"],
    management: ["Step 1: Plot on growth chart; calculate MPH; assess growth velocity (need 6-12m data)", "Step 2: Bone age X-ray (left wrist)", "Step 3: Screen: CBC, ESR, TFT, LFT, RFT, coeliac IgA, IGF-1, IGFBP-3, karyotype (girls)", "GH deficiency: GH stimulation test (2 provocation tests needed); peak GH <10 ng/mL", "GH therapy: 0.025-0.05 mg/kg/day SC daily; response: catch-up >2 cm/yr above velocity", "Turner syndrome: GH + estrogen at appropriate age", "Hypothyroid short stature: responds to LT4", "CDGP: reassurance; if distressed, low-dose androgen/estrogen for 3-6m"],
    monitoring: ["Height velocity every 3-6 months", "IGF-1 during GH therapy (target upper normal)", "Bone age yearly", "HbA1c annually during GH therapy", "Fundoscopy: if increased ICP suspected"],
    refs: ["GRS Growth Hormone Guidelines 2019", "ESPE 2023", "IAP Short Stature Guidelines"],
  },
  {
    id: "puberty",
    title: "Precocious & Delayed Puberty",
    color: "bg-rose-600",
    badge: "bg-rose-100 text-rose-800",
    criteria: ["Precocious: breast dev <8y (girls), testicular vol >4mL or pubic hair <9y (boys)", "Central (GnRH-dependent): pulsatile LH, advanced BA", "Peripheral (GnRH-independent): flat LH on GnRH stimulation", "Delayed puberty: no breast by 13y (girls), no testicular vol >4mL by 14y (boys)", "Primary (hypergonadotropic): high LH/FSH; secondary (hypogonadotropic): low/normal"],
    management: ["Precocious central: GnRHa (Triptorelin/Leuprolide) monthly IM; continue until appropriate age", "McCune-Albright: aromatase inhibitor (anastrozole/letrozole)", "Adrenal: glucocorticoid suppression (CAH)", "Delayed: if CDGP: watchful waiting vs low-dose sex steroids for 3-6m", "Hypogonadotropic: MRI pituitary; treat underlying cause; pubertal induction at 12-14y", "Hypergonadotropic: pubertal induction; fertility counselling"],
    monitoring: ["6-monthly height/weight and pubertal staging (Tanner)", "Bone age 6-monthly during treatment", "LH/FSH/Estradiol/Testosterone levels", "Pelvic US (girls) for uterine size and ovarian volume", "GnRHa: injection site reactions, BMD monitoring if prolonged"],
    refs: ["GRS Precocious Puberty 2019", "Endocrine Society Guidelines 2023", "ISPAD", "IAP"],
  },
  {
    id: "cah",
    title: "Congenital Adrenal Hyperplasia (CAH)",
    color: "bg-amber-600",
    badge: "bg-amber-100 text-amber-800",
    criteria: ["Classic salt-wasting: neonatal adrenal crisis, ambiguous genitalia (girls)", "Classic simple virilising: virilised females, tall stature, advanced BA", "Non-classic: premature pubarche, PCOS-like in adolescent girls, acne", "21-hydroxylase deficiency: 17-OHP elevated (>100 ng/dL baseline; >1000 on stimulation)", "Na low, K high, renin high, aldosterone low (salt-wasting)"],
    management: ["ACUTE CRISIS: IV normal saline 20mL/kg bolus; Hydrocortisone IV 50-100 mg/m²/dose STAT", "Maintenance: Hydrocortisone 10-15 mg/m²/day (3 divided doses)", "Fludrocortisone 0.05-0.2 mg/day + liberal salt in infants", "Stress dosing: 3x maintenance dose for fever/illness/surgery", "Genitoplasty: timing controversial; family counselling essential", "Non-classic: treat only if symptomatic; HC or OCP"],
    monitoring: ["17-OHP + androstenedione + renin: every 3-6 months", "Height/weight/growth velocity every visit", "Bone age annually", "Blood pressure (over-replacement effect)", "Adrenal crisis sick-day plan: all patients must have IM hydrocortisone kit"],
    refs: ["Endocrine Society CAH Guidelines 2018", "ESPE 2022", "IAP CAH Guidelines"],
  },
  {
    id: "obesity",
    title: "Pediatric Obesity & Metabolic Syndrome",
    color: "bg-green-600",
    badge: "bg-green-100 text-green-800",
    criteria: ["Obesity: BMI >95th centile for age/sex", "Severe obesity: BMI >120% of 95th centile or BMI >35 (whichever lower)", "Metabolic syndrome (3 of 5): waist circumference >90th centile, TG ≥150, HDL low, BP ≥90th, FBG ≥100", "Evaluate for: hypothyroidism, Cushing's, PCOS, Prader-Willi, pseudohypoparathyroidism"],
    management: ["Lifestyle: Family-based intervention; 60 min MVPA daily; screen time <2h/day <5y, <1h", "Diet: Avoid SSB; whole grains; reduce energy-dense foods; Mediterranean diet", "HAES approach: avoid weight stigma; focus on behaviours", "Pharmacotherapy (BMI >95th + comorbidities): Metformin (off-label T2DM); Orlistat (≥12y); Liraglutide/Semaglutide (≥12y, selected)", "Bariatric surgery: BMI >40 or >35 with comorbidities + adolescents who have completed growth"],
    monitoring: ["BP, waist circumference, BMI every visit", "Annual: FBG, lipids, LFT, TFT, 25-OH Vitamin D, insulin", "ALT for MASLD (fatty liver)", "Sleep study if snoring/OSA suspected", "PCOS screen in adolescent girls: LH/FSH, androgen levels"],
    refs: ["AAP Obesity Guidelines 2023", "IOTF 2023", "IAP Obesity Guidelines 2021"],
  },
];

function EndoPathwayCard({ pathway }) {
  const [open, setOpen] = useState(false);
  return (
    <Card className="bg-white border border-slate-200 shadow-sm overflow-hidden">
      <button onClick={() => setOpen(v => !v)}
        className={`w-full flex items-center justify-between px-4 py-3 text-left ${open ? pathway.color + " text-white" : "bg-slate-50 hover:bg-slate-100 text-slate-800"}`}>
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4" />
          <span className="font-bold text-sm">{pathway.title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {open && (
        <CardContent className="p-4 space-y-3">
          {[
            { label: "📋 Criteria / Diagnosis", items: pathway.criteria },
            { label: "🩺 Management", items: pathway.management },
            { label: "📊 Monitoring", items: pathway.monitoring },
          ].map(section => (
            <div key={section.label} className="border border-slate-200 rounded-lg overflow-hidden">
              <p className="bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700">{section.label}</p>
              <ul className="p-3 space-y-1">
                {section.items.map((item, i) => (
                  <li key={i} className="text-xs text-slate-700 flex items-start gap-1.5">
                    <span className="text-indigo-400 font-bold mt-0.5 min-w-[16px]">{i+1}.</span>{item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="flex flex-wrap gap-1">
            {pathway.refs.map((r, i) => <Badge key={i} variant="outline" className="text-xs">{r}</Badge>)}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default function EndocrineSection() {
  return (
    <div className="space-y-4">
      <Alert className="bg-purple-50 border-purple-200">
        <AlertTriangle className="w-4 h-4 text-purple-600" />
        <AlertDescription className="text-purple-800 text-xs">
          Endocrine calculations are guides only. Doses require clinical assessment, weight monitoring, and specialist review.
        </AlertDescription>
      </Alert>

      {/* Calculators */}
      <div>
        <p className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
          <Calculator className="w-4 h-4 text-purple-600" /> Endocrine Calculators
        </p>
        <div className="space-y-2">
          <CalcCard title="Mid-Parental Height (Target Height)" color="blue"><MidParentalHeight /></CalcCard>
          <CalcCard title="Predicted Adult Height (Bone Age)" color="purple"><BonesAgeCalculator /></CalcCard>
          <CalcCard title="HbA1c ↔ eAG Converter + Control Assessment" color="green"><HbA1cConverter /></CalcCard>
          <CalcCard title="Insulin Dose Estimator (T1DM)" color="orange"><InsulinDose /></CalcCard>
          <CalcCard title="Levothyroxine Dose Calculator" color="teal"><LevothyroxineDose /></CalcCard>
        </div>
      </div>

      {/* Pathways */}
      <div>
        <p className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
          <Activity className="w-4 h-4 text-purple-600" /> Endocrine Clinical Pathways
        </p>
        <div className="space-y-2">
          {ENDO_PATHWAYS.map(p => <EndoPathwayCard key={p.id} pathway={p} />)}
        </div>
      </div>
    </div>
  );
}