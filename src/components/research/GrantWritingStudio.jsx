import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  FileText, Sparkles, Download, PenLine, DollarSign,
  ClipboardList, CheckCircle2, Loader2, AlertCircle, Upload,
  Star, Brain, RefreshCw, Eye
} from "lucide-react";

// ─── Grant Templates ────────────────────────────────────────────────────────
const GRANT_TEMPLATES = {
  ICMR: {
    name: "ICMR — Indian Council of Medical Research",
    color: "bg-blue-50 border-blue-300",
    badge: "bg-blue-100 text-blue-700",
    wordLimits: { aims: 500, background: 1500, methodology: 3000, outcomes: 500, budget_justification: 1000 },
    maxBudget: "₹50 Lakh (standard) / ₹2 Cr (extramural)",
    duration: "2–5 years",
    sections: [
      { id: "title", label: "Project Title", required: true, hint: "Concise, informative, max 150 characters" },
      { id: "aims", label: "Specific Aims & Objectives", required: true, hint: "Primary + secondary objectives, max 500 words" },
      { id: "background", label: "Introduction & Background", required: true, hint: "Include Indian burden of disease data, max 1500 words" },
      { id: "review", label: "Review of Literature", required: true, hint: "Critical review of existing evidence, 800–1200 words" },
      { id: "rationale", label: "Rationale & Justification", required: true, hint: "Why this study? Gap analysis" },
      { id: "methodology", label: "Methodology", required: true, hint: "Study design, sample size with justification, inclusion/exclusion, data collection plan, statistical plan" },
      { id: "innovation", label: "Innovation & Novelty", required: true, hint: "What is new? How does this advance Indian healthcare?" },
      { id: "outcomes", label: "Expected Outcomes & Deliverables", required: true, hint: "Tangible outputs — publications, policy briefs, capacity building" },
      { id: "ethics", label: "Ethical Considerations", required: true, hint: "IEC approval status, patient consent, data safety" },
      { id: "timeline", label: "Timeline (Gantt Chart / Milestones)", required: true, hint: "Year-wise milestones, quarterly for Year 1" },
      { id: "budget", label: "Budget & Justification", required: true, hint: "Head-wise budget as per ICMR financial norms" },
      { id: "references", label: "References (Vancouver format)", required: true, hint: "Max 30–50 references, Vancouver style" },
    ],
    budgetHeads: ["Manpower (RA/JRF/SRF)", "Consumables & Reagents", "Equipment", "Travel & Fieldwork", "Investigations / Diagnostics", "Contingency (≤5%)", "Overhead (≤10%)"],
    formatting: "Double-spaced, Times New Roman 12pt, A4, numbered pages. Attach CV of PI (max 4 pages), IEC letter, collaboration letters."
  },
  ANRF: {
    name: "ANRF — Anusandhan National Research Foundation",
    color: "bg-purple-50 border-purple-300",
    badge: "bg-purple-100 text-purple-700",
    wordLimits: { aims: 600, background: 2000, methodology: 3500, outcomes: 600, budget_justification: 1500 },
    maxBudget: "₹5 Crore (flagship grants)",
    duration: "3–5 years",
    sections: [
      { id: "title", label: "Project Title", required: true },
      { id: "executive_summary", label: "Executive Summary", required: true, hint: "Non-technical summary, 300 words max" },
      { id: "aims", label: "Objectives & Expected Outcomes", required: true },
      { id: "background", label: "Scientific Background", required: true, hint: "State of knowledge, global + Indian context" },
      { id: "methodology", label: "Research Methodology & Approach", required: true },
      { id: "innovation", label: "Innovation, Novelty & Societal Impact", required: true },
      { id: "team", label: "Research Team & Infrastructure", required: true, hint: "PI, Co-I, institutional support, equipment" },
      { id: "timeline", label: "Timeline & Milestones", required: true },
      { id: "budget", label: "Detailed Budget", required: true },
      { id: "references", label: "References", required: true },
    ],
    budgetHeads: ["Human Resources (RA/JRF/SRF/Project Scientist)", "Equipment (minor/major)", "Consumables", "Computational Resources", "Travel & Conferences", "Contingency (≤5%)"],
    formatting: "ANRF online portal submission. Attach ORCID, H-index, research statement."
  },
  DBT: {
    name: "DBT — Department of Biotechnology",
    color: "bg-green-50 border-green-300",
    badge: "bg-green-100 text-green-700",
    wordLimits: { aims: 500, background: 2000, methodology: 3000, outcomes: 800, budget_justification: 1200 },
    maxBudget: "₹3 Crore (TARE/IYBA) / ₹10 Cr (Centre of Excellence)",
    duration: "3 years",
    sections: [
      { id: "title", label: "Project Title", required: true },
      { id: "aims", label: "Objectives", required: true, hint: "Primary objective + 3–5 specific objectives" },
      { id: "background", label: "Introduction & Literature Review", required: true },
      { id: "methodology", label: "Detailed Methodology", required: true, hint: "Work packages, experimental design, statistical methods" },
      { id: "feasibility", label: "Feasibility & Preliminary Data", required: true },
      { id: "innovation", label: "Innovation & Translation Potential", required: true },
      { id: "team", label: "Team Composition & Roles", required: true },
      { id: "timeline", label: "Timeline", required: true },
      { id: "budget", label: "Budget Breakdown", required: true },
      { id: "references", label: "References", required: true },
    ],
    budgetHeads: ["Manpower", "Consumables", "Equipment", "Travel", "Computational charges", "Contingency (≤5%)", "Overhead (as per institution norms)"],
    formatting: "DBT PRISM portal. Biotech relevance must be explicit. Clinical studies require CTRI registration."
  },
  DST: {
    name: "DST — Department of Science & Technology (SERB)",
    color: "bg-amber-50 border-amber-300",
    badge: "bg-amber-100 text-amber-700",
    wordLimits: { aims: 500, background: 1500, methodology: 2500, outcomes: 500 },
    maxBudget: "₹60 Lakh (CRG) / ₹1 Cr (SRG for early career)",
    duration: "3 years",
    sections: [
      { id: "title", label: "Project Title", required: true },
      { id: "aims", label: "Objectives", required: true },
      { id: "background", label: "State of Art & Introduction", required: true },
      { id: "methodology", label: "Methodology", required: true },
      { id: "feasibility", label: "Feasibility", required: true },
      { id: "innovation", label: "Novelty", required: true },
      { id: "outcomes", label: "Expected Deliverables", required: true },
      { id: "timeline", label: "Timeline", required: true },
      { id: "budget", label: "Budget", required: true },
      { id: "references", label: "References", required: true },
    ],
    budgetHeads: ["Manpower", "Consumables", "Equipment (≤30%)", "Travel (≤10%)", "Contingency (≤5%)"],
    formatting: "SERB online portal (serb.gov.in). Mandatory: ORCID, Google Scholar, CTRI if clinical trial."
  },
  AIIMS_INTRAMURAL: {
    name: "AIIMS Intramural Research Grant",
    color: "bg-red-50 border-red-300",
    badge: "bg-red-100 text-red-700",
    wordLimits: { aims: 300, background: 800, methodology: 1500, outcomes: 300 },
    maxBudget: "₹5–15 Lakh",
    duration: "1–2 years",
    sections: [
      { id: "title", label: "Project Title", required: true },
      { id: "aims", label: "Aims & Objectives", required: true, hint: "Focused, achievable within 1–2 years" },
      { id: "background", label: "Background", required: true, hint: "Concise, with AIIMS-specific context" },
      { id: "methodology", label: "Methodology", required: true },
      { id: "outcomes", label: "Expected Outcomes", required: true },
      { id: "ethics", label: "Ethics", required: true, hint: "IEC number mandatory before submission" },
      { id: "timeline", label: "Timeline (6-monthly milestones)", required: true },
      { id: "budget", label: "Budget", required: true },
      { id: "references", label: "References (max 20)", required: true },
    ],
    budgetHeads: ["Investigations/lab costs", "Consumables", "Data entry/statistics", "Contingency (≤5%)"],
    formatting: "AIIMS internal portal. Attach IEC letter, Department Head approval, PI declaration."
  },
  NIH: {
    name: "NIH — National Institutes of Health (USA)",
    color: "bg-indigo-50 border-indigo-300",
    badge: "bg-indigo-100 text-indigo-700",
    wordLimits: { aims: 600, background: 6000, methodology: 6000 },
    maxBudget: "Varies by mechanism (R01: ~$250k/year direct costs)",
    duration: "5 years (R01)",
    sections: [
      { id: "specific_aims", label: "Specific Aims (1 page)", required: true, hint: "Hook sentence, significance, innovation, approach, goal" },
      { id: "background", label: "Background & Significance", required: true },
      { id: "innovation", label: "Innovation", required: true },
      { id: "approach", label: "Approach / Research Strategy", required: true },
      { id: "timeline", label: "Timeline", required: true },
      { id: "budget", label: "Budget & Justification", required: true },
      { id: "references", label: "References", required: true },
    ],
    budgetHeads: ["Personnel (salary + fringe)", "Equipment", "Supplies", "Travel", "Patient care costs", "Other direct costs", "Indirect costs (F&A)"],
    formatting: "NIH FORMS-H, SF424 (R&R). Use NIH-specific page limits. Biosketches required for all key personnel.",
    future: true
  },
  ISN: {
    name: "ISN — International Society of Nephrology",
    color: "bg-teal-50 border-teal-300",
    badge: "bg-teal-100 text-teal-700",
    sections: [
      { id: "aims", label: "Aims", required: true },
      { id: "background", label: "Background", required: true },
      { id: "methodology", label: "Methodology", required: true },
      { id: "outcomes", label: "Expected Outcomes", required: true },
      { id: "budget", label: "Budget", required: true },
    ],
    budgetHeads: ["Investigator support", "Lab/investigation costs", "Travel"],
    future: true
  },
  IPNA: {
    name: "IPNA — International Pediatric Nephrology Association",
    color: "bg-rose-50 border-rose-300",
    badge: "bg-rose-100 text-rose-700",
    sections: [
      { id: "aims", label: "Research Aims", required: true },
      { id: "background", label: "Background", required: true },
      { id: "methodology", label: "Methods", required: true },
      { id: "outcomes", label: "Expected Impact", required: true },
      { id: "budget", label: "Budget", required: true },
    ],
    budgetHeads: ["Personnel", "Investigation costs", "Consumables"],
    future: true
  },
};

// ─── Budget Engine ─────────────────────────────────────────────────────────
function BudgetEngine({ project, grantKey }) {
  const template = GRANT_TEMPLATES[grantKey];
  const [budget, setBudget] = useState({
    year1: {}, year2: {}, year3: {},
    notes: ""
  });
  const [rows, setRows] = useState([
    { head: "Research Associate (RA/JRF)", year1: "", year2: "", year3: "", unit: "Monthly × 12" },
    { head: "Consumables & Lab Reagents", year1: "", year2: "", year3: "", unit: "Lump sum" },
    { head: "Investigations / Diagnostics", year1: "", year2: "", year3: "", unit: "Per patient × N" },
    { head: "Equipment (minor)", year1: "", year2: "", year3: "", unit: "" },
    { head: "Travel & Conference", year1: "", year2: "", year3: "", unit: "" },
    { head: "Dialysis / RRT Costs", year1: "", year2: "", year3: "", unit: "Per session" },
    { head: "Genomic / Sequencing", year1: "", year2: "", year3: "", unit: "Per sample" },
    { head: "Imaging (MRI/CT/USG)", year1: "", year2: "", year3: "", unit: "Per study" },
    { head: "Statistical Software / Licenses", year1: "", year2: "", year3: "", unit: "" },
    { head: "Data Entry / Management", year1: "", year2: "", year3: "", unit: "" },
    { head: "Contingency (≤5%)", year1: "", year2: "", year3: "", unit: "% of total" },
  ]);

  const totalByYear = (year) => rows.reduce((sum, r) => sum + (parseFloat(r[year]) || 0), 0);
  const grandTotal = () => ["year1", "year2", "year3"].reduce((s, y) => s + totalByYear(y), 0);

  const updateRow = (idx, field, val) => {
    setRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: val } : r));
  };

  const addRow = () => setRows(prev => [...prev, { head: "", year1: "", year2: "", year3: "", unit: "" }]);
  const removeRow = (idx) => setRows(prev => prev.filter((_, i) => i !== idx));

  const [exporting, setExporting] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600" />Smart Budget Engine
        </h3>
        {template?.maxBudget && (
          <Badge className="bg-green-100 text-green-700">Max: {template.maxBudget}</Badge>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-xs">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-3 font-semibold text-slate-700 w-48">Budget Head</th>
              <th className="text-right p-3 font-semibold text-slate-700">Year 1 (₹)</th>
              <th className="text-right p-3 font-semibold text-slate-700">Year 2 (₹)</th>
              <th className="text-right p-3 font-semibold text-slate-700">Year 3 (₹)</th>
              <th className="text-right p-3 font-semibold text-slate-700">Total (₹)</th>
              <th className="p-3 w-8"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              const rowTotal = (parseFloat(row.year1) || 0) + (parseFloat(row.year2) || 0) + (parseFloat(row.year3) || 0);
              return (
                <tr key={idx} className="border-t hover:bg-slate-50 transition-colors">
                  <td className="p-2">
                    <input value={row.head} onChange={e => updateRow(idx, "head", e.target.value)}
                      className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-400 focus:outline-none px-1 text-slate-800 font-medium" />
                    {row.unit && <div className="text-slate-400 text-xs px-1">{row.unit}</div>}
                  </td>
                  {["year1", "year2", "year3"].map(y => (
                    <td key={y} className="p-2 text-right">
                      <input type="number" value={row[y]} onChange={e => updateRow(idx, y, e.target.value)}
                        placeholder="0"
                        className="w-28 text-right bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-400 focus:outline-none px-1 text-slate-700" />
                    </td>
                  ))}
                  <td className="p-2 text-right font-semibold text-indigo-700">
                    {rowTotal > 0 ? `₹${rowTotal.toLocaleString("en-IN")}` : "—"}
                  </td>
                  <td className="p-2">
                    <button onClick={() => removeRow(idx)} className="text-red-300 hover:text-red-500">×</button>
                  </td>
                </tr>
              );
            })}
            <tr className="border-t-2 border-slate-300 bg-indigo-50 font-bold">
              <td className="p-3 text-slate-800">TOTAL</td>
              {["year1", "year2", "year3"].map(y => (
                <td key={y} className="p-3 text-right text-indigo-800">
                  ₹{totalByYear(y).toLocaleString("en-IN")}
                </td>
              ))}
              <td className="p-3 text-right text-indigo-900 text-sm">
                ₹{grandTotal().toLocaleString("en-IN")}
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={addRow} className="text-xs">+ Add Row</Button>
        <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => {
          const text = `BUDGET SUMMARY\n\n` + rows.map(r =>
            `${r.head}: Y1=₹${r.year1 || 0} | Y2=₹${r.year2 || 0} | Y3=₹${r.year3 || 0}`
          ).join("\n") + `\n\nGRAND TOTAL: ₹${grandTotal().toLocaleString("en-IN")}`;
          navigator.clipboard.writeText(text);
          toast.success("Budget copied to clipboard");
        }}>
          <Download className="w-3 h-3" />Copy Budget
        </Button>
      </div>
    </div>
  );
}

// ─── Grant Reviewer AI ─────────────────────────────────────────────────────
function GrantReviewerAI({ project, sections, grantKey }) {
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(false);

  const runReview = async () => {
    if (!project) { toast.error("Select a project first"); return; }
    setLoading(true);
    try {
      const content = Object.entries(sections).map(([k, v]) => `${k.toUpperCase()}:\n${v}`).join("\n\n");
      const result = await base44.integrations.Core.InvokeLLM({
        model: "claude_sonnet_4_6",
        prompt: `You are a senior academic grant reviewer for ${GRANT_TEMPLATES[grantKey]?.name || grantKey}.
Project: "${project.title}"
Study type: ${project.study_type || "Not specified"}

Grant sections submitted:
${content.substring(0, 4000)}

Provide a structured reviewer assessment:

1. OVERALL SCORE (out of 10, with decimal)
2. FUNDING LIKELIHOOD (High/Moderate/Low with brief reason)
3. STRENGTHS (3–5 bullet points)
4. WEAKNESSES (3–5 bullet points)
5. MAJOR CONCERNS (methodology, sample size, feasibility, ethics)
6. MINOR COMMENTS (writing, formatting, clarity)
7. SPECIFIC IMPROVEMENT SUGGESTIONS (actionable, section-by-section)
8. MISSING ELEMENTS (required sections not adequately addressed)

Use academic, constructive language. Be rigorous but fair.`,
        response_json_schema: {
          type: "object",
          properties: {
            overall_score: { type: "number" },
            funding_likelihood: { type: "string" },
            funding_reason: { type: "string" },
            strengths: { type: "array", items: { type: "string" } },
            weaknesses: { type: "array", items: { type: "string" } },
            major_concerns: { type: "array", items: { type: "string" } },
            minor_comments: { type: "array", items: { type: "string" } },
            improvements: { type: "array", items: { type: "string" } },
            missing_elements: { type: "array", items: { type: "string" } },
          }
        }
      });
      setReview(result);
    } catch (e) { toast.error("Review failed: " + e.message); }
    finally { setLoading(false); }
  };

  const LIKELIHOOD_COLORS = { High: "text-green-700 bg-green-50", Moderate: "text-amber-700 bg-amber-50", Low: "text-red-700 bg-red-50" };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />AI Grant Reviewer Simulation
        </h3>
        <Button onClick={runReview} disabled={loading} size="sm" className="bg-purple-600 hover:bg-purple-700 gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? "Reviewing..." : "Run AI Review"}
        </Button>
      </div>

      {!review && !loading && (
        <div className="text-center py-8 text-slate-400">
          <Brain className="w-12 h-12 mx-auto mb-3 text-purple-200" />
          <p className="text-sm">Fill in grant sections, then run AI reviewer simulation to get expert feedback before submission.</p>
        </div>
      )}

      {review && (
        <div className="space-y-4">
          {/* Score card */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-2 border-indigo-200 text-center p-4">
              <div className="text-4xl font-bold text-indigo-700">{review.overall_score}<span className="text-xl text-slate-400">/10</span></div>
              <p className="text-xs text-slate-500 mt-1">Overall Score</p>
            </Card>
            <Card className={`border-2 text-center p-4 ${LIKELIHOOD_COLORS[review.funding_likelihood]?.split(" ")[1] || "border-slate-200"}`}>
              <div className={`text-lg font-bold ${LIKELIHOOD_COLORS[review.funding_likelihood]?.split(" ")[0] || "text-slate-700"}`}>{review.funding_likelihood}</div>
              <p className="text-xs text-slate-600 mt-1">Funding Likelihood</p>
              <p className="text-xs text-slate-500 mt-1">{review.funding_reason}</p>
            </Card>
          </div>

          {/* Sections */}
          {[
            { key: "strengths", label: "Strengths", color: "text-green-700", bg: "bg-green-50", icon: "✅" },
            { key: "weaknesses", label: "Weaknesses", color: "text-red-700", bg: "bg-red-50", icon: "⚠️" },
            { key: "major_concerns", label: "Major Concerns", color: "text-orange-700", bg: "bg-orange-50", icon: "🔴" },
            { key: "improvements", label: "Improvement Suggestions", color: "text-blue-700", bg: "bg-blue-50", icon: "💡" },
            { key: "missing_elements", label: "Missing Elements", color: "text-slate-700", bg: "bg-slate-50", icon: "📋" },
          ].map(({ key, label, color, bg, icon }) => review[key]?.length > 0 && (
            <div key={key} className={`${bg} rounded-xl p-4`}>
              <h4 className={`font-semibold text-sm ${color} mb-2`}>{icon} {label}</h4>
              <ul className="space-y-1">
                {review[key].map((item, i) => (
                  <li key={i} className="text-xs text-slate-700 flex gap-2">
                    <span className="shrink-0">•</span><span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="text-xs text-slate-400 italic border-t pt-2">
            AI reviewer simulation — for guidance only. Human expert review recommended before submission.
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Grant Writing Studio ─────────────────────────────────────────────
export default function GrantWritingStudio({ project }) {
  const [selectedGrant, setSelectedGrant] = useState(null);
  const [sections, setSections] = useState({});
  const [generating, setGenerating] = useState(null);
  const [activeTab, setActiveTab] = useState("editor");
  const [uploadedTemplate, setUploadedTemplate] = useState(null);

  const template = selectedGrant ? GRANT_TEMPLATES[selectedGrant] : null;

  const generateSection = async (sectionId, sectionLabel) => {
    if (!project) { toast.error("Select a project first"); return; }
    setGenerating(sectionId);
    try {
      const pico = project.pico || {};
      const result = await base44.integrations.Core.InvokeLLM({
        model: "claude_sonnet_4_6",
        prompt: `You are an expert academic grant writer specializing in pediatric nephrology research for Indian academic funding agencies.

Grant Agency: ${template?.name}
Project Title: ${project.title}
Study Type: ${project.study_type || "Clinical Research"}
Population: ${pico.population || "Pediatric patients"}
Intervention/Exposure: ${pico.intervention || ""}
Comparison: ${pico.comparison || ""}
Primary Outcome: ${pico.outcome || ""}
Institution: ${project.institution || "Indian tertiary care center"}
Statistical Plan: ${project.statistical_plan || ""}
Sample Size: ${project.sample_size?.calculated || ""} patients (${project.sample_size?.justification || ""})

Write the "${sectionLabel}" section for this grant proposal.

Requirements:
- Academic, publication-grade English
- Humanized, not AI-sounding
- Use Indian epidemiological context where relevant
- Reference KDIGO, IPNA, IAP guidelines as appropriate
- Follow ${template?.name} formatting norms
- Word limit: ~${template?.wordLimits?.[sectionId] || 800} words
- Include specific, measurable, achievable objectives
- Align with pediatric nephrology clinical practice in India

Write only the section content, no meta-commentary.`,
      });
      setSections(prev => ({ ...prev, [sectionId]: result }));
      toast.success(`${sectionLabel} generated`);
    } catch (e) { toast.error("Generation failed: " + e.message); }
    finally { setGenerating(null); }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    toast.info("Parsing template structure...");
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const parsed = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this grant template document and extract its structure.
Return a list of section headings, required content for each, word limits if specified, and formatting requirements.`,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            agency_name: { type: "string" },
            sections: { type: "array", items: { type: "object", properties: { id: { type: "string" }, label: { type: "string" }, hint: { type: "string" } } } },
            formatting_notes: { type: "string" },
          }
        }
      });
      setUploadedTemplate(parsed);
      toast.success("Template parsed! Review the structure below.");
    } catch { toast.error("Failed to parse template"); }
  };

  const ACTIVE_GRANTS = Object.entries(GRANT_TEMPLATES).filter(([, t]) => !t.future);
  const FUTURE_GRANTS = Object.entries(GRANT_TEMPLATES).filter(([, t]) => t.future);

  return (
    <div className="space-y-4">
      {/* Grant Selection */}
      {!selectedGrant ? (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" />Indian Funding Agencies
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {ACTIVE_GRANTS.map(([key, t]) => (
                <button key={key} onClick={() => setSelectedGrant(key)}
                  className={`text-left p-4 rounded-xl border-2 ${t.color} hover:shadow-lg transition-all`}>
                  <Badge className={`${t.badge} mb-2 text-xs`}>{t.sections?.length} sections</Badge>
                  <h4 className="font-semibold text-sm text-slate-900">{t.name}</h4>
                  {t.maxBudget && <p className="text-xs text-slate-500 mt-1">Max: {t.maxBudget}</p>}
                  {t.duration && <p className="text-xs text-slate-400">{t.duration}</p>}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-slate-500 mb-3 flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4" />International (Coming Soon)
            </h3>
            <div className="grid md:grid-cols-3 gap-3">
              {FUTURE_GRANTS.map(([key, t]) => (
                <div key={key} className={`p-4 rounded-xl border-2 ${t.color} opacity-60 relative`}>
                  <div className="absolute top-2 right-2"><Badge variant="outline" className="text-xs">Soon</Badge></div>
                  <h4 className="font-semibold text-sm text-slate-700">{t.name}</h4>
                </div>
              ))}
            </div>
          </div>

          {/* Import Template */}
          <Card className="border-2 border-dashed border-slate-300">
            <CardContent className="p-6 text-center">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <h4 className="font-semibold text-slate-700 mb-1">Import Custom Template</h4>
              <p className="text-xs text-slate-500 mb-3">Upload institutional grant PDF or DOCX — AI will parse the structure</p>
              <label className="cursor-pointer">
                <input type="file" accept=".pdf,.docx,.doc,.txt" className="hidden" onChange={handleFileUpload} />
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg text-sm hover:bg-slate-800 transition-colors">
                  <Upload className="w-4 h-4" />Upload Template
                </span>
              </label>
              {uploadedTemplate && (
                <div className="mt-4 text-left p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-xs font-semibold text-green-700 mb-2">✅ Parsed: {uploadedTemplate.agency_name}</p>
                  {uploadedTemplate.sections?.map(s => (
                    <p key={s.id} className="text-xs text-slate-600">• {s.label}</p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setSelectedGrant(null)} className="text-slate-400 hover:text-slate-700 text-sm underline">← Change Grant</button>
              <Badge className={template?.badge}>{template?.name}</Badge>
              {template?.duration && <span className="text-xs text-slate-500">{template.duration}</span>}
            </div>
            {template?.formatting && (
              <button className="text-xs text-indigo-600 hover:underline flex items-center gap-1" onClick={() => toast.info(template.formatting)}>
                <Eye className="w-3.5 h-3.5" />Formatting Guide
              </button>
            )}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="flex w-full h-auto overflow-x-auto p-1">
              <TabsTrigger value="editor" className="gap-1.5 text-xs">
                <PenLine className="w-3.5 h-3.5" />Section Editor
              </TabsTrigger>
              <TabsTrigger value="budget" className="gap-1.5 text-xs">
                <DollarSign className="w-3.5 h-3.5" />Budget Engine
              </TabsTrigger>
              <TabsTrigger value="review" className="gap-1.5 text-xs">
                <Brain className="w-3.5 h-3.5" />AI Reviewer
              </TabsTrigger>
            </TabsList>

            {/* Section Editor */}
            <TabsContent value="editor" className="space-y-3 mt-3">
              {template?.sections?.map(sec => (
                <div key={sec.id} className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b">
                    <div className="flex items-center gap-2">
                      {sections[sec.id]?.length > 10
                        ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                        : <div className="w-4 h-4 rounded-full border-2 border-slate-300" />}
                      <span className="font-semibold text-sm text-slate-800">{sec.label}</span>
                      {sec.required && <Badge variant="outline" className="text-xs">Required</Badge>}
                      {template.wordLimits?.[sec.id] && (
                        <span className="text-xs text-slate-400">~{template.wordLimits[sec.id]} words</span>
                      )}
                    </div>
                    <Button size="sm" variant="outline"
                      disabled={generating === sec.id || !project}
                      onClick={() => generateSection(sec.id, sec.label)}
                      className="text-xs gap-1 h-7">
                      {generating === sec.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-indigo-500" />}
                      {generating === sec.id ? "Generating..." : "AI Generate"}
                    </Button>
                  </div>
                  {sec.hint && <p className="text-xs text-amber-700 px-4 py-1.5 bg-amber-50 border-b">{sec.hint}</p>}
                  <textarea
                    value={sections[sec.id] || ""}
                    onChange={e => setSections(prev => ({ ...prev, [sec.id]: e.target.value }))}
                    placeholder={`Write the ${sec.label} here, or use AI Generate...`}
                    rows={5}
                    className="w-full p-4 text-sm text-slate-800 focus:outline-none resize-y font-mono leading-relaxed"
                  />
                  {sections[sec.id] && (
                    <div className="px-4 py-1.5 bg-slate-50 border-t text-xs text-slate-400">
                      ~{sections[sec.id].split(/\s+/).filter(Boolean).length} words
                    </div>
                  )}
                </div>
              ))}

              {/* Export */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="gap-2 text-xs" onClick={() => {
                  const text = template?.sections?.map(s =>
                    `${s.label.toUpperCase()}\n${"─".repeat(40)}\n${sections[s.id] || "[To be completed]"}`
                  ).join("\n\n");
                  navigator.clipboard.writeText(text || "");
                  toast.success("Full grant text copied to clipboard");
                }}>
                  <Download className="w-4 h-4" />Copy Full Grant Text
                </Button>
                <div className="text-xs text-slate-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Human review mandatory before submission. All AI content is editable.
                </div>
              </div>
            </TabsContent>

            <TabsContent value="budget">
              <BudgetEngine project={project} grantKey={selectedGrant} />
            </TabsContent>

            <TabsContent value="review">
              <GrantReviewerAI project={project} sections={sections} grantKey={selectedGrant} />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}