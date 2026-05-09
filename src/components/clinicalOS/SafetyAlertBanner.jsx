import React from "react";
import { AlertTriangle, XCircle, Info, ShieldAlert } from "lucide-react";

const SEVERITY_CONFIG = {
  CRITICAL: { bg: "bg-red-50 border-red-400", icon: XCircle, iconColor: "text-red-600", textColor: "text-red-900", label: "CRITICAL" },
  MAJOR:    { bg: "bg-orange-50 border-orange-400", icon: AlertTriangle, iconColor: "text-orange-600", textColor: "text-orange-900", label: "MAJOR" },
  MODERATE: { bg: "bg-amber-50 border-amber-300", icon: ShieldAlert, iconColor: "text-amber-600", textColor: "text-amber-900", label: "MODERATE" },
  INFO:     { bg: "bg-blue-50 border-blue-300", icon: Info, iconColor: "text-blue-600", textColor: "text-blue-900", label: "INFO" },
};

export default function SafetyAlertBanner({ alerts = [], onDismiss }) {
  if (!alerts.length) return null;

  return (
    <div className="space-y-2">
      {alerts.map((alert, i) => {
        const cfg = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.INFO;
        const Icon = cfg.icon;
        return (
          <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border-l-4 ${cfg.bg}`}>
            <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${cfg.iconColor}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`text-xs font-bold uppercase ${cfg.iconColor}`}>{cfg.label}</span>
                {alert.type && <span className="text-xs text-slate-500">{alert.type}</span>}
              </div>
              <p className={`text-sm font-medium leading-snug ${cfg.textColor}`}>
                {alert.alert || alert.effect || alert.action}
              </p>
              {alert.action && alert.alert && (
                <p className="text-xs text-slate-600 mt-1">{alert.action}</p>
              )}
            </div>
            {onDismiss && (
              <button onClick={() => onDismiss(i)} className="text-slate-400 hover:text-slate-600 flex-shrink-0">
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}