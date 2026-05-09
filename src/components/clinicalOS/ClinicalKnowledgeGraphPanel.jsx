import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Search, Network, Dna, Pill, FlaskConical, Activity, ChevronRight } from "lucide-react";

const GRAPH_NODES = [
  {
    id: "srns", type: "disease", label: "SRNS",
    fullName: "Steroid-Resistant Nephrotic Syndrome",
    category: "Nephrotic Syndrome",
    connections: {
      drugs: ["Tacrolimus", "Cyclosporine", "Mycophenolate", "Rituximab"],
      genes: ["NPHS1 (nephrin)", "NPHS2 (podocin)", "WT1", "TRPC6", "ACTN4"],
      biopsy: ["FSGS (most common)", "Minimal Change Disease", "Diffuse Mesangial Sclerosis"],
      calculators: ["Schwartz GFR", "Urine PCR", "BP Percentile"],
      monitoring: ["Tacrolimus trough", "Urine PCR monthly", "Renal function monthly"]
    }
  },
  {
    id: "frns", type: "disease", label: "FRNS",
    fullName: "Frequently Relapsing Nephrotic Syndrome",
    category: "Nephrotic Syndrome",
    connections: {
      drugs: ["Levamisole", "Low-dose Prednisolone", "Mycophenolate", "Cyclophosphamide"],
      genes: ["NPHS2 (rare)", "HLA-DR association (SSNS)"],
      biopsy: ["Minimal Change Disease (>80%)", "FSGS (steroid-dependent)"],
      calculators: ["Urine dipstick", "BP Percentile", "Growth monitoring"],
      monitoring: ["CBC if Levamisole", "Urine dipstick daily", "Steroid side effects"]
    }
  },
  {
    id: "fsgs", type: "biopsy", label: "FSGS",
    fullName: "Focal Segmental Glomerulosclerosis",
    category: "Glomerular Diseases",
    connections: {
      drugs: ["Tacrolimus", "Cyclosporine", "Rituximab", "ACE Inhibitor"],
      genes: ["NPHS2", "TRPC6", "ACTN4", "INF2", "CD2AP"],
      biopsy: ["Columbia variants: NOS, Tip, Cellular, Perihilar, Collapsing"],
      calculators: ["Schwartz GFR", "Urine PCR"],
      monitoring: ["Renal function", "Proteinuria response at 6 months"]
    }
  },
  {
    id: "aki", type: "disease", label: "AKI",
    fullName: "Acute Kidney Injury",
    category: "AKI",
    connections: {
      drugs: ["Furosemide (if volume overloaded)", "Sodium bicarbonate (if acidosis)", "Calcium gluconate (if K+ >6.5)"],
      genes: ["CFH mutations (aHUS)", "CFHR1/3 deletions"],
      biopsy: ["Acute tubular necrosis", "ATIN", "Crescentic GN"],
      calculators: ["Schwartz GFR", "KDIGO AKI Staging", "Fluid balance"],
      monitoring: ["Creatinine 6-12 hourly (acute)", "Urine output hourly", "Electrolytes daily"]
    }
  },
  {
    id: "igan", type: "disease", label: "IgAN",
    fullName: "IgA Nephropathy",
    category: "Glomerular Diseases",
    connections: {
      drugs: ["ACE Inhibitor / ARB (first-line)", "Prednisolone (progressive disease)", "Fish oil (limited evidence)"],
      genes: ["DEFA (alpha-defensins)", "HLA associations"],
      biopsy: ["Oxford MEST-C score", "IgA dominant deposits (IF)"],
      calculators: ["Schwartz GFR", "Urine PCR", "BP Percentile"],
      monitoring: ["BP monthly", "Urine PCR 3-monthly", "Renal function 3-monthly"]
    }
  },
  {
    id: "lupus_nephritis", type: "disease", label: "Lupus Nephritis",
    fullName: "Lupus Nephritis",
    category: "Glomerular Diseases",
    connections: {
      drugs: ["Hydroxychloroquine", "MMF (class III/IV)", "Cyclophosphamide (severe)", "Rituximab (refractory)"],
      genes: ["C1Q deficiency", "C2/C4 mutations", "IRF5 polymorphisms"],
      biopsy: ["ISN/RPS Class I–VI", "Class III/IV = proliferative (worst prognosis)"],
      calculators: ["BP Percentile", "SLEDAI", "Schwartz GFR"],
      monitoring: ["Anti-dsDNA monthly", "C3/C4 monthly", "CBC monthly (MMF)", "Urine PCR monthly"]
    }
  },
  {
    id: "tacrolimus", type: "drug", label: "Tacrolimus",
    fullName: "Tacrolimus (CNI)",
    category: "Immunosuppressant",
    connections: {
      drugs: ["Prednisolone (combination)", "MMF (triple therapy)"],
      genes: ["CYP3A5 (metabolizer status)"],
      biopsy: ["CNI nephrotoxicity on biopsy (isometric vacuolation)"],
      calculators: ["TDM trough calculator"],
      monitoring: ["Trough AM before dose — target 5–10 ng/mL", "Renal function monthly", "Fasting glucose", "BP weekly"]
    }
  },
  {
    id: "rituximab", type: "drug", label: "Rituximab",
    fullName: "Rituximab (Anti-CD20)",
    category: "Biologic",
    connections: {
      drugs: ["MMF (bridge therapy)", "Prednisolone (co-administered)"],
      genes: ["Polymorphisms in FCGR3A affecting response"],
      biopsy: [],
      calculators: ["BSA-based dosing", "CD19 count post-infusion"],
      monitoring: ["CD19/CD20 B-cell count", "Immunoglobulins 3-monthly", "Infection screening pre-dose", "Live vaccine contraindicated"]
    }
  }
];

const TYPE_CONFIG = {
  disease: { icon: Activity, color: "bg-blue-100 text-blue-800 border-blue-200", label: "Disease" },
  drug: { icon: Pill, color: "bg-green-100 text-green-800 border-green-200", label: "Drug" },
  biopsy: { icon: FlaskConical, color: "bg-purple-100 text-purple-800 border-purple-200", label: "Biopsy Pattern" },
  gene: { icon: Dna, color: "bg-orange-100 text-orange-800 border-orange-200", label: "Gene" },
};

export default function ClinicalKnowledgeGraphPanel() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [filterType, setFilterType] = useState("all");

  const filtered = GRAPH_NODES.filter(n => {
    const matchSearch = !search || n.label.toLowerCase().includes(search.toLowerCase()) ||
      n.fullName.toLowerCase().includes(search.toLowerCase()) ||
      n.category.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || n.type === filterType;
    return matchSearch && matchType;
  });

  const activeNode = selected ? GRAPH_NODES.find(n => n.id === selected) : null;

  return (
    <div className="space-y-3">
      {/* Search + filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search disease, drug, gene…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300"
          />
        </div>
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-300"
        >
          <option value="all">All types</option>
          <option value="disease">Diseases</option>
          <option value="drug">Drugs</option>
          <option value="biopsy">Biopsy</option>
        </select>
      </div>

      {/* Node grid */}
      {!activeNode ? (
        <div className="grid grid-cols-2 gap-2">
          {filtered.map(node => {
            const cfg = TYPE_CONFIG[node.type] || TYPE_CONFIG.disease;
            return (
              <button
                key={node.id}
                onClick={() => setSelected(node.id)}
                className={`text-left p-3 rounded-xl border-2 hover:shadow-md transition-all bg-white hover:border-emerald-300`}
              >
                <div className="flex items-start gap-2 mb-1">
                  <cfg.icon className="w-4 h-4 flex-shrink-0 mt-0.5 text-slate-500" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-slate-900 leading-tight">{node.label}</p>
                    <p className="text-xs text-slate-500 leading-tight truncate">{node.fullName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-wrap mt-1">
                  <Badge className={`text-xs border ${cfg.color}`}>{cfg.label}</Badge>
                  <span className="text-xs text-slate-400">{node.connections.drugs?.length || 0} drugs · {node.connections.genes?.length || 0} genes</span>
                </div>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-2 text-center py-8 text-slate-400 text-sm">No nodes found</div>
          )}
        </div>
      ) : (
        /* Detail view */
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <button onClick={() => setSelected(null)} className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">
              ← Back
            </button>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-xs text-slate-600">{activeNode.label}</span>
          </div>

          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl p-3">
            <h3 className="font-bold text-slate-900 text-base">{activeNode.fullName}</h3>
            <div className="flex gap-1.5 mt-1">
              <Badge className={`text-xs border ${TYPE_CONFIG[activeNode.type]?.color}`}>{TYPE_CONFIG[activeNode.type]?.label}</Badge>
              <Badge variant="outline" className="text-xs">{activeNode.category}</Badge>
            </div>
          </div>

          {[
            { key: "drugs", label: "🔵 Associated Drugs", color: "bg-blue-50 border-blue-200 text-blue-800" },
            { key: "genes", label: "🧬 Implicated Genes", color: "bg-orange-50 border-orange-200 text-orange-800" },
            { key: "biopsy", label: "🔬 Biopsy Patterns", color: "bg-purple-50 border-purple-200 text-purple-800" },
            { key: "monitoring", label: "📋 Key Monitoring", color: "bg-green-50 border-green-200 text-green-800" },
            { key: "calculators", label: "🧮 Related Calculators", color: "bg-slate-50 border-slate-200 text-slate-700" },
          ].map(section => (
            activeNode.connections[section.key]?.length > 0 && (
              <div key={section.key} className={`border rounded-xl p-3 ${section.color}`}>
                <p className="text-xs font-bold mb-2">{section.label}</p>
                <div className="flex flex-wrap gap-1.5">
                  {activeNode.connections[section.key].map((item, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 bg-white/60 rounded-full border border-current/20">{item}</span>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
}