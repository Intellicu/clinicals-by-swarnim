import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GitBranch, CheckCircle, AlertTriangle, FlaskConical, X } from "lucide-react";

const SYMPTOMS = [
  { id: "proteinuria", label: "Proteinuria 3+" },
  { id: "hematuria", label: "Hematuria" },
  { id: "edema", label: "Edema" },
  { id: "hypertension", label: "Hypertension" },
  { id: "oliguria", label: "Oliguria/Anuria" },
  { id: "hematuria_gross", label: "Gross Hematuria" },
  { id: "rash", label: "Purpuric Rash" },
  { id: "arthritis", label: "Arthritis" },
  { id: "fever", label: "Fever" },
  { id: "weight_gain", label: "Rapid Weight Gain" },
  { id: "flank_pain", label: "Flank Pain" },
  { id: "family_history", label: "Family History (kidney)" },
];

const LABS = [
  { id: "low_albumin", label: "Albumin <2.5 g/dL" },
  { id: "high_creatinine", label: "Creatinine ↑" },
  { id: "low_c3", label: "Low C3" },
  { id: "low_c4", label: "Low C4" },
  { id: "positive_ana", label: "ANA positive" },
  { id: "positive_anca", label: "ANCA positive" },
  { id: "high_aso", label: "High ASO titer" },
  { id: "iga_high", label: "IgA elevated" },
  { id: "microangiopathy", label: "Microangiopathic picture" },
];

const DIFFERENTIALS = [
  {
    id: "mns",
    name: "Minimal Change NS",
    match_symptoms: ["proteinuria", "edema", "weight_gain"],
    match_labs: ["low_albumin"],
    exclude_symptoms: ["hematuria", "rash", "arthritis"],
    priority: "HIGH",
    age: "2–10 years",
    investigations: ["Urine protein:creatinine ratio", "Serum albumin", "Renal function", "Lipid panel"],
    biopsy_trigger: "Steroid resistance at 8 weeks",
    pathway: "ClinicalSupport"
  },
  {
    id: "psgn",
    name: "Post-Streptococcal GN",
    match_symptoms: ["hematuria", "hypertension", "edema", "oliguria"],
    match_labs: ["low_c3", "high_aso", "high_creatinine"],
    exclude_symptoms: [],
    priority: "HIGH",
    age: "5–15 years",
    investigations: ["ASO titer", "Anti-DNase B", "C3/C4", "Throat/skin swab", "Renal biopsy if atypical"],
    biopsy_trigger: "Persistent low C3 >8 weeks, atypical course",
    pathway: "ClinicalSupport"
  },
  {
    id: "igan",
    name: "IgA Nephropathy",
    match_symptoms: ["hematuria_gross", "proteinuria"],
    match_labs: ["iga_high", "high_creatinine"],
    exclude_symptoms: ["edema", "rash"],
    priority: "MODERATE",
    age: "Adolescents, school-age",
    investigations: ["Serum IgA", "Urine PCR", "Renal biopsy (definitive)", "BP monitoring"],
    biopsy_trigger: "Persistent proteinuria >1g/day or rising creatinine",
    pathway: "Guidelines"
  },
  {
    id: "hsp_nephritis",
    name: "IgA Vasculitis Nephritis (HSP)",
    match_symptoms: ["rash", "arthritis", "hematuria", "proteinuria"],
    match_labs: ["iga_high"],
    exclude_symptoms: [],
    priority: "HIGH",
    age: "3–15 years",
    investigations: ["Urine PCR", "Serum IgA", "Renal biopsy if severe proteinuria", "Complement levels"],
    biopsy_trigger: "Proteinuria >1g/day, nephrotic or nephritic syndrome",
    pathway: "ClinicalSupport"
  },
  {
    id: "lupus_nephritis",
    name: "Lupus Nephritis",
    match_symptoms: ["proteinuria", "hematuria", "hypertension", "rash", "fever"],
    match_labs: ["positive_ana", "low_c3", "low_c4", "low_albumin"],
    exclude_symptoms: [],
    priority: "HIGH",
    age: "Adolescent girls",
    investigations: ["ANA, anti-dsDNA, anti-Sm", "C3/C4", "Urine PCR", "Renal biopsy (class)"],
    biopsy_trigger: "All confirmed cases for classification",
    pathway: "ClinicalSupport"
  },
  {
    id: "anca_vasculitis",
    name: "ANCA Vasculitis (MPA/GPA)",
    match_symptoms: ["hematuria", "oliguria", "fever", "hypertension"],
    match_labs: ["positive_anca", "high_creatinine"],
    exclude_symptoms: [],
    priority: "URGENT",
    age: "All ages (rare in young children)",
    investigations: ["ANCA (MPO/PR3)", "BVAS score", "Renal biopsy", "CXR (pulmonary involvement)"],
    biopsy_trigger: "Urgent — crescentic GN can progress rapidly",
    pathway: "ClinicalSupport"
  },
  {
    id: "hus",
    name: "HUS / TMA",
    match_symptoms: ["oliguria", "hematuria", "hypertension"],
    match_labs: ["microangiopathy", "high_creatinine"],
    exclude_symptoms: [],
    priority: "URGENT",
    age: "< 5 years (typical), any age (atypical)",
    investigations: ["FBC (fragmented RBCs)", "LDH, haptoglobin", "Stool culture (STEC)", "ADAMTS13 (TTP)", "Complement studies (aHUS)"],
    biopsy_trigger: "aHUS — biopsy for TMA confirmation",
    pathway: "EmergencyHub"
  },
  {
    id: "genetic_ns",
    name: "Genetic / Congenital NS",
    match_symptoms: ["proteinuria", "edema"],
    match_labs: ["low_albumin"],
    exclude_symptoms: [],
    priority: "MODERATE",
    age: "< 3 months (congenital), any age (SRNS)",
    investigations: ["Genetic panel (NPHS1, NPHS2, WT1, LAMB2)", "Renal biopsy", "Ophthalmology (Denys-Drash)"],
    biopsy_trigger: "Early SRNS or neonatal proteinuria",
    pathway: "GeneticReportAnalyzer"
  },
];

function score(ddx, symptoms, labs) {
  let s = 0;
  ddx.match_symptoms.forEach(sym => { if (symptoms.includes(sym)) s += 2; });
  ddx.match_labs.forEach(lab => { if (labs.includes(lab)) s += 2; });
  ddx.exclude_symptoms.forEach(ex => { if (symptoms.includes(ex)) s -= 3; });
  return s;
}

const PRIORITY_CONFIG = {
  URGENT: "bg-red-600 text-white",
  HIGH: "bg-orange-500 text-white",
  MODERATE: "bg-amber-400 text-slate-900",
};

export default function DifferentialDiagnosisPanel() {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [selectedLabs, setSelectedLabs] = useState([]);
  const [expanded, setExpanded] = useState(null);

  const toggleItem = (id, list, setList) => {
    setList(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const ranked = [...DIFFERENTIALS]
    .map(d => ({ ...d, score: score(d, selectedSymptoms, selectedLabs) }))
    .filter(d => d.score > 0)
    .sort((a, b) => b.score - a.score);

  const hasInput = selectedSymptoms.length > 0 || selectedLabs.length > 0;

  return (
    <div className="space-y-4">
      {/* Symptom selector */}
      <div>
        <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Select Symptoms / Signs</p>
        <div className="flex flex-wrap gap-1.5">
          {SYMPTOMS.map(s => (
            <button key={s.id} onClick={() => toggleItem(s.id, selectedSymptoms, setSelectedSymptoms)}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${selectedSymptoms.includes(s.id) ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"}`}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lab selector */}
      <div>
        <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Select Lab Findings</p>
        <div className="flex flex-wrap gap-1.5">
          {LABS.map(l => (
            <button key={l.id} onClick={() => toggleItem(l.id, selectedLabs, setSelectedLabs)}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${selectedLabs.includes(l.id) ? "bg-purple-600 text-white border-purple-600" : "bg-white text-slate-600 border-slate-200 hover:border-purple-300"}`}>
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Clear */}
      {hasInput && (
        <button onClick={() => { setSelectedSymptoms([]); setSelectedLabs([]); setExpanded(null); }}
          className="flex items-center gap-1 text-xs text-red-500 hover:underline">
          <X className="w-3 h-3" /> Clear all
        </button>
      )}

      {/* Results */}
      {!hasInput ? (
        <div className="text-center py-8 text-slate-400">
          <GitBranch className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Select symptoms and lab findings above to generate differentials</p>
        </div>
      ) : ranked.length === 0 ? (
        <div className="text-center py-6 text-slate-400 text-sm">
          No strong differentials matched. Try adding more findings.
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{ranked.length} Differentials Ranked by Evidence Match</p>
          {ranked.map((d, idx) => (
            <div key={d.id} className="border border-slate-200 rounded-xl bg-white overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === d.id ? null : d.id)}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-slate-50 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-xs font-bold text-slate-600">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-slate-900">{d.name}</p>
                  <p className="text-xs text-slate-500">Age: {d.age}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Badge className={`text-xs border-0 ${PRIORITY_CONFIG[d.priority] || "bg-slate-200 text-slate-700"}`}>{d.priority}</Badge>
                  <span className="text-xs text-slate-400">Score {d.score}</span>
                </div>
              </button>

              {expanded === d.id && (
                <div className="border-t border-slate-100 p-3 space-y-2 bg-slate-50">
                  <div className="bg-white border border-slate-200 rounded-lg p-2.5">
                    <p className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                      <FlaskConical className="w-3.5 h-3.5 text-blue-500" />Investigations
                    </p>
                    <ul className="space-y-0.5">
                      {d.investigations.map((inv, i) => (
                        <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                          <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />{inv}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {d.biopsy_trigger && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                      <p className="text-xs font-bold text-amber-800 flex items-center gap-1 mb-1">
                        <AlertTriangle className="w-3.5 h-3.5" />Biopsy Trigger
                      </p>
                      <p className="text-xs text-amber-700">{d.biopsy_trigger}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}