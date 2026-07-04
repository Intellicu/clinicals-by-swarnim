import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronDown, ChevronUp, ClipboardList, CheckCircle, Plus, Trash2, Upload, Loader2, Pencil, Check, X, FileText, Star } from "lucide-react";
import { toast } from "sonner";

const DEFAULT_TEMPLATES = [
  {
    name: "CKD Monitoring",
    color: "border-blue-200 bg-blue-50",
    badge: "bg-blue-100 text-blue-700",
    items: [
      "eGFR + creatinine: every 3 months (CKD 3-4), monthly (CKD 5)",
      "Urine protein:creatinine ratio: every 3 months",
      "Electrolytes (Na, K, Ca, PO4, Mg, HCO3): every 3 months",
      "PTH + Vitamin D: every 6 months",
      "CBC + iron studies: every 3 months (EPO therapy)",
      "Lipid profile: annually",
      "Growth & nutrition: every visit",
      "Blood pressure: every visit + home diary",
    ],
  },
  {
    name: "Nephrotic Syndrome Relapse Tracker",
    color: "border-purple-200 bg-purple-50",
    badge: "bg-purple-100 text-purple-700",
    items: [
      "Urine dipstick: daily during relapse, alternate days in remission",
      "3+ proteinuria for 3 consecutive days = relapse",
      "Document: date of relapse, steroid dose at relapse, trigger",
      "Track steroid cumulative dose per year",
      "Record steroid-free intervals between relapses",
      "Categorise: SSNS / FRNS / SDNS / SRNS",
      "Growth velocity: every 3 months during steroids",
      "Eye exam: annually if long-term steroids",
    ],
  },
  {
    name: "Transplant Follow-up",
    color: "border-green-200 bg-green-50",
    badge: "bg-green-100 text-green-700",
    items: [
      "Tacrolimus trough: twice weekly (month 1) → weekly → monthly",
      "Creatinine + eGFR: at every visit",
      "BK virus PCR: monthly × 24 months",
      "CMV PCR: monthly × 6 months (D+/R-)",
      "DSA (donor-specific antibodies): 1, 3, 6, 12 months + annually",
      "Urine protein: every visit",
      "Blood pressure: every visit + home diary",
      "EBV PCR: every 3 months (PTLD surveillance)",
    ],
  },
  {
    name: "AKI Recovery",
    color: "border-red-200 bg-red-50",
    badge: "bg-red-100 text-red-700",
    items: [
      "Creatinine + eGFR: daily in ICU → weekly → monthly",
      "Urine output: hourly in ICU → daily",
      "Electrolytes: every 6h in acute → daily → weekly",
      "Fluid balance: strict I/O charting",
      "Follow-up: 3 months post-discharge, then 6-monthly × 2 years",
      "Screen for CKD at 3 months: eGFR, proteinuria, BP",
      "KDIGO AKI-to-CKD transition pathway",
    ],
  },
  {
    name: "BP Monitoring",
    color: "border-orange-200 bg-orange-50",
    badge: "bg-orange-100 text-orange-700",
    items: [
      "Home BP: twice daily (morning + evening) for 1 week before visit",
      "Use correct cuff size (bladder covers 80% arm circumference)",
      "Record: seated, after 5min rest, right arm",
      "Plot on age/sex/height percentile charts",
      "ABPM: gold standard — 24h monitoring for diagnosis + medication titration",
      "Target: <90th percentile (general), <75th (CKD/DM/proteinuria)",
    ],
  },
  {
    name: "Dialysis Monitoring",
    color: "border-cyan-200 bg-cyan-50",
    badge: "bg-cyan-100 text-cyan-700",
    items: [
      "HD: Kt/V monthly (target >1.2), URR >65%",
      "PD: weekly Kt/V + creatinine clearance (target >1.7/week)",
      "PD: PET (peritoneal equilibration test) annually",
      "Dry weight assessment: every session (HD) / monthly (PD)",
      "Exit site: daily inspection, chlorhexidine cleaning",
      "Peritonitis: cell count, culture + Gram stain for cloudy effluent",
      "Nutrition: albumin monthly, dietary review 3-monthly",
      "Access: flow assessment, recirculation studies (HD)",
    ],
  },
  {
    name: "CIC Adherence",
    color: "border-teal-200 bg-teal-50",
    badge: "bg-teal-100 text-teal-700",
    items: [
      "Number of CICs per day (target: 4-6)",
      "Volume drained per catheterisation",
      "Catheter-free urine leaks (indicate urgency/overflow)",
      "UTI episodes: frequency, organism, treatment",
      "Catheter changes: type, frequency, any difficulty",
      "Self-catheterisation progress (age >6-7 years)",
      "Skin integrity around urethra",
    ],
  },
  {
    name: "Bladder Diary",
    color: "border-violet-200 bg-violet-50",
    badge: "bg-violet-100 text-violet-700",
    items: [
      "Fluid intake: type + volume + timing",
      "Voiding frequency: time + volume",
      "Urgency episodes: severity scale 1-5",
      "Incontinence episodes: day/night, volume estimate",
      "Uroflow parameters if available: Qmax, pattern",
      "Post-void residual: timing, volume",
      "Duration: minimum 48h diary (3-day preferred)",
    ],
  },
  {
    name: "Growth Monitoring",
    color: "border-pink-200 bg-pink-50",
    badge: "bg-pink-100 text-pink-700",
    items: [
      "Weight: every visit — plot on WHO/IAP centile charts",
      "Height: every 3 months — plot growth velocity",
      "BMI: calculate + plot on centile charts",
      "Head circumference: every visit (<2 years)",
      "Tanner staging: annually in CKD + steroid patients",
      "Growth velocity: flag if <25th centile for age",
      "GH assessment: if growth failure persists despite nutrition",
      "Bone age: if growth concern (CKD 3-5, long-term steroids)",
    ],
  },
];

const COLORS = [
  { color: "border-blue-200 bg-blue-50", badge: "bg-blue-100 text-blue-700" },
  { color: "border-green-200 bg-green-50", badge: "bg-green-100 text-green-700" },
  { color: "border-purple-200 bg-purple-50", badge: "bg-purple-100 text-purple-700" },
  { color: "border-amber-200 bg-amber-50", badge: "bg-amber-100 text-amber-700" },
  { color: "border-rose-200 bg-rose-50", badge: "bg-rose-100 text-rose-700" },
  { color: "border-teal-200 bg-teal-50", badge: "bg-teal-100 text-teal-700" },
];

function TemplateCard({ template, isAdmin, onDelete }) {
  const [open, setOpen] = useState(false);
  return (
    <Card className={`border-2 ${template.color}`}>
      <CardContent className="p-0">
        <button
          className="w-full flex items-center justify-between p-3 text-left"
          onClick={() => setOpen(v => !v)}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <ClipboardList className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <span className="font-semibold text-sm text-slate-800">{template.name}</span>
            <Badge className={`text-xs ${template.badge}`}>{template.items?.length || 0} items</Badge>
            {template.isCustom && <Badge className="bg-indigo-100 text-indigo-700 text-xs"><Star className="w-2.5 h-2.5 mr-0.5 inline" />Institute</Badge>}
            {template.fileUrl && <Badge className="bg-slate-100 text-slate-600 text-xs"><FileText className="w-2.5 h-2.5 mr-0.5 inline" />File attached</Badge>}
          </div>
          <div className="flex items-center gap-1">
            {isAdmin && template.isCustom && (
              <button onClick={e => { e.stopPropagation(); onDelete(template.id); }}
                className="p-1 rounded hover:bg-red-100 text-red-400 hover:text-red-600 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>
        </button>
        {open && (
          <div className="px-3 pb-3 border-t border-slate-100 pt-2 space-y-1.5">
            {template.fileUrl && (
              <a href={template.fileUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg px-2.5 py-1.5 mb-2 hover:bg-indigo-100">
                <FileText className="w-3.5 h-3.5" />View uploaded file
              </a>
            )}
            {(template.items || []).map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AddTemplatePanel({ onAdded }) {
  const [name, setName] = useState("");
  const [itemsText, setItemsText] = useState("");
  const [file, setFile] = useState(null);
  const [aiExtract, setAiExtract] = useState(false);
  const [loading, setLoading] = useState(false);
  const qc = useQueryClient();

  const handleSubmit = async () => {
    if (!name.trim()) { toast.error("Template name required"); return; }
    setLoading(true);
    try {
      let fileUrl = null;
      let items = itemsText.split("\n").map(s => s.trim()).filter(Boolean);

      if (file) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        fileUrl = file_url;

        if (aiExtract) {
          toast.info("AI extracting monitoring items from file…");
          const res = await base44.integrations.Core.InvokeLLM({
            prompt: `Extract monitoring checklist items from this clinical template document. Return a concise list of monitoring tasks. Format each as a short actionable item.`,
            file_urls: [file_url],
            response_json_schema: {
              type: "object",
              properties: { items: { type: "array", items: { type: "string" } } }
            }
          });
          if (res.items?.length) items = [...res.items, ...items];
        }
      }

      const colorObj = COLORS[Math.floor(Math.random() * COLORS.length)];
      await base44.entities.MonitoringTemplate.create({
        title: name.trim(),
        category: "Custom",
        is_default: false,
        content: { items, fileUrl, color: colorObj.color, badge: colorObj.badge }
      });

      qc.invalidateQueries({ queryKey: ["custom-monitoring-templates"] });
      toast.success("Template saved!");
      setName(""); setItemsText(""); setFile(null);
      onAdded?.();
    } catch (e) {
      toast.error("Failed to save template");
    }
    setLoading(false);
  };

  return (
    <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-4 space-y-3">
      <h3 className="text-sm font-bold text-indigo-800 flex items-center gap-2"><Plus className="w-4 h-4" />Add Institute Template</h3>
      <div>
        <Label className="text-xs font-semibold text-slate-600">Template Name *</Label>
        <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. AIIMS Patna NS Protocol" className="h-8 text-sm mt-1 bg-white" />
      </div>
      <div>
        <Label className="text-xs font-semibold text-slate-600">Monitoring Items (one per line)</Label>
        <Textarea value={itemsText} onChange={e => setItemsText(e.target.value)}
          placeholder={"e.g. Urine dipstick: daily\nBlood pressure: every visit\nCreatinine: monthly"} 
          className="text-xs mt-1 h-24 resize-none bg-white" />
      </div>
      <div>
        <Label className="text-xs font-semibold text-slate-600">Upload Template File (PDF/image — optional)</Label>
        <div className="flex items-center gap-2 mt-1">
          <input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" id="mt-file-upload"
            className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
          <label htmlFor="mt-file-upload"
            className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-indigo-300 text-indigo-700 rounded-lg bg-white hover:bg-indigo-50">
            <Upload className="w-3.5 h-3.5" />{file ? file.name : "Choose file…"}
          </label>
          {file && (
            <label className="flex items-center gap-1 text-xs text-slate-600 cursor-pointer">
              <input type="checkbox" checked={aiExtract} onChange={e => setAiExtract(e.target.checked)} className="w-3.5 h-3.5" />
              AI extract items
            </label>
          )}
        </div>
      </div>
      <Button onClick={handleSubmit} disabled={loading} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white w-full h-8 text-xs">
        {loading ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Saving…</> : <><Check className="w-3.5 h-3.5 mr-1.5" />Save Template</>}
      </Button>
    </div>
  );
}

export default function HubMonitoringTemplates({ isAdmin }) {
  const [showAdd, setShowAdd] = useState(false);
  const qc = useQueryClient();

  const { data: customTemplates = [] } = useQuery({
    queryKey: ["custom-monitoring-templates"],
    queryFn: () => base44.entities.MonitoringTemplate.filter({ category: "Custom" }, "-created_date", 50),
  });

  const handleDelete = async (id) => {
    await base44.entities.MonitoringTemplate.delete(id);
    qc.invalidateQueries({ queryKey: ["custom-monitoring-templates"] });
    toast.success("Template removed");
  };

  const customMapped = customTemplates.map(t => ({
    id: t.id,
    name: t.title,
    isCustom: true,
    color: t.content?.color || "border-indigo-200 bg-indigo-50",
    badge: t.content?.badge || "bg-indigo-100 text-indigo-700",
    items: t.content?.items || [],
    fileUrl: t.content?.fileUrl,
  }));

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-emerald-700 to-teal-600 p-4 text-white">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <ClipboardList className="w-6 h-6" />
            <div>
              <h2 className="text-base font-bold">Monitoring Templates</h2>
              <p className="text-emerald-100 text-xs">Standard + Institute-specific templates</p>
            </div>
          </div>
          {isAdmin && (
            <Button size="sm" onClick={() => setShowAdd(v => !v)}
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30 text-xs h-8">
              <Plus className="w-3.5 h-3.5 mr-1" />{showAdd ? "Cancel" : "Add Template"}
            </Button>
          )}
        </div>
      </div>

      {isAdmin && showAdd && (
        <AddTemplatePanel onAdded={() => setShowAdd(false)} />
      )}

      {customMapped.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-indigo-700 uppercase tracking-wide flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5" />Institute Templates ({customMapped.length})
          </p>
          {customMapped.map((t, i) => (
            <TemplateCard key={i} template={t} isAdmin={isAdmin} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <div className="space-y-2">
        {customMapped.length > 0 && (
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Standard Templates</p>
        )}
        {DEFAULT_TEMPLATES.map((t, i) => (
          <TemplateCard key={i} template={t} isAdmin={false} onDelete={null} />
        ))}
      </div>
    </div>
  );
}