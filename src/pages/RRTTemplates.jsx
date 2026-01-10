import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  Activity,
  Zap,
  Droplet,
  AlertTriangle,
  Brain,
  Heart,
  Skull,
  Wind,
  TrendingUp,
  Flame,
  Wrench,
  FileText,
  Copy,
  Save,
  Edit,
  Sparkles,
  Trash2,
  Users,
  Building
} from "lucide-react";
import { toast } from "sonner";
import RRTTrendChart from "../components/RRTTrendChart";

const hdTemplates = [
  {
    id: "hd-high-urea",
    name: "Very High Urea / Prevent Disequilibrium",
    icon: Brain,
    color: "bg-red-100 border-red-300 text-red-900",
    indication: "Urea >200 mg/dL, First HD, Symptomatic child",
    prescription: {
      dialyzer: "Small / 80% BSA",
      bloodFlow: "3-5 mL/kg/min (slow)",
      dialysateFlow: "2 × BFR",
      duration: "1.5-2 hours",
      targetClearance: "Reduce urea by <40% in first session",
      ufGoal: "0-5 mL/kg/hr (avoid UF unless overloaded)",
      dialysate: { k: "2 mEq/L", ca: "3 mEq/L", na: "138-140", bicarb: "32-34", temp: "35°C" },
      anticoag: "Heparin 10 U/kg bolus + 10 U/kg/hr",
      monitoring: "Neuro checks every 30 minutes",
      notes: "If symptoms → STOP HD → 0.5 g/kg mannitol → CRRT next"
    }
  },
  {
    id: "hd-hyperkalemia",
    name: "Severe Hyperkalemia Emergency",
    icon: Zap,
    color: "bg-yellow-100 border-yellow-300 text-yellow-900",
    indication: "K+ ≥6.5 mmol/L, ECG changes",
    prescription: {
      dialyzer: "Medium (100% BSA)",
      bloodFlow: "6-8 mL/kg/min",
      dialysate: { k: "0-1 mEq/L", na: "140", ca: "2.5", bicarb: "35" },
      duration: "2-3 hours",
      ufGoal: "Minimal unless overloaded",
      notes: "Give Ca-gluconate, insulin-dextrose BEFORE HD. Recheck K q1h. ECG monitoring."
    }
  },
  {
    id: "hd-lithium",
    name: "Lithium Toxicity HD",
    icon: Skull,
    color: "bg-orange-100 border-orange-300 text-orange-900",
    indication: "Lithium level >2.5 mEq/L, Neurologic symptoms",
    prescription: {
      mode: "High-flux HD",
      bloodFlow: "8-10 mL/kg/min",
      duration: "6-8 hours (extended)",
      dialysateFlow: "Maximum",
      dialysate: { k: "2-3 mEq/L" },
      special: "Check lithium level q2h. Expect rebound in 6-8h → may need 2nd session or CRRT",
      notes: "Goal: Lithium <1.0 mEq/L. Monitor neuro status. Hydrate adequately."
    }
  },
  {
    id: "hd-valproate",
    name: "Valproate Toxicity HD",
    icon: Brain,
    color: "bg-purple-100 border-purple-300 text-purple-900",
    indication: "VPA >850 mcg/mL, Altered mental status, Hyperammonemia",
    prescription: {
      mode: "High-flux HD",
      bloodFlow: "8-10 mL/kg/min",
      duration: "4-6 hours",
      dialysateFlow: "Max",
      special: "Check VPA levels q2-4h. Ammonia if elevated. Carnitine 100 mg/kg IV (max 6g) loading dose.",
      notes: "VPA is protein-bound but dialyzable. Monitor consciousness level."
    }
  },
  {
    id: "hd-methanol",
    name: "Methanol/Ethylene Glycol Poisoning",
    icon: Skull,
    color: "bg-red-100 border-red-300 text-red-900",
    indication: "Methanol >15 mg/dL, Severe acidosis pH <7.1, Vision changes",
    prescription: {
      mode: "High-flux HD with ethanol or fomepizole",
      bloodFlow: "8-10 mL/kg/min",
      duration: "Until methanol <20 mg/dL AND acidosis resolved",
      dialysate: { k: "3 mEq/L", bicarb: "35-40" },
      special: "Give fomepizole loading 15 mg/kg, then 10 mg/kg q12h. Check methanol, ethanol, pH q2h.",
      notes: "CRITICAL: HD clears both methanol AND fomepizole. Increase fomepizole dosing during HD."
    }
  },
  {
    id: "hd-salicylate",
    name: "Salicylate Toxicity HD",
    icon: Flame,
    color: "bg-orange-100 border-orange-300 text-orange-900",
    indication: "Salicylate >80 mg/dL, Severe acidosis, CNS symptoms",
    prescription: {
      mode: "High-flux HD",
      bloodFlow: "8-10 mL/kg/min",
      duration: "4-6 hours",
      dialysate: { k: "3 mEq/L", bicarb: "40-45 (HIGH)" },
      special: "Alkalinize urine. Check salicylate q2h. Goal <30 mg/dL.",
      notes: "Rebound common. May need repeat HD in 4-6h. Monitor potassium closely."
    }
  }
];

const crrtTemplates = [
  {
    id: "crrt-standard",
    name: "Standard Pediatric CRRT",
    icon: Activity,
    color: "bg-cyan-100 border-cyan-300 text-cyan-900",
    indication: "Standard AKI, Fluid overload",
    prescription: {
      mode: "CVVHDF",
      effluentDose: "25-30 mL/kg/hr",
      bloodFlow: "5-8 mL/kg/min",
      replacement: "10 mL/kg/hr (pre-filter)",
      dialysate: "15 mL/kg/hr",
      uf: "1-3 mL/kg/hr",
      anticoag: "Citrate preferred"
    }
  },
  {
    id: "crrt-shock",
    name: "Hemodynamic Instability / Shock",
    icon: Heart,
    color: "bg-red-100 border-red-300 text-red-900",
    indication: "Septic shock, On vasopressors",
    prescription: {
      mode: "SCUF or CVVHDF",
      bloodFlow: "3-5 mL/kg/min",
      effluentDose: "20-25 mL/kg/hr",
      uf: "Start 0, then 1 mL/kg/hr",
      dialysate: "Warmed to 37°C",
      anticoag: "Heparin (NOT citrate in shock)",
      notes: "Monitor MAP continuously"
    }
  },
  {
    id: "crrt-hyperammonemia",
    name: "Hyperammonemia High-Dose",
    icon: Brain,
    color: "bg-purple-100 border-purple-300 text-purple-900",
    indication: "Ammonia >200 µmol/L, Metabolic crisis",
    prescription: {
      mode: "CVVHD / CVVHDF",
      effluentDose: "50-80 mL/kg/hr (HIGH-DOSE)",
      dialysate: "25-40 mL/kg/hr",
      replacement: "25-40 mL/kg/hr",
      goal: "Ammonia <100 µmol/L",
      duration: "24-48 hours continuous",
      monitoring: "Ammonia q2h initially"
    }
  },
  {
    id: "crrt-tls",
    name: "Tumor Lysis Syndrome",
    icon: Flame,
    color: "bg-orange-100 border-orange-300 text-orange-900",
    indication: "TLS with hyperkalemia, hyperphosphatemia",
    prescription: {
      effluentDose: "30-40 mL/kg/hr",
      dialysate: "Low K (0-1 mEq/L)",
      uf: "Minimal",
      monitoring: "Ca, P, UA, K q4-6h",
      notes: "Use rasburicase. Add phosphate binders."
    }
  },
  {
    id: "crrt-ecmo",
    name: "ECMO + CRRT (Inline)",
    icon: Activity,
    color: "bg-indigo-100 border-indigo-300 text-indigo-900",
    indication: "Patient on ECMO requiring RRT",
    prescription: {
      bloodFlow: "5-10 mL/kg/min via ECMO circuit",
      mode: "CVVHDF",
      anticoag: "Heparin (NO citrate)",
      uf: "Start 0, escalate cautiously",
      monitoring: "ECMO flows, circuit pressures hourly",
      notes: "Inline connection. Ensure ECMO flow >100 mL/kg/min"
    }
  },
  {
    id: "crrt-mma-pa",
    name: "Methylmalonic/Propionic Acidemia CRRT",
    icon: Brain,
    color: "bg-pink-100 border-pink-300 text-pink-900",
    indication: "MMA/PA crisis, Hyperammonemia, Severe acidosis",
    prescription: {
      mode: "CVVHDF",
      effluentDose: "60-80 mL/kg/hr (very high)",
      dialysate: "30-40 mL/kg/hr, HCO3 35-40",
      replacement: "30-40 mL/kg/hr",
      monitoring: "Ammonia, pH, lactate q2h",
      notes: "Goal: Ammonia <100, pH >7.25. Give carnitine, avoid protein temporarily."
    }
  }
];

const pdComplicationTemplates = [
  {
    id: "pd-peritonitis",
    name: "Cloudy Effluent (Peritonitis)",
    icon: AlertTriangle,
    color: "bg-red-100 border-red-300 text-red-900",
    plan: {
      immediate: "Continue PD exchanges",
      diagnostics: "Effluent: cell count (WBC >100 = peritonitis), Gram stain, culture",
      treatment: [
        "IP Vancomycin: 30 mg/L loading, then 15 mg/L maintenance",
        "IP Ceftazidime: 500 mg/L loading, then 125 mg/L maintenance",
        "Add Heparin 500 IU/L",
        "Reduce fill 20-30% if severe pain"
      ],
      monitoring: "Daily effluent, cell count at 48h",
      notes: "If no improvement in 48h or fungal → remove catheter"
    }
  },
  {
    id: "pd-poor-flow",
    name: "Poor Inflow / Outflow",
    icon: Wrench,
    color: "bg-yellow-100 border-yellow-300 text-yellow-900",
    plan: {
      checkDo: [
        "Reposition child (lateral, knee-chest)",
        "Heparin 500 IU/L",
        "Check constipation → laxatives",
        "Flush with 20 mL saline",
        "TPA 1 mg in 20 mL NS (if fibrin)",
        "KUB X-ray for catheter position"
      ],
      notes: "If malpositioned → surgical revision"
    }
  },
  {
    id: "pd-leak",
    name: "Pericatheter Leak",
    icon: Droplet,
    color: "bg-blue-100 border-blue-300 text-blue-900",
    plan: {
      immediate: [
        "Reduce fill 20-50%",
        "Shorten dwells (30-45 min)",
        "Use 1.5% glucose only",
        "Bed rest"
      ],
      ifMajorLeak: "Rest PD 24-48h. Temporary HD if needed.",
      notes: "Common in first 2 weeks. Usually resolves."
    }
  },
  {
    id: "pd-uf-failure",
    name: "Ultrafiltration Failure",
    icon: TrendingUp,
    color: "bg-orange-100 border-orange-300 text-orange-900",
    plan: {
      immediate: [
        "Increase glucose to 2.5% or 4.25%",
        "Shorten dwells",
        "PET test (membrane transport)"
      ],
      ifPersistent: "Consider HD. May indicate membrane failure.",
      notes: "Early UF failure = leak. Late = membrane changes."
    }
  }
];

const troubleshootingTemplates = [
  {
    id: "ts-hypotension",
    name: "Hypotension During Dialysis",
    icon: Heart,
    color: "bg-red-100 border-red-300 text-red-900",
    steps: [
      "1. STOP ultrafiltration immediately",
      "2. Lower blood flow by 30-50%",
      "3. NS bolus 10 mL/kg over 10-15 min",
      "4. Trendelenburg position",
      "5. Reassess dry weight",
      "6. Rule out sepsis, cardiac dysfunction, bleeding"
    ]
  },
  {
    id: "ts-high-venous",
    name: "High Venous Pressure",
    icon: AlertTriangle,
    color: "bg-yellow-100 border-yellow-300 text-yellow-900",
    steps: [
      "Outflow obstruction",
      "Check needle position/catheter kink",
      "Look for clot in drip chamber",
      "Flush venous line",
      "Reposition catheter if needed",
      "May need catheter revision"
    ]
  },
  {
    id: "ts-blood-leak",
    name: "Blood Leak Alarm",
    icon: Droplet,
    color: "bg-red-100 border-red-300 text-red-900",
    steps: [
      "1. STOP HD IMMEDIATELY",
      "2. Clamp all lines",
      "3. Replace dialyzer (membrane ruptured)",
      "4. Check plasma-free Hb",
      "5. Monitor for hemolysis",
      "6. Transfusion if severe"
    ]
  },
  {
    id: "ts-air-embolism",
    name: "Air Embolism",
    icon: Wind,
    color: "bg-purple-100 border-purple-300 text-purple-900",
    steps: [
      "1. STOP HD immediately",
      "2. Clamp venous line",
      "3. Left lateral + Trendelenburg",
      "4. 100% oxygen",
      "5. IMMEDIATE ICU call",
      "6. Hyperbaric oxygen if severe"
    ]
  },
  {
    id: "ts-filter-clot",
    name: "CRRT Filter Clotting",
    icon: AlertTriangle,
    color: "bg-red-100 border-red-300 text-red-900",
    steps: [
      "Increase anticoagulation",
      "Increase blood flow",
      "More pre-filter replacement",
      "Check access function",
      "If TMP >250 → change filter",
      "Consider regional citrate"
    ]
  }
];

export default function RRTTemplates() {
  const queryClient = useQueryClient();
  
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrescription, setEditedPrescription] = useState("");
  
  // Save template state
  const [templateName, setTemplateName] = useState("");
  const [institution, setInstitution] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [tags, setTags] = useState("");
  
  // AI personalization state
  const [aiPatientAge, setAiPatientAge] = useState("");
  const [aiPatientWeight, setAiPatientWeight] = useState("");
  const [aiComorbidities, setAiComorbidities] = useState("");
  const [aiLabValues, setAiLabValues] = useState("");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: savedTemplates = [] } = useQuery({
    queryKey: ['savedRRTTemplates'],
    queryFn: () => base44.entities.SavedRRTTemplate.list('-created_date'),
    initialData: []
  });

  const { data: monitoringData = [] } = useQuery({
    queryKey: ['rrtMonitoringData'],
    queryFn: () => base44.entities.RRTMonitoringData.list('-session_date', 50),
    initialData: []
  });

  const saveTemplateMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.SavedRRTTemplate.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedRRTTemplates'] });
      toast.success("Template saved successfully!");
      setShowSaveDialog(false);
      resetSaveForm();
    }
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (id) => {
      return await base44.entities.SavedRRTTemplate.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedRRTTemplates'] });
      toast.success("Template deleted");
    }
  });

  const resetSaveForm = () => {
    setTemplateName("");
    setInstitution("");
    setIsPublic(false);
    setTags("");
  };

  const handleSaveTemplate = () => {
    if (!templateName || !selectedTemplate) {
      toast.error("Please enter a template name");
      return;
    }

    const modality = selectedTemplate.id.startsWith('hd') ? 'HD' :
                     selectedTemplate.id.startsWith('crrt') ? 'CRRT' :
                     selectedTemplate.id.startsWith('pd') ? 'PD_Acute' : 'HD';

    saveTemplateMutation.mutate({
      template_name: templateName,
      modality,
      based_on_template: selectedTemplate.id,
      indication: selectedTemplate.indication,
      parameters: selectedTemplate.prescription || selectedTemplate.plan,
      prescription_text: editedPrescription || renderPrescriptionDetails(),
      institution: institution || undefined,
      is_public: isPublic,
      tags: tags.split(',').map(t => t.trim()).filter(t => t),
      audit_trail: [{
        timestamp: new Date().toISOString(),
        user_email: user?.email,
        changes: "Initial creation"
      }]
    });
  };

  const generateAIPersonalized = async () => {
    if (!selectedTemplate || !aiPatientAge || !aiPatientWeight) {
      toast.error("Please enter patient age and weight");
      return;
    }

    setIsGeneratingAI(true);

    const prompt = `You are a pediatric nephrologist. Customize this RRT prescription template for a specific patient.

TEMPLATE: ${selectedTemplate.name}
INDICATION: ${selectedTemplate.indication}

PATIENT DATA:
- Age: ${aiPatientAge} years
- Weight: ${aiPatientWeight} kg
- Comorbidities: ${aiComorbidities || "None specified"}
- Lab Values: ${aiLabValues || "Not provided"}

BASE PRESCRIPTION:
${JSON.stringify(selectedTemplate.prescription || selectedTemplate.plan, null, 2)}

Generate a personalized, patient-specific prescription adapting the base template. Include:
1. Adjusted parameters based on patient size and condition
2. Specific dosing calculations (blood flow, dialysate, UF rates)
3. Safety considerations for this patient
4. Monitoring plan tailored to comorbidities
5. Expected outcomes

IMPORTANT: Output as plain text without markdown formatting (no **).`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: false
    });

    const cleanResponse = response.replace(/\*\*/g, '');
    setEditedPrescription(cleanResponse + "\n\n---\nAI DISCLAIMER: AI-generated personalized prescription. Always verify and adjust based on clinical judgment.\n---");
    setIsGeneratingAI(false);
    setShowAIDialog(false);
    toast.success("AI-personalized prescription generated!");
  };

  const renderPrescriptionDetails = () => {
    if (!selectedTemplate) return "";

    const prescription = selectedTemplate.prescription || selectedTemplate.plan;
    
    let text = `
═══════════════════════════════════════════════
    ${selectedTemplate.name.toUpperCase()}
═══════════════════════════════════════════════

INDICATION:
${selectedTemplate.indication}

PRESCRIPTION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

    Object.entries(prescription).forEach(([key, value]) => {
      if (typeof value === 'object' && !Array.isArray(value)) {
        text += `\n${key.toUpperCase()}:\n`;
        Object.entries(value).forEach(([subKey, subValue]) => {
          text += `  ${subKey}: ${subValue}\n`;
        });
      } else if (Array.isArray(value)) {
        text += `\n${key.toUpperCase()}:\n`;
        value.forEach((item, idx) => {
          text += `  ${idx + 1}. ${item}\n`;
        });
      } else {
        text += `${key}: ${value}\n`;
      }
    });

    text += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Generated: ${new Date().toLocaleString()}
Generated by: ${user?.full_name || "User"}

AI DISCLAIMER: Template for educational purposes based on KDIGO, IPNA, ISPD guidelines. Always verify and adjust to patient needs.
═══════════════════════════════════════════════
`;

    return text;
  };

  const handleCopyTemplate = async (text) => {
    await navigator.clipboard.writeText(text);
    toast.success("Template copied to clipboard!");
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setEditedPrescription(renderPrescriptionDetails());
    setIsEditing(false);
    setShowDialog(true);
  };

  const renderTemplateCard = (template) => {
    const IconComponent = template.icon;
    return (
      <Card
        key={template.id}
        className={`cursor-pointer transition-all hover:shadow-lg border-2 ${template.color}`}
        onClick={() => handleTemplateSelect(template)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/50 flex items-center justify-center flex-shrink-0">
              <IconComponent className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-base mb-1">{template.name}</CardTitle>
              {template.indication && (
                <p className="text-xs opacity-80">{template.indication}</p>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  };

  // Prepare trend data
  const ktvTrendData = monitoringData
    .filter(d => d.ktv)
    .map((d, idx) => ({
      session: `S${idx + 1}`,
      ktv: d.ktv
    }));

  const electrolyteTrendData = monitoringData
    .filter(d => d.labs?.pre_k && d.labs?.post_k)
    .map((d, idx) => ({
      session: `S${idx + 1}`,
      preK: d.labs.pre_k,
      postK: d.labs.post_k
    }));

  const fluidBalanceTrendData = monitoringData
    .filter(d => d.pre_weight && d.post_weight)
    .map((d, idx) => ({
      session: `S${idx + 1}`,
      preWeight: d.pre_weight,
      postWeight: d.post_weight,
      ufAchieved: d.uf_achieved / 1000
    }));

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
          <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="w-7 h-7 text-white" />
            </div>
            RRT Templates & Complications
          </h1>
          <p className="text-slate-600">Pre-built clinical pathways, custom templates, AI personalization, and trend visualization</p>
        </div>

        <Alert className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <AlertDescription className="text-blue-900">
            <strong>NEW:</strong> Save customized templates, AI-personalize prescriptions, and visualize patient trends. Click any template to edit, personalize, and save.
          </AlertDescription>
        </Alert>

        {/* Trend Charts */}
        {monitoringData.length > 0 && (
          <div className="mb-6 grid md:grid-cols-2 gap-4">
            <RRTTrendChart 
              data={ktvTrendData} 
              title="Kt/V Trend" 
              dataKey="ktv"
              color="#3b82f6"
            />
            <RRTTrendChart 
              data={fluidBalanceTrendData} 
              title="Weight & UF Trend" 
              dataKey="ufAchieved"
              color="#10b981"
            />
          </div>
        )}

        <Tabs defaultValue="hd" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="hd">
              <Activity className="w-4 h-4 mr-2" />
              HD
            </TabsTrigger>
            <TabsTrigger value="crrt">
              <Zap className="w-4 h-4 mr-2" />
              CRRT
            </TabsTrigger>
            <TabsTrigger value="pd">
              <Droplet className="w-4 h-4 mr-2" />
              PD
            </TabsTrigger>
            <TabsTrigger value="troubleshooting">
              <Wrench className="w-4 h-4 mr-2" />
              Troubleshoot
            </TabsTrigger>
            <TabsTrigger value="saved">
              <Save className="w-4 h-4 mr-2" />
              My Templates
            </TabsTrigger>
            <TabsTrigger value="handover">
              <FileText className="w-4 h-4 mr-2" />
              Handover
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hd">
            <Card>
              <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-6 h-6 text-red-600" />
                  Hemodialysis Templates ({hdTemplates.length})
                </CardTitle>
                <p className="text-sm text-slate-600 mt-1">Scenario-based HD prescriptions including toxin removal</p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {hdTemplates.map(renderTemplateCard)}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="crrt">
            <Card>
              <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-6 h-6 text-cyan-600" />
                  CRRT Templates ({crrtTemplates.length})
                </CardTitle>
                <p className="text-sm text-slate-600 mt-1">CVVH/CVVHD/CVVHDF protocols including metabolic crises</p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {crrtTemplates.map(renderTemplateCard)}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pd">
            <Card>
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Droplet className="w-6 h-6 text-purple-600" />
                  PD Complication Templates
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-4">
                  {pdComplicationTemplates.map((template) => {
                    const IconComponent = template.icon;
                    return (
                      <Card
                        key={template.id}
                        className={`cursor-pointer hover:shadow-lg border-2 ${template.color}`}
                        onClick={() => handleTemplateSelect(template)}
                      >
                        <CardHeader>
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white/50 flex items-center justify-center">
                              <IconComponent className="w-6 h-6" />
                            </div>
                            <CardTitle className="text-base">{template.name}</CardTitle>
                          </div>
                        </CardHeader>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="troubleshooting">
            <Card>
              <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="w-6 h-6 text-yellow-600" />
                  Troubleshooting ({troubleshootingTemplates.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {troubleshootingTemplates.map((template) => {
                    const IconComponent = template.icon;
                    return (
                      <Card
                        key={template.id}
                        className={`cursor-pointer hover:shadow-lg border-2 ${template.color}`}
                        onClick={() => handleTemplateSelect(template)}
                      >
                        <CardHeader>
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white/50 flex items-center justify-center">
                              <IconComponent className="w-6 h-6" />
                            </div>
                            <CardTitle className="text-base">{template.name}</CardTitle>
                          </div>
                        </CardHeader>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="saved">
            <Card>
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Save className="w-6 h-6 text-green-600" />
                  My Saved Templates ({savedTemplates.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {savedTemplates.length === 0 ? (
                  <div className="text-center py-12">
                    <Save className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 mb-2">No saved templates yet</p>
                    <p className="text-sm text-slate-400">Open any template and click "Save Custom Version"</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {savedTemplates.map((template) => (
                      <Card
                        key={template.id}
                        className="border-2 border-green-200 hover:border-green-400 hover:shadow-lg transition-all cursor-pointer"
                        onClick={() => {
                          setSelectedTemplate({
                            id: template.id,
                            name: template.template_name,
                            indication: template.indication,
                            prescription: template.parameters
                          });
                          setEditedPrescription(template.prescription_text);
                          setShowDialog(true);
                        }}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-base mb-1">{template.template_name}</CardTitle>
                              <p className="text-xs text-slate-600">{template.indication}</p>
                              <div className="flex gap-2 mt-2 flex-wrap">
                                <Badge className="bg-green-100 text-green-800 text-xs">
                                  {template.modality}
                                </Badge>
                                {template.institution && (
                                  <Badge className="bg-blue-100 text-blue-800 text-xs flex items-center gap-1">
                                    <Building className="w-3 h-3" />
                                    {template.institution}
                                  </Badge>
                                )}
                                {template.is_public && (
                                  <Badge className="bg-purple-100 text-purple-800 text-xs flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    Public
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteTemplateMutation.mutate(template.id);
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="handover">
            <Card>
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-6 h-6 text-indigo-600" />
                    Dialysis Handover Template
                  </CardTitle>
                  <Button
                    onClick={() => handleCopyTemplate(handoverTemplate)}
                    variant="outline"
                    className="border-indigo-300 text-indigo-700"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <pre className="bg-slate-50 p-4 rounded-lg text-xs font-mono overflow-x-auto border-2 border-slate-200">
                  {handoverTemplate}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Template Detail Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                {selectedTemplate?.icon && <selectedTemplate.icon className="w-6 h-6" />}
                {selectedTemplate?.name}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={() => setShowAIDialog(true)}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  size="sm"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Personalize
                </Button>
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  variant="outline"
                  size="sm"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {isEditing ? "Preview" : "Edit"}
                </Button>
                <Button
                  onClick={() => setShowSaveDialog(true)}
                  variant="outline"
                  size="sm"
                  className="border-green-300 text-green-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Custom Version
                </Button>
                <Button
                  onClick={() => handleCopyTemplate(editedPrescription)}
                  variant="outline"
                  size="sm"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>

              {isEditing ? (
                <Textarea
                  value={editedPrescription}
                  onChange={(e) => setEditedPrescription(e.target.value)}
                  className="min-h-[500px] font-mono text-xs"
                />
              ) : (
                <pre className="bg-slate-50 p-4 rounded-lg text-xs font-mono whitespace-pre-wrap border max-h-[500px] overflow-y-auto">
                  {editedPrescription}
                </pre>
              )}

              {selectedTemplate?.steps && (
                <div className="space-y-3 mt-6">
                  <h4 className="font-semibold text-slate-900">Step-by-Step Protocol:</h4>
                  {selectedTemplate.steps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {idx + 1}
                      </div>
                      <p className="text-sm text-slate-700 flex-1">{step}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Save Template Dialog */}
        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Save className="w-6 h-6 text-green-600" />
                Save Custom Template
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label>Template Name *</Label>
                <Input
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g., My Institution's Hyperkalemia Protocol"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Institution / Department</Label>
                <Input
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="e.g., AIIMS Delhi Pediatric Nephrology"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Tags (comma-separated)</Label>
                <Input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g., emergency, pediatric, hyperkalemia"
                  className="mt-1"
                />
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="public"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
                <Label htmlFor="public" className="cursor-pointer">
                  Make public (share with other users)
                </Label>
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <AlertDescription className="text-sm text-blue-800">
                  Based on: <strong>{selectedTemplate?.name}</strong>
                </AlertDescription>
              </Alert>

              <div className="flex gap-2">
                <Button
                  onClick={handleSaveTemplate}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={saveTemplateMutation.isPending}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Template
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSaveDialog(false);
                    resetSaveForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* AI Personalization Dialog */}
        <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-600" />
                AI-Personalize Prescription
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <Alert className="bg-purple-50 border-purple-200">
                <AlertDescription className="text-purple-800 text-sm">
                  Enter patient data and AI will adapt the <strong>{selectedTemplate?.name}</strong> template to this specific patient
                </AlertDescription>
              </Alert>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Patient Age (years) *</Label>
                  <Input
                    type="number"
                    value={aiPatientAge}
                    onChange={(e) => setAiPatientAge(e.target.value)}
                    placeholder="e.g., 8"
                  />
                </div>

                <div>
                  <Label>Patient Weight (kg) *</Label>
                  <Input
                    type="number"
                    value={aiPatientWeight}
                    onChange={(e) => setAiPatientWeight(e.target.value)}
                    placeholder="e.g., 25"
                  />
                </div>
              </div>

              <div>
                <Label>Comorbidities</Label>
                <Textarea
                  value={aiComorbidities}
                  onChange={(e) => setAiComorbidities(e.target.value)}
                  placeholder="e.g., CHD post-op, on pressors, thrombocytopenia"
                  className="h-20"
                />
              </div>

              <div>
                <Label>Lab Values</Label>
                <Textarea
                  value={aiLabValues}
                  onChange={(e) => setAiLabValues(e.target.value)}
                  placeholder="e.g., BUN 120, Cr 4.5, K 7.2, pH 7.15, Ammonia 350"
                  className="h-20"
                />
              </div>

              <Button
                onClick={generateAIPersonalized}
                disabled={isGeneratingAI}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                {isGeneratingAI ? (
                  <>
                    <Zap className="w-4 h-4 mr-2 animate-spin" />
                    Generating Personalized Prescription...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate AI-Personalized Prescription
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

const handoverTemplate = `
═══════════════════════════════════════════════
         DIALYSIS HANDOVER TEMPLATE
═══════════════════════════════════════════════

Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}

PATIENT: ___________________
Weight: _____ kg

MODALITY: □ HD  □ SLED  □ CRRT  □ PD

PRESCRIPTION:
BFR: _____ mL/min
DFR: _____ mL/min
Effluent (CRRT): _____ mL/kg/hr
UF Goal: _____ mL
Duration: _____ hours

DIALYSATE:
K: _____ | Na: _____ | Ca: _____ | HCO3: _____

ANTICOAG:
□ Heparin: _____ units/hr
□ Citrate: _____ mEq/hr
□ None

VITALS:
Pre: _____/_____ mmHg, _____ kg
Post: _____/_____ mmHg, _____ kg
Net UF: _____ mL

LABS:
Pre:  BUN _____ Cr _____ K _____ Na _____
Post: BUN _____ Cr _____ K _____ Na _____

COMPLICATIONS: □ None  □ _________________

PLAN: ____________________________________

Signature: ____________________
═══════════════════════════════════════════════
`;