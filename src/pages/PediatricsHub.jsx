import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Baby, Syringe, Scale, TrendingUp, Activity } from "lucide-react";
import GrowthMonitoringPathway from "../components/pathways/GrowthMonitoringPathway";
import VaccinationPathway from "../components/pathways/VaccinationPathway";
import PediatricNutritionPathway from "../components/pathways/PediatricNutritionPathway";

export default function PediatricsHub() {
  const [activeTab, setActiveTab] = useState("growth");

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to={createPageUrl("Hub")}>
            <Button variant="outline" size="sm"><ArrowLeft className="w-4 h-4 mr-1" />Back</Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Baby className="w-7 h-7 text-green-600" />
              General Pediatrics Hub
            </h1>
            <p className="text-sm text-slate-600">IAP Guidelines — Growth · Vaccination · Nutrition</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="growth" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />Growth Monitoring
            </TabsTrigger>
            <TabsTrigger value="vaccination" className="flex items-center gap-2">
              <Syringe className="w-4 h-4" />Vaccination
            </TabsTrigger>
            <TabsTrigger value="nutrition" className="flex items-center gap-2">
              <Scale className="w-4 h-4" />Nutrition (IAP)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="growth"><GrowthMonitoringPathway /></TabsContent>
          <TabsContent value="vaccination"><VaccinationPathway /></TabsContent>
          <TabsContent value="nutrition"><PediatricNutritionPathway /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}