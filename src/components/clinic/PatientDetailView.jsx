import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Calendar, 
  Phone, 
  FileText, 
  Plus,
  ChevronDown,
  ChevronUp,
  Activity,
  Pill,
  AlertCircle
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import VisitForm from "./VisitForm";
import VisitRecordCard from "./VisitRecordCard";
import LabAnalyzer from "./LabAnalyzer";
import ManagementPlanGenerator from "./ManagementPlanGenerator";
import PatientToolsPanel from "./PatientToolsPanel";
import DocumentManager from "./DocumentManager";
import AppointmentCalendar from "./AppointmentCalendar";

export default function PatientDetailView({ patient, onUpdate }) {
  const queryClient = useQueryClient();
  const [showAddVisit, setShowAddVisit] = useState(false);

  const { data: visits = [] } = useQuery({
    queryKey: ['visits', patient.id],
    queryFn: () => base44.entities.VisitRecord.filter({ patient_id: patient.id }, '-visit_date'),
    enabled: !!patient.id
  });

  const handleVisitAdded = () => {
    queryClient.invalidateQueries({ queryKey: ['visits', patient.id] });
    setShowAddVisit(false);
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
      <Card className="bg-white shadow-lg border-2 border-purple-200">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl mb-2">{patient.patient_name}</CardTitle>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">CR# {patient.cr_number}</Badge>
                {patient.age_years && <Badge variant="outline" className="text-xs">{patient.age_years}y</Badge>}
                {patient.gender && <Badge variant="outline" className="text-xs">{patient.gender}</Badge>}
                <Badge className={`text-xs ${
                  patient.status === 'Active' ? 'bg-green-500' : 'bg-slate-500'
                } text-white`}>
                  {patient.status}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            {patient.mobile_number && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-500" />
                <span>{patient.mobile_number}</span>
              </div>
            )}
            {patient.date_of_birth && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span>DOB: {new Date(patient.date_of_birth).toLocaleDateString()}</span>
              </div>
            )}
            {patient.guardian_name && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-500" />
                <span>Guardian: {patient.guardian_name}</span>
              </div>
            )}
            {patient.diagnosis && (
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-slate-500" />
                <span>Diagnosis: {patient.diagnosis}</span>
              </div>
            )}
          </div>

          {patient.current_medications && patient.current_medications.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Pill className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-sm text-blue-900">Current Medications</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {patient.current_medications.map((med, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">{med}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="visits" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7 text-xs">
          <TabsTrigger value="visits">Visits</TabsTrigger>
          <TabsTrigger value="documents">Docs</TabsTrigger>
          <TabsTrigger value="appointments">Appts</TabsTrigger>
          <TabsTrigger value="labs">Labs</TabsTrigger>
          <TabsTrigger value="plan">Plan</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="scans">Scans</TabsTrigger>
        </TabsList>

        <TabsContent value="documents">
          <DocumentManager patientId={patient.id} />
        </TabsContent>

        <TabsContent value="appointments">
          <AppointmentCalendar patientId={patient.id} />
        </TabsContent>

        <TabsContent value="labs">
          <Card className="bg-white shadow-lg">
            <CardHeader className="bg-green-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600" />
                Lab Report Analyzer
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <LabAnalyzer
                patientAge={patient.age_years}
                patientGender={patient.gender}
                onAnalysisComplete={(result) => {
                  queryClient.invalidateQueries({ queryKey: ['visits', patient.id] });
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plan">
          <Card className="bg-white shadow-lg">
            <CardHeader className="bg-purple-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                AI Management Plan Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ManagementPlanGenerator
                diagnosis={patient.diagnosis || visits[0]?.diagnosis}
                patientAge={patient.age_years}
                patientWeight={visits[0]?.physical_examination?.weight}
                labResults={visits[0]?.lab_results}
                visitData={visits[0]}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visits" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={showAddVisit} onOpenChange={setShowAddVisit}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Visit
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>New Visit Record</DialogTitle>
                </DialogHeader>
                <VisitForm patient={patient} onSuccess={handleVisitAdded} />
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-3">
            {visits.length === 0 ? (
              <Card className="bg-white">
                <CardContent className="p-8 text-center text-slate-500">
                  <FileText className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                  <p>No visit records yet</p>
                </CardContent>
              </Card>
            ) : (
              visits.map((visit) => (
                <VisitRecordCard key={visit.id} visit={visit} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="summary">
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Clinical Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Total Visits</h4>
                  <p className="text-2xl font-bold text-purple-600">{visits.length}</p>
                </div>
                {visits.length > 0 && (
                  <>
                    <div>
                      <h4 className="font-semibold mb-2">Last Visit</h4>
                      <p className="text-sm text-slate-600">
                        {new Date(visits[0].visit_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Last Diagnosis</h4>
                      <p className="text-sm text-slate-700">{visits[0].diagnosis || 'N/A'}</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scans">
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle>Scanned Records (OCR)</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {patient.scanned_files && patient.scanned_files.length > 0 ? (
                <div className="space-y-2">
                  {patient.scanned_files.map((file, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded border">
                      <p className="text-sm font-semibold">{file.file_type}</p>
                      <p className="text-xs text-slate-600 mt-1">
                        {new Date(file.upload_date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">No scanned documents</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>

      <div className="lg:col-span-1">
        <div className="sticky top-6">
          <PatientToolsPanel patient={patient} />
        </div>
      </div>
    </div>
  );
}