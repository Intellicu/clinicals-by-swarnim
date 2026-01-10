import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Beaker, Activity, AlertTriangle } from "lucide-react";

export default function RTAPathway() {
  const [serum_ph, setSerumPH] = useState("");
  const [serum_hco3, setSerumHCO3] = useState("");
  const [serum_k, setSerumK] = useState("");
  const [serum_cl, setSerumCl] = useState("");
  const [serum_na, setSerumNa] = useState("");
  const [urine_ph, setUrinePH] = useState("");
  const [uak, setUAK] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [diagnosis, setDiagnosis] = useState(null);

  const classifyRTA = () => {
    const ph = parseFloat(serum_ph);
    const hco3 = parseFloat(serum_hco3);
    const k = parseFloat(serum_k);
    const cl = parseFloat(serum_cl);
    const na = parseFloat(serum_na);
    const u_ph = parseFloat(urine_ph);
    const uak_val = parseFloat(uak);
    const ageNum = parseFloat(age);
    const weightNum = parseFloat(weight);

    // Calculate anion gap
    const anionGap = na - (cl + hco3);

    let rtaType = "";
    let features = [];
    let treatment = "";
    let monitoring = "";

    if (anionGap < 12 && hco3 < 22) {
      // Normal anion gap metabolic acidosis - likely RTA

      if (u_ph > 5.5 && k < 3.5) {
        rtaType = "Type 1 RTA (Distal)";
        features = [
          "Hyperchloremic metabolic acidosis",
          "Urine pH persistently >5.5 (unable to acidify)",
          "Hypokalemia",
          "Hypercalciuria → nephrocalcinosis/stones",
          "Normal anion gap",
          "May have growth failure, rickets in children"
        ];
        treatment = `
ACUTE TREATMENT:
────────────────────────────────────────────────────────────
Alkali therapy (Essential):
• Sodium bicarbonate OR Potassium citrate
• Target dose: 1-3 mEq/kg/day in 3-4 divided doses
• Titrate to normalize serum HCO₃ (>22 mEq/L)

Example for ${weightNum || "20"}kg child:
• Sodium bicarbonate 8.4%: ${((weightNum || 20) * 2 / 1000).toFixed(1)} mL TID
  OR
• Potassium citrate solution: ${((weightNum || 20) * 1).toFixed(0)} mEq TID

Potassium supplementation (if hypokalemic):
• Potassium chloride: 1-2 mEq/kg/day
• Potassium citrate preferred (also provides alkali)

LONG-TERM MANAGEMENT:
────────────────────────────────────────────────────────────
1. Lifelong alkali therapy (usually)
2. Increase dose during growth spurts/illness
3. Monitor for:
   - Nephrocalcinosis (annual ultrasound)
   - Hearing loss (if genetic forms)
   - Growth and development
4. Vitamin D if needed (monitor calcium)`;

        monitoring = `
• Monthly: Electrolytes, HCO₃, pH until stable
• Quarterly: Growth parameters, urine calcium
• Annually: Renal ultrasound, hearing test (genetic forms)
• Adjust alkali dose per growth/symptoms`;

      } else if (k > 5.5 && u_ph < 5.5) {
        rtaType = "Type 4 RTA (Hyperkalemic)";
        features = [
          "Hyperchloremic metabolic acidosis",
          "Hyperkalemia (K+ >5.5)",
          "Urine pH appropriately low (<5.5)",
          "Often with aldosterone deficiency/resistance",
          "Common in obstructive uropathy, CKD"
        ];
        treatment = `
ACUTE TREATMENT:
────────────────────────────────────────────────────────────
Hyperkalemia management (if K+ >6.0):
• See Hyperkalemia pathway for emergency protocol
• Calcium gluconate, insulin+dextrose, salbutamol

Alkali therapy:
• Sodium bicarbonate: 1-2 mEq/kg/day
• Avoid potassium-containing alkali (use Na-bicarb, not K-citrate)

Reduce potassium load:
• Low-potassium diet
• Avoid salt substitutes (contain K+)
• Loop diuretic: Furosemide 1-2 mg/kg/day (enhance K+ excretion)

Mineralocorticoid (if aldosterone deficiency):
• Fludrocortisone: 0.05-0.2 mg/day
• Monitor BP (risk of hypertension)

LONG-TERM:
────────────────────────────────────────────────────────────
1. Treat underlying cause (obstructive uropathy, adrenal insufficiency)
2. Continue alkali + K-restriction
3. May improve with growth in children`;

        monitoring = `
• Weekly initially: K+, HCO₃, BP
• Monthly: Electrolytes, renal function
• Monitor for hypertension (if on fludrocortisone)`;

      } else if (hco3 < 17 && k < 3.0) {
        rtaType = "Type 2 RTA (Proximal)";
        features = [
          "Hyperchloremic metabolic acidosis",
          "Urine pH <5.5 when acidotic (CAN acidify, but threshold elevated)",
          "Bicarbonaturia when serum HCO₃ normalized",
          "Hypokalemia (severe)",
          "Often with Fanconi syndrome (glucosuria, phosphaturia, aminoaciduria)",
          "Rickets/growth failure common"
        ];
        treatment = `
ACUTE TREATMENT:
────────────────────────────────────────────────────────────
HIGH-DOSE alkali therapy (often required):
• Sodium bicarbonate or Potassium citrate
• Initial: 5-15 mEq/kg/day (MUCH higher than type 1)
• May need up to 20 mEq/kg/day
• Divide into 4-6 doses

Potassium supplementation (Essential):
• Potassium citrate/chloride: 2-4 mEq/kg/day
• Monitor K+ closely (profound hypokalemia common)

Phosphate supplementation (if Fanconi syndrome):
• Neutral phosphate: 30-60 mg/kg/day elemental P
• Divide into 4-5 doses with meals

Vitamin D (if rickets):
• Calcitriol 0.25-1 mcg/day

LONG-TERM:
────────────────────────────────────────────────────────────
1. Many children outgrow proximal RTA by age 10-12y
2. Continue therapy until resolution documented
3. Treat rickets/growth failure`;

        monitoring = `
• Monthly: Lytes, HCO₃, K+, Ca, PO₄, ALP
• Quarterly: Growth, skeletal X-rays if rickets
• Monitor for complications (nephrocalcinosis less common than type 1)`;

      } else {
        rtaType = "Further evaluation needed";
        features = ["Incomplete data for classification"];
        treatment = "Complete all biochemical tests";
        monitoring = "";
      }
    }

    const protocol = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         RENAL TUBULAR ACIDOSIS (RTA) DIAGNOSTIC PROTOCOL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PATIENT: Age ${age || "____"}y, Weight ${weight || "____"}kg

LABORATORY FINDINGS:
────────────────────────────────────────────────────────────
• Serum pH: ${serum_ph || "____"} ${ph && ph < 7.35 ? "⚠️ ACIDOTIC" : ""}
• Serum HCO₃⁻: ${serum_hco3 || "____"} mEq/L ${hco3 && hco3 < 22 ? "⚠️ LOW" : ""}
• Serum K+: ${serum_k || "____"} mEq/L ${k && k < 3.5 ? "⚠️ LOW" : k && k > 5.5 ? "⚠️ HIGH" : ""}
• Serum Na+: ${serum_na || "____"} mEq/L
• Serum Cl⁻: ${serum_cl || "____"} mEq/L
• Anion Gap: ${anionGap ? anionGap.toFixed(1) : "____"} ${anionGap && anionGap < 12 ? "(Normal AG - consistent with RTA)" : ""}
• Urine pH: ${urine_ph || "____"} ${u_ph ? (u_ph > 5.5 ? "(Unable to acidify)" : "(Appropriately acidified)") : ""}
${uak ? `• Urine anion gap: ${uak}` : ""}

DIAGNOSIS: ${rtaType}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

KEY FEATURES:
${features.map(f => `• ${f}`).join('\n')}

DIAGNOSTIC CRITERIA SUMMARY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TYPE 1 (Distal RTA):
✓ Hyperchloremic metabolic acidosis (normal AG)
✓ Urine pH >5.5 despite acidemia (CANNOT acidify)
✓ Hypokalemia
✓ Positive urine anion gap
✓ Hypercalciuria → Nephrocalcinosis/stones
✓ Normal GFR

TYPE 2 (Proximal RTA):
✓ Hyperchloremic metabolic acidosis
✓ Urine pH <5.5 when acidotic (CAN acidify)
✓ Bicarbonaturia when HCO₃ corrected
✓ Severe hypokalemia
✓ Often with Fanconi syndrome (glucosuria, phosphaturia, aminoaciduria)
✓ Rickets/growth failure

TYPE 4 (Hyperkalemic RTA):
✓ Hyperchloremic metabolic acidosis (mild)
✓ Hyperkalemia (K+ >5.5)
✓ Urine pH <5.5 (appropriate)
✓ Aldosterone deficiency/resistance
✓ Often with CKD/obstructive uropathy

${treatment}

MONITORING PLAN:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${monitoring}

ADDITIONAL WORKUP:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

If Type 1 RTA confirmed:
□ Renal ultrasound (look for nephrocalcinosis)
□ Hearing test (genetic forms may have sensorineural hearing loss)
□ Genetic testing (SLC4A1, ATP6V1B1, ATP6V0A4 genes)
□ 24-hour urine calcium

If Type 2 RTA confirmed:
□ Urine glucose (Fanconi syndrome)
□ Urine amino acids
□ Urine phosphate
□ Skeletal X-rays (rickets)
□ Ophthalmology exam (if Lowe syndrome suspected)

If Type 4 RTA:
□ Plasma renin and aldosterone levels
□ Cortisol (rule out adrenal insufficiency)
□ Renal ultrasound (obstructive uropathy)

CAUSES OF RTA IN CHILDREN:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Type 1 (Distal):
• Primary (genetic): ATP6V1B1, ATP6V0A4, SLC4A1 mutations
• Autoimmune (SLE, Sjögren syndrome)
• Medications (amphotericin B, ifosfamide, lithium)
• Hypercalciuria syndromes
• Obstructive uropathy

Type 2 (Proximal):
• Primary (genetic): SLC4A4 mutations
• Fanconi syndrome:
  - Cystinosis (most common)
  - Lowe syndrome
  - Tyrosinemia
  - Wilson disease
  - Heavy metal toxicity
• Medications (acetazolamide, topiramate, ifosfamide)

Type 4:
• Aldosterone deficiency (adrenal insufficiency, CAH)
• Aldosterone resistance (pseudohypoaldosteronism)
• Obstructive uropathy
• CKD
• Medications (NSAIDs, ACE inhibitors, tacrolimus)

REFERENCES & GUIDELINES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Santos F, et al. Understanding the causes of renal tubular acidosis in 
   children. Pediatr Nephrol. 2022;37(8):1661-1677.
   DOI: 10.1007/s00467-021-05350-y

2. Sharma AP, Sharma RK. Renal tubular acidosis in children. 
   Indian Pediatr. 2017;54(12):1033-1038.

3. Reddy P. Clinical approach to renal tubular acidosis in adult patients. 
   Int J Clin Pract. 2011;65(3):350-360.

4. Rodríguez Soriano J. Renal tubular acidosis: the clinical entity. 
   J Am Soc Nephrol. 2002;13(8):2160-2170.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    END OF DIAGNOSTIC PROTOCOL
        ⚠️ CLINICAL DECISION SUPPORT TOOL ONLY ⚠️
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `.trim();

    setDiagnosis({
      rtaType,
      features,
      protocol,
      anionGap
    });
  };

  return (
    <div className="space-y-6">
      <Alert className="bg-blue-50 border-blue-200">
        <Beaker className="w-5 h-5 text-blue-600" />
        <AlertDescription className="text-blue-900">
          <strong>Renal Tubular Acidosis (RTA) Classification</strong>
          <br />
          Systematic approach to diagnosing and classifying RTA types based on biochemical parameters.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="input" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="input">Laboratory Data</TabsTrigger>
          <TabsTrigger value="protocol">Diagnosis & Management</TabsTrigger>
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
                  <Input type="number" step="0.1" value={age} onChange={(e) => setAge(e.target.value)} />
                </div>
                <div>
                  <Label>Weight (kg)</Label>
                  <Input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Serum Chemistry</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>Serum pH *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={serum_ph}
                    onChange={(e) => setSerumPH(e.target.value)}
                    placeholder="e.g., 7.25"
                  />
                </div>
                <div>
                  <Label>Serum HCO₃⁻ (mEq/L) *</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={serum_hco3}
                    onChange={(e) => setSerumHCO3(e.target.value)}
                    placeholder="e.g., 15"
                  />
                </div>
                <div>
                  <Label>Serum K+ (mEq/L) *</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={serum_k}
                    onChange={(e) => setSerumK(e.target.value)}
                    placeholder="e.g., 3.0"
                  />
                </div>
                <div>
                  <Label>Serum Na+ (mEq/L) *</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={serum_na}
                    onChange={(e) => setSerumNa(e.target.value)}
                    placeholder="e.g., 140"
                  />
                </div>
                <div>
                  <Label>Serum Cl⁻ (mEq/L) *</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={serum_cl}
                    onChange={(e) => setSerumCl(e.target.value)}
                    placeholder="e.g., 115"
                  />
                </div>
                <div>
                  <Label>Urine pH *</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={urine_ph}
                    onChange={(e) => setUrinePH(e.target.value)}
                    placeholder="e.g., 6.5"
                  />
                </div>
              </div>

              <div>
                <Label>Urine Anion Gap (optional)</Label>
                <Input
                  type="number"
                  value={uak}
                  onChange={(e) => setUAK(e.target.value)}
                  placeholder="(U_Na + U_K) - U_Cl"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Positive UAG suggests RTA, Negative UAG suggests GI HCO₃ loss
                </p>
              </div>

              <Button
                onClick={classifyRTA}
                className="w-full bg-blue-600"
                disabled={!serum_hco3 || !serum_k || !urine_ph || !serum_na || !serum_cl}
              >
                <Activity className="w-4 h-4 mr-2" />
                Classify RTA Type
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="protocol">
          {diagnosis ? (
            <div className="space-y-4">
              <Card className={`border-2 ${
                diagnosis.rtaType.includes("Type 1") ? "border-red-300 bg-red-50" :
                diagnosis.rtaType.includes("Type 2") ? "border-amber-300 bg-amber-50" :
                diagnosis.rtaType.includes("Type 4") ? "border-purple-300 bg-purple-50" :
                "border-slate-300"
              }`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Diagnosis: {diagnosis.rtaType}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">Key Features:</p>
                    <ul className="space-y-1 text-sm">
                      {diagnosis.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-blue-600">•</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {diagnosis.anionGap !== undefined && (
                    <Badge className="mt-4 bg-blue-600 text-white">
                      Anion Gap: {diagnosis.anionGap.toFixed(1)} mEq/L
                    </Badge>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Complete Protocol</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap text-xs font-mono bg-slate-50 p-4 rounded border overflow-x-auto">
                    {diagnosis.protocol}
                  </pre>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Alert>
              <AlertDescription>
                Please complete laboratory data and click "Classify RTA Type" to generate protocol.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}