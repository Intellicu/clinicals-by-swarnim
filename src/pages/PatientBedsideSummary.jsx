import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Search, User, FlaskConical, Activity, AlertTriangle,
  TrendingUp, TrendingDown, Minus, Calendar, Pill, BookOpen,
  Heart, Droplets, ChevronRight
} from "lucide-react";
import StickyToolNav from "../components/StickyToolNav";

const LAB_CRITICAL = {
  "Potassium": { low: 2.5, high: 6.5 },
  "Sodium": { low: 125, high: 155 },
  "Creatinine": { high: 10 },
  "pH": { low: 7.2, high: 7.55 },
  "Bicarbonate": { low: 12, high: 36 },
  "Haemoglobin": { low: 6 },
  "WBC": { high: 20 },
  "Platelets": { low: 50 },
};

function getTrend(val, status) {
  if (status === "High" || status === "Critical High") return { icon: TrendingUp, color: "text-red-600" };
  if (status === "Low" || status === "Critical Low") return { icon: TrendingDown, color: "text-amber-600" };
  return { icon: Minus, color: "text-green-600" };
}

function getStatusColor(status) {
  if (status === "Critical High" || status === "Critical Low") return "bg-red-100 text-red-800 border-red-300";
  if (status === "High" || status === "Low") return "bg-amber-100 text-amber-800 border-amber-200";
  return "bg-green-100 text-green-800 border-green-200";
}

function LabParamRow({ param }) {
  const { icon: TrendIcon, color } = getTrend(param.value, param.status);
  const isCritical = param.status?.includes("Critical");
  return (
    <div className={`flex items-center justify-between px-3 py-2 rounded-lg border ${isCritical ? "bg-red-50 border-red-300" : "bg-white border-slate-100"}`}>
      <div className="flex items-center gap-2">
        <TrendIcon className={`w-3.5 h-3.5 flex-shrink-0 ${color}`} />
        <span className="text-sm font-medium text-slate-800">{param.name}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-slate-900">{param.value} <span className="text-xs font-normal text-slate-500">{param.unit}</span></span>
        {param.status && param.status !== "Normal" && (
          <Badge className={`text-xs border ${getStatusColor(param.status)}`}>{param.status}</Badge>
        )}
      </div>
    </div>
  );
}

export default function PatientBedsideSummary() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);

  const { data: patients = [], isLoading: pLoading } = useQuery({
    queryKey: ["patients-bedside"],
    queryFn: () => base44.entities.Patient.list("-updated_date", 200),
  });

  const { data: labResults = [], isLoading: labLoading } = useQuery({
    queryKey: ["labs-bedside", selectedPatient?.id],
    queryFn: () => base44.entities.LabResult.filter({ patient_id: selectedPatient.id }, "-test_date", 10),
    enabled: !!selectedPatient,
  });

  const { data: encounters = [] } = useQuery({
    queryKey: ["encounters-bedside", selectedPatient?.id],
    queryFn: () => base44.entities.ClinicalEncounter.filter({ patient_id: selectedPatient.id }, "-encounter_date", 5),
    enabled: !!selectedPatient,
  });

  const { data: prescriptions = [] } = useQuery({
    queryKey: ["rx-bedside", selectedPatient?.id],
    queryFn: () => base44.entities.Prescription.filter({ patient_id: selectedPatient.id }, "-prescription_date", 3),
    enabled: !!selectedPatient,
  });

  const filteredPatients = useMemo(() => {
    if (!searchQuery) return patients.slice(0, 20);
    const q = searchQuery.toLowerCase();
    return patients.filter(p =>
      p.patient_name?.toLowerCase().includes(q) ||
      p.cr_number?.toLowerCase().includes(q) ||
      p.diagnosis?.toLowerCase().includes(q)
    ).slice(0, 20);
  }, [patients, searchQuery]);

  // Most recent lab result
  const latestLab = labResults[0];
  const allParams = latestLab?.parameters || [];
  const abnormalParams = allParams.filter(p => p.status && p.status !== "Normal");
  const normalParams = allParams.filter(p => !p.status || p.status === "Normal");

  // Active medications from most recent prescription
  const activeMeds = prescriptions[0]?.medications?.filter(m => m.active !== false) || [];

  // Age calculation
  const ageDisplay = selectedPatient?.age_years
    ? `${selectedPatient.age_years} yr`
    : selectedPatient?.date_of_birth
      ? `${Math.floor((Date.now() - new Date(selectedPatient.date_of_birth)) / 31557600000)} yr`
      : "—";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <StickyToolNav />
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-4">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 rounded-2xl p-5 text-white shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Bedside Summary</h1>
              <p className="text-blue-100 text-xs">Compact patient overview · Labs · Active pathways · Medications</p>
            </div>
          </div>
        </div>

        {/* Patient search */}
        <Card className="bg-white border border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setSelectedPatient(null); }}
                placeholder="Search patient by name or CR number…"
                className="pl-9"
              />
            </div>
            {!selectedPatient && (
              <div className="mt-2 space-y-1 max-h-60 overflow-y-auto">
                {pLoading && <p className="text-xs text-slate-400 text-center py-3">Loading patients…</p>}
                {filteredPatients.map(p => (
                  <button
                    key={p.id}
                    onClick={() => { setSelectedPatient(p); setSearchQuery(""); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50 text-left transition-colors border border-transparent hover:border-blue-200"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{p.patient_name}</p>
                      <p className="text-xs text-slate-400">{p.cr_number} · {p.diagnosis || "No diagnosis"}</p>
                    </div>
                    <Badge className={`text-xs flex-shrink-0 ${p.status === "Active" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                      {p.status || "Active"}
                    </Badge>
                  </button>
                ))}
                {filteredPatients.length === 0 && !pLoading && searchQuery && (
                  <p className="text-xs text-slate-400 text-center py-3">No patients found</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Patient selected — summary dashboard */}
        {selectedPatient && (
          <>
            {/* Patient identity card */}
            <Card className="bg-white border-2 border-blue-200 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <User className="w-7 h-7 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">{selectedPatient.patient_name}</h2>
                        <p className="text-xs text-slate-500">{selectedPatient.cr_number} · {ageDisplay} · {selectedPatient.gender || "—"}</p>
                      </div>
                      <button
                        onClick={() => setSelectedPatient(null)}
                        className="text-xs text-slate-400 underline hover:text-slate-600"
                      >
                        Change
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {selectedPatient.diagnosis && (
                        <Badge className="bg-blue-100 text-blue-800 text-xs">{selectedPatient.diagnosis}</Badge>
                      )}
                      {selectedPatient.ns_classification && selectedPatient.ns_classification !== "Not Applicable" && (
                        <Badge className="bg-purple-100 text-purple-800 text-xs">{selectedPatient.ns_classification}</Badge>
                      )}
                      {selectedPatient.ckd_stage && selectedPatient.ckd_stage !== "Not Applicable" && (
                        <Badge className="bg-red-100 text-red-800 text-xs">CKD {selectedPatient.ckd_stage}</Badge>
                      )}
                      {selectedPatient.allergies?.map(a => (
                        <Badge key={a} className="bg-amber-100 text-amber-800 text-xs border border-amber-300">⚠️ {a}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Vitals strip */}
                {selectedPatient.baseline_vitals && (
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {[
                      { label: "Weight", value: selectedPatient.baseline_vitals.weight ? `${selectedPatient.baseline_vitals.weight} kg` : "—" },
                      { label: "Height", value: selectedPatient.baseline_vitals.height ? `${selectedPatient.baseline_vitals.height} cm` : "—" },
                      { label: "Blood Group", value: selectedPatient.baseline_vitals.blood_group || "—" },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-slate-50 rounded-xl px-3 py-2 text-center">
                        <p className="text-xs text-slate-400">{label}</p>
                        <p className="text-sm font-bold text-slate-800 mt-0.5">{value}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Labs */}
            <Card className="bg-white border border-slate-200 shadow-sm">
              <CardHeader className="pb-2 px-4 pt-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-blue-600" />
                  Recent Lab Results
                  {latestLab && (
                    <span className="ml-auto text-xs font-normal text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {latestLab.test_date}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                {labLoading && <p className="text-xs text-slate-400 text-center py-4">Loading labs…</p>}
                {!labLoading && !latestLab && (
                  <p className="text-xs text-slate-400 text-center py-4">No lab results recorded</p>
                )}
                {latestLab && (
                  <div className="space-y-2">
                    {/* Abnormal first */}
                    {abnormalParams.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-xs font-bold text-slate-500 uppercase">Abnormal</p>
                        {abnormalParams.map((p, i) => <LabParamRow key={i} param={p} />)}
                      </div>
                    )}
                    {normalParams.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-xs font-bold text-slate-500 uppercase mt-2">Normal</p>
                        {normalParams.map((p, i) => <LabParamRow key={i} param={p} />)}
                      </div>
                    )}
                    {latestLab.notes && (
                      <p className="text-xs text-slate-500 italic mt-2 px-1">{latestLab.notes}</p>
                    )}
                    {labResults.length > 1 && (
                      <p className="text-xs text-slate-400 text-center mt-2">{labResults.length - 1} older result(s) available in patient record</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Active Medications */}
            <Card className="bg-white border border-slate-200 shadow-sm">
              <CardHeader className="pb-2 px-4 pt-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Pill className="w-4 h-4 text-purple-600" />
                  Active Medications
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                {activeMeds.length === 0 && selectedPatient.current_medications?.length > 0 && (
                  <div className="space-y-1.5">
                    {selectedPatient.current_medications.map((m, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg text-sm text-slate-800">
                        <Pill className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" /> {m}
                      </div>
                    ))}
                  </div>
                )}
                {activeMeds.length > 0 && (
                  <div className="space-y-1.5">
                    {activeMeds.map((med, i) => (
                      <div key={i} className="flex items-center justify-between px-3 py-2 bg-purple-50 border border-purple-100 rounded-lg">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{med.drug_name || med.generic_name}</p>
                          <p className="text-xs text-slate-500">{med.dose} · {med.frequency} · {med.route}</p>
                        </div>
                        {med.duration && <span className="text-xs text-slate-400">{med.duration}</span>}
                      </div>
                    ))}
                  </div>
                )}
                {activeMeds.length === 0 && !selectedPatient.current_medications?.length && (
                  <p className="text-xs text-slate-400 text-center py-4">No medications recorded</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Clinical Encounters / Active Pathways */}
            <Card className="bg-white border border-slate-200 shadow-sm">
              <CardHeader className="pb-2 px-4 pt-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-green-600" />
                  Recent Encounters & Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                {encounters.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-4">No encounters recorded</p>
                )}
                <div className="space-y-2">
                  {encounters.map((enc, i) => (
                    <div key={i} className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                      <div className="flex items-center justify-between mb-1">
                        <Badge className="text-xs bg-green-100 text-green-800">{enc.encounter_type || "Visit"}</Badge>
                        <span className="text-xs text-slate-400">
                          {enc.encounter_date ? new Date(enc.encounter_date).toLocaleDateString("en-IN") : "—"}
                        </span>
                      </div>
                      {enc.reason_for_visit && <p className="text-xs text-slate-700 font-medium">{enc.reason_for_visit}</p>}
                      {enc.ns_status_at_visit && enc.ns_status_at_visit !== "Not Applicable" && (
                        <p className="text-xs text-slate-500 mt-0.5">NS Status: <strong>{enc.ns_status_at_visit}</strong></p>
                      )}
                      {enc.bp_classification && (
                        <p className="text-xs text-slate-500 mt-0.5">BP: <strong>{enc.bp_classification}</strong></p>
                      )}
                      {enc.assessment && <p className="text-xs text-slate-600 mt-1 italic">{enc.assessment}</p>}
                      {enc.follow_up_date && (
                        <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Follow-up: {enc.follow_up_date}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Clinical notes from patient record */}
            {selectedPatient.notes && (
              <Alert className="bg-amber-50 border-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <AlertDescription className="text-sm text-amber-800">
                  <strong>Clinical Notes: </strong>{selectedPatient.notes}
                </AlertDescription>
              </Alert>
            )}
          </>
        )}

        {!selectedPatient && !pLoading && (
          <div className="text-center py-12 text-slate-400">
            <Heart className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Search and select a patient to view their bedside summary</p>
          </div>
        )}
      </div>
    </div>
  );
}