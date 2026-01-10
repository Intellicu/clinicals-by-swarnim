import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity, CheckCircle, TrendingUp } from "lucide-react";

export default function CKDMBDPathway() {
  const [ckdStage, setCkdStage] = useState("");
  const [pth, setPth] = useState("");
  const [calcium, setCalcium] = useState("");
  const [phosphate, setPhosphate] = useState("");
  const [vitD, setVitD] = useState("");
  const [management, setManagement] = useState(null);

  const generateManagement = () => {
    const pthVal = parseFloat(pth);
    const caVal = parseFloat(calcium);
    const pVal = parseFloat(phosphate);
    const vitDVal = parseFloat(vitD);
    const stage = parseInt(ckdStage);

    const targetPTH = stage === 3 ? "35-70 pg/mL" :
                     stage === 4 ? "70-110 pg/mL" :
                     stage === 5 ? "150-300 pg/mL" : "varies";

    const targetCa = "8.8-10.2 mg/dL";
    const targetP = stage <= 3 ? "<5.5 mg/dL" : stage === 4 ? "<5.0 mg/dL" : "<5.5 mg/dL";
    const targetVitD = ">30 ng/mL";

    let protocol = {
      targets: {
        pth: targetPTH,
        calcium: targetCa,
        phosphate: targetP,
        vitD: targetVitD,
        caxP: "<55 mg²/dL²"
      },
      phosphateManagement: [],
      calciumManagement: [],
      pthManagement: [],
      vitaminD: [],
      monitoring: ""
    };

    // Phosphate management
    if (pVal > 5.5) {
      protocol.phosphateManagement = [
        {
          title: "Dietary Phosphate Restriction",
          steps: [
            "Limit high-phosphate foods: Dairy (milk, cheese, yogurt), processed meats, cola drinks, nuts, whole grains",
            "Work with renal dietitian for meal planning",
            "Target: 800-1000 mg/day for children"
          ]
        },
        {
          title: "Phosphate Binders (with meals)",
          steps: [
            "FIRST-LINE: Calcium carbonate 50-100 mg/kg/day divided with meals (if Ca normal or low)",
            "• Dose: Start 500mg TID with meals, max 1500-2000mg/day",
            "• Contains 40% elemental calcium",
            "• Give WITH food for phosphate binding",
            "",
            "If Ca elevated or Ca × P product >55: Use non-calcium binders:",
            "• Sevelamer 800-1600mg TID with meals (age >6 years)",
            "• Lanthanum carbonate 500-1000mg TID with meals (age >6 years, off-label)",
            "",
            "Monitor: P, Ca weekly initially, then monthly. Adjust dose based on P levels."
          ]
        }
      ];
    }

    // PTH management
    if (pthVal > 110 && stage >= 4) {
      protocol.pthManagement = [
        {
          title: "Secondary Hyperparathyroidism Treatment",
          steps: [
            "STEP 1: Ensure P and Ca are controlled first (phosphate binders, vitamin D)",
            "",
            "STEP 2: Active Vitamin D Therapy",
            "• Calcitriol 0.01-0.05 mcg/kg/day PO (max 0.25-2 mcg/day)",
            "• OR Paricalcitol 0.04-0.1 mcg/kg IV/PO 3× weekly",
            "• Start low, titrate based on PTH and Ca levels",
            "• Goal: Suppress PTH while avoiding hypercalcemia",
            "",
            "STEP 3: Calcimimetics (if PTH remains elevated despite vitamin D)",
            "• Cinacalcet 0.25-0.5 mg/kg/day PO (max 180mg/day, age >6 years)",
            "• Start low (0.25 mg/kg), increase q2-4 weeks",
            "• Lowers PTH by increasing calcium-sensing receptor sensitivity",
            "• Monitor Ca closely (can cause hypocalcemia)",
            "",
            "STEP 4: Parathyroidectomy",
            "• If medical management fails",
            "• Indications: PTH >800 pg/mL with hypercalcemia, bone pain, fractures",
            "• Rare in children, consider in adolescents"
          ]
        }
      ];
    } else if (pthVal < 35 && stage >= 4) {
      protocol.pthManagement = [
        {
          title: "Adynamic Bone Disease (Low PTH)",
          steps: [
            "STOP or reduce active vitamin D (calcitriol)",
            "STOP or reduce calcimimetics if on them",
            "Maintain Ca and P in normal range",
            "Low PTH = risk of vascular calcification",
            "Target: Allow PTH to rise to low-normal for CKD stage"
          ]
        }
      ];
    }

    // Vitamin D management
    if (vitDVal < 30) {
      protocol.vitaminD = [
        {
          title: "Vitamin D Deficiency Correction",
          steps: [
            "Nutritional Vitamin D (cholecalciferol - Vitamin D3):",
            "• If 25-OH Vit D <20 ng/mL: 2000-4000 IU daily × 8-12 weeks",
            "• If 25-OH Vit D 20-30 ng/mL: 1000-2000 IU daily",
            "• Recheck after 3 months, maintain with 400-1000 IU daily",
            "",
            "Active Vitamin D (calcitriol) - Only if PTH elevated:",
            "• For PTH suppression and Ca/P balance",
            "• See PTH management above for dosing"
          ]
        }
      ];
    }

    // Calcium management
    if (caVal < 8.8) {
      protocol.calciumManagement = [
        "Hypocalcemia: Check P, PTH, vitamin D",
        "If low P: Give calcium carbonate 50-100 mg/kg/day divided",
        "If high PTH: Start calcitriol",
        "Target Ca 9-10 mg/dL"
      ];
    } else if (caVal > 10.5) {
      protocol.calciumManagement = [
        "Hypercalcemia: STOP calcium supplements",
        "STOP or reduce calcitriol",
        "Use non-calcium phosphate binders if needed",
        "Check PTH (if low → adynamic bone disease)",
        "Increase dialysate calcium concentration to remove Ca (if on dialysis)"
      ];
    }

    protocol.monitoring = stage >= 4 ? 
      "Ca, P, PTH, ALP, 25-OH Vit D every 1-3 months. DEXA scan if high fracture risk. Lateral spine X-ray for vascular calcification in dialysis patients." :
      "Ca, P, PTH, 25-OH Vit D every 3-6 months. More frequent if abnormal.";

    setManagement(protocol);
  };

  return (
    <div className="space-y-6">
      <Alert className="bg-blue-50 border-blue-200 border-2">
        <TrendingUp className="w-5 h-5 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>CKD-Mineral and Bone Disorder (CKD-MBD):</strong> Complex of biochemical abnormalities (high P, low Ca, high PTH, low vitamin D) leading to bone disease and vascular calcification. Prevention is key. Starts in CKD stage 2-3, worsens with progression.
        </AlertDescription>
      </Alert>

      {!management ? (
        <Card>
          <CardHeader className="bg-blue-50 border-b">
            <CardTitle>CKD-MBD Assessment</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <Label>CKD Stage *</Label>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {[2, 3, 4, 5].map(stage => (
                  <Button
                    key={stage}
                    variant={ckdStage === stage.toString() ? "default" : "outline"}
                    onClick={() => setCkdStage(stage.toString())}
                    className={ckdStage === stage.toString() ? "bg-blue-600" : ""}
                  >
                    Stage {stage}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>PTH (pg/mL)</Label>
                <Input
                  type="number"
                  value={pth}
                  onChange={(e) => setPth(e.target.value)}
                  placeholder="e.g., 180"
                />
                <p className="text-xs text-slate-500">Intact PTH</p>
              </div>
              <div>
                <Label>Calcium (mg/dL)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={calcium}
                  onChange={(e) => setCalcium(e.target.value)}
                  placeholder="e.g., 9.2"
                />
                <p className="text-xs text-slate-500">Normal 8.8-10.2</p>
              </div>
              <div>
                <Label>Phosphate (mg/dL)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={phosphate}
                  onChange={(e) => setPhosphate(e.target.value)}
                  placeholder="e.g., 6.5"
                />
                <p className="text-xs text-slate-500">Target &lt;5.5</p>
              </div>
              <div>
                <Label>25-OH Vitamin D (ng/mL)</Label>
                <Input
                  type="number"
                  value={vitD}
                  onChange={(e) => setVitD(e.target.value)}
                  placeholder="e.g., 18"
                />
                <p className="text-xs text-slate-500">Target &gt;30</p>
              </div>
            </div>

            <Button
              onClick={generateManagement}
              disabled={!ckdStage}
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
              <CardTitle className="text-2xl">CKD Stage {ckdStage} - MBD Management</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded border-2">
                  <p className="text-xs text-slate-600">PTH Target</p>
                  <p className="text-lg font-bold text-blue-700">{management.targets.pth}</p>
                </div>
                <div className="bg-white p-3 rounded border-2">
                  <p className="text-xs text-slate-600">Calcium Target</p>
                  <p className="text-lg font-bold text-blue-700">{management.targets.calcium}</p>
                </div>
                <div className="bg-white p-3 rounded border-2">
                  <p className="text-xs text-slate-600">Phosphate Target</p>
                  <p className="text-lg font-bold text-blue-700">{management.targets.phosphate}</p>
                </div>
                <div className="bg-white p-3 rounded border-2">
                  <p className="text-xs text-slate-600">Ca × P Product</p>
                  <p className="text-lg font-bold text-blue-700">&lt;55 mg²/dL²</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {management.phosphateManagement.length > 0 && management.phosphateManagement.map((section, idx) => (
            <Card key={idx} className="border-2 border-purple-300">
              <CardHeader className="bg-purple-100 border-b">
                <CardTitle className="text-lg text-purple-900">{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                {section.steps.map((step, i) => (
                  <div key={i}>
                    {step && <p className="text-sm text-purple-900">{step}</p>}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}

          {management.pthManagement.length > 0 && management.pthManagement.map((section, idx) => (
            <Card key={idx} className="border-2 border-green-300 shadow-xl">
              <CardHeader className="bg-green-100 border-b-2">
                <CardTitle className="text-lg text-green-900">{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                {section.steps.map((step, i) => (
                  <div key={i}>
                    {step && <p className="text-sm text-green-900">{step}</p>}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}

          {management.vitaminD.length > 0 && management.vitaminD.map((section, idx) => (
            <Card key={idx} className="border-2 border-amber-300">
              <CardHeader className="bg-amber-100 border-b">
                <CardTitle className="text-lg text-amber-900">{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                {section.steps.map((step, i) => (
                  <div key={i}>
                    {step && <p className="text-sm text-amber-900">{step}</p>}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}

          {management.calciumManagement.length > 0 && (
            <Card className="border-2 border-red-300">
              <CardHeader className="bg-red-100 border-b">
                <CardTitle className="text-base text-red-900">Calcium Management</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-1">
                {management.calciumManagement.map((item, idx) => (
                  <p key={idx} className="text-sm text-red-900">• {item}</p>
                ))}
              </CardContent>
            </Card>
          )}

          <Card className="bg-cyan-50 border-cyan-200">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Monitoring Protocol
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-cyan-900">{management.monitoring}</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-50">
            <CardHeader>
              <CardTitle className="text-lg">Additional Considerations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Growth hormone:</strong> Consider if poor growth despite adequate CKD-MBD control. Dose 0.05 mg/kg/day SC at bedtime.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Alkaline phosphatase:</strong> If very elevated (&gt;500 U/L) with high PTH → suggests renal osteodystrophy. Intensify PTH suppression.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Bone pain, fractures:</strong> Urgent evaluation. X-rays, consider bone biopsy. May need parathyroidectomy.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Vascular calcification:</strong> High Ca×P product is major risk. Aggressive P control. Avoid excessive calcium supplementation.</span>
                </li>
              </ul>
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