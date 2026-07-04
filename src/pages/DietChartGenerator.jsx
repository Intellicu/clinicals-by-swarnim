
import React, { useState } from "react";
import { base44 } from "@/api/client";
import { useMutation } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  UtensilsCrossed,
  Loader2,
  Download,
  Edit,
  Save,
  Info,
  AlertTriangle,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { usePatient } from "../components/PatientContext";
import { toast } from "sonner";

export default function DietChartGenerator() {
  const { patientData } = usePatient();

  const [diseaseCondition, setDiseaseCondition] = useState("");
  const [region, setRegion] = useState("");
  const [language, setLanguage] = useState("English");
  const [weight, setWeight] = useState(patientData.weight || "");
  const [height, setHeight] = useState(patientData.height || "");
  const [age, setAge] = useState(patientData.age || "");
  const [ckdStage, setCkdStage] = useState("");
  const [dialysisType, setDialysisType] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  
  const [generatedDiet, setGeneratedDiet] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDiet, setEditedDiet] = useState("");

  React.useEffect(() => {
    setWeight(patientData.weight || weight);
    setHeight(patientData.height || height);
    setAge(patientData.age || age);
  }, [patientData]);

  const generateDietMutation = useMutation({
    mutationFn: async (params) => {
      const bmi = params.height && params.weight ? 
        (parseFloat(params.weight) / Math.pow(parseFloat(params.height) / 100, 2)).toFixed(1) : null;

      const languageInstructions = {
        "Hindi": "Provide meal names and food items in Hindi (Devanagari script). Use common Hindi terms for foods.",
        "Bengali": "Provide meal names and food items in Bengali (Bengali script). Use common Bengali terms for foods.",
        "Tamil": "Provide meal names and food items in Tamil (Tamil script). Use common Tamil terms for foods.",
        "Telugu": "Provide meal names and food items in Telugu (Telugu script). Use common Telugu terms for foods.",
        "Marathi": "Provide meal names and food items in Marathi (Devanagari script). Use common Marathi terms for foods.",
        "English": "Use English with Indian/regional context."
      };

      const prompt = `Generate a comprehensive, culturally appropriate diet chart for a pediatric patient with kidney disease.

OUTPUT LANGUAGE: ${params.language} - ${languageInstructions[params.language]}

PATIENT PROFILE:
- Age: ${params.age} years
- Weight: ${params.weight} kg
- Height: ${params.height} cm
- BMI: ${bmi || 'Not calculated'} kg/m²
- Disease Condition: ${params.diseaseCondition}
${params.ckdStage ? `- CKD Stage: ${params.ckdStage}` : ''}
${params.dialysisType ? `- Dialysis Type: ${params.dialysisType}` : ''}
- Geographic Region: ${params.region}
- Additional Notes: ${params.additionalNotes || 'None'}

IMPORTANT: DO NOT use asterisks or markdown formatting symbols (no ** for bold). Use plain text with clear headings and structure. Write in clean, professional format suitable for printing and sharing with families.

Generate a detailed, evidence-based diet plan that includes:

1. NUTRITIONAL TARGETS:
   - Calories (kcal/kg/day) with calculation formula
   - Protein (g/kg/day) - adjust for disease stage with maximum dose
   - Sodium (mg/day) with maximum allowed
   - Potassium (mEq/day) - critical in CKD/dialysis
   - Phosphorus (mg/day) - critical in CKD/dialysis
   - Fluid allowance (mL/day) with formula
   - Calcium requirements

2. MEAL PLAN (culturally appropriate for ${params.region}):
   Provide detailed meal plan in ${params.language} with:
   - Early Morning
   - Breakfast
   - Mid-Morning Snack
   - Lunch
   - Evening Snack
   - Dinner
   - Bedtime (if needed)

   For each meal:
   - Specific food items with quantities in grams AND household measures
   - Local/regional food options
   - Preparation methods

3. ALLOWED FOODS (disease-specific):
   List by category with examples

4. FOODS TO AVOID:
   Clear list with reasons

5. COOKING TIPS:
   Practical cooking methods for low sodium, potassium leaching, etc.

6. IMPORTANT MONITORING:
   What parameters to track

At the end, add:

---
AI DISCLAIMER: This diet plan is AI-generated for educational purposes based on KDIGO and NKF-KDOQI nutrition guidelines. Individual needs may vary. Please consult with a registered dietitian for personalized nutrition counseling. Adjust based on lab values, growth, and tolerance. Always exercise independent clinical judgment.
---`;

      const dietPlan = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: true
      });

      const cleanedPlan = dietPlan.replace(/\*\*/g, '');
      return cleanedPlan;
    },
    onSuccess: (plan) => {
      setGeneratedDiet(plan);
      setEditedDiet(plan);
      toast.success("Diet chart generated successfully!");
    },
    onError: () => {
      toast.error("Failed to generate diet chart");
    }
  });

  const handleGenerate = () => {
    if (!diseaseCondition || !region || !weight || !age) {
      toast.error("Please fill in disease condition, region, weight, and age");
      return;
    }

    generateDietMutation.mutate({
      diseaseCondition,
      region,
      language,
      weight,
      height,
      age,
      ckdStage,
      dialysisType,
      additionalNotes
    });
  };

  const handleDownload = () => {
    if (!editedDiet) return;

    const blob = new Blob([editedDiet], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Diet_Chart_${diseaseCondition}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    toast.success("Diet chart downloaded!");
  };

  const handleSaveEdit = () => {
    setGeneratedDiet(editedDiet);
    setIsEditing(false);
    toast.success("Changes saved!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 p-6">
      <div className="max-w-6xl mx-auto">
        <Link to={createPageUrl("Hub")}>
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Hub
          </Button>
        </Link>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <UtensilsCrossed className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">AI Diet Chart Generator</h1>
              <p className="text-slate-600">Personalized, disease-specific nutrition plans with regional food options in multiple languages</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-6">
            <Card className="bg-white shadow-lg">
              <CardHeader className="bg-green-50 border-b">
                <CardTitle className="text-lg">Patient & Disease Information</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label>Disease Condition *</Label>
                  <Select value={diseaseCondition} onValueChange={setDiseaseCondition}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select disease condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CKD Stage 1-2">CKD Stage 1-2</SelectItem>
                      <SelectItem value="CKD Stage 3">CKD Stage 3</SelectItem>
                      <SelectItem value="CKD Stage 4">CKD Stage 4</SelectItem>
                      <SelectItem value="CKD Stage 5 (not on dialysis)">CKD Stage 5 (not on dialysis)</SelectItem>
                      <SelectItem value="Hemodialysis">Hemodialysis</SelectItem>
                      <SelectItem value="Peritoneal Dialysis">Peritoneal Dialysis</SelectItem>
                      <SelectItem value="Nephrotic Syndrome (active)">Nephrotic Syndrome (active)</SelectItem>
                      <SelectItem value="Nephrotic Syndrome (remission)">Nephrotic Syndrome (remission)</SelectItem>
                      <SelectItem value="Kidney Stones (Calcium Oxalate)">Kidney Stones (Calcium Oxalate)</SelectItem>
                      <SelectItem value="Kidney Stones (Uric Acid)">Kidney Stones (Uric Acid)</SelectItem>
                      <SelectItem value="Hypertension with CKD">Hypertension with CKD</SelectItem>
                      <SelectItem value="Post-Kidney Transplant">Post-Kidney Transplant</SelectItem>
                      <SelectItem value="AKI (Recovery Phase)">AKI (Recovery Phase)</SelectItem>
                      <SelectItem value="Fanconi Syndrome">Fanconi Syndrome</SelectItem>
                      <SelectItem value="RTA (Renal Tubular Acidosis)">RTA (Renal Tubular Acidosis)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Geographic Region *</Label>
                    <Select value={region} onValueChange={setRegion}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="North India">North India</SelectItem>
                        <SelectItem value="South India">South India</SelectItem>
                        <SelectItem value="East India">East India</SelectItem>
                        <SelectItem value="West India">West India</SelectItem>
                        <SelectItem value="Western (Mediterranean)">Western (Mediterranean)</SelectItem>
                        <SelectItem value="Southeast Asia">Southeast Asia</SelectItem>
                        <SelectItem value="General Indian">General Indian</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Language *</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Hindi">हिंदी (Hindi)</SelectItem>
                        <SelectItem value="Bengali">বাংলা (Bengali)</SelectItem>
                        <SelectItem value="Tamil">தமிழ் (Tamil)</SelectItem>
                        <SelectItem value="Telugu">తెలుగు (Telugu)</SelectItem>
                        <SelectItem value="Marathi">मराठी (Marathi)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label>Age (years) *</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="e.g., 8"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Weight (kg) *</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="e.g., 25"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Height (cm)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      placeholder="e.g., 120"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label>Additional Notes (allergies, preferences, restrictions)</Label>
                  <Textarea
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="e.g., Vegetarian, no dairy, peanut allergy..."
                    className="mt-1 h-24"
                  />
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={!diseaseCondition || !region || !weight || !age || generateDietMutation.isPending}
                  className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold py-6"
                >
                  {generateDietMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating Personalized Diet Chart...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate AI Diet Chart
                    </>
                  )}
                </Button>

                <Alert className="bg-blue-50 border-blue-200">
                  <Info className="w-4 h-4 text-blue-600" />
                  <AlertDescription className="text-sm text-blue-800">
                    <strong>Multi-language Support:</strong> Diet charts available in English, Hindi, Bengali, Tamil, Telugu, and Marathi with culturally appropriate food options.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>

          {/* Generated Diet Section */}
          <div className="space-y-6">
            {generatedDiet ? (
              <Card className="bg-white shadow-lg">
                <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      Personalized Diet Chart ({language})
                    </CardTitle>
                    <div className="flex gap-2">
                      {!isEditing ? (
                        <>
                          <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button onClick={handleDownload} variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button onClick={() => { setIsEditing(false); setEditedDiet(generatedDiet); }} variant="outline" size="sm">
                            Cancel
                          </Button>
                          <Button onClick={handleSaveEdit} className="bg-green-600 hover:bg-green-700" size="sm">
                            <Save className="w-4 h-4 mr-2" />
                            Save
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {isEditing ? (
                    <Textarea
                      value={editedDiet}
                      onChange={(e) => setEditedDiet(e.target.value)}
                      className="min-h-[600px] font-mono text-sm"
                    />
                  ) : (
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-700">
                        {editedDiet}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white shadow-lg">
                <CardContent className="p-16 text-center">
                  <UtensilsCrossed className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-700 mb-2">No Diet Chart Generated Yet</h3>
                  <p className="text-slate-500">Fill in the patient details and click "Generate" to create a personalized diet plan</p>
                </CardContent>
              </Card>
            )}

            {generatedDiet && (
              <Alert className="bg-amber-50 border-amber-200">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <AlertDescription className="text-sm text-amber-800">
                  <strong>Disclaimer:</strong> This diet chart is AI-generated based on clinical guidelines. 
                  Always consult with a registered dietitian for personalized nutrition counseling. 
                  Adjust based on individual tolerance, growth monitoring, and lab values.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        {/* Educational Info Card */}
        <Card className="mt-6 bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <Info className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-green-900 mb-2">Evidence-Based Nutrition Therapy</h3>
                <div className="text-sm text-green-800 space-y-2">
                  <p>This AI-powered tool generates disease-specific diet charts based on:</p>
                  <ul className="ml-4 space-y-1">
                    <li>• KDIGO CKD Nutrition Guidelines 2020</li>
                    <li>• NKF-KDOQI Clinical Practice Guidelines for Nutrition</li>
                    <li>• IAP Pediatric Nutrition Recommendations 2024</li>
                    <li>• Regional food databases for culturally appropriate meals</li>
                    <li>• Available in 6 languages: English, Hindi, Bengali, Tamil, Telugu, Marathi</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
