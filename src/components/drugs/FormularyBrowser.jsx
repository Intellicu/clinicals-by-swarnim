import React, { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Search, Pill, ChevronRight, AlertTriangle, Shield,
  FlaskConical, Activity, CheckCircle, X, Plus
} from "lucide-react";
import { FORMULARY, FORMULARY_CATEGORIES, searchFormulary } from "@/lib/formulary/nephrology-drugs";
import FormularyMonograph from "./FormularyMonograph";

const CLASS_BADGE_COLORS = {
  "Corticosteroid": "bg-orange-100 text-orange-800",
  "Calcineurin Inhibitor": "bg-purple-100 text-purple-800",
  "Antimetabolite": "bg-blue-100 text-blue-800",
  "Alkylating Agent": "bg-red-100 text-red-800",
  "Biologic": "bg-pink-100 text-pink-800",
  "Complement Inhibitor": "bg-teal-100 text-teal-800",
  "ACE Inhibitor": "bg-green-100 text-green-800",
  "ARB": "bg-emerald-100 text-emerald-800",
  "Calcium Channel Blocker": "bg-amber-100 text-amber-800",
  "Beta Blocker": "bg-slate-100 text-slate-800",
  "Diuretic": "bg-cyan-100 text-cyan-800",
  "CKD-MBD": "bg-indigo-100 text-indigo-800",
  "ESA": "bg-rose-100 text-rose-800",
  "Iron Supplement": "bg-orange-100 text-orange-800",
  "Antibiotic": "bg-lime-100 text-lime-800",
  "Antifungal": "bg-yellow-100 text-yellow-800",
  "Antiviral": "bg-sky-100 text-sky-800",
  "Emergency": "bg-red-100 text-red-800",
  "Immunomodulator": "bg-violet-100 text-violet-800",
};

function getBadgeClass(cls) {
  if (!cls) return "bg-slate-100 text-slate-700";
  for (const [key, val] of Object.entries(CLASS_BADGE_COLORS)) {
    if (cls.includes(key)) return val;
  }
  return "bg-slate-100 text-slate-700";
}

export default function FormularyBrowser({ weight, height, egfr, initialSearch = "", patientName, patientId, encounterId, onPrescriptionSaved, onAddToRx }) {
  const [query, setQuery] = useState(initialSearch);
  const [catFilter, setCatFilter] = useState("All");
  const [selected, setSelected] = useState(null);

  const allDrugs = useMemo(() => Object.values(FORMULARY), []);

  // Auto-select when coming from search link
  useEffect(() => {
    if (initialSearch) {
      const match = allDrugs.find(d =>
        d.generic?.toLowerCase().replace(/\s+/g, "") === initialSearch.toLowerCase().replace(/\s+/g, "") ||
        d.generic?.toLowerCase().includes(initialSearch.toLowerCase())
      );
      if (match) setSelected(match);
    }
  }, [initialSearch, allDrugs]);

  const filtered = useMemo(() => {
    let results = allDrugs;
    if (query.length >= 2) {
      const q = query.toLowerCase();
      results = results.filter(d =>
        d.generic?.toLowerCase().includes(q) ||
        d.class?.toLowerCase().includes(q) ||
        d.indications?.toLowerCase().includes(q) ||
        d.formulations?.some(f => f.brands?.toLowerCase().includes(q))
      );
    }
    if (catFilter !== "All") {
      results = results.filter(d =>
        d.class?.includes(catFilter) ||
        d.class?.toLowerCase().includes(catFilter.toLowerCase())
      );
    }
    return results;
  }, [allDrugs, query, catFilter]);

  const bsa = useMemo(() => {
    const h = parseFloat(height), w = parseFloat(weight);
    if (h && w) return parseFloat(Math.sqrt((h * w) / 3600).toFixed(3));
    return null;
  }, [height, weight]);

  return (
    <div className="space-y-4">
      {/* Search & filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search drug name, brand, indication..."
            className="pl-9 text-sm"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category pills */}
      <div className="flex gap-1.5 flex-wrap">
        {FORMULARY_CATEGORIES.slice(0, 12).map(cat => (
          <button
            key={cat}
            onClick={() => setCatFilter(cat)}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-full border transition-all ${catFilter === cat
              ? "bg-indigo-600 text-white border-indigo-600"
              : "bg-white border-slate-300 text-slate-600 hover:border-indigo-400"
            }`}
          >
            {cat}
          </button>
        ))}
        <button
          onClick={() => setCatFilter("All")}
          className="px-2.5 py-1 text-[11px] font-medium rounded-full border border-slate-300 text-slate-500 hover:border-slate-400 bg-white"
        >
          More...
        </button>
      </div>

      {/* Count */}
      <p className="text-xs text-slate-500">{filtered.length} drug{filtered.length !== 1 ? "s" : ""} in formulary</p>

      {/* Selected drug monograph */}
      {selected && (
        <Card className="bg-white border-2 border-indigo-300 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-3 px-4 rounded-t-lg">
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardTitle className="text-base font-bold">{selected.generic}</CardTitle>
                <p className="text-indigo-200 text-xs mt-0.5">{selected.class}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-white/70 hover:text-white mt-0.5">
                <X className="w-5 h-5" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {selected.indications && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 mb-3">
                <p className="text-xs font-semibold text-blue-700 mb-0.5">INDICATIONS</p>
                <p className="text-xs text-blue-800">{selected.indications}</p>
              </div>
            )}
            {/* onAddToRx mode: show a prominent Add to Rx button inline */}
            {onAddToRx && (
              <div className="mb-3">
                <Button
                  onClick={() => onAddToRx(selected)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Add {selected.generic} to Prescription
                </Button>
              </div>
            )}
            <FormularyMonograph
              drug={selected}
              weight={weight}
              bsa={bsa}
              egfr={egfr}
              patientName={patientName}
              patientId={patientId}
              encounterId={encounterId}
              onPrescriptionSaved={onPrescriptionSaved}
            />
          </CardContent>
        </Card>
      )}

      {/* Drug list */}
      <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-0.5">
        {filtered.map((drug, i) => {
          const isSelected = selected?.generic === drug.generic;
          const hasRenalNote = egfr && parseFloat(egfr) < 30 && drug.renal_adjust;
          return (
            <button
              key={i}
              onClick={() => setSelected(isSelected ? null : drug)}
              className={`w-full text-left flex items-center gap-3 px-3 py-3 rounded-xl border-2 transition-all ${isSelected
                ? "border-indigo-400 bg-indigo-50"
                : "border-slate-200 bg-white hover:border-indigo-300"
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isSelected ? "bg-indigo-600" : "bg-slate-100"}`}>
                <Pill className={`w-4 h-4 ${isSelected ? "text-white" : "text-slate-500"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-slate-900 leading-tight">{drug.generic}</p>
                <p className="text-xs text-slate-400 truncate mt-0.5">
                  {drug.formulations?.[0]?.brands?.split(",")[0]?.trim() || "Multiple brands"}
                  {drug.formulations?.length > 1 && ` · ${drug.formulations.length} formulations`}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <Badge className={`text-[10px] font-medium px-1.5 py-0 ${getBadgeClass(drug.class)}`}>
                  {drug.class?.split(" ")[0]}
                </Badge>
                {hasRenalNote && (
                  <span className="text-[10px] font-bold text-amber-600 flex items-center gap-0.5">
                    <AlertTriangle className="w-2.5 h-2.5" /> eGFR
                  </span>
                )}
              </div>
              {!isSelected && <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />}
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <Pill className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No drugs found for "{query}"</p>
          </div>
        )}
      </div>
    </div>
  );
}