import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ArrowLeft, 
  Pill, 
  Search, 
  Calculator, 
  AlertTriangle,
  Info
} from "lucide-react";

const drugCategories = {
  "Nephrology": [
    { drug: "Prednisolone", dose: "60 mg/m²/day", freq: "OD", indication: "Nephrotic syndrome", maxDose: "80 mg/day", renalAdj: "No", brands: "Wysolone, Omnacortil" },
    { drug: "Cyclosporine", dose: "4-5 mg/kg/day", freq: "BD", indication: "SRNS, Transplant", maxDose: "None - by levels", renalAdj: "Yes - monitor levels", brands: "Sandimmune, Panimun" },
    { drug: "Tacrolimus", dose: "0.1-0.15 mg/kg/day", freq: "BD", indication: "SRNS, Transplant", maxDose: "None - by levels", renalAdj: "Yes - monitor levels", brands: "Prograf, Pangraf" },
    { drug: "Mycophenolate", dose: "600 mg/m²/dose", freq: "BD", indication: "SRNS, Lupus, Transplant", maxDose: "1 g/dose", renalAdj: "Yes if GFR <25", brands: "CellCept, Myfenax" },
    { drug: "Furosemide", dose: "1-2 mg/kg/dose", freq: "OD-BD", indication: "Edema, Heart failure", maxDose: "6 mg/kg/day", renalAdj: "No", brands: "Lasix, Frusenex" },
    { drug: "Enalapril", dose: "0.1-0.5 mg/kg/day", freq: "OD-BD", indication: "HTN, Proteinuria", maxDose: "20 mg/day", renalAdj: "Yes - reduce 50% if GFR <30", brands: "Vasotec, Envas" },
    { drug: "Amlodipine", dose: "0.1-0.3 mg/kg/day", freq: "OD", indication: "Hypertension", maxDose: "10 mg/day", renalAdj: "No", brands: "Amlong, Norvasc" },
    { drug: "Losartan", dose: "0.7 mg/kg/day", freq: "OD", indication: "HTN, Proteinuria", maxDose: "50 mg/day", renalAdj: "No", brands: "Losar, Cozaar" },
    { drug: "Calcium Carbonate", dose: "45-65 mg/kg/day", freq: "TDS with meals", indication: "Phosphate binder", maxDose: "1500 mg/dose", renalAdj: "Monitor Ca/PO4", brands: "Shelcal, Os-Cal" },
    { drug: "Calcitriol", dose: "0.01-0.05 mcg/kg/day", freq: "OD", indication: "CKD-MBD", maxDose: "0.5 mcg/day", renalAdj: "Monitor Ca/PTH", brands: "Rocaltrol, Calcijex" },
    { drug: "Erythropoietin", dose: "50-150 units/kg/week", freq: "1-3×/week SC", indication: "Anemia of CKD", maxDose: "None", renalAdj: "No", brands: "Eprex, Wepox" },
    { drug: "Iron Sucrose", dose: "2-3 mg/kg/dose IV", freq: "Weekly", indication: "Iron deficiency in CKD", maxDose: "200 mg/dose", renalAdj: "No", brands: "Venofer" },
    { drug: "Sodium Bicarbonate", dose: "1-3 mEq/kg/day", freq: "TDS", indication: "Metabolic acidosis", maxDose: "8 g/day", renalAdj: "Monitor HCO3", brands: "NaHCO3" },
    { drug: "Kayexalate", dose: "1 g/kg/dose", freq: "Q6-12H", indication: "Hyperkalemia", maxDose: "60 g/day", renalAdj: "No", brands: "SPS, Kexxal" },
    { drug: "Sevelamer", dose: "400-800 mg with meals", freq: "TDS", indication: "Hyperphosphatemia", maxDose: "2400 mg/meal", renalAdj: "No", brands: "Renvela, Renagel" }
  ],
  "Antibiotics": [
    { drug: "Amoxicillin", dose: "20-40 mg/kg/day", freq: "TDS", indication: "OM, Sinusitis, Pharyngitis", maxDose: "500 mg/dose", renalAdj: "Yes - reduce if GFR <30", brands: "Amoxil, Moxikind" },
    { drug: "Amoxicillin-Clavulanate", dose: "45 mg/kg/day", freq: "BD", indication: "OM, Sinusitis, UTI", maxDose: "875 mg/dose", renalAdj: "Yes", brands: "Augmentin, Moxclav" },
    { drug: "Azithromycin", dose: "10 mg/kg Day 1, then 5 mg/kg", freq: "OD", indication: "CAP, Pharyngitis", maxDose: "500 mg Day 1, 250 mg", renalAdj: "No", brands: "Azithral, Azee" },
    { drug: "Ceftriaxone", dose: "50-100 mg/kg/day", freq: "OD-BD", indication: "Meningitis, Sepsis, UTI", maxDose: "2 g/day", renalAdj: "No", brands: "Monocef, Rocephin" },
    { drug: "Cefixime", dose: "8 mg/kg/day", freq: "OD-BD", indication: "Typhoid, UTI", maxDose: "400 mg/day", renalAdj: "Yes if GFR <20", brands: "Taxim-O, Cefspan" },
    { drug: "Gentamicin", dose: "5-7.5 mg/kg/day", freq: "OD", indication: "Sepsis, Peritonitis", maxDose: "None - by levels", renalAdj: "Yes - monitor levels", brands: "Gentamycin" },
    { drug: "Vancomycin", dose: "40-60 mg/kg/day", freq: "QID", indication: "MRSA, Peritonitis", maxDose: "2 g/day", renalAdj: "Yes - TDM required", brands: "Vancocin" },
    { drug: "Cotrimoxazole", dose: "8-12 mg/kg/day (TMP)", freq: "BD", indication: "PCP, UTI, MRSA", maxDose: "320 mg TMP/day", renalAdj: "Yes", brands: "Septran, Bactrim" },
    { drug: "Ciprofloxacin", dose: "20-30 mg/kg/day", freq: "BD", indication: "UTI, Typhoid", maxDose: "750 mg/dose", renalAdj: "Yes", brands: "Ciplox, Cifran" },
    { drug: "Metronidazole", dose: "30 mg/kg/day", freq: "TDS", indication: "Anaerobes, Giardia", maxDose: "500 mg/dose", renalAdj: "Yes in severe", brands: "Flagyl, Metrogyl" }
  ],
  "Antipyretics": [
    { drug: "Paracetamol", dose: "10-15 mg/kg/dose", freq: "Q4-6H", indication: "Fever, Pain", maxDose: "60 mg/kg/day", renalAdj: "Caution in severe liver disease", brands: "Crocin, Calpol, Dolo" },
    { drug: "Ibuprofen", dose: "5-10 mg/kg/dose", freq: "Q6-8H", indication: "Fever, Pain", maxDose: "40 mg/kg/day", renalAdj: "Avoid in CKD", brands: "Brufen, Ibugesic" }
  ],
  "Antiemetics": [
    { drug: "Ondansetron", dose: "0.15 mg/kg/dose", freq: "Q8H", indication: "Nausea, Vomiting", maxDose: "8 mg/dose", renalAdj: "No", brands: "Emeset, Ondem" },
    { drug: "Metoclopramide", dose: "0.1-0.2 mg/kg/dose", freq: "TDS", indication: "GI motility, Nausea", maxDose: "10 mg/dose", renalAdj: "Yes", brands: "Reglan, Perinorm" },
    { drug: "Domperidone", dose: "0.3 mg/kg/dose", freq: "TDS", indication: "Nausea, Gastroparesis", maxDose: "10 mg/dose", renalAdj: "Caution", brands: "Domstal, Motilium" }
  ],
  "Anticonvulsants": [
    { drug: "Levetiracetam", dose: "20-40 mg/kg/day", freq: "BD", indication: "Seizures", maxDose: "3000 mg/day", renalAdj: "Yes", brands: "Keppra, Levipil" },
    { drug: "Valproate", dose: "15-60 mg/kg/day", freq: "BD", indication: "Epilepsy", maxDose: "60 mg/kg/day", renalAdj: "No", brands: "Depakote, Valprol" },
    { drug: "Phenytoin", dose: "5 mg/kg/day", freq: "BD", indication: "Seizures", maxDose: "300 mg/day", renalAdj: "Monitor levels", brands: "Dilantin, Eptoin" },
    { drug: "Phenobarbital", dose: "3-6 mg/kg/day", freq: "OD-BD", indication: "Neonatal seizures", maxDose: "200 mg/day", renalAdj: "Yes", brands: "Luminal, Gardenal" }
  ],
  "Steroids": [
    { drug: "Prednisolone", dose: "1-2 mg/kg/day", freq: "OD", indication: "Anti-inflammatory", maxDose: "60 mg/day", renalAdj: "No", brands: "Wysolone, Omnacortil" },
    { drug: "Methylprednisolone", dose: "30 mg/kg IV", freq: "Pulse", indication: "RPGN, Lupus nephritis", maxDose: "1 g/dose", renalAdj: "No", brands: "Solu-Medrol" },
    { drug: "Hydrocortisone", dose: "10-20 mg/m²/day", freq: "TDS", indication: "Adrenal insufficiency", maxDose: "100 mg/day", renalAdj: "No", brands: "Cortef, Solu-Cortef" },
    { drug: "Budesonide", dose: "0.25-1 mg BD", freq: "BD inhaled", indication: "Asthma", maxDose: "1 mg BD", renalAdj: "No", brands: "Pulmicort, Budecort" }
  ],
  "Immunosuppressants": [
    { drug: "Cyclophosphamide", dose: "2-2.5 mg/kg/day", freq: "OD", indication: "SRNS, Lupus, Vasculitis", maxDose: "200 mg/day", renalAdj: "Yes", brands: "Cytoxan, Endoxan" },
    { drug: "Azathioprine", dose: "1-3 mg/kg/day", freq: "OD", indication: "Transplant, GN", maxDose: "200 mg/day", renalAdj: "Yes", brands: "Imuran, Azoran" },
    { drug: "Rituximab", dose: "375 mg/m² IV", freq: "Weekly ×4", indication: "SDNS/SRNS, Lupus", maxDose: "None - by protocol", renalAdj: "No", brands: "Mabthera, Ristova" },
    { drug: "Levamisole", dose: "2.5 mg/kg", freq: "Alternate days", indication: "FRNS steroid-sparing", maxDose: "150 mg/dose", renalAdj: "No", brands: "Ergamisol" }
  ]
};

export default function DrugDosing() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [weight, setWeight] = useState("");
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [calculatedDose, setCalculatedDose] = useState(null);

  const allDrugs = Object.entries(drugCategories).flatMap(([category, drugs]) =>
    drugs.map(drug => ({ ...drug, category }))
  );

  const categories = ["All", ...Object.keys(drugCategories)];

  const filteredDrugs = allDrugs.filter(drug => {
    const matchesSearch = drug.drug.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         drug.indication.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         drug.brands.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || drug.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCalculate = (drug) => {
    if (!weight) {
      alert("Please enter patient weight first");
      return;
    }

    const wt = parseFloat(weight);
    let doseText = drug.dose;
    let calculatedValue = "";

    // Parse dose and calculate
    if (doseText.includes("mg/kg/day")) {
      const mgPerKg = parseFloat(doseText);
      const totalMg = mgPerKg * wt;
      
      let perDose = totalMg;
      if (drug.freq === "BD") perDose = totalMg / 2;
      else if (drug.freq === "TDS") perDose = totalMg / 3;
      else if (drug.freq === "QID") perDose = totalMg / 4;

      calculatedValue = `${totalMg.toFixed(1)} mg/day (${perDose.toFixed(1)} mg per dose)`;
    } else if (doseText.includes("mg/m²")) {
      // Estimate BSA (Mosteller) - need height, using approximation
      const approxBSA = Math.sqrt((wt * 100) / 3600); // Rough estimate
      const mgPerM2 = parseFloat(doseText);
      const totalMg = mgPerM2 * approxBSA;
      calculatedValue = `~${totalMg.toFixed(1)} mg/day (BSA ~${approxBSA.toFixed(2)} m²)`;
    } else {
      calculatedValue = "See dose calculator for accurate calculation";
    }

    setSelectedDrug(drug);
    setCalculatedDose(calculatedValue);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        <Link to={createPageUrl("Hub")}>
          <Button variant="outline" className="mb-3">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>

        <div className="mb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow-lg">
              <Pill className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Drug Dosing Reference</h1>
              <p className="text-xs text-slate-600">Quick dosing guide with calculator</p>
            </div>
          </div>

          {/* Quick Patient Details */}
          <Card className="bg-white border-2 border-blue-200 mb-3">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Patient Weight (kg)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="Enter weight for instant dose"
                    className="text-sm"
                  />
                </div>
                <Link to={createPageUrl("DoseCalculator")}>
                  <Button variant="outline" size="sm" className="mt-5">
                    <Calculator className="w-4 h-4 mr-1" />
                    Full Calculator
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Calculated Dose Display */}
          {calculatedDose && selectedDrug && (
            <Alert className="bg-green-50 border-green-200 mb-3">
              <Calculator className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-sm text-green-800">
                <strong>{selectedDrug.drug}:</strong> {calculatedDose} ({selectedDrug.freq})
                <br />
                <span className="text-xs">{selectedDrug.indication} | Max: {selectedDrug.maxDose}</span>
              </AlertDescription>
            </Alert>
          )}

          {/* Filters */}
          <div className="grid md:grid-cols-2 gap-2 mb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search drug, indication, or brand..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Compact Drug Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredDrugs.map((drug, idx) => (
            <Card key={idx} className="bg-white border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-sm font-bold text-slate-900">{drug.drug}</CardTitle>
                    <Badge className="mt-1 text-xs bg-green-100 text-green-800 border-green-300">
                      {drug.category}
                    </Badge>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleCalculate(drug)}
                    disabled={!weight}
                    className="ml-2"
                  >
                    <Calculator className="w-3 h-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Dose:</span>
                    <span className="font-semibold text-slate-900">{drug.dose}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Frequency:</span>
                    <span className="font-semibold text-slate-900">{drug.freq}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Max:</span>
                    <span className="font-semibold text-slate-900">{drug.maxDose}</span>
                  </div>
                  <div className="pt-1 border-t border-slate-100">
                    <div className="text-slate-600 mb-0.5">Indication:</div>
                    <div className="font-medium text-slate-800">{drug.indication}</div>
                  </div>
                  <div className="pt-1">
                    <div className="text-slate-600 mb-0.5">Brands:</div>
                    <div className="text-slate-700">{drug.brands}</div>
                  </div>
                  {drug.renalAdj !== "No" && (
                    <Alert className="mt-2 bg-amber-50 border-amber-200 p-2">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      <AlertDescription className="text-xs text-amber-800">
                        <strong>Renal:</strong> {drug.renalAdj}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredDrugs.length === 0 && (
          <Card className="bg-white border border-slate-200">
            <CardContent className="p-8 text-center">
              <Info className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600">No drugs found matching your criteria</p>
            </CardContent>
          </Card>
        )}

        <Alert className="mt-4 bg-amber-50 border-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <AlertDescription className="text-xs text-amber-800">
            <strong>Important:</strong> Doses are indicative. Always verify with detailed dose calculator, check drug interactions, 
            patient-specific factors, and institutional protocols. Adjust for renal/hepatic impairment as indicated.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}