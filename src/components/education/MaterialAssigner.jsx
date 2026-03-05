import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, BookOpen, Video, FileText, Loader2, Search, Sparkles } from "lucide-react";
import { toast } from "sonner";

const TYPE_ICONS = { Article: FileText, Video: Video, PDF: FileText, Guideline: BookOpen, Infographic: FileText, Podcast: BookOpen };

const PRESET_MATERIALS = [
  { title: "Understanding Nephrotic Syndrome", type: "Article", description: "A parent's guide to NS diagnosis and management", url: "https://www.kidney.org/atoz/content/nephrotic" },
  { title: "How to Test Urine Protein at Home", type: "Video", description: "Step-by-step guide for dipstick testing", url: "" },
  { title: "Low-Salt Diet for Kidney Patients", type: "Article", description: "Dietary guidance for managing edema", url: "" },
  { title: "Prednisolone: What Parents Need to Know", type: "PDF", description: "Side effects and monitoring guide", url: "" },
  { title: "Blood Pressure Monitoring Guide", type: "Video", description: "How to measure and record BP at home", url: "" },
];

export default function MaterialAssigner({ patient, onAssigned }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ material_title: "", material_type: "Article", material_url: "", description: "", clinician_notes: "", priority: "Medium" });
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me() });

  const assignMutation = useMutation({
    mutationFn: (data) => base44.entities.PatientEducationAssignment.create(data),
    onMutate: async (newAssignment) => {
      await queryClient.cancelQueries({ queryKey: ["education-assignments", patient?.id] });
      const prev = queryClient.getQueryData(["education-assignments", patient?.id]);
      queryClient.setQueryData(["education-assignments", patient?.id], (old = []) => [
        { ...newAssignment, id: "temp-" + Date.now(), completion_status: "Not Started" }, ...old
      ]);
      toast.success("Material assigned!");
      setOpen(false);
      setForm({ material_title: "", material_type: "Article", material_url: "", description: "", clinician_notes: "", priority: "Medium" });
      onAssigned?.();
      return { prev };
    },
    onError: (err, vars, ctx) => {
      queryClient.setQueryData(["education-assignments", patient?.id], ctx.prev);
      toast.error("Failed to assign material");
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["education-assignments", patient?.id] }),
  });

  const handleAssign = () => {
    if (!form.material_title) return toast.error("Title is required");
    assignMutation.mutate({ ...form, patient_id: patient.id, patient_name: patient.patient_name, assigned_by: user?.email });
  };

  const handlePreset = (preset) => {
    setForm({ ...form, material_title: preset.title, material_type: preset.type, description: preset.description, material_url: preset.url });
  };

  const filtered = PRESET_MATERIALS.filter((m) => m.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2 bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4" />
          Assign Material
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-purple-600" />
            Assign Educational Material
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-xs font-semibold text-slate-500 uppercase">Quick Select</Label>
            <div className="relative mt-1 mb-2">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input placeholder="Search materials..." className="pl-9 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {filtered.map((m, i) => {
                const Icon = TYPE_ICONS[m.type] || FileText;
                return (
                  <button key={i} type="button" onClick={() => handlePreset(m)}
                    className="w-full text-left p-2 rounded-lg hover:bg-purple-50 flex items-center gap-2 border border-transparent hover:border-purple-200 transition-all">
                    <Icon className="w-4 h-4 text-purple-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{m.title}</p>
                      <p className="text-xs text-slate-500 truncate">{m.description}</p>
                    </div>
                    <Badge className="shrink-0 text-xs bg-purple-100 text-purple-700">{m.type}</Badge>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t pt-4 space-y-3">
            <Label className="text-xs font-semibold text-slate-500 uppercase">Or Enter Custom</Label>
            <div>
              <Label className="text-xs">Title *</Label>
              <Input value={form.material_title} onChange={(e) => setForm({ ...form, material_title: e.target.value })} placeholder="Material title" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Type</Label>
                <Select value={form.material_type} onValueChange={(v) => setForm({ ...form, material_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Article", "Video", "PDF", "Guideline", "Infographic", "Podcast"].map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Priority</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs">URL (optional)</Label>
              <Input value={form.material_url} onChange={(e) => setForm({ ...form, material_url: e.target.value })} placeholder="https://..." />
            </div>
            <div>
              <Label className="text-xs">Instructions for Patient</Label>
              <Textarea value={form.clinician_notes} onChange={(e) => setForm({ ...form, clinician_notes: e.target.value })} placeholder="e.g., Read this before your next visit" rows={2} />
            </div>
          </div>

          <Button onClick={handleAssign} disabled={assignMutation.isPending} className="w-full bg-purple-600 hover:bg-purple-700 gap-2">
            {assignMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" />Assign to {patient?.patient_name}</>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}