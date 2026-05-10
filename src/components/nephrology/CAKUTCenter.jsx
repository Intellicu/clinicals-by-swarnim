import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronDown, ChevronUp, Baby, AlertTriangle, Activity } from "lucide-react";

const CAKUT_CONDITIONS = [
  {
    id: "puv",
    name: "Posterior Urethral Valves (PUV)",
    urgency: "critical",
    ckd_risk: "High — 30–50% reach CKD3+ by adulthood",
    overview: "Most common cause of severe obstructive uropathy in males. Tissue folds at verumontanum obstruct urine flow → high-pressure bladder → bilateral hydronephrosis → renal dysplasia. Detected antenatally or at birth.",
    imaging: ["Antenatal USS: bilateral hydronephrosis + thick-walled bladder + oligohydramnios (severe)", "Postnatal USS: bilateral hydronephrosis + bladder wall thickening", "MCUG (mandatory): valve leaflets in posterior urethra → dilated posterior urethra", "MAG3 renogram: differential function + drainage (post-ablation)", "DMSA scan: cortical scarring + differential renal function"],
    surgical_triggers: ["Primary valve ablation cystoscopy: as soon as haemodynamically stable (after initial catheterisation)", "Vesicostomy: if infant too small for cystoscopy or unstable", "Urinary diversion if high-pressure bladder + failed ablation"],
    uti_prevention: ["Prophylactic antibiotics: Trimethoprim 1–2 mg/kg nocte until urological decision made", "Clean intermittent catheterisation (CIC) if bladder dysfunction post-ablation", "Circumcision: reduces UTI risk"],
    monitoring: ["Renal USS q6 months (first 2 years), annually thereafter", "Serum creatinine + eGFR q3 months initially", "Urinalysis for proteinuria q3 months", "BP monitoring q visit — early CKD indicator", "MAG3 renogram at 6–12 months post-ablation", "Urodynamics if bladder dysfunction suspected"],
    bp_surveillance: "BP at every visit from diagnosis. ACEi/ARB if hypertension + proteinuria develops (Stage 2+ CKD).",
    ckd_monitoring: "Nadir creatinine at age 1 year is strongest predictor of long-term renal outcome. eGFR <20 at age 1 = high ESKD risk.",
    long_term: ["30–50% reach CKD3+ by adulthood", "50% have voiding dysfunction (overactive bladder, VUR, secondary VURD syndrome)", "Annual review throughout childhood and adolescence", "Transition to adult urology + nephrology at 16–18y", "Fertility: may be impaired due to bladder/urethral involvement"],
    linked: ["vur", "cakut_general", "ckd_monitoring"],
    refs: ["BAUS/ESPU PUV Guidelines 2021", "IPNA CAKUT Guidelines 2019"],
  },
  {
    id: "vur",
    name: "Vesicoureteric Reflux (VUR)",
    urgency: "medium",
    ckd_risk: "Moderate — reflux nephropathy → CKD risk with scarring + recurrent UTIs",
    overview: "Retrograde flow of urine from bladder into ureter/kidney. Primary VUR: uretero-vesical junction incompetence. Secondary: high-pressure bladder (PUV, neurogenic). Grades I–V.",
    imaging: ["MCUG: gold standard — grade + laterality", "DMSA scan: cortical scarring (best at 4–6 months post-UTI)", "USS: hydronephrosis + renal size disparity", "MAG3: differential function + drainage", "Top-down DMSA approach: used as initial test in some centres (avoids MCUG in girls first)"],
    surgical_triggers: ["Grade IV–V with recurrent breakthrough UTIs on prophylaxis", "Grade III–V with progressive renal scarring on DMSA", "BBD-associated VUR: treat BBD first before considering surgery", "Subureteric injection (STING/HIT): minimally invasive first-line surgery"],
    uti_prevention: ["Continuous antibiotic prophylaxis: trimethoprim 1–2 mg/kg nocte (Grade III–V or recurrent UTI)", "Bladder and bowel dysfunction (BBD) treatment: urotherapy, biofeedback", "Prompt treatment of UTIs", "Circumcision (males)"],
    monitoring: ["Renal USS q12 months (Grade I–III stable)", "DMSA scan 4–6 months after first UTI (baseline scarring)", "Repeat DMSA if breakthrough UTI or clinical deterioration", "BP annually", "Urine PCR annually if scarring"],
    bp_surveillance: "Annual BP from diagnosis. Reflux nephropathy → hypertension risk (scar-related renin release).",
    ckd_monitoring: "Reflux nephropathy with bilateral scarring: high CKD risk. Annual eGFR + urine PCR if scarring present.",
    long_term: ["Grade I–III: 80% resolve spontaneously by age 5", "Grade IV–V: lower spontaneous resolution rate", "Bilateral renal scarring: CKD + hypertension into adulthood", "Pregnancy: reflux nephropathy → preeclampsia risk — inform patient and OBGYN"],
    linked: ["puv", "uti_pathway"],
    refs: ["EAU/ESPU VUR Guidelines 2022", "RIVUR Trial 2014"],
  },
  {
    id: "hypodysplasia",
    name: "Renal Hypodysplasia",
    urgency: "high",
    ckd_risk: "High — bilateral hypodysplasia → inevitable CKD progression",
    overview: "Kidneys smaller than 2 SD below mean (hypoplasia) with abnormal histological architecture (dysplasia — primitive tubules, metaplastic cartilage). Can be isolated or with CAKUT anomalies. FGFR2, PAX2, HNF1B, RET mutations.",
    imaging: ["Antenatal USS: bilateral small echogenic kidneys ± oligohydramnios", "Postnatal USS: kidney length <2 SD for age + increased echogenicity", "DMSA: cortical function + scarring differential", "MRI: detailed assessment if USS insufficient"],
    surgical_triggers: ["No specific surgery for hypodysplasia itself", "Treat associated anomalies (VUR, UPJO, PUV) as indicated"],
    uti_prevention: ["Prophylactic antibiotics if associated VUR or obstructive uropathy", "Prompt treatment of UTIs (poor reserve)"],
    monitoring: ["Renal USS q6 months (first 2 years)", "eGFR q3 months", "BP q visit", "Serum K+, bicarb, PO4, PTH (CKD-MBD surveillance)", "Urine PCR q3 months", "Growth + nutrition"],
    bp_surveillance: "High priority — reduced nephron mass → early HTN. ACEi/ARB from onset of proteinuria or HTN.",
    ckd_monitoring: "eGFR decline inevitable in bilateral disease. Plan RRT early (AV fistula at eGFR 20; PD catheter as alternative). Growth + nutrition optimisation essential.",
    long_term: ["Bilateral: ESKD common in 2nd–4th decade", "Unilateral: compensatory hypertrophy, usually good outcome", "Genetic counselling + family screening (HNF1B, PAX2)", "Annual review throughout childhood"],
    linked: ["ckd_monitoring", "cakut_general"],
    refs: ["IPNA CAKUT 2019", "ESCAPE Trial"],
  },
  {
    id: "solitary_kidney",
    name: "Solitary Kidney (Congenital/Acquired)",
    urgency: "medium",
    ckd_risk: "Moderate — compensatory hyperfiltration → focal FSGS → CKD progression in minority",
    overview: "Absence of one kidney (aplasia) or solitary functioning kidney (contralateral non-function). Compensatory hypertrophy occurs. Long-term risk: proteinuria, hypertension, CKD — lower than previously thought but requires monitoring.",
    imaging: ["USS: absent kidney on affected side; compensatory hypertrophy of remaining kidney", "DMSA: confirm function distribution (100% in solitary kidney)", "MRI urogram if anatomy unclear"],
    surgical_triggers: ["Treat associated anomalies (VUR, UPJ obstruction) to protect remaining kidney"],
    uti_prevention: ["Antibiotic prophylaxis if associated VUR", "Prompt treatment of any UTI (single kidney = no reserve)"],
    monitoring: ["Annual USS (solitary kidney size)", "Annual BP", "Annual urine PCR (KDIGO recommends — detect hyperfiltration proteinuria early)", "eGFR q12 months (baseline + trend)", "Avoid nephrotoxins absolutely"],
    bp_surveillance: "Annual BP. Start ACEi/ARB early if proteinuria develops (PCR >0.5 g/g) — regardless of BP.",
    ckd_monitoring: "Most children maintain normal GFR lifelong. 5–10% develop progressive CKD. Proteinuria = key early warning sign.",
    long_term: ["Counsel against contact sports (risk of direct trauma to single kidney)", "No participation in martial arts, rugby, American football without protective gear", "Pregnancy: increased risk of gestational HTN/proteinuria — obstetric nephrology referral", "Life insurance/military service: counsel about implications"],
    linked: ["vur", "fsgs"],
    refs: ["KDIGO CKD 2024", "Westland 2013 Pediatr Nephrol"],
  },
  {
    id: "upjo",
    name: "Ureteropelvic Junction Obstruction (UPJO)",
    urgency: "medium",
    ckd_risk: "Low if treated; high if untreated with severe hydronephrosis",
    overview: "Obstruction at UPJ → progressive hydronephrosis. Intrinsic (aperistaltic segment) or extrinsic (crossing vessel). Most detected antenatally. Severity graded by SFU/ESPU system.",
    imaging: ["Antenatal USS: unilateral hydronephrosis (most common)", "Postnatal USS at 48–72h + at 4–6 weeks", "MAG3 renogram: drainage curve + differential function (T1/2 >20 min = obstruction)", "DMSA: differential function (surgery if <40%)", "MRI urogram: anatomy if USS uncertain"],
    surgical_triggers: ["Differential function <40% on DMSA", "Progressive hydronephrosis on serial USS", "Symptomatic (pain, UTI, AKI episodes)", "T1/2 >60 min on MAG3 with deteriorating function", "Pyeloplasty: gold standard (laparoscopic/open)"],
    uti_prevention: ["Antibiotic prophylaxis: trimethoprim 1–2 mg/kg nocte if hydronephrosis grade III–IV", "Until surgically corrected or hydronephrosis resolves"],
    monitoring: ["Renal USS q3 months (first year), q6 months thereafter if stable", "MAG3 renogram q6–12 months if non-operative management", "DMSA if function concerns", "BP annually"],
    bp_surveillance: "Annual BP. Significant function loss → CKD → HTN risk.",
    ckd_monitoring: "After pyeloplasty: USS + MAG3 at 3 and 12 months. Long-term annual USS. eGFR if differential function was low pre-op.",
    long_term: ["80–90% resolve or improve spontaneously (mild–moderate)", "Post-pyeloplasty: excellent outcomes (function recovery in majority)", "Lifelong annual USS + BP if significant pre-op differential function loss"],
    linked: ["puv", "vur"],
    refs: ["EAU/ESPU Hydronephrosis Guidelines 2022"],
  },
  {
    id: "megaureter",
    name: "Primary Megaureter",
    urgency: "medium",
    ckd_risk: "Low if unilateral and function preserved; moderate if bilateral or recurrent UTIs",
    overview: "Ureter diameter >7mm. Primary: aperistaltic distal segment → obstructive (non-refluxing, non-obstructive, obstructing). Secondary: VUR or high-pressure bladder. Most resolve spontaneously.",
    imaging: ["Antenatal USS: dilated ureter ± hydronephrosis", "Postnatal USS at 48h + 4 weeks (confirm and grade)", "MCUG: exclude VUR-associated megaureter", "MAG3 renogram: drainage + differential function", "DMSA if function impaired"],
    surgical_triggers: ["Differential function <40% on MAG3/DMSA", "Progressive dilatation on serial USS", "Recurrent febrile UTIs despite prophylaxis", "Ureteric reimplantation: standard surgical correction"],
    uti_prevention: ["Antibiotic prophylaxis if dilated ureter or associated hydronephrosis", "Maintain until resolution or surgical correction"],
    monitoring: ["Renal USS q3 months (first year)", "MAG3 q6–12 months", "MCUG if USS appearances change"],
    bp_surveillance: "Annual BP if function impaired.",
    ckd_monitoring: "Most unilateral megaureter with good function: conservative management appropriate. Follow eGFR if bilateral.",
    long_term: ["60–70% resolve spontaneously by age 2–3", "Annual USS until resolution confirmed"],
    linked: ["vur", "upjo"],
    refs: ["EAU/ESPU Guidelines 2022"],
  },
  {
    id: "duplex",
    name: "Duplex Kidney / Duplex Systems",
    urgency: "low",
    ckd_risk: "Low unless associated with significant obstruction or VUR",
    overview: "Complete or incomplete ureteral duplication. Upper pole moiety: ureterocele (obstructed → hydronephrosis) or ectopic ureter. Lower pole moiety: reflux (commonest). Weigert-Meyer rule: upper pole ureter inserts medial + inferior.",
    imaging: ["USS: bilateral ureters to bladder + upper pole hydronephrosis", "MCUG: VUR to lower pole (most common)", "MAG3: differential function per moiety (quantitative)", "DMSA: cortical scarring", "MRI urogram: detailed anatomy (best for ectopic ureter)"],
    surgical_triggers: ["Large ureterocele causing bladder outlet obstruction → endoscopic incision", "Non-functioning upper pole moiety with ureterocele → heminephrectomy", "Significant VUR to lower pole → ureteric reimplantation or STING"],
    uti_prevention: ["Prophylaxis if VUR or hydronephrosis present"],
    monitoring: ["Renal USS q6 months (first 2 years)", "DMSA at 6 months post-UTI if first presentation", "MCUG if clinical concern"],
    bp_surveillance: "Annual BP if VUR or renal scarring.",
    ckd_monitoring: "Usually excellent prognosis if function preserved. Bilateral significant pathology → monitor eGFR.",
    long_term: ["Isolated duplex without VUR/obstruction: no long-term impact", "Duplex with significant reflux or obstruction: follow CKD risk markers"],
    linked: ["vur"],
    refs: ["EAU/ESPU Guidelines 2022"],
  },
  {
    id: "mcdk",
    name: "Multicystic Dysplastic Kidney (MCDK)",
    urgency: "low",
    ckd_risk: "Low for unilateral; moderate if contralateral kidney abnormal",
    overview: "Non-functioning kidney replaced by multiple non-communicating cysts; atretic ureter. Involutes spontaneously in 40–60% by age 5. Contralateral kidney compensation usually adequate.",
    imaging: ["Antenatal USS: multiple non-communicating cysts of varying sizes, no renal parenchyma", "Postnatal USS: confirm + contralateral kidney size", "DMSA: no function in MCDK side (confirm)", "MCUG: VUR in contralateral kidney (10–20% — important to detect)"],
    surgical_triggers: ["Hypertension not responding to medical management (renin-secreting MCDK — rare)", "Massive cysts causing mass effect", "Concern for Wilms tumour development (controversial — very rare)", "Most MCDK: expectant management only"],
    uti_prevention: ["Antibiotic prophylaxis only if contralateral VUR present"],
    monitoring: ["Renal USS q6 months (MCDK involution monitoring)", "Contralateral kidney size (compensatory hypertrophy)", "Annual BP", "Annual urinalysis", "eGFR baseline at age 1, then annually if contralateral abnormality"],
    bp_surveillance: "Annual BP. Bilateral anomaly or hypertension → early ACEi/ARB.",
    ckd_monitoring: "Unilateral MCDK with normal contralateral: good prognosis. Bilateral MCDK: incompatible with life (severe oligohydramnios). Contralateral abnormality: CKD risk.",
    long_term: ["Unilateral MCDK: 40–60% involute by age 5", "Standard school activities; avoid contact sports with protective equipment advice", "If contralateral normal: life expectancy normal", "Annual review until involution confirmed, then 2-yearly"],
    linked: ["solitary_kidney", "vur"],
    refs: ["BAUS/ESPU MCDK Position 2021", "Routh 2007 J Pediatr"],
  },
];

const URGENCY_COLORS = {
  critical: "border-red-200 bg-red-50",
  high: "border-amber-200 bg-amber-50",
  medium: "border-blue-100 bg-blue-50",
  low: "border-green-100 bg-green-50",
};

const URGENCY_BADGE = {
  critical: "bg-red-100 text-red-800",
  high: "bg-amber-100 text-amber-800",
  medium: "bg-blue-100 text-blue-800",
  low: "bg-green-100 text-green-800",
};

const CAKUT_TABS = [
  { id: "overview", label: "📋 Overview" },
  { id: "imaging", label: "🖼️ Imaging" },
  { id: "surgery", label: "🔪 Surgery" },
  { id: "monitoring", label: "📊 Monitoring" },
  { id: "longterm", label: "⏳ Long-term" },
];

function CAKUTCard({ condition }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("overview");

  return (
    <Card className={`border-2 ${URGENCY_COLORS[condition.urgency]}`}>
      <CardHeader className="pb-2 cursor-pointer" onClick={() => setOpen(o => !o)}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Baby className="w-4 h-4 text-blue-600" />
              <span className="font-bold text-sm text-slate-900">{condition.name}</span>
              <Badge className={`text-xs border-0 ${URGENCY_BADGE[condition.urgency]}`}>{condition.urgency}</Badge>
            </div>
            <p className="text-xs text-slate-500">CKD Risk: {condition.ckd_risk}</p>
          </div>
          {open ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
        </div>
      </CardHeader>

      {open && (
        <CardContent className="pt-0 space-y-3">
          <div className="flex gap-1 flex-wrap border-b pb-2">
            {CAKUT_TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors ${tab === t.id ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                {t.label}
              </button>
            ))}
          </div>

          {tab === "overview" && (
            <div className="space-y-2">
              <p className="text-xs text-slate-700 leading-relaxed bg-white border border-slate-200 rounded p-2">{condition.overview}</p>
              <div className="bg-amber-50 border border-amber-200 rounded p-2">
                <p className="text-xs font-bold text-amber-800 mb-1">⚠️ CKD Risk</p>
                <p className="text-xs text-amber-900">{condition.ckd_risk}</p>
              </div>
              {condition.bp_surveillance && (
                <div className="bg-red-50 border border-red-200 rounded p-2">
                  <p className="text-xs font-bold text-red-800 mb-1">❤️ BP Surveillance</p>
                  <p className="text-xs text-red-900">{condition.bp_surveillance}</p>
                </div>
              )}
            </div>
          )}

          {tab === "imaging" && (
            <div className="space-y-1.5">
              {condition.imaging?.map((i, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs p-2 bg-indigo-50 border border-indigo-100 rounded">
                  <span className="font-bold text-indigo-600 flex-shrink-0">{idx + 1}.</span>{i}
                </div>
              ))}
            </div>
          )}

          {tab === "surgery" && (
            <div className="space-y-2">
              {condition.surgical_triggers?.map((s, i) => (
                <div key={i} className="flex items-start gap-2 text-xs p-2 bg-purple-50 border border-purple-100 rounded">
                  <AlertTriangle className="w-3 h-3 text-purple-600 flex-shrink-0 mt-0.5" />{s}
                </div>
              ))}
              {condition.uti_prevention?.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded p-2">
                  <p className="text-xs font-bold text-green-800 mb-1">UTI Prevention</p>
                  {condition.uti_prevention.map((u, i) => <p key={i} className="text-xs text-green-900">• {u}</p>)}
                </div>
              )}
            </div>
          )}

          {tab === "monitoring" && (
            <div className="space-y-1.5">
              {condition.monitoring?.map((m, i) => (
                <div key={i} className="flex items-start gap-2 text-xs p-2 bg-teal-50 border border-teal-100 rounded">
                  <Activity className="w-3 h-3 text-teal-600 flex-shrink-0 mt-0.5" />{m}
                </div>
              ))}
              {condition.ckd_monitoring && (
                <div className="bg-slate-50 border border-slate-200 rounded p-2">
                  <p className="text-xs font-bold text-slate-700 mb-1">CKD Monitoring Protocol</p>
                  <p className="text-xs text-slate-700">{condition.ckd_monitoring}</p>
                </div>
              )}
            </div>
          )}

          {tab === "longterm" && (
            <div className="space-y-1.5">
              {condition.long_term?.map((l, i) => (
                <div key={i} className="flex items-start gap-2 text-xs p-2 bg-blue-50 border border-blue-100 rounded">
                  <span className="font-bold text-blue-600 flex-shrink-0">•</span>{l}
                </div>
              ))}
              {condition.refs && <p className="text-xs text-slate-400">📚 {condition.refs.join(" · ")}</p>}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

export default function CAKUTCenter() {
  const [filter, setFilter] = useState("All");
  const urgencies = ["All", "critical", "high", "medium", "low"];
  const filtered = filter === "All" ? CAKUT_CONDITIONS : CAKUT_CONDITIONS.filter(c => c.urgency === filter);

  return (
    <div className="space-y-3">
      <Alert className="bg-blue-50 border-blue-200">
        <Baby className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-xs text-blue-900">
          <strong>CAKUT Centre:</strong> {CAKUT_CONDITIONS.length} structural renal anomalies — imaging pathways, CKD risk stratification, BP surveillance, surgical referral triggers, UTI prevention, long-term monitoring.
        </AlertDescription>
      </Alert>
      <div className="flex gap-1.5 flex-wrap">
        {urgencies.map(u => (
          <button key={u} onClick={() => setFilter(u)}
            className={`text-xs px-3 py-1.5 rounded-full border font-semibold transition-all capitalize ${filter === u ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"}`}>
            {u === "All" ? "All CAKUT" : u}
          </button>
        ))}
      </div>
      {filtered.map(c => <CAKUTCard key={c.id} condition={c} />)}
    </div>
  );
}