import React, { useState, useEffect } from "react";
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
  Upload, Sparkles, Search, Globe, FileText, Pencil, Check, X, Star,
  Info, BookOpen, TestTube, Microscope, Zap, Wind, Shield, Dna, Droplet
} from "lucide-react";
import { toast } from "sonner";
import GrowthMonitoringPathway from "../components/pathways/GrowthMonitoringPathway.jsx";
import PediatricNutritionPathway from "../components/pathways/PediatricNutritionPathway.jsx";
import VaccDrugChatbot from "../components/pediatrics/VaccDrugChatbot.jsx";
import SimpleVaccinationSchedule from "../components/pediatrics/SimpleVaccinationSchedule.jsx";
import NutritionIntakeTracker from "../components/pediatrics/NutritionIntakeTracker.jsx";
import DevQuotientTool from "../components/pediatrics/DevQuotientTool.jsx";
import EndocrineSection from "../components/pediatrics/EndocrineSection.jsx";
import PedsReferenceSection from "../components/pediatrics/PedsReferenceSection.jsx";
import PedsAIAnalysers from "../components/pediatrics/PedsAIAnalysers.jsx";
import IAPScreeningTools from "../components/pediatrics/IAPScreeningTools.jsx";
import DysmorphologyScreeningTool from "../components/tools/DysmorphologyScreeningTool.jsx";
import GastroenterologySection from "../components/pediatrics/GastroenterologySection.jsx";
import HaematologySection from "../components/pediatrics/HaematologySection.jsx";
import DevMilestoneTable from "../components/pediatrics/DevMilestoneTable.jsx";

// ── Tab config ────────────────────────────────────────────────────────────────
const TABS = [
  { id: "pathways", label: "Pathways", icon: Brain, color: "bg-teal-600" },
  { id: "screening", label: "Screening", icon: Search, color: "bg-green-700", badge: "IAP" },
  { id: "assistant", label: "AI Assistant", icon: MessageCircle, color: "bg-green-600", badge: "AI" },
  { id: "vaccination", label: "Vaccines", icon: Syringe, color: "bg-blue-600" },
  { id: "dev", label: "Development", icon: Baby, color: "bg-cyan-600", badge: "DQ" },
  { id: "nutrition", label: "Nutrition", icon: Apple, color: "bg-orange-600" },
  { id: "analysers", label: "AI Analysers", icon: Sparkles, color: "bg-violet-600", badge: "AI" },
  { id: "endocrine", label: "Endocrine", icon: Zap, color: "bg-amber-600" },
  { id: "dysmorphology", label: "Dysmorphology", icon: Dna, color: "bg-indigo-700", badge: "NEW" },
  { id: "gastro", label: "Gastro", icon: Activity, color: "bg-orange-600" },
  { id: "haematology", label: "Haematology", icon: Droplet, color: "bg-red-700" },
  { id: "references", label: "References", icon: BookOpen, color: "bg-indigo-600" },
];

// ── Built-in clinical pathways ──────────────────────────────────────────────
const INITIAL_PATHWAYS = [
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
      "Micronutrients: Vitamin A D3 E K, zinc, folate, Fe (ONLY in rehabilitation phase)",
      "Iron: start ONLY when weight gaining; premature iron worsens oxidative stress",
      "DISCHARGE: WHZ > -2 SD; MUAC > 12.5 cm; no oedema; eating well",
    ],
    monitoring: [
      "Weight DAILY (morning, naked, same time)",
      "Blood glucose: every 30 min if hypoglycaemic until stable",
      "Temperature: every 6 hours",
      "Pulse rate + respiratory rate: every 30 min if shocked",
      "Fluid balance: input/output charting",
      "Oedema grading: + (foot/ankle), ++ (lower limb+), +++ (generalised)",
      "Weekly: height/length, MUAC, appetite test (RUTF)",
    ],
    references: ["WHO SAM Protocol 2013", "IAP SAM Guidelines 2023", "NIN India 2020"],
  },
  {
    id: "autism",
    name: "Autism Screening (M-CHAT)",
    full: "Autism Spectrum Disorder (ASD) — Screening & Early Intervention Pathway",
    color: "violet",
    badge: "Neurodevelopmental",
    overview: "ASD prevalence: ~1 in 100 children globally; 1 in 66 in India (INCLEN 2017). Early detection (before age 2-3) and intensive early intervention dramatically improves outcomes. Universal screening at 18 and 24 months is recommended.",
    criteria: [
      "Core features: persistent deficits in social communication + interaction",
      "Restricted/repetitive behaviours, interests, or activities (RRBs)",
      "DSM-5 specifiers: with/without intellectual impairment, language impairment",
      "ASD levels 1-3: Level 1 (requiring support) → Level 3 (very substantial support)",
      "Screening: M-CHAT-R/F at 16, 18, 24 months all children",
    ],
    danger_signs: [
      "No back-and-forth sharing of sounds/smiles/facial expressions by 9 months",
      "No babbling by 12 months",
      "No pointing/showing/reaching/waving by 12 months",
      "No words by 16 months",
      "No meaningful 2-word phrases (not echolalia) by 24 months",
      "Any loss of speech or social skills at any age",
      "No response to own name by 12 months",
    ],
    management: [
      "M-CHAT-R/F scoring: 0-2 low risk; 3-7 medium risk (follow-up interview); 8+ high risk (refer immediately)",
      "ADOS-2: Gold standard diagnostic tool (specialist referral)",
      "AIIMS ISAA: Indian Scale for Assessment of Autism — validated for Indian context",
      "EARLY INTERVENTION (<3 years): ABA, Early Intensive Behavioural Intervention (EIBI)",
      "Speech and Language Therapy: begin as early as diagnosis",
      "Occupational Therapy: sensory processing, ADL skills",
      "INDIA RESOURCES: National Trust, ASHA workers, Anganwadi referral",
      "CO-MORBIDITIES: ADHD (50-70%), epilepsy (25-30%), sleep disorders",
      "MEDICATIONS: risperidone/aripiprazole for irritability (ONLY if needed); melatonin for sleep",
    ],
    monitoring: [
      "M-CHAT-R/F: 16, 18, 24 months routine; 30 months if any concern",
      "CARS-2 annually: track severity",
      "Adaptive behaviour: Vineland Adaptive Behaviour Scales — baseline and annually",
      "Language assessment: annually by speech therapist",
      "Epilepsy: EEG if any suspicion of seizures",
      "GI symptoms (50% ASD): dietary history, constipation/diarrhoea diary",
    ],
    references: ["DSM-5 ASD Criteria 2013", "IAP Autism Guidelines 2022", "INCLEN India ASD 2017"],
  },
  {
    id: "fever",
    name: "Fever Management",
    full: "Approach to Fever in Children — IAP/WHO Protocol",
    color: "rose",
    badge: "Common Emergency",
    overview: "Fever (temp >38°C axillary) is the most common pediatric complaint. Key is to identify the source, rule out serious bacterial infection (SBI), and manage appropriately. Avoid antibiotics unless clear bacterial source. Fever itself is not harmful; manage discomfort.",
    criteria: [
      "Fever >38°C axillary, >38.5°C rectal",
      "Neonates <28 days: any fever = admit and full sepsis workup",
      "Infants 28-90 days: low-threshold sepsis screen",
      "Age-appropriate: assess for source (URTI, UTI, LRTI, gastroenteritis)",
      "Fever >5 days: consider Kawasaki, typhoid, JIA, occult bacteraemia",
      "Fever + petechiae: meningococcaemia until proven otherwise",
    ],
    danger_signs: [
      "Infant <3 months with fever ≥38°C",
      "Fever >5 days without source",
      "Fever + rash (especially non-blanching/petechiae)",
      "Lethargy, poor perfusion, CRT >3s",
      "Severe headache + neck stiffness (meningitis)",
      "Respiratory distress with fever",
      "Febrile seizure — first episode or prolonged (>5 min)",
    ],
    management: [
      "Antipyretics: Paracetamol 15 mg/kg/dose q4-6h (max 5 doses/24h) OR Ibuprofen 10 mg/kg/dose q6-8h (>3 months)",
      "Do NOT combine routinely; can alternate if inadequate response",
      "Avoid aspirin in viral illness (Reye syndrome risk)",
      "Hydration: encourage oral fluids; tepid sponging for comfort",
      "Febrile seizure: airway, position, lorazepam 0.05-0.1 mg/kg IV if >5 min",
      "Antibiotics ONLY if: SBI confirmed, severely unwell, infant <3 months",
      "UTI: confirm with urine culture; treat with appropriate antibiotic",
      "Malaria endemic area: malaria RDT/smear if fever >3 days",
    ],
    monitoring: [
      "Temperature every 4-6 hours",
      "Hydration status (urine output, fontanelle, skin turgor)",
      "Rash surveillance — check at each visit",
      "Response to antipyretics",
      "Daily clinical review if fever persists >48h without source",
      "CBC, CRP, blood culture if high risk or not responding",
    ],
    references: ["WHO IMCI 2024", "IAP Fever Guidelines 2022", "AAP Fever Guidelines 2021"],
  },
  {
    id: "diarrhoea",
    name: "Acute Diarrhoea & ORS",
    full: "Acute Diarrhoea & Dehydration Management — WHO/IAPSMCON",
    color: "blue",
    badge: "GI Emergency",
    overview: "Diarrhoea: ≥3 loose/watery stools in 24h. Leading cause of under-5 mortality globally. Dehydration is the main killer. Oral rehydration therapy (ORT) is the cornerstone of management. Antibiotics are rarely needed. Zinc supplementation reduces duration and severity.",
    criteria: [
      "Acute: <14 days; Persistent: 14-30 days; Chronic: >30 days",
      "Dehydration: No (0%) → Some (1-9%) → Severe (≥10%)",
      "Some dehydration: sunken eyes, dry mouth, restless, thirsty, CRT 2-3s",
      "Severe dehydration: very sunken eyes, no tears, lethargic, unable to drink",
      "Bloody diarrhoea (dysentery): Shigella most common → treat with antibiotics",
      "Cholera suspected: profuse rice-water stools, adults, IV fluids urgently",
    ],
    danger_signs: [
      "Severe dehydration: lethargic, sunken fontanelle, no urine >8h",
      "Unable to drink or keep fluids down",
      "Fever >39°C with diarrhoea in infant <3 months",
      "Bloody diarrhoea + high fever",
      "Marked abdominal distension",
      "Seizures with diarrhoea (hyponatraemia/hypernatraemia)",
    ],
    management: [
      "ORS Plan A (No dehydration): 50-100 mL ORS after each loose stool; continue breastfeeding",
      "ORS Plan B (Some dehydration): 75 mL/kg ORS over 4 hours; reassess",
      "IV Plan C (Severe): Ringer's lactate 100 mL/kg: 30 mL/kg over 30min (infant) or 1h, then 70 mL/kg over 2.5h",
      "WHO ORS: Na 75, Cl 65, K 20, citrate 10, glucose 75 mEq/L, osmolarity 245",
      "Zinc: 10 mg/day (<6m) or 20 mg/day (≥6m) for 14 days — reduces duration by 25%",
      "Feed: continue breastfeeding; do NOT restrict food; BRAT diet NOT recommended",
      "Antibiotics: ONLY for dysentery (azithromycin 12 mg/kg/day × 3d) or cholera",
      "Ondansetron: 0.15 mg/kg (max 4mg) if vomiting prevents ORS",
    ],
    monitoring: [
      "Hydration assessment every 1-2h during ORT",
      "Stool frequency and character",
      "Urine output (target >1 mL/kg/hr)",
      "Weight before and after ORT",
      "Electrolytes: Na, K if severe or prolonged",
      "Blood glucose if altered consciousness",
    ],
    references: ["WHO IMCI 2024", "IAPSMCON Diarrhoea Guidelines 2020", "AAP Diarrhoea 2022"],
  },
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
        className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-left">
        <span className="font-semibold text-sm text-slate-800">{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && (
        <div className="p-3 bg-white">
          {isList ? (
            <ul className="space-y-1.5">
              {items.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                  <span className="text-indigo-400 font-bold min-w-[18px] mt-0.5">{i + 1}.</span>{item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-700 leading-relaxed">{items}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Edit/Add/Delete Pathway Modal ─────────────────────────────────────────────
function PathwayModal({ pathway, onSave, onClose }) {
  const isNew = !pathway.id;
  const [data, setData] = useState({
    name: pathway.name || "",
    full: pathway.full || "",
    badge: pathway.badge || "",
    color: pathway.color || "blue",
    overview: pathway.overview || "",
    criteria: Array.isArray(pathway.criteria) ? pathway.criteria.join('\n') : "",
    danger_signs: Array.isArray(pathway.danger_signs) ? pathway.danger_signs.join('\n') : "",
    management: Array.isArray(pathway.management) ? pathway.management.join('\n') : "",
    monitoring: Array.isArray(pathway.monitoring) ? pathway.monitoring.join('\n') : "",
    references: Array.isArray(pathway.references) ? pathway.references.join('\n') : "",
  });

  const handleSave = () => {
    if (!data.name.trim() || !data.full.trim()) { toast.error("Name and full title required"); return; }
    onSave({
      ...pathway,
      id: pathway.id || `custom_${Date.now()}`,
      name: data.name,
      full: data.full,
      badge: data.badge,
      color: data.color,
      overview: data.overview,
      criteria: data.criteria.split('\n').filter(s => s.trim()),
      danger_signs: data.danger_signs.split('\n').filter(s => s.trim()),
      management: data.management.split('\n').filter(s => s.trim()),
      monitoring: data.monitoring.split('\n').filter(s => s.trim()),
      references: data.references.split('\n').filter(s => s.trim()),
    });
  };

  const COLORS = ["amber", "blue", "teal", "violet", "green", "rose"];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 px-3 pb-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50 rounded-t-2xl">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Pencil className="w-4 h-4 text-blue-600" />
            {isNew ? "Add New Pathway" : "Edit Pathway"}
          </h3>
          <button onClick={onClose}><X className="w-4 h-4 text-slate-400" /></button>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs font-semibold text-slate-600">Short Name *</Label>
              <Input value={data.name} onChange={e => setData(d => ({ ...d, name: e.target.value }))}
                placeholder="e.g. Kawasaki Disease" className="mt-1 h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600">Badge Label</Label>
              <Input value={data.badge} onChange={e => setData(d => ({ ...d, badge: e.target.value }))}
                placeholder="e.g. Vasculitis" className="mt-1 h-8 text-sm" />
            </div>
          </div>
          <div>
            <Label className="text-xs font-semibold text-slate-600">Full Title *</Label>
            <Input value={data.full} onChange={e => setData(d => ({ ...d, full: e.target.value }))}
              className="mt-1 h-8 text-sm" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-slate-600">Color Theme</Label>
            <div className="flex gap-2 mt-1">
              {COLORS.map(c => (
                <button key={c} onClick={() => setData(d => ({ ...d, color: c }))}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${data.color === c ? "border-slate-800 scale-110" : "border-transparent opacity-60"} ${
                    c === "amber" ? "bg-amber-400" : c === "blue" ? "bg-blue-500" : c === "teal" ? "bg-teal-500" :
                    c === "violet" ? "bg-violet-500" : c === "green" ? "bg-green-500" : "bg-rose-500"}`} />
              ))}
            </div>
          </div>
          {[
            { label: "Overview", key: "overview", rows: 3, placeholder: "Brief overview paragraph..." },
            { label: "Criteria / Diagnostic Features (one per line)", key: "criteria", rows: 4, placeholder: "Criterion 1\nCriterion 2..." },
            { label: "Danger Signs / Red Flags (one per line)", key: "danger_signs", rows: 4, placeholder: "Red flag 1\nRed flag 2..." },
            { label: "Management Steps (one per line)", key: "management", rows: 6, placeholder: "Step 1\nStep 2..." },
            { label: "Monitoring (one per line)", key: "monitoring", rows: 4, placeholder: "Monitor 1\nMonitor 2..." },
            { label: "References (one per line)", key: "references", rows: 2, placeholder: "WHO Guidelines 2023\nIAP 2022..." },
          ].map(f => (
            <div key={f.key}>
              <Label className="text-xs font-semibold text-slate-600">{f.label}</Label>
              <Textarea value={data[f.key]} onChange={e => setData(d => ({ ...d, [f.key]: e.target.value }))}
                rows={f.rows} placeholder={f.placeholder} className="mt-1 text-xs resize-y" />
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} size="sm" className="bg-blue-600 hover:bg-blue-700 flex-1">
              <Check className="w-3.5 h-3.5 mr-1" /> {isNew ? "Add Pathway" : "Save Changes"}
            </Button>
            <Button onClick={onClose} size="sm" variant="outline">Cancel</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Pathway display card ─────────────────────────────────────────────────────
function PathwayCard({ pathway, onEdit, onDelete }) {
  const c = COLOR_MAP[pathway.color] || COLOR_MAP.blue;
  return (
    <Card className="bg-white border border-slate-200 shadow-sm">
      <CardHeader className={`border-b py-3 px-4 ${c.header}`}>
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm leading-snug">{pathway.full}</CardTitle>
            <Badge className={`${c.badge} mt-1.5 text-xs`}>{pathway.badge}</Badge>
          </div>
          <div className="flex gap-1.5 flex-shrink-0">
            <Button size="sm" variant="outline" onClick={() => onEdit(pathway)}
              className="h-7 text-xs border-blue-200 text-blue-700 hover:bg-blue-50 px-2">
              <Pencil className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => onDelete(pathway.id)}
              className="h-7 text-xs border-red-200 text-red-600 hover:bg-red-50 px-2">
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 space-y-2">
        {pathway.overview && <SectionCard title="Overview" items={pathway.overview} isList={false} />}
        {pathway.criteria?.length > 0 && <SectionCard title="📋 Criteria / Features" items={pathway.criteria} />}
        {pathway.danger_signs?.length > 0 && <SectionCard title="🚨 Danger Signs / Red Flags" items={pathway.danger_signs} />}
        {pathway.management?.length > 0 && <SectionCard title="🩺 Management Protocol" items={pathway.management} />}
        {pathway.monitoring?.length > 0 && <SectionCard title="📊 Monitoring" items={pathway.monitoring} />}
        {pathway.references?.length > 0 && (
          <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50">
            <p className="text-xs font-semibold text-slate-600 mb-1">References</p>
            <div className="flex flex-wrap gap-1">
              {pathway.references.map((r, i) => <Badge key={i} variant="outline" className="text-xs">{r}</Badge>)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── AI Pathway Generator ─────────────────────────────────────────────────────
function AIPathwayGenerator({ onGenerated }) {
  const [mode, setMode] = useState("web");
  const [topic, setTopic] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!topic.trim() && !file) { toast.error("Enter a topic or upload a document"); return; }
    setLoading(true);
    toast.info("AI generating pathway — 30-60 seconds…");
    try {
      let fileUrls = [];
      if (file) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        fileUrls = [file_url];
      }
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Expert pediatric physician. Generate comprehensive clinical pathway for: "${topic || 'the document topic'}".
Return JSON: name, full, badge, color (amber/teal/violet/blue/green/rose), overview, criteria (array), danger_signs (array), management (array 10-15 items), monitoring (array), references (array)`,
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
      onGenerated({ ...res, id: `ai_${Date.now()}` });
      setTopic(""); setFile(null);
    } catch (e) {
      toast.error("Generation failed: " + (e.message || "unknown error"));
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
      <div className="flex gap-2">
        {["web", "file"].map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold border transition-colors ${mode === m ? "bg-violet-600 text-white border-violet-600" : "bg-white text-slate-600 border-slate-200 hover:bg-violet-50"}`}>
            {m === "web" ? <><Globe className="w-3.5 h-3.5" />Web Search</> : <><Upload className="w-3.5 h-3.5" />Upload Doc</>}
          </button>
        ))}
      </div>
      <Input value={topic} onChange={e => setTopic(e.target.value)}
        placeholder="e.g. Kawasaki Disease, Neonatal Sepsis, Febrile Seizures…"
        className="h-9 text-sm bg-white" />
      {mode === "file" && (
        <div>
          <input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" id="pathway-doc-upload" className="hidden"
            onChange={e => setFile(e.target.files?.[0] || null)} />
          <label htmlFor="pathway-doc-upload"
            className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-violet-300 text-violet-700 rounded-lg bg-white hover:bg-violet-50">
            <Upload className="w-3.5 h-3.5" />{file ? file.name : "Choose file"}
          </label>
        </div>
      )}
      <Button onClick={generate} disabled={loading} className="w-full bg-violet-600 hover:bg-violet-700 text-white h-9 text-sm">
        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating…</> : <><Sparkles className="w-4 h-4 mr-2" />Generate with AI</>}
      </Button>
    </div>
  );
}

// ── M-CHAT-R Screening Tool ───────────────────────────────────────────────────
function MCHATTool() {
  const CRITICAL_ITEMS = [
    { id: 1, q: "Does your child respond to their name when called?" },
    { id: 2, q: "Does your child point with finger to show interest (not to ask)?" },
    { id: 3, q: "Does your child make eye contact with you?" },
    { id: 4, q: "Does your child bring objects to show you?" },
    { id: 5, q: "Does your child imitate or copy what you do?" },
    { id: 6, q: "Does your child follow your gaze or pointing to look at something?" },
  ];
  const [answers, setAnswers] = useState({});
  const totalNo = Object.values(answers).filter(v => v === false).length;
  const answered = Object.keys(answers).length;

  return (
    <div className="bg-white rounded-xl border border-violet-200 overflow-hidden">
      <div className="px-4 py-2.5 bg-violet-50 border-b border-violet-100">
        <p className="text-sm font-bold text-violet-900">M-CHAT-R — 6 Critical Items (Autism Screen, 16-30 months)</p>
      </div>
      <div className="p-4 space-y-3">
        {CRITICAL_ITEMS.map(item => (
          <div key={item.id} className="flex items-start gap-3">
            <span className="text-xs font-bold text-violet-600 w-5 shrink-0">{item.id}.</span>
            <p className="text-xs text-slate-700 flex-1">{item.q}</p>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => setAnswers(a => ({ ...a, [item.id]: true }))}
                className={`px-2.5 py-1 text-xs rounded-full font-semibold border transition-colors ${answers[item.id] === true ? "bg-green-500 text-white border-green-500" : "bg-white text-slate-500 border-slate-300"}`}>Yes</button>
              <button onClick={() => setAnswers(a => ({ ...a, [item.id]: false }))}
                className={`px-2.5 py-1 text-xs rounded-full font-semibold border transition-colors ${answers[item.id] === false ? "bg-red-500 text-white border-red-500" : "bg-white text-slate-500 border-slate-300"}`}>No</button>
            </div>
          </div>
        ))}
        {answered > 0 && (
          <div className={`rounded-lg p-3 text-xs font-semibold ${totalNo >= 2 ? "bg-red-50 text-red-800 border border-red-200" : totalNo === 1 ? "bg-amber-50 text-amber-800 border border-amber-200" : "bg-green-50 text-green-800 border border-green-200"}`}>
            {totalNo === 0 && answered === 6 ? "✅ Low risk — routine surveillance" :
             totalNo === 1 ? "⚠️ 1 critical fail — Follow-up interview recommended" :
             `🔴 ${totalNo} critical fails — HIGH RISK — Refer to developmental paediatrician immediately`}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Nutrition Guideline Card ──────────────────────────────────────────────────
const COLOR_CLASSES = {
  green: { bg: "bg-green-50", border: "border-green-200", header: "bg-green-100", title: "text-green-900" },
  amber: { bg: "bg-amber-50", border: "border-amber-200", header: "bg-amber-100", title: "text-amber-900" },
  red: { bg: "bg-red-50", border: "border-red-200", header: "bg-red-100", title: "text-red-900" },
  blue: { bg: "bg-blue-50", border: "border-blue-200", header: "bg-blue-100", title: "text-blue-900" },
  purple: { bg: "bg-purple-50", border: "border-purple-200", header: "bg-purple-100", title: "text-purple-900" },
};

function NutritionGuidelineCard({ section, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const c = COLOR_CLASSES[section.color] || COLOR_CLASSES.blue;
  return (
    <div className={`rounded-xl border overflow-hidden ${c.border}`}>
      <button onClick={() => setOpen(o => !o)} className={`w-full flex items-center justify-between px-4 py-3 ${c.header} text-left`}>
        <div className="flex-1 min-w-0">
          <span className={`text-sm font-bold ${c.title}`}>{section.title}</span>
          {section.source && <span className="ml-2 text-xs text-slate-500 font-normal">— {section.source}</span>}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
      </button>
      {open && (
        <div className={`${c.bg} p-4`}>
          <ul className="space-y-1.5">
            {section.content.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                <span className="text-slate-400 font-bold shrink-0 mt-0.5">•</span>{item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function GeneralPediatricsHub() {
  const [activeTab, setActiveTab] = useState("pathways"); // Default tab
  const [search, setSearch] = useState("");

  // Scroll to top on tab change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTab]);
  const [showGenerator, setShowGenerator] = useState(false);
  const [editingPathway, setEditingPathway] = useState(null);
  const [addingNew, setAddingNew] = useState(false);

  // All pathways stored in state (persisted in localStorage)
  const [pathways, setPathways] = useState(() => {
    try {
      const saved = localStorage.getItem("peds_pathways_v2");
      return saved ? JSON.parse(saved) : INITIAL_PATHWAYS;
    } catch { return INITIAL_PATHWAYS; }
  });

  const savePathways = (updated) => {
    setPathways(updated);
    localStorage.setItem("peds_pathways_v2", JSON.stringify(updated));
  };

  const handleSave = (updated) => {
    const exists = pathways.find(p => p.id === updated.id);
    const newList = exists
      ? pathways.map(p => p.id === updated.id ? updated : p)
      : [...pathways, updated];
    savePathways(newList);
    setEditingPathway(null);
    setAddingNew(false);
    toast.success(exists ? "Pathway updated" : "Pathway added!");
  };

  const handleDelete = (id) => {
    if (!confirm("Delete this pathway?")) return;
    savePathways(pathways.filter(p => p.id !== id));
    toast.success("Pathway deleted");
  };

  const handleAIGenerated = (pathway) => {
    savePathways([...pathways, pathway]);
    setShowGenerator(false);
    toast.success("AI pathway added!");
  };

  const handleResetPathways = () => {
    if (!confirm("Reset all pathways to defaults? This cannot be undone.")) return;
    savePathways(INITIAL_PATHWAYS);
    toast.success("Pathways reset to defaults");
  };

  const filtered = pathways.filter(p =>
    !search.trim() ||
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.full?.toLowerCase().includes(search.toLowerCase()) ||
    p.badge?.toLowerCase().includes(search.toLowerCase())
  );

  // Nutrition guidelines data (searchable)
  const NUTRITION_GUIDELINES = [
    {
      title: "Infant and Young Child Feeding (IYCF)",
      color: "green",
      source: "WHO/IAP/UNICEF 2023",
      tags: ["breastfeeding", "complementary feeding", "IYCF", "infant", "6 months"],
      content: [
        "Initiate breastfeeding within 1 hour of birth (colostrum = 'liquid gold')",
        "Exclusive breastfeeding for first 6 months — no water, no other feeds",
        "Complementary feeding from 6 months: home-cooked semi-solid foods",
        "Continue breastfeeding up to 2 years or beyond",
        "India-specific: khichdi, mashed dal-rice, suji kheer, mashed banana, curd-rice",
        "Energy density: ≥1 kcal/mL; protein: 10–15% total energy",
        "4-star diet: cereals + pulses + animal foods + fruits/vegetables daily",
        "Frequency: 2-3 meals/day at 6-8m; 3-4 meals + 1-2 snacks at 9-23m",
        "Avoid: honey (<1y), cow's milk as main drink (<1y), added salt/sugar (<2y), processed foods",
      ]
    },
    {
      title: "Malnutrition Classification + MUAC Guide",
      color: "amber",
      source: "WHO 2022 / CMAM",
      tags: ["SAM", "MAM", "MUAC", "malnutrition", "oedema", "wasting", "kwashiorkor", "marasmus"],
      content: [
        "SAM: WHZ <-3SD OR MUAC <11.5cm OR bilateral pitting oedema",
        "MAM: WHZ -2 to -3SD OR MUAC 11.5–12.5cm",
        "Normal: WHZ >-2SD AND MUAC >12.5cm",
        "🔴 MUAC <11.5cm = SAM → facility-based management (F-MAS)",
        "🟡 MUAC 11.5–12.5cm = MAM → community supplementary feeding",
        "🟢 MUAC >12.5cm = Normal; <6 months: MUAC <11cm = SAM",
        "Oedema grading: + foot/ankle | ++ lower limb | +++ generalised (anasarca)",
        "Kwashiorkor (oedema) = SAM regardless of weight-for-height",
        "Marasmic-kwashiorkor = worst prognosis; combined wasting + oedema",
      ]
    },
    {
      title: "SAM Management — NRC 10-Step Protocol (WHO/IAP)",
      color: "red",
      source: "WHO 2013 / IAP 2023",
      tags: ["SAM", "NRC", "F-75", "F-100", "RUTF", "NRC", "NRC protocol", "stabilisation"],
      content: [
        "Step 1: Treat hypoglycaemia — glucose 10% 5mL/kg if unconscious",
        "Step 2: Treat hypothermia — skin-to-skin, warm environment, hat",
        "Step 3: Treat/prevent dehydration — ReSoMal 5mL/kg/30min if diarrhoea",
        "Step 4: Correct electrolytes — K+ (4 mmol/kg/d), Mg (0.6 mmol/kg/d); NO added Na",
        "Step 5: Treat infections — amoxicillin (uncomplicated) / ampicillin+gentamicin (complicated)",
        "Step 6: Correct micronutrient deficiencies — Vitamin A, Zinc, Folate; NO iron in Phase 1",
        "Step 7: Start cautious feeding — F-75 formula (75 kcal/100mL), 100mL/kg/day q3h",
        "Step 8: Rebuild wasted tissue — transition to F-100 or RUTF when stable (no oedema, infection resolving)",
        "Step 9: Provide stimulation — structured play, sensory stimulation daily",
        "Step 10: Follow-up — monthly weight; discharge: WHZ >-2 + MUAC >12.5 + eating well",
        "RUTF (Plumpy'Nut): 200 kcal/sachet; 200 kcal/kg/day; never dilute with water",
        "Iron: start ONLY in rehabilitation phase; premature iron → oxidative stress",
      ]
    },
    {
      title: "Growth Monitoring & Failure to Thrive",
      color: "blue",
      source: "IAP 2015 / WHO",
      tags: ["FTT", "failure to thrive", "growth", "weight", "height", "centile", "short stature"],
      content: [
        "Use WHO growth charts (0-5y) and IAP 2015 charts (5-18y)",
        "Mid-parental height (boys): (Father's ht + Mother's ht + 13) ÷ 2 (±8.5cm)",
        "Mid-parental height (girls): (Father's ht + Mother's ht - 13) ÷ 2 (±8.5cm)",
        "FTT: weight <3rd percentile OR crossing 2 major centile lines downward",
        "FTT workup: CBC, TFT, urine culture, coeliac screen (anti-TTG), metabolic panel",
        "Measure every month <1y; every 3m (1-3y); every 6m (3-6y)",
        "Head circumference until 36 months — microcephaly if <2SD for age/sex",
        "Weight velocity: term infant doubles birth weight by 4-5m; triples by 12m",
        "Expected weight gain: 25-30g/day (0-3m), 15-20g/day (3-6m), 10-15g/day (6-12m)",
        "BMI for age: overweight >+1SD; obese >+2SD (WHO/IAP cutoffs)",
      ]
    },
    {
      title: "Micronutrient Deficiencies — IAP/ICMR",
      color: "purple",
      source: "IAP 2022 / ICMR 2020",
      tags: ["vitamin D", "iron", "IDA", "anaemia", "zinc", "vitamin A", "iodine", "folate", "micronutrient"],
      content: [
        "Vitamin D: 400 IU/day birth–12m; 600 IU/day >12m; treat deficiency with 60,000 IU/week × 6-8w",
        "Iron Deficiency Anaemia: Fe 3-6 mg/kg/day elemental iron × 3 months",
        "WIFS (Weekly Iron & Folic acid Supplementation): 45mg Fe + 400µg FA, school children",
        "Iodine: use iodised salt; deficiency = commonest preventable intellectual disability",
        "Zinc supplementation: 10mg/day <5y, 20mg/day 5-12y for 14 days with acute diarrhoea",
        "Vitamin A: 100,000 IU at 6-11m; 200,000 IU every 6m (12m–5y); VAD → corneal ulcer",
        "Vitamin K: 1mg IM at birth; prevents VKDB (Vitamin K Deficiency Bleeding)",
        "Folate: 400µg/day periconceptional; deficiency → neural tube defects",
        "Calcium: 500mg/day (1-3y), 800mg/day (4-8y), 1300mg/day (adolescents)",
      ]
    },
    {
      title: "Obesity & Metabolic Syndrome in Children",
      color: "amber",
      source: "IAP 2015 / IDF 2007",
      tags: ["obesity", "BMI", "metabolic syndrome", "overweight", "NAFLD", "dyslipidaemia"],
      content: [
        "Overweight: BMI 85th–95th percentile for age/sex; Obese: BMI >95th percentile",
        "Abdominal obesity: waist circumference >90th percentile or >80cm (girls)/90cm (boys) in adolescents",
        "Metabolic syndrome criteria (IDF paediatric 2007): obesity + ≥2 of: TG↑, HDL↓, BP↑, glucose↑",
        "Investigations: fasting lipid profile, glucose, insulin, LFT (NAFLD), uric acid",
        "Management: lifestyle modification (Diet + 60 min/day moderate activity)",
        "Caloric restriction: 500 kcal deficit/day; avoid ultra-processed foods",
        "Screen for NAFLD: ALT/AST if BMI >95th; USS if elevated enzymes",
        "Metformin: consider if HbA1c >5.7% or impaired fasting glucose; not first-line",
        "Target: 5-10% weight reduction over 6 months; monitor every 3 months",
      ]
    },
    {
      title: "Nutrition in Chronic Disease (Renal/CKD/CHD)",
      color: "blue",
      source: "KDOQI 2020 / IAP",
      tags: ["CKD nutrition", "renal diet", "CHD nutrition", "chronic disease", "KDOQI"],
      content: [
        "CKD nutrition: protein 100-140% DRI for healthy children (not restricted in early CKD)",
        "Energy: 100% EER; supplement if growth faltering (NG tube feeds if needed)",
        "Phosphorus: restrict in CKD stage 3b+; avoid phosphate additives in processed foods",
        "Potassium: restrict in CKD 4-5 if hyperkalaeamic; avoid high-K fruits/vegetables",
        "Sodium: 2-3g/day restriction in CKD with hypertension or oedema",
        "CHD: high-calorie feeds (24-30 kcal/oz formula) for failure to thrive",
        "IBD: exclusive enteral nutrition (EEN) for 6-8 weeks = first-line induction in Crohn's",
        "Celiac: strict gluten-free diet; monitor growth and bone density annually",
        "Nutritional screening: PG-SGA or STAMP tool on every hospital admission",
      ]
    },
    {
      title: "Neonatal Nutrition — IAP/NNF",
      color: "green",
      source: "NNF 2022 / IAP Neonatology",
      tags: ["neonatal", "TPN", "preterm", "LBW", "breast milk", "neonatal nutrition", "TPN", "PN"],
      content: [
        "Term newborn: initiate feeds within 1h of birth; demand feeding 8-12 times/day",
        "Preterm (<34w): begin trophic feeds (10-20 mL/kg/day) within 24h of birth",
        "Advance feeds: 20-30 mL/kg/day in preterm if tolerating well",
        "Parenteral nutrition if: NEC risk, surgical abdomen, <26w prematurity, VLBW",
        "PN: glucose 4-8 mg/kg/min; amino acids start 2-3g/kg/day → target 3-4g/kg/day",
        "Intralipid: 1g/kg/day → increase by 1g/kg/day to 3g/kg/day; check TG <200 mg/dL",
        "Breast milk fortification: HMF added when on full enteral feeds in preterm (<34w)",
        "Target growth: 15-20g/kg/day weight gain in preterm; head circumference growth",
        "Discharge: LBW formula or breast milk + iron supplementation from 2-4 weeks of age",
      ]
    },
  ];

  // Search across nutrition guidelines
  const filteredNutrition = NUTRITION_GUIDELINES.filter(g =>
    !search.trim() ||
    g.title.toLowerCase().includes(search.toLowerCase()) ||
    g.source?.toLowerCase().includes(search.toLowerCase()) ||
    g.tags?.some(t => t.toLowerCase().includes(search.toLowerCase())) ||
    g.content.some(c => c.toLowerCase().includes(search.toLowerCase()))
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
              <p className="text-xs text-slate-500 hidden sm:block">IAP · WHO · Growth · Vaccines · SAM · ASD · Endocrine · AI</p>
            </div>
          </div>
          {activeTab === "pathways" && (
            <div className="flex gap-1.5">
              <Button size="sm" onClick={() => { setAddingNew(true); setShowGenerator(false); }}
                className="bg-green-600 hover:bg-green-700 text-white text-xs h-8 gap-1 flex-shrink-0">
                <Plus className="w-3.5 h-3.5" />Add
              </Button>
              <Button size="sm" onClick={() => setShowGenerator(v => !v)}
                className="bg-violet-600 hover:bg-violet-700 text-white text-xs h-8 gap-1 flex-shrink-0">
                <Sparkles className="w-3.5 h-3.5" />AI
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Tab Bar */}
      <div className="bg-green-50 px-2 py-2 sticky top-[57px] z-10 shadow-sm border-b border-green-200 overflow-x-auto">
        <div className="flex gap-1.5 min-w-max max-w-5xl mx-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`relative flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-lg min-w-[62px] transition-all text-xs font-semibold shadow-sm border
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

      {/* Content */}
      <div className="max-w-5xl mx-auto p-4">

        {/* ── PATHWAYS (first tab) ── */}
        {activeTab === "pathways" && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search pathways…"
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-300" />
            </div>

            {showGenerator && <AIPathwayGenerator onGenerated={handleAIGenerated} />}

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">{filtered.length} pathways — tap ✏️ to edit, 🗑️ to delete</span>
              <button onClick={handleResetPathways} className="text-xs text-slate-400 hover:text-red-500 transition-colors">
                Reset to defaults
              </button>
            </div>

            {filtered.map(p => (
              <PathwayCard key={p.id} pathway={p} onEdit={setEditingPathway} onDelete={handleDelete} />
            ))}

            {filtered.length === 0 && (
              <div className="text-center py-10">
                <p className="text-slate-400 text-sm mb-3">No pathways match your search</p>
                <Button size="sm" onClick={() => setAddingNew(true)} className="bg-green-600 text-white">
                  <Plus className="w-4 h-4 mr-1" /> Add New Pathway
                </Button>
              </div>
            )}

            <Alert className="bg-blue-50 border-blue-200">
              <Info className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-blue-800 text-xs">
                Based on WHO, IAP, AAP, CDC guidelines. All users can add/edit/delete pathways.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* ── SCREENING (IAP) ── */}
        {activeTab === "screening" && (
          <div>
            <div className="flex items-center gap-2 mb-4 p-3 bg-green-700 rounded-xl shadow">
              <Search className="w-5 h-5 text-white shrink-0" />
              <div>
                <p className="font-bold text-white text-sm">IAP Screening Tools & Algorithms</p>
                <p className="text-green-100 text-xs">M-CHAT · NBS · Growth · Anaemia · BP · TB · Vision & Hearing · CHD · Obesity</p>
              </div>
            </div>
            <IAPScreeningTools />
          </div>
        )}

        {/* ── AI ASSISTANT ── */}
        {activeTab === "assistant" && (
          <div className="rounded-2xl overflow-hidden shadow-xl border-2 border-green-200">
            <div className="bg-green-600 px-4 py-3 flex items-center justify-between">
              <div>
                <p className="font-bold text-white text-sm flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />Vaccination & Drug AI Assistant
                </p>
                <p className="text-green-100 text-xs mt-0.5">Ask about vaccines, drug doses, growth, development, treatment plans</p>
              </div>
              <Badge className="bg-yellow-400/90 text-yellow-900 text-xs border-0">IAP 2023</Badge>
            </div>
            <VaccDrugChatbot />
          </div>
        )}

        {/* ── VACCINATION ── */}
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

        {/* ── DEVELOPMENT + DQ ── */}
        {activeTab === "dev" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-cyan-600 rounded-xl shadow">
              <Baby className="w-5 h-5 text-white shrink-0" />
              <div>
                <p className="font-bold text-white text-sm">Developmental Assessment — IAP/WHO</p>
                <p className="text-cyan-100 text-xs">Milestone table · DQ calculator · M-CHAT · Hearing screen · GDD workup · RBSK referral</p>
              </div>
            </div>

            {/* Milestone Table — Enhanced with filter */}
            <DevMilestoneTable />

            {/* Red Flags */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-red-700 uppercase tracking-wide">⚠️ Red Flags by Domain</p>
              {[
                { domain: "Gross Motor Red Flags", color: "blue", items: ["No head control by 4m", "No sitting by 9m", "No walking by 18m", "Asymmetric movement at any age", "Regression of motor skills"] },
                { domain: "Language Red Flags", color: "purple", items: ["No cooing by 3m", "No babbling by 9m", "No words by 18m", "No 2-word phrases by 24m", "Any language regression", "Cannot follow 2-step commands by 24m"] },
                { domain: "Social-Adaptive Red Flags", color: "orange", items: ["No social smile by 3m", "No eye contact by 6m", "No joint attention by 12m (pointing, showing)", "No pretend play by 18m", "Persistent hand flapping, toe walking"] },
              ].map(rf => (
                <SectionCard key={rf.domain} title={rf.domain} items={rf.items} />
              ))}
            </div>

            {/* M-CHAT-R */}
            <MCHATTool />

            {/* DQ Calculator */}
            <DevQuotientTool />

            {/* GDD Workup Checklist */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-sm font-bold text-slate-800 mb-3">📋 GDD Workup Checklist (DQ &lt;70 or ≥2 domains delayed)</p>
              <div className="space-y-1">
                {[
                  "Thyroid function (T4, TSH) — exclude congenital hypothyroidism",
                  "Karyotype / chromosomal microarray (CMA) — exclude trisomy, microdeletion",
                  "Fragile X PCR (all boys, girls if family history)",
                  "MRI brain — periventricular leukomalacia, corpus callosum anomalies, cortical dysplasia",
                  "Metabolic screen: urine organic acids, plasma amino acids, ammonia, lactate",
                  "TORCH titres if dysmorphic or microcephalic",
                  "Hearing assessment (OAE + BERA) — hearing loss causes language delay",
                  "Vision screening — refraction, ophthalmology",
                  "EEG if seizure suspected",
                  "Whole Exome Sequencing (WES) if above negative + strong family history",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                    <input type="checkbox" className="mt-0.5 rounded" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Developmental Monitoring Schedule */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-4 py-2.5 bg-blue-50 border-b border-blue-100">
                <p className="text-sm font-bold text-blue-900">🗓️ Developmental Monitoring Schedule — WHO/IAP/AAP</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="text-left px-3 py-2 font-bold text-slate-700">Visit Age</th>
                      <th className="text-left px-2 py-2 font-bold text-blue-700">Screen/Tool</th>
                      <th className="text-left px-2 py-2 font-bold text-green-700">Action if Concern</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { age: "Birth–4w", screen: "Hearing OAE (UNHS). APGAR. Tone. Reflexes.", action: "BERA if OAE fail. Neurology if tone abnormal." },
                      { age: "6–8 weeks", screen: "Social smile. Fixation/tracking. No head control by 4m = flag.", action: "Ophthalmology for tracking failure. Neurology if floppy." },
                      { age: "3–4 months", screen: "Head control, social smile, cooing. Visual tracking.", action: "MRI brain if no head control. Ophthalmology if no visual tracking." },
                      { age: "6 months", screen: "Sitting with support, transfer, monosyllables. Stranger awareness.", action: "Refer GDD workup if 2+ domains delayed." },
                      { age: "9 months", screen: "Pincer grasp, dada/mama non-specifically. Crawling.", action: "Physiotherapy if not crawling. Hearing reassessment." },
                      { age: "12 months", screen: "Walk with support, 1 word with meaning. M-CHAT-R/F start.", action: "Developmental paediatrician if no words or no walking." },
                      { age: "15–18 months", screen: "3–10 words, walks alone. M-CHAT-R/F. Point, show, wave.", action: "ASD workup if M-CHAT positive ≥2 critical items." },
                      { age: "24 months", screen: "2-word phrases, runs. CARS-2. Imaginative play.", action: "Speech therapy if <50 words. ADOS-2 if ASD suspected." },
                      { age: "3 years", screen: "Sentences, toilet trained. Preschool readiness.", action: "Cognitive testing. Special ed referral if needed." },
                      { age: "4–5 years", screen: "Literacy readiness. Attention (ADHD screen: SNAP-IV). Vision/hearing before school.", action: "ADHD assessment. Reading support. Vision correction." },
                      { age: "School age (6–12y)", screen: "Academic performance. ADHD, learning disability, anxiety screen.", action: "Psychoeducational assessment. ADHD management." },
                    ].map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                        <td className="px-3 py-2 font-bold text-slate-700">{row.age}</td>
                        <td className="px-2 py-2 text-blue-800">{row.screen}</td>
                        <td className="px-2 py-2 text-green-800">{row.action}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* RBSK referral */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm font-bold text-amber-900 mb-2">🏥 RBSK/DEIC Referral (India)</p>
              <ol className="space-y-1">
                {[
                  "Screen using RBSK tools at Anganwadi / sub-centre level",
                  "Children with any delay → refer to DEIC (District Early Intervention Centre)",
                  "DEIC provides: multidisciplinary evaluation, therapy (PT/OT/SLT), hearing aids",
                  "ADIP scheme: free assistive devices for children with disability",
                  "Sarva Shiksha Abhiyan (SSA): integration into regular school",
                  "Disability certificate: obtained via DEIC → enables government benefits",
                  "Rashtriya Bal Swasthya Karyakram (RBSK): screens all children 0–18y at Anganwadi, school level for 4Ds (Defects, Deficiencies, Diseases, Developmental delays)",
                  "NIVH (National Institute for Visually Handicapped), ALI (Ali Yavar Jung) for sensory disabilities",
                ].map((s, i) => <li key={i} className="text-xs text-amber-800 flex gap-1.5"><span className="font-bold text-amber-600">{i+1}.</span>{s}</li>)}
              </ol>
            </div>
          </div>
        )}

        {/* ── NUTRITION ── */}
        {activeTab === "nutrition" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-orange-600 rounded-xl shadow">
              <Apple className="w-5 h-5 text-white shrink-0" />
              <div>
                <p className="font-bold text-white text-sm">Nutrition Guidelines — IAP/WHO/NIN/ICMR</p>
                <p className="text-orange-100 text-xs">IYCF · SAM · MUAC · Growth · Micronutrients · Obesity · Neonatal · CKD Nutrition</p>
              </div>
            </div>

            {/* Search box for nutrition */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search nutrition guidelines (e.g. MUAC, SAM, vitamin D, IYCF, obesity…)"
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-300" />
            </div>

            {search && (
              <p className="text-xs text-slate-500">{filteredNutrition.length} guideline(s) match "{search}"</p>
            )}

            {/* Nutrition guideline cards */}
            {filteredNutrition.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <Apple className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No nutrition guidelines match your search</p>
              </div>
            ) : (
              filteredNutrition.map(section => (
                <NutritionGuidelineCard key={section.title} section={section} defaultOpen={!!search} />
              ))
            )}

            {/* WHO/IAP Supplementation Schedule */}
            <div className="rounded-xl border-2 border-green-200 bg-green-50 overflow-hidden">
              <button className="w-full flex items-center justify-between px-4 py-3 bg-green-100 text-left"
                onClick={e => e.currentTarget.nextElementSibling.classList.toggle('hidden')}>
                <span className="text-sm font-bold text-green-900">📅 Supplementation Calendar — India (IAP/NHM)</span>
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
              </button>
              <div className="hidden p-4 overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead><tr className="bg-green-100">
                    <th className="text-left px-2 py-2 font-bold">Age</th>
                    <th className="text-left px-2 py-2 font-bold">Iron/Folate</th>
                    <th className="text-left px-2 py-2 font-bold">Vitamin A</th>
                    <th className="text-left px-2 py-2 font-bold">Vitamin D</th>
                    <th className="text-left px-2 py-2 font-bold">Zinc</th>
                    <th className="text-left px-2 py-2 font-bold">Others</th>
                  </tr></thead>
                  <tbody>
                    {[
                      { age: "Birth", fe: "Vit K 1mg IM (VKDB prevention)", va: "—", vd: "—", zn: "—", other: "BCG, OPV-0, HBV within 24h" },
                      { age: "6 weeks", fe: "—", va: "—", vd: "400 IU/day (start)", zn: "—", other: "ReSoMal if SAM. ORS with zinc 10mg" },
                      { age: "6 months", fe: "Fe drops 1mg/kg/day (start)", va: "100,000 IU (single dose)", vd: "400 IU/day continue", zn: "Zinc 10mg/day with diarrhoea (14d)", other: "Fluoride varnish if dentist available" },
                      { age: "9 months", fe: "Continue Fe drops", va: "—", vd: "400 IU/day", zn: "—", other: "Measles-Rubella vaccine" },
                      { age: "12 months", fe: "Continue Fe, add dietary Fe", va: "200,000 IU (q6 months)", vd: "Continue 400 IU", zn: "—", other: "MMR, JE (endemic areas)" },
                      { age: "1–5 years", fe: "WIFS: 45mg/week + 400µg FA (school programme)", va: "200,000 IU every 6 months", vd: "600 IU/day OR 60,000 IU/month", zn: "20mg/day with diarrhoea (14d)", other: "Deworming 400mg Albendazole 6-monthly (>1y)" },
                      { age: "5–10 years", fe: "WIFS continues", va: "No routine supplement", vd: "600 IU/day", zn: "As needed with illness", other: "Deworming 6-monthly" },
                      { age: "10–18 years", fe: "Girls: Weekly Fe 60mg + FA 2.5mg (WIFS)", va: "No routine", vd: "600–1000 IU/day", zn: "—", other: "Calcium 1300mg/day (peak bone mass)" },
                    ].map((r, i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-green-50"}>
                        <td className="px-2 py-1.5 font-bold text-green-800">{r.age}</td>
                        <td className="px-2 py-1.5 text-slate-700">{r.fe}</td>
                        <td className="px-2 py-1.5 text-orange-700">{r.va}</td>
                        <td className="px-2 py-1.5 text-amber-700">{r.vd}</td>
                        <td className="px-2 py-1.5 text-blue-700">{r.zn}</td>
                        <td className="px-2 py-1.5 text-slate-600">{r.other}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400 font-semibold">FOOD INTAKE TRACKER</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            <NutritionIntakeTracker />
          </div>
        )}

        {/* ── AI ANALYSERS ── */}
        {activeTab === "analysers" && (
          <div>
            <div className="flex items-center gap-2 mb-4 p-3 bg-violet-600 rounded-xl shadow">
              <Sparkles className="w-5 h-5 text-white shrink-0" />
              <div>
                <p className="font-bold text-white text-sm">AI Clinical Analysers</p>
                <p className="text-violet-100 text-xs">Lab · Urine · Biopsy · Radiology · Uroflow · UDS · ABG</p>
              </div>
            </div>
            <PedsAIAnalysers />
          </div>
        )}

        {/* ── ENDOCRINE ── */}
        {activeTab === "endocrine" && (
          <div>
            <div className="flex items-center gap-2 mb-4 p-3 bg-amber-600 rounded-xl shadow">
              <Zap className="w-5 h-5 text-white shrink-0" />
              <div>
                <p className="font-bold text-white text-sm">Pediatric Endocrinology</p>
                <p className="text-amber-100 text-xs">T1DM · Thyroid · Short Stature · Puberty · CAH · Obesity · Calculators</p>
              </div>
            </div>
            <EndocrineSection />
          </div>
        )}

        {/* ── DYSMORPHOLOGY ── */}
        {activeTab === "dysmorphology" && (
          <div>
            <div className="flex items-center gap-2 mb-4 p-3 bg-indigo-700 rounded-xl shadow">
              <Dna className="w-5 h-5 text-white shrink-0" />
              <div>
                <p className="font-bold text-white text-sm">Dysmorphology Screening Tool</p>
                <p className="text-indigo-100 text-xs">Search syndromes by features · AI syndrome matcher · 12+ genetic syndromes</p>
              </div>
            </div>
            <DysmorphologyScreeningTool />
          </div>
        )}

        {/* ── GASTRO ── */}
        {activeTab === "gastro" && (
          <div>
            <div className="flex items-center gap-2 mb-4 p-3 bg-orange-600 rounded-xl shadow">
              <Activity className="w-5 h-5 text-white shrink-0" />
              <div>
                <p className="font-bold text-white text-sm">Pediatric Gastroenterology</p>
                <p className="text-orange-100 text-xs">GERD · IBD · Coeliac · NEC · Cholestasis · GI Bleed — ESPGHAN/IAP</p>
              </div>
            </div>
            <GastroenterologySection />
          </div>
        )}

        {/* ── HAEMATOLOGY ── */}
        {activeTab === "haematology" && (
          <div>
            <div className="flex items-center gap-2 mb-4 p-3 bg-red-700 rounded-xl shadow">
              <Droplet className="w-5 h-5 text-white shrink-0" />
              <div>
                <p className="font-bold text-white text-sm">Pediatric Haematology</p>
                <p className="text-red-100 text-xs">IDA · Thalassaemia · ITP · Haemophilia · Sickle Cell · HLH — ASH/IAP/WFH</p>
              </div>
            </div>
            <HaematologySection />
          </div>
        )}

        {/* ── REFERENCES ── */}
        {activeTab === "references" && <PedsReferenceSection />}
      </div>

      {/* Edit/Add modal */}
      {(editingPathway || addingNew) && (
        <PathwayModal
          pathway={addingNew ? {} : editingPathway}
          onSave={handleSave}
          onClose={() => { setEditingPathway(null); setAddingNew(false); }}
        />
      )}
    </div>
  );
}