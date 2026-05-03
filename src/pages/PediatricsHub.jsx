import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Baby, Syringe, Scale, TrendingUp, MessageCircle, Apple, BarChart2 } from "lucide-react";
import GrowthMonitoringPathway from "../components/pathways/GrowthMonitoringPathway.jsx";
import PediatricNutritionPathway from "../components/pathways/PediatricNutritionPathway.jsx";
import VaccDrugChatbot from "../components/pediatrics/VaccDrugChatbot.jsx";
import SimpleVaccinationSchedule from "../components/pediatrics/SimpleVaccinationSchedule.jsx";
import NutritionIntakeTracker from "../components/pediatrics/NutritionIntakeTracker.jsx";
import InteractiveGrowthChart from "../components/pediatrics/InteractiveGrowthChart.jsx";

const TABS = [
{ id: "assistant", label: "AI Assistant", icon: MessageCircle, color: "bg-green-600", badge: "AI" },
{ id: "vaccination", label: "Vaccination", icon: Syringe, color: "bg-blue-600" },
{ id: "growth", label: "Growth Charts", icon: TrendingUp, color: "bg-purple-600" },
{ id: "nutrition", label: "Nutrition Log", icon: Apple, color: "bg-orange-600" },
{ id: "guidelines", label: "Guidelines", icon: Scale, color: "bg-teal-600" }];


export default function PediatricsHub() {
  const [activeTab, setActiveTab] = useState("assistant");

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b-2 border-slate-200 px-4 py-3 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3 max-w-5xl mx-auto">
          <Link to={createPageUrl("Hub")}>
            <Button variant="outline" size="sm" className="h-8 px-2 shrink-0">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center shadow shrink-0">
              <Baby className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-bold text-slate-900 leading-tight truncate">General Pediatrics Hub</h1>
              <p className="text-xs text-slate-500 hidden sm:block">IAP Guidelines · Growth · Vaccination · Nutrition</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Bar — high contrast dark background, fully visible on mobile */}
      <div className="bg-green-50 px-2 py-2 sticky top-[57px] z-10 shadow-lg">
        <div className="max-w-5xl mx-auto overflow-x-auto">
          <div className="flex gap-1.5 min-w-max md:grid md:grid-cols-5 md:min-w-0">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex flex-col items-center justify-center gap-0.5 py-2.5 px-3 md:px-1 rounded-xl transition-all duration-200 min-w-[72px] md:min-w-0 ${
                  isActive ?
                  `${tab.color} shadow-lg ring-2 ring-white/30` :
                  "bg-slate-700 hover:bg-slate-600 active:bg-slate-500"}`
                  }>
                  
                  <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-300"}`} />
                  <span className={`text-[11px] font-bold leading-tight text-center whitespace-nowrap ${isActive ? "text-white" : "text-slate-300"}`}>
                    {tab.label}
                  </span>
                  {tab.badge &&
                  <span className="absolute -top-1 -right-1 text-[9px] bg-yellow-400 text-yellow-900 px-1 rounded-full font-black leading-tight">
                      {tab.badge}
                    </span>
                  }
                </button>);

            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto p-4">

        {/* ── AI Assistant ── */}
        {activeTab === "assistant" &&
        <div className="rounded-2xl overflow-hidden shadow-xl border-2 border-green-200">
            <div className="bg-red-300 px-4 py-3 from-green-600 to-teal-600 flex items-center justify-between">
              <div>
                <p className="font-bold text-white text-sm flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />Vaccination & Drug AI Assistant
                </p>
                <p className="text-green-100 text-xs mt-0.5">Ask about vaccines, drug doses, treatment plans with weight-based calculations</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Badge className="bg-white/20 text-white border-white/30 text-xs">IAP 2023</Badge>
                <Badge className="bg-yellow-400/90 text-yellow-900 text-xs border-0">NIS</Badge>
              </div>
            </div>
            <VaccDrugChatbot />
          </div>
        }

        {/* ── Vaccination ── */}
        {activeTab === "vaccination" &&
        <div>
            <div className="flex items-center gap-2 mb-4 p-3 bg-blue-600 rounded-xl shadow">
              <Syringe className="w-5 h-5 text-white shrink-0" />
              <div>
                <p className="font-bold text-white text-sm">NIS + IAP 2023 Vaccination Schedule</p>
                <p className="text-blue-100 text-xs">Tap any vaccine to mark given · Search by name or disease</p>
              </div>
            </div>
            <SimpleVaccinationSchedule />
          </div>
        }

        {/* ── Growth Charts ── */}
        {activeTab === "growth" &&
        <div>
            <div className="flex items-center gap-2 mb-4 p-3 bg-purple-600 rounded-xl shadow">
              <TrendingUp className="w-5 h-5 text-white shrink-0" />
              <div>
                <p className="font-bold text-white text-sm">WHO Growth Charts — Interactive</p>
                <p className="text-purple-100 text-xs">Weight, Height, Head Circumference · Z-scores · Centile curves (3rd–97th)</p>
              </div>
            </div>
            <InteractiveGrowthChart />
          </div>
        }

        {/* ── Nutrition Log ── */}
        {activeTab === "nutrition" &&
        <div>
            <div className="flex items-center gap-2 mb-4 p-3 bg-orange-600 rounded-xl shadow">
              <Apple className="w-5 h-5 text-white shrink-0" />
              <div>
                <p className="font-bold text-white text-sm">Nutrition Intake Tracker</p>
                <p className="text-orange-100 text-xs">Log food + fluids · Compare vs requirements · Disease-specific (CKD / Nephrotic / AKI)</p>
              </div>
            </div>
            <NutritionIntakeTracker />
          </div>
        }

        {/* ── Guidelines ── */}
        {activeTab === "guidelines" &&
        <div>
            <div className="flex items-center gap-2 mb-4 p-3 bg-teal-600 rounded-xl shadow">
              <Scale className="w-5 h-5 text-white shrink-0" />
              <div>
                <p className="font-bold text-white text-sm">IAP / ICMR Nutrition Guidelines</p>
                <p className="text-teal-100 text-xs">RDA table · Complementary feeding · Malnutrition management · Indian food sources</p>
              </div>
            </div>
            <PediatricNutritionPathway />
          </div>
        }
      </div>
    </div>);

}