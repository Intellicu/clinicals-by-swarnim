import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import {
  BookOpen, ChevronRight, Loader2, Sparkles, CheckCircle,
  AlertTriangle, Brain, ArrowLeft, Eye, EyeOff, HelpCircle
} from "lucide-react";

const CASES = [
  {
    id: "ns-relapse",
    title: "NS Relapse — Steroid Resistant at Week 8",
    category: "Nephrotic Syndrome",
    difficulty: "Intermediate",
    color: "bg-blue-600",
    presentation: "A 5-year-old boy with known SSNS on prednisolone 2 mg/kg/day presents at week 8 with persistent 3+ proteinuria on dipstick. Serum albumin is 18 g/L. He had 2 prior relapses responding to steroids within 4 weeks. Blood pressure is 100/68 mmHg. Mother is worried about steroid side effects. Height velocity over 12 months has dropped to −1.2 SD.",
    questions: [
      "Define steroid resistance in nephrotic syndrome. Is this child now steroid-resistant?",
      "What investigations would you order next?",
      "What is your management plan for steroid-resistant NS?",
      "What do you tell the mother about the next steps?",
    ],
    answer_points: [
      "Steroid resistance: failure to achieve remission (trace/negative protein on dipstick) after 8 weeks of full-dose prednisolone (2 mg/kg/day × 4–6 weeks + alternate day steroids for 4 weeks per ISKDC). This child qualifies if no response by 8 weeks.",
      "Investigations: Kidney biopsy (essential — to identify histology and guide therapy). Check for genetic mutations: NPHS1, NPHS2, WT1, LAMB2 (especially important in children with steroid resistance). Secondary causes: ANA, anti-dsDNA, C3/C4, Hepatitis B. Creatinine, eGFR.",
      "Management of SRNS: Biopsy-guided. FSGS: Calcineurin inhibitor (tacrolimus/cyclosporine) + low-dose prednisolone. If genetic mutation: ACE inhibitor (renoprotection), avoid immunosuppression for AR mutations. Rituximab: for children not responding to CNI.",
      "Communication: Explain that further immunosuppressive medications are needed. Emphasize kidney biopsy is needed to guide treatment. Reassure about safety with appropriate monitoring. Discuss long-term renal risk."
    ],
    teaching_points: [
      "MCD is steroid-sensitive in 90% — SRNS more likely FSGS, IgAN, Diffuse mesangial proliferation",
      "NPHS2 (podocin) mutations: AR, early childhood onset, SRNS, do NOT respond to immunosuppression — ACE-I only",
      "Cyclosporine/tacrolimus response in FSGS: 70–75% with 6 months trial — monitor BP, creatinine, gingival hyperplasia",
      "Calcineurin inhibitors: trough tacrolimus 5–10 ng/mL in NS"
    ],
    pearl: "Genetic testing before biopsy in <1 year onset or sibling affected — changes management significantly."
  },
  {
    id: "rpgn",
    title: "RPGN — Rapidly Progressive GN",
    category: "Glomerular Disease",
    difficulty: "Advanced",
    color: "bg-red-600",
    presentation: "A 14-year-old girl presents with 3 weeks of increasing periorbital edema, dark urine, and breathlessness. Creatinine has risen from 0.6 to 3.2 mg/dL in 2 weeks. BP 160/105. Urine: 3+ protein, 3+ blood, RBC casts. Serum albumin 22 g/L. C3 35 mg/dL (low), C4 8 mg/dL (low). ANA 1:320, anti-dsDNA positive. USG: bilateral enlarged kidneys, increased echogenicity.",
    questions: [
      "What is your diagnosis and classification of RPGN?",
      "What investigations are urgent before starting treatment?",
      "What is the initial management?",
      "What are the indications for kidney biopsy in this case?",
    ],
    answer_points: [
      "Diagnosis: RPGN, likely Lupus Nephritis (WHO/ISN Class III or IV). RPGN classification: Type I (anti-GBM), Type II (immune complex — SLE, IgAN, PSGN, MPGN), Type III (pauci-immune — ANCA). This pattern (low C3+C4, ANA+, anti-dsDNA+) = immune complex, SLE.",
      "Urgent investigations: ANCA (PR3, MPO), anti-GBM antibodies, anti-dsDNA, complement (C3/C4/CH50), CBC with differential, renal biopsy (urgent — within 24–48h). Also: anti-phospholipid Ab, anti-Sm, anti-Ro/La (SLE panel). Urine protein: creatinine ratio.",
      "Initial management: High-dose IV methylprednisolone 500–1000 mg/1.73m²/day × 3 days (pulse). Then oral prednisolone 2 mg/kg/day (max 60 mg). Hydroxychloroquine (standard for SLE). If Class III/IV on biopsy: induction with MMF 1200 mg/m²/day (max 3g/day) OR cyclophosphamide IV pulses. Anti-hypertensive: ACE inhibitor (also antiproteinuric).",
      "Biopsy indications: rapidly declining GFR, proteinuria + hematuria in suspected GN, unknown diagnosis, suspected class III/IV lupus (changes treatment intensity). Do NOT delay biopsy >48h in RPGN."
    ],
    teaching_points: [
      "RPGN: >50% crescents on biopsy = severe GN requiring emergency treatment",
      "SLE nephritis: Class III (focal) and IV (diffuse) require induction + maintenance immunosuppression",
      "Anti-GBM disease (Goodpasture): NO crescentic GN + pulmonary hemorrhage — plasmapheresis + cyclophosphamide + steroids",
      "ANCA vasculitis: pauci-immune crescentic GN, no immune deposits on IF — IV methylprednisolone + rituximab or cyclophosphamide"
    ],
    pearl: "Both C3 and C4 low → SLE. Only C3 low → MPGN or PSGN. ANCA negative + anti-GBM negative + immune complex positive → Type II RPGN."
  },
  {
    id: "hus",
    title: "HUS — Hemolytic Uremic Syndrome",
    category: "AKI & ICU",
    difficulty: "Advanced",
    color: "bg-orange-600",
    presentation: "A 3-year-old girl presents with 5 days of bloody diarrhea. Last 48h: decreased urine output, pallor, and irritability. CBC: Hb 6.8 g/dL, platelets 42,000, WBC 11,000. Peripheral smear: numerous schistocytes. Creatinine 3.8 mg/dL. BP 138/92. LDH 1800 IU/L. Coombs test negative. Urine: 2+ blood, 1+ protein.",
    questions: [
      "What is the diagnosis and how do you confirm it?",
      "Should you give antibiotics? Why or why not?",
      "What is the immediate management?",
      "What are features that would suggest atypical HUS (aHUS)?",
    ],
    answer_points: [
      "Diagnosis: STEC-HUS (D+HUS). Triad: MAHA (schistocytes, low Hb, negative Coombs) + thrombocytopenia + AKI after bloody diarrhea. Confirm: Stool culture E.coli O157:H7 + STEC PCR (Shiga toxin 1 and 2), serology for Stx antibodies.",
      "NO ANTIBIOTICS in STEC-HUS: Antibiotics (especially fluoroquinolones) lyse E.coli → massive Shiga toxin release → worsens HUS severity, increases neurological complications. Only exception: if concurrent bacteremia with different organism.",
      "Management: Supportive care. Strict fluid balance (challenge: oliguria vs overload). Dialysis if: K >6.5, severe acidosis, oliguria + fluid overload, uremia. Antihypertensive. Transfuse RBCs if Hb <7 and symptomatic. Avoid platelet transfusion (worsens microvascular thrombosis). Eculizumab: NOT for D+HUS.",
      "aHUS features: No diarrheal prodrome, family history, age >3 years, recurrent episodes, low C3/factor H/factor I/MCP levels, incomplete recovery (persistent CKD), very severe presentation (ESRD at first episode)."
    ],
    teaching_points: [
      "D+HUS: E.coli O157:H7 produces Shiga toxin → endothelial damage in glomeruli → MAHA + thrombocytopenia + AKI",
      "Platelet transfusion CONTRAINDICATED in HUS — fuels microangiopathic process",
      "25–30% of D+HUS develop CKD — 5-year follow-up with GFR, BP, UPCR",
      "Eculizumab (anti-C5): ONLY for aHUS with complement pathway mutations, NOT D+HUS"
    ],
    pearl: "Coombs-NEGATIVE hemolytic anemia = MAHA. Schistocytes on smear clinch the diagnosis of HUS/TTP."
  },
  {
    id: "cakut-progression",
    title: "CAKUT — CKD Progression in Infant",
    category: "CAKUT & Urology",
    difficulty: "Intermediate",
    color: "bg-teal-600",
    presentation: "A 9-month-old male infant was diagnosed antenatally with bilateral hydronephrosis. MCUG at 6 weeks confirmed bilateral VUR Grade 4 and PUV (posterior urethral valve). Valve ablation done at day 3 of life. Now: creatinine 0.95 mg/dL, eGFR estimated 22 mL/min/1.73m² (bedside Schwartz). Weight gain poor. USG: bilateral cortical thinning. Na 131, K 5.8, HCO3 17 mEq/L. UPCR 0.6.",
    questions: [
      "What CKD stage is this child and what is the most likely trajectory?",
      "What complications are present and how do you manage each?",
      "What medications would you start?",
      "When do you refer for transplantation evaluation?",
    ],
    answer_points: [
      "CKD Stage G4 (eGFR 15–29). Post-PUV boys: 25–40% develop CKD G4/G5 by teenage years. Early CKD trajectory in infancy is a poor prognostic sign. Complications: hyponatremia (salt-losing nephropathy from tubular dysfunction), hyperkalemia, metabolic acidosis, poor growth.",
      "Complications management: Hyponatremia (salt-losing): NaCl supplementation 2–3 mmol/kg/day. Hyperkalemia: low potassium diet, check medications (avoid K-sparing diuretics). Metabolic acidosis (HCO3 17): NaHCO3 2 mEq/kg/day PO — acidosis worsens growth, bone disease, protein catabolism. Poor growth: assess caloric intake, consider NGT feeds if inadequate.",
      "Medications: NaHCO3 1–3 mEq/kg/day PO. NaCl 2–3 mmol/kg/day (salt supplementation). ACE inhibitor: use CAUTIOUSLY if proteinuric (UPCR 0.6 is concerning) — monitor K and creatinine closely. Phosphate binder if phosphate elevated. Calcitriol if PTH rising.",
      "Transplant evaluation: Start process when eGFR <20 mL/min/1.73m². Pre-emptive transplant (before dialysis) is ideal. In PUV: bladder assessment essential before transplant (bladder dysfunction may damage transplanted kidney). Minimum weight ~10 kg for pediatric transplant."
    ],
    teaching_points: [
      "PUV: #1 cause of severe obstructive uropathy in boys. Valve ablation is curative for obstruction but kidney dysplasia is irreversible",
      "Salt-losing nephropathy in CAKUT: give salt supplements (not restrict sodium) — tubular dysfunction prevents Na reabsorption",
      "Metabolic acidosis exacerbates growth failure, bone disease, protein catabolism — target HCO3 >22",
      "Bladder dysfunction in PUV: valve ablation + CIC if residual dysfunction — must document before transplant"
    ],
    pearl: "Post-PUV CKD: bilaterality, bilateral cortical thinning, early creatinine rise = poor prognostic triad."
  },
  {
    id: "ckd-dialysis",
    title: "CKD Progression to Dialysis — Adolescent",
    category: "CKD & Dialysis",
    difficulty: "Advanced",
    color: "bg-indigo-600",
    presentation: "A 14-year-old girl with Alport syndrome (X-linked, COLA4A5 mutation) presents with eGFR 14 mL/min/1.73m². She has bilateral sensorineural hearing loss. Height −2.5 SD. Recent labs: Hb 8.2 g/dL (TSAT 18%, ferritin 45), HCO3 14, phosphate 2.3 mmol/L, PTH 380 pg/mL. BP 142/96. She and her family want to avoid dialysis as long as possible.",
    questions: [
      "What are your immediate management priorities?",
      "What dialysis modality would you recommend and why?",
      "How would you manage her CKD-MBD?",
      "How do you counsel her and her family about the future, including transplantation?",
    ],
    answer_points: [
      "Immediate priorities: (1) BP: target <50th percentile with ACE inhibitor (also slows GFR decline in Alport). (2) Anemia: IV iron sucrose (TSAT <20%) → then EPO 100 u/kg SC 3×/week. Target Hb 10–12. (3) Acidosis: NaHCO3 2–3 mEq/kg/day — target HCO3 >22. (4) CKD-MBD: phosphate binder + calcitriol for PTH. (5) Growth: consider rhGH consultation (eGFR still >10, −2.5 SD).",
      "Dialysis modality: For adolescent in school: PD (peritoneal dialysis) allows home/school life flexibility, better quality of life, avoids AVF. APD (automated PD at night) preferred for teens. HD acceptable if PD not feasible. For Alport: transplant is definitive — living related donor (but X-linked: mothers are carriers, check heterozygous).",
      "CKD-MBD management: Phosphate restriction diet. Calcium carbonate with meals (phosphate binder). PTH 380 (target 70–300 in CKD G5): start active vitamin D (calcitriol 0.01–0.05 mcg/kg/day). If PTH remains high: cinacalcet (calcimimetic) consideration.",
      "Counseling: Alport = progressive to ESRD in X-linked (males 90% by 40 yrs; females later). Transplant is curative — excellent outcomes. Anti-GBM disease can occur in transplant (rare, COL4A5 protein expressed in graft — immune response in 5%). Living related donor: screen female relatives with COLA4A5 testing first. Hearing aids for sensorineural hearing loss."
    ],
    teaching_points: [
      "Alport syndrome: X-linked (most common), AR, AD. COL4A3/A4/A5 mutations → glomerular basement membrane defect",
      "Alport: hearing loss, lens abnormalities (anterior lenticonus), progressive hematuria → GN → ESRD",
      "EPO therapy: start when Hb <10 (CKD G5). Iron replete first (TSAT >20%, ferritin >100)",
      "CKD-MBD in dialysis: target PTH 2–9× ULN on dialysis; use non-calcium binder if Ca×P product elevated"
    ],
    pearl: "Anti-GBM disease after transplant in Alport: 5% risk. Check COLA4A5 mutation type — truncating mutations higher risk."
  },
  {
    id: "dialysis-complications",
    title: "Dialysis Complications — PD Peritonitis",
    category: "CKD & Dialysis",
    difficulty: "Intermediate",
    color: "bg-purple-600",
    presentation: "An 8-year-old boy on CAPD for 18 months presents with cloudy PD effluent for 24 hours. Temperature 38.4°C. Abdominal pain 6/10. PD effluent white cell count: 450/mm³ (>100 = peritonitis). Gram stain: gram-positive cocci in clusters (likely Staph aureus). He has had one prior peritonitis episode (coagulase-negative Staph, 8 months ago).",
    questions: [
      "How do you confirm PD peritonitis and what is the initial treatment?",
      "The culture grows Staph aureus — how does this change management?",
      "What are indications for catheter removal?",
      "How do you prevent recurrent peritonitis?",
    ],
    answer_points: [
      "Diagnosis: ISPD criteria met (cloudy effluent + WCC >100/mm³). Treatment: intraperitoneal (IP) antibiotics are superior to IV. Start empirically: IP vancomycin 30 mg/kg in ONE long dwell (6h) every 5–7 days + IP ceftazidime 125 mg/L in each exchange. Continue until culture available. Do NOT stop PD.",
      "Staph aureus peritonitis: more serious than CoNS. Duration: 3 weeks minimum (longer than CoNS 2 weeks). Add rifampicin 5 mg/kg/day PO for exit site involvement. Methicillin-resistant Staph aureus (MRSA): vancomycin alone (IP). Check exit site for concurrent infection (TASS: tunnel and exit site signs). Consider catheter removal if not improving by day 5.",
      "Catheter removal indications: refractory peritonitis (no improvement at day 5), relapsing/recurrent peritonitis, fungal peritonitis (remove IMMEDIATELY), catheter-related peritonitis (same organism from exit site + effluent), mycobacterial peritonitis. After removal: switch to HD temporarily → re-insert PD catheter 4–6 weeks later.",
      "Prevention: Hand hygiene education (most effective). Exit site care (mupirocin 2% daily to exit site — prevents Staph aureus). Training refresher for caregivers. Antifungal prophylaxis (fluconazole) during any antibiotic course. Caregiver technique reassessment."
    ],
    teaching_points: [
      "PD peritonitis rate: target <1 episode per 18 patient-months (ISPD guideline)",
      "Fungal peritonitis: immediate catheter removal + fluconazole 6 mg/kg/day × 2 weeks post-removal",
      "CoNS peritonitis: most common organism (touch contamination). IP vancomycin, 14 days",
      "Gram-negative peritonitis: think contamination from bowel (constipation, hernia) — cover with IP ceftazidime + metronidazole"
    ],
    pearl: "Fungal peritonitis = remove catheter the same day. There is no successful treatment with catheter in situ."
  }
];

const DIFFICULTY_COLORS = {
  "Beginner": "bg-green-100 text-green-700",
  "Intermediate": "bg-amber-100 text-amber-700",
  "Advanced": "bg-red-100 text-red-700",
};

const CATEGORIES = ["All", "Nephrotic Syndrome", "Glomerular Disease", "AKI & ICU", "CKD & Dialysis", "CAKUT & Urology"];

export default function CaseLibrary() {
  const [selected, setSelected] = useState(null);
  const [revealedAnswers, setRevealedAnswers] = useState({});
  const [aiExplanation, setAiExplanation] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [category, setCategory] = useState("All");

  const caseDetail = selected ? CASES.find(c => c.id === selected) : null;
  const filtered = CASES.filter(c => category === "All" || c.category === category);

  const toggleAnswer = (idx) => {
    setRevealedAnswers(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const getAITeaching = async (caseItem) => {
    setLoadingAI(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a senior pediatric nephrologist teaching a resident. For this clinical case:

CASE: ${caseItem.presentation}

Provide a structured teaching commentary (2–3 paragraphs):
1. What makes this case classic/atypical
2. Key decision points and clinical reasoning
3. Common mistakes residents make in this scenario
4. Exam viva questions likely to be asked about this case

Be concise, practical, and senior consultant-level.`,
      });
      setAiExplanation(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-slate-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-emerald-700 via-teal-600 to-green-700 p-6 text-white shadow-xl">
          <div className="flex items-center gap-3">
            <BookOpen className="w-9 h-9" />
            <div>
              <h1 className="text-3xl font-bold">Interactive Case Library</h1>
              <p className="text-emerald-100 text-sm">Real-world pediatric nephrology cases with teaching points, viva prep, and AI commentary</p>
            </div>
          </div>
        </div>

        {!caseDetail ? (
          <>
            {/* Category filter */}
            <div className="flex flex-wrap gap-2 mb-6">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${category === cat ? "bg-emerald-600 text-white border-emerald-600" : "bg-white border-slate-200 text-slate-700 hover:border-emerald-400"}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(c => (
                <Card
                  key={c.id}
                  onClick={() => { setSelected(c.id); setRevealedAnswers({}); setAiExplanation(null); }}
                  className="cursor-pointer hover:shadow-xl transition-all border-2 hover:border-emerald-400 group"
                >
                  <CardContent className="p-5">
                    <div className={`w-10 h-10 ${c.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-md`}>
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <Badge className={`text-xs mb-2 ${DIFFICULTY_COLORS[c.difficulty]}`}>{c.difficulty}</Badge>
                    <Badge variant="outline" className="text-xs ml-1 mb-2">{c.category}</Badge>
                    <h3 className="font-bold text-slate-900 text-sm mb-1">{c.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{c.presentation}</p>
                    <div className="mt-3 text-xs text-emerald-600 font-medium flex items-center gap-1">
                      {c.questions.length} questions <ChevronRight className="w-3 h-3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <div>
            <Button variant="outline" onClick={() => setSelected(null)} className="mb-4 gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Cases
            </Button>

            <div className="space-y-6">
              {/* Case presentation */}
              <Card className="border-2 border-emerald-200">
                <CardHeader className={`${caseDetail.color} text-white rounded-t-xl`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge className="bg-white/20 text-white text-xs mb-2">{caseDetail.category}</Badge>
                      <CardTitle className="text-xl">{caseDetail.title}</CardTitle>
                    </div>
                    <Badge className={`${DIFFICULTY_COLORS[caseDetail.difficulty]}`}>{caseDetail.difficulty}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <h3 className="font-bold text-slate-900 mb-2">Clinical Presentation</h3>
                  <p className="text-slate-700 text-sm leading-relaxed">{caseDetail.presentation}</p>
                </CardContent>
              </Card>

              {/* Questions + Answers */}
              <div className="space-y-4">
                {caseDetail.questions.map((q, i) => (
                  <Card key={i} className="border border-slate-200">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                          {i + 1}
                        </div>
                        <p className="font-semibold text-slate-800 text-sm">{q}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleAnswer(i)}
                        className="gap-2 text-xs"
                      >
                        {revealedAnswers[i] ? <><EyeOff className="w-3.5 h-3.5" />Hide Answer</> : <><Eye className="w-3.5 h-3.5" />Show Answer</>}
                      </Button>
                      {revealedAnswers[i] && (
                        <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                          <p className="text-sm text-emerald-900 leading-relaxed">{caseDetail.answer_points[i]}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Teaching points */}
              <Card className="bg-amber-50 border-amber-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-amber-900 text-base flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-600" /> Teaching Points
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {caseDetail.teaching_points.map((tp, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-amber-900">
                      <CheckCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      {tp}
                    </div>
                  ))}
                  <div className="mt-3 bg-amber-100 rounded-lg p-3 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-semibold text-amber-900">Exam Pearl: {caseDetail.pearl}</p>
                  </div>
                </CardContent>
              </Card>

              {/* AI Teaching Commentary */}
              <Card>
                <CardContent className="p-5">
                  {!aiExplanation && !loadingAI && (
                    <Button
                      onClick={() => getAITeaching(caseDetail)}
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-600"
                    >
                      <Sparkles className="w-4 h-4 mr-2" /> Get AI Teaching Commentary & Viva Questions
                    </Button>
                  )}
                  {loadingAI && (
                    <div className="flex items-center justify-center gap-2 text-slate-500 py-4">
                      <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                      <span>AI generating teaching commentary...</span>
                    </div>
                  )}
                  {aiExplanation && (
                    <div>
                      <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <Brain className="w-5 h-5 text-emerald-600" /> AI Teaching Commentary
                      </h3>
                      <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{aiExplanation}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}