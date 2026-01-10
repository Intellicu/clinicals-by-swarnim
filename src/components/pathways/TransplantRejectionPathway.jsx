import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity, AlertTriangle, Info, Heart, CheckCircle } from "lucide-react";

export default function TransplantRejectionPathway() {
  const [baselineCr, setBaselineCr] = useState("");
  const [currentCr, setCurrentCr] = useState("");
  const [daysPostTx, setDaysPostTx] = useState("");
  const [tacLevel, setTacLevel] = useState("");
  const [hasFever, setHasFever] = useState(false);
  const [hasGraftTenderness, setHasGraftTenderness] = useState(false);
  const [protocol, setProtocol] = useState(null);

  const generateProtocol = () => {
    const baseline = parseFloat(baselineCr);
    const current = parseFloat(currentCr);
    const days = parseFloat(daysPostTx);
    const tac = parseFloat(tacLevel);
    
    const crRise = ((current - baseline) / baseline * 100).toFixed(0);

    let rejectionType = "Unknown";
    let treatment = null;

    if (days < 7) {
      rejectionType = "Early Graft Dysfunction";
      treatment = {
        type: "Likely NOT rejection",
        ddx: [
          "Delayed graft function (DGF) - especially if deceased donor",
          "Acute tubular necrosis (ATN)",
          "Hyperacute rejection (rare - within minutes to hours)",
          "Calcineurin inhibitor toxicity",
          "Urological complication (obstruction, leak, vascular thrombosis)"
        ],
        workup: [
          "Renal ultrasound with Doppler - check for obstruction, perfusion, fluid collections",
          "Check tacrolimus trough (target 8-12 ng/mL early post-tx)",
          "Renal biopsy if no improvement by 7 days or concern for hyperacute rejection",
          "Furosemide challenge (1-2 mg/kg) to differentiate oliguric ATN from rejection"
        ],
        management: [
          "Continue standard immunosuppression (tacrolimus, MMF, prednisone)",
          "Optimize volume status",
          "Avoid nephrotoxins",
          "Daily Cr, urine output monitoring",
          "Most ATN/DGF resolves within 1-3 weeks"
        ]
      };
    } else if (crRise >= 25) {
      rejectionType = "Acute Rejection (Suspected)";
      treatment = {
        type: "Acute T-cell Mediated Rejection (most common) OR Antibody-Mediated Rejection (AMR)",
        urgentWorkup: [
          "Renal biopsy STAT - gold standard for diagnosis and typing rejection",
          "Check tacrolimus trough - ensure therapeutic (5-10 ng/mL)",
          "Check anti-HLA antibodies (DSA - donor-specific antibodies)",
          "Renal ultrasound - rule out obstruction, fluid collection",
          "BK virus PCR - can mimic rejection"
        ],
        empiricTreatment: [
          {
            title: "Pulse IV Steroids (Start Immediately, Don't Wait for Biopsy)",
            steps: [
              "IV Methylprednisolone 10-15 mg/kg/day (max 500-1000mg) × 3 days",
              "If no response by day 3 → escalate to anti-thymocyte globulin (ATG)",
              "Continue oral tacrolimus + MMF throughout"
            ]
          },
          {
            title: "If Biopsy Confirms T-cell Mediated Rejection",
            steps: [
              "Complete steroid pulse if not done",
              "If steroid-resistant (no Cr improvement by 5-7 days):",
              "→ ATG 1.5 mg/kg/day × 7-14 days",
              "→ OR Alemtuzumab 0.3 mg/kg single dose (off-label)",
              "Optimize maintenance: Increase tacrolimus target to 8-12 ng/mL"
            ]
          },
          {
            title: "If Antibody-Mediated Rejection (AMR)",
            steps: [
              "Plasmapheresis (PLEX) or immunoadsorption - 5-7 sessions",
              "IVIG 2 g/kg divided over 2-5 days (after each PLEX)",
              "Rituximab 375 mg/m² × 1-4 doses",
              "Bortezomib 1.3 mg/m² (if severe, refractory AMR)",
              "Continue tacrolimus + MMF + steroids"
            ]
          }
        ],
        monitoring: "Daily Cr until improving, then every 2-3 days. Tac levels twice weekly. DSA levels at 1, 3, 6 months post-treatment.",
        prognosis: "Early acute rejection (within 1 year): 80-90% graft salvage with treatment. AMR has worse prognosis than T-cell mediated."
      };
    } else {
      rejectionType = "Mild Cr Rise - Rule Out Other Causes";
      treatment = {
        type: "Likely NOT acute rejection",
        ddx: [
          "Dehydration / Volume depletion",
          "Calcineurin inhibitor toxicity (check tac level)",
          "UTI or pyelonephritis",
          "BK virus nephropathy",
          "Medication non-adherence",
          "Obstruction or urine leak"
        ],
        workup: [
          "Check tacrolimus trough",
          "Urine analysis and culture",
          "BK virus PCR (blood and urine)",
          "Renal ultrasound",
          "Review medication adherence",
          "Hydration status assessment"
        ],
        management: [
          "Optimize hydration",
          "Hold/reduce tacrolimus if trough is greater than 12 ng/mL",
          "Treat UTI if present",
          "Recheck Cr in 2-3 days",
          "Biopsy if Cr continues to rise or reaches greater than 25% above baseline"
        ]
      };
    }

    setProtocol({
      rejectionType,
      crRise,
      ...treatment
    });
  };

  return (
    <div className="space-y-6">
      <Alert className="bg-purple-50 border-purple-200 border-2">
        <Heart className="w-5 h-5 text-purple-600" />
        <AlertDescription className="text-purple-800">
          <strong>Acute Kidney Transplant Rejection:</strong> Rising creatinine post-transplant is rejection until proven otherwise. Early recognition and treatment critical for graft survival. Biopsy is gold standard for diagnosis.
        </AlertDescription>
      </Alert>

      {!protocol ? (
        <Card>
          <CardHeader className="bg-purple-50 border-b">
            <CardTitle>Transplant Creatinine Assessment</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Baseline Creatinine (mg/dL) *</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={baselineCr}
                  onChange={(e) => setBaselineCr(e.target.value)}
                  placeholder="e.g., 0.8"
                />
                <p className="text-xs text-slate-500">Best recent Cr</p>
              </div>
              <div>
                <Label>Current Creatinine (mg/dL) *</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={currentCr}
                  onChange={(e) => setCurrentCr(e.target.value)}
                  placeholder="e.g., 1.2"
                />
              </div>
              <div>
                <Label>Days Post-Transplant *</Label>
                <Input
                  type="number"
                  value={daysPostTx}
                  onChange={(e) => setDaysPostTx(e.target.value)}
                  placeholder="e.g., 45"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Tacrolimus Trough (ng/mL)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={tacLevel}
                  onChange={(e) => setTacLevel(e.target.value)}
                  placeholder="e.g., 6.5"
                />
                <p className="text-xs text-slate-500">Target: 8-12 (early), 5-8 (late)</p>
              </div>
            </div>

            <Button
              onClick={generateProtocol}
              disabled={!baselineCr || !currentCr || !daysPostTx}
              className="w-full bg-purple-600 hover:bg-purple-700 py-6 text-lg"
            >
              <Activity className="w-5 h-5 mr-2" />
              Generate Evaluation Protocol
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="border-2 border-purple-400 bg-purple-50">
            <CardHeader>
              <CardTitle className="text-2xl">{protocol.rejectionType}</CardTitle>
              <p className="text-sm text-purple-700 mt-2">
                Creatinine rise: {baselineCr} → {currentCr} mg/dL ({protocol.crRise}% increase)
              </p>
            </CardHeader>
          </Card>

          {protocol.urgentWorkup && (
            <Card className="border-2 border-red-400 shadow-xl">
              <CardHeader className="bg-red-100 border-b-2">
                <CardTitle className="text-lg text-red-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Urgent Diagnostic Workup
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-2">
                {protocol.urgentWorkup.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-white p-3 rounded border-2 border-red-200">
                    <span className="w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">
                      {idx + 1}
                    </span>
                    <p className="text-sm text-slate-900 font-medium">{item}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {protocol.empiricTreatment && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-purple-900">Treatment Protocol:</h3>
              {protocol.empiricTreatment.map((section, idx) => (
                <Card key={idx} className="border-2 border-green-300">
                  <CardHeader className="bg-green-100 border-b">
                    <CardTitle className="text-base text-green-900">{section.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-2">
                    {section.steps.map((step, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-slate-800">{step}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {protocol.ddx && (
            <Card className="bg-amber-50 border-amber-200">
              <CardHeader>
                <CardTitle className="text-base">Differential Diagnosis</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {protocol.ddx.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-amber-600">•</span>
                      <span className="text-amber-900">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {protocol.workup && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-base">Diagnostic Evaluation</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {protocol.workup.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span className="text-blue-900">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {protocol.management && (
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-base">Management Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {protocol.management.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-green-900">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {protocol.monitoring && (
            <Card className="bg-cyan-50 border-cyan-200">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-cyan-909">{protocol.monitoring}</p>
              </CardContent>
            </Card>
          )}

          {protocol.prognosis && (
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Prognosis:</strong> {protocol.prognosis}
              </AlertDescription>
            </Alert>
          )}

          <Button onClick={() => setProtocol(null)} variant="outline" className="w-full">
            Re-assess
          </Button>
        </div>
      )}

      <Card className="bg-slate-50">
        <CardHeader>
          <CardTitle className="text-lg">Rejection Prevention & Long-term Care</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span><strong>Medication adherence:</strong> Number one modifiable risk factor for rejection. Never miss doses.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span><strong>Standard triple therapy:</strong> Tacrolimus + MMF + Prednisone (taper over 3-6 months)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span><strong>Target trough levels:</strong> Tac 8-12 ng/mL (0-3 months), 6-10 (3-12 months), 5-8 (more than 12 months)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span><strong>Monitoring schedule:</strong> Cr, tac level twice weekly × 1 month, then weekly × 2 months, then every 2 weeks × 3 months, then monthly</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span><strong>Infection prophylaxis:</strong> TMP-SMX (PJP), valganciclovir (CMV), nystatin (fungal) for 3-6 months post-tx</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span><strong>Protocol biopsy:</strong> Consider at 3, 6, 12 months even if Cr stable (detect subclinical rejection)</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}