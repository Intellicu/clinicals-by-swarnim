import React, { useState } from "react";
import { RHEUM_PROCEDURES } from "@/lib/rheumatology/RheumProceduresData";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Activity } from "lucide-react";

function ProcedureCard({ proc }) {
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState("indications");

  const sections = [
    { id: "indications", label: "📋 Indications" },
    { id: "prep", label: "⚙️ Prep" },
    { id: "monitoring", label: "📈 Monitoring" },
    { id: "complications", label: "⚠️ Risks" },
    { id: "consent", label: "📄 Consent" },
  ];

  return (
    <Card className="bg-white border-2 border-slate-200 hover:border-indigo-300 transition-colors">
      <CardHeader className="pb-2 cursor-pointer" onClick={() => setOpen(o => !o)}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-slate-900">{proc.name}</span>
              <Badge className="bg-indigo-100 text-indigo-800 text-xs">{proc.category}</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{proc.indications?.[0]}</p>
          </div>
          {open ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
        </div>
      </CardHeader>

      {open && (
        <CardContent className="pt-0 space-y-3">
          {/* Section tabs */}
          <div className="flex gap-1 flex-wrap border-b pb-2">
            {sections.map(s => (
              <button key={s.id} onClick={() => setSection(s.id)}
                className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors ${section === s.id ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                {s.label}
              </button>
            ))}
          </div>

          {section === "indications" && (
            <div className="space-y-2">
              <div>
                <p className="text-xs font-bold text-green-700 mb-1">✅ Indications</p>
                {proc.indications?.map((ind, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-xs p-1.5 bg-green-50 rounded border border-green-100 mb-1">
                    <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{ind}</span>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs font-bold text-red-700 mb-1">❌ Contraindications</p>
                {proc.contraindications?.map((c, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-xs p-1.5 bg-red-50 rounded border border-red-100 mb-1">
                    <AlertTriangle className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
                    <span>{c}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {section === "prep" && (
            <div className="space-y-1.5">
              {(proc.preparation || proc.agents || proc.infusion || proc.technique || proc.procedure || proc.patterns)?.concat?.() && (
                <>
                  {proc.preparation && proc.preparation.map((p, i) => (
                    <div key={i} className="text-xs p-2 bg-blue-50 border border-blue-100 rounded flex items-start gap-2">
                      <span className="font-bold text-blue-600 flex-shrink-0">{i + 1}.</span>{p}
                    </div>
                  ))}
                  {proc.agents && proc.agents.map((a, i) => (
                    <div key={i} className="text-xs p-2 bg-purple-50 border border-purple-100 rounded">{a}</div>
                  ))}
                  {proc.technique && proc.technique.map((t, i) => (
                    <div key={i} className="text-xs p-2 bg-slate-50 border border-slate-100 rounded">{t}</div>
                  ))}
                  {proc.infusion && proc.infusion.map((t, i) => (
                    <div key={i} className="text-xs p-2 bg-slate-50 border border-slate-100 rounded">{t}</div>
                  ))}
                  {proc.patterns && proc.patterns.map((t, i) => (
                    <div key={i} className="text-xs p-2 bg-teal-50 border border-teal-100 rounded">{t}</div>
                  ))}
                  {proc.procedure && proc.procedure.map((t, i) => (
                    <div key={i} className="text-xs p-2 bg-slate-50 border border-slate-100 rounded">{i + 1}. {t}</div>
                  ))}
                </>
              )}
            </div>
          )}

          {section === "monitoring" && (
            <div className="space-y-1.5">
              {proc.monitoring?.map((m, i) => (
                <div key={i} className="flex items-start gap-2 text-xs p-2 bg-teal-50 border border-teal-100 rounded">
                  <Activity className="w-3 h-3 text-teal-600 flex-shrink-0 mt-0.5" />{m}
                </div>
              ))}
              {proc.interpretation && (
                <div className="mt-2">
                  <p className="text-xs font-bold text-slate-700 mb-1">Interpretation</p>
                  {proc.interpretation.map((t, i) => (
                    <div key={i} className="text-xs p-2 bg-blue-50 border border-blue-100 rounded mb-1">{t}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {section === "complications" && (
            <div className="space-y-1.5">
              {proc.complications?.map((c, i) => (
                <div key={i} className="flex items-start gap-2 text-xs p-2 bg-amber-50 border border-amber-100 rounded">
                  <AlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />{c}
                </div>
              ))}
            </div>
          )}

          {section === "consent" && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-xs text-purple-900">
              <p className="font-bold mb-1">📄 Consent Guidance</p>
              <p>{proc.consent}</p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

export default function RheumProceduresTab() {
  return (
    <div className="space-y-3">
      <Alert className="bg-indigo-50 border-indigo-200">
        <Activity className="w-4 h-4 text-indigo-600" />
        <AlertDescription className="text-xs text-indigo-900">
          <strong>Procedures:</strong> Joint aspiration, steroid injection, IVIG, plasma exchange, capillaroscopy — indications, contraindications, prep, monitoring, consent.
        </AlertDescription>
      </Alert>

      {RHEUM_PROCEDURES.map(proc => (
        <ProcedureCard key={proc.id} proc={proc} />
      ))}
    </div>
  );
}