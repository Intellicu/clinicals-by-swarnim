import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, AlertTriangle, Heart, Calculator, Droplet } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function HyperkalemiaPathway() {
  const [potassium, setPotassium] = useState("");
  const [weight, setWeight] = useState("");
  const [ecgChanges, setEcgChanges] = useState(false);
  const [severity, setSeverity] = useState(null);

  const assessSeverity = () => {
    const k = parseFloat(potassium);
    if (!k) return;

    if (k >= 6.5 || (k >= 6.0 && ecgChanges)) {
      setSeverity("critical");
    } else if (k >= 6.0) {
      setSeverity("severe");
    } else if (k >= 5.5) {
      setSeverity("moderate");
    } else {
      setSeverity("mild");
    }
  };

  const calculateCalciumDose = () => {
    const wt = parseFloat(weight);
    if (!wt) return "0.5 mL/kg";
    return `${(0.5 * wt).toFixed(1)} mL (10% calcium gluconate)`;
  };

  const calculateInsulinDose = () => {
    const wt = parseFloat(weight);
    if (!wt) return "0.1 units/kg";
    return `${(0.1 * wt).toFixed(1)} units regular insulin + ${(2 * wt).toFixed(0)} mL D25W`;
  };

  return (
    <div className="space-y-6">
      <Alert className="bg-red-50 border-red-400 border-2">
        <Zap className="w-5 h-5 text-red-600" />
        <AlertDescription className="text-red-800">
          <strong>Life-Threatening Emergency:</strong> Hyperkalemia &gt;6.0 mmol/L requires immediate treatment to prevent cardiac arrhythmias
        </AlertDescription>
      </Alert>

      <Card className="shadow-lg border-2 border-red-300">
        <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-red-600" />
            Severity Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label>Serum Potassium (mmol/L)</Label>
              <Input 
                type="number" 
                step="0.1"
                value={potassium} 
                onChange={(e) => setPotassium(e.target.value)} 
                placeholder="7.2" 
              />
            </div>
            <div>
              <Label>Weight (kg)</Label>
              <Input 
                type="number" 
                step="0.1"
                value={weight} 
                onChange={(e) => setWeight(e.target.value)} 
                placeholder="20" 
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                checked={ecgChanges}
                onChange={(e) => setEcgChanges(e.target.checked)}
                className="w-4 h-4"
              />
              <Label>ECG Changes Present</Label>
            </div>
          </div>

          <Button onClick={assessSeverity} className="w-full bg-red-600 hover:bg-red-700">
            Assess & Generate Treatment Plan
          </Button>

          {severity && (
            <Card className={`border-2 ${
              severity === "critical" ? "bg-red-100 border-red-500" :
              severity === "severe" ? "bg-orange-100 border-orange-500" :
              "bg-yellow-100 border-yellow-500"
            }`}>
              <CardContent className="p-4 text-center">
                <Badge className={`text-xl px-6 py-2 ${
                  severity === "critical" ? "bg-red-600" :
                  severity === "severe" ? "bg-orange-600" :
                  "bg-yellow-600"
                } text-white`}>
                  {severity.toUpperCase()}
                </Badge>
                <p className="text-sm mt-2">
                  K+ {potassium} mmol/L {ecgChanges && "+ ECG changes"}
                </p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white shadow-lg">
        <CardHeader className="bg-red-100 border-b">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Emergency Management Protocol
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-lg border-2 border-red-300">
            <h3 className="font-bold text-red-900 mb-4 text-lg flex items-center gap-2">
              <Heart className="w-5 h-5" />
              STEP 1: Cardiac Membrane Stabilization (IMMEDIATE)
            </h3>
            <Card className="bg-white">
              <CardContent className="p-4">
                <p className="font-bold mb-2">10% Calcium Gluconate IV:</p>
                <div className="bg-red-50 p-3 rounded">
                  <p className="text-2xl font-bold text-red-600">{calculateCalciumDose()}</p>
                  <p className="text-sm mt-2">• Give over 5-10 minutes</p>
                  <p className="text-sm">• Repeat if ECG changes persist after 5 min</p>
                  <p className="text-sm">• Monitor continuous ECG</p>
                  <p className="text-sm font-bold mt-2">⚠️ Contraindicated in digoxin toxicity</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-6 rounded-lg border-2 border-orange-300">
            <h3 className="font-bold text-orange-900 mb-4 text-lg">
              STEP 2: Shift K+ Intracellularly (Within 30 min)
            </h3>
            <div className="space-y-3">
              <Card>
                <CardContent className="p-4">
                  <p className="font-bold">Insulin + Glucose:</p>
                  <div className="bg-orange-50 p-3 rounded mt-2">
                    <p className="text-lg font-bold text-orange-600">{calculateInsulinDose()}</p>
                    <p className="text-sm mt-2">• Give IV over 15-30 min</p>
                    <p className="text-sm">• Monitor glucose q30min x 4 hours</p>
                    <p className="text-sm">• Lowers K+ by 0.6-1.0 mmol/L in 30-60 min</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <p className="font-bold">Salbutamol Nebulization:</p>
                  <div className="bg-orange-50 p-3 rounded mt-2">
                    <p>• <strong>10-20 mg</strong> nebulized (high dose)</p>
                    <p className="text-sm mt-1">• Can be repeated</p>
                    <p className="text-sm">• Lowers K+ by 0.5-1.0 mmol/L</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <p className="font-bold">Sodium Bicarbonate (if acidosis):</p>
                  <div className="bg-orange-50 p-3 rounded mt-2">
                    <p>• 1-2 mEq/kg IV over 30 min</p>
                    <p className="text-sm">• Only if pH below 7.2</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-lg border-2 border-blue-300">
            <h3 className="font-bold text-blue-900 mb-4 text-lg">
              STEP 3: Remove K+ from Body
            </h3>
            <div className="space-y-3">
              <Card>
                <CardContent className="p-4 text-sm">
                  <p className="font-bold">Sodium Polystyrene Sulfonate (Kayexalate):</p>
                  <div className="bg-blue-50 p-3 rounded mt-2">
                    <p>• <strong>1 g/kg PO or PR</strong> (max 15 g/dose)</p>
                    <p className="text-sm mt-1">• Takes 2-6 hours to work</p>
                    <p className="text-sm">• Avoid in ileus/intestinal disease</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-400 border-2">
                <CardContent className="p-4">
                  <p className="font-bold mb-2">DIALYSIS Indications:</p>
                  <ul className="text-sm space-y-1">
                    <li>• K+ &gt;7.0 mmol/L refractory to medical therapy</li>
                    <li>• Persistent ECG changes despite calcium</li>
                    <li>• Anuria / severe AKI</li>
                  </ul>
                  <Link to={createPageUrl("RRTAssistant")}>
                    <Button className="mt-3 bg-cyan-600 hover:bg-cyan-700">
                      <Droplet className="w-4 h-4 mr-2" />
                      RRT Assistant
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-amber-50 border-amber-300">
        <CardHeader>
          <CardTitle className="text-base">ECG Changes in Hyperkalemia</CardTitle>
        </CardHeader>
        <CardContent className="p-4 text-sm">
          <ul className="space-y-2">
            <li><strong>Mild (5.5-6.0):</strong> Tall peaked T waves</li>
            <li><strong>Moderate (6.0-7.0):</strong> Prolonged PR, flattened P waves, widened QRS</li>
            <li><strong>Severe (&gt;7.0):</strong> Sine wave pattern, risk of VF/asystole</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}