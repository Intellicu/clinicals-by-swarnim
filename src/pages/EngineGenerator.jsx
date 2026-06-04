import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Cpu, Plus, Trash2, Pencil, Sparkles, Globe, FileUp,
  CheckCircle, AlertCircle, Loader2, X, ChevronDown, ChevronUp, Search
} from "lucide-react";
import { toast } from "sonner";

const GROUPS = [
  "Emergency & Electrolytes", "Glomerular Disease", "CKD & Genetics",
  "CAKUT & Urology", "Tubular & Metabolic", "Hypertension",
  "RRT & Dialysis", "Nutrition & Diet", "Rheumatology", "General Pediatrics"
];

const EMPTY_ENGINE = {
  label: "", desc: "", scenario: "", group: "Tubular & Metabolic",
  tags: [], summary: "", keys: [], references: "", is_active: true
};

function EngineForm({ engine, onChange }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs font-semibold">Engine Label *</Label>
          <Input value={engine.label} onChange={e => onChange({ ...engine, label: e.target.value })}
            placeholder="e.g. Rickets Engine" className="mt-1 text-sm" />
        </div>
        <div>
          <Label className="text-xs font-semibold">Scenario ID *</Label>
          <Input value={engine.scenario} onChange={e => onChange({ ...engine, scenario: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
            placeholder="e.g. rickets-engine" className="mt-1 text-sm font-mono" />
          <p className="text-xs text-slate-400 mt-0.5">Used in URL: ?scenario=your-id</p>
        </div>
      </div>
      <div>
        <Label className="text-xs font-semibold">Short Description</Label>
        <Input value={engine.desc} onChange={e => onChange({ ...engine, desc: e.target.value })}
          placeholder="e.g. Calcipenic vs Phosphopenic — VDDR · XLH · Burosumab" className="mt-1 text-sm" />
      </div>
      <div>
        <Label className="text-xs font-semibold">Group</Label>
        <Select value={engine.group} onValueChange={v => onChange({ ...engine, group: v })}>
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>{GROUPS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs font-semibold">Summary (for pathway card)</Label>
        <Textarea value={engine.summary} onChange={e => onChange({ ...engine, summary: e.target.value })}
          placeholder="Full algorithm overview..." className="mt-1 text-sm h-16 resize-none" />
      </div>
      <div>
        <Label className="text-xs font-semibold">Key Points (one per line)</Label>
        <Textarea value={(engine.keys || []).join("\n")} onChange={e => onChange({ ...engine, keys: e.target.value.split("\n") })}
          placeholder="Key point 1&#10;Key point 2" className="mt-1 text-sm h-20 resize-none" />
      </div>
      <div>
        <Label className="text-xs font-semibold">Search Tags (comma separated)</Label>
        <Input value={(engine.tags || []).join(", ")} onChange={e => onChange({ ...engine, tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })}
          placeholder="rickets, XLH, vitamin D, phosphate" className="mt-1 text-sm" />
      </div>
      <div>
        <Label className="text-xs font-semibold">References / Guidelines</Label>
        <Input value={engine.references || ""} onChange={e => onChange({ ...engine, references: e.target.value })}
          placeholder="e.g. IAP STG 2022, KDIGO 2024" className="mt-1 text-sm" />
      </div>
    </div>
  );
}

export default function EngineGenerator() {
  const [engines, setEngines] = useState(() => {
    try { return JSON.parse(localStorage.getItem("custom_engines_registry") || "[]"); } catch { return []; }
  });
  const [modal, setModal] = useState(null); // null | { mode: "add"|"edit", idx?, engine }
  const [aiMode, setAiMode] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiDocText, setAiDocText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me(), staleTime: 60000 });
  const isAdmin = user?.role === "admin";

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <Card className="max-w-sm w-full border-red-200">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="font-semibold text-slate-800">Admin Access Required</p>
            <p className="text-sm text-slate-500 mt-1">This page is restricted to admin users only.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const save = (updated) => {
    setEngines(updated);
    localStorage.setItem("custom_engines_registry", JSON.stringify(updated));
  };

  const handleSave = () => {
    if (!modal.engine.label.trim() || !modal.engine.scenario.trim()) {
      toast.error("Label and Scenario ID are required");
      return;
    }
    if (modal.mode === "add") {
      save([...engines, modal.engine]);
      toast.success("Engine added successfully");
    } else {
      const updated = [...engines];
      updated[modal.idx] = modal.engine;
      save(updated);
      toast.success("Engine updated");
    }
    setModal(null);
  };

  const handleDelete = (idx) => {
    if (!confirm("Delete this engine?")) return;
    save(engines.filter((_, i) => i !== idx));
    toast.success("Engine deleted");
  };

  const generateWithAI = async () => {
    if (!aiTopic.trim()) { toast.error("Enter a topic first"); return; }
    setAiLoading(true);
    try {
      const prompt = `You are a clinical engine configuration generator for a pediatric nephrology app.
Generate a structured engine configuration for the following clinical topic:

Topic: ${aiTopic}
${aiDocText ? `\nAdditional context / document content:\n${aiDocText.substring(0, 3000)}` : ""}

Return a JSON object with EXACTLY these fields:
{
  "label": "Short engine name (3-5 words)",
  "desc": "One-line description of what the engine covers",
  "scenario": "url-slug-lowercase-with-hyphens",
  "group": "One of: Emergency & Electrolytes, Glomerular Disease, CKD & Genetics, CAKUT & Urology, Tubular & Metabolic, Hypertension, RRT & Dialysis, Nutrition & Diet, Rheumatology, General Pediatrics",
  "summary": "2-3 sentence clinical summary of the algorithm",
  "keys": ["Key clinical point 1", "Key clinical point 2", "Key clinical point 3", "Key clinical point 4"],
  "tags": ["search", "tag1", "tag2", "tag3", "tag4"],
  "references": "Main guideline sources"
}

Return ONLY valid JSON, no explanation.`;

      const response = await base44.integrations.Core.InvokeLLM({ prompt, response_json_schema: {
        type: "object",
        properties: {
          label: { type: "string" }, desc: { type: "string" }, scenario: { type: "string" },
          group: { type: "string" }, summary: { type: "string" },
          keys: { type: "array", items: { type: "string" } },
          tags: { type: "array", items: { type: "string" } },
          references: { type: "string" }
        }
      }});

      const parsed = typeof response === "string" ? JSON.parse(response) : response;
      setModal({ mode: "add", engine: { ...EMPTY_ENGINE, ...parsed, is_active: true } });
      setAiMode(false);
      toast.success("AI generated engine config — review and save");
    } catch (err) {
      toast.error("AI generation failed: " + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleDocUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      setAiDocText(text.substring(0, 5000));
      toast.success("Document loaded — AI will use it for context");
    } catch {
      toast.error("Could not read file");
    }
    e.target.value = "";
  };

  const filtered = engines.filter(eng =>
    !search || eng.label?.toLowerCase().includes(search.toLowerCase()) ||
    eng.desc?.toLowerCase().includes(search.toLowerCase()) ||
    (eng.tags || []).some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-3xl mx-auto px-4 py-5 space-y-5">

        {/* Header */}
        <div className="rounded-2xl bg-gradient-to-r from-violet-700 to-indigo-700 p-5 text-white">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Cpu className="w-6 h-6" />
              <div>
                <h1 className="text-lg font-bold">Engine Generator</h1>
                <p className="text-violet-200 text-xs">Admin tool — Add, edit & delete clinical intelligence engines</p>
              </div>
            </div>
            <Badge className="bg-white/20 text-white text-xs border border-white/30">{engines.length} Custom</Badge>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => setModal({ mode: "add", engine: { ...EMPTY_ENGINE } })}
            className="bg-violet-600 hover:bg-violet-700 gap-1.5 text-sm">
            <Plus className="w-4 h-4" /> Add Engine Manually
          </Button>
          <Button onClick={() => setAiMode(v => !v)} variant="outline"
            className="border-violet-300 text-violet-700 hover:bg-violet-50 gap-1.5 text-sm">
            <Sparkles className="w-4 h-4" /> {aiMode ? "Hide" : "Generate with AI"}
          </Button>
        </div>

        {/* AI Generation Panel */}
        {aiMode && (
          <Card className="border-violet-200 bg-violet-50">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm flex items-center gap-2 text-violet-900">
                <Sparkles className="w-4 h-4" /> AI Engine Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              <div>
                <Label className="text-xs font-semibold text-violet-800">Clinical Topic *</Label>
                <Input value={aiTopic} onChange={e => setAiTopic(e.target.value)}
                  placeholder="e.g. Bartter Syndrome, Neonatal Rickets, ANCA Vasculitis..."
                  className="mt-1 bg-white border-violet-200 text-sm" />
              </div>
              <div>
                <Label className="text-xs font-semibold text-violet-800">Paste guideline / document text (optional)</Label>
                <Textarea value={aiDocText} onChange={e => setAiDocText(e.target.value)}
                  placeholder="Paste extracted text from a PDF guideline, abstract, or any clinical document..."
                  className="mt-1 bg-white border-violet-200 text-sm h-24 resize-none" />
              </div>
              <div className="flex gap-2 items-center">
                <label className="flex items-center gap-1.5 cursor-pointer px-3 py-2 border border-violet-300 rounded-lg bg-white text-xs font-medium text-violet-700 hover:bg-violet-50">
                  <FileUp className="w-3.5 h-3.5" /> Upload Doc
                  <input type="file" accept=".txt,.md,.csv" className="hidden" onChange={handleDocUpload} />
                </label>
                <span className="text-xs text-violet-500">or paste above</span>
              </div>
              <Button onClick={generateWithAI} disabled={aiLoading}
                className="w-full bg-violet-700 hover:bg-violet-800 gap-2">
                {aiLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate Engine Config</>}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Search */}
        {engines.length > 0 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <Input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search engines..." className="pl-9 bg-white" />
          </div>
        )}

        {/* Engine List */}
        {engines.length === 0 ? (
          <Card className="border-dashed border-2 border-slate-200">
            <CardContent className="p-8 text-center">
              <Cpu className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No custom engines yet</p>
              <p className="text-slate-400 text-sm mt-1">Add engines manually or generate with AI above</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-slate-500 font-medium">{filtered.length} engine{filtered.length !== 1 ? "s" : ""}</p>
            {filtered.map((eng, idx) => (
              <Card key={idx} className="border-violet-200 border-l-4 border-l-violet-500">
                <CardContent className="p-0">
                  <button onClick={() => setExpanded(expanded === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-3 text-left">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Cpu className="w-4 h-4 text-violet-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-slate-800 truncate">{eng.label}</p>
                        <p className="text-xs text-slate-400 truncate">{eng.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                      <Badge variant="outline" className="text-xs">{eng.group}</Badge>
                      {expanded === idx ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </button>
                  {expanded === idx && (
                    <div className="border-t border-slate-100 px-3 pb-3 pt-2 space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div><span className="font-semibold text-slate-500">Scenario ID: </span><span className="font-mono text-violet-700">{eng.scenario}</span></div>
                        <div><span className="font-semibold text-slate-500">References: </span><span className="text-slate-600">{eng.references || "—"}</span></div>
                      </div>
                      {eng.summary && <p className="text-xs text-slate-600 italic">{eng.summary}</p>}
                      {(eng.keys || []).filter(k => k.trim()).length > 0 && (
                        <ul className="space-y-0.5">
                          {eng.keys.filter(k => k.trim()).map((k, j) => (
                            <li key={j} className="text-xs text-slate-700 flex gap-1.5"><span className="text-violet-400">→</span>{k}</li>
                          ))}
                        </ul>
                      )}
                      {(eng.tags || []).length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {eng.tags.map((t, j) => <Badge key={j} variant="outline" className="text-xs py-0">{t}</Badge>)}
                        </div>
                      )}
                      <div className="flex gap-2 pt-1">
                        <Button size="sm" variant="outline" className="text-xs border-amber-200 text-amber-700 hover:bg-amber-50 h-7"
                          onClick={() => setModal({ mode: "edit", idx, engine: { ...eng, keys: [...(eng.keys || [])], tags: [...(eng.tags || [])] } })}>
                          <Pencil className="w-3 h-3 mr-1" /> Edit
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs border-red-200 text-red-600 hover:bg-red-50 h-7"
                          onClick={() => handleDelete(idx)}>
                          <Trash2 className="w-3 h-3 mr-1" /> Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Info card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-3">
            <div className="flex gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-blue-800 space-y-0.5">
                <p className="font-semibold">How engines appear in the app</p>
                <p>Custom engines are stored locally and appear in the Intelligence Engines tab (ClinicalSupport → Engines). The scenario ID links to the engine component via the URL parameter <span className="font-mono bg-blue-100 px-1 rounded">?scenario=your-id</span>.</p>
                <p className="mt-1">To wire a custom engine to a full React component, add the scenario ID to the <span className="font-mono bg-blue-100 px-1 rounded">PathwayRenderer</span> component.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-3 pb-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-violet-600" />
                {modal.mode === "add" ? "Add New Engine" : "Edit Engine"}
              </h3>
              <button onClick={() => setModal(null)} className="p-1 text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4">
              <EngineForm engine={modal.engine} onChange={eng => setModal(m => ({ ...m, engine: eng }))} />
              <div className="flex gap-2 mt-4">
                <Button onClick={handleSave} className="flex-1 bg-violet-600 hover:bg-violet-700 gap-1.5">
                  <CheckCircle className="w-4 h-4" /> Save Engine
                </Button>
                <Button onClick={() => setModal(null)} variant="outline">Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}