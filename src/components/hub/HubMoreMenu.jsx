import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  MoreHorizontal, Sparkles, FlaskConical, BookOpen, BarChart2,
  MessageSquare, Settings, Info, X, Mic, Video, Brain,
  ClipboardList, FileText, Bell, ChevronRight
} from "lucide-react";

const MENU_ITEMS = [
  {
    group: "AI Tools",
    items: [
      { label: "AI Assistant", icon: Sparkles, page: "AIAssistant", color: "text-violet-600" },
      { label: "AI Agents Hub", icon: Brain, page: "AIAgentsHub", color: "text-purple-600" },
      { label: "Voice Agent", icon: Mic, page: "VoiceAgent", color: "text-blue-600" },
      { label: "Video Teaching", icon: Video, page: "VideoTeachingAgent", color: "text-pink-600" },
    ]
  },
  {
    group: "Research",
    items: [
      { label: "Research Hub", icon: FlaskConical, page: "ResearchHub", color: "text-teal-600" },
      { label: "Research OS", icon: BarChart2, page: "ResearchOS", color: "text-slate-600" },
      { label: "Research Methods", icon: ClipboardList, page: "ResearchMethodsHub", color: "text-green-600" },
    ]
  },
  {
    group: "Platform",
    items: [
      { label: "Daily Summary", icon: FileText, page: "DailySummary", color: "text-amber-600" },
      { label: "Notifications", icon: Bell, page: "NotificationCenter", color: "text-orange-600" },
      { label: "About", icon: Info, page: "About", color: "text-slate-500" },
    ]
  },
];

export default function HubMoreMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center justify-center w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg border border-white/30 transition-colors"
        aria-label="More tools"
      >
        {open ? <X className="w-4 h-4 text-white" /> : <MoreHorizontal className="w-4 h-4 text-white" />}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-violet-50 to-blue-50 border-b border-slate-100">
            <p className="text-xs font-bold text-slate-700">More Tools & Features</p>
          </div>
          <div className="divide-y divide-slate-100 max-h-[70vh] overflow-y-auto">
            {MENU_ITEMS.map(group => (
              <div key={group.group} className="px-2 py-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1">{group.group}</p>
                {group.items.map(item => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.label} to={createPageUrl(item.page)} onClick={() => setOpen(false)}>
                      <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                        <Icon className={`w-4 h-4 flex-shrink-0 ${item.color}`} />
                        <span className="text-sm text-slate-700 group-hover:text-slate-900 flex-1">{item.label}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}