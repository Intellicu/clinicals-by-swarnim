import React, { useState } from "react";
import { base44 } from "@/api/client";
import { useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Camera, Upload, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LabAnalyzer from "./LabAnalyzer";
import ManagementPlanGenerator from "./ManagementPlanGenerator";
import DigitalPrescriptionPad from "./DigitalPrescriptionPad";
import AIScribe from "./AIScribe";
import PrescriptionTranslator from "./PrescriptionTranslator";
import PrescriptionScanner from "./PrescriptionScanner";
import { VisitDataProvider, useVisitData } from './VisitDataSync';

function VisitFormInner({ patient, onSuccess }) {
  const { sharedData, updateSharedData, syncFromScribe, syncFromScan } = useVisitData();
  const [showLabAnalyzer, setShowLabAnalyzer] = useState(false);
  const [showPlanGenerator, setShowPlanGenerator] = useState(false);
  const [usePrescriptionPad, setUsePrescriptionPad] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [formData, setFormData] = useState({
    visit_type: "Follow-up",
    chief_complaint: "",
    history: "",
    weight: "",
    height: "",
    bp_systolic: "",
    bp_diastolic: "",
    temperature: "",
    general_examination: "",
    diagnosis: "",
    treatment_plan: "",
    follow_up_date: "",
    clinician_notes: "",
    lab_results: {}
  });

  const createVisitMutation = useMutation({
    mutationFn: (data) => base44.entities.VisitRecord.create(data),
    onSuccess: () => {
      toast.success("Visit recorded!");
      onSuccess?.();
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const visitData = {
      patient_id: patient.id,
      visit_date: new Date().toISOString(),
      visit_type: formData.visit_type,
      chief_complaint: formData.chief_complaint,
      history: formData.history,
      physical_examination: {
        weight: parseFloat(formData.weight) || null,
        height: parseFloat(formData.height) || null,
        bmi: (formData.weight && formData.height) 
          ? (parseFloat(formData.weight) / Math.pow(parseFloat(formData.height) / 100, 2)).toFixed(1)
          : null,
        bp_systolic: parseFloat(formData.bp_systolic) || null,
        bp_diastolic: parseFloat(formData.bp_diastolic) || null,
        temperature: parseFloat(formData.temperature) || null,
        general_examination: formData.general_examination
      },
      diagnosis: formData.diagnosis,
      treatment_plan: formData.treatment_plan,
      follow_up_date: formData.follow_up_date || null,
      clinician_notes: formData.clinician_notes
    };

    createVisitMutation.mutate(visitData);
  };

  const handlePrescriptionPadSave = (padData) => {
    setFormData({
      ...formData,
      chief_complaint: padData.chiefComplaint,
      history: padData.presentingComplaints,
      weight: padData.weight,
      height: padData.height,
      bp_systolic: padData.bp_systolic,
      bp_diastolic: padData.bp_diastolic,
      temperature: padData.temperature,
      general_examination: padData.general,
      diagnosis: padData.diagnosis,
      treatment_plan: padData.plan
    });
    setUsePrescriptionPad(false);
  };

  const handleScanComplete = (scannedData) => {
    syncFromScan(scannedData);
    setFormData({
      ...formData,
      ...scannedData
    });
    toast.success('Scanned data synced across all tabs!');
  };

  return (
    <Tabs defaultValue="quick" className="space-y-6">
      <TabsList className="flex w-full h-auto overflow-x-auto p-1">
        <TabsTrigger value="quick">Quick Entry</TabsTrigger>
        <TabsTrigger value="pad">Digital Pad</TabsTrigger>
        <TabsTrigger value="scribe">AI Scribe</TabsTrigger>
        <TabsTrigger value="scan">Scan Rx</TabsTrigger>
      </TabsList>

      <TabsContent value="pad">
        <DigitalPrescriptionPad patient={patient} onSave={handlePrescriptionPadSave} />
      </TabsContent>

      <TabsContent value="scribe">
        <AIScribe onTranscriptComplete={(structuredData) => {
          if (typeof structuredData === 'object') {
            syncFromScribe(structuredData);
            setFormData({
              ...formData,
              chief_complaint: structuredData.chiefComplaint || formData.chief_complaint,
              history: structuredData.presentingComplaints || formData.history,
              general_examination: structuredData.physical_examination || formData.general_examination,
              diagnosis: structuredData.assessment || formData.diagnosis,
              treatment_plan: structuredData.plan || formData.treatment_plan
            });
            toast.success('Transcript synced across all tabs!');
          } else {
            setFormData({...formData, history: structuredData});
          }
        }} />
      </TabsContent>

      <TabsContent value="scan">
        <PrescriptionScanner onScanComplete={handleScanComplete} />
      </TabsContent>

      <TabsContent value="quick">
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-base">Visit Information</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Visit Type</Label>
              <Select value={formData.visit_type} onValueChange={(val) => setFormData({...formData, visit_type: val})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="First Visit">First Visit</SelectItem>
                  <SelectItem value="Follow-up">Follow-up</SelectItem>
                  <SelectItem value="Emergency">Emergency</SelectItem>
                  <SelectItem value="Consultation">Consultation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Chief Complaint</Label>
              <Input
                value={formData.chief_complaint}
                onChange={(e) => setFormData({...formData, chief_complaint: e.target.value})}
                placeholder="e.g., Edema, Hematuria"
              />
            </div>
          </div>

          <div>
            <Label>History</Label>
            <Textarea
              value={formData.history}
              onChange={(e) => setFormData({...formData, history: e.target.value})}
              placeholder="Present illness, duration, associated symptoms..."
              className="h-24"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-base">Vitals & Examination</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label>Weight (kg)</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData({...formData, weight: e.target.value})}
              />
            </div>
            <div>
              <Label>Height (cm)</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.height}
                onChange={(e) => setFormData({...formData, height: e.target.value})}
              />
            </div>
            <div>
              <Label>Temperature (°C)</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.temperature}
                onChange={(e) => setFormData({...formData, temperature: e.target.value})}
              />
            </div>
            <div>
              <Label>Systolic BP (mmHg)</Label>
              <Input
                type="number"
                value={formData.bp_systolic}
                onChange={(e) => setFormData({...formData, bp_systolic: e.target.value})}
              />
            </div>
            <div>
              <Label>Diastolic BP (mmHg)</Label>
              <Input
                type="number"
                value={formData.bp_diastolic}
                onChange={(e) => setFormData({...formData, bp_diastolic: e.target.value})}
              />
            </div>
          </div>

          <div className="mt-4">
            <Label>General Examination</Label>
            <Textarea
              value={formData.general_examination}
              onChange={(e) => setFormData({...formData, general_examination: e.target.value})}
              placeholder="General appearance, hydration, edema, pallor..."
              className="h-20"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 mb-4">
        <Dialog open={showLabAnalyzer} onOpenChange={setShowLabAnalyzer}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex-1 border-2 border-green-300 hover:bg-green-50">
              <Camera className="w-4 h-4 mr-2" />
              Scan Lab Report
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Lab Report Analyzer</DialogTitle>
            </DialogHeader>
            <LabAnalyzer
              patientAge={patient.age_years}
              patientGender={patient.gender}
              onAnalysisComplete={(result) => {
                setFormData({...formData, lab_results: result});
                setShowLabAnalyzer(false);
                toast.success('Lab results added to visit');
              }}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={showPlanGenerator} onOpenChange={setShowPlanGenerator}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex-1 border-2 border-purple-300 hover:bg-purple-50">
              <Upload className="w-4 h-4 mr-2" />
              Generate Rx Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>AI Management Plan & Translation</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="plan">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="plan">Management Plan</TabsTrigger>
                <TabsTrigger value="translate">Translate Rx</TabsTrigger>
              </TabsList>
              <TabsContent value="plan">
                <ManagementPlanGenerator
                  diagnosis={formData.diagnosis}
                  patientAge={patient.age_years}
                  patientWeight={formData.weight}
                  labResults={formData.lab_results}
                  visitData={formData}
                  onPlanGenerated={(plan) => setGeneratedPlan(plan)}
                />
              </TabsContent>
              <TabsContent value="translate">
                <PrescriptionTranslator 
                  prescriptionText={generatedPlan?.medications?.map(m => 
                    `${m.drug} - ${m.dose}, ${m.frequency}, ${m.duration}`
                  ).join('\n')}
                />
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-base">Assessment & Plan</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div>
            <Label>Diagnosis</Label>
            <Input
              value={formData.diagnosis}
              onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
              placeholder="Clinical diagnosis"
            />
          </div>

          <div>
            <Label>Treatment Plan</Label>
            <Textarea
              value={formData.treatment_plan}
              onChange={(e) => setFormData({...formData, treatment_plan: e.target.value})}
              placeholder="Management plan, medications, investigations..."
              className="h-32"
            />
          </div>

          <div>
            <Label>Follow-up Date</Label>
            <Input
              type="date"
              value={formData.follow_up_date}
              onChange={(e) => setFormData({...formData, follow_up_date: e.target.value})}
            />
          </div>

          <div>
            <Label>Clinician Notes</Label>
            <Textarea
              value={formData.clinician_notes}
              onChange={(e) => setFormData({...formData, clinician_notes: e.target.value})}
              placeholder="Private notes..."
              className="h-20"
            />
          </div>
        </CardContent>
      </Card>

      <Button
        type="submit"
        disabled={createVisitMutation.isPending}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-6"
      >
        {createVisitMutation.isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Visit Record"
        )}
      </Button>
    </form>
      </TabsContent>
    </Tabs>
  );
}

export default function VisitForm(props) {
  return (
    <VisitDataProvider>
      <VisitFormInner {...props} />
    </VisitDataProvider>
  );
}