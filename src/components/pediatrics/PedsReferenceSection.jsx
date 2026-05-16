import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, BookOpen, TestTube, Activity, Baby, Scale } from "lucide-react";

function RefTable({ title, headers, rows, colorClass = "blue" }) {
  const [open, setOpen] = useState(false);
  const hColors = {
    blue: "bg-blue-600", green: "bg-green-600", purple: "bg-purple-600",
    teal: "bg-teal-600", orange: "bg-orange-600", rose: "bg-rose-600",
  };
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(v => !v)}
        className={`w-full flex items-center justify-between px-4 py-3 text-left ${open ? hColors[colorClass] + " text-white" : "bg-slate-50 hover:bg-slate-100 text-slate-800"}`}>
        <span className="font-bold text-sm">{title}</span>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {open && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-100 border-b border-slate-200">
              <tr>{headers.map((h, i) => <th key={i} className="px-3 py-2 text-left font-bold text-slate-700">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                  {row.map((cell, j) => <td key={j} className="px-3 py-2 text-slate-700">{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function PedsReferenceSection() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 p-3 bg-indigo-600 rounded-xl shadow">
        <BookOpen className="w-5 h-5 text-white" />
        <div>
          <p className="font-bold text-white text-sm">Pediatric Reference Values & Nomograms</p>
          <p className="text-indigo-100 text-xs">Lab normals · Vitals · Growth · Renal · Endocrine</p>
        </div>
      </div>

      {/* Vitals */}
      <RefTable title="🫀 Normal Vitals by Age" colorClass="rose"
        headers={["Age", "HR (bpm)", "RR (/min)", "SBP (mmHg)", "DBP (mmHg)"]}
        rows={[
          ["Neonate", "120–160", "30–60", "60–90", "30–60"],
          ["1–12 months", "100–160", "25–50", "70–100", "50–65"],
          ["1–3 years", "90–150", "20–30", "86–106", "42–63"],
          ["3–6 years", "80–140", "20–25", "89–112", "46–72"],
          ["6–12 years", "70–120", "14–22", "97–120", "57–80"],
          [">12 years", "60–100", "12–20", "110–135", "65–85"],
        ]} />

      {/* Renal */}
      <RefTable title="🔬 Normal Renal Lab Values (Pediatric)" colorClass="blue"
        headers={["Parameter", "Neonate", "Infant", "Child", "Adolescent"]}
        rows={[
          ["Creatinine (mg/dL)", "0.3–1.0", "0.2–0.4", "0.3–0.7", "0.5–1.0"],
          ["eGFR (mL/min/1.73m²)", "25–40", "60–80", "80–120", "90–130"],
          ["BUN (mg/dL)", "5–25", "5–18", "7–20", "8–20"],
          ["Na (mEq/L)", "135–145", "135–145", "135–145", "135–145"],
          ["K (mEq/L)", "3.7–5.9", "4.0–6.2", "3.5–5.0", "3.5–5.0"],
          ["Bicarbonate (mEq/L)", "16–24", "19–24", "22–26", "22–26"],
          ["Uric Acid (mg/dL)", "2.0–6.0", "2.0–6.0", "2.5–6.0", "3.0–7.0"],
          ["Calcium (mg/dL)", "7.5–10.5", "8.0–11.0", "8.8–10.8", "8.5–10.2"],
          ["Phosphate (mg/dL)", "4.5–9.0", "4.5–6.7", "3.8–6.5", "2.9–5.4"],
          ["Albumin (g/dL)", "2.5–4.5", "3.0–5.0", "3.7–5.6", "3.5–5.0"],
          ["UPCR (mg/mg)", "<0.5 (1m)", "<0.2 (>2y)", "<0.2", "<0.2"],
        ]} />

      {/* Hematology */}
      <RefTable title="🩸 Hematology Reference Values" colorClass="rose"
        headers={["Age", "Hb (g/dL)", "MCV (fL)", "WBC (×10³)", "Platelets (×10³)"]}
        rows={[
          ["Cord blood", "13.5–20", "98–118", "9–30", "150–450"],
          ["2 weeks", "13.0–17", "88–110", "5–20", "150–450"],
          ["3 months", "9.5–13.5", "74–96", "6–18", "150–450"],
          ["6 months", "10–13", "68–85", "6–17", "150–450"],
          ["1–2 years", "10.5–13.5", "70–86", "6–17", "150–450"],
          ["3–6 years", "11.5–13.5", "75–87", "5–15", "150–450"],
          ["6–12 years", "11.5–15.5", "77–95", "4.5–13.5", "150–400"],
          [">12 years M", "13–17", "80–100", "4.5–11", "150–400"],
          [">12 years F", "12–16", "80–100", "4.5–11", "150–400"],
        ]} />

      {/* LFT */}
      <RefTable title="🟡 Liver Function Tests" colorClass="orange"
        headers={["Test", "Neonate", "Infant", "Child", "Adolescent"]}
        rows={[
          ["ALT (IU/L)", "5–45", "5–45", "5–45", "5–45"],
          ["AST (IU/L)", "20–65", "15–60", "10–40", "10–40"],
          ["ALP (IU/L)", "100–350", "100–350", "100–400", "50–200"],
          ["GGT (IU/L)", "12–122", "5–45", "5–25", "9–36"],
          ["Total Bili (mg/dL)", "1.0–12.0", "0.2–1.0", "0.2–1.0", "0.2–1.0"],
          ["Direct Bili (mg/dL)", "<0.3", "<0.3", "<0.2", "<0.2"],
          ["Total Protein (g/dL)", "4.6–7.4", "5.1–7.3", "6.3–8.2", "6.3–8.2"],
          ["Albumin (g/dL)", "2.5–4.5", "3.0–5.0", "3.7–5.6", "3.5–5.0"],
          ["INR", "0.9–1.3", "0.9–1.3", "0.9–1.2", "0.9–1.2"],
        ]} />

      {/* Thyroid */}
      <RefTable title="🦋 Thyroid Function Tests" colorClass="teal"
        headers={["Age", "TSH (mIU/L)", "Free T4 (ng/dL)", "Total T4 (mcg/dL)"]}
        rows={[
          ["1–4 days", "1.0–39.0", "2.0–4.9", "14.1–22.6"],
          ["2–20 weeks", "1.7–9.1", "0.9–2.3", "9.8–16.6"],
          ["20wk–5 years", "0.7–5.7", "0.8–2.0", "7.3–15.0"],
          ["5–14 years", "0.7–5.7", "0.8–2.0", "6.4–13.3"],
          [">14 years", "0.4–4.5", "0.8–1.8", "5.5–12.5"],
        ]} />

      {/* Endocrine */}
      <RefTable title="⚗️ Endocrine Reference Values" colorClass="purple"
        headers={["Hormone", "Age/Phase", "Normal Range"]}
        rows={[
          ["IGF-1", "0–2y", "20–200 ng/mL"],
          ["IGF-1", "3–6y", "50–250 ng/mL"],
          ["IGF-1", "7–12y", "100–400 ng/mL"],
          ["IGF-1", "Pubertal", "200–900 ng/mL"],
          ["17-OHP", "Neonatal (72h)", "<30 ng/dL (term)"],
          ["17-OHP", "Child", "3–90 ng/dL"],
          ["Cortisol (AM)", "All ages", "7–28 mcg/dL"],
          ["LH (pubertal)", "Tanner II-III", "0.3–4.6 mIU/mL"],
          ["FSH (pubertal)", "Tanner II-III", "1.0–6.7 mIU/mL"],
          ["Estradiol", "Pre-pubertal", "<20 pg/mL"],
          ["Testosterone", "Pre-pubertal", "<20 ng/dL (M), <10 ng/dL (F)"],
          ["Insulin (fasting)", "Child", "2–20 mcIU/mL"],
          ["HbA1c", "Normal", "<5.7% (<39 mmol/mol)"],
          ["C-peptide (fasting)", "Child", "0.5–2.0 ng/mL"],
        ]} />

      {/* Urine */}
      <RefTable title="🧪 Normal Urine Values" colorClass="green"
        headers={["Parameter", "Normal Range", "Notes"]}
        rows={[
          ["Urine Protein", "< 150 mg/day (>2y)", "Spot UPCR <0.2 mg/mg"],
          ["Urine Albumin:Creatinine", "<30 mg/g", "Microalbuminuria: 30-300"],
          ["Urine Calcium:Creatinine", "<0.2 mg/mg", "Hypercalciuria: >0.2"],
          ["Urine Oxalate:Creatinine", "<0.08 mg/mg", ""],
          ["Urine Uric Acid:Creatinine", "<0.6 mg/mg (<2y)", "<0.4 (2-10y)"],
          ["FEUA", "4-12%", ""],
          ["FENa", "<1% (oliguric AKI)", ""],
          ["TRP (tubular P reabsorption)", ">85%", "Low in Fanconi"],
          ["TmP/GFR", "2.5–4.6 mg/dL (child)", "Low in rickets/Fanconi"],
          ["Urine Osmolality (max)", ">800 mOsm/kg", "ADH response test"],
          ["24h urine volume", "1–2 mL/kg/hr", "Oliguria: <0.5 mL/kg/hr"],
        ]} />

      {/* BP Percentile Quick Table */}
      <RefTable title="🫀 BP 95th Centile Quick Reference (AAP 2017)" colorClass="rose"
        headers={["Age (y)", "Boys SBP (mmHg)", "Boys DBP", "Girls SBP", "Girls DBP"]}
        rows={[
          ["1", "98", "52", "100", "54"],
          ["2", "100", "55", "101", "58"],
          ["3", "101", "58", "102", "60"],
          ["4", "102", "60", "103", "62"],
          ["5", "103", "63", "104", "64"],
          ["6", "105", "66", "105", "67"],
          ["7", "106", "68", "106", "68"],
          ["8", "107", "69", "107", "69"],
          ["9", "109", "70", "108", "71"],
          ["10", "110", "72", "109", "72"],
          ["12", "113", "74", "114", "74"],
          ["13", "117", "76", "117", "76"],
          ["15", "120", "79", "118", "77"],
          ["17", "128", "82", "119", "77"],
        ]} />

      {/* MUAC */}
      <RefTable title="📏 MUAC (Mid-Upper Arm Circumference) Reference" colorClass="orange"
        headers={["Category", "MUAC", "Action"]}
        rows={[
          ["Normal", "≥ 12.5 cm", "No action needed"],
          ["Moderate Acute Malnutrition", "11.5–12.4 cm", "Supplementary feeding program"],
          ["Severe Acute Malnutrition", "< 11.5 cm", "Therapeutic feeding / hospitalise"],
          ["Green MUAC band", "≥ 12.5 cm", "Discharge from program"],
          ["Yellow band", "11.5–12.4 cm", "CMAM program"],
          ["Red band", "< 11.5 cm", "F-MAS / hospital admission"],
        ]} />

      {/* CSF */}
      <RefTable title="🔬 Normal CSF Values" colorClass="purple"
        headers={["Parameter", "Neonate", "Child", "Adolescent"]}
        rows={[
          ["Opening pressure (cmH2O)", "8–10", "10–18", "12–20"],
          ["WBC (cells/μL)", "0–30", "0–5", "0–5"],
          ["Glucose (mg/dL)", "45–100", "45–80", "50–80"],
          ["CSF:Serum glucose ratio", ">0.6", ">0.6", ">0.6"],
          ["Protein (mg/dL)", "20–170", "15–45", "15–40"],
          ["RBCs", "0–2", "0", "0"],
        ]} />
    </div>
  );
}