import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertTriangle } from "lucide-react";

const complications = [
  { name: "Hypotension", cause: "UF too fast, hypovolemia", management: "Trendelenburg, NS bolus 10 mL/kg, reduce UFR" },
  { name: "Muscle Cramps", cause: "Rapid fluid/electrolyte shifts", management: "Normal saline, reduce UFR, isotonic saline push" },
  { name: "Arrhythmia", cause: "K+ fluctuations, underlying cardiac disease", management: "ECG, check electrolytes, adjust bath K+" },
  { name: "Hemolysis", cause: "Hypotonic solution, overheated dialysate", management: "Stop dialysis, check dialysate, return blood if clear" },
  { name: "Air Embolism", cause: "Air in blood lines", management: "Clamp lines, left lateral decubitus, 100% O2" },
  { name: "Disequilibrium Syndrome", cause: "Rapid urea removal — cerebral edema", management: "Slow dialysis, mannitol, seizure management" }
];

export default function HemodialysisPathway() {
  return (
    <div className="space-y-4">
      <Alert className="bg-blue-50 border-blue-200">
        <AlertTriangle className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Pediatric Hemodialysis:</strong> Individualized prescriptions by weight and body surface area. Target Kt/V ≥1.2 per session (3× weekly).
        </AlertDescription>
      </Alert>

      {[
        { title: "HD Prescription Basics", color: "bg-blue-50 border-blue-200", items: [
          "Blood flow rate: 3–5 mL/kg/min",
          "Dialysate flow rate: 500–800 mL/min",
          "Dialysate composition: K 2.0 mEq/L standard; adjust for clinical situation",
          "Ultrafiltration: keep to ≤2.5% body weight per session when possible",
          "Session duration: 3–4 hours, 3× weekly (minimum)"
        ]},
        { title: "Adequacy Monitoring", color: "bg-green-50 border-green-200", items: [
          "Kt/V target: ≥1.2 per session (minimum), aim ≥1.4",
          "URR (urea reduction ratio): target ≥65%",
          "Monthly: Kt/V, URR, albumin, phosphate, Ca, K, PTH",
          "Kt/V calculation: single-pool (Daugirdas formula)"
        ]},
        { title: "Vascular Access", color: "bg-purple-50 border-purple-200", items: [
          "Tunneled cuffed catheter (TCC): most common in children",
          "AV fistula: preferred long-term; requires maturation 6–8 weeks",
          "AV graft: alternative if vessels too small for fistula",
          "Catheter dysfunction: fibrinolytic lock (tPA 1 mg/mL per lumen)"
        ]},
      ].map((s,i) => (
        <Card key={i} className={`border-2 ${s.color}`}>
          <CardHeader className="pb-2"><CardTitle className="text-sm">{s.title}</CardTitle></CardHeader>
          <CardContent><ul className="space-y-1">{s.items.map((item,j) => (
            <li key={j} className="flex items-start gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" /><span>{item}</span></li>
          ))}</ul></CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader><CardTitle className="text-base">Acute HD Complications Quick Reference</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="bg-slate-100">{["Complication","Cause","Management"].map(h => <th key={h} className="p-2 text-left">{h}</th>)}</tr></thead>
              <tbody>{complications.map((c,i) => (
                <tr key={i} className={i%2===0?"bg-white":"bg-slate-50"}>
                  <td className="p-2 font-semibold text-red-700">{c.name}</td>
                  <td className="p-2 text-slate-600">{c.cause}</td>
                  <td className="p-2">{c.management}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}