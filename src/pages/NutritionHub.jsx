import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Apple, Activity, FlaskConical, Settings, Utensils, ArrowRight, CheckCircle } from "lucide-react";
import NutritionAssessment from "../components/nutrition/NutritionAssessment";
import NutritionPrescription from "../components/nutrition/NutritionPrescription";
import NutritionDietPlanner from "../components/nutrition/NutritionDietPlanner";
import NutritionAdvancedTools from "../components/nutrition/NutritionAdvancedTools";
import RenalDietGenerator from "../components/nutrition/RenalDietGenerator";

const STEPS = [
  { id: "assessment", label: "1. Assessment", icon: Activity, desc: "Anthropometry + nutritional risk scoring" },
  { id: "prescription", label: "2. Prescription", icon: FlaskConical, desc: "Energy, protein & electrolyte targets" },
  { id: "diet", label: "3. Diet Plan", icon: Apple, desc: "AI meal plan + food reference DB" },
];

function PatientDataBanner({ patientData, onEdit }) {
  if (!patientData) return null;
  return (
    <div className="flex items-center gap-3 bg-teal-50 border border-teal-200 rounded-xl px-4 py-2.5 text-sm flex-wrap">
      <CheckCircle className="w-4 h-4 text-teal-600 shrink-0" />
      <span className="text-teal-800 font-medium">Patient assessed:</span>
      <span className="text-teal-700">
        Age {patientData.age}y · {patientData.euvolemic_weight?.toFixed(1)}kg · {patientData.condition} · {patientData.classification?.level}
      </span>
      <span className="text-xs text-teal-600 bg-teal-100 px-2 py-0.5 rounded-full">PYMS {patientData.pyms} — {patientData.pymsRisk?.split(" ")[0]}</span>
      <button onClick={onEdit} className="ml-auto text-xs text-teal-600 hover:underline">Edit</button>
    </div>
  );
}

export default function NutritionHub() {
  const [patientData, setPatientData] = useState(null);
  const [activeTab, setActiveTab] = useState("diet-generator");

  const handleAssessmentComplete = (data) => {
    setPatientData(data);
    // Auto-advance to prescription tab after assessment
    setActiveTab("prescription");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header */}
        <div className="rounded-2xl bg-gradient-to-r from-teal-600 to-green-600 p-5 text-white shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Apple className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Clinical Nutrition Hub</h1>
              <p className="text-teal-100 text-xs">Pediatric Nephrology Nutrition — PRNT / KDIGO / KDOQI Aligned</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {["PRNT 2020", "KDIGO AKI 2012", "KDOQI Pediatric 2009", "WHO Growth Standards", "AIIMS PICU"].map(g => (
              <Badge key={g} className="bg-white/20 text-white border-white/30 text-xs">{g}</Badge>
            ))}
          </div>
        </div>

        {/* Integrated Workflow Banner */}
        <div className="bg-white border border-teal-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Integrated Workflow — Complete in Order</p>
          <div className="flex items-center gap-2 flex-wrap">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const isDone = patientData && i === 0;
              return (
                <React.Fragment key={step.id}>
                  <button
                    onClick={() => setActiveTab(i === 0 ? "assessment" : i === 1 ? "prescription" : "diet")}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all
                      ${activeTab === (i === 0 ? "assessment" : i === 1 ? "prescription" : "diet")
                        ? "border-teal-500 bg-teal-50 text-teal-800"
                        : isDone
                          ? "border-green-300 bg-green-50 text-green-700"
                          : "border-slate-200 bg-white text-slate-600 hover:border-teal-300"
                      }`}
                  >
                    {isDone ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Icon className="w-4 h-4" />}
                    <span>{step.label}</span>
                  </button>
                  {i < STEPS.length - 1 && <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />}
                </React.Fragment>
              );
            })}
          </div>
          {!patientData && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-3">
              💡 <strong>Tip:</strong> Start with Assessment (Tab 1) to auto-populate patient data into Prescription and Diet Plan tabs. Or use the Diet Generator directly below.
            </p>
          )}
        </div>

        {/* Patient data banner when assessed */}
        {patientData && (
          <PatientDataBanner patientData={patientData} onEdit={() => setActiveTab("assessment")} />
        )}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex w-full bg-white border shadow-sm overflow-x-auto h-auto">
            <TabsTrigger value="diet-generator" className="flex items-center gap-1.5 text-xs md:text-sm flex-shrink-0">
              <Utensils className="w-4 h-4" /> Diet Generator
            </TabsTrigger>
            <TabsTrigger value="assessment" className="flex items-center gap-1.5 text-xs md:text-sm flex-shrink-0">
              <Activity className="w-4 h-4" />
              Assessment
              {patientData && <span className="ml-1 w-2 h-2 rounded-full bg-green-500 inline-block" />}
            </TabsTrigger>
            <TabsTrigger value="prescription" className="flex items-center gap-1.5 text-xs md:text-sm flex-shrink-0">
              <FlaskConical className="w-4 h-4" /> Prescription
            </TabsTrigger>
            <TabsTrigger value="diet" className="flex items-center gap-1.5 text-xs md:text-sm flex-shrink-0">
              <Apple className="w-4 h-4" /> Diet Planner
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-1.5 text-xs md:text-sm flex-shrink-0">
              <Settings className="w-4 h-4" /> Advanced
            </TabsTrigger>
          </TabsList>

          <TabsContent value="diet-generator" className="mt-4">
            <RenalDietGenerator />
          </TabsContent>

          <TabsContent value="assessment" className="mt-4">
            <NutritionAssessment onPatientData={handleAssessmentComplete} />
            {patientData && (
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => setActiveTab("prescription")}
                  className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  Continue to Prescription <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="prescription" className="mt-4">
            {!patientData && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 text-sm text-amber-800">
                <strong>No assessment data.</strong> You can enter values manually below, or go to the <button onClick={() => setActiveTab("assessment")} className="underline font-semibold">Assessment tab</button> first to auto-populate patient details.
              </div>
            )}
            <NutritionPrescription patientData={patientData} />
            {patientData && (
              <div className="mt-4">
                <button
                  onClick={() => setActiveTab("diet")}
                  className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  Continue to Diet Plan <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="diet" className="mt-4">
            {!patientData && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 text-sm text-amber-800">
                <strong>No patient data.</strong> The AI meal plan will use default values. For personalized plans, complete the <button onClick={() => setActiveTab("assessment")} className="underline font-semibold">Assessment</button> first.
              </div>
            )}
            <NutritionDietPlanner patientData={patientData} />
          </TabsContent>

          <TabsContent value="advanced" className="mt-4">
            <NutritionAdvancedTools patientData={patientData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}