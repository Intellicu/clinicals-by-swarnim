// ── Single source of truth for all Clinical AI Analyzers ──────────────────────
// Import this wherever you need to show the analyzer list.
// All hubs, FAB, and AI Center page should use this registry.

import {
  Microscope, Layers, BookOpen, Brain, TestTube,
  Activity, Dna, FlaskConical, HeartPulse, Wind
} from "lucide-react";

export const CLINICAL_AI_ANALYZERS = [
  {
    id: "lab",
    name: "Lab Report Analyzer",
    icon: Microscope,
    color: "bg-rose-600",
    page: "ClinicalAIHub",
    tab: "labs",
    desc: "Interpret blood work, RFT, CBC, electrolytes with pediatric reference ranges",
  },
  {
    id: "urine",
    name: "Urine / UDS Analyzer",
    icon: TestTube,
    color: "bg-teal-600",
    page: "ClinicalAIHub",
    tab: "uds",
    desc: "Urine dipstick, microscopy, UDS pattern recognition",
  },
  {
    id: "differential",
    name: "Differential Diagnosis",
    icon: Brain,
    color: "bg-indigo-600",
    page: "DifferentialEngine",
    tab: null,
    desc: "Symptom-based AI differential with probability ranking",
  },
  {
    id: "radiology",
    name: "Radiology Analyzer",
    icon: Activity,
    color: "bg-sky-700",
    page: "ClinicalAIHub",
    tab: "radiology",
    desc: "X-ray, ultrasound, DMSA, MRI image + report interpretation",
  },
  {
    id: "biopsy",
    name: "Renal Biopsy AI",
    icon: Layers,
    color: "bg-violet-700",
    page: "ClinicalAIHub",
    tab: "biopsy",
    desc: "Biopsy pattern interpretation: LM, IF, EM findings",
  },
  {
    id: "case",
    name: "Case Discussion AI",
    icon: BookOpen,
    color: "bg-emerald-700",
    page: "ClinicalAIHub",
    tab: "case",
    desc: "Structured case analysis and management recommendations",
  },
  {
    id: "ecg",
    name: "ECG Analyzer",
    icon: HeartPulse,
    color: "bg-red-600",
    page: "ClinicalAIHub",
    tab: "ecg",
    desc: "Pediatric ECG interpretation including electrolyte effects",
  },
  {
    id: "genetics",
    name: "Genetics AI",
    icon: Dna,
    color: "bg-violet-600",
    page: "GeneticReportAnalyzer",
    tab: null,
    desc: "Genetic report interpretation, variant classification, counselling",
  },
];