import React, { useState, useMemo } from "react";
import { base44 } from "@/api/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Search, Dna, Loader2, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";

// Comprehensive syndrome database for dysmorphology screening
const SYNDROMES = [
  {
    name: "Down Syndrome (Trisomy 21)",
    genes: "Trisomy 21 (47,XX/XY,+21)",
    features: ["Upslanting palpebral fissures", "Epicanthal folds", "Single palmar crease", "Brushfield spots", "Short neck", "Sandal gap toe", "Hypotonia", "Flat facial profile", "Protruding tongue", "Small ears"],
    renal: "Structural anomalies in 3%",
    cardiac: "AVSD, VSD (40–50%)",
    inheritance: "Sporadic trisomy (95%), Robertsonian translocation (4%), Mosaic (1%)",
    investigations: "Karyotype — confirmatoryTest; ECHO; TFT; CBC (transient myeloproliferative disorder); Ophthalmology",
    management: "Early intervention (PT/OT/SLT), cardiac surgery if AVSD, thyroid monitoring, hearing assessment annually",
    tags: ["trisomy", "flat face", "hypotonia", "epicanthal", "single palmar crease", "upslanting", "congenital heart"]
  },
  {
    name: "Turner Syndrome (45,X)",
    genes: "45,X or mosaic 45X/46XX",
    features: ["Short stature", "Webbed neck (pterygium colli)", "Low posterior hairline", "Cubitus valgus", "Widely spaced nipples", "Primary amenorrhoea", "Lymphoedema of hands/feet at birth", "Shield chest"],
    renal: "Horseshoe kidney (10–15%), duplex collecting system, renal agenesis",
    cardiac: "Coarctation of aorta (20%), bicuspid aortic valve (30%)",
    inheritance: "Sporadic",
    investigations: "Karyotype (50–100 cells for mosaicism); ECHO; Renal USS; Gonadal USS; Hormones (FSH elevated); GH stimulation if short stature",
    management: "GH therapy (0.05 mg/kg/day); oestrogen from 11–13y; regular cardiac surveillance; BP monitoring for coarctation",
    tags: ["short stature", "webbed neck", "amenorrhoea", "coarctation", "horseshoe kidney", "lymphoedema", "45X"]
  },
  {
    name: "Noonan Syndrome",
    genes: "PTPN11 (50%), SOS1, RAF1, RIT1 — RAS-MAPK pathway",
    features: ["Hypertelorism", "Downslanting palpebral fissures", "Low-set posteriorly rotated ears", "Webbed neck (milder than Turner)", "Short stature", "Shield chest", "Pectus excavatum", "Cryptorchidism (males)", "Easy bruising"],
    renal: "Structural anomalies (10%)",
    cardiac: "Pulmonary stenosis (50–80%), HCM (20–30%), ASD",
    inheritance: "Autosomal dominant; de novo in 60%",
    investigations: "PTPN11 gene panel (NGS); ECHO; Coagulation profile (factor XI, XII deficiency); Platelet function; CBC",
    management: "GH therapy (licensed); cardiac surveillance; bleeding assessment before procedures",
    tags: ["hypertelorism", "downslanting", "pulmonary stenosis", "HCM", "short stature", "webbed neck", "PTPN11"]
  },
  {
    name: "Williams Syndrome",
    genes: "7q11.23 deletion (ELN gene)",
    features: ["Elfin facies — periorbital fullness, upturned nose, wide mouth", "Stellate iris pattern", "Hypercalcaemia in infancy", "Hoarse voice", "Hypersensitivity to sound", "Intellectual disability (mild-moderate)", "Overfriendly personality", "Prominent ears"],
    renal: "Nephrocalcinosis (hypercalcaemia-related)",
    cardiac: "Supravalvular aortic stenosis (SVAS) — pathognomonic, peripheral pulmonary stenosis",
    inheritance: "Sporadic deletion; AD if parent affected",
    investigations: "FISH or chromosomal microarray (7q11.23); ECHO for SVAS; Serum calcium; Renal USS; Ophthalmology (stellate iris)",
    management: "Avoid Vitamin D supplementation in infancy; SVAS surgery if severe; early speech therapy; behavioural support",
    tags: ["elfin facies", "SVAS", "supravalvular", "hypercalcaemia", "intellectual disability", "overfriendly", "deletion 7q11"]
  },
  {
    name: "Prader-Willi Syndrome",
    genes: "Paternal 15q11-q13 deletion OR maternal UPD15",
    features: ["Neonatal hypotonia (severe)", "Poor feeding in infancy", "Hyperphagia from 2–3y", "Obesity", "Short stature", "Small hands and feet", "Hypogonadism", "Almond-shaped eyes", "Downturned mouth"],
    renal: "Not a primary feature",
    cardiac: "Secondary to obesity",
    inheritance: "Imprinting disorder: 70% paternal deletion; 25% maternal UPD15; 5% imprinting defect",
    investigations: "Methylation analysis (diagnostic) — detects 99%; FISH for deletion; UPD studies; DNA microarray",
    management: "GH therapy (improves height + muscle mass); strict caloric restriction; behavioural management; gonadotrophin therapy",
    tags: ["hypotonia", "hyperphagia", "obesity", "short stature", "hypogonadism", "neonatal", "imprinting", "15q11"]
  },
  {
    name: "Angelman Syndrome",
    genes: "Maternal 15q11-q13 deletion OR paternal UPD15",
    features: ["Severe intellectual disability", "Absent/minimal speech", "Happy demeanour — easily provoked laughter", "Seizures (characteristic EEG pattern)", "Ataxic gait", "Microcephaly", "Fascination with water", "Tongue protrusion"],
    renal: "Not a primary feature",
    cardiac: "Not a primary feature",
    inheritance: "Imprinting: maternal deletion (70%); paternal UPD15 (7%); UBE3A mutation (11%)",
    investigations: "Methylation analysis; UBE3A sequencing; EEG (characteristic delta pattern); MRI brain; Epilepsy workup",
    management: "Seizure management (valproate, clonazepam — avoid carbamazepine); AAC devices for communication; physiotherapy",
    tags: ["seizures", "happy demeanour", "minimal speech", "microcephaly", "ataxia", "maternal deletion", "15q11", "UBE3A"]
  },
  {
    name: "Marfan Syndrome",
    genes: "FBN1 (fibrillin-1) — AD",
    features: ["Tall stature", "Arachnodactyly (long fingers)", "Arm span > height", "Pectus excavatum/carinatum", "High arched palate", "Myopia", "Ectopia lentis (lens subluxation — upward)", "Scoliosis", "Thumb sign (Steinberg)", "Walker-Murdoch wrist sign"],
    renal: "Not primary; renal artery involvement possible in aortic dissection",
    cardiac: "Aortic root dilatation (>95%), aortic dissection, mitral valve prolapse",
    inheritance: "Autosomal dominant; 25% de novo",
    investigations: "FBN1 gene sequencing + MLPA; ECHO (annual); MRI aorta; Ophthalmology (slit-lamp); Spine X-ray",
    management: "Beta-blocker (atenolol) or ARB (losartan) to slow aortic growth; elective aortic surgery when >5cm or rapidly growing; no contact sports",
    tags: ["tall", "arachnodactyly", "aortic", "ectopia lentis", "myopia", "scoliosis", "FBN1", "arm span", "marfan"]
  },
  {
    name: "VACTERL Association",
    genes: "Multifactorial; FOXF1, ZIC3, HOXD13 in some",
    features: ["V — Vertebral anomalies (hemivertebra, fused vertebrae)", "A — Anal atresia/anorectal malformations", "C — Cardiac defects (VSD most common)", "TE — Tracheo-Esophageal fistula", "R — Renal anomalies (50%)", "L — Limb defects (radial ray — thumb hypoplasia)"],
    renal: "Renal agenesis, horseshoe kidney, VURD syndrome (50% have renal anomalies)",
    cardiac: "VSD (40%), ASD, ToF",
    inheritance: "Sporadic (usually); maternal diabetes is risk factor",
    investigations: "Renal USS; VCUG; ECHO; Spinal X-rays; Oesophagogram; Chromosomal microarray to exclude trisomy",
    management: "Surgical correction of TE fistula and anorectal anomalies; renal follow-up; vertebral monitoring; limb orthopaedics",
    tags: ["vertebral", "anal atresia", "TEF", "renal", "radial ray", "limb", "cardiac", "VACTERL"]
  },
  {
    name: "22q11.2 Deletion (DiGeorge/VCFS)",
    genes: "22q11.2 deletion (TBX1)",
    features: ["Conotruncal heart defects", "Cleft palate (submucous)", "Hypocalcaemia (hypoparathyroidism)", "Immune deficiency (thymus hypoplasia)", "Characteristic facies: long face, tubular nose, small ears", "Learning difficulties", "Psychiatric disorders (schizophrenia risk 25%)"],
    renal: "Renal anomalies in 37%: duplex, aplasia, horseshoe",
    cardiac: "TOF (17%), truncus arteriosus, interrupted aortic arch — ALL conotruncal defects",
    inheritance: "AD; 90% de novo deletion; FISH detects 95%",
    investigations: "FISH (22q11.2) or chromosomal microarray; ECHO; Ca2+/PTH; Immunology (CD3/CD4/CD8 T cells); Renal USS; Developmental assessment",
    management: "Ca2+ supplementation; cardiac surgery; speech therapy (velopharyngeal insufficiency); immune monitoring; psychiatric surveillance from adolescence",
    tags: ["conotruncal", "hypocalcaemia", "DiGeorge", "TOF", "immune deficiency", "cleft palate", "22q11", "long face"]
  },
  {
    name: "Beckwith-Wiedemann Syndrome",
    genes: "11p15.5 region — IGF2 overexpression/H19 loss; KCNQ1OT1; CDKN1C",
    features: ["Macroglossia", "Macrosomia (large birth weight)", "Omphalocele/exomphalos", "Ear creases/pits", "Hemihypertrophy", "Hypoglycaemia (neonatal, hyperinsulinaemic)", "Organomegaly (liver, spleen, kidneys)"],
    renal: "Enlarged echogenic kidneys; medullary sponge kidney; Wilms tumour risk (5%); hepatoblastoma risk",
    cardiac: "Cardiomyopathy (rare)",
    inheritance: "Imprinting disorder; 85% sporadic; 15% familial",
    investigations: "Methylation analysis (11p15); USS surveillance for Wilms (q3 months until age 8); AFP (hepatoblastoma until 4y); Insulin/glucose for hypoglycaemia",
    management: "Neonatal hypoglycaemia management; tongue reduction surgery if severe macroglossia; Wilms tumour surveillance; hemihypertrophy monitoring",
    tags: ["macroglossia", "macrosomia", "omphalocele", "Wilms", "hemihypertrophy", "hypoglycaemia", "11p15", "hepatoblastoma"]
  },
  {
    name: "Kabuki Syndrome",
    genes: "KMT2D (70%), KDM6A (5%) — histone methylation",
    features: ["Long palpebral fissures with ectropion of lower eyelid", "Broad nasal tip with depressed nasal bridge", "Large prominent ears", "Persistent fingertip pads", "Short stature", "Mild-moderate intellectual disability", "Feeding difficulties in infancy", "Scoliosis"],
    renal: "Renal anomalies (25%) — duplex, ectopic",
    cardiac: "Cardiac defects (30–50%) — ASD, VSD, CoA",
    inheritance: "AD; KMT2D mostly de novo",
    investigations: "KMT2D/KDM6A gene panel; Renal USS; ECHO; Ophthalmology; Developmental assessment",
    management: "GH therapy (short stature); cardiac management; early intervention; feeding support; scoliosis monitoring",
    tags: ["long palpebral fissures", "persistent fingertip pads", "intellectual disability", "KMT2D", "renal anomalies", "cardiac", "short stature"]
  },
  {
    name: "Alport Syndrome",
    genes: "COL4A5 (X-linked, 80%), COL4A3/COL4A4 (AR, AD, 20%)",
    features: ["Haematuria (persistent microscopic from childhood)", "Progressive CKD → ESRD", "Sensorineural hearing loss (high frequency)", "Anterior lenticonus (pathognomonic)", "Macular flecks", "Family history of CKD/dialysis"],
    renal: "Thinning of GBM → splitting/lamellation on EM; FSGS on LM; Type IV collagen loss on IF",
    cardiac: "Aortic aneurysm (rare — HANAC syndrome)",
    inheritance: "X-linked (XLA variant); AR; AD",
    investigations: "Urine dipstick + microscopy; Audiometry; Slit-lamp for lenticonus; COL4A5/A3/A4 gene panel; Skin biopsy (alpha-5 COL4 IF); Renal biopsy with EM",
    management: "ACEi/ARB (delay ESRD); hearing aids; slit-lamp annually; transplant (recurrence if donor affected); genetic counselling for female carriers",
    tags: ["haematuria", "hearing loss", "lenticonus", "COL4", "CKD", "family history", "thinning GBM", "X-linked"]
  },
];

function SyndromeCard({ syndrome }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 text-left">
        <div>
          <p className="text-sm font-bold text-indigo-900">{syndrome.name}</p>
          <p className="text-xs text-indigo-600 mt-0.5">{syndrome.genes}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-indigo-100 text-indigo-700 text-xs border-0">{syndrome.inheritance.split(";")[0].split("(")[0].trim()}</Badge>
          {open ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
        </div>
      </button>

      {open && (
        <div className="p-4 space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-bold text-slate-700 mb-1.5">🧬 Key Features:</p>
              <ul className="space-y-0.5">
                {syndrome.features.map((f, i) => (
                  <li key={i} className="text-xs text-slate-600 flex gap-1.5">
                    <span className="text-indigo-400 font-bold flex-shrink-0">•</span>{f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-2">
              <div className="bg-red-50 rounded-lg p-2.5 border border-red-100">
                <p className="text-xs font-bold text-red-700">🫀 Cardiac: <span className="font-normal">{syndrome.cardiac}</span></p>
              </div>
              <div className="bg-blue-50 rounded-lg p-2.5 border border-blue-100">
                <p className="text-xs font-bold text-blue-700">🫘 Renal: <span className="font-normal">{syndrome.renal}</span></p>
              </div>
              <div className="bg-amber-50 rounded-lg p-2.5 border border-amber-100">
                <p className="text-xs font-bold text-amber-700">🧬 Inheritance: <span className="font-normal">{syndrome.inheritance}</span></p>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200">
            <p className="text-xs font-bold text-slate-700">🔬 Investigations:</p>
            <p className="text-xs text-slate-600 mt-0.5">{syndrome.investigations}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-2.5 border border-green-100">
            <p className="text-xs font-bold text-green-700">💊 Management:</p>
            <p className="text-xs text-green-800 mt-0.5">{syndrome.management}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function AISymptomMatcher({ onResult }) {
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);

  const match = async () => {
    if (!symptoms.trim()) return;
    setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Dysmorphology consultant. Patient features: "${symptoms}". 
Based on these dysmorphic features, list the top 5 most likely genetic syndromes.
For each syndrome provide: syndrome name, key matching features, confidence (high/medium/low), next investigation.`,
        response_json_schema: {
          type: "object",
          properties: {
            matches: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  syndrome: { type: "string" },
                  matching_features: { type: "array", items: { type: "string" } },
                  confidence: { type: "string" },
                  next_investigation: { type: "string" },
                }
              }
            }
          }
        }
      });
      onResult(result.matches || []);
    } catch (e) {
      // ignore
    }
    setLoading(false);
  };

  return (
    <div className="bg-gradient-to-br from-violet-50 to-indigo-50 border-2 border-violet-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Dna className="w-5 h-5 text-violet-600" />
        <p className="text-sm font-bold text-violet-900">AI Syndrome Matcher</p>
        <Badge className="bg-violet-100 text-violet-700 text-xs">Uses AI Credits</Badge>
      </div>
      <textarea
        value={symptoms}
        onChange={e => setSymptoms(e.target.value)}
        placeholder="Enter dysmorphic features, e.g.: upslanting eyes, single palmar crease, low nasal bridge, hypotonia, congenital heart defect..."
        rows={3}
        className="w-full px-3 py-2 text-sm rounded-lg border border-violet-300 bg-white focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
      />
      <Button onClick={match} disabled={loading || !symptoms.trim()}
        className="w-full bg-violet-600 hover:bg-violet-700 text-white h-9 text-sm">
        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analysing…</> : <><Dna className="w-4 h-4 mr-2" />Match Syndrome</>}
      </Button>
    </div>
  );
}

export default function DysmorphologyScreeningTool() {
  const [search, setSearch] = useState("");
  const [aiResults, setAiResults] = useState(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return SYNDROMES;
    return SYNDROMES.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.features.some(f => f.toLowerCase().includes(q)) ||
      s.genes.toLowerCase().includes(q) ||
      s.tags.some(t => t.toLowerCase().includes(q)) ||
      s.renal.toLowerCase().includes(q) ||
      s.cardiac.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 to-purple-700 rounded-2xl p-5 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
            <Dna className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Dysmorphology Screening Tool</h1>
            <p className="text-indigo-100 text-sm">Search & identify syndromes by dysmorphic features — {SYNDROMES.length} syndromes in database</p>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by feature, syndrome name, gene, inheritance (e.g. 'upslanting eyes', 'horseshoe kidney', 'PTPN11')"
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-white/90 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/50"
          />
        </div>
        {search && <p className="text-indigo-200 text-xs mt-2">{filtered.length} syndrome(s) match "{search}"</p>}
      </div>

      {/* AI Matcher */}
      <AISymptomMatcher onResult={setAiResults} />

      {/* AI Results */}
      {aiResults && (
        <div className="bg-violet-50 border-2 border-violet-200 rounded-xl p-4 space-y-2">
          <p className="text-sm font-bold text-violet-900">AI Syndrome Matches:</p>
          {aiResults.map((m, i) => (
            <div key={i} className={`rounded-lg border p-3 ${m.confidence === "high" ? "bg-green-50 border-green-200" : m.confidence === "medium" ? "bg-amber-50 border-amber-200" : "bg-slate-50 border-slate-200"}`}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-bold text-slate-700">{i + 1}. {m.syndrome}</span>
                <Badge className={`text-xs ${m.confidence === "high" ? "bg-green-100 text-green-800" : m.confidence === "medium" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700"}`}>{m.confidence} match</Badge>
              </div>
              <div className="flex flex-wrap gap-1 mb-1.5">
                {m.matching_features?.map((f, j) => <Badge key={j} variant="outline" className="text-xs">{f}</Badge>)}
              </div>
              <p className="text-xs text-indigo-700"><strong>Next step:</strong> {m.next_investigation}</p>
            </div>
          ))}
          <button onClick={() => setAiResults(null)} className="text-xs text-slate-400 hover:text-slate-600">Clear results</button>
        </div>
      )}

      {/* Syndrome List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <Dna className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No syndromes match your search</p>
          </div>
        ) : (
          filtered.map(s => <SyndromeCard key={s.name} syndrome={s} />)
        )}
      </div>

      <Alert className="bg-amber-50 border-amber-200">
        <AlertTriangle className="w-4 h-4 text-amber-600" />
        <AlertDescription className="text-xs text-amber-800">
          <strong>Educational tool only.</strong> Dysmorphology diagnosis requires expert clinical assessment. Always refer to a Clinical Geneticist for suspected genetic syndromes. This tool supports screening and education, not diagnosis.
        </AlertDescription>
      </Alert>
    </div>
  );
}