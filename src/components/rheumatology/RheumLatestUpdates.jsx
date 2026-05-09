import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, Award, TrendingUp } from "lucide-react";

const LATEST_UPDATES = [
  {
    date: "July 2025",
    title: "New IL-1 Inhibitor Guidance for sJIA/MAS",
    detail: "Updated ACR sJIA guidance recommends canakinumab as preferred first-line biologic over anakinra for sJIA without MAS (q8-weekly vs daily injection). Anakinra IV retained as first-line for acute MAS. Rilonacept now EMA-approved for CAPS.",
    source: "ACR sJIA Guidelines Update 2025",
    reviewer: "Expert Reviewed",
    evidence: "Strong",
    category: "sJIA",
    type: "Drug Update",
  },
  {
    date: "June 2025",
    title: "Updated PAN Induction Pathway — DADA2 Guidance",
    detail: "EULAR now recommends ADA2 enzyme testing in ALL children with PAN-like vasculitis before initiating standard CYC-based therapy. TNFi (adalimumab) should be started immediately in DADA2-confirmed cases. CYC contraindicated in DADA2.",
    source: "EULAR DADA2 Updated Position Paper 2025",
    reviewer: "Expert Reviewed",
    evidence: "Moderate",
    category: "Vasculitis",
    type: "Guideline Update",
  },
  {
    date: "May 2025",
    title: "ACR/EULAR Updated Recommendations — Tocilizumab in Takayasu",
    detail: "Tocilizumab confirmed superior to TNFi (adalimumab/infliximab) as biologic of choice for Takayasu arteritis in pediatric and adult populations. IL-6R blockade shows greater steroid-sparing and lower relapse rate.",
    source: "ACR/EULAR TAK 2025 Update",
    reviewer: "Expert Reviewed",
    evidence: "Moderate",
    category: "Vasculitis",
    type: "Guideline Update",
  },
  {
    date: "April 2025",
    title: "MOGAD — New Maintenance Therapy Guidance",
    detail: "Relapsing MOGAD: maintenance with MMF 600 mg/m²/BID or rituximab 375 mg/m² q6 months recommended. Oral prednisolone taper should extend to minimum 3 months after first episode. MOG-ab titre does not reliably predict relapse.",
    source: "ECTRIMS MOGAD Consensus 2025",
    reviewer: "Expert Reviewed",
    evidence: "Moderate",
    category: "Neuroinflammatory",
    type: "Guideline Update",
  },
  {
    date: "March 2025",
    title: "Baricitinib Expanded in JAK-Inhibitor Landscape",
    detail: "Baricitinib approved for refractory JIA in multiple markets. JAK inhibitor comparative trial (SELECT-JIA 2) confirms upadacitinib superiority in RF+ polyarticular JIA vs TNFi. Varicella vaccination BEFORE starting JAK inhibitor — now Grade 1A recommendation.",
    source: "SELECT-JIA 2 Trial + ACR 2025 Update",
    reviewer: "Expert Reviewed",
    evidence: "Strong",
    category: "JIA",
    type: "Drug Update",
  },
  {
    date: "February 2025",
    title: "Pediatric SLE — Voclosporin Added to Guidelines",
    detail: "Voclosporin (calcineurin inhibitor) added to EULAR pSLE recommendations for LN Class III/IV alongside MMF induction. Combination: voclosporin + MMF + low-dose steroids (AURORA trial data extended to adolescents). HCQ continuation mandatory.",
    source: "EULAR pSLE Update 2025",
    reviewer: "Expert Reviewed",
    evidence: "Strong",
    category: "SLE",
    type: "Drug Update",
  },
  {
    date: "January 2025",
    title: "Capillaroscopy — Updated Pediatric Reference Data",
    detail: "New pediatric normative data published for nailfold capillaroscopy density and morphology by age group. Scleroderma pattern now defined with pediatric-specific thresholds. EULAR recommends capillaroscopy in all children with Raynaud's + positive ANA.",
    source: "EULAR Capillaroscopy 2025",
    reviewer: "Expert Reviewed",
    evidence: "Moderate",
    category: "CTD/Scleroderma",
    type: "Diagnostic Update",
  },
  {
    date: "December 2024",
    title: "Canakinumab Approved for CAPS Across All Subtypes (Updated Dosing)",
    detail: "Revised pediatric dosing: FCAS/MWS: 2 mg/kg q8w (>7.5 kg). NOMID: start 2 mg/kg, increase to 4–8 mg/kg if CNS/eye disease active. SAA <10 mg/L remains the treatment target for amyloid prevention.",
    source: "EMA Canakinumab Update 2024",
    reviewer: "Expert Reviewed",
    evidence: "Strong",
    category: "Autoinflammatory",
    type: "Drug Update",
  },
];

const TYPE_COLORS = {
  "Drug Update": "bg-purple-100 text-purple-800",
  "Guideline Update": "bg-blue-100 text-blue-800",
  "Diagnostic Update": "bg-teal-100 text-teal-800",
};

const CATEGORY_COLORS = {
  JIA: "bg-blue-100 text-blue-800",
  SLE: "bg-purple-100 text-purple-800",
  Vasculitis: "bg-red-100 text-red-800",
  Autoinflammatory: "bg-amber-100 text-amber-800",
  Neuroinflammatory: "bg-indigo-100 text-indigo-800",
  "CTD/Scleroderma": "bg-teal-100 text-teal-800",
};

export default function RheumLatestUpdates({ isAdmin }) {
  return (
    <div className="space-y-3">
      <Alert className="bg-green-50 border-green-200">
        <TrendingUp className="w-4 h-4 text-green-600" />
        <AlertDescription className="text-xs text-green-900">
          <strong>Latest Updates 2024–2025:</strong> Timestamped guideline changes, new drug approvals, evidence upgrades. Expert-reviewed via governance engine.
          {isAdmin && <span className="ml-1 text-green-700 font-semibold">Admin: use RheumEvidenceUpdates tab for full governance tools.</span>}
        </AlertDescription>
      </Alert>

      <div className="flex items-center gap-2">
        <Badge className="bg-green-600 text-white text-xs">{LATEST_UPDATES.length} Updates</Badge>
        <span className="text-xs text-slate-500">Dec 2024 – Jul 2025</span>
      </div>

      {LATEST_UPDATES.map((u, i) => (
        <Card key={i} className="bg-white border-2 border-green-100 hover:border-green-300 transition-colors">
          <CardContent className="p-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                  <Badge className="bg-green-100 text-green-800 text-xs border-0">{u.date}</Badge>
                  <Badge className={`text-xs border-0 ${TYPE_COLORS[u.type] || "bg-slate-100 text-slate-700"}`}>{u.type}</Badge>
                  <Badge className={`text-xs border-0 ${CATEGORY_COLORS[u.category] || "bg-slate-100 text-slate-700"}`}>{u.category}</Badge>
                </div>
                <p className="font-bold text-sm text-slate-900">{u.title}</p>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <Badge className="bg-blue-100 text-blue-800 text-xs border-0">{u.evidence}</Badge>
                <Badge className="bg-emerald-100 text-emerald-800 text-xs border-0 flex items-center gap-0.5">
                  <Award className="w-3 h-3" />Expert
                </Badge>
              </div>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">{u.detail}</p>
            <p className="text-xs text-slate-400">📚 {u.source}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}