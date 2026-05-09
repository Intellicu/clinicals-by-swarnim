import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Badge } from "@/components/ui/badge";
import {
  GitBranch, Pill, Calculator, BookOpen, Brain,
  FlaskConical, Activity, ChevronRight
} from "lucide-react";

// Keyword-based cross-link map
const KEYWORD_LINKS = {
  hyperkalemia: [
    { label: "AKI Pathway", icon: GitBranch, url: "ClinicalSupport", color: "bg-red-100 text-red-700 border-red-200" },
    { label: "Potassium Binders", icon: Pill, url: "DrugsDosing", color: "bg-purple-100 text-purple-700 border-purple-200" },
    { label: "K⁺ Calculator", icon: Calculator, url: "PotassiumCalculator", color: "bg-blue-100 text-blue-700 border-blue-200" },
    { label: "Dialysis Emergency", icon: Activity, url: "RRTAssistant", color: "bg-cyan-100 text-cyan-700 border-cyan-200" },
  ],
  nephrotic: [
    { label: "NS Pathway", icon: GitBranch, url: "ClinicalSupport", color: "bg-purple-100 text-purple-700 border-purple-200" },
    { label: "Prednisolone Dosing", icon: Pill, url: "DrugsDosing", color: "bg-blue-100 text-blue-700 border-blue-200" },
    { label: "NS Relapse Protocol", icon: Activity, url: "Guidelines", color: "bg-orange-100 text-orange-700 border-orange-200" },
    { label: "Urine Protein", icon: FlaskConical, url: "Proteinuria", color: "bg-teal-100 text-teal-700 border-teal-200" },
  ],
  aki: [
    { label: "AKI Stager", icon: Calculator, url: "AKIStager", color: "bg-red-100 text-red-700 border-red-200" },
    { label: "Fluid Calculator", icon: Calculator, url: "FluidCalculator", color: "bg-blue-100 text-blue-700 border-blue-200" },
    { label: "RRT Pathway", icon: Activity, url: "RRTAssistant", color: "bg-cyan-100 text-cyan-700 border-cyan-200" },
    { label: "AKI Pathway", icon: GitBranch, url: "ClinicalSupport", color: "bg-green-100 text-green-700 border-green-200" },
  ],
  ckd: [
    { label: "CKD Stager", icon: Calculator, url: "CKDStager", color: "bg-blue-100 text-blue-700 border-blue-200" },
    { label: "Schwartz GFR", icon: Calculator, url: "SchwartzGFR", color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
    { label: "Nutrition Hub", icon: Activity, url: "NutritionHub", color: "bg-green-100 text-green-700 border-green-200" },
    { label: "CKD Pathway", icon: GitBranch, url: "ClinicalSupport", color: "bg-teal-100 text-teal-700 border-teal-200" },
  ],
  hypertension: [
    { label: "BP Percentiles", icon: Calculator, url: "BPPercentiles", color: "bg-orange-100 text-orange-700 border-orange-200" },
    { label: "HTN Emergency", icon: Activity, url: "HypertensiveEmergency", color: "bg-red-100 text-red-700 border-red-200" },
    { label: "Antihypertensives", icon: Pill, url: "DrugsDosing", color: "bg-purple-100 text-purple-700 border-purple-200" },
    { label: "HTN Pathway", icon: GitBranch, url: "ClinicalSupport", color: "bg-blue-100 text-blue-700 border-blue-200" },
  ],
  dialysis: [
    { label: "Dialysis RRT", icon: Activity, url: "RRTAssistant", color: "bg-cyan-100 text-cyan-700 border-cyan-200" },
    { label: "Kt/V Calculator", icon: Calculator, url: "KtVCalculator", color: "bg-blue-100 text-blue-700 border-blue-200" },
    { label: "RRT Templates", icon: BookOpen, url: "RRTTemplates", color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
    { label: "Drug Dosing (RRT)", icon: Pill, url: "DrugsDosing", color: "bg-purple-100 text-purple-700 border-purple-200" },
  ],
  lupus: [
    { label: "LN Pathway", icon: GitBranch, url: "ClinicalSupport", color: "bg-rose-100 text-rose-700 border-rose-200" },
    { label: "Hydroxychloroquine", icon: Pill, url: "DrugsDosing", color: "bg-blue-100 text-blue-700 border-blue-200" },
    { label: "Renal Biopsy", icon: FlaskConical, url: "ClinicalSupport", color: "bg-orange-100 text-orange-700 border-orange-200" },
    { label: "AI Case Discussion", icon: Brain, url: "AIAssistant", color: "bg-purple-100 text-purple-700 border-purple-200" },
  ],
};

function getLinksForGuideline(guideline) {
  const text = (guideline.title + " " + (guideline.category || "") + " " + (guideline.tags?.join(" ") || "")).toLowerCase();
  const found = [];
  for (const [kw, links] of Object.entries(KEYWORD_LINKS)) {
    if (text.includes(kw)) {
      links.forEach(l => { if (!found.find(f => f.label === l.label)) found.push(l); });
    }
  }
  // Always add AI discussion
  if (!found.find(f => f.label === "AI Case Discussion")) {
    found.push({ label: "AI Case Discussion", icon: Brain, url: "AIAssistant", color: "bg-violet-100 text-violet-700 border-violet-200" });
  }
  return found.slice(0, 8);
}

export default function SmartRelatedContent({ guideline }) {
  const links = getLinksForGuideline(guideline);
  if (links.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
        <GitBranch className="w-3.5 h-3.5" />Smart Ecosystem Links
      </p>
      <div className="grid grid-cols-2 gap-1.5">
        {links.map((link, i) => (
          <Link key={i} to={createPageUrl(link.url)}>
            <div className={`flex items-center gap-1.5 p-2 rounded-lg border text-xs font-semibold hover:opacity-80 transition-opacity ${link.color}`}>
              <link.icon className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{link.label}</span>
              <ChevronRight className="w-3 h-3 ml-auto flex-shrink-0" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}