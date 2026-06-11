import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft, Search, Pill, AlertTriangle, Info, Calculator, Shield,
  Printer, MessageCircle, Plus, Trash2, CheckCircle, Activity, Beaker, X,
  FlaskConical, BookOpen, Syringe, Library, Upload, FileText, Download
} from "lucide-react";
import DrugDetailCard from "../components/drugs/DrugDetailCard";
import SteroidEquivalenceEngine from "../components/drugs/SteroidEquivalenceEngine";
import EculizumabGuidance from "../components/drugs/EculizumabGuidance";
import PlasmapheresisModule from "../components/drugs/PlasmapheresisModule";
import PlasmapheresisCalculator from "../components/drugs/PlasmapheresisCalculator";
import FormularyBrowser from "../components/drugs/FormularyBrowser";
import { toast } from "sonner";
import { usePatient } from "../components/PatientContext";
import StickyToolNav from "../components/StickyToolNav";


// ─── Inline interaction rules (rule-based, no DB needed) ─────────────────────
const INTERACTION_RULES = [
  { a: "tacrolimus", b: "fluconazole", severity: "high", msg: "Fluconazole inhibits CYP3A4 → markedly increases Tacrolimus levels → nephrotoxicity risk. Monitor levels closely, reduce dose." },
  { a: "tacrolimus", b: "clarithromycin", severity: "high", msg: "Clarithromycin inhibits CYP3A4 → increased Tacrolimus levels. Use azithromycin instead if possible." },
  { a: "tacrolimus", b: "amlodipine", severity: "moderate", msg: "Amlodipine may slightly increase Tacrolimus trough levels. Monitor." },
  { a: "cyclosporine", b: "furosemide", severity: "moderate", msg: "Furosemide may increase cyclosporine nephrotoxicity risk in volume-depleted patients." },
  { a: "cyclosporine", b: "atorvastatin", severity: "high", msg: "Cyclosporine increases statin levels → risk of myopathy/rhabdomyolysis. Use pravastatin (not metabolised by CYP3A4)." },
  { a: "enalapril", b: "losartan", severity: "high", msg: "Dual RAS blockade: ACEi + ARB together → hyperkalemia + AKI risk. Avoid combination." },
  { a: "enalapril", b: "potassium", severity: "moderate", msg: "ACEi + K+ supplements → hyperkalemia, especially in CKD. Monitor serum potassium." },
  { a: "enalapril", b: "spironolactone", severity: "moderate", msg: "ACEi + aldosterone antagonist → hyperkalemia risk. Monitor K+ closely." },
  { a: "furosemide", b: "gentamicin", severity: "high", msg: "Additive ototoxicity and nephrotoxicity. Avoid combination if possible; if necessary, monitor hearing and renal function daily." },
  { a: "furosemide", b: "vancomycin", severity: "moderate", msg: "Additive ototoxicity and nephrotoxicity. Monitor TDM levels and renal function." },
  { a: "furosemide", b: "ibuprofen", severity: "high", msg: "NSAIDs reduce furosemide efficacy by inhibiting prostaglandin-mediated renal blood flow. Worsens renal function." },
  { a: "prednisolone", b: "ibuprofen", severity: "moderate", msg: "Increased GI ulceration risk with combined steroid + NSAID. Add PPI prophylaxis (omeprazole)." },
  { a: "mycophenolate", b: "antacids", severity: "moderate", msg: "Antacids containing Mg/Al reduce MMF absorption. Take MMF 2 hours apart from antacids." },
  { a: "mycophenolate", b: "azathioprine", severity: "high", msg: "Both are antiproliferative agents — concurrent use increases myelosuppression risk. Avoid combination." },
  { a: "cyclophosphamide", b: "allopurinol", severity: "high", msg: "Allopurinol inhibits cyclophosphamide metabolism → enhanced myelosuppression. Reduce cyclophosphamide dose by 25-50%." },
  { a: "rituximab", b: "live vaccine", severity: "high", msg: "Live vaccines CONTRAINDICATED within 6 months before or after Rituximab. Risk of fatal disseminated infection." },
  { a: "cotrimoxazole", b: "methotrexate", severity: "high", msg: "Additive antifolate effect → severe myelosuppression. Avoid combination or supplement with folinic acid." },
  { a: "methotrexate", b: "ibuprofen", severity: "high", msg: "NSAIDs reduce renal methotrexate excretion → toxicity. Avoid NSAIDs with methotrexate." },
  { a: "amlodipine", b: "tacrolimus", severity: "moderate", msg: "Amlodipine is a weak CYP3A4 inhibitor → may slightly increase tacrolimus levels. Monitor." },
  { a: "levamisole", b: "prednisolone", severity: "low", msg: "Standard combination for FRNS. Monitor CBC for agranulocytosis (levamisole side effect) — monthly CBC." },
  { a: "calcitriol", b: "thiazide", severity: "moderate", msg: "Thiazides + calcitriol → hypercalcemia risk. Monitor calcium." },
  { a: "calcitriol", b: "calcium carbonate", severity: "low", msg: "Monitor serum calcium if using both. Risk of hypercalcemia with high doses." },
  { a: "sodium bicarbonate", b: "calcium", severity: "moderate", msg: "Alkalinisation can reduce ionised calcium → tetany risk in hypocalcemic patients." },
];

function findInteractions(drugs) {
  const lower = drugs.map(d => d.generic_name?.toLowerCase() || "");
  const found = [];
  INTERACTION_RULES.forEach(rule => {
    const hasA = lower.some(n => n.includes(rule.a));
    const hasB = lower.some(n => n.includes(rule.b));
    if (hasA && hasB) found.push(rule);
  });
  return found;
}

// ─── Dose engine ─────────────────────────────────────────────────────────────
function freqFactor(freq = "") {
  if (!freq) return 1;
  const f = freq.toUpperCase();
  if (f.includes("QID") || f.includes("Q6H") || f.includes("4X")) return 4;
  if (f.includes("TID") || f.includes("TDS") || f.includes("Q8H") || f.includes("3X")) return 3;
  if (f.includes("BID") || f.includes("BD") || f.includes("Q12H") || f.includes("TWICE") || f.includes("2X")) return 2;
  return 1;
}

function calcDose(drug, wt, bsa, egfr) {
  if (!drug) return null;
  const raw = drug.dose_weight_based || "";
  const type = drug.dose_calculation_type || "per_day";
  const freq = drug.frequency || "OD";

  // TDM drugs
  if (type === "TDM") {
    return { type: "TDM", perDose: "TDM-guided", daily: "—", freq, note: `Starting: ${raw}\nTarget: ${drug.monitoring || "see protocol"}` };
  }

  // Fixed / age-based
  if (type === "fixed" || (!raw.includes("/kg") && !raw.includes("/m²"))) {
    return { type: "fixed", perDose: drug.dose_age_based || raw, daily: "—", freq, note: "Age-based or fixed dose" };
  }

  // BSA-based (mg/m²)
  if (raw.includes("/m²")) {
    const m = raw.match(/([\d.]+)(?:-)?([\d.]+)?\s*(\w+)\/m²/);
    if (m && bsa) {
      const minD = parseFloat(m[1]) * bsa;
      const maxD = m[2] ? parseFloat(m[2]) * bsa : minD;
      const unit = m[3];
      const factor = freqFactor(freq);
      const perMin = (minD / factor).toFixed(1);
      const perMax = m[2] ? (maxD / factor).toFixed(1) : perMin;
      const label = m[2] ? `${perMin}–${perMax} ${unit}` : `${perMin} ${unit}`;
      const daily = m[2] ? `${minD.toFixed(1)}–${maxD.toFixed(1)} ${unit}/day` : `${minD.toFixed(1)} ${unit}/day`;
      const maxCheck = drug.max_dose_per_day ? checkMax(perMax, drug.max_dose_per_day) : null;
      return { type: "bsa", perDose: label, daily, freq, note: `${m[1]}${m[2] ? `–${m[2]}` : ""} ${unit}/m²/day × BSA ${bsa.toFixed(2)} m²`, maxExceeded: maxCheck };
    }
  }

  // Weight-based (mg/kg)
  if (raw.includes("/kg")) {
    const m = raw.match(/([\d.]+)(?:-)?([\d.]+)?\s*(\w+)\/kg/);
    if (m && wt) {
      const minRaw = parseFloat(m[1]);
      const maxRaw = m[2] ? parseFloat(m[2]) : minRaw;
      const unit = m[3];
      const factor = freqFactor(freq);

      let minD, maxD;
      if (type === "per_dose") {
        minD = minRaw * wt; maxD = maxRaw * wt;
        const label = m[2] ? `${minD.toFixed(1)}–${maxD.toFixed(1)} ${unit}` : `${minD.toFixed(1)} ${unit}`;
        const daily = `${(minD * factor).toFixed(1)}–${(maxD * factor).toFixed(1)} ${unit}/day`;
        const maxCheck = drug.max_dose_per_day ? checkMax(maxD, drug.max_dose_per_day) : null;
        return { type: "weight_per_dose", perDose: label, daily, freq, note: `${minRaw}${m[2] ? `–${maxRaw}` : ""} ${unit}/kg/dose × ${wt} kg`, maxExceeded: maxCheck };
      } else {
        // per_day
        minD = minRaw * wt; maxD = maxRaw * wt;
        const perMin = (minD / factor).toFixed(1);
        const perMax = (maxD / factor).toFixed(1);
        const label = m[2] ? `${perMin}–${perMax} ${unit}` : `${perMin} ${unit}`;
        const daily = m[2] ? `${minD.toFixed(1)}–${maxD.toFixed(1)} ${unit}/day` : `${minD.toFixed(1)} ${unit}/day`;
        const maxCheck = drug.max_dose_per_day ? checkMax(parseFloat(perMax), drug.max_dose_per_day) : null;
        return { type: "weight_per_day", perDose: label, daily, freq, note: `${minRaw}${m[2] ? `–${maxRaw}` : ""} ${unit}/kg/day ÷ ${factor} doses × ${wt} kg`, maxExceeded: maxCheck };
      }
    }
  }

  return { type: "unknown", perDose: raw, daily: "—", freq, note: "See drug monograph for calculation" };
}

function checkMax(calcDose, maxStr) {
  const calcNum = typeof calcDose === "string" ? parseFloat(calcDose) : calcDose;
  const maxNum = parseFloat(maxStr);
  if (!isNaN(calcNum) && !isNaN(maxNum) && calcNum > maxNum) {
    return { exceeded: true, maxStr };
  }
  return { exceeded: false, maxStr };
}

function getRenalFlag(drug, egfr) {
  if (!egfr || !drug.renal_adjust) return null;
  const adj = drug.renal_adjust.toLowerCase();
  const g = parseFloat(egfr);
  if ((adj.includes("avoid") || adj.includes("contraindicated")) && g < 30) {
    return { level: "critical", msg: drug.renal_adjust };
  }
  if (adj.includes("reduce") || adj.includes("adjust")) {
    if (g < 30) return { level: "critical", msg: `Significant dose reduction required (eGFR ${g}): ${drug.renal_adjust}` };
    if (g < 60) return { level: "warning", msg: `Dose adjustment needed (eGFR ${g}): ${drug.renal_adjust}` };
  }
  if (adj.includes("caution") && g < 60) {
    return { level: "info", msg: `Use with caution in renal impairment (eGFR ${g}): ${drug.renal_adjust}` };
  }
  return null;
}

// ─── Category colours ─────────────────────────────────────────────────────────
const CAT_COLORS = {
  critical: "bg-red-100 border-red-400 text-red-900",
  high: "bg-orange-100 border-orange-400 text-orange-900",
  moderate: "bg-amber-100 border-amber-300 text-amber-900",
  low: "bg-blue-100 border-blue-200 text-blue-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
  warning: "bg-amber-100 border-amber-400 text-amber-900",
};
const SEV_ICON = { high: "🔴", moderate: "🟡", low: "🔵", critical: "🔴", warning: "🟠", info: "ℹ️" };

const CATEGORY_FILTERS = [
  "All", "Immunosuppressant", "Antihypertensive", "Diuretic", "Antibiotic",
  "CKD", "Emergency", "Corticosteroid", "Complement Inhibitor", "Biologic"
];

export default function DrugsDosing() {
  const { patientData } = usePatient();
  const urlParams = new URLSearchParams(window.location.search);
  const urlFormularyDrug = urlParams.get("formulary");
  const urlSearch = urlParams.get("search");

  // Patient inputs
  const [weight, setWeight] = useState(patientData.weight ? String(patientData.weight) : "");
  const [height, setHeight] = useState(patientData.height ? String(patientData.height) : "");
  const [age, setAge] = useState(patientData.age ? String(patientData.age) : "");
  const [egfr, setEgfr] = useState("");
  const [creatinine, setCreatinine] = useState("");

  // Drug search
  const [query, setQuery] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [activeTab, setActiveTab] = useState(urlFormularyDrug ? "formulary" : urlSearch ? "search" : "formulary");

  // Selected drugs for prescription / interaction check
  const [rxDrugs, setRxDrugs] = useState([]);
  const [focusDrug, setFocusDrug] = useState(null);

  const queryClient = useQueryClient();

  const { data: drugs = [] } = useQuery({
    queryKey: ["drugs-full"],
    queryFn: () => base44.entities.Drug.list("generic_name", 200),
  });

  // Bulk import state
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState([]);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFile(file);
    setImportResult(null);
    try {
      const text = await file.text();
      let rows = [];
      if (file.name.endsWith(".json")) {
        rows = JSON.parse(text);
      } else if (file.name.endsWith(".csv")) {
        const lines = text.split("\n").filter(l => l.trim());
        const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
        rows = lines.slice(1).map(line => {
          const vals = line.split(",").map(v => v.trim().replace(/^"|"$/g, ""));
          const obj = {};
          headers.forEach((h, i) => { if (vals[i]) obj[h] = vals[i]; });
          return obj;
        });
      }
      setImportPreview(rows.slice(0, 5));
      setImportFile({ file, rows });
    } catch {
      toast.error("Failed to parse file — ensure it's valid JSON or CSV");
    }
  };

  const runImport = async () => {
    if (!importFile?.rows?.length) return;
    setImportLoading(true);
    let success = 0, fail = 0;
    for (const row of importFile.rows) {
      try {
        if (!row.generic_name || !row.category || !row.route) { fail++; continue; }
        await base44.entities.Drug.create(row);
        success++;
      } catch { fail++; }
    }
    setImportResult({ success, fail, total: importFile.rows.length });
    setImportLoading(false);
    queryClient.invalidateQueries({ queryKey: ["drugs-full"] });
    toast.success(`Import complete: ${success} added, ${fail} failed`);
  };

  // BSA (Mosteller)
  const bsa = useMemo(() => {
    const h = parseFloat(height), w = parseFloat(weight);
    if (h && w) return parseFloat(Math.sqrt((h * w) / 3600).toFixed(3));
    return null;
  }, [height, weight]);

  // Auto eGFR from creatinine (Schwartz bedside)
  const autoEgfr = useMemo(() => {
    const cr = parseFloat(creatinine), h = parseFloat(height), a = parseFloat(age);
    if (cr && h && a) {
      const k = a < 2 ? 0.33 : a < 13 ? 0.55 : 0.70;
      return ((k * h) / cr).toFixed(0);
    }
    return null;
  }, [creatinine, height, age]);

  const effectiveEgfr = egfr || autoEgfr;

  // Filter drugs
  const filtered = useMemo(() => {
    return drugs.filter(d => {
      const matchQ = !query || d.generic_name?.toLowerCase().includes(query.toLowerCase()) ||
        d.brands_indian?.toLowerCase().includes(query.toLowerCase()) ||
        d.therapeutic_class?.toLowerCase().includes(query.toLowerCase()) ||
        d.category?.toLowerCase().includes(query.toLowerCase());
      const matchCat = catFilter === "All" || d.category?.toLowerCase().includes(catFilter.toLowerCase()) ||
        d.therapeutic_class?.toLowerCase().includes(catFilter.toLowerCase());
      return matchQ && matchCat;
    });
  }, [drugs, query, catFilter]);

  const addToRx = (drug) => {
    if (!rxDrugs.find(d => d.id === drug.id)) {
      setRxDrugs(prev => [...prev, drug]);
      toast.success(`${drug.generic_name} added to prescription`);
    }
  };

  const removeFromRx = (id) => setRxDrugs(prev => prev.filter(d => d.id !== id));

  const interactions = useMemo(() => findInteractions(rxDrugs), [rxDrugs]);

  // Prescription text
  const buildRx = () => {
    const date = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
    const wt = parseFloat(weight), ht = parseFloat(height);
    const lines = rxDrugs.map((drug, i) => {
      const dose = calcDose(drug, wt, bsa, effectiveEgfr);
      const renalFlag = getRenalFlag(drug, effectiveEgfr);
      return `${i + 1}. ${drug.generic_name}
   Dose: ${dose?.perDose || drug.dose_weight_based}
   Frequency: ${dose?.freq || drug.frequency}  |  Route: ${drug.route || "PO"}
   ${renalFlag ? `⚠️ RENAL: ${renalFlag.msg}` : ""}
   Monitoring: ${drug.monitoring || "Standard"}
   Brands (India): ${drug.brands_indian || "Generic"}`;
    }).join("\n\n");

    return `PEDIATRIC NEPHROLOGY PRESCRIPTION
═══════════════════════════════════════════
Age: ${age || "—"} y  |  Weight: ${weight || "—"} kg  |  Height: ${height || "—"} cm
BSA: ${bsa ? bsa + " m²" : "—"}  |  eGFR: ${effectiveEgfr || "—"} mL/min/1.73m²
Date: ${date}

Rx
───────────────────────────────────────────
${lines}

───────────────────────────────────────────
${interactions.length ? `⚠️ INTERACTIONS: ${interactions.map(ix => `${ix.a} + ${ix.b}`).join("; ")}` : "✅ No major interactions detected"}

Prescriber: _________________________
─────────────────────────────────────────
CliniCals by Swarnim | Verify all doses independently`;
  };

  const printRx = () => {
    const w = window.open("", "_blank");
    w.document.write(`<html><head><title>Prescription</title>
    <style>body{font-family:'Courier New',monospace;padding:24px;max-width:700px;margin:auto;font-size:12px}pre{white-space:pre-wrap}</style></head>
    <body><pre>${buildRx()}</pre></body></html>`);
    w.print();
  };

  const shareWA = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(buildRx().slice(0, 2000))}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      <StickyToolNav />
      <div className="max-w-7xl mx-auto p-4 md:p-6">

        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-6 mb-6 shadow-xl text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Pill className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Drugs & Dosing Formulary</h1>
              <p className="text-purple-100 text-sm">Comprehensive pediatric nephrology formulary · mg/kg dose calculator · renal adjustments · Indian formulations</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap text-xs">
            <Badge className="bg-white/20">📚 Full Monographs</Badge>
            <Badge className="bg-white/20">mg/kg & mg/m² dosing</Badge>
            <Badge className="bg-white/20">Indian brands & formulations</Badge>
            <Badge className="bg-white/20">Renal adjustment engine</Badge>
            <Badge className="bg-white/20">Drug interactions</Badge>
          </div>
        </div>

        {/* Patient parameters strip */}
        <Card className="bg-white shadow-md mb-5 border border-purple-200">
          <CardContent className="p-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              <div>
                <Label className="text-xs font-semibold text-slate-600">Weight (kg)</Label>
                <Input value={weight} onChange={e => setWeight(e.target.value)} placeholder="25" className="mt-1 text-sm h-9" />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-600">Height (cm)</Label>
                <Input value={height} onChange={e => setHeight(e.target.value)} placeholder="110" className="mt-1 text-sm h-9" />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-600">Age (years)</Label>
                <Input value={age} onChange={e => setAge(e.target.value)} placeholder="8" className="mt-1 text-sm h-9" />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-600">eGFR (mL/min)</Label>
                <Input value={egfr} onChange={e => setEgfr(e.target.value)} placeholder="90" className="mt-1 text-sm h-9" />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-600">Creatinine (mg/dL)</Label>
                <Input value={creatinine} onChange={e => setCreatinine(e.target.value)} placeholder="0.5 → auto eGFR" className="mt-1 text-sm h-9" />
              </div>
              <div className="flex flex-col justify-end">
                <div className="space-y-1 mt-1">
                  {bsa && <Badge className="bg-teal-100 text-teal-800 text-xs w-full justify-center">BSA {bsa} m²</Badge>}
                  {autoEgfr && !egfr && <Badge className="bg-blue-100 text-blue-800 text-xs w-full justify-center">eGFR≈{autoEgfr} (Schwartz)</Badge>}
                  {effectiveEgfr < 60 && effectiveEgfr > 0 && <Badge className="bg-amber-100 text-amber-800 text-xs w-full justify-center">⚠️ CKD — dose adjust</Badge>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="formulary">
          {/* Mobile-first scrollable tab strip — never pushes page width */}
          <div className="w-full overflow-x-auto mb-4" style={{ scrollbarWidth: "none" }}>
            <TabsList className="flex w-max gap-1 h-auto p-1">
              <TabsTrigger value="formulary" className="text-xs whitespace-nowrap min-h-[36px] px-3">📚 Formulary</TabsTrigger>
              <TabsTrigger value="search" className="text-xs whitespace-nowrap min-h-[36px] px-3">🔍 DB Search</TabsTrigger>
              <TabsTrigger value="calculator" className="text-xs whitespace-nowrap min-h-[36px] px-3">💊 Dose Calc</TabsTrigger>
              <TabsTrigger value="interactions" className="text-xs whitespace-nowrap min-h-[36px] px-3">⚡ Interactions</TabsTrigger>
              <TabsTrigger value="prescription" className="text-xs whitespace-nowrap min-h-[36px] px-3">📋 Rx {rxDrugs.length > 0 && `(${rxDrugs.length})`}</TabsTrigger>
              <TabsTrigger value="steroids" className="text-xs whitespace-nowrap min-h-[36px] px-3">🔄 Steroids</TabsTrigger>
              <TabsTrigger value="eculizumab" className="text-xs whitespace-nowrap min-h-[36px] px-3">🛡️ Eculizumab</TabsTrigger>
              <TabsTrigger value="plasmapheresis" className="text-xs whitespace-nowrap min-h-[36px] px-3">💉 Plasmapheresis</TabsTrigger>
              <TabsTrigger value="ckd-dosing" className="text-xs whitespace-nowrap min-h-[36px] px-3">🫘 CKD Dosing</TabsTrigger>
              <TabsTrigger value="bulk-import" className="text-xs whitespace-nowrap min-h-[36px] px-3">📥 Bulk Import</TabsTrigger>
            </TabsList>
          </div>

          {/* ── FORMULARY TAB ─────────────────────────────────── */}
          <TabsContent value="formulary" className="space-y-4">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4 mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-indigo-900 text-sm">Comprehensive Pediatric Nephrology Formulary</h3>
                  <p className="text-indigo-600 text-xs mt-0.5">Full monographs · Indian formulations & brands · Renal dose adjustments · Administration guidance</p>
                </div>
              </div>
            </div>
            <FormularyBrowser weight={weight} height={height} egfr={effectiveEgfr} initialSearch={urlFormularyDrug || ""} />
          </TabsContent>

          {/* ── SEARCH TAB ─────────────────────────────────────── */}
          <TabsContent value="search" className="space-y-4">
            <div className="flex gap-2 flex-wrap items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input value={query} onChange={e => setQuery(e.target.value)}
                  placeholder="Search drug name, brand, class..." className="pl-9 text-sm" />
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {CATEGORY_FILTERS.map(cat => (
                  <button key={cat} onClick={() => setCatFilter(cat)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${catFilter === cat ? "bg-purple-600 text-white border-purple-600" : "bg-white border-slate-300 text-slate-600 hover:border-purple-400"}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-slate-500">{filtered.length} drug{filtered.length !== 1 ? "s" : ""} found</div>

            {/* Inline dose result when a drug is tapped */}
            {focusDrug && (() => {
              const wt = parseFloat(weight);
              const dose = calcDose(focusDrug, wt, bsa, effectiveEgfr);
              const renalFlag = getRenalFlag(focusDrug, effectiveEgfr);
              return (
                <div className="bg-purple-50 border-2 border-purple-300 rounded-2xl p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-purple-900 text-base">{focusDrug.generic_name}</p>
                      <p className="text-xs text-purple-600">{focusDrug.therapeutic_class}</p>
                    </div>
                    <div className="flex gap-2 items-center flex-shrink-0">
                      <Button size="sm" onClick={() => addToRx(focusDrug)}
                        className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-9 px-3">
                        <Plus className="w-3 h-3 mr-1" /> Add Rx
                      </Button>
                      <button onClick={() => setFocusDrug(null)} className="text-slate-400 hover:text-slate-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {renalFlag && (
                    <div className={`rounded-xl px-3 py-2 text-xs font-medium border ${renalFlag.level === "critical" ? "bg-red-50 border-red-300 text-red-800" : "bg-amber-50 border-amber-300 text-amber-800"}`}>
                      ⚠️ {renalFlag.msg}
                    </div>
                  )}

                  {dose && dose.type !== "TDM" ? (
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "Per Dose", value: dose.perDose, highlight: true },
                        { label: "Daily Total", value: dose.daily },
                        { label: "Frequency", value: dose.freq },
                        { label: "Route", value: focusDrug.route || "PO" },
                      ].map(({ label, value, highlight }) => (
                        <div key={label} className={`rounded-xl p-3 text-center border ${highlight ? "bg-white border-purple-300" : "bg-white border-slate-200"}`}>
                          <p className="text-xs text-slate-500">{label}</p>
                          <p className={`font-bold mt-0.5 ${highlight ? "text-purple-800 text-base" : "text-slate-800 text-sm"}`}>{value || "—"}</p>
                        </div>
                      ))}
                    </div>
                  ) : dose?.type === "TDM" ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 text-xs text-blue-800">
                      <strong>TDM-guided dosing.</strong> {dose.note}
                    </div>
                  ) : null}

                  {dose?.note && dose.type !== "TDM" && <p className="text-xs text-slate-500 bg-white rounded-lg px-2 py-1.5">{dose.note}</p>}
                  {!weight && <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5">Enter weight above for personalised dose calculation</p>}

                  {focusDrug.renal_adjust && (
                    <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-3 py-2 text-xs text-indigo-800">
                      <strong>Renal adjustment:</strong> {focusDrug.renal_adjust}
                      {focusDrug.hd_adjust && <p className="mt-0.5"><strong>HD:</strong> {focusDrug.hd_adjust}</p>}
                      {focusDrug.pd_adjust && <p className="mt-0.5"><strong>PD:</strong> {focusDrug.pd_adjust}</p>}
                    </div>
                  )}
                  {focusDrug.monitoring && (
                    <div className="text-xs text-slate-600 bg-white border border-slate-200 rounded-xl px-3 py-2">
                      <strong>Monitor:</strong> {focusDrug.monitoring}
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-0.5">
              {filtered.map(drug => {
                const isInRx = rxDrugs.find(d => d.id === drug.id);
                const renalFlag = getRenalFlag(drug, effectiveEgfr);
                const isSelected = focusDrug?.id === drug.id;
                return (
                  <button
                    key={drug.id}
                    className={`w-full text-left flex items-center gap-3 px-3 py-3 rounded-xl border-2 transition-all active:scale-[0.99] min-h-[56px] ${isSelected ? "border-purple-400 bg-purple-50" : isInRx ? "border-green-300 bg-green-50" : "border-slate-200 bg-white hover:border-purple-300"}`}
                    onClick={() => setFocusDrug(isSelected ? null : drug)}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isSelected ? "bg-purple-600" : "bg-slate-100"}`}>
                      <Pill className={`w-4 h-4 ${isSelected ? "text-white" : "text-slate-500"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-900 leading-tight">{drug.generic_name}</p>
                      <p className="text-xs text-slate-400 truncate">{drug.therapeutic_class}{drug.brands_indian ? ` · ${drug.brands_indian.split(",")[0].trim()}` : ""}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      {renalFlag && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${renalFlag.level === "critical" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                          {renalFlag.level === "critical" ? "🔴" : "⚠️"}
                        </span>
                      )}
                      {isInRx && <CheckCircle className="w-3.5 h-3.5 text-green-600" />}
                    </div>
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <Pill className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No drugs found. Try a different search or filter.</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── DOSE CALCULATOR TAB ───────────────────────────── */}
          <TabsContent value="calculator" className="space-y-4">
            {/* Drug selector */}
            <Card className="bg-white shadow-sm border border-slate-200">
              <CardContent className="p-4">
                <Label className="text-xs font-semibold text-slate-600">Search & select drug</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input value={focusDrug ? focusDrug.generic_name : query}
                    onFocus={() => setFocusDrug(null)}
                    onChange={e => { setFocusDrug(null); setQuery(e.target.value); }}
                    placeholder="Type to search drug..." className="pl-9 text-sm" />
                </div>
                {!focusDrug && query.length >= 2 && (
                  <div className="border rounded-lg mt-1 divide-y max-h-48 overflow-y-auto shadow-sm">
                    {filtered.slice(0, 8).map(d => (
                      <button key={d.id} onClick={() => { setFocusDrug(d); setQuery(""); }}
                        className="w-full text-left px-3 py-2 hover:bg-purple-50 text-sm flex justify-between">
                        <span className="font-medium">{d.generic_name}</span>
                        <span className="text-xs text-slate-400">{d.category}</span>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {focusDrug && (() => {
              const wt = parseFloat(weight);
              const dose = calcDose(focusDrug, wt, bsa, effectiveEgfr);
              const renalFlag = getRenalFlag(focusDrug, effectiveEgfr);
              return (
                <div className="space-y-4">
                  {/* Drug header */}
                  <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h2 className="text-lg font-bold text-purple-900">{focusDrug.generic_name}</h2>
                          <p className="text-sm text-purple-700">{focusDrug.therapeutic_class}</p>
                          {focusDrug.brands_indian && <p className="text-xs text-slate-500 mt-1">Brands: {focusDrug.brands_indian}</p>}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => addToRx(focusDrug)}
                            className="bg-purple-600 hover:bg-purple-700 text-white text-xs">
                            <Plus className="w-3 h-3 mr-1" /> Add to Rx
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Renal flag */}
                  {renalFlag && (
                    <Alert className={`border-2 ${renalFlag.level === "critical" ? "bg-red-50 border-red-400" : renalFlag.level === "warning" ? "bg-amber-50 border-amber-400" : "bg-blue-50 border-blue-300"}`}>
                      <AlertTriangle className="w-4 h-4" />
                      <AlertDescription className="font-semibold text-sm">{renalFlag.msg}</AlertDescription>
                    </Alert>
                  )}

                  {/* Calculated dose */}
                  {dose && (
                    <Card className="bg-white shadow-md border border-slate-200">
                      <CardHeader className="bg-slate-50 border-b py-3 px-5">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Calculator className="w-4 h-4 text-purple-600" /> Calculated Dose
                          {!wt && <Badge className="bg-amber-100 text-amber-700 text-xs ml-2">Enter weight above to calculate</Badge>}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-5">
                        {dose.type === "TDM" ? (
                          <Alert className="bg-blue-50 border-blue-200">
                            <Beaker className="w-4 h-4 text-blue-600" />
                            <AlertDescription>
                              <strong>TDM-guided dosing.</strong> {dose.note}
                            </AlertDescription>
                          </Alert>
                        ) : (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                              { label: "Per Dose", value: dose.perDose, highlight: true },
                              { label: "Daily Total", value: dose.daily },
                              { label: "Frequency", value: dose.freq },
                              { label: "Route", value: focusDrug.route || "PO" },
                            ].map(({ label, value, highlight }) => (
                              <div key={label} className={`rounded-xl p-3 text-center border ${highlight ? "bg-purple-50 border-purple-200" : "bg-slate-50 border-slate-200"}`}>
                                <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
                                <p className={`font-bold mt-1 ${highlight ? "text-purple-800 text-lg" : "text-slate-800"}`}>{value || "—"}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {dose.note && <p className="text-xs text-slate-500 mt-3 bg-slate-50 rounded p-2">{dose.note}</p>}

                        {dose.maxExceeded?.exceeded && (
                          <Alert className="mt-3 bg-red-50 border-red-300">
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                            <AlertDescription className="text-red-800 text-sm">
                              <strong>Max dose exceeded.</strong> Cap at: {dose.maxExceeded.maxStr} (max per day)
                            </AlertDescription>
                          </Alert>
                        )}

                        {bsa && <div className="text-xs text-slate-400 mt-2">BSA used: {bsa} m² (Mosteller: √[H×W/3600])</div>}
                      </CardContent>
                    </Card>
                  )}

                  {/* Drug details */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {focusDrug.indications && (
                      <Card className="bg-white border border-slate-200">
                        <CardContent className="p-4">
                          <p className="text-xs font-bold text-slate-500 uppercase mb-1">Indications</p>
                          <p className="text-sm text-slate-700">{focusDrug.indications}</p>
                        </CardContent>
                      </Card>
                    )}
                    {focusDrug.monitoring && (
                      <Card className="bg-white border border-slate-200">
                        <CardContent className="p-4">
                          <p className="text-xs font-bold text-slate-500 uppercase mb-1">Monitoring Required</p>
                          <p className="text-sm text-slate-700">{focusDrug.monitoring}</p>
                        </CardContent>
                      </Card>
                    )}
                    {focusDrug.adverse_effects && (
                      <Card className="bg-amber-50 border border-amber-200">
                        <CardContent className="p-4">
                          <p className="text-xs font-bold text-amber-700 uppercase mb-1">Adverse Effects</p>
                          <p className="text-sm text-amber-800">{focusDrug.adverse_effects}</p>
                        </CardContent>
                      </Card>
                    )}
                    {focusDrug.contraindications && (
                      <Card className="bg-red-50 border border-red-200">
                        <CardContent className="p-4">
                          <p className="text-xs font-bold text-red-700 uppercase mb-1">Contraindications</p>
                          <p className="text-sm text-red-800">{focusDrug.contraindications}</p>
                        </CardContent>
                      </Card>
                    )}
                    {focusDrug.renal_adjust && (
                      <Card className="bg-indigo-50 border border-indigo-200">
                        <CardContent className="p-4">
                          <p className="text-xs font-bold text-indigo-700 uppercase mb-1">Renal Dose Adjustment</p>
                          <p className="text-sm text-indigo-800">{focusDrug.renal_adjust}</p>
                          {focusDrug.hd_adjust && <p className="text-xs text-indigo-700 mt-1"><strong>HD:</strong> {focusDrug.hd_adjust}</p>}
                          {focusDrug.pd_adjust && <p className="text-xs text-indigo-700 mt-1"><strong>PD:</strong> {focusDrug.pd_adjust}</p>}
                        </CardContent>
                      </Card>
                    )}
                    {focusDrug.clinical_pearls && (
                      <Card className="bg-green-50 border border-green-200 md:col-span-2">
                        <CardContent className="p-4">
                          <p className="text-xs font-bold text-green-700 uppercase mb-1">💡 Clinical Pearls</p>
                          <p className="text-sm text-green-800">{focusDrug.clinical_pearls}</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Formulations */}
                  {focusDrug.formulations?.length > 0 && (
                    <Card className="bg-white border border-slate-200">
                      <CardContent className="p-4">
                        <p className="text-xs font-bold text-slate-500 uppercase mb-2">Available Formulations (India)</p>
                        <div className="flex flex-wrap gap-2">
                          {focusDrug.formulations.map((f, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {f.form}: <strong className="ml-1">{f.strength}</strong> {f.pack_info && `(${f.pack_info})`}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Practical guidance + quick bedside card */}
                  <DrugDetailCard drug={focusDrug} weight={parseFloat(weight)} egfr={parseFloat(effectiveEgfr)} />
                </div>
              );
            })()}

            {!focusDrug && (
              <div className="text-center py-16 text-slate-400">
                <Calculator className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">Search and select a drug to calculate dose</p>
              </div>
            )}
          </TabsContent>

          {/* ── INTERACTIONS TAB ─────────────────────────────── */}
          <TabsContent value="interactions" className="space-y-4">
            <Card className="bg-white shadow-md border border-slate-200">
              <CardHeader className="bg-slate-50 border-b py-3 px-5">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-600" /> Drug Interaction Checker
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
                  Add drugs to your prescription (via Drug Search) to check for interactions. Currently checking: <strong>{rxDrugs.length} drug(s)</strong>
                </div>

                {/* Current Rx drugs */}
                {rxDrugs.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {rxDrugs.map(d => (
                      <div key={d.id} className="flex items-center gap-1.5 bg-purple-100 text-purple-800 rounded-full px-3 py-1 text-xs font-medium">
                        {d.generic_name}
                        <button onClick={() => removeFromRx(d.id)} className="hover:text-red-600 ml-1"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                )}

                {rxDrugs.length >= 2 && (
                  <>
                    {interactions.length === 0 ? (
                      <Alert className="bg-green-50 border-green-200">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <AlertDescription className="text-green-800">No interactions found in our database for this drug combination.</AlertDescription>
                      </Alert>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-slate-600">{interactions.length} interaction(s) detected:</p>
                        {interactions.map((ix, i) => (
                          <div key={i} className={`rounded-lg border-2 p-3 text-xs ${CAT_COLORS[ix.severity]}`}>
                            <p className="font-bold mb-1">{SEV_ICON[ix.severity]} [{ix.severity.toUpperCase()}] {ix.a} + {ix.b}</p>
                            <p>{ix.msg}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {rxDrugs.length < 2 && (
                  <p className="text-center text-slate-400 text-sm py-8">Add at least 2 drugs to the prescription to check for interactions.</p>
                )}
              </CardContent>
            </Card>

            {/* High-risk drug reference */}
            <Card className="bg-white shadow-md border border-slate-200">
              <CardHeader className="bg-slate-50 border-b py-3 px-5">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" /> High-Risk Drugs in Renal Disease
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                {[
                  { drug: "NSAIDs (Ibuprofen, Diclofenac, Naproxen)", flag: "Avoid in ALL renal disease — reduce GFR, worsen AKI, increase oedema, antagonise antihypertensives", sev: "critical" },
                  { drug: "Tacrolimus / Cyclosporine", flag: "Nephrotoxic at supratherapeutic levels — mandatory TDM; check creatinine with each level", sev: "high" },
                  { drug: "Aminoglycosides (Gentamicin, Amikacin)", flag: "Dose-extend by eGFR; trough <1 mcg/mL (Gent); monitor creatinine daily in AKI", sev: "high" },
                  { drug: "ACE inhibitors + K+ sparing / ARB", flag: "Dual RAS blockade → hyperkalemia + AKI. Avoid combination. Monitor K+ weekly.", sev: "high" },
                  { drug: "Iodinated contrast media", flag: "Contrast nephropathy — pre-hydrate, avoid if eGFR <30, hold metformin 48h", sev: "high" },
                  { drug: "Cyclophosphamide IV", flag: "Haemorrhagic cystitis — ensure 2-3 L/m² hydration; MESNA if dose >500 mg/m²; CBC weekly", sev: "high" },
                  { drug: "Rituximab", flag: "PCP prophylaxis with cotrimoxazole; no live vaccines 6 months before/after; check Ig levels", sev: "high" },
                  { drug: "Methotrexate", flag: "Dose-reduce for eGFR <50 — renally cleared; folinic acid; CBC + LFT monthly", sev: "moderate" },
                ].map(({ drug, flag, sev }) => (
                  <div key={drug} className={`rounded-lg border p-3 text-xs ${CAT_COLORS[sev]}`}>
                    <span className="font-bold">{SEV_ICON[sev]} {drug}:</span> {flag}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── PRESCRIPTION TAB ─────────────────────────────── */}
          <TabsContent value="prescription" className="space-y-4">
            {/* Quick Drug Search inside Rx tab */}
            <Card className="bg-indigo-50 border border-indigo-200">
              <CardContent className="p-3">
                <p className="text-xs font-semibold text-indigo-800 mb-2">⚡ Quick Add Drug to Prescription</p>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    value={query}
                    onChange={e => { setQuery(e.target.value); setFocusDrug(null); }}
                    placeholder="Type drug name to search & add..."
                    className="pl-9 text-sm bg-white"
                  />
                </div>
                {query.length >= 2 && !focusDrug && (
                  <div className="border rounded-lg mt-1.5 divide-y max-h-52 overflow-y-auto shadow-sm bg-white">
                    {filtered.slice(0, 10).map(d => {
                      const isInRx = rxDrugs.find(rx => rx.id === d.id);
                      const dose = calcDose(d, parseFloat(weight), bsa, effectiveEgfr);
                      return (
                        <div key={d.id} className="px-3 py-2 hover:bg-indigo-50 flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900">{d.generic_name}</p>
                            <p className="text-xs text-slate-500 truncate">
                              {d.therapeutic_class}
                              {dose && dose.type !== "TDM" && dose.type !== "unknown" && weight
                                ? ` · ${dose.perDose} ${dose.freq} ${d.route || "PO"}`
                                : dose?.type === "TDM" ? " · TDM-guided" : ""}
                            </p>
                          </div>
                          <Button size="sm"
                            onClick={() => { addToRx(d); setQuery(""); }}
                            disabled={!!isInRx}
                            className={`text-xs h-7 flex-shrink-0 ${isInRx ? "bg-green-100 text-green-700" : "bg-indigo-600 hover:bg-indigo-700 text-white"}`}>
                            {isInRx ? <CheckCircle className="w-3 h-3" /> : <><Plus className="w-3 h-3 mr-0.5" />Add</>}
                          </Button>
                        </div>
                      );
                    })}
                    {filtered.length === 0 && <p className="px-3 py-3 text-xs text-slate-400 text-center">No matches found</p>}
                  </div>
                )}
              </CardContent>
            </Card>

            {rxDrugs.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <Pill className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">Search above to add drugs to your prescription.</p>
              </div>
            ) : (
              <>
                {/* Drug list with doses */}
                <div className="space-y-3">
                  {rxDrugs.map((drug, idx) => {
                    const wt = parseFloat(weight);
                    const dose = calcDose(drug, wt, bsa, effectiveEgfr);
                    const renalFlag = getRenalFlag(drug, effectiveEgfr);
                    return (
                      <Card key={drug.id} className={`bg-white border-2 ${renalFlag?.level === "critical" ? "border-red-300" : "border-slate-200"}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-slate-400 bg-slate-100 rounded-full w-5 h-5 flex items-center justify-center">{idx + 1}</span>
                                <h3 className="font-bold text-slate-900 text-sm">{drug.generic_name}</h3>
                              </div>
                              {dose && dose.type !== "TDM" && (
                                <div className="flex gap-3 flex-wrap text-sm mt-2">
                                  <span><strong>Dose:</strong> {dose.perDose}</span>
                                  <span><strong>Frequency:</strong> {dose.freq}</span>
                                  <span><strong>Route:</strong> {drug.route || "PO"}</span>
                                </div>
                              )}
                              {dose?.type === "TDM" && <p className="text-sm text-blue-700 mt-1">TDM-guided — {dose.note}</p>}
                              {drug.monitoring && <p className="text-xs text-slate-500 mt-1">Monitor: {drug.monitoring}</p>}
                              {renalFlag && (
                                <p className={`text-xs mt-1 font-medium ${renalFlag.level === "critical" ? "text-red-700" : "text-amber-700"}`}>
                                  ⚠️ {renalFlag.msg}
                                </p>
                              )}
                              {drug.brands_indian && <p className="text-xs text-slate-400 mt-1">Brands: {drug.brands_indian}</p>}
                            </div>
                            <Button size="icon" variant="ghost" onClick={() => removeFromRx(drug.id)}
                              className="text-red-400 hover:bg-red-50 h-8 w-8 flex-shrink-0">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Interaction summary */}
                {interactions.length > 0 && (
                  <Alert className="bg-orange-50 border-orange-300">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    <AlertDescription className="text-orange-800 text-xs">
                      <strong>Interactions:</strong> {interactions.map(ix => `${ix.a} + ${ix.b} (${ix.severity})`).join(" | ")}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Action buttons */}
                <div className="flex gap-3">
                  <Button onClick={printRx} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Printer className="w-4 h-4 mr-2" /> Print Prescription
                  </Button>
                  <Button onClick={shareWA} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                    <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp Share
                  </Button>
                  <Button onClick={() => { navigator.clipboard.writeText(buildRx()); toast.success("Copied!"); }}
                    variant="outline" className="flex-1">
                    Copy Text
                  </Button>
                </div>

                {/* Preview */}
                <Card className="bg-slate-900">
                  <CardHeader className="py-2 px-4 border-b border-slate-700">
                    <CardTitle className="text-xs text-slate-400">Prescription Preview</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap leading-relaxed">{buildRx()}</pre>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
          {/* ── STEROID TAB ───────────────────────────────── */}
          <TabsContent value="steroids">
            <SteroidEquivalenceEngine />
          </TabsContent>

          {/* ── ECULIZUMAB TAB ────────────────────────────── */}
          <TabsContent value="eculizumab">
            <EculizumabGuidance />
          </TabsContent>

          {/* ── PLASMAPHERESIS TAB ────────────────────────── */}
          <TabsContent value="plasmapheresis">
            <PlasmapheresisModule />
          </TabsContent>

          {/* ── CKD DOSING TAB ────────────────────────────── */}
          <TabsContent value="ckd-dosing" className="space-y-4">
            <Card className="bg-gradient-to-r from-indigo-600 to-blue-700 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Shield className="w-8 h-8" />
                  <div>
                    <h2 className="font-bold text-lg">CKD & Dialysis Dosing Reference</h2>
                    <p className="text-indigo-100 text-sm">Dose adjustments by eGFR · HD · PD · CRRT notes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-slate-200">
              <CardHeader className="bg-slate-50 border-b py-3 px-5">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-600" /> CKD Stage Dosing Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="text-left px-3 py-2 font-semibold">Drug</th>
                        <th className="text-center px-2 py-2 font-semibold">eGFR 30–60</th>
                        <th className="text-center px-2 py-2 font-semibold">eGFR 15–30</th>
                        <th className="text-center px-2 py-2 font-semibold">eGFR &lt;15 / ESRD</th>
                        <th className="text-center px-2 py-2 font-semibold">HD</th>
                        <th className="text-center px-2 py-2 font-semibold">PD</th>
                        <th className="text-center px-2 py-2 font-semibold">CRRT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { drug: "Enalapril/Ramipril", g30_60: "50–75% dose, monitor K+", g15_30: "50% dose, monitor weekly K+", esrd: "25–50%, HD supplemental", hd: "Supplement post-HD", pd: "No extra", crrt: "Normal dose" },
                        { drug: "Furosemide", g30_60: "Higher doses needed (40–80 mg)", g15_30: "80–160 mg, may be ineffective", esrd: "Usually ineffective", hd: "Not removed by HD", pd: "Residual renal support", crrt: "Adjunct" },
                        { drug: "Amlodipine", g30_60: "No adjustment", g15_30: "No adjustment", esrd: "No adjustment", hd: "Not dialysed", pd: "No adjustment", crrt: "No adjustment" },
                        { drug: "Metoprolol", g30_60: "No adjustment", g15_30: "No adjustment", esrd: "No adjustment", hd: "Not significantly removed", pd: "No adjustment", crrt: "No adjustment" },
                        { drug: "Tacrolimus", g30_60: "TDM-guided", g15_30: "TDM-guided", esrd: "TDM-guided", hd: "Not dialysed — TDM", pd: "Not removed", crrt: "Not removed" },
                        { drug: "Mycophenolate", g30_60: "No adjustment", g15_30: "No adjustment (MPAG accumulates — monitor)", esrd: "Monitor toxicity", hd: "Partial MPAG removal", pd: "No adjustment", crrt: "Standard dose" },
                        { drug: "Prednisolone", g30_60: "No adjustment", g15_30: "No adjustment", esrd: "No adjustment", hd: "Not dialysed", pd: "Not removed", crrt: "Standard dose" },
                        { drug: "Cotrimoxazole", g30_60: "75% dose", g15_30: "50% dose", esrd: "Avoid if possible", hd: "Supplement post-HD", pd: "Reduce 50%", crrt: "50–75% dose" },
                        { drug: "Acyclovir", g30_60: "Reduce dose 50%", g15_30: "Reduce 75%", esrd: "5 mg/kg per 24h", hd: "Supplement post-HD", pd: "Reduce 50%", crrt: "Monitor" },
                        { drug: "Vancomycin", g30_60: "Extend interval, TDM", g15_30: "TDM-guided", esrd: "Single dose, TDM", hd: "Supplement post-HD (TDM)", pd: "IP or systemic — TDM", crrt: "Continuous infusion, TDM" },
                        { drug: "Gentamicin", g30_60: "Extended interval (q48h)", g15_30: "q72h, TDM", esrd: "Single dose, TDM only", hd: "Supplement post-HD", pd: "Avoid or TDM", crrt: "Continuous, TDM" },
                        { drug: "Metformin", g30_60: "Halve dose, review", g15_30: "STOP", esrd: "CONTRAINDICATED", hd: "Contraindicated", pd: "Contraindicated", crrt: "Contraindicated" },
                        { drug: "Cyclophosphamide IV", g30_60: "Full dose, monitor", g15_30: "Reduce 25%", esrd: "Reduce 50%", hd: "Supplement post-HD", pd: "Reduce 25%", crrt: "Reduce 25%" },
                        { drug: "Rituximab", g30_60: "Standard dose", g15_30: "Standard dose", esrd: "Standard dose (HD risk — infection)", hd: "Not dialysed", pd: "Not removed", crrt: "Standard" },
                        { drug: "Heparin (CRRT)", g30_60: "Standard", g15_30: "Standard", esrd: "Standard", hd: "Standard", pd: "N/A", crrt: "UFH 5–20 U/kg/hr or regional citrate" },
                      ].map((row, i) => (
                        <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                          <td className="px-3 py-2 font-semibold text-slate-900">{row.drug}</td>
                          <td className="px-2 py-2 text-center text-slate-700">{row.g30_60}</td>
                          <td className="px-2 py-2 text-center text-amber-700">{row.g15_30}</td>
                          <td className="px-2 py-2 text-center text-red-700">{row.esrd}</td>
                          <td className="px-2 py-2 text-center text-indigo-700">{row.hd}</td>
                          <td className="px-2 py-2 text-center text-purple-700">{row.pd}</td>
                          <td className="px-2 py-2 text-center text-blue-700">{row.crrt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Alert className="bg-amber-50 border-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <AlertDescription className="text-xs text-amber-800">
                <strong>CKD Dosing Principles:</strong> All doses should be verified with current renal dosing references (Renal Drug Database, KDIGO, BNFc).
                Specific patient factors (residual renal function, dialysis efficiency, protein binding) must be considered.
                TDM = Therapeutic Drug Monitoring. Consult clinical pharmacist for complex cases.
              </AlertDescription>
            </Alert>
          </TabsContent>
          {/* ── BULK IMPORT TAB ───────────────────────────── */}
          <TabsContent value="bulk-import" className="space-y-4">
            <Card className="bg-gradient-to-r from-teal-600 to-emerald-700 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Upload className="w-8 h-8" />
                  <div>
                    <h2 className="font-bold text-lg">Bulk Drug Import</h2>
                    <p className="text-teal-100 text-sm">Upload JSON or CSV files to populate the formulary rapidly</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Template download */}
            <Card className="bg-white border border-slate-200">
              <CardHeader className="bg-slate-50 border-b py-3 px-5">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-600" /> File Format & Template
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <p className="text-xs text-slate-600">Upload a <strong>JSON array</strong> or <strong>CSV</strong> file. Required fields: <code className="bg-slate-100 px-1 rounded">generic_name</code>, <code className="bg-slate-100 px-1 rounded">category</code>, <code className="bg-slate-100 px-1 rounded">route</code>.</p>
                <p className="text-xs text-slate-500">Optional fields: <code className="bg-slate-100 px-1 rounded">dose_weight_based</code>, <code className="bg-slate-100 px-1 rounded">frequency</code>, <code className="bg-slate-100 px-1 rounded">max_dose_per_day</code>, <code className="bg-slate-100 px-1 rounded">brands_indian</code>, <code className="bg-slate-100 px-1 rounded">therapeutic_class</code>, <code className="bg-slate-100 px-1 rounded">renal_adjust</code>, <code className="bg-slate-100 px-1 rounded">indications</code>, <code className="bg-slate-100 px-1 rounded">monitoring</code>, <code className="bg-slate-100 px-1 rounded">adverse_effects</code>, <code className="bg-slate-100 px-1 rounded">contraindications</code>, <code className="bg-slate-100 px-1 rounded">dose_calculation_type</code> (per_day / per_dose / TDM / fixed), <code className="bg-slate-100 px-1 rounded">hd_adjust</code>, <code className="bg-slate-100 px-1 rounded">pd_adjust</code>.</p>
                <button
                  onClick={() => {
                    const template = JSON.stringify([{
                      generic_name: "Example Drug",
                      category: "Corticosteroid",
                      therapeutic_class: "Glucocorticoid",
                      route: "PO",
                      dose_weight_based: "1-2 mg/kg/day",
                      frequency: "OD",
                      max_dose_per_day: "60",
                      dose_calculation_type: "per_day",
                      brands_indian: "Example Brand",
                      indications: "NS relapse",
                      renal_adjust: "No adjustment",
                      monitoring: "BP, weight, blood glucose",
                      adverse_effects: "Weight gain, hypertension",
                      hd_adjust: "No extra dose",
                      pd_adjust: "No adjustment"
                    }], null, 2);
                    const blob = new Blob([template], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a"); a.href = url; a.download = "drug_import_template.json"; a.click();
                  }}
                  className="flex items-center gap-2 text-xs px-3 py-2 bg-teal-50 hover:bg-teal-100 border border-teal-300 text-teal-800 rounded-lg transition-colors font-medium"
                >
                  <Download className="w-3.5 h-3.5" /> Download JSON Template
                </button>
              </CardContent>
            </Card>

            {/* Upload area */}
            <Card className="bg-white border-2 border-dashed border-teal-300">
              <CardContent className="p-6 text-center space-y-3">
                <Upload className="w-10 h-10 text-teal-400 mx-auto" />
                <p className="text-sm font-medium text-slate-700">Drop your file here or click to browse</p>
                <p className="text-xs text-slate-400">Accepts .json or .csv files</p>
                <label className="cursor-pointer">
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg transition-colors">
                    <Upload className="w-4 h-4" /> Choose File
                  </span>
                  <input type="file" accept=".json,.csv" className="hidden" onChange={handleImportFile} />
                </label>
                {importFile?.file && (
                  <p className="text-xs text-teal-700 font-medium">✓ {importFile.file.name} — {importFile.rows?.length} records detected</p>
                )}
              </CardContent>
            </Card>

            {/* Preview */}
            {importPreview.length > 0 && (
              <Card className="bg-white border border-slate-200">
                <CardHeader className="bg-slate-50 border-b py-3 px-5">
                  <CardTitle className="text-sm">Preview (first 5 records)</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100">
                          {Object.keys(importPreview[0]).slice(0, 6).map(k => (
                            <th key={k} className="text-left px-2 py-1.5 font-semibold text-slate-700">{k}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {importPreview.map((row, i) => (
                          <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                            {Object.values(row).slice(0, 6).map((v, j) => (
                              <td key={j} className="px-2 py-1.5 text-slate-700 max-w-[120px] truncate">{String(v)}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Import button */}
            {importFile?.rows?.length > 0 && !importResult && (
              <Button onClick={runImport} disabled={importLoading}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white h-11">
                {importLoading
                  ? <><Beaker className="w-4 h-4 mr-2 animate-spin" />Importing {importFile.rows.length} drugs...</>
                  : <><Upload className="w-4 h-4 mr-2" />Import {importFile.rows.length} Drugs to Formulary</>}
              </Button>
            )}

            {/* Result */}
            {importResult && (
              <Alert className="bg-green-50 border-green-300">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <AlertDescription className="text-green-800 text-sm">
                  <strong>Import complete!</strong> {importResult.success} drugs added successfully.
                  {importResult.fail > 0 && ` ${importResult.fail} failed (missing required fields: generic_name, category, route).`}
                </AlertDescription>
              </Alert>
            )}

            <Alert className="bg-amber-50 border-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <AlertDescription className="text-xs text-amber-800">
                <strong>Note:</strong> Imported drugs are added to the live formulary. Verify dosing data carefully before importing. Duplicate entries are not auto-detected — check the formulary after import.
              </AlertDescription>
            </Alert>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}