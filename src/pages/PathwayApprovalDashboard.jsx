import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Eye, Clock, Sparkles, FileText, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function PathwayApprovalDashboard() {
  const queryClient = useQueryClient();
  const [previewItem, setPreviewItem] = useState(null);

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: () => base44.auth.me(),
  });

  const { data: pending = [], isLoading } = useQuery({
    queryKey: ["pending-pathways"],
    queryFn: () => base44.entities.CustomSection.filter({ status: "pending_approval" }, "-created_date", 50),
    enabled: user?.role === "admin",
  });

  const { data: published = [] } = useQuery({
    queryKey: ["published-pathways"],
    queryFn: () => base44.entities.CustomSection.filter({ created_by_admin: true, status: "published" }, "-created_date", 20),
    enabled: user?.role === "admin",
  });

  const approveMutation = useMutation({
    mutationFn: (id) => base44.entities.CustomSection.update(id, { status: "published" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-pathways"] });
      queryClient.invalidateQueries({ queryKey: ["published-pathways"] });
      toast.success("✅ Pathway approved and published!");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id) => base44.entities.CustomSection.update(id, { status: "draft" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-pathways"] });
      toast.success("Pathway moved back to draft");
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: (id) => base44.entities.CustomSection.update(id, { status: "draft" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["published-pathways"] });
      toast.success("Pathway unpublished");
    },
  });

  if (!user) return <div className="p-8 text-center text-slate-500">Loading...</div>;
  if (user.role !== "admin") {
    return (
      <div className="p-8 max-w-md mx-auto mt-20 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">Admin Access Required</h2>
        <p className="text-slate-500">Only administrators can access the pathway approval dashboard.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Pathway Approval Dashboard</h1>
            <p className="text-sm text-slate-500">Review and approve AI-generated clinical content before publishing</p>
          </div>
          <Badge className="ml-auto bg-amber-100 text-amber-800 border border-amber-300">
            {pending.length} Pending
          </Badge>
        </div>

        {/* Pending Approvals */}
        <div>
          <h2 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" /> Pending Approval ({pending.length})
          </h2>
          {isLoading && (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading...
            </div>
          )}
          {!isLoading && pending.length === 0 && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800">No pathways awaiting approval. All up to date!</AlertDescription>
            </Alert>
          )}
          <div className="space-y-3">
            {pending.map((item) => (
              <Card key={item.id} className="border-2 border-amber-200 bg-amber-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
                          <div className="flex gap-2 mt-1 flex-wrap">
                            <Badge variant="outline" className="text-xs">{item.section_type || "pathway"}</Badge>
                            {item.generation_topic && (
                              <span className="text-xs text-slate-500">Topic: {item.generation_topic}</span>
                            )}
                            <span className="text-xs text-slate-400">
                              {new Date(item.created_date).toLocaleDateString()}
                            </span>
                          </div>
                          {item.content?.summary && (
                            <p className="text-xs text-slate-600 mt-1.5 line-clamp-2">{item.content.summary}</p>
                          )}
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Button size="sm" variant="outline" className="text-xs gap-1 h-8" onClick={() => setPreviewItem(item)}>
                            <Eye className="w-3 h-3" /> Preview
                          </Button>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-xs gap-1 h-8"
                            onClick={() => approveMutation.mutate(item.id)}
                            disabled={approveMutation.isPending}
                          >
                            <CheckCircle className="w-3 h-3" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-300 text-red-600 hover:bg-red-50 text-xs gap-1 h-8"
                            onClick={() => rejectMutation.mutate(item.id)}
                            disabled={rejectMutation.isPending}
                          >
                            <XCircle className="w-3 h-3" /> Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Published */}
        <div>
          <h2 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" /> Recently Published ({published.length})
          </h2>
          <div className="space-y-2">
            {published.map((item) => (
              <Card key={item.id} className="border border-green-200 bg-green-50">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                      <p className="text-xs text-slate-500">{new Date(item.created_date).toLocaleDateString()}</p>
                    </div>
                    <Badge className="bg-green-600 text-white text-xs">Published</Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => unpublishMutation.mutate(item.id)}
                    >
                      Unpublish
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewItem} onOpenChange={() => setPreviewItem(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{previewItem?.title}</DialogTitle>
          </DialogHeader>
          {previewItem && (
            <div className="space-y-4 text-sm">
              {previewItem.content?.summary && (
                <p className="text-slate-600 italic border-l-4 border-purple-300 pl-3">{previewItem.content.summary}</p>
              )}
              {previewItem.content?.sections?.map((s, i) => (
                <div key={i} className="border-l-4 border-slate-200 pl-3">
                  <h4 className="font-bold text-slate-800 mb-1">{s.heading}</h4>
                  <p className="text-slate-600 text-xs whitespace-pre-wrap">{s.content}</p>
                  {s.key_points?.length > 0 && (
                    <ul className="mt-1 space-y-0.5">
                      {s.key_points.map((kp, j) => <li key={j} className="text-xs text-slate-600">• {kp}</li>)}
                    </ul>
                  )}
                </div>
              ))}
              {previewItem.content?.clinical_pearls?.length > 0 && (
                <div className="bg-amber-50 p-3 rounded border border-amber-200">
                  <p className="text-xs font-bold text-amber-800 mb-1">Clinical Pearls</p>
                  {previewItem.content.clinical_pearls.map((p, i) => <p key={i} className="text-xs text-amber-900">💡 {p}</p>)}
                </div>
              )}
              <div className="flex gap-2 pt-2 border-t">
                <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => { approveMutation.mutate(previewItem.id); setPreviewItem(null); }}>
                  <CheckCircle className="w-4 h-4 mr-1" /> Approve & Publish
                </Button>
                <Button variant="outline" className="flex-1 border-red-300 text-red-600" onClick={() => { rejectMutation.mutate(previewItem.id); setPreviewItem(null); }}>
                  <XCircle className="w-4 h-4 mr-1" /> Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}