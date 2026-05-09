import React from "react";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Activity, Droplet, TrendingUp, Clock, Shield, Zap } from "lucide-react";

// Derives the patient's clinical context bar from patient data
// Shows: diagnosis · CKD stage · eGFR · BP · dialysis · alerts

function eGFRColor(egfr) {
  if (!egfr) return "bg-slate-100 text-slate-600";
  if (egfr >= 90) return "bg-green-100 text-green-800";
  if (egfr >= 60) return "bg-yellow-100 text-yellow-800";
  if (egfr >= 30) return "bg-orange-100 text-orange-800";
  if (egfr >= 15) return "bg-red-100 text-red-800";
  return "bg-red-600 text-white";
}

function ckdStageColor(stage) {
  if (!stage) return "bg-slate-100 text-slate-600";
  const s = Number(stage);
  if (s <= 2) return "bg-green-100 text-green-800";
  if (s === 3) return "bg-yellow-100 text-yellow-800";
  if (s === 4) return "bg-orange-100 text-orange-800";
  return "bg-red-100 text-red-800";
}

function bpStageColor(stage = "") {
  if (!stage || stage === "Normal") return "bg-green-100 text-green-800";
  if (stage === "Elevated") return "bg-yellow-100 text-yellow-800";
  if (stage === "Stage 1 HTN") return "bg-orange-100 text-orange-800";
  return "bg-red-100 text-red-800";
}

function diagnosisColor(d = "") {
  const dl = d.toLowerCase();
  if (dl.includes("srns") || dl.includes("resistant")) return "bg-red-600 text-white";
  if (dl.includes("frns") || dl.includes("relapse")) return "bg-orange-500 text-white";
  if (dl.includes("transplant") || dl.includes("rtx")) return "bg-teal-600 text-white";
  if (dl.includes("ckd")) return "bg-blue-600 text-white";
  if (dl.includes("aki")) return "bg-red-500 text-white";
  if (dl.includes("dialysis") || dl.includes("hd") || dl.includes("pd")) return "bg-cyan-600 text-white";
  if (dl.includes("nephrotic") || dl.includes("ns")) return "bg-purple-600 text-white";
  if (dl.includes("hypertension") || dl.includes("htn")) return "bg-orange-600 text-white";
  return "bg-slate-700 text-white";
}

export default function PatientContextBar({ patient, vitals, bpStage }) {
  if (!patient) return null;

  const chips = [];

  if (patient.diagnosis) chips.push({ icon: Activity, label: patient.diagnosis, color: diagnosisColor(patient.diagnosis) });
  if (patient.ckd_stage) chips.push({ icon: TrendingUp, label: `CKD Stage ${patient.ckd_stage}`, color: ckdStageColor(patient.ckd_stage) });
  if (patient.egfr) chips.push({ icon: Activity, label: `eGFR ${patient.egfr}`, color: eGFRColor(patient.egfr) });
  if (bpStage && bpStage !== "Normal") chips.push({ icon: Zap, label: `BP: ${bpStage}`, color: bpStageColor(bpStage) });
  if (patient.on_dialysis) chips.push({ icon: Droplet, label: "On Dialysis", color: "bg-cyan-100 text-cyan-800" });
  if (patient.on_immunosuppression) chips.push({ icon: Shield, label: "Immunosuppressed", color: "bg-amber-100 text-amber-800" });
  if (patient.transplant_date) chips.push({ icon: Clock, label: "Transplant Recipient", color: "bg-teal-100 text-teal-800" });

  // Clinical alerts derived from data
  const alerts = [];
  if (patient.egfr && Number(patient.egfr) < 15) alerts.push("eGFR <15 — dialysis preparation needed");
  if (patient.ckd_stage >= 4) alerts.push("CKD Stage 4 — multidisciplinary review recommended");

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5 items-center">
        {chips.map((c, i) => (
          <Badge key={i} className={`text-xs border-0 flex items-center gap-1 ${c.color}`}>
            <c.icon className="w-3 h-3" />{c.label}
          </Badge>
        ))}
        {patient.age_years && (
          <Badge variant="outline" className="text-xs">Age {patient.age_years}y</Badge>
        )}
        {patient.weight_kg && (
          <Badge variant="outline" className="text-xs">{patient.weight_kg} kg</Badge>
        )}
      </div>
      {alerts.map((a, i) => (
        <div key={i} className="flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5 font-medium">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />{a}
        </div>
      ))}
    </div>
  );
}