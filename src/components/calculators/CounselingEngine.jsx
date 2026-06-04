import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Printer, MessageSquare, FileText, Loader2, Languages } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const COUNSELING_TOPICS = {
  nephrotic_steroid:   { label: "Nephrotic — Steroid Precautions", icon: "💊" },
  nephrotic_relapse:   { label: "Nephrotic — Relapse Education", icon: "🔄" },
  ckd_diet:            { label: "CKD — Diet & Fluid Advice", icon: "🥗" },
  ckd_monitoring:      { label: "CKD — Home Monitoring", icon: "📊" },
  transplant_post:     { label: "Post-Transplant Precautions", icon: "🏥" },
  biologics:           { label: "Biologic Therapy Counseling", icon: "🧬" },
  immunosuppression:   { label: "Immunosuppression Safety", icon: "🛡️" },
  vaccines:            { label: "Vaccine Schedule & Precautions", icon: "💉" },
  htn_lifestyle:       { label: "Hypertension — Lifestyle", icon: "❤️" },
  dialysis_pd:         { label: "Peritoneal Dialysis — Home Care", icon: "🩺" },
  fluid_advice:        { label: "Fluid Restriction Guidance", icon: "💧" },
  emergency_signs:     { label: "Emergency Warning Signs", icon: "🚨" },
};

const LANGUAGES = ["English", "Hindi", "Tamil", "Telugu", "Bengali", "Marathi", "Gujarati", "Kannada", "Malayalam"];

const TOPIC_PROMPTS = {
  nephrotic_steroid: (name, age) => `Generate parent/patient counseling material for ${name}, age ${age}, on steroids (prednisolone) for nephrotic syndrome. Include: morning dosing rationale, food interaction (with food), sick-day rules (double dose during fever), infection precautions, when to go to hospital immediately (fever >38.5°C, rash, vomiting), adrenal warning, dietary advice (low salt, low sugar), weight monitoring, school considerations. Format as simple bullet points with an emergency section at the end.`,
  nephrotic_relapse: (name, age) => `Generate patient education for ${name} age ${age} about nephrotic syndrome relapse. Include: what is a relapse (definition in simple terms), how to check urine at home with dipstick, what proteinuria 2+ or 3+ means, when to call doctor, what triggers relapses, when to restart steroids as instructed, dietary salt restriction, swelling management at home, emergency signs.`,
  ckd_diet: (name, age) => `Generate dietary counseling for ${name} age ${age} with CKD. Include: potassium restriction foods to avoid (bananas, oranges, potatoes, tomatoes), phosphate restriction (dairy, nuts, colas), low sodium advice, protein moderation, fluid restriction if applicable, foods that are safe, Indian meal plan examples, reading food labels, school lunch guidance.`,
  transplant_post: (name, age) => `Generate post-kidney transplant counseling for ${name} age ${age}. Include: never miss medications, sun protection (squamous cell risk), infection precautions, avoid raw foods/gardening, fever protocol (any temp >38°C = hospital), monitoring signs of rejection (decreased urine, weight gain, tenderness), wound care, school return timeline, vaccination restrictions (no live vaccines), regular check-up importance.`,
  biologics: (name, age) => `Generate biologic therapy counseling (e.g. rituximab, adalimumab, tocilizumab) for ${name} age ${age}. Include: what biologics do (suppress immune system), infection risk, when to hold medication (fever, infection), COVID precautions, TB screening importance, vaccine restrictions, pre-infusion checklist, what to watch for during/after infusion, travel precautions, emergency contacts.`,
  emergency_signs: (name, age) => `Generate emergency warning signs card for parent of ${name} age ${age} on immunosuppressive therapy for kidney disease. Include: fever protocol, signs of infection, signs of relapse, signs of drug toxicity, when to go to emergency room immediately, what NOT to do (e.g. don't stop steroids suddenly), emergency contact advice. Format as a clear EMERGENCY CARD that can be printed and kept.`,
  vaccines: (name, age) => `Generate vaccine counseling for ${name} age ${age} on immunosuppressive therapy. Include: which vaccines are SAFE (killed/inactivated: flu, hepatitis B, pneumococcal, meningococcal, typhoid), which are CONTRAINDICATED (live: MMR, varicella, BCG, yellow fever, OPV, rotavirus), timing before starting immunosuppression, catch-up schedule, family member vaccination advice, school vaccination requirements.`,
  immunosuppression: (name, age) => `Generate immunosuppression safety counseling for ${name} age ${age}. Include: infection signs to watch for, hand hygiene, food safety, avoiding sick contacts, school/daycare precautions, when to hold medications, what to tell other doctors/dentist, surgical precautions, sick-day rules for steroids, monitoring parameters, medication timing and storage, generic vs brand drugs.`,
};

export default function CounselingEngine() {
  const [topic, setTopic] = useState("emergency_signs");
  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [language, setLanguage] = useState("English");
  const [customNotes, setCustomNotes] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [format, setFormat] = useState("detailed");

  const generate = async () => {
    const name = patientName || "the patient";
    const age = patientAge || "the child";
    setLoading(true);
    setResult(null);
    try {
      const basePrompt = TOPIC_PROMPTS[topic]
        ? TOPIC_PROMPTS[topic](name, age)
        : `Generate ${COUNSELING_TOPICS[topic]?.label} counseling for ${name} age ${age}.`;

      const fullPrompt = `${basePrompt}
${customNotes ? `\nAdditional context: ${customNotes}` : ""}
${language !== "English" ? `\nProvide the output in BOTH English AND ${language} (translate to ${language} below the English version).` : ""}
Format: ${format === "whatsapp" ? "WhatsApp-friendly text with emojis, short paragraphs, easy language" : format === "printable" ? "Clean printable format with clear headings and bullet points" : "Detailed with sections"}
DO NOT use markdown asterisks for bold. Use plain text with CAPS for headings.`;

      const response = await base44.integrations.Core.InvokeLLM({ prompt: fullPrompt });
      setResult(typeof response === "string" ? response : response?.result || response?.text || JSON.stringify(response));
    } catch (err) {
      toast.error("Failed to generate counseling content");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 p-5 text-white">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <MessageSquare className="w-6 h-6" /> Patient & Parent Counseling Engine
        </h2>
        <p className="text-teal-100 text-sm mt-1">Generate printable, WhatsApp-ready, multilingual counseling sheets</p>
      </div>

      <Card>
        <CardContent className="pt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Patient Name (optional)</Label>
              <Input value={patientName} onChange={e => setPatientName(e.target.value)} placeholder="e.g. Arjun" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Age</Label>
              <Input value={patientAge} onChange={e => setPatientAge(e.target.value)} placeholder="e.g. 8 years" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Counseling Topic</Label>
              <Select value={topic} onValueChange={setTopic}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(COUNSELING_TOPICS).map(([k, v]) => <SelectItem key={k} value={k}>{v.icon} {v.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{LANGUAGES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs">Format</Label>
            <div className="flex gap-2 mt-1">
              {[{ id: "detailed", label: "📄 Detailed" }, { id: "printable", label: "🖨️ Printable" }, { id: "whatsapp", label: "📱 WhatsApp" }].map(f => (
                <button key={f.id} onClick={() => setFormat(f.id)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold border-2 transition-all ${format === f.id ? "bg-teal-600 text-white border-teal-600" : "border-slate-200 text-slate-600 hover:border-teal-300"}`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs">Additional Notes / Specific Instructions (optional)</Label>
            <Textarea value={customNotes} onChange={e => setCustomNotes(e.target.value)} placeholder="e.g. Patient also on tacrolimus, recently had episode of varicella exposure..." className="mt-1 h-20 text-xs" />
          </div>

          <Button onClick={generate} disabled={loading} className="w-full bg-teal-600 hover:bg-teal-700">
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</> : <><FileText className="w-4 h-4 mr-2" />Generate Counseling Sheet</>}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className="border-2 border-teal-300">
          <CardHeader className="bg-teal-50 border-b py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                {COUNSELING_TOPICS[topic]?.icon} {COUNSELING_TOPICS[topic]?.label}
                {language !== "English" && <Badge className="bg-teal-600 text-white text-xs"><Languages className="w-3 h-3 mr-1" />{language}</Badge>}
              </CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(result); toast.success("Copied!"); }}>
                  <Copy className="w-3 h-3 mr-1" />Copy
                </Button>
                <Button size="sm" variant="outline" onClick={() => window.print()}>
                  <Printer className="w-3 h-3 mr-1" />Print
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <pre className="whitespace-pre-wrap text-sm text-slate-800 font-sans leading-relaxed">{result}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}