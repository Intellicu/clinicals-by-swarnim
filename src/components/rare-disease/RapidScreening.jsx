import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, CheckCircle, Info, RotateCcw, Search, ChevronRight, Dna } from "lucide-react";
import FabryScreeningTool from "./FabryScreeningTool";

const FIELDS = [
  {
    id: "age_onset", label: "Age at onset of symptoms", type: "select", weight: 0,
    options: ["Not known", "Neonatal (0-28 days)", "Infantile (1-12 months)", "Early childhood (1-5 yrs)", "Older child (5-18 yrs)"]
  },
  {
    id: "srns", label: "Steroid-Resistant Nephrotic Syndrome", type: "select", weight: 0,
    options: ["No", "Yes — onset <1 year (infantile)", "Yes — onset 1–12 years", "Yes — onset >12 years"]
  },
  {
    id: "ckd", label: "CKD present or rapidly progressive", type: "select", weight: 0,
    options: ["No", "CKD stage 1–2", "CKD stage 3–4", "CKD stage 5 / ESRD < 18 years"]
  },
  {
    id: "nephrocalcinosis", label: "Nephrocalcinosis on imaging", type: "select", weight: 0,
    options: ["No", "Medullary nephrocalcinosis", "Cortical nephrocalcinosis", "Diffuse nephrocalcinosis"]
  },
  {
    id: "stones", label: "Recurrent kidney stones", type: "select", weight: 0,
    options: ["No", "Single episode >5 yrs", "Recurrent episodes", "First episode <5 years or bilateral"]
  },
  {
    id: "cystic", label: "Cystic kidneys on imaging", type: "select", weight: 0,
    options: ["No", "Incidental cysts", "Multiple bilateral cysts", "Enlarged echogenic kidneys (neonatal)"]
  },
  {
    id: "hearing", label: "Sensorineural hearing loss", type: "select", weight: 0,
    options: ["No", "Mild unilateral", "Bilateral SNHL", "Progressive SNHL"]
  },
  {
    id: "dev_delay", label: "Developmental delay / intellectual disability", type: "select", weight: 0,
    options: ["No", "Mild delay", "Moderate/severe delay", "Associated with retinitis or ocular features"]
  },
  {
    id: "dysmorphism", label: "Dysmorphic features / syndromic appearance", type: "select", weight: 0,
    options: ["No", "Minor dysmorphism", "Clear syndromic features", "Known chromosomal/genetic syndrome"]
  },
  {
    id: "family_ckd", label: "Family history of CKD / renal disease", type: "select", weight: 0,
    options: ["None", "Distant relative", "1st-degree relative with CKD/dialysis", "Multiple family members affected"]
  },
  {
    id: "consanguinity", label: "Parental consanguinity", type: "select", weight: 0,
    options: ["No", "Distant relation", "First/second cousins", "Closer consanguinity"]
  },
  {
    id: "extra_renal", label: "Extra-renal features", type: "select", weight: 0,
    options: ["None", "Ocular (lenticonus, retinopathy)", "Hepatic involvement", "Skeletal / bone involvement", "Neurological features", "Multiple systems"]
  },
];

// Weighted scoring rules
function scoreForm(values) {
  let score = 0;
  const reasons = [];

  const srns = values.srns || "";
  if (srns.includes("infantile")) { score += 5; reasons.push({ text: "Infantile SRNS — very high risk for genetic NS (NPHS1, WT1, LAMB2)", weight: 5, color: "red" }); }
  else if (srns.includes("1–12")) { score += 3; reasons.push({ text: "SRNS in childhood — genetic testing indicated (NPHS2, WT1, COQ mutations)", weight: 3, color: "orange" }); }
  else if (srns.includes("12")) { score += 2; reasons.push({ text: "Adolescent SRNS — consider NPHS2, COQ, INF2 mutations", weight: 2, color: "amber" }); }

  const nephro = values.nephrocalcinosis || "";
  if (nephro.includes("Diffuse")) { score += 4; reasons.push({ text: "Diffuse nephrocalcinosis — consider PH1/PH2/PH3, dRTA, Dent disease, Bartter", weight: 4, color: "red" }); }
  else if (nephro.includes("Medullary")) { score += 3; reasons.push({ text: "Medullary nephrocalcinosis — consider dRTA, PH, hypercalciuria syndromes", weight: 3, color: "orange" }); }

  const hearing = values.hearing || "";
  if (hearing.includes("Progressive") || hearing.includes("Bilateral")) { score += 3; reasons.push({ text: "Bilateral/progressive SNHL + renal disease → Alport syndrome, Muckle-Wells", weight: 3, color: "orange" }); }

  const fam_ckd = values.family_ckd || "";
  if (fam_ckd.includes("Multiple")) { score += 4; reasons.push({ text: "Multiple family members with renal disease — strong genetic basis suspected", weight: 4, color: "red" }); }
  else if (fam_ckd.includes("1st-degree")) { score += 3; reasons.push({ text: "1st-degree relative with CKD — genetic/hereditary nephropathy likely", weight: 3, color: "orange" }); }

  const consang = values.consanguinity || "";
  if (consang.includes("Closer") || consang.includes("First")) { score += 2; reasons.push({ text: "Parental consanguinity — autosomal recessive conditions likely (ARPKD, Bartter, cystinosis)", weight: 2, color: "amber" }); }

  const age = values.age_onset || "";
  if (age.includes("Neonatal") || age.includes("Infantile")) { score += 2; reasons.push({ text: "Neonatal/infantile onset — higher prior probability of monogenic disease", weight: 2, color: "amber" }); }

  const ckd = values.ckd || "";
  if (ckd.includes("ESRD")) { score += 3; reasons.push({ text: "ESRD in childhood — genetic workup mandatory before transplant listing", weight: 3, color: "red" }); }

  const cystic = values.cystic || "";
  if (cystic.includes("enlarged echogenic") || cystic.includes("neonatal")) { score += 4; reasons.push({ text: "Enlarged echogenic kidneys in neonate — ARPKD until proven otherwise", weight: 4, color: "red" }); }
  else if (cystic.includes("Multiple bilateral")) { score += 2; reasons.push({ text: "Multiple bilateral cysts — consider ADPKD, ARPKD, nephronophthisis, Bardet-Biedl", weight: 2, color: "amber" }); }

  const stones = values.stones || "";
  if (stones.includes("First episode <5")) { score += 3; reasons.push({ text: "Kidney stones <5 years — high suspicion for metabolic cause (PH, cystinuria, Dent)", weight: 3, color: "orange" }); }

  const dev = values.dev_delay || "";
  if (dev.includes("retinitis") || dev.includes("ocular")) { score += 4; reasons.push({ text: "Developmental delay + retinal features — consider Joubert, Bardet-Biedl, Senior-Løken", weight: 4, color: "red" }); }

  const extra = values.extra_renal || "";
  if (extra.includes("Multiple")) { score += 3; reasons.push({ text: "Multi-system involvement — syndromic rare disease", weight: 3, color: "orange" }); }
  else if (extra.includes("Ocular")) { score += 3; reasons.push({ text: "Ocular features + renal — Alport (lenticonus), Bardet-Biedl, Joubert", weight: 3, color: "orange" }); }

  return { score, reasons };
}

function getRiskLevel(score) {
  if (score === 0) return { level: "Low Suspicion", color: "green", badge: "bg-green-100 text-green-800", alert: "bg-green-50 border-green-300", description: "No specific features suggesting rare genetic/metabolic renal disease at this time. Standard clinical follow-up recommended.", action: "Routine follow-up. Reassess if new features develop." };
  if (score <= 3) return { level: "Moderate Suspicion", color: "amber", badge: "bg-amber-100 text-amber-800", alert: "bg-amber-50 border-amber-300", description: "Some features warrant further evaluation. Consider targeted investigations.", action: "Metabolic urine studies, ophthalmology review, nephrology genetics input." };
  if (score <= 7) return { level: "High Suspicion", color: "orange", badge: "bg-orange-100 text-orange-800", alert: "bg-orange-50 border-orange-300", description: "Multiple features strongly suggest a rare genetic renal disease. Genetic testing recommended.", action: "Referral to genetics + nephrology. Consider renal panel WES. Urinary organic acids, amino acids, oxalate, cystine." };
  return { level: "Urgent Genetics Referral", color: "red", badge: "bg-red-100 text-red-800", alert: "bg-red-50 border-red-400 border-2", description: "High-probability rare disease with multiple converging features. Urgent genetic evaluation required.", action: "URGENT: Whole exome sequencing / renal gene panel + biochemical studies + renal biopsy (if not done). Refer specialist rare disease centre." };
}

const REASON_COLORS = { red: "bg-red-50 border-red-300 text-red-800", orange: "bg-orange-50 border-orange-300 text-orange-800", amber: "bg-amber-50 border-amber-300 text-amber-800" };

export default function RapidScreening({ isAdmin }) {
  const [values, setValues] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const { score, reasons } = scoreForm(values);
  const risk = getRiskLevel(score);
  const filledCount = Object.values(values).filter(v => v && v !== "No" && v !== "None" && v !== "Not known").length;

  return (
    <Tabs defaultValue="general">
      <TabsList className="w-full grid grid-cols-2 mb-4 bg-white border border-violet-200 rounded-xl p-1">
        <TabsTrigger value="general" className="text-xs rounded-lg data-[state=active]:bg-violet-600 data-[state=active]:text-white">
          <Search className="w-3.5 h-3.5 mr-1" />General Rare Disease Screen
        </TabsTrigger>
        <TabsTrigger value="fabry" className="text-xs rounded-lg data-[state=active]:bg-violet-600 data-[state=active]:text-white">
          <Dna className="w-3.5 h-3.5 mr-1" />💜 Fabry Disease Screening
        </TabsTrigger>
      </TabsList>

      <TabsContent value="fabry">
        <FabryScreeningTool isAdmin={isAdmin} />
      </TabsContent>

      <TabsContent value="general">
    <div className="space-y-4">
      <Card className="bg-white shadow-sm border border-violet-200">
        <CardHeader className="bg-violet-50 border-b py-4 px-5">
          <CardTitle className="flex items-center gap-2 text-base">
            <Search className="w-5 h-5 text-violet-600" />
            Rare Disease Rapid Screening Tool
          </CardTitle>
          <p className="text-xs text-slate-500 mt-1">Structured intake for systematic rare renal disease risk stratification. Select the most accurate option for each feature.</p>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {FIELDS.map(f => (
              <div key={f.id}>
                <Label className="text-xs font-semibold text-slate-700 mb-1 block">{f.label}</Label>
                <Select value={values[f.id] || ""} onValueChange={v => setValues(prev => ({ ...prev, [f.id]: v }))}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Select…" />
                  </SelectTrigger>
                  <SelectContent>
                    {f.options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              onClick={() => setSubmitted(true)}
              className="flex-1 bg-violet-600 hover:bg-violet-700 text-white"
              disabled={filledCount === 0}
            >
              <Search className="w-4 h-4 mr-2" /> Calculate Risk Score
            </Button>
            <Button variant="outline" onClick={() => { setValues({}); setSubmitted(false); }}>
              <RotateCcw className="w-4 h-4 mr-1" /> Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {submitted && (
        <div className="space-y-3">
          {/* Risk level */}
          <Alert className={`border-2 ${risk.alert}`}>
            <div className="flex items-start gap-3">
              {score >= 8 ? <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" /> : score >= 4 ? <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" /> : <Info className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />}
              <AlertDescription className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-base">{risk.level}</span>
                  <Badge className={risk.badge}>Score: {score}</Badge>
                </div>
                <p className="text-sm mb-2">{risk.description}</p>
                <div className="bg-white/60 rounded-lg p-2 border">
                  <p className="text-xs font-bold mb-1">Recommended Action:</p>
                  <p className="text-xs">{risk.action}</p>
                </div>
              </AlertDescription>
            </div>
          </Alert>

          {/* Explainable reason cards */}
          {reasons.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">Contributing Factors ({reasons.length})</p>
              <div className="space-y-2">
                {reasons.map((r, i) => (
                  <div key={i} className={`flex items-start gap-3 rounded-lg border p-3 ${REASON_COLORS[r.color]}`}>
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-white/60 flex items-center justify-center text-xs font-bold">
                      +{r.weight}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs leading-relaxed">{r.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {reasons.length === 0 && (
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-4">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-800">No high-weight features detected. Routine nephrology follow-up recommended. Reassess if new features develop.</p>
            </div>
          )}

          {/* Suggested next steps based on score */}
          {score >= 4 && (
            <Card className="bg-indigo-50 border border-indigo-200">
              <CardContent className="p-4">
                <p className="text-xs font-bold text-indigo-900 mb-3 uppercase">Suggested Investigations</p>
                <div className="grid md:grid-cols-2 gap-2 text-xs text-indigo-800">
                  {[
                    "Spot urine protein:creatinine ratio, albumin:creatinine",
                    "Urinary organic acids (oxalate, citrate, cystine)",
                    "Serum electrolytes, calcium, phosphate, magnesium, uric acid",
                    "Urinary calcium:creatinine ratio",
                    "Complement C3, C4, CH50, AP50 (if TMA/aHUS suspected)",
                    "Renal ultrasonography ± DMSA scan",
                    "Ophthalmology evaluation (slit lamp, fundus)",
                    "Audiology evaluation (pure tone audiometry)",
                    "Renal gene panel / Whole Exome Sequencing",
                    "Renal biopsy with EM and immunofluorescence (if not done)",
                  ].map((s, i) => (
                    <div key={i} className="flex items-start gap-2 bg-white rounded p-2">
                      <ChevronRight className="w-3 h-3 text-indigo-500 flex-shrink-0 mt-0.5" />
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
      </TabsContent>
    </Tabs>
  );
}