import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Stethoscope, CheckSquare, Square, ArrowRight } from "lucide-react";

const CONSENT_VERSION = "v1.0";
const STORAGE_KEY = "clinicals_consent_accepted";

export function hasCompletedConsent() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return false;
    const parsed = JSON.parse(stored);
    return parsed?.accepted === true && parsed?.version === CONSENT_VERSION;
  } catch {
    return false;
  }
}

export default function OnboardingConsent({ onComplete }) {
  const [consentAccepted, setConsentAccepted] = useState(true);
  const [summarySubscribed, setSummarySubscribed] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleContinue = async () => {
    if (!consentAccepted) {
      setError("Please acknowledge the notice to continue.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const now = new Date().toISOString();
      // Persist consent to user preferences
      const user = await base44.auth.me();
      if (user?.email) {
        const existing = await base44.entities.UserPreferences.filter({ user_email: user.email });
        const payload = {
          user_email: user.email,
          consentAccepted: true,
          consentVersion: CONSENT_VERSION,
          consentDate: now,
          dailySummarySubscribed: summarySubscribed,
        };
        if (existing.length > 0) {
          await base44.entities.UserPreferences.update(existing[0].id, payload);
        } else {
          await base44.entities.UserPreferences.create(payload);
        }
      }
      // Mark locally so we don't show again
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        accepted: true,
        version: CONSENT_VERSION,
        date: now,
      }));
    } catch {
      // Non-fatal — still allow through
    }
    setSaving(false);
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-base">CliniCals Hub</h2>
              <p className="text-blue-200 text-xs">by Swarnim · Pediatric Clinical Intelligence</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2">Clinical Use & Beta Testing Notice</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              CliniCals is an evidence-based clinical decision-support and educational platform currently undergoing active development and beta testing. Recommendations, AI-generated outputs, pathways, calculators, and clinical tools are intended to support—not replace—professional medical judgment, institutional protocols, or specialist consultation.
            </p>
            <p className="text-xs text-slate-600 leading-relaxed mt-2">
              By continuing, you acknowledge this information and agree to participate in platform improvement and beta testing.
            </p>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3 border-t border-slate-100 pt-4">
            <button
              onClick={() => setConsentAccepted(v => !v)}
              className="flex items-start gap-2.5 w-full text-left group"
            >
              <div className={`mt-0.5 flex-shrink-0 transition-colors ${consentAccepted ? "text-blue-600" : "text-slate-300"}`}>
                {consentAccepted
                  ? <CheckSquare className="w-4.5 h-4.5" />
                  : <Square className="w-4.5 h-4.5" />}
              </div>
              <span className="text-xs text-slate-700 leading-relaxed">
                I understand and agree to the above.
              </span>
            </button>

            <button
              onClick={() => setSummarySubscribed(v => !v)}
              className="flex items-start gap-2.5 w-full text-left group"
            >
              <div className={`mt-0.5 flex-shrink-0 transition-colors ${summarySubscribed ? "text-blue-600" : "text-slate-300"}`}>
                {summarySubscribed
                  ? <CheckSquare className="w-4.5 h-4.5" />
                  : <Square className="w-4.5 h-4.5" />}
              </div>
              <span className="text-xs text-slate-600 leading-relaxed">
                You may also receive educational updates and Daily Clinical Summaries, which can be disabled at any time.
              </span>
            </button>
          </div>

          {error && (
            <p className="text-xs text-red-600 font-medium">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5">
          <Button
            onClick={handleContinue}
            disabled={saving}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold h-10 gap-2"
          >
            {saving ? "Saving…" : <>Continue <ArrowRight className="w-4 h-4" /></>}
          </Button>
          <p className="text-center text-xs text-slate-400 mt-2">
            Preferences can be changed at any time in Settings → Notifications
          </p>
        </div>
      </div>
    </div>
  );
}