/**
 * LetterheadSettingsDialog — customise the clinic's prescription-form template
 * (header + footer) used on printed reports and exported PDFs.
 */
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Settings2 } from "lucide-react";
import { toast } from "sonner";
import { getLetterhead, saveLetterhead } from "@/lib/reports/letterhead";

const FIELDS = [
  { k: "clinic_name", label: "Clinic Name" },
  { k: "doctor_name", label: "Doctor Name" },
  { k: "qualifications", label: "Qualifications (e.g. MD, DM Nephrology)" },
  { k: "reg_number", label: "Registration Number" },
  { k: "address", label: "Clinic Address" },
  { k: "phone", label: "Phone" },
  { k: "email", label: "Email" },
];

export default function LetterheadSettingsDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(getLetterhead());

  const handleSave = () => {
    saveLetterhead(form);
    toast.success("Letterhead saved — applied to all printed reports and PDFs");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) setForm(getLetterhead()); }}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-8 text-slate-500">
          <Settings2 className="w-3.5 h-3.5" /> Letterhead
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">Clinic Letterhead Template</DialogTitle>
        </DialogHeader>
        <p className="text-xs text-slate-500 -mt-2">Appears as the header and footer on printed reports and exported PDFs.</p>
        <div className="space-y-3">
          {FIELDS.map((f) => (
            <div key={f.k}>
              <Label className="text-xs">{f.label}</Label>
              <Input value={form[f.k] || ""} onChange={(e) => setForm({ ...form, [f.k]: e.target.value })} className="mt-1 h-9 text-sm" />
            </div>
          ))}
          <div>
            <Label className="text-xs">Footer Note (e.g. timings, disclaimer)</Label>
            <Textarea value={form.footer_note || ""} onChange={(e) => setForm({ ...form, footer_note: e.target.value })} rows={2} className="mt-1 text-sm" />
          </div>
          <Button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-700">Save Letterhead</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}