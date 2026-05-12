import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FlaskConical, Heart, Shield, Brain,
  ChevronDown, ChevronUp, ArrowRight, ExternalLink, Stethoscope
} from "lucide-react";

// Each item has a label and the page it links to
const PATHWAYS = [
  {
    group: "Glomerular Diseases",
    icon: FlaskConical,
    color: "from-pink-600 to-rose-600",
    groupPage: "GlomerularDiseases",
    items: [
      { label: "Nephrotic Syndrome (MCD, FSGS, MN)", page: "GlomerularDiseases" },
      { label: "IgA Nephropathy / IgA Vasculitis", page: "GlomerularDiseases" },
      { label: "Lupus Nephritis (ISN/RPS I–VI)", page: "GlomerularDiseases" },
      { label: "ANCA Vasculitis (GPA / MPA)", page: "GlomerularDiseases" },
      { label: "Anti-GBM / Goodpasture", page: "GlomerularDiseases" },
      { label: "HUS / TMA / aHUS", page: "GlomerularDiseases" },
      { label: "C3 Glomerulopathy (C3GN / DDD)", page: "GlomerularDiseases" },
      { label: "PSGN / Infection-related GN", page: "GlomerularDiseases" },
      { label: "Congenital Nephrotic Syndrome", page: "GlomerularDiseases" },
      { label: "Alport Syndrome / COL4 Nephropathy", page: "GlomerularDiseases" },
    ],
  },
  {
    group: "Acute Kidney Injury",
    icon: Heart,
    color: "from-red-600 to-rose-600",
    groupPage: "AKIStager",
    items: [
      { label: "KDIGO AKI staging (pRIFLE / KDIGO)", page: "AKIStager" },
      { label: "Pre-renal vs intrinsic vs post-renal", page: "ClinicalSupport" },
      { label: "AKI in neonates", page: "ClinicalSupport" },
      { label: "Nephrotoxin stewardship", page: "ClinicalSupport" },
      { label: "AKI-to-CKD transition monitoring", page: "ClinicalSupport" },
      { label: "Fluid management in AKI", page: "FluidCalculator" },
    ],
  },
  {
    group: "Chronic Kidney Disease",
    icon: Shield,
    color: "from-blue-600 to-indigo-600",
    groupPage: "CKDStager",
    items: [
      { label: "CKD staging (KDIGO G1–G5)", page: "CKDStager" },
      { label: "CKD-MBD (mineral bone disease)", page: "ClinicalSupport" },
      { label: "Anemia of CKD (EPO, iron)", page: "ClinicalSupport" },
      { label: "Growth failure in CKD", page: "Anthropometry" },
      { label: "Nutrition in CKD", page: "NutritionHub" },
      { label: "Cardiovascular risk in CKD", page: "ClinicalSupport" },
      { label: "CKD progression monitoring", page: "SchwartzGFR" },
    ],
  },
  {
    group: "Metabolic & Genetic",
    icon: Brain,
    color: "from-purple-600 to-violet-600",
    groupPage: "GeneticReportAnalyzer",
    items: [
      { label: "Cystinosis", page: "ClinicalApproaches" },
      { label: "Fabry disease", page: "ClinicalApproaches" },
      { label: "Primary hyperoxaluria", page: "ClinicalApproaches" },
      { label: "Polycystic kidney disease (ARPKD/ADPKD)", page: "ClinicalApproaches" },
      { label: "Nephronophthisis / ciliopathies", page: "GeneticReportAnalyzer" },
      { label: "Genetic nephrotic syndromes", page: "GlomerularDiseases" },
    ],
  },
];

function PathwayGroup({ pathway }) {
  const [open, setOpen] = useState(false);
  const Icon = pathway.icon;
  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      <CardContent className="p-0">
        {/* Header — clickable to expand/collapse; group title links to page */}
        <div className="w-full flex items-center justify-between p-4 text-left">
          <Link
            to={createPageUrl(pathway.groupPage)}
            className="flex items-center gap-3 flex-1 min-w-0"
            onClick={e => e.stopPropagation()}
          >
            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${pathway.color} flex items-center justify-center shrink-0`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-slate-800 hover:text-blue-700 transition-colors">{pathway.group}</p>
              <p className="text-xs text-slate-500">{pathway.items.length} pathways</p>
            </div>
          </Link>
          <button
            className="ml-2 p-1 rounded hover:bg-slate-100 transition-colors"
            onClick={() => setOpen(v => !v)}
            aria-label={open ? "Collapse" : "Expand"}
          >
            {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>
        </div>

        {open && (
          <div className="px-4 pb-4 border-t border-slate-100 pt-3 space-y-1">
            {pathway.items.map((item, i) => (
              <Link key={i} to={createPageUrl(item.page)}>
                <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-blue-50 transition-colors group cursor-pointer">
                  <ArrowRight className="w-3 h-3 text-blue-500 flex-shrink-0" />
                  <p className="text-xs text-slate-700 group-hover:text-blue-700 transition-colors flex-1">{item.label}</p>
                  <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-blue-400 shrink-0" />
                </div>
              </Link>
            ))}
            <Link to={createPageUrl(pathway.groupPage)}>
              <Button size="sm" variant="outline" className="mt-2 text-xs border-blue-200 text-blue-700 hover:bg-blue-50 w-full">
                <ExternalLink className="w-3 h-3 mr-1" /> Open Full Module
              </Button>
            </Link>
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