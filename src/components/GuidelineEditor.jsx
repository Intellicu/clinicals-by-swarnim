import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Upload, Loader2, FileText, Save, X } from "lucide-react";
import RichTextEditor from "./RichTextEditor";
import { base44 } from "@/api/client";
import { toast } from "sonner";

const evidenceLevels = [
  "High Quality Evidence",
  "Moderate Quality Evidence",
  "Low Quality Evidence",
  "Expert Opinion"
];

const categories = [
  "AKI", "CKD", "Nephrotic Syndrome", "Hypertension", "Electrolytes",
  "Acid-Base", "RTA", "Stones", "Dialysis", "Transplant",
  "Glomerular Diseases", "Tubular Disorders", "Immunisation",
  "General Pediatrics", "Neonatology", "Infection", "General"
];

export default function GuidelineEditor({ initialData, onSave, onCancel }) {
  const [editedData, setEditedData] = useState(initialData || {
    title: "",
    source: "",
    year: new Date().getFullYear(),
    category: "General",
    evidence_level: "Moderate Quality Evidence",
    scope_and_population: "",
    key_recommendations: [""],
    practice_pearls: [""],
    content: { sections: [] },
    external_link: "",
    pdf_url: "",
    images: [],
    population: [],
    clinical_scope: []
  });

  const [pdfFile, setPdfFile] = useState(null);
  const [extracting, setExtracting] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);

  const handlePDFExtraction = async () => {
    if (!pdfFile) return;
    
    setExtracting(true);
    toast.info("Uploading and extracting guideline from PDF...", { id: "pdf-extract" });

    const { file_url } = await base44.integrations.Core.UploadFile({ file: pdfFile });
    
    const extractionSchema = {
      type: "object",
      properties: {
        title: { type: "string" },
        source: { type: "string" },
        year: { type: "number" },
        scope_and_population: { type: "string" },
        key_recommendations: { type: "array", items: { type: "string" } },
        practice_pearls: { type: "array", items: { type: "string" } },
        evidence_level: { type: "string" },
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
        }
      }
    };

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Extract comprehensive guideline information from this pediatric nephrology guideline PDF. 

Extract:
1. Title, source organization, publication year
2. Clinical summary: 2-3 sentences covering WHO (target population), WHEN (clinical scenarios), WHAT (main approach/scope)
3. Key management steps: 6-10 sequential, actionable algorithm steps with specific thresholds and decision points
4. Practice pearls: 4-6 bedside implementation tips, important clinical details, pitfalls to avoid
5. Evidence level (High/Moderate/Low Quality Evidence or Expert Opinion)
6. Detailed sections with headings, content, and key points

Focus on making it clinically actionable for pediatric nephrologists and trainees. Include specific drug doses, thresholds, monitoring parameters where mentioned.`,
      file_urls: [file_url],
      response_json_schema: extractionSchema
    });

    setEditedData({
      ...editedData,
      title: result.title || editedData.title,
      source: result.source || editedData.source,
      year: result.year || editedData.year,
      scope_and_population: result.scope_and_population || editedData.scope_and_population,
      key_recommendations: result.key_recommendations?.filter(r => r.trim()) || editedData.key_recommendations,
      practice_pearls: result.practice_pearls?.filter(p => p.trim()) || editedData.practice_pearls,
      evidence_level: result.evidence_level || editedData.evidence_level,
      content: { sections: result.sections || [] },
      pdf_url: file_url
    });

    setExtracting(false);
    toast.success("Guideline extracted successfully!", { id: "pdf-extract" });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file,
      caption: "",
      type: "figure"
    }));
    setImageFiles(prev => [...prev, ...newImages]);
    toast.success(`${files.length} image(s) selected`);
  };

  const handleSave = async () => {
    // Upload images
    const uploadedImages = [];
    if (imageFiles.length > 0) {
      toast.info("Uploading images...", { id: "upload-images" });
      for (const imgData of imageFiles) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: imgData.file });
        uploadedImages.push({
          url: file_url,
          caption: imgData.caption || imgData.file.name,
          type: imgData.type || "figure"
        });
      }
      toast.success("Images uploaded!", { id: "upload-images" });
    }

    const finalData = {
      ...editedData,
      key_recommendations: editedData.key_recommendations.filter(r => r.trim()),
      practice_pearls: editedData.practice_pearls.filter(p => p.trim()),
      images: [...(editedData.images || []), ...uploadedImages]
    };

    onSave(finalData);
  };

  return (
    <div className="space-y-8">
      {/* PDF Upload & Extraction */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-300">
        <CardContent className="p-6">
          <Label className="text-lg font-bold text-purple-900 mb-3 block flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Upload Guideline PDF (AI Extraction)
          </Label>
          <div className="flex gap-3">
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setPdfFile(e.target.files[0])}
              className="flex-1 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
            />
            <Button
              onClick={handlePDFExtraction}
              disabled={!pdfFile || extracting}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {extracting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Extracting...</>
              ) : (
                <><Upload className="w-4 h-4 mr-2" />Extract Data</>
              )}
            </Button>
          </div>
          <p className="text-xs text-purple-700 mt-2">Upload a PDF and AI will automatically extract title, summary, steps, pearls, and content</p>
        </CardContent>
      </Card>

      {/* Basic Metadata */}
      <div className="bg-slate-50 p-6 rounded-xl border-2 border-slate-200">
        <h3 className="font-bold text-lg text-slate-900 mb-4">Metadata</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Title *</Label>
            <Input
              value={editedData.title}
              onChange={(e) => setEditedData({ ...editedData, title: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Source Organization *</Label>
            <Input
              value={editedData.source}
              onChange={(e) => setEditedData({ ...editedData, source: e.target.value })}
              placeholder="e.g., KDIGO, IPNA, ISPN"
              className="mt-1"
            />
          </div>
          <div>
            <Label>Category *</Label>
            <Select
              value={editedData.category}
              onValueChange={(val) => setEditedData({ ...editedData, category: val })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Year *</Label>
            <Input
              type="number"
              value={editedData.year}
              onChange={(e) => setEditedData({ ...editedData, year: parseInt(e.target.value) })}
              className="mt-1"
            />
          </div>
          <div className="md:col-span-2">
            <Label>Evidence Level</Label>
            <Select
              value={editedData.evidence_level}
              onValueChange={(val) => setEditedData({ ...editedData, evidence_level: val })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {evidenceLevels.map(level => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label>External Link</Label>
            <Input
              value={editedData.external_link}
              onChange={(e) => setEditedData({ ...editedData, external_link: e.target.value })}
              placeholder="https://..."
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Clinical Summary */}
      <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200">
        <Label className="text-lg font-bold text-blue-900 mb-3 block">
          Clinical Summary (Who, When, What) *
        </Label>
        <Textarea
          value={editedData.scope_and_population}
          onChange={(e) => setEditedData({ ...editedData, scope_and_population: e.target.value })}
          placeholder="2-3 sentences: Target population, clinical scenarios, main approach..."
          className="h-32 text-base"
        />
      </div>

      {/* Key Management Steps */}
      <div className="bg-green-50 p-6 rounded-xl border-2 border-green-200">
        <Label className="text-lg font-bold text-green-900 mb-3 block">
          Key Management Steps (Sequential Algorithm)
        </Label>
        <div className="space-y-3">
          {editedData.key_recommendations.map((rec, idx) => (
            <div key={idx} className="flex gap-2">
              <Badge className="bg-green-600 text-white flex-shrink-0 h-10 flex items-center px-3 text-sm font-bold">
                Step {idx + 1}
              </Badge>
              <Textarea
                value={rec}
                onChange={(e) => {
                  const updated = [...editedData.key_recommendations];
                  updated[idx] = e.target.value;
                  setEditedData({ ...editedData, key_recommendations: updated });
                }}
                placeholder="Specific actionable step..."
                className="flex-1"
                rows={2}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const updated = editedData.key_recommendations.filter((_, i) => i !== idx);
                  setEditedData({ ...editedData, key_recommendations: updated });
                }}
                className="flex-shrink-0 h-10 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button
            onClick={() => setEditedData({
              ...editedData,
              key_recommendations: [...editedData.key_recommendations, ""]
            })}
            variant="outline"
            className="w-full border-green-400 hover:bg-green-100"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Step
          </Button>
        </div>
      </div>

      {/* Practice Pearls */}
      <div className="bg-amber-50 p-6 rounded-xl border-2 border-amber-200">
        <Label className="text-lg font-bold text-amber-900 mb-3 block">
          Practice Pearls (Clinical Tips & Key Details)
        </Label>
        <div className="space-y-3">
          {editedData.practice_pearls.map((pearl, idx) => (
            <div key={idx} className="flex gap-2">
              <Textarea
                value={pearl}
                onChange={(e) => {
                  const updated = [...editedData.practice_pearls];
                  updated[idx] = e.target.value;
                  setEditedData({ ...editedData, practice_pearls: updated });
                }}
                placeholder="Practical tip, pitfall, important detail..."
                className="flex-1"
                rows={2}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const updated = editedData.practice_pearls.filter((_, i) => i !== idx);
                  setEditedData({ ...editedData, practice_pearls: updated });
                }}
                className="flex-shrink-0 h-10 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button
            onClick={() => setEditedData({
              ...editedData,
              practice_pearls: [...editedData.practice_pearls, ""]
            })}
            variant="outline"
            className="w-full border-amber-400 hover:bg-amber-100"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Pearl
          </Button>
        </div>
      </div>

      {/* Rich Content Sections */}
      <div className="bg-purple-50 p-6 rounded-xl border-2 border-purple-200">
        <Label className="text-lg font-bold text-purple-900 mb-3 block">
          Detailed Content Sections
        </Label>
        <p className="text-sm text-purple-700 mb-4">Add detailed sections with rich formatting, tables, and links</p>
        <div className="space-y-6">
          {editedData.content?.sections?.map((section, idx) => (
            <div key={idx} className="bg-white p-4 rounded-lg border-2 border-purple-300">
              <div className="flex justify-between items-center mb-3">
                <Label className="font-semibold">Section {idx + 1}</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const updated = { ...editedData };
                    updated.content.sections = updated.content.sections.filter((_, i) => i !== idx);
                    setEditedData(updated);
                  }}
                  className="hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <Input
                value={section.heading}
                onChange={(e) => {
                  const updated = { ...editedData };
                  updated.content.sections[idx].heading = e.target.value;
                  setEditedData(updated);
                }}
                placeholder="Section heading..."
                className="mb-3"
              />
              <RichTextEditor
                value={section.content || ""}
                onChange={(value) => {
                  const updated = { ...editedData };
                  updated.content.sections[idx].content = value;
                  setEditedData(updated);
                }}
                placeholder="Add detailed content with formatting, tables, lists..."
                className="min-h-[250px]"
              />
            </div>
          ))}
          <Button
            onClick={() => {
              const updated = {
                ...editedData,
                content: {
                  sections: [...(editedData.content?.sections || []), { heading: "", content: "" }]
                }
              };
              setEditedData(updated);
            }}
            variant="outline"
            className="w-full border-purple-400 hover:bg-purple-100"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Content Section
          </Button>
        </div>
      </div>

      {/* Images Upload */}
      <div className="bg-cyan-50 p-6 rounded-xl border-2 border-cyan-200">
        <Label className="text-lg font-bold text-cyan-900 mb-3 block">
          Tables, Algorithms & Images
        </Label>
        
        {editedData.images && editedData.images.length > 0 && (
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            {editedData.images.map((img, idx) => (
              <div key={idx} className="border rounded-lg overflow-hidden bg-white relative">
                <img src={img.url} alt={img.caption} className="w-full h-32 object-cover" />
                <div className="p-2 text-xs">
                  <Badge className="bg-cyan-600 text-white mb-1">{img.type}</Badge>
                  <p className="text-slate-700 truncate">{img.caption}</p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    const updated = editedData.images.filter((_, i) => i !== idx);
                    setEditedData({ ...editedData, images: updated });
                  }}
                  className="absolute top-1 right-1 h-6 w-6 p-0"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="border-2 border-dashed border-cyan-300 rounded-lg p-4 bg-white">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-cyan-100 file:text-cyan-700 hover:file:bg-cyan-200"
          />
          {imageFiles.length > 0 && (
            <div className="mt-3 space-y-2">
              {imageFiles.map((img, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-cyan-50 p-2 rounded text-xs">
                  <span className="font-medium">{img.file.name}</span>
                  <Select
                    value={img.type}
                    onValueChange={(val) => {
                      const updated = [...imageFiles];
                      updated[idx].type = val;
                      setImageFiles(updated);
                    }}
                  >
                    <SelectTrigger className="w-28 h-7">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="table">Table</SelectItem>
                      <SelectItem value="flowchart">Flowchart</SelectItem>
                      <SelectItem value="algorithm">Algorithm</SelectItem>
                      <SelectItem value="figure">Figure</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Caption"
                    value={img.caption}
                    onChange={(e) => {
                      const updated = [...imageFiles];
                      updated[idx].caption = e.target.value;
                      setImageFiles(updated);
                    }}
                    className="h-7 flex-1"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 sticky bottom-0 bg-white p-4 border-t-2">
        <Button
          onClick={handleSave}
          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 py-6 text-lg font-semibold"
        >
          <Save className="w-5 h-5 mr-2" />
          Save Guideline
        </Button>
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex-1 py-6 text-lg border-2"
        >
          <X className="w-5 h-5 mr-2" />
          Cancel
        </Button>
      </div>
    </div>
  );
}