import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Stethoscope, FileText, Pill, TestTube, Brain, 
  AlertCircle, Plus, Save, Sparkles, Loader2 
} from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function DigitalPrescriptionPad({ patient, visitData, onSave }) {
  const [prescription, setPrescription] = useState({
    diagnosis: visitData?.diagnosis || "",
    clinical_notes: "",
    medications: [],
    lab_orders: "",
    follow_up_instructions: "",
    next_visit_date: ""
  });

  const [newMedication, setNewMedication] = useState({
    name: "",
    dose: "",
    frequency: "",
    duration: "",
    timing: ""
  });

  const [cdssRecommendations, setCdssRecommendations] = useState(null);
  const [loadingCDSS, setLoadingCDSS] = useState(false);

  const { data: drugs = [] } = useQuery({
    queryKey: ['drugs'],
    queryFn: () => base44.entities.Drug.list(),
    initialData: []
  });

  // CDSS Integration
  const generateCDSSRecommendations = async () => {
    setLoadingCDSS(true);
    try {
      const prompt = `As a clinical decision support system, analyze this patient case and provide:
1. Differential diagnoses to consider
2. Recommended investigations
3. Treatment recommendations with evidence level
4. Drug interactions and contraindications
5. Red flags to watch for

Patient: ${patient.patient_name}, Age: ${patient.age_years}, Gender: ${patient.gender}
Diagnosis: ${prescription.diagnosis}
Chief Complaint: ${visitData?.chief_complaint}
Vitals: BP ${visitData?.physical_examination?.bp_systolic}/${visitData?.physical_examination?.bp_diastolic}, Weight ${visitData?.physical_examination?.weight}kg
Current Medications: ${prescription.medications.map(m => m.name).join(', ')}
Clinical Notes: ${prescription.clinical_notes}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            differential_diagnoses: { type: "array", items: { type: "string" } },
            recommended_tests: { type: "array", items: { type: "string" } },
            treatment_recommendations: { type: "array", items: { type: "string" } },
            drug_interactions: { type: "array", items: { type: "string" } },
            red_flags: { type: "array", items: { type: "string" } }
          }
        }
      });

      setCdssRecommendations(response);
    } catch {
      toast.error("CDSS analysis failed");
    } finally {
      setLoadingCDSS(false);
    }
  };

  const addMedication = () => {
    if (!newMedication.name) {
      toast.error("Medication name required");
      return;
    }
    
    setPrescription(prev => ({
      ...prev,
      medications: [...prev.medications, { ...newMedication, id: Date.now() }]
    }));
    
    setNewMedication({ name: "", dose: "", frequency: "", duration: "", timing: "" });
    toast.success("Medication added");
  };

  const removeMedication = (id) => {
    setPrescription(prev => ({
      ...prev,
      medications: prev.medications.filter(m => m.id !== id)
    }));
  };

  const handleSave = async () => {
    try {
      await onSave(prescription);
      toast.success("Prescription saved!");
    } catch {
      toast.error("Save failed");
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Main Prescription Area */}
      <div className="lg:col-span-2 space-y-4">
        <Card className="bg-white shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-purple-600" />
              Digital Prescription Pad
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs defaultValue="clinical" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="clinical">Clinical</TabsTrigger>
                <TabsTrigger value="medications">Medications</TabsTrigger>
                <TabsTrigger value="labs">Labs</TabsTrigger>
                <TabsTrigger value="followup">Follow-up</TabsTrigger>
              </TabsList>

              <TabsContent value="clinical" className="space-y-4">
                <div>
                  <Label>Diagnosis *</Label>
                  <Input
                    value={prescription.diagnosis}
                    onChange={(e) => setPrescription(prev => ({ ...prev, diagnosis: e.target.value }))}
                    placeholder="Primary diagnosis"
                  />
                </div>
                <div>
                  <Label>Clinical Notes</Label>
                  <Textarea
                    value={prescription.clinical_notes}
                    onChange={(e) => setPrescription(prev => ({ ...prev, clinical_notes: e.target.value }))}
                    placeholder="Detailed clinical assessment..."
                    className="h-40"
                  />
                </div>
              </TabsContent>

              <TabsContent value="medications" className="space-y-4">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-3">Add Medication</h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Medicine Name</Label>
                        <Input
                          value={newMedication.name}
                          onChange={(e) => setNewMedication(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., Paracetamol"
                          list="drug-list"
                        />
                        <datalist id="drug-list">
                          {drugs.slice(0, 10).map(drug => (
                            <option key={drug.id} value={drug.generic_name} />
                          ))}
                        </datalist>
                      </div>
                      <div>
                        <Label className="text-xs">Dose</Label>
                        <Input
                          value={newMedication.dose}
                          onChange={(e) => setNewMedication(prev => ({ ...prev, dose: e.target.value }))}
                          placeholder="e.g., 500mg"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Frequency</Label>
                        <Input
                          value={newMedication.frequency}
                          onChange={(e) => setNewMedication(prev => ({ ...prev, frequency: e.target.value }))}
                          placeholder="e.g., TDS"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Timing</Label>
                        <Input
                          value={newMedication.timing}
                          onChange={(e) => setNewMedication(prev => ({ ...prev, timing: e.target.value }))}
                          placeholder="e.g., After meals"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Duration</Label>
                        <Input
                          value={newMedication.duration}
                          onChange={(e) => setNewMedication(prev => ({ ...prev, duration: e.target.value }))}
                          placeholder="e.g., 7 days"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button onClick={addMedication} className="w-full">
                          <Plus className="w-4 h-4 mr-2" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-2">
                  <h4 className="font-semibold">Prescribed Medications</h4>
                  {prescription.medications.length === 0 ? (
                    <p className="text-sm text-slate-500">No medications added</p>
                  ) : (
                    prescription.medications.map((med) => (
                      <div key={med.id} className="border rounded-lg p-3 flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{med.name}</p>
                          <p className="text-xs text-slate-600">
                            {med.dose} | {med.frequency} | {med.timing} | {med.duration}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeMedication(med.id)}
                          className="text-red-600"
                        >
                          Remove
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="labs" className="space-y-4">
                <div>
                  <Label>Laboratory Investigations</Label>
                  <Textarea
                    value={prescription.lab_orders}
                    onChange={(e) => setPrescription(prev => ({ ...prev, lab_orders: e.target.value }))}
                    placeholder="List investigations to be ordered..."
                    className="h-32"
                  />
                </div>
              </TabsContent>

              <TabsContent value="followup" className="space-y-4">
                <div>
                  <Label>Follow-up Instructions</Label>
                  <Textarea
                    value={prescription.follow_up_instructions}
                    onChange={(e) => setPrescription(prev => ({ ...prev, follow_up_instructions: e.target.value }))}
                    placeholder="Instructions for patient..."
                    className="h-24"
                  />
                </div>
                <div>
                  <Label>Next Visit Date</Label>
                  <Input
                    type="date"
                    value={prescription.next_visit_date}
                    onChange={(e) => setPrescription(prev => ({ ...prev, next_visit_date: e.target.value }))}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex gap-3 mt-6">
              <Button onClick={handleSave} className="flex-1 bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />
                Save Prescription
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CDSS Panel */}
      <div className="lg:col-span-1">
        <Card className="bg-white shadow-lg sticky top-6">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Brain className="w-5 h-5 text-indigo-600" />
                CDSS Assistant
              </CardTitle>
              <Button
                size="sm"
                onClick={generateCDSSRecommendations}
                disabled={loadingCDSS}
                className="bg-indigo-600"
              >
                {loadingCDSS ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 max-h-[600px] overflow-y-auto">
            {!cdssRecommendations ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                <Brain className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>Click the button above to get AI-powered clinical recommendations</p>
              </div>
            ) : (
              <div className="space-y-4 text-sm">
                {cdssRecommendations.red_flags?.length > 0 && (
                  <Alert className="bg-red-50 border-red-300">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <AlertDescription className="text-red-900">
                      <strong className="block mb-1">Red Flags:</strong>
                      <ul className="list-disc pl-4 space-y-1">
                        {cdssRecommendations.red_flags.map((flag, idx) => (
                          <li key={idx}>{flag}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    Differential Diagnoses
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-slate-700">
                    {cdssRecommendations.differential_diagnoses?.map((dx, idx) => (
                      <li key={idx}>{dx}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <TestTube className="w-4 h-4 text-green-600" />
                    Recommended Tests
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-slate-700">
                    {cdssRecommendations.recommended_tests?.map((test, idx) => (
                      <li key={idx}>{test}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Pill className="w-4 h-4 text-purple-600" />
                    Treatment Recommendations
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-slate-700">
                    {cdssRecommendations.treatment_recommendations?.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>

                {cdssRecommendations.drug_interactions?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700">
                      <AlertCircle className="w-4 h-4" />
                      Drug Interactions
                    </h4>
                    <ul className="list-disc pl-5 space-y-1 text-amber-700">
                      {cdssRecommendations.drug_interactions.map((interaction, idx) => (
                        <li key={idx}>{interaction}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}