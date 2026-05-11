import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Printer, Copy, Calendar, ChevronDown, ChevronUp, Info } from "lucide-react";
import { toast } from "sonner";

const STEROIDS = {
  prednisolone:     { equiv: 1,     name: "Prednisolone",       halfLife: "12–36h", notes: "Morning dosing; take with food; most common in pediatrics" },
  prednisone:       { equiv: 1,     name: "Prednisone",         halfLife: "12–36h", notes: "Equivalent to prednisolone; converted in liver" },
  methylpred:       { equiv: 0.8,   name: "Methylprednisolone", halfLife: "18–36h", notes: "Preferred for IV pulse; no mineralocorticoid effect" },
  dexamethasone:    { equiv: 0.15,  name: "Dexamethasone",      halfLife: "36–72h", notes: "Long-acting; causes significant adrenal suppression" },
  hydrocortisone:   { equiv: 4,     name: "Hydrocortisone",     halfLife: "8–12h",  notes: "Mineralocorticoid activity; use for stress-dosing" },
  deflazacort:      { equiv: 1.2,   name: "Deflazacort",        halfLife: "~1.5h",  notes: "Less weight gain vs prednisolone; tablet/liquid available" },
};

const INDICATIONS = {
  nephrotic_initial:  { label: "Nephrotic — Initial (IPNA 2022)", startDose: 2, duration: 6, taperDuration: 6, maxDose: 60 },
  nephrotic_relapse:  { label: "Nephrotic — Relapse",             startDose: 2, duration: 4, taperDuration: 4, maxDose: 60 },
  lupus_nephritis:    { label: "Lupus Nephritis — Induction",     startDose: 1.5, duration: 8, taperDuration: 20, maxDose: 60 },
  vasculitis:         { label: "Vasculitis (ANCA/IgAV)",          startDose: 1.5, duration: 6, taperDuration: 18, maxDose: 60 },
  jia_flare:          { label: "JIA Flare Bridge",                startDose: 0.5, duration: 2, taperDuration: 4, maxDose: 40 },
  mas:                { label: "MAS / HLH",                       startDose: 2,   duration: 2, taperDuration: 8, maxDose: 60 },
  custom:             { label: "Custom",                           startDose: null, duration: null, taperDuration: null, maxDose: null },
};

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function SteroidTaperEngine() {
  const [steroid, setSteroid] = useState("prednisolone");
  const [indication, setIndication] = useState("nephrotic_initial");
  const [weight, setWeight] = useState("");
  const [startDose, setStartDose] = useState("");
  const [fullDurationWeeks, setFullDurationWeeks] = useState("");
  const [taperWeeks, setTaperWeeks] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [altDay, setAltDay] = useState(false);
  const [schedule, setSchedule] = useState(null);
  const [showEquiv, setShowEquiv] = useState(false);
  const [convertFrom, setConvertFrom] = useState("prednisolone");
  const [convertDose, setConvertDose] = useState("");

  const applyTemplate = (ind) => {
    setIndication(ind);
    const tmpl = INDICATIONS[ind];
    if (tmpl.startDose && weight) {
      setStartDose(Math.min(tmpl.startDose * parseFloat(weight), tmpl.maxDose || 9999).toFixed(1));
    }
    if (tmpl.duration) setFullDurationWeeks(tmpl.duration);
    if (tmpl.taperDuration) setTaperWeeks(tmpl.taperDuration);
  };

  const generate = () => {
    const w = parseFloat(weight);
    const sd = parseFloat(startDose);
    const fw = parseInt(fullDurationWeeks) || 4;
    const tw = parseInt(taperWeeks) || 4;
    if (!w || !sd) { toast.error("Enter weight and starting dose"); return; }

    const steps = [];
    let currentDose = sd;
    let weekNum = 0;
    let dayOffset = 0;

    // Full dose phase
    steps.push({ week: `Weeks 1–${fw}`, dose: `${sd} mg`, freq: "Daily", dates: `${addDays(startDate, 0)} → ${addDays(startDate, fw * 7 - 1)}`, note: "Full dose phase" });
    dayOffset = fw * 7;

    // Taper phase — reduce by ~25–30% every 2 weeks
    const taperSteps = Math.ceil(tw / 2);
    const reductionFactor = Math.pow(0.25, 1 / taperSteps); // approach 25% of start dose
    let taperDose = sd;
    for (let i = 0; i < taperSteps; i++) {
      taperDose = taperDose * 0.7;
      const from = addDays(startDate, dayOffset);
      const to = addDays(startDate, dayOffset + 13);
      const doseStr = altDay && i >= taperSteps - 2
        ? `${Math.round(taperDose * 2)} mg alternate day`
        : `${Math.max(taperDose, 2.5).toFixed(1)} mg`;
      steps.push({ week: `Taper step ${i + 1}`, dose: doseStr, freq: altDay && i >= taperSteps - 2 ? "Alternate Day" : "Daily", dates: `${from} → ${to}`, note: i === taperSteps - 1 ? "⚠️ Check adrenal axis before stopping" : "" });
      dayOffset += 14;
    }

    // Stop
    steps.push({ week: "Stop / Review", dose: "0 mg", freq: "—", dates: addDays(startDate, dayOffset), note: "Consider ACTH stimulation test if on steroids >3 months" });

    setSchedule({ steps, totalWeeks: fw + tw, drug: STEROIDS[steroid].name });
  };

  const equivalentDose = (fromSteroid, dose, toSteroid) => {
    const fromRel = STEROIDS[fromSteroid]?.equiv || 1;
    const toRel = STEROIDS[toSteroid]?.equiv || 1;
    return ((parseFloat(dose) * fromRel) / toRel).toFixed(2);
  };

  const copySchedule = () => {
    if (!schedule) return;
    const text = [`STEROID TAPER SCHEDULE — ${schedule.drug}`, `Patient Weight: ${weight} kg`, `Generated: ${new Date().toLocaleDateString()}`, "",
      ...schedule.steps.map(s => `${s.week}: ${s.dose} ${s.freq} | ${s.dates}${s.note ? " | " + s.note : ""}`)
    ].join("\n");
    navigator.clipboard.writeText(text);
    toast.success("Schedule copied to clipboard");
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-orange-600 to-red-600 p-5 text-white">
        <h2 className="text-xl font-bold flex items-center gap-2">💊 Steroid Taper Engine</h2>
        <p className="text-orange-100 text-sm mt-1">Pediatric taper schedule generator with equivalence conversion and safety reminders</p>
      </div>

      {/* Safety alerts */}
      <Alert className="bg-red-50 border-red-200">
        <AlertTriangle className="w-4 h-4 text-red-600" />
        <AlertDescription className="text-red-800 text-xs space-y-1">
          <strong>Safety Reminders:</strong>
          <ul className="list-disc ml-4 mt-1 space-y-0.5">
            <li>Sick day rule: Double dose during fever/illness (&gt;38.5°C), never stop abruptly</li>
            <li>Adrenal suppression risk after &gt;2 weeks at &gt;0.5 mg/kg/day</li>
            <li>Check adrenal axis before stopping if &gt;3 months treatment</li>
            <li>Live vaccines contraindicated during immunosuppressive doses</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Steroid Equivalence Converter */}
      <Card>
        <CardHeader className="pb-2 cursor-pointer" onClick={() => setShowEquiv(o => !o)}>
          <CardTitle className="text-sm flex items-center justify-between">
            ⚖️ Steroid Equivalence Converter
            {showEquiv ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </CardTitle>
        </CardHeader>
        {showEquiv && (
          <CardContent className="pt-0 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">From Drug</Label>
                <Select value={convertFrom} onValueChange={setConvertFrom}>
                  <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(STEROIDS).map(([k, v]) => <SelectItem key={k} value={k}>{v.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Dose (mg)</Label>
                <Input type="number" value={convertDose} onChange={e => setConvertDose(e.target.value)} className="mt-1 h-8 text-xs" />
              </div>
            </div>
            {convertDose && (
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(STEROIDS).filter(([k]) => k !== convertFrom).map(([k, v]) => (
                  <div key={k} className="bg-slate-50 rounded-lg p-2 text-xs">
                    <span className="font-semibold">{v.name}:</span> {equivalentDose(convertFrom, convertDose, k)} mg
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Taper Generator */}
      <Card>
        <CardHeader className="bg-orange-50 border-b pb-3">
          <CardTitle className="text-sm">📅 Taper Schedule Generator</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Steroid</Label>
              <Select value={steroid} onValueChange={setSteroid}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(STEROIDS).map(([k, v]) => <SelectItem key={k} value={k}>{v.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Indication Template</Label>
              <Select value={indication} onValueChange={applyTemplate}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(INDICATIONS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Weight (kg)</Label>
              <Input type="number" value={weight} onChange={e => setWeight(e.target.value)} className="mt-1" placeholder="e.g. 25" />
            </div>
            <div>
              <Label className="text-xs">Starting Dose (mg/day)</Label>
              <Input type="number" value={startDose} onChange={e => setStartDose(e.target.value)} className="mt-1" placeholder="e.g. 40" />
            </div>
            <div>
              <Label className="text-xs">Full Dose (weeks)</Label>
              <Input type="number" value={fullDurationWeeks} onChange={e => setFullDurationWeeks(e.target.value)} className="mt-1" placeholder="e.g. 6" />
            </div>
            <div>
              <Label className="text-xs">Taper Duration (weeks)</Label>
              <Input type="number" value={taperWeeks} onChange={e => setTaperWeeks(e.target.value)} className="mt-1" placeholder="e.g. 6" />
            </div>
            <div>
              <Label className="text-xs">Start Date</Label>
              <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1" />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={altDay} onChange={e => setAltDay(e.target.checked)} className="w-4 h-4" />
                <span className="text-sm font-medium">Alternate-day phase at end</span>
              </label>
            </div>
          </div>

          {steroid && (
            <div className="bg-orange-50 rounded-lg p-3 text-xs text-orange-800">
              <strong>Drug note:</strong> {STEROIDS[steroid].notes} | Half-life: {STEROIDS[steroid].halfLife}
            </div>
          )}

          <Button onClick={generate} className="w-full bg-orange-600 hover:bg-orange-700">
            <Calendar className="w-4 h-4 mr-2" />
            Generate Taper Schedule
          </Button>
        </CardContent>
      </Card>

      {/* Generated Schedule */}
      {schedule && (
        <Card className="border-2 border-orange-300">
          <CardHeader className="bg-orange-50 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">📋 Taper Schedule — {schedule.drug}</CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={copySchedule}><Copy className="w-3 h-3 mr-1" /> Copy</Button>
                <Button size="sm" variant="outline" onClick={() => window.print()}><Printer className="w-3 h-3 mr-1" /> Print</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {schedule.steps.map((step, i) => (
                <div key={i} className={`p-3 grid grid-cols-4 gap-2 text-sm ${i % 2 === 0 ? "bg-white" : "bg-slate-50"}`}>
                  <div className="font-semibold text-slate-800">{step.week}</div>
                  <div className="font-bold text-orange-700">{step.dose}</div>
                  <div className="text-slate-600">{step.dates}</div>
                  <div className="text-xs text-amber-700">{step.note}</div>
                </div>
              ))}
            </div>
          </CardContent>
          <div className="p-3 bg-amber-50 border-t text-xs text-amber-800 space-y-1">
            <p><strong>Total duration:</strong> ~{schedule.totalWeeks} weeks</p>
            <p><strong>Sick day rule:</strong> Double dose during intercurrent illness. Never skip or stop abruptly.</p>
            <p><strong>School:</strong> Inform school nurse about immunosuppressive state; avoid contact with chickenpox/measles.</p>
          </div>
        </Card>
      )}
    </div>
  );
}