import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Syringe, Pill, RotateCcw, Loader2, Baby, ChevronDown } from "lucide-react";
import ReactMarkdown from "react-markdown";

const QUICK_PROMPTS = [
"What vaccines are due for a 6-month-old?",
"Next vaccines for a 15-month child who missed MMR",
"Amoxicillin dose for a 12 kg child with ear infection",
"Treatment plan for nephrotic syndrome first episode, weight 18 kg",
"Catch-up schedule for a 2-year-old with no previous vaccines",
"Prednisolone dose for nephrotic relapse, 20 kg child",
"UTI treatment in a 3-year-old girl, weight 14 kg",
"Vaccines contraindicated in immunosuppressed children"];


export default function VaccDrugChatbot() {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    initConversation();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const initConversation = async () => {
    setInitializing(true);
    const conv = await base44.agents.createConversation({
      agent_name: "vacc_drug_assist",
      metadata: { name: "Pediatric Vacc & Drug Session" }
    });
    setConversation(conv);

    const unsubscribe = base44.agents.subscribeToConversation(conv.id, (data) => {
      setMessages(data.messages || []);
      setLoading(false);
    });

    setInitializing(false);
    return () => unsubscribe();
  };

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || !conversation || loading) return;
    setInput("");
    setLoading(true);
    await base44.agents.addMessage(conversation, { role: "user", content: msg });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {e.preventDefault();sendMessage();}
  };

  const reset = async () => {
    setMessages([]);
    setConversation(null);
    await initConversation();
  };

  const visibleMessages = messages.filter((m) => m.role === "user" || m.role === "assistant");

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] min-h-[500px] max-h-[800px]">
      {/* Header */}
      















      

      {/* Quick prompts */}
      <div className="px-3 py-2 bg-green-50 border-x border-green-100 overflow-x-auto">
        <div className="flex gap-2 whitespace-nowrap">
          {QUICK_PROMPTS.map((p, i) =>
          <button
            key={i}
            onClick={() => sendMessage(p)}
            disabled={loading || initializing}
            className="text-xs px-3 py-1.5 bg-white border border-green-300 rounded-full text-green-800 hover:bg-green-100 transition-colors flex-shrink-0 font-medium">
            
              {p.length > 35 ? p.slice(0, 35) + "…" : p}
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 border-x border-slate-200">
        {initializing ?
        <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-green-500" />
            <p className="text-sm">Loading assistant...</p>
          </div> :
        visibleMessages.length === 0 ?
        <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-teal-100 rounded-2xl flex items-center justify-center">
              <Syringe className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <p className="font-bold text-slate-700 text-base mb-1">Pediatric Vacc & Drug Assistant</p>
              <p className="text-slate-500 text-sm">Ask about vaccines, doses, schedules, or treatment plans. Enter child's age and weight for accurate calculations.</p>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
              <button onClick={() => sendMessage("What vaccines are due for a 9-month-old?")} className="p-3 bg-white border-2 border-green-200 rounded-xl text-left text-xs text-slate-700 hover:border-green-400 hover:bg-green-50 transition-colors">
                <Syringe className="w-4 h-4 text-green-600 mb-1" />
                Vaccines due at 9 months
              </button>
              <button onClick={() => sendMessage("Ceftriaxone dose for a 10 kg child with pneumonia")} className="p-3 bg-white border-2 border-blue-200 rounded-xl text-left text-xs text-slate-700 hover:border-blue-400 hover:bg-blue-50 transition-colors">
                <Pill className="w-4 h-4 text-blue-600 mb-1" />
                Drug dose calculation
              </button>
              <button onClick={() => sendMessage("Complete catch-up vaccination for unvaccinated 18-month child")} className="p-3 bg-white border-2 border-amber-200 rounded-xl text-left text-xs text-slate-700 hover:border-amber-400 hover:bg-amber-50 transition-colors">
                <RotateCcw className="w-4 h-4 text-amber-600 mb-1" />
                Catch-up schedule
              </button>
              <button onClick={() => sendMessage("Vaccines safe for a child on long-term steroids for nephrotic syndrome")} className="p-3 bg-white border-2 border-red-200 rounded-xl text-left text-xs text-slate-700 hover:border-red-400 hover:bg-red-50 transition-colors">
                <Baby className="w-4 h-4 text-red-600 mb-1" />
                Vaccines on steroids
              </button>
            </div>
          </div> :

        visibleMessages.map((msg, i) =>
        <MessageBubble key={i} message={msg} />
        )
        }
        {loading &&
        <div className="flex gap-2 items-start">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Baby className="w-4 h-4 text-green-600" />
            </div>
            <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm border border-slate-200">
              <div className="flex gap-1">
                {[0, 1, 2].map((j) =>
              <div key={j} className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: `${j * 0.15}s` }} />
              )}
              </div>
            </div>
          </div>
        }
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-3 bg-white border border-slate-200 rounded-b-xl flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about vaccines, drug doses, treatment plans..."
          disabled={loading || initializing}
          className="flex-1 text-sm border-slate-300 focus-visible:ring-green-400" />
        
        <Button
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading || initializing}
          className="bg-green-600 hover:bg-green-700 px-3">
          
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>);

}

function MessageBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex gap-2 items-start ${isUser ? "flex-row-reverse" : ""}`}>
      {!isUser &&
      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
          <Baby className="w-4 h-4 text-green-600" />
        </div>
      }
      <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${isUser ? "bg-green-600 text-white rounded-tr-none" : "bg-white border border-slate-200 text-slate-800 rounded-tl-none"}`}>
        {isUser ?
        <p>{message.content}</p> :

        <ReactMarkdown
          className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 prose-headings:text-slate-800 prose-strong:text-slate-900"
          components={{
            p: ({ children }) => <p className="my-1 leading-relaxed">{children}</p>,
            ul: ({ children }) => <ul className="my-1 ml-4 list-disc space-y-0.5">{children}</ul>,
            ol: ({ children }) => <ol className="my-1 ml-4 list-decimal space-y-0.5">{children}</ol>,
            li: ({ children }) => <li className="text-sm">{children}</li>,
            strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
            h1: ({ children }) => <h1 className="text-base font-bold text-green-800 mt-2 mb-1">{children}</h1>,
            h2: ({ children }) => <h2 className="text-sm font-bold text-green-700 mt-2 mb-1">{children}</h2>,
            h3: ({ children }) => <h3 className="text-sm font-semibold text-slate-800 mt-1.5 mb-0.5">{children}</h3>,
            code: ({ children }) => <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">{children}</code>
          }}>
          
            {message.content}
          </ReactMarkdown>
        }
      </div>
    </div>);

}