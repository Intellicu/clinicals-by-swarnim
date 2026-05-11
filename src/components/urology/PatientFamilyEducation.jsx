import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChevronDown, ChevronUp, Users, BookOpen, Heart, CheckCircle } from "lucide-react";

const CIC_TRAINING = {
  title: "Clean Intermittent Catheterization (CIC) — Family Training Guide",
  intro: "CIC is not painful when done correctly. It is the safest way to empty the bladder completely and protect the kidneys. It is clean, not sterile.",
  steps: [
    { step: 1, title: "Wash Hands", detail: "20 seconds with soap and water. Use clean technique — not sterile gloves required for home." },
    { step: 2, title: "Prepare Equipment", detail: "Catheter (reuse type or single use), lubricant, collection vessel, wipes. Keep catheter clean between uses." },
    { step: 3, title: "Positioning", detail: "Lying down or seated. Girls may use mirror initially. Boys — retract foreskin if uncircumcised." },
    { step: 4, title: "Locate Urethra", detail: "Girls: clitoral hood → urethra → vagina. Front opening = urethra. Practice with mirror initially." },
    { step: 5, title: "Lubricate Catheter", detail: "Apply lubricant to catheter tip. Hydrophilic catheters: activate with water. This prevents trauma." },
    { step: 6, title: "Insert Catheter", detail: "Gently, no force. If resistance → don't push. Try tilting angle. Breathe and relax pelvic floor." },
    { step: 7, title: "Drain Completely", detail: "Hold in place until flow stops. Advance slightly. Wait. Then slowly withdraw while draining." },
    { step: 8, title: "Clean & Store", detail: "Wash catheter with soap, rinse, air dry. Store in clean dry container. Replace per protocol." },
  ],
  schedule: [
    "Every 3–4 hours during waking hours",
    "Adjust based on UDS bladder capacity",
    "Set phone alarms for regular timing",
    "Before bed and once at night if needed",
    "Total 4–6 CICs per day typically",
  ],
  catheters: [
    { type: "Nelaton (reusable)", desc: "Most common in India. Wash and reuse 4–6 weeks. Cost-effective.", size: "Fr 6–10 for children" },
    { type: "Hydrophilic (single use)", desc: "Ready-to-use water-activated. Less friction. Best for frequent travelers.", size: "Fr 6–12" },
    { type: "Intermittent Self-Catheterization", desc: "Age >5–6 years for boys, >7–8 for girls typically achievable.", size: "Train appropriately" },
  ],
  warning_signs: [
    "Fever + cloudy urine + burning = possible UTI → contact doctor",
    "Blood in urine for >2 CICs = report",
    "Difficulty inserting catheter = report immediately",
    "Unable to drain despite correct technique = seek help",
  ],
  school_guidance: [
    "Inform school nurse/teacher in writing",
    "Privacy-assured toilet access essential",
    "Child can self-catheterize at school by age 7–10",
    "Carry catheter supplies in discreet pouch",
    "Educate teacher: CIC is a medical necessity, not optional",
  ],
};

const CKD_COUNSELING = [
  {
    topic: "Understanding CKD Stages",
    icon: "🏥",
    content: "CKD has 5 stages based on GFR (kidney filtration rate). Stage 1-2: kidneys working >60% — focus on protecting them. Stage 3: working 30-60% — more monitoring. Stage 4-5: advanced — prepare for kidney replacement.",
    parent_message: "Your child's kidneys are not working at full capacity. With careful management, we can slow the disease significantly.",
    actions: ["Know your child's GFR and stage", "Keep all follow-up appointments", "Monitor growth and blood pressure"],
  },
  {
    topic: "Diet in CKD",
    icon: "🥗",
    content: "CKD diet changes by stage. Early CKD: adequate protein, limit salt. Advanced CKD: restrict phosphorus (dairy, processed foods), potassium (bananas, oranges), and fluid if oliguric.",
    parent_message: "A CKD dietitian is essential. Don't restrict unnecessarily — growing children need calories.",
    actions: ["Referral to pediatric renal dietitian", "Phosphorus binder if prescribed", "Low-salt diet for all stages"],
  },
  {
    topic: "Medications",
    icon: "💊",
    content: "Common CKD medications: ACE inhibitors/ARBs (protect kidneys, lower BP), iron/EPO (for anemia), vitamin D analogs (bone health), sodium bicarbonate (correct acidosis), growth hormone (if growth failure).",
    parent_message: "Never stop medications without asking your nephrologist. Many medications are protecting your child's kidneys.",
    actions: ["Keep medication list updated", "Avoid NSAIDs (ibuprofen, naproxen)", "Ensure vaccinations are up to date"],
  },
  {
    topic: "Monitoring at Home",
    icon: "📊",
    content: "Home monitoring: BP twice weekly, fluid intake/output if required, urine dipstick if advised, weight daily in dialysis patients.",
    parent_message: "Your daily observations are as important as blood tests. Changes in urine output, swelling, or energy level need to be reported.",
    actions: ["BP diary", "Watch for swelling (face, feet)", "Track school attendance and energy"],
  },
  {
    topic: "Preparing for Dialysis",
    icon: "💉",
    content: "If kidney function falls to stage 5 (GFR <15), kidney replacement therapy (dialysis or transplant) becomes necessary. Discussion should start early at stage 4. Options: hemodialysis, peritoneal dialysis, pre-emptive transplant.",
    parent_message: "Starting this conversation early is not giving up — it's planning for the best care.",
    actions: ["Family meeting with nephrologist at stage 4", "Transplant workup when appropriate", "Sibling donor evaluation if suitable"],
  },
];

const DIALYSIS_EDUCATION = [
  {
    type: "Peritoneal Dialysis (PD)",
    suitable: "All ages including infants, preferred for children",
    how: "Dialysate fluid fills the belly through a small soft tube (PD catheter). The belly lining (peritoneum) acts as a filter. Fluid drained after 4-6 hours. Usually done at home overnight (CAPD/APD).",
    advantages: ["Done at home — no hospital visits", "Continuous — gentler on body", "Better for residual kidney function", "No vascular access needed"],
    challenges: ["Daily commitment from family", "Risk of peritonitis (infection)", "Catheter exit site care"],
    parent_guidance: "Your child can go to school normally. PD machine runs at night. With training, most families manage independently within 2-3 weeks.",
  },
  {
    type: "Hemodialysis (HD)",
    suitable: "Children >5-10 kg, 3 times per week at dialysis unit",
    how: "Blood is taken from the body, filtered through an artificial kidney machine, and returned clean. Done through a fistula (permanent access in arm) or temporary line. Each session: 3-4 hours.",
    advantages: ["Machine does all the work", "No home equipment storage", "Supervised by nurses", "Predictable schedule"],
    challenges: ["3x/week hospital visits", "Travel burden", "Dietary restrictions between sessions", "Access-related problems"],
    parent_guidance: "Children do well with HD. School and activity should continue on non-dialysis days. Access care is critical.",
  },
];

const TRANSPLANT_COUNSELING = [
  { title: "What is a kidney transplant?", content: "A healthy kidney from a donor is placed in the lower abdomen. It takes over the work of both failed kidneys. The old kidneys remain in place usually." },
  { title: "Types of donors", content: "Living donor (parent, sibling, relative) — best outcomes. Deceased donor — waiting list. Living donor transplants can be planned ahead — avoid years of dialysis." },
  { title: "Before transplant", content: "Complete medical evaluation, dental clearance, vaccinations (must be up to date BEFORE), psychosocial assessment. Usually 3-6 months preparation." },
  { title: "Medicines after transplant", content: "Lifelong immunosuppression: tacrolimus, mycophenolate, prednisolone. These prevent rejection. NEVER miss a dose. NEVER take without prescription." },
  { title: "Life after transplant", content: "Most children return to school within 3 months. Normal activities, sports (avoid contact sports initially). Regular clinic visits: weekly → monthly → 3-monthly." },
  { title: "Warning signs of rejection", content: "Fever, decreased urine output, pain over transplant site, rising creatinine on blood test. Call nephrologist immediately — don't wait." },
];

function CollapsibleCard({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card className="border-slate-200">
      <CardContent className="p-0">
        <button
          className="w-full flex items-center justify-between p-4 text-left"
          onClick={() => setOpen(v => !v)}
        >
          <span className="font-semibold text-sm text-slate-800">{title}</span>
          {open ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </button>
        {open && <div className="px-4 pb-4">{children}</div>}
      </CardContent>
    </Card>
  );
}

export default function PatientFamilyEducation() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-emerald-700 to-teal-600 p-5 text-white">
        <div className="flex items-center gap-3">
          <Users className="w-7 h-7" />
          <div>
            <h2 className="text-xl font-bold">Patient & Family Education</h2>
            <p className="text-emerald-100 text-sm">CIC training · CKD counseling · Dialysis education · Transplant guidance · Urotherapy</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="cic">
        <TabsList className="flex w-full h-auto bg-white border overflow-x-auto p-1">
          <TabsTrigger value="cic" className="text-xs flex-shrink-0">CIC Training</TabsTrigger>
          <TabsTrigger value="ckd" className="text-xs flex-shrink-0">CKD Counseling</TabsTrigger>
          <TabsTrigger value="dialysis" className="text-xs flex-shrink-0">Dialysis Ed</TabsTrigger>
          <TabsTrigger value="transplant" className="text-xs flex-shrink-0">Transplant</TabsTrigger>
        </TabsList>

        <TabsContent value="cic" className="mt-3 space-y-3">
          <Card className="border-teal-200 bg-teal-50">
            <CardContent className="p-3">
              <p className="text-xs font-bold text-teal-800 mb-1">{CIC_TRAINING.title}</p>
              <p className="text-xs text-teal-700">{CIC_TRAINING.intro}</p>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Step-by-Step Technique</p>
            {CIC_TRAINING.steps.map(s => (
              <div key={s.step} className="flex items-start gap-3 bg-white rounded-xl border border-slate-200 p-3">
                <div className="w-7 h-7 bg-teal-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{s.step}</div>
                <div>
                  <p className="font-semibold text-sm text-slate-800">{s.title}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{s.detail}</p>
                </div>
              </div>
            ))}
          </div>

          <CollapsibleCard title="CIC Schedule">
            {CIC_TRAINING.schedule.map((s, i) => (
              <p key={i} className="text-xs text-slate-700 flex items-start gap-2 mb-1">
                <CheckCircle className="w-3.5 h-3.5 text-teal-600 flex-shrink-0 mt-0.5" />{s}
              </p>
            ))}
          </CollapsibleCard>

          <CollapsibleCard title="Types of Catheters">
            {CIC_TRAINING.catheters.map((c, i) => (
              <div key={i} className="bg-slate-50 rounded-lg p-2 border border-slate-200 mb-2">
                <p className="font-semibold text-sm text-slate-800">{c.type}</p>
                <p className="text-xs text-slate-600">{c.desc}</p>
                <Badge className="mt-1 bg-slate-100 text-slate-600 text-xs">{c.size}</Badge>
              </div>
            ))}
          </CollapsibleCard>

          <CollapsibleCard title="School & Daily Life">
            {CIC_TRAINING.school_guidance.map((s, i) => (
              <p key={i} className="text-xs text-slate-700 mb-1">✓ {s}</p>
            ))}
          </CollapsibleCard>

          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-3">
              <p className="text-xs font-bold text-red-700 mb-2">⚠ Warning Signs — When to Call Doctor</p>
              {CIC_TRAINING.warning_signs.map((w, i) => (
                <p key={i} className="text-xs text-red-600 mb-1">• {w}</p>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ckd" className="mt-3 space-y-3">
          {CKD_COUNSELING.map(item => (
            <Card key={item.topic} className="border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{item.icon}</span>
                  <p className="font-bold text-sm text-slate-800">{item.topic}</p>
                </div>
                <p className="text-xs text-slate-600 mb-2">{item.content}</p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-2">
                  <p className="text-xs font-bold text-blue-700">Message for Families:</p>
                  <p className="text-xs text-blue-600 italic">"{item.parent_message}"</p>
                </div>
                <div>
                  {item.actions.map((a, i) => (
                    <p key={i} className="text-xs text-slate-700 flex items-start gap-1.5 mb-0.5">
                      <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />{a}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="dialysis" className="mt-3 space-y-3">
          {DIALYSIS_EDUCATION.map(d => (
            <Card key={d.type} className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <p className="font-bold text-blue-800 mb-1">{d.type}</p>
                <Badge className="bg-blue-100 text-blue-700 text-xs mb-2">{d.suitable}</Badge>
                <p className="text-xs text-slate-600 mb-3">{d.how}</p>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="bg-green-50 rounded-lg p-2 border border-green-200">
                    <p className="text-xs font-bold text-green-700 mb-1">Advantages</p>
                    {d.advantages.map((a, i) => <p key={i} className="text-xs text-slate-600">✓ {a}</p>)}
                  </div>
                  <div className="bg-amber-50 rounded-lg p-2 border border-amber-200">
                    <p className="text-xs font-bold text-amber-700 mb-1">Challenges</p>
                    {d.challenges.map((c, i) => <p key={i} className="text-xs text-slate-600">• {c}</p>)}
                  </div>
                </div>
                <div className="bg-white rounded-lg p-2 border border-blue-200">
                  <p className="text-xs font-bold text-blue-700">Parent Guidance:</p>
                  <p className="text-xs text-slate-600 italic">{d.parent_guidance}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="transplant" className="mt-3 space-y-3">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-3">
              <p className="text-xs font-bold text-green-800 mb-1">The Goal of Transplant</p>
              <p className="text-xs text-green-700">A successful kidney transplant provides the best quality of life for children with kidney failure — better growth, nutrition, schooling, and development than long-term dialysis.</p>
            </CardContent>
          </Card>
          {TRANSPLANT_COUNSELING.map((t, i) => (
            <Card key={i} className="border-slate-200">
              <CardContent className="p-3">
                <p className="font-semibold text-sm text-slate-800 mb-1">{t.title}</p>
                <p className="text-xs text-slate-600">{t.content}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}