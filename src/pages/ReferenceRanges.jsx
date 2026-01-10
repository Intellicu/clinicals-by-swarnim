import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Search, FlaskConical } from "lucide-react";

export default function ReferenceRanges() {
  const [searchQuery, setSearchQuery] = useState("");

  const labRanges = {
    electrolytes: [
      { test: "Sodium", range: "135-145 mEq/L", critical: "<120 or >160" },
      { test: "Potassium", range: "3.5-5.5 mEq/L", critical: "<2.5 or >6.5" },
      { test: "Chloride", range: "98-107 mEq/L", critical: "" },
      { test: "Bicarbonate", range: "22-26 mEq/L", critical: "<10 or >40" },
      { test: "Calcium (total)", range: "8.8-10.8 mg/dL", critical: "<7 or >13" },
      { test: "Calcium (ionized)", range: "4.6-5.3 mg/dL", critical: "<3.5" },
      { test: "Phosphate", range: "4.0-7.0 mg/dL (infant-child)", critical: "" },
      { test: "Magnesium", range: "1.7-2.2 mg/dL", critical: "<1.0" },
    ],
    kidney: [
      { test: "Creatinine (infant)", range: "0.2-0.4 mg/dL", critical: "" },
      { test: "Creatinine (1-2y)", range: "0.2-0.5 mg/dL", critical: "" },
      { test: "Creatinine (2+ y)", range: "0.3-0.7 mg/dL", critical: "" },
      { test: "Creatinine (adolescent)", range: "0.5-1.0 mg/dL", critical: "" },
      { test: "BUN", range: "7-20 mg/dL", critical: ">100" },
      { test: "eGFR (Schwartz)", range: ">90 mL/min/1.73m²", critical: "<15" },
      { test: "Uric acid", range: "3.0-7.0 mg/dL", critical: "" },
    ],
    hematology: [
      { test: "Hemoglobin (newborn)", range: "14-24 g/dL", critical: "" },
      { test: "Hemoglobin (infant)", range: "10-15 g/dL", critical: "<7" },
      { test: "Hemoglobin (child)", range: "11-16 g/dL", critical: "<7" },
      { test: "WBC", range: "5,000-15,000/μL", critical: "<1,000" },
      { test: "Platelets", range: "150,000-400,000/μL", critical: "<20,000" },
    ],
    liver: [
      { test: "Albumin", range: "3.5-5.0 g/dL", critical: "<2.0" },
      { test: "Total protein", range: "6.0-8.0 g/dL", critical: "" },
      { test: "ALT", range: "7-40 U/L", critical: ">1000" },
      { test: "AST", range: "15-40 U/L", critical: ">1000" },
      { test: "Bilirubin (total)", range: "<1.2 mg/dL", critical: ">15" },
    ],
    abg: [
      { test: "pH", range: "7.35-7.45", critical: "<7.20 or >7.60" },
      { test: "pCO2", range: "35-45 mmHg", critical: "<20 or >70" },
      { test: "pO2", range: "80-100 mmHg", critical: "<60" },
      { test: "HCO3", range: "22-26 mEq/L", critical: "<10 or >40" },
      { test: "Base excess", range: "-2 to +2", critical: "" },
    ],
    urine: [
      { test: "Urine pH", range: "4.5-8.0", critical: "" },
      { test: "Specific gravity", range: "1.005-1.030", critical: "" },
      { test: "Protein (random)", range: "<10 mg/dL", critical: "" },
      { test: "UPCR", range: "<0.2 mg/mg", critical: ">2.0" },
      { test: "Urine Na", range: "40-220 mEq/L", critical: "" },
      { test: "Urine K", range: "25-125 mEq/L", critical: "" },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        <Link to={createPageUrl("Hub")}>
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-600 to-cyan-700 rounded-xl flex items-center justify-center shadow-lg">
              <FlaskConical className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Laboratory Reference Ranges</h1>
              <p className="text-slate-600">Pediatric normal values and critical limits</p>
            </div>
          </div>

          <div className="mt-4 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search lab tests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-3 border-slate-300"
            />
          </div>
        </div>

        <Tabs defaultValue="electrolytes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="electrolytes">Electrolytes</TabsTrigger>
            <TabsTrigger value="kidney">Kidney</TabsTrigger>
            <TabsTrigger value="hematology">Hematology</TabsTrigger>
            <TabsTrigger value="liver">Liver</TabsTrigger>
            <TabsTrigger value="abg">ABG</TabsTrigger>
            <TabsTrigger value="urine">Urine</TabsTrigger>
          </TabsList>

          {Object.entries(labRanges).map(([category, tests]) => (
            <TabsContent key={category} value={category}>
              <Card className="bg-white shadow-lg">
                <CardHeader className="bg-slate-50 border-b">
                  <CardTitle className="text-lg capitalize">{category} Reference Ranges</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-100">
                        <tr>
                          <th className="text-left p-4 text-sm font-semibold text-slate-700">Test</th>
                          <th className="text-left p-4 text-sm font-semibold text-slate-700">Normal Range</th>
                          <th className="text-left p-4 text-sm font-semibold text-slate-700">Critical Values</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tests
                          .filter(test => 
                            searchQuery === "" || 
                            test.test.toLowerCase().includes(searchQuery.toLowerCase())
                          )
                          .map((test, idx) => (
                          <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="p-4 text-sm font-medium text-slate-900">{test.test}</td>
                            <td className="p-4 text-sm text-slate-700">
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                                {test.range}
                              </Badge>
                            </td>
                            <td className="p-4 text-sm text-slate-700">
                              {test.critical ? (
                                <Badge className="bg-red-100 text-red-800 border-red-300">
                                  {test.critical}
                                </Badge>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Reference ranges vary by age, lab methodology, and patient population. 
              Always verify with your local laboratory. Critical values require immediate clinical action.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}