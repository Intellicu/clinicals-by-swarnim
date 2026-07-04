import React, { useState } from "react";
import { base44 } from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Upload, Loader2, CheckCircle, Sparkles, FileText,
  Globe, Edit, AlertTriangle, Eye
} from "lucide-react";
import { toast } from "sonner";

const EVIDENCE_LEVELS = ["High Quality Evidence", "Moderate Quality Evidence", "Low Quality Evidence", "Expert Opinion"];
const CATEGORIES = ["AKI", "CKD", "Nephrotic Syndrome", "Hypertension", "Electrolytes",
  "Acid-Base", "Dialysis", "Transplant", "Glomerular Diseases", "Infection", "Tubular Disorders", "Nutrition"];

function PreviewPanel({ data }) {
  if (!data) return null;
  return (
    <div className="p-3 bg-green-50 border-2 border-green-200 rounded-xl space-y-2">
      <div className="flex items-center gap-2">
        <CheckCircle className="w-4 h-4 text-green-600" />
        <p className="text-xs font-bold text-green-800">AI Extraction Preview</p>
      </div>
      <p className="text-sm font-bold text-slate-900">{data.title}</p>
      <div className="flex flex-wrap gap-1">
        {data.source && <Badge className="text-xs bg-blue-600 text-white">{data.source}</Badge>}
        {data.year && <Badge variant="outline" className="text-xs">{data.year}</Badge>}
        {data.category && <Badge className="text-xs bg-slate-100 text-slate-700">{data.category}</Badge>}
        {data.evidence_level && <Badge className="text-xs bg-green-100 text-green-700">{data.evidence_level}</Badge>}
      </div>
      <p className="text-xs text-slate-600 leading-relaxed">{data.scope_and_population}</p>
      {data.key_recommendations?.length > 0 && (
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Management Steps ({data.key_recommendations.length})</p>
          <ol className="space-y-0.5">
            {data.key_recommendations.slice(0, 5).map((r, i) => (
              <li key={i} className="text-xs text-slate-700 flex items-start gap-1.5">
                <span className="w-4 h-4 rounded-full bg-green-500 text-white text-xs flex items-center justify-center flex-shrink-0">{i + 1}</span>
                <span className="leading-relaxed">{r}</span>
              </li>
            ))}
            {data.key_recommendations.length > 5 && <li className="text-xs text-slate-400">+{data.key_recommendations.length - 5} more steps</li>}
          </ol>
        </div>
      )}
      {data.practice_pearls?.length > 0 && (
        <p className="text-xs text-amber-700 font-medium">💡 {data.practice_pearls.length} practice pearls extracted</p>
      )}
      {data.references_extracted?.length > 0 && (
        <p className="text-xs text-indigo-700 font-medium">📚 {data.references_extracted.length} references detected</p>
      )}
    </div>
  );
}

export default function AdvancedIngestion({ onSuccess }) {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [webUrl, setWebUrl] = useState("");
  const [manualData, setManualData] = useState({
    title: "", source: "", year: new Date().getFullYear(), category: "AKI",
    scope_and_population: "", key_recommendations: [""], practice_pearls: [""], evidence_level: "Expert Opinion", external_link: ""
  });
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: (data) => base44.entities.Guideline.create({
      ...data,
      key_recommendations: data.key_recommendations?.filter(r => r?.trim()) || [],
      practice_pearls: data.practice_pearls?.filter(p => p?.trim()) || [],
      status: "Active",
      last_reviewed: new Date().toISOString().split("T")[0],
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guidelines"] });
      setPreview(null);
      if (onSuccess) onSuccess();
      toast.success("Guideline saved to library!");
    },
    onError: () => toast.error("Failed to save"),
  });

  const extractFromFile = async (file) => {
    if (!file) return;
    setLoading(true);
    toast.loading("AI parsing document…", { id: "ingest" });
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const out = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert pediatric nephrology guideline parser. Extract ALL structured information from this clinical guideline document:

1. Basic info: title, source organization (KDIGO/IPNA/IAP/etc), publication year, clinical category
2. Scope: who this applies to, key population, clinical scenario (2-3 sentences)
3. Management steps: extract 8-15 SPECIFIC, NUMBERED, ACTIONABLE management recommendations with doses and thresholds where mentioned
4. Practice pearls: 5-8 bedside clinical tips
5. Drug table: detect any drug names, dosing, monitoring mentioned
6. Evidence statements: grade of recommendations mentioned
7. References: detect formal references or citations
8. Drug names: all medications mentioned
9. Evidence level: overall evidence quality
10. External link: if URL mentioned

Be thorough. Preserve numerical thresholds and specific drug doses.`,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            source: { type: "string" },
            year: { type: "number" },
            category: { type: "string" },
            scope_and_population: { type: "string" },
            key_recommendations: { type: "array", items: { type: "string" } },
            practice_pearls: { type: "array", items: { type: "string" } },
            evidence_level: { type: "string" },
            external_link: { type: "string" },
            related_drugs: { type: "array", items: { type: "string" } },
            references_extracted: { type: "array", items: { type: "string" } },
            summary: { type: "string" }
          }
        }
      });
      setPreview(out);
      toast.success("Extraction complete — review before saving", { id: "ingest" });
    } catch { toast.error("Extraction failed", { id: "ingest" }); }
    finally { setLoading(false); }
  };

  const extractFromWeb = async () => {
    if (!webUrl.trim()) { toast.error("Enter a URL"); return; }
    setLoading(true);
    toast.loading("Fetching and parsing web guideline…", { id: "web-ingest" });
    try {
      const out = await base44.integrations.Core.InvokeLLM({
        prompt: `Fetch and extract structured guideline information from this URL: ${webUrl}

Extract: title, source organization, year, category, scope, 8-15 management steps, practice pearls, evidence level, related drugs, references.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" }, source: { type: "string" }, year: { type: "number" },
            category: { type: "string" }, scope_and_population: { type: "string" },
            key_recommendations: { type: "array", items: { type: "string" } },
            practice_pearls: { type: "array", items: { type: "string" } },
            evidence_level: { type: "string" }, related_drugs: { type: "array", items: { type: "string" } },
            references_extracted: { type: "array", items: { type: "string" } }
          }
        }
      });
      setPreview({ ...out, external_link: webUrl });
      toast.success("Web guideline parsed!", { id: "web-ingest" });
    } catch { toast.error("Web fetch failed", { id: "web-ingest" }); }
    finally { setLoading(false); }
  };

  const upRec = (i, v) => { const u = [...manualData.key_recommendations]; u[i] = v; setManualData(d => ({ ...d, key_recommendations: u })); };
  const upPearl = (i, v) => { const u = [...manualData.practice_pearls]; u[i] = v; setManualData(d => ({ ...d, practice_pearls: u })); };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-5 h-5 text-blue-600" />
        <div>
          <p className="text-sm font-bold text-slate-900">Import & AI Ingestion Pipeline</p>
          <p className="text-xs text-slate-500">PDF · DOCX · Image · Web URL · Manual entry</p>
        </div>
      </div>

      <Tabs defaultValue="file">
        <TabsList className="grid w-full grid-cols-3 text-xs h-9">
          <TabsTrigger value="file"><Upload className="w-3.5 h-3.5 mr-1" />File</TabsTrigger>
          <TabsTrigger value="web"><Globe className="w-3.5 h-3.5 mr-1" />Web</TabsTrigger>
          <TabsTrigger value="manual"><Edit className="w-3.5 h-3.5 mr-1" />Manual</TabsTrigger>
        </TabsList>

        {/* File ingestion */}
        <TabsContent value="file" className="space-y-3 mt-3">
          <div className="border-2 border-dashed border-blue-200 rounded-xl p-5 bg-blue-50 text-center">
            <FileText className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-blue-800 mb-1">Upload Guideline Document</p>
            <p className="text-xs text-blue-600 mb-3">PDF · DOCX · PNG/JPG (paper scan) · Supports OCR</p>
            <input type="file" accept=".pdf,.docx,.png,.jpg,.jpeg" disabled={loading}
              onChange={e => { const f = e.target.files[0]; if (f) extractFromFile(f); }}
              className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-blue-600 file:text-white file:cursor-pointer disabled:opacity-50" />
            {loading && (
              <div className="mt-3 flex items-center justify-center gap-2 text-blue-700 text-xs">
                <Loader2 className="w-4 h-4 animate-spin" />AI OCR + Section Detection + Recommendation Extraction…
              </div>
            )}
          </div>
          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-800 flex items-start gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              AI detects: sections · algorithms · drug tables · evidence statements · references. Review before saving.
            </p>
          </div>
        </TabsContent>

        {/* Web ingestion */}
        <TabsContent value="web" className="space-y-3 mt-3">
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Guideline URL (PubMed, KDIGO, IPNA, etc.)</Label>
            <div className="flex gap-2">
              <Input value={webUrl} onChange={e => setWebUrl(e.target.value)}
                placeholder="https://kdigo.org/guidelines/..." className="text-xs h-9 flex-1" />
              <Button onClick={extractFromWeb} disabled={loading || !webUrl.trim()}
                className="h-9 bg-blue-600 hover:bg-blue-700 text-xs px-4">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Manual */}
        <TabsContent value="manual" className="space-y-3 mt-3">
          <div className="grid grid-cols-2 gap-2">
            <div><Label className="text-xs">Title *</Label><Input value={manualData.title} onChange={e => setManualData(d => ({ ...d, title: e.target.value }))} className="mt-1 text-xs h-8" /></div>
            <div><Label className="text-xs">Source *</Label><Input value={manualData.source} onChange={e => setManualData(d => ({ ...d, source: e.target.value }))} className="mt-1 text-xs h-8" /></div>
            <div>
              <Label className="text-xs">Category</Label>
              <select value={manualData.category} onChange={e => setManualData(d => ({ ...d, category: e.target.value }))}
                className="mt-1 w-full text-xs h-8 border border-slate-200 rounded-md px-2">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div><Label className="text-xs">Year</Label><Input type="number" value={manualData.year} onChange={e => setManualData(d => ({ ...d, year: parseInt(e.target.value) }))} className="mt-1 text-xs h-8" /></div>
          </div>
          <div>
            <Label className="text-xs font-semibold">Clinical Summary *</Label>
            <Textarea value={manualData.scope_and_population} onChange={e => setManualData(d => ({ ...d, scope_and_population: e.target.value }))}
              placeholder="Who / When / What — 2–3 sentences" className="mt-1 text-xs h-16" />
          </div>
          <div>
            <Label className="text-xs font-semibold">Management Steps (aim 8–12)</Label>
            <div className="space-y-1.5 mt-1">
              {manualData.key_recommendations.map((r, i) => (
                <div key={i} className="flex gap-1.5">
                  <span className="w-6 h-7 bg-green-600 text-white text-xs rounded flex items-center justify-center flex-shrink-0">{i + 1}</span>
                  <Input value={r} onChange={e => upRec(i, e.target.value)} className="flex-1 text-xs h-7" placeholder="Specific step…" />
                  <button onClick={() => setManualData(d => ({ ...d, key_recommendations: d.key_recommendations.filter((_, j) => j !== i) }))}
                    className="text-slate-400 hover:text-red-500 text-xs px-1">✕</button>
                </div>
              ))}
              <button onClick={() => setManualData(d => ({ ...d, key_recommendations: [...d.key_recommendations, ""] }))}
                className="w-full text-xs text-blue-600 border border-dashed border-blue-300 rounded py-1 hover:bg-blue-50">+ Add Step</button>
            </div>
          </div>
          <Button onClick={() => setPreview(manualData)} disabled={!manualData.title || !manualData.source}
            variant="outline" className="w-full h-8 text-xs">
            <Eye className="w-3.5 h-3.5 mr-1" />Preview Before Saving
          </Button>
        </TabsContent>
      </Tabs>

      {/* Preview */}
      {preview && !loading && (
        <div className="space-y-3">
          <PreviewPanel data={preview} />
          <div className="flex gap-2">
            <Button onClick={() => setPreview(null)} variant="outline" className="flex-1 h-9 text-xs">
              Discard
            </Button>
            <Button onClick={() => saveMutation.mutate(preview)} disabled={saveMutation.isPending}
              className="flex-1 h-9 text-xs bg-green-600 hover:bg-green-700">
              {saveMutation.isPending ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Saving…</> : <><CheckCircle className="w-3.5 h-3.5 mr-1.5" />Save to Library</>}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}