import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle, CheckCircle2, Beaker, Activity, Microscope,
  Info, ChevronRight, Stethoscope, FileText
} from "lucide-react";
import RenalStonePathway from "./RenalStonePathway";
import PathwayShell from "./PathwayShell";

const NEPHROCALCINOSIS_DATA = {
  overview: `Nephrocalcinosis = calcium deposition within renal parenchyma (cortex or medulla).
Nephrolithiasis = stone(s) within collecting system.
They frequently co-exist and share common metabolic causes.

Medullary nephrocalcinosis (most common): dRTA type 1, hyperparathyroidism, medullary sponge kidney, hyperoxaluria.
Cortical nephrocalcinosis: chronic GN, cortical necrosis (rarer).`,

  causes: [
    { group: "Hypercalciuria / Hypercalcemia", items: ["Idiopathic hypercalciuria (most common)", "Primary hyperparathyroidism", "Vitamin D toxicity / hypervitaminosis D", "Williams syndrome (idiopathic infantile hypercalcemia)", "Granulomatous diseases (sarcoidosis, TB)", "Immobilization hypercalcemia"] },
    { group: "Tubular Disorders", items: ["Distal RTA (Type 1) — hallmark", "Bartter syndrome", "Dent disease (CLCN5 mutations)", "Lowe syndrome", "Fanconi syndrome"] },
    { group: "Hyperoxaluria", items: ["Primary hyperoxaluria type 1 (AGXT)", "Primary hyperoxaluria type 2 (GRHPR)", "Enteric hyperoxaluria (short bowel, IBD)", "Dietary excess oxalate"] },
    { group: "Other Causes", items: ["Medullary sponge kidney", "Furosemide therapy in neonates (long-term)", "Prematurity (furosemide + TPN)", "Hypomagnesemia / hypocitraturia"] },
  ],

  investigations: {
    blood: [
      "Calcium (corrected), Phosphate, Magnesium",
      "Creatinine, eGFR (Schwartz formula)",
      "Bicarbonate / venous blood gas (dRTA → low HCO3, high Cl−)",
      "PTH (intact)",
      "25-OH Vitamin D, 1,25-OH Vitamin D",
      "Alkaline phosphatase",
      "Uric acid",
    ],
    urine: [
      "Urine pH (spot) — dRTA: cannot acidify below 5.5",
      "Spot Ca/Cr ratio (>0.2 mg/mg = hypercalciuria)",
      "Urine oxalate/Cr ratio",
      "Spot urine citrate/Cr",
      "24-hour urine: Ca, oxalate, citrate, uric acid, volume, Na",
      "Urine amino acids (Fanconi screen: glycosuria, aminoaciduria, phosphaturia)",
      "Tubular phosphate reabsorption (TRP), TmP/GFR",
    ],
    imaging: [
      "Renal ultrasound (first-line) — medullary hyperechogenicity",
      "KUB plain X-ray — radiopaque stones",
      "Non-contrast CT — gold standard for stone detection",
      "DMSA scan if recurrent UTI + stone to assess scarring",
    ],
    genetic: [
      "AGXT gene (primary hyperoxaluria type 1)",
      "CLCN5 (Dent disease), OCRL (Lowe)",
      "SLC4A1 (dRTA with anemia)",
      "ATP6V0A4 / ATP6V1B1 (dRTA with/without sensorineural deafness)",
    ],
  },

  management: {
    general: [
      "High fluid intake: target urine output ≥2–3 mL/kg/hr or >1.5 L/m²/day",
      "Correct underlying metabolic defect (see condition-specific below)",
      "Dietary sodium restriction (<2–3 mEq/kg/day) — reduces urinary calcium",
      "Normal dietary calcium (do NOT restrict — causes bone loss and paradoxically ↑ oxalate)",
      "Avoid high-oxalate foods if hyperoxaluria",
      "Regular renal imaging q6–12 months to monitor progression",
    ],
    drta: [
      "Potassium citrate 2–5 mEq/kg/day in 3–4 divided doses (preferred)",
      "OR Sodium bicarbonate + potassium chloride (if hypokalemia prominent)",
      "Target urine pH 6.5–7.0 and serum HCO3 >22 mEq/L",
      "Nephrocalcinosis may partially regress with sustained alkali therapy",
    ],
    hyperoxaluria: [
      "PH1 (AGXT): pyridoxine 5–10 mg/kg/day (trial — B6 responders ~30%)",
      "PH1: Lumasiran (RNAi) — approved for all ages — reduces hepatic oxalate synthesis",
      "Aggressive hyperhydration + citrate + neutral phosphate",
      "Pre-emptive combined liver-kidney transplant for advanced PH1",
      "PH2: no specific pharmacotherapy — supportive",
    ],
    hypercalciuria: [
      "Hydrochlorothiazide 1–2 mg/kg/day (reduces urinary calcium ~30%)",
      "Amiloride 0.1–0.2 mg/kg/day (combined with HCTZ to avoid hypokalemia)",
      "Increase dietary potassium and citrate",
      "Treat underlying cause (parathyroidectomy if primary HPT)",
    ],
  },

  references: [
    { text: "Hoppe B, Kemper MJ. Diagnostic examination of the child with urolithiasis or nephrocalcinosis. Pediatr Nephrol. 2010;25(3):403-413.", url: "https://doi.org/10.1007/s00467-009-1330-4" },
    { text: "Sas DJ, et al. Clinical Practice Recommendations for Pediatric Urolithiasis. Kidney360. 2021;2(4):664-680.", url: "https://doi.org/10.34067/KID.0007942020" },
    { text: "Bacchetta J, et al. Nephrocalcinosis and nephrolithiasis in infants and children. Int J Nephrol. 2011.", url: "" },
    { text: "ERKNet/ESPN Consensus: Distal RTA management 2021. Pediatr Nephrol.", url: "" },
    { text: "Groothoff JW, et al. Primary hyperoxaluria type 1 — KDIGO/OHF 2022 guidelines.", url: "" },
  ],
};

export default function NephrocalcinosisNephrolithiasisPathway({ isAdmin = false }) {
  const [subTab, setSubTab] = useState("nephrocalcinosis");

  const OverviewContent = () => (
    <div className="space-y-4">
      <Alert className="bg-teal-50 border-teal-200">
        <Info className="w-5 h-5 text-teal-600" />
        <AlertDescription className="text-teal-800 text-sm whitespace-pre-line">
          {NEPHROCALCINOSIS_DATA.overview}
        </AlertDescription>
      </Alert>
      <Tabs value={subTab} onValueChange={setSubTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="nephrocalcinosis">Nephrocalcinosis</TabsTrigger>
          <TabsTrigger value="nephrolithiasis">🪨 Stone Tool</TabsTrigger>
        </TabsList>
        <TabsContent value="nephrocalcinosis" className="mt-4 space-y-4">
          <h3 className="font-bold text-slate-900">Causes by Category</h3>
          {NEPHROCALCINOSIS_DATA.causes.map((group) => (
            <Card key={group.group} className="border border-slate-200">
              <CardHeader className="py-2 px-4 bg-slate-50 border-b">
                <CardTitle className="text-sm font-semibold text-slate-800">{group.group}</CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <ul className="space-y-1">
                  {group.items.map((item, i) => (
                    <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                      <ChevronRight className="w-3.5 h-3.5 text-teal-600 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        <TabsContent value="nephrolithiasis" className="mt-4">
          <RenalStonePathway />
        </TabsContent>
      </Tabs>
    </div>
  );

  const InvestigationsContent = () => (
    <div className="space-y-4">
      {Object.entries(NEPHROCALCINOSIS_DATA.investigations).map(([key, items]) => {
        const labels = { blood: "🩸 Blood Tests", urine: "🧪 Urine Tests", imaging: "📷 Imaging", genetic: "🧬 Genetic Tests" };
        return (
          <Card key={key} className="border border-slate-200">
            <CardHeader className="py-2 px-4 bg-blue-50 border-b">
              <CardTitle className="text-sm font-semibold text-blue-900">{labels[key] || key}</CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <ul className="space-y-1">
                {items.map((item, i) => (
                  <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  const ManagementContent = () => (
    <div className="space-y-4">
      {Object.entries(NEPHROCALCINOSIS_DATA.management).map(([key, items]) => {
        const labels = {
          general: "General Measures (All Cases)",
          drta: "Distal RTA — Alkali Therapy",
          hyperoxaluria: "Primary Hyperoxaluria",
          hypercalciuria: "Hypercalciuria Management",
        };
        const colors = {
          general: "bg-green-50 border-green-200",
          drta: "bg-amber-50 border-amber-200",
          hyperoxaluria: "bg-purple-50 border-purple-200",
          hypercalciuria: "bg-blue-50 border-blue-200",
        };
        return (
          <Card key={key} className={`border ${colors[key] || "border-slate-200"}`}>
            <CardHeader className="py-2 px-4 border-b">
              <CardTitle className="text-sm font-semibold text-slate-900">{labels[key] || key}</CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <ul className="space-y-1">
                {items.map((item, i) => (
                  <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                    <span className="text-slate-400 font-mono text-xs mt-0.5">{i + 1}.</span>
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  const MainContent = () => (
    <div className="space-y-4">
      <Alert className="bg-teal-50 border-teal-200">
        <Beaker className="w-5 h-5 text-teal-600" />
        <AlertDescription className="text-teal-800">
          <strong>Nephrocalcinosis & Nephrolithiasis:</strong> Complete evaluation pathway — causes, investigations, metabolic workup, and stone-type specific management.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="overview" className="text-xs py-2">Overview & Causes</TabsTrigger>
          <TabsTrigger value="investigations" className="text-xs py-2">Investigations</TabsTrigger>
          <TabsTrigger value="management" className="text-xs py-2">Management</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-4"><OverviewContent /></TabsContent>
        <TabsContent value="investigations" className="mt-4"><InvestigationsContent /></TabsContent>
        <TabsContent value="management" className="mt-4"><ManagementContent /></TabsContent>
      </Tabs>
    </div>
  );

  return (
    <PathwayShell
      title="Nephrocalcinosis & Nephrolithiasis"
      category="Tubular Disorders / Metabolic"
      guidelineKeywords="nephrocalcinosis nephrolithiasis renal stone"
      overview={
        <div className="space-y-4">
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{NEPHROCALCINOSIS_DATA.overview}</p>
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="w-4 h-4 text-blue-600" />
            <AlertDescription className="text-blue-800 text-sm">
              <strong>India-specific:</strong> Distal RTA is the most common cause of medullary nephrocalcinosis in South Asian children. Primary hyperoxaluria has good access to lumasiran through compassionate programs. Genetic testing via SEQLINK or MedGenome available.
            </AlertDescription>
          </Alert>
        </div>
      }
      algorithm={
        <Alert className="bg-slate-50 border-slate-200">
          <Info className="w-4 h-4 text-slate-500" />
          <AlertDescription className="text-slate-600 text-sm">
            Algorithm: Ultrasound finding of increased medullary echogenicity → Urine pH (spot) → Blood gas → Calcium/PTH/Vit D → 24h urine metabolic workup → Genetic panel if indicated.
            {isAdmin && " Upload algorithm image via Edit (Admin)."}
          </AlertDescription>
        </Alert>
      }
      histologyGenetics={
        <Card className="border border-purple-200">
          <CardHeader className="bg-purple-50 border-b py-2 px-4">
            <CardTitle className="text-sm text-purple-900">Genetics of Nephrocalcinosis</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3 text-sm text-slate-700">
              <div>
                <Badge className="bg-purple-100 text-purple-800 mb-1">Tubular Disorders</Badge>
                <ul className="space-y-1 mt-1">
                  <li>• <strong>dRTA:</strong> ATP6V1B1 (with deafness), ATP6V0A4, SLC4A1</li>
                  <li>• <strong>Dent disease:</strong> CLCN5 (X-linked), OCRL (Lowe syndrome)</li>
                  <li>• <strong>Bartter:</strong> SLC12A1, KCNJ1, BSND, CLCNKB</li>
                </ul>
              </div>
              <div>
                <Badge className="bg-blue-100 text-blue-800 mb-1">Hyperoxaluria</Badge>
                <ul className="space-y-1 mt-1">
                  <li>• <strong>PH1:</strong> AGXT (alanine:glyoxylate aminotransferase) — autosomal recessive</li>
                  <li>• <strong>PH2:</strong> GRHPR</li>
                  <li>• <strong>PH3:</strong> HOGA1</li>
                </ul>
              </div>
              <div>
                <Badge className="bg-green-100 text-green-800 mb-1">Hypercalciuria</Badge>
                <ul className="space-y-1 mt-1">
                  <li>• <strong>CASR mutations:</strong> Familial hypocalciuric hypercalcemia</li>
                  <li>• <strong>VDR / CYP24A1:</strong> Hypersensitivity to Vitamin D</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      }
      references={NEPHROCALCINOSIS_DATA.references}
      isAdmin={isAdmin}
    >
      <MainContent />
    </PathwayShell>
  );
}