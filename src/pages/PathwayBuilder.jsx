import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft, Sparkles, Globe, Upload, Loader2, Plus, Trash2,
  Pencil, Check, X, ChevronDown, ChevronUp, GitBranch, Search,
  FileText, Save, RotateCcw, Info
} from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

// ── Colors ────────────────────────────────────────────────────────────────────
const COLOR_OPTIONS = [
  { id: "blue", label: "Blue", bg: "bg-blue-500" },
  { id: "teal", label: "Teal", bg: "bg-teal-500" },
  { id: "green", label: "Green", bg: "bg-green-500" },
  { id: "violet", label: "Violet", bg: "bg-violet-500" },
  { id: "amber", label: "Amber", bg: "bg-amber-400" },
  { id: "rose", label: "Rose", bg: "bg-rose-500" },
];

const COLOR_MAP = {
  blue: { badge: "bg-blue-100 text-blue-800", header: "bg-blue-50 border-blue-200" },
  teal: { badge: "bg-teal-100 text-teal-800", header: "bg-teal-50 border-teal-200" },
  green: { badge: "bg-green-100 text-green-800", header: "bg-green-50 border-green-200" },
  violet: { badge: "bg-violet-100 text-violet-800", header: "bg-violet-50 border-violet-200" },
  amber: { badge: "bg-amber-100 text-amber-800", header: "bg-amber-50 border-amber-200" },
  rose: { badge: "bg-rose-100 text-rose-800", header: "bg-rose-50 border-rose-200" },
};

const EMPTY_PATHWAY = {
  name: "", full: "", badge: "", color: "blue",
  overview: "", criteria: "", danger_signs: "", management: "", monitoring: "", references: "",
};

// ── Collapsible section in card view ──────────────────────────────────────────
function SectionBlock({ title, items, isList = true }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-50 hover:bg-slate-100 text-left">
        <span className="font-semibold text-sm text-slate-800">{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && (
        <div className="p-3 bg-white">
          {isList ? (
            <ul className="space-y-1.5">
              {items.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                  <span className="text-indigo-400 font-bold min-w-[18px] mt-0.5">{i + 1}.</span>{item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-700 leading-relaxed">{items}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Pathway Card ──────────────────────────────────────────────────────────────
function PathwayCard({ pathway, onEdit, onDelete }) {
  const c = COLOR_MAP[pathway.color] || COLOR_MAP.blue;
  return (
    <Card className="bg-white border border-slate-200 shadow-sm">
      <CardHeader className={`border-b py-3 px-4 ${c.header}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm leading-snug">{pathway.full || pathway.name}</CardTitle>
            {pathway.badge && <Badge className={`${c.badge} mt-1.5 text-xs`}>{pathway.badge}</Badge>}
          </div>
          <div className="flex gap-1.5 flex-shrink-0">
            <Button size="sm" variant="outline" onClick={() => onEdit(pathway)}
              className="h-7 px-2 border-blue-200 text-blue-700 hover:bg-blue-50">
              <Pencil className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => onDelete(pathway.id)}
              className="h-7 px-2 border-red-200 text-red-600 hover:bg-red-50">
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 space-y-2">
        {pathway.overview && <SectionBlock title="Overview" items={pathway.overview} isList={false} />}
        {pathway.criteria?.length > 0 && <SectionBlock title="📋 Criteria / Features" items={pathway.criteria} />}
        {pathway.danger_signs?.length > 0 && <SectionBlock title="🚨 Danger Signs" items={pathway.danger_signs} />}
        {pathway.management?.length > 0 && <SectionBlock title="🩺 Management" items={pathway.management} />}
        {pathway.monitoring?.length > 0 && <SectionBlock title="📊 Monitoring" items={pathway.monitoring} />}
        {pathway.references?.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {pathway.references.map((r, i) => <Badge key={i} variant="outline" className="text-xs">{r}</Badge>)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Edit / Add Modal ──────────────────────────────────────────────────────────
function EditModal({ pathway, onSave, onClose }) {
  const isNew = !pathway?.id;
  const [data, setData] = useState({
    ...EMPTY_PATHWAY,
    ...(pathway || {}),
    criteria: Array.isArray(pathway?.criteria) ? pathway.criteria.join('\n') : pathway?.criteria || "",
    danger_signs: Array.isArray(pathway?.danger_signs) ? pathway.danger_signs.join('\n') : pathway?.danger_signs || "",
    management: Array.isArray(pathway?.management) ? pathway.management.join('\n') : pathway?.management || "",
    monitoring: Array.isArray(pathway?.monitoring) ? pathway.monitoring.join('\n') : pathway?.monitoring || "",
    references: Array.isArray(pathway?.references) ? pathway.references.join('\n') : pathway?.references || "",
  });

  const handleSave = () => {
    if (!data.name.trim()) { toast.error("Short name is required"); return; }
    onSave({
      ...data,
      id: pathway?.id || `custom_${Date.now()}`,
      criteria: data.criteria.split('\n').filter(s => s.trim()),
      danger_signs: data.danger_signs.split('\n').filter(s => s.trim()),
      management: data.management.split('\n').filter(s => s.trim()),
      monitoring: data.monitoring.split('\n').filter(s => s.trim()),
      references: data.references.split('\n').filter(s => s.trim()),
    });
  };

  const fields = [
    { label: "Overview", key: "overview", rows: 3, placeholder: "Brief overview of this condition/pathway..." },
    { label: "Criteria / Diagnostic Features (one per line)", key: "criteria", rows: 4, placeholder: "Criterion 1\nCriterion 2..." },
    { label: "Danger Signs / Red Flags (one per line)", key: "danger_signs", rows: 3, placeholder: "Red flag 1\nRed flag 2..." },
    { label: "Management Steps (one per line)", key: "management", rows: 6, placeholder: "Step 1\nStep 2..." },
    { label: "Monitoring (one per line)", key: "monitoring", rows: 3, placeholder: "Monitor 1\nMonitor 2..." },
    { label: "References (one per line)", key: "references", rows: 2, placeholder: "WHO 2024\nIAP 2023..." },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 px-3 pb-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50 rounded-t-2xl sticky top-0">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Pencil className="w-4 h-4 text-blue-600" />
            {isNew ? "Add New Pathway" : "Edit Pathway"}
          </h3>
          <button onClick={onClose}><X className="w-4 h-4 text-slate-400" /></button>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs font-semibold text-slate-600">Short Name *</Label>
              <Input value={data.name} onChange={e => setData(d => ({ ...d, name: e.target.value }))}
                placeholder="e.g. Kawasaki Disease" className="mt-1 h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600">Badge Label</Label>
              <Input value={data.badge} onChange={e => setData(d => ({ ...d, badge: e.target.value }))}
                placeholder="e.g. Vasculitis" className="mt-1 h-8 text-sm" />
            </div>
          </div>
          <div>
            <Label className="text-xs font-semibold text-slate-600">Full Title</Label>
            <Input value={data.full} onChange={e => setData(d => ({ ...d, full: e.target.value }))}
              placeholder="Full descriptive pathway title" className="mt-1 h-8 text-sm" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-slate-600">Color Theme</Label>
            <div className="flex gap-2 mt-1.5">
              {COLOR_OPTIONS.map(c => (
                <button key={c.id} onClick={() => setData(d => ({ ...d, color: c.id }))}
                  className={`w-7 h-7 rounded-full ${c.bg} border-2 transition-all ${data.color === c.id ? "border-slate-800 scale-110" : "border-transparent opacity-60"}`} />
              ))}
            </div>
          </div>
          {fields.map(f => (
            <div key={f.key}>
              <Label className="text-xs font-semibold text-slate-600">{f.label}</Label>
              <Textarea value={data[f.key]} onChange={e => setData(d => ({ ...d, [f.key]: e.target.value }))}
                rows={f.rows} placeholder={f.placeholder} className="mt-1 text-xs resize-y" />
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} size="sm" className="bg-blue-600 hover:bg-blue-700 flex-1">
              <Check className="w-3.5 h-3.5 mr-1" />{isNew ? "Add Pathway" : "Save Changes"}
            </Button>
            <Button onClick={onClose} size="sm" variant="outline">Cancel</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── AI Generator Panel ────────────────────────────────────────────────────────
function AIGenerator({ onGenerated }) {
  const [mode, setMode] = useState("web");
  const [topic, setTopic] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const generate = async () => {
    if (!topic.trim() && !file) { toast.error("Enter a topic or upload a document"); return; }
    setLoading(true); setPreview(null);
    toast.info("AI generating pathway — 30–60 seconds…");
    try {
      let fileUrls = [];
      if (file) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        fileUrls = [file_url];
      }
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a pediatric specialist. Generate a comprehensive clinical pathway for: "${topic || 'the uploaded document topic'}".
Return valid JSON with these exact fields:
- name: short pathway name (string)
- full: full descriptive title (string)
- badge: category badge (string, e.g. "Emergency", "Nephrotic", "Infectious")
- color: one of [blue, teal, green, violet, amber, rose]
- overview: 2-3 sentence overview paragraph
- criteria: array of diagnostic criteria/features (8-12 items)
- danger_signs: array of red flag signs (5-8 items)
- management: array of management steps in order (10-15 items, numbered protocol)
- monitoring: array of monitoring parameters (6-10 items)
- references: array of guideline references (3-5 items, e.g. "KDIGO 2024", "IAP 2023")`,
        file_urls: fileUrls.length ? fileUrls : undefined,
        add_context_from_internet: mode === "web" && !file,
        model: "claude_sonnet_4_6",
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" }, full: { type: "string" }, badge: { type: "string" }, color: { type: "string" },
            overview: { type: "string" },
            criteria: { type: "array", items: { type: "string" } },
            danger_signs: { type: "array", items: { type: "string" } },
            management: { type: "array", items: { type: "string" } },
            monitoring: { type: "array", items: { type: "string" } },
            references: { type: "array", items: { type: "string" } },
          }
        }
      });
      setPreview({ ...res, id: `ai_${Date.now()}` });
    } catch (e) {
      toast.error("Generation failed: " + (e.message || "unknown error"));
    }
    setLoading(false);
  };

  const accept = () => {
    if (preview) { onGenerated(preview); setPreview(null); setTopic(""); setFile(null); }
  };

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-violet-50 to-indigo-50 border-2 border-violet-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-violet-600" />
          <h3 className="text-sm font-bold text-violet-900">AI Pathway Generator</h3>
          <Badge className="bg-violet-100 text-violet-700 text-xs">Claude Sonnet · Uses AI Credits</Badge>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-2">
          {[
            { id: "web", icon: Globe, label: "Web Search" },
            { id: "file", icon: Upload, label: "Upload Document" },
          ].map(m => (
            <button key={m.id} onClick={() => setMode(m.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold border transition-colors ${mode === m.id ? "bg-violet-600 text-white border-violet-600" : "bg-white text-slate-600 border-slate-200 hover:bg-violet-50"}`}>
              <m.icon className="w-3.5 h-3.5" />{m.label}
            </button>
          ))}
        </div>

        <div>
          <Label className="text-xs font-semibold text-slate-600">Topic / Condition Name</Label>
          <Input value={topic} onChange={e => setTopic(e.target.value)}
            placeholder="e.g. Kawasaki Disease, Neonatal Sepsis, Nephrotic Syndrome…"
            className="mt-1 h-9 text-sm bg-white" />
        </div>

        {mode === "file" && (
          <div>
            <Label className="text-xs font-semibold text-slate-600">Upload Guideline / Paper (PDF / Image)</Label>
            <div className="mt-1">
              <input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" id="ai-doc-upload" className="hidden"
                onChange={e => setFile(e.target.files?.[0] || null)} />
              <label htmlFor="ai-doc-upload"
                className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold border-2 border-dashed border-violet-300 text-violet-700 rounded-lg bg-white hover:bg-violet-50 transition-colors w-full justify-center">
                <FileText className="w-4 h-4" />
                {file ? file.name : "Choose PDF, Image or Word document"}
              </label>
            </div>
          </div>
        )}

        <Button onClick={generate} disabled={loading || (!topic.trim() && !file)}
          className="w-full bg-violet-600 hover:bg-violet-700 text-white h-10">
          {loading
            ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating pathway…</>
            : <><Sparkles className="w-4 h-4 mr-2" />Generate Clinical Pathway with AI</>}
        </Button>
      </div>

      {/* Preview */}
      {preview && (
        <div className="border-2 border-green-300 rounded-xl overflow-hidden">
          <div className="bg-green-50 px-4 py-3 flex items-center justify-between">
            <p className="text-sm font-bold text-green-800">✓ Pathway Generated — Review & Save</p>
            <div className="flex gap-2">
              <Button size="sm" onClick={accept} className="bg-green-600 hover:bg-green-700 text-white h-8 text-xs">
                <Save className="w-3.5 h-3.5 mr-1" /> Save Pathway
              </Button>
              <Button size="sm" variant="outline" onClick={() => setPreview(null)}
                className="h-8 text-xs border-red-200 text-red-600">
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
          <div className="p-4 space-y-3 bg-white">
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Title</p>
              <p className="text-sm font-bold text-slate-900">{preview.full || preview.name}</p>
              {preview.badge && <Badge className="mt-1 text-xs">{preview.badge}</Badge>}
            </div>
            {preview.overview && (
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">Overview</p>
                <p className="text-xs text-slate-700 leading-relaxed">{preview.overview}</p>
              </div>
            )}
            {preview.management?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">Management ({preview.management.length} steps)</p>
                <ul className="space-y-1">
                  {preview.management.slice(0, 4).map((s, i) => (
                    <li key={i} className="text-xs text-slate-700 flex gap-1.5">
                      <span className="text-violet-500 font-bold min-w-[16px]">{i + 1}.</span>{s}
                    </li>
                  ))}
                  {preview.management.length > 4 && (
                    <li className="text-xs text-slate-400">…and {preview.management.length - 4} more steps</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const STORAGE_KEY = "pathway_builder_v1";

export default function PathwayBuilder() {
  const [activeTab, setActiveTab] = useState("library");
  const [search, setSearch] = useState("");
  const [editingPathway, setEditingPathway] = useState(null);
  const [addingNew, setAddingNew] = useState(false);

  const [pathways, setPathways] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const save = (updated) => {
    setPathways(updated);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
  };

  const handleSave = (pathway) => {
    const exists = pathways.find(p => p.id === pathway.id);
    const updated = exists
      ? pathways.map(p => p.id === pathway.id ? pathway : p)
      : [...pathways, pathway];
    save(updated);
    setEditingPathway(null); setAddingNew(false);
    toast.success(exists ? "Pathway updated!" : "Pathway saved!");
  };

  const handleDelete = (id) => {
    if (!confirm("Delete this pathway?")) return;
    save(pathways.filter(p => p.id !== id));
    toast.success("Pathway deleted");
  };

  const handleAIGenerated = (pathway) => {
    save([...pathways, pathway]);
    setActiveTab("library");
    toast.success("AI pathway saved to library!");
  };

  const filtered = pathways.filter(p =>
    !search.trim() ||
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.full?.toLowerCase().includes(search.toLowerCase()) ||
    p.badge?.toLowerCase().includes(search.toLowerCase())
  );

  const tabs = [
    { id: "library", label: "My Pathways", icon: GitBranch },
    { id: "ai", label: "AI Builder", icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3 max-w-3xl mx-auto">
          <Link to={createPageUrl("ClinicalSupport")}>
            <Button variant="outline" size="sm" className="h-8 px-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center shadow">
              <GitBranch className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900">Pathway Builder</h1>
              <p className="text-xs text-slate-500 hidden sm:block">Build, save and manage clinical pathways with AI</p>
            </div>
          </div>
          {activeTab === "library" && (
            <Button size="sm" onClick={() => setAddingNew(true)}
              className="bg-violet-600 hover:bg-violet-700 text-white h-8 text-xs gap-1">
              <Plus className="w-3.5 h-3.5" /> Add
            </Button>
          )}
        </div>
      </div>

      {/* Tab bar */}
      <div className="bg-white border-b border-slate-200 px-4 sticky top-[57px] z-10">
        <div className="flex gap-1 max-w-3xl mx-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${isActive ? "border-violet-600 text-violet-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
                <Icon className="w-3.5 h-3.5" />{tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto p-4 space-y-4">

        {/* AI Builder Tab */}
        {activeTab === "ai" && (
          <>
            <Alert className="bg-violet-50 border-violet-200">
              <Info className="w-4 h-4 text-violet-600" />
              <AlertDescription className="text-violet-800 text-xs">
                Enter a condition name and let AI generate a full clinical pathway using web search, or upload your own guideline PDF/document.
              </AlertDescription>
            </Alert>
            <AIGenerator onGenerated={handleAIGenerated} />
          </>
        )}

        {/* Library Tab */}
        {activeTab === "library" && (
          <div className="space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search your pathways…"
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-violet-300" />
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">{filtered.length} saved pathway{filtered.length !== 1 ? "s" : ""}</p>
              <button onClick={() => setActiveTab("ai")}
                className="text-xs text-violet-600 font-semibold flex items-center gap-1 hover:text-violet-700">
                <Sparkles className="w-3.5 h-3.5" /> Build with AI
              </button>
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto">
                  <GitBranch className="w-8 h-8 text-violet-500" />
                </div>
                <div>
                  <p className="text-slate-700 font-semibold text-sm">No pathways yet</p>
                  <p className="text-slate-400 text-xs mt-1">Use the AI Builder or add manually</p>
                </div>
                <div className="flex gap-2 justify-center">
                  <Button size="sm" onClick={() => setActiveTab("ai")}
                    className="bg-violet-600 hover:bg-violet-700 text-white">
                    <Sparkles className="w-3.5 h-3.5 mr-1" /> AI Builder
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setAddingNew(true)}>
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Manually
                  </Button>
                </div>
              </div>
            )}

            {filtered.map(p => (
              <PathwayCard key={p.id} pathway={p} onEdit={setEditingPathway} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      {/* Edit / Add Modal */}
      {(editingPathway || addingNew) && (
        <EditModal
          pathway={addingNew ? null : editingPathway}
          onSave={handleSave}
          onClose={() => { setEditingPathway(null); setAddingNew(false); }}
        />
      )}
    </div>
  );
}