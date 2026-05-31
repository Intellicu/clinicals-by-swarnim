import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertTriangle, ArrowRight, ArrowDown } from "lucide-react";

const TABS = ["Decision Algorithm", "Diagnosis", "Induction", "PLEX Criteria", "Maintenance"];

export default function ANCAbVasculitisPathway() {
  const [tab, setTab] = useState(0);

  return (
    <div className="space-y-4">
      <Alert className="bg-red-50 border-red-200">
        <AlertTriangle className="w-4 h-4 text-red-600" />
        <AlertDescription className="text-red-800 text-xs">
          <strong>ANCA-Associated Vasculitis (AAV):</strong> GPA (PR3/c-ANCA) + MPA (MPO/p-ANCA). RPGN + pulmonary haemorrhage = nephrology + pulmonology emergency. Biopsy urgently.
        </AlertDescription>
      </Alert>

      <div className="flex flex-wrap gap-1.5">
        {TABS.map((t, i) => (
          <button key={i} onClick={() => setTab(i)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${tab === i ? "bg-red-700 text-white border-red-700" : "bg-white border-slate-200 text-slate-600 hover:border-red-300"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 0 && (
        <div className="space-y-2">
          <div className="rounded-xl bg-gradient-to-r from-red-800 to-rose-700 p-4 text-white">
            <h3 className="text-sm font-bold">ANCA Vasculitis Decision Algorithm</h3>
            <p className="text-xs text-red-100">RPGN · Pulmonary Haemorrhage · Biopsy · PLEX decision</p>
          </div>
          {[
            { node: "AKI + Haematuria (RBC casts / dysmorphic RBCs)", color: "bg-blue-50 border-blue-300" },
            { node: "↓ ANCA Serology: c-ANCA (PR3) → GPA | p-ANCA (MPO) → MPA/EGPA", color: "bg-slate-50 border-slate-200", arrow: true },
            { node: "Pulmonary haemorrhage? → HRCT chest urgently + SpO2 monitoring", color: "bg-red-50 border-red-300", arrow: true },
            { node: "Rapid eGFR decline (<50% in 3 months) or Creatinine >300 µmol/L? → Plan PLEX", color: "bg-orange-50 border-orange-300", arrow: true },
            { node: "RENAL BIOPSY: % crescents (defines severity) + pauci-immune IF pattern", color: "bg-amber-50 border-amber-300", arrow: true },
            { node: "Induction choice: <50% crescents → Rituximab OR CYC + steroids | >50% or DAH → CYC preferred", color: "bg-green-50 border-green-300", arrow: true },
            { node: "PLEX indication: Cr >500 µmol/L OR dialysis-dependent OR diffuse alveolar haemorrhage", color: "bg-purple-50 border-purple-300", arrow: true },
            { node: "Remission (no active disease) → Maintenance: RTX 500mg Q6months OR Azathioprine × 24 months", color: "bg-teal-50 border-teal-300", arrow: true },
          ].map((n, i) => (
            <div key={i}>
              {n.arrow && <div className="flex justify-center"><ArrowDown className="w-4 h-4 text-slate-400" /></div>}
              <div className={`rounded-xl border-2 p-3 ${n.color}`}>
                <p className="text-xs font-semibold text-slate-800">{n.node}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 1 && (
        <div className="space-y-2">
          {[
            "ANCA serology: c-ANCA / PR3-ANCA = GPA (Granulomatosis with Polyangiitis)",
            "p-ANCA / MPO-ANCA = MPA (Microscopic Polyangiitis) or EGPA",
            "Renal biopsy: pauci-immune crescentic GN (no/few immune deposits on IF) — defines % crescents",
            "Pulmonary: HRCT chest (ground-glass = DAH, nodules with cavitation = GPA)",
            "Urine microscopy: dysmorphic RBCs, RBC casts, proteinuria",
            "Upper airway (GPA): sinusitis, saddle-nose deformity, subglottic stenosis — nasal biopsy",
            "Baseline: ANCA titre, C3, C4, anti-GBM (overlap 5–10%), ANA, eGFR, UPCR",
            "RPGN panel: ANCA + anti-GBM + ANA + C3/C4 — all 3 in one urgent request",
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2 p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
              <ArrowRight className="w-3 h-3 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-800">{item}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 2 && (
        <div className="space-y-3">
          {[
            { title: "Pulse Steroids (start immediately)", color: "bg-red-50 border-red-200", items: [
              "IV methylprednisolone 500–1000 mg (paediatric: 30 mg/kg, max 1 g/day) × 3 days",
              "Then oral prednisolone 1 mg/kg/day (max 60 mg) — taper over 6 months",
              "Do not wait for biopsy result before starting steroids if RPGN present",
            ]},
            { title: "Rituximab (preferred for GPA, non-severe)", color: "bg-violet-50 border-violet-200", items: [
              "375 mg/m² weekly × 4 doses (adults: 375 mg/m² × 4 or 1g × 2 doses 2 weeks apart)",
              "Non-inferior to CYC in RITUXVAS trial; better toxicity profile (less gonadotoxicity)",
              "Preferred: GPA, PR3-ANCA, reproductive age, relapsing disease",
              "India: Rituximab (Ristova, Rituget): ~₹15,000–20,000/dose; check institutional formulary",
            ]},
            { title: "Cyclophosphamide IV (preferred for severe disease)", color: "bg-orange-50 border-orange-200", items: [
              "IV CYC 15 mg/kg/dose (max 1.2g) every 2–3 weeks × 6 pulses",
              "OR oral CYC 2–3 mg/kg/day × 3 months (higher toxicity)",
              "Preferred if: dialysis-dependent, >50% crescents, severe pulmonary haemorrhage",
              "Mesna co-prescribe (IV CYC): haemorrhagic cystitis prevention",
              "Monitor: CBC weekly, urine (haematuria from cystitis)",
            ]},
          ].map((s, i) => (
            <Card key={i} className={`border-2 ${s.color}`}>
              <CardHeader className="pb-2 pt-3 px-3"><CardTitle className="text-xs">{s.title}</CardTitle></CardHeader>
              <CardContent className="px-3 pb-3">
                {s.items.map((item, j) => (
                  <div key={j} className="flex items-start gap-2 text-xs text-slate-800 mb-1">
                    <CheckCircle2 className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />{item}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {tab === 3 && (
        <div className="space-y-2">
          <div className="bg-orange-50 border-2 border-orange-300 rounded-xl p-3">
            <p className="text-xs font-bold text-orange-800 mb-1">PLEX Indication Checklist (any ONE = consider PLEX):</p>
            {[
              "Serum creatinine >500 µmol/L (or >5.6 mg/dL) at presentation",
              "Dialysis-dependent at presentation",
              "Diffuse alveolar haemorrhage (DAH) — life-threatening",
              "Anti-GBM antibody POSITIVE overlap (always PLEX)",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-orange-900 mb-0.5">
                <CheckCircle2 className="w-3 h-3 text-orange-600 flex-shrink-0 mt-0.5" />{item}
              </div>
            ))}
          </div>
          {[
            "PEXIVAS trial (2020): PLEX did NOT reduce composite endpoint of ESKD/death at 7 sessions vs sham — controversial",
            "Many centres still recommend PLEX for DAH + dialysis-dependent (especially anti-GBM overlap)",
            "If PLEX: 7 sessions over 14 days (1 plasma volume with albumin/FFP replacement)",
            "EVIDENCE GRADE 2C (KDIGO) — shared decision with family after discussion of PEXIVAS",
            "Anti-GBM overlap: ALWAYS do PLEX (linear IgG on IF — PLEX mandatory)",
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              <ArrowRight className="w-3 h-3 text-slate-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-800">{item}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 4 && (
        <div className="space-y-2">
          {[
            "Azathioprine 2 mg/kg/day × 24 months (start after induction complete, Cr stable)",
            "OR Rituximab 500 mg IV every 6 months × 2 years (MAINRITSAN trial: superior to Aza for relapse prevention)",
            "Low-dose prednisolone: taper to ≤7.5 mg/day by 6 months, aim off by 12–18 months",
            "Monitor ANCA titre (PR3-ANCA more predictive of relapse than MPO-ANCA)",
            "Urinalysis every 3 months — microscopic haematuria recurrence = early relapse marker",
            "Relapse: repeat induction (rituximab preferred for relapsing PR3-ANCA GPA)",
            "eGFR + UPCR + ANCA every 3 months for 2 years, then 6-monthly if stable",
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2 p-2.5 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle2 className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-800">{item}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}