import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Heart, AlertTriangle, Activity, Zap, Info, ArrowDown, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function HypertensiveEmergencyPathway() {
  const [age, setAge] = useState("");
  const [systolicBP, setSystolicBP] = useState("");
  const [diastolicBP, setDiastolicBP] = useState("");
  const [weight, setWeight] = useState("");
  const [symptoms, setSymptoms] = useState({
    seizures: false,
    alteredSensorium: false,
    visualChanges: false,
    chestPain: false,
    dyspnea: false,
    severeHeadache: false,
    vomiting: false
  });
  const [assessment, setAssessment] = useState(null);

  const assessSeverity = () => {
    const sbp = parseFloat(systolicBP);
    const dbp = parseFloat(diastolicBP);
    const ageYears = parseFloat(age);

    const hasCriticalSymptoms = symptoms.seizures || symptoms.alteredSensorium || 
                                symptoms.chestPain || symptoms.dyspnea;
    const hasModerateSymptoms = symptoms.visualChanges || symptoms.severeHeadache || symptoms.vomiting;

    let severity = "Elevated BP";
    let drugProtocol = null;

    if (hasCriticalSymptoms || sbp >= 180) {
      severity = "Hypertensive Emergency";
      drugProtocol = {
        firstLine: [
          {
            drug: "Labetalol IV",
            initialDose: "0.2-0.3 mg/kg IV bolus over 2 minutes (max 20mg)",
            titration: "Repeat 0.5-1 mg/kg q10-15min (max 40mg/dose, total 300mg) until BP controlled",
            infusion: "Start 0.25-1 mg/kg/hr continuous infusion, titrate q15-30min, max 3 mg/kg/hr",
            target: "Reduce BP by 25% over first 8 hours (NOT 1 hour). Then gradual reduction to normal over 24-48 hours.",
            monitoring: "BP q5min until stable, then q15min. HR, ECG. Avoid in asthma/heart block.",
            notes: "Safest in children, α+β blocker. Contraindicated in asthma, 2nd/3rd degree heart block."
          },
          {
            drug: "Nicardipine IV",
            initialDose: "0.5-1 mcg/kg/min continuous infusion",
            titration: "Increase by 0.5-1 mcg/kg/min q5-15min until BP controlled, max 3-5 mcg/kg/min",
            target: "Gradual BP reduction by 25% over 8 hours, avoid precipitous drops",
            monitoring: "BP q5-10min during titration. Watch for tachycardia, flushing, headache.",
            notes: "Calcium channel blocker. Excellent for renal disease. Avoid in LV dysfunction."
          },
          {
            drug: "Esmolol IV (if tachycardia)",
            initialDose: "100-500 mcg/kg IV bolus over 1 min",
            titration: "Start infusion 50-100 mcg/kg/min, increase by 50 mcg/kg/min q10min, max 300 mcg/kg/min",
            target: "Control BP + HR gradually over 8 hours",
            monitoring: "BP, HR q5min. Avoid in bradycardia, asthma.",
            notes: "Ultra-short acting β-blocker. Excellent if reflex tachycardia from vasodilators."
          }
        ],
        secondLine: [
          {
            drug: "Sodium Nitroprusside IV",
            initialDose: "0.3-0.5 mcg/kg/min continuous infusion",
            titration: "Increase by 0.5 mcg/kg/min q3-5min, max 8-10 mcg/kg/min (use less than 3-4 mcg/kg/min if possible)",
            target: "Rapid BP reduction (use only if truly refractory)",
            monitoring: "BP q2-5min. Cyanide toxicity if prolonged use more than 24-48h (metabolic acidosis, altered mental status). Thiocyanate levels if use more than 48hr.",
            notes: "Most potent but toxicity risk. Use only if refractory to labetalol/nicardipine. Cover from light."
          },
          {
            drug: "Hydralazine IV/IM",
            initialDose: "0.1-0.2 mg/kg IV/IM q4-6h (max 20mg/dose)",
            titration: "Increase to 0.5-0.6 mg/kg/dose if inadequate response after 4-6 hours",
            target: "Gradual reduction over 8-24 hours",
            monitoring: "BP q15-30min. Tachycardia common (combine with β-blocker). Headache, flushing.",
            notes: "Direct vasodilator. Onset 10-30 min IV, 20-40 min IM. Useful if no IV access."
          }
        ],
        oralTransition: [
          {
            drug: "Amlodipine PO",
            dose: "0.1-0.3 mg/kg/day divided BID, max 10mg/day",
            notes: "CCB. Start when patient stable on IV, overlap 24h."
          },
          {
            drug: "Enalapril PO",
            dose: "0.08-0.6 mg/kg/day divided BID, max 40mg/day",
            notes: "ACE-I. Monitor Cr, K+ at 1-2 weeks. Avoid in AKI unless stable."
          },
          {
            drug: "Labetalol PO",
            dose: "1-3 mg/kg/dose BID-TID, max 10-12 mg/kg/day or 1200mg/day",
            notes: "Transition from IV labetalol. Good for chronic control."
          }
        ]
      };
    } else if (hasModerateSymptoms || sbp >= 160 || dbp >= 110) {
      severity = "Hypertensive Urgency";
      drugProtocol = {
        immediate: [
          "Oral medication acceptable (no immediate IV needed unless unable to take PO)",
          "Target: Reduce BP by 25% over 24-48 hours (NOT rapidly)"
        ],
        oralOptions: [
          {
            drug: "Amlodipine PO",
            dose: "0.1-0.3 mg/kg/dose (max 10mg), can repeat after 6-8 hours if needed",
            onset: "30-60 minutes",
            notes: "First-line for urgency. Safe, effective."
          },
          {
            drug: "Labetalol PO",
            dose: "2-3 mg/kg/dose (max 200mg), can repeat q6-12h",
            onset: "1-2 hours",
            notes: "Good if tachycardia present. Avoid in asthma."
          },
          {
            drug: "Clonidine PO",
            dose: "2-5 mcg/kg/dose (max 0.1-0.2mg), can repeat q1-2h up to 0.8mg/day",
            onset: "30-60 minutes",
            notes: "Central α-agonist. Watch for sedation, dry mouth. Rebound HTN if stopped abruptly."
          }
        ]
      };
    }

    setAssessment({
      severity,
      systolicBP: sbp,
      diastolicBP: dbp,
      hasCriticalSymptoms,
      drugProtocol
    });
  };

  return (
    <div className="space-y-6">
      <Alert className="bg-red-50 border-red-300 border-2">
        <AlertTriangle className="w-5 h-5 text-red-600" />
        <AlertDescription className="text-red-900">
          <strong>Hypertensive Emergency = Severe HTN + End-Organ Damage</strong> (encephalopathy, seizures, visual loss, heart failure, AKI). Requires immediate IV therapy and ICU monitoring.
        </AlertDescription>
      </Alert>

      {!assessment ? (
        <Card>
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle>Hypertensive Crisis Assessment</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Age (years) *</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g., 10"
                />
              </div>
              <div>
                <Label>Systolic BP (mmHg) *</Label>
                <Input
                  type="number"
                  value={systolicBP}
                  onChange={(e) => setSystolicBP(e.target.value)}
                  placeholder="e.g., 185"
                />
              </div>
              <div>
                <Label>Diastolic BP (mmHg) *</Label>
                <Input
                  type="number"
                  value={diastolicBP}
                  onChange={(e) => setDiastolicBP(e.target.value)}
                  placeholder="e.g., 120"
                />
              </div>
              <div>
                <Label>Weight (kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="For dose calculation"
                />
              </div>
            </div>

            <Card className="bg-red-50 border-red-200">
              <CardHeader>
                <CardTitle className="text-base">Critical Symptoms (End-Organ Damage)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid md:grid-cols-2 gap-2">
                  {[
                    { key: "seizures", label: "Seizures / Encephalopathy" },
                    { key: "alteredSensorium", label: "Altered mental status / Confusion" },
                    { key: "visualChanges", label: "Visual changes / Blurred vision" },
                    { key: "chestPain", label: "Chest pain" },
                    { key: "dyspnea", label: "Dyspnea / Pulmonary edema" },
                    { key: "severeHeadache", label: "Severe headache" },
                    { key: "vomiting", label: "Persistent vomiting" }
                  ].map(symptom => (
                    <div key={symptom.key} className="flex items-center gap-2">
                      <Checkbox
                        id={symptom.key}
                        checked={symptoms[symptom.key]}
                        onCheckedChange={(checked) => setSymptoms({...symptoms, [symptom.key]: checked})}
                      />
                      <Label htmlFor={symptom.key} className="cursor-pointer text-sm">
                        {symptom.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={assessSeverity}
              disabled={!age || !systolicBP || !diastolicBP}
              className="w-full bg-red-600 hover:bg-red-700 py-6 text-lg"
            >
              <Activity className="w-5 h-5 mr-2" />
              Assess Severity & Generate Protocol
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className={`border-2 ${
            assessment.severity === "Hypertensive Emergency" ? "border-red-400 bg-red-50" : "border-amber-400 bg-amber-50"
          }`}>
            <CardHeader className={assessment.severity === "Hypertensive Emergency" ? "bg-red-100" : "bg-amber-100"}>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Heart className="w-7 h-7" />
                {assessment.severity}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white p-4 rounded-lg border-2">
                  <p className="text-sm text-slate-600">Systolic BP</p>
                  <p className="text-3xl font-bold text-red-600">{assessment.systolicBP} mmHg</p>
                </div>
                <div className="bg-white p-4 rounded-lg border-2">
                  <p className="text-sm text-slate-600">Diastolic BP</p>
                  <p className="text-3xl font-bold text-red-600">{assessment.diastolicBP} mmHg</p>
                </div>
              </div>
              {assessment.hasCriticalSymptoms && (
                <Alert className="bg-red-100 border-red-300">
                  <AlertTriangle className="w-5 h-5 text-red-700" />
                  <AlertDescription className="text-red-900 font-bold">
                    END-ORGAN DAMAGE PRESENT - ICU ADMISSION + IMMEDIATE IV THERAPY REQUIRED
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {assessment.drugProtocol.firstLine && (
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Zap className="w-6 h-6 text-red-600" />
                IV Medications - First-Line Options
              </h3>
              
              {assessment.drugProtocol.firstLine.map((drug, idx) => (
                <Card key={idx} className="border-2 border-purple-300 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl text-purple-900">{drug.drug}</CardTitle>
                      <Badge className="bg-purple-600 text-white">First-Line #{idx + 1}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                          <ArrowDown className="w-4 h-4" />
                          Initial Dose
                        </h4>
                        <p className="text-sm text-blue-800 font-mono">{drug.initialDose}</p>
                        {weight && (
                          <p className="text-xs text-blue-600 mt-2">
                            For {weight}kg: Calculate and verify dose
                          </p>
                        )}
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h4 className="font-bold text-green-900 mb-2">Target BP Reduction</h4>
                        <p className="text-sm text-green-800">{drug.target}</p>
                      </div>
                    </div>

                    <div className="bg-amber-50 p-4 rounded-lg border-2 border-amber-300">
                      <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Titration Protocol
                      </h4>
                      <p className="text-sm text-amber-900 font-medium mb-2">{drug.titration}</p>
                      {drug.infusion && (
                        <p className="text-sm text-amber-800 mt-2">
                          <strong>Continuous infusion:</strong> {drug.infusion}
                        </p>
                      )}
                    </div>

                    <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                      <h4 className="font-bold text-cyan-900 mb-2">Monitoring Requirements</h4>
                      <p className="text-sm text-cyan-800">{drug.monitoring}</p>
                    </div>

                    <Alert className="bg-slate-50 border-slate-300">
                      <Info className="w-4 h-4 text-slate-600" />
                      <AlertDescription className="text-slate-800 text-sm">
                        <strong>Clinical Notes:</strong> {drug.notes}
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              ))}

              <h3 className="text-xl font-bold text-slate-900 mt-8 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-600" />
                Second-Line IV Options (If Refractory)
              </h3>

              {assessment.drugProtocol.secondLine.map((drug, idx) => (
                <Card key={idx} className="border-2 border-amber-300">
                  <CardHeader className="bg-amber-50 border-b">
                    <CardTitle className="text-lg text-amber-900">{drug.drug}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    <div className="bg-white p-3 rounded border">
                      <p className="text-sm"><strong>Initial:</strong> {drug.initialDose}</p>
                    </div>
                    <div className="bg-amber-50 p-3 rounded border border-amber-200">
                      <p className="text-sm"><strong>Titration:</strong> {drug.titration}</p>
                    </div>
                    <div className="bg-red-50 p-3 rounded border border-red-200">
                      <p className="text-sm"><strong>Monitoring:</strong> {drug.monitoring}</p>
                    </div>
                    <p className="text-sm text-slate-700">{drug.notes}</p>
                  </CardContent>
                </Card>
              ))}

              <Card className="border-2 border-green-300 shadow-lg mt-6">
                <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-100 border-b">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Heart className="w-6 h-6 text-green-600" />
                    Transition to Oral Therapy
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-sm text-slate-700 mb-4"><strong>When:</strong> BP stable on IV therapy × 12-24 hours, patient tolerating PO, no ongoing end-organ damage</p>
                  <div className="grid md:grid-cols-3 gap-4">
                    {assessment.drugProtocol.oralTransition.map((drug, idx) => (
                      <Card key={idx} className="bg-white border-2 border-green-200">
                        <CardContent className="p-4">
                          <h4 className="font-bold text-green-900 mb-2">{drug.drug}</h4>
                          <p className="text-sm text-slate-800 mb-2"><strong>Dose:</strong> {drug.dose}</p>
                          <p className="text-xs text-slate-600">{drug.notes}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {assessment.drugProtocol.oralOptions && (
            <Card className="border-2 border-blue-300">
              <CardHeader className="bg-blue-50 border-b">
                <CardTitle className="text-xl">Oral Management for Hypertensive Urgency</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-sm text-slate-700 mb-4 font-medium">{assessment.drugProtocol.immediate[0]}</p>
                <p className="text-sm text-blue-700 mb-4 font-bold">{assessment.drugProtocol.immediate[1]}</p>
                
                <div className="space-y-4">
                  {assessment.drugProtocol.oralOptions.map((drug, idx) => (
                    <Card key={idx} className="bg-blue-50 border-blue-200">
                      <CardContent className="p-4">
                        <h4 className="font-bold text-blue-900 mb-2">{drug.drug}</h4>
                        <p className="text-sm mb-1"><strong>Dose:</strong> {drug.dose}</p>
                        <p className="text-sm mb-1"><strong>Onset:</strong> {drug.onset}</p>
                        <p className="text-xs text-slate-600">{drug.notes}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-slate-50">
            <CardHeader className="border-b">
              <CardTitle>General Management Principles</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>BP reduction target (CORRECT guideline):</strong> Reduce BP by 25% over FIRST 8 HOURS, then gradual reduction to normal over 24-48 hours. Avoid rapid reduction in first hour (risk cerebral hypoperfusion and stroke).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>ICU monitoring:</strong> Continuous BP (arterial line preferred), cardiac monitor, neuro checks q15-30min, fundoscopy, ECG, echo if chest pain.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Workup for secondary HTN:</strong> Renal US + Doppler, plasma renin/aldosterone, urine metanephrines, consider renal angiography if renovascular suspected.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Avoid:</strong> Sublingual nifedipine (uncontrolled BP drop), oral clonidine as first-line in emergency (slow onset).</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button onClick={() => setAssessment(null)} variant="outline" className="flex-1">
              Re-assess
            </Button>
            <Link to={createPageUrl("BPPercentiles")} className="flex-1">
              <Button variant="outline" className="w-full border-green-300">
                <Heart className="w-4 h-4 mr-2" />
                BP Percentiles
              </Button>
            </Link>
          </div>

          <Card className="bg-slate-50 border-slate-200 mt-6">
            <CardHeader>
              <CardTitle className="text-base">References & Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-1">
              <p>1. Flynn JT, et al. Clinical Practice Guideline for Screening and Management of High Blood Pressure in Children and Adolescents. Pediatrics. 2017;140(3):e20171904.</p>
              <p>2. Lurbe E, et al. 2016 European Society of Hypertension guidelines for the management of high blood pressure in children and adolescents. J Hypertens. 2016;34(10):1887-1920.</p>
              <p>3. Dionne JM, et al. Hypertensive emergencies in children. Pediatr Nephrol. 2021;36(6):1385-1402.</p>
            </CardContent>
          </Card>

          <Alert className="bg-amber-50 border-amber-200">
            <Info className="w-5 h-5 text-amber-600" />
            <AlertDescription className="text-amber-900 text-sm">
              <strong>Clinical Decision Support:</strong> This protocol follows AAP 2017, ESH 2016, and KDIGO guidelines for pediatric hypertensive emergencies. Always exercise independent clinical judgment and adapt to individual patient circumstances.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}