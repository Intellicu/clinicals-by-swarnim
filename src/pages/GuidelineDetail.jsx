import React, { useState, useEffect } from "react";
import ContextualActionsPanel from "@/components/clinicalOS/ContextualActionsPanel";
import AIEnhancePanel from "@/components/clinicalOS/AIEnhancePanel";
import AdminGovernanceQueue from "@/components/clinicalOS/AdminGovernanceQueue";
import { base44 } from "@/api/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { BUILTIN_GUIDELINES } from "@/lib/guidelines/index";
import GuidelineDetailView from "../components/guidelines/GuidelineDetailView";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Award,
  Target,
  Lightbulb,
  ExternalLink,
  FileText,
  Calendar,
  Users,
  TrendingUp,
  CheckCircle,
  Info,
  Edit,
  Loader2,
  Table as TableIcon,
  ChevronDown,
  ChevronUp,
  History,
  ArrowRight,
  Sparkles,
  Link as LinkIcon,
  GraduationCap,
  Pill,
  Network,
  Dna,
  GitBranch
} from "lucide-react";
import { toast } from "sonner";
import GuidelineEditor from "../components/GuidelineEditor";
import MultimediaViewer from "../components/guidelines/MultimediaViewer";
import ReferencesPanel from "../components/guidelines/ReferencesPanel";
import SmartRelatedContent from "../components/guidelines/SmartRelatedContent";
import GuidelineCompletenessTracker from "../components/guidelines/GuidelineCompletenessTracker";
import TeachingModePanel from "../components/guidelines/TeachingModePanel";
import { Smartphone, BookOpenCheck } from "lucide-react";
import ExpertReviewPanel from "@/components/clinicalOS/ExpertReviewPanel";
import { EvidenceAuthorityPanel } from "@/components/clinicalOS/EvidenceAuthorityPanel";
import { GUIDELINE_HIERARCHY } from "@/lib/clinicalOS/EvidenceGovernance";
import StructuredPrescriptionPanel from "@/components/clinicalOS/StructuredPrescriptionPanel.jsx";
import ClinicalKnowledgeGraphPanel from "@/components/clinicalOS/ClinicalKnowledgeGraphPanel.jsx";
import EvidenceVersioningPanel from "@/components/clinicalOS/EvidenceVersioningPanel.jsx";
import DifferentialDiagnosisPanel from "@/components/clinicalOS/DifferentialDiagnosisPanel.jsx";

export default function GuidelineDetail() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const guidelineId = urlParams.get("id");

  const [editMode, setEditMode] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState(true);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [detailViewMode, setDetailViewMode] = useState("detailed"); // "quick" | "detailed"

  // Scroll to top when page loads or view mode changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [guidelineId, detailViewMode]);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  // Check built-in first (no network needed)
  const builtinGuideline = BUILTIN_GUIDELINES.find(g => g.id === guidelineId);

  const { data: dbGuideline, isLoading } = useQuery({
    queryKey: ['guideline', guidelineId],
    queryFn: async () => {
      const guidelines = await base44.entities.Guideline.list();
      return guidelines.find(g => g.id === guidelineId) || null;
    },
    enabled: !!guidelineId && !builtinGuideline, // Skip DB fetch if built-in found
  });

  const guideline = builtinGuideline || dbGuideline;
  const isBuiltin = !!builtinGuideline;

  // Query to fetch all guidelines for related links and AI enhancement context
  const { data: allGuidelines = [] } = useQuery({
    queryKey: ['guidelines'],
    queryFn: () => base44.entities.Guideline.list(),
    initialData: [] // Provide initial data to prevent undefined errors before fetch
  });

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      // The 'data' object received here from GuidelineEditor should already be fully processed,
      // including uploaded image URLs and cleaned arrays.
      
      const versionEntry = {
        timestamp: new Date().toISOString(),
        user: user?.email || "unknown",
        changes: "Updated guideline content" // General message for manual update
      };

      const existingHistory = guideline?.version_history || []; // Use optional chaining for guideline
      
      return base44.entities.Guideline.update(guidelineId, {
        ...data, // This 'data' object contains the final state of the guideline's editable fields
        last_reviewed: new Date().toISOString().split('T')[0], // Always update last_reviewed on save
        version_history: [...existingHistory, versionEntry]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['guideline', guidelineId]); // Invalidate specific guideline to refetch
      queryClient.invalidateQueries(['guidelines']); // Invalidate all guidelines, in case related links changed
      setEditMode(false); // Exit edit mode
      toast.success("Guideline updated successfully!");
    },
    onError: (error) => {
      console.error("Update error:", error);
      toast.error("Failed to update guideline");
    }
  });

  // New AI Enhance Mutation
  const enhanceGuidelineMutation = useMutation({
    mutationFn: async () => {
      setEnhancing(true);
      toast.info("AI enhancing guideline details...", { id: "enhance" });

      // Construct the prompt for the LLM based on current guideline data and all other guidelines
      const prompt = `You are a pediatric nephrologist enhancing a clinical guideline for a reference app.

Current guideline data:
Title: ${guideline.title}
Source: ${guideline.source}
Year: ${guideline.year}
Summary: ${guideline.scope_and_population}
Key Steps: ${guideline.key_recommendations?.join('; ') || 'N/A'}
Practice Pearls: ${guideline.practice_pearls?.join('; ') || 'N/A'}
Detailed Content (headings): ${guideline.content?.sections?.map(s => s.heading).join('; ') || 'N/A'}
Existing Keywords: ${guideline.keywords?.join(', ') || 'N/A'}
Existing Population: ${guideline.population?.join(', ') || 'N/A'}
Existing Clinical Scope: ${guideline.clinical_scope?.join(', ') || 'N/A'}
Existing Related Drugs: ${guideline.related_drugs?.join(', ') || 'N/A'}

Generate MISSING DETAILS or provide suggestions for improvement where current data is "N/A" or sparse, or add more depth.
1. Related drugs (list generic drug names commonly used for this condition, max 5, comma separated)
2. Target population age groups (e.g., Neonates, Infants, Children, Adolescents, All Ages - choose relevant, max 3)
3. Clinical scope areas (e.g., Diagnosis, Management, Follow-up, Prevention, Screening, Etiology - choose relevant, max 3)
4. Search keywords for this guideline (comma separated, max 10)
5. Detailed content sections with headings and rich HTML content (include tables, lists, drug dosing where relevant). If content sections already exist, add *new* relevant sections, do not regenerate existing ones. Focus on adding substantial, useful information.
6. Related guidelines from this list for internal linking (titles only, max 3, must exist in the list): ${allGuidelines.map(g => `${g.title} (${g.category})`).join(', ')}

Make it clinically comprehensive and actionable. Ensure HTML content is well-formed.
Only return JSON.`;

      const enhanced = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            related_drugs: { type: "array", items: { type: "string" } },
            population: { type: "array", items: { type: "string" } },
            clinical_scope: { type: "array", items: { type: "string" } },
            keywords: { type: "array", items: { type: "string" } },
            content_sections: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  heading: { type: "string" },
                  content: { type: "string" }
                },
                required: ["heading", "content"] // Ensure structure for new sections
              }
            },
            related_guideline_titles: { type: "array", items: { type: "string" } }
          }
        }
      });

      setEnhancing(false);
      toast.success("AI enhancement complete!", { id: "enhance" });

      // Merge AI generated data with existing guideline data, prioritizing existing unique values
      return {
        ...guideline, // Start with current guideline data
        related_drugs: Array.from(new Set([...(guideline.related_drugs || []), ...(enhanced.related_drugs || [])])),
        population: Array.from(new Set([...(guideline.population || []), ...(enhanced.population || [])])),
        clinical_scope: Array.from(new Set([...(guideline.clinical_scope || []), ...(enhanced.clinical_scope || [])])),
        keywords: Array.from(new Set([...(guideline.keywords || []), ...(enhanced.keywords || [])])),
        content: {
          sections: [
            ...(guideline.content?.sections || []), // Keep existing sections
            ...(enhanced.content_sections || []) // Add new AI-generated sections
          ]
        },
        // 'related_guideline_titles' from AI are for internal linking helper, not stored directly in the guideline entity.
      };
    },
    onSuccess: (enhancedData) => {
      // After enhancing, trigger the update mutation to save the new data
      updateMutation.mutate({
        ...enhancedData,
        // Override version history entry for AI-enhanced updates
        version_history: [
          ...(guideline?.version_history || []),
          {
            timestamp: new Date().toISOString(),
            user: user?.email || "AI System",
            changes: "AI enhanced guideline details"
          }
        ]
      });
    },
    onError: (error) => {
      console.error("AI Enhance error:", error);
      setEnhancing(false);
      toast.error("Failed to enhance guideline with AI");
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!guideline) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8 flex items-center justify-center">
        <Card className="p-12 text-center">
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">Guideline not found</p>
          <Button onClick={() => navigate(createPageUrl("Guidelines"))} className="mt-4">
            Back to Guidelines
          </Button>
        </Card>
      </div>
    );
  }

  // Find related guidelines for internal linking, considering various criteria
  const relatedGuidelines = allGuidelines.filter(g =>
    g.id !== guideline.id && // Exclude the current guideline
    (g.category === guideline.category || // Same category
     g.keywords?.some(k => guideline.keywords?.includes(k)) || // Shared keywords
     g.population?.some(p => guideline.population?.includes(p)) || // Shared population
     g.clinical_scope?.some(cs => guideline.clinical_scope?.includes(cs))) // Shared clinical scope
  ).slice(0, 4); // Limit to a few related guidelines

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => navigate(createPageUrl("Guidelines"))}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>

          {/* View mode toggle (always shown) */}
          <div className="flex rounded-lg overflow-hidden border border-slate-200 bg-white">
            <button
              onClick={() => setDetailViewMode("quick")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors ${detailViewMode === "quick" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50"}`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              Quick
            </button>
            <button
              onClick={() => setDetailViewMode("detailed")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors ${detailViewMode === "detailed" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50"}`}
            >
              <BookOpenCheck className="w-3.5 h-3.5" />
              Full
            </button>
          </div>

          <div className="flex gap-2">
            {!isBuiltin && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowVersionHistory(!showVersionHistory)}
                  className="border-slate-300"
                >
                  <History className="w-4 h-4 mr-1" />
                  History
                </Button>
                <Button
                  onClick={() => enhanceGuidelineMutation.mutate()}
                  disabled={enhancing || updateMutation.isPending}
                  variant="outline"
                  size="sm"
                  className="border-purple-300 hover:bg-purple-50"
                >
                  {enhancing ? (
                    <><Loader2 className="w-4 h-4 mr-1 animate-spin" />Enhancing…</>
                  ) : (
                    <><Sparkles className="w-4 h-4 mr-1" />AI Enhance</>
                  )}
                </Button>
                <Button size="sm" onClick={() => setEditMode(true)} disabled={editMode} className="bg-blue-600 hover:bg-blue-700">
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              </>
            )}
            {isBuiltin && (
              <Badge className="bg-blue-100 text-blue-700 border border-blue-200 text-xs self-center px-3 py-1.5">
                Built-in Structured Content
              </Badge>
            )}
          </div>
        </div>

        {/* ── Built-in guideline: use GuidelineDetailView component ── */}
        {isBuiltin && (
          <>
            {/* Title & Metadata */}
            <Card className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-300 shadow-xl overflow-hidden">
              <CardHeader className="pb-4">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="bg-blue-600 text-white text-sm px-3 py-1 font-semibold">{guideline.source}</Badge>
                    <Badge variant="outline" className="text-sm px-3 py-1 border-2 font-semibold">{guideline.year}</Badge>
                    <Badge className="bg-slate-700 text-white text-sm px-3 py-1">{guideline.category}</Badge>
                    {guideline.evidence_level && (
                      <Badge className={`${guideline.evidence_level.includes("High") ? "bg-green-500" : guideline.evidence_level.includes("Moderate") ? "bg-amber-500" : "bg-slate-500"} text-white text-sm px-3 py-1 font-semibold`}>
                        <Award className="w-3.5 h-3.5 mr-1.5" />{guideline.evidence_level}
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">{guideline.title}</h1>
                  {guideline.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {guideline.tags.slice(0, 8).map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-xs bg-white/60">{tag}</Badge>
                      ))}
                    </div>
                  )}
                  {guideline.summary && (
                    <p className="text-sm text-slate-600 leading-relaxed">{guideline.summary}</p>
                  )}
                </div>
              </CardHeader>
            </Card>

            {/* Evidence Authority Panel */}
            <EvidenceAuthorityPanel
              area={Object.keys(GUIDELINE_HIERARCHY).find(k =>
                guideline.category?.toLowerCase().replace(/\s+/g, "_").includes(k) || k.includes(guideline.category?.toLowerCase().split(" ")[0])
              )}
              reviewStatus={guideline.review_status || (guideline.sections ? "EXPERT_REVIEWED" : "DRAFT")}
              reviewedBy={guideline.reviewed_by}
              lastExpertUpdate={guideline.last_expert_update}
            />

            {/* Contextual actions for built-in */}
            <Card className="border border-emerald-200 shadow-sm">
              <CardContent className="p-4">
                <ContextualActionsPanel category={guideline.category} compact />
              </CardContent>
            </Card>

            {/* Content via GuidelineDetailView — passes mode from toggle */}
            <GuidelineDetailView guideline={guideline} defaultMode={detailViewMode} key={detailViewMode} />
          </>
        )}

        {/* ── DB guideline: original full view + edit mode ── */}
        {!isBuiltin && !editMode ? (
          <>
            {/* Title & Metadata Card */}
            <Card className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-300 shadow-xl">
              <CardHeader className="pb-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={`${
                      guideline.source?.includes("KDIGO") ? "bg-blue-600" :
                      guideline.source?.includes("IAP") ? "bg-green-600" :
                      guideline.source?.includes("IPNA") ? "bg-purple-600" :
                      guideline.source?.includes("ISPD") ? "bg-cyan-600" :
                      guideline.source?.includes("ESPN") ? "bg-indigo-600" :
                      "bg-slate-600"
                    } text-white text-base px-4 py-2 font-semibold shadow-sm`}>
                      {guideline.source}
                    </Badge>
                    <Badge variant="outline" className="text-base px-4 py-2 border-2 font-semibold">
                      {guideline.year}
                    </Badge>
                    <Badge className="bg-slate-700 text-white text-base px-4 py-2">
                      {guideline.category}
                    </Badge>
                    {guideline.evidence_level && (
                      <Badge className={`${
                        guideline.evidence_level.includes("High") ? "bg-green-500" :
                        guideline.evidence_level.includes("Moderate") ? "bg-amber-500" :
                        "bg-slate-500"
                      } text-white text-base px-4 py-2 font-semibold shadow-sm`}>
                        <Award className="w-4 h-4 mr-2" />
                        {guideline.evidence_level}
                      </Badge>
                    )}
                  </div>
                  
                  <h1 className="text-4xl font-bold text-slate-900 leading-tight">{guideline.title}</h1>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-slate-700">
                    {guideline.last_reviewed && (
                      <div className="flex items-center gap-2 bg-white/60 px-3 py-1.5 rounded-lg">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">Last reviewed: {guideline.last_reviewed}</span>
                      </div>
                    )}
                    {guideline.population && guideline.population.length > 0 && (
                      <div className="flex items-center gap-2 bg-white/60 px-3 py-1.5 rounded-lg">
                        <Users className="w-4 h-4 text-purple-600" />
                        <span className="font-medium">{guideline.population.join(", ")}</span>
                      </div>
                    )}
                    {guideline.clinical_scope && guideline.clinical_scope.length > 0 && (
                      <div className="flex items-center gap-2 bg-white/60 px-3 py-1.5 rounded-lg">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="font-medium">{guideline.clinical_scope.join(", ")}</span>
                      </div>
                    )}
                    {guideline.related_drugs && guideline.related_drugs.length > 0 && (
                      <div className="flex items-center gap-2 bg-white/60 px-3 py-1.5 rounded-lg">
                        <Sparkles className="w-4 h-4 text-pink-600" />
                        <span className="font-medium">Drugs: {guideline.related_drugs.join(", ")}</span>
                      </div>
                    )}
                  </div>

                  {(guideline.external_link || guideline.pdf_url) && (
                    <div className="flex gap-3">
                      {guideline.external_link && (
                        <a href={guideline.external_link} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" className="border-blue-300 hover:bg-blue-50">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Original Guideline
                          </Button>
                        </a>
                      )}
                      {guideline.pdf_url && (
                        <a href={guideline.pdf_url} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" className="border-purple-300 hover:bg-purple-50">
                            <FileText className="w-4 h-4 mr-2" />
                            View PDF
                          </Button>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>
            </Card>

            {/* Evidence Authority + Expert Review */}
            <EvidenceAuthorityPanel
              area={Object.keys(GUIDELINE_HIERARCHY).find(k =>
                guideline.category?.toLowerCase().replace(/\s+/g, "_").includes(k) || k.includes(guideline.category?.toLowerCase().split(" ")[0])
              )}
              reviewStatus={guideline.review_status || "DRAFT"}
              reviewedBy={guideline.reviewed_by}
              lastExpertUpdate={guideline.last_expert_update}
            />
            {user && (
              <ExpertReviewPanel
                entity={guideline}
                entityType="guideline"
                user={user}
                onSave={async (reviewData) => updateMutation.mutate({ ...guideline, ...reviewData })}
              />
            )}

            {/* Version History */}
            {showVersionHistory && guideline.version_history && guideline.version_history.length > 0 && (
              <Card className="shadow-lg border-2 border-slate-300">
                <CardHeader className="bg-slate-100">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <History className="w-5 h-5 text-slate-600" />
                    Version History
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    {guideline.version_history.slice().reverse().map((version, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-sm p-3 bg-slate-50 rounded border">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        <span className="text-slate-700">{new Date(version.timestamp).toLocaleString()}</span>
                        <span className="text-slate-600">by {version.user}</span>
                        <span className="text-slate-500 ml-auto italic">{version.changes}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Clinical Summary - ALWAYS SHOWN FIRST */}
            {guideline.scope_and_population && (
              <Card className="shadow-xl border-2 border-blue-300">
                <CardHeader className="bg-gradient-to-r from-blue-100 to-indigo-100 border-b-2 border-blue-300">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <FileText className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-blue-900">Clinical Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="prose prose-lg max-w-none">
                    <p className="text-slate-800 leading-relaxed text-lg font-medium">
                      {guideline.scope_and_population}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Key Management Steps - Algorithm Format */}
            {guideline.key_recommendations && guideline.key_recommendations.length > 0 && (
              <Card className="shadow-xl border-2 border-green-300">
                <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-100 border-b-2 border-green-300">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Target className="w-7 h-7 text-white" />
                      </div>
                      <span className="text-green-900">Management Algorithm</span>
                      <Badge className="bg-green-600 text-white text-base px-3 py-1.5">
                        {guideline.key_recommendations.length} Steps
                      </Badge>
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedSteps(!expandedSteps)}
                      className="hover:bg-green-200"
                    >
                      {expandedSteps ? (
                        <ChevronUp className="w-5 h-5 text-green-700" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-green-700" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                {expandedSteps && (
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {guideline.key_recommendations.map((rec, idx) => (
                        <div key={idx} className="flex items-start gap-4 bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-xl border-2 border-green-300 hover:border-green-400 transition-all group relative">
                          <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-lg shadow-md">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <p className="text-slate-900 leading-relaxed font-medium text-base">{rec}</p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            )}

            {/* Tabbed Interface for Pearls, Content, Tables, Related, Multimedia, References */}
            <Tabs defaultValue="pearls" className="w-full">
              <TabsList className="flex w-full h-auto flex-wrap gap-1 p-1">
                <TabsTrigger value="pearls" className="text-sm flex items-center gap-1.5 flex-1 min-w-[80px]">
                  <Lightbulb className="w-4 h-4" />
                  <span className="hidden sm:inline">Pearls</span>
                </TabsTrigger>
                <TabsTrigger value="content" className="text-sm flex items-center gap-1.5 flex-1 min-w-[80px]">
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">Content</span>
                </TabsTrigger>
                <TabsTrigger value="tables" className="text-sm flex items-center gap-1.5 flex-1 min-w-[80px]">
                  <TableIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Tables</span>
                </TabsTrigger>
                <TabsTrigger value="multimedia" className="text-sm flex items-center gap-1.5 flex-1 min-w-[80px]">
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden sm:inline">Media</span>
                </TabsTrigger>
                <TabsTrigger value="related" className="text-sm flex items-center gap-1.5 flex-1 min-w-[80px]">
                  <LinkIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Related</span>
                </TabsTrigger>
                <TabsTrigger value="references" className="text-sm flex items-center gap-1.5 flex-1 min-w-[80px] bg-indigo-50 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                  <Award className="w-4 h-4" />
                  <span className="hidden sm:inline">Evidence</span>
                </TabsTrigger>
                <TabsTrigger value="teaching" className="text-sm flex items-center gap-1.5 flex-1 min-w-[80px]">
                  <GraduationCap className="w-4 h-4" />
                  <span className="hidden sm:inline">Teach</span>
                </TabsTrigger>
                <TabsTrigger value="audit" className="text-sm flex items-center gap-1.5 flex-1 min-w-[80px]">
                  <TrendingUp className="w-4 h-4" />
                  <span className="hidden sm:inline">Audit</span>
                </TabsTrigger>
                <TabsTrigger value="actions" className="text-sm flex items-center gap-1.5 flex-1 min-w-[80px]">
                  <ArrowRight className="w-4 h-4" />
                  <span className="hidden sm:inline">Actions</span>
                </TabsTrigger>
                <TabsTrigger value="prescriptions" className="text-sm flex items-center gap-1.5 flex-1 min-w-[80px]">
                  <Pill className="w-4 h-4" />
                  <span className="hidden sm:inline">Rx</span>
                </TabsTrigger>
                <TabsTrigger value="knowledge" className="text-sm flex items-center gap-1.5 flex-1 min-w-[80px]">
                  <Network className="w-4 h-4" />
                  <span className="hidden sm:inline">Graph</span>
                </TabsTrigger>
                <TabsTrigger value="ddx" className="text-sm flex items-center gap-1.5 flex-1 min-w-[80px]">
                  <GitBranch className="w-4 h-4" />
                  <span className="hidden sm:inline">DDx</span>
                </TabsTrigger>
                <TabsTrigger value="versioning" className="text-sm flex items-center gap-1.5 flex-1 min-w-[80px]">
                  <History className="w-4 h-4" />
                  <span className="hidden sm:inline">Versions</span>
                </TabsTrigger>
                {user?.role === "admin" && (
                  <TabsTrigger value="governance" className="text-sm flex items-center gap-1.5 flex-1 min-w-[80px] bg-indigo-50 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                    <Sparkles className="w-4 h-4" />
                    <span className="hidden sm:inline">AI+Gov</span>
                  </TabsTrigger>
                )}
              </TabsList>

              {/* Practice Pearls Tab */}
              <TabsContent value="pearls" className="mt-6">
                <Card className="shadow-xl border-2 border-amber-300">
                  <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100 border-b-2 border-amber-300">
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <div className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Lightbulb className="w-7 h-7 text-white" />
                      </div>
                      <span className="text-amber-900">Clinical Practice Pearls</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {guideline.practice_pearls && guideline.practice_pearls.length > 0 ? (
                      <div className="space-y-4">
                        {guideline.practice_pearls.map((pearl, idx) => (
                          <div key={idx} className="flex items-start gap-4 bg-gradient-to-r from-amber-50 to-yellow-50 p-5 rounded-xl border-2 border-amber-300">
                            <Lightbulb className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                            <p className="text-amber-900 leading-relaxed font-medium text-base flex-1">{pearl}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Alert className="bg-blue-50 border-blue-200">
                        <Info className="w-4 h-4 text-blue-600" />
                        <AlertDescription className="text-blue-800">
                          No practice pearls available. Click "Edit" to add them or "AI Enhance" for suggestions.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Detailed Content Tab */}
              <TabsContent value="content" className="mt-6">
                <Card className="shadow-xl border-2 border-purple-300">
                  <CardHeader className="bg-gradient-to-r from-purple-100 to-indigo-100 border-b-2 border-purple-300">
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <FileText className="w-7 h-7 text-white" />
                      </div>
                      <span className="text-purple-900">Comprehensive Guideline Content</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    {guideline.content?.sections && guideline.content.sections.length > 0 ? (
                      <div className="space-y-8">
                        {guideline.content.sections.map((section, idx) => (
                          <div key={idx} className="border-l-4 border-purple-500 pl-6 bg-white p-6 rounded-r-xl shadow-sm">
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">{section.heading}</h3>
                            {section.content && (
                              <div
                                className="prose prose-slate max-w-none mb-4"
                                dangerouslySetInnerHTML={{ __html: section.content }}
                              />
                            )}
                            {section.key_points && section.key_points.length > 0 && (
                              <ul className="space-y-2 mt-4">
                                {section.key_points.map((point, pidx) => (
                                  <li key={pidx} className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                    <span className="text-slate-700 leading-relaxed">{point}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Alert className="bg-blue-50 border-blue-200">
                        <Info className="w-4 h-4 text-blue-600" />
                        <AlertDescription className="text-blue-800">
                          No detailed content available. Click "Edit" to add comprehensive content or "AI Enhance" to generate it.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tables & Images Tab */}
              <TabsContent value="tables" className="mt-6">
                <Card className="shadow-xl border-2 border-cyan-300">
                  <CardHeader className="bg-gradient-to-r from-cyan-100 to-blue-100 border-b-2 border-cyan-300">
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <div className="w-12 h-12 bg-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                        <TableIcon className="w-7 h-7 text-white" />
                      </div>
                      <span className="text-cyan-900">Tables, Algorithms & Diagrams</span>
                      {guideline.images && guideline.images.length > 0 && (
                        <Badge className="bg-cyan-600 text-white text-base px-3 py-1.5 ml-auto">
                          {guideline.images.length} Items
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {guideline.images && guideline.images.length > 0 ? (
                      <div className="grid md:grid-cols-2 gap-6">
                        {guideline.images.map((img, idx) => (
                          <div key={idx} className="border-2 border-cyan-200 rounded-xl overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-shadow">
                            <div className="aspect-video bg-slate-100 flex items-center justify-center overflow-hidden">
                              <img src={img.url} alt={img.caption || `Image ${idx + 1}`} className="w-full h-full object-contain" />
                            </div>
                            <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 border-t-2 border-cyan-200">
                              <Badge className="bg-cyan-600 text-white mb-2 text-sm px-3 py-1">
                                {img.type || "figure"}
                              </Badge>
                              {img.caption && (
                                <p className="text-sm text-slate-700 font-medium mt-2">{img.caption}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Alert className="bg-blue-50 border-blue-200">
                        <Info className="w-4 h-4 text-blue-600" />
                        <AlertDescription className="text-blue-800">
                          No tables or images available. Click "Edit" to upload visual resources.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Multimedia Tab */}
              <TabsContent value="multimedia" className="mt-6">
                <MultimediaViewer multimedia={guideline.multimedia} />
              </TabsContent>

              {/* References & Evidence Tab */}
              <TabsContent value="references" className="mt-6">
                <Card className="shadow-xl border-2 border-indigo-300">
                  <CardHeader className="bg-gradient-to-r from-indigo-100 to-blue-100 border-b-2 border-indigo-300">
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Award className="w-7 h-7 text-white" />
                      </div>
                      <span className="text-indigo-900">References, Evidence & Citations</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ReferencesPanel guideline={guideline} />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Teaching Mode Tab */}
              <TabsContent value="teaching" className="mt-6">
                <Card className="shadow-xl border-2 border-violet-300">
                  <CardHeader className="bg-gradient-to-r from-violet-100 to-purple-100 border-b-2 border-violet-300">
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <div className="w-12 h-12 bg-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                        <GraduationCap className="w-7 h-7 text-white" />
                      </div>
                      <span className="text-violet-900">Teaching Mode</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <TeachingModePanel guideline={guideline} />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Audit & Completeness Tab */}
              <TabsContent value="audit" className="mt-6">
                <Card className="shadow-xl border-2 border-teal-300">
                  <CardHeader className="bg-gradient-to-r from-teal-100 to-emerald-100 border-b-2 border-teal-300">
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                        <TrendingUp className="w-7 h-7 text-white" />
                      </div>
                      <span className="text-teal-900">Content Completeness Audit</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <GuidelineCompletenessTracker guideline={guideline} />
                    <div className="border-t pt-4">
                      <p className="text-sm font-bold text-slate-700 mb-3">Smart Ecosystem Links</p>
                      <SmartRelatedContent guideline={guideline} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Related Guidelines & Links Tab */}
              <TabsContent value="related" className="mt-6">
                <Card className="shadow-xl border-2 border-indigo-300">
                  <CardHeader className="bg-gradient-to-r from-indigo-100 to-blue-100 border-b-2 border-indigo-300">
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                        <LinkIcon className="w-7 h-7 text-white" />
                      </div>
                      <span className="text-indigo-900">Related Guidelines</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {relatedGuidelines.length > 0 ? (
                      <div className="grid md:grid-cols-2 gap-4">
                        {relatedGuidelines.map((related) => (
                          <Link key={related.id} to={createPageUrl("GuidelineDetail") + "?id=" + related.id}>
                            <Card className="hover:shadow-lg transition-all border-2 hover:border-indigo-400">
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  <FileText className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-1" />
                                  <div>
                                    <h4 className="font-semibold text-slate-900 mb-1">{related.title}</h4>
                                    <div className="flex gap-2">
                                      {related.category && <Badge className="bg-indigo-100 text-indigo-800 text-xs">{related.category}</Badge>}
                                      {related.year && <Badge variant="outline" className="text-xs">{related.year}</Badge>}
                                    </div>
                                    {related.scope_and_population && (
                                      <p className="text-sm text-slate-600 mt-2 line-clamp-2">{related.scope_and_population}</p>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <Alert className="bg-blue-50 border-blue-200">
                        <Info className="w-4 h-4 text-blue-600" />
                        <AlertDescription className="text-blue-800">
                          No related guidelines found. Click "AI Enhance" to potentially generate more connections by enriching guideline metadata.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              {/* Contextual Actions Tab */}
              <TabsContent value="actions" className="mt-4">
                <Card className="shadow-lg border-2 border-emerald-200">
                  <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-200 pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <ArrowRight className="w-5 h-5 text-emerald-600" />
                      <span className="text-emerald-900">Contextual Clinical Actions</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <ContextualActionsPanel category={guideline.category} />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Prescription Templates Tab */}
              <TabsContent value="prescriptions" className="mt-4">
                <Card className="shadow-lg border-2 border-blue-200">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Pill className="w-5 h-5 text-blue-600" />
                      <span className="text-blue-900">Evidence-Linked Prescription Templates</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <StructuredPrescriptionPanel category={guideline.category} />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Knowledge Graph Tab */}
              <TabsContent value="knowledge" className="mt-4">
                <Card className="shadow-lg border-2 border-green-200">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 border-b border-green-200 pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Network className="w-5 h-5 text-green-600" />
                      <span className="text-green-900">Clinical Knowledge Graph</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <ClinicalKnowledgeGraphPanel />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Differential Diagnosis Tab */}
              <TabsContent value="ddx" className="mt-4">
                <Card className="shadow-lg border-2 border-indigo-200">
                  <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-200 pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <GitBranch className="w-5 h-5 text-indigo-600" />
                      <span className="text-indigo-900">Differential Diagnosis Engine</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <DifferentialDiagnosisPanel />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Evidence Versioning Tab */}
              <TabsContent value="versioning" className="mt-4">
                <Card className="shadow-lg border-2 border-amber-200">
                  <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <History className="w-5 h-5 text-amber-600" />
                      <span className="text-amber-900">Evidence Version History</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <EvidenceVersioningPanel />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Admin + AI Governance Tab */}
              {user?.role === "admin" && (
                <TabsContent value="governance" className="mt-4 space-y-4">
                  <AIEnhancePanel
                    guideline={guideline}
                    isAdmin={true}
                    onApprove={(data) => updateMutation.mutate({ ...guideline, ...data })}
                    onReject={() => {}}
                  />
                  <AdminGovernanceQueue user={user} />
                </TabsContent>
              )}
            </Tabs>
          </>
        ) : (
          // Comprehensive Edit Dialog, now encapsulated in GuidelineEditor component
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto">
            <div className="min-h-screen p-6 flex items-start justify-center">
              <Card className="w-full max-w-6xl my-6 shadow-2xl">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-b-2">
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Edit className="w-6 h-6" />
                    Edit Guideline - Complete Editor
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 max-h-[85vh] overflow-y-auto"> {/* Adjusted padding to 0 for inner scroll */}
                  <GuidelineEditor
                    initialData={guideline} // Pass current guideline data to the editor
                    onSave={(data) => {
                      updateMutation.mutate(data); // Editor passes fully processed data, including uploaded image URLs
                    }}
                    onCancel={() => setEditMode(false)}
                    isSaving={updateMutation.isPending} // Pass saving state to editor for button feedback
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}