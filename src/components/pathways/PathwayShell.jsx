import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  FileText, GitBranch, BookOpen, FlaskConical, Edit, Save, X,
  Plus, Trash2, Link as LinkIcon, ExternalLink, Image as ImageIcon, Info
} from "lucide-react";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { toast } from "sonner";

/**
 * PathwayShell — wraps any pathway content with Overview / Algorithm / Histology&Genetics / Refs tabs
 * + admin edit controls.
 *
 * Props:
 *  - title (string)
 *  - category (string)
 *  - guidelineKeywords (string) — used for Guidelines deep-link search
 *  - overview (ReactNode | null)       — overview content to render
 *  - algorithm (ReactNode | null)      — algorithm content (images etc)
 *  - histologyGenetics (ReactNode | null)
 *  - references (array of {text, url})
 *  - children — main pathway content (shown in "Pathway" tab)
 *  - isAdmin (bool)
 *  - extraImages (array of {url, caption}) — admin-uploaded images
 *  - onSaveImages (fn)
 */
export default function PathwayShell({
  title,
  category,
  guidelineKeywords,
  overview,
  algorithm,
  histologyGenetics,
  references = [],
  children,
  isAdmin = false,
  extraImages = [],
  onSaveImages,
}) {
  const [activeTab, setActiveTab] = useState("pathway");
  const [editMode, setEditMode] = useState(false);
  const [localImages, setLocalImages] = useState(extraImages);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageCaption, setNewImageCaption] = useState("");
  const [localRefs, setLocalRefs] = useState(references);
  const [newRefText, setNewRefText] = useState("");
  const [newRefUrl, setNewRefUrl] = useState("");

  const guidelinesUrl = createPageUrl("Guidelines") +
    (guidelineKeywords ? `?q=${encodeURIComponent(guidelineKeywords)}` : "");

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    setLocalImages(prev => [...prev, { url: newImageUrl.trim(), caption: newImageCaption.trim() }]);
    setNewImageUrl("");
    setNewImageCaption("");
  };

  const handleAddRef = () => {
    if (!newRefText.trim()) return;
    setLocalRefs(prev => [...prev, { text: newRefText.trim(), url: newRefUrl.trim() }]);
    setNewRefText("");
    setNewRefUrl("");
  };

  const handleSave = () => {
    if (onSaveImages) onSaveImages({ images: localImages, refs: localRefs });
    setEditMode(false);
    toast.success("Changes saved");
  };

  return (
    <div className="space-y-3">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">{category}</Badge>
          <Link to={guidelinesUrl}>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1 text-blue-700 border-blue-300">
              <BookOpen className="w-3 h-3" />
              Full Guideline
            </Button>
          </Link>
        </div>
        {isAdmin && !editMode && (
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1 text-amber-700 border-amber-300" onClick={() => setEditMode(true)}>
            <Edit className="w-3 h-3" />
            Edit (Admin)
          </Button>
        )}
        {isAdmin && editMode && (
          <div className="flex gap-1">
            <Button size="sm" className="h-7 text-xs bg-green-600 gap-1" onClick={handleSave}>
              <Save className="w-3 h-3" />
              Save
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => setEditMode(false)}>
              <X className="w-3 h-3" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Main tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 h-auto text-xs">
          <TabsTrigger value="pathway" className="flex flex-col gap-0.5 py-2">
            <GitBranch className="w-3.5 h-3.5" />
            <span className="text-[10px]">Pathway</span>
          </TabsTrigger>
          <TabsTrigger value="overview" className="flex flex-col gap-0.5 py-2">
            <FileText className="w-3.5 h-3.5" />
            <span className="text-[10px]">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="algorithm" className="flex flex-col gap-0.5 py-2">
            <FlaskConical className="w-3.5 h-3.5" />
            <span className="text-[10px]">Algorithm</span>
          </TabsTrigger>
          <TabsTrigger value="histology" className="flex flex-col gap-0.5 py-2">
            <ImageIcon className="w-3.5 h-3.5" />
            <span className="text-[10px]">Histo/Genetics</span>
          </TabsTrigger>
          <TabsTrigger value="refs" className="flex flex-col gap-0.5 py-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span className="text-[10px]">📚 Refs</span>
          </TabsTrigger>
        </TabsList>

        {/* ── Pathway tab ── */}
        <TabsContent value="pathway" className="mt-4">
          {children}
          {/* Extra images if any */}
          {localImages.length > 0 && (
            <div className="mt-4 space-y-3">
              <h4 className="font-semibold text-slate-700 text-sm flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Additional Images / Algorithms
              </h4>
              <div className="grid sm:grid-cols-2 gap-3">
                {localImages.map((img, i) => (
                  <div key={i} className="relative group">
                    <img src={img.url} alt={img.caption || "Clinical image"} className="rounded-lg border border-slate-200 w-full object-contain max-h-64" />
                    {img.caption && <p className="text-xs text-slate-500 mt-1 text-center">{img.caption}</p>}
                    {editMode && (
                      <button
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setLocalImages(prev => prev.filter((_, j) => j !== i))}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Admin: add image in pathway tab too */}
          {editMode && (
            <Card className="mt-4 border-amber-200">
              <CardHeader className="py-2 px-4 bg-amber-50">
                <CardTitle className="text-sm">Add Image / Algorithm (Admin)</CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-2">
                <Input placeholder="Image URL" value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} className="text-xs" />
                <Input placeholder="Caption (optional)" value={newImageCaption} onChange={e => setNewImageCaption(e.target.value)} className="text-xs" />
                <Button size="sm" onClick={handleAddImage} className="text-xs bg-amber-600"><Plus className="w-3 h-3 mr-1" />Add</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── Overview tab ── */}
        <TabsContent value="overview" className="mt-4">
          {overview ? overview : (
            <Alert className="bg-slate-50 border-slate-200">
              <Info className="w-4 h-4 text-slate-500" />
              <AlertDescription className="text-slate-600">
                Overview content coming soon.{" "}
                <Link to={guidelinesUrl} className="text-blue-600 underline">View full guideline →</Link>
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* ── Algorithm tab ── */}
        <TabsContent value="algorithm" className="mt-4">
          {algorithm ? algorithm : (
            <Alert className="bg-slate-50 border-slate-200">
              <Info className="w-4 h-4 text-slate-500" />
              <AlertDescription className="text-slate-600">
                Algorithm / flowchart content coming soon.{isAdmin && " Add via Edit (Admin)."}
              </AlertDescription>
            </Alert>
          )}
          {editMode && (
            <Card className="mt-4 border-amber-200">
              <CardHeader className="py-2 px-4 bg-amber-50">
                <CardTitle className="text-sm">Add Algorithm Image (Admin)</CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-2">
                <Input placeholder="Image URL" value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} className="text-xs" />
                <Input placeholder="Caption (optional)" value={newImageCaption} onChange={e => setNewImageCaption(e.target.value)} className="text-xs" />
                <Button size="sm" onClick={handleAddImage} className="text-xs bg-amber-600"><Plus className="w-3 h-3 mr-1" />Add</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── Histology/Genetics tab ── */}
        <TabsContent value="histology" className="mt-4">
          {histologyGenetics ? histologyGenetics : (
            <Alert className="bg-slate-50 border-slate-200">
              <Info className="w-4 h-4 text-slate-500" />
              <AlertDescription className="text-slate-600">
                Histology / Genetics content coming soon.{isAdmin && " Add via Edit (Admin)."}
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* ── References tab ── */}
        <TabsContent value="refs" className="mt-4">
          <Card>
            <CardHeader className="bg-blue-50 border-b py-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                References & Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2">
                {localRefs.length === 0 && (
                  <p className="text-sm text-slate-400 italic">No references added yet.</p>
                )}
                {localRefs.map((ref, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm group">
                    <span className="text-slate-400 font-mono text-xs mt-0.5">{i + 1}.</span>
                    <div className="flex-1">
                      <span className="text-slate-700">{ref.text}</span>
                      {ref.url && (
                        <a href={ref.url} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 hover:underline text-xs">
                          <ExternalLink className="w-3 h-3 inline" /> DOI/Link
                        </a>
                      )}
                    </div>
                    {editMode && (
                      <button onClick={() => setLocalRefs(prev => prev.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {editMode && (
                <div className="mt-4 border-t pt-4 space-y-2">
                  <Label className="text-xs font-semibold text-amber-700">Add Reference (Admin)</Label>
                  <Textarea placeholder="Reference text (author, title, journal, year, DOI)" value={newRefText} onChange={e => setNewRefText(e.target.value)} className="text-xs min-h-[60px]" />
                  <Input placeholder="URL / DOI link (optional)" value={newRefUrl} onChange={e => setNewRefUrl(e.target.value)} className="text-xs" />
                  <Button size="sm" onClick={handleAddRef} className="text-xs bg-blue-600"><Plus className="w-3 h-3 mr-1" />Add Reference</Button>
                </div>
              )}
              <div className="mt-4 pt-3 border-t">
                <Link to={guidelinesUrl}>
                  <Button variant="outline" size="sm" className="text-xs gap-1 text-blue-700 border-blue-300 w-full">
                    <ExternalLink className="w-3 h-3" />
                    View Full Guideline in Guidelines Section →
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}