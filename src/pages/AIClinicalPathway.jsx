import React, { useState } from "react";
import { base44 } from "@/api/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Brain, ArrowLeft, Loader2, AlertTriangle, CheckCircle, Pill, Activity,
  FileText, Zap, Shield, Stethoscope, ClipboardList, Printer, MessageCircle,
  ChevronRight, Info, Beaker, Star, StarOff, Plus, X, Trash2
} from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { usePatient } from "../components/PatientContext";

// ─── Inline Disease-Drug Rules ──────────────────────────────────────────────
const DISEASE_DRUG_RULES = {
  "nephrotic_syndrome_ssns": {
    label: "Nephrotic Syndrome (SSNS - First Episode)",
    first_line: ["Prednisolone"],
    second_line: ["Levamisole", "Mycophenolate Mofetil"],
    supportive: ["Furosemide", "Enalapril", "Amlodipine"],
    avoid: ["NSAIDs", "Nephrotoxins"],
    monitoring: ["Urine protein daily (dipstick)", "BP weekly", "Weight daily", "Serum albumin 2-weekly", "Blood glucose weekly on steroids"],
  },
  "nephrotic_syndrome_frns": {
    label: "Nephrotic Syndrome (FRNS/SDNS)",
    first_line: ["Prednisolone"],
    second_line: ["Levamisole", "Mycophenolate Mofetil", "Tacrolimus", "Cyclophosphamide"],
    biologics: ["Rituximab"],
    supportive: ["Enalapril", "Furosemide"],
    avoid: ["NSAIDs"],
    monitoring: ["Urine protein daily", "BP weekly", "Steroid side effects monitoring", "Drug levels (Tacrolimus trough)", "CBC if Cyclophosphamide"],
  },
  "nephrotic_syndrome_srns": {
    label: "Nephrotic Syndrome (SRNS)",
    first_line: ["Tacrolimus", "Cyclosporine"],
    second_line: ["Mycophenolate Mofetil", "Rituximab"],
    supportive: ["Enalapril", "Furosemide", "Albumin infusion"],
    avoid: ["NSAIDs", "Further steroids alone"],
    monitoring: ["Tacrolimus/CsA levels", "eGFR monthly", "Urine protein", "BP daily", "Electrolytes weekly"],
  },
  "aki": {
    label: "Acute Kidney Injury",
    first_line: ["Furosemide (loop diuretic for fluid overload)"],
    second_line: ["Torsemide"],
    antihypertensives: ["Amlodipine", "Nifedipine"],
    avoid: ["NSAIDs", "ACE inhibitors in AKI", "Aminoglycosides", "Contrast agents", "Nephrotoxins"],
    monitoring: ["Serum creatinine & BUN daily", "Urine output hourly", "Electrolytes daily (K+, Na+, HCO3)", "BP 4-hourly", "Fluid balance daily"],
  },
  "ckd": {
    label: "Chronic Kidney Disease",
    first_line: ["Enalapril", "Ramipril"],
    second_line: ["Losartan", "Telmisartan"],
    supportive: ["Furosemide", "Amlodipine", "Calcitriol", "Sodium bicarbonate"],
    avoid: ["NSAIDs", "Contrast agents", "Nephrotoxins", "High potassium foods"],
    monitoring: ["eGFR every 3 months", "Urine ACR", "BP target <75th percentile", "Hemoglobin (ESA therapy)", "PTH + Calcium + Phosphate", "Electrolytes monthly"],
  },
  "htn": {
    label: "Pediatric Hypertension",
    first_line: ["Amlodipine", "Enalapril"],
    second_line: ["Losartan", "Atenolol", "Metoprolol"],
    emergency: ["Labetalol IV", "Sodium Nitroprusside IV"],
    monitoring: ["BP every visit", "Fundoscopy annually", "Echo if sustained HTN", "eGFR baseline", "Urine protein"],
  },
  "hus": {
    label: "Hemolytic Uremic Syndrome (aHUS)",
    first_line: ["Eculizumab (anti-C5)"],
    supportive: ["Plasma exchange", "Dialysis if required"],
    avoid: ["Antibiotics in STEC-HUS", "Antiplatelets", "Antidiarrheals"],
    monitoring: ["CBC daily (platelets, Hb)", "Creatinine daily", "LDH daily", "BP 4-hourly", "Urine output"],
  },
  "uti": {
    label: "Urinary Tract Infection / Pyelonephritis",
    first_line: ["Nitrofurantoin (lower UTI)", "Cotrimoxazole"],
    second_line: ["Cefixime", "Amoxicillin-Clavulanate"],
    iv: ["Ceftriaxone IV", "Gentamicin IV (caution with renal function)"],
    prophylaxis: ["Nitrofurantoin (low dose)", "Cotrimoxazole (low dose)"],
    monitoring: ["Urine culture pre/post treatment", "Renal USS", "DMSA scan if febrile UTI"],
  },
  "nephritic": {
    label: "Nephritic Syndrome / GN",
    supportive: ["Furosemide", "Amlodipine", "Nifedipine"],
    immunosuppression: ["Prednisolone (if indicated)", "Mycophenolate Mofetil"],
    monitoring: ["Urine RBC/casts", "Serum complement (C3/C4)", "ASOT/Anti-DNAse B (PSGN)", "BP daily", "Creatinine", "Urine protein"],
  },
};

// ─── Lab Test Templates by Condition ────────────────────────────────────────
const LAB_TEMPLATES = {
  "nephrotic_syndrome_ssns": {
    label: "Nephrotic Syndrome (1st Episode)",
    icon: "🧪",
    labs: ["Urine dipstick (protein)", "Urine Protein:Creatinine ratio", "Serum albumin", "Serum cholesterol", "Serum creatinine", "eGFR", "CBC", "Serum electrolytes (Na/K)", "HBsAg", "Anti-HCV", "C3 complement", "ANA (if atypical)"],
  },
  "ckd": {
    label: "CKD Monitoring",
    icon: "🩺",
    labs: ["Serum creatinine + eGFR", "Urine ACR (albumin:creatinine)", "Serum electrolytes", "Hemoglobin", "Ferritin + TSAT", "Serum PTH", "Serum calcium + phosphate", "25-OH Vitamin D", "Bicarbonate (acid-base)", "Uric acid", "HbA1c (if diabetic)"],
  },
  "aki": {
    label: "AKI Workup",
    icon: "⚡",
    labs: ["Serum creatinine (serial)", "BUN", "Serum electrolytes (K+, Na+, HCO3)", "Urine output (hourly)", "Urine dipstick", "Urine sodium + creatinine (FENa)", "CBC", "ABG/VBG", "Urine microscopy", "Renal ultrasound"],
  },
  "uti": {
    label: "UTI / Pyelonephritis",
    icon: "🦠",
    labs: ["Urine dipstick", "Urine microscopy", "Urine culture + sensitivity (MSU)", "CBC", "CRP", "Serum creatinine", "Renal ultrasound", "DMSA scan (febrile UTI, first episode)", "VCUG (if VUR suspected)"],
  },
  "htn": {
    label: "Hypertension Workup",
    icon: "❤️",
    labs: ["Serum creatinine + eGFR", "Urine ACR", "Serum electrolytes", "Renin + Aldosterone (secondary HTN)", "Thyroid function tests", "Renal Doppler USS", "Urine catecholamines/metanephrines", "Echocardiogram", "Retinal examination"],
  },
  "hus": {
    label: "HUS / TMA Workup",
    icon: "🔴",
    labs: ["CBC + peripheral smear (schistocytes)", "Platelets", "LDH", "Serum creatinine", "Serum haptoglobin", "Direct Coombs test", "ADAMTS13 activity", "Complement (C3, C4, CH50)", "Stool STEC culture + VTEC PCR", "Anti-FH antibody"],
  },
  "nephritic": {
    label: "Nephritic Syndrome / GN",
    icon: "🔬",
    labs: ["Urine microscopy (RBC casts)", "Urine protein:creatinine", "Serum creatinine", "C3, C4 complement", "ASO titre, Anti-DNase B", "ANA, anti-dsDNA", "ANCA (pANCA/cANCA)", "Anti-GBM antibody", "HBsAg, Anti-HCV", "Renal biopsy (if indicated)"],
  },
};

// ─── Drug Interaction Database ──────────────────────────────────────────────
const DRUG_INTERACTIONS = [
  { drug1: "tacrolimus", drug2: "fluconazole", severity: "critical", effect: "Fluconazole significantly increases Tacrolimus levels (CYP3A4 inhibition) — risk of nephrotoxicity and toxicity" },
  { drug1: "tacrolimus", drug2: "clarithromycin", severity: "critical", effect: "Clarithromycin markedly raises Tacrolimus levels — adjust dose and monitor levels closely" },
  { drug1: "cyclosporine", drug2: "methotrexate", severity: "high", effect: "Increased methotrexate toxicity and nephrotoxicity" },
  { drug1: "mycophenolate", drug2: "antacids", severity: "moderate", effect: "Antacids reduce MMF absorption — take MMF 2h apart from antacids" },
  { drug1: "enalapril", drug2: "potassium", severity: "high", effect: "ACE inhibitors + K+ supplements → hyperkalemia risk, especially in CKD" },
  { drug1: "enalapril", drug2: "losartan", severity: "high", effect: "Dual RAS blockade — increased hyperkalemia and acute kidney injury risk; avoid combination" },
  { drug1: "furosemide", drug2: "gentamicin", severity: "high", effect: "Additive ototoxicity and nephrotoxicity — avoid if possible" },
  { drug1: "furosemide", drug2: "ibuprofen", severity: "high", effect: "NSAIDs reduce furosemide efficacy and worsen renal perfusion" },
  { drug1: "prednisolone", drug2: "ibuprofen", severity: "moderate", effect: "Increased GI ulcer risk — consider PPI prophylaxis" },
  { drug1: "cyclophosphamide", drug2: "allopurinol", severity: "high", effect: "Allopurinol inhibits cyclophosphamide metabolism — risk of myelosuppression" },
  { drug1: "rituximab", drug2: "live vaccines", severity: "critical", effect: "Live vaccines CONTRAINDICATED within 6 months of Rituximab — risk of fatal disseminated infection" },
  { drug1: "cotrimoxazole", drug2: "methotrexate", severity: "high", effect: "Additive antifolate effect — risk of severe myelosuppression" },
  { drug1: "amlodipine", drug2: "tacrolimus", severity: "moderate", effect: "Amlodipine may slightly increase Tacrolimus levels — monitor" },
  { drug1: "levamisole", drug2: "prednisolone", severity: "low", effect: "Concurrent use is standard in FRNS — monitor CBC for agranulocytosis (levamisole side effect)" },
];

function checkInteractions(selectedDrugs) {
  const lower = selectedDrugs.map(d => d.toLowerCase());
  const found = [];
  DRUG_INTERACTIONS.forEach(({ drug1, drug2, severity, effect }) => {
    const has1 = lower.some(d => d.includes(drug1));
    const has2 = lower.some(d => d.includes(drug2));
    if (has1 && has2) found.push({ drug1, drug2, severity, effect });
  });
  return found;
}

// ─── Severity colors ─────────────────────────────────────────────────────────
const SEV_COLORS = {
  critical: "bg-red-100 border-red-400 text-red-900",
  high: "bg-orange-100 border-orange-400 text-orange-900",
  moderate: "bg-amber-100 border-amber-400 text-amber-900",
  low: "bg-blue-100 border-blue-400 text-blue-700",
};
const SEV_ICONS = { critical: "🔴", high: "🟠", moderate: "🟡", low: "🔵" };

export default function AIClinicalPathway() {
  const { patientData } = usePatient();

  const [weight, setWeight] = useState(patientData.weight ? String(patientData.weight) : "");
  const [age, setAge] = useState(patientData.age ? String(patientData.age) : "");
  const [egfr, setEgfr] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [labs, setLabs] = useState("");
  const [selectedDisease, setSelectedDisease] = useState("");
  const [customDrugs, setCustomDrugs] = useState([]);
  const [drugInput, setDrugInput] = useState("");
  const [aiOutput, setAiOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("input");
  const [labSet, setLabSet] = useState([]);
  const [customLab, setCustomLab] = useState("");
  const [savedLabTemplates, setSavedLabTemplates] = useState(() => {
    try { return JSON.parse(localStorage.getItem("lab_templates") || "[]"); } catch { return []; }
  });
  const [saveLabName, setSaveLabName] = useState("");
  const [showSaveLab, setShowSaveLab] = useState(false);

  const { data: dbDrugs = [] } = useQuery({
    queryKey: ['drugs'],
    queryFn: () => base44.entities.Drug.list('generic_name'),
  });

  const suggestedDrugs = selectedDisease ? DISEASE_DRUG_RULES[selectedDisease] : null;
  const allSelectedDrugs = [...customDrugs];
  const interactions = checkInteractions(allSelectedDrugs);

  const addDrug = () => {
    const d = drugInput.trim();
    if (d && !customDrugs.includes(d)) {
      setCustomDrugs(prev => [...prev, d]);
      setDrugInput("");
    }
  };

  const removeDrug = (d) => setCustomDrugs(prev => prev.filter(x => x !== d));

  const runPathway = async () => {
    if (!weight || !symptoms) {
      toast.error("Please enter weight and presenting symptoms");
      return;
    }
    setLoading(true);
    setActiveTab("output");
    try {
      const prompt = `You are a Pediatric Nephrology Clinical Co-pilot following KDIGO 2024, IPNA 2023, ISKDC, ISPN, and IAP guidelines.

PATIENT:
- Age: ${age || "Unknown"} years  
- Weight: ${weight} kg
- eGFR: ${egfr || "Not provided"} mL/min/1.73m²
- Presenting symptoms: ${symptoms}
- Working diagnosis: ${diagnosis || "Not specified"}
- Relevant labs: ${labs || "Not provided"}
- Current/proposed drugs: ${allSelectedDrugs.length ? allSelectedDrugs.join(", ") : "None listed"}
- Selected disease category: ${selectedDisease ? DISEASE_DRUG_RULES[selectedDisease]?.label : "Not selected"}

Generate a structured clinical pathway response in this EXACT format:

## 🩺 Syndrome Classification
[Classify the syndrome based on symptoms and labs — NS/AKI/CKD/GN/HUS etc. State subtype if determinable. State what further workup is needed to confirm.]

## 📋 Immediate Management Steps
[Numbered list of immediate clinical actions — investigations, monitoring, supportive care. Prioritize by urgency.]

## 💊 Drug Therapy Plan
[For each drug: Name | Dose (mg/kg or mg/m²) | Frequency | Route | Duration | Key Monitoring. Base on weight ${weight} kg.]

## ⚠️ Safety Alerts
[Red flags, drug contraindications, dose caps, dangerous drug combinations if any, renal dose adjustments for eGFR ${egfr || "unknown"}]

## 📊 Monitoring Checklist
[Specific parameters with frequency — labs, vitals, imaging, clinic intervals]

## 🥗 Supportive Measures
[Diet modifications, fluid management, salt restriction, vaccination precautions if on immunosuppression]

## 🔁 Follow-up Plan
[Structured follow-up — frequency, triggers for escalation, when to refer]

Be concise, evidence-based, and practical for an Indian pediatric nephrology setting. Use ISKDC/IPNA first-line protocols.`;

      const result = await base44.integrations.Core.InvokeLLM({ prompt, model: "claude_sonnet_4_6" });
      setAiOutput(result);
      toast.success("Pathway generated");
    } catch (e) {
      toast.error("AI pathway generation failed");
    } finally {
      setLoading(false);
    }
  };

  const printPrescription = () => {
    const win = window.open("", "_blank");
    win.document.write(`<html><head><title>Clinical Pathway</title>
    <style>body{font-family:Arial,sans-serif;padding:24px;max-width:800px;margin:auto}h1{font-size:18px}h2{font-size:14px;margin-top:16px}p,li{font-size:12px}pre{background:#f5f5f5;padding:12px;font-size:11px}</style></head>
    <body><h1>AI Clinical Pathway — Pediatric Nephrology</h1>
    <p><strong>Patient:</strong> ${age || "?"} y, ${weight} kg | eGFR: ${egfr || "N/A"} | Dx: ${diagnosis || "—"}</p>
    <hr/><pre>${aiOutput || ""}</pre>
    <hr/><p style="font-size:10px;color:#888">Generated by CliniCals by Swarnim. Verify all clinical decisions independently. Date: ${new Date().toLocaleDateString()}</p>
    </body></html>`);
    win.print();
  };

  const whatsappShare = () => {
    const text = encodeURIComponent(`*Clinical Pathway*\nPt: ${age}y, ${weight}kg | Dx: ${diagnosis}\n\n${aiOutput?.slice(0, 1500) || ""}...\n\n_CliniCals by Swarnim_`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <Link to={createPageUrl("ClinicalToolsHub")}>
          <Button variant="outline" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
        </Link>

        <div className="mb-5 flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">AI Clinical Pathway</h1>
            <p className="text-sm text-slate-500">KDIGO/IPNA/ISKDC-guided diagnosis → drug plan → safety checks → prescription</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-4 mb-4">
            <TabsTrigger value="input">📝 Patient</TabsTrigger>
            <TabsTrigger value="output">🧠 AI Pathway</TabsTrigger>
            <TabsTrigger value="drugs">💊 Drugs</TabsTrigger>
            <TabsTrigger value="labs">🧪 Lab Sets</TabsTrigger>
          </TabsList>

          {/* ── INPUT TAB ── */}
          <TabsContent value="input" className="space-y-4">
            {/* Patient parameters */}
            <Card className="bg-white shadow-md border border-indigo-200">
              <CardHeader className="bg-indigo-50 border-b py-3 px-5">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-600" /> Patient Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-xs font-semibold">Age (years)</Label>
                  <Input value={age} onChange={e => setAge(e.target.value)} placeholder="8" className="mt-1 text-sm" />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Weight (kg) *</Label>
                  <Input value={weight} onChange={e => setWeight(e.target.value)} placeholder="25" className="mt-1 text-sm" />
                </div>
                <div>
                  <Label className="text-xs font-semibold">eGFR (mL/min/1.73m²)</Label>
                  <Input value={egfr} onChange={e => setEgfr(e.target.value)} placeholder="90" className="mt-1 text-sm" />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Working Diagnosis</Label>
                  <Input value={diagnosis} onChange={e => setDiagnosis(e.target.value)} placeholder="e.g. NS relapse" className="mt-1 text-sm" />
                </div>
              </CardContent>
            </Card>

            {/* Clinical details */}
            <Card className="bg-white shadow-md border border-indigo-200">
              <CardHeader className="bg-indigo-50 border-b py-3 px-5">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-indigo-600" /> Clinical Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div>
                  <Label className="text-xs font-semibold">Presenting Symptoms & Examination *</Label>
                  <Textarea value={symptoms} onChange={e => setSymptoms(e.target.value)}
                    placeholder="e.g. Periorbital oedema for 5 days, 3+ proteinuria, albumin 1.8 g/dL, BP 105/68 mmHg, weight gain 3 kg..."
                    className="mt-1 text-sm min-h-[80px]" />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Key Lab Results</Label>
                  <Textarea value={labs} onChange={e => setLabs(e.target.value)}
                    placeholder="e.g. Urine protein 4+, Serum albumin 1.6, Creatinine 0.5, Cholesterol 320, Hb 11.2..."
                    className="mt-1 text-sm min-h-[60px]" />
                </div>
              </CardContent>
            </Card>

            {/* Disease selector */}
            <Card className="bg-white shadow-md border border-indigo-200">
              <CardHeader className="bg-indigo-50 border-b py-3 px-5">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-indigo-600" /> Disease Category (for drug suggestions)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <Select value={selectedDisease} onValueChange={setSelectedDisease}>
                  <SelectTrigger className="text-sm"><SelectValue placeholder="Select disease category..." /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(DISEASE_DRUG_RULES).map(([key, val]) => (
                      <SelectItem key={key} value={key}>{val.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {suggestedDrugs && (
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {Object.entries(suggestedDrugs).filter(([k]) => k !== 'label').map(([category, drugs]) => (
                      <div key={category} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">{category.replace(/_/g, ' ')}</p>
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(drugs) && drugs.map(d => (
                            <Badge key={d} onClick={() => { if (!customDrugs.includes(d)) setCustomDrugs(prev => [...prev, d]); }}
                              className={`text-xs cursor-pointer hover:bg-indigo-200 ${customDrugs.includes(d) ? 'bg-indigo-600 text-white' : 'bg-white border border-indigo-300 text-indigo-700'}`}>
                              {d}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Manual drug entry */}
                <div>
                  <Label className="text-xs font-semibold">Add drugs manually (for interaction checking)</Label>
                  <div className="flex gap-2 mt-1">
                    <Input value={drugInput} onChange={e => setDrugInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addDrug()}
                      placeholder="Type drug name + Enter" className="text-sm flex-1" />
                    <Button size="sm" onClick={addDrug} className="bg-indigo-600 hover:bg-indigo-700 text-white">Add</Button>
                  </div>
                  {customDrugs.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {customDrugs.map(d => (
                        <Badge key={d} className="bg-indigo-100 text-indigo-800 cursor-pointer" onClick={() => removeDrug(d)}>
                          {d} ✕
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Button onClick={runPathway} disabled={loading || !weight || !symptoms}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 text-base shadow-lg">
              {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Generating Pathway...</> : <><Brain className="w-5 h-5 mr-2" />Generate AI Clinical Pathway</>}
            </Button>
          </TabsContent>

          {/* ── OUTPUT TAB ── */}
          <TabsContent value="output">
            {loading && (
              <Card className="bg-white shadow-md">
                <CardContent className="p-12 text-center">
                  <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
                  <p className="text-slate-600 font-medium">AI generating KDIGO/IPNA-based clinical pathway...</p>
                  <p className="text-xs text-slate-400 mt-1">Using Claude Sonnet for high-quality clinical reasoning</p>
                </CardContent>
              </Card>
            )}

            {!loading && !aiOutput && (
              <Alert className="bg-indigo-50 border-indigo-200">
                <Info className="w-4 h-4 text-indigo-600" />
                <AlertDescription>Complete the patient input and click "Generate AI Clinical Pathway" to see structured output here.</AlertDescription>
              </Alert>
            )}

            {!loading && aiOutput && (
              <div className="space-y-4">
                {/* Action bar */}
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" onClick={printPrescription} variant="outline" className="border-indigo-300 text-indigo-700">
                    <Printer className="w-4 h-4 mr-1" /> Print
                  </Button>
                  <Button size="sm" onClick={whatsappShare} variant="outline" className="border-green-400 text-green-700">
                    <MessageCircle className="w-4 h-4 mr-1" /> WhatsApp
                  </Button>
                  <Button size="sm" onClick={() => { navigator.clipboard.writeText(aiOutput); toast.success("Copied"); }}
                    variant="outline" className="border-slate-300">
                    <FileText className="w-4 h-4 mr-1" /> Copy
                  </Button>
                  <Link to={createPageUrl("DoseCalculator")}>
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                      <Pill className="w-4 h-4 mr-1" /> Open Dose Calculator
                    </Button>
                  </Link>
                </div>

                {/* Patient summary bar */}
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-2 flex gap-4 text-sm flex-wrap">
                  <span><strong>Age:</strong> {age || "?"} y</span>
                  <span><strong>Weight:</strong> {weight} kg</span>
                  {egfr && <span><strong>eGFR:</strong> {egfr} mL/min/1.73m²</span>}
                  {diagnosis && <span><strong>Dx:</strong> {diagnosis}</span>}
                </div>

                {/* AI output */}
                <Card className="bg-white shadow-lg border-2 border-indigo-100">
                  <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b py-3 px-5">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Brain className="w-4 h-4 text-indigo-600" /> Clinical Pathway — KDIGO/IPNA/ISKDC
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5">
                    <ReactMarkdown className="prose prose-sm max-w-none text-slate-800 [&>h2]:text-base [&>h2]:font-bold [&>h2]:text-indigo-800 [&>h2]:mt-4 [&>ul]:text-sm [&>ol]:text-sm [&>p]:text-sm">
                      {aiOutput}
                    </ReactMarkdown>
                  </CardContent>
                </Card>

                {/* Interaction alerts from current drug list */}
                {interactions.length > 0 && (
                  <Card className="bg-red-50 border-2 border-red-300">
                    <CardHeader className="py-3 px-5 border-b border-red-200">
                      <CardTitle className="text-sm text-red-800 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> Drug Interactions Detected
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-2">
                      {interactions.map((ix, i) => (
                        <div key={i} className={`rounded-lg border p-3 text-xs ${SEV_COLORS[ix.severity]}`}>
                          <span className="font-bold">{SEV_ICONS[ix.severity]} {ix.drug1} + {ix.drug2}:</span> {ix.effect}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                <Alert className="bg-amber-50 border-amber-200">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <AlertDescription className="text-xs text-amber-800">
                    AI-generated pathway. Verify all doses, interactions, and clinical decisions independently. Not a substitute for clinical judgment.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </TabsContent>

          {/* ── DRUG SAFETY TAB ── */}
          <TabsContent value="drugs" className="space-y-4">
            <Card className="bg-white shadow-md border border-slate-200">
              <CardHeader className="bg-slate-50 border-b py-3 px-5">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-600" /> Drug-Drug Interaction Checker
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div>
                  <Label className="text-xs font-semibold">Add drugs to check</Label>
                  <div className="flex gap-2 mt-1">
                    <Input value={drugInput} onChange={e => setDrugInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addDrug()}
                      placeholder="e.g. Tacrolimus, Fluconazole..." className="text-sm flex-1" />
                    <Button size="sm" onClick={addDrug} className="bg-purple-600 text-white">Add</Button>
                  </div>
                </div>

                {customDrugs.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {customDrugs.map(d => (
                      <Badge key={d} onClick={() => removeDrug(d)}
                        className="bg-purple-100 text-purple-800 cursor-pointer px-3 py-1 text-xs">
                        {d} <span className="ml-1 text-purple-500">✕</span>
                      </Badge>
                    ))}
                  </div>
                )}

                {customDrugs.length >= 2 && (
                  <>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Shield className="w-4 h-4 text-green-600" />
                      Checking {customDrugs.length} drug{customDrugs.length > 1 ? 's' : ''} for interactions...
                    </div>
                    {interactions.length === 0 ? (
                      <Alert className="bg-green-50 border-green-200">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <AlertDescription className="text-green-800 text-sm">No known interactions detected for this combination in our database.</AlertDescription>
                      </Alert>
                    ) : (
                      <div className="space-y-2">
                        {interactions.map((ix, i) => (
                          <div key={i} className={`rounded-lg border-2 p-3 text-xs ${SEV_COLORS[ix.severity]}`}>
                            <p className="font-bold mb-1">{SEV_ICONS[ix.severity]} [{ix.severity.toUpperCase()}] {ix.drug1} + {ix.drug2}</p>
                            <p>{ix.effect}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* High-risk drug flags */}
            <Card className="bg-white shadow-md border border-slate-200">
              <CardHeader className="bg-slate-50 border-b py-3 px-5">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-600" /> Renal Safety & High-Risk Flags
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                {[
                  { drug: "NSAIDs (Ibuprofen, Naproxen)", flag: "Avoid in ALL renal disease — worsen AKI, edema, BP", sev: "critical" },
                  { drug: "Tacrolimus / Cyclosporine", flag: "Nephrotoxic at high levels — TDM mandatory; monitor creatinine", sev: "high" },
                  { drug: "Gentamicin / Amikacin", flag: "Aminoglycosides — dose by eGFR, monitor drug levels + creatinine daily", sev: "high" },
                  { drug: "ACE inhibitors (Enalapril)", flag: "Avoid in bilateral RAS, solitary kidney, AKI, hyperkalemia >6", sev: "high" },
                  { drug: "Contrast agents (CT/IVP)", flag: "Risk of contrast nephropathy — hydrate, eGFR check, avoid if <30", sev: "high" },
                  { drug: "Cyclophosphamide", flag: "Hemorrhagic cystitis — ensure good hydration + mesna if IV dose; CBC weekly", sev: "high" },
                  { drug: "Rituximab", flag: "No live vaccines 6 months pre/post; PCP prophylaxis; monitor Ig levels", sev: "high" },
                  { drug: "Methotrexate", flag: "Dose-reduce for eGFR <50; folinic acid supplement; CBC + LFT monthly", sev: "moderate" },
                ].map(({ drug, flag, sev }) => (
                  <div key={drug} className={`rounded-lg border p-3 text-xs ${SEV_COLORS[sev]}`}>
                    <span className="font-bold">{SEV_ICONS[sev]} {drug}:</span> {flag}
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="text-center">
              <Link to={createPageUrl("DoseCalculator")}>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Pill className="w-4 h-4 mr-2" /> Open Full Dose Calculator <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </TabsContent>

          {/* ── LAB SETS TAB ── */}
          <TabsContent value="labs" className="space-y-4">
            {/* Condition quick-load */}
            <Card className="bg-white shadow-md border border-teal-200">
              <CardHeader className="bg-teal-50 border-b py-3 px-5">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Beaker className="w-4 h-4 text-teal-600" /> Condition-Based Lab Sets
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <p className="text-xs text-slate-500">Tap a condition to load the recommended lab panel.</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(LAB_TEMPLATES).map(([key, tpl]) => (
                    <button key={key}
                      onClick={() => {
                        setLabSet(prev => {
                          const merged = [...new Set([...prev, ...tpl.labs])];
                          return merged;
                        });
                        toast.success(`Loaded ${tpl.label} labs`);
                      }}
                      className="flex items-center gap-2 px-3 py-2.5 bg-white border-2 border-teal-200 rounded-xl hover:border-teal-400 hover:bg-teal-50 text-left transition-all">
                      <span className="text-lg">{tpl.icon}</span>
                      <span className="text-xs font-semibold text-slate-700 leading-tight">{tpl.label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Current lab set */}
            <Card className="bg-white shadow-md border border-slate-200">
              <CardHeader className="bg-slate-50 border-b py-3 px-5">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span className="flex items-center gap-2"><Beaker className="w-4 h-4 text-indigo-600" /> Current Lab Set ({labSet.length})</span>
                  {labSet.length > 0 && (
                    <button onClick={() => setLabSet([])} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                      <Trash2 className="w-3.5 h-3.5" /> Clear
                    </button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {/* Add custom lab */}
                <div className="flex gap-2">
                  <Input value={customLab} onChange={e => setCustomLab(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && customLab.trim()) { setLabSet(p => [...new Set([...p, customLab.trim()])]); setCustomLab(""); }}}
                    placeholder="Add custom lab test..." className="text-sm flex-1" />
                  <Button size="sm" onClick={() => { if (customLab.trim()) { setLabSet(p => [...new Set([...p, customLab.trim()])]); setCustomLab(""); }}}
                    className="bg-teal-600 hover:bg-teal-700 text-white"><Plus className="w-4 h-4" /></Button>
                </div>

                {labSet.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No labs selected. Load a condition template above or add manually.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {labSet.map(lab => (
                      <div key={lab} className="flex items-center gap-1 bg-teal-50 border border-teal-200 rounded-lg px-2.5 py-1 text-xs text-teal-800 font-medium">
                        {lab}
                        <button onClick={() => setLabSet(p => p.filter(l => l !== lab))} className="text-teal-400 hover:text-red-500 ml-0.5"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                )}

                {labSet.length > 0 && (
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => { navigator.clipboard.writeText(labSet.join("\n")); toast.success("Copied!"); }}
                      className="flex-1 text-xs border border-slate-200 rounded-lg py-2 hover:bg-slate-50 transition-colors text-slate-600">
                      📋 Copy List
                    </button>
                    <button onClick={() => setShowSaveLab(v => !v)}
                      className="flex-1 text-xs bg-indigo-600 text-white rounded-lg py-2 hover:bg-indigo-700 transition-colors">
                      <Star className="w-3.5 h-3.5 inline mr-1" /> Save as Template
                    </button>
                  </div>
                )}

                {showSaveLab && (
                  <div className="flex gap-2">
                    <Input value={saveLabName} onChange={e => setSaveLabName(e.target.value)}
                      placeholder="Template name (e.g. NS Follow-up)" className="text-sm flex-1" />
                    <Button size="sm" onClick={() => {
                      if (!saveLabName.trim()) { toast.error("Enter a name"); return; }
                      const updated = [...savedLabTemplates, { id: Date.now(), name: saveLabName, labs: labSet }];
                      setSavedLabTemplates(updated);
                      localStorage.setItem("lab_templates", JSON.stringify(updated));
                      setSaveLabName(""); setShowSaveLab(false);
                      toast.success("Template saved!");
                    }} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs">Save</Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Saved templates */}
            {savedLabTemplates.length > 0 && (
              <Card className="bg-white shadow-md border border-amber-200">
                <CardHeader className="bg-amber-50 border-b py-3 px-5">
                  <CardTitle className="text-sm flex items-center gap-2"><Star className="w-4 h-4 text-amber-500 fill-amber-400" /> Saved Lab Templates</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                  {savedLabTemplates.map(tpl => (
                    <div key={tpl.id} className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{tpl.name}</p>
                        <p className="text-xs text-slate-500">{tpl.labs.length} tests</p>
                      </div>
                      <div className="flex gap-1.5">
                        <button onClick={() => { setLabSet([...new Set([...labSet, ...tpl.labs])]); toast.success(`Loaded ${tpl.name}`); }}
                          className="text-xs bg-teal-600 text-white px-2.5 py-1 rounded-lg hover:bg-teal-700">Load</button>
                        <button onClick={() => {
                          const updated = savedLabTemplates.filter(t => t.id !== tpl.id);
                          setSavedLabTemplates(updated);
                          localStorage.setItem("lab_templates", JSON.stringify(updated));
                        }} className="text-xs text-red-400 hover:text-red-600 px-1.5"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}