import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import PedigreeVisualizer from "../components/PedigreeVisualizer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Dna, Send, Loader2, Upload, Copy, Plus, User, BookOpen, ChevronDown, ChevronUp, GraduationCap, Info, X, Users } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

// ── ACMG Criteria Reference (from uploaded PDFs) ────────────────────────────
const ACMG_CRITERIA = {
  pathogenic: [
    { code: "PVS1", label: "Null Known", strength: "Very Strong", color: "bg-red-900", desc: "Loss of function variant in a gene where LOF is a known pathogenic mechanism (nonsense, frameshift, ±1/2 splice sites, initiation codon, multi-exon deletion). Caveats: beware genes where LOF is not known mechanism, extreme 3' variants, exon-skipping splicing variants." },
    { code: "PS1", label: "Other Nucleotide", strength: "Strong", color: "bg-red-700", desc: "Same amino acid change as a previously established pathogenic variant regardless of nucleotide change. Caveat: beware changes affecting splicing." },
    { code: "PS2", label: "De Novo Confirmed", strength: "Strong", color: "bg-red-700", desc: "De novo (paternity AND maternity confirmed) in a patient with the disease and no family history. Note: confirmation of paternity only is insufficient." },
    { code: "PS3", label: "Functional Consequence", strength: "Strong", color: "bg-red-700", desc: "Well-established in vitro or in vivo functional studies supportive of a damaging effect. Most rigorous if validated in clinical diagnostic lab setting." },
    { code: "PS4", label: "High Prevalence", strength: "Strong", color: "bg-red-700", desc: "Prevalence in affected significantly increased vs controls (RR/OR >5.0, CI not including 1.0)." },
    { code: "PM1", label: "Hotspot", strength: "Moderate", color: "bg-pink-600", desc: "Variant in mutational hotspot or critical functional domain (e.g., enzyme active site) without benign variation." },
    { code: "PM2", label: "Rare", strength: "Moderate", color: "bg-pink-600", desc: "Absent from large population studies (or at extremely low frequency if recessive) — ESP, ExAC, gnomAD." },
    { code: "PM3", label: "Trans (Recessive)", strength: "Moderate", color: "bg-pink-600", desc: "For recessive disorders, detected in trans with a pathogenic variant. Requires parental testing to determine phase." },
    { code: "PM4", label: "In-Frame Non-Repetitive", strength: "Moderate", color: "bg-pink-600", desc: "Protein length changes due to in-frame deletions/insertions in a non-repeat region, or stoploss variants." },
    { code: "PM5", label: "Different Missense", strength: "Moderate", color: "bg-pink-600", desc: "Missense change at an amino acid residue where a DIFFERENT pathogenic missense change is known. Caveat: beware splicing effects. e.g., p.Arg156His is pathogenic → now see p.Arg156Cys." },
    { code: "PM6", label: "De Novo Unconfirmed", strength: "Moderate", color: "bg-pink-600", desc: "Assumed de novo without confirmation of paternity and maternity." },
    { code: "PP1", label: "Segregates-Family", strength: "Supporting", color: "bg-rose-400", desc: "Co-segregation with disease in multiple affected family members. Can be upgraded with increasing segregation data." },
    { code: "PP2", label: "Typically Missense", strength: "Supporting", color: "bg-rose-400", desc: "Missense variant in a gene with a low rate of benign missense variation where missense is a common disease mechanism." },
    { code: "PP3", label: "Predicted Damaging", strength: "Supporting", color: "bg-rose-400", desc: "Multiple lines of computational evidence support deleterious effect. Note: multiple in silico tools use same inputs — count only once." },
    { code: "PP4", label: "Specific Phenotype", strength: "Supporting", color: "bg-rose-400", desc: "Patient's phenotype or family history is highly specific for a disease with a single genetic etiology." },
    { code: "PP5", label: "Reputable Source", strength: "Supporting", color: "bg-rose-400", desc: "Reputable source reports variant as pathogenic but evidence not available for independent evaluation. (Controversial — not universally adopted)" },
  ],
  benign: [
    { code: "BA1", label: "Very Common", strength: "Stand-Alone", color: "bg-blue-900", desc: "Allele frequency ≥5% in ExAC, 1000 Genomes, or ESP. Standalone evidence of benignness." },
    { code: "BS1", label: "Too Common", strength: "Strong", color: "bg-blue-700", desc: "Allele frequency is too high for the disorder (greater than expected carrier/disease frequency)." },
    { code: "BS2", label: "Healthy Mutant", strength: "Strong", color: "bg-blue-700", desc: "Observed in a healthy adult for a recessive (homozygous), dominant (heterozygous), or X-linked (hemizygous) disorder with full penetrance expected at early age." },
    { code: "BS3", label: "No Functional Consequence", strength: "Strong", color: "bg-blue-700", desc: "Well-established functional studies show NO damaging effect on protein function or splicing." },
    { code: "BS4", label: "Segregation-None", strength: "Strong", color: "bg-blue-700", desc: "Lack of segregation in affected members of a family. Caveat: phenocopies may mimic lack of segregation." },
    { code: "BP1", label: "Not LOF", strength: "Supporting", color: "bg-blue-400", desc: "Missense variant in a gene where only truncating variants are known to be pathogenic." },
    { code: "BP2", label: "With Cis Pathogenic", strength: "Supporting", color: "bg-blue-400", desc: "Observed in trans with pathogenic variant for dominant disorder, or in cis with pathogenic variant in any pattern." },
    { code: "BP3", label: "In-Frame Repetitive", strength: "Supporting", color: "bg-blue-400", desc: "In-frame deletions/insertions in a repetitive region without a known function." },
    { code: "BP4", label: "Predicted Benign", strength: "Supporting", color: "bg-blue-400", desc: "Multiple lines of computational evidence suggest no impact. Can only be used once per variant evaluation." },
    { code: "BP5", label: "Other Cause", strength: "Supporting", color: "bg-blue-400", desc: "Variant found in a case with an alternate molecular basis for disease." },
    { code: "BP6", label: "Reputable Source-Benign", strength: "Supporting", color: "bg-blue-400", desc: "Reputable source recently reports variant as benign but evidence not available. (Controversial)" },
    { code: "BP7", label: "Synonymous", strength: "Supporting", color: "bg-blue-400", desc: "Silent variant where splicing prediction algorithms predict no impact on splice sites and nucleotide not highly conserved." },
  ],
};

const CLASSIFICATION_RULES = [
  { label: "PATHOGENIC", color: "bg-red-700 text-white", rules: ["PVS1 + PS", "PVS1 + 2×PM", "PVS1 + PM + PP", "PVS1 + 2×PP", "2×PS", "PS + 3×PM", "PS + 2×PM + 2×PP", "PS + PM + 4×PP"] },
  { label: "LIKELY PATHOGENIC", color: "bg-orange-500 text-white", rules: ["PVS1 + PM", "PS + PM", "PS + 2×PP", "3×PM", "2×PM + 2×PP", "PM + 4×PP"] },
  { label: "UNCERTAIN", color: "bg-yellow-500 text-slate-900", rules: ["Other criteria not met", "Contradictory benign and pathogenic criteria"] },
  { label: "LIKELY BENIGN", color: "bg-blue-500 text-white", rules: ["BS + BP", "2×BP"] },
  { label: "BENIGN", color: "bg-green-700 text-white", rules: ["BA1 alone", "2×BS"] },
];

const NEPHROLOGY_GENES = [
  { gene: "NPHS2", condition: "Steroid-Resistant NS (SRNS)", inheritance: "AR", panel: "Nephrotic syndrome panel", notes: "p.Arg229Gln — high allele frequency, may not be pathogenic alone" },
  { gene: "NPHS1", condition: "Congenital NS / SRNS", inheritance: "AR", panel: "Nephrotic syndrome panel", notes: "Finnish type (CNF); loss-of-function → complete nephrin absence" },
  { gene: "WT1", condition: "Denys-Drash / Frasier syndrome", inheritance: "AD (de novo)", panel: "WT1, podocyte panel", notes: "Zinc finger domain mutations → nephropathy + gonadal dysgenesis" },
  { gene: "COL4A3", condition: "Alport syndrome (AR/AD)", inheritance: "AR/AD", panel: "Alport panel", notes: "GBM type IV collagen; hematuria + progressive CKD" },
  { gene: "COL4A4", condition: "Alport syndrome (AR/AD)", inheritance: "AR/AD", panel: "Alport panel", notes: "Also Thin Basement Membrane disease in heterozygotes" },
  { gene: "COL4A5", condition: "X-linked Alport syndrome", inheritance: "XL", panel: "Alport panel", notes: "Hemizygous males: end-stage kidney disease by 20-30y" },
  { gene: "CFH", condition: "aHUS / C3 Glomerulopathy", inheritance: "AD", panel: "Complement panel", notes: "Factor H; loss-of-function → uncontrolled complement activation" },
  { gene: "CFI", condition: "aHUS", inheritance: "AD", panel: "Complement panel", notes: "Factor I deficiency; reduced C3b inactivation" },
  { gene: "UMOD", condition: "ADTKD-UMOD / Medullary Cystic Disease", inheritance: "AD", panel: "ADTKD panel", notes: "Uromucoid; maturity-onset kidney disease → hyperuricemia + gout" },
  { gene: "PKD1", condition: "ADPKD", inheritance: "AD", panel: "PKD panel", notes: "85% of ADPKD; large gene with many VUS — interpretation challenging" },
  { gene: "PKD2", condition: "ADPKD", inheritance: "AD", panel: "PKD panel", notes: "Milder phenotype vs PKD1; median ESKD 74y vs 54y" },
  { gene: "HNF1B", condition: "CAKUT / MODY5", inheritance: "AD", panel: "CAKUT, HNF1B", notes: "17q12 deletion; renal cysts + MODY5 diabetes + pancreatic hypoplasia" },
  { gene: "ACTN4", condition: "FSGS", inheritance: "AD", panel: "Podocyte panel", notes: "Alpha-actinin-4; adult-onset FSGS; do not immunosuppress" },
  { gene: "TRPC6", condition: "FSGS", inheritance: "AD", panel: "Podocyte panel", notes: "Gain-of-function; adult-onset FSGS; avoid calcineurin inhibitors" },
];

const EXAMPLE_QUERIES = [
  "NPHS2 c.686G>A (p.Arg229Gln) heterozygous in a 4-year-old with SRNS — interpret and classify",
  "COL4A3 c.1774G>A (p.Gly592Ser) heterozygous — child with haematuria and family history of kidney disease",
  "CFH gene c.3572C>T (p.Thr1184Met) — how does this relate to aHUS and what management is needed?",
  "PKD1 pathogenic variant found incidentally in a 7-year-old — family counselling approach?",
  "WGS report shows 17q12 deletion (HNF1B) — what are the renal implications?",
];

export default function GeneticReportAnalyzer() {
  const [activeMainTab, setActiveMainTab] = useState("analyzer");
  const [acmgTab, setAcmgTab] = useState("pathogenic");
  const activeSubRef = useRef(null);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [expandedGene, setExpandedGene] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    let unsubscribe = null;
    const init = async () => {
      try {
        const conv = await base44.agents.createConversation({
          agent_name: "genetic_report_analyzer",
          metadata: { name: "Genetic Analysis Session", created: new Date().toISOString() },
        });
        setConversation(conv);
        unsubscribe = base44.agents.subscribeToConversation(conv.id, (data) => {
          setMessages(data.messages || []);
          setIsLoading(false);
        });
        activeSubRef.current = unsubscribe;
      } catch (e) {
        console.error("Failed to init conversation:", e);
        toast.error("Failed to start session — please refresh");
      }
    };
    init();
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const initConversation = async () => {
    if (activeSubRef.current) { activeSubRef.current(); activeSubRef.current = null; }
    try {
      const conv = await base44.agents.createConversation({
        agent_name: "genetic_report_analyzer",
        metadata: { name: "Genetic Analysis Session", created: new Date().toISOString() },
      });
      setConversation(conv);
      const unsub = base44.agents.subscribeToConversation(conv.id, (data) => {
        setMessages(data.messages || []);
        setIsLoading(false);
      });
      activeSubRef.current = unsub;
    } catch (e) {
      console.error("initConversation error:", e);
      toast.error("Failed to start session — please refresh");
    }
  };

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg && !uploadedFile) return;
    if (!conversation) return;
    setIsLoading(true);
    setInput("");
    try {
      const messageData = { role: "user", content: msg || `Please analyze this genetic report: ${uploadedFile?.name}` };
      if (uploadedFile) messageData.file_urls = [uploadedFile.url];
      await base44.agents.addMessage(conversation, messageData);
      setUploadedFile(null);
    } catch { toast.error("Failed to send"); }
    finally { setIsLoading(false); }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = "";
    setIsUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploadedFile({ name: file.name, url: file_url });
      toast.success(`${file.name} uploaded — click Send to analyze`);
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Upload failed — please try again");
    } finally {
      setIsUploading(false);
    }
  };

  const userMessages = messages.filter(m => m.role === "user" || m.role === "assistant");

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-20 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <Link to={createPageUrl("Hub")}><Button variant="ghost" size="sm" className="h-8"><ArrowLeft className="w-4 h-4" /></Button></Link>
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <Dna className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-base font-bold text-slate-900">Genetic Report Analyzer & Teaching Tool</h1>
            <p className="text-xs text-slate-500 hidden sm:block">ACMG Variant Classification · Genomic Report Interpretation · Counselling Guidance</p>
          </div>
          <div className="flex gap-1">
            <Button size="sm" variant="outline" onClick={async () => { setMessages([]); setConversation(null); setInput(""); setUploadedFile(null); await initConversation(); }}>
              <Plus className="w-3 h-3 mr-1" />New
            </Button>
          </div>
        </div>
      </div>

      {/* Main Tab Nav */}
      <div className="bg-white border-b px-4">
        <div className="max-w-6xl mx-auto flex gap-1 overflow-x-auto py-1">
          {[
            { id: "analyzer", label: "AI Analyzer", icon: Dna },
            { id: "pedigree", label: "Pedigree Builder", icon: Users },
            { id: "acmg", label: "ACMG Criteria", icon: BookOpen },
            { id: "genes", label: "Nephrology Gene Panel", icon: GraduationCap },
            { id: "guide", label: "Report Guide", icon: Info },
          ].map(tab => (
            <Button key={tab.id} size="sm" variant={activeMainTab === tab.id ? "default" : "ghost"}
              onClick={() => setActiveMainTab(tab.id)}
              className={`text-xs h-8 whitespace-nowrap ${activeMainTab === tab.id ? "bg-purple-600" : ""}`}>
              <tab.icon className="w-3 h-3 mr-1" />{tab.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">

        {/* ── AI ANALYZER TAB ── */}
        {activeMainTab === "analyzer" && (
          <div className="space-y-4">
            <Alert className="bg-purple-50 border-purple-200">
              <Dna className="w-4 h-4 text-purple-600" />
              <AlertDescription className="text-xs text-purple-900">
                <strong>AI Genetic Analysis Assistant</strong> — Classifies variants per ACMG/AMP 2015 criteria, explains gene-disease associations, provides TEACHING explanations for trainees, counselling guidance, and management plans. Upload PDF/image reports or paste findings directly.
                <span className="block mt-1 text-purple-700 font-medium">⚠️ For educational and clinical decision support only. Always verify with a certified clinical geneticist/genetic counsellor.</span>
              </AlertDescription>
            </Alert>

            {/* Example Queries */}
            {userMessages.length === 0 && (
              <Card className="bg-white shadow-sm">
                <CardHeader className="pb-2 bg-purple-50 border-b">
                  <CardTitle className="text-sm font-semibold text-purple-900">📋 Example Clinical Scenarios</CardTitle>
                </CardHeader>
                <CardContent className="p-4 grid gap-2">
                  {EXAMPLE_QUERIES.map((q, i) => (
                    <button key={i} onClick={() => sendMessage(q)}
                      className="text-left text-xs p-2.5 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-lg border border-purple-200 transition-colors">
                      <span className="font-semibold text-purple-600">Try → </span>{q}
                    </button>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Chat */}
            {userMessages.length > 0 && (
              <div className="space-y-3">
                {userMessages.map((msg, i) => (
                  <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role !== "user" && (
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-1">
                        <Dna className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className={`max-w-[88%] rounded-2xl px-4 py-3 shadow-sm ${msg.role === "user" ? "bg-slate-800 text-white" : "bg-white border border-slate-200"}`}>
                      {msg.role === "user" ? (
                        <p className="text-sm">{msg.content}</p>
                      ) : (
                        <ReactMarkdown className="text-sm prose prose-sm prose-slate max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                          {msg.content}
                        </ReactMarkdown>
                      )}
                      {msg.tool_calls?.some(t => t.status === "running" || t.status === "in_progress") && (
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
                        <Loader2 className="w-4 h-4 animate-spin text-purple-600" />Analyzing genetic report...
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}

            {/* Input */}
            <div className="sticky bottom-0 pb-4">
              {uploadedFile && (
                <div className="mb-2 flex items-center gap-2 bg-purple-100 border border-purple-300 rounded-lg p-2 text-xs">
                  <Upload className="w-3 h-3 text-purple-600" />
                  <span className="text-purple-800 flex-1 truncate">{uploadedFile.name}</span>
                  <button onClick={() => setUploadedFile(null)}><X className="w-3 h-3 text-purple-600" /></button>
                </div>
              )}
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-3">
                <Textarea value={input} onChange={e => setInput(e.target.value)}
                  placeholder="Paste variant findings, gene report text, or ask about ACMG classification, gene-disease links, counselling strategies..."
                  className="border-0 focus-visible:ring-0 resize-none text-sm min-h-[80px] p-0"
                  onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) sendMessage(); }} />
                <div className="flex items-center justify-between mt-2 pt-2 border-t">
                  <div className="flex gap-2">
                    <input ref={fileInputRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.txt" onChange={handleFileUpload} className="hidden" />
                    <Button variant="ghost" size="sm" className="text-xs h-7 text-slate-500" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                      {isUploading ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Upload className="w-3 h-3 mr-1" />}
                      Upload Report
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs h-7 text-slate-500"
                      onClick={() => { navigator.clipboard.writeText(userMessages.map(m => `${m.role === "user" ? "CLINICIAN" : "AI"}: ${m.content}`).join("\n\n")); toast.success("Copied"); }}
                      disabled={!messages.length}>
                      <Copy className="w-3 h-3 mr-1" />Copy
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
        )}

        {/* ── PEDIGREE TAB ── */}
        {activeMainTab === "pedigree" && (
          <PedigreeVisualizer
            reportVariants={messages.filter(m => m.role === "user").map(m => m.content).join(" ").slice(0, 120)}
          />
        )}

        {/* ── ACMG CRITERIA TAB ── */}
        {activeMainTab === "acmg" && (
          <div className="space-y-4">
            <Alert className="bg-blue-50 border-blue-200">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-xs text-blue-900">
                <strong>ACMG/AMP 2015 Variant Classification Criteria</strong> — Richards et al., Genetics in Medicine 2015. The standard framework used by clinical genomic laboratories worldwide to classify variants as Pathogenic, Likely Pathogenic, VUS, Likely Benign, or Benign.
              </AlertDescription>
            </Alert>

            {/* Classification Rules */}
            <Card className="bg-white shadow-sm">
              <CardHeader className="pb-2 bg-slate-50 border-b">
                <CardTitle className="text-sm font-bold">5-Tier Classification System</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                {CLASSIFICATION_RULES.map(cls => (
                  <div key={cls.label} className="rounded-lg border overflow-hidden">
                    <div className={`px-3 py-2 text-sm font-bold ${cls.color}`}>{cls.label}</div>
                    <div className="p-2 grid grid-cols-2 gap-1">
                      {cls.rules.map((r, i) => (
                        <div key={i} className="text-xs bg-slate-50 rounded px-2 py-1 border font-mono">{r}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Criteria Cards */}
            <div className="flex gap-2">
              <Button size="sm" variant={acmgTab === "pathogenic" ? "default" : "outline"}
                onClick={() => setAcmgTab("pathogenic")} className={`text-xs ${acmgTab === "pathogenic" ? "bg-red-700" : ""}`}>
                🔴 Pathogenic Evidence
              </Button>
              <Button size="sm" variant={acmgTab === "benign" ? "default" : "outline"}
                onClick={() => setAcmgTab("benign")} className={`text-xs ${acmgTab === "benign" ? "bg-blue-700" : ""}`}>
                🔵 Benign Evidence
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              {ACMG_CRITERIA[acmgTab].map(c => (
                <Card key={c.code} className="bg-white shadow-sm border">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      <div className={`px-2 py-1 rounded text-white text-sm font-bold font-mono flex-shrink-0 ${c.color}`}>{c.code}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-slate-900">{c.label}</span>
                          <Badge variant="outline" className="text-xs">{c.strength}</Badge>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{c.desc}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Workflow summary */}
            <Card className="bg-amber-50 border-amber-200">
              <CardHeader className="pb-2 border-b border-amber-200">
                <CardTitle className="text-sm font-bold text-amber-900">💡 VUS (Variant of Uncertain Significance)</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                <p className="text-xs text-amber-900">Classified as VUS when:</p>
                <div className="grid gap-1">
                  {["Other criteria are not met (neither pathogenic nor benign evidence)", "Criteria for benign and pathogenic are contradictory (evidence on both sides)"].map((r, i) => (
                    <div key={i} className="text-xs bg-amber-100 border border-amber-300 rounded px-2 py-1">{i + 1}. {r}</div>
                  ))}
                </div>
                <p className="text-xs text-amber-800 font-medium">⚠️ VUS should NOT be used for clinical decision-making. Do NOT offer predictive testing to family members based on VUS alone. Re-contact the lab periodically — VUS are reclassified as evidence accumulates.</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── NEPHROLOGY GENE PANEL TAB ── */}
        {activeMainTab === "genes" && (
          <div className="space-y-4">
            <Alert className="bg-teal-50 border-teal-200">
              <GraduationCap className="w-4 h-4 text-teal-600" />
              <AlertDescription className="text-xs text-teal-900">
                <strong>Key Nephrology Disease Genes</strong> — Common genes reported in pediatric nephrology genomic testing. Inheritance patterns, phenotypes, and clinical pearls for each gene.
              </AlertDescription>
            </Alert>
            <div className="grid md:grid-cols-2 gap-3">
              {NEPHROLOGY_GENES.map(g => (
                <Card key={g.gene} className="bg-white shadow-sm border cursor-pointer" onClick={() => setExpandedGene(expandedGene === g.gene ? null : g.gene)}>
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-purple-700 font-mono text-sm">{g.gene}</span>
                          <Badge className="bg-slate-100 text-slate-700 text-xs">{g.inheritance}</Badge>
                        </div>
                        <p className="text-xs font-semibold text-slate-800 mt-0.5">{g.condition}</p>
                        {expandedGene === g.gene && (
                          <div className="mt-2 space-y-1">
                            <p className="text-xs text-slate-600"><span className="font-semibold">Panel: </span>{g.panel}</p>
                            <p className="text-xs text-blue-800 bg-blue-50 rounded p-1.5 border border-blue-200"><span className="font-semibold">Clinical Pearl: </span>{g.notes}</p>
                          </div>
                        )}
                      </div>
                      {expandedGene === g.gene ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ── REPORT GUIDE TAB ── */}
        {activeMainTab === "guide" && (
          <div className="space-y-4">
            <Alert className="bg-indigo-50 border-indigo-200">
              <Info className="w-4 h-4 text-indigo-600" />
              <AlertDescription className="text-xs text-indigo-900">
                <strong>Guide to Interpreting Genomic Reports</strong> — Based on CSER Consortium Practitioner Education Working Group toolkit. Designed for non-genetics clinicians.
              </AlertDescription>
            </Alert>

            {[
              { title: "What is NGS / Genomic Sequencing?", icon: "🧬", content: "Next Generation Sequencing (NGS) determines genetic sequence in millions of short reads (~100bp each), assembled into a complete sequence. Used for gene panels, whole exome (coding 1-2% of genome, ~22,000 genes), or whole genome sequencing. Potentially millions of variants are filtered to identify clinically meaningful ones. A NEGATIVE result does NOT rule out genetic disease — it means no cause was found with current knowledge." },
              { title: "Understanding Variant Terminology", icon: "📋", content: "Variants (previously called 'mutations') are differences from the reference sequence. Classification (5-tier ACMG scale): Benign → Likely Benign → VUS → Likely Pathogenic → Pathogenic. Labs typically report pathogenic/likely pathogenic and VUS; rarely benign/likely benign. Both pathogenic and likely pathogenic are treated clinically as disease-causing." },
              { title: "Primary vs Secondary Findings", icon: "🔍", content: "Primary findings: directly explain the patient's symptoms. Secondary findings: medically meaningful but unrelated to the reason for testing (e.g., cancer predisposition found during nephrology workup). ACMG recommends 59 genes to be systematically reported as secondary findings. Patients should be counselled pre-test about secondary finding options." },
              { title: "VUS — What to Tell Families", icon: "❓", content: "VUS = uncertain relationship to disease. DO NOT use VUS alone for clinical decisions. DO NOT offer predictive testing to relatives based on VUS. Re-contact testing lab periodically — VUS frequently reclassified as evidence grows. Some labs automatically issue amended reports when VUS are reclassified. Patients of non-Caucasian ancestry have higher VUS rates due to representation gaps in genomic databases." },
              { title: "Carrier Status Results", icon: "👨‍👩‍👧", content: "A carrier has one working + one non-working copy of a gene. Carriers are usually asymptomatic for autosomal recessive (AR) conditions. Risk to offspring: if both parents are carriers of same AR condition, 25% affected, 50% carrier, 25% unaffected. X-linked: female carriers usually unaffected, males hemizygous = affected. For reproductive planning: partner testing important after identification of AR carrier." },
              { title: "Trio Sequencing (Proband + Both Parents)", icon: "👨‍👩‍👦", content: "Sequencing both parents increases diagnostic yield — identifies de novo variants (not present in either parent = new mutation in child). De novo variants are often pathogenic in dominant conditions. If only singleton (child alone) sequenced, de novo variants may be missed. Labs may hold parental samples and test after proband results." },
              { title: "Pharmacogenomics in Genomic Reports", icon: "💊", content: "Pharmacogenomics findings relate to drug metabolism differences based on genetics. May predict: reduced/absent drug response (poor metabolisers), toxicity at normal doses (ultra-rapid metabolisers), immune reactions (e.g., HLA-B*57:01 + abacavir → Stevens-Johnson). Only actionable if patient takes the relevant drug. See CPIC guidelines (cpicpgx.org) for gene-drug pairs." },
              { title: "Genetic Discrimination & GINA", icon: "⚖️", content: "GINA (Genetic Information Nondiscrimination Act, 2008) protects against genetic discrimination in health insurance and employment in the USA. Does NOT cover life insurance, disability insurance, or long-term care insurance. Some countries have equivalent laws — check local regulations. Advise patients to be mindful when applying for non-health insurance." },
            ].map((section, i) => (
              <Card key={i} className="bg-white shadow-sm border">
                <CardContent className="p-4">
                  <div className="flex items-start gap-2">
                    <span className="text-xl flex-shrink-0">{section.icon}</span>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 mb-1">{section.title}</h3>
                      <p className="text-xs text-slate-700 leading-relaxed">{section.content}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Resources */}
            <Card className="bg-slate-50 border">
              <CardHeader className="pb-2 border-b"><CardTitle className="text-sm font-bold">🔗 Key External Resources</CardTitle></CardHeader>
              <CardContent className="p-4 grid md:grid-cols-2 gap-2">
                {[
                  { name: "ClinVar", url: "https://www.ncbi.nlm.nih.gov/clinvar/", desc: "Public archive of variant-disease associations" },
                  { name: "GeneReviews", url: "https://www.ncbi.nlm.nih.gov/books/NBK1116/", desc: "Expert-written condition-specific genetics guides" },
                  { name: "OMIM", url: "https://www.ncbi.nlm.nih.gov/omim", desc: "Online Mendelian Inheritance in Man database" },
                  { name: "ClinGen", url: "https://clinicalgenome.org", desc: "Clinical relevance of genes and variants" },
                  { name: "CPIC Guidelines", url: "https://cpicpgx.org/", desc: "Pharmacogenomics implementation guidelines" },
                  { name: "Mastermind Genomic Search", url: "https://mastermind.genomenon.com", desc: "Variant-specific literature search engine" },
                ].map(r => (
                  <a key={r.name} href={r.url} target="_blank" rel="noopener noreferrer"
                    className="text-xs p-2 bg-white border border-slate-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors">
                    <span className="font-semibold text-blue-700">{r.name}</span>
                    <span className="text-slate-500 ml-1">— {r.desc}</span>
                  </a>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}