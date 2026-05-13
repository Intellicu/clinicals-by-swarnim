import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Database, Info } from "lucide-react";

const REGISTRIES = [
  { name: "RADAR India (Rare Diseases Registry)", disease: "All rare diseases", url: "rarediseaseindia.org", type: "National", open: true, notes: "India's national rare disease registry. Mandatory enrollment for NPRD funding. Free registration." },
  { name: "ISKDC Nephrotic Syndrome Registry", disease: "Nephrotic syndrome", url: "iskdc.org", type: "International", open: true, notes: "International Study of Kidney Disease in Children. Multi-centre data collection. Paediatric nephrology." },
  { name: "IPNA Paediatric NS Registry", disease: "SRNS, FRNS, genetic NS", url: "ipna-online.org", type: "International", open: true, notes: "International Paediatric Nephrology Association. Collaborative research." },
  { name: "ERKNet Rare Kidney Registry", disease: "All rare kidney diseases", url: "erknet.org", type: "European", open: true, notes: "European Rare Kidney Disease network. Comprehensive registries for aHUS, ARPKD, Alport, tubulopathies." },
  { name: "aHUS Global Registry", disease: "aHUS", url: "ahus-registry.com", type: "Global", open: true, notes: "Alexion/AstraZeneca supported registry. Eculizumab outcomes data." },
  { name: "OHF PH Registry", disease: "Primary Hyperoxaluria", url: "ohf.org/registry", type: "Global", open: true, notes: "Oxalosis and Hyperoxaluria Foundation. PH1/2/3 outcomes, treatment registry." },
  { name: "EFACTS (Fabry Registry)", disease: "Fabry disease", url: "fabry-registry.com", type: "Global", open: true, notes: "European Fabry disease registry. Long-term ERT/Migalastat outcomes." },
  { name: "ESPN/ERA Rare Disease Registry", disease: "ARPKD, Alport, NPHP", url: "era-online.org", type: "European", open: true, notes: "European Renal Association registry linked to ESPN." },
];

const RESEARCH_GAPS = [
  "Long-term outcomes of lumasiran (siRNA) in PH1 in Indian population",
  "Prevalence of complement mutations in Indian aHUS cohort (CFH hotspots in Indian families)",
  "Genotype-phenotype correlation for NPHS1/NPHS2 mutations in South Asian children",
  "Cost-effectiveness of WES vs targeted panel for SRNS in resource-limited settings",
  "ARPKD neonatal pulmonary outcomes and ventilatory strategies",
  "Eculizumab access and outcomes under NPRD funding scheme",
  "Prevalence of CTNS 57 kb deletion vs non-European mutations in Indian cystinosis",
  "Nephronophthisis spectrum in Indian children — molecular epidemiology",
];

const TRIAL_RESOURCES = [
  { trial: "ILLUMINATE-A/B (Lumasiran in PH1)", status: "Published", phase: "Phase 3", result: "64% reduction in urine oxalate. FDA/EMA approved. NPRD inclusion pending.", ref: "Garrelfs SF NEJM 2021" },
  { trial: "ATTACK (Eculizumab in aHUS)", status: "Published", phase: "Phase 2", result: "TMA resolution in 88% at 26 weeks. Foundation for eculizumab approval.", ref: "Legendre CM NEJM 2013" },
  { trial: "REGENCY (Iptacopan in aHUS)", status: "Active 2024", phase: "Phase 3", result: "Oral factor B inhibitor. Monthly oral vs biweekly IV eculizumab.", ref: "NCT04889430" },
  { trial: "ALPORT-001 (Bardoxolone in Alport)", status: "Active 2024", phase: "Phase 3", result: "Nrf2 activator for eGFR stabilization in Alport syndrome.", ref: "NCT03019185" },
  { trial: "CVRD-1 (Sparsentan in FSGS/IgAN)", status: "Published 2023", phase: "Phase 3", result: "Dual AT1/endothelin antagonist — significant proteinuria reduction.", ref: "Tumlin JA NEJM 2023" },
];

export default function RegistryResearch({ isAdmin }) {
  return (
    <div className="space-y-4">
      <Alert className="bg-violet-50 border-violet-200">
        <Database className="w-4 h-4 text-violet-600" />
        <AlertDescription className="text-violet-800 text-xs">
          <strong>Registry Enrollment:</strong> Every rare disease patient should be enrolled in at least one relevant registry. Data contributes to natural history studies, drives drug access decisions, and supports NPRD funding applications.
        </AlertDescription>
      </Alert>

      {/* Registries */}
      <Card className="bg-white border border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-50 border-b py-3 px-5">
          <CardTitle className="text-sm">Rare Kidney Disease Registries</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  {["Registry", "Disease Focus", "Type", "URL / Access", "Notes"].map(h => (
                    <th key={h} className="text-left px-3 py-2 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {REGISTRIES.map((r, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                    <td className="px-3 py-2 font-medium text-slate-900">{r.name}</td>
                    <td className="px-3 py-2 text-slate-600">{r.disease}</td>
                    <td className="px-3 py-2"><Badge className="bg-violet-100 text-violet-800 text-xs">{r.type}</Badge></td>
                    <td className="px-3 py-2 text-blue-600">{r.url}</td>
                    <td className="px-3 py-2 text-slate-500 italic">{r.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Research gaps */}
      <Card className="bg-white border border-slate-200 shadow-sm">
        <CardHeader className="bg-indigo-50 border-b py-3 px-5">
          <CardTitle className="text-sm text-indigo-900">Priority Research Gaps — India</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <ul className="space-y-2">
            {RESEARCH_GAPS.map((g, i) => (
              <li key={i} className="flex items-start gap-2 bg-indigo-50 rounded-lg p-2 text-xs text-indigo-800">
                <span className="font-bold min-w-[20px]">{i + 1}.</span>{g}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Clinical trials */}
      <Card className="bg-white border border-slate-200 shadow-sm">
        <CardHeader className="bg-green-50 border-b py-3 px-5">
          <CardTitle className="text-sm text-green-900">Key Clinical Trials — Rare Renal Disease</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          {TRIAL_RESOURCES.map((t, i) => (
            <div key={i} className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="font-semibold text-sm text-green-900">{t.trial}</p>
                <div className="flex gap-1">
                  <Badge className={`text-xs ${t.status.includes("Active") ? "bg-blue-100 text-blue-800" : "bg-green-200 text-green-800"}`}>{t.status}</Badge>
                  <Badge className="bg-slate-100 text-slate-700 text-xs">{t.phase}</Badge>
                </div>
              </div>
              <p className="text-xs text-slate-700">{t.result}</p>
              <p className="text-xs text-slate-400 italic mt-1">{t.ref}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}