import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import {
  Bot, X, Microscope, Dna, Zap, Brain, TestTube, Layers,
  FlaskConical, BookOpen, Activity, Sparkles, Wind, Droplet,
  Baby, AlertCircle, UtensilsCrossed, ChevronRight,
  Send, Loader2, MessageCircle
} from "lucide-react";
import ReactMarkdown from "react-markdown";

const AI_ANALYSER_TOOLS = [
  { name: "Lab Analyzer", icon: Microscope, color: "bg-rose-600", page: "ClinicalAIHub", tab: "labs", group: "Clinical AI" },
  { name: "Biopsy AI", icon: Layers, color: "bg-violet-700", page: "ClinicalAIHub", tab: "biopsy", group: "Clinical AI" },
  { name: "Case Analyzer", icon: BookOpen, color: "bg-emerald-700", page: "ClinicalAIHub", tab: "case", group: "Clinical AI" },
  { name: "Differential Dx", icon: Brain, color: "bg-indigo-600", page: "DifferentialEngine", group: "Clinical AI" },
  { name: "Urine/UDS AI", icon: TestTube, color: "bg-teal-600", page: "ClinicalAIHub", tab: "uds", group: "Clinical AI" },
  { name: "Radiology AI", icon: Activity, color: "bg-sky-700", page: "ClinicalAIHub", tab: "radiology", group: "Clinical AI" },
  { name: "Genetic Agent", icon: Dna, color: "bg-violet-600", page: "GeneticReportAnalyzer", group: "Nephrology" },
  { name: "Uroflow AI", icon: Activity, color: "bg-teal-700", page: "UrologyNephrologyHub", tab: "uroflow", group: "Nephrology" },
  { name: "Rare Lab AI", icon: FlaskConical, color: "bg-purple-700", page: "RareDiseaseModule", group: "Nephrology" },
  { name: "AI Prescriber", icon: Sparkles, color: "bg-indigo-700", page: "AIPrescriber", group: "Nephrology" },
  { name: "ABG Analyzer", icon: Wind, color: "bg-rose-600", page: "ABGInterpreter", group: "Pediatrics" },
  { name: "Growth Analyzer", icon: Baby, color: "bg-green-600", page: "GeneralPediatricsHub", group: "Pediatrics" },
  { name: "Nutrition AI", icon: UtensilsCrossed, color: "bg-orange-600", page: "NutritionHub", group: "Pediatrics" },
  { name: "Sepsis AI", icon: AlertCircle, color: "bg-red-600", page: "ClinicalAIHub", group: "Pediatrics" },
  { name: "Dehydration AI", icon: Droplet, color: "bg-cyan-600", page: "ClinicalAIHub", group: "Pediatrics" },
];

const GROUPS = ["Clinical AI", "Nephrology", "Pediatrics"];

const QUICK_QS = [
  "Nephrotic syndrome steroid dosing?",
  "KDIGO AKI staging?",
  "Tacrolimus target levels SRNS?",
  "Hypertension stage 1 management?",
];

// Compact AI chat panel
function MiniChat({ onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");
    setMessages(p => [...p, { role: "user", content: msg }]);
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a concise paediatric nephrology clinical AI. Answer in 3-5 bullet points max. No preamble. No disclaimers in body. Clinical, direct, evidence-based.\n\nQuestion: ${msg}`,
      });
      setMessages(p => [...p, { role: "assistant", content: res }]);
    } catch {
      setMessages(p => [...p, { role: "assistant", content: "Error — please try again.", error: true }]);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && (
          <div className="space-y-1.5 pt-1">
            <p className="text-xs text-slate-400 text-center mb-2">Quick clinical questions</p>
            {QUICK_QS.map((q, i) => (
              <button key={i} onClick={() => send(q)}
                className="w-full text-left text-xs px-2.5 py-2 rounded-lg bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-700 transition-all">
                {q}
              </button>
            ))}
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[88%] rounded-xl px-3 py-2 text-xs ${m.role === "user" ? "bg-indigo-600 text-white" : "bg-white border border-slate-200 text-slate-900"}`}>
              {m.role === "user" ? (
                <p>{m.content}</p>
              ) : (
                <div className="prose prose-xs prose-slate max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin text-indigo-600" />
              <span className="text-xs text-slate-500">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="border-t p-2 flex gap-1.5 bg-white">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Ask anything clinical..."
          className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          disabled={loading}
        />
        <button
          onClick={() => send()}
          disabled={!input.trim() || loading}
          className="w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 flex items-center justify-center flex-shrink-0 transition-colors"
        >
          <Send className="w-3.5 h-3.5 text-white" />
        </button>
      </div>
      <p className="text-center text-[10px] text-slate-400 pb-1.5 bg-white">AI output for decision support only — verify clinically</p>
    </div>
  );
}

export default function FloatingHubButton() {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState("Clinical AI");
  const [panel, setPanel] = useState("tools"); // "tools" | "chat"

  const switchToTools = () => setPanel("tools");

  if (location.pathname === "/AIAgentsHub") return null;

  const groupTools = AI_ANALYSER_TOOLS.filter(t => t.group === activeGroup);

  return (
    <>
      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" onClick={() => setOpen(false)} />
      )}

      {/* Panel */}
      {open && (
        <div
          className="fixed z-50 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col"
          style={{ bottom: "calc(var(--tab-bar-height, 64px) + 60px)", right: "12px", height: "min(500px, calc(100vh - 160px))" }}
        >
          {/* Header — always visible, never scrolls away */}
          <div className="flex-shrink-0 bg-gradient-to-r from-indigo-700 to-violet-700 px-4 py-2.5 flex items-center justify-between rounded-t-2xl">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-white" />
              <p className="text-white font-bold text-sm">Clinical AI Hub</p>
            </div>
            <div className="flex items-center gap-1">
              <div className="flex bg-white/20 rounded-lg overflow-hidden text-xs">
                <button onClick={() => setPanel("tools")}
                  className={`px-2.5 py-1 font-medium transition-colors ${panel === "tools" ? "bg-white text-indigo-700" : "text-white/80 hover:text-white"}`}>
                  Tools
                </button>
                <button onClick={() => setPanel("chat")}
                  className={`px-2.5 py-1 font-medium transition-colors ${panel === "chat" ? "bg-white text-indigo-700" : "text-white/80 hover:text-white"}`}>
                  Chat
                </button>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white ml-1.5">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {panel === "tools" ? (
            <>
              {/* Group tabs */}
              <div className="flex-shrink-0 flex border-b border-slate-100 bg-slate-50">
                {GROUPS.map(g => (
                  <button key={g} onClick={() => setActiveGroup(g)}
                    className={`flex-1 py-2 text-xs font-semibold transition-all ${activeGroup === g ? "bg-white text-indigo-700 border-b-2 border-indigo-600" : "text-slate-500 hover:text-slate-700"}`}>
                    {g}
                  </button>
                ))}
              </div>

              {/* Tools grid — scrollable */}
              <div className="flex-1 overflow-y-auto p-3 grid grid-cols-3 gap-2 content-start">
                {groupTools.map(tool => {
                  const Icon = tool.icon;
                  const href = createPageUrl(tool.page) + (tool.tab ? `?tab=${tool.tab}` : "");
                  return (
                    <Link key={tool.name} to={href} onClick={() => setOpen(false)}>
                      <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all active:scale-95 cursor-pointer">
                        <div className={`w-10 h-10 ${tool.color} rounded-xl flex items-center justify-center shadow-sm`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xs font-semibold text-slate-700 text-center leading-tight line-clamp-2">{tool.name}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>

              <Link to="/AIAgentsHub" onClick={() => setOpen(false)} className="flex-shrink-0">
                <div className="flex items-center justify-center gap-1.5 px-4 py-2.5 border-t border-slate-100 bg-slate-50 hover:bg-indigo-50 transition-colors">
                  <span className="text-xs font-semibold text-indigo-600">View All AI Agents</span>
                  <ChevronRight className="w-3.5 h-3.5 text-indigo-600" />
                </div>
              </Link>
            </>
          ) : (
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              <MiniChat onClose={() => setOpen(false)} />
            </div>
          )}
        </div>
      )}

      {/* Single FAB */}
      <button
        onClick={() => setOpen(v => !v)}
        className={`fixed z-50 flex items-center gap-1.5 text-white text-xs font-semibold px-3.5 py-2.5 rounded-full shadow-xl transition-all hover:scale-105 active:scale-95 ${open ? "bg-slate-700" : "bg-indigo-600 hover:bg-indigo-700"}`}
        style={{ bottom: "calc(var(--tab-bar-height, 64px) + 8px)", right: "12px" }}
        title="Clinical AI Hub"
      >
        {open ? <X className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        <span>{open ? "Close" : "AI"}</span>
      </button>
    </>
  );
}