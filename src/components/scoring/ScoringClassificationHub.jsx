import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown, ChevronRight, AlertTriangle, BookOpen, Activity, CheckCircle, Info } from "lucide-react";

const SCORES = [
  // Nephrology
  {
    id: "kdigo-aki", name: "KDIGO AKI Staging", specialty: "Nephrology", category: "AKI",
    purpose: "Standardize AKI severity for clinical decisions and prognosis",
    when_to_use: "Any patient with rising creatinine or reduced urine output in acute setting",
    criteria: [
      { stage: "Stage 1", creatinine: "↑Cr ≥0.3 mg/dL in 48h OR ×1.5-1.9 from baseline", urine: "UO <0.5 mL/kg/h for 6-12h" },
      { stage: "Stage 2", creatinine: "Cr ×2.0-2.9 from baseline", urine: "UO <0.5 mL/kg/h for ≥12h" },
      { stage: "Stage 3", creatinine: "Cr ×3.0 OR ≥4.0 mg/dL OR RRT initiated", urine: "UO <0.3 mL/kg/h for ≥24h OR anuria ≥12h" },
    ],
    interpretation: "Higher stage = worse prognosis. Stage 3 = high mortality, RRT likely. Pediatric mortality: Stage 1 ~5%, Stage 3 ~30-50% in ICU.",
    pitfalls: ["Baseline creatinine often unavailable — use age-based normative values", "UO criteria may be missed if catheterized late", "Low muscle mass (malnourished, premature) = creatinine falsely low"],
    pediatric_caveats: ["Use weight-based UO criterion carefully in neonates", "pRIFLE uses eGFR decline instead of absolute creatinine for children"],
    evidence: "KDIGO AKI Guideline 2012 — Level 1A recommendations",
    linked_pathways: ["AKI Pathway", "RRT Decision Support", "Fluid Management"]
  },
  {
    id: "ckd-staging", name: "CKD Staging (KDIGO)", specialty: "Nephrology", category: "CKD",
    purpose: "Classify CKD severity to guide monitoring frequency and treatment intensity",
    when_to_use: "All patients with eGFR <60 or kidney damage markers >3 months",
    criteria: [
      { stage: "G1", creatinine: "eGFR ≥90 mL/min/1.73m²", urine: "Kidney damage marker present (proteinuria, hematuria, structural)" },
      { stage: "G2", creatinine: "eGFR 60-89", urine: "Kidney damage marker present" },
      { stage: "G3a", creatinine: "eGFR 45-59", urine: "Any albuminuria category" },
      { stage: "G3b", creatinine: "eGFR 30-44", urine: "Any albuminuria category" },
      { stage: "G4", creatinine: "eGFR 15-29", urine: "Prepare for RRT" },
      { stage: "G5", creatinine: "eGFR <15 or dialysis", urine: "Kidney failure" },
    ],
    interpretation: "G3b-G4 = high CKD progression risk. Combine with albuminuria category (A1/A2/A3) for full heat-map risk stratification.",
    pitfalls: ["GFR estimations less accurate in extremes of age/body size", "Acute on chronic CKD may be misclassified as AKI", "Children: use Schwartz formula eGFR not adult CKD-EPI"],
    pediatric_caveats: ["CAKUT is most common cause of pediatric CKD", "Growth retardation and bone disease appear earlier in children", "Transition care planning starts at G4"],
    evidence: "KDIGO CKD Guideline 2012, updated 2022",
    linked_pathways: ["CKD Management", "CKD-MBD", "Anemia Management", "RRT Planning"]
  },
  {
    id: "isn-rps-ln", name: "ISN/RPS Lupus Nephritis Classification", specialty: "Nephrology", category: "Glomerular",
    purpose: "Classify lupus nephritis histology to guide immunosuppression intensity",
    when_to_use: "After renal biopsy in SLE patient with nephritis features",
    criteria: [
      { stage: "Class I", creatinine: "Minimal mesangial LN", urine: "Mesangial deposits only on IF/EM" },
      { stage: "Class II", creatinine: "Mesangial proliferative LN", urine: "Mesangial hypercellularity + deposits" },
      { stage: "Class III", creatinine: "Focal LN (<50% glomeruli involved)", urine: "Active (A) or chronic (C) lesions" },
      { stage: "Class IV", creatinine: "Diffuse LN (≥50% glomeruli)", urine: "Most severe — segmental (S) or global (G)" },
      { stage: "Class V", creatinine: "Membranous LN", urine: "Subepithelial immune deposits; may coexist with III/IV" },
      { stage: "Class VI", creatinine: "Advanced sclerosing LN", urine: "≥90% global glomerulosclerosis — chronic irreversible" },
    ],
    interpretation: "Class III/IV requires aggressive immunosuppression. Class V may present as nephrotic syndrome. Class VI indicates CKD/ESRD.",
    pitfalls: ["Activity/chronicity indices essential alongside class", "Class III vs IV distinction important for intensity of treatment", "Repeat biopsy may show class transformation"],
    pediatric_caveats: ["Class IV most common in pediatric SLE (40-60%)", "Higher activity indices in children", "Close monitoring for steroid side effects in growing children"],
    evidence: "ISN/RPS Classification 2003, revised 2018 (Bajema criteria)",
    linked_pathways: ["Lupus Nephritis Pathway", "SLE Monitoring", "SLEDAI Calculator"]
  },
  {
    id: "oxford-igan", name: "Oxford IgAN MEST-C Classification", specialty: "Nephrology", category: "Glomerular",
    purpose: "Histological classification of IgA nephropathy — prognostication and treatment decisions",
    when_to_use: "After biopsy confirming IgA nephropathy on immunofluorescence",
    criteria: [
      { stage: "M (Mesangial hypercellularity)", creatinine: "M0 = score <0.5 | M1 = score ≥0.5", urine: "Each HPF: >4 mesangial cells = hypercellular" },
      { stage: "E (Endocapillary hypercellularity)", creatinine: "E0 = absent | E1 = present", urine: "Leukocytes + mesangial cells filling lumen" },
      { stage: "S (Segmental sclerosis)", creatinine: "S0 = absent | S1 = present", urine: "Any portion of tuft sclerosed" },
      { stage: "T (Tubular atrophy/interstitial fibrosis)", creatinine: "T0 = 0-25% | T1 = 26-50% | T2 = >50%", urine: "Proportion of cortex affected" },
      { stage: "C (Crescents)", creatinine: "C0 = none | C1 = 1-25% | C2 = >25%", urine: "Cellular or fibrocellular crescents" },
    ],
    interpretation: "T2 and C2 indicate poor prognosis. M1, E1 predict treatment responsiveness to steroids. S1 predicts CKD progression.",
    pitfalls: ["Requires experienced nephropathologist", "At least 8 glomeruli recommended for reliable scoring"],
    pediatric_caveats: ["IgAN in children often has good prognosis if E1 prominent (steroid-responsive)", "Crescents more likely to progress in pediatric IgAN"],
    evidence: "Oxford Classification 2009 (VALIGA validation 2014)",
    linked_pathways: ["IgAN Pathway", "Proteinuria Management"]
  },
  // Rheumatology
  {
    id: "ilar-jia", name: "ILAR JIA Classification", specialty: "Rheumatology", category: "JIA",
    purpose: "Classify juvenile idiopathic arthritis subtypes to guide treatment and prognosis",
    when_to_use: "Arthritis >6 weeks onset before age 16 with no other identifiable cause",
    criteria: [
      { stage: "Oligoarticular (persistent)", creatinine: "≤4 joints; persistent ≤4 throughout", urine: "ANA often positive; high uveitis risk" },
      { stage: "Oligoarticular (extended)", creatinine: "≤4 first 6 months, then >4", urine: "Worse prognosis than persistent" },
      { stage: "Polyarticular RF negative", creatinine: "≥5 joints; RF negative", urine: "ANA may be positive; uveitis risk" },
      { stage: "Polyarticular RF positive", creatinine: "≥5 joints; RF positive on 2 tests ≥3 months apart", urine: "Adult RA equivalent; erosive disease" },
      { stage: "Systemic (sJIA)", creatinine: "Arthritis + fever ≥2 weeks + 1 of: rash, lymphadenopathy, hepatosplenomegaly, serositis", urine: "Highest MAS risk; IL-1/IL-6 pathway dominant" },
      { stage: "Psoriatic", creatinine: "Arthritis + psoriasis OR 2 of: dactylitis, nail pitting, first degree relative with psoriasis", urine: "" },
      { stage: "Enthesitis-related", creatinine: "Arthritis + enthesitis OR arthritis/enthesitis + 2 minor criteria", urine: "HLA-B27 often positive; sacroiliac involvement" },
    ],
    interpretation: "Subtype determines treatment choice and prognosis. sJIA requires IL-1/IL-6 blockade. Oligoarticular needs aggressive uveitis surveillance.",
    pitfalls: ["ILAR classification being revised to PRINTO criteria (2019)", "Undifferentiated JIA = significant group not fitting any category", "Early sJIA may lack arthritis — diagnosis may lag"],
    pediatric_caveats: ["Uveitis screening mandatory for all JIA: every 3-6 months", "RF+ polyarticular: needs early aggressive DMARDs to prevent erosions"],
    evidence: "ILAR Classification 2001 (Petty criteria); PRINTO revision 2019",
    linked_pathways: ["JIA Pathway", "JADAS Calculator", "Uveitis Monitoring"]
  },
  {
    id: "sledai", name: "SLEDAI-2K Interpretation", specialty: "Rheumatology", category: "SLE",
    purpose: "Quantify SLE disease activity to guide treatment decisions and trial eligibility",
    when_to_use: "At every SLE clinic visit; in clinical trials; to define flare and remission",
    criteria: [
      { stage: "Seizure (8)", creatinine: "Recent onset, exclude metabolic/drug causes", urine: "" },
      { stage: "Psychosis (8)", creatinine: "Severe disturbance in perception/reality", urine: "" },
      { stage: "Organic brain syndrome (8)", creatinine: "Altered mental function with disorientation, memory impairment", urine: "" },
      { stage: "Visual disturbance (8)", creatinine: "SLE retinal change or optic neuritis", urine: "" },
      { stage: "Lupus headache (8)", creatinine: "Severe persistent migraine not responsive to narcotics", urine: "" },
      { stage: "Vasculitis (8)", creatinine: "Ulceration, gangrene, tender finger nodules, biopsy evidence", urine: "" },
      { stage: "Arthritis (4)", creatinine: "≥2 joints with pain, swelling, or effusion", urine: "" },
      { stage: "Myositis (4)", creatinine: "Proximal muscle pain/weakness + elevated CK", urine: "" },
      { stage: "Urinary casts (4)", creatinine: "Heme-granular, RBC casts", urine: "" },
      { stage: "Hematuria (4)", creatinine: ">5 RBC/HPF excluding infection/stones", urine: "" },
      { stage: "Proteinuria (4)", creatinine: ">0.5g/24h new onset or increase", urine: "" },
      { stage: "Pyuria (4)", creatinine: ">5 WBC/HPF excluding infection", urine: "" },
      { stage: "Malar rash/mucosal ulcers (2 each)", creatinine: "Active rash or oral/nasal ulcers", urine: "" },
      { stage: "Alopecia (2)", creatinine: "Abnormal patchy or diffuse hair loss", urine: "" },
      { stage: "Pleuritis/pericarditis (2)", creatinine: "Pleuritic chest pain or pericardial rub/effusion", urine: "" },
      { stage: "Low complement (2)", creatinine: "C3/C4 below lower limit of normal", urine: "" },
      { stage: "High anti-dsDNA (2)", creatinine: ">25% binding (Farr assay) or above lab normal", urine: "" },
      { stage: "Fever (1)", creatinine: ">38°C after exclusion of infection", urine: "" },
      { stage: "Thrombocytopenia (1)", creatinine: "<100,000 platelets after exclusion of drugs", urine: "" },
      { stage: "Leukopenia (1)", creatinine: "<3000 WBC after exclusion of drugs", urine: "" },
    ],
    interpretation: "Score 0 = remission. 1-5 = mild activity. 6-10 = moderate. >10 = high activity. Renal domain scores (urinary casts, hematuria, proteinuria, pyuria) key for nephritis activity.",
    pitfalls: ["Does not measure cumulative damage (use SLICC Damage Index)", "Score based on past 10 days only", "Physician global assessment needed alongside SLEDAI"],
    pediatric_caveats: ["Children tend to have higher SLEDAI scores at presentation", "Neuropsychiatric lupus (NPSLE) features get highest scores", "Regular monitoring q3 months in pediatric SLE"],
    evidence: "SLEDAI-2K Bombardier 1992; updated Gladman 2002",
    linked_pathways: ["SLE Pathway", "Lupus Nephritis", "ISN/RPS Classification"]
  },
  {
    id: "jadas", name: "JADAS-27 Score", specialty: "Rheumatology", category: "JIA",
    purpose: "Composite measure of JIA disease activity integrating physician, parent and lab assessments",
    when_to_use: "All JIA clinic visits; monitoring treatment response; defining flare/remission",
    criteria: [
      { stage: "Physician Global Assessment (PGA)", creatinine: "0-10 VAS scale (0=inactive disease, 10=maximum activity)", urine: "" },
      { stage: "Parent/Patient Global Assessment (PaGA)", creatinine: "0-10 VAS scale", urine: "" },
      { stage: "Active Joint Count (AJC)", creatinine: "27 joints assessed: cervical spine, temporomandibular, sternoclavicular, acromioclavicular, shoulders, elbows, wrists, MCPs 1-5, PIPs, hips, knees, ankles", urine: "" },
      { stage: "ESR (normalized)", creatinine: "(ESR-20)/10 — if ESR <20: score=0; if ESR >120: score=10", urine: "" },
    ],
    interpretation: "Sum of 4 components. Oligoarticular JIA: Remission <1, minimal activity 1-2, moderate 2-4.5, high >4.5. Polyarticular: Remission <1, moderate 3.8-8.5, high >8.5.",
    pitfalls: ["27-joint count differs from standard 71/73-joint count", "ESR may be normal in sJIA during systemic phase", "PGA is subjective — standardize training"],
    pediatric_caveats: ["Age-appropriate pain assessment tools for PaGA in young children", "JADAS cutoffs validated for oligoarticular and polyarticular — less data for sJIA"],
    evidence: "Consolaro et al. Arthritis Rheum 2009",
    linked_pathways: ["JIA Pathway", "Biologics Decision Support"]
  },
  {
    id: "mas-criteria", name: "MAS 2016 Classification Criteria", specialty: "Rheumatology", category: "MAS",
    purpose: "Diagnose MAS complicating sJIA for early aggressive treatment",
    when_to_use: "Febrile sJIA patient with clinical deterioration, falling ESR, or cytopenias",
    criteria: [
      { stage: "Required: Febrile sJIA (known or suspected)", creatinine: "", urine: "" },
      { stage: "Ferritin >684 ng/mL", creatinine: "Sensitivity 90%, specificity 82%", urine: "" },
      { stage: "ANY 2 of:", creatinine: "", urine: "" },
      { stage: "Platelet ≤181×10⁹/L", creatinine: "Falling platelet in context of sJIA = danger sign", urine: "" },
      { stage: "AST >48 U/L", creatinine: "Hepatic involvement", urine: "" },
      { stage: "Triglycerides >156 mg/dL", creatinine: "Lipid dysregulation from macrophage activation", urine: "" },
      { stage: "Fibrinogen ≤360 mg/dL", creatinine: "Consumed in MAS (unlike sepsis where it rises)", urine: "" },
    ],
    interpretation: "Ferritin >684 + any 2 criteria = MAS. Ferritin >10,000 = very high specificity. Trend is more important than single value — rapid rise = MAS trigger.",
    pitfalls: ["Ferritin can be elevated in active sJIA without MAS", "MAS criteria developed for sJIA — use judgment in other rheumatological conditions", "MAS can be triggered by infections — viral is commonest trigger"],
    pediatric_caveats: ["In young children with sJIA + MAS, Anakinra (IL-1 blocker) is life-saving", "Primary HLH must be excluded especially in non-sJIA context"],
    evidence: "Ravelli et al. Arthritis Rheumatol 2016",
    linked_pathways: ["MAS Protocol", "sJIA Management", "ICU Escalation Criteria"]
  },
];

const SPECIALTY_COLORS = {
  Nephrology: "bg-blue-100 text-blue-800",
  Rheumatology: "bg-purple-100 text-purple-800",
};

export default function ScoringClassificationHub() {
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("All");
  const [selected, setSelected] = useState(null);
  const [openSection, setOpenSection] = useState("criteria");

  const filtered = SCORES.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.category.toLowerCase().includes(search.toLowerCase());
    const matchSpecialty = specialty === "All" || s.specialty === specialty;
    return matchSearch && matchSpecialty;
  });

  const score = selected ? SCORES.find(s => s.id === selected) : null;

  const SECTIONS = [
    { key: "criteria", label: "Criteria / Stages" },
    { key: "interpretation", label: "Interpretation" },
    { key: "pitfalls", label: "Pitfalls" },
    { key: "pediatric_caveats", label: "Pediatric Caveats" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input className="pl-9 bg-white" placeholder="Search scores (SLEDAI, JADAS, KDIGO AKI…)" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {["All", "Nephrology", "Rheumatology"].map(s => (
          <button key={s} onClick={() => setSpecialty(s)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all flex-shrink-0 ${specialty === s ? "bg-slate-800 text-white border-slate-800" : "bg-white border-slate-200 text-slate-600"}`}>{s}</button>
        ))}
      </div>

      {!score ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(s => (
            <Card key={s.id} className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-blue-400 group" onClick={() => { setSelected(s.id); setOpenSection("criteria"); }}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-bold text-sm text-slate-900 leading-tight">{s.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{s.category}</p>
                  </div>
                  <Badge className={`text-xs ml-2 flex-shrink-0 ${SPECIALTY_COLORS[s.specialty]}`}>{s.specialty}</Badge>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">{s.purpose}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {(s.linked_pathways || []).slice(0, 2).map(p => (
                    <span key={p} className="text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">{p}</span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div>
          <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-4">
            <ChevronRight className="w-4 h-4 rotate-180" /> Back to All Scores
          </button>

          <Card className="border-2 border-slate-200 mb-4">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{score.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={SPECIALTY_COLORS[score.specialty]}>{score.specialty}</Badge>
                    <Badge className="bg-slate-100 text-slate-600">{score.category}</Badge>
                  </div>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 mt-3">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs font-bold text-blue-800 mb-1">Purpose</p>
                  <p className="text-xs text-blue-700">{score.purpose}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs font-bold text-green-800 mb-1">When to Use</p>
                  <p className="text-xs text-green-700">{score.when_to_use}</p>
                </div>
              </div>
              <div className="mt-3 bg-amber-50 rounded-lg p-3">
                <p className="text-xs font-bold text-amber-800 mb-1">📚 Evidence Source</p>
                <p className="text-xs text-amber-700">{score.evidence}</p>
              </div>
            </CardContent>
          </Card>

          {/* Section tabs */}
          <div className="flex gap-1 mb-4 bg-slate-100 rounded-xl p-1">
            {SECTIONS.map(s => (
              <button key={s.key} onClick={() => setOpenSection(s.key)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${openSection === s.key ? "bg-white text-slate-900 shadow" : "text-slate-500"}`}>
                {s.label}
              </button>
            ))}
          </div>

          <Card>
            <CardContent className="p-4">
              {openSection === "criteria" ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left pb-2 text-slate-600">Stage / Criterion</th>
                        <th className="text-left pb-2 text-slate-600 pl-3">Definition</th>
                        <th className="text-left pb-2 text-slate-600 pl-3">Additional</th>
                      </tr>
                    </thead>
                    <tbody>
                      {score.criteria.map((c, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="py-2 font-semibold text-slate-800 whitespace-nowrap">{c.stage}</td>
                          <td className="py-2 pl-3 text-slate-700">{c.creatinine}</td>
                          <td className="py-2 pl-3 text-slate-600 italic">{c.urine}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : openSection === "interpretation" ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">{score.interpretation}</p>
                </div>
              ) : openSection === "pitfalls" ? (
                <div className="space-y-2">
                  {score.pitfalls.map((p, i) => (
                    <div key={i} className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-amber-800">{p}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {(score.pediatric_caveats || []).map((c, i) => (
                    <div key={i} className="flex items-start gap-2 bg-purple-50 border border-purple-200 rounded-lg px-3 py-2">
                      <Info className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-purple-800">{c}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {score.linked_pathways && (
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-xs text-slate-500 font-semibold">Linked Pathways:</span>
              {score.linked_pathways.map(p => (
                <Badge key={p} className="bg-slate-100 text-slate-700 text-xs">{p}</Badge>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}