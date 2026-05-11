import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChevronDown, ChevronUp, BookOpen, AlertTriangle, CheckCircle, Info } from "lucide-react";

const BBD_CONDITIONS = [
  {
    name: "Overactive Bladder (OAB)",
    iccs: "ICCS 2016 Terminology: Urgency with/without incontinence, usually with frequency",
    color: "border-red-200 bg-red-50",
    badge: "bg-red-100 text-red-800",
    features: ["Urgency (sudden compelling desire to void)", "Frequency (>8 voids/day)", "Nocturia (>1 episode/night)", "Urge incontinence (in 50%)"],
    pathophysiology: "Uninhibited detrusor contractions, increased afferent signaling, central sensitization",
    bowel: "Constipation in 30–50% — treat bowel first before bladder",
    uroflow: "Tower pattern or normal bell curve; PVR usually low",
    management: [
      "First-line: Urotherapy — bladder diary, timed voiding (every 2–3h), double voiding",
      "Treat constipation aggressively (lactulose, polyethylene glycol)",
      "Behavioral: scheduled toileting, biofeedback",
      "Medical: Oxybutynin 0.2mg/kg TID or Solifenacin 5–10mg OD",
      "Mirabegron (beta-3 agonist) if anticholinergic side effects",
      "Refractory: Botulinum toxin intravesical injection"
    ],
    red_flags: ["Associated VUR → renal risk", "Recurrent UTIs with OAB", "Neurological symptoms"],
  },
  {
    name: "Dysfunctional Voiding (DV)",
    iccs: "ICCS: Habitual contraction of external sphincter during voiding phase in neurologically normal child",
    color: "border-orange-200 bg-orange-50",
    badge: "bg-orange-100 text-orange-800",
    features: ["Staccato flow on uroflowmetry", "Increased EMG during voiding", "Elevated PVR", "Straining during voiding", "Post-void dribbling"],
    pathophysiology: "Paradoxical sphincter contraction during micturition — psychogenic, habitual, or behavioral",
    bowel: "Strongly associated with constipation — Hinman syndrome (complete) vs DV (partial)",
    uroflow: "Staccato pattern with spikes — pathognomonic",
    management: [
      "Urotherapy first line: relaxation techniques, biofeedback",
      "Pelvic floor physiotherapy",
      "Treat constipation",
      "Biofeedback with EMG monitoring",
      "Alpha-blockers (tamsulosin) if high outlet resistance",
      "Psychological support if behavioral etiology"
    ],
    red_flags: ["Hinman syndrome: severe form with recurrent UTIs + VUR + renal scarring", "Psychiatric comorbidity"],
  },
  {
    name: "Underactive Bladder",
    iccs: "ICCS: Low voiding frequency (<3/day) with need to increase intraabdominal pressure",
    color: "border-teal-200 bg-teal-50",
    badge: "bg-teal-100 text-teal-800",
    features: ["Infrequent voiding (<3/day)", "Prolonged voiding time", "Abdominal straining", "High PVR", "Interrupted uroflow pattern"],
    pathophysiology: "Reduced detrusor contractility with compensatory abdominal straining; may be habit-based or neurogenic",
    bowel: "Often comorbid with severe constipation causing mechanical bladder dysfunction",
    uroflow: "Interrupted or prolonged flat pattern; abdominal straining artifact visible",
    management: [
      "Timed voiding every 2h: 'don't wait, go now'",
      "Double voiding technique",
      "Credé maneuver (if no outlet obstruction)",
      "CIC if PVR >20% bladder capacity consistently",
      "Cholinergic agents (bethanechol) — limited pediatric evidence",
      "Biofeedback to improve voiding"
    ],
    red_flags: ["High PVR → recurrent UTIs", "Overflow incontinence", "Upper tract dilatation"],
  },
  {
    name: "Voiding Postponement",
    iccs: "ICCS: Habitual postponement of voiding using holding maneuvers",
    color: "border-amber-200 bg-amber-50",
    badge: "bg-amber-100 text-amber-800",
    features: ["Deliberate postponement of voiding", "Holding maneuvers (leg crossing, squatting, genital holding)", "Urgency when finally voids", "Normal uroflow when cooperates"],
    pathophysiology: "Behavioral — common in school-age children distracted by play; central voluntary inhibition",
    bowel: "May coexist with bowel withholding",
    uroflow: "Normal when voiding finally occurs; sometimes urgency tower pattern",
    management: [
      "Education of child and family — explain bladder function",
      "Timed voiding schedule (alarms every 2–3h)",
      "School permissions for frequent toilet visits",
      "No reward/punishment — normalize toileting",
      "Bladder diary to track improvement",
      "Constipation treatment if present"
    ],
    red_flags: ["Prolonged postponement → bladder overstretch → underactivity"],
  },
  {
    name: "Giggle Incontinence",
    iccs: "ICCS: Involuntary complete bladder emptying during laughing",
    color: "border-pink-200 bg-pink-50",
    badge: "bg-pink-100 text-pink-800",
    features: ["Sudden complete bladder emptying triggered only by laughing", "Normal voiding otherwise", "Normal uroflow and UDS", "Girls predominant", "Often familial"],
    pathophysiology: "Reflex bladder contraction triggered by laughter — possibly cataplexy-like mechanism",
    bowel: "Not typically associated with bowel dysfunction",
    uroflow: "Normal outside giggle episodes; tower if captured",
    management: [
      "Pre-void before laughing situations",
      "Methylphenidate — evidence for giggle incontinence (paradoxical efficacy)",
      "Anticholinergics have limited benefit",
      "Reassurance — often improves with puberty",
      "Biofeedback — some benefit"
    ],
    red_flags: ["Exclude neurological causes of episodic incontinence"],
  },
];

const UROTHERAPY_STEPS = [
  { step: 1, title: "Education", desc: "Explain bladder & bowel function using age-appropriate diagrams. Demystify wetting — not the child's fault." },
  { step: 2, title: "Bladder Diary", desc: "3-day voiding diary: record times, volumes, urgency, leakage, fluid intake. Identify patterns." },
  { step: 3, title: "Bowel Program", desc: "Screen for constipation first. Treat before any bladder intervention. Bristol stool chart training." },
  { step: 4, title: "Timed Voiding", desc: "Schedule every 2–3 hours regardless of urgency. Alarm watches. School cooperation essential." },
  { step: 5, title: "Double Voiding", desc: "Void, wait 2 minutes on toilet, void again. Reduces PVR. Critical for underactive bladder." },
  { step: 6, title: "Voiding Posture", desc: "Feet on footstool. Hip flexion >90°. Relax pelvic floor. Particularly important for girls." },
  { step: 7, title: "Fluid Advice", desc: "Age-appropriate fluid intake. No restriction. Avoid caffeine, carbonated drinks, artificial sweeteners." },
  { step: 8, title: "Biofeedback", desc: "EMG-assisted pelvic floor training for DV. Animated computer games showing sphincter activity." },
];

const BLADDER_DIARY_GUIDE = [
  { param: "Voiding Frequency", normal: "4–8/day", abnormal: ">8 = OAB, <3 = underactive", action: "Timed voiding schedule" },
  { param: "Maximum Voided Volume", normal: ">65% expected capacity", abnormal: "<50% = OAB", action: "Bladder training / anticholinergics" },
  { param: "Urgency Episodes", normal: "0–1/day", abnormal: ">3/day = OAB significant", action: "Urgency suppression techniques" },
  { param: "Nocturia", normal: "0 (school age)", abnormal: ">1/night = concerning", action: "Exclude DI, evening fluid restriction" },
  { param: "Daytime Incontinence", normal: "None (>5 years)", abnormal: "Any episode in >5yr = abnormal", action: "Full BBD assessment" },
  { param: "Bowel Frequency", normal: "3–21/week", abnormal: "<3/week = constipation", action: "Bowel program first" },
];

function ConditionCard({ cond }) {
  const [open, setOpen] = useState(false);
  return (
    <Card className={`border-2 ${cond.color}`}>
      <CardContent className="p-0">
        <button className="w-full flex items-center justify-between p-3" onClick={() => setOpen(v => !v)}>
          <div className="text-left">
            <Badge className={`text-xs ${cond.badge} mb-1`}>{cond.name}</Badge>
            <p className="text-xs text-slate-500 line-clamp-1">{cond.iccs}</p>
          </div>
          {open ? <ChevronUp className="w-4 h-4 flex-shrink-0 text-slate-500" /> : <ChevronDown className="w-4 h-4 flex-shrink-0 text-slate-500" />}
        </button>
        {open && (
          <div className="px-3 pb-3 space-y-3">
            <div className="bg-blue-50 rounded-lg p-2 border border-blue-100">
              <p className="text-xs font-bold text-blue-700 mb-1">ICCS Definition</p>
              <p className="text-xs text-slate-600 italic">{cond.iccs}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 mb-1">Clinical Features</p>
              {cond.features.map((f, i) => <p key={i} className="text-xs text-slate-600">• {f}</p>)}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 mb-1">Pathophysiology</p>
              <p className="text-xs text-slate-600">{cond.pathophysiology}</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-2 border border-amber-100">
              <p className="text-xs font-bold text-amber-700">🍎 Bowel-Bladder Interaction</p>
              <p className="text-xs text-slate-600">{cond.bowel}</p>
            </div>
            <div className="bg-teal-50 rounded-lg p-2 border border-teal-100">
              <p className="text-xs font-bold text-teal-700">📊 Uroflow Pattern</p>
              <p className="text-xs text-slate-600">{cond.uroflow}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 mb-1">Management Steps</p>
              {cond.management.map((m, i) => (
                <div key={i} className="flex items-start gap-2 mb-1">
                  <span className="w-4 h-4 bg-white border-2 border-slate-300 text-slate-600 rounded-full text-xs flex items-center justify-center flex-shrink-0">{i + 1}</span>
                  <p className="text-xs text-slate-700">{m}</p>
                </div>
              ))}
            </div>
            {cond.red_flags?.length > 0 && (
              <div className="bg-red-50 rounded-lg p-2 border border-red-200">
                <p className="text-xs font-bold text-red-700 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Red Flags</p>
                {cond.red_flags.map((r, i) => <p key={i} className="text-xs text-red-600">⚠ {r}</p>)}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function BBDICCSModule() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 p-5 text-white">
        <div className="flex items-center gap-3">
          <BookOpen className="w-7 h-7" />
          <div>
            <h2 className="text-xl font-bold">BBD & ICCS Lower Urinary Tract</h2>
            <p className="text-orange-100 text-sm">ICCS 2016 terminology · Bowel-bladder interaction · Urotherapy · Bladder diary</p>
          </div>
        </div>
      </div>

      {/* Key principle */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-3">
          <p className="text-xs font-bold text-blue-800 mb-1">ICCS Core Principle</p>
          <p className="text-xs text-blue-700">
            <strong>Bowel-Bladder Dysfunction (BBD)</strong> = combination of bladder and bowel symptoms due to pelvic floor dysfunction, constipation, and behavioral voiding patterns in neurologically normal children.
            <br />⚠ <strong>Always treat constipation first</strong> before any bladder intervention.
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="conditions">
        <TabsList className="flex w-full h-auto bg-white border overflow-x-auto p-1">
          <TabsTrigger value="conditions" className="text-xs flex-shrink-0">Conditions (ICCS)</TabsTrigger>
          <TabsTrigger value="urotherapy" className="text-xs flex-shrink-0">Urotherapy Protocol</TabsTrigger>
          <TabsTrigger value="diary" className="text-xs flex-shrink-0">Bladder Diary Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="conditions" className="mt-3 space-y-3">
          {BBD_CONDITIONS.map(cond => (
            <ConditionCard key={cond.name} cond={cond} />
          ))}
          <Card className="border-slate-200 bg-slate-50">
            <CardContent className="p-3">
              <p className="text-xs font-bold text-slate-500 mb-2">Reference</p>
              <p className="text-xs text-slate-600">
                Austin PF, et al. "The Standardization of Terminology of Lower Urinary Tract Function in Children and Adolescents: Update Report From the Standardization Committee of the International Children's Continence Society."
                <span className="font-semibold"> J Urol 2016;191(6 Suppl):S1-S10.</span>
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="urotherapy" className="mt-3 space-y-3">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-3">
              <p className="text-xs font-bold text-green-800">Urotherapy = First-Line Treatment for All Non-Neurogenic LUTD</p>
              <p className="text-xs text-green-700 mt-1">Standard urotherapy (SUB) should be tried for minimum 3 months before any pharmacotherapy in neurologically normal children. Specific urotherapy adds biofeedback, neuromodulation, and pelvic floor training.</p>
            </CardContent>
          </Card>
          {UROTHERAPY_STEPS.map(s => (
            <Card key={s.step} className="border-slate-200">
              <CardContent className="p-3 flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {s.step}
                </div>
                <div>
                  <p className="font-semibold text-sm text-slate-800">{s.title}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{s.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="diary" className="mt-3 space-y-3">
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-3">
              <p className="text-xs font-bold text-amber-800 mb-1">3-Day Bladder Diary — Interpretation Guide</p>
              <p className="text-xs text-amber-700">Record all voids, leakage, urgency, fluid intake, and bowel movements for 3 representative days (2 school days + 1 weekend).</p>
            </CardContent>
          </Card>
          {BLADDER_DIARY_GUIDE.map(item => (
            <Card key={item.param} className="border-slate-200">
              <CardContent className="p-3">
                <p className="font-semibold text-sm text-slate-800 mb-1">{item.param}</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-green-50 rounded p-2 border border-green-100">
                    <p className="text-green-700 font-semibold">Normal</p>
                    <p className="text-slate-600">{item.normal}</p>
                  </div>
                  <div className="bg-red-50 rounded p-2 border border-red-100">
                    <p className="text-red-700 font-semibold">Abnormal</p>
                    <p className="text-slate-600">{item.abnormal}</p>
                  </div>
                </div>
                <div className="mt-2 bg-blue-50 rounded p-2 border border-blue-100 text-xs">
                  <span className="font-semibold text-blue-700">Action: </span>
                  <span className="text-slate-600">{item.action}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}