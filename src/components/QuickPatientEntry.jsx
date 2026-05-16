import React, { useState, useEffect } from 'react';
import { usePatient } from './PatientContext';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { User, Save, Trash2, Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

export default function QuickPatientEntry({ compact = false }) {
  const { patientData, updatePatientData, clearPatientData } = usePatient();
  const [localData, setLocalData] = useState(() => ({ ...patientData }));
  const [ocrLoading, setOcrLoading] = useState(false);

  // On mount load saved data from context (localStorage-backed)
  useEffect(() => {
    setLocalData({ ...patientData });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-3 pt-2.5 pb-1 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <User className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span className="text-sm font-bold text-slate-800">Quick Patient Entry</span>
          {hasData && <Badge className="bg-green-500 text-white text-xs py-0 px-1.5">Data Saved</Badge>}
        </div>
        <div className="flex items-center gap-1.5">
          <input type="file" accept="image/*" capture="environment" id="qpe-ocr" className="hidden" onChange={handleOCR} />
          <label htmlFor="qpe-ocr" className="cursor-pointer inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold border border-green-300 text-green-700 rounded-lg bg-white hover:bg-green-50">
            {ocrLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
            {ocrLoading ? "Scanning…" : "Scan / Upload"}
          </label>
        </div>
      </div>
      <p className="px-3 text-xs text-slate-500 mb-2">Enter patient data once — auto-fills all calculators</p>

      {/* 2-column grid — matches screenshot */}
      <div className="px-3 pb-3">
        <div className="grid grid-cols-2 gap-x-3 gap-y-2">
          {/* Weight */}
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-0.5">Weight (kg)</label>
            <Input type="number" step="0.1" value={localData.weight || ''} onChange={e => set('weight', e.target.value)} placeholder="e.g. 25" className="h-9 text-sm bg-white" />
          </div>
          {/* Height */}
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-0.5">Height (cm)</label>
            <Input type="number" step="0.1" value={localData.height || ''} onChange={e => set('height', e.target.value)} placeholder="e.g. 120" className="h-9 text-sm bg-white" />
          </div>
          {/* Age */}
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-0.5">Age (years)</label>
            <Input type="number" step="0.1" value={localData.age || ''} onChange={e => set('age', e.target.value)} placeholder="e.g. 8" className="h-9 text-sm bg-white" />
          </div>
          {/* Gender */}
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-0.5">Gender</label>
            <Select value={localData.gender} onValueChange={v => set('gender', v)}>
              <SelectTrigger className="h-9 text-sm bg-white">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Creatinine */}
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-0.5">Cr (mg/dL)</label>
            <Input type="number" step="0.01" value={localData.serumCreatinine || ''} onChange={e => set('serumCreatinine', e.target.value)} placeholder="0.6" className="h-9 text-sm bg-white" />
          </div>
          {/* Sodium */}
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-0.5">Na (mEq/L)</label>
            <Input type="number" step="1" value={localData.serumSodium || ''} onChange={e => set('serumSodium', e.target.value)} placeholder="140" className="h-9 text-sm bg-white" />
          </div>
          {/* Potassium */}
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-0.5">K (mEq/L)</label>
            <Input type="number" step="0.1" value={localData.serumPotassium || ''} onChange={e => set('serumPotassium', e.target.value)} placeholder="4.0" className="h-9 text-sm bg-white" />
          </div>
          {/* Hb */}
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-0.5">Hb (g/dL)</label>
            <Input type="number" step="0.1" value={localData.hemoglobin || ''} onChange={e => set('hemoglobin', e.target.value)} placeholder="12" className="h-9 text-sm bg-white" />
          </div>
          {/* Systolic BP */}
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-0.5">Systolic BP (mmHg)</label>
            <Input type="number" step="1" value={localData.systolicBP || ''} onChange={e => set('systolicBP', e.target.value)} placeholder="110" className="h-9 text-sm bg-white" />
          </div>
          {/* Diastolic BP */}
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-0.5">Diastolic BP (mmHg)</label>
            <Input type="number" step="1" value={localData.diastolicBP || ''} onChange={e => set('diastolicBP', e.target.value)} placeholder="70" className="h-9 text-sm bg-white" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-3">
          <Button onClick={handleSave} size="sm" className="bg-blue-600 hover:bg-blue-700 flex-1 h-9 text-sm">
            <Save className="w-4 h-4 mr-1.5" /> Save & Auto-Fill Calculators
          </Button>
          <Button onClick={handleClear} size="sm" variant="outline" className="text-red-600 border-red-200 h-9 px-3">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}