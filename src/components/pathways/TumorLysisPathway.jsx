import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Flame, AlertTriangle, Zap, Droplet, Activity, Calculator } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function TumorLysisPathway() {
  const [uricAcid, setUricAcid] = useState("");
  const [potassium, setPotassium] = useState("");
  const [phosphate, setPhosphate] = useState("");
  const [calcium, setCalcium] = useState("");
  const [creatinine, setCreatinine] = useState("");
  const [tlsGrade, setTlsGrade] = useState(null);

  const assessTLS = () => {
    const ua = parseFloat(uricAcid);
    const k = parseFloat(potassium);
    const phos = parseFloat(phosphate);
    const ca = parseFloat(calcium);

    let labTLS = false;
    let clinicalTLS = false;

    // Laboratory TLS (Cairo-Bishop): ≥2 of these abnormalities
    let abnormalities = 0;
    if (ua > 8.0) abnormalities++;
    if (k > 6.0) abnormalities++;
    if (phos > 4.5) abnormalities++;
    if (ca < 7.0) abnormalities++;

    if (abnormalities >= 2) labTLS = true;

    // Clinical TLS: Lab TLS + AKI or arrhythmia or seizure
    const cr = parseFloat(creatinine);
    if (labTLS && (cr > 1.5 || k > 6.0)) {
      clinicalTLS = true;
    }

    setTlsGrade({ labTLS, clinicalTLS, abnormalities });
  };

  return (
    <div className="space-y-6">
      <Alert className="bg-red-50 border-red-400 border-2">
        <Flame className="w-5 h-5 text-red-600" />
        <AlertDescription className="text-red-800">
          <strong>Tumor Lysis Syndrome:</strong> Oncological emergency from massive tumor cell breakdown - prevention is key
        </AlertDescription>
      </Alert>

      <Card className="shadow-lg border-2 border-orange-300">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-red-600" />
            Cairo-Bishop TLS Criteria
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Uric Acid (mg/dL)</Label>
              <Input type="number" step="0.1" value={uricAcid} onChange={(e) => setUricAcid(e.target.value)} placeholder="10.5" />
              <p className="text-xs text-slate-500 mt-1">Abnormal if &gt;8.0 mg/dL</p>
            </div>
            <div>
              <Label>Potassium (mmol/L)</Label>
              <Input type="number" step="0.1" value={potassium} onChange={(e) => setPotassium(e.target.value)} placeholder="6.8" />
              <p className="text-xs text-slate-500 mt-1">Abnormal if &gt;6.0 mmol/L</p>
            </div>
            <div>
              <Label>Phosphate (mg/dL)</Label>
              <Input type="number" step="0.1" value={phosphate} onChange={(e) => setPhosphate(e.target.value)} placeholder="8.2" />
              <p className="text-xs text-slate-500 mt-1">Abnormal if &gt;4.5 mg/dL</p>
            </div>
            <div>
              <Label>Calcium (mg/dL)</Label>
              <Input type="number" step="0.1" value={calcium} onChange={(e) => setCalcium(e.target.value)} placeholder="6.5" />
              <p className="text-xs text-slate-500 mt-1">Abnormal if &lt;7.0 mg/dL</p>
            </div>
            <div>
              <Label>Creatinine (mg/dL)</Label>
              <Input type="number" step="0.1" value={creatinine} onChange={(e) => setCreatinine(e.target.value)} placeholder="2.0" />
            </div>
          </div>

          <Button onClick={assessTLS} className="w-full bg-orange-600 hover:bg-orange-700">
            Assess TLS Grade
          </Button>

          {tlsGrade && (
            <Card className={`border-2 ${
              tlsGrade.clinicalTLS ? "bg-red-100 border-red-500" :
              tlsGrade.labTLS ? "bg-orange-100 border-orange-500" :
              "bg-green-100 border-green-500"
            }`}>
              <CardContent className="p-4">
                <div className="text-center">
                  <Badge className={`text-xl px-6 py-2 ${
                    tlsGrade.clinicalTLS ? "bg-red-600" :
                    tlsGrade.labTLS ? "bg-orange-600" :
                    "bg-green-600"
                  } text-white`}>
                    {tlsGrade.clinicalTLS ? "CLINICAL TLS" :
                     tlsGrade.labTLS ? "LABORATORY TLS" :
                     "NO TLS"}
                  </Badge>
                  <p className="text-sm mt-3">
                    {tlsGrade.abnormalities} metabolic abnormalities detected
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b">
          <CardTitle>Prevention Strategies (Before Chemotherapy)</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <Card className="bg-blue-50 border-blue-300">
            <CardHeader>
              <CardTitle className="text-base">Risk Stratification</CardTitle>
            </CardHeader>
            <CardContent className="p-4 text-sm">
              <div className="space-y-2">
                <p><strong>High Risk:</strong> Burkitt lymphoma, ALL with WBC &gt;100,000, high LDH, large tumor burden</p>
                <p><strong>Intermediate Risk:</strong> ALL with WBC 50-100k, stage III/IV lymphomas</p>
                <p><strong>Low Risk:</strong> Solid tumors, low WBC ALL</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-300 border-2">
            <CardHeader className="bg-cyan-100">
              <CardTitle className="text-base">Hydration (ALL patients)</CardTitle>
            </CardHeader>
            <CardContent className="p-4 text-sm space-y-2">
              <p className="font-bold">Aggressive IV Fluids:</p>
              <div className="bg-white p-3 rounded border">
                <p>• <strong>3 L/m²/day</strong> (or 200 mL/kg/day up to 3 L)</p>
                <p>• 0.9% NS or 0.45% NS + bicarbonate</p>
                <p>• Start 24-48 hours before chemotherapy</p>
                <p>• Continue until tumor lysis risk subsides</p>
                <p>• Target urine output: 3-5 mL/kg/hr</p>
              </div>
              <Link to={createPageUrl("FluidCalculator")}>
                <Button size="sm" variant="outline" className="mt-2">
                  <Calculator className="w-4 h-4 mr-2" />
                  Calculate Fluid Rate
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-300">
            <CardHeader className="bg-green-100">
              <CardTitle className="text-base">Rasburicase (High-Risk Patients)</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2 text-sm">
              <p className="font-bold">Indications:</p>
              <ul className="list-disc list-inside">
                <li>Baseline uric acid &gt;8 mg/dL</li>
                <li>High tumor burden malignancies</li>
                <li>Pre-existing AKI</li>
              </ul>
              <div className="bg-white p-3 rounded border mt-3">
                <p><strong>Dose:</strong> 0.2 mg/kg IV once daily</p>
                <p className="text-xs mt-1">Often single dose is sufficient</p>
                <p className="text-xs text-red-600 font-bold">⚠️ Contraindicated in G6PD deficiency</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-yellow-50 border-yellow-300">
            <CardHeader className="bg-yellow-100">
              <CardTitle className="text-base">Allopurinol (Low-Intermediate Risk)</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2 text-sm">
              <div className="bg-white p-3 rounded border">
                <p><strong>Dose:</strong> 10 mg/kg/day PO divided TDS (max 800 mg/day)</p>
                <p className="text-xs mt-1">Start 24-48h before chemotherapy</p>
                <p className="text-xs">Prevents NEW uric acid formation (does not lower existing levels)</p>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <Card className="bg-red-50 border-red-400 border-2">
        <CardHeader className="bg-red-100 border-b">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Treatment of Established TLS
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-3">
          <Card>
            <CardContent className="p-4 text-sm">
              <p className="font-bold">Hyperkalemia:</p>
              <p>• See hyperkalemia protocol (calcium, insulin, salbutamol)</p>
              <p>• Consider emergent dialysis if &gt;7.0 mmol/L</p>
              <Link to={createPageUrl("PotassiumCalculator")} className="inline-block mt-2">
                <Button size="sm" variant="outline">
                  K+ Management →
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-sm">
              <p className="font-bold">Hyperphosphatemia + Hypocalcemia:</p>
              <p>• Phosphate binders (sevelamer, calcium acetate)</p>
              <p>• Treat symptomatic hypocalcemia cautiously (Ca-phos product!)</p>
              <p>• Dialysis if phos &gt;10 mg/dL or symptomatic</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-400 border-2">
            <CardContent className="p-4">
              <p className="font-bold mb-2">DIALYSIS Indications in TLS:</p>
              <ul className="text-sm space-y-1">
                <li>• Hyperkalemia &gt;6.5-7.0 mmol/L refractory to medical therapy</li>
                <li>• AKI with oliguria/anuria</li>
                <li>• Severe acidosis</li>
                <li>• Fluid overload</li>
                <li>• Symptomatic hypocalcemia + hyperphosphatemia</li>
              </ul>
              <Link to={createPageUrl("RRTAssistant")}>
                <Button className="mt-3 bg-cyan-600 hover:bg-cyan-700">
                  <Droplet className="w-4 h-4 mr-2" />
                  RRT Assistant
                </Button>
              </Link>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <Card className="bg-purple-50 border-purple-300">
        <CardHeader>
          <CardTitle className="text-base">Monitoring Protocol</CardTitle>
        </CardHeader>
        <CardContent className="p-4 text-sm">
          <p className="font-bold mb-2">Labs q6-8h during high-risk period:</p>
          <ul className="space-y-1">
            <li>• Potassium, phosphate, calcium, uric acid</li>
            <li>• BUN, creatinine</li>
            <li>• LDH</li>
            <li>• Continuous cardiac monitoring</li>
            <li>• Urine output (strict I/O)</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}