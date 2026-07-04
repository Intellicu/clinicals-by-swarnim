/**
 * AdminEditWrapper
 * Wraps any content section — admin users see an Edit (pencil) button top-right.
 * Non-admins see content unchanged.
 * Usage:
 *   <AdminEditWrapper title="Pathway Title" content={content} onSave={fn} onDelete={fn}>
 *     {children}
 *   </AdminEditWrapper>
 */
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Save, X, Loader2, Sparkles, Globe, FileText } from "lucide-react";
import { base44 } from "@/api/client";
import { toast } from "sonner";
import { useAdminStatus } from "@/lib/useAdminStatus";

export default function AdminEditWrapper({ children, title, contentText, onSave, onDelete, allowAIGenerate = false }) {
  const isAdmin = useAdminStatus();
  const [open, setOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(title || '');
  const [editContent, setEditContent] = useState(contentText || '');
  const [generating, setGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiMode, setAiMode] = useState(null); // 'web' | 'upload'
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  if (!isAdmin) return <>{children}</>;

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploadedUrl(file_url);
      toast.success('Document uploaded. Now click Generate.');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleAIGenerate = async () => {
    if (!aiPrompt && !uploadedUrl) {
      toast.error('Enter a topic or upload a document first');
      return;
    }
    setGenerating(true);
    try {
      const prompt = aiMode === 'upload' && uploadedUrl
        ? `Extract and structure the clinical content from this document into a well-formatted clinical pathway/information section for: "${editTitle || aiPrompt}". Include key recommendations, diagnostic criteria, management steps, and clinical pearls. Format as clear paragraphs with headings.`
        : `Generate a comprehensive, evidence-based clinical pathway/information section for: "${aiPrompt || editTitle}". Include epidemiology, diagnostic approach, management algorithm, monitoring, and key clinical pearls relevant to Indian pediatric practice. Format clearly with headings.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: aiMode === 'web',
        file_urls: uploadedUrl ? [uploadedUrl] : undefined,
        model: 'claude_sonnet_4_6'
      });
      setEditContent(result);
      toast.success('AI content generated — review and save');
    } catch {
      toast.error('AI generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = () => {
    if (onSave) onSave({ title: editTitle, content: editContent });
    setOpen(false);
    toast.success('Content saved');
  };

  const handleDelete = () => {
    if (!window.confirm('Delete this section? This cannot be undone.')) return;
    if (onDelete) onDelete();
    setOpen(false);
  };

  return (
    <div className="relative group">
      {children}
      {/* Admin floating edit button */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10">
        <Button
          size="sm"
          variant="outline"
          className="h-7 px-2 bg-white border-blue-300 text-blue-600 hover:bg-blue-50 shadow-md text-xs"
          onClick={() => { setEditTitle(title || ''); setEditContent(contentText || ''); setOpen(true); }}
        >
          <Pencil className="w-3 h-3 mr-1" /> Edit
        </Button>
        {onDelete && (
          <Button size="sm" variant="outline" className="h-7 px-2 bg-white border-red-300 text-red-600 hover:bg-red-50 shadow-md" onClick={handleDelete}>
            <Trash2 className="w-3 h-3" />
          </Button>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-4 h-4 text-blue-600" /> Admin Edit
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Section Title</label>
              <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="Section title..." />
            </div>

            {allowAIGenerate && (
              <div className="border border-purple-200 rounded-lg p-3 bg-purple-50">
                <p className="text-xs font-semibold text-purple-800 mb-2 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> AI Generate Content
                </p>
                <div className="flex gap-2 mb-2">
                  <Button size="sm" variant={aiMode === 'web' ? 'default' : 'outline'} className="text-xs h-7" onClick={() => setAiMode('web')}>
                    <Globe className="w-3 h-3 mr-1" /> Web Search
                  </Button>
                  <Button size="sm" variant={aiMode === 'upload' ? 'default' : 'outline'} className="text-xs h-7" onClick={() => setAiMode('upload')}>
                    <FileText className="w-3 h-3 mr-1" /> Upload Doc
                  </Button>
                </div>
                {aiMode === 'upload' && (
                  <div className="mb-2">
                    <input type="file" accept=".pdf,.docx,.jpg,.png,.jpeg" id="admin-upload" className="hidden" onChange={handleFileUpload} />
                    <label htmlFor="admin-upload" className="cursor-pointer text-xs text-purple-700 underline">
                      {uploading ? 'Uploading...' : uploadedUrl ? '✓ Document ready' : 'Click to upload PDF/image'}
                    </label>
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    value={aiPrompt}
                    onChange={e => setAiPrompt(e.target.value)}
                    placeholder={aiMode === 'upload' ? 'Describe what to extract...' : 'Topic to search/generate...'}
                    className="text-xs h-8"
                  />
                  <Button size="sm" className="h-8 bg-purple-600 hover:bg-purple-700 text-xs whitespace-nowrap" onClick={handleAIGenerate} disabled={generating}>
                    {generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1" />}
                    {generating ? 'Generating...' : 'Generate'}
                  </Button>
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Content</label>
              <Textarea
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                placeholder="Section content..."
                className="min-h-48 text-sm font-mono"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2 border-t">
              <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
                <X className="w-3 h-3 mr-1" /> Cancel
              </Button>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={handleSave}>
                <Save className="w-3 h-3 mr-1" /> Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}