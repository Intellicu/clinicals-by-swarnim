import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Trash2, Calculator, Brain, Syringe, UtensilsCrossed, Activity, FileText, User, Heart, Pill, AlertTriangle } from "lucide-react";

export default function PatientDetailPanel({ patient: p, onBack, onEdit, onDelete }) {
  const statusColors = { Active: "bg-green-100 text-green-800", "Follow-up": "bg-blue-100 text-blue-800", Discharged: "bg-slate-100 text-slate-800", Referred: "bg-amber-100 text-amber-800" };

  const clinicalTools = [
    { label: "Dose Calculator", page: "DoseCalculator", icon: Calculator, color: "bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200", desc: "Pediatric dosing with renal adjustment" },
    { label: "Schwartz GFR", page: "SchwartzGFR", icon: Activity, color: "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200", desc: "Estimate GFR from height & creatinine" },
    { label: "BP Percentiles", page: "BPPercentiles", icon: Heart, color: "bg-red-100 text-red-700 border-red-200 hover:bg-red-200", desc: "Pediatric blood pressure charts" },
    { label: "Clinical Pathways", page: "ClinicalSupport", icon: Brain, color: "bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-200", desc: "25+ evidence-based protocols" },
    { label: "Diet Generator", page: "DietGenerator", icon: UtensilsCrossed, color: "bg-green-100 text-green-700 border-green-200 hover:bg-green-200", desc: "CKD/Nephrotic diet plans (IPNA/KDIGO)" },
    { label: "Vaccination Tracker", page: "PediatricsHub", icon: Syringe, color: "bg-teal-100 text-teal-700 border-teal-200 hover:bg-teal-200", desc: "IAP 2023 immunization schedule" },
    { label: "Drug Database", page: "DrugCalculator", icon: Pill, color: "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200", desc: "50+ drugs with Indian formulations" },
    { label: "Growth Monitoring", page: "PediatricsHub", icon: Activity, color: "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200", desc: "WHO/IAP Z-scores, trend charts" },
    { label: "Lab Results", page: "LabResults", icon: FileText, color: "bg-cyan-100 text-cyan-700 border-cyan-200 hover:bg-cyan-200", desc: "View & log lab values" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="outline" size="sm" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-1" />Back</Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <User className="w-6 h-6 text-blue-600" />{p.patient_name}
            </h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant="outline" className="text-xs">CR: {p.cr_number}</Badge>
              <Badge className={`text-xs ${statusColors[p.status] || "bg-slate-100 text-slate-700"}`}>{p.status}</Badge>
              {p.gender && <Badge variant="outline" className="text-xs">{p.gender}</Badge>}
              {p.age_years && <Badge variant="outline" className="text-xs">{p.age_years} yrs</Badge>}
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onEdit}><Edit className="w-4 h-4 mr-1" />Edit</Button>
            <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => { if (confirm("Delete this patient?")) onDelete(); }}>
              <Trash2 className="w-4 h-4 mr-1" />Delete
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Demographics */}
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-2 bg-blue-50 border-b">
              <CardTitle className="text-sm font-semibold text-blue-800 flex items-center gap-2"><User className="w-4 h-4" />Demographics</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2 text-sm">
              {[
                ["Mobile", p.mobile_number],
                ["Date of Birth", p.date_of_birth],
                ["Guardian", p.guardian_name],
                ["Address", p.address],
              ].map(([label, val]) => val ? (
                <div key={label} className="flex gap-2"><span className="text-slate-500 w-28 flex-shrink-0">{label}:</span><span className="text-slate-900 font-medium">{val}</span></div>
              ) : null)}
            </CardContent>
          </Card>

          {/* Baseline Vitals */}
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-2 bg-green-50 border-b">
              <CardTitle className="text-sm font-semibold text-green-800 flex items-center gap-2"><Activity className="w-4 h-4" />Baseline Vitals</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Height", p.baseline_vitals?.height ? `${p.baseline_vitals.height} cm` : "—"],
                  ["Weight", p.baseline_vitals?.weight ? `${p.baseline_vitals.weight} kg` : "—"],
                  ["BMI", p.baseline_vitals?.bmi || "—"],
                  ["Blood Group", p.baseline_vitals?.blood_group || "—"],
                ].map(([label, val]) => (
                  <div key={label} className="bg-slate-50 rounded-lg p-3 border text-center">
                    <div className="text-xs text-slate-500">{label}</div>
                    <div className="font-bold text-slate-900 mt-0.5">{val}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Medical History */}
          <Card className="bg-white shadow-sm md:col-span-2">
            <CardHeader className="pb-2 bg-purple-50 border-b">
              <CardTitle className="text-sm font-semibold text-purple-800 flex items-center gap-2"><Heart className="w-4 h-4" />Medical History</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-sm">
              {p.diagnosis && (
                <div><span className="text-slate-500">Primary Diagnosis: </span><span className="font-semibold text-slate-900">{p.diagnosis}</span></div>
              )}
              {p.comorbidities?.length > 0 && (
                <div>
                  <span className="text-slate-500 block mb-1">Comorbidities:</span>
                  <div className="flex flex-wrap gap-1">{p.comorbidities.map((c, i) => <Badge key={i} variant="outline">{c}</Badge>)}</div>
                </div>
              )}
              {p.allergies?.length > 0 && (
                <div>
                  <span className="text-slate-500 flex items-center gap-1 mb-1"><AlertTriangle className="w-3 h-3 text-red-500" />Allergies:</span>
                  <div className="flex flex-wrap gap-1">{p.allergies.map((a, i) => <Badge key={i} className="bg-red-100 text-red-800">{a}</Badge>)}</div>
                </div>
              )}
              {p.current_medications?.length > 0 && (
                <div>
                  <span className="text-slate-500 block mb-1">Current Medications:</span>
                  <div className="flex flex-wrap gap-1">{p.current_medications.map((m, i) => <Badge key={i} className="bg-blue-100 text-blue-800">{m}</Badge>)}</div>
                </div>
              )}
              {p.notes && (
                <div><span className="text-slate-500">Notes: </span><span className="text-slate-800">{p.notes}</span></div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Clinical Tools */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-2 bg-slate-50 border-b">
            <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-blue-600" />Clinical Tools for this Patient
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {clinicalTools.map(t => {
                const Icon = t.icon;
                return (
                  <Link key={t.label} to={createPageUrl(t.page)}>
                    <div className={`border rounded-lg p-3 cursor-pointer transition-all ${t.color}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-4 h-4" />
                        <span className="font-semibold text-sm">{t.label}</span>
                      </div>
                      <p className="text-xs opacity-75">{t.desc}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}