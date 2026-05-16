import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Pencil, X, Save, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/**
 * Lightweight admin-only inline edit button.
 * Usage: <AdminEditButton label="Edit Section" content={text} onSave={fn} />
 * Only renders for admin users. Non-admins see nothing.
 */
export default function AdminEditButton({ label = "Edit", content = "", onSave, className = "" }) {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 60000,
  });

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(content);
  const [saving, setSaving] = useState(false);

  if (user?.role !== "admin") return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave?.(draft);
      toast.success("Saved successfully");
      setOpen(false);
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`inline-block ${className}`}>
      {!open ? (
        <button
          onClick={() => { setDraft(content); setOpen(true); }}
          className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full hover:bg-amber-100 transition-colors font-medium"
          title="Admin: Edit this section"
        >
          <Pencil className="w-3 h-3" />
          {label}
        </button>
      ) : (
        <div className="mt-2 bg-amber-50 border-2 border-amber-300 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700">Admin Edit — {label}</span>
            <button onClick={() => setOpen(false)} className="text-amber-500 hover:text-amber-700">
              <X className="w-4 h-4" />
            </button>
          </div>
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            className="w-full min-h-[120px] p-2 text-xs border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white resize-y font-mono"
            placeholder="Edit content…"
          />
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="outline" onClick={() => setOpen(false)} className="text-xs h-7">Cancel</Button>
            <Button size="sm" onClick={handleSave} disabled={saving} className="text-xs h-7 bg-amber-600 hover:bg-amber-700 text-white">
              {saving ? <CheckCircle className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}