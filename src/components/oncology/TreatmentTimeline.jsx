import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle2, Clock, Circle, ChevronRight, Plus, Trash2, AlertCircle, Activity } from "lucide-react";

const PROTOCOL_CYCLES = {
  "all-all": {
    phases: [
      { name: "Induction", weeks: 5, cycles: 1, color: "bg-blue-600", drugs: ["Prednisolone/Dex", "Vincristine", "PEG-ASNase", "DNR (HR/IR)", "IT MTX"] },
      { name: "Consolidation", weeks: 8, cycles: 1, color: "bg-indigo-600", drugs: ["6-MP", "MTX weekly", "IT MTX"] },
      { name: "Delayed Intensification", weeks: 8, cycles: 1, color: "bg-violet-600", drugs: ["Dexamethasone", "VCR", "Mitoxantrone", "CPM", "AraC", "6-TG"] },
      { name: "Maintenance", weeks: 104, cycles: 1, color: "bg-green-600", drugs: ["6-MP daily", "MTX weekly", "VCR/Dexa pulses", "IT MTX q3mo"] },
    ]
  },
  "all-aml": {
    phases: [
      { name: "Induction I (AIE)", weeks: 2, cycles: 1, color: "bg-rose-700", drugs: ["AraC CI", "Idarubicin", "Etoposide", "IT AraC"] },
      { name: "Induction II (HAM)", weeks: 2, cycles: 1, color: "bg-red-700", drugs: ["HD-AraC", "Mitoxantrone"] },
      { name: "Consolidation (HD-AraC)", weeks: 4, cycles: 2, color: "bg-orange-600", drugs: ["AraC 3g/m²", "Etoposide/Mitox"] },
    ]
  },
  "wilms": {
    phases: [
      { name: "Pre-op Chemo", weeks: 4, cycles: 1, color: "bg-teal-600", drugs: ["Actinomycin-D", "Vincristine weekly"] },
      { name: "Surgery (Week 5)", weeks: 1, cycles: 1, color: "bg-slate-600", drugs: ["Radical Nephrectomy + LN sampling"] },
      { name: "Post-op AV (Stage I/II SR)", weeks: 27, cycles: 9, color: "bg-teal-500", drugs: ["Actinomycin-D", "Vincristine"] },
      { name: "Post-op AVD (Stage III/IV)", weeks: 27, cycles: 9, color: "bg-teal-700", drugs: ["Actinomycin-D", "Vincristine", "Doxorubicin"] },
    ]
  },
  "neuroblastoma-hr": {
    phases: [
      { name: "COJEC Induction", weeks: 10, cycles: 10, color: "bg-orange-700", drugs: ["Carboplatin/Etop (A/C)", "Cisplatin/VCR (B)"] },
      { name: "Surgery", weeks: 2, cycles: 1, color: "bg-slate-600", drugs: ["Maximal safe resection"] },
      { name: "BuMel + AutoSCT", weeks: 6, cycles: 1, color: "bg-red-800", drugs: ["Busulfan", "Melphalan", "PBSCR"] },
      { name: "Radiotherapy", weeks: 3, cycles: 1, color: "bg-purple-700", drugs: ["Primary site 21 Gy"] },
      { name: "Isotretinoin Maintenance", weeks: 24, cycles: 6, color: "bg-amber-600", drugs: ["Isotretinoin 160 mg/m² × 14d"] },
    ]
  },
  "b-nhl": {
    phases: [
      { name: "COP Pre-phase", weeks: 1, cycles: 1, color: "bg-indigo-500", drugs: ["CPM", "VCR", "Pred", "IT"] },
      { name: "COPADM × 2", weeks: 6, cycles: 2, color: "bg-indigo-700", drugs: ["CPM", "VCR", "Pred", "Doxo", "MTX 3g/m²"] },
      { name: "CYM × 2", weeks: 6, cycles: 2, color: "bg-blue-700", drugs: ["AraC", "HD-MTX"] },
      { name: "Maintenance", weeks: 4, cycles: 1, color: "bg-green-700", drugs: ["6-MP", "MTX"] },
    ]
  },
  "medulloblastoma": {
    phases: [
      { name: "Surgery", weeks: 1, cycles: 1, color: "bg-slate-700", drugs: ["Posterior fossa resection"] },
      { name: "Craniospinal RT", weeks: 6, cycles: 1, color: "bg-purple-700", drugs: ["CSI 23.4 Gy + boost 54 Gy total", "VCR weekly radiosensitiser"] },
      { name: "Maintenance Cycle A", weeks: 6, cycles: 4, color: "bg-blue-700", drugs: ["Cisplatin 75 mg/m²", "CCNU 75 mg/m²", "VCR d1,8,15"] },
      { name: "Maintenance Cycle B", weeks: 6, cycles: 4, color: "bg-teal-700", drugs: ["Cyclophosphamide", "VCR d1,8"] },
    ]
  },
};

const STATUS_CONFIG = {
  completed: { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50 border-green-200", label: "Completed" },
  current: { icon: Activity, color: "text-blue-600", bg: "bg-blue-50 border-blue-300", label: "In Progress" },
  upcoming: { icon: Clock, color: "text-slate-400", bg: "bg-slate-50 border-slate-200", label: "Upcoming" },
  delayed: { icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50 border-amber-200", label: "Delayed" },
};

export default function TreatmentTimeline() {
  const [protocol, setProtocol] = useState("");
  const [patientName, setPatientName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [cycleStatuses, setCycleStatuses] = useState({});
  const [cycleNotes, setCycleNotes] = useState({});
  const [showNoteFor, setShowNoteFor] = useState(null);

  const phases = protocol ? (PROTOCOL_CYCLES[protocol]?.phases || []) : [];

  // Build flat cycle list from phases
  const allCycles = [];
  let weekOffset = 0;
  phases.forEach((phase, pi) => {
    const n = phase.cycles === 1 ? 1 : phase.cycles;
    for (let c = 0; c < n; c++) {
      const cycleKey = `${pi}-${c}`;
      const weeksEach = phase.cycles > 1 ? Math.round(phase.weeks / phase.cycles) : phase.weeks;
      const cycleStart = startDate ? addWeeks(new Date(startDate), weekOffset) : null;
      const cycleEnd = cycleStart ? addWeeks(cycleStart, weeksEach) : null;
      allCycles.push({
        key: cycleKey,
        phase: phase.name,
        color: phase.color,
        drugs: phase.drugs,
        cycleNum: phase.cycles > 1 ? c + 1 : null,
        totalCycles: phase.cycles > 1 ? phase.cycles : null,
        weekOffset,
        weeksEach,
        start: cycleStart,
        end: cycleEnd,
        status: cycleStatuses[cycleKey] || "upcoming",
      });
      weekOffset += weeksEach;
    }
  });

  function addWeeks(date, weeks) {
    const d = new Date(date);
    d.setDate(d.getDate() + weeks * 7);
    return d;
  }

  function fmtDate(d) {
    if (!d) return "—";
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  }

  function setStatus(key, status) {
    setCycleStatuses(prev => ({ ...prev, [key]: status }));
  }

  const totalWeeks = phases.reduce((s, p) => s + p.weeks, 0);
  const completedCount = Object.values(cycleStatuses).filter(s => s === "completed").length;
  const progress = allCycles.length > 0 ? Math.round((completedCount / allCycles.length) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 rounded-xl p-4 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Calendar className="w-5 h-5 text-blue-200" />
          <h2 className="font-bold text-base">Treatment Timeline Dashboard</h2>
        </div>
        <p className="text-xs text-blue-200">Visual cycle tracker — map past and upcoming treatment blocks</p>
      </div>

      {/* Setup panel */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
        <p className="text-xs font-bold text-slate-700">Patient & Protocol Setup</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-500 block mb-1">Patient Name / ID</label>
            <input className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="e.g. Patient X / MRN"
              value={patientName} onChange={e => setPatientName(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Treatment Start Date</label>
            <input type="date" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="text-xs text-slate-500 block mb-1">Protocol</label>
          <select className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
            value={protocol} onChange={e => setProtocol(e.target.value)}>
            <option value="">— Select protocol —</option>
            <option value="all-all">ALL (ICiCLe ALL-14 / BFM)</option>
            <option value="all-aml">AML (BFM/MRC)</option>
            <option value="wilms">Wilms Tumour (SIOP-RTSG)</option>
            <option value="neuroblastoma-hr">Neuroblastoma HR (HR-NBL-1)</option>
            <option value="b-nhl">Burkitt / B-NHL (FAB-LMB96)</option>
            <option value="medulloblastoma">Medulloblastoma (SIOP-E)</option>
          </select>
        </div>
      </div>

      {/* Progress summary */}
      {protocol && allCycles.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs font-bold text-slate-700">{patientName || "Patient"} — Protocol Progress</p>
              <p className="text-xs text-slate-500">Total duration: ~{totalWeeks} weeks · {allCycles.length} blocks</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-700">{progress}%</p>
              <p className="text-xs text-slate-500">{completedCount}/{allCycles.length} complete</p>
            </div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* Visual timeline */}
      {protocol && allCycles.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-600 px-1">Treatment Blocks — tap status to update</p>
          {allCycles.map((cycle, idx) => {
            const cfg = STATUS_CONFIG[cycle.status];
            const Icon = cfg.icon;
            return (
              <div key={cycle.key} className={`border-2 rounded-xl overflow-hidden ${cfg.bg}`}>
                <div className="flex items-start gap-3 p-3">
                  {/* Cycle indicator */}
                  <div className={`w-8 h-8 ${cycle.color} rounded-lg flex items-center justify-center flex-shrink-0 text-white text-xs font-bold`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-bold text-slate-900">
                        {cycle.phase}{cycle.cycleNum ? ` — Cycle ${cycle.cycleNum}/${cycle.totalCycles}` : ""}
                      </span>
                      <Badge className={`text-xs px-1.5 py-0 ${
                        cycle.status === "completed" ? "bg-green-600" :
                        cycle.status === "current" ? "bg-blue-600" :
                        cycle.status === "delayed" ? "bg-amber-600" : "bg-slate-400"
                      } text-white`}>{cfg.label}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mb-2">
                      {cycle.start && (
                        <span className="text-xs text-slate-600">
                          <span className="font-medium">From:</span> {fmtDate(cycle.start)}
                          {cycle.end && <span> → {fmtDate(cycle.end)}</span>}
                        </span>
                      )}
                      <span className="text-xs text-slate-500">~{cycle.weeksEach} week{cycle.weeksEach !== 1 ? "s" : ""}</span>
                    </div>
                    {/* Drugs */}
                    <div className="flex flex-wrap gap-1">
                      {cycle.drugs.map((d, di) => (
                        <span key={di} className="text-xs bg-white border border-slate-200 rounded px-1.5 py-0.5 text-slate-600">{d}</span>
                      ))}
                    </div>
                    {/* Notes */}
                    {cycleNotes[cycle.key] && (
                      <p className="text-xs text-slate-600 mt-1.5 bg-white/80 rounded px-2 py-1 border border-slate-200 italic">
                        📝 {cycleNotes[cycle.key]}
                      </p>
                    )}
                  </div>
                  {/* Status controls */}
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    {["completed", "current", "delayed", "upcoming"].map(s => (
                      <button key={s} onClick={() => setStatus(cycle.key, s)}
                        className={`text-xs px-2 py-0.5 rounded font-medium transition-colors ${
                          cycle.status === s
                            ? s === "completed" ? "bg-green-600 text-white"
                            : s === "current" ? "bg-blue-600 text-white"
                            : s === "delayed" ? "bg-amber-600 text-white"
                            : "bg-slate-600 text-white"
                            : "bg-white border border-slate-200 text-slate-500 hover:border-slate-400"
                        }`}>
                        {s === "completed" ? "✓ Done" : s === "current" ? "⏵ Active" : s === "delayed" ? "⚠ Delayed" : "○ Upcoming"}
                      </button>
                    ))}
                    <button onClick={() => setShowNoteFor(showNoteFor === cycle.key ? null : cycle.key)}
                      className="text-xs px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-500 hover:border-blue-300">
                      📝 Note
                    </button>
                  </div>
                </div>
                {showNoteFor === cycle.key && (
                  <div className="border-t border-slate-200 px-3 pb-3 pt-2">
                    <textarea rows={2} placeholder="Add clinical note (delays, toxicities, dose modifications...)"
                      className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                      value={cycleNotes[cycle.key] || ""}
                      onChange={e => setCycleNotes(prev => ({ ...prev, [cycle.key]: e.target.value }))} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!protocol && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">Select a protocol above to generate the treatment timeline</p>
        </div>
      )}
    </div>
  );
}