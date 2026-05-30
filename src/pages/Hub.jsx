import React, { useState, useMemo } from "react";
import EmergencyAccessDrawer from "../components/EmergencyAccessDrawer";
import EmergencyProtocolDrawer from "../components/hub/EmergencyProtocolDrawer";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Activity, Calculator, Heart, Droplet, Pill, BookOpen,
  Stethoscope, TestTube, Baby, Zap, Sparkles, Brain, AlertCircle,
  UtensilsCrossed, GraduationCap, Layers, FlaskConical, ClipboardList,
  Beaker, Wind, Waves, Microscope, GitBranch, Users, Dna, ChevronRight,
  RefreshCw, Shield, Info, BarChart2, Star,
  Database, TrendingUp, LineChart, Search, X, Camera, ScanLine,
  ChevronDown, ChevronUp, Thermometer } from
"lucide-react";
import QuickPatientEntry from "../components/QuickPatientEntry";
import { useOnlineStatus } from "../components/OfflineDataManager";
import GlobalSearch from "../components/GlobalSearch";
import ContextualSuggestions from "../components/hub/ContextualSuggestions";
import { usePatient } from "../components/PatientContext";
import QuickCalculations from "../components/QuickCalculations";
import FrequencyQuickAccess from "../components/hub/FrequencyQuickAccess";
import HubDrugSearch from "../components/hub/HubDrugSearch";

// ── AI Analyser Tools ── (url = full path, or page for createPageUrl)
const AI_TOOLS = [
{ name: "Lab Analyzer", icon: Microscope, color: "bg-rose-600", page: "ClinicalAIHub", tab: "labs", desc: "Interpret labs with AI" },
{ name: "Biopsy AI", icon: Layers, color: "bg-violet-700", page: "ClinicalAIHub", tab: "biopsy", desc: "Renal biopsy patterns" },
{ name: "Genetic Agent", icon: Dna, color: "bg-violet-600", page: "GeneticReportAnalyzer", desc: "Genetic report analysis" },
{ name: "Uroflow AI", icon: Activity, color: "bg-teal-700", page: "UrologyNephrologyHub", tab: "uroflow", desc: "Uroflowmetry analysis" },
{ name: "Urine/UDS AI", icon: TestTube, color: "bg-teal-600", page: "ClinicalAIHub", tab: "uds", desc: "Urine & UDS analysis" },
{ name: "Differential Dx", icon: Brain, color: "bg-indigo-600", page: "DifferentialEngine", desc: "AI differential diagnosis" },
{ name: "AI Prescriber", icon: Sparkles, color: "bg-indigo-700", page: "AIPrescriber", desc: "Smart prescription builder" },
{ name: "Case Analyzer", icon: BookOpen, color: "bg-emerald-700", page: "ClinicalAIHub", tab: "case", desc: "Full case AI analysis" }];


// ── Quick Calc Tools ──
const QUICK_CALCS = [
{ name: "Schwartz GFR", icon: Activity, color: "bg-blue-600", page: "SchwartzGFR" },
{ name: "BP Percentiles", icon: Heart, color: "bg-red-600", page: "BPPercentiles" },
{ name: "AKI Stager", icon: AlertCircle, color: "bg-red-700", page: "AKIStager" },
{ name: "FENa", icon: TestTube, color: "bg-indigo-600", page: "FENaCalculator" },
{ name: "ABG", icon: Wind, color: "bg-rose-600", page: "ABGInterpreter" },
{ name: "Anion Gap", icon: Calculator, color: "bg-red-600", page: "AnionGap" },
{ name: "Sodium Corr.", icon: Droplet, color: "bg-blue-500", page: "SodiumCalculator" },
{ name: "K+ Calc", icon: Zap, color: "bg-amber-600", page: "PotassiumCalculator" },
{ name: "Fluids", icon: Waves, color: "bg-cyan-600", page: "FluidCalculator" },
{ name: "Anthropometry", icon: Baby, color: "bg-green-600", page: "Anthropometry" },
{ name: "All Calcs →", icon: Calculator, color: "bg-slate-700", page: "CalculatorsHub" }];


// ── Knowledge sections ──
const KNOWLEDGE_SECTIONS = [
{
  title: "Glomerular Diseases",
  icon: Microscope,
  color: "border-blue-300 bg-blue-50",
  iconColor: "text-blue-700",
  items: [
  { name: "GN & Glomerular Pathways", page: "GlomerularDiseases", icon: Microscope },
  { name: "Nephrotic Syndrome", page: "ClinicalSupport", icon: Droplet },
  { name: "SRNS & Biopsy Pathways", page: "ClinicalSupport", icon: Layers },
  { name: "Lupus Nephritis", page: "ClinicalSupport", icon: Shield },
  { name: "IgA & IgAV Nephropathy", page: "ClinicalSupport", icon: GitBranch },
  { name: "ANCA Vasculitis", page: "ClinicalSupport", icon: Activity },
  { name: "Membranous Nephropathy", page: "ClinicalSupport", icon: Microscope }]

},
{
  title: "AKI & Emergency",
  icon: AlertCircle,
  color: "border-red-200 bg-red-50",
  iconColor: "text-red-600",
  items: [
  { name: "Emergency Hub", page: "EmergencyHub", icon: AlertCircle },
  { name: "AKI Management (KDIGO)", page: "AKIStager", icon: Zap },
  { name: "HUS / TMA Protocols", page: "EmergencyHub", icon: AlertCircle },
  { name: "Hyperkalemia", page: "EmergencyHub", icon: Zap },
  { name: "HTN Emergency", page: "EmergencyHub", icon: Heart },
  { name: "RRT Initiation Triggers", page: "RRTAssistant", icon: Droplet }]

},
{
  title: "CKD Management",
  icon: TrendingUp,
  color: "border-cyan-200 bg-cyan-50",
  iconColor: "text-cyan-700",
  items: [
  { name: "CKD Staging (KDIGO)", page: "CKDStager", icon: TrendingUp },
  { name: "CKD-MBD Protocols", page: "ClinicalSupport", icon: TestTube },
  { name: "Anemia of CKD", page: "ClinicalSupport", icon: Activity },
  { name: "Nutrition in CKD", page: "NutritionHub", icon: UtensilsCrossed },
  { name: "Prediction Tools (ESRD)", page: "PredictionTools", icon: LineChart }]

},
{
  title: "Tubular Disorders",
  icon: Beaker,
  color: "border-teal-200 bg-teal-50",
  iconColor: "text-teal-700",
  items: [
  { name: "Tubular Disorders Hub", page: "TubularDisordersHub", icon: Beaker },
  { name: "RTA Classifier", page: "RTAClassifier", icon: FlaskConical },
  { name: "TRP & TmP/GFR", page: "TRPCalculator", icon: TestTube },
  { name: "FEMg, FEUA Calculators", page: "FEMgCalculator", icon: Calculator },
  { name: "Cystinuria & Rare Tubular", page: "RareDiseaseModule", icon: Dna }]

},
{
  title: "Hypertension",
  icon: Heart,
  color: "border-rose-200 bg-rose-50",
  iconColor: "text-rose-600",
  items: [
  { name: "BP Percentiles (AAP 2017)", page: "BPPercentiles", icon: Heart },
  { name: "HTN Staging & Treatment", page: "ClinicalSupport", icon: Stethoscope },
  { name: "HTN Emergency Protocol", page: "EmergencyHub", icon: AlertCircle },
  { name: "Secondary HTN Workup", page: "ClinicalSupport", icon: GitBranch },
  { name: "Antihypertensive Drugs", page: "DrugsDosing", icon: Pill }]

},
{
  title: "Dialysis & RRT",
  icon: Droplet,
  color: "border-indigo-200 bg-indigo-50",
  iconColor: "text-indigo-700",
  items: [
  { name: "RRT Assistant (HD/PD)", page: "RRTAssistant", icon: Droplet },
  { name: "Kt/V Adequacy", page: "KtVCalculator", icon: Calculator },
  { name: "PD Peritonitis Protocol", page: "EmergencyHub", icon: AlertCircle },
  { name: "CRRT Prescriptions", page: "RRTAssistant", icon: Activity },
  { name: "Dialysis Catheter Infection", page: "ClinicalSupport", icon: Shield }]

},
{
  title: "Transplant",
  icon: Shield,
  color: "border-green-200 bg-green-50",
  iconColor: "text-green-700",
  items: [
  { name: "Transplant Pathways", page: "ClinicalSupport", icon: Shield },
  { name: "Rejection Protocols", page: "ClinicalSupport", icon: AlertCircle },
  { name: "Post-Tx Monitoring", page: "ClinicalSupport", icon: Activity },
  { name: "Immunosuppressants", page: "DrugsDosing", icon: Pill }]

},
{
  title: "Nephrology & Urology",
  icon: Droplet,
  color: "border-blue-300 bg-blue-50",
  iconColor: "text-blue-800",
  items: [
  { name: "CAKUT Master Center", page: "UrologyNephrologyHub", icon: Droplet },
  { name: "Neurogenic Bladder", page: "UrologyNephrologyHub", icon: Brain },
  { name: "Uroflow AI Analyzer", page: "UrologyNephrologyHub", icon: Activity },
  { name: "UTI Master Module", page: "UrologyNephrologyHub", icon: Microscope },
  { name: "VUR Pathways", page: "ClinicalSupport", icon: GitBranch },
  { name: "Hydronephrosis Workup", page: "ClinicalSupport", icon: Waves }]

},
{
  title: "Electrolyte Disorders",
  icon: Zap,
  color: "border-amber-200 bg-amber-50",
  iconColor: "text-amber-700",
  items: [
  { name: "Hyponatremia / Hypernatremia", page: "SodiumCalculator", icon: Droplet },
  { name: "Hypokalemia / Hyperkalemia", page: "PotassiumCalculator", icon: Zap },
  { name: "Calcium & Phosphate", page: "ClinicalSupport", icon: TestTube },
  { name: "Magnesium Disorders", page: "FEMgCalculator", icon: Beaker },
  { name: "Acid-Base (ABG)", page: "ABGInterpreter", icon: Wind }]

},
{
  title: "Genetics & Rare Disease",
  icon: Dna,
  color: "border-violet-200 bg-violet-50",
  iconColor: "text-violet-700",
  items: [
  { name: "Rare Disease Module", page: "RareDiseaseModule", icon: Dna },
  { name: "Rare Disease Diagnostic Checklist", page: "RareDiseaseModule", icon: FlaskConical },
  { name: "Genetic Report Analyzer", page: "GeneticReportAnalyzer", icon: Brain },
  { name: "aHUS · Cystinosis · Fabry", page: "RareDiseaseModule", icon: FlaskConical },
  { name: "NPRD & CoE Network", page: "RareDiseaseModule", icon: Shield },
  { name: "AI Lab Rare Analyzers", page: "RareDiseaseModule", icon: Microscope }]

},
{
  title: "Guidelines & Evidence",
  icon: BookOpen,
  color: "border-green-200 bg-green-50",
  iconColor: "text-green-700",
  items: [
  { name: "Guidelines Library", page: "GuidelinesLibrary", icon: BookOpen },
  { name: "Clinical OS (KDIGO/ISPN)", page: "ClinicalOS", icon: Brain },
  { name: "Teaching Hub", page: "TeachingHub", icon: GraduationCap },
  { name: "Case Library", page: "CaseLibrary", icon: Database }]

},
{
  title: "Calculators Hub",
  icon: Calculator,
  color: "border-slate-200 bg-slate-50",
  iconColor: "text-slate-700",
  items: [
  { name: "All Calculators →", page: "CalculatorsHub", icon: Calculator },
  { name: "Schwartz GFR", page: "SchwartzGFR", icon: Activity },
  { name: "ABG Interpreter", page: "ABGInterpreter", icon: Wind },
  { name: "Drug Dosing Engine", page: "DrugsDosing", icon: Pill }]

},
{
  title: "Procedural Medicine",
  icon: ClipboardList,
  color: "border-slate-200 bg-slate-50",
  iconColor: "text-slate-700",
  items: [
  { name: "Procedure Hub", page: "ProcedureHub", icon: ClipboardList },
  { name: "Kidney Biopsy Checklist", page: "ProcedureHub", icon: Shield },
  { name: "HD Catheter Insertion Guide", page: "ProcedureHub", icon: Droplet },
  { name: "CAPD Catheter Guide", page: "ProcedureHub", icon: Droplet },
  { name: "CRRT Setup Guide", page: "ProcedureHub", icon: Activity },
  { name: "Peritoneal Equilibration Test (PET)", page: "ProcedureHub", icon: Beaker }]

},
{
  title: "Pediatric Subspecialties",
  icon: Stethoscope,
  color: "border-slate-200 bg-slate-50",
  iconColor: "text-slate-600",
  items: [
  { name: "Subspecialties Hub", page: "SubspecialtiesHub", icon: Stethoscope },
  { name: "Pediatric Neurology", page: "SubspecialtiesHub", icon: Brain },
  { name: "Pediatric Cardiology", page: "SubspecialtiesHub", icon: Heart },
  { name: "Pediatric Pulmonology", page: "SubspecialtiesHub", icon: Wind },
  { name: "Neonatology", page: "SubspecialtiesHub", icon: Baby },
  { name: "Pediatric Urology", page: "SubspecialtiesHub", icon: Droplet },
  { name: "Pediatric Dermatology", page: "SubspecialtiesHub", icon: Layers }]

},
{
  title: "Imaging & Radiology",
  icon: Camera,
  color: "border-blue-200 bg-blue-50",
  iconColor: "text-blue-700",
  items: [
  { name: "Imaging Viewer & Guides", page: "ImagingViewer", icon: Camera },
  { name: "CAKUT USS Interpretation", page: "ImagingViewer", icon: Activity },
  { name: "MCU / VCUG Interpretation", page: "ImagingViewer", icon: Activity },
  { name: "DMSA Scan Interpretation", page: "ImagingViewer", icon: Activity },
  { name: "MAG3 Renogram Interpretation", page: "ImagingViewer", icon: Activity }]

},
{
  title: "Pediatric Rheumatology",
  icon: Heart,
  color: "border-rose-200 bg-rose-50",
  iconColor: "text-rose-600",
  items: [
  { name: "Rheumatology Hub", page: "PediatricRheumatology", icon: Stethoscope },
  { name: "JIA, SLE, Vasculitis", page: "PediatricRheumatology", icon: Shield },
  { name: "Scoring (JADAS, SLEDAI)", page: "CalculatorsHub", icon: BarChart2 }]

},
{
  title: "Pediatric Endocrinology",
  icon: Thermometer,
  color: "border-orange-200 bg-orange-50",
  iconColor: "text-orange-600",
  items: [
  { name: "Endocrinology Hub", page: "PediatricEndocrinology", icon: Thermometer },
  { name: "DKA Management", page: "EmergencyHub", icon: AlertCircle },
  { name: "Growth Hormone Deficiency", page: "PediatricEndocrinology", icon: Baby },
  { name: "Thyroid Disorders", page: "PediatricEndocrinology", icon: Thermometer },
  { name: "Adrenal Disorders (CAH)", page: "PediatricEndocrinology", icon: Zap },
  { name: "Diabetes Mellitus Type 1/2", page: "PediatricEndocrinology", icon: Activity },
  { name: "Pubertal Disorders", page: "PediatricEndocrinology", icon: Users }]

},
{
  title: "Pediatric Gastroenterology",
  icon: Activity,
  color: "border-orange-200 bg-orange-50",
  iconColor: "text-orange-700",
  items: [
  { name: "Gastroenterology Hub (IAP)", page: "GeneralPediatricsHub", icon: Activity },
  { name: "GERD — Diagnosis & Management", page: "GeneralPediatricsHub", icon: Activity },
  { name: "IBD — Crohn's Disease", page: "GeneralPediatricsHub", icon: AlertCircle },
  { name: "IBD — Ulcerative Colitis", page: "GeneralPediatricsHub", icon: AlertCircle },
  { name: "Coeliac Disease (IAP criteria)", page: "GeneralPediatricsHub", icon: Beaker },
  { name: "Acute Diarrhoea & ORS", page: "GeneralPediatricsHub", icon: Droplet },
  { name: "Neonatal Cholestasis / Alagille", page: "GeneralPediatricsHub", icon: Baby },
  { name: "Neonatal Enterocolitis (NEC)", page: "GeneralPediatricsHub", icon: Baby },
  { name: "GI Bleed Approach", page: "GeneralPediatricsHub", icon: AlertCircle },
  { name: "Liver Disease — Paediatric", page: "GeneralPediatricsHub", icon: Activity }]

},
{
  title: "Pediatric Haematology",
  icon: FlaskConical,
  color: "border-red-200 bg-red-50",
  iconColor: "text-red-700",
  items: [
  { name: "Haematology Hub (IAP)", page: "GeneralPediatricsHub", icon: FlaskConical },
  { name: "Iron Deficiency Anaemia (IDA)", page: "GeneralPediatricsHub", icon: Droplet },
  { name: "Thalassaemia — Diagnosis & Tx", page: "GeneralPediatricsHub", icon: Beaker },
  { name: "ITP — Immune Thrombocytopenia", page: "GeneralPediatricsHub", icon: Activity },
  { name: "Haemophilia A & B", page: "GeneralPediatricsHub", icon: AlertCircle },
  { name: "Sickle Cell Disease (SCD)", page: "GeneralPediatricsHub", icon: Activity },
  { name: "HLH — Haemophagocytic Syndrome", page: "GeneralPediatricsHub", icon: AlertCircle },
  { name: "CBC Interpretation Guide", page: "ClinicalAIHub", icon: Microscope },
  { name: "Bone Marrow Failure (AA)", page: "GeneralPediatricsHub", icon: Zap },
  { name: "Transfusion Medicine Basics", page: "GeneralPediatricsHub", icon: Droplet }]

},
{
  title: "Research Platform",
  icon: Layers,
  color: "border-teal-200 bg-teal-50",
  iconColor: "text-teal-600",
  items: [
  { name: "Research Hub", page: "ResearchHub", icon: Layers },
  { name: "Research OS", page: "ResearchOS", icon: Database },
  { name: "Nutrition Hub", page: "NutritionHub", icon: UtensilsCrossed },
  { name: "General Pediatrics", page: "PediatricsHub", icon: Baby }]

},
{
  title: "General Pediatrics (IAP)",
  icon: Baby,
  color: "border-green-200 bg-green-50",
  iconColor: "text-green-700",
  items: [
  { name: "General Pediatrics Hub", page: "GeneralPediatricsHub", icon: Baby },
  { name: "IAP Screening Tools", page: "GeneralPediatricsHub", icon: Shield },
  { name: "M-CHAT (Autism Screening)", page: "GeneralPediatricsHub", icon: Brain },
  { name: "Newborn Screening (NBS)", page: "GeneralPediatricsHub", icon: Baby },
  { name: "Growth Monitoring (WHO/IAP)", page: "GeneralPediatricsHub", icon: TrendingUp },
  { name: "IAP Vaccination 2023", page: "GeneralPediatricsHub", icon: Shield },
  { name: "Fever Approach (IAP)", page: "GeneralPediatricsHub", icon: Activity },
  { name: "Acute Diarrhoea & ORS", page: "GeneralPediatricsHub", icon: Droplet },
  { name: "SAM Management (WHO/IAP)", page: "GeneralPediatricsHub", icon: Baby },
  { name: "BP Screening (AAP 2017)", page: "BPPercentiles", icon: Heart },
  { name: "TB Screening (NTEP India)", page: "GeneralPediatricsHub", icon: Wind },
  { name: "Anaemia & IDA (WIFS)", page: "GeneralPediatricsHub", icon: Activity },
  { name: "Gastroenterology (IBD/GERD/Coeliac)", page: "GeneralPediatricsHub", icon: Activity },
  { name: "Haematology (IDA/Thal/ITP/SCD/HLH)", page: "GeneralPediatricsHub", icon: Activity },
  { name: "Developmental Milestones (IAP/WHO)", page: "GeneralPediatricsHub", icon: Brain },
  { name: "Dysmorphology & Syndrome Screening", page: "GeneralPediatricsHub", icon: Dna }]
},
{
  title: "General Pediatric Calculators",
  icon: Calculator,
  color: "border-teal-200 bg-teal-50",
  iconColor: "text-teal-700",
  items: [
  { name: "Maintenance Fluids (Holliday-Segar)", page: "FluidCalculator", icon: Waves },
  { name: "Dehydration Correction", page: "FluidCalculator", icon: Droplet },
  { name: "Corrected Sodium", page: "SodiumCalculator", icon: Droplet },
  { name: "Corrected Calcium", page: "ClinicalSupport", icon: TestTube },
  { name: "Anion Gap", page: "AnionGap", icon: Calculator },
  { name: "Osmolar Gap", page: "OsmolarGap", icon: Calculator },
  { name: "BP Percentiles (AAP)", page: "BPPercentiles", icon: Heart },
  { name: "BMI Percentiles", page: "Anthropometry", icon: Baby },
  { name: "Growth Percentiles", page: "Anthropometry", icon: Baby },
  { name: "Glasgow Coma Scale", page: "CalculatorsHub", icon: Brain },
  { name: "PEWS Score", page: "CalculatorsHub", icon: Activity },
  { name: "Pediatric Sepsis Screening", page: "CalculatorsHub", icon: AlertCircle },
  { name: "Drug Dose by Weight", page: "DrugsDosing", icon: Pill },
  { name: "Resuscitation Drug Calc", page: "CalculatorsHub", icon: Zap },
  { name: "Burns Fluid Calculator", page: "CalculatorsHub", icon: Waves },
  { name: "Insulin Infusion Calc", page: "CalculatorsHub", icon: Activity },
  { name: "DKA Corrected Sodium", page: "SodiumCalculator", icon: Droplet },
  { name: "Neonatal Bilirubin", page: "CalculatorsHub", icon: Baby },
  { name: "APGAR Reference", page: "CalculatorsHub", icon: Star },
  { name: "Tanner Staging", page: "CalculatorsHub", icon: Users }]

}];



// ── OCR Scan cards ──
const OCR_CARDS = [
{ name: "Scan Lab Report", icon: Microscope, color: "bg-blue-600", desc: "Auto-extract lab values" },
{ name: "Scan Prescription", icon: Pill, color: "bg-purple-600", desc: "Extract Rx details" },
{ name: "Scan Urine Report", icon: TestTube, color: "bg-teal-600", desc: "Dipstick & microscopy" }];


function CollapsibleSection({ title, icon: Icon, iconColor, children, defaultOpen = false, className = "" }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`bg-white ${className}`}>
      <button
        className="w-full flex items-center justify-between px-3 py-2.5 text-left focus:outline-none"
        onClick={() => setOpen((o) => !o)}>
        
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${iconColor}`} />
          <span className="text-sm font-bold text-slate-800">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && <div className="pb-2">{children}</div>}
    </div>);

}

export default function Hub() {
  const isOnline = useOnlineStatus();
  const { patientData } = usePatient();
  const [emergencyDrawerOpen, setEmergencyDrawerOpen] = useState(false);
  const [emergencyProtocolOpen, setEmergencyProtocolOpen] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const isAdmin = user?.role === "admin";
  const [sectionQuery, setSectionQuery] = useState("");
  const [showAllKnowledge, setShowAllKnowledge] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(null);

  const filteredSections = useMemo(() => {
    if (!sectionQuery.trim()) return KNOWLEDGE_SECTIONS;
    const q = sectionQuery.toLowerCase();
    return KNOWLEDGE_SECTIONS.
    map((section) => ({
      ...section,
      items: section.items.filter((item) => item.name.toLowerCase().includes(q))
    })).
    filter((section) =>
    section.title.toLowerCase().includes(q) || section.items.length > 0
    );
  }, [sectionQuery]);

  const visibleSections = showAllKnowledge ? filteredSections : filteredSections.slice(0, 6);

  const handleOCRScan = async (type, inputId) => {
    const input = document.getElementById(inputId);
    if (input) input.click();
  };

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden pb-20">
      <div className="w-full px-3 py-3 space-y-4">

        {/* ── Hero strip ── */}
        <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-3 shadow">
          <div>
            <h1 className="text-base font-bold text-white leading-tight">CliniCals Hub</h1>
            <p className="text-blue-200 text-xs">Pediatric Nephrology Bedside Assistant</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${isOnline ? "bg-green-400/20 text-green-100" : "bg-amber-400/20 text-amber-100"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-green-300" : "bg-amber-300"}`} />
              <span className="hidden sm:inline">{isOnline ? "Online" : "Offline"}</span>
            </span>
            {/* Emergency Protocols button */}
            <button
              onClick={() => setEmergencyProtocolOpen(true)}
              className="flex items-center gap-1 bg-red-500 hover:bg-red-400 text-white rounded-lg h-7 px-2.5 text-xs font-bold transition-colors shadow-sm"
              aria-label="Emergency Protocols">
              
              <AlertCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Emergency</span>
            </button>
            <Link to={createPageUrl("ClinicalWorkspace")}>
              <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30 border text-xs h-7 px-2.5 gap-1">
                <Layers className="w-3 h-3" />
                <span className="hidden sm:inline">Workspace</span>
              </Button>
            </Link>
            <Link to={createPageUrl("ClinicalSupport")}>
              <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30 border text-xs h-7 px-2.5 gap-1">
                <GitBranch className="w-3 h-3" />
                <span className="hidden sm:inline">Pathways</span>
              </Button>
            </Link>
            {isAdmin &&
            <>
              <Link to={createPageUrl("ClinicDashboard")}>
                <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30 border text-xs h-7 px-2">
                  <Users className="w-3 h-3" />
                </Button>
              </Link>
              <Link to={createPageUrl("PathwayApprovalDashboard")}>
                <Button size="sm" className="bg-amber-500/80 hover:bg-amber-400 text-white border-amber-400/30 border text-xs h-7 px-2 gap-1 hidden">
                  <Sparkles className="w-3 h-3" />
                  <span className="hidden sm:inline">Approvals</span>
                </Button>
              </Link>
            </>
            }
          </div>
        </div>

        {/* ── Search ── */}
        <GlobalSearch
          placeholder="Search calculators, pathways, drugs, AI tools…"
          className="bg-white shadow-sm rounded-xl border border-slate-200" />
        

        {/* ── Quick Patient Entry ── */}
        <QuickPatientEntry />

        {/* ── Drug Dosing Calculator (inline) ── */}
        <HubDrugSearch />

        {/* ── Auto Calculations ── */}
        <QuickCalculations />

        {/* ── Contextual Suggestions from patient data ── */}
        <ContextualSuggestions patientData={patientData} />

        {/* ── Frequency-based Quick Access + Workspace ── */}
        <FrequencyQuickAccess />

        {/* ── Quick Scan OCR ── */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ScanLine className="w-4 h-4 text-green-600" />
            <h2 className="text-sm font-bold text-slate-700">Quick Scan</h2>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
            {OCR_CARDS.map((card, i) => {
              const Icon = card.icon;
              const inputId = `ocr-scan-${i}`;
              return (
                <div key={card.name}>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    id={inputId}
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setOcrLoading(card.name);
                      try {
                        const { file_url } = await base44.integrations.Core.UploadFile({ file });
                        await base44.integrations.Core.InvokeLLM({
                          prompt: `Extract clinical values from this ${card.name.toLowerCase()} image.`,
                          file_urls: [file_url],
                          response_json_schema: { type: "object", properties: { values: { type: "string" } } }
                        });
                      } finally {
                        setOcrLoading(null);
                        e.target.value = '';
                      }
                    }} />
                  
                  <label htmlFor={inputId} className="cursor-pointer block">
                    <div className={`${card.color} rounded-xl p-3 flex flex-col items-center gap-1.5 active:scale-95 transition-transform shadow-sm`}>
                      {ocrLoading === card.name ?
                      <RefreshCw className="w-5 h-5 text-white animate-spin" /> :
                      <Icon className="w-5 h-5 text-white" />
                      }
                      <span className="text-white text-xs font-semibold text-center leading-tight">{card.name}</span>
                      <span className="text-white/70 text-xs text-center leading-tight hidden sm:block">{card.desc}</span>
                    </div>
                  </label>
                </div>);

            })}
          </div>
        </div>

        {/* ── Quick Calculators ── */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-700">Quick Calculators</h2>
            </div>
            <Link to={createPageUrl("CalculatorsHub")}>
              <span className="text-xs text-blue-600 font-semibold">All →</span>
            </Link>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {QUICK_CALCS.map((calc) => {
              const Icon = calc.icon;
              return (
                <Link key={calc.name} to={createPageUrl(calc.page)} className="flex-shrink-0">
                  <div className="bg-white rounded-xl border border-slate-200 p-2.5 flex flex-col items-center gap-1.5 active:scale-95 transition-transform hover:border-blue-300 hover:shadow-sm w-20">
                    <div className={`w-9 h-9 ${calc.color} rounded-xl flex items-center justify-center shadow-sm`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 text-center leading-tight line-clamp-2">{calc.name}</span>
                  </div>
                </Link>);
            })}
          </div>
        </div>

        {/* ── Emergency Quick Access ── */}
        <div className="flex gap-2">
          <button onClick={() => setEmergencyDrawerOpen(true)} className="flex-1 bg-red-600 rounded-xl px-4 py-3 flex items-center justify-between active:scale-95 transition-transform shadow">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-white" />
              <div className="text-left">
                <p className="text-white font-bold text-sm">Emergency Access</p>
                <p className="text-red-200 text-xs">Instant resus tools →</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-red-200" />
          </button>
          <Link to={createPageUrl("EmergencyHub")} className="bg-red-700 rounded-xl px-3 py-3 flex items-center justify-center active:scale-95 transition-transform shadow">
            <Layers className="w-5 h-5 text-white" />
          </Link>
        </div>
        <EmergencyAccessDrawer open={emergencyDrawerOpen} onClose={() => setEmergencyDrawerOpen(false)} />
        <EmergencyProtocolDrawer open={emergencyProtocolOpen} onClose={() => setEmergencyProtocolOpen(false)} weight={patientData.weight ? String(patientData.weight) : ""} />

        {/* ── Key Module Chips ── */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Layers className="w-4 h-4 text-slate-500" />
            <h2 className="text-sm font-bold text-slate-700">Specialty Modules</h2>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {[



            { name: "Rheumatology", icon: Shield, color: "bg-rose-600", page: "PediatricRheumatology" },
            { name: "Nutrition Hub", icon: UtensilsCrossed, color: "bg-green-700", page: "NutritionHub" },
            { name: "Research Platform", icon: Layers, color: "bg-slate-700", page: "ResearchHub" },

            { name: "Endocrinology", icon: Thermometer, color: "bg-orange-500", page: "PediatricEndocrinology" },
            { name: "Gastroenterology", icon: Activity, color: "bg-orange-600", page: "GeneralPediatricsHub" },
            { name: "Haematology", icon: Beaker, color: "bg-red-700", page: "GeneralPediatricsHub" },
            { name: "Subspecialties", icon: Stethoscope, color: "bg-slate-600", page: "SubspecialtiesHub" },
            { name: "Procedures", icon: ClipboardList, color: "bg-slate-800", page: "ProcedureHub" }].
            map((chip) => {
              const ChipIcon = chip.icon;
              return (
                <Link key={chip.name} to={createPageUrl(chip.page)} className="flex-shrink-0">
                  <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl ${chip.color} text-white active:scale-95 transition-transform shadow-sm`}>
                    <ChipIcon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="text-xs font-semibold leading-tight whitespace-nowrap">{chip.name}</span>
                  </div>
                </Link>);
            })}
          </div>
        </div>

        {/* ── Knowledge Base ── */}
        <div>
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-green-600" />
              <h2 className="text-sm font-bold text-slate-700">Knowledge Base</h2>
            </div>
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                value={sectionQuery}
                onChange={(e) => setSectionQuery(e.target.value)}
                placeholder="Filter…"
                className="w-full pl-7 pr-6 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300" />
              
              {sectionQuery &&
              <button onClick={() => setSectionQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
                  <X className="w-3 h-3" />
                </button>
              }
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-px bg-slate-200 rounded-xl overflow-hidden border border-slate-200">
            {visibleSections.map((section) => {
              const SectionIcon = section.icon;
              return (
                <CollapsibleSection
                  key={section.title}
                  title={section.title}
                  icon={SectionIcon}
                  iconColor={section.iconColor}
                  className="bg-white px-3">
                  
                  <div className="px-2 pb-1 space-y-0.5">
                    {section.items.map((item) => {
                      const ItemIcon = item.icon;
                      return (
                        <Link key={item.name} to={createPageUrl(item.page)}>
                          <div className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-slate-50 transition-all cursor-pointer group active:bg-slate-100">
                            <ItemIcon className={`w-3.5 h-3.5 ${section.iconColor} flex-shrink-0`} />
                            <span className="text-xs text-slate-600 group-hover:text-slate-900 flex-1">{item.name}</span>
                            <ChevronRight className="w-3 h-3 text-slate-300" />
                          </div>
                        </Link>);

                    })}
                  </div>
                </CollapsibleSection>);

            })}
          </div>

          {filteredSections.length > 6 &&
          <button
            onClick={() => setShowAllKnowledge((v) => !v)}
            className="w-full mt-2 py-2 text-xs font-semibold text-blue-600 bg-white border border-slate-200 rounded-xl hover:bg-blue-50 transition-colors">
            
              {showAllKnowledge ? "Show Less ↑" : `Show All ${filteredSections.length} Sections ↓`}
            </button>
          }
        </div>

        {/* ── Disclaimer ── */}
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="w-4 h-4 text-blue-600" />
          <AlertDescription className="text-blue-800 text-xs">
            <strong>CliniCals Hub by Swarnim</strong> — Pediatric Clinical Intelligence. Integrates KDIGO, IPNA, ISPD, IAP, ESPN guidelines. For educational & informational use only. Exercise independent clinical judgment.
          </AlertDescription>
        </Alert>
      </div>
    </div>);

}