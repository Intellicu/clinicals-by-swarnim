import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { base44 } from "@/api/client";
import {
  Camera, Upload, FileText, Loader2, CheckCircle, AlertTriangle,
  Edit3, Scan, Image, RefreshCw
} from "lucide-react";
import { toast } from "sonner";

export default function OCRInputPanel({ onExtracted }) {
  const [mode, setMode] = useState(null); // 'upload' | 'camera'
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [extracted, setExtracted] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [rawText, setRawText] = useState("");
  const fileInputRef = useRef();
  const cameraInputRef = useRef();

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setExtracted(null);
    setRawText("");
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(f);
  };

  const runOCR = async () => {
    if (!file) { toast.error("No file selected"); return; }
    setLoading(true);
    setProgress("Uploading file...");
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setProgress("Extracting text via OCR...");
      const extractResult = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "object",
          properties: {
            raw_text: { type: "string", description: "All text extracted verbatim" },
            patient_name: { type: "string" },
            age_years: { type: "number", description: "Patient age in years" },
            gender: { type: "string" },
            weight_kg: { type: "number" },
            height_cm: { type: "number" },
            bp: { type: "string", description: "Blood pressure e.g. 110/70" },
            diagnosis: { type: "string", description: "Primary diagnosis if mentioned" },
            symptoms: { type: "string", description: "Symptoms and examination findings" },
            creatinine: { type: "number", description: "Serum creatinine in mg/dL" },
            urea: { type: "number" },
            albumin: { type: "number", description: "Serum albumin in g/dL" },
            urine_protein: { type: "string", description: "Urine protein result e.g. 3+" },
            haemoglobin: { type: "number", description: "Haemoglobin in g/dL" },
            sodium: { type: "number", description: "Serum sodium mEq/L" },
            potassium: { type: "number", description: "Serum potassium mEq/L" },
            cholesterol: { type: "number" },
            labs_summary: { type: "string", description: "All lab values as a text summary" },
            current_medications: { type: "string", description: "Current medications if any" },
            date: { type: "string", description: "Date of document if visible" }
          }
        }
      });

      setProgress("Processing with AI...");
      if (extractResult.status === "error") throw new Error(extractResult.details || "Extraction failed");

      const data = extractResult.output || {};
      setRawText(data.raw_text || "");

      // Build structured extracted object
      const mapped = {
        age: data.age_years ? String(data.age_years) : "",
        weight: data.weight_kg ? String(data.weight_kg) : "",
        height: data.height_cm ? String(data.height_cm) : "",
        bp: data.bp || "",
        creatinine: data.creatinine ? String(data.creatinine) : "",
        diagnosis: data.diagnosis || "",
        symptoms: [data.symptoms, data.current_medications ? `Medications: ${data.current_medications}` : ""].filter(Boolean).join("\n"),
        labs: [
          data.labs_summary,
          data.albumin ? `Albumin: ${data.albumin} g/dL` : "",
          data.urine_protein ? `Urine protein: ${data.urine_protein}` : "",
          data.haemoglobin ? `Hb: ${data.haemoglobin} g/dL` : "",
          data.sodium ? `Na: ${data.sodium} mEq/L` : "",
          data.potassium ? `K: ${data.potassium} mEq/L` : "",
          data.cholesterol ? `Cholesterol: ${data.cholesterol}` : "",
          data.creatinine ? `Creatinine: ${data.creatinine} mg/dL` : "",
        ].filter(Boolean).join(", "),
        source_file: file.name,
        patient_name: data.patient_name || "",
      };

      setExtracted(mapped);
      toast.success("OCR extraction complete — review and confirm below");
    } catch (err) {
      toast.error("OCR failed: " + err.message);
      // Fallback: let user enter raw text manually
      setEditMode(true);
    } finally {
      setLoading(false);
      setProgress("");
    }
  };

  const parseRawManually = async () => {
    if (!rawText.trim()) { toast.error("Enter some text first"); return; }
    setLoading(true);
    setProgress("Parsing with AI...");
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Extract clinical data from this text and return as JSON with these fields: age_years (number), weight_kg (number), height_cm (number), bp (string like "110/70"), creatinine (number in mg/dL), diagnosis (string), symptoms (string), labs_summary (string with all lab values), albumin (number), urine_protein (string).

Text:
${rawText}

Return ONLY valid JSON, no other text.`,
        response_json_schema: {
          type: "object",
          properties: {
            age_years: { type: "number" },
            weight_kg: { type: "number" },
            height_cm: { type: "number" },
            bp: { type: "string" },
            creatinine: { type: "number" },
            diagnosis: { type: "string" },
            symptoms: { type: "string" },
            labs_summary: { type: "string" },
            albumin: { type: "number" },
            urine_protein: { type: "string" }
          }
        }
      });
      const data = typeof result === "string" ? JSON.parse(result) : result;
      setExtracted({
        age: data.age_years ? String(data.age_years) : "",
        weight: data.weight_kg ? String(data.weight_kg) : "",
        height: data.height_cm ? String(data.height_cm) : "",
        bp: data.bp || "",
        creatinine: data.creatinine ? String(data.creatinine) : "",
        diagnosis: data.diagnosis || "",
        symptoms: data.symptoms || "",
        labs: [data.labs_summary, data.albumin ? `Albumin: ${data.albumin}` : "", data.urine_protein ? `Urine protein: ${data.urine_protein}` : ""].filter(Boolean).join(", "),
      });
      toast.success("Parsed successfully");
    } catch (err) {
      toast.error("Parse failed: " + err.message);
    } finally {
      setLoading(false);
      setProgress("");
    }
  };

  const handleAutoFill = () => {
    if (extracted) {
      onExtracted(extracted);
      toast.success("Patient data auto-filled into AI Prescriber");
    }
  };

  const updateField = (field, val) => setExtracted(prev => ({ ...prev, [field]: val }));

  return (
    <Card className="bg-white border-2 border-violet-200 shadow-md">
      <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50 border-b py-3 px-5">
        <CardTitle className="text-sm flex items-center gap-2">
          <Scan className="w-4 h-4 text-violet-600" />
          OCR Document Scanner
          <Badge className="ml-auto bg-violet-100 text-violet-800 text-xs">Upload PDF / Photo / Camera</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Mode selector */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => { setMode('upload'); fileInputRef.current?.click(); }}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs font-semibold transition-all
              ${mode === 'upload' ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-slate-200 hover:border-violet-300'}`}
          >
            <Upload className="w-5 h-5" />
            Upload File
            <span className="text-xs font-normal text-slate-500">PDF / JPG / PNG</span>
          </button>
          <button
            onClick={() => { setMode('camera'); cameraInputRef.current?.click(); }}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs font-semibold transition-all
              ${mode === 'camera' ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-slate-200 hover:border-violet-300'}`}
          >
            <Camera className="w-5 h-5" />
            Camera
            <span className="text-xs font-normal text-slate-500">Capture directly</span>
          </button>
          <button
            onClick={() => { setMode('manual'); setEditMode(true); }}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs font-semibold transition-all
              ${mode === 'manual' ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-slate-200 hover:border-violet-300'}`}
          >
            <Edit3 className="w-5 h-5" />
            Paste Text
            <span className="text-xs font-normal text-slate-500">Manual entry</span>
          </button>
        </div>

        {/* Hidden file inputs */}
        <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="hidden"
          onChange={e => handleFile(e.target.files[0])} />
        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden"
          onChange={e => handleFile(e.target.files[0])} />

        {/* File preview */}
        {file && !loading && (
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border">
            {preview && file.type.startsWith('image/') ? (
              <img src={preview} alt="preview" className="w-16 h-16 object-cover rounded-lg border" />
            ) : (
              <div className="w-16 h-16 bg-violet-100 rounded-lg flex items-center justify-center">
                <FileText className="w-7 h-7 text-violet-600" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{file.name}</p>
              <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(0)} KB</p>
            </div>
            {!extracted && (
              <Button onClick={runOCR} size="sm" className="bg-violet-600 hover:bg-violet-700 text-white shrink-0">
                <Scan className="w-3.5 h-3.5 mr-1" /> Extract
              </Button>
            )}
            {extracted && (
              <Button onClick={() => { setFile(null); setExtracted(null); setPreview(null); }} size="sm" variant="outline">
                <RefreshCw className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        )}

        {/* Manual text entry */}
        {editMode && mode === 'manual' && !extracted && (
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-600">Paste clinical text, lab report, or notes</Label>
            <Textarea value={rawText} onChange={e => setRawText(e.target.value)}
              placeholder="Paste any clinical text here — lab reports, OPD notes, discharge summaries..."
              className="text-sm min-h-[100px]" />
            <Button onClick={parseRawManually} disabled={!rawText.trim() || loading}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white text-sm">
              <Scan className="w-4 h-4 mr-1" /> Parse with AI
            </Button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center gap-3 p-4 bg-violet-50 rounded-lg border border-violet-200">
            <Loader2 className="w-5 h-5 text-violet-600 animate-spin shrink-0" />
            <div>
              <p className="text-sm font-semibold text-violet-800">{progress || "Processing..."}</p>
              <p className="text-xs text-violet-600">This may take 15–30 seconds</p>
            </div>
          </div>
        )}

        {/* Extracted data preview */}
        {extracted && !loading && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-700">Extraction Complete — Review & Edit Below</span>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 space-y-3">
              {extracted.patient_name && (
                <div>
                  <Label className="text-xs text-slate-600">Patient Name</Label>
                  <Input value={extracted.patient_name} onChange={e => updateField("patient_name", e.target.value)} className="mt-1 text-sm h-8" />
                </div>
              )}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { key: "age", label: "Age (yrs)" },
                  { key: "weight", label: "Weight (kg)" },
                  { key: "height", label: "Height (cm)" },
                  { key: "bp", label: "BP (mmHg)" },
                  { key: "creatinine", label: "Creatinine" },
                  { key: "diagnosis", label: "Diagnosis" },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <Label className="text-xs text-slate-600">{label}</Label>
                    <Input value={extracted[key] || ""} onChange={e => updateField(key, e.target.value)}
                      className="mt-1 text-sm h-8" />
                  </div>
                ))}
              </div>
              <div>
                <Label className="text-xs text-slate-600">Symptoms / Examination</Label>
                <Textarea value={extracted.symptoms || ""} onChange={e => updateField("symptoms", e.target.value)}
                  className="mt-1 text-sm min-h-[60px]" />
              </div>
              <div>
                <Label className="text-xs text-slate-600">Labs Summary</Label>
                <Textarea value={extracted.labs || ""} onChange={e => updateField("labs", e.target.value)}
                  className="mt-1 text-sm min-h-[50px]" />
              </div>
            </div>

            <Alert className="bg-amber-50 border-amber-200 py-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <AlertDescription className="text-xs text-amber-800">
                Verify extracted values before auto-filling. OCR may have errors with handwritten text.
              </AlertDescription>
            </Alert>

            <Button onClick={handleAutoFill}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-3">
              <CheckCircle className="w-4 h-4 mr-2" /> Auto-Fill AI Prescriber & Generate Pathway
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}