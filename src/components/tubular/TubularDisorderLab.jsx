import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TestTube, Brain, Loader2, AlertTriangle, Activity } from "lucide-react";
import { base44 } from "@/api/base44Client";

const InputRow = ({ label, value, onChange, unit, hint }) => (
  <div className="space-y-1">
    <label className="text-xs font-semibold text-slate-600">{label}</label>
    {hint && <p className="text-xs text-slate-400">{hint}</p>}
    <div className="flex gap-2">
      <input
        className="flex-1 px-3 py-2 text-sm border-2 border-slate-200 rounded-lg bg-white outline-none focus:border-blue-400"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
      {unit && <span className="text-xs bg-slate-100 px-2 py-2 rounded-lg border text-slate-500">{unit}</span>}
    </div>
  </div>
);

const RTA_PATTERNS = [
  {
    type: "Distal RTA (Type 1)",
    features: ["Normal AG", "Urine pH >5.5 despite acidosis", "Hypokalemia", "Nephrocalcinosis", "UAG positive"],
    causes: ["Primary (AR/AD)", "Sjögren's", "Amphotericin B", "Chronic pyelonephritis", "Sickle cell"],
    treatment: "Sodium bicarbonate 1–3 mEq/kg/day. Potassium supplementation.",
    color: "bg-blue-50 border-blue-200",
  },
  {
    type: "Proximal RTA (Type 2)",
    features: ["Normal AG", "Urine pH variable (can be <5.5)", "Hypokalemia", "Fanconi syndrome features", "High HCO3 wasting"],
    causes: ["Fanconi syndrome", "Wilson disease", "Lowe syndrome", "Cystinosis", "Ifosfamide"],
    treatment: "High-dose bicarbonate (10–25 mEq/kg/day). Potassium. Thiazide diuretics (paradoxically reduce HCO3 loss).",
    color: "bg-cyan-50 border-cyan-200",
  },
  {
    type: "Type 4 RTA (Hyperkalemic)",
    features: ["Normal AG", "Hyperkalemia", "Urine pH <5.5 (can acidify)", "Low aldosterone or resistance"],
    causes: ["Hypoaldosteronism", "CKD", "Diabetes", "ACE inhibitors", "Heparin"],
    treatment: "Fludrocortisone (if hypoaldosteronism). Dietary K restriction. Furosemide. Treat underlying.",
    color: "bg-amber-50 border-amber-200",
  },
  {
    type: "Diarrheal Metabolic Acidosis",
    features: ["Normal AG (or high AG if severe dehydration)", "Urine pH <5.5", "Hypokalemia", "UAG negative (NH4+ excretion normal)"],
    causes: ["Gastroenteritis", "Ileostomy losses", "Malabsorption"],
    treatment: "Oral rehydration. Bicarbonate if severe. Treat underlying cause.",
    color: "bg-green-50 border-green-200",
  },
];

const ALKALOSIS_PATTERNS = [
  {
    type: "Bartter Syndrome",
    features: ["Hypokalemic alkalosis", "Low/normal BP", "High urine Cl", "High renin & aldosterone", "Polyuria, polydipsia"],
    genetics: "NKCC2 (Type 1), ROMK (Type 2), ClCNKb (Type 3), Barttin (Type 4)",
    treatment: "Indomethacin + KCl + aldosterone antagonist (spironolactone). Amiloride.",
    color: "bg-blue-50 border-blue-200",
  },
  {
    type: "Gitelman Syndrome",
    features: ["Hypokalemic alkalosis + hypomagnesemia", "Low/normal BP", "High urine Cl", "Low/normal renin", "Milder than Bartter"],
    genetics: "SLC12A3 (NCC transporter)",
    treatment: "Magnesium supplementation + KCl. Amiloride. NSAIDs if needed.",
    color: "bg-teal-50 border-teal-200",
  },
  {
    type: "Liddle Syndrome",
    features: ["Hypokalemic alkalosis", "HIGH BP", "Low urine Cl", "Low renin and aldosterone"],
    genetics: "SCNN1B/SCNN1G (ENaC gain-of-function)",
    treatment: "Amiloride or triamterene (NOT spironolactone). Low sodium diet.",
    color: "bg-orange-50 border-orange-200",
  },
  {
    type: "AME (Apparent Mineralocorticoid Excess)",
    features: ["Hypokalemic alkalosis", "HIGH BP", "Low renin & aldosterone", "Low cortisol:cortisone ratio"],
    genetics: "HSD11B2 mutation",
    treatment: "Spironolactone. Dexamethasone. Low sodium diet.",
    color: "bg-violet-50 border-violet-200",
  },
];

const MetabolicAcidosisEngine = () => {
  const [inputs, setInputs] = useState({ na: "", cl: "", hco3: "", urineNa: "", urineK: "", urineCl: "", urinePH: "", k: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const update = (k, v) => setInputs(prev => ({ ...prev, [k]: v }));

  const ag = inputs.na && inputs.cl && inputs.hco3
    ? (parseFloat(inputs.na) - parseFloat(inputs.cl) - parseFloat(inputs.hco3)).toFixed(1)
    : null;

  const uag = inputs.urineNa && inputs.urineK && inputs.urineCl
    ? (parseFloat(inputs.urineNa) + parseFloat(inputs.urineK) - parseFloat(inputs.urineCl)).toFixed(1)
    : null;

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const prompt = `You are a pediatric nephrologist. Interpret this metabolic acidosis workup.

Na: ${inputs.na} mEq/L, Cl: ${inputs.cl} mEq/L, HCO3: ${inputs.hco3} mEq/L
Anion Gap: ${ag || "not calculated"} mEq/L (normal 8-12)
Serum K: ${inputs.k || "not provided"} mEq/L
Urine Na: ${inputs.urineNa || "not provided"}, Urine K: ${inputs.urineK || "not provided"}, Urine Cl: ${inputs.urineCl || "not provided"} mEq/L
Urine Anion Gap: ${uag || "not calculated"} mEq/L
Urine pH: ${inputs.urinePH || "not provided"}

Classify the metabolic acidosis. Differentiate between:
- Normal AG: distal RTA vs proximal RTA vs type 4 RTA vs diarrhea
- High AG: MUDPILES (methanol, uremia, DKA, propylene glycol, infection/isoniazid, lactate, ethylene glycol, salicylate)

Respond as JSON: {
  "ag_classification": "normal/high/normal-borderline with explanation",
  "uag_interpretation": "positive=RTA, negative=GI loss/diarrhea",
  "primary_diagnosis": "most likely single diagnosis",
  "differential": ["1st", "2nd", "3rd"],
  "key_clues": ["clue 1", "clue 2", "clue 3"],
  "management": ["step 1", "step 2", "step 3"],
  "teaching_pearl": "one key teaching point",
  "further_workup": ["what else to order"]
}`;
      const res = await base44.integrations.Core.InvokeLLM({ prompt, response_json_schema: { type: "object", properties: { ag_classification: { type: "string" }, uag_interpretation: { type: "string" }, primary_diagnosis: { type: "string" }, differential: { type: "array", items: { type: "string" } }, key_clues: { type: "array", items: { type: "string" } }, management: { type: "array", items: { type: "string" } }, teaching_pearl: { type: "string" }, further_workup: { type: "array", items: { type: "string" } } } } });
      setResult(res);
    } catch (e) {
      setResult({ error: e.message });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <h3 className="font-bold text-blue-800 mb-3">Metabolic Acidosis Engine</h3>
          <div className="grid grid-cols-2 gap-3">
            <InputRow label="Serum Na" value={inputs.na} onChange={v => update("na", v)} unit="mEq/L" />
            <InputRow label="Serum Cl" value={inputs.cl} onChange={v => update("cl", v)} unit="mEq/L" />
            <InputRow label="Serum HCO3" value={inputs.hco3} onChange={v => update("hco3", v)} unit="mEq/L" />
            <InputRow label="Serum K" value={inputs.k} onChange={v => update("k", v)} unit="mEq/L" />
            <InputRow label="Urine Na" value={inputs.urineNa} onChange={v => update("urineNa", v)} unit="mEq/L" />
            <InputRow label="Urine K" value={inputs.urineK} onChange={v => update("urineK", v)} unit="mEq/L" />
            <InputRow label="Urine Cl" value={inputs.urineCl} onChange={v => update("urineCl", v)} unit="mEq/L" />
            <InputRow label="Urine pH" value={inputs.urinePH} onChange={v => update("urinePH", v)} hint="Normal <5.5 in acidosis" />
          </div>
          {ag !== null && (
            <div className="flex gap-4 mt-3">
              <span className="text-sm font-bold text-slate-700">Anion Gap: <span className={parseFloat(ag) > 12 ? "text-red-600" : "text-green-600"}>{ag} mEq/L</span></span>
              {uag !== null && <span className="text-sm font-bold text-slate-700">UAG: <span className={parseFloat(uag) > 0 ? "text-red-600" : "text-green-600"}>{uag} mEq/L</span></span>}
            </div>
          )}
          <Button className="w-full mt-3 bg-blue-600 hover:bg-blue-700" onClick={handleAnalyze} disabled={loading || !inputs.na}>
            {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Interpreting...</> : <><Brain className="w-4 h-4 mr-2" />AI Interpret Acidosis</>}
          </Button>
        </CardContent>
      </Card>

      {result && !result.error && (
        <Card className="border-slate-200">
          <CardContent className="p-4 space-y-3">
            <Badge className="bg-blue-100 text-blue-700 text-sm">{result.primary_diagnosis}</Badge>
            <p className="text-xs text-slate-600"><span className="font-semibold">AG:</span> {result.ag_classification}</p>
            <p className="text-xs text-slate-600"><span className="font-semibold">UAG:</span> {result.uag_interpretation}</p>
            <div>
              <p className="text-xs font-bold text-slate-500 mb-1">Key Clues</p>
              {result.key_clues?.map((c, i) => <p key={i} className="text-xs text-slate-600">• {c}</p>)}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 mb-1">Management</p>
              {result.management?.map((m, i) => <p key={i} className="text-xs text-slate-600">{i+1}. {m}</p>)}
            </div>
            {result.teaching_pearl && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-2">
                <p className="text-xs font-bold text-indigo-700">Teaching Pearl</p>
                <p className="text-xs text-slate-600">{result.teaching_pearl}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">RTA Pattern Reference</p>
      {RTA_PATTERNS.map(p => (
        <Card key={p.type} className={`border-2 ${p.color}`}>
          <CardContent className="p-3">
            <p className="font-bold text-sm text-slate-800 mb-2">{p.type}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div>
                <p className="font-semibold text-slate-600 mb-1">Features</p>
                {p.features.map((f, i) => <p key={i} className="text-slate-600">• {f}</p>)}
              </div>
              <div>
                <p className="font-semibold text-slate-600 mb-1">Causes</p>
                {p.causes.map((c, i) => <p key={i} className="text-slate-600">• {c}</p>)}
              </div>
            </div>
            <div className="mt-2 bg-white rounded-lg p-2 border border-slate-100">
              <p className="text-xs font-semibold text-blue-700">Treatment:</p>
              <p className="text-xs text-slate-600">{p.treatment}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const MetabolicAlkalosisEngine = () => (
  <div className="space-y-3">
    <Card className="bg-amber-50 border-amber-200">
      <CardContent className="p-3">
        <p className="text-sm font-bold text-amber-800 mb-2">Metabolic Alkalosis — Differential Approach</p>
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
          <div className="bg-white rounded p-2 border"><span className="font-bold">Urine Cl &lt;20</span> → Chloride-responsive (vomiting, diuretic stopped)</div>
          <div className="bg-white rounded p-2 border"><span className="font-bold">Urine Cl &gt;20</span> → Chloride-resistant (Bartter, Gitelman, Liddle, AME)</div>
          <div className="bg-white rounded p-2 border"><span className="font-bold">High BP</span> → Liddle, AME, CAH, hyperaldosteronism</div>
          <div className="bg-white rounded p-2 border"><span className="font-bold">Low/Normal BP</span> → Bartter, Gitelman, vomiting</div>
        </div>
      </CardContent>
    </Card>
    {ALKALOSIS_PATTERNS.map(p => (
      <Card key={p.type} className={`border-2 ${p.color}`}>
        <CardContent className="p-3">
          <p className="font-bold text-sm text-slate-800 mb-1">{p.type}</p>
          {p.genetics && <p className="text-xs text-violet-600 mb-2">Gene: {p.genetics}</p>}
          <div className="grid grid-cols-2 gap-2 text-xs mb-2">
            <div>
              {p.features.map((f, i) => <p key={i} className="text-slate-600">• {f}</p>)}
            </div>
          </div>
          <div className="bg-white rounded p-2 border border-slate-100 text-xs">
            <span className="font-semibold text-green-700">Treatment: </span>
            <span className="text-slate-600">{p.treatment}</span>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

const StoneNephrocalcinosisCenter = () => {
  const [workup, setWorkup] = useState({});
  const toggleWorkup = (k) => setWorkup(prev => ({ ...prev, [k]: !prev[k] }));

  const checklist = [
    { id: "24h_urine_ca", label: "24h urine calcium", cutoff: ">4 mg/kg/day = hypercalciuria" },
    { id: "24h_urine_oxalate", label: "24h urine oxalate", cutoff: ">0.5 mmol/1.73m²" },
    { id: "24h_urine_citrate", label: "24h urine citrate", cutoff: "<320 mg/g Cr = hypocitraturia" },
    { id: "24h_urine_uric", label: "24h urine uric acid", cutoff: ">0.56 mmol/kg/day" },
    { id: "24h_urine_cystine", label: "24h urine cystine", cutoff: ">250 mg/g Cr = cystinuria" },
    { id: "serum_ca", label: "Serum calcium", cutoff: "Hypercalcemia → PHPT, sarcoid, vitamin D excess" },
    { id: "serum_pth", label: "Serum PTH", cutoff: "High PTH → PHPT; Low PTH → malignancy, hypervit D" },
    { id: "serum_uric", label: "Serum uric acid", cutoff: "High → gout, tumor lysis, Lesch-Nyhan" },
    { id: "urine_ph", label: "Urine pH (first morning)", cutoff: "Low pH → uric acid stones; High pH → RTA" },
    { id: "stone_analysis", label: "Stone analysis", cutoff: "FTIR spectroscopy on stone if available" },
  ];

  return (
    <div className="space-y-4">
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <h3 className="font-bold text-amber-800 mb-3">Stone & Nephrocalcinosis Metabolic Workup Checklist</h3>
          <div className="space-y-2">
            {checklist.map(item => (
              <label key={item.id} className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-0.5 w-4 h-4 rounded"
                  checked={!!workup[item.id]}
                  onChange={() => toggleWorkup(item.id)}
                />
                <div>
                  <p className="text-sm font-semibold text-slate-700">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.cutoff}</p>
                </div>
              </label>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-3">
            ✓ {Object.values(workup).filter(Boolean).length}/{checklist.length} tests ordered
          </p>
        </CardContent>
      </Card>

      <div className="grid sm:grid-cols-2 gap-3">
        {[
          { name: "Hypercalciuria", color: "bg-yellow-50 border-yellow-200", causes: ["Idiopathic absorptive", "Renal leak", "Hyperparathyroidism", "Vitamin D toxicity", "Immobilization"], treatment: "Thiazide diuretics, low Na diet, citrate, hydration" },
          { name: "Hyperoxaluria", color: "bg-orange-50 border-orange-200", causes: ["Primary (AGXT, GRHPR, HOGA1 mutations)", "Enteric (Crohn's, malabsorption)", "Dietary"], treatment: "Pyridoxine (primary type 1), oxalate restriction, hydration, citrate. Consider lumasiran (RNAi)." },
          { name: "Cystinuria", color: "bg-purple-50 border-purple-200", causes: ["SLC3A1/SLC7A9 mutations", "AR inheritance"], treatment: "High fluid intake >3L/m²/day. Alkalinize urine (pH >7). D-penicillamine/tiopronin." },
          { name: "Hypocitraturia", color: "bg-teal-50 border-teal-200", causes: ["RTA (distal)", "Metabolic acidosis", "Hypokalemia", "Diarrhea", "Thiazides"], treatment: "Potassium citrate 1–2 mEq/kg/day. Treat underlying acidosis." },
        ].map(item => (
          <Card key={item.name} className={`border-2 ${item.color}`}>
            <CardContent className="p-3">
              <p className="font-bold text-sm text-slate-800 mb-2">{item.name}</p>
              <p className="text-xs font-semibold text-slate-500 mb-1">Causes:</p>
              {item.causes.map((c, i) => <p key={i} className="text-xs text-slate-600">• {c}</p>)}
              <div className="mt-2 bg-white rounded p-2 border border-slate-100 text-xs">
                <span className="font-semibold text-green-700">Treatment: </span>
                <span className="text-slate-600">{item.treatment}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default function TubularDisorderLab() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-slate-700 to-slate-600 p-5 text-white">
        <div className="flex items-center gap-3">
          <TestTube className="w-7 h-7" />
          <div>
            <h2 className="text-xl font-bold">Tubular Disorder Interactive Lab</h2>
            <p className="text-slate-300 text-sm">Metabolic acidosis engine · Alkalosis classifier · Stone/nephrocalcinosis center</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="acidosis">
        <TabsList className="flex w-full h-auto bg-white border shadow-sm overflow-x-auto">
          <TabsTrigger value="acidosis" className="text-xs flex-shrink-0">Metabolic Acidosis</TabsTrigger>
          <TabsTrigger value="alkalosis" className="text-xs flex-shrink-0">Metabolic Alkalosis</TabsTrigger>
          <TabsTrigger value="stones" className="text-xs flex-shrink-0">Stones & Nephrocalcinosis</TabsTrigger>
        </TabsList>
        <TabsContent value="acidosis" className="mt-3"><MetabolicAcidosisEngine /></TabsContent>
        <TabsContent value="alkalosis" className="mt-3"><MetabolicAlkalosisEngine /></TabsContent>
        <TabsContent value="stones" className="mt-3"><StoneNephrocalcinosisCenter /></TabsContent>
      </Tabs>
    </div>
  );
}