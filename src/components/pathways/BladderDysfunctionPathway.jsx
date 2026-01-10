import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Activity, ClipboardList } from "lucide-react";

export default function BladderDysfunctionPathway() {
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [symptoms, setSymptoms] = useState([]);
  const [voidingFrequency, setVoidingFrequency] = useState("");
  const [maxVoidedVolume, setMaxVoidedVolume] = useState("");
  const [assessment, setAssessment] = useState(null);

  const symptomsList = [
    "Daytime incontinence",
    "Urgency",
    "Frequency (>7 voids/day)",
    "Infrequency (<4 voids/day)",
    "Nocturnal enuresis",
    "Weak/intermittent stream",
    "Straining to void",
    "Incomplete emptying sensation",
    "Post-void dribbling",
    "Recurrent UTIs",
    "Constipation"
  ];

  const toggleSymptom = (symptom) => {
    setSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const generateAssessment = () => {
    const ageNum = parseFloat(age);
    const weightNum = parseFloat(weight);
    const maxVolume = parseFloat(maxVoidedVolume);

    // Calculate Expected Bladder Capacity (EBC)
    let ebc;
    if (ageNum >= 1) {
      ebc = (ageNum + 1) * 30;
    } else {
      ebc = (weightNum + 70) || ((2.5 * ageNum * 12) + 38);
    }

    const ebcLow = ebc * 0.65;
    const ebcHigh = ebc * 1.50;

    let capacityAssessment = "";
    if (maxVolume && maxVolume < ebcLow) {
      capacityAssessment = "Small bladder capacity (<65% EBC)";
    } else if (maxVolume && maxVolume > ebcHigh) {
      capacityAssessment = "Large bladder capacity (>150% EBC)";
    } else if (maxVolume) {
      capacityAssessment = "Normal bladder capacity (65-150% EBC)";
    }

    const hasOveractive = symptoms.some(s => ["Urgency", "Frequency (>7 voids/day)", "Daytime incontinence"].includes(s));
    const hasUnderactive = symptoms.some(s => ["Infrequency (<4 voids/day)", "Weak/intermittent stream", "Straining to void", "Incomplete emptying sensation"].includes(s));
    const hasDyscoordination = symptoms.some(s => ["Weak/intermittent stream", "Post-void dribbling", "Recurrent UTIs"].includes(s));

    let likelyDiagnosis = "";
    if (hasOveractive) {
      likelyDiagnosis = "Overactive Bladder (OAB)";
    } else if (hasUnderactive) {
      likelyDiagnosis = "Underactive Bladder / Dysfunctional Voiding";
    } else if (hasDyscoordination) {
      likelyDiagnosis = "Dysfunctional Voiding / Dyssynergia";
    } else if (symptoms.includes("Nocturnal enuresis") && symptoms.length === 1) {
      likelyDiagnosis = "Monosymptomatic Nocturnal Enuresis";
    } else {
      likelyDiagnosis = "Further evaluation needed";
    }

    const protocol = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          BLADDER DYSFUNCTION EVALUATION PROTOCOL
                Based on ICCS Guidelines 2023
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PATIENT INFORMATION:
────────────────────────────────────────────────────────────
• Age: ${age || "____"} years
• Weight: ${weight || "____"} kg
• Voiding frequency: ${voidingFrequency || "____"} times/day
• Maximum voided volume: ${maxVoidedVolume || "____"} mL

BLADDER CAPACITY ASSESSMENT:
────────────────────────────────────────────────────────────
• Expected Bladder Capacity (EBC): ${ebc.toFixed(0)} mL
  ${ageNum >= 1 ? `Formula: (Age + 1) × 30 = (${age} + 1) × 30` : `Formula: Weight + 70 or (2.5 × age[months]) + 38`}
• Normal range: ${ebcLow.toFixed(0)}-${ebcHigh.toFixed(0)} mL (65-150% EBC)
${capacityAssessment ? `• Assessment: ${capacityAssessment}` : ""}

CLINICAL PRESENTATION:
────────────────────────────────────────────────────────────
Reported symptoms:
${symptoms.map(s => `✓ ${s}`).join('\n')}

LIKELY DIAGNOSIS:
────────────────────────────────────────────────────────────
${likelyDiagnosis}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VOIDING DIARY REQUIREMENTS (ICCS 2023)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STANDARD VOIDING DIARY:
────────────────────────────────────────────────────────────
Duration: 48 hours daytime frequency-volume chart (not necessarily 
consecutive days) OR 1-2 weeks for school-going children (vacation/weekends)

Record:
┌─────────────────────────────────────────────────────────────┐
│ Date: _______________                                       │
│                                                             │
│ Time │ Fluid intake │ Time │ Voided  │ Comments           │
│      │ (mL & type)  │      │ volume  │ (accidents/bowels) │
│──────┼──────────────┼──────┼─────────┼────────────────────│
│      │              │      │         │                    │
└─────────────────────────────────────────────────────────────┘

ADDITIONAL COMPONENTS:
────────────────────────────────────────────────────────────
For Enuresis:
• 7-night recording of nighttime incontinence episodes
• Nighttime urine volume measurements (diaper weights or volumes)

For Bowel Issues:
• 7-day bowel diary with Bristol Stool Chart
• Pattern of bowel movements
• Type of stools (consistency)

INTERPRETATION CRITERIA:
────────────────────────────────────────────────────────────
✓ Normal voiding frequency: 4-7 voids/day

✓ Expected Bladder Capacity:
  - Age >1 year: (age+1) × 30 mL
  - Age <1 year: Wt(kg) + 70 mL OR (2.5 × age[months]) + 38

✓ Normal capacity range: 65-150% of EBC
  - <65% EBC = Small bladder capacity
  - >150% EBC = Large bladder capacity

✓ Polyuria: >6 mL/kg/hour

✓ Nocturnal polyuria: Overnight urine + first morning void >130% EBC

✓ Daily fluid requirement: ~50-75 mL/kg/day (~2L for older children)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DIAGNOSTIC WORKUP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

HISTORY & PHYSICAL:
────────────────────────────────────────────────────────────
□ Detailed voiding history (ICCS symptom questionnaire)
□ Bowel habits (Rome IV criteria for constipation)
□ Fluid intake patterns
□ Developmental/behavioral assessment
□ Neurological examination
□ Abdominal palpation (fecal masses, bladder distension)
□ Spine examination (sacral dimple, hairy patch, scoliosis)
□ Perineal sensation and anal tone

INVESTIGATIONS:
────────────────────────────────────────────────────────────

Basic (All patients):
□ Urinalysis + culture
□ Post-void residual (bladder ultrasound)
□ Renal & bladder ultrasound
□ Voiding diary (48h-7 days)
□ Bristol Stool Chart

Advanced (Selected cases):
□ Uroflowmetry with EMG (non-invasive)
□ Urodynamic studies (invasive - specific indications)
□ VCUG (if VUR suspected or recurrent febrile UTIs)
□ MRI spine (if neurological concerns)

POST-VOID RESIDUAL (PVR) INTERPRETATION:
────────────────────────────────────────────────────────────
• Normal: <20 mL or <10% of voided volume
• Elevated: >20 mL or >20% of voided volume
  → Suggests incomplete emptying
  → May indicate dysfunctional voiding or underactive bladder

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MANAGEMENT BY DIAGNOSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${likelyDiagnosis === "Overactive Bladder (OAB)" ? `
OVERACTIVE BLADDER (OAB):
────────────────────────────────────────────────────────────
Definition: Urgency with/without incontinence, frequency (>7/day)

FIRST-LINE (Urotherapy):
1. Behavioral modifications:
   • Timed voiding (every 2-3 hours)
   • Avoid bladder irritants (caffeine, carbonation, citrus)
   • Regular fluid intake (not excessive)
   • Treat constipation aggressively

2. Pelvic floor exercises:
   • Biofeedback therapy
   • Pelvic floor physical therapy

SECOND-LINE (if urotherapy fails after 3-6 months):
Anticholinergic medications:
• Oxybutynin:
  - Immediate release: 0.2 mg/kg/dose BID-TID (max 5 mg/dose)
  - Extended release: 5-10 mg once daily
• Solifenacin: 2.5-5 mg once daily (age >5y)
• Tolterodine: 1-2 mg BID

Monitor for side effects:
- Dry mouth, constipation, blurred vision
- Cognitive effects (rare)
- Urinary retention (check PVR)

THIRD-LINE (Refractory cases):
• Botulinum toxin A (intravesical)
• Neuromodulation
• Specialist referral
` : ""}

${likelyDiagnosis === "Underactive Bladder / Dysfunctional Voiding" ? `
UNDERACTIVE BLADDER / DYSFUNCTIONAL VOIDING:
────────────────────────────────────────────────────────────
Definition: Infrequent voiding, incomplete emptying, elevated PVR

FIRST-LINE:
1. Timed voiding (q2-3h with alarm reminders)
2. Double voiding technique
3. Optimize positioning:
   • Feet supported
   • Relaxed posture
   • Adequate time on toilet

4. Treat constipation:
   • Polyethylene glycol 3350: 0.5-1 g/kg/day
   • High fiber diet
   • Adequate hydration

5. Pelvic floor relaxation exercises
   • Biofeedback if available

SECOND-LINE:
• Alpha-blockers (if high PVR):
  - Tamsulosin 0.4 mg once daily
  - Doxazosin 1-4 mg once daily

• Clean intermittent catheterization (CIC):
  - If PVR persistently elevated >100 mL
  - 4-6 times per day
` : ""}

${likelyDiagnosis === "Monosymptomatic Nocturnal Enuresis" ? `
MONOSYMPTOMATIC NOCTURNAL ENURESIS (MNE):
────────────────────────────────────────────────────────────
Definition: Bedwetting only (no daytime symptoms), age >5 years

ASSESS FOR:
□ Nocturnal polyuria (diary confirmation)
□ Reduced nocturnal ADH secretion
□ Sleep arousal difficulty
□ Small functional bladder capacity

FIRST-LINE:
1. General measures:
   • Reassurance (15% spontaneous resolution per year)
   • Avoid punishment
   • Fluid restriction 2h before bed
   • Void before sleep
   • Avoid bladder irritants

2. Alarm therapy (if age >7y and motivated):
   • 60-70% success rate
   • Continue 2-3 months
   • May need reinforcement therapy

SECOND-LINE (if alarm fails or not suitable):
Desmopressin (synthetic ADH):
• Melt formulation: 120-240 mcg sublingual at bedtime
• Tablet: 0.2-0.4 mg at bedtime
• Restrict fluids 1h before and 8h after dose
• Monitor for hyponatremia (rare)
• Trial 3 months

THIRD-LINE (Refractory):
• Combination: Alarm + Desmopressin
• Anticholinergic (if small bladder capacity)
• Imipramine: 1 mg/kg/day (25-50 mg) - rarely used (cardiac risks)
` : ""}

TREAT CONSTIPATION (Essential in ALL cases):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
50-80% of children with bladder dysfunction have constipation

Disimpaction (if needed):
• Polyethylene glycol 3350:
  - 1-1.5 g/kg/day for 3-6 days (max 100g/day)
  OR
• Enemas (if severe):
  - Phosphate enema: 6 mL/kg (max 135 mL) daily × 2-3 days

Maintenance:
• Polyethylene glycol 3350: 0.4-0.8 g/kg/day
• Lactulose: 1-2 mL/kg/day divided BID
• High fiber diet
• Adequate hydration
• Regular toilet routine

Target: Soft, formed stools daily (Bristol type 3-4)

FOLLOW-UP PLAN:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Initial management:
• Review voiding diary at 4-6 weeks
• Assess response to urotherapy
• Check PVR if symptoms persist
• Uroflowmetry if available

Long-term:
• Follow-up every 3 months until resolution
• Annual renal ultrasound if history of UTIs or VUR
• Transition planning to adult care if chronic

RED FLAGS - URGENT REFERRAL:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ Neurological symptoms:
□ Abnormal gait or neurological exam
□ Lower limb weakness or sensory changes
□ Saddle anesthesia
□ Spinal dysraphism signs

⚠️ Anatomical concerns:
□ Continuous urinary leakage (ectopic ureter)
□ Abnormal external genitalia
□ Severe hydronephrosis

⚠️ Complicated UTIs:
□ Recurrent febrile UTIs
□ Pyelonephritis despite prophylaxis
□ Renal scarring on imaging

REFERENCES & GUIDELINES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Austin PF, et al. The Standardization of Terminology of Lower Urinary 
   Tract Function in Children and Adolescents: Update Report from the 
   Standardization Committee of the International Children's Continence 
   Society (ICCS). Neurourol Urodyn. 2016;35(4):471-481.

2. Nevéus T, et al. Evaluation and treatment for monosymptomatic enuresis: 
   A standardization document from the International Children's Continence 
   Society. J Urol. 2010;183(2):441-447.

3. Franco I, et al. Overactive bladder in children. Part 1: Pathophysiology. 
   J Urol. 2016;196(6):1723-1727.

4. Kiddoo D. Nocturnal Enuresis: Non-Pharmacological Treatments. 
   BMJ Clin Evid. 2015;2015:0305.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    END OF EVALUATION PROTOCOL
        ⚠️ CLINICAL DECISION SUPPORT TOOL ONLY ⚠️
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `.trim();

    setAssessment({
      ebc,
      ebcLow,
      ebcHigh,
      capacityAssessment,
      likelyDiagnosis,
      protocol
    });
  };

  return (
    <div className="space-y-6">
      <Alert className="bg-blue-50 border-blue-200">
        <FileText className="w-5 h-5 text-blue-600" />
        <AlertDescription className="text-blue-900">
          <strong>Bladder Dysfunction Evaluation</strong>
          <br />
          Based on ICCS (International Children's Continence Society) 2023 Guidelines.
          Systematic approach to lower urinary tract symptoms in children.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="input" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="input">Clinical Assessment</TabsTrigger>
          <TabsTrigger value="protocol">Management Protocol</TabsTrigger>
        </TabsList>

        <TabsContent value="input" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>Age (years)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g., 7"
                  />
                </div>
                <div>
                  <Label>Weight (kg)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="e.g., 25"
                  />
                </div>
                <div>
                  <Label>Voiding frequency/day</Label>
                  <Input
                    type="number"
                    value={voidingFrequency}
                    onChange={(e) => setVoidingFrequency(e.target.value)}
                    placeholder="e.g., 5"
                  />
                </div>
              </div>

              <div>
                <Label>Maximum voided volume (mL)</Label>
                <Input
                  type="number"
                  value={maxVoidedVolume}
                  onChange={(e) => setMaxVoidedVolume(e.target.value)}
                  placeholder="From voiding diary"
                />
                <p className="text-xs text-slate-500 mt-1">
                  From 48-hour voiding diary (largest single void)
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Symptoms (Select all that apply)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {symptomsList.map((symptom) => (
                  <div key={symptom} className="flex items-center space-x-2">
                    <Checkbox
                      id={symptom}
                      checked={symptoms.includes(symptom)}
                      onCheckedChange={() => toggleSymptom(symptom)}
                    />
                    <label
                      htmlFor={symptom}
                      className="text-sm cursor-pointer"
                    >
                      {symptom}
                    </label>
                  </div>
                ))}
              </div>

              <Button
                onClick={generateAssessment}
                className="w-full mt-6 bg-blue-600"
                disabled={!age || symptoms.length === 0}
              >
                <ClipboardList className="w-4 h-4 mr-2" />
                Generate Assessment & Protocol
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="protocol">
          {assessment ? (
            <div className="space-y-4">
              <Card>
                <CardHeader className="bg-blue-50 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    Bladder Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">Expected Bladder Capacity</p>
                      <p className="text-2xl font-bold text-blue-600">{assessment.ebc.toFixed(0)} mL</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Normal Range</p>
                      <p className="text-lg font-semibold text-slate-900">
                        {assessment.ebcLow.toFixed(0)}-{assessment.ebcHigh.toFixed(0)} mL
                      </p>
                    </div>
                  </div>
                  {assessment.capacityAssessment && (
                    <Badge className="mt-4 bg-blue-600 text-white">
                      {assessment.capacityAssessment}
                    </Badge>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-600" />
                    Likely Diagnosis: {assessment.likelyDiagnosis}
                  </CardTitle>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Complete Management Protocol</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap text-xs font-mono bg-slate-50 p-4 rounded border overflow-x-auto">
                    {assessment.protocol}
                  </pre>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Alert>
              <AlertDescription>
                Please complete clinical assessment to generate management protocol.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}