import React, { useState } from "react";
import { base44 } from "@/api/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Flag, CheckCircle2, Clock, XCircle, AlertTriangle, Eye, ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const STATUS_CONFIG = {
  Open: { color: "bg-amber-100 text-amber-800", icon: Clock },
  "Under Review": { color: "bg-blue-100 text-blue-800", icon: Eye },
  Resolved: { color: "bg-green-100 text-green-800", icon: CheckCircle2 },
  Declined: { color: "bg-slate-100 text-slate-600", icon: XCircle },
};

const PRIORITY_COLOR = {
  Low: "bg-slate-100 text-slate-600",
  Medium: "bg-amber-100 text-amber-700",
  High: "bg-orange-100 text-orange-700",
  Critical: "bg-red-100 text-red-700",
};

function ReportCard({ report, onUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const [adminNote, setAdminNote] = useState(report.admin_notes || "");
  const StatusIcon = STATUS_CONFIG[report.status]?.icon || Clock;

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <button
        className="w-full flex items-start justify-between px-4 py-3 text-left hover:bg-slate-50 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Badge className={PRIORITY_COLOR[report.priority] || "bg-slate-100 text-slate-600"} variant="outline">
              {report.priority}
            </Badge>
            <Badge className="bg-purple-100 text-purple-700" variant="outline">{report.report_type}</Badge>
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_CONFIG[report.status]?.color}`}>
              <StatusIcon className="w-3 h-3" />
              {report.status}
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-800 truncate">{report.page_name}</p>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{report.description}</p>
        </div>
        <span className="text-xs text-slate-400 ml-3 flex-shrink-0 mt-0.5">
          {new Date(report.created_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
        </span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-slate-100 pt-3 space-y-3">
          {report.section_text && (
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-1">Flagged Section</p>
              <p className="text-xs bg-amber-50 border border-amber-200 rounded-lg p-2 text-amber-800 italic">{report.section_text}</p>
            </div>
          )}
          {report.suggested_correction && (
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-1">Suggested Correction</p>
              <p className="text-xs bg-green-50 border border-green-200 rounded-lg p-2 text-green-800">{report.suggested_correction}</p>
            </div>
          )}
          {report.screenshot_url && (
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-1">Screenshot</p>
              <a href={report.screenshot_url} target="_blank" rel="noreferrer">
                <img src={report.screenshot_url} alt="Screenshot" className="max-h-48 rounded-lg border border-slate-200 object-contain" />
              </a>
            </div>
          )}
          <div className="text-xs text-slate-400">Submitted by: {report.submitted_by_email}</div>

          {/* Admin actions */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-700">Admin Response</p>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Add notes or resolution details…"
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg resize-none h-16 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <div className="flex gap-2 flex-wrap">
              {["Under Review", "Resolved", "Declined"].map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={report.status === s ? "default" : "outline"}
                  className="text-xs h-7"
                  onClick={() => onUpdate(report.id, { status: s, admin_notes: adminNote })}
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FeedbackInbox() {
  const qc = useQueryClient();
  const { data: user } = useQuery({ queryKey: ["me"], queryFn: () => base44.auth.me() });
  const isAdmin = user?.role === "admin";

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["feedback-reports"],
    queryFn: () => base44.entities.FeedbackReport.list("-created_date", 200),
    enabled: !!user,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.FeedbackReport.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["feedback-reports"] }),
  });

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center">
          <Flag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">Admin access required</p>
          <Link to={createPageUrl("Hub")}><Button variant="outline" size="sm" className="mt-3">Back to Hub</Button></Link>
        </div>
      </div>
    );
  }

  const open = reports.filter((r) => r.status === "Open");
  const inReview = reports.filter((r) => r.status === "Under Review");
  const resolved = reports.filter((r) => r.status === "Resolved" || r.status === "Declined");

  return (
    <div className="min-h-screen bg-slate-50 p-3 md:p-6">
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <Link to={createPageUrl("Hub")}>
            <Button variant="outline" size="sm"><ArrowLeft className="w-4 h-4 mr-1" />Back</Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Flag className="w-5 h-5 text-orange-500" /> Feedback Inbox
            </h1>
            <p className="text-xs text-slate-500">User-reported corrections, content issues, and modification requests</p>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Open", count: open.length, color: "bg-amber-50 border-amber-200 text-amber-800" },
            { label: "In Review", count: inReview.length, color: "bg-blue-50 border-blue-200 text-blue-800" },
            { label: "Resolved", count: resolved.length, color: "bg-green-50 border-green-200 text-green-800" },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl border p-3 text-center ${s.color}`}>
              <p className="text-2xl font-bold">{s.count}</p>
              <p className="text-xs font-semibold">{s.label}</p>
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : (
          <Tabs defaultValue="open">
            <TabsList className="bg-slate-100 rounded-xl h-auto gap-1 p-1">
              <TabsTrigger value="open" className="text-xs px-3 py-1.5 rounded-lg data-[state=active]:bg-white">
                Open ({open.length})
              </TabsTrigger>
              <TabsTrigger value="review" className="text-xs px-3 py-1.5 rounded-lg data-[state=active]:bg-white">
                In Review ({inReview.length})
              </TabsTrigger>
              <TabsTrigger value="resolved" className="text-xs px-3 py-1.5 rounded-lg data-[state=active]:bg-white">
                Resolved ({resolved.length})
              </TabsTrigger>
              <TabsTrigger value="all" className="text-xs px-3 py-1.5 rounded-lg data-[state=active]:bg-white">
                All ({reports.length})
              </TabsTrigger>
            </TabsList>

            {[
              { value: "open", items: open },
              { value: "review", items: inReview },
              { value: "resolved", items: resolved },
              { value: "all", items: reports },
            ].map(({ value, items }) => (
              <TabsContent key={value} value={value} className="mt-3 space-y-3">
                {items.length === 0 ? (
                  <div className="text-center py-10 text-slate-400">
                    <Flag className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No reports here</p>
                  </div>
                ) : (
                  items.map((r) => (
                    <ReportCard
                      key={r.id}
                      report={r}
                      onUpdate={(id, data) => updateMutation.mutate({ id, data })}
                    />
                  ))
                )}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </div>
  );
}