import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Network, MapPin, Info, ChevronDown, ChevronUp } from "lucide-react";

const COE_HOSPITALS = [
  { name: "AIIMS New Delhi", city: "Delhi", specialty: "Nephrology, Genetics, Metabolic", contact: "Director, Dept of Nephrology", level: "Tier 1" },
  { name: "PGIMER Chandigarh", city: "Chandigarh", specialty: "Paediatric Nephrology, Genetics", contact: "Dept of Paediatric Nephrology", level: "Tier 1" },
  { name: "JIPMER Puducherry", city: "Puducherry", specialty: "Paediatric Nephrology", contact: "Dept of Paediatrics", level: "Tier 1" },
  { name: "KEM Hospital Mumbai", city: "Mumbai", specialty: "Nephrology, Genetics", contact: "Dept of Nephrology", level: "Tier 1" },
  { name: "NIMHANS Bangalore", city: "Bangalore", specialty: "Neurogenetics, Rare Disease", contact: "Dept of Neurogenetics", level: "Tier 1" },
  { name: "SGPGIMS Lucknow", city: "Lucknow", specialty: "Nephrology, Paediatrics", contact: "Dept of Nephrology", level: "Tier 1" },
  { name: "Amrita Institute Kochi", city: "Kochi", specialty: "Paediatric Nephrology, Transplant", contact: "Dept of Paediatric Nephrology", level: "Tier 2" },
  { name: "Nizam's Institute Hyderabad", city: "Hyderabad", specialty: "Nephrology, Genetics", contact: "Dept of Nephrology", level: "Tier 2" },
  { name: "CMC Vellore", city: "Vellore", specialty: "Nephrology, Medical Genetics", contact: "Dept of Nephrology + Medical Genetics", level: "Tier 2" },
];

const NPRD_DISEASE_LIST = [
  "Lysosomal Storage Disorders (Fabry, Gaucher, Pompe, MPS types)",
  "Primary Hyperoxaluria (PH1, PH2, PH3)",
  "Cystinosis",
  "Autosomal Recessive Polycystic Kidney Disease (ARPKD)",
  "Hereditary Nephritis (Alport Syndrome)",
  "Nephronophthisis and Related Ciliopathies",
  "Atypical HUS (complement-mediated)",
  "Congenital Nephrotic Syndrome (Finnish type, genetic NS)",
  "Bartter Syndrome and Related Tubulopathies",
  "Primary Immunodeficiency with Renal Manifestations",
];

const NPRD_BENEFITS = [
  { benefit: "Diagnostic funding", detail: "Up to ₹50 lakh for genetic testing, enzyme assays, specialised investigations at designated CoE" },
  { benefit: "Treatment funding", detail: "Enzyme replacement therapy (Fabry, Gaucher, Pompe), lumasiran (PH1), eculizumab (aHUS) — subject to CoE approval" },
  { benefit: "Referral mechanism", detail: "State government identifies patient → refers to designated CoE → CoE registers and applies for funding" },
  { benefit: "Screening support", detail: "NBS expansion programme funding at state level" },
];

const HOW_TO_APPLY = [
  "Patient/family approaches treating physician at any hospital",
  "Doctor raises suspicion of NPRD-listed disease and begins diagnostic workup",
  "If confirmed or highly suspected: refer to nearest designated CoE hospital",
  "CoE registers patient in NPRD database (online portal: www.rd.mohfw.gov.in)",
  "CoE submits funding request to Ministry of Health & Family Welfare",
  "MHFW approves (typical 4–8 weeks for urgent cases)",
  "Funding disbursed directly to CoE for patient care",
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

export default function NPRDNetwork({ isAdmin }) {
  return (
    <div className="space-y-4">
      <Alert className="bg-blue-50 border-blue-300 border-2">
        <Info className="w-5 h-5 text-blue-600" />
        <AlertDescription className="text-blue-900">
          <strong className="block text-base mb-1">National Policy for Rare Diseases (NPRD) 2021</strong>
          <span className="text-sm">India's national policy provides financial assistance up to ₹50 lakh per patient for diagnosis and treatment of rare diseases at designated Centres of Excellence (CoE). Know your rights — refer patients to the nearest CoE.</span>
        </AlertDescription>
      </Alert>

      {/* CoE Hospitals */}
      <Card className="bg-white border border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-50 border-b py-4 px-5">
          <CardTitle className="flex items-center gap-2 text-sm">
            <MapPin className="w-5 h-5 text-indigo-600" /> Designated Centres of Excellence — India
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  {["Hospital", "City", "Specialties", "Referral Level"].map(h => (
                    <th key={h} className="text-left px-3 py-2 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COE_HOSPITALS.map((h, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                    <td className="px-3 py-2 font-medium text-slate-900">{h.name}</td>
                    <td className="px-3 py-2 text-slate-600">{h.city}</td>
                    <td className="px-3 py-2 text-slate-600">{h.specialty}</td>
                    <td className="px-3 py-2">
                      <Badge className={h.level === "Tier 1" ? "bg-indigo-100 text-indigo-800" : "bg-teal-100 text-teal-800"}>{h.level}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <AccordionBlock title="NPRD Disease List (Renal / Metabolic)">
        <ul className="space-y-2">
          {NPRD_DISEASE_LIST.map((d, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-700 bg-blue-50 rounded p-2">
              <span className="text-blue-500 font-bold">{i + 1}.</span> {d}
            </li>
          ))}
        </ul>
      </AccordionBlock>

      <AccordionBlock title="NPRD Benefits & Financial Support">
        <div className="space-y-2">
          {NPRD_BENEFITS.map((b, i) => (
            <div key={i} className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="font-semibold text-sm text-green-900">{b.benefit}</p>
              <p className="text-xs text-slate-700 mt-0.5">{b.detail}</p>
            </div>
          ))}
        </div>
      </AccordionBlock>

      <AccordionBlock title="How to Apply for NPRD Funding — Step by Step">
        <ol className="space-y-2">
          {HOW_TO_APPLY.map((s, i) => (
            <li key={i} className="flex items-start gap-3 bg-slate-50 rounded-lg p-3">
              <div className="w-7 h-7 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</div>
              <p className="text-sm text-slate-700">{s}</p>
            </li>
          ))}
        </ol>
        <Alert className="mt-3 bg-amber-50 border-amber-200">
          <AlertDescription className="text-xs text-amber-800">
            <strong>Key URL:</strong> www.rd.mohfw.gov.in — NPRD patient registration portal. HELPLINE: 1800-11-4477 (toll-free).
          </AlertDescription>
        </Alert>
      </AccordionBlock>

      <AccordionBlock title="International Rare Disease Networks & Resources">
        <div className="grid md:grid-cols-2 gap-3 text-xs text-slate-700">
          {[
            { name: "ERKNet (European Rare Kidney Network)", url: "erknet.org", desc: "Comprehensive rare kidney disease guidelines, patient registries, clinician training" },
            { name: "ESPN Tubulopathy Working Group", url: "espn.online", desc: "European guidelines for Bartter, dRTA, Dent, Gitelman, NDI" },
            { name: "OHF (Oxalosis & Hyperoxaluria Foundation)", url: "ohf.org", desc: "PH1/2/3 management, lumasiran access, family support" },
            { name: "Alport Syndrome Foundation", url: "alportsyndrome.org", desc: "Alport diagnosis, family registry, clinical trials" },
            { name: "RADAR India Registry", url: "rarediseaseindia.org", desc: "National rare disease patient registry" },
            { name: "ISKDC / IPNA", url: "ipna-online.org", desc: "Paediatric nephrotic syndrome registry and guidelines" },
            { name: "Global Genes", url: "globalgenes.org", desc: "Patient advocacy, research connections, rare disease resources" },
            { name: "NORD (National Organization for Rare Disorders)", url: "rarediseases.org", desc: "Rare disease database, patient support organisations" },
          ].map((r, i) => (
            <div key={i} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <p className="font-semibold text-slate-900">{r.name}</p>
              <p className="text-blue-600">{r.url}</p>
              <p className="text-slate-500 mt-1">{r.desc}</p>
            </div>
          ))}
        </div>
      </AccordionBlock>
    </div>
  );
}