import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Search,
  BookOpen,
  Plus,
  Upload,
  FileText,
  Loader2,
  Image as ImageIcon,
  Award,
  Edit,
  X,
  CheckCircle,
  Sparkles,
  Lightbulb,
  Target,
  Library,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import GuidelineSummaryCard from "../components/GuidelineSummaryCard";
import MultimediaUploader from "../components/guidelines/MultimediaUploader";
import WebImporter from "../components/guidelines/WebImporter";
import SemanticSearch from "../components/guidelines/SemanticSearch";
import GuidelineListView from "../components/guidelines/GuidelineListView";
import PathwayGenerator from "../components/guidelines/PathwayGenerator";

const categories = [
  "All",
  "AKI",
  "CKD",
  "Nephrotic Syndrome",
  "Hypertension",
  "Electrolytes",
  "Acid-Base",
  "RTA",
  "Stones",
  "Dialysis",
  "Transplant",
  "Glomerular Diseases",
  "Tubular Disorders",
  "Immunisation",
  "General Pediatrics",
  "Neonatology",
  "Infection"
];

const evidenceLevels = [
  "High Quality Evidence",
  "Moderate Quality Evidence",
  "Low Quality Evidence",
  "Expert Opinion"
];

export default function Guidelines() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [semanticResults, setSemanticResults] = useState(null);
  const [searchReasoning, setSearchReasoning] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [starredIds, setStarredIds] = useState([]);
  const [selectedForPathway, setSelectedForPathway] = useState([]);
  
  const [newGuideline, setNewGuideline] = useState({
    title: "",
    category: "General",
    source: "",
    year: new Date().getFullYear(),
    summary: "",
    scope_and_population: "",
    key_recommendations: [""],
    practice_pearls: [""],
    pdf_url: "",
    external_link: "",
    evidence_level: "Expert Opinion",
    content: { sections: [] },
    images: [],
    related_calculators: [],
    related_drugs: [],
    keywords: [],
    population: [],
    clinical_scope: []
  });

  const [pdfFile, setPdfFile] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [isExtracting, setIsExtracting] = useState(false);

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: Infinity,
    cacheTime: Infinity,
  });

  const { data: guidelines = [], isLoading } = useQuery({
    queryKey: ['guidelines'],
    queryFn: () => base44.entities.Guideline.list('-year'),
    initialData: [],
  });

  const extractGuidelineFromPDF = async (file) => {
    setIsExtracting(true);
    toast.info("AI extracting guideline data...", { id: "pdf-extract", duration: 30000 });
    
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      const extractionPrompt = `You are a pediatric nephrologist creating a CLINICAL QUICK REFERENCE from this guideline PDF.

Extract and structure the following information with NO REPETITION between sections:

1. CLINICAL SUMMARY (2-3 clear, concise sentences):
   - WHO: Exact patient population (age range, specific condition)
   - WHEN: Specific clinical scenarios/presentations when this applies
   - WHAT: Main clinical approach or intervention
   Example: "For children 1-18 years with biopsy-proven IgA nephropathy presenting with proteinuria. Applies to both acute presentations and chronic management. Uses risk stratification to guide immunosuppression decisions."

2. KEY MANAGEMENT STEPS (6-10 actionable steps in algorithm sequence):
   - Present as STEP-BY-STEP clinical algorithm
   - Each step must be SPECIFIC and ACTIONABLE (not general principles)
   - Include decision criteria, thresholds, or timing
   - Order by clinical workflow
   Example format:
   "1. Obtain 24-hour urine protein OR spot UPCR within 48 hours of presentation"
   "2. Stage disease severity: Mild (<1g/day), Moderate (1-3g/day), Severe (>3g/day)"
   "3. If proteinuria >1g/day AND eGFR >60: Start ACE-I at 0.1 mg/kg/day"

3. PRACTICE PEARLS (4-6 bedside tips):
   - Practical, implementation-focused tips
   - Include common pitfalls to AVOID
   - Shortcuts or clinical tricks
   - Drug-specific dosing tips if relevant
   Example: "Start ACE-I low and titrate slowly to avoid hyperkalemia in CKD patients"

4. EVIDENCE LEVEL: State overall quality clearly with supporting landmark trials if any

BE SPECIFIC. AVOID VAGUE STATEMENTS. NO REPETITION ACROSS SECTIONS.

Also extract:
- Title
- Source organization (KDIGO, IPNA, IAP, ISPD, etc.)
- Year
- Category
- Keywords for search
- Target population age groups
- Clinical scope (Diagnosis, Management, Follow-up, Prevention, Screening)
- External link if mentioned`;

      const extracted = await base44.integrations.Core.InvokeLLM({
        prompt: extractionPrompt,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            source: { type: "string" },
            year: { type: "number" },
            category: { type: "string" },
            summary: { type: "string" },
            scope_and_population: { type: "string" },
            key_recommendations: { 
              type: "array", 
              items: { type: "string" },
              description: "6-10 specific, sequential management steps"
            },
            practice_pearls: { 
              type: "array", 
              items: { type: "string" },
              description: "4-6 bedside implementation tips"
            },
            evidence_level: { type: "string" },
            keywords: { type: "array", items: { type: "string" } },
            population: { type: "array", items: { type: "string" } },
            clinical_scope: { type: "array", items: { type: "string" } },
            external_link: { type: "string" }
          }
        }
      });

      toast.success("AI extraction complete!", { id: "pdf-extract" });
      
      setNewGuideline(prev => ({
        ...prev,
        ...extracted,
        pdf_url: file_url,
        key_recommendations: extracted.key_recommendations || [""],
        practice_pearls: extracted.practice_pearls || [""],
        content: {
          sections: extracted.key_recommendations ? [
            {
              heading: "Key Management Steps",
              key_points: extracted.key_recommendations
            }
          ] : []
        }
      }));
      
    } catch (error) {
      console.error("PDF extraction error:", error);
      toast.error("Could not extract data. Please fill manually.", { id: "pdf-extract" });
      
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        setNewGuideline(prev => ({ ...prev, pdf_url: file_url }));
      } catch (uploadError) {
        toast.error("PDF upload failed");
      }
    } finally {
      setIsExtracting(false);
    }
  };

  const createGuidelineMutation = useMutation({
    mutationFn: async (guidelineData) => {
      const uploadedImages = [];
      if (imageFiles.length > 0) {
        toast.info("Uploading images...", { id: "image-upload" });
        for (const imgData of imageFiles) {
          const { file_url } = await base44.integrations.Core.UploadFile({ file: imgData.file });
          uploadedImages.push({
            url: file_url,
            caption: imgData.caption || imgData.file.name,
            type: imgData.type || "figure"
          });
        }
        toast.success("Images uploaded!", { id: "image-upload" });
      }

      const cleanedData = {
        ...guidelineData,
        key_recommendations: guidelineData.key_recommendations.filter(r => r.trim()),
        practice_pearls: guidelineData.practice_pearls.filter(p => p.trim()),
        keywords: guidelineData.keywords.filter(k => k.trim()),
        images: uploadedImages.length > 0 ? uploadedImages : guidelineData.images,
        created_by: user?.email || "anonymous",
        is_editable: true,
        last_reviewed: new Date().toISOString().split('T')[0],
        status: "Active"
      };

      return base44.entities.Guideline.create(cleanedData);
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guidelines'] });
      setDialogOpen(false);
      resetForm();
      toast.success("Guideline added successfully!");
    },
    onError: (error) => {
      console.error("Error creating guideline:", error);
      toast.error("Failed to add guideline. Check connection and retry.", {
        action: {
          label: 'Retry',
          onClick: () => createGuidelineMutation.mutate(newGuideline)
        }
      });
    }
  });

  const resetForm = () => {
    setNewGuideline({
      title: "",
      category: "General",
      source: "",
      year: new Date().getFullYear(),
      summary: "",
      scope_and_population: "",
      key_recommendations: [""],
      practice_pearls: [""],
      pdf_url: "",
      external_link: "",
      evidence_level: "Expert Opinion",
      content: { sections: [] },
      images: [],
      related_calculators: [],
      related_drugs: [],
      keywords: [],
      population: [],
      clinical_scope: []
    });
    setPdfFile(null);
    setImageFiles([]);
    setIsExtracting(false);
  };

  const handlePDFUpload = async (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      await extractGuidelineFromPDF(file);
    } else if (file) {
      toast.error("Please select a PDF file.");
    }
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

  const addRecommendation = () => {
    setNewGuideline(prev => ({
      ...prev,
      key_recommendations: [...prev.key_recommendations, ""]
    }));
  };

  const updateRecommendation = (index, value) => {
    const updated = [...newGuideline.key_recommendations];
    updated[index] = value;
    setNewGuideline({ ...newGuideline, key_recommendations: updated });
  };

  const removeRecommendation = (index) => {
    const updated = newGuideline.key_recommendations.filter((_, i) => i !== index);
    setNewGuideline({ ...newGuideline, key_recommendations: updated });
  };

  const addPearl = () => {
    setNewGuideline(prev => ({
      ...prev,
      practice_pearls: [...prev.practice_pearls, ""]
    }));
  };

  const updatePearl = (index, value) => {
    const updated = [...newGuideline.practice_pearls];
    updated[index] = value;
    setNewGuideline({ ...newGuideline, practice_pearls: updated });
  };

  const removePearl = (index) => {
    const updated = newGuideline.practice_pearls.filter((_, i) => i !== index);
    setNewGuideline({ ...newGuideline, practice_pearls: updated });
  };

  const filteredGuidelines = semanticResults 
    ? semanticResults.filter(g => activeCategory === "All" || g.category === activeCategory)
    : guidelines.filter(g => {
        const matchesSearch = g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             g.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             g.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             g.keywords?.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCategory = activeCategory === "All" || g.category === activeCategory;
        return matchesSearch && matchesCategory;
      });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
              <Library className="w-9 h-9 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Guidelines Library</h1>
              <p className="text-slate-600 mt-1">Evidence-based clinical references with AI-powered quick summaries</p>
            </div>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg px-6 py-6">
                <Plus className="w-5 h-5 mr-2" />
                Add Guideline
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <Sparkles className="w-6 h-6 text-blue-600" />
                  Add New Guideline - AI-Powered
                </DialogTitle>
              </DialogHeader>
              
              <Tabs defaultValue="upload" className="mt-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="upload">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload PDF
                  </TabsTrigger>
                  <TabsTrigger value="web">
                    <Search className="w-4 h-4 mr-2" />
                    Import from Web
                  </TabsTrigger>
                  <TabsTrigger value="manual">
                    <Edit className="w-4 h-4 mr-2" />
                    Manual
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="space-y-6 mt-4">
                  <div className="border-2 border-dashed border-blue-300 rounded-xl p-10 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mb-4 shadow-xl">
                        <Upload className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="font-bold text-blue-900 mb-2 text-xl">Upload Clinical Guideline PDF</h3>
                      <p className="text-sm text-blue-700 mb-6 max-w-md">
                        AI will automatically extract: clinical summary, 6-10 management steps, practice pearls, evidence level, and all metadata
                      </p>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handlePDFUpload}
                        disabled={isExtracting}
                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-4 file:px-8 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-gradient-to-r file:from-blue-600 file:to-indigo-600 file:text-white hover:file:from-blue-700 hover:file:to-indigo-700 file:cursor-pointer file:shadow-lg"
                      />
                      {pdfFile && !isExtracting && (
                        <Badge className="mt-4 bg-green-600 text-white flex items-center gap-2 text-sm px-4 py-2">
                          <CheckCircle className="w-5 h-5" />
                          {pdfFile.name} - Extracted!
                        </Badge>
                      )}
                      {isExtracting && (
                        <div className="mt-6 flex items-center gap-3 text-blue-700">
                          <Loader2 className="w-6 h-6 animate-spin" />
                          <span className="font-semibold">AI analyzing guideline...</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {pdfFile && !isExtracting && (
                    <div className="space-y-6 pt-6 border-t-2">
                      <Alert className="bg-green-50 border-green-200">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <AlertDescription className="text-green-800">
                          <strong>Extraction Complete!</strong> Review and edit the auto-filled data below before saving.
                        </AlertDescription>
                      </Alert>

                      {/* Basic Info */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Title *</Label>
                          <Input
                            value={newGuideline.title}
                            onChange={(e) => setNewGuideline({...newGuideline, title: e.target.value})}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Source Organization *</Label>
                          <Input
                            value={newGuideline.source}
                            onChange={(e) => setNewGuideline({...newGuideline, source: e.target.value})}
                            placeholder="KDIGO, IPNA, IAP, ISPD..."
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Category *</Label>
                          <Select value={newGuideline.category} onValueChange={(val) => setNewGuideline({...newGuideline, category: val})}>
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.filter(c => c !== "All").map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Year *</Label>
                          <Input
                            type="number"
                            value={newGuideline.year}
                            onChange={(e) => setNewGuideline({...newGuideline, year: parseInt(e.target.value) || new Date().getFullYear()})}
                            className="mt-1"
                          />
                        </div>
                      </div>

                      {/* Clinical Summary */}
                      <div>
                        <Label className="text-base font-semibold flex items-center gap-2">
                          <FileText className="w-5 h-5 text-blue-600" />
                          Clinical Summary (Who, When, What) *
                        </Label>
                        <Textarea
                          value={newGuideline.scope_and_population}
                          onChange={(e) => setNewGuideline({...newGuideline, scope_and_population: e.target.value})}
                          placeholder="2-3 sentences: Patient population, clinical scenarios, and main approach..."
                          className="mt-2 h-24"
                        />
                      </div>

                      {/* Key Management Steps */}
                      <div>
                        <Label className="text-base font-semibold flex items-center gap-2 mb-3">
                          <Target className="w-5 h-5 text-green-600" />
                          Key Management Steps (Algorithm Format)
                        </Label>
                        <div className="space-y-2">
                          {newGuideline.key_recommendations.map((rec, idx) => (
                            <div key={idx} className="flex gap-2">
                              <Badge className="bg-green-600 text-white flex-shrink-0 h-10 flex items-center px-3 text-sm">
                                Step {idx + 1}
                              </Badge>
                              <Textarea
                                value={rec}
                                onChange={(e) => updateRecommendation(idx, e.target.value)}
                                placeholder="Be specific: Include thresholds, criteria, timing..."
                                className="flex-1"
                                rows={2}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeRecommendation(idx)}
                                className="flex-shrink-0 h-10"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                          <Button onClick={addRecommendation} variant="outline" className="w-full border-green-300 hover:bg-green-50">
                            <Target className="w-4 h-4 mr-2" />
                            Add Management Step
                          </Button>
                        </div>
                      </div>

                      {/* Practice Pearls */}
                      <div>
                        <Label className="text-base font-semibold flex items-center gap-2 mb-3">
                          <Lightbulb className="w-5 h-5 text-amber-600" />
                          Practice Pearls (Bedside Tips)
                        </Label>
                        <div className="space-y-2">
                          {newGuideline.practice_pearls.map((pearl, idx) => (
                            <div key={idx} className="flex gap-2">
                              <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-3" />
                              <Textarea
                                value={pearl}
                                onChange={(e) => updatePearl(idx, e.target.value)}
                                placeholder="Practical tip, common pitfall to avoid, or clinical trick..."
                                className="flex-1"
                                rows={2}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removePearl(idx)}
                                className="flex-shrink-0 h-10"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                          <Button onClick={addPearl} variant="outline" className="w-full border-amber-300 hover:bg-amber-50">
                            <Lightbulb className="w-4 h-4 mr-2" />
                            Add Practice Pearl
                          </Button>
                        </div>
                      </div>

                      {/* Evidence & Links */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Evidence Level</Label>
                          <Select value={newGuideline.evidence_level} onValueChange={(val) => setNewGuideline({...newGuideline, evidence_level: val})}>
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
                        <div>
                          <Label>External Link</Label>
                          <Input
                            value={newGuideline.external_link}
                            onChange={(e) => setNewGuideline({...newGuideline, external_link: e.target.value})}
                            placeholder="https://..."
                            className="mt-1"
                          />
                        </div>
                      </div>

                      {/* Full Summary */}
                      <div>
                        <Label>Complete Summary (Detailed overview)</Label>
                        <Textarea
                          value={newGuideline.summary}
                          onChange={(e) => setNewGuideline({...newGuideline, summary: e.target.value})}
                          placeholder="Comprehensive guideline overview..."
                          className="mt-1 h-32"
                        />
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="web" className="space-y-6 mt-4">
                  <WebImporter onImportComplete={(data) => {
                    setNewGuideline(prev => ({
                      ...prev,
                      ...data,
                      key_recommendations: data.key_recommendations || [""],
                      practice_pearls: [""]
                    }));
                    toast.success('Imported! Review before saving');
                  }} />
                </TabsContent>

                <TabsContent value="manual" className="space-y-6 mt-4">
                  {/* Basic Metadata */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Title *</Label>
                      <Input
                        value={newGuideline.title}
                        onChange={(e) => setNewGuideline({...newGuideline, title: e.target.value})}
                        placeholder="KDIGO AKI Guidelines 2024"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Source *</Label>
                      <Input
                        value={newGuideline.source}
                        onChange={(e) => setNewGuideline({...newGuideline, source: e.target.value})}
                        placeholder="KDIGO, IPNA, IAP"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Category *</Label>
                      <Select
                        value={newGuideline.category}
                        onValueChange={(val) => setNewGuideline({...newGuideline, category: val})}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.filter(c => c !== "All").map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Year *</Label>
                      <Input
                        type="number"
                        value={newGuideline.year}
                        onChange={(e) => setNewGuideline({...newGuideline, year: parseInt(e.target.value) || new Date().getFullYear()})}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {/* Clinical Summary */}
                  <div>
                    <Label className="text-base font-semibold flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      Clinical Summary (Who, When, What) *
                    </Label>
                    <Textarea
                      value={newGuideline.scope_and_population}
                      onChange={(e) => setNewGuideline({...newGuideline, scope_and_population: e.target.value})}
                      placeholder="WHO: Patient population and age range&#10;WHEN: Clinical scenarios when this applies&#10;WHAT: Main clinical approach or intervention"
                      className="mt-2 h-24"
                    />
                  </div>

                  {/* Key Management Steps */}
                  <div>
                    <Label className="text-base font-semibold flex items-center gap-2 mb-3">
                      <Target className="w-5 h-5 text-green-600" />
                      Key Management Steps (6-10 Steps)
                    </Label>
                    <div className="space-y-2">
                      {newGuideline.key_recommendations.map((rec, idx) => (
                        <div key={idx} className="flex gap-2">
                          <Badge className="bg-green-600 text-white flex-shrink-0 h-10 flex items-center px-3 text-sm">
                            Step {idx + 1}
                          </Badge>
                          <Textarea
                            value={rec}
                            onChange={(e) => updateRecommendation(idx, e.target.value)}
                            placeholder="Specific actionable step with criteria/thresholds..."
                            className="flex-1"
                            rows={2}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeRecommendation(idx)}
                            className="flex-shrink-0 h-10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button onClick={addRecommendation} variant="outline" className="w-full border-green-300 hover:bg-green-50">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Step
                      </Button>
                    </div>
                  </div>

                  {/* Practice Pearls */}
                  <div>
                    <Label className="text-base font-semibold flex items-center gap-2 mb-3">
                      <Lightbulb className="w-5 h-5 text-amber-600" />
                      Practice Pearls (4-6 Tips)
                    </Label>
                    <div className="space-y-2">
                      {newGuideline.practice_pearls.map((pearl, idx) => (
                        <div key={idx} className="flex gap-2">
                          <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-3" />
                          <Textarea
                            value={pearl}
                            onChange={(e) => updatePearl(idx, e.target.value)}
                            placeholder="Bedside tip, pitfall to avoid, or clinical shortcut..."
                            className="flex-1"
                            rows={2}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removePearl(idx)}
                            className="flex-shrink-0 h-10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button onClick={addPearl} variant="outline" className="w-full border-amber-300 hover:bg-amber-50">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Pearl
                      </Button>
                    </div>
                  </div>

                  {/* Evidence & Links */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Evidence Level</Label>
                      <Select value={newGuideline.evidence_level} onValueChange={(val) => setNewGuideline({...newGuideline, evidence_level: val})}>
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
                    <div>
                      <Label>External Link</Label>
                      <Input
                        value={newGuideline.external_link}
                        onChange={(e) => setNewGuideline({...newGuideline, external_link: e.target.value})}
                        placeholder="https://..."
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {/* Full Summary */}
                  <div>
                    <Label>Complete Summary (Detailed overview)</Label>
                    <Textarea
                      value={newGuideline.summary}
                      onChange={(e) => setNewGuideline({...newGuideline, summary: e.target.value})}
                      placeholder="Include scope, population, key findings, and implementation notes..."
                      className="mt-1 h-40"
                    />
                  </div>
                </TabsContent>
              </Tabs>

              {/* Multimedia Section */}
              <div className="mt-6">
                <MultimediaUploader onUploadComplete={(media) => {
                  setNewGuideline(prev => ({
                    ...prev,
                    multimedia: {
                      ...prev.multimedia,
                      [media.type === 'video' ? 'video_overview_url' : 
                       media.type === 'slides' ? 'slides_url' : null]: media.url,
                      infographics: media.type === 'infographic' 
                        ? [...(prev.multimedia?.infographics || []), { url: media.url, caption: media.name }]
                        : prev.multimedia?.infographics || []
                    }
                  }));
                }} />
              </div>

              {/* Tables/Images Upload */}
              <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 bg-purple-50/30 mt-6">
                <div className="flex items-center gap-4">
                  <ImageIcon className="w-8 h-8 text-purple-600" />
                  <div className="flex-1">
                    <Label className="text-base font-semibold">Upload Tables/Algorithms (Optional)</Label>
                    <p className="text-sm text-slate-600 mt-1">Staging tables, flowcharts, diagrams</p>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="mt-3 block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 file:cursor-pointer"
                    />
                    {imageFiles.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {imageFiles.map((img, idx) => (
                          <div key={idx} className="flex flex-wrap items-center gap-2 bg-white p-2 rounded border">
                            <Badge className="bg-purple-600 text-white flex items-center">
                              <ImageIcon className="w-3 h-3 mr-1" />
                              {img.file.name}
                            </Badge>
                            <Select
                              value={img.type}
                              onValueChange={(val) => {
                                const updated = [...imageFiles];
                                updated[idx].type = val;
                                setImageFiles(updated);
                              }}
                            >
                              <SelectTrigger className="w-32 h-7 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="table">Table</SelectItem>
                                <SelectItem value="flowchart">Flowchart</SelectItem>
                                <SelectItem value="diagram">Diagram</SelectItem>
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
                              className="h-7 text-xs flex-1 min-w-[150px]"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Button
                onClick={() => createGuidelineMutation.mutate(newGuideline)}
                disabled={!newGuideline.title || !newGuideline.source || !newGuideline.scope_and_population || createGuidelineMutation.isPending || isExtracting}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 mt-6 py-6 text-lg font-semibold"
              >
                {createGuidelineMutation.isPending ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Creating Guideline...</>
                ) : (
                  <><Plus className="w-5 h-5 mr-2" />Add Guideline to Library</>
                )}
              </Button>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-6">
          <SemanticSearch 
            guidelines={guidelines}
            onResultsFound={(results, reasoning) => {
              setSemanticResults(results);
              setSearchReasoning(reasoning);
            }}
          />

          <div className="relative">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-slate-400" />
            <Input
              type="text"
              placeholder="Or use keyword search: title, source, category..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (!e.target.value) setSemanticResults(null);
              }}
              className="pl-16 pr-6 py-7 text-lg border-2 border-slate-300 focus:border-blue-500 shadow-md rounded-2xl bg-white"
            />
          </div>

          {semanticResults && searchReasoning && (
            <Alert className="bg-purple-50 border-purple-200">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <AlertDescription className="text-purple-900">
                <strong>AI Search Results:</strong> {searchReasoning}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={activeCategory === cat ? "default" : "outline"}
                size="lg"
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 whitespace-nowrap rounded-xl px-6 py-3 ${
                  activeCategory === cat 
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg font-semibold" 
                    : "border-2 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-blue-300"
                }`}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-32">
            <Loader2 className="w-20 h-20 animate-spin text-blue-600 mx-auto mb-6" />
            <p className="text-slate-600 text-xl font-medium">Loading guidelines...</p>
          </div>
        ) : filteredGuidelines.length === 0 ? (
          <Card className="bg-white shadow-2xl border-2 border-slate-200">
            <CardContent className="p-32 text-center">
              <BookOpen className="w-24 h-24 text-slate-300 mx-auto mb-6" />
              <h3 className="text-3xl font-bold text-slate-700 mb-3">No Guidelines Found</h3>
              <p className="text-slate-500 text-lg">Try adjusting your search or filter</p>
            </CardContent>
          </Card>
        ) : viewMode === 'list' ? (
          <GuidelineListView
            guidelines={filteredGuidelines}
            onOpen={(g) => window.location.href = createPageUrl("GuidelineDetail") + `?id=${g.id}`}
            onStar={(id) => {
              setStarredIds(prev => 
                prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
              );
            }}
            starredIds={starredIds}
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filteredGuidelines.map((guideline) => (
              <GuidelineSummaryCard
                key={guideline.id}
                guideline={guideline}
                onUpdate={() => queryClient.invalidateQueries({ queryKey: ['guidelines'] })}
              />
            ))}
          </div>
        )}

        {selectedForPathway.length > 0 && (
          <div className="mt-6">
            <PathwayGenerator
              selectedGuidelines={selectedForPathway}
              onRemoveGuideline={(id) => {
                setSelectedForPathway(prev => prev.filter(g => g.id !== id));
              }}
            />
          </div>
        )}

        <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 p-6">
          <Award className="w-6 h-6 text-blue-600" />
          <AlertDescription className="text-blue-900">
            <strong className="text-lg block mb-2">Evidence-Based Clinical Practice</strong>
            <p className="leading-relaxed">All guidelines sourced from KDIGO, IPNA, ISPD, IAP, ESPN, ISKDC, WHO and internationally recognized organizations. AI-powered extraction provides structured summaries: clinical scope, sequential management algorithms, and bedside practice pearls for rapid clinical decision-making.</p>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}