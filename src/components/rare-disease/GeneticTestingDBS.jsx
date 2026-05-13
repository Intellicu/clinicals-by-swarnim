import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronDown, ChevronUp, FlaskConical, Info } from "lucide-react";

const PANELS = [
  { name: "Comprehensive Renal Gene Panel", genes: 400, indications: "SRNS, CAKUT, CKD unknown cause, hereditary nephritis", turn: "4–6 weeks", cost: "₹15,000–35,000", labs: "Medgenome, MedOmics, Strand Life Sciences" },
  { name: "Nephrotic Syndrome Panel", genes: 50, indications: "SRNS <18 yrs, especially <12 yrs", turn: "2–4 weeks", cost: "₹8,000–15,000", labs: "Medgenome, Neuberg, Lumos Genetics" },
  { name: "Tubular Disorders Panel", genes: 80, indications: "Fanconi syndrome, RTA, Bartter, Gitelman, NDI, NC", turn: "3–5 weeks", cost: "₹10,000–18,000", labs: "Strand, Mapmygenome" },
  { name: "cDNA Whole Exome Sequencing (WES)", genes: "~20,000", indications: "No diagnosis after targeted panel, syndromic features, multi-system", turn: "8–12 weeks", cost: "₹25,000–60,000", labs: "Medgenome (IndiWES), Strand" },
  { name: "PKD Panel (PKHD1/PKD1/PKD2/NPHP)", genes: 25, indications: "Cystic kidneys, ARPKD, ADPKD, nephronophthisis", turn: "3–4 weeks", cost: "₹8,000–15,000", labs: "Medgenome, Metropolis genetics" },
  { name: "Complement / aHUS Panel", genes: 15, indications: "Recurrent TMA, STEC-negative HUS", turn: "3–5 weeks", cost: "₹12,000–20,000", labs: "Medgenome, Strand — or send abroad (Ambry, Blueprint)" },
  { name: "Primary Hyperoxaluria Panel (AGXT/GRHPR/HOGA1)", genes: 3, indications: "PH1/2/3 diagnosis, stones <5 yrs, NC from infancy", turn: "2–3 weeks", cost: "₹5,000–8,000", labs: "Medgenome, Mednome" },
  { name: "Metabolic/Storage Disease Panel", genes: 60, indications: "Cystinosis, Fabry, MPS, glycogen storage with renal involvement", turn: "4–6 weeks", cost: "₹10,000–20,000", labs: "Medgenome, Strand, Progenics" },
];

const DBS_STEPS = [
  { step: 1, title: "Sample collection", detail: "5–7 blood spots on Whatman 903 filter paper (3 mm thick). Heel prick (newborn) or finger prick (older child). Allow to air dry completely 3–4 hours." },
  { step: 2, title: "Labeling and storage", detail: "Label with patient ID, date, collection time, centre. Store at room temperature in sealed dry pouch with desiccant. Avoid humidity, heat, sunlight." },
  { step: 3, title: "Shipping", detail: "Room temperature for <3 days transport. Refrigerated for longer. Do NOT freeze DBS cards. Ship via courier with biological sample declaration." },
  { step: 4, title: "Testing available from DBS", detail: "Enzyme assays: Fabry (GLA), MPS, Pompe, Gaucher. Biochemical: amino acids, organic acids, acylcarnitines (NBS). DNA: selective panels (CTNS for cystinosis, AGXT for PH)." },
  { step: 5, title: "Limitations", detail: "Lower DNA yield than fresh blood — may not suit WES. Enzyme activity may be lower than fresh sample — compare with leucocyte assay if abnormal. Not suitable for complement genetics." },
];

const COUNSELLING_POINTS = [
  "Explain autosomal recessive (25% recurrence risk), autosomal dominant (50%), X-linked (50% males) inheritance clearly using visual aids",
  "Discuss uncertainty: variant of uncertain significance (VUS) — not diagnostic, may be reclassified",
  "Prenatal diagnosis options: CVS (10–13 weeks), amniocentesis (15–18 weeks), pre-implantation genetic testing (PGT) — discuss timeline",
  "Cascade testing for at-risk relatives — prioritise reproductive-age siblings",
  "Insurance/employment discrimination risk — brief patient/family regarding genetic privacy",
  "Psychological support — grief, guilt in parents; support groups for rare diseases",
  "Registry enrollment benefits — RADAR India, ISKDC registry, disease-specific registries",
  "Return of incidental findings — discuss policy before testing",
];

function AccordionBlock({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 text-left">
        <span className="font-semibold text-sm text-slate-800">{title}</span>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {open && <div className="p-4 bg-white">{children}</div>}
    </div>
  );
}

export default function GeneticTestingDBS({ isAdmin }) {
  return (
    <div className="space-y-4">
      <Card className="bg-white border border-violet-200 shadow-sm">
        <CardHeader className="bg-violet-50 border-b py-4 px-5">
          <CardTitle className="flex items-center gap-2 text-base">
            <FlaskConical className="w-5 h-5 text-violet-600" />
            Genetic Testing Panels — India Availability
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  {["Panel", "Genes", "Indications", "Turnaround", "Approx Cost (₹)", "Indian Labs"].map(h => (
                    <th key={h} className="text-left px-3 py-2 font-semibold text-slate-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PANELS.map((p, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                    <td className="px-3 py-2 font-medium text-slate-900">{p.name}</td>
                    <td className="px-3 py-2 text-center">{p.genes}</td>
                    <td className="px-3 py-2 text-slate-600">{p.indications}</td>
                    <td className="px-3 py-2 text-slate-600">{p.turn}</td>
                    <td className="px-3 py-2 text-violet-700 font-medium">{p.cost}</td>
                    <td className="px-3 py-2 text-slate-500 italic">{p.labs}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <AccordionBlock title="Dried Blood Spot (DBS) Card — Collection & Testing Guide">
        <div className="space-y-3">
          {DBS_STEPS.map(s => (
            <div key={s.step} className="flex items-start gap-3 bg-slate-50 rounded-lg p-3">
              <div className="w-7 h-7 bg-violet-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{s.step}</div>
              <div>
                <p className="font-semibold text-sm text-slate-900">{s.title}</p>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{s.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </AccordionBlock>

      <AccordionBlock title="Genetic Counselling Points for Rare Disease Families">
        <ul className="space-y-2">
          {COUNSELLING_POINTS.map((p, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-700 bg-blue-50 rounded-lg p-3">
              <span className="text-blue-500 font-bold min-w-[20px]">{i + 1}.</span>
              {p}
            </li>
          ))}
        </ul>
      </AccordionBlock>

      <AccordionBlock title="When to Do WES vs Targeted Panel">
        <div className="space-y-2 text-sm text-slate-700">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="font-bold text-green-900 mb-1">Start with Targeted Panel when:</p>
            <ul className="text-xs space-y-1">{["Clear phenotype matches specific gene cluster (e.g., infantile NS → NS panel)","Cost is a major concern (panel 3–5× cheaper than WES)","Result needed quickly (panel turnaround: 2–4 weeks vs WES: 8–12 weeks)","Parental mutations known — targeted sequencing only"].map((t,i)=><li key={i} className="flex items-start gap-1"><span>•</span>{t}</li>)}</ul>
          </div>
          <div className="bg-violet-50 border border-violet-200 rounded-lg p-3">
            <p className="font-bold text-violet-900 mb-1">Proceed to WES when:</p>
            <ul className="text-xs space-y-1">{["Targeted panel negative but strong genetic suspicion remains","Syndromic features (multi-system) without clear diagnosis","Novel rare disease suspected (new gene discovery opportunity)","Research/registry context (family enrolled in RADAR/ISKDC)"].map((t,i)=><li key={i} className="flex items-start gap-1"><span>•</span>{t}</li>)}</ul>
          </div>
        </div>
      </AccordionBlock>

      <Alert className="bg-amber-50 border-amber-200">
        <Info className="w-4 h-4 text-amber-600" />
        <AlertDescription className="text-amber-800 text-xs">
          <strong>Financial Aid:</strong> NPRD (National Policy for Rare Diseases) provides funding up to ₹50 lakhs for diagnosis and treatment at designated CoE hospitals. PMJAY covers some rare disease investigations. Disease-specific trusts (Fabry, Cystinosis, PH foundations) may provide support for international testing when local labs unavailable.
        </AlertDescription>
      </Alert>
    </div>
  );
}