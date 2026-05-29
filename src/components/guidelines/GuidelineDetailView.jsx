import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChevronDown, ChevronUp, AlertTriangle, Lightbulb, Pill,
  CheckCircle, ExternalLink, BookOpen, Clock,
  Zap, Shield, TrendingUp, Utensils, Target, FlaskConical,
  Smartphone, BookOpenCheck, Activity
} from "lucide-react";
import ReferencesPanel from "./ReferencesPanel";
import AlgorithmFlowchart from "./AlgorithmFlowchart";

// ═══════════════════════════════════════════════════════════════
// SHARED HELPERS
// ═══════════════════════════════════════════════════════════════

function AccSection({ title, icon: Icon, color = "blue", children, defaultOpen = false, badge }) {
  const [open, setOpen] = useState(defaultOpen);
  const palettes = {
    red:    "bg-red-50 border-red-200 text-red-800",
    orange: "bg-orange-50 border-orange-200 text-orange-800",
    blue:   "bg-blue-50 border-blue-200 text-blue-800",
    green:  "bg-green-50 border-green-200 text-green-800",
    purple: "bg-purple-50 border-purple-200 text-purple-800",
    amber:  "bg-amber-50 border-amber-200 text-amber-800",
    teal:   "bg-teal-50 border-teal-200 text-teal-800",
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-800",
  };
  const cls = palettes[color] || palettes.blue;
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden mb-2">
      <button
        className={`w-full flex items-center justify-between p-3 font-semibold text-xs sm:text-sm ${cls}`}
        onClick={() => setOpen(!open)}
      >
        <span className="flex items-center gap-2 flex-1 min-w-0 text-left">
          {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
          <span className="leading-tight">{title}</span>
          {badge && <Badge className="ml-1 text-xs bg-white/60 border-0 px-1.5">{badge}</Badge>}
        </span>
        {open ? <ChevronUp className="w-4 h-4 flex-shrink-0 ml-2" /> : <ChevronDown className="w-4 h-4 flex-shrink-0 ml-2" />}
      </button>
      {open && <div className="p-3 bg-white">{children}</div>}
    </div>
  );
}

function DrugCard({ drug, detailed = false }) {
  const [open, setOpen] = useState(detailed);
  return (
    <div className={`border-l-4 border-blue-400 bg-blue-50 rounded-r-xl p-2.5 mb-2 ${detailed ? "border-l-[6px]" : ""}`}>
      <button className="w-full flex items-start justify-between gap-2 text-left" onClick={() => setOpen(!open)}>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
            <span className={`font-semibold text-blue-900 ${detailed ? "text-base" : "text-sm"}`}>{drug.name}</span>
            {drug.purpose && (
              <Badge className={`bg-blue-100 text-blue-700 border-0 font-normal leading-tight ${detailed ? "text-xs" : "text-xs"}`}>
                {drug.purpose}
              </Badge>
            )}
          </div>
          <p className={`text-blue-700 leading-relaxed ${detailed ? "text-sm" : "text-xs"}`}>{drug.dose}</p>
        </div>
        <span className="flex-shrink-0 text-blue-400 mt-0.5">
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </span>
      </button>
      {open && (
        <div className={`mt-2 pt-2 border-t border-blue-200 space-y-2 ${detailed ? "" : "space-y-1.5"}`}>
          {drug.max && (
            <p className={detailed ? "text-sm" : "text-xs"}>
              <span className="font-semibold text-slate-600">Max dose: </span>
              <span className="text-red-700 font-semibold">{drug.max}</span>
            </p>
          )}
          {drug.renal_adjust && (
            <p className={detailed ? "text-sm" : "text-xs"}>
              <span className="font-semibold text-slate-600">Renal adjustment: </span>
              <span className="text-orange-700">{drug.renal_adjust}</span>
            </p>
          )}
          {drug.monitoring && (
            <p className={detailed ? "text-sm" : "text-xs"}>
              <span className="font-semibold text-slate-600">Monitoring: </span>
              <span className="text-slate-700">{drug.monitoring}</span>
            </p>
          )}
          {drug.notes && (
            <div className={`p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 flex items-start gap-1.5 ${detailed ? "text-sm" : "text-xs"}`}>
              <Lightbulb className={`text-amber-500 flex-shrink-0 mt-0.5 ${detailed ? "w-4 h-4" : "w-3 h-3"}`} />
              <span className="leading-relaxed">{drug.notes}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// QUICK VIEW — compact accordion bedside mode
// ═══════════════════════════════════════════════════════════════

function QuickView({ guideline }) {
  const s = guideline.sections;
  if (!s) return <DBQuickView guideline={guideline} />;

  const qs = s.quick_summary || {};
  const classData = s.staging?.kdigo || s.staging?.ckd || s.classification || [];

  return (
    <div className="space-y-2 w-full overflow-hidden">
      {qs.epidemiology && (
        <div className="flex gap-1.5 flex-wrap">
          <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full border border-slate-200 leading-relaxed">
            📊 {qs.epidemiology.slice(0, 110)}{qs.epidemiology.length > 110 ? "…" : ""}
          </span>
        </div>
      )}

      {(qs.definition || qs.emergency_recognition?.length || qs.immediate_management?.length) && (
        <div className="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-3">
          <div className="flex items-center gap-2 mb-2.5">
            <Zap className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span className="font-bold text-blue-800 text-sm">Quick Clinical Summary</span>
          </div>
          {qs.definition && (
            <div className="mb-2.5 p-2 bg-white rounded-lg border border-blue-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-0.5">Definition</p>
              <p className="text-sm text-slate-800 leading-relaxed">{qs.definition}</p>
            </div>
          )}
          {qs.emergency_recognition?.length > 0 && (
            <div className="mb-2.5">
              <p className="text-xs font-bold text-red-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Emergency Recognition
              </p>
              <ul className="space-y-1">
                {qs.emergency_recognition.map((item, i) => (
                  <li key={i} className="text-xs text-red-900 flex items-start gap-1.5">
                    <span className="text-red-400 flex-shrink-0 mt-0.5">●</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {qs.immediate_management?.length > 0 && (
            <div>
              <p className="text-xs font-bold text-green-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Immediate Management
              </p>
              <ol className="space-y-1">
                {qs.immediate_management.map((item, i) => (
                  <li key={i} className="text-xs text-green-900 flex items-start gap-1.5">
                    <span className="font-bold text-green-600 flex-shrink-0 w-4">{i + 1}.</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}

      {classData.length > 0 && (
        <AccSection title="Staging / Classification" icon={TrendingUp} color="indigo" defaultOpen>
          <div className="space-y-2">
            {classData.map((item, i) => (
              <div key={i} className="p-2 bg-indigo-50 rounded-lg border border-indigo-100">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <Badge className="bg-indigo-600 text-white text-xs flex-shrink-0">
                    {item.stage || item.type || item.modality || `#${i + 1}`}
                  </Badge>
                  {(item.scr || item.gfr || item.bp || item.definition) && (
                    <span className="text-xs font-medium text-slate-700">{item.scr || item.gfr || item.bp || item.definition}</span>
                  )}
                  {item.uo && <Badge variant="outline" className="text-xs">{item.uo}</Badge>}
                  {item.description && <span className="text-xs text-slate-500">{item.description}</span>}
                </div>
                {(item.action || item.management) && (
                  <p className="text-xs text-slate-600 leading-relaxed">{item.action || item.management}</p>
                )}
              </div>
            ))}
          </div>
        </AccSection>
      )}

      {s.management && Object.keys(s.management).length > 0 && (
        <AccSection title="Stepwise Management Algorithm" icon={Target} color="green">
          <ManagementContent management={s.management} textSize="xs" />
        </AccSection>
      )}

      {s.drugs?.length > 0 && (
        <AccSection title="Drug Dosing & Monitoring" icon={Pill} color="blue" badge={`${s.drugs.length} drugs`}>
          {s.drugs.map((drug, i) => <DrugCard key={i} drug={drug} />)}
        </AccSection>
      )}

      {s.monitoring && (
        <AccSection title="Monitoring Schedule" icon={Clock} color="teal">
          <MonitoringContent monitoring={s.monitoring} textSize="xs" />
        </AccSection>
      )}

      {s.nutrition?.length > 0 && (
        <AccSection title="Nutrition Guidance" icon={Utensils} color="orange">
          <ul className="space-y-1.5">
            {s.nutrition.map((item, i) => (
              <li key={i} className="text-xs text-slate-700 flex items-start gap-1.5">
                <span className="text-orange-500 flex-shrink-0 mt-0.5">●</span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </AccSection>
      )}

      {s.vaccination?.length > 0 && (
        <AccSection title="Vaccination Guidance" icon={Shield} color="purple">
          <ul className="space-y-1.5">
            {s.vaccination.map((v, i) => (
              <li key={i} className="text-xs text-slate-700 flex items-start gap-1.5">
                <Shield className="w-3 h-3 text-purple-500 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{v}</span>
              </li>
            ))}
          </ul>
        </AccSection>
      )}

      {s.red_flags?.length > 0 && (
        <AccSection title="Red Flags & Escalation" icon={AlertTriangle} color="red">
          <ul className="space-y-1.5">
            {s.red_flags.map((flag, i) => (
              <li key={i} className="text-xs text-red-900 flex items-start gap-1.5 p-2 bg-red-50 rounded-lg border border-red-100">
                <AlertTriangle className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{flag}</span>
              </li>
            ))}
          </ul>
        </AccSection>
      )}

      {s.pearls?.length > 0 && (
        <AccSection title="Clinical Pearls & Viva Points" icon={Lightbulb} color="amber">
          <ul className="space-y-2">
            {s.pearls.map((pearl, i) => (
              <li key={i} className="text-xs text-amber-900 flex items-start gap-2 p-2 bg-amber-50 rounded-lg border border-amber-200">
                <span className="text-amber-500 font-bold flex-shrink-0">★</span>
                <span className="leading-relaxed">{pearl}</span>
              </li>
            ))}
          </ul>
        </AccSection>
      )}

      <EvidenceFooter guideline={guideline} />
      <AccSection title="References & Citations" icon={BookOpen} color="indigo">
        <ReferencesPanel guideline={guideline} compact />
      </AccSection>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DETAILED VIEW — handbook chapter style, fully expanded
// ═══════════════════════════════════════════════════════════════

function DetailedView({ guideline }) {
  const s = guideline.sections;
  if (!s) return <DBDetailedView guideline={guideline} />;

  const qs = s.quick_summary || {};
  const classData = s.staging?.kdigo || s.staging?.ckd || s.classification || [];

  return (
    <div className="space-y-5 w-full overflow-x-hidden">

      {/* Epidemiology & Pathophysiology block */}
      {(qs.epidemiology || qs.pathophysiology || qs.age_specific) && (
        <Card className="border-2 border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 py-3 px-4">
            <CardTitle className="text-base font-bold text-slate-700 flex items-center gap-2">
              <Activity className="w-4 h-4 text-slate-500" /> Background & Context
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {qs.definition && (
              <div className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-1">Definition</p>
                <p className="text-sm text-slate-800 leading-relaxed">{qs.definition}</p>
              </div>
            )}
            {qs.epidemiology && (
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Epidemiology</p>
                <p className="text-sm text-slate-700 leading-relaxed">{qs.epidemiology}</p>
              </div>
            )}
            {qs.pathophysiology && (
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Pathophysiology</p>
                <p className="text-sm text-slate-700 leading-relaxed">{qs.pathophysiology}</p>
              </div>
            )}
            {qs.age_specific && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-xs font-bold text-purple-700 uppercase tracking-wide mb-1">Age-Specific Considerations</p>
                <p className="text-sm text-slate-700 leading-relaxed">{qs.age_specific}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Emergency Recognition */}
      {qs.emergency_recognition?.length > 0 && (
        <Card className="border-2 border-red-300 shadow-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-200 py-3 px-4">
            <CardTitle className="text-base font-bold text-red-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" /> Emergency Recognition & Red Flags
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2">
              {qs.emergency_recognition.map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                  <div className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">{i + 1}</div>
                  <p className="text-sm text-red-900 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Immediate Management */}
      {qs.immediate_management?.length > 0 && (
        <Card className="border-2 border-green-300 shadow-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200 py-3 px-4">
            <CardTitle className="text-base font-bold text-green-800 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" /> Immediate Management Steps
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <ol className="space-y-2.5">
              {qs.immediate_management.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">{i + 1}</div>
                  <p className="text-sm text-slate-800 leading-relaxed pt-0.5">{item}</p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      {/* Staging / Classification */}
      {classData.length > 0 && (
        <Card className="border-2 border-indigo-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-indigo-200 py-3 px-4">
            <CardTitle className="text-base font-bold text-indigo-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" /> Staging & Classification
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-sm border-collapse min-w-0">
                <thead>
                  <tr className="bg-indigo-100">
                    <th className="text-left p-2 text-xs font-bold text-indigo-800 border border-indigo-200 w-20">Stage/Type</th>
                    <th className="text-left p-2 text-xs font-bold text-indigo-800 border border-indigo-200">Criteria / Definition</th>
                    <th className="text-left p-2 text-xs font-bold text-indigo-800 border border-indigo-200">Action / Management</th>
                  </tr>
                </thead>
                <tbody>
                  {classData.map((item, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-indigo-50/40"}>
                      <td className="p-2 border border-indigo-100 align-top">
                        <Badge className="bg-indigo-600 text-white text-xs whitespace-nowrap">
                          {item.stage || item.type || item.modality || `#${i + 1}`}
                        </Badge>
                        {item.description && <p className="text-xs text-slate-500 mt-1">{item.description}</p>}
                      </td>
                      <td className="p-2 border border-indigo-100 text-xs text-slate-700 align-top leading-relaxed">
                        {item.scr || item.gfr || item.bp || item.definition || "—"}
                        {item.uo && <p className="mt-1 text-slate-500">UO: {item.uo}</p>}
                      </td>
                      <td className="p-2 border border-indigo-100 text-xs text-slate-700 align-top leading-relaxed">
                        {item.action || item.management || item.advantages || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stepwise Management — fully expanded subsections */}
      {s.management && Object.keys(s.management).length > 0 && (
        <Card className="border-2 border-green-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200 py-3 px-4">
            <CardTitle className="text-base font-bold text-green-800 flex items-center gap-2">
              <Target className="w-4 h-4 text-green-600" /> Management Algorithm
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <ManagementContent management={s.management} textSize="sm" expanded />
          </CardContent>
        </Card>
      )}

      {/* Drug Dosing — all expanded */}
      {s.drugs?.length > 0 && (
        <Card className="border-2 border-blue-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 py-3 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-blue-800 flex items-center gap-2">
                <Pill className="w-4 h-4 text-blue-600" /> Drug Dosing, Monitoring & Renal Adjustment
              </CardTitle>
              <Badge className="bg-blue-600 text-white text-xs">{s.drugs.length} drugs</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {s.drugs.map((drug, i) => <DrugCard key={i} drug={drug} detailed />)}
          </CardContent>
        </Card>
      )}

      {/* Monitoring */}
      {s.monitoring && (
        <Card className="border-2 border-teal-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 border-b border-teal-200 py-3 px-4">
            <CardTitle className="text-base font-bold text-teal-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600" /> Monitoring Schedule & Follow-Up
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <MonitoringContent monitoring={s.monitoring} textSize="sm" expanded />
          </CardContent>
        </Card>
      )}

      {/* Nutrition */}
      {s.nutrition?.length > 0 && (
        <Card className="border-2 border-orange-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-200 py-3 px-4">
            <CardTitle className="text-base font-bold text-orange-800 flex items-center gap-2">
              <Utensils className="w-4 h-4 text-orange-600" /> Nutrition Guidance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <ul className="space-y-2.5">
              {s.nutrition.map((item, i) => (
                <li key={i} className="text-sm text-slate-700 flex items-start gap-2.5">
                  <span className="w-5 h-5 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Vaccination */}
      {s.vaccination?.length > 0 && (
        <Card className="border-2 border-purple-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b border-purple-200 py-3 px-4">
            <CardTitle className="text-base font-bold text-purple-800 flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-600" /> Vaccination Guidance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <ul className="space-y-2.5">
              {s.vaccination.map((v, i) => (
                <li key={i} className="text-sm text-slate-700 flex items-start gap-2.5 p-2.5 bg-purple-50 rounded-lg border border-purple-100">
                  <Shield className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{v}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Red Flags */}
      {s.red_flags?.length > 0 && (
        <Card className="border-2 border-red-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-200 py-3 px-4">
            <CardTitle className="text-base font-bold text-red-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" /> Red Flags & Escalation Triggers
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <ul className="space-y-2.5">
              {s.red_flags.map((flag, i) => (
                <li key={i} className="text-sm text-red-900 flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-medium">{flag}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Clinical Pearls */}
      {s.pearls?.length > 0 && (
        <Card className="border-2 border-amber-300 shadow-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 border-b border-amber-200 py-3 px-4">
            <CardTitle className="text-base font-bold text-amber-800 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-600" /> Clinical Pearls & Viva Points
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <ul className="space-y-3">
              {s.pearls.map((pearl, i) => (
                <li key={i} className="text-sm text-amber-900 flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <span className="text-amber-500 font-bold text-lg flex-shrink-0 leading-none">★</span>
                  <span className="leading-relaxed">{pearl}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <EvidenceFooter guideline={guideline} detailed />

      {/* References & Citations — always shown in detailed mode */}
      <Card className="border-2 border-indigo-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-indigo-200 py-3 px-4">
          <CardTitle className="text-base font-bold text-indigo-800 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600" /> References & Citations
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <ReferencesPanel guideline={guideline} />
        </CardContent>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SHARED SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════

function ManagementContent({ management, textSize = "xs", expanded = false }) {
  return (
    <div className="space-y-4">
      {Object.entries(management).map(([key, items]) => {
        if (!items || (Array.isArray(items) && items.length === 0)) return null;
        const label = key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
        return (
          <div key={key}>
            <p className={`font-bold text-green-700 uppercase tracking-wide mb-2 flex items-center gap-1.5 ${textSize === "sm" ? "text-xs" : "text-xs"}`}>
              <span className="w-1.5 h-4 bg-green-400 rounded-full flex-shrink-0 inline-block" />
              {label}
            </p>
            {Array.isArray(items) ? (
              <ol className="space-y-1.5">
                {items.map((item, i) => (
                  <li key={i} className={`text-slate-700 flex items-start gap-2 ${textSize === "sm" ? "text-sm" : "text-xs"}`}>
                    <span className="font-bold text-green-500 flex-shrink-0 w-5 text-right">{i + 1}.</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ol>
            ) : typeof items === "object" ? (
              <div className="space-y-3 pl-2">
                {Object.entries(items).map(([sk, subitems]) => (
                  <div key={sk} className="pl-3 border-l-2 border-green-200">
                    <p className={`font-semibold text-slate-500 mb-1 ${textSize === "sm" ? "text-xs" : "text-xs"}`}>{sk.replace(/_/g, " ")}</p>
                    {Array.isArray(subitems) && subitems.map((si, j) => (
                      <p key={j} className={`text-slate-700 flex items-start gap-1 mb-1 ${textSize === "sm" ? "text-sm" : "text-xs"}`}>
                        <span className="text-green-400 flex-shrink-0 mt-0.5">→</span>
                        <span className="leading-relaxed">{si}</span>
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function MonitoringContent({ monitoring, textSize = "xs", expanded = false }) {
  return (
    <div className="space-y-3">
      {monitoring.frequency && (
        <div className={`p-3 bg-teal-50 rounded-lg border border-teal-200`}>
          <span className={`font-semibold text-teal-800 ${textSize === "sm" ? "text-sm" : "text-xs"}`}>Frequency: </span>
          <span className={`text-teal-700 ${textSize === "sm" ? "text-sm" : "text-xs"}`}>{monitoring.frequency}</span>
        </div>
      )}
      {monitoring.parameters?.length > 0 && (
        <div>
          {expanded && <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Parameters to monitor</p>}
          <div className="flex flex-wrap gap-1.5">
            {monitoring.parameters.map((p, i) => (
              <Badge key={i} variant="outline" className={`bg-white ${textSize === "sm" ? "text-xs" : "text-xs"}`}>{p}</Badge>
            ))}
          </div>
        </div>
      )}
      {monitoring.follow_up && (
        <div className={`border-t border-teal-100 pt-3`}>
          {expanded && <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Follow-up plan</p>}
          <p className={`text-slate-600 leading-relaxed ${textSize === "sm" ? "text-sm" : "text-xs"}`}>{monitoring.follow_up}</p>
        </div>
      )}
    </div>
  );
}

function EvidenceFooter({ guideline, detailed = false }) {
  return (
    <div className={`bg-slate-50 border border-slate-200 rounded-xl ${detailed ? "p-4" : "p-2.5"}`}>
      <div className="flex flex-wrap items-center gap-2">
        <BookOpen className={`text-slate-500 flex-shrink-0 ${detailed ? "w-4 h-4" : "w-3.5 h-3.5"}`} />
        <span className={`font-medium text-slate-600 ${detailed ? "text-sm" : "text-xs"}`}>{guideline.source}</span>
        <Badge variant="outline" className={detailed ? "text-xs" : "text-xs"}>{guideline.year}</Badge>
        <Badge className={`${
          guideline.evidence_level?.includes("High") ? "bg-green-100 text-green-800" :
          guideline.evidence_level?.includes("Moderate") ? "bg-yellow-100 text-yellow-800" :
          "bg-slate-100 text-slate-700"
        } ${detailed ? "text-xs" : "text-xs"}`}>{guideline.evidence_level || "Expert Opinion"}</Badge>
        {guideline.external_link && (
          <a href={guideline.external_link} target="_blank" rel="noreferrer"
             className={`ml-auto text-blue-600 hover:underline flex items-center gap-1 ${detailed ? "text-sm" : "text-xs"}`}>
            Full guideline <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DB GUIDELINE VIEWS (flat fields)
// ═══════════════════════════════════════════════════════════════

function DBQuickView({ guideline }) {
  return (
    <div className="space-y-2 w-full overflow-hidden">
      {guideline.scope_and_population && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-xs font-semibold text-blue-700 mb-1 flex items-center gap-1"><Zap className="w-3 h-3" />Clinical Summary</p>
          <p className="text-sm text-blue-900 leading-relaxed">{guideline.scope_and_population}</p>
        </div>
      )}
      {/* Algorithm flowchart — shown above key recommendations */}
      {guideline.algorithm?.nodes?.length > 0 && (
        <AlgorithmFlowchart algorithm={guideline.algorithm} />
      )}
      {guideline.key_recommendations?.filter(r => r?.trim()).length > 0 && (
        <AccSection title="Management Steps" icon={Target} color="green" defaultOpen>
          <ol className="space-y-1.5">
            {guideline.key_recommendations.filter(r => r?.trim()).map((rec, i) => (
              <li key={i} className="text-xs text-slate-800 flex items-start gap-2 p-2 bg-green-50 rounded-lg border border-green-100">
                <span className="font-bold text-green-600 flex-shrink-0">{i + 1}.</span>
                <span className="leading-relaxed">{rec}</span>
              </li>
            ))}
          </ol>
        </AccSection>
      )}
      {guideline.practice_pearls?.filter(p => p?.trim()).length > 0 && (
        <AccSection title="Practice Pearls" icon={Lightbulb} color="amber">
          <ul className="space-y-1.5">
            {guideline.practice_pearls.filter(p => p?.trim()).map((pearl, i) => (
              <li key={i} className="text-xs text-amber-900 flex items-start gap-2 p-2 bg-amber-50 rounded-lg border border-amber-100">
                <span className="text-amber-500 flex-shrink-0">★</span>
                <span className="leading-relaxed">{pearl}</span>
              </li>
            ))}
          </ul>
        </AccSection>
      )}
      {guideline.summary && (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <p className="text-xs font-semibold text-slate-600 mb-1">Full Summary</p>
          <p className="text-sm text-slate-700 leading-relaxed">{guideline.summary}</p>
        </div>
      )}
      <EvidenceFooter guideline={guideline} />
      <AccSection title="References & Citations" icon={BookOpen} color="indigo">
        <ReferencesPanel guideline={guideline} compact />
      </AccSection>
    </div>
  );
}

function ContentSectionRenderer({ section, idx }) {
  // Render a single content.sections[] entry with full prose + bullets
  const lines = (section.content || "").split('\n').filter(l => l.trim());
  return (
    <div id={`section-${idx}`} className="border-l-4 border-purple-300 pl-4 pb-2">
      <h3 className="font-bold text-slate-900 text-base mb-2 leading-snug">{section.heading}</h3>
      {lines.length > 0 && (
        <div className="space-y-1.5 mb-3">
          {lines.map((line, li) => {
            const isBullet = line.trim().startsWith("- ") || line.trim().startsWith("• ") || line.trim().startsWith("* ");
            const text = isBullet ? line.trim().replace(/^[-•*]\s+/, "") : line.trim();
            if (isBullet) {
              return (
                <div key={li} className="flex items-start gap-2">
                  <span className="text-purple-400 flex-shrink-0 mt-1 text-xs">●</span>
                  <p className="text-sm text-slate-700 leading-relaxed">{text}</p>
                </div>
              );
            }
            return <p key={li} className="text-sm text-slate-700 leading-relaxed">{text}</p>;
          })}
        </div>
      )}
      {section.key_points?.filter(p => p?.trim()).length > 0 && (
        <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 mt-2">
          <p className="text-xs font-bold text-purple-700 uppercase tracking-wide mb-2">Key Points</p>
          <ul className="space-y-1.5">
            {section.key_points.filter(p => p?.trim()).map((point, pidx) => (
              <li key={pidx} className="text-sm text-slate-700 flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function DBDetailedView({ guideline }) {
  const sections = guideline.content?.sections || [];
  const recs = guideline.key_recommendations?.filter(r => r?.trim()) || [];

  return (
    <div className="w-full overflow-hidden">
      {/* Layout: TOC sidebar + main content on lg screens */}
      <div className="flex gap-4 items-start">
        {/* TOC sidebar — only shown when there are named sections */}
        {sections.length > 0 && (
          <aside className="hidden lg:block w-52 flex-shrink-0 sticky top-20 self-start">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                <BookOpen className="w-3 h-3" /> Contents
              </p>
              <nav className="space-y-1">
                {recs.length > 0 && (
                  <a href="#quick-rec" className="block text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded px-2 py-1 transition-colors leading-snug">
                    Quick Recommendations
                  </a>
                )}
                {sections.map((s, idx) => (
                  <a
                    key={idx}
                    href={`#section-${idx}`}
                    className="block text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded px-2 py-1 transition-colors leading-snug"
                  >
                    {s.heading}
                  </a>
                ))}
              </nav>
            </div>
          </aside>
        )}

        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-4">
          {guideline.scope_and_population && (
            <Card className="border-2 border-blue-200">
              <CardHeader className="bg-blue-50 border-b border-blue-200 py-3 px-4">
                <CardTitle className="text-base font-bold text-blue-800 flex items-center gap-2">
                  <Zap className="w-4 h-4" /> Clinical Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-sm text-slate-800 leading-relaxed">{guideline.scope_and_population}</p>
              </CardContent>
            </Card>
          )}

          {/* Algorithm flowchart — above key recommendations */}
          {guideline.algorithm?.nodes?.length > 0 && (
            <AlgorithmFlowchart algorithm={guideline.algorithm} />
          )}

          {/* Key Recommendations — numbered quick-reference at top */}
          {recs.length > 0 && (
            <Card id="quick-rec" className="border-2 border-green-200">
              <CardHeader className="bg-green-50 border-b border-green-200 py-3 px-4">
                <CardTitle className="text-base font-bold text-green-800 flex items-center gap-2">
                  <Target className="w-4 h-4" /> Key Recommendations
                  <Badge className="bg-green-600 text-white text-xs ml-auto">{recs.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ol className="space-y-2.5">
                  {recs.map((rec, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">{i + 1}</div>
                      <p className="text-sm text-slate-800 leading-relaxed">{rec}</p>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}

          {/* Full content sections with TOC anchors */}
          {sections.length > 0 && (
            <Card className="border-2 border-purple-200">
              <CardHeader className="bg-purple-50 border-b border-purple-200 py-3 px-4">
                <CardTitle className="text-base font-bold text-purple-800 flex items-center gap-2">
                  <BookOpenCheck className="w-4 h-4 text-purple-600" /> Full Clinical Content
                  <Badge className="bg-purple-600 text-white text-xs ml-auto">{sections.length} sections</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-5">
                {sections.map((section, idx) => (
                  <ContentSectionRenderer key={idx} section={section} idx={idx} />
                ))}
              </CardContent>
            </Card>
          )}

          {guideline.practice_pearls?.filter(p => p?.trim()).length > 0 && (
            <Card className="border-2 border-amber-200">
              <CardHeader className="bg-amber-50 border-b border-amber-200 py-3 px-4">
                <CardTitle className="text-base font-bold text-amber-800 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" /> Clinical Practice Pearls
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ul className="space-y-3">
                  {guideline.practice_pearls.filter(p => p?.trim()).map((pearl, i) => (
                    <li key={i} className="text-sm text-amber-900 flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
                      <span className="text-amber-500 font-bold text-lg flex-shrink-0 leading-none">★</span>
                      <span className="leading-relaxed">{pearl}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {guideline.summary && (
            <Card className="border-2 border-slate-200">
              <CardHeader className="bg-slate-50 border-b border-slate-200 py-3 px-4">
                <CardTitle className="text-base font-bold text-slate-700">Complete Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-sm text-slate-700 leading-relaxed">{guideline.summary}</p>
              </CardContent>
            </Card>
          )}

          <EvidenceFooter guideline={guideline} detailed />

          <Card className="border-2 border-indigo-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-indigo-200 py-3 px-4">
              <CardTitle className="text-base font-bold text-indigo-800 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" /> References & Citations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ReferencesPanel guideline={guideline} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN EXPORT — with view toggle
// ═══════════════════════════════════════════════════════════════

export default function GuidelineDetailView({ guideline, defaultMode = "quick" }) {
  const [mode, setMode] = useState(defaultMode);
  const isBuiltin = !!guideline.sections;

  return (
    <div className="w-full overflow-hidden">
      {/* View toggle */}
      <div className="flex items-center gap-2 mb-3 p-2 bg-slate-50 rounded-xl border border-slate-200">
        <div className="flex rounded-lg overflow-hidden border border-slate-200 bg-white flex-shrink-0">
          <button
            onClick={() => setMode("quick")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors ${mode === "quick" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50"}`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Quick View
          </button>
          <button
            onClick={() => setMode("detailed")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors ${mode === "detailed" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50"}`}
          >
            <BookOpenCheck className="w-3.5 h-3.5" />
            Detailed View
          </button>
        </div>
        <p className="text-xs text-slate-400 hidden sm:block">
          {mode === "quick" ? "Compact bedside reference" : "Full handbook-style reading mode"}
        </p>
        {isBuiltin && (
          <Badge className="ml-auto text-xs bg-blue-100 text-blue-700 border-0 flex-shrink-0">Built-in · Structured</Badge>
        )}
      </div>

      {mode === "quick" ? <QuickView guideline={guideline} /> : <DetailedView guideline={guideline} />}
    </div>
  );
}