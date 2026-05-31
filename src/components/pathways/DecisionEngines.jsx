/**
 * Shared Decision Engines — reusable algorithmic clinical decision trees
 * Used across multiple pathways to avoid logic duplication.
 * Each engine is a self-contained interactive component.
 */
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ArrowDown, CheckCircle2, Circle, AlertTriangle, Calculator, Zap } from "lucide-react";
import { Link } from "react-router-dom";

// ── Shared Primitives ─────────────────────────────────────────────────────────

function StepNode({ label, color = "blue", sub, isActive, onClick, result }) {
  const colors = {
    blue: "border-blue-400 bg-blue-50 text-blue-900",
    red: "border-red-400 bg-red-50 text-red-900",
    green: "border-green-400 bg-green-50 text-green-900",
    amber: "border-amber-400 bg-amber-50 text-amber-900",
    violet: "border-violet-400 bg-violet-50 text-violet-900",
    slate: "border-slate-300 bg-slate-50 text-slate-700",
  };
  return (
    <div className={`rounded-xl border-2 p-3 ${colors[color]} ${isActive ? "ring-2 ring-offset-1 ring-blue-400" : ""} ${onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}
      onClick={onClick}>
      <p className="text-xs font-bold leading-tight">{label}</p>
      {sub && <p className="text-xs opacity-75 mt-0.5 leading-tight">{sub}</p>}
      {result && <p className="text-xs font-semibold mt-1 text-green-700">→ {result}</p>}
    </div>
  );
}

function YesNoButtons({ onYes, onNo, yesLabel = "Yes", noLabel = "No" }) {
  return (
    <div className="flex gap-2">
      <button onClick={onYes} className="flex-1 py-2 rounded-lg bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition-colors">{yesLabel}</button>
      <button onClick={onNo} className="flex-1 py-2 rounded-lg bg-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-300 transition-colors">{noLabel}</button>
    </div>
  );
}

function EngineHeader({ title, subtitle, color = "blue", icon }) {
  const IconEl = icon || Zap;
  const bg = { blue: "from-blue-700 to-indigo-700", red: "from-red-700 to-rose-700", violet: "from-violet-700 to-purple-700", amber: "from-amber-600 to-orange-600", green: "from-green-700 to-teal-700" };
  return (
    <div className={`rounded-xl bg-gradient-to-r ${bg[color] || bg.blue} p-4 text-white`}>
      <div className="flex items-center gap-2">
        <IconEl className="w-5 h-5" />
        <div>
          <h3 className="text-sm font-bold">{title}</h3>
          {subtitle && <p className="text-xs opacity-80">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

function ResultBox({ diagnosis, management, investigations, urgent }) {
  return (
    <div className={`rounded-xl border-2 p-4 space-y-2 ${urgent ? "border-red-400 bg-red-50" : "border-green-400 bg-green-50"}`}>
      {urgent && <div className="flex items-center gap-1.5 text-red-700"><AlertTriangle className="w-4 h-4" /><span className="text-xs font-bold">URGENT ACTION REQUIRED</span></div>}
      <p className="text-sm font-bold text-slate-800">Diagnosis: {diagnosis}</p>
      {investigations?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-600 mb-1">Investigations:</p>
          {investigations.map((inv, i) => (
            <div key={i} className="flex items-start gap-1.5 text-xs text-slate-700"><ArrowRight className="w-3 h-3 text-blue-500 flex-shrink-0 mt-0.5" />{inv}</div>
          ))}
        </div>
      )}
      {management?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-600 mb-1">Management:</p>
          {management.map((m, i) => (
            <div key={i} className="flex items-start gap-1.5 text-xs text-slate-700"><CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />{m}</div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── 1. TMA Decision Engine ────────────────────────────────────────────────────
export function TMADecisionEngine() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const reset = () => { setStep(0); setAnswers({}); };

  const answer = (key, val) => {
    setAnswers(a => ({ ...a, [key]: val }));
    setStep(s => s + 1);
  };

  const steps = [
    { q: "TMA confirmed? (MAHA + thrombocytopenia + organ injury)", key: "tma" },
    { q: "Prodromal diarrhoea (bloody) or Shiga-toxin positive stool?", key: "stec" },
    { q: "Age <2y with severe AKI, no diarrhoea?", key: "pneumo", cond: () => answers.stec === false },
    { q: "ADAMTS13 activity <10%?", key: "ttp", cond: () => answers.stec === false },
    { q: "Complement abnormalities (low C3, anti-CFH, genetic panel)?", key: "complement", cond: () => answers.ttp === false },
    { q: "Secondary cause? (autoimmune, drugs, HSCT, malignancy, pregnancy)", key: "secondary", cond: () => answers.complement === false },
  ];

  const getResult = () => {
    if (answers.tma === false) return { diagnosis: "TMA unlikely — reconsider diagnosis", management: ["Check alternative causes of pancytopenia + AKI", "Consider DIC, sepsis, drug toxicity"], urgent: false };
    if (answers.stec === true) return {
      diagnosis: "STEC-HUS", urgent: true,
      investigations: ["Stool culture + PCR (stx1, stx2)", "ELISA Shiga-toxin", "FBC, LDH, haptoglobin, renal panel", "ADAMTS13 (exclude TTP)"],
      management: ["SUPPORTIVE — NO antibiotics, NO anti-motility agents", "IV fluids (careful — avoid fluid overload)", "Transfuse pRBC if Hb <7 g/dL", "Dialysis if AKI criteria met", "Do NOT use eculizumab unless ADAMTS13 normal AND stx negative after 48h"]
    };
    if (answers.ttp === true) return {
      diagnosis: "TTP (Thrombotic Thrombocytopenic Purpura)", urgent: true,
      investigations: ["ADAMTS13 activity <10% (diagnostic)", "ADAMTS13 inhibitor titre", "Check for congenital TTP (ADAMTS13 gene)"],
      management: ["URGENT: PEX 1.5× plasma volume with FFP replacement DAILY", "Prednisolone 1 mg/kg/day", "Caplacizumab if available (anti-vWF nanobody)", "Rituximab for refractory/relapsing"]
    };
    if (answers.complement === true) return {
      diagnosis: "aHUS (Complement-mediated TMA)", urgent: true,
      investigations: ["Complement panel: C3, C4, CH50, AH50, Factor H, Factor I", "Genetic panel: CFH, CFI, MCP/CD46, C3, CFB, THBD, CFHR1/3", "Anti-CFH antibodies (ELISA)", "Store frozen plasma before any PEX/eculizumab"],
      management: ["Do NOT delay eculizumab pending genetics", "Meningococcal vaccine (MenACWY + MenB) BEFORE eculizumab — if urgency: co-prescribe penicillin V prophylaxis", "Eculizumab induction (see weight-based dosing below)", "PEX as bridge if eculizumab unavailable — 1.5× PV with FFP", "Dialysis support if severe AKI"]
    };
    if (answers.secondary === true) return {
      diagnosis: "Secondary TMA", urgent: false,
      investigations: ["ANA, anti-dsDNA (SLE)", "APLA antibody panel", "Drug history (calcineurin inhibitors, quinine, chemotherapy)", "HIV, CMV, Parvovirus B19 serology", "Bone marrow (if malignancy/HSCT)"],
      management: ["Treat underlying cause", "Stop offending drug if drug-induced TMA", "PLEX for SLE-TMA (Class IV LN)", "Disease-specific therapy per cause"]
    };
    return { diagnosis: "Idiopathic TMA — further workup needed", management: ["Repeat complement panel", "Extended genetic panel", "Refer to tertiary centre"], urgent: false };
  };

  const currentStep = steps.find((s, i) => i === step && (!s.cond || s.cond()));

  return (
    <div className="space-y-3">
      <EngineHeader title="TMA Decision Engine" subtitle="STEC-HUS · aHUS · TTP · Secondary TMA" color="red" icon={AlertTriangle} />
      <div className="text-xs text-slate-500 flex items-center gap-1">
        <Calculator className="w-3 h-3" />
        Step {Math.min(step + 1, steps.length)}/{steps.length}
        <button onClick={reset} className="ml-auto text-blue-600 underline">Restart</button>
      </div>
      {step < steps.length && currentStep && (
        <Card className="border-blue-200">
          <CardContent className="p-4 space-y-3">
            <p className="text-sm font-semibold text-slate-800">{currentStep.q}</p>
            <YesNoButtons onYes={() => answer(currentStep.key, true)} onNo={() => answer(currentStep.key, false)} />
          </CardContent>
        </Card>
      )}
      {(step >= steps.length || (answers.stec === true) || (answers.ttp === true) || (answers.complement === true) || (answers.secondary === true) || (answers.tma === false)) && (
        <ResultBox {...getResult()} />
      )}
    </div>
  );
}

// ── 2. Hematuria Evaluation Engine ───────────────────────────────────────────
export function HematuriaEngine() {
  const [answers, setAnswers] = useState({});
  const [step, setStep] = useState(0);
  const reset = () => { setStep(0); setAnswers({}); };

  const flow = [
    { q: "Gross (visible) or microscopic haematuria?", key: "gross", opts: ["Gross", "Microscopic"] },
    { q: "Significant proteinuria? (UPCR >0.5 mg/mg or dipstick ≥2+)", key: "protein", opts: ["Yes", "No"] },
    { q: "Low C3 complement?", key: "c3", opts: ["Yes", "No"], cond: () => answers.protein === "Yes" },
    { q: "Hypertension present?", key: "htn", opts: ["Yes", "No"] },
    { q: "Post-URTI haematuria within 1–3 days?", key: "igan", opts: ["Yes", "No"] },
    { q: "Family history of haematuria, CKD, deafness?", key: "family", opts: ["Yes", "No"] },
    { q: "Hearing loss or high-frequency SNHL?", key: "hearing", opts: ["Yes", "No"] },
    { q: "Urine Ca:Cr >0.2 or symptoms of stone?", key: "stone", opts: ["Yes", "No"] },
  ];

  const visibleSteps = flow.filter(s => !s.cond || s.cond());
  const currStepIdx = step < visibleSteps.length ? step : -1;

  const getOutput = () => {
    const results = [];
    if (answers.c3 === "Yes") results.push({ dx: "C3 Glomerulopathy / PSGN", inv: ["C3, C4, CH50, AH50", "ASO titre, anti-DNase B", "Anti-CFH Ab, complement genetics if persistent low C3", "Renal biopsy if C3 low >8 weeks"], biopsy: true });
    if (answers.igan === "Yes") results.push({ dx: "IgA Nephropathy", inv: ["IgA level, ANA, ANCA", "Renal biopsy if persistent proteinuria or declining eGFR"], biopsy: answers.protein === "Yes" });
    if (answers.family === "Yes" || answers.hearing === "Yes") results.push({ dx: "Alport Syndrome", inv: ["Audiometry (high-frequency SNHL)", "Slit-lamp (anterior lenticonus)", "Genetic panel: COL4A3/A4/A5", "Skin biopsy (IF for collagen IV) or renal biopsy", "Family screening"], genetic: true });
    if (answers.stone === "Yes") results.push({ dx: "Nephrolithiasis / Hypercalciuria", inv: ["Urine Ca:Cr ratio", "24h urine Ca, citrate, oxalate, urate", "Renal USG + KUB XRay", "PTH, Vitamin D levels"] });
    if (answers.protein === "No" && answers.family === "No" && answers.igan === "No" && answers.stone === "No") results.push({ dx: "Thin Basement Membrane Disease / Benign Familial Haematuria", inv: ["Family history", "Renal biopsy (EM: diffuse thinning of GBM)", "Genetic: COL4A3/A4 heterozygous mutation"], genetic: true });
    if (answers.gross === "Gross" && answers.protein === "No") results.push({ dx: "Urological cause (UTI, stone, trauma, tumour)", inv: ["Urine C&S", "Renal USG + bladder", "Urology referral if recurrent or no clear cause"] });
    return results.length > 0 ? results : [{ dx: "Non-glomerular haematuria — further workup needed", inv: ["Renal USG", "Urine C&S", "Phase-contrast microscopy"] }];
  };

  const handleAnswer = (val) => {
    const key = visibleSteps[step]?.key;
    setAnswers(a => ({ ...a, [key]: val }));
    setStep(s => s + 1);
  };

  return (
    <div className="space-y-3">
      <EngineHeader title="Hematuria Evaluation Engine" subtitle="Glomerular vs Urological · Biopsy & Genetic Triggers" color="violet" icon={Zap} />
      <div className="text-xs text-slate-500 flex items-center gap-1">
        Step {Math.min(step + 1, visibleSteps.length)}/{visibleSteps.length}
        <button onClick={reset} className="ml-auto text-blue-600 underline">Restart</button>
      </div>
      {currStepIdx >= 0 && (
        <Card className="border-violet-200">
          <CardContent className="p-4 space-y-3">
            <p className="text-sm font-semibold text-slate-800">{visibleSteps[currStepIdx].q}</p>
            <div className="flex flex-wrap gap-2">
              {visibleSteps[currStepIdx].opts.map(opt => (
                <button key={opt} onClick={() => handleAnswer(opt)}
                  className="flex-1 min-w-[80px] py-2 rounded-lg bg-violet-600 text-white text-xs font-bold hover:bg-violet-700 transition-colors">
                  {opt}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {step >= visibleSteps.length && (
        <div className="space-y-2">
          {getOutput().map((r, i) => (
            <div key={i} className="rounded-xl border-2 border-violet-300 bg-violet-50 p-3 space-y-1.5">
              <p className="text-sm font-bold text-violet-900">→ {r.dx}</p>
              {r.biopsy && <span className="inline-block text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">Biopsy Indicated</span>}
              {r.genetic && <span className="inline-block text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">Genetic Testing Indicated</span>}
              {r.inv?.map((inv, j) => <div key={j} className="flex items-start gap-1.5 text-xs text-slate-700"><ArrowRight className="w-3 h-3 text-violet-500 flex-shrink-0 mt-0.5" />{inv}</div>)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── 3. Genetic Testing Trigger Engine ────────────────────────────────────────
export function GeneticTestingEngine() {
  const triggers = [
    { condition: "SRNS", criteria: "No remission after 4 weeks full-dose prednisolone", panel: "NPHS1, NPHS2, PLCE1, WT1, LAMB2, CD2AP, TRPC6, INF2, COQ2/6/8B", urgency: "Before CNI initiation" },
    { condition: "Congenital NS (<3 months)", criteria: "Massive proteinuria from birth", panel: "NPHS1, NPHS2, WT1, LAMB2, PLCE1 (full panel)", urgency: "Immediate" },
    { condition: "Alport Syndrome", criteria: "Haematuria + family history + hearing loss + thin GBM", panel: "COL4A3, COL4A4, COL4A5 (X-linked: COL4A5)", urgency: "Elective + family screening" },
    { condition: "CAKUT", criteria: "Bilateral anomalies, family history, extra-renal features", panel: "PAX2, HNF1B, GATA3, EYA1, SIX1/2, ROBO2, DSTYK", urgency: "Elective" },
    { condition: "Tubulopathies", criteria: "Fanconi + growth failure OR Bartter/Gitelman features", panel: "CLCNKA/B, SLC12A1, KCNJ1, SLC12A3 (Bartter/Gitelman panel)", urgency: "Elective (Bartter urgent in neonates)" },
    { condition: "Nephronophthisis / Ciliopathies", criteria: "CKD with normal/small kidneys + CMD loss + extra-renal features", panel: "NPHP1 deletion first; if negative: full ciliopathy panel (NPHP1-21, CEP290, BBS genes)", urgency: "Elective" },
    { condition: "aHUS", criteria: "Non-diarrhoeal TMA, recurrent TMA, family history", panel: "CFH, CFI, MCP/CD46, C3, CFB, THBD, CFHR1/3/5", urgency: "URGENT (do not delay eculizumab)" },
  ];

  return (
    <div className="space-y-3">
      <EngineHeader title="Genetic Testing Trigger Engine" subtitle="Indication → Panel → Urgency" color="violet" icon={Zap} />
      <div className="space-y-2">
        {triggers.map((t, i) => (
          <Card key={i} className="border-violet-200">
            <CardContent className="p-3 space-y-1">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <span className="text-xs font-bold text-violet-800">{t.condition}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${t.urgency.includes("URGENT") || t.urgency === "Immediate" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600"}`}>{t.urgency}</span>
              </div>
              <p className="text-xs text-slate-600 italic">Trigger: {t.criteria}</p>
              <div className="flex items-start gap-1.5">
                <ArrowRight className="w-3 h-3 text-violet-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-800 font-medium">Panel: {t.panel}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs font-bold text-blue-800 mb-1">India Access</p>
        <p className="text-xs text-blue-700">AIIMS-New Delhi · CMC Vellore · Medgenome · Strand Life Sciences · Lilac Insights · 4baseCare · WES ₹15,000–25,000 · NGS gene panels ₹8,000–15,000</p>
      </div>
    </div>
  );
}

// ── 4. CKD Progression Risk Engine ───────────────────────────────────────────
export function CKDProgressionEngine() {
  const [egfr, setEgfr] = useState("");
  const [upcr, setUpcr] = useState("");
  const [bp, setBp] = useState("normal");
  const [disease, setDisease] = useState("CKD-NOS");

  const calc = () => {
    const g = parseFloat(egfr) || 0;
    const u = parseFloat(upcr) || 0;
    let risk = 0;
    if (g < 30) risk += 3; else if (g < 45) risk += 2; else if (g < 60) risk += 1;
    if (u > 3) risk += 3; else if (u > 1) risk += 2; else if (u > 0.5) risk += 1;
    if (bp === "uncontrolled") risk += 2; else if (bp === "elevated") risk += 1;
    if (["FSGS", "ANCA", "Lupus"].includes(disease)) risk += 2;
    else if (["IgAN", "ADPKD"].includes(disease)) risk += 1;
    return risk;
  };

  const risk = calc();
  const riskLabel = risk >= 7 ? "Very High" : risk >= 5 ? "High" : risk >= 3 ? "Moderate" : "Low";
  const riskColor = risk >= 7 ? "text-red-700 bg-red-50 border-red-300" : risk >= 5 ? "text-orange-700 bg-orange-50 border-orange-300" : risk >= 3 ? "text-amber-700 bg-amber-50 border-amber-300" : "text-green-700 bg-green-50 border-green-300";

  const monitoring = {
    "Very High": "eGFR + UPCR monthly; nephrology review every 3 months; RRT planning NOW",
    "High": "eGFR + UPCR every 1–2 months; nephrology review every 3 months; RRT planning",
    "Moderate": "eGFR + UPCR every 3 months; nephrology review every 6 months",
    "Low": "eGFR + UPCR every 6 months; annual review if stable"
  };

  return (
    <div className="space-y-3">
      <EngineHeader title="CKD Progression Risk Engine" subtitle="KDIGO Risk Matrix — Monitoring Interval Output" color="blue" icon={Calculator} />
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs font-semibold text-slate-600">eGFR (mL/min/1.73m²)</label>
          <input type="number" value={egfr} onChange={e => setEgfr(e.target.value)} placeholder="e.g. 35"
            className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600">UPCR (mg/mg)</label>
          <input type="number" step="0.1" value={upcr} onChange={e => setUpcr(e.target.value)} placeholder="e.g. 1.5"
            className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600">BP Control</label>
          <select value={bp} onChange={e => setBp(e.target.value)}
            className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none">
            <option value="normal">Normal (&lt;90th percentile)</option>
            <option value="elevated">Elevated (90–95th)</option>
            <option value="uncontrolled">Uncontrolled (≥Stage 1)</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600">Underlying Disease</label>
          <select value={disease} onChange={e => setDisease(e.target.value)}
            className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none">
            {["CKD-NOS", "FSGS", "IgAN", "Lupus", "ANCA", "ADPKD", "CAKUT", "Alport"].map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
      </div>
      {(egfr || upcr) && (
        <div className={`p-3 rounded-xl border-2 font-bold text-center ${riskColor}`}>
          <p className="text-base">{riskLabel} Progression Risk (Score: {risk})</p>
          <p className="text-xs font-normal mt-1">{monitoring[riskLabel]}</p>
        </div>
      )}
    </div>
  );
}

// ── 5. Biopsy Trigger Engine ──────────────────────────────────────────────────
export function BiopsyTriggerEngine() {
  const triggers = [
    { scenario: "Nephrotic Syndrome", indication: "Biopsy IF: age <1yr OR >12yr, atypical features (haematuria, low C3, HTN), steroid-resistant, steroid-dependent relapsing", avoid: "Steroid-responsive SSNS in typical age group" },
    { scenario: "IgA Nephropathy", indication: "Biopsy for MEST-C scoring if: declining eGFR, proteinuria >0.5 g/day, or considering IS therapy", avoid: "Isolated microscopic haematuria, normal eGFR, no proteinuria" },
    { scenario: "Lupus Nephritis", indication: "Biopsy ALL children with LN for ISN/RPS class — guides induction choice", avoid: "Rarely avoided in paediatric LN" },
    { scenario: "C3G / MPGN", indication: "Mandatory: C3 dominant pattern on IF with persistent low C3 (>8 weeks)", avoid: "Post-infectious GN with rapidly normalising C3" },
    { scenario: "ANCA Vasculitis", indication: "Renal biopsy for: % crescents (prognostic), confirm pauci-immune pattern, guide intensity of treatment", avoid: "If already on dialysis with positive ANCA + typical presentation — may proceed to treat without biopsy" },
    { scenario: "RPGN (any cause)", indication: "URGENT biopsy within 24-48h: determines linear (anti-GBM) vs granular (immune-complex) vs pauci-immune — treatment differs completely", avoid: "Severe coagulopathy uncorrected, single kidney (relative CI)" },
    { scenario: "Alport Syndrome", indication: "EM biopsy: confirms thinning + lamellation of GBM; skin biopsy (IF) for X-linked Alport (col IV α5)", avoid: "If genetic diagnosis already confirmed" },
  ];

  return (
    <div className="space-y-3">
      <EngineHeader title="Biopsy Trigger Engine" subtitle="Indication · Timing · Contraindications by Disease" color="amber" icon={Zap} />
      <div className="space-y-2">
        {triggers.map((t, i) => (
          <Card key={i} className="border-amber-200">
            <CardContent className="p-3 space-y-1.5">
              <p className="text-xs font-bold text-amber-800">{t.scenario}</p>
              <div className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-800"><span className="font-semibold">Biopsy indicated:</span> {t.indication}</p>
              </div>
              <div className="flex items-start gap-1.5">
                <Circle className="w-3 h-3 text-slate-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-500"><span className="font-semibold">May avoid:</span> {t.avoid}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── 6. Eculizumab Eligibility Engine ─────────────────────────────────────────
export function EculizumabEngine() {
  const [weight, setWeight] = useState("");
  const [indication, setIndication] = useState("ahus");

  const wt = parseFloat(weight) || null;
  const doses = [
    { min: 0, max: 5, ind: "300 mg", indN: 1, maint: "300 mg", freq: "Q3W" },
    { min: 5, max: 10, ind: "600 mg", indN: 1, maint: "300 mg", freq: "Q3W" },
    { min: 10, max: 20, ind: "600 mg", indN: 1, maint: "600 mg", freq: "Q2W" },
    { min: 20, max: 30, ind: "900 mg", indN: 1, maint: "600 mg", freq: "Q2W" },
    { min: 30, max: 40, ind: "900 mg", indN: 1, maint: "900 mg", freq: "Q2W" },
    { min: 40, max: 999, ind: "900 mg", indN: 4, maint: "1200 mg", freq: "Q2W" },
  ];
  const dose = wt ? doses.find(d => wt >= d.min && wt < d.max) : null;

  const checklist = [
    "Meningococcal vaccine (MenACWY + MenB) given OR antibiotics co-prescribed",
    "ADAMTS13 >10% (excludes TTP — do NOT use eculizumab for TTP)",
    "Shiga-toxin negative (excludes STEC-HUS — eculizumab not beneficial)",
    "Complement panel sampled BEFORE first dose (C3, C4, CFH, CFI, anti-CFH Ab)",
    "Genetic panel stored/sent (CFH, CFI, MCP, C3, CFB, THBD, CFHR1/3)",
    "Compassionate access / named patient programme initiated if not commercially available",
  ];

  return (
    <div className="space-y-3">
      <EngineHeader title="Eculizumab Eligibility Engine" subtitle="aHUS · C3G with complement mutations" color="green" icon={Calculator} />
      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-600">Pre-Treatment Checklist:</p>
        {checklist.map((item, i) => (
          <div key={i} className="flex items-start gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-800">{item}</p>
          </div>
        ))}
      </div>
      <div className="bg-white border-2 border-slate-200 rounded-xl p-3 space-y-2">
        <p className="text-xs font-semibold text-slate-600">Weight-Based Dose Calculator</p>
        <input type="number" inputMode="decimal" value={weight} onChange={e => setWeight(e.target.value)}
          placeholder="Patient weight (kg)" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
        {dose && (
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3 text-center">
              <p className="text-xs text-slate-500">Induction</p>
              <p className="text-lg font-black text-blue-800">{dose.ind}</p>
              <p className="text-xs text-slate-500">Weekly × {dose.indN} dose{dose.indN > 1 ? "s" : ""}</p>
            </div>
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-3 text-center">
              <p className="text-xs text-slate-500">Maintenance</p>
              <p className="text-base font-black text-green-800">{dose.maint}</p>
              <p className="text-xs text-slate-500">{dose.freq}</p>
            </div>
          </div>
        )}
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <p className="text-xs font-bold text-amber-800">Duration</p>
        <p className="text-xs text-amber-700">Genetic aHUS: indefinite (stopping risk 50% relapse). Anti-CFH Ab–mediated: consider stopping when Ab undetectable + no complement activation × 6 months. C3G: case-by-case.</p>
      </div>
    </div>
  );
}

// ── 7. Hypokalemia Engine ─────────────────────────────────────────────────────
export function HypokalemiaEngine() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const reset = () => { setStep(0); setAnswers({}); };
  const answer = (k, v) => { setAnswers(a => ({ ...a, [k]: v })); setStep(s => s + 1); };

  const steps = [
    { q: "Blood pressure?", key: "bp", opts: ["High/Normal", "Low"] },
    { q: "Serum bicarbonate?", key: "bicarb", opts: ["High (Alkalosis)", "Low (Acidosis)"] },
    { q: "Urine chloride?", key: "ucl", opts: ["Low (<25 mEq/L)", "High (>25 mEq/L)"], cond: () => answers.bp === "Low" },
    { q: "Renin level?", key: "renin", opts: ["High", "Low"], cond: () => answers.bp === "High/Normal" },
  ];

  const visibleSteps = steps.filter(s => !s.cond || s.cond());
  const currStep = step < visibleSteps.length ? visibleSteps[step] : null;

  const getResult = () => {
    if (answers.bp === "High/Normal") {
      if (answers.renin === "Low") return { dx: "Primary Hyperaldosteronism / Apparent Mineralocorticoid Excess / Liddle Syndrome", inv: ["Aldosterone:Renin ratio (>30 = primary hyperaldosteronism)", "24h urine cortisol (Cushing)", "Genetic panel: SCNN1B/G (Liddle), HSD11B2 (AME)"], action: ["CT adrenals", "Endocrinology referral"] };
      if (answers.renin === "High") return { dx: "Secondary Hyperaldosteronism (RAS, malignant HTN) or Bartter Syndrome", inv: ["Renal artery Doppler (RAS)", "Urine Ca:Cr (low in Bartter)", "Genetic: CLCNKA/B, SLC12A1, KCNJ1 (Bartter types)"], action: ["ACEi if tolerated", "Indomethacin (Bartter)", "KCl + amiloride"] };
    }
    if (answers.bp === "Low") {
      if (answers.bicarb === "High (Alkalosis)") {
        if (answers.ucl === "Low (<25 mEq/L)") return { dx: "Vomiting / Nasogastric losses", inv: ["History", "Urine Na (low)", "Upper GI review"], action: ["Correct volume + KCl supplementation"] };
        if (answers.ucl === "High (>25 mEq/L)") return { dx: "Gitelman Syndrome (most likely) or Bartter", inv: ["Urine Mg (low in Gitelman)", "Urine Ca:Cr (low in Gitelman)", "Genetic: SLC12A3 (Gitelman)"], action: ["KCl + MgSO4 (Gitelman needs lifelong Mg)", "Amiloride adjunct"] };
      }
      if (answers.bicarb === "Low (Acidosis)") return { dx: "Proximal RTA / Fanconi Syndrome / Diarrhoea", inv: ["Urine anion gap", "Urine pH (>5.5 in pRTA)", "Urine glucose, amino acids (Fanconi)", "Genetic: SLC4A4, LMX1B"], action: ["NaHCO3 (pRTA)", "Phosphate replacement (Fanconi)", "Treat underlying cause"] };
    }
    return { dx: "Transcellular shift (insulin, alkalosis, β-agonist)", inv: ["ABG", "Medication review (furosemide, ampho B)", "Thyroid function (thyrotoxic paralysis)"], action: ["IV KCl if symptomatic", "Treat underlying cause"] };
  };

  return (
    <div className="space-y-3">
      <EngineHeader title="Hypokalemia Diagnostic Engine" subtitle="BP + Acid-Base → Bartter · Gitelman · AME · Liddle" color="amber" icon={Zap} />
      <div className="text-xs text-slate-500 flex items-center gap-1">
        Step {step + 1}/{visibleSteps.length}
        <button onClick={reset} className="ml-auto text-blue-600 underline">Restart</button>
      </div>
      {currStep && (
        <Card className="border-amber-200">
          <CardContent className="p-4 space-y-3">
            <p className="text-sm font-semibold text-slate-800">{currStep.q}</p>
            <div className="flex flex-wrap gap-2">
              {currStep.opts.map(opt => (
                <button key={opt} onClick={() => answer(currStep.key, opt)}
                  className="flex-1 min-w-[80px] py-2 rounded-lg bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-colors">
                  {opt}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {step >= visibleSteps.length && (() => {
        const r = getResult();
        return (
          <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-3 space-y-2">
            <p className="text-sm font-bold text-amber-900">→ {r.dx}</p>
            {r.inv?.map((inv, j) => <div key={j} className="flex items-start gap-1.5 text-xs text-slate-700"><ArrowRight className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />{inv}</div>)}
            {r.action && <div className="mt-1 border-t border-amber-200 pt-1">{r.action.map((a, j) => <div key={j} className="flex items-start gap-1.5 text-xs font-semibold text-green-800"><CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />{a}</div>)}</div>}
          </div>
        );
      })()}
    </div>
  );
}

// ── 8. Metabolic Acidosis Engine ──────────────────────────────────────────────
export function MetabolicAcidosisEngine() {
  const [na, setNa] = useState(""); const [cl, setCl] = useState(""); const [hco3, setHco3] = useState("");
  const [uNa, setUNa] = useState(""); const [uK, setUK] = useState(""); const [uCl, setUCl] = useState(""); const [uPh, setUPh] = useState("");

  const ag = (parseFloat(na) || 0) - ((parseFloat(cl) || 0) + (parseFloat(hco3) || 0));
  const uag = (parseFloat(uNa) || 0) + (parseFloat(uK) || 0) - (parseFloat(uCl) || 0);
  const hasInputs = na && cl && hco3;

  const getDiagnosis = () => {
    if (ag > 12) return { dx: "High Anion Gap Metabolic Acidosis", sub: "MUDPILES: Methanol · Uraemia · DKA · Propylene glycol · Isoniazid · Lactic acidosis · Ethylene glycol · Salicylates", color: "red" };
    if (uag > 0) return { dx: "Normal AG → Positive UAG → Distal RTA (Type 1)", sub: "Impaired H+ secretion. Urine pH persistently >5.5. Check nephrocalcinosis on USG.", color: "amber" };
    if (uag < 0 && parseFloat(uPh) < 5.5) return { dx: "Normal AG → Negative UAG → GI bicarbonate loss (Diarrhoea)", sub: "Normal renal acid excretion. Replace losses.", color: "green" };
    if (uag < 0 && parseFloat(uPh) > 5.5) return { dx: "Normal AG → Proximal RTA (Type 2) / Fanconi Syndrome", sub: "Impaired HCO3 reabsorption. Check glucosuria, amino acids, phosphaturia.", color: "amber" };
    return null;
  };

  const result = getDiagnosis();
  const colorMap = { red: "border-red-300 bg-red-50 text-red-900", amber: "border-amber-300 bg-amber-50 text-amber-900", green: "border-green-300 bg-green-50 text-green-900" };

  return (
    <div className="space-y-3">
      <EngineHeader title="Metabolic Acidosis Engine" subtitle="AG → UAG → RTA Classification" color="amber" icon={Calculator} />
      <div className="grid grid-cols-3 gap-2">
        {[["Na", na, setNa], ["Cl", cl, setCl], ["HCO3", hco3, setHco3]].map(([label, val, setter]) => (
          <div key={label}>
            <label className="text-xs font-semibold text-slate-600">{label} (mEq/L)</label>
            <input type="number" value={val} onChange={e => setter(e.target.value)} placeholder={label}
              className="w-full mt-1 px-2 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-amber-400" />
          </div>
        ))}
      </div>
      {hasInputs && <div className={`text-center p-2 rounded-lg font-bold text-sm border-2 ${ag > 12 ? "bg-red-50 border-red-300 text-red-800" : "bg-green-50 border-green-300 text-green-800"}`}>AG = {ag.toFixed(1)} mEq/L {ag > 12 ? "(↑ HIGH)" : "(Normal)"}</div>}
      {hasInputs && ag <= 12 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-600">Normal AG → Calculate Urinary Anion Gap (Na + K − Cl):</p>
          <div className="grid grid-cols-2 gap-2">
            {[["Urine Na", uNa, setUNa], ["Urine K", uK, setUK], ["Urine Cl", uCl, setUCl], ["Urine pH", uPh, setUPh]].map(([label, val, setter]) => (
              <div key={label}>
                <label className="text-xs font-semibold text-slate-600">{label}</label>
                <input type="number" value={val} onChange={e => setter(e.target.value)} placeholder={label}
                  className="w-full mt-1 px-2 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-amber-400" />
              </div>
            ))}
          </div>
          {uNa && uK && uCl && <div className={`text-center p-2 rounded-lg font-bold text-sm border-2 ${uag > 0 ? "bg-amber-50 border-amber-300 text-amber-800" : "bg-green-50 border-green-300 text-green-800"}`}>UAG = {uag.toFixed(1)} {uag > 0 ? "(+ve = dRTA)" : "(−ve = GI loss)"}</div>}
        </div>
      )}
      {result && (
        <div className={`rounded-xl border-2 p-3 ${colorMap[result.color]}`}>
          <p className="text-sm font-bold">→ {result.dx}</p>
          <p className="text-xs mt-1 opacity-80">{result.sub}</p>
        </div>
      )}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5">
        <p className="text-xs text-blue-800">
          <strong>Linked Calculator:</strong>{" "}
          <Link to="/RTAClassifier" className="underline text-blue-600">Open RTA Classifier Tool →</Link>
        </p>
      </div>
    </div>
  );
}

// ── 9. Polyuria Engine ────────────────────────────────────────────────────────
export function PolyuriaEngine() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const reset = () => { setStep(0); setAnswers({}); };
  const answer = (k, v) => { setAnswers(a => ({ ...a, [k]: v })); setStep(s => s + 1); };

  const steps = [
    { q: "Urine osmolality (random)?", key: "uosm", opts: ["<300 mOsm/kg (dilute)", ">300 mOsm/kg (concentrated)"] },
    { q: "Water deprivation test: Urine osmolality after 4–6h fasting?", key: "wdt", opts: ["Still <300 (DI)", ">300 (appropriate concentration)"], cond: () => answers.uosm === "<300 mOsm/kg (dilute)" },
    { q: "DDAVP response after water deprivation?", key: "ddavp", opts: [">50% increase (Central DI)", "<10% increase (Nephrogenic DI)"], cond: () => answers.wdt === "Still <300 (DI)" },
  ];

  const visible = steps.filter(s => !s.cond || s.cond());
  const curr = step < visible.length ? visible[step] : null;

  const getResult = () => {
    if (answers.uosm === ">300 mOsm/kg (concentrated)") return { dx: "Solute/Osmotic Diuresis", sub: "Check glucose (DKA, glycosuria), urea load, mannitol. Treat underlying cause." };
    if (answers.wdt === ">300 (appropriate concentration)") return { dx: "Primary Polydipsia / Psychogenic", sub: "Urine concentrates appropriately during water deprivation. Consider psychiatric referral, fluid restriction trial." };
    if (answers.ddavp === ">50% increase (Central DI)") return { dx: "Central Diabetes Insipidus", sub: "AVP (ADH) deficiency. MRI brain (hypothalamic-pituitary lesion). DDAVP 0.1–0.4 mg nasal/oral." };
    if (answers.ddavp === "<10% increase (Nephrogenic DI)") return { dx: "Nephrogenic Diabetes Insipidus", sub: "Renal AVP resistance. Genetic: AVPR2 (X-linked), AQP2. Urine concentrating defect. Low-solute diet + thiazide + amiloride." };
    return null;
  };

  return (
    <div className="space-y-3">
      <EngineHeader title="Polyuria Diagnostic Engine" subtitle="Central DI · Nephrogenic DI · Solute Diuresis" color="blue" icon={Zap} />
      <div className="text-xs text-slate-500 flex items-center gap-1">
        Step {step + 1}/{visible.length}
        <button onClick={reset} className="ml-auto text-blue-600 underline">Restart</button>
      </div>
      {curr && (
        <Card className="border-blue-200">
          <CardContent className="p-4 space-y-3">
            <p className="text-sm font-semibold text-slate-800">{curr.q}</p>
            <div className="flex flex-col gap-2">
              {curr.opts.map(opt => (
                <button key={opt} onClick={() => answer(curr.key, opt)}
                  className="w-full py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors text-left px-3">
                  {opt}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {step >= visible.length && (() => {
        const r = getResult();
        return r ? (
          <div className="rounded-xl border-2 border-blue-300 bg-blue-50 p-3">
            <p className="text-sm font-bold text-blue-900">→ {r.dx}</p>
            <p className="text-xs text-blue-700 mt-1">{r.sub}</p>
          </div>
        ) : null;
      })()}
    </div>
  );
}

// ── 10. Hyperkalemia Emergency Engine ─────────────────────────────────────────
export function HyperkalemiaEngine() {
  const [k, setK] = useState("");
  const [ecg, setEcg] = useState("none");
  const kv = parseFloat(k) || 0;

  const level = kv > 7 ? "critical" : kv > 6.5 ? "severe" : kv > 6 ? "moderate" : kv > 5.5 ? "mild" : "normal";
  const urgent = level === "critical" || level === "severe" || (level === "moderate" && ecg !== "none");

  const steps = [
    { phase: "Membrane Stabilisation (ECG changes or K>6.5)", meds: ["IV Calcium gluconate 10%: 0.5–1 mL/kg (max 20 mL) over 5–10 min", "Onset: 1–3 min. Duration: 30–60 min. Repeat if ECG persists."] },
    { phase: "Shift K+ into cells (onset 15–30 min)", meds: ["Insulin-dextrose: Regular insulin 0.1 U/kg + D25 2 mL/kg IV over 30 min", "Salbutamol nebulisation: 2.5–5 mg (age-dependent)", "Sodium bicarbonate 1–2 mEq/kg IV over 30 min (if acidosis)"] },
    { phase: "Remove K+ from body", meds: ["Sodium polystyrene sulfonate (Kayexalate) or Patiromer — oral/PR", "Furosemide 1–2 mg/kg IV (if adequate UO)", "DIALYSIS if refractory (K>7, anuric, no response to above)"] },
  ];

  return (
    <div className="space-y-3">
      <EngineHeader title="Hyperkalemia Emergency Engine" subtitle="K+ → ECG → Calcium → Shift → Remove → Dialysis" color="red" icon={AlertTriangle} />
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs font-semibold text-slate-600">Serum K+ (mEq/L)</label>
          <input type="number" step="0.1" value={k} onChange={e => setK(e.target.value)} placeholder="e.g. 6.8"
            className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-red-400" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600">ECG Changes</label>
          <select value={ecg} onChange={e => setEcg(e.target.value)}
            className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none">
            <option value="none">None</option>
            <option value="peaked_t">Peaked T waves</option>
            <option value="wide_qrs">Wide QRS / Sine wave</option>
            <option value="vfib">VF/VT/Arrest</option>
          </select>
        </div>
      </div>
      {kv > 0 && (
        <div className={`p-3 rounded-xl border-2 text-center font-bold ${urgent ? "border-red-400 bg-red-50 text-red-800" : "border-green-400 bg-green-50 text-green-800"}`}>
          K+ = {kv} mEq/L — {level.toUpperCase()} {urgent ? "⚡ TREAT NOW" : "— Monitor"}
        </div>
      )}
      {urgent && steps.map((s, i) => (
        <Card key={i} className="border-red-200">
          <CardContent className="p-3">
            <p className="text-xs font-bold text-red-800 mb-1.5">Step {i + 1}: {s.phase}</p>
            {s.meds.map((m, j) => <div key={j} className="flex items-start gap-1.5 text-xs text-slate-800 mb-0.5"><ArrowRight className="w-3 h-3 text-red-400 flex-shrink-0 mt-0.5" />{m}</div>)}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}