import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import CalculatorShell from "../components/calculators/CalculatorShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Search, Pill, AlertTriangle, Info, Check } from "lucide-react";
import { usePatient } from "../components/PatientContext";

export default function DoseCalculator() {
  const { patientData, updatePatientData } = usePatient();
  
  const [weight, setWeight] = useState(patientData.weight || "");
  const [age, setAge] = useState(patientData.age || "");
  const [eGFR, setEGFR] = useState("");
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const { data: drugs = [] } = useQuery({
    queryKey: ['drugs'],
    queryFn: () => base44.entities.Drug.list('generic_name'),
    initialData: []
  });

  React.useEffect(() => {
    setWeight(patientData.weight || weight);
    setAge(patientData.age || age);
  }, [patientData]);

  const filteredDrugs = searchQuery 
    ? drugs.filter(drug =>
        drug.generic_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        drug.brands_indian?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        drug.therapeutic_class?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        drug.category?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : drugs;

  const getFrequencyFactor = (freq) => {
    if (!freq) return 1;
    if (freq.includes('OD') || freq.includes('once')) return 1;
    if (freq.includes('BID') || freq.includes('twice')) return 2;
    if (freq.includes('TID') || freq.includes('three')) return 3;
    if (freq.includes('QID') || freq.includes('four')) return 4;
    if (freq.includes('Q6H')) return 4;
    if (freq.includes('Q8H')) return 3;
    if (freq.includes('Q12H')) return 2;
    return 1;
  };

  const checkMaxDose = (calculatedDose, maxDoseStr) => {
    if (!maxDoseStr || !calculatedDose) return { exceeded: false };
    
    const calcMatch = calculatedDose.match(/([\d.]+)/);
    const maxMatch = maxDoseStr.match(/([\d.]+)/);
    
    if (calcMatch && maxMatch) {
      const calc = parseFloat(calcMatch[1]);
      const max = parseFloat(maxMatch[1]);
      if (calc > max) {
        return { exceeded: true, cappedDose: `${max} ${maxDoseStr.match(/[a-zA-Z]+/)?.[0] || ""}` };
      }
    }
    return { exceeded: false };
  };

  const calculateDose = (drug, weight, age, gfr) => {
    let recommendedDose = "";
    let frequency = drug.frequency || "As directed";
    let route = drug.route || "PO";
    let calculationDetails = "";

    if (!drug.dose_weight_based) {
      recommendedDose = "See clinical guidelines";
      calculationDetails = "Dosing information not available in database";
      return { recommendedDose, frequency, route, calculationDetails };
    }

    if (drug.dose_calculation_type === "TDM") {
      recommendedDose = "Dose by therapeutic drug monitoring (TDM)";
      calculationDetails = `${drug.generic_name} requires TDM-guided dosing.\nStarting dose: ${drug.dose_weight_based}\nDose adjustment based on measured drug levels.\nTarget levels: ${drug.monitoring || "Per protocol"}`;
      return { recommendedDose, frequency, route, calculationDetails };
    }

    if (drug.dose_calculation_type === "fixed" || drug.dose_age_based) {
      recommendedDose = drug.dose_age_based || drug.dose_weight_based;
      calculationDetails = `Fixed or age-based dosing:\n${recommendedDose}`;
      return { recommendedDose, frequency, route, calculationDetails };
    }

    const doseRange = drug.dose_weight_based.match(/([\d.]+)(?:-)?([\d.]+)?\s*(\w+)\/kg/);
    
    if (doseRange) {
      const minDose = parseFloat(doseRange[1]);
      const maxDose = doseRange[2] ? parseFloat(doseRange[2]) : minDose;
      const unit = doseRange[3];

      if (drug.dose_calculation_type === "per_dose") {
        const calcMin = (minDose * weight).toFixed(1);
        const calcMax = doseRange[2] ? (maxDose * weight).toFixed(1) : calcMin;
        recommendedDose = doseRange[2] ? `${calcMin}-${calcMax} ${unit} per dose` : `${calcMin} ${unit} per dose`;
        calculationDetails = `Dose: ${minDose}${doseRange[2] ? `-${maxDose}` : ""} ${unit}/kg/dose\nFor ${weight} kg: ${recommendedDose}\nFrequency: ${frequency}\nTotal daily dose: ${(parseFloat(calcMax) * getFrequencyFactor(frequency)).toFixed(1)} ${unit}/day (approx)`;
      } else if (drug.dose_calculation_type === "per_day") {
        const dailyMin = (minDose * weight).toFixed(1);
        const dailyMax = doseRange[2] ? (maxDose * weight).toFixed(1) : dailyMin;
        const freqFactor = getFrequencyFactor(frequency);
        const perDoseMin = (parseFloat(dailyMin) / freqFactor).toFixed(1);
        const perDoseMax = doseRange[2] ? (parseFloat(dailyMax) / freqFactor).toFixed(1) : perDoseMin;
        
        recommendedDose = doseRange[2] ? `${perDoseMin}-${perDoseMax} ${unit} per dose` : `${perDoseMin} ${unit} per dose`;
        calculationDetails = `Total daily dose: ${minDose}${doseRange[2] ? `-${maxDose}` : ""} ${unit}/kg/day\nFor ${weight} kg: ${dailyMin}${doseRange[2] ? `-${dailyMax}` : ""} ${unit}/day\nFrequency: ${frequency} (${freqFactor}x/day)\nPer dose: ${recommendedDose}`;
      } else if (drug.dose_calculation_type === "per_week") {
        const weeklyDose = (minDose * weight).toFixed(1);
        recommendedDose = `${weeklyDose} ${unit} per week`;
        calculationDetails = `Weekly dose: ${minDose} ${unit}/kg/week\nFor ${weight} kg: ${weeklyDose} ${unit}/week\nDivide per frequency: ${frequency}`;
      }
    } else {
      recommendedDose = drug.dose_weight_based;
      calculationDetails = `Dosing: ${drug.dose_weight_based}\nSee clinical notes for specific calculation.`;
    }

    const maxCheck = checkMaxDose(recommendedDose, drug.max_dose_per_day);
    if (maxCheck.exceeded) {
      recommendedDose = `${maxCheck.cappedDose} (capped at max)`;
      calculationDetails += `\n\n⚠️ Calculated dose exceeds maximum. Capped at: ${drug.max_dose_per_day}`;
    }

    return { recommendedDose, frequency, route, calculationDetails };
  };

  const handleCalculate = () => {
    const weightNum = parseFloat(weight);
    const ageNum = parseFloat(age);
    const gfr = parseFloat(eGFR);

    if (!selectedDrug || !weightNum) {
      return;
    }

    setLoading(true);

    const dose = calculateDose(selectedDrug, weightNum, ageNum, gfr);
    
    const safetyAlerts = [];
    let safetyLevel = "safe";

    if (selectedDrug.renal_adjust && selectedDrug.renal_adjust.toLowerCase().includes('avoid') && gfr && gfr < 30) {
      safetyAlerts.push({
        severity: "critical",
        title: "CONTRAINDICATED in Severe Renal Impairment",
        message: `${selectedDrug.generic_name}: ${selectedDrug.renal_adjust}`
      });
      safetyLevel = "critical";
    } else if (selectedDrug.renal_adjust && selectedDrug.renal_adjust.toLowerCase().includes('reduce') && (!eGFR || gfr < 60)) {
      safetyAlerts.push({
        severity: "warning",
        title: "Renal Dose Adjustment Required",
        message: `eGFR ${gfr || "not provided"}. ${selectedDrug.renal_adjust}`
      });
      safetyLevel = safetyLevel === "critical" ? "critical" : "caution";
    }

    if (selectedDrug.dose_calculation_type === "TDM") {
      safetyAlerts.push({
        severity: "warning",
        title: "Therapeutic Drug Monitoring Required",
        message: `${selectedDrug.generic_name} requires TDM-guided dosing. Check target levels: ${selectedDrug.monitoring || "per protocol"}`
      });
      safetyLevel = safetyLevel === "critical" ? "critical" : "caution";
    }

    if (selectedDrug.key_interactions) {
      safetyAlerts.push({
        severity: "warning",
        title: "Drug Interactions",
        message: selectedDrug.key_interactions
      });
    }

    const calculationTrace = [
      `PATIENT PARAMETERS:`,
      `Weight: ${weightNum} kg`,
      ageNum ? `Age: ${ageNum} years` : "",
      gfr ? `eGFR: ${gfr} mL/min/1.73m²` : "",
      ``,
      `DRUG: ${selectedDrug.generic_name}`,
      `Category: ${selectedDrug.category}`,
      `Class: ${selectedDrug.therapeutic_class}`,
      `Indian Brands: ${selectedDrug.brands_indian}`,
      ``,
      `DOSING CALCULATION:`,
      `Type: ${selectedDrug.dose_calculation_type}`,
      `Base dose: ${selectedDrug.dose_weight_based}`,
      selectedDrug.dose_age_based ? `Age-based: ${selectedDrug.dose_age_based}` : "",
      `Frequency: ${selectedDrug.frequency}`,
      `Max/day: ${selectedDrug.max_dose_per_day}`,
      `Route: ${selectedDrug.route}`,
      ``,
      dose.calculationDetails,
      ``,
      `RECOMMENDED DOSE: ${dose.recommendedDose}`,
      `FREQUENCY: ${dose.frequency}`,
      `ROUTE: ${dose.route}`,
      ``,
      `AVAILABLE FORMULATIONS:`,
      ...(selectedDrug.formulations?.map(f => 
        `• ${f.form}: ${f.strength} ${f.pack_info ? `(${f.pack_info})` : ""}`
      ) || ["Consult formulary"]),
      ``,
      gfr ? `RENAL ADJUSTMENT (eGFR ${gfr}):` : `RENAL ADJUSTMENT:`,
      selectedDrug.renal_adjust || "No adjustment needed",
      selectedDrug.hd_adjust ? `HD: ${selectedDrug.hd_adjust}` : "",
      selectedDrug.pd_adjust ? `PD: ${selectedDrug.pd_adjust}` : "",
      ``,
      `MONITORING: ${selectedDrug.monitoring || "Standard clinical monitoring"}`,
      ``,
      selectedDrug.contraindications ? `CONTRAINDICATIONS: ${selectedDrug.contraindications}` : "",
      selectedDrug.adverse_effects ? `\nADVERSE EFFECTS: ${selectedDrug.adverse_effects}` : "",
      selectedDrug.key_interactions ? `\nDRUG INTERACTIONS: ${selectedDrug.key_interactions}` : "",
      selectedDrug.clinical_pearls ? `\nCLINICAL PEARLS: ${selectedDrug.clinical_pearls}` : ""
    ].filter(line => line !== "");

    const prescriptionText = `
MEDICATION PRESCRIPTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PATIENT: ${weightNum} kg${ageNum ? `, ${ageNum} years` : ""}${gfr ? `, eGFR ${gfr} mL/min/1.73m²` : ""}

DRUG: ${selectedDrug.generic_name}
Brand Names: ${selectedDrug.brands_indian}
Class: ${selectedDrug.therapeutic_class}
Indication: ${selectedDrug.indications}

PRESCRIPTION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${dose.recommendedDose}
Frequency: ${dose.frequency}
Route: ${dose.route}
Duration: As clinically indicated

FORMULATIONS AVAILABLE IN INDIA:
${selectedDrug.formulations?.map(f => `• ${f.form}: ${f.strength} ${f.pack_info ? `(${f.pack_info})` : ""}`).join('\n') || "Consult formulary"}

${gfr ? `\nRENAL DOSING (eGFR ${gfr}):\n${selectedDrug.renal_adjust || "No adjustment"}\n` : ""}
MONITORING: ${selectedDrug.monitoring || "Standard"}

${selectedDrug.contraindications ? `⚠️ CONTRAINDICATIONS: ${selectedDrug.contraindications}\n` : ""}
${selectedDrug.key_interactions ? `⚠️ DRUG INTERACTIONS: ${selectedDrug.key_interactions}\n` : ""}
${selectedDrug.adverse_effects ? `ADVERSE EFFECTS: ${selectedDrug.adverse_effects}\n` : ""}

${selectedDrug.clinical_pearls ? `💡 CLINICAL PEARLS:\n${selectedDrug.clinical_pearls}\n` : ""}

References: ${selectedDrug.references || "IAP Drug Formulary 2024, Harriet Lane 23e"}

Prescriber: ___________________
Date: ${new Date().toLocaleDateString()}
    `.trim();

    setResults({
      safetyLevel,
      primaryResults: [
        { label: "Drug", value: selectedDrug.generic_name, subtext: selectedDrug.therapeutic_class },
        { label: "Recommended Dose", value: dose.recommendedDose, subtext: dose.frequency },
        { label: "Route", value: dose.route, subtext: selectedDrug.route },
        { label: "Monitoring", value: selectedDrug.dose_calculation_type === "TDM" ? "TDM Required" : "Standard", subtext: selectedDrug.monitoring ? selectedDrug.monitoring.substring(0, 50) + "..." : "" }
      ],
      safetyAlerts: safetyAlerts.length > 0 ? safetyAlerts : undefined,
      calculationTrace,
      additionalInfo: {
        "Brand Names (India)": selectedDrug.brands_indian || "Generic only",
        "Formulations": selectedDrug.formulations?.map(f => `${f.form} ${f.strength}`).join(', ') || "See formulary",
        "Contraindications": selectedDrug.contraindications || "None specific",
        "Key Interactions": selectedDrug.key_interactions || "Consult interaction database",
        "Adverse Effects": selectedDrug.adverse_effects || "See package insert",
        "Clinical Pearls": selectedDrug.clinical_pearls || "Standard use"
      },
      prescriptionText,
      references: [selectedDrug.references || "IAP Drug Formulary 2024, Harriet Lane 23e"]
    });

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Pediatric Dose Calculator</h1>
          <p className="text-slate-600">Weight-based dosing with renal adjustments - 50+ drugs with Indian formulations</p>
        </div>

        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <Info className="w-4 h-4 text-blue-600" />
          <AlertDescription className="text-blue-800 text-sm">
            <strong>Search easily:</strong> Type any drug name, brand, or class below. Patient data from Quick Entry will auto-fill.
          </AlertDescription>
        </Alert>

        <Card className="mb-6 bg-white shadow-xl border-2 border-slate-200">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Search className="w-6 h-6 text-purple-600" />
              Search & Select Drug
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-slate-400" />
              <Input
                type="text"
                placeholder="Search drug by name, brand, or class (e.g., Amlodipine, Lasix, ACE inhibitor)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-14 pr-6 py-7 text-lg border-2 focus:border-purple-500 rounded-xl shadow-sm"
              />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-2">
              {filteredDrugs.map((drug) => (
                <Card
                  key={drug.id}
                  className={`cursor-pointer transition-all hover:shadow-lg border-2 ${
                    selectedDrug?.id === drug.id ? "border-purple-500 bg-purple-50 shadow-lg" : "border-slate-200 hover:border-purple-300"
                  }`}
                  onClick={() => {
                    setSelectedDrug(drug);
                    setSearchQuery("");
                    setResults(null);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <Pill className={`w-6 h-6 flex-shrink-0 ${selectedDrug?.id === drug.id ? 'text-purple-600' : 'text-slate-400'}`} />
                      {drug.renal_adjust?.toLowerCase().includes('avoid') && (
                        <Badge className="bg-red-100 text-red-800 text-xs flex-shrink-0">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Renal
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-900 text-base mb-1">{drug.generic_name}</h3>
                    <p className="text-xs text-slate-600 mb-2 line-clamp-1">{drug.brands_indian || "Generic"}</p>
                    <div className="flex gap-1.5 flex-wrap">
                      <Badge className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5">{drug.therapeutic_class}</Badge>
                      <Badge className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5">{drug.category}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredDrugs.length === 0 && (
                <div className="col-span-full text-center py-12 text-slate-500">
                  No drugs found
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {selectedDrug && (
          <Card className="mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-300 shadow-lg">
            <CardHeader className="bg-purple-100 border-b border-purple-200">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Pill className="w-8 h-8 text-purple-600 mt-1" />
                  <div>
                    <CardTitle className="text-xl text-purple-900">{selectedDrug.generic_name}</CardTitle>
                    <p className="text-sm text-purple-700 mb-2">{selectedDrug.brands_indian || "Generic"}</p>
                    <div className="flex gap-2">
                      <Badge className="bg-purple-600 text-white">{selectedDrug.therapeutic_class}</Badge>
                      <Badge className="bg-indigo-600 text-white">{selectedDrug.category}</Badge>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedDrug(null);
                    setResults(null);
                  }}
                  className="border-purple-300"
                >
                  Change Drug
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {selectedDrug.indications && (
                <div className="bg-white p-4 rounded-lg border-2 border-purple-200">
                  <p className="text-sm text-purple-900">
                    <strong>Indications:</strong> {selectedDrug.indications}
                  </p>
                </div>
              )}

              {selectedDrug.formulations?.length > 0 && (
                <div className="bg-white p-4 rounded-lg border-2 border-indigo-200">
                  <h4 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Available Formulations in India:
                  </h4>
                  <div className="space-y-2">
                    {selectedDrug.formulations.map((form, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                        <Badge className="bg-indigo-100 text-indigo-800 flex-shrink-0">{form.form}</Badge>
                        <span><strong>{form.strength}</strong> {form.pack_info && `— ${form.pack_info}`}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedDrug.clinical_pearls && (
                <div className="bg-amber-50 p-4 rounded-lg border-2 border-amber-200">
                  <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                    💡 Clinical Pearl
                  </h4>
                  <p className="text-sm text-amber-800">{selectedDrug.clinical_pearls}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {selectedDrug && (
          <Card className="mb-6 bg-white shadow-lg">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle>Patient Parameters</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>Weight (kg) * {patientData.weight && <Badge className="ml-2 bg-green-100 text-green-800 text-xs">Pre-filled</Badge>}</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="e.g., 25"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Age (years) {patientData.age && <Badge className="ml-2 bg-green-100 text-green-800 text-xs">Pre-filled</Badge>}</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g., 8"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>eGFR (mL/min/1.73m²) {selectedDrug.renal_adjust && <span className="text-red-600">*</span>}</Label>
                  <Input
                    type="number"
                    value={eGFR}
                    onChange={(e) => setEGFR(e.target.value)}
                    placeholder="e.g., 90"
                    className="mt-1"
                  />
                  {selectedDrug.renal_adjust?.toLowerCase().includes('adjust') && (
                    <p className="text-xs text-red-600 mt-1">⚠️ Renal dose adjustment required</p>
                  )}
                </div>
              </div>

              <Button
                onClick={handleCalculate}
                disabled={!selectedDrug || !weight || loading}
                className="w-full mt-6 bg-purple-600 hover:bg-purple-700 py-6 text-lg font-semibold shadow-lg"
              >
                Calculate Dose
              </Button>
            </CardContent>
          </Card>
        )}

        {results && (
          <CalculatorShell
            title=""
            description=""
            results={results}
            loading={loading}
            onCopyPrescription={() => {
              navigator.clipboard.writeText(results.prescriptionText);
              alert("Prescription copied to clipboard!");
            }}
          />
        )}
      </div>
    </div>
  );
}