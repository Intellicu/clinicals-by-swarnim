import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Activity, CheckCircle, Info, AlertTriangle } from "lucide-react";

export default function PSGNPathway() {
  const [age, setAge] = useState("");
  const [hasEdema, setHasEdema] = useState(false);
  const [hasHTN, setHasHTN] = useState(false);
  const [hasGrossHematuria, setHasGrossHematuria] = useState(false);
  const [hasOliguria, setHasOliguria] = useState(false);
  const [aso, setAso] = useState("");
  const [c3, setC3] = useState("");
  const [management, setManagement] = useState(null);

  const generateManagement = () => {
    const c3Level = parseFloat(c3);
    const asoLevel = parseFloat(aso);
    
    const severity = (hasEdema && hasHTN && hasOliguria) ? "Severe" : 
                     (hasHTN || hasEdema) ? "Moderate" : "Mild";

    const plan = {
      diagnosis: {
        criteria: [
          "Clinical: Acute onset hematuria (gross or microscopic) + edema + HTN",
          `Supportive labs: ${asoLevel > 200 ? '✓' : '○'} Elevated ASO titer (${aso || '___'} - confirms strep infection)`,
          `${c3Level < 80 ? '✓' : '○'} Low C3 (${c3 || '___'} mg/dL, normal 90-180)`,
          "Normal C4 (helps exclude lupus nephritis)",
          "Strep throat or skin infection 1-3 weeks prior"
        ],
        differentials: [
          "IgA Nephropathy (if C3 normal, recurrent episodes)",
          "Lupus Nephritis (if low C3 + C4, ANA+, multisystem)",
          "Membranoproliferative GN (if C3 persistently low >8 weeks)"
        ]
      },
      management: {
        general: [
          "SUPPORTIVE CARE ONLY - No immunosuppression needed",
          "Self-limited disease - spontaneous resolution in 2-4 weeks"
        ],
        fluidEdema: [
          {
            title: "Fluid Restriction",
            steps: [
              "If edema or HTN present: Restrict fluids to insensible losses + urine output",
              "Calculation: 400 mL/m²/day + previous day urine output",
              "Monitor daily weights - goal is gradual weight loss",
              "Avoid IV fluids unless severe oliguria with AKI"
            ]
          },
          {
            title: "Diuretics",
            steps: [
              "Furosemide 1-2 mg/kg/dose BID if significant edema",
              "Maximum 40 mg/dose",
              "Monitor: Daily weight, urine output, electrolytes (K+, Na+)",
              "Reduce dose as edema improves"
            ]
          }
        ],
        hypertension: [
          {
            title: "Blood Pressure Management",
            steps: [
              "Target BP <95th percentile for age/height",
              "First-line: Amlodipine 0.1-0.3 mg/kg/day (max 10 mg)",
              "If inadequate: Add ACE-I (Enalapril 0.1 mg/kg/day) AFTER acute phase",
              "Severe HTN (>99th %ile + 12 mmHg): IV labetalol or nicardipine",
              "Taper off medications as BP normalizes (usually 4-8 weeks)"
            ]
          }
        ],
        aki: [
          {
            title: "AKI Management (if Cr elevated)",
            steps: [
              "Usually transient and mild",
              "Fluid restriction + diuretics",
              "Avoid nephrotoxins (NSAIDs, aminoglycosides)",
              "Monitor Cr every 2-3 days - should improve within 1 week",
              "Dialysis rarely needed (only if severe oliguria + hyperkalemia + fluid overload)"
            ]
          }
        ],
        monitoring: [
          "Weekly: BP, weight, urine dipstick (protein, blood)",
          "Labs at 1 week: Cr, electrolytes, C3",
          "Labs at 4-6 weeks: C3 should normalize (if persistently low - consider other diagnosis)",
          "Follow-up: Monthly × 3 months, then q6 months × 1 year",
          "Expect: Hematuria may persist 6-12 months (normal), proteinuria resolves by 6 months"
        ],
        diet: [
          "Low sodium (no added salt) until edema and HTN resolved",
          "Normal protein - do NOT restrict",
          "Potassium restriction only if hyperkalemic",
          "Return to normal diet once clinical signs resolved"
        ]
      },
      prognosis: "Excellent. >95% complete recovery. Rarely progresses to CKD. Risk of recurrent PSGN <5%.",
      alerts: severity === "Severe" ? [
        "Severe presentation - monitor closely for AKI, hyperkalemia, pulmonary edema",
        "Consider hospitalization if severe oliguria, uncontrolled HTN, or respiratory distress",
        "Rule out rapidly progressive GN if Cr rapidly rising or nephrotic-range proteinuria"
      ] : []
    };

    setManagement(plan);
  };

  return (
    <div className="space-y-6">
      <Alert className="bg-blue-50 border-blue-200 border-2">
        <Activity className="w-5 h-5 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Post-Streptococcal Glomerulonephritis (PSGN):</strong> Immune-mediated glomerulonephritis following Group A Streptococcus infection. Latency 1-3 weeks (pharyngitis) or 3-6 weeks (skin infection). Self-limited, no immunosuppression needed.
        </AlertDescription>
      </Alert>

      {!management ? (
        <Card>
          <CardHeader className="bg-blue-50 border-b">
            <CardTitle>PSGN Clinical Assessment</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <Label>Age (years)</Label>
              <Input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g., 8"
              />
              <p className="text-xs text-slate-500 mt-1">Peak incidence 5-12 years</p>
            </div>

            <Card className="bg-red-50 border-red-200">
              <CardHeader>
                <CardTitle className="text-base">Clinical Presentation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox checked={hasGrossHematuria} onCheckedChange={setHasGrossHematuria} id="hematuria" />
                  <Label htmlFor="hematuria" className="cursor-pointer">Gross hematuria (tea/cola-colored urine)</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox checked={hasEdema} onCheckedChange={setHasEdema} id="edema" />
                  <Label htmlFor="edema" className="cursor-pointer">Edema (periorbital, pedal)</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox checked={hasHTN} onCheckedChange={setHasHTN} id="htn" />
                  <Label htmlFor="htn" className="cursor-pointer">Hypertension</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox checked={hasOliguria} onCheckedChange={setHasOliguria} id="oliguria" />
                  <Label htmlFor="oliguria" className="cursor-pointer">Oliguria (reduced urine output)</Label>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>ASO Titer (IU/mL)</Label>
                <Input
                  type="number"
                  value={aso}
                  onChange={(e) => setAso(e.target.value)}
                  placeholder="e.g., 400"
                />
                <p className="text-xs text-slate-500">Normal &lt;200 IU/mL</p>
              </div>
              <div>
                <Label>C3 Level (mg/dL)</Label>
                <Input
                  type="number"
                  value={c3}
                  onChange={(e) => setC3(e.target.value)}
                  placeholder="e.g., 45"
                />
                <p className="text-xs text-slate-500">Normal 90-180 mg/dL</p>
              </div>
            </div>

            <Button
              onClick={generateManagement}
              className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg"
            >
              <Activity className="w-5 h-5 mr-2" />
              Generate Management Plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="border-2 border-blue-400 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-2xl">Post-Streptococcal Glomerulonephritis - Diagnosis Confirmed</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="bg-white p-4 rounded-lg border-2 mb-4">
                <h4 className="font-bold text-blue-900 mb-2">Diagnostic Criteria:</h4>
                {management.diagnosis.criteria.map((criterion, idx) => (
                  <p key={idx} className="text-sm text-slate-800 mb-1">{criterion}</p>
                ))}
              </div>
              
              <div className="bg-amber-50 p-3 rounded border border-amber-200">
                <p className="text-xs font-semibold text-amber-900 mb-1">Differentials to Consider:</p>
                {management.diagnosis.differentials.map((diff, idx) => (
                  <p key={idx} className="text-xs text-amber-800">• {diff}</p>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-300 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-100 border-b-2">
              <CardTitle className="text-xl flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                Supportive Management Protocol
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <Alert className="bg-green-50 border-green-300 border-2">
                <Info className="w-5 h-5 text-green-600" />
                <AlertDescription className="text-green-900 font-semibold">
                  {management.management.general[0]} - {management.management.general[1]}
                </AlertDescription>
              </Alert>

              {management.management.fluidEdema.map((section, idx) => (
                <Card key={idx} className="bg-cyan-50 border-cyan-300 border-2">
                  <CardHeader>
                    <CardTitle className="text-base text-cyan-900">{section.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {section.steps.map((step, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="w-5 h-5 bg-cyan-600 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">
                          {i + 1}
                        </span>
                        <p className="text-sm text-slate-800">{step}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}

              {management.management.hypertension.map((section, idx) => (
                <Card key={idx} className="bg-red-50 border-red-300 border-2">
                  <CardHeader>
                    <CardTitle className="text-base text-red-900">{section.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {section.steps.map((step, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">
                          {i + 1}
                        </span>
                        <p className="text-sm text-slate-800">{step}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}

              {management.management.aki.map((section, idx) => (
                <Card key={idx} className="bg-purple-50 border-purple-300 border-2">
                  <CardHeader>
                    <CardTitle className="text-base text-purple-900">{section.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {section.steps.map((step, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="w-5 h-5 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">
                          {i + 1}
                        </span>
                        <p className="text-sm text-slate-800">{step}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}

              <Card className="bg-amber-50 border-amber-200">
                <CardHeader>
                  <CardTitle className="text-base">Diet Modifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 text-sm">
                    {management.management.diet.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-600">•</span>
                        <span className="text-slate-800">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-600" />
                    Monitoring Protocol
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 text-sm">
                    {management.management.monitoring.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="text-blue-900">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {management.alerts.length > 0 && (
                <Alert className="bg-red-50 border-red-300 border-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <AlertDescription className="text-red-900">
                    <strong>Clinical Alerts:</strong>
                    <ul className="mt-2 space-y-1">
                      {management.alerts.map((alert, idx) => (
                        <li key={idx}>• {alert}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <Alert className="bg-green-50 border-green-200">
                <Info className="w-4 h-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Prognosis:</strong> {management.prognosis}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Button onClick={() => setManagement(null)} variant="outline" className="w-full">
            Re-assess
          </Button>
        </div>
      )}
    </div>
  );
}