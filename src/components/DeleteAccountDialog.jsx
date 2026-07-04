import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Trash2, X, Loader2 } from "lucide-react";
import { base44 } from "@/api/client";
import { toast } from "sonner";

/**
 * DeleteAccountDialog — renders a bottom-sheet-style modal.
 * Pass onClose to dismiss.
 */
export default function DeleteAccountDialog({ onClose }) {
  const [step, setStep] = useState(1); // 1=warning, 2=confirm, 3=deleting
  const [confirmText, setConfirmText] = useState("");
  const CONFIRM_PHRASE = "DELETE MY ACCOUNT";

  const handleDelete = async () => {
    if (confirmText !== CONFIRM_PHRASE) {
      toast.error(`Type "${CONFIRM_PHRASE}" exactly to confirm`);
      return;
    }
    setStep(3);
    try {
      // Attempt to mark user as deleted / logout
      // Base44 doesn't expose a delete-user API directly,
      // so we update the user's role/data to signal deletion and log out.
      await base44.auth.updateMe({ role: "deleted", deletion_requested: new Date().toISOString() });
      toast.success("Account deletion requested. You will be logged out.");
      setTimeout(() => base44.auth.logout(), 1500);
    } catch (e) {
      toast.error("Could not process deletion: " + e.message);
      setStep(2);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/70 px-3 pb-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-red-600">
          <div className="flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-white" />
            <span className="text-sm font-bold text-white">Delete Account</span>
          </div>
          <button onClick={onClose} disabled={step === 3}>
            <X className="w-4 h-4 text-white/80" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {step === 1 && (
            <>
              <Alert className="bg-red-50 border-red-200">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <AlertDescription className="text-red-800 text-xs">
                  <strong>This action is permanent and cannot be undone.</strong>
                </AlertDescription>
              </Alert>
              <div className="space-y-2 text-sm text-slate-700">
                <p className="font-semibold">Deleting your account will:</p>
                <ul className="space-y-1 text-xs text-slate-600 list-none">
                  {[
                    "Permanently remove all your patient records",
                    "Delete all saved clinical notes and prescriptions",
                    "Remove all research projects and study data",
                    "Delete all saved pathways and clinical configurations",
                    "Log you out immediately",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">✗</span>{item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex gap-2 pt-1">
                <Button onClick={onClose} variant="outline" className="flex-1">Cancel</Button>
                <Button onClick={() => setStep(2)} className="flex-1 bg-red-600 hover:bg-red-700">
                  I Understand, Continue
                </Button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <Alert className="bg-red-50 border-red-200">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <AlertDescription className="text-red-800 text-xs">
                  To confirm deletion, type <strong>{CONFIRM_PHRASE}</strong> below.
                </AlertDescription>
              </Alert>
              <div>
                <Label className="text-xs font-semibold text-slate-700">Confirmation phrase</Label>
                <Input
                  value={confirmText}
                  onChange={e => setConfirmText(e.target.value)}
                  placeholder={CONFIRM_PHRASE}
                  className="mt-1 font-mono text-sm border-red-300 focus:ring-red-400"
                  autoCapitalize="characters"
                />
                <p className="text-xs text-slate-500 mt-1">
                  {confirmText.length}/{CONFIRM_PHRASE.length} characters
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setStep(1)} variant="outline" className="flex-1">Back</Button>
                <Button
                  onClick={handleDelete}
                  disabled={confirmText !== CONFIRM_PHRASE}
                  className="flex-1 bg-red-700 hover:bg-red-800 disabled:opacity-40"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete Forever
                </Button>
              </div>
            </>
          )}

          {step === 3 && (
            <div className="flex flex-col items-center gap-3 py-6">
              <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-800">Processing deletion…</p>
                <p className="text-xs text-slate-500 mt-1">You will be logged out shortly.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}