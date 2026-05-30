import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BookOpen, Upload, Search, FileText, Link as LinkIcon, Trash2, Plus, Loader2, ExternalLink, Tag } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = ["Nephrology", "Pediatrics", "Nutrition", "Cardiology", "Emergency", "Guidelines", "Local Protocol", "Treatment Template", "Research", "Other"];
const LINKED_TOOLS = ["NS Protocol", "AKI Pathway", "Hypertension", "CKD", "Dialysis", "Transplant", "Glomerular Diseases", "Rare Disease", "Drug Dosing", "Calculators", "General"];

export default function ClinicalReferenceLibrary() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [filterLinked, setFilterLinked] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: "", category: "Nephrology", description: "", linked_tool: "", external_url: "", file_url: "", tags: "" });

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ["ref-library"],
    queryFn: () => base44.entities.CustomSection.filter({ section_type: "reference_library" }, "-created_date", 100),
  });

  const addMutation = useMutation({
    mutationFn: (data) => base44.entities.CustomSection.create({
      title: data.title,
      name: data.title,
      section_type: "reference_library",
      status: "published",
      description: data.description,
      content: {
        category: data.category,
        linked_tool: data.linked_tool,
        external_url: data.external_url,
        file_url: data.file_url,
        tags: data.tags.split(",").map(t => t.trim()).filter(Boolean),
      },
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ref-library"] });
      toast.success("Document added to library");
      setShowAdd(false);
      setForm({ title: "", category: "Nephrology", description: "", linked_tool: "", external_url: "", file_url: "", tags: "" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CustomSection.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ref-library"] });
      toast.success("Removed from library");
    },
  });

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm(f => ({ ...f, file_url, title: f.title || file.name.replace(/\.[^/.]+$/, "") }));
      toast.success("File uploaded");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const filtered = docs.filter(d => {
    const matchSearch = !search || d.title?.toLowerCase().includes(search.toLowerCase()) || d.description?.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "all" || d.content?.category === filterCat;
    const matchLinked = filterLinked === "all" || d.content?.linked_tool === filterLinked;
    return matchSearch && matchCat && matchLinked;
  });

  const categoryColors = {
    "Nephrology": "bg-blue-100 text-blue-800",
    "Emergency": "bg-red-100 text-red-800",
    "Local Protocol": "bg-green-100 text-green-800",
    "Treatment Template": "bg-purple-100 text-purple-800",
    "Guidelines": "bg-amber-100 text-amber-800",
    "Research": "bg-indigo-100 text-indigo-800",
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-900">Clinical Reference Library</h1>
            <p className="text-sm text-slate-500">Store PDFs, guidelines, local protocols and treatment templates</p>
          </div>
          <Button size="sm" className="bg-green-600 hover:bg-green-700 gap-1.5" onClick={() => setShowAdd(true)}>
            <Plus className="w-4 h-4" /> Add Document
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-40">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input className="pl-9 bg-white" placeholder="Search documents…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={filterCat} onValueChange={setFilterCat}>
            <SelectTrigger className="w-44 bg-white"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterLinked} onValueChange={setFilterLinked}>
            <SelectTrigger className="w-44 bg-white"><SelectValue placeholder="Linked Tool" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tools</SelectItem>
              {LINKED_TOOLS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Results */}
        {isLoading && (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading library...
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No documents found</p>
            <p className="text-sm mt-1">Add your first reference document to get started</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-3">
          {filtered.map(doc => (
            <Card key={doc.id} className="border border-slate-200 hover:border-green-300 hover:shadow-md transition-all">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-green-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 text-sm leading-tight">{doc.title}</h3>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {doc.content?.category && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColors[doc.content.category] || "bg-slate-100 text-slate-700"}`}>
                          {doc.content.category}
                        </span>
                      )}
                      {doc.content?.linked_tool && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                          <LinkIcon className="w-2.5 h-2.5" /> {doc.content.linked_tool}
                        </span>
                      )}
                    </div>
                    {doc.description && <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">{doc.description}</p>}
                    {doc.content?.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {doc.content.tags.map(t => (
                          <span key={t} className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <Tag className="w-2.5 h-2.5" /> {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    {(doc.content?.file_url || doc.content?.external_url) && (
                      <a href={doc.content.file_url || doc.content.external_url} target="_blank" rel="noreferrer">
                        <Button size="sm" variant="outline" className="h-7 w-7 p-0">
                          <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                        </Button>
                      </a>
                    )}
                    <Button size="sm" variant="outline" className="h-7 w-7 p-0 border-red-200" onClick={() => deleteMutation.mutate(doc.id)}>
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Add Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Reference Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Title *</label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. ISPN 2022 NS Guidelines" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Category</label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Link to Tool</label>
                <Select value={form.linked_tool} onValueChange={v => setForm(f => ({ ...f, linked_tool: v }))}>
                  <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>None</SelectItem>
                    {LINKED_TOOLS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Description</label>
              <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description of this document" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">External URL (optional)</label>
              <Input value={form.external_url} onChange={e => setForm(f => ({ ...f, external_url: e.target.value }))} placeholder="https://..." />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Upload PDF</label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-3 text-center cursor-pointer hover:border-green-400 transition-colors">
                <input type="file" accept=".pdf,.docx,.png,.jpg" className="hidden" id="lib-upload" onChange={handleUpload} />
                <label htmlFor="lib-upload" className="cursor-pointer">
                  {uploading ? (
                    <div className="flex items-center justify-center gap-2 text-slate-500"><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</div>
                  ) : form.file_url ? (
                    <span className="text-green-600 font-medium text-sm">✓ File uploaded</span>
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-slate-400"><Upload className="w-4 h-4" /> <span className="text-sm">Upload PDF / Image</span></div>
                  )}
                </label>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Tags (comma-separated)</label>
              <Input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="e.g. ISPN, steroid, pediatric" />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={!form.title || addMutation.isPending}
                onClick={() => addMutation.mutate(form)}
              >
                {addMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
                Add to Library
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}