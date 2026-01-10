import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, CheckCircle, FileText, Beaker } from "lucide-react";

export default function RenalStonePathway() {
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [stoneComposition, setStoneComposition] = useState("");
  const [recurrent, setRecurrent] = useState("");
  const [familyHistory, setFamilyHistory] = useState("");
  const [protocol, setProtocol] = useState(null);

  const generateProtocol = () => {
    const isRecurrent = recurrent === "yes";
    const hasFamilyHx = familyHistory === "yes";

    const workup = {
      basic: [
        "Serum: Calcium, Phosphate, Uric acid, Creatinine, Electrolytes",
        "Urine: pH, specific gravity, microscopy",
        "24-hour urine: Volume, Calcium, Oxalate, Citrate, Uric acid, Cystine",
        "Stone analysis (if available)",
        "Renal ultrasound"
      ],
      extended: [
        "PTH level (if hypercalcemia/hypercalciuria)",
        "Vitamin D levels (25-OH and 1,25-OH)",
        "Spot urine: Ca/Cr, Oxalate/Cr ratios",
        "Cystine screening",
        "Urine culture",
        "KUB X-ray or Non-contrast CT"
      ]
    };

    const stoneSpecific = {
      "Calcium Oxalate": {
        causes: [
          "Hypercalciuria (most common)",
          "Hyperoxaluria (primary/enteric)",
          "Hypocitraturia",
          "Low urine volume"
        ],
        management: [
          "Increase fluid intake: >1.5 L/m²/day",
          "Dietary sodium restriction (<2-3 mEq/kg/day)",
          "Normal dietary calcium (do NOT restrict)",
          "Limit oxalate-rich foods (spinach, nuts, chocolate, tea)",
          "Potassium citrate 1-2 mEq/kg/day in divided doses",
          "Thiazide diuretics if persistent hypercalciuria: Hydrochlorothiazide 1-2 mg/kg/day"
        ],
        monitoring: "24-hour urine collection every 3-6 months"
      },
      "Calcium Phosphate": {
        causes: [
          "Hypercalciuria with alkaline urine",
          "RTA type 1 (distal)",
          "Primary hyperparathyroidism"
        ],
        management: [
          "Rule out RTA (urine pH >6.5, low serum HCO3, hyperchloremic acidosis)",
          "Increase fluid intake",
          "Potassium citrate for RTA",
          "Thiazide for hypercalciuria",
          "Treat underlying hyperparathyroidism if present"
        ],
        monitoring: "Blood gas, urine pH, PTH"
      },
      "Uric Acid": {
        causes: [
          "Low urine pH (<5.5)",
          "Hyperuricosuria",
          "Low urine volume",
          "High purine diet"
        ],
        management: [
          "Increase fluid intake",
          "Urine alkalinization: Potassium citrate 1-2 mEq/kg/day (target urine pH 6.5-7.0)",
          "Allopurinol 5-10 mg/kg/day if hyperuricosuria persists",
          "Low purine diet"
        ],
        monitoring: "Urine pH, serum uric acid"
      },
      "Cystine": {
        causes: [
          "Cystinuria (autosomal recessive)",
          "Defect in cystine transport"
        ],
        management: [
          "High fluid intake: 3-4 L/m²/day (challenging)",
          "Urine alkalinization: Target pH >7.5",
          "D-penicillamine 20-30 mg/kg/day OR",
          "Tiopronin (α-mercaptopropionylglycine) 15 mg/kg/day",
          "Low methionine diet",
          "Genetic counseling"
        ],
        monitoring: "Cystine excretion, urine pH q2-3 months"
      },
      "Struvite": {
        causes: [
          "Urinary tract infection with urease-producing bacteria",
          "Proteus, Klebsiella, Pseudomonas"
        ],
        management: [
          "Surgical removal (often staghorn calculi)",
          "Prolonged antibiotics (culture-directed)",
          "Acetohydroxamic acid (urease inhibitor) - rarely used in children",
          "Acidify urine if appropriate"
        ],
        monitoring: "Urine culture monthly until sterile"
      }
    };

    const metabolicEvaluation = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              PEDIATRIC RENAL STONE EVALUATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PATIENT INFORMATION:
────────────────────────────────────────────────────────────
• Age: ${age || "____"} years
• Weight: ${weight || "____"} kg
• Stone Composition: ${stoneComposition || "Pending analysis"}
• Recurrent stones: ${recurrent === "yes" ? "YES ⚠️" : "No"}
• Family history: ${familyHistory === "yes" ? "YES" : "No"}

INITIAL WORKUP:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BLOOD TESTS (Fasting):
────────────────────────────────────────────────────────────
□ Serum Calcium (corrected for albumin)
□ Serum Phosphate
□ Serum Uric Acid
□ Serum Creatinine / eGFR
□ Serum Electrolytes (Na, K, Cl, HCO₃)
□ Venous blood gas (if RTA suspected)
${isRecurrent ? "□ PTH level\n□ Vitamin D (25-OH and 1,25-OH)" : ""}

URINE TESTS:
────────────────────────────────────────────────────────────
Spot Urine:
□ Urinalysis (pH, specific gravity, microscopy)
□ Urine culture
□ Spot urine Ca/Cr ratio (normal <0.2)
□ Spot urine Oxalate/Cr ratio
□ Cystine screening (if strong family history or radiolucent stones)

24-Hour Urine Collection (Essential if recurrent):
────────────────────────────────────────────────────────────
Collection technique:
- Discard first morning void
- Collect all urine for next 24 hours including next morning void
- Keep refrigerated during collection
- Record exact collection time

Measure:
□ Total volume (mL/24h)
□ Calcium (mg/kg/24h) - Normal <4 mg/kg/24h
□ Oxalate (mg/1.73m²/24h) - Normal <40-50
□ Citrate (mg/kg/24h) - Normal >8 mg/kg/24h
□ Uric acid (mg/kg/24h) - Normal <10-15 mg/kg/24h
□ Cystine (quantitative if screening positive)
□ Creatinine (to verify complete collection)
□ Sodium (assess dietary intake)
□ Magnesium

IMAGING:
────────────────────────────────────────────────────────────
□ Renal Ultrasound (first-line)
□ KUB X-ray (calcium-containing stones are radiopaque)
□ Non-contrast CT (gold standard for diagnosis and surgical planning)

STONE ANALYSIS:
────────────────────────────────────────────────────────────
If stone passed or removed:
□ Infrared spectroscopy OR X-ray diffraction
□ Send ALL stones for analysis

${stoneComposition ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STONE-SPECIFIC MANAGEMENT: ${stoneComposition.toUpperCase()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

LIKELY CAUSES:
${stoneSpecific[stoneComposition]?.causes.map(c => `• ${c}`).join('\n') || ""}

TREATMENT PLAN:
────────────────────────────────────────────────────────────
${stoneSpecific[stoneComposition]?.management.map((m, i) => `${i + 1}. ${m}`).join('\n') || ""}

MONITORING:
${stoneSpecific[stoneComposition]?.monitoring || ""}
` : ""}

GENERAL PREVENTIVE MEASURES (ALL STONE TYPES):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. HYDRATION (MOST IMPORTANT):
   • Target urine output: >1 mL/kg/hr or >1.5 L/m²/day
   • Calculate: ${weight ? `Need ~${(parseFloat(weight) * 50).toFixed(0)}-${(parseFloat(weight) * 75).toFixed(0)} mL/day` : "50-75 mL/kg/day"}
   • Distribute throughout day (include nighttime if possible)
   • Monitor urine specific gravity <1.010
   • Lemonade/orange juice recommended (natural citrate source)

2. DIETARY MODIFICATIONS:
   • Normal calcium intake (do NOT restrict)
     - Age 1-3y: 700 mg/day
     - Age 4-8y: 1000 mg/day
     - Age 9-18y: 1300 mg/day
   • Reduce sodium: <2-3 mEq/kg/day (avoid processed foods)
   • Moderate protein intake (1-2 g/kg/day)
   • Increase fruits and vegetables (natural citrate)
   • Avoid excessive vitamin C/D supplements

3. AVOID HIGH-OXALATE FOODS (if oxalate stones):
   • Spinach, rhubarb, beets
   • Nuts (almonds, peanuts)
   • Chocolate, cocoa
   • Tea (black/green)
   • Soy products
   • Wheat bran

INDICATIONS FOR SPECIALIST REFERRAL:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ Urgent Urology:
□ Obstructing stone with infection (pyonephrosis)
□ Bilateral obstruction
□ Single kidney with obstruction
□ Anuria/severe AKI
□ Intractable pain

Pediatric Nephrologist:
□ Recurrent stones
□ Metabolic abnormalities detected
□ Cystinuria
□ Primary hyperoxaluria suspected
□ Underlying kidney disease

FOLLOW-UP PLAN:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

First stone, no metabolic abnormality:
• Increase fluids, dietary counseling
• Repeat ultrasound at 3 months
• Re-evaluate if recurrence

Metabolic abnormality identified:
• Start specific therapy
• 24-hour urine at 3 months to assess response
• Ultrasound every 6 months × 2 years, then annually
• Annual metabolic panel

Recurrent stones:
• Close follow-up with nephrologist
• 24-hour urine every 3-6 months
• Ultrasound every 6 months

SURGICAL TREATMENT OPTIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
(Decided by urologist based on stone burden)

1. Extracorporeal Shock Wave Lithotripsy (ESWL):
   - Preferred for stones <2 cm
   - Non-invasive

2. Ureteroscopy (URS) with laser lithotripsy:
   - For ureteral stones
   - Direct visualization

3. Percutaneous Nephrolithotomy (PCNL):
   - For large/staghorn calculi >2 cm
   - Invasive but effective

4. Open/Laparoscopic surgery:
   - Rarely needed in modern era

REFERENCES & GUIDELINES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Sas DJ, et al. Clinical Practice Recommendations for the Diagnosis and 
   Management of Pediatric Urolithiasis. Kidney360. 2021;2(4):664-680.
   DOI: 10.34067/KID.0007942020

2. Straub M, et al. Diagnosis and metaphylaxis of stone disease. 
   European Association of Urology Guidelines 2022.

3. Dwyer ME, et al. The metabolic evaluation of pediatric nephrolithiasis: 
   a practical approach. Pediatr Nephrol. 2021;36(2):383-393.

4. Hoppe B, Kemper MJ. Diagnostic examination of the child with urolithiasis 
   or nephrocalcinosis. Pediatr Nephrol. 2010;25(3):403-413.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    END OF EVALUATION PROTOCOL
        ⚠️ CLINICAL DECISION SUPPORT TOOL ONLY ⚠️
  Always verify with current evidence-based sources and guidelines
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `.trim();

    setProtocol({
      metabolicEvaluation,
      workup,
      stoneSpecific: stoneComposition ? stoneSpecific[stoneComposition] : null
    });
  };

  return (
    <div className="space-y-6">
      <Alert className="bg-blue-50 border-blue-200">
        <FileText className="w-5 h-5 text-blue-600" />
        <AlertDescription className="text-blue-900">
          <strong>Pediatric Renal Stone Evaluation</strong>
          <br />
          Comprehensive metabolic workup and management based on AUA/EAU guidelines.
          10-15% of pediatric stones recur. Complete evaluation essential for prevention.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="input" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="input">Patient Data</TabsTrigger>
          <TabsTrigger value="protocol">Protocol</TabsTrigger>
        </TabsList>

        <TabsContent value="input" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Age (years)</Label>
                  <Input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g., 8"
                  />
                </div>
                <div>
                  <Label>Weight (kg)</Label>
                  <Input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="e.g., 25"
                  />
                </div>
              </div>

              <div>
                <Label>Stone Composition (if known)</Label>
                <Select value={stoneComposition} onValueChange={setStoneComposition}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select stone type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Calcium Oxalate">Calcium Oxalate (most common)</SelectItem>
                    <SelectItem value="Calcium Phosphate">Calcium Phosphate</SelectItem>
                    <SelectItem value="Uric Acid">Uric Acid</SelectItem>
                    <SelectItem value="Cystine">Cystine</SelectItem>
                    <SelectItem value="Struvite">Struvite (infection stone)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Recurrent stones?</Label>
                  <Select value={recurrent} onValueChange={setRecurrent}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">No - First stone</SelectItem>
                      <SelectItem value="yes">Yes - Recurrent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Family history of stones?</Label>
                  <Select value={familyHistory} onValueChange={setFamilyHistory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="yes">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={generateProtocol} className="w-full bg-blue-600">
                <Beaker className="w-4 h-4 mr-2" />
                Generate Evaluation Protocol
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="protocol">
          {protocol ? (
            <Card>
              <CardHeader>
                <CardTitle>Complete Evaluation Protocol</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap text-xs font-mono bg-slate-50 p-4 rounded border overflow-x-auto">
                  {protocol.metabolicEvaluation}
                </pre>
              </CardContent>
            </Card>
          ) : (
            <Alert>
              <AlertTriangle className="w-5 h-5" />
              <AlertDescription>
                Please complete patient information and generate protocol.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}