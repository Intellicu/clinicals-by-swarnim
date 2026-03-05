import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Search, Users, TrendingUp, CheckCircle2 } from "lucide-react";
import MaterialAssigner from "@/components/education/MaterialAssigner";
import EngagementTracker from "@/components/education/EngagementTracker";

export default function PatientEducationHub() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);

  const { data: patients = [] } = useQuery({
    queryKey: ["patients"],
    queryFn: () => base44.entities.Patient.list("-created_date", 100),
  });

  const { data: allAssignments = [] } = useQuery({
    queryKey: ["all-education-assignments"],
    queryFn: () => base44.entities.PatientEducationAssignment.list("-created_date", 200),
  });

  const filteredPatients = patients.filter(
    (p) =>
      p.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.cr_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAssigned = allAssignments.length;
  const totalCompleted = allAssignments.filter((a) => a.completion_status === "Completed").length;
  const totalInProgress = allAssignments.filter((a) => a.completion_status === "In Progress").length;
  const completionRate = totalAssigned > 0 ? Math.round((totalCompleted / totalAssigned) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto p-4 pb-24">
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Patient Education</h1>
          <p className="text-sm text-slate-500">Assign and track educational materials</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <Card className="text-center p-3">
          <div className="text-2xl font-bold text-slate-800">{totalAssigned}</div>
          <div className="text-xs text-slate-500">Assigned</div>
        </Card>
        <Card className="text-center p-3">
          <div className="text-2xl font-bold text-blue-600">{totalInProgress}</div>
          <div className="text-xs text-slate-500">In Progress</div>
        </Card>
        <Card className="text-center p-3">
          <div className="text-2xl font-bold text-green-600">{totalCompleted}</div>
          <div className="text-xs text-slate-500">Completed</div>
        </Card>
        <Card className="text-center p-3">
          <div className="text-2xl font-bold text-purple-600">{completionRate}%</div>
          <div className="text-xs text-slate-500">Rate</div>
        </Card>
      </div>

      <Tabs defaultValue="patients">
        <TabsList className="w-full mb-5">
          <TabsTrigger value="patients" className="flex-1 gap-2">
            <Users className="w-4 h-4" />
            By Patient
          </TabsTrigger>
          <TabsTrigger value="overview" className="flex-1 gap-2">
            <TrendingUp className="w-4 h-4" />
            All Assignments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="patients">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Patient List */}
            <div>
              <div className="relative mb-3">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input placeholder="Search patients..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {filteredPatients.map((patient) => {
                  const assignments = allAssignments.filter((a) => a.patient_id === patient.id);
                  const completed = assignments.filter((a) => a.completion_status === "Completed").length;
                  const isSelected = selectedPatient?.id === patient.id;
                  return (
                    <button
                      key={patient.id}
                      onClick={() => setSelectedPatient(patient)}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        isSelected ? "border-purple-400 bg-purple-50" : "border-slate-200 hover:border-purple-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-sm">{patient.patient_name}</p>
                          <p className="text-xs text-slate-500">CR: {patient.cr_number}</p>
                        </div>
                        <div className="text-right">
                          {assignments.length > 0 ? (
                            <>
                              <Badge className="bg-purple-100 text-purple-700 text-xs">{assignments.length} assigned</Badge>
                              <p className="text-xs text-green-600 mt-1">{completed} completed</p>
                            </>
                          ) : (
                            <Badge variant="outline" className="text-xs">No materials</Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Patient Detail */}
            <div>
              {selectedPatient ? (
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{selectedPatient.patient_name}</CardTitle>
                      <MaterialAssigner patient={selectedPatient} onAssigned={() => {}} />
                    </div>
                    <p className="text-xs text-slate-500">{selectedPatient.diagnosis || "No diagnosis"}</p>
                  </CardHeader>
                  <CardContent>
                    <EngagementTracker patientId={selectedPatient.id} showStats={false} />
                  </CardContent>
                </Card>
              ) : (
                <div className="flex items-center justify-center h-64 border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
                  <div className="text-center">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">Select a patient to manage materials</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="overview">
          <div className="space-y-2">
            {allAssignments.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p>No materials assigned yet</p>
              </div>
            ) : (
              allAssignments.map((a) => (
                <Card key={a.id} className="p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{a.material_title}</p>
                      <p className="text-xs text-slate-500">{a.patient_name} · {a.material_type}</p>
                    </div>
                    <Badge className={
                      a.completion_status === "Completed" ? "bg-green-100 text-green-700" :
                      a.completion_status === "In Progress" ? "bg-blue-100 text-blue-700" :
                      "bg-slate-100 text-slate-600"
                    }>{a.completion_status}</Badge>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}