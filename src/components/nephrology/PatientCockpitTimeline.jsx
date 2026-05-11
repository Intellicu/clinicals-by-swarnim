import React, { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  User, Plus, Trash2, FileDown, Activity, Droplet, Brain,
  Microscope, Heart, TestTube, AlertTriangle, CheckCircle,
  Calendar, ChevronDown, ChevronUp, Printer
} from "lucide-react";

const MODULE_OPTIONS = [
  { id: "uti", label: "UTI", color: "bg-red-100 text-red-800 border-red-200", icon: Microscope },
  { id: "bbd", label: "BBD / Bladder", color: "bg-orange-100 text-orange-800 border-orange-200", icon: Activity },
  { id: "ckd", label: "CKD", color: "bg-blue-100 text-blue-800 border-blue-200", icon: Droplet },
  { id: "nephrotic", label: "Nephrotic Syndrome", color: "bg-purple-100 text-purple-800 border-purple-200", icon: Heart },
  { id: "htn", label: "Hypertension", color: "bg-rose-100 text-rose-800 border-rose-200", icon: Activity },
  { id: "aki", label: "AKI", color: "bg-amber-100 text-amber-800 border-amber-200", icon: AlertTriangle },
  { id: "tubular", label: "Tubular Disorder", color: "bg-teal-100 text-teal-800 border-teal-200", icon: TestTube },
  { id: "cakut", label: "CAKUT / Urology", color: "bg-indigo-100 text-indigo-800 border-indigo-200", icon: Brain },
  { id: "gn", label: "Glomerulonephritis", color: "bg-pink-100 text-pink-800 border-pink-200", icon: Microscope },
  { id: "transplant", label: "Transplant", color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle },
  { id: "dialysis", label: "Dialysis", color: "bg-slate-100 text-slate-800 border-slate-200", icon: Activity },
  { id: "other", label: "Other / General", color: "bg-gray-100 text-gray-800 border-gray-200", icon: User },
];

const STATUS_OPTIONS = ["Active", "Resolved", "Monitoring", "Escalated", "Stable"];

const EMPTY_ENTRY = () => ({
  id: Date.now(),
  date: new Date().toISOString().split("T")[0],
  module: "ckd",
  title: "",
  summary: "",
  vitals: { weight: "", bp: "", egfr: "", upcr: "", urine_output: "" },
  medications: "",
  plan: "",
  red_flags: "",
  status: "Active",
  follow_up: "",
});

function ModuleTag({ moduleId }) {
  const mod = MODULE_OPTIONS.find(m => m.id === moduleId) || MODULE_OPTIONS[MODULE_OPTIONS.length - 1];
  const Icon = mod.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${mod.color}`}>
      <Icon className="w-3 h-3" /> {mod.label}
    </span>
  );
}

function TimelineEntry({ entry, onUpdate, onDelete, index }) {
  const [open, setOpen] = useState(index === 0);

  const update = (field, val) => onUpdate({ ...entry, [field]: val });
  const updateVital = (k, v) => onUpdate({ ...entry, vitals: { ...entry.vitals, [k]: v } });

  const statusColor = {
    Active: "bg-blue-100 text-blue-700",
    Resolved: "bg-green-100 text-green-700",
    Monitoring: "bg-amber-100 text-amber-700",
    Escalated: "bg-red-100 text-red-700",
    Stable: "bg-teal-100 text-teal-700",
  }[entry.status] || "bg-slate-100 text-slate-600";

  return (
    <div className="relative pl-6 pb-2">
      {/* Timeline line */}
      <div className="absolute left-2.5 top-4 bottom-0 w-0.5 bg-slate-200" />
      <div className="absolute left-1 top-3.5 w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow" />

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-0">
          <button
            className="w-full flex items-center justify-between p-3 text-left"
            onClick={() => setOpen(v => !v)}
          >
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <span className="text-xs text-slate-500 font-mono flex-shrink-0 flex items-center gap-1">
                <Calendar className="w-3 h-3" />{entry.date}
              </span>
              <ModuleTag moduleId={entry.module} />
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor}`}>{entry.status}</span>
              {entry.title && <span className="text-xs font-semibold text-slate-700 truncate">{entry.title}</span>}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={e => { e.stopPropagation(); onDelete(entry.id); }}
                className="p-1 hover:bg-red-50 rounded text-red-400 hover:text-red-600"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </div>
          </button>

          {open && (
            <div className="px-3 pb-3 space-y-3 border-t border-slate-100">
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500">Date</label>
                  <input type="date" className="mt-0.5 w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg bg-white" value={entry.date} onChange={e => update("date", e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Module</label>
                  <select className="mt-0.5 w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg bg-white" value={entry.module} onChange={e => update("module", e.target.value)}>
                    {MODULE_OPTIONS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Status</label>
                  <select className="mt-0.5 w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg bg-white" value={entry.status} onChange={e => update("status", e.target.value)}>
                    {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Visit Title</label>
                  <input className="mt-0.5 w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg bg-white" value={entry.title} onChange={e => update("title", e.target.value)} placeholder="e.g. Follow-up visit 2" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500">Clinical Summary</label>
                <textarea className="mt-0.5 w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg bg-white resize-none" rows={3} value={entry.summary} onChange={e => update("summary", e.target.value)} placeholder="Key clinical findings, symptoms, exam..." />
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">Vitals / Key Parameters</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { k: "weight", label: "Weight (kg)" },
                    { k: "bp", label: "BP (mmHg)" },
                    { k: "egfr", label: "eGFR/creatinine" },
                    { k: "upcr", label: "UPCR (mg/mg)" },
                    { k: "urine_output", label: "Urine output/PVR" },
                  ].map(({ k, label }) => (
                    <div key={k}>
                      <label className="text-xs text-slate-400">{label}</label>
                      <input className="mt-0.5 w-full px-2 py-1 text-xs border border-slate-200 rounded-lg bg-white" value={entry.vitals[k]} onChange={e => updateVital(k, e.target.value)} />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500">Current Medications</label>
                <textarea className="mt-0.5 w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg bg-white resize-none" rows={2} value={entry.medications} onChange={e => update("medications", e.target.value)} placeholder="Prednisolone 30mg/m² OD, Tacrolimus 0.1mg/kg BID..." />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500">Plan / Next Steps</label>
                <textarea className="mt-0.5 w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg bg-white resize-none" rows={2} value={entry.plan} onChange={e => update("plan", e.target.value)} placeholder="Continue CIC every 3h, repeat USS in 3 months..." />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-red-500">Red Flags / Alerts</label>
                  <textarea className="mt-0.5 w-full px-2 py-1.5 text-xs border border-red-200 bg-red-50 rounded-lg resize-none" rows={2} value={entry.red_flags} onChange={e => update("red_flags", e.target.value)} placeholder="Rising creatinine, febrile..." />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Follow-up Date</label>
                  <input type="date" className="mt-0.5 w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg bg-white" value={entry.follow_up} onChange={e => update("follow_up", e.target.value)} />
                  <label className="text-xs font-semibold text-slate-500 mt-2 block">Follow-up Plan</label>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function generatePDFHtml(patient, entries) {
  const sorted = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));
  const moduleLabel = (id) => MODULE_OPTIONS.find(m => m.id === id)?.label || id;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>Patient Clinical Summary — ${patient.name}</title>
<style>
  body { font-family: Arial, sans-serif; font-size: 12px; color: #1e293b; margin: 20px; }
  h1 { font-size: 18px; color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 6px; }
  h2 { font-size: 13px; color: #1d4ed8; margin-top: 18px; margin-bottom: 6px; }
  .meta { display: flex; gap: 24px; background: #f1f5f9; padding: 8px 12px; border-radius: 6px; margin-bottom: 16px; }
  .meta-item { font-size: 11px; }
  .meta-item strong { display: block; color: #64748b; }
  .entry { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 12px; page-break-inside: avoid; }
  .entry-header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
  .tag { background: #dbeafe; color: #1d4ed8; padding: 2px 8px; border-radius: 20px; font-size: 10px; font-weight: 600; }
  .date { font-size: 11px; color: #64748b; font-family: monospace; }
  .status { padding: 2px 8px; border-radius: 20px; font-size: 10px; font-weight: 600; }
  .status-Active { background: #dbeafe; color: #1d4ed8; }
  .status-Resolved { background: #dcfce7; color: #166534; }
  .status-Escalated { background: #fee2e2; color: #991b1b; }
  .status-Monitoring { background: #fef3c7; color: #92400e; }
  .status-Stable { background: #ccfbf1; color: #0f766e; }
  .label { font-weight: 700; color: #475569; font-size: 11px; }
  .vitals-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin: 6px 0; }
  .vital-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 4px 8px; }
  .vital-box strong { display: block; font-size: 10px; color: #64748b; }
  .red { background: #fef2f2; border: 1px solid #fecaca; border-radius: 4px; padding: 6px 8px; color: #991b1b; }
  .footer { margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 10px; font-size: 10px; color: #94a3b8; text-align: center; }
</style>
</head>
<body>
<h1>Pediatric Nephrology & Urology — Patient Clinical Summary</h1>
<div class="meta">
  <div class="meta-item"><strong>Patient</strong>${patient.name || "—"}</div>
  <div class="meta-item"><strong>ID / MRN</strong>${patient.mrn || "—"}</div>
  <div class="meta-item"><strong>Age</strong>${patient.age || "—"}</div>
  <div class="meta-item"><strong>Diagnosis</strong>${patient.diagnosis || "—"}</div>
  <div class="meta-item"><strong>Clinician</strong>${patient.clinician || "—"}</div>
  <div class="meta-item"><strong>Report Date</strong>${new Date().toLocaleDateString("en-IN")}</div>
</div>
${sorted.map(e => `
<div class="entry">
  <div class="entry-header">
    <span class="date">📅 ${e.date}</span>
    <span class="tag">${moduleLabel(e.module)}</span>
    <span class="status status-${e.status}">${e.status}</span>
    ${e.title ? `<strong>${e.title}</strong>` : ""}
  </div>
  ${e.summary ? `<p><span class="label">Clinical Summary:</span> ${e.summary}</p>` : ""}
  ${Object.values(e.vitals).some(v => v) ? `
  <div class="vitals-grid">
    ${e.vitals.weight ? `<div class="vital-box"><strong>Weight</strong>${e.vitals.weight} kg</div>` : ""}
    ${e.vitals.bp ? `<div class="vital-box"><strong>BP</strong>${e.vitals.bp} mmHg</div>` : ""}
    ${e.vitals.egfr ? `<div class="vital-box"><strong>eGFR / Cr</strong>${e.vitals.egfr}</div>` : ""}
    ${e.vitals.upcr ? `<div class="vital-box"><strong>UPCR</strong>${e.vitals.upcr}</div>` : ""}
    ${e.vitals.urine_output ? `<div class="vital-box"><strong>UO / PVR</strong>${e.vitals.urine_output}</div>` : ""}
  </div>` : ""}
  ${e.medications ? `<p><span class="label">Medications:</span> ${e.medications}</p>` : ""}
  ${e.plan ? `<p><span class="label">Plan / Next Steps:</span> ${e.plan}</p>` : ""}
  ${e.red_flags ? `<div class="red"><span class="label">⚠ Red Flags:</span> ${e.red_flags}</div>` : ""}
  ${e.follow_up ? `<p><span class="label">Follow-up:</span> ${e.follow_up}</p>` : ""}
</div>`).join("")}
<div class="footer">
  Generated by CliniCals Hub — Pediatric Nephrology & Urology Intelligence Platform · ${new Date().toLocaleString("en-IN")}<br/>
  For clinical review only. Not a substitute for direct clinical assessment.
</div>
</body>
</html>`;
}

export default function PatientCockpitTimeline() {
  const [patient, setPatient] = useState({ name: "", mrn: "", age: "", diagnosis: "", clinician: "" });
  const [entries, setEntries] = useState([EMPTY_ENTRY()]);
  const updatePatient = (k, v) => setPatient(prev => ({ ...prev, [k]: v }));

  const addEntry = () => setEntries(prev => [EMPTY_ENTRY(), ...prev]);

  const updateEntry = (updated) => setEntries(prev => prev.map(e => e.id === updated.id ? updated : e));

  const deleteEntry = (id) => setEntries(prev => prev.filter(e => e.id !== id));

  const exportPDF = () => {
    const html = generatePDFHtml(patient, entries);
    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 600);
  };

  const sortedEntries = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 p-5 text-white">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <User className="w-7 h-7" />
            <div>
              <h2 className="text-xl font-bold">Patient Cockpit — Clinical Timeline</h2>
              <p className="text-blue-100 text-sm">Multi-module monitoring · Chronological timeline · PDF export</p>
            </div>
          </div>
          <Button
            onClick={exportPDF}
            className="bg-white text-blue-700 hover:bg-blue-50 font-semibold text-xs flex items-center gap-1.5 px-3"
            size="sm"
          >
            <Printer className="w-4 h-4" /> Export PDF
          </Button>
        </div>
      </div>

      {/* Patient details */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <p className="text-xs font-bold text-blue-700 mb-2 flex items-center gap-1"><User className="w-3.5 h-3.5" /> Patient Details</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { k: "name", label: "Patient Name" },
              { k: "mrn", label: "MRN / ID" },
              { k: "age", label: "Age / DOB" },
              { k: "diagnosis", label: "Primary Diagnosis" },
              { k: "clinician", label: "Clinician" },
            ].map(({ k, label }) => (
              <div key={k}>
                <label className="text-xs text-slate-500 font-semibold">{label}</label>
                <input
                  className="mt-0.5 w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                  value={patient[k]}
                  onChange={e => updatePatient(k, e.target.value)}
                  placeholder={label}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Module summary chips */}
      <div className="flex flex-wrap gap-1.5">
        {MODULE_OPTIONS.filter(m => entries.some(e => e.module === m.id)).map(m => {
          const count = entries.filter(e => e.module === m.id).length;
          return (
            <span key={m.id} className={`text-xs px-2 py-0.5 rounded-full font-medium border ${m.color}`}>
              {m.label} ({count})
            </span>
          );
        })}
      </div>

      {/* Add entry button */}
      <Button
        onClick={addEntry}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        size="sm"
      >
        <Plus className="w-4 h-4 mr-1" /> Add Timeline Entry
      </Button>

      {/* Timeline */}
      <div className="space-y-0">
        {sortedEntries.map((entry, i) => (
          <TimelineEntry
            key={entry.id}
            entry={entry}
            onUpdate={updateEntry}
            onDelete={deleteEntry}
            index={i}
          />
        ))}
      </div>

      {entries.length === 0 && (
        <Card className="border-dashed border-slate-300">
          <CardContent className="p-8 text-center">
            <User className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">No entries yet. Click "Add Timeline Entry" to start.</p>
          </CardContent>
        </Card>
      )}

      {/* Export button bottom */}
      {entries.length > 0 && (
        <Button onClick={exportPDF} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
          <FileDown className="w-4 h-4 mr-2" /> Export Full Clinical Summary as PDF
        </Button>
      )}
    </div>
  );
}