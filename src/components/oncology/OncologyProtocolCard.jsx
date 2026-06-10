import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, AlertTriangle, Pill, FlaskConical, Star } from "lucide-react";

const priorityColor = {
  Draft: "bg-slate-100 text-slate-600 border-slate-200",
  Review: "bg-amber-100 text-amber-700 border-amber-200",
  Published: "bg-green-100 text-green-700 border-green-200",
  Archived: "bg-red-100 text-red-700 border-red-200",
};

export default function OncologyProtocolCard({ guideline, drugs, doseRules }) {
  const [expanded, setExpanded] = useState(false);

  const relatedDrugs = drugs.filter(d => {
    const nameMatch = guideline.keywords?.some(k =>
      d.generic_name?.toLowerCase().includes(k.toLowerCase())
    );
    const drugNames = guideline.key_recommendations?.join(" ").toLowerCase() || "";
    const nameInRec = d.generic_name?.split(" ")[0]?.toLowerCase() &&
      drugNames.includes(d.generic_name.split(" ")[0].toLowerCase());
    return nameMatch || nameInRec;
  });

  const relatedDoseRules = doseRules.filter(dr =>
    relatedDrugs.some(d => d.id === dr.drug_id)
  );

  return (
    <Card className="border-2 border-slate-200 hover:border-purple-300 transition-all">
      <CardHeader
        className="bg-gradient-to-r from-slate-50 to-purple-50 border-b py-3 px-4 cursor-pointer"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge className="bg-purple-600 text-white text-xs">Oncology</Badge>
              <Badge variant="outline" className={`text-xs ${priorityColor[guideline.status] || ""}`}>
                {guideline.status}
              </Badge>
              {guideline.institutional_standard && (
                <Badge className="bg-amber-500 text-white text-xs flex items-center gap-1">
                  <Star className="w-3 h-3" /> Institutional Standard
                </Badge>
              )}
              {guideline.review_status === "AI_GENERATED" && (
                <Badge variant="outline" className="text-xs text-orange-600 border-orange-300 bg-orange-50">
                  AI Generated — Pending Expert Review
                </Badge>
              )}
              {guideline.review_status === "EXPERT_REVIEWED" && (
                <Badge variant="outline" className="text-xs text-green-600 border-green-300 bg-green-50">
                  Expert Reviewed
                </Badge>
              )}
            </div>
            <h3 className="font-bold text-slate-900 text-sm leading-snug">{guideline.title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{guideline.source} {guideline.year ? `· ${guideline.year}` : ""} {guideline.version ? `· ${guideline.version}` : ""}</p>
          </div>
          <Button variant="ghost" size="sm" className="flex-shrink-0 h-7 w-7 p-0">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
        {!expanded && (
          <p className="text-xs text-slate-600 mt-1 line-clamp-2">{guideline.summary}</p>
        )}
      </CardHeader>

      {expanded && (
        <CardContent className="p-4 space-y-4">
          <p className="text-sm text-slate-700 leading-relaxed">{guideline.summary}</p>

          {/* Risk stratification / algorithm */}
          {guideline.algorithm && (
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                <FlaskConical className="w-3.5 h-3.5" /> Risk Stratification — {guideline.algorithm.title}
              </h4>
              <div className="space-y-1.5">
                {guideline.algorithm.nodes?.filter(n => n.type !== "start").map(node => (
                  <div key={node.id} className={`flex items-start gap-2 p-2 rounded-lg text-xs border ${
                    node.color === "green" ? "bg-green-50 border-green-200" :
                    node.color === "orange" ? "bg-amber-50 border-amber-200" :
                    node.color === "red" ? "bg-red-50 border-red-200" :
                    node.color === "yellow" ? "bg-yellow-50 border-yellow-200" :
                    "bg-slate-50 border-slate-200"}`}>
                    <span className="font-semibold text-slate-800 flex-1">{node.text}</span>
                    {node.detail && <span className="text-slate-500 italic">{node.detail}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key recommendations */}
          {guideline.key_recommendations?.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Key Regimen Steps</h4>
              <ul className="space-y-1">
                {guideline.key_recommendations.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                    <span className="w-4 h-4 flex-shrink-0 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold text-xs">{i + 1}</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Drug regimens */}
          {relatedDoseRules.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Pill className="w-3.5 h-3.5" /> Drug Dose Rules
              </h4>
              <div className="space-y-2">
                {relatedDoseRules.map(dr => {
                  const drug = drugs.find(d => d.id === dr.drug_id);
                  return (
                    <div key={dr.id} className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-800">{drug?.generic_name?.replace(" (Oncology)", "") || "Unknown"}</span>
                        <Badge variant="outline" className="text-xs">{dr.dose_value} {dr.dose_unit}</Badge>
                        <span className="text-slate-500">{dr.frequency}</span>
                        <Badge variant="outline" className="text-xs">{dr.route}</Badge>
                      </div>
                      {dr.description && <p className="text-slate-600 mt-1">{dr.description}</p>}
                      {dr.indication && <p className="text-purple-700 mt-0.5 italic">{dr.indication}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pearls */}
          {guideline.practice_pearls?.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <h4 className="text-xs font-bold text-amber-800 mb-2 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Practice Pearls
              </h4>
              <ul className="space-y-1">
                {guideline.practice_pearls.map((p, i) => (
                  <li key={i} className="text-xs text-amber-800">• {p}</li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-xs text-amber-700 bg-amber-50 rounded p-2 border border-amber-200">
            ⚠️ Decision-support only. Verify all doses against your institutional protocol. Not a substitute for clinical judgment.
          </p>
        </CardContent>
      )}
    </Card>
  );
}