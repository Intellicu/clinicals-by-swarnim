import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar, RefreshCw, BookOpen, Stethoscope, Lightbulb,
  Sparkles, Search, Star, Share2, ChevronRight, Pill,
  FlaskConical, Bell, Zap, X, ChevronLeft, AlertTriangle, TestTube, TrendingUp
} from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

// ── Section card components ───────────────────────────────────────────────────

function SectionCard({ icon: Icon, iconBg, label, children, linkText, linkTo }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className={`flex items-center gap-2 px-4 py-2.5 ${iconBg}`}>
        <Icon className="w-3.5 h-3.5 text-white" />
        <span className="text-xs font-bold text-white uppercase tracking-wide">{label}</span>
      </div>
      <div className="px-4 py-3">
        {children}
        {linkText && linkTo && (
          <Link to={linkTo}>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline mt-2">
              {linkText} <ChevronRight className="w-3 h-3" />
            </span>
          </Link>
        )}
      </div>
    </div>
  );
}

function ClinicalPearlSection({ data }) {
  if (!data?.clinical_pearl) return null;
  return (
    <SectionCard icon={Lightbulb} iconBg="bg-amber-500" label="Clinical Pearl"
      linkText="Open Pathway →" linkTo={data.pearl_pathway_url || createPageUrl("ClinicalSupport")}>
      <p className="text-sm text-slate-800 leading-relaxed">{data.clinical_pearl}</p>
    </SectionCard>
  );
}

function ClinicalChallengeSection({ data }) {
  const [revealed, setRevealed] = useState(false);
  if (!data?.challenge_case) return null;
  return (
    <SectionCard icon={Stethoscope} iconBg="bg-blue-600" label="30-Second Clinical Challenge">
      <p className="text-sm text-slate-700 leading-relaxed mb-3">{data.challenge_case}</p>
      {data.challenge_options && (
        <div className="space-y-1.5 mb-3">
          {data.challenge_options.map((opt, i) => (
            <div key={i} className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${revealed && i === data.challenge_answer ? "bg-green-50 border-green-300 text-green-800 font-semibold" : "bg-slate-50 border-slate-200 text-slate-700"}`}>
              {opt}
            </div>
          ))}
        </div>
      )}
      {!revealed ? (
        <button onClick={() => setRevealed(true)}
          className="text-xs font-semibold text-blue-600 hover:underline">
          Reveal Answer ↓
        </button>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 mt-2">
          <p className="text-xs font-bold text-green-800 mb-0.5">Answer: {data.challenge_options?.[data.challenge_answer]}</p>
          <p className="text-xs text-green-700 leading-relaxed">{data.challenge_explanation}</p>
          {data.challenge_link_url && (
            <Link to={data.challenge_link_url}>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline mt-1">
                Read further → <ChevronRight className="w-3 h-3" />
              </span>
            </Link>
          )}
        </div>
      )}
    </SectionCard>
  );
}

function DrugPearlSection({ data }) {
  if (!data?.drug_pearl) return null;
  return (
    <SectionCard icon={Pill} iconBg="bg-violet-600" label="Drug Pearl"
      linkText="Open Drug Guide →" linkTo={createPageUrl("DrugsDosing") + (data.drug_name ? `?search=${encodeURIComponent(data.drug_name)}` : "")}>
      {data.drug_name && <p className="text-xs font-bold text-violet-700 mb-1">{data.drug_name}</p>}
      <p className="text-sm text-slate-700 leading-relaxed">{data.drug_pearl}</p>
    </SectionCard>
  );
}

function RareDiseaseSection({ data }) {
  if (!data?.rare_disease_spotlight) return null;
  return (
    <SectionCard icon={FlaskConical} iconBg="bg-rose-600" label="Rare Disease Spotlight"
      linkText="Open Screening Tool →" linkTo={createPageUrl("RareDiseaseModule")}>
      {data.rare_disease_name && <p className="text-xs font-bold text-rose-700 mb-1">Think {data.rare_disease_name} when:</p>}
      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{data.rare_disease_spotlight}</p>
    </SectionCard>
  );
}

// (GuidelineReminderSection now defined below WhatsNewSection)

function EmergencyMinuteSection({ data }) {
  if (!data?.emergency_scenario) return null;
  return (
    <SectionCard icon={Zap} iconBg="bg-red-600" label="Emergency Minute"
      linkText="Open Emergency Hub →" linkTo={data.emergency_url || "/EmergencyHub"}>
      <p className="text-xs font-bold text-red-700 mb-2">{data.emergency_scenario}</p>
      <div className="space-y-1">
        {(data.emergency_steps || "").split(/[①②③④⑤]/).filter(s => s.trim()).map((step, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="bg-red-100 text-red-700 font-bold text-[10px] rounded-full w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
            <p className="text-xs text-slate-700 leading-relaxed">{step.trim()}</p>
          </div>
        ))}
        {!(data.emergency_steps || "").includes("①") && (
          <p className="text-sm text-slate-700 leading-relaxed">{data.emergency_steps}</p>
        )}
      </div>
    </SectionCard>
  );
}

function LabPearlSection({ data }) {
  if (!data?.lab_pearl) return null;
  return (
    <SectionCard icon={TestTube} iconBg="bg-teal-600" label="Lab Interpretation Pearl">
      <p className="text-sm text-slate-800 leading-relaxed">{data.lab_pearl}</p>
    </SectionCard>
  );
}

function GuidelineReminderSection({ data }) {
  if (!data?.guideline_reminder) return null;
  return (
    <SectionCard icon={BookOpen} iconBg="bg-teal-600" label="Guideline Reminder"
      linkText="Open Guideline Library →" linkTo="/GuidelinesLibrary">
      <div className="flex items-center gap-2 mb-2">
        {data.guideline_org && <span className="text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">{data.guideline_org}</span>}
        {data.guideline_condition && <span className="text-xs text-slate-500 font-semibold">{data.guideline_condition}</span>}
      </div>
      <p className="text-sm text-slate-700 leading-relaxed">{data.guideline_reminder}</p>
    </SectionCard>
  );
}

function WhatsNewSection({ data }) {
  if (!data?.whats_new?.length) return null;
  return (
    <SectionCard icon={Sparkles} iconBg="bg-indigo-600" label="What's New">
      <div className="space-y-1.5">
        {data.whats_new.slice(0, 3).map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-green-500 font-bold text-xs">✓</span>
            <span className="text-sm text-slate-700">{item}</span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function DailySummary() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [generating, setGenerating] = useState(false);
  const [generateMsg, setGenerateMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ds_favorites") || "[]"); } catch { return []; }
  });

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
    staleTime: 60000,
  });
  const isAdmin = user?.role === "admin";

  const { data: summaries = [], isLoading, refetch } = useQuery({
    queryKey: ["daily_summary_all"],
    queryFn: () => base44.entities.CustomSection.filter({
      section_type: "general",
      generation_topic: "daily_summary",
    }),
    staleTime: 60000,
  });

  const sortedSummaries = useMemo(() =>
    [...summaries].sort((a, b) => (b.content?.date || "").localeCompare(a.content?.date || "")),
    [summaries]
  );

  const availableDates = useMemo(() =>
    sortedSummaries.map(s => s.content?.date).filter(Boolean),
    [sortedSummaries]
  );

  const filteredDates = useMemo(() => {
    if (!searchQuery.trim()) return availableDates;
    const q = searchQuery.toLowerCase();
    return availableDates.filter(d => {
      const s = sortedSummaries.find(x => x.content?.date === d);
      const content = s?.content;
      if (!content) return false;
      return (
        d.includes(q) ||
        content.clinical_pearl?.toLowerCase().includes(q) ||
        content.drug_name?.toLowerCase().includes(q) ||
        content.rare_disease_name?.toLowerCase().includes(q) ||
        content.guideline_condition?.toLowerCase().includes(q) ||
        content.challenge_case?.toLowerCase().includes(q)
      );
    });
  }, [availableDates, searchQuery, sortedSummaries]);

  const summary = sortedSummaries.find(s => s.content?.date === selectedDate);
  const summaryData = summary?.content;

  const toggleFavorite = (date) => {
    const next = favorites.includes(date) ? favorites.filter(d => d !== date) : [...favorites, date];
    setFavorites(next);
    localStorage.setItem("ds_favorites", JSON.stringify(next));
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setGenerateMsg("");
    try {
      const res = await base44.functions.invoke("dailyClinicalSummary", {});
      setGenerateMsg(res.data?.success ? "Generated!" : "Done.");
      refetch();
    } catch (e) {
      setGenerateMsg("Error: " + e.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleShare = () => {
    const text = `📋 CliniCals Daily Summary — ${selectedDate}\n${summaryData?.clinical_pearl || ""}`;
    if (navigator.share) navigator.share({ title: "CliniCals Daily", text });
    else navigator.clipboard?.writeText(text);
  };

  const goDay = (delta) => {
    const idx = availableDates.indexOf(selectedDate);
    const nextIdx = idx + delta;
    if (nextIdx >= 0 && nextIdx < availableDates.length) setSelectedDate(availableDates[nextIdx]);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-2xl mx-auto px-3 py-4 space-y-4">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 rounded-2xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-bold">🩺 CliniCals Daily</h1>
                <p className="text-blue-100 text-xs">30–60 second clinical briefings</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {summaryData && (
                <button onClick={handleShare} className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
              )}
              {summaryData && (
                <button onClick={() => toggleFavorite(selectedDate)}
                  className={`p-2 rounded-lg transition-colors ${favorites.includes(selectedDate) ? "bg-yellow-400/80 text-yellow-900" : "bg-white/20 hover:bg-white/30"}`}>
                  <Star className="w-4 h-4" />
                </button>
              )}
              {isAdmin && (
                <Button onClick={handleGenerate} disabled={generating} size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white border border-white/30 text-xs h-8">
                  {generating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span className="ml-1 hidden sm:inline">{generating ? "Generating…" : "Generate"}</span>
                </Button>
              )}
            </div>
          </div>
          {generateMsg && <p className="mt-2 text-xs bg-white/10 rounded-lg px-3 py-1.5">{generateMsg}</p>}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search summaries by keyword, drug, disease…"
            className="w-full pl-9 pr-8 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-300" />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Date pills */}
        {filteredDates.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {filteredDates.slice(0, 10).map(d => (
              <button key={d} onClick={() => setSelectedDate(d)}
                className={`flex-shrink-0 flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border transition-all font-medium ${selectedDate === d ? "bg-blue-600 text-white border-blue-600" : favorites.includes(d) ? "bg-yellow-50 border-yellow-300 text-yellow-800" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"}`}>
                {favorites.includes(d) && <Star className="w-3 h-3" />}
                {format(new Date(d + "T12:00:00"), "MMM d")}
              </button>
            ))}
          </div>
        )}

        {/* Date nav */}
        <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 px-4 py-2.5">
          <button onClick={() => goDay(1)} className="p-1 hover:bg-slate-100 rounded-lg disabled:opacity-30"
            disabled={availableDates.indexOf(selectedDate) >= availableDates.length - 1}>
            <ChevronLeft className="w-4 h-4 text-slate-500" />
          </button>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-slate-800">
              {format(new Date(selectedDate + "T12:00:00"), "EEEE, d MMM yyyy")}
            </span>
            {selectedDate === new Date().toISOString().slice(0, 10) && (
              <Badge className="text-xs bg-green-100 text-green-700 border-green-200">Today</Badge>
            )}
          </div>
          <button onClick={() => goDay(-1)} className="p-1 hover:bg-slate-100 rounded-lg disabled:opacity-30"
            disabled={availableDates.indexOf(selectedDate) <= 0}>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-12 gap-2 text-slate-400">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading…</span>
          </div>
        )}

        {/* No summary */}
        {!isLoading && !summaryData && (
          <div className="bg-white border border-dashed border-slate-300 rounded-xl py-12 text-center">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-500">No summary for {selectedDate}</p>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              {isAdmin ? "Generate one now." : "Summary will appear here when generated."}
            </p>
            {isAdmin && (
              <Button onClick={handleGenerate} disabled={generating} size="sm" className="bg-blue-600 hover:bg-blue-700">
                {generating ? <RefreshCw className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 mr-1" />}
                Generate
              </Button>
            )}
          </div>
        )}

        {/* Summary sections */}
        {summaryData && (
          <div className="space-y-3">
            {summaryData.theme && (
              <div className="flex items-center gap-2 px-1">
                <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">Today's Theme: {summaryData.theme}</span>
              </div>
            )}
            <ClinicalPearlSection data={summaryData} />
            <GuidelineReminderSection data={summaryData} />
            <ClinicalChallengeSection data={summaryData} />
            <EmergencyMinuteSection data={summaryData} />
            <DrugPearlSection data={summaryData} />
            <RareDiseaseSection data={summaryData} />
            <LabPearlSection data={summaryData} />
            <WhatsNewSection data={summaryData} />
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 pb-4">
          <p className="text-xs text-slate-400">Auto-generated · 7:00 AM IST daily · Educational use only</p>
          <Link to={createPageUrl("NotificationCenter")}>
            <span className="flex items-center gap-1 text-xs text-slate-400 hover:text-blue-600">
              <Bell className="w-3 h-3" /> Preferences
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}