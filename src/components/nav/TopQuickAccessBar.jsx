import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Sparkles, Pill, Bot, FlaskConical, BookOpen, Dna, Droplet, Baby } from "lucide-react";

const NAV_ITEMS = [
  { label: "Hub", icon: Home, page: "Hub", activeCheck: ["/Hub", "/"] },
  { label: "Guidelines", icon: BookOpen, page: "GuidelinesLibrary", activeCheck: ["/GuidelinesLibrary", "/Guidelines"] },
  { label: "Drugs & Dosing", icon: Pill, page: "DrugsDosing", activeCheck: ["/DrugsDosing", "/DrugCalculator"] },
  { label: "Nephrology & Urology", icon: Droplet, page: "UrologyNephrologyHub", activeCheck: ["/ClinicalSupport", "/UrologyNephrologyHub"] },
  { label: "Rare Disease", icon: Dna, page: "RareDiseaseModule", activeCheck: ["/RareDiseaseModule"] },
  { label: "General Pediatrics", icon: Baby, page: "GeneralPediatricsHub", activeCheck: ["/GeneralPediatricsHub"] },
  { label: "AI Agents", icon: Bot, path: "/AIAgentsHub", activeCheck: ["/AIAgentsHub"] },
  { label: "AI Prescriber", icon: Sparkles, page: "AIPrescriber", activeCheck: ["/AIPrescriber"] },
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
          const href = item.path || createPageUrl(item.page);
          return (
            <Link key={item.label} to={href}>
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