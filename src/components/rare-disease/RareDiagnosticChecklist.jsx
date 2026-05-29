import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Search, CheckCircle, AlertTriangle, ChevronRight, Dna, FlaskConical } from "lucide-react";

const SYMPTOM_OPTIONS = [
  "Failure to thrive / Growth failure",
  "Polyuria / Polydipsia",
  "Recurrent haematuria",
  "Proteinuria / Nephrotic syndrome",
  "Acral pain / Burning pain in hands/feet",
  "Cornea verticillata / Eye findings",
  "Angiokeratoma (skin lesions)",
  "Hearing loss / Sensorineural",
  "Recurrent AKI / TMA episodes",
  "MAHA / Microangiopathic haemolysis",
  "Low complement (C3/C4)",
  "Cytopaenia (low blood counts)",
  "Hepatosplenomegaly",
  "Cystine crystals / Photophobia",
  "Recurrent nephrolithiasis / Stones",
  "Proximal tubulopathy / Fanconi syndrome",
  "Pulmonary haemorrhage / DAH",
  "Skin photosensitivity / Rash",
  "Developmental delay / Regression",
  "Family history of kidney disease",
];

const RARE_DISEASE_DB = [
  {
    id: "fabry",
    name: "Fabry Disease",
    gene: "GLA (X-linked)",
    ageGroups: ["infant", "child", "adolescent", "adult"],
    symptoms: ["Acral pain / Burning pain in hands/feet", "Cornea verticillata / Eye findings", "Angiokeratoma (skin lesions)", "Recurrent haematuria", "Family history of kidney disease"],
    screeningTests: [
      "α-Galactosidase A enzyme activity (leukocytes) — males",
      "GLA gene sequencing — females (enzyme unreliable)",
      "Lyso-Gb3 plasma level (sensitive biomarker)",
      "Urine sediment — oval fat bodies, lipid-laden casts",
      "Ophthalmology: slit-lamp for cornea verticillata",
      "Audiogram — sensorineural hearing loss",
      "Echo: LVH assessment",
      "Renal function panel + spot UPCR",
    ],
    page: "RareDiseaseModule",
    urgency: "routine",
  },
  {
    id: "ahus",
    name: "Atypical HUS (aHUS)",
    gene: "CFH, CFI, CFB, C3, THBD, CD46 / anti-FH Ab",
    ageGroups: ["infant", "child", "adolescent", "adult"],
    symptoms: ["MAHA / Microangiopathic haemolysis", "Recurrent AKI / TMA episodes", "Low complement (C3/C4)", "Cytopaenia (low blood counts)"],
    screeningTests: [
      "Full blood count + blood film (fragmented RBCs)",
      "LDH, haptoglobin, reticulocyte count",
      "Coagulation (APTT, PT, fibrinogen) — to exclude TTP/DIC",
      "ADAMTS13 activity — send BEFORE plasma therapy",
      "Complement panel: C3, C4, CH50, AH50",
      "Anti-Factor H (CFH) antibody titres",
      "Complement genetic panel (CFH, CFI, CFB, C3, MCP/CD46, THBD, CFHR1–5)",
      "Stool STEC / Shiga toxin PCR — exclude STEC-HUS",
      "Urine analysis + UPCR",
      "Renal ultrasound",
    ],
    page: "RareDiseaseModule",
    urgency: "urgent",
  },
  {
    id: "cystinosis",
    name: "Cystinosis",
    gene: "CTNS (AR)",
    ageGroups: ["infant", "child", "adolescent"],
    symptoms: ["Proximal tubulopathy / Fanconi syndrome", "Polyuria / Polydipsia", "Failure to thrive / Growth failure", "Cystine crystals / Photophobia"],
    screeningTests: [
      "Leukocyte cystine level (diagnostic gold standard >0.2 nmol ½Cys/mg protein)",
      "CTNS gene sequencing",
      "Slit-lamp: corneal cystine crystals",
      "Fanconi screen: serum glucose, phosphate, K, HCO3, uric acid",
      "Urine amino acids (generalised aminoaciduria)",
      "Urine glucose (glycosuria with normal blood glucose)",
      "TRP (tubular reabsorption of phosphate) + TmP/GFR",
      "GFR estimation (Schwartz)",
      "Thyroid function tests (older patients)",
    ],
    page: "RareDiseaseModule",
    urgency: "urgent",
  },
  {
    id: "alport",
    name: "Alport Syndrome",
    gene: "COL4A3/COL4A4 (AR/AD) or COL4A5 (X-linked)",
    ageGroups: ["child", "adolescent", "adult"],
    symptoms: ["Recurrent haematuria", "Hearing loss / Sensorineural", "Family history of kidney disease", "Proteinuria / Nephrotic syndrome"],
    screeningTests: [
      "Urine microscopy: dysmorphic RBCs, RBC casts",
      "Spot UPCR (progressive proteinuria)",
      "Audiogram: bilateral sensorineural hearing loss",
      "Ophthalmology: anterior lenticonus, dot-fleck maculopathy",
      "Serum creatinine + eGFR",
      "Family tree — three-generation pedigree",
      "COL4A3/A4/A5 gene panel (next-gen sequencing)",
      "Skin biopsy (collagen IV staining) or renal biopsy (EM: GBM thinning/splitting)",
    ],
    page: "RareDiseaseModule",
    urgency: "routine",
  },
  {
    id: "ph1",
    name: "Primary Hyperoxaluria Type 1",
    gene: "AGXT (AR)",
    ageGroups: ["infant", "child", "adolescent", "adult"],
    symptoms: ["Recurrent nephrolithiasis / Stones", "Recurrent AKI / TMA episodes", "Failure to thrive / Growth failure"],
    screeningTests: [
      "24h urine oxalate (>0.46 mmol/1.73m²/day) or spot urine oxalate:creatinine",
      "Plasma oxalate level (particularly in CKD stage 3+)",
      "AGXT gene sequencing (diagnostic)",
      "Urine calcium, citrate, glycolate, glycerate",
      "Renal ultrasound (nephrocalcinosis, stones)",
      "DMSA scan (functional renal assessment)",
      "Liver biopsy: AGXT enzyme assay if gene result equivocal",
      "Ophthal: retinal oxalate deposits if advanced",
    ],
    page: "RareDiseaseModule",
    urgency: "urgent",
  },
  {
    id: "nphp",
    name: "Nephronophthisis (NPHP)",
    gene: "NPHP1–21 panel (AR)",
    ageGroups: ["child", "adolescent"],
    symptoms: ["Polyuria / Polydipsia", "Failure to thrive / Growth failure", "Developmental delay / Regression"],
    screeningTests: [
      "Renal function: serum creatinine, eGFR (Schwartz)",
      "Urine concentrating ability (urine osmolality after fluid restriction)",
      "Renal ultrasound: increased echogenicity, corticomedullary cysts",
      "MRI brain: cerebellar vermis ('molar tooth sign' for Joubert syndrome)",
      "Ophthalmology: retinal dystrophy (Senior-Løken syndrome)",
      "NPHP gene panel (next-gen sequencing)",
      "Hepatic function tests (hepatic involvement in some syndromes)",
      "Bone survey (skeletal dysplasia screening)",
    ],
    page: "RareDiseaseModule",
    urgency: "routine",
  },
  {
    id: "arpkd",
    name: "ARPKD (Autosomal Recessive PKD)",
    gene: "PKHD1 (AR)",
    ageGroups: ["infant", "child", "adolescent"],
    symptoms: ["Failure to thrive / Growth failure", "Polyuria / Polydipsia", "Family history of kidney disease"],
    screeningTests: [
      "Renal ultrasound: bilaterally enlarged echogenic kidneys with loss of corticomedullary differentiation",
      "Liver ultrasound: periportal fibrosis, dilated bile ducts (Caroli disease)",
      "PKHD1 gene sequencing",
      "Liver function tests + coagulation (hepatic fibrosis)",
      "Blood pressure monitoring",
      "Serum creatinine + eGFR",
      "Echocardiography (hypertension-related cardiac changes)",
    ],
    page: "RareDiseaseModule",
    urgency: "routine",
  },
];

const AGE_GROUPS = [
  { label: "Neonate (0–28d)", value: "infant" },
  { label: "Infant (1–12m)", value: "infant" },
  { label: "Child (1–12y)", value: "child" },
  { label: "Adolescent (>12y)", value: "adolescent" },
  { label: "Adult (>18y)", value: "adult" },
];

const URGENCY_COLORS = {
  urgent: "bg-red-100 text-red-800 border-red-200",
  routine: "bg-green-100 text-green-800 border-green-200",
};

export default function RareDiagnosticChecklist() {
  const [selectedAge, setSelectedAge] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const toggleSymptom = (s) => {
    setSelectedSymptoms(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
    setShowResults(false);
  };

  const suggestions = useMemo(() => {
    if (selectedSymptoms.length === 0) return [];
    return RARE_DISEASE_DB
      .filter(d => {
        const ageMatch = !selectedAge || d.ageGroups.includes(selectedAge);
        const symptomMatch = selectedSymptoms.filter(s => d.symptoms.includes(s)).length;
        return ageMatch && symptomMatch > 0;
      })
      .map(d => ({
        ...d,
        matchCount: selectedSymptoms.filter(s => d.symptoms.includes(s)).length,
      }))
      .sort((a, b) => b.matchCount - a.matchCount);
  }, [selectedAge, selectedSymptoms]);

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-r from-violet-600 to-indigo-700 border-0 text-white">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Dna className="w-8 h-8 opacity-90" />
            <div>
              <h2 className="font-bold text-base">Rare Disease Diagnostic Checklist</h2>
              <p className="text-violet-200 text-xs">Symptom-based screening → pathway navigation</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Age selector */}
      <Card>
        <CardHeader className="py-3 px-4 border-b">
          <CardTitle className="text-sm">1. Patient Age Group</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <div className="flex flex-wrap gap-2">
            {AGE_GROUPS.map((ag, i) => (
              <button
                key={i}
                onClick={() => setSelectedAge(ag.value === selectedAge ? "" : ag.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${selectedAge === ag.value ? "bg-violet-600 text-white border-violet-600" : "bg-white text-slate-600 border-slate-200 hover:border-violet-300"}`}
              >
                {ag.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Symptom selector */}
      <Card>
        <CardHeader className="py-3 px-4 border-b">
          <CardTitle className="text-sm">2. Select Presenting Symptoms</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <div className="flex flex-wrap gap-2">
            {SYMPTOM_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => toggleSymptom(s)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${selectedSymptoms.includes(s) ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"}`}
              >
                {selectedSymptoms.includes(s) && <CheckCircle className="w-3 h-3" />}
                {s}
              </button>
            ))}
          </div>

          {selectedSymptoms.length > 0 && (
            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-slate-500">{selectedSymptoms.length} symptom(s) selected</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setSelectedSymptoms([]); setShowResults(false); }}>
                  Clear
                </Button>
                <Button size="sm" className="h-7 text-xs bg-violet-600 hover:bg-violet-700" onClick={() => setShowResults(true)}>
                  <Search className="w-3 h-3 mr-1" /> Suggest Diagnoses
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {showResults && (
        <div className="space-y-3">
          {suggestions.length === 0 ? (
            <Alert className="bg-amber-50 border-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <AlertDescription className="text-xs text-amber-800">
                No specific rare disease patterns matched. Consider broadening symptom selection or consult a geneticist.
              </AlertDescription>
            </Alert>
          ) : (
            suggestions.map((disease) => (
              <Card key={disease.id} className="border border-violet-200">
                <CardHeader className="py-3 px-4 border-b bg-violet-50">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <CardTitle className="text-sm text-violet-900">{disease.name}</CardTitle>
                      <p className="text-xs text-slate-500 mt-0.5">Gene: {disease.gene}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs border ${URGENCY_COLORS[disease.urgency]}`}>
                        {disease.urgency === "urgent" ? "Urgent workup" : "Routine workup"}
                      </Badge>
                      <Badge className="bg-violet-600 text-white text-xs">
                        {disease.matchCount} match{disease.matchCount !== 1 ? "es" : ""}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div>
                    <p className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                      <FlaskConical className="w-3.5 h-3.5 text-violet-600" /> Recommended Screening Tests
                    </p>
                    <div className="space-y-1">
                      {disease.screeningTests.map((test, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                          <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{test}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Link to={createPageUrl(disease.page)}>
                    <Button size="sm" className="w-full h-8 text-xs bg-violet-600 hover:bg-violet-700 mt-2">
                      <Dna className="w-3 h-3 mr-1.5" /> View Full Pathway: {disease.name}
                      <ChevronRight className="w-3 h-3 ml-auto" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      <Alert className="bg-blue-50 border-blue-200">
        <AlertTriangle className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-xs text-blue-800">
          <strong>Educational tool only.</strong> Rare disease diagnosis requires specialist input, metabolic laboratory testing, and genetic confirmation. Refer to a pediatric nephrologist / metabolic geneticist for all suspected cases.
        </AlertDescription>
      </Alert>
    </div>
  );
}