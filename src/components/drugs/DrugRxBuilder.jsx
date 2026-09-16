/**
 * DrugRxBuilder — Drug search + indication picker + prescription draft
 * 
 * Replaces static template prescribing in AIPrescriber Step 3.
 * - Searches the Drug entity (prescribable, non-hidden records only)
 * - For each added drug, embeds IndicationPickerEngine → RxDraftPanel flow inline
 * - Produces a finalized drug list for PrescriptionPreview
 */
import React, { useState, useCallback } from "react";
import { base44 } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Search, Pill, X, Plus, CheckCircle, AlertTriangle,
  FileText, ChevronDown, ChevronUp, Loader2
} from "lucide-react";
import { toast } from "sonner";
import IndicationPickerEngine from "./IndicationPickerEngine";

// ── Inline Rx card for a single drug ─────────────────────────────────────────
function DrugRxCard({ drug, weight, bsa, egfr, onFinalized, onRemove }) {
  const [phase, setPhase] = useState("picking"); // "picking" | "draft" | "done"
  const [rxState, setRxState] = useState(null); // { rule, calc } | { manual }
  const [overrides, setOverrides] = useState({
    dose: "", unit: "mg", frequency: "", route: "PO", duration: "", instructions: "", indicationName: ""
  });
  const [expanded, setExpanded] = useState(true);

  const handleRuleSelected = (rule, calc) => {
    setRxState({ rule, calc });
    const doseStr = calc?.finalDose != null ? String(calc.finalDose) : "";
    const unit = rule.dose_unit?.includes("kg") || rule.dose_unit?.includes("m")
      ? "mg"
      : rule.dose_unit?.replace(/\/.*/, "") || "mg";
    setOverrides({
      dose: doseStr,
      unit,
      frequency: rule.frequency || "",
      route: rule.route || "PO",
      duration: rule.duration_days > 0 ? `${rule.duration_days} days` : "",
      instructions: rule.duration_notes || "",
      indicationName: rule.indication || "",
    });
    setPhase("draft");
  };

  const handleManualSelected = (manual) => {
    setRxState({ manual });
    setOverrides({
      dose: manual.dose || "",
      unit: manual.unit || "mg",
      frequency: manual.frequency || "",
      route: manual.route || "PO",
      duration: manual.duration || "",
      instructions: "",
      indicationName: manual.indication || "",
    });
    setPhase("draft");
  };

  const handleConfirm = () => {
    if (!overrides.dose || !overrides.frequency) {
      toast.error("Enter dose and frequency before confirming");
      return;
    }
    // Build calc trail if we have a rule + calc
    let calcTrail = "";
    if (rxState?.rule && rxState?.calc) {
      const { rule, calc } = rxState;
      calcTrail = `${drug.generic_name || drug.name} — ${rule.indication}\n`;
      calcTrail += `  ${calc.basisLabel} = ${calc.finalDose} mg`;
      if (calc.capped) calcTrail += `\n  Max cap ${calc.capVal} mg → ${calc.finalDose} mg`;
      if (rule.rounding_strategy && rule.rounding_strategy !== "exact") calcTrail += `\n  Rounded (${rule.rounding_strategy.replace("_"," ")}) → ${calc.finalDose} mg`;
      calcTrail += `\n  Frequency: ${rule.frequency || "—"}`;
      if (rule.duration_days > 0) calcTrail += ` × ${rule.duration_days} days`;
      if (rule.guideline_source) calcTrail += `  (${rule.guideline_source})`;
    }
    onFinalized({
      drug_name: drug.generic_name || drug.name,
      indication: overrides.indicationName,
      dose: overrides.dose,
      unit: overrides.unit,
      frequency: overrides.frequency,
      route: overrides.route,
      duration: overrides.duration,
      instructions: overrides.instructions,
      calcTrail,
      isManual: !!rxState?.manual,
    });
    setPhase("done");
    setExpanded(false);
  };

  const prescriptionLine = [
    drug.generic_name || drug.name,
    `${overrides.dose} ${overrides.unit}`,
    overrides.frequency,
    overrides.route,
    overrides.duration ? `× ${overrides.duration}` : "",
    overrides.indicationName ? `[${overrides.indicationName}]` : "",
  ].filter(Boolean).join(" ");

  return (
    <div className={`border-2 rounded-xl overflow-hidden transition-all ${phase === "done" ? "border-emerald-400 bg-emerald-50" : "border-slate-300 bg-white"}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {phase === "done"
            ? <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            : <Pill className="w-4 h-4 text-indigo-600 flex-shrink-0" />}
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">{drug.generic_name || drug.name}</p>
            {phase === "done" && (
              <p className="text-xs text-emerald-700 font-mono truncate">{prescriptionLine}</p>
            )}
            {overrides.indicationName && phase !== "done" && (
              <Badge className="bg-blue-100 text-blue-700 text-[10px] mt-0.5">{overrides.indicationName}</Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
          {phase === "done" && (
            <button onClick={() => { setPhase("draft"); setExpanded(true); }}
              className="text-xs text-slate-400 hover:text-blue-600 px-1">Edit</button>
          )}
          <button onClick={() => setExpanded(v => !v)} className="p-1 text-slate-400 hover:text-slate-600">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button onClick={onRemove} className="p-1 text-slate-300 hover:text-red-500">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      {expanded && (
        <div className="border-t border-slate-200 px-3 py-3 space-y-3">
          {/* Phase: picking indication */}
          {phase === "picking" && (
            <IndicationPickerEngine
              drug={drug}
              weight={weight}
              bsa={bsa}
              egfr={egfr}
              onRuleSelected={handleRuleSelected}
              onManualSelected={handleManualSelected}
            />
          )}

          {/* Phase: draft (editable overrides) */}
          {phase === "draft" && (
            <div className="space-y-3">
              {rxState?.manual && (
                <Alert className="bg-orange-50 border-orange-300 py-1.5">
                  <AlertDescription className="text-orange-800 text-xs">⚠ Manually entered — not system-calculated. Verify independently.</AlertDescription>
                </Alert>
              )}
              {rxState?.rule && rxState?.calc && (
                <div className="bg-slate-50 rounded-xl px-3 py-2 border border-slate-200 font-mono text-xs text-slate-700 space-y-0.5">
                  <p className="font-bold text-slate-900 not-italic mb-0.5">Calculation Trail</p>
                  <p>{rxState.calc.basisLabel} = {rxState.calc.finalDose} mg{rxState.calc.capped ? ` (capped at ${rxState.calc.capVal})` : ""}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Dose</label>
                  <div className="flex gap-1">
                    <Input value={overrides.dose} onChange={e => setOverrides(p => ({ ...p, dose: e.target.value }))}
                      placeholder="e.g. 500" className="text-sm h-8" />
                    <select value={overrides.unit} onChange={e => setOverrides(p => ({ ...p, unit: e.target.value }))}
                      className="text-xs border border-slate-200 rounded px-1 h-8 bg-white">
                      {["mg", "mcg", "mL", "units", "g"].map(u => <option key={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Frequency</label>
                  <select value={overrides.frequency} onChange={e => setOverrides(p => ({ ...p, frequency: e.target.value }))}
                    className="w-full text-xs border border-slate-200 rounded-md px-2 h-8 bg-white">
                    {["", "OD", "BD", "TDS", "QID", "Q6H", "Q8H", "Q12H", "PRN", "STAT", "Weekly", "Alt day"].map(f =>
                      <option key={f} value={f}>{f || "Select..."}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Route</label>
                  <select value={overrides.route} onChange={e => setOverrides(p => ({ ...p, route: e.target.value }))}
                    className="w-full text-xs border border-slate-200 rounded-md px-2 h-8 bg-white">
                    {["PO", "IV", "IM", "SC", "SL", "Inhaled", "Topical", "PR", "Nebulised"].map(r =>
                      <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Duration</label>
                  <Input value={overrides.duration} onChange={e => setOverrides(p => ({ ...p, duration: e.target.value }))}
                    placeholder="e.g. 5 days" className="text-sm h-8" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Indication</label>
                <Input value={overrides.indicationName} onChange={e => setOverrides(p => ({ ...p, indicationName: e.target.value }))}
                  placeholder="e.g. Varicella, SRNS..." className="text-sm h-8" />
              </div>

              {/* Preview */}
              <div className="bg-white rounded-lg border border-slate-200 px-3 py-2">
                <p className="text-[10px] text-slate-400 mb-0.5">Preview</p>
                <p className="text-xs font-mono text-slate-800">{prescriptionLine}</p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 text-xs"
                  onClick={() => { setPhase("picking"); setRxState(null); }}>
                  ← Change Indication
                </Button>
                <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1"
                  onClick={handleConfirm}>
                  <CheckCircle className="w-3.5 h-3.5" /> Confirm Drug
                </Button>
              </div>
            </div>
          )}

          {/* Phase: done */}
          {phase === "done" && (
            <div className="text-xs text-emerald-700 font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Drug confirmed and added to prescription.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Drug search (from DB) ─────────────────────────────────────────────────────
function DrugSearchPanel({ onAdd, alreadyAdded }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const search = useCallback(async (q) => {
    if (!q || q.length < 2) { setResults([]); setSearched(false); return; }
    setLoading(true);
    try {
      // Fetch non-hidden drugs matching the query
      const all = await base44.entities.Drug.filter({
        is_duplicate_hidden: { $ne: true },
      }, "generic_name", 100);
      const q2 = q.toLowerCase();
      const filtered = all.filter(d =>
        (d.generic_name || "").toLowerCase().includes(q2) ||
        (d.brands_indian || "").toLowerCase().includes(q2) ||
        (d.category || "").toLowerCase().includes(q2)
      ).slice(0, 12);
      setResults(filtered);
      setSearched(true);
    } catch {
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e) => {
    const v = e.target.value;
    setQuery(v);
    clearTimeout(window._drugSearchTimer);
    window._drugSearchTimer = setTimeout(() => search(v), 350);
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          value={query}
          onChange={handleChange}
          placeholder="Search drug to add (e.g. Acyclovir, Prednisolone...)"
          className="pl-9 text-sm"
        />
        {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-slate-400" />}
        {query && !loading && (
          <button onClick={() => { setQuery(""); setResults([]); setSearched(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {searched && results.length === 0 && (
        <p className="text-xs text-slate-400 text-center py-2">No prescribable drugs found for "{query}"</p>
      )}

      {results.length > 0 && (
        <div className="space-y-1 max-h-48 overflow-y-auto border border-slate-200 rounded-xl bg-white p-2">
          {results.map(drug => {
            const added = alreadyAdded.some(d => d.id === drug.id);
            return (
              <button
                key={drug.id}
                disabled={added}
                onClick={() => { onAdd(drug); setQuery(""); setResults([]); setSearched(false); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all ${added ? "opacity-50 cursor-not-allowed bg-slate-50" : "hover:bg-indigo-50 hover:border-indigo-200"}`}
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">{drug.generic_name}</p>
                  <p className="text-[11px] text-slate-400">{drug.category}{drug.formulary_category ? ` · ${drug.formulary_category}` : ""}</p>
                </div>
                {added
                  ? <Badge className="bg-slate-100 text-slate-500 text-[10px]">Added</Badge>
                  : <Plus className="w-4 h-4 text-indigo-500" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────
export default function DrugRxBuilder({ weight, bsa, egfr, onDrugsChange }) {
  const [drugs, setDrugs] = useState([]); // { drug: DrugRecord, finalized: null | FinalizedRx }
  const [finalizedMap, setFinalizedMap] = useState({}); // drug.id → finalized

  const handleAdd = (drug) => {
    if (drugs.some(d => d.drug.id === drug.id)) return;
    const updated = [...drugs, { drug }];
    setDrugs(updated);
    notifyParent(updated, finalizedMap);
  };

  const handleRemove = (drugId) => {
    const updated = drugs.filter(d => d.drug.id !== drugId);
    setDrugs(updated);
    const newMap = { ...finalizedMap };
    delete newMap[drugId];
    setFinalizedMap(newMap);
    notifyParent(updated, newMap);
  };

  const handleFinalized = (drugId, rxData) => {
    const newMap = { ...finalizedMap, [drugId]: rxData };
    setFinalizedMap(newMap);
    notifyParent(drugs, newMap);
  };

  const notifyParent = (drugList, map) => {
    const names = drugList.filter(d => map[d.drug.id]).map(d => d.drug.generic_name);
    // Include calcTrail in each finalized entry for prescription output
    const finalized = drugList.filter(d => map[d.drug.id]).map(d => ({ ...map[d.drug.id] }));
    onDrugsChange?.(names, finalized);
  };

  const confirmedCount = Object.keys(finalizedMap).length;

  return (
    <div className="space-y-4">
      <Alert className="bg-blue-50 border-blue-200 py-2">
        <AlertTriangle className="w-4 h-4 text-blue-600 flex-shrink-0" />
        <AlertDescription className="text-blue-800 text-xs">
          Search and add drugs below. <strong>Each drug requires an indication</strong> before it can be included in the prescription.
        </AlertDescription>
      </Alert>

      <DrugSearchPanel onAdd={handleAdd} alreadyAdded={drugs.map(d => d.drug)} />

      {drugs.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">
              Drug List ({drugs.length})
            </p>
            {confirmedCount > 0 && (
              <Badge className="bg-emerald-100 text-emerald-800 text-xs">
                {confirmedCount}/{drugs.length} confirmed
              </Badge>
            )}
          </div>

          {drugs.map(({ drug }) => (
            <DrugRxCard
              key={drug.id}
              drug={drug}
              weight={weight}
              bsa={bsa}
              egfr={egfr}
              onFinalized={(rx) => handleFinalized(drug.id, rx)}
              onRemove={() => handleRemove(drug.id)}
            />
          ))}
        </div>
      )}

      {drugs.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
          <Pill className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-400">Search above to add drugs to the prescription</p>
        </div>
      )}
    </div>
  );
}