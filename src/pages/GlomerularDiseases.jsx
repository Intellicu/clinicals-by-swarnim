import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import GlomerularDiseasesPathway from "../components/pathways/GlomerularDiseasesPathway";

export default function GlomerularDiseases() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Link to={createPageUrl("ClinicalSupport")}>
            <Button variant="outline" size="sm"><ArrowLeft className="w-4 h-4 mr-1" />Pathways</Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Glomerular Disease Pathways</h1>
            <p className="text-sm text-slate-600">FSGS · IgA Nephropathy · Membranous GN · C3GN · Lupus Nephritis · MPGN</p>
          </div>
        </div>
        <GlomerularDiseasesPathway />
      </div>
    </div>
  );
}