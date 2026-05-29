/**
 * HubDrugSearch — compact inline drug dosing widget for the Hub.
 * Shows below Quick Patient Entry. Search → tap → inline dose card.
 */
import React, { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Pill, Search, X, ChevronRight, Star } from "lucide-react";
import { usePatient } from "../PatientContext";

function calcDose(drug, wt) {
  const raw = drug.dose_weight_based || "";
  const freq = drug.frequency || "OD";
  if (!raw) return null;
  if (drug.dose_calculation_type === "TDM") return { type: "TDM" };

  if (raw.includes("/kg")) {
    const m = raw.match(/([\d.]+)(?:-?([\d.]+))?\s*(\w+)\/kg/);
    if (m && wt) {
      const min = parseFloat(m[1]) * wt;
      const max = m[2] ? parseFloat(m[2]) * wt : min;
      const unit = m[3];
      const perDose = m[2] ? `${min.toFixed(1)}–${max.toFixed(1)} ${unit}` : `${min.toFixed(1)} ${unit}`;
      return { perDose, freq, type: "weight" };
    }
  }
  return { perDose: raw, freq, type: "fixed" };
}

const CATEGORY_FILTERS = ["All", "Starred", "Immunosuppressant", "Antihypertensive", "Diuretic", "Antibiotic", "Emergency", "Corticosteroid"];

export default function HubDrugSearch() {
  const { patientData } = usePatient();
  const weight = patientData.weight ? parseFloat(patientData.weight) : null;

  const [query, setQuery] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [starredIds, setStarredIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem("hub_drug_stars") || "[]"); } catch { return []; }
  });

  const toggleStar = useCallback((drugId, e) => {
    e.stopPropagation();
    setStarredIds(prev => {
      const next = prev.includes(drugId) ? prev.filter(id => id !== drugId) : [...prev, drugId];
      localStorage.setItem("hub_drug_stars", JSON.stringify(next));
      return next;
    });
  }, []);

  const { data: drugs = [] } = useQuery({
    queryKey: ["drugs-full"],
    queryFn: () => base44.entities.Drug.list("generic_name", 200),
    staleTime: 10 * 60 * 1000,
  });

  const filtered = useMemo(() => {
    if (!query && catFilter === "All") {
      // Show starred first, then rest
      const starred = drugs.filter(d => starredIds.includes(d.id));
      const others = drugs.filter(d => !starredIds.includes(d.id)).slice(0, 20 - starred.length);
      return [...starred, ...others];
    }
    return drugs.filter(d => {
      const matchQ = !query ||
        d.generic_name?.toLowerCase().includes(query.toLowerCase()) ||
        d.brands_indian?.toLowerCase().includes(query.toLowerCase()) ||
        d.therapeutic_class?.toLowerCase().includes(query.toLowerCase());
      const matchCat = catFilter === "All" ? true :
        catFilter === "Starred" ? starredIds.includes(d.id) :
        d.category?.toLowerCase().includes(catFilter.toLowerCase()) ||
        d.therapeutic_class?.toLowerCase().includes(catFilter.toLowerCase());
      return matchQ && matchCat;
    });
  }, [drugs, query, catFilter, starredIds]);

  const dose = selectedDrug ? calcDose(selectedDrug, weight) : null;

  return (
    <div className="bg-white rounded-xl border border-purple-200 shadow-sm overflow-hidden">
      {/* Header — always visible */}
      <button
        className="w-full flex items-center justify-between px-3 py-2.5 bg-purple-50 border-b border-purple-100"
        onClick={() => { setExpanded(v => !v); if (!expanded) setSelectedDrug(null); }}
      >
        <div className="flex items-center gap-2">
          <Pill className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-bold text-purple-800">Drug Dosing Calculator</span>
          {weight && <span className="text-xs text-purple-500 bg-purple-100 px-1.5 py-0.5 rounded-full">{weight} kg</span>}
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={createPageUrl("DrugsDosing")}
            onClick={e => e.stopPropagation()}
            className="text-xs text-purple-600 font-semibold flex items-center gap-0.5 hover:underline"
          >
            Full <ChevronRight className="w-3 h-3" />
          </Link>
          <span className="text-slate-400 text-xs">{expanded ? "▲" : "▼"}</span>
        </div>
      </button>

      {expanded && (
        <div className="p-3 space-y-3">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={e => { setQuery(e.target.value); setSelectedDrug(null); }}
              placeholder="Search drug, brand, or class…"
              className="w-full pl-9 pr-8 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
            {query && (
              <button onClick={() => { setQuery(""); setSelectedDrug(null); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category chips — horizontal scroll */}
          <div className="flex gap-1.5 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
            {CATEGORY_FILTERS.map(cat => (
              <button
                key={cat}
                onClick={() => { setCatFilter(cat); setSelectedDrug(null); }}
                className={`flex-shrink-0 px-2.5 py-1 text-xs font-medium rounded-full border transition-all ${catFilter === cat ? "bg-purple-600 text-white border-purple-600" : "bg-white border-slate-200 text-slate-600"}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Inline dose card when a drug is selected */}
          {selectedDrug && (
            <div className="bg-purple-50 border-2 border-purple-300 rounded-xl p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-purple-900 text-sm">{selectedDrug.generic_name}</p>
                  <p className="text-xs text-purple-600">{selectedDrug.therapeutic_class}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Link to={`${createPageUrl("DrugsDosing")}?drug=${encodeURIComponent(selectedDrug.generic_name)}`}
                    className="text-xs bg-purple-600 text-white px-2.5 py-1.5 rounded-lg font-semibold">
                    Full Details
                  </Link>
                  <button onClick={() => setSelectedDrug(null)} className="text-slate-400">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {dose?.type === "TDM" ? (
                <p className="text-xs text-blue-800 bg-blue-50 border border-blue-200 rounded-lg px-2 py-1.5">
                  <strong>TDM-guided dosing</strong> — therapeutic drug monitoring required
                </p>
              ) : dose ? (
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white border border-purple-200 rounded-xl p-2.5 text-center">
                    <p className="text-[10px] text-slate-500 uppercase">Per Dose{weight ? ` (${weight} kg)` : ""}</p>
                    <p className="font-bold text-purple-800 text-sm mt-0.5">{dose.perDose}</p>
                    {!weight && <p className="text-[10px] text-amber-600 mt-0.5">Enter weight above</p>}
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-2.5 text-center">
                    <p className="text-[10px] text-slate-500 uppercase">Frequency</p>
                    <p className="font-bold text-slate-800 text-sm mt-0.5">{dose.freq}</p>
                  </div>
                </div>
              ) : null}

              {selectedDrug.route && (
                <p className="text-xs text-slate-500">Route: <strong>{selectedDrug.route}</strong></p>
              )}
              {selectedDrug.renal_adjust && (
                <p className="text-xs text-indigo-700 bg-indigo-50 rounded-lg px-2 py-1.5">
                  ⚠️ Renal: {selectedDrug.renal_adjust}
                </p>
              )}
            </div>
          )}

          {/* Drug list */}
          <div className="space-y-1 max-h-52 overflow-y-auto">
            {filtered.map(drug => {
              const isSelected = selectedDrug?.id === drug.id;
              const isStarred = starredIds.includes(drug.id);
              return (
                <button
                  key={drug.id}
                  onClick={() => setSelectedDrug(isSelected ? null : drug)}
                  className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all min-h-[48px] ${isSelected ? "border-purple-400 bg-purple-50" : "border-slate-200 bg-white hover:border-purple-300"}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isSelected ? "bg-purple-600" : "bg-slate-100"}`}>
                    <Pill className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-slate-500"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 leading-tight">{drug.generic_name}</p>
                    <p className="text-xs text-slate-400 truncate">{drug.therapeutic_class || drug.category}</p>
                  </div>
                  {drug.renal_adjust && (
                    <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full flex-shrink-0">⚠️ Renal</span>
                  )}
                  <button onClick={e => toggleStar(drug.id, e)} className="flex-shrink-0 p-1 rounded-full hover:bg-yellow-50" title={isStarred ? "Unstar" : "Star for quick access"}>
                    <Star className={`w-3.5 h-3.5 ${isStarred ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}`} />
                  </button>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <p className="text-center text-sm text-slate-400 py-6">No drugs found</p>
            )}
          </div>

          {/* Footer link */}
          <Link to={createPageUrl("DrugsDosing")} className="flex items-center justify-center gap-1.5 w-full py-2 text-xs font-semibold text-purple-600 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
            Open Full Drug Dosing Calculator <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}