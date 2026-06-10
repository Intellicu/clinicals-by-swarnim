import React, { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Calculator, ChevronDown, ChevronUp, Info } from "lucide-react";

const PROTOCOL_DRUGS = {
  "all-all": [
    { name: "Prednisolone", dose_per_m2: 40, unit: "mg/m²/day", freq: "Days 1–28 induction", max: 60, route: "PO", notes: "Taper with dexamethasone d29–35" },
    { name: "Vincristine", dose_per_m2: 1.5, unit: "mg/m²", freq: "Weekly × 4–5 in induction", max: 2, route: "IV", notes: "HARD CAP 2 mg regardless of BSA" },
    { name: "PEG-Asparaginase", dose_per_m2: 2500, unit: "IU/m²", freq: "Day 12 & 26 induction", max: 3750, route: "IM", notes: "Max 3750 IU per dose" },
    { name: "Daunorubicin (HR/IR)", dose_per_m2: 30, unit: "mg/m²", freq: "d8, d15 induction", max: null, route: "IV", notes: "HR/IR only" },
    { name: "Methotrexate IT", dose_per_m2: null, unit: "mg (age-based)", freq: "Multiple IT doses", max: null, route: "IT", notes: "<1y: 6mg | 1–2y: 8mg | 2–3y: 10mg | ≥3y: 12mg", age_based: [6, 8, 10, 12] },
    { name: "HD-Methotrexate (HR)", dose_per_m2: 5000, unit: "mg/m²", freq: "× 2 in HR consolidation", max: null, route: "IV 24h", notes: "Leucovorin rescue mandatory from 42h. Alkalinise urine pH >7." },
    { name: "6-Mercaptopurine (maintenance)", dose_per_m2: 75, unit: "mg/m²/day", freq: "Daily maintenance", max: null, route: "PO", notes: "Empty stomach. Reduce 50% if NUDT15 heterozygous." },
    { name: "Mitoxantrone (DI)", dose_per_m2: 10, unit: "mg/m²/day", freq: "Days 1–2 of Delayed Intensification", max: null, route: "IV", notes: "Preferred over doxorubicin per ICiCLe v1.1" },
  ],
  "all-aml": [
    { name: "Cytarabine (standard)", dose_per_m2: 100, unit: "mg/m²/day", freq: "CI × 10 days induction", max: null, route: "IV CI", notes: "Continuous infusion" },
    { name: "Cytarabine (HD-AraC)", dose_per_m2: 3000, unit: "mg/m²/dose q12h", freq: "× 6 doses consolidation", max: null, route: "IV 3h", notes: "Prednisolone eye drops prophylaxis. Check cerebellar function before each dose." },
    { name: "Idarubicin", dose_per_m2: 12, unit: "mg/m²", freq: "Days 3, 5 induction", max: null, route: "IV", notes: "VESICANT. Echo required baseline." },
    { name: "Etoposide", dose_per_m2: 150, unit: "mg/m²/day", freq: "Days 6,7,8 induction", max: null, route: "IV >60min", notes: "Infuse over ≥60 min to prevent hypotension" },
    { name: "Mitoxantrone (HAM)", dose_per_m2: 10, unit: "mg/m²/day × 2", freq: "HAM consolidation", max: null, route: "IV", notes: "Blue-green urine — warn family" },
  ],
  "wilms": [
    { name: "Actinomycin-D (Dactinomycin)", dose_per_kg: 45, unit: "mcg/kg", freq: "Pre-op: weekly × 4; Post-op: d1 each course", max: 2300, route: "IV", notes: "Max 2.3 mg. VESICANT. SOS/VOD risk with RT overlap." },
    { name: "Vincristine", dose_per_m2: 1.5, unit: "mg/m²", freq: "Weekly pre-op; per course post-op", max: 2, route: "IV", notes: "Max 2 mg" },
    { name: "Doxorubicin (AVD)", dose_per_m2: 45, unit: "mg/m²", freq: "Stage III high risk / Stage IV", max: null, route: "IV", notes: "VESICANT. Cumulative limit 300 mg/m²." },
  ],
  "neuroblastoma-hr": [
    { name: "Carboplatin (COJEC A/C)", dose_per_m2: null, unit: "AUC 4.1 (Calvert)", freq: "Courses A & C of COJEC", max: null, route: "IV", notes: "Use Calvert formula: Dose = AUC × (GFR + 25). Preferred GFR by CrEDTA." },
    { name: "Cisplatin (COJEC B)", dose_per_m2: 50, unit: "mg/m²/day × 4", freq: "Course B of COJEC", max: null, route: "IV 6h", notes: "Hyperhydration 3L/m²/day mandatory. Mg supplementation. BAER required." },
    { name: "Etoposide (COJEC)", dose_per_m2: 160, unit: "mg/m²/day × 3", freq: "Courses A & C", max: null, route: "IV", notes: "Infuse >60 min" },
    { name: "Isotretinoin (maintenance)", dose_per_m2: 160, unit: "mg/m²/day ÷ 2 doses × 14d", freq: "Every 28d × 6 cycles", max: null, route: "PO", notes: "Monitor lipids + LFT. Teratogenic." },
  ],
  "b-nhl": [
    { name: "Rituximab", dose_per_m2: 375, unit: "mg/m²", freq: "× 6 doses per schedule", max: null, route: "IV 4–6h", notes: "Pre-medicate: paracetamol + diphenhydramine + methylprednisolone. HBsAg/HBcAb screen before." },
    { name: "HD-MTX (Group B)", dose_per_m2: 3000, unit: "mg/m²", freq: "Per COPADM cycle", max: null, route: "IV 3h", notes: "Leucovorin rescue 42h from start. MTX levels 24h/48h/72h." },
    { name: "HD-MTX (Group C)", dose_per_m2: 8000, unit: "mg/m²", freq: "Per COPADM cycle (Group C)", max: null, route: "IV 4h", notes: "Leucovorin rescue mandatory. Urine pH >7 before infusion." },
    { name: "Cyclophosphamide (COPADM)", dose_per_m2: 500, unit: "mg/m²/dose × 5", freq: "Per COPADM cycle", max: null, route: "IV", notes: "Mesna mandatory + hyperhydration" },
    { name: "Doxorubicin (COPADM)", dose_per_m2: 60, unit: "mg/m²", freq: "Day 2 of COPADM", max: null, route: "IV", notes: "VESICANT. Echo required." },
  ],
  "medulloblastoma": [
    { name: "Cisplatin (Cycle A)", dose_per_m2: 75, unit: "mg/m²", freq: "Day 1 of each Cycle A (× 4)", max: null, route: "IV 6h", notes: "BAER before each dose. Hyperhydration 3L/m²/day. Mg replacement." },
    { name: "CCNU/Lomustine (Cycle A)", dose_per_m2: 75, unit: "mg/m²", freq: "Day 1 Cycle A (× 4)", max: null, route: "PO", notes: "Delayed nadir at 4–6 weeks. Monitor CBC at 4wk and 6wk." },
    { name: "Vincristine (Cycle A+B)", dose_per_m2: 1.5, unit: "mg/m²", freq: "d1,8,15 each maintenance cycle + weekly during RT", max: 2, route: "IV", notes: "Max 2 mg" },
    { name: "Cyclophosphamide (Cycle B)", dose_per_m2: 1000, unit: "mg/m²/day × 2", freq: "Cycle B (× 4)", max: null, route: "IV", notes: "Mesna mandatory. Hyperhydration." },
  ],
};

// Carboplatin Calvert formula helper
function calvertDose(auc, gfr) {
  return Math.round(auc * (gfr + 25));
}

function bsaDuBois(weight, height) {
  if (!weight || !height) return null;
  return parseFloat((0.007184 * Math.pow(weight, 0.425) * Math.pow(height, 0.725)).toFixed(3));
}

export default function OncologyDosingCalculator() {
  const [protocol, setProtocol] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [ageYears, setAgeYears] = useState("");
  const [gfr, setGfr] = useState("");
  const [expanded, setExpanded] = useState({});

  const bsa = useMemo(() => bsaDuBois(parseFloat(weight), parseFloat(height)), [weight, height]);
  const drugs = protocol ? (PROTOCOL_DRUGS[protocol] || []) : [];

  function calcDose(drug) {
    if (!bsa) return null;
    if (drug.dose_per_kg != null) {
      const raw = drug.dose_per_kg * parseFloat(weight);
      const capped = drug.max ? Math.min(raw, drug.max) : raw;
      return { raw: raw.toFixed(1), final: capped.toFixed(1), capped: drug.max && raw > drug.max, unit: drug.unit };
    }
    if (drug.dose_per_m2 != null) {
      const raw = drug.dose_per_m2 * bsa;
      const capped = drug.max ? Math.min(raw, drug.max) : raw;
      return { raw: raw.toFixed(1), final: capped.toFixed(1), capped: drug.max && raw > drug.max, unit: drug.unit };
    }
    return null;
  }

  function getITDose(ageYr) {
    const age = parseFloat(ageYr);
    if (isNaN(age)) return null;
    if (age < 1) return 6;
    if (age < 2) return 8;
    if (age < 3) return 10;
    return 12;
  }

  function toggleExpand(name) {
    setExpanded(prev => ({ ...prev, [name]: !prev[name] }));
  }

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-violet-700 to-purple-700 rounded-xl p-4 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Calculator className="w-5 h-5 text-violet-200" />
          <h2 className="font-bold text-base">BSA-Based Dosing Calculator</h2>
        </div>
        <p className="text-xs text-violet-200">Protocol-specific doses calculated from height + weight (Du Bois BSA formula)</p>
      </div>

      <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800"><strong>Verify before prescribing.</strong> All calculated doses must be confirmed by a paediatric oncologist against institutional protocol. Maximum doses and rounding rules must be applied per local pharmacy policy.</p>
      </div>

      {/* Patient inputs */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
        <p className="text-xs font-bold text-slate-700">Patient Parameters</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="text-xs text-slate-500 block mb-1">Weight (kg)</label>
            <input type="number" placeholder="e.g. 25" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300"
              value={weight} onChange={e => setWeight(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Height (cm)</label>
            <input type="number" placeholder="e.g. 120" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300"
              value={height} onChange={e => setHeight(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Age (years)</label>
            <input type="number" placeholder="e.g. 6" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300"
              value={ageYears} onChange={e => setAgeYears(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">GFR (mL/min/1.73m²)</label>
            <input type="number" placeholder="e.g. 90" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300"
              value={gfr} onChange={e => setGfr(e.target.value)} />
          </div>
        </div>

        {/* BSA display */}
        {bsa && (
          <div className="flex flex-wrap gap-4 bg-violet-50 rounded-lg px-4 py-2.5 border border-violet-200">
            <div>
              <p className="text-xs text-violet-500 font-semibold">Du Bois BSA</p>
              <p className="text-xl font-bold text-violet-800">{bsa} m²</p>
            </div>
            {weight && <div><p className="text-xs text-slate-500">Weight</p><p className="font-bold text-slate-700">{weight} kg</p></div>}
            {height && <div><p className="text-xs text-slate-500">Height</p><p className="font-bold text-slate-700">{height} cm</p></div>}
            {ageYears && <div><p className="text-xs text-slate-500">Age</p><p className="font-bold text-slate-700">{ageYears} y</p></div>}
            {gfr && <div><p className="text-xs text-slate-500">GFR</p><p className="font-bold text-slate-700">{gfr} mL/min/1.73m²</p></div>}
          </div>
        )}

        <div>
          <label className="text-xs text-slate-500 block mb-1">Protocol</label>
          <select className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300 bg-white"
            value={protocol} onChange={e => setProtocol(e.target.value)}>
            <option value="">— Select protocol —</option>
            <option value="all-all">ALL (ICiCLe ALL-14)</option>
            <option value="all-aml">AML (BFM/MRC)</option>
            <option value="wilms">Wilms Tumour (SIOP-RTSG)</option>
            <option value="neuroblastoma-hr">Neuroblastoma HR (HR-NBL-1)</option>
            <option value="b-nhl">Burkitt / B-NHL (FAB-LMB96)</option>
            <option value="medulloblastoma">Medulloblastoma (SIOP-E)</option>
          </select>
        </div>
      </div>

      {/* Carboplatin Calvert */}
      {gfr && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-xs font-bold text-blue-800 mb-2">Carboplatin — Calvert Formula</p>
          <div className="grid grid-cols-2 gap-2">
            {[{ auc: 4.1, label: "AUC 4.1 (COJEC)" }, { auc: 5, label: "AUC 5 (standard)" }, { auc: 7, label: "AUC 7 (high dose)" }].map(item => (
              <div key={item.auc} className="bg-white border border-blue-200 rounded-lg px-3 py-2">
                <p className="text-xs text-blue-600 font-semibold">{item.label}</p>
                <p className="text-lg font-bold text-blue-900">{calvertDose(item.auc, parseFloat(gfr))} mg</p>
                <p className="text-xs text-slate-500">= {item.auc} × (GFR {gfr} + 25)</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* IT MTX age-based dose */}
      {ageYears && (
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-3">
          <p className="text-xs font-bold text-teal-800">IT Methotrexate — Age-Based Dose</p>
          <p className="text-2xl font-bold text-teal-700 mt-1">{getITDose(ageYears)} mg</p>
          <p className="text-xs text-teal-600 mt-0.5">For age {ageYears} years | &lt;1y: 6mg · 1–2y: 8mg · 2–3y: 10mg · ≥3y: 12mg</p>
        </div>
      )}

      {/* Drug dose table */}
      {protocol && bsa && drugs.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-600 px-1">Calculated Doses — {bsa} m²</p>
          {drugs.map(drug => {
            const calc = calcDose(drug);
            const isOpen = expanded[drug.name];
            return (
              <div key={drug.name} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <button className="w-full flex items-start justify-between px-4 py-3 text-left hover:bg-slate-50"
                  onClick={() => toggleExpand(drug.name)}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-sm font-bold text-slate-900">{drug.name}</span>
                      <Badge className="bg-violet-600 text-white text-xs px-1.5 py-0">{drug.route}</Badge>
                      {calc?.capped && <Badge className="bg-red-600 text-white text-xs px-1.5 py-0">MAX DOSE APPLIED</Badge>}
                    </div>
                    {calc ? (
                      <div className="flex flex-wrap gap-3 items-baseline">
                        <span className="text-lg font-bold text-violet-800">{calc.final} {drug.unit.split("/")[0]}</span>
                        {calc.capped && <span className="text-xs text-slate-400 line-through">(calc: {calc.raw})</span>}
                        <span className="text-xs text-slate-500">{drug.freq}</span>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">{drug.unit} — {drug.freq}</p>
                    )}
                  </div>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {isOpen && (
                  <div className="border-t border-slate-100 px-4 py-3 bg-slate-50 space-y-1">
                    {calc && (
                      <p className="text-xs text-slate-600">
                        <strong>Calculation:</strong> {drug.dose_per_m2 != null ? `${drug.dose_per_m2} ${drug.unit} × ${bsa} m²` : drug.dose_per_kg != null ? `${drug.dose_per_kg} ${drug.unit} × ${weight} kg` : "—"}
                        {" → "}<strong className="text-violet-800">{calc.final}</strong>
                        {drug.max && <span className="text-xs text-red-600 ml-2">(Max: {drug.max} {drug.unit.split("/")[0]})</span>}
                      </p>
                    )}
                    <div className="flex items-start gap-1.5 mt-1">
                      <Info className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-700">{drug.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {protocol && !bsa && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
          <Calculator className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">Enter weight and height to calculate BSA and drug doses</p>
        </div>
      )}
    </div>
  );
}