import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Sparkles, Pill, GitBranch, TrendingUp, FlaskConical, BookOpen, Dna, Droplet } from "lucide-react";

const NAV_ITEMS = [
  { label: "Hub", icon: Home, page: "Hub", color: "bg-blue-600 text-white", activeCheck: ["/Hub", "/"] },
  { label: "AI Prescriber", icon: Sparkles, page: "AIPrescriber", color: "bg-white text-slate-700", activeCheck: ["/AIPrescriber"] },
  { label: "Drugs & Dosing", icon: Pill, page: "DrugsDosing", color: "bg-white text-slate-700", activeCheck: ["/DrugsDosing", "/DrugCalculator"] },
  { label: "Nephrology & Urology", icon: Droplet, page: "UrologyNephrologyHub", color: "bg-white text-slate-700", activeCheck: ["/ClinicalSupport", "/UrologyNephrologyHub"] },
  { label: "Rare Disease", icon: Dna, page: "RareDiseaseModule", color: "bg-white text-slate-700", activeCheck: ["/RareDiseaseModule"] },
  { label: "Growth", icon: TrendingUp, page: "CalculatorsHub", color: "bg-white text-slate-700", activeCheck: ["/CalculatorsHub", "/BPPercentiles", "/SchwartzGFR", "/Anthropometry"] },
  { label: "Research", icon: FlaskConical, page: "ResearchHub", color: "bg-white text-slate-700", activeCheck: ["/ResearchHub", "/ResearchOS"] },
  { label: "Guidelines", icon: BookOpen, page: "Guidelines", color: "bg-white text-slate-700", activeCheck: ["/Guidelines"] },
];

export default function TopQuickAccessBar() {
  const location = useLocation();
  const p = location.pathname;

  return (
    <div className="bg-white border-b border-slate-200 px-3 overflow-x-auto">
      <div className="flex items-center gap-1 h-10 min-w-max">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.activeCheck.some(path =>
            path === "/" ? p === "/" || p === "/Hub" : p.startsWith(path)
          );
          return (
            <Link key={item.label} to={createPageUrl(item.page)}>
              <button
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-blue-600 text-white shadow"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}