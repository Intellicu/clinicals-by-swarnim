import React, { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Loader2, Check, X, FileText, Sparkles } from "lucide-react";
import { base44 } from "@/api/client";
import { toast } from "sonner";

/**
 * VoiceDictation — drop into any Clinic/Emergency page.
 * Props:
 *   onSoap(soapObject)  — called with structured { subjective, objective, assessment, plan }
 *   onRaw(text)         — called with raw transcript (optional)
 *   compact (bool)      — show minimal UI
 */
export default function VoiceDictation({ onSoap, onRaw, compact = false }) {
  const [phase, setPhase] = useState("idle"); // idle | listening | processing | done
  const [transcript, setTranscript] = useState("");
  const [soap, setSoap] = useState(null);
  const recognitionRef = useRef(null);
  const chunksRef = useRef([]);

  const isSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  const startListening = useCallback(() => {
    if (!isSupported) { toast.error("Speech recognition not supported in this browser"); return; }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SpeechRecognition();
    rec.lang = "en-IN";
    rec.continuous = true;
    rec.interimResults = true;
    chunksRef.current = [];

    rec.onresult = (e) => {
      let interim = "";
      let final = "";
      for (let i = 0; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript + " ";
        else interim += e.results[i][0].transcript;
      }
      setTranscript((chunksRef.current.join(" ") + " " + final + interim).trim());
      if (e.results[e.results.length - 1].isFinal) chunksRef.current.push(e.results[e.results.length - 1][0].transcript);
    };

    rec.onerror = (e) => { toast.error("Mic error: " + e.error); setPhase("idle"); };
    rec.onend = () => { if (phase === "listening") structureSoap(); };

    recognitionRef.current = rec;
    rec.start();
    setPhase("listening");
    setSoap(null);
    setTranscript("");
    chunksRef.current = [];
  }, [phase]);

  const stopListening = () => {
    recognitionRef.current?.stop();
    structureSoap();
  };

  const structureSoap = async () => {
    const text = (chunksRef.current.join(" ") || transcript).trim();
    if (!text) { setPhase("idle"); return; }
    if (onRaw) onRaw(text);
    setPhase("processing");
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a clinical assistant. Structure the following doctor's dictation into a SOAP note.
Dictation: "${text}"

Return JSON with:
- subjective: patient's complaint, history, symptoms as described
- objective: examination findings, vitals, investigations mentioned
- assessment: diagnosis or impression
- plan: management plan, medications, follow-up

Be concise and clinical. Preserve medical terminology.`,
        response_json_schema: {
          type: "object",
          properties: {
            subjective: { type: "string" },
            objective: { type: "string" },
            assessment: { type: "string" },
            plan: { type: "string" },
          }
        }
      });
      setSoap(result);
      setPhase("done");
      if (onSoap) onSoap(result);
    } catch (e) {
      toast.error("AI structuring failed: " + e.message);
      setPhase("idle");
    }
  };

  const reset = () => {
    setPhase("idle"); setTranscript(""); setSoap(null); chunksRef.current = [];
  };

  if (!isSupported && compact) return null;

  // ── Compact mode (just the mic button)
  if (compact) {
    return (
      <button
        onClick={phase === "listening" ? stopListening : startListening}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
          phase === "listening" ? "bg-red-100 text-red-700 animate-pulse" :
          phase === "processing" ? "bg-amber-100 text-amber-700" :
          "bg-blue-50 text-blue-700 hover:bg-blue-100"
        }`}
        title="Voice dictation"
      >
        {phase === "processing" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
         phase === "listening" ? <MicOff className="w-3.5 h-3.5" /> :
         <Mic className="w-3.5 h-3.5" />}
        {phase === "listening" ? "Stop" : phase === "processing" ? "Processing…" : "Dictate"}
      </button>
    );
  }

  // ── Full mode
  return (
    <div className="border border-blue-200 rounded-xl overflow-hidden bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="flex items-center gap-2">
          <Mic className="w-4 h-4 text-white" />
          <span className="text-sm font-bold text-white">Voice Dictation → SOAP</span>
          <Badge className="bg-white/20 text-white text-xs">AI-Powered</Badge>
        </div>
        {phase !== "idle" && (
          <button onClick={reset} className="text-white/70 hover:text-white"><X className="w-4 h-4" /></button>
        )}
      </div>

      <div className="p-4 space-y-3">
        {/* Controls */}
        {phase === "idle" && (
          <div className="flex flex-col items-center gap-3 py-4">
            {!isSupported && (
              <p className="text-xs text-red-500 text-center">Speech recognition not supported in this browser.</p>
            )}
            <button
              onClick={startListening}
              disabled={!isSupported}
              className="w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 flex items-center justify-center shadow-lg transition-transform active:scale-95"
            >
              <Mic className="w-7 h-7 text-white" />
            </button>
            <p className="text-xs text-slate-500 text-center">Tap to start dictating clinical notes.<br />Speak naturally — AI will structure into SOAP format.</p>
          </div>
        )}

        {phase === "listening" && (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
              <span className="text-sm font-semibold text-red-700">Listening…</span>
            </div>
            {transcript && (
              <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-700 leading-relaxed min-h-[60px] border border-slate-200">
                {transcript}
              </div>
            )}
            <Button onClick={stopListening} className="w-full bg-red-600 hover:bg-red-700">
              <MicOff className="w-4 h-4 mr-2" /> Stop & Structure with AI
            </Button>
          </div>
        )}

        {phase === "processing" && (
          <div className="flex flex-col items-center gap-3 py-6">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-800">Structuring with AI…</p>
              <p className="text-xs text-slate-500 mt-1">Converting dictation to SOAP format</p>
            </div>
          </div>
        )}

        {phase === "done" && soap && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-green-700">
              <Check className="w-4 h-4" />
              <span className="text-xs font-semibold">SOAP Note Generated</span>
              <Sparkles className="w-3.5 h-3.5 text-violet-500" />
            </div>
            {[
              { key: "subjective", label: "S — Subjective", color: "bg-blue-50 border-blue-200" },
              { key: "objective", label: "O — Objective", color: "bg-green-50 border-green-200" },
              { key: "assessment", label: "A — Assessment", color: "bg-amber-50 border-amber-200" },
              { key: "plan", label: "P — Plan", color: "bg-purple-50 border-purple-200" },
            ].map(s => soap[s.key] && (
              <div key={s.key} className={`rounded-lg p-3 border ${s.color}`}>
                <p className="text-xs font-bold text-slate-600 mb-1">{s.label}</p>
                <p className="text-xs text-slate-800 leading-relaxed">{soap[s.key]}</p>
              </div>
            ))}
            <div className="flex gap-2 pt-1">
              <Button size="sm" onClick={reset} variant="outline" className="flex-1">
                <Mic className="w-3.5 h-3.5 mr-1" /> New Dictation
              </Button>
              <Button size="sm" onClick={() => { if (onSoap) onSoap(soap); toast.success("SOAP note saved!"); }}
                className="flex-1 bg-green-600 hover:bg-green-700">
                <Check className="w-3.5 h-3.5 mr-1" /> Save to Record
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}