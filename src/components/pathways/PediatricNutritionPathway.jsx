import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Leaf, Calculator, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { toast } from "sonner";

// ICMR 2020 RDA / IAP Nutritional Requirements
const ICMR_RDA = [
  { group: "0–6 months (breastfed)", energy: 108, protein: "Breast milk adequate", calcium: 500, iron: 0, vitD: 400, vitA: 350, iodine: 90 },
  { group: "6–12 months", energy: 80, protein: "1.6 g/kg", calcium: 500, iron: 9, vitD: 400, vitA: 350, iodine: 90 },
  { group: "1–3 years", energy: 83, protein: "12.5 g/day", calcium: 600, iron: 9, vitD: 600, vitA: 400, iodine: 90 },
  { group: "4–6 years", energy: 71, protein: "16 g/day", calcium: 600, iron: 13, vitD: 600, vitA: 400, iodine: 90 },
  { group: "7–9 years", energy: 66, protein: "23 g/day", calcium: 600, iron: 16, vitD: 600, vitA: 600, iodine: 120 },
  { group: "10–12 years (Boys)", energy: 66, protein: "32 g/day", calcium: 800, iron: 21, vitD: 600, vitA: 600, iodine: 150 },
  { group: "10–12 years (Girls)", energy: 57, protein: "33 g/day", calcium: 800, iron: 27, vitD: 600, vitA: 600, iodine: 150 },
  { group: "13–15 years (Boys)", energy: 55, protein: "45 g/day", calcium: 800, iron: 32, vitD: 600, vitA: 600, iodine: 150 },
  { group: "13–15 years (Girls)", energy: 50, protein: "40 g/day", calcium: 800, iron: 27, vitD: 600, vitA: 600, iodine: 150 },
];

const COMPLEMENTARY_FEEDING = [
  { age: "Birth–6 months", recommendation: "Exclusive breastfeeding — NO water, formula, or solids", emphasis: "EBF protects against infection, allergy, obesity. WHO/IAP/NHM mandated." },
  { age: "6 months", recommendation: "Start complementary feeding with continued breastfeeding", emphasis: "Begin with single-grain cereals: rice, ragi. Soft, pureed. Start 1–2 tsp, increase gradually." },
  { age: "6–8 months", recommendation: "Pureed/mashed foods 2–3 times/day", emphasis: "Rice + dal khichdi, mashed banana, curd, ragi porridge. Avoid honey, salt, sugar." },
  { age: "8–12 months", recommendation: "Chopped soft foods 3–4 times/day + 1–2 snacks", emphasis: "Family foods mashed. Egg yolk, paneer, soft chicken. Iron-rich foods essential." },
  { age: "12–24 months", recommendation: "Family foods, 3 main meals + 2 snacks", emphasis: "Continue breastfeeding up to 2 years. Cow milk can start at 12 months." },
  { age: ">2 years", recommendation: "Balanced diet with all food groups", emphasis: "Avoid ultra-processed food. Screen time <1h. Eat together as family." },
];

const DEFICIENCY_GUIDE = [
  { 
    nutrient: "Iron Deficiency Anemia",
    symptoms: ["Pallor (palm, conjunctiva, tongue)", "Fatigue, reduced activity", "Poor appetite, pica", "Recurrent infections", "Growth faltering"],
    causes: ["Exclusive cow milk diet", "Low meat/legume intake", "Hookworm/malaria", "Prematurity (low stores)", "Exclusive breastfeeding >6m without complementary iron"],
    treatment: ["Elemental iron 3–6 mg/kg/day (therapeutic)", "Duration: 3 months after Hb normalization", "Vit C with iron (amla juice)", "IAP recommends iron at 6m for breastfed infants (1 mg/kg/day)"],
    sources: ["Jaggery (gud)", "Green leafy (palak, methi)", "Liver, egg yolk", "Ragi, jowar", "Legumes (rajma, chana)", "Fortified foods"]
  },
  {
    nutrient: "Vitamin D Deficiency / Rickets",
    symptoms: ["Bowing of legs", "Delayed dentition", "Craniotabes (infant)", "Hypocalcemia, tetany", "Growth failure", "Rachitic rosary"],
    causes: ["Exclusive breastfeeding without supplementation", "Dark skin + low sun exposure", "Vegetarian/vegan diet", "Malabsorption", "CKD (renal osteodystrophy)"],
    treatment: ["Supplementation 1000–2000 IU/day (maintenance)", "Rickets: 2000–4000 IU/day × 12 weeks (ESPGHAN)", "Stoss therapy: 300,000–600,000 IU single dose (IAP)", "Calcium 500–1000 mg/day alongside Vit D"],
    sources: ["Sunlight: 15–20 min/day (arms/legs, midday)", "Fatty fish (mackerel, sardine)", "Egg yolk", "Fortified milk/cereals", "Cod liver oil (1 tsp = 1360 IU Vit D)"]
  },
  {
    nutrient: "Zinc Deficiency",
    symptoms: ["Growth stunting", "Recurrent diarrhea/infections", "Poor wound healing", "Dermatitis, alopecia", "Hypogeusia (altered taste)"],
    causes: ["Low dietary intake (phytate-rich diet)", "Malabsorption", "Prematurity", "Acrodermatitis enteropathica (genetic)"],
    treatment: ["Therapeutic: 1–2 mg/kg/day elemental zinc × 2–3 months", "Diarrhea supplementation: 10–20 mg/day × 14 days (WHO)"],
    sources: ["Red meat, poultry", "Shellfish (oysters highest)", "Legumes (after soaking to reduce phytate)", "Nuts, seeds", "Fortified cereals"]
  },
  {
    nutrient: "Vitamin A Deficiency",
    symptoms: ["Night blindness (first sign)", "Bitot's spots", "Xerophthalmia", "Frequent respiratory/GI infections", "Growth retardation"],
    causes: ["Low intake of yellow/orange/green vegetables", "Measles (depletes stores)", "Fat malabsorption", "Exclusive breastfeeding without maternal supplementation"],
    treatment: ["NHM Vit A supplementation: 1 lakh IU at 9m, 2 lakh IU 6-monthly (1–5y)", "Therapeutic: 200,000 IU day 1, 2 and at 2 weeks (WHO protocol)"],
    sources: ["Egg yolk, liver", "Carrot, pumpkin, sweet potato", "Mango, papaya", "Dark green leafy (spinach, methi)", "Fortified milk/margarine"]
  },
];

export default function PediatricNutritionPathway() {
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [rdaResult, setRdaResult] = useState(null);
  const [activeDeficiency, setActiveDeficiency] = useState(null);

  const calcRDA = () => {
    if (!weight || !age) { toast.error("Enter weight and age"); return; }
    const w = parseFloat(weight);
    const a = parseFloat(age);
    
    // Energy per ICMR 2020
    let energyPerKg, proteinPerKg;
    if (a < 0.5) { energyPerKg = 108; proteinPerKg = 2.2; }
    else if (a < 1) { energyPerKg = 98; proteinPerKg = 1.6; }
    else if (a < 4) { energyPerKg = 83; proteinPerKg = 1.1; }
    else if (a < 7) { energyPerKg = 71; proteinPerKg = 1.0; }
    else if (a < 10) { energyPerKg = 66; proteinPerKg = 1.0; }
    else if (a < 13) { energyPerKg = gender === "Male" ? 66 : 57; proteinPerKg = 0.95; }
    else { energyPerKg = gender === "Male" ? 55 : 50; proteinPerKg = 0.85; }
    
    const energy = Math.round(w * energyPerKg);
    const protein = Math.round(w * proteinPerKg * 10) / 10;
    const carbsG = Math.round((energy * 0.55) / 4);
    const fatG = Math.round((energy * 0.30) / 9);
    
    // Iron
    let iron;
    if (a < 0.5) iron = 0;
    else if (a < 1) iron = 9;
    else if (a < 4) iron = 9;
    else if (a < 7) iron = 13;
    else if (a < 10) iron = 16;
    else if (a < 13) iron = gender === "Male" ? 21 : 27;
    else iron = gender === "Male" ? 32 : 27;
    
    const calcium = a < 1 ? 500 : a < 10 ? 600 : 800;
    const vitD = a < 1 ? 400 : 600;
    
    setRdaResult({ energy, protein, carbsG, fatG, iron, calcium, vitD, energyPerKg });
  };

  return (
    <div className="space-y-6">
      <Alert className="bg-green-50 border-green-200">
        <Leaf className="w-5 h-5 text-green-600" />
        <AlertDescription className="text-green-800">
          <strong>ICMR 2020 / IAP Pediatric Nutrition Guidelines:</strong> Based on Indian Recommended Dietary Allowances. Adapted for Indian dietary practices and food availability.
        </AlertDescription>
      </Alert>

      {/* RDA Calculator */}
      <Card className="bg-white shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 border-b">
          <CardTitle className="text-base flex items-center gap-2">
            <Calculator className="w-5 h-5 text-green-600" />Nutritional Requirements Calculator (ICMR 2020)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div>
              <Label className="text-xs font-semibold">Age (years)</Label>
              <Input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="e.g. 5" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs font-semibold">Weight (kg)</Label>
              <Input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 18" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs font-semibold">Gender</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={calcRDA} className="bg-green-600 hover:bg-green-700 w-full">
            <Calculator className="w-4 h-4 mr-2" />Calculate Daily Requirements
          </Button>

          {rdaResult && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Energy", value: `${rdaResult.energy} kcal`, sub: `(${rdaResult.energyPerKg} kcal/kg)`, color: "bg-green-50 border-green-200" },
                { label: "Protein", value: `${rdaResult.protein} g`, sub: "ICMR RDA", color: "bg-blue-50 border-blue-200" },
                { label: "Carbohydrates", value: `${rdaResult.carbsG} g`, sub: "55% of energy", color: "bg-amber-50 border-amber-200" },
                { label: "Fat", value: `${rdaResult.fatG} g`, sub: "30% of energy", color: "bg-orange-50 border-orange-200" },
                { label: "Iron", value: `${rdaResult.iron} mg`, sub: "ICMR 2020", color: "bg-red-50 border-red-200" },
                { label: "Calcium", value: `${rdaResult.calcium} mg`, sub: "ICMR 2020", color: "bg-teal-50 border-teal-200" },
                { label: "Vitamin D", value: `${rdaResult.vitD} IU`, sub: "IAP 2022", color: "bg-yellow-50 border-yellow-200" },
              ].map(item => (
                <div key={item.label} className={`p-2 rounded-lg border text-center ${item.color}`}>
                  <div className="text-xs text-slate-500 mb-1">{item.label}</div>
                  <div className="font-bold text-sm">{item.value}</div>
                  <div className="text-xs text-slate-400">{item.sub}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ICMR RDA Table */}
      <Card className="bg-white shadow-lg">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-base">ICMR 2020 RDA Reference Table</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="bg-slate-100">
                <th className="p-2 text-left">Age Group</th>
                <th className="p-2">Energy<br/>(kcal/kg)</th>
                <th className="p-2">Protein</th>
                <th className="p-2">Calcium<br/>(mg)</th>
                <th className="p-2">Iron<br/>(mg)</th>
                <th className="p-2">Vit D<br/>(IU)</th>
              </tr></thead>
              <tbody>
                {ICMR_RDA.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                    <td className="p-2 font-medium">{row.group}</td>
                    <td className="p-2 text-center">{row.energy}</td>
                    <td className="p-2 text-center">{row.protein}</td>
                    <td className="p-2 text-center">{row.calcium}</td>
                    <td className="p-2 text-center">{row.iron || "Breast milk"}</td>
                    <td className="p-2 text-center">{row.vitD}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Complementary Feeding */}
      <Card className="bg-white shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <CardTitle className="text-base">Complementary Feeding Guide (IAP/WHO)</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          {COMPLEMENTARY_FEEDING.map((cf, i) => (
            <div key={i} className={`p-3 rounded-lg border ${i === 0 ? "bg-amber-50 border-amber-200" : "bg-slate-50 border-slate-200"}`}>
              <div className="font-semibold text-sm mb-1">{cf.age}</div>
              <div className="text-sm text-slate-700 mb-1">{cf.recommendation}</div>
              <div className="text-xs text-slate-500 italic">{cf.emphasis}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Micronutrient Deficiencies */}
      <Card className="bg-white shadow-lg">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />Common Micronutrient Deficiencies (India)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          {DEFICIENCY_GUIDE.map((def, i) => (
            <div key={i} className="border rounded-lg overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 text-left"
                onClick={() => setActiveDeficiency(activeDeficiency === i ? null : i)}
              >
                <span className="font-semibold text-sm">{def.nutrient}</span>
                <Badge variant="outline" className="text-xs">{def.symptoms.length} symptoms</Badge>
              </button>
              {activeDeficiency === i && (
                <div className="p-4 space-y-3">
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <h5 className="font-semibold text-xs mb-1.5 text-red-800">Symptoms:</h5>
                      <ul className="space-y-1">
                        {def.symptoms.map((s, si) => <li key={si} className="text-xs text-red-700 flex gap-1"><span>•</span>{s}</li>)}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold text-xs mb-1.5 text-amber-800">Causes:</h5>
                      <ul className="space-y-1">
                        {def.causes.map((c, ci) => <li key={ci} className="text-xs text-amber-700 flex gap-1"><span>•</span>{c}</li>)}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold text-xs mb-1.5 text-blue-800">Treatment:</h5>
                      <ul className="space-y-1">
                        {def.treatment.map((t, ti) => <li key={ti} className="text-xs text-blue-700 flex gap-1"><span>•</span>{t}</li>)}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold text-xs mb-1.5 text-green-800">Dietary Sources:</h5>
                      <div className="flex flex-wrap gap-1">
                        {def.sources.map((s, si) => <Badge key={si} className="bg-green-100 text-green-800 text-xs font-normal">{s}</Badge>)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Alert className="bg-teal-50 border-teal-200">
        <CheckCircle2 className="w-4 h-4 text-teal-600" />
        <AlertDescription className="text-xs text-teal-800">
          <strong>IAP 2022 Key Points:</strong> Universal salt iodization is mandatory. Vitamin D supplementation from birth for all Indian children (400 IU for infants, 600 IU for children). Iron-folic acid supplementation via weekly school programs (WIFS) for adolescents. Promote millets (ragi, bajra, jowar) for micronutrient density.
        </AlertDescription>
      </Alert>
    </div>
  );
}