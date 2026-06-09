import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import {
  Calendar, RefreshCw, BookOpen, Stethoscope, Lightbulb,
  Bell, Activity, ChevronLeft, ChevronRight, Sparkles, Clock
} from "lucide-react";
import { format, subDays } from "date-fns";

export default function DailySummary() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [generating, setGenerating] = useState(false);
  const [generateMsg, setGenerateMsg] = useState("");

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
    staleTime: 60000,
  });

  const isAdmin = user?.role === "admin";

  // Fetch summary for selected date
  const { data: summaries = [], isLoading, refetch } = useQuery({
    queryKey: ["daily_summary", selectedDate],
    queryFn: () =>
      base44.entities.CustomSection.filter({
        section_type: "general",
        generation_topic: "daily_summary",
      }),
    staleTime: 60000,
  });

  const summary = summaries.find(s => s.content?.date === selectedDate);
  const summaryData = summary?.content;

  const handleGenerate = async () => {
    setGenerating(true);
    setGenerateMsg("");
    try {
      const res = await base44.functions.invoke("dailyClinicalSummary", {});
      setGenerateMsg(res.data?.success ? "Summary generated and emailed to admins!" : "Generated.");
      refetch();
    } catch (e) {
      setGenerateMsg("Error: " + e.message);
    } finally {
      setGenerating(false);
    }
  };

  const goDay = (delta) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + delta);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  const availableDates = summaries.map(s => s.content?.date).filter(Boolean).sort().reverse();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-3xl mx-auto space-y-4">

        {/* Header */}
        <div className="rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-700 p-5 text-white shadow-lg">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Daily Clinical Summary</h1>
                <p className="text-blue-100 text-xs">Automated briefing · Clinical vignette · Learning pearl</p>
              </div>
            </div>
            {isAdmin && (
              <Button
                onClick={handleGenerate}
                disabled={generating}
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border border-white/30 text-xs"
              >
                {generating
                  ? <><RefreshCw className="w-3.5 h-3.5 mr-1 animate-spin" /> Generating…</>
                  : <><Sparkles className="w-3.5 h-3.5 mr-1" /> Generate Now</>}
              </Button>
            )}
          </div>
          {generateMsg && (
            <div className="mt-2 text-xs bg-white/10 rounded-lg px-3 py-1.5">{generateMsg}</div>
          )}
        </div>

        {/* Date navigator */}
        <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 px-4 py-2.5 shadow-sm">
          <button onClick={() => goDay(-1)} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
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
          <button onClick={() => goDay(1)} disabled={selectedDate >= new Date().toISOString().slice(0, 10)}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-30">
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Available dates pills */}
        {availableDates.length > 1 && (
          <div className="flex gap-2 flex-wrap">
            {availableDates.slice(0, 7).map(d => (
              <button key={d} onClick={() => setSelectedDate(d)}
                className={`text-xs px-3 py-1 rounded-full border transition-all ${selectedDate === d ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"}`}>
                {format(new Date(d + "T12:00:00"), "MMM d")}
              </button>
            ))}
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-12 gap-2 text-slate-400">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading summary…</span>
          </div>
        )}

        {/* No summary */}
        {!isLoading && !summaryData && (
          <Card className="border-dashed border-slate-300">
            <CardContent className="py-12 text-center">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-500">No summary for {selectedDate}</p>
              <p className="text-xs text-slate-400 mt-1 mb-4">
                {isAdmin ? "Generate one now or wait for the daily automation." : "The admin will generate the daily summary each morning."}
              </p>
              {isAdmin && (
                <Button onClick={handleGenerate} disabled={generating} size="sm" className="bg-blue-600 hover:bg-blue-700">
                  {generating ? <RefreshCw className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 mr-1" />}
                  Generate Summary
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Summary content */}
        {summaryData && (
          <div className="space-y-4">
            {/* Meta bar */}
            <div className="flex items-center gap-3 flex-wrap text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Generated {summaryData.generated_at ? format(new Date(summaryData.generated_at), "h:mm a") : "today"}
              </span>
              <span className="flex items-center gap-1">
                <Bell className="w-3.5 h-3.5 text-orange-500" />
                {summaryData.alerts_count || 0} alerts
              </span>
              <span className="flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-blue-500" />
                {summaryData.encounters_count || 0} encounters
              </span>
            </div>

            {/* Main markdown content */}
            <Card className="border-blue-100 shadow-sm">
              <CardContent className="p-5">
                <ReactMarkdown
                  className="prose prose-sm prose-blue max-w-none text-slate-800 [&>h2]:text-blue-800 [&>h2]:font-bold [&>h2]:mt-4 [&>h2]:mb-2 [&>h3]:text-slate-700 [&>h3]:font-semibold [&>strong]:text-slate-900 [&>ul]:mt-1 [&>li]:my-0.5 [&>p]:text-slate-700 [&>p]:leading-relaxed"
                  components={{
                    h2: ({ children }) => (
                      <h2 className="text-base font-bold text-blue-800 mt-5 mb-2 flex items-center gap-2 border-b border-blue-100 pb-1">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-sm font-bold text-slate-700 mt-3 mb-1">{children}</h3>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-bold text-slate-900">{children}</strong>
                    ),
                    li: ({ children }) => (
                      <li className="text-sm text-slate-700 my-0.5">{children}</li>
                    ),
                    p: ({ children }) => (
                      <p className="text-sm text-slate-700 leading-relaxed my-1">{children}</p>
                    ),
                  }}
                >
                  {summaryData.summary_markdown || "No content available."}
                </ReactMarkdown>
              </CardContent>
            </Card>

            {/* Quick cards */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="border-violet-100 bg-violet-50">
                <CardContent className="p-3 flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-violet-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-violet-800">Today's Pearl</p>
                    <p className="text-xs text-violet-700 mt-0.5 line-clamp-3">{summaryData.pearl_title || "See full summary above"}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-teal-100 bg-teal-50">
                <CardContent className="p-3 flex items-start gap-2">
                  <BookOpen className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-teal-800">Case Vignette</p>
                    <p className="text-xs text-teal-700 mt-0.5 line-clamp-3">{summaryData.vignette_title || "See full summary above"}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Footer note */}
        <p className="text-center text-xs text-slate-400 pb-4">
          Daily summaries are auto-generated each morning at 7:00 AM IST. For educational use only.
        </p>
      </div>
    </div>
  );
}