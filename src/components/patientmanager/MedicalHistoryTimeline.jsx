import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, Clock, FileText, Pill, AlertTriangle, Stethoscope, FlaskConical, Scissors, BedDouble, ExternalLink, X } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const ENTRY_TYPES = ["Diagnosis","Treatment","Medication","Allergy","Lab Report","Prescription","Surgery","Hospitalization","Follow-up Note","Other"];
const SEVERITIES = ["Mild","Moderate","Severe","Critical"];

const TYPE_ICONS = {
  Diagnosis: Stethoscope, Treatment: Pill, Medication: Pill, Allergy: AlertTriangle,
  "Lab Report": FlaskConical, Prescription: FileText, Surgery: Scissors,
  Hospitalization: BedDouble, "Follow-up Note": Clock, Other: FileText,
};

const TYPE_COLORS = {
  Diagnosis: "bg-purple-100 text-purple-800 border-purple-200",
  Treatment: "bg-blue-100 text-blue-800 border-blue-200",
  Medication: "bg-teal-100 text-teal-800 border-teal-200",
  Allergy: "bg-red-100 text-red-800 border-red-200",
  "Lab Report": "bg-cyan-100 text-cyan-800 border-cyan-200",
  Prescription: "bg-green-100 text-green-800 border-green-200",
  Surgery: "bg-orange-100 text-orange-800 border-orange-200",
  Hospitalization: "bg-rose-100 text-rose-800 border-rose-200",
  "Follow-up Note": "bg-slate-100 text-slate-800 border-slate-200",
  Other: "bg-slate-100 text-slate-700 border-slate-200",
};

const SEVERITY_COLORS = { Mild: "bg-green-100 text-green-700", Moderate: "bg-yellow-100 text-yellow-700", Severe: "bg-orange-100 text-orange-700", Critical: "bg-red-100 text-red-700" };

// Curated references per entry type
const REFERENCES = {
  Diagnosis: [
    { title: "KDIGO Clinical Practice Guidelines", url: "https://kdigo.org/guidelines/" },
    { title: "IAP Standard Treatment Guidelines", url: "https://www.iapindia.org/clinical-guidelines.php" },
  ],
  "Lab Report": [
    { title: "Pediatric Reference Ranges – UpToDate", url: "https://www.uptodate.com/contents/normal-reference-ranges-for-laboratory-values-in-newborns" },
    { title: "WHO Child Growth Standards", url: "https://www.who.int/tools/child-growth-standards" },
  ],
  Medication: [
    { title: "Pediatric Drug Dosing – BNFc", url: "https://bnfc.nice.org.uk/" },
    { title: "CIMS India Drug Database", url: "https://www.cimsasia.com/India" },
  ],
  Allergy: [
    { title: "Drug Allergy – AAAAI Guidelines", url: "https://www.aaaai.org/tools-for-the-public/conditions-library/allergies/drug-allergy" },
  ],
  Surgery: [
    { title: "Pediatric Surgical Outcomes – APSA", url: "https://www.eapsa.org/resources/" },
  ],
};

export default function MedicalHistoryTimeline({ patient }) {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [filterType, setFilterType] = useState("All");
  const [newRefTitle, setNewRefTitle] = useState("");
  const [newRefUrl, setNewRefUrl] = useState("");

  const emptyForm = {
    patient_id: patient.id,
    entry_date: format(new Date(), "yyyy-MM-dd"),
    entry_type: "Diagnosis",
    title: "",
    description: "",
    doctor_name: "",
    facility: "",
    severity: "",
    outcome: "",
    is_active: true,
    reference_links: [],
    tags: [],
  };
  const [form, setForm] = useState(emptyForm);
  const [newTag, setNewTag] = useState("");

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["medical-history", patient.id],
    queryFn: () => base44.entities.MedicalHistoryEntry.filter({ patient_id: patient.id }, "-entry_date", 200),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.MedicalHistoryEntry.create(data),
    onSuccess: () => { qc.invalidateQueries(["medical-history", patient.id]); toast.success("Entry added"); setShowForm(false); setForm(emptyForm); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.MedicalHistoryEntry.update(id, data),
    onSuccess: () => { qc.invalidateQueries(["medical-history", patient.id]); toast.success("Entry updated"); setShowForm(false); setEditingEntry(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.MedicalHistoryEntry.delete(id),
    onSuccess: () => { qc.invalidateQueries(["medical-history", patient.id]); toast.success("Entry deleted"); },
  });

  const openEdit = (entry) => { setForm({ ...entry, entry_date: entry.entry_date || format(new Date(), "yyyy-MM-dd"), reference_links: entry.reference_links || [], tags: entry.tags || [] }); setEditingEntry(entry); setShowForm(true); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title) { toast.error("Title is required"); return; }
    if (editingEntry) updateMutation.mutate({ id: editingEntry.id, data: form });
    else createMutation.mutate(form);
  };

  const addRef = () => {
    if (!newRefTitle || !newRefUrl) return;
    setForm(f => ({ ...f, reference_links: [...(f.reference_links || []), { title: newRefTitle, url: newRefUrl }] }));
    setNewRefTitle(""); setNewRefUrl("");
  };

  const filtered = filterType === "All" ? entries : entries.filter(e => e.entry_type === filterType);

  // Group by year
  const grouped = {};
  filtered.forEach(e => {
    const year = e.entry_date ? new Date(e.entry_date).getFullYear() : "Unknown";
    if (!grouped[year]) grouped[year] = [];
    grouped[year].push(e);
  });
  const years = Object.keys(grouped).sort((a, b) => b - a);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-1 flex-wrap">
          {["All", ...ENTRY_TYPES].map(t => (
            <Button key={t} size="sm" variant={filterType === t ? "default" : "outline"} className="text-xs h-7 px-2" onClick={() => setFilterType(t)}>{t}</Button>
          ))}
        </div>
        <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={() => { setForm(emptyForm); setEditingEntry(null); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-1" />Add Entry
        </Button>
      </div>

      {/* Timeline */}
      {isLoading ? (
        <div className="text-center py-10 text-slate-400">Loading history…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10 text-slate-400">
          <Clock className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p>No history entries yet. Add one above.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {years.map(year => (
            <div key={year}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-sm">{year}</div>
                <div className="flex-1 h-px bg-slate-200" />
              </div>
              <div className="ml-5 border-l-2 border-slate-200 space-y-3 pl-4">
                {grouped[year].map(entry => {
                  const Icon = TYPE_ICONS[entry.entry_type] || FileText;
                  return (
                    <div key={entry.id} className="relative">
                      <div className="absolute -left-[21px] top-3 w-4 h-4 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      </div>
                      <Card className="bg-white shadow-sm border hover:shadow-md transition-shadow">
                        <CardContent className="p-3">
                          <div className="flex items-start gap-2">
                            <div className={`p-1.5 rounded-lg border flex-shrink-0 ${TYPE_COLORS[entry.entry_type] || "bg-slate-100"}`}>
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-sm text-slate-900">{entry.title}</span>
                                <Badge className={`text-xs border ${TYPE_COLORS[entry.entry_type]}`}>{entry.entry_type}</Badge>
                                {entry.severity && <Badge className={`text-xs ${SEVERITY_COLORS[entry.severity]}`}>{entry.severity}</Badge>}
                                {entry.is_active === false && <Badge variant="outline" className="text-xs">Resolved</Badge>}
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5 flex gap-3 flex-wrap">
                                {entry.entry_date && <span>{format(new Date(entry.entry_date), "dd MMM yyyy")}</span>}
                                {entry.doctor_name && <span>Dr. {entry.doctor_name}</span>}
                                {entry.facility && <span>{entry.facility}</span>}
                              </div>
                              {entry.description && <p className="text-xs text-slate-700 mt-1">{entry.description}</p>}
                              {entry.outcome && <p className="text-xs text-green-700 mt-1 bg-green-50 rounded px-2 py-0.5">Outcome: {entry.outcome}</p>}
                              {entry.tags?.length > 0 && (
                                <div className="flex gap-1 mt-1 flex-wrap">
                                  {entry.tags.map((t, i) => <Badge key={i} variant="outline" className="text-xs">{t}</Badge>)}
                                </div>
                              )}
                              {entry.reference_links?.length > 0 && (
                                <div className="flex gap-2 flex-wrap mt-1">
                                  {entry.reference_links.map((r, i) => (
                                    <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">
                                      <ExternalLink className="w-3 h-3" />{r.title}
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-1 flex-shrink-0">
                              <Button size="icon" variant="ghost" className="h-7 w-7 hover:bg-slate-50" onClick={() => openEdit(entry)}><Edit2 className="w-3.5 h-3.5" /></Button>
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500 hover:bg-red-50" onClick={() => { if (confirm("Delete this entry?")) deleteMutation.mutate(entry.id); }}><Trash2 className="w-3.5 h-3.5" /></Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={(o) => { if (!o) { setShowForm(false); setEditingEntry(null); } }}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEntry ? "Edit History Entry" : "Add History Entry"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Type</Label>
                <Select value={form.entry_type} onValueChange={v => setForm(f => ({ ...f, entry_type: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{ENTRY_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold">Date</Label>
                <Input type="date" value={form.entry_date} onChange={e => setForm(f => ({ ...f, entry_date: e.target.value }))} className="mt-1" />
              </div>
              <div className="col-span-2">
                <Label className="text-xs font-semibold">Title *</Label>
                <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Brief title" className="mt-1" required />
              </div>
              <div>
                <Label className="text-xs font-semibold">Doctor</Label>
                <Input value={form.doctor_name} onChange={e => setForm(f => ({ ...f, doctor_name: e.target.value }))} placeholder="Name" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs font-semibold">Facility</Label>
                <Input value={form.facility} onChange={e => setForm(f => ({ ...f, facility: e.target.value }))} placeholder="Hospital/Clinic" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs font-semibold">Severity</Label>
                <Select value={form.severity || ""} onValueChange={v => setForm(f => ({ ...f, severity: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Optional" /></SelectTrigger>
                  <SelectContent>{SEVERITIES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 mt-5">
                <input type="checkbox" id="is_active" checked={form.is_active !== false} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} />
                <Label htmlFor="is_active" className="text-xs">Still Active/Ongoing</Label>
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold">Description</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Details…" className="mt-1 h-16" />
            </div>
            <div>
              <Label className="text-xs font-semibold">Outcome / Result</Label>
              <Input value={form.outcome} onChange={e => setForm(f => ({ ...f, outcome: e.target.value }))} placeholder="e.g. Resolved with treatment" className="mt-1" />
            </div>

            {/* Tags */}
            <div>
              <Label className="text-xs font-semibold">Tags</Label>
              <div className="flex gap-2 mt-1">
                <Input value={newTag} onChange={e => setNewTag(e.target.value)} placeholder="Add tag" onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); if (newTag.trim()) { setForm(f => ({ ...f, tags: [...(f.tags||[]), newTag.trim()] })); setNewTag(""); } } }} />
                <Button type="button" size="sm" variant="outline" onClick={() => { if (newTag.trim()) { setForm(f => ({ ...f, tags: [...(f.tags||[]), newTag.trim()] })); setNewTag(""); } }}><Plus className="w-4 h-4" /></Button>
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {(form.tags||[]).map((t, i) => (
                  <Badge key={i} variant="outline" className="gap-1 text-xs">{t}<button type="button" onClick={() => setForm(f => ({ ...f, tags: f.tags.filter((_, j) => j !== i) }))}><X className="w-3 h-3" /></button></Badge>
                ))}
              </div>
            </div>

            {/* References */}
            <div>
              <Label className="text-xs font-semibold">Reference Links</Label>
              <div className="flex gap-2 mt-1">
                <Input value={newRefTitle} onChange={e => setNewRefTitle(e.target.value)} placeholder="Label" className="flex-1" />
                <Input value={newRefUrl} onChange={e => setNewRefUrl(e.target.value)} placeholder="https://…" className="flex-1" />
                <Button type="button" size="sm" variant="outline" onClick={addRef}><Plus className="w-4 h-4" /></Button>
              </div>
              {/* Suggested references */}
              {(REFERENCES[form.entry_type] || []).map((r, i) => (
                <button key={i} type="button" className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
                  onClick={() => setForm(f => ({ ...f, reference_links: [...(f.reference_links||[]), r] }))}>
                  <Plus className="w-3 h-3" />Add: {r.title}
                </button>
              ))}
              <div className="space-y-1 mt-1">
                {(form.reference_links||[]).map((r, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <ExternalLink className="w-3 h-3 text-blue-500 flex-shrink-0" />
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate flex-1">{r.title}</a>
                    <button type="button" onClick={() => setForm(f => ({ ...f, reference_links: f.reference_links.filter((_, j) => j !== i) }))}><X className="w-3 h-3 text-red-400" /></button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-1">
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingEntry(null); }}>Cancel</Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingEntry ? "Update" : "Add Entry"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}