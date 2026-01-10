import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Thermometer, Calculator } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function UTIPathway() {
  const [age, setAge] = useState("");
  const [hasFever, setHasFever] = useState(false);
  const [feverDuration, setFeverDuration] = useState("");
  const [imagingPlan, setImagingPlan] = useState(null);

  const generateImagingPlan = () => {
    const ageNum = parseFloat(age);
    const durationDays = parseFloat(feverDuration);

    if (!ageNum) return;

    const plan = {
      acute: [],
      dmsa: null,
      vur: null
    };

    // Acute phase
    plan.acute.push("Renal/Bladder Ultrasound (within 48-72 hours if febrile UTI)");
    
    // DMSA timing
    if (hasFever && durationDays >= 3) {
      plan.dmsa = "DMSA scan at 4-6 months post-infection (to detect renal scarring)";
    } else {
      plan.dmsa = "DMSA scan may not be needed if single uncomplicated UTI";
    }

    // VUR evaluation
    if (ageNum < 2) {
      plan.vur = "VCUG recommended (high risk age group)";
    } else if (ageNum >= 2 && ageNum <= 5 && durationDays >= 3) {
      plan.vur = "VCUG if abnormal ultrasound OR recurrent UTIs";
    } else {
      plan.vur = "VCUG not routinely recommended unless recurrent UTIs or abnormal imaging";
    }

    setImagingPlan(plan);
  };

  return (
    <div className="space-y-6">
      <Alert className="bg-orange-50 border-orange-300">
        <Thermometer className="w-5 h-5 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <strong>Febrile UTI Protocol:</strong> Evidence-based imaging and follow-up per AAP/IAP guidelines
        </AlertDescription>
      </Alert>

      <Card className="shadow-lg border-2 border-orange-300">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50 border-b">
          <CardTitle>Patient Assessment</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Age (years)</Label>
              <Input type="number" step="0.1" value={age} onChange={(e) => setAge(e.target.value)} placeholder="2.5" />
            </div>
            <div>
              <Label>Fever Duration (days)</Label>
              <Input type="number" value={feverDuration} onChange={(e) => setFeverDuration(e.target.value)} placeholder="4" />
            </div>
          </div>

          <div className="flex items-center gap-3 bg-red-50 p-4 rounded border border-red-300">
            <Checkbox checked={hasFever} onCheckedChange={setHasFever} />
            <Label className="cursor-pointer font-bold">Febrile UTI (Temperature ≥38°C)</Label>
          </div>

          <Button onClick={generateImagingPlan} className="w-full bg-orange-600 hover:bg-orange-700">
            Generate Imaging Protocol
          </Button>

          {imagingPlan && (
            <div className="space-y-4 mt-6">
              <Card className="bg-blue-50 border-blue-300">
                <CardHeader className="bg-blue-100">
                  <CardTitle className="text-base">Acute Phase Imaging</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {imagingPlan.acute.map((item, idx) => (
                    <p key={idx} className="text-sm">• {item}</p>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-purple-50 border-purple-300">
                <CardHeader className="bg-purple-100">
                  <CardTitle className="text-base">DMSA Scan (Scarring Detection)</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="text-sm">{imagingPlan.dmsa}</p>
                  <p className="text-xs text-purple-700 mt-2">
                    <strong>Timing is critical:</strong> Wait 4-6 months after acute infection
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-green-50 border-green-300">
                <CardHeader className="bg-green-100">
                  <CardTitle className="text-base">VCUG (VUR Evaluation)</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="text-sm">{imagingPlan.vur}</p>
                  <p className="text-xs text-green-700 mt-2">
                    <strong>VUR workup indicated:</strong> Age &lt;2 years OR recurrent UTIs OR abnormal renal US
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white shadow-lg">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle>Antibiotic Management</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-3">
          <Card className="bg-red-50 border-red-300">
            <CardHeader>
              <CardTitle className="text-sm">Empiric IV (Febrile, &lt;3 months, toxic-appearing)</CardTitle>
            </CardHeader>
            <CardContent className="p-4 text-sm">
              <p>• <strong>Ceftriaxone:</strong> 50-75 mg/kg/day IV OD</p>
              <p>• <strong>OR Cefotaxime:</strong> 150 mg/kg/day IV divided TDS</p>
              <p>• <strong>Duration:</strong> 7-14 days total</p>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-300">
            <CardHeader>
              <CardTitle className="text-sm">Oral (Afebrile, well-appearing, &gt;3 months)</CardTitle>
            </CardHeader>
            <CardContent className="p-4 text-sm">
              <p>• <strong>Cefixime:</strong> 8 mg/kg/day PO divided BD</p>
              <p>• <strong>Cephalexin:</strong> 25-50 mg/kg/day divided QID</p>
              <p>• <strong>Duration:</strong> 7-10 days</p>
            </CardContent>
          </Card>

          <Link to={createPageUrl("DoseCalculator")}>
            <Button size="sm" variant="outline">
              <Calculator className="w-4 h-4 mr-2" />
              Calculate Doses
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card className="bg-amber-50 border-amber-300">
        <CardHeader>
          <CardTitle className="text-base">Prophylaxis Indications</CardTitle>
        </CardHeader>
        <CardContent className="p-4 text-sm">
          <p className="font-bold mb-2">Consider prophylaxis if:</p>
          <ul className="space-y-1">
            <li>• Recurrent febrile UTIs (≥3 in 12 months)</li>
            <li>• High-grade VUR (grades IV-V)</li>
            <li>• Renal scarring on DMSA</li>
          </ul>
          <p className="mt-3"><strong>Agent:</strong> Trimethoprim 2 mg/kg OD at night</p>
        </CardContent>
      </Card>
    </div>
  );
}