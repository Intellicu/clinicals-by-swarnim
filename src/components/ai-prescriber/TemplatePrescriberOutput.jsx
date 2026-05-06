import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle, Pill, ClipboardList, Shield, Info, Trash2 } from "lucide-react";
import { calcTemplateDose, getRenalAdjustment } from "./DoseEngine";
import { PATHWAY_TEMPLATES } from "./PathwayTemplates";

const SEV_COLORS = {
  critical: "bg-red-100 border-red-400 text-red-900",
  warning: "bg-amber-100 border-amber-300 text-amber-900",
  info: "bg-blue-50 border-blue-200 text-blue-800",
};

const INTERACTION_RULES = [
  { a: "tacrolimus", b: "fluconazole", sev: "critical", msg: "Fluconazole↑ Tacrolimus levels (CYP3A4) — nephrotoxicity risk" },
  { a: "tacrolimus", b: "clarithromycin", sev: "critical", msg: "Clarithromycin↑ Tacrolimus — reduce dose, monitor levels" },
  { a: "enalapril", b: "losartan", sev: "high", msg: "Dual RAS blockade — hyperkalemia + AKI risk. Avoid." },
  { a: "furosemide", b: "gentamicin", sev: "high", msg: "Additive ototoxicity + nephrotoxicity" },
  { a: "cyclosporine", b: "atorvastatin", sev: "high", msg: "↑ Statin levels → myopathy/rhabdomyolysis" },
  { a: "prednisolone", b: "ibuprofen", sev: "moderate", msg: "↑ GI ulceration — add PPI" },
  { a: "mycophenolate", b: "antacids", sev: "moderate", msg: "Antacids reduce MMF absorption — separate by 2h" },
  { a: "rituximab", b: "live", sev: "critical", msg: "Live vaccines CONTRAINDICATED within 6 months of Rituximab" },
  { a: "cyclophosphamide", b: "allopurinol", sev: "high", msg: "↑ Cyclophosphamide myelosuppression" },
  { a: "cotrimoxazole", b: "methotrexate", sev: "high", msg: "Additive antifolate → severe myelosuppression" },
];

function checkInteractions(drugNames) {
  const lower = drugNames.map(n => n.toLowerCase());
  return INTERACTION_RULES.filter(r =>
    lower.some(n => n.includes(r.a)) && lower.some(n => n.includes(r.b))
  );
}

const SEV_ICON = { critical: "🔴", high: "🟠", moderate: "🟡", warning: "🟠", info: "ℹ️" };

export default function TemplatePrescriberOutput({ pathwayKey, weight, height, bsa, egfr, age, onDrugsChange }) {
  const template = PATHWAY_TEMPLATES[pathwayKey];
  const [activeDrugs, setActiveDrugs] = useState(() => template?.drugs?.map(d => ({ ...d, included: true, editedDose: "", editedFreq: "" })) || []);

  React.useEffect(() => {
    const included = activeDrugs.filter(d => d.included).map(d => d.name);
    if (onDrugsChange) onDrugsChange(included, activeDrugs.filter(d => d.included));
  }, [activeDrugs]);

  if (!template) return null;

  const wt = parseFloat(weight);
  const interactions = checkInteractions(activeDrugs.filter(d => d.included).map(d => d.name));

  const toggleDrug = (idx) => setActiveDrugs(prev => prev.map((d, i) => i === idx ? { ...d, included: !d.included } : d));

  return (
    <div className="space-y-4">
      {/* Template header */}
      <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-emerald-900">{template.label}</h3>
              <p className="text-xs text-emerald-700 mt-0.5">{template.reference}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Drug table */}
      <Card className="bg-white border border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-50 border-b py-3 px-5">
          <CardTitle className="text-sm flex items-center gap-2">
            <Pill className="w-4 h-4 text-purple-600" /> Drug Therapy Plan
            <Badge className="bg-purple-100 text-purple-700 text-xs ml-auto">{activeDrugs.filter(d => d.included).length} selected</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 space-y-2">
          {activeDrugs.map((drug, idx) => {
            const dose = calcTemplateDose(drug, wt, bsa, parseFloat(egfr));
            const renalFlag = drug.renal_adjust ? getRenalAdjustment(parseFloat(egfr), drug.name, drug.renal_adjust) : null;
            const catColors = {
              first_line: "bg-green-100 text-green-700",
              first_line_alt: "bg-teal-100 text-teal-700",
              emergency: "bg-red-100 text-red-700",
              emergency_iv: "bg-red-100 text-red-700",
              supportive: "bg-blue-100 text-blue-700",
              steroid_sparing: "bg-indigo-100 text-indigo-700",
              biologic: "bg-violet-100 text-violet-700",
              prophylaxis: "bg-slate-100 text-slate-700",
              combination: "bg-cyan-100 text-cyan-700",
              antihypertensive: "bg-orange-100 text-orange-700",
              maintenance: "bg-gray-100 text-gray-700",
            };

            return (
              <div key={idx} className={`rounded-xl border-2 p-3 transition-all ${drug.included ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50 opacity-60"}`}>
                <div className="flex items-start gap-2">
                  <input type="checkbox" checked={drug.included} onChange={() => toggleDrug(idx)}
                    className="mt-1 w-4 h-4 rounded accent-purple-600 cursor-pointer" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-bold text-sm text-slate-900">{drug.name}</span>
                      <Badge className={`text-xs ${catColors[drug.category] || "bg-slate-100 text-slate-600"}`}>
                        {drug.category?.replace(/_/g, " ")}
                      </Badge>
                      {drug.tdm && <Badge className="bg-blue-100 text-blue-700 text-xs">TDM</Badge>}
                      {drug.conditional && <Badge className="bg-amber-100 text-amber-700 text-xs">If: {drug.conditional}</Badge>}
                    </div>

                    {drug.included && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                        <div className="bg-purple-50 border border-purple-100 rounded-lg p-2 text-center">
                          <p className="text-xs text-slate-500 uppercase">Per Dose</p>
                          <p className="font-bold text-purple-800 text-sm">{dose.perDose}</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 rounded-lg p-2 text-center">
                          <p className="text-xs text-slate-500 uppercase">Frequency</p>
                          <p className="font-semibold text-slate-800 text-xs">{drug.frequency}</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 rounded-lg p-2 text-center">
                          <p className="text-xs text-slate-500 uppercase">Route</p>
                          <p className="font-semibold text-slate-800 text-xs">{drug.route}</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 rounded-lg p-2 text-center">
                          <p className="text-xs text-slate-500 uppercase">Duration</p>
                          <p className="font-semibold text-slate-800 text-xs leading-tight">{drug.duration}</p>
                        </div>
                      </div>
                    )}

                    {drug.included && (
                      <div className="mt-2 space-y-1">
                        {dose.note && <p className="text-xs text-slate-400 bg-slate-50 rounded px-2 py-1">{dose.note}</p>}
                        {dose.capped && <p className="text-xs font-semibold text-red-700">⚠️ Capped at max dose: {dose.capValue}</p>}
                        {dose.renalNote && <p className="text-xs font-semibold text-amber-700">🔶 {dose.renalNote}</p>}
                        {renalFlag && <p className={`text-xs font-semibold ${renalFlag.level === "critical" ? "text-red-700" : "text-amber-700"}`}>{SEV_ICON[renalFlag.level]} {renalFlag.msg}</p>}
                        {drug.monitoring && <p className="text-xs text-slate-500">📊 Monitor: {drug.monitoring}</p>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Interactions */}
      {interactions.length > 0 && (
        <Card className="bg-red-50 border-2 border-red-300">
          <CardHeader className="py-2 px-4 border-b border-red-200">
            <CardTitle className="text-xs text-red-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Drug Interactions in This Template
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 space-y-2">
            {interactions.map((ix, i) => (
              <div key={i} className={`rounded border p-2 text-xs ${SEV_COLORS[ix.sev] || SEV_COLORS.warning}`}>
                <strong>{SEV_ICON[ix.sev]} {ix.a} + {ix.b}:</strong> {ix.msg}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Monitoring */}
      <Card className="bg-white border border-slate-200">
        <CardHeader className="bg-slate-50 border-b py-3 px-5">
          <CardTitle className="text-sm flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-blue-600" /> Monitoring Checklist
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <ul className="space-y-1">
            {template.monitoring.map((m, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                {m}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Supportive + avoid */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-green-50 border border-green-200">
          <CardContent className="p-4">
            <p className="text-xs font-bold text-green-700 uppercase mb-2">Supportive Measures</p>
            <ul className="space-y-1">
              {template.supportive.map((s, i) => <li key={i} className="text-xs text-green-800">✓ {s}</li>)}
            </ul>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border border-red-200">
          <CardContent className="p-4">
            <p className="text-xs font-bold text-red-700 uppercase mb-2">Avoid / Contraindications</p>
            <ul className="space-y-1">
              {template.avoid.map((a, i) => <li key={i} className="text-xs text-red-800">✗ {a}</li>)}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Follow-up */}
      <Alert className="bg-indigo-50 border-indigo-200">
        <Info className="w-4 h-4 text-indigo-600" />
        <AlertDescription className="text-indigo-800 text-sm">
          <strong>Follow-up:</strong> {template.follow_up}
        </AlertDescription>
      </Alert>
    </div>
  );
}