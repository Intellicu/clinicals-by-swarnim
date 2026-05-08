import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { Sparkles, X, Send, Loader2, ChevronDown, ChevronUp, Lightbulb } from "lucide-react";

const QUICK_PROMPTS = {
  "research_question": "Suggest a structured PICOT research question based on my project",
  "study_design": "What study design is most appropriate for my research question and why?",
  "sample_size": "Help me justify my sample size calculation",
  "variables": "Suggest key variables I should measure for this study",
  "stats": "Which statistical tests should I use for my data types?",
  "ethics": "What ethical considerations apply to this study?",
  "missing_fields": "What important sections or fields am I missing in my protocol?",
  "strobe": "Apply STROBE checklist to my observational study",
  "consort": "Apply CONSORT checklist to my RCT",
  "discussion": "Help me write the Discussion section",
  "references": "Suggest key references for my topic",
};

export default function ResearchAIAssistant({ project, currentSection }) {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: `Hi! I'm your Research AI Assistant for **${project?.title || "your project"}**. I understand your current stage and can help with:\n\n• Protocol sections\n• Statistical guidance\n• STROBE/CONSORT checklists\n• Writing assistance\n• Missing field detection\n\nWhat do you need help with?` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (open && !minimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open, minimized]);

  const buildContext = () => {
    if (!project) return "";
    return `
RESEARCH PROJECT CONTEXT:
- Title: ${project.title || "Not set"}
- Study Type: ${project.study_type || "Not set"}
- Status: ${project.status || "Draft"}
- Current Section: ${currentSection || "Overview"}
- PICO: P=${project.pico?.population || ""} | I=${project.pico?.intervention || ""} | C=${project.pico?.comparison || ""} | O=${project.pico?.outcome || ""}
- Research Question: ${project.pico?.structured_question || ""}
- Objectives: ${(project.objectives || []).join("; ")}
- Hypothesis: ${project.hypothesis || ""}
- Sample Size: ${project.sample_size?.calculated ? `n=${project.sample_size.calculated}` : "Not calculated"}
- Eligibility: Inclusion: ${(project.eligibility?.inclusion || []).filter(Boolean).join(", ")} | Exclusion: ${(project.eligibility?.exclusion || []).filter(Boolean).join(", ")}
- Variables: ${(project.variables || []).map(v => `${v.name} (${v.type}, ${v.role})`).join(", ")}
- Statistical Tests: ${(project.statistical_tests || []).join(", ")}
- Ethics: ${project.ethics_status || "Not started"}, IEC: ${project.iec_number || "pending"}
- Institution: ${project.institution || ""}
- Enrolled Patients: ${project.total_enrolled || 0}

Specialty: Pediatric Nephrology
Guidelines: KDIGO, IPNA, ISPD, IAP, ESPN
`;
  };

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: msg }]);
    setLoading(true);

    try {
      const prompt = `${buildContext()}

USER QUESTION: ${msg}

You are a pediatric nephrology clinical research expert and statistician. Answer concisely and practically. Focus on the context of this specific project. If the user asks to generate or write content, provide it directly. Use bullet points for clarity. Keep responses under 400 words unless writing protocol/manuscript content.`;

      const result = await base44.integrations.Core.InvokeLLM({ prompt });
      setMessages(prev => [...prev, { role: "assistant", content: result }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, AI request failed. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 z-50 bg-indigo-600 hover:bg-indigo-700 shadow-2xl rounded-2xl gap-2 h-12 px-4"
      >
        <Sparkles className="w-5 h-5" />
        <span className="text-sm font-semibold">Research AI</span>
      </Button>
    );
  }

  return (
    <div className={`fixed bottom-24 right-4 z-50 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border-2 border-indigo-200 flex flex-col transition-all ${minimized ? "h-14" : "h-[520px]"}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-2xl shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-white" />
          <span className="text-sm font-semibold text-white">Research AI Assistant</span>
          {currentSection && <Badge className="bg-white/20 text-white text-xs border-0">{currentSection}</Badge>}
        </div>
        <div className="flex gap-1">
          <button onClick={() => setMinimized(!minimized)} className="text-white/80 hover:text-white p-1">
            {minimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          {/* Quick Prompts */}
          <div className="px-3 py-2 border-b bg-indigo-50 overflow-x-auto shrink-0">
            <div className="flex gap-1.5">
              {Object.entries(QUICK_PROMPTS).slice(0, 5).map(([key, prompt]) => (
                <button key={key} onClick={() => sendMessage(prompt)}
                  className="shrink-0 text-xs bg-white border border-indigo-200 rounded-full px-2.5 py-1 hover:bg-indigo-100 text-indigo-700 transition-colors">
                  {key.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                  m.role === "user" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-800"
                }`}>
                  {m.role === "assistant" && (
                    <div className="flex items-center gap-1 mb-1">
                      <Sparkles className="w-3 h-3 text-indigo-500" />
                      <span className="text-indigo-500 font-semibold text-xs">AI</span>
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
                placeholder="Ask anything about your project..."
                className="flex-1 text-xs border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <Button size="icon" onClick={() => sendMessage()} disabled={loading || !input.trim()} className="bg-indigo-600 hover:bg-indigo-700 h-8 w-8 rounded-xl shrink-0">
                <Send className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}