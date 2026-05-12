import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, ChevronDown, ChevronUp, ArrowRight, ExternalLink } from "lucide-react";

const MODALITIES = [
  { name: "Hemodialysis (HD)", color: "bg-blue-50 border-blue-300", badge: "bg-blue-100 text-blue-800",
    keys: ["Kt/V target >1.2 per session", "Blood flow: 5–8 mL/kg/min", "3× weekly chronic HD", "Access: AVF preferred, temporary CVC in AKI", "Dry weight reassessment every session", "Intradialytic hypotension — most common complication"] },
  { name: "Peritoneal Dialysis (PD)", color: "bg-teal-50 border-teal-300", badge: "bg-teal-100 text-teal-800",
    keys: ["Preferred in infants + young children", "CCPD overnight — 8–10h nightly", "Daily PET for membrane characterization", "Exit site care: daily chlorhexidine", "Peritonitis: gram-positive most common", "APD allows school attendance"] },
  { name: "CRRT (Continuous RRT)", color: "bg-red-50 border-red-300", badge: "bg-red-100 text-red-800",
    keys: ["PICU-based. AKI with hemodynamic instability", "Target dose: 25–35 mL/kg/hr", "Filter life: 48–72h (citrate anticoagulation)", "Monitor: electrolytes q6h, citrate toxicity", "CVVHDF most common mode in pediatrics"] },
  { name: "PLEX / Plasma Exchange", color: "bg-purple-50 border-purple-300", badge: "bg-purple-100 text-purple-800",
    keys: ["aHUS, ANCA vasculitis, TTP, anti-GBM disease", "1–1.5 plasma volumes per session", "Replacement: FFP or albumin (by indication)", "Monitor coagulation, calcium, IgG levels"] },
];

export default function HubDialysisPanel() {
  const [open, setOpen] = useState(null);
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-cyan-700 to-blue-700 p-5 text-white">
        <div className="flex items-center gap-3">
          <Activity className="w-7 h-7" />
          <div>
            <h2 className="text-xl font-bold">Dialysis & ICU Nephrology</h2>
            <p className="text-cyan-100 text-sm">HD · PD · CRRT · PLEX · Adequacy — Pediatric protocols</p>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {MODALITIES.map((m, i) => (
          <Card key={i} className={`border-2 ${m.color}`}>
            <CardContent className="p-0">
              <button className="w-full flex items-center justify-between p-3 text-left" onClick={() => setOpen(open === i ? null : i)}>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-slate-800">{m.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${m.badge}`}>Protocol</span>
                </div>
                {open === i ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>
              {open === i && (
                <div className="px-3 pb-3 border-t border-slate-100 pt-2 space-y-1">
                  {m.keys.map((k, j) => (
                    <div key={j} className="flex items-start gap-2">
                      <ArrowRight className="w-3 h-3 text-blue-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-700">{k}</p>
                    </div>
                  ))}
                  <Link to="/RRTAssistant">
                    <Button size="sm" variant="outline" className="mt-2 text-xs border-blue-200 text-blue-700 hover:bg-blue-50">
                      <ExternalLink className="w-3 h-3 mr-1" /> Full RRT Module
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}