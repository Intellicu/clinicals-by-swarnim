import React, { useState } from "react";
import { AlertTriangle, X, ChevronDown, ChevronUp } from "lucide-react";

export default function BetaDisclaimer() {
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem("beta_disclaimer_dismissed") === "1"; } catch { return false; }
  });
  const [expanded, setExpanded] = useState(false);

  if (dismissed) {
    return (
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-2 px-3 py-1.5 bg-amber-50 border-b border-amber-200 text-xs text-amber-700 hover:bg-amber-100 transition-colors"
      >
        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="font-semibold">BETA — Clinical Decision Support Tool · Not a substitute for medical judgment</span>
        {expanded ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
      </button>
    );
  }

  return (
    <div className="bg-amber-50 border-b-2 border-amber-400 px-4 py-3">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-900">
                ⚠️ BETA VERSION — Clinical Decision Support Tool Only
              </p>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                CliniCals Hub is a <strong>beta-stage educational and clinical reference tool</strong>. All content — including drug doses, protocols, diagnostic algorithms, and clinical pathways — is for <strong>informational and educational purposes only</strong>. It does <strong>NOT</strong> constitute medical advice, replace clinical judgment, or supersede institutional protocols.
              </p>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                <strong>Always verify</strong> doses, protocols, and recommendations with current institutional guidelines, a qualified clinician, and appropriate specialist input before clinical use.
                The developers and contributors <strong>accept no liability</strong> for clinical decisions made based on this tool. By using this application, you agree to these terms.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              try { localStorage.setItem("beta_disclaimer_dismissed", "1"); } catch {}
              setDismissed(true);
            }}
            className="p-1.5 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-800 flex-shrink-0 transition-colors"
            title="Dismiss (will show as compact banner)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-amber-600 mt-2 italic">
          Tap × to minimise · Content reviewed regularly but may not reflect most recent guideline updates.
        </p>
      </div>
    </div>
  );
}