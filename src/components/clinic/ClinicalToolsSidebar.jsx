import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, Brain, Microscope, X, TestTube, ScanLine, Stethoscope } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BiopsyAnalyzer from '../clinical-ai/BiopsyAnalyzer';
import RadiologyAnalyzer from '../clinical-ai/RadiologyAnalyzer';
import LabReportAnalyzer from '../clinical-ai/LabReportAnalyzer';
import ClinicalCaseAnalyzer from '../clinical-ai/ClinicalCaseAnalyzer';

export default function ClinicalToolsSidebar({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-[500px] bg-white border-l-2 border-slate-200 shadow-2xl z-50 overflow-auto">
      <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-lg">Clinical Tools</h2>
          <p className="text-sm text-purple-100">AI Agents & Calculators</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link to={createPageUrl('ClinicalToolsHub')} target="_blank">
              <Button variant="outline" className="w-full justify-start">
                <Calculator className="w-4 h-4 mr-2" />
                Clinical Calculators
              </Button>
            </Link>
            <Link to={createPageUrl('AIAssistant')} target="_blank">
              <Button variant="outline" className="w-full justify-start">
                <Brain className="w-4 h-4 mr-2" />
                AI Clinical Assistant
              </Button>
            </Link>
            <Link to={createPageUrl('ClinicalSupport')} target="_blank">
              <Button variant="outline" className="w-full justify-start">
                <Microscope className="w-4 h-4 mr-2" />
                Clinical Pathways
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">AI Analysis Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="biopsy">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="biopsy" className="text-xs">
                  <Microscope className="w-3 h-3 mr-1" />
                  Biopsy
                </TabsTrigger>
                <TabsTrigger value="labs" className="text-xs">
                  <TestTube className="w-3 h-3 mr-1" />
                  Labs
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="biopsy" className="mt-4">
                <BiopsyAnalyzer />
              </TabsContent>
              
              <TabsContent value="labs" className="mt-4">
                <LabReportAnalyzer />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}