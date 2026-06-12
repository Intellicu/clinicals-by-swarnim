import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Pill, GitBranch, Calculator, Stethoscope, Plus } from "lucide-react";

const QUICK_ACTIONS = [
  { label: "New Rx", icon: Pill, color: "bg-teal-600", to: createPageUrl("DrugsDosing") + "?tab=rx" },
  { label: "Pathway", icon: GitBranch, color: "bg-violet-600", to: createPageUrl("ClinicalSupport") },
  { label: "Calculator", icon: Calculator, color: "bg-blue-600", to: createPageUrl("CalculatorsHub") },
  { label: "Clinic", icon: Stethoscope, color: "bg-indigo-600", to: createPageUrl("ClinicWorkflow") },
];

export default function TodaySnapshot() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
        <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Quick Actions</p>
      </div>
      <div className="grid grid-cols-4 divide-x divide-slate-100">
        {QUICK_ACTIONS.map(action => {
          const Icon = action.icon;
          return (
            <Link key={action.label} to={action.to}>
              <div className="flex flex-col items-center gap-1.5 py-3 px-2 hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer">
                <div className={`w-9 h-9 ${action.color} rounded-xl flex items-center justify-center shadow-sm`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs font-semibold text-slate-700 text-center leading-tight">{action.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}