import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, CheckCircle, RotateCcw, Zap, ChevronRight, Lightbulb, Activity } from "lucide-react";

// ─── Shared utilities ──────────────────────────────────────────────────────────
const BAR_COLORS = {
  blue: "bg-blue-500", violet: "bg-violet-500", red: "bg-red-500",
  amber: "bg-amber-500", pink: "bg-pink-500", teal: "bg-teal-500",
  purple: "bg-purple-500", orange: "bg-orange-500", indigo: "bg-indigo-500",
};

function ContributorBar({ label, weight, domain, color, maxWeight = 6 }) {
  const pct = Math.min(Math.round((weight / maxWeight) * 100), 100);
  const barColor = BAR_COLORS[color] || "bg-slate-400";
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between text-xs">
        <span className="text-slate-700 flex-1 pr-2">{label}</span>
        <span className="font-bold">+{weight}</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-slate-400">{domain}</p>
    </div>
  );
}

function DisclaimerBanner({ toolName }) {
  return (
    <Alert className="bg-amber-50 border-amber-200 py-2">
      <AlertDescription className="text-xs text-amber-800">
        ⚠️ <strong>Learning Tool Only.</strong> {toolName} Suspicion Scoring is an educational aid. Not a diagnostic tool. All decisions require clinician judgement. <strong>Rare Disease Module by Swarnim.</strong>
      </AlertDescription>
    </Alert>
  );
}

// ─── Generic scoring engine ────────────────────────────────────────────────────
function scoreChecklist(domains, checked) {
  let total = 0;
  const contributors = [];
  const domainScores = {};
  domains.forEach(domain => {
    let dScore = 0;
    domain.features.forEach(f => {
      if (checked[f.id]) {
        total += f.weight;
        dScore += f.weight;
        contributors.push({ label: f.label, weight: f.weight, domain: domain.label, color: domain.color });
      }
    });
    if (dScore > 0) domainScores[domain.id] = { label: domain.label, score: dScore, icon: domain.icon };
  });
  contributors.sort((a, b) => b.weight - a.weight);
  return { total, contributors, domainScores };
}

// ─── Generic Screening Tool Component ─────────────────────────────────────────
function ScreeningTool({ config }) {
  const [checked, setChecked] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const toggle = id => setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  const { total, contributors, domainScores } = scoreChecklist(config.domains, checked);
  const checkedCount = Object.values(checked).filter(Boolean).length;
  const risk = config.getRisk(total);
  const guidance = config.guidance[risk.key];
  const RiskIcon = risk.icon;

  const handleCalculate = () => setSubmitted(true);
  const handleReset = () => { setChecked({}); setSubmitted(false); };

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className={`bg-gradient-to-br ${config.headerGradient} rounded-2xl p-5 text-white`}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">{config.emoji}</div>
          <div>
            <h2 className="text-lg font-bold">{config.title} Screening Tool</h2>
            <p className="text-white/70 text-xs">Rare Disease Module by Swarnim · Pediatric Nephrology</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {config.badges.map((b, i) => <Badge key={i} className="bg-white/20 text-xs">{b}</Badge>)}
        </div>
        <p className="text-xs text-white/70 mt-3">{config.subtitle}</p>
      </div>

      {/* Live score preview */}
      {checkedCount > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <Activity className="w-5 h-5 text-slate-500 flex-shrink-0" />
          <div className="flex-1">
            <span className="text-sm font-semibold text-slate-900">Live Score: {total}</span>
            <span className="text-xs text-slate-500 ml-2">({checkedCount} features)</span>
          </div>
          <Badge className={risk.badge}>{risk.level}</Badge>
        </div>
      )}

      {/* Domains */}
      {config.domains.map(domain => (
        <Card key={domain.id} className="bg-white border border-slate-200 shadow-sm">
          <CardHeader className="py-3 px-4 border-b bg-slate-50">
            <CardTitle className="text-sm flex items-center gap-2">
              <span>{domain.icon}</span>{domain.label}
              {Object.keys(checked).filter(k => checked[k] && domain.features.find(f => f.id === k)).length > 0 && (
                <Badge className="bg-blue-100 text-blue-800 text-xs ml-auto">
                  {Object.keys(checked).filter(k => checked[k] && domain.features.find(f => f.id === k)).length} selected
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {domain.features.map(f => (
              <div key={f.id}
                className={`flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${checked[f.id] ? "bg-blue-50 border border-blue-200" : "hover:bg-slate-50"}`}
                onClick={() => toggle(f.id)}>
                <Checkbox checked={!!checked[f.id]} onCheckedChange={() => toggle(f.id)} className="mt-0.5 flex-shrink-0" />
                <Label className="text-sm text-slate-800 cursor-pointer leading-tight flex-1">{f.label}</Label>
                <Badge className={`text-xs flex-shrink-0 ${f.weight >= 5 ? "bg-red-100 text-red-700" : f.weight >= 3 ? "bg-orange-100 text-orange-700" : "bg-slate-100 text-slate-600"}`}>
                  +{f.weight}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {/* Calculate button */}
      <div className="bg-white border-2 border-blue-200 rounded-2xl p-4 shadow-md space-y-3">
        <div className="flex gap-3">
          <Button
            onClick={handleCalculate}
            disabled={checkedCount === 0}
            className={`flex-1 ${config.btnClass} text-white font-bold h-12`}
          >
            <Zap className="w-4 h-4 mr-2" />
            {checkedCount === 0 ? "Select features to calculate" : `Calculate ${config.shortTitle} Risk · Score ${total}`}
          </Button>
          <Button variant="outline" onClick={handleReset} className="px-4 h-12">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
        <DisclaimerBanner toolName={config.title} />
      </div>

      {/* Results */}
      {submitted && (
        <div className="space-y-4">
          {/* Risk Banner */}
          <Alert className={`border-2 ${risk.alert}`}>
            <div className="flex items-start gap-3">
              <RiskIcon className={`w-6 h-6 flex-shrink-0 mt-0.5 ${risk.iconColor}`} />
              <AlertDescription className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-bold text-base">{risk.level}</span>
                  <Badge className={risk.badge}>Score: {total}</Badge>
                </div>
                <p className="text-sm">{guidance.summary}</p>
              </AlertDescription>
            </div>
          </Alert>

          {/* Guidance Actions */}
          <Card className="bg-white border border-slate-200 shadow-sm">
            <CardHeader className="py-3 px-4 border-b bg-slate-50">
              <CardTitle className="text-sm flex items-center gap-2"><Zap className="w-4 h-4 text-blue-500" />Post-Score Guidance</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {guidance.actions.map((a, i) => (
                <div key={i} className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <span className="text-xl flex-shrink-0">{a.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{a.label}</p>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{a.detail}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Contributor bars */}
          {contributors.length > 0 && (
            <Card className="bg-white border border-slate-200 shadow-sm">
              <CardHeader className="py-3 px-4 border-b bg-slate-50">
                <CardTitle className="text-sm">Contributor Analysis</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {contributors.map((c, i) => <ContributorBar key={i} {...c} />)}
              </CardContent>
            </Card>
          )}

          {/* Domain grid */}
          {Object.keys(domainScores).length > 0 && (
            <Card className="bg-white border border-slate-200 shadow-sm">
              <CardHeader className="py-3 px-4 border-b bg-slate-50">
                <CardTitle className="text-sm">Domain Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.values(domainScores).map((d, i) => (
                    <div key={i} className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                      <span className="text-2xl">{d.icon}</span>
                      <p className="text-xs font-semibold text-blue-900 mt-1 leading-tight">{d.label}</p>
                      <p className="text-xl font-bold text-blue-700">+{d.score}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Investigations */}
          {guidance.investigations?.length > 0 && (
            <Card className="bg-indigo-50 border border-indigo-200 shadow-sm">
              <CardHeader className="py-3 px-4 border-b border-indigo-200">
                <CardTitle className="text-sm text-indigo-900">Suggested Investigations</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-1">
                {guidance.investigations.map((t, i) => (
                  <div key={i} className="flex items-start gap-2 bg-white rounded-lg p-2 text-xs text-indigo-900">
                    <ChevronRight className="w-3 h-3 flex-shrink-0 mt-0.5 text-indigo-400" />{t}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Clinical Pearls */}
          {config.pearls?.length > 0 && (
            <Card className="bg-yellow-50 border border-yellow-200 shadow-sm">
              <CardHeader className="py-3 px-4 border-b bg-yellow-50">
                <CardTitle className="text-sm text-yellow-900 flex items-center gap-2"><Lightbulb className="w-4 h-4" />Clinical Pearls</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                {config.pearls.map((p, i) => (
                  <div key={i} className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <span className="flex-shrink-0">💡</span>
                    <div>
                      <Badge className="bg-yellow-200 text-yellow-900 text-xs mb-1">{p.highlight}</Badge>
                      <p className="text-xs text-slate-700 leading-relaxed">{p.pearl}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ALPORT SYNDROME CONFIG
// ═══════════════════════════════════════════════════════════════════════════════
const ALPORT_CONFIG = {
  title: "Alport Syndrome", shortTitle: "Alport", emoji: "🧬",
  headerGradient: "from-indigo-700 to-blue-800",
  btnClass: "bg-indigo-600 hover:bg-indigo-700",
  badges: ["COL4A3/A4/A5 · Type IV Collagen", "X-linked / AR / AD", "Haematuria + SNHL + CKD"],
  subtitle: "Check all features present. Alport score guides urgency of genetic testing and early RAS blockade.",
  domains: [
    {
      id: "renal", label: "Renal Features", icon: "🫘", color: "indigo",
      features: [
        { id: "persistent_hematuria", label: "Persistent microscopic haematuria (from childhood)", weight: 5 },
        { id: "proteinuria_alport", label: "Proteinuria (progressive, without other cause)", weight: 4 },
        { id: "ckd_young", label: "CKD in child/young adult without clear diagnosis", weight: 4 },
        { id: "esrd_early", label: "ESRD before age 30 in male family member", weight: 5 },
      ]
    },
    {
      id: "biopsy", label: "Biopsy Findings", icon: "🔬", color: "violet",
      features: [
        { id: "gbm_thin", label: "GBM thinning on EM (thin basement membrane pattern)", weight: 4 },
        { id: "gbm_lamellation", label: "GBM lamellation / basket-weave on EM", weight: 6 },
        { id: "col4_negative", label: "Type IV collagen (α3/α4/α5 chains) absent or patchy on IF", weight: 6 },
      ]
    },
    {
      id: "extra_renal", label: "Extra-Renal Features", icon: "👂", color: "blue",
      features: [
        { id: "snhl", label: "Sensorineural hearing loss (bilateral, high-frequency)", weight: 5 },
        { id: "lenticonus", label: "Anterior lenticonus on ophthalmology", weight: 6 },
        { id: "macular_flecks", label: "Macular flecks (dot-and-fleck retinopathy)", weight: 4 },
      ]
    },
    {
      id: "family", label: "Family History", icon: "👨‍👩‍👧", color: "purple",
      features: [
        { id: "maternal_hematuria", label: "Maternal uncles/male relatives with haematuria + CKD/ESRD", weight: 5 },
        { id: "fam_deafness", label: "Family history of deafness + renal disease", weight: 4 },
        { id: "fam_hematuria", label: "Multiple family members with isolated haematuria", weight: 3 },
      ]
    },
  ],
  getRisk(total) {
    if (total === 0) return { level: "Low Suspicion", key: "low", badge: "bg-green-100 text-green-800", alert: "bg-green-50 border-green-200", icon: CheckCircle, iconColor: "text-green-600" };
    if (total <= 5) return { level: "Possible Alport Syndrome", key: "possible", badge: "bg-amber-100 text-amber-800", alert: "bg-amber-50 border-amber-300", icon: AlertTriangle, iconColor: "text-amber-600" };
    if (total <= 12) return { level: "High Suspicion — Alport Syndrome", key: "high", badge: "bg-orange-100 text-orange-800", alert: "bg-orange-50 border-orange-300", icon: AlertTriangle, iconColor: "text-orange-600" };
    return { level: "Urgent Genetics Referral — Alport Confirmed Likely", key: "urgent", badge: "bg-red-100 text-red-800", alert: "bg-red-50 border-red-400 border-2", icon: AlertTriangle, iconColor: "text-red-600" };
  },
  guidance: {
    low: {
      summary: "No specific Alport features identified. Monitor urine and renal function annually.",
      actions: [
        { icon: "📋", label: "Annual Monitoring", detail: "Urine dipstick, ACR, renal function annually. Audiometry if new hearing concerns." },
      ],
      investigations: [],
    },
    possible: {
      summary: "Some features suggest Alport syndrome. Genetic testing and specialist input recommended.",
      actions: [
        { icon: "🔬", label: "Renal Biopsy with EM and IF", detail: "EM for GBM lamellation and basket-weave pattern is key diagnostic finding. Type IV collagen IF staining (α3/α4/α5)." },
        { icon: "🧬", label: "COL4A3/A4/A5 Gene Sequencing", detail: "Gene panel essential — determines inheritance pattern (X-linked vs AR/AD) and guides family screening." },
        { icon: "💊", label: "Start RAS Blockade if Proteinuria", detail: "ACEi (ramipril or enalapril) — start as soon as proteinuria appears even before CKD. Slows progression by ~5-10 years in males." },
      ],
      investigations: ["Urine ACR (urine protein:creatinine)", "Renal function + eGFR", "Audiometry (pure tone)", "Ophthalmology (slit lamp for lenticonus)", "Renal biopsy — EM + IF for type IV collagen", "COL4A3/A4/A5 sequencing"],
    },
    high: {
      summary: "Multiple features strongly suggest Alport syndrome. Urgent genetics referral, biopsy, and early RAS blockade are indicated.",
      actions: [
        { icon: "🚨", label: "Urgent Genetics + Nephrology Referral", detail: "COL4 sequencing panel for all three genes. Identify X-linked vs autosomal — critical for family cascade." },
        { icon: "💊", label: "RAS Blockade — Start Immediately", detail: "ACEi regardless of BP. Angiotensin receptor blockade if ACEi intolerant. Goal: urine ACR <30 mg/mmol." },
        { icon: "👂", label: "Audiology + Ophthalmology", detail: "High-frequency SNHL — baseline audiogram. Anterior lenticonus pathognomonic — urgent slit lamp." },
        { icon: "👨‍👩‍👧", label: "Family Cascade Screening", detail: "X-linked: all first-degree female relatives. AR: siblings 25% risk. Urinalysis + audiometry as minimum." },
      ],
      investigations: ["COL4A3/A4/A5 sequencing (urgent)", "Skin biopsy type IV collagen staining (α5)", "Renal biopsy EM + IF", "Audiometry baseline", "Ophthalmology (slit lamp)", "24h urine protein or ACR", "eGFR trend monitoring"],
    },
    urgent: {
      summary: "Highly probable Alport syndrome with multiple pathognomonic features. Urgent multi-specialist coordination required.",
      actions: [
        { icon: "🚨", label: "Urgent Genetics Referral", detail: "Expedited COL4A3/A4/A5 sequencing. Genetic counselling for X-linked vs AR vs AD determination." },
        { icon: "💊", label: "Immediate RAS Blockade", detail: "Start ACEi today if not already on it. Slows ESRD by 5–10 years in males with X-linked disease." },
        { icon: "🏥", label: "Transplant Planning (if advanced CKD)", detail: "Excellent transplant outcomes. ~3% risk of de novo anti-GBM disease post-transplant. Counsel accordingly." },
        { icon: "👨‍👩‍👧", label: "Full Family Cascade", detail: "All at-risk relatives: urinalysis + audiometry. Genetic testing for X-linked female carriers and AR siblings." },
      ],
      investigations: ["COL4A3/A4/A5 panel (expedited)", "Renal biopsy + EM", "Skin biopsy (α5 staining)", "Audiogram", "Ophthalmology", "Cardiac workup if advanced CKD pre-transplant"],
    },
  },
  pearls: [
    { highlight: "Haematuria in male child", pearl: "Persistent microscopic haematuria in a male child with family history of ESRD/deafness — Alport syndrome until proven otherwise. COL4A5 sequencing first." },
    { highlight: "GBM lamellation on EM", pearl: "GBM basket-weave lamellation on electron microscopy is pathognomonic for Alport syndrome. Arrange EM at time of biopsy — not just LM." },
    { highlight: "Start ACEi early", pearl: "Starting ACEi before proteinuria or CKD onset (at stage of isolated haematuria) slows ESRD by 10+ years in males. Do not wait for proteinuria." },
    { highlight: "Female carriers are NOT silent", pearl: "Heterozygous females with X-linked Alport (COL4A5) can develop significant CKD and ESRD — they are not just carriers. Monitor closely." },
    { highlight: "Skin biopsy for α5", pearl: "α5(IV) collagen staining on skin biopsy is absent in males with X-linked Alport — non-invasive diagnostic clue before renal biopsy." },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// CYSTINOSIS CONFIG
// ═══════════════════════════════════════════════════════════════════════════════
const CYSTINOSIS_CONFIG = {
  title: "Cystinosis", shortTitle: "Cystinosis", emoji: "💎",
  headerGradient: "from-amber-600 to-orange-700",
  btnClass: "bg-amber-600 hover:bg-amber-700",
  badges: ["CTNS Gene · AR", "Fanconi Syndrome", "Lysosomal Storage · Cysteamine Therapy"],
  subtitle: "Check all features present. Early recognition enables cysteamine therapy which dramatically improves renal survival.",
  domains: [
    {
      id: "renal", label: "Renal Features (Fanconi Syndrome)", icon: "🫘", color: "amber",
      features: [
        { id: "fanconi", label: "Fanconi syndrome (glycosuria + aminoaciduria + phosphaturia + bicarbonate wasting)", weight: 6 },
        { id: "polyuria_cystinosis", label: "Polyuria + polydipsia in infant (NDI-like)", weight: 4 },
        { id: "ckd_child", label: "Progressive CKD in child without clear cause", weight: 4 },
        { id: "rickets", label: "Rickets / hypophosphataemic bone disease in infant/child", weight: 4 },
        { id: "glucosuria_normo", label: "Glycosuria with normal blood glucose", weight: 5 },
      ]
    },
    {
      id: "growth", label: "Growth & Systemic", icon: "📏", color: "orange",
      features: [
        { id: "failure_thrive", label: "Failure to thrive / poor growth from infancy", weight: 4 },
        { id: "muscle_wasting", label: "Muscle wasting / myopathy (older children)", weight: 3 },
        { id: "swallowing", label: "Swallowing difficulty (older patients)", weight: 2 },
      ]
    },
    {
      id: "ophthalmic", label: "Ophthalmologic Features", icon: "👁️", color: "teal",
      features: [
        { id: "corneal_crystals", label: "Corneal cystine crystals on slit lamp (pathognomonic after age 1)", weight: 6 },
        { id: "photophobia", label: "Photophobia in infant or child", weight: 4 },
        { id: "retinopathy", label: "Pigmentary retinopathy (older patients)", weight: 3 },
      ]
    },
    {
      id: "endocrine", label: "Endocrine & Neurologic", icon: "🧠", color: "blue",
      features: [
        { id: "hypothyroid", label: "Hypothyroidism in child without autoimmune cause", weight: 3 },
        { id: "diabetes", label: "Diabetes mellitus (pancreatic — late cystinosis)", weight: 3 },
        { id: "ceroid", label: "Encephalopathy / cerebral atrophy (late, untreated)", weight: 3 },
      ]
    },
    {
      id: "family", label: "Family History & Genetics", icon: "👨‍👩‍👧", color: "purple",
      features: [
        { id: "consang_cystinosis", label: "Parental consanguinity", weight: 3 },
        { id: "sibling_fanconi", label: "Sibling with Fanconi syndrome / renal failure in childhood", weight: 5 },
      ]
    },
  ],
  getRisk(total) {
    if (total === 0) return { level: "Low Suspicion", key: "low", badge: "bg-green-100 text-green-800", alert: "bg-green-50 border-green-200", icon: CheckCircle, iconColor: "text-green-600" };
    if (total <= 5) return { level: "Possible Cystinosis", key: "possible", badge: "bg-amber-100 text-amber-800", alert: "bg-amber-50 border-amber-300", icon: AlertTriangle, iconColor: "text-amber-600" };
    if (total <= 12) return { level: "High Suspicion — Cystinosis", key: "high", badge: "bg-orange-100 text-orange-800", alert: "bg-orange-50 border-orange-300", icon: AlertTriangle, iconColor: "text-orange-600" };
    return { level: "Urgent Cystinosis Evaluation — Start Cysteamine", key: "urgent", badge: "bg-red-100 text-red-800", alert: "bg-red-50 border-red-400 border-2", icon: AlertTriangle, iconColor: "text-red-600" };
  },
  guidance: {
    low: {
      summary: "No specific cystinosis features. Standard monitoring if Fanconi features absent.",
      actions: [{ icon: "📋", label: "Routine Follow-up", detail: "Standard renal function, growth monitoring." }],
      investigations: [],
    },
    possible: {
      summary: "Some features suggest cystinosis. Leucocyte cystine assay and slit-lamp examination are immediate next steps.",
      actions: [
        { icon: "🔬", label: "Leucocyte Cystine Assay", detail: "Send leucocyte cystine levels — diagnostic if elevated (>0.5 nmol/mg protein). Available at specialist labs." },
        { icon: "👁️", label: "Slit-Lamp Examination", detail: "Corneal crystals are pathognomonic from age 1 year. Photophobia without crystals in neonates — slit lamp still recommended." },
        { icon: "🧪", label: "Urine Aminoaciduria Panel", detail: "Fanconi: glycosuria, aminoaciduria, phosphaturia, bicarbonaturia — all with normal/low serum levels." },
      ],
      investigations: ["Leucocyte cystine levels", "Slit-lamp corneal examination", "Urine amino acids, glucose, phosphate, calcium, bicarbonate", "Serum phosphate, calcium, bicarbonate, potassium", "TRP, FENa, FEK, FEphosphate (Fanconi markers)", "CTNS gene sequencing"],
    },
    high: {
      summary: "Multiple features strongly suggest cystinosis. Start cysteamine urgently pending confirmation. Urgent paediatric nephrology + genetics referral.",
      actions: [
        { icon: "💊", label: "Start Cysteamine Urgently", detail: "Do not wait for genetic confirmation if leucocyte cystine elevated. Cysteamine bitartrate (Cystagon) or delayed-release (Procysbi). Target cystine <0.5 nmol/mg." },
        { icon: "🔬", label: "Leucocyte Cystine (Urgent)", detail: "Send leucocyte cystine STAT. Diagnosis confirmed if >3.0 nmol/mg (normal <0.2)." },
        { icon: "🧬", label: "CTNS Gene Sequencing", detail: "57kb deletion in European; missense mutations in Indian/Asian. Sequencing confirms diagnosis and enables prenatal diagnosis." },
        { icon: "👁️", label: "Slit Lamp + Ophthalmology", detail: "Corneal crystal clearance monitored on cysteamine eye drops. Baseline essential before starting treatment." },
        { icon: "📏", label: "Nutritional + Electrolyte Replacement", detail: "Correct bicarbonate, phosphate, potassium wasting. Vitamin D + calcitriol for bone disease. Carnitine supplementation." },
      ],
      investigations: ["Leucocyte cystine (urgent)", "CTNS sequencing (57kb deletion + full gene)", "Renal function + electrolytes", "Phosphate, calcium, PTH", "Thyroid function", "Ophthalmology (slit lamp)", "Renal ultrasound (medullary nephrocalcinosis)", "24h urine studies (Fanconi panel)"],
    },
    urgent: {
      summary: "Highly probable cystinosis. Start cysteamine immediately. Coordinate paediatric nephrology, genetics, ophthalmology, and endocrinology.",
      actions: [
        { icon: "🚨", label: "Start Cysteamine Immediately", detail: "Cysteamine bitartrate (10–50 mg/kg/day in 4 divided doses, titrate up). Eye drops (0.1–0.55%) for corneal disease. Monitor cystine levels monthly." },
        { icon: "🧬", label: "CTNS Sequencing + Family Testing", detail: "AR inheritance — 25% recurrence risk. Screen siblings urgently. Prenatal diagnosis via CVS available." },
        { icon: "🏥", label: "Multi-disciplinary MDT", detail: "Nephrology, genetics, ophthalmology, endocrinology, physiotherapy, dietitian. Lifelong follow-up required." },
      ],
      investigations: ["Leucocyte cystine (urgent)", "CTNS full gene sequencing", "Renal biopsy if diagnosis unclear (cystine crystals in podocytes)", "Full electrolyte panel + Fanconi studies", "Thyroid, glucose, PTH, vitamin D", "Brain MRI (late disease — cerebral atrophy)"],
    },
  },
  pearls: [
    { highlight: "Fanconi in infancy", pearl: "Fanconi syndrome (glycosuria + normal blood glucose, phosphaturia, aminoaciduria, bicarbonaturia) in an infant — cystinosis is the first diagnosis to exclude. Do leucocyte cystine." },
    { highlight: "Failure to thrive + photophobia", pearl: "Failure to thrive plus photophobia in an infant is cystinosis until proven otherwise. Slit lamp + leucocyte cystine are the immediate next steps." },
    { highlight: "Cysteamine is lifelong", pearl: "Transplant corrects renal failure but does NOT cure cystinosis. Cysteamine must continue post-transplant to prevent extrarenal disease (muscle, brain, eye, pancreas)." },
    { highlight: "Indian mutation profile", pearl: "The 57kb deletion is common in European patients but NOT in Indian/South Asian patients. CTNS full sequencing essential — deletion analysis alone will miss diagnosis." },
    { highlight: "Corneal crystals — timing", pearl: "Corneal crystals appear from age 1–2 years. Before age 1, slit lamp may be negative even in confirmed cystinosis. Rely on leucocyte cystine for early diagnosis." },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// aHUS CONFIG
// ═══════════════════════════════════════════════════════════════════════════════
const AHUS_CONFIG = {
  title: "aHUS (Atypical HUS)", shortTitle: "aHUS", emoji: "🔴",
  headerGradient: "from-red-700 to-rose-800",
  btnClass: "bg-red-600 hover:bg-red-700",
  badges: ["Complement-mediated TMA", "CFH/CFI/CD46/C3/CFB", "Eculizumab Therapy"],
  subtitle: "TMA differentiation tool. Score guides urgency of complement testing and eculizumab decision.",
  domains: [
    {
      id: "tma", label: "TMA Features", icon: "🩸", color: "red",
      features: [
        { id: "microangiopathy", label: "Microangiopathic haemolytic anaemia (MAHA) — schistocytes on film", weight: 5 },
        { id: "thrombocytopenia", label: "Thrombocytopenia (<150 × 10⁹/L)", weight: 4 },
        { id: "aki", label: "Acute kidney injury (elevated creatinine, oliguria)", weight: 4 },
        { id: "stec_negative", label: "STEC-negative (cultures, PCR, Shiga toxin all negative)", weight: 5 },
        { id: "adamts13_normal", label: "ADAMTS13 activity normal (>10% — excludes TTP)", weight: 5 },
      ]
    },
    {
      id: "complement", label: "Complement Markers", icon: "🧬", color: "violet",
      features: [
        { id: "low_c3", label: "Low C3 with normal C4 (alternative pathway activation)", weight: 5 },
        { id: "low_ch50", label: "Low CH50/AP50 (complement consumption)", weight: 4 },
        { id: "anti_cfh", label: "Anti-CFH antibodies detected", weight: 6 },
        { id: "sc5b9_elevated", label: "Elevated sC5b-9 (terminal complement complex)", weight: 5 },
      ]
    },
    {
      id: "clinical", label: "Clinical Context", icon: "🏥", color: "orange",
      features: [
        { id: "recurrent_tma", label: "Recurrent TMA episode (previous unexplained episode)", weight: 6 },
        { id: "postpartum_tma", label: "Post-partum TMA (delivery-triggered)", weight: 5 },
        { id: "transplant_tma", label: "TMA after kidney transplant", weight: 5 },
        { id: "trigger_absent", label: "No clear infectious / secondary trigger identified", weight: 3 },
      ]
    },
    {
      id: "family", label: "Family History", icon: "👨‍👩‍👧", color: "purple",
      features: [
        { id: "family_tma", label: "Family history of TMA / HUS / unexplained renal failure", weight: 5 },
        { id: "consang_ahus", label: "Parental consanguinity (raises AR complement mutation)", weight: 3 },
      ]
    },
  ],
  getRisk(total) {
    if (total === 0) return { level: "Low aHUS Suspicion", key: "low", badge: "bg-green-100 text-green-800", alert: "bg-green-50 border-green-200", icon: CheckCircle, iconColor: "text-green-600" };
    if (total <= 6) return { level: "Possible aHUS — Investigate Complement", key: "possible", badge: "bg-amber-100 text-amber-800", alert: "bg-amber-50 border-amber-300", icon: AlertTriangle, iconColor: "text-amber-600" };
    if (total <= 15) return { level: "High Suspicion aHUS — Consider Eculizumab", key: "high", badge: "bg-orange-100 text-orange-800", alert: "bg-orange-50 border-orange-300", icon: AlertTriangle, iconColor: "text-orange-600" };
    return { level: "URGENT aHUS — Start Eculizumab", key: "urgent", badge: "bg-red-100 text-red-800", alert: "bg-red-50 border-red-400 border-2", icon: AlertTriangle, iconColor: "text-red-600" };
  },
  guidance: {
    low: {
      summary: "Low probability of aHUS. Ensure STEC-HUS, TTP, and secondary TMA causes are excluded.",
      actions: [
        { icon: "🔬", label: "Exclude STEC and TTP", detail: "STEC culture + PCR + Shiga toxin. ADAMTS13 activity. Complete complement profile." },
        { icon: "📋", label: "Secondary TMA Causes", detail: "Consider: medications (quinine, calcineurin inhibitors), pregnancy, SLE/antiphospholipid, malignancy, HIV." },
      ],
      investigations: ["ADAMTS13 activity", "STEC cultures + PCR", "Shiga toxin assay", "C3, C4, CH50, AP50", "ANA, anti-dsDNA, APS antibodies"],
    },
    possible: {
      summary: "Some features suggest aHUS. Complement workup is urgent. Eculizumab decision should be made with specialist input.",
      actions: [
        { icon: "🧬", label: "Complement Genetic Panel (Urgent)", detail: "CFH, CFI, CD46, C3, CFB, THBD, DGKE sequencing. Anti-CFH antibodies. Results guide transplant risk stratification." },
        { icon: "💉", label: "Consider Eculizumab", detail: "If TMA progression despite supportive care, eculizumab decision should not wait for genetic results. Discuss with nephrologist." },
        { icon: "🏥", label: "Nephrology + Haematology", detail: "Joint management — TMA workup, renal biopsy (TMA histology on EM), plasma exchange if eculizumab unavailable." },
      ],
      investigations: ["Complement genetics (CFH/CFI/CD46/C3/CFB/THBD/DGKE)", "Anti-CFH IgG antibodies", "sC5b-9 (terminal complement)", "Renal biopsy — TMA pattern on LM and EM", "Blood film daily for schistocytes, LDH, haptoglobin", "ADAMTS13 activity (confirm >10%)"],
    },
    high: {
      summary: "High-probability aHUS. Eculizumab should be considered strongly. Do not wait for genetic results if clinical deterioration.",
      actions: [
        { icon: "💉", label: "Start Eculizumab (Urgent Discussion)", detail: "900 mg weekly × 4, then 1200 mg every 2 weeks (adults). Weight-based dosing in children. Meningococcal vaccine + prophylaxis required." },
        { icon: "🧬", label: "Complement Panel + Anti-CFH Antibodies", detail: "Anti-CFH antibodies: ~10% of aHUS — treatable with plasma exchange + immunosuppression. Results guide long-term management." },
        { icon: "🏥", label: "Renal Biopsy", detail: "TMA on biopsy: arteriolar fibrinoid necrosis, endothelial swelling, thrombotic occlusion. Confirms microangiopathic process." },
        { icon: "⚠️", label: "Transplant Planning", detail: "Recurrence risk: CFH/CFI/C3/CFB mutations — HIGH. Peri-transplant eculizumab mandatory. CD46 mutations: LOW recurrence risk." },
      ],
      investigations: ["Complement genetics panel (expedited)", "Anti-CFH antibodies + CFHR1/3 deletion", "sC5b-9", "Renal biopsy (TMA)", "Blood film, LDH, haptoglobin, reticulocytes", "Meningococcal antibody status before eculizumab"],
    },
    urgent: {
      summary: "URGENT aHUS. Start eculizumab without delay. Coordinate haematology, nephrology, genetics. Meningococcal prophylaxis before first dose.",
      actions: [
        { icon: "🚨", label: "START ECULIZUMAB TODAY", detail: "Vaccinate against N. meningitidis (ACWY + B). Give prophylactic penicillin V if vaccine not yet 2 weeks prior. Do NOT delay eculizumab for vaccine response." },
        { icon: "🧬", label: "Complement Panel (STAT)", detail: "Send complement genetics urgent. Anti-CFH antibodies if positive → add plasma exchange + rituximab/steroids." },
        { icon: "🏥", label: "ICU-Level Monitoring", detail: "Daily blood film, LDH, Hb, platelets, creatinine, BP. Dialysis if required. Plasma exchange as bridge if eculizumab delayed." },
        { icon: "📅", label: "Lifelong Eculizumab Monitoring", detail: "Monthly LDH, Hb, platelets, creatinine before each infusion. Anti-CFH titre 3-monthly. Meningococcal antibody annually." },
      ],
      investigations: ["STAT complement genetics", "STAT anti-CFH antibodies", "Meningococcal serology", "Daily TMA panel (blood film, LDH, Hb, platelets, creatinine)", "Renal biopsy when stable", "ADAMTS13 (confirm normal)"],
    },
  },
  pearls: [
    { highlight: "ADAMTS13 >10% = not TTP", pearl: "ADAMTS13 activity >10% effectively rules out TTP. This is a critical step — TTP requires plasma exchange urgently, aHUS requires eculizumab. Do not delay either." },
    { highlight: "Recurrence post-transplant", pearl: "CFH and CFI mutations carry >80% recurrence risk post-transplant without eculizumab prophylaxis. CD46 mutations have <20% recurrence. Gene result is essential for transplant planning." },
    { highlight: "Anti-CFH antibodies", pearl: "Anti-CFH antibodies (seen with CFHR1/3 deletion) cause aHUS but respond to plasma exchange + immunosuppression (rituximab). A distinct and treatable subset." },
    { highlight: "No genetic mutation found", pearl: "~30–40% of aHUS patients have no identified complement mutation. Clinical diagnosis is still valid — treat with eculizumab based on clinical criteria." },
    { highlight: "Vaccine before eculizumab", pearl: "Eculizumab blocks terminal complement — dramatically increases meningococcal risk. Vaccinate (ACWY + B) and prescribe penicillin V prophylaxis. Do not delay eculizumab for vaccination." },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// PH1 (Primary Hyperoxaluria Type 1) CONFIG
// ═══════════════════════════════════════════════════════════════════════════════
const PH1_CONFIG = {
  title: "Primary Hyperoxaluria Type 1 (PH1)", shortTitle: "PH1", emoji: "🪨",
  headerGradient: "from-orange-600 to-amber-700",
  btnClass: "bg-orange-600 hover:bg-orange-700",
  badges: ["AGXT Gene · AR", "Hepatic AGT Deficiency", "Lumasiran · siRNA Therapy"],
  subtitle: "Early PH1 recognition enables lumasiran therapy and prevents systemic oxalosis and early ESRD.",
  domains: [
    {
      id: "stones", label: "Stone Disease", icon: "🪨", color: "orange",
      features: [
        { id: "first_stone_under5", label: "First kidney stone episode before age 5 years", weight: 6 },
        { id: "bilateral_stones", label: "Bilateral kidney stones or nephrocalcinosis", weight: 5 },
        { id: "recurrent_stones", label: "Recurrent calcium oxalate stones", weight: 4 },
        { id: "stone_child", label: "Any kidney stone in a child <10 years", weight: 5 },
      ]
    },
    {
      id: "nc", label: "Nephrocalcinosis", icon: "🫘", color: "amber",
      features: [
        { id: "medullary_nc", label: "Medullary nephrocalcinosis on ultrasound", weight: 4 },
        { id: "diffuse_nc", label: "Diffuse / cortical nephrocalcinosis", weight: 5 },
        { id: "nc_infant", label: "Nephrocalcinosis in infant/neonate", weight: 6 },
      ]
    },
    {
      id: "systemic", label: "Systemic Oxalosis", icon: "🦴", color: "red",
      features: [
        { id: "retinal_oxalate", label: "Retinal oxalate crystals (seen on fundoscopy)", weight: 6 },
        { id: "bone_oxalosis", label: "Oxalate deposits in bone (sclerotic metaphyseal bands on X-ray)", weight: 5 },
        { id: "cardiac_oxalate", label: "Cardiac conduction abnormality + CKD (oxalate deposits)", weight: 4 },
      ]
    },
    {
      id: "labs", label: "Biochemical Markers", icon: "🧪", color: "blue",
      features: [
        { id: "high_urine_oxalate", label: "24h urine oxalate >0.5 mmol/1.73m²/day", weight: 6 },
        { id: "high_plasma_oxalate", label: "Plasma oxalate >10 μmol/L (especially with low eGFR)", weight: 5 },
        { id: "urine_glycolate", label: "Elevated urine glycolate (specific for PH1)", weight: 5 },
      ]
    },
    {
      id: "family", label: "Family History", icon: "👨‍👩‍👧", color: "purple",
      features: [
        { id: "consang_ph1", label: "Parental consanguinity", weight: 3 },
        { id: "fam_stones", label: "Sibling with kidney stones or nephrocalcinosis", weight: 4 },
        { id: "fam_esrd_young", label: "Family member with ESRD before age 30 from unknown cause", weight: 4 },
      ]
    },
  ],
  getRisk(total) {
    if (total === 0) return { level: "Low PH1 Suspicion", key: "low", badge: "bg-green-100 text-green-800", alert: "bg-green-50 border-green-200", icon: CheckCircle, iconColor: "text-green-600" };
    if (total <= 6) return { level: "Possible PH1 — Metabolic Workup", key: "possible", badge: "bg-amber-100 text-amber-800", alert: "bg-amber-50 border-amber-300", icon: AlertTriangle, iconColor: "text-amber-600" };
    if (total <= 14) return { level: "High Suspicion PH1 — Urgent Genetics", key: "high", badge: "bg-orange-100 text-orange-800", alert: "bg-orange-50 border-orange-300", icon: AlertTriangle, iconColor: "text-orange-600" };
    return { level: "Urgent PH1 — Start Lumasiran / Multi-organ Assessment", key: "urgent", badge: "bg-red-100 text-red-800", alert: "bg-red-50 border-red-400 border-2", icon: AlertTriangle, iconColor: "text-red-600" };
  },
  guidance: {
    low: {
      summary: "Low PH1 probability. Consider metabolic stone workup if any stone episode occurs.",
      actions: [{ icon: "📋", label: "Standard Metabolic Workup if Stone Occurs", detail: "24h urine calcium, oxalate, citrate, uric acid, cystine. Stone composition analysis if stone retrieved." }],
      investigations: [],
    },
    possible: {
      summary: "Some features suggest PH1. 24h urine oxalate and AGXT sequencing are the key next steps.",
      actions: [
        { icon: "🧪", label: "24h Urine Oxalate", detail: "PH1 diagnostic if >0.5 mmol/1.73m²/day. Also check glycolate (elevated in PH1, not PH2/3)." },
        { icon: "🧬", label: "AGXT Gene Sequencing", detail: "Full AGXT sequencing + deletion analysis. G170R mutation in 30% of European — responds to pyridoxine." },
        { icon: "💧", label: "High Fluid Intake", detail: "Start aggressive fluid therapy (3–4 L/m²/day) immediately to dilute urine oxalate while workup proceeds." },
      ],
      investigations: ["24h urine oxalate + glycolate + citrate + calcium", "Spot urine oxalate:creatinine ratio", "Plasma oxalate (if eGFR <30)", "AGXT gene sequencing", "Liver biopsy for AGT enzyme assay (if sequencing inconclusive)", "Renal ultrasound (bilateral NC)"],
    },
    high: {
      summary: "High probability PH1. Start lumasiran urgently pending confirmation. AGXT sequencing and metabolic studies essential.",
      actions: [
        { icon: "💊", label: "Lumasiran (Oxlumo) — Start Urgently", detail: "siRNA drug approved for PH1 in all ages. SC injection monthly × 3 loading doses, then quarterly. Dramatically reduces urine oxalate. Start pending genetic confirmation if clinical probability high." },
        { icon: "🧬", label: "AGXT Sequencing (Urgent)", detail: "Pyridoxine trial (G170R mutation responsive — 5–20 mg/kg/day pyridoxine). Genotype determines response." },
        { icon: "🏥", label: "Nephrology + Metabolic Genetics Referral", detail: "Combined specialist management essential. OHF (Oxalosis and Hyperoxaluria Foundation) guidelines." },
        { icon: "🫘", label: "Pre-transplant Oxalate Control", detail: "If eGFR <30, plasma oxalate must be <15 μmol/L before isolated kidney transplant. Combined liver-kidney transplant if oxalate not controlled." },
      ],
      investigations: ["24h urine oxalate (urgent)", "AGXT sequencing (expedited)", "Plasma oxalate (if CKD)", "Ophthalmology (retinal oxalate crystals)", "Echocardiogram + ECG (cardiac oxalosis)", "Bone survey (metaphyseal oxalate bands)", "Renal biopsy (birefringent oxalate crystals under polarized light)"],
    },
    urgent: {
      summary: "Highly probable PH1 with systemic oxalosis features. Urgent lumasiran initiation, multi-organ assessment, and transplant planning required.",
      actions: [
        { icon: "🚨", label: "START LUMASIRAN IMMEDIATELY", detail: "Contact specialist pharmacy. SC lumasiran (Oxlumo). Loading: weight-based monthly × 3. Maintenance quarterly. Also start high-dose pyridoxine pending genotype." },
        { icon: "🏥", label: "Multi-organ Oxalosis Assessment", detail: "Ophthalmology (retinal oxalate), cardiology (conduction), bone X-ray (metaphyseal bands), nerve conduction if peripheral neuropathy." },
        { icon: "💉", label: "Intensive Dialysis if ESRD", detail: "Daily/prolonged HD to lower plasma oxalate before transplant. Target plasma oxalate <15 μmol/L pre-transplant." },
        { icon: "🫘", label: "Transplant Decision", detail: "Lumasiran now enables isolated kidney transplant in most PH1 patients. Confirm AGXT genotype first. Combined liver-kidney if lumasiran not available or ineffective." },
      ],
      investigations: ["STAT plasma oxalate", "AGXT sequencing (expedited)", "Ophthalmology urgent", "Cardiac + bone assessment", "Plasma oxalate monitoring every 2 weeks on lumasiran"],
    },
  },
  pearls: [
    { highlight: "Stone <5 years = PH until proven otherwise", pearl: "Any kidney stone in a child under 5 years mandates 24h urine oxalate and AGXT sequencing. PH1 is the most dangerous cause and the one that benefits most from early treatment." },
    { highlight: "Lumasiran is first-line", pearl: "Lumasiran (siRNA — Oxlumo) is now first-line for all PH1 patients regardless of renal function. It reduces hepatic oxalate production by >65%. Start it early — before CKD develops." },
    { highlight: "Pyridoxine response", pearl: "~30% of PH1 patients (mainly G170R mutation) respond to high-dose pyridoxine. Always trial pyridoxine while awaiting genotype result." },
    { highlight: "Isolated kidney transplant now possible", pearl: "With lumasiran controlling oxalate production, isolated kidney transplant is now feasible for most PH1 patients. Pre-transplant plasma oxalate <15 μmol/L is the target." },
    { highlight: "Retinal oxalate = systemic disease", pearl: "Retinal oxalate crystals visible on fundoscopy indicate severe systemic oxalosis. They indicate extensive extra-renal deposition and are a marker of advanced disease." },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════════════════
const TOOLS = [
  { id: "alport", label: "Alport Syndrome", emoji: "🧬", config: ALPORT_CONFIG },
  { id: "cystinosis", label: "Cystinosis", emoji: "💎", config: CYSTINOSIS_CONFIG },
  { id: "ahus", label: "aHUS", emoji: "🔴", config: AHUS_CONFIG },
  { id: "ph1", label: "PH Type 1", emoji: "🪨", config: PH1_CONFIG },
];

export default function OtherDiseaseScreeningTools({ isAdmin }) {
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl p-4 text-white">
        <h2 className="text-base font-bold mb-1">Rare Disease Screening Tools</h2>
        <p className="text-slate-300 text-xs mb-2">Weighted suspicion scoring for common pediatric rare kidney diseases. Select any disease below.</p>
        <Alert className="bg-amber-50/10 border-amber-400/30">
          <AlertDescription className="text-amber-200 text-xs">
            ⚠️ <strong>Learning Tool Only.</strong> These AI-assisted scoring tools are educational decision-support aids. They are NOT diagnostic tools. All clinical decisions must be made by a qualified clinician. Clinician discretion is advised. <strong>Rare Disease Module by Swarnim.</strong>
          </AlertDescription>
        </Alert>
      </div>

      <Tabs defaultValue="alport">
        <TabsList className="w-full grid grid-cols-4 bg-white border border-slate-200 rounded-xl p-1 mb-4">
          {TOOLS.map(t => (
            <TabsTrigger key={t.id} value={t.id} className="text-xs rounded-lg data-[state=active]:bg-slate-700 data-[state=active]:text-white flex flex-col items-center gap-0.5 py-2">
              <span>{t.emoji}</span>
              <span className="leading-tight text-center">{t.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        {TOOLS.map(t => (
          <TabsContent key={t.id} value={t.id}>
            <ScreeningTool config={t.config} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}