import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Thermometer, Activity, AlertTriangle, Info, Calculator } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function UTIPathway() {
  const [age, setAge] = useState("");
  const [hasFever, setHasFever] = useState(false);
  const [feverDuration, setFeverDuration] = useState("");
  const [recurrentUTI, setRecurrentUTI] = useState(false);
  const [abnormalUS, setAbnormalUS] = useState(false);
  const [nonEcoli, setNonEcoli] = useState(false);
  const [highGradeVUR, setHighGradeVUR] = useState(false);
  const [imagingPlan, setImagingPlan] = useState(null);

  // Imaging logic per Revised ISPN 2023 UTI/VUR guidelines (conservative imaging).
  const generateImagingPlan = () => {
    const ageNum = parseFloat(age);
    if (!ageNum && ageNum !== 0) return;

    const plan = { acute: [], dmsa: null, vur: null };

    // Ultrasound: ALL children after a UTI (acute only if not responding at 48–72 h)
    plan.acute.push("Ultrasound KUB (kidneys, ureters, bladder) in ALL children after a UTI.");
    plan.acute.push("Acute ultrasound (within 48–72 h) only if no clinical response to antibiotics.");

    // MCU / VCUG: only for specific indications
    const mcuReasons = [];
    if (ageNum < 2 && nonEcoli) mcuReasons.push("non-E. coli UTI in a child <2 years");
    if (abnormalUS) mcuReasons.push("abnormal ultrasound");
    if (recurrentUTI) mcuReasons.push("recurrent UTI");
    plan.vur = mcuReasons.length
      ? `MCU (VCUG) indicated — ${mcuReasons.join("; ")}. Perform after the UTI is treated (≈2–3 weeks).`
      : "MCU (VCUG) NOT indicated — none of: non-E. coli UTI <2y, abnormal ultrasound, or recurrent UTI. Limiting MCU avoids unnecessary radiation.";

    // DMSA: avoid acute-phase; late DMSA only for recurrent UTI or high-grade VUR
    plan.dmsa = (recurrentUTI || highGradeVUR)
      ? "Late-phase DMSA at 4–6 months to detect kidney scars (indicated: recurrent UTI or high-grade VUR). AVOID acute-phase DMSA."
      : "DMSA NOT indicated. AVOID acute-phase DMSA (low specificity; cannot distinguish acute pyelonephritis from permanent scar).";

    setImagingPlan(plan);
  };

  return (
    <div className="space-y-6">
      <Alert className="bg-orange-50 border-orange-300">
        <Thermometer className="w-5 h-5 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <strong>Febrile UTI Protocol:</strong> Conservative imaging per Revised ISPN 2023 UTI/VUR guidelines (ultrasound for all; MCU restricted; avoid acute DMSA).
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

          <div className="grid sm:grid-cols-2 gap-2">
            <div className="flex items-center gap-2 bg-slate-50 p-3 rounded border">
              <Checkbox checked={recurrentUTI} onCheckedChange={setRecurrentUTI} />
              <Label className="cursor-pointer text-sm">Recurrent UTI (≥2 episodes)</Label>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 p-3 rounded border">
              <Checkbox checked={abnormalUS} onCheckedChange={setAbnormalUS} />
              <Label className="cursor-pointer text-sm">Abnormal ultrasound</Label>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 p-3 rounded border">
              <Checkbox checked={nonEcoli} onCheckedChange={setNonEcoli} />
              <Label className="cursor-pointer text-sm">Non-E. coli uropathogen</Label>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 p-3 rounded border">
              <Checkbox checked={highGradeVUR} onCheckedChange={setHighGradeVUR} />
              <Label className="cursor-pointer text-sm">Known high-grade VUR (III–V)</Label>
            </div>
          </div>

          <Button onClick={generateImagingPlan} className="w-full bg-orange-600 hover:bg-orange-700">
            Generate Imaging Protocol
          </Button>

          {imagingPlan && (
            <div className="space-y-4 mt-6">
              <Card className="bg-blue-50 border-blue-300">
                <CardHeader className="bg-blue-100">
                  <CardTitle className="text-base">Ultrasound (all children)</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {imagingPlan.acute.map((item, idx) => (
                    <p key={idx} className="text-sm">• {item}</p>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-green-50 border-green-300">
                <CardHeader className="bg-green-100">
                  <CardTitle className="text-base">MCU / VCUG (VUR Evaluation)</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="text-sm">{imagingPlan.vur}</p>
                  <p className="text-xs text-green-700 mt-2">
                    <strong>MCU indications (ISPN 2023):</strong> non-E. coli UTI &lt;2 y, abnormal ultrasound, or recurrent UTI.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-purple-50 border-purple-300">
                <CardHeader className="bg-purple-100">
                  <CardTitle className="text-base">DMSA Scan (Scarring Detection)</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="text-sm">{imagingPlan.dmsa}</p>
                  <p className="text-xs text-purple-700 mt-2">
                    <strong>Avoid acute-phase DMSA.</strong> Late DMSA at 4–6 months only for recurrent UTI or high-grade VUR.
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
          <p className="font-bold mb-2">Prophylaxis (ISPN 2023) — limited indications:</p>
          <ul className="space-y-1">
            <li>• High-grade VUR (grades III–V)</li>
            <li>• Recurrent febrile UTI with bladder-bowel dysfunction (± VUR)</li>
            <li>• <span className="text-slate-600">NOT for normal urinary tract / low-grade VUR; NOT for antenatal hydronephrosis awaiting evaluation</span></li>
          </ul>
          <p className="mt-3"><strong>Agent:</strong> Cotrimoxazole or nitrofurantoin (&gt;3 months); cephalexin in young infants. Avoid amoxicillin-clavulanate for prophylaxis.</p>
          <p className="mt-1 text-xs">Discontinue if toilet-trained, no BBD, and no febrile UTI in the preceding year. All toilet-trained children with UTI should be evaluated for BBD and managed with urotherapy.</p>
        </CardContent>
      </Card>
    </div>
  );
}