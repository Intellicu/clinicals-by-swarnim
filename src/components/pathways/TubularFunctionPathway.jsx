import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TestTube, Activity, Calculator } from "lucide-react";

export default function TubularFunctionPathway() {
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [serum_cr, setSerumCr] = useState("");
  const [serum_na, setSerumNa] = useState("");
  const [serum_k, setSerumK] = useState("");
  const [serum_ca, setSerumCa] = useState("");
  const [serum_po4, setSerumPO4] = useState("");
  const [urine_na, setUrineNa] = useState("");
  const [urine_k, setUrineK] = useState("");
  const [urine_cl, setUrineCl] = useState("");
  const [urine_cr, setUrineCr] = useState("");
  const [urine_ca, setUrineCa] = useState("");
  const [urine_po4, setUrinePO4] = useState("");
  const [results, setResults] = useState(null);

  const calculateTubularFunction = () => {
    const s_cr = parseFloat(serum_cr);
    const u_cr = parseFloat(urine_cr);
    const u_na = parseFloat(urine_na);
    const s_na = parseFloat(serum_na);
    const u_k = parseFloat(urine_k);
    const s_k = parseFloat(serum_k);
    const s_po4 = parseFloat(serum_po4);
    const u_po4 = parseFloat(urine_po4);
    const u_ca = parseFloat(urine_ca);
    const s_ca = parseFloat(serum_ca);
    const u_cl = parseFloat(urine_cl);
    const heightNum = parseFloat(height);
    const ageNum = parseFloat(age);

    // Calculate GFR (Bedside Schwartz)
    const gfr = heightNum && s_cr ? (0.413 * heightNum / s_cr) : null;

    // FENa
    const fena = (u_na && s_na && u_cr && s_cr) ?
      ((u_na * s_cr) / (s_na * u_cr) * 100) : null;

    // FEK
    const fek = (u_k && s_k && u_cr && s_cr) ?
      ((u_k * s_cr) / (s_k * u_cr) * 100) : null;

    // TRP (Tubular Reabsorption of Phosphate)
    const trp = (u_po4 && s_po4 && u_cr && s_cr) ?
      (1 - ((u_po4 * s_cr) / (s_po4 * u_cr))) * 100 : null;

    // TmP/GFR (Tubular maximum reabsorption of phosphate per GFR)
    const tmp_gfr = (trp && s_po4) ?
      s_po4 * (trp / 100) : null;

    // FECa (Fractional Excretion of Calcium)
    const feca = (u_ca && s_ca && u_cr && s_cr) ?
      ((u_ca * s_cr) / (s_ca * u_cr) * 100) : null;

    // Urine Anion Gap
    const uag = (u_na && u_k && u_cl) ? (u_na + u_k - u_cl) : null;

    const interpretations = [];

    if (fena !== null) {
      if (fena < 1) {
        interpretations.push({
          test: "FENa",
          value: `${fena.toFixed(2)}%`,
          interpretation: "Prerenal azotemia / volume depletion",
          normal: "<1% (neonates <2.5%)"
        });
      } else if (fena > 2) {
        interpretations.push({
          test: "FENa",
          value: `${fena.toFixed(2)}%`,
          interpretation: "Intrinsic renal injury / ATN",
          normal: "<1% (neonates <2.5%)"
        });
      } else {
        interpretations.push({
          test: "FENa",
          value: `${fena.toFixed(2)}%`,
          interpretation: "Equivocal (consider FEUrea)",
          normal: "<1% (neonates <2.5%)"
        });
      }
    }

    if (trp !== null) {
      interpretations.push({
        test: "TRP",
        value: `${trp.toFixed(1)}%`,
        interpretation: trp < 85 ? "Phosphate wasting (Fanconi, hypophosphatemic rickets)" : "Normal phosphate reabsorption",
        normal: ">85%"
      });
    }

    if (tmp_gfr !== null) {
      const tmp_normal_low = ageNum < 2 ? 3.8 : 4.0;
      const tmp_normal_high = ageNum < 2 ? 5.5 : 6.0;
      interpretations.push({
        test: "TmP/GFR",
        value: `${tmp_gfr.toFixed(2)} mg/dL`,
        interpretation: tmp_gfr < tmp_normal_low ? "Renal phosphate wasting" : "Normal",
        normal: `${tmp_normal_low}-${tmp_normal_high} mg/dL`
      });
    }

    if (feca !== null) {
      interpretations.push({
        test: "FECa",
        value: `${feca.toFixed(2)}%`,
        interpretation: feca > 0.2 ? "Hypercalciuria" : "Normal calcium excretion",
        normal: "<0.2% or spot urine Ca/Cr <0.2"
      });
    }

    if (uag !== null) {
      interpretations.push({
        test: "Urine Anion Gap",
        value: `${uag.toFixed(1)} mEq/L`,
        interpretation: uag > 0 ? "Positive UAG - suggests RTA" : "Negative UAG - suggests GI HCO₃ loss",
        normal: "Negative in normal acid excretion"
      });
    }

    const protocol = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
           TUBULAR FUNCTION ASSESSMENT PANEL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PATIENT: Age ${age || "____"}y, Weight ${weight || "____"}kg, Height ${height || "____"}cm

CALCULATED PARAMETERS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${gfr ? `eGFR (Schwartz): ${gfr.toFixed(1)} mL/min/1.73m²\n` : ""}
${interpretations.map(i => `
${i.test}: ${i.value}
  Reference: ${i.normal}
  Interpretation: ${i.interpretation}
`).join('\n')}

COMPREHENSIVE TUBULAR FUNCTION TESTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. PROXIMAL TUBULE FUNCTION:
────────────────────────────────────────────────────────────
Tests for reabsorptive capacity:

□ TRP (Tubular Reabsorption of Phosphate):
  Formula: [1 - (U_PO₄ × S_Cr)/(S_PO₄ × U_Cr)] × 100
  Normal: >85%
  Low: Fanconi syndrome, vitamin D-resistant rickets

□ TmP/GFR (Phosphate threshold):
  Formula: S_PO₄ × (TRP/100)
  Normal: 4.0-6.0 mg/dL (age-dependent)
  Low: Renal phosphate wasting

□ Urine glucose (with normal serum glucose):
  Positive: Suggests Fanconi syndrome

□ Urine amino acids:
  Generalized aminoaciduria: Fanconi syndrome
  Specific patterns: Cystinuria, Hartnup disease

□ FENa (Fractional Excretion of Sodium):
  Normal: <1% (neonates <2.5%)
  Differentiates prerenal vs intrinsic AKI

2. DISTAL TUBULE FUNCTION:
────────────────────────────────────────────────────────────
Tests for acidification and K+ handling:

□ Urine pH during acidemia:
  - Cannot acidify (pH >5.5): Type 1 RTA
  - Appropriately low: Normal distal function

□ Urine anion gap:
  Positive: Impaired NH₄⁺ excretion (RTA)
  Negative: Normal acid excretion

□ FEK (Fractional Excretion of K+):
  Normal: Variable (5-15%)
  High with hypokalemia: Renal K+ wasting

□ TTKG (Transtubular K+ Gradient):
  Low (<2) with hyperkalemia: Aldosterone deficiency
  High (>8) with hypokalemia: Renal K+ wasting

3. CALCIUM HANDLING:
────────────────────────────────────────────────────────────
□ Spot urine Ca/Cr ratio:
  Normal: <0.2 (age >2y), <0.6 (age <2y)
  Elevated: Hypercalciuria

□ 24-hour urine calcium:
  Normal: <4 mg/kg/day
  Elevated: >4 mg/kg/day (stone risk)

□ FECa (Fractional Excretion of Calcium):
  Normal: <0.2%
  High: Increased calcium excretion

FANCONI SYNDROME SCREENING:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Proximal tubule dysfunction with:
✓ Low serum HCO₃ (Type 2 RTA)
✓ Low serum K+
✓ Low serum PO₄
✓ Glucosuria (with normal blood glucose)
✓ Generalized aminoaciduria
✓ Low TRP (<85%)
✓ May have rickets/growth failure

Common causes in children:
• Cystinosis (most common genetic cause)
• Lowe syndrome
• Dent disease
• Tyrosinemia type 1
• Galactosemia
• Mitochondrial disorders
• Medications (ifosfamide, cisplatin, valproate)

Workup:
□ Slit-lamp exam (cystine crystals)
□ Genetic testing
□ Urine amino acid chromatography
□ Ophthalmology consult

WHEN TO SUSPECT TUBULAR DISORDERS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

□ Unexplained metabolic acidosis (normal anion gap)
□ Persistent hypokalemia despite supplementation
□ Polyuria with normal glucose
□ Rickets with normal vitamin D
□ Nephrocalcinosis/stones in children
□ Growth failure with normal nutrition
□ Family history of renal tubular disorders

REFERENCES & GUIDELINES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Emma F, et al. Nephropathic cystinosis: an international consensus 
   document. Nephrol Dial Transplant. 2014;29 Suppl 4:iv87-94.

2. Magen D, et al. A practical approach to renal tubular disorders. 
   Pediatr Nephrol. 2020;35(9):1573-1584.

3. Devuyst O, Thakker RV. Dent's disease. Orphanet J Rare Dis. 2010;5:28.

4. Kleta R, Bockenhauer D. Bartter syndromes and other salt-losing 
   tubulopathies. Nephron Physiol. 2006;104(2):p73-80.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    END OF ASSESSMENT PROTOCOL
        ⚠️ CLINICAL DECISION SUPPORT TOOL ONLY ⚠️
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `.trim();

    setResults({
      gfr,
      interpretations,
      protocol
    });
  };

  return (
    <div className="space-y-6">
      <Alert className="bg-blue-50 border-blue-200">
        <TestTube className="w-5 h-5 text-blue-600" />
        <AlertDescription className="text-blue-900">
          <strong>Tubular Function Assessment</strong>
          <br />
          Comprehensive evaluation of proximal and distal tubular function with fractional excretions and reabsorption indices.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="input" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="input">Laboratory Input</TabsTrigger>
          <TabsTrigger value="results">Results & Interpretation</TabsTrigger>
        </TabsList>

        <TabsContent value="input" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Patient Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>Age (years)</Label>
                  <Input type="number" step="0.1" value={age} onChange={(e) => setAge(e.target.value)} />
                </div>
                <div>
                  <Label>Weight (kg)</Label>
                  <Input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} />
                </div>
                <div>
                  <Label>Height (cm)</Label>
                  <Input type="number" step="0.1" value={height} onChange={(e) => setHeight(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Serum Values</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>Creatinine (mg/dL) *</Label>
                  <Input type="number" step="0.01" value={serum_cr} onChange={(e) => setSerumCr(e.target.value)} />
                </div>
                <div>
                  <Label>Sodium (mEq/L)</Label>
                  <Input type="number" step="0.1" value={serum_na} onChange={(e) => setSerumNa(e.target.value)} />
                </div>
                <div>
                  <Label>Potassium (mEq/L)</Label>
                  <Input type="number" step="0.1" value={serum_k} onChange={(e) => setSerumK(e.target.value)} />
                </div>
                <div>
                  <Label>Calcium (mg/dL)</Label>
                  <Input type="number" step="0.1" value={serum_ca} onChange={(e) => setSerumCa(e.target.value)} />
                </div>
                <div>
                  <Label>Phosphate (mg/dL)</Label>
                  <Input type="number" step="0.1" value={serum_po4} onChange={(e) => setSerumPO4(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Spot Urine Values</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>Urine Creatinine (mg/dL) *</Label>
                  <Input type="number" step="0.1" value={urine_cr} onChange={(e) => setUrineCr(e.target.value)} />
                </div>
                <div>
                  <Label>Urine Sodium (mEq/L)</Label>
                  <Input type="number" step="0.1" value={urine_na} onChange={(e) => setUrineNa(e.target.value)} />
                </div>
                <div>
                  <Label>Urine Potassium (mEq/L)</Label>
                  <Input type="number" step="0.1" value={urine_k} onChange={(e) => setUrineK(e.target.value)} />
                </div>
                <div>
                  <Label>Urine Chloride (mEq/L)</Label>
                  <Input type="number" step="0.1" value={urine_cl} onChange={(e) => setUrineCl(e.target.value)} />
                </div>
                <div>
                  <Label>Urine Calcium (mg/dL)</Label>
                  <Input type="number" step="0.1" value={urine_ca} onChange={(e) => setUrineCa(e.target.value)} />
                </div>
                <div>
                  <Label>Urine Phosphate (mg/dL)</Label>
                  <Input type="number" step="0.1" value={urine_po4} onChange={(e) => setUrinePO4(e.target.value)} />
                </div>
              </div>

              <Button
                onClick={calculateTubularFunction}
                className="w-full mt-6 bg-blue-600"
                disabled={!serum_cr || !urine_cr}
              >
                <Calculator className="w-4 h-4 mr-2" />
                Calculate Tubular Indices
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          {results ? (
            <div className="space-y-4">
              <Card>
                <CardHeader className="bg-blue-50 border-b">
                  <CardTitle>Calculated Results</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  {results.gfr && (
                    <div className="mb-4 p-3 bg-slate-50 rounded">
                      <p className="text-sm text-slate-600">Estimated GFR (Schwartz)</p>
                      <p className="text-2xl font-bold text-blue-600">{results.gfr.toFixed(1)} mL/min/1.73m²</p>
                    </div>
                  )}

                  <div className="space-y-3">
                    {results.interpretations.map((item, idx) => (
                      <Card key={idx} className="border-2">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <Badge className="bg-blue-600 text-white mb-2">{item.test}</Badge>
                              <p className="text-2xl font-bold text-slate-900">{item.value}</p>
                            </div>
                            <Activity className="w-6 h-6 text-blue-600" />
                          </div>
                          <p className="text-sm text-slate-600 mb-1">
                            <strong>Reference:</strong> {item.normal}
                          </p>
                          <p className="text-sm text-slate-800">
                            <strong>Interpretation:</strong> {item.interpretation}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Complete Assessment Protocol</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap text-xs font-mono bg-slate-50 p-4 rounded border overflow-x-auto">
                    {results.protocol}
                  </pre>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Alert>
              <AlertDescription>
                Please complete laboratory data and calculate indices.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}