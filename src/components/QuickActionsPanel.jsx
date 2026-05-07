import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, Pill, AlertTriangle, BookOpen, Heart, Activity, Sparkles, GitBranch, Baby, FlaskConical } from "lucide-react";

const QUICK_ACTIONS = [
  {
    label: "NS Relapse Rx",
    icon: Pill,
    color: "bg-purple-700 hover:bg-purple-800",
    page: "DrugsDosing",
    description: "Prednisolone protocol"
  },
  {
    label: "AKI Emergency",
    icon: AlertTriangle,
    color: "bg-red-700 hover:bg-red-800",
    page: "AKIStager",
    description: "Staging + management"
  },
  {
    label: "Hyperkalemia",
    icon: Activity,
    color: "bg-orange-700 hover:bg-orange-800",
    page: "PotassiumCalculator",
    description: "K+ treatment protocol"
  },
  {
    label: "AI Prescriber",
    icon: Sparkles,
    color: "bg-violet-700 hover:bg-violet-800",
    page: "AIPrescriber",
    description: "AI-powered Rx builder"
  },
  {
    label: "Guidelines",
    icon: BookOpen,
    color: "bg-emerald-700 hover:bg-emerald-800",
    page: "Guidelines",
    description: "KDIGO, IPNA, IAP library"
  },
  {
    label: "Clinical Pathway",
    icon: GitBranch,
    color: "bg-indigo-700 hover:bg-indigo-800",
    page: "ClinicalSupport",
    description: "Evidence-based protocols"
  },
  {
    label: "Growth Check",
    icon: Baby,
    color: "bg-teal-700 hover:bg-teal-800",
    page: "Anthropometry",
    description: "WHO Z-scores & BMI"
  },
  {
    label: "Drug Lookup",
    icon: FlaskConical,
    color: "bg-pink-700 hover:bg-pink-800",
    page: "DrugsDosing",
    description: "Drugs & dosing engine"
  },
];

export default function QuickActionsPanel() {
  return (
    <Card className="bg-white shadow-lg border-2 border-amber-200">
      <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b-2 border-amber-200 py-3 px-5">
        <CardTitle className="flex items-center gap-2 text-base">
          <Zap className="w-5 h-5 text-amber-600" />
          Quick Actions
          <span className="text-xs font-normal text-slate-500 ml-1">— 1-click clinical workflows</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.label} to={createPageUrl(action.page)}>
                <div className="flex flex-col items-center text-center gap-1.5 p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group">
                  <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-800 leading-tight">{action.label}</span>
                  <span className="text-xs text-slate-400 leading-tight hidden sm:block">{action.description}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}