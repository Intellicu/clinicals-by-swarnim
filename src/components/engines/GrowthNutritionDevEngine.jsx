import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Baby, Utensils, Brain, Shield, ChevronDown, ChevronUp, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";

// ── Growth Assessment Engine ──────────────────────────────────────────────
function GrowthAssessmentEngine() {
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [hc, setHc] = useState("");
  const [sex, setSex] = useState("male");
  const [result, setResult] = useState(null);

  const calcZscore = (value, median, sd) => sd > 0 ? ((value - median) / sd).toFixed(2) : "N/A";

  const assess = () => {
    const ageN = parseFloat(age);
    const wN = parseFloat(weight);
    const hN = parseFloat(height);
    if (!ageN || !wN || !hN) return;

    // Simplified z-score estimation (WHO reference approximations)
    const waz = wN < 15 ? (wN / (ageN * 1.2 + 3) - 1) * 3 : (wN / (ageN * 2.5 + 8) - 1) * 3;
    const haz = hN < 80 ? (hN / (ageN * 2.5 + 50) - 1) * 3 : (hN / (ageN * 6 + 80) - 1) * 2.5;
    const bmi = wN / ((hN / 100) ** 2);

    const nutritionalStatus = () => {
      if (waz < -3) return { label: "Severe Acute Malnutrition (SAM)", color: "bg-red-100 text-red-800", action: "Admit · F75 therapeutic formula · RUTF · Treat infections" };
      if (waz < -2) return { label: "Moderate Acute Malnutrition (MAM)", color: "bg-orange-100 text-orange-800", action: "CSBE/supplementary feeding · Micronutrient supplementation · Follow-up in 2 weeks" };
      if (waz > 2) return { label: "Overweight", color: "bg-amber-100 text-amber-800", action: "Dietary counselling · Activity assessment · Screen for metabolic complications" };
      return { label: "Normal Nutritional Status", color: "bg-green-100 text-green-800", action: "Continue routine monitoring · IAP growth chart plotting" };
    };

    const growthStatus = () => {
      if (haz < -3) return { label: "Severe Stunting", color: "bg-red-100 text-red-800" };
      if (haz < -2) return { label: "Stunting (Moderate)", color: "bg-orange-100 text-orange-800" };
      if (haz > 2) return { label: "Tall Stature", color: "bg-blue-100 text-blue-800" };
      return { label: "Normal Height", color: "bg-green-100 text-green-800" };
    };

    setResult({ waz: waz.toFixed(2), haz: haz.toFixed(2), bmi: bmi.toFixed(1), nutritionalStatus: nutritionalStatus(), growthStatus: growthStatus() });
  };

  return (
    <div className="space-y-4">
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-5 h-5 text-emerald-700" />
          <h2 className="font-bold text-base text-emerald-900">Growth Assessment Engine</h2>
          <Badge className="bg-emerald-600 text-white text-xs">WHO/IAP</Badge>
        </div>
        <p className="text-xs text-emerald-700">Z-scores · Nutritional status · Growth failure · CKD growth assessment</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Age (months)", value: age, set: setAge, placeholder: "e.g. 24" },
          { label: "Sex", isSelect: true },
          { label: "Weight (kg)", value: weight, set: setWeight, placeholder: "e.g. 10.5" },
          { label: "Height (cm)", value: height, set: setHeight, placeholder: "e.g. 85" },
          { label: "Head Circ. (cm, opt)", value: hc, set: setHc, placeholder: "e.g. 47" },
        ].map((f, i) => f.isSelect ? (
          <div key={i}>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Sex</label>
            <select value={sex} onChange={e => setSex(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none">
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        ) : (
          <div key={i}>
            <label className="text-xs font-semibold text-slate-600 block mb-1">{f.label}</label>
            <input value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.placeholder} type="number" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300" />
          </div>
        ))}
      </div>

      <Button onClick={assess} className="w-full bg-emerald-600 hover:bg-emerald-700">Assess Growth</Button>

      {result && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Weight-for-Age Z", value: result.waz },
              { label: "Height-for-Age Z", value: result.haz },
              { label: "BMI", value: result.bmi },
            ].map(m => (
              <div key={m.label} className="bg-white border border-slate-200 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-slate-900">{m.value}</p>
                <p className="text-xs text-slate-500">{m.label}</p>
              </div>
            ))}
          </div>
          <div className={`rounded-xl p-3 ${result.nutritionalStatus.color}`}>
            <p className="font-bold text-sm">{result.nutritionalStatus.label}</p>
            <p className="text-xs mt-1">{result.nutritionalStatus.action}</p>
          </div>
          <div className={`rounded-xl p-3 ${result.growthStatus.color}`}>
            <p className="font-bold text-sm">{result.growthStatus.label}</p>
          </div>
        </div>
      )}

      {/* CKD Growth section */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
        <p className="text-xs font-bold text-blue-800 mb-2">Growth Failure in CKD — Key Points</p>
        {["GFR <60: Monitor height velocity every 3–6 months (Schwartz formula)", "Target height SDS > -1.88 (3rd percentile)", "rhGH: Indicated if height SDS < -1.88 + GFR <75 mL/min/1.73m² + not responding to nutrition", "Optimize: Metabolic acidosis (target HCO₃ ≥22), Nutrition (DRI protein), MBD control", "Post-transplant: Catch-up growth expected if transplant <3 years of age"].map((p, i) => (
          <div key={i} className="flex items-start gap-1.5 mb-1">
            <ArrowRight className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-700">{p}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Developmental Assessment Engine ──────────────────────────────────────
function DevelopmentalAssessmentEngine() {
  const [ageMonths, setAgeMonths] = useState("");
  const [open, setOpen] = useState(null);

  const milestones = {
    "2 months": { gross: "Lifts head 45°, smooth movements", fine: "Hands fisted, follows past midline", lang: "Cooing, social smile", social: "Recognises parent, calms to voice" },
    "4 months": { gross: "Head control complete, rolls front→back", fine: "Hands open, reaches midline", lang: "Laughs, turns to voice", social: "Smiles spontaneously" },
    "6 months": { gross: "Sits with support, rolls both ways", fine: "Transfers, raking grasp", lang: "Babbles (ba ba da da)", social: "Recognises strangers" },
    "9 months": { gross: "Pulls to stand, crawls", fine: "Pincer grasp emerging", lang: "Mama/dada (non-specific)", social: "Stranger anxiety, waves bye" },
    "12 months": { gross: "Walks with support / cruising", fine: "Neat pincer, points", lang: "1–3 words (specific)", social: "Follows 1-step command with gesture" },
    "18 months": { gross: "Walks well, runs clumsily", fine: "Tower of 3–4 cubes", lang: "10–20 words", social: "Symbolic play, self-feeds" },
    "24 months": { gross: "Runs, kicks ball, climbs stairs (2 feet/step)", fine: "Tower of 6, horizontal stroke", lang: "50+ words, 2-word phrases", social: "Parallel play" },
    "36 months": { gross: "Pedals tricycle, stairs alternating feet", fine: "Copies circle, tower of 9", lang: "250+ words, 3-word sentences", social: "Takes turns, imaginative play" },
    "48 months": { gross: "Hops on one foot, catches ball", fine: "Copies cross, draws person 3 parts", lang: "Full sentences, asks 'why'", social: "Cooperative play, understands rules" },
    "60 months": { gross: "Skips, balances 10 sec on one foot", fine: "Copies triangle, writes name", lang: "Fluent speech, tells stories", social: "Friends, understands feelings" },
  };

  const redFlags = [
    { age: "Any age", flag: "Regression / loss of milestones — always abnormal — investigate immediately" },
    { age: "2 months", flag: "No social smile, no visual tracking" },
    { age: "4 months", flag: "No head control, no vocalisation" },
    { age: "6 months", flag: "No sitting with support, no babbling" },
    { age: "12 months", flag: "No single words, no pincer grasp, no pointing" },
    { age: "18 months", flag: "No walking, <6 words, no pretend play — M-CHAT positive" },
    { age: "24 months", flag: "No 2-word phrases, echolalia only — ASD screen" },
    { age: "36 months", flag: "Unintelligible to strangers >50%, no 3-word phrases" },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-1">
          <Brain className="w-5 h-5 text-teal-700" />
          <h2 className="font-bold text-base text-teal-900">Developmental Assessment Engine</h2>
          <Badge className="bg-teal-600 text-white text-xs">IAP/WHO</Badge>
        </div>
        <p className="text-xs text-teal-700">Milestones · Red flags · M-CHAT · ASD · Developmental delay</p>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-600 block mb-1">Child's age (months)</label>
        <input value={ageMonths} onChange={e => setAgeMonths(e.target.value)} placeholder="e.g. 18" type="number" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300" />
      </div>

      {/* Milestones table */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Developmental Milestones</p>
        {Object.entries(milestones).map(([ageLabel, m]) => {
          const isNear = ageMonths && Math.abs(parseInt(ageLabel) - parseInt(ageMonths)) <= 3;
          return (
            <div key={ageLabel} className={`border rounded-xl overflow-hidden ${isNear ? "border-teal-400 shadow-md" : "border-slate-200"}`}>
              <button className={`w-full flex items-center justify-between px-3 py-2.5 text-left ${isNear ? "bg-teal-50" : "bg-white"}`} onClick={() => setOpen(open === ageLabel ? null : ageLabel)}>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${isNear ? "text-teal-800" : "text-slate-700"}`}>{ageLabel}</span>
                  {isNear && <Badge className="bg-teal-600 text-white text-xs">Current age range</Badge>}
                </div>
                {open === ageLabel ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>
              {open === ageLabel && (
                <div className="px-3 pb-3 border-t border-slate-100 pt-2 grid grid-cols-2 gap-2">
                  {[["Gross Motor", m.gross], ["Fine Motor", m.fine], ["Language", m.lang], ["Social", m.social]].map(([domain, val]) => (
                    <div key={domain} className="bg-slate-50 rounded-lg p-2">
                      <p className="text-xs font-bold text-slate-500">{domain}</p>
                      <p className="text-xs text-slate-700 mt-0.5">{val}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Red Flags */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-3">
        <div className="flex items-center gap-1.5 mb-2">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <p className="text-xs font-bold text-red-700">Red Flags — Refer if Present</p>
        </div>
        {redFlags.map((r, i) => (
          <div key={i} className="flex items-start gap-2 mb-1.5">
            <span className="text-xs bg-red-200 text-red-800 px-1.5 rounded font-bold flex-shrink-0">{r.age}</span>
            <p className="text-xs text-red-700">{r.flag}</p>
          </div>
        ))}
      </div>

      {/* M-CHAT summary */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
        <p className="text-xs font-bold text-amber-800 mb-2">M-CHAT-R/F (18–24 months ASD Screen)</p>
        <p className="text-xs text-amber-700">Screen all children at 18 and 24 months. Score ≥3 = refer for full evaluation. Score 2 = M-CHAT follow-up interview.</p>
        <p className="text-xs text-amber-700 mt-1.5">Key items: No pointing (declarative), no eye contact, no response to name, no pretend play, repetitive play.</p>
      </div>
    </div>
  );
}

// ── Vaccination Engine ─────────────────────────────────────────────────────
function VaccinationEngine() {
  const [ageMonths, setAgeMonths] = useState("");
  const [open, setOpen] = useState(null);
  const [specialRisk, setSpecialRisk] = useState("none");

  const schedule = [
    { age: "Birth", vaccines: ["BCG (0.05 mL ID right arm)", "OPV-0 (birth dose)", "Hep B-1 (birth dose, within 24h)"] },
    { age: "6 weeks", vaccines: ["OPV-1", "Penta-1 (DTP+HepB+Hib)", "Rota-1", "fIPV-1", "PCV-1"] },
    { age: "10 weeks", vaccines: ["OPV-2", "Penta-2", "Rota-2", "PCV-2"] },
    { age: "14 weeks", vaccines: ["OPV-3", "Penta-3", "Rota-3 (if 3-dose)", "fIPV-2", "PCV-3"] },
    { age: "6 months", vaccines: ["OPV-4 (IAP optional)", "Hep A-1 (IAP 2023 single dose live)"] },
    { age: "9 months", vaccines: ["MMR-1 (measles-mumps-rubella)", "Varicella-1 (IAP optional)", "MenC (sickle cell/asplenia)"] },
    { age: "12 months", vaccines: ["PCV Booster", "MMR can be given if missed"] },
    { age: "15 months", vaccines: ["MMR-2", "Varicella-2", "PCV Booster (if not given at 12m)"] },
    { age: "16–18 months", vaccines: ["OPV Booster", "DTP Booster-1", "Hib Booster", "fIPV Booster"] },
    { age: "2 years", vaccines: ["Typhoid (TC Vi IM — every 3 years)", "Hep A-2 (killed, 6m after Hep A-1 if killed schedule)"] },
    { age: "4–6 years", vaccines: ["DTP Booster-2", "OPV Booster-2", "MMR-3 (IAP optional)"] },
    { age: "10–12 years", vaccines: ["Td (Tetanus + dT)", "HPV-1 (girls: 2-dose at 0, 6m)", "Meningococcal ACWY"] },
  ];

  const specialGroups = {
    "ckd": ["Annual inactivated Influenza", "Pneumococcal (PCV13 + PPSV23)", "Hep B (check anti-HBs titre — boost if <10 IU/L)", "Hep A (2-dose killed)", "Meningococcal ACWY+B", "NO live vaccines if nephrotic on IS or post-transplant"],
    "transplant": ["All routine inactivated vaccines (give pre-transplant ideally)", "Pneumococcal (PCV + PPSV23) booster 3–6 months post-Tx", "Annual Influenza (inactivated only)", "NO MMR, NO Varicella, NO BCG, NO live oral typhoid post-transplant", "HPV series (9-valent)", "Anti-HBs titre — boost if <10 IU/L"],
    "immunocomp": ["Full inactivated schedule", "NO live vaccines (BCG, MMR, Varicella, OPV, Rota) if on IS therapy", "MMR/Varicella: give if CD4 >200 or off IS >3 months", "Annual influenza (inactivated)", "IGIV passive protection if significant exposure"],
    "premature": ["All vaccines given by chronological age (not corrected age)", "Hep B: defer if birth weight <2 kg until 1 month chronological or discharge", "RSV prophylaxis (palivizumab): <29 weeks or CHD/CLD"],
  };

  return (
    <div className="space-y-4">
      <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-5 h-5 text-cyan-700" />
          <h2 className="font-bold text-base text-cyan-900">Vaccination Engine</h2>
          <Badge className="bg-cyan-600 text-white text-xs">IAP 2023</Badge>
        </div>
        <p className="text-xs text-cyan-700">IAP 2023 schedule · Special risk groups · Live vaccine rules · Catch-up</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1">Child age (months)</label>
          <input value={ageMonths} onChange={e => setAgeMonths(e.target.value)} placeholder="e.g. 15" type="number" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-300" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1">Special Risk Group</label>
          <select value={specialRisk} onChange={e => setSpecialRisk(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none">
            <option value="none">None / Standard</option>
            <option value="ckd">CKD / Renal Disease</option>
            <option value="transplant">Post-Transplant</option>
            <option value="immunocomp">Immunocompromised / IS</option>
            <option value="premature">Premature / LBW</option>
          </select>
        </div>
      </div>

      {specialRisk !== "none" && specialGroups[specialRisk] && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
          <p className="text-xs font-bold text-orange-800 mb-2">⚠️ Special Group: {specialRisk.toUpperCase()} Vaccination Rules</p>
          {specialGroups[specialRisk].map((v, i) => (
            <div key={i} className={`flex items-start gap-2 mb-1.5 ${v.startsWith("NO") ? "text-red-700" : "text-orange-700"}`}>
              {v.startsWith("NO") ? <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" /> : <CheckCircle2 className="w-3 h-3 mt-0.5 flex-shrink-0 text-green-600" />}
              <p className="text-xs">{v}</p>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">IAP 2023 Schedule</p>
        {schedule.map((s) => {
          const isNear = ageMonths && Math.abs(parseInt(s.age) - parseInt(ageMonths)) <= 2;
          return (
            <div key={s.age} className={`border rounded-xl overflow-hidden ${isNear ? "border-cyan-400" : "border-slate-200"}`}>
              <button className={`w-full flex items-center justify-between px-3 py-2.5 ${isNear ? "bg-cyan-50" : "bg-white"}`} onClick={() => setOpen(open === s.age ? null : s.age)}>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${isNear ? "text-cyan-800" : "text-slate-700"}`}>{s.age}</span>
                  {isNear && <Badge className="bg-cyan-600 text-white text-xs">Due now</Badge>}
                </div>
                <span className="text-xs text-slate-400">{s.vaccines.length} vaccines</span>
              </button>
              {open === s.age && (
                <div className="px-3 pb-3 border-t border-slate-100 pt-2 space-y-1">
                  {s.vaccines.map((v, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-cyan-500 flex-shrink-0" />
                      <p className="text-xs text-slate-700">{v}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
        <p className="text-xs font-bold text-amber-800 mb-1.5">Catch-up Immunisation Principles</p>
        {["Minimum intervals must be respected (not age)", "Never restart a series — continue from where stopped", "Max 3 vaccines per visit (inactivated), 2 live vaccines same day (or 4-week gap)", "OPV stops at 5 years in India; PCV/Rota not given after 24 months"].map((p, i) => (
          <div key={i} className="flex items-start gap-1.5 mb-1">
            <ArrowRight className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-700">{p}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Nutritional Assessment Engine (SAM protocol) ──────────────────────────
function NutritionalAssessmentEngine() {
  const [muac, setMuac] = useState("");
  const [waz, setWaz] = useState("");
  const [open, setOpen] = useState(null);

  const classify = () => {
    const m = parseFloat(muac);
    const w = parseFloat(waz);
    if (m < 11.5 || w < -3) return { label: "SAM (Severe Acute Malnutrition)", color: "bg-red-100 text-red-900", action: "Inpatient F-75 → F-100 → RUTF · IMCI danger signs? · Treat hypoglycaemia · Rehydration: ReSoMal · 10-step WHO protocol" };
    if (m < 12.5 || w < -2) return { label: "MAM (Moderate Acute Malnutrition)", color: "bg-orange-100 text-orange-900", action: "CSBE (Community-based supplementary feeding) · Amoxicillin 5 days · Micronutrients · Monthly follow-up" };
    return { label: "No Acute Malnutrition", color: "bg-green-100 text-green-900", action: "Continue routine nutrition monitoring · IAP/WHO diet counselling" };
  };

  return (
    <div className="space-y-4">
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-1">
          <Utensils className="w-5 h-5 text-green-700" />
          <h2 className="font-bold text-base text-green-900">Nutritional Assessment Engine</h2>
          <Badge className="bg-green-600 text-white text-xs">IAP/WHO</Badge>
        </div>
        <p className="text-xs text-green-700">SAM · MAM · PEM · Micronutrients · Tube feeding · TPN · Renal nutrition</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1">MUAC (cm)</label>
          <input value={muac} onChange={e => setMuac(e.target.value)} placeholder="e.g. 12.0" type="number" step="0.1" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1">Weight-for-Age Z</label>
          <input value={waz} onChange={e => setWaz(e.target.value)} placeholder="e.g. -2.5" type="number" step="0.1" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300" />
        </div>
      </div>

      {(muac || waz) && (
        <div className={`rounded-xl p-4 ${classify().color}`}>
          <p className="font-bold text-sm">{classify().label}</p>
          <p className="text-xs mt-1.5">{classify().action}</p>
        </div>
      )}

      {[
        { id: "sam", title: "SAM — 10-Step WHO Protocol", items: ["1. Hypoglycaemia: 10% dextrose 5 mL/kg IV/NG if glucose <3 mmol/L", "2. Hypothermia: Warm environment; kangaroo care", "3. Dehydration: ReSoMal 5–10 mL/kg/h × 2h (NOT ORS — low Na)", "4. Electrolytes: K+ supplement; NO IV Na in first 2 weeks", "5. Infection: Amoxicillin + Gentamicin; broader if unwell", "6. Micronutrients: Folate Day 1; Multivitamin; Zinc; Vitamin A (unless measles recently)", "7. Feeding: F-75 (75 kcal/100mL) starter; 100–130 mL/kg/day", "8. Rebuild: F-100 (100 kcal/100mL) → RUTF (ready-to-use therapeutic food)", "9. Stimulation: Sensory, emotional, play", "10. Discharge: MUAC >12.5 cm; 15–20% weight gain; eating well"] },
        { id: "micronutrient", title: "Micronutrient Deficiencies", items: ["Iron deficiency (IDA): Serum ferritin <12 ng/mL; Hb < age cutoffs → Elemental iron 3–6 mg/kg/day", "Vitamin A: Night blindness/xerophthalmia → 200,000 IU if >12m; 100,000 IU if 6–12m", "Zinc: Supplementation 20 mg/day × 14 days in diarrhoea (IAP/WHO)", "Vitamin D: 400 IU/day routine; 1000–2000 IU/day for deficiency; Rickets: per rickets protocol", "Vitamin B12: Macrocytic anaemia + neural symptoms → oral cyanocobalamin 1000 mcg/day"] },
        { id: "tubefeeding", title: "Tube Feeding & TPN Principles", items: ["NGT preferred over TPN; TPN only if gut non-functional", "Enteral: Start 60–70% of estimated needs; advance 10–20% daily", "Protein: 1.5–2.5 g/kg/day; CKD: 1–1.5 g/kg/day depending on stage", "TPN: Glucose infusion rate 4–6 mg/kg/min (neonates); lipids 1 g/kg/day; amino acids 1.5 g/kg/day", "Refeeding syndrome: Monitor K, Mg, PO4 closely first 72h in severe malnutrition"] },
      ].map(s => (
        <div key={s.id} className="border border-slate-200 rounded-xl overflow-hidden">
          <button className="w-full flex items-center justify-between px-3 py-2.5 bg-white" onClick={() => setOpen(open === s.id ? null : s.id)}>
            <span className="text-sm font-bold text-slate-800">{s.title}</span>
            {open === s.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>
          {open === s.id && (
            <div className="px-3 pb-3 border-t border-slate-100 pt-2 space-y-1">
              {s.items.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <ArrowRight className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main export — dispatcher ──────────────────────────────────────────────
export default function GrowthNutritionDevEngine({ scenario }) {
  if (scenario === "developmental-assessment-engine") return <DevelopmentalAssessmentEngine />;
  if (scenario === "vaccination-engine") return <VaccinationEngine />;
  if (scenario === "nutritional-assessment-engine" || scenario === "renal-nutrition-engine") return <NutritionalAssessmentEngine />;
  return <GrowthAssessmentEngine />;
}