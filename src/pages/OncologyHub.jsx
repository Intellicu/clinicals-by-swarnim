import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, FlaskConical, Calculator, AlertTriangle, Lock, Loader2 } from "lucide-react";
import { createPageUrl } from "@/utils";
import OncologyProtocolCard from "../components/oncology/OncologyProtocolCard";
import {
  SchwartzGFRCalc,
  CarboplatinDoseCalc,
  AnthracyclineTracker,
  HaemRecoveryGate,
  SIOPBostonReference,
} from "../components/oncology/OncologyToxicityTools";

export default function OncologyHub() {
  const { data: user } = useQuery({ queryKey: ["me"], queryFn: () => base44.auth.me() });
  const isAdmin = user?.role === "admin";

  const { data: guidelines = [], isLoading: loadingGuidelines } = useQuery({
    queryKey: ["oncology-guidelines", isAdmin],
    queryFn: async () => {
      const all = await base44.entities.Guideline.filter({ category: "Oncology" });
      // Non-admins: only Published + EXPERT_REVIEWED
      if (!isAdmin) return all.filter(g => g.status === "Published" && g.review_status === "EXPERT_REVIEWED");
      return all;
    },
    enabled: user !== undefined,
  });

  const { data: allDrugs = [] } = useQuery({
    queryKey: ["onco-drugs"],
    queryFn: () => base44.entities.Drug.filter({}),
  });
  const drugs = allDrugs.filter(d => d.category?.startsWith("Chemotherapy"));

  const { data: doseRules = [] } = useQuery({
    queryKey: ["onco-doserules"],
    queryFn: () => base44.entities.DoseRule.filter({}),
  });

  const pendingCount = guidelines.filter(g => g.status !== "Published" || g.review_status !== "EXPERT_REVIEWED").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 p-3 md:p-6">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link to={createPageUrl("Hub")}>
            <Button variant="outline" size="sm"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
          </Link>
        </div>

        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <FlaskConical className="w-7 h-7 text-purple-600" /> Pediatric Oncology
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Protocol library, risk stratification, drug regimens & toxicity monitoring tools
            </p>
          </div>
          {isAdmin && (
            <Link to={createPageUrl("OncologyAdmin")}>
              <Button variant="outline" size="sm" className="border-purple-300 text-purple-700 hover:bg-purple-50">
                <Lock className="w-3.5 h-3.5 mr-1.5" /> Admin — Manage Protocols
              </Button>
            </Link>
          )}
        </div>

        {/* Expert-review gate notice for non-admins */}
        {!isAdmin && guidelines.length === 0 && !loadingGuidelines && (
          <Alert className="bg-amber-50 border-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              No oncology protocols are currently published. Protocols are visible once an admin marks them as Expert Reviewed and Published.
            </AlertDescription>
          </Alert>
        )}

        {isAdmin && pendingCount > 0 && (
          <Alert className="bg-amber-50 border-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>{pendingCount} protocol(s)</strong> are AI-generated / Draft and not yet visible to regular users.{" "}
              <Link to={createPageUrl("OncologyAdmin")} className="underline font-semibold">Review & publish →</Link>
            </AlertDescription>
          </Alert>
        )}

        <Alert className="bg-red-50 border-red-300">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <AlertDescription className="text-red-800 text-xs">
            <strong>IMPORTANT:</strong> All protocols are decision-support only. They are not a substitute for institutional protocol, specialist oncology consultation, or independent clinical judgment. Verify all drug doses against your current institutional formulary before administration.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="protocols">
          <TabsList className="bg-purple-100 rounded-xl h-auto gap-1 p-1">
            <TabsTrigger value="protocols" className="text-xs px-3 py-1.5 rounded-lg data-[state=active]:bg-white">
              <FlaskConical className="w-3.5 h-3.5 mr-1" /> Protocols ({guidelines.length})
            </TabsTrigger>
            <TabsTrigger value="tools" className="text-xs px-3 py-1.5 rounded-lg data-[state=active]:bg-white">
              <Calculator className="w-3.5 h-3.5 mr-1" /> Toxicity Tools
            </TabsTrigger>
          </TabsList>

          <TabsContent value="protocols" className="mt-4 space-y-3">
            {loadingGuidelines ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
              </div>
            ) : guidelines.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <FlaskConical className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No published oncology protocols available.</p>
              </div>
            ) : (
              guidelines.map(g => (
                <OncologyProtocolCard
                  key={g.id}
                  guideline={g}
                  drugs={drugs}
                  doseRules={doseRules}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="tools" className="mt-4">
            <div className="grid md:grid-cols-2 gap-4">
              <SchwartzGFRCalc />
              <CarboplatinDoseCalc />
              <AnthracyclineTracker />
              <HaemRecoveryGate />
              <div className="md:col-span-2">
                <SIOPBostonReference />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}