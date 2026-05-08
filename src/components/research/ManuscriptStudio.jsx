import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import {
  FileText, Sparkles, Loader2, CheckCircle2, Circle,
  Copy, BookOpen, Search, Download
} from "lucide-react";

const SECTIONS = [
  { id: "title", label: "Title", hint: "Concise, informative, include study design" },
  { id: "abstract", label: "Abstract", hint: "Background, Objectives, Methods, Results, Conclusion (~250 words)" },
  { id: "background", label: "Introduction / Background", hint: "Global burden, local context, research gap, study rationale" },
  { id: "methods", label: "Methods", hint: "Study design, setting, participants, intervention, outcomes, analysis" },
  { id: "results", label: "Results", hint: "Descriptive stats, primary and secondary outcomes, tables/figures" },
  { id: "discussion", label: "Discussion", hint: "Interpretation, comparison with literature, strengths/limitations" },
  { id: "conclusion", label: "Conclusion", hint: "Summary of findings and clinical implications" },
  { id: "references", label: "References", hint: "Vancouver format preferred for clinical journals" },
  { id: "acknowledgements", label: "Acknowledgements", hint: "Funding, departmental support, patient consent" },
];

const JOURNAL_LIST = [
  { name: "Pediatric Nephrology", if: 3.1, scope: "Pediatric kidney diseases" },
  { name: "Nephrology Dialysis Transplantation", if: 5.5, scope: "Adult + pediatric nephrology" },
  { name: "Clinical Journal of the American Society of Nephrology", if: 8.5, scope: "All nephrology" },
  { name: "Indian Pediatrics", if: 1.4, scope: "Indian pediatric research" },
  { name: "Journal of Pediatrics", if: 5.1, scope: "General pediatrics" },
  { name: "PLOS ONE", if: 3.7, scope: "Open access, all topics" },
  { name: "BMC Pediatrics", if: 2.1, scope: "Pediatric research, open access" },
];

export default function ManuscriptStudio({ project }) {
  const [activeSection, setActiveSection] = useState("title");
  const [sections, setSections] = useState(() => {
    const saved = project?.sections || {};
    return Object.fromEntries(SECTIONS.map(s => [s.id, saved[s.id] || ""]));
  });
  const [loading, setLoading] = useState(null);
  const [targetJournal, setTargetJournal] = useState(project?.target_journal || "");
  const [saving, setSaving] = useState(false);

  const buildProjectContext = () => `
Title: ${project?.title}
Study Type: ${project?.study_type}
PICO: P=${project?.pico?.population} | I=${project?.pico?.intervention} | C=${project?.pico?.comparison} | O=${project?.pico?.outcome}
Objectives: ${(project?.objectives || []).join("; ")}
Sample Size: ${project?.sample_size?.calculated ? `n=${project.sample_size.calculated}` : "TBD"}
Statistical Tests: ${(project?.statistical_tests || []).join(", ")}
Eligibility: Inclusion: ${(project?.eligibility?.inclusion || []).filter(Boolean).join(", ")}
Variables: ${(project?.variables || []).map(v => v.name).join(", ")}
Specialty: Pediatric Nephrology | Guidelines: KDIGO, IPNA, ISPD, IAP
`;

  const generateSection = async (sectionId) => {
    setLoading(sectionId);
    const sec = SECTIONS.find(s => s.id === sectionId);
    const currentContent = sections[sectionId];
    try {
      const prompt = `${buildProjectContext()}

Generate the ${sec.label} section for a medical manuscript. Guidelines: ${sec.hint}. 
${currentContent ? `Existing draft to improve: ${currentContent}` : "Write from scratch based on the project context."}
${targetJournal ? `Target journal: ${targetJournal}` : ""}
${sectionId === "methods" ? "Use STROBE/CONSORT format as appropriate. Include IRB statement." : ""}
${sectionId === "discussion" ? "Compare with at least 3 similar studies. Acknowledge limitations." : ""}
${sectionId === "abstract" ? "Structure: Background (2-3 sentences), Objectives (1), Methods (2-3), Results (3-4), Conclusion (1-2). Total ~250 words." : ""}
${sectionId === "references" ? "Generate 10-15 key references for pediatric nephrology on this topic in Vancouver format. Include KDIGO, IPNA, ISPD where relevant." : ""}
Write in formal academic English. Provide only the section content, no headers.`;

      const result = await base44.integrations.Core.InvokeLLM({ prompt });
      setSections(prev => ({ ...prev, [sectionId]: result }));
    } catch {
      toast.error("AI generation failed");
    } finally {
      setLoading(null);
    }
  };

  const improveSection = async (sectionId) => {
    if (!sections[sectionId]) { toast.error("Write something first"); return; }
    setLoading(`improve-${sectionId}`);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `${buildProjectContext()}

Improve this ${sectionId} section of a medical manuscript:
${sections[sectionId]}

Improvements needed:
1. Clarity and conciseness
2. Academic language
3. Logical flow  
4. Alignment with project context
5. Completeness per reporting guidelines
Return only the improved text.`
      });
      setSections(prev => ({ ...prev, [sectionId]: result }));
      toast.success("Section improved!");
    } catch {
      toast.error("Failed");
    } finally {
      setLoading(null);
    }
  };

  const saveManuscript = async () => {
    if (!project?.id) return;
    setSaving(true);
    try {
      await base44.entities.ResearchProject.update(project.id, {
        sections: { ...sections },
        target_journal: targetJournal,
        status: "Writing"
      });
      toast.success("Manuscript saved!");
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const exportManuscript = () => {
    const content = SECTIONS.map(s => `## ${s.label}\n\n${sections[s.id] || "(Not written)"}\n\n`).join("");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project?.title?.replace(/\s+/g, "_") || "manuscript"}.txt`;
    a.click();
  };

  const completedSections = SECTIONS.filter(s => sections[s.id]?.trim().length > 50).length;

  return (
    <div className="flex gap-4 h-full min-h-[600px]">
      {/* Section Navigator */}
      <div className="w-48 shrink-0 space-y-1">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">
          IMRAD Structure
        </div>
        {SECTIONS.map(s => {
          const done = sections[s.id]?.trim().length > 50;
          return (
            <button key={s.id} onClick={() => setActiveSection(s.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs transition-all ${
                activeSection === s.id ? "bg-indigo-600 text-white" : done ? "bg-green-50 text-green-700 hover:bg-green-100" : "text-slate-600 hover:bg-slate-100"
              }`}>
              {done ? <CheckCircle2 className="w-3 h-3 shrink-0" /> : <Circle className="w-3 h-3 shrink-0" />}
              <span className="truncate">{s.label}</span>
            </button>
          );
        })}

        {/* Progress */}
        <div className="pt-2 px-2">
          <div className="text-xs text-slate-400 mb-1">{completedSections}/{SECTIONS.length} sections</div>
          <div className="h-1.5 bg-slate-100 rounded-full">
            <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${(completedSections / SECTIONS.length) * 100}%` }} />
          </div>
        </div>

        {/* Actions */}
        <div className="pt-3 space-y-1">
          <Button size="sm" className="w-full bg-indigo-600 hover:bg-indigo-700 text-xs gap-1" onClick={saveManuscript} disabled={saving}>
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : null}Save All
          </Button>
          <Button size="sm" variant="outline" className="w-full text-xs gap-1" onClick={exportManuscript}>
            <Download className="w-3 h-3" />Export TXT
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 space-y-3">
        {/* Section Header */}
        {(() => {
          const sec = SECTIONS.find(s => s.id === activeSection);
          return (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      {sec?.label}
                    </CardTitle>
                    <p className="text-xs text-slate-500 mt-0.5">{sec?.hint}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="gap-1 text-xs border-indigo-200 text-indigo-700"
                      onClick={() => improveSection(activeSection)}
                      disabled={loading === `improve-${activeSection}`}>
                      {loading === `improve-${activeSection}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      Improve
                    </Button>
                    <Button size="sm" className="gap-1 text-xs bg-indigo-600 hover:bg-indigo-700"
                      onClick={() => generateSection(activeSection)}
                      disabled={loading === activeSection}>
                      {loading === activeSection ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      Generate with AI
                    </Button>
                    {sections[activeSection] && (
                      <Button size="sm" variant="ghost" className="gap-1 text-xs"
                        onClick={() => { navigator.clipboard.writeText(sections[activeSection]); toast.success("Copied!"); }}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={sections[activeSection]}
                  onChange={e => setSections(prev => ({ ...prev, [activeSection]: e.target.value }))}
                  placeholder={`Write or generate the ${sec?.label} here...`}
                  className="min-h-[280px] font-mono text-sm resize-none"
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-slate-400">{sections[activeSection]?.split(/\s+/).filter(Boolean).length || 0} words</span>
                  {sections[activeSection]?.trim() && (
                    <Badge className="bg-green-100 text-green-700 text-xs">Content present</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })()}

        {/* Journal Selector */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />Target Journal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-3">
              <Input value={targetJournal} onChange={e => setTargetJournal(e.target.value)} placeholder="Search or enter journal name..." className="text-sm" />
              <Button size="sm" variant="outline" className="gap-1 text-xs shrink-0" onClick={async () => {
                if (!project?.title) return;
                setLoading("journal");
                try {
                  const result = await base44.integrations.Core.InvokeLLM({
                    prompt: `Recommend 3 journals for a ${project?.study_type || "clinical"} study on pediatric nephrology: "${project?.title}". For each: journal name, impact factor, scope, submission tips. Prefer Indian/Asian journals among them.`
                  });
                  toast.success("AI recommendations ready");
                } catch {}
                setLoading(null);
              }}>
                {loading === "journal" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
                AI Suggest
              </Button>
            </div>
            <div className="grid md:grid-cols-2 gap-2">
              {JOURNAL_LIST.map(j => (
                <button key={j.name} onClick={() => setTargetJournal(j.name)}
                  className={`text-left p-2 rounded-lg border text-xs transition-all ${targetJournal === j.name ? "border-indigo-400 bg-indigo-50" : "border-slate-200 hover:border-indigo-300"}`}>
                  <div className="font-semibold text-slate-800">{j.name}</div>
                  <div className="text-slate-500">IF: {j.if} · {j.scope}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}