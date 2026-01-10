
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Pill,
  ExternalLink,
  Search,
  Calculator,
  AlertTriangle,
  Info,
  BookOpen,
  Activity,
  Beaker
} from "lucide-react";
import { usePatient } from "../components/PatientContext";

export default function DrugCalculator() {
  const { patientData } = usePatient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [activeTab, setActiveTab] = useState("search");

  const { data: drugs = [] } = useQuery({
    queryKey: ['drugs'],
    queryFn: () => base44.entities.Drug.list(),
    initialData: [],
  });

  const filteredDrugs = drugs.filter(drug =>
    drug.generic_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    drug.brands?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    drug.therapeutic_class?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const drugsByClass = drugs.reduce((acc, drug) => {
    const className = drug.therapeutic_class || "Other";
    if (!acc[className]) acc[className] = [];
    acc[className].push(drug);
    return acc;
  }, {});

  const handleDrugSelect = (drug) => {
    setSelectedDrug(drug);
    setActiveTab("details");
  };

  const getFormulationBadgeColor = (form) => {
    const colors = {
      "tablet": "bg-blue-100 text-blue-800",
      "capsule": "bg-purple-100 text-purple-800",
      "syrup": "bg-green-100 text-green-800",
      "suspension": "bg-teal-100 text-teal-800",
      "injection": "bg-red-100 text-red-800",
      "powder": "bg-amber-100 text-amber-800"
    };
    return colors[form] || "bg-slate-100 text-slate-800";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <Link to={createPageUrl("Hub")}>
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Hub
          </Button>
        </Link>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Pill className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Drug Calculator & Database</h1>
                <p className="text-slate-600">Comprehensive pediatric nephrology drug reference with Indian formulations</p>
              </div>
            </div>
          </div>

          {/* External Calculator Link */}
          <Alert className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300">
            <Calculator className="w-5 h-5 text-blue-600" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <div>
                  <strong className="text-blue-900">Advanced Drug Dose Calculator</strong>
                  <p className="text-sm text-blue-800 mt-1">
                    Access the full-featured CliniDose drug calculator with weight-based, BSA-based, and renal-adjusted dosing
                  </p>
                </div>
                <a href="https://clinidose.base44.app/DrugCalculator" target="_blank" rel="noopener noreferrer">
                  <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
                    Open Calculator
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </a>
              </div>
            </AlertDescription>
          </Alert>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by drug name, brand, or class (e.g., Prednisolone, Corticosteroid, Lasix)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-6 text-lg border-slate-300 focus:border-purple-500 focus:ring-purple-500 shadow-sm"
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="search">Search Results</TabsTrigger>
            <TabsTrigger value="details" disabled={!selectedDrug}>Drug Details</TabsTrigger>
            <TabsTrigger value="classes">By Class</TabsTrigger>
            <TabsTrigger value="quick">Quick Reference</TabsTrigger>
          </TabsList>

          {/* Search Results Tab */}
          <TabsContent value="search">
            {searchQuery === "" ? (
              <Card className="bg-white shadow-lg">
                <CardContent className="p-12 text-center">
                  <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-700 mb-2">Start Searching</h3>
                  <p className="text-slate-500">Enter a drug name, brand, or therapeutic class to search our comprehensive database</p>
                  <div className="mt-6 text-sm text-slate-600">
                    <p className="mb-2">Database includes:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <Badge className="bg-purple-100 text-purple-800">60+ Drugs</Badge>
                      <Badge className="bg-blue-100 text-blue-800">Indian Formulations</Badge>
                      <Badge className="bg-green-100 text-green-800">Pediatric Dosing</Badge>
                      <Badge className="bg-amber-100 text-amber-800">Renal Adjustments</Badge>
                      <Badge className="bg-red-100 text-red-800">Safety Monitoring</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : filteredDrugs.length === 0 ? (
              <Card className="bg-white shadow-lg">
                <CardContent className="p-12 text-center">
                  <AlertTriangle className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-700 mb-2">No Results Found</h3>
                  <p className="text-slate-500">No drugs match "{searchQuery}". Try a different search term.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {filteredDrugs.map((drug) => (
                  <Card
                    key={drug.id}
                    className="bg-white hover:shadow-xl transition-all cursor-pointer border-2 hover:border-purple-400"
                    onClick={() => handleDrugSelect(drug)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-bold text-slate-900">
                            {drug.generic_name}
                          </CardTitle>
                          <p className="text-sm text-slate-600 mt-1">{drug.therapeutic_class}</p>
                        </div>
                        <Badge className={`${
                          drug.pediatric_use === "Yes" ? "bg-green-100 text-green-800" :
                          drug.pediatric_use === "Conditional" ? "bg-amber-100 text-amber-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {drug.pediatric_use === "Yes" ? "Pediatric" : drug.pediatric_use}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {drug.brands && (
                        <p className="text-xs text-slate-500 mb-2">
                          <strong>Brands:</strong> {drug.brands}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {drug.renal_adjust_flag && (
                          <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-300">
                            <Activity className="w-3 h-3 mr-1" />
                            Renal Adjust
                          </Badge>
                        )}
                        {drug.tdm_required && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-300">
                            <Beaker className="w-3 h-3 mr-1" /> {/* Changed Flask to Beaker */}
                            TDM Required
                          </Badge>
                        )}
                        {drug.formulations && drug.formulations.length > 0 && (
                          <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-300">
                            {drug.formulations.length} formulation(s)
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Drug Details Tab */}
          <TabsContent value="details">
            {selectedDrug && (
              <div className="space-y-6">
                {/* Header Card */}
                <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-300">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl font-bold text-purple-900">
                          {selectedDrug.generic_name}
                        </CardTitle>
                        <p className="text-purple-700 mt-1">{selectedDrug.therapeutic_class}</p>
                        {selectedDrug.brands && (
                          <p className="text-sm text-purple-600 mt-2">
                            <strong>Brand Names:</strong> {selectedDrug.brands}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge className={`${
                          selectedDrug.pediatric_use === "Yes" ? "bg-green-500 text-white" :
                          selectedDrug.pediatric_use === "Conditional" ? "bg-amber-500 text-white" :
                          "bg-red-500 text-white"
                        } text-sm px-3 py-1`}>
                          {selectedDrug.pediatric_use === "Yes" ? "Pediatric Safe" : selectedDrug.pediatric_use}
                        </Badge>
                        {selectedDrug.renal_adjust_flag && (
                          <Badge className="bg-amber-500 text-white text-sm px-3 py-1">
                            <Activity className="w-4 h-4 mr-1" />
                            Renal Adjustment Required
                          </Badge>
                        )}
                        {selectedDrug.tdm_required && (
                          <Badge className="bg-blue-500 text-white text-sm px-3 py-1">
                            <Beaker className="w-4 h-4 mr-1" /> {/* Changed Flask to Beaker */}
                            TDM Required
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Formulations */}
                {selectedDrug.formulations && selectedDrug.formulations.length > 0 && (
                  <Card className="bg-white shadow-lg">
                    <CardHeader className="bg-slate-50 border-b">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Pill className="w-5 h-5 text-purple-600" />
                        Available Formulations (Indian Market)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        {selectedDrug.formulations.map((formulation, idx) => (
                          <Card key={idx} className="border-2 border-slate-200 hover:border-purple-400 transition-colors">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <Badge className={getFormulationBadgeColor(formulation.form)}>
                                  {formulation.form.toUpperCase()}
                                </Badge>
                                <span className="text-lg font-bold text-slate-900">
                                  {formulation.strength_mg} {formulation.unit}
                                </span>
                              </div>
                              {formulation.pack_sizes && formulation.pack_sizes.length > 0 && (
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                  <span className="font-semibold">Pack sizes:</span>
                                  {formulation.pack_sizes.join(", ")}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Clinical Notes */}
                {selectedDrug.notes && (
                  <Card className="bg-white shadow-lg">
                    <CardHeader className="bg-blue-50 border-b">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                        Clinical Notes & Dosing
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <p className="text-slate-700 leading-relaxed whitespace-pre-line">{selectedDrug.notes}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Monitoring */}
                {selectedDrug.monitoring && (
                  <Card className="bg-white shadow-lg">
                    <CardHeader className="bg-green-50 border-b">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Activity className="w-5 h-5 text-green-600" />
                        Monitoring Parameters
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <p className="text-slate-700 leading-relaxed">{selectedDrug.monitoring}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Contraindications */}
                {selectedDrug.contraindications && (
                  <Card className="bg-white shadow-lg border-2 border-red-200">
                    <CardHeader className="bg-red-50 border-b border-red-200">
                      <CardTitle className="text-lg flex items-center gap-2 text-red-900">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        Contraindications
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <p className="text-red-800 font-medium leading-relaxed">{selectedDrug.contraindications}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Drug Interactions - FIXED */}
                {selectedDrug.interactions && selectedDrug.interactions.length > 0 && (
                  <Card className="bg-white shadow-lg border-2 border-amber-200">
                    <CardHeader className="bg-amber-50 border-b border-amber-200">
                      <CardTitle className="text-lg flex items-center gap-2 text-amber-900">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                        Major Drug Interactions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <ul className="space-y-2">
                        {selectedDrug.interactions.map((interaction, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-amber-800 font-medium">
                              {typeof interaction === 'string' ? interaction : interaction?.name || 'Unknown interaction'}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* References */}
                {selectedDrug.references && (
                  <Card className="bg-slate-50 border-slate-200">
                    <CardHeader>
                      <CardTitle className="text-base text-slate-700">References</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-slate-600">
                      <p>{selectedDrug.references}</p>
                      <p className="text-xs text-slate-500 mt-2">Last reviewed: {selectedDrug.last_reviewed}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Calculate Dose Button */}
                <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold mb-1">Calculate Dose for This Drug</h3>
                        <p className="text-sm text-blue-100">
                          Use the advanced calculator with patient data from Quick Patient Entry
                        </p>
                      </div>
                      <Link to={createPageUrl("DoseCalculator") + `?drug=${selectedDrug.id}`}>
                        <Button className="bg-white text-blue-600 hover:bg-blue-50">
                          <Calculator className="w-4 h-4 mr-2" />
                          Calculate Dose
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* By Class Tab */}
          <TabsContent value="classes">
            <div className="space-y-6">
              {Object.entries(drugsByClass).sort(([a], [b]) => a.localeCompare(b)).map(([className, classDrugs]) => (
                <Card key={className} className="bg-white shadow-lg">
                  <CardHeader className="bg-slate-50 border-b">
                    <CardTitle className="text-lg">{className}</CardTitle>
                    <p className="text-sm text-slate-600">{classDrugs.length} drug(s)</p>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-3 gap-3">
                      {classDrugs.map((drug) => (
                        <Button
                          key={drug.id}
                          variant="outline"
                          className="justify-start h-auto py-3 hover:bg-purple-50 hover:border-purple-400"
                          onClick={() => handleDrugSelect(drug)}
                        >
                          <div className="text-left">
                            <div className="font-semibold text-slate-900">{drug.generic_name}</div>
                            {drug.brands && (
                              <div className="text-xs text-slate-500 mt-1">{drug.brands.split(",")[0]}</div>
                            )}
                          </div>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Quick Reference Tab */}
          <TabsContent value="quick">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white shadow-lg">
                <CardHeader className="bg-blue-50 border-b">
                  <CardTitle className="text-lg">Immunosuppressants - Quick Reference</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="border-b pb-3">
                    <div className="font-semibold text-slate-900">Prednisolone</div>
                    <div className="text-sm text-slate-600 mt-1">NS: 2 mg/kg/day (max 60 mg) → taper</div>
                  </div>
                  <div className="border-b pb-3">
                    <div className="font-semibold text-slate-900">Tacrolimus (SRNS)</div>
                    <div className="text-sm text-slate-600 mt-1">0.1-0.15 mg/kg/day BID • Target: 5-7 ng/mL</div>
                  </div>
                  <div className="border-b pb-3">
                    <div className="font-semibold text-slate-900">Cyclosporine (SRNS)</div>
                    <div className="text-sm text-slate-600 mt-1">5 mg/kg/day BID • C0: 80-120 OR C2: 600-800</div>
                  </div>
                  <div className="border-b pb-3">
                    <div className="font-semibold text-slate-900">MMF</div>
                    <div className="text-sm text-slate-600 mt-1">600 mg/m²/dose BID (max 1 g BID)</div>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Rituximab</div>
                    <div className="text-sm text-slate-600 mt-1">375 mg/m² weekly × 2-4 OR 750 mg/m² single</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg">
                <CardHeader className="bg-red-50 border-b">
                  <CardTitle className="text-lg">Antihypertensives - Quick Reference</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="border-b pb-3">
                    <div className="font-semibold text-slate-900">Amlodipine</div>
                    <div className="text-sm text-slate-600 mt-1">0.1-0.3 mg/kg/day OD (max 10 mg)</div>
                  </div>
                  <div className="border-b pb-3">
                    <div className="font-semibold text-slate-900">Enalapril</div>
                    <div className="text-sm text-slate-600 mt-1">0.1 mg/kg/day OD → 0.5 mg/kg/day</div>
                  </div>
                  <div className="border-b pb-3">
                    <div className="font-semibold text-slate-900">Labetalol</div>
                    <div className="text-sm text-slate-600 mt-1">PO: 2-3 mg/kg/day BID • IV: 0.2-1 mg/kg bolus</div>
                  </div>
                  <div className="border-b pb-3">
                    <div className="font-semibold text-slate-900">Nifedipine (urgency)</div>
                    <div className="text-sm text-slate-600 mt-1">0.25-0.5 mg/kg/dose SL (max 10 mg)</div>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Hydralazine</div>
                    <div className="text-sm text-slate-600 mt-1">PO: 0.75-1 mg/kg/day QID • IV: 0.1-0.2 mg/kg q4-6h</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg">
                <CardHeader className="bg-green-50 border-b">
                  <CardTitle className="text-lg">Diuretics - Quick Reference</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="border-b pb-3">
                    <div className="font-semibold text-slate-900">Furosemide</div>
                    <div className="text-sm text-slate-600 mt-1">PO: 1-2 mg/kg/dose • IV: 0.5-1 mg/kg/dose</div>
                  </div>
                  <div className="border-b pb-3">
                    <div className="font-semibold text-slate-900">HCTZ</div>
                    <div className="text-sm text-slate-600 mt-1">1-2 mg/kg/day OD-BID (max 50 mg)</div>
                  </div>
                  <div className="border-b pb-3">
                    <div className="font-semibold text-slate-900">Spironolactone</div>
                    <div className="text-sm text-slate-600 mt-1">1-3 mg/kg/day OD-BID • ⚠️ Monitor K+</div>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Metolazone</div>
                    <div className="text-sm text-slate-600 mt-1">0.2-0.4 mg/kg/day OD • With loop = potent!</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg">
                <CardHeader className="bg-purple-50 border-b">
                  <CardTitle className="text-lg">Antibiotics - Quick Reference</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="border-b pb-3">
                    <div className="font-semibold text-slate-900">Ceftriaxone</div>
                    <div className="text-sm text-slate-600 mt-1">50-75 mg/kg/day IV OD (meningitis: 100 mg/kg/day BID)</div>
                  </div>
                  <div className="border-b pb-3">
                    <div className="font-semibold text-slate-900">Gentamicin (TDM)</div>
                    <div className="text-sm text-slate-600 mt-1">7.5 mg/kg q24h • Trough &lt;2 mcg/mL</div>
                  </div>
                  <div className="border-b pb-3">
                    <div className="font-semibold text-slate-900">Vancomycin (TDM)</div>
                    <div className="text-sm text-slate-600 mt-1">10-15 mg/kg q6-8h • Trough: 10-15 mcg/mL</div>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Meropenem</div>
                    <div className="text-sm text-slate-600 mt-1">20 mg/kg q8h (meningitis: 40 mg/kg q8h)</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Info Card */}
        <Card className="mt-6 bg-purple-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <Info className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-purple-900 mb-2">Comprehensive Pediatric Nephrology Drug Database</h3>
                <p className="text-sm text-purple-800 mb-2">
                  This database contains 60+ essential drugs used in pediatric nephrology practice with:
                </p>
                <ul className="text-sm text-purple-800 space-y-1 ml-4">
                  <li>• <strong>Indian brand names</strong> and available formulations with pack sizes</li>
                  <li>• <strong>Pediatric-specific dosing</strong> with age/weight-based recommendations</li>
                  <li>• <strong>Renal dose adjustments</strong> based on eGFR/CrCl bands</li>
                  <li>• <strong>Therapeutic drug monitoring</strong> (TDM) target ranges</li>
                  <li>• <strong>Safety monitoring</strong> parameters and contraindications</li>
                  <li>• <strong>Drug interactions</strong> and clinical notes</li>
                </ul>
                <p className="text-xs text-purple-700 mt-3">
                  References: Harriet Lane Handbook 23e, IAP Pediatric Formulary 2024, KDIGO Guidelines, IPNA/ISPD Guidelines
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
