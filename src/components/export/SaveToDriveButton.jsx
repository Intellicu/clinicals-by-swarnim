/**
 * SaveToDriveButton — generates the report PDF and saves it directly to the
 * clinic's Google Drive ("CliniCals Reports" folder).
 */
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CloudUpload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { generateClinicalPDF } from "@/components/export/PDFExportButton";

export default function SaveToDriveButton({ title, subtitle, sections, filename }) {
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const blob = generateClinicalPDF({ title, subtitle, sections, returnBlob: true });
      const buf = await blob.arrayBuffer();
      let binary = "";
      const bytes = new Uint8Array(buf);
      const chunk = 8192;
      for (let i = 0; i < bytes.length; i += chunk) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
      }
      const res = await base44.functions.invoke("saveReportToDrive", {
        filename: filename || `${title.replace(/\s+/g, "_")}.pdf`,
        pdf_base64: btoa(binary),
      });
      const link = res.data?.web_view_link;
      toast.success("Saved to Google Drive", {
        action: link ? { label: "Open", onClick: () => window.open(link, "_blank") } : undefined,
      });
    } catch (e) {
      console.error("Drive save failed", e);
      toast.error("Could not save to Google Drive");
    }
    setSaving(false);
  };

  return (
    <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={handleSave} disabled={saving}>
      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CloudUpload className="w-3.5 h-3.5" />}
      {saving ? "Saving…" : "Save to Drive"}
    </Button>
  );
}