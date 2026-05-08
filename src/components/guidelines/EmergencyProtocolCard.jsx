import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Zap } from "lucide-react";
import { EMERGENCY_PROTOCOLS } from "@/lib/guidelines/index";

export default function EmergencyProtocolCard() {
  const [activeId, setActiveId] = useState(null);

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center gap-2 mb-2">
        <Zap className="w-4 h-4 text-red-600" />
        <h3 className="font-bold text-sm text-slate-800">Emergency Quick Protocols</h3>
        <Badge className="bg-red-100 text-red-700 text-xs border-0 ml-auto">Bedside</Badge>
      </div>
      {EMERGENCY_PROTOCOLS.map((p) => {
        const isOpen = activeId === p.id;
        const isRed = p.color === "red";
        const headerCls = isRed ? "bg-red-600" : "bg-orange-500";
        const borderCls = isRed ? "border-red-300 bg-red-50" : "border-orange-300 bg-orange-50";
        return (
          <div key={p.id} className={`rounded-xl border-2 overflow-hidden ${borderCls}`}>
            <button
              className={`w-full flex items-center justify-between p-3 font-semibold text-sm text-white ${headerCls}`}
              onClick={() => setActiveId(isOpen ? null : p.id)}
            >
              <span className="flex items-center gap-2 text-left">
                <span>{p.icon}</span><span>{p.title}</span>
              </span>
              {isOpen ? <ChevronUp className="w-4 h-4 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 flex-shrink-0" />}
            </button>
            {isOpen && (
              <div className="p-3">
                <ol className="space-y-2">
                  {p.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-800">
                      <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center font-bold text-white text-xs ${isRed ? "bg-red-500" : "bg-orange-500"}`}>
                        {i + 1}
                      </span>
                      <span className="leading-relaxed pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}