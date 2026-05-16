import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Brain, CheckCircle2, XCircle, AlertTriangle, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";

// Milestones organized by domain and age
const DOMAINS = ["Gross Motor", "Fine Motor", "Language", "Social/Adaptive"];

const MILESTONES = [
  // Gross Motor
  { age: 1, domain: "Gross Motor", text: "Lifts head briefly in prone", dq_age: 1 },
  { age: 2, domain: "Gross Motor", text: "Holds head up 45° in prone", dq_age: 2 },
  { age: 3, domain: "Gross Motor", text: "Holds head up 90° in prone", dq_age: 3 },
  { age: 4, domain: "Gross Motor", text: "Rolls front to back", dq_age: 4 },
  { age: 5, domain: "Gross Motor", text: "Rolls back to front", dq_age: 5 },
  { age: 6, domain: "Gross Motor", text: "Sits with support", dq_age: 6 },
  { age: 7, domain: "Gross Motor", text: "Sits without support", dq_age: 7 },
  { age: 9, domain: "Gross Motor", text: "Pulls to stand", dq_age: 9 },
  { age: 10, domain: "Gross Motor", text: "Cruises along furniture", dq_age: 10 },
  { age: 12, domain: "Gross Motor", text: "Walks independently", dq_age: 12 },
  { age: 15, domain: "Gross Motor", text: "Runs (stiff-legged)", dq_age: 15 },
  { age: 18, domain: "Gross Motor", text: "Runs well", dq_age: 18 },
  { age: 24, domain: "Gross Motor", text: "Goes up/down stairs holding rail", dq_age: 24 },
  { age: 30, domain: "Gross Motor", text: "Jumps with both feet", dq_age: 30 },
  { age: 36, domain: "Gross Motor", text: "Pedals tricycle", dq_age: 36 },
  { age: 48, domain: "Gross Motor", text: "Hops on one foot", dq_age: 48 },
  { age: 60, domain: "Gross Motor", text: "Skips alternating feet", dq_age: 60 },

  // Fine Motor
  { age: 2, domain: "Fine Motor", text: "Follows object past midline", dq_age: 2 },
  { age: 3, domain: "Fine Motor", text: "Grasps rattle when placed in hand", dq_age: 3 },
  { age: 4, domain: "Fine Motor", text: "Hands come to midline", dq_age: 4 },
  { age: 5, domain: "Fine Motor", text: "Reaches for objects", dq_age: 5 },
  { age: 6, domain: "Fine Motor", text: "Transfers object hand to hand", dq_age: 6 },
  { age: 9, domain: "Fine Motor", text: "Pincer grasp (crude)", dq_age: 9 },
  { age: 10, domain: "Fine Motor", text: "Pincer grasp (neat/fine)", dq_age: 10 },
  { age: 12, domain: "Fine Motor", text: "Puts objects in container", dq_age: 12 },
  { age: 15, domain: "Fine Motor", text: "Builds tower of 2 blocks", dq_age: 15 },
  { age: 18, domain: "Fine Motor", text: "Scribbles spontaneously", dq_age: 18 },
  { age: 24, domain: "Fine Motor", text: "Builds tower of 6 blocks", dq_age: 24 },
  { age: 30, domain: "Fine Motor", text: "Copies a circle", dq_age: 30 },
  { age: 36, domain: "Fine Motor", text: "Copies a cross (+)", dq_age: 36 },
  { age: 48, domain: "Fine Motor", text: "Copies a square", dq_age: 48 },
  { age: 60, domain: "Fine Motor", text: "Copies a triangle", dq_age: 60 },

  // Language
  { age: 1, domain: "Language", text: "Alerts to sound", dq_age: 1 },
  { age: 2, domain: "Language", text: "Coos (vowel sounds)", dq_age: 2 },
  { age: 4, domain: "Language", text: "Laughs, squeals", dq_age: 4 },
  { age: 6, domain: "Language", text: "Babbles (consonant sounds: ba, da)", dq_age: 6 },
  { age: 9, domain: "Language", text: "Jargon (string of sounds with intent)", dq_age: 9 },
  { age: 12, domain: "Language", text: "1-2 meaningful words", dq_age: 12 },
  { age: 15, domain: "Language", text: "4-6 words with meaning", dq_age: 15 },
  { age: 18, domain: "Language", text: "10+ words; points to body parts", dq_age: 18 },
  { age: 24, domain: "Language", text: "2-word phrases (e.g. 'more milk')", dq_age: 24 },
  { age: 30, domain: "Language", text: "3-word sentences; asks questions", dq_age: 30 },
  { age: 36, domain: "Language", text: "Simple sentences; strangers understand 75%", dq_age: 36 },
  { age: 48, domain: "Language", text: "Tells stories; most speech clear", dq_age: 48 },
  { age: 60, domain: "Language", text: "Complex sentences; counts to 10", dq_age: 60 },

  // Social/Adaptive
  { age: 1, domain: "Social/Adaptive", text: "Regards face", dq_age: 1 },
  { age: 2, domain: "Social/Adaptive", text: "Social smile (responsive)", dq_age: 2 },
  { age: 4, domain: "Social/Adaptive", text: "Recognises parents; smiles spontaneously", dq_age: 4 },
  { age: 6, domain: "Social/Adaptive", text: "Recognises strangers vs family", dq_age: 6 },
  { age: 9, domain: "Social/Adaptive", text: "Stranger anxiety; waves bye-bye", dq_age: 9 },
  { age: 12, domain: "Social/Adaptive", text: "Plays patty-cake; drinks from cup", dq_age: 12 },
  { age: 15, domain: "Social/Adaptive", text: "Uses spoon (messy); helps with dressing", dq_age: 15 },
  { age: 18, domain: "Social/Adaptive", text: "Parallel play; removes clothing", dq_age: 18 },
  { age: 24, domain: "Social/Adaptive", text: "Associative play; washes hands", dq_age: 24 },
  { age: 30, domain: "Social/Adaptive", text: "Toilet training (daytime); plays with peers", dq_age: 30 },
  { age: 36, domain: "Social/Adaptive", text: "Cooperative play; dresses with minimal help", dq_age: 36 },
  { age: 48, domain: "Social/Adaptive", text: "Imaginative play; follows rules", dq_age: 48 },
  { age: 60, domain: "Social/Adaptive", text: "Has friends; understands fairness", dq_age: 60 },
];

const domainColors = {
  "Gross Motor": { bg: "bg-blue-50", border: "border-blue-200", badge: "bg-blue-100 text-blue-800", icon: "text-blue-600" },
  "Fine Motor": { bg: "bg-purple-50", border: "border-purple-200", badge: "bg-purple-100 text-purple-800", icon: "text-purple-600" },
  "Language": { bg: "bg-green-50", border: "border-green-200", badge: "bg-green-100 text-green-800", icon: "text-green-600" },
  "Social/Adaptive": { bg: "bg-orange-50", border: "border-orange-200", badge: "bg-orange-100 text-orange-800", icon: "text-orange-600" },
};

function interpretDQ(dq) {
  if (dq >= 85) return { label: "Normal", color: "text-green-700", bg: "bg-green-50 border-green-200", icon: <CheckCircle2 className="w-5 h-5 text-green-600" /> };
  if (dq >= 70) return { label: "Borderline / Mild Delay", color: "text-amber-700", bg: "bg-amber-50 border-amber-200", icon: <AlertTriangle className="w-5 h-5 text-amber-600" /> };
  if (dq >= 50) return { label: "Moderate Delay", color: "text-orange-700", bg: "bg-orange-50 border-orange-200", icon: <AlertTriangle className="w-5 h-5 text-orange-600" /> };
  return { label: "Severe Delay — Refer Urgently", color: "text-red-700", bg: "bg-red-50 border-red-200", icon: <XCircle className="w-5 h-5 text-red-600" /> };
}

export default function DevQuotientTool() {
  const [chronoAge, setChronoAge] = useState("");
  const [corrected, setCorrected] = useState("");
  const [passed, setPassed] = useState({});
  const [showMilestones, setShowMilestones] = useState(true);
  const [openDomain, setOpenDomain] = useState("Gross Motor");

  const ageMonths = parseFloat(corrected || chronoAge) || 0;
  const chronoAgeNum = parseFloat(chronoAge) || 0;

  // Filter milestones relevant to age (show milestones up to 6m beyond current age)
  const relevant = MILESTONES.filter(m => m.age <= ageMonths + 6);

  // For each domain, the developmental age = highest age milestone passed
  const domainDevAges = {};
  DOMAINS.forEach(domain => {
    const domainMilestones = relevant.filter(m => m.domain === domain);
    let devAge = 0;
    domainMilestones.forEach(m => {
      if (passed[`${domain}-${m.age}`] === true) devAge = Math.max(devAge, m.dq_age);
    });
    domainDevAges[domain] = devAge;
  });

  const overallDevAge = DOMAINS.reduce((sum, d) => sum + (domainDevAges[d] || 0), 0) / DOMAINS.length;
  const dq = ageMonths > 0 ? Math.round((overallDevAge / ageMonths) * 100) : null;
  const interpretation = dq !== null ? interpretDQ(dq) : null;

  const toggle = (domain, age) => {
    const key = `${domain}-${age}`;
    setPassed(p => ({ ...p, [key]: !p[key] }));
  };

  const reset = () => { setPassed({}); setChronoAge(""); setCorrected(""); };

  return (
    <div className="space-y-4">
      {/* Age Input */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <h3 className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
            <Brain className="w-4 h-4" /> Developmental Quotient (DQ) Calculator
          </h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Chronological Age (months) *</label>
              <input type="number" value={chronoAge} onChange={e => setChronoAge(e.target.value)}
                placeholder="e.g. 18" min="1" max="72"
                className="w-full h-9 px-3 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Corrected Age (months, if preterm)</label>
              <input type="number" value={corrected} onChange={e => setCorrected(e.target.value)}
                placeholder="Leave blank if term" min="1" max="72"
                className="w-full h-9 px-3 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
          </div>
          <p className="text-xs text-blue-700">
            DQ = (Developmental Age ÷ Chronological Age) × 100. Use corrected age up to 24 months for preterm infants.
          </p>
        </CardContent>
      </Card>

      {/* Result */}
      {dq !== null && overallDevAge > 0 && (
        <Card className={`border-2 ${interpretation.bg}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              {interpretation.icon}
              <div>
                <p className="text-2xl font-black text-slate-900">DQ = {dq}</p>
                <p className={`text-sm font-bold ${interpretation.color}`}>{interpretation.label}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {DOMAINS.map(domain => {
                const devAge = domainDevAges[domain] || 0;
                const domainDQ = ageMonths > 0 ? Math.round((devAge / ageMonths) * 100) : 0;
                const c = domainColors[domain];
                return (
                  <div key={domain} className={`rounded-lg border p-2 ${c.bg} ${c.border}`}>
                    <p className="text-xs font-semibold text-slate-600">{domain}</p>
                    <p className="text-base font-bold text-slate-900">{devAge}m dev age</p>
                    <Badge className={`text-xs mt-0.5 ${c.badge}`}>DQ {domainDQ}</Badge>
                  </div>
                );
              })}
            </div>
            {dq < 85 && (
              <Alert className="mt-3 bg-amber-50 border-amber-200 py-2">
                <AlertDescription className="text-xs text-amber-800">
                  <strong>Referral recommended:</strong> Developmental paediatrician · Physiotherapy (if GM delay) · Speech therapy (if language delay) · Occupational therapy (if FM delay). Check hearing and vision. Rule out hypothyroidism, anemia, nutritional deficiency.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Milestone Checklist */}
      {ageMonths > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <button onClick={() => setShowMilestones(v => !v)}
              className="flex items-center gap-2 text-sm font-bold text-slate-700">
              {showMilestones ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              Milestone Checklist (mark achieved ✓)
            </button>
            <button onClick={reset} className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700">
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>

          {showMilestones && (
            <div className="space-y-2">
              {DOMAINS.map(domain => {
                const c = domainColors[domain];
                const domainItems = relevant.filter(m => m.domain === domain);
                const isOpen = openDomain === domain;
                return (
                  <div key={domain} className={`rounded-xl border-2 overflow-hidden ${c.border}`}>
                    <button onClick={() => setOpenDomain(isOpen ? null : domain)}
                      className={`w-full flex items-center justify-between px-4 py-3 ${c.bg} text-left`}>
                      <span className="font-bold text-sm text-slate-800">{domain}</span>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${c.badge}`}>
                          {domainItems.filter(m => passed[`${domain}-${m.age}`]).length}/{domainItems.length} passed
                        </Badge>
                        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>
                    </button>
                    {isOpen && (
                      <div className="divide-y divide-slate-100 bg-white">
                        {domainItems.map(m => {
                          const key = `${domain}-${m.age}`;
                          const isPassed = passed[key];
                          return (
                            <button key={key} onClick={() => toggle(domain, m.age)}
                              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 transition-colors ${isPassed ? "bg-green-50" : ""}`}>
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isPassed ? "bg-green-500 border-green-500" : "border-slate-300"}`}>
                                {isPassed && <CheckCircle2 className="w-4 h-4 text-white" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-xs text-slate-700">{m.text}</span>
                              </div>
                              <Badge variant="outline" className="text-xs flex-shrink-0">{m.age}m</Badge>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Red Flags */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader className="pb-2 pt-3 px-4">
          <CardTitle className="text-sm text-red-800 flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-600" /> Absolute Red Flags (Refer immediately)
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <ul className="space-y-1">
            {[
              "No social smile by 3 months",
              "No babbling by 12 months",
              "No single words by 16 months",
              "No 2-word phrases by 24 months",
              "Any regression/loss of skills at any age",
              "Failure to walk by 18 months",
              "Not pointing to show interest by 14 months",
              "No response to own name by 12 months",
            ].map((f, i) => (
              <li key={i} className="text-xs text-red-700 flex items-start gap-1.5">
                <span className="text-red-500 font-bold mt-0.5">⚠</span>{f}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}