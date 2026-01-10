import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CalculatorShell from "../components/calculators/CalculatorShell";
import { usePatient } from "../components/PatientContext";
import { ArrowLeft, Droplet, AlertTriangle, Download, Copy } from "lucide-react";
import { toast } from "sonner";

export default function SodiumCalculator() {
  const { patientData } = usePatient();
  
  // Auto-fill from patient data
  const [weight, setWeight] = useState(patientData.weight || "");
  const [currentNa, setCurrentNa] = useState(patientData.serumSodium || "");
  const [targetNa, setTargetNa] = useState("");
  
  // Clinical assessment
  const [severity, setSeverity] = useState("");
  const [symptoms, setSymptoms] = useState([]);
  const [duration, setDuration] = useState("");
  const [volumeStatus, setVolumeStatus] = useState("");
  const [urineSodium, setUrineSodium] = useState("");
  const [urineOsmolality, setUrineOsmolality] = useState("");
  
  const [results, setResults] = useState(null);
  const [managementPlan, setManagementPlan] = useState(null);

  React.useEffect(() => {
    setWeight(patientData.weight || weight);
    setCurrentNa(patientData.serumSodium || currentNa);
  }, [patientData]);

  const generatePlanMutation = useMutation({
    mutationFn: async (params) => {
      const naDeficit = (parseFloat(targetNa) - parseFloat(currentNa)) * parseFloat(weight) * 0.6;
      const isHyponatremia = parseFloat(currentNa) < 135;
      const isHypernatremia = parseFloat(currentNa) > 145;
      
      let prompt = `Generate a comprehensive management plan for ${isHyponatremia ? 'hyponatremia' : 'hypernatremia'} in a pediatric patient.

Patient Details:
- Weight: ${weight} kg
- Current Na: ${currentNa} mEq/L
- Target Na: ${targetNa} mEq/L
- Severity: ${severity || 'Not specified'}
- Symptoms: ${symptoms.join(', ') || 'None'}
- Duration: ${duration || 'Unknown'}
- Volume Status: ${volumeStatus || 'Not assessed'}
- Urine Sodium: ${urineSodium || 'Not available'} mEq/L
- Urine Osmolality: ${urineOsmolality || 'Not available'} mOsm/kg

Sodium Deficit/Excess: ${Math.abs(naDeficit).toFixed(0)} mEq

Generate a detailed management plan with:

1. DIAGNOSIS & CLASSIFICATION:
   - Type of disorder
   - Severity classification
   - Likely etiology based on urine studies

2. FLUID PRESCRIPTION:
   - Type of fluid (specify: Normal Saline, 3% Saline, 0.45% Saline, D5W, etc.)
   - Total volume needed (mL)
   - Rate of administration (mL/hr)
   - Duration of therapy
   - Correction rate limits (${isHyponatremia ? 'max 10-12 mEq/L/24h' : 'max 10-12 mEq/L/24h'})

3. MONITORING PLAN:
   - Frequency of Na checks
   - Other labs to monitor
   - Clinical parameters
   - When to adjust therapy

4. SAFETY CONSIDERATIONS:
   - Maximum correction rate
   - Risks to avoid (osmotic demyelination vs cerebral edema)
   - Red flags
   - When to escalate care

5. ADDITIONAL MANAGEMENT:
   - Treat underlying cause
   - Medication adjustments
   - Fluid restriction if needed
   - Dietary modifications

6. THINGS TO AVOID:
   - Overcorrection risks
   - Medications to avoid
   - Pitfalls in management

Format as structured clinical protocol.`;

      const plan = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: true
      });

      return plan;
    },
    onSuccess: (plan) => {
      setManagementPlan(plan);
      toast.success("Management plan generated!");
    }
  });

  const handleCalculate = () => {
    if (!weight || !currentNa || !targetNa) {
      toast.error("Please enter weight, current Na, and target Na");
      return;
    }

    const wt = parseFloat(weight);
    const currNa = parseFloat(currentNa);
    const targNa = parseFloat(targetNa);
    
    // Sodium deficit/excess calculation
    const naDeficit = (targNa - currNa) * wt * 0.6;
    const tbw = wt * 0.6;
    
    // Determine disorder
    const isHyponatremia = currNa < 135;
    const isHypernatremia = currNa > 145;
    const disorder = isHyponatremia ? "Hyponatremia" : isHypernatremia ? "Hypernatremia" : "Normal";
    
    // Severity
    let severityLevel = "Mild";
    let alerts = [];
    
    if (isHyponatremia) {
      if (currNa < 125) {
        severityLevel = "Severe";
        alerts.push({
          severity: "critical",
          title: "Severe Hyponatremia",
          message: "Na <125 mEq/L - High risk of cerebral edema. Consider 3% saline if symptomatic."
        });
      } else if (currNa < 130) {
        severityLevel = "Moderate";
        alerts.push({
          severity: "warning",
          title: "Moderate Hyponatremia",
          message: "Monitor closely. Correct slowly to avoid osmotic demyelination."
        });
      }
    } else if (isHypernatremia) {
      if (currNa > 160) {
        severityLevel = "Severe";
        alerts.push({
          severity: "critical",
          title: "Severe Hypernatremia",
          message: "Na >160 mEq/L - High risk. Correct slowly over 48h to avoid cerebral edema."
        });
      } else if (currNa > 150) {
        severityLevel = "Moderate";
      }
    }

    setResults({
      safetyLevel: alerts.some(a => a.severity === "critical") ? "critical" : 
                   alerts.length > 0 ? "caution" : "safe",
      primaryResults: [
        {
          label: "Disorder",
          value: disorder,
          subtext: `${severityLevel} (${currNa} mEq/L)`
        },
        {
          label: "Na Deficit/Excess",
          value: `${Math.abs(naDeficit).toFixed(0)} mEq`,
          subtext: isHyponatremia ? "Deficit" : "Excess"
        },
        {
          label: "Total Body Water",
          value: `${tbw.toFixed(1)} L`,
          subtext: `60% of ${wt} kg`
        },
        {
          label: "Max Correction",
          value: "10-12 mEq/L",
          subtext: "Per 24 hours"
        }
      ],
      safetyAlerts: alerts.length > 0 ? alerts : undefined,
      calculationTrace: [
        `Weight: ${wt} kg`,
        `Current Na: ${currNa} mEq/L`,
        `Target Na: ${targNa} mEq/L`,
        `TBW: ${wt} × 0.6 = ${tbw.toFixed(1)} L`,
        `Na Deficit: (${targNa} - ${currNa}) × ${wt} × 0.6 = ${naDeficit.toFixed(0)} mEq`
      ],
      additionalInfo: [
        "Correct hyponatremia max 10-12 mEq/L/24h to avoid osmotic demyelination",
        "Correct hypernatremia max 10-12 mEq/L/24h to avoid cerebral edema",
        "Check Na every 2-4 hours during active correction",
        "Consider underlying cause (SIADH, dehydration, renal losses)"
      ],
      references: [
        "KDIGO Clinical Practice Guideline for Acute Kidney Injury. 2012.",
        "Pediatric Fluid and Electrolyte Therapy. Moritz ML, Ayus JC. 2021.",
        "Hyponatremia in Children. Greenbaum LA. Pediatric Nephrology 2020."
      ]
    });

    // Auto-generate management plan
    generatePlanMutation.mutate({
      weight, currentNa, targetNa, severity, symptoms, duration, 
      volumeStatus, urineSodium, urineOsmolality, naDeficit
    });
  };

  const handleCopy = () => {
    if (managementPlan) {
      navigator.clipboard.writeText(managementPlan);
      toast.success("Management plan copied to clipboard");
    }
  };

  const handleDownload = () => {
    if (managementPlan) {
      const blob = new Blob([managementPlan], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Sodium_Management_Plan_${new Date().toISOString().split('T')[0]}.txt`;
      a.click();
      toast.success("Plan downloaded");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-5xl mx-auto">
        <Link to={createPageUrl("Hub")}>
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Hub
          </Button>
        </Link>

        <CalculatorShell
          title="Sodium Disorder Management"
          description="Comprehensive dysnatremia management with fluid prescription"
          lastReviewed="2025-01-28"
          references="KDIGO 2012, Pediatric Fluid Therapy 2021"
          results={results}
          showMonitoring={true}
        >
          <Tabs defaultValue="basic" className="mb-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="clinical">Clinical Assessment</TabsTrigger>
              <TabsTrigger value="labs">Lab Studies</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>Weight (kg) *</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="e.g., 25"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Current Na (mEq/L) *</Label>
                  <Input
                    type="number"
                    value={currentNa}
                    onChange={(e) => setCurrentNa(e.target.value)}
                    placeholder="e.g., 128"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Target Na (mEq/L) *</Label>
                  <Input
                    type="number"
                    value={targetNa}
                    onChange={(e) => setTargetNa(e.target.value)}
                    placeholder="e.g., 135"
                    className="mt-1"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="clinical" className="space-y-4 mt-4">
              <div>
                <Label>Severity</Label>
                <Select value={severity} onValueChange={setSeverity}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asymptomatic">Asymptomatic</SelectItem>
                    <SelectItem value="Mild symptoms">Mild Symptoms</SelectItem>
                    <SelectItem value="Moderate symptoms">Moderate Symptoms</SelectItem>
                    <SelectItem value="Severe symptoms">Severe Symptoms (seizures, coma)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Duration</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Acute (<48h)">Acute (&lt;48h)</SelectItem>
                    <SelectItem value="Chronic (>48h)">Chronic (&gt;48h)</SelectItem>
                    <SelectItem value="Unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Volume Status</Label>
                <Select value={volumeStatus} onValueChange={setVolumeStatus}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select volume status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hypovolemic">Hypovolemic (dehydrated)</SelectItem>
                    <SelectItem value="Euvolemic">Euvolemic (normal volume)</SelectItem>
                    <SelectItem value="Hypervolemic">Hypervolemic (fluid overload)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="labs" className="space-y-4 mt-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Urine Sodium (mEq/L)</Label>
                  <Input
                    type="number"
                    value={urineSodium}
                    onChange={(e) => setUrineSodium(e.target.value)}
                    placeholder="e.g., 40"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Urine Osmolality (mOsm/kg)</Label>
                  <Input
                    type="number"
                    value={urineOsmolality}
                    onChange={(e) => setUrineOsmolality(e.target.value)}
                    placeholder="e.g., 500"
                    className="mt-1"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Button
            onClick={handleCalculate}
            disabled={!weight || !currentNa || !targetNa}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6"
          >
            Generate Management Plan
          </Button>

          {managementPlan && (
            <>
              <Card className="mt-6 bg-slate-50">
                <CardHeader className="bg-slate-100 border-b">
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Droplet className="w-5 h-5" />
                      Comprehensive Management Plan
                    </span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={handleCopy}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleDownload}>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <Textarea
                    value={managementPlan}
                    onChange={(e) => setManagementPlan(e.target.value)}
                    className="min-h-[400px] font-mono text-sm"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    You can edit the plan above before copying or downloading
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </CalculatorShell>
      </div>
    </div>
  );
}