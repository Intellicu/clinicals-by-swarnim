import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calculator, FlaskConical, Pill, TrendingUp, Heart, Activity, Brain, MessageSquare } from "lucide-react";
import NephrologyCalculators from "../components/calculators/NephrologyCalculators";
import RheumatologyCalculators from "../components/calculators/RheumatologyCalculators";
import SteroidTaperEngine from "../components/calculators/SteroidTaperEngine";
import DoseCalculatorEngine from "../components/calculators/DoseCalculatorEngine";
import CounselingEngine from "../components/calculators/CounselingEngine";

const TABS = [
{ id: "nephrology", label: "Nephrology", icon: FlaskConical, color: "bg-blue-600", badge: "GFR, FENa, BP, BSA" },
{ id: "rheumatology", label: "Rheumatology", icon: Activity, color: "bg-purple-600", badge: "JADAS, SLEDAI, MAS" },
{ id: "steroid", label: "Steroid Taper", icon: Pill, color: "bg-orange-600", badge: "Taper + Equivalence" },
{ id: "dosing", label: "Drug Dosing Engine", icon: Calculator, color: "bg-teal-600", badge: "Weight + BSA + Renal" },
{ id: "counseling", label: "Patient Counseling", icon: MessageSquare, color: "bg-cyan-600", badge: "Multilingual Sheets" }];


export default function CalculatorsHub() {
  const [activeTab, setActiveTab] = useState("nephrology");
  const current = TABS.find((t) => t.id === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-3 md:p-6">
      <div className="max-w-4xl mx-auto">
        <Link to={createPageUrl("Hub")}>
          <Button variant="outline" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />Back to Hub
          </Button>
        </Link>

        {/* Header */}
        <div className={`rounded-2xl p-5 text-white mb-5 shadow-xl ${current?.color || "bg-blue-600"}`}>
          <div className="flex items-center gap-3">
            {current && <current.icon className="w-8 h-8" />}
            <div>
              <h1 className="text-2xl font-bold">Clinical Calculators</h1>
              
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex flex-wrap gap-2 mb-5">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${activeTab === tab.id ? `${tab.color} text-white border-transparent shadow-md` : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"}`}>
                
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <Badge className={`text-xs ${activeTab === tab.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>{tab.badge}</Badge>
              </button>);

          })}
        </div>

        {/* Content */}
        <div>
          {activeTab === "nephrology" && <NephrologyCalculators />}
          {activeTab === "rheumatology" && <RheumatologyCalculators />}
          {activeTab === "steroid" && <SteroidTaperEngine />}
          {activeTab === "dosing" && <DoseCalculatorEngine />}
          {activeTab === "counseling" && <CounselingEngine />}
        </div>
      </div>
    </div>);

}