import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import {
  Sparkles, ChevronLeft, Loader2, BookOpen, FileText,
  CheckCircle2, Circle, Save, Lock
} from "lucide-react";

const SECTIONS = [
  { key: "abstract", label: "Abstract", description: "Structured summary (Background, Aim, Methods, Results, Conclusion)", premium: false },
  { key: "background", label: "Background / Introduction", description: "Literature context, knowledge gap, and rationale", premium: false },
  { key: "methods", label: "Methods", description: "Auto-filled from your study builder data", premium: false },
  { key: "results", label: "Results", description: "Narrative results from your analysis", premium: true },
  { key: "discussion", label: "Discussion", description: "AI-assisted with literature comparison", premium: true },
  { key: "conclusion", label: "Conclusion", description: "Summary and implications", premium: false },
  { key: "references", label: "References", description: "Key citations (AI-suggested)", premium: false },
  { key: "acknowledgements", label: "Acknowledgements", description: "Funding, support", premium: false },
];

const JOURNALS = [
  { name: "Pediatric Nephrology", scope: "Pediatric kidney diseases, RCTs, cohort studies", if: "4.8" },
  { name: "Clinical Journal of the American Society of Nephrology (CJASN)", scope: "Clinical nephrology, all designs", if: "9.5" },
  { name: "Kidney International", scope: "Broad nephrology, high impact", if: "14.8" },
  { name: "Indian Pediatrics", scope: "Indian pediatric research, accessible for regional studies", if: "1.8" },
  { name: "Journal of Pediatrics", scope: "General pediatrics, well-designed trials", if: "6.7" },
  { name: "Frontiers in Pediatrics", scope: "Open access, case series, cohort, diverse designs", if: "2.1" },
  { name: "BMC Pediatrics", scope: "Open access, all designs, protocol papers", if: "2.1" },
  { name: "World Journal of Pediatrics", scope: "Asian pediatric research, multicenter", if: "5.5" },
  { name: "Indian Journal of Nephrology", scope: "Indian nephrology, regional studies acceptable", if: "0.8" },
];

export default function ManuscriptWriter({ project, analysisResults, onBack }) {
  const [sections, setSections] = useState({});
  const [activeSection, setActiveSection] = useState("background");
  const [loading, setLoading] = useState(false);
  const [loadingSection, setLoadingSection] = useState(null);
  const [manuscriptId, setManuscriptId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("write");
  const [journalSearch, setJournalSearch] = useState("");
  const [reviewerFeedback, setReviewerFeedback] = useState("");
  const [reviewerLoading, setReviewerLoading] = useState(false);

  useEffect(() => {
    loadManuscript();
  }, [project.id]);

  const loadManuscript = async () => {
    try {
      const existing = await base44.entities.Manuscript.filter({ project_id: project.id });
      if (existing.length > 0) {
        setManuscriptId(existing[0].id);
        setSections(existing[0].sections || {});
      }
    } catch {}
  };

  const saveManuscript = async () => {
    setSaving(true);
    try {
      const data = { project_id: project.id, owner_email: project.owner_email, title: project.title, sections };
      if (manuscriptId) {
        await base44.entities.Manuscript.update(manuscriptId, data);
      } else {
        const created = await base44.entities.Manuscript.create(data);
        setManuscriptId(created.id);
      }
      toast.success("Saved!");
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const buildSectionPrompt = (sectionKey) => {
    const p = project;
    const pico = p.pico || {};
    const base = `Study: "${p.title}" | Design: ${p.study_type} | PICO: P=${pico.population} I=${pico.intervention} C=${pico.comparison} O=${pico.outcome}`;
    const prompts = {
      abstract: `Write a structured abstract for this clinical research paper. ${base}. Objectives: ${(p.objectives || []).join("; ")}. Sample size: ${p.sample_size?.calculated || 'TBD'}. Stats: ${(p.statistical_tests || []).join(", ")}. Format: Background, Aim, Methods, Results (placeholder), Conclusions, Keywords. Keep each section concise (2-3 sentences). Use passive voice.`,
      background: `Write an Introduction/Background section for a pediatric nephrology research paper. ${base}. Include: 1) Epidemiology and burden of the condition, 2) Current standard of care and its limitations, 3) Evidence gap that this study addresses, 4) Rationale for the chosen study design, 5) Statement of aim. 4-5 paragraphs, formal academic language, cite landmark studies (KDIGO/IPNA/ISKDC guidelines by name).`,
      methods: `Write a complete Methods section. ${base}. Study period: [specify]. Setting: ${p.institution || 'tertiary care center'}. Eligibility: Inclusion: ${(p.eligibility?.inclusion || []).join("; ")} | Exclusion: ${(p.eligibility?.exclusion || []).join("; ")}. Sample size: n=${p.sample_size?.calculated || 'TBD'} (${p.sample_size?.justification || ''}). Variables: ${(p.variables || []).map(v => `${v.name} (${v.type})`).join(", ")}. Statistics: ${(p.statistical_tests || []).join(", ")}. Ethics: ${p.ethics_status}, IEC ${p.iec_number || 'pending'}. Include: Study design, setting, participants, interventions/exposures, outcomes measured, data collection tools, statistical analysis subsection.`,
      results: `Write a Results section for a ${p.study_type} study on "${pico.outcome}". Describe: 1) Enrollment/flowchart (CONSORT or STROBE), 2) Baseline characteristics (refer to Table 1), 3) Primary outcome results (use placeholders like [X±Y] or [n/%]), 4) Secondary outcomes, 5) Subgroup analyses if applicable. Use past tense. Refer to tables and figures appropriately.`,
      discussion: `Write a Discussion section for this ${p.study_type} study. ${base}. Include: 1) Summary of key findings (3-4 sentences), 2) Comparison with existing literature (cite recent studies on the topic), 3) Explanation of mechanisms/biological plausibility, 4) Strengths of the study, 5) Limitations, 6) Clinical implications and practice recommendations, 7) Future research directions. 5-6 paragraphs. Formal academic tone.`,
      conclusion: `Write a brief Conclusion section (2-3 paragraphs). ${base}. Summarize: main finding, clinical significance, practical implication for clinicians, and call for future research.`,
      references: `List 10-15 key references relevant to "${pico.structured_question || pico.outcome}" in a ${p.study_type} study context. Include: KDIGO/IPNA guidelines (with years), landmark RCTs or meta-analyses on the topic, recent cohort studies (last 5 years), and statistical methodology references. Format: Vancouver style (numbered).`,
      acknowledgements: `Write a brief acknowledgements section for a clinical research paper from ${p.institution || 'a tertiary hospital'}. Include: patient/participant acknowledgement, institutional support, funding sources (if any, otherwise note 'no external funding'), and ethical clearance statement.`,
    };
    return prompts[sectionKey] || `Generate the ${sectionKey} section for this research paper. ${base}.`;
  };

  const generateSection = async (sectionKey) => {
    const sectionConfig = SECTIONS.find(s => s.key === sectionKey);
    if (sectionConfig?.premium && sectionKey !== "background" && sectionKey !== "methods") {
      // Allow background and methods freely; gate results and discussion
      if (sectionKey === "results" || sectionKey === "discussion") {
        toast("⭐ Upgrade to Pro for full AI generation of Results & Discussion.", { duration: 3000 });
        return;
      }
    }
    setLoadingSection(sectionKey);
    try {
      const result = await base44.integrations.Core.InvokeLLM({ prompt: buildSectionPrompt(sectionKey), model: "claude_sonnet_4_6" });
      setSections(prev => ({ ...prev, [sectionKey]: result }));
      toast.success(`${sectionKey} generated!`);
    } catch {
      toast.error("Generation failed");
    } finally {
      setLoadingSection(null);
    }
  };

  const reviewManuscript = async () => {
    setReviewerLoading(true);
    try {
      const fullText = Object.entries(sections).map(([k, v]) => `=== ${k.toUpperCase()} ===\n${v}`).join("\n\n");
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Act as a peer reviewer for a medical journal. Review this manuscript for a ${project.study_type} study titled "${project.title}".

${fullText.slice(0, 3000)}

Provide structured feedback on: 1) Scientific rigor and methodology, 2) Clarity and writing quality, 3) Statistical reporting, 4) Missing elements (per CONSORT/STROBE checklist), 5) Specific suggestions for improvement, 6) Overall verdict (Accept/Minor Revision/Major Revision/Reject with reasons).`,
        model: "claude_sonnet_4_6"
      });
      setReviewerFeedback(result);
    } catch {
      toast.error("Review failed");
    } finally {
      setReviewerLoading(false);
    }
  };

  const wordCount = Object.values(sections).join(" ").split(/\s+/).filter(Boolean).length;
  const completedSections = SECTIONS.filter(s => sections[s.key]?.trim()).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1"><ChevronLeft className="w-4 h-4" />Back</Button>
        <div className="flex-1">
          <h2 className="font-bold text-slate-900">{project.title}</h2>
          <p className="text-xs text-slate-500">{completedSections}/{SECTIONS.length} sections • {wordCount.toLocaleString()} words</p>
        </div>
        <Button size="sm" onClick={saveManuscript} disabled={saving} variant="outline" className="gap-1">
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}Save
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
        {["write", "journals", "reviewer", "checklist"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors capitalize ${activeTab === tab ? "bg-white shadow text-indigo-700" : "text-slate-500 hover:text-slate-700"}`}>
            {tab === "write" ? "Write" : tab === "journals" ? "Journals" : tab === "reviewer" ? "AI Reviewer" : "Checklist"}
          </button>
        ))}
      </div>

      {activeTab === "write" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Section nav */}
          <div className="lg:col-span-1">
            <div className="space-y-1">
              {SECTIONS.map(s => (
                <button key={s.key} onClick={() => setActiveSection(s.key)}
                  className={`w-full text-left p-2 rounded-lg text-sm transition-colors flex items-center justify-between gap-2 ${activeSection === s.key ? "bg-indigo-50 text-indigo-700 font-medium" : "hover:bg-slate-50 text-slate-700"}`}>
                  <span className="flex items-center gap-2">
                    {sections[s.key] ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" /> : <Circle className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
                    <span className="truncate">{s.label}</span>
                  </span>
                  {s.premium && <Lock className="w-3 h-3 text-amber-500 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Editor */}
          <div className="lg:col-span-3 space-y-3">
            {(() => {
              const s = SECTIONS.find(sec => sec.key === activeSection);
              return (
                <>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-slate-900">{s?.label}</h3>
                      <p className="text-xs text-slate-500">{s?.description}</p>
                    </div>
                    <Button size="sm" onClick={() => generateSection(activeSection)}
                      disabled={loadingSection === activeSection}
                      className={`gap-1 shrink-0 ${s?.premium && (activeSection === "results" || activeSection === "discussion") ? "bg-amber-500 hover:bg-amber-600" : "bg-indigo-600 hover:bg-indigo-700"}`}>
                      {loadingSection === activeSection ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      {s?.premium && (activeSection === "results" || activeSection === "discussion") ? "Pro: Generate" : "AI Generate"}
                    </Button>
                  </div>
                  <Textarea
                    value={sections[activeSection] || ""}
                    onChange={e => setSections(prev => ({ ...prev, [activeSection]: e.target.value }))}
                    placeholder={`Write or generate the ${s?.label} section...`}
                    rows={18}
                    className="font-mono text-sm resize-none"
                  />
                  <p className="text-xs text-slate-400 text-right">{(sections[activeSection] || "").split(/\s+/).filter(Boolean).length} words</p>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {activeTab === "journals" && (
        <div className="space-y-3">
          <div>
            <Input value={journalSearch} onChange={e => setJournalSearch(e.target.value)} placeholder="Search journals..." />
          </div>
          <div className="space-y-2">
            {JOURNALS.filter(j => j.name.toLowerCase().includes(journalSearch.toLowerCase()) || j.scope.toLowerCase().includes(journalSearch.toLowerCase())).map(j => (
              <Card key={j.name} className="p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-sm text-slate-900">{j.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{j.scope}</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 shrink-0">IF: {j.if}</Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === "reviewer" && (
        <div className="space-y-3">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-800">AI Reviewer uses Claude Sonnet for high-quality feedback. Uses integration credits.</p>
          </div>
          <Button onClick={reviewManuscript} disabled={reviewerLoading} className="bg-indigo-600 hover:bg-indigo-700 gap-1 w-full">
            {reviewerLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {reviewerLoading ? "Reviewing..." : "Run AI Peer Review"}
          </Button>
          {reviewerFeedback && (
            <div className="p-4 bg-white border border-indigo-200 rounded-xl text-sm whitespace-pre-wrap text-slate-800">
              <p className="font-semibold text-indigo-700 mb-2">Peer Review Feedback</p>
              {reviewerFeedback}
            </div>
          )}
        </div>
      )}

      {activeTab === "checklist" && (
        <div className="space-y-4">
          {[
            { title: "CONSORT Checklist (RCT)", items: ["Title: RCT identified", "Abstract: Structured", "Background: Rationale + objectives", "Methods: Participants, interventions, outcomes", "Sample size calculation", "Randomisation: sequence generation", "Blinding stated", "Statistical methods described", "Results: Participant flow (CONSORT diagram)", "Baseline characteristics (Table 1)", "Numbers analyzed per group", "Primary outcome with CI and p-value", "Adverse events reported", "Discussion: Limitations, generalisability", "Registration number stated", "Funding declared"] },
            { title: "STROBE Checklist (Observational)", items: ["Study design in title/abstract", "Objectives + hypothesis", "Setting, participants, period", "Study design specifics", "Outcome definitions", "Exposure definitions", "Confounders stated", "Missing data addressed", "Flowchart / participants enrolled", "Descriptive data (Table 1)", "Outcome data reported", "Relative risk / OR with CI", "Absolute risk if relevant", "Generalisability addressed", "Limitations with bias discussion", "Funding sources"] },
          ].map(checklist => (
            <Card key={checklist.title}>
              <CardHeader className="pb-2"><CardTitle className="text-sm">{checklist.title}</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-1.5">
                  {checklist.items.map((item, i) => (
                    <label key={i} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-slate-50 p-1 rounded">
                      <input type="checkbox" className="w-3.5 h-3.5 accent-indigo-600" />
                      <span className="text-slate-700">{item}</span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}