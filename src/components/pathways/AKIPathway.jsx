import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Droplet, Activity, Calculator } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AKIPathway() {
  const [baselineCreatinine, setBaselineCreatinine] = useState("");
  const [currentCreatinine, setCurrentCreatinine] = useState("");
  const [urineOutput, setUrineOutput] = useState("");
  const [weight, setWeight] = useState("");
  const [hours, setHours] = useState("");
  const [age, setAge] = useState("");
  const [akiStage, setAkiStage] = useState(null);
  const [showProtocol, setShowProtocol] = useState(false);

  const calculateAKIStage = () => {
    const baseline = parseFloat(baselineCreatinine);
    const current = parseFloat(currentCreatinine);
    const uop = parseFloat(urineOutput);
    const wt = parseFloat(weight);
    const hrs = parseFloat(hours);
    const ageNum = parseFloat(age);

    if (!baseline || !current) return;

    const crRatio = current / baseline;
    const uopPerKgHr = (uop && wt && hrs) ? uop / (wt * hrs) : null;

    let stage = 0;
    let criteriaUsed = "";

    // KDIGO Criteria
    if (crRatio >= 3.0 || current >= 4.0 || (uopPerKgHr && uopPerKgHr < 0.3)) {
      stage = 3;
      criteriaUsed = "Stage 3: Cr ≥3x baseline OR Cr ≥4 mg/dL OR UOP <0.3 mL/kg/hr ≥24h";
    } else if (crRatio >= 2.0 || (uopPerKgHr && uopPerKgHr < 0.5)) {
      stage = 2;
      criteriaUsed = "Stage 2: Cr ≥2x baseline OR UOP <0.5 mL/kg/hr ≥12h";
    } else if (crRatio >= 1.5 || (current - baseline) >= 0.3 || (uopPerKgHr && uopPerKgHr < 0.5)) {
      stage = 1;
      criteriaUsed = "Stage 1: Cr ≥1.5x baseline OR increase ≥0.3 mg/dL OR UOP <0.5 mL/kg/hr 6-12h";
    }

    const protocol = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        ACUTE KIDNEY INJURY (AKI) MANAGEMENT PROTOCOL
                  KDIGO Guidelines 2024
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PATIENT: Age ${age || "____"}y, Weight ${weight || "____"}kg
Baseline Cr: ${baseline} mg/dL → Current Cr: ${current} mg/dL
Cr Ratio: ${crRatio.toFixed(2)}
${uopPerKgHr ? `UOP: ${uopPerKgHr.toFixed(2)} mL/kg/hr` : ""}

KDIGO AKI STAGE: ${stage}
${criteriaUsed}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IMMEDIATE MANAGEMENT - STAGE ${stage}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. ASSESS VOLUME STATUS & ETIOLOGY:
────────────────────────────────────────────────────────────
□ Physical exam: JVP, skin turgor, edema, lung auscultation
□ Calculate FENa: <1% suggests prerenal, >2% intrinsic
□ Urine sediment: Muddy brown casts (ATN), RBC casts (GN), WBC casts (AIN)
□ Bladder scan (rule out obstruction)

Prerenal causes:
• Volume depletion (dehydration, hemorrhage, burns)
• Decreased effective circulating volume (sepsis, heart failure, nephrotic)
• Renal hypoperfusion (NSAIDs, ACE-I/ARBs)

Intrinsic causes:
• Acute tubular necrosis (ATN) - ischemic or toxic
• Acute interstitial nephritis (AIN) - drugs, infection
• Glomerulonephritis - check urinalysis for hematuria/casts
• HUS - check for diarrhea, hemolysis, thrombocytopenia

Postrenal causes:
• Obstruction (posterior urethral valves, stones, tumor)
• Bladder dysfunction

2. FLUID MANAGEMENT:
────────────────────────────────────────────────────────────
${stage === 1 ? `
If prerenal (FENa <1%, hypovolemic):
• Fluid bolus: 20 mL/kg NS over 30-60 min
• Reassess after bolus (vitals, UOP, exam)
• Maintenance: 1500 mL/m²/day or 100 mL/kg for first 10kg

If intrinsic (euvolemic/hypervolemic):
• RESTRICT fluids: Insensible losses (400 mL/m²/day) + UOP + ongoing losses
• Avoid fluid overload
• Daily weights
` : stage === 2 ? `
If oliguric/anuric:
• STRICT fluid restriction: Insensible (400 mL/m²/day) + UOP only
• Furosemide trial:
  - Initial: 1-2 mg/kg IV bolus
  - If no response in 2h: Double dose to 4 mg/kg
  - Maximum: 6 mg/kg/dose
  - Continuous infusion if needed: 0.1-0.4 mg/kg/hr
• If no response to furosemide → Non-oliguric unlikely
• Daily weights, strict I&O charting

If fluid overloaded:
• Consider early RRT (don't wait for Stage 3)
• Diuretic trial first unless severe pulmonary edema
` : `
⚠️ CRITICAL STAGE - PREPARE FOR RRT:
• RESTRICT all fluids to insensible losses only
• Hold all nephrotoxic medications
• Nephrology emergency consult
• Assess for RRT indications (see below)
• If anuric: Consider early RRT initiation
`}

3. STOP NEPHROTOXIC MEDICATIONS:
────────────────────────────────────────────────────────────
□ NSAIDs (ibuprofen, ketorolac)
□ ACE inhibitors / ARBs (enalapril, losartan)
□ Aminoglycosides (gentamicin, amikacin)
□ Vancomycin (adjust dose per levels)
□ Contrast dye (avoid if possible)
□ Calcineurin inhibitors (tacrolimus, cyclosporine)

4. ADJUST ALL DRUG DOSES:
────────────────────────────────────────────────────────────
• Assume GFR <15 mL/min/1.73m² for Stage 3
• Dose reduce or extend intervals per renal dosing guidelines
• See Drug Database for specific adjustments

5. ELECTROLYTE MANAGEMENT:
────────────────────────────────────────────────────────────
Hyperkalemia (K+ >5.5):
• Dietary K+ restriction (<1-2 mEq/kg/day)
• Sodium polystyrene sulfonate (Kayexalate): 1 g/kg PO/PR
• If K+ >6.0: See Hyperkalemia Emergency pathway
• If K+ >6.5 or ECG changes: IMMEDIATE stabilization + RRT

Metabolic acidosis (HCO₃ <15):
• Sodium bicarbonate: 1-2 mEq/kg IV if severe (pH <7.2)
• Oral sodium bicarbonate if mild-moderate and taking PO
• Target: HCO₃ >18-20 mEq/L
• If refractory: Consider RRT

Hyperphosphatemia:
• Phosphate binders with meals:
  - Calcium carbonate 50-100 mg/kg/day divided TID
  - Sevelamer 400-800 mg TID if hypercalcemic
• Low phosphate diet (<800 mg/day)

Hypocalcemia:
• Calcium carbonate 50-100 mg/kg/day divided TID-QID
• Calcitriol 0.25 mcg/day if symptomatic

6. NUTRITION:
────────────────────────────────────────────────────────────
• Protein: Moderate restriction (1-1.2 g/kg/day) if not on dialysis
• Calories: 100-120% RDA
• Sodium: <2-3 mEq/kg/day
• Potassium: Restrict if hyperkalemic
• Phosphorus: <800-1000 mg/day
• Ensure adequate calories (catabolism worsens uremia)

7. MONITORING:
────────────────────────────────────────────────────────────
Stage 1-2:
• Daily: Weight, vitals, I&O, BUN/Cr, electrolytes
• Monitor for worsening (rising Cr, declining UOP)

Stage 3:
• ICU monitoring
• Q6-12h: Electrolytes, BUN/Cr, Ca/PO₄
• Continuous: BP, UOP, cardiac monitoring if hyperkalemic
• Daily: Weight, CBC, blood gas

ABSOLUTE INDICATIONS FOR RRT (Any one):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ Life-threatening hyperkalemia (K+ >6.5 with ECG changes)
⚠️ Severe metabolic acidosis (pH <7.1, refractory to bicarbonate)
⚠️ Fluid overload with respiratory distress / pulmonary edema
⚠️ Uremic complications (encephalopathy, pericarditis, bleeding)
⚠️ BUN >100 mg/dL with uremic symptoms
⚠️ Severe hypernatremia/hyponatremia unresponsive to therapy
⚠️ Poisoning/intoxication (dialyzable toxin)

PROGNOSIS & RECOVERY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Stage 1-2:
• Usually reversible with supportive care
• Recovery typically within 1-3 weeks
• Follow Cr weekly until baseline

Stage 3:
• May require temporary dialysis
• Recovery variable (days to months)
• 10-30% may develop CKD
• Close nephrology follow-up essential

REFERENCES & GUIDELINES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. KDIGO Clinical Practice Guideline for Acute Kidney Injury. 
   Kidney Int Suppl. 2024 (updated from 2012).
   DOI: 10.1038/kisup.2012.1

2. Goldstein SL, et al. Pediatric AKI: from phenotype to genotype. 
   Pediatr Nephrol. 2022;37(11):2543-2557.

3. Sutherland SM, et al. AKI in hospitalized children: epidemiology and 
   clinical associations in a national cohort. Clin J Am Soc Nephrol. 
   2013;8(10):1661-1669.

4. Andreoli SP. Acute kidney injury in children. 
   Pediatr Nephrol. 2009;24(2):253-263.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    END OF AKI PROTOCOL
        ⚠️ CLINICAL DECISION SUPPORT TOOL ONLY ⚠️
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `.trim();

    setAkiStage({ 
      stage, 
      criteriaUsed, 
      crRatio: crRatio.toFixed(2), 
      uopPerKgHr: uopPerKgHr?.toFixed(2),
      protocol
    });
    setShowProtocol(true);
  };

  const dialysisIndications = [
    "Severe hyperkalemia (>6.5 mmol/L) with ECG changes",
    "Severe metabolic acidosis (pH <7.1)",
    "Fluid overload with respiratory distress",
    "Uremic encephalopathy or pericarditis",
    "BUN >100 mg/dL with symptoms"
  ];

  return (
    <div className="space-y-6">
      <Alert className="bg-blue-50 border-blue-300">
        <Droplet className="w-5 h-5 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>AKI Pathway (KDIGO 2024):</strong> Diagnosis, staging, and management of acute kidney injury using pRIFLE/KDIGO criteria
        </AlertDescription>
      </Alert>

      <Card className="bg-white shadow-lg border-2 border-blue-300">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-6 h-6 text-blue-600" />
            AKI Staging Calculator (KDIGO)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Age (years)</Label>
              <Input
                type="number"
                step="0.1"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g., 8"
              />
            </div>
            <div>
              <Label>Baseline Creatinine (mg/dL)</Label>
              <Input
                type="number"
                step="0.1"
                value={baselineCreatinine}
                onChange={(e) => setBaselineCreatinine(e.target.value)}
                placeholder="0.5"
              />
            </div>
            <div>
              <Label>Current Creatinine (mg/dL)</Label>
              <Input
                type="number"
                step="0.1"
                value={currentCreatinine}
                onChange={(e) => setCurrentCreatinine(e.target.value)}
                placeholder="1.5"
              />
            </div>
            <div>
              <Label>Urine Output (mL)</Label>
              <Input
                type="number"
                value={urineOutput}
                onChange={(e) => setUrineOutput(e.target.value)}
                placeholder="200"
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
            <div>
              <Label>Time Period (hours)</Label>
              <Input
                type="number"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="12"
              />
            </div>
          </div>

          <Button onClick={calculateAKIStage} className="w-full bg-blue-600 hover:bg-blue-700">
            Calculate AKI Stage
          </Button>

          {akiStage && (
            <Card className={`border-2 ${
              akiStage.stage === 3 ? "bg-red-50 border-red-300" :
              akiStage.stage === 2 ? "bg-amber-50 border-amber-300" :
              "bg-yellow-50 border-yellow-300"
            }`}>
              <CardContent className="p-4">
                <div className="text-center mb-4">
                  <div className={`text-5xl font-bold ${
                    akiStage.stage === 3 ? "text-red-600" :
                    akiStage.stage === 2 ? "text-amber-600" :
                    "text-yellow-600"
                  }`}>
                    Stage {akiStage.stage}
                  </div>
                  <p className="text-sm mt-2 text-slate-700">{akiStage.criteriaUsed}</p>
                  <div className="mt-3 flex justify-center gap-4 text-sm">
                    <div>Cr Ratio: <strong>{akiStage.crRatio}</strong></div>
                    {akiStage.uopPerKgHr && <div>UOP: <strong>{akiStage.uopPerKgHr} mL/kg/hr</strong></div>}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white shadow-lg border-2 border-slate-300">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-slate-700" />
            Management Based on Stage
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <Card className="bg-yellow-50 border-yellow-300">
            <CardHeader className="bg-yellow-100 border-b">
              <CardTitle className="text-base">Stage 1 - Conservative</CardTitle>
            </CardHeader>
            <CardContent className="p-4 text-sm space-y-2">
              <p>• Optimize hydration (IV fluids if needed)</p>
              <p>• Stop nephrotoxic drugs (NSAIDs, ACE-I/ARB, aminoglycosides)</p>
              <p>• Monitor labs daily (Cr, BUN, electrolytes)</p>
              <p>• Fluid balance charting</p>
              <Link to={createPageUrl("FluidCalculator")}>
                <Button size="sm" variant="outline" className="mt-2">
                  <Calculator className="w-4 h-4 mr-2" />
                  Fluid Calculator
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-amber-50 border-amber-300">
            <CardHeader className="bg-amber-100 border-b">
              <CardTitle className="text-base">Stage 2 - Intensive Monitoring</CardTitle>
            </CardHeader>
            <CardContent className="p-4 text-sm space-y-2">
              <p>• All Stage 1 measures</p>
              <p>• Nephrology consult</p>
              <p>• Consider ICU monitoring</p>
              <p>• Diuretic trial (furosemide 1-2 mg/kg)</p>
              <p>• Prepare for RRT if worsening</p>
            </CardContent>
          </Card>

          <Card className="bg-red-50 border-red-300">
            <CardHeader className="bg-red-100 border-b">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Stage 3 - Critical / Consider RRT
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 text-sm space-y-2">
              <p className="font-bold">Immediate Actions:</p>
              <p>• ICU admission</p>
              <p>• Nephrology emergency consult</p>
              <p>• Assess for dialysis indications (see below)</p>
              <p>• Restrict fluids to insensible losses + UOP</p>
              <p>• Strict electrolyte monitoring (q6-12h)</p>
              <Link to={createPageUrl("RRTAssistant")}>
                <Button size="sm" className="mt-2 bg-red-600 hover:bg-red-700">
                  <Droplet className="w-4 h-4 mr-2" />
                  RRT Assistant
                </Button>
              </Link>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300">
        <CardHeader className="bg-red-100 border-b">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            Absolute Indications for Dialysis (KDIGO)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {dialysisIndications.map((indication, idx) => (
              <div key={idx} className="flex items-start gap-3 bg-white p-4 rounded-lg border-2 border-red-200">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm font-medium text-slate-800">{indication}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {showProtocol && akiStage?.protocol && (
        <Card className="border-2 border-blue-300">
          <CardHeader className="bg-blue-50 border-b">
            <CardTitle>Complete AKI Management Protocol</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <pre className="whitespace-pre-wrap text-xs font-mono bg-white p-4 rounded border overflow-x-auto">
              {akiStage.protocol}
            </pre>
          </CardContent>
        </Card>
      )}

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="bg-blue-100 border-b">
          <CardTitle className="text-base">Related Tools</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            <Link to={createPageUrl("SchwartzGFR")}>
              <Button size="sm" variant="outline">
                <Activity className="w-4 h-4 mr-2" />
                GFR Calculator
              </Button>
            </Link>
            <Link to={createPageUrl("SodiumCalculator")}>
              <Button size="sm" variant="outline">
                <Droplet className="w-4 h-4 mr-2" />
                Electrolyte Management
              </Button>
            </Link>
            <Link to={createPageUrl("FluidCalculator")}>
              <Button size="sm" variant="outline">
                <Calculator className="w-4 h-4 mr-2" />
                Fluid Calculator
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}