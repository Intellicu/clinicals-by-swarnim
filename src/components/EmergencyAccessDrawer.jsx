import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { X, AlertCircle, Zap, Heart, Activity, Wind, Brain, Droplet, Pill, Calculator, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const EMERGENCY_TOOLS = [
  { category: "Resuscitation", color: "bg-red-600", items: [
    { name: "Fluid Bolus (20 mL/kg)", icon: Droplet, page: "FluidCalculator", desc: "Saline/Albumin bolus calc" },
    { name: "Resus Drug Calc", icon: Pill, page: "CalculatorsHub", desc: "Weight-based emergency drugs" },
    { name: "Airway Checklist", icon: Wind, page: "EmergencyHub", desc: "Intubation guide & sizes" },
  ]},
  { category: "Critical Electrolytes", color: "bg-orange-600", items: [
    { name: "Hyperkalemia Protocol", icon: Zap, page: "EmergencyHub", desc: "ECG changes → treatment steps" },
    { name: "Hyponatremia", icon: Droplet, page: "SodiumCalculator", desc: "Hypertonic saline calc" },
    { name: "Hypocalcemia", icon: Activity, page: "ClinicalSupport", desc: "IV calcium dosing" },
  ]},
  { category: "Cardiovascular", color: "bg-rose-700", items: [
    { name: "HTN Emergency", icon: Heart, page: "EmergencyHub", desc: "IV labetalol / nicardipine" },
    { name: "BP Percentiles", icon: Heart, page: "BPPercentiles", desc: "AAP 2017 BP staging" },
    { name: "Septic Shock", icon: AlertCircle, page: "EmergencyHub", desc: "Fluid / vasopressor guide" },
  ]},
  { category: "Neurological", color: "bg-purple-700", items: [
    { name: "Status Epilepticus", icon: Brain, page: "EmergencyHub", desc: "Benzodiazepine → 2nd line" },
    { name: "Raised ICP Signs", icon: Brain, page: "EmergencyHub", desc: "Mannitol / hypertonic saline" },
    { name: "GCS Calculator", icon: Calculator, page: "CalculatorsHub", desc: "Paediatric GCS" },
  ]},
  { category: "Renal Emergency", color: "bg-blue-700", items: [
    { name: "AKI Stager", icon: Activity, page: "AKIStager", desc: "KDIGO AKI staging" },
    { name: "HUS Protocol", icon: AlertCircle, page: "EmergencyHub", desc: "TMA / HUS management" },
    { name: "RRT Initiation", icon: Droplet, page: "RRTAssistant", desc: "Urgent dialysis triggers" },
  ]},
  { category: "Metabolic / DKA", color: "bg-amber-600", items: [
    { name: "DKA Protocol", icon: Activity, page: "EmergencyHub", desc: "Fluid, insulin, monitoring" },
    { name: "ABG Interpreter", icon: Wind, page: "ABGInterpreter", desc: "Acid-base rapid analysis" },
    { name: "Anion Gap", icon: Calculator, page: "AnionGap", desc: "AG + delta-delta calc" },
  ]},
];

export default function EmergencyAccessDrawer({ open, onClose }) {
  if (!open) return null;
  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 z-50 flex flex-col bg-white shadow-2xl overflow-hidden"
        style={{ width: "min(92vw, 380px)" }}>
        {/* Header */}
        <div className="bg-red-600 px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-white" />
            <div>
              <p className="text-white font-bold text-sm">Emergency Access</p>
              <p className="text-red-200 text-xs">Instant resuscitation tools</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick links */}
        <div className="overflow-y-auto flex-1 p-3 space-y-3">
          {EMERGENCY_TOOLS.map((group) => (
            <div key={group.category}>
              <div className="flex items-center gap-2 mb-1.5">
                <Badge className={`${group.color} text-white text-xs`}>{group.category}</Badge>
              </div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.name} to={createPageUrl(item.page)} onClick={onClose}>
                      <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-red-50 hover:border-red-200 transition-colors group active:scale-98">
                        <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-red-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800 leading-tight">{item.name}</p>
                          <p className="text-xs text-slate-500 leading-tight">{item.desc}</p>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-red-400 flex-shrink-0" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-3 pb-4 pt-2 border-t border-slate-100">
          <Link to={createPageUrl("EmergencyHub")} onClick={onClose}>
            <div className="bg-red-600 rounded-xl px-4 py-3 flex items-center justify-between text-white active:scale-98">
              <span className="text-sm font-bold">Open Full Emergency Hub</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}