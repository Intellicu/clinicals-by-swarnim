import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Star, Pencil, Trash2, Check, X, Plus, Search,
  BookOpen, CheckCircle, AlertTriangle, Filter,
  GitBranch, Heart, Loader2, Sparkles, Globe, Upload, Info
} from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/client";

// ─── Pathway Action Modal (Add/Edit) ─────────────────────────────────────────
export function PathwayModal({ pathway, onSave, onClose }) {
  const isNew = !pathway?.id;
  const [data, setData] = useState({
    name: pathway?.name || "",
    full: pathway?.full || "",
    badge: pathway?.badge || "",
    color: pathway?.color || "blue",
    overview: pathway?.overview || "",
    criteria: Array.isArray(pathway?.criteria) ? pathway.criteria.join('\n') : (pathway?.criteria || ""),
    danger_signs: Array.isArray(pathway?.danger_signs) ? pathway.danger_signs.join('\n') : (pathway?.danger_signs || ""),
    management: Array.isArray(pathway?.management) ? pathway.management.join('\n') : (pathway?.management || ""),
    monitoring: Array.isArray(pathway?.monitoring) ? pathway.monitoring.join('\n') : (pathway?.monitoring || ""),
    references: Array.isArray(pathway?.references) ? pathway.references.join('\n') : (pathway?.references || ""),
    category: pathway?.category || "General",
    source: pathway?.source || "IAP",
  });

  const handleSave = () => {
    if (!data.name.trim() || !data.full.trim()) { toast.error("Name and full title required"); return; }
    onSave({
      ...pathway,
      id: pathway?.id || `custom_${Date.now()}`,
      name: data.name,
      full: data.full,
      badge: data.badge,
      color: data.color,
      category: data.category,
      source: data.source,
      overview: data.overview,
      criteria: data.criteria.split('\n').filter(s => s.trim()),
      danger_signs: data.danger_signs.split('\n').filter(s => s.trim()),
      management: data.management.split('\n').filter(s => s.trim()),
      monitoring: data.monitoring.split('\n').filter(s => s.trim()),
      references: data.references.split('\n').filter(s => s.trim()),
    });
  };

  const COLORS = ["amber", "blue", "teal", "violet", "green", "rose", "cyan", "indigo"];
  const COLOR_BG = { amber: "bg-amber-400", blue: "bg-blue-500", teal: "bg-teal-500", violet: "bg-violet-500", green: "bg-green-500", rose: "bg-rose-500", cyan: "bg-cyan-500", indigo: "bg-indigo-500" };

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
            <Label className="text-xs font-semibold text-slate-600">Full Title *</Label>
            <Input value={data.full} onChange={e => setData(d => ({ ...d, full: e.target.value }))}
              className="mt-1 h-8 text-sm" placeholder="Full clinical pathway title" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs font-semibold text-slate-600">Category</Label>
              <Select value={data.category} onValueChange={v => setData(d => ({ ...d, category: v }))}>
                <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Nephrotic Syndrome","AKI","CKD","Glomerular Disease","Tubular Disorders","Hypertension","Electrolytes","Dialysis","Transplant","Infection","General","Emergency"].map(c => (
                    <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600">Source / Guideline</Label>
              <Select value={data.source} onValueChange={v => setData(d => ({ ...d, source: v }))}>
                <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["IAP","KDIGO","WHO","ISPN","IPNA","ISKDC","AAP","ESPN","Local","Other"].map(s => (
                    <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs font-semibold text-slate-600">Color Theme</Label>
            <div className="flex gap-2 mt-1 flex-wrap">
              {COLORS.map(c => (
                <button key={c} onClick={() => setData(d => ({ ...d, color: c }))}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${data.color === c ? "border-slate-800 scale-110" : "border-transparent opacity-60"} ${COLOR_BG[c]}`} />
              ))}
            </div>
          </div>
          {[
            { label: "Overview", key: "overview", rows: 3, placeholder: "Brief overview paragraph..." },
            { label: "Criteria / Diagnostic Features (one per line)", key: "criteria", rows: 4, placeholder: "Criterion 1\nCriterion 2..." },
            { label: "Danger Signs / Red Flags (one per line)", key: "danger_signs", rows: 4, placeholder: "Red flag 1\nRed flag 2..." },
            { label: "Management Steps (one per line)", key: "management", rows: 6, placeholder: "Step 1\nStep 2..." },
            { label: "Monitoring (one per line)", key: "monitoring", rows: 4, placeholder: "Monitor 1\nMonitor 2..." },
            { label: "References (one per line)", key: "references", rows: 2, placeholder: "IAP Guidelines 2023\nWHO 2022..." },
          ].map(f => (
            <div key={f.key}>
              <Label className="text-xs font-semibold text-slate-600">{f.label}</Label>
              <Textarea value={data[f.key]} onChange={e => setData(d => ({ ...d, [f.key]: e.target.value }))}
                rows={f.rows} placeholder={f.placeholder} className="mt-1 text-xs resize-y" />
            </div>
          ))}
          <div className="flex gap-2 pt-2 sticky bottom-0 bg-white pb-1">
            <Button onClick={handleSave} size="sm" className="bg-blue-600 hover:bg-blue-700 flex-1">
              <Check className="w-3.5 h-3.5 mr-1" /> {isNew ? "Add Pathway" : "Save Changes"}
            </Button>
            <Button onClick={onClose} size="sm" variant="outline">Cancel</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── AI Pathway Generator ─────────────────────────────────────────────────────
export function AIPathwayGenerator({ onGenerated, onClose }) {
  const [mode, setMode] = useState("web");
  const [topic, setTopic] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!topic.trim() && !file) { toast.error("Enter a topic or upload a document"); return; }
    setLoading(true);
    toast.info("AI generating pathway — 30-60 seconds…");
    try {
      let fileUrls = [];
      if (file) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        fileUrls = [file_url];
      }
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Expert pediatric physician (India). Generate comprehensive clinical pathway for: "${topic || 'the document topic'}".
Follow IAP, KDIGO, WHO, ISPN guidelines where applicable.
Return JSON: name, full, badge, color (amber/teal/violet/blue/green/rose), overview, criteria (array), danger_signs (array), management (array 10-15 items with doses), monitoring (array), references (array IAP/WHO/KDIGO)`,
        file_urls: fileUrls.length ? fileUrls : undefined,
        add_context_from_internet: !file,
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
      onGenerated({ ...res, id: `ai_${Date.now()}` });
      toast.success("AI pathway added!");
      onClose();
    } catch (e) {
      toast.error("Generation failed: " + (e.message || "unknown error"));
    }
    setLoading(false);
  };

  return (
    <div className="bg-gradient-to-br from-violet-50 to-indigo-50 border-2 border-violet-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-violet-600" />
          <h3 className="text-sm font-bold text-violet-900">AI Pathway Generator</h3>
          <Badge className="bg-violet-100 text-violet-700 text-xs">Uses AI Credits</Badge>
        </div>
        <button onClick={onClose}><X className="w-4 h-4 text-slate-400" /></button>
      </div>
      <div className="flex gap-2">
        {["web", "file"].map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold border transition-colors ${mode === m ? "bg-violet-600 text-white border-violet-600" : "bg-white text-slate-600 border-slate-200"}`}>
            {m === "web" ? <><Globe className="w-3.5 h-3.5" />Web Search</> : <><Upload className="w-3.5 h-3.5" />Upload Doc</>}
          </button>
        ))}
      </div>
      <Input value={topic} onChange={e => setTopic(e.target.value)}
        placeholder="e.g. Kawasaki Disease, Neonatal Sepsis, Febrile Seizures (IAP)…"
        className="h-9 text-sm bg-white" />
      {mode === "file" && (
        <div>
          <input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" id="ai-pathway-upload" className="hidden"
            onChange={e => setFile(e.target.files?.[0] || null)} />
          <label htmlFor="ai-pathway-upload"
            className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-violet-300 text-violet-700 rounded-lg bg-white">
            <Upload className="w-3.5 h-3.5" />{file ? file.name : "Choose file"}
          </label>
        </div>
      )}
      <Button onClick={generate} disabled={loading} className="w-full bg-violet-600 hover:bg-violet-700 text-white h-9 text-sm">
        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating…</> : <><Sparkles className="w-4 h-4 mr-2" />Generate with AI</>}
      </Button>
    </div>
  );
}

// ─── Pathway Display Card with Reviewed/Favorite ─────────────────────────────
const COLOR_MAP = {
  amber: { badge: "bg-amber-100 text-amber-800 border-amber-300", header: "bg-amber-50 border-amber-200", border: "border-amber-200" },
  teal:  { badge: "bg-teal-100 text-teal-800 border-teal-300", header: "bg-teal-50 border-teal-200", border: "border-teal-200" },
  violet:{ badge: "bg-violet-100 text-violet-800 border-violet-300", header: "bg-violet-50 border-violet-200", border: "border-violet-200" },
  blue:  { badge: "bg-blue-100 text-blue-800 border-blue-300", header: "bg-blue-50 border-blue-200", border: "border-blue-200" },
  green: { badge: "bg-green-100 text-green-800 border-green-300", header: "bg-green-50 border-green-200", border: "border-green-200" },
  rose:  { badge: "bg-rose-100 text-rose-800 border-rose-300", header: "bg-rose-50 border-rose-200", border: "border-rose-200" },
  cyan:  { badge: "bg-cyan-100 text-cyan-800 border-cyan-300", header: "bg-cyan-50 border-cyan-200", border: "border-cyan-200" },
  indigo:{ badge: "bg-indigo-100 text-indigo-800 border-indigo-300", header: "bg-indigo-50 border-indigo-200", border: "border-indigo-200" },
};

function SectionCard({ title, items, isList = true }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-slate-100 text-left">
        <span className="font-semibold text-xs text-slate-800">{title}</span>
        <span className="text-slate-400 text-xs">{open ? "▲" : "▼"}</span>
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

export function PathwayCard({ pathway, onEdit, onDelete, isFav, isReviewed, onToggleFav, onToggleReviewed }) {
  const c = COLOR_MAP[pathway.color] || COLOR_MAP.blue;
  return (
    <Card className={`bg-white border-2 ${c.border} shadow-sm`}>
      <CardHeader className={`border-b py-2.5 px-3 ${c.header}`}>
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm leading-snug">{pathway.full}</CardTitle>
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              {pathway.badge && <Badge className={`${c.badge} text-xs border`}>{pathway.badge}</Badge>}
              {pathway.source && <Badge variant="outline" className="text-xs">{pathway.source}</Badge>}
              {pathway.category && <Badge variant="outline" className="text-xs">{pathway.category}</Badge>}
              {isReviewed && <Badge className="bg-green-100 text-green-800 border-green-300 border text-xs">✓ Reviewed</Badge>}
              {isFav && <Badge className="bg-amber-100 text-amber-800 border-amber-300 border text-xs">★ Saved</Badge>}
            </div>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            {/* Favorite toggle */}
            <button onClick={() => onToggleFav(pathway.id)} title={isFav ? "Remove from favorites" : "Save to favorites"}
              className={`p-1.5 rounded-lg border transition-all ${isFav ? "bg-amber-100 border-amber-300 text-amber-700" : "bg-white border-slate-200 text-slate-400 hover:text-amber-500"}`}>
              <Star className="w-3.5 h-3.5" fill={isFav ? "currentColor" : "none"} />
            </button>
            {/* Reviewed toggle */}
            <button onClick={() => onToggleReviewed(pathway.id)} title={isReviewed ? "Mark unreviewed" : "Mark as Reviewed"}
              className={`p-1.5 rounded-lg border transition-all ${isReviewed ? "bg-green-100 border-green-300 text-green-700" : "bg-white border-slate-200 text-slate-400 hover:text-green-500"}`}>
              <CheckCircle className="w-3.5 h-3.5" />
            </button>
            {/* Edit */}
            <Button size="sm" variant="outline" onClick={() => onEdit(pathway)}
              className="h-7 text-xs border-blue-200 text-blue-700 hover:bg-blue-50 px-2">
              <Pencil className="w-3 h-3" />
            </Button>
            {/* Delete */}
            <Button size="sm" variant="outline" onClick={() => onDelete(pathway.id)}
              className="h-7 text-xs border-red-200 text-red-600 hover:bg-red-50 px-2">
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 space-y-2">
        {pathway.overview && <SectionCard title="📖 Overview" items={pathway.overview} isList={false} />}
        {pathway.criteria?.length > 0 && <SectionCard title="📋 Criteria / Features" items={pathway.criteria} />}
        {pathway.danger_signs?.length > 0 && <SectionCard title="🚨 Danger Signs / Red Flags" items={pathway.danger_signs} />}
        {pathway.management?.length > 0 && <SectionCard title="🩺 Management Protocol" items={pathway.management} />}
        {pathway.monitoring?.length > 0 && <SectionCard title="📊 Monitoring" items={pathway.monitoring} />}
        {pathway.references?.length > 0 && (
          <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50">
            <p className="text-xs font-semibold text-slate-600 mb-1">References</p>
            <div className="flex flex-wrap gap-1">
              {pathway.references.map((r, i) => <Badge key={i} variant="outline" className="text-xs">{r}</Badge>)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Quick Access Dashboard ───────────────────────────────────────────────────
export function QuickAccessDashboard({ pathways, favIds, reviewedIds, onSelect }) {
  const favs = pathways.filter(p => favIds.includes(p.id));
  const reviewed = pathways.filter(p => reviewedIds.includes(p.id));

  if (favs.length === 0 && reviewed.length === 0) return null;

  return (
    <div className="space-y-3 mb-4">
      {favs.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-amber-500" fill="currentColor" />
            <span className="text-xs font-bold text-amber-700">My Saved Pathways</span>
            <Badge className="bg-amber-100 text-amber-700 text-xs">{favs.length}</Badge>
          </div>
          <div className="flex gap-2 flex-wrap">
            {favs.map(p => (
              <button key={p.id} onClick={() => onSelect(p)}
                className="px-3 py-1.5 text-xs font-semibold bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-all text-amber-800">
                ★ {p.name}
              </button>
            ))}
          </div>
        </div>
      )}
      {reviewed.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-xs font-bold text-green-700">Reviewed Pathways</span>
            <Badge className="bg-green-100 text-green-700 text-xs">{reviewed.length}</Badge>
          </div>
          <div className="flex gap-2 flex-wrap">
            {reviewed.map(p => (
              <button key={p.id} onClick={() => onSelect(p)}
                className="px-3 py-1.5 text-xs font-semibold bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-all text-green-800">
                ✓ {p.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}