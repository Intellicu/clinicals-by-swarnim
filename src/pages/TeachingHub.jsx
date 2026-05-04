import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  GraduationCap,
  Search,
  Plus,
  BookOpen,
  Target,
  Award,
  TrendingUp,
  Upload,
  Sparkles,
  Loader2,
  ArrowLeft,
  MessageCircle,
  PlayCircle,
  CheckCircle2,
  Brain,
  Lightbulb,
  Route,
  FileQuestion,
  Zap,
  Info,
  Edit,
  Trash2
} from "lucide-react";
import { toast } from "sonner";

const difficultyColors = {
  Beginner: "bg-green-100 text-green-800 border-green-300",
  Intermediate: "bg-amber-100 text-amber-800 border-amber-300",
  Advanced: "bg-red-100 text-red-800 border-red-300"
};

const categoryIcons = {
  Dialysis: "💧",
  AKI: "⚠️",
  CKD: "📊",
  "Glomerular Diseases": "🔬",
  Electrolytes: "⚡",
  Hypertension: "❤️",
  Transplant: "🫀",
  "General Nephrology": "🩺",
  Procedures: "🏥",
  Pathology: "🔬"
};

export default function TeachingHub() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [dialogOpen, setDialogOpen] = useState("");
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [learningPathDialogOpen, setLearningPathDialogOpen] = useState(false);
  const [newModule, setNewModule] = useState({
    title: "",
    category: "General Nephrology",
    difficulty_level: "Beginner",
    estimated_duration: "",
    content: { overview: "", learning_objectives: [], topics: [], clinical_pearls: [], common_pitfalls: [] },
    quizzes: [],
    practice_cases: [],
    resources: []
  });
  const [uploadedFile, setUploadedFile] = useState(null);
  // const [isExtracting, setIsExtracting] = useState(false); // Replaced by aiGenerateMutation.isPending
  const [selectedModuleForAI, setSelectedModuleForAI] = useState(null);
  const [aiOperation, setAiOperation] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiGeneratedContent, setAiGeneratedContent] = useState(null);
  const [learningGoals, setLearningGoals] = useState("");
  const [isCreatingPath, setIsCreatingPath] = useState(false);
  const [editingLearningPath, setEditingLearningPath] = useState(false);
  const [updatedGoals, setUpdatedGoals] = useState("");

  // New states for AI extracted content review
  const [aiExtractedContent, setAiExtractedContent] = useState(null);
  const [showAiExtractedDialog, setShowAiExtractedDialog] = useState(false);
  const [activeCreateTab, setActiveCreateTab] = useState("ai"); // To manage tabs in create module dialog

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: modules = [], isLoading } = useQuery({
    queryKey: ['teachingModules'],
    queryFn: () => base44.entities.TeachingModule.list('-created_date'),
    initialData: []
  });

  const { data: studentProgress = [] } = useQuery({
    queryKey: ['allStudentProgress', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.StudentProgress.filter({ user_email: user.email });
    },
    enabled: !!user?.email,
    initialData: []
  });

  const { data: learningPath } = useQuery({
    queryKey: ['learningPath', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const paths = await base44.entities.LearningPath.filter({ user_email: user.email });
      return paths[0] || null;
    },
    enabled: !!user?.email
  });

  const deleteModuleMutation = useMutation({
    mutationFn: (moduleId) => base44.entities.TeachingModule.delete(moduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachingModules'] });
      toast.success("Module deleted.");
    }
  });

  const createModuleMutation = useMutation({
    mutationFn: (moduleData) => base44.entities.TeachingModule.create({
      ...moduleData,
      created_by: user?.email || "anonymous",
      is_default: false
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachingModules'] });
      setDialogOpen("");
      resetForm();
      setAiExtractedContent(null); // Clear extracted content after module creation
      toast.success("Module created successfully!");
    }
  });

  const createLearningPathMutation = useMutation({
    mutationFn: async (goals) => {
      const allModulesText = modules.map(m => `${m.title} (${m.category}, ${m.difficulty_level})`).join('\n');
      
      const pathPrompt = `Create a personalized learning path for a pediatric nephrology student.

STUDENT GOALS:
${goals}

AVAILABLE MODULES:
${allModulesText}

Create a prioritized learning sequence (High/Medium/Low priority) with specific reasons why each module helps achieve their goals.`; // Modified prompt

      const pathRecommendation = await base44.integrations.Core.InvokeLLM({
        prompt: pathPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            recommended_modules: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  module_title: { type: "string" },
                  priority: { type: "string" },
                  reason: { type: "string" }
                }
              }
            },
            learning_strategy: { type: "string" },
            estimated_timeline: { type: "string" },
            key_focus_areas: { type: "array", items: { type: "string" } }
          }
        }
      });

      const recommendedModulesWithIds = pathRecommendation.recommended_modules.map(rec => {
        const matchedModule = modules.find(m => m.title.toLowerCase().includes(rec.module_title.toLowerCase()));
        return {
          module_id: matchedModule?.id || "",
          priority: rec.priority,
          reason: rec.reason,
          completed: false
        };
      }).filter(r => r.module_id);

      if (learningPath) {
        return base44.entities.LearningPath.update(learningPath.id, {
          learning_goals: goals.split('\n').filter(g => g.trim()),
          recommended_modules: recommendedModulesWithIds,
          next_steps: pathRecommendation.key_focus_areas,
          last_updated: new Date().toISOString()
        });
      } else {
        return base44.entities.LearningPath.create({
          user_email: user.email,
          assessment_type: "goals_based",
          learning_goals: goals.split('\n').filter(g => g.trim()),
          recommended_modules: recommendedModulesWithIds,
          next_steps: pathRecommendation.key_focus_areas,
          last_updated: new Date().toISOString()
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learningPath'] });
      setLearningPathDialogOpen(false);
      setEditingLearningPath(false); // Reset editing state
      toast.success("Learning path updated!"); // Changed toast message for both create and update
    }
  });

  const aiGenerateMutation = useMutation({
    mutationFn: async ({ file }) => {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      const prompt = `Extract educational content from this teaching material and structure it as a comprehensive teaching module.

IMPORTANT: DO NOT use asterisks or markdown bold formatting (no **). Use plain text with clear structure.

Provide:
1. Module title
2. Category (Dialysis, AKI, CKD, Glomerular Diseases, etc.)
3. Difficulty level (Beginner/Intermediate/Advanced)
4. Overview
5. Learning objectives (3-5 points)
6. Main topics with detailed content
7. Clinical pearls (4-6 practical tips)
8. Common pitfalls
9. 3-5 quiz questions with explanations

Format as structured educational content suitable for medical students and residents.

At the end add:
---
AI DISCLAIMER: This module content is AI-generated from uploaded materials for educational purposes. Content should be reviewed by faculty before use. Always verify clinical information with current evidence-based sources.
---`;

      const extracted = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            category: { type: "string" },
            difficulty_level: { type: "string" },
            content: {
              type: "object",
              properties: {
                overview: { type: "string" },
                learning_objectives: { type: "array", items: { type: "string" } },
                topics: {
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
                common_pitfalls: { type: "array", items: { type: "string" } }
              }
            },
            quizzes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  options: { type: "array", items: { type: "string" } },
                  correct_answer: { type: "number" },
                  explanation: { type: "string" },
                  difficulty: { type: "string" }
                }
              }
            }
          }
        }
      });

      return { ...extracted, file_url };
    },
    onSuccess: (data) => {
      setAiExtractedContent(data);
      setShowAiExtractedDialog(true);
      toast.success("Content extracted successfully!", { id: "extract" });
    },
    onError: (error) => {
      console.error("AI extraction error:", error);
      toast.error("Failed to extract content via AI", { id: "extract" });
    }
  });


  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadedFile(file);
    toast.info("AI extracting module content...", { id: "extract", duration: 30000 });

    try {
      await aiGenerateMutation.mutateAsync({ file });
    } catch (error) {
      console.error("File upload initiation error:", error);
      toast.error("File upload failed.", { id: "extract" });
    }
  };

  const handleAIContentGeneration = async () => {
    if (!selectedModuleForAI || !aiOperation) return;

    setIsGeneratingAI(true);
    toast.info("AI generating content...", { id: "ai-gen", duration: 30000 });

    try {
      const moduleContent = JSON.stringify(selectedModuleForAI.content);
      
      let prompt = "";
      
      if (aiOperation === "simplify") {
        prompt = `Simplify this complex medical content for BEGINNER learners (medical students, junior residents).

Original content:
${moduleContent}

${aiPrompt || "Use analogies, simple language, step-by-step explanations. Avoid jargon or explain it clearly."}

Return simplified version maintaining educational value but making it accessible.`;
      } else if (aiOperation === "expand") {
        prompt = `Expand this content with ADVANCED technical details for expert learners.

Original content:
${moduleContent}

${aiPrompt || "Add pathophysiology, recent research, complex cases, differential diagnosis nuances."}

Return expanded version with deep clinical insights.`;
      } else if (aiOperation === "quiz") {
        prompt = `Generate 10 NEW multiple-choice questions based on this module content:

${moduleContent}

${aiPrompt || "Mix of difficulty levels. Include clinical scenarios. Provide detailed explanations."}`;
      } else if (aiOperation === "cases") {
        prompt = `Generate 3 detailed clinical cases based on this module:

${moduleContent}

${aiPrompt || "Realistic pediatric nephrology scenarios. Include questions and model answers."}`;
      }

      const generated = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            content: aiOperation === "quiz" ? {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  options: { type: "array", items: { type: "string" } },
                  correct_answer: { type: "number" },
                  explanation: { type: "string" },
                  difficulty: { type: "string" }
                }
              }
            } : aiOperation === "cases" ? {
              type: "array",
              items: {
                type: "object",
                properties: {
                  case_description: { type: "string" },
                  questions: { type: "array", items: { type: "string" } },
                  answers: { type: "array", items: { type: "string" } }
                }
              }
            } : { type: "string" },
            related_modules: { type: "array", items: { type: "string" } },
            external_resources: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  url: { type: "string" },
                  type: { type: "string" }
                }
              }
            }
          }
        }
      });

      setAiGeneratedContent(generated);
      toast.success("AI content generated!", { id: "ai-gen" });
    } catch (error) {
      console.error("AI generation error:", error);
      toast.error("Failed to generate content", { id: "ai-gen" });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const resetForm = () => {
    setNewModule({
      title: "",
      category: "General Nephrology",
      difficulty_level: "Beginner",
      estimated_duration: "",
      content: { overview: "", learning_objectives: [], topics: [], clinical_pearls: [], common_pitfalls: [] },
      quizzes: [],
      practice_cases: [],
      resources: []
    });
    setUploadedFile(null);
    setAiExtractedContent(null); // Clear extracted content on form reset
  };

  const getModuleProgress = (moduleId) => {
    const progress = studentProgress.find(p => p.module_id === moduleId);
    if (!progress) return 0;
    if (progress.completed) return 100;
    const quizScore = progress.quiz_scores?.length || 0; // Simplified progress calculation
    const totalContentItems = (progress.content_viewed?.length || 0) + (progress.quiz_scores?.length || 0) + (progress.case_completion?.length || 0);
    const completedItems = (progress.content_viewed?.filter(c => c.completed).length || 0) + (progress.quiz_scores?.length || 0) + (progress.case_completion?.filter(c => c.completed).length || 0);
    if (totalContentItems === 0) return 0;
    return Math.min(Math.round((completedItems / totalContentItems) * 100), 99); // Max 99 if not fully completed
  };

  const filteredModules = modules.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         m.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || m.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["All", ...new Set(modules.map(m => m.category))];

  const completedCount = studentProgress.filter(p => p.completed).length;
  const totalQuizzes = studentProgress.reduce((sum, p) => sum + (p.quiz_scores?.length || 0), 0);

  const handleUpdateGoals = () => {
    if (!updatedGoals.trim()) return;
    createLearningPathMutation.mutate(updatedGoals);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <Link to={createPageUrl("Hub")}>
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Hub
          </Button>
        </Link>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Teaching Hub</h1>
                <p className="text-slate-600">AI-powered interactive learning modules with personalized paths</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Dialog open={learningPathDialogOpen} onOpenChange={setLearningPathDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                    <Route className="w-4 h-4 mr-2" />
                    My Learning Path
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Route className="w-5 h-5 text-indigo-600" />
                      Personalized Learning Path
                    </DialogTitle>
                  </DialogHeader>

                  {!learningPath || editingLearningPath ? (
                    <div className="space-y-4 mt-4">
                      <Alert className="bg-purple-50 border-purple-200">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                        <AlertDescription className="text-purple-800">
                          <strong>AI-Powered Learning Path:</strong>{" "}
                          {editingLearningPath ? "Update your goals to regenerate your personalized schedule" : "Tell us your learning goals and AI will create a personalized module sequence"}
                        </AlertDescription>
                      </Alert>

                      <div>
                        <Label>Your Learning Goals *</Label>
                        <Textarea
                          value={editingLearningPath ? updatedGoals : learningGoals}
                          onChange={(e) => editingLearningPath ? setUpdatedGoals(e.target.value) : setLearningGoals(e.target.value)}
                          placeholder="Example:&#10;- Master acute kidney injury management&#10;- Learn dialysis prescription basics&#10;- Prepare for fellowship exam&#10;- Focus on electrolyte disorders"
                          className="mt-1 h-40"
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => editingLearningPath ? handleUpdateGoals() : createLearningPathMutation.mutate(learningGoals)}
                          disabled={(editingLearningPath ? !updatedGoals.trim() : !learningGoals.trim()) || createLearningPathMutation.isPending}
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                        >
                          {createLearningPathMutation.isPending ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{editingLearningPath ? "Regenerating..." : "Creating..."}</>
                          ) : (
                            <><Sparkles className="w-4 h-4 mr-2" />{editingLearningPath ? "Regenerate Path" : "Generate Learning Path"}</>
                          )}
                        </Button>
                        {editingLearningPath && (
                          <Button variant="outline" onClick={() => {
                            setEditingLearningPath(false);
                            setUpdatedGoals("");
                          }}>
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6 mt-4">
                      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-bold text-purple-900">Your Learning Goals:</h3>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingLearningPath(true);
                                setUpdatedGoals(learningPath.learning_goals?.join('\n') || "");
                              }}
                              className="border-purple-300 text-purple-700"
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Edit Goals
                            </Button>
                          </div>
                          <ul className="space-y-1 text-sm">
                            {learningPath.learning_goals?.map((goal, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-purple-800">
                                <Target className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                {goal}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>

                      <div>
                        <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                          <Route className="w-5 h-5 text-indigo-600" />
                          Recommended Learning Sequence
                        </h3>
                        <div className="space-y-3">
                          {learningPath.recommended_modules?.map((rec, idx) => {
                            const module = modules.find(m => m.id === rec.module_id);
                            if (!module) return null;
                            const progress = studentProgress.find(p => p.module_id === rec.module_id);

                            return (
                              <Card key={idx} className={`border-2 ${rec.completed || progress?.completed ? "border-green-300 bg-green-50" : "border-indigo-200"}`}>
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Badge className={`${
                                          rec.priority === "High" ? "bg-red-500" :
                                          rec.priority === "Medium" ? "bg-amber-500" :
                                          "bg-blue-500"
                                        } text-white`}>
                                          {rec.priority} Priority
                                        </Badge>
                                        {(rec.completed || progress?.completed) && (
                                          <Badge className="bg-green-600 text-white">
                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                            Completed
                                          </Badge>
                                        )}
                                      </div>
                                      <h4 className="font-bold text-slate-900 mb-1">{module.title}</h4>
                                      <p className="text-sm text-slate-600 mb-2">{rec.reason}</p>
                                      {progress && <Progress value={getModuleProgress(module.id)} className="h-2" />}
                                    </div>
                                    <Link to={createPageUrl("ModuleView") + `?id=${module.id}`}>
                                      <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                                        {progress?.completed ? "Review" : "Start"} →
                                      </Button>
                                    </Link>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </div>

                      {learningPath.next_steps?.length > 0 && (
                        <Card className="bg-blue-50 border-blue-200">
                          <CardHeader>
                            <CardTitle className="text-base text-blue-900">Next Steps & Focus Areas</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-1 text-sm">
                              {learningPath.next_steps.map((step, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-blue-800">
                                  <Zap className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                  {step}
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      )}

                      <Button
                        onClick={() => setLearningPathDialogOpen(false)}
                        variant="outline"
                        className="w-full"
                      >
                        Close
                      </Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              <Dialog open={dialogOpen === "create"} onOpenChange={(open) => {
                setDialogOpen(open ? "create" : "");
                if (!open) { // If closing the dialog
                  resetForm();
                  setActiveCreateTab("ai"); // Reset to AI tab
                }
              }}>
                <DialogTrigger asChild>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Module
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      Create Teaching Module
                    </DialogTitle>
                  </DialogHeader>

                  <Tabs value={activeCreateTab} onValueChange={setActiveCreateTab} className="mt-4">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="ai">AI Extraction</TabsTrigger>
                      <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                    </TabsList>

                    <TabsContent value="ai" className="space-y-4">
                      <div className="border-2 border-dashed border-purple-300 rounded-lg p-8 bg-gradient-to-br from-purple-50 to-pink-50">
                        <div className="flex flex-col items-center text-center">
                          <Upload className="w-16 h-16 text-purple-600 mb-4" />
                          <h3 className="font-semibold text-purple-900 mb-2">Upload Educational Material</h3>
                          <p className="text-sm text-purple-700 mb-4">
                            PDF, DOC, PPT - AI will extract objectives, content, quizzes, and cases
                          </p>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,.ppt,.pptx"
                            onChange={handleFileUpload}
                            disabled={aiGenerateMutation.isPending}
                            className="block w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 file:cursor-pointer"
                          />
                          {aiGenerateMutation.isPending && (
                            <div className="mt-4 flex items-center gap-2 text-purple-700">
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              <span>AI extracting educational content...</span>
                            </div>
                          )}
                          {uploadedFile && !aiGenerateMutation.isPending && !aiExtractedContent && (
                            <Badge className="mt-4 bg-purple-600 text-white">
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              {uploadedFile.name} (Waiting for review)
                            </Badge>
                          )}
                          {aiExtractedContent && !aiGenerateMutation.isPending && (
                            <Badge className="mt-4 bg-green-600 text-white">
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Content extracted! Review in pop-up.
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="manual" className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Title *</Label>
                          <Input
                            value={newModule.title}
                            onChange={(e) => setNewModule({...newModule, title: e.target.value})}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Category *</Label>
                          <Select value={newModule.category} onValueChange={(val) => setNewModule({...newModule, category: val})}>
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {["Dialysis", "AKI", "CKD", "Glomerular Diseases", "Electrolytes", "Hypertension", "Transplant", "General Nephrology", "Procedures", "Pathology"].map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Difficulty *</Label>
                          <Select value={newModule.difficulty_level} onValueChange={(val) => setNewModule({...newModule, difficulty_level: val})}>
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Beginner">Beginner</SelectItem>
                              <SelectItem value="Intermediate">Intermediate</SelectItem>
                              <SelectItem value="Advanced">Advanced</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Duration</Label>
                          <Input
                            value={newModule.estimated_duration}
                            onChange={(e) => setNewModule({...newModule, estimated_duration: e.target.value})}
                            placeholder="e.g., 2 hours"
                            className="mt-1"
                          />
                        </div>
                      </div>
                      {/* You can add more manual fields here if needed, for instance, a basic overview text area */}
                      <div>
                        <Label>Overview</Label>
                        <Textarea
                          value={newModule.content.overview}
                          onChange={(e) => setNewModule(prev => ({ ...prev, content: { ...prev.content, overview: e.target.value } }))}
                          placeholder="Provide a brief overview of the module..."
                          className="mt-1 h-32"
                        />
                      </div>
                    </TabsContent>
                  </Tabs>

                  <Button
                    onClick={() => createModuleMutation.mutate(newModule)}
                    disabled={!newModule.title || createModuleMutation.isPending}
                    className="w-full bg-purple-600 hover:bg-purple-700 mt-4"
                  >
                    {createModuleMutation.isPending ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</>
                    ) : (
                      <><Plus className="w-4 h-4 mr-2" />Create Module</>
                    )}
                  </Button>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Student Progress Dashboard */}
          {user && (
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-gradient-to-r from-green-50 to-teal-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-700">Completed</p>
                      <p className="text-2xl font-bold text-green-900">{completedCount}</p>
                    </div>
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-700">In Progress</p>
                      <p className="text-2xl font-bold text-blue-900">{studentProgress.filter(p => !p.completed).length}</p>
                    </div>
                    <PlayCircle className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-700">Quizzes Taken</p>
                      <p className="text-2xl font-bold text-purple-900">{totalQuizzes}</p>
                    </div>
                    <Award className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-amber-700">Total Modules</p>
                      <p className="text-2xl font-bold text-amber-900">{modules.length}</p>
                    </div>
                    <BookOpen className="w-8 h-8 text-amber-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search modules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12"
            />
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={activeCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(cat)}
                className={activeCategory === cat ? "bg-purple-600 hover:bg-purple-700" : ""}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Modules Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredModules.map((module) => {
            const progress = getModuleProgress(module.id);
            const moduleProgress = studentProgress.find(p => p.module_id === module.id);

            return (
              <Card key={module.id} className="bg-white shadow-lg hover:shadow-xl transition-all border-2 hover:border-purple-400 group">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-purple-50 border-b">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-3xl">{categoryIcons[module.category] || "📚"}</span>
                    <Badge className={`${difficultyColors[module.difficulty_level]} border`}>
                      {module.difficulty_level}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                    {module.title}
                  </CardTitle>
                  <Badge variant="outline" className="mt-1 text-xs bg-purple-50 text-purple-700 border-purple-300">
                    {module.category}
                  </Badge>
                </CardHeader>
                <CardContent className="p-6">
                  {module.content?.overview && (
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                      {module.content.overview}
                    </p>
                  )}

                  {progress > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-600">Progress</span>
                        <span className="text-xs font-semibold text-purple-700">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Link to={createPageUrl("ModuleView") + `?id=${module.id}`} className="flex-1">
                      <Button className="w-full bg-purple-600 hover:bg-purple-700">
                        {moduleProgress?.completed ? "Review" : progress > 0 ? "Continue" : "Start"} →
                      </Button>
                    </Link>
                    {user?.role === 'admin' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedModuleForAI(module);
                            setAiDialogOpen(true);
                          }}
                          className="border-purple-300"
                        >
                          <Sparkles className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (window.confirm(`Delete "${module.title}"? This cannot be undone.`)) {
                              deleteModuleMutation.mutate(module.id);
                            }
                          }}
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* AI Assistant CTA */}
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <MessageCircle className="w-10 h-10 text-indigo-600 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-indigo-900 mb-2">AI Teaching Assistant</h3>
                <p className="text-sm text-indigo-800 mb-3">
                  Get instant answers to your questions, request topic explanations, or generate practice questions on any nephrology topic.
                </p>
                <div className="flex gap-2">
                  <Link to={createPageUrl("AIAssistant")}>
                    <Button className="bg-indigo-600 hover:bg-indigo-700">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Chat with AI Teacher
                    </Button>
                  </Link>
                  <a href={base44.agents.getWhatsAppConnectURL('teaching_assistant')} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="border-green-500 text-green-700 hover:bg-green-50">
                      💬 WhatsApp
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Content Generation Dialog */}
        <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                AI Content Generator - {selectedModuleForAI?.title}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div>
                <Label>What would you like AI to do? *</Label>
                <Select value={aiOperation} onValueChange={setAiOperation}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select operation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simplify">Simplify for Beginners</SelectItem>
                    <SelectItem value="expand">Expand with Advanced Details</SelectItem>
                    <SelectItem value="quiz">Generate Additional Quiz Questions</SelectItem>
                    <SelectItem value="cases">Generate Clinical Cases</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Additional Instructions (Optional)</Label>
                <Textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="E.g., Focus on pathophysiology, include recent guidelines, make it interactive..."
                  className="mt-1 h-24"
                />
              </div>

              <Button
                onClick={handleAIContentGeneration}
                disabled={!aiOperation || isGeneratingAI}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {isGeneratingAI ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" />Generate AI Content</>
                )}
              </Button>

              {aiGeneratedContent && (
                <Card className="bg-gradient-to-r from-green-50 to-teal-50 border-2 border-green-300">
                  <CardHeader>
                    <CardTitle className="text-base text-green-900">✨ Generated Content</CardTitle>
                  </CardHeader>
                  <CardContent className="max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-slate-800">
                      {JSON.stringify(aiGeneratedContent, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* New AI Extracted Content Review Dialog */}
        <Dialog open={showAiExtractedDialog} onOpenChange={setShowAiExtractedDialog}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-purple-600" />
                        Review AI-Extracted Module Content
                    </DialogTitle>
                </DialogHeader>
                {aiExtractedContent && (
                    <div className="space-y-4 mt-4">
                        <Alert className="bg-purple-50 border-purple-200">
                            <Info className="w-5 h-5 text-purple-600" />
                            <AlertDescription className="text-purple-800">
                                This content was automatically extracted by AI from your uploaded document. Please review it
                                and either create the module as is, or edit it before creation.
                                <br />
                                <strong>AI DISCLAIMER:</strong> This content is AI-generated for educational purposes. Content should be reviewed by faculty before use. Always verify clinical information with current evidence-based sources.
                            </AlertDescription>
                        </Alert>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label className="font-semibold">Title:</Label>
                                <p>{aiExtractedContent.title}</p>
                            </div>
                            <div>
                                <Label className="font-semibold">Category:</Label>
                                <p>{aiExtractedContent.category}</p>
                            </div>
                            <div>
                                <Label className="font-semibold">Difficulty:</Label>
                                <p>{aiExtractedContent.difficulty_level}</p>
                            </div>
                        </div>

                        <div>
                            <Label className="font-semibold">Overview:</Label>
                            <p className="text-sm whitespace-pre-wrap">{aiExtractedContent.content?.overview}</p>
                        </div>
                        {aiExtractedContent.content?.learning_objectives?.length > 0 && (
                            <div>
                                <Label className="font-semibold">Learning Objectives:</Label>
                                <ul className="list-disc list-inside text-sm pl-5">
                                    {aiExtractedContent.content.learning_objectives.map((obj, i) => <li key={i}>{obj}</li>)}
                                </ul>
                            </div>
                        )}
                        {aiExtractedContent.content?.clinical_pearls?.length > 0 && (
                            <div>
                                <Label className="font-semibold">Clinical Pearls:</Label>
                                <ul className="list-disc list-inside text-sm pl-5">
                                    {aiExtractedContent.content.clinical_pearls.map((pearl, i) => <li key={i}>{pearl}</li>)}
                                </ul>
                            </div>
                        )}
                        {aiExtractedContent.content?.common_pitfalls?.length > 0 && (
                            <div>
                                <Label className="font-semibold">Common Pitfalls:</Label>
                                <ul className="list-disc list-inside text-sm pl-5">
                                    {aiExtractedContent.content.common_pitfalls.map((pitfall, i) => <li key={i}>{pitfall}</li>)}
                                </ul>
                            </div>
                        )}
                        {aiExtractedContent.quizzes?.length > 0 && (
                            <div>
                                <Label className="font-semibold">Quiz Questions:</Label>
                                <ul className="list-disc list-inside text-sm pl-5">
                                    {aiExtractedContent.quizzes.map((quiz, i) => <li key={i}>{quiz.question}</li>)}
                                </ul>
                            </div>
                        )}
                        {aiExtractedContent.content?.topics?.length > 0 && (
                            <div>
                                <Label className="font-semibold">Topics (summary):</Label>
                                <ul className="list-disc list-inside text-sm pl-5">
                                    {aiExtractedContent.content.topics.map((topic, i) => <li key={i}>{topic.heading}</li>)}
                                </ul>
                            </div>
                        )}

                        <div className="flex gap-2 justify-end">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setNewModule({
                                        title: aiExtractedContent.title,
                                        category: aiExtractedContent.category,
                                        difficulty_level: aiExtractedContent.difficulty_level,
                                        estimated_duration: "", // AI doesn't provide this
                                        content: aiExtractedContent.content,
                                        quizzes: aiExtractedContent.quizzes,
                                        practice_cases: [], // AI doesn't provide this
                                        resources: [], // AI doesn't provide this
                                        uploaded_files: aiExtractedContent.file_url ? [aiExtractedContent.file_url] : []
                                    });
                                    setUploadedFile({ name: "AI Extracted Document" }); // Placeholder for UI, if needed
                                    setActiveCreateTab("manual"); // Switch to manual tab
                                    setShowAiExtractedDialog(false); // Close review dialog
                                    setDialogOpen("create"); // Re-open main create dialog
                                }}
                            >
                                Edit & Create Module
                            </Button>
                            <Button
                                onClick={() => {
                                    createModuleMutation.mutate({
                                        title: aiExtractedContent.title,
                                        category: aiExtractedContent.category,
                                        difficulty_level: aiExtractedContent.difficulty_level,
                                        estimated_duration: "",
                                        content: aiExtractedContent.content,
                                        quizzes: aiExtractedContent.quizzes,
                                        practice_cases: [],
                                        resources: [],
                                        uploaded_files: aiExtractedContent.file_url ? [aiExtractedContent.file_url] : []
                                    });
                                    setShowAiExtractedDialog(false); // Close review dialog
                                    setDialogOpen(""); // Close main create dialog (will trigger resetForm due to onOpenChange)
                                    // setAiExtractedContent(null); // This is handled by resetForm
                                }}
                                disabled={createModuleMutation.isPending}
                                className="bg-purple-600 hover:bg-purple-700"
                            >
                                {createModuleMutation.isPending ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</>
                                ) : (
                                    <><Plus className="w-4 h-4 mr-2" />Create Module As Is</>
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}