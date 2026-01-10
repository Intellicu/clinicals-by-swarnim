
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, LineChart, TrendingUp, AlertTriangle, Info, Microscope, Activity, Heart } from "lucide-react";
import QuickPatientEntry from "../components/QuickPatientEntry";
import { usePatient } from "../components/PatientContext";

export default function PredictionTools() {
  const { patientData } = usePatient();
  
  const [activeTab, setActiveTab] = useState("nephrotic-relapse"); // Renamed from activePredictor
  const [result, setResult] = useState(null);

  // IgA Nephropathy Risk Score
  const [iganGFR, setIganGFR] = useState("");
  const [iganProteinuria, setIganProteinuria] = useState("");
  const [iganBP, setIganBP] = useState("normal"); // Set initial value for consistency
  const [iganHistology, setIganHistology] = useState("M0E0S0T0");

  // CKiD ESRD Progression
  const [ckidGFR, setCkidGFR] = useState("");
  const [ckidProteinuria, setCkidProteinuria] = useState("");
  const [ckidEtiology, setCkidEtiology] = useState("glomerular");

  // SRNS Relapse Risk (now "Nephrotic Relapse Risk")
  const [srnsAge, setSrnsAge] = useState(patientData.age || "");
  const [srnsRelapses, setSrnsRelapses] = useState("");
  const [srnsInitialResponse, setSrnsInitialResponse] = useState("early");
  const [srnsSteroidDuration, setSrnsSteroidDuration] = useState("");

  // Transplant Rejection Risk
  const [transplantInputs, setTransplantInputs] = useState({
    recipientAge: patientData.age || "",
    donorType: "deceased",
    hlaMismatch: "",
    previousTransplant: "no",
    timing: "acute",
    immunosuppression: "standard",
  });

  const handleTransplantChange = (field, value) => {
    setTransplantInputs((prev) => ({ ...prev, [field]: value }));
  };

  const calculateIgANRisk = () => {
    let riskScore = 0;
    let riskFactors = [];

    const gfr = parseFloat(iganGFR);
    if (isNaN(gfr)) { 
      setResult({tool: "IgA Nephropathy Risk Prediction", error: "Please enter a valid GFR."}); 
      return; 
    }
    
    if (gfr < 30) {
      riskScore += 3;
      riskFactors.push("Severe CKD (GFR <30)");
    } else if (gfr < 60) {
      riskScore += 2;
      riskFactors.push("Moderate CKD (GFR 30-60)");
    } else if (gfr < 90) {
      riskScore += 1;
      riskFactors.push("Mild CKD (GFR 60-90)");
    }

    const proteinuria = parseFloat(iganProteinuria);
    if (isNaN(proteinuria)) { 
      setResult({tool: "IgA Nephropathy Risk Prediction", error: "Please enter valid proteinuria."}); 
      return; 
    }
    
    if (proteinuria > 3) {
      riskScore += 3;
      riskFactors.push("Nephrotic range proteinuria (>3 g/day)");
    } else if (proteinuria > 1) {
      riskScore += 2;
      riskFactors.push("Significant proteinuria (1-3 g/day)");
    } else if (proteinuria > 0.5) {
      riskScore += 1;
      riskFactors.push("Mild proteinuria (0.5-1 g/day)");
    }

    if (iganBP === "uncontrolled") {
      riskScore += 2;
      riskFactors.push("Uncontrolled hypertension");
    } else if (iganBP === "controlled") {
      riskScore += 1;
      riskFactors.push("Controlled hypertension");
    }

    if (iganHistology.includes("M1")) {
      riskScore += 1;
      riskFactors.push("Mesangial hypercellularity (M1)");
    }
    if (iganHistology.includes("E1")) {
      riskScore += 1;
      riskFactors.push("Endocapillary proliferation (E1)");
    }
    if (iganHistology.includes("S1")) {
      riskScore += 2;
      riskFactors.push("Segmental sclerosis (S1)");
    }
    if (iganHistology.includes("T1") || iganHistology.includes("T2")) {
      riskScore += 2;
      riskFactors.push("Tubular atrophy/interstitial fibrosis");
    }

    let riskLevel = "";
    let fiveYearESRDRisk = "";
    let management = [];

    if (riskScore <= 3) {
      riskLevel = "Low Risk";
      fiveYearESRDRisk = "<10%";
      management = [
        "Conservative management with ACE-i/ARB",
        "Blood pressure control (<130/80)",
        "Monitor annually",
        "Lifestyle modifications"
      ];
    } else if (riskScore <= 6) {
      riskLevel = "Moderate Risk";
      fiveYearESRDRisk = "10-30%";
      management = [
        "ACE-i/ARB optimization",
        "Strict BP control (<125/75)",
        "Consider immunosuppression (steroids, MMF, cyclophosphamide)",
        "Monitor every 3-6 months",
        "Nephrology follow-up"
      ];
    } else {
      riskLevel = "High Risk";
      fiveYearESRDRisk = ">30%";
      management = [
        "Aggressive immunosuppression indicated",
        "Pulse steroids + MMF or cyclophosphamide",
        "Strict BP and proteinuria control",
        "Monitor monthly",
        "Consider clinical trial enrollment",
        "Prepare for dialysis/transplant"
      ];
    }

    setResult({
      tool: "IgA Nephropathy Risk Prediction",
      riskScore,
      riskLevel,
      prediction: `5-year ESRD risk: ${fiveYearESRDRisk}`,
      riskFactors,
      management,
      safetyLevel: riskScore > 6 ? "critical" : riskScore > 3 ? "caution" : "safe",
      references: [
        "Barbour SJ et al. International IgA Nephropathy Prediction Tool. JASN 2019.",
        "KDIGO Clinical Practice Guideline for Glomerular Diseases 2021."
      ]
    });
  };

  const calculateCKiDESRD = () => {
    const gfr = parseFloat(ckidGFR);
    const upcr = parseFloat(ckidProteinuria);
    
    if (isNaN(gfr)) { 
      setResult({tool: "CKiD ESRD Progression Risk", error: "Please enter a valid GFR."}); 
      return; 
    }
    if (isNaN(upcr)) { 
      setResult({tool: "CKiD ESRD Progression Risk", error: "Please enter valid UPCR."}); 
      return; 
    }

    let riskScore = 0;
    let riskFactors = [];

    if (gfr < 20) {
      riskScore += 5;
      riskFactors.push("Severe CKD (GFR <20)");
    } else if (gfr < 30) {
      riskScore += 4;
      riskFactors.push("Advanced CKD (GFR 20-30)");
    } else if (gfr < 45) {
      riskScore += 3;
      riskFactors.push("Moderate CKD (GFR 30-45)");
    } else if (gfr < 60) {
      riskScore += 2;
      riskFactors.push("Mild-moderate CKD (GFR 45-60)");
    }

    if (upcr > 2) {
      riskScore += 3;
      riskFactors.push("Nephrotic range proteinuria (UPCR >2)");
    } else if (upcr > 0.5) {
      riskScore += 2;
      riskFactors.push("Significant proteinuria (UPCR 0.5-2)");
    } else if (upcr > 0.2) {
      riskScore += 1;
      riskFactors.push("Mild proteinuria (UPCR 0.2-0.5)");
    }

    if (ckidEtiology === "glomerular") {
      riskScore += 2;
      riskFactors.push("Glomerular disease etiology");
    } else if (ckidEtiology === "congenital") {
      riskScore += 1;
      riskFactors.push("Congenital/structural disease");
    }

    let riskLevel = "";
    let fiveYearESRDRisk = "";
    let timeToESRD = "";

    if (riskScore <= 4) {
      riskLevel = "Low Risk";
      fiveYearESRDRisk = "<15%";
      timeToESRD = ">10 years";
    } else if (riskScore <= 8) {
      riskLevel = "Moderate Risk";
      fiveYearESRDRisk = "15-40%";
      timeToESRD = "5-10 years";
    } else {
      riskLevel = "High Risk";
      fiveYearESRDRisk = ">40%";
      timeToESRD = "<5 years";
    }

    setResult({
      tool: "CKiD ESRD Progression Risk",
      riskScore,
      riskLevel,
      prediction: `5-year ESRD risk: ${fiveYearESRDRisk} | Estimated time to ESRD: ${timeToESRD}`,
      riskFactors,
      management: [
        "Optimize CKD management (BP, anemia, bone disease)",
        "Proteinuria reduction with ACE-i/ARB",
        "Dietary counseling (protein, phosphate, potassium restriction)",
        "Prepare for dialysis access if high risk",
        "Early transplant evaluation",
        "Growth monitoring and optimization",
        "Psychosocial support"
      ],
      safetyLevel: riskScore > 8 ? "critical" : riskScore > 4 ? "caution" : "safe",
      references: [
        "Furth SL et al. CKiD Study. CJASN 2011.",
        "Warady BA et al. CKD Progression in Children. CJASN 2015."
      ]
    });
  };

  const calculateSRNSRelapse = () => {
    const age = parseFloat(srnsAge);
    const relapses = parseInt(srnsRelapses);
    const duration = parseInt(srnsSteroidDuration);

    if (isNaN(age)) { 
      setResult({tool: "SRNS Relapse Risk Prediction", error: "Please enter a valid age."}); 
      return; 
    }
    if (isNaN(relapses)) { 
      setResult({tool: "SRNS Relapse Risk Prediction", error: "Please enter a valid number of relapses."}); 
      return; 
    }
    if (isNaN(duration)) { 
      setResult({tool: "SRNS Relapse Risk Prediction", error: "Please enter a valid steroid duration."}); 
      return; 
    }

    let riskScore = 0;
    let riskFactors = [];

    if (age < 3) {
      riskScore += 3;
      riskFactors.push("Very young age (<3 years)");
    } else if (age < 6) {
      riskScore += 2;
      riskFactors.push("Young age (<6 years)");
    }

    if (srnsInitialResponse === "late") {
      riskScore += 2;
      riskFactors.push("Late initial response (>14 days)");
    } else if (srnsInitialResponse === "delayed") {
      riskScore += 3;
      riskFactors.push("Delayed initial response (>21 days)");
    }

    if (relapses >= 4) {
      riskScore += 3;
      riskFactors.push("Frequent relapses (≥4 in 12 months)");
    } else if (relapses >= 2) {
      riskScore += 2;
      riskFactors.push("Multiple relapses (2-3 in 12 months)");
    }

    if (duration > 12) {
      riskScore += 2;
      riskFactors.push("Prolonged steroid requirement (>12 months)");
    }

    let riskLevel = "";
    let oneYearRelapseRisk = "";
    let steroidSparing = [];

    if (riskScore <= 3) {
      riskLevel = "Low Relapse Risk";
      oneYearRelapseRisk = "<30%";
      steroidSparing = ["Monitor clinically", "Standard prednisolone taper"];
    } else if (riskScore <= 6) {
      riskLevel = "Moderate Relapse Risk";
      oneYearRelapseRisk = "30-60%";
      steroidSparing = [
        "Consider steroid-sparing agent:",
        "  • Levamisole 2.5 mg/kg alternate days",
        "  • Cyclophosphamide 2 mg/kg/day × 8-12 weeks",
        "Frequent monitoring"
      ];
    } else {
      riskLevel = "High Relapse Risk / Steroid Dependent";
      oneYearRelapseRisk = ">60%";
      steroidSparing = [
        "Steroid-sparing immunosuppression recommended:",
        "  • Cyclosporine 4-5 mg/kg/day (target level 80-120)",
        "  • Tacrolimus 0.1-0.15 mg/kg/day (target level 5-7)",
        "  • Mycophenolate 600 mg/m² BD",
        "  • Rituximab for resistant cases",
        "Genetic testing (consider SRNS panel)",
        "Nephrology specialist follow-up"
      ];
    }

    setResult({
      tool: "SRNS Relapse Risk Prediction",
      riskScore,
      riskLevel,
      prediction: `1-year relapse risk: ${oneYearRelapseRisk}`,
      riskFactors,
      management: steroidSparing,
      safetyLevel: riskScore > 6 ? "caution" : "safe",
      references: [
        "KDIGO Glomerular Disease Guideline 2021.",
        "IPNA Guidelines for Nephrotic Syndrome 2021.",
        "IAP Consensus on Steroid-Resistant Nephrotic Syndrome 2022."
      ]
    });
  };

  const calculateTransplantRejectionRisk = () => {
    let riskScore = 0;
    let riskFactors = [];
    const { recipientAge, donorType, hlaMismatch, previousTransplant, timing, immunosuppression } = transplantInputs;

    const age = parseFloat(recipientAge);
    if (isNaN(age)) { 
      setResult({tool: "Kidney Transplant Rejection Risk", error: "Please enter a valid recipient age."}); 
      return; 
    }
    
    if (age < 5) { 
      riskScore += 2; 
      riskFactors.push("Very young recipient age (<5 years)"); 
    } else if (age > 16) { 
      riskScore += 1; 
      riskFactors.push("Adolescent recipient age (>16 years)"); 
    }

    if (donorType === "deceased") { 
      riskScore += 2; 
      riskFactors.push("Deceased donor kidney"); 
    } else if (donorType === "expandedCriteria") { 
      riskScore += 3; 
      riskFactors.push("Expanded criteria deceased donor"); 
    }

    const hla = parseInt(hlaMismatch);
    if (!isNaN(hla)) {
      if (hla >= 4) { 
        riskScore += 3; 
        riskFactors.push(`High HLA mismatch (${hla} antigens)`); 
      } else if (hla >= 2) { 
        riskScore += 1; 
        riskFactors.push(`Moderate HLA mismatch (${hla} antigens)`); 
      }
    }

    if (previousTransplant === "yes") { 
      riskScore += 3; 
      riskFactors.push("History of previous transplant"); 
    }

    if (timing === "hyperacute") { 
      riskScore += 5; 
      riskFactors.push("Hyperacute rejection identified"); 
    } else if (timing === "acute") { 
      riskScore += 2; 
      riskFactors.push("Acute rejection (days to weeks post-transplant)"); 
    } else if (timing === "delayed") { 
      riskScore += 1; 
      riskFactors.push("Delayed rejection (>21 days post-transplant)"); 
    }

    if (immunosuppression === "minimal") { 
      riskScore += 2; 
      riskFactors.push("Minimal immunosuppression regimen"); 
    } else if (immunosuppression === "nonAdherence") { 
      riskScore += 4; 
      riskFactors.push("Immunosuppression non-adherence"); 
    }

    let riskLevel = "";
    let prognosis = "";
    let management = [];

    if (riskScore <= 3) {
      riskLevel = "Low Risk";
      prognosis = "Good long-term graft survival likelihood.";
      management = [
        "Standard immunosuppression adherence", 
        "Regular monitoring (GFR, proteinuria, drug levels)", 
        "Blood pressure and metabolic control"
      ];
    } else if (riskScore <= 7) {
      riskLevel = "Moderate Risk";
      prognosis = "Increased risk of rejection/graft dysfunction. Close monitoring needed.";
      management = [
        "Intensify monitoring (protocol biopsies as needed)", 
        "Optimize immunosuppression (dose adjustment)", 
        "Consider CNI withdrawal if stable"
      ];
    } else {
      riskLevel = "High Risk";
      prognosis = "Significant risk of graft loss. Aggressive intervention required.";
      management = [
        "Aggressive anti-rejection therapy (ATG, IVIG, plasmapheresis)", 
        "Consider re-transplantation evaluation", 
        "Close nephrology and transplant follow-up"
      ];
    }

    setResult({
      tool: "Kidney Transplant Rejection Risk",
      riskScore,
      riskLevel,
      prediction: prognosis,
      riskFactors,
      management,
      safetyLevel: riskScore > 7 ? "critical" : riskScore > 3 ? "caution" : "safe",
      references: [
        "KDIGO Kidney Transplant Recipient Guidelines 2009.",
        "UNOS/OPTN Policies and Data Reports.",
        "American Society of Transplantation Guidelines."
      ]
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="mb-6">
          <Link to={createPageUrl("Hub")}>
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <LineChart className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Clinical Prediction Tools</h1>
              <p className="text-slate-600">Evidence-based risk scores and prognostic calculators - CliniCals by Swarnim</p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-100 p-1 rounded-xl">
            <TabsTrigger value="nephrotic-relapse" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow">
              <TrendingUp className="w-4 h-4 mr-2" />
              Nephrotic Relapse Risk
            </TabsTrigger>
            <TabsTrigger value="igan" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow">
              <Microscope className="w-4 h-4 mr-2" />
              IgAN Risk
            </TabsTrigger>
            <TabsTrigger value="ckid" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow">
              <Activity className="w-4 h-4 mr-2" />
              CKiD ESRD Risk
            </TabsTrigger>
            <TabsTrigger value="transplant" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow">
              <Heart className="w-4 h-4 mr-2" />
              Transplant Outcomes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="nephrotic-relapse">
            <Card className="shadow-lg border-2 border-purple-300">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b-2 border-purple-200">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                  Nephrotic Syndrome Relapse Risk Predictor
                </CardTitle>
                <p className="text-sm text-slate-600 mt-2">Predict relapse risk in steroid-sensitive and steroid-resistant nephrotic syndrome</p>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold text-slate-700">Age at Onset (years)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={srnsAge}
                      onChange={(e) => setSrnsAge(e.target.value)}
                      placeholder="e.g., 4.5"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-slate-700">Number of Relapses (past 12 months)</Label>
                    <Input
                      type="number"
                      value={srnsRelapses}
                      onChange={(e) => setSrnsRelapses(e.target.value)}
                      placeholder="e.g., 3"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-slate-700">Initial Response to Steroids</Label>
                    <Select value={srnsInitialResponse} onValueChange={setSrnsInitialResponse}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="early">Early (&le;7 days)</SelectItem>
                        <SelectItem value="standard">Standard (8-14 days)</SelectItem>
                        <SelectItem value="late">Late (15-21 days)</SelectItem>
                        <SelectItem value="delayed">Delayed (&gt;21 days)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-slate-700">Total Steroid Duration (months)</Label>
                    <Input
                      type="number"
                      value={srnsSteroidDuration}
                      onChange={(e) => setSrnsSteroidDuration(e.target.value)}
                      placeholder="e.g., 8"
                      className="mt-1"
                    />
                  </div>
                </div>
                <Button 
                  onClick={calculateSRNSRelapse}
                  disabled={!srnsAge || !srnsRelapses || !srnsSteroidDuration || !srnsInitialResponse}
                  className="w-full bg-purple-600 hover:bg-purple-700 py-6"
                >
                  Calculate Relapse Risk
                </Button>
                <Alert className="bg-blue-50 border-blue-200">
                  <Info className="w-4 h-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    This predictor helps stratify relapse risk in children with nephrotic syndrome based on clinical and pathological features.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="igan">
            <Card className="bg-white shadow-lg">
              <CardHeader className="bg-blue-50 border-b">
                <CardTitle className="text-lg">IgA Nephropathy Risk Prediction Tool</CardTitle>
                <p className="text-sm text-slate-600 mt-1">
                  Predicts 5-year risk of ESRD based on clinical and histological parameters
                </p>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold text-slate-700">eGFR (mL/min/1.73m²)</Label>
                    <Input
                      type="number"
                      value={iganGFR}
                      onChange={(e) => setIganGFR(e.target.value)}
                      placeholder="e.g., 75"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-slate-700">Proteinuria (g/day)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={iganProteinuria}
                      onChange={(e) => setIganProteinuria(e.target.value)}
                      placeholder="e.g., 1.5"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-slate-700">Blood Pressure</Label>
                    <Select value={iganBP} onValueChange={setIganBP}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="controlled">Controlled HTN</SelectItem>
                        <SelectItem value="uncontrolled">Uncontrolled HTN</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-slate-700">MEST-C Score</Label>
                    <Input
                      value={iganHistology}
                      onChange={(e) => setIganHistology(e.target.value)}
                      placeholder="e.g., M1E0S1T0"
                      className="mt-1"
                    />
                    <p className="text-xs text-slate-500 mt-1">From biopsy report</p>
                  </div>
                </div>
                <Button 
                  onClick={calculateIgANRisk}
                  disabled={!iganGFR || !iganProteinuria || !iganBP}
                  className="w-full bg-blue-600 hover:bg-blue-700 py-6"
                >
                  Calculate IgAN Risk
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ckid">
            <Card className="bg-white shadow-lg">
              <CardHeader className="bg-green-50 border-b">
                <CardTitle className="text-lg">CKiD ESRD Progression Calculator</CardTitle>
                <p className="text-sm text-slate-600 mt-1">
                  Estimates time to ESRD in children with CKD
                </p>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold text-slate-700">Current eGFR (mL/min/1.73m²)</Label>
                    <Input
                      type="number"
                      value={ckidGFR}
                      onChange={(e) => setCkidGFR(e.target.value)}
                      placeholder="e.g., 35"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-slate-700">Urine Protein/Creatinine Ratio</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={ckidProteinuria}
                      onChange={(e) => setCkidProteinuria(e.target.value)}
                      placeholder="e.g., 1.2"
                      className="mt-1"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-sm font-semibold text-slate-700">CKD Etiology</Label>
                    <Select value={ckidEtiology} onValueChange={setCkidEtiology}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="glomerular">Glomerular (GN, NS)</SelectItem>
                        <SelectItem value="congenital">Congenital/CAKUT</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button 
                  onClick={calculateCKiDESRD}
                  disabled={!ckidGFR || !ckidProteinuria || !ckidEtiology}
                  className="w-full bg-green-600 hover:bg-green-700 py-6"
                >
                  Calculate ESRD Risk
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transplant"> {/* Changed from value="rejection" */}
            <Card className="bg-white shadow-lg">
              <CardHeader className="bg-red-50 border-b">
                <CardTitle className="text-lg">Kidney Transplant Rejection Risk</CardTitle>
                <p className="text-sm text-slate-600 mt-1">
                  Assesses factors influencing kidney allograft rejection
                </p>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold text-slate-700">Recipient Age (years)</Label>
                    <Input
                      type="number"
                      value={transplantInputs.recipientAge}
                      onChange={(e) => handleTransplantChange("recipientAge", e.target.value)}
                      placeholder="e.g., 10"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-slate-700">Donor Type</Label>
                    <Select value={transplantInputs.donorType} onValueChange={(val) => handleTransplantChange("donorType", val)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="living">Living Donor</SelectItem>
                        <SelectItem value="deceased">Deceased Donor</SelectItem>
                        <SelectItem value="expandedCriteria">Expanded Criteria Deceased Donor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-slate-700">HLA Mismatch (Number of antigens)</Label>
                    <Input
                      type="number"
                      value={transplantInputs.hlaMismatch}
                      onChange={(e) => handleTransplantChange("hlaMismatch", e.target.value)}
                      placeholder="e.g., 3"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-slate-700">Previous Transplant?</Label>
                    <Select value={transplantInputs.previousTransplant} onValueChange={(val) => handleTransplantChange("previousTransplant", val)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no">No</SelectItem>
                        <SelectItem value="yes">Yes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-slate-700">Rejection Timing</Label>
                    <Select value={transplantInputs.timing} onValueChange={(val) => handleTransplantChange("timing", val)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hyperacute">Hyperacute (&lt;24 hours)</SelectItem>
                        <SelectItem value="acute">Acute (Days to weeks)</SelectItem>
                        <SelectItem value="delayed">Delayed (&gt;21 days)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-slate-700">Immunosuppression Regimen</Label>
                    <Select value={transplantInputs.immunosuppression} onValueChange={(val) => handleTransplantChange("immunosuppression", val)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard Triple Therapy</SelectItem>
                        <SelectItem value="minimal">Minimal Immunosuppression</SelectItem>
                        <SelectItem value="nonAdherence">Reported Non-adherence</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button 
                  onClick={calculateTransplantRejectionRisk}
                  disabled={
                    !transplantInputs.recipientAge || 
                    !transplantInputs.donorType || 
                    !transplantInputs.previousTransplant || 
                    !transplantInputs.timing ||
                    !transplantInputs.immunosuppression
                  }
                  className="w-full bg-red-600 hover:bg-red-700 py-6"
                >
                  Calculate Rejection Risk
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Results Display */}
        {result && result.error ? (
          <Alert className="bg-red-50 border-red-200">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-sm text-red-800">
              <strong>Error:</strong> {result.error}
            </AlertDescription>
          </Alert>
        ) : result && (
          <Card className={`shadow-xl ${
            result.safetyLevel === "critical" ? "border-red-500 border-2" :
            result.safetyLevel === "caution" ? "border-amber-500 border-2" :
            "border-green-500 border-2"
          }`}>
            <CardHeader className={`${
              result.safetyLevel === "critical" ? "bg-red-50" :
              result.safetyLevel === "caution" ? "bg-amber-50" :
              "bg-green-50"
            } border-b`}>
              <CardTitle className="text-xl">{result.tool}</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-slate-600">Risk Level</Label>
                    <div className="text-2xl font-bold text-slate-900 mt-1">{result.riskLevel}</div>
                    <Badge className={`mt-2 ${
                      result.safetyLevel === "critical" ? "bg-red-100 text-red-800" :
                      result.safetyLevel === "caution" ? "bg-amber-100 text-amber-800" :
                      "bg-green-100 text-green-800"
                    }`}>
                      Risk Score: {result.riskScore}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-600">Prediction</Label>
                    <div className="text-lg font-semibold text-slate-900 mt-1">{result.prediction}</div>
                  </div>
                </div>

                {result.riskFactors.length > 0 && (
                  <div>
                    <Label className="text-sm font-semibold text-slate-700 mb-2 block">Risk Factors Identified</Label>
                    <ul className="space-y-1">
                      {result.riskFactors.map((factor, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                          <TrendingUp className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <Label className="text-sm font-semibold text-slate-700 mb-2 block">Management Recommendations</Label>
                  <ul className="space-y-1">
                    {result.management.map((item, idx) => (
                      <li key={idx} className="text-sm text-slate-700 pl-4">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <Alert className="bg-blue-50 border-blue-200">
                  <Info className="w-4 h-4 text-blue-600" />
                  <AlertDescription className="text-sm text-blue-800">
                    <strong>Validation Studies:</strong>
                    {result.references.map((ref, idx) => (
                      <div key={idx} className="mt-1">• {ref}</div>
                    ))}
                  </AlertDescription>
                </Alert>

                <Alert className="bg-amber-50 border-amber-200">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <AlertDescription className="text-sm text-amber-800">
                    <strong>Disclaimer:</strong> Prediction tools provide risk estimates based on population studies. 
                    Individual outcomes may vary. Use in conjunction with clinical judgment and regular monitoring.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
