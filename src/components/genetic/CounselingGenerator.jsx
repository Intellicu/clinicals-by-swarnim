import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Send, Copy, Heart, Users, Baby, Shield, FileText, RefreshCw, ChevronDown, ChevronUp, Info } from "lucide-react";
import { base44 } from "@/api/client";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

const RESULT_TYPES = [
  { id: "positive", label: "Positive (P/LP)", color: "bg-red-100 text-red-800 border-red-300", icon: "🔴" },
  { id: "vus", label: "VUS", color: "bg-amber-100 text-amber-800 border-amber-300", icon: "🟡" },
  { id: "negative", label: "Negative", color: "bg-green-100 text-green-800 border-green-300", icon: "🟢" },
  { id: "carrier", label: "Carrier", color: "bg-blue-100 text-blue-800 border-blue-300", icon: "🔵" },
];

const INHERITANCE_TYPES = ["AR", "AD", "XLR", "XLD", "Mitochondrial"];

const CONDITION_PRESETS = [
  { label: "Nephrotic Syndrome (NPHS1/2)", gene: "NPHS2", condition: "Steroid-Resistant Nephrotic Syndrome", inheritance: "AR" },
  { label: "Alport Syndrome (COL4A5, XLR)", gene: "COL4A5", condition: "X-linked Alport Syndrome", inheritance: "XLR" },
  { label: "Alport Syndrome (COL4A3/4, AR)", gene: "COL4A3", condition: "Autosomal Recessive Alport Syndrome", inheritance: "AR" },
  { label: "ADPKD (PKD1)", gene: "PKD1", condition: "Autosomal Dominant PKD", inheritance: "AD" },
  { label: "aHUS (CFH)", gene: "CFH", condition: "Atypical HUS", inheritance: "AD" },
  { label: "Primary Hyperoxaluria (AGXT)", gene: "AGXT", condition: "Primary Hyperoxaluria Type 1", inheritance: "AR" },
  { label: "Nephronophthisis (NPHP1)", gene: "NPHP1", condition: "Nephronophthisis", inheritance: "AR" },
  { label: "Cystinosis (CTNS)", gene: "CTNS", condition: "Cystinosis", inheritance: "AR" },
];

const COUNSELING_SECTIONS = [
  { id: "all", label: "Full Counseling Plan", icon: FileText },
  { id: "emotional", label: "Emotional Support", icon: Heart },
  { id: "reproductive", label: "Reproductive Counseling", icon: Baby },
  { id: "cascade", label: "Family Cascade Testing", icon: Users },
  { id: "surveillance", label: "Surveillance Plan", icon: Shield },
  { id: "letter", label: "Family Letter", icon: FileText },
  { id: "recontact", label: "Re-contact Plan", icon: RefreshCw },
];

export default function CounselingGenerator({ conversation, onSendMessage }) {
  const [resultType, setResultType] = useState("positive");
  const [inheritance, setInheritance] = useState("AR");
  const [gene, setGene] = useState("");
  const [condition, setCondition] = useState("");
  const [variant, setVariant] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [deNovo, setDeNovo] = useState(false);
  const [selectedSection, setSelectedSection] = useState("all");
  const [customContext, setCustomContext] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});

  const applyPreset = (preset) => {
    setGene(preset.gene);
    setCondition(preset.condition);
    setInheritance(preset.inheritance);
  };

  const buildPrompt = () => {
    const sectionLabel = COUNSELING_SECTIONS.find(s => s.id === selectedSection)?.label || "Full Counseling Plan";
    
    let prompt = `Generate a comprehensive ${sectionLabel} for the following case:\n\n`;
    prompt += `**Result Type:** ${resultType.toUpperCase()}\n`;
    if (gene) prompt += `**Gene:** ${gene}\n`;
    if (variant) prompt += `**Variant:** ${variant}\n`;
    if (condition) prompt += `**Condition:** ${condition}\n`;
    prompt += `**Inheritance Pattern:** ${inheritance}\n`;
    if (patientAge) prompt += `**Patient Age:** ${patientAge} years\n`;
    if (deNovo) prompt += `**De novo variant confirmed:** Yes — neither parent carries this variant\n`;
    if (customContext) prompt += `\n**Additional Clinical Context:**\n${customContext}\n`;
    
    prompt += `\nJurisdiction: India (AIIMS Patna context). Please include India-specific psychosocial and financial counseling where relevant.\n\n`;
    
    if (selectedSection === "all") {
      prompt += `Please generate the FULL COUNSELING DOCUMENT covering ALL sections: Pre-Disclosure Checklist, Emotional Support Language, Reproductive Counseling, Family Cascade Testing Plan, Condition-Specific Surveillance Plan, Psychosocial & Genetic Discrimination Advisory, Plain-Language Family Letter (English + Hindi), Re-contact Plan, and Patient Genetic Result Summary Card.`;
    } else if (selectedSection === "emotional") {
      prompt += `Focus specifically on Section 2 — EMOTIONAL SUPPORT LANGUAGE. Generate the result-appropriate empathetic opening statement, flag all psychological support elements triggered by this result type, and provide specific language scripts the clinician can use.`;
    } else if (selectedSection === "reproductive") {
      prompt += `Focus specifically on Section 3 — REPRODUCTIVE COUNSELING. Provide detailed recurrence risk calculation, all reproductive options available in India, and partner testing recommendation letter template.`;
    } else if (selectedSection === "cascade") {
      prompt += `Focus specifically on Section 4 — FAMILY CASCADE TESTING PLAN. List who should be tested, in what priority order, what test is appropriate for each relative, and whether/when children should be tested. Include the ethical principles for paediatric testing.`;
    } else if (selectedSection === "surveillance") {
      prompt += `Focus specifically on Section 5 — CONDITION-SPECIFIC SURVEILLANCE PLAN. Generate a detailed surveillance schedule with frequency, age to start, specialties to involve, medication cautions, and lifestyle counseling.`;
    } else if (selectedSection === "letter") {
      prompt += `Generate Section 7 — the PLAIN-LANGUAGE FAMILY LETTER in both English and Hindi (Devanagari script). The letter should be at 8th-grade reading level, explain why relatives should consider testing, and include placeholders for clinic contact details.`;
    } else if (selectedSection === "recontact") {
      prompt += `Generate Section 8 — the RE-CONTACT PLAN and the PATIENT GENETIC RESULT SUMMARY CARD. Include specific timelines, what to re-check, and flag any age milestones for childhood patients.`;
    }
    
    return prompt;
  };

  const generate = async () => {
    if (!conversation) { toast.error("AI session not ready — please wait"); return; }
    if (!gene && !condition) { toast.error("Please enter a gene or condition"); return; }
    setIsGenerating(true);
    setResult(null);
    try {
      const prompt = buildPrompt();
      await onSendMessage(prompt);
      // Result will appear in main chat — we set a flag to show it was triggered
      setResult("sent");
      toast.success("Counseling request sent — see AI Analyzer tab for the full output");
    } catch (e) {
      toast.error("Failed to generate counseling");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateStandalone = async () => {
    if (!gene && !condition) { toast.error("Please enter a gene or condition"); return; }
    setIsGenerating(true);
    setResult(null);
    try {
      const prompt = buildPrompt();
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are ClinGen Assist, an expert genetic counseling AI for a paediatric nephrology centre in India (AIIMS Patna). Be structured and thorough. Use markdown headers and bullet points. ${prompt}`,
      });
      setResult(res);
    } catch (e) {
      console.error(e);
      toast.error("Generation failed — please try again");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <Alert className="bg-rose-50 border-rose-200">
        <Heart className="w-4 h-4 text-rose-600" />
        <AlertDescription className="text-xs text-rose-900">
          <strong>Genetic Counseling Generator</strong> — Produces structured counseling documentation tailored to the result type, inheritance pattern, and Indian clinical context. Output is for clinician use; review before sharing with families. Uses advanced AI model.
        </AlertDescription>
      </Alert>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Input Panel */}
        <div className="lg:col-span-1 space-y-3">
          {/* Condition Presets */}
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-2 border-b bg-slate-50">
              <CardTitle className="text-xs font-bold text-slate-700">Quick Presets</CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-1">
              {CONDITION_PRESETS.map(p => (
                <button key={p.label} onClick={() => applyPreset(p)}
                  className="w-full text-left text-xs px-2 py-1.5 bg-slate-50 hover:bg-violet-50 hover:text-violet-800 rounded border border-transparent hover:border-violet-200 transition-all">
                  {p.label}
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Result Type */}
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-2 border-b bg-slate-50">
              <CardTitle className="text-xs font-bold text-slate-700">Result Type</CardTitle>
            </CardHeader>
            <CardContent className="p-3 grid grid-cols-2 gap-1">
              {RESULT_TYPES.map(r => (
                <button key={r.id} onClick={() => setResultType(r.id)}
                  className={`text-xs px-2 py-1.5 rounded border font-medium transition-all ${resultType === r.id ? r.color + " border-current" : "bg-slate-50 text-slate-600 border-slate-200"}`}>
                  {r.icon} {r.label}
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Gene & Variant */}
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-2 border-b bg-slate-50">
              <CardTitle className="text-xs font-bold text-slate-700">Clinical Details</CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2 text-xs">
              <div>
                <label className="text-slate-600 font-medium">Gene *</label>
                <input value={gene} onChange={e => setGene(e.target.value)} placeholder="e.g. NPHS2, COL4A5"
                  className="w-full mt-0.5 border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-violet-300" />
              </div>
              <div>
                <label className="text-slate-600 font-medium">Variant (HGVS)</label>
                <input value={variant} onChange={e => setVariant(e.target.value)} placeholder="e.g. c.686G>A (p.Arg229Gln)"
                  className="w-full mt-0.5 border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-violet-300" />
              </div>
              <div>
                <label className="text-slate-600 font-medium">Condition</label>
                <input value={condition} onChange={e => setCondition(e.target.value)} placeholder="e.g. Alport Syndrome"
                  className="w-full mt-0.5 border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-violet-300" />
              </div>
              <div>
                <label className="text-slate-600 font-medium">Patient Age (years)</label>
                <input type="number" value={patientAge} onChange={e => setPatientAge(e.target.value)} placeholder="e.g. 7"
                  className="w-full mt-0.5 border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-violet-300" />
              </div>
              <div>
                <label className="text-slate-600 font-medium">Inheritance Pattern</label>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {INHERITANCE_TYPES.map(i => (
                    <button key={i} onClick={() => setInheritance(i)}
                      className={`px-2 py-0.5 rounded text-xs border transition-all ${inheritance === i ? "bg-violet-600 text-white border-violet-600" : "bg-white text-slate-600 border-slate-300"}`}>
                      {i}
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={deNovo} onChange={e => setDeNovo(e.target.checked)} className="rounded" />
                <span className="text-slate-600 font-medium">De novo variant (confirmed)</span>
              </label>
              <div>
                <label className="text-slate-600 font-medium">Additional Context</label>
                <textarea value={customContext} onChange={e => setCustomContext(e.target.value)}
                  placeholder="e.g. 3-year-old male, parents are first cousins, family history of early kidney failure in siblings..."
                  rows={3}
                  className="w-full mt-0.5 border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-violet-300 resize-none" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Output Panel */}
        <div className="lg:col-span-2 space-y-3">
          {/* Section selector */}
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-2 border-b bg-violet-50">
              <CardTitle className="text-xs font-bold text-violet-900">Select Counseling Section</CardTitle>
            </CardHeader>
            <CardContent className="p-3 grid grid-cols-2 md:grid-cols-3 gap-1.5">
              {COUNSELING_SECTIONS.map(s => {
                const Icon = s.icon;
                return (
                  <button key={s.id} onClick={() => setSelectedSection(s.id)}
                    className={`flex items-center gap-1.5 px-2 py-2 rounded text-xs border transition-all text-left ${selectedSection === s.id ? "bg-violet-600 text-white border-violet-600" : "bg-white text-slate-700 border-slate-200 hover:bg-violet-50 hover:border-violet-300"}`}>
                    <Icon className="w-3 h-3 flex-shrink-0" />
                    <span className="leading-tight">{s.label}</span>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {/* Generate Buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button onClick={generateStandalone} disabled={isGenerating || (!gene && !condition)}
              className="bg-violet-600 hover:bg-violet-700 flex-1">
              {isGenerating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</> : <><Heart className="w-4 h-4 mr-2" />Generate Counseling</>}
            </Button>
            {conversation && (
              <Button onClick={generate} disabled={isGenerating || (!gene && !condition)} variant="outline"
                className="border-violet-300 text-violet-700 hover:bg-violet-50">
                <Send className="w-3 h-3 mr-1" />Send to AI Chat
              </Button>
            )}
          </div>

          <p className="text-xs text-slate-400 flex items-center gap-1">
            <Info className="w-3 h-3" />
            "Generate Counseling" produces output here. "Send to AI Chat" adds it to the analyzer conversation for follow-up questions.
          </p>

          {/* Result */}
          {isGenerating && (
            <Card className="bg-white shadow-sm">
              <CardContent className="p-8 flex flex-col items-center justify-center gap-3 text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
                <p className="text-sm font-medium">Generating counseling documentation...</p>
                <p className="text-xs text-slate-400">This may take 20-30 seconds for a full plan</p>
              </CardContent>
            </Card>
          )}

          {result && result !== "sent" && (
            <Card className="bg-white shadow-sm border-violet-200 border-2">
              <CardHeader className="pb-2 border-b bg-violet-50 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-violet-900">
                    {COUNSELING_SECTIONS.find(s => s.id === selectedSection)?.label}
                  </CardTitle>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {gene && <Badge className="bg-violet-100 text-violet-800 text-xs">{gene}</Badge>}
                    <Badge className="bg-slate-100 text-slate-700 text-xs">{inheritance}</Badge>
                    <Badge className={`text-xs ${RESULT_TYPES.find(r => r.id === resultType)?.color}`}>
                      {RESULT_TYPES.find(r => r.id === resultType)?.label}
                    </Badge>
                  </div>
                </div>
                <Button size="sm" variant="ghost" className="h-7 text-xs"
                  onClick={() => { navigator.clipboard.writeText(result); toast.success("Copied to clipboard"); }}>
                  <Copy className="w-3 h-3 mr-1" />Copy
                </Button>
              </CardHeader>
              <CardContent className="p-4">
                <div className="prose prose-sm prose-slate max-w-none text-sm">
                  <ReactMarkdown>{result}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          )}

          {result === "sent" && (
            <Card className="bg-green-50 border-green-200 border-2">
              <CardContent className="p-4 text-center">
                <p className="text-green-800 font-medium text-sm">✓ Counseling request sent to AI Analyzer</p>
                <p className="text-green-700 text-xs mt-1">Switch to the "AI Analyzer" tab to see the full counseling output and ask follow-up questions.</p>
              </CardContent>
            </Card>
          )}

          {!result && !isGenerating && (
            <Card className="bg-slate-50 border-dashed border-2 border-slate-200">
              <CardContent className="p-8 text-center space-y-2">
                <Heart className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-sm font-medium text-slate-500">Select a result type, enter the gene, and click Generate</p>
                <p className="text-xs text-slate-400">The counseling document will appear here — covering emotional support, reproductive counseling, family testing plan, surveillance schedule, and more</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}