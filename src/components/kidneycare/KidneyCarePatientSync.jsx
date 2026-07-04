import React, { useState } from "react";
import { base44 } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Search, QrCode, Phone, FileText, User, Activity, Loader2, X, ExternalLink, RefreshCw, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

export default function KidneyCarePatientSync({ onPatientLoaded }) {
  const [searchMode, setSearchMode] = useState("mobile"); // "mobile" | "cr" | "qr"
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [patient, setPatient] = useState(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  const handleSearch = async () => {
    if (!searchValue.trim()) { toast.error("Enter a value to search"); return; }
    setLoading(true);
    setError("");
    setPatient(null);
    try {
      let results = [];
      if (searchMode === "mobile") {
        results = await base44.entities.Patient.filter({ phone: searchValue.trim() });
      } else if (searchMode === "cr") {
        results = await base44.entities.Patient.filter({ cr_number: searchValue.trim() });
        if (!results.length) {
          // Also try patient_id field
          results = await base44.entities.Patient.filter({ patient_id: searchValue.trim() });
        }
      }

      if (results.length === 0) {
        setError("No patient found with that " + (searchMode === "mobile" ? "mobile number" : "CR number") + ". Check the KidneyCare app registration.");
      } else {
        const p = results[0];
        setPatient(p);
        onPatientLoaded?.(p);
        toast.success(`Patient found: ${p.full_name || p.name || "Unknown"}`);
      }
    } catch (e) {
      setError("Search failed. Please try again.");
    }
    setLoading(false);
  };

  const handleQRScan = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: "Extract the patient identifier from this QR code image. Return the mobile number, CR number, or patient ID visible in the QR code. Return ONLY the identifier value, nothing else.",
        file_urls: [file_url],
        response_json_schema: { type: "object", properties: { identifier: { type: "string" }, type: { type: "string", enum: ["mobile", "cr_number", "patient_id"] } } }
      });
      if (result?.identifier) {
        setSearchValue(result.identifier);
        setSearchMode(result.type === "mobile" ? "mobile" : "cr");
        toast.info(`QR decoded: ${result.identifier} — tap Search`);
      } else {
        setError("Could not read QR code. Try entering manually.");
      }
    } catch {
      setError("QR scan failed. Please enter manually.");
    }
    setLoading(false);
    e.target.value = "";
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-3 bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl px-4 py-3 text-white shadow-sm hover:opacity-95 active:scale-98 transition-all">
        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
          <Activity className="w-4 h-4 text-white" />
        </div>
        <div className="text-left flex-1">
          <p className="text-sm font-bold">KidneyCare Patient Sync</p>
          <p className="text-teal-100 text-xs">Scan QR or search by mobile / CR number</p>
        </div>
        <Search className="w-4 h-4 text-teal-200" />
      </button>
    );
  }

  return (
    <div className="bg-white rounded-xl border-2 border-teal-300 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-white" />
          <p className="text-white font-bold text-sm">KidneyCare Patient Sync</p>
        </div>
        <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Mode selector */}
        <div className="flex gap-1.5">
          {[
            { id: "mobile", label: "📱 Mobile", icon: Phone },
            { id: "cr", label: "🪪 CR No.", icon: FileText },
            { id: "qr", label: "📷 QR Scan", icon: QrCode },
          ].map(m => (
            <button key={m.id} onClick={() => { setSearchMode(m.id); setSearchValue(""); setError(""); setPatient(null); }}
              className={`flex-1 text-xs py-2 px-2 rounded-lg font-semibold border transition-all ${searchMode === m.id ? "bg-teal-600 text-white border-teal-600" : "bg-white text-slate-600 border-slate-200 hover:border-teal-300"}`}>
              {m.label}
            </button>
          ))}
        </div>

        {/* Input */}
        {searchMode !== "qr" ? (
          <div className="flex gap-2">
            <Input
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              placeholder={searchMode === "mobile" ? "Enter mobile number (e.g. 9876543210)" : "Enter CR / Patient ID"}
              className="flex-1 text-sm"
            />
            <Button onClick={handleSearch} disabled={loading} className="bg-teal-600 hover:bg-teal-700 text-white px-4">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <label className="cursor-pointer">
              <input type="file" accept="image/*" capture="environment" onChange={handleQRScan} className="hidden" />
              <div className="border-2 border-dashed border-teal-300 rounded-xl p-6 hover:bg-teal-50 transition-colors">
                {loading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
                    <p className="text-sm text-teal-700">Reading QR code...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <QrCode className="w-10 h-10 text-teal-500" />
                    <p className="text-sm font-semibold text-teal-700">Tap to scan patient QR code</p>
                    <p className="text-xs text-slate-400">From KidneyCare patient card</p>
                  </div>
                )}
              </div>
            </label>
          </div>
        )}

        {error && (
          <Alert className="bg-amber-50 border-amber-200 py-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <AlertDescription className="text-amber-700 text-xs">{error}</AlertDescription>
          </Alert>
        )}

        {/* Patient card */}
        {patient && (
          <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-xl p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 text-sm">{patient.full_name || patient.name || "Patient"}</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {patient.age && <Badge className="bg-blue-100 text-blue-700 text-xs">{patient.age}y</Badge>}
                  {patient.gender && <Badge className="bg-pink-100 text-pink-700 text-xs">{patient.gender}</Badge>}
                  {patient.diagnosis && <Badge className="bg-teal-100 text-teal-700 text-xs">{patient.diagnosis}</Badge>}
                </div>
                {patient.phone && <p className="text-xs text-slate-500 mt-1">📱 {patient.phone}</p>}
                {(patient.cr_number || patient.patient_id) && (
                  <p className="text-xs text-slate-500">🪪 CR: {patient.cr_number || patient.patient_id}</p>
                )}
              </div>
            </div>

            {/* Monitoring summary if available */}
            {patient.monitoring_summary && (
              <div className="bg-white rounded-lg border border-teal-200 p-3">
                <p className="text-xs font-bold text-teal-700 mb-1">📊 Monitoring Summary</p>
                <p className="text-xs text-slate-700 whitespace-pre-wrap">{
                  typeof patient.monitoring_summary === "object"
                    ? JSON.stringify(patient.monitoring_summary, null, 2)
                    : patient.monitoring_summary
                }</p>
              </div>
            )}

            <div className="flex gap-2">
              <Link to={createPageUrl("KidneyCarealertInbox") + `?patient=${patient.id}`} className="flex-1">
                <Button size="sm" variant="outline" className="w-full text-xs border-teal-300 text-teal-700 hover:bg-teal-50">
                  <Activity className="w-3.5 h-3.5 mr-1" /> Monitoring Alerts
                </Button>
              </Link>
              <Link to={createPageUrl("PatientCockpit") + `?id=${patient.id}`} className="flex-1">
                <Button size="sm" className="w-full text-xs bg-teal-600 hover:bg-teal-700 text-white">
                  <ExternalLink className="w-3.5 h-3.5 mr-1" /> Full Record
                </Button>
              </Link>
            </div>
          </div>
        )}

        <p className="text-xs text-slate-400 text-center">
          Pulls records from KidneyCare patient registry. Patient must be registered in KidneyCare app.
        </p>
      </div>
    </div>
  );
}