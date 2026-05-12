import React from "react";
import { Badge } from "@/components/ui/badge";

export default function HubSectionNav({ sections, activeId, onSelect }) {
  return (
    <div className="sticky top-14 z-20 bg-white/95 backdrop-blur-sm border-b border-slate-200 -mx-3 md:-mx-6 px-3 md:px-6 py-2 shadow-sm">
      <div className="flex overflow-x-auto gap-1 pb-1 scrollbar-none">
        {sections.map(s => {
          const Icon = s.icon;
          const active = activeId === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium flex-shrink-0 transition-all whitespace-nowrap ${
                active
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              <span>{s.label}</span>
              {s.badge && (
                <Badge className={`text-xs ml-1 ${active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                  {s.badge}
                </Badge>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}