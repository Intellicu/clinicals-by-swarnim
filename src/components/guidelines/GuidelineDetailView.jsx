import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown, ChevronUp, AlertTriangle, Lightbulb, Pill,
  Activity, CheckCircle, ExternalLink, BookOpen, Clock,
  Zap, Shield, TrendingUp, Utensils, Target, FlaskConical
} from "lucide-react";

// ── Accordion section ─────────────────────────────────────────────────────
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

// ── Drug card ─────────────────────────────────────────────────────────────
function DrugCard({ drug }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-l-4 border-blue-400 bg-blue-50 rounded-r-xl p-2.5 mb-2">
      <button className="w-full flex items-start justify-between gap-2 text-left" onClick={() => setOpen(!open)}>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
            <span className="font-semibold text-sm text-blue-900">{drug.name}</span>
            {drug.purpose && <Badge className="text-xs bg-blue-100 text-blue-700 border-0 font-normal leading-tight">{drug.purpose}</Badge>}
          </div>
          <p className="text-xs text-blue-700 leading-relaxed">{drug.dose}</p>
        </div>
        <span className="flex-shrink-0 text-blue-400 mt-0.5">
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </span>
      </button>
      {open && (
        <div className="mt-2 pt-2 border-t border-blue-200 space-y-1.5">
          {drug.max && <p className="text-xs"><span className="font-semibold text-slate-600">Max: </span><span className="text-red-700 font-semibold">{drug.max}</span></p>}
          {drug.renal_adjust && <p className="text-xs"><span className="font-semibold text-slate-600">Renal adj: </span><span className="text-orange-700">{drug.renal_adjust}</span></p>}
          {drug.monitoring && <p className="text-xs"><span className="font-semibold text-slate-600">Monitor: </span><span className="text-slate-700">{drug.monitoring}</span></p>}
          {drug.notes && (
            <div className="p-2 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 flex items-start gap-1.5">
              <Lightbulb className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">{drug.notes}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────
export default function GuidelineDetailView({ guideline }) {
  const s = guideline.sections;

  // DB guideline (flat fields, no structured sections)
  if (!s) return <DBGuidelineView guideline={guideline} />;

  const qs = s.quick_summary || {};
  const classData = s.staging?.kdigo || s.staging?.ckd || s.classification || [];

  return (
    <div className="space-y-2 w-full overflow-hidden">

      {/* ── Meta context pills ── */}
      {(qs.epidemiology || qs.pathophysiology) && (
        <div className="flex gap-1.5 flex-wrap">
          {qs.epidemiology && (
            <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full border border-slate-200 leading-relaxed">
              📊 {qs.epidemiology.slice(0, 100)}{qs.epidemiology.length > 100 ? "…" : ""}
            </span>
          )}
        </div>
      )}

      {/* ── Quick Clinical Summary ── */}
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

          {qs.key_diagnostic?.length > 0 && (
            <div className="mb-2.5">
              <p className="text-xs font-bold text-teal-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                <FlaskConical className="w-3 h-3" /> Key Diagnostic Points
              </p>
              <ul className="space-y-1">
                {qs.key_diagnostic.map((item, i) => (
                  <li key={i} className="text-xs text-slate-700 flex items-start gap-1.5">
                    <span className="text-teal-500 font-bold flex-shrink-0">→</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
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

      {/* ── Staging / Classification ── */}
      {classData.length > 0 && (
        <AccSection title="Staging / Classification" icon={TrendingUp} color="indigo" defaultOpen>
          <div className="space-y-2">
            {classData.map((item, i) => (
              <div key={i} className="p-2 bg-indigo-50 rounded-lg border border-indigo-100">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <Badge className="bg-indigo-600 text-white text-xs flex-shrink-0 leading-none">
                    {item.stage || item.type || item.modality || `#${i + 1}`}
                  </Badge>
                  {(item.scr || item.gfr || item.bp || item.definition) && (
                    <span className="text-xs font-medium text-slate-700 leading-relaxed">{item.scr || item.gfr || item.bp || item.definition}</span>
                  )}
                  {item.uo && <Badge variant="outline" className="text-xs leading-none">{item.uo}</Badge>}
                  {item.description && <span className="text-xs text-slate-500">{item.description}</span>}
                </div>
                {(item.action || item.management || item.advantages) && (
                  <p className="text-xs text-slate-600 leading-relaxed">{item.action || item.management || item.advantages}</p>
                )}
              </div>
            ))}
          </div>
        </AccSection>
      )}

      {/* ── Stepwise Management ── */}
      {s.management && Object.keys(s.management).length > 0 && (
        <AccSection title="Stepwise Management Algorithm" icon={Target} color="green">
          {Object.entries(s.management).map(([key, items]) => {
            if (!items || (Array.isArray(items) && items.length === 0)) return null;
            const label = key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
            return (
              <div key={key} className="mb-3 last:mb-0">
                <p className="text-xs font-bold text-green-700 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                  <span className="w-1 h-3 bg-green-400 rounded-full flex-shrink-0 inline-block" />
                  {label}
                </p>
                {Array.isArray(items) ? (
                  <ol className="space-y-1">
                    {items.map((item, i) => (
                      <li key={i} className="text-xs text-slate-700 flex items-start gap-1.5">
                        <span className="font-bold text-green-500 flex-shrink-0 w-4 text-right">{i + 1}.</span>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ol>
                ) : typeof items === "object" ? (
                  <div className="space-y-2">
                    {Object.entries(items).map(([sk, subitems]) => (
                      <div key={sk} className="pl-2 border-l-2 border-green-200">
                        <p className="text-xs font-semibold text-slate-500 mb-1">{sk.replace(/_/g, " ")}</p>
                        {Array.isArray(subitems) && subitems.map((si, j) => (
                          <p key={j} className="text-xs text-slate-700 flex items-start gap-1 mb-0.5">
                            <span className="text-green-400 flex-shrink-0">→</span>
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
        </AccSection>
      )}

      {/* ── Drug Dosing ── */}
      {s.drugs?.length > 0 && (
        <AccSection title="Drug Dosing & Monitoring" icon={Pill} color="blue" badge={`${s.drugs.length} drugs`}>
          {s.drugs.map((drug, i) => <DrugCard key={i} drug={drug} />)}
        </AccSection>
      )}

      {/* ── Monitoring ── */}
      {s.monitoring && (
        <AccSection title="Monitoring Schedule & Follow-Up" icon={Clock} color="teal">
          {s.monitoring.frequency && (
            <div className="mb-2 p-2 bg-teal-50 rounded-lg border border-teal-200">
              <span className="text-xs font-semibold text-teal-800">Frequency: </span>
              <span className="text-xs text-teal-700">{s.monitoring.frequency}</span>
            </div>
          )}
          {s.monitoring.parameters?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {s.monitoring.parameters.map((p, i) => (
                <Badge key={i} variant="outline" className="text-xs bg-white">{p}</Badge>
              ))}
            </div>
          )}
          {s.monitoring.follow_up && (
            <p className="text-xs text-slate-600 border-t border-teal-100 pt-2 leading-relaxed">{s.monitoring.follow_up}</p>
          )}
        </AccSection>
      )}

      {/* ── Nutrition ── */}
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

      {/* ── Vaccination ── */}
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

      {/* ── Red Flags ── */}
      {s.red_flags?.length > 0 && (
        <AccSection title="Red Flags & Escalation Triggers" icon={AlertTriangle} color="red">
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

      {/* ── Clinical Pearls ── */}
      {s.pearls?.length > 0 && (
        <AccSection title="Clinical Pearls & Viva Points" icon={Lightbulb} color="amber">
          <ul className="space-y-2">
            {s.pearls.map((pearl, i) => (
              <li key={i} className="text-xs text-amber-900 flex items-start gap-2 p-2 bg-amber-50 rounded-lg border border-amber-200">
                <span className="text-amber-500 font-bold flex-shrink-0 text-sm">★</span>
                <span className="leading-relaxed">{pearl}</span>
              </li>
            ))}
          </ul>
        </AccSection>
      )}

      {/* ── Evidence Footer ── */}
      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
        <div className="flex flex-wrap items-center gap-2">
          <BookOpen className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
          <span className="text-xs font-medium text-slate-600">{guideline.source}</span>
          <Badge variant="outline" className="text-xs">{guideline.year}</Badge>
          <Badge className={`text-xs ${
            guideline.evidence_level?.includes("High") ? "bg-green-100 text-green-800" :
            guideline.evidence_level?.includes("Moderate") ? "bg-yellow-100 text-yellow-800" :
            "bg-slate-100 text-slate-700"
          }`}>{guideline.evidence_level || "Expert Opinion"}</Badge>
          {guideline.external_link && (
            <a href={guideline.external_link} target="_blank" rel="noreferrer"
               className="ml-auto text-xs text-blue-600 hover:underline flex items-center gap-1">
              Full guideline <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Flat DB guideline view ────────────────────────────────────────────────
function DBGuidelineView({ guideline }) {
  return (
    <div className="space-y-3 w-full overflow-hidden">
      {guideline.scope_and_population && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-xs font-semibold text-blue-700 mb-1 flex items-center gap-1"><Zap className="w-3 h-3" />Clinical Summary</p>
          <p className="text-sm text-blue-900 leading-relaxed">{guideline.scope_and_population}</p>
        </div>
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
      <div className="flex flex-wrap gap-2 items-center p-2 bg-slate-50 rounded-xl border border-slate-200">
        <BookOpen className="w-3.5 h-3.5 text-slate-500" />
        <span className="text-xs text-slate-600">{guideline.source} · {guideline.year}</span>
        <Badge className={`text-xs ${guideline.evidence_level?.includes("High") ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
          {guideline.evidence_level || "Expert Opinion"}
        </Badge>
        {guideline.external_link && (
          <a href={guideline.external_link} target="_blank" rel="noreferrer"
             className="ml-auto text-xs text-blue-600 flex items-center gap-1 hover:underline">
            Full guideline <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}