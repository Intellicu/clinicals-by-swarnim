import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  ArrowLeft, Save, Printer, Mic, MicOff, Stethoscope, Activity,
  Pill, FileText, Brain, Ruler, Calculator, Plus, Trash2,
  CheckCircle, Loader2, AlertTriangle, Settings, X, Sparkles,
  User, ClipboardList, BookOpen, FlaskConical, ChevronDown, ChevronUp
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import FormularyBrowser from "../drugs/FormularyBrowser";
import { FORMULARY, getFormularyDrug } from "@/lib/formulary/nephrology-drugs";

// ─── Letterhead Config ───────────────────────────────────────────────────────
const DEFAULT_LETTERHEAD = {
  clinicName: "Pediatric Nephrology Clinic",
  doctorName: "Dr. [Name]",
  qualifications: "MD, DM (Nephrology)",
  address: "Hospital Address, City",
  phone: "",
  regNo: "",
};

// ─── AI Scribe ───────────────────────────────────────────────────────────────
function AIScribe({ onTranscribed, context }) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [processing, setProcessing] = useState(false);
  const recognitionRef = useRef(null);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { toast.error("Speech recognition not supported in this browser"); return; }
    const r = new SpeechRecognition();
    r.continuous = true; r.interimResults = true; r.lang = "en-IN";
    r.onresult = (e) => {
      const t = Array.from(e.results).map(r => r[0].transcript).join(" ");
      setTranscript(t);
    };
    r.onerror = () => { setListening(false); toast.error("Microphone error"); };
    r.onend = () => setListening(false);
    recognitionRef.current = r;
    r.start();
    setListening(true);
  };

  const stopAndProcess = async () => {
    recognitionRef.current?.stop();
    setListening(false);
    if (!transcript.trim()) return;
    setProcessing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a clinical AI scribe for a pediatric nephrology clinic. The doctor dictated:

"${transcript}"

Context from current encounter:
${JSON.stringify(context, null, 2)}

Extract and return structured clinical notes in this JSON format:
{
  "history": "...",
  "examination": "...",
  "assessment": "...",
  "plan": "...",
  "vitals_mentioned": { "weight": "", "height": "", "bp": "", "hr": "", "temp": "" }
}
Only fill fields that are mentioned in the dictation. Be concise and clinical.`,
        response_json_schema: {
          type: "object",
          properties: {
            history: { type: "string" },
            examination: { type: "string" },
            assessment: { type: "string" },
            plan: { type: "string" },
            vitals_mentioned: { type: "object" }
          }
        }
      });
      onTranscribed(result);
      toast.success("AI Scribe: Notes structured");
    } catch {
      toast.error("AI processing failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-600" />
          <span className="font-bold text-sm text-violet-800">Ambient AI Scribe</span>
          <Badge className="bg-violet-100 text-violet-700 text-[10px]">Beta</Badge>
        </div>
        <div className="flex gap-2">
          {!listening ? (
            <Button size="sm" onClick={startListening} className="bg-violet-600 hover:bg-violet-700 h-8 gap-1.5">
              <Mic className="w-3.5 h-3.5" /> Start Dictation
            </Button>
          ) : (
            <Button size="sm" onClick={stopAndProcess} variant="destructive" className="h-8 gap-1.5 animate-pulse">
              <MicOff className="w-3.5 h-3.5" /> Stop & Process
            </Button>
          )}
        </div>
      </div>
      {listening && (
        <div className="bg-white border border-violet-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-semibold text-red-600">RECORDING</span>
          </div>
          <p className="text-xs text-slate-600 italic">{transcript || "Listening..."}</p>
        </div>
      )}
      {processing && (
        <div className="flex items-center gap-2 text-violet-700 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> Structuring clinical notes...
        </div>
      )}
      <p className="text-[11px] text-violet-500">Dictate history, vitals, examination findings, and plan. AI will auto-structure your notes.</p>
    </div>
  );
}

// ─── Growth & Anthropometry Calculator ───────────────────────────────────────
function AnthropometryPanel({ vitals, patientAge }) {
  const wt = parseFloat(vitals.weight);
  const ht = parseFloat(vitals.height);
  const bsa = wt && ht ? Math.sqrt((ht * wt) / 3600).toFixed(3) : null;
  const bmi = wt && ht ? (wt / ((ht / 100) ** 2)).toFixed(1) : null;
  const idealWeight = ht ? ((ht - 100) * 0.9).toFixed(1) : null;

  const metrics = [
    { label: "BSA", value: bsa ? `${bsa} m²` : "—", color: "indigo" },
    { label: "BMI", value: bmi ? `${bmi} kg/m²` : "—", color: "blue" },
    { label: "Ideal Wt", value: idealWeight ? `~${idealWeight} kg` : "—", color: "green" },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 mt-3">
      {metrics.map(m => (
        <div key={m.label} className={`bg-${m.color}-50 border border-${m.color}-200 rounded-lg p-2 text-center`}>
          <p className={`text-[10px] font-bold text-${m.color}-600 uppercase`}>{m.label}</p>
          <p className={`text-sm font-black text-${m.color}-800`}>{m.value}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Differential / Plan AI Search ───────────────────────────────────────────
function DifferentialSuggester({ encounterData, patient }) {
  const [loading, setLoading] = useState(false);
  const [differentials, setDifferentials] = useState(null);

  const suggest = async () => {
    setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Pediatric nephrology differential diagnosis and management plan.
Patient: ${patient?.age_years || "?"}y, ${patient?.gender || "?"}, ${patient?.diagnosis || ""}
Chief complaint: ${encounterData.chief_complaint || ""}
History: ${encounterData.history || ""}
Examination: ${encounterData.examination || ""}
Vitals: Wt ${encounterData.vitals.weight}kg, Ht ${encounterData.vitals.height}cm, BP ${encounterData.vitals.bp_systolic}/${encounterData.vitals.bp_diastolic} mmHg
Assessment: ${encounterData.assessment || ""}

Provide a clinically relevant differential diagnosis list and recommended management steps for a pediatric nephrology setting.`,
        response_json_schema: {
          type: "object",
          properties: {
            differentials: { type: "array", items: { type: "object", properties: { dx: { type: "string" }, likelihood: { type: "string" }, clues: { type: "string" } } } },
            suggested_investigations: { type: "array", items: { type: "string" } },
            management_pearls: { type: "array", items: { type: "string" } }
          }
        }
      });
      setDifferentials(result);
    } catch {
      toast.error("AI suggestion failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Button onClick={suggest} disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
        Generate AI Differentials & Plan
      </Button>
      {differentials && (
        <div className="space-y-3">
          {differentials.differentials?.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="font-bold text-blue-800 text-sm mb-2">Differentials</p>
              {differentials.differentials.map((d, i) => (
                <div key={i} className="flex items-start gap-2 py-1 border-b border-blue-100 last:border-0">
                  <Badge className="bg-blue-100 text-blue-800 text-[10px] mt-0.5 shrink-0">{d.likelihood}</Badge>
                  <div>
                    <p className="text-sm font-semibold text-blue-900">{d.dx}</p>
                    <p className="text-xs text-blue-600">{d.clues}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {differentials.suggested_investigations?.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="font-bold text-amber-800 text-xs mb-1">Suggested Investigations</p>
              <ul className="space-y-0.5">{differentials.suggested_investigations.map((inv, i) => <li key={i} className="text-xs text-amber-700">• {inv}</li>)}</ul>
            </div>
          )}
          {differentials.management_pearls?.length > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
              <p className="font-bold text-emerald-800 text-xs mb-1">Management Pearls</p>
              <ul className="space-y-0.5">{differentials.management_pearls.map((p, i) => <li key={i} className="text-xs text-emerald-700">• {p}</li>)}</ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Prescription Pad ────────────────────────────────────────────────────────
function PrescriptionPad({ medications, onAdd, onRemove, onUpdate, weight, height, egfr, patient, patientId }) {
  const [showFormulary, setShowFormulary] = useState(false);
  const [drugQuery, setDrugQuery] = useState("");
  const bsa = weight && height ? parseFloat(Math.sqrt((parseFloat(height) * parseFloat(weight)) / 3600).toFixed(3)) : null;

  const addFromFormulary = (drug) => {
    const existing = medications.find(m => m.drug_name === drug.generic);
    if (existing) { toast.info(`${drug.generic} already in Rx`); return; }
    const wt = parseFloat(weight);
    let autoCalcDose = "";
    if (drug.peds_dose && wt) {
      const match = drug.peds_dose.match(/([\d.]+)(?:–|-)([\d.]+)?\s*mg\/kg/);
      if (match) {
        const lo = (parseFloat(match[1]) * wt).toFixed(1);
        const hi = match[2] ? (parseFloat(match[2]) * wt).toFixed(1) : null;
        autoCalcDose = hi ? `${lo}–${hi}` : lo;
      }
    }
    onAdd({
      drug_name: drug.generic,
      dose: autoCalcDose,
      unit: "mg",
      frequency: drug.frequency || "",
      route: drug.formulations?.[0]?.form?.includes("IV") ? "IV" : "PO",
      duration: "",
      instructions: drug.food || "",
      brand: drug.formulations?.[0]?.brands?.split(",")[0]?.trim() || "",
    });
    setShowFormulary(false);
    toast.success(`${drug.generic} added to Rx`);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={() => setShowFormulary(!showFormulary)} className="bg-emerald-600 hover:bg-emerald-700 gap-2">
          <Plus className="w-4 h-4" /> Add Drug from Formulary
        </Button>
        <Button variant="outline" onClick={() => onAdd({ drug_name: "", dose: "", unit: "mg", frequency: "", route: "PO", duration: "", instructions: "" })} className="gap-1">
          <Plus className="w-4 h-4" /> Manual Entry
        </Button>
      </div>

      {showFormulary && (
        <Card className="border-2 border-emerald-300">
          <CardHeader className="bg-emerald-50 py-2 px-4 flex flex-row items-center justify-between">
            <span className="font-bold text-sm text-emerald-800">Formulary — Click drug to add to Rx</span>
            <button onClick={() => setShowFormulary(false)}><X className="w-4 h-4 text-slate-400" /></button>
          </CardHeader>
          <CardContent className="p-3 max-h-96 overflow-y-auto">
            <FormularyBrowser
              weight={weight}
              height={height}
              egfr={egfr}
              patientId={patientId}
              onAddToRx={addFromFormulary}
            />
          </CardContent>
        </Card>
      )}

      {medications.length === 0 ? (
        <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
          <Pill className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No medications added yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {medications.map((med, idx) => (
            <div key={idx} className="bg-white border-2 border-slate-200 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase">Drug {idx + 1}</span>
                <button onClick={() => onRemove(idx)} className="text-red-400 hover:text-red-600">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <div className="col-span-2 md:col-span-1">
                  <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Drug Name</label>
                  <Input value={med.drug_name} onChange={e => onUpdate(idx, "drug_name", e.target.value)} placeholder="Generic name" className="h-8 text-sm" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Dose</label>
                  <div className="flex gap-1">
                    <Input value={med.dose} onChange={e => onUpdate(idx, "dose", e.target.value)} placeholder="e.g. 20" className="h-8 text-sm" />
                    <select value={med.unit} onChange={e => onUpdate(idx, "unit", e.target.value)} className="text-xs border border-slate-200 rounded px-1 h-8 bg-white">
                      {["mg", "mcg", "mL", "units", "g"].map(u => <option key={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Frequency</label>
                  <select value={med.frequency} onChange={e => onUpdate(idx, "frequency", e.target.value)} className="w-full text-xs border border-slate-200 rounded-md px-2 h-8 bg-white">
                    {["", "OD", "BD", "TDS", "QID", "Q6H", "Q8H", "Q12H", "PRN", "STAT", "Alt day", "Weekly"].map(f => <option key={f} value={f}>{f || "Select..."}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Route</label>
                  <select value={med.route} onChange={e => onUpdate(idx, "route", e.target.value)} className="w-full text-xs border border-slate-200 rounded-md px-2 h-8 bg-white">
                    {["PO", "IV", "IM", "SC", "SL", "Inhaled", "Topical", "PR"].map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Duration</label>
                  <Input value={med.duration} onChange={e => onUpdate(idx, "duration", e.target.value)} placeholder="e.g. 4 weeks" className="h-8 text-sm" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Instructions</label>
                  <Input value={med.instructions} onChange={e => onUpdate(idx, "instructions", e.target.value)} placeholder="With food, after meals..." className="h-8 text-sm" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Printable Prescription ───────────────────────────────────────────────────
function PrintablePrescription({ patient, encounterData, medications, letterhead, onClose }) {
  const printRef = useRef();

  const handlePrint = () => window.print();

  return (
    <div>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #rx-print-area, #rx-print-area * { visibility: visible; }
          #rx-print-area { position: fixed; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>
      <div id="rx-print-area" ref={printRef} className="bg-white p-8 max-w-2xl mx-auto border rounded-2xl">
        {/* Letterhead */}
        <div className="border-b-2 border-slate-300 pb-4 mb-6 text-center">
          <h1 className="text-2xl font-black text-slate-900">{letterhead.clinicName}</h1>
          <p className="text-lg font-bold text-slate-700">{letterhead.doctorName}</p>
          <p className="text-sm text-slate-500">{letterhead.qualifications}</p>
          <p className="text-xs text-slate-400">{letterhead.address} {letterhead.phone && `· ${letterhead.phone}`}</p>
          {letterhead.regNo && <p className="text-xs text-slate-400">Reg No: {letterhead.regNo}</p>}
        </div>

        {/* Patient info */}
        <div className="flex justify-between text-sm mb-6">
          <div>
            <p><strong>Patient:</strong> {patient?.patient_name}</p>
            <p><strong>Age:</strong> {patient?.age_years}y · {patient?.gender}</p>
            <p><strong>CR#:</strong> {patient?.cr_number}</p>
          </div>
          <div className="text-right">
            <p><strong>Date:</strong> {format(new Date(), "dd/MM/yyyy")}</p>
            {encounterData.vitals.weight && <p><strong>Wt:</strong> {encounterData.vitals.weight} kg</p>}
            {encounterData.vitals.height && <p><strong>Ht:</strong> {encounterData.vitals.height} cm</p>}
          </div>
        </div>

        {/* Diagnosis */}
        {encounterData.assessment && (
          <div className="mb-4">
            <p className="font-bold text-sm">Diagnosis: <span className="font-normal">{encounterData.assessment}</span></p>
          </div>
        )}

        {/* Rx */}
        <div className="mb-6">
          <p className="text-3xl font-black text-slate-700 mb-3">℞</p>
          <div className="space-y-3">
            {medications.map((med, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-sm font-bold text-slate-500 w-5">{idx + 1}.</span>
                <div>
                  <p className="font-bold text-base">{med.drug_name} {med.dose}{med.unit}</p>
                  <p className="text-sm text-slate-600">{med.frequency} · {med.route}{med.duration && ` · ${med.duration}`}</p>
                  {med.instructions && <p className="text-xs text-slate-500 italic">{med.instructions}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Advice */}
        {encounterData.plan && (
          <div className="border-t border-slate-200 pt-4">
            <p className="font-bold text-sm mb-1">Advice & Plan:</p>
            <p className="text-sm text-slate-600 whitespace-pre-wrap">{encounterData.plan}</p>
          </div>
        )}

        {/* Follow-up */}
        {encounterData.follow_up && (
          <p className="mt-4 text-sm"><strong>Follow-up:</strong> {encounterData.follow_up}</p>
        )}

        {/* Signature */}
        <div className="mt-12 text-right">
          <div className="inline-block border-t-2 border-slate-400 pt-1 min-w-[160px]">
            <p className="text-sm font-bold">{letterhead.doctorName}</p>
            <p className="text-xs text-slate-500">{letterhead.qualifications}</p>
          </div>
        </div>
      </div>

      <div className="no-print flex gap-3 justify-center mt-4">
        <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 gap-2">
          <Printer className="w-4 h-4" /> Print Prescription
        </Button>
        <Button variant="outline" onClick={onClose}>Close</Button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function StartAppointmentWorkspace({ appointment, patient, workspace, onComplete, onBack }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("encounter");
  const [medications, setMedications] = useState([]);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [showLetterheadSettings, setShowLetterheadSettings] = useState(false);
  const [saving, setSaving] = useState(false);

  const [letterhead, setLetterhead] = useState(() => {
    try { return { ...DEFAULT_LETTERHEAD, ...JSON.parse(localStorage.getItem("rx_letterhead") || "{}") }; }
    catch { return DEFAULT_LETTERHEAD; }
  });

  const [encounterData, setEncounterData] = useState({
    chief_complaint: appointment?.chief_complaint || "",
    history: "",
    examination: "",
    vitals: {
      weight: patient?.weight_kg?.toString() || "",
      height: patient?.height_cm?.toString() || "",
      bp_systolic: "",
      bp_diastolic: "",
      temperature: "",
      heart_rate: "",
      spo2: "",
      rr: "",
    },
    assessment: patient?.diagnosis || "",
    plan: "",
    follow_up: "",
    investigations: "",
  });

  const isSOSAppointment = !appointment?.appointment_date || appointment?.appointment_type === "Emergency";

  const updateVital = (key, val) => setEncounterData(p => ({ ...p, vitals: { ...p.vitals, [key]: val } }));
  const update = (key, val) => setEncounterData(p => ({ ...p, [key]: val }));

  const handleScribeResult = (data) => {
    if (data.history) update("history", encounterData.history ? `${encounterData.history}\n\n${data.history}` : data.history);
    if (data.examination) update("examination", encounterData.examination ? `${encounterData.examination}\n${data.examination}` : data.examination);
    if (data.assessment) update("assessment", data.assessment);
    if (data.plan) update("plan", data.plan);
    if (data.vitals_mentioned) {
      const vm = data.vitals_mentioned;
      if (vm.weight) updateVital("weight", vm.weight);
      if (vm.height) updateVital("height", vm.height);
      if (vm.bp) {
        const parts = vm.bp.split("/");
        if (parts[0]) updateVital("bp_systolic", parts[0].trim());
        if (parts[1]) updateVital("bp_diastolic", parts[1].trim());
      }
      if (vm.hr) updateVital("heart_rate", vm.hr);
      if (vm.temp) updateVital("temperature", vm.temp);
    }
  };

  const addMedication = (med) => setMedications(p => [...p, med]);
  const removeMedication = (idx) => setMedications(p => p.filter((_, i) => i !== idx));
  const updateMedication = (idx, field, val) => setMedications(p => p.map((m, i) => i === idx ? { ...m, [field]: val } : m));

  const saveLetterhead = (lh) => {
    localStorage.setItem("rx_letterhead", JSON.stringify(lh));
    setLetterhead(lh);
    setShowLetterheadSettings(false);
    toast.success("Letterhead saved");
  };

  const saveEncounter = async () => {
    if (!patient?.id) { toast.error("No patient selected"); return; }
    setSaving(true);
    try {
      const me = await base44.auth.me();
      const encounter = await base44.entities.ClinicalEncounter.create({
        workspace_id: workspace?.id,
        patient_id: patient.id,
        clinician_id: me.email,
        encounter_date: new Date().toISOString(),
        encounter_type: appointment?.appointment_type || "Follow-up",
        reason_for_visit: encounterData.chief_complaint,
        vitals: encounterData.vitals,
        clinical_notes: `History: ${encounterData.history}\n\nExamination: ${encounterData.examination}`,
        assessment: encounterData.assessment,
        status: "Completed",
      });

      if (medications.length > 0) {
        await base44.entities.Prescription.create({
          patient_id: patient.id,
          prescription_date: new Date().toISOString().split("T")[0],
          diagnosis: encounterData.assessment,
          medications,
          notes: encounterData.plan,
        });
      }

      if (appointment?.id) {
        await base44.entities.Appointment.update(appointment.id, { status: "Completed", encounter_id: encounter.id });
      }

      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Encounter & prescription saved!");
      onComplete?.(encounter);
    } catch (err) {
      toast.error("Save failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const wt = encounterData.vitals.weight;
  const ht = encounterData.vitals.height;
  const bsa = wt && ht ? parseFloat(Math.sqrt((parseFloat(ht) * parseFloat(wt)) / 3600).toFixed(3)) : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={onBack} className="text-white hover:bg-white/20 gap-1">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold">{patient?.patient_name || "Patient"}</h2>
                  {isSOSAppointment && <Badge className="bg-red-500 text-white text-xs">SOS</Badge>}
                  {!isSOSAppointment && <Badge className="bg-green-500 text-white text-xs">Scheduled</Badge>}
                </div>
                <p className="text-blue-200 text-xs">{patient?.cr_number} · {patient?.age_years}y · {patient?.gender} · {patient?.diagnosis}</p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant="outline" onClick={() => setShowLetterheadSettings(true)} className="bg-white/10 border-white/30 text-white hover:bg-white/20 gap-1">
                <Settings className="w-3.5 h-3.5" /> Letterhead
              </Button>
              <Button size="sm" onClick={() => setShowPrintPreview(true)} variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 gap-1">
                <Printer className="w-3.5 h-3.5" /> Print Rx
              </Button>
              <Button size="sm" onClick={saveEncounter} disabled={saving} className="bg-green-500 hover:bg-green-600 text-white gap-1">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save Record
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Scribe */}
      <AIScribe onTranscribed={handleScribeResult} context={encounterData} />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex w-full h-auto overflow-x-auto p-1">
          <TabsTrigger value="encounter" className="flex-shrink-0 text-xs py-2 gap-1">
            <ClipboardList className="w-3.5 h-3.5" /> History & Exam
          </TabsTrigger>
          <TabsTrigger value="vitals" className="flex-shrink-0 text-xs py-2 gap-1">
            <Activity className="w-3.5 h-3.5" /> Vitals & Growth
          </TabsTrigger>
          <TabsTrigger value="prescription" className="flex-shrink-0 text-xs py-2 gap-1">
            <Pill className="w-3.5 h-3.5" /> Prescription {medications.length > 0 && <Badge className="bg-emerald-500 text-white text-[10px] px-1 ml-1">{medications.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex-shrink-0 text-xs py-2 gap-1">
            <Brain className="w-3.5 h-3.5" /> AI Assist
          </TabsTrigger>
        </TabsList>

        {/* History & Exam */}
        <TabsContent value="encounter" className="space-y-4 mt-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm flex items-center gap-2"><User className="w-4 h-4 text-blue-600" /> Chief Complaint</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <Input value={encounterData.chief_complaint} onChange={e => update("chief_complaint", e.target.value)} placeholder="e.g. Periorbital oedema, haematuria..." className="text-sm" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm flex items-center gap-2"><FileText className="w-4 h-4 text-indigo-600" /> History of Present Illness</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <Textarea value={encounterData.history} onChange={e => update("history", e.target.value)} placeholder="Duration, onset, progression, associated symptoms, previous treatments..." rows={5} className="text-sm" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm flex items-center gap-2"><Stethoscope className="w-4 h-4 text-green-600" /> Examination Findings</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <Textarea value={encounterData.examination} onChange={e => update("examination", e.target.value)} placeholder="General: Alert, oriented...\nCVS: S1S2 normal...\nResp: NVBS...\nAbd: Soft, non-tender...\nEdema: ..." rows={5} className="text-sm" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600" /> Assessment & Diagnosis</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <Textarea value={encounterData.assessment} onChange={e => update("assessment", e.target.value)} placeholder="Primary diagnosis, active problems..." rows={3} className="text-sm" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm flex items-center gap-2"><ClipboardList className="w-4 h-4 text-purple-600" /> Plan & Investigations</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-3">
                <Textarea value={encounterData.investigations} onChange={e => update("investigations", e.target.value)} placeholder="Labs ordered, imaging requested..." rows={2} className="text-sm" />
                <Textarea value={encounterData.plan} onChange={e => update("plan", e.target.value)} placeholder="Management plan, lifestyle advice, dietary instructions..." rows={3} className="text-sm" />
                <Input value={encounterData.follow_up} onChange={e => update("follow_up", e.target.value)} placeholder="Follow-up: e.g. 4 weeks / after reports" className="text-sm" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Vitals & Growth */}
        <TabsContent value="vitals" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm flex items-center gap-2"><Activity className="w-4 h-4 text-red-600" /> Vitals</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { key: "weight", label: "Weight (kg)", placeholder: "e.g. 18" },
                  { key: "height", label: "Height (cm)", placeholder: "e.g. 110" },
                  { key: "bp_systolic", label: "BP Systolic (mmHg)", placeholder: "e.g. 110" },
                  { key: "bp_diastolic", label: "BP Diastolic (mmHg)", placeholder: "e.g. 70" },
                  { key: "heart_rate", label: "Heart Rate (bpm)", placeholder: "e.g. 88" },
                  { key: "temperature", label: "Temperature (°F)", placeholder: "e.g. 98.6" },
                  { key: "spo2", label: "SpO2 (%)", placeholder: "e.g. 98" },
                  { key: "rr", label: "Resp Rate", placeholder: "e.g. 22" },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">{f.label}</label>
                    <Input value={encounterData.vitals[f.key]} onChange={e => updateVital(f.key, e.target.value)} placeholder={f.placeholder} className="h-9 text-sm" />
                  </div>
                ))}
              </div>
              <AnthropometryPanel vitals={encounterData.vitals} />
            </CardContent>
          </Card>

          {/* Growth modules */}
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm flex items-center gap-2"><Ruler className="w-4 h-4 text-indigo-600" /> Growth & Nutrition Modules</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              {wt && ht ? (
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "BSA", value: `${bsa} m²`, desc: "Body Surface Area (Mosteller)" },
                    { label: "BMI", value: wt && ht ? `${(parseFloat(wt) / ((parseFloat(ht) / 100) ** 2)).toFixed(1)} kg/m²` : "—", desc: "Body Mass Index" },
                    { label: "Ideal Weight", value: ht ? `~${((parseFloat(ht) - 100) * 0.9).toFixed(1)} kg` : "—", desc: "Broca formula" },
                    { label: "Daily Protein", value: wt ? `${(parseFloat(wt) * 1.5).toFixed(1)}–${(parseFloat(wt) * 2).toFixed(1)} g/day` : "—", desc: "1.5–2 g/kg/day (CKD)" },
                    { label: "Daily Calories", value: wt ? `${(parseFloat(wt) * 80).toFixed(0)}–${(parseFloat(wt) * 100).toFixed(0)} kcal/day` : "—", desc: "80–100 kcal/kg (paeds)" },
                    { label: "Fluid Holliday-Segar", value: wt ? (() => {
                      const w = parseFloat(wt);
                      let ml = w <= 10 ? w * 100 : w <= 20 ? 1000 + (w - 10) * 50 : 1500 + (w - 20) * 20;
                      return `${ml} mL/day`;
                    })() : "—", desc: "Maintenance fluid" },
                  ].map(item => (
                    <div key={item.label} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">{item.label}</p>
                      <p className="text-base font-black text-slate-800">{item.value}</p>
                      <p className="text-[10px] text-slate-400">{item.desc}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 text-center py-4">Enter weight and height in Vitals to see growth calculations</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prescription */}
        <TabsContent value="prescription" className="space-y-4 mt-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
            <Pill className="w-4 h-4 text-blue-600 shrink-0" />
            <p className="text-xs text-blue-700">
              Patient: <strong>{wt ? `${wt} kg` : "Weight not set"}</strong>
              {ht && <> · <strong>{ht} cm</strong></>}
              {bsa && <> · BSA <strong>{bsa} m²</strong></>}
              {!wt && <span className="text-amber-600"> — Enter weight in Vitals tab for auto-dose calculation</span>}
            </p>
          </div>
          <PrescriptionPad
            medications={medications}
            onAdd={addMedication}
            onRemove={removeMedication}
            onUpdate={updateMedication}
            weight={wt}
            height={ht}
            patient={patient}
            patientId={patient?.id}
          />
        </TabsContent>

        {/* AI Assist */}
        <TabsContent value="ai" className="space-y-4 mt-4">
          <DifferentialSuggester encounterData={encounterData} patient={patient} />
        </TabsContent>
      </Tabs>

      {/* Print Preview Dialog */}
      <Dialog open={showPrintPreview} onOpenChange={setShowPrintPreview}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Printer className="w-5 h-5" /> Print Prescription
            </DialogTitle>
          </DialogHeader>
          <PrintablePrescription
            patient={patient}
            encounterData={encounterData}
            medications={medications}
            letterhead={letterhead}
            onClose={() => setShowPrintPreview(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Letterhead Settings */}
      <Dialog open={showLetterheadSettings} onOpenChange={setShowLetterheadSettings}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Settings className="w-4 h-4" /> Clinic Letterhead</DialogTitle>
          </DialogHeader>
          <LetterheadEditor initial={letterhead} onSave={saveLetterhead} onCancel={() => setShowLetterheadSettings(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LetterheadEditor({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({ ...initial });
  const fields = [
    { key: "clinicName", label: "Clinic Name" },
    { key: "doctorName", label: "Doctor Name" },
    { key: "qualifications", label: "Qualifications" },
    { key: "address", label: "Address" },
    { key: "phone", label: "Phone" },
    { key: "regNo", label: "Registration No." },
  ];
  return (
    <div className="space-y-3">
      {fields.map(f => (
        <div key={f.key}>
          <label className="text-xs font-semibold text-slate-600 block mb-1">{f.label}</label>
          <Input value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className="text-sm h-8" />
        </div>
      ))}
      <div className="flex gap-2 mt-4">
        <Button onClick={() => onSave(form)} className="flex-1 bg-blue-600">Save Letterhead</Button>
        <Button variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
      </div>
    </div>
  );
}