import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Leaf, AlertTriangle, CheckCircle2, Info, Baby, Apple } from "lucide-react";

const COMPLEMENTARY_FOODS = [
  { age: "6 months", foods: "Start semi-solid foods. Rice porridge with dal water, mashed vegetables (lauki, gajar), banana mash, suji porridge.", texture: "Smooth puree", frequency: "2-3x/day, 2-3 teaspoons", notes: "Introduce one new food every 3-5 days. Watch for allergy." },
  { age: "7-8 months", foods: "Mashed rice+dal (khichdi), mashed potato, soft cooked vegetables, curd, mashed papaya/banana.", texture: "Mashed, lumpy", frequency: "3x/day, 2-3 tablespoons", notes: "Can introduce egg yolk, soft fish, chicken (mashed)." },
  { age: "9-11 months", foods: "Family foods (soft), finger foods: soft idli pieces, banana pieces, boiled carrot sticks, chapati strips.", texture: "Minced, chopped", frequency: "3-4x/day + 1-2 snacks", notes: "Introduce finger foods. Avoid honey <1 year." },
  { age: "12-24 months", foods: "Full family food (soft). Dal, sabzi, rice/roti, curd, fruit, egg. Milk 400-500 mL.", texture: "Family texture", frequency: "3 meals + 2 snacks", notes: "Avoid added sugar, salt, junk food. Limit screen time." },
];

const IAP_KEY_MESSAGES = [
  { title: "Breastfeeding", message: "Exclusive breastfeeding for 6 months. Continue breastfeeding up to 2 years along with family foods.", icon: "🤱", priority: "critical" },
  { title: "Iron & Vitamin D", message: "Iron drops from 6 weeks (breastfed infants). Vitamin D 400 IU/day from birth. Zinc supplementation in diarrhea.", icon: "💊", priority: "high" },
  { title: "Anemia Prevention", message: "Iron-rich foods: green leafy vegetables, jaggery, dates, meat. Vitamin C with meals to enhance iron absorption.", icon: "🩸", priority: "high" },
  { title: "Iodine", message: "Use only iodized salt. Iodine deficiency is still endemic in many Indian states.", icon: "🧂", priority: "medium" },
  { title: "Calcium & Bone Health", message: "Milk 300-500 mL/day. Ragi (nachni) is excellent calcium source — 344 mg/100g. Sesame (til) seeds.", icon: "🦴", priority: "medium" },
  { title: "Avoid Junk Food", message: "No ultra-processed snacks, sugar-sweetened beverages, chips, namkeen. IAP 2022: No fast food <5 years.", icon: "🚫", priority: "high" },
  { title: "Vegetarian Diet", message: "Vegetarian children: ensure protein variety (dal + cereal + dairy). Vitamin B12 supplement if strictly vegan.", icon: "🥗", priority: "medium" },
  { title: "Food Allergies", message: "Common: milk, egg, peanut, wheat, fish. Introduce early (not delayed) as per LEAP/EAT studies. Seek allergy opinion if reactions.", icon: "⚠️", priority: "medium" },
];

const AGE_RDA = [
  { age: "1-3 years", energy: "1060 kcal", protein: "16.7 g", calcium: "600 mg", iron: "9 mg", vitA: "400 mcg", vitC: "40 mg" },
  { age: "4-6 years", energy: "1350 kcal", protein: "20.1 g", calcium: "600 mg", iron: "13 mg", vitA: "400 mcg", vitC: "40 mg" },
  { age: "7-9 years", energy: "1690 kcal", protein: "29.5 g", calcium: "600 mg", iron: "16 mg", vitA: "600 mcg", vitC: "40 mg" },
  { age: "10-12 years (M)", energy: "2190 kcal", protein: "39.9 g", calcium: "800 mg", iron: "21 mg", vitA: "600 mcg", vitC: "40 mg" },
  { age: "10-12 years (F)", energy: "2010 kcal", protein: "40.4 g", calcium: "800 mg", iron: "27 mg", vitA: "600 mcg", vitC: "40 mg" },
  { age: "13-15 years (M)", energy: "2750 kcal", protein: "54.3 g", calcium: "800 mg", iron: "32 mg", vitA: "600 mcg", vitC: "40 mg" },
  { age: "13-15 years (F)", energy: "2330 kcal", protein: "51.9 g", calcium: "800 mg", iron: "27 mg", vitA: "600 mcg", vitC: "40 mg" },
];

const INDIAN_FOOD_SOURCES = [
  { nutrient: "Protein", sources: "Dal (arhar 22g/100g), Chana (17g), Soya (36g), Egg (13g), Paneer (18g), Chicken (25g), Fish (20g)" },
  { nutrient: "Iron", sources: "Ragi (3.9mg), Palak (2.7mg), Rajma (5.1mg), Jaggery (11mg), Dates (7.3mg), Horse gram (7mg)" },
  { nutrient: "Calcium", sources: "Ragi (344mg/100g), Sesame til (1474mg!), Milk (120mg/100mL), Paneer (200mg), Rajma (260mg)" },
  { nutrient: "Vitamin A", sources: "Drumstick leaves (6780 mcg), Carrot (1890 mcg), Pumpkin (1750 mcg), Papaya (47 mcg), Mango (900 mcg)" },
  { nutrient: "Vitamin C", sources: "Amla (600mg!), Guava (228mg), Orange (63mg), Tomato (27mg), Capsicum (137mg)" },
  { nutrient: "Zinc", sources: "Wheat germ (17mg), Pumpkin seeds (7mg), Cashew (5mg), Rajma (3mg), Chicken (2mg)" },
  { nutrient: "Vitamin D", sources: "Sunlight (20 min/day face+arms), Egg yolk (2 mcg), Fortified milk, Fish (salmon, sardine)" },
  { nutrient: "Omega-3", sources: "Flaxseeds (22g/100g), Walnut (9g), Mustard oil (10%), Rohu/Sardine fish, Hemp seeds" },
];

const MALNUTRITION_MANAGEMENT = [
  { stage: "SAM — Severe Acute Malnutrition", criteria: "WHZ < -3 OR MUAC < 11.5 cm OR bilateral pitting edema", management: ["Refer to NRC (Nutrition Rehabilitation Centre)", "F-75 therapeutic milk (75 kcal/100mL) initially", "Treat hypoglycemia, hypothermia, infections", "F-100 or RUTF after stabilization", "Transition to RUTF (ready-to-use therapeutic food)", "Monthly follow-up for 6 months post-discharge"], color: "red" },
  { stage: "MAM — Moderate Acute Malnutrition", criteria: "WHZ -3 to -2 OR MUAC 11.5-12.5 cm", management: ["Supplementary feeding program (SFP)", "Energy-dense foods: groundnut+jaggery laddoos, chikki", "Micronutrient supplementation (iron, zinc, Vit A)", "Treat underlying infections", "ICDS support, ration card food entitlements", "Monthly growth monitoring"], color: "orange" },
  { stage: "Stunting — Chronic Malnutrition", criteria: "HAZ < -2 (height-for-age)", management: ["Adequate dietary diversity (7 food groups)", "Improve sanitation and hygiene (WASH)", "Address food security at household level", "Identify and treat infections", "Zinc supplementation (therapeutic)", "Pubertal growth monitoring important"], color: "amber" },
];

export default function PediatricNutritionPathway() {
  const [activeTab, setActiveTab] = useState("guidelines");

  const priorityColors = { critical: "bg-red-100 border-red-300", high: "bg-orange-100 border-orange-300", medium: "bg-blue-100 border-blue-200" };

  return (
    <div className="space-y-6">
      <Alert className="bg-green-50 border-green-200">
        <Leaf className="w-5 h-5 text-green-600" />
        <AlertDescription className="text-green-800">
          <strong>IAP / ICMR 2020 Nutrition Guidelines</strong> for Indian children. RDA values from ICMR-NIN 2020 Nutrient Requirements for Indians.
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="guidelines">Key Messages</TabsTrigger>
          <TabsTrigger value="rda">RDA Table</TabsTrigger>
          <TabsTrigger value="complementary">Complementary Feeding</TabsTrigger>
          <TabsTrigger value="malnutrition">Malnutrition Mx</TabsTrigger>
        </TabsList>

        <TabsContent value="guidelines" className="space-y-4 mt-4">
          <div className="grid md:grid-cols-2 gap-3">
            {IAP_KEY_MESSAGES.map((msg, i) => (
              <div key={i} className={`p-3 rounded-lg border ${priorityColors[msg.priority]}`}>
                <div className="flex items-start gap-2">
                  <span className="text-xl">{msg.icon}</span>
                  <div>
                    <h4 className="font-semibold text-sm text-slate-900">{msg.title}</h4>
                    <p className="text-xs text-slate-700 mt-1">{msg.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Card className="bg-white shadow-lg">
            <CardHeader className="bg-green-50 border-b">
              <CardTitle className="text-base flex items-center gap-2">
                <Apple className="w-5 h-5 text-green-600" />Indian Food Sources by Nutrient
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              {INDIAN_FOOD_SOURCES.map((item, i) => (
                <div key={i} className="grid grid-cols-3 gap-2 text-sm py-2 border-b last:border-0">
                  <span className="font-semibold text-slate-800 col-span-1">{item.nutrient}</span>
                  <span className="text-slate-600 col-span-2 text-xs">{item.sources}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rda" className="mt-4">
          <Card className="bg-white shadow-lg">
            <CardHeader className="bg-blue-50 border-b">
              <CardTitle className="text-base">ICMR-NIN 2020 Recommended Dietary Allowances (India)</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full text-xs md:text-sm">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="p-2 text-left font-semibold">Age Group</th>
                      <th className="p-2 text-center font-semibold">Energy</th>
                      <th className="p-2 text-center font-semibold">Protein</th>
                      <th className="p-2 text-center font-semibold">Calcium</th>
                      <th className="p-2 text-center font-semibold">Iron</th>
                      <th className="p-2 text-center font-semibold">Vit A</th>
                      <th className="p-2 text-center font-semibold">Vit C</th>
                    </tr>
                  </thead>
                  <tbody>
                    {AGE_RDA.map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                        <td className="p-2 font-medium">{row.age}</td>
                        <td className="p-2 text-center">{row.energy}</td>
                        <td className="p-2 text-center">{row.protein}</td>
                        <td className="p-2 text-center">{row.calcium}</td>
                        <td className="p-2 text-center">{row.iron}</td>
                        <td className="p-2 text-center">{row.vitA}</td>
                        <td className="p-2 text-center">{row.vitC}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-slate-400 mt-2">Source: ICMR-NIN 2020. Nutrient Requirements for Indians.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="complementary" className="mt-4 space-y-4">
          <Alert className="bg-blue-50 border-blue-200">
            <Baby className="w-5 h-5 text-blue-600" />
            <AlertDescription className="text-blue-800 text-sm">
              <strong>WHO/IAP Rule:</strong> Start complementary foods at exactly 6 months (not before). Continue breastfeeding. Responsive feeding — let child decide quantity.
            </AlertDescription>
          </Alert>
          {COMPLEMENTARY_FOODS.map((item, i) => (
            <Card key={i} className="bg-white shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 border-b py-3">
                <CardTitle className="text-base font-bold text-green-900">{item.age}</CardTitle>
                <div className="flex gap-2 mt-1">
                  <Badge className="bg-green-100 text-green-800 text-xs">{item.texture}</Badge>
                  <Badge className="bg-blue-100 text-blue-800 text-xs">{item.frequency}</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-sm text-slate-700 mb-2"><strong>Foods:</strong> {item.foods}</p>
                <div className="flex items-start gap-2 text-xs text-amber-800 bg-amber-50 p-2 rounded">
                  <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />
                  <span>{item.notes}</span>
                </div>
              </CardContent>
            </Card>
          ))}
          <Alert className="bg-red-50 border-red-200">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <AlertDescription className="text-red-800 text-sm">
              <strong>Foods to AVOID &lt;1 year:</strong> Honey (botulism), whole nuts (choking), cow's milk as main drink, added salt/sugar, unpasteurized foods, raw eggs. Avoid fruit juices &lt;1y (AAP/IAP).
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="malnutrition" className="mt-4 space-y-4">
          {MALNUTRITION_MANAGEMENT.map((item, i) => {
            const borderColors = { red: "border-red-300 bg-red-50", orange: "border-orange-300 bg-orange-50", amber: "border-amber-300 bg-amber-50" };
            const headerColors = { red: "bg-red-100 border-red-200 text-red-900", orange: "bg-orange-100 border-orange-200 text-orange-900", amber: "bg-amber-100 border-amber-200 text-amber-900" };
            return (
              <Card key={i} className={`shadow-lg border-2 ${borderColors[item.color]}`}>
                <CardHeader className={`border-b ${headerColors[item.color]}`}>
                  <CardTitle className="text-base">{item.stage}</CardTitle>
                  <p className="text-xs font-medium mt-1">Criteria: {item.criteria}</p>
                </CardHeader>
                <CardContent className="p-4">
                  <ul className="space-y-1">
                    {item.management.map((step, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm">
                        <span className={`font-bold ${item.color === "red" ? "text-red-600" : item.color === "orange" ? "text-orange-600" : "text-amber-600"}`}>{j+1}.</span>
                        <span className="text-slate-700">{step}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
          <Alert className="bg-blue-50 border-blue-200">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            <AlertDescription className="text-blue-800 text-sm">
              <strong>Micronutrient Supplementation (NFHS/GOI):</strong> Iron-Folic Acid weekly for adolescent girls (WIFS). Vitamin A every 6 months from 9 months to 5 years. Zinc (20 mg/day x 14 days) for all diarrhea episodes in children 6m–5y.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
}