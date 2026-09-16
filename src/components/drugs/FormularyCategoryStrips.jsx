/**
 * FormularyCategoryStrips
 *
 * Renders horizontal scrollable strips for each Drug formulary_category.
 * Drug cards show name only — tap to open full monograph.
 */
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/client";
import { Pill, ChevronRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const FORMULARY_CATEGORIES = [
  { key: "Steroids", label: "Steroids", color: "from-orange-500 to-amber-500", bg: "bg-orange-50", border: "border-orange-200" },
  { key: "Calcineurin Inhibitors", label: "Calcineurin Inhibitors", color: "from-purple-600 to-violet-600", bg: "bg-purple-50", border: "border-purple-200" },
  { key: "Antimetabolites", label: "Antimetabolites", color: "from-blue-600 to-indigo-600", bg: "bg-blue-50", border: "border-blue-200" },
  { key: "Alkylating Agents", label: "Alkylating Agents", color: "from-red-600 to-rose-600", bg: "bg-red-50", border: "border-red-200" },
  { key: "Biologics", label: "Biologics", color: "from-pink-600 to-fuchsia-600", bg: "bg-pink-50", border: "border-pink-200" },
  { key: "RAAS Blockers", label: "RAAS Blockers", color: "from-green-600 to-teal-600", bg: "bg-green-50", border: "border-green-200" },
  { key: "Diuretics", label: "Diuretics", color: "from-cyan-600 to-sky-600", bg: "bg-cyan-50", border: "border-cyan-200" },
  { key: "CKD-MBD", label: "CKD-MBD", color: "from-indigo-600 to-blue-700", bg: "bg-indigo-50", border: "border-indigo-200" },
  { key: "ESA & Iron", label: "ESA & Iron", color: "from-rose-600 to-red-600", bg: "bg-rose-50", border: "border-rose-200" },
  { key: "Immunization & Infection Prophylaxis", label: "Vaccines & Prophylaxis", color: "from-emerald-600 to-green-700", bg: "bg-emerald-50", border: "border-emerald-200" },
  { key: "Transplant Medications", label: "Transplant", color: "from-violet-600 to-purple-700", bg: "bg-violet-50", border: "border-violet-200" },
  { key: "Dialysis Medications", label: "Dialysis Meds", color: "from-sky-600 to-blue-600", bg: "bg-sky-50", border: "border-sky-200" },
  { key: "Emergency", label: "Emergency", color: "from-red-700 to-orange-700", bg: "bg-red-50", border: "border-red-300" },
  { key: "Other", label: "Other Drugs", color: "from-slate-600 to-slate-700", bg: "bg-slate-50", border: "border-slate-200" },
];

function CategoryStrip({ category, onSelect }) {
  const { data: drugs = [], isLoading } = useQuery({
    queryKey: ["formulary-strip", category.key],
    queryFn: () => base44.entities.Drug.filter({
      formulary_category: category.key,
      is_duplicate_hidden: { $ne: true },
    }, "generic_name", 30),
    staleTime: 5 * 60 * 1000,
  });

  if (!isLoading && drugs.length === 0) return null;

  return (
    <div className={`rounded-xl border ${category.border} overflow-hidden`}>
      <div className={`flex items-center justify-between px-3 py-2 bg-gradient-to-r ${category.color}`}>
        <div className="flex items-center gap-2">
          <Pill className="w-3.5 h-3.5 text-white" />
          <span className="text-xs font-bold text-white">{category.label}</span>
          {!isLoading && <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded-full font-semibold">{drugs.length}</span>}
        </div>
        <Link
          to={`${createPageUrl("DrugsDosing")}?cat=${encodeURIComponent(category.key)}`}
          className="text-white/80 hover:text-white"
          onClick={e => e.stopPropagation()}
        >
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className={`${category.bg} px-2 py-2`}>
        {isLoading ? (
          <div className="flex items-center gap-2 py-1 px-1">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
            <span className="text-xs text-slate-400">Loading...</span>
          </div>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {drugs.map(drug => (
              <button
                key={drug.id}
                onClick={() => onSelect?.(drug)}
                className="flex-shrink-0 bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 rounded-lg px-3 py-2 text-left transition-all"
              >
                <p className="text-xs font-semibold text-slate-900 whitespace-nowrap">{drug.generic_name}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function FormularyCategoryStrips({ onSelectDrug }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Pill className="w-4 h-4 text-indigo-600" />
        <h2 className="text-sm font-bold text-slate-700">Formulary by Drug Class</h2>
        <span className="text-xs text-slate-400 ml-auto">Tap a drug to open monograph</span>
      </div>
      {FORMULARY_CATEGORIES.map(cat => (
        <CategoryStrip key={cat.key} category={cat} onSelect={onSelectDrug} />
      ))}
    </div>
  );
}