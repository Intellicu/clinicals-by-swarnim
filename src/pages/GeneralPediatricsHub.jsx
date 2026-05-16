import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft, Baby, Syringe, Scale, TrendingUp, MessageCircle, Apple,
  Brain, Activity, ChevronDown, ChevronUp, Plus, Trash2, Loader2,
  Upload, Sparkles, Search, Globe, FileText, Pencil, Check, X, Star, Info
} from "lucide-react";
import { toast } from "sonner";
import GrowthMonitoringPathway from "../components/pathways/GrowthMonitoringPathway.jsx";
import PediatricNutritionPathway from "../components/pathways/PediatricNutritionPathway.jsx";
import VaccDrugChatbot from "../components/pediatrics/VaccDrugChatbot.jsx";
import SimpleVaccinationSchedule from "../components/pediatrics/SimpleVaccinationSchedule.jsx";
import NutritionIntakeTracker from "../components/pediatrics/NutritionIntakeTracker.jsx";
import InteractiveGrowthChart from "../components/pediatrics/InteractiveGrowthChart.jsx";

// ── Tab config ──────────────────────────────────────────────────────────────
const TABS = [
  { id: "assistant", label: "AI Assistant", icon: MessageCircle, color: "bg-green-600", badge: "AI" },
  { id: "vaccination", label: "Vaccines", icon: Syringe, color: "bg-blue-600" },
  { id: "growth", label: "Growth", icon: TrendingUp, color: "bg-purple-600" },
  { id: "nutrition", label: "Nutrition", icon: Apple, color: "bg-orange-600" },
  { id: "pathways", label: "Pathways", icon: Brain, color: "bg-teal-600" },
  { id: "guidelines", label: "Guidelines", icon: Scale, color: "bg-indigo-600" },
];

// ── Built-in clinical pathways ──────────────────────────────────────────────
const BUILT_IN_PATHWAYS = [
  {
    id: "sam",
    name: "SAM Management",
    full: "Severe Acute Malnutrition (SAM) — WHO/IAP Protocol",
    color: "amber",
    badge: "Nutrition Emergency",
    overview: "SAM in children <5 years: weight-for-height Z-score <-3SD or MUAC <11.5 cm or bilateral pitting oedema. Affects ~14 million children in India. Leading cause of under-5 mortality. Facility-based management (F-MAS) for complicated SAM; community-based CMAM with RUTF for uncomplicated.",
    criteria: [
      "MUAC <11.5 cm (severe), 11.5–12.5 cm (moderate)",
      "Weight-for-height Z-score (WHZ) < -3 SD (severe)",
      "Bilateral pitting oedema (any degree = SAM regardless of weight)",
      "Kwashiorkor: oedema + skin changes + hair changes",
      "Marasmus: severe wasting, wizened appearance, preserves mentation",
      "Marasmic-kwashiorkor: mixed form — worst prognosis",
    ],
    danger_signs: [
      "Shock: cold extremities, weak/absent radial pulse, drowsy/unconscious",
      "Severe respiratory distress",
      "Lower respiratory tract infection",
      "Severe dehydration (estimate: child with diarrhoea only)",
      "Severe anaemia (Hb <4 g/dL or 4-6 with respiratory distress)",
      "Hypoglycaemia (blood glucose <3 mmol/L or 54 mg/dL)",
      "Hypothermia (axillary temp <35.5°C or rectal <36°C)",
      "Visual changes (xerophthalmia, corneal ulcer) → Vitamin A deficiency",
    ],
    management: [
      "PHASE 1 (Stabilisation): F-75 formula (75 kcal/100mL); NO F-100 in early phase",
      "F-75 ml = 130 mL/kg/day for oedema; 100 mL/kg/day for marasmus",
      "Glucose 10% IV (5mL/kg) if hypoglycaemic AND unconscious",
      "Hypothermia: skin-to-skin, warm room, hat, no IV fluids unless shocked",
      "SHOCK: ReSoMal or half-normal saline + 5% glucose: 15 mL/kg over 1h; reassess",
      "ANTIBIOTICS: ALL SAM → amoxicillin (uncomplicated) OR ampicillin + gentamicin (complicated)",
      "TRANSITION (Day 2-7): Switch to F-100 when: oedema reducing, eating, no infection",
      "REHABILITATION (Phase 2): F-100 or RUTF; 150-220 kcal/kg/day; weekly weight gain >10-15 g/kg/day",
      "RUTF (Plumpy'Nut): 200 kcal/sachet; 200 kcal/kg/day; do NOT mix with water",
      "Micronutrients: Vitamin A D3 E K, zinc, folate, Fe (ONLY in rehabilitation phase — NOT in stabilisation)",
      "Iron: start ONLY when weight gaining; premature iron worsens oxidative stress",
      "DISCHARGE criteria: WHZ > -2 SD; MUAC > 12.5 cm; no oedema; eating well; no medical complications",
    ],
    monitoring: [
      "Weight DAILY (morning, naked, same time)",
      "Blood glucose: every 30 min if hypoglycaemic until stable",
      "Temperature: every 6 hours",
      "Pulse rate + respiratory rate: every 30 min if shocked",
      "Fluid balance: input/output charting",
      "Oedema grading: + (foot/ankle), ++ (lower limb+), +++ (generalised)",
      "Weekly: height/length, MUAC, appetite test (RUTF)",
      "Alert if weight loss, return of oedema, refusal to eat, fever worsening",
    ],
    references: ["WHO SAM Protocol 2013", "IAP SAM Guidelines 2023", "NIN India 2020", "CMAM Forum 2022"]
  },
  {
    id: "child-dev",
    name: "Child Development",
    full: "Child Development Monitoring — Developmental Surveillance & Milestones",
    color: "teal",
    badge: "Developmental",
    overview: "Developmental surveillance (every well-child visit) + developmental screening (standardised tools at 9, 18, 24/30 months, and when concern arises). Flag early for intervention — optimal neuroplasticity window is birth to 3 years. CDC milestones (2022 revised) are the standard; IAP/WHO norms adapted for Indian populations.",
    criteria: [
      "Gross Motor: holds head 3m, sits 6m, walks 12m, runs 18m, stairs 24m, tricycle 36m",
      "Fine Motor: transfers 6m, pincer 9m, scribbles 12m, tower 2 blocks 15m, copies circle 3y",
      "Language: coos 2m, babbles 6m, words 12m, 2-word phrases 24m, sentences 36m",
      "Social/Adaptive: smiles 2m, stranger anxiety 9m, parallel play 2y, interactive play 3y",
      "Red flags: No babble by 12m, no words by 16m, no 2-word phrases by 24m, ANY regression",
      "Vision: follows 2m, binocular fixation 4m; refer if squint, nystagmus, no response to visual threat",
    ],
    danger_signs: [
      "No social smile by 3 months",
      "No babbling by 12 months",
      "No single words by 16 months",
      "No 2-word spontaneous phrases by 24 months",
      "Loss of previously acquired language or social skills at any age",
      "Failure to walk by 18 months",
      "Persistent fisting beyond 4 months",
      "Persistent tonic neck reflex beyond 6 months",
    ],
    management: [
      "SCREENING TOOLS: M-CHAT-R/F (autism 16-30m), PEDS (all ages), DASII (India)",
      "Refer to developmental paediatrician/child psychologist if screening positive",
      "Early intervention referral: physiotherapy, occupational therapy, speech therapy",
      "Early Intervention Centre (EIC) — under 6 years (National Trust Act, India)",
      "Sarva Shiksha Abhiyan: Inclusive education support for school-age children",
      "Parent counselling: books, play, responsive parenting, screen time limits (<1h <5y)",
      "Nutritional adequacy: iron, iodine, DHA for brain development",
      "Hearing screen: at birth (OAE/AABR), recheck if concern at any age",
      "Vision screen: cover test, red reflex at birth; formal test before school entry",
      "Developmental follow-up: every 3 months in first 2 years for high-risk neonates",
    ],
    monitoring: [
      "Plot developmental milestones at every well-child visit",
      "Use structured surveillance questions (CDC/IAP Parent questionnaire)",
      "Document milestone acquisition date — not just 'appropriate for age'",
      "M-CHAT-R: complete at 16–30 months routinely",
      "Head circumference: plot every visit up to 2 years",
      "Growth monitoring: weight, height, HC at same visit as developmental check",
      "School performance: obtain teacher report from age 5",
      "Behaviour screen: SDQ (Strengths and Difficulties Questionnaire) from age 4",
    ],
    references: ["CDC Developmental Milestones 2022", "IAP Child Development Guidelines 2021", "WHO IMCI 2024", "NIN India 2019"]
  },
  {
    id: "autism",
    name: "Autism Screening (M-CHAT)",
    full: "Autism Spectrum Disorder (ASD) — Screening & Early Intervention Pathway",
    color: "violet",
    badge: "Neurodevelopmental",
    overview: "ASD prevalence: ~1 in 100 children globally; 1 in 66 in India (INCLEN 2017). Early detection (before age 2-3) and intensive early intervention dramatically improves outcomes. Universal screening at 18 and 24 months is recommended. Early referral is critical.",
    criteria: [
      "Core features: persistent deficits in social communication + interaction (across contexts)",
      "Restricted/repetitive behaviours, interests, or activities (RRBs)",
      "Symptoms present from early developmental period (not necessarily presenting early)",
      "Cause clinically significant impairment in social, occupational, or other areas",
      "DSM-5 specifiers: with/without intellectual impairment, language impairment, known genetic/medical condition",
      "ASD levels 1-3: Level 1 (requiring support), Level 2 (substantial support), Level 3 (very substantial support)",
    ],
    danger_signs: [
      "No back-and-forth sharing of sounds, smiles, or facial expressions by 9 months",
      "No babbling by 12 months",
      "No pointing, showing, reaching, or waving by 12 months",
      "No words by 16 months",
      "No meaningful 2-word phrases (not echolalia) by 24 months",
      "Any loss of speech or social skills at any age",
      "No response to own name by 12 months",
      "Not pointing to show interest (proto-declarative pointing) by 14 months",
    ],
    management: [
      "SCREENING: M-CHAT-R/F at 16, 18, and 24 months — all children (not just high-risk)",
      "M-CHAT-R/F scoring: 0-2 low risk; 3-7 medium risk (follow-up interview); 8+ high risk (refer immediately)",
      "ADOS-2: Gold standard diagnostic tool (specialist referral)",
      "ADI-R: Autism Diagnostic Interview (caregiver interview)",
      "AIIMS ISAA: Indian Scale for Assessment of Autism — validated for Indian context",
      "REFERRAL PATHWAY: Developmental paediatrician → Child psychiatrist → NIMHANS / AIIMS",
      "EARLY INTERVENTION (<3 years): ABA (Applied Behaviour Analysis), Early Intensive Behavioural Intervention (EIBI)",
      "Speech and Language Therapy: core component — begin as early as diagnosis",
      "Occupational Therapy: sensory processing, ADL skills, handwriting",
      "Social skills training: from school age; parent-mediated interventions for <3y",
      "EDUCATION: Inclusive education (RTE 2009), special schools, resource rooms",
      "INDIA RESOURCES: National Trust (nationaltrustIndia.gov.in), ASHA workers, Anganwadi referral",
      "CO-MORBIDITIES: ADHD (50-70%), anxiety, intellectual disability, epilepsy (25-30%), sleep disorders",
      "MEDICATIONS: No drug cures ASD; address comorbidities: melatonin for sleep, SSRIs for anxiety, risperidone/aripiprazole for irritability/aggression (ONLY if needed)",
    ],
    monitoring: [
      "M-CHAT-R/F: 16, 18, 24 months (routine), 30 months if any concern",
      "CARS-2 (Childhood Autism Rating Scale) annually: track severity",
      "Adaptive behaviour: Vineland Adaptive Behaviour Scales — baseline and annually",
      "IQ/cognitive: MISIC or Stanford-Binet (age >3) — baseline and at school entry",
      "Language assessment: annually by speech therapist",
      "Sensory profile: SPM-2 — every 2 years",
      "Epilepsy: EEG if any suspicion of seizures (25-30% lifetime risk)",
      "Sleep diary: every visit",
      "GI symptoms (50% ASD): dietary history, constipation/diarrhoea diary",
      "Parent stress and coping: PSI (Parenting Stress Index) annually",
    ],
    references: ["DSM-5 ASD Criteria 2013", "IAP Autism Guidelines 2022", "M-CHAT-R/F Robins 2014", "INCLEN India ASD 2017", "NIMHANS ASD Guidelines 2022"]
  }
];

const COLOR_MAP = {
  amber: { badge: "bg-amber-100 text-amber-800", header: "bg-amber-50 border-amber-200" },
  teal: { badge: "bg-teal-100 text-teal-800", header: "bg-teal-50 border-teal-200" },
  violet: { badge: "bg-violet-100 text-violet-800", header: "bg-violet-50 border-violet-200" },
  blue: { badge: "bg-blue-100 text-blue-800", header: "bg-blue-50 border-blue-200" },
  green: { badge: "bg-green-100 text-green-800", header: "bg-green-50 border-green-200" },
  rose: { badge: "bg-rose-100 text-rose-800", header: "bg-rose-50 border-rose-200" },
};

// ── Collapsible section ──────────────────────────────────────────────────────
function SectionCard({ title, items, isList = true }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 text-left">
        <span className="font-semibold text-sm text-slate-800">{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && (
        <div className="p-4 bg-white">
          {isList ? (
            <ul className="space-y-1.5">
              {items.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="text-indigo-400 font-bold min-w-[20px] mt-0.5">{i + 1}.</span>{item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-700 leading-relaxed">{items}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Edit modal for built-in pathways (admin) ─────────────────────────────────
function EditPathwayModal({ pathway, onSave, onClose }) {
  const [data, setData] = useState({
    full: pathway.full,
    badge: pathway.badge,
    overview: pathway.overview,
    criteria: pathway.criteria.join('\n'),
    danger_signs: pathway.danger_signs.join('\n'),
    management: pathway.management.join('\n'),
    monitoring: pathway.monitoring.join('\n'),
    references: pathway.references.join('\n'),
  });

  const handleSave = () => {
    onSave({
      ...pathway,
      full: data.full,
      badge: data.badge,
      overview: data.overview,
      criteria: data.criteria.split('\n').filter(s => s.trim()),
      danger_signs: data.danger_signs.split('\n').filter(s => s.trim()),
      management: data.management.split('\n').filter(s => s.trim()),
      monitoring: data.monitoring.split('\n').filter(s => s.trim()),
      references: data.references.split('\n').filter(s => s.trim()),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-3 pb-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Pencil className="w-4 h-4 text-blue-600" /> Edit Pathway
          </h3>
          <button onClick={onClose}><X className="w-4 h-4 text-slate-400" /></button>
        </div>
        <div className="p-4 space-y-3">
          {[
            { label: "Full Title", key: "full", rows: 1 },
            { label: "Badge Label", key: "badge", rows: 1 },
            { label: "Overview", key: "overview", rows: 4 },
            { label: "Criteria (one per line)", key: "criteria", rows: 5 },
            { label: "Danger Signs (one per line)", key: "danger_signs", rows: 5 },
            { label: "Management Steps (one per line)", key: "management", rows: 8 },
            { label: "Monitoring (one per line)", key: "monitoring", rows: 5 },
            { label: "References (one per line)", key: "references", rows: 3 },
          ].map(f => (
            <div key={f.key}>
              <Label className="text-xs font-semibold text-slate-600">{f.label}</Label>
              <Textarea
                value={data[f.key]}
                onChange={e => setData(d => ({ ...d, [f.key]: e.target.value }))}
                rows={f.rows}
                className="mt-1 text-sm resize-y"
              />
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} size="sm" className="bg-blue-600 hover:bg-blue-700 flex-1">
              <Check className="w-3.5 h-3.5 mr-1" /> Save Changes
            </Button>
            <Button onClick={onClose} size="sm" variant="outline">Cancel</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Pathway display card ─────────────────────────────────────────────────────
function PathwayCard({ pathway, isAdmin, onEdit }) {
  const c = COLOR_MAP[pathway.color] || COLOR_MAP.blue;
  return (
    <Card className="bg-white border border-slate-200 shadow-sm">
      <CardHeader className={`border-b py-4 px-5 ${c.header}`}>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex-1">
            <CardTitle className="text-base">{pathway.full}</CardTitle>
            <Badge className={`${c.badge} mt-2 text-xs`}>{pathway.badge}</Badge>
          </div>
          {isAdmin && (
            <Button size="sm" variant="outline"
              className="h-7 text-xs border-blue-200 text-blue-700 hover:bg-blue-50 flex-shrink-0"
              onClick={() => onEdit(pathway)}>
              <Pencil className="w-3 h-3 mr-1" /> Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <SectionCard title="Overview" items={pathway.overview} isList={false} />
        <SectionCard title="📋 Criteria / Features" items={pathway.criteria} />
        <SectionCard title="🚨 Danger Signs / Red Flags" items={pathway.danger_signs} />
        <SectionCard title="🩺 Management Protocol" items={pathway.management} />
        <SectionCard title="📊 Monitoring" items={pathway.monitoring} />
        <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
          <p className="text-xs font-semibold text-slate-600 mb-1">References</p>
          <div className="flex flex-wrap gap-1.5">
            {pathway.references.map((r, i) => (
              <Badge key={i} variant="outline" className="text-xs">{r}</Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── AI Pathway Generator (admin) ─────────────────────────────────────────────
function AIPathwayGenerator({ onGenerated }) {
  const [mode, setMode] = useState("web");
  const [topic, setTopic] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const qc = useQueryClient();

  const generate = async () => {
    if (!topic.trim() && !file) { toast.error("Enter a topic or upload a document"); return; }
    setLoading(true);
    toast.info("AI generating pathway — this may take 30-60 seconds…");
    try {
      let fileUrls = [];
      if (file) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        fileUrls = [file_url];
      }
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert pediatric physician. Generate a comprehensive clinical pathway for: "${topic || 'the uploaded document topic'}".
${file ? 'Use the uploaded document as primary source.' : 'Use current evidence-based guidelines, WHO, IAP, AAP standards.'}
Return a detailed clinical pathway JSON with these exact fields:
- name, full, badge, color (one of: amber/teal/violet/blue/green/rose), overview (paragraph),
- criteria (array), danger_signs (array), management (array 10-15 items), monitoring (array), references (array)`,
        file_urls: fileUrls.length ? fileUrls : undefined,
        add_context_from_internet: !file,
        model: "claude_sonnet_4_6",
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" }, full: { type: "string" }, badge: { type: "string" }, color: { type: "string" },
            overview: { type: "string" },
            criteria: { type: "array", items: { type: "string" } },
            danger_signs: { type: "array", items: { type: "string" } },
            management: { type: "array", items: { type: "string" } },
            monitoring: { type: "array", items: { type: "string" } },
            references: { type: "array", items: { type: "string" } },
          }
        }
      });
      await base44.entities.CustomSection.create({
        title: res.full || res.name, section_type: "pathway",
        content: res, status: "draft", created_by_admin: true,
      });
      qc.invalidateQueries({ queryKey: ["custom-pathways"] });
      toast.success("Pathway generated! Review drafts below.");
      setTopic(""); setFile(null);
      onGenerated?.();
    } catch (e) {
      toast.error("Generation failed — " + (e.message || "unknown error"));
    }
    setLoading(false);
  };

  return (
    <div className="bg-gradient-to-br from-violet-50 to-indigo-50 border-2 border-violet-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-violet-600" />
        <h3 className="text-sm font-bold text-violet-900">AI Pathway Generator</h3>
        <Badge className="bg-violet-100 text-violet-700 text-xs">Uses AI Credits</Badge>
      </div>
      <Alert className="bg-amber-50 border-amber-200 py-2">
        <AlertDescription className="text-xs text-amber-800">
          AI-generated pathways saved as <strong>drafts</strong> — review before publishing.
        </AlertDescription>
      </Alert>
      <div className="flex gap-2">
        <button onClick={() => setMode("web")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold border transition-colors ${mode === "web" ? "bg-violet-600 text-white border-violet-600" : "bg-white text-slate-600 border-slate-200 hover:bg-violet-50"}`}>
          <Globe className="w-3.5 h-3.5" />Web Search
        </button>
        <button onClick={() => setMode("file")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold border transition-colors ${mode === "file" ? "bg-violet-600 text-white border-violet-600" : "bg-white text-slate-600 border-slate-200 hover:bg-violet-50"}`}>
          <Upload className="w-3.5 h-3.5" />Upload Document
        </button>
      </div>
      <div>
        <Label className="text-xs font-semibold text-slate-700">Pathway Topic *</Label>
        <Input value={topic} onChange={e => setTopic(e.target.value)}
          placeholder="e.g. Kawasaki Disease, Neonatal Sepsis, Febrile Seizures…"
          className="mt-1 h-9 text-sm bg-white" />
      </div>
      {mode === "file" && (
        <div>
          <input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" id="pathway-doc-upload" className="hidden"
            onChange={e => setFile(e.target.files?.[0] || null)} />
          <label htmlFor="pathway-doc-upload"
            className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-violet-300 text-violet-700 rounded-lg bg-white hover:bg-violet-50">
            <Upload className="w-3.5 h-3.5" />{file ? file.name : "Choose file (PDF/image/doc)"}
          </label>
        </div>
      )}
      <Button onClick={generate} disabled={loading} className="w-full bg-violet-600 hover:bg-violet-700 text-white h-9 text-sm">
        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating…</> : <><Sparkles className="w-4 h-4 mr-2" />Generate with AI</>}
      </Button>
    </div>
  );
}

// ── Custom pathway card (AI-generated) ──────────────────────────────────────
function CustomPathwayCard({ record, isAdmin, onDelete, onPublish }) {
  const data = record.content || {};
  const c = COLOR_MAP[data.color] || COLOR_MAP.blue;
  const isDraft = record.status === "draft";
  return (
    <Card className={`border-2 ${isDraft ? "border-amber-300" : "border-green-300"} bg-white`}>
      <CardHeader className={`border-b py-3 px-4 ${c.header}`}>
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <CardTitle className="text-sm">{data.full || record.title}</CardTitle>
            <div className="flex gap-1.5 mt-1.5 flex-wrap">
              {data.badge && <Badge className={`${c.badge} text-xs`}>{data.badge}</Badge>}
              <Badge className={isDraft ? "bg-amber-100 text-amber-700 text-xs" : "bg-green-100 text-green-700 text-xs"}>
                {isDraft ? "Draft" : "Published"}
              </Badge>
              <Badge className="bg-violet-100 text-violet-700 text-xs"><Sparkles className="w-2.5 h-2.5 mr-0.5 inline" />AI</Badge>
            </div>
          </div>
          {isAdmin && (
            <div className="flex gap-1.5">
              {isDraft && (
                <Button size="sm" onClick={() => onPublish(record.id)} className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white">
                  <Check className="w-3 h-3 mr-1" />Publish
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={() => onDelete(record.id)} className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50">
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        {data.overview && <SectionCard title="Overview" items={data.overview} isList={false} />}
        {data.criteria?.length > 0 && <SectionCard title="📋 Criteria" items={data.criteria} />}
        {data.danger_signs?.length > 0 && <SectionCard title="🚨 Danger Signs" items={data.danger_signs} />}
        {data.management?.length > 0 && <SectionCard title="🩺 Management" items={data.management} />}
        {data.monitoring?.length > 0 && <SectionCard title="📊 Monitoring" items={data.monitoring} />}
      </CardContent>
    </Card>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function GeneralPediatricsHub() {
  const [activeTab, setActiveTab] = useState("assistant");
  const [search, setSearch] = useState("");
  const [showGenerator, setShowGenerator] = useState(false);
  const [editingPathway, setEditingPathway] = useState(null);
  const [localOverrides, setLocalOverrides] = useState(() => {
    try { return JSON.parse(localStorage.getItem("peds_pathway_overrides") || "{}"); } catch { return {}; }
  });
  const qc = useQueryClient();

  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me() });
  const isAdmin = user?.role === "admin";

  const { data: customPathways = [] } = useQuery({
    queryKey: ["custom-pathways"],
    queryFn: () => base44.entities.CustomSection.filter({ section_type: "pathway" }, "-created_date", 50),
  });

  const handleDelete = async (id) => {
    await base44.entities.CustomSection.delete(id);
    qc.invalidateQueries({ queryKey: ["custom-pathways"] });
    toast.success("Pathway deleted");
  };

  const handlePublish = async (id) => {
    await base44.entities.CustomSection.update(id, { status: "published" });
    qc.invalidateQueries({ queryKey: ["custom-pathways"] });
    toast.success("Pathway published!");
  };

  // Save edited built-in pathway locally
  const handleSaveEdit = (updated) => {
    const overrides = { ...localOverrides, [updated.id]: updated };
    setLocalOverrides(overrides);
    localStorage.setItem("peds_pathway_overrides", JSON.stringify(overrides));
    setEditingPathway(null);
    toast.success("Pathway updated");
  };

  const publishedCustom = customPathways.filter(p => p.status === "published");
  const draftCustom = customPathways.filter(p => p.status === "draft");

  // Merge local admin overrides into built-in pathways
  const resolvedBuiltIn = BUILT_IN_PATHWAYS.map(p => localOverrides[p.id] ? { ...p, ...localOverrides[p.id] } : p);

  const filteredBuiltIn = resolvedBuiltIn.filter(p =>
    !search.trim() ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.full.toLowerCase().includes(search.toLowerCase()) ||
    p.badge.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b-2 border-slate-200 px-4 py-3 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3 max-w-5xl mx-auto">
          <Link to={createPageUrl("Hub")}>
            <Button variant="outline" size="sm" className="h-8 px-2 shrink-0">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center shadow shrink-0">
              <Baby className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-bold text-slate-900 leading-tight truncate">General Pediatrics Hub</h1>
              <p className="text-xs text-slate-500 hidden sm:block">IAP · WHO · Growth · Vaccination · SAM · ASD · Nutrition</p>
            </div>
          </div>
          {isAdmin && activeTab === "pathways" && (
            <Button size="sm" onClick={() => setShowGenerator(v => !v)}
              className="bg-violet-600 hover:bg-violet-700 text-white text-xs h-8 gap-1 flex-shrink-0">
              <Sparkles className="w-3.5 h-3.5" />{showGenerator ? "Close" : "AI Generate"}
            </Button>
          )}
        </div>
      </div>

      {/* Tab Bar */}
      <div className="bg-green-50 px-2 py-2 sticky top-[57px] z-10 shadow-sm border-b border-green-200">
        <div className="max-w-5xl mx-auto overflow-x-auto">
          <div className="flex gap-1.5 min-w-max">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`relative flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-lg min-w-[68px] transition-all text-xs font-semibold shadow-sm border
                    ${isActive ? `${tab.color} text-white border-transparent` : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>
                  <Icon className="w-4 h-4" />
                  <span className="text-[10px] font-bold whitespace-nowrap">{tab.label}</span>
                  {tab.badge && (
                    <span className="absolute -top-1 -right-1 text-[9px] bg-yellow-400 text-yellow-900 px-1 rounded-full font-black leading-tight">{tab.badge}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto p-4">

        {/* AI Assistant */}
        {activeTab === "assistant" && (
          <div className="rounded-2xl overflow-hidden shadow-xl border-2 border-green-200">
            <div className="bg-green-600 px-4 py-3 flex items-center justify-between">
              <div>
                <p className="font-bold text-white text-sm flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />Vaccination & Drug AI Assistant
                </p>
                <p className="text-green-100 text-xs mt-0.5">Ask about vaccines, drug doses, treatment plans</p>
              </div>
              <Badge className="bg-yellow-400/90 text-yellow-900 text-xs border-0">IAP 2023</Badge>
            </div>
            <VaccDrugChatbot />
          </div>
        )}

        {/* Vaccination */}
        {activeTab === "vaccination" && (
          <div>
            <div className="flex items-center gap-2 mb-4 p-3 bg-blue-600 rounded-xl shadow">
              <Syringe className="w-5 h-5 text-white shrink-0" />
              <div>
                <p className="font-bold text-white text-sm">NIS + IAP 2023 Vaccination Schedule</p>
                <p className="text-blue-100 text-xs">Tap any vaccine to mark given · Search by name or disease</p>
              </div>
            </div>
            <SimpleVaccinationSchedule />
          </div>
        )}

        {/* Growth */}
        {activeTab === "growth" && (
          <div>
            <div className="flex items-center gap-2 mb-4 p-3 bg-purple-600 rounded-xl shadow">
              <TrendingUp className="w-5 h-5 text-white shrink-0" />
              <div>
                <p className="font-bold text-white text-sm">WHO Growth Charts — Interactive</p>
                <p className="text-purple-100 text-xs">Weight, Height, Head Circumference · Z-scores · Centile curves</p>
              </div>
            </div>
            <InteractiveGrowthChart />
          </div>
        )}

        {/* Nutrition */}
        {activeTab === "nutrition" && (
          <div>
            <div className="flex items-center gap-2 mb-4 p-3 bg-orange-600 rounded-xl shadow">
              <Apple className="w-5 h-5 text-white shrink-0" />
              <div>
                <p className="font-bold text-white text-sm">Nutrition Intake Tracker</p>
                <p className="text-orange-100 text-xs">Log food + fluids · Compare vs requirements</p>
              </div>
            </div>
            <NutritionIntakeTracker />
          </div>
        )}

        {/* Pathways — SAM / Dev / Autism + AI generated */}
        {activeTab === "pathways" && (
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search pathways…"
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-300" />
            </div>

            {/* AI Generator (admin) */}
            {isAdmin && showGenerator && (
              <AIPathwayGenerator onGenerated={() => setShowGenerator(false)} />
            )}

            {/* Draft custom pathways */}
            {isAdmin && draftCustom.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge className="bg-amber-100 text-amber-700">Drafts ({draftCustom.length})</Badge>
                  <span className="text-xs text-slate-500">Review and publish AI-generated pathways</span>
                </div>
                {draftCustom.map(p => (
                  <CustomPathwayCard key={p.id} record={p} isAdmin={isAdmin} onDelete={handleDelete} onPublish={handlePublish} />
                ))}
              </div>
            )}

            {/* Published custom */}
            {publishedCustom.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-violet-500" />
                  <span className="text-sm font-bold text-slate-700">AI-Generated Pathways ({publishedCustom.length})</span>
                </div>
                {publishedCustom.map(p => (
                  <CustomPathwayCard key={p.id} record={p} isAdmin={isAdmin} onDelete={handleDelete} onPublish={handlePublish} />
                ))}
              </div>
            )}

            {/* Built-in pathways */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Baby className="w-4 h-4 text-teal-600" />
                <span className="text-sm font-bold text-slate-700">Core Pediatric Pathways</span>
              </div>
              {filteredBuiltIn.map(p => (
                <PathwayCard key={p.id} pathway={p} isAdmin={isAdmin} onEdit={setEditingPathway} />
              ))}
              {filteredBuiltIn.length === 0 && (
                <p className="text-center text-slate-400 py-8 text-sm">No pathways match your search</p>
              )}
            </div>

            <Alert className="bg-blue-50 border-blue-200">
              <Info className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-blue-800 text-xs">
                Pathways based on WHO, IAP, AAP, CDC guidelines. AI-generated content should be reviewed by a specialist before clinical use.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Guidelines */}
        {activeTab === "guidelines" && (
          <div>
            <div className="flex items-center gap-2 mb-4 p-3 bg-indigo-600 rounded-xl shadow">
              <Scale className="w-5 h-5 text-white shrink-0" />
              <div>
                <p className="font-bold text-white text-sm">IAP / ICMR Nutrition Guidelines</p>
                <p className="text-indigo-100 text-xs">RDA table · Complementary feeding · Malnutrition management</p>
              </div>
            </div>
            <PediatricNutritionPathway />
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editingPathway && (
        <EditPathwayModal pathway={editingPathway} onSave={handleSaveEdit} onClose={() => setEditingPathway(null)} />
      )}
    </div>
  );
}