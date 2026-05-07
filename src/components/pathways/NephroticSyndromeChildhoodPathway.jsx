import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CheckCircle2, Droplet, AlertTriangle, Pill, Syringe, UtensilsCrossed, Printer, Info, ChevronDown, ChevronUp } from "lucide-react";
import { base44 } from "@/api/base44Client";

// ── Diet Builder ───────────────────────────────────────────────
function DietBuilder() {
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [phase, setPhase] = useState("relapse");
  const [diet, setDiet] = useState(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!weight || !age) return;
    setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a nephrotic syndrome diet plan for a child: weight ${weight} kg, age ${age} years, phase: ${phase}.
Include:
1. Daily calorie target (kcal/kg/day)
2. Protein intake (g/kg/day — normal to slightly increased for relapse, ISPN guidelines)
3. Salt restriction (mg/day)
4. Fluid restriction if applicable
5. Foods to AVOID (high-salt processed foods, excessive protein sources)
6. ALLOWED foods with examples
7. Sample 1-day meal plan (breakfast, lunch, dinner, snacks) with Indian foods
8. Calcium and Vitamin D supplement doses
Format as structured JSON.`,
        response_json_schema: {
          type: "object",
          properties: {
            calories_kcal_per_kg: { type: "number" },
            protein_g_per_kg: { type: "number" },
            salt_mg_per_day: { type: "number" },
            fluid_restriction: { type: "string" },
            avoid: { type: "array", items: { type: "string" } },
            allowed: { type: "array", items: { type: "string" } },
            meal_plan: {
              type: "object",
              properties: {
                breakfast: { type: "string" },
                lunch: { type: "string" },
                dinner: { type: "string" },
                snacks: { type: "string" }
              }
            },
            supplements: { type: "string" },
            notes: { type: "string" }
          }
        }
      });
      setDiet(result);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label className="text-xs font-semibold text-slate-600">Weight (kg)</label>
          <input className="w-full border rounded-lg px-3 py-2 text-sm mt-1" value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 18" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600">Age (years)</label>
          <input className="w-full border rounded-lg px-3 py-2 text-sm mt-1" value={age} onChange={e => setAge(e.target.value)} placeholder="e.g. 6" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600">Disease Phase</label>
          <select className="w-full border rounded-lg px-3 py-2 text-sm mt-1" value={phase} onChange={e => setPhase(e.target.value)}>
            <option value="relapse">Active Relapse / Edema</option>
            <option value="remission">Remission</option>
            <option value="steroid">On Long-term Steroids</option>
            <option value="ckd">CKD / Steroid Resistant</option>
          </select>
        </div>
        <div className="flex items-end">
          <Button className="w-full bg-blue-700" onClick={generate} disabled={loading || !weight || !age}>
            {loading ? "Generating..." : "Generate Diet Plan"}
          </Button>
        </div>
      </div>

      {diet && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Calories", val: `${diet.calories_kcal_per_kg} kcal/kg/day\n(${Math.round(diet.calories_kcal_per_kg * parseFloat(weight))} kcal/day total)` },
              { label: "Protein", val: `${diet.protein_g_per_kg} g/kg/day\n(${Math.round(diet.protein_g_per_kg * parseFloat(weight))} g/day total)` },
              { label: "Salt Limit", val: `${diet.salt_mg_per_day} mg/day` },
              { label: "Fluid", val: diet.fluid_restriction || "No restriction" },
            ].map(item => (
              <div key={item.label} className="bg-blue-50 rounded-xl p-3 text-center">
                <div className="text-xs font-bold text-blue-700 uppercase">{item.label}</div>
                <div className="text-sm font-semibold text-slate-800 mt-1 whitespace-pre-line">{item.val}</div>
              </div>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <Card className="border-red-200 bg-red-50">
              <CardHeader className="pb-2"><CardTitle className="text-sm text-red-700">❌ Foods to Avoid</CardTitle></CardHeader>
              <CardContent><ul className="space-y-1">{diet.avoid?.map((f,i) => <li key={i} className="text-sm text-slate-700">• {f}</li>)}</ul></CardContent>
            </Card>
            <Card className="border-green-200 bg-green-50">
              <CardHeader className="pb-2"><CardTitle className="text-sm text-green-700">✅ Allowed Foods</CardTitle></CardHeader>
              <CardContent><ul className="space-y-1">{diet.allowed?.map((f,i) => <li key={i} className="text-sm text-slate-700">• {f}</li>)}</ul></CardContent>
            </Card>
          </div>

          <Card className="border-amber-200 bg-amber-50">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-amber-700">🍽️ Sample 1-Day Meal Plan (Indian)</CardTitle></CardHeader>
            <CardContent className="space-y-1">
              {diet.meal_plan && Object.entries(diet.meal_plan).map(([meal, food]) => (
                <div key={meal} className="text-sm"><span className="font-semibold capitalize text-amber-800">{meal}:</span> {food}</div>
              ))}
            </CardContent>
          </Card>

          {diet.supplements && (
            <Alert className="bg-purple-50 border-purple-200">
              <AlertDescription className="text-purple-800 text-sm"><strong>Supplements:</strong> {diet.supplements}</AlertDescription>
            </Alert>
          )}
          {diet.notes && (
            <Alert className="bg-slate-50 border-slate-200">
              <AlertDescription className="text-slate-700 text-sm"><strong>Notes:</strong> {diet.notes}</AlertDescription>
            </Alert>
          )}

          <Button variant="outline" className="gap-2" onClick={() => window.print()}>
            <Printer className="w-4 h-4" /> Print / Share Diet Plan
          </Button>
        </div>
      )}
    </div>
  );
}

// ── Drug Detail Section ────────────────────────────────────────
function DrugSection({ title, color, drugs }) {
  const [open, setOpen] = useState(false);
  return (
    <Card className={`border-2 ${color}`}>
      <button className="w-full text-left p-4 flex items-center justify-between" onClick={() => setOpen(!open)}>
        <span className="font-semibold text-sm">{title}</span>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {open && (
        <CardContent className="pt-0 space-y-3">
          {drugs.map((drug, i) => (
            <div key={i} className="bg-white rounded-xl border p-3 space-y-1.5">
              <div className="font-bold text-sm text-slate-800">{drug.name}</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
                <div><span className="font-semibold text-slate-500">Dose:</span> <span>{drug.dose}</span></div>
                <div><span className="font-semibold text-slate-500">Duration:</span> <span>{drug.duration}</span></div>
                {drug.trough && <div><span className="font-semibold text-slate-500">Trough:</span> <span>{drug.trough}</span></div>}
                {drug.monitoring && <div><span className="font-semibold text-slate-500">Monitor:</span> <span>{drug.monitoring}</span></div>}
              </div>
              {drug.sideEffects && (
                <div className="text-xs text-red-700 bg-red-50 rounded p-2">
                  <strong>Side effects:</strong> {drug.sideEffects}
                </div>
              )}
              {drug.notes && (
                <div className="text-xs text-blue-700 bg-blue-50 rounded p-2">
                  <Info className="w-3 h-3 inline mr-1" />{drug.notes}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  );
}

// ── Vaccination Plan ───────────────────────────────────────────
function VaccinationPlan() {
  const rules = [
    { status: "High-dose steroids (≥2 mg/kg/d or ≥20 mg/d if >10 kg) for <14 days", advice: "Live vaccines: Give immediately after stopping steroids", safe: true },
    { status: "High-dose steroids ≥14 days", advice: "Live vaccines: Wait 1 month after stopping steroids", safe: false },
    { status: "Low-moderate dose prednisolone", advice: "No live vaccines until steroids discontinued", safe: false },
    { status: "Low-dose alternate-day prednisolone + urgent need", advice: "Live vaccine may be given cautiously", safe: true },
    { status: "On cyclophosphamide", advice: "Avoid live vaccines. Wait 3 months after stopping", safe: false },
    { status: "On CNI / Levamisole / MMF", advice: "Avoid live vaccines. Wait 1 month after stopping", safe: false },
    { status: "Post-Rituximab", advice: "Avoid live vaccines until B-cell recovery (~6–9 months)", safe: false },
    { status: "Immunocompetent siblings/household", advice: "No oral polio; may receive MMR, rotavirus, varicella", safe: true },
    { status: "Household contacts >1 year", advice: "Annual influenza vaccine recommended", safe: true },
  ];

  const vaccines = [
    { name: "Pneumococcal (PCV13 preferred)", when: "During remission, low/no immunosuppression", schedule: "Age 6–72 mo: 2 doses ≥8 wks apart + PPSV23 once ≥2 yr; Age >72 mo: 1 dose PCV + 1 dose PPSV23", note: "Repeat PPSV23 after 5 years if disease still active" },
    { name: "Varicella (live)", when: "Off immunosuppression (per Table IV rules)", schedule: "2 doses 4–8 weeks apart; avoid if <15 months", note: "Post-exposure: give vaccine within 5 days if not immunosuppressed; VARIZIG within 10 days if contraindicated" },
    { name: "Influenza (inactivated)", when: "Annual, any time including relapse", schedule: "Annually from age >6 months; also give to household contacts", note: "Safe during immunosuppression; inactivated — not live" },
    { name: "Hepatitis B", when: "Check anti-HBs titres", schedule: "3 doses (0, 1, 6 months); accelerated schedule acceptable. Test post-vaccination for adequacy (anti-HBs ≥10 mIU/mL)", note: "Use double dose (20 µg) if poor responder" },
  ];

  return (
    <div className="space-y-4">
      <Alert className="bg-amber-50 border-amber-300">
        <Syringe className="w-4 h-4 text-amber-700" />
        <AlertDescription className="text-amber-900 text-sm">
          <strong>ISPN 2021 Immunization Principles:</strong> Killed/inactivated vaccines are safe at any time (efficacy may be reduced during immunosuppression). Live vaccines require specific timing based on immunosuppression status.
        </AlertDescription>
      </Alert>

      <Card className="border-blue-200">
        <CardHeader className="pb-2"><CardTitle className="text-sm text-blue-800">Immunosuppression Status → Live Vaccine Timing</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {rules.map((r, i) => (
              <div key={i} className={`flex items-start gap-2 p-2 rounded-lg text-xs ${r.safe ? 'bg-green-50' : 'bg-red-50'}`}>
                <span className={`w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs mt-0.5 ${r.safe ? 'bg-green-600' : 'bg-red-500'}`}>
                  {r.safe ? '✓' : '✕'}
                </span>
                <div>
                  <div className="font-semibold text-slate-700">{r.status}</div>
                  <div className="text-slate-600">{r.advice}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {vaccines.map((v, i) => (
          <Card key={i} className="border-slate-200">
            <CardContent className="p-3 space-y-1">
              <div className="font-bold text-sm text-slate-800">{v.name}</div>
              <div className="text-xs"><span className="font-semibold text-slate-500">When to give:</span> {v.when}</div>
              <div className="text-xs"><span className="font-semibold text-slate-500">Schedule:</span> {v.schedule}</div>
              <div className="text-xs text-blue-700 bg-blue-50 rounded p-1.5"><Info className="w-3 h-3 inline mr-1" />{v.note}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────
export default function NephroticSyndromeChildhoodPathway() {
  const FRNS_DRUGS = [
    {
      name: "Levamisole",
      dose: "2–2.5 mg/kg on alternate days",
      duration: "2–3 years",
      trough: "Not required",
      monitoring: "CBC q 2–3 months; LFTs q 4–6 months",
      sideEffects: "Leukopenia, ANCA-positive vasculitis, raised transaminases, seizures (rare)",
      notes: "First-line for mild FRNS. Withhold if TLC <4000/mm³. Preferred in India for cost-effectiveness."
    },
    {
      name: "Mycophenolate Mofetil (MMF)",
      dose: "600–1200 mg/m²/day in 2 divided doses (target AUC >45 mg·h/L)",
      duration: "2–3 years",
      trough: "MPA trough >2–3 µg/mL (if available)",
      monitoring: "CBC + LFTs q 3–6 months",
      sideEffects: "Abdominal pain, diarrhea, nausea, leukopenia, viral warts, weight loss",
      notes: "Preferred for SDNS. More effective than levamisole in steroid-dependent disease. Escalate dose to 1000–1200 mg/m² if relapsing."
    },
    {
      name: "Cyclophosphamide (oral)",
      dose: "2–2.5 mg/kg/day orally",
      duration: "8–12 weeks (cumulative dose ≤170 mg/kg)",
      trough: "Not applicable",
      monitoring: "CBC every 2 weeks; withhold if TLC <4000/mm³",
      sideEffects: "Leukopenia, alopecia, haemorrhagic cystitis, infection risk, gonadal toxicity (especially pubertal boys), malignancy risk",
      notes: "Avoid in <5–7 yr and pubertal/post-pubertal boys. Co-administer prednisolone 1 mg/kg AD. Maximum 1 course lifetime."
    },
    {
      name: "Cyclosporine (CNI)",
      dose: "4–5 mg/kg/day in 2 divided doses",
      duration: "2–3 years minimum; kidney biopsy before if prolonged use >30–36 months",
      trough: "80–120 ng/mL",
      monitoring: "Creatinine + K⁺ at 2–4 weeks then q 3–6 months; LFTs, lipids, glucose q 3–6 months; BP each visit",
      sideEffects: "Nephrotoxicity, hypertension, dyslipidemia, gingival hyperplasia, hypertrichosis, hyperkalemia",
      notes: "Available as oral suspension (useful for young children unable to swallow tablets). Lower trough once sustained remission ≥6–9 months."
    },
    {
      name: "Tacrolimus (CNI)",
      dose: "0.1–0.2 mg/kg/day in 2 divided doses",
      duration: "2–3 years",
      trough: "4–8 ng/mL",
      monitoring: "Same as cyclosporine; also blood glucose q 3–6 months",
      sideEffects: "Nephrotoxicity, tremors, headache, diarrhea, glucose intolerance, hypomagnesemia, seizures",
      notes: "Preferred over cyclosporine — no cosmetic side effects. Not available as suspension; use in children who can swallow capsules."
    },
    {
      name: "Rituximab",
      dose: "375 mg/m² IV slow infusion, 2 doses 1 week apart (confirm B-cell depletion CD19 <5/µL or <1% of CD45+)",
      duration: "1–2 additional doses at weekly intervals if CD19 target not met (max 4 doses). Re-dose at B-cell recovery (~6–9 months).",
      trough: "CD19 count post-infusion",
      monitoring: "Pre-dose: CBC, LFTs, Hep B/C and HIV serology, IgG level. Post: CD19 counts, CBC, IgG",
      sideEffects: "Infusion reactions (fever, chills, bronchospasm), neutropenia, hypogammaglobulinemia, Pneumocystis jirovecii pneumonia, Hep B reactivation",
      notes: "Avoid in <5–7 yr (risk of hypogammaglobulinemia). Give during REMISSION (urinary loss reduces efficacy in relapse). Give cotrimoxazole prophylaxis (5 mg/kg TMP on alternate days) if combined with CNI or MMF."
    },
  ];

  return (
    <div className="space-y-4">
      <Alert className="bg-blue-50 border-blue-200">
        <Droplet className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-blue-800 text-sm">
          <strong>ISPN 2021 NS Guidelines (Indian Society of Pediatric Nephrology):</strong> Based on GRADE evidence — for SSNS, FRNS, SDNS and supportive care. For SRNS, see separate ISPN 2021 SRNS guidelines.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="protocol">
        <TabsList className="flex flex-wrap gap-1 h-auto">
          <TabsTrigger value="protocol">Protocol</TabsTrigger>
          <TabsTrigger value="frns">FRNS/SDNS Agents</TabsTrigger>
          <TabsTrigger value="diet">Diet Builder</TabsTrigger>
          <TabsTrigger value="vaccination">Vaccination</TabsTrigger>
        </TabsList>

        {/* ── TAB 1: Main Protocol ── */}
        <TabsContent value="protocol" className="space-y-3 mt-3">
          {[
            {
              title: "Definitions (ISPN 2021 Box I)",
              color: "bg-slate-50 border-slate-200",
              items: [
                "Nephrotic syndrome: proteinuria ≥40 mg/m²/hr (or Up/Uc ≥2 mg/mg; 3–4+ dipstick) + albumin <3 g/dL + edema",
                "Remission: protein nil/trace for 3 consecutive days (Up/Uc <0.2 mg/mg)",
                "Relapse: protein ≥3+ for 3 consecutive days after remission",
                "Frequent relapses (FRNS): ≥2 relapses in first 6 months OR ≥3 in any 6 months OR ≥4 in 1 year",
                "Steroid dependence (SDNS): 2 consecutive relapses while on AD steroids or within 14 days of stopping",
                "Steroid resistance (SRNS): no complete remission after 6 weeks daily prednisolone at 60 mg/m²/day"
              ]
            },
            {
              title: "First Episode Treatment (ISPN 2021 Guideline 3 — 1A evidence)",
              color: "bg-blue-50 border-blue-200",
              items: [
                "Prednisolone 60 mg/m²/day (max 60 mg; or 2 mg/kg/day) in 1–2 divided doses × 6 weeks",
                "Then 40 mg/m² (max 40 mg; or 1.5 mg/kg) on ALTERNATE DAYS as single morning dose × 6 weeks",
                "Then STOP (total 12 weeks). No evidence for longer initial therapy (PREDNOS trial).",
                "BSA-based dosing preferred in young children (more accurate than weight-based)",
                "Give prednisolone WITH food; antacids NOT routinely required"
              ]
            },
            {
              title: "Relapse Treatment (ISPN 2021 Guideline 4 — 1C evidence)",
              color: "bg-yellow-50 border-yellow-200",
              items: [
                "Prednisolone 60 mg/m²/day (2 mg/kg/day; max 60 mg) until remission (protein trace/nil × 3 days)",
                "Then 40 mg/m² (1.5 mg/kg; max 40 mg) on alternate days × 4 weeks",
                "Remission usually achieved within 7–10 days; daily therapy rarely needed >2 weeks",
                "If no remission after 6 weeks daily prednisolone → SRNS (refer to paediatric nephrologist)"
              ]
            },
            {
              title: "FRNS/SDNS Management — Step-up Approach (ISPN 2021 Guideline 5 — Fig. 1)",
              color: "bg-purple-50 border-purple-200",
              items: [
                "Step 1: Alternate-day prednisolone 0.5–0.7 mg/kg for 6–12 months (taper to 0.2–0.3 mg/kg if sustained remission)",
                "Step 2 (mild disease / steroid threshold ≤0.7 mg/kg AD): Levamisole OR MMF (12–24 months)",
                "Step 3 (high threshold >1 mg/kg AD, significant steroid toxicity, complicated relapses): MMF at higher dose OR Cyclophosphamide",
                "Step 4 (difficult-to-treat = failure of ≥2 agents): Cyclosporine or Tacrolimus (CNI)",
                "Step 5 (failed CNI or prolonged use): Rituximab",
                "During infections on AD prednisolone: switch to DAILY for 5–7 days to prevent infection-triggered relapse (1B)"
              ]
            },
            {
              title: "Edema Management (ISPN 2021 Guideline 6)",
              color: "bg-cyan-50 border-cyan-200",
              items: [
                "Mild edema (≤7% wt gain): salt restriction only; prednisolone causes diuresis within 1 week",
                "Moderate edema (>7%): FIRST exclude hypovolemia (FENa <0.5%, K-index >0.6, BUN/Cr >100). If euvolemic: Oral furosemide 2–4 mg/kg/day ± spironolactone if prolonged",
                "Refractory: Add metolazone 0.2–0.4 mg/kg/day OR IV furosemide 1–2 mg/kg q8–12h or infusion at 0.1–0.4 mg/kg/hr",
                "Severe/refractory: IV albumin 20% (0.5–1 g/kg over 4 hr) + IV furosemide at end",
                "Hypovolemia: IV NS 10–20 mL/kg bolus → IV/oral hydration + IV albumin 20% 0.5–1 g/kg over 3–4 hr"
              ]
            },
            {
              title: "Complications & Supportive Care",
              color: "bg-red-50 border-red-200",
              items: [
                "Infections: Chief complication (19–44% hospitalizations). Peritonitis (pneumococcus/E. coli): IV ceftriaxone/cefotaxime 7–10 days",
                "Varicella: IV acyclovir 1500 mg/m²/day in 3 doses (or oral 80 mg/kg/day in 4 doses) × 7–10 days",
                "Thrombosis (rare in children ~3%): avoid central lines; LMWH enoxaparin for active thrombosis",
                "Hypertension: amlodipine as first line; ACE-I if proteinuria-driven",
                "Steroid toxicity: calcium 250–750 mg/day + Vitamin D 400–800 IU/day; growth monitoring q 3–6 months",
                "Stress dosing: if steroids >2 wks in past year → hydrocortisone during fever ≥38°C, surgery, major illness"
              ]
            },
            {
              title: "Kidney Biopsy Indications (ISPN 2021 Guideline 2 — 1B)",
              color: "bg-slate-50 border-slate-200",
              items: [
                "Persistent microscopic hematuria, gross hematuria, or AKI not attributed to hypovolemia",
                "Systemic features: fever, rash, arthralgia, low complement C3",
                "Initial or late steroid resistance (SRNS)",
                "Before starting CNI therapy (to establish baseline histology)",
                "Prolonged CNI therapy >30–36 months or declining eGFR on CNI"
              ]
            }
          ].map((s, i) => (
            <Card key={i} className={`border-2 ${s.color}`}>
              <CardHeader className="pb-2 pt-3 px-4"><CardTitle className="text-sm font-bold">{s.title}</CardTitle></CardHeader>
              <CardContent className="px-4 pb-3">
                <ul className="space-y-1.5">
                  {s.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ── TAB 2: FRNS/SDNS Drug Details ── */}
        <TabsContent value="frns" className="space-y-3 mt-3">
          <Alert className="bg-purple-50 border-purple-200">
            <Pill className="w-4 h-4 text-purple-700" />
            <AlertDescription className="text-purple-900 text-sm">
              <strong>ISPN 2021 Steroid-Sparing Agents (Table II).</strong> Choice guided by disease severity, steroid threshold, adverse effects, age, cost and parental preference. Click each agent to expand full details.
            </AlertDescription>
          </Alert>
          <DrugSection title="🟡 Levamisole — First-line mild FRNS" color="bg-yellow-50 border-yellow-200" drugs={[FRNS_DRUGS[0]]} />
          <DrugSection title="🟠 Mycophenolate Mofetil (MMF) — SDNS / FRNS" color="bg-orange-50 border-orange-200" drugs={[FRNS_DRUGS[1]]} />
          <DrugSection title="🔴 Cyclophosphamide — High steroid threshold / Significant toxicity" color="bg-red-50 border-red-200" drugs={[FRNS_DRUGS[2]]} />
          <DrugSection title="🔵 Cyclosporine (CNI) — Difficult-to-treat SSNS" color="bg-blue-50 border-blue-200" drugs={[FRNS_DRUGS[3]]} />
          <DrugSection title="🔵 Tacrolimus (CNI) — Difficult-to-treat SSNS (preferred)" color="bg-indigo-50 border-indigo-200" drugs={[FRNS_DRUGS[4]]} />
          <DrugSection title="🟣 Rituximab — Failed CNI or Prolonged use" color="bg-purple-50 border-purple-200" drugs={[FRNS_DRUGS[5]]} />

          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-green-800">Monitoring Summary (All Agents)</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-green-100">
                      <th className="border border-green-200 p-2 text-left">Drug</th>
                      <th className="border border-green-200 p-2 text-left">CBC</th>
                      <th className="border border-green-200 p-2 text-left">LFTs</th>
                      <th className="border border-green-200 p-2 text-left">Renal</th>
                      <th className="border border-green-200 p-2 text-left">Other</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Levamisole", "q 2–3 mo", "q 4–6 mo", "—", "ANCA if vasculitis suspected"],
                      ["MMF", "q 3–6 mo", "q 3–6 mo", "—", "—"],
                      ["Cyclophosphamide", "q 2 weeks", "—", "—", "Hydration; hold if TLC <4000"],
                      ["CNI (both)", "—", "q 3–6 mo", "Cr, K⁺ q 3–6 mo", "Glucose (TAC), lipids, trough levels"],
                      ["Rituximab", "Post-infusion", "Pre-dose", "—", "CD19, IgG, Hep B/HIV serology"],
                    ].map((row, i) => (
                      <tr key={i} className="even:bg-green-50">
                        {row.map((cell, j) => <td key={j} className="border border-green-200 p-2">{cell}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 3: Diet Builder ── */}
        <TabsContent value="diet" className="mt-3">
          <Card className="border-amber-200">
            <CardHeader className="bg-amber-50 border-b border-amber-200 pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <UtensilsCrossed className="w-4 h-4 text-amber-600" />
                NS Diet Plan Generator (ISPN / KDIGO based)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <DietBuilder />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 4: Vaccination ── */}
        <TabsContent value="vaccination" className="mt-3">
          <Card className="border-green-200">
            <CardHeader className="bg-green-50 border-b border-green-200 pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Syringe className="w-4 h-4 text-green-600" />
                Vaccination Plan (ISPN 2021 — Guideline 7 / Tables IV & V)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <VaccinationPlan />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}