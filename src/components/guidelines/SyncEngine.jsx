import React, { useState, useEffect } from "react";
import { base44 } from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  RefreshCw, Globe, CheckCircle, AlertCircle, Loader2,
  Bell, Download, ArrowRight, Zap, Clock
} from "lucide-react";
import { toast } from "sonner";

const SOURCES = ["KDIGO", "IPNA", "ESPN", "ERKNet", "ISPN", "AAP", "ESPGHAN", "PubMed"];

const DIFF_COLORS = {
  new:     "bg-green-100 text-green-800 border-green-300",
  updated: "bg-blue-100 text-blue-800 border-blue-300",
  changed: "bg-amber-100 text-amber-800 border-amber-300",
  removed: "bg-red-100 text-red-800 border-red-300",
};

function DiffHighlight({ type, text }) {
  return (
    <span className={`inline-block text-xs px-1.5 py-0.5 rounded border font-medium mr-1 ${DIFF_COLORS[type] || DIFF_COLORS.updated}`}>
      {type === "new" ? "NEW" : type === "updated" ? "UPDATED" : type === "changed" ? "CHANGED" : "REMOVED"}: {text}
    </span>
  );
}

export default function SyncEngine({ onImportComplete }) {
  const [syncMode, setSyncMode] = useState("manual");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState([]);
  const [lastSync, setLastSync] = useState(() => {
    try { return localStorage.getItem("gl_last_sync") || null; } catch { return null; }
  });
  const queryClient = useQueryClient();

  const syncMutation = useMutation({
    mutationFn: async () => {
      toast.loading("Scanning guideline sources…", { id: "sync" });
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Search for the latest (2023-2026) pediatric nephrology clinical guideline updates. Focus on:
- KDIGO: AKI, CKD, Hypertension, Transplant, Glomerulonephritis
- IPNA: Nephrotic syndrome, HUS, CAKUT
- ESPN: PD, HD, renal nutrition
- ERKNet/ESPGHAN: rare kidney disease, tubular disorders
- AAP: UTI, hypertension in children

For each identified update, specify:
- What changed (new recommendation, revised threshold, new drug, removed recommendation)
- Clinical significance
- Affected systems in a clinical app (pathways/drugs/calculators/hypertension module/prescriptions)
- Official URL if known
- Change type: new / updated / changed / removed`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            updates: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  organization: { type: "string" },
                  year: { type: "number" },
                  category: { type: "string" },
                  summary: { type: "string" },
                  what_changed: { type: "string" },
                  clinical_significance: { type: "string" },
                  affected_systems: { type: "array", items: { type: "string" } },
                  change_type: { type: "string" },
                  source_url: { type: "string" },
                  is_new: { type: "boolean" }
                }
              }
            },
            sync_timestamp: { type: "string" }
          }
        }
      });
      return result.updates || [];
    },
    onSuccess: (data) => {
      setResults(data);
      const now = new Date().toLocaleString();
      setLastSync(now);
      try { localStorage.setItem("gl_last_sync", now); } catch {}
      toast.success(`Found ${data.length} updates`, { id: "sync" });
    },
    onError: () => toast.error("Sync failed — check internet connection", { id: "sync" }),
  });

  const importMutation = useMutation({
    mutationFn: async (item) => {
      return base44.entities.Guideline.create({
        title: item.title,
        source: item.organization,
        year: item.year,
        category: item.category || "General",
        summary: item.summary,
        scope_and_population: item.summary,
        key_recommendations: [item.what_changed, item.clinical_significance].filter(Boolean),
        external_link: item.source_url || "",
        status: "Active",
        last_reviewed: new Date().toISOString().split("T")[0],
        evidence_level: "Moderate Quality Evidence",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guidelines"] });
      if (onImportComplete) onImportComplete();
    }
  });

  const toggleSelect = (idx) =>
    setSelected(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);

  const importSelected = async () => {
    toast.loading(`Importing ${selected.length} items…`, { id: "import-sel" });
    for (const idx of selected) await importMutation.mutateAsync(results[idx]);
    toast.success(`Imported ${selected.length} guidelines`, { id: "import-sel" });
    setSelected([]);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
          <RefreshCw className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-900">Auto-Sync Engine</p>
          <p className="text-xs text-slate-500">KDIGO · IPNA · ESPN · ERKNet · ISPN · AAP · ESPGHAN</p>
        </div>
        {lastSync && (
          <span className="text-xs text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" />{lastSync}</span>
        )}
      </div>

      {/* Sync mode */}
      <div className="flex items-center gap-2">
        <Select value={syncMode} onValueChange={setSyncMode}>
          <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="manual" className="text-xs">Manual</SelectItem>
            <SelectItem value="daily" className="text-xs">Daily (auto)</SelectItem>
            <SelectItem value="weekly" className="text-xs">Weekly (auto)</SelectItem>
          </SelectContent>
        </Select>
        <Button
          onClick={() => syncMutation.mutate()}
          disabled={syncMutation.isPending}
          className="flex-1 bg-blue-600 hover:bg-blue-700 h-8 text-xs"
        >
          {syncMutation.isPending
            ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Scanning sources…</>
            : <><Globe className="w-3.5 h-3.5 mr-1.5" />Scan for Updates</>}
        </Button>
      </div>

      {/* Source badges */}
      <div className="flex flex-wrap gap-1">
        {SOURCES.map(s => (
          <Badge key={s} variant="outline" className="text-xs bg-white">{s}</Badge>
        ))}
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-700">{results.length} updates found</p>
            {selected.length > 0 && (
              <Button size="sm" onClick={importSelected} disabled={importMutation.isPending}
                className="h-7 text-xs bg-green-600 hover:bg-green-700">
                <Download className="w-3 h-3 mr-1" />Import {selected.length}
              </Button>
            )}
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {results.map((item, idx) => (
              <div key={idx}
                onClick={() => toggleSelect(idx)}
                className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${selected.includes(idx) ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-white hover:border-blue-200"}`}>
                <div className="flex items-start gap-2">
                  <input type="checkbox" checked={selected.includes(idx)} onChange={() => {}} className="mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-1 mb-1">
                      <Badge className={`text-xs border ${DIFF_COLORS[item.change_type] || DIFF_COLORS.updated}`}>
                        {item.change_type?.toUpperCase() || "UPDATE"}
                      </Badge>
                      <Badge variant="outline" className="text-xs">{item.organization}</Badge>
                      {item.year && <Badge variant="outline" className="text-xs">{item.year}</Badge>}
                      {item.is_new && <Badge className="text-xs bg-green-600 text-white">NEW</Badge>}
                    </div>
                    <p className="text-xs font-bold text-slate-900 leading-snug">{item.title}</p>
                    {item.what_changed && (
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.what_changed}</p>
                    )}
                    {item.affected_systems?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        <span className="text-xs text-slate-400">Affects:</span>
                        {item.affected_systems.map((s, si) => (
                          <Badge key={si} className="text-xs bg-orange-100 text-orange-700 border-0">{s}</Badge>
                        ))}
                      </div>
                    )}
                    {item.source_url && (
                      <a href={item.source_url} target="_blank" rel="noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="text-xs text-blue-600 hover:underline mt-1 inline-flex items-center gap-0.5">
                        View source <ArrowRight className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!syncMutation.isPending && results.length === 0 && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
          <Zap className="w-7 h-7 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-500">Click "Scan for Updates" to check KDIGO, IPNA, ESPN, ERKNet and other sources for the latest guidelines.</p>
        </div>
      )}
    </div>
  );
}