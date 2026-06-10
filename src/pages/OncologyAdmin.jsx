import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Lock, CheckCircle2, Star, Archive, Eye, AlertTriangle, Loader2 } from "lucide-react";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";

const STATUS_COLORS = {
  Draft: "bg-slate-100 text-slate-600",
  Review: "bg-amber-100 text-amber-700",
  Published: "bg-green-100 text-green-700",
  Archived: "bg-red-100 text-red-700",
};

const REVIEW_COLORS = {
  AI_GENERATED: "bg-orange-100 text-orange-700",
  PENDING_REVIEW: "bg-amber-100 text-amber-700",
  EXPERT_REVIEWED: "bg-green-100 text-green-700",
  DRAFT: "bg-slate-100 text-slate-600",
};

export default function OncologyAdmin() {
  const queryClient = useQueryClient();
  const { data: user, isLoading: loadingUser } = useQuery({ queryKey: ["me"], queryFn: () => base44.auth.me() });

  const isAdmin = user?.role === "admin";

  const { data: guidelines = [], isLoading } = useQuery({
    queryKey: ["oncology-guidelines-admin"],
    queryFn: () => base44.entities.Guideline.filter({ category: "Oncology" }),
    enabled: isAdmin,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Guideline.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["oncology-guidelines-admin"] });
      queryClient.invalidateQueries({ queryKey: ["oncology-guidelines"] });
      toast.success("Protocol updated");
    },
  });

  const updateField = (id, field, value) => updateMutation.mutate({ id, data: { [field]: value } });

  const toggleInstitutional = (g) => {
    updateMutation.mutate({ id: g.id, data: { institutional_standard: !g.institutional_standard } });
  };

  if (loadingUser) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
    </div>
  );

  if (!isAdmin) return (
    <div className="flex items-center justify-center min-h-screen p-6">
      <Card className="max-w-sm w-full text-center p-8">
        <Lock className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">Admin Only</h2>
        <p className="text-slate-500 text-sm mt-2">This page is restricted to admin users.</p>
        <Link to={createPageUrl("OncologyHub")} className="mt-4 block">
          <Button variant="outline" className="w-full">Back to Oncology Hub</Button>
        </Link>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-3 md:p-6">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <Link to={createPageUrl("OncologyHub")}>
            <Button variant="outline" size="sm"><ArrowLeft className="w-4 h-4 mr-1" /> Oncology Hub</Button>
          </Link>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-6 h-6 text-purple-600" /> Oncology Protocol Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">Admin only — review, publish, and mark institutional standards</p>
        </div>

        <Alert className="bg-amber-50 border-amber-300">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <AlertDescription className="text-amber-800 text-xs">
            Protocols are only visible to non-admin users when <strong>Status = Published</strong> AND <strong>Review = Expert Reviewed</strong>. Set both before releasing to clinical users.
          </AlertDescription>
        </Alert>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
          </div>
        ) : (
          <div className="space-y-3">
            {guidelines.map(g => (
              <Card key={g.id} className="border-2 border-slate-200">
                <CardHeader className="bg-slate-50 border-b py-3 px-4">
                  <div className="flex items-start gap-2 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 text-sm">{g.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{g.source} · {g.version}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap flex-shrink-0">
                      <Badge className={`${STATUS_COLORS[g.status] || ""} text-xs`}>{g.status}</Badge>
                      <Badge className={`${REVIEW_COLORS[g.review_status] || ""} text-xs`}>{g.review_status}</Badge>
                      {g.institutional_standard && (
                        <Badge className="bg-amber-500 text-white text-xs"><Star className="w-3 h-3 mr-1" />Institutional</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Status */}
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Status</label>
                      <Select value={g.status} onValueChange={v => updateField(g.id, "status", v)}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["Draft", "Review", "Published", "Archived"].map(s => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Review Status */}
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Review Status</label>
                      <Select value={g.review_status} onValueChange={v => updateField(g.id, "review_status", v)}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["AI_GENERATED", "PENDING_REVIEW", "EXPERT_REVIEWED", "DRAFT"].map(s => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Quick publish */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-600">Quick Actions</label>
                      <Button
                        size="sm"
                        className="h-7 text-xs bg-green-600 hover:bg-green-700"
                        disabled={g.status === "Published" && g.review_status === "EXPERT_REVIEWED"}
                        onClick={() => updateMutation.mutate({ id: g.id, data: { status: "Published", review_status: "EXPERT_REVIEWED" } })}
                      >
                        <Eye className="w-3 h-3 mr-1" /> Publish & Expert-approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs border-slate-300"
                        onClick={() => updateMutation.mutate({ id: g.id, data: { status: "Draft", review_status: "PENDING_REVIEW" } })}
                      >
                        <Archive className="w-3 h-3 mr-1" /> Unpublish
                      </Button>
                    </div>

                    {/* Institutional standard */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-600">Institutional Standard</label>
                      <Button
                        size="sm"
                        variant={g.institutional_standard ? "default" : "outline"}
                        className={`h-7 text-xs ${g.institutional_standard ? "bg-amber-500 hover:bg-amber-600 text-white" : "border-amber-300 text-amber-700 hover:bg-amber-50"}`}
                        onClick={() => toggleInstitutional(g)}
                      >
                        <Star className="w-3 h-3 mr-1" />
                        {g.institutional_standard ? "Remove flag" : "Mark as standard"}
                      </Button>
                    </div>
                  </div>

                  {/* Visibility summary */}
                  <div className={`mt-3 p-2 rounded-lg text-xs flex items-center gap-2 ${
                    g.status === "Published" && g.review_status === "EXPERT_REVIEWED"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-orange-50 text-orange-700 border border-orange-200"}`}>
                    {g.status === "Published" && g.review_status === "EXPERT_REVIEWED"
                      ? <><CheckCircle2 className="w-3.5 h-3.5" /> Visible to all users</>
                      : <><AlertTriangle className="w-3.5 h-3.5" /> Admin only — not yet visible to regular users</>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}