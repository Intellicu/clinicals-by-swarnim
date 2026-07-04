import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/client";
import { Sparkles, X, Send, Loader2, ChevronDown, ChevronUp, Brain, RefreshCw } from "lucide-react";
import { classifyStudyType, STUDY_TYPES, NEPHRO_CONTEXT, suggestNextSteps } from "@/lib/AdaptiveMethodologyEngine";

// Context-aware quick prompts based on study type and section
function getQuickPrompts(studyTypeId, section) {
  const type = STUDY_TYPES[studyTypeId];
  const framework = type?.framework || "PICO";
  const reporting = type?.reporting || "STROBE";

  const universal = [
    { label: "Improve writing", prompt: "Review my current project content and improve the academic writing quality — make it publication-grade, avoid repetition, use clinical research language." },
    { label: "Find gaps", prompt: "Analyze my project and identify the most critical missing or weak sections. Prioritize by importance for ethics approval and publication." },
    { label: "Suggest references", prompt: "Suggest 5-8 key references (journals: JASN, AJKD, Pediatric Nephrology, NDT, KI) relevant to my research topic. Include KDIGO/IPNA guidelines where applicable." },
    { label: "Identify biases", prompt: `For a ${type?.label || "clinical"} study, what are the most important biases I need to address? Suggest concrete mitigation strategies for each.` },
  ];

  const sectionSpecific = {
    "Research Question": [
      { label: `Generate ${framework} question`, prompt: `Generate a structured ${framework} research question for my study. Make it specific, measurable, and feasible for a tertiary pediatric nephrology unit in India.` },
      { label: "Refine objectives", prompt: "Write 1 primary and 2 secondary objectives in SMART format for my study. Use strong action verbs (determine, compare, evaluate, identify)." },
    ],
    "Study Builder": [
      { label: "Justify design", prompt: "Write a 2-3 sentence justification for why my chosen study design is the most appropriate for my research question." },
      { label: "Sample size text", prompt: "Write a Methods paragraph explaining my sample size calculation including formula used, parameters, and dropout adjustment." },
    ],
    "Eligibility & Matching": [
      { label: "Suggest criteria", prompt: "Suggest evidence-based inclusion and exclusion criteria for my study, considering the pediatric nephrology setting, age limits, comorbidities, and consent requirements." },
    ],
    "Analytics": [
      { label: "Statistical plan", prompt: `Write a formal statistical analysis plan for a ${type?.label || "clinical"} study. Include descriptive statistics, primary analysis approach, software, and significance level.` },
      { label: "Interpret results", prompt: "Help me interpret typical findings in a pediatric nephrology study and how to present them in a results section." },
    ],
    "Manuscript Studio": [
      { label: "Write abstract", prompt: "Generate a structured abstract (Background, Methods, Results format) for my study. Use placeholder values where data not yet available." },
      { label: `Apply ${reporting}`, prompt: `Review my manuscript against ${reporting} guidelines and list the items I need to add or improve.` },
      { label: "Improve discussion", prompt: "Help me write a Discussion section that: (1) summarizes key findings, (2) compares with published literature, (3) addresses limitations, (4) discusses clinical implications for pediatric nephrology practice." },
    ],
  };

  const contextual = sectionSpecific[section] || [];
  return [...contextual, ...universal].slice(0, 6);
}

export default function ResearchAIAssistant({ project, currentSection }) {
  const detectedType = project?.title ? classifyStudyType(project.title) : null;
  const studyTypeId = project?.study_type || detectedType?.detected?.id;
  const typeData = STUDY_TYPES[studyTypeId];

  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [nextSteps, setNextSteps] = useState(null);
  const messagesEndRef = useRef(null);

  // Build welcome message from context
  useEffect(() => {
    if (project && messages.length === 0) {
      const detected = detectedType?.detected;
      const steps = suggestNextSteps(project, detected);
      setNextSteps(steps);

      let welcome = `I'm your **Research Mentor** for:\n📄 *${project.title}*\n\n`;
      if (typeData) {
        welcome += `🔬 **Study Type:** ${typeData.label}\n`;
        welcome += `📋 **Framework:** ${typeData.framework} → **Reporting:** ${typeData.reporting}\n\n`;
      }
      if (steps.issues.length > 0) {
        welcome += `**Priority gaps to address:**\n`;
        steps.issues.slice(0, 3).forEach(i => {
          welcome += `${i.severity === "error" ? "🔴" : i.severity === "warn" ? "🟡" : "🔵"} ${i.msg}\n`;
        });
        welcome += "\n";
      }
      welcome += `Ask me anything about your research — methodology, statistics, writing, guidelines, or bias assessment.`;
      setMessages([{ role: "assistant", content: welcome }]);
    }
  }, [project?.id]);

  useEffect(() => {
    if (open && !minimized) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, minimized]);

  const buildContext = () => {
    if (!project) return "";
    const detected = detectedType?.detected;
    return `
===RESEARCH CONTEXT===
Title: ${project.title || "Not set"}
Detected Study Type: ${detected?.label || "Unknown"} | Registered: ${project.study_type || "Not set"}
Framework: ${detected?.framework || typeData?.framework || "PICO"}
Reporting Guideline: ${detected?.reporting || typeData?.reporting || "STROBE"}
Status: ${project.status || "Draft"}
Current Workflow Section: ${currentSection || "Overview"}

Research Question: ${project.pico?.structured_question || `P: ${project.pico?.population || ""} | I/E: ${project.pico?.intervention || project.pico?.exposure || ""} | C: ${project.pico?.comparison || ""} | O: ${project.pico?.outcome || ""}`}
Objectives: ${(project.objectives || []).filter(Boolean).join(" | ")}
Hypothesis: ${project.hypothesis || "Not stated"}
Sample Size: ${project.sample_size?.calculated ? `n=${project.sample_size.calculated}` : "Not calculated"} — Justification: ${project.sample_size?.justification || "None"}
Inclusion Criteria: ${(project.eligibility?.inclusion || []).filter(Boolean).join("; ")}
Exclusion Criteria: ${(project.eligibility?.exclusion || []).filter(Boolean).join("; ")}
Variables (${(project.variables || []).length}): ${(project.variables || []).map(v => `${v.name} [${v.type}, ${v.role}]`).join(", ")}
Statistical Tests: ${(project.statistical_tests || []).join(", ") || "Not selected"}
Statistical Plan: ${(project.statistical_plan || "").slice(0, 200)}
Ethics: ${project.ethics_status || "Not started"} | IEC: ${project.iec_number || "Pending"}
Institution: ${project.institution || "Not set"}
Enrolled: ${project.total_enrolled || 0}

===SPECIALTY CONTEXT===
Setting: ${NEPHRO_CONTEXT.setting}
Guidelines: ${NEPHRO_CONTEXT.guidelines}
Stats Software: ${NEPHRO_CONTEXT.common_stats_software}
===END CONTEXT===`;
  };

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: msg }]);
    setLoading(true);

    try {
      const contextBlock = buildContext();
      const prompt = `${contextBlock}

USER REQUEST: ${msg}

You are an expert clinical research mentor specializing in PEDIATRIC NEPHROLOGY. You have deep expertise in:
- Clinical research methodology (RCTs, cohorts, case-control, diagnostic, systematic reviews)
- Biostatistics for clinical research
- KDIGO, IPNA, ISPD, IAP, ESPN guidelines
- Academic writing and publication (JASN, AJKD, Pediatric Nephrology, NDT)
- Indian tertiary care medical research context
- ICMR research ethics guidelines

Instructions:
- Be contextually aware — reference the specific project details above
- Provide publication-grade, clinically nuanced advice
- Use academic but accessible language
- Give concrete, actionable suggestions
- For writing tasks: produce actual content the user can directly use
- For methodology: reference standard guidelines and justify recommendations
- Avoid generic responses — personalize to this project's study type and stage
- When improving writing: make it sound like an experienced clinician-researcher, not a robot
- Keep responses focused and under 500 words unless writing full sections`;

      const result = await base44.integrations.Core.InvokeLLM({ prompt, model: "claude_sonnet_4_6" });
      setMessages(prev => [...prev, { role: "assistant", content: result, timestamp: new Date().toISOString() }]);
    } catch {
      try {
        // Fallback to default model
        const result = await base44.integrations.Core.InvokeLLM({ prompt: buildContext() + "\n\nUSER: " + msg + "\n\nAnswer as a pediatric nephrology research expert." });
        setMessages(prev => [...prev, { role: "assistant", content: result }]);
      } catch {
        setMessages(prev => [...prev, { role: "assistant", content: "Sorry, AI request failed. Please try again." }]);
      }
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = getQuickPrompts(studyTypeId, currentSection);

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 z-50 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-2xl rounded-2xl gap-2 h-12 px-4">
        <Brain className="w-5 h-5" />
        <span className="text-sm font-semibold">Research Mentor</span>
        {nextSteps?.issues?.filter(i => i.severity === "error").length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
            {nextSteps.issues.filter(i => i.severity === "error").length}
          </span>
        )}
      </Button>
    );
  }

  return (
    <div className={`fixed bottom-24 right-4 z-50 w-80 md:w-[400px] bg-white rounded-2xl shadow-2xl border-2 border-indigo-200 flex flex-col transition-all ${minimized ? "h-14" : "h-[560px]"}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-2xl shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Brain className="w-4 h-4 text-white shrink-0" />
          <span className="text-sm font-semibold text-white">Research Mentor</span>
          {typeData && <Badge className="bg-white/20 text-white text-xs border-0 shrink-0">{typeData.shortLabel}</Badge>}
          {currentSection && <Badge className="bg-white/10 text-white/80 text-xs border-0 truncate max-w-20">{currentSection}</Badge>}
        </div>
        <div className="flex gap-1 shrink-0">
          <button onClick={() => setMinimized(!minimized)} className="text-white/80 hover:text-white p-1">
            {minimized ? <ChevronDown className="w-4 h-4 rotate-180" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          {/* Quick Prompts */}
          <div className="px-3 py-2 border-b bg-gradient-to-r from-indigo-50 to-purple-50 overflow-x-auto shrink-0">
            <div className="flex gap-1.5">
              {quickPrompts.map((qp, i) => (
                <button key={i} onClick={() => sendMessage(qp.prompt)}
                  className="shrink-0 text-xs bg-white border border-indigo-200 rounded-full px-2.5 py-1 hover:bg-indigo-100 text-indigo-700 transition-colors">
                  {qp.label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority Issues Banner */}
          {nextSteps?.issues?.filter(i => i.severity === "error").length > 0 && messages.length <= 1 && (
            <div className="mx-3 mt-2 p-2 bg-red-50 border border-red-200 rounded-lg shrink-0">
              <p className="text-xs font-semibold text-red-700 mb-1">🔴 Action required:</p>
              {nextSteps.issues.filter(i => i.severity === "error").map((issue, i) => (
                <p key={i} className="text-xs text-red-600">• {issue.msg}</p>
              ))}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[90%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                  m.role === "user" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-800"
                }`}>
                  {m.role === "assistant" && (
                    <div className="flex items-center gap-1 mb-1">
                      <Brain className="w-3 h-3 text-indigo-500" />
                      <span className="text-indigo-500 font-semibold text-xs">Mentor</span>
                    </div>
                  )}
                  <div className="whitespace-pre-wrap">{m.content}</div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 rounded-2xl px-3 py-2 flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin text-indigo-500" />
                  <span className="text-xs text-slate-500">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t shrink-0">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder="Ask your research mentor..."
                className="flex-1 text-xs border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <Button size="icon" onClick={() => sendMessage()} disabled={loading || !input.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 h-8 w-8 rounded-xl shrink-0">
                <Send className="w-3 h-3" />
              </Button>
            </div>
            <p className="text-xs text-slate-400 mt-1 text-center">Powered by advanced AI · Pediatric Nephrology specialized</p>
          </div>
        </>
      )}
    </div>
  );
}