import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { base44 } from "@/api/base44Client";
import { Brain, Loader2, AlertTriangle, ChevronDown, ChevronUp, Microscope, FlaskConical, Dna } from "lucide-react";

const ANALYZERS = [
  {
    id: "nephrocalcinosis",
    name: "Nephrocalcinosis Analyzer",
    icon: "🔬",
    color: "amber",
    prompt_prefix: `You are an expert pediatric nephrologist specializing in rare renal diseases. Analyze the following clinical data for a child with nephrocalcinosis and provide:
1. Top 3 differential diagnoses with probability
2. Key missing investigations
3. Gene panel recommendation
4. Immediate management steps
5. Long-term monitoring plan
Format as structured JSON with keys: differentials (array with diagnosis, probability, evidence, genes), missing_investigations, gene_panel, immediate_management, monitoring, clinical_pearls.
Clinical data:`,
    fields: [
      { id: "age", label: "Age and sex" },
      { id: "nc_type", label: "Type of nephrocalcinosis (medullary/cortical/diffuse)" },
      { id: "labs", label: "Relevant labs (Ca, PO4, Mg, pH, electrolytes, urine oxalate, citrate)" },
      { id: "imaging", label: "Imaging findings" },
      { id: "symptoms", label: "Other symptoms (polyuria, growth, hearing, stones)" },
      { id: "family", label: "Family history" }
    ]
  },
  {
    id: "stone",
    name: "Rare Stone Analyzer",
    icon: "🪨",
    color: "orange",
    prompt_prefix: `You are an expert pediatric nephrologist specializing in inherited stone diseases. Analyze this pediatric stone case and provide:
1. Most likely stone type and metabolic diagnosis
2. Key urine metabolic studies needed
3. Genetic testing recommendation
4. Treatment protocol (diet, fluids, medications, new therapies)
5. Recurrence prevention strategy
Format as structured JSON: stone_type_probability (array), metabolic_diagnosis, urine_workup_needed, genetic_testing, treatment_protocol, prevention_strategy, pearls.
Clinical data:`,
    fields: [
      { id: "age_sex", label: "Age, sex, first episode age" },
      { id: "stone_composition", label: "Stone composition (if analysed)" },
      { id: "urine_24h", label: "24h urine results (oxalate, calcium, citrate, cystine, uric acid)" },
      { id: "imaging", label: "Imaging (bilateral/unilateral, NC, stone size)" },
      { id: "metabolic", label: "Metabolic panel (Ca, phosphate, uric acid, PTH)" },
      { id: "family_stones", label: "Family history of stones/renal disease" }
    ]
  },
  {
    id: "syndromic_ckd",
    name: "Syndromic CKD Analyzer",
    icon: "🧬",
    color: "violet",
    prompt_prefix: `You are an expert pediatric nephrologist and clinical geneticist. Analyze this child with unexplained CKD and syndromic features. Provide:
1. Prioritized differential diagnoses (genetic conditions)
2. Phenotype pattern recognition clues
3. Diagnostic workup including genetic testing
4. Specialist referrals needed
5. Transplant pre-planning guidance
Format as structured JSON: syndrome_differentials (array with name, probability, key_clues, genes), phenotype_pattern, workup, referrals, transplant_planning, pearls.
Clinical data:`,
    fields: [
      { id: "age_ckd", label: "Age of CKD onset, current eGFR, rate of progression" },
      { id: "renal_imaging", label: "Renal imaging findings (size, cysts, echogenicity, anomalies)" },
      { id: "extra_renal", label: "Extra-renal features (eye, ear, heart, skeletal, CNS, liver)" },
      { id: "biopsy", label: "Renal biopsy findings (if done)" },
      { id: "family_hx", label: "Family history, consanguinity" },
      { id: "genetics_done", label: "Previous genetic testing results" }
    ]
  },
  {
    id: "genetic_ns",
    name: "Genetic NS Analyzer",
    icon: "💊",
    color: "purple",
    prompt_prefix: `You are an expert pediatric nephrologist specializing in genetic nephrotic syndrome. Analyze this steroid-resistant nephrotic syndrome case for genetic diagnosis. Provide:
1. Most likely genetic diagnoses in order of probability
2. Biopsy pattern interpretation
3. Gene panel priority order
4. Expected steroid/CNI response
5. Transplant planning recommendations
Format as structured JSON: genetic_diagnoses (array with diagnosis, probability, supporting_features, gene), biopsy_clues, gene_panel_order, treatment_response, transplant_planning, do_not_miss, pearls.
Clinical data:`,
    fields: [
      { id: "age_onset_ns", label: "Age of NS onset (exact age in months)" },
      { id: "steroid_response", label: "Steroid response details (course, duration, response)" },
      { id: "biopsy", label: "Renal biopsy findings (LM, IF, EM if available)" },
      { id: "extra_renal_ns", label: "Extra-renal features (genitalia, eyes, tumour risk, neurological)" },
      { id: "complement_ns", label: "Complement levels, anti-PLA2R" },
      { id: "family_ns", label: "Family history, consanguinity, ethnicity" }
    ]
  },
  {
    id: "fabry_pattern",
    name: "Fabry Pattern Analyzer",
    icon: "💜",
    color: "violet",
    prompt_prefix: `You are an expert in Fabry disease and lysosomal storage disorders. Analyze the following clinical and laboratory data for Fabry disease. Provide:
1. Probability of Fabry disease (Low/Possible/High/Confirmed)
2. Pattern recognition — which features are most diagnostic
3. Recommended investigations in priority order
4. GLA mutation class prediction based on phenotype
5. ERT/chaperone eligibility assessment
Format as structured JSON: fabry_probability, diagnostic_pattern (key features and why), investigations (array ordered by priority), mutation_class_prediction, ert_eligibility, family_screening_plan, monitoring_plan, pearls.
Clinical data:`,
    fields: [
      { id: "age_sex", label: "Age, sex, clinical presentation" },
      { id: "enzyme", label: "Alpha-galactosidase A enzyme activity result" },
      { id: "lyso_gb3", label: "Lyso-Gb3 level (urine/plasma, if available)" },
      { id: "gla_mutation", label: "GLA mutation (if known)" },
      { id: "organ_involvement", label: "Organ involvement: kidney, heart, neuro, skin, eye" },
      { id: "family_fabry", label: "Family history (maternal lineage, affected relatives)" },
    ]
  },
  {
    id: "complement_tma",
    name: "Complement / TMA Analyzer",
    icon: "🔴",
    color: "red",
    prompt_prefix: `You are an expert in complement-mediated renal diseases and thrombotic microangiopathy. Analyze this TMA case to differentiate aHUS from other TMAs and guide complement genetic workup. Provide:
1. TMA subtype diagnosis probability (aHUS/TTP/STEC-HUS/secondary/cblC)
2. Critical immediate investigations needed
3. Complement testing priority
4. Genetic panel recommendation
5. Immediate management (eculizumab decision)
Format as structured JSON: tma_type_probability (array), critical_investigations, complement_testing, genetic_panel, immediate_management, eculizumab_indication (yes/no/monitor), pearls.
Clinical data:`,
    fields: [
      { id: "clinical_tma", label: "Clinical presentation (age, onset, MAHA, platelets, creatinine)" },
      { id: "blood_film", label: "Blood film (schistocytes count)" },
      { id: "adamts13", label: "ADAMTS13 activity result (if available)" },
      { id: "complement_labs", label: "Complement levels (C3, C4, CH50, AP50, anti-CFH Ab)" },
      { id: "stec", label: "STEC cultures/PCR/Shiga toxin result" },
      { id: "family_tma", label: "Family history of TMA, consanguinity, previous episodes" }
    ]
  }
];

const COLOR_MAP = {
  amber: { badge: "bg-amber-100 text-amber-800", header: "bg-amber-50", btn: "bg-amber-600 hover:bg-amber-700" },
  orange: { badge: "bg-orange-100 text-orange-800", header: "bg-orange-50", btn: "bg-orange-600 hover:bg-orange-700" },
  violet: { badge: "bg-violet-100 text-violet-800", header: "bg-violet-50", btn: "bg-violet-600 hover:bg-violet-700" },
  purple: { badge: "bg-purple-100 text-purple-800", header: "bg-purple-50", btn: "bg-purple-600 hover:bg-purple-700" },
  red: { badge: "bg-red-100 text-red-800", header: "bg-red-50", btn: "bg-red-600 hover:bg-red-700" },
  pink: { badge: "bg-pink-100 text-pink-800", header: "bg-pink-50", btn: "bg-pink-600 hover:bg-pink-700" },
};

function AnalyzerCard({ analyzer }) {
  const [inputs, setInputs] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const c = COLOR_MAP[analyzer.color];

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const dataStr = analyzer.fields.map(f => `${f.label}: ${inputs[f.id] || "Not provided"}`).join("\n");
      const prompt = `${analyzer.prompt_prefix}\n\n${dataStr}`;
      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: { type: "object", additionalProperties: true }
      });
      setResult(res);
    } catch (e) {
      setResult({ error: e.message || "Analysis failed" });
    }
    setLoading(false);
  };

  return (
    <Card className="bg-white border border-slate-200 shadow-sm overflow-hidden">
      <button
        className={`w-full flex items-center gap-3 p-4 ${c.header} hover:opacity-90 transition-opacity text-left border-b border-slate-200`}
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-2xl">{analyzer.icon}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-900">{analyzer.name}</span>
            <Badge className={`text-xs ${c.badge}`}>AI Analyzer</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Structured rare disease lab interpretation with gene panel guidance</p>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      {expanded && (
        <div className="p-4 space-y-4">
          <div className="grid md:grid-cols-2 gap-3">
            {analyzer.fields.map(f => (
              <div key={f.id}>
                <Label className="text-xs font-semibold text-slate-600 mb-1 block">{f.label}</Label>
                <Textarea
                  value={inputs[f.id] || ""}
                  onChange={e => setInputs(prev => ({ ...prev, [f.id]: e.target.value }))}
                  placeholder="Enter details…"
                  className="text-sm h-20 resize-none"
                />
              </div>
            ))}
          </div>

          <Button onClick={runAnalysis} disabled={loading} className={`w-full text-white ${c.btn}`}>
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyzing…</> : <><Brain className="w-4 h-4 mr-2" />Run AI Analysis</>}
          </Button>

          {result && (
            <div className="space-y-3">
              {result.error && (
                <Alert className="bg-red-50 border-red-200">
                  <AlertDescription className="text-red-800 text-xs">{result.error}</AlertDescription>
                </Alert>
              )}
              {!result.error && (
                <>
                  {/* Differentials */}
                  {(result.differentials || result.syndrome_differentials || result.genetic_diagnoses || result.tma_type_probability || result.stone_type_probability) && (
                    <div>
                      <p className="text-xs font-bold text-slate-600 uppercase mb-2">Differential Diagnoses / Probability</p>
                      <div className="space-y-2">
                        {(result.differentials || result.syndrome_differentials || result.genetic_diagnoses || result.tma_type_probability || result.stone_type_probability || []).map((d, i) => (
                          <div key={i} className="bg-violet-50 border border-violet-200 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-sm text-violet-900">{d.diagnosis || d.name || d.syndrome || d.tma_type || d.stone_type}</span>
                              <Badge className="bg-violet-200 text-violet-800 text-xs">{d.probability}</Badge>
                            </div>
                            {(d.evidence || d.key_clues || d.supporting_features) && <p className="text-xs text-slate-600">{d.evidence || d.key_clues || d.supporting_features}</p>}
                            {(d.genes || d.gene) && <code className="text-xs bg-slate-100 px-2 py-0.5 rounded mt-1 block">{d.genes || d.gene}</code>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Other sections as key-value */}
                  {Object.entries(result).filter(([k]) => !["differentials","syndrome_differentials","genetic_diagnoses","tma_type_probability","stone_type_probability","error"].includes(k)).map(([key, val]) => (
                    <div key={key} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                      <p className="text-xs font-bold text-slate-600 uppercase mb-1">{key.replace(/_/g, " ")}</p>
                      {Array.isArray(val) ? (
                        <ul className="space-y-1">{val.map((v, i) => <li key={i} className="text-xs text-slate-700">• {typeof v === "object" ? JSON.stringify(v) : v}</li>)}</ul>
                      ) : (
                        <p className="text-xs text-slate-700 leading-relaxed">{typeof val === "object" ? JSON.stringify(val, null, 2) : val}</p>
                      )}
                    </div>
                  ))}

                  <Alert className="bg-amber-50 border-amber-200">
                    <AlertDescription className="text-xs text-amber-800">
                      <strong>AI Disclaimer:</strong> This analysis is for clinical decision support only. Always correlate with clinical findings, validated laboratory results, and specialist opinion. Genetic testing should be interpreted by a certified clinical geneticist.
                    </AlertDescription>
                  </Alert>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

export default function AILabRareAnalyzers({ isAdmin }) {
  return (
    <div className="space-y-3">
      <Alert className="bg-violet-50 border-violet-200">
        <Brain className="w-4 h-4 text-violet-600" />
        <AlertDescription className="text-violet-800 text-xs">
          <strong>AI Rare Disease Lab Analyzers:</strong> Provide clinical + laboratory data for AI-powered differential diagnosis, gene panel recommendations, and management guidance specific to rare pediatric kidney diseases.
        </AlertDescription>
      </Alert>
      {ANALYZERS.map(a => <AnalyzerCard key={a.id} analyzer={a} />)}
    </div>
  );
}