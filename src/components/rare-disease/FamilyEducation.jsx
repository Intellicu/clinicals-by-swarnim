import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, ChevronDown, ChevronUp, Heart, BookOpen, Phone } from "lucide-react";

const EDUCATION_MODULES = [
  {
    disease: "aHUS",
    icon: "🛡️",
    color: "red",
    key_messages: [
      "Your child has a rare condition where the immune system damages their own kidneys and blood vessels",
      "This is NOT caused by a diarrhoea infection (different from typical HUS)",
      "Treatment with eculizumab (a special medicine) protects by blocking the part of the immune system causing damage",
      "Your child MUST carry an emergency card at all times — fever requires immediate hospital visit",
      "All vaccines recommended before treatment — protect against meningococcal bacteria",
      "Regular hospital monitoring is essential — never skip infusion appointments",
    ],
    emergency_signs: ["Fever ≥38°C — go to emergency immediately", "Severe headache or neck stiffness", "Sudden rash especially purple/red spots", "Unusual tiredness or not passing urine"],
    support_orgs: ["aHUS Foundation (ahus.org)", "NPRD HELPLINE 1800-11-4477"]
  },
  {
    disease: "Cystinosis",
    icon: "👁️",
    color: "amber",
    key_messages: [
      "Cystinosis is a rare inherited condition where a substance called cystine builds up in body organs including kidneys, eyes, thyroid, and muscles",
      "Regular cysteamine (tablet/capsule) medicine every 6 hours is essential — never stop without doctor advice",
      "Eye drops (cysteamine eye drops) are needed for eyes — usually 6 times per day",
      "Your child needs regular eye checks and hearing tests",
      "With good treatment, many children can live well and attend normal school",
      "Kidney transplant may be needed in future — the transplant works well but medicine must continue for other organs",
    ],
    emergency_signs: ["High fever + vomiting — risk of low sodium", "Eye pain or increased sensitivity to light", "Difficulty swallowing"],
    support_orgs: ["Cystinosis Research Foundation (cystinosis.org)", "Cystinosis India Facebook group"]
  },
  {
    disease: "Fabry Disease",
    icon: "💜",
    color: "violet",
    key_messages: [
      "Fabry disease is caused by a missing enzyme (alpha-galactosidase A) that leads to fat building up in blood vessels and organs",
      "It affects kidneys, heart, brain, and nervous system",
      "Enzyme replacement therapy (ERT) given as IV drip every 2 weeks helps the body clear the fat buildup",
      "Burning pain in hands and feet (Fabry pain crisis) is common — medicines can help",
      "Regular heart checks and brain scans are needed",
      "All female relatives (sisters, aunts, daughters) should be tested — they can also have Fabry disease",
    ],
    emergency_signs: ["Sudden chest pain or shortness of breath", "Sudden severe headache or weakness on one side", "Fainting or palpitations"],
    support_orgs: ["Fabry International Network", "ICORD (India)", "Fabry Australia support"]
  },
  {
    disease: "Primary Hyperoxaluria",
    icon: "🪨",
    color: "orange",
    key_messages: [
      "Your child's kidneys form too much of a substance called oxalate, which forms painful kidney stones and deposits in organs",
      "This is caused by a gene change in the liver, NOT a problem with diet alone",
      "Drinking LOTS of water every day is essential — at least 3 litres every day",
      "New injection treatment (lumasiran) can greatly reduce oxalate — given monthly or 3-monthly",
      "Some children may need kidney and liver transplant — the liver produces too much oxalate",
      "Regular eye and heart checks are needed to look for oxalate deposits",
    ],
    emergency_signs: ["Severe loin pain (stone passage)", "Blood in urine", "High fever + chills (urinary infection with stone)", "Decreased urine output"],
    support_orgs: ["OHF — Oxalosis & Hyperoxaluria Foundation (ohf.org)", "PH India Support Network"]
  },
  {
    disease: "Alport Syndrome",
    icon: "👂",
    color: "indigo",
    key_messages: [
      "Alport syndrome is a hereditary kidney condition that also affects hearing and eyes",
      "It is caused by a change in the collagen that makes up the kidney filter, inner ear, and eye lens",
      "Blood in urine and protein in urine are the main kidney signs — this is NOT dangerous on its own but needs monitoring",
      "Medicine (ACE inhibitor like enalapril) when protein appears in urine can slow kidney damage",
      "Regular hearing tests are important — hearing aids may be needed",
      "All family members (brothers, sisters, maternal uncles, mother) should have urine and hearing tests",
    ],
    emergency_signs: ["Large amounts of blood in urine (frank haematuria) → rule out infection or obstruction", "Rapidly rising creatinine", "Severe hypertension"],
    support_orgs: ["Alport Syndrome Foundation (alportsyndrome.org)", "KDIGO Alport support resources"]
  },
  {
    disease: "ARPKD",
    icon: "🫘",
    color: "teal",
    key_messages: [
      "Your child was born with many cysts (fluid-filled sacs) in the kidneys and liver — this is from a gene change they inherited",
      "Both kidneys are enlarged but they still produce some urine — this is expected",
      "Blood pressure MUST be controlled with daily medicine — high BP damages kidneys faster",
      "Liver involvement (enlarged liver, portal hypertension) needs regular monitoring",
      "Your child needs high-calorie diet support — kidneys use extra energy",
      "Many children with ARPKD attend school, play sports, and live full lives with treatment",
    ],
    emergency_signs: ["Vomiting blood or black stools (varices bleeding)", "Very high blood pressure + headache", "Fever + loin pain (kidney infection)", "Not passing urine"],
    support_orgs: ["PKD Foundation India", "PKD Charity UK (pkdcharity.org)", "ARPKD/CHF Alliance"]
  },
];

const COUNSELLING_FRAMEWORK = [
  { step: "Initial Diagnosis", approach: "Allow grief and shock response. Do not rush. Use simple language. Provide written summary to take home. Avoid overwhelming with information." },
  { step: "Understanding the Disease", approach: "Use visual aids (diagrams of kidney, gene inheritance charts). Explain in native language if possible. Address 'Why us?' — explain genetics simply." },
  { step: "Treatment Explanation", approach: "Explain what each medicine does. Use analogies. Address cost concerns proactively. Connect with NPRD/hospital social worker for funding." },
  { step: "Emergency Planning", approach: "Give emergency card. Role-play scenarios: 'What to do if child has fever'. Ensure school/daycare knows the diagnosis. Provide 24h contact number." },
  { step: "Long-term Planning", approach: "Discuss transplant timeline (if relevant) early — not as crisis. Educational support planning. Transition to adult services from age 14-16." },
  { step: "Sibling/Family Testing", approach: "Explain who should be tested. Organise cascade testing through clinic. Address anxiety about testing results for other children." },
  { step: "Psychological Support", approach: "Screen parents for anxiety/depression (PHQ-2). Connect with psychologist. Peer support groups. Online rare disease communities." },
];

const COLOR_MAP = {
  red: { badge: "bg-red-100 text-red-800", header: "bg-red-50", border: "border-red-200" },
  amber: { badge: "bg-amber-100 text-amber-800", header: "bg-amber-50", border: "border-amber-200" },
  violet: { badge: "bg-violet-100 text-violet-800", header: "bg-violet-50", border: "border-violet-200" },
  orange: { badge: "bg-orange-100 text-orange-800", header: "bg-orange-50", border: "border-orange-200" },
  indigo: { badge: "bg-indigo-100 text-indigo-800", header: "bg-indigo-50", border: "border-indigo-200" },
  teal: { badge: "bg-teal-100 text-teal-800", header: "bg-teal-50", border: "border-teal-200" },
};

function EducationCard({ module }) {
  const [open, setOpen] = useState(false);
  const c = COLOR_MAP[module.color];
  return (
    <Card className={`bg-white border ${c.border} shadow-sm overflow-hidden`}>
      <button className={`w-full flex items-center gap-3 p-4 ${c.header} hover:opacity-90 transition-opacity text-left`} onClick={() => setOpen(!open)}>
        <span className="text-2xl">{module.icon}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-900">{module.disease} — Family Education Guide</span>
            <Badge className={`text-xs ${c.badge}`}>Patient Ed</Badge>
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && (
        <div className="p-4 space-y-4 border-t border-slate-100">
          <div>
            <p className="text-xs font-bold text-slate-600 uppercase mb-2">Key Messages for Family</p>
            <ul className="space-y-2">
              {module.key_messages.map((msg, i) => (
                <li key={i} className="flex items-start gap-2 bg-blue-50 rounded-lg p-2 text-sm text-blue-900">
                  <span className="font-bold text-blue-400 min-w-[16px]">{i + 1}.</span>{msg}
                </li>
              ))}
            </ul>
          </div>
          <Alert className="bg-red-50 border-red-300 border-2">
            <AlertDescription>
              <p className="font-bold text-red-900 text-sm mb-2">🚨 Emergency Signs — Seek Immediate Help</p>
              <ul className="space-y-1">{module.emergency_signs.map((s, i) => <li key={i} className="text-xs text-red-800 flex items-start gap-2"><span>•</span>{s}</li>)}</ul>
            </AlertDescription>
          </Alert>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-xs font-bold text-green-900 mb-1 flex items-center gap-1"><Heart className="w-3 h-3" />Support Organisations</p>
            <ul className="space-y-1">{module.support_orgs.map((s, i) => <li key={i} className="text-xs text-green-800">{s}</li>)}</ul>
          </div>
        </div>
      )}
    </Card>
  );
}

export default function FamilyEducation({ isAdmin }) {
  const [showFramework, setShowFramework] = useState(false);
  return (
    <div className="space-y-4">
      <Alert className="bg-violet-50 border-violet-200">
        <Users className="w-4 h-4 text-violet-600" />
        <AlertDescription className="text-violet-800 text-xs">
          Disease-specific family education guides with key messages, emergency action plans, and support organisation contacts. Adapt language for local context and native language communication where needed.
        </AlertDescription>
      </Alert>

      {EDUCATION_MODULES.map(m => <EducationCard key={m.disease} module={m} />)}

      {/* Counselling framework */}
      <Card className="bg-white border border-slate-200 shadow-sm overflow-hidden">
        <button
          className="w-full flex items-center justify-between p-4 bg-indigo-50 hover:bg-indigo-100 transition-colors text-left"
          onClick={() => setShowFramework(!showFramework)}
        >
          <span className="font-bold text-sm text-indigo-900">Structured Counselling Framework for Rare Disease Families</span>
          {showFramework ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {showFramework && (
          <CardContent className="p-4 space-y-2">
            {COUNSELLING_FRAMEWORK.map((f, i) => (
              <div key={i} className="flex items-start gap-3 bg-slate-50 rounded-lg p-3">
                <div className="w-7 h-7 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</div>
                <div>
                  <p className="font-semibold text-sm text-indigo-900">{f.step}</p>
                  <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">{f.approach}</p>
                </div>
              </div>
            ))}
          </CardContent>
        )}
      </Card>
    </div>
  );
}