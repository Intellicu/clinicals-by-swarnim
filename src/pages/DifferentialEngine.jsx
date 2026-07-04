import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/client";
import {
  Search, AlertTriangle, CheckCircle, Sparkles, Loader2,
  ChevronRight, TestTube, Brain, BookOpen, X, Plus
} from "lucide-react";

// Pre-built clinical pattern library
const PATTERNS = [
  {
    id: "hematuria-low-c3",
    triggers: ["hematuria", "low c3", "proteinuria"],
    label: "Hematuria + Low C3 + Proteinuria",
    diagnoses: [
      { name: "Post-streptococcal GN (PSGN)", probability: "High", evidence: "Low C3, hematuria 10–21 days post-URTI, typically children 5–12 yrs", investigations: ["ASOT/DNase B titers", "C3/C4", "Urine microscopy (RBC casts)"] },
      { name: "MPGN (C3 Glomerulopathy)", probability: "Moderate", evidence: "Persistent low C3 >12 weeks, nephritic-nephrotic overlap, requires biopsy", investigations: ["C3, C4, Factor H, C3 nephritic factor", "Renal biopsy (IF: C3 dominant)", "CFH mutation panel"] },
      { name: "Lupus Nephritis", probability: "Moderate", evidence: "Low C3 + C4 (both), proteinuria, systemic features (rash, arthritis)", investigations: ["ANA, anti-dsDNA", "C3, C4 (both low in SLE)", "Anti-Sm, antiphospholipid Ab"] },
      { name: "IgA Vasculitis Nephritis (HSP-N)", probability: "Low-Moderate", evidence: "Rash + arthritis + abdominal pain + nephritis, C3 usually normal", investigations: ["Clinical diagnosis + urine protein", "Biopsy if nephrotic-range or GFR declining"] },
    ],
    red_flags: ["C3 persistently low >12 weeks → MPGN, not PSGN", "Both C3 and C4 low → SLE (MPGN has low C3, normal C4)", "Rapidly progressive GFR decline → ANCA/anti-GBM panel urgent"],
    key_investigations: ["C3, C4 (both)", "ASOT/DNAse B", "ANA, anti-dsDNA, ANCA", "Urine RBC morphology", "Renal biopsy if atypical or prolonged"]
  },
  {
    id: "edema-hypoalbuminemia",
    triggers: ["edema", "hypoalbuminemia", "proteinuria"],
    label: "Edema + Hypoalbuminemia + Proteinuria",
    diagnoses: [
      { name: "Nephrotic Syndrome (MCD most likely in children)", probability: "High", evidence: "Age 1–12, generalized edema, albumin <25 g/L, UPCR >2.0", investigations: ["Spot UPCR", "Albumin, cholesterol", "C3/C4 (normal in MCD)"] },
      { name: "Protein-losing Enteropathy", probability: "Low-Moderate", evidence: "Edema + low albumin WITHOUT proteinuria, GI symptoms, low alpha-1-antitrypsin", investigations: ["Fecal alpha-1-antitrypsin", "Urine protein (absent)", "Endoscopy"] },
      { name: "Malnutrition / Kwashiorkor", probability: "Low", evidence: "Low overall protein, edema, hair/skin changes, in nutritionally-compromised child", investigations: ["Total protein, albumin", "Prealbumin", "Dietary history"] },
      { name: "Liver Disease (Cirrhosis)", probability: "Low", evidence: "Ascites > peripheral edema, hepatosplenomegaly, LFT abnormal, low albumin", investigations: ["LFT", "Coagulation studies", "USG abdomen (cirrhosis)"] },
    ],
    red_flags: ["Nephrotic + hematuria + hypertension → nephritic-nephrotic, biopsy likely", "Nephrotic + low C3 → secondary cause (SLE, MPGN)", "Nephrotic + rash → SLE, HSP-N"],
    key_investigations: ["Spot UPCR (first morning)", "Albumin, total protein", "C3, C4", "ANA if >12 years or atypical", "USG kidneys + abdomen"]
  },
  {
    id: "aki-thrombocytopenia",
    triggers: ["aki", "thrombocytopenia", "bloody diarrhea"],
    label: "AKI + Thrombocytopenia + Bloody Diarrhea",
    diagnoses: [
      { name: "Hemolytic Uremic Syndrome — STEC HUS (D+)", probability: "Very High", evidence: "Prodrome: bloody diarrhea → HUS triad (MAHA + thrombocytopenia + AKI). E.coli O157:H7", investigations: ["Peripheral smear (schistocytes)", "LDH, haptoglobin", "Stool STEC PCR/culture", "Coombs test (negative in MAHA)"] },
      { name: "Atypical HUS (aHUS)", probability: "Moderate (if no diarrheal prodrome)", evidence: "Recurrent or severe HUS without diarrheal prodrome, family history, CFH mutations", investigations: ["CFH, CFI, MCP, CFB, C3 mutation panel", "Factor H level", "C3/C4"] },
      { name: "TTP (Thrombotic Thrombocytopenic Purpura)", probability: "Low (rare in children)", evidence: "Pentad: MAHA + thrombocytopenia + AKI + fever + neuro symptoms", investigations: ["ADAMTS13 activity", "Peripheral smear (schistocytes)"] },
      { name: "Disseminated Intravascular Coagulation (DIC)", probability: "Low-Moderate (if sepsis)", evidence: "Coagulopathy + sepsis, PT/aPTT prolonged, fibrinogen low", investigations: ["PT, aPTT, fibrinogen, D-dimer", "Blood culture"] },
    ],
    red_flags: ["STEC HUS: NO ANTIBIOTICS — increases Shiga toxin release, worsens neurological outcome", "Neurological symptoms → severe HUS or TTP", "aHUS: family history + no diarrheal prodrome → genetic testing + Eculizumab"],
    key_investigations: ["Peripheral blood smear (schistocytes = MAHA)", "LDH, haptoglobin", "Coombs test (negative in MAHA)", "Stool STEC O157 culture/PCR", "Complement studies for aHUS"]
  },
  {
    id: "hypertension-young",
    triggers: ["hypertension", "young child", "secondary"],
    label: "Hypertension in Young Child (<10 years)",
    diagnoses: [
      { name: "Renal Parenchymal Disease (CKD/GN)", probability: "High", evidence: "Most common secondary HTN cause in children. Check urine, creatinine, USG", investigations: ["Urinalysis, UPCR", "Creatinine, eGFR", "USG KUB"] },
      { name: "Renovascular Hypertension", probability: "Moderate", evidence: "Severe, resistant HTN, renal artery stenosis (NF, FMD, Williams syndrome)", investigations: ["Renal Doppler USG", "Plasma renin/aldosterone", "MR Angiography"] },
      { name: "Pheochromocytoma", probability: "Low", evidence: "Paroxysmal HTN, sweating, pallor, headache, tachycardia", investigations: ["24h urine metanephrines", "Plasma metanephrines", "MRI abdomen"] },
      { name: "Coarctation of Aorta", probability: "Low-Moderate", evidence: "Upper limb > lower limb BP, femoral pulse weak/delayed, systolic murmur", investigations: ["BP in all 4 limbs", "Echo + MRI aorta"] },
      { name: "Primary Hyperaldosteronism", probability: "Low", evidence: "Hypokalemia + HTN + alkalosis, low plasma renin", investigations: ["Plasma aldosterone:renin ratio", "Adrenal imaging"] },
    ],
    red_flags: ["HTN <6 years: almost always secondary", "Hypokalemia + HTN → primary hyperaldosteronism or Liddle syndrome", "Hypertension + fever + AKI → GN (urgent workup)"],
    key_investigations: ["Both arm BP + leg BP", "Urinalysis, UPCR, creatinine", "Renal USG with Doppler", "Plasma renin + aldosterone", "Plasma metanephrines (if paroxysmal)"]
  },
  {
    id: "polyuria-growth-failure",
    triggers: ["polyuria", "growth failure", "rickets"],
    label: "Polyuria + Growth Failure + Rickets",
    diagnoses: [
      { name: "Fanconi Syndrome", probability: "High", evidence: "Proximal tubular dysfunction: glycosuria + phosphaturia + aminoaciduria + bicarbonaturia. Rickets common", investigations: ["Urine glucose (normoglycemia)", "TRP (TmP/GFR low)", "Urine amino acids", "Serum phosphate (low)", "Urine bicarb"] },
      { name: "Cystinosis", probability: "High (in young child with Fanconi)", evidence: "Most common cause of Fanconi in children <2y. Slit-lamp: corneal cystine crystals", investigations: ["Slit-lamp exam (pathognomonic)", "Leukocyte cystine levels", "CTNS mutation testing"] },
      { name: "Nephronophthisis", probability: "Moderate", evidence: "NPHP: progressive CKD + polyuria + growth failure. USG: increased echogenicity, loss of CMD", investigations: ["USG kidneys (small, echogenic)", "NPHP gene panel", "Renal biopsy"] },
      { name: "Bartter Syndrome", probability: "Moderate", evidence: "Hypokalemia + metabolic alkalosis + polyuria + normal BP. Neonatal polyhydramnios", investigations: ["K, Na, HCO3, Cl (serum)", "Urine K, Cl", "BSND/SLC12A1/KCNJ1 gene panel"] },
    ],
    red_flags: ["Fanconi + eye photophobia + young child → Cystinosis (emergent — start cysteamine early)", "Polyuria + hypernatremia → DI; polyuria + normal Na → Fanconi or Bartter", "Nephronophthisis gene panel: NPHP1-9"],
    key_investigations: ["Fanconi screen: urine glucose + phosphate + amino acids + bicarb simultaneously with serum", "TmP/GFR (TRP)", "Slit-lamp (cystinosis)", "USG kidneys", "NPHP gene panel"]
  }
];

const PROB_COLORS = {
  "Very High": "bg-red-600 text-white",
  "High": "bg-orange-600 text-white",
  "Moderate": "bg-amber-500 text-white",
  "Low-Moderate": "bg-yellow-600 text-white",
  "Low": "bg-blue-600 text-white",
};

export default function DifferentialEngine() {
  const [symptoms, setSymptoms] = useState([]);
  const [inputVal, setInputVal] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [aiResult, setAiResult] = useState(null);

  const addSymptom = () => {
    const trimmed = inputVal.trim();
    if (trimmed && !symptoms.includes(trimmed)) {
      setSymptoms(prev => [...prev, trimmed]);
    }
    setInputVal("");
  };

  const removeSymptom = (s) => setSymptoms(prev => prev.filter(x => x !== s));

  const quickAddPattern = (pattern) => {
    setSymptoms(pattern.triggers);
    setSelectedPattern(pattern);
    setResults(pattern);
    setAiResult(null);
  };

  const runAI = async () => {
    if (symptoms.length === 0) return;
    setLoading(true);
    setResults(null);
    setAiResult(null);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a pediatric nephrology diagnostic expert. A child presents with: ${symptoms.join(", ")}.

Generate a ranked differential diagnosis list (most likely first) with:
1. Most probable diagnosis
2. 3–5 differential diagnoses each with: probability (High/Moderate/Low), supporting evidence, and 3–4 key investigations
3. Red flags that should NOT be missed
4. Most important first investigations to order

Focus on pediatric nephrology conditions. Be concise and clinically practical.`,
        response_json_schema: {
          type: "object",
          properties: {
            label: { type: "string" },
            diagnoses: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  probability: { type: "string" },
                  evidence: { type: "string" },
                  investigations: { type: "array", items: { type: "string" } }
                }
              }
            },
            red_flags: { type: "array", items: { type: "string" } },
            key_investigations: { type: "array", items: { type: "string" } }
          }
        }
      });
      setAiResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const displayResult = aiResult || results;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-slate-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-violet-700 via-purple-600 to-indigo-700 p-6 text-white shadow-xl">
          <div className="flex items-center gap-3">
            <Brain className="w-9 h-9" />
            <div>
              <h1 className="text-3xl font-bold">Differential Diagnosis Engine</h1>
              <p className="text-violet-100 text-sm">Enter clinical features → ranked differentials with investigations & red flags</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Input Panel */}
          <div className="lg:col-span-1 space-y-4">
            {/* Symptom input */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Enter Clinical Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. hematuria, low C3..."
                    value={inputVal}
                    onChange={e => setInputVal(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addSymptom()}
                    className="flex-1"
                  />
                  <Button size="sm" onClick={addSymptom} className="bg-violet-600 hover:bg-violet-700">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {symptoms.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {symptoms.map(s => (
                      <span key={s} className="flex items-center gap-1 bg-violet-100 text-violet-800 text-xs px-2 py-1 rounded-full font-medium">
                        {s}
                        <button onClick={() => removeSymptom(s)} className="hover:text-red-600">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <Button
                  className="w-full bg-gradient-to-r from-violet-600 to-purple-600"
                  onClick={runAI}
                  disabled={symptoms.length === 0 || loading}
                >
                  {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyzing...</> : <><Sparkles className="w-4 h-4 mr-2" />AI Differential Analysis</>}
                </Button>
              </CardContent>
            </Card>

            {/* Quick patterns */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-violet-600" /> Quick Clinical Patterns
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="space-y-2">
                  {PATTERNS.map(p => (
                    <button
                      key={p.id}
                      onClick={() => quickAddPattern(p)}
                      className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition-all ${selectedPattern?.id === p.id ? "bg-violet-600 text-white border-violet-600" : "bg-white border-slate-200 text-slate-700 hover:border-violet-400 hover:bg-violet-50"}`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-2">
            {loading && (
              <Card className="flex items-center justify-center h-64">
                <div className="text-center text-slate-500">
                  <Loader2 className="w-10 h-10 animate-spin text-violet-600 mx-auto mb-3" />
                  <p className="font-medium">AI analyzing clinical pattern...</p>
                </div>
              </Card>
            )}

            {!loading && !displayResult && (
              <Card className="flex items-center justify-center h-64">
                <div className="text-center text-slate-400 p-8">
                  <Brain className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p className="font-medium">Add clinical features and run analysis</p>
                  <p className="text-sm mt-1">Or select a quick pattern from the left</p>
                </div>
              </Card>
            )}

            {!loading && displayResult && (
              <div className="space-y-4">
                {/* Diagnoses */}
                <Card>
                  <CardHeader className="border-b bg-violet-50">
                    <CardTitle className="flex items-center gap-2 text-violet-900">
                      <Brain className="w-5 h-5 text-violet-600" />
                      Ranked Differential Diagnoses
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    {displayResult.diagnoses?.map((dx, i) => (
                      <div key={i} className="border border-slate-200 rounded-xl p-4 bg-white">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 bg-violet-100 text-violet-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                            <h4 className="font-bold text-slate-900 text-sm">{dx.name}</h4>
                          </div>
                          <Badge className={`text-xs flex-shrink-0 ${PROB_COLORS[dx.probability] || "bg-slate-200 text-slate-700"}`}>
                            {dx.probability}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-600 mb-2 ml-8">{dx.evidence}</p>
                        <div className="ml-8 flex flex-wrap gap-1">
                          {dx.investigations?.map((inv, j) => (
                            <span key={j} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                              {inv}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Red flags */}
                {displayResult.red_flags?.length > 0 && (
                  <Card>
                    <CardHeader className="border-b bg-red-50 py-3">
                      <CardTitle className="text-red-800 flex items-center gap-2 text-base">
                        <AlertTriangle className="w-5 h-5 text-red-600" /> Do Not Miss — Red Flags
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-2">
                      {displayResult.red_flags.map((flag, i) => (
                        <div key={i} className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
                          <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-red-800 font-medium">{flag}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Key investigations */}
                {displayResult.key_investigations?.length > 0 && (
                  <Card>
                    <CardHeader className="border-b bg-blue-50 py-3">
                      <CardTitle className="text-blue-800 flex items-center gap-2 text-base">
                        <TestTube className="w-5 h-5 text-blue-600" /> Priority Investigations to Order Now
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-2">
                      {displayResult.key_investigations.map((inv, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-blue-800 border-b border-blue-100 pb-2 last:border-0 last:pb-0">
                          <ChevronRight className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          {inv}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}