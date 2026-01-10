import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Heart, AlertTriangle, Microscope, CheckCircle, Info, Activity } from "lucide-react";

export default function HSPNPathway() {
  const [biopsyGrade, setBiopsyGrade] = useState(null);
  const [proteinuria, setProteinuria] = useState("");
  const [eGFR, setEGFR] = useState("");
  const [hasCrescents, setHasCrescents] = useState(false);
  const [crescentPercent, setCrescentPercent] = useState("");
  const [treatment, setTreatment] = useState(null);

  const generateTreatment = () => {
    const upcr = parseFloat(proteinuria);
    const gfr = parseFloat(eGFR);
    const crescents = parseFloat(crescentPercent) || 0;

    let severity = "Mild";
    let protocol = null;

    if (crescents > 50 || (crescents > 10 && gfr < 60)) {
      severity = "Severe/RPGN";
      protocol = {
        classification: "ISKDC Grade V-VI or Crescentic HSPN",
        regimen: "HIGH-DOSE IV STEROIDS + CYCLOPHOSPHAMIDE",
        induction: [
          "IV Methylprednisolone pulse: 30 mg/kg/day (max 1g) × 3-6 consecutive days",
          "Then oral prednisolone 2 mg/kg/day (max 60mg) × 4-6 weeks",
          "Taper: 1.5 mg/kg alternate days × 8-12 weeks, then slow taper over 6-12 months"
        ],
        cyclophosphamide: [
          "IV Cyclophosphamide 500-750 mg/m² monthly × 6 doses",
          "OR Oral cyclophosphamide 2 mg/kg/day × 8-12 weeks (max cumulative 168 mg/kg)"
        ],
        maintenance: [
          "Switch to MMF 600 mg/m² BID OR azathioprine 1-2 mg/kg/day",
          "Continue maintenance immunosuppression × 12-24 months",
          "Continue low-dose prednisolone 0.2-0.3 mg/kg alternate days"
        ],
        monitoring: "CBC weekly during cyclophosphamide, monthly during MMF. Cr, UPCR, BP q2-4 weeks. Repeat biopsy if no response at 3 months.",
        prognosis: "RPGN has poor prognosis without aggressive treatment. Early intervention critical."
      };
    } else if (upcr >= 2 || (upcr >= 0.5 && (crescents > 0 || biopsyGrade >= 3))) {
      severity = "Moderate-Severe";
      protocol = {
        classification: "ISKDC Grade III-IV or Nephrotic/Persistent Proteinuria",
        regimen: "ORAL STEROIDS + CYCLOPHOSPHAMIDE (or MMF)",
        induction: [
          "Oral prednisolone 1-2 mg/kg/day (max 60mg) × 4-8 weeks",
          "Then 1 mg/kg alternate days × 4-8 weeks",
          "Gradual taper over 3-6 months to discontinue"
        ],
        cyclophosphamide: [
          "OPTION 1: Oral cyclophosphamide 2 mg/kg/day × 8-12 weeks",
          "OPTION 2: IV cyclophosphamide 500-750 mg/m² monthly × 6 doses",
          "Monitor: CBC weekly, urine for hemorrhagic cystitis"
        ],
        alternative: [
          "If cyclophosphamide contraindicated: MMF 600 mg/m² BID",
          "Continue × 12-18 months"
        ],
        maintenance: "Azathioprine 1-2 mg/kg/day OR MMF 400-600 mg/m² BID × 12-24 months",
        monitoring: "UPCR q4 weeks, Cr q2-4 weeks, BP q visit. Taper steroids if no improvement at 8 weeks.",
        prognosis: "60-80% achieve remission or partial remission with treatment."
      };
    } else if (upcr >= 0.5 && upcr < 2) {
      severity = "Moderate";
      protocol = {
        classification: "ISKDC Grade II-III or Moderate Proteinuria",
        regimen: "ORAL STEROIDS ALONE",
        induction: [
          "Oral prednisolone 1 mg/kg/day (max 60mg) × 4 weeks",
          "Then 1 mg/kg alternate days × 4 weeks",
          "Taper over 2-3 months"
        ],
        monitoring: "UPCR q4 weeks, Cr q4-8 weeks, BP q visit",
        escalation: "If proteinuria persists >6-8 weeks or worsens → add cyclophosphamide or MMF as above",
        prognosis: "70-80% achieve remission with steroids alone. Good long-term outcomes."
      };
    } else {
      severity = "Mild";
      protocol = {
        classification: "ISKDC Grade I-II or Mild Hematuria/Proteinuria",
        regimen: "CONSERVATIVE MANAGEMENT",
        management: [
          "ACE inhibitor: Enalapril 0.1-0.3 mg/kg/day if UPCR ≥0.2 mg/mg",
          "BP control: Target <90th percentile",
          "Monitor closely: UPCR, Cr, BP q2-3 months × 1 year, then q6-12 months",
          "No steroids or immunosuppression needed if stable"
        ],
        escalation: "If proteinuria increases to >0.5 mg/mg or eGFR declines → consider biopsy and treat as moderate-severe",
        prognosis: "Excellent. Majority resolve spontaneously. <5% progress to CKD."
      };
    }

    setTreatment({ severity, ...protocol });
  };

  return (
    <div className="space-y-6">
      <Alert className="bg-purple-50 border-purple-200">
        <Heart className="w-5 h-5 text-purple-600" />
        <AlertDescription className="text-purple-800">
          <strong>HSP Nephritis (IgA Vasculitis Nephritis):</strong> Renal involvement in 20-54% of HSP cases. Treatment based on ISKDC classification and proteinuria severity. IPNA 2025 recommendations integrated.
        </AlertDescription>
      </Alert>

      {!treatment ? (
        <Card>
          <CardHeader className="bg-purple-50 border-b">
            <CardTitle>HSPN Severity Assessment</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>UPCR (mg/mg) *</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={proteinuria}
                  onChange={(e) => setProteinuria(e.target.value)}
                  placeholder="e.g., 1.5"
                />
                <p className="text-xs text-slate-500 mt-1">First morning spot urine protein/creatinine ratio</p>
              </div>

              <div>
                <Label>eGFR (mL/min/1.73m²)</Label>
                <Input
                  type="number"
                  value={eGFR}
                  onChange={(e) => setEGFR(e.target.value)}
                  placeholder="e.g., 75"
                />
                <p className="text-xs text-slate-500 mt-1">Use Schwartz formula</p>
              </div>
            </div>

            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-base">Biopsy Findings (If Available)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>ISKDC Grade (I-VI)</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {[1, 2, 3, 4, 5, 6].map(grade => (
                      <Button
                        key={grade}
                        variant={biopsyGrade === grade ? "default" : "outline"}
                        onClick={() => setBiopsyGrade(grade)}
                        className="text-sm"
                      >
                        Grade {grade}
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    I: Minimal, II: Mesangial, III: less than 50% crescents, IV: 50-75% crescents, V: greater than 75% crescents, VI: Membranoproliferative
                  </p>
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <Checkbox
                    checked={hasCrescents}
                    onCheckedChange={setHasCrescents}
                    id="crescents"
                  />
                  <Label htmlFor="crescents" className="cursor-pointer">Crescents present on biopsy</Label>
                </div>

                {hasCrescents && (
                  <div>
                    <Label>Crescent Percentage (%)</Label>
                    <Input
                      type="number"
                      value={crescentPercent}
                      onChange={(e) => setCrescentPercent(e.target.value)}
                      placeholder="e.g., 25"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Button
              onClick={generateTreatment}
              disabled={!proteinuria}
              className="w-full bg-purple-600 hover:bg-purple-700 py-6 text-lg"
            >
              <Microscope className="w-5 h-5 mr-2" />
              Generate Treatment Protocol
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className={`border-2 ${
            treatment.severity === "Severe/RPGN" ? "border-red-400 bg-red-50" :
            treatment.severity === "Moderate-Severe" ? "border-amber-400 bg-amber-50" :
            "border-blue-400 bg-blue-50"
          }`}>
            <CardHeader className={
              treatment.severity === "Severe/RPGN" ? "bg-red-100" :
              treatment.severity === "Moderate-Severe" ? "bg-amber-100" :
              "bg-blue-100"
            }>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">HSPN Severity: {treatment.severity}</CardTitle>
                <Badge className={
                  treatment.severity === "Severe/RPGN" ? "bg-red-600 text-white text-base px-4 py-2" :
                  treatment.severity === "Moderate-Severe" ? "bg-amber-600 text-white text-base px-4 py-2" :
                  "bg-blue-600 text-white text-base px-4 py-2"
                }>
                  {treatment.classification}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          <Card className="border-2 border-green-300 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-100 border-b-2">
              <CardTitle className="text-xl flex items-center gap-2">
                <Activity className="w-6 h-6 text-green-600" />
                Treatment Protocol: {treatment.regimen}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                <h4 className="font-bold text-lg text-green-900">Induction Phase:</h4>
                {treatment.induction && treatment.induction.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-green-50 p-4 rounded-lg border-2 border-green-200">
                    <div className="w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      {idx + 1}
                    </div>
                    <p className="text-slate-800 font-medium">{step}</p>
                  </div>
                ))}
              </div>

              {treatment.cyclophosphamide && (
                <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-300">
                  <h4 className="font-bold text-purple-900 mb-3">Cyclophosphamide Protocol:</h4>
                  {treatment.cyclophosphamide.map((step, idx) => (
                    <p key={idx} className="text-sm text-purple-800 mb-2">• {step}</p>
                  ))}
                </div>
              )}

              {treatment.alternative && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-bold text-blue-900 mb-2">Alternative Option:</h4>
                  {treatment.alternative.map((step, idx) => (
                    <p key={idx} className="text-sm text-blue-800">• {step}</p>
                  ))}
                </div>
              )}

              {treatment.maintenance && (
                <div className="bg-amber-50 p-4 rounded-lg border-2 border-amber-300">
                  <h4 className="font-bold text-amber-900 mb-2">Maintenance Therapy:</h4>
                  {typeof treatment.maintenance === 'string' ? (
                    <p className="text-sm text-amber-800 font-medium">{treatment.maintenance}</p>
                  ) : (
                    treatment.maintenance.map((step, idx) => (
                      <p key={idx} className="text-sm text-amber-800 mb-2">• {step}</p>
                    ))
                  )}
                </div>
              )}

              {treatment.management && (
                <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                  <h4 className="font-bold text-green-900 mb-3">Conservative Management:</h4>
                  {treatment.management.map((step, idx) => (
                    <p key={idx} className="text-sm text-green-800 mb-2">• {step}</p>
                  ))}
                </div>
              )}

              <Card className="bg-cyan-50 border-cyan-200">
                <CardContent className="p-4">
                  <h4 className="font-bold text-cyan-900 mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Monitoring Protocol
                  </h4>
                  <p className="text-sm text-cyan-800">{treatment.monitoring}</p>
                  {treatment.escalation && (
                    <p className="text-sm text-amber-800 mt-2"><strong>Escalation:</strong> {treatment.escalation}</p>
                  )}
                </CardContent>
              </Card>

              <Alert className="bg-blue-50 border-blue-200">
                <Info className="w-4 h-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Prognosis:</strong> {treatment.prognosis}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Button onClick={() => setTreatment(null)} variant="outline" className="w-full">
            Re-assess
          </Button>
        </div>
      )}
    </div>
  );
}