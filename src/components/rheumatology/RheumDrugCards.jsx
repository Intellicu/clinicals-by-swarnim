import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ChevronDown, ChevronUp, AlertTriangle, Shield, Activity,
  CheckCircle, Info, Pill, Search, X
} from "lucide-react";
import { RHEUM_DRUGS, DRUG_CLASSES } from "@/lib/rheumatology/RheumDrugs";

const CLASS_COLORS = {
  "DMARD": "bg-blue-100 text-blue-800",
  "Biologic": "bg-purple-100 text-purple-800",
  "IL-1 Inhibitor": "bg-amber-100 text-amber-800",
  "TNFi": "bg-red-100 text-red-800",
  "Immunosuppressant": "bg-orange-100 text-orange-800",
  "Antimalarial": "bg-teal-100 text-teal-800",
  "JAK inhibitor": "bg-indigo-100 text-indigo-800",
  "Anti-CD20 B-cell depleting biologic": "bg-purple-100 text-purple-800",
  "TNF receptor fusion protein (biologic)": "bg-red-100 text-red-800",
  "T-cell costimulation blocker (biologic)": "bg-violet-100 text-violet-800",
  "IL-6 Receptor Inhibitor (biologic)": "bg-cyan-100 text-cyan-800",
  "Alkylating Agent / Immunosuppressant": "bg-orange-100 text-orange-800",
};

function DrugCard({ drug }) {
  const [expanded, setExpanded] = useState(false);
  const [tab, setTab] = useState("dosing");
  const classColor = CLASS_COLORS[drug.class] || "bg-slate-100 text-slate-700";

  const tabs = [
    { id: "dosing", label: "💊 Dosing" },
    { id: "monitoring", label: "📈 Monitoring" },
    { id: "safety", label: "🛡️ Safety" },
    { id: "vaccines", label: "💉 Vaccines" },
  ];

  return (
    <div className="bg-white rounded-xl border-2 border-slate-200 hover:border-purple-200 overflow-hidden transition-all">
      <button className="w-full text-left p-3" onClick={() => setExpanded(e => !e)}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-bold text-sm text-slate-900">{drug.name}</span>
              <Badge className={`text-xs ${classColor}`}>{drug.class?.split(" ")[0]}</Badge>
              <Badge className="text-xs bg-green-100 text-green-800">Evidence: {drug.evidence_grade}</Badge>
            </div>
            <p className="text-xs text-slate-500 line-clamp-1">{drug.mechanism}</p>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-slate-100 px-3 pb-3">
          {/* Indications */}
          <div className="py-2 border-b border-slate-100">
            <p className="text-xs font-bold text-slate-500 mb-1.5">Indications</p>
            <div className="flex flex-wrap gap-1">
              {drug.indications?.map((ind, i) => (
                <Badge key={i} variant="outline" className="text-xs">{ind}</Badge>
              ))}
            </div>
          </div>

          {/* Sub-tabs */}
          <div className="flex gap-1 pt-2 pb-1 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {tabs.map(t => (
              <button key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-shrink-0 px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  tab === t.id ? "bg-purple-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Dosing */}
          {tab === "dosing" && (
            <div className="space-y-2 pt-1">
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                <p className="text-xs font-bold text-blue-800 mb-1">Pediatric Dose</p>
                {typeof drug.pediatric_dose === "string" ? (
                  <p className="text-xs text-blue-700">{drug.pediatric_dose}</p>
                ) : (
                  Object.entries(drug.pediatric_dose || {}).map(([k, v]) => (
                    <p key={k} className="text-xs text-blue-700"><span className="font-semibold capitalize">{k}:</span> {v}</p>
                  ))
                )}
              </div>
              {drug.folic_acid && (
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-2">
                  <p className="text-xs text-amber-800"><span className="font-bold">Folic Acid:</span> {drug.folic_acid}</p>
                </div>
              )}
              {drug.bladder_protection && (
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-2">
                  <p className="text-xs text-amber-800"><span className="font-bold">Bladder Protection:</span> {drug.bladder_protection}</p>
                </div>
              )}
              {drug.fertility_preservation && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                  <p className="text-xs text-red-800 font-bold flex items-start gap-1">
                    <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                    Fertility: {drug.fertility_preservation}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Monitoring */}
          {tab === "monitoring" && (
            <div className="space-y-2 pt-1">
              {drug.monitoring && (
                <>
                  <div className="bg-teal-50 border border-teal-100 rounded-lg p-3">
                    <p className="text-xs font-bold text-teal-800 mb-1">Schedule</p>
                    <p className="text-xs text-teal-700">{drug.monitoring.schedule}</p>
                  </div>
                  <div className="bg-teal-50 border border-teal-100 rounded-lg p-3">
                    <p className="text-xs font-bold text-teal-800 mb-1">Targets</p>
                    <p className="text-xs text-teal-700">{drug.monitoring.targets}</p>
                  </div>
                </>
              )}
              {drug.tpmt_testing && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                  <p className="text-xs text-yellow-900"><span className="font-bold">TPMT Testing:</span> {drug.tpmt_testing}</p>
                </div>
              )}
            </div>
          )}

          {/* Safety */}
          {tab === "safety" && (
            <div className="space-y-2 pt-1">
              <div>
                <p className="text-xs font-bold text-slate-600 mb-1.5">Toxicities</p>
                {drug.toxicities?.map((t, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-xs text-red-800 bg-red-50 rounded p-1.5 mb-1 border border-red-100">
                    <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5 text-red-500" />{t}
                  </div>
                ))}
              </div>
              {drug.contraindications && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                  <p className="text-xs font-bold text-red-800 mb-1">Contraindications</p>
                  {Array.isArray(drug.contraindications)
                    ? drug.contraindications.map((c, i) => <p key={i} className="text-xs text-red-700">• {c}</p>)
                    : <p className="text-xs text-red-700">{drug.contraindications}</p>
                  }
                </div>
              )}
              {drug.renal_adjustment && (
                <div className="bg-orange-50 border border-orange-100 rounded-lg p-2">
                  <p className="text-xs font-bold text-orange-800 mb-1">Renal Adjustment</p>
                  <p className="text-xs text-orange-700">{drug.renal_adjustment}</p>
                </div>
              )}
              {drug.pregnancy && (
                <div className="bg-pink-50 border border-pink-100 rounded-lg p-2">
                  <p className="text-xs font-bold text-pink-800 mb-1">Pregnancy / Fertility</p>
                  <p className="text-xs text-pink-700">{drug.pregnancy}</p>
                </div>
              )}
              {drug.caution && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
                  <p className="text-xs text-amber-900"><span className="font-bold">⚠️ Caution:</span> {drug.caution}</p>
                </div>
              )}
              {drug.uveitis_note && (
                <div className="bg-teal-50 border border-teal-100 rounded-lg p-2">
                  <p className="text-xs text-teal-800"><span className="font-bold">👁 Uveitis:</span> {drug.uveitis_note}</p>
                </div>
              )}
            </div>
          )}

          {/* Vaccines */}
          {tab === "vaccines" && (
            <div className="space-y-2 pt-1">
              <div className={`rounded-lg p-3 border ${
                drug.live_vaccines?.includes("Avoid") ? "bg-red-50 border-red-200" : "bg-green-50 border-green-100"
              }`}>
                <p className="text-xs font-bold mb-1">💉 Live Vaccine Policy</p>
                <p className="text-xs">{drug.live_vaccines}</p>
              </div>
              {drug.tb_screening && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
                  <p className="text-xs font-bold text-amber-800 mb-1">TB Screening</p>
                  <p className="text-xs text-amber-700">{drug.tb_screening}</p>
                </div>
              )}
              {drug.hbv_screening && (
                <div className="bg-orange-50 border border-orange-100 rounded-lg p-2">
                  <p className="text-xs font-bold text-orange-800 mb-1">Hepatitis B Screening</p>
                  <p className="text-xs text-orange-700">{drug.hbv_screening}</p>
                </div>
              )}
              {drug.premedication && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-2">
                  <p className="text-xs font-bold text-blue-800 mb-1">Pre-medication (Infusion)</p>
                  <p className="text-xs text-blue-700">{drug.premedication}</p>
                </div>
              )}
              {drug.advantages && (
                <div className="bg-green-50 border border-green-100 rounded-lg p-2">
                  <p className="text-xs font-bold text-green-800 mb-1">✓ Advantages</p>
                  <p className="text-xs text-green-700">{drug.advantages}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function RheumDrugCards() {
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("All");

  const filtered = RHEUM_DRUGS.filter(d => {
    const q = search.toLowerCase();
    const text = [d.name, d.class, d.indications?.join(" ")].join(" ").toLowerCase();
    const classMatch = filterClass === "All" || d.class?.toLowerCase().includes(filterClass.toLowerCase());
    return classMatch && (!search || text.includes(q));
  });

  return (
    <div className="space-y-3">
      <Alert className="bg-purple-50 border-purple-200">
        <Pill className="w-4 h-4 text-purple-600" />
        <AlertDescription className="text-xs text-purple-900">
          <strong>Pediatric Rheumatology Drug Knowledge System</strong> — Dosing, monitoring, safety, vaccines, TB/HBV screening. Evidence: ACR/EULAR/PRINTO guidelines.
        </AlertDescription>
      </Alert>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search drugs, indications…"
          className="w-full pl-9 pr-8 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-3.5 h-3.5 text-slate-400" />
          </button>
        )}
      </div>

      {/* Class filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {["All", "DMARD", "Biologic", "TNFi", "IL-1 Inhibitor", "Immunosuppressant", "JAK inhibitor"].map(cls => (
          <button key={cls}
            onClick={() => setFilterClass(cls)}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
              filterClass === cls ? "bg-purple-600 text-white border-purple-600" : "bg-white text-slate-600 border-slate-200 hover:border-purple-300"
            }`}>
            {cls}
          </button>
        ))}
      </div>

      <p className="text-xs text-slate-400">{filtered.length} drugs</p>

      <div className="space-y-2.5">
        {filtered.map(drug => <DrugCard key={drug.id} drug={drug} />)}
        {filtered.length === 0 && (
          <p className="text-center py-8 text-slate-400 text-sm">No drugs found</p>
        )}
      </div>
    </div>
  );
}