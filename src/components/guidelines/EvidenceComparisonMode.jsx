import React, { useState } from "react";
import { base44 } from "@/api/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, Scale, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { auditGuideline } from "@/lib/guidelines/index";

export default function EvidenceComparisonMode({ allGuidelines }) {
  const [leftId, setLeftId] = useState("");
  const [rightId, setRightId] = useState("");
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);

  const leftG = allGuidelines.find(g => g.id === leftId);
  const rightG = allGuidelines.find(g => g.id === rightId);

  const runComparison = async () => {
    if (!leftG || !rightG) { toast.error("Select two guidelines to compare"); return; }
    setLoading(true);
    setComparison(null);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Compare these two pediatric nephrology clinical guidelines as a fellowship-level academic analysis:

GUIDELINE A: ${leftG.title} (${leftG.source} ${leftG.year})
Summary: ${leftG.scope_and_population || leftG.summary || ""}
Key steps: ${leftG.key_recommendations?.slice(0, 6).join("; ") || leftG.sections?.quick_summary?.immediate_management?.slice(0, 4).join("; ") || ""}

GUIDELINE B: ${rightG.title} (${rightG.source} ${rightG.year})
Summary: ${rightG.scope_and_population || rightG.summary || ""}
Key steps: ${rightG.key_recommendations?.slice(0, 6).join("; ") || rightG.sections?.quick_summary?.immediate_management?.slice(0, 4).join("; ") || ""}

Return a detailed comparison covering:
1. Key areas of agreement (3-5 points)
2. Key differences and controversies (3-5 points)
3. Which is more evidence-based and why
4. Clinical implication: which to follow in Indian/resource-limited setting
5. One sentence clinical recommendation for a pediatric nephrologist`,
        response_json_schema: {
          type: "object",
          properties: {
            agreements: { type: "array", items: { type: "string" } },
            differences: { type: "array", items: { type: "string" } },
            evidence_verdict: { type: "string" },
            clinical_implication: { type: "string" },
            recommendation: { type: "string" }
          }
        }
      });
      setComparison(result);
      toast.success("Comparison complete");
    } catch { toast.error("Comparison failed"); }
    finally { setLoading(false); }
  };

  const guidelineOptions = allGuidelines.filter(g => g.title);

  const renderHeader = (g) => {
    if (!g) return null;
    const audit = auditGuideline(g);
    return (
      <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
        <Badge className="text-xs bg-blue-600 text-white mb-1">{g.source}</Badge>
        <p className="text-sm font-bold text-slate-900 leading-tight">{g.title}</p>
        <p className="text-xs text-slate-500 mt-0.5">{g.year} · {g.category}</p>
        <div className="mt-1.5 flex-1 bg-slate-100 rounded-full h-1.5">
          <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${audit.pct}%` }} />
        </div>
        <p className="text-xs text-slate-400 mt-0.5">{audit.pct}% complete</p>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Scale className="w-5 h-5 text-indigo-600" />
        <div>
          <p className="text-sm font-bold text-slate-900">Evidence Comparison Mode</p>
          <p className="text-xs text-slate-500">Compare two guidelines side-by-side · AI-powered academic analysis</p>
        </div>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-xs font-semibold text-slate-600 mb-1">Guideline A</p>
          <Select value={leftId} onValueChange={setLeftId}>
            <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select…" /></SelectTrigger>
            <SelectContent>
              {guidelineOptions.map(g => (
                <SelectItem key={g.id} value={g.id} className="text-xs">{g.title.slice(0, 45)}{g.title.length > 45 ? "…" : ""}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-600 mb-1">Guideline B</p>
          <Select value={rightId} onValueChange={setRightId}>
            <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select…" /></SelectTrigger>
            <SelectContent>
              {guidelineOptions.map(g => (
                <SelectItem key={g.id} value={g.id} className="text-xs">{g.title.slice(0, 45)}{g.title.length > 45 ? "…" : ""}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Preview cards */}
      {(leftG || rightG) && (
        <div className="grid grid-cols-2 gap-2">
          {renderHeader(leftG)}
          {renderHeader(rightG)}
        </div>
      )}

      <Button
        onClick={runComparison}
        disabled={loading || !leftId || !rightId || leftId === rightId}
        className="w-full bg-indigo-600 hover:bg-indigo-700 h-9 text-sm"
      >
        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Comparing…</> : <><Sparkles className="w-4 h-4 mr-2" />AI Compare</>}
      </Button>

      {comparison && (
        <div className="space-y-3 border-t pt-4">
          {/* Agreements */}
          <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-xs font-bold text-green-800 mb-2 flex items-center gap-1">✅ Areas of Agreement</p>
            <ul className="space-y-1">
              {comparison.agreements?.map((a, i) => (
                <li key={i} className="text-xs text-green-800 flex items-start gap-1.5">
                  <ChevronRight className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />{a}
                </li>
              ))}
            </ul>
          </div>

          {/* Differences */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-xs font-bold text-amber-800 mb-2 flex items-center gap-1">⚡ Key Differences / Controversies</p>
            <ul className="space-y-1">
              {comparison.differences?.map((d, i) => (
                <li key={i} className="text-xs text-amber-800 flex items-start gap-1.5">
                  <ChevronRight className="w-3 h-3 text-amber-600 flex-shrink-0 mt-0.5" />{d}
                </li>
              ))}
            </ul>
          </div>

          {/* Verdict */}
          {comparison.evidence_verdict && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-xs font-bold text-blue-800 mb-1">🏆 Evidence Verdict</p>
              <p className="text-xs text-blue-800 leading-relaxed">{comparison.evidence_verdict}</p>
            </div>
          )}

          {/* Clinical implication */}
          {comparison.clinical_implication && (
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl">
              <p className="text-xs font-bold text-purple-800 mb-1">🇮🇳 Clinical Implication</p>
              <p className="text-xs text-purple-800 leading-relaxed">{comparison.clinical_implication}</p>
            </div>
          )}

          {/* Recommendation */}
          {comparison.recommendation && (
            <div className="p-3 bg-slate-900 rounded-xl">
              <p className="text-xs font-bold text-white mb-1">💡 Recommendation</p>
              <p className="text-xs text-slate-200 leading-relaxed italic">"{comparison.recommendation}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}