import React, { useState } from 'react';
import { usePatient } from './PatientContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
            weight: { type: "number", description: "Weight in kg" },
            height: { type: "number", description: "Height in cm" },
            age: { type: "number", description: "Age in years" },
            gender: { type: "string", description: "Male or Female" },
            serumCreatinine: { type: "number", description: "Serum creatinine in mg/dL" },
            systolicBP: { type: "number", description: "Systolic blood pressure mmHg" },
            diastolicBP: { type: "number", description: "Diastolic blood pressure mmHg" },
            hemoglobin: { type: "number", description: "Hemoglobin in g/dL" },
            albumin: { type: "number", description: "Albumin in g/dL" },
            serumSodium: { type: "number", description: "Sodium mEq/L" },
            serumPotassium: { type: "number", description: "Potassium mEq/L" }
          }
        }
      });
      // Merge non-null extracted values
      const merged = { ...localData };
      Object.entries(result).forEach(([key, val]) => {
        if (val !== null && val !== undefined) merged[key] = String(val);
      });
      setLocalData(merged);
      const found = Object.entries(result).filter(([, v]) => v !== null).length;
      toast.success(`OCR extracted ${found} value(s). Review and save.`);
    } catch (err) {
      toast.error('OCR failed. Try a clearer image.');
    } finally {
      setOcrLoading(false);
      e.target.value = '';
    }
  };

  const handleSave = () => {
    updatePatientData(localData);
    toast.success("Patient data saved and will auto-fill in calculators");
  };

  const handleClear = () => {
    clearPatientData();
    setLocalData({
      weight: '',
      height: '',
      age: '',
      dateOfBirth: '',
      gender: '',
      serumCreatinine: '',
      serumSodium: '',
      serumPotassium: '',
      serumCalcium: '',
      serumPhosphate: '',
      hemoglobin: '',
      albumin: '',
      urineProtein: '',
      urineCreatinine: '',
      systolicBP: '',
      diastolicBP: ''
    });
    toast.success("Patient data cleared");
  };

  const hasData = Object.values(patientData).some(val => val !== '');

  if (compact && !isExpanded) {
    return (
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 mb-4">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-slate-900">Quick Patient Entry</span>
              {hasData && (
                <Badge className="bg-green-500 text-white">
                  Active
                </Badge>
              )}
            </div>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => setIsExpanded(true)}
              className="text-blue-600"
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
          {hasData && (
            <div className="mt-2 text-xs text-slate-600">
              {patientData.weight && `Weight: ${patientData.weight} kg`}
              {patientData.age && ` • Age: ${patientData.age} years`}
              {patientData.gender && ` • ${patientData.gender}`}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
      {/* Compact header */}
      <div className="px-3 pt-2.5 pb-1.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <User className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span className="text-sm font-bold text-slate-800 leading-tight">Quick Patient Entry</span>
          {hasData && <Badge className="bg-green-500 text-white text-xs py-0 px-1.5">Active</Badge>}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <input type="file" accept="image/*" capture="environment" id="qpe-ocr" className="hidden" onChange={handleOCR} />
          <label htmlFor="qpe-ocr">
            <span className="cursor-pointer inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold border border-green-300 text-green-700 rounded-lg bg-white hover:bg-green-50 transition-colors">
              {ocrLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
              {ocrLoading ? "Scanning…" : "Scan"}
            </span>
          </label>
          {compact && (
            <button onClick={() => setIsExpanded(false)} className="p-1 text-slate-400 hover:text-slate-600">
              <ChevronUp className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      <p className="px-3 text-xs text-slate-500 mb-2">Auto-fills all calculators</p>

      <div className="px-3 pb-3 space-y-2">
        {/* Row 1: Demographics — 2-col mobile, 4-col sm+ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: "Wt (kg)", key: "weight", placeholder: "25", step: "0.1" },
            { label: "Ht (cm)", key: "height", placeholder: "120", step: "0.1" },
            { label: "Age (yr)", key: "age", placeholder: "8", step: "0.1" },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs font-semibold text-slate-600 block mb-0.5">{f.label}</label>
              <Input type="number" step={f.step} value={localData[f.key]}
                onChange={e => setLocalData({ ...localData, [f.key]: e.target.value })}
                placeholder={f.placeholder} className="h-8 text-sm px-2" />
            </div>
          ))}
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-0.5">Sex</label>
            <Select value={localData.gender} onValueChange={val => setLocalData({ ...localData, gender: val })}>
              <SelectTrigger className="h-8 text-sm px-2"><SelectValue placeholder="M/F" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Row 2: Labs — 2-col mobile, 4-col sm+ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: "Cr (mg/dL)", key: "serumCreatinine", placeholder: "0.6", step: "0.01" },
            { label: "Na (mEq/L)", key: "serumSodium", placeholder: "140", step: "1" },
            { label: "K (mEq/L)", key: "serumPotassium", placeholder: "4.0", step: "0.1" },
            { label: "Hb (g/dL)", key: "hemoglobin", placeholder: "12", step: "0.1" },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs font-semibold text-slate-600 block mb-0.5">{f.label}</label>
              <Input type="number" step={f.step} value={localData[f.key]}
                onChange={e => setLocalData({ ...localData, [f.key]: e.target.value })}
                placeholder={f.placeholder} className="h-8 text-sm px-2" />
            </div>
          ))}
        </div>

        {/* Row 3: BP — always 2-col */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "SBP (mmHg)", key: "systolicBP", placeholder: "110" },
            { label: "DBP (mmHg)", key: "diastolicBP", placeholder: "70" },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs font-semibold text-slate-600 block mb-0.5">{f.label}</label>
              <Input type="number" value={localData[f.key]}
                onChange={e => setLocalData({ ...localData, [f.key]: e.target.value })}
                placeholder={f.placeholder} className="h-8 text-sm px-2" />
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button onClick={handleSave} size="sm" className="bg-blue-600 hover:bg-blue-700 flex-1 h-8 text-xs">
            <Save className="w-3.5 h-3.5 mr-1" /> Save & Auto-Fill
          </Button>
          <Button onClick={handleClear} size="sm" variant="outline" className="text-red-600 border-red-200 h-8 text-xs px-2.5">
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}