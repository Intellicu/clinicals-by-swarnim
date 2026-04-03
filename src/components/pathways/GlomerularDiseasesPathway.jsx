import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw, ChevronDown, ChevronUp, ExternalLink, Loader2, CheckCircle, Info, BookOpen } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

const GLOMERULAR_CONDITIONS = [
  {
    id: "fsgs",
    name: "FSGS (Focal Segmental Glomerulosclerosis)",
    variants: ["Primary FSGS", "Secondary FSGS", "Genetic FSGS"],
    guideline: "KDIGO 2021 Glomerular Diseases",
    urgency: "high",
    tags: ["KDIGO", "Nephrotic", "Immunosuppression"],
    keyPoints: [
      "Perform kidney biopsy with electron microscopy and genetic testing for podocyte genes (NPHS1, NPHS2, WT1, ACTN4, TRPC6)",
      "Initial: Prednisone 1 mg/kg/day (max 80 mg) for 4-16 weeks for primary FSGS",
      "Calcineurin inhibitors (Tacrolimus/Cyclosporin) for steroid-resistant or steroid-dependent FSGS",
      "Rituximab for frequently relapsing/steroid-dependent after CNI failure",
      "ACE inhibitor/ARB mandatory for all FSGS patients with proteinuria",
      "Genetic FSGS: avoid immunosuppression, focus on supportive care",
      "Post-transplant recurrence risk 20-40% for primary FSGS — counsel pre-transplant",
    ],
    refs: [{ title: "KDIGO 2021 Glomerular Disease Guideline", url: "https://kdigo.org/guidelines/gd/" }]
  },
  {
    id: "membranous",
    name: "Membranous Nephropathy (MN)",
    variants: ["Primary (PLA2R+/THSD7A+)", "Secondary MN"],
    guideline: "KDIGO 2021 Glomerular Diseases",
    urgency: "high",
    tags: ["PLA2R", "Rituximab", "KDIGO"],
    keyPoints: [
      "Check PLA2R antibody and THSD7A antibody serology — guides diagnosis and prognosis",
      "Rule out secondary causes: lupus, malignancy (esp >50y), hepatitis B, drugs",
      "Spontaneous remission in 30-40% — watchful waiting acceptable in low risk (proteinuria <3.5 g/day, stable GFR)",
      "Immunosuppression indications: high risk (eGFR falling, severe proteinuria, PLA2R titer very high)",
      "First-line: Rituximab (preferred per KDIGO 2021) — 375 mg/m² × 4 doses OR 1 g × 2 doses",
      "Alternative: Cyclophosphamide + corticosteroid (Ponticelli regimen — 6 months alternating)",
      "Monitor PLA2R levels to guide treatment response",
      "Anticoagulation: consider if albumin <2.5 g/dL (VTE risk high in membranous)",
    ],
    refs: [{ title: "KDIGO 2021 Glomerular Disease Guideline", url: "https://kdigo.org/guidelines/gd/" }]
  },
  {
    id: "igan",
    name: "IgA Nephropathy (IgAN)",
    variants: ["Primary IgAN", "IgAV Nephritis (HSP)"],
    guideline: "KDIGO 2021 + KDIGO 2024 IgAN Supplement",
    urgency: "medium",
    tags: ["KDIGO", "Oxford MEST-C", "SGLT2i"],
    keyPoints: [
      "Oxford MEST-C score for histological risk stratification (M, E, S, T, C lesions)",
      "Supportive care FIRST: optimize BP (<125/75), ACEi/ARB for all with proteinuria",
      "SGLT2 inhibitors (Dapagliflozin 10 mg/day) — strongly recommended by KDIGO 2024 for all eligible",
      "Sparsentan (dual endothelin-angiotensin receptor antagonist) — FDA approved 2023 for IgAN",
      "Targeted-release budesonide (Nefecon/Tarpeyo): 16 mg/day for 9 months — EMA/FDA approved for high-risk",
      "Systemic steroids: 6-month course for persistent proteinuria >1 g/day despite max supportive care AND eGFR >30",
      "IgAV nephritis in children: close monitoring, most recover without immunosuppression",
      "High risk: MEST-T1/T2, persistent proteinuria >1 g/day, eGFR declining — consider trials",
    ],
    refs: [
      { title: "KDIGO 2021 GN Guideline", url: "https://kdigo.org/guidelines/gd/" },
      { title: "KDIGO 2024 IgAN Update", url: "https://kdigo.org/guidelines/gd/" }
    ]
  },
  {
    id: "c3gn",
    name: "C3 Glomerulopathy (C3GN / DDD)",
    variants: ["C3 Glomerulonephritis", "Dense Deposit Disease (DDD)"],
    guideline: "KDIGO 2021 + IPNA C3G Guidance",
    urgency: "high",
    tags: ["Complement", "C3", "Anti-complement"],
    keyPoints: [
      "Comprehensive complement work-up: C3, C4, CH50, Factor H, Factor I, Factor B, C3NeF, anti-Factor H antibodies",
      "Genetic panel for complement regulatory genes (CFH, CFI, CD46, CFB, C3)",
      "Kidney biopsy: C3 dominant or codominant on IF; electron microscopy distinguishes C3GN vs DDD",
      "If anti-Factor H antibodies positive: plasma exchange + immunosuppression (like aHUS)",
      "Mycophenolate mofetil ± low-dose steroids for progressive C3GN",
      "Eculizumab (anti-C5): consider for severe/rapidly progressive disease, especially DDD — evidence limited",
      "Iptacopan (Factor B inhibitor): emerging therapy, positive trials 2023-24",
      "C3NeF-positive: may respond to rituximab — case series data",
      "Post-transplant recurrence common (50-80% DDD, 30-60% C3GN) — discuss with family",
      "Monitor C3 levels as disease activity marker",
    ],
    refs: [{ title: "KDIGO 2021 GN Guideline", url: "https://kdigo.org/guidelines/gd/" }]
  },
  {
    id: "lupus",
    name: "Lupus Nephritis (LN)",
    variants: ["Class III/IV", "Class V (Pure Membranous)", "Mixed III+V/IV+V"],
    guideline: "ACR/EULAR 2019 + KDIGO 2021",
    urgency: "critical",
    tags: ["ACR", "EULAR", "KDIGO", "Hydroxychloroquine"],
    keyPoints: [
      "Kidney biopsy mandatory — ISN/RPS 2003 classification (Class I-VI) guides treatment",
      "ALL patients: Hydroxychloroquine 5 mg/kg/day (max 400 mg) — reduces flares and protects kidney",
      "Class III/IV: High-dose methylprednisolone + MMF (low-dose regimen 1.5-3 g/day preferred) OR Cyclophosphamide (NIH regimen)",
      "Belimumab (anti-BLyS): add-on therapy for Class III/IV — BLISS-LN trial, FDA approved 2020",
      "Voclosporin (Lupkynis) + MMF + steroids — FDA approved 2021, superior CR rates",
      "Class V: ACEi/ARB ± CNI if proteinuria >3 g; add MMF if not responding",
      "Target: proteinuria <0.5-0.7 g/g at 12 months, stable eGFR",
      "Maintenance: MMF 1-2 g/day preferred over azathioprine for most",
    ],
    refs: [
      { title: "ACR/EULAR LN Guidelines 2019", url: "https://www.rheumatology.org/Practice-Quality/Clinical-Support/Clinical-Practice-Guidelines/Lupus-Nephritis" },
      { title: "KDIGO 2021 GN Guideline", url: "https://kdigo.org/guidelines/gd/" }
    ]
  },
  {
    id: "aahu",
    name: "aHUS (Atypical HUS) / TMA",
    variants: ["Complement-mediated TMA", "STEC-HUS", "DGKE TMA"],
    guideline: "KDIGO 2021 + International aHUS Registry",
    urgency: "critical",
    tags: ["Eculizumab", "TMA", "Complement"],
    keyPoints: [
      "EMERGENCY: aggressive supportive care — fluid management, dialysis if needed, transfusion",
      "STEC-HUS (D+): supportive care ONLY. Avoid antibiotics, antidiarrheals, antiplatelets",
      "Complement panel BEFORE treatment: C3, C4, CH50, AH50, CFH, CFI, anti-CFH Ab",
      "Genetic testing: CFH, CFI, CD46, CFB, C3, THBD, DGKE — guides prognosis",
      "Eculizumab (anti-C5): START IMMEDIATELY if aHUS suspected — do not wait for genetic results",
      "Meningococcal vaccination BEFORE or at start of eculizumab (B + ACWY)",
      "Prophylactic penicillin V 250 mg BD during eculizumab treatment",
      "Ravulizumab (long-acting anti-C5): every 8 weeks, now preferred over eculizumab",
      "Anti-CFH antibody positive: plasma exchange + steroids/rituximab + eculizumab",
      "Duration of eculizumab: gene-specific (CFH = lifelong, CD46 = can try stopping)",
    ],
    refs: [{ title: "KDIGO 2021 GN Guideline", url: "https://kdigo.org/guidelines/gd/" }]
  },
  {
    id: "anca",
    name: "ANCA-Associated GN (Vasculitis)",
    variants: ["MPA / GPA / eGPA", "Pauci-immune crescentic GN"],
    guideline: "ACR/EULAR 2022 + KDIGO 2021",
    urgency: "critical",
    tags: ["ANCA", "Rituximab", "Cyclophosphamide"],
    keyPoints: [
      "Urgent kidney biopsy — pauci-immune necrotizing crescentic GN on histology",
      "Check: PR3-ANCA / MPO-ANCA, ANCA pattern, CXR, ENT exam",
      "Induction (severe, organ-threatening): Rituximab 375 mg/m² × 4 OR pulse Cyclophosphamide + pulse steroids",
      "Avacopan (C5a receptor inhibitor) approved 2021 — steroid-sparing induction for ANCA GN",
      "Plasma exchange: consider if serum creatinine >500 μmol/L or DAH",
      "Maintenance: Rituximab 500 mg every 6 months for 2 years (preferred) OR Azathioprine",
      "Relapse assessment: PR3-ANCA more prone to relapse than MPO-ANCA",
      "Trimethoprim-sulfamethoxazole prophylaxis during immunosuppression",
    ],
    refs: [
      { title: "ACR/EULAR ANCA Vasculitis Guidelines 2022", url: "https://www.rheumatology.org/Practice-Quality/Clinical-Support/Clinical-Practice-Guidelines/Vasculitis" },
      { title: "KDIGO 2021 GN Guideline", url: "https://kdigo.org/guidelines/gd/" }
    ]
  },
  {
    id: "mgn_alport",
    name: "Alport Syndrome / COL4 Nephropathy",
    variants: ["X-linked (XLAS)", "Autosomal Recessive (ARAS)", "Autosomal Dominant (ADAS)"],
    guideline: "KDIGO 2024 Alport Syndrome Guideline",
    urgency: "medium",
    tags: ["COL4A3/4/5", "Genetic", "ACEi"],
    keyPoints: [
      "Genetic testing: COL4A3, COL4A4 (AR/AD), COL4A5 (X-linked) — diagnostic",
      "Kidney biopsy: EM shows irregular thinning/thickening of GBM (basket-weave appearance)",
      "Early ACEi (Ramipril/Enalapril) shown to slow progression — start when proteinuria >0.5 g/day",
      "SGLT2 inhibitors: emerging evidence for renoprotection — KDIGO 2024 supports early use",
      "Hearing testing (sensorineural hearing loss): annual audiometry",
      "Ophthalmology: lenticonus, fleck retinopathy screening",
      "Cascade genetic testing of all first-degree relatives",
      "Females with XLAS: significant proteinuria/GFR decline — do not minimize as 'carriers'",
      "ReSolve trial (Sparsentan) ongoing for Alport syndrome",
      "Transplant: excellent outcomes; anti-GBM disease rare post-transplant",
    ],
    refs: [{ title: "KDIGO 2024 Alport Syndrome Guideline", url: "https://kdigo.org/guidelines/alport-syndrome/" }]
  },
];

const urgencyColors = {
  critical: "bg-red-100 text-red-800 border-red-300",
  high: "bg-amber-100 text-amber-800 border-amber-300",
  medium: "bg-blue-100 text-blue-800 border-blue-300",
};

export default function GlomerularDiseasesPathway() {
  const [expanded, setExpanded] = useState({});
  const [aiUpdates, setAiUpdates] = useState({});
  const [loadingUpdate, setLoadingUpdate] = useState({});

  const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const fetchUpdate = async (condition) => {
    setLoadingUpdate(prev => ({ ...prev, [condition.id]: true }));
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a clinical nephrologist. Provide the LATEST 2024-2025 updates and evidence for managing ${condition.name} in children and adults. Focus on:
1. New drug approvals or trial results (2023-2025)
2. Updated guideline recommendations
3. Emerging biomarkers or diagnostic criteria
4. Key changes from previous guidelines
5. Pediatric-specific considerations

Be concise, use bullet points, cite specific trials/guidelines where possible.`,
        add_context_from_internet: true,
        model: "gemini_3_flash",
      });
      setAiUpdates(prev => ({ ...prev, [condition.id]: result }));
    } catch {
      toast.error("Update fetch failed");
    } finally {
      setLoadingUpdate(prev => ({ ...prev, [condition.id]: false }));
    }
  };

  return (
    <div className="space-y-4">
      <Alert className="bg-blue-50 border-blue-200">
        <BookOpen className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-xs text-blue-900">
          <strong>Pediatric Nephrology Glomerular Disease Pathways</strong> — KDIGO 2021/2024, ACR/EULAR, IPNA guidelines. Click "Get Latest Update" to fetch real-time evidence and trial results.
        </AlertDescription>
      </Alert>

      {GLOMERULAR_CONDITIONS.map(condition => (
        <Card key={condition.id} className="bg-white shadow-sm border-2 border-slate-200">
          <CardHeader className="pb-2 cursor-pointer" onClick={() => toggle(condition.id)}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <CardTitle className="text-sm font-bold text-slate-900">{condition.name}</CardTitle>
                  <Badge className={`text-xs border ${urgencyColors[condition.urgency]}`}>{condition.urgency === "critical" ? "🔴 Critical" : condition.urgency === "high" ? "🟠 High Priority" : "🔵 Standard"}</Badge>
                </div>
                <div className="flex gap-1 mt-1 flex-wrap">
                  {condition.tags.map(t => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
                </div>
                <p className="text-xs text-slate-500 mt-1">📚 {condition.guideline}</p>
              </div>
              {expanded[condition.id] ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
            </div>
          </CardHeader>

          {expanded[condition.id] && (
            <CardContent className="pt-0 px-4 pb-4 space-y-3">
              {/* Variants */}
              <div className="flex gap-1 flex-wrap">
                {condition.variants.map(v => <Badge key={v} className="bg-purple-100 text-purple-800 text-xs">{v}</Badge>)}
              </div>

              {/* Key Management Points */}
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Management Protocol</p>
                {condition.keyPoints.map((point, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs p-2 bg-slate-50 rounded border">
                    <span className="font-bold text-blue-600 flex-shrink-0">{i + 1}.</span>
                    <span className="text-slate-800">{point}</span>
                  </div>
                ))}
              </div>

              {/* References */}
              <div className="flex gap-2 flex-wrap">
                {condition.refs.map((ref, i) => (
                  <a key={i} href={ref.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" />{ref.title}
                  </a>
                ))}
              </div>

              {/* AI Live Update */}
              <div className="border-t pt-3">
                <Button size="sm" variant="outline" onClick={() => fetchUpdate(condition)} disabled={loadingUpdate[condition.id]} className="w-full text-xs border-green-300 text-green-700 hover:bg-green-50">
                  {loadingUpdate[condition.id] ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" />Fetching Latest Evidence...</> : <><RefreshCw className="w-3 h-3 mr-1" />🌐 Get Latest 2024-25 Updates</>}
                </Button>
                {aiUpdates[condition.id] && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      <span className="text-xs font-bold text-green-900">Latest Evidence (AI-Fetched)</span>
                    </div>
                    <ReactMarkdown className="text-xs prose prose-sm prose-green max-w-none [&>*:first-child]:mt-0">
                      {aiUpdates[condition.id]}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}