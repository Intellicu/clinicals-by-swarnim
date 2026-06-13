import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Pill, Activity } from "lucide-react";

const AGENTS = [
  {
    name: "Levamisole",
    class: "Immunomodulator",
    tier: "1st line",
    tierColor: "bg-green-100 text-green-800 border-green-300",
    indications: ["FRNS", "SDNS"],
    guideline: "IPNA 2023",
    dose: "2.5 mg/kg alternate-day (max 150 mg/dose)",
    frequency: "Alternate-day (EOD)",
    route: "PO",
    duration: "12–24 months",
    tdm: false,
    monitoring: "CBC (ANC) monthly — MANDATORY. LFT q3 months. Creatinine q3 months.",
    preWorkup: "CBC (ANC normal before starting), LFT, creatinine, ANCA baseline, UPCR.",
    target: "No TDM. Clinical response + monthly ANC.",
    sideEffects: "Agranulocytosis (~0.3% — potentially fatal), ANCA vasculitis rash (rare), nausea",
    emergency: "AGRANULOCYTOSIS: fever + illness → IMMEDIATE CBC → ANC <500 = admit + G-CSF + antibiotics",
    costIndia: "~₹15/tablet (Decaris 50 mg — widely available as anthelmintic)",
    brands: "Decaris 50 mg (Janssen/Cipla), Vermisol-L 50 mg",
    evidence: "IPNA 2023 Grade 1B. Meta-analysis (Gruppen 2008): 40–60% relapse reduction. Abeyagunawardena RCT 2021.",
    pearls: [
      "Cheapest first-line steroid-sparing in India — ₹15/tablet",
      "Same drug as Decaris (anthelmintic) — widely available",
      "Written emergency protocol for ALL families: fever → immediate CBC",
      "Do NOT rechallenge after agranulocytosis",
      "IPNA 2023: equivalent to rituximab for FRNS/SDNS in guidelines"
    ]
  },
  {
    name: "Mycophenolate Mofetil (MMF)",
    class: "Antimetabolite",
    tier: "1st–2nd line",
    tierColor: "bg-blue-100 text-blue-800 border-blue-300",
    indications: ["FRNS", "SDNS", "Post-Transplant", "LN Class III/IV", "SRNS adjunct"],
    guideline: "IPNA 2023 / KDIGO 2022",
    dose: "600 mg/m²/dose BD (max 1 g/dose = 2 g/day)",
    frequency: "BD (every 12 hours)",
    route: "PO",
    duration: "Transplant: indefinite. NS: 12–24 months. LN: 6 months induction + 36 months maintenance",
    tdm: false,
    monitoring: "CBC monthly (hold if WBC <3000 or ANC <1000). LFT q3 months. Creatinine monthly. CMV/BK PCR post-transplant.",
    preWorkup: "CBC, LFT, creatinine. Urine pregnancy test (MANDATORY in women). HBsAg, anti-HBc. CMV/EBV serology.",
    target: "BSA-based dosing. Clinical response + CBC monitoring.",
    sideEffects: "GI toxicity (nausea, diarrhoea — switch to Myfortic if severe), myelosuppression, CMV/BK infection, teratogenicity",
    emergency: "TERATOGENIC: absolute CI in pregnancy. Never crush tablets (cytotoxic dust).",
    costIndia: "Moderate — Cellcept 500 mg ~₹180/tab; Cipla generic ~₹80/tab",
    brands: "Cellcept (Roche), Mycophenate (Cipla), Mofetil (Alkem), Myfortic (enteric-coated, Novartis)",
    evidence: "ACCESS trial: MMF = azathioprine in LN. MAINTAIN trial: MMF maintenance superior. KDIGO 2022 Grade 1B.",
    pearls: [
      "MMF 1000 mg = Myfortic (EC-MPS) 720 mg — not interchangeable 1:1",
      "GI intolerance: switch to Myfortic (enteric-coated) — better GI tolerability",
      "BK nephropathy: first step is MMF reduction 50%",
      "BSA-based dosing more accurate than weight-based in children",
      "Contraception mandatory throughout therapy and 6 weeks after"
    ]
  },
  {
    name: "Cyclosporine",
    class: "Calcineurin Inhibitor (CNI)",
    tier: "2nd line",
    tierColor: "bg-amber-100 text-amber-800 border-amber-300",
    indications: ["SRNS", "SDNS", "FRNS", "Membranous Nephropathy"],
    guideline: "IPNA 2023",
    dose: "SRNS: 3–5 mg/kg/day BD. Target C0: 100–150 ng/mL. Membranous: C0 100–175 ng/mL.",
    frequency: "BD (every 12 hours — consistent timing)",
    route: "PO",
    duration: "SRNS: 12–24 months. SDNS/FRNS: 12–24 months. MN: 12 months minimum.",
    tdm: true,
    monitoring: "C0 (trough) at weeks 1–2, 4, monthly ×3, then q3 months. Creatinine weekly ×1 month, then monthly. BP at every visit. CBC, LFT, K+, Mg2+, uric acid, cholesterol: monthly ×3, then q3 months. Gingival inspection 3-monthly.",
    preWorkup: "Creatinine + eGFR (MUST be >30), BP, CBC, LFT, uric acid, lipid profile, Mg2+, K+, UPCR. HBsAg. Dental review (gingival hyperplasia baseline).",
    target: "SRNS/FRNS/SDNS: C0 100–150 ng/mL. MN: C0 100–175 ng/mL. Transplant month 1: C2 1000–1500 ng/mL.",
    sideEffects: "Nephrotoxicity (CNI toxicity), hypertension (50%), gingival hyperplasia, hypertrichosis, hyperlipidaemia, hyperuricemia",
    emergency: "GRAPEFRUIT JUICE ABSOLUTE CONTRAINDICATION — 20–200% level increase. Sandimmun ≠ Neoral — not interchangeable without TDM recheck.",
    costIndia: "High — Panimun Bioral 25 mg ~₹28/cap",
    brands: "Panimun Bioral (Panacea Biotec), Imusporin (Sun), Ciclosporin (Cipla), Sandimmun Neoral (Novartis)",
    evidence: "IPNA 2023 Grade 1B for SRNS. Equivalent to tacrolimus for SRNS proteinuria reduction.",
    pearls: [
      "Gingival hyperplasia: chlorhexidine mouthwash + 6-monthly dental review",
      "Hypertension in 50%: add amlodipine (mild CNI interaction)",
      "Creatinine rise >25% at 3 months: biopsy to exclude CNI nephrotoxicity",
      "Generic brands bioequivalent but switch requires TDM recheck",
      "Statins: avoid simvastatin/atorvastatin (rhabdomyolysis) — use pravastatin"
    ]
  },
  {
    name: "Tacrolimus",
    class: "Calcineurin Inhibitor (CNI)",
    tier: "2nd line",
    tierColor: "bg-amber-100 text-amber-800 border-amber-300",
    indications: ["SRNS", "SDNS", "FRNS", "Post-Transplant"],
    guideline: "IPNA 2023 / KDIGO 2022",
    dose: "SRNS: 0.05–0.15 mg/kg/day BD. Transplant: 0.1–0.3 mg/kg/day BD. All TDM-guided.",
    frequency: "BD — exactly every 12 hours",
    route: "PO",
    duration: "SRNS/SDNS: 12–24 months. Transplant: lifelong.",
    tdm: true,
    monitoring: "TDM (C0 trough before morning dose) at days 3–5, 10–14, monthly ×3, then q3 months. Creatinine weekly ×1 month, then monthly. Fasting glucose quarterly (PTDM). CBC, LFT, K+, Mg2+ monthly ×3, then q3 months.",
    preWorkup: "Creatinine + eGFR, BP, CBC, LFT, fasting glucose + HbA1c, Mg2+, K+. HBsAg, anti-HBc. UPCR. Vaccination check.",
    target: "SRNS: C0 5–10 ng/mL. SDNS/FRNS: C0 4–8 ng/mL. Transplant year 1: C0 8–12 ng/mL. Transplant maintenance: C0 5–8 ng/mL.",
    sideEffects: "Nephrotoxicity, PTDM (~20%), hypertension, tremor, headache, infections, hyperkalemia, hypomagnesemia",
    emergency: "CYP3A4 INTERACTIONS: fluconazole/voriconazole = 2–10× level increase → nephrotoxicity. Reduce tacrolimus 50% when starting azoles.",
    costIndia: "Very high — Pangraf 1 mg ~₹120/cap. Original Prograf more expensive.",
    brands: "Pangraf (Panacea Biotec), Tacrograf (Concord), Tacromus (Sun), Prograf (Astellas — originator)",
    evidence: "IPNA 2023 Grade 1B. KDIGO 2022: preferred CNI for transplant. REENAL trial: equivalent to rituximab in SDNS.",
    pearls: [
      "After diarrhoea: ALWAYS recheck trough urgently (erratic absorption)",
      "PTDM ~20%: monitor fasting glucose quarterly",
      "Grapefruit juice strictly avoided",
      "BK virus: reduce to low-normal trough range as first step",
      "Indian generics equivalent but switch requires TDM recheck"
    ]
  },
  {
    name: "Cyclophosphamide",
    class: "Alkylating Agent",
    tier: "Single course only",
    tierColor: "bg-orange-100 text-orange-800 border-orange-300",
    indications: ["FRNS (single course)", "SDNS (single course)", "SRNS", "LN induction", "ANCA vasculitis"],
    guideline: "IPNA 2023 / KDIGO GN 2021",
    dose: "Oral: 2–3 mg/kg/day × 8–12 weeks (max cumulative 168 mg/kg). IV pulse: 500–750 mg/m² monthly × 6.",
    frequency: "OD (morning) for oral. Monthly for IV pulse.",
    route: "PO / IV",
    duration: "Oral: 8–12 weeks (single course only). IV pulse: 6 monthly doses.",
    tdm: false,
    monitoring: "CBC before each IV pulse (hold if WBC <3000 or PMN <1500). CBC weekly for oral. Urinalysis before each pulse (haematuria = hold). LFT, creatinine monthly.",
    preWorkup: "CBC, creatinine, LFT, urinalysis (haematuria screen). Gonadal preservation discussion if cumulative >168 mg/kg. Vaccinations complete.",
    target: "No TDM. Cumulative dose tracking mandatory (max 168 mg/kg oral; max 200 mg/kg total).",
    sideEffects: "Alopecia (temporary), myelosuppression, haemorrhagic cystitis (acrolein), gonadotoxicity at high cumulative doses, infections, nausea",
    emergency: "HAEMATURIA during oral course → hold immediately. IV: MESNA + aggressive hydration mandatory.",
    costIndia: "Low — Endoxan/Cycloxan ~₹50–80/50 mg tab",
    brands: "Endoxan (Baxter), Cycloxan (Cipla), Cycram (Pharmos)",
    evidence: "IPNA 2023: limited to single course for FRNS/SDNS (do not repeat). Grade 1B.",
    pearls: [
      "SINGLE COURSE ONLY for NS — do not repeat (gonadotoxicity risk)",
      "Morning oral dosing: acrolein metabolite cleared during waking hours",
      "MESNA for IV doses >500 mg/m² (20% of dose at 0, 4, 8h)",
      "Hydration: 2–3 L/m² for 24h around IV pulse",
      "GnRH analogue for adolescent girls with high cumulative dose"
    ]
  },
  {
    name: "Rituximab",
    class: "Anti-CD20 Biologic",
    tier: "1st line (refractory/FRNS)",
    tierColor: "bg-violet-100 text-violet-800 border-violet-300",
    indications: ["FRNS (refractory or frequent)", "SDNS", "SRNS", "LN refractory", "ANCA vasculitis"],
    guideline: "IPNA 2023 (Grade 1A for FRNS/SDNS)",
    dose: "375 mg/m²/dose IV × 4 doses (weekly). Or 750 mg/m² × 2 doses (q2 weeks).",
    frequency: "Weekly × 4 (induction). Redose at CD19 recovery + clinical relapse.",
    route: "IV",
    duration: "Single induction course. Redosing every 6–12 months based on CD19 + relapse.",
    tdm: false,
    monitoring: "CD19 count at 1 month (target <1% = B-cell depletion confirmed). IgG at 3, 6, 9, 12 months. CBC monthly.",
    preWorkup: "CBC. Liver transaminases (ALT, AST). HBsAg. Anti-HBc. HIV serology. Serum IgG.",
    target: "CD19 <1% = confirmed B-cell depletion. IgG >600 mg/dL. Redose if CD19 >5/µL or >1% of CD45+ cells after initial 2 doses.",
    sideEffects: "Infusion reactions (first dose highest risk — premedicate), hypogammaglobulinaemia, infections (bacterial, PCP, HBV reactivation), late neutropenia",
    emergency: "PREMEDICATE before each dose: paracetamol + antihistamine (chlorpheniramine) ± prednisolone 30 min before infusion. HBV reactivation can be fatal — screen ALL patients. Hold if IgG <400 mg/dL.",
    costIndia: "Very high — ₹20,000–40,000/vial. Biosimilars (Reditux, Maball) ~₹8,000–15,000/vial.",
    brands: "Mabthera (Roche), Reditux (Dr Reddy's), Maball (Reliance Life Sciences)",
    evidence: "RITUXNS trial (Iijima NEJM 2014). REENAL trial (Basu Lancet 2020). IPNA 2023 Grade 1A for FRNS/SDNS.",
    pearls: [
      "ISPN SSNS Guideline: 375 mg/m² × 2 doses, 1 week apart (redose if CD19 >5/µL or >1% CD45+ after initial 2 doses)",
      "Indian biosimilars (Reditux, Maball) = comparable efficacy at lower cost",
      "Check IgG before each course — hold if IgG severely low (<400 mg/dL)",
      "CD19 monitoring: additional doses if CD19 >5/µL OR >1% CD45+ after initial course",
      "Do NOT give live vaccines for 12 months post-rituximab"
    ]
  }
];

const COMPARISON_TABLE = [
  { drug: "Levamisole", indication: "FRNS, SDNS (1st line)", monitoring: "FBC monthly (neutropenia)", cost: "Very Low ₹" },
  { drug: "MMF", indication: "FRNS, SDNS (2nd line), LN", monitoring: "FBC, LFT 3-monthly", cost: "Moderate ₹₹" },
  { drug: "Cyclosporine", indication: "SDNS, SRNS", monitoring: "Trough 100–150 ng/mL, Cr", cost: "High ₹₹₹" },
  { drug: "Tacrolimus", indication: "SDNS, SRNS, Transplant", monitoring: "Trough 4–8 ng/mL, Glucose", cost: "Very High ₹₹₹₹" },
  { drug: "Cyclophosphamide", indication: "FRNS (single course only)", monitoring: "FBC weekly, urine", cost: "Low ₹" },
  { drug: "Rituximab", indication: "Refractory SDNS/SRNS", monitoring: "CD19, IgG, HBV, FBC", cost: "Very High ₹₹₹₹₹" },
];

function AgentCard({ agent }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-start justify-between gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="text-sm font-bold text-slate-900">{agent.name}</p>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${agent.tierColor}`}>{agent.tier}</span>
            {agent.tdm && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">TDM</span>}
          </div>
          <p className="text-xs text-slate-500">{agent.class} · {agent.indications.slice(0, 3).join(", ")}</p>
          <p className="text-xs text-teal-700 font-semibold mt-0.5">{agent.dose}</p>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-slate-100">
          {/* Dosing */}
          <div className="grid grid-cols-2 gap-2 pt-3">
            <div className="bg-teal-50 rounded-xl p-2.5 text-center border border-teal-100">
              <p className="text-[10px] text-teal-600 font-bold uppercase">Frequency</p>
              <p className="text-xs font-bold text-teal-900 mt-0.5">{agent.frequency}</p>
            </div>
            <div className="bg-indigo-50 rounded-xl p-2.5 text-center border border-indigo-100">
              <p className="text-[10px] text-indigo-600 font-bold uppercase">Duration</p>
              <p className="text-xs font-bold text-indigo-900 mt-0.5">{agent.duration}</p>
            </div>
          </div>

          {/* Pre-treatment workup */}
          <div className="bg-blue-50 rounded-xl px-3 py-2.5 border border-blue-100">
            <p className="text-[10px] font-bold text-blue-700 uppercase mb-1">🔬 Pre-treatment Workup</p>
            <p className="text-xs text-blue-800">{agent.preWorkup}</p>
          </div>

          {/* TDM / Target */}
          {agent.tdm && (
            <div className="bg-violet-50 rounded-xl px-3 py-2.5 border border-violet-200">
              <p className="text-[10px] font-bold text-violet-700 uppercase mb-1">🎯 TDM Target Level</p>
              <p className="text-xs text-violet-900 font-semibold">{agent.target}</p>
            </div>
          )}

          {/* Monitoring */}
          <div className="bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-200">
            <p className="text-[10px] font-bold text-slate-600 uppercase mb-1">📊 Monitoring Protocol</p>
            <p className="text-xs text-slate-700">{agent.monitoring}</p>
          </div>

          {/* Emergency / Warning */}
          <Alert className="bg-red-50 border-red-200 py-2">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            <AlertDescription className="text-red-800 text-xs">{agent.emergency}</AlertDescription>
          </Alert>

          {/* Side effects */}
          <div className="bg-amber-50 rounded-xl px-3 py-2.5 border border-amber-100">
            <p className="text-[10px] font-bold text-amber-700 uppercase mb-1">⚠️ Side Effects</p>
            <p className="text-xs text-amber-800">{agent.sideEffects}</p>
          </div>

          {/* Evidence */}
          <div className="bg-green-50 rounded-xl px-3 py-2.5 border border-green-100">
            <p className="text-[10px] font-bold text-green-700 uppercase mb-1">📚 Evidence ({agent.guideline})</p>
            <p className="text-xs text-green-800">{agent.evidence}</p>
          </div>

          {/* Clinical Pearls */}
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase mb-1.5">💡 Clinical Pearls</p>
            <ul className="space-y-1">
              {agent.pearls.map((p, i) => (
                <li key={i} className="flex gap-2 text-xs text-slate-700">
                  <span className="text-teal-500 flex-shrink-0">•</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Cost & Brands */}
          <div className="flex gap-2 text-xs bg-slate-50 rounded-xl px-3 py-2 border border-slate-100">
            <span className="text-slate-500 flex-shrink-0">India cost:</span>
            <span className="text-slate-700 font-semibold flex-1">{agent.costIndia}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SteroidSparingAgents() {
  const [showComparison, setShowComparison] = useState(false);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-indigo-600 rounded-2xl p-4 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold">Steroid-Sparing Agents</h2>
            <p className="text-xs text-teal-100">IPNA 2023 · KDIGO 2022 · Evidence-based</p>
          </div>
        </div>
        <p className="text-xs text-teal-100">
          Indicated for FRNS, SDNS, SRNS, or significant steroid toxicity. Choice depends on disease severity, cost, availability, and indication. Escalate: Levamisole → MMF → CNI → Rituximab.
        </p>
      </div>

      {/* General instructions */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-3 space-y-1.5">
          <p className="text-xs font-bold text-amber-800 uppercase">General Instructions for All Steroid-Sparing Agents</p>
          {[
            "MMF/Myfortic: Take with food. Myfortic (enteric-coated) — do NOT crush; avoid antacids 2h before/after",
            "Cyclosporine: Take consistently with/without food; avoid grapefruit (increases levels); use same brand always",
            "Tacrolimus: Take on empty stomach (1h before meals); consistent timing; avoid grapefruit strictly",
            "Levamisole: Can be taken with food; alternate-day schedule must be strictly maintained",
            "All immunosuppressants: avoid contact with sick/infected people; wear masks in crowded places",
            "No live vaccines: chicken pox, MMR, oral polio",
            "Report fever, mouth ulcers, unusual bruising immediately — signs of bone marrow suppression",
            "Never stop without doctor advice — sudden stop risks relapse",
          ].map((tip, i) => (
            <p key={i} className="text-xs text-amber-800 flex gap-2">
              <span className="text-amber-500 flex-shrink-0">•</span>{tip}
            </p>
          ))}
        </CardContent>
      </Card>

      {/* Comparison table toggle */}
      <button
        onClick={() => setShowComparison(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-slate-200 hover:border-teal-300 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-teal-600" />
          <span className="text-sm font-bold text-slate-700">Quick Comparison Table</span>
        </div>
        {showComparison ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      {showComparison && (
        <div className="overflow-x-auto bg-white rounded-xl border border-slate-200">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-teal-50">
                <th className="text-left px-3 py-2 font-bold text-teal-800">Drug</th>
                <th className="text-left px-3 py-2 font-bold text-teal-800">Indication</th>
                <th className="text-left px-3 py-2 font-bold text-teal-800">Key Monitoring</th>
                <th className="text-left px-3 py-2 font-bold text-teal-800">Cost (India)</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_TABLE.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                  <td className="px-3 py-2 font-semibold text-slate-900">{row.drug}</td>
                  <td className="px-3 py-2 text-slate-600">{row.indication}</td>
                  <td className="px-3 py-2 text-slate-600">{row.monitoring}</td>
                  <td className="px-3 py-2 text-slate-600">{row.cost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Agent cards */}
      <div className="space-y-3">
        {AGENTS.map(agent => (
          <AgentCard key={agent.name} agent={agent} />
        ))}
      </div>
    </div>
  );
}