import React, { useState } from "react";
import { Settings2, Check, X, RotateCcw } from "lucide-react";

const STORAGE_KEY = "hub_hidden_sections";

export function useHubSectionVisibility(allSectionTitles) {
  const [hiddenSections, setHiddenSections] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  const toggle = (title) => {
    setHiddenSections((prev) => {
      const next = prev.includes(title)
        ? prev.filter((t) => t !== title)
        : [...prev, title];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const reset = () => {
    setHiddenSections([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const isVisible = (title) => !hiddenSections.includes(title);

  return { hiddenSections, toggle, reset, isVisible };
}

export default function HubSectionCustomizer({ allSectionTitles, hiddenSections, onToggle, onReset }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      {/* Trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-semibold transition-colors border ${
          open
            ? "bg-indigo-600 text-white border-indigo-600"
            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
        }`}
      >
        <Settings2 className="w-3.5 h-3.5" />
        Customise Hub
        {hiddenSections.length > 0 && (
          <span className="bg-amber-400 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center leading-none">
            {hiddenSections.length}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="mt-2 bg-white border border-indigo-200 rounded-xl p-3 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-700">
              Show / Hide Knowledge Base Sections
            </p>
            <div className="flex items-center gap-2">
              {hiddenSections.length > 0 && (
                <button
                  onClick={onReset}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {allSectionTitles.map((title) => {
              const isVisible = !hiddenSections.includes(title);
              return (
                <button
                  key={title}
                  onClick={() => onToggle(title)}
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-left text-xs transition-all ${
                    isVisible
                      ? "border-green-300 bg-green-50 text-green-800"
                      : "border-slate-200 bg-slate-50 text-slate-400 line-through"
                  }`}
                >
                  {isVisible ? (
                    <Check className="w-3 h-3 text-green-600 flex-shrink-0" />
                  ) : (
                    <X className="w-3 h-3 text-slate-300 flex-shrink-0" />
                  )}
                  <span className="leading-tight line-clamp-2">{title}</span>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-slate-400">
            {hiddenSections.length === 0
              ? "All sections visible"
              : `${hiddenSections.length} section(s) hidden`}
          </p>
        </div>
      )}
    </div>
  );
}