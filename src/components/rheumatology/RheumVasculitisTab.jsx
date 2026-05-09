import React from "react";
import { VASCULITIS_CONDITIONS } from "@/lib/rheumatology/RheumVasculitisData";
import RheumPathwayCard from "./RheumPathwayCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { AlertTriangle, GitBranch, Droplet, Zap } from "lucide-react";

const GN_DEEP_LINKS = [
  { label: "RPGN Emergency Pathway", icon: AlertTriangle, color: "bg-red-50 border-red-200 text-red-700", path: "ClinicalSupport", hash: "anca_vasculitis" },
  { label: "ANCA GN Module", icon: GitBranch, color: "bg-purple-50 border-purple-200 text-purple-700", path: "ClinicalSupport", hash: "anca-vasculitis" },
  { label: "Dialysis Escalation", icon: Droplet, color: "bg-blue-50 border-blue-200 text-blue-700", path: "RRTAssistant", hash: "" },
  { label: "HTN Emergency", icon: Zap, color: "bg-amber-50 border-amber-200 text-amber-700", path: "EmergencyHub", hash: "" },
];

export default function RheumVasculitisTab({ isAdmin, savedUpdates, onSaveUpdate }) {
  return (
    <div className="space-y-3">
      <Alert className="bg-red-50 border-red-200">
        <AlertTriangle className="w-4 h-4 text-red-600" />
        <AlertDescription className="text-xs text-red-900">
          <strong>Vasculitis Expansion:</strong> Takayasu, PAN, ANCA, Behçet, CNS Vasculitis — full pathways with renal overlap, biologic escalation, and deep GN cross-links.
        </AlertDescription>
      </Alert>

      {/* Deep GN cross-link chips */}
      <div className="bg-white border border-slate-200 rounded-xl p-3">
        <p className="text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">🔗 Nephrology Cross-Links</p>
        <div className="flex flex-wrap gap-2">
          {GN_DEEP_LINKS.map(link => (
            <Link key={link.label} to={createPageUrl(link.path)}>
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border cursor-pointer hover:shadow-sm transition-all ${link.color}`}>
                <link.icon className="w-3 h-3" />{link.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Category label */}
      <div className="flex items-center gap-2">
        <Badge className="bg-red-600 text-white text-xs">Vasculitis Expansion Layer</Badge>
        <span className="text-xs text-slate-500">{VASCULITIS_CONDITIONS.length} conditions</span>
      </div>

      {/* Cards */}
      {VASCULITIS_CONDITIONS.map(condition => (
        <RheumPathwayCard
          key={condition.id}
          condition={condition}
          isAdmin={isAdmin}
          savedUpdates={savedUpdates}
          onSaveUpdate={onSaveUpdate}
        />
      ))}
    </div>
  );
}