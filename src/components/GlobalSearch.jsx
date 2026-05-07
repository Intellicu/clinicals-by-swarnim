import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, X, ArrowRight } from "lucide-react";

const SEARCH_INDEX = [
  // Clinical Pathways
  { title: "Nephrotic Syndrome Pathway", category: "Pathway", page: "ClinicalSupport", tags: ["NS", "proteinuria", "oedema", "prednisolone"] },
  { title: "AKI Management Pathway", category: "Pathway", page: "ClinicalSupport", tags: ["AKI", "acute kidney injury", "creatinine"] },
  { title: "CKD Staging Pathway", category: "Pathway", page: "ClinicalSupport", tags: ["CKD", "chronic kidney disease", "eGFR"] },
  { title: "Hypertension Pathway", category: "Pathway", page: "ClinicalSupport", tags: ["hypertension", "blood pressure", "BP"] },
  { title: "Electrolyte Disorders", category: "Pathway", page: "ClinicalSupport", tags: ["sodium", "potassium", "hyperkalemia", "hyponatremia"] },
  // Calculators
  { title: "Schwartz GFR Calculator", category: "Calculator", page: "SchwartzGFR", tags: ["GFR", "creatinine", "height", "eGFR"] },
  { title: "BP Percentiles", category: "Calculator", page: "BPPercentiles", tags: ["blood pressure", "percentile", "hypertension"] },
  { title: "Anthropometry / Growth", category: "Calculator", page: "Anthropometry", tags: ["weight", "height", "BSA", "BMI", "z-score"] },
  { title: "Dose Calculator", category: "Calculator", page: "DoseCalculator", tags: ["dose", "drug", "mg/kg", "renal adjustment"] },
  { title: "Fluid Calculator", category: "Calculator", page: "FluidCalculator", tags: ["fluid", "maintenance", "IV", "hydration"] },
  { title: "Sodium Correction", category: "Calculator", page: "SodiumCalculator", tags: ["sodium", "hyponatremia", "dysnatremia"] },
  { title: "Potassium Management", category: "Calculator", page: "PotassiumCalculator", tags: ["potassium", "hyperkalemia", "hypokalaemia"] },
  { title: "AKI Staging (KDIGO)", category: "Calculator", page: "AKIStager", tags: ["AKI", "staging", "KDIGO", "creatinine"] },
  { title: "CKD Stage Calculator", category: "Calculator", page: "CKDStager", tags: ["CKD", "staging", "GFR"] },
  { title: "FENa Calculator", category: "Calculator", page: "FENaCalculator", tags: ["FENa", "sodium", "fractional excretion"] },
  { title: "Kt/V Dialysis Adequacy", category: "Calculator", page: "KtVCalculator", tags: ["KtV", "dialysis", "adequacy"] },
  { title: "ABG Interpreter", category: "Calculator", page: "ABGInterpreter", tags: ["ABG", "acid base", "pH", "blood gas"] },
  // Drugs
  { title: "AI Prescriber", category: "AI Tool", page: "AIPrescriber", tags: ["prescription", "prescriber", "drug plan", "dosing", "AI"] },
  { title: "Drugs & Dosing", category: "Drug Tool", page: "DrugsDosing", tags: ["drugs", "dosing", "dose", "prescription"] },
  { title: "Drug Database", category: "Drug Tool", page: "DrugCalculator", tags: ["drug", "database", "formulary", "Indian"] },
  // AI / Clinical
  { title: "AI Clinical Pathway", category: "AI Tool", page: "AIClinicalPathway", tags: ["AI", "pathway", "clinical decision"] },
  { title: "Clinical Support Hub", category: "AI Tool", page: "ClinicalSupport", tags: ["differential", "diagnosis", "clinical"] },
  { title: "AI Lab Analyzer", category: "AI Tool", page: "ClinicalAIHub", tags: ["lab", "analyzer", "AI", "results"] },
  { title: "Genetic Report Analyzer", category: "AI Tool", page: "GeneticReportAnalyzer", tags: ["genetic", "DNA", "variant", "ACMG"] },
  { title: "AI Assistant", category: "AI Tool", page: "AIAssistant", tags: ["chatbot", "AI", "assistant"] },
  // Research
  { title: "Research Hub", category: "Research", page: "ResearchHub", tags: ["research", "REDCap", "study", "data"] },
  { title: "Research Methods Hub", category: "Research", page: "ResearchMethodsHub", tags: ["RCT", "cohort", "PRISMA", "meta-analysis", "sample size"] },
  // Clinical Management
  { title: "Clinic Dashboard", category: "Clinic", page: "ClinicDashboard", tags: ["clinic", "patients", "appointments"] },
  { title: "RRT Assistant", category: "Dialysis", page: "RRTAssistant", tags: ["RRT", "dialysis", "HD", "PD", "CRRT"] },
  { title: "Guidelines Library", category: "Guidelines", page: "Guidelines", tags: ["guidelines", "KDIGO", "IPNA", "IAP"] },
  { title: "Teaching Hub", category: "Education", page: "TeachingHub", tags: ["teaching", "learning", "modules", "education"] },
  { title: "Growth Monitoring", category: "Calculator", page: "PediatricsHub", tags: ["growth", "WHO", "z-score", "nutrition"] },
  { title: "Diet Generator", category: "Tool", page: "DietGenerator", tags: ["diet", "nutrition", "renal", "CKD diet"] },
  { title: "Patient Manager", category: "Clinic", page: "PatientManager", tags: ["patient", "records", "manage"] },
  { title: "Monitoring Hub", category: "Tool", page: "MonitoringHub", tags: ["monitoring", "templates", "dipstick"] },
  { title: "Prediction Tools", category: "Calculator", page: "PredictionTools", tags: ["prediction", "risk", "IgAN", "SRNS"] },
];

const CATEGORY_COLORS = {
  "Pathway": "bg-blue-100 text-blue-700",
  "Calculator": "bg-green-100 text-green-700",
  "Drug Tool": "bg-pink-100 text-pink-700",
  "AI Tool": "bg-violet-100 text-violet-700",
  "Research": "bg-purple-100 text-purple-700",
  "Clinic": "bg-orange-100 text-orange-700",
  "Dialysis": "bg-cyan-100 text-cyan-700",
  "Guidelines": "bg-amber-100 text-amber-700",
  "Education": "bg-teal-100 text-teal-700",
  "Tool": "bg-slate-100 text-slate-700",
};

export default function GlobalSearch({ placeholder = "Search pathways, drugs, calculators...", className = "" }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(0);
  const navigate = useNavigate();
  const containerRef = useRef();

  useEffect(() => {
    if (!query.trim()) { setResults([]); setOpen(false); return; }
    const q = query.toLowerCase();
    const matches = SEARCH_INDEX.filter(item =>
      item.title.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.tags.some(t => t.toLowerCase().includes(q))
    ).slice(0, 8);
    setResults(matches);
    setOpen(matches.length > 0);
    setFocused(0);
  }, [query]);

  useEffect(() => {
    const handler = (e) => {
      if (!containerRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const navigate_to = (page) => {
    navigate(createPageUrl(page));
    setQuery("");
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if (!open) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setFocused(f => Math.min(f + 1, results.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setFocused(f => Math.max(f - 1, 0)); }
    if (e.key === "Enter" && results[focused]) navigate_to(results[focused].page);
    if (e.key === "Escape") setOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <Input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query && results.length && setOpen(true)}
          placeholder={placeholder}
          className="pl-9 pr-8 text-sm h-9"
        />
        {query && (
          <button onClick={() => { setQuery(""); setOpen(false); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden">
          {results.map((item, i) => (
            <button
              key={i}
              onClick={() => navigate_to(item.page)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 ${focused === i ? "bg-indigo-50" : ""}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-800 truncate">{item.title}</span>
                  <Badge className={`text-xs shrink-0 ${CATEGORY_COLORS[item.category] || "bg-slate-100 text-slate-700"}`}>
                    {item.category}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 truncate">{item.tags.slice(0, 4).join(" · ")}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}