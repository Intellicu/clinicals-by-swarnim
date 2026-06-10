import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, CheckCircle2, Info, ChevronDown, ChevronUp, Activity } from "lucide-react";

const RISK_TOOLS = {
  "all-all": {
    label: "ALL (ICiCLe ALL-14 / BFM)",
    color: "bg-blue-700",
    fields: [
      { id: "age", label: "Age at diagnosis", type: "number", unit: "years", placeholder: "e.g. 5" },
      { id: "wbc", label: "Initial WBC count", type: "number", unit: "×10⁹/L", placeholder: "e.g. 15" },
      { id: "phenotype", label: "Phenotype", type: "select", options: ["BCP-ALL", "T-ALL"] },
      { id: "cytogenetics", label: "Cytogenetics", type: "select", options: ["Normal/other", "KMT2A rearrangement", "TCF3::HLF", "iAMP21", "Hypodiploidy (<44 chr)", "ETV6-RUNX1 (t12;21) — good", "High hyperdiploidy — good", "Ph+ (BCR-ABL1)"] },
      { id: "day8_response", label: "Day 8 PB blasts", type: "select", options: ["<1000/μL (good)", "≥1000/μL (poor)"] },
      { id: "day35_bm", label: "Day 35 BM", type: "select", options: ["Complete remission (M1)", "Partial remission (M2)", "No remission (M3)"] },
      { id: "mrd_day35", label: "MRD at Day 35 (BM flow)", type: "select", options: ["<0.01% (favourable)", "0.01–0.99% (intermediate)", "≥1% (high MRD)"] },
      { id: "cns", label: "CNS status", type: "select", options: ["CNS1 (negative)", "CNS2 (<5 WBC/μL + blasts)", "CNS3 (≥5 WBC/μL + blasts or cranial nerve palsy)"] },
    ],
    stratify(vals) {
      const age = parseFloat(vals.age);
      const wbc = parseFloat(vals.wbc);
      const isT = vals.phenotype === "T-ALL";
      const badCyto = ["KMT2A rearrangement", "TCF3::HLF", "iAMP21", "Hypodiploidy (<44 chr)", "Ph+ (BCR-ABL1)"].includes(vals.cytogenetics);
      const goodCyto = vals.cytogenetics?.includes("good");
      const highWBC = wbc >= 100;
      const highMRD = vals.mrd_day35?.includes("≥1%");
      const midMRD = vals.mrd_day35?.includes("0.01–0.99%");
      const cnS3 = vals.cns === "CNS3 (≥5 WBC/μL + blasts or cranial nerve palsy)";
      const noRemD35 = vals.day35_bm === "No remission (M3)";
      const poorD8 = vals.day8_response === "≥1000/μL (poor)";

      if (isT || badCyto || (age < 1) || (age >= 10) || highWBC || highMRD || cnS3 || noRemD35) {
        const reasons = [];
        if (isT) reasons.push("T-ALL phenotype");
        if (badCyto) reasons.push(`Adverse cytogenetics: ${vals.cytogenetics}`);
        if (age < 1) reasons.push("Age <1 year");
        if (age >= 10) reasons.push("Age ≥10 years");
        if (highWBC) reasons.push("WBC ≥100 ×10⁹/L");
        if (highMRD) reasons.push("MRD ≥1% at Day 35");
        if (cnS3) reasons.push("CNS3 disease");
        if (noRemD35) reasons.push("No remission at Day 35 BM");
        return { group: "HIGH RISK", color: "bg-red-600", reasons, recommendation: "Full HR protocol (ICiCLe HR arm / BFM HR): HD-MTX × 2 + augmented consolidation ± SCT evaluation. TCF3::HLF → consider SCT/clinical trial immediately." };
      }
      if (age >= 1 && age <= 9.99 && wbc < 50 && !poorD8 && !badCyto && !midMRD) {
        return { group: "STANDARD RISK", color: "bg-green-600", reasons: ["Age 1–9.99y", "WBC <50 ×10⁹/L", "BCP-ALL", "Good early response"], recommendation: "ICiCLe SR arm: No HD-MTX needed. Maintenance 2 years (girls) / 3 years (boys). NUDT15 genotype before maintenance." };
      }
      const irReasons = [];
      if (wbc >= 50 && wbc < 100) irReasons.push("WBC 50–100 ×10⁹/L");
      if (poorD8) irReasons.push("Poor Day 8 response");
      if (midMRD) irReasons.push("MRD 0.01–0.99% Day 35");
      if (vals.day35_bm === "Partial remission (M2)") irReasons.push("M2 marrow at Day 35");
      return { group: "INTERMEDIATE RISK", color: "bg-amber-600", reasons: irReasons.length ? irReasons : ["Not SR or HR — intermediate features"], recommendation: "ICiCLe IR arm: HD-MTX × 1 course in consolidation. MRD at Day 79 critical — if ≥0.01% escalate to HR." };
    }
  },

  "all-aml": {
    label: "AML (BFM/MRC)",
    color: "bg-rose-700",
    fields: [
      { id: "cytogenetics", label: "Cytogenetics / Molecular", type: "select", options: ["t(8;21) RUNX1-RUNX1T1", "inv(16)/t(16;16) CBF-AML", "Normal cytogenetics", "NPM1 mutated (FLT3-ITD neg)", "CEBPA biallelic", "FLT3-ITD High Allelic Ratio (HAR)", "Monosomy 7 / -5q", "KMT2A rearrangement", "t(6;9)", "TP53 mutation", "APL t(15;17) PML-RARA"] },
      { id: "down_syndrome", label: "Down syndrome", type: "select", options: ["No", "Yes"] },
      { id: "day22_mrd", label: "Day 22 BM MRD (flow)", type: "select", options: ["<0.1% (favourable)", "≥0.1% (adverse)", "Not performed"] },
    ],
    stratify(vals) {
      const cbf = ["t(8;21) RUNX1-RUNX1T1", "inv(16)/t(16;16) CBF-AML"].includes(vals.cytogenetics);
      const apL = vals.cytogenetics === "APL t(15;17) PML-RARA";
      const hr = ["FLT3-ITD High Allelic Ratio (HAR)", "Monosomy 7 / -5q", "t(6;9)", "TP53 mutation"].includes(vals.cytogenetics);
      const goodMol = ["Normal cytogenetics", "NPM1 mutated (FLT3-ITD neg)", "CEBPA biallelic"].includes(vals.cytogenetics);
      const ds = vals.down_syndrome === "Yes";
      const badMRD = vals.day22_mrd === "≥0.1% (adverse)";

      if (apL) return { group: "APL — SEPARATE PROTOCOL", color: "bg-yellow-600", reasons: ["t(15;17) PML-RARA — APL"], recommendation: "ATRA 45 mg/m²/day + ATO 0.15 mg/kg/day. DO NOT give standard AML induction. Watch for APL differentiation syndrome (ATRA syndrome)." };
      if (ds) return { group: "DS-AML — MODIFIED PROTOCOL", color: "bg-blue-600", reasons: ["Down syndrome AML"], recommendation: "DS-AML: Highly chemo-sensitive. Lower doses, avoid HD-AraC. No SCT. Refer DS-AML specialist protocol." };
      if (cbf && !badMRD) return { group: "LOW RISK (CBF-AML)", color: "bg-green-600", reasons: [`Favourable cytogenetics: ${vals.cytogenetics}`], recommendation: "Chemotherapy only — no SCT in first CR. HD-AraC consolidation × 3 cycles. 5-yr OS ~85–90%." };
      if (hr || badMRD) {
        const reasons = [];
        if (hr) reasons.push(`Adverse cytogenetics: ${vals.cytogenetics}`);
        if (badMRD) reasons.push("MRD ≥0.1% at Day 22");
        return { group: "HIGH RISK", color: "bg-red-600", reasons, recommendation: "Allo-SCT in first CR if donor available. FLT3-ITD HAR: consider FLT3 inhibitor (if available). Intensified induction ± GO if CD33+." };
      }
      return { group: "STANDARD RISK", color: "bg-amber-600", reasons: ["Normal/intermediate cytogenetics", "Adequate MRD response"], recommendation: "BFM standard arm: AIE induction → HAM (HR) or consolidation HD-AraC. SCT only in second CR or persistent MRD positivity." };
    }
  },

  "wilms": {
    label: "Wilms Tumour (SIOP-RTSG)",
    color: "bg-teal-700",
    fields: [
      { id: "histology", label: "Post-op histological risk", type: "select", options: ["Low risk (Regressive / Epithelial)", "Standard risk (Mixed / Stromal)", "High risk (Blastemal type)"] },
      { id: "stage", label: "SIOP Stage", type: "select", options: ["Stage I", "Stage II", "Stage III", "Stage IV (distant mets)", "Stage V (bilateral)"] },
      { id: "bilateral", label: "Bilateral (Stage V)", type: "select", options: ["No", "Yes"] },
      { id: "lymph_nodes", label: "Lymph node sampling done", type: "select", options: ["Yes", "No (not sampled)"] },
    ],
    stratify(vals) {
      const blastemal = vals.histology === "High risk (Blastemal type)";
      const noNodes = vals.lymph_nodes === "No (not sampled)";
      const stageIV = vals.stage === "Stage IV (distant mets)";
      const bilateral = vals.stage === "Stage V (bilateral)" || vals.bilateral === "Yes";
      const stageIII = vals.stage === "Stage III";

      if (noNodes) return { group: "TREAT AS STAGE III", color: "bg-amber-600", reasons: ["Lymph nodes NOT sampled at surgery"], recommendation: "No LN sampling = cannot stage accurately → treat as Stage III: post-op AV + flank RT 15 Gy. Lymph node sampling is MANDATORY per SIOP." };
      if (bilateral) return { group: "STAGE V — BILATERAL", color: "bg-purple-600", reasons: ["Bilateral Wilms"], recommendation: "Pre-op chemo × 6 weeks → bilateral NSS. Preserve maximum renal parenchyma. Contralateral kidney function is primary goal. Do NOT resect upfront." };
      if (stageIV) return { group: "STAGE IV — HIGH RISK", color: "bg-red-600", reasons: ["Distant metastases"], recommendation: "AVD post-op ± whole-lung RT 12 Gy (if no CR on chemo). Liver mets → RT ± surgery." };
      if (blastemal && stageIII) return { group: "STAGE III HIGH RISK (BLASTEMAL)", color: "bg-red-700", reasons: ["Blastemal type + Stage III"], recommendation: "AVD post-op + flank RT 15 Gy. Most intensive standard arm. Close surveillance for relapse." };
      if (blastemal) return { group: "HIGH RISK HISTOLOGY", color: "bg-red-600", reasons: ["Blastemal type — high risk histology"], recommendation: "Even Stage I blastemal: intensified chemo (± RT). Blastemal type is an independent adverse factor regardless of stage." };
      if (stageIII) return { group: "STAGE III STANDARD RISK", color: "bg-amber-600", reasons: ["Stage III, non-blastemal"], recommendation: "Post-op AV × 27 weeks + flank RT 15 Gy." };
      if (vals.stage === "Stage I" || vals.stage === "Stage II") {
        const lowRisk = vals.histology === "Low risk (Regressive / Epithelial)";
        return { group: lowRisk ? "STAGE I/II LOW RISK" : "STAGE I/II STANDARD RISK", color: lowRisk ? "bg-green-600" : "bg-teal-600", reasons: [vals.histology, vals.stage], recommendation: lowRisk ? "AV × 4 weeks post-op only. Excellent prognosis (>95% OS). No RT needed." : "AV × 27 weeks post-op. No RT needed. 5-yr OS ~85–90%." };
      }
      return { group: "ASSESSMENT INCOMPLETE", color: "bg-slate-600", reasons: ["Insufficient data entered"], recommendation: "Complete all fields for stratification." };
    }
  },

  "neuroblastoma-hr": {
    label: "Neuroblastoma (SIOPEN)",
    color: "bg-orange-700",
    fields: [
      { id: "mycn", label: "MYCN amplification", type: "select", options: ["Not amplified", "Amplified"] },
      { id: "inss_stage", label: "INSS Stage", type: "select", options: ["Stage 1", "Stage 2", "Stage 3", "Stage 4", "Stage 4s"] },
      { id: "age", label: "Age at diagnosis", type: "number", unit: "months", placeholder: "e.g. 24" },
      { id: "alk", label: "ALK mutation", type: "select", options: ["Not tested / Wild type", "ALK mutated / amplified"] },
    ],
    stratify(vals) {
      const mycnAmp = vals.mycn === "Amplified";
      const age = parseFloat(vals.age);
      const stage4 = vals.inss_stage === "Stage 4";
      const stage4s = vals.inss_stage === "Stage 4s";
      const alk = vals.alk === "ALK mutated / amplified";
      const olderStage4 = stage4 && age >= 12;

      if (mycnAmp) return { group: "HIGH RISK — HR-NBL-1/SIOPEN", color: "bg-red-600", reasons: ["MYCN amplification — any stage"], recommendation: "HR-NBL-1/SIOPEN: COJEC induction (10 courses) → Surgery → BuMel + AutoSCT → Radiotherapy → Isotretinoin maintenance → Anti-GD2 immunotherapy. BuMel SOS/VOD prophylaxis mandatory." };
      if (olderStage4) return { group: "HIGH RISK — HR-NBL-1/SIOPEN", color: "bg-red-600", reasons: ["Stage 4, age ≥12 months, MYCN non-amplified"], recommendation: "HR-NBL-1/SIOPEN as above. Age ≥12mo + Stage 4 is the second HR entry criterion regardless of MYCN." };
      if (stage4s && !mycnAmp) return { group: "SPECIAL (4s)", color: "bg-amber-600", reasons: ["Stage 4s, MYCN non-amplified"], recommendation: "High spontaneous regression. Observation in asymptomatic. Chemo only if hepatomegaly causing respiratory compromise. Watch and wait is safe." };
      const lowRisk = vals.inss_stage === "Stage 1" || (vals.inss_stage === "Stage 2" && !mycnAmp);
      if (lowRisk) return { group: "LOW RISK — LINES Protocol", color: "bg-green-600", reasons: [vals.inss_stage, "MYCN non-amplified"], recommendation: "LINES: Observation/surgery only for L1. Minimal chemo (VP/Carbo × 2) for L2 with IDRFs. No HR protocol needed." };
      return { group: "INTERMEDIATE RISK — LINES", color: "bg-amber-600", reasons: [vals.inss_stage, "MYCN non-amplified"], recommendation: "LINES: VP/Carbo × 2–6 cycles ± CADO for inadequate response. Reassess MYCN if doubtful." };
    }
  },
};

const RISK_BADGE_COLORS = {
  "HIGH RISK": "bg-red-600",
  "HIGH RISK — HR-NBL-1/SIOPEN": "bg-red-600",
  "STANDARD RISK": "bg-green-600",
  "LOW RISK (CBF-AML)": "bg-green-600",
  "LOW RISK — LINES Protocol": "bg-green-600",
  "INTERMEDIATE RISK": "bg-amber-600",
  "INTERMEDIATE RISK — LINES": "bg-amber-600",
  "STAGE I/II LOW RISK": "bg-green-600",
  "STAGE I/II STANDARD RISK": "bg-teal-600",
  "APL — SEPARATE PROTOCOL": "bg-yellow-600",
};

export default function RiskStratificationTool() {
  const [protocol, setProtocol] = useState("");
  const [values, setValues] = useState({});
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const tool = protocol ? RISK_TOOLS[protocol] : null;

  function setVal(id, v) {
    setValues(prev => ({ ...prev, [id]: v }));
    setShowResult(false);
  }

  function stratify() {
    if (!tool) return;
    const res = tool.stratify(values);
    setResult(res);
    setShowResult(true);
  }

  function reset() {
    setValues({});
    setResult(null);
    setShowResult(false);
  }

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-emerald-700 to-teal-700 rounded-xl p-4 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-5 h-5 text-emerald-200" />
          <h2 className="font-bold text-base">Risk Stratification Tool</h2>
        </div>
        <p className="text-xs text-emerald-200">Protocol-specific risk assignment — ALL / AML / Wilms / Neuroblastoma</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1.5">Select Protocol</label>
          <select className="w-full px-3 py-2.5 text-sm border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
            value={protocol} onChange={e => { setProtocol(e.target.value); reset(); }}>
            <option value="">— Select protocol —</option>
            {Object.entries(RISK_TOOLS).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>

        {tool && (
          <div className="space-y-3">
            {tool.fields.map(field => (
              <div key={field.id}>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  {field.label}{field.unit && <span className="text-slate-400 font-normal ml-1">({field.unit})</span>}
                </label>
                {field.type === "select" ? (
                  <select className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white"
                    value={values[field.id] || ""} onChange={e => setVal(field.id, e.target.value)}>
                    <option value="">— Select —</option>
                    {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input type={field.type} placeholder={field.placeholder}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    value={values[field.id] || ""} onChange={e => setVal(field.id, e.target.value)} />
                )}
              </div>
            ))}

            <button onClick={stratify}
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-sm rounded-xl transition-colors">
              Stratify Risk →
            </button>
          </div>
        )}
      </div>

      {showResult && result && (
        <div className={`border-2 rounded-xl overflow-hidden ${result.color === "bg-red-600" || result.color === "bg-red-700" ? "border-red-300" : result.color === "bg-green-600" ? "border-green-300" : "border-amber-300"}`}>
          <div className={`${result.color} text-white px-4 py-3`}>
            <div className="flex items-center gap-2">
              {result.color.includes("red") ? <AlertTriangle className="w-5 h-5" /> : result.color.includes("green") ? <CheckCircle2 className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
              <span className="font-bold text-base">{result.group}</span>
            </div>
          </div>
          <div className="bg-white p-4 space-y-3">
            <div>
              <p className="text-xs font-bold text-slate-600 mb-1.5">Risk Factors Identified:</p>
              <div className="space-y-1">
                {result.reasons.map((r, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-slate-400 text-xs mt-0.5">▸</span>
                    <span className="text-xs text-slate-700">{r}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-blue-800 mb-0.5">Recommended Treatment Arm:</p>
                  <p className="text-xs text-blue-800 leading-relaxed">{result.recommendation}</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 italic">⚠ This stratification is a decision-support aid. Final risk assignment must be confirmed by the treating paediatric oncologist per current institutional protocol and MDT discussion.</p>
          </div>
        </div>
      )}
    </div>
  );
}