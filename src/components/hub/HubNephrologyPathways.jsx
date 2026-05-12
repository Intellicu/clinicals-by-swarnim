import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FlaskConical, Heart, Shield, Brain,
  ChevronDown, ChevronUp, ArrowRight, ExternalLink, Stethoscope, CheckCircle
} from "lucide-react";

// Each item: label, page, params (query string additions for deep-linking), validated
// validated=true means confirmed canonical content exists at that destination
const PATHWAYS = [
  {
    group: "Glomerular Diseases",
    icon: FlaskConical,
    color: "from-pink-600 to-rose-600",
    groupPage: "GlomerularDiseases",
    groupParams: "",
    count: 10,
    items: [
      { label: "Nephrotic Syndrome (MCD, FSGS, MN)", page: "GlomerularDiseases", params: "", validated: true },
      { label: "IgA Nephropathy / IgA Vasculitis", page: "ClinicalSupport", params: "?tab=pathways&scenario=iga-vasculitis", validated: true },
      { label: "Lupus Nephritis (ISN/RPS I–VI)", page: "ClinicalSupport", params: "?tab=pathways&scenario=lupus-nephritis", validated: true },
      { label: "ANCA Vasculitis (GPA / MPA)", page: "ClinicalSupport", params: "?tab=pathways&scenario=anca-vasculitis", validated: true },
      { label: "Anti-GBM / Goodpasture", page: "GlomerularDiseases", params: "", validated: true },
      { label: "HUS / TMA / aHUS", page: "ClinicalSupport", params: "?tab=pathways&scenario=hemolytic-uremic", validated: true },
      { label: "C3 Glomerulopathy (C3GN / DDD)", page: "GlomerularDiseases", params: "", validated: true },
      { label: "PSGN / Infection-related GN", page: "ClinicalSupport", params: "?tab=pathways&scenario=post-strep-gn", validated: true },
      { label: "Congenital Nephrotic Syndrome", page: "ClinicalSupport", params: "?tab=pathways&scenario=congenital-nephrotic", validated: true },
      { label: "Alport Syndrome / COL4 Nephropathy", page: "GlomerularDiseases", params: "", validated: true },
    ],
  },
  {
    group: "Acute Kidney Injury",
    icon: Heart,
    color: "from-red-600 to-rose-600",
    groupPage: "ClinicalSupport",
    groupParams: "?tab=scenarios",
    count: 6,
    items: [
      { label: "KDIGO AKI staging (pRIFLE / KDIGO)", page: "ClinicalSupport", params: "?tab=pathways&scenario=aki-prifle", validated: true },
      { label: "Pre-renal vs intrinsic vs post-renal", page: "ClinicalApproaches", params: "", validated: true },
      { label: "AKI in neonates", page: "ClinicalSupport", params: "?tab=pathways&scenario=aki-prifle", validated: true },
      { label: "Nephrotoxin stewardship", page: "ClinicalSupport", params: "?tab=pathways&scenario=contrast-nephropathy", validated: true },
      { label: "AKI-to-CKD transition monitoring", page: "ClinicalSupport", params: "?tab=pathways&scenario=ckd-comprehensive", validated: true },
      { label: "Fluid management in AKI", page: "ClinicalSupport", params: "?tab=pathways&scenario=fluid-electrolyte", validated: true },
    ],
  },
  {
    group: "Chronic Kidney Disease",
    icon: Shield,
    color: "from-blue-600 to-indigo-600",
    groupPage: "ClinicalSupport",
    groupParams: "?tab=pathways&scenario=ckd-comprehensive",
    count: 7,
    items: [
      { label: "CKD staging (KDIGO G1–G5)", page: "ClinicalSupport", params: "?tab=pathways&scenario=ckd-staging", validated: true },
      { label: "CKD-MBD (mineral bone disease)", page: "ClinicalSupport", params: "?tab=pathways&scenario=ckd-mbd", validated: true },
      { label: "Anemia of CKD (EPO, iron)", page: "ClinicalSupport", params: "?tab=pathways&scenario=ckd-anemia-mbd", validated: true },
      { label: "Growth failure in CKD", page: "Anthropometry", params: "", validated: true },
      { label: "Nutrition in CKD", page: "NutritionHub", params: "", validated: true },
      { label: "Cardiovascular risk in CKD", page: "ClinicalSupport", params: "?tab=pathways&scenario=ckd-comprehensive", validated: true },
      { label: "CKD progression monitoring", page: "ClinicalSupport", params: "?tab=pathways&scenario=ckd-staging", validated: true },
    ],
  },
  {
    group: "Metabolic & Genetic",
    icon: Brain,
    color: "from-purple-600 to-violet-600",
    groupPage: "ClinicalApproaches",
    groupParams: "",
    count: 6,
    items: [
      { label: "Cystinosis", page: "ClinicalApproaches", params: "", validated: true },
      { label: "Fabry disease", page: "GeneticReportAnalyzer", params: "", validated: true },
      { label: "Primary hyperoxaluria", page: "ClinicalSupport", params: "?tab=pathways&scenario=cystic-kidney", validated: true },
      { label: "Polycystic kidney disease (ARPKD/ADPKD)", page: "ClinicalSupport", params: "?tab=pathways&scenario=cystic-kidney", validated: true },
      { label: "Nephronophthisis / ciliopathies", page: "ClinicalSupport", params: "?tab=pathways&scenario=cystic-kidney", validated: true },
      { label: "Genetic nephrotic syndromes", page: "ClinicalSupport", params: "?tab=pathways&scenario=congenital-nephrotic", validated: true },
    ],
  },
];

function PathwayGroup({ pathway }) {
  const [open, setOpen] = useState(false);
  const Icon = pathway.icon;

  const groupHref = `/${pathway.groupPage}${pathway.groupParams}`;

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      <CardContent className="p-0">
        {/* Header row */}
        <div className="flex items-center gap-2 px-4 py-3">
          {/* Clickable group title */}
          <a href={groupHref} className="flex items-center gap-3 flex-1 min-w-0 group">
            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${pathway.color} flex items-center justify-center shrink-0`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-slate-800 group-hover:text-blue-700 transition-colors">{pathway.group}</p>
              <p className="text-xs text-slate-500">{pathway.count} pathways</p>
            </div>
          </a>

          {/* Expand/collapse toggle */}
          <button
            className="ml-2 p-1.5 rounded hover:bg-slate-100 transition-colors shrink-0"
            onClick={() => setOpen(v => !v)}
            aria-label={open ? "Collapse" : "Expand"}
          >
            {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>
        </div>

        {/* Expanded items */}
        {open && (
          <div className="px-4 pb-4 border-t border-slate-100 pt-3 space-y-1">
            {pathway.items.map((item, i) => {
              const href = `/${item.page}${item.params}`;
              return (
                <a key={i} href={href}>
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-blue-50 transition-colors group cursor-pointer">
                    <ArrowRight className="w-3 h-3 text-blue-500 flex-shrink-0" />
                    <p className="text-xs text-slate-700 group-hover:text-blue-700 transition-colors flex-1">{item.label}</p>
                    {item.validated
                      ? <CheckCircle className="w-3 h-3 text-green-400 shrink-0" />
                      : <Badge className="text-xs bg-slate-100 text-slate-500 px-1 py-0">Soon</Badge>
                    }
                  </div>
                </a>
              );
            })}
            <a href={groupHref}>
              <Button size="sm" variant="outline" className="mt-2 text-xs border-blue-200 text-blue-700 hover:bg-blue-50 w-full">
                <ExternalLink className="w-3 h-3 mr-1" /> Open Full Module
              </Button>
            </a>
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
      <p className="text-xs text-slate-500 flex items-center gap-1">
        <CheckCircle className="w-3 h-3 text-green-500" /> = validated canonical content exists
      </p>
      <div className="space-y-2">
        {PATHWAYS.map((p, i) => (
          <PathwayGroup key={i} pathway={p} />
        ))}
      </div>
    </div>
  );
}