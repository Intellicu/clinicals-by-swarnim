import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Search, BookOpen, Plus, X, Sparkles, Lightbulb, Target,
  Library, ChevronUp, Star, StarOff, AlertTriangle, TrendingUp,
  Award, Loader2, Maximize2, Zap, Download, RefreshCw,
  GraduationCap, Scale, WifiOff, FileText, Settings,
  BarChart3, Filter, Globe
} from "lucide-react";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { BUILTIN_GUIDELINES, EMERGENCY_PROTOCOLS, auditGuideline, getMaturityColor } from "@/lib/guidelines/index";
import GuidelineDetailView from "../components/guidelines/GuidelineDetailView";
import EmergencyQuickMode from "../components/guidelines/EmergencyQuickMode";
import SyncEngine from "../components/guidelines/SyncEngine";
import AdvancedIngestion from "../components/guidelines/AdvancedIngestion";
import OfflineManager from "../components/guidelines/OfflineManager";
import EvidenceComparisonMode from "../components/guidelines/EvidenceComparisonMode";
import TeachingModePanel from "../components/guidelines/TeachingModePanel";
import HandbookExporter from "../components/guidelines/HandbookExporter";
import SmartRelatedContent from "../components/guidelines/SmartRelatedContent";
import GuidelineCompletenessTracker from "../components/guidelines/GuidelineCompletenessTracker";
import { EvidenceAuthorityPanel, InlineSourceBadge } from "@/components/clinicalOS/EvidenceAuthorityPanel";
import GuidelineComparisonEngine from "@/components/clinicalOS/GuidelineComparisonEngine";
import { GUIDELINE_HIERARCHY } from "@/lib/clinicalOS/EvidenceGovernance";
import ClinicalFactsPanel from "@/components/clinicalOS/ClinicalFactsPanel";
import AdminGovernanceQueue from "@/components/clinicalOS/AdminGovernanceQueue";
import { getFactsForModule } from "@/lib/clinicalOS/ClinicalFactsRegistry";

// ── Constants ──────────────────────────────────────────────────────────────
const CATEGORIES = [
  "All", "AKI", "CKD", "Nephrotic Syndrome", "Hypertension", "Electrolytes",
  "Acid-Base", "Dialysis", "Transplant", "Glomerular Diseases", "Infection",
  "Tubular Disorders", "Nutrition"
];

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

// ── Panel IDs for the intelligent hub bottom drawer ──────────────────────
const HUB_PANELS = [
  { id: "emergency", icon: Zap,          label: "Emergency",  color: "text-red-600" },
  { id: "facts",     icon: BookOpen,     label: "Facts",      color: "text-blue-700" },
  { id: "compare",   icon: Scale,        label: "Compare",    color: "text-indigo-600" },
  { id: "sync",      icon: RefreshCw,    label: "Sync",       color: "text-blue-600" },
  { id: "import",    icon: Plus,         label: "Import",     color: "text-green-600" },
  { id: "teaching",  icon: GraduationCap,label: "Teaching",   color: "text-violet-600" },
  { id: "offline",   icon: Download,     label: "Offline",    color: "text-slate-600" },
  { id: "export",    icon: FileText,     label: "Export",     color: "text-emerald-600" },
  { id: "governance",icon: Settings,     label: "Governance", color: "text-rose-600" },
];

// ── Back to top ────────────────────────────────────────────────────────────
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
      className="fixed bottom-20 right-4 z-40 w-11 h-11 rounded-full bg-blue-600 text-white shadow-xl flex items-center justify-center hover:bg-blue-700 transition-colors"
      aria-label="Back to top">
      <ChevronUp className="w-5 h-5" />
    </button>
  );
}

// ── Maturity badge ─────────────────────────────────────────────────────────
function MaturityBadge({ audit }) {
  const c = getMaturityColor(audit.maturity);
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded border ${c.bg} ${c.text} ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {audit.maturity} · {audit.pct}%
    </span>
  );
}

// ── Guideline card ─────────────────────────────────────────────────────────
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
            onClick={e => { e.stopPropagation(); onStar(); }}
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

// ── Guideline quick modal ──────────────────────────────────────────────────
function GuidelineModal({ guideline, allGuidelines, onClose }) {
  const cat = CAT_COLORS[guideline.category] || "bg-slate-100 text-slate-700";
  const [activeTab, setActiveTab] = useState("content");
  const audit = auditGuideline(guideline);
  const scrollRef = React.useRef(null);

  // Scroll content to top when guideline changes
  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [guideline?.id]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-start sm:items-center justify-center p-0 sm:p-4 pt-4 sm:pt-0"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] bg-white rounded-2xl flex flex-col overflow-hidden shadow-2xl mt-auto sm:mt-0">
        {/* Header */}
        <div className="flex items-start gap-3 p-3.5 border-b border-slate-200 bg-white sticky top-0 z-10">
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-slate-900 leading-snug text-sm">{guideline.title}</h2>
            <div className="flex flex-wrap gap-1.5 mt-1">
              <Badge className={`text-xs border ${cat}`}>{guideline.category}</Badge>
              <Badge variant="outline" className="text-xs">{guideline.source} · {guideline.year}</Badge>
              <MaturityBadge audit={audit} />
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Link
              to={`${createPageUrl("GuidelineDetail")}?id=${guideline.id}`}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
              onClick={onClose}
            >
              <Maximize2 className="w-3.5 h-3.5" />Full
            </Link>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100"><X className="w-5 h-5 text-slate-600" /></button>
          </div>
        </div>

        {/* Tab nav */}
        <div className="flex border-b border-slate-100 bg-white px-3 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {[
            { id: "content", label: "📋 Content" },
            { id: "evidence", label: "🏛 Evidence" },
            { id: "completeness", label: "📊 Audit" },
            { id: "related", label: "🔗 Linked" },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex-shrink-0 px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${activeTab === t.id ? "border-blue-500 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-3" ref={scrollRef}>
          {activeTab === "content" && <GuidelineDetailView guideline={guideline} defaultMode="quick" />}
          {activeTab === "evidence" && (
            <div className="space-y-3 py-1">
              <EvidenceAuthorityPanel
                area={Object.keys(GUIDELINE_HIERARCHY).find(k => k.includes(guideline.category?.toLowerCase().replace(/\s+/g, "_").replace("nephrotic_syndrome", "nephrotic_syndrome")) || k.includes(guideline.linked_module?.toLowerCase()))}
                reviewStatus={guideline.review_status || "DRAFT"}
                reviewedBy={guideline.reviewed_by}
                lastExpertUpdate={guideline.last_expert_update}
              />
              <GuidelineComparisonEngine />
            </div>
          )}
          {activeTab === "completeness" && <GuidelineCompletenessTracker guideline={guideline} />}
          {activeTab === "related" && <SmartRelatedContent guideline={guideline} />}
        </div>
      </div>
    </div>
  );
}

// ── Intelligent Hub Drawer ─────────────────────────────────────────────────
function IntelligentHubDrawer({ open, activePanel: initialPanel, onClose, allGuidelines, dbGuidelines, onRefresh, compareDefaultTopic, onSetCompareTopic, currentUser }) {
  const [activePanel, setActivePanel] = useState(initialPanel);
  useEffect(() => { setActivePanel(initialPanel); }, [initialPanel]);

  if (!open) return null;
  const panelConfig = HUB_PANELS.find(p => p.id === activePanel);

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl shadow-2xl max-h-[90vh] flex flex-col z-10">
        {/* Handle drag bar */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 bg-slate-300 rounded-full" />
        </div>
        {/* Drawer header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            {panelConfig && <panelConfig.icon className={`w-4 h-4 ${panelConfig.color}`} />}
            <p className="font-bold text-slate-900 text-sm">{panelConfig?.label}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-100"><X className="w-5 h-5 text-slate-600" /></button>
        </div>
        {/* Panel tabs */}
        <div className="flex border-b border-slate-100 px-2 overflow-x-auto bg-slate-50/60" style={{ scrollbarWidth: "none" }}>
          {HUB_PANELS.map(p => (
            <button key={p.id}
              onClick={() => setActivePanel(p.id)}
              className={`flex-shrink-0 flex flex-col items-center gap-0.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${activePanel === p.id ? "border-blue-500 text-blue-700" : "border-transparent text-slate-400 hover:text-slate-700"}`}
            >
              <p.icon className="w-4 h-4" />
              {p.label}
            </button>
          ))}
        </div>
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activePanel === "emergency" && <EmergencyQuickMode />}
          {activePanel === "facts" && (
            <ClinicalFactsPanel
              onCompare={(topicId) => { if (onSetCompareTopic) onSetCompareTopic(topicId); setActivePanel("compare"); }}
            />
          )}
          {activePanel === "sync" && <SyncEngine onImportComplete={onRefresh} />}
          {activePanel === "import" && <AdvancedIngestion onSuccess={onRefresh} />}
          {activePanel === "compare" && (
            <div className="space-y-4">
              <GuidelineComparisonEngine defaultTopic={compareDefaultTopic} />
              <div className="border-t pt-4">
                <EvidenceComparisonMode allGuidelines={allGuidelines} />
              </div>
            </div>
          )}
          {activePanel === "teaching" && allGuidelines.length > 0 && (
            <TeachingModePanel guideline={allGuidelines[0]} />
          )}
          {activePanel === "offline" && <OfflineManager dbGuidelines={dbGuidelines} />}
          {activePanel === "export" && <HandbookExporter allGuidelines={allGuidelines} />}
          {activePanel === "governance" && (
            currentUser && currentUser.role === "admin"
              ? <AdminGovernanceQueue user={currentUser} />
              : <div className="text-sm text-slate-500 text-center py-6 flex flex-col items-center gap-2"><Settings className="w-6 h-6 text-slate-300" />Admin access required for governance queue.</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function Guidelines() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState(null);
  const [showStarred, setShowStarred] = useState(false);
  const [hubPanel, setHubPanel] = useState(null); // null = closed; string = panel id
  const [compareDefaultTopic, setCompareDefaultTopic] = useState(undefined);

  const [starred, setStarred] = useState(() => {
    try { return JSON.parse(localStorage.getItem("clinicals_starred") || "[]"); } catch { return []; }
  });
  const [recent, setRecent] = useState(() => {
    try { return JSON.parse(localStorage.getItem("clinicals_recent") || "[]"); } catch { return []; }
  });
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  const { data: currentUser } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me() });
  const queryClient = useQueryClient();
  const { data: dbGuidelines = [], isLoading } = useQuery({
    queryKey: ["guidelines"],
    queryFn: () => base44.entities.Guideline.list("-year", 1000),
    initialData: [],
  });

  const allGuidelines = [...BUILTIN_GUIDELINES, ...dbGuidelines.map(g => ({ ...g, _db: true }))];

  // Semantic + fuzzy search
  const filtered = allGuidelines.filter(g => {
    const q = search.toLowerCase();
    const searchableText = [
      g.title, g.category, g.source, g.summary, g.scope_and_population,
      g.tags?.join(" "), g.keywords?.join(" "),
      g.key_recommendations?.join(" "), g.practice_pearls?.join(" "),
      g.related_drugs?.join(" "), g.clinical_scope?.join(" ")
    ].filter(Boolean).join(" ").toLowerCase();
    const matchSearch = !search || searchableText.includes(q);
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
      const u = [g.id, ...prev.filter(id => id !== g.id)].slice(0, 6);
      try { localStorage.setItem("clinicals_recent", JSON.stringify(u)); } catch {}
      return u;
    });
  };

  const openHub = (panelId) => setHubPanel(panelId);
  const closeHub = () => setHubPanel(null);
  const onRefresh = () => queryClient.invalidateQueries({ queryKey: ["guidelines"] });

  const recentGuidelines = recent.map(id => allGuidelines.find(g => g.id === id)).filter(Boolean).slice(0, 6);
  const starredGuidelines = allGuidelines.filter(g => starred.includes(g.id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" style={{ overflowX: "hidden", maxWidth: "100vw" }}>

      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 px-4 py-5 shadow-xl">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Library className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white leading-tight">Guidelines Library</h1>
                {!isOnline && (
                  <Badge className="bg-amber-400 text-amber-900 text-xs border-0 flex items-center gap-1">
                    <WifiOff className="w-3 h-3" />Offline
                  </Badge>
                )}
              </div>
              <p className="text-blue-100 text-xs">{allGuidelines.length} guidelines · {BUILTIN_GUIDELINES.length} built-in · KDIGO/IPNA/ESPN/AAP/EULAR</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by condition, drug, guideline, keyword…"
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

      <div className="max-w-3xl mx-auto px-3 py-3 space-y-3">

        {/* ── Intelligent Hub toolbar ── */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center gap-1 p-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {HUB_PANELS.map(p => (
              <button key={p.id} onClick={() => openHub(p.id)}
                className={`flex-shrink-0 flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all text-xs font-semibold ${hubPanel === p.id ? "bg-blue-50 border border-blue-200" : "hover:bg-slate-50"}`}>
                <p.icon className={`w-4 h-4 ${p.color}`} />
                <span className="text-slate-600">{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Category pills ── */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${category === cat ? "bg-blue-600 text-white border-blue-600 shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* ── Filter bar ── */}
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setShowStarred(!showStarred)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${showStarred ? "bg-amber-100 text-amber-800 border-amber-300" : "bg-white text-slate-600 border-slate-200"}`}>
            <Star className="w-3.5 h-3.5" />Starred ({starred.length})
          </button>
          <button onClick={() => openHub("emergency")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border bg-red-50 text-red-700 border-red-200 hover:bg-red-100 transition-all">
            <Zap className="w-3.5 h-3.5" />Emergency ({EMERGENCY_PROTOCOLS.length})
          </button>
          <span className="ml-auto text-xs text-slate-400">{filtered.length} results</span>
        </div>

        {/* ── Starred collection ── */}
        {showStarred && starredGuidelines.length === 0 && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-center">
            <Star className="w-8 h-8 text-amber-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-amber-800">No starred guidelines yet</p>
            <p className="text-xs text-amber-600 mt-1">Tap the star icon on any guideline to bookmark it</p>
          </div>
        )}

        {/* ── Recently viewed ── */}
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

        {/* ── Guidelines list ── */}
        {isLoading ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-sm text-slate-500">Loading guidelines…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <BookOpen className="w-12 h-12 text-slate-300" />
            <p className="text-sm text-slate-500">No guidelines found</p>
            <Button variant="outline" size="sm" onClick={() => { setSearch(""); setCategory("All"); setShowStarred(false); }}>
              Clear filters
            </Button>
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

        {/* ── Feature cards ── */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {[
            { icon: BookOpen, label: "Clinical Facts Registry", desc: `${Object.keys(GUIDELINE_HIERARCHY).length} areas · ISPN/IPNA/AAP`, color: "bg-blue-50 border-blue-200 text-blue-700", panel: "facts" },
            { icon: Scale, label: "Compare Guidelines", desc: "KDIGO vs IPNA · side-by-side", color: "bg-indigo-50 border-indigo-200 text-indigo-700", panel: "compare" },
            { icon: GraduationCap, label: "Teaching Mode", desc: "MCQs · Viva · Flashcards", color: "bg-violet-50 border-violet-200 text-violet-700", panel: "teaching" },
            { icon: Download, label: "Offline Mode", desc: "Cache for offline use", color: "bg-slate-50 border-slate-200 text-slate-700", panel: "offline" },
            { icon: FileText, label: "Export Handbook", desc: "PDF · Teaching pack", color: "bg-emerald-50 border-emerald-200 text-emerald-700", panel: "export" },
            { icon: Settings, label: "Governance Queue", desc: "Admin review workflow", color: "bg-rose-50 border-rose-200 text-rose-700", panel: "governance" },
          ].map(f => (
            <button key={f.panel} onClick={() => openHub(f.panel)}
              className={`p-3 rounded-xl border-2 text-left hover:shadow-md transition-all ${f.color}`}>
              <f.icon className="w-5 h-5 mb-1.5" />
              <p className="text-xs font-bold leading-tight">{f.label}</p>
              <p className="text-xs opacity-70 mt-0.5">{f.desc}</p>
            </button>
          ))}
        </div>

        <Alert className="bg-blue-50 border-blue-200">
          <Award className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <AlertDescription className="text-blue-800 text-xs leading-relaxed">
            <strong>Evidence-Based:</strong> KDIGO · IPNA · ISPD · AAP · EULAR · SHARE · ERKNet · ESPN · ISKDC · WHO. Educational bedside reference — always apply clinical judgment.
          </AlertDescription>
        </Alert>
      </div>

      {/* ── Guideline quick modal ── */}
      {selected && (
        <GuidelineModal
          guideline={selected}
          allGuidelines={allGuidelines}
          onClose={() => setSelected(null)}
        />
      )}

      {/* ── Intelligent Hub Drawer ── */}
      <IntelligentHubDrawer
        open={!!hubPanel}
        activePanel={hubPanel}
        onClose={closeHub}
        allGuidelines={allGuidelines}
        dbGuidelines={dbGuidelines}
        onRefresh={onRefresh}
        compareDefaultTopic={compareDefaultTopic}
        onSetCompareTopic={setCompareDefaultTopic}
        currentUser={currentUser}
      />

      <BackToTop />
    </div>
  );
}