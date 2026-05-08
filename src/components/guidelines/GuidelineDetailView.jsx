import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronDown, ChevronUp, AlertTriangle, Lightbulb, Pill,
  Activity, CheckCircle, Star, ExternalLink, BookOpen, Clock,
  Zap, Stethoscope, Shield, Heart, FlaskConical, Users, TrendingUp
} from "lucide-react";

// eslint-disable-next-line no-unused-vars
const SectionHeader = ({ icon: Icon, label, color = "blue", count }) => (
  <div className={`flex items-center gap-2 text-${color}-700`}>
    <Icon className={`w-4 h-4 flex-shrink-0`} />
    <span className="font-semibold text-sm">{label}</span>
    {count && <Badge variant="outline" className="text-xs ml-auto">{count}</Badge>}
  </div>
);

function AccordionSection({ title, icon: Icon, color = "blue", children, defaultOpen = false, badge }) {
  const [open, setOpen] = useState(defaultOpen);
  const colorMap = {
    red: "bg-red-50 border-red-200 text-red-800",
    orange: "bg-orange-50 border-orange-200 text-orange-800",
    blue: "bg-blue-50 border-blue-200 text-blue-800",
    green: "bg-green-50 border-green-200 text-green-800",
    purple: "bg-purple-50 border-purple-200 text-purple-800",
    amber: "bg-amber-50 border-amber-200 text-amber-800",
    teal: "bg-teal-50 border-teal-200 text-teal-800",
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-800",
  };
  const cls = colorMap[color] || colorMap.blue;

  return (
    <div className="section-accordion">
      <button
        className={`section-accordion-trigger ${cls} rounded-t-lg ${!open ? "rounded-b-lg" : ""}`}
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
          <span className="truncate">{title}</span>
          {badge && <Badge className="ml-2 text-xs">{badge}</Badge>}
        </div>
        {open ? <ChevronUp className="w-4 h-4 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 flex-shrink-0" />}
      </button>
      {open && (
        <div className="p-3 bg-white border-t border-slate-100">
          {children}
        </div>
      )}
    </div>
  );
}

function DrugCard({ drug }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="drug-card border-blue-400 bg-blue-50">
      <button
        className="w-full flex items-start justify-between gap-2 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-blue-900">{drug.name}</span>
            {drug.purpose && <Badge className="text-xs bg-blue-100 text-blue-700 border-0">{drug.purpose}</Badge>}
          </div>
          <p className="text-xs text-blue-700 mt-0.5">{drug.dose}</p>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" /> : <ChevronDown className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />}
      </button>
      {expanded && (
        <div className="mt-2 pt-2 border-t border-blue-200 space-y-1">
          {drug.max && <p className="text-xs"><span className="font-medium text-slate-600">Max dose:</span> <span className="text-red-700">{drug.max}</span></p>}
          {drug.monitoring && <p className="text-xs"><span className="font-medium text-slate-600">Monitor:</span> {drug.monitoring}</p>}
          {drug.notes && (
            <div className="mt-1 p-2 bg-amber-50 rounded text-xs text-amber-800 border border-amber-200">
              💡 {drug.notes}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function GuidelineDetailView({ guideline }) {
  const s = guideline.sections || {};
  const qs = s.quick_summary || {};

  return (
    <div className="space-y-2 w-full max-w-full overflow-hidden">
      {/* Quick Clinical Summary — always visible */}
      {(qs.definition || qs.emergency_recognition || qs.immediate_management) && (
        <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-3">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-blue-600" />
            <span className="font-bold text-blue-800 text-sm">Quick Clinical Summary</span>
          </div>
          {qs.definition && (
            <div className="mb-2 p-2 bg-white rounded border border-blue-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Definition</p>
              <p className="text-sm text-slate-800">{qs.definition}</p>
            </div>
          )}
          {qs.emergency_recognition?.length > 0 && (
            <div className="mb-2">
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Emergency Recognition
              </p>
              <ul className="space-y-1">
                {qs.emergency_recognition.map((item, i) => (
                  <li key={i} className="text-xs text-red-800 flex items-start gap-1.5">
                    <span className="text-red-500 mt-0.5 flex-shrink-0">●</span>{item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {qs.immediate_management?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Immediate Management
              </p>
              <ol className="space-y-1">
                {qs.immediate_management.map((item, i) => (
                  <li key={i} className="text-xs text-green-900 flex items-start gap-1.5">
                    <span className="font-bold text-green-600 flex-shrink-0">{i+1}.</span>{item}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}

      {/* Staging */}
      {(s.staging?.kdigo || s.staging?.ckd || s.classification) && (
        <AccordionSection title="Staging / Classification" icon={TrendingUp} color="indigo" defaultOpen={true}>
          <div className="space-y-1.5">
            {(s.staging?.kdigo || s.staging?.ckd || s.classification || []).map((item, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-1 p-2 bg-indigo-50 rounded border border-indigo-100">
                <div className="flex gap-2 items-center">
                  <Badge className="bg-indigo-600 text-white text-xs flex-shrink-0">
                    {item.stage || item.type || item.modality || `#${i+1}`}
                  </Badge>
                  <span className="text-xs font-medium text-slate-700">
                    {item.scr || item.gfr || item.definition || item.bp || ""}
                  </span>
                </div>
                {(item.action || item.management || item.advantages) && (
                  <p className="text-xs text-slate-600 sm:ml-auto">{item.action || item.management || item.advantages}</p>
                )}
              </div>
            ))}
          </div>
        </AccordionSection>
      )}

      {/* Management */}
      {s.management && (
        <AccordionSection title="Stepwise Management" icon={Activity} color="green" defaultOpen={false}>
          {Object.entries(s.management).map(([key, items]) => {
            if (!items || (Array.isArray(items) && items.length === 0)) return null;
            const label = key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
            return (
              <div key={key} className="mb-3">
                <p className="text-xs font-bold text-green-700 uppercase tracking-wide mb-1.5">{label}</p>
                {Array.isArray(items) ? (
                  <ol className="space-y-1">
                    {items.map((item, i) => (
                      <li key={i} className="text-xs text-slate-700 flex items-start gap-1.5 pl-1">
                        <span className="text-green-500 font-bold flex-shrink-0">{i+1}.</span>{item}
                      </li>
                    ))}
                  </ol>
                ) : typeof items === "object" ? (
                  <div className="space-y-2">
                    {Object.entries(items).map(([subkey, subitems]) => (
                      <div key={subkey} className="pl-2 border-l-2 border-green-200">
                        <p className="text-xs font-semibold text-slate-600 mb-1">{subkey.replace(/_/g," ")}</p>
                        {Array.isArray(subitems) && subitems.map((si, j) => (
                          <p key={j} className="text-xs text-slate-700 flex items-start gap-1.5">
                            <span className="flex-shrink-0 text-green-400">→</span>{si}
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </AccordionSection>
      )}

      {/* Drugs */}
      {s.drugs?.length > 0 && (
        <AccordionSection title="Drug Dosing" icon={Pill} color="blue" badge={`${s.drugs.length} drugs`}>
          <div className="space-y-2">
            {s.drugs.map((drug, i) => <DrugCard key={i} drug={drug} />)}
          </div>
        </AccordionSection>
      )}

      {/* Monitoring */}
      {s.monitoring && (
        <AccordionSection title="Monitoring & Follow-Up" icon={Clock} color="teal">
          {s.monitoring.frequency && (
            <div className="mb-2 p-2 bg-teal-50 rounded text-xs text-teal-800 border border-teal-200">
              <span className="font-semibold">Frequency: </span>{s.monitoring.frequency}
            </div>
          )}
          {s.monitoring.parameters?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {s.monitoring.parameters.map((p, i) => (
                <Badge key={i} variant="outline" className="text-xs bg-white">{p}</Badge>
              ))}
            </div>
          )}
          {s.monitoring.follow_up && (
            <p className="mt-2 text-xs text-slate-600 border-t border-teal-100 pt-2">{s.monitoring.follow_up}</p>
          )}
        </AccordionSection>
      )}

      {/* Vaccination */}
      {s.vaccination?.length > 0 && (
        <AccordionSection title="Vaccination Guidance" icon={Shield} color="purple">
          <ul className="space-y-1.5">
            {s.vaccination.map((v, i) => (
              <li key={i} className="text-xs text-slate-700 flex items-start gap-1.5">
                <Shield className="w-3 h-3 text-purple-500 flex-shrink-0 mt-0.5" />{v}
              </li>
            ))}
          </ul>
        </AccordionSection>
      )}

      {/* Red Flags */}
      {s.red_flags?.length > 0 && (
        <AccordionSection title="Red Flags & Escalation" icon={AlertTriangle} color="red">
          <ul className="space-y-1.5">
            {s.red_flags.map((flag, i) => (
              <li key={i} className="text-xs text-red-800 flex items-start gap-1.5 p-1.5 bg-red-50 rounded border border-red-100">
                <AlertTriangle className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />{flag}
              </li>
            ))}
          </ul>
        </AccordionSection>
      )}

      {/* Clinical Pearls */}
      {s.pearls?.length > 0 && (
        <AccordionSection title="Clinical Pearls & Viva Points" icon={Lightbulb} color="amber">
          <ul className="space-y-2">
            {s.pearls.map((pearl, i) => (
              <li key={i} className="text-xs text-amber-900 flex items-start gap-2 p-2 bg-amber-50 rounded border border-amber-200">
                <span className="text-amber-500 font-bold flex-shrink-0">★</span>{pearl}
              </li>
            ))}
          </ul>
        </AccordionSection>
      )}

      {/* Evidence */}
      <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
        <div className="flex flex-wrap items-center gap-2">
          <BookOpen className="w-3.5 h-3.5 text-slate-500" />
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