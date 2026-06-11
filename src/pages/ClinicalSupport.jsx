import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft,
  Brain,
  Search,
  AlertTriangle,
  CheckCircle2,
  Circle,
  ChevronRight,
  Info,
  FileText,
  GitBranch,
  Table as TableIcon,
  Clipboard,
  TrendingUp,
  Zap,
  Activity,
  Microscope,
  Stethoscope,
  Heart,
  Droplet,
  Loader2,
  Copy,
  Lightbulb,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  Thermometer,
  Baby,
  Pill,
  Flame,
  Wind,
  Beaker,
  Edit,
  ClipboardList,
  TestTube } from
"lucide-react";
import { toast } from "sonner";
import HSPNPathway from "../components/pathways/HSPNPathway";
import EnhancedNephroticPathway from "../components/pathways/EnhancedNephroticPathway";
import { useQuery } from '@tanstack/react-query';
import BiopsyAnalyzer from '../components/clinical-ai/BiopsyAnalyzer';
import RadiologyAnalyzer from '../components/clinical-ai/RadiologyAnalyzer';
import LabReportAnalyzer from '../components/clinical-ai/LabReportAnalyzer';
import ClinicalCaseAnalyzer from '../components/clinical-ai/ClinicalCaseAnalyzer';
import GlomerularDiseasesPathway from '../components/pathways/GlomerularDiseasesPathway';
import PathwayRenderer from '../components/pathways/PathwayRenderer';
import { TubularDisordersSection, ClinicalAIAgentsSection, RareDiseaseScreeningSection } from '../components/hub/HubSpecialtySections';
import { PathwayModal, AIPathwayGenerator, PathwayCard, QuickAccessDashboard } from '../components/hub/ClinicalPathwayManager';
import { Star, Plus, Sparkles, Cpu } from 'lucide-react';
import IntelligenceEnginesTab from '../components/engines/IntelligenceEnginesTab';


// Symptom templates based on chief complaints
const SYMPTOM_TEMPLATES = {
  "Edema": {
    prompt: "Describe edema:",
    fields: ["Location (periorbital/pedal/generalized)", "Duration", "Progression (worse AM vs PM)", "Associated symptoms (foamy urine, oliguria, weight gain)", "Previous episodes"]
  },
  "Hematuria": {
    prompt: "Describe hematuria:",
    fields: ["Color (cola/tea/bright red/pink)", "Onset (sudden/gradual)", "Duration", "Painful/painless", "Timing (throughout stream/initial/terminal)", "Associated (dysuria, fever, rash, joint pain, recent pharyngitis)"]
  },
  "Oliguria/Anuria": {
    prompt: "Describe urine output:",
    fields: ["Duration (hours/days)", "Last void time", "Estimated urine output", "24h fluid intake", "Associated (vomiting, diarrhea, edema, lethargy)", "Recent medications (NSAIDs, ACE-I)"]
  },
  "Flank Pain": {
    prompt: "Describe pain:",
    fields: ["Location (left/right/bilateral/loin-to-groin)", "Onset (sudden/gradual)", "Character (colicky/constant/dull/sharp)", "Severity (0-10 pain scale)", "Radiation (groin/abdomen)", "Aggravating factors", "Associated (fever, hematuria, vomiting, dysuria)"]
  },
  "Fever + UTI symptoms": {
    prompt: "Describe symptoms:",
    fields: ["Fever duration (days)", "Maximum temperature (°C)", "Pattern (continuous/intermittent)", "Dysuria (yes/no)", "Frequency/urgency", "Abdominal/flank pain", "Vomiting", "Number of previous UTIs", "Recent antibiotic use"]
  },
  "Hypertension": {
    prompt: "BP and symptoms:",
    fields: ["BP readings (document all measurements)", "Duration if known", "Headache (location, severity)", "Visual changes (blurring, diplopia)", "Chest pain", "Seizures", "Vomiting", "Known kidney disease/prior diagnosis"]
  },
  "Proteinuria/Foamy Urine": { // New Template
    prompt: "Describe urinary findings:",
    fields: ["Duration of foamy urine", "Edema present", "Urine color", "Oliguria", "Recent illness (URTI, diarrhea)", "Family history (kidney disease)", "Medications"]
  },
  "Polyuria/Polydipsia": { // New Template
    prompt: "Describe fluid balance:",
    fields: ["Urine frequency (times per day)", "Nocturia (yes/no, how many times)", "Estimated urine volume", "Water intake (liters/day)", "Duration", "Weight loss", "Associated (constipation, weakness, growth failure)"]
  }
};


// ── CONSOLIDATED CLINICAL SCENARIOS ─────────────────────────────────────────
// Governance: One entry per disease/syndrome. Superficial duplicates removed.
// Nephrotic: merged childhood/MCD/SSNS/SRNS into ns-engine + nephrotic-syndrome
// CKD: merged staging/MBD/anemia/comprehensive → ckd-comprehensive + ckd-mbd
// Electrolytes: merged hyperkalemia variants → hyperkalemia-deep-engine
// Hematuria: merged hematuria-approach → hematuria-engine
// Glomerular: IgA Vasculitis/HSPN consolidated; TMA merged with HUS
// Hypertension: kept bp-classification + htn-pres + secondary-htn + neonatal-htn (all clinically distinct)
const clinicalScenarios = [
// ── NEPHROTIC SYNDROME (master) ──
{
  id: "ns-engine",
  title: "Nephrotic Syndrome — Full Decision Engine (SSNS/FRNS/SDNS/SRNS/MCD/FSGS/MN/Genetic/Congenital)",
  category: "Nephrotic Syndrome",
  priority: "secondary",
  description: "ISPN 2022 · IPNA 2021 · Complete stepwise engine: initial Rx, response, steroid-sparing, SRNS, genetics, biopsy",
  icon: Droplet,
  hasFullPathway: true
},
{
  id: "severe-edema-ns",
  title: "Severe Edema & Complications in Nephrotic Syndrome",
  category: "Nephrotic Syndrome",
  priority: "danger",
  description: "Diuretic resistance, hypoalbuminaemia, SBP prophylaxis, VTE, hypertension in active NS",
  icon: Droplet,
  hasFullPathway: true
},
{
  id: "congenital-nephrotic",
  title: "Congenital Nephrotic Syndrome (<3 months)",
  category: "Nephrotic Syndrome",
  priority: "warning",
  description: "Finnish type (NPHS1), NPHS2, WT1, LAMB2 — no steroids, genetic panel, nephrectomy + transplant",
  icon: Baby,
  hasFullPathway: true
},
// ── AKI & EMERGENCY ──
{
  id: "aki-engine",
  title: "Acute Kidney Injury — Full Engine (pRIFLE/KDIGO)",
  category: "Acute Kidney Disease",
  priority: "danger",
  description: "Staging · Etiology · Fluid management · RRT triggers · CRRT prescription · Recovery",
  icon: AlertTriangle,
  hasFullPathway: true
},
{
  id: "hemolytic-uremic",
  title: "HUS / TMA / aHUS — Complete Pathway",
  category: "Acute Kidney Disease",
  priority: "danger",
  description: "STEC-HUS (supportive) · aHUS (eculizumab/ravulizumab) · TTP (PLEX) · anti-CFH Ab therapy",
  icon: Activity,
  hasFullPathway: true
},
{
  id: "tumor-lysis",
  title: "Tumor Lysis Syndrome",
  category: "Acute Kidney Disease",
  priority: "danger",
  description: "Cairo-Bishop criteria · Prevention (allopurinol/rasburicase) · Hyperkalemia/hyperphosphatemia management",
  icon: Flame,
  hasFullPathway: true
},
// ── GLOMERULAR DISEASE ──
{
  id: "iga-nephropathy",
  title: "IgA Nephropathy / IgA Vasculitis (Oxford MEST-C)",
  category: "Glomerular Disease",
  priority: "secondary",
  description: "Oxford classification · ACEi/SGLT2i · Nefecon · IgAV nephritis (HSP) — unified pathway",
  icon: Microscope,
  hasFullPathway: true
},
{
  id: "lupus-nephritis",
  title: "Lupus Nephritis (ISN/RPS · Voclosporin · Belimumab)",
  category: "Glomerular Disease",
  priority: "warning",
  description: "Biopsy mandatory · Class III/IV: Voclosporin triple therapy · Class V: CNI · Maintenance: MMF",
  icon: Microscope,
  hasFullPathway: true
},
{
  id: "anca-vasculitis",
  title: "ANCA Vasculitis GN (GPA/MPA · Avacopan)",
  category: "Glomerular Disease",
  priority: "danger",
  description: "Pauci-immune crescentic GN · Rituximab/CYC · Avacopan (steroid-sparing) · PLEX criteria",
  icon: Microscope,
  hasFullPathway: true
},
{
  id: "rpgn-deep-engine",
  title: "RPGN — Rapidly Progressive GN",
  category: "Glomerular Disease",
  priority: "danger",
  description: "Anti-GBM · ANCA · Immune-complex · IF-guided treatment · PLEX indications",
  icon: AlertTriangle,
  hasFullPathway: true
},
{
  id: "post-strep-gn",
  title: "Post-Streptococcal GN (PSGN)",
  category: "Glomerular Disease",
  priority: "secondary",
  description: "Self-limiting · C3 low/C4 normal · ASOT · Watchful waiting · Red flags for biopsy",
  icon: Microscope,
  hasFullPathway: true
},
{
  id: "hematuria-approach",
  title: "Haematuria — Diagnostic Algorithm",
  category: "Glomerular Disease",
  priority: "secondary",
  description: "Glomerular vs urological · RBC casts · Alport/TBMN · Workup algorithm",
  icon: Droplet,
  hasFullPathway: true
},
{
  id: "proteinuria-approach",
  title: "Proteinuria — Diagnostic Approach",
  category: "Glomerular Disease",
  priority: "secondary",
  description: "UPCR · Transient vs persistent · Orthostatic · Glomerular vs tubular · Biopsy indications",
  icon: Beaker,
  hasFullPathway: true
},
// ── HYPERTENSION ──
{
  id: "htn-pres",
  title: "Hypertensive Emergency & PRES",
  category: "Hypertension",
  priority: "danger",
  description: "IV labetalol/nicardipine · 25% MAP reduction · PRES MRI — ISPN/AAP",
  icon: AlertTriangle,
  hasFullPathway: true
},
{
  id: "htn-engine",
  title: "Paediatric Hypertension — Full Engine (AAP 2017)",
  category: "Hypertension",
  priority: "secondary",
  description: "BP percentiles · Stage 1/2 · Ambulatory BP · Secondary workup · Drug table",
  icon: Heart,
  hasFullPathway: true
},
{
  id: "secondary-htn",
  title: "Secondary Hypertension — Renovascular & Endocrine",
  category: "Hypertension",
  priority: "warning",
  description: "FMD · Phaeochromocytoma · Coarctation · Hyperaldosteronism · Systematic workup",
  icon: Heart,
  hasFullPathway: true
},
{
  id: "neonatal-htn",
  title: "Neonatal Hypertension",
  category: "Hypertension",
  priority: "warning",
  description: "UAC thrombosis · Renal artery stenosis · Amlodipine/captopril dosing — NeoKidney/AAP",
  icon: Baby,
  hasFullPathway: true
},
// ── ELECTROLYTES ──
{
  id: "electrolytes-hub",
  title: "Electrolyte Disorders Hub (K+ · Na+ · Ca²⁺ · Mg²⁺ · PO₄)",
  category: "Electrolytes",
  priority: "danger",
  description: "Dyskalemia · Dysnatremia · Calcium/Phosphate · Magnesium — algorithmic engines for all",
  icon: Zap,
  hasFullPathway: true
},
{
  id: "acid-base-hub",
  title: "Acid-Base Interpreter (pH · pCO₂ · HCO₃ · AG · Delta-Delta)",
  category: "Electrolytes",
  priority: "warning",
  description: "Primary disorder · Compensation · Mixed disorders · MUDPILES · RTA differentiation",
  icon: Wind,
  hasFullPathway: true
},
{
  id: "fluid-electrolyte",
  title: "Fluid & Electrolyte Therapy",
  category: "Fluids & Electrolytes",
  priority: "secondary",
  description: "Holliday-Segar maintenance · Deficit replacement · Dehydration correction",
  icon: Droplet,
  hasFullPathway: true
},
// ── CKD ──
{
  id: "ckd-engine",
  title: "CKD — Complete Management Engine (KDIGO Stages 1–5)",
  category: "CKD",
  priority: "secondary",
  description: "Staging · Etiology · Renoprotection · MBD · Anaemia · Nutrition · ESRD prep · RRT planning",
  icon: TrendingUp,
  hasFullPathway: true
},
{
  id: "ckd-progression",
  title: "CKD Progression Risk Stratification",
  category: "CKD",
  priority: "warning",
  description: "Heat map · Modifiable risk factors · SGLT2i · RAAS · Progression prediction",
  icon: TrendingUp,
  hasFullPathway: true
},
// ── TRANSPLANT ──
{
  id: "kidney-transplant",
  title: "Paediatric Kidney Transplantation",
  category: "Transplant",
  priority: "secondary",
  description: "Pre-transplant workup · Immunosuppression · Rejection types · BK virus · FSGS recurrence",
  icon: CheckCircle2,
  hasFullPathway: true
},
{
  id: "transplant-rejection",
  title: "Acute Transplant Rejection",
  category: "Transplant",
  priority: "danger",
  description: "Rising creatinine post-Tx · T-cell vs antibody-mediated rejection · Biopsy interpretation",
  icon: AlertTriangle,
  hasFullPathway: true
},
// ── RRT / DIALYSIS ──
{
  id: "rrt-engine",
  title: "RRT — Dialysis Engine (HD/PD/CRRT/SLED)",
  category: "RRT & Dialysis",
  priority: "secondary",
  description: "Indications · Modality selection · Prescription · Access · Adequacy · Complications",
  icon: Activity,
  hasFullPathway: true
},
{
  id: "dialysis-catheter-infection",
  title: "Dialysis Catheter-Related Bacteraemia",
  category: "RRT & Dialysis",
  priority: "danger",
  description: "Central line infection · Empiric antibiotics · Catheter salvage vs removal",
  icon: Thermometer,
  hasFullPathway: true
},
// ── TUBULAR DISORDERS (master hub links) ──
{
  id: "tubular-engine",
  title: "Tubular Disorders Hub (Bartter/Gitelman/RTA/Fanconi/NDI/Dent)",
  category: "Tubular Disorders",
  priority: "secondary",
  description: "All tubular disorders in one algorithmic engine — ERKNet/ESPN aligned",
  icon: Beaker,
  hasFullPathway: true
},
{
  id: "renal-stone",
  title: "Renal Stone Analysis & Prevention",
  category: "Tubular Disorders",
  priority: "secondary",
  description: "Metabolic stone workup · Composition · Prevention strategies · Lithotripsy indications",
  icon: Beaker,
  hasFullPathway: true
},
// ── CAKUT & UROLOGY ──
{
  id: "cakut-engine",
  title: "CAKUT Master Hub (Hydronephrosis/UPJO/VUR/PUV/Duplex/MCDK)",
  category: "CAKUT & Urology",
  priority: "secondary",
  description: "Antenatal hydronephrosis · UPJO · VUR grading · PUV · Megaureter · MCDK — all algorithmic",
  icon: Baby,
  hasFullPathway: true
},
{
  id: "uti-febrile",
  title: "Febrile UTI — Evaluation & Imaging",
  category: "CAKUT & Urology",
  priority: "warning",
  description: "Post-febrile UTI workup · DMSA timing · VUR evaluation · Antibiotic choice",
  icon: Thermometer,
  hasFullPathway: true
},
{
  id: "neurogenic-bladder-engine",
  title: "Neurogenic Bladder (MMC/SCI/BBD)",
  category: "CAKUT & Urology",
  priority: "secondary",
  description: "Classification · CIC · Anticholinergics · BTX · DSD · Surgical options",
  icon: Brain,
  hasFullPathway: true
},
// ── METABOLIC & GENETIC (link to Rare Disease module) ──
{
  id: "cystinosis",
  title: "Cystinosis → see Rare Disease Module",
  category: "Metabolic & Genetic",
  priority: "warning",
  description: "Lysosomal storage · Fanconi syndrome · Cysteamine therapy — ISPN/ERKNet",
  icon: Microscope,
  hasFullPathway: true
},
{
  id: "fabry",
  title: "Fabry Disease → see Rare Disease Module",
  category: "Metabolic & Genetic",
  priority: "warning",
  description: "Alpha-Gal A deficiency · ERT · Migalastat — ERKNet + India access",
  icon: Microscope,
  hasFullPathway: true
},
{
  id: "primary-hyperoxaluria",
  title: "Primary Hyperoxaluria (Lumasiran/Liver-Kidney Tx)",
  category: "Metabolic & Genetic",
  priority: "warning",
  description: "PH1/PH2/PH3 · Lumasiran (RNAi) · Pre-emptive liver-kidney transplant — OHF 2023",
  icon: TestTube,
  hasFullPathway: true
},
{
  id: "arpkd-adpkd",
  title: "ARPKD / ADPKD (PKHD1/PKD1/PKD2)",
  category: "Metabolic & Genetic",
  priority: "secondary",
  description: "PKHD1 · PKD1+PKD2 · Tolvaptan in ADPKD · Liver complications — KDIGO + ERKNet",
  icon: Activity,
  hasFullPathway: true
},
{
  id: "nephronophthisis",
  title: "Nephronophthisis & Ciliopathies (NPHP/BBS/Joubert)",
  category: "Metabolic & Genetic",
  priority: "secondary",
  description: "NPHP genes · Molar tooth sign · Bardet-Biedl · Setmelanotide — CilioPathy Alliance",
  icon: Brain,
  hasFullPathway: true
},
{
  id: "genetic-nephrotic",
  title: "Genetic Nephrotic Syndromes (NPHS1/2/WT1/COQ)",
  category: "Metabolic & Genetic",
  priority: "warning",
  description: "WES indication · Transplant outcomes · SRNS genetic panel — ISPN 2023",
  icon: Microscope,
  hasFullPathway: true
},
// ── INFECTION ──
{
  id: "sbp",
  title: "Spontaneous Bacterial Peritonitis (SBP) in NS",
  category: "Infection",
  priority: "danger",
  description: "Infected ascites · Empiric antibiotics · Prophylaxis in high-risk NS",
  icon: AlertTriangle,
  hasFullPathway: true
},
];


// AI Agent Content Components
const BiopsyAnalyzerContent = () => <BiopsyAnalyzer />;
const RadiologyAnalyzerContent = () => <RadiologyAnalyzer />;
const LabReportAnalyzerContent = () => <LabReportAnalyzer />;
const ClinicalCaseAnalyzerContent = () => <ClinicalCaseAnalyzer />;

export default function ClinicalSupport() {
  const location = useLocation();

  const getUrlParams = () => {
    const p = new URLSearchParams(location.search);
    const tab = p.get("tab");
    // remap legacy tab names
    const remapped = tab === "diagnostic" ? "ai-agents" : tab === "engines" ? "engines" : (tab || "scenarios");
    return { tab: remapped, scenario: p.get("scenario") || null };
  };

  const [activeTab, setActiveTab] = useState(() => getUrlParams().tab);
  const [selectedScenario, setSelectedScenario] = useState(() => {
    const s = getUrlParams().scenario;
    return s || null;
  });
  const [scenarioSource, setScenarioSource] = useState(() => {
    // If opened with a scenario from URL, default to engines source so back goes to engines
    const s = getUrlParams().scenario;
    return s ? "engines" : "scenarios";
  });

  // Re-read URL params whenever location changes (e.g. navigation from hub)
  useEffect(() => {
    const { tab, scenario } = getUrlParams();
    if (tab) setActiveTab(tab);
    if (scenario) setSelectedScenario(scenario);
  }, [location.search]);

  // Scroll to top on tab change and scenario selection
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTab, selectedScenario]);

  // Handle mobile hardware back button — when a scenario is open, go back to list
  useEffect(() => {
    if (selectedScenario) {
      window.history.pushState({ scenarioOpen: true }, "");
      const handlePop = () => {
        setSelectedScenario(null);
        setActiveTab("scenarios");
      };
      window.addEventListener("popstate", handlePop);
      return () => window.removeEventListener("popstate", handlePop);
    }
  }, [selectedScenario]);

  // Diagnostic AI state
  const [diagnosticStep, setDiagnosticStep] = useState(1);
  const [patientAge, setPatientAge] = useState("");
  const [patientGender, setPatientGender] = useState("");
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [symptomTemplate, setSymptomTemplate] = useState(null); // New state for guided symptom entry
  const [symptoms, setSymptoms] = useState("");
  const [labValues, setLabValues] = useState("");
  const [clinicalFindings, setClinicalFindings] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]); // New state for uploaded files
  const [isUploadingFiles, setIsUploadingFiles] = useState(false); // New state for upload status
  const [diagnosticResults, setDiagnosticResults] = useState(null);
  const [isGeneratingDx, setIsGeneratingDx] = useState(false);

  // MEST-C and pathway state
  const [mestC, setMestC] = useState({ M: null, E: null, S: null, T: null, C: null });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const handleAIPromptFromPathway = (prompt) => {
    toast.success("Opening AI Assistant...");
    setTimeout(() => {
      window.open(createPageUrl("AIAssistant") + `?prompt=${encodeURIComponent(prompt)}`, '_blank');
    }, 500);
  };

  // New function for handling chief complaint selection and template population
  const handleChiefComplaintSelect = (complaint) => {
    setChiefComplaint(complaint);
    if (complaint === "Other") {
      setSymptomTemplate(null);
      setSymptoms(""); // Clear symptoms for free text
    } else {
      const template = SYMPTOM_TEMPLATES[complaint];
      setSymptomTemplate(template);

      if (template) {
        // Adjust promptText formatting for better readability
        const promptText = `${template.prompt}\n\n${template.fields.map((f, i) => `${i + 1}. ${f}:\n   `).join('\n')}`;
        setSymptoms(promptText);
      } else {
        setSymptoms(""); // Clear symptoms if no template
      }
    }
  };

  // New function for handling file uploads
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploadingFiles(true);
    toast.info(`Uploading ${files.length} file(s)...`, { id: "file-upload" });

    try {
      const uploadedUrls = [];
      for (const file of files) {
        // Assuming base44.integrations.Core.UploadFile returns { file_url: string }
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        uploadedUrls.push({ name: file.name, url: file_url, type: file.type });
      }

      setUploadedFiles((prev) => [...prev, ...uploadedUrls]);
      toast.success(`${files.length} file(s) uploaded!`, { id: "file-upload" });
    } catch (error) {
      console.error("File upload error:", error);
      toast.error("Failed to upload files", { id: "file-upload" });
    } finally {
      e.target.value = null; // Clear input field
      setIsUploadingFiles(false);
    }
  };

  const generateDifferentialDx = async () => {
    setIsGeneratingDx(true);

    try {
      const filesContext = uploadedFiles.length > 0 ?
      `UPLOADED FILES:\n${uploadedFiles.map((f) => `- ${f.name} (${f.type})`).join('\n')}\n\n` :
      '';

      const prompt = `You are an expert pediatric nephrologist. Analyze this case and provide structured differential diagnosis.

PATIENT: ${patientAge}y ${patientGender}
CHIEF COMPLAINT: ${chiefComplaint}

SYMPTOMS & HISTORY:
${symptoms}

LABORATORY VALUES:
${labValues}

PHYSICAL EXAMINATION:
${clinicalFindings}

${filesContext}${uploadedFiles.length > 0 ? 'Analyze attached files for additional clinical information (lab reports, imaging, clinical photos).' : ''}

IMPORTANT: DO NOT use asterisks or markdown bold formatting (no **). Use plain text.

Provide comprehensive differential diagnosis ranked by likelihood with clinical reasoning.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        file_urls: uploadedFiles.length > 0 ? uploadedFiles.map((f) => f.url) : undefined, // Pass file URLs
        response_json_schema: {
          type: "object",
          properties: {
            differential_diagnoses: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  diagnosis: { type: "string" },
                  probability: { type: "string" },
                  reasoning: { type: "string" },
                  key_supporting_features: { type: "array", items: { type: "string" } },
                  key_missing_features: { type: "array", items: { type: "string" } },
                  next_steps: { type: "array", items: { type: "string" } }, // Added next_steps
                  related_pathway: { type: "string" }
                }
              }
            },
            red_flags: { type: "array", items: { type: "string" } },
            recommended_workup: { type: "array", items: { type: "string" } },
            clinical_reasoning: { type: "string" },
            image_findings: { type: "string" } // Added image_findings to schema
          }
        },
        add_context_from_internet: true
      });

      setDiagnosticResults({
        ...response,
        editable: user?.role === 'admin',
        isEditing: false
      });
      toast.success("Differential diagnosis generated!"); // Added success toast
    } catch (error) {
      console.error("Error generating diagnosis:", error);
      toast.error("Failed to generate differential diagnosis");
    } finally {
      setIsGeneratingDx(false);
    }
  };

  const resetDiagnosticAgent = () => {
    setDiagnosticStep(1);
    setPatientAge("");
    setPatientGender("");
    setChiefComplaint("");
    setSymptomTemplate(null); // Reset symptom template
    setSymptoms("");
    setLabValues("");
    setClinicalFindings("");
    setUploadedFiles([]); // Clear uploaded files
    setDiagnosticResults(null);
  };

  const renderDiagnosticAgent = () =>
  <div className="space-y-6">
      <Alert className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
        <Brain className="w-5 h-5 text-purple-600" />
        <AlertDescription className="text-purple-800">
          <strong>AI Diagnostic Assistant:</strong> Upload images/reports (PDF/JPG/PNG/DOC) and use guided prompts for evidence-based differential diagnoses
        </AlertDescription>
      </Alert>

      {!diagnosticResults ?
    <Card className="bg-white shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Stethoscope className="w-5 h-5 text-purple-600" />
              Clinical Data Entry - Step {diagnosticStep} of 5 {/* Updated from 4 to 5 */}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {diagnosticStep === 1 &&
        <div className="space-y-4">
                <div>
                  <Label>Age (years) *</Label> {/* Label text changed, removed htmlFor */}
                  <Input
              type="number"
              value={patientAge}
              onChange={(e) => setPatientAge(e.target.value)}
              placeholder="e.g., 8"
              className="mt-1" />
            
                </div>

                <div>
                  <Label>Gender *</Label> {/* Label text changed, removed htmlFor */}
                  <Select value={patientGender} onValueChange={setPatientGender}>
                    <SelectTrigger className="mt-1"> {/* Removed id */}
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Chief Complaint * (Guided templates available)</Label>
                  <Select value={chiefComplaint} onValueChange={handleChiefComplaintSelect}> {/* Using Select */}
                    <SelectTrigger className="mt-1"> {/* Removed id */}
                      <SelectValue placeholder="Select chief complaint for guided prompts" /> {/* Updated placeholder */}
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(SYMPTOM_TEMPLATES).map((key) =>
                <SelectItem key={key} value={key}>{key}</SelectItem>
                )}
                      <SelectItem value="Other">Other (free text)</SelectItem> {/* Added "Other" option */}
                    </SelectContent>
                  </Select>
                  {/* Conditional input for "Other" if needed for custom input */}
                  {chiefComplaint === "Other" &&
            <Input
              value={symptoms} // Use symptoms for "Other"
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Describe the chief complaint in detail"
              className="mt-2" />

            }
                </div>

                <Button
            onClick={() => setDiagnosticStep(2)}
            disabled={!patientAge || !patientGender || !chiefComplaint || chiefComplaint === "Other" && !symptoms.trim()} // Added condition for "Other"
            className="w-full bg-purple-600 hover:bg-purple-700">
            
                  Next: Symptoms
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
        }

            {diagnosticStep === 2 &&
        <div className="space-y-4">
                {symptomTemplate && // Alert for guided template
          <Alert className="bg-blue-50 border-blue-200">
                    <Info className="w-4 h-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      <strong>Guided Template for {chiefComplaint}:</strong> Fill in each numbered field below
                    </AlertDescription>
                  </Alert>
          }
                <div>
                  <Label htmlFor="symptoms">Symptoms & History * (Use template or free text)</Label> {/* Updated label */}
                  <Textarea
              id="symptoms"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Describe symptoms, duration, progression..."
              className="mt-1 h-56 font-mono text-sm" // Increased height and added font styling
            />
                  {symptomTemplate && <p className="text-xs text-slate-500 mt-1">Template fields pre-filled above - just add details after each number</p>} {/* Added helper text */}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setDiagnosticStep(1)} className="flex-1">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button onClick={() => setDiagnosticStep(3)} disabled={!symptoms.trim()} className="flex-1 bg-purple-600 hover:bg-purple-700"> {/* Changed to .trim() */}
                    Next: Lab Values
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
        }

            {diagnosticStep === 3 &&
        <div className="space-y-4">
                <div>
                  <Label htmlFor="labValues">Laboratory Values *</Label>
                  <Textarea
              id="labValues"
              value={labValues}
              onChange={(e) => setLabValues(e.target.value)}
              placeholder="e.g., BUN, Cr, Na, K, Ca, PO4, Albumin, CBC, Urinalysis (protein, RBC, WBC, casts), C3/C4, ANA..." // Updated placeholder
              className="mt-1 h-48" />
            
                  <p className="text-xs text-slate-500 mt-1">Include all available lab results - format doesn't matter</p> {/* Added helper text */}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setDiagnosticStep(2)} className="flex-1">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button onClick={() => setDiagnosticStep(4)} disabled={!labValues.trim()} className="flex-1 bg-purple-600 hover:bg-purple-700"> {/* Changed to .trim() */}
                    Next: Examination
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
        }

            {diagnosticStep === 4 &&
        <div className="space-y-4">
                <div>
                  <Label htmlFor="clinicalFindings">Physical Examination *</Label>
                  <Textarea
              id="clinicalFindings"
              value={clinicalFindings}
              onChange={(e) => setClinicalFindings(e.target.value)}
              placeholder={`e.g., Vitals (HR, BP, RR, Temp, SpO2, Weight)\nGeneral: Well/ill-appearing, hydration, growth\nSkin: Rash, purpura, edema location\nCardiovascular: Heart sounds, murmurs, pulses\nRespiratory: Breath sounds, work of breathing\nAbdomen: Tenderness, masses, organomegaly\nExtremities: Edema, joint swelling\nNeurological: Mental status, focal deficits`} // Updated placeholder with structured example
              className="mt-1 h-56 font-mono text-sm" // Increased height and added font styling
            />
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setDiagnosticStep(3)} className="flex-1">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button onClick={() => setDiagnosticStep(5)} disabled={!clinicalFindings.trim()} className="flex-1 bg-purple-600 hover:bg-purple-700"> {/* Changed to step 5 and .trim() */}
                    Next: Upload Files (Optional) {/* Changed button text */}
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
        }

            {diagnosticStep === 5 && // New diagnostic step for file uploads
        <div className="space-y-4">
                <Alert className="bg-blue-50 border-blue-200">
                  <Upload className="w-4 h-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>Optional:</strong> Upload lab reports, imaging (ultrasound, X-ray), or clinical photos. AI will analyze attached files. {/* Updated description */}
                  </AlertDescription>
                </Alert>

                <div className="border-2 border-dashed border-purple-300 rounded-lg p-8 bg-gradient-to-br from-purple-50 to-pink-50"> {/* Improved styling */}
                  <div className="flex flex-col items-center text-center">
                    <ImageIcon className="w-16 h-16 text-purple-600 mb-4" /> {/* Larger icon */}
                    <h3 className="font-semibold text-purple-900 mb-2 text-lg">Upload Clinical Files</h3> {/* Updated text */}
                    <p className="text-sm text-purple-700 mb-4">
                      Lab reports, ultrasound images, X-rays, clinical photos, previous records
                    </p>
                    <p className="text-xs text-purple-600 mb-4">
                      Supported: PDF, JPG, PNG, DOC, DOCX
                    </p>
                    <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileUpload}
                disabled={isUploadingFiles}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 file:cursor-pointer" // Added file:cursor-pointer
              />
                    {isUploadingFiles && // Show uploading indicator
              <div className="mt-4 flex items-center gap-2 text-purple-700">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Uploading files...</span>
                      </div>
              }
                  </div>
                </div>

                {uploadedFiles.length > 0 &&
          <Card className="bg-purple-50 border-purple-200"> {/* Styled uploaded files section */}
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-sm mb-3 text-purple-900">Uploaded Files ({uploadedFiles.length}):</h4>
                      <div className="flex flex-wrap gap-2">
                        {uploadedFiles.map((file, idx) =>
                <Badge key={idx} className="bg-purple-600 text-white flex items-center gap-1"> {/* Styled badge */}
                            <FileText className="w-3 h-3" />
                            {file.name}
                          </Badge>
                )}
                      </div>
                    </CardContent>
                  </Card>
          }

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setDiagnosticStep(4)} className="flex-1">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
              onClick={generateDifferentialDx}
              disabled={isGeneratingDx} // Disable only if AI is generating
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold" // Styled button
            >
                    {isGeneratingDx ?
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Analyzing with AI...</> // Updated text and icon size
              :
              <><Brain className="w-5 h-5 mr-2" />Generate Diagnosis</> // Updated icon size
              }
                  </Button>
                </div>
              </div>
        }
          </CardContent>
        </Card> :

    <div className="space-y-6">
          {diagnosticResults.red_flags && diagnosticResults.red_flags.length > 0 &&
      <Alert className="bg-red-50 border-red-300 border-2 shadow-lg"> {/* Improved styling */}
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <AlertDescription>
                <div className="text-red-900">
                  <strong className="block mb-2 text-lg">⚠️ RED FLAGS - Immediate Attention Required:</strong> {/* Increased font size */}
                  <ul className="space-y-2 mt-3"> {/* Added margin top */}
                    {diagnosticResults.red_flags.map((flag, idx) =>
              <li key={idx} className="flex items-start gap-2 bg-red-100 p-2 rounded"> {/* Styled list item */}
                        <span className="text-red-600 font-bold text-lg">•</span>
                        <span className="font-medium">{flag}</span>
                      </li>
              )}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
      }

          {diagnosticResults.image_findings && // Render image_findings if available
      <Card className="bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-200 border-2"> {/* New styling */}
              <CardHeader className="bg-cyan-100 border-b border-cyan-200">
                <CardTitle className="flex items-center gap-2 text-lg text-cyan-900">
                  <ImageIcon className="w-5 h-5 text-cyan-600" />
                  AI Analysis of Uploaded Files
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-sm text-cyan-900 leading-relaxed whitespace-pre-line">{diagnosticResults.image_findings}</p> {/* Added whitespace-pre-line */}
              </CardContent>
            </Card>
      }

          {diagnosticResults.editable && !diagnosticResults.isEditing &&
      <div className="flex justify-end">
              <Button
          onClick={() => setDiagnosticResults({ ...diagnosticResults, isEditing: true })}
          variant="outline"
          size="sm">
          
                <Edit className="w-4 h-4 mr-2" />
                Edit AI Output (Admin)
              </Button>
            </div>
      }

          {diagnosticResults.isEditing &&
      <Card className="border-2 border-purple-300">
              <CardHeader className="bg-purple-50">
                <CardTitle className="text-lg">Edit AI Response</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div>
                  <Label>Clinical Reasoning</Label>
                  <Textarea
              value={diagnosticResults.clinical_reasoning}
              onChange={(e) => setDiagnosticResults({ ...diagnosticResults, clinical_reasoning: e.target.value })}
              className="min-h-[100px]" />
            
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setDiagnosticResults({ ...diagnosticResults, isEditing: false })} className="bg-green-600">
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => {
              setDiagnosticResults({ ...diagnosticResults, isEditing: false });
              toast.info('Edit cancelled');
            }}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
      }

          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 border-2"> {/* Improved styling */}
            <CardHeader className="bg-blue-100 border-b border-blue-200">
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-blue-600" />
                Clinical Reasoning Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-sm text-blue-900 leading-relaxed">{diagnosticResults.clinical_reasoning}</p>
            </CardContent>
          </Card>

          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2"> {/* Increased font size */}
              <FileText className="w-6 h-6 text-purple-600" /> {/* Increased icon size */}
              Differential Diagnoses (Ranked by Likelihood)
            </h3>

            <div className="space-y-4">
              {diagnosticResults.differential_diagnoses.map((dx, idx) => {
            const probabilityColors = {
              High: "from-green-500 to-emerald-600", // Darker gradient
              Medium: "from-amber-500 to-orange-600", // Darker gradient
              Low: "from-slate-400 to-slate-600" // Darker gradient
            };

            const probabilityBadges = {
              High: "bg-green-500 text-white", // Solid color badges
              Medium: "bg-amber-500 text-white",
              Low: "bg-slate-500 text-white"
            };

            const canLinkToPathway = clinicalScenarios.some((s) => s.id === dx.related_pathway); // Changed variable name to 's' to avoid conflict

            return (
              <Card key={idx} className="bg-white shadow-lg border-2 hover:border-purple-400 transition-all">
                    <CardHeader className="bg-gradient-to-r from-slate-50 to-purple-50 border-b">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`w-14 h-14 bg-gradient-to-br ${probabilityColors[dx.probability]} rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg flex-shrink-0`}> {/* Larger, more prominent number badge */}
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-xl font-bold text-slate-900 mb-2">{dx.diagnosis}</CardTitle> {/* Increased font size, added margin */}
                            <Badge className={`${probabilityBadges[dx.probability]} text-sm px-3 py-1`}> {/* Styled badge */}
                              {dx.probability} Probability
                            </Badge>
                          </div>
                        </div>
                        {canLinkToPathway &&
                    <Button
                      onClick={() => {
                        setSelectedScenario(dx.related_pathway);
                        setActiveTab("pathways");
                      }}
                      className="bg-purple-600 hover:bg-purple-700 flex-shrink-0" // Styled button
                    >
                            View Pathway
                            <ChevronRight className="w-4 h-4 ml-2" />
                          </Button>
                    }
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                            <Info className="w-5 h-5 text-blue-600" /> {/* Larger icon */}
                            Clinical Reasoning
                          </h4>
                          <p className="text-sm text-slate-700 leading-relaxed bg-blue-50 p-3 rounded">{dx.reasoning}</p> {/* Styled reasoning block */}
                        </div>

                        <div className="grid md:grid-cols-2 gap-4"> {/* Grid layout for features */}
                          <div>
                            <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                              Supporting Features
                            </h4>
                            <ul className="space-y-1">
                              {dx.key_supporting_features.map((feature, fidx) =>
                          <li key={fidx} className="flex items-start gap-2 text-sm bg-green-50 p-2 rounded"> {/* Styled list item */}
                                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                  <span className="text-slate-700">{feature}</span>
                                </li>
                          )}
                            </ul>
                          </div>

                          {dx.key_missing_features && dx.key_missing_features.length > 0 &&
                      <div>
                              <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                                <Circle className="w-4 h-4 text-amber-600" />
                                Missing/Against {/* Updated label */}
                              </h4>
                              <ul className="space-y-1">
                                {dx.key_missing_features.map((feature, fidx) =>
                          <li key={fidx} className="flex items-start gap-2 text-sm bg-amber-50 p-2 rounded"> {/* Styled list item */}
                                    <Circle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <span className="text-slate-700">{feature}</span>
                                </li>
                          )}
                              </ul>
                            </div>
                      }
                        </div>

                        {dx.next_steps && dx.next_steps.length > 0 && // Render next_steps if available
                    <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                            <h4 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                              <ChevronRight className="w-4 h-4" />
                              Recommended Next Steps
                            </h4>
                            <ul className="space-y-1">
                              {dx.next_steps.map((step, sidx) =>
                        <li key={sidx} className="text-sm text-indigo-800 flex items-start gap-2">
                                  <span className="font-bold">{sidx + 1}.</span>
                                  <span>{step}</span>
                                </li>
                        )}
                            </ul>
                          </div>
                    }
                      </div>
                    </CardContent>
                  </Card>);

          })}
            </div>
          </div>

          {diagnosticResults.recommended_workup && diagnosticResults.recommended_workup.length > 0 &&
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-300 border-2"> {/* Improved styling */}
              <CardHeader className="bg-indigo-100 border-b border-indigo-200">
                <CardTitle className="text-lg flex items-center gap-2 text-indigo-900">
                  <Microscope className="w-5 h-5 text-indigo-600" />
                  Recommended Diagnostic Workup
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-3">
                  {diagnosticResults.recommended_workup.map((test, idx) =>
            <div key={idx} className="flex items-start gap-3 bg-white p-4 rounded-lg border-2 border-indigo-200 shadow-sm"> {/* Styled list item */}
                      <div className="w-7 h-7 bg-indigo-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"> {/* Styled number icon */}
                        {idx + 1}
                      </div>
                      <span className="text-sm text-slate-800 font-medium">{test}</span>
                    </div>
            )}
                </div>
              </CardContent>
            </Card>
      }

          <div className="flex gap-3">
            <Button onClick={resetDiagnosticAgent} variant="outline" className="flex-1">
              <ArrowLeft className="w-4 h-4 mr-2" />
              New Case
            </Button>
            <Button
          onClick={() => {
            // Improved copy report functionality
            const report = `DIFFERENTIAL DIAGNOSIS REPORT\n\nPATIENT INFORMATION:\n- Age: ${patientAge} years\n- Gender: ${patientGender}\n- Chief Complaint: ${chiefComplaint}\n\nCLINICAL PRESENTATION:\n${symptoms}\n\nLABORATORY VALUES:\n${labValues}\n\nPHYSICAL EXAMINATION & CLINICAL FINDINGS:\n${clinicalFindings}\n\n${JSON.stringify(diagnosticResults, null, 2)}`;
            navigator.clipboard.writeText(report);
            toast.success("Diagnostic report copied!");
          }}
          variant="outline"
          className="flex-1">
          
              <Copy className="w-4 h-4 mr-2" />
              Copy Report
            </Button>
          </div>

          <Alert className="bg-amber-50 border-amber-300 border-2"> {/* Improved styling */}
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <AlertDescription className="text-amber-800 text-sm">
              <strong>AI Disclaimer:</strong> AI provides evidence-based differential diagnoses for educational purposes. Always exercise independent clinical judgment and consider patient-specific factors. Verify all recommendations with current clinical guidelines. {/* Updated text */}
            </AlertDescription>
          </Alert>
        </div>
    }
    </div>;


  const [scenarioSearch, setScenarioSearch] = useState("");
  const [scenarioFilter, setScenarioFilter] = useState("all"); // "all" | "favorites" | "reviewed"
  const [favScenarioIds, setFavScenarioIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem("pathway_favs") || "[]"); } catch { return []; }
  });
  const [reviewedScenarioIds, setReviewedScenarioIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem("pathway_reviewed") || "[]"); } catch { return []; }
  });
  const [showAddPathwayModal, setShowAddPathwayModal] = useState(false);
  const [editingCustomPathway, setEditingCustomPathway] = useState(null);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [customPathways, setCustomPathways] = useState(() => {
    try { return JSON.parse(localStorage.getItem("custom_nephro_pathways") || "[]"); } catch { return []; }
  });

  const toggleFavScenario = (id) => {
    setFavScenarioIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      try { localStorage.setItem("pathway_favs", JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const toggleReviewedScenario = (id) => {
    setReviewedScenarioIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      try { localStorage.setItem("pathway_reviewed", JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const handleCustomPathwaySave = (p) => {
    setCustomPathways(prev => {
      const exists = prev.find(x => x.id === p.id);
      const next = exists ? prev.map(x => x.id === p.id ? p : x) : [...prev, p];
      try { localStorage.setItem("custom_nephro_pathways", JSON.stringify(next)); } catch {}
      return next;
    });
    setShowAddPathwayModal(false);
    setEditingCustomPathway(null);
    toast.success("Pathway saved!");
  };

  const handleDeleteCustomPathway = (id) => {
    if (!confirm("Delete this custom pathway?")) return;
    setCustomPathways(prev => {
      const next = prev.filter(x => x.id !== id);
      try { localStorage.setItem("custom_nephro_pathways", JSON.stringify(next)); } catch {}
      return next;
    });
    toast.success("Pathway deleted");
  };

  const CATEGORY_ORDER = ["Nephrotic Syndrome", "Acute Kidney Disease", "Glomerular Disease", "Hypertension", "Electrolytes", "Fluids & Electrolytes", "CKD", "Transplant", "RRT & Dialysis", "Tubular Disorders", "CAKUT & Urology", "Infection", "Metabolic & Genetic"];

  const filteredScenarios = clinicalScenarios.filter(s =>
    !scenarioSearch.trim() ||
    s.title.toLowerCase().includes(scenarioSearch.toLowerCase()) ||
    s.category.toLowerCase().includes(scenarioSearch.toLowerCase()) ||
    s.description.toLowerCase().includes(scenarioSearch.toLowerCase())
  );

  const groupedScenarios = CATEGORY_ORDER.reduce((acc, cat) => {
    const items = filteredScenarios.filter(s => s.category === cat);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {});

  const CATEGORY_COLORS = {
    "Metabolic & Genetic": "bg-violet-600",
    "Tubular Disorders": "bg-amber-600",
    "Hypertension": "bg-red-600",
    "Nephrotic Syndrome": "bg-purple-600",
    "Acute Kidney Disease": "bg-red-700",
    "CKD": "bg-blue-600",
    "Glomerular Disease": "bg-pink-600",
    "Electrolytes": "bg-cyan-600",
    "Fluids & Electrolytes": "bg-sky-600",
    "Transplant": "bg-green-600",
    "Infection": "bg-orange-600",
    "Peritoneal Dialysis": "bg-indigo-600",
    "Hemodialysis": "bg-indigo-700",
    "Developmental Kidney": "bg-teal-600",
    "Urinary Tract": "bg-teal-700",
    "Lower Urinary Tract": "bg-emerald-600",
  };

  const renderScenarioList = () => {
    let allFilteredScenarios = filteredScenarios;
    if (scenarioFilter === "favorites") allFilteredScenarios = filteredScenarios.filter(s => favScenarioIds.includes(s.id));
    if (scenarioFilter === "reviewed") allFilteredScenarios = filteredScenarios.filter(s => reviewedScenarioIds.includes(s.id));

    const groupedFiltered = CATEGORY_ORDER.reduce((acc, cat) => {
      const items = allFilteredScenarios.filter(s => s.category === cat);
      if (items.length > 0) acc[cat] = items;
      return acc;
    }, {});

    return (
    <div className="space-y-5">
      {/* Quick Access Dashboard */}
      {scenarioFilter === "all" && (favScenarioIds.length > 0 || reviewedScenarioIds.length > 0) && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-3">
          {favScenarioIds.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-3.5 h-3.5 text-amber-500" fill="currentColor" />
                <span className="text-xs font-bold text-amber-700">My Saved Pathways</span>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {clinicalScenarios.filter(s => favScenarioIds.includes(s.id)).map(s => (
                  <button key={s.id} onClick={() => { setSelectedScenario(s.id); setActiveTab("pathways"); }}
                    className="px-2.5 py-1 text-xs font-semibold bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 text-amber-800">
                    ★ {s.title.slice(0, 30)}…
                  </button>
                ))}
              </div>
            </div>
          )}
          {reviewedScenarioIds.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                <span className="text-xs font-bold text-green-700">Recently Reviewed</span>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {clinicalScenarios.filter(s => reviewedScenarioIds.includes(s.id)).map(s => (
                  <button key={s.id} onClick={() => { setSelectedScenario(s.id); setActiveTab("pathways"); }}
                    className="px-2.5 py-1 text-xs font-semibold bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 text-green-800">
                    ✓ {s.title.slice(0, 30)}…
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Custom Pathways */}
      {customPathways.length > 0 && scenarioFilter === "all" && (
        <div>
          <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Plus className="w-3.5 h-3.5" /> My Custom Pathways ({customPathways.length})
          </h3>
          <div className="space-y-2">
            {customPathways.map(p => (
              <PathwayCard key={p.id} pathway={p}
                isFav={favScenarioIds.includes(p.id)}
                isReviewed={reviewedScenarioIds.includes(p.id)}
                onToggleFav={toggleFavScenario}
                onToggleReviewed={toggleReviewedScenario}
                onEdit={setEditingCustomPathway}
                onDelete={handleDeleteCustomPathway}
              />
            ))}
          </div>
        </div>
      )}

      {Object.keys(groupedFiltered).length === 0 && (
        <p className="text-center text-slate-400 py-8">No scenarios match your filter</p>
      )}
      {Object.entries(groupedFiltered).map(([group, scenarios]) => (
        <div key={group}>
          <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
            <Badge className={CATEGORY_COLORS[group] || "bg-slate-600"}>
              {group}
            </Badge>
            <span className="text-slate-500 text-xs">({scenarios.length})</span>
          </h3>
          <div className="space-y-2">
            {scenarios.map((scenario) => {
              const ScenarioIcon = scenario.icon;
              const isFav = favScenarioIds.includes(scenario.id);
              const isReviewed = reviewedScenarioIds.includes(scenario.id);
              const priorityColors = {
                danger: "bg-red-50 border-red-200 hover:border-red-400",
                warning: "bg-amber-50 border-amber-200 hover:border-amber-400",
                secondary: "bg-blue-50 border-blue-200 hover:border-blue-400"
              };
              return (
                <Card key={scenario.id} className={`${priorityColors[scenario.priority]} border-2 transition-all`}>
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow flex-shrink-0 cursor-pointer
                        ${scenario.priority === "danger" ? "bg-red-200" : scenario.priority === "warning" ? "bg-amber-200" : "bg-blue-200"}`}
                        onClick={() => { setSelectedScenario(scenario.id); setActiveTab("pathways"); }}>
                        <ScenarioIcon className={`w-5 h-5 ${scenario.priority === "danger" ? "text-red-700" : scenario.priority === "warning" ? "text-amber-700" : "text-blue-700"}`} />
                      </div>
                      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => { setSelectedScenario(scenario.id); setActiveTab("pathways"); }}>
                        <h3 className="font-bold text-slate-900 text-sm leading-snug">{scenario.title}</h3>
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed line-clamp-2">{scenario.description}</p>
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          <Badge variant="outline" className="text-xs">{scenario.category}</Badge>
                          {scenario.hasFullPathway && <Badge className="bg-green-100 text-green-700 text-xs border border-green-300">Full Pathway</Badge>}
                          {isFav && <Badge className="bg-amber-100 text-amber-700 text-xs border border-amber-300">★ Saved</Badge>}
                          {isReviewed && <Badge className="bg-green-100 text-green-700 text-xs border border-green-300">✓ Reviewed</Badge>}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 flex-shrink-0">
                        <button onClick={() => toggleFavScenario(scenario.id)} title={isFav ? "Unsave" : "Save"}
                          className={`p-1.5 rounded-lg border text-xs transition-all ${isFav ? "bg-amber-100 border-amber-300 text-amber-600" : "bg-white border-slate-200 text-slate-300 hover:text-amber-400"}`}>
                          <Star className="w-3.5 h-3.5" fill={isFav ? "currentColor" : "none"} />
                        </button>
                        <button onClick={() => toggleReviewedScenario(scenario.id)} title={isReviewed ? "Mark unreviewed" : "Mark reviewed"}
                          className={`p-1.5 rounded-lg border text-xs transition-all ${isReviewed ? "bg-green-100 border-green-300 text-green-600" : "bg-white border-slate-200 text-slate-300 hover:text-green-400"}`}>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => { setSelectedScenario(scenario.id); setActiveTab("pathways"); }}
                          className="p-1.5 rounded-lg border bg-white border-slate-200 text-slate-400 hover:text-blue-500 transition-all">
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};


  const renderNephroticSyndromePathway = () =>
  <EnhancedNephroticPathway onAIPrompt={handleAIPromptFromPathway} />;


  const renderIgANephropathyPathway = () =>
  <div className="space-y-6">
      <Alert className="bg-purple-50 border-purple-200">
        <Microscope className="w-5 h-5 text-purple-600" />
        <AlertDescription className="text-purple-800">
          <strong>IgA Nephropathy:</strong> Management based on Oxford MEST-C histopathological classification.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader className="bg-purple-50 border-b">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TableIcon className="w-5 h-5 text-purple-600" />
            Oxford MEST-C Histopathology Scoring
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[
          { key: 'M', title: 'Mesangial Hypercellularity', options: ['M0: Less than 50%', 'M1: 50% or more'] },
          { key: 'E', title: 'Endocapillary Hypercellularity', options: ['E0: Absent', 'E1: Present'] },
          { key: 'S', title: 'Segmental Glomerulosclerosis', options: ['S0: Absent', 'S1: Present'] },
          { key: 'T', title: 'Tubular Atrophy/Fibrosis', options: ['T0: 0-25%', 'T1: 26-50%', 'T2: Over 50%'] },
          { key: 'C', title: 'Crescents', options: ['C0: Absent', 'C1: Less than 25%', 'C2: 25% or more'] }].
          map((item) =>
          <Card key={item.key} className="bg-slate-50 border-2 border-slate-300">
                <CardContent className="p-4">
                  <h4 className="font-bold text-slate-900 mb-3">{item.key}: {item.title}</h4>
                  <div className="space-y-2">
                    {item.options.map((option, idx) =>
                <div key={idx} className="flex items-center gap-3">
                        <Checkbox
                    id={`${item.key}-${idx}`}
                    checked={mestC[item.key] === idx}
                    onCheckedChange={() => setMestC({ ...mestC, [item.key]: idx })} />
                  
                        <Label htmlFor={`${item.key}-${idx}`} className="text-sm cursor-pointer">
                          {option}
                        </Label>
                      </div>
                )}
                  </div>
                </CardContent>
              </Card>
          )}
          </div>

          {Object.values(mestC).every((v) => v !== null) &&
        <Card className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300">
              <CardHeader className="bg-purple-100 border-b">
                <CardTitle className="text-lg">MEST-C Score & Treatment</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-purple-900">
                    M{mestC.M} E{mestC.E} S{mestC.S} T{mestC.T} C{mestC.C}
                  </div>
                </div>

                <Card className={`${
            mestC.E === 1 || mestC.S === 1 || mestC.T >= 1 || mestC.C >= 1 ?
            "bg-red-50 border-red-300" :
            "bg-green-50 border-green-300"} border-2 mb-4`
            }>
                  <CardContent className="p-4">
                    <h4 className="font-bold mb-2">
                      {mestC.E === 1 || mestC.S === 1 || mestC.T >= 1 || mestC.C >= 1 ?
                  "High-Risk Features Present" :
                  "Low-Risk Profile"}
                    </h4>
                    <ul className="text-sm space-y-1">
                      {mestC.E === 1 && <li>• Endocapillary proliferation: Consider immunosuppression</li>}
                      {mestC.T >= 1 && <li>• Significant fibrosis: Poor prognosis indicator</li>}
                      {mestC.C >= 1 && <li>• Crescents present: Urgent treatment needed</li>}
                      {!(mestC.E === 1 || mestC.S === 1 || mestC.T >= 1 || mestC.C >= 1) &&
                  <li>• Conservative management with ACE-I/ARB recommended</li>}
                    </ul>
                  </CardContent>
                </Card>

                <div className="space-y-3">
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <h5 className="font-bold text-blue-900 mb-2">Baseline Management</h5>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• ACE-I/ARB for all patients</li>
                        <li>• Target BP below 50th percentile</li>
                        <li>• Reduce proteinuria to under 0.5 g/day</li>
                      </ul>
                    </CardContent>
                  </Card>

                  {(mestC.E === 1 || mestC.C >= 1 || mestC.T >= 1) &&
              <Card className="bg-purple-50 border-purple-200">
                      <CardContent className="p-4">
                        <h5 className="font-bold text-purple-900 mb-2">Immunosuppressive Therapy</h5>
                        <p className="text-sm text-purple-800 mb-2">
                          For persistent proteinuria over 1 g/day despite ACE-I/ARB
                        </p>
                        <div className="space-y-2">
                          <div className="bg-white p-3 rounded border">
                            <strong className="text-sm">Corticosteroids:</strong>
                            <p className="text-xs mt-1">Methylprednisolone pulse + oral prednisone</p>
                          </div>
                          {mestC.C >= 1 &&
                    <div className="bg-red-100 p-3 rounded border border-red-300">
                              <strong className="text-sm">Crescentic IgAN - Urgent:</strong>
                              <p className="text-xs mt-1">High-dose steroids + cyclophosphamide</p>
                            </div>
                    }
                        </div>
                      </CardContent>
                    </Card>
              }
                </div>
              </CardContent>
            </Card>
        }
        </CardContent>
      </Card>
    </div>;


  const renderSelectedPathway = () => {
    if (!selectedScenario) {
      return (
        <div className="text-center py-16">
          <GitBranch className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-700 mb-2">Select a Clinical Scenario</h3>
          <p className="text-slate-500">Choose a scenario to view detailed evidence-based management pathways</p>
        </div>);

    }

    const scenario = clinicalScenarios.find((s) => s.id === selectedScenario);

    // If scenario not found in the list, show the PathwayRenderer with a fallback scenario object
    const effectiveScenario = scenario || {
      id: selectedScenario,
      title: selectedScenario.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      description: "Clinical pathway",
      category: "Clinical",
      priority: "secondary",
      icon: Stethoscope,
      hasFullPathway: true,
    };

    return (
      <div>
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg ${
              effectiveScenario.priority === "danger" ? "bg-red-200" :
              effectiveScenario.priority === "warning" ? "bg-amber-200" :
              "bg-blue-200"}`
              }>
                <effectiveScenario.icon className={`w-8 h-8 ${
                effectiveScenario.priority === "danger" ? "text-red-700" :
                effectiveScenario.priority === "warning" ? "text-amber-700" :
                "text-blue-700"}`
                } />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">{effectiveScenario.title}</h2>
                <p className="text-slate-600">{effectiveScenario.description}</p>
                <Badge variant="outline" className="mt-2">{effectiveScenario.category}</Badge>
              </div>
            </div>
            <Button variant="outline" onClick={() => {
              setSelectedScenario(null);
              setActiveTab(scenarioSource === "engines" ? "engines" : "scenarios");
              setScenarioSource("scenarios");
            }}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {scenarioSource === "engines" ? "← Engines" : "Change"}
            </Button>
          </div>
        </div>

        {selectedScenario === "nephrotic-syndrome" && renderNephroticSyndromePathway()}
        {selectedScenario === "iga-nephropathy" && renderIgANephropathyPathway()}
        {selectedScenario !== "nephrotic-syndrome" && selectedScenario !== "iga-nephropathy" && (
          <PathwayRenderer
            scenarioId={selectedScenario}
            scenario={effectiveScenario}
            onAIPrompt={handleAIPromptFromPathway}
            isAdmin={user?.role === 'admin'}
          />
        )}
      </div>);

  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-3 md:p-6">
      <div className="max-w-7xl mx-auto">
        {selectedScenario ? (
          <Button variant="outline" size="sm" className="mb-4"
            onClick={() => { setSelectedScenario(null); setActiveTab(scenarioSource === "engines" ? "engines" : "scenarios"); setScenarioSource("scenarios"); }}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {scenarioSource === "engines" ? "Back to Engines" : "Back to Pathways"}
          </Button>
        ) : (
          <Link to={createPageUrl("Hub")}>
            <Button variant="outline" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        )}

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <Brain className="w-10 h-10 text-purple-600" />
            Pediatrics Pathways — Pediatric Nephrology and Others
          </h1>
          <p className="text-slate-600">Consolidated evidence-based pathways — {clinicalScenarios.length} canonical scenarios (duplicates removed, all topics covered by master hubs)</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            <TabsList className="bg-green-100 text-muted-foreground p-1 rounded-xl items-center justify-start inline-flex h-auto gap-1 min-w-max">
              <TabsTrigger value="scenarios" className="px-2 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow flex items-center gap-1">
                <Clipboard className="w-3 h-3" /><span>Scenarios</span>
              </TabsTrigger>
              <TabsTrigger value="engines" className="px-2 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow flex items-center gap-1 text-violet-700">
                <Cpu className="w-3 h-3" /><span>🧠 Engines</span>
              </TabsTrigger>
              <TabsTrigger value="glomerular" className="px-2 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow flex items-center gap-1">
                <Microscope className="w-3 h-3" /><span>GN Pathways</span>
              </TabsTrigger>
              <TabsTrigger value="tubular" className="px-2 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow flex items-center gap-1 text-cyan-700">
                <Beaker className="w-3 h-3" /><span>Tubular & RTA</span>
              </TabsTrigger>
              <TabsTrigger value="rare-disease" className="px-2 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow flex items-center gap-1 text-rose-700">
                <Search className="w-3 h-3" /><span>Rare Disease</span>
              </TabsTrigger>
              <TabsTrigger value="ai-agents" className="px-2 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow flex items-center gap-1">
                <Brain className="w-3 h-3" /><span>Clinical AI</span>
              </TabsTrigger>
              <TabsTrigger value="pathways" className="px-2 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow flex items-center gap-1">
                <GitBranch className="w-3 h-3" /><span>Pathways</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="glomerular">
            <GlomerularDiseasesPathway />
          </TabsContent>

          <TabsContent value="tubular">
            <TubularDisordersSection />
          </TabsContent>

          <TabsContent value="rare-disease">
            <RareDiseaseScreeningSection />
          </TabsContent>

          <TabsContent value="ai-agents">
            <div className="space-y-6">
              <Alert className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
                <Brain className="w-5 h-5 text-purple-600" />
                <AlertDescription className="text-purple-800">
                  <strong>Clinical AI — Diagnostic Agent + Clinical Analysers:</strong> AI differential diagnosis, biopsy, radiology, lab, and case analysis tools
                </AlertDescription>
              </Alert>

              {renderDiagnosticAgent()}

              <Tabs defaultValue="biopsy" className="w-full">
                <TabsList className="grid w-full grid-cols-4 h-auto">
                  <TabsTrigger value="biopsy" className="flex flex-col items-center gap-2 py-3">
                    <Microscope className="w-5 h-5" />
                    <span className="text-xs">Renal Biopsy</span>
                  </TabsTrigger>
                  <TabsTrigger value="radiology" className="flex flex-col items-center gap-2 py-3">
                    <Activity className="w-5 h-5" />
                    <span className="text-xs">Radiology</span>
                  </TabsTrigger>
                  <TabsTrigger value="labs" className="flex flex-col items-center gap-2 py-3">
                    <TestTube className="w-5 h-5" />
                    <span className="text-xs">Lab Reports</span>
                  </TabsTrigger>
                  <TabsTrigger value="case" className="flex flex-col items-center gap-2 py-3">
                    <Stethoscope className="w-5 h-5" />
                    <span className="text-xs">Case Analysis</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="biopsy" className="mt-6">
                  <BiopsyAnalyzerContent />
                </TabsContent>

                <TabsContent value="radiology" className="mt-6">
                  <RadiologyAnalyzerContent />
                </TabsContent>

                <TabsContent value="labs" className="mt-6">
                  <LabReportAnalyzerContent />
                </TabsContent>

                <TabsContent value="case" className="mt-6">
                  <ClinicalCaseAnalyzerContent />
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>

          <TabsContent value="scenarios">
            <Card className="bg-white shadow-lg">
              <CardHeader className="bg-slate-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="w-6 h-6 text-blue-600" />
                  Clinical Scenarios Library — {clinicalScenarios.length} Consolidated Pathways
                </CardTitle>
                <p className="text-sm text-slate-600 mt-1">Grouped by category · Select a scenario to view evidence-based pathways</p>
                <div className="relative mt-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    value={scenarioSearch}
                    onChange={e => setScenarioSearch(e.target.value)}
                    placeholder="Search scenarios, categories, keywords…"
                    className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {renderScenarioList()}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pathways">
            {renderSelectedPathway()}
          </TabsContent>

          <TabsContent value="engines">
            <IntelligenceEnginesTab
              onSelectEngine={(scenario) => { setSelectedScenario(scenario); setScenarioSource("engines"); setActiveTab("pathways"); }}
              onBack={() => setActiveTab("scenarios")}
            />
          </TabsContent>
        </Tabs>

        <Alert className="mt-6 bg-purple-50 border-purple-200">
          <Info className="w-5 h-5 text-purple-600" />
          <AlertDescription className="text-purple-800">
            <strong>Evidence-Based Practice:</strong> Integrates KDIGO, IPNA, ISPD, IAP, ISKDC guidelines. All pathways regularly reviewed. Always adapt to individual patient circumstances.
          </AlertDescription>
        </Alert>
      </div>
    </div>);

}