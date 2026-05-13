import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle, BookOpen, Loader2 } from "lucide-react";
import TeachingModuleViewer from "./TeachingModuleViewer";

/**
 * PathwayModuleList
 * Props:
 *   category: string — TeachingModule category to query
 *   items: Array<{ label: string, titleKeyword: string }>
 *     titleKeyword: substring to match in TeachingModule.title (case-insensitive)
 */
export default function PathwayModuleList({ category, items }) {
  const [viewingId, setViewingId] = useState(null);

  const { data: modules = [], isLoading } = useQuery({
    queryKey: ["TeachingModule", "category", category],
    queryFn: () => base44.entities.TeachingModule.filter({ "data.category": category }),
    staleTime: 5 * 60 * 1000,
  });

  // Build a lookup: keyword → module id
  function findModule(keyword) {
    const kw = keyword.toLowerCase();
    return modules.find(m => {
      const title = (m.data?.title || "").toLowerCase();
      return title.includes(kw);
    });
  }

  if (viewingId) {
    return <TeachingModuleViewer moduleId={viewingId} onBack={() => setViewingId(null)} />;
  }

  return (
    <div className="space-y-1">
      {isLoading && (
        <div className="flex items-center gap-2 px-2 py-2 text-xs text-slate-500">
          <Loader2 className="w-3 h-3 animate-spin" /> Loading modules…
        </div>
      )}
      {items.map((item, i) => {
        const mod = findModule(item.titleKeyword);
        const hasModule = !!mod;
        return (
          <div
            key={i}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors group ${
              hasModule
                ? "cursor-pointer hover:bg-blue-50"
                : "cursor-default opacity-60"
            }`}
            onClick={() => hasModule && setViewingId(mod.id)}
          >
            <ArrowRight className={`w-3 h-3 flex-shrink-0 ${hasModule ? "text-blue-500" : "text-slate-300"}`} />
            <div className="flex-1 min-w-0">
              <p className={`text-xs transition-colors ${hasModule ? "text-slate-700 group-hover:text-blue-700 font-medium" : "text-slate-500"}`}>
                {item.label}
              </p>
              {hasModule && mod.data?.title && mod.data.title !== item.label && (
                <p className="text-xs text-slate-400 truncate">{mod.data.title}</p>
              )}
            </div>
            {hasModule ? (
              <div className="flex items-center gap-1 shrink-0">
                <BookOpen className="w-3 h-3 text-blue-400" />
                <CheckCircle className="w-3 h-3 text-green-400" />
              </div>
            ) : (
              <Badge className="text-xs bg-slate-100 text-slate-400 px-1 py-0 shrink-0">Soon</Badge>
            )}
          </div>
        );
      })}
    </div>
  );
}