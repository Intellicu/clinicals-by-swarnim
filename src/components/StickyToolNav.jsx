import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Sparkles, Pill, GitBranch, Baby, Layers, Home } from "lucide-react";

const NAV_ITEMS = [
  { label: "Hub", icon: Home, page: "Hub" },
  { label: "AI Prescriber", icon: Sparkles, page: "AIPrescriber" },
  { label: "Drugs & Dosing", icon: Pill, page: "DrugsDosing" },
  { label: "Pathways", icon: GitBranch, page: "ClinicalSupport" },
  { label: "Growth", icon: Baby, page: "Anthropometry" },
  { label: "Research", icon: Layers, page: "ResearchHub" },
];

export default function StickyToolNav() {
  const location = useLocation();

  return (
    <div className="bg-white border-b border-slate-200 shadow-sm overflow-x-auto">
      <div className="flex items-center gap-1 px-4 py-2 min-w-max">
        {NAV_ITEMS.map(({ label, icon: Icon, page }) => {
          const url = createPageUrl(page);
          const isActive = location.pathname === url || location.pathname === `/${page}`;
          return (
            <Link key={page} to={url}>
              <button
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}