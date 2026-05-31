/**
 * Shared shell for all LEILA-style clinical reasoning engines.
 * Provides: step navigation, pathway-followed trail, differential table,
 * reasoning explanation, and actionable output.
 */
import React from "react";
import { CheckCircle2, ArrowRight, AlertTriangle, RotateCcw, ChevronRight, BookOpen, FlaskConical, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// ── Risk Badge ────────────────────────────────────────────────────────────────
export function RiskBadge({ level }) {
  const cfg = {
    green:  { label: "Low Risk",      cls: "bg-green-100 text-green-800 border-green-300" },
    yellow: { label: "Moderate Risk", cls: "bg-yellow-100 text-yellow-800 border-yellow-300" },
    orange: { label: "High Risk",     cls: "bg-orange-100 text-orange-800 border-orange-300" },
    red:    { label: "Critical",      cls: "bg-red-100 text-red-800 border-red-300" },
  };
  const c = cfg[level] || cfg.yellow;
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${c.cls}`}>{c.label}</span>;
}

// ── Pathway Trail ─────────────────────────────────────────────────────────────
export function PathwayTrail({ steps }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pathway Followed</p>
      <div className="flex flex-wrap items-center gap-1">
        {steps.map((s, i) => (
          <React.Fragment key={i}>
            <span className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg px-2 py-0.5">{s}</span>
            {i < steps.length - 1 && <ChevronRight className="w-3 h-3 text-slate-400 flex-shrink-0" />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ── Differential Table ────────────────────────────────────────────────────────
export function DifferentialTable({ rows }) {
  const pctColor = (pct) => {
    if (pct >= 70) return "text-red-700 font-bold";
    if (pct >= 40) return "text-orange-700 font-semibold";
    if (pct >= 20) return "text-amber-700";
    return "text-slate-500";
  };
  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden">
      <div className="bg-slate-100 px-3 py-1.5 flex items-center gap-1.5">
        <FlaskConical className="w-3.5 h-3.5 text-slate-600" />
        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Differential Diagnoses</span>
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="text-left text-xs font-semibold text-slate-500 px-3 py-1.5">Diagnosis</th>
            <th className="text-right text-xs font-semibold text-slate-500 px-3 py-1.5">Likelihood</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={`border-b border-slate-50 ${i === 0 ? "bg-blue-50" : ""}`}>
              <td className="px-3 py-1.5 text-xs text-slate-800">{r.dx}</td>
              <td className={`px-3 py-1.5 text-right text-xs ${pctColor(r.pct)}`}>
                <div className="flex items-center justify-end gap-1.5">
                  <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div className={`h-full rounded-full ${r.pct >= 70 ? "bg-red-500" : r.pct >= 40 ? "bg-orange-500" : "bg-amber-400"}`}
                      style={{ width: `${r.pct}%` }} />
                  </div>
                  {r.label || (r.pct >= 70 ? "High" : r.pct >= 40 ? "Moderate" : r.pct >= 20 ? "Low" : "Unlikely")}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Investigation Recommendations ─────────────────────────────────────────────
export function InvestigationPanel({ mustOrder = [], shouldOrder = [], advanced = [] }) {
  const Section = ({ label, color, items }) => items.length === 0 ? null : (
    <div>
      <p className={`text-xs font-bold mb-1 ${color}`}>{label}</p>
      {items.map((inv, i) => (
        <div key={i} className="flex items-start gap-1.5 text-xs text-slate-700 mb-0.5">
          <ArrowRight className="w-3 h-3 text-blue-400 flex-shrink-0 mt-0.5" />{inv}
        </div>
      ))}
    </div>
  );
  return (
    <div className="rounded-xl border border-slate-200 p-3 space-y-2.5">
      <div className="flex items-center gap-1.5">
        <FlaskConical className="w-3.5 h-3.5 text-blue-600" />
        <p className="text-xs font-bold text-slate-700">Recommended Investigations</p>
      </div>
      <Section label="▶ Must Order" color="text-red-700" items={mustOrder} />
      <Section label="◆ Should Order" color="text-orange-700" items={shouldOrder} />
      <Section label="◇ Advanced / Specialist" color="text-violet-700" items={advanced} />
    </div>
  );
}

// ── Monitoring Plan ────────────────────────────────────────────────────────────
export function MonitoringPanel({ items }) {
  return (
    <div className="rounded-xl border border-green-200 bg-green-50 p-3">
      <div className="flex items-center gap-1.5 mb-2">
        <Calendar className="w-3.5 h-3.5 text-green-700" />
        <p className="text-xs font-bold text-green-800">Follow-up & Monitoring Plan</p>
      </div>
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-1.5 text-xs text-green-900 mb-0.5">
          <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />{item}
        </div>
      ))}
    </div>
  );
}

// ── Guideline Source ───────────────────────────────────────────────────────────
export function GuidelineSource({ text }) {
  return (
    <div className="flex items-start gap-1.5 bg-blue-50 border border-blue-200 rounded-lg p-2.5">
      <BookOpen className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
      <p className="text-xs text-blue-800">{text}</p>
    </div>
  );
}

// ── Emergency Banner ───────────────────────────────────────────────────────────
export function EmergencyBanner({ text }) {
  return (
    <div className="flex items-center gap-2 bg-red-600 text-white rounded-xl p-3">
      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
      <p className="text-xs font-bold">{text}</p>
    </div>
  );
}

// ── Yes/No Question Card ──────────────────────────────────────────────────────
export function QuestionCard({ question, detail, onYes, onNo, yesLabel = "Yes", noLabel = "No", color = "blue" }) {
  const btnBase = "flex-1 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95";
  const colors = {
    blue:   { yes: "bg-blue-600 hover:bg-blue-700 text-white", no: "bg-slate-100 hover:bg-slate-200 text-slate-700" },
    red:    { yes: "bg-red-600 hover:bg-red-700 text-white",   no: "bg-slate-100 hover:bg-slate-200 text-slate-700" },
    violet: { yes: "bg-violet-600 hover:bg-violet-700 text-white", no: "bg-slate-100 hover:bg-slate-200 text-slate-700" },
    amber:  { yes: "bg-amber-600 hover:bg-amber-700 text-white",   no: "bg-slate-100 hover:bg-slate-200 text-slate-700" },
  };
  const c = colors[color] || colors.blue;
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="p-4 space-y-3">
        <p className="text-sm font-semibold text-slate-800 leading-relaxed">{question}</p>
        {detail && <p className="text-xs text-slate-500 italic">{detail}</p>}
        <div className="flex gap-2">
          <button onClick={onYes} className={`${btnBase} ${c.yes}`}>{yesLabel}</button>
          <button onClick={onNo} className={`${btnBase} ${c.no}`}>{noLabel}</button>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Multi-option Question Card ────────────────────────────────────────────────
export function MultiChoiceCard({ question, detail, options, color = "blue" }) {
  const btnColors = {
    blue:   "bg-blue-600 hover:bg-blue-700 text-white",
    red:    "bg-red-600 hover:bg-red-700 text-white",
    violet: "bg-violet-600 hover:bg-violet-700 text-white",
    amber:  "bg-amber-600 hover:bg-amber-700 text-white",
    green:  "bg-green-600 hover:bg-green-700 text-white",
  };
  const c = btnColors[color] || btnColors.blue;
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="p-4 space-y-3">
        <p className="text-sm font-semibold text-slate-800 leading-relaxed">{question}</p>
        {detail && <p className="text-xs text-slate-500 italic">{detail}</p>}
        <div className="flex flex-col gap-2">
          {options.map((opt, i) => (
            <button key={i} onClick={opt.onSelect}
              className={`w-full py-2.5 px-3 rounded-xl text-sm font-semibold transition-all active:scale-95 text-left ${c}`}>
              {opt.label}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Engine Header ─────────────────────────────────────────────────────────────
export function EngineHeader({ title, subtitle, color = "blue", icon: Icon, onReset, step, totalSteps }) {
  const bg = {
    blue:   "from-blue-800 to-indigo-700",
    red:    "from-red-800 to-rose-700",
    violet: "from-violet-800 to-purple-700",
    amber:  "from-amber-700 to-orange-600",
    green:  "from-green-700 to-teal-600",
    cyan:   "from-cyan-700 to-blue-700",
  };
  return (
    <div className={`rounded-xl bg-gradient-to-r ${bg[color] || bg.blue} p-4 text-white`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-bold">{title}</h3>
          <p className="text-xs opacity-80 mt-0.5">{subtitle}</p>
          {step !== undefined && <p className="text-xs opacity-60 mt-1">Step {step} of {totalSteps}</p>}
        </div>
        {onReset && (
          <button onClick={onReset}
            className="flex items-center gap-1 text-xs bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-full border border-white/20 transition-colors flex-shrink-0">
            <RotateCcw className="w-3 h-3" /> Restart
          </button>
        )}
      </div>
    </div>
  );
}

// ── Result Output Box ─────────────────────────────────────────────────────────
export function ResultHeader({ diagnosis, risk, urgent }) {
  const riskColors = {
    green:  "border-green-400 bg-green-50",
    yellow: "border-yellow-400 bg-yellow-50",
    orange: "border-orange-400 bg-orange-50",
    red:    "border-red-500 bg-red-50",
  };
  return (
    <div className={`rounded-xl border-2 p-4 ${riskColors[risk] || riskColors.yellow}`}>
      {urgent && (
        <div className="flex items-center gap-1.5 mb-2">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <span className="text-xs font-bold text-red-700 uppercase tracking-wider">URGENT ACTION REQUIRED</span>
        </div>
      )}
      <p className="text-base font-black text-slate-900">→ {diagnosis}</p>
    </div>
  );
}

// ── Why This Diagnosis? ───────────────────────────────────────────────────────
export function ReasoningPanel({ reasons }) {
  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 space-y-1.5">
      <p className="text-xs font-bold text-blue-800">Why this diagnosis?</p>
      {reasons.map((r, i) => (
        <div key={i} className="flex items-start gap-1.5 text-xs text-blue-900">
          <CheckCircle2 className="w-3 h-3 text-blue-500 flex-shrink-0 mt-0.5" />{r}
        </div>
      ))}
    </div>
  );
}

// ── Treatment Box ─────────────────────────────────────────────────────────────
export function TreatmentPanel({ items, title = "Treatment Plan" }) {
  return (
    <div className="rounded-xl border border-slate-200 p-3 space-y-1.5">
      <p className="text-xs font-bold text-slate-700">{title}</p>
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-1.5 text-xs text-slate-800">
          <span className="text-green-500 font-bold flex-shrink-0">✓</span>{item}
        </div>
      ))}
    </div>
  );
}