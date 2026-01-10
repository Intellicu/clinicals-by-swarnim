import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MonitoringTemplateUploader from "../components/MonitoringTemplateUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ClipboardList,
  Download,
  FileText,
  Activity,
  Droplet,
  Heart,
  TrendingUp,
  Pill,
  ArrowLeft,
  Search,
  Printer,
  ChevronDown,
  ChevronUp,
  Plus,
  Upload,
  Sparkles,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

const categoryIcons = {
  "Nephrotic Syndrome": Droplet,
  "Hemodialysis": Activity,
  "Peritoneal Dialysis": Droplet,
  "Bladder Diary": FileText,
  "Blood Pressure": Heart,
  "Fluid Balance": TrendingUp,
  "Growth": TrendingUp,
  "Medication": Pill,
  "General": ClipboardList
};

const defaultTemplates = [
  {
    name: "Nephrotic Syndrome Monitoring Chart",
    category: "Nephrotic Syndrome",
    description: "Daily monitoring for children with nephrotic syndrome - weight, edema, urine protein, medications",
    frequency: "Daily",
    fields: [
      { label: "Date", type: "date", required: true },
      { label: "Time", type: "time", required: true },
      { label: "Weight (kg)", type: "number", unit: "kg", required: true },
      { label: "Edema", type: "select", options: ["None", "Periorbital", "Pedal", "Generalized", "Anasarca"], required: true },
      { label: "Urine Protein", type: "select", options: ["Negative", "Trace", "1+", "2+", "3+", "4+"], required: true },
      { label: "Urine Output (mL)", type: "number", unit: "mL" },
      { label: "Blood Pressure (systolic)", type: "number", unit: "mmHg", required: true },
      { label: "Blood Pressure (diastolic)", type: "number", unit: "mmHg", required: true },
      { label: "Prednisolone dose (mg)", type: "number", unit: "mg" },
      { label: "Other medications", type: "text" },
      { label: "Side effects/concerns", type: "text" }
    ],
    instructions: "Record daily in the morning after first void. Weigh at same time each day. Check urine protein with dipstick. Monitor for steroid side effects."
  },
  {
    name: "Hemodialysis Session Record",
    category: "Hemodialysis",
    description: "Complete HD session documentation - pre/post vitals, UF, complications, labs",
    frequency: "Per session (3x/week)",
    fields: [
      { label: "Session Date", type: "date", required: true },
      { label: "Pre-HD Weight (kg)", type: "number", unit: "kg", required: true },
      { label: "Post-HD Weight (kg)", type: "number", unit: "kg", required: true },
      { label: "Target UF (L)", type: "number", unit: "L", required: true },
      { label: "Actual UF (L)", type: "number", unit: "L", required: true },
      { label: "Pre-HD BP", type: "text", required: true },
      { label: "Post-HD BP", type: "text", required: true },
      { label: "Session Duration (hours)", type: "number", unit: "hours", required: true },
      { label: "Blood Flow Rate (mL/min)", type: "number", unit: "mL/min" },
      { label: "Complications", type: "select", options: ["None", "Hypotension", "Cramping", "Headache", "Nausea/Vomiting", "Access issues", "Other"] },
      { label: "Medications given", type: "text" },
      { label: "Pre-HD labs (BUN, Cr, K)", type: "text" },
      { label: "Post-HD BUN", type: "number", unit: "mg/dL" },
      { label: "Access site condition", type: "select", options: ["Normal", "Redness", "Swelling", "Discharge", "Pain"] },
      { label: "Notes", type: "text" }
    ],
    instructions: "Complete immediately after each HD session. Record pre/post weights accurately. Note any complications. Check access site."
  },
  {
    name: "Peritoneal Dialysis Daily Log",
    category: "Peritoneal Dialysis",
    description: "Daily PD monitoring - exchanges, UF, effluent appearance, exit site",
    frequency: "Daily",
    fields: [
      { label: "Date", type: "date", required: true },
      { label: "Morning Weight (kg)", type: "number", unit: "kg", required: true },
      { label: "Number of exchanges", type: "number", required: true },
      { label: "Total UF (mL)", type: "number", unit: "mL", required: true },
      { label: "Effluent appearance", type: "select", options: ["Clear", "Slightly cloudy", "Cloudy", "Bloody", "Fibrin"], required: true },
      { label: "Abdominal pain", type: "select", options: ["None", "Mild", "Moderate", "Severe"] },
      { label: "Exit site condition", type: "select", options: ["Normal", "Redness", "Discharge", "Pain", "Swelling"], required: true },
      { label: "Blood Pressure", type: "text", required: true },
      { label: "Dextrose concentrations used", type: "text" },
      { label: "Medications", type: "text" },
      { label: "Concerns/symptoms", type: "text" }
    ],
    instructions: "Complete daily log every morning. Check effluent clarity with each exchange. Inspect exit site daily. Report cloudy fluid immediately."
  },
  {
    name: "Home Blood Pressure Log",
    category: "Blood Pressure",
    description: "Home BP monitoring for hypertension management",
    frequency: "Twice daily",
    fields: [
      { label: "Date", type: "date", required: true },
      { label: "Time", type: "time", required: true },
      { label: "Systolic BP (mmHg)", type: "number", unit: "mmHg", required: true },
      { label: "Diastolic BP (mmHg)", type: "number", unit: "mmHg", required: true },
      { label: "Heart Rate (bpm)", type: "number", unit: "bpm" },
      { label: "Arm used", type: "select", options: ["Left", "Right"] },
      { label: "Position", type: "select", options: ["Sitting", "Lying", "Standing"] },
      { label: "Medications taken today", type: "text" },
      { label: "Symptoms", type: "select", options: ["None", "Headache", "Dizziness", "Chest pain", "Palpitations", "Other"] },
      { label: "Notes", type: "text" }
    ],
    instructions: "Measure twice daily (morning and evening) at same times. Rest 5 minutes before measuring. Use proper cuff size. Record medications taken."
  },
  {
    name: "Fluid Balance Chart (24-hour)",
    category: "Fluid Balance",
    description: "Comprehensive 24-hour fluid intake and output monitoring",
    frequency: "Continuous/24-hour",
    fields: [
      { label: "Date", type: "date", required: true },
      { label: "Time period", type: "text", required: true },
      { label: "Oral intake (mL)", type: "number", unit: "mL" },
      { label: "IV fluids (mL)", type: "number", unit: "mL" },
      { label: "NG/feeds (mL)", type: "number", unit: "mL" },
      { label: "Urine output (mL)", type: "number", unit: "mL" },
      { label: "Dialysate UF (mL)", type: "number", unit: "mL" },
      { label: "Stool output", type: "select", options: ["None", "Small", "Moderate", "Large", "Diarrhea"] },
      { label: "Vomiting/NG output (mL)", type: "number", unit: "mL" },
      { label: "Drain output (mL)", type: "number", unit: "mL" },
      { label: "Weight (kg)", type: "number", unit: "kg" },
      { label: "Edema assessment", type: "select", options: ["None", "Periorbital", "Pedal", "Sacral", "Generalized"] }
    ],
    instructions: "Record all intake (oral, IV, feeds) and output (urine, stool, vomit, drains, dialysate) every shift or continuously. Calculate cumulative balance."
  },
  {
    name: "Pediatric Growth Chart",
    category: "Growth",
    description: "Serial growth monitoring - height, weight, head circumference",
    frequency: "Monthly (infants), Quarterly (children)",
    fields: [
      { label: "Date", type: "date", required: true },
      { label: "Age (years)", type: "number", required: true },
      { label: "Weight (kg)", type: "number", unit: "kg", required: true },
      { label: "Height/Length (cm)", type: "number", unit: "cm", required: true },
      { label: "Head Circumference (cm)", type: "number", unit: "cm" },
      { label: "BMI", type: "number", unit: "kg/m²" },
      { label: "Weight-for-age %ile", type: "number" },
      { label: "Height-for-age %ile", type: "number" },
      { label: "BMI-for-age %ile", type: "number" },
      { label: "Mid-arm circumference (cm)", type: "number", unit: "cm" },
      { label: "Tanner stage", type: "select", options: ["I", "II", "III", "IV", "V"] },
      { label: "Nutritional interventions", type: "text" }
    ],
    instructions: "Measure at same time of day if possible. Plot on WHO or country-specific growth charts. Calculate BMI and percentiles. Assess pubertal development."
  },
  {
    name: "Medication Adherence Log",
    category: "Medication",
    description: "Daily medication tracking with timing and missed doses",
    frequency: "Daily",
    fields: [
      { label: "Date", type: "date", required: true },
      { label: "Medication 1 (name & dose)", type: "text", required: true },
      { label: "Medication 1 - Morning", type: "select", options: ["Taken", "Missed", "Delayed"] },
      { label: "Medication 1 - Evening", type: "select", options: ["Taken", "Missed", "Delayed"] },
      { label: "Medication 2 (name & dose)", type: "text" },
      { label: "Medication 2 - Morning", type: "select", options: ["Taken", "Missed", "Delayed"] },
      { label: "Medication 2 - Evening", type: "select", options: ["Taken", "Missed", "Delayed"] },
      { label: "Side effects", type: "text" },
      { label: "Reason for missed doses", type: "text" }
    ],
    instructions: "Record immediately after taking medications. Note reasons for missed doses. Report side effects to your doctor."
  },
  {
    name: "Bladder Diary (Voiding Chart)",
    category: "Bladder Diary",
    description: "Track voiding frequency, volume, accidents for bladder dysfunction",
    frequency: "Continuous for 3-7 days",
    fields: [
      { label: "Date", type: "date", required: true },
      { label: "Time", type: "time", required: true },
      { label: "Void volume (mL)", type: "number", unit: "mL" },
      { label: "Fluid intake (mL)", type: "number", unit: "mL" },
      { label: "Accident", type: "select", options: ["No", "Small", "Large", "Complete"] },
      { label: "Urgency", type: "select", options: ["None", "Mild", "Moderate", "Severe"] },
      { label: "Activity", type: "text" },
      { label: "Notes", type: "text" }
    ],
    instructions: "Record every void and fluid intake for 3-7 days. Measure void volume with measuring cup. Note accidents. Track fluid intake accurately."
  }
];

export default function MonitoringHub() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [expandedTemplates, setExpandedTemplates] = useState({});
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    category: "General",
    description: "",
    frequency: "",
    fields: [],
    instructions: ""
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: customTemplates = [] } = useQuery({
    queryKey: ['monitoringTemplates'],
    queryFn: () => base44.entities.MonitoringTemplate.list(),
    initialData: []
  });

  const createTemplateMutation = useMutation({
    mutationFn: (data) => base44.entities.MonitoringTemplate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitoringTemplates'] });
      toast.success("Monitoring template created!");
      setShowCreateDialog(false);
      setNewTemplate({
        name: "",
        category: "General",
        description: "",
        frequency: "",
        fields: [],
        instructions: ""
      });
    }
  });

  const allTemplates = [...defaultTemplates, ...customTemplates];

  const handleDownload = (template) => {
    const csvContent = generateCSV(template);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.name.replace(/\s+/g, '_')}.csv`;
    a.click();
    toast.success(`${template.name} downloaded!`);
  };

  const handlePrint = (template) => {
    const printContent = generatePrintTemplate(template);
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const generateCSV = (template) => {
    const headers = template.fields.map(f => f.label + (f.unit ? ` (${f.unit})` : "")).join(',');
    return `${template.name}\n${template.instructions || ""}\n\n${headers}\n`;
  };

  const generatePrintTemplate = (template) => {
    return `
      <html>
        <head>
          <title>${template.name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #4F46E5; border-bottom: 2px solid #4F46E5; padding-bottom: 10px; }
            .instructions { background: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #D1D5DB; padding: 12px; text-align: left; }
            th { background: #EEF2FF; font-weight: bold; }
            .footer { margin-top: 40px; font-size: 12px; color: #6B7280; }
          </style>
        </head>
        <body>
          <h1>${template.name}</h1>
          <p><strong>Category:</strong> ${template.category}</p>
          <p><strong>Frequency:</strong> ${template.frequency}</p>
          ${template.instructions ? `<div class="instructions"><strong>Instructions:</strong><br>${template.instructions}</div>` : ""}
          <table>
            <thead>
              <tr>
                ${template.fields.map(f => `<th>${f.label}${f.unit ? ` (${f.unit})` : ""}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${Array(14).fill(0).map(() => `<tr>${template.fields.map(() => '<td>&nbsp;<br>&nbsp;</td>').join('')}</tr>`).join('')}
            </tbody>
          </table>
          <div class="footer">
            <p>CliniCals by Swarnim - Pediatric Nephrology Monitoring Template</p>
            <p>Printed: ${new Date().toLocaleDateString()}</p>
          </div>
        </body>
      </html>
    `;
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadedFile(file);
    setIsExtracting(true);

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      const prompt = `Extract monitoring template from this document.

Return a structured monitoring template with:
- Template name
- Category (Nephrotic Syndrome, Hemodialysis, Blood Pressure, etc.)
- Description
- Recommended frequency
- All fields/parameters to track (with types: number, text, select, date, time)
- Instructions for use`;

      const extracted = await base44.integrations.Core.InvokeLLM({
        prompt,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            category: { type: "string" },
            description: { type: "string" },
            frequency: { type: "string" },
            fields: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  label: { type: "string" },
                  type: { type: "string" },
                  unit: { type: "string" },
                  required: { type: "boolean" }
                }
              }
            },
            instructions: { type: "string" }
          }
        }
      });

      setNewTemplate(extracted);
      toast.success("Template extracted!");
      setShowAIDialog(false);
    } catch (error) {
      toast.error("Failed to extract template");
    } finally {
      setIsExtracting(false);
    }
  };

  const filteredTemplates = allTemplates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         t.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || t.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["All", ...new Set(allTemplates.map(t => t.category))];

  const toggleExpand = (idx) => {
    setExpandedTemplates(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        <Link to={createPageUrl("Hub")}>
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Hub
          </Button>
        </Link>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <ClipboardList className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Clinical Monitoring Hub</h1>
                <p className="text-slate-600">{allTemplates.length} downloadable monitoring charts</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI Extract
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>AI Template Extraction</DialogTitle>
                  </DialogHeader>
                  <div className="p-4">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      disabled={isExtracting}
                      className="block w-full"
                    />
                    {isExtracting && <Loader2 className="w-5 h-5 animate-spin mt-2" />}
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-cyan-600 hover:bg-cyan-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Custom
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create Custom Monitoring Template</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label>Template Name *</Label>
                      <Input
                        value={newTemplate.name}
                        onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Category *</Label>
                      <Input
                        value={newTemplate.category}
                        onChange={(e) => setNewTemplate({...newTemplate, category: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={newTemplate.description}
                        onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                      />
                    </div>
                    <Button
                      onClick={() => createTemplateMutation.mutate(newTemplate)}
                      disabled={!newTemplate.name || createTemplateMutation.isPending}
                      className="w-full bg-cyan-600"
                    >
                      {createTemplateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                      Create Template
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search monitoring templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={activeCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(cat)}
                className={activeCategory === cat ? "bg-cyan-600 hover:bg-cyan-700" : ""}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template, idx) => {
            const IconComponent = categoryIcons[template.category] || ClipboardList;
            const isExpanded = expandedTemplates[idx];
            
            return (
              <Card key={idx} className="bg-white shadow-lg hover:shadow-xl transition-all border-2 hover:border-cyan-400">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-cyan-50 border-b">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-6 h-6 text-cyan-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base font-bold text-slate-900 mb-1">
                        {template.name}
                      </CardTitle>
                      <Badge variant="outline" className="text-xs bg-cyan-50 text-cyan-700 border-cyan-300">
                        {template.frequency}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-sm text-slate-600 mb-4">
                    {template.description}
                  </p>

                  <div className="bg-blue-50 p-3 rounded border border-blue-200 mb-4 text-xs text-blue-800">
                    <strong>Fields:</strong> {template.fields?.length || 0} parameters to track
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpand(idx)}
                    className="w-full mb-3 text-xs"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4 mr-2" /> : <ChevronDown className="w-4 h-4 mr-2" />}
                    {isExpanded ? 'Hide Details' : 'Show Details'}
                  </Button>

                  {isExpanded && template.instructions && (
                    <Alert className="bg-amber-50 border-amber-200 mb-4">
                      <AlertDescription className="text-xs text-amber-800">
                        <strong>Instructions:</strong> {template.instructions}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleDownload(template)}
                      size="sm"
                      className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      CSV
                    </Button>
                    <Button
                      onClick={() => handlePrint(template)}
                      size="sm"
                      variant="outline"
                      className="flex-1 border-cyan-300 text-cyan-700"
                    >
                      <Printer className="w-4 h-4 mr-2" />
                      Print
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="mt-12 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <FileText className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">How to Use Monitoring Templates</h3>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li>• <strong>Download CSV:</strong> Import into Excel/Google Sheets for digital tracking</li>
                  <li>• <strong>Print:</strong> Print blank forms for manual paper-based recording</li>
                  <li>• <strong>Instructions:</strong> Follow specific instructions for each template</li>
                  <li>• <strong>Bring to Clinic:</strong> Share completed logs with your nephrologist</li>
                  <li>• <strong>Consistency:</strong> Record at same time each day for accurate trends</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}