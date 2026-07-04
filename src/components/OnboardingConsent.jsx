import React, { useState, useEffect } from "react";
import { base44 } from "@/api/client";
import { Button } from "@/components/ui/button";
import { ShieldAlert, CheckSquare, Square } from "lucide-react";

export default function OnboardingConsent({ onComplete }) {
  const [agreed, setAgreed] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleAgree = async () => {
    if (!agreed) return;
    setSaving(true);
    try {
      await base44.auth.updateMe({
        beta_consent_given: true,
        beta_consent_at: new Date().toISOString(),
      });
    } catch {
      // Non-fatal — still allow through
    }
    setSaving(false);
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-base">CliniCals Hub — Beta Programme</h2>
              <p className="text-amber-100 text-xs">Please read before continuing</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <p className="text-sm font-semibold text-slate-900">Beta Clinical Intelligence Tool — Important Notice</p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2 text-sm text-slate-700 leading-relaxed">
            <p>
              CliniCals Hub is a <strong>beta clinical-intelligence and decision-support platform</strong> currently
              under active development. It is intended to assist — not replace — professional clinical judgment,
              institutional protocols, and specialist consultation.
            </p>
            <p>
              AI-generated outputs, pathways, calculators, and drug dosing tools are provided for
              <strong> educational and decision-support purposes only</strong>. They may contain errors or
              omissions. Always verify drug doses and recommendations independently against your
              <strong> institutional protocol and current formulary</strong>.
            </p>
            <p>
              This platform does not constitute medical advice. Patient care decisions remain the sole
              responsibility of the treating clinician.
            </p>
          </div>

          <button
            onClick={() => setAgreed(v => !v)}
            className="flex items-start gap-3 w-full text-left group mt-2"
          >
            <div className={`mt-0.5 flex-shrink-0 transition-colors ${agreed ? "text-orange-600" : "text-slate-300"}`}>
              {agreed ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
            </div>
            <span className="text-sm text-slate-800 font-medium leading-relaxed">
              I understand and agree — I will exercise independent clinical judgment and verify all outputs
              against my institutional protocol.
            </span>
          </button>
        </div>

        <div className="px-6 pb-6">
          <Button
            onClick={handleAgree}
            disabled={!agreed || saving}
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-40 text-white font-semibold h-11"
          >
            {saving ? "Saving…" : "Continue to CliniCals Hub"}
          </Button>
          <p className="text-center text-xs text-slate-400 mt-2">
            This notice is shown once. You can review it at any time in Settings.
          </p>
        </div>
      </div>
    </div>
  );
}