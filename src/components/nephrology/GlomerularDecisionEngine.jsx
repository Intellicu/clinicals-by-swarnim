import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, AlertTriangle, Microscope, ChevronRight, RotateCcw, Dna, Beaker, Pill, Info } from "lucide-react";

// ── Syndrome Classification Engine ───────────────────────────────────────────
function classifySyndrome({ edema, hematuria, proteinuria, bp }) {
  const highProtein = ["Nephrotic range (>3+ / UPCR>2)", "Massive (4+)"].includes(proteinuria);
  const modProtein = proteinuria === "Moderate (2+)";
  const elevated = ["Stage 1 HTN", "Stage 2 HTN / Hypertensive urgency"].includes(bp);
  const hasHematuria = hematuria === "yes";
  const hasEdema = edema === "yes";

  if (highProtein && hasEdema && !hasHematuria) {
    return { syndrome: "Nephrotic Syndrome", color: "bg-blue-600", confidence: "High", details: "Classic triad: heavy proteinuria + edema + hypoalbuminemia. Proceed to NS pathway." };
  }
  if (hasHematuria && elevated && (modProtein || highProtein)) {
    return { syndrome: "Mixed Nephrotic-Nephritic Syndrome", color: "bg-purple-600", confidence: "High", details: "Both nephrotic (proteinuria + edema) and nephritic (hematuria + HTN) features. Urgent biopsy likely needed." };
  }
  if (hasHematuria && elevated && !highProtein) {
    return { syndrome: "Nephritic Syndrome", color: "bg-orange-600", confidence: "High", details: "Hematuria + hypertension ± mild proteinuria. Think PSGN, IgAN, vasculitis, lupus." };
  }
  if (highProtein && hasHematuria) {
    return { syndrome: "Mixed Nephrotic-Nephritic", color: "bg-purple-600", confidence: "Medium", details: "Heavy proteinuria with hematuria — overlapping features. Biopsy required for classification." };
  }
  if (hasHematuria && !elevated && !highProtein) {
    return { syndrome: "Isolated Hematuria", color: "bg-pink-600", confidence: "High", details: "Isolated hematuria without nephrotic/nephritic features. Consider Alport, thin GBM, IgAN, PSGN early." };
  }
  if (modProtein && !hasHematuria && !hasEdema) {
    return { syndrome: "Asymptomatic Proteinuria", color: "bg-teal-600", confidence: "Medium", details: "Moderate proteinuria without overt syndrome. Orthostatic? Transient? Needs further evaluation." };
  }
  return { syndrome: "Insufficient Data / Unclear", color: "bg-slate-500", confidence: "Low", details: "Provide more details for classification." };
}

// ── Etiology Decision Tree ───────────────────────────────────────────────────
function getEtiology({ syndrome, ageYears, complement, steroidResponse, familyHistory }) {
  const age = parseFloat(ageYears);
  const suggestions = [];
  const alerts = [];

  if (syndrome?.includes("Nephrotic")) {
    if (age < 1) {
      suggestions.push({ dx: "Congenital Nephrotic Syndrome", confidence: "HIGH", action: "Genetic panel MANDATORY: NPHS1, NPHS2, WT1, LAMB2. DO NOT give steroids." });
      alerts.push("🔴 CRITICAL: CNS < 1 year — steroids contraindicated. Genetic testing urgent.");
    } else if (age <= 12) {
      suggestions.push({ dx: "Minimal Change Disease (MCD)", confidence: "HIGH", action: "Empirical prednisolone 60 mg/m²/day without biopsy (IPNA 2023). Biopsy if SRNS." });
      suggestions.push({ dx: "FSGS", confidence: "MEDIUM", action: "Consider if atypical features or SRNS. Genetic testing (NPHS2, WT1, ACTN4, TRPC6)." });
    } else {
      suggestions.push({ dx: "MCD / FSGS / Membranous", confidence: "MEDIUM", action: "Biopsy recommended in adolescents/adults. Check PLA2R antibody for MN." });
    }
    if (familyHistory === "yes") {
      suggestions.push({ dx: "Genetic Podocytopathy", confidence: "HIGH", action: "Genetic panel: NPHS1, NPHS2, WT1, INF2, ACTN4, TRPC6. Do NOT give steroids until result." });
      alerts.push("⚠️ Family history positive — genetic NS suspected. Avoid immunosuppression pending genetics.");
    }
    if (steroidResponse === "resistant") {
      suggestions.push({ dx: "SRNS (Genetic or Immune-mediated)", confidence: "HIGH", action: "Kidney biopsy + genetic panel + CNI (Tacrolimus/CSA). Consider Rituximab for non-genetic SRNS." });
      alerts.push("🟠 Steroid Resistant NS — biopsy and genetic testing mandatory.");
    }
  }

  if (syndrome?.includes("Nephritic") || syndrome?.includes("Mixed")) {
    if (complement === "low") {
      suggestions.push({ dx: "PSGN", confidence: "HIGH", action: "Check ASOT, anti-DNAse B. Supportive care. C3 should normalize by 8 weeks." });
      suggestions.push({ dx: "Lupus Nephritis (Class III/IV)", confidence: "MEDIUM", action: "Check ANA, dsDNA, C3, C4, anti-Sm. Biopsy for class." });
      suggestions.push({ dx: "MPGN / C3 Glomerulopathy", confidence: "MEDIUM", action: "Check C3, C4, AH50, complement genetics. Biopsy mandatory." });
      if (age > 8) suggestions.push({ dx: "Lupus Nephritis", confidence: "HIGH", action: "Check ANA, dsDNA, C3/C4. Urgent biopsy for ISN/RPS classification." });
    }
    if (complement === "normal") {
      suggestions.push({ dx: "IgA Nephropathy / IgAV (HSP)", confidence: "HIGH", action: "Check ASOT, IgA levels. Look for purpura (HSPN). Oxford MEST-C biopsy if persistent." });
      suggestions.push({ dx: "ANCA-Associated GN", confidence: "MEDIUM", action: "Check ANCA (PR3+MPO), ANCA IIF. Urgent biopsy — treat aggressively if positive." });
      suggestions.push({ dx: "Anti-GBM Disease", confidence: "MEDIUM", action: "Check anti-GBM antibody. MEDICAL EMERGENCY if positive — plasma exchange immediately." });
    }
  }

  if (syndrome?.includes("Isolated Hematuria")) {
    suggestions.push({ dx: "IgA Nephropathy", confidence: "MEDIUM", action: "Episodic macroscopic hematuria with URTI — classic IgAN. Biopsy if proteinuria develops." });
    suggestions.push({ dx: "Alport Syndrome / Thin GBM", confidence: "MEDIUM", action: "Family history of hematuria/CKD/hearing loss. Genetic testing: COL4A3/4/5." });
    if (familyHistory === "yes") alerts.push("⚠️ Familial hematuria — suspect Alport syndrome. Check hearing (audiometry), COL4 genetics.");
  }

  return { suggestions, alerts };
}

// ── Severity Scoring ─────────────────────────────────────────────────────────
function scoreSeverity({ proteinuria, albumin, akiPresent }) {
  let score = 0;
  const flags = [];

  if (["Nephrotic range (>3+ / UPCR>2)", "Massive (4+)"].includes(proteinuria)) { score += 2; flags.push("Heavy proteinuria"); }
  else if (proteinuria === "Moderate (2+)") { score += 1; flags.push("Moderate proteinuria"); }

  const alb = parseFloat(albumin);
  if (!isNaN(alb)) {
    if (alb < 1.5) { score += 3; flags.push("Severe hypoalbuminemia <1.5 g/dL — infection/VTE risk"); }
    else if (alb < 2.5) { score += 2; flags.push("Moderate hypoalbuminemia <2.5 g/dL"); }
    else if (alb < 3.0) { score += 1; flags.push("Mild hypoalbuminemia"); }
  }

  if (akiPresent === "yes") { score += 3; flags.push("AKI present — urgent evaluation"); }

  let level, color;
  if (score >= 6) { level = "SEVERE — ICU/HDU level care"; color = "bg-red-600"; }
  else if (score >= 4) { level = "MODERATE-SEVERE — Urgent admission"; color = "bg-orange-500"; }
  else if (score >= 2) { level = "MODERATE — Close monitoring"; color = "bg-amber-500"; }
  else { level = "MILD — Outpatient management possible"; color = "bg-green-600"; }

  return { score, level, color, flags };
}

// ── SRNS / Relapse Tracker ───────────────────────────────────────────────────
function classifyRelapsePattern({ relapseCount, intervalMonths, steroidDependence }) {
  if (steroidDependence === "yes") return { classification: "SDNS (Steroid-Dependent NS)", color: "bg-red-600", action: "Steroid-sparing therapy: MMF, Levamisole, CNI, or Rituximab per IPNA 2023." };
  const n = parseFloat(relapseCount);
  const mo = parseFloat(intervalMonths);
  if (n >= 2 && mo <= 6) return { classification: "FRNS (Frequently Relapsing NS)", color: "bg-orange-600", action: "Cyclophosphamide 2 mg/kg × 8-12 wks OR Levamisole OR MMF. Consider Rituximab for persistent FRNS." };
  if (n >= 3 && mo <= 12) return { classification: "FRNS (Frequently Relapsing NS)", color: "bg-orange-600", action: "Same as above. Rituximab highly effective." };
  return { classification: "INFREQUENTLY Relapsing NS (IFRNS)", color: "bg-blue-600", action: "Treat each relapse with standard prednisolone course. Annual review." };
}

export default function GlomerularDecisionEngine() {
  const [step, setStep] = useState("quick");
  const [inputs, setInputs] = useState({ edema: "", hematuria: "", proteinuria: "", bp: "" });
  const [etioInputs, setEtioInputs] = useState({ ageYears: "", complement: "", steroidResponse: "", familyHistory: "" });
  const [sevInputs, setSevInputs] = useState({ albumin: "", akiPresent: "" });
  const [relapseInputs, setRelapseInputs] = useState({ relapseCount: "", intervalMonths: "", steroidDependence: "" });
  const [result, setResult] = useState(null);

  const syndromeResult = inputs.edema && inputs.hematuria && inputs.proteinuria && inputs.bp ? classifySyndrome(inputs) : null;
  const etiologyResult = syndromeResult && etioInputs.ageYears && etioInputs.complement ? getEtiology({ syndrome: syndromeResult.syndrome, ...etioInputs }) : null;
  const severityResult = sevInputs.akiPresent ? scoreSeverity({ proteinuria: inputs.proteinuria, ...sevInputs }) : null;
  const relapseResult = relapseInputs.relapseCount && relapseInputs.intervalMonths ? classifyRelapsePattern(relapseInputs) : null;

  const reset = () => {
    setInputs({ edema: "", hematuria: "", proteinuria: "", bp: "" });
    setEtioInputs({ ageYears: "", complement: "", steroidResponse: "", familyHistory: "" });
    setSevInputs({ albumin: "", akiPresent: "" });
    setRelapseInputs({ relapseCount: "", intervalMonths: "", steroidDependence: "" });
    setResult(null);
    setStep("quick");
  };

  const Sel = ({ label, value, onChange, opts }) => (
    <div>
      <label className="text-xs font-semibold text-slate-600">{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue placeholder="Select..." /></SelectTrigger>
        <SelectContent>{opts.map(o => <SelectItem key={o} value={o} className="text-xs">{o}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="space-y-4">
      <Alert className="bg-indigo-50 border-indigo-200">
        <Microscope className="w-4 h-4 text-indigo-600" />
        <AlertDescription className="text-xs text-indigo-900">
          <strong>Glomerular Decision Engine</strong> — Interactive syndrome classification, etiology tree, severity scoring, and relapse tracker. Evidence: KDIGO 2021/2024, IPNA 2023, ACR/EULAR.
        </AlertDescription>
      </Alert>

      {/* Tab navigation */}
      <div className="flex gap-1 flex-wrap">
        {[
          { id: "quick", label: "1. Quick Classification" },
          { id: "etiology", label: "2. Etiology Tree" },
          { id: "severity", label: "3. Severity Score" },
          { id: "relapse", label: "4. Relapse Tracker" },
        ].map(t => (
          <Button key={t.id} size="sm" onClick={() => setStep(t.id)}
            className={`text-xs h-8 ${step === t.id ? "bg-indigo-600 text-white" : "bg-white border border-slate-300 text-slate-600 hover:bg-slate-50"}`}>
            {t.label}
          </Button>
        ))}
        <Button size="sm" onClick={reset} variant="outline" className="text-xs h-8 text-red-600 border-red-200 ml-auto">
          <RotateCcw className="w-3 h-3 mr-1" />Reset
        </Button>
      </div>

      {/* ── Step 1: Quick Classification ── */}
      {step === "quick" && (
        <Card className="bg-white border-2 border-indigo-200">
          <CardHeader className="bg-indigo-50 border-b py-3">
            <CardTitle className="text-sm font-bold">Quick Clinical Entry — Syndrome Classification</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Sel label="Edema" value={inputs.edema} onChange={v => setInputs(p => ({ ...p, edema: v }))}
                opts={["yes", "no"]} />
              <Sel label="Hematuria (macro/micro)" value={inputs.hematuria} onChange={v => setInputs(p => ({ ...p, hematuria: v }))}
                opts={["yes", "no"]} />
              <Sel label="Proteinuria level" value={inputs.proteinuria} onChange={v => setInputs(p => ({ ...p, proteinuria: v }))}
                opts={["None", "Trace/1+", "Moderate (2+)", "Nephrotic range (>3+ / UPCR>2)", "Massive (4+)"]} />
              <Sel label="Blood Pressure" value={inputs.bp} onChange={v => setInputs(p => ({ ...p, bp: v }))}
                opts={["Normal", "Elevated/Stage 1", "Stage 1 HTN", "Stage 2 HTN / Hypertensive urgency"]} />
            </div>

            {syndromeResult && (
              <div className={`rounded-xl p-4 mt-2 ${syndromeResult.color} text-white shadow-lg`}>
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-black text-lg">{syndromeResult.syndrome}</span>
                  <Badge className="bg-white/20 text-white border-white/30 text-xs">Confidence: {syndromeResult.confidence}</Badge>
                </div>
                <p className="text-sm text-white/90">{syndromeResult.details}</p>
                <Button size="sm" onClick={() => setStep("etiology")} className="mt-3 bg-white/20 hover:bg-white/30 text-white border-white/30 text-xs">
                  Next: Etiology Differentiation <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Step 2: Etiology Tree ── */}
      {step === "etiology" && (
        <Card className="bg-white border-2 border-purple-200">
          <CardHeader className="bg-purple-50 border-b py-3">
            <CardTitle className="text-sm font-bold">Etiology Differentiation</CardTitle>
            {syndromeResult && <Badge className={`${syndromeResult.color} text-white text-xs w-fit mt-1`}>{syndromeResult.syndrome}</Badge>}
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600">Age (years)</label>
                <Input type="number" value={etioInputs.ageYears} onChange={e => setEtioInputs(p => ({ ...p, ageYears: e.target.value }))} className="mt-1 h-8 text-xs" placeholder="e.g. 8" />
              </div>
              <Sel label="Complement (C3)" value={etioInputs.complement} onChange={v => setEtioInputs(p => ({ ...p, complement: v }))}
                opts={["low", "normal", "not done"]} />
              <Sel label="Steroid Response" value={etioInputs.steroidResponse} onChange={v => setEtioInputs(p => ({ ...p, steroidResponse: v }))}
                opts={["sensitive", "resistant", "dependent", "not tried"]} />
              <Sel label="Family History Kidney" value={etioInputs.familyHistory} onChange={v => setEtioInputs(p => ({ ...p, familyHistory: v }))}
                opts={["yes", "no", "unknown"]} />
            </div>

            {etiologyResult?.alerts?.map((a, i) => (
              <Alert key={i} className="bg-red-50 border-red-300 py-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <AlertDescription className="text-xs text-red-900 font-semibold ml-1">{a}</AlertDescription>
              </Alert>
            ))}

            {etiologyResult?.suggestions?.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-purple-800 uppercase tracking-wide">Probable Diagnoses (ranked)</p>
                {etiologyResult.suggestions.map((s, i) => (
                  <div key={i} className="border-l-4 border-purple-400 bg-purple-50 rounded-r-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-black text-slate-800 text-sm">{i + 1}. {s.dx}</span>
                      <Badge className={`text-xs ${s.confidence === "HIGH" ? "bg-red-600" : s.confidence === "MEDIUM" ? "bg-amber-600" : "bg-blue-600"} text-white`}>{s.confidence}</Badge>
                    </div>
                    <p className="text-xs text-purple-900"><ChevronRight className="w-3 h-3 inline mr-1" />{s.action}</p>
                  </div>
                ))}
                <Button size="sm" onClick={() => setStep("severity")} className="bg-purple-600 text-white text-xs h-8 mt-2">
                  Next: Severity Scoring <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Step 3: Severity ── */}
      {step === "severity" && (
        <Card className="bg-white border-2 border-orange-200">
          <CardHeader className="bg-orange-50 border-b py-3">
            <CardTitle className="text-sm font-bold">Severity Scoring</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600">Serum Albumin (g/dL)</label>
                <Input type="number" step="0.1" value={sevInputs.albumin} onChange={e => setSevInputs(p => ({ ...p, albumin: e.target.value }))} className="mt-1 h-8 text-xs" placeholder="e.g. 2.1" />
              </div>
              <Sel label="AKI Present" value={sevInputs.akiPresent} onChange={v => setSevInputs(p => ({ ...p, akiPresent: v }))}
                opts={["yes", "no"]} />
            </div>

            {severityResult && (
              <div className={`${severityResult.color} text-white rounded-xl p-4 shadow`}>
                <p className="font-black text-lg">Score: {severityResult.score}/8 — {severityResult.level}</p>
                <ul className="mt-2 space-y-1">
                  {severityResult.flags.map((f, i) => (
                    <li key={i} className="text-sm text-white/90 flex items-start gap-1">
                      <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />{f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Biopsy Triggers */}
            <Card className="bg-slate-50 border-2 border-slate-200">
              <CardHeader className="py-2 px-3 border-b bg-slate-100">
                <CardTitle className="text-xs font-bold flex items-center gap-1"><Microscope className="w-3 h-3" />Kidney Biopsy Trigger Checklist</CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-1 text-xs text-slate-800">
                {[
                  { crit: "Age <1y or >12y with nephrotic syndrome", trigger: true },
                  { crit: "Steroid-resistant NS at 8 weeks (SRNS)", trigger: true },
                  { crit: "C3 persistently low >8 weeks", trigger: true },
                  { crit: "Rapidly progressive GN (rising Cr)", trigger: true },
                  { crit: "Nephritic syndrome with suspected LN/ANCA/Anti-GBM", trigger: true },
                  { crit: "Hematuria + proteinuria + family history (Alport suspect)", trigger: false },
                  { crit: "Adult nephrotic syndrome (all causes require biopsy)", trigger: true },
                ].map((item, i) => (
                  <div key={i} className={`flex items-start gap-2 p-1.5 rounded ${item.trigger ? "bg-red-50" : "bg-blue-50"}`}>
                    <span>{item.trigger ? "🔴" : "🔵"}</span>
                    <span>{item.crit}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Genetic Testing Prompts */}
            <Card className="bg-purple-50 border-2 border-purple-200">
              <CardHeader className="py-2 px-3 border-b bg-purple-100">
                <CardTitle className="text-xs font-bold flex items-center gap-1"><Dna className="w-3 h-3 text-purple-700" />When to Order Genetic Testing</CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-1 text-xs text-purple-900">
                {[
                  "SRNS at any age — podocyte gene panel (NPHS1, NPHS2, WT1, ACTN4, TRPC6, INF2)",
                  "CNS (<3 months) — mandatory before any treatment",
                  "Familial hematuria / CKD — COL4A3, COL4A4, COL4A5 (Alport panel)",
                  "Cystic kidney disease — PKD1, PKD2, PKHD1, NPHP panel",
                  "FSGS in young child / family history — full podocyte panel",
                  "aHUS — CFH, CFI, CD46, CFB, C3, THBD, DGKE",
                  "C3 Glomerulopathy — CFH, CFI, CD46, CFB, C3, CFHR1-5",
                ].map((s, i) => <div key={i} className="flex items-start gap-1.5 p-1 rounded bg-purple-100"><Dna className="w-3 h-3 flex-shrink-0 text-purple-600 mt-0.5" />{s}</div>)}
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      )}

      {/* ── Step 4: Relapse Tracker ── */}
      {step === "relapse" && (
        <Card className="bg-white border-2 border-green-200">
          <CardHeader className="bg-green-50 border-b py-3">
            <CardTitle className="text-sm font-bold">NS Relapse Classification & Steroid Toxicity Tracker</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600">Number of Relapses (6–12 months)</label>
                <Input type="number" value={relapseInputs.relapseCount} onChange={e => setRelapseInputs(p => ({ ...p, relapseCount: e.target.value }))} className="mt-1 h-8 text-xs" placeholder="e.g. 3" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Time Frame (months)</label>
                <Input type="number" value={relapseInputs.intervalMonths} onChange={e => setRelapseInputs(p => ({ ...p, intervalMonths: e.target.value }))} className="mt-1 h-8 text-xs" placeholder="e.g. 6" />
              </div>
              <Sel label="Steroid Dependent?" value={relapseInputs.steroidDependence} onChange={v => setRelapseInputs(p => ({ ...p, steroidDependence: v }))}
                opts={["yes", "no"]} />
            </div>

            {relapseResult && (
              <div className={`${relapseResult.color} text-white rounded-xl p-4 shadow`}>
                <p className="font-black text-lg">{relapseResult.classification}</p>
                <p className="text-sm mt-1 text-white/90">{relapseResult.action}</p>
              </div>
            )}

            {/* ISKDC First Episode Protocol */}
            <Card className="bg-blue-50 border-2 border-blue-200">
              <CardHeader className="py-2 px-3 border-b bg-blue-100">
                <CardTitle className="text-xs font-bold flex items-center gap-1"><Pill className="w-3 h-3 text-blue-700" />First Episode Prednisolone Protocol (IPNA 2023)</CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { phase: "Induction (4 weeks)", dose: "Prednisolone 60 mg/m²/day (max 60 mg)", note: "Daily until remission then at least 4 weeks" },
                    { phase: "Taper (4–8 weeks)", dose: "40 mg/m² alternate days (or 40 mg/m²/day →)", note: "Gradual taper over 4–8 weeks" },
                    { phase: "Remission Target", dose: "Urine protein negative × 3 consecutive days", note: "Defines complete remission" },
                    { phase: "Total Duration", dose: "Minimum 12 weeks (IPNA 2023 extended)", note: "Longer course reduces relapse rate" },
                  ].map((r, i) => (
                    <div key={i} className="bg-white rounded p-2 border border-blue-200">
                      <p className="font-bold text-blue-800">{r.phase}</p>
                      <p className="text-blue-700 font-semibold mt-0.5">{r.dose}</p>
                      <p className="text-slate-500 mt-0.5 text-[10px]">{r.note}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Steroid Toxicity Checklist */}
            <Card className="bg-amber-50 border-2 border-amber-200">
              <CardHeader className="py-2 px-3 border-b bg-amber-100">
                <CardTitle className="text-xs font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-amber-700" />Steroid Toxicity Monitoring Checklist</CardTitle>
              </CardHeader>
              <CardContent className="p-3 text-xs space-y-1 text-amber-900">
                {[
                  ["Growth velocity (ht velocity cm/yr)", "Every 6 months — steroid-induced growth failure"],
                  ["Blood pressure", "Every visit — steroid-induced hypertension"],
                  ["BMI / Cushingoid features", "Every visit — weight, striae, buffalo hump"],
                  ["Bone density (DXA)", "Annually if on steroids >3 months — osteoporosis"],
                  ["Fasting glucose/HbA1c", "Every 6 months — steroid-induced diabetes"],
                  ["Eye pressure (IOP)", "Annually — steroid-induced glaucoma/cataract"],
                  ["Mood/behaviour", "Every visit — neuropsychiatric effects"],
                  ["Vitamin D + Calcium", "Supplementation if on long-term steroids"],
                ].map(([item, note], i) => (
                  <div key={i} className="flex items-start gap-1.5 p-1.5 bg-amber-100 rounded">
                    <CheckCircle2 className="w-3 h-3 text-amber-700 flex-shrink-0 mt-0.5" />
                    <div><span className="font-semibold">{item}</span> — <span className="text-amber-700">{note}</span></div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      )}
    </div>
  );
}