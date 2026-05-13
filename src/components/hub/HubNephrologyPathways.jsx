import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FlaskConical, Heart, Shield, Brain, Droplets, Activity, Pill,
  ChevronDown, ChevronUp, ArrowRight, ExternalLink, Stethoscope,
  CheckCircle, TestTube, BookOpen, Users, Microscope, Beaker,
  Baby, Layers, GraduationCap, Search, X
} from "lucide-react";
import PathwayModuleList from "./PathwayModuleList";

// ─────────────────────────────────────────────────────────────────────────────
// CANONICAL KNOWLEDGE ARCHITECTURE — 5 PILLARS
// validated=true → canonical content confirmed at destination
// ─────────────────────────────────────────────────────────────────────────────

const PILLARS = [
  // ── PILLAR A: NEPHROLOGY PATHWAYS ────────────────────────────────────────
  {
    pillar: "Nephrology Pathways",
    color: "from-blue-700 to-indigo-700",
    icon: Stethoscope,
    description: "Glomerular · AKI · CKD · Tubular · Metabolic · Dialysis · Transplant · HTN · Electrolytes",
    groups: [
      {
        group: "Glomerular Diseases",
        icon: FlaskConical,
        color: "from-pink-600 to-rose-600",
        groupPage: "GlomerularDiseases",
        groupParams: "",
        moduleCategory: "Glomerular Diseases",
        moduleItems: [
          { label: "Nephrotic Syndrome (MCD, FSGS, MN)", titleKeyword: "nephrotic syndrome" },
          { label: "IgA Nephropathy / IgA Vasculitis", titleKeyword: "iga" },
          { label: "Lupus Nephritis (ISN/RPS I-VI)", titleKeyword: "lupus nephritis" },
          { label: "ANCA Vasculitis (GPA / MPA)", titleKeyword: "anca" },
          { label: "Anti-GBM / Goodpasture", titleKeyword: "anti-gbm" },
          { label: "HUS / TMA / aHUS", titleKeyword: "hus" },
          { label: "C3 Glomerulopathy (C3GN / DDD)", titleKeyword: "c3 glomerulopathy" },
          { label: "PSGN / Infection-related GN", titleKeyword: "psgn" },
          { label: "Congenital Nephrotic Syndrome", titleKeyword: "congenital nephrotic" },
          { label: "Alport Syndrome / COL4 Nephropathy", titleKeyword: "alport" },
        ],
        items: [
          { label: "MCD – Minimal Change Disease", page: "GlomerularDiseases", params: "", validated: true },
          { label: "FSGS – Focal Segmental Glomerulosclerosis", page: "GlomerularDiseases", params: "", validated: true },
          { label: "Membranous Nephropathy (MN)", page: "GlomerularDiseases", params: "", validated: true },
          { label: "IgA Nephropathy (IgAN)", page: "GlomerularDiseases", params: "", validated: true },
          { label: "IgA Vasculitis (HSP) Nephritis", page: "GlomerularDiseases", params: "", validated: true },
          { label: "Lupus Nephritis (ISN/RPS I–VI)", page: "GlomerularDiseases", params: "", validated: true },
          { label: "ANCA Vasculitis (GPA / MPA)", page: "GlomerularDiseases", params: "", validated: true },
          { label: "Anti-GBM / Goodpasture", page: "GlomerularDiseases", params: "", validated: true },
          { label: "PSGN / Infection-related GN", page: "GlomerularDiseases", params: "", validated: true },
          { label: "MPGN / C3 Glomerulopathy / DDD", page: "GlomerularDiseases", params: "", validated: true },
          { label: "HUS / aHUS / TMA", page: "GlomerularDiseases", params: "", validated: true },
          { label: "Congenital Nephrotic Syndrome", page: "GlomerularDiseases", params: "", validated: true },
          { label: "Alport Syndrome / COL4 Nephropathy", page: "GlomerularDiseases", params: "", validated: true },
        ],
      },
      {
        group: "Acute Kidney Injury",
        icon: Heart,
        color: "from-red-600 to-rose-600",
        groupPage: "ClinicalSupport",
        groupParams: "?tab=pathways&scenario=aki-prifle",
        moduleCategory: "AKI",
        moduleItems: [
          { label: "KDIGO AKI staging (pRIFLE / KDIGO)", titleKeyword: "kdigo aki staging" },
          { label: "Pre-renal vs intrinsic vs post-renal", titleKeyword: "classification" },
          { label: "AKI in neonates", titleKeyword: "neonates" },
          { label: "Nephrotoxin stewardship", titleKeyword: "nephrotoxin" },
          { label: "AKI-to-CKD transition monitoring", titleKeyword: "aki-to-ckd" },
          { label: "Fluid management in AKI", titleKeyword: "fluid management" },
        ],
        items: [
          { label: "KDIGO AKI Staging (pRIFLE / KDIGO)", page: "ClinicalSupport", params: "?tab=pathways&scenario=aki-prifle", validated: true },
          { label: "Pre-renal vs Intrinsic vs Post-renal", page: "ClinicalApproaches", params: "", validated: true },
          { label: "AKI in Neonates", page: "ClinicalSupport", params: "?tab=pathways&scenario=aki-prifle", validated: true },
          { label: "Nephrotoxin / Contrast AKI", page: "ClinicalSupport", params: "?tab=pathways&scenario=contrast-nephropathy", validated: true },
          { label: "Fluid Management in AKI", page: "ClinicalSupport", params: "?tab=pathways&scenario=fluid-electrolyte", validated: true },
          { label: "Dialysis Indications (AEIOU)", page: "ClinicalSupport", params: "?tab=pathways&scenario=aki-dialysis-timing", validated: true },
          { label: "AKI-to-CKD Transition", page: "ClinicalSupport", params: "?tab=pathways&scenario=ckd-comprehensive", validated: true },
        ],
      },
      {
        group: "Chronic Kidney Disease",
        icon: Shield,
        color: "from-blue-600 to-indigo-600",
        groupPage: "ClinicalSupport",
        groupParams: "?tab=pathways&scenario=ckd-comprehensive",
        moduleCategory: "CKD",
        moduleItems: [
          { label: "CKD staging (KDIGO G1-G5)", titleKeyword: "ckd staging" },
          { label: "CKD-MBD (mineral bone disease)", titleKeyword: "ckd-mbd" },
          { label: "Anemia of CKD (EPO, iron)", titleKeyword: "anaemia of ckd" },
          { label: "Growth failure in CKD", titleKeyword: "growth failure" },
          { label: "Nutrition in CKD", titleKeyword: "renal nutrition" },
          { label: "Cardiovascular risk in CKD", titleKeyword: "cardiovascular risk" },
          { label: "CKD progression monitoring", titleKeyword: "ckd progression" },
        ],
        items: [
          { label: "CKD Staging (KDIGO G1–G5)", page: "ClinicalSupport", params: "?tab=pathways&scenario=ckd-staging", validated: true },
          { label: "CKD-MBD – Mineral Bone Disease", page: "ClinicalSupport", params: "?tab=pathways&scenario=ckd-mbd", validated: true },
          { label: "Anemia of CKD (EPO, Iron)", page: "ClinicalSupport", params: "?tab=pathways&scenario=ckd-anemia-mbd", validated: true },
          { label: "Growth Failure in CKD", page: "Anthropometry", params: "", validated: true },
          { label: "Nutrition in CKD", page: "NutritionHub", params: "", validated: true },
          { label: "Cardiovascular Risk in CKD", page: "ClinicalSupport", params: "?tab=pathways&scenario=ckd-comprehensive", validated: true },
          { label: "CKD Progression Monitoring", page: "ClinicalSupport", params: "?tab=pathways&scenario=ckd-staging", validated: true },
        ],
      },
      {
        group: "Tubular Disorders",
        icon: Beaker,
        color: "from-teal-600 to-cyan-600",
        groupPage: "ClinicalApproaches",
        groupParams: "",
        moduleCategory: "Tubular Disorders",
        moduleItems: [
          { label: "Distal Renal Tubular Acidosis (dRTA)", titleKeyword: "distal renal tubular acidosis" },
          { label: "Proximal RTA and Fanconi Syndrome", titleKeyword: "proximal rta" },
          { label: "Bartter Syndrome (Types 1-5)", titleKeyword: "bartter syndrome" },
          { label: "Gitelman Syndrome", titleKeyword: "gitelman" },
          { label: "Nephrogenic Diabetes Insipidus (NDI)", titleKeyword: "nephrogenic diabetes" },
          { label: "Nephrocalcinosis", titleKeyword: "nephrocalcinosis" },
          { label: "Nephrolithiasis / Stone Disease", titleKeyword: "nephrolithiasis" },
        ],
        items: [
          { label: "Distal RTA (Type 1)", page: "ClinicalApproaches", params: "", validated: true },
          { label: "Proximal RTA (Type 2) / Fanconi", page: "ClinicalApproaches", params: "", validated: true },
          { label: "Bartter Syndrome", page: "ClinicalApproaches", params: "", validated: true },
          { label: "Gitelman Syndrome", page: "ClinicalApproaches", params: "", validated: true },
          { label: "Nephrogenic Diabetes Insipidus", page: "ClinicalApproaches", params: "", validated: true },
          { label: "Nephrocalcinosis", page: "ClinicalApproaches", params: "", validated: true },
          { label: "Nephrolithiasis / Stone Disease", page: "StoneRisk", params: "", validated: true },
        ],
      },
      {
        group: "Metabolic & Genetic Nephrology",
        icon: Brain,
        color: "from-purple-600 to-violet-600",
        groupPage: "ClinicalApproaches",
        groupParams: "",
        moduleCategory: "Metabolic & Genetic",
        moduleItems: [
          { label: "Cystinosis", titleKeyword: "cystinosis" },
          { label: "Fabry disease", titleKeyword: "fabry" },
          { label: "Primary hyperoxaluria", titleKeyword: "primary hyperoxaluria" },
          { label: "Polycystic kidney disease (ARPKD/ADPKD)", titleKeyword: "polycystic" },
          { label: "Nephronophthisis / ciliopathies", titleKeyword: "nephronophthisis" },
          { label: "Genetic nephrotic syndromes", titleKeyword: "genetic nephrotic" },
        ],
        items: [
          { label: "Cystinosis", page: "ClinicalApproaches", params: "", validated: true },
          { label: "Fabry Disease", page: "GeneticReportAnalyzer", params: "", validated: true },
          { label: "Primary Hyperoxaluria (PH1/2/3)", page: "ClinicalSupport", params: "?tab=pathways&scenario=cystic-kidney", validated: true },
          { label: "ARPKD / ADPKD – Polycystic Kidney", page: "ClinicalSupport", params: "?tab=pathways&scenario=cystic-kidney", validated: true },
          { label: "Nephronophthisis / Ciliopathies", page: "ClinicalSupport", params: "?tab=pathways&scenario=cystic-kidney", validated: true },
          { label: "Genetic Nephrotic Syndrome (NPHS1/2)", page: "ClinicalSupport", params: "?tab=pathways&scenario=steroid-resistant-ns", validated: true },
        ],
      },
      {
        group: "Dialysis & RRT",
        icon: Activity,
        color: "from-blue-600 to-cyan-600",
        groupPage: "RRTAssistant",
        groupParams: "",
        moduleCategory: "Dialysis",
        moduleItems: [
          { label: "Paediatric Haemodialysis", titleKeyword: "haemodialysis" },
          { label: "Acute Peritoneal Dialysis for AKI", titleKeyword: "acute peritoneal dialysis" },
          { label: "Chronic PD (CAPD/APD)", titleKeyword: "chronic peritoneal" },
          { label: "CRRT (CVVH/CVVHD/CVVHDF)", titleKeyword: "crrt" },
          { label: "SLED", titleKeyword: "sled" },
          { label: "Dialysis Emergencies", titleKeyword: "dialysis emergencies" },
          { label: "Dialysis to Transplant Transition", titleKeyword: "transplant transition" },
        ],
        items: [
          { label: "Hemodialysis Protocol (Pediatric)", page: "RRTAssistant", params: "", validated: true },
          { label: "Peritoneal Dialysis (Acute & Chronic)", page: "RRTAssistant", params: "", validated: true },
          { label: "CRRT – Continuous RRT (PICU)", page: "RRTAssistant", params: "", validated: true },
          { label: "SLED / Sustained Dialysis", page: "RRTAssistant", params: "", validated: true },
          { label: "Plasma Exchange (PLEX)", page: "RRTAssistant", params: "", validated: true },
          { label: "Dialysis Adequacy (Kt/V)", page: "KtVCalculator", params: "", validated: true },
        ],
      },
      {
        group: "Transplant",
        icon: Shield,
        color: "from-green-600 to-emerald-600",
        groupPage: "UrologyNephrologyHub",
        groupParams: "",
        moduleCategory: "Transplant",
        moduleItems: [
          { label: "Pre-Transplant Evaluation", titleKeyword: "pre-transplant" },
          { label: "Immunosuppression Protocol", titleKeyword: "immunosuppression in paediatric" },
          { label: "Acute Rejection Management", titleKeyword: "acute rejection" },
          { label: "BK Virus Nephropathy and CMV", titleKeyword: "bk virus" },
        ],
        items: [
          { label: "Immunosuppression Protocols", page: "UrologyNephrologyHub", params: "", validated: true },
          { label: "TCMR / ABMR Rejection", page: "UrologyNephrologyHub", params: "", validated: true },
          { label: "BK Virus Nephropathy", page: "UrologyNephrologyHub", params: "", validated: true },
          { label: "CMV Post-Transplant", page: "UrologyNephrologyHub", params: "", validated: true },
          { label: "PTLD – Post-Transplant Lymphoma", page: "UrologyNephrologyHub", params: "", validated: true },
          { label: "Transplant Monitoring Protocol", page: "UrologyNephrologyHub", params: "", validated: true },
        ],
      },
      {
        group: "Hypertension",
        icon: Heart,
        color: "from-red-600 to-orange-600",
        groupPage: "BPPercentiles",
        groupParams: "",
        moduleCategory: "Hypertension",
        moduleItems: [
          { label: "BP Measurement and Classification", titleKeyword: "bp measurement" },
          { label: "Hypertensive Emergency and PRES", titleKeyword: "hypertensive emergency" },
          { label: "Secondary Hypertension", titleKeyword: "secondary hypertension" },
          { label: "Neonatal Hypertension", titleKeyword: "neonatal hypertension" },
          { label: "CKD Hypertension", titleKeyword: "cardiovascular", category: "CKD" },
        ],
        items: [
          { label: "Pediatric HTN Classification (2017 AAP)", page: "BPPercentiles", params: "", validated: true },
          { label: "Neonatal Hypertension", page: "UrologyNephrologyHub", params: "", validated: true },
          { label: "Hypertensive Emergency", page: "EmergencyHub", params: "", validated: true },
          { label: "Secondary HTN Workup", page: "ClinicalApproaches", params: "", validated: true },
        ],
      },
      {
        group: "CAKUT & Urology",
        icon: Baby,
        color: "from-orange-500 to-amber-600",
        groupPage: "UrologyNephrologyHub",
        groupParams: "",
        moduleCategory: "Congenital & CAKUT",
        moduleItems: [
          { label: "Vesicoureteral Reflux (VUR)", titleKeyword: "vesicoureteral" },
          { label: "Posterior Urethral Valves (PUV)", titleKeyword: "posterior urethral" },
          { label: "Antenatal Hydronephrosis and UPJO", titleKeyword: "antenatal hydronephrosis" },
        ],
        items: [
          { label: "Vesicoureteral Reflux (VUR)", page: "UrologyNephrologyHub", params: "", validated: true },
          { label: "Posterior Urethral Valves (PUV)", page: "UrologyNephrologyHub", params: "", validated: true },
          { label: "Antenatal Hydronephrosis / UPJO", page: "UrologyNephrologyHub", params: "", validated: true },
        ],
      },
      {
        group: "Electrolyte Disorders",
        icon: Droplets,
        color: "from-teal-600 to-cyan-600",
        groupPage: "ClinicalSupport",
        groupParams: "",
        items: [
          { label: "Hyperkalemia – Management Algorithm", page: "EmergencyHub", params: "", validated: true },
          { label: "Hyponatremia / SIADH", page: "ClinicalSupport", params: "", validated: true },
          { label: "Hypernatremia / DI", page: "ClinicalSupport", params: "", validated: true },
          { label: "Hypocalcemia (incl. neonatal)", page: "ClinicalSupport", params: "", validated: true },
          { label: "Hypercalcemia", page: "ClinicalSupport", params: "", validated: true },
          { label: "Metabolic Acidosis / Anion Gap", page: "ABGInterpreter", params: "", validated: true },
          { label: "Metabolic Alkalosis", page: "ClinicalSupport", params: "", validated: true },
        ],
      },
    ],
  },

  // ── PILLAR B: CAKUT & UROLOGY HUB ────────────────────────────────────────
  {
    pillar: "CAKUT & Urology Hub",
    color: "from-teal-600 to-cyan-700",
    icon: Baby,
    description: "Congenital anomalies · Voiding dysfunction · Neurogenic bladder · Imaging",
    groups: [
      {
        group: "Congenital Anomalies (CAKUT)",
        icon: Baby,
        color: "from-teal-600 to-cyan-600",
        groupPage: "UrologyNephrologyHub",
        groupParams: "",
        items: [
          { label: "Antenatal Hydronephrosis (ANH / APD grading)", page: "UrologyNephrologyHub", params: "", validated: true },
          { label: "VUR – Vesicoureteral Reflux", page: "UrologyNephrologyHub", params: "", validated: true },
          { label: "PUV – Posterior Urethral Valves", page: "UrologyNephrologyHub", params: "", validated: true },
          { label: "UPJO – Ureteropelvic Junction Obstruction", page: "UrologyNephrologyHub", params: "", validated: true },
          { label: "UVJO – Ureterovesical Junction Obstruction", page: "UrologyNephrologyHub", params: "", validated: true },
          { label: "Renal Dysplasia & MCDK", page: "UrologyNephrologyHub", params: "", validated: true },
          { label: "Obstructive Uropathy Workup", page: "UrologyNephrologyHub", params: "", validated: true },
        ],
      },
      {
        group: "Neurogenic Bladder & BBD",
        icon: Brain,
        color: "from-violet-600 to-purple-600",
        groupPage: "UrologyNephrologyHub",
        groupParams: "",
        items: [
          { label: "Neurogenic Bladder (Spina Bifida, MMC)", page: "UrologyNephrologyHub", params: "", validated: true },
          { label: "BBD – Bladder Bowel Dysfunction", page: "UrologyNephrologyHub", params: "", validated: true },
          { label: "Dysfunctional Voiding (ICCS)", page: "UrologyNephrologyHub", params: "", validated: true },
          { label: "CIC – Clean Intermittent Catheterisation", page: "UrologyNephrologyHub", params: "", validated: true },
          { label: "Urotherapy – Behavioural Bladder Training", page: "UrologyNephrologyHub", params: "", validated: true },
          { label: "High-Pressure Bladder / Renal Risk", page: "UrologyNephrologyHub", params: "", validated: true },
          { label: "Constipation Pathways (BBD overlap)", page: "UrologyNephrologyHub", params: "", validated: true },
          { label: "Nocturnal Enuresis", page: "UrologyNephrologyHub", params: "", validated: true },
        ],
      },
      {
        group: "Urodynamics & Imaging",
        icon: Activity,
        color: "from-sky-600 to-blue-600",
        groupPage: "UrologyNephrologyHub",
        groupParams: "",
        items: [
          { label: "UDS – Urodynamic Study Interpretation", page: "UrologyNephrologyHub", params: "", validated: true },
          { label: "Uroflowmetry Patterns (AI Analyzer)", page: "UrologyNephrologyHub", params: "", validated: true },
          { label: "VCUG – Voiding Cystourethrogram", page: "UrologyNephrologyHub", params: "", validated: true },
          { label: "DMSA Scan – Renal Cortical Imaging", page: "UrologyNephrologyHub", params: "", validated: true },
          { label: "MAG3 / Diuresis Renogram", page: "UrologyNephrologyHub", params: "", validated: true },
          { label: "Renal Ultrasound (RBUS)", page: "UrologyNephrologyHub", params: "", validated: true },
        ],
      },
      {
        group: "UTI",
        icon: FlaskConical,
        color: "from-rose-600 to-red-600",
        groupPage: "UrologyNephrologyHub",
        groupParams: "",
        items: [
          { label: "Neonatal UTI (< 28 days)", page: "UrologyNephrologyHub", params: "", validated: true },
          { label: "Febrile UTI / Pyelonephritis", page: "UrologyNephrologyHub", params: "", validated: true },
          { label: "Recurrent UTI", page: "UrologyNephrologyHub", params: "", validated: true },
          { label: "CAP – Continuous Antibiotic Prophylaxis", page: "UrologyNephrologyHub", params: "", validated: true },
          { label: "MDR / ESBL UTI", page: "UrologyNephrologyHub", params: "", validated: true },
          { label: "Fungal UTI", page: "UrologyNephrologyHub", params: "", validated: false },
        ],
      },
    ],
  },

  // ── PILLAR C: AI LAB ANALYZER ─────────────────────────────────────────────
  {
    pillar: "AI Lab Analyzer",
    color: "from-violet-700 to-indigo-700",
    icon: Microscope,
    description: "Uroflowmetry · UDS · Acid-Base · Tubular · Urine Microscopy · Stone · Nephrocalcinosis",
    groups: [
      {
        group: "Imaging & Flow Analyzers",
        icon: Activity,
        color: "from-violet-600 to-indigo-600",
        groupPage: "UrologyNephrologyHub",
        groupParams: "",
        items: [
          { label: "Uroflowmetry AI Analyzer (bell, plateau, staccato, tower)", page: "UrologyNephrologyHub", params: "", validated: true },
          { label: "UDS – Filling & Voiding Phase AI", page: "UrologyNephrologyHub", params: "", validated: true },
          { label: "Urine Microscopy AI (casts, cells)", page: "UrologyNephrologyHub", params: "", validated: true },
          { label: "Renal Biopsy Pattern Analyzer", page: "GlomerularDiseases", params: "", validated: true },
        ],
      },
      {
        group: "Biochemistry Analyzers",
        icon: Beaker,
        color: "from-emerald-600 to-teal-600",
        groupPage: "ABGInterpreter",
        groupParams: "",
        items: [
          { label: "Acid-Base / ABG / VBG Interpreter", page: "ABGInterpreter", params: "", validated: true },
          { label: "Tubular Analyzer (FENa, FEUrea, TTKG, TRP)", page: "FENaCalculator", params: "", validated: true },
          { label: "Stone Risk Analyzer (24h urine)", page: "StoneRisk", params: "", validated: true },
          { label: "Nephrocalcinosis Workup", page: "ClinicalApproaches", params: "", validated: true },
          { label: "Lab Report AI Interpreter", page: "UrologyNephrologyHub", params: "", validated: true },
        ],
      },
    ],
  },

  // ── PILLAR D: PATIENT & FAMILY EDUCATION ─────────────────────────────────
  {
    pillar: "Patient & Family Education",
    color: "from-green-700 to-emerald-700",
    icon: Users,
    description: "CIC · CKD counseling · Dialysis · Transplant · Nephrotic relapse · Printable handouts",
    groups: [
      {
        group: "Bladder & Urology Education",
        icon: Users,
        color: "from-teal-600 to-green-600",
        groupPage: "UrologyNephrologyHub",
        groupParams: "",
        items: [
          { label: "CIC Training – Family Education", page: "UrologyNephrologyHub", params: "", validated: true },
          { label: "Urotherapy – Patient Guide", page: "UrologyNephrologyHub", params: "", validated: true },
          { label: "Constipation / BBD Family Guide", page: "UrologyNephrologyHub", params: "", validated: true },
          { label: "Bladder Diary Instructions", page: "UrologyNephrologyHub", params: "", validated: true },
        ],
      },
      {
        group: "Kidney Disease Education",
        icon: BookOpen,
        color: "from-green-600 to-emerald-600",
        groupPage: "UrologyNephrologyHub",
        groupParams: "",
        items: [
          { label: "Nephrotic Syndrome – Relapse Education", page: "UrologyNephrologyHub", params: "", validated: true },
          { label: "CKD Counseling (diet, progression)", page: "UrologyNephrologyHub", params: "", validated: true },
          { label: "Dialysis Education (HD & PD)", page: "UrologyNephrologyHub", params: "", validated: true },
          { label: "Transplant Family Education", page: "UrologyNephrologyHub", params: "", validated: true },
          { label: "Warning Signs – When to Visit ER", page: "UrologyNephrologyHub", params: "", validated: true },
          { label: "Printable Handouts (multilingual)", page: "PatientEducationHub", params: "", validated: true },
        ],
      },
    ],
  },

  // ── PILLAR E: RESEARCH HUB ────────────────────────────────────────────────
  {
    pillar: "Research Hub",
    color: "from-purple-700 to-violet-800",
    icon: GraduationCap,
    description: "Biostatistics · Sample Size · Study Design · CONSORT/STROBE/PRISMA · Registry Design",
    groups: [
      {
        group: "Methodology & Statistics",
        icon: Layers,
        color: "from-purple-600 to-violet-600",
        groupPage: "ResearchMethodsHub",
        groupParams: "",
        items: [
          { label: "Biostatistics Academy", page: "ResearchMethodsHub", params: "", validated: true },
          { label: "Statistical Test Selector", page: "ResearchMethodsHub", params: "", validated: true },
          { label: "Sample Size Builder", page: "ResearchMethodsHub", params: "", validated: true },
          { label: "Study Design (RCT / Cohort / Case-Control)", page: "ResearchMethodsHub", params: "", validated: true },
          { label: "CONSORT / STROBE / PRISMA Workflows", page: "ResearchMethodsHub", params: "", validated: true },
        ],
      },
      {
        group: "Publications & Registry",
        icon: BookOpen,
        color: "from-indigo-600 to-blue-600",
        groupPage: "ResearchOS",
        groupParams: "",
        items: [
          { label: "Manuscript Studio", page: "ResearchOS", params: "", validated: true },
          { label: "CRF / Case Report Form Builder", page: "ResearchOS", params: "", validated: true },
          { label: "Registry Design", page: "ResearchOS", params: "", validated: true },
          { label: "Literature Search & AI Assistant", page: "ResearchHub", params: "", validated: true },
          { label: "Prediction Tools (IgAN, SRNS risk)", page: "PredictionTools", params: "", validated: true },
        ],
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function GroupCard({ group, searchActive }) {
  const [open, setOpen] = useState(false);
  const isOpen = searchActive || open;
  const Icon = group.icon;
  const groupHref = `/${group.groupPage}${group.groupParams}`;
  const hasModuleItems = !!(group.moduleItems && group.moduleCategory);
  const displayCount = hasModuleItems ? group.moduleItems.length : group.items.length;

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-center gap-2 px-4 py-3">
          <a href={groupHref} className="flex items-center gap-3 flex-1 min-w-0 group">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${group.color} flex items-center justify-center shrink-0`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-slate-800 group-hover:text-blue-700 transition-colors">{group.group}</p>
              <p className="text-xs text-slate-500">{displayCount} items{hasModuleItems ? " · linked modules" : ""}</p>
            </div>
          </a>
          <button
            className="ml-2 p-1.5 rounded hover:bg-slate-100 transition-colors shrink-0"
            onClick={() => setOpen(v => !v)}
            aria-label={open ? "Collapse" : "Expand"}
          >
            {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>
        </div>

        {isOpen && (
          <div className="px-4 pb-4 border-t border-slate-100 pt-3 space-y-1">
            {hasModuleItems ? (
              <PathwayModuleList
                category={group.moduleCategory}
                items={group.moduleItems}
              />
            ) : (
              group.items.map((item, i) => {
                const href = `/${item.page}${item.params}`;
                return (
                  <a key={i} href={href}>
                    <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-blue-50 transition-colors group cursor-pointer">
                      <ArrowRight className="w-3 h-3 text-blue-500 flex-shrink-0" />
                      <p className="text-xs text-slate-700 group-hover:text-blue-700 transition-colors flex-1">{item.label}</p>
                      {item.validated
                        ? <CheckCircle className="w-3 h-3 text-green-400 shrink-0" />
                        : <Badge className="text-xs bg-slate-100 text-slate-500 px-1 py-0">Soon</Badge>
                      }
                    </div>
                  </a>
                );
              })
            )}
            <a href={groupHref}>
              <Button size="sm" variant="outline" className="mt-2 text-xs border-blue-200 text-blue-700 hover:bg-blue-50 w-full">
                <ExternalLink className="w-3 h-3 mr-1" /> Open Full Module
              </Button>
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PillarSection({ pillar, searchActive }) {
  const [open, setOpen] = useState(false);
  const isOpen = searchActive || open;
  const Icon = pillar.icon;

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Pillar header */}
      <button
        className={`w-full flex items-center gap-3 p-4 bg-gradient-to-r ${pillar.color} text-white text-left`}
        onClick={() => setOpen(v => !v)}
      >
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-base">{pillar.pillar}</p>
          <p className="text-white/80 text-xs truncate">{pillar.description}</p>
        </div>
        <div className="shrink-0">
          {open
            ? <ChevronUp className="w-5 h-5 text-white/80" />
            : <ChevronDown className="w-5 h-5 text-white/80" />
          }
        </div>
      </button>

      {/* Groups inside pillar */}
      {isOpen && (
        <div className="p-3 bg-slate-50 space-y-2">
          {pillar.groups.map((group, i) => (
            <GroupCard key={i} group={group} searchActive={searchActive} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────
export default function HubNephrologyPathways() {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter pillars/groups/items by search query
  const filteredPillars = useMemo(() => {
    if (!searchQuery.trim()) return PILLARS;
    const q = searchQuery.toLowerCase();
    return PILLARS.map(pillar => ({
      ...pillar,
      groups: pillar.groups.map(group => ({
        ...group,
        items: group.items.filter(item => item.label.toLowerCase().includes(q))
      })).filter(group =>
        group.group.toLowerCase().includes(q) ||
        group.items.length > 0 ||
        pillar.pillar.toLowerCase().includes(q)
      )
    })).filter(pillar =>
      pillar.pillar.toLowerCase().includes(q) ||
      pillar.description.toLowerCase().includes(q) ||
      pillar.groups.length > 0
    );
  }, [searchQuery]);

  const totalMatches = searchQuery
    ? filteredPillars.reduce((acc, p) => acc + p.groups.reduce((a, g) => a + g.items.length, 0), 0)
    : null;

  return (
    <div className="space-y-4">
      {/* Hero */}
      <div className="rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 p-5 text-white">
        <div className="flex items-center gap-3">
          <Stethoscope className="w-7 h-7" />
          <div>
            <h2 className="text-xl font-bold">Pediatric Nephrology & Urology Hub</h2>
            <p className="text-blue-100 text-sm">5 Canonical Pillars · 50+ Validated Pathways · AI-Enhanced</p>
          </div>
        </div>
      </div>
      <p className="text-xs text-slate-500 flex items-center gap-1 px-1">
        <CheckCircle className="w-3 h-3 text-green-500" /> = validated canonical content &nbsp;·&nbsp; tap pillar to expand
      </p>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search pathways, diseases, topics…"
          className="w-full pl-9 pr-8 py-2 text-sm rounded-xl border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {searchQuery && (
        <p className="text-xs text-slate-500 px-1">
          {totalMatches === 0
            ? "No results — try a different keyword"
            : `${totalMatches} match${totalMatches !== 1 ? "es" : ""} for "${searchQuery}"`
          }
        </p>
      )}

      {/* Pillars */}
      <div className="space-y-3">
        {filteredPillars.map((p, i) => (
          <PillarSection key={i} pillar={p} searchActive={!!searchQuery} />
        ))}
      </div>
    </div>
  );
}