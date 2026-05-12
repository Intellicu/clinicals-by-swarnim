import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FlaskConical, ChevronDown, ChevronUp, ArrowRight, ExternalLink } from "lucide-react";

const GN_CONDITIONS = [
  { name: "Minimal Change Disease (MCD)", tag: "Nephrotic", color: "bg-purple-100 text-purple-800", keys: ["Empirical steroids in children", "No biopsy first episode", "Prednisolone 60 mg/m² × 4–6 wks", "SR: >90% children"] },
  { name: "FSGS", tag: "Nephrotic", color: "bg-purple-100 text-purple-800", keys: ["Biopsy essential", "Steroid trial 8–16 wks", "Calcineurin inhibitors second-line", "Genetic testing in children"] },
  { name: "Membranous Nephropathy (MN)", tag: "Nephrotic", color: "bg-purple-100 text-purple-800", keys: ["PLA2R antibody testing", "KDIGO 2021 — conservative first", "Rituximab preferred over CYC", "Monitor PLA2R titres"] },
  { name: "IgA Nephropathy (IgAN)", tag: "Haematuria/Mixed", color: "bg-rose-100 text-rose-800", keys: ["Oxford MEST-C score", "SGLT2i: nephroprotection", "Budesonide if high risk", "ACEi/ARB first-line"] },
  { name: "IgA Vasculitis (HSP) Nephritis", tag: "Vasculitis", color: "bg-orange-100 text-orange-800", keys: ["ISKDC criteria", "UPCR monitoring", "Steroids if nephrotic/nephritic", "KDIGO 2021 guidance"] },
  { name: "Lupus Nephritis (LN)", tag: "Autoimmune", color: "bg-pink-100 text-pink-800", keys: ["ISN/RPS class I–VI", "MPA + steroids standard", "Belimumab/voclosporin add-on", "Renal biopsy mandatory"] },
  { name: "ANCA Vasculitis (GPA/MPA)", tag: "Vasculitis", color: "bg-orange-100 text-orange-800", keys: ["Rituximab preferred over CYC", "Pulse MP induction", "ANCA monitoring", "Maintenance 12–24 months"] },
  { name: "HUS / TMA", tag: "TMA", color: "bg-red-100 text-red-800", keys: ["STEC-HUS: supportive", "aHUS: Eculizumab urgent", "ADAMTS13 for TTP", "Plasma exchange in TTP"] },
  { name: "Nephrotic Syndrome (Childhood)", tag: "Nephrotic", color: "bg-purple-100 text-purple-800", keys: ["ISKDC protocol", "Relapse: >3+ dipstick × 3 days", "Frequent relapse: MMF / Levamisole", "SRNS: CNI / Rituximab"] },
  { name: "PSGN", tag: "Nephritic", color: "bg-blue-100 text-blue-800", keys: ["ASO / anti-DNase B", "Low C3, normal C4", "Mostly self-limiting", "HTN management key"] },
  { name: "C3 Glomerulopathy (C3G)", tag: "Complement", color: "bg-indigo-100 text-indigo-800", keys: ["DDD + C3GN", "Low C3, normal C4", "Genetic complement variants", "Eculizumab/avacopan in trials"] },
  { name: "Congenital Nephrotic Syndrome", tag: "Genetic", color: "bg-indigo-100 text-indigo-800", keys: ["NPHS1/NPHS2", "No steroids", "Bilateral nephrectomy + transplant", "Genetic testing mandatory"] },
];

export default function HubGlomerularPanel() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");
  const [open, setOpen] = useState(null);
  const filters = ["All", "Nephrotic", "Haematuria/Mixed", "Vasculitis", "Autoimmune", "TMA", "Nephritic", "Complement", "Genetic"];
  const filtered = filter === "All" ? GN_CONDITIONS : GN_CONDITIONS.filter(c => c.tag === filter);

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-pink-700 to-rose-600 p-5 text-white">
        <div className="flex items-center gap-3">
          <FlaskConical className="w-7 h-7" />
          <div>
            <h2 className="text-xl font-bold">Glomerular Diseases & GN</h2>
            <p className="text-pink-100 text-sm">KDIGO 2021 · ISKDC · NS · RPGN · Vasculitis · TMA · C3G</p>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${filter === f ? "bg-pink-600 text-white border-pink-600" : "bg-white text-slate-600 border-slate-200 hover:border-pink-300"}`}>
            {f}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {filtered.map((cond, i) => (
          <Card key={i} className="border-slate-200 shadow-sm">
            <CardContent className="p-0">
              <button className="w-full flex items-center justify-between p-3 text-left" onClick={() => setOpen(open === i ? null : i)}>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm text-slate-800">{cond.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cond.color}`}>{cond.tag}</span>
                </div>
                {open === i ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
              </button>
              {open === i && (
                <div className="px-3 pb-3 border-t border-slate-100 pt-2 space-y-1">
                  {cond.keys.map((k, j) => (
                    <div key={j} className="flex items-start gap-2">
                      <ArrowRight className="w-3 h-3 text-pink-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-700">{k}</p>
                    </div>
                  ))}
                  <Button size="sm" variant="outline"
                    className="mt-2 text-xs border-pink-200 text-pink-700 hover:bg-pink-50"
                    onClick={() => navigate("/GlomerularDiseases")}>
                    <ExternalLink className="w-3 h-3 mr-1" /> Full GN Pathways
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-slate-200 bg-slate-50">
        <CardContent className="p-3">
          <p className="text-xs font-bold text-slate-500 mb-1">References</p>
          <p className="text-xs text-slate-600">KDIGO 2021 Glomerular Diseases · ISKDC Criteria · IPNA Clinical Practice Recommendations · SHARE Guidelines</p>
        </CardContent>
      </Card>
    </div>
  );
}