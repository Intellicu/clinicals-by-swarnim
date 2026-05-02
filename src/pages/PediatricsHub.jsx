import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Baby, Syringe, Scale, TrendingUp, MessageCircle, Pill } from "lucide-react";
import GrowthMonitoringPathway from "../components/pathways/GrowthMonitoringPathway.jsx";
import EnhancedVaccinationPathway from "../components/pathways/EnhancedVaccinationPathway.jsx";
import PediatricNutritionPathway from "../components/pathways/PediatricNutritionPathway.jsx";
import VaccDrugChatbot from "../components/pediatrics/VaccDrugChatbot.jsx";

const TABS = [
  { id: "assistant", label: "Vacc & Drug AI", icon: MessageCircle, color: "bg-green-600", textColor: "text-white", badge: "NEW" },
  { id: "vaccination", label: "Vaccination", icon: Syringe, color: "bg-blue-600", textColor: "text-white" },
  { id: "growth", label: "Growth", icon: TrendingUp, color: "bg-purple-600", textColor: "text-white" },
  { id: "nutrition", label: "Nutrition", icon: Scale, color: "bg-orange-600", textColor: "text-white" },
];

export default function PediatricsHub() {
  const [activeTab, setActiveTab] = useState("assistant");

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b-2 border-slate-200 px-4 py-3 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3 max-w-5xl mx-auto">
          <Link to={createPageUrl("Hub")}>
            <Button variant="outline" size="sm" className="h-8 px-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center shadow">
              <Baby className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">General Pediatrics Hub</h1>
              <p className="text-xs text-slate-500">IAP Guidelines · Growth · Vaccination · Nutrition</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Bar — high contrast, always visible */}
      <div className="bg-slate-800 px-2 py-2 sticky top-[57px] z-10 shadow-md">
        <div className="max-w-5xl mx-auto grid grid-cols-4 gap-1.5">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex flex-col items-center justify-center gap-1 py-2.5 px-1 rounded-xl transition-all duration-200 ${
                  isActive
                    ? `${tab.color} shadow-lg scale-[1.03] ring-2 ring-white/40`
                    : "bg-slate-700 hover:bg-slate-600"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-300"}`} />
                <span className={`text-xs font-bold leading-tight text-center ${isActive ? "text-white" : "text-slate-300"}`}>
                  {tab.label}
                </span>
                {tab.badge && isActive && (
                  <span className="absolute -top-1 -right-1 text-[9px] bg-yellow-400 text-yellow-900 px-1 rounded-full font-bold">
                    {tab.badge}
                  </span>
                )}
                {tab.badge && !isActive && (
                  <span className="absolute -top-1 -right-1 text-[9px] bg-yellow-400 text-yellow-900 px-1 rounded-full font-bold">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto p-4">
        {activeTab === "assistant" && (
          <Card className="shadow-xl border-2 border-green-200 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 py-3 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-sm font-bold flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Vaccination & Drug AI Assistant
                </CardTitle>
                <div className="flex gap-1">
                  <Badge className="bg-white/20 text-white border-white/30 text-xs">IAP 2023</Badge>
                  <Badge className="bg-yellow-400/90 text-yellow-900 text-xs border-0">NIS</Badge>
                </div>
              </div>
              <p className="text-green-100 text-xs mt-1">Ask about vaccines, drug doses, treatment plans with weight-based calculations</p>
            </CardHeader>
            <CardContent className="p-0">
              <VaccDrugChatbot />
            </CardContent>
          </Card>
        )}

        {activeTab === "vaccination" && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-3 p-3 bg-blue-600 rounded-xl shadow">
              <Syringe className="w-5 h-5 text-white flex-shrink-0" />
              <div>
                <p className="font-bold text-white text-sm">NIS + IAP 2023 Vaccination Schedule</p>
                <p className="text-blue-100 text-xs">Track, calculate due vaccines, catch-up planner</p>
              </div>
            </div>
            <EnhancedVaccinationPathway />
          </div>
        )}

        {activeTab === "growth" && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-3 p-3 bg-purple-600 rounded-xl shadow">
              <TrendingUp className="w-5 h-5 text-white flex-shrink-0" />
              <div>
                <p className="font-bold text-white text-sm">Growth Monitoring (WHO Standards)</p>
                <p className="text-purple-100 text-xs">Z-scores, centiles, growth velocity tracking</p>
              </div>
            </div>
            <GrowthMonitoringPathway />
          </div>
        )}

        {activeTab === "nutrition" && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-3 p-3 bg-orange-600 rounded-xl shadow">
              <Scale className="w-5 h-5 text-white flex-shrink-0" />
              <div>
                <p className="font-bold text-white text-sm">Pediatric Nutrition (IAP)</p>
                <p className="text-orange-100 text-xs">Feeding guidelines, malnutrition management</p>
              </div>
            </div>
            <PediatricNutritionPathway />
          </div>
        )}
      </div>
    </div>
  );
}