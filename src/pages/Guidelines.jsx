import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Search, BookOpen, Plus, Upload, Edit, X, CheckCircle, Sparkles,
  Lightbulb, Target, Library, ChevronUp, Star, StarOff,
  AlertTriangle, TrendingUp, Award, Loader2
} from "lucide-react";
import { toast } from "sonner";
import { BUILTIN_GUIDELINES, EMERGENCY_PROTOCOLS, auditGuideline, getMaturityColor } from "@/lib/guidelines/index";
import GuidelineDetailView from "../components/guidelines/GuidelineDetailView";
import EmergencyProtocolCard from "../components/guidelines/EmergencyProtocolCard";
import WebImporter from "../components/guidelines/WebImporter";

// ── Constants ─────────────────────────────────────────────────────────────
const CATEGORIES = [
  "All", "AKI", "CKD", "Nephrotic Syndrome", "Hypertension", "Electrolytes",
  "Acid-Base", "Dialysis", "Transplant", "Glomerular Diseases", "Infection",
  "Tubular Disorders", "Nutrition"
];
const EVIDENCE_LEVELS = ["High Quality Evidence", "Moderate Quality Evidence", "Low Quality Evidence", "Expert Opinion"];
const CAT_COLORS = {
  "AKI":                "bg-red-100 text-red-800 border-red-200",
  "CKD":                "bg-blue-100 text-blue-800 border-blue-200",
  "Nephrotic Syndrome": "bg-purple-100 text-purple-800 border-purple-200",
  "Hypertension":       "bg-orange-100 text-orange-800 border-orange-200",
  "Electrolytes":       "bg-yellow-100 text-yellow-800 border-yellow-200",
  "Dialysis":           "bg-cyan-100 text-cyan-800 border-cyan-200",
  "Infection":          "bg-green-100 text-green-800 border-green-200",
  "Glomerular Diseases":"bg-indigo-100 text-indigo-800 border-indigo-200",
  "Tubular Disorders":  "bg-teal-100 text-teal-800 border-teal-200",
};

// ── Back to top ───────────────────────────────────────────────────────────
function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const h = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  if (!visible) return null;
  return (
    <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-20 right-4 z-50 w-11 h-11 rounded-full bg-blue-600 text-white shadow-xl flex items-center justify-center hover:bg-blue-700 transition-colors"
      aria-label="Back to top">
      <ChevronUp className="w-5 h-5" />
    </button>
  );
}

// ── Maturity badge ────────────────────────────────────────────────────────
function MaturityBadge({ audit }) {
  const c = getMaturityColor(audit.maturity);
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded border ${c.bg} ${c.text} ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {audit.maturity} · {audit.pct}%
    </span>
  );
}

// ── Guideline card ────────────────────────────────────────────────────────
function GuidelineCard({ guideline, starred, onStar, onClick }) {
  const cat = CAT_COLORS[guideline.category] || "bg-slate-100 text-slate-700 border-slate-200";
  const audit = auditGuideline(guideline);
  const isBuiltin = !!guideline.sections;
  const qs = guideline.sections?.quick_summary;

  return (
    <div
      className={`w-full rounded-xl border-2 bg-white transition-all cursor-pointer active:scale-[0.99] overflow-hidden hover:shadow-md ${isBuiltin ? "border-blue-100 hover:border-blue-300" : "border-slate-200 hover:border-blue-300"}`}
      onClick={onClick}
    >
      <div className="p-3">
        <div className="flex items-start gap-2 mb-1.5">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              {isBuiltin && <Badge className="text-xs bg-blue-600 text-white border-0">Built-in</Badge>}
              <Badge className={`text-xs border ${cat}`}>{guideline.category}</Badge>
              {guideline.evidence_level?.includes("High") && (
                <Badge className="text-xs bg-green-50 text-green-700 border border-green-200">High Evidence</Badge>
              )}
            </div>
            <h3 className="font-semibold text-slate-900 leading-tight text-sm">{guideline.title}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{guideline.source} · {guideline.year}</p>
          </div>
          <button
            className="flex-shrink-0 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            onClick={(e) => { e.stopPropagation(); onStar(); }}
            aria-label={starred ? "Remove bookmark" : "Bookmark"}
          >
            {starred ? <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> : <StarOff className="w-4 h-4 text-slate-300" />}
          </button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mb-2">
          {guideline.summary || guideline.scope_and_population || ""}
        </p>

        {qs?.emergency_recognition?.[0] && (
          <div className="mb-2 p-2 bg-red-50 border border-red-100 rounded-lg">
            <p className="text-xs text-red-800 flex items-start gap-1">
              <AlertTriangle className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
              <span className="line-clamp-1">{qs.emergency_recognition[0]}</span>
            </p>
          </div>
        )}

        <div className="flex items-center justify-between pt-1.5 border-t border-slate-100">
          <MaturityBadge audit={audit} />
          <span className="text-xs text-blue-600 font-medium">Full detail →</span>
        </div>
      </div>
    </div>
  );
}

// ── Guideline modal ───────────────────────────────────────────────────────
function GuidelineModal({ guideline, onClose }) {
  const cat = CAT_COLORS[guideline.category] || "bg-slate-100 text-slate-700";
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full sm:max-w-2xl max-h-[93vh] sm:max-h-[88vh] bg-white rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        <div className="flex items-start gap-3 p-3.5 border-b border-slate-200 bg-white sticky top-0 z-10">
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-slate-900 leading-snug text-sm">{guideline.title}</h2>
            <div className="flex flex-wrap gap-1.5 mt-1">
              <Badge className={`text-xs border ${cat}`}>{guideline.category}</Badge>
              <Badge variant="outline" className="text-xs">{guideline.source} · {guideline.year}</Badge>
              {guideline.sections && <Badge className="text-xs bg-blue-100 text-blue-700 border-0">Built-in · Detailed</Badge>}
            </div>
          </div>
          <button onClick={onClose} className="flex-shrink-0 p-2 rounded-xl hover:bg-slate-100" aria-label="Close">
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <GuidelineDetailView guideline={guideline} />
        </div>
      </div>
    </div>
  );
}

// ── Add guideline dialog ──────────────────────────────────────────────────
function AddGuidelineDialog({ open, onOpenChange, onSuccess }) {
  const [g, setG] = useState({
    title: "", category: "AKI", source: "", year: new Date().getFullYear(),
    summary: "", scope_and_population: "", key_recommendations: [""],
    practice_pearls: [""], evidence_level: "Expert Opinion", external_link: "",
  });
  const [extracting, setExtracting] = useState(false);
  const [pdfDone, setPdfDone] = useState(false);

  const mutation = useMutation({
    mutationFn: (data) => base44.entities.Guideline.create({
      ...data,
      key_recommendations: data.key_recommendations.filter(r => r?.trim()),
      practice_pearls: data.practice_pearls.filter(p => p?.trim()),
      status: "Active",
      last_reviewed: new Date().toISOString().split("T")[0],
    }),
    onSuccess: () => { onOpenChange(false); onSuccess(); toast.success("Guideline added!"); },
    onError: () => toast.error("Failed to save"),
  });

  const extractPDF = async (file) => {
    setExtracting(true);
    toast.info("Extracting…", { id: "pdf-x" });
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const out = await base44.integrations.Core.InvokeLLM({
        prompt: "Extract from this pediatric nephrology guideline PDF: title, source (KDIGO/IPNA/IAP etc), year, category, scope_and_population (who/when/what 2-3 sentences), key_recommendations (8-12 specific sequential management steps with thresholds), practice_pearls (5-6 bedside tips), evidence_level, external_link if mentioned.",
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" }, source: { type: "string" }, year: { type: "number" },
            category: { type: "string" }, scope_and_population: { type: "string" },
            key_recommendations: { type: "array", items: { type: "string" } },
            practice_pearls: { type: "array", items: { type: "string" } },
            evidence_level: { type: "string" }, external_link: { type: "string" }
          }
        }
      });
      setG(prev => ({
        ...prev, ...out,
        key_recommendations: out.key_recommendations?.length ? out.key_recommendations : [""],
        practice_pearls: out.practice_pearls?.length ? out.practice_pearls : [""],
      }));
      setPdfDone(true);
      toast.success("Extracted!", { id: "pdf-x" });
    } catch { toast.error("Extraction failed", { id: "pdf-x" }); }
    finally { setExtracting(false); }
  };

  const upRec = (i, v) => { const u = [...g.key_recommendations]; u[i] = v; setG({ ...g, key_recommendations: u }); };
  const upPearl = (i, v) => { const u = [...g.practice_pearls]; u[i] = v; setG({ ...g, practice_pearls: u }); };
  const rmRec = (i) => setG(p => ({ ...p, key_recommendations: p.key_recommendations.filter((_, j) => j !== i) }));
  const rmPearl = (i) => setG(p => ({ ...p, practice_pearls: p.practice_pearls.filter((_, j) => j !== i) }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[92vh] overflow-y-auto mx-2 sm:mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Sparkles className="w-5 h-5 text-blue-600" /> Add Guideline
          </DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="upload" className="mt-2">
          <TabsList className="grid w-full grid-cols-3 text-xs">
            <TabsTrigger value="upload"><Upload className="w-3.5 h-3.5 mr-1" />PDF</TabsTrigger>
            <TabsTrigger value="web"><Search className="w-3.5 h-3.5 mr-1" />Web</TabsTrigger>
            <TabsTrigger value="manual"><Edit className="w-3.5 h-3.5 mr-1" />Manual</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-3 mt-3">
            <div className="border-2 border-dashed border-blue-300 rounded-xl p-5 bg-blue-50 text-center">
              <Upload className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-blue-800 mb-1">Upload PDF Guideline</p>
              <p className="text-xs text-blue-600 mb-3">AI extracts 8–12 management steps, pearls, evidence level</p>
              <input type="file" accept=".pdf" disabled={extracting}
                onChange={(e) => { const f = e.target.files[0]; if (f) extractPDF(f); }}
                className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-blue-600 file:text-white file:cursor-pointer" />
              {extracting && <div className="mt-3 flex items-center justify-center gap-2 text-blue-700 text-xs"><Loader2 className="w-4 h-4 animate-spin" />Analysing…</div>}
              {pdfDone && !extracting && <Badge className="mt-2 bg-green-600 text-white text-xs"><CheckCircle className="w-3 h-3 mr-1" />Extracted — review below</Badge>}
            </div>
            {pdfDone && (
              <div className="space-y-2 text-sm border-t pt-3">
                <div className="grid grid-cols-2 gap-2">
                  <div><Label className="text-xs">Title</Label><Input value={g.title} onChange={e => setG({...g, title: e.target.value})} className="mt-1 text-xs h-8" /></div>
                  <div><Label className="text-xs">Source</Label><Input value={g.source} onChange={e => setG({...g, source: e.target.value})} className="mt-1 text-xs h-8" /></div>
                </div>
                <div><Label className="text-xs">Clinical Summary</Label><Textarea value={g.scope_and_population} onChange={e => setG({...g, scope_and_population: e.target.value})} className="mt-1 text-xs h-16" /></div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="web" className="mt-3">
            <WebImporter onImportComplete={(data) => setG(prev => ({ ...prev, ...data, key_recommendations: data.key_recommendations || [""], practice_pearls: [""] }))} />
          </TabsContent>

          <TabsContent value="manual" className="space-y-3 mt-3">
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-xs">Title *</Label><Input value={g.title} onChange={e => setG({...g, title: e.target.value})} className="mt-1 text-xs h-8" /></div>
              <div><Label className="text-xs">Source *</Label><Input value={g.source} onChange={e => setG({...g, source: e.target.value})} className="mt-1 text-xs h-8" /></div>
              <div>
                <Label className="text-xs">Category *</Label>
                <Select value={g.category} onValueChange={v => setG({...g, category: v})}>
                  <SelectTrigger className="mt-1 text-xs h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.filter(c => c !== "All").map(c => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Year *</Label><Input type="number" value={g.year} onChange={e => setG({...g, year: parseInt(e.target.value)})} className="mt-1 text-xs h-8" /></div>
            </div>
            <div><Label className="text-xs font-semibold">Clinical Summary *</Label><Textarea value={g.scope_and_population} onChange={e => setG({...g, scope_and_population: e.target.value})} placeholder="Who/When/What — 2–3 sentences" className="mt-1 text-xs h-16" /></div>
            <div>
              <Label className="text-xs font-semibold flex items-center gap-1"><Target className="w-3.5 h-3.5 text-green-600" />Management Steps (aim for 8–12)</Label>
              <div className="space-y-1.5 mt-1">
                {g.key_recommendations.map((r, i) => (
                  <div key={i} className="flex gap-1.5">
                    <Badge className="bg-green-600 text-white flex-shrink-0 h-7 px-2 text-xs">{i + 1}</Badge>
                    <Input value={r} onChange={e => upRec(i, e.target.value)} placeholder="Specific actionable step…" className="flex-1 text-xs h-7" />
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => rmRec(i)}><X className="w-3 h-3" /></Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full text-xs h-7 border-green-300" onClick={() => setG(p => ({...p, key_recommendations: [...p.key_recommendations, ""]}))}>
                  <Plus className="w-3.5 h-3.5 mr-1" />Add Step
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold flex items-center gap-1"><Lightbulb className="w-3.5 h-3.5 text-amber-600" />Practice Pearls</Label>
              <div className="space-y-1.5 mt-1">
                {g.practice_pearls.map((p, i) => (
                  <div key={i} className="flex gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-1.5" />
                    <Input value={p} onChange={e => upPearl(i, e.target.value)} placeholder="Bedside tip…" className="flex-1 text-xs h-7" />
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => rmPearl(i)}><X className="w-3 h-3" /></Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full text-xs h-7 border-amber-300" onClick={() => setG(p => ({...p, practice_pearls: [...p.practice_pearls, ""]}))}>
                  <Plus className="w-3.5 h-3.5 mr-1" />Add Pearl
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Evidence Level</Label>
                <Select value={g.evidence_level} onValueChange={v => setG({...g, evidence_level: v})}>
                  <SelectTrigger className="mt-1 text-xs h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>{EVIDENCE_LEVELS.map(l => <SelectItem key={l} value={l} className="text-xs">{l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">External Link</Label><Input value={g.external_link} onChange={e => setG({...g, external_link: e.target.value})} placeholder="https://…" className="mt-1 text-xs h-8" /></div>
            </div>
            <div><Label className="text-xs">Full Summary</Label><Textarea value={g.summary} onChange={e => setG({...g, summary: e.target.value})} placeholder="Comprehensive overview…" className="mt-1 text-xs h-20" /></div>
          </TabsContent>
        </Tabs>
        <Button onClick={() => mutation.mutate(g)} disabled={!g.title || !g.source || mutation.isPending} className="w-full mt-3 bg-blue-600 hover:bg-blue-700 h-10">
          {mutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</> : <><Plus className="w-4 h-4 mr-2" />Add to Library</>}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function Guidelines() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showEmergency, setShowEmergency] = useState(false);
  const [showStarred, setShowStarred] = useState(false);
  const [starred, setStarred] = useState(() => {
    try { return JSON.parse(localStorage.getItem("clinicals_starred") || "[]"); } catch { return []; }
  });
  const [recent, setRecent] = useState(() => {
    try { return JSON.parse(localStorage.getItem("clinicals_recent") || "[]"); } catch { return []; }
  });

  const queryClient = useQueryClient();
  const { data: dbGuidelines = [], isLoading } = useQuery({
    queryKey: ["guidelines"],
    queryFn: () => base44.entities.Guideline.list("-year"),
    initialData: [],
  });

  const allGuidelines = [...BUILTIN_GUIDELINES, ...dbGuidelines.map(g => ({ ...g, _db: true }))];

  const filtered = allGuidelines.filter(g => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      g.title?.toLowerCase().includes(q) ||
      g.category?.toLowerCase().includes(q) ||
      g.source?.toLowerCase().includes(q) ||
      g.summary?.toLowerCase().includes(q) ||
      g.tags?.some(t => t.toLowerCase().includes(q));
    const matchCat = category === "All" || g.category === category;
    const matchStar = !showStarred || starred.includes(g.id);
    return matchSearch && matchCat && matchStar;
  });

  const handleStar = (id) => {
    setStarred(prev => {
      const u = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      try { localStorage.setItem("clinicals_starred", JSON.stringify(u)); } catch {}
      return u;
    });
  };

  const handleOpen = (g) => {
    setSelected(g);
    setRecent(prev => {
      const u = [g.id, ...prev.filter(id => id !== g.id)].slice(0, 5);
      try { localStorage.setItem("clinicals_recent", JSON.stringify(u)); } catch {}
      return u;
    });
  };

  const recentGuidelines = recent.map(id => allGuidelines.find(g => g.id === id)).filter(Boolean).slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" style={{ overflowX: "hidden", maxWidth: "100vw" }}>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 px-4 py-5 shadow-xl">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Library className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-white leading-tight">Guidelines Library</h1>
              <p className="text-blue-100 text-xs">{allGuidelines.length} guidelines · {BUILTIN_GUIDELINES.length} built-in detailed · KDIGO/IPNA/ESPN/AAP/EULAR</p>
            </div>
            <Button size="sm" className="bg-white text-blue-700 hover:bg-blue-50 font-semibold flex-shrink-0 h-9" onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-1" />Add
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search AKI, nephrotic, HUS, dialysis, lupus…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border-0 bg-white/90 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            {search && (
              <button className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setSearch("")}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-3 py-4 space-y-4">

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${category === cat ? "bg-blue-600 text-white border-blue-600 shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setShowStarred(!showStarred)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${showStarred ? "bg-amber-100 text-amber-800 border-amber-300" : "bg-white text-slate-600 border-slate-200"}`}>
            <Star className="w-3.5 h-3.5" />Bookmarked ({starred.length})
          </button>
          <button onClick={() => setShowEmergency(!showEmergency)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${showEmergency ? "bg-red-100 text-red-800 border-red-300" : "bg-white text-slate-600 border-slate-200"}`}>
            <AlertTriangle className="w-3.5 h-3.5" />Emergency ({EMERGENCY_PROTOCOLS.length})
          </button>
          <span className="ml-auto text-xs text-slate-400">{filtered.length} results</span>
        </div>

        {/* Emergency panel */}
        {showEmergency && (
          <Card className="border-2 border-red-200 shadow-md overflow-hidden">
            <CardContent className="p-3"><EmergencyProtocolCard /></CardContent>
          </Card>
        )}

        {/* Recently viewed */}
        {!search && category === "All" && !showStarred && recentGuidelines.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />Recently Viewed
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
              {recentGuidelines.map(g => (
                <button key={g.id} onClick={() => handleOpen(g)}
                  className="flex-shrink-0 w-40 px-3 py-2 bg-white border border-slate-200 rounded-xl text-left hover:border-blue-300 transition-colors">
                  <p className="font-medium text-slate-800 text-xs leading-snug line-clamp-2">{g.title}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{g.category}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Guidelines list */}
        {isLoading ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-sm text-slate-500">Loading guidelines…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <BookOpen className="w-12 h-12 text-slate-300" />
            <p className="text-sm text-slate-500">No guidelines found</p>
            <Button variant="outline" size="sm" onClick={() => { setSearch(""); setCategory("All"); setShowStarred(false); }}>Clear filters</Button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filtered.map(g => (
              <GuidelineCard key={g.id} guideline={g}
                starred={starred.includes(g.id)}
                onStar={() => handleStar(g.id)}
                onClick={() => handleOpen(g)}
              />
            ))}
          </div>
        )}

        <Alert className="bg-blue-50 border-blue-200">
          <Award className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <AlertDescription className="text-blue-800 text-xs leading-relaxed">
            <strong>Evidence-Based:</strong> Built-in content sourced from KDIGO, IPNA, ISPD, AAP, EULAR, SHARE, ERKNet, ESPN, ISKDC, WHO. Educational bedside reference — always apply clinical judgment.
          </AlertDescription>
        </Alert>
      </div>

      {selected && <GuidelineModal guideline={selected} onClose={() => setSelected(null)} />}
      <AddGuidelineDialog open={dialogOpen} onOpenChange={setDialogOpen} onSuccess={() => queryClient.invalidateQueries({ queryKey: ["guidelines"] })} />
      <BackToTop />
    </div>
  );
}