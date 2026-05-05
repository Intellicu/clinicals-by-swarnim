import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  ArrowLeft, Pill, Plus, Trash2, Printer, MessageCircle, CheckCircle,
  AlertTriangle, FileText, User, Calendar, Shield
} from "lucide-react";
import { toast } from "sonner";
import { usePatient } from "../components/PatientContext";

// Interaction DB (shared logic)
const DRUG_INTERACTIONS = [
  { drug1: "tacrolimus", drug2: "fluconazole", severity: "critical", effect: "Fluconazole significantly increases Tacrolimus levels — risk of nephrotoxicity" },
  { drug1: "tacrolimus", drug2: "clarithromycin", severity: "critical", effect: "Clarithromycin markedly raises Tacrolimus levels" },
  { drug1: "enalapril", drug2: "losartan", severity: "high", effect: "Dual RAS blockade — hyperkalemia + AKI risk. Avoid." },
  { drug1: "furosemide", drug2: "gentamicin", severity: "high", effect: "Additive ototoxicity and nephrotoxicity" },
  { drug1: "prednisolone", drug2: "ibuprofen", severity: "moderate", effect: "Increased GI ulceration risk" },
  { drug1: "mycophenolate", drug2: "antacids", severity: "moderate", effect: "Antacids reduce MMF absorption" },
  { drug1: "rituximab", drug2: "live vaccines", severity: "critical", effect: "Live vaccines CONTRAINDICATED within 6 months of Rituximab" },
  { drug1: "cyclophosphamide", drug2: "allopurinol", severity: "high", effect: "Increased cyclophosphamide toxicity" },
  { drug1: "cotrimoxazole", drug2: "methotrexate", severity: "high", effect: "Additive antifolate — severe myelosuppression risk" },
];

const SEV_COLORS = {
  critical: "bg-red-100 border-red-400 text-red-900",
  high: "bg-orange-100 border-orange-400 text-orange-900",
  moderate: "bg-amber-100 border-amber-300 text-amber-900",
};
const SEV_ICONS = { critical: "🔴", high: "🟠", moderate: "🟡" };

function checkInteractions(drugs) {
  const lower = drugs.map(d => d.name?.toLowerCase() || "");
  const found = [];
  DRUG_INTERACTIONS.forEach(({ drug1, drug2, severity, effect }) => {
    if (lower.some(d => d.includes(drug1)) && lower.some(d => d.includes(drug2))) {
      found.push({ drug1, drug2, severity, effect });
    }
  });
  return found;
}

function getFrequencyFactor(freq = "") {
  if (freq.includes('OD') || freq.includes('once')) return 1;
  if (freq.includes('BID') || freq.includes('twice') || freq.includes('BD')) return 2;
  if (freq.includes('TID') || freq.includes('three') || freq.includes('TDS')) return 3;
  if (freq.includes('QID') || freq.includes('four') || freq.includes('QDS')) return 4;
  if (freq.includes('Q6H')) return 4;
  if (freq.includes('Q8H')) return 3;
  if (freq.includes('Q12H')) return 2;
  return 1;
}

export default function PrescriptionWorkflow() {
  const { patientData } = usePatient();
  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState(patientData.age ? String(patientData.age) : "");
  const [weight, setWeight] = useState(patientData.weight ? String(patientData.weight) : "");
  const [egfr, setEgfr] = useState("");
  const [diagnosisNote, setDiagnosisNote] = useState("");
  const [prescriber, setPrescriber] = useState("");

  const [prescriptionDrugs, setPrescriptionDrugs] = useState([]);
  const [drugSearch, setDrugSearch] = useState("");
  const [selectedDbDrug, setSelectedDbDrug] = useState(null);

  const { data: dbDrugs = [] } = useQuery({
    queryKey: ['drugs'],
    queryFn: () => base44.entities.Drug.list('generic_name'),
  });

  const filteredDrugs = drugSearch.length >= 2
    ? dbDrugs.filter(d =>
        d.generic_name?.toLowerCase().includes(drugSearch.toLowerCase()) ||
        d.brands_indian?.toLowerCase().includes(drugSearch.toLowerCase())
      ).slice(0, 6)
    : [];

  const addDrugFromDb = (drug) => {
    const wt = parseFloat(weight) || 1;
    // Auto-calculate dose
    let dose = "";
    const m = drug.dose_weight_based?.match(/([\d.]+)(?:-)?([\d.]+)?\s*(\w+)\/kg/);
    if (m) {
      const min = parseFloat(m[1]) * wt;
      const max = m[2] ? parseFloat(m[2]) * wt : min;
      const unit = m[3];
      dose = m[2] ? `${min.toFixed(1)}-${max.toFixed(1)} ${unit}` : `${min.toFixed(1)} ${unit}`;
    } else {
      dose = drug.dose_weight_based || "";
    }

    // Renal safety check
    const gfr = parseFloat(egfr);
    let renalFlag = null;
    if (gfr && drug.renal_adjust) {
      if (drug.renal_adjust.toLowerCase().includes('avoid') && gfr < 30) {
        renalFlag = { level: "critical", msg: `AVOID in eGFR ${gfr} — ${drug.renal_adjust}` };
      } else if (drug.renal_adjust.toLowerCase().includes('reduce') && gfr < 60) {
        renalFlag = { level: "warning", msg: `Dose reduction needed — ${drug.renal_adjust}` };
      }
    }

    const newDrug = {
      id: Date.now(),
      name: drug.generic_name,
      brands: drug.brands_indian || "",
      dose,
      frequency: drug.frequency || "OD",
      route: drug.route || "PO",
      duration: "",
      monitoring: drug.monitoring || "",
      renalFlag,
      tdm: drug.dose_calculation_type === "TDM",
    };
    setPrescriptionDrugs(prev => [...prev, newDrug]);
    setDrugSearch("");
    setSelectedDbDrug(null);
    toast.success(`${drug.generic_name} added`);
  };

  const addManualDrug = () => {
    setPrescriptionDrugs(prev => [...prev, {
      id: Date.now(), name: "", brands: "", dose: "", frequency: "OD", route: "PO", duration: "", monitoring: "", renalFlag: null, tdm: false
    }]);
  };

  const updateDrug = (id, field, value) => {
    setPrescriptionDrugs(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const removeDrug = (id) => {
    setPrescriptionDrugs(prev => prev.filter(d => d.id !== id));
  };

  const interactions = checkInteractions(prescriptionDrugs);
  const criticalFlags = prescriptionDrugs.filter(d => d.renalFlag?.level === "critical");
  const warningFlags = prescriptionDrugs.filter(d => d.renalFlag?.level === "warning");
  const tdmDrugs = prescriptionDrugs.filter(d => d.tdm);

  const buildPrescriptionText = () => {
    const date = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    return `PRESCRIPTION
════════════════════════════════════════

Patient: ${patientName || "____________________"}
Age: ${patientAge || "—"} years    |    Weight: ${weight || "—"} kg
${egfr ? `eGFR: ${egfr} mL/min/1.73m²    |    ` : ""}Date: ${date}
Diagnosis: ${diagnosisNote || "____________________"}

────────────────────────────────────────
Rx
────────────────────────────────────────
${prescriptionDrugs.map((d, i) => `${i + 1}. ${d.name || "____"}
   Dose: ${d.dose || "____"}
   Frequency: ${d.frequency || "____"}  |  Route: ${d.route || "PO"}
   Duration: ${d.duration || "____"}
   ${d.monitoring ? `Monitoring: ${d.monitoring}` : ""}
   ${d.brands ? `Brand options: ${d.brands}` : ""}`).join("\n\n")}

────────────────────────────────────────
${tdmDrugs.length ? `⚠️ TDM Required: ${tdmDrugs.map(d => d.name).join(", ")}` : ""}
${interactions.length ? `⚠️ Drug Interactions: See safety check` : ""}

Prescriber: ${prescriber || "Dr. ____________________"}
Signature: _________________    Date: ${date}

─────────────────────────────────────────
Generated by CliniCals by Swarnim
Verify all calculations independently.
─────────────────────────────────────────`;
  };

  const printPrescription = () => {
    const win = window.open("", "_blank");
    win.document.write(`<html><head><title>Prescription</title>
    <style>body{font-family:'Courier New',monospace;padding:24px;max-width:700px;margin:auto;font-size:12px}
    h1{font-size:16px;font-weight:bold}pre{white-space:pre-wrap;font-family:'Courier New',monospace;font-size:11px}
    .warn{color:#b45309;font-weight:bold}</style></head>
    <body><pre>${buildPrescriptionText()}</pre></body></html>`);
    win.print();
  };

  const whatsappShare = () => {
    const text = encodeURIComponent(buildPrescriptionText().slice(0, 2000));
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <Link to={createPageUrl("AIClinicalPathway")}>
          <Button variant="outline" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to AI Pathway
          </Button>
        </Link>

        <div className="mb-5 flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Prescription Workflow</h1>
            <p className="text-xs text-slate-500">Drug selection → Dose calculation → Safety checks → Print/Share</p>
          </div>
        </div>

        {/* Patient header */}
        <Card className="bg-white shadow-md mb-4 border border-purple-200">
          <CardContent className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <Label className="text-xs font-semibold">Patient Name</Label>
              <Input value={patientName} onChange={e => setPatientName(e.target.value)} placeholder="Name" className="mt-1 text-sm" />
            </div>
            <div>
              <Label className="text-xs font-semibold">Age (years)</Label>
              <Input value={patientAge} onChange={e => setPatientAge(e.target.value)} placeholder="8" className="mt-1 text-sm" />
            </div>
            <div>
              <Label className="text-xs font-semibold">Weight (kg)</Label>
              <Input value={weight} onChange={e => setWeight(e.target.value)} placeholder="25" className="mt-1 text-sm" />
            </div>
            <div>
              <Label className="text-xs font-semibold">eGFR</Label>
              <Input value={egfr} onChange={e => setEgfr(e.target.value)} placeholder="90" className="mt-1 text-sm" />
            </div>
            <div className="col-span-2">
              <Label className="text-xs font-semibold">Diagnosis</Label>
              <Input value={diagnosisNote} onChange={e => setDiagnosisNote(e.target.value)} placeholder="NS first episode / CKD stage 3..." className="mt-1 text-sm" />
            </div>
            <div className="col-span-2">
              <Label className="text-xs font-semibold">Prescriber Name</Label>
              <Input value={prescriber} onChange={e => setPrescriber(e.target.value)} placeholder="Dr. Name" className="mt-1 text-sm" />
            </div>
          </CardContent>
        </Card>

        {/* Drug search */}
        <Card className="bg-white shadow-md mb-4 border border-purple-200">
          <CardHeader className="bg-purple-50 border-b py-3 px-5">
            <CardTitle className="text-sm flex items-center gap-2">
              <Pill className="w-4 h-4 text-purple-600" /> Add Medications
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="relative">
              <Input value={drugSearch} onChange={e => setDrugSearch(e.target.value)}
                placeholder="Search drug database (e.g. Prednisolone, Tacrolimus)..." className="text-sm pr-24" />
              <Button size="sm" onClick={addManualDrug}
                className="absolute right-1 top-1 bg-slate-600 hover:bg-slate-700 text-white text-xs h-7">
                + Manual
              </Button>
            </div>
            {filteredDrugs.length > 0 && (
              <div className="border border-slate-200 rounded-lg divide-y overflow-hidden shadow-sm">
                {filteredDrugs.map(drug => (
                  <button key={drug.id} onClick={() => addDrugFromDb(drug)}
                    className="w-full text-left px-4 py-2.5 hover:bg-purple-50 transition-colors flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-sm text-slate-900">{drug.generic_name}</span>
                      <span className="text-xs text-slate-500 ml-2">{drug.therapeutic_class}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">{drug.brands_indian?.split(',')[0]}</span>
                      {drug.renal_adjust?.toLowerCase().includes('avoid') && (
                        <Badge className="bg-red-100 text-red-700 text-xs">⚠️ Renal</Badge>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Drug list */}
        {prescriptionDrugs.length > 0 && (
          <div className="space-y-3 mb-4">
            {prescriptionDrugs.map((drug, idx) => (
              <Card key={drug.id} className={`bg-white shadow-sm border ${drug.renalFlag?.level === 'critical' ? 'border-red-400' : 'border-slate-200'}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 rounded-full w-6 h-6 flex items-center justify-center">{idx + 1}</span>
                    <Input value={drug.name} onChange={e => updateDrug(drug.id, 'name', e.target.value)}
                      placeholder="Drug name" className="font-semibold text-sm flex-1" />
                    <Button size="icon" variant="ghost" onClick={() => removeDrug(drug.id)} className="text-red-500 hover:bg-red-50 h-8 w-8">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div>
                      <Label className="text-xs text-slate-500">Dose</Label>
                      <Input value={drug.dose} onChange={e => updateDrug(drug.id, 'dose', e.target.value)}
                        placeholder="e.g. 25 mg" className="mt-0.5 text-xs h-8" />
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500">Frequency</Label>
                      <Select value={drug.frequency} onValueChange={v => updateDrug(drug.id, 'frequency', v)}>
                        <SelectTrigger className="mt-0.5 text-xs h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["OD","BID","TID","QID","BD (alternate days)","Q8H","Q12H","Weekly","Monthly"].map(f => (
                            <SelectItem key={f} value={f}>{f}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500">Route</Label>
                      <Select value={drug.route} onValueChange={v => updateDrug(drug.id, 'route', v)}>
                        <SelectTrigger className="mt-0.5 text-xs h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["PO","IV","SC","IM","Topical","Intranasal"].map(r => (
                            <SelectItem key={r} value={r}>{r}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500">Duration</Label>
                      <Input value={drug.duration} onChange={e => updateDrug(drug.id, 'duration', e.target.value)}
                        placeholder="e.g. 4 weeks" className="mt-0.5 text-xs h-8" />
                    </div>
                  </div>
                  {drug.monitoring && (
                    <p className="text-xs text-slate-500 mt-2 bg-slate-50 rounded p-1.5">📊 {drug.monitoring}</p>
                  )}
                  {drug.renalFlag && (
                    <div className={`text-xs mt-2 p-2 rounded border ${drug.renalFlag.level === 'critical' ? 'bg-red-50 border-red-300 text-red-800' : 'bg-amber-50 border-amber-300 text-amber-800'}`}>
                      ⚠️ {drug.renalFlag.msg}
                    </div>
                  )}
                  {drug.tdm && (
                    <Badge className="mt-2 bg-blue-100 text-blue-800 text-xs">TDM Required — monitor drug levels</Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Safety summary */}
        {prescriptionDrugs.length > 1 && (
          <Card className="bg-white shadow-md mb-4 border border-slate-200">
            <CardHeader className="bg-slate-50 border-b py-3 px-5">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-600" /> Safety Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              {criticalFlags.length > 0 && criticalFlags.map(d => (
                <Alert key={d.id} className="bg-red-50 border-red-300 py-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <AlertDescription className="text-red-800 text-xs font-semibold">{d.name}: {d.renalFlag.msg}</AlertDescription>
                </Alert>
              ))}
              {warningFlags.length > 0 && warningFlags.map(d => (
                <Alert key={d.id} className="bg-amber-50 border-amber-300 py-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <AlertDescription className="text-amber-800 text-xs">{d.name}: {d.renalFlag.msg}</AlertDescription>
                </Alert>
              ))}
              {interactions.length > 0 && interactions.map((ix, i) => (
                <div key={i} className={`rounded border p-2 text-xs ${SEV_COLORS[ix.severity]}`}>
                  {SEV_ICONS[ix.severity]} <strong>{ix.drug1} + {ix.drug2}:</strong> {ix.effect}
                </div>
              ))}
              {tdmDrugs.length > 0 && (
                <Alert className="bg-blue-50 border-blue-200 py-2">
                  <AlertDescription className="text-blue-800 text-xs">TDM drugs: {tdmDrugs.map(d => d.name).join(", ")} — ensure drug level monitoring before next dose</AlertDescription>
                </Alert>
              )}
              {criticalFlags.length === 0 && interactions.length === 0 && tdmDrugs.length === 0 && (
                <Alert className="bg-green-50 border-green-200 py-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <AlertDescription className="text-green-800 text-xs">No critical interactions or renal safety issues detected.</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        {prescriptionDrugs.length > 0 && (
          <div className="flex gap-3 flex-wrap mb-4">
            <Button onClick={printPrescription} className="bg-indigo-600 hover:bg-indigo-700 text-white flex-1">
              <Printer className="w-4 h-4 mr-2" /> Print Prescription
            </Button>
            <Button onClick={whatsappShare} className="bg-green-600 hover:bg-green-700 text-white flex-1">
              <MessageCircle className="w-4 h-4 mr-2" /> Share via WhatsApp
            </Button>
            <Button onClick={() => { navigator.clipboard.writeText(buildPrescriptionText()); toast.success("Copied!"); }}
              variant="outline" className="flex-1">
              <FileText className="w-4 h-4 mr-2" /> Copy Text
            </Button>
          </div>
        )}

        {/* Preview */}
        {prescriptionDrugs.length > 0 && (
          <Card className="bg-slate-900 shadow-lg border-0">
            <CardHeader className="py-3 px-5 border-b border-slate-700">
              <CardTitle className="text-sm text-slate-300">Prescription Preview</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap leading-relaxed">
                {buildPrescriptionText()}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}