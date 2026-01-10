import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  ArrowLeft,
  Droplet,
  Activity,
  Clock,
  Calculator,
  AlertTriangle,
  CheckCircle,
  Info,
  Copy,
  FileText,
  TrendingUp,
  Zap,
  Settings,
  Layers,
  Plus
} from "lucide-react";
import { usePatient } from "../components/PatientContext";
import { toast } from "sonner";

export default function RRTAssistant() {
  const { patientData } = usePatient();
  const [activeTab, setActiveTab] = useState("hd");

  // HD State
  const [hdWeight, setHdWeight] = useState(patientData.weight || "");
  const [hdAge, setHdAge] = useState(patientData.age || "");
  const [hdTargetUF, setHdTargetUF] = useState("");
  const [hdSessionDuration, setHdSessionDuration] = useState("4");
  const [hdPreBUN, setHdPreBUN] = useState("");
  const [hdPostBUN, setHdPostBUN] = useState("");
  const [hdVd, setHdVd] = useState("");
  const [hdSerumK, setHdSerumK] = useState("");
  const [hdHemodynamics, setHdHemodynamics] = useState("Stable");
  const [hdResults, setHdResults] = useState(null);

  // PD State
  const [pdType, setPdType] = useState("chronic");
  const [pdTemplate, setPdTemplate] = useState("");
  const [pdModality, setPdModality] = useState("CAPD");
  const [pdWeight, setPdWeight] = useState(patientData.weight || "");
  const [pdAge, setPdAge] = useState(patientData.age || "");
  const [pdIndication, setPdIndication] = useState("");
  const [pdUrgency, setPdUrgency] = useState("");
  const [pdAbdominalContraindication, setAbdominalContraindication] = useState(false);
  const [pdPeritonitisRisk, setPeritonitisRisk] = useState(false);
  const [pdHemodynamicStatus, setHemodynamicStatus] = useState("Stable");
  const [pdTargetUF, setPdTargetUF] = useState("");
  const [pdSerumK, setPdSerumK] = useState("");
  const [pdSerumGlucose, setPdSerumGlucose] = useState("");
  const [pdDwells, setPdDwells] = useState("4");
  const [pdDwellTime, setPdDwellTime] = useState("4");
  const [pdResults, setPdResults] = useState(null);

  // CRRT State
  const [crrtWeight, setCrrtWeight] = useState(patientData.weight || "");
  const [crrtAge, setCrrtAge] = useState(patientData.age || "");
  const [crrtFluidOverload, setCrrtFluidOverload] = useState("");
  const [crrtTargetDose, setCrrtTargetDose] = useState("25");
  const [crrtModality, setCrrtModality] = useState("CVVHDF");
  const [crrtSerumK, setCrrtSerumK] = useState("");
  const [crrtHemodynamics, setCrrtHemodynamics] = useState("Stable");
  const [crrtResults, setCrrtResults] = useState(null);

  // SLED State
  const [sledWeight, setSledWeight] = useState(patientData.weight || "");
  const [sledAge, setSledAge] = useState(patientData.age || "");
  const [sledTargetUF, setSledTargetUF] = useState("");
  const [sledDuration, setSledDuration] = useState("10");
  const [sledSerumK, setSledSerumK] = useState("");
  const [sledResults, setSledResults] = useState(null);

  // Builder State
  const [builderMode, setBuilderMode] = useState("crrt");
  const [builderParams, setBuilderParams] = useState({
    modality: "CVVHDF",
    bloodFlow: "",
    effluentDose: "25",
    anticoag: "Citrate",
    citrateRate: "",
    calciumRate: "",
    hdBloodFlow: "",
    hdDialysateFlow: "",
    hdSessionTime: "4",
    hdUFRate: "",
    pdFillVol: "",
    pdDwellMin: "",
    pdCycles: ""
  });

  React.useEffect(() => {
    setHdWeight(patientData.weight || hdWeight);
    setHdAge(patientData.age || hdAge);
    setPdWeight(patientData.weight || pdWeight);
    setPdAge(patientData.age || pdAge);
    setCrrtWeight(patientData.weight || crrtWeight);
    setCrrtAge(patientData.age || crrtAge);
    setSledWeight(patientData.weight || sledWeight);
    setSledAge(patientData.age || sledAge);
  }, [patientData]);

  const pdTemplates = {
    "neonate": {
      name: "Neonate/Preterm (<1 month)",
      fillPerKg: 15,
      dwellMin: 30,
      drainMin: 5,
      solution: "1.5% glucose (lactate)",
      description: "Conservative fill for neonates with close glucose monitoring"
    },
    "infant": {
      name: "Infant (1-12 months)",
      fillPerKg: 25,
      dwellMin: 45,
      drainMin: 5,
      solution: "1.5-2.5% glucose (lactate)",
      description: "Rapid cycles for hyperkalemia/AKI"
    },
    "child": {
      name: "Child (1-12 years)",
      fillPerKg: 35,
      dwellMin: 60,
      drainMin: 7,
      solution: "2.5% glucose (lactate)",
      description: "Standard pediatric acute PD for fluid overload"
    },
    "adolescent": {
      name: "Adolescent (>12 years)",
      fillPerKg: 35,
      dwellMin: 60,
      drainMin: 7,
      solution: "2.5% glucose (lactate)",
      description: "Similar to adult dosing with close monitoring"
    }
  };

  const calculateHD = () => {
    const weight = parseFloat(hdWeight);
    const age = parseFloat(hdAge);
    const ufTarget = parseFloat(hdTargetUF);
    const duration = parseFloat(hdSessionDuration);
    const preBUN = parseFloat(hdPreBUN);
    const postBUN = parseFloat(hdPostBUN);
    const vd = parseFloat(hdVd) || weight * 0.6;
    const serumK = parseFloat(hdSerumK);

    if (!weight || !ufTarget || !duration || !age) {
      toast.error("Please enter weight, age, UF target, and session duration");
      return;
    }

    const height = age < 2 ? (age * 25 + 75) : (age * 6 + 85);
    const bsa = Math.sqrt((height * weight) / 3600);

    const ufRate = (ufTarget * 1000) / duration;
    const bfr_min = Math.min(3 * weight, 100);
    const bfr_max = Math.min(5 * weight, 250);
    const bfr_recommended = Math.min(4 * weight, 200);
    const dfr_recommended = weight < 20 ? 300 : 500;

    let ktv = null;
    let urr = null;
    let adequacy = null;

    if (preBUN && postBUN) {
      urr = ((preBUN - postBUN) / preBUN) * 100;
      const R = postBUN / preBUN;
      ktv = -Math.log(R - 0.008 * duration) + (4 - 3.5 * R) * (ufTarget / weight);

      if (ktv >= 1.4) {
        adequacy = "Excellent";
      } else if (ktv >= 1.2) {
        adequacy = "Adequate";
      } else {
        adequacy = "Inadequate";
      }
    }

    const weeklyHours = duration * 3;
    const safetyAlerts = [];

    if (ufRate > 15 * weight) {
      safetyAlerts.push({
        severity: "critical",
        title: "Excessive UF Rate",
        message: `UF rate ${ufRate.toFixed(1)} mL/h exceeds 15 mL/kg/h limit. Risk of hypotension and cramping.`
      });
    }

    if (serumK && serumK >= 6.5) {
      safetyAlerts.push({
        severity: "critical",
        title: "Life-Threatening Hyperkalemia",
        message: "K+ ≥6.5 requires IMMEDIATE pre-HD stabilization. ECG monitoring mandatory."
      });
    }

    if (ktv && ktv < 1.2) {
      safetyAlerts.push({
        severity: "critical",
        title: "Inadequate Dialysis",
        message: `Kt/V ${ktv.toFixed(2)} below 1.2. Increase time or add 4th session/week.`
      });
    }

    const prescription = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      PEDIATRIC INTERMITTENT HEMODIALYSIS PRESCRIPTION
                    ACUTE SETTING — FULL PROTOCOL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PATIENT INFORMATION:
────────────────────────────────────────────────────────────
• Age: ${age} years
• Weight: ${weight} kg
• BSA: ${bsa.toFixed(3)} m²
• Indication: ${serumK >= 6.5 ? "AKI with refractory hyperkalemia" : "Acute kidney injury"}
• Hemodynamic Status: ${hdHemodynamics}
${serumK ? `• Serum K+: ${serumK} mmol/L ${serumK >= 6.5 ? "⚠️ CRITICAL" : serumK >= 5.5 ? "⚠️ ELEVATED" : ""}` : ""}
• Access: Temporary double-lumen catheter

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PHASE 1: INITIAL PRESCRIPTION (First Session)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. DIALYZER:
   • Type: ${weight < 20 ? "Small pediatric, 0.4-0.6 m²" : "Medium pediatric, 0.6-0.9 m²"}
   • Surface Area: ${(bsa * 0.85).toFixed(2)} m² (85% BSA)
   • Type: High-flux biocompatible

2. BLOOD FLOW RATE (BFR):
   • Starting: ${bfr_min.toFixed(0)} mL/min (3 mL/kg/min)
   • After 15 min if tolerated: ${bfr_recommended.toFixed(0)} mL/min (4 mL/kg/min)
   • Maximum: ${bfr_max.toFixed(0)} mL/min (5 mL/kg/min)
   
   Rationale: Start slow, increase gradually to minimize hemodynamic stress

3. DIALYSATE FLOW RATE (DFR):
   • Standard: ${dfr_recommended} mL/min
   • Minimum: 2 × BFR (ensure adequate diffusion gradient)

4. DIALYSATE COMPOSITION:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   • Sodium: 140 mEq/L (adjust 138-142 per pre-HD Na)
   • Potassium: ${serumK >= 6.5 ? "0-1 mEq/L (ZERO K bath for emergency)" : serumK >= 5.5 ? "1 mEq/L" : "2 mEq/L (standard)"}
   • Calcium: 2.5-3.0 mEq/L
   • Bicarbonate: 35 mEq/L (32 if risk of alkalosis)
   • Glucose: 100 mg/dL
   • Temperature: 36.5°C (35.5°C if hypotension risk)

5. SESSION DURATION:
   • Initial: ${duration} hours
   • Adjust based on: K+ clearance, fluid status, hemodynamics

6. ULTRAFILTRATION GOAL:
   • Target UF: ${ufTarget} L (${(ufTarget * 1000).toFixed(0)} mL)
   • UF Rate: ${ufRate.toFixed(1)} mL/h (${(ufRate / weight).toFixed(1)} mL/kg/h)
   • UF Profile: ${ufRate / weight > 13 ? "Stepped profile (slow start → faster mid → slow end)" : "Linear profile"}
   ${ufRate / weight > 15 ? "\n   ⚠️ HIGH RATE - Monitor closely for hypotension" : ""}

7. ANTICOAGULATION:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Option A (Standard): Heparin
   • Loading: ${(weight * 20).toFixed(0)} units (20 units/kg) IV bolus
   • Maintenance: ${(weight * 10).toFixed(0)} units/h (10 units/kg/h)
   • Stop 30-45 min before session end
   • Target aPTT: 60-80 seconds
   
   Option B (High bleeding risk): Regional Citrate
   • Citrate infusion: ${(bfr_recommended * 0.5).toFixed(0)} mEq/h
   • Calcium replacement: Per protocol (monitor iCa q1h)
   
   Option C (Very high risk): No anticoagulation
   • Flush lines q30min with saline
   • Shorten session if clotting occurs

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${serumK >= 6.5 ? `
⚠️ HYPERKALEMIA EMERGENCY PROTOCOL (K+ ≥6.5)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BEFORE STARTING HD:
1. Calcium gluconate 10%: ${(weight * 0.5).toFixed(1)} mL IV over 3-5 min (max 20 mL)
   → Cardiac membrane stabilization
   → Repeat if ECG changes persist after 5 min

2. Regular insulin ${(weight * 0.1).toFixed(1)} units + D25W ${(weight * 2).toFixed(1)} mL IV over 30 min
   → Shift K+ intracellularly
   → Monitor glucose q30min × 4h

3. Sodium bicarbonate ${(weight * 1).toFixed(1)}-${(weight * 2).toFixed(1)} mEq IV if pH <7.2
   → Enhances K+ shift into cells

4. Salbutamol nebulization 2.5-5 mg
   → β-agonist K+ shift

DURING HD:
• Use 0-1 K dialysate for first 1-2 hours
• Increase BFR to maximum tolerated (maximize K+ clearance)
• Continuous ECG monitoring
• Check K+ at 1 hour, 2 hours, and post-HD
• Target: K+ <5.5 mmol/L by session end

POST-HD:
• Recheck K+ at 2-4 hours (watch for rebound)
• Continue cardiac monitoring until K+ <5.0

` : ""}

PHASE 2: ESCALATION (24-72 Hours)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IF INADEQUATE CLEARANCE (K+, BUN remain elevated):
→ Increase session duration to 4-5 hours
→ Add SECOND daily session (12 hours apart)
→ Increase BFR to ${bfr_max.toFixed(0)} mL/min if access permits
→ Consider daily HD until stabilized

IF FLUID OVERLOAD PERSISTS (>10-15% above dry weight):
→ Increase UF goal to ${(ufTarget * 1.5).toFixed(1)} L per session
→ Consider isolated UF (PUF) for 60-90 min pre-HD
→ Two sessions/day if severe pulmonary edema
→ Monitor SpO₂ continuously

IF UREMIC SYMPTOMS (encephalopathy, pericarditis):
→ Daily HD for 2-3 days
→ Consider transition to CRRT if HD poorly tolerated
→ Reduce urea by <40% first session (prevent disequilibrium)

PHASE 3: TITRATION & MAINTENANCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

When stable but ongoing AKI:
→ HD every 48-72 hours
→ Duration: 3-4 hours
→ BFR at max tolerated
→ UF customized to intake and urine output

Transition to maintenance schedule when:
□ BUN stable <60-70 mg/dL
□ Electrolytes normalized
□ Urine output returning (>0.5 mL/kg/h)
□ Hemodynamically stable

${ktv ? `
ADEQUACY RESULTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
URR: ${urr.toFixed(1)}% (Target: ≥65%, Goal: ≥70%)
Kt/V: ${ktv.toFixed(2)} (Target: ≥1.2, Goal: ≥1.4)
Assessment: ${adequacy}
Weekly hours: ${weeklyHours}h (Recommend: 12-15h/week)
` : ""}

MONITORING PROTOCOL:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CONTINUOUS/EVERY 15 MIN (First hour):
• Blood pressure, heart rate
• Access pressures (arterial, venous)
• Patient symptoms (headache, nausea, cramping)
• Circuit inspection (air bubbles, clotting)

EVERY 30 MIN (After first hour):
• Vital signs
• UF achieved vs target
• Neurological checks (mental status)

HOURLY:
• Temperature
• Respiratory status (SpO₂, work of breathing)
• Access site examination

PRE-DIALYSIS LABS (Mandatory):
• BUN, Creatinine
• Electrolytes: Na, K, Cl, HCO₃, Ca, PO₄, Mg
• Glucose
• Hemoglobin, platelets
• aPTT if using heparin
• Blood gas if acidotic

POST-DIALYSIS LABS (Mandatory):
• BUN (for Kt/V calculation)
• K+, Na+ (immediate recheck)
• Weight (compare to pre-weight)

WEEKLY MONITORING:
• URR & Kt/V assessment
• Iron studies (ferritin, TSAT)
• PTH, vitamin D
• Albumin, pre-albumin (nutrition markers)
• Hepatitis B/C screening

COMPLICATIONS & MANAGEMENT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. HYPOTENSION (Most common):
   → STOP ultrafiltration immediately
   → Lower BFR by 30-50%
   → Trendelenburg position
   → NS bolus 10 mL/kg over 10-15 min
   → Reassess dry weight (may be overestimated)
   → Rule out: bleeding, sepsis, cardiac dysfunction
   → Consider cooler dialysate (35°C)

2. MUSCLE CRAMPING:
   → NS bolus 2-3 mL/kg
   → Temporarily reduce/stop UF
   → Warm dialysate
   → Gentle massage
   → If severe: consider stopping session

3. DISEQUILIBRIUM SYNDROME:
   Signs: Headache, nausea, altered mental status, seizures
   → STOP dialysis immediately
   → Give mannitol 0.5 g/kg IV over 15 min
   → Hypertonic saline if severe (3% NaCl 2-3 mL/kg)
   → Next sessions: Shorter duration (1.5-2h), lower BFR
   → Consider daily CRRT instead

4. ARRHYTHMIAS:
   → Continuous ECG monitoring
   → Check K+, Ca++, Mg++ immediately
   → Adjust dialysate composition
   → Consider stopping if unstable rhythm

5. ACCESS DYSFUNCTION:
   → Low arterial flow: Reposition catheter, flush with saline
   → High venous pressure: Check for kinks, clots
   → Poor recirculation: May need catheter revision
   → Clotted catheter: tPA lock (1 mg/lumen, dwell 30-60 min)

6. HEMOLYSIS (Blood leak alarm):
   → STOP HD IMMEDIATELY
   → Clamp all lines
   → Do NOT return blood to patient
   → Replace dialyzer
   → Check plasma-free Hb, LDH, haptoglobin
   → Monitor for hemoglobinuria

7. AIR EMBOLISM:
   → STOP HD immediately
   → Clamp venous line
   → Left lateral decubitus + Trendelenburg
   → 100% oxygen
   → STAT ICU call
   → May need hyperbaric oxygen

SUPPORTIVE CARE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Renal diet: Low K (<1-2 mEq/kg/day), Low P (<800-1000 mg/day)
• Fluid restrict: Urine output + 400 mL/m²/day
• Medications:
  → Renal dose all drugs (GFR <15 mL/min)
  → Phosphate binders: Calcium carbonate or Sevelamer with meals
  → Water-soluble vitamins: B-complex, C, folate (post-HD)
  → EPO: If Hb <10 g/dL, dose per protocol
  → IV iron: If ferritin <200 or TSAT <20%

NUTRITION DURING HD:
• Protein: 1.2-1.5 g/kg/day (high catabolic state)
• Calories: 100-120% of RDA
• Supplement: Vitamin B, C, folate (dialyzable)
• Avoid: High K foods (bananas, oranges, tomatoes, potatoes)

CATHETER CARE:
• Daily exit site inspection
• Sterile dressing changes per protocol
• Chlorhexidine cleansing
• Secure catheter (prevent accidental dislodgement)
• No swimming/submersion

DISCONTINUATION CRITERIA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Consider stopping HD when:
□ Urine output >1 mL/kg/h for 12-24 hours
□ BUN/Cr trending down for 24-48h
□ Electrolytes stable (K <5.0, HCO₃ >18)
□ No fluid overload
□ Hemodynamically stable
□ Able to tolerate oral intake

Weaning approach:
1. Extend interval: Daily → Every 48h → Every 72h
2. Shorten duration if adequacy maintained
3. Monitor labs closely during wean period
4. If worsening: Resume daily schedule

WEEKLY SCHEDULE (if chronic HD needed):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Monday, Wednesday, Friday OR Tuesday, Thursday, Saturday
Total weekly time: ${weeklyHours} hours (Minimum: 12-15h/week)

REFERENCES & GUIDELINES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. KDIGO 2024 Clinical Practice Guideline for Hemodialysis Adequacy
2. IPNA Dialysis Working Group - Pediatric HD Standards 2023
3. NKF-KDOQI 2015 Hemodialysis Adequacy Guidelines
4. American Society of Nephrology Pediatric HD Protocols

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PRESCRIBER INFORMATION:
────────────────────────────────────────────────────────────
Prescribing Physician:  _________________________________
                        (Signature & Date)

Nephrology Fellow:      _________________________________
                        (Signature & Date)

Supervising Attending:  _________________________________
                        (Signature & Date)

Pharmacist Verified:    _________________________________
                        (Signature & Date)

Nursing Acknowledged:   _________________________________
                        (Signature & Date)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    END OF PRESCRIPTION
        ⚠️ CLINICAL DECISION SUPPORT TOOL ONLY ⚠️
  Always verify calculations and adjust to clinical context
      Report any errors to nephrology team immediately
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `.trim();

    setHdResults({
      safetyLevel: safetyAlerts.some(a => a.severity === "critical") ? "critical" :
        safetyAlerts.length > 0 ? "caution" : "safe",
      primaryResults: [
        { label: "BFR Start", value: `${bfr_min.toFixed(0)} mL/min`, subtext: "3 mL/kg/min" },
        { label: "BFR Target", value: `${bfr_recommended.toFixed(0)} mL/min`, subtext: "4 mL/kg/min" },
        { label: "Dialysate Flow", value: `${dfr_recommended} mL/min`, subtext: "Standard pediatric" },
        { label: "UF Rate", value: `${ufRate.toFixed(1)} mL/h`, subtext: `${(ufRate / weight).toFixed(1)} mL/kg/h` },
        ...(ktv ? [{ label: "Kt/V", value: ktv.toFixed(2), subtext: adequacy }] : []),
        ...(urr ? [{ label: "URR", value: `${urr.toFixed(1)}%`, subtext: urr >= 65 ? "Adequate" : "Below target" }] : [])
      ],
      safetyAlerts: safetyAlerts.length > 0 ? safetyAlerts : undefined,
      prescriptionText: prescription,
      monitoringPlan: [
        "CONTINUOUS: BP, HR, access pressures",
        "Q15min (first hour): Vitals, symptoms",
        "Q30min: Vitals, UF progress",
        "Hourly: Temp, respiratory status, neuro checks",
        "Pre & Post: Full labs (BUN, Cr, lytes, Ca, PO4, Hb)",
        "Weekly: URR, Kt/V, iron studies, PTH, albumin"
      ],
      references: [
        "KDIGO 2024 HD Adequacy Guideline",
        "IPNA Pediatric HD Standards 2023",
        "NKF-KDOQI 2015",
        "ASN Pediatric HD Protocols"
      ]
    });
  };

  const applyPDTemplate = (templateKey) => {
    const template = pdTemplates[templateKey];
    if (!template) return;

    setPdTemplate(templateKey);

    if (templateKey === "neonate") {
      setPdUrgency("urgent");
      setPdIndication(prev => prev || "FluidOverload");
    } else if (templateKey === "infant" && pdIndication === "Hyperkalemia") {
      setPdUrgency("emergent");
    } else {
      setPdUrgency("urgent");
    }

    setPdDwells("");
    setPdDwellTime("");
    toast.success(`Applied ${template.name} template`);
  };

  const calculatePD = () => {
    const weight = parseFloat(pdWeight);
    const age = parseFloat(pdAge);

    if (!weight || !age) {
      toast.error("Please enter weight and age");
      return;
    }
    if (pdType === "acute" && (!pdIndication || !pdUrgency)) {
      toast.error("Please select indication and urgency");
      return;
    }
    if (pdType === "chronic" && (!pdDwells || !pdDwellTime)) {
      toast.error("Please enter exchanges and dwell time");
      return;
    }

    const safetyAlerts = [];

    if (pdAbdominalContraindication) {
      safetyAlerts.push({
        severity: "critical",
        title: "ABSOLUTE CONTRAINDICATION",
        message: "Acute PD contraindicated. Consult surgery immediately."
      });
    }

    if (pdSerumGlucose && parseFloat(pdSerumGlucose) > 180 && pdType === "acute") {
      safetyAlerts.push({
        severity: "warning",
        title: "Hyperglycemia Risk",
        message: `Glucose ${pdSerumGlucose} mg/dL elevated. Monitor q2h.`
      });
    }

    if (pdSerumK && parseFloat(pdSerumK) >= 6.0) {
      safetyAlerts.push({
        severity: "critical",
        title: "Life-Threatening Hyperkalemia",
        message: "K+ ≥6.0 requires IMMEDIATE treatment before/during PD."
      });
    }

    if (pdHemodynamicStatus !== "Stable") {
      safetyAlerts.push({
        severity: "warning",
        title: "Hemodynamic Instability",
        message: "Reduce UF, use shorter cycles, monitor BP hourly."
      });
    }

    if (pdPeritonitisRisk) {
      safetyAlerts.push({
        severity: "warning",
        title: "Peritonitis Risk",
        message: "Send effluent for culture. Start empiric IP antibiotics."
      });
    }

    const height = age < 2 ? (age * 25 + 75) : (age * 6 + 85);
    const bsa = Math.sqrt((height * weight) / 3600);

    let prescription = "";
    let primaryResults = [];
    let monitoringPlan = [];
    let references = [];

    if (pdType === "acute") {
      const template = pdTemplate ? pdTemplates[pdTemplate] : null;
      let fillPerKg = template ? template.fillPerKg : (
        age < 0.083 ? 15 : age < 1 ? 25 : age < 12 ? 35 : 35
      );

      if (pdUrgency === "emergent") {
        fillPerKg = Math.min(fillPerKg, 20);
        safetyAlerts.push({
          severity: "warning",
          title: "Emergent - Conservative Fill",
          message: "Reduced fill for emergent case. Escalate gradually."
        });
      }

      const initialFill = weight * fillPerKg;
      const targetFillPerKg = Math.min(fillPerKg + 10, 45);
      const targetFill = weight * targetFillPerKg;

      const dwellMin = template ? template.dwellMin : (pdUrgency === "emergent" ? 30 : 45);
      const drainMin = template ? template.drainMin : 5;
      const fillMin = 3;
      const cycleMin = dwellMin + drainMin + fillMin;
      const cyclesPerHour = 60 / cycleMin;
      const cyclesPer24h = Math.round(cyclesPerHour * 24);
      const totalDialysateL = ((initialFill * cyclesPer24h) / 1000).toFixed(1);

      const targetUF = pdTargetUF ? parseFloat(pdTargetUF) : (weight * 50);
      const ufRatePerHour = targetUF / 24;
      const ufPerExchange = ufRatePerHour * (cycleMin / 60);

      let dextroseConc = "1.5%";
      let dextroseRationale = "Mild UF";
      if (ufPerExchange <= 5) {
        dextroseConc = "1.5%";
      } else if (ufPerExchange <= 15) {
        dextroseConc = "2.5%";
        dextroseRationale = "Moderate UF";
      } else {
        dextroseConc = "2.5-4.25%";
        dextroseRationale = "High UF - Monitor glucose";
        safetyAlerts.push({
          severity: "warning",
          title: "High Dextrose Needed",
          message: `May need 4.25% glucose. Monitor glucose q2h.`
        });
      }

      if (initialFill > weight * 50) {
        safetyAlerts.push({
          severity: "critical",
          title: "EXCESSIVE FILL",
          message: `${initialFill.toFixed(0)} mL exceeds 50 mL/kg limit. REDUCE.`
        });
      }

      const dextroseCalories = dextroseConc.includes("1.5") ? (parseFloat(totalDialysateL) * 6 * 10 * 0.6).toFixed(0) :
                              dextroseConc.includes("2.5") ? (parseFloat(totalDialysateL) * 11 * 10 * 0.6).toFixed(0) :
                              (parseFloat(totalDialysateL) * 18 * 10 * 0.6).toFixed(0);

      prescription = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        ACUTE PERITONEAL DIALYSIS PRESCRIPTION
                    (PEDIATRIC)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PATIENT INFORMATION:
────────────────────────────────────────────────────────────
• Age: ${age} years
• Weight: ${weight} kg
• BSA: ${bsa.toFixed(3)} m²
• Indication: ${pdIndication || "Acute kidney injury"}
• Urgency: ${pdUrgency}
• Hemodynamic Status: ${pdHemodynamicStatus}
${pdSerumK ? `• Serum K+: ${pdSerumK} mmol/L ${parseFloat(pdSerumK) >= 6 ? "⚠️ CRITICAL" : ""}` : ""}
${pdSerumGlucose ? `• Serum Glucose: ${pdSerumGlucose} mg/dL` : ""}

PRESCRIPTION TYPE: ${template ? template.name : "Custom Acute PD"}
────────────────────────────────────────────────────────────

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 1: INITIAL (First 12-24 hours)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Fill Volume:       ${initialFill.toFixed(0)} mL per exchange
                   (${fillPerKg.toFixed(1)} mL/kg - ${fillPerKg < 20 ? "conservative" : "standard"} start)

Dwell Time:        ${dwellMin} minutes ${dwellMin < 45 ? "(RAPID for urgent clearance)" : ""}
Drain Time:        ${drainMin} minutes
Fill Time:         ${fillMin} minutes
Cycle Time:        ${cycleMin} minutes
Cycles/24h:        ${cyclesPer24h} exchanges
Total Volume:      ${totalDialysateL} L per 24 hours

Dialysate:         ${dextroseConc} glucose, ${template?.solution.includes("bicarb") ? "bicarbonate" : "lactate"}-buffered
Dextrose Rationale: ${dextroseRationale}

Expected UF:       ${ufPerExchange.toFixed(0)} mL per exchange
                   Target: ${targetUF.toFixed(0)} mL/24h (${ufRatePerHour.toFixed(1)} mL/hr)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 2: ESCALATION (24-72 hours)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IF TOLERATED (no respiratory distress, adequate drainage):
→ Increase fill by 50-100 mL every 4-8 exchanges
→ Target: ${targetFill.toFixed(0)} mL (${(targetFill / weight).toFixed(1)} mL/kg)
→ Monitor: Respiratory rate, abdominal exam, leak, UF adequacy

IF INADEQUATE UF with ${dextroseConc}:
→ Escalate to ${dextroseConc.includes("4.25") ? "maintain 4.25%" : "2.5% or 4.25%"}
→ ⚠️ MONITOR blood glucose q2-4h
→ Insulin infusion if glucose >180 mg/dL

IF POOR DRAINAGE:
→ KUB X-ray (check catheter position)
→ Reposition patient (lateral decubitus, knee-chest)
→ Lower drain bag below bed
→ Heparin 500 units/L in dialysate
→ If fibrin clot: tPA 1 mg in 20 mL NS, dwell 30 min

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 3: TRANSITION (After 72 hours)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IF AKI RESOLVING (↓BUN/Cr, ↑UO, normalizing electrolytes):
→ Wean: Decrease to q3-4h exchanges
→ Increase dwell to 2-4 hours
→ Prepare for catheter removal

IF CHRONIC PD NEEDED (no recovery after 4-6 weeks):
→ Transition to chronic CAPD/APD
→ Fill: ${(bsa * 1100).toFixed(0)} mL (1100 mL/m²)
→ 4-5 exchanges per day
→ Dwell: 4-6 hours
→ Begin family training for home PD

DIALYSATE COMPOSITION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Glucose: ${dextroseConc} (adjust per UF response)
• Sodium: 132 mmol/L
• Calcium: 1.25 mmol/L (or 1.75 if hypocalcemic)
• Potassium: ${pdSerumK && parseFloat(pdSerumK) >= 6 ? "0 mmol/L (K-free for hyperkalemia)" : "0 mmol/L (standard for AKI; add 2-4 if hypokalemic)"}
• Buffer: ${template?.solution.includes("bicarb") ? "Bicarbonate 25-35 mmol/L" : "Lactate 35-40 mmol/L"}

${pdSerumK && parseFloat(pdSerumK) >= 6 ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ HYPERKALEMIA EMERGENCY PROTOCOL (K+ ≥6.0)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IMMEDIATE TREATMENT (before/concurrent with PD):

1. Calcium gluconate 10%: ${(weight * 0.5).toFixed(1)} mL IV over 3-5 min (max 20 mL)
   → Cardiac membrane stabilization
   → Repeat in 5 min if ECG changes persist

2. Regular insulin ${(weight * 0.1).toFixed(1)} units + D25W ${(weight * 2).toFixed(1)} mL IV over 30 min
   → Shift K+ intracellularly
   → Monitor glucose q30min × 4h

3. Sodium bicarbonate ${weight.toFixed(0)}-${(weight * 2).toFixed(0)} mEq IV if pH <7.2
   → Enhances K+ shift

4. Salbutamol nebulization 2.5-5 mg
   → β-agonist K+ shift

ACUTE PD FOR K+ CLEARANCE:
• USE RAPID CYCLES: 30-min dwells, q${30 + drainMin + fillMin}min exchanges
• 0-K+ dialysate (NO added potassium)
• Monitor K+ q2h initially, then q4-6h
• Target: K+ <5.5 mmol/L before standard cycles
• ECG monitoring continuous until K+ normalized
` : ""}

${pdPeritonitisRisk ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ PERITONITIS PROTOCOL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• Send effluent: Cell count (>100 WBC), Gram stain, Culture (aerobic/anaerobic/fungal)
• START IMMEDIATELY:
  - IP Vancomycin: ${(weight * 30).toFixed(0)} mg loading (30 mg/kg), then ${(weight * 15).toFixed(0)} mg maintenance
  - IP Ceftazidime: ${(weight * 15).toFixed(0)} mg loading, then ${(weight * 4).toFixed(0)} mg maintenance
• Add Heparin 500 IU/L to prevent fibrin
• Continue exchanges unless severe hemodynamic compromise
• Daily effluent monitoring
• If no improvement 48h or fungal: Remove catheter
` : ""}

MONITORING PROTOCOL - ACUTE PD:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CONTINUOUS/EVERY EXCHANGE:
• Vital signs (HR, BP, RR, SpO₂, temp)
• Respiratory status (work of breathing, tachypnea)
• Abdominal exam (distension, tenderness, rigidity)
• Dialysate appearance (color, clarity)
• Volume balance (instilled vs drained = net UF)
• Inflow/outflow times
• Catheter exit site (erythema, discharge, pain)

EVERY 2-4 HOURS:
• K+, Na+, Cl⁻, HCO₃⁻ (critical electrolytes)
• Blood gas (pH, pCO₂, base deficit)
• Blood glucose ${dextroseConc.includes("4.25") || (pdSerumGlucose && parseFloat(pdSerumGlucose) > 180) ? "(MANDATORY with high dextrose)" : ""}
• BUN, Creatinine

EVERY 8-12 HOURS:
• Weight (pre-shift)
• Cumulative fluid balance
• CBC if infection/anemia concern

DAILY:
• Total UF achieved vs target
• Clinical status (edema, respiratory, mental status)
• Comprehensive metabolic panel
• Ca, PO₄, Mg
• Albumin, total protein

EMERGENCY PROTOCOLS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IF CLOUDY EFFLUENT (Peritonitis):
1. STOP exchange - save effluent
2. Send for cell count, Gram stain, culture
3. START empiric IP antibiotics (Vancomycin + Ceftazidime)
4. Continue exchanges unless severe
5. Notify nephrology & ID STAT

IF NO/POOR DRAINAGE:
1. KUB X-ray (catheter position)
2. Reposition (lateral positions)
3. Lower drain bag well below bed
4. Flush with 10-20 mL NS
5. Heparin 500 units/L
6. tPA if fibrin clot
7. Surgical consult if persistent

IF RESPIRATORY DISTRESS:
1. DRAIN abdomen completely
2. Sit upright (30-45° elevation)
3. Reduce fill 30-50%
4. Shorten dwells
5. Check for leak
6. CXR (rule out hydrothorax)
7. Consider HD if severe

IF LEAK (Pericatheter, inguinal, genital):
1. Reduce fill to 50% or less
2. Shorten dwells (15-30 min)
3. Bed rest
4. Temporary HD if large leak
5. Surgical evaluation

IF HYPOTENSION:
1. Lower dextrose concentration
2. NS bolus 10-20 mL/kg
3. Check bleeding, sepsis
4. Vasopressor support
5. Minimal UF only

NUTRITION DURING ACUTE PD:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Protein: 1.5-2.0 g/kg/day
  (account for ~0.2 g/kg protein loss per L dialysate)

• Calories: Account for dextrose absorption
  - 1.5% = ~6 kcal/100 mL
  - 2.5% = ~11 kcal/100 mL
  - 4.25% = ~18 kcal/100 mL
  - Absorption: ~60% of instilled dextrose
  - For ${totalDialysateL} L/day of ${dextroseConc}: ~${dextroseCalories} kcal absorbed

• Fluid: Urine output + 400 mL/m²/day + ongoing losses
  - Insensible: 400-600 mL/m²/day
  - Plus: Stool, NG losses

• Phosphate: May need binders if hyperphosphatemic
  (Calcium carbonate, Sevelamer)

• Vitamins: Water-soluble daily (B-complex, C)

CATHETER CARE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Exit site: Inspect q8-12h
• Cleansing: Daily with chlorhexidine/povidone-iodine
• Dressing: Sterile gauze, change when soiled or daily
• Immobilization: Secure to abdomen (prevent traction)
• No baths/swimming (shower OK with waterproof dressing)

QUALITY INDICATORS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ Fill/drain times within expected ranges
□ Net UF ≥80% of target
□ No peritonitis episodes
□ Electrolytes in target ranges
□ Glucose <200 mg/dL
□ Patient comfort (no severe pain/distension)
□ Catheter functioning without revision

DISCONTINUATION CRITERIA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Stop acute PD when:
□ BUN/Cr trending down 24-48h
□ Urine output >1 mL/kg/h sustained
□ Electrolytes normalizing (K+ <5.5, HCO₃⁻ >18)
□ Fluid balance achieved
□ Hemodynamically stable off pressors
□ Tolerating enteral nutrition

Weaning:
1. Decrease frequency (q3-4h instead of q1-2h)
2. Lengthen dwells (2-4h)
3. Monitor labs q6-12h during wean
4. If stable × 24h, trial off PD
5. Continue monitoring × 48h post-removal

REFERENCES & GUIDELINES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. ISPD/IPNA Clinical Practice Guidelines for Acute PD (2024)
2. Gabriel DP, et al. Kidney Int Suppl. 2008
3. Phu NH, et al. N Engl J Med 2002
4. KDIGO AKI Guidelines 2012 (updated 2023)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PRESCRIBER INFORMATION:
────────────────────────────────────────────────────────────
Prescribing Physician:  _________________________________
Nephrology Fellow:      _________________________________
Supervising Attending:  _________________________________
PICU/Ward Attending:    _________________________________
Pharmacist Verified:    _________________________________
Nursing Acknowledged:   _________________________________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    END OF PRESCRIPTION
        ⚠️ CLINICAL DECISION SUPPORT TOOL ONLY ⚠️
  Always verify calculations and adjust to clinical context
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `.trim();

      primaryResults = [
        { label: "Initial Fill", value: `${initialFill.toFixed(0)} mL`, subtext: `${fillPerKg.toFixed(1)} mL/kg` },
        { label: "Target Fill", value: `${targetFill.toFixed(0)} mL`, subtext: "When tolerated" },
        { label: "Cycle Time", value: `${cycleMin} min`, subtext: `${cyclesPerHour.toFixed(1)} cycles/hr` },
        { label: "Cycles/24h", value: cyclesPer24h.toString(), subtext: `${totalDialysateL} L/day` },
        { label: "Dextrose", value: dextroseConc, subtext: dextroseRationale },
        { label: "UF Target", value: `${targetUF.toFixed(0)} mL/24h`, subtext: `${ufRatePerHour.toFixed(1)} mL/hr` }
      ];

      monitoringPlan = [
        "CONTINUOUS: Vitals, respiratory, abdominal exam, dialysate clarity",
        "EVERY EXCHANGE: Volume balance, times, catheter site",
        "Q2-4h: K, Na, glucose, Ca, blood gas, BUN, Cr",
        "Q8-12h: Weight, I&O, CBC",
        "DAILY: Total UF, clinical status, CMP, albumin"
      ];

      references = [
        "ISPD/IPNA Acute PD Guidelines 2024",
        "Gabriel DP, et al. Kidney Int Suppl 2008",
        "KDIGO AKI Guidelines 2023"
      ];

    } else {
      const dwells = parseInt(pdDwells);
      const dwellTime = parseFloat(pdDwellTime);
      const fillPerBSA = pdModality === "CAPD" ? 1100 : 1000;
      const fillVolume = (bsa * fillPerBSA).toFixed(0);
      const totalDailyVolume = (parseFloat(fillVolume) * dwells / 1000).toFixed(1);
      const weeklyKtV = ((totalDailyVolume * 7 * 0.6 + 14) / (weight * 0.6)).toFixed(2);

      prescription = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      CHRONIC PERITONEAL DIALYSIS PRESCRIPTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Patient: ${age}y, ${weight}kg, BSA: ${bsa.toFixed(3)}m²
Modality: ${pdModality}
Indication: End-stage kidney disease

PRESCRIPTION:
Fill: ${fillVolume} mL (${fillPerBSA} mL/m²)
Exchanges: ${dwells}/day
Dwell: ${dwellTime}h
Total: ${totalDailyVolume} L/day
Weekly Kt/V: ${weeklyKtV}

DIALYSATE: 1.5-2.5% glucose, Ca 1.25, bicarb/lactate buffer
MONITORING: Daily weight/BP, Monthly labs/Kt/V, Quarterly PTH/growth
CATHETER CARE: Daily exit site cleaning, weekly dressing

References: ISPD/IPNA PD Guidelines 2024
      `.trim();

      if (parseFloat(fillVolume) > weight * 50) {
        safetyAlerts.push({
          severity: "critical",
          title: "Excessive Fill",
          message: "Exceeds 50 mL/kg. Start lower."
        });
      }

      primaryResults = [
        { label: "Fill", value: `${fillVolume} mL`, subtext: `${(parseFloat(fillVolume) / weight).toFixed(1)} mL/kg` },
        { label: "Exchanges", value: dwells.toString(), subtext: `${dwellTime}h dwell` },
        { label: "Daily Volume", value: `${totalDailyVolume} L/day`, subtext: "" },
        { label: "Weekly Kt/V", value: weeklyKtV, subtext: parseFloat(weeklyKtV) >= 1.8 ? "Adequate" : "↑ Adjust" }
      ];

      monitoringPlan = [
        "Daily: Weight, BP, UF, dialysate appearance",
        "Monthly: Labs, Kt/V",
        "Quarterly: PTH, growth",
        "Annually: PET"
      ];

      references = [
        "ISPD/IPNA Pediatric PD Guidelines 2024",
        "Warady BA, et al. Pediatr Nephrol 2020"
      ];
    }

    setPdResults({
      safetyLevel: safetyAlerts.some(a => a.severity === "critical") ? "critical" :
        safetyAlerts.length > 0 ? "caution" : "safe",
      primaryResults,
      safetyAlerts: safetyAlerts.length > 0 ? safetyAlerts : undefined,
      prescriptionText: prescription,
      monitoringPlan,
      references
    });
  };

  const calculateCRRT = () => {
    const weight = parseFloat(crrtWeight);
    const age = parseFloat(crrtAge);
    const fluidOverload = parseFloat(crrtFluidOverload);
    const targetDose = parseFloat(crrtTargetDose);
    const modality = crrtModality;
    const serumK = parseFloat(crrtSerumK);

    if (!weight || !targetDose || !age) {
      toast.error("Please enter weight, age, and target dose");
      return;
    }

    const height = age < 2 ? (age * 25 + 75) : (age * 6 + 85);
    const bsa = Math.sqrt((height * weight) / 3600);

    const bfr = Math.min(5 * weight, 150);
    const effluentRate = targetDose * weight;

    const netUF = fluidOverload ? (fluidOverload / 24).toFixed(1) : "0";
    const netUF_rate = fluidOverload ? (parseFloat(netUF) / weight).toFixed(1) : "0";

    let dialysateRate = 0;
    let replacementRate = 0;
    let postDilution = 0;
    let preDilution = 0;

    if (modality === "CVVH") {
      replacementRate = effluentRate;
      postDilution = effluentRate * 0.3;
      preDilution = effluentRate * 0.7;
    } else if (modality === "CVVHD") {
      dialysateRate = effluentRate;
    } else {
      dialysateRate = effluentRate * 0.5;
      replacementRate = effluentRate * 0.5;
      postDilution = replacementRate * 0.3;
      preDilution = replacementRate * 0.7;
    }

    const citrate_loading = (weight * 3).toFixed(1);
    const citrate_maintenance = (bfr * 0.5).toFixed(1);

    const safetyAlerts = [];

    if (targetDose < 20) {
      safetyAlerts.push({
        severity: "warning",
        title: "Low CRRT Dose",
        message: `${targetDose} mL/kg/h below 20-25 minimum.`
      });
    }

    if (targetDose > 50) {
      safetyAlerts.push({
        severity: "critical",
        title: "Excessive Dose",
        message: `${targetDose} mL/kg/h exceeds standard. No benefit >35-40.`
      });
    }

    if (fluidOverload && parseFloat(netUF_rate) > 0.5) {
      safetyAlerts.push({
        severity: "warning",
        title: "High UF Rate",
        message: `${netUF_rate} mL/kg/h approaches upper limit. Monitor hemodynamics.`
      });
    }

    if (serumK && serumK >= 6.0) {
      safetyAlerts.push({
        severity: "critical",
        title: "Severe Hyperkalemia",
        message: "Switch to K-free dialysate. Pre-treat with insulin+dextrose."
      });
    }

    const prescription = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         PEDIATRIC CRRT MASTER PRESCRIPTION
               ${modality} — FULL PROTOCOL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PATIENT INFORMATION:
────────────────────────────────────────────────────────────
• Age: ${age} years
• Weight: ${weight} kg
• BSA: ${bsa.toFixed(3)} m²
• Indication: ${serumK >= 6 ? "Severe AKI + hyperkalemia" : "Severe AKI"} + fluid overload
• Hemodynamics: ${crrtHemodynamics}
${serumK ? `• Serum K+: ${serumK} mmol/L ${serumK >= 6 ? "⚠️ CRITICAL" : ""}` : ""}
• Access: ${weight < 15 ? "7-8 Fr catheter" : "8-10 Fr catheter"}
• Mode: ${modality}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MODE SELECTION RATIONALE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• CVVH: Best for cytokine removal, sepsis, middle molecules
• CVVHD: Best for electrolytes, hyperammonemia, toxins
• CVVHDF: Versatile - AKI + fluid + metabolic (CURRENT)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PHASE 1: INITIAL PRESCRIPTION (First 6-12 Hours)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. BLOOD FLOW RATE:
   • Start: ${(3 * weight).toFixed(0)}-${(4 * weight).toFixed(0)} mL/min (3-4 mL/kg/min)
   • Target: ${bfr.toFixed(0)} mL/min (5 mL/kg/min) as tolerated
   • Maximum: ${Math.min(8 * weight, 150).toFixed(0)} mL/min (catheter-dependent)
   
   Lower BFR reduces access alarms in unstable patients

2. EFFLUENT DOSE (Total):
   • Target: ${targetDose} mL/kg/hr
   • Total Effluent: ${effluentRate.toFixed(0)} mL/hr
   
   KDIGO/IPNA: 25-35 mL/kg/hr for AKI

3. MODE-SPECIFIC PARAMETERS:

   ${modality === "CVVH" ? `
   CVVH — PURE HEMOFILTRATION (Convection):
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   • Replacement Fluid: ${replacementRate.toFixed(0)} mL/hr (ALL effluent)
     - Prefilter (70%): ${preDilution.toFixed(0)} mL/hr (reduce clotting)
     - Postfilter (30%): ${postDilution.toFixed(0)} mL/hr (better clearance)
   • Dialysate: 0 mL/hr (not used in CVVH)
   
   Composition: Na 140, K ${serumK >= 6 ? "0" : "2-4"}, Ca 0 (citrate), HCO₃ 32
   ` : modality === "CVVHD" ? `
   CVVHD — PURE HEMODIALYSIS (Diffusion):
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   • Dialysate Flow: ${dialysateRate.toFixed(0)} mL/hr (ALL effluent)
   • Replacement: Minimal or none
   
   Composition: Na 140, K ${serumK >= 6 ? "0-1" : "2"}, Ca 0 (citrate), HCO₃ 35
   ` : `
   CVVHDF — COMBINED (Convection + Diffusion):
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   • Dialysate Flow: ${dialysateRate.toFixed(0)} mL/hr (50% of dose)
   • Replacement Fluid: ${replacementRate.toFixed(0)} mL/hr (50% of dose)
     - Prefilter (70%): ${preDilution.toFixed(0)} mL/hr
     - Postfilter (30%): ${postDilution.toFixed(0)} mL/hr
   
   Composition: Na 140, K ${serumK >= 6 ? "0-1" : "3"}, Ca 0, Mg 1.0, HCO₃ 32-35
   `}

4. ULTRAFILTRATION (Net Removal):
   • Start: ${fluidOverload ? netUF : "0-1"} mL/hr (${fluidOverload ? netUF_rate : "0"} mL/kg/hr)
   ${fluidOverload ? `• Goal: Remove ${fluidOverload} L over 24 hours` : "• Adjust hourly per fluid balance"}
   • Maximum safe: 5-8 mL/kg/hr (with pressor support)

5. ANTICOAGULATION:

   PREFERRED: Regional Citrate
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   • ACD-A Citrate: ${citrate_maintenance} mEq/hr (prefilter)
   • Loading: ${citrate_loading} mEq over 30 min
   • Calcium gluconate 10%: Start ${(bfr * 0.02).toFixed(1)} mL/hr
     (titrate to systemic iCa 1.0-1.2 mmol/L)
   
   TARGETS:
   - Circuit iCa (postfilter): 0.25-0.35 mmol/L
   - Systemic iCa: 1.0-1.2 mmol/L
   - Total Ca:iCa ratio: <2.5
   
   MONITORING:
   - iCa q1h × 4h, then q4h
   - Total Ca, Na q4h
   - Watch for citrate toxicity (↑lactate, ↓iCa, Total:iCa >2.5)

   ALTERNATIVE: Heparin (if citrate contraindicated)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   • Loading: ${(weight * 20).toFixed(0)} units (20 U/kg)
   • Maintenance: ${(weight * 10).toFixed(0)} units/hr (10 U/kg/hr)
   • Target circuit aPTT: 60-80 sec
   • Check aPTT q4-6h

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PHASE 2: ESCALATION (12-48 Hours)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IF INADEQUATE SOLUTE CLEARANCE (BUN, K+ not improving):
→ Increase effluent to 35-40 mL/kg/hr
→ Increase dialysate flow (CVVHD/CVVHDF)
→ Increase replacement flow (CVVH/CVVHDF)
→ Increase BFR by 10-20%

IF PERSISTENT FLUID OVERLOAD:
→ Escalate UF to 3-5 mL/kg/hr if stable
→ Maximum 8 mL/kg/hr (requires pressor support)
→ Monitor MAP continuously

IF FILTER CLOTTING (<24h filter life):
→ Increase prefilter replacement (reduce hemoconcentration)
→ Increase anticoagulation
→ Increase BFR
→ Check access function

PHASE 3: TITRATION & STABILIZATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

When metabolic parameters stabilize:
→ Reduce effluent to 20-25 mL/kg/hr
→ UF per fluid balance
→ Gradual electrolyte correction (avoid rapid Na shifts)

${serumK >= 6 ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ HYPERKALEMIA MANAGEMENT DURING CRRT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IMMEDIATE (before CRRT):
• Calcium gluconate, insulin+dextrose, bicarbonate, salbutamol
  (same as HD protocol)

DURING CRRT:
• 0-K dialysate
• Increase dialysate flow (maximize diffusion)
• Increase replacement flow (maximize convection)
• Monitor K+ q2h until <5.5, then q4-6h
• Continuous ECG monitoring

` : ""}

COMPLICATIONS & MANAGEMENT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. FILTER CLOTTING:
   → Increase prefilter replacement
   → Switch to citrate
   → Increase BFR
   → Check access (may be low flow)

2. CITRATE TOXICITY:
   Signs: Total:iCa >2.5, ↑lactate, metabolic alkalosis
   → Reduce citrate 20-40%
   → Increase calcium infusion
   → Switch to heparin if severe

3. HYPOTENSION:
   → Reduce UF to 0 mL/hr
   → Warm dialysate/replacement to 37°C
   → Fluid bolus if appropriate
   → Increase vasopressors

4. HYPOPHOSPHATEMIA (very common):
   → Add Na-phosphate to replacement fluid
   → Target P >3 mg/dL
   → Typical dose: 0.8-1.2 mmol/kg/day

5. HYPONATREMIA CORRECTION:
   → Limit to 0.5 mEq/L/hr
   → Use low-Na replacement fluid
   → Monitor Na q2-4h

MONITORING PROTOCOL:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CONTINUOUS:
• BP, HR, MAP, SpO₂
• Circuit pressures (TMP, venous, arterial)
• Fluid balance (cumulative)

HOURLY:
• UF achieved
• Circuit inspection
• Temperature
• Neurological status

Q1-2H (if citrate):
• Circuit iCa (postfilter)
• Systemic iCa
• Total calcium

Q2-4H:
• Electrolytes (Na, K, Mg, Ca)
• Glucose
• Blood gas, lactate

Q4-6H:
• BUN, Creatinine
• Phosphate

Q12-24H:
• CBC, platelets
• PT/aPTT
• Blood cultures if febrile
• Albumin

DISCONTINUATION CRITERIA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Wean CRRT when:
□ MAP stable without pressors
□ Urine output >1 mL/kg/hr
□ K+, HCO₃⁻, PO₄ corrected
□ BUN stable/declining
□ Fluid balance achieved

Weaning:
1. Reduce effluent 20-30%
2. Reduce UF to maintenance
3. Trial 2-4h off CRRT
4. If stable, discontinue
5. Recheck labs at 4h, 8h, 12h

SUPPORTIVE CARE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Nutrition: Protein 1.5-2.5 g/kg/day (losses ~0.2 g/L effluent)
• Calories: 120-150% basal needs
• Phosphate supplementation (lost in filtrate)
• Water-soluble vitamins
• Renal drug dosing
• Avoid nephrotoxins

REFERENCES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. KDIGO AKI Guidelines 2023
2. Pediatric CRRT Consensus 2022
3. Goldstein SL, et al. Pediatr Nephrol 2012
4. Ronco et al. Principles of Pediatric CRRT

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PRESCRIBER INFORMATION:
────────────────────────────────────────────────────────────
Prescribing Physician:  _________________________________
Nephrology Fellow:      _________________________________
PICU Attending:         _________________________________
Pharmacist Verified:    _________________________________
Nursing Acknowledged:   _________________________________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    END OF PRESCRIPTION
        ⚠️ CLINICAL DECISION SUPPORT TOOL ONLY ⚠️
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `.trim();

    setCrrtResults({
      safetyLevel: safetyAlerts.some(a => a.severity === "critical") ? "critical" :
        safetyAlerts.length > 0 ? "caution" : "safe",
      primaryResults: [
        { label: "BFR", value: `${bfr} mL/min`, subtext: "5 mL/kg/min" },
        { label: "Effluent", value: `${effluentRate.toFixed(0)} mL/h`, subtext: `${targetDose} mL/kg/h` },
        ...(modality !== "CVVHD" ? [{
          label: "Replacement",
          value: `${replacementRate.toFixed(0)} mL/h`,
          subtext: `Pre: ${preDilution.toFixed(0)}, Post: ${postDilution.toFixed(0)}`
        }] : []),
        ...(modality !== "CVVH" ? [{
          label: "Dialysate",
          value: `${dialysateRate.toFixed(0)} mL/h`,
          subtext: modality === "CVVHDF" ? "50% of dose" : "100%"
        }] : []),
        ...(fluidOverload ? [{
          label: "Net UF",
          value: `${netUF} mL/h`,
          subtext: `Remove ${fluidOverload}L/24h`
        }] : [])
      ],
      safetyAlerts: safetyAlerts.length > 0 ? safetyAlerts : undefined,
      prescriptionText: prescription,
      monitoringPlan: [
        "CONTINUOUS: Pressures, MAP, fluid balance",
        "HOURLY: Vitals, UF, circuit check",
        "Q1-2h: iCa (circuit & systemic) if citrate",
        "Q2-4h: Lytes, glucose, blood gas",
        "Q4-6h: BUN, Cr, PO₄",
        "Q12-24h: CBC, coags, cultures if febrile"
      ],
      references: [
        "KDIGO AKI 2023",
        "Pediatric CRRT Consensus 2022",
        "Goldstein SL, et al. 2012"
      ]
    });
  };

  const calculateSLED = () => {
    const weight = parseFloat(sledWeight);
    const age = parseFloat(sledAge);
    const ufTarget = parseFloat(sledTargetUF);
    const duration = parseFloat(sledDuration);
    const serumK = parseFloat(sledSerumK);

    if (!weight || !age || !ufTarget || !duration) {
      toast.error("Please enter all required fields");
      return;
    }

    const height = age < 2 ? (age * 25 + 75) : (age * 6 + 85);
    const bsa = Math.sqrt((height * weight) / 3600);

    const bfr_start = (2 * weight).toFixed(0);
    const bfr_target = (3 * weight).toFixed(0);
    const bfr_max = (4 * weight).toFixed(0);
    const dfr = "120";
    const replacementFlow = (15 * weight).toFixed(0);
    const ufRate = (ufTarget * 1000 / duration).toFixed(1);

    const safetyAlerts = [];

    if (parseFloat(ufRate) / weight > 5) {
      safetyAlerts.push({
        severity: "warning",
        title: "High UF Rate",
        message: "Consider extending duration or reducing UF goal."
      });
    }

    const prescription = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         PEDIATRIC SLEDD-f PRESCRIPTION
   (Sustained Low-Efficiency Daily Dialysis - filtered)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PATIENT: ${age}y, ${weight}kg, BSA: ${bsa.toFixed(3)}m²
Indication: AKI + hemodynamic instability
${serumK ? `Serum K+: ${serumK} mmol/L` : ""}

WHY SLEDD-f?
• Gentler hemodynamics than IHD
• Better clearance than low-dose CRRT
• Daily 6-12h support
• Ideal for pressor-dependent, fluid-overloaded children

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PHASE 1: INITIAL SESSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. BLOOD FLOW (Start slow, increase):
   • Start: ${bfr_start} mL/min (2 mL/kg/min)
   • After 30 min if MAP stable: ${bfr_target} mL/min (3 mL/kg/min)
   • Maximum: ${bfr_max} mL/min (4 mL/kg/min)

2. DIALYSATE FLOW:
   • Low-flux: ${dfr} mL/min
   • Total: ~7.2 L over ${duration} hours

3. FILTRATION (Convective):
   • Replacement: ${replacementFlow} mL/hr (10-15 mL/kg/hr)
   • Prefilter: 70%, Postfilter: 30%

4. ULTRAFILTRATION:
   • Start: ${(1 * weight).toFixed(0)} mL/hr (1 mL/kg/hr)
   • After 2h if stable: ${(2 * weight).toFixed(0)}-${(3 * weight).toFixed(0)} mL/hr
   • Target UF over ${duration}h: ${ufTarget} L
   • Never exceed 5 mL/kg/hr in unstable patients

5. SESSION DURATION:
   • ${duration} hours (slow, prolonged, gentle)

6. DIALYSATE:
   • Na: 140, K: ${serumK >= 6 ? "0" : "2"}, Ca: 2.5-3.0, HCO₃: 32-35
   • Temperature: 35.5-36°C (prevent vasodilation)

7. ANTICOAGULATION:
   • Citrate preferred or Heparin 10 U/kg + 10 U/kg/hr

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PHASE 2: ESCALATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IF K+/acidosis persist:
→ Increase DFR by 20-30%
→ Increase replacement
→ 0-K dialysate for first 2h
→ Extend to 12 hours

IF fluid overload persists:
→ UF to 3-4 mL/kg/hr
→ Isolated UF 1-2h pre-SLEDD
→ Adjust pressors (maintain MAP >50)

COMPLICATIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. HYPOTENSION: Reduce BFR, lower DFR, decrease UF, NS bolus, increase pressors
2. HYPOKALEMIA: Switch to 4-K dialysate, add K to replacement
3. DISEQUILIBRIUM: Shorten session, reduce bicarb, mannitol
4. FILTER CLOTTING: Increase prefilter replacement, switch to citrate
5. HYPOPHOSPHATEMIA: Add phosphate to dialysate or IV

MONITORING:
• CONTINUOUS: ECG, SpO₂, invasive BP
• Q15min (first hour): BP, HR, UF
• HOURLY: MAP, pressures, temp
• Q2H: Lytes, blood gas, iCa (citrate)
• DAILY: Weight, BUN/Cr, PO₄, Mg

DISCONTINUATION:
□ MAP >60, pressors weaned
□ Urine output ≥1 mL/kg/hr
□ Lytes stable 12-24h
□ Fluid resolved

Weaning: 12→10→8h, reduce convection 50%, then transition to IHD

REFERENCES:
1. SLEDD-f protocols, Brophy PD
2. KDIGO AKI Guidelines
3. Tolwani et al. SLED in ICU

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRESCRIBER INFORMATION:
────────────────────────────────────────────────────────────
Prescribing Physician:  _________________________________
PICU Attending:         _________________________________
Pharmacist:             _________________________________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `.trim();

    setSledResults({
      safetyLevel: safetyAlerts.length > 0 ? "caution" : "safe",
      primaryResults: [
        { label: "BFR Start", value: `${bfr_start} mL/min`, subtext: "2 mL/kg/min" },
        { label: "BFR Target", value: `${bfr_target} mL/min`, subtext: "3 mL/kg/min" },
        { label: "Dialysate", value: `${dfr} mL/min`, subtext: "Low-flux" },
        { label: "Replacement", value: `${replacementFlow} mL/hr`, subtext: "Convective" },
        { label: "UF Rate", value: `${ufRate} mL/h`, subtext: `${(parseFloat(ufRate) / weight).toFixed(1)} mL/kg/h` }
      ],
      safetyAlerts: safetyAlerts.length > 0 ? safetyAlerts : undefined,
      prescriptionText: prescription,
      monitoringPlan: [
        "CONTINUOUS: ECG, BP, SpO₂",
        "Q15min (first hour): Vitals, UF",
        "HOURLY: MAP, pressures",
        "Q2H: Lytes, blood gas",
        "DAILY: Weight, BUN/Cr"
      ],
      references: [
        "SLEDD-f Brophy PD",
        "KDIGO AKI 2023",
        "Tolwani SLED ICU"
      ]
    });
  };

  const buildPrescription = async () => {
    const weight = parseFloat(patientData.weight) || 0;

    if (!weight) {
      toast.error("Please enter patient weight");
      return;
    }

    let prescription = "";

    if (builderMode === "crrt") {
      const bfr = builderParams.bloodFlow || Math.min(5 * weight, 150);
      const dose = builderParams.effluentDose || 25;
      const effluent = dose * weight;

      prescription = `
CRRT PRESCRIPTION - ${builderParams.modality}
Weight: ${weight} kg
BFR: ${bfr.toFixed(0)} mL/min
Effluent: ${dose} mL/kg/hr (${effluent.toFixed(0)} mL/hr)
Anticoag: ${builderParams.anticoag}

Generated: ${new Date().toLocaleString()}
      `.trim();
    } else if (builderMode === "hd") {
      const bfr = builderParams.hdBloodFlow || Math.min(4 * weight, 200);
      prescription = `HD PRESCRIPTION\nWeight: ${weight}kg\nBFR: ${bfr.toFixed(0)} mL/min\nGenerated: ${new Date().toLocaleString()}`;
    } else {
      const fill = builderParams.pdFillVol || (weight * 35);
      prescription = `PD PRESCRIPTION\nWeight: ${weight}kg\nFill: ${fill.toFixed(0)} mL\nGenerated: ${new Date().toLocaleString()}`;
    }

    await navigator.clipboard.writeText(prescription);
    toast.success("Prescription copied!");
  };

  const handleCopyPrescription = async (prescription) => {
    if (prescription) {
      await navigator.clipboard.writeText(prescription);
      toast.success("Prescription copied");
    }
  };

  const renderResults = (results) => {
    if (!results) return null;

    const safetyColors = {
      safe: "bg-green-50 border-green-200",
      caution: "bg-amber-50 border-amber-200",
      critical: "bg-red-50 border-red-200"
    };

    return (
      <div className="space-y-6 mt-6">
        <Card className={`${safetyColors[results.safetyLevel]} border-2`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              {results.safetyLevel === "safe" && <CheckCircle className="w-5 h-5 text-green-600" />}
              {results.safetyLevel === "caution" && <AlertTriangle className="w-5 h-5 text-amber-600" />}
              {results.safetyLevel === "critical" && <AlertTriangle className="w-5 h-5 text-red-600" />}
              Calculated Parameters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.primaryResults.map((result, idx) => (
                <div key={idx} className="bg-white p-4 rounded-lg border">
                  <div className="text-sm text-slate-600 mb-1">{result.label}</div>
                  <div className="text-2xl font-bold text-slate-900">{result.value}</div>
                  <div className="text-xs text-slate-500 mt-1">{result.subtext}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {results.safetyAlerts && (
          <Card className="border-2 border-red-200">
            <CardHeader>
              <CardTitle className="text-red-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Safety Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {results.safetyAlerts.map((alert, idx) => (
                <Alert key={idx} className={alert.severity === "critical" ? "bg-red-50 border-red-300" : "bg-amber-50 border-amber-300"}>
                  <AlertDescription>
                    <div className="font-semibold mb-1">{alert.title}</div>
                    <div className="text-sm">{alert.message}</div>
                  </AlertDescription>
                </Alert>
              ))}
            </CardContent>
          </Card>
        )}

        <Card className="border-2 border-blue-200">
          <CardHeader className="bg-blue-50 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5 text-blue-600" />
                Complete Prescription
              </CardTitle>
              <Button
                onClick={() => handleCopyPrescription(results.prescriptionText)}
                size="sm"
                variant="outline"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <pre className="whitespace-pre-wrap text-xs font-mono bg-white p-4 rounded border max-h-[600px] overflow-y-auto">
              {results.prescriptionText}
            </pre>
          </CardContent>
        </Card>

        {results.monitoringPlan && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="w-5 h-5 text-purple-600" />
                Monitoring Protocol
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {results.monitoringPlan.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Clock className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="text-sm text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {results.references && (
          <Card className="bg-slate-50">
            <CardHeader>
              <CardTitle className="text-base">References</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {results.references.map((ref, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Badge className="bg-slate-200 text-slate-800">{idx + 1}</Badge>
                    <span>{ref}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        <Link to={createPageUrl("Hub")}>
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-600 to-cyan-700 rounded-xl flex items-center justify-center shadow-lg">
              <Droplet className="w-7 h-7 text-white" />
            </div>
            RRT Prescription Generator
          </h1>
          <p className="text-slate-600">Comprehensive dialysis calculator with detailed protocols</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="hd">
              <Activity className="w-4 h-4 mr-2" />
              HD
            </TabsTrigger>
            <TabsTrigger value="pd">
              <Droplet className="w-4 h-4 mr-2" />
              PD
            </TabsTrigger>
            <TabsTrigger value="crrt">
              <Zap className="w-4 h-4 mr-2" />
              CRRT
            </TabsTrigger>
            <TabsTrigger value="sled">
              <TrendingUp className="w-4 h-4 mr-2" />
              SLED-f
            </TabsTrigger>
            <TabsTrigger value="builder">
              <Settings className="w-4 h-4 mr-2" />
              Builder
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hd">
            <Card className="bg-white shadow-lg">
              <CardHeader className="bg-slate-50 border-b">
                <CardTitle className="text-xl">Hemodialysis Prescription</CardTitle>
                <p className="text-sm text-slate-600 mt-1">Complete HD prescription with phases, complications, adequacy</p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Weight (kg) *</Label>
                    <Input type="number" step="0.1" value={hdWeight} onChange={(e) => setHdWeight(e.target.value)} placeholder="e.g., 25" />
                  </div>

                  <div>
                    <Label>Age (years) *</Label>
                    <Input type="number" step="0.1" value={hdAge} onChange={(e) => setHdAge(e.target.value)} placeholder="e.g., 8" />
                  </div>

                  <div>
                    <Label>Target UF (L) *</Label>
                    <Input type="number" step="0.1" value={hdTargetUF} onChange={(e) => setHdTargetUF(e.target.value)} placeholder="e.g., 1.5" />
                  </div>

                  <div>
                    <Label>Duration (hours) *</Label>
                    <Input type="number" step="0.5" value={hdSessionDuration} onChange={(e) => setHdSessionDuration(e.target.value)} placeholder="4" />
                  </div>

                  <div>
                    <Label>Serum K+ (mmol/L)</Label>
                    <Input type="number" step="0.1" value={hdSerumK} onChange={(e) => setHdSerumK(e.target.value)} placeholder="e.g., 5.8" />
                  </div>

                  <div>
                    <Label>Hemodynamics</Label>
                    <Select value={hdHemodynamics} onValueChange={setHdHemodynamics}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Stable">Stable</SelectItem>
                        <SelectItem value="Hypotensive">Hypotensive</SelectItem>
                        <SelectItem value="OnPressors">On Pressors</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Pre-Dialysis BUN (mg/dL)</Label>
                    <Input type="number" step="0.1" value={hdPreBUN} onChange={(e) => setHdPreBUN(e.target.value)} placeholder="For Kt/V" />
                  </div>

                  <div>
                    <Label>Post-Dialysis BUN (mg/dL)</Label>
                    <Input type="number" step="0.1" value={hdPostBUN} onChange={(e) => setHdPostBUN(e.target.value)} placeholder="For Kt/V" />
                  </div>
                </div>

                <Button onClick={calculateHD} className="w-full mt-6 bg-cyan-600 hover:bg-cyan-700 py-6">
                  <Calculator className="w-5 h-5 mr-2" />
                  Generate Complete HD Prescription
                </Button>

                {renderResults(hdResults)}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pd">
            <Card className="bg-white shadow-lg">
              <CardHeader className="bg-slate-50 border-b">
                <CardTitle className="text-xl">Peritoneal Dialysis</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="mb-6">
                  <Label className="mb-2 block">PD Type *</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant={pdType === "acute" ? "default" : "outline"}
                      onClick={() => setPdType("acute")}
                      className={pdType === "acute" ? "bg-red-600" : ""}
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Acute (AKI)
                    </Button>
                    <Button
                      variant={pdType === "chronic" ? "default" : "outline"}
                      onClick={() => setPdType("chronic")}
                      className={pdType === "chronic" ? "bg-cyan-600" : ""}
                    >
                      <Layers className="w-4 h-4 mr-2" />
                      Chronic (ESKD)
                    </Button>
                  </div>
                </div>

                {pdType === "acute" && (
                  <div className="mb-6 bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                    <Label className="mb-3 block font-semibold">Templates</Label>
                    <div className="grid md:grid-cols-2 gap-3">
                      {Object.entries(pdTemplates).map(([key, template]) => (
                        <Card
                          key={key}
                          className={`cursor-pointer border-2 ${
                            pdTemplate === key ? "border-blue-500 bg-blue-50" : "border-slate-200"
                          }`}
                          onClick={() => applyPDTemplate(key)}
                        >
                          <CardContent className="p-3">
                            <h4 className="font-bold text-sm mb-1">{template.name}</h4>
                            <p className="text-xs text-slate-600 mb-2">{template.description}</p>
                            <div className="flex gap-2">
                              <Badge className="text-xs">{template.fillPerKg} mL/kg</Badge>
                              <Badge className="text-xs">{template.dwellMin} min</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Weight (kg) *</Label>
                    <Input type="number" step="0.1" value={pdWeight} onChange={(e) => setPdWeight(e.target.value)} />
                  </div>

                  <div>
                    <Label>Age (years) *</Label>
                    <Input type="number" step="0.1" value={pdAge} onChange={(e) => setPdAge(e.target.value)} />
                  </div>

                  {pdType === "acute" ? (
                    <>
                      <div>
                        <Label>Indication *</Label>
                        <Select value={pdIndication} onValueChange={setPdIndication}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AKI">AKI</SelectItem>
                            <SelectItem value="FluidOverload">Fluid Overload</SelectItem>
                            <SelectItem value="Hyperkalemia">Hyperkalemia (K+ &gt;6)</SelectItem>
                            <SelectItem value="SevereAcidosis">Severe Acidosis</SelectItem>
                            <SelectItem value="Uremia">Uremia</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Urgency *</Label>
                        <Select value={pdUrgency} onValueChange={setPdUrgency}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="emergent">Emergent</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                            <SelectItem value="elective">Elective</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Hemodynamics</Label>
                        <Select value={pdHemodynamicStatus} onValueChange={setHemodynamicStatus}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Stable">Stable</SelectItem>
                            <SelectItem value="Hypotensive">Hypotensive</SelectItem>
                            <SelectItem value="OnVasopressors">On Vasopressors</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Serum K+ (mmol/L)</Label>
                        <Input type="number" step="0.1" value={pdSerumK} onChange={(e) => setPdSerumK(e.target.value)} />
                      </div>

                      <div>
                        <Label>Serum Glucose (mg/dL)</Label>
                        <Input type="number" value={pdSerumGlucose} onChange={(e) => setPdSerumGlucose(e.target.value)} />
                      </div>

                      <div>
                        <Label>Target UF (mL/24h)</Label>
                        <Input type="number" value={pdTargetUF} onChange={(e) => setPdTargetUF(e.target.value)} placeholder="Default: 50 mL/kg" />
                      </div>

                      <div className="col-span-2 space-y-2">
                        <div className="flex items-center gap-2">
                          <Checkbox id="abd" checked={pdAbdominalContraindication} onCheckedChange={setAbdominalContraindication} />
                          <Label htmlFor="abd" className="cursor-pointer">⚠️ Abdominal contraindication</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox id="perit" checked={pdPeritonitisRisk} onCheckedChange={setPeritonitisRisk} />
                          <Label htmlFor="perit" className="cursor-pointer">Suspected peritonitis</Label>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <Label>Modality *</Label>
                        <Select value={pdModality} onValueChange={setPdModality}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CAPD">CAPD</SelectItem>
                            <SelectItem value="APD">APD</SelectItem>
                            <SelectItem value="CCPD">CCPD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Exchanges/Day *</Label>
                        <Select value={pdDwells} onValueChange={setPdDwells}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="4">4</SelectItem>
                            <SelectItem value="5">5</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Dwell Time (hours) *</Label>
                        <Input type="number" step="0.5" value={pdDwellTime} onChange={(e) => setPdDwellTime(e.target.value)} />
                      </div>
                    </>
                  )}
                </div>

                <Button onClick={calculatePD} className="w-full mt-6 bg-cyan-600 hover:bg-cyan-700 py-6">
                  <Calculator className="w-5 h-5 mr-2" />
                  Generate Complete {pdType === "acute" ? "Acute" : "Chronic"} PD Prescription
                </Button>

                {renderResults(pdResults)}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="crrt">
            <Card className="bg-white shadow-lg">
              <CardHeader className="bg-slate-50 border-b">
                <CardTitle className="text-xl">CRRT Prescription</CardTitle>
                <p className="text-sm text-slate-600 mt-1">Complete CRRT with all phases and complication management</p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Weight (kg) *</Label>
                    <Input type="number" step="0.1" value={crrtWeight} onChange={(e) => setCrrtWeight(e.target.value)} />
                  </div>

                  <div>
                    <Label>Age (years) *</Label>
                    <Input type="number" step="0.1" value={crrtAge} onChange={(e) => setCrrtAge(e.target.value)} />
                  </div>

                  <div>
                    <Label>Modality *</Label>
                    <Select value={crrtModality} onValueChange={setCrrtModality}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CVVH">CVVH (Hemofiltration)</SelectItem>
                        <SelectItem value="CVVHD">CVVHD (Hemodialysis)</SelectItem>
                        <SelectItem value="CVVHDF">CVVHDF (Combined)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Target Dose (mL/kg/h) *</Label>
                    <Input type="number" value={crrtTargetDose} onChange={(e) => setCrrtTargetDose(e.target.value)} placeholder="25-35" />
                  </div>

                  <div>
                    <Label>Fluid Overload (L)</Label>
                    <Input type="number" step="0.1" value={crrtFluidOverload} onChange={(e) => setCrrtFluidOverload(e.target.value)} />
                  </div>

                  <div>
                    <Label>Serum K+ (mmol/L)</Label>
                    <Input type="number" step="0.1" value={crrtSerumK} onChange={(e) => setCrrtSerumK(e.target.value)} />
                  </div>

                  <div>
                    <Label>Hemodynamics</Label>
                    <Select value={crrtHemodynamics} onValueChange={setCrrtHemodynamics}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Stable">Stable</SelectItem>
                        <SelectItem value="Hypotensive">Hypotensive</SelectItem>
                        <SelectItem value="OnPressors">On Pressors</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={calculateCRRT} className="w-full mt-6 bg-cyan-600 hover:bg-cyan-700 py-6">
                  <Zap className="w-5 h-5 mr-2" />
                  Generate Complete CRRT Prescription
                </Button>

                {renderResults(crrtResults)}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sled">
            <Card className="bg-white shadow-lg">
              <CardHeader className="bg-slate-50 border-b">
                <CardTitle className="text-xl">SLED-f Prescription</CardTitle>
                <p className="text-sm text-slate-600 mt-1">Sustained Low-Efficiency Daily Dialysis</p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Weight (kg) *</Label>
                    <Input type="number" step="0.1" value={sledWeight} onChange={(e) => setSledWeight(e.target.value)} />
                  </div>

                  <div>
                    <Label>Age (years) *</Label>
                    <Input type="number" step="0.1" value={sledAge} onChange={(e) => setSledAge(e.target.value)} />
                  </div>

                  <div>
                    <Label>Target UF (L) *</Label>
                    <Input type="number" step="0.1" value={sledTargetUF} onChange={(e) => setSledTargetUF(e.target.value)} />
                  </div>

                  <div>
                    <Label>Duration (hours) *</Label>
                    <Input type="number" step="0.5" value={sledDuration} onChange={(e) => setSledDuration(e.target.value)} placeholder="8-12" />
                  </div>

                  <div>
                    <Label>Serum K+ (mmol/L)</Label>
                    <Input type="number" step="0.1" value={sledSerumK} onChange={(e) => setSledSerumK(e.target.value)} />
                  </div>
                </div>

                <Button onClick={calculateSLED} className="w-full mt-6 bg-cyan-600 hover:bg-cyan-700 py-6">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Generate Complete SLED-f Prescription
                </Button>

                {renderResults(sledResults)}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="builder">
            <Card className="bg-white shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
                <CardTitle className="text-xl">Manual Builder</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="mb-6">
                  <Label className="mb-2 block">Modality</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      variant={builderMode === "crrt" ? "default" : "outline"}
                      onClick={() => setBuilderMode("crrt")}
                      className={builderMode === "crrt" ? "bg-cyan-600" : ""}
                    >
                      CRRT
                    </Button>
                    <Button
                      variant={builderMode === "hd" ? "default" : "outline"}
                      onClick={() => setBuilderMode("hd")}
                      className={builderMode === "hd" ? "bg-blue-600" : ""}
                    >
                      HD
                    </Button>
                    <Button
                      variant={builderMode === "pd" ? "default" : "outline"}
                      onClick={() => setBuilderMode("pd")}
                      className={builderMode === "pd" ? "bg-purple-600" : ""}
                    >
                      PD
                    </Button>
                  </div>
                </div>

                <Button onClick={buildPrescription} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 py-6">
                  <Plus className="w-5 h-5 mr-2" />
                  Build & Copy
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}