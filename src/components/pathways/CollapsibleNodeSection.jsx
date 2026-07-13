/**
 * CollapsibleNodeSection — collapsible detail section inside a pathway step
 * (investigations, monitoring, supportive care). Collapsed by default so the
 * clinician can focus on the core decision during consultations.
 */
import React from "react";
import { ChevronDown } from "lucide-react";

const TONES = {
  blue: { wrap: "bg-blue-50/50 border-blue-200", icon: "text-blue-600", title: "text-blue-800", badge: "bg-blue-100 text-blue-700" },
  indigo: { wrap: "bg-indigo-50/50 border-indigo-200", icon: "text-indigo-600", title: "text-indigo-800", badge: "bg-indigo-100 text-indigo-700" },
  teal: { wrap: "bg-teal-50/50 border-teal-200", icon: "text-teal-600", title: "text-teal-800", badge: "bg-teal-100 text-teal-700" },
};

export default function CollapsibleNodeSection({ icon: Icon, title, count, tone = "blue", defaultOpen = false, children }) {
  const t = TONES[tone] || TONES.blue;
  return (
    <details open={defaultOpen} className={`mt-3 border rounded-xl group ${t.wrap}`}>
      <summary className="flex items-center gap-1.5 px-3 py-2.5 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden">
        {Icon && <Icon className={`w-4 h-4 ${t.icon}`} />}
        <span className={`text-sm font-bold ${t.title}`}>{title}</span>
        {count > 0 && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${t.badge}`}>{count}</span>}
        <ChevronDown className={`w-4 h-4 ml-auto ${t.icon} transition-transform group-open:rotate-180`} />
      </summary>
      <div className="px-3 pb-3">{children}</div>
    </details>
  );
}