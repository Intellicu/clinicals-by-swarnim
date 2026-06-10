import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Flag, X, Loader2, CheckCircle2, Upload, ChevronDown } from "lucide-react";
import { toast } from "sonner";

const REPORT_TYPES = [
  "Correction",
  "Modification Request",
  "Content Error",
  "Missing Information",
  "Drug Dose Issue",
  "Other",
];

export default function FeedbackReportButton({ pageName, sectionText = "" }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState("form"); // "form" | "done"
  const [loading, setLoading] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [form, setForm] = useState({
    report_type: "Correction",
    description: "",
    section_text: sectionText,
    suggested_correction: "",
    priority: "Medium",
    screenshot_url: "",
  });

  const { data: user } = useQuery({ queryKey: ["me"], queryFn: () => base44.auth.me() });

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImg(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm((f) => ({ ...f, screenshot_url: file_url }));
      toast.success("Screenshot uploaded");
    } catch {
      toast.error("Failed to upload screenshot");
    } finally {
      setUploadingImg(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.description.trim()) return;
    setLoading(true);
    try {
      // Save to DB
      await base44.entities.FeedbackReport.create({
        ...form,
        page_name: pageName || window.location.pathname,
        submitted_by_email: user?.email || "anonymous",
        status: "Open",
      });

      // Email admins
      await base44.integrations.Core.SendEmail({
        to: "admin@clinicalshub.com",
        subject: `[CliniCals Feedback] ${form.report_type} on ${pageName || window.location.pathname}`,
        body: `
<h2>New Feedback Report</h2>
<table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
  <tr><td style="padding:6px 12px;font-weight:bold;color:#374151">Page</td><td style="padding:6px 12px">${pageName || window.location.pathname}</td></tr>
  <tr style="background:#f9fafb"><td style="padding:6px 12px;font-weight:bold;color:#374151">Type</td><td style="padding:6px 12px">${form.report_type}</td></tr>
  <tr><td style="padding:6px 12px;font-weight:bold;color:#374151">Priority</td><td style="padding:6px 12px">${form.priority}</td></tr>
  <tr style="background:#f9fafb"><td style="padding:6px 12px;font-weight:bold;color:#374151">Submitted by</td><td style="padding:6px 12px">${user?.email || "anonymous"}</td></tr>
  <tr><td style="padding:6px 12px;font-weight:bold;color:#374151">Description</td><td style="padding:6px 12px">${form.description}</td></tr>
  ${form.section_text ? `<tr style="background:#f9fafb"><td style="padding:6px 12px;font-weight:bold;color:#374151">Flagged section</td><td style="padding:6px 12px">${form.section_text}</td></tr>` : ""}
  ${form.suggested_correction ? `<tr><td style="padding:6px 12px;font-weight:bold;color:#374151">Suggested correction</td><td style="padding:6px 12px">${form.suggested_correction}</td></tr>` : ""}
  ${form.screenshot_url ? `<tr style="background:#f9fafb"><td style="padding:6px 12px;font-weight:bold;color:#374151">Screenshot</td><td style="padding:6px 12px"><a href="${form.screenshot_url}">View screenshot</a></td></tr>` : ""}
</table>
<br/><p style="color:#6b7280;font-size:12px">CliniCals Hub — User Feedback System</p>
        `,
      });

      setStep("done");
    } catch {
      toast.error("Failed to submit report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setOpen(false);
    setStep("form");
    setForm({ report_type: "Correction", description: "", section_text: sectionText, suggested_correction: "", priority: "Medium", screenshot_url: "" });
  };

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-orange-600 bg-orange-50 border border-orange-200 hover:bg-orange-100 transition-colors"
        title="Report an issue or suggest a correction"
      >
        <Flag className="w-3.5 h-3.5" />
        <span>Report / Suggest</span>
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={reset} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto z-10">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 sticky top-0 bg-white rounded-t-2xl">
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-orange-500" />
                <h3 className="font-bold text-slate-900 text-sm">Report an Issue / Suggest Correction</h3>
              </div>
              <button onClick={reset} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5">
              {step === "done" ? (
                <div className="text-center py-6">
                  <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <h4 className="font-bold text-slate-800 mb-1">Thank you!</h4>
                  <p className="text-sm text-slate-500 mb-4">Your feedback has been submitted and the admin team will review it shortly.</p>
                  <Button onClick={reset} variant="outline" size="sm">Close</Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Page context */}
                  <div className="bg-slate-50 rounded-lg px-3 py-2 text-xs text-slate-500 flex items-center gap-1.5">
                    <span className="font-semibold text-slate-600">Page:</span>
                    <span>{pageName || window.location.pathname}</span>
                  </div>

                  {/* Report type */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Report Type *</label>
                    <div className="relative">
                      <select
                        value={form.report_type}
                        onChange={(e) => setForm((f) => ({ ...f, report_type: e.target.value }))}
                        className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white appearance-none"
                      >
                        {REPORT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1.5">Priority</label>
                    <div className="flex gap-2">
                      {["Low", "Medium", "High", "Critical"].map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, priority: p }))}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                            form.priority === p
                              ? p === "Critical" ? "bg-red-600 text-white border-red-600"
                                : p === "High" ? "bg-orange-500 text-white border-orange-500"
                                : p === "Medium" ? "bg-amber-400 text-white border-amber-400"
                                : "bg-slate-500 text-white border-slate-500"
                              : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Flagged section */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Specific Section or Text (optional)</label>
                    <textarea
                      value={form.section_text}
                      onChange={(e) => setForm((f) => ({ ...f, section_text: e.target.value }))}
                      placeholder="Paste or describe the specific section you are flagging…"
                      className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none h-16"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Description of Issue *</label>
                    <textarea
                      required
                      value={form.description}
                      onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                      placeholder="Describe the issue, error, or what needs to be changed…"
                      className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none h-24"
                    />
                  </div>

                  {/* Suggested correction */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Suggested Correction (optional)</label>
                    <textarea
                      value={form.suggested_correction}
                      onChange={(e) => setForm((f) => ({ ...f, suggested_correction: e.target.value }))}
                      placeholder="What should the correct information be?"
                      className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none h-16"
                    />
                  </div>

                  {/* Screenshot upload */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Screenshot (optional)</label>
                    {form.screenshot_url ? (
                      <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-xs text-green-700 flex-1">Screenshot attached</span>
                        <button type="button" onClick={() => setForm((f) => ({ ...f, screenshot_url: "" }))}
                          className="text-slate-400 hover:text-slate-600"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center gap-2 px-3 py-3 border-2 border-dashed border-slate-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 cursor-pointer transition-colors">
                        {uploadingImg ? <Loader2 className="w-4 h-4 animate-spin text-orange-500" /> : <Upload className="w-4 h-4 text-slate-400" />}
                        <span className="text-xs text-slate-500">{uploadingImg ? "Uploading…" : "Tap to upload screenshot"}</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImg} />
                      </label>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    <Button type="button" variant="outline" onClick={reset} className="flex-1" size="sm">Cancel</Button>
                    <Button type="submit" disabled={loading || !form.description.trim()} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white" size="sm">
                      {loading ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />Submitting…</> : "Submit Report"}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}