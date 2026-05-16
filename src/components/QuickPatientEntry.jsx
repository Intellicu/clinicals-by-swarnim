import React, { useState } from 'react';
import { usePatient } from './PatientContext';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { User, Save, Trash2, ChevronDown, ChevronUp, Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

export default function QuickPatientEntry({ compact = false }) {
  const { patientData, updatePatientData, clearPatientData } = usePatient();
  const [isExpanded, setIsExpanded] = useState(false);
  const [localData, setLocalData] = useState(patientData);
  const [ocrLoading, setOcrLoading] = useState(false);

  const set = (key, val) => setLocalData(d => ({ ...d, [key]: val }));

  const handleOCR = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setOcrLoading(true);
    toast.info('Scanning image with OCR...');
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Extract the following clinical values from this medical document/lab report image. Return only values that are clearly visible. For each field, if not found, return null.`,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            weight: { type: "number" }, height: { type: "number" },
            age: { type: "number" }, gender: { type: "string" },
            serumCreatinine: { type: "number" }, systolicBP: { type: "number" },
            diastolicBP: { type: "number" }, hemoglobin: { type: "number" },
            albumin: { type: "number" }, serumSodium: { type: "number" },
            serumPotassium: { type: "number" }
          }
        }
      });
      const merged = { ...localData };
      Object.entries(result).forEach(([key, val]) => {
        if (val !== null && val !== undefined) merged[key] = String(val);
      });
      setLocalData(merged);
      const found = Object.entries(result).filter(([, v]) => v !== null).length;
      toast.success(`OCR extracted ${found} value(s). Review and save.`);
    } catch {
      toast.error('OCR failed. Try a clearer image.');
    } finally {
      setOcrLoading(false);
      e.target.value = '';
    }
  };

  const handleSave = () => {
    updatePatientData(localData);
    toast.success("Patient data saved — auto-fills calculators");
  };

  const handleClear = () => {
    const empty = {
      weight: '', height: '', age: '', dateOfBirth: '', gender: '',
      serumCreatinine: '', serumSodium: '', serumPotassium: '', serumCalcium: '',
      serumPhosphate: '', hemoglobin: '', albumin: '', urineProtein: '',
      urineCreatinine: '', systolicBP: '', diastolicBP: ''
    };
    clearPatientData();
    setLocalData(empty);
    toast.success("Patient data cleared");
  };

  const hasData = Object.values(patientData).some(v => v !== '');

  // Compact collapsed view
  if (compact && !isExpanded) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-slate-900">Quick Patient Entry</span>
            {hasData && <Badge className="bg-green-500 text-white text-xs">Active</Badge>}
          </div>
          <button onClick={() => setIsExpanded(true)} className="p-1 text-blue-600">
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
        {hasData && (
          <p className="mt-1 text-xs text-slate-500">
            {patientData.weight && `${patientData.weight}kg`}
            {patientData.age && ` · ${patientData.age}yr`}
            {patientData.gender && ` · ${patientData.gender}`}
            {patientData.serumCreatinine && ` · Cr ${patientData.serumCreatinine}`}
          </p>
        )}
      </div>
    );
  }

  // ── Field definitions (single column, no horizontal scroll) ──────────────
  const fields = [
    { label: "Weight (kg)", key: "weight", placeholder: "e.g. 25", step: "0.1", type: "number" },
    { label: "Height (cm)", key: "height", placeholder: "e.g. 120", step: "0.1", type: "number" },
    { label: "Age (years)", key: "age", placeholder: "e.g. 8", step: "0.1", type: "number" },
    { label: "Creatinine (mg/dL)", key: "serumCreatinine", placeholder: "0.6", step: "0.01", type: "number" },
    { label: "Sodium — Na (mEq/L)", key: "serumSodium", placeholder: "140", step: "1", type: "number" },
    { label: "Potassium — K (mEq/L)", key: "serumPotassium", placeholder: "4.0", step: "0.1", type: "number" },
    { label: "Haemoglobin (g/dL)", key: "hemoglobin", placeholder: "12", step: "0.1", type: "number" },
    { label: "Albumin (g/dL)", key: "albumin", placeholder: "3.5", step: "0.1", type: "number" },
    { label: "Systolic BP (mmHg)", key: "systolicBP", placeholder: "110", step: "1", type: "number" },
    { label: "Diastolic BP (mmHg)", key: "diastolicBP", placeholder: "70", step: "1", type: "number" },
    { label: "Urine Protein (mg/dL)", key: "urineProtein", placeholder: "—", step: "0.1", type: "number" },
    { label: "Urine Creatinine (mg/dL)", key: "urineCreatinine", placeholder: "—", step: "0.1", type: "number" },
  ];

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-3 pt-2 pb-0.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
          <span className="text-xs font-bold text-slate-800">Quick Patient Entry</span>
          {hasData && <Badge className="bg-green-500 text-white text-xs py-0 px-1.5">Saved</Badge>}
        </div>
        <div className="flex items-center gap-1.5">
          <input type="file" accept="image/*" capture="environment" id="qpe-ocr" className="hidden" onChange={handleOCR} />
          <label htmlFor="qpe-ocr" className="cursor-pointer inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold border border-green-300 text-green-700 rounded-lg bg-white hover:bg-green-50">
            {ocrLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
            {ocrLoading ? "Scanning…" : "Scan"}
          </label>
          {compact && (
            <button onClick={() => setIsExpanded(false)} className="p-1 text-slate-400">
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
      <p className="px-3 text-xs text-slate-400 mb-1.5">Auto-fills all calculators when saved</p>

      {/* 2-column grid for fields */}
      <div className="px-3 pb-2.5">
        {/* Gender full width */}
        <div className="mb-1.5">
          <label className="text-xs font-medium text-slate-500 block mb-0.5">Gender</label>
          <Select value={localData.gender} onValueChange={v => set('gender', v)}>
            <SelectTrigger className="h-8 text-xs bg-white">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 2-column numeric fields */}
        <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
          {fields.map(f => (
            <div key={f.key}>
              <label className="text-xs font-medium text-slate-500 block mb-0.5 truncate">{f.label}</label>
              <Input
                type={f.type}
                step={f.step}
                value={localData[f.key] || ''}
                onChange={e => set(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="h-8 text-xs bg-white px-2"
              />
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-2">
          <Button onClick={handleSave} size="sm" className="bg-blue-600 hover:bg-blue-700 flex-1 h-8 text-xs">
            <Save className="w-3.5 h-3.5 mr-1" /> Save & Auto-Fill
          </Button>
          <Button onClick={handleClear} size="sm" variant="outline" className="text-red-600 border-red-200 h-8 px-2.5">
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}