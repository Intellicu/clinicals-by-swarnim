import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  Share2, 
  Loader2, 
  Sparkles,
  Upload,
  Languages,
  BookOpenCheck,
  Info
} from "lucide-react";
import { toast } from "sonner";

const patientMaterials = [
  {
    title: "Understanding Chronic Kidney Disease (CKD) in Children",
    description: "Parent guide explaining CKD stages, symptoms, and management",
    language: "English",
    category: "CKD",
    downloadUrl: "#"
  },
  {
    title: "Nephrotic Syndrome - A Guide for Families",
    description: "Comprehensive guide on nephrotic syndrome diagnosis, treatment, and home care",
    language: "English",
    category: "Nephrotic Syndrome",
    downloadUrl: "#"
  },
  {
    title: "गुर्दे की बीमारी - माता-पिता के लिए गाइड (Kidney Disease Parent Guide)",
    description: "Hindi guide for parents about pediatric kidney disease",
    language: "Hindi",
    category: "General",
    downloadUrl: "#"
  },
  {
    title: "Dialysis at Home - PD for Children",
    description: "Step-by-step guide for peritoneal dialysis at home",
    language: "English",
    category: "Dialysis",
    downloadUrl: "#"
  },
  {
    title: "Kidney Stone Prevention for Kids",
    description: "Dietary and lifestyle tips to prevent kidney stones",
    language: "English",
    category: "Stones",
    downloadUrl: "#"
  },
  {
    title: "Blood Pressure Management in Children",
    description: "Understanding high blood pressure and its treatment",
    language: "English",
    category: "Hypertension",
    downloadUrl: "#"
  }
];

export default function PatientEducation() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLanguage, setSelectedLanguage] = useState("All");
  
  // Generator State
  const [showGenerator, setShowGenerator] = useState(false);
  const [generatorSource, setGeneratorSource] = useState("guideline");
  const [selectedGuideline, setSelectedGuideline] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [targetLanguage, setTargetLanguage] = useState("english");
  const [readingLevel, setReadingLevel] = useState("grade5");
  const [customTopic, setCustomTopic] = useState("");
  const [generatedMaterial, setGeneratedMaterial] = useState(null);

  const { data: guidelines = [] } = useQuery({
    queryKey: ['guidelines'],
    queryFn: () => base44.entities.Guideline.list(),
    initialData: [],
  });

  const generateMaterialMutation = useMutation({
    mutationFn: async ({ source, guideline, topic, language, level, fileUrl }) => {
      let sourceText = "";
      
      if (source === "guideline" && guideline) {
        const guidelineData = guidelines.find(g => g.id === guideline);
        sourceText = `${guidelineData.title}\n\n${guidelineData.summary}\n\n${JSON.stringify(guidelineData.content)}`;
      } else if (source === "custom" && topic) {
        sourceText = topic;
      }

      const readingLevels = {
        grade5: "5th grade level (10 years old)",
        grade8: "8th grade level (13 years old)",
        simple: "very simple language (suitable for all ages)"
      };

      const languageMap = {
        english: "English",
        hindi: "Hindi (Devanagari script)",
        spanish: "Spanish"
      };

      const prompt = `Create patient education material based on the following clinical information. 

Target audience: Parents and families of pediatric nephrology patients
Reading level: ${readingLevels[level]}
Language: ${languageMap[language]}

Source information:
${sourceText}

Please create:
1. Title (engaging and easy to understand)
2. What is this condition? (simple explanation)
3. Common symptoms to watch for
4. How is it diagnosed?
5. Treatment options explained simply
6. Home care tips for parents
7. When to call the doctor (warning signs)
8. FAQ section (5-7 common questions)

Make it:
- Easy to understand for non-medical people
- Culturally sensitive
- Action-oriented (clear next steps)
- Reassuring but honest
${fileUrl ? `\n\nAlso incorporate information from the uploaded document.` : ""}`;

      const material = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        file_urls: fileUrl ? [fileUrl] : undefined
      });

      return material;
    },
    onSuccess: (material) => {
      setGeneratedMaterial(material);
      toast.success("Patient education material generated successfully!");
    },
    onError: () => {
      toast.error("Failed to generate material. Please try again.");
    }
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploadedFile({ name: file.name, url: file_url });
      toast.success("File uploaded successfully");
    } catch (error) {
      toast.error("File upload failed");
    }
  };

  const handleGenerate = () => {
    if (generatorSource === "guideline" && !selectedGuideline) {
      toast.error("Please select a guideline");
      return;
    }
    if (generatorSource === "custom" && !customTopic) {
      toast.error("Please enter a topic");
      return;
    }

    generateMaterialMutation.mutate({
      source: generatorSource,
      guideline: selectedGuideline,
      topic: customTopic,
      language: targetLanguage,
      level: readingLevel,
      fileUrl: uploadedFile?.url
    });
  };

  const handleDownload = () => {
    if (!generatedMaterial) return;
    
    const blob = new Blob([generatedMaterial], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patient-education-${targetLanguage}.txt`;
    a.click();
  };

  const handleShare = async () => {
    if (!generatedMaterial) return;

    const shareData = {
      title: "Patient Education Material - CliniCalc",
      text: generatedMaterial,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success("Shared successfully");
      } catch (err) {
        if (err.name !== 'AbortError') {
          navigator.clipboard.writeText(generatedMaterial);
          toast.success("Copied to clipboard");
        }
      }
    } else {
      navigator.clipboard.writeText(generatedMaterial);
      toast.success("Copied to clipboard");
    }
  };

  const categories = ["All", ...new Set(patientMaterials.map(m => m.category))];
  const languages = ["All", ...new Set(patientMaterials.map(m => m.language))];

  const filteredMaterials = patientMaterials.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         material.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || material.category === selectedCategory;
    const matchesLanguage = selectedLanguage === "All" || material.language === selectedLanguage;
    return matchesSearch && matchesCategory && matchesLanguage;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <Link to={createPageUrl("Hub")}>
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-600 to-teal-700 rounded-xl flex items-center justify-center shadow-lg">
              <BookOpenCheck className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Patient Education Library</h1>
              <p className="text-slate-600">Resources for families and patients in multiple languages</p>
            </div>
          </div>

          <Button onClick={() => setShowGenerator(!showGenerator)} className="mt-4 bg-teal-600 hover:bg-teal-700">
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Custom Material
          </Button>
        </div>

        {/* Generator Section */}
        {showGenerator && (
          <Card className="mb-6 bg-white shadow-lg">
            <CardHeader className="bg-teal-50 border-b border-teal-200">
              <CardTitle className="text-lg text-teal-900">Generate Patient Education Material</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold text-slate-700">Source</Label>
                  <Select value={generatorSource} onValueChange={setGeneratorSource}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="guideline">From Guideline</SelectItem>
                      <SelectItem value="custom">Custom Topic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {generatorSource === "guideline" && (
                  <div>
                    <Label className="text-sm font-semibold text-slate-700">Select Guideline</Label>
                    <Select value={selectedGuideline} onValueChange={setSelectedGuideline}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Choose a guideline..." />
                      </SelectTrigger>
                      <SelectContent>
                        {guidelines.map(guideline => (
                          <SelectItem key={guideline.id} value={guideline.id}>
                            {guideline.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {generatorSource === "custom" && (
                  <div>
                    <Label className="text-sm font-semibold text-slate-700">Topic / Condition</Label>
                    <Textarea
                      value={customTopic}
                      onChange={(e) => setCustomTopic(e.target.value)}
                      placeholder="Enter the condition or topic you want to create education material about..."
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                )}

                <div>
                  <Label className="text-sm font-semibold text-slate-700">Upload Supporting Document (Optional)</Label>
                  <input
                    type="file"
                    accept=".pdf,.txt,.doc,.docx"
                    onChange={handleFileUpload}
                    className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                  />
                  {uploadedFile && (
                    <Badge className="mt-2 bg-teal-100 text-teal-800">
                      <FileText className="w-3 h-3 mr-1" />
                      {uploadedFile.name}
                    </Badge>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold text-slate-700">Language</Label>
                    <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="english">
                          <div className="flex items-center gap-2">
                            <Languages className="w-4 h-4" />
                            English
                          </div>
                        </SelectItem>
                        <SelectItem value="hindi">
                          <div className="flex items-center gap-2">
                            <Languages className="w-4 h-4" />
                            हिंदी (Hindi)
                          </div>
                        </SelectItem>
                        <SelectItem value="spanish">
                          <div className="flex items-center gap-2">
                            <Languages className="w-4 h-4" />
                            Español (Spanish)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-slate-700">Reading Level</Label>
                    <Select value={readingLevel} onValueChange={setReadingLevel}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="simple">Very Simple (All ages)</SelectItem>
                        <SelectItem value="grade5">Grade 5 Level (10 years)</SelectItem>
                        <SelectItem value="grade8">Grade 8 Level (13 years)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={generateMaterialMutation.isPending}
                  className="w-full bg-teal-600 hover:bg-teal-700 mt-4"
                >
                  {generateMaterialMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating Material...</>
                  ) : (
                    <><Sparkles className="w-4 h-4 mr-2" />Generate Patient Education Material</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Generated Material Display */}
        {generatedMaterial && (
          <Card className="mb-6 bg-white shadow-lg">
            <CardHeader className="bg-teal-50 border-b flex flex-row items-center justify-between">
              <CardTitle className="text-lg text-teal-900">Generated Education Material</CardTitle>
              <div className="flex gap-2">
                <Button onClick={handleDownload} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button onClick={handleShare} variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="prose prose-slate max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-slate-800 font-sans leading-relaxed">
                  {generatedMaterial}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <div className="mb-6 grid md:grid-cols-3 gap-4">
          <Input
            placeholder="Search materials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map(lang => (
                <SelectItem key={lang} value={lang}>{lang}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Materials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((material, idx) => (
            <Card key={idx} className="bg-white shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-slate-200 hover:border-teal-300">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-base font-bold text-slate-900">{material.title}</CardTitle>
                  <Badge className="bg-teal-100 text-teal-800 flex-shrink-0 ml-2">
                    {material.language}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600">{material.description}</p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {material.category}
                  </Badge>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                    <Button size="sm" variant="outline">
                      <Share2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredMaterials.length === 0 && (
          <Alert className="bg-slate-50 border-slate-200">
            <Info className="w-4 h-4 text-slate-600" />
            <AlertDescription className="text-slate-700">
              No materials found matching your criteria. Try adjusting your filters or generate custom material above.
            </AlertDescription>
          </Alert>
        )}

        <Alert className="mt-6 bg-blue-50 border-blue-200">
          <Info className="w-4 h-4 text-blue-600" />
          <AlertDescription className="text-sm text-blue-800">
            <strong>Note:</strong> Patient education materials are for informational purposes only. Always consult your child's healthcare provider for medical advice specific to your situation.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}