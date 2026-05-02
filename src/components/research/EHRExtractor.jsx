import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Upload, FileSpreadsheet, FilePlus2, Loader2, Download, CheckCircle2, AlertTriangle, Trash2, Clock, Eye, X, Brain } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

// Polyfill xlsx if not available
const getXLSX = () => {
  if (typeof XLSX !== "undefined") return XLSX;
  return null;
};

export default function EHRExtractor() {
  const [registryFile, setRegistryFile] = useState(null);       // the uploaded .xlsx
  const [registryColumns, setRegistryColumns] = useState([]);   // headers from xlsx
  const [registryRows, setRegistryRows] = useState([]);         // existing rows (last 3 shown)
  const [registryRaw, setRegistryRaw] = useState(null);         // raw workbook for re-export

  const [docFiles, setDocFiles] = useState([]);                  // PDF/image uploads (File objects)
  const [docUrls, setDocUrls] = useState([]);                    // after upload to storage

  const [extractedFields, setExtractedFields] = useState({});    // col -> value
  const [unmappedFindings, setUnmappedFindings] = useState([]);  // things found but no column match
  const [confidence, setConfidence] = useState({});              // col -> "high"|"medium"

  const [isExtracting, setIsExtracting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [sessionHistory, setSessionHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ehr_extractor_history") || "[]"); } catch { return []; }
  });
  const [showPreview, setShowPreview] = useState(false);

  const registryInputRef = useRef();
  const docInputRef = useRef();

  // ── STEP 1: Load registry xlsx ─────────────────────────────────────────────
  const loadRegistry = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      if (!json || json.length === 0) { toast.error("Could not read sheet"); return; }
      const headers = json[0].map(String).filter(Boolean);
      const rows = json.slice(1).filter(r => r.some(c => c !== undefined && c !== ""));
      setRegistryColumns(headers);
      setRegistryRows(rows);
      setRegistryRaw(workbook);
      setRegistryFile(file);
      // Initialise extracted fields
      const init = {};
      const conf = {};
      headers.forEach(h => { init[h] = ""; conf[h] = ""; });
      setExtractedFields(init);
      setConfidence(conf);
      toast.success(`Registry loaded — ${headers.length} columns, ${rows.length} existing rows`);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleRegistryDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) loadRegistry(file);
  };

  // ── STEP 2: Upload patient documents ──────────────────────────────────────
  const handleDocFiles = async (files) => {
    const arr = Array.from(files);
    setDocFiles(prev => [...prev, ...arr]);
    setIsUploading(true);
    const newUrls = [];
    for (const f of arr) {
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
        newUrls.push(file_url);
        toast.success(`Uploaded: ${f.name}`);
      } catch {
        toast.error(`Failed to upload: ${f.name}`);
      }
    }
    setDocUrls(prev => [...prev, ...newUrls]);
    setIsUploading(false);
  };

  const removeDoc = (index) => {
    setDocFiles(prev => prev.filter((_, i) => i !== index));
    setDocUrls(prev => prev.filter((_, i) => i !== index));
  };

  // ── STEP 3: Extract ────────────────────────────────────────────────────────
  const extract = async () => {
    if (docUrls.length === 0) { toast.error("Upload at least one document first"); return; }
    if (registryColumns.length === 0) { toast.error("Load the registry Excel file first"); return; }
    setIsExtracting(true);
    try {
      const columnList = registryColumns.join(" | ");
      const contextRows = registryRows.slice(-3).map(r =>
        registryColumns.map((col, i) => `${col}: ${r[i] ?? ""}`).join(", ")
      ).join("\n");

      const prompt = `You are a clinical data extraction AI assistant for a medical research registry. 

REGISTRY COLUMNS (these are the EXACT column names from the researcher's Excel sheet — map values to these columns ONLY):
${columnList}

EXISTING REGISTRY ROWS (last 3 rows for context/format reference):
${contextRows || "No existing rows yet."}

PATIENT DOCUMENTS: The attached file(s) contain biopsy reports, discharge summaries, lab reports, and/or clinical notes.

TASK:
1. Extract ALL clinical values from the documents.
2. Map each extracted value to the most appropriate registry column name above.
3. For each mapped value, rate your confidence: "high" (clearly stated) or "medium" (inferred/calculated).
4. List any clinical findings you found in the documents that do NOT map to any registry column — these go in "unmapped_findings".
5. Format dates as DD/MM/YYYY. Format numbers without units unless the column name implies units.

Respond ONLY with a valid JSON object with this exact structure:
{
  "mapped_fields": {
    "ColumnName1": {"value": "extracted_value", "confidence": "high"},
    "ColumnName2": {"value": "another_value", "confidence": "medium"}
  },
  "unmapped_findings": [
    "Finding 1: description",
    "Finding 2: description"
  ]
}

Use ONLY the exact column names from the registry. Do not create new column names.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        file_urls: docUrls,
        response_json_schema: {
          type: "object",
          properties: {
            mapped_fields: { type: "object" },
            unmapped_findings: { type: "array", items: { type: "string" } }
          }
        },
        model: "claude_sonnet_4_6"
      });

      // Populate fields
      const newFields = { ...extractedFields };
      const newConf = { ...confidence };
      if (result.mapped_fields) {
        Object.entries(result.mapped_fields).forEach(([col, obj]) => {
          if (registryColumns.includes(col)) {
            newFields[col] = obj.value || "";
            newConf[col] = obj.confidence || "medium";
          }
        });
      }
      setExtractedFields(newFields);
      setConfidence(newConf);
      setUnmappedFindings(result.unmapped_findings || []);
      setShowPreview(true);
      toast.success("Extraction complete — review all fields before saving");
    } catch (e) {
      console.error(e);
      toast.error("Extraction failed — check document format and try again");
    } finally {
      setIsExtracting(false);
    }
  };

  // ── STEP 4: Save & Download ────────────────────────────────────────────────
  const downloadUpdated = () => {
    if (!registryRaw) { toast.error("No registry loaded"); return; }
    const wb = registryRaw;
    const ws = wb.Sheets[wb.SheetNames[0]];
    const newRow = registryColumns.map(col => extractedFields[col] || "");
    const existing = XLSX.utils.sheet_to_json(ws, { header: 1 });
    existing.push(newRow);
    const newWs = XLSX.utils.aoa_to_sheet(existing);
    wb.Sheets[wb.SheetNames[0]] = newWs;
    XLSX.writeFile(wb, `Updated_Registry_${new Date().toISOString().split("T")[0]}.xlsx`);

    // Save to session history
    const session = {
      id: Date.now(),
      date: new Date().toLocaleString(),
      docNames: docFiles.map(f => f.name),
      fields: { ...extractedFields },
      unmapped: unmappedFindings,
    };
    const history = [session, ...sessionHistory.slice(0, 9)];
    setSessionHistory(history);
    localStorage.setItem("ehr_extractor_history", JSON.stringify(history));
    toast.success("Updated registry downloaded!");
  };

  const loadSession = (session) => {
    if (registryColumns.length === 0) { toast.error("Load the registry Excel first, then the session will auto-fill"); return; }
    setExtractedFields({ ...extractedFields, ...session.fields });
    setUnmappedFindings(session.unmapped || []);
    setShowPreview(true);
    toast.info("Session loaded");
  };

  const highCount = Object.values(confidence).filter(c => c === "high").length;
  const medCount = Object.values(confidence).filter(c => c === "medium").length;
  const filledCount = Object.values(extractedFields).filter(v => v).length;

  return (
    <div className="grid lg:grid-cols-4 gap-4">
      {/* Sidebar: Session History */}
      <div className="lg:col-span-1 space-y-3">
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-2 border-b bg-slate-50">
            <CardTitle className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <Clock className="w-3 h-3" />Session History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 space-y-1">
            {sessionHistory.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-4">No sessions yet</p>
            )}
            {sessionHistory.map(s => (
              <button key={s.id} onClick={() => loadSession(s)}
                className="w-full text-left p-2 rounded border text-xs hover:bg-slate-50 hover:border-indigo-300 transition-all">
                <p className="font-semibold text-slate-700 truncate">{s.docNames[0] || "Session"}</p>
                <p className="text-slate-400">{s.date}</p>
                <p className="text-indigo-600">{Object.values(s.fields).filter(v=>v).length} fields extracted</p>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Registry Preview */}
        {registryRows.length > 0 && (
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-2 border-b bg-slate-50">
              <CardTitle className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Eye className="w-3 h-3" />Last 3 Registry Rows
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="overflow-x-auto">
                <table className="text-xs w-full">
                  <thead>
                    <tr>{registryColumns.slice(0, 4).map(c => <th key={c} className="px-1 py-0.5 text-left text-slate-500 truncate max-w-[60px]">{c.substring(0,8)}</th>)}</tr>
                  </thead>
                  <tbody>
                    {registryRows.slice(-3).map((row, i) => (
                      <tr key={i} className="border-t">
                        {row.slice(0, 4).map((cell, j) => <td key={j} className="px-1 py-0.5 truncate max-w-[60px] text-slate-700">{String(cell ?? "").substring(0,10)}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Main Panel */}
      <div className="lg:col-span-3 space-y-4">
        <Alert className="bg-indigo-50 border-indigo-200">
          <Brain className="w-4 h-4 text-indigo-600" />
          <AlertDescription className="text-xs text-indigo-900">
            <strong>NLP + EHR Extractor</strong> — Load your registry Excel, upload patient documents (biopsy, labs, discharge summary), and let AI map every clinical value to your registry columns. Teal = high confidence; amber = verify manually.
          </AlertDescription>
        </Alert>

        {/* Step 1: Registry */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-2 border-b bg-slate-50">
            <CardTitle className="text-xs font-bold text-slate-700 flex items-center gap-2">
              <span className="w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
              Load Registry Excel
              {registryFile && <Badge className="bg-green-100 text-green-800 text-xs ml-auto">✓ {registryColumns.length} columns loaded</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div
              onDrop={handleRegistryDrop} onDragOver={e => e.preventDefault()}
              onClick={() => registryInputRef.current.click()}
              className="border-2 border-dashed border-indigo-300 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all">
              <FileSpreadsheet className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">{registryFile ? registryFile.name : "Drop your registry .xlsx here or click to browse"}</p>
              <p className="text-xs text-slate-400 mt-1">Supports .xlsx and .xls — first row must be column headers</p>
            </div>
            <input ref={registryInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={e => e.target.files[0] && loadRegistry(e.target.files[0])} />
            {registryColumns.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {registryColumns.map(c => <Badge key={c} variant="outline" className="text-xs">{c}</Badge>)}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Upload Documents */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-2 border-b bg-slate-50">
            <CardTitle className="text-xs font-bold text-slate-700 flex items-center gap-2">
              <span className="w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
              Upload Patient Documents
              {docFiles.length > 0 && <Badge className="bg-blue-100 text-blue-800 text-xs ml-auto">{docFiles.length} file(s)</Badge>}
              {isUploading && <Loader2 className="w-3 h-3 animate-spin text-indigo-500" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div
              onClick={() => docInputRef.current.click()}
              className="border-2 border-dashed border-blue-300 rounded-xl p-5 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all">
              <FilePlus2 className="w-7 h-7 text-blue-400 mx-auto mb-1" />
              <p className="text-sm font-medium text-slate-700">Drop biopsy reports, lab PDFs, or discharge summaries</p>
              <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG — multiple files for same patient supported</p>
            </div>
            <input ref={docInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" multiple className="hidden" onChange={e => handleDocFiles(e.target.files)} />
            {docFiles.map((f, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded border text-xs">
                <span className="font-medium text-slate-700">{f.name}</span>
                <div className="flex items-center gap-2">
                  {docUrls[i] ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />}
                  <button onClick={() => removeDoc(i)} className="text-slate-400 hover:text-red-500"><X className="w-3 h-3" /></button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Step 3: Extract Button */}
        <Button
          onClick={extract}
          disabled={isExtracting || docUrls.length === 0 || registryColumns.length === 0}
          className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-base font-semibold">
          {isExtracting
            ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Extracting with AI — please wait...</>
            : <><Brain className="w-5 h-5 mr-2" />Step 3 — Extract &amp; Map to Registry Columns</>}
        </Button>

        {/* Unmapped Findings Banner */}
        {unmappedFindings.length > 0 && (
          <Alert className="bg-amber-50 border-amber-300 border-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <AlertDescription>
              <p className="font-semibold text-amber-900 text-sm mb-1">{unmappedFindings.length} clinical findings found but not mapped to any registry column:</p>
              <ul className="list-disc list-inside space-y-0.5">
                {unmappedFindings.map((f, i) => <li key={i} className="text-xs text-amber-800">{f}</li>)}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Step 4: Review & Download */}
        {showPreview && registryColumns.length > 0 && (
          <Card className="bg-white shadow-sm border-2 border-indigo-200">
            <CardHeader className="pb-2 border-b bg-indigo-50">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-xs font-bold text-indigo-900 flex items-center gap-2">
                  <span className="w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                  Review &amp; Edit Extracted Fields
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className="bg-teal-100 text-teal-800 text-xs">{highCount} high confidence</Badge>
                  <Badge className="bg-amber-100 text-amber-800 text-xs">{medCount} verify manually</Badge>
                  <Badge className="bg-slate-100 text-slate-700 text-xs">{filledCount}/{registryColumns.length} filled</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[500px] overflow-y-auto pr-1">
                {registryColumns.map(col => {
                  const conf = confidence[col];
                  const val = extractedFields[col];
                  const borderClass = conf === "high" ? "border-teal-400 bg-teal-50"
                    : conf === "medium" ? "border-amber-400 bg-amber-50"
                    : "border-slate-200 bg-white";
                  return (
                    <div key={col} className={`rounded border-2 ${borderClass} p-2`}>
                      <label className="text-xs font-semibold text-slate-600 block truncate mb-1">{col}</label>
                      <input
                        value={val || ""}
                        onChange={e => setExtractedFields(prev => ({ ...prev, [col]: e.target.value }))}
                        placeholder="—"
                        className="w-full text-xs border rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300"
                      />
                      {conf && (
                        <span className={`text-xs mt-0.5 block ${conf === "high" ? "text-teal-700" : "text-amber-700"}`}>
                          {conf === "high" ? "✓ High confidence" : "⚠ Verify"}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              <Button onClick={downloadUpdated} className="w-full mt-4 bg-green-600 hover:bg-green-700">
                <Download className="w-4 h-4 mr-2" />Download Updated Registry (.xlsx with new row appended)
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}