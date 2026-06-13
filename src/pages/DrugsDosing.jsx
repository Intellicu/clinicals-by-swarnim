import React, { useState, useMemo, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Search, Pill, AlertTriangle, Calculator, Shield,
  Printer, MessageCircle, Plus, Trash2, CheckCircle, Activity, Beaker, X,
  BookOpen, Star, StarOff, Upload, Download, Sparkles, Globe,
  ChevronLeft, ChevronDown, ChevronUp, Save, FolderOpen, Clock, ArrowRight, Lock
} from "lucide-react";
import DrugDetailCard from "../components/drugs/DrugDetailCard";
import RxIndicationBuilder from "../components/drugs/RxIndicationBuilder";
import SteroidEquivalenceEngine from "../components/drugs/SteroidEquivalenceEngine";
import SteroidSparingAgents from "../components/drugs/SteroidSparingAgents";
import IndicationPrescribeWizard from "../components/drugs/IndicationPrescribeWizard";
import EculizumabGuidance from "../components/drugs/EculizumabGuidance";
import PlasmapheresisModule from "../components/drugs/PlasmapheresisModule";
import FormularyBrowser from "../components/drugs/FormularyBrowser";
import { toast } from "sonner";
import { usePatient } from "../components/PatientContext";
import { FORMULARY, getFormularyDrug } from "@/lib/formulary/nephrology-drugs";

// ─── Interaction rules ─────────────────────────────────────────────────────────
const INTERACTION_RULES = [
  { a: "tacrolimus", b: "fluconazole", severity: "high", msg: "Fluconazole inhibits CYP3A4 → markedly increases Tacrolimus levels → nephrotoxicity risk." },
  { a: "tacrolimus", b: "clarithromycin", severity: "high", msg: "Clarithromycin inhibits CYP3A4 → increased Tacrolimus levels." },
  { a: "cyclosporine", b: "atorvastatin", severity: "high", msg: "Cyclosporine increases statin levels → myopathy/rhabdomyolysis risk." },
  { a: "enalapril", b: "losartan", severity: "high", msg: "Dual RAS blockade → hyperkalemia + AKI risk. Avoid." },
  { a: "furosemide", b: "gentamicin", severity: "high", msg: "Additive ototoxicity and nephrotoxicity." },
  { a: "furosemide", b: "ibuprofen", severity: "high", msg: "NSAIDs reduce furosemide efficacy and worsen renal function." },
  { a: "prednisolone", b: "ibuprofen", severity: "moderate", msg: "Increased GI ulceration risk. Add PPI prophylaxis." },
  { a: "mycophenolate", b: "azathioprine", severity: "high", msg: "Both antiproliferative — additive myelosuppression. Avoid." },
  { a: "cyclophosphamide", b: "allopurinol", severity: "high", msg: "Allopurinol inhibits cyclophosphamide metabolism → enhanced myelosuppression." },
  { a: "methotrexate", b: "ibuprofen", severity: "high", msg: "NSAIDs reduce renal methotrexate excretion → toxicity." },
  { a: "levamisole", b: "prednisolone", severity: "low", msg: "Standard FRNS combination. Monitor CBC monthly for agranulocytosis." },
];

function findInteractions(drugs) {
  const lower = drugs.map(d => d.generic_name?.toLowerCase() || "");
  const found = [];
  INTERACTION_RULES.forEach(rule => {
    if (lower.some(n => n.includes(rule.a)) && lower.some(n => n.includes(rule.b))) found.push(rule);
  });
  return found;
}

function freqFactor(freq = "") {
  const f = freq.toUpperCase();
  if (f.includes("QID") || f.includes("Q6H")) return 4;
  if (f.includes("TID") || f.includes("TDS") || f.includes("Q8H")) return 3;
  if (f.includes("BID") || f.includes("BD") || f.includes("Q12H") || f.includes("TWICE")) return 2;
  return 1;
}

function calcDose(drug, wt, bsa, egfr) {
  if (!drug) return null;
  const raw = drug.dose_weight_based || "";
  const type = drug.dose_calculation_type || "per_day";
  const freq = drug.frequency || "OD";
  if (type === "TDM") return { type: "TDM", perDose: "TDM-guided", daily: "—", freq, note: `Starting: ${raw}` };
  if (type === "fixed" || (!raw.includes("/kg") && !raw.includes("/m²")))
    return { type: "fixed", perDose: drug.dose_age_based || raw, daily: "—", freq, note: "Age-based or fixed dose" };
  if (raw.includes("/m²")) {
    const m = raw.match(/([\d.]+)(?:-)?([\d.]+)?\s*(\w+)\/m²/);
    if (m && bsa) {
      const minD = parseFloat(m[1]) * bsa, maxD = m[2] ? parseFloat(m[2]) * bsa : minD;
      const unit = m[3], factor = freqFactor(freq);
      const perMin = (minD / factor).toFixed(1), perMax = m[2] ? (maxD / factor).toFixed(1) : perMin;
      return { type: "bsa", perDose: m[2] ? `${perMin}–${perMax} ${unit}` : `${perMin} ${unit}`, daily: `${minD.toFixed(1)}–${maxD.toFixed(1)} ${unit}/day`, freq, note: `${m[1]}${m[2] ? `–${m[2]}` : ""} ${unit}/m²/day × BSA ${bsa.toFixed(2)} m²` };
    }
  }
  if (raw.includes("/kg")) {
    const m = raw.match(/([\d.]+)(?:-)?([\d.]+)?\s*(\w+)\/kg/);
    if (m && wt) {
      const minRaw = parseFloat(m[1]), maxRaw = m[2] ? parseFloat(m[2]) : minRaw, unit = m[3], factor = freqFactor(freq);
      const minD = minRaw * wt, maxD = maxRaw * wt;
      if (type === "per_dose") {
        return { type: "weight_per_dose", perDose: m[2] ? `${minD.toFixed(1)}–${maxD.toFixed(1)} ${unit}` : `${minD.toFixed(1)} ${unit}`, daily: `${(minD * factor).toFixed(1)}–${(maxD * factor).toFixed(1)} ${unit}/day`, freq, note: `${minRaw}${m[2] ? `–${maxRaw}` : ""} ${unit}/kg/dose × ${wt} kg` };
      } else {
        const perMin = (minD / factor).toFixed(1), perMax = (maxD / factor).toFixed(1);
        return { type: "weight_per_day", perDose: m[2] ? `${perMin}–${perMax} ${unit}` : `${perMin} ${unit}`, daily: m[2] ? `${minD.toFixed(1)}–${maxD.toFixed(1)} ${unit}/day` : `${minD.toFixed(1)} ${unit}/day`, freq, note: `${minRaw}${m[2] ? `–${maxRaw}` : ""} ${unit}/kg/day ÷ ${factor} doses × ${wt} kg` };
      }
    }
  }
  return { type: "unknown", perDose: raw, daily: "—", freq, note: "See drug monograph" };
}

function getRenalFlag(drug, egfr) {
  if (!egfr || !drug.renal_adjust) return null;
  const adj = drug.renal_adjust.toLowerCase(), g = parseFloat(egfr);
  if ((adj.includes("avoid") || adj.includes("contraindicated")) && g < 30) return { level: "critical", msg: drug.renal_adjust };
  if ((adj.includes("reduce") || adj.includes("adjust")) && g < 60) return { level: g < 30 ? "critical" : "warning", msg: drug.renal_adjust };
  if (adj.includes("caution") && g < 60) return { level: "info", msg: drug.renal_adjust };
  return null;
}

const SEV_COLOR = { high: "bg-red-50 border-red-300 text-red-800", moderate: "bg-amber-50 border-amber-300 text-amber-800", low: "bg-blue-50 border-blue-200 text-blue-800" };

// ─── Prescription Templates Storage ────────────────────────────────────────────
function usePrescriptionTemplates() {
  const [templates, setTemplates] = useState(() => {
    try { return JSON.parse(localStorage.getItem("rx_templates") || "[]"); } catch { return []; }
  });
  const save = (name, drugs) => {
    const t = { id: Date.now(), name, drugs: drugs.map(d => ({ id: d.id, generic_name: d.generic_name, route: d.route, frequency: d.frequency, dose_weight_based: d.dose_weight_based, dose_calculation_type: d.dose_calculation_type })), created: new Date().toISOString() };
    const updated = [...templates, t];
    setTemplates(updated);
    localStorage.setItem("rx_templates", JSON.stringify(updated));
    return t;
  };
  const remove = (id) => {
    const updated = templates.filter(t => t.id !== id);
    setTemplates(updated);
    localStorage.setItem("rx_templates", JSON.stringify(updated));
  };
  return { templates, save, remove };
}

// ─── Favorites Storage ──────────────────────────────────────────────────────────
function useFavorites() {
  const [favIds, setFavIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem("drug_favorites") || "[]"); } catch { return []; }
  });
  const toggle = (id) => {
    const updated = favIds.includes(id) ? favIds.filter(f => f !== id) : [...favIds, id];
    setFavIds(updated);
    localStorage.setItem("drug_favorites", JSON.stringify(updated));
  };
  return { favIds, toggle };
}

// ── Quick Drug Search for Rx builder — always opens indication builder ────────
function RxQuickSearch({ drugs, weight, bsa, effectiveEgfr, onSelectForRx, rxDrugs }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    if (!q.trim() || q.length < 2) return [];
    const lower = q.toLowerCase();
    return drugs.filter(d =>
      (d.generic_name?.toLowerCase().includes(lower) || d.brands_indian?.toLowerCase().includes(lower)) && !d.is_duplicate_hidden
    ).slice(0, 8);
  }, [drugs, q]);

  React.useEffect(() => { setOpen(results.length > 0); }, [results]);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-500" />
        <input value={q} onChange={e => setQ(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search drug to add to prescription..."
          className="w-full pl-9 pr-4 py-2.5 text-sm border-2 border-teal-200 rounded-xl bg-teal-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all" />
        {q && <button onClick={() => { setQ(""); setOpen(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"><X className="w-4 h-4" /></button>}
      </div>
      {open && results.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-xl border border-teal-200 shadow-xl overflow-hidden">
          {results.map(drug => {
            const isInRx = rxDrugs.find(d => d.id === drug.id);
            return (
              <div key={drug.id}
                onClick={() => { onSelectForRx(drug); setQ(""); setOpen(false); }}
                className="flex items-center gap-3 px-3 py-2.5 hover:bg-teal-50 border-b border-slate-100 last:border-0 transition-colors cursor-pointer">
                <Pill className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 leading-tight">{drug.generic_name}</p>
                  <p className="text-xs text-slate-400">{drug.therapeutic_class || drug.category}</p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${isInRx ? "bg-green-100 text-green-700" : "bg-teal-100 text-teal-700"}`}>
                  {isInRx ? "In Rx ✓" : "Select →"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Formulary Tab with search + grouped categories ────────────────────────────
function FormularyTab({ drugs, isLoading, selectDrug, favIds, toggleFav, rxDrugs, effectiveEgfr }) {
  const [fSearch, setFSearch] = useState("");
  const [fCat, setFCat] = useState("All");

  const cats = useMemo(() => ["All", ...Array.from(new Set(drugs.map(d => d.category || "Other"))).sort()], [drugs]);

  const filtered = useMemo(() => {
    const q = fSearch.toLowerCase();
    return drugs.filter(d => {
      const matchQ = !q || d.generic_name?.toLowerCase().includes(q) || d.brands_indian?.toLowerCase().includes(q);
      const matchC = fCat === "All" || d.category === fCat;
      return matchQ && matchC && !d.is_duplicate_hidden;
    });
  }, [drugs, fSearch, fCat]);

  const grouped = useMemo(() => {
    return filtered.reduce((acc, d) => {
      const cat = d.category || "Other";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(d);
      return acc;
    }, {});
  }, [filtered]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-teal-600 flex-shrink-0" />
        <h2 className="text-sm font-bold text-slate-700">Pediatric Drug Formulary</h2>
        <span className="ml-auto text-xs text-slate-400">{filtered.length} drugs</span>
      </div>
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input value={fSearch} onChange={e => setFSearch(e.target.value)}
          placeholder="Search formulary..."
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-300" />
      </div>
      {/* Category pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {cats.map(c => (
          <button key={c} onClick={() => setFCat(c)}
            className={`flex-shrink-0 px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${fCat === c ? "bg-teal-600 text-white border-teal-600" : "bg-white border-slate-200 text-slate-600 hover:border-teal-300"}`}>
            {c}
          </button>
        ))}
      </div>
      {isLoading ? (
        <p className="text-slate-400 text-sm text-center py-8">Loading formulary...</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10 text-slate-400">
          <Pill className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No drugs found</p>
        </div>
      ) : (
        Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([cat, catDrugs]) => (
          <FormularyCategory key={cat} category={cat} drugs={catDrugs} onSelect={selectDrug}
            favIds={favIds} toggleFav={toggleFav} rxDrugs={rxDrugs} effectiveEgfr={effectiveEgfr} />
        ))
      )}
    </div>
  );
}

// ── Collapsible formulary category ────────────────────────────────────────────
function FormularyCategory({ category, drugs, onSelect, favIds, toggleFav, rxDrugs, effectiveEgfr }) {
  const [open, setOpen] = useState(true);
  const CAT_COLORS = {
    Corticosteroid: "text-purple-700 bg-purple-50 border-purple-200",
    Immunosuppressant: "text-blue-700 bg-blue-50 border-blue-200",
    Antihypertensive: "text-rose-700 bg-rose-50 border-rose-200",
    Diuretic: "text-cyan-700 bg-cyan-50 border-cyan-200",
    Antibiotic: "text-green-700 bg-green-50 border-green-200",
    Biologic: "text-violet-700 bg-violet-50 border-violet-200",
    "Complement Inhibitor": "text-amber-700 bg-amber-50 border-amber-200",
  };
  const colorClass = CAT_COLORS[category] || "text-slate-700 bg-slate-50 border-slate-200";
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${colorClass}`}>{category}</span>
          <span className="text-xs text-slate-400">{drugs.length} drug{drugs.length !== 1 ? "s" : ""}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && (
        <div className="divide-y divide-slate-100">
          {drugs.map(drug => {
            const isFav = favIds.includes(drug.id);
            const isInRx = rxDrugs.find(d => d.id === drug.id);
            const renalFlag = effectiveEgfr ? getRenalFlag(drug, effectiveEgfr) : null;
            return (
              <div key={drug.id} onClick={() => onSelect(drug)}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-teal-50 cursor-pointer transition-colors">
                <Pill className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 leading-tight">{drug.generic_name}</p>
                  {drug.brands_indian && <p className="text-xs text-slate-400 truncate">{drug.brands_indian.split(",")[0].trim()}</p>}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {renalFlag && <span className="text-[10px] text-amber-600">⚠️</span>}
                  {isInRx && <CheckCircle className="w-3.5 h-3.5 text-green-500" />}
                  <button onClick={e => { e.stopPropagation(); toggleFav(drug.id); }}
                    className="text-slate-200 hover:text-amber-400 transition-colors">
                    {isFav ? <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> : <StarOff className="w-3.5 h-3.5" />}
                  </button>
                  {drug.dose_weight_based && <span className="text-[10px] text-slate-400 hidden sm:block ml-1">{drug.dose_weight_based.split(" ").slice(0,2).join(" ")}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function DrugsDosing() {
  const { patientData } = usePatient();
  const urlParams = new URLSearchParams(window.location.search);
  const urlDrug = urlParams.get("formulary") || urlParams.get("drug");

  const [weight, setWeight] = useState(patientData.weight ? String(patientData.weight) : "");
  const [height, setHeight] = useState(patientData.height ? String(patientData.height) : "");
  const [age, setAge] = useState(patientData.age ? String(patientData.age) : "");
  const [egfr, setEgfr] = useState("");

  // Main workspace modes
  const [mode, setMode] = useState("formulary"); // "formulary" | "search" | "drug" | "rx" | ...
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [drugSubTab, setDrugSubTab] = useState("dose");

  // Search
  const [query, setQuery] = useState(urlDrug || "");
  const [catFilter, setCatFilter] = useState("All");

  // Rx
  const [rxDrugs, setRxDrugs] = useState([]);
  const { templates, save: saveTemplate, remove: removeTemplate } = usePrescriptionTemplates();
  const { favIds, toggle: toggleFav } = useFavorites();
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [recentDrugs, setRecentDrugs] = useState(() => {
    try { return JSON.parse(localStorage.getItem("recent_drugs") || "[]"); } catch { return []; }
  });

  // Indication builder — tracks which drug is being configured for Rx
  const [showIndicationBuilder, setShowIndicationBuilder] = useState(false);
  const [rxBuilderDrug, setRxBuilderDrug] = useState(null);

  // Add Drug Panel
  const [addMode, setAddMode] = useState(null); // null | "ai" | "import" | "manual"
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [newDrug, setNewDrug] = useState({ generic_name: "", category: "Corticosteroid", route: "PO", dose_weight_based: "", frequency: "OD", brands_indian: "" });

  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => base44.auth.me(),
    staleTime: 60000,
  });
  const isAdmin = currentUser?.role === "admin";

  const { data: drugs = [], isLoading } = useQuery({
    queryKey: ["drugs-full"],
    queryFn: () => base44.entities.Drug.list("generic_name", 1000),
  });

  const bsa = useMemo(() => {
    const h = parseFloat(height), w = parseFloat(weight);
    return h && w ? parseFloat(Math.sqrt((h * w) / 3600).toFixed(3)) : null;
  }, [height, weight]);

  const autoEgfr = useMemo(() => {
    const cr = parseFloat(egfr), h = parseFloat(height), a = parseFloat(age);
    if (!isNaN(cr) && cr > 0 && h && a) { const k = a < 2 ? 0.33 : a < 13 ? 0.55 : 0.70; return ((k * h) / cr).toFixed(0); }
    return null;
  }, [egfr, height, age]);

  const effectiveEgfr = egfr && !isNaN(parseFloat(egfr)) ? parseFloat(egfr) : (autoEgfr ? parseFloat(autoEgfr) : null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return drugs.filter(d => {
      const matchQ = !q || d.generic_name?.toLowerCase().includes(q) || d.brands_indian?.toLowerCase().includes(q) || d.therapeutic_class?.toLowerCase().includes(q);
      const matchCat = catFilter === "All" || d.category?.toLowerCase().includes(catFilter.toLowerCase());
      return matchQ && matchCat && !d.is_duplicate_hidden;
    });
  }, [drugs, query, catFilter]);

  const favDrugs = useMemo(() => drugs.filter(d => favIds.includes(d.id)), [drugs, favIds]);

  const selectDrug = (drug) => {
    setSelectedDrug(drug);
    setDrugSubTab("dose");
    setMode("drug");
    // Update recents
    const updated = [drug, ...recentDrugs.filter(r => r.id !== drug.id)].slice(0, 8);
    setRecentDrugs(updated);
    localStorage.setItem("recent_drugs", JSON.stringify(updated));
  };

  const addToRx = (drug) => {
    if (!rxDrugs.find(d => d.id === drug.id)) {
      setRxDrugs(prev => [...prev, drug]);
      toast.success(`${drug.generic_name} added to prescription`);
    }
  };

  // Opens the indication builder for a drug (from drug detail view or search)
  const openRxBuilder = (drug, fromDrugView = false) => {
    setRxBuilderDrug({ ...drug, _inDrugView: fromDrugView });
    setShowIndicationBuilder(true);
  };

  const handleIndicationAdd = ({ drug: d, indication, dose, freq, route, duration, formulation, prescriptionText }) => {
    const mapped = {
      id: d.id,
      generic_name: d.generic_name,
      category: d.category,
      therapeutic_class: d.therapeutic_class,
      route: route || d.route || "PO",
      dose_weight_based: dose,
      frequency: freq || d.frequency || "OD",
      brands_indian: d.brands_indian || "",
      renal_adjust: d.renal_adjust || "",
      dose_calculation_type: "per_day",
      _indication: indication,
      _prescriptionText: prescriptionText,
      _formulation: formulation,
      _duration: duration,
    };
    addToRx(mapped);
    setShowIndicationBuilder(false);
    setRxBuilderDrug(null);
    setMode("rx");
  };

  const interactions = useMemo(() => findInteractions(rxDrugs), [rxDrugs]);

  const buildRx = () => {
    const wt = parseFloat(weight);
    const lines = rxDrugs.map((drug, i) => {
      // Structured output if added via indication builder — use the stored prescriptionText directly
      if (drug._prescriptionText) {
        return `${i + 1}. ${drug._prescriptionText}`;
      }
      // Indication-builder drug without prescriptionText (legacy)
      if (drug._indication && drug.dose_weight_based) {
        const formLine = drug._formulation
          ? `\n   Formulation: ${drug._formulation.form} ${drug._formulation.strength}${drug._formulation.brands ? ` (${drug._formulation.brands})` : ""}`
          : "";
        const durationLine = drug._duration ? `\n   Duration: ${drug._duration}` : "";
        return `${i + 1}. ${drug.generic_name}\n   Indication: ${drug._indication}\n   Dose: ${drug.dose_weight_based}  |  ${drug.frequency || "—"}  |  ${drug.route || "PO"}${durationLine}${formLine}`;
      }
      // Fallback: generic dose calculation
      const dose = calcDose(drug, wt, bsa, effectiveEgfr);
      const doseStr = dose?.type === "TDM" ? "TDM-guided (see monograph)" : dose?.perDose || drug.dose_weight_based || "—";
      const durationInfo = drug._duration ? `\n   Duration: ${drug._duration}` : "";
      const brandInfo = drug.brands_indian ? `\n   Brands (India): ${drug.brands_indian.split(",").slice(0,2).join(", ")}` : "";
      return `${i + 1}. ${drug.generic_name}\n   Dose: ${doseStr}  |  ${drug.frequency || dose?.freq || "—"}  |  ${drug.route || "PO"}${durationInfo}${brandInfo}`;
    }).join("\n\n");
    return `PEDIATRIC Rx\n${"─".repeat(40)}\nAge: ${age || "—"} y  |  Wt: ${weight || "—"} kg  |  BSA: ${bsa ? bsa + " m²" : "—"}  |  eGFR: ${effectiveEgfr || "—"}\n\n${lines}\n\n${"─".repeat(40)}\n${interactions.length ? `⚠️ Interactions: ${interactions.map(ix => `${ix.a}+${ix.b}`).join("; ")}` : "✅ No major interactions"}\nCliniCals by Swarnim | Verify all doses`;
  };

  // AI Drug Addition
  const handleAIAdd = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a pediatric pharmacologist. Extract drug information from the following text and return a JSON array of drug objects. Each object must have: generic_name (string), category (string, e.g. "Corticosteroid", "Immunosuppressant", "Antihypertensive", "Diuretic", "Antibiotic"), route (string: "PO"/"IV"/"IM"/"SC"), and optionally: dose_weight_based, frequency, max_dose_per_day, brands_indian, therapeutic_class, renal_adjust, indications, monitoring, adverse_effects, clinical_pearls, dose_calculation_type (per_day/per_dose/TDM/fixed). Return ONLY valid JSON array.\n\nText: ${aiPrompt}`,
        response_json_schema: { type: "array", items: { type: "object" } }
      });
      let parsed = typeof res === "string" ? JSON.parse(res) : res;
      if (!Array.isArray(parsed)) parsed = [parsed];
      let added = 0;
      for (const drug of parsed) {
        if (drug.generic_name && drug.category && drug.route) {
          await base44.entities.Drug.create(drug);
          added++;
        }
      }
      toast.success(`Added ${added} drug(s) to formulary`);
      queryClient.invalidateQueries({ queryKey: ["drugs-full"] });
      setAiPrompt("");
      setAddMode(null);
    } catch (e) {
      toast.error("AI extraction failed — try rephrasing or use manual entry");
    }
    setAiLoading(false);
  };

  // File Import
  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportResult(null);
    try {
      const text = await file.text();
      let rows = [];
      if (file.name.endsWith(".json")) rows = JSON.parse(text);
      else if (file.name.endsWith(".csv")) {
        const lines = text.split("\n").filter(l => l.trim());
        const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
        rows = lines.slice(1).map(line => {
          const vals = line.split(",").map(v => v.trim().replace(/^"|"$/g, ""));
          const obj = {}; headers.forEach((h, i) => { if (vals[i]) obj[h] = vals[i]; }); return obj;
        });
      } else if (file.name.endsWith(".txt")) {
        setAiPrompt(text.slice(0, 3000));
        setAddMode("ai");
        toast.info("Text file loaded — review and click 'Extract with AI'");
        return;
      }
      setImportFile({ file, rows });
    } catch { toast.error("Failed to parse file"); }
  };

  const runImport = async () => {
    if (!importFile?.rows?.length) return;
    setImportLoading(true);
    setImportResult(null);
    let success = 0, fail = 0;
    const failedRows = [];
    for (const row of importFile.rows) {
      if (!row.generic_name || !row.category || !row.route) {
        fail++;
        failedRows.push(row.generic_name || "(missing name)");
        continue;
      }
      // Clean up any undefined/empty fields
      const cleanRow = Object.fromEntries(Object.entries(row).filter(([, v]) => v !== "" && v !== undefined && v !== null));
      try {
        await base44.entities.Drug.create(cleanRow);
        success++;
      } catch (e) {
        fail++;
        failedRows.push(row.generic_name);
      }
    }
    setImportResult({ success, fail, failed: failedRows });
    setImportLoading(false);
    await queryClient.invalidateQueries({ queryKey: ["drugs-full"] });
    if (success > 0) toast.success(`✅ ${success} drug${success !== 1 ? "s" : ""} imported successfully`);
    if (fail > 0) toast.error(`${fail} row${fail !== 1 ? "s" : ""} failed — check required fields`);
  };

  // Manual add
  const handleManualAdd = async () => {
    if (!newDrug.generic_name || !newDrug.category || !newDrug.route) { toast.error("Name, category and route are required"); return; }
    await base44.entities.Drug.create(newDrug);
    toast.success(`${newDrug.generic_name} added to formulary`);
    queryClient.invalidateQueries({ queryKey: ["drugs-full"] });
    setNewDrug({ generic_name: "", category: "Corticosteroid", route: "PO", dose_weight_based: "", frequency: "OD", brands_indian: "" });
    setAddMode(null);
  };

  const CATS = ["All", "Immunosuppressant", "Corticosteroid", "Antihypertensive", "Diuretic", "Antibiotic", "CKD", "Emergency"];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Workspace Header ── */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4">
          {/* Patient strip */}
          <div className="flex items-center gap-2 pt-3 pb-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {[
              { label: "Wt (kg)", value: weight, set: setWeight, placeholder: "25" },
              { label: "Ht (cm)", value: height, set: setHeight, placeholder: "110" },
              { label: "Age (y)", value: age, set: setAge, placeholder: "8" },
              { label: "eGFR", value: egfr, set: setEgfr, placeholder: "90" },
            ].map(f => (
              <div key={f.label} className="flex flex-col flex-shrink-0">
                <span className="text-[10px] text-slate-400 font-semibold">{f.label}</span>
                <input value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.placeholder}
                  className="w-16 text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-center focus:outline-none focus:ring-2 focus:ring-teal-300" />
              </div>
            ))}
            {bsa && <div className="flex flex-col flex-shrink-0 items-center"><span className="text-[10px] text-slate-400">BSA</span><span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-1.5 rounded-lg">{bsa} m²</span></div>}
            {effectiveEgfr && effectiveEgfr < 60 && <div className="flex-shrink-0"><span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-lg font-semibold">⚠️ CKD eGFR {effectiveEgfr}</span></div>}
          </div>

          {/* Mode nav */}
          <div className="flex items-center gap-0 pb-0 overflow-x-auto" style={{ borderBottom: "none", scrollbarWidth: "none" }}>
            {[
              { id: "formulary", label: "Pediatric Nephrology Formulary" },
              { id: "search", label: "Search Other Drugs" },
              { id: "recents", label: "Recent" },
              { id: "favorites", label: "⭐ Fav" },
              { id: "rx", label: `Rx${rxDrugs.length ? ` (${rxDrugs.length})` : ""}` },
              { id: "wizard", label: "🧭 Prescriber Wizard" },
              { id: "steroid-sparing", label: "Steroid-Sparing" },
              { id: "steroids", label: "Steroids" },
              { id: "eculizumab", label: "Eculizumab" },
              { id: "plasmapheresis", label: "Plasmapheresis" },
              { id: "ckd", label: "CKD Doses" },
            ].map(m => (
              <button key={m.id} onClick={() => setMode(m.id)}
                className={`flex-shrink-0 px-3 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${mode === m.id ? "border-teal-600 text-teal-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
                {m.label}
              </button>
            ))}
            {isAdmin && (
              <div className="ml-auto flex-shrink-0 pb-1 pl-2">
                <Button size="sm" onClick={() => setAddMode(addMode ? null : "menu")}
                  className="bg-teal-600 hover:bg-teal-700 text-white text-xs h-8 gap-1.5 whitespace-nowrap">
                  <Plus className="w-3.5 h-3.5" /> Add Drug
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4">

        {/* ── Add Drug Panel ── */}
        {addMode && (
          <Card className="mb-4 border-teal-200 bg-teal-50">
            <CardContent className="p-4">
              {addMode === "menu" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-teal-900 text-sm">Add Drug to Formulary</h3>
                    <button onClick={() => setAddMode(null)}><X className="w-4 h-4 text-slate-400" /></button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: "ai", icon: Sparkles, label: "AI Extract", desc: "Paste text/PDF content" },
                      { id: "import", icon: Upload, label: "Import File", desc: "JSON, CSV, TXT" },
                      { id: "search_online", icon: Globe, label: "Search Online", desc: "Find & add from web" },
                      { id: "manual", icon: Plus, label: "Manual Entry", desc: "Fill form directly" },
                    ].map(opt => (
                      <button key={opt.id} onClick={() => setAddMode(opt.id)}
                        className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl border border-teal-200 hover:border-teal-400 hover:bg-teal-50 transition-all text-center">
                        <opt.icon className="w-6 h-6 text-teal-600" />
                        <div>
                          <p className="text-xs font-semibold text-slate-800">{opt.label}</p>
                          <p className="text-[10px] text-slate-400">{opt.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {addMode === "ai" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setAddMode("menu")} className="text-teal-600 hover:text-teal-800"><ChevronLeft className="w-4 h-4" /></button>
                    <h3 className="font-bold text-teal-900 text-sm flex items-center gap-1"><Sparkles className="w-4 h-4" /> AI Drug Extractor</h3>
                    <button onClick={() => setAddMode(null)} className="ml-auto"><X className="w-4 h-4 text-slate-400" /></button>
                  </div>
                  <p className="text-xs text-teal-700">Paste drug information from any source (PDF copy, guidelines, formulary text, web content). AI will extract structured drug data.</p>
                  <textarea value={aiPrompt} onChange={e => setAiPrompt(e.target.value)}
                    placeholder="Paste drug information here — e.g. 'Mycophenolate mofetil 600 mg/m² twice daily, max 1g BD, used in SRNS and lupus nephritis...'"
                    className="w-full h-28 text-xs border border-teal-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white resize-none" />
                  <div className="flex gap-2">
                    <Button onClick={handleAIAdd} disabled={!aiPrompt.trim() || aiLoading}
                      className="bg-teal-600 hover:bg-teal-700 text-white text-xs h-9">
                      {aiLoading ? <><Beaker className="w-3.5 h-3.5 mr-1.5 animate-spin" />Extracting...</> : <><Sparkles className="w-3.5 h-3.5 mr-1.5" />Extract with AI</>}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setAiPrompt("")} className="text-xs">Clear</Button>
                  </div>
                </div>
              )}

              {addMode === "import" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setAddMode("menu")} className="text-teal-600"><ChevronLeft className="w-4 h-4" /></button>
                    <h3 className="font-bold text-teal-900 text-sm flex items-center gap-1"><Upload className="w-4 h-4" /> Import File</h3>
                    <button onClick={() => setAddMode(null)} className="ml-auto"><X className="w-4 h-4 text-slate-400" /></button>
                  </div>
                  <p className="text-xs text-teal-700">Upload <strong>.json</strong>, <strong>.csv</strong>, or <strong>.txt</strong> file. JSON/CSV: needs generic_name, category, route fields. TXT: will auto-route to AI Extractor.</p>
                  <div className="flex gap-2 flex-wrap">
                    <label className="cursor-pointer">
                      <span className="inline-flex items-center gap-2 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg transition-colors">
                        <Upload className="w-3.5 h-3.5" /> Choose File
                      </span>
                      <input type="file" accept=".json,.csv,.txt" className="hidden" onChange={handleImportFile} />
                    </label>
                    <button onClick={() => {
                      const t = JSON.stringify([{ generic_name: "Example Drug", category: "Corticosteroid", route: "PO", dose_weight_based: "1-2 mg/kg/day", frequency: "OD", max_dose_per_day: "60" }], null, 2);
                      const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([t], { type: "application/json" })); a.download = "drug_template.json"; a.click();
                    }} className="flex items-center gap-1.5 text-xs px-3 py-2 bg-white border border-teal-300 text-teal-800 rounded-lg hover:bg-teal-50">
                      <Download className="w-3.5 h-3.5" /> Template
                    </button>
                  </div>
                  {importFile && (
                    <div className="space-y-2">
                      <p className="text-xs text-teal-700 font-medium">✓ {importFile.file.name} — {importFile.rows?.length} records</p>
                      {!importResult && (
                        <Button onClick={runImport} disabled={importLoading} className="bg-teal-600 hover:bg-teal-700 text-white text-xs h-9">
                          {importLoading ? `Importing ${importFile.rows.length}...` : `Import ${importFile.rows.length} Drugs`}
                        </Button>
                      )}
                      {importResult && (
                    <div className="space-y-1">
                      {importResult.success > 0 && <p className="text-xs text-green-700 font-semibold">✅ {importResult.success} drug{importResult.success !== 1 ? "s" : ""} added to formulary</p>}
                      {importResult.fail > 0 && <p className="text-xs text-red-600 font-semibold">❌ {importResult.fail} failed: {importResult.failed?.join(", ")}</p>}
                      <button onClick={() => { setImportFile(null); setImportResult(null); }} className="text-xs text-teal-600 underline">Import another file</button>
                    </div>
                  )}
                    </div>
                  )}
                </div>
              )}

              {addMode === "search_online" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setAddMode("menu")} className="text-teal-600"><ChevronLeft className="w-4 h-4" /></button>
                    <h3 className="font-bold text-teal-900 text-sm flex items-center gap-1"><Globe className="w-4 h-4" /> Search & Extract Online</h3>
                    <button onClick={() => setAddMode(null)} className="ml-auto"><X className="w-4 h-4 text-slate-400" /></button>
                  </div>
                  <p className="text-xs text-teal-700">Enter a drug name and AI will search for pediatric dosing information online and add it to the formulary.</p>
                  <div className="flex gap-2">
                    <input value={aiPrompt} onChange={e => setAiPrompt(e.target.value)}
                      placeholder="e.g. Mycophenolate mofetil pediatric dosing"
                      className="flex-1 text-xs border border-teal-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white" />
                    <Button onClick={async () => {
                      setAiLoading(true);
                      try {
                        const res = await base44.integrations.Core.InvokeLLM({
                          prompt: `Search for pediatric dosing information for: ${aiPrompt}. Return a JSON array with drug objects containing: generic_name, category, route, dose_weight_based, frequency, max_dose_per_day, brands_indian, indications, monitoring, adverse_effects, renal_adjust, clinical_pearls. Include evidence-based pediatric doses.`,
                          add_context_from_internet: true,
                          response_json_schema: { type: "array", items: { type: "object" } }
                        });
                        let parsed = typeof res === "string" ? JSON.parse(res) : res;
                        if (!Array.isArray(parsed)) parsed = [parsed];
                        let added = 0;
                        for (const d of parsed) { if (d.generic_name && d.category && d.route) { await base44.entities.Drug.create(d); added++; } }
                        toast.success(`Added ${added} drug(s) from web search`);
                        queryClient.invalidateQueries({ queryKey: ["drugs-full"] });
                        setAiPrompt(""); setAddMode(null);
                      } catch { toast.error("Search failed"); }
                      setAiLoading(false);
                    }} disabled={!aiPrompt.trim() || aiLoading} className="bg-teal-600 hover:bg-teal-700 text-white text-xs h-9">
                      {aiLoading ? "Searching..." : "Search & Add"}
                    </Button>
                  </div>
                </div>
              )}

              {addMode === "manual" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setAddMode("menu")} className="text-teal-600"><ChevronLeft className="w-4 h-4" /></button>
                    <h3 className="font-bold text-teal-900 text-sm">Manual Drug Entry</h3>
                    <button onClick={() => setAddMode(null)} className="ml-auto"><X className="w-4 h-4 text-slate-400" /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Generic Name *", key: "generic_name", placeholder: "e.g. Prednisolone" },
                      { label: "Category *", key: "category", placeholder: "e.g. Corticosteroid" },
                      { label: "Route *", key: "route", placeholder: "PO / IV / IM" },
                      { label: "Dose (mg/kg/day)", key: "dose_weight_based", placeholder: "1-2 mg/kg/day" },
                      { label: "Frequency", key: "frequency", placeholder: "OD / BD / TDS" },
                      { label: "Indian Brands", key: "brands_indian", placeholder: "Brand1, Brand2" },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="text-[10px] font-semibold text-slate-600">{f.label}</label>
                        <input value={newDrug[f.key]} onChange={e => setNewDrug(p => ({ ...p, [f.key]: e.target.value }))}
                          placeholder={f.placeholder}
                          className="w-full mt-0.5 text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-300 bg-white" />
                      </div>
                    ))}
                  </div>
                  <Button onClick={handleManualAdd} className="bg-teal-600 hover:bg-teal-700 text-white text-xs h-9 w-full">
                    <Plus className="w-3.5 h-3.5 mr-1.5" /> Add to Formulary
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ── SEARCH MODE ── */}
        {mode === "search" && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input value={query} onChange={e => setQuery(e.target.value)}
                  placeholder="Search drug name, brand, class..."
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-300" />
              </div>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
              {CATS.map(c => (
                <button key={c} onClick={() => setCatFilter(c)}
                  className={`flex-shrink-0 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${catFilter === c ? "bg-teal-600 text-white border-teal-600" : "bg-white border-slate-200 text-slate-600 hover:border-teal-300"}`}>
                  {c}
                </button>
              ))}
            </div>
            {isLoading ? (
              <div className="text-center py-8 text-slate-400 text-sm">Loading formulary...</div>
            ) : (
              <div className="space-y-1">
                <p className="text-xs text-slate-400">{filtered.length} drug{filtered.length !== 1 ? "s" : ""}</p>
                {filtered.map(drug => {
                  const isFav = favIds.includes(drug.id);
                  const isInRx = rxDrugs.find(d => d.id === drug.id);
                  const renalFlag = effectiveEgfr ? getRenalFlag(drug, effectiveEgfr) : null;
                  return (
                    <div key={drug.id}
                      className="flex items-center gap-3 px-3 py-3 bg-white rounded-xl border border-slate-200 hover:border-teal-300 transition-all cursor-pointer"
                      onClick={() => selectDrug(drug)}>
                      <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                        <Pill className="w-4 h-4 text-teal-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-slate-900 leading-tight">{drug.generic_name}</p>
                        <p className="text-xs text-slate-400 truncate">{drug.therapeutic_class || drug.category}{drug.brands_indian ? ` · ${drug.brands_indian.split(",")[0].trim()}` : ""}</p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {renalFlag && <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold">⚠️</span>}
                        {isInRx && <CheckCircle className="w-4 h-4 text-green-500" />}
                        <button onClick={e => { e.stopPropagation(); toggleFav(drug.id); }}
                          className="text-slate-300 hover:text-amber-400 transition-colors">
                          {isFav ? <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> : <StarOff className="w-4 h-4" />}
                        </button>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                      </div>
                    </div>
                  );
                })}
                {filtered.length === 0 && !isLoading && (
                  <div className="text-center py-12 text-slate-400">
                    <Pill className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No drugs found. Use "Add Drug" to expand the formulary.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── RECENTS MODE ── */}
        {mode === "recents" && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2"><Clock className="w-4 h-4 text-teal-600" /> Recently Viewed</h2>
            {recentDrugs.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">No recent drugs. Start searching to build history.</div>
            ) : recentDrugs.map(drug => (
              <div key={drug.id} onClick={() => selectDrug(drug)}
                className="flex items-center gap-3 px-3 py-3 bg-white rounded-xl border border-slate-200 hover:border-teal-300 cursor-pointer transition-all">
                <Clock className="w-4 h-4 text-slate-400" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-900">{drug.generic_name}</p>
                  <p className="text-xs text-slate-400">{drug.category}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
              </div>
            ))}
          </div>
        )}

        {/* ── FAVORITES MODE ── */}
        {mode === "favorites" && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2"><Star className="w-4 h-4 text-amber-400" /> Favorite Drugs</h2>
            {favDrugs.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">No favorites yet. Tap ☆ on any drug to save it here.</div>
            ) : favDrugs.map(drug => (
              <div key={drug.id} onClick={() => selectDrug(drug)}
                className="flex items-center gap-3 px-3 py-3 bg-white rounded-xl border border-amber-200 hover:border-amber-400 cursor-pointer transition-all">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-900">{drug.generic_name}</p>
                  <p className="text-xs text-slate-400">{drug.therapeutic_class || drug.category}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
              </div>
            ))}
          </div>
        )}

        {/* ── DRUG DETAIL MODE ── */}
        {mode === "drug" && selectedDrug && (() => {
          const wt = parseFloat(weight);
          const dose = calcDose(selectedDrug, wt, bsa, effectiveEgfr);
          const renalFlag = effectiveEgfr ? getRenalFlag(selectedDrug, effectiveEgfr) : null;
          const isFav = favIds.includes(selectedDrug.id);
          const isInRx = rxDrugs.find(d => d.id === selectedDrug.id);
          return (
            <div className="space-y-4">
              {/* Drug header */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <button onClick={() => setMode("search")} className="text-slate-400 hover:text-teal-600 transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <h2 className="text-base font-bold text-slate-900">{selectedDrug.generic_name}</h2>
                      <button onClick={() => toggleFav(selectedDrug.id)}>
                        {isFav ? <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> : <StarOff className="w-4 h-4 text-slate-300 hover:text-amber-400" />}
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 ml-6">{selectedDrug.therapeutic_class || selectedDrug.category}</p>
                    {selectedDrug.brands_indian && <p className="text-xs text-slate-400 ml-6 mt-0.5">Brands: {selectedDrug.brands_indian}</p>}
                  </div>
                  <Button size="sm" onClick={() => openRxBuilder(selectedDrug, true)}
                    className={`text-xs flex-shrink-0 ${isInRx ? "bg-green-100 text-green-700 border border-green-300" : "bg-teal-600 hover:bg-teal-700 text-white"}`}>
                    {isInRx ? <><CheckCircle className="w-3 h-3 mr-1" />In Rx</> : <><Plus className="w-3 h-3 mr-1" />Prescribe</>}
                  </Button>
                </div>

                {renalFlag && (
                  <div className={`rounded-lg px-3 py-2 text-xs font-medium border mb-3 ${renalFlag.level === "critical" ? "bg-red-50 border-red-300 text-red-800" : "bg-amber-50 border-amber-300 text-amber-800"}`}>
                    ⚠️ Renal adjustment required: {renalFlag.msg}
                  </div>
                )}

                {/* Indication-based Rx builder — opened via Prescribe button */}
                {showIndicationBuilder && rxBuilderDrug?._inDrugView && rxBuilderDrug?.id === selectedDrug.id && (
                  <div className="mb-3">
                    <RxIndicationBuilder
                      drug={selectedDrug}
                      weight={weight}
                      patientAge={age}
                      onClose={() => { setShowIndicationBuilder(false); setRxBuilderDrug(null); }}
                      onAddToRxList={handleIndicationAdd}
                    />
                  </div>
                )}

                {/* Sub-tabs */}
                <div className="flex gap-0 border-b border-slate-100 -mx-4 px-4">
                  {[
                    { id: "dose", label: "Dose" },
                    { id: "formulation", label: "Formulation" },
                    { id: "monitoring", label: "Monitoring" },
                    { id: "interactions", label: "Interactions" },
                    { id: "monograph", label: "Full Monograph" },
                  ].map(t => (
                    <button key={t.id} onClick={() => setDrugSubTab(t.id)}
                      className={`px-3 py-2 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${drugSubTab === t.id ? "border-teal-600 text-teal-700" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sub-tab content */}
              {drugSubTab === "dose" && (
                <div className="space-y-3">
                  {dose && dose.type !== "TDM" && dose.type !== "unknown" ? (
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "Per Dose", value: dose.perDose, highlight: true },
                        { label: "Daily Total", value: dose.daily },
                        { label: "Frequency", value: dose.freq },
                        { label: "Route", value: selectedDrug.route || "PO" },
                      ].map(({ label, value, highlight }) => (
                        <div key={label} className={`rounded-xl p-3 text-center border ${highlight ? "bg-teal-50 border-teal-200" : "bg-white border-slate-200"}`}>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wide">{label}</p>
                          <p className={`font-bold mt-0.5 ${highlight ? "text-teal-800 text-base" : "text-slate-800 text-sm"}`}>{value || "—"}</p>
                        </div>
                      ))}
                    </div>
                  ) : dose?.type === "TDM" ? (
                    <Alert className="bg-blue-50 border-blue-200"><AlertDescription className="text-blue-800 text-sm"><strong>TDM-guided.</strong> {dose.note}</AlertDescription></Alert>
                  ) : null}
                  {dose?.note && dose.type !== "TDM" && (
                    <p className="text-xs text-slate-400 bg-white rounded-xl px-3 py-2 border border-slate-100">{dose.note}</p>
                  )}
                  {!weight && <Alert className="bg-amber-50 border-amber-200"><AlertDescription className="text-amber-700 text-xs">Enter patient weight above to calculate personalised dose</AlertDescription></Alert>}
                  {selectedDrug.dose_age_based && (
                    <Card className="bg-white border border-slate-200"><CardContent className="p-3"><p className="text-xs font-bold text-slate-500 uppercase mb-1">Indication-specific dosing</p><p className="text-xs text-slate-700">{selectedDrug.dose_age_based}</p></CardContent></Card>
                  )}
                  {selectedDrug.renal_adjust && (
                    <Card className="bg-indigo-50 border border-indigo-200"><CardContent className="p-3">
                      <p className="text-xs font-bold text-indigo-600 uppercase mb-1">Renal Adjustments</p>
                      <p className="text-xs text-indigo-800">{selectedDrug.renal_adjust}</p>
                      {selectedDrug.hd_adjust && <p className="text-xs mt-1"><strong>HD:</strong> {selectedDrug.hd_adjust}</p>}
                      {selectedDrug.pd_adjust && <p className="text-xs mt-1"><strong>PD:</strong> {selectedDrug.pd_adjust}</p>}
                      {selectedDrug.crrt_dose && <p className="text-xs mt-1"><strong>CRRT:</strong> {selectedDrug.crrt_dose}</p>}
                    </CardContent></Card>
                  )}
                </div>
              )}

              {drugSubTab === "formulation" && (
                <div className="space-y-3">
                  {selectedDrug.formulations?.length > 0 ? (
                    <div className="space-y-2">
                      {selectedDrug.formulations.map((f, i) => (
                        <div key={i} className="bg-white rounded-xl border border-slate-200 px-3 py-2.5 flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-700">{f.form}</span>
                          <span className="text-xs text-teal-700 font-bold">{f.strength}</span>
                          {f.pack_info && <span className="text-xs text-slate-400">{f.pack_info}</span>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-6">No formulation data available</p>
                  )}
                  {selectedDrug.iv_preparation_instructions && (
                    <Card className="bg-blue-50 border-blue-200"><CardContent className="p-3">
                      <p className="text-xs font-bold text-blue-700 mb-1">IV Preparation</p>
                      <p className="text-xs text-blue-800">{selectedDrug.iv_preparation_instructions}</p>
                    </CardContent></Card>
                  )}
                  {selectedDrug.approx_cost_per_unit_inr && (
                    <p className="text-xs text-slate-500 bg-white border rounded-xl px-3 py-2">Approx. cost: ₹{selectedDrug.approx_cost_per_unit_inr}/unit
                      {selectedDrug.jan_aushadhi_available && " · Jan Aushadhi available"}
                      {selectedDrug.pmjay_covered && " · PMJAY covered"}
                    </p>
                  )}
                </div>
              )}

              {drugSubTab === "monitoring" && (
                <div className="space-y-3">
                  {selectedDrug.monitoring ? (
                    <Card className="bg-white border border-slate-200"><CardContent className="p-4">
                      <p className="text-xs font-bold text-slate-500 uppercase mb-2">Monitoring Parameters</p>
                      <p className="text-sm text-slate-700">{selectedDrug.monitoring}</p>
                      {selectedDrug.monitoring_frequency && <p className="text-xs text-slate-500 mt-2"><strong>Frequency:</strong> {selectedDrug.monitoring_frequency}</p>}
                    </CardContent></Card>
                  ) : <p className="text-xs text-slate-400 text-center py-6">No monitoring data</p>}
                  {selectedDrug.adverse_effects && (
                    <Card className="bg-amber-50 border-amber-200"><CardContent className="p-4">
                      <p className="text-xs font-bold text-amber-700 uppercase mb-1">Adverse Effects</p>
                      <p className="text-sm text-amber-800">{selectedDrug.adverse_effects}</p>
                    </CardContent></Card>
                  )}
                  {selectedDrug.contraindications && (
                    <Card className="bg-red-50 border-red-200"><CardContent className="p-4">
                      <p className="text-xs font-bold text-red-700 uppercase mb-1">Contraindications</p>
                      <p className="text-sm text-red-800">{selectedDrug.contraindications}</p>
                    </CardContent></Card>
                  )}
                </div>
              )}

              {drugSubTab === "interactions" && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500">Interactions with drugs currently in your prescription:</p>
                  {rxDrugs.length < 2 ? (
                    <Alert className="bg-slate-50 border-slate-200"><AlertDescription className="text-slate-500 text-xs">Add at least 2 drugs to Rx to check interactions</AlertDescription></Alert>
                  ) : interactions.length === 0 ? (
                    <Alert className="bg-green-50 border-green-200"><AlertDescription className="text-green-700 text-xs">No major interactions detected in current prescription</AlertDescription></Alert>
                  ) : interactions.map((ix, i) => (
                    <div key={i} className={`rounded-xl border p-3 text-xs ${SEV_COLOR[ix.severity]}`}>
                      <p className="font-bold">{ix.a} + {ix.b} [{ix.severity.toUpperCase()}]</p>
                      <p className="mt-0.5">{ix.msg}</p>
                    </div>
                  ))}
                  {selectedDrug.key_interactions && (
                    <Card className="bg-white border-slate-200"><CardContent className="p-3">
                      <p className="text-xs font-bold text-slate-500 uppercase mb-1">Known Key Interactions</p>
                      <p className="text-xs text-slate-700">{selectedDrug.key_interactions}</p>
                    </CardContent></Card>
                  )}
                </div>
              )}

              {drugSubTab === "monograph" && (
                <FormularyBrowser weight={weight} height={height} egfr={effectiveEgfr} initialSearch={selectedDrug.generic_name} />
              )}
            </div>
          );
        })()}

        {/* ── RX MODE ── */}
        {mode === "rx" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2"><Printer className="w-4 h-4 text-teal-600" /> Prescription Builder</h2>
            </div>

            {/* ── Quick Drug Search inside Rx — opens indication builder ── */}
            <RxQuickSearch drugs={drugs} weight={parseFloat(weight)} bsa={bsa} effectiveEgfr={effectiveEgfr} onSelectForRx={openRxBuilder} rxDrugs={rxDrugs} />

            {/* Indication builder (appears inline when drug selected from search) */}
            {showIndicationBuilder && rxBuilderDrug && !rxBuilderDrug._inDrugView && (
              <RxIndicationBuilder
                drug={rxBuilderDrug}
                weight={weight}
                patientAge={age}
                onClose={() => { setShowIndicationBuilder(false); setRxBuilderDrug(null); }}
                onAddToRxList={handleIndicationAdd}
              />
            )}

            {/* Template section */}
            <div className="bg-white rounded-xl border border-slate-200 p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-slate-600 flex items-center gap-1.5"><FolderOpen className="w-3.5 h-3.5 text-teal-600" /> Prescription Templates</p>
                {rxDrugs.length > 0 && (
                  <button onClick={() => setShowSaveTemplate(v => !v)}
                    className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-800 font-semibold">
                    <Save className="w-3.5 h-3.5" /> Save Current
                  </button>
                )}
              </div>
              {showSaveTemplate && (
                <div className="flex gap-2 mb-2">
                  <input value={templateName} onChange={e => setTemplateName(e.target.value)}
                    placeholder="Template name (e.g. NS First Episode)"
                    className="flex-1 text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-300" />
                  <Button size="sm" onClick={() => {
                    if (!templateName.trim()) { toast.error("Enter a template name"); return; }
                    saveTemplate(templateName, rxDrugs);
                    setTemplateName(""); setShowSaveTemplate(false);
                    toast.success("Template saved");
                  }} className="bg-teal-600 hover:bg-teal-700 text-white text-xs h-8">Save</Button>
                </div>
              )}
              {templates.length === 0 ? (
                <p className="text-xs text-slate-400">No templates yet. Build a prescription and save it as a template for quick reuse.</p>
              ) : (
                <div className="flex gap-2 flex-wrap">
                  {templates.map(t => (
                    <div key={t.id} className="flex items-center gap-1.5 bg-teal-50 border border-teal-200 rounded-lg px-2.5 py-1.5">
                      <button onClick={() => {
                        const drugIds = t.drugs.map(d => d.id);
                        const found = drugs.filter(d => drugIds.includes(d.id));
                        setRxDrugs(found);
                        toast.success(`Loaded: ${t.name}`);
                      }} className="text-xs font-semibold text-teal-800 hover:text-teal-600">{t.name}</button>
                      <span className="text-xs text-teal-400">({t.drugs.length})</span>
                      <button onClick={() => removeTemplate(t.id)} className="text-slate-300 hover:text-red-400"><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {rxDrugs.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <Pill className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No drugs added yet.</p>
                <button onClick={() => setMode("search")} className="mt-2 text-xs text-teal-600 font-semibold hover:underline">← Search & add drugs</button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {rxDrugs.map((drug, idx) => {
                    const dose = calcDose(drug, parseFloat(weight), bsa, effectiveEgfr);
                    const renalFlag = effectiveEgfr ? getRenalFlag(drug, effectiveEgfr) : null;
                    return (
                      <div key={drug.id} className={`bg-white rounded-xl border-2 p-3 ${renalFlag?.level === "critical" ? "border-red-300" : "border-slate-200"}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-400 w-5">{idx + 1}.</span>
                              <p className="text-sm font-bold text-slate-900">{drug.generic_name}</p>
                              {drug.brands_indian && <span className="text-xs text-slate-400">({drug.brands_indian.split(",")[0].trim()})</span>}
                            </div>
                            {(() => {
                              // If added via indication builder, show structured output
                              if (drug._indication) {
                                return (
                                  <div className="ml-7 mt-0.5 space-y-0.5">
                                    <p className="text-[11px] text-teal-600 font-semibold">📋 {drug._indication}</p>
                                    {drug.dose_weight_based && <p className="text-xs text-teal-800 font-bold">{drug.dose_weight_based} · {drug.frequency || "—"} · {drug.route || "PO"}</p>}
                                    {drug._duration && <p className="text-xs text-slate-500">Duration: {drug._duration}</p>}
                                    {drug._formulation && <p className="text-xs text-indigo-600">{drug._formulation.form} {drug._formulation.strength}</p>}
                                  </div>
                                );
                              }
                              const fDrug = getFormularyDrug(drug.generic_name);
                              const wt = parseFloat(weight);
                              if (fDrug?.peds_dose && wt) {
                                const perKg = fDrug.peds_dose.match(/([\d.]+)(?:–|-)([\d.]+)?\s*mg\/kg/);
                                if (perKg) {
                                  const lo = (parseFloat(perKg[1]) * wt).toFixed(1);
                                  const hi = perKg[2] ? (parseFloat(perKg[2]) * wt).toFixed(1) : null;
                                  return <p className="text-xs text-indigo-700 font-semibold ml-7 mt-0.5">📊 {hi ? `${lo}–${hi} mg` : `${lo} mg`} · {drug.frequency || "per dose"} · {drug.route || "PO"}</p>;
                                }
                              }
                              if (dose && dose.type !== "TDM") return <p className="text-xs text-teal-700 font-semibold ml-7 mt-0.5">{dose.perDose} · {dose.freq} · {drug.route || "PO"}</p>;
                              if (dose?.type === "TDM") return <p className="text-xs text-blue-700 ml-7 mt-0.5">TDM-guided</p>;
                              if (fDrug?.peds_dose) return <p className="text-xs text-indigo-600 ml-7 mt-0.5 text-[11px]">{fDrug.peds_dose.split(".")[0]}</p>;
                              return null;
                            })()}
                            {!weight && <p className="text-xs text-amber-600 ml-7 mt-0.5">Enter weight above to auto-calculate dose</p>}
                            {renalFlag && <p className="text-xs text-amber-700 ml-7 mt-0.5">⚠️ {renalFlag.msg}</p>}
                          </div>
                          <button onClick={() => setRxDrugs(p => p.filter(d => d.id !== drug.id))}
                            className="text-red-300 hover:text-red-500 flex-shrink-0">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {interactions.length > 0 && (
                  <Alert className="bg-amber-50 border-amber-300">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <AlertDescription className="text-amber-800 text-xs">
                      <strong>Interactions:</strong> {interactions.map(ix => `${ix.a}+${ix.b} (${ix.severity})`).join(" | ")}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2">
                  <Button onClick={() => { const w = window.open("", "_blank"); w.document.write(`<html><head><title>Rx</title><style>body{font-family:monospace;padding:24px;max-width:700px;margin:auto;font-size:12px}pre{white-space:pre-wrap}</style></head><body><pre>${buildRx()}</pre></body></html>`); w.print(); }}
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white text-xs h-10">
                    <Printer className="w-4 h-4 mr-1.5" /> Print
                  </Button>
                  <Button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(buildRx().slice(0, 2000))}`, "_blank")}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs h-10">
                    <MessageCircle className="w-4 h-4 mr-1.5" /> WhatsApp
                  </Button>
                  <Button onClick={() => { navigator.clipboard.writeText(buildRx()); toast.success("Copied!"); }}
                    variant="outline" className="text-xs h-10">Copy</Button>
                </div>

                <Card className="bg-slate-900 border-0">
                  <CardContent className="p-3">
                    <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap leading-relaxed">{buildRx()}</pre>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}

        {/* ── ADVANCED TOOL VIEWS (direct tabs, no "more" menu) ── */}
        {mode === "wizard" && (
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-4 text-white">
              <h2 className="text-base font-bold">Safe Prescriber Wizard</h2>
              <p className="text-xs text-indigo-100 mt-0.5">DoseRule-driven · Indication-specific · Blocks unsafe prescribing</p>
            </div>
            <IndicationPrescribeWizard
              weight={weight} height={height} age={age} egfr={effectiveEgfr?.toString()}
              onAddToRx={(drug) => { addToRx(drug); setMode("rx"); }}
            />
          </div>
        )}
        {mode === "steroid-sparing" && <SteroidSparingAgents />}
        {mode === "steroids" && <SteroidEquivalenceEngine />}
        {mode === "eculizumab" && <EculizumabGuidance />}
        {mode === "plasmapheresis" && <PlasmapheresisModule />}

        {mode === "formulary" && (
          <div className="space-y-4">
            {/* Header */}
            <div className="bg-white rounded-2xl border border-indigo-200 p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Pediatric Nephrology Formulary</h2>
                <p className="text-xs text-indigo-600 mt-0.5">Full monographs · Indian formulations & brands · Renal dose adjustments · Administration guidance</p>
              </div>
            </div>
            <FormularyBrowser
              weight={weight}
              height={height}
              egfr={effectiveEgfr?.toString()}
              initialSearch=""
              onAddToRx={(formularyDrug) => {
                // Map formulary drug shape → DB drug shape for Rx builder
                const mapped = {
                  id: formularyDrug.generic,
                  generic_name: formularyDrug.generic,
                  category: formularyDrug.class || "Formulary",
                  therapeutic_class: formularyDrug.class,
                  route: formularyDrug.formulations?.[0]?.form?.includes("IV") ? "IV" : "PO",
                  dose_weight_based: formularyDrug.peds_dose || formularyDrug.dose || "",
                  frequency: formularyDrug.freq || "OD",
                  brands_indian: formularyDrug.formulations?.map(f => f.brands).filter(Boolean).join(", ") || "",
                  renal_adjust: formularyDrug.renal_adjust || "",
                  dose_calculation_type: "per_day",
                };
                addToRx(mapped);
                setMode("rx");
              }}
            />
          </div>
        )}

        {mode === "ckd" && (
          <Card className="bg-white border border-slate-200">
            <CardHeader className="py-3 px-4 border-b"><CardTitle className="text-sm">CKD & Dialysis Dosing Reference</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead><tr className="bg-slate-100">
                    <th className="text-left px-3 py-2 font-semibold">Drug</th>
                    <th className="text-center px-2 py-2 font-semibold">eGFR 30–60</th>
                    <th className="text-center px-2 py-2 font-semibold">eGFR &lt;30</th>
                    <th className="text-center px-2 py-2 font-semibold">HD</th>
                    <th className="text-center px-2 py-2 font-semibold">PD</th>
                  </tr></thead>
                  <tbody>
                    {[
                      { drug: "Prednisolone", g30_60: "No adj.", esrd: "No adj.", hd: "Not dialysed", pd: "Not removed" },
                      { drug: "Tacrolimus", g30_60: "TDM", esrd: "TDM", hd: "Not dialysed", pd: "Not removed" },
                      { drug: "Enalapril", g30_60: "50–75%", esrd: "25–50%", hd: "Supplement", pd: "No extra" },
                      { drug: "Furosemide", g30_60: "Higher dose", esrd: "Ineffective", hd: "Not removed", pd: "Residual" },
                      { drug: "Cotrimoxazole", g30_60: "75%", esrd: "Avoid", hd: "Supplement", pd: "50%" },
                      { drug: "Acyclovir", g30_60: "50%", esrd: "5 mg/kg/24h", hd: "Supplement", pd: "50%" },
                      { drug: "Vancomycin", g30_60: "Extend, TDM", esrd: "Single, TDM", hd: "TDM", pd: "TDM" },
                      { drug: "Cyclophosphamide", g30_60: "Full", esrd: "Reduce 50%", hd: "Supplement", pd: "25%" },
                    ].map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                        <td className="px-3 py-2 font-semibold text-slate-900">{row.drug}</td>
                        <td className="px-2 py-2 text-center text-slate-600">{row.g30_60}</td>
                        <td className="px-2 py-2 text-center text-red-700">{row.esrd}</td>
                        <td className="px-2 py-2 text-center text-indigo-700">{row.hd}</td>
                        <td className="px-2 py-2 text-center text-purple-700">{row.pd}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}