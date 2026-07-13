/**
 * PDFExportButton — exports analysis results / encounter summaries as a
 * formatted, downloadable PDF (jsPDF). Sections: [{ heading, lines: [] }].
 */
import React from "react";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { toast } from "sonner";

export function generateClinicalPDF({ title, subtitle, sections = [], filename }) {
  const doc = new jsPDF();
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 15;
  let y = M;
  const ensure = (h) => { if (y + h > H - 20) { doc.addPage(); y = M; } };

  doc.setFont("helvetica", "bold").setFontSize(16).setTextColor(30, 58, 95);
  doc.text(title, M, y); y += 7;
  doc.setDrawColor(30, 58, 95).setLineWidth(0.6).line(M, y, W - M, y); y += 6;
  doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(110, 110, 110);
  doc.text(`${subtitle ? subtitle + " · " : ""}Generated ${new Date().toLocaleString()} · CliniCals Hub`, M, y); y += 8;

  sections.filter(Boolean).forEach((sec) => {
    if (sec.heading) {
      ensure(10);
      doc.setFont("helvetica", "bold").setFontSize(11).setTextColor(30, 58, 95);
      doc.text(sec.heading, M, y); y += 6;
    }
    doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(40, 40, 40);
    (sec.lines || []).forEach((line) => {
      const wrapped = doc.splitTextToSize(String(line ?? ""), W - 2 * M);
      wrapped.forEach((wl) => { ensure(5); doc.text(wl, M, y); y += 5; });
    });
    y += 3;
  });

  doc.setFontSize(8).setTextColor(130, 130, 130);
  doc.text(
    doc.splitTextToSize("Clinical decision-support only. Verify with a qualified clinician before any clinical action.", W - 2 * M),
    M, H - 12
  );
  doc.save(filename || `${title.replace(/\s+/g, "_")}.pdf`);
}

export default function PDFExportButton({ title, subtitle, sections, filename, label = "Export PDF", className = "" }) {
  const handleExport = () => {
    try {
      generateClinicalPDF({ title, subtitle, sections, filename });
      toast.success("PDF exported");
    } catch (e) {
      console.error("PDF export failed", e);
      toast.error("PDF export failed");
    }
  };
  return (
    <Button variant="outline" size="sm" className={`gap-1.5 text-xs h-8 ${className}`} onClick={handleExport}>
      <FileDown className="w-3.5 h-3.5" /> {label}
    </Button>
  );
}