/**
 * AdminPathwayGenerator
 * Floating admin panel to generate new pathways/tools/sections via AI.
 * Only visible to admin users.
 */
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Globe, FileText, Plus, Save, Loader2, Eye, Trash2, Edit3 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { useAdminStatus } from "@/lib/useAdminStatus";

const CONTENT_TYPES = [
  { value: 'pathway', label: 'Clinical Pathway' },
  { value: 'tool', label: 'Clinical Tool' },
  { value: 'guideline_summary', label: 'Guideline Summary' },
  { value: 'drug_info', label: 'Drug Information' },
  { value: 'calculator', label: 'Clinical Calculator' },
  { value: 'general', label: 'General Section' },
];

export default function AdminPathwayGenerator({ onCreated, specialty = '' }) {
  const isAdmin = useAdminStatus();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState('form'); // 'form' | 'preview' | 'saving'
  const [form, setForm] = useState({
    title: '',
    content_type: 'pathway',
    ai_mode: 'web', // 'web' | 'upload'
    topic: '',
    additional_context: '',
  });
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  if (!isAdmin) return null;

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploadedUrl(file_url);
      toast.success('Document uploaded');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleGenerate = async () => {
    if (!form.title && !form.topic) {
      toast.error('Enter a title or topic');
      return;
    }
    setGenerating(true);
    const topic = form.topic || form.title;
    const typeLabel = CONTENT_TYPES.find(t => t.value === form.content_type)?.label || 'content';
    try {
      const prompt = form.ai_mode === 'upload' && uploadedUrl
        ? `You are a senior pediatric nephrologist creating a comprehensive clinical reference document.
          Extract and structure ALL clinical content from the attached document into a detailed ${typeLabel} for: "${topic}".
          ${specialty ? `Context: ${specialty} pediatric practice.` : ''}
          ${form.additional_context}
          
          Be COMPREHENSIVE and DETAILED — include ALL dosing, monitoring protocols, definitions, decision points.
          Structure the output as JSON:
          - title: string (descriptive title)
          - summary: string (3-5 sentence clinical overview with key facts)
          - sections: array of { heading: string, content: string (detailed paragraph), key_points: string[] (at least 5-8 bullet points each) }
          - clinical_pearls: string[] (at least 8-10 practical tips)
          - references_note: string (list key guidelines with year)`
        : `You are a senior pediatric nephrologist. Generate a COMPREHENSIVE, detailed, evidence-based ${typeLabel} for: "${topic}".
          ${specialty ? `Context: Indian ${specialty} pediatric practice.` : 'Context: Indian pediatric nephrology practice.'}
          ${form.additional_context}
          
          IMPORTANT: Be thorough and detailed. Include:
          - Exact drug doses (mg/kg or mg/m²), max doses, frequency, duration
          - Monitoring protocols (what to check, how often)
          - Definition criteria
          - Decision algorithms (when to escalate, when to change treatment)
          - Indian-specific considerations (cost, availability, TB screening, local guidelines)
          - Side effects and their management
          - Current evidence (cite key trials and guideline years)
          
          Structure as JSON — make each section DETAILED (not just superficial headings):
          - title: string
          - summary: string (4-6 sentences with key clinical facts and guideline basis)
          - sections: array of { heading: string, content: string (detailed 3-6 sentence paragraph with clinical specifics), key_points: string[] (6-10 specific, actionable bullet points with doses/thresholds) }
          - clinical_pearls: string[] (10-12 practical tips, Indian context, common pitfalls)
          - references_note: string`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: form.ai_mode === 'web',
        file_urls: uploadedUrl ? [uploadedUrl] : undefined,
        model: 'claude_sonnet_4_6',
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            summary: { type: "string" },
            sections: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  heading: { type: "string" },
                  content: { type: "string" },
                  key_points: { type: "array", items: { type: "string" } }
                }
              }
            },
            clinical_pearls: { type: "array", items: { type: "string" } },
            references_note: { type: "string" }
          }
        }
      });
      setPreview({ ...result, _raw_topic: topic });
      setStep('preview');
      toast.success('Content generated — review before saving');
    } catch {
      toast.error('AI generation failed. Try a different prompt.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async (publish = false) => {
    setSaving(true);
    try {
      await base44.entities.CustomSection.create({
        title: preview.title || form.title,
        name: preview.title || form.title,
        section_type: form.content_type,
        status: publish ? 'published' : 'draft',
        created_by_admin: true,
        generation_topic: form.topic,
        source_document_url: uploadedUrl,
        content: preview,
        specialty_id: specialty || undefined,
      });
      toast.success(publish ? '✅ Pathway published and added to library!' : 'Saved as draft — review in Admin Content Manager');
      if (onCreated) onCreated();
      setOpen(false);
      setStep('form');
      setPreview(null);
      setUploadedUrl(null);
      setForm({ title: '', content_type: 'pathway', ai_mode: 'web', topic: '', additional_context: '' });
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Trigger button */}
      <Button
        size="sm"
        className="bg-purple-600 hover:bg-purple-700 text-white text-xs gap-1.5 shadow-lg"
        onClick={() => setOpen(true)}
      >
        <Sparkles className="w-3.5 h-3.5" />
        AI Generate
      </Button>

      <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) { setStep('form'); setPreview(null); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              AI Pathway / Content Generator
              <Badge className="bg-purple-100 text-purple-700 text-xs ml-auto">Admin Only</Badge>
            </DialogTitle>
          </DialogHeader>

          {step === 'form' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Content Type</label>
                  <Select value={form.content_type} onValueChange={v => setForm(f => ({ ...f, content_type: v }))}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTENT_TYPES.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">AI Mode</label>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={form.ai_mode === 'web' ? 'default' : 'outline'}
                      className="flex-1 text-xs h-9"
                      onClick={() => setForm(f => ({ ...f, ai_mode: 'web' }))}
                    >
                      <Globe className="w-3 h-3 mr-1" /> Web Search
                    </Button>
                    <Button
                      size="sm"
                      variant={form.ai_mode === 'upload' ? 'default' : 'outline'}
                      className="flex-1 text-xs h-9"
                      onClick={() => setForm(f => ({ ...f, ai_mode: 'upload' }))}
                    >
                      <FileText className="w-3 h-3 mr-1" /> Upload Doc
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Title</label>
                <Input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Focal Segmental Glomerulosclerosis (FSGS) Management Pathway"
                  className="text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">
                  {form.ai_mode === 'upload' ? 'Document Upload' : 'Search Topic / Prompt'}
                </label>
                {form.ai_mode === 'upload' ? (
                  <div className="border-2 border-dashed border-purple-300 rounded-lg p-4 text-center">
                    <input type="file" accept=".pdf,.docx,.jpg,.jpeg,.png" id="gen-upload" className="hidden" onChange={handleFileUpload} />
                    <label htmlFor="gen-upload" className="cursor-pointer">
                      <FileText className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                      <p className="text-sm text-purple-700 font-medium">
                        {uploading ? 'Uploading...' : uploadedUrl ? '✓ Document ready' : 'Click to upload PDF / image'}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">PDF, DOCX, JPG, PNG supported</p>
                    </label>
                  </div>
                ) : (
                  <Input
                    value={form.topic}
                    onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
                    placeholder="e.g. IPNA 2023 FSGS guidelines, management algorithm, Indian pediatric context"
                    className="text-sm"
                  />
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Additional Context (optional)</label>
                <Textarea
                  value={form.additional_context}
                  onChange={e => setForm(f => ({ ...f, additional_context: e.target.value }))}
                  placeholder="Any specific sections, focus areas, or local protocols to include..."
                  className="text-sm min-h-20"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t">
                <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
                <Button
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={handleGenerate}
                  disabled={generating || (form.ai_mode === 'upload' && !uploadedUrl)}
                >
                  {generating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Sparkles className="w-4 h-4 mr-1" />}
                  {generating ? 'Generating...' : 'Generate with AI'}
                </Button>
              </div>
            </div>
          )}

          {step === 'preview' && preview && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Eye className="w-4 h-4 text-purple-600" />
                <span className="font-semibold text-slate-800">Preview Generated Content</span>
                <Button size="sm" variant="outline" className="ml-auto text-xs" onClick={() => setStep('form')}>
                  <Edit3 className="w-3 h-3 mr-1" /> Edit Prompt
                </Button>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 border space-y-3 max-h-96 overflow-y-auto">
                <h3 className="text-lg font-bold text-slate-900">{preview.title}</h3>
                {preview.summary && <p className="text-sm text-slate-600 italic">{preview.summary}</p>}

                {preview.sections?.map((s, i) => (
                  <div key={i} className="border-l-4 border-purple-300 pl-3">
                    <h4 className="font-semibold text-sm text-slate-800 mb-1">{s.heading}</h4>
                    <p className="text-xs text-slate-600 whitespace-pre-wrap">{s.content}</p>
                    {s.key_points?.length > 0 && (
                      <ul className="mt-1 space-y-0.5">
                        {s.key_points.map((kp, j) => (
                          <li key={j} className="text-xs text-slate-600">• {kp}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}

                {preview.clinical_pearls?.length > 0 && (
                  <div className="bg-amber-50 p-3 rounded border border-amber-200">
                    <p className="text-xs font-semibold text-amber-800 mb-1">Clinical Pearls</p>
                    {preview.clinical_pearls.map((p, i) => (
                      <p key={i} className="text-xs text-amber-900">💡 {p}</p>
                    ))}
                  </div>
                )}

                {preview.references_note && (
                  <p className="text-xs text-slate-400 italic">{preview.references_note}</p>
                )}
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t flex-wrap">
                <Button variant="outline" size="sm" onClick={() => setStep('form')}>
                  <Edit3 className="w-3 h-3 mr-1" /> Regenerate
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-slate-400 text-slate-700"
                  onClick={() => handleSave(false)}
                  disabled={saving}
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
                  Save as Draft
                </Button>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleSave(true)}
                  disabled={saving}
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
                  {saving ? 'Publishing...' : 'Approve & Publish'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}