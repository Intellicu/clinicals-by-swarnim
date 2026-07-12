import React, { useState, useMemo } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Droplet, RotateCcw, Calculator } from "lucide-react";

/**
 * Acute Peritoneal Dialysis Prescription Engine (paediatric).
 * The low-resource RRT workhorse in India. Sources: ISPD paediatric acute PD
 * guidelines (Cullis 2014/2021), IPNA. Pure frontend, offline-capable.
 */
export default function AcutePDPrescriptionEngine() {
  const [weight, setWeight] = useState("");
  const [dextrose, setDextrose] = useState("1.5");
  const [reset0, setReset0] = useState(0);

  const wt = parseFloat(weight);
  const calc = useMemo(() => {
    if (!wt || wt <= 0) return null;
    // ISPD acute PD: start low fill volume 10 mL/kg (neonate) up to 20–30 mL/kg,
    // escalate as tolerated toward 30–40 mL/kg (≈1100 mL/m²).
    const fillStart = Math.round(10 * wt);
    const fillTarget = Math.round(30 * wt);
    const fillMax = Math.round(40 * wt);
    return { fillStart, fillTarget, fillMax };
  }, [wt]);

  const doReset = () => { setWeight(""); setDextrose("1.5"); setReset0((n) => n + 1); };

  return (
    <div className="space-y-4" key={reset0}>
      <div className="rounded-xl bg-gradient-to-r from-cyan-700 to-teal-700 p-4 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Droplet className="w-5 h-5" />
          <h3 className="text-sm font-bold">Acute PD Prescription Engine</h3>
          <Badge className="bg-white/20 text-white text-xs border-white/30">ISPD Paediatric · IPNA</Badge>
        </div>
        <p className="text-xs text-cyan-100">Weight-based fill volume, cycle, and dextrose for acute peritoneal dialysis</p>
      </div>

      <Alert className="bg-cyan-50 border-cyan-200">
        <AlertDescription className="text-cyan-800 text-xs">
          Acute PD is the first-line RRT for AKI in most Indian paediatric/neonatal units — low-cost, no
          anticoagulation, no vascular access, feasible without a dialysis machine. Start with <strong>low fill
          volumes</strong> to avoid leak/respiratory compromise and escalate as tolerated.
        </AlertDescription>
      </Alert>

      <div className="rounded-xl border-2 border-slate-200 p-3 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase"><Calculator className="w-4 h-4" /> Prescription calculator</div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-semibold text-slate-600">Weight (kg)</label>
            <Input value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g. 8" className="mt-1 h-8 text-sm" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Dextrose (%)</label>
            <select value={dextrose} onChange={(e) => setDextrose(e.target.value)} className="mt-1 h-8 w-full text-sm border border-slate-200 rounded px-2 bg-white">
              {["1.5", "2.5", "4.25"].map((d) => <option key={d} value={d}>{d}%</option>)}
            </select>
          </div>
        </div>

        {calc && (
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-teal-50 rounded-lg p-2 border border-teal-200">
                <p className="text-[10px] text-teal-600 uppercase">Start fill</p>
                <p className="text-base font-bold text-teal-800">{calc.fillStart} mL</p>
                <p className="text-[9px] text-slate-500">10 mL/kg</p>
              </div>
              <div className="bg-teal-50 rounded-lg p-2 border border-teal-200">
                <p className="text-[10px] text-teal-600 uppercase">Target fill</p>
                <p className="text-base font-bold text-teal-800">{calc.fillTarget} mL</p>
                <p className="text-[9px] text-slate-500">~30 mL/kg</p>
              </div>
              <div className="bg-teal-50 rounded-lg p-2 border border-teal-200">
                <p className="text-[10px] text-teal-600 uppercase">Max fill</p>
                <p className="text-base font-bold text-teal-800">{calc.fillMax} mL</p>
                <p className="text-[9px] text-slate-500">~40 mL/kg</p>
              </div>
            </div>
            <p className="text-[10px] text-slate-500">Neonates/first cycles: begin at the low end (10 mL/kg) and escalate over 24–48h as tolerated (no leak, no respiratory distress).</p>
          </div>
        )}
        {weight && !calc && <p className="text-xs text-amber-600">Enter a valid positive weight.</p>}
      </div>

      {[
        { title: "Cycle & dwell (manual acute PD)", color: "bg-blue-50 border-blue-200", items: [
          "Cycle = fill (in ~10 min) + dwell + drain (out ~15–20 min); typical cycle 60–90 min in acute AKI",
          "Dwell 30–45 min for solute clearance; shorten for faster ultrafiltration",
          "Run continuously (hourly cycles) initially; step down as the child improves",
        ]},
        { title: "Dextrose / ultrafiltration", color: "bg-amber-50 border-amber-200", items: [
          "1.5% = gentle UF (default); 2.5% = moderate; 4.25% = maximal UF (avoid prolonged use — hyperglycaemia, peritoneal injury)",
          "Titrate dextrose to fluid-balance goal; monitor blood glucose, especially in neonates and with 4.25%",
        ]},
        { title: "Additives & monitoring", color: "bg-teal-50 border-teal-200", items: [
          "Heparin 250–500 units/L to fibrin-laden bags to keep the catheter patent (not systemic anticoagulation)",
          "Add potassium to dialysate (e.g. 3–4 mmol/L) once serum K+ normalises, to prevent hypokalaemia",
          "Track fill/drain volumes, net UF each cycle, weight, electrolytes, glucose, and signs of peritonitis (cloudy effluent → send cell count + culture, start intraperitoneal antibiotics)",
        ]},
        { title: "Cautions", color: "bg-red-50 border-red-300", items: [
          "Contraindicated/relative: recent abdominal surgery, diaphragmatic hernia, severe necrotising enterocolitis, ventriculoperitoneal shunt",
          "Watch for fluid leak, hydrothorax, respiratory compromise (reduce fill volume), and hyperglycaemia",
        ]},
      ].map((sec, i) => (
        <div key={i} className={`rounded-xl border-2 ${sec.color} p-3`}>
          <p className="text-xs font-bold text-slate-800 mb-1.5">{sec.title}</p>
          <ul className="space-y-1">{sec.items.map((it, j) => <li key={j} className="text-xs text-slate-700 flex gap-1.5"><span>•</span><span>{it}</span></li>)}</ul>
        </div>
      ))}

      <Alert className="bg-slate-50 border-slate-200"><AlertDescription className="text-[11px] text-slate-500">Sources: Cullis B et al., ISPD guidelines for peritoneal dialysis in acute kidney injury (2014, upd. 2021); IPNA. Verify against local protocol; not a substitute for specialist input.</AlertDescription></Alert>
      <Button variant="outline" className="w-full gap-1" onClick={doReset}><RotateCcw className="w-3.5 h-3.5" /> Reset</Button>
    </div>
  );
}
