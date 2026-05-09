import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight, ExternalLink, FlaskConical, Zap, Shield, GitBranch, Pill } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Cross-specialty deep-link chips — connect rheumatology to existing nephrology modules
const CROSS_LINKS = {
  lupus: [
    { label: "Lupus Nephritis GN Pathway", icon: FlaskConical, color: "bg-purple-50 border-purple-200 text-purple-700", path: "GlomerularDiseases" },
    { label: "Nephrology Guidelines", icon: GitBranch, color: "bg-blue-50 border-blue-200 text-blue-700", path: "Guidelines" },
    { label: "Emergency Hub", icon: Zap, color: "bg-red-50 border-red-200 text-red-700", path: "EmergencyHub" },
  ],
  anca: [
    { label: "ANCA GN Pathway (KDIGO)", icon: FlaskConical, color: "bg-orange-50 border-orange-200 text-orange-700", path: "GlomerularDiseases" },
    { label: "RPGN Emergency Protocol", icon: Zap, color: "bg-red-50 border-red-200 text-red-700", path: "EmergencyHub" },
    { label: "RRT/Dialysis Support", icon: Shield, color: "bg-cyan-50 border-cyan-200 text-cyan-700", path: "RRTAssistant" },
  ],
  igav: [
    { label: "IgAN/IgAV Nephritis (GN)", icon: FlaskConical, color: "bg-pink-50 border-pink-200 text-pink-700", path: "GlomerularDiseases" },
    { label: "Nephrology Guidelines", icon: GitBranch, color: "bg-blue-50 border-blue-200 text-blue-700", path: "Guidelines" },
  ],
  mas: [
    { label: "Emergency Hub — MAS Protocol", icon: Zap, color: "bg-red-50 border-red-200 text-red-700", path: "EmergencyHub" },
    { label: "AKI in Shock — KDIGO", icon: FlaskConical, color: "bg-orange-50 border-orange-200 text-orange-700", path: "Guidelines" },
    { label: "RRT/Dialysis if AKI", icon: Shield, color: "bg-cyan-50 border-cyan-200 text-cyan-700", path: "RRTAssistant" },
  ],
  mis_c: [
    { label: "Emergency Hub — MIS-C/KD", icon: Zap, color: "bg-red-50 border-red-200 text-red-700", path: "EmergencyHub" },
    { label: "AKI Management (KDIGO)", icon: FlaskConical, color: "bg-blue-50 border-blue-200 text-blue-700", path: "Guidelines" },
  ],
  drugs: [
    { label: "Drugs & Dosing (Full DB)", icon: Pill, color: "bg-green-50 border-green-200 text-green-700", path: "DrugsDosing" },
    { label: "AI Prescriber", icon: Pill, color: "bg-purple-50 border-purple-200 text-purple-700", path: "AIPrescriber" },
    { label: "Renal Dose Adjustments", icon: FlaskConical, color: "bg-teal-50 border-teal-200 text-teal-700", path: "DrugCalculator" },
  ],
};

export default function CrossSpecialtyLinks({ context = "lupus" }) {
  const links = CROSS_LINKS[context] || CROSS_LINKS.drugs;
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">🔗 Cross-specialty Links</p>
      {links.map((link, i) => (
        <Link key={i} to={createPageUrl(link.path)}
          className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all hover:shadow-sm ${link.color}`}>
          <span className="flex items-center gap-1.5">
            <link.icon className="w-3.5 h-3.5 flex-shrink-0" />
            {link.label}
          </span>
          <ArrowRight className="w-3 h-3 opacity-60" />
        </Link>
      ))}
    </div>
  );
}