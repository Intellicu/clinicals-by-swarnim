import React, { useState } from "react";
import { Link } from "react-router-dom";
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
import AKIPathway from "../components/pathways/AKIPathway"; // New import
import HypertensiveEmergencyPathway from "../components/pathways/HypertensiveEmergencyPathway"; // New import
import HyperkalemiaPathway from "../components/pathways/HyperkalemiaPathway"; // New import
import UTIPathway from "../components/pathways/UTIPathway"; // New import
import HUSPathway from "../components/pathways/HUSPathway"; // New import
import TumorLysisPathway from "../components/pathways/TumorLysisPathway"; // New import
import LupusNephritisPathway from "../components/pathways/LupusNephritisPathway";
import PSGNPathway from "../components/pathways/PSGNPathway";
import HyponatremiaPathway from "../components/pathways/HyponatremiaPathway";
import HypercalcemiaPathway from "../components/pathways/HypercalcemiaPathway";
import TransplantRejectionPathway from "../components/pathways/TransplantRejectionPathway";
import DialysisCatheterInfectionPathway from "../components/pathways/DialysisCatheterInfectionPathway";
import CKDMBDPathway from "../components/pathways/CKDMBDPathway";
import RenalStonePathway from "../components/pathways/RenalStonePathway";
import BladderDysfunctionPathway from "../components/pathways/BladderDysfunctionPathway";
import RTAPathway from "../components/pathways/RTAPathway";
import TubularFunctionPathway from "../components/pathways/TubularFunctionPathway";
import HypokalemiaPathway from "../components/pathways/HypokalemiaPathway";
import SevereEdemaPathway from "../components/pathways/SevereEdemaPathway";
import SBPPathway from "../components/pathways/SBPPathway";
import MetabolicAcidosisPathway from "../components/pathways/MetabolicAcidosisPathway";
import SteroidResistantNSPathway from "../components/pathways/SteroidResistantNSPathway";
import ChronicKidneyDiseasePathway from "../components/pathways/ChronicKidneyDiseasePathway";
import HypocalcemiaPathway from "../components/pathways/HypocalcemiaPathway";
import ContrastNephropathyPathway from "../components/pathways/ContrastNephropathyPathway";
import FluidElectrolytePathway from "../components/pathways/FluidElectrolytePathway";
import AcidBasePathway from "../components/pathways/AcidBasePathway";
import HypertensionDiagnosisPathway from "../components/pathways/HypertensionDiagnosisPathway";
import HypertensionTreatmentPathway from "../components/pathways/HypertensionTreatmentPathway";
import VURPathway from "../components/pathways/VURPathway";
import HydronephrosisPathway from "../components/pathways/HydronephrosisPathway";
import NephroticSyndromeChildhoodPathway from "../components/pathways/NephroticSyndromeChildhoodPathway";
import CongenitalNephroticPathway from "../components/pathways/CongenitalNephroticPathway";
import IgAVasculitisPathway from "../components/pathways/IgAVasculitisPathway";
import ANCAbVasculitisPathway from "../components/pathways/ANCAbVasculitisPathway";
import MembranousNephropathyPathway from "../components/pathways/MembranousNephropathyPathway";
import PeritonealDialysisPathway from "../components/pathways/PeritonealDialysisPathway";
import HemodialysisPathway from "../components/pathways/HemodialysisPathway";
import CKDStagingPathway from "../components/pathways/CKDStagingPathway";
import CKDAnemiaMBDPathway from "../components/pathways/CKDAnemiaMBDPathway";
import KidneyTransplantPathway from "../components/pathways/KidneyTransplantPathway";
import HematuriaPathway from "../components/pathways/HematuriaPathway";
import ProteinuriaPathway from "../components/pathways/ProteinuriaPathway";
import CysticKidneyPathway from "../components/pathways/CysticKidneyPathway";
import { useQuery } from '@tanstack/react-query';
import BiopsyAnalyzer from '../components/clinical-ai/BiopsyAnalyzer';
import RadiologyAnalyzer from '../components/clinical-ai/RadiologyAnalyzer';
import LabReportAnalyzer from '../components/clinical-ai/LabReportAnalyzer';
import ClinicalCaseAnalyzer from '../components/clinical-ai/ClinicalCaseAnalyzer';
import GlomerularDiseasesPathway from '../components/pathways/GlomerularDiseasesPathway';


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


const clinicalScenarios = [
{
  id: "nephrotic-syndrome",
  title: "Nephrotic Syndrome - Initial Presentation",
  category: "Nephrotic Syndrome",
  priority: "secondary",
  description: "New onset edema, proteinuria, hypoalbuminemia",
  icon: Droplet,
  hasFullPathway: true
},
{
  id: "aki-prifle",
  title: "Acute Kidney Injury (pRIFLE/KDIGO)",
  category: "Acute Kidney Disease",
  priority: "danger",
  description: "Acute rise in creatinine or decreased urine output",
  icon: AlertTriangle,
  hasFullPathway: true
},
{
  id: "iga-nephropathy",
  title: "IgA Nephropathy (Oxford MEST-C)",
  category: "Glomerular Disease",
  priority: "secondary",
  description: "Management based on Oxford classification",
  icon: Microscope,
  hasFullPathway: true
},
{
  id: "hspn",
  title: "HSP Nephritis (HSPN)",
  category: "Glomerular Disease",
  priority: "secondary",
  description: "Renal involvement in Henoch-Schönlein Purpura (ISKDC 2023)",
  icon: Heart,
  hasFullPathway: true
},
{
  id: "htn-emergency",
  title: "Hypertensive Emergency",
  category: "Hypertension",
  priority: "danger",
  description: "Severe HTN with end-organ damage",
  icon: Heart,
  hasFullPathway: true
},
{
  id: "hyperkalemia",
  title: "Severe Hyperkalemia (K+ >6.0)",
  category: "Electrolytes",
  priority: "danger",
  description: "Life-threatening hyperkalemia - immediate treatment",
  icon: Zap,
  hasFullPathway: true
},
{
  id: "uti-febrile",
  title: "Febrile UTI - Evaluation & Imaging",
  category: "Infection",
  priority: "warning",
  description: "Post-febrile UTI workup, DMSA timing, VUR evaluation",
  icon: Thermometer,
  hasFullPathway: true
},
{
  id: "ckd-progression",
  title: "CKD Progression Risk Stratification",
  category: "CKD",
  priority: "warning",
  description: "Risk assessment and intervention planning",
  icon: TrendingUp,
  hasFullPathway: true
},
{
  id: "hemolytic-uremic",
  title: "Hemolytic Uremic Syndrome (HUS)",
  category: "Acute Kidney Disease",
  priority: "danger",
  description: "Microangiopathic hemolytic anemia, thrombocytopenia, AKI",
  icon: Activity,
  hasFullPathway: true
},
{
  id: "hyponatremia",
  title: "Hyponatremia (<130 mmol/L)",
  category: "Electrolytes",
  priority: "danger",
  description: "Symptomatic hyponatremia - correction protocol",
  icon: Droplet,
  hasFullPathway: true
},
{
  id: "rta-workup",
  title: "Renal Tubular Acidosis (RTA) Diagnosis",
  category: "Tubular Disorders",
  priority: "secondary",
  description: "Diagnostic approach to classify RTA type I, II, IV",
  icon: Beaker,
  hasFullPathway: true
},
{
  id: "ckd-mbd",
  title: "CKD-Mineral Bone Disease Management",
  category: "CKD",
  priority: "secondary",
  description: "Secondary hyperparathyroidism prevention and treatment",
  icon: Activity,
  hasFullPathway: true
},
{
  id: "transplant-rejection",
  title: "Acute Transplant Rejection",
  category: "Transplant",
  priority: "danger",
  description: "Rising creatinine post-transplant - evaluation and treatment",
  icon: AlertTriangle,
  hasFullPathway: true
},
{
  id: "lupus-nephritis",
  title: "Lupus Nephritis (Pediatric)",
  category: "Glomerular Disease",
  priority: "warning",
  description: "Classification and treatment per ISN/RPS class",
  icon: Microscope,
  hasFullPathway: true
},
{
  id: "aki-dialysis-timing",
  title: "AKI - When to Initiate Dialysis",
  category: "Acute Kidney Disease",
  priority: "danger",
  description: "Indications for urgent RRT in pediatric AKI",
  icon: Droplet,
  hasFullPathway: true
},
{
  id: "hypercalcemia",
  title: "Severe Hypercalcemia (>12 mg/dL)",
  category: "Electrolytes",
  priority: "danger",
  description: "Hypercalcemia crisis - evaluation and management",
  icon: Zap,
  hasFullPathway: true
},
{
  id: "tumor-lysis",
  title: "Tumor Lysis Syndrome",
  category: "Acute Kidney Disease",
  priority: "danger",
  description: "Prevention and management in high tumor burden",
  icon: Flame,
  hasFullPathway: true
},
{
  id: "post-strep-gn",
  title: "Post-Streptococcal Glomerulonephritis",
  category: "Glomerular Disease",
  priority: "secondary",
  description: "PSGN diagnosis and supportive management",
  icon: Microscope,
  hasFullPathway: true
},
{
  id: "aki-cardiac-surgery",
  title: "Post-Cardiac Surgery AKI",
  category: "Acute Kidney Disease",
  priority: "warning",
  description: "AKI after cardiopulmonary bypass - fluid management",
  icon: Heart,
  hasFullPathway: true
},
{
  id: "hypophosphatemia",
  title: "Severe Hypophosphatemia (<1.5 mg/dL)",
  category: "Electrolytes",
  priority: "warning",
  description: "Refeeding syndrome, dialysis-associated",
  icon: Wind,
  hasFullPathway: true
},
{
  id: "thrombotic-microangiopathy",
  title: "Thrombotic Microangiopathy (TMA)",
  category: "Glomerular Disease",
  priority: "danger",
  description: "TTP, HUS, aHUS - differential diagnosis and treatment",
  icon: Activity,
  hasFullPathway: true
},
{
  id: "dialysis-catheter-infection",
  title: "Dialysis Catheter-Related Bacteremia",
  category: "Infection",
  priority: "danger",
  description: "Central line infection - antibiotics and catheter management",
  icon: Thermometer,
  hasFullPathway: true
},
{
  id: "renal-stone",
  title: "Renal Stone Analysis & Prevention",
  category: "Tubular Disorders",
  priority: "secondary",
  description: "Metabolic stone workup and prevention strategies",
  icon: Beaker,
  hasFullPathway: true
},
{
  id: "bladder-dysfunction",
  title: "Bladder Dysfunction Evaluation",
  category: "Lower Urinary Tract",
  priority: "secondary",
  description: "Voiding diary interpretation and management per ICCS guidelines",
  icon: ClipboardList,
  hasFullPathway: true
},
{
  id: "rta-diagnosis",
  title: "Renal Tubular Acidosis Diagnosis",
  category: "Tubular Disorders",
  priority: "secondary",
  description: "Classify RTA type 1, 2, or 4 with treatment protocols",
  icon: Beaker,
  hasFullPathway: true
},
{
  id: "tubular-function",
  title: "Tubular Function Assessment",
  category: "Tubular Disorders",
  priority: "secondary",
  description: "FENa, TRP, TmP/GFR, FECa - complete tubular workup",
  icon: TestTube,
  hasFullPathway: true
},
{
  id: "hypokalemia",
  title: "Severe Hypokalemia (K+ <3.0)",
  category: "Electrolytes",
  priority: "danger",
  description: "Cardiac arrhythmia risk - urgent K+ replacement",
  icon: Zap,
  hasFullPathway: true
},
{
  id: "severe-edema-ns",
  title: "Severe Edema in Nephrotic Syndrome",
  category: "Nephrotic Syndrome",
  priority: "danger",
  description: "Diuretic resistance, albumin + diuretic therapy",
  icon: Droplet,
  hasFullPathway: true
},
{
  id: "sbp",
  title: "Spontaneous Bacterial Peritonitis (SBP)",
  category: "Infection",
  priority: "danger",
  description: "Infected ascites in nephrotic syndrome - empiric antibiotics",
  icon: AlertTriangle,
  hasFullPathway: true
},
{
  id: "metabolic-acidosis",
  title: "Severe Metabolic Acidosis",
  category: "Electrolytes",
  priority: "danger",
  description: "pH <7.2 or HCO3 <10 - urgent intervention",
  icon: Wind,
  hasFullPathway: true
},
{
  id: "contrast-nephropathy",
  title: "Contrast-Induced AKI Prevention",
  category: "Acute Kidney Disease",
  priority: "warning",
  description: "Risk stratification and hydration protocol before contrast studies",
  icon: Stethoscope,
  hasFullPathway: true
},
{
  id: "fluid-electrolyte",
  title: "Fluid & Electrolyte Therapy",
  category: "Fluids & Electrolytes",
  priority: "secondary",
  description: "Holliday-Segar maintenance, deficit replacement, electrolyte principles",
  icon: Droplet,
  hasFullPathway: true
},
{
  id: "acid-base",
  title: "Acid-Base Disorder Evaluation",
  category: "Fluids & Electrolytes",
  priority: "warning",
  description: "5-step ABG interpretation, anion gap, MUDPILES, RTA",
  icon: Wind,
  hasFullPathway: true
},
{
  id: "htn-diagnosis",
  title: "Approach to Hypertension Diagnosis",
  category: "Hypertension",
  priority: "secondary",
  description: "AAP 2017 classification, evaluation, ABPM, end-organ assessment",
  icon: Heart,
  hasFullPathway: true
},
{
  id: "htn-treatment",
  title: "Treatment of Hypertension",
  category: "Hypertension",
  priority: "secondary",
  description: "Lifestyle, antihypertensives, drug table with pediatric doses",
  icon: Heart,
  hasFullPathway: true
},
{
  id: "vur",
  title: "Vesicoureteral Reflux (VUR)",
  category: "Urinary Tract",
  priority: "secondary",
  description: "Grading, antibiotic prophylaxis, STING, surgical reimplantation",
  icon: Activity,
  hasFullPathway: true
},
{
  id: "hydronephrosis",
  title: "Antenatally Diagnosed Hydronephrosis",
  category: "Developmental Kidney",
  priority: "secondary",
  description: "SFU grading, postnatal management, pyeloplasty indications",
  icon: Baby,
  hasFullPathway: true
},
{
  id: "childhood-nephrotic",
  title: "Childhood Nephrotic Syndrome (ISKDC/IPNA)",
  category: "Nephrotic Syndrome",
  priority: "secondary",
  description: "Prednisolone protocol, SSNS/FRNS/SDNS, steroid-sparing agents",
  icon: Droplet,
  hasFullPathway: true
},
{
  id: "congenital-nephrotic",
  title: "Congenital Nephrotic Syndrome",
  category: "Nephrotic Syndrome",
  priority: "warning",
  description: "Finnish type, NPHS1/2 mutations, conservative vs transplant",
  icon: Baby,
  hasFullPathway: true
},
{
  id: "iga-vasculitis",
  title: "IgA Vasculitis Nephritis (HSPN)",
  category: "Glomerular Disease",
  priority: "warning",
  description: "ISKDC classification, treatment by severity, follow-up",
  icon: Microscope,
  hasFullPathway: true
},
{
  id: "anca-vasculitis",
  title: "ANCA-Associated Vasculitis GN",
  category: "Glomerular Disease",
  priority: "danger",
  description: "GPA/MPA, pauci-immune crescentic GN, cyclophosphamide/rituximab",
  icon: Microscope,
  hasFullPathway: true
},
{
  id: "membranous-nephropathy",
  title: "Membranous Nephropathy",
  category: "Glomerular Disease",
  priority: "secondary",
  description: "Anti-PLA2R, conservative phase, rituximab vs Ponticelli",
  icon: Microscope,
  hasFullPathway: true
},
{
  id: "peritoneal-dialysis",
  title: "Peritoneal Dialysis Management",
  category: "Peritoneal Dialysis",
  priority: "secondary",
  description: "PD prescription, adequacy, peritonitis, exit site infections",
  icon: Activity,
  hasFullPathway: true
},
{
  id: "hemodialysis",
  title: "Hemodialysis — Orders & Complications",
  category: "Hemodialysis",
  priority: "secondary",
  description: "HD prescription, Kt/V, vascular access, acute complications",
  icon: Activity,
  hasFullPathway: true
},
{
  id: "ckd-staging",
  title: "CKD Staging & Management",
  category: "CKD",
  priority: "secondary",
  description: "Schwartz eGFR, KDIGO stages, renoprotective strategy",
  icon: TrendingUp,
  hasFullPathway: true
},
{
  id: "ckd-anemia-mbd",
  title: "CKD Anemia & Mineral Bone Disease",
  category: "CKD",
  priority: "secondary",
  description: "ESA, IV iron, CKD-MBD targets, phosphate binders, calciphylaxis",
  icon: Activity,
  hasFullPathway: true
},
{
  id: "kidney-transplant",
  title: "Pediatric Kidney Transplantation",
  category: "Transplant",
  priority: "secondary",
  description: "Pre-transplant workup, immunosuppression, rejection, BK virus, FSGS recurrence",
  icon: CheckCircle2,
  hasFullPathway: true
},
{
  id: "hematuria-approach",
  title: "Approach to Hematuria in Children",
  category: "Glomerular Disease",
  priority: "secondary",
  description: "Glomerular vs non-glomerular, workup algorithm, Alport/TBMN",
  icon: Droplet,
  hasFullPathway: true
},
{
  id: "proteinuria-approach",
  title: "Approach to Proteinuria in Children",
  category: "Glomerular Disease",
  priority: "secondary",
  description: "PCR calculator, transient vs persistent, orthostatic, workup",
  icon: Beaker,
  hasFullPathway: true
},
{
  id: "cystic-kidney",
  title: "Cystic Kidney Diseases in Children",
  category: "Developmental Kidney",
  priority: "secondary",
  description: "ADPKD, ARPKD, NPHP, Bardet-Biedl — comparison and management",
  icon: Info,
  hasFullPathway: true
},
{
  id: "steroid-resistant-ns",
  title: "Steroid-Resistant Nephrotic Syndrome",
  category: "Nephrotic Syndrome",
  priority: "warning",
  description: "SRNS workup, genetic testing, biopsy, calcineurin inhibitors",
  icon: Microscope,
  hasFullPathway: true
},
{
  id: "ckd-comprehensive",
  title: "CKD Comprehensive Management",
  category: "CKD",
  priority: "warning",
  description: "All stages, complications, RRT preparation, nutrition",
  icon: TrendingUp,
  hasFullPathway: true
},
{
  id: "hypocalcemia",
  title: "Hypocalcemia Management",
  category: "Electrolytes",
  priority: "warning",
  description: "Calcium correction, vitamin D, causes and IV calcium protocol",
  icon: Zap,
  hasFullPathway: true
}];


// AI Agent Content Components
const BiopsyAnalyzerContent = () => <BiopsyAnalyzer />;
const RadiologyAnalyzerContent = () => <RadiologyAnalyzer />;
const LabReportAnalyzerContent = () => <LabReportAnalyzer />;
const ClinicalCaseAnalyzerContent = () => <ClinicalCaseAnalyzer />;

export default function ClinicalSupport() {
  // Deep-link support: ?tab=pathways&scenario=aki-prifle
  const searchParams = new URLSearchParams(window.location.search);
  const initialTab = searchParams.get("tab") || "scenarios";
  const initialScenario = searchParams.get("scenario") || null;

  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedScenario, setSelectedScenario] = useState(initialScenario);

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


  const groupedScenarios = {
    "Emergency": clinicalScenarios.filter((s) => s.priority === "danger"),
    "Urgent": clinicalScenarios.filter((s) => s.priority === "warning"),
    "Routine": clinicalScenarios.filter((s) => s.priority === "secondary")
  };

  const renderScenarioList = () =>
  <div className="space-y-6">
      {Object.entries(groupedScenarios).map(([group, scenarios]) =>
    <div key={group}>
          <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Badge className={
        group === "Emergency" ? "bg-red-600" :
        group === "Urgent" ? "bg-amber-600" :
        "bg-blue-600"
        }>
              {group}
            </Badge>
            <span className="text-slate-600 text-sm">({scenarios.length} scenarios)</span>
          </h3>
          <div className="space-y-3">
      {scenarios.map((scenario) => {
          const IconComponent = scenario.icon;
          const priorityColors = {
            danger: "bg-red-50 border-red-300 hover:bg-red-100 hover:shadow-lg", // Added hover effects
            warning: "bg-amber-50 border-amber-300 hover:bg-amber-100 hover:shadow-lg",
            secondary: "bg-blue-50 border-blue-300 hover:bg-blue-100 hover:shadow-lg"
          };
          const priorityBadges = {
            danger: "bg-red-500 text-white", // Solid color badges
            warning: "bg-amber-500 text-white",
            secondary: "bg-blue-500 text-white"
          };

          return (
            <Card
              key={scenario.id}
              className={`${priorityColors[scenario.priority]} border-2 cursor-pointer transition-all`} // Removed hover:shadow-lg from here as it's in priorityColors
              onClick={() => {
                setSelectedScenario(scenario.id);
                setActiveTab("pathways");
              }}>
              
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${ // Increased size, added shadow
                    scenario.priority === "danger" ? "bg-red-200" :
                    scenario.priority === "warning" ? "bg-amber-200" :
                    "bg-blue-200"}`
                    }>
                    <IconComponent className={`w-7 h-7 ${ // Increased icon size
                      scenario.priority === "danger" ? "text-red-700" :
                      scenario.priority === "warning" ? "text-amber-700" :
                      "text-blue-700"}`
                      } />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 mb-1 text-lg">{scenario.title}</h3> {/* Increased font size */}
                    <p className="text-sm text-slate-600 mb-2">{scenario.description}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{scenario.category}</Badge>
                      <Badge className={`${priorityBadges[scenario.priority]} text-xs px-2 py-1`}> {/* Styled badge */}
                        {scenario.priority.toUpperCase()} {/* Uppercase priority */}
                      </Badge>
                      {scenario.hasFullPathway && // New badge for full pathway
                        <Badge className="bg-green-500 text-white text-xs">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Full Pathway
                        </Badge>
                        }
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-slate-400" /> {/* Increased icon size */}
              </div>
            </CardContent>
          </Card>);

        })}
          </div>
          </div>
    )}
          </div>;


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

    return (
      <div>
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg ${
              scenario.priority === "danger" ? "bg-red-200" :
              scenario.priority === "warning" ? "bg-amber-200" :
              "bg-blue-200"}`
              }>
                <scenario.icon className={`w-8 h-8 ${
                scenario.priority === "danger" ? "text-red-700" :
                scenario.priority === "warning" ? "text-amber-700" :
                "text-blue-700"}`
                } />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">{scenario.title}</h2>
                <p className="text-slate-600">{scenario.description}</p>
                <Badge variant="outline" className="mt-2">{scenario.category}</Badge>
              </div>
            </div>
            <Button variant="outline" onClick={() => {
              setSelectedScenario(null);
              setActiveTab("scenarios");
            }}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Change
            </Button>
          </div>
        </div>

        {selectedScenario === "nephrotic-syndrome" && renderNephroticSyndromePathway()}
        {selectedScenario === "iga-nephropathy" && renderIgANephropathyPathway()}
        {selectedScenario === "hspn" && <HSPNPathway />}
        {selectedScenario === "aki-prifle" && <AKIPathway />}
        {selectedScenario === "htn-emergency" && <HypertensiveEmergencyPathway />}
        {selectedScenario === "hyperkalemia" && <HyperkalemiaPathway />}
        {selectedScenario === "uti-febrile" && <UTIPathway />}
        {selectedScenario === "hemolytic-uremic" && <HUSPathway />}
        {selectedScenario === "tumor-lysis" && <TumorLysisPathway />}
        {selectedScenario === "lupus-nephritis" && <LupusNephritisPathway />}
        {selectedScenario === "post-strep-gn" && <PSGNPathway />}
        {selectedScenario === "hyponatremia" && <HyponatremiaPathway />}
        {selectedScenario === "hypercalcemia" && <HypercalcemiaPathway />}
        {selectedScenario === "transplant-rejection" && <TransplantRejectionPathway />}
        {selectedScenario === "dialysis-catheter-infection" && <DialysisCatheterInfectionPathway />}
        {selectedScenario === "ckd-mbd" && <CKDMBDPathway />}
        {selectedScenario === "renal-stone" && <RenalStonePathway />}
        {selectedScenario === "bladder-dysfunction" && <BladderDysfunctionPathway />}
        {selectedScenario === "rta-diagnosis" && <RTAPathway />}
        {selectedScenario === "tubular-function" && <TubularFunctionPathway />}
        {selectedScenario === "hypokalemia" && <HypokalemiaPathway />}
        {selectedScenario === "severe-edema-ns" && <SevereEdemaPathway />}
        {selectedScenario === "sbp" && <SBPPathway />}
        {selectedScenario === "metabolic-acidosis" && <MetabolicAcidosisPathway />}
        {selectedScenario === "contrast-nephropathy" && <ContrastNephropathyPathway />}
        {selectedScenario === "fluid-electrolyte" && <FluidElectrolytePathway />}
        {selectedScenario === "acid-base" && <AcidBasePathway />}
        {selectedScenario === "htn-diagnosis" && <HypertensionDiagnosisPathway />}
        {selectedScenario === "htn-treatment" && <HypertensionTreatmentPathway />}
        {selectedScenario === "vur" && <VURPathway />}
        {selectedScenario === "hydronephrosis" && <HydronephrosisPathway />}
        {selectedScenario === "childhood-nephrotic" && <NephroticSyndromeChildhoodPathway />}
        {selectedScenario === "congenital-nephrotic" && <CongenitalNephroticPathway />}
        {selectedScenario === "iga-vasculitis" && <IgAVasculitisPathway />}
        {selectedScenario === "anca-vasculitis" && <ANCAbVasculitisPathway />}
        {selectedScenario === "membranous-nephropathy" && <MembranousNephropathyPathway />}
        {selectedScenario === "peritoneal-dialysis" && <PeritonealDialysisPathway />}
        {selectedScenario === "hemodialysis" && <HemodialysisPathway />}
        {selectedScenario === "ckd-staging" && <CKDStagingPathway />}
        {selectedScenario === "ckd-anemia-mbd" && <CKDAnemiaMBDPathway />}
        {selectedScenario === "kidney-transplant" && <KidneyTransplantPathway />}
        {selectedScenario === "hematuria-approach" && <HematuriaPathway />}
        {selectedScenario === "proteinuria-approach" && <ProteinuriaPathway />}
        {selectedScenario === "cystic-kidney" && <CysticKidneyPathway />}
        {selectedScenario === "steroid-resistant-ns" && <SteroidResistantNSPathway />}
        {selectedScenario === "ckd-comprehensive" && <ChronicKidneyDiseasePathway />}
        {selectedScenario === "hypocalcemia" && <HypocalcemiaPathway />}
        {scenario.hasFullPathway && ![
        "nephrotic-syndrome",
        "iga-nephropathy",
        "hspn",
        "aki-prifle",
        "htn-emergency",
        "hyperkalemia",
        "uti-febrile",
        "hemolytic-uremic",
        "tumor-lysis",
        "lupus-nephritis",
        "post-strep-gn",
        "hyponatremia",
        "hypercalcemia",
        "transplant-rejection",
        "dialysis-catheter-infection",
        "ckd-mbd",
        "renal-stone",
        "bladder-dysfunction",
        "rta-diagnosis",
        "tubular-function",
        "hypokalemia",
        "severe-edema-ns",
        "sbp",
        "metabolic-acidosis",
        "contrast-nephropathy",
        "fluid-electrolyte",
        "acid-base",
        "htn-diagnosis",
        "htn-treatment",
        "vur",
        "hydronephrosis",
        "childhood-nephrotic",
        "congenital-nephrotic",
        "iga-vasculitis",
        "anca-vasculitis",
        "membranous-nephropathy",
        "peritoneal-dialysis",
        "hemodialysis",
        "ckd-staging",
        "ckd-anemia-mbd",
        "kidney-transplant",
        "hematuria-approach",
        "proteinuria-approach",
        "cystic-kidney",
        "steroid-resistant-ns",
        "ckd-comprehensive",
        "hypocalcemia"].
        includes(selectedScenario) &&
        <Alert className="bg-blue-50 border-blue-200">
            <Info className="w-5 h-5 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>{scenario.title} Pathway:</strong> Detailed clinical pathway available in Guidelines section. Check related protocols and use AI Assistant for management guidance.
            </AlertDescription>
          </Alert>
        }
      </div>);

  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-3 md:p-6">
      <div className="max-w-7xl mx-auto">
        <Link to={createPageUrl("Hub")}>
          <Button variant="outline" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <Brain className="w-10 h-10 text-purple-600" />
            Pediatric Nephrology Pathways
          </h1>
          <p className="text-slate-600">Evidence-based protocols with file upload, guided symptom entry, and comprehensive pathways — {clinicalScenarios.length}+ scenarios</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-green-100 text-muted-foreground p-1 rounded-xl items-center justify-center grid w-full grid-cols-5 h-auto gap-1">
            <TabsTrigger value="diagnostic" className="mx-1 my-1 px-2 py-1 text-xs font-medium rounded-2xl justify-center whitespace-nowrap ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow flex items-center gap-1 sm:text-sm">
              <Brain className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">AI Diagnostic</span><span className="sm:hidden">Dx Agent</span>
            </TabsTrigger>
            <TabsTrigger value="glomerular" className="px-3 py-1 text-xs font-medium rounded-xl justify-center whitespace-nowrap ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow flex items-center gap-1 sm:text-sm">
              <Microscope className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Glomerular Diseases</span><span className="sm:hidden">GN</span>
            </TabsTrigger>
            <TabsTrigger value="ai-agents" className="px-3 py-1 text-xs font-medium rounded-xl justify-center whitespace-nowrap ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow flex items-center gap-1 sm:text-sm">
              <Microscope className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Clinical AI</span><span className="sm:hidden">AI</span>
            </TabsTrigger>
            <TabsTrigger value="scenarios" className="flex items-center gap-1 text-xs sm:text-sm">
              <Clipboard className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Scenarios ({clinicalScenarios.length})</span><span className="sm:hidden">Cases</span>
            </TabsTrigger>
            <TabsTrigger value="pathways" className="px-3 py-1 text-xs font-medium rounded-xl justify-center whitespace-nowrap ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow flex items-center gap-1 sm:text-sm">
              <GitBranch className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Pathways</span><span className="sm:hidden">Path</span>
            </TabsTrigger>
            </TabsList>

          <TabsContent value="diagnostic">
            {renderDiagnosticAgent()}
          </TabsContent>

          <TabsContent value="glomerular">
            <GlomerularDiseasesPathway />
          </TabsContent>

          <TabsContent value="ai-agents">
            <div className="space-y-6">
              <Alert className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
                <Microscope className="w-5 h-5 text-purple-600" />
                <AlertDescription className="text-purple-800">
                  <strong>Clinical AI Agents:</strong> Advanced AI analysis for biopsies, radiology, lab reports, and complete case analysis with structured outputs
                </AlertDescription>
              </Alert>

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
                  Clinical Scenarios Library - {clinicalScenarios.length} Pathways
                </CardTitle>
                <p className="text-sm text-slate-600 mt-1">Select a scenario to view evidence-based management pathways</p>
              </CardHeader>
              <CardContent className="p-6">
                {renderScenarioList()}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pathways">
            {renderSelectedPathway()}
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