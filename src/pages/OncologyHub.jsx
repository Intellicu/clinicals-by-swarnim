import React from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, FlaskConical, Calculator, AlertTriangle, Lock, Calendar, Shield, Zap } from "lucide-react";
import FeedbackReportButton from "../components/FeedbackReportButton";
import { createPageUrl } from "@/utils";
import OncologyEngine from "../components/engines/OncologyEngine";
import {
  SchwartzGFRCalc,
  CarboplatinDoseCalc,
  AnthracyclineTracker,
  HaemRecoveryGate,
  SIOPBostonReference,
} from "../components/oncology/OncologyToxicityTools";
import TreatmentTimeline from "../components/oncology/TreatmentTimeline";
import OncologyDosingCalculator from "../components/oncology/OncologyDosingCalculator";
import RiskStratificationTool from "../components/oncology/RiskStratificationTool";
import InteractionChecker from "../components/oncology/InteractionChecker";

export default function OncologyHub() {
  const { data: user } = useQuery({ queryKey: ["me"], queryFn: () => base44.auth.me() });
  const isAdmin = user?.role === "admin";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 p-3 md:p-6">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <Link to={createPageUrl("Hub")}>
              <Button variant="outline" size="sm"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <FlaskConical className="w-6 h-6 text-purple-600" /> Pediatric Oncology
              </h1>
              <p className="text-slate-500 text-xs mt-0.5">Protocol library · Drug schedules · Toxicity tools</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <FeedbackReportButton pageName="OncologyHub" />
            {isAdmin && (
              <Link to={createPageUrl("OncologyAdmin")}>
                <Button variant="outline" size="sm" className="border-purple-300 text-purple-700 hover:bg-purple-50">
                  <Lock className="w-3.5 h-3.5 mr-1.5" /> Admin
                </Button>
              </Link>
            )}
          </div>
        </div>

        <Tabs defaultValue="protocols">
          <TabsList className="bg-purple-100 rounded-xl h-auto gap-1 p-1 flex-wrap">
            <TabsTrigger value="protocols" className="text-xs px-3 py-1.5 rounded-lg data-[state=active]:bg-white">
              <FlaskConical className="w-3.5 h-3.5 mr-1" /> Protocols
            </TabsTrigger>
            <TabsTrigger value="timeline" className="text-xs px-3 py-1.5 rounded-lg data-[state=active]:bg-white">
              <Calendar className="w-3.5 h-3.5 mr-1" /> Timeline
            </TabsTrigger>
            <TabsTrigger value="dosing" className="text-xs px-3 py-1.5 rounded-lg data-[state=active]:bg-white">
              <Calculator className="w-3.5 h-3.5 mr-1" /> Dose Calc
            </TabsTrigger>
            <TabsTrigger value="risk" className="text-xs px-3 py-1.5 rounded-lg data-[state=active]:bg-white">
              <Shield className="w-3.5 h-3.5 mr-1" /> Risk Strat
            </TabsTrigger>
            <TabsTrigger value="interactions" className="text-xs px-3 py-1.5 rounded-lg data-[state=active]:bg-white">
              <Zap className="w-3.5 h-3.5 mr-1" /> Interactions
            </TabsTrigger>
            <TabsTrigger value="tools" className="text-xs px-3 py-1.5 rounded-lg data-[state=active]:bg-white">
              <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Toxicity Tools
            </TabsTrigger>
          </TabsList>

          <TabsContent value="protocols" className="mt-4">
            <OncologyEngine />
          </TabsContent>

          <TabsContent value="timeline" className="mt-4">
            <TreatmentTimeline />
          </TabsContent>

          <TabsContent value="dosing" className="mt-4">
            <OncologyDosingCalculator />
          </TabsContent>

          <TabsContent value="risk" className="mt-4">
            <RiskStratificationTool />
          </TabsContent>

          <TabsContent value="interactions" className="mt-4">
            <InteractionChecker />
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