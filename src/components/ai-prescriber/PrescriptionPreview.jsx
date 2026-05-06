import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, MessageCircle, FileText } from "lucide-react";
import { toast } from "sonner";
import { calcTemplateDose } from "./DoseEngine";
import { PATHWAY_TEMPLATES } from "./PathwayTemplates";

export default function PrescriptionPreview({ patientState, pathwayKey, activeDrugs }) {
  const { age, weight, height, egfr, diagnosis, bp } = patientState;
  const template = PATHWAY_TEMPLATES[pathwayKey];

  const date = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  const bsaCalc = (parseFloat(height) && parseFloat(weight))
    ? Math.sqrt((parseFloat(height) * parseFloat(weight)) / 3600).toFixed(3)
    : null;

  const buildText = () => {
    const drugLines = activeDrugs.map((drug, i) => {
      const dose = calcTemplateDose(drug, parseFloat(weight), parseFloat(bsaCalc), parseFloat(egfr));
      return `${i + 1}. ${drug.name}
   Dose: ${dose.perDose}  |  Frequency: ${drug.frequency}  |  Route: ${drug.route}
   Duration: ${drug.duration}
   ${drug.monitoring ? `Monitor: ${drug.monitoring}` : ""}
   ${dose.capped ? `⚠️ Capped at max dose` : ""}`;
    }).join("\n\n");

    return `PEDIATRIC NEPHROLOGY PRESCRIPTION
═══════════════════════════════════════════
${template ? `Protocol: ${template.label}` : ""}
Date: ${date}

Patient Details:
Age: ${age || "—"} years  |  Weight: ${weight || "—"} kg  |  Height: ${height || "—"} cm
BSA: ${bsaCalc || "—"} m²  |  eGFR: ${egfr || "—"} mL/min/1.73m²
BP: ${bp || "—"}  |  Diagnosis: ${diagnosis || "—"}

Rx
───────────────────────────────────────────
${drugLines || "No drugs selected"}

───────────────────────────────────────────
${template?.monitoring?.length ? `Monitoring:\n${template.monitoring.map(m => `• ${m}`).join("\n")}` : ""}

${template?.supportive?.length ? `Supportive:\n${template.supportive.map(s => `• ${s}`).join("\n")}` : ""}

${template?.avoid?.length ? `Avoid: ${template.avoid.join(", ")}` : ""}

Follow-up: ${template?.follow_up || "—"}
Reference: ${template?.reference || "CliniCals by Swarnim"}

Prescriber: _________________________   Date: ${date}
─────────────────────────────────────────
CliniCals by Swarnim | Verify all calculations independently`;
  };

  const printRx = () => {
    const win = window.open("", "_blank");
    win.document.write(`<html><head><title>Prescription</title>
    <style>body{font-family:'Courier New',monospace;padding:24px;max-width:700px;margin:auto;font-size:11px}pre{white-space:pre-wrap}</style>
    </head><body><pre>${buildText()}</pre></body></html>`);
    win.print();
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap">
        <Button onClick={printRx} className="bg-indigo-600 hover:bg-indigo-700 text-white flex-1">
          <Printer className="w-4 h-4 mr-2" /> Print
        </Button>
        <Button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(buildText().slice(0, 2000))}`, "_blank")}
          className="bg-green-600 hover:bg-green-700 text-white flex-1">
          <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
        </Button>
        <Button onClick={() => { navigator.clipboard.writeText(buildText()); toast.success("Copied!"); }}
          variant="outline" className="flex-1">
          <FileText className="w-4 h-4 mr-2" /> Copy
        </Button>
      </div>

      <Card className="bg-slate-900 shadow-lg border-0">
        <CardHeader className="py-2 px-4 border-b border-slate-700">
          <CardTitle className="text-xs text-slate-400">Prescription Preview</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap leading-relaxed">{buildText()}</pre>
        </CardContent>
      </Card>
    </div>
  );
}