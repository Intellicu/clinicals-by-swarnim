import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChevronDown, ChevronUp, Users, CheckCircle, AlertTriangle, BookOpen, Droplet, Heart, Syringe } from "lucide-react";

function CollapsibleCard({ title, icon, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card className="border-slate-200">
      <CardContent className="p-0">
        <button className="w-full flex items-center justify-between p-4 text-left" onClick={() => setOpen(v => !v)}>
          <div className="flex items-center gap-2">
            {icon}
            <span className="font-semibold text-sm text-slate-800">{title}</span>
          </div>
          {open ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </button>
        {open && <div className="px-4 pb-4 border-t border-slate-100 pt-3">{children}</div>}
      </CardContent>
    </Card>
  );
}

const CIC_STEPS = [
  { step: 1, title: "Wash Hands", detail: "20 seconds with soap and water. Clean technique — not sterile." },
  { step: 2, title: "Prepare Equipment", detail: "Catheter, lubricant, collection vessel, wipes." },
  { step: 3, title: "Positioning", detail: "Lying down or seated. Girls may use mirror initially." },
  { step: 4, title: "Locate Urethra", detail: "Girls: clitoral hood → urethra → vagina." },
  { step: 5, title: "Lubricate Catheter", detail: "Apply lubricant to tip. Hydrophilic: activate with water." },
  { step: 6, title: "Insert Catheter", detail: "Gently, no force. If resistance — try tilting angle." },
  { step: 7, title: "Drain Completely", detail: "Hold until flow stops. Advance slightly. Slowly withdraw." },
  { step: 8, title: "Clean & Store", detail: "Wash with soap, rinse, air dry. Replace per protocol." },
];

const UROTHERAPY_ITEMS = [
  "Timed voiding: every 2-3 hours during waking hours",
  "Double voiding technique: void, wait 30s, void again",
  "Posture correction: feet flat on floor, knees apart",
  "Avoid holding behaviours: respond to urgency promptly",
  "Fluid management: adequate hydration, avoid carbonated/caffeinated drinks",
  "Bowel optimization: daily soft stool before bladder training",
  "Positive reinforcement: star charts, rewards for adherence",
  "Biofeedback: pelvic floor awareness in older children",
];

const BBD_HOME_PROGRAM = [
  "Bladder diary: fluid intake + voiding times + volumes for 3 days",
  "Timed voiding schedule: every 2-3 hours",
  "Bowel program: daily stool, Bristol type 3-4 target",
  "Laxative use if constipated (PEG 3350 0.5-1g/kg/day)",
  "Pelvic floor relaxation during voiding",
  "Avoid straining — let urine flow naturally",
  "Night-time: limit fluids 2h before bed, void before sleep",
  "Follow-up: bladder diary review at each visit",
];

const NS_RELAPSE_MONITORING = [
  "Daily urine dipstick at the same time (first morning void preferred)",
  "3+ proteinuria for 3 consecutive days = RELAPSE — contact nephrologist",
  "During remission: alternate-day dipstick monitoring",
  "Record results in diary with date, time, reading",
  "Watch for: puffy eyes (morning), ankle swelling, decreased urine output",
  "Weigh daily during active disease — rapid weight gain = fluid retention",
  "During upper respiratory infections: increase monitoring frequency",
  "Keep steroid doses and dates documented",
];

const WARNING_SIGNS = [
  { sign: "Fever + cloudy/smelly urine", action: "Possible UTI — contact doctor, collect urine sample" },
  { sign: "Rapid facial/body swelling", action: "Nephrotic relapse or fluid overload — seek care urgently" },
  { sign: "Blood in urine (visible)", action: "May indicate GN flare, UTI, or stone — report immediately" },
  { sign: "Decreased urine output (<0.5 mL/kg/hr)", action: "Possible AKI — seek emergency care" },
  { sign: "Severe headache + vomiting", action: "Possible hypertensive emergency — check BP, seek ER" },
  { sign: "Persistent vomiting/diarrhea", action: "Dehydration risk in CKD/NS — seek care early" },
  { sign: "Missed immunosuppressant doses", action: "Contact nephrologist for guidance — never double dose" },
];

const FAQS = [
  { q: "Can my child attend school normally?", a: "Yes, most children with kidney disease attend school. Inform teachers about medication timings, CIC needs, or activity restrictions if any." },
  { q: "Can my child play sports?", a: "Yes for most conditions. Avoid contact sports if transplanted or on anticoagulation. Swimming is generally fine." },
  { q: "Are vaccinations safe?", a: "Most vaccines are safe. Avoid LIVE vaccines (MMR, varicella, BCG) during immunosuppression. Pneumococcal and influenza vaccines are recommended." },
  { q: "What diet should we follow?", a: "Depends on the condition. CKD: low salt, phosphorus restriction in advanced stages. NS: low salt during relapse. Always consult a renal dietitian." },
  { q: "When should we go to the emergency room?", a: "Fever with no urine output, severe swelling, blood in urine, very high BP, severe vomiting, or missed dialysis sessions." },
];

export default function HubPatientEducation() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-emerald-700 to-teal-600 p-5 text-white">
        <div className="flex items-center gap-3">
          <Users className="w-7 h-7" />
          <div>
            <h2 className="text-xl font-bold">Patient & Family Education</h2>
            <p className="text-emerald-100 text-sm">CIC · CKD · Dialysis · Transplant · Urotherapy · BBD · NS · Warning Signs · FAQs</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="cic">
        <TabsList className="flex w-full h-auto bg-white border overflow-x-auto p-1 gap-0.5">
          <TabsTrigger value="cic" className="text-xs flex-shrink-0">CIC Training</TabsTrigger>
          <TabsTrigger value="urotherapy" className="text-xs flex-shrink-0">Urotherapy</TabsTrigger>
          <TabsTrigger value="bbd" className="text-xs flex-shrink-0">BBD Home</TabsTrigger>
          <TabsTrigger value="ckd" className="text-xs flex-shrink-0">CKD</TabsTrigger>
          <TabsTrigger value="dialysis" className="text-xs flex-shrink-0">Dialysis</TabsTrigger>
          <TabsTrigger value="transplant" className="text-xs flex-shrink-0">Transplant</TabsTrigger>
          <TabsTrigger value="ns" className="text-xs flex-shrink-0">NS Relapse</TabsTrigger>
          <TabsTrigger value="constipation" className="text-xs flex-shrink-0">Constipation</TabsTrigger>
          <TabsTrigger value="fluids" className="text-xs flex-shrink-0">Fluids</TabsTrigger>
          <TabsTrigger value="warnings" className="text-xs flex-shrink-0">Warning Signs</TabsTrigger>
          <TabsTrigger value="faqs" className="text-xs flex-shrink-0">FAQs</TabsTrigger>
        </TabsList>

        {/* CIC Training */}
        <TabsContent value="cic" className="mt-3 space-y-3">
          <Card className="border-teal-200 bg-teal-50">
            <CardContent className="p-3">
              <p className="text-xs font-bold text-teal-800 mb-1">Clean Intermittent Catheterization — Family Training Guide</p>
              <p className="text-xs text-teal-700">CIC is not painful when done correctly. It is the safest way to empty the bladder and protect kidneys.</p>
            </CardContent>
          </Card>
          <div className="space-y-2">
            {CIC_STEPS.map(s => (
              <div key={s.step} className="flex items-start gap-3 bg-white rounded-xl border border-slate-200 p-3">
                <div className="w-7 h-7 bg-teal-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{s.step}</div>
                <div>
                  <p className="font-semibold text-sm text-slate-800">{s.title}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{s.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Urotherapy */}
        <TabsContent value="urotherapy" className="mt-3 space-y-3">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-3">
              <p className="text-xs font-bold text-blue-800 mb-1">Standard Urotherapy — First-Line for BBD</p>
              <p className="text-xs text-blue-700">Non-pharmacological behavioural program. All children with BBD should start here.</p>
            </CardContent>
          </Card>
          {UROTHERAPY_ITEMS.map((item, i) => (
            <div key={i} className="flex items-start gap-2 bg-white rounded-lg border border-slate-200 p-3">
              <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-700">{item}</p>
            </div>
          ))}
        </TabsContent>

        {/* BBD Home Program */}
        <TabsContent value="bbd" className="mt-3 space-y-3">
          <Card className="border-violet-200 bg-violet-50">
            <CardContent className="p-3">
              <p className="text-xs font-bold text-violet-800 mb-1">BBD Home Management Program</p>
              <p className="text-xs text-violet-700">Combined bladder-bowel optimisation. Key to reducing recurrent UTIs and incontinence.</p>
            </CardContent>
          </Card>
          {BBD_HOME_PROGRAM.map((item, i) => (
            <div key={i} className="flex items-start gap-2 bg-white rounded-lg border border-slate-200 p-3">
              <CheckCircle className="w-4 h-4 text-violet-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-700">{item}</p>
            </div>
          ))}
        </TabsContent>

        {/* CKD Counseling */}
        <TabsContent value="ckd" className="mt-3 space-y-3">
          <CollapsibleCard title="Understanding CKD Stages" icon={<span className="text-lg">🏥</span>} defaultOpen>
            <p className="text-xs text-slate-600 mb-2">CKD has 5 stages based on GFR. Stage 1-2: kidneys &gt;60%. Stage 3: 30-60%. Stage 4-5: advanced — prepare for kidney replacement.</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
              <p className="text-xs text-blue-700 italic">"With careful management, we can slow the disease significantly."</p>
            </div>
          </CollapsibleCard>
          <CollapsibleCard title="Diet in CKD" icon={<span className="text-lg">🥗</span>}>
            <p className="text-xs text-slate-600">Early CKD: adequate protein, limit salt. Advanced: restrict phosphorus, potassium, fluid if oliguric. Pediatric renal dietitian referral essential.</p>
          </CollapsibleCard>
          <CollapsibleCard title="Medications" icon={<span className="text-lg">💊</span>}>
            <p className="text-xs text-slate-600">ACEi/ARBs, iron/EPO, vitamin D, sodium bicarbonate, growth hormone. Never stop without asking nephrologist. Avoid NSAIDs.</p>
          </CollapsibleCard>
          <CollapsibleCard title="Home Monitoring" icon={<span className="text-lg">📊</span>}>
            <p className="text-xs text-slate-600">BP twice weekly, fluid I/O if required, dipstick if advised, daily weight in dialysis patients. Report changes in urine output or swelling.</p>
          </CollapsibleCard>
        </TabsContent>

        {/* Dialysis Education */}
        <TabsContent value="dialysis" className="mt-3 space-y-3">
          <CollapsibleCard title="Peritoneal Dialysis (PD)" icon={<Droplet className="w-4 h-4 text-teal-600" />} defaultOpen>
            <p className="text-xs text-slate-600 mb-2">Preferred for children. Fluid fills belly through PD catheter. Done at home overnight. Most families manage independently within 2-3 weeks.</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-green-50 rounded-lg p-2 border border-green-200">
                <p className="text-xs font-bold text-green-700 mb-1">Advantages</p>
                <p className="text-xs text-slate-600">✓ Home-based ✓ Gentler ✓ School-friendly</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-2 border border-amber-200">
                <p className="text-xs font-bold text-amber-700 mb-1">Challenges</p>
                <p className="text-xs text-slate-600">• Daily commitment • Peritonitis risk • Exit care</p>
              </div>
            </div>
          </CollapsibleCard>
          <CollapsibleCard title="Hemodialysis (HD)" icon={<Heart className="w-4 h-4 text-blue-600" />}>
            <p className="text-xs text-slate-600 mb-2">3× weekly at dialysis unit, 3-4h sessions. Machine-supervised. Access care is critical.</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-green-50 rounded-lg p-2 border border-green-200">
                <p className="text-xs font-bold text-green-700 mb-1">Advantages</p>
                <p className="text-xs text-slate-600">✓ Supervised ✓ Predictable ✓ No home equipment</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-2 border border-amber-200">
                <p className="text-xs font-bold text-amber-700 mb-1">Challenges</p>
                <p className="text-xs text-slate-600">• 3×/week visits • Travel • Dietary restrictions</p>
              </div>
            </div>
          </CollapsibleCard>
        </TabsContent>

        {/* Transplant */}
        <TabsContent value="transplant" className="mt-3 space-y-3">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-3">
              <p className="text-xs font-bold text-green-800 mb-1">The Goal of Transplant</p>
              <p className="text-xs text-green-700">Best quality of life for children with kidney failure — better growth, nutrition, schooling than dialysis.</p>
            </CardContent>
          </Card>
          <CollapsibleCard title="Types of Donors" icon={<Syringe className="w-4 h-4 text-purple-600" />} defaultOpen>
            <p className="text-xs text-slate-600">Living donor (best outcomes) or deceased donor. Living transplants avoid years of dialysis.</p>
          </CollapsibleCard>
          <CollapsibleCard title="Lifelong Medicines" icon={<span className="text-lg">💊</span>}>
            <p className="text-xs text-slate-600">Tacrolimus + mycophenolate + prednisolone. NEVER miss a dose. Regular clinic visits: weekly → monthly → 3-monthly.</p>
          </CollapsibleCard>
          <CollapsibleCard title="Warning Signs of Rejection" icon={<AlertTriangle className="w-4 h-4 text-red-500" />}>
            <p className="text-xs text-slate-600">Fever, decreased urine, pain over transplant, rising creatinine. Call nephrologist immediately.</p>
          </CollapsibleCard>
        </TabsContent>

        {/* NS Relapse Monitoring */}
        <TabsContent value="ns" className="mt-3 space-y-3">
          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="p-3">
              <p className="text-xs font-bold text-purple-800 mb-1">Nephrotic Syndrome — Home Monitoring Guide</p>
              <p className="text-xs text-purple-700">Early detection of relapse at home prevents complications and hospital admissions.</p>
            </CardContent>
          </Card>
          {NS_RELAPSE_MONITORING.map((item, i) => (
            <div key={i} className="flex items-start gap-2 bg-white rounded-lg border border-slate-200 p-3">
              <CheckCircle className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-700">{item}</p>
            </div>
          ))}
        </TabsContent>

        {/* Constipation */}
        <TabsContent value="constipation" className="mt-3 space-y-3">
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-3">
              <p className="text-xs font-bold text-amber-800 mb-1">Constipation Management — Essential for Bladder Health</p>
              <p className="text-xs text-amber-700">A loaded rectum compresses the bladder. Treating constipation is the first step in treating BBD.</p>
            </CardContent>
          </Card>
          {[
            "Target: daily soft stool (Bristol type 3-4)",
            "PEG 3350 (Miralax): 0.5-1 g/kg/day as maintenance",
            "Disimpaction first if faecal loading: PEG 1.5 g/kg/day × 3-5 days",
            "High-fibre diet: fruits, vegetables, whole grains",
            "Adequate fluids: 1-1.5 L/day for school-age children",
            "Toilet routine: sit for 5-10 min after meals (gastrocolic reflex)",
            "Avoid withholding behaviours: positive toilet training approach",
            "Duration: continue laxatives 6+ months, slow taper when regular",
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2 bg-white rounded-lg border border-slate-200 p-3">
              <CheckCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-700">{item}</p>
            </div>
          ))}
        </TabsContent>

        {/* Fluid Guidance */}
        <TabsContent value="fluids" className="mt-3 space-y-3">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-3">
              <p className="text-xs font-bold text-blue-800 mb-1">Fluid Guidance for Families</p>
            </CardContent>
          </Card>
          {[
            "General: 30-40 mL/kg/day or ~1-1.5L for school-age children",
            "CKD (oliguric): fluid restrict to insensible + urine output",
            "Dialysis (HD): 500 mL + previous day urine output",
            "Nephrotic relapse: no extra restriction unless severe oedema",
            "BBD/UTI prevention: ensure adequate fluids — avoid concentrated urine",
            "Avoid: carbonated drinks, excessive dairy, caffeinated beverages",
            "Stones: increase fluid to 2-3 L/day (maintain urine SG <1.010)",
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2 bg-white rounded-lg border border-slate-200 p-3">
              <Droplet className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-700">{item}</p>
            </div>
          ))}
        </TabsContent>

        {/* Warning Signs */}
        <TabsContent value="warnings" className="mt-3 space-y-3">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-3">
              <p className="text-xs font-bold text-red-800 mb-1">⚠ Warning Signs — When to Seek Immediate Medical Care</p>
            </CardContent>
          </Card>
          {WARNING_SIGNS.map((ws, i) => (
            <Card key={i} className="border-red-100">
              <CardContent className="p-3">
                <p className="text-xs font-bold text-red-800 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {ws.sign}</p>
                <p className="text-xs text-slate-600 mt-1">→ {ws.action}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* FAQs */}
        <TabsContent value="faqs" className="mt-3 space-y-3">
          {FAQS.map((faq, i) => (
            <CollapsibleCard key={i} title={faq.q} icon={<BookOpen className="w-4 h-4 text-indigo-600" />}>
              <p className="text-xs text-slate-600">{faq.a}</p>
            </CollapsibleCard>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}