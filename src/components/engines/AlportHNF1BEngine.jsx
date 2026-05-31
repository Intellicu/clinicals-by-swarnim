import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, ChevronRight, ArrowLeft } from "lucide-react";

// ── ALPORT ENGINE ──────────────────────────────────────────────
const ALPORT_QUESTIONS = [
  { id: "hematuria", label: "Persistent microscopic / macroscopic hematuria" },
  { id: "family_hematuria", label: "Family history of hematuria or CKD" },
  { id: "hearing_loss", label: "Sensorineural hearing loss (audiometry)" },
  { id: "ocular", label: "Anterior lenticonus / macular flecks (ophthalmology)" },
  { id: "early_esrd", label: "Family member with ESRD <50 years" },
  { id: "proteinuria", label: "Proteinuria (persistent)" },
  { id: "thin_gbm", label: "Thin GBM on EM (renal biopsy)" },
  { id: "male", label: "Male patient" },
  { id: "x_linked_fhx", label: "X-linked pattern (maternal family CKD, affected males)" },
];

function getAlportDx(ans) {
  const score = Object.values(ans).filter(Boolean).length;
  if (ans.x_linked_fhx && ans.male && (ans.hearing_loss || ans.ocular)) return { dx: "X-linked Alport Syndrome (XLAS)", gene: "COL4A5 (Xq22)", color: "bg-red-600", confidence: "High" };
  if (ans.family_hematuria && (ans.hearing_loss || ans.ocular) && !ans.x_linked_fhx) return { dx: "Autosomal Recessive Alport (ARAS)", gene: "COL4A3 or COL4A4", color: "bg-orange-600", confidence: "High" };
  if (ans.hematuria && ans.family_hematuria && !ans.hearing_loss && !ans.ocular) return { dx: "Thin Basement Membrane Disease (TBMN) / Autosomal Dominant Alport", gene: "COL4A3 or COL4A4 (heterozygous)", color: "bg-amber-500", confidence: "Moderate" };
  if (score >= 3) return { dx: "Alport Syndrome — subtype uncertain, genetic testing required", gene: "COL4A3/A4/A5 panel (NGS)", color: "bg-amber-600", confidence: "Moderate" };
  return { dx: "Alport less likely — consider other hereditary nephritis", gene: "Hematuria gene panel", color: "bg-green-600", confidence: "Low" };
}

// ── HNF1B ENGINE ──────────────────────────────────────────────
const HNF1B_QUESTIONS = [
  { id: "renal_cysts", label: "Renal cysts (bilateral, various sizes)", score: 3 },
  { id: "hypomagnesemia", label: "Hypomagnesaemia (Mg <0.65 mmol/L)", score: 3 },
  { id: "diabetes", label: "Diabetes / MODY5-type (late onset, no obesity)", score: 3 },
  { id: "genital_anomaly", label: "Genital anomalies (bicornuate uterus, epididymal cysts)", score: 3 },
  { id: "ckd_young", label: "CKD at young age unexplained", score: 2 },
  { id: "liver_abn", label: "Liver enzymes elevated (cholestasis, ductal paucity)", score: 2 },
  { id: "family_history", label: "Family history of renal cysts / diabetes", score: 2 },
  { id: "hyperuricemia", label: "Hyperuricaemia / gout (early onset)", score: 1 },
  { id: "pancreatic_abn", label: "Pancreatic hypoplasia / exocrine insufficiency", score: 2 },
];

export default function AlportHNF1BEngine() {
  const [mode, setMode] = useState(""); // "alport" | "hnf1b"
  const [alportAnswers, setAlportAnswers] = useState({});
  const [hnf1bAnswers, setHnf1bAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);

  const alportDx = getAlportDx(alportAnswers);
  const hnf1bScore = Object.entries(hnf1bAnswers).filter(([, v]) => v).reduce((acc, [k]) => {
    const q = HNF1B_QUESTIONS.find(q => q.id === k);
    return acc + (q?.score || 0);
  }, 0);
  const hnf1bProb = hnf1bScore >= 9 ? "Very High" : hnf1bScore >= 6 ? "High" : hnf1bScore >= 3 ? "Moderate" : "Low";

  const reset = () => { setMode(""); setAlportAnswers({}); setHnf1bAnswers({}); setShowResult(false); };

  if (!mode) return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-rose-700 to-red-700 p-4 text-white">
        <h3 className="font-bold text-sm">Hereditary Nephritis Engines</h3>
        <p className="text-xs text-rose-200">Alport Syndrome · HNF1B Nephropathy</p>
      </div>
      <div className="grid grid-cols-1 gap-3">
        <button onClick={() => setMode("alport")} className="bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl px-4 py-4 text-left shadow">
          <p className="font-bold text-sm">Alport Syndrome Engine</p>
          <p className="text-xs text-red-100 mt-0.5">Hematuria → Family Hx → Hearing → COL4 testing</p>
        </button>
        <button onClick={() => setMode("hnf1b")} className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl px-4 py-4 text-left shadow">
          <p className="font-bold text-sm">HNF1B Screening Engine</p>
          <p className="text-xs text-teal-100 mt-0.5">Most missed diagnosis — cysts + Mg + diabetes + genital anomalies</p>
        </button>
      </div>
    </div>
  );

  // ── Alport Results ──
  if (mode === "alport" && showResult) return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-red-700 to-rose-700 p-4 text-white">
        <h3 className="font-bold text-sm">Alport Syndrome Engine — Results</h3>
      </div>
      <Card className="border-2 border-red-300 bg-red-50">
        <CardContent className="p-4">
          <p className="text-xs font-bold text-red-600 mb-1">Most Likely Diagnosis</p>
          <p className="text-lg font-black text-red-900">{alportDx.dx}</p>
          <p className="text-xs text-red-700 mt-1">Confidence: <strong>{alportDx.confidence}</strong></p>
        </CardContent>
      </Card>
      <Card className="border-violet-200 bg-violet-50">
        <CardContent className="p-4">
          <p className="font-bold text-sm text-violet-900 mb-2">Genetics</p>
          <div className="space-y-1 text-xs text-slate-700">
            <div><span className="font-bold text-violet-700">Recommended gene(s): </span>{alportDx.gene}</div>
            <div className="bg-white rounded p-2 border border-violet-100 mt-2">
              <p className="font-bold text-violet-800 mb-1">Testing approach:</p>
              <p>XLAS (COL4A5): X-linked. Skin biopsy EM (absent α5) faster than sequencing</p>
              <p>ARAS (COL4A3/A4): AR. EM shows GBM thinning/lamellation</p>
              <p>TBMN (COL4A3/A4 het): Benign hematuria but 30% risk CKD long-term</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-blue-200">
        <CardContent className="p-4">
          <p className="font-bold text-sm text-blue-900 mb-2">Investigations</p>
          <div className="space-y-1.5 text-xs text-slate-700">
            <div className="bg-red-50 rounded p-2 border border-red-200 font-semibold text-red-700">Must: Audiometry, Slit-lamp ophthalmology, Renal biopsy EM, COL4A3/A4/A5 NGS panel</div>
            <div className="bg-amber-50 rounded p-2 border border-amber-200">Should: eGFR q6m, UPCR, family screening all first-degree relatives</div>
            <div className="bg-blue-50 rounded p-2 border border-blue-200">Advanced: Skin biopsy (COL4A5 immunostaining — XLAS), WES if panel negative</div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <p className="font-bold text-sm text-green-900 mb-2">Treatment & Monitoring</p>
          <div className="space-y-1 text-xs text-slate-700">
            <div className="bg-white rounded p-2 border border-green-100">ACEi (ramipril/enalapril): start at first proteinuria — proven to delay ESRD in XLAS males</div>
            <div className="bg-white rounded p-2 border border-green-100">Hearing aids: when SNHL confirmed</div>
            <div className="bg-white rounded p-2 border border-green-100">eGFR + UPCR 3–6 monthly; audiometry annually</div>
            <div className="bg-white rounded p-2 border border-green-100">Transplant: excellent outcomes; donor screening for COL4 variants in family members</div>
          </div>
        </CardContent>
      </Card>
      <Button onClick={reset} variant="outline" size="sm" className="w-full"><ArrowLeft className="w-4 h-4 mr-2" /> Start Again</Button>
    </div>
  );

  // ── Alport Questions ──
  if (mode === "alport" && !showResult) return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-red-700 to-rose-700 p-4 text-white">
        <h3 className="font-bold text-sm">Alport Syndrome Engine</h3>
        <p className="text-xs text-red-200">Select all features present</p>
      </div>
      <Card><CardContent className="p-4 space-y-2">
        {ALPORT_QUESTIONS.map(q => (
          <button key={q.id} onClick={() => setAlportAnswers(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 text-left transition-all ${alportAnswers[q.id] ? "border-red-400 bg-red-50" : "border-slate-200 hover:border-slate-300"}`}>
            {alportAnswers[q.id] ? <CheckCircle2 className="w-4 h-4 text-red-600 flex-shrink-0" /> : <Circle className="w-4 h-4 text-slate-300 flex-shrink-0" />}
            <span className="text-xs text-slate-700">{q.label}</span>
          </button>
        ))}
        <div className="flex gap-2 mt-3">
          <Button variant="outline" size="sm" className="flex-1" onClick={reset}><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
          <Button size="sm" className="flex-1 bg-red-600 hover:bg-red-700" onClick={() => setShowResult(true)}>Analyse <ChevronRight className="w-4 h-4 ml-1" /></Button>
        </div>
      </CardContent></Card>
    </div>
  );

  // ── HNF1B Results ──
  if (mode === "hnf1b" && showResult) {
    const probColor = hnf1bProb === "Very High" || hnf1bProb === "High" ? "bg-red-600" : hnf1bProb === "Moderate" ? "bg-amber-500" : "bg-green-600";
    return (
      <div className="space-y-4">
        <div className="rounded-xl bg-gradient-to-r from-teal-700 to-cyan-700 p-4 text-white">
          <h3 className="font-bold text-sm">HNF1B Screening Engine — Results</h3>
        </div>
        <Card className={`border-2 text-white`} style={{ background: probColor.replace("bg-", "var(--color-") }}>
          <CardContent className="p-4">
            <p className="text-xs font-bold opacity-80 mb-1">HNF1B Probability</p>
            <p className="text-xl font-black text-white">{hnf1bProb}</p>
            <p className="text-xs text-white/80">Score: {hnf1bScore}/24</p>
          </CardContent>
        </Card>
        <Card className={`border-2 ${hnf1bProb !== "Low" ? "border-red-300 bg-red-50" : "border-green-300 bg-green-50"}`}>
          <CardContent className="p-3">
            {hnf1bProb !== "Low" ? <p className="text-xs font-bold text-red-700">⚠ HNF1B genetic testing strongly recommended</p> : <p className="text-xs text-green-700">HNF1B less likely — but consider if renal cysts + CKD unexplained</p>}
            <p className="text-xs text-slate-600 mt-1">Note: HNF1B is the most commonly missed diagnosis in renal cysts. 50% are de novo mutations.</p>
          </CardContent>
        </Card>
        <Card className="border-violet-200 bg-violet-50">
          <CardContent className="p-4">
            <p className="font-bold text-sm text-violet-900 mb-2">Genetics</p>
            <div className="space-y-1 text-xs text-slate-700">
              <div><span className="font-bold text-violet-700">Gene: </span>HNF1B at 17q12 — deletion or point mutation</div>
              <div><span className="font-bold text-violet-700">50% de novo</span> — no family history does NOT exclude HNF1B</div>
              <div className="bg-white rounded p-2 border border-violet-100 mt-2">Testing: MLPA first (detects deletions ~50%), then sequencing. Yield 85% if classic phenotype.</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-200">
          <CardContent className="p-4">
            <p className="font-bold text-sm text-blue-900 mb-2">Monitoring (once confirmed)</p>
            <div className="space-y-1 text-xs text-slate-700">
              <div className="bg-white rounded p-2 border border-blue-100">eGFR + UPCR every 6 months</div>
              <div className="bg-white rounded p-2 border border-blue-100">Mg every 6 months (hypomagnesaemia marker)</div>
              <div className="bg-white rounded p-2 border border-blue-100">HbA1c / OGTT from age 10–12 (MODY5 risk)</div>
              <div className="bg-white rounded p-2 border border-blue-100">Pelvic USS in females at adolescence (bicornuate uterus)</div>
              <div className="bg-white rounded p-2 border border-blue-100">Liver enzymes annually</div>
            </div>
          </CardContent>
        </Card>
        <Button onClick={reset} variant="outline" size="sm" className="w-full"><ArrowLeft className="w-4 h-4 mr-2" /> Start Again</Button>
      </div>
    );
  }

  // ── HNF1B Questions ──
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-teal-700 to-cyan-700 p-4 text-white">
        <h3 className="font-bold text-sm">HNF1B Screening Engine</h3>
        <p className="text-xs text-teal-200">Select all features present</p>
      </div>
      <Card><CardContent className="p-4 space-y-2">
        <p className="text-xs text-amber-600 font-semibold bg-amber-50 border border-amber-200 rounded p-2">⚠ 50% of HNF1B are de novo — no family history does NOT exclude this diagnosis</p>
        {HNF1B_QUESTIONS.map(q => (
          <button key={q.id} onClick={() => setHnf1bAnswers(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 text-left transition-all ${hnf1bAnswers[q.id] ? "border-teal-400 bg-teal-50" : "border-slate-200 hover:border-slate-300"}`}>
            {hnf1bAnswers[q.id] ? <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" /> : <Circle className="w-4 h-4 text-slate-300 flex-shrink-0" />}
            <span className="text-xs text-slate-700 flex-1">{q.label}</span>
            <span className="text-xs text-slate-400">+{q.score}</span>
          </button>
        ))}
        <div className="bg-teal-50 rounded-lg p-2 border border-teal-200 text-xs font-bold text-teal-800">Current Score: {hnf1bScore}/24</div>
        <div className="flex gap-2 mt-3">
          <Button variant="outline" size="sm" className="flex-1" onClick={reset}><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
          <Button size="sm" className="flex-1 bg-teal-600 hover:bg-teal-700" onClick={() => setShowResult(true)}>Analyse <ChevronRight className="w-4 h-4 ml-1" /></Button>
        </div>
      </CardContent></Card>
    </div>
  );
}