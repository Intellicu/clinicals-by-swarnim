import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Dna, Send, Loader2, Upload, Copy, Download, AlertTriangle, CheckCircle, Info, User, Bot, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

const EXAMPLE_QUERIES = [
  "Interpret this: NPHS2 c.686G>A (p.Arg229Gln) heterozygous variant found in a 4-year-old with steroid-resistant nephrotic syndrome",
  "COL4A3 c.1774G>A (p.Gly592Ser) heterozygous — what does this mean for a child with hematuria and family history of kidney disease?",
  "WAS-array CGH shows 17q12 deletion (HNF1B) — what are the renal implications and counselling needed?",
  "CFH gene: c.3572C>T (p.Thr1184Met) — how does this relate to aHUS and what management is needed?",
  "PKD1 pathogenic variant (c.10444C>T) found incidentally in a 7-year-old — what should we tell the family?",
];

export default function GeneticReportAnalyzer() {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    initConversation();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const initConversation = async () => {
    try {
      const conv = await base44.agents.createConversation({
        agent_name: "genetic_analyzer",
        metadata: { name: "Genetic Analysis Session", created: new Date().toISOString() },
      });
      setConversation(conv);

      const unsubscribe = base44.agents.subscribeToConversation(conv.id, (data) => {
        setMessages(data.messages || []);
      });

      return () => unsubscribe();
    } catch (e) {
      toast.error("Failed to start session");
    }
  };

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg && !uploadedFile) return;
    if (!conversation) return;

    setIsLoading(true);
    setInput("");

    try {
      const messageData = {
        role: "user",
        content: msg || (uploadedFile ? `Please analyze this genetic report file: ${uploadedFile.name}` : ""),
      };
      if (uploadedFile) {
        messageData.file_urls = [uploadedFile.url];
      }

      await base44.agents.addMessage(conversation, messageData);
      setUploadedFile(null);
    } catch (e) {
      toast.error("Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploadedFile({ name: file.name, url: file_url });
      toast.success("File uploaded — ready to analyze");
    } catch {
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const copyConversation = () => {
    const text = messages.filter(m => m.content).map(m => `${m.role === "user" ? "CLINICIAN" : "AI GENETICIST"}: ${m.content}`).join("\n\n");
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const newSession = async () => {
    setMessages([]);
    setConversation(null);
    setInput("");
    setUploadedFile(null);
    await initConversation();
  };

  const userMessages = messages.filter(m => m.role === "user" || m.role === "assistant");

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-20 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Link to={createPageUrl("Hub")}>
            <Button variant="ghost" size="sm" className="h-8"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <div className="flex items-center gap-2 flex-1">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Dna className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900">Genetic Report Analyzer</h1>
              <p className="text-xs text-slate-500 hidden sm:block">ACMG Variant Classification · Counselling · Management Plan</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={copyConversation} disabled={!messages.length} className="hidden sm:flex">
              <Copy className="w-3 h-3 mr-1" />Copy
            </Button>
            <Button size="sm" variant="outline" onClick={newSession}>
              <Plus className="w-3 h-3 mr-1" />New
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Info Banner */}
        <Alert className="bg-purple-50 border-purple-200">
          <Dna className="w-4 h-4 text-purple-600" />
          <AlertDescription className="text-xs text-purple-900">
            <strong>AI Genetic Analysis Assistant</strong> — Interprets variants per ACMG criteria, identifies gene-disease associations, suggests counselling strategies and management plans. Upload PDF/image reports or paste findings.
            <span className="block mt-1 text-purple-700">⚠️ For clinical decision support only. Verify with certified clinical geneticist.</span>
          </AlertDescription>
        </Alert>

        {/* Example Queries */}
        {userMessages.length === 0 && (
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700">Example Queries</CardTitle>
            </CardHeader>
            <CardContent className="p-4 grid gap-2">
              {EXAMPLE_QUERIES.map((q, i) => (
                <button key={i} onClick={() => sendMessage(q)} className="text-left text-xs p-2 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-lg border border-purple-200 transition-colors">
                  <span className="font-medium">Try: </span>{q}
                </button>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Chat Messages */}
        {userMessages.length > 0 && (
          <div className="space-y-3">
            {userMessages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role !== "user" && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-1">
                    <Dna className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${msg.role === "user" ? "bg-slate-800 text-white" : "bg-white border border-slate-200"}`}>
                  {msg.role === "user" ? (
                    <p className="text-sm">{msg.content}</p>
                  ) : (
                    <ReactMarkdown className="text-sm prose prose-sm prose-slate max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                      {msg.content}
                    </ReactMarkdown>
                  )}
                  {/* Tool calls */}
                  {msg.tool_calls?.filter(t => t.status === "running" || t.status === "in_progress").length > 0 && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                      <Loader2 className="w-3 h-3 animate-spin" />Analyzing genetic data...
                    </div>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
                  <Dna className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                    <span>Analyzing genetic report...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input Area */}
        <div className="sticky bottom-0 bg-transparent pb-4">
          {uploadedFile && (
            <div className="mb-2 flex items-center gap-2 bg-purple-100 border border-purple-300 rounded-lg p-2 text-xs">
              <Upload className="w-3 h-3 text-purple-600" />
              <span className="text-purple-800 flex-1 truncate">{uploadedFile.name}</span>
              <button onClick={() => setUploadedFile(null)} className="text-purple-600 hover:text-purple-900"><Trash2 className="w-3 h-3" /></button>
            </div>
          )}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-3">
            <Textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Paste genetic report findings, variant details, or ask about gene-disease associations..."
              className="border-0 focus-visible:ring-0 resize-none text-sm min-h-[80px] p-0"
              onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) sendMessage(); }}
            />
            <div className="flex items-center justify-between mt-2 pt-2 border-t">
              <div className="flex gap-2">
                <input ref={fileInputRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.txt" onChange={handleFileUpload} className="hidden" />
                <Button variant="ghost" size="sm" className="text-xs h-7 text-slate-500" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                  {isUploading ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Upload className="w-3 h-3 mr-1" />}
                  Upload Report
                </Button>
              </div>
              <Button onClick={() => sendMessage()} disabled={isLoading || (!input.trim() && !uploadedFile)} className="bg-purple-600 hover:bg-purple-700 h-8 px-4 text-sm">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          <p className="text-center text-xs text-slate-400 mt-1">Ctrl/Cmd+Enter to send</p>
        </div>
      </div>
    </div>
  );
}