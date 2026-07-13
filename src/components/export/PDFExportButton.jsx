/**
 * PDFExportButton — exports analysis results / encounter summaries as a
 * formatted, downloadable PDF (jsPDF) with the clinic's letterhead template
 * applied as header and footer. Sections: [{ heading, lines: [] }].
 */
import React from "react";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { toast } from "sonner";
import { getLetterhead } from "@/lib/reports/letterhead";

export function generateClinicalPDF({ title, subtitle, sections = [], filename, returnBlob = false }) {
  const lh = getLetterhead();
  const doc = new jsPDF();
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 15;
  let y = M;
  const ensure = (h) => { if (y + h > H - 24) { doc.addPage(); y = M; } };

  // ── Clinic letterhead header ──
  if (lh.clinic_name || lh.doctor_name) {
    if (lh.clinic_name) {
      doc.setFont("helvetica", "bold").setFontSize(16).setTextColor(30, 58, 95);
      doc.text(lh.clinic_name, W / 2, y, { align: "center" }); y += 6;
    }
    if (lh.doctor_name) {
      doc.setFont("helvetica", "bold").setFontSize(10).setTextColor(50, 50, 50);
      doc.text(`${lh.doctor_name}${lh.qualifications ? ", " + lh.qualifications : ""}${lh.reg_number ? " · Reg. No. " + lh.reg_number : ""}`, W / 2, y, { align: "center" }); y += 5;
    }
    const contact = [lh.address, lh.phone, lh.email].filter(Boolean).join(" · ");
    if (contact) {
      doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(110, 110, 110);
      doc.text(doc.splitTextToSize(contact, W - 2 * M), W / 2, y, { align: "center" }); y += 5;
    }
    doc.setDrawColor(30, 58, 95).setLineWidth(0.8).line(M, y, W - M, y);
    doc.setLineWidth(0.3).line(M, y + 1, W - M, y + 1);
    y += 7;
  }

  // ── Report title ──
  doc.setFont("helvetica", "bold").setFontSize(13).setTextColor(30, 58, 95);
  doc.text(title, M, y); y += 6;
  doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(110, 110, 110);
  doc.text(`${subtitle ? subtitle + " · " : ""}Generated ${new Date().toLocaleString()}`, M, y); y += 8;

  // ── Sections ──
  sections.filter(Boolean).forEach((sec) => {
    if (sec.heading) {
      ensure(10);
      doc.setFont("helvetica", "bold").setFontSize(11).setTextColor(30, 58, 95);
      doc.text(sec.heading, M, y); y += 2;
      doc.setDrawColor(59, 130, 246).setLineWidth(0.5).line(M, y, M + 40, y); y += 5;
    }
    doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(40, 40, 40);
    (sec.lines || []).forEach((line) => {
      const wrapped = doc.splitTextToSize(String(line ?? ""), W - 2 * M);
      wrapped.forEach((wl) => { ensure(5); doc.text(wl, M, y); y += 5; });
    });
    y += 4;
  });

  // ── Footer on every page ──
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setDrawColor(200, 200, 200).setLineWidth(0.3).line(M, H - 18, W - M, H - 18);
    doc.setFont("helvetica", "normal").setFontSize(7.5).setTextColor(130, 130, 130);
    const footerLines = [
      ...(lh.footer_note ? [lh.footer_note] : []),
      "Clinical decision-support only. Verify with a qualified clinician before any clinical action.",
    ];
    doc.text(doc.splitTextToSize(footerLines.join("  ·  "), W - 2 * M - 25), M, H - 13);
    doc.text(`Page ${p} of ${pages}`, W - M, H - 13, { align: "right" });
  }

  if (returnBlob) return doc.output("blob");
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