import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Activity, AlertTriangle, CheckCircle, Droplet, Zap, Info, Calculator, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function HUSPathway() {
  const [step, setStep] = useState(1);
  const [patientData, setPatientData] = useState({
    hemoglobin: "",
    schistocytes: false,
    ldh: "",
    platelets: "",
    creatinine: "",
    hasBloodyDiarrhea: null,
    diarrheaDuration: "",
    hasPneumonia: null,
    ageMonths: ""
  });
  const [diagnosis, setDiagnosis] = useState(null);
  const [managementPlan, setManagementPlan] = useState(null);

  const assessHUS = () => {
    const hgb = parseFloat(patientData.hemoglobin);
    const ldh = parseFloat(patientData.ldh);
    const plt = parseFloat(patientData.platelets);

    const hasMaha = hgb < 10 && (patientData.schistocytes || ldh > 450);
    const hasThrombocytopenia = plt < 150000;
    const hasAKI = true;

    if (hasMaha && hasThrombocytopenia && hasAKI) {
      let husType = "Atypical HUS";
      let priority = "danger";
      
      if (patientData.hasBloodyDiarrhea && patientData.diarrheaDuration <= 21) {
        husType = "STEC-HUS (Suspected)";
        priority = "warning";
      } else if (patientData.hasPneumonia && parseFloat(patientData.ageMonths) < 24) {
        husType = "Pneumococcal HUS (Suspected)";
        priority = "danger";
      }

      setDiagnosis({
        confirmed: true,
        type: husType,
        priority,
        hasMaha,
        hasThrombocytopenia,
        hasAKI
      });

      generateManagement(husType);
    } else {
      const missingCriteria = [];
      if (!hasMaha) missingCriteria.push("MAHA (Hgb<10, schistocytes ≥2%, LDH>450)");
      if (!hasThrombocytopenia) missingCriteria.push("Thrombocytopenia (Plt<150,000)");
      if (!hasAKI) missingCriteria.push("Acute kidney injury");
      
      setDiagnosis({
        confirmed: false,
        missing: missingCriteria
      });
    }

    setStep(2);
  };

  const generateManagement = (husType) => {
    if (husType === "STEC-HUS (Suspected)") {
      setManagementPlan({
        immediate: [
          "SUPPORTIVE CARE - No PEX unless severe neuro/cardiac",
          "Early isotonic fluids from onset of diarrhea to prevent dehydration",
          "Monitor fluid balance (fluid overload increases mortality in AKI)",
          "Antibiotics: Ciprofloxacin 10 mg/kg BID OR azithromycin 10 mg/kg OD × 5 days"
        ],
        investigations: [
          "Stool culture + PCR for stx1, stx2, eae genes",
          "ELISA for Shiga toxin",
          "Serum IgM to E. coli LPS (if delayed)",
          "Rule out DIC: PT/aPTT, fibrinogen, D-dimer"
        ]
      });
    } else if (husType === "Atypical HUS") {
      setManagementPlan({
        immediate: [
          "URGENT: PEX within 24h OR eculizumab if available",
          "Daily PEX 1.5× plasma volume (60-75 mL/kg) until remission",
          "If eculizumab: Give first dose after vaccination (or with prophylactic antibiotics)",
          "Manage AKI supportively"
        ],
        investigations: [
          "Before PEX: Anti-FH antibodies, C3, CD46 flow cytometry",
          "Store: ADAMTS13 (frozen citrated plasma), homocysteine (EDTA -20°C)",
          "Genetic screening: CFH, CFI, CFB, C3, CD46, THBD, DGKE"
        ],
        antiFHprotocol: [
          "IF ANTI-FH POSITIVE (>150 AU/mL):",
          "Continue PEX daily × 5-7 days, taper over 4-6 weeks",
          "START: Prednisolone 1 mg/kg/day × 1mo → alternate days",
          "PLUS: IV Cyclophosphamide 500 mg/m² q3-4wk × 3-5 doses",
          "Monitor titers: Target <1000 AU/mL"
        ]
      });
    }
  };

  return (
    <div className="space-y-6">
      <Alert className="bg-red-50 border-red-300 border-2">
        <AlertTriangle className="w-5 h-5 text-red-600" />
        <AlertDescription className="text-red-900">
          <strong>MEDICAL EMERGENCY:</strong> HUS is life-threatening. Urgent evaluation required within 24 hours.
        </AlertDescription>
      </Alert>

      {step === 1 ? (
        <Card>
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-6 h-6 text-red-600" />
              HUS Diagnostic Criteria Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Hemoglobin (g/dL) *</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={patientData.hemoglobin}
                  onChange={(e) => setPatientData({...patientData, hemoglobin: e.target.value})}
                />
              </div>

              <div>
                <Label>LDH (IU/L)</Label>
                <Input
                  type="number"
                  value={patientData.ldh}
                  onChange={(e) => setPatientData({...patientData, ldh: e.target.value})}
                />
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={patientData.schistocytes}
                    onCheckedChange={(checked) => setPatientData({...patientData, schistocytes: checked})}
                    id="schistocytes"
                  />
                  <Label htmlFor="schistocytes" className="cursor-pointer">
                    Schistocytes ≥2% on peripheral smear
                  </Label>
                </div>
              </div>

              <div>
                <Label>Platelets (/μL) *</Label>
                <Input
                  type="number"
                  value={patientData.platelets}
                  onChange={(e) => setPatientData({...patientData, platelets: e.target.value})}
                />
              </div>

              <div>
                <Label>Creatinine (mg/dL) *</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={patientData.creatinine}
                  onChange={(e) => setPatientData({...patientData, creatinine: e.target.value})}
                />
              </div>
            </div>

            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-base">Clinical History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Bloody diarrhea in past 3 weeks?</Label>
                  <div className="flex gap-3 mt-2">
                    <Button
                      variant={patientData.hasBloodyDiarrhea === true ? "default" : "outline"}
                      onClick={() => setPatientData({...patientData, hasBloodyDiarrhea: true})}
                    >
                      Yes
                    </Button>
                    <Button
                      variant={patientData.hasBloodyDiarrhea === false ? "default" : "outline"}
                      onClick={() => setPatientData({...patientData, hasBloodyDiarrhea: false})}
                    >
                      No
                    </Button>
                  </div>
                </div>

                {patientData.hasBloodyDiarrhea && (
                  <Input
                    type="number"
                    value={patientData.diarrheaDuration}
                    onChange={(e) => setPatientData({...patientData, diarrheaDuration: e.target.value})}
                    placeholder="Days since onset"
                  />
                )}
              </CardContent>
            </Card>

            <Button
              onClick={assessHUS}
              disabled={!patientData.hemoglobin || !patientData.platelets || !patientData.creatinine}
              className="w-full bg-red-600 hover:bg-red-700 py-6"
            >
              <Calculator className="w-5 h-5 mr-2" />
              Assess & Generate Management
            </Button>
          </CardContent>
        </Card>
      ) : diagnosis && managementPlan && (
        <div className="space-y-6">
          <Card className="border-2 border-red-400 bg-red-50">
            <CardHeader className="bg-red-100">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                HUS CONFIRMED: {diagnosis.type}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="bg-purple-50">
              <CardTitle>Immediate Management</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {managementPlan.immediate.map((action, idx) => (
                <div key={idx} className="flex gap-3 mb-3">
                  <Badge className="bg-purple-600 text-white">{idx + 1}</Badge>
                  <p>{action}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}