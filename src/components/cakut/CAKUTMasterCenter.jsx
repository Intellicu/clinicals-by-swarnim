import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Droplet, Activity, AlertTriangle, BookOpen, Brain, Stethoscope,
  ChevronRight, Eye, Microscope, TestTube, Heart, Baby, ChevronDown, ChevronUp,
  Zap, Shield, Clock, TrendingUp
} from "lucide-react";

const DISEASES = [
  {
    id: "anh",
    name: "Antenatal Hydronephrosis",
    icon: "🫁",
    color: "bg-blue-50 border-blue-200",
    badge: "bg-blue-100 text-blue-700",
    urgency: "Monitor",
    prevalence: "1–5% pregnancies",
    summary: "APD-based grading → UTD/SFU classification. Most transient, ~10% need intervention.",
    keyPoints: ["UTD classification A1/A2-3", "APD >10mm third trimester = significant", "Postnatal imaging at 48h if bilateral/high grade", "MAG3 for obstruction assessment"],
    redFlags: ["Oligohydramnios", "Bilateral severe grade", "Solitary kidney", "Suspected PUV"],
  },
  {
    id: "vur",
    name: "Vesicoureteral Reflux",
    icon: "🔄",
    color: "bg-cyan-50 border-cyan-200",
    badge: "bg-cyan-100 text-cyan-700",
    urgency: "Grade-dependent",
    prevalence: "~30% after febrile UTI",
    summary: "Grades I–V by VCUG. Risk stratification drives CAP vs surveillance vs surgery.",
    keyPoints: ["VCUG gold standard", "DMSA for scar detection", "CAP for Grade III–IV + bladder dysfunction", "Deflux for Grade III–IV breakthrough UTI"],
    redFlags: ["Recurrent febrile UTI", "DMSA scar", "Hypertension", "Proteinuria", "BBD co-existence"],
  },
  {
    id: "puv",
    name: "Posterior Urethral Valves",
    icon: "🚧",
    color: "bg-red-50 border-red-200",
    badge: "bg-red-100 text-red-700",
    urgency: "Urgent",
    prevalence: "1/5000 male births",
    summary: "Most severe congenital uropathy. Keyhole sign on fetal US. ~30% progress to ESKD.",
    keyPoints: ["Keyhole sign antenatally", "Neonatal urethral catheter drainage", "Creatinine nadir by day 7–10 predicts outcome", "Valve bladder syndrome in long-term"],
    redFlags: ["Oligohydramnios", "Bilateral hydroureteronephrosis", "Creatinine nadir >0.8 mg/dL", "Bladder dysfunction"],
  },
  {
    id: "nb",
    name: "Neurogenic Bladder",
    icon: "🧠",
    color: "bg-purple-50 border-purple-200",
    badge: "bg-purple-100 text-purple-700",
    urgency: "High — upper tract risk",
    prevalence: "~1/1000 (mostly MMC)",
    summary: "Spinal dysraphism commonest cause. UDS-driven management. CIC + anticholinergics = standard.",
    keyPoints: ["UDS mandatory at 3 months", ">40 cmH₂O DLPP = upper tract risk", "CIC + oxybutynin first-line", "Annual renal surveillance"],
    redFlags: ["DLPP >40 cmH₂O", "Low compliance", "Hydronephrosis progression", "Febrile UTI on CIC"],
  },
  {
    id: "upjo",
    name: "Ureteropelvic Junction Obstruction",
    icon: "🔗",
    color: "bg-amber-50 border-amber-200",
    badge: "bg-amber-100 text-amber-700",
    urgency: "Monitor/Selective surgery",
    prevalence: "1/1500 births",
    summary: "Intrinsic obstruction at UPJ. MAG3 with diuretic washout drives surgery decision.",
    keyPoints: ["MAG3 T½ >20min = obstruction", "Split function <40% = surgical risk", "Pain, recurrent UTI = pyeloplasty", "Most improve spontaneously <2 years"],
    redFlags: ["Split function <35%", "Progressive loss on serial MAG3", "Recurrent pain/UTI", "Solitary kidney"],
  },
  {
    id: "megaureter",
    name: "Megaureter",
    icon: "📏",
    color: "bg-orange-50 border-orange-200",
    badge: "bg-orange-100 text-orange-700",
    urgency: "Grade-dependent",
    prevalence: "Rare, M>F",
    summary: "Primary/secondary, obstructive/refluxing. Most primary non-refluxing resolve spontaneously.",
    keyPoints: ["Ureter >7mm = megaureter", "MAG3 for obstruction", "VCUG to exclude reflux", "Surgery if progressive/symptomatic"],
    redFlags: ["Recurrent UTI", "Progressive dilation", "Split function loss", "Associated anomalies"],
  },
  {
    id: "ckd_renal",
    name: "Cystic Kidney Disease",
    icon: "💊",
    color: "bg-teal-50 border-teal-200",
    badge: "bg-teal-100 text-teal-700",
    urgency: "Genetic workup",
    prevalence: "ARPKD 1/20,000; ADPKD 1/1000",
    summary: "ARPKD (neonatal presentation, liver fibrosis) vs ADPKD (adult onset). Genetic testing essential.",
    keyPoints: ["ARPKD — PKHD1 gene", "ADPKD — PKD1/PKD2", "Hepatic fibrosis in ARPKD", "BP control cornerstone"],
    redFlags: ["Oligohydramnios/enlarged kidneys fetal", "Early ESKD", "Portal hypertension", "Intracranial aneurysm (ADPKD)"],
  },
  {
    id: "bbd",
    name: "Bladder-Bowel Dysfunction",
    icon: "⚙️",
    color: "bg-green-50 border-green-200",
    badge: "bg-green-100 text-green-700",
    urgency: "Common — often missed",
    prevalence: "~20% pediatric urology",
    summary: "BBD perpetuates VUR, causes recurrent UTI. Bowel management = cornerstone of treatment.",
    keyPoints: ["Bladder diary essential", "Bristol chart for bowel", "Timed voiding + double voiding", "Treat constipation aggressively"],
    redFlags: ["VUR not resolving despite CAP", "Recurrent UTI", "Renal scarring progression", "Psychosocial impact"],
  },
];

const DiseaseCard = ({ disease, onSelect }) => (
  <Card
    className={`border-2 ${disease.color} cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.01]`}
    onClick={() => onSelect(disease)}
  >
    <CardContent className="p-4">
      <div className="flex items-start gap-3">
        <span className="text-3xl">{disease.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-bold text-sm text-slate-800">{disease.name}</h3>
            <Badge className={`text-xs ${disease.badge}`}>{disease.urgency}</Badge>
          </div>
          <p className="text-xs text-slate-500 mb-2">{disease.prevalence}</p>
          <p className="text-xs text-slate-600 leading-relaxed">{disease.summary}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {disease.redFlags.slice(0, 2).map(f => (
              <span key={f} className="text-xs bg-red-50 text-red-600 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                <AlertTriangle className="w-2.5 h-2.5" />{f}
              </span>
            ))}
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />
      </div>
    </CardContent>
  </Card>
);

const TeachingOverlay = ({ disease }) => {
  const [mode, setMode] = useState("resident");
  const modes = [
    { id: "resident", label: "Resident", icon: "👨‍⚕️" },
    { id: "fellowship", label: "Fellowship", icon: "🎓" },
    { id: "consultant", label: "Consultant", icon: "👩‍💼" },
  ];
  const content = {
    resident: {
      title: "Core Concepts & Exam Pearls",
      points: disease.keyPoints,
      viva: ["What is the most important predictor of outcome in PUV?", "When do you perform VCUG in a child with febrile UTI?", "What is the DLPP threshold for upper tract risk in neurogenic bladder?"],
    },
    fellowship: {
      title: "Physiology, Trials & Controversies",
      points: ["RIVUR trial: CAP reduces febrile UTI by 50% in Grade II–IV VUR", "PREDICT trial: No difference in renal outcome VUR with vs without CAP", "Valve bladder syndrome pathophysiology: high-pressure, poorly compliant detrusor", "ARPKD — PKHD1 fibrocystin — collecting duct dilatation"],
      viva: ["Discuss RIVUR vs PREDICT controversy", "What is the role of vasopressin in ADPKD?", "Mechanism of valve bladder syndrome"],
    },
    consultant: {
      title: "Decision-Making & Escalation",
      points: ["Surgical escalation: Split function <35%, recurrent pain, progressive loss", "Augmentation indications: low compliance + failed medical therapy", "Mitrofanoff for CIC-dependent patients with poor hand function", "Tolvaptan in ADPKD: eGFR 25–65, rapid progression"],
      viva: ["When to refer for augmentation cystoplasty?", "Transplant eligibility in valve bladder syndrome?", "Management of cystinuria stone-forming child"],
    },
  };
  const active = content[mode];
  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {modes.map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border-2 ${mode === m.id ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"}`}
          >
            <span>{m.icon}</span>{m.label}
          </button>
        ))}
      </div>
      <Card className="bg-indigo-50 border-indigo-200">
        <CardContent className="p-4">
          <h4 className="font-bold text-indigo-800 text-sm mb-3">{active.title}</h4>
          <ul className="space-y-1.5 mb-4">
            {active.points.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                <span className="text-indigo-500 mt-0.5">●</span>{p}
              </li>
            ))}
          </ul>
          <div className="border-t border-indigo-200 pt-3">
            <p className="text-xs font-semibold text-indigo-700 mb-2">Viva / MCQ Questions:</p>
            {active.viva.map((q, i) => (
              <p key={i} className="text-xs text-slate-600 mb-1">Q{i + 1}: {q}</p>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const DiseaseDetail = ({ disease, onBack }) => {
  const pathwayContent = {
    anh: [
      { step: "Antenatal APD measurement", detail: "APD <7mm = low risk. APD 7–10mm = follow-up. APD >10mm = high grade." },
      { step: "UTD Classification", detail: "A1: mild, A2-3: moderate-severe. Risk stratification drives postnatal timing." },
      { step: "Postnatal US timing", detail: "24–48h for high grade/bilateral/solitary. Day 5–7 for mild unilateral." },
      { step: "VCUG indications", detail: "Bilateral, Grade 3+, recurrent UTI, dilated ureter, suspected PUV." },
      { step: "MAG3 indications", detail: "Persistent grade 3+ ANH at 1 month. Split function, T½ washout." },
      { step: "CAP", detail: "Trimethoprim/nitrofurantoin prophylaxis for significant ANH until imaging resolved." },
      { step: "Surgical review", detail: "Split function <40%, progressive, obstructive T½ → pyeloplasty." },
    ],
    vur: [
      { step: "VCUG grading", detail: "Grade I: ureter only. II: pelvicalyceal. III: mild dilation. IV: moderate. V: severe tortuosity." },
      { step: "DMSA scan", detail: "Acute: hot spots, dimercaptosuccinic acid uptake defect. Scar: permanent cold area." },
      { step: "CAP decision", detail: "Grade III–V + BBD or recurrent febrile UTI → TMP prophylaxis until resolution." },
      { step: "BBD assessment", detail: "Essential before any VUR intervention. Bladder diary, uroflowmetry, PVR." },
      { step: "Deflux", detail: "Grade II–IV, breakthrough UTI, poor compliance with prophylaxis. 80% success single injection." },
      { step: "Open/laparoscopic reimplantation", detail: "Grade IV–V, failed endoscopic, renal scar progression." },
    ],
    puv: [
      { step: "Antenatal detection", detail: "Keyhole sign: dilated posterior urethra + bladder. Bilateral HDN + oligohydramnios." },
      { step: "Neonatal stabilization", detail: "Urethral catheter (6–8 Fr). IV fluids for polyuria. Monitor electrolytes." },
      { step: "Creatinine nadir", detail: "Day 7–10 creatinine predicts long-term renal outcome. Nadir >0.8 = poor prognosis." },
      { step: "Cystoscopy + valve ablation", detail: "When stable. Electrocautery/cold knife at 5 and 7 o'clock." },
      { step: "Urodynamics", detail: "At 3–6 months. Assess compliance, overactivity, DSD." },
      { step: "Long-term surveillance", detail: "Annual eGFR, BP, proteinuria, UDS, bladder scan, growth." },
    ],
    nb: [
      { step: "Diagnosis", detail: "Spinal dysraphism, sacral agenesis, tethered cord, cerebral palsy." },
      { step: "Baseline UDS", detail: "At 3 months MMC. Assess DLPP, compliance, capacity, DSD." },
      { step: "CIC initiation", detail: "Start early if DLPP >40, low compliance, retention. 4–6 hourly." },
      { step: "Oxybutynin", detail: "0.1–0.2 mg/kg/dose TID. Increase compliance, reduce overactivity." },
      { step: "Renal surveillance", detail: "Annual USS, eGFR, DMSA if recurrent UTI." },
      { step: "Botox escalation", detail: "Failed oxybutynin + CIC. 10–12 units/kg into detrusor. 6-monthly." },
      { step: "Augmentation", detail: "Low compliance despite maximum medical. Ileocystoplasty." },
    ],
    default: [
      { step: "Initial assessment", detail: "History, USS, functional tests as appropriate." },
      { step: "Risk stratification", detail: "Based on imaging and function." },
      { step: "Medical management", detail: "CAP/antibiotics/bladder medication as indicated." },
      { step: "Surveillance", detail: "Regular imaging and functional monitoring." },
    ]
  };

  const pathway = pathwayContent[disease.id] || pathwayContent.default;

  return (
    <div className="space-y-4">
      {/* Back button */}
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors">
        <ChevronRight className="w-4 h-4 rotate-180" /> Back to all conditions
      </button>

      {/* Header */}
      <div className={`rounded-xl p-4 border-2 ${disease.color}`}>
        <div className="flex items-center gap-3">
          <span className="text-4xl">{disease.icon}</span>
          <div>
            <h2 className="text-xl font-bold text-slate-800">{disease.name}</h2>
            <p className="text-sm text-slate-500">{disease.prevalence}</p>
            <Badge className={`mt-1 ${disease.badge}`}>{disease.urgency}</Badge>
          </div>
        </div>
        <p className="mt-3 text-sm text-slate-600">{disease.summary}</p>
      </div>

      {/* Red Flags */}
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-3">
          <p className="text-xs font-bold text-red-700 mb-2 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Red Flags / Escalation Triggers
          </p>
          <div className="flex flex-wrap gap-1.5">
            {disease.redFlags.map(f => (
              <span key={f} className="text-xs bg-white text-red-700 border border-red-200 px-2 py-0.5 rounded-full">{f}</span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="pathway">
        <TabsList className="flex w-full h-auto overflow-x-auto bg-white border shadow-sm">
          <TabsTrigger value="pathway" className="text-xs flex-shrink-0">Clinical Pathway</TabsTrigger>
          <TabsTrigger value="keypoints" className="text-xs flex-shrink-0">Key Points</TabsTrigger>
          <TabsTrigger value="teaching" className="text-xs flex-shrink-0">Teaching</TabsTrigger>
          <TabsTrigger value="evidence" className="text-xs flex-shrink-0">Evidence</TabsTrigger>
        </TabsList>

        <TabsContent value="pathway" className="mt-3">
          <div className="space-y-2">
            {pathway.map((step, i) => (
              <Card key={i} className="border-slate-200">
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{step.step}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{step.detail}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="keypoints" className="mt-3">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <ul className="space-y-2">
                {disease.keyPoints.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="text-blue-500 mt-0.5 text-base">●</span>{p}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teaching" className="mt-3">
          <TeachingOverlay disease={disease} />
        </TabsContent>

        <TabsContent value="evidence" className="mt-3">
          <Card className="border-slate-200">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Key Evidence & Guidelines</p>
              {[
                { org: "EAU/ESPU 2022", text: "Guidelines on Pediatric Urology — VUR, ANH, PUV management" },
                { org: "KDIGO 2012", text: "CKD classification applicable to congenital uropathies" },
                { org: "AAP 2011/2016", text: "UTI guidelines — imaging following febrile UTI" },
                { org: "UTD Consensus 2014", text: "Urinary tract dilation classification system" },
                { org: "IPNA 2021", text: "Nephrotic syndrome — overlapping management with CAKUT" },
              ].map((e, i) => (
                <div key={i} className="border-b border-slate-100 pb-2 mb-2 last:border-0">
                  <Badge className="bg-slate-100 text-slate-600 text-xs mb-1">{e.org}</Badge>
                  <p className="text-xs text-slate-600">{e.text}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default function CAKUTMasterCenter() {
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");

  const filtered = DISEASES.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.summary.toLowerCase().includes(search.toLowerCase())
  );

  if (selected) return <DiseaseDetail disease={selected} onBack={() => setSelected(null)} />;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-r from-blue-700 to-cyan-600 p-5 text-white">
        <div className="flex items-center gap-3">
          <Droplet className="w-7 h-7" />
          <div>
            <h2 className="text-xl font-bold">CAKUT & Urology Master Center</h2>
            <p className="text-blue-100 text-sm">8 disease modules · Clinical pathways · AI interpretation · Resident teaching</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {["UTD Classification", "VCUG Grades", "UDS Patterns", "Surgical Escalation", "CAP Guidance"].map(t => (
            <span key={t} className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">{t}</span>
          ))}
        </div>
      </div>

      {/* Search */}
      <input
        className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl bg-white text-sm outline-none focus:border-blue-400"
        placeholder="Search conditions..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {/* Disease cards */}
      <div className="grid sm:grid-cols-2 gap-3">
        {filtered.map(d => (
          <DiseaseCard key={d.id} disease={d} onSelect={setSelected} />
        ))}
      </div>

      {/* Quick reference legend */}
      <Card className="border-slate-200 bg-slate-50">
        <CardContent className="p-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Quick Reference</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-slate-600">
            <div><span className="font-semibold">APD</span> — Antero-Posterior Diameter</div>
            <div><span className="font-semibold">UTD</span> — Urinary Tract Dilation</div>
            <div><span className="font-semibold">SFU</span> — Society for Fetal Urology</div>
            <div><span className="font-semibold">DLPP</span> — Detrusor Leak Point Pressure</div>
            <div><span className="font-semibold">CIC</span> — Clean Intermittent Catheterization</div>
            <div><span className="font-semibold">CAP</span> — Continuous Antibiotic Prophylaxis</div>
            <div><span className="font-semibold">MAG3</span> — Mercaptoacetyltriglycine scan</div>
            <div><span className="font-semibold">DMSA</span> — Dimercaptosuccinic acid scan</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}