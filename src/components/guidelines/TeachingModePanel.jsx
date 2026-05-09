import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, GraduationCap, BookOpen, CheckCircle, XCircle, RotateCcw, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const MODES = [
  { value: "mcq", label: "MCQs", desc: "Multiple choice questions for self-assessment" },
  { value: "viva", label: "Viva Questions", desc: "Fellowship viva / rounds discussion points" },
  { value: "flashcard", label: "Flashcards", desc: "Key fact rapid recall cards" },
  { value: "pearls", label: "Exam Pearls", desc: "High-yield clinical exam points" },
];

const LEVEL_OPTIONS = [
  { value: "resident", label: "Resident (PG1-2)" },
  { value: "senior_resident", label: "Senior Resident (PG3)" },
  { value: "fellowship", label: "Fellowship / DM Nephrology" },
  { value: "faculty", label: "Faculty Teaching Pack" },
];

function MCQCard({ q, index }) {
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="p-4 bg-white border-2 border-blue-100 rounded-xl space-y-3">
      <p className="text-sm font-semibold text-slate-900 leading-snug">Q{index + 1}. {q.question}</p>
      <div className="space-y-2">
        {q.options?.map((opt, oi) => {
          const isCorrect = oi === q.correct_index;
          const isSelected = selected === oi;
          let cls = "border-slate-200 bg-slate-50 text-slate-700";
          if (revealed) {
            if (isCorrect) cls = "border-green-400 bg-green-50 text-green-800";
            else if (isSelected && !isCorrect) cls = "border-red-300 bg-red-50 text-red-700";
          } else if (isSelected) cls = "border-blue-400 bg-blue-50 text-blue-800";
          return (
            <button key={oi} onClick={() => { setSelected(oi); if (!revealed) setRevealed(true); }}
              className={`w-full text-left p-2.5 rounded-lg border-2 text-xs font-medium transition-all flex items-center gap-2 ${cls}`}>
              <span className="w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs flex-shrink-0">
                {String.fromCharCode(65 + oi)}
              </span>
              {opt}
              {revealed && isCorrect && <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />}
              {revealed && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-400 ml-auto" />}
            </button>
          );
        })}
      </div>
      {revealed && q.explanation && (
        <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 leading-relaxed">
          <strong>Explanation:</strong> {q.explanation}
        </div>
      )}
      {revealed && (
        <button onClick={() => { setSelected(null); setRevealed(false); }}
          className="text-xs text-slate-400 flex items-center gap-1 hover:text-slate-600">
          <RotateCcw className="w-3 h-3" />Reset
        </button>
      )}
    </div>
  );
}

function FlashCard({ card, index }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <button onClick={() => setFlipped(!flipped)}
      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${flipped ? "bg-indigo-600 border-indigo-500 text-white" : "bg-white border-slate-200 text-slate-800"}`}>
      <p className="text-xs font-bold uppercase tracking-wide mb-1 opacity-60">{flipped ? "Answer" : `Card ${index + 1} — tap to reveal`}</p>
      <p className="text-sm font-semibold leading-snug">{flipped ? card.answer : card.question}</p>
    </button>
  );
}

export default function TeachingModePanel({ guideline }) {
  const [mode, setMode] = useState("mcq");
  const [level, setLevel] = useState("senior_resident");
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    setContent(null);
    const guidelineText = `${guideline.title} (${guideline.source} ${guideline.year})\n${guideline.scope_and_population || guideline.summary || ""}\nKey steps: ${guideline.key_recommendations?.slice(0, 8).join("; ") || ""}`;
    try {
      let prompt = "", schema = {};
      if (mode === "mcq") {
        prompt = `Generate 5 high-quality MCQs for a ${level.replace("_", " ")} on this pediatric nephrology guideline. Each MCQ must have 4 options, one correct answer (by index 0-3), and a brief explanation.\n\nGuideline:\n${guidelineText}`;
        schema = { type: "object", properties: { questions: { type: "array", items: { type: "object", properties: { question: { type: "string" }, options: { type: "array", items: { type: "string" } }, correct_index: { type: "number" }, explanation: { type: "string" } } } } } };
      } else if (mode === "viva") {
        prompt = `Generate 8 fellowship-level viva questions with model answers for this guideline. Focus on decision thresholds, management controversies, evidence basis.\n\nGuideline:\n${guidelineText}`;
        schema = { type: "object", properties: { questions: { type: "array", items: { type: "object", properties: { question: { type: "string" }, model_answer: { type: "string" } } } } } };
      } else if (mode === "flashcard") {
        prompt = `Generate 8 clinical flashcards (question/answer pairs) covering the most testable facts from this guideline. Be precise with numbers, doses, thresholds.\n\nGuideline:\n${guidelineText}`;
        schema = { type: "object", properties: { cards: { type: "array", items: { type: "object", properties: { question: { type: "string" }, answer: { type: "string" } } } } } };
      } else {
        prompt = `Generate 10 high-yield exam pearls for a pediatric nephrology fellow/exam from this guideline. Each pearl should be a concise memorable point.\n\nGuideline:\n${guidelineText}`;
        schema = { type: "object", properties: { pearls: { type: "array", items: { type: "string" } } } };
      }
      const result = await base44.integrations.Core.InvokeLLM({ prompt, response_json_schema: schema });
      setContent(result);
      toast.success("Teaching content generated!");
    } catch { toast.error("Generation failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <GraduationCap className="w-5 h-5 text-violet-600" />
        <div>
          <p className="text-sm font-bold text-slate-900">Teaching Mode</p>
          <p className="text-xs text-slate-500">Auto-generate MCQs · Viva Qs · Flashcards · Exam Pearls</p>
        </div>
      </div>

      {/* Mode selector */}
      <div className="grid grid-cols-2 gap-1.5">
        {MODES.map(m => (
          <button key={m.value} onClick={() => setMode(m.value)}
            className={`p-2.5 rounded-xl border-2 text-left transition-all ${mode === m.value ? "border-violet-400 bg-violet-50" : "border-slate-200 bg-white hover:border-violet-200"}`}>
            <p className={`text-xs font-bold ${mode === m.value ? "text-violet-700" : "text-slate-700"}`}>{m.label}</p>
            <p className="text-xs text-slate-400 mt-0.5 leading-tight">{m.desc}</p>
          </button>
        ))}
      </div>

      {/* Level */}
      <Select value={level} onValueChange={setLevel}>
        <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
        <SelectContent>
          {LEVEL_OPTIONS.map(l => <SelectItem key={l.value} value={l.value} className="text-xs">{l.label}</SelectItem>)}
        </SelectContent>
      </Select>

      <Button onClick={generate} disabled={loading} className="w-full bg-violet-600 hover:bg-violet-700 h-9 text-sm">
        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating…</> : <><GraduationCap className="w-4 h-4 mr-2" />Generate Teaching Content</>}
      </Button>

      {/* Content output */}
      {content && (
        <div className="space-y-3 border-t pt-4">
          {mode === "mcq" && content.questions?.map((q, i) => <MCQCard key={i} q={q} index={i} />)}
          {mode === "viva" && content.questions?.map((q, i) => (
            <div key={i} className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
              <p className="text-xs font-bold text-indigo-700 flex items-center gap-1"><ChevronRight className="w-3 h-3" />Q{i + 1}: {q.question}</p>
              <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-lg">
                <p className="text-xs font-bold text-indigo-600 mb-0.5">Model Answer:</p>
                <p className="text-xs text-indigo-800 leading-relaxed">{q.model_answer}</p>
              </div>
            </div>
          ))}
          {mode === "flashcard" && content.cards?.map((c, i) => <FlashCard key={i} card={c} index={i} />)}
          {mode === "pearls" && (
            <div className="space-y-2">
              {content.pearls?.map((p, i) => (
                <div key={i} className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <span className="text-amber-600 font-bold text-xs flex-shrink-0">💡 {i + 1}.</span>
                  <p className="text-xs text-amber-900 leading-relaxed">{p}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}