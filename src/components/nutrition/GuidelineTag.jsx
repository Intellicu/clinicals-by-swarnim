import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ChevronDown, ChevronUp } from "lucide-react";

const GUIDELINE_DATA = {
  "PRNT 2020": {
    full: "Pediatric Renal Nutrition Taskforce 2020",
    url: "https://doi.org/10.1007/s00467-019-04349-6",
    strength: "Strong",
    summary: "Evidence-based nutrition guidelines for children with kidney diseases covering energy, protein, fluid, and electrolyte management."
  },
  "KDIGO AKI 2012": {
    full: "KDIGO Clinical Practice Guideline for AKI (2012)",
    url: "https://kdigo.org/guidelines/aki/",
    strength: "Strong",
    summary: "Graded recommendations for AKI including nutrition support, protein targets, and avoiding early PN."
  },
  "KDOQI Pediatric 2009": {
    full: "KDOQI Clinical Practice Recommendations for Pediatric CKD (2009)",
    url: "https://www.kidney.org/professionals/guidelines",
    strength: "Moderate",
    summary: "Nutrition guidelines for CKD children including growth targets, protein intake, and micronutrient supplementation."
  },
  "WHO 2006": {
    full: "WHO Child Growth Standards (2006)",
    url: "https://www.who.int/tools/child-growth-standards",
    strength: "Strong",
    summary: "International reference standards for weight, height, BMI, and MUAC in children 0–5 years."
  },
  "WHO Growth Standards": {
    full: "WHO Growth Reference 5–19 years",
    url: "https://www.who.int/tools/growth-reference-data-for-5to19-years",
    strength: "Strong",
    summary: "BMI-for-age and height-for-age z-scores for school-age children and adolescents."
  },
  "AIIMS PICU": {
    full: "AIIMS PICU Nutritional Support Protocol",
    url: "#",
    strength: "Expert Opinion",
    summary: "Indian PICU context guidelines for enteral and parenteral nutrition in critically ill children."
  },
  "PYMS Tool": {
    full: "Paediatric Yorkhill Malnutrition Score (PYMS)",
    url: "#",
    strength: "Moderate",
    summary: "Validated 4-item nutritional screening tool for hospitalized children."
  },
  "STRONGkids": {
    full: "STRONGkids Nutritional Risk Screening Tool",
    url: "https://doi.org/10.1093/jn/nxab109",
    strength: "Moderate",
    summary: "Simple validated screening tool for hospitalized pediatric patients."
  },
  "ESPGHAN 2018": {
    full: "ESPGHAN Nutritional Guidelines 2018",
    url: "#",
    strength: "Strong",
    summary: "European guidelines for pediatric enteral and parenteral nutrition."
  },
  "ISPD 2016": {
    full: "ISPD Guidelines — PD Nutrition 2016",
    url: "#",
    strength: "Moderate",
    summary: "Peritoneal dialysis-specific nutritional requirements and supplementation protocols."
  }
};

const STRENGTH_COLORS = {
  "Strong": "bg-green-100 text-green-800",
  "Moderate": "bg-blue-100 text-blue-800",
  "Weak": "bg-yellow-100 text-yellow-800",
  "Expert Opinion": "bg-purple-100 text-purple-800"
};

export default function GuidelineTag({ sources = [], module = "General", compact = false }) {
  const [expanded, setExpanded] = useState(false);

  const validSources = sources.filter(s => GUIDELINE_DATA[s]);

  if (validSources.length === 0) return null;

  return (
    <div className="border border-blue-200 rounded-xl bg-blue-50 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-blue-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-blue-800">Guideline Sources</span>
          <div className="flex gap-1 flex-wrap">
            {validSources.slice(0, compact ? 2 : 4).map(s => (
              <Badge key={s} className="text-xs bg-blue-200 text-blue-800 border-0">{s}</Badge>
            ))}
            {validSources.length > (compact ? 2 : 4) && (
              <Badge className="text-xs bg-blue-200 text-blue-800 border-0">+{validSources.length - (compact ? 2 : 4)}</Badge>
            )}
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-blue-600" /> : <ChevronDown className="w-4 h-4 text-blue-600" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-2 border-t border-blue-200 pt-3">
          {validSources.map(s => {
            const g = GUIDELINE_DATA[s];
            return (
              <div key={s} className="bg-white rounded-lg p-3 border border-blue-100">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-xs font-semibold text-slate-800">{g.full}</p>
                  <Badge className={`text-xs shrink-0 ${STRENGTH_COLORS[g.strength] || "bg-gray-100 text-gray-700"}`}>
                    {g.strength}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600">{g.summary}</p>
                {g.url && g.url !== "#" && (
                  <a href={g.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline mt-1 block">
                    View Guideline →
                  </a>
                )}
              </div>
            );
          })}
          <p className="text-xs text-slate-400 mt-2">Module: {module} · Last reviewed 2024</p>
        </div>
      )}
    </div>
  );
}