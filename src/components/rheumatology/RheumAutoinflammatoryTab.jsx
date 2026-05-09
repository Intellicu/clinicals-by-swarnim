import React, { useState } from "react";
import { AUTOINFLAMMATORY_CONDITIONS, FEVER_PATTERN_ENGINE } from "@/lib/rheumatology/RheumAutoinflammatoryData";
import RheumPathwayCard from "./RheumPathwayCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Flame, ChevronDown, ChevronUp } from "lucide-react";

function FeverPatternEngine() {
  const [open, setOpen] = useState(false);
  const [inputs, setInputs] = useState({ duration: "", interval: "", aphthae: false, pharyngitis: false, adenitis: false, cervicalAdenopathy: false, periorbitalOedema: false, coldTriggered: false, urticaria: false, regularInterval: false, ethnicity: [] });
  const [results, setResults] = useState(null);

  const ethnicityOptions = ["Mediterranean", "Middle East", "Indian", "North African", "European", "Other"];

  const toggleEthnicity = (e) => {
    setInputs(prev => ({
      ...prev,
      ethnicity: prev.ethnicity.includes(e) ? prev.ethnicity.filter(x => x !== e) : [...prev.ethnicity, e],
    }));
  };

  const run = () => {
    const processed = { ...inputs, duration: parseFloat(inputs.duration) || 0, interval: parseFloat(inputs.interval) || 0 };
    setResults(FEVER_PATTERN_ENGINE.differentials(processed));
  };

  return (
    <Card className="bg-white border-2 border-amber-200">
      <CardHeader className="pb-2 cursor-pointer" onClick={() => setOpen(o => !o)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-600" />
            <span className="font-bold text-sm text-slate-900">🔥 Fever Pattern Engine</span>
            <Badge className="bg-amber-100 text-amber-800 text-xs border-0">Differential Aid</Badge>
          </div>
          {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
        <p className="text-xs text-slate-500">PFAPA · FMF · TRAPS · CAPS · MKD pattern differentiator</p>
      </CardHeader>
      {open && (
        <CardContent className="pt-0 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-slate-600">Fever duration (days)</label>
              <input type="number" value={inputs.duration} onChange={e => setInputs(p => ({ ...p, duration: e.target.value }))}
                className="w-full mt-1 text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="e.g. 3" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Interval between attacks (weeks)</label>
              <input type="number" value={inputs.interval} onChange={e => setInputs(p => ({ ...p, interval: e.target.value }))}
                className="w-full mt-1 text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="e.g. 6" />
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-600 mb-1">Features present</p>
            <div className="flex flex-wrap gap-2">
              {[
                ["aphthae", "Aphthous ulcers"],
                ["pharyngitis", "Pharyngitis"],
                ["adenitis", "Cervical adenitis"],
                ["cervicalAdenopathy", "Cervical lymphadenopathy"],
                ["periorbitalOedema", "Periorbital oedema"],
                ["coldTriggered", "Cold-triggered"],
                ["urticaria", "Urticarial rash"],
                ["regularInterval", "Regular interval"],
              ].map(([key, label]) => (
                <button key={key} onClick={() => setInputs(p => ({ ...p, [key]: !p[key] }))}
                  className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-all ${inputs[key] ? "bg-amber-500 text-white border-amber-600" : "bg-white text-slate-600 border-slate-300"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-600 mb-1">Ethnicity</p>
            <div className="flex flex-wrap gap-1.5">
              {ethnicityOptions.map(e => (
                <button key={e} onClick={() => toggleEthnicity(e)}
                  className={`text-xs px-2 py-1 rounded-full border transition-all ${inputs.ethnicity.includes(e) ? "bg-blue-500 text-white border-blue-600" : "bg-white text-slate-600 border-slate-300"}`}>
                  {e}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={run} className="w-full bg-amber-500 hover:bg-amber-600 text-white text-xs">
            <Flame className="w-3 h-3 mr-1" />Analyse Fever Pattern
          </Button>

          {results && (
            <div className="space-y-2 border-t pt-3">
              <p className="text-xs font-bold text-slate-700">Differential Suggestions</p>
              {results.map((r, i) => (
                <div key={i} className={`p-2 rounded-lg border text-xs ${r.probability === "High" ? "bg-amber-50 border-amber-200" : "bg-slate-50 border-slate-200"}`}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-slate-900">{r.diagnosis}</span>
                    <Badge className={`text-xs border-0 ${r.probability === "High" ? "bg-amber-500 text-white" : "bg-slate-300 text-slate-700"}`}>{r.probability}</Badge>
                  </div>
                  <p className="text-slate-600">{r.key}</p>
                </div>
              ))}
              <p className="text-xs text-slate-400 italic">Clinical tool only — genetic testing required for definitive diagnosis.</p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

export default function RheumAutoinflammatoryTab({ isAdmin, savedUpdates, onSaveUpdate }) {
  return (
    <div className="space-y-3">
      <Alert className="bg-amber-50 border-amber-200">
        <Flame className="w-4 h-4 text-amber-600" />
        <AlertDescription className="text-xs text-amber-900">
          <strong>Autoinflammatory Expansion:</strong> CAPS, TRAPS, MKD, DADA2, SAVI, Blau Syndrome + Fever Pattern Engine. IL-1 inhibitor era — IL-1 pathway diseases respond dramatically.
        </AlertDescription>
      </Alert>

      <FeverPatternEngine />

      <div className="flex items-center gap-2">
        <Badge className="bg-amber-600 text-white text-xs">Autoinflammatory Layer</Badge>
        <span className="text-xs text-slate-500">{AUTOINFLAMMATORY_CONDITIONS.length} conditions</span>
      </div>

      {AUTOINFLAMMATORY_CONDITIONS.map(condition => (
        <RheumPathwayCard
          key={condition.id}
          condition={condition}
          isAdmin={isAdmin}
          savedUpdates={savedUpdates}
          onSaveUpdate={onSaveUpdate}
        />
      ))}
    </div>
  );
}