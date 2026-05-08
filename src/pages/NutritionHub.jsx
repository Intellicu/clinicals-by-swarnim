import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Apple, Activity, FlaskConical, Settings, BookOpen } from "lucide-react";
import NutritionAssessment from "../components/nutrition/NutritionAssessment";
import NutritionPrescription from "../components/nutrition/NutritionPrescription";
import NutritionDietPlanner from "../components/nutrition/NutritionDietPlanner";
import NutritionAdvancedTools from "../components/nutrition/NutritionAdvancedTools";

export default function NutritionHub() {
  const [patientData, setPatientData] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header */}
        <div className="rounded-2xl bg-gradient-to-r from-teal-600 to-green-600 p-6 text-white shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Apple className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Clinical Nutrition Hub</h1>
              <p className="text-teal-100 text-sm">Pediatric Nephrology Nutrition — PRNT / KDIGO / KDOQI Aligned</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {["PRNT 2020", "KDIGO AKI 2012", "KDOQI Pediatric 2009", "WHO Growth Standards", "AIIMS PICU"].map(g => (
              <Badge key={g} className="bg-white/20 text-white border-white/30 text-xs">{g}</Badge>
            ))}
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="assessment">
          <TabsList className="grid grid-cols-4 w-full bg-white border shadow-sm">
            <TabsTrigger value="assessment" className="flex items-center gap-1.5 text-xs md:text-sm">
              <Activity className="w-4 h-4" /> Assessment
            </TabsTrigger>
            <TabsTrigger value="prescription" className="flex items-center gap-1.5 text-xs md:text-sm">
              <FlaskConical className="w-4 h-4" /> Prescription
            </TabsTrigger>
            <TabsTrigger value="diet" className="flex items-center gap-1.5 text-xs md:text-sm">
              <Apple className="w-4 h-4" /> Diet Planner
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-1.5 text-xs md:text-sm">
              <Settings className="w-4 h-4" /> Advanced
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assessment">
            <NutritionAssessment onPatientData={setPatientData} />
          </TabsContent>
          <TabsContent value="prescription">
            <NutritionPrescription patientData={patientData} />
          </TabsContent>
          <TabsContent value="diet">
            <NutritionDietPlanner patientData={patientData} />
          </TabsContent>
          <TabsContent value="advanced">
            <NutritionAdvancedTools patientData={patientData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}