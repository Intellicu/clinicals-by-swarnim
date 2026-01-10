import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Users, 
  Plus, 
  Search, 
  Camera, 
  FileText,
  Calendar,
  Phone,
  User,
  Hash,
  Eye,
  Loader2,
  Hospital,
  AlertCircle,
  Video,
  TrendingUp,
  DollarSign,
  Package
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import PatientForm from "../components/clinic/PatientForm";
import PatientList from "../components/clinic/PatientList";
import PatientDetailView from "../components/clinic/PatientDetailView";
import OCRScanner from "../components/clinic/OCRScanner";
import TelemedicineConsole from "../components/clinic/TelemedicineConsole";
import RiskStratification from "../components/clinic/RiskStratification";
import CDSSSidebar from "../components/clinic/CDSSSidebar";
import BillingDashboard from "../components/clinic/BillingDashboard";
import InventoryManager from "../components/clinic/InventoryManager";
import AppointmentCalendar from "../components/clinic/AppointmentCalendar";

export default function ClinicManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showOCRDialog, setShowOCRDialog] = useState(false);
  const [showTelemedicine, setShowTelemedicine] = useState(false);
  const [showRiskProfile, setShowRiskProfile] = useState(false);
  const queryClient = useQueryClient();

  const { data: patients = [], isLoading, error, refetch } = useQuery({
    queryKey: ['patients'],
    queryFn: () => base44.entities.Patient.list('-created_date'),
    initialData: [],
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const filteredPatients = patients.filter(p => {
    const query = searchQuery.toLowerCase();
    return (
      p.patient_name?.toLowerCase().includes(query) ||
      p.cr_number?.toLowerCase().includes(query) ||
      p.mobile_number?.includes(query)
    );
  });

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
  };

  const handlePatientCreated = () => {
    queryClient.invalidateQueries({ queryKey: ['patients'] });
    setShowAddDialog(false);
    toast.success("Patient added successfully!");
  };

  const handleOCRComplete = (extractedData) => {
    setShowOCRDialog(false);
    setShowAddDialog(true);
    // Pre-fill form with OCR data
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <Link to={createPageUrl("Hub")}>
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Hub
          </Button>
        </Link>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <Hospital className="w-7 h-7 text-white" />
            </div>
            Clinic Management
          </h1>
          <p className="text-slate-600">Patient records, visit tracking, and clinical documentation</p>
        </div>

        <Tabs defaultValue="appointments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
          </TabsList>

          <TabsContent value="appointments">
            <AppointmentCalendar />
          </TabsContent>

          <TabsContent value="patients">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Patient List Panel */}
          <div className="lg:col-span-1">
            <Card className="bg-white shadow-lg sticky top-6">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    Patients ({filteredPatients.length})
                  </span>
                  <div className="flex gap-2">
                    <Dialog open={showOCRDialog} onOpenChange={setShowOCRDialog}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          <Camera className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Scan Patient Document</DialogTitle>
                        </DialogHeader>
                        <OCRScanner onComplete={handleOCRComplete} />
                      </DialogContent>
                    </Dialog>

                    <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Add New Patient</DialogTitle>
                        </DialogHeader>
                        <PatientForm onSuccess={handlePatientCreated} />
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, CR#, mobile..."
                    className="pl-10"
                  />
                </div>

                {isLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto" />
                    <p className="text-sm text-slate-600 mt-2">Loading patients...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-8 px-4">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                    <p className="text-sm text-red-700 mb-3">Failed to load patients</p>
                    <Button onClick={() => refetch()} size="sm" variant="outline">
                      Retry
                    </Button>
                  </div>
                ) : (
                  <PatientList
                    patients={filteredPatients}
                    selectedPatient={selectedPatient}
                    onSelect={handlePatientSelect}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Patient Detail Panel */}
          <div className="lg:col-span-2">
            {!selectedPatient ? (
              <Card className="bg-white shadow-lg h-96 flex items-center justify-center">
                <div className="text-center">
                  <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-700 mb-2">No Patient Selected</h3>
                  <p className="text-slate-500">Select a patient from the list to view details</p>
                </div>
              </Card>
            ) : !showTelemedicine ? (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={() => setShowTelemedicine(true)} className="bg-indigo-600">
                    <Video className="w-4 h-4 mr-2" />
                    Start Telemedicine
                  </Button>
                  <Button onClick={() => setShowRiskProfile(!showRiskProfile)} variant="outline" className="border-amber-300">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Risk Profile
                  </Button>
                </div>
                
                {showRiskProfile && <RiskStratification patient={selectedPatient} visits={[]} />}
                
                <PatientDetailView
                  patient={selectedPatient}
                  onUpdate={() => queryClient.invalidateQueries({ queryKey: ['patients'] })}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <Button onClick={() => setShowTelemedicine(false)} variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Patient Details
                </Button>
                <TelemedicineConsole
                  patient={selectedPatient}
                  onSessionData={(data) => {
                    toast.success('Session data captured');
                    setShowTelemedicine(false);
                  }}
                />
              </div>
            )}
          </div>

          {/* Quick Stats Panel */}
          <div className="lg:col-span-1">
            <Card className="bg-white shadow-lg sticky top-6">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
                <CardTitle className="text-sm">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Total Patients</span>
                    <Badge className="bg-purple-600">{patients.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Active Cases</span>
                    <Badge className="bg-green-600">
                      {patients.filter(p => p.status === 'Active').length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
          </TabsContent>

          <TabsContent value="billing">
            <BillingDashboard patientId={selectedPatient?.id} />
          </TabsContent>

          <TabsContent value="inventory">
            <InventoryManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}