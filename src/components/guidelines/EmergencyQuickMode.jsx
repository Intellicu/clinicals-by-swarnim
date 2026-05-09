import React, { useState } from "react";
import { EMERGENCY_PROTOCOLS } from "@/lib/guidelines/index";
import { AlertTriangle, ChevronDown, ChevronUp, Zap, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const COLOR_MAP = {
  red:    { bg: "bg-red-600",    light: "bg-red-50",   border: "border-red-300",   text: "text-red-800",   badge: "bg-red-100 text-red-800" },
  orange: { bg: "bg-orange-500", light: "bg-orange-50", border: "border-orange-300", text: "text-orange-800", badge: "bg-orange-100 text-orange-800" },
  yellow: { bg: "bg-amber-500",  light: "bg-amber-50",  border: "border-amber-300",  text: "text-amber-800",  badge: "bg-amber-100 text-amber-800" },
};

function ProtocolSheet({ protocol, onClose }) {
  const c = COLOR_MAP[protocol.color] || COLOR_MAP.red;
  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex items-end justify-center" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-lg bg-white rounded-t-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        <div className={`${c.bg} px-4 py-4 flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{protocol.icon}</span>
            <div>
              <h2 className="font-bold text-white text-base leading-tight">{protocol.title}</h2>
              <p className="text-white/80 text-xs">{protocol.steps.length} steps · Emergency Protocol</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {protocol.steps.map((step, i) => (
            <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${c.light} border ${c.border}`}>
              <span className={`${c.bg} text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0`}>{i + 1}</span>
              <p className={`text-sm ${c.text} font-medium leading-relaxed`}>{step}</p>
            </div>
          ))}
        </div>
        <div className="p-4 border-t bg-slate-50">
          <p className="text-xs text-slate-500 text-center">Educational reference only · Apply clinical judgment · Not a substitute for senior supervision</p>
        </div>
      </div>
    </div>
  );
}

export default function EmergencyQuickMode() {
  const [active, setActive] = useState(null);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900">Emergency Protocols</p>
          <p className="text-xs text-slate-500">One-tap bedside access · Offline capable</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {EMERGENCY_PROTOCOLS.map(p => {
          const c = COLOR_MAP[p.color] || COLOR_MAP.red;
          return (
            <button
              key={p.id}
              onClick={() => setActive(p)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 ${c.border} ${c.light} hover:shadow-md transition-all active:scale-[0.98] text-left`}
            >
              <span className="text-xl flex-shrink-0">{p.icon}</span>
              <div className="flex-1 min-w-0">
                <p className={`font-bold text-sm ${c.text} leading-tight`}>{p.title}</p>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{p.steps[0]}</p>
              </div>
              <Badge className={`text-xs ${c.badge} border-0 flex-shrink-0`}>{p.steps.length} steps</Badge>
            </button>
          );
        })}
      </div>
      {active && <ProtocolSheet protocol={active} onClose={() => setActive(null)} />}
    </div>
  );
}