import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Activity, Syringe, UtensilsCrossed, TrendingUp, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area
} from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316"];

const VACCINATION_IDS = ["bcg","opv0","hepb1","dtpipvhib1","pcv1","rota1","mmr1","mmr2","varicella1","dtpbooster1","dtpbooster2","hpv","tdap"];

export default function ClinicAnalyticsDashboard() {
  const { data: patients = [] } = useQuery({
    queryKey: ["patients-analytics"],
    queryFn: () => base44.entities.Patient.list("-created_date", 200),
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ["appointments-analytics"],
    queryFn: () => base44.entities.Appointment.list("-appointment_date", 200),
  });

  const { data: labResults = [] } = useQuery({
    queryKey: ["labresults-analytics"],
    queryFn: () => base44.entities.LabResult.list("-test_date", 200),
  });

  // Offline vaccination tracker stats
  const vaccinationData = (() => {
    try {
      const saved = JSON.parse(localStorage.getItem("iap_vaccination_tracker") || "{}");
      const given = Object.values(saved).filter(Boolean).length;
      const total = VACCINATION_IDS.length;
      return { given, total, pct: Math.round((given / total) * 100) };
    } catch { return { given: 0, total: VACCINATION_IDS.length, pct: 0 }; }
  })();

  // Diet plan usage from localStorage
  const dietStats = (() => {
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith("diet_") || k.includes("diet"));
      return { plans: keys.length };
    } catch { return { plans: 0 }; }
  })();

  // Diagnosis distribution
  const diagnosisMap = {};
  patients.forEach(p => {
    if (p.diagnosis) {
      const d = p.diagnosis.split(",")[0].trim();
      diagnosisMap[d] = (diagnosisMap[d] || 0) + 1;
    }
  });
  const diagnosisData = Object.entries(diagnosisMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([name, value]) => ({ name: name.length > 20 ? name.slice(0, 18) + "…" : name, value }));

  // Patient status breakdown
  const statusMap = {};
  patients.forEach(p => { const s = p.status || "Active"; statusMap[s] = (statusMap[s] || 0) + 1; });
  const statusData = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

  // Appointments by type
  const apptTypeMap = {};
  appointments.forEach(a => { const t = a.appointment_type || "Follow-up"; apptTypeMap[t] = (apptTypeMap[t] || 0) + 1; });
  const apptTypeData = Object.entries(apptTypeMap).map(([name, value]) => ({ name, value }));

  // Monthly patient registrations (last 6 months)
  const now = new Date();
  const monthlyReg = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const label = d.toLocaleString("default", { month: "short", year: "2-digit" });
    const count = patients.filter(p => {
      const cd = new Date(p.created_date);
      return cd.getMonth() === d.getMonth() && cd.getFullYear() === d.getFullYear();
    }).length;
    return { month: label, patients: count };
  });

  // Appointments by status
  const apptStatusMap = {};
  appointments.forEach(a => { const s = a.status || "Scheduled"; apptStatusMap[s] = (apptStatusMap[s] || 0) + 1; });
  const completedAppts = apptStatusMap["Completed"] || 0;
  const totalAppts = appointments.length;

  const statCards = [
    { label: "Total Patients", value: patients.length, icon: Users, color: "bg-blue-500", sub: `${patients.filter(p => p.status === "Active").length} Active` },
    { label: "Appointments", value: totalAppts, icon: Clock, color: "bg-purple-500", sub: `${completedAppts} Completed` },
    { label: "Vaccination Coverage", value: `${vaccinationData.pct}%`, icon: Syringe, color: "bg-green-500", sub: `${vaccinationData.given}/${vaccinationData.total} doses tracked` },
    { label: "Diet Plans Created", value: dietStats.plans, icon: UtensilsCrossed, color: "bg-amber-500", sub: "Offline plans" },
    { label: "Lab Results", value: labResults.length, icon: Activity, color: "bg-cyan-500", sub: "Records logged" },
    { label: "Diagnoses Tracked", value: Object.keys(diagnosisMap).length, icon: AlertCircle, color: "bg-red-500", sub: "Unique conditions" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link to={createPageUrl("Hub")}>
            <Button variant="outline" size="sm"><ArrowLeft className="w-4 h-4 mr-1" />Hub</Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-7 h-7 text-blue-600" />
              Clinic Analytics Dashboard
            </h1>
            <p className="text-sm text-slate-500">Aggregated statistics across patients, appointments, and clinical tools</p>
          </div>
          <div className="ml-auto flex gap-2">
            <Link to={createPageUrl("PatientManager")}>
              <Button className="bg-blue-600 hover:bg-blue-700"><Users className="w-4 h-4 mr-2" />Patient Manager</Button>
            </Link>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statCards.map(card => {
            const Icon = card.icon;
            return (
              <Card key={card.label} className="bg-white shadow-sm border">
                <CardContent className="p-4">
                  <div className={`w-10 h-10 ${card.color} rounded-xl flex items-center justify-center mb-3`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{card.value}</div>
                  <div className="text-xs font-semibold text-slate-700 mt-0.5">{card.label}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{card.sub}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts Row 1 */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Monthly Registrations */}
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />Patient Registrations (Last 6 Months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={monthlyReg}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="patients" stroke="#3b82f6" fill="#dbeafe" strokeWidth={2} name="Patients" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Diagnosis Distribution */}
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />Common Conditions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {diagnosisData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={diagnosisData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={120} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Patients" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
                  No diagnosis data yet. Add patients with diagnoses.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Patient Status Pie */}
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Patient Status</CardTitle>
            </CardHeader>
            <CardContent>
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No patients yet</div>
              )}
            </CardContent>
          </Card>

          {/* Appointment Types */}
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Appointment Types</CardTitle>
            </CardHeader>
            <CardContent>
              {apptTypeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={apptTypeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Appointments" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No appointments yet</div>
              )}
            </CardContent>
          </Card>

          {/* Vaccination Coverage */}
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Syringe className="w-4 h-4 text-green-600" />Vaccination Coverage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center h-48 space-y-4">
                <div className="relative w-32 h-32">
                  <svg viewBox="0 0 36 36" className="w-32 h-32 -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#10b981" strokeWidth="3"
                      strokeDasharray={`${vaccinationData.pct} ${100 - vaccinationData.pct}`}
                      strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-slate-900">{vaccinationData.pct}%</span>
                    <span className="text-xs text-slate-500">coverage</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 text-center">{vaccinationData.given} of {vaccinationData.total} IAP doses tracked</p>
                <Link to={createPageUrl("PediatricsHub")}>
                  <Button size="sm" variant="outline" className="text-xs">View Vaccination Tracker</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Quick Navigation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {[
                { label: "Patient Manager", page: "PatientManager", color: "bg-blue-600" },
                { label: "Clinic Dashboard", page: "ClinicDashboard", color: "bg-purple-600" },
                { label: "Diet Generator", page: "DietGenerator", color: "bg-green-600" },
                { label: "Pediatrics Hub", page: "PediatricsHub", color: "bg-teal-600" },
                { label: "Lab Results", page: "LabResults", color: "bg-cyan-600" },
                { label: "Appointments", page: "ClinicDashboard", color: "bg-indigo-600" },
              ].map(l => (
                <Link key={l.label} to={createPageUrl(l.page)}>
                  <Button className={`${l.color} text-white hover:opacity-90`} size="sm">{l.label}</Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}