import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Download, FileText, Table, Users, CheckSquare, Square } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

function patientToRows(patient, history = [], appointments = []) {
  return {
    id: patient.id,
    cr_number: patient.cr_number || "",
    patient_name: patient.patient_name || "",
    mobile: patient.mobile_number || "",
    dob: patient.date_of_birth || "",
    age: patient.age_years || "",
    gender: patient.gender || "",
    guardian: patient.guardian_name || "",
    address: patient.address || "",
    diagnosis: patient.diagnosis || "",
    status: patient.status || "",
    comorbidities: (patient.comorbidities || []).join("; "),
    allergies: (patient.allergies || []).join("; "),
    medications: (patient.current_medications || []).join("; "),
    height_cm: patient.baseline_vitals?.height || "",
    weight_kg: patient.baseline_vitals?.weight || "",
    bmi: patient.baseline_vitals?.bmi || "",
    blood_group: patient.baseline_vitals?.blood_group || "",
    notes: patient.notes || "",
    history_count: history.length,
    appointments_count: appointments.length,
    created_date: patient.created_date ? format(new Date(patient.created_date), "dd/MM/yyyy") : "",
  };
}

function toCSV(rows) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [headers.join(","), ...rows.map(r => headers.map(h => escape(r[h])).join(","))].join("\n");
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

function generateHTMLReport(patients, historyMap, apptMap) {
  const now = format(new Date(), "dd MMM yyyy HH:mm");
  const patientSections = patients.map(p => {
    const history = historyMap[p.id] || [];
    const appts = apptMap[p.id] || [];
    const sortedHistory = [...history].sort((a, b) => new Date(b.entry_date) - new Date(a.entry_date));
    const sortedAppts = [...appts].sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date));
    return `
      <div class="patient-block">
        <h2>${p.patient_name} <span class="cr">CR: ${p.cr_number}</span></h2>
        <div class="meta-grid">
          <div><b>Age:</b> ${p.age_years || "—"} yrs</div>
          <div><b>Gender:</b> ${p.gender || "—"}</div>
          <div><b>Status:</b> <span class="badge status-${(p.status||"").toLowerCase().replace(" ", "-")}">${p.status || "—"}</span></div>
          <div><b>Mobile:</b> ${p.mobile_number || "—"}</div>
          <div><b>Guardian:</b> ${p.guardian_name || "—"}</div>
          <div><b>Blood Group:</b> ${p.baseline_vitals?.blood_group || "—"}</div>
        </div>
        <div class="section-label">Primary Diagnosis</div>
        <p>${p.diagnosis || "Not specified"}</p>
        ${p.comorbidities?.length ? `<div class="section-label">Comorbidities</div><p>${p.comorbidities.join(", ")}</p>` : ""}
        ${p.allergies?.length ? `<div class="section-label">Allergies</div><p class="allergy">${p.allergies.join(", ")}</p>` : ""}
        ${p.current_medications?.length ? `<div class="section-label">Current Medications</div><p>${p.current_medications.join(", ")}</p>` : ""}

        <div class="section-label">Baseline Vitals</div>
        <table class="vitals-table"><tr>
          <td><b>Height</b><br/>${p.baseline_vitals?.height ? p.baseline_vitals.height + " cm" : "—"}</td>
          <td><b>Weight</b><br/>${p.baseline_vitals?.weight ? p.baseline_vitals.weight + " kg" : "—"}</td>
          <td><b>BMI</b><br/>${p.baseline_vitals?.bmi || "—"}</td>
        </tr></table>

        ${sortedHistory.length ? `
        <div class="section-label">Medical History (${sortedHistory.length} entries)</div>
        <table class="history-table">
          <thead><tr><th>Date</th><th>Type</th><th>Title</th><th>Details</th><th>Outcome</th></tr></thead>
          <tbody>${sortedHistory.map(h => `<tr>
            <td>${h.entry_date ? format(new Date(h.entry_date), "dd MMM yyyy") : "—"}</td>
            <td>${h.entry_type}</td>
            <td>${h.title}</td>
            <td>${h.description || ""}</td>
            <td>${h.outcome || ""}</td>
          </tr>`).join("")}</tbody>
        </table>` : ""}

        ${sortedAppts.length ? `
        <div class="section-label">Appointments (${sortedAppts.length})</div>
        <table class="history-table">
          <thead><tr><th>Date</th><th>Type</th><th>Doctor</th><th>Status</th><th>Complaint</th></tr></thead>
          <tbody>${sortedAppts.map(a => `<tr>
            <td>${a.appointment_date ? format(new Date(a.appointment_date), "dd MMM yyyy HH:mm") : "—"}</td>
            <td>${a.appointment_type}</td>
            <td>${a.doctor_name || "—"}</td>
            <td>${a.status}</td>
            <td>${a.chief_complaint || ""}</td>
          </tr>`).join("")}</tbody>
        </table>` : ""}

        ${p.notes ? `<div class="section-label">Notes</div><p class="notes">${p.notes}</p>` : ""}
      </div>`;
  }).join("");

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/>
<title>Patient Export — CliniCals</title>
<style>
  body { font-family: Arial, sans-serif; font-size: 12px; color: #1e293b; margin: 20px; }
  h1 { color: #1d4ed8; border-bottom: 2px solid #1d4ed8; padding-bottom: 8px; }
  .patient-block { page-break-after: always; margin-bottom: 40px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; }
  h2 { color: #1e3a5f; margin-bottom: 8px; } .cr { font-size: 11px; color: #64748b; font-weight: normal; margin-left: 8px; }
  .meta-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; background: #f8fafc; padding: 8px; border-radius: 6px; margin-bottom: 10px; }
  .section-label { font-weight: bold; font-size: 11px; text-transform: uppercase; color: #64748b; margin: 10px 0 4px; letter-spacing: 0.05em; }
  .history-table, .vitals-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; font-size: 11px; }
  .history-table th, .history-table td { border: 1px solid #e2e8f0; padding: 4px 6px; text-align: left; }
  .history-table th { background: #f1f5f9; font-weight: bold; }
  .vitals-table td { border: 1px solid #e2e8f0; padding: 6px 10px; text-align: center; background: #f8fafc; }
  .allergy { color: #dc2626; } .notes { color: #475569; font-style: italic; }
  .badge { padding: 1px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; }
  .status-active { background: #dcfce7; color: #166534; }
  .status-follow-up { background: #dbeafe; color: #1e40af; }
  .status-discharged { background: #f1f5f9; color: #475569; }
  .footer { color: #94a3b8; font-size: 10px; margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 8px; }
</style>
</head><body>
<h1>CliniCals — Patient Export Report</h1>
<p style="color:#64748b;font-size:11px;">Generated: ${now} · ${patients.length} patient(s)</p>
${patientSections}
<div class="footer">Exported from CliniCals by Swarnim · Confidential — For clinical use only</div>
</body></html>`;
}

export default function PatientExport({ patients: allPatients }) {
  const [selected, setSelected] = useState(new Set());
  const [exporting, setExporting] = useState(false);
  const [includeHistory, setIncludeHistory] = useState(true);
  const [includeAppointments, setIncludeAppointments] = useState(true);

  const toggleAll = () => {
    if (selected.size === allPatients.length) setSelected(new Set());
    else setSelected(new Set(allPatients.map(p => p.id)));
  };

  const toggleOne = (id) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };

  const chosenPatients = allPatients.filter(p => selected.has(p.id));

  const doExportCSV = async () => {
    if (!chosenPatients.length) { toast.error("Select at least one patient"); return; }
    setExporting(true);
    const historyMap = {};
    const apptMap = {};
    if (includeHistory) {
      for (const p of chosenPatients) {
        historyMap[p.id] = await base44.entities.MedicalHistoryEntry.filter({ patient_id: p.id }, "-entry_date", 200).catch(() => []);
      }
    }
    if (includeAppointments) {
      for (const p of chosenPatients) {
        apptMap[p.id] = await base44.entities.Appointment.filter({ patient_id: p.id }, "-appointment_date", 100).catch(() => []);
      }
    }
    const rows = chosenPatients.map(p => patientToRows(p, historyMap[p.id] || [], apptMap[p.id] || []));
    const csv = toCSV(rows);
    downloadFile(csv, `clinicals-patients-${format(new Date(), "yyyyMMdd")}.csv`, "text/csv");
    toast.success(`Exported ${chosenPatients.length} patient(s) as CSV`);
    setExporting(false);
  };

  const doExportPDF = async () => {
    if (!chosenPatients.length) { toast.error("Select at least one patient"); return; }
    setExporting(true);
    const historyMap = {};
    const apptMap = {};
    if (includeHistory) {
      for (const p of chosenPatients) {
        historyMap[p.id] = await base44.entities.MedicalHistoryEntry.filter({ patient_id: p.id }, "-entry_date", 200).catch(() => []);
      }
    }
    if (includeAppointments) {
      for (const p of chosenPatients) {
        apptMap[p.id] = await base44.entities.Appointment.filter({ patient_id: p.id }, "-appointment_date", 100).catch(() => []);
      }
    }
    const html = generateHTMLReport(chosenPatients, historyMap, apptMap);
    // Open in new window for printing to PDF
    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 500);
    toast.success(`${chosenPatients.length} patient(s) ready to print/save as PDF`);
    setExporting(false);
  };

  return (
    <div className="space-y-4">
      {/* Options */}
      <Card className="bg-white shadow-sm border">
        <CardHeader className="pb-2 bg-slate-50 border-b">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2"><Download className="w-4 h-4" />Export Options</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Checkbox id="hist" checked={includeHistory} onCheckedChange={setIncludeHistory} />
              <Label htmlFor="hist" className="text-sm">Include Medical History</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="appt" checked={includeAppointments} onCheckedChange={setIncludeAppointments} />
              <Label htmlFor="appt" className="text-sm">Include Appointments</Label>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <Button onClick={doExportCSV} disabled={exporting || !selected.size} className="bg-green-600 hover:bg-green-700">
              <Table className="w-4 h-4 mr-2" />{exporting ? "Exporting…" : `Export CSV (${selected.size})`}
            </Button>
            <Button onClick={doExportPDF} disabled={exporting || !selected.size} variant="outline" className="border-slate-300">
              <FileText className="w-4 h-4 mr-2" />{exporting ? "Generating…" : `Export PDF (${selected.size})`}
            </Button>
          </div>
          {!selected.size && <p className="text-xs text-slate-400">Select patients below to export</p>}
        </CardContent>
      </Card>

      {/* Patient Selection */}
      <Card className="bg-white shadow-sm border">
        <CardHeader className="pb-2 bg-slate-50 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2"><Users className="w-4 h-4" />Select Patients</CardTitle>
            <Button size="sm" variant="outline" onClick={toggleAll} className="text-xs h-7">
              {selected.size === allPatients.length ? <><CheckSquare className="w-3 h-3 mr-1" />Deselect All</> : <><Square className="w-3 h-3 mr-1" />Select All</>}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-2">
          {allPatients.map(p => (
            <div key={p.id} className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${selected.has(p.id) ? "bg-blue-50 border-blue-300" : "bg-white border-slate-200 hover:bg-slate-50"}`}
              onClick={() => toggleOne(p.id)}>
              <Checkbox checked={selected.has(p.id)} onCheckedChange={() => toggleOne(p.id)} onClick={e => e.stopPropagation()} />
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-xs flex-shrink-0">
                {(p.patient_name || "?")[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-slate-900">{p.patient_name}</div>
                <div className="text-xs text-slate-500 flex gap-2 flex-wrap">
                  <span>CR: {p.cr_number}</span>
                  {p.diagnosis && <span>{p.diagnosis}</span>}
                  {p.age_years && <span>{p.age_years}y</span>}
                </div>
              </div>
              <Badge className={`text-xs flex-shrink-0 ${p.status === "Active" ? "bg-green-100 text-green-800" : p.status === "Follow-up" ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-700"}`}>
                {p.status || "Active"}
              </Badge>
            </div>
          ))}
          {allPatients.length === 0 && <p className="text-sm text-slate-400 text-center py-4">No patients found</p>}
        </CardContent>
      </Card>
    </div>
  );
}