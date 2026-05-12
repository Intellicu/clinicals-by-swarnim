import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FlaskConical, TestTube, Stethoscope, Syringe, Heart,
  Shield, Brain, ChevronDown, ChevronUp, ArrowRight, ExternalLink
} from "lucide-react";

const PATHWAYS = [
  {
    group: "Glomerular Diseases",
    icon: FlaskConical,
    color: "from-pink-600 to-rose-600",
    link: "/GlomerularDiseases",
    items: [
      "Nephrotic Syndrome (MCD, FSGS, MN)",
      "IgA Nephropathy / IgA Vasculitis",
      "Lupus Nephritis (ISN/RPS I–VI)",
      "ANCA Vasculitis (GPA / MPA)",
      "Anti-GBM / Goodpasture",
      "HUS / TMA / aHUS",
      "C3 Glomerulopathy (C3GN / DDD)",
      "PSGN / Infection-related GN",
      "Congenital Nephrotic Syndrome",
      "Alport Syndrome / COL4 Nephropathy",
    ],
  },
  {
    group: "Acute Kidney Injury",
    icon: Heart,
    color: "from-red-600 to-rose-600",
    items: [
      "KDIGO AKI staging (pRIFLE / KDIGO)",
      "Pre-renal vs intrinsic vs post-renal",
      "AKI in neonates",
      "Nephrotoxin stewardship",
      "AKI-to-CKD transition monitoring",
      "Fluid management in AKI",
    ],
  },
  {
    group: "Chronic Kidney Disease",
    icon: Shield,
    color: "from-blue-600 to-indigo-600",
    items: [
      "CKD staging (KDIGO G1–G5)",
      "CKD-MBD (mineral bone disease)",
      "Anemia of CKD (EPO, iron)",
      "Growth failure in CKD",
      "Nutrition in CKD",
      "Cardiovascular risk in CKD",
      "CKD progression monitoring",
    ],
  },
  {
    group: "Metabolic & Genetic",
    icon: Brain,
    color: "from-purple-600 to-violet-600",
    items: [
      "Cystinosis",
      "Fabry disease",
      "Primary hyperoxaluria",
      "Polycystic kidney disease (ARPKD/ADPKD)",
      "Nephronophthisis / ciliopathies",
      "Genetic nephrotic syndromes",
    ],
  },
];

function PathwayGroup({ pathway }) {
  const [open, setOpen] = useState(false);
  const Icon = pathway.icon;

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      <CardContent className="p-0">
        <button
          className="w-full flex items-center justify-between p-4 text-left"
          onClick={() => setOpen(v => !v)}
        >
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${pathway.color} flex items-center justify-center`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm text-slate-800">{pathway.group}</p>
              <p className="text-xs text-slate-500">{pathway.items.length} pathways</p>
            </div>
          </div>
          {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>
        {open && (
          <div className="px-4 pb-4 border-t border-slate-100 pt-3 space-y-1.5">
            {pathway.items.map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <ArrowRight className="w-3 h-3 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-700">{item}</p>
              </div>
            ))}
            {pathway.link && (
              <Link to={pathway.link}>
                <Button size="sm" variant="outline" className="mt-2 text-xs border-blue-200 text-blue-700 hover:bg-blue-50">
                  <ExternalLink className="w-3 h-3 mr-1" /> Full Pathways
                </Button>
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function HubNephrologyPathways() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 p-5 text-white">
        <div className="flex items-center gap-3">
          <Stethoscope className="w-7 h-7" />
          <div>
            <h2 className="text-xl font-bold">Pediatric Nephrology Pathways</h2>
            <p className="text-blue-100 text-sm">Glomerular · AKI · CKD · Metabolic — Unified pathway umbrella</p>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {PATHWAYS.map((p, i) => (
          <PathwayGroup key={i} pathway={p} />
        ))}
      </div>
    </div>
  );
}