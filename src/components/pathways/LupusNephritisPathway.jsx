import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, CheckCircle, Info, Heart } from "lucide-react";

export default function LupusNephritisPathway() {
  const [biopsyClass, setBiopsyClass] = useState(null);
  const [proteinuria, setProteinuria] = useState("");
  const [eGFR, setEGFR] = useState("");
  const [activeFeatures, setActiveFeatures] = useState({
    rash: false,
    arthritis: false,
    serositis: false,
    cytopenias: false,
    cns: false
  });
  const [treatment, setTreatment] = useState(null);

  const generateTreatment = () => {
    const upcr = parseFloat(proteinuria) || 0;
    const gfr = parseFloat(eGFR) || 100;
    const classNum = parseInt(biopsyClass);

    let protocol = null;

    if (classNum === 1 || classNum === 2) {
      protocol = {
        classification: "Class I (Minimal Mesangial) or Class II (Mesangial Proliferative) Lupus Nephritis",
        severity: "Mild",
        treatment: "Conservative Management",
        regimen: [
          "No immunosuppression needed for isolated kidney findings",
          "Hydroxychloroquine 5 mg/kg/day (max 400 mg) - for all SLE patients",
          "ACE inhibitor if proteinuria >0.5 g/day",
          "Treat extrarenal manifestations as needed"
        ],
        monitoring: "UPCR, Cr, C3, C4, anti-dsDNA every 3 months. Repeat biopsy if worsening.",
        prognosis: "Excellent. Very low risk of progression to ESRD."
      };
    } else if (classNum === 3 || classNum === 4) {
      protocol = {
        classification: `Class ${classNum === 3 ? 'III (Focal)' : 'IV (Diffuse)'} Proliferative Lupus Nephritis`,
        severity: "Severe - Requires Aggressive Immunosuppression",
        treatment: "INDUCTION + MAINTENANCE",
        induction: [
          {
            name: "Option 1: IV Cyclophosphamide (NIH Protocol)",
            regimen: [
              "IV Cyclophosphamide 500-750 mg/m² monthly × 6 doses",
              "Pre-medicate: Ondansetron + Mesna for bladder protection",
              "PLUS IV Methylprednisolone 30 mg/kg (max 1g) × 3 days",
              "Then oral prednisolone 2 mg/kg/day (max 60mg) × 4 weeks, taper over 6 months"
            ],
            monitoring: "CBC weekly (watch WBC - hold if <2500), UA monthly, avoid bladder toxicity"
          },
          {
            name: "Option 2: Mycophenolate Mofetil (MMF) - Preferred in many centers",
            regimen: [
              "MMF 600 mg/m² BID (or 2-3 g/day in adolescents) × 6 months",
              "PLUS IV Methylprednisolone pulse as above",
              "Then oral prednisolone taper"
            ],
            monitoring: "CBC, LFT q2 weeks initially. Better GI tolerance than cyclophosphamide."
          }
        ],
        maintenance: [
          "Switch to MMF 600 mg/m² BID OR Azathioprine 1-2 mg/kg/day",
          "Continue ×2-3 years minimum",
          "Low-dose prednisolone 5-10 mg/day",
          "Hydroxychloroquine 5 mg/kg/day (continue indefinitely)"
        ],
        refractory: [
          "If no response by 6 months:",
          "• Switch cyclophosphamide ↔ MMF",
          "• Add Rituximab 375 mg/m² weekly × 4 doses",
          "• Consider calcineurin inhibitor (Tacrolimus)",
          "• Plasmapheresis for severe crescentic disease"
        ],
        monitoring: "UPCR, Cr, C3, C4, anti-dsDNA monthly during induction, then q3 months. Repeat biopsy if not improving.",
        prognosis: "With treatment: 80-90% achieve remission. 10-year renal survival >90%. Without treatment: high risk of ESRD."
      };
    } else if (classNum === 5) {
      protocol = {
        classification: "Class V (Membranous) Lupus Nephritis",
        severity: "Moderate - Nephrotic-range Proteinuria",
        treatment: "DEPENDS ON PROTEINURIA SEVERITY",
        regimen: [
          {
            name: "If Subnephrotic (<3.5 g/day)",
            plan: [
              "Conservative: ACE-I/ARB, hydroxychloroquine",
              "Monitor closely - may need escalation"
            ]
          },
          {
            name: "If Nephrotic-range (>3.5 g/day)",
            plan: [
              "MMF 600 mg/m² BID × 6-12 months",
              "OR Calcineurin inhibitor (Tacrolimus 0.05-0.1 mg/kg/day, target 5-7 ng/mL)",
              "PLUS low-dose prednisolone 0.5 mg/kg/day, taper",
              "Hydroxychloroquine 5 mg/kg/day"
            ]
          }
        ],
        monitoring: "UPCR monthly, lipid profile, thrombosis risk (consider anticoagulation if severe)",
        prognosis: "Variable. 50% achieve remission with treatment. May have chronic proteinuria."
      };
    } else if (classNum === 6) {
      protocol = {
        classification: "Class VI (Advanced Sclerosing) Lupus Nephritis",
        severity: "End-stage kidney disease",
        treatment: "Supportive Care + Renal Replacement Therapy",
        regimen: [
          "No immunosuppression indicated (kidneys already scarred)",
          "Treat extrarenal SLE manifestations",
          "Prepare for dialysis or transplantation",
          "Continue hydroxychloroquine"
        ],
        transplant: "Kidney transplant is an option. Wait 6-12 months of inactive disease before listing. Good outcomes.",
        prognosis: "Requires dialysis or transplant. Transplant outcomes similar to other causes of ESRD."
      };
    }

    setTreatment(protocol);
  };

  return (
    <div className="space-y-6">
      <Alert className="bg-purple-50 border-purple-200 border-2">
        <Heart className="w-5 h-5 text-purple-600" />
        <AlertDescription className="text-purple-800">
          <strong>Lupus Nephritis (LN):</strong> Kidney involvement in SLE, occurs in 50-60% of pediatric patients. Classification per ISN/RPS 2003 (revised 2018). Treatment based on biopsy class and activity.
        </AlertDescription>
      </Alert>

      {!treatment ? (
        <Card>
          <CardHeader className="bg-purple-50 border-b">
            <CardTitle>Lupus Nephritis Assessment</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <Label>ISN/RPS Biopsy Class *</Label>
              <Select value={biopsyClass} onValueChange={setBiopsyClass}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select biopsy class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Class I - Minimal Mesangial LN</SelectItem>
                  <SelectItem value="2">Class II - Mesangial Proliferative LN</SelectItem>
                  <SelectItem value="3">Class III - Focal LN (&lt;50% glomeruli)</SelectItem>
                  <SelectItem value="4">Class IV - Diffuse LN (≥50% glomeruli)</SelectItem>
                  <SelectItem value="5">Class V - Membranous LN</SelectItem>
                  <SelectItem value="6">Class VI - Advanced Sclerosing LN</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500 mt-1">Based on kidney biopsy pathology</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>UPCR (mg/mg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={proteinuria}
                  onChange={(e) => setProteinuria(e.target.value)}
                  placeholder="e.g., 2.5"
                />
              </div>
              <div>
                <Label>eGFR (mL/min/1.73m²)</Label>
                <Input
                  type="number"
                  value={eGFR}
                  onChange={(e) => setEGFR(e.target.value)}
                  placeholder="e.g., 75"
                />
              </div>
            </div>

            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-base">Extrarenal SLE Manifestations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries({
                  rash: "Malar rash / Discoid rash",
                  arthritis: "Arthritis / Arthralgia",
                  serositis: "Serositis (pleuritis/pericarditis)",
                  cytopenias: "Cytopenias (anemia, leukopenia, thrombocytopenia)",
                  cns: "CNS involvement (seizures, psychosis)"
                }).map(([key, label]) => (
                  <div key={key} className="flex items-center gap-2">
                    <Checkbox
                      checked={activeFeatures[key]}
                      onCheckedChange={(checked) => setActiveFeatures({...activeFeatures, [key]: checked})}
                      id={key}
                    />
                    <Label htmlFor={key} className="cursor-pointer text-sm">{label}</Label>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Button
              onClick={generateTreatment}
              disabled={!biopsyClass}
              className="w-full bg-purple-600 hover:bg-purple-700 py-6 text-lg"
            >
              <Activity className="w-5 h-5 mr-2" />
              Generate Treatment Protocol
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className={`border-2 ${
            treatment.severity === "Severe" ? "border-red-400 bg-red-50" :
            treatment.severity === "Moderate" ? "border-amber-400 bg-amber-50" :
            "border-blue-400 bg-blue-50"
          }`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">{treatment.classification}</CardTitle>
                <Badge className={`text-lg px-4 py-2 ${
                  treatment.severity === "Severe" ? "bg-red-600 text-white" :
                  treatment.severity === "Moderate" ? "bg-amber-600 text-white" :
                  "bg-blue-600 text-white"
                }`}>
                  {treatment.severity}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          <Card className="border-2 border-green-300 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-100 border-b-2">
              <CardTitle className="text-xl flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                Treatment Protocol
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {treatment.regimen && (
                <div className="space-y-3">
                  {treatment.regimen.map((item, idx) => (
                    <div key={idx} className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                      <p className="text-slate-800 font-medium">{item}</p>
                    </div>
                  ))}
                </div>
              )}

              {treatment.induction && (
                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-purple-900">Induction Phase (0-6 months):</h3>
                  {treatment.induction.map((option, idx) => (
                    <Card key={idx} className="bg-purple-50 border-2 border-purple-300">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base text-purple-900">{option.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {option.regimen.map((step, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="w-5 h-5 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <p className="text-sm text-slate-800">{step}</p>
                          </div>
                        ))}
                        {option.monitoring && (
                          <div className="mt-3 pt-3 border-t border-purple-200">
                            <p className="text-xs text-purple-800"><strong>Monitoring:</strong> {option.monitoring}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {treatment.maintenance && (
                <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-300">
                  <h4 className="font-bold text-blue-900 mb-3">Maintenance Phase (6 months - 2-3 years):</h4>
                  {treatment.maintenance.map((step, idx) => (
                    <p key={idx} className="text-sm text-blue-800 mb-2">• {step}</p>
                  ))}
                </div>
              )}

              {treatment.refractory && (
                <div className="bg-red-50 p-4 rounded-lg border-2 border-red-300">
                  <h4 className="font-bold text-red-900 mb-3">Refractory Disease Management:</h4>
                  {treatment.refractory.map((step, idx) => (
                    <p key={idx} className="text-sm text-red-800 mb-2">{step}</p>
                  ))}
                </div>
              )}

              {treatment.transplant && (
                <Alert className="bg-indigo-50 border-indigo-200">
                  <Info className="w-4 h-4 text-indigo-600" />
                  <AlertDescription className="text-indigo-800">
                    <strong>Transplantation:</strong> {treatment.transplant}
                  </AlertDescription>
                </Alert>
              )}

              <Card className="bg-cyan-50 border-cyan-200">
                <CardContent className="p-4">
                  <h4 className="font-bold text-cyan-900 mb-2 flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Monitoring Protocol
                  </h4>
                  <p className="text-sm text-cyan-800">{treatment.monitoring}</p>
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

      <Card className="bg-slate-50">
        <CardHeader className="border-b">
          <CardTitle className="text-lg">Additional Management Considerations</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span><strong>Hydroxychloroquine:</strong> Start in ALL SLE patients (reduces flares, protects kidneys, improves survival)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span><strong>Infection prevention:</strong> PJP prophylaxis (TMP-SMX) during high-dose steroids + cyclophosphamide</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span><strong>Bone protection:</strong> Vitamin D, calcium supplements. DEXA scan if long-term steroids</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span><strong>Fertility preservation:</strong> Consider GnRH agonist if high-dose cyclophosphamide planned in post-pubertal females</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span><strong>Contraception:</strong> Essential in females on immunosuppression (teratogenic). Non-estrogen methods preferred.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span><strong>Thrombosis risk:</strong> Antiphospholipid antibodies common. Anticoagulation if positive + nephrotic syndrome.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span><strong>Pregnancy counseling:</strong> Advise conception during remission (off cyclophosphamide, low-dose prednisone + azathioprine or MMF → azathioprine)</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}