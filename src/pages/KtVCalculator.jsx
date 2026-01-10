import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function KtVCalculator() {
  const [preDialysisUrea, setPreDialysisUrea] = useState("");
  const [postDialysisUrea, setPostDialysisUrea] = useState("");
  const [dialysisTime, setDialysisTime] = useState("");
  const [postDialysisWeight, setPostDialysisWeight] = useState("");
  const [ufVolume, setUfVolume] = useState("");
  const [results, setResults] = useState(null);

  const handleCalculate = () => {
    if (!preDialysisUrea || !postDialysisUrea || !dialysisTime || !postDialysisWeight) return;

    const preUrea = parseFloat(preDialysisUrea);
    const postUrea = parseFloat(postDialysisUrea);
    const time = parseFloat(dialysisTime);
    const weight = parseFloat(postDialysisWeight);
    const uf = ufVolume ? parseFloat(ufVolume) : 0;

    // Single pool Kt/V (Daugirdas formula)
    const R = postUrea / preUrea;
    const ktv = -Math.log(R - 0.008 * time) + (4 - 3.5 * R) * (uf / weight);

    let adequacy = "";
    let color = "";
    let interpretation = "";

    if (ktv >= 1.4) {
      adequacy = "Adequate";
      color = "green";
      interpretation = "Dialysis prescription meets adequacy target. Continue current regimen.";
    } else if (ktv >= 1.2) {
      adequacy = "Borderline";
      color = "amber";
      interpretation = "Dialysis prescription needs adjustment. Increase time, frequency, or blood flow.";
    } else {
      adequacy = "Inadequate";
      color = "red";
      interpretation = "Dialysis prescription needs significant adjustment. Increase time, frequency, or blood flow urgently.";
    }

    // URR (Urea Reduction Ratio)
    const urr = ((preUrea - postUrea) / preUrea) * 100;

    setResults({
      ktv: ktv.toFixed(2),
      urr: urr.toFixed(1),
      adequacy,
      color,
      interpretation
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Link to={createPageUrl("Hub")}>
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Kt/V Calculator</h1>
          <p className="text-slate-600 text-sm">Calculate dialysis adequacy using the Kt/V ratio</p>
        </div>

        <Card className="bg-white shadow-lg mb-6">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-lg">Patient Parameters</CardTitle>
            <p className="text-xs text-slate-500">Enter the required values to calculate Kt/V</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-semibold text-slate-700">Pre-dialysis Urea (mg/dL)</Label>
                <Input
                  type="number"
                  value={preDialysisUrea}
                  onChange={(e) => setPreDialysisUrea(e.target.value)}
                  placeholder="190"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-semibold text-slate-700">Post-dialysis Urea (mg/dL)</Label>
                <Input
                  type="number"
                  value={postDialysisUrea}
                  onChange={(e) => setPostDialysisUrea(e.target.value)}
                  placeholder="125"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-semibold text-slate-700">Dialysis Time (hours)</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={dialysisTime}
                  onChange={(e) => setDialysisTime(e.target.value)}
                  placeholder="3"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-semibold text-slate-700">Post-dialysis Weight (kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={postDialysisWeight}
                  onChange={(e) => setPostDialysisWeight(e.target.value)}
                  placeholder="20"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-semibold text-slate-700">Ultrafiltration Volume (L)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={ufVolume}
                  onChange={(e) => setUfVolume(e.target.value)}
                  placeholder="1"
                  className="mt-1"
                />
              </div>
            </div>

            <Button
              onClick={handleCalculate}
              disabled={!preDialysisUrea || !postDialysisUrea || !dialysisTime || !postDialysisWeight}
              className="w-full mt-6 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-6"
            >
              Calculate Kt/V
            </Button>
          </CardContent>
        </Card>

        {results && (
          <>
            <Card className={`shadow-lg mb-6 border-2 ${
              results.color === "green" ? "bg-green-50 border-green-200" :
              results.color === "amber" ? "bg-amber-50 border-amber-200" :
              "bg-red-50 border-red-200"
            }`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Results</CardTitle>
                  <Badge className={`${
                    results.color === "green" ? "bg-green-100 text-green-800 border-green-300" :
                    results.color === "amber" ? "bg-amber-100 text-amber-800 border-amber-300" :
                    "bg-red-100 text-red-800 border-red-300"
                  } border text-base px-4 py-1`}>
                    {results.adequacy}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className={`text-6xl font-bold ${
                    results.color === "green" ? "text-green-700" :
                    results.color === "amber" ? "text-amber-700" :
                    "text-red-700"
                  }`}>
                    Kt/V = {results.ktv}
                  </div>
                  <div className="text-slate-600 mt-2">Target: ≥1.4 for adequate dialysis</div>
                </div>

                <div className="mb-4">
                  <div className="text-sm font-semibold text-slate-700 mb-2">Clinical Interpretation</div>
                  <p className="text-sm text-slate-700">{results.interpretation}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="p-4 bg-white rounded-lg border">
                    <div className="text-xs text-slate-600 mb-1">Urea Reduction Ratio</div>
                    <div className="text-2xl font-bold text-cyan-600">{results.urr}%</div>
                  </div>
                  <div className="p-4 bg-white rounded-lg border">
                    <div className="text-xs text-slate-600 mb-1">Target URR</div>
                    <div className="text-2xl font-bold text-slate-700">≥65%</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg">
              <CardHeader className="bg-slate-50 border-b">
                <CardTitle className="text-lg">Reference Values</CardTitle>
              </CardHeader>
              <CardContent className="p-6 text-sm text-slate-700">
                <div className="space-y-3">
                  <div>
                    <strong>Adequate:</strong> Kt/V ≥1.4
                  </div>
                  <div>
                    <strong>Borderline:</strong> Kt/V 1.2-1.39
                  </div>
                  <div>
                    <strong>Inadequate:</strong> Kt/V &lt;1.2
                  </div>
                  
                  <Alert className="bg-blue-50 border-blue-200 mt-4">
                    <AlertDescription className="text-sm text-blue-800">
                      <strong>Note:</strong> Kt/V should be measured monthly. If inadequate, consider increasing 
                      dialysis time, frequency, or blood flow rate. Target weekly Kt/V of 3.9 for thrice-weekly HD.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}