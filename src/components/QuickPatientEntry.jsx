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
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-base">Quick Patient Entry</CardTitle>
            {hasData && (
              <Badge className="bg-green-500 text-white">
                Data Saved
              </Badge>
            )}
          </div>
          {compact && (
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => setIsExpanded(false)}
              className="text-blue-600"
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
          )}
        </div>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-slate-600">Enter patient data once — auto-fills all calculators</p>
          <div>
            <input type="file" accept="image/*" capture="environment" id="qpe-ocr" className="hidden" onChange={handleOCR} />
            <label htmlFor="qpe-ocr">
              <Button type="button" size="sm" variant="outline" className="cursor-pointer border-green-300 text-green-700 hover:bg-green-50 h-7 text-xs gap-1" asChild disabled={ocrLoading}>
                <span>
                  {ocrLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
                  {ocrLoading ? 'Scanning...' : 'Scan / Upload'}
                </span>
              </Button>
            </label>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Demographics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <Label className="text-xs font-semibold text-slate-700">Weight (kg)</Label>
            <Input
              type="number"
              step="0.1"
              value={localData.weight}
              onChange={(e) => setLocalData({...localData, weight: e.target.value})}
              placeholder="e.g., 25"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs font-semibold text-slate-700">Height (cm)</Label>
            <Input
              type="number"
              step="0.1"
              value={localData.height}
              onChange={(e) => setLocalData({...localData, height: e.target.value})}
              placeholder="e.g., 120"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs font-semibold text-slate-700">Age (years)</Label>
            <Input
              type="number"
              step="0.1"
              value={localData.age}
              onChange={(e) => setLocalData({...localData, age: e.target.value})}
              placeholder="e.g., 8"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs font-semibold text-slate-700">Gender</Label>
            <Select value={localData.gender} onValueChange={(val) => setLocalData({...localData, gender: val})}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Lab Values */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <Label className="text-xs font-semibold text-slate-700">Cr (mg/dL)</Label>
            <Input
              type="number"
              step="0.01"
              value={localData.serumCreatinine}
              onChange={(e) => setLocalData({...localData, serumCreatinine: e.target.value})}
              placeholder="0.6"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs font-semibold text-slate-700">Na (mEq/L)</Label>
            <Input
              type="number"
              value={localData.serumSodium}
              onChange={(e) => setLocalData({...localData, serumSodium: e.target.value})}
              placeholder="140"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs font-semibold text-slate-700">K (mEq/L)</Label>
            <Input
              type="number"
              step="0.1"
              value={localData.serumPotassium}
              onChange={(e) => setLocalData({...localData, serumPotassium: e.target.value})}
              placeholder="4.0"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs font-semibold text-slate-700">Hb (g/dL)</Label>
            <Input
              type="number"
              step="0.1"
              value={localData.hemoglobin}
              onChange={(e) => setLocalData({...localData, hemoglobin: e.target.value})}
              placeholder="12"
              className="mt-1"
            />
          </div>
        </div>

        {/* BP */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs font-semibold text-slate-700">Systolic BP (mmHg)</Label>
            <Input
              type="number"
              value={localData.systolicBP}
              onChange={(e) => setLocalData({...localData, systolicBP: e.target.value})}
              placeholder="110"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs font-semibold text-slate-700">Diastolic BP (mmHg)</Label>
            <Input
              type="number"
              value={localData.diastolicBP}
              onChange={(e) => setLocalData({...localData, diastolicBP: e.target.value})}
              placeholder="70"
              className="mt-1"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 flex-1">
            <Save className="w-4 h-4 mr-2" />
            Save & Auto-Fill Calculators
          </Button>
          <Button onClick={handleClear} variant="outline" className="text-red-600 border-red-300">
            <Trash2 className="w-4 h-4 mr-2" />
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}