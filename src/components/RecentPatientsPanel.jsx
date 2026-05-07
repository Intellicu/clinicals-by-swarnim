import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, ArrowRight, Clock } from "lucide-react";

export default function RecentPatientsPanel() {
  const navigate = useNavigate();

  const { data: patients = [] } = useQuery({
    queryKey: ["recent-patients-hub"],
    queryFn: () => base44.entities.Patient.list("-updated_date", 6),
    staleTime: 30000,
  });

  const { data: recentPrescriptions = [] } = useQuery({
    queryKey: ["recent-rx-hub"],
    queryFn: () => base44.entities.Prescription.list("-prescription_date", 5),
    staleTime: 30000,
  });

  const statusColor = (s) => {
    if (s === "Active") return "bg-green-100 text-green-800";
    if (s === "Follow-up") return "bg-blue-100 text-blue-800";
    if (s === "Discharged") return "bg-slate-100 text-slate-700";
    return "bg-amber-100 text-amber-800";
  };

  if (patients.length === 0) return null;

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* Recent Patients */}
      <Card className="bg-white shadow-md border-2 border-blue-100">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 py-3 px-5">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-blue-600" />
            Recent Patients
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {patients.map((p, i) => (
            <div
              key={p.id}
              onClick={() => navigate(createPageUrl("PatientMonitoringDashboard"), { state: { patient: p } })}
              className={`flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors ${i < patients.length - 1 ? "border-b border-slate-100" : ""}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {p.patient_name?.[0]?.toUpperCase() || "P"}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-slate-900 truncate">{p.patient_name}</p>
                  <p className="text-xs text-slate-500 truncate">
                    {p.age_years ? `${p.age_years}y` : ""}{p.gender ? ` · ${p.gender}` : ""}{p.diagnosis ? ` · ${p.diagnosis}` : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                <Badge className={`text-xs ${statusColor(p.status)}`}>{p.status || "Active"}</Badge>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Prescriptions */}
      <Card className="bg-white shadow-md border-2 border-purple-100">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100 py-3 px-5">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-purple-600" />
            Recent Prescriptions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recentPrescriptions.length === 0 ? (
            <div className="px-4 py-8 text-center text-slate-400 text-sm">No prescriptions yet</div>
          ) : (
            recentPrescriptions.map((rx, i) => (
              <div
                key={rx.id}
                className={`flex items-center justify-between px-4 py-3 ${i < recentPrescriptions.length - 1 ? "border-b border-slate-100" : ""}`}
              >
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-slate-900 truncate">{rx.diagnosis || "Prescription"}</p>
                  <p className="text-xs text-slate-500">
                    {rx.prescription_date ? new Date(rx.prescription_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "—"}
                    {rx.prescribed_by ? ` · ${rx.prescribed_by.split("@")[0]}` : ""}
                  </p>
                </div>
                <Badge className="bg-purple-100 text-purple-800 text-xs flex-shrink-0 ml-2">
                  {rx.medications?.length || 0} med{rx.medications?.length !== 1 ? "s" : ""}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}