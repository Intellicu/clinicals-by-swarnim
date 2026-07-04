import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Video, FileText, ExternalLink, CheckCircle2, Clock, Circle, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const TYPE_ICONS = { Article: FileText, Video: Video, PDF: FileText, Guideline: BookOpen, Infographic: FileText, Podcast: BookOpen };
const STATUS_STYLES = {
  "Not Started": { color: "bg-slate-100 text-slate-600", icon: Circle },
  "In Progress": { color: "bg-blue-100 text-blue-700", icon: Clock },
  "Completed": { color: "bg-green-100 text-green-700", icon: CheckCircle2 },
};
const PRIORITY_COLOR = { Low: "bg-slate-100 text-slate-600", Medium: "bg-amber-100 text-amber-700", High: "bg-red-100 text-red-700" };

export default function EngagementTracker({ patientId, showStats = true }) {
  const queryClient = useQueryClient();

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ["education-assignments", patientId],
    queryFn: () => base44.entities.PatientEducationAssignment.filter({ patient_id: patientId }, "-created_date", 50),
    enabled: !!patientId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) =>
      base44.entities.PatientEducationAssignment.update(id, {
        completion_status: status,
        completion_date: status === "Completed" ? new Date().toISOString() : null,
        last_accessed: new Date().toISOString(),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["education-assignments", patientId] }),
  });

  const completed = assignments.filter((a) => a.completion_status === "Completed").length;
  const inProgress = assignments.filter((a) => a.completion_status === "In Progress").length;
  const completionRate = assignments.length > 0 ? Math.round((completed / assignments.length) * 100) : 0;

  if (isLoading) return <div className="text-center p-8 text-slate-400">Loading materials...</div>;

  if (assignments.length === 0) return (
    <div className="text-center py-8 text-slate-400">
      <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-40" />
      <p className="text-sm">No materials assigned yet</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {showStats && (
        <div className="grid grid-cols-3 gap-3">
          <Card className="text-center p-3">
            <div className="text-2xl font-bold text-slate-800">{assignments.length}</div>
            <div className="text-xs text-slate-500">Assigned</div>
          </Card>
          <Card className="text-center p-3">
            <div className="text-2xl font-bold text-green-600">{completed}</div>
            <div className="text-xs text-slate-500">Completed</div>
          </Card>
          <Card className="text-center p-3">
            <div className="text-2xl font-bold text-blue-600">{completionRate}%</div>
            <div className="text-xs text-slate-500">Completion</div>
          </Card>
        </div>
      )}

      {showStats && assignments.length > 0 && (
        <div className="flex items-center gap-3">
          <Progress value={completionRate} className="flex-1 h-2" />
          <span className="text-xs text-slate-500 whitespace-nowrap">{completed}/{assignments.length} done</span>
        </div>
      )}

      <div className="space-y-2">
        {assignments.map((assignment) => {
          const Icon = TYPE_ICONS[assignment.material_type] || FileText;
          const statusStyle = STATUS_STYLES[assignment.completion_status] || STATUS_STYLES["Not Started"];
          const StatusIcon = statusStyle.icon;

          return (
            <Card key={assignment.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-sm leading-tight">{assignment.material_title}</p>
                      <Badge className={`${PRIORITY_COLOR[assignment.priority]} text-xs shrink-0`}>{assignment.priority}</Badge>
                    </div>
                    {assignment.clinician_notes && (
                      <p className="text-xs text-slate-500 mt-1 italic">"{assignment.clinician_notes}"</p>
                    )}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge className={`${statusStyle.color} gap-1 text-xs`}>
                        <StatusIcon className="w-3 h-3" />
                        {assignment.completion_status}
                      </Badge>
                      <Badge variant="outline" className="text-xs">{assignment.material_type}</Badge>
                      {assignment.last_accessed && (
                        <span className="text-xs text-slate-400">
                          Accessed {format(new Date(assignment.last_accessed), "MMM d")}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      {assignment.material_url && (
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" asChild>
                          <a href={assignment.material_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-3 h-3" /> Open
                          </a>
                        </Button>
                      )}
                      {assignment.completion_status !== "Completed" && (
                        <Button size="sm" className="h-7 text-xs gap-1 bg-green-600 hover:bg-green-700"
                          onClick={() => { updateStatusMutation.mutate({ id: assignment.id, status: "Completed" }); toast.success("Marked as completed!"); }}>
                          <CheckCircle2 className="w-3 h-3" /> Mark Done
                        </Button>
                      )}
                      {assignment.completion_status === "Not Started" && (
                        <Button size="sm" variant="outline" className="h-7 text-xs"
                          onClick={() => updateStatusMutation.mutate({ id: assignment.id, status: "In Progress" })}>
                          Start
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}