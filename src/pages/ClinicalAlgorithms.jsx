import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft } from "lucide-react";

export default function ClinicalAlgorithms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        <Link to={createPageUrl("Hub")}>
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Hub
          </Button>
        </Link>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Clinical Algorithms</h1>
          <p className="text-slate-600">Step-by-step management flowcharts for common conditions</p>
        </div>

        <Tabs defaultValue="aki" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="aki">AKI</TabsTrigger>
            <TabsTrigger value="ckd">CKD</TabsTrigger>
            <TabsTrigger value="ns">Nephrotic Syndrome</TabsTrigger>
            <TabsTrigger value="stones">Kidney Stones</TabsTrigger>
            <TabsTrigger value="dialysis">Dialysis</TabsTrigger>
          </TabsList>

          {/* AKI Algorithm */}
          <TabsContent value="aki">
            <Card className="bg-white shadow-lg">
              <CardHeader className="bg-red-50 border-b border-red-200">
                <CardTitle className="text-xl text-red-900">Acute Kidney Injury (AKI) Management Algorithm</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Step 1 */}
                  <div className="border-l-4 border-red-500 pl-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-red-600 text-white">Step 1</Badge>
                      <h3 className="font-bold text-lg">Recognize AKI</h3>
                    </div>
                    <ul className="text-sm text-slate-700 space-y-1 list-disc ml-5">
                      <li>SCr ↑ ≥0.3 mg/dL within 48h OR ≥1.5× baseline within 7 days</li>
                      <li>UO &lt;0.5 mL/kg/hr for 6+ hours</li>
                      <li>Use <Link to={createPageUrl("AKIStager")} className="text-blue-600 underline">AKI Stager</Link> for classification</li>
                    </ul>
                  </div>

                  {/* Step 2 */}
                  <div className="border-l-4 border-orange-500 pl-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-orange-600 text-white">Step 2</Badge>
                      <h3 className="font-bold text-lg">Assess Severity & Urgency</h3>
                    </div>
                    <div className="grid md:grid-cols-3 gap-3 mt-3">
                      <Alert className="bg-green-50 border-green-200">
                        <AlertDescription className="text-xs text-green-800">
                          <strong>Stage 1:</strong> Monitor q6-12h, optimize volume, stop nephrotoxins
                        </AlertDescription>
                      </Alert>
                      <Alert className="bg-amber-50 border-amber-200">
                        <AlertDescription className="text-xs text-amber-800">
                          <strong>Stage 2:</strong> Nephrology consult, monitor q4-6h, daily K/PO4
                        </AlertDescription>
                      </Alert>
                      <Alert className="bg-red-50 border-red-200">
                        <AlertDescription className="text-xs text-red-800">
                          <strong>Stage 3:</strong> URGENT nephrology, ICU monitoring, assess RRT
                        </AlertDescription>
                      </Alert>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="border-l-4 border-blue-500 pl-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-blue-600 text-white">Step 3</Badge>
                      <h3 className="font-bold text-lg">Identify Cause (Prerenal/Intrinsic/Postrenal)</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <strong className="text-sm text-blue-900">Prerenal (most common):</strong>
                        <p className="text-xs text-blue-800 mt-1">Dehydration, sepsis, heart failure, hepatorenal. FENa &lt;1%, UNa &lt;20.</p>
                        <p className="text-xs text-blue-700 mt-1">→ Use <Link to={createPageUrl("FENaCalculator")} className="underline">FENa Calculator</Link></p>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <strong className="text-sm text-purple-900">Intrinsic:</strong>
                        <p className="text-xs text-purple-800 mt-1">ATN, AIN, GN, HUS. FENa &gt;2%, muddy brown casts.</p>
                      </div>
                      <div className="bg-amber-50 p-3 rounded-lg">
                        <strong className="text-sm text-amber-900">Postrenal:</strong>
                        <p className="text-xs text-amber-800 mt-1">Obstruction (PUJ, stones, tumor). Bladder scan + renal US.</p>
                      </div>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="border-l-4 border-green-500 pl-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-green-600 text-white">Step 4</Badge>
                      <h3 className="font-bold text-lg">Initial Management</h3>
                    </div>
                    <ul className="text-sm text-slate-700 space-y-1 list-disc ml-5">
                      <li><strong>Optimize hemodynamics:</strong> Fluid bolus 20 mL/kg if hypovolemic, vasopressors if shock</li>
                      <li><strong>Stop nephrotoxins:</strong> NSAIDs, aminoglycosides, ACE-i (if volume depleted), contrast</li>
                      <li><strong>Adjust drug doses:</strong> For GFR - use <Link to={createPageUrl("DoseCalculator")} className="text-blue-600 underline">Dose Calculator</Link></li>
                      <li><strong>Monitor:</strong> Daily weight, I/O, SCr, K+, acidosis</li>
                      <li><strong>Relieve obstruction:</strong> If postrenal (catheter, nephrostomy)</li>
                    </ul>
                  </div>

                  {/* Step 5 */}
                  <div className="border-l-4 border-purple-500 pl-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-purple-600 text-white">Step 5</Badge>
                      <h3 className="font-bold text-lg">Assess for RRT Indications (AEIOU)</h3>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <ul className="text-sm text-purple-900 space-y-2">
                        <li><strong>A</strong>cidosis - Metabolic acidosis pH &lt;7.1, refractory to bicarbonate</li>
                        <li><strong>E</strong>lectrolytes - Hyperkalemia &gt;6.5 mEq/L with ECG changes, refractory</li>
                        <li><strong>I</strong>ngestion/Intoxication - Dialyzable toxins (methanol, ethylene glycol, lithium)</li>
                        <li><strong>O</strong>verload - Fluid overload, pulmonary edema refractory to diuretics</li>
                        <li><strong>U</strong>remia - Uremic encephalopathy, pericarditis, bleeding</li>
                      </ul>
                      <p className="text-xs text-purple-700 mt-3">If any present → Nephrology STAT, initiate RRT</p>
                    </div>
                  </div>

                  {/* Step 6 */}
                  <div className="border-l-4 border-cyan-500 pl-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-cyan-600 text-white">Step 6</Badge>
                      <h3 className="font-bold text-lg">Recovery & Follow-up</h3>
                    </div>
                    <ul className="text-sm text-slate-700 space-y-1 list-disc ml-5">
                      <li>Monitor for recovery: SCr trending down, UO improving</li>
                      <li>Diuretic phase: May need electrolyte replacement</li>
                      <li>Follow-up: Check SCr at 3 months (some develop CKD)</li>
                      <li>If no recovery by 4 weeks: Biopsy to assess for ATN vs cortical necrosis</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CKD Algorithm */}
          <TabsContent value="ckd">
            <Card className="bg-white shadow-lg">
              <CardHeader className="bg-blue-50 border-b border-blue-200">
                <CardTitle className="text-xl text-blue-900">Chronic Kidney Disease (CKD) Management Algorithm</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-blue-600 text-white">Step 1</Badge>
                      <h3 className="font-bold text-lg">Diagnose & Stage CKD</h3>
                    </div>
                    <ul className="text-sm text-slate-700 space-y-1 list-disc ml-5">
                      <li>eGFR &lt;60 for &gt;3 months OR kidney damage markers (albuminuria, imaging, biopsy)</li>
                      <li>Use <Link to={createPageUrl("CKDStager")} className="text-blue-600 underline">CKD Stager</Link> - combines GFR (G1-G5) + Albuminuria (A1-A3)</li>
                      <li>Calculate with <Link to={createPageUrl("SchwartzGFR")} className="text-blue-600 underline">Schwartz</Link> or <Link to={createPageUrl("CKiDGFR")} className="text-blue-600 underline">CKiD</Link></li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-green-600 text-white">Step 2</Badge>
                      <h3 className="font-bold text-lg">Monitoring Frequency</h3>
                    </div>
                    <div className="grid md:grid-cols-3 gap-3">
                      <div className="bg-green-50 p-3 rounded border border-green-200">
                        <strong className="text-xs text-green-900">G1-G2:</strong>
                        <p className="text-xs text-green-800 mt-1">Annual SCr, UPCR, BP</p>
                      </div>
                      <div className="bg-amber-50 p-3 rounded border border-amber-200">
                        <strong className="text-xs text-amber-900">G3a-G3b:</strong>
                        <p className="text-xs text-amber-800 mt-1">Every 6-12 months + Hb, Ca, PO4</p>
                      </div>
                      <div className="bg-red-50 p-3 rounded border border-red-200">
                        <strong className="text-xs text-red-900">G4-G5:</strong>
                        <p className="text-xs text-red-800 mt-1">Every 3-6 months + full panel</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-purple-500 pl-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-purple-600 text-white">Step 3</Badge>
                      <h3 className="font-bold text-lg">Slow Progression</h3>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="grid md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <strong className="text-purple-900">Blood Pressure Control:</strong>
                          <p className="text-xs text-purple-800 mt-1">Target &lt;120/80 mmHg (or &lt;90th percentile in children)</p>
                          <p className="text-xs text-purple-700">ACE-i or ARB if albuminuria present</p>
                        </div>
                        <div>
                          <strong className="text-purple-900">Proteinuria Reduction:</strong>
                          <p className="text-xs text-purple-800 mt-1">ACE-i/ARB for A2-A3 albuminuria</p>
                          <p className="text-xs text-purple-700">SGLT2 inhibitors (if age appropriate)</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-amber-500 pl-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-amber-600 text-white">Step 4</Badge>
                      <h3 className="font-bold text-lg">Manage Complications</h3>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="bg-slate-50 p-3 rounded border">
                        <strong className="text-xs text-slate-900">G3-G5 Complications:</strong>
                        <ul className="text-xs text-slate-700 mt-2 space-y-1 list-disc ml-4">
                          <li>Anemia: Target Hb 10-12 g/dL (ESA, iron)</li>
                          <li>Acidosis: NaHCO3 if HCO3 &lt;22</li>
                          <li>Hyperkalemia: Diet, binders</li>
                          <li>CKD-MBD: Phosphate binders, vit D</li>
                          <li>Growth: Nutrition, GH therapy if indicated</li>
                        </ul>
                      </div>
                      <div className="bg-slate-50 p-3 rounded border">
                        <strong className="text-xs text-slate-900">Dietary Management:</strong>
                        <ul className="text-xs text-slate-700 mt-2 space-y-1 list-disc ml-4">
                          <li>Protein: 0.8-1.0 g/kg/day (G3-G5)</li>
                          <li>Sodium: &lt;2 g/day</li>
                          <li>Potassium: Restrict if hyperkalemic</li>
                          <li>Phosphate: Restrict in G4-G5</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-indigo-500 pl-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-indigo-600 text-white">Step 5</Badge>
                      <h3 className="font-bold text-lg">Plan for ESRD (G4-G5)</h3>
                    </div>
                    <ul className="text-sm text-slate-700 space-y-2 list-disc ml-5">
                      <li><strong>Education:</strong> RRT modalities (HD, PD, transplant)</li>
                      <li><strong>Vascular access:</strong> AVF creation when eGFR &lt;20 (if HD planned)</li>
                      <li><strong>PD catheter:</strong> Place 2-4 weeks before PD start</li>
                      <li><strong>Transplant evaluation:</strong> Start when eGFR 20-30</li>
                      <li><strong>Vaccination:</strong> Hep B, pneumococcal while immune function intact</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* NS Algorithm */}
          <TabsContent value="ns">
            <Card className="bg-white shadow-lg">
              <CardHeader className="bg-purple-50 border-b border-purple-200">
                <CardTitle className="text-xl text-purple-900">Nephrotic Syndrome Management Algorithm</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="border-l-4 border-purple-500 pl-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-purple-600 text-white">Initial Presentation</Badge>
                      <h3 className="font-bold text-lg">Diagnosis & Initial Workup</h3>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm text-purple-900 mb-2"><strong>Diagnostic Criteria:</strong></p>
                      <ul className="text-xs text-purple-800 space-y-1 list-disc ml-5">
                        <li>Proteinuria ≥40 mg/m²/hr (or UPCR &gt;2 mg/mg)</li>
                        <li>Hypoalbuminemia &lt;2.5 g/dL</li>
                        <li>Edema ± hyperlipidemia</li>
                      </ul>
                      <p className="text-xs text-purple-700 mt-3">Labs: Albumin, lipids, Cr, C3/C4, Hep B/C, urine R/M</p>
                    </div>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-blue-600 text-white">First Episode</Badge>
                      <h3 className="font-bold text-lg">Steroid Therapy</h3>
                    </div>
                    <div className="space-y-2">
                      <Alert className="bg-blue-50 border-blue-200">
                        <AlertDescription className="text-sm text-blue-900">
                          <strong>Induction (4-6 weeks):</strong> Prednisolone 60 mg/m²/day (max 80 mg) daily until remission (usually 2-4 weeks), then continue for total of 4-6 weeks
                        </AlertDescription>
                      </Alert>
                      <Alert className="bg-blue-50 border-blue-200">
                        <AlertDescription className="text-sm text-blue-900">
                          <strong>Consolidation (2-5 months):</strong> Prednisolone 40 mg/m² alternate days for 2-5 months
                        </AlertDescription>
                      </Alert>
                      <p className="text-xs text-blue-700 mt-2">Monitor: BP, growth, glucose, bone health, infections</p>
                    </div>
                  </div>

                  <div className="border-l-4 border-amber-500 pl-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-amber-600 text-white">Relapses</Badge>
                      <h3 className="font-bold text-lg">Classification & Management</h3>
                    </div>
                    <div className="grid md:grid-cols-3 gap-3">
                      <div className="bg-green-50 p-3 rounded border border-green-200">
                        <strong className="text-xs text-green-900">Infrequent Relapses:</strong>
                        <p className="text-xs text-green-800 mt-1">&lt;2 relapses in 6mo</p>
                        <p className="text-xs text-green-700 mt-1">→ Treat each relapse with steroids</p>
                      </div>
                      <div className="bg-amber-50 p-3 rounded border border-amber-200">
                        <strong className="text-xs text-amber-900">Frequent Relapses:</strong>
                        <p className="text-xs text-amber-800 mt-1">≥2 in 6mo or ≥4 in 12mo</p>
                        <p className="text-xs text-amber-700 mt-1">→ Steroid-sparing agents</p>
                      </div>
                      <div className="bg-red-50 p-3 rounded border border-red-200">
                        <strong className="text-xs text-red-900">Steroid-Dependent:</strong>
                        <p className="text-xs text-red-800 mt-1">Relapse during taper or &lt;2wk after stop</p>
                        <p className="text-xs text-red-700 mt-1">→ CNI, cyclophosphamide, or rituximab</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-red-500 pl-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-red-600 text-white">Steroid-Resistant</Badge>
                      <h3 className="font-bold text-lg">SRNS Pathway</h3>
                    </div>
                    <ul className="text-sm text-slate-700 space-y-1 list-disc ml-5">
                      <li><strong>No remission after 4-6 weeks daily steroids</strong></li>
                      <li>Kidney biopsy (FSGS, MCD, MN, MPGN)</li>
                      <li>Genetic testing (especially if age &lt;5 years)</li>
                      <li>CNI trial for 6-12 months (if non-genetic)</li>
                      <li>ACEI/ARB for proteinuria reduction</li>
                      <li>Monitor for CKD progression</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stones Algorithm */}
          <TabsContent value="stones">
            <Card className="bg-white shadow-lg">
              <CardHeader className="bg-amber-50 border-b border-amber-200">
                <CardTitle className="text-xl text-amber-900">Kidney Stone Management Algorithm</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="border-l-4 border-amber-500 pl-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-amber-600 text-white">Acute Episode</Badge>
                      <h3 className="font-bold text-lg">Pain & Stone Management</h3>
                    </div>
                    <ul className="text-sm text-slate-700 space-y-1 list-disc ml-5">
                      <li>Pain control: NSAIDs (if eGFR normal) or opioids</li>
                      <li>Hydration: IV fluids if vomiting, oral if tolerating</li>
                      <li>Imaging: Renal US ± CT (non-contrast) for stone size/location</li>
                      <li>Intervention if: &gt;10mm, obstruction, infection, uncontrolled pain</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-blue-600 text-white">Metabolic Workup</Badge>
                      <h3 className="font-bold text-lg">24-hour Urine & Stone Analysis</h3>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-900 mb-2"><strong>24-hour Urine Collection:</strong></p>
                      <div className="grid md:grid-cols-2 gap-2 text-xs text-blue-800">
                        <div>• Volume, pH</div>
                        <div>• Calcium, oxalate</div>
                        <div>• Citrate, uric acid</div>
                        <div>• Sodium, creatinine</div>
                      </div>
                      <p className="text-xs text-blue-700 mt-3">Use <Link to={createPageUrl("StoneRisk")} className="underline">Stone Risk Calculator</Link> for interpretation</p>
                    </div>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-green-600 text-white">Prevention</Badge>
                      <h3 className="font-bold text-lg">Stone Type-Specific Management</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-slate-50 p-3 rounded">
                        <strong className="text-sm text-slate-900">Calcium Oxalate (most common):</strong>
                        <ul className="text-xs text-slate-700 mt-2 space-y-1 list-disc ml-4">
                          <li>↑ Fluid intake (goal: urine output 1-2 L/m²/day)</li>
                          <li>Restrict sodium (&lt;2 g/day)</li>
                          <li>Normal calcium diet (do NOT restrict)</li>
                          <li>↓ Oxalate-rich foods (spinach, nuts, chocolate)</li>
                          <li>Citrate supplementation (Kcitrate 1-2 mEq/kg/day)</li>
                          <li>Thiazides if hypercalciuria persists</li>
                        </ul>
                      </div>
                      <div className="bg-slate-50 p-3 rounded">
                        <strong className="text-sm text-slate-900">Uric Acid Stones:</strong>
                        <ul className="text-xs text-slate-700 mt-2 space-y-1 list-disc ml-4">
                          <li>Alkalinize urine (target pH 6.5-7.0) with Kcitrate</li>
                          <li>Allopurinol if hyperuricosuria</li>
                          <li>↑ Fluids</li>
                        </ul>
                      </div>
                      <div className="bg-slate-50 p-3 rounded">
                        <strong className="text-sm text-slate-900">Cystine Stones:</strong>
                        <ul className="text-xs text-slate-700 mt-2 space-y-1 list-disc ml-4">
                          <li>High fluid intake (3-4 L/m²/day)</li>
                          <li>Alkalinize urine (target pH &gt;7.0)</li>
                          <li>Tiopronin or penicillamine</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dialysis Algorithm */}
          <TabsContent value="dialysis">
            <Card className="bg-white shadow-lg">
              <CardHeader className="bg-orange-50 border-b border-orange-200">
                <CardTitle className="text-xl text-orange-900">Dialysis Initiation & Management Algorithm</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="border-l-4 border-orange-500 pl-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-orange-600 text-white">Indications</Badge>
                      <h3 className="font-bold text-lg">When to Start Dialysis</h3>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <p className="text-sm text-orange-900 mb-2"><strong>No absolute eGFR threshold. Start based on:</strong></p>
                      <ul className="text-xs text-orange-800 space-y-1 list-disc ml-5">
                        <li>Uremic symptoms (nausea, anorexia, encephalopathy, pericarditis)</li>
                        <li>Severe metabolic acidosis refractory to bicarbonate</li>
                        <li>Hyperkalemia refractory to medical management</li>
                        <li>Volume overload/HTN refractory to diuretics</li>
                        <li>Growth failure despite nutritional support</li>
                        <li>Typically eGFR 8-12 mL/min/1.73m² in children</li>
                      </ul>
                    </div>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-blue-600 text-white">Modality Selection</Badge>
                      <h3 className="font-bold text-lg">Choose HD vs PD vs Transplant</h3>
                    </div>
                    <div className="grid md:grid-cols-3 gap-3">
                      <div className="bg-blue-50 p-3 rounded border border-blue-200">
                        <strong className="text-xs text-blue-900">Hemodialysis (HD):</strong>
                        <p className="text-xs text-blue-800 mt-2">Pros: Higher clearance, less family burden</p>
                        <p className="text-xs text-blue-800">Cons: Vascular access, clinic visits 3×/wk</p>
                        <p className="text-xs text-blue-700 mt-1">Best if: Older child, school-age, no home support</p>
                      </div>
                      <div className="bg-green-50 p-3 rounded border border-green-200">
                        <strong className="text-xs text-green-900">Peritoneal Dialysis (PD):</strong>
                        <p className="text-xs text-green-800 mt-2">Pros: Home-based, better growth, preserves RRF</p>
                        <p className="text-xs text-green-800">Cons: Peritonitis risk, family training</p>
                        <p className="text-xs text-green-700 mt-1">Best if: Young child, motivated family, bridge to transplant</p>
                      </div>
                      <div className="bg-purple-50 p-3 rounded border border-purple-200">
                        <strong className="text-xs text-purple-900">Preemptive Transplant:</strong>
                        <p className="text-xs text-purple-800 mt-2">Pros: No dialysis, best outcomes</p>
                        <p className="text-xs text-purple-800">Cons: Requires living donor</p>
                        <p className="text-xs text-purple-700 mt-1">Ideal if: Living donor available, eGFR 15-20</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-green-600 text-white">Adequacy Targets</Badge>
                      <h3 className="font-bold text-lg">Monitoring & Dose Adjustment</h3>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="bg-slate-50 p-3 rounded border">
                        <strong className="text-sm text-slate-900">Hemodialysis:</strong>
                        <ul className="text-xs text-slate-700 mt-2 space-y-1 list-disc ml-4">
                          <li>Kt/V ≥1.4 per session (measure monthly)</li>
                          <li>URR ≥65%</li>
                          <li>3-4 hours × 3 sessions/week typically</li>
                          <li>Dry weight assessment</li>
                        </ul>
                        <p className="text-xs text-blue-600 mt-2">Use <Link to={createPageUrl("KtVCalculator")} className="underline">Kt/V Calculator</Link></p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded border">
                        <strong className="text-sm text-slate-900">Peritoneal Dialysis:</strong>
                        <ul className="text-xs text-slate-700 mt-2 space-y-1 list-disc ml-4">
                          <li>Weekly Kt/V ≥1.7</li>
                          <li>Fill volume: 800-1400 mL/m² BSA</li>
                          <li>APD preferred in children</li>
                          <li>Monitor residual renal function</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}