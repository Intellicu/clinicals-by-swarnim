import React, { useState, useMemo } from "react";
import { Cpu, ChevronRight, Search, X, BookOpen, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

const ENGINES = [
  // ── Emergency / Electrolyte ──
  { label: "AKI Engine", desc: "KDIGO + RRT triggers", scenario: "aki-engine", tags: ["AKI", "renal failure", "emergency", "creatinine"], group: "Emergency & Electrolytes" },
  { label: "Hyperkalaemia", desc: "K+ emergency full engine", scenario: "hyperkalemia-deep-engine", tags: ["hyperkalemia", "potassium", "arrhythmia", "emergency"], group: "Emergency & Electrolytes" },
  { label: "Hyponatraemia", desc: "Na correction engine", scenario: "hyponatremia-engine", tags: ["hyponatremia", "sodium", "SIADH", "fluid"], group: "Emergency & Electrolytes" },
  { label: "Hypokalemia", desc: "K+ deficiency pathway", scenario: "hypokalemia-engine", tags: ["hypokalemia", "potassium", "weakness"], group: "Emergency & Electrolytes" },
  { label: "Met. Acidosis", desc: "AG / RTA Engine", scenario: "metabolic-acidosis-engine", tags: ["acidosis", "anion gap", "RTA", "bicarbonate"], group: "Emergency & Electrolytes" },
  { label: "Polyuria / DI", desc: "Central vs Nephrogenic DI", scenario: "polyuria-engine", tags: ["polyuria", "diabetes insipidus", "NDI", "polydipsia"], group: "Emergency & Electrolytes" },

  // ── Glomerular ──
  { label: "GN Engine", desc: "IgAN · LN · MN · FSGS · PSGN · ANCA · Alport · C3G · IgAVN", scenario: "gn-engine", tags: ["glomerulonephritis", "IgA", "lupus nephritis", "membranous", "FSGS", "PSGN", "ANCA", "Alport", "C3G", "HSP"], group: "Glomerular Disease" },
  { label: "NS Engine", desc: "Nephrotic Syndrome full engine", scenario: "ns-engine", tags: ["nephrotic syndrome", "edema", "proteinuria", "steroid"], group: "Glomerular Disease" },
  { label: "RPGN Engine", desc: "Crescentic GN + PLEX", scenario: "rpgn-deep-engine", tags: ["RPGN", "crescentic GN", "plasmapheresis", "ANCA", "anti-GBM"], group: "Glomerular Disease" },
  { label: "TMA Engine", desc: "HUS / aHUS / TTP", scenario: "tma-engine", tags: ["HUS", "aHUS", "TTP", "TMA", "thrombocytopenia"], group: "Glomerular Disease" },
  { label: "Hematuria Engine", desc: "6-step algorithm: glomerular vs urological", scenario: "hematuria-engine", tags: ["hematuria", "blood urine", "RBC", "glomerular", "dysmorphic", "alport", "IgA"], group: "Glomerular Disease" },
  { label: "Proteinuria Engine", desc: "Dipstick → UPCR → biopsy indications", scenario: "proteinuria-engine", tags: ["proteinuria", "urine protein", "UPCR", "nephrotic", "tubular", "orthostatic"], group: "Glomerular Disease" },
  { label: "Biopsy Engine", desc: "When to biopsy", scenario: "biopsy-engine", tags: ["biopsy", "kidney biopsy", "histology", "indication"], group: "Glomerular Disease" },
  { label: "C3G Engine", desc: "C3 Glomerulopathy", scenario: "c3g-engine", tags: ["C3G", "MPGN", "complement", "dense deposit"], group: "Glomerular Disease" },
  { label: "Eculizumab", desc: "Eligibility + dosing", scenario: "eculizumab-engine", tags: ["eculizumab", "aHUS", "complement", "eligibility"], group: "Glomerular Disease" },

  // ── CKD & Genetics ──
  { label: "CKD Progression", desc: "Risk stratification", scenario: "ckd-progression-engine", tags: ["CKD", "progression", "eGFR", "fibrosis", "risk"], group: "CKD & Genetics" },
  { label: "Genetic Engine", desc: "When to test + which panel", scenario: "genetic-engine", tags: ["genetics", "gene panel", "WES", "SRNS", "Alport", "COL4"], group: "CKD & Genetics" },
  { label: "Alport/HNF1B", desc: "COL4 + most missed diagnosis", scenario: "alport-hnf1b-engine", tags: ["Alport", "HNF1B", "hereditary", "COL4A5", "deafness"], group: "CKD & Genetics" },
  { label: "Fabry Engine", desc: "Alpha-Gal A deficiency → ERT", scenario: "fabry-engine", tags: ["Fabry", "GLA", "lysosomal", "ERT", "migalastat", "angiokeratoma"], group: "CKD & Genetics" },
  { label: "Cystic Kidney", desc: "ADPKD/ARPKD/NPHP/BBS", scenario: "cystic-kidney-engine", tags: ["ADPKD", "ARPKD", "nephronophthisis", "cystic", "BBS", "PKD1"], group: "CKD & Genetics" },
  { label: "Hyperoxaluria", desc: "PH1/PH2/PH3 + lumasiran", scenario: "hyperoxaluria-engine", tags: ["hyperoxaluria", "PH1", "oxalate", "lumasiran", "stones"], group: "CKD & Genetics" },
  { label: "Cystinosis", desc: "Fanconi + cysteamine", scenario: "cystinosis-engine", tags: ["cystinosis", "Fanconi", "cysteamine", "leukocyte cystine"], group: "CKD & Genetics" },

  // ── CAKUT & Urology ──
  { label: "CAKUT Engine", desc: "Antenatal HN, UPJ, Duplex, MCDK", scenario: "cakut-engine", tags: ["CAKUT", "hydronephrosis", "UPJ", "duplex", "MCDK", "antenatal"], group: "CAKUT & Urology" },
  { label: "PUV Engine", desc: "Posterior urethral valves", scenario: "puv-engine", tags: ["PUV", "posterior urethral valve", "bladder", "MCU", "ESRD risk"], group: "CAKUT & Urology" },
  { label: "VUR/UTI Engine", desc: "Recurrent UTI + VUR grading", scenario: "vur-uti-engine", tags: ["VUR", "reflux", "UTI", "DMSA", "VCUG", "recurrent UTI"], group: "CAKUT & Urology" },
  { label: "Voiding Dx", desc: "BBD + Uroflow + OAB", scenario: "voiding-engine", tags: ["voiding dysfunction", "BBD", "uroflow", "OAB", "enuresis", "incontinence"], group: "CAKUT & Urology" },

  // ── Tubular & Metabolic ──
  { label: "Tubular Engine", desc: "Fanconi / XLH / NDI", scenario: "tubular-engine", tags: ["Fanconi", "rickets", "XLH", "NDI", "tubular", "phosphate"], group: "Tubular & Metabolic" },
  { label: "Stone Engine", desc: "Renal stones full workup", scenario: "stone-engine", tags: ["stones", "urolithiasis", "calcium oxalate", "cystinuria", "uric acid"], group: "Tubular & Metabolic" },
  { label: "Nephrocalcinosis", desc: "Grading + metabolic workup + management", scenario: "nephrocalcinosis-stone-engine", tags: ["nephrocalcinosis", "stones", "hypercalciuria", "oxaluria", "dRTA", "Bartter", "cystinuria"], group: "Tubular & Metabolic" },

  // ── Hypertension ──
  { label: "HTN Engine", desc: "AAP 2017 + secondary workup", scenario: "htn-engine", tags: ["hypertension", "BP", "AAP 2017", "secondary HTN", "stage 2"], group: "Hypertension" },
];

const GROUPS = [...new Set(ENGINES.map(e => e.group))];

const GROUP_STYLE = {
  "Emergency & Electrolytes": "bg-red-50 border-red-200 text-red-900",
  "Glomerular Disease": "bg-blue-50 border-blue-200 text-blue-900",
  "CKD & Genetics": "bg-violet-50 border-violet-200 text-violet-900",
  "CAKUT & Urology": "bg-teal-50 border-teal-200 text-teal-900",
  "Tubular & Metabolic": "bg-amber-50 border-amber-200 text-amber-900",
  "Hypertension": "bg-rose-50 border-rose-200 text-rose-900",
};

const GROUP_BADGE = {
  "Emergency & Electrolytes": "bg-red-600",
  "Glomerular Disease": "bg-blue-600",
  "CKD & Genetics": "bg-violet-600",
  "CAKUT & Urology": "bg-teal-600",
  "Tubular & Metabolic": "bg-amber-600",
  "Hypertension": "bg-rose-600",
};

// Keyword → guideline title fragments for matching from DB
const ENGINE_GUIDELINE_KEYS = {
  "aki-engine": ["AKI", "Acute Kidney"],
  "ns-engine": ["Nephrotic", "SSNS", "SRNS", "ISKDC"],
  "hyperkalemia-deep-engine": ["Hyperkalemia", "Hyperkalaemia", "Potassium"],
  "hyponatremia-engine": ["Hyponatremia", "Hyponatraemia", "Sodium"],
  "hematuria-engine": ["Hematuria", "Haematuria"],
  "htn-engine": ["Hypertension", "AAP 2017", "Blood Pressure"],
  "gn-engine": ["Glomerulonephritis", "IgA Nephropathy", "Lupus Nephritis", "FSGS", "PSGN", "Membranous"],
  "proteinuria-engine": ["Proteinuria", "Nephrotic"],
  "nephrocalcinosis-stone-engine": ["Nephrocalcinosis", "Stone", "Urolithiasis", "Hypercalciuria"],
  "fabry-engine": ["Fabry"],
  "cystic-kidney-engine": ["ADPKD", "ARPKD", "Cystic Kidney", "Nephronophthisis"],
  "cakut-engine": ["CAKUT", "Hydronephrosis"],
  "vur-uti-engine": ["VUR", "UTI", "Vesicoureteral"],
  "voiding-engine": ["Voiding", "Bladder"],
  "hyperoxaluria-engine": ["Hyperoxaluria", "Primary Hyperoxaluria"],
  "cystinosis-engine": ["Cystinosis"],
  "stone-engine": ["Stone", "Urolithiasis", "Nephrolithiasis"],
  "tubular-engine": ["Tubular", "Fanconi", "RTA"],
  "rpgn-deep-engine": ["RPGN", "Crescentic"],
  "ckd-progression-engine": ["CKD", "Chronic Kidney"],
  "genetic-engine": ["Genetic", "Gene"],
};

function GuidelineSidebar({ scenario, guidelines, loading }) {
  const keys = ENGINE_GUIDELINE_KEYS[scenario] || [];
  const matched = (guidelines || []).filter(g =>
    keys.some(k => g.title?.toLowerCase().includes(k.toLowerCase()) || g.category?.toLowerCase().includes(k.toLowerCase()))
  ).slice(0, 6);

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
      <div className="flex items-center gap-1.5 mb-2">
        <BookOpen className="w-3.5 h-3.5 text-slate-500" />
        <span className="text-xs font-bold text-slate-600">Evidence Base</span>
      </div>
      {loading && <p className="text-xs text-slate-400">Loading guidelines…</p>}
      {!loading && matched.length === 0 && (
        <p className="text-xs text-slate-400 italic">No linked guidelines found</p>
      )}
      {matched.map((g, i) => (
        <div key={i} className="bg-white border border-slate-100 rounded-lg p-2 space-y-0.5">
          <p className="text-xs font-semibold text-slate-800 leading-snug line-clamp-2">{g.title}</p>
          <div className="flex items-center gap-1 flex-wrap">
            {g.source && <Badge variant="outline" className="text-xs py-0 px-1.5">{g.source}</Badge>}
            {g.year && <span className="text-xs text-slate-400">{g.year}</span>}
          </div>
          {g.external_link && (
            <a href={g.external_link} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 text-xs text-blue-600 hover:underline">
              <ExternalLink className="w-3 h-3" /> View
            </a>
          )}
        </div>
      ))}
    </div>
  );
}

export default function IntelligenceEnginesTab({ onSelectEngine, onBack }) {
  const [search, setSearch] = useState("");
  const [activeGroup, setActiveGroup] = useState("All");
  const [activeEngine, setActiveEngine] = useState(null);

  // Fetch guidelines from DB (offline-safe — cached by react-query)
  const { data: guidelines = [], isLoading: guidelinesLoading } = useQuery({
    queryKey: ["guidelines-for-engines"],
    queryFn: () => base44.entities.Guideline.list("-year", 200),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return ENGINES.filter(e => {
      const matchGroup = activeGroup === "All" || e.group === activeGroup;
      const matchSearch = !q || e.label.toLowerCase().includes(q) ||
        e.desc.toLowerCase().includes(q) ||
        e.tags.some(t => t.toLowerCase().includes(q));
      return matchGroup && matchSearch;
    });
  }, [search, activeGroup]);

  const grouped = useMemo(() => {
    const g = {};
    filtered.forEach(e => {
      if (!g[e.group]) g[e.group] = [];
      g[e.group].push(e);
    });
    return g;
  }, [filtered]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-1">
          <Cpu className="w-5 h-5 text-slate-700" />
          <h2 className="font-bold text-base text-slate-900">Intelligence Engines</h2>
          <Badge variant="outline" className="text-xs font-bold">{ENGINES.length}</Badge>
        </div>
        <p className="text-xs text-slate-500">Advanced diagnostic decision engines — fully offline capable</p>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by disease, symptom, age group…"
          className="w-full pl-9 pr-9 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Group filter pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {["All", ...GROUPS].map(g => (
          <button key={g} onClick={() => setActiveGroup(g)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
              ${activeGroup === g
                ? "bg-slate-800 text-white border-slate-800"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"}`}>
            {g}
          </button>
        ))}
      </div>

      {/* Engine list grouped */}
      {Object.keys(grouped).length === 0 && (
        <p className="text-center text-slate-400 py-8 text-sm">No engines match your search</p>
      )}

      {Object.entries(grouped).map(([group, engines]) => (
        <div key={group} className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge className={`text-xs ${GROUP_BADGE[group] || "bg-slate-600"}`}>{group}</Badge>
            <span className="text-xs text-slate-400">({engines.length})</span>
          </div>

          <div className="space-y-1.5">
            {engines.map(eng => (
              <div key={eng.scenario}>
                <button
                  onClick={() => {
                    setActiveEngine(activeEngine === eng.scenario ? null : eng.scenario);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all text-left
                    ${activeEngine === eng.scenario
                      ? "border-slate-400 bg-slate-100"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}`}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-900">{eng.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{eng.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={e => { e.stopPropagation(); onSelectEngine(eng.scenario); }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors">
                      Open <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </button>

                {/* Expanded guideline sidebar */}
                {activeEngine === eng.scenario && (
                  <div className="mt-1.5 ml-2 pl-3 border-l-2 border-slate-200">
                    <GuidelineSidebar scenario={eng.scenario} guidelines={guidelines} loading={guidelinesLoading} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Back button */}
      {onBack && (
        <button onClick={onBack} className="w-full py-2.5 text-xs font-semibold text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 flex items-center justify-center gap-1">
          ← Back to Pathways
        </button>
      )}
    </div>
  );
}